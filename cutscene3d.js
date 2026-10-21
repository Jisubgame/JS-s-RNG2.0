/* =========================================================
   🎬 3D 컷씬 (cutscene3d.js)

   솔스 RNG 흐름을 따름:
     암전 → 가운데에서 별(박스 빔)이 생겨 점점 빠르게 돌며 커짐
     → 빛 조각이 사방에서 빨려 들어오고, 바닥에서 빛기둥이 솟음
     → 터지기 직전 한 점으로 수축 → 하얀 섬광(+화면 깨짐) → 캐릭터와 아우라 공개
   등급마다 별 모양이 다르고 (MYTHIC 네모별 / ANCIENT 팔각별 / ABSOLUTE 겹팔각 / JXS 깨진 별),
   칭호마다 motif 로 개성을 얹음 (성검이 내려옴, 유령이 다가옴, 번개가 내리침 ...).

   시간은 script.js 가 넘겨주는 getTime() (사운드와 같은 시계) 기준.
   cfg = { tier, hit, hit2?, total }
     hit  : 첫 번째로 터지는 시간 (사운드의 쾅)
     hit2 : JXS만. 두 번째 클라이맥스. hit~hit2 동안은 각성 직전 단계
   ========================================================= */

import { buildLocomotive } from './auraSignatures.js?v=61';

export function createCutscene(ctx) {
    const { THREE, scene, camera, dummy, floor, stars, kit, bloom, stageApi } = ctx;
    const { BOX, glowMat, square, rand, bolt, sword, ghost } = kit;

    const root = new THREE.Group();
    scene.add(root);

    const ease = {
        in: k => k * k * k,
        out: k => 1 - Math.pow(1 - k, 3),
        inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
    };
    const clamp01 = k => Math.max(0, Math.min(1, k));

    /* ---------- 별 만들기 (등급별) ---------- */
    function beam(len, w, color, op = 1) {
        const m = new THREE.Mesh(BOX, glowMat(color, op));
        m.scale.set(len, w, w * 0.5);
        return m;
    }
    function buildStar(tier, colors) {
        const g = new THREE.Group();
        const c0 = colors[0], c1 = colors[1 % colors.length], white = new THREE.Color('#ffffff');
        const core = new THREE.Mesh(BOX, glowMat(white, 1));
        core.scale.setScalar(0.32);
        core.rotation.z = Math.PI / 4;
        g.add(core);
        const layers = [];
        const addOcta = (len, w, color, rot = 0) => {
            const l = new THREE.Group();
            for (let i = 0; i < 4; i++) { const b = beam(len * (i % 2 ? 0.78 : 1), w, color); b.rotation.z = (i * Math.PI) / 4; l.add(b); }
            const r1 = square(len * 0.38, w * 0.6, glowMat(color, 0.9)); r1.rotation.x = Math.PI / 2;
            const r2 = square(len * 0.38, w * 0.6, glowMat(color, 0.9)); r2.rotation.x = Math.PI / 2; r2.rotation.y = Math.PI / 4;
            l.add(r1, r2);
            l.rotation.z = rot;
            g.add(l); layers.push(l);
            return l;
        };
        if (tier === 'MYTHIC') {
            // 솔스의 네모 별: 십자 빔 + 짧은 대각 빔 + 45도 돌린 네모
            const l = new THREE.Group();
            const h = beam(3.4, 0.14, c0), v = beam(3.4, 0.14, c0);
            v.rotation.z = Math.PI / 2;
            l.add(h, v);
            const d1 = beam(1.6, 0.08, c1); d1.rotation.z = Math.PI / 4;
            const d2 = beam(1.6, 0.08, c1); d2.rotation.z = -Math.PI / 4;
            const sq = square(0.9, 0.06, glowMat(c1, 1)); sq.rotation.x = Math.PI / 2; sq.rotation.y = Math.PI / 4;
            l.add(d1, d2, sq);
            g.add(l); layers.push(l);
        } else if (tier === 'ANCIENT') {
            addOcta(4.2, 0.16, c0);
        } else if (tier === 'ABSOLUTE') {
            addOcta(4.4, 0.16, c0);
            addOcta(6.2, 0.06, c1, Math.PI / 8);
            const ring = new THREE.Group();
            for (let i = 0; i < 16; i++) {
                const c = new THREE.Mesh(BOX, glowMat(i % 2 ? c0 : c1, 1));
                const a = (i / 16) * Math.PI * 2;
                c.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
                c.scale.setScalar(0.16);
                c.rotation.z = a + Math.PI / 4;
                ring.add(c);
            }
            g.add(ring); layers.push(ring);
        } else {
            // JXS: 색이 다른 세 겹의 별이 서로 어긋나며 떨림
            addOcta(4.6, 0.18, c0);
            addOcta(5.6, 0.07, c1, Math.PI / 8);
            addOcta(7.2, 0.04, colors[2 % colors.length] || white, Math.PI / 16);
        }
        return { g, core, layers };
    }

    /* ---------- 사방에서 빨려 들어오는 빛 조각 ---------- */
    function buildStreaks(colors, n) {
        const mesh = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.9), n);
        const data = [];
        for (let i = 0; i < n; i++) {
            const dir = new THREE.Vector3(rand(-1, 1), rand(-0.7, 0.9), rand(-1, 0.35)).normalize();
            data.push({ dir, d: rand(3, 16), v: rand(0.7, 1.3) });
            mesh.setColorAt(i, colors[i % colors.length].clone().lerp(new THREE.Color('#ffffff'), rand(0, 0.5)));
        }
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1);
        return {
            mesh,
            update(dt, speedK, center) {
                data.forEach((s, i) => {
                    s.d -= dt * s.v * (3 + speedK * 22);
                    if (s.d < 0.4) { s.d = rand(10, 16); s.dir.set(rand(-1, 1), rand(-0.7, 0.9), rand(-1, 0.35)).normalize(); }
                    p.copy(s.dir).multiplyScalar(s.d).add(center);
                    q.setFromUnitVectors(Z, s.dir);
                    const len = 0.3 + speedK * 2.4;
                    sc.set(0.05, 0.05, len * Math.min(1, s.d / 3));
                    mesh.setMatrixAt(i, m4.compose(p, q, sc));
                });
                mesh.instanceMatrix.needsUpdate = true;
            }
        };
    }

    /* ---------- 바닥에서 솟는 빛기둥 (ANCIENT 이상) ---------- */
    function buildFloorLight(colors, n) {
        const g = new THREE.Group();
        const cols = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + rand(-0.15, 0.15), r = rand(3, 6.5);
            const m = new THREE.Mesh(BOX, glowMat(colors[i % colors.length], 0.7));
            m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 1);
            m.userData = { delay: rand(0, 0.35), w: rand(0.06, 0.16) };
            g.add(m); cols.push(m);
        }
        return {
            g,
            update(k) {   // k: 0~1 솟아오른 정도
                cols.forEach(m => {
                    const kk = clamp01((k - m.userData.delay) / (1 - m.userData.delay));
                    const h = 0.01 + ease.out(kk) * 14;
                    m.scale.set(m.userData.w, h, m.userData.w);
                    m.position.y = -2 + h / 2;
                    m.visible = kk > 0;
                });
            }
        };
    }

    /* =========================================================
       칭호별 개성 (motif)
       update(time, phase, k, dt)  phase: 'build' | 'phase2' | 'reveal'
       ========================================================= */
    const MOTIFS = {

        // 🐺 만월의 늑대: 별 뒤로 보름달이 차오르고, 늑대 그림자들이 사방에서 달려와 별을 에워쌈
        moonWolf({ g, colors }) {
            const moon = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshBasicMaterial({ color: 0xeef4ff, toneMapped: false, transparent: true, opacity: 0 }));
            moon.position.set(0, 4, -12); g.add(moon);
            const m = glowMat(colors[0], 0.6);
            const wolves = Array.from({ length: 8 }, (_, i) => {
                const w = new THREE.Group(); g.add(w);
                const part = (sx, sy, sz, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(sx, sy, sz); b.position.set(x, y, z); w.add(b); };
                part(1.2, 1, 2.6, 0, 1.2, 0); part(0.9, 0.9, 1, 0, 1.7, 1.6); part(0.25, 0.45, 0.2, 0.3, 2.3, 1.5); part(0.25, 0.45, 0.2, -0.3, 2.3, 1.5); part(0.35, 0.35, 1.2, 0, 1.5, -1.7);
                return { w, a: (i / 8) * Math.PI * 2 };
            });
            return {
                bloom: 0.6,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    moon.material.opacity = Math.min(0.9, k * 1.4);
                    moon.scale.setScalar(0.4 + ease.out(clamp01(k / 0.6)) * 0.6);
                    const r = THREE.MathUtils.lerp(26, 7, ease.inOut(clamp01(k / 0.9)));
                    wolves.forEach(({ w, a }, i) => { const aa = a + time * 0.6; w.position.set(Math.cos(aa) * r, Math.abs(Math.sin(time * 8 + i)) * 0.4, Math.sin(aa) * r * 0.6 - 3); w.lookAt(0, 0, -3); });
                }
            };
        },

        // 🏜 파라오: 별 아래로 피라미드가 솟아오르고 꼭대기의 금 캡스톤이 별과 맞닿음
        pharaoh({ g, colors }) {
            const sand = new THREE.MeshStandardMaterial({ color: 0xd9a95a, roughness: 0.9, flatShading: true });
            const gold = new THREE.MeshStandardMaterial({ color: 0xffc94d, metalness: 0.8, roughness: 0.25, emissive: 0x6a4a00, emissiveIntensity: 0.8 });
            const pyr = new THREE.Group(); pyr.position.set(0, -14, -6); g.add(pyr);
            const n = 10;
            for (let i = 0; i < n; i++) { const m = new THREE.Mesh(BOX, sand); m.scale.set((n - i) * 2, 1.4, (n - i) * 2); m.position.y = i * 1.4; pyr.add(m); }
            const cap = new THREE.Mesh(BOX, gold); cap.scale.set(1.6, 1.4, 1.6); cap.position.y = n * 1.4; pyr.add(cap);
            const rays = new THREE.Group(); rays.position.y = n * 1.4 + 0.7; pyr.add(rays);
            for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(BOX, glowMat(colors[0], 0.35)); r.scale.set(0.3, 14, 0.1); r.position.y = 7; const pv = new THREE.Group(); pv.rotation.z = (i / 8) * Math.PI * 2; pv.add(r); rays.add(pv); }
            return {
                bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    pyr.position.y = THREE.MathUtils.lerp(-22, -12.5, ease.out(clamp01(k / 0.7)));
                    rays.rotation.z = time * 0.3;
                    rays.scale.setScalar(0.2 + clamp01((k - 0.6) / 0.4) * 1);
                }
            };
        },

        // 🪞 거울 세계: 별을 둘러싼 거울 판들이 다가오며 별을 수십 개로 비추다가 터지기 직전 산산조각
        mirror({ g, colors }) {
            const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, metalness: 1, roughness: 0.05, emissive: colors[0], emissiveIntensity: 0.3 });
            const panes = [];
            for (let i = 0; i < 10; i++) {
                const p = new THREE.Group();
                const m = new THREE.Mesh(BOX, glass); m.scale.set(3, 4.4, 0.08); p.add(m);
                const fr = square(3.6, 0.12, glowMat(colors[0], 0.9)); fr.rotation.x = Math.PI / 2; fr.scale.set(1, 1, 1.3); p.add(fr);
                g.add(p); panes.push({ p, a: (i / 10) * Math.PI * 2 });
            }
            const shards = [];
            for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(BOX, glass); m.scale.set(0.5, 0.8, 0.05); m.visible = false; g.add(m); shards.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20) }); }
            return {
                bloom: 0.6,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const broke = k > 0.9, bk = clamp01((k - 0.9) / 0.1);
                    const r = THREE.MathUtils.lerp(16, 7, ease.inOut(clamp01(k / 0.85)));
                    panes.forEach(({ p, a }, i) => { const aa = a + time * 0.4; p.visible = !broke; p.position.set(Math.cos(aa) * r, 3.5 + Math.sin(aa * 2) * 1.5, Math.sin(aa) * r * 0.6 - 3); p.lookAt(0, 3.5, -3); });
                    shards.forEach(({ m, v }, i) => { m.visible = broke; if (!broke) return; const pp = panes[i % panes.length].p.position; m.position.set(pp.x + v.x * bk, pp.y + v.y * bk, pp.z + v.z * bk); m.rotation.set(time * 5 + i, time * 3, 0); });
                }
            };
        },

        // 🌳 세계수: 별이 씨앗이 되어 아래에서 줄기가 자라 올라오고, 가지와 잎이 하늘을 덮음
        worldTree({ g, colors }) {
            const bark = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.95, flatShading: true });
            const leaf = new THREE.MeshStandardMaterial({ color: colors[0], emissive: colors[0], emissiveIntensity: 0.6, flatShading: true });
            const trunk = [], leaves = [];
            for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(BOX, bark); const w = 3.6 - i * 0.18; m.scale.set(w, 1.6, w); m.position.set(Math.sin(i * 0.5) * 0.4, -10 + i * 1.3, -6); m.rotation.y = i * 0.15; g.add(m); trunk.push(m); }
            for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 12; const m = new THREE.Mesh(BOX, leaf); m.scale.setScalar(1.4 + Math.random() * 1.6); m.userData.home = new THREE.Vector3(Math.cos(a) * r, 8 + Math.random() * 6 - r * 0.2, Math.sin(a) * r * 0.5 - 6); g.add(m); leaves.push(m); }
            return {
                bloom: 0.65,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    trunk.forEach((m, i) => { const kk = clamp01(k * 2.2 - i / 14); m.visible = kk > 0; m.scale.y = 1.6 * kk; });
                    leaves.forEach((m, i) => { const kk = ease.out(clamp01((k - 0.45 - i * 0.008) / 0.35)); m.visible = kk > 0; m.position.copy(m.userData.home).multiplyScalar(kk); m.position.y = THREE.MathUtils.lerp(4, m.userData.home.y, kk); m.rotation.set(time * 0.3 + i, time * 0.2, 0); });
                }
            };
        },

        // 🐉 용왕: 사방에서 용이 몸을 휘감으며 별을 조여 들고, 터지기 직전 머리가 별 앞에서 포효
        dragonKing({ g, colors }) {
            const jade = new THREE.MeshStandardMaterial({ color: 0x1fae8a, metalness: 0.5, roughness: 0.3, emissive: 0x0a4a3a, emissiveIntensity: 0.8 });
            const gold = new THREE.MeshStandardMaterial({ color: 0xffc94d, emissive: 0x7a5a00, emissiveIntensity: 0.6 });
            const N = 50, segs = [];
            for (let i = 0; i < N; i++) { const m = new THREE.Mesh(BOX, i % 4 ? jade : gold); const s = 1.1 * (1 - i / N * 0.6); m.scale.set(s, s, 1.3); g.add(m); segs.push(m); }
            const head = new THREE.Mesh(BOX, jade); head.scale.set(1.6, 1.3, 2.0); g.add(head);
            const eyes = new THREE.Mesh(BOX, glowMat(0xffe14d, 1)); eyes.scale.set(2.4, 0.3, 0.2); head.add(eyes); eyes.position.set(0, 0.15, 0.5); eyes.scale.set(1.1, 0.17, 0.1);
            const tmp = new THREE.Vector3(), nxt = new THREE.Vector3();
            const at = (u, time, k, out) => { const a = time * 1.2 - u * 7; const r = THREE.MathUtils.lerp(14, 4.5, ease.inOut(k)) + u * 4; return out.set(Math.cos(a) * r, 3.5 + Math.sin(a * 0.7 + u * 3) * 3 * (1 - k * 0.5), Math.sin(a) * r * 0.5 - 3); };
            return {
                bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    segs.forEach((m, i) => { const u = (i + 1) / N; at(u, time, k, tmp); at(u + 0.01, time, k, nxt); m.position.copy(tmp); m.lookAt(nxt); });
                    at(0, time, k, tmp); at(-0.02, time, k, nxt); head.position.copy(tmp); head.lookAt(nxt);
                }
            };
        },

        // ⏱ 시간 정지: 별 뒤에 거대한 시계가 떠오르고, 바늘이 점점 빨라지다 터지는 순간 딱 멈춤
        timeStop({ g, colors }) {
            const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.85, roughness: 0.3, emissive: 0x3a2a00, emissiveIntensity: 0.6 });
            const clock = new THREE.Group(); clock.position.set(0, 3.5, -8); g.add(clock);
            const rim = square(16, 0.5, brass); rim.rotation.x = Math.PI / 2; clock.add(rim);
            for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const m = new THREE.Mesh(BOX, i % 3 ? brass : glowMat(colors[0], 1)); m.scale.set(0.4, 1.4, 0.2); m.position.set(Math.sin(a) * 6.8, Math.cos(a) * 6.8, 0); m.rotation.z = -a; clock.add(m); }
            const minH = new THREE.Group(), secH = new THREE.Group();
            const mh = new THREE.Mesh(BOX, brass); mh.scale.set(0.35, 6, 0.2); mh.position.y = 3; minH.add(mh);
            const sh = new THREE.Mesh(BOX, glowMat(colors[0], 1)); sh.scale.set(0.15, 6.8, 0.15); sh.position.y = 3.2; secH.add(sh);
            clock.add(minH, secH);
            let spin = 0;
            return {
                bloom: 0.6,
                update(time, phase, k, dt = 1 / 60) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    clock.scale.setScalar(0.4 + ease.out(clamp01(k / 0.4)) * 0.6);
                    if (k < 0.93) spin += dt * (1 + k * k * 30);
                    secH.rotation.z = -spin; minH.rotation.z = -spin / 12;
                }
            };
        },

        // 🌌 창조주: 사방의 블록이 별로 날아와 하나의 작은 세계(네모 행성)를 빚음
        creator({ g, colors }) {
            const prism = [0xff5a8a, 0xffb02e, 0xffe14d, 0x7dff6a, 0x5ab0ff, 0xb26bff];
            const blocks = [];
            for (let i = 0; i < 90; i++) {
                const m = new THREE.Mesh(BOX, glowMat(prism[i % 6], 0.9));
                const u = rand(-1, 1), th = rand(0, 6.3), s = Math.sqrt(1 - u * u);
                m.userData.home = new THREE.Vector3(Math.cos(th) * s * 2.2, 3.5 + u * 2.2, Math.sin(th) * s * 2.2);
                const fa = rand(0, 6.3);
                m.userData.from = new THREE.Vector3(Math.cos(fa) * rand(14, 22), rand(-8, 16), Math.sin(fa) * rand(8, 14) - 4);
                m.scale.setScalar(0.5); g.add(m); blocks.push(m);
            }
            const rings = [0, 1].map(i => { const r = square(7 + i * 3, 0.1, glowMat(0xffffff, 0.6)); r.position.y = 3.5; g.add(r); return r; });
            return {
                bloom: 0.6,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    blocks.forEach((m, i) => {
                        const kk = ease.inOut(clamp01((k - (i / blocks.length) * 0.5) / 0.4));
                        m.position.lerpVectors(m.userData.from, m.userData.home, kk);
                        m.rotation.set(time * 2 + i, time + i, 0);
                    });
                    rings.forEach((r, i) => { r.rotation.set(Math.PI / 2 + Math.sin(time + i) * 0.4, time * (i ? -0.6 : 0.4), 0); });
                }
            };
        },

        // 👑 밴해머: 하늘에서 거대한 망치가 천천히 들어 올려졌다가 터지기 직전 별 위로 쾅
        banHammer({ g, colors }) {
            const red = new THREE.MeshStandardMaterial({ color: 0xc8102a, emissive: 0x500010, emissiveIntensity: 0.8, roughness: 0.4 });
            const wood = new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.6 });
            const ham = new THREE.Group(); g.add(ham);
            const handle = new THREE.Mesh(BOX, wood); handle.scale.set(0.9, 14, 0.9); handle.position.y = 7; ham.add(handle);
            const head = new THREE.Mesh(BOX, red); head.scale.set(5, 4.4, 9); ham.add(head);
            const face = new THREE.Mesh(BOX, glowMat(colors[0], 0.9)); face.scale.set(4.4, 3.8, 0.2); face.position.z = 4.6; ham.add(face);
            ham.position.set(0, 3.5, -12);
            const rings = [0, 1, 2].map(i => { const r = square(4 + i * 3, 0.14, glowMat(colors[i % 2], 0.8)); r.position.y = 3.5; g.add(r); return r; });
            return {
                bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    // 0~0.8 천천히 뒤로 젖힘, 0.8~1 앞으로 내려찍음
                    const back = ease.out(clamp01(k / 0.8)), slam = ease.in(clamp01((k - 0.8) / 0.2));
                    ham.rotation.x = -0.2 - back * 1.2 + slam * 2.6;
                    face.material.opacity = 0.4 + k * 0.6;
                    rings.forEach((r, i) => { r.rotation.set(Math.PI / 2, time * (i % 2 ? -1 : 1) * (0.5 + k * 3), 0); r.scale.setScalar(1.2 - k * 0.6); });
                }
            };
        },

        // 👑 어드민: 별 둘레에 명령어 창이 하나씩 뜨고, 거대한 커서가 내려와 별을 딸깍
        admin({ g, colors }) {
            const CMDS = [':luck all', ':biome admin', ':roll jxs', ':god me', ':give all', ':admin'];
            const wins = CMDS.map((txt, i) => {
                const c = document.createElement('canvas'); c.width = 256; c.height = 80;
                const x = c.getContext('2d');
                x.fillStyle = 'rgba(12,10,4,0.92)'; x.fillRect(0, 0, 256, 80);
                x.strokeStyle = '#ffd23a'; x.lineWidth = 5; x.strokeRect(2, 2, 252, 76);
                x.fillStyle = '#ffd23a'; x.fillRect(0, 0, 256, 16);
                x.font = 'bold 26px monospace'; x.fillStyle = '#fff3c0'; x.fillText('> ' + txt, 12, 56);
                const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
                const m = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
                const a = (i / CMDS.length) * Math.PI * 2;
                m.position.set(Math.cos(a) * 7, 3.5 + Math.sin(a) * 4.5, -2);
                m.scale.set(4.4, 1.4, 0.05);
                g.add(m); return m;
            });
            const CUR = ['10000000', '11000000', '11100000', '11110000', '11111000', '11111100', '11111110', '11111000', '11011000', '10001100', '00001100', '00000110'];
            const cursor = new THREE.Group(); g.add(cursor);
            const wm = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
            CUR.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '1') { const b = new THREE.Mesh(BOX, wm); b.scale.set(0.7, 0.7, 0.3); b.position.set(k * 0.7, -r * 0.7, 0); cursor.add(b); } }));
            return {
                bloom: 0.6,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    wins.forEach((w, i) => { const on = k > 0.08 + i * 0.12; w.visible = on; if (on) w.scale.set(4.4 * Math.min(1, (k - 0.08 - i * 0.12) * 12), 1.4, 0.05); });
                    const d = ease.inOut(clamp01((k - 0.6) / 0.35));
                    cursor.position.set(THREE.MathUtils.lerp(9, 0.2, d), THREE.MathUtils.lerp(16, 3.6, d) - (k > 0.96 ? 0.4 : 0), 1);
                }
            };
        },

        // 🎃 뱀파이어: 핏빛 달이 떠오르고, 사방에서 박쥐 떼가 별로 몰려듦
        vampire({ g, colors }) {
            const moon = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0xc8102a, toneMapped: false }));
            moon.scale.set(9, 9, 0.2); moon.position.set(0, 3.5, -24); g.add(moon);
            const halo = new THREE.Mesh(BOX, glowMat(0xff2040, 0.3)); halo.scale.set(14, 14, 0.1); halo.position.set(0, 3.5, -24.5); g.add(halo);
            const batM = new THREE.MeshBasicMaterial({ color: 0x050205 });
            const bats = [];
            for (let i = 0; i < 40; i++) {
                const b = new THREE.Group();
                const body = new THREE.Mesh(BOX, batM); body.scale.set(0.3, 0.22, 0.3); b.add(body);
                const wl = new THREE.Mesh(BOX, batM), wr = new THREE.Mesh(BOX, batM);
                wl.scale.set(0.5, 0.06, 0.3); wr.scale.copy(wl.scale); wl.position.x = -0.38; wr.position.x = 0.38;
                b.add(wl, wr); b.userData = { wl, wr, a: rand(0, 6.3), r: rand(9, 16), y: rand(-6, 10), ph: rand(0, 6) };
                g.add(b); bats.push(b);
            }
            return {
                bloom: 0.75,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    moon.position.y = -6 + ease.out(clamp01(k / 0.6)) * 9.5;
                    halo.position.y = moon.position.y;
                    halo.material.opacity = 0.2 + k * 0.3;
                    bats.forEach((b, i) => {
                        const u = b.userData;
                        const pull = ease.in(k);
                        const r = u.r * (1 - pull * 0.9);
                        const a = u.a + time * (1 + k * 3);
                        b.position.set(Math.cos(a) * r, 3.5 + (u.y - 3.5) * (1 - pull), Math.sin(a) * r * 0.5 - 2);
                        b.rotation.y = -a;
                        const f = Math.sin(time * 22 + u.ph) * 0.8;
                        u.wl.rotation.z = f; u.wr.rotation.z = -f;
                    });
                }
            };
        },

        // 🎃 목 없는 기사: 초록 혼불 고리가 조여 들고, 땅에서 호박등이 줄줄이 켜짐
        headless({ g, colors }) {
            const lanterns = [];
            const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0x5a1a00, emissiveIntensity: 0.6 });
            for (let i = 0; i < 14; i++) {
                const a = (i / 14) * Math.PI * 2;
                const p = new THREE.Group(); p.position.set(Math.cos(a) * 7, 0.4, Math.sin(a) * 7);
                const b = new THREE.Mesh(BOX, orange); b.scale.set(0.9, 0.8, 0.85); p.add(b);
                const f = new THREE.Mesh(BOX, glowMat(colors[0], 1)); f.scale.set(0.6, 0.12, 0.05); f.position.set(0, -0.1, 0.44); p.add(f);
                const e = new THREE.Mesh(BOX, glowMat(colors[0], 1)); e.scale.set(0.5, 0.14, 0.05); e.position.set(0, 0.15, 0.44); p.add(e);
                p.lookAt(0, 0.4, 0); p.rotateY(Math.PI);
                p.userData.f = [f, e];
                g.add(p); lanterns.push(p);
            }
            const rings = [0, 1, 2].map(i => { const r = square(12 - i * 3, 0.12, glowMat(colors[i % 2], 0.8)); r.position.y = 3.5; g.add(r); return r; });
            return {
                bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    lanterns.forEach((p, i) => {
                        const on = k > i / 14 * 0.8;
                        p.visible = on;
                        p.userData.f.forEach(f => { f.material.opacity = 0.7 + Math.sin(time * 14 + i) * 0.3; });
                    });
                    rings.forEach((r, i) => {
                        r.rotation.x = Math.PI / 2 + Math.sin(time + i) * 0.3;
                        r.rotation.y = time * (i % 2 ? -1 : 1) * (0.5 + k * 3);
                        r.scale.setScalar(THREE.MathUtils.lerp(1.3, 0.3, ease.in(k)));
                    });
                }
            };
        },

        // 🎃 호박 대왕: 별 뒤에서 거대한 잭오랜턴이 떠오르고, 눈에 불이 켜지고, 터지기 직전 입을 쩍
        pumpkinKing({ g, colors }) {
            const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55, emissive: 0x6a2200, emissiveIntensity: 0.7 });
            const fireM = glowMat(0xffc04a, 1);
            const pk = new THREE.Group(); pk.position.set(0, 3.5, -20); g.add(pk);
            const body = new THREE.Mesh(BOX, orange); body.scale.set(20, 16, 10); pk.add(body);
            const eyeL = new THREE.Mesh(BOX, fireM), eyeR = new THREE.Mesh(BOX, fireM);
            eyeL.scale.set(4, 4, 0.3); eyeR.scale.copy(eyeL.scale); eyeL.position.set(-4.6, 3, 5.1); eyeR.position.set(4.6, 3, 5.1);
            eyeL.rotation.z = eyeR.rotation.z = Math.PI / 4;
            const mouth = new THREE.Mesh(BOX, fireM); mouth.scale.set(13, 1.6, 0.3); mouth.position.set(0, -3.6, 5.1);
            pk.add(eyeL, eyeR, mouth);
            const candies = [];
            const cc = ['#ff3b7a', '#5ab0ff', '#7dff6a', '#ffe14d', '#c08bff'];
            for (let i = 0; i < 30; i++) {
                const c = new THREE.Mesh(BOX, glowMat(cc[i % cc.length], 0.9)); c.scale.set(0.4, 0.22, 0.22);
                c.userData = { a: rand(0, 6.3), r: rand(6, 12), y: rand(-4, 10) };
                g.add(c); candies.push(c);
            }
            return {
                hideStar: false, bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build' || phase === 'phase2';
                    g.visible = vis;
                    if (!vis) return;
                    const kk = phase === 'phase2' ? 1 : k;
                    pk.position.y = -14 + ease.out(clamp01(kk / 0.7)) * 18;
                    const lit = clamp01((kk - 0.45) / 0.3);
                    fireM.opacity = lit * (0.75 + Math.sin(time * 12) * 0.25);
                    const open = phase === 'phase2' ? 1 + Math.abs(Math.sin(time * 14)) * 1.6 : 1 + clamp01((k - 0.85) / 0.15) * 2.2;
                    mouth.scale.y = 1.6 * open;
                    pk.rotation.z = Math.sin(time * 0.8) * 0.04;
                    candies.forEach((c, i) => {
                        const u = c.userData, pull = ease.in(kk);
                        const a = u.a + time * (0.8 + kk * 3);
                        c.position.set(Math.cos(a) * u.r * (1 - pull * 0.85), 3.5 + (u.y - 3.5) * (1 - pull), Math.sin(a) * u.r * 0.6 * (1 - pull * 0.85));
                        c.rotation.set(time * 3 + i, time * 2, 0);
                    });
                }
            };
        },
        // 운명의 직조자: 사방에서 빛의 실이 별로 뻗어 와 촘촘히 엮이고, 운명의 바퀴가 빨라짐
        fateWeaver({ g, colors }) {
            const N = 36;
            const threads = [];
            for (let i = 0; i < N; i++) {
                const a = (i / N) * Math.PI * 2;
                const from = new THREE.Vector3(Math.cos(a) * 16, 3.5 + Math.sin(a) * 11, -4 + Math.sin(i * 1.7) * 4);
                const m = new THREE.Mesh(BOX, glowMat(colors[i % colors.length], 0.75));
                m.userData.from = from; g.add(m); threads.push(m);
            }
            const wheel = new THREE.Group(); wheel.position.set(0, 3.5, -1); g.add(wheel);
            for (let i = 0; i < 8; i++) { const sp = new THREE.Mesh(BOX, glowMat(colors[0], 0.9)); sp.scale.set(0.12, 5, 0.12); sp.rotation.z = (i / 8) * Math.PI; wheel.add(sp); }
            const rim = square(5.2, 0.14, glowMat(colors[1], 0.9)); rim.rotation.x = Math.PI / 2; wheel.add(rim);
            const C = new THREE.Vector3(0, 3.5, 0), tmp = new THREE.Vector3();
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    threads.forEach((m, i) => {
                        const reach = ease.out(clamp01((k - i * 0.012) / 0.6));
                        tmp.lerpVectors(m.userData.from, C, reach);
                        const len = m.userData.from.distanceTo(tmp) + 0.01;
                        m.scale.set(0.05, 0.05, len);
                        m.position.copy(m.userData.from).add(tmp).multiplyScalar(0.5);
                        m.lookAt(tmp);
                    });
                    wheel.rotation.z = time * (0.3 + k * k * 6);
                    wheel.scale.setScalar(0.5 + k * 0.5);
                }
            };
        },

        // 폭풍의 눈: 구름 벽이 점점 빨리 돌며 조여 오고, 그 안에서 번개가 번쩍임
        stormEye({ g, colors }) {
            const N = 60;
            const cloud = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x3a4152, roughness: 0.95, emissive: colors[0], emissiveIntensity: 0.1 }), N);
            const cd = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 6, y: (i / N) * 12 - 2.5, s: rand(1.5, 2.8) }));
            g.add(cloud);
            const bolts = [0, 1, 2].map(() => { const b = bolt(8, glowMat(colors[1], 1)); g.add(b); return b; });
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            return {
                bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const r = THREE.MathUtils.lerp(14, 6, ease.inOut(k));
                    cd.forEach((d, i) => {
                        const u = ((d.a / (Math.PI * 2)) + time * (0.04 + k * k * 0.35)) % 1;
                        const a = Math.PI * (1.02 + u * 0.96), edge = Math.min(1, u * 8, (1 - u) * 8);   // 뒤쪽 반원만
                        p.set(Math.cos(a) * r, d.y, Math.sin(a) * r - 3); q.setFromEuler(e.set(0, -a, 0)); sc.set(d.s * 1.4 * edge, d.s * 0.8 * edge, d.s * edge);
                        cloud.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    cloud.instanceMatrix.needsUpdate = true;
                    bolts.forEach((b, i) => {
                        const on = Math.sin(time * (3 + i) + i * 2) > 0.85 && k > 0.2;
                        b.visible = on;
                        if (on) { const a = time * 0.5 + i * 2.1; b.reshape([Math.cos(a) * r, 10, Math.sin(a) * r], [Math.cos(a) * r * 0.4, 0, Math.sin(a) * r * 0.4], 0.8); }
                    });
                }
            };
        },

        // 가장 어두운 밤: 하늘에 검은 일식이 차오르고 영혼들이 그 안으로 빨려 듦.
        //   각성 단계엔 어둠 속에서 머리 셋 달린 개의 붉은 눈 여섯 개가 뜨고, 발밑에 푸른 저승불 고리
        hades({ g, colors }) {
            const ecl = new THREE.Group(); ecl.position.set(0, 3.5, -3); g.add(ecl);
            const disc = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 })); disc.scale.set(5, 5, 0.3); ecl.add(disc);
            const corona = [0, 1, 2].map(i => { const r = square(5.6 + i * 0.9, 0.16 - i * 0.04, glowMat(colors[i % 2], 0.9 - i * 0.2)); r.rotation.x = Math.PI / 2; ecl.add(r); return r; });
            const SO = 50;
            const souls = new THREE.InstancedMesh(BOX, glowMat(colors[0], 0.8), SO);
            const sd = Array.from({ length: SO }, () => ({ from: new THREE.Vector3(rand(-16, 16), rand(-6, 14), rand(-10, 8)), ph: rand(0, 1) }));
            g.add(souls);
            const eyes = new THREE.Group(); eyes.position.set(0, 4.2, -9); g.add(eyes);
            const eyeM = glowMat(new THREE.Color('#ff3b2a'), 1);
            [-4, 0, 4].forEach((x, i) => { for (const s of [-1, 1]) { const e = new THREE.Mesh(BOX, eyeM); e.scale.set(0.9, 0.18, 0.1); e.position.set(x + s * 0.65, i === 1 ? 0.7 : 0, 0); e.rotation.z = -s * 0.15; eyes.add(e); } });
            const ring = new THREE.InstancedMesh(BOX, glowMat(colors[0], 0.9), 30);
            g.add(ring);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), C = new THREE.Vector3(0, 3.5, -3);
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const build = phase === 'build', p2 = phase === 'phase2';
                    ecl.visible = souls.visible = build;
                    eyes.visible = ring.visible = p2;
                    if (build) {
                        const grow = ease.out(clamp01(k / 0.7));
                        ecl.scale.setScalar(0.3 + grow * 0.9);
                        corona.forEach((r, i) => { r.rotation.y = time * (0.2 + k * 2) * (i % 2 ? -1 : 1); });
                        sd.forEach((d, i) => {
                            const u = (time * 0.25 + d.ph) % 1;
                            p.lerpVectors(d.from, C, u * u);
                            sc.setScalar(0.25 * (1 - u * 0.7)); q.identity();
                            souls.setMatrixAt(i, m4.compose(p, q, sc));
                        });
                        souls.instanceMatrix.needsUpdate = true;
                    }
                    if (p2) {
                        const open = ease.out(clamp01(k / 0.4));
                        eyes.scale.set(1, open, 1);
                        for (let i = 0; i < 30; i++) {
                            const a = (i / 30) * Math.PI * 2;
                            const h = (0.6 + Math.abs(Math.sin(time * 6 + i * 1.3)) * 1.4) * open;
                            p.set(Math.cos(a) * 3.2, h / 2, Math.sin(a) * 3.2); sc.set(0.2, h, 0.2); q.identity();
                            ring.setMatrixAt(i, m4.compose(p, q, sc));
                        }
                        ring.instanceMatrix.needsUpdate = true;
                    }
                }
            };
        },

        // 성운의 주인: 별 대신 두 팔 은하가 점점 빨리 감기며 모이고, 별자리 선이 하나씩 이어짐
        nebula({ g, colors }) {
            const N = 180;
            const gal = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), N);
            const ca = colors[0], cb = colors[1], cw = new THREE.Color('#ffffff');
            const gd = Array.from({ length: N }, (_, i) => ({ arm: i % 2, r: Math.pow(Math.random(), 0.7) * 6 + 0.3, off: rand(-0.3, 0.3) }));
            gd.forEach((d, i) => gal.setColorAt(i, (d.r < 1.2 ? cw : d.arm ? ca : cb).clone().lerp(cw, Math.random() * 0.3)));
            const holder = new THREE.Group(); holder.position.set(0, 3.5, 0); holder.rotation.x = 1.1; holder.add(gal); g.add(holder);
            const pts = [[-4, 2.5], [-2, 3.6], [0, 3], [1.6, 4.2], [3.6, 3.4], [4.4, 1.6], [2.4, 0.8], [0.4, 1.4]];
            const links = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
                const l = new THREE.Mesh(BOX, glowMat(colors[2] || cw, 0)); const len = Math.hypot(bx - ax, by - ay);
                l.scale.set(len, 0.06, 0.06); l.position.set((ax + bx) / 2, 3.5 + (ay + by) / 2, -4); l.rotation.z = Math.atan2(by - ay, bx - ax);
                g.add(l); links.push(l);
            }
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const shrink = 1 - ease.in(clamp01((k - 0.7) / 0.3)) * 0.85;
                    gd.forEach((d, i) => {
                        const a = d.r * 1.1 + d.arm * Math.PI + time * (0.3 + k * k * 4) + d.off;
                        const r = d.r * shrink;
                        p.set(Math.cos(a) * r, Math.sin(i) * 0.08, Math.sin(a) * r);
                        sc.setScalar(d.r < 1 ? 0.18 : 0.1);
                        gal.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    gal.instanceMatrix.needsUpdate = true;
                    links.forEach((l, i) => { l.material.opacity = k * 9 > i + 1 ? 0.8 : 0; });
                }
            };
        },

        // 얼음 황제: 얼음 가시가 둥글게 차례로 솟고, 하늘에서 거대한 얼음 왕관이 내려옴
        iceEmperor({ g, colors }) {
            const ice = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, roughness: 0.15, transparent: true, opacity: 0.8, emissive: colors[0], emissiveIntensity: 0.35 });
            const spikes = [];
            for (let i = 0; i < 24; i++) {
                const a = (i / 24) * Math.PI * 2;
                const sp = new THREE.Mesh(BOX, ice);
                sp.position.set(Math.cos(a) * 6, 0, Math.sin(a) * 6); sp.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
                sp.userData.h = 2.5 + (i % 3) * 1.5; g.add(sp); spikes.push(sp);
            }
            const crown = new THREE.Group();
            for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const c = new THREE.Mesh(BOX, ice); c.scale.set(0.5, 1.6 + (i % 2) * 1.1, 0.5); c.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); crown.add(c); }
            g.add(crown);
            return {
                hideStar: false, bloom: 0.8,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    spikes.forEach((sp, i) => {
                        const kk = clamp01((k - i * 0.02) / 0.3);
                        const h = sp.userData.h * ease.out(kk) + 0.001;
                        sp.scale.set(0.7, h, 0.7); sp.position.y = h / 2;
                    });
                    crown.position.set(0, THREE.MathUtils.lerp(16, 6, ease.inOut(clamp01((k - 0.3) / 0.7))), 0);
                    crown.rotation.y = time * (0.3 + k * 2);
                }
            };
        },

        // 혼돈의 신: 세 겹 고리가 점점 미친 듯 돌고, 깨진 조각들이 사방에서 모여듦
        chaosGod({ g, colors }) {
            const gy = new THREE.Group(); gy.position.set(0, 3.5, 0); g.add(gy);
            const rings = [0, 1, 2].map(i => { const r = square(7 - i * 1.4, 0.14, glowMat(colors[i % colors.length], 0.95)); gy.add(r); return r; });
            const N = 40;
            const shards = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1a1428, emissive: colors[0], emissiveIntensity: 0.35 }), N);
            const sd = Array.from({ length: N }, () => ({ from: new THREE.Vector3(rand(-18, 18), rand(-6, 16), rand(-14, 6)), s: rand(0.4, 1.2), ph: rand(0, 6) }));
            g.add(shards);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(), C = new THREE.Vector3(0, 3.5, 0);
            return {
                bloom: 0.8,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const sp = 0.5 + k * k * 6;
                    rings[0].rotation.set(time * sp, 0, time * sp * 0.4);
                    rings[1].rotation.set(Math.PI / 2, time * sp * 1.2, 0);
                    rings[2].rotation.set(time * sp * 0.7, time * sp, Math.PI / 4);
                    rings.forEach((r, i) => r.children.forEach(m => m.material.color.setHSL((time * 0.3 + i / 3) % 1, 1, 0.6)));
                    const gather = ease.inOut(clamp01(k / 0.95));
                    sd.forEach((d, i) => {
                        p.lerpVectors(d.from, C, gather * 0.85);
                        q.setFromEuler(e.set(time * 2 + d.ph, time + i, 0)); sc.set(d.s, d.s * 0.2, d.s);
                        shards.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    shards.instanceMatrix.needsUpdate = true;
                }
            };
        },

        // 태양왕: 블록 태양이 지평선 아래에서 떠올라 점점 커지고, 햇살이 빨리 돌다 터짐
        sunKing({ g, colors }) {
            const R = 2.6, S = 0.55;
            const cells = [];
            for (let x = -R; x <= R; x += S) for (let y = -R; y <= R; y += S) for (let z = -R; z <= R; z += S) {
                const d = Math.hypot(x, y, z);
                if (d <= R && d > R - S * 1.1) cells.push([x, y, z]);
            }
            const sun = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), cells.length);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            cells.forEach(([x, y, z], i) => { sun.setMatrixAt(i, m4.compose(p.set(x, y, z), q, sc.setScalar(S * 0.95))); sun.setColorAt(i, colors[0].clone().lerp(colors[1], Math.random())); });
            const holder = new THREE.Group(); holder.add(sun); g.add(holder);
            const rays = new THREE.Group(); holder.add(rays);
            for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; const r = new THREE.Mesh(BOX, glowMat(i % 2 ? colors[0] : colors[2] || colors[1], 0.5)); r.scale.set(0.22, i % 2 ? 3 : 4.6, 0.1); r.position.set(Math.cos(a) * (R + 2.2), Math.sin(a) * (R + 2.2), 0); r.rotation.z = a - Math.PI / 2; rays.add(r); }
            return {
                hideStar: true, bloom: 0.6,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const rise = ease.out(clamp01(k / 0.6));
                    holder.position.set(0, THREE.MathUtils.lerp(-6, 3.8, rise), -5);
                    holder.scale.setScalar(0.6 + ease.in(k) * 0.6);
                    sun.rotation.y = time * 0.3;
                    rays.rotation.z = time * (0.2 + k * k * 4);
                    rays.children.forEach((r, i) => { r.material.opacity = 0.25 + k * 0.5; });
                }
            };
        },

        // 명예와 영광: 빛의 방패벽이 칸칸이 세워지고, 하늘에서 거대한 망치가 내려와 쾅
        crusader({ g, colors }) {
            const shield = new THREE.Group(); shield.position.set(0, 3.2, -0.5); g.add(shield);
            const tiles = [];
            for (let x = -4; x <= 4; x++) for (let y = -3; y <= 3; y++) {
                const tl = new THREE.Mesh(BOX, glowMat(colors[1], 0)); tl.scale.set(0.46, 0.46, 0.05); tl.position.set(x * 0.5, y * 0.5, 0);
                tl.userData.d = Math.hypot(x, y * 1.2); shield.add(tl); tiles.push(tl);
            }
            const rim = square(4.7, 0.08, glowMat(colors[0], 0.9)); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1, 3.7 / 4.7); shield.add(rim);
            const steel = new THREE.MeshStandardMaterial({ color: 0xc9ced8, metalness: 0.85, roughness: 0.3, emissive: colors[0], emissiveIntensity: 0.15 });
            const hammer = new THREE.Group();
            const hs = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x3a2a1c })); hs.scale.set(0.3, 6, 0.3); hs.position.y = 3.2; hammer.add(hs);
            const hh = new THREE.Mesh(BOX, steel); hh.scale.set(3.0, 1.8, 1.8); hammer.add(hh);
            for (const y of [0.5, -0.5]) { const b = new THREE.Mesh(BOX, glowMat(colors[0], 1)); b.scale.set(3.06, 0.18, 1.86); b.position.y = y; hammer.add(b); }
            g.add(hammer);
            return {
                hideStar: true, bloom: 0.75,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    tiles.forEach(tl => { tl.material.opacity = k * 6 > tl.userData.d ? 0.22 + 0.1 * Math.sin(time * 5 + tl.userData.d) : 0; });
                    rim.children.forEach(m => { m.material.opacity = clamp01(k * 3) * 0.9; });
                    const drop = ease.inOut(clamp01((k - 0.45) / 0.53));
                    hammer.position.set(0, THREE.MathUtils.lerp(18, 5.6, drop), -1.2);
                    hammer.rotation.z = THREE.MathUtils.lerp(-0.9, 0, drop);
                    hammer.visible = k > 0.4;
                }
            };
        },

        // 저거너트: 붉은 기운 속에서 하늘 끝부터 철판 대검이 떨어져 땅에 꽂힘
        juggernaut({ g, colors }) {
            const bladeM = new THREE.MeshStandardMaterial({ color: 0x3a3b42, metalness: 0.92, roughness: 0.5, emissive: colors[0], emissiveIntensity: 0.08 });
            const sw = new THREE.Group();
            const blade = new THREE.Mesh(BOX, bladeM); blade.scale.set(1.5, 11, 0.4); blade.position.y = 5.5; sw.add(blade);
            const guard = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x24252b, metalness: 0.9, roughness: 0.4 })); guard.scale.set(2.4, 0.45, 0.7); guard.position.y = 11.2; sw.add(guard);
            const grip = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2a1a12 })); grip.scale.set(0.4, 2.2, 0.4); grip.position.y = 12.6; sw.add(grip);
            const edge = new THREE.Mesh(BOX, glowMat(colors[0], 0.6)); edge.scale.set(0.08, 11, 0.44); edge.position.set(0.75, 5.5, 0); sw.add(edge);
            const edge2 = new THREE.Mesh(BOX, edge.material); edge2.scale.copy(edge.scale); edge2.position.set(-0.75, 5.5, 0); sw.add(edge2);
            g.add(sw);
            const N = 60;
            const haze = new THREE.InstancedMesh(BOX, glowMat(colors[0], 0.5), N);
            const hd = Array.from({ length: N }, () => ({ a: rand(0, 6.3), r: rand(2, 9), y: rand(-2, 12), v: rand(1, 3), s: rand(0.15, 0.45) }));
            g.add(haze);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k, dt) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const drop = ease.inOut(clamp01((k - 0.3) / 0.68));
                    sw.position.set(0, THREE.MathUtils.lerp(24, -2.5, drop), -2.5);
                    sw.rotation.z = Math.sin(time * 0.7) * 0.05 * (1 - drop);
                    edge.material.opacity = 0.2 + k * 0.5;
                    hd.forEach((d, i) => {
                        d.y += d.v * (dt || 0.016) * (1 + k * 2); if (d.y > 12) d.y = -2;
                        p.set(Math.cos(d.a + time * 0.4) * d.r, d.y, Math.sin(d.a + time * 0.4) * d.r - 2);
                        q.setFromEuler(e.set(time + i, time * 2, 0)); sc.setScalar(d.s * (0.4 + k));
                        haze.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    haze.instanceMatrix.needsUpdate = true;
                }
            };
        },

        // 태극권: 별 대신 픽셀 태극이 커지며 점점 빨리 돌고, 팔괘가 둘레를 감쌈
        taichi({ g, colors }) {
            const N = 22, S = 0.34, R = (N / 2) * S;
            const cells = [];
            for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
                const x = (i - N / 2 + 0.5) * S, y = (j - N / 2 + 0.5) * S, d = Math.hypot(x, y);
                if (d > R) continue;
                let w = x > 0;
                if (Math.hypot(x, y - R / 2) < R / 2) w = true;
                if (Math.hypot(x, y + R / 2) < R / 2) w = false;
                if (Math.hypot(x, y - R / 2) < R / 6) w = false;
                if (Math.hypot(x, y + R / 2) < R / 6) w = true;
                cells.push({ x, y, c: d > R - S ? 2 : w ? 1 : 0 });
            }
            // 같은 색이 이어지는 칸은 한 막대로 합쳐서 그림 (상자 수를 줄임)
            const mats = [new THREE.MeshBasicMaterial({ color: '#14182a' }), new THREE.MeshBasicMaterial({ color: '#c9d2e6' }), new THREE.MeshBasicMaterial({ color: '#e0a94a' })];
            const disc = new THREE.Group();
            const rows = {};
            cells.forEach(c => { (rows[c.y.toFixed(3)] = rows[c.y.toFixed(3)] || []).push(c); });
            Object.values(rows).forEach(row => {
                row.sort((a, b) => a.x - b.x);
                let run = [row[0]];
                const flush = () => {
                    const x0 = run[0].x, x1 = run[run.length - 1].x;
                    const m = new THREE.Mesh(BOX, mats[run[0].c]);
                    m.scale.set(x1 - x0 + S * 0.94, S * 0.94, 0.3); m.position.set((x0 + x1) / 2, run[0].y, 0);
                    disc.add(m);
                };
                for (let i = 1; i < row.length; i++) {
                    if (row[i].c === run[0].c && Math.abs(row[i].x - run[run.length - 1].x - S) < 1e-3) run.push(row[i]);
                    else { flush(); run = [row[i]]; }
                }
                flush();
            });
            disc.position.set(0, 3.5, 0); g.add(disc);
            const TRI = ['111', '110', '101', '100', '011', '010', '001', '000'];
            const ring = new THREE.Group(); ring.position.set(0, 3.5, 0); g.add(ring);
            TRI.forEach((code, i) => {
                const a = (i / 8) * Math.PI * 2;
                const tg = new THREE.Group();
                [...code].forEach((b, k) => {
                    const r = 3.0 + k * 0.32;
                    const mat = glowMat(i % 2 ? colors[1] : colors[2], 1);
                    if (b === '1') { const m = new THREE.Mesh(BOX, mat); m.scale.set(1.2, 0.14, 0.1); m.position.y = r; tg.add(m); }
                    else for (const sx of [-0.37, 0.37]) { const m = new THREE.Mesh(BOX, mat); m.scale.set(0.46, 0.14, 0.1); m.position.set(sx, r, 0); tg.add(m); }
                });
                tg.rotation.z = a;
                ring.add(tg);
            });
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    disc.scale.setScalar(0.22 + ease.out(k) * 0.16);
                    disc.rotation.z = time * (0.4 + k * k * 9);
                    ring.rotation.z = -time * (0.2 + k * 2);
                    ring.scale.setScalar(THREE.MathUtils.lerp(1.5, 0.85, ease.inOut(k)));
                    ring.children.forEach((tg, i) => { tg.visible = k > i / 10; });
                }
            };
        },

        // 대악마: 어둠 속에서 거대한 눈이 서서히 뜨이고, 사방에서 사슬이 별로 뻗어와 묶음
        archdemon({ g, colors }) {
            const eyes = new THREE.Group(); eyes.position.set(0, 7.5, -18); g.add(eyes);
            const eyeL = new THREE.Mesh(BOX, glowMat(colors[0], 1)), eyeR = new THREE.Mesh(BOX, glowMat(colors[0], 1));
            eyeL.position.x = -6; eyeR.position.x = 6; eyeL.rotation.z = 0.18; eyeR.rotation.z = -0.18;
            eyes.add(eyeL, eyeR);
            const linkM = new THREE.MeshStandardMaterial({ color: 0x5a5560, metalness: 0.9, roughness: 0.3, emissive: colors[0], emissiveIntensity: 0.2 });
            const chains = [];
            for (let c = 0; c < 8; c++) {
                const a = (c / 8) * Math.PI * 2 + 0.2;
                const from = new THREE.Vector3(Math.cos(a) * 18, 3.5 + Math.sin(a) * 12, -6 + (c % 3) * 3);
                const ch = new THREE.Group();
                const links = [];
                for (let k = 0; k < 24; k++) { const l = new THREE.Mesh(BOX, linkM); l.scale.set(0.35, 0.7, 0.12); ch.add(l); links.push(l); }
                g.add(ch); chains.push({ from, links });
            }
            const sig = [0, 1, 2].map(i => { const r = square(2.2 + i * 0.9, 0.06, glowMat(colors[i % 2], 0.7)); r.position.set(0, 3.5, 0); g.add(r); return r; });
            const center = new THREE.Vector3(0, 3.5, 0), tmp = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
            return {
                bloom: 0.8,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const open = ease.inOut(clamp01((k - 0.15) / 0.6));
                    eyeL.scale.set(7, 0.12 + open * 1.6, 0.2); eyeR.scale.copy(eyeL.scale);
                    chains.forEach((c, i) => {
                        const reach = ease.out(clamp01((k - i * 0.04) / 0.7));
                        dir.subVectors(center, c.from);
                        const len = dir.length() * reach;
                        dir.normalize();
                        c.links.forEach((l, j) => {
                            const d = j * 0.65;
                            l.visible = d < len;
                            tmp.copy(c.from).addScaledVector(dir, d);
                            if (k > 0.85) tmp.x += Math.sin(time * 40 + j) * 0.06;
                            l.position.copy(tmp);
                            l.quaternion.setFromUnitVectors(up, dir);
                            l.rotateY(j % 2 ? Math.PI / 2 : 0);
                        });
                    });
                    sig.forEach((r, i) => {
                        r.rotation.x = Math.PI / 2;
                        r.rotation.z = time * (i % 2 ? -1 : 1) * (0.5 + k * 3) + i * 0.4;
                        r.scale.setScalar(0.5 + k * 0.4);
                    });
                }
            };
        },

        // 샌즈: 별 둘레에 가스터 블래스터가 하나씩 나타나 입을 벌리고, 터지는 순간 한가운데로 일제히 발사.
        //       각성 단계엔 바닥에서 뼈 벽이 솟아오름
        sans({ g, colors }) {
            const skullM = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.5 });
            const darkM = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const center = new THREE.Vector3(0, 3.5, 0);
            const blasters = [];
            for (let i = 0; i < 6; i++) {
                const root = new THREE.Group();
                const b = (m, w, h, d, x, y, z, p = root) => { const o = new THREE.Mesh(BOX, m); o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o; };
                b(skullM, 1.8, 1.3, 1.6, 0, 0.2, -0.3); b(skullM, 1.3, 0.55, 1.4, 0, 0.15, 1.0);
                b(darkM, 0.42, 0.38, 0.1, -0.45, 0.45, 0.51); b(darkM, 0.42, 0.38, 0.1, 0.45, 0.45, 0.51);
                b(glowMat(colors[0], 1), 0.16, 0.16, 0.06, -0.45, 0.45, 0.56); b(glowMat(colors[0], 1), 0.16, 0.16, 0.06, 0.45, 0.45, 0.56);
                for (const s of [-1, 1]) { const h = b(skullM, 0.3, 0.9, 0.3, s * 0.8, 0.6, -1.0); h.rotation.x = -0.9; }
                const jaw = new THREE.Group(); jaw.position.set(0, -0.15, -0.2); root.add(jaw);
                b(skullM, 1.25, 0.32, 1.9, 0, -0.18, 0.85, jaw);
                const glow = b(glowMat(colors[2] || colors[0], 0), 0.9, 0.35, 0.3, 0, -0.1, 1.4);
                const beam = b(glowMat(new THREE.Color('#ffffff'), 1), 1, 1, 1, 0, -0.1, 1.5);
                const a = (i / 6) * Math.PI * 2;
                root.userData.home = new THREE.Vector3(Math.cos(a) * 5, 3.5 + Math.sin(a) * 3.6, -1.5);
                root.scale.setScalar(1.0);
                g.add(root);
                blasters.push({ root, jaw, glow, beam, i });
            }
            const NB = 28;
            const bones = new THREE.InstancedMesh(BOX, skullM, NB);
            g.add(bones);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const build = phase === 'build';
                    blasters.forEach(bl => {
                        const show = build && k > bl.i * 0.1;
                        bl.root.visible = show;
                        if (!show) return;
                        const app = ease.out(clamp01((k - bl.i * 0.1) / 0.15));
                        bl.root.position.copy(bl.root.userData.home).multiplyScalar(1 + (1 - app) * 1.5);
                        bl.root.lookAt(center);
                        const charge = clamp01((k - 0.55) / 0.35);
                        bl.jaw.rotation.x = charge * 0.6;
                        bl.glow.material.opacity = charge;
                        const fire = k > 0.96;
                        bl.beam.visible = fire;
                        const len = bl.root.position.distanceTo(center);
                        bl.beam.scale.set(0.3 + Math.sin(time * 40) * 0.06, 0.3, len);
                        bl.beam.position.z = 1.5 + len / 2;
                    });
                    const wall = phase === 'phase2' ? ease.out(clamp01(k / 0.5)) : 0;
                    bones.visible = wall > 0;
                    for (let i = 0; i < NB; i++) {
                        const a = (i / NB) * Math.PI * 2;
                        const h = (1 + Math.abs(Math.sin(i * 3.7)) * 1.6) * wall;
                        p.set(Math.cos(a) * 2.6, h / 2, Math.sin(a) * 2.6);
                        sc.set(0.16, Math.max(0.001, h), 0.16);
                        bones.setMatrixAt(i, m4.compose(p, q, sc));
                    }
                    bones.instanceMatrix.needsUpdate = true;
                }
            };
        },

        // 멸종의 김민채: 하늘 끝에서 거대한 불덩이 유성이 별을 향해 떨어지고, 작은 유성들이 함께 쏟아짐
        extinction({ g, colors }) {
            const rock = new THREE.MeshStandardMaterial({ color: 0x3a160a, emissive: colors[0], emissiveIntensity: 0.55, roughness: 0.8 });
            const big = new THREE.Group();
            for (let i = 0; i < 7; i++) {
                const m = new THREE.Mesh(BOX, rock);
                m.scale.setScalar(i ? rand(1.2, 1.9) : 2.6);
                m.position.set(i ? rand(-1, 1) : 0, i ? rand(-1, 1) : 0, i ? rand(-1, 1) : 0);
                m.rotation.set(rand(0, 3), rand(0, 3), 0);
                big.add(m);
            }
            g.add(big);
            const TR = 40;
            const trail = new THREE.InstancedMesh(BOX, glowMat(colors[1], 0.85), TR);
            g.add(trail);
            const S = 14;
            const smalls = new THREE.InstancedMesh(BOX, glowMat(colors[0], 1), S);
            const sd = Array.from({ length: S }, () => ({ x: rand(-30, 30), z: rand(-40, 5), ph: rand(0, 1), v: rand(0.35, 0.6) }));
            g.add(smalls);
            const from = new THREE.Vector3(16, 30, -48), to = new THREE.Vector3(0, 3.5, -4), dir = new THREE.Vector3().subVectors(to, from).normalize();
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
            return {
                hideStar: true, bloom: 0.7,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    big.visible = trail.visible = smalls.visible = vis;
                    if (!vis) return;
                    const f = ease.inOut(clamp01(k / 0.97));
                    big.position.lerpVectors(from, to, f);
                    big.rotation.set(time * 1.3, time * 0.9, 0);
                    big.scale.setScalar(0.5 + f * 0.45);
                    for (let i = 0; i < TR; i++) {
                        p.copy(big.position).addScaledVector(dir, -(i * 0.8 + 1.4) * (0.6 + f * 0.4));
                        p.x += Math.sin(time * 9 + i) * 0.25 * (i / TR); p.y += Math.cos(time * 7 + i) * 0.25 * (i / TR);
                        q.setFromEuler(e.set(time * 4 + i, time * 3, i));
                        sc.setScalar((1.5 - (i / TR) * 1.35) * (0.5 + f * 0.5));
                        trail.setMatrixAt(i, m4.compose(p, q, sc));
                    }
                    trail.instanceMatrix.needsUpdate = true;
                    sd.forEach((d, i) => {
                        const c = ((time * d.v + d.ph) % 1);
                        p.set(d.x + 18 - c * 18, 40 - c * 44, d.z);
                        q.setFromEuler(e.set(0, 0, -0.8));
                        sc.set(0.25, 2.2, 0.25);
                        smalls.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    smalls.instanceMatrix.needsUpdate = true;
                }
            };
        },

        // 마지막 기관사: 끝없는 철로와 빛나는 터널 문, 저 멀리서 기관차가 헤드라이트를 켜고 달려와 별과 부딪힘
        lastConductor({ g, colors }) {
            const pick = i => colors[i % colors.length];
            const N = 150;
            const ties = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 0.9 }), N);
            const rails = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0xc8ccd8, metalness: 0.85, roughness: 0.2, emissive: colors[0], emissiveIntensity: 0.25 }), 2);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), e = new THREE.Euler();
            for (let i = 0; i < N; i++) ties.setMatrixAt(i, m4.compose(p.set(0, 0.6, 12 - i * 1.0), q, sc.set(2.8, 0.2, 0.45)));
            rails.setMatrixAt(0, m4.compose(p.set(-0.85, 0.78, -63), q, sc.set(0.15, 0.18, 150)));
            rails.setMatrixAt(1, m4.compose(p.set(0.85, 0.78, -63), q, sc.set(0.15, 0.18, 150)));
            g.add(ties, rails);
            const arches = [];
            for (let i = 0; i < 12; i++) {
                const a = new THREE.Group();
                for (const [w, h, x, y] of [[6.4, 0.3, 0, 7.4], [0.3, 7, 3.1, 3.9], [0.3, 7, -3.1, 3.9]]) {
                    const b = new THREE.Mesh(BOX, glowMat(i % 2 ? colors[0] : colors[2] || colors[0], 0.9)); b.scale.set(w, h, 0.3); b.position.set(x, y, 0); a.add(b);
                }
                a.position.z = -6 - i * 10;
                g.add(a); arches.push(a);
            }
            const loco = buildLocomotive(kit, pick);
            loco.g.scale.setScalar(1.25);
            g.add(loco.g);
            g.rotation.y = 0.5;   // 비스듬히 봐서 기관차 옆모습까지 보이게
            const PUFF = 24;
            const puffs = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#d9dce6'), 0.35), PUFF);
            g.add(puffs);
            return {
                hideStar: true, bloom: 0.55, noPillars: true,
                update(time, phase, k) {
                    const vis = phase === 'build';
                    g.visible = vis;
                    if (!vis) return;
                    const f = ease.inOut(clamp01(k / 0.98));
                    loco.g.position.set(0, 0.35, THREE.MathUtils.lerp(-120, -8, f));
                    const ang = -time * (6 + f * 30);
                    loco.wheels.forEach(w => { w.rotation.x = ang; });
                    loco.rods.forEach(r => { r.position.y = r.userData.y + Math.sin(ang) * 0.3; r.position.z = r.userData.z + Math.cos(ang) * 0.3; });
                    arches.forEach((a, i) => {
                        const on = Math.sin(time * 6 - i * 0.7) > 0;
                        a.children.forEach(c => { c.material.opacity = (on ? 0.5 : 0.18) * (0.4 + k * 0.6); });
                    });
                    for (let i = 0; i < PUFF; i++) {
                        const c = (time * 1.2 + i / PUFF) % 1;
                        p.set(Math.sin(i * 3.1) * c * 1.5, loco.g.position.y + 5 + c * 4, loco.g.position.z + 2.4 - c * (6 + f * 30));
                        q.setFromEuler(e.set(i, c * 3, 0));
                        sc.setScalar(0.6 + c * 2.2);
                        puffs.setMatrixAt(i, m4.compose(p, q, sc));
                    }
                    puffs.instanceMatrix.needsUpdate = true;
                }
            };
        },

        // 절대여제: 황금 계단이 한 칸씩 솟아 별까지 이어지고, 거대한 왕관이 내려와 별에 씌워짐
        empress({ g, colors }) {
            const gold = new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0xffb800, emissiveIntensity: 0.6, roughness: 0.4 });
            const steps = Array.from({ length: 9 }, (_, i) => {
                const st = new THREE.Mesh(BOX, gold);
                st.scale.set(3.2 - i * 0.12, 0.3, 1.1);
                st.position.set(0, -1 + i * 0.5, 9 - i * 1.1);
                g.add(st); return st;
            });
            const crown = new THREE.Group();
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                const side = new THREE.Mesh(BOX, gold); side.scale.set(2.2, 0.4, 0.1);
                side.position.set(Math.sin(a) * 1.05, 0, Math.cos(a) * 1.05); side.rotation.y = a; crown.add(side);
                const sp = new THREE.Mesh(BOX, gold); sp.scale.set(0.2, 0.8, 0.1);
                sp.position.set(Math.sin(a) * 1.05, 0.55, Math.cos(a) * 1.05); sp.rotation.y = a; crown.add(sp);
                const gem = new THREE.Mesh(BOX, glowMat(colors[0], 1)); gem.scale.setScalar(0.2); gem.position.copy(sp.position); gem.position.y += 0.5; crown.add(gem);
            }
            g.add(crown);
            return {
                update(time, phase, k) {
                    const vis = phase === 'build';
                    steps.forEach((st, i) => {
                        st.visible = vis && k > i / 12;
                        const rise = clamp01((k - i / 12) * 6);
                        st.scale.y = 0.3 * rise + 0.001;
                    });
                    crown.visible = vis;
                    crown.position.set(0, THREE.MathUtils.lerp(15, 5.1, ease.out(k)), 0);
                    crown.rotation.y = time * (0.5 + k * 3);
                }
            };
        },

        // 흉악범: 카드 회오리가 별을 감싸고, 마지막에 거대한 실크햇이 별을 덮었다가 → 쾅, 장미 꽃잎 폭발
        phantomRose({ g, colors, star }) {
            const N = 48;
            const cards = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 }), N);
            g.add(cards);
            const data = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2, y: rand(-3, 3), r: rand(2, 4.5) }));
            const hat = new THREE.Group();
            const black = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.3 });
            const brim = new THREE.Mesh(BOX, black); brim.scale.set(5.4, 0.25, 5.0);
            const top = new THREE.Mesh(BOX, black); top.scale.set(3.4, 3.4, 3.2); top.position.y = 1.8;
            const band = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x8a0018, emissive: colors[0], emissiveIntensity: 0.6 })); band.scale.set(3.45, 0.6, 3.25); band.position.y = 0.55;
            hat.add(brim, top, band);
            hat.rotation.x = Math.PI;   // 뒤집힌 모자가 위에서 덮침
            g.add(hat);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(0.5, 0.72, 0.02);
            return {
                update(time, phase, k) {
                    const vis = phase === 'build';
                    cards.visible = vis;
                    data.forEach((d, i) => {
                        const a = d.a + time * (1 + k * 6);
                        const r = d.r * (1 - ease.in(k) * 0.6);
                        p.set(Math.cos(a) * r, 3.5 + d.y * (1 - k * 0.5), Math.sin(a) * r);
                        q.setFromEuler(e.set(time * 2 + i, -a, time + i));
                        cards.setMatrixAt(i, m4.compose(p, q, sc));
                    });
                    cards.instanceMatrix.needsUpdate = true;
                    hat.visible = vis && k > 0.72;
                    const drop = clamp01((k - 0.72) / 0.22);
                    hat.position.set(0, THREE.MathUtils.lerp(14, 5.3, ease.in(drop)), 0);
                    hat.rotation.y = time * 2;
                }
            };
        },

        // 초월자 김건우: 하늘에서 금빛 광선이 부채처럼 내려오고, 등 뒤에 거대한 네모 후광이 생김
        transcend({ g, colors }) {
            const rays = [];
            for (let i = 0; i < 9; i++) {
                const r = new THREE.Mesh(BOX, glowMat(colors[i % colors.length], 0.35));
                r.scale.set(0.12, 30, 0.12);
                r.userData.a = (i - 4) * 0.13;
                g.add(r); rays.push(r);
            }
            const halo = square(7, 0.1, glowMat(colors[0], 1)); halo.rotation.x = Math.PI / 2;
            const halo2 = square(5, 0.07, glowMat(colors[1], 1)); halo2.rotation.x = Math.PI / 2; halo2.rotation.y = Math.PI / 4;
            const haloG = new THREE.Group(); haloG.add(halo, halo2); haloG.position.set(0, 3.5, -3);
            g.add(haloG);
            return {
                update(time, phase, k) {
                    const vis = phase === 'build';
                    rays.forEach((r, i) => {
                        r.visible = vis;
                        const a = r.userData.a + Math.sin(time * 0.6 + i) * 0.04;
                        r.position.set(Math.sin(a) * 15, 3.5 + Math.cos(a) * 15, -2);
                        r.rotation.z = a;
                        r.material.opacity = 0.12 + k * 0.35;
                    });
                    haloG.visible = vis;
                    haloG.scale.setScalar(0.2 + ease.out(k) * 0.9);
                    haloG.rotation.z = time * 0.3;
                    halo2.rotation.y = Math.PI / 4 - time * 0.8;
                }
            };
        },

        // 성검의 소유자: 거대한 성검이 하늘에서 천천히 돌며 내려오다가, 터지는 순간 땅에 꽂힘
        holySword({ g, colors }) {
            const s = sword(5.6, colors[0], colors[2] || colors[1], 1.3);
            g.add(s);
            return {
                update(time, phase, k) {
                    s.visible = phase === 'build';
                    if (!s.visible) return;
                    const fall = k < 0.88 ? ease.out(k / 0.88) * 0.75 : 0.75 + ease.in((k - 0.88) / 0.12) * 0.25;
                    s.position.set(THREE.MathUtils.lerp(0, 2.25, ease.inOut(k)), THREE.MathUtils.lerp(16, -0.7, fall), THREE.MathUtils.lerp(0.5, -0.6, k));
                    s.rotation.y = time * (1 + k * 6);
                }
            };
        },

        // 곤지암병은: 별 대신 어둠. 깜빡일 때마다 유령이 점점 가까이, 마지막엔 코앞에
        haunted({ g, colors, star }) {
            const ghosts = [0, 1, 2, 3].map(() => { const gh = ghost(colors[0], 0); g.add(gh); return gh; });
            const scare = ghost(colors[0], 0);
            g.add(scare);
            let next = 0, idx = 0;
            return {
                hideStar: true,
                update(time, phase, k) {
                    star.g.visible = phase === 'build' && Math.random() < 0.15 + k * 0.3;
                    if (phase !== 'build') { ghosts.forEach(gh => (gh.visible = false)); scare.visible = false; return; }
                    if (time > next) {
                        next = time + THREE.MathUtils.lerp(1.4, 0.35, k);
                        const gh = ghosts[idx++ % ghosts.length];
                        const z = THREE.MathUtils.lerp(-8, 6, k);
                        gh.position.set(rand(-3, 3), 0, z);
                        gh.rotation.y = Math.atan2(-gh.position.x, 12 - z);
                        gh.userData.life = 0.18;
                    }
                    ghosts.forEach(gh => {
                        gh.userData.life = (gh.userData.life || 0) - 1 / 60;
                        const vis = gh.userData.life > 0;
                        gh.visible = vis;
                        gh.traverse(o => { if (o.material) o.material.opacity = vis ? 0.55 : 0; });
                    });
                    // 터지기 직전, 카메라 바로 앞에 유령
                    const near = k > 0.965;
                    scare.visible = near;
                    if (near) {
                        scare.position.set(0, camera.position.y - 4.4, camera.position.z - 4.2);
                        scare.traverse(o => { if (o.material) o.material.opacity = 0.75; });
                    }
                }
            };
        },

        // 강철검제: 사방에서 검이 날아와 별 둘레에 회전하는 검의 고리를 만듦
        steelEmperor({ g, colors }) {
            const ring = new THREE.Group();
            ring.position.set(0, 3.5, 0);
            g.add(ring);
            const blades = [];
            for (let i = 0; i < 16; i++) {
                const holder = new THREE.Group();
                const s = sword(2.2, null, colors[1], 0.3, true);
                s.rotation.z = Math.PI;
                holder.add(s);
                const a = (i / 16) * Math.PI * 2;
                holder.rotation.z = -a;
                holder.userData = { from: new THREE.Vector3(rand(-14, 14), rand(-8, 14), rand(-10, 6)), a };
                ring.add(holder); blades.push({ holder, s });
            }
            return {
                update(time, phase, k) {
                    ring.visible = phase === 'build';
                    const gather = ease.inOut(clamp01(k / 0.8));
                    ring.rotation.z = time * (0.4 + k * 4);
                    blades.forEach(({ holder, s }) => {
                        holder.position.copy(holder.userData.from).multiplyScalar(1 - gather);
                        s.position.y = THREE.MathUtils.lerp(9, 3.6, gather);
                    });
                }
            };
        },

        // 공허왕: 별빛이 전부 가운데로 빨려들고 검은 큐브 코어가 자람. 각성 단계엔 붉은 문이 열림
        voidKing({ g, colors }) {
            const core = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 }));
            const edge = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: colors[0], toneMapped: false }));
            const coreG = new THREE.Group(); coreG.add(core, edge); coreG.position.set(0, 3.5, -1.5);
            g.add(coreG);
            const cracks = [0, 1, 2, 3, 4].map(() => { const b = bolt(6, glowMat(colors[0], 1)); g.add(b); return b; });
            const gate = new THREE.Group();
            const gOuter = square(9, 0.12, glowMat(colors[0], 1)); gOuter.rotation.x = Math.PI / 2;
            const gInner = square(6.5, 0.08, glowMat(colors[1], 1)); gInner.rotation.x = Math.PI / 2;
            gate.add(gOuter, gInner); gate.position.set(0, 3.6, -4);
            g.add(gate);
            let next = 0;
            return {
                update(time, phase, k) {
                    stars.scale.setScalar(phase === 'reveal' ? 1 : 1 - (phase === 'build' ? ease.in(k) * 0.85 : 0.85));
                    coreG.visible = phase !== 'reveal';
                    const size = phase === 'build' ? 0.2 + ease.in(k) * 2.4 : 2.6 + k * 1.5;
                    core.scale.setScalar(size); edge.scale.setScalar(size * 1.02);
                    coreG.rotation.set(time * 0.7, time * 0.9, time * 0.4);
                    if (phase === 'phase2') coreG.position.set(0, 7.2, -2);
                    gate.visible = phase === 'phase2';
                    gate.scale.setScalar(0.3 + ease.out(k) * 0.8);
                    gOuter.rotation.y = time * 0.8; gInner.rotation.y = -time * 1.4;
                    if (time > next) {
                        next = time + rand(0.05, 0.2);
                        cracks.forEach(b => {
                            b.visible = phase !== 'reveal' && Math.random() < 0.3 + k * 0.5;
                            const a = rand(0, Math.PI * 2), r = size * 0.9;
                            const c = coreG.position;
                            b.reshape([c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, c.z + 0.5], [c.x + Math.cos(a) * (r + 4), c.y + Math.sin(a) * (r + 4), c.z + 0.5], 0.5);
                        });
                    }
                },
                end() { stars.scale.setScalar(1); }
            };
        },

        // 번개의 좌: 번개가 점점 잦아지며 가운데를 내리침. 각성 단계엔 등 뒤로 왕좌가 솟아오름
        thunderThrone({ g, colors }) {
            const strikes = [0, 1, 2].map(() => { const b = bolt(10, glowMat(colors[2] || colors[0], 1)); g.add(b); return { b, life: 0 }; });
            const light = new THREE.PointLight(colors[0], 0, 30, 1.2);
            light.position.set(0, 6, 3);
            g.add(light);
            const throne = new THREE.Group();
            const stone = new THREE.MeshStandardMaterial({ color: 0x1b1d2e, roughness: 0.8, emissive: colors[0], emissiveIntensity: 0 });
            for (const [x, y, z, w, h, d] of [[0, 4.6, -1.9, 3.6, 7.4, 0.5], [-2.5, 1.6, -1.1, 0.6, 1.6, 1.8], [2.5, 1.6, -1.1, 0.6, 1.6, 1.8], [0, 8.6, -1.9, 1.6, 0.9, 0.5]]) {
                const b = new THREE.Mesh(BOX, stone); b.scale.set(w, h, d); b.position.set(x, y, z); throne.add(b);
            }
            g.add(throne);
            let next = 0;
            return {
                update(time, phase, k, dt) {
                    const rate = phase === 'build' ? THREE.MathUtils.lerp(1.6, 0.18, k) : phase === 'phase2' ? 0.12 : 99;
                    if (time > next && phase !== 'reveal') {
                        next = time + rate * rand(0.6, 1.2);
                        const s = strikes.find(x => x.life <= 0) || strikes[0];
                        const tx = rand(-4, 4) * (1 - k * 0.7), tz = rand(-2, 1);
                        s.b.reshape([tx + rand(-2, 2), 18, tz], [phase === 'phase2' ? rand(-3, 3) : tx * 0.3, phase === 'build' ? 3.5 : 0, tz], 1.1);
                        s.life = 0.14;
                        light.intensity = 160;
                    }
                    strikes.forEach(s => { s.life -= dt; s.b.visible = s.life > 0 && Math.random() > 0.2; });
                    light.intensity *= Math.pow(0.0005, dt);
                    throne.visible = phase === 'phase2';
                    throne.position.y = phase === 'phase2' ? THREE.MathUtils.lerp(-9, 0, ease.out(k)) : -9;
                    stone.emissiveIntensity = Math.random() < 0.1 ? 0.6 : 0.05;
                }
            };
        }
    };

    /* =========================================================
       재생
       ========================================================= */
    let st = null;
    const api = { active: false };

    function cleanup() {
        st?.motif?.end?.();
        root.traverse(o => { if (o !== root && o.material) o.material.dispose?.(); });
        while (root.children.length) root.remove(root.children[0]);
        dummy.root.visible = true;
        floor.visible = true;
        stars.scale.setScalar(1);
        bloom.strength = st?.bloomBase ?? bloom.strength;
        camera.up.set(0, 1, 0);
        ctx.setCenter?.(0);
    }

    api.play = (aura, cfg, getTime, hooks) => new Promise(resolve => {
        if (st) { cleanup(); st.resolve(); }
        const fx = aura.fx || {};
        const colors = (fx.colors || [aura.color]).map(c => new THREE.Color(c));
        const tier = cfg.tier;
        const star = buildStar(tier, colors);
        star.g.position.set(0, 3.5, 0);
        root.add(star.g);
        const streaks = buildStreaks(colors, tier === 'MYTHIC' ? 50 : tier === 'JXS' ? 140 : 100);
        root.add(streaks.mesh);
        const floorLight = tier === 'MYTHIC' ? null : buildFloorLight(colors, tier === 'ANCIENT' ? 12 : tier === 'ABSOLUTE' ? 18 : 26);
        if (floorLight) root.add(floorLight.g);
        const motifG = new THREE.Group();
        root.add(motifG);
        const motif = MOTIFS[fx.signature]?.({ g: motifG, colors, star }) || null;

        ctx.setAura(null);
        dummy.root.visible = false;
        floor.visible = false;
        st = {
            aura, cfg, getTime, hooks, resolve, star, streaks, floorLight, motif, colors,
            stage: 0, bloomBase: bloom.strength, spin: 0, center: new THREE.Vector3(0, 3.5, 0)
        };
        bloom.strength = motif?.bloom ?? (tier === 'MYTHIC' ? 0.9 : 1.15);   // 모양이 큰 motif 는 번짐을 줄여서 형태가 보이게
        if (motif?.noPillars && floorLight) floorLight.g.visible = false;
        api.active = true;
    });

    api.update = dt => {
        if (!st) return;
        const { cfg, star, streaks, floorLight, motif, hooks } = st;
        const time = st.getTime();
        const H = cfg.hit, H2 = cfg.hit2 || cfg.hit, T = cfg.total;
        const tier = cfg.tier;

        // 장면 전환 순간들
        if (st.stage === 0 && time >= H) {
            st.stage = 1;
            ctx.flash(1.5);
            hooks.shake(tier === 'MYTHIC' ? 0.3 : 0.7);
            if (cfg.hit2) {
                // JXS 1단계: 칠흑 실루엣만 드러남
                dummy.root.visible = true;
                stageApi.setSkin({ color: '#050508', eye: '#' + st.colors[0].getHexString(), glowEyes: true, smile: false });
            } else {
                reveal();
            }
        }
        if (st.stage === 1 && cfg.hit2 && time >= H2) {
            st.stage = 2;
            ctx.flash(2);
            hooks.shake(1.1);
            reveal();
        }
        function reveal() {
            dummy.root.visible = true;
            floor.visible = true;
            ctx.setAura(st.aura, { force: true });
            st.revealAt = time;
        }

        const view = ctx.getNormalView();
        const tgt = view.target;

        if (time < H) {
            /* ---------- 1. 별이 커지며 빨라짐 ---------- */
            const p = clamp01(time / H);
            const implode = clamp01((time - (H - 0.7)) / 0.7);
            st.spin += dt * (0.5 + p * p * 14);
            star.g.visible = !motif?.hideStar;
            star.g.rotation.z = st.spin;
            star.layers.forEach((l, i) => { l.rotation.z = (i % 2 ? -1 : 1) * st.spin * (0.4 + i * 0.3); });
            const grow = 0.15 + ease.in(p) * (tier === 'MYTHIC' ? 1.1 : 1.5);
            star.g.scale.setScalar(grow * (1 - ease.in(implode)) + 0.001);
            star.core.scale.setScalar(0.32 + Math.sin(time * 18) * 0.05 * p);
            if (tier === 'JXS') {
                star.layers.forEach(l => { l.position.set(rand(-1, 1) * 0.08 * p, rand(-1, 1) * 0.08 * p, 0); });
            }
            streaks.mesh.visible = true;
            streaks.update(dt, p + implode * 2, st.center);
            floorLight?.update(clamp01((p - 0.3) / 0.6));
            motif?.update(time, 'build', p, dt);

            // 카메라: 멀리서 천천히 다가가며 살짝 기울어짐
            const d = THREE.MathUtils.lerp(26, 11, ease.inOut(p)) - implode * 2.5;
            const a = Math.sin(p * 1.2) * 0.35;
            camera.position.set(Math.sin(a) * d, 3.5 + d * 0.12, Math.cos(a) * d);
            ctx.setCenter?.(1);   // 별이 화면 정가운데에 오게
            camera.lookAt(st.center);
            camera.rotateZ(Math.sin(time * 0.5) * 0.06 + p * 0.1);
            if (p > 0.72) hooks.shake(0.02 + (p - 0.72) * 0.35);
        } else if (cfg.hit2 && time < H2) {
            /* ---------- JXS 2. 각성 직전 (실루엣 + 더 큰 별) ---------- */
            const q = clamp01((time - H) / (H2 - H));
            const implode = clamp01((time - (H2 - 0.6)) / 0.6);
            st.spin += dt * (2 + q * q * 18);
            star.g.visible = true;
            star.g.position.set(0, 3.6, -3.5);
            star.g.rotation.z = -st.spin;
            star.layers.forEach((l, i) => { l.rotation.z = (i % 2 ? -1 : 1) * st.spin * (0.5 + i * 0.4); l.position.set(rand(-1, 1) * 0.15, rand(-1, 1) * 0.15, 0); });
            star.g.scale.setScalar((1.4 + ease.in(q) * 1.6) * (1 - ease.in(implode)) + 0.001);
            streaks.update(dt, 0.6 + q * 1.5 + implode * 2, st.center2 || (st.center2 = new THREE.Vector3(0, 3.6, -3.5)));
            floorLight?.update(Math.max(0, 1 - q * 3));
            motif?.update(time, 'phase2', q, dt);
            // 카메라: 실루엣 발밑에서 얼굴 쪽으로 천천히 돌며 올라감
            const a = THREE.MathUtils.lerp(-0.9, 0.5, ease.inOut(q));
            const d = THREE.MathUtils.lerp(view.dist * 0.6, view.dist * 0.85, q);
            camera.position.set(Math.sin(a) * d, THREE.MathUtils.lerp(0.8, tgt.y + 1.5, ease.inOut(q)), Math.cos(a) * d);
            ctx.setCenter?.(1);
            camera.lookAt(0, tgt.y + 0.4, 0);
            camera.rotateZ(Math.sin(time * 0.8) * 0.05);
            hooks.shake(0.03 + q * 0.12);
        } else {
            /* ---------- 3. 공개: 아래에서 올려다보다가 평소 화면으로 ---------- */
            const r = clamp01((time - H2) / Math.max(0.5, T - H2));
            star.g.visible = false;
            streaks.mesh.visible = false;
            floorLight?.update(Math.max(0, 1 - r * 4));
            motif?.update(time, 'reveal', r, dt);
            const k = ease.inOut(clamp01(r / 0.85));
            const startD = view.dist * 0.78;
            const d = THREE.MathUtils.lerp(startD, view.dist, k);
            const a = THREE.MathUtils.lerp(-1.1, 0, k) + (tier === 'MYTHIC' ? 0 : Math.sin(time * 0.4) * 0.05 * (1 - k));
            const y = THREE.MathUtils.lerp(tgt.y - 1.6, tgt.y + view.dist * 0.14, k);
            camera.position.set(Math.sin(a) * d, y, Math.cos(a) * d);
            ctx.setCenter?.(1 - k);   // 평소 화면 구도로 자연스럽게 돌아감
            camera.lookAt(tgt);
            bloom.strength = THREE.MathUtils.lerp(1.3, st.bloomBase, k);
        }

        if (time >= T) {
            const done = st.resolve;
            cleanup();
            st = null;
            api.active = false;
            done();
        }
    };

    // 건너뛰기 등으로 즉시 끝낼 때
    api.stop = () => {
        if (!st) return;
        const done = st.resolve;
        if (!st.revealAt) { dummy.root.visible = true; floor.visible = true; ctx.setAura(st.aura, { force: true }); }
        cleanup();
        st = null;
        api.active = false;
        done();
    };

    return api;
}
