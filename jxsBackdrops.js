/* =========================================================
   🌌 JXS 전용 배경 (jxsBackdrops.js)
   예전엔 모든 JXS 뒤에 같은 '거대 분신 + 하늘 문장 + 빛기둥'이 깔려서 다 비슷해 보였음
   → 칭호마다 완전히 다른 '세계'를 뒤에 깔아 줌
   - 전부 멀리(z -12 ~ -30) 있는 큰 장면. far.userData.noFit = true 라 카메라 맞춤에서 빠짐
   - 파티클은 InstancedMesh 로 → 효과 양 설정(applyFxBudget)에 맞춰 자동으로 줄어듦
   ========================================================= */

function setup({ group, kit }) {
    const { THREE, BOX } = kit;
    const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
    const box = (m, w, h, d, x, y, z, parent = far) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); parent.add(b); return b; };
    const std = (color, emissive = 0, ei = 0, rough = 0.8) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, roughness: rough, flatShading: true });
    return { far, box, std };
}
// 카메라를 바라보는 둥근 원판 (달, 해, 블랙홀)
function disc(kit, r, mat, seg = 40) {
    const m = new kit.THREE.Mesh(new kit.THREE.CircleGeometry(r, seg), mat);
    return m;
}
function inst(kit, n, mat, parent) {
    const m = new kit.THREE.InstancedMesh(kit.BOX, mat, n);
    m.instanceMatrix.setUsage(kit.THREE.DynamicDrawUsage);
    parent.add(m);
    return m;
}
function put(kit, m, i, x, y, z, s, rx = 0, ry = 0, rz = 0, sy = s, sz = s) {
    const { TMP } = kit;
    TMP.p.set(x, y, z); TMP.e.set(rx, ry, rz); TMP.q.setFromEuler(TMP.e); TMP.sc.set(s, sy, sz);
    m.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
}

export const JXS_BACKDROPS = {

    /* 공허왕 — 뒤에서 모든 걸 빨아들이는 거대한 블랙홀 */
    voidKing(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far } = setup(ctx);
        const hole = new THREE.Group(); hole.position.set(0, 11, -20); far.add(hole);
        const core = disc(kit, 3.6, new THREE.MeshBasicMaterial({ color: 0x000000 })); core.position.z = 0.2; hole.add(core);
        const halo = disc(kit, 4.6, glowMat(pick(0), 0.45)); hole.add(halo);
        const halo2 = disc(kit, 7.5, glowMat(pick(1), 0.08)); halo2.position.z = -0.2; hole.add(halo2);
        // 강착 원반: 기울어진 원판 위를 도는 블록들 (안쪽은 하얗게 뜨겁고 바깥은 붉게)
        const disk = new THREE.Group(); disk.rotation.x = 1.25; disk.rotation.z = 0.25; hole.add(disk);
        const N = 220;
        const ring = inst(kit, N, glowMat(0xffffff, 0.9), disk);
        const hot = new THREE.Color(0xfff0d0), mid = new THREE.Color(pick(2)), cold = new THREE.Color(pick(0)), c = new THREE.Color();
        const P = Array.from({ length: N }, (_, i) => {
            const r = 4.4 + Math.pow(Math.random(), 1.6) * 7;
            const k = (r - 4.4) / 7;
            ring.setColorAt(i, c.copy(hot).lerp(mid, Math.min(1, k * 2)).lerp(cold, Math.max(0, k * 2 - 1)));
            return { r, a: rand(0, 6.28), y: rand(-0.25, 0.25), s: rand(0.12, 0.34) };
        });
        // 빨려 들어가는 잔해
        const D = 40, debris = inst(kit, D, glowMat(pick(1), 0.8), far);
        const dd = Array.from({ length: D }, () => ({ a: rand(0, 6.28), ph: Math.random() }));
        tick(t => {
            P.forEach((p, i) => { const a = p.a + t * (2.4 / p.r); put(kit, ring, i, Math.cos(a) * p.r, p.y, Math.sin(a) * p.r, p.s, 0, -a, 0); });
            ring.instanceMatrix.needsUpdate = true;
            dd.forEach((d, i) => {
                const k = (t * 0.12 + d.ph) % 1, r = 20 * (1 - k) + 4;
                const a = d.a + k * 5;
                put(kit, debris, i, Math.cos(a) * r, 11 + Math.sin(a) * r * 0.45, -19, 0.18 + (1 - k) * 0.35, t, t * 1.3, 0);
            });
            debris.instanceMatrix.needsUpdate = true;
            halo.scale.setScalar(1 + Math.sin(t * 1.7) * 0.04);
            halo2.material.opacity = 0.06 + Math.sin(t * 0.9) * 0.03;
        });
    },

    /* 흉악범 — 보름달 아래 밤의 도시, 수색 탐조등과 흩날리는 예고장 */
    phantomRose(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const moon = disc(kit, 6, new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false, transparent: true, opacity: 0.9 })); moon.position.set(6, 13, -30); far.add(moon);
        const moonGlow = disc(kit, 9, glowMat(0xffd9a0, 0.12)); moonGlow.position.set(6, 13, -30.2); far.add(moonGlow);
        // 빌딩 실루엣 + 노란 창문
        const bld = std(0x0b0912), win = glowMat(0xffd96a, 0.75);
        const W = inst(kit, 120, win, far);
        let wi = 0;
        for (let i = 0; i < 18; i++) {
            const x = -26 + i * 3 + rand(-0.6, 0.6), h = rand(4, 13), w = rand(2, 3.2);
            box(bld, w, h, 2, x, h / 2, -22 + rand(-2, 1));
            if (i === 9) { box(bld, 1, 5, 1, x, h + 2.5, -22); box(bld, 0.25, 3, 0.25, x, h + 6, -22); }   // 시계탑 첨탑
            for (let k = 0; k < 7 && wi < 120; k++) if (Math.random() < 0.7) put(kit, W, wi++, x + rand(-w / 2 + 0.4, w / 2 - 0.4), rand(1, h - 0.6), -20.9, 0.3, 0, 0, 0, 0.42, 0.05);
        }
        W.count = wi;
        // 탐조등 두 줄기가 하늘을 쓸고 다님
        const beams = [-1, 1].map(s => {
            const g = new THREE.Group(); g.position.set(s * 10, 0, -18); far.add(g);
            box(glowMat(0xfff2c0, 0.09), 1.6, 40, 1.6, 0, 20, 0, g);
            box(glowMat(0xfff2c0, 0.18), 0.5, 40, 0.5, 0, 20, 0, g);
            return { g, s };
        });
        // 하늘에서 떨어지는 예고장 (하얀 카드 + 붉은 장미 문양)
        const N = 36, cards = inst(kit, N, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), far);
        const marks = inst(kit, N, glowMat(pick(0), 1), far);
        const cd = Array.from({ length: N }, () => ({ x: rand(-16, 16), z: rand(-16, -6), ph: Math.random(), sp: rand(0.05, 0.1), r: rand(0, 6) }));
        tick(t => {
            beams.forEach(({ g, s }, i) => { g.rotation.z = s * (0.35 + Math.sin(t * 0.6 + i * 2) * 0.3); g.rotation.x = Math.sin(t * 0.4 + i) * 0.15; });
            cd.forEach((c, i) => {
                const k = (t * c.sp + c.ph) % 1, y = 20 - k * 22;
                const x = c.x + Math.sin(t * 1.3 + c.r) * 1.2;
                const rx = t * 2 + c.r, rz = Math.sin(t * 3 + c.r) * 0.8;
                put(kit, cards, i, x, y, c.z, 0.55, rx, c.r, rz, 0.8, 0.02);
                put(kit, marks, i, x, y, c.z, 0.2, rx, c.r, rz, 0.2, 0.04);
            });
            cards.instanceMatrix.needsUpdate = true; marks.instanceMatrix.needsUpdate = true;
            moonGlow.material.opacity = 0.1 + Math.sin(t * 0.5) * 0.03;
        });
    },

    /* 번개의 좌 — 하늘을 뒤덮은 먹구름, 그 속의 거대한 옥좌, 쉴 새 없이 내리꽂는 낙뢰 */
    thunderThrone(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        // 먹구름 천장 (머리 위를 낮게 덮음)
        const cloudM = std(0x1a1d2e, pick(1), 0.05, 1);
        const clouds = [];
        for (let i = 0; i < 46; i++) {
            const c = box(cloudM, rand(3, 7), rand(1.4, 3), rand(3, 6), rand(-22, 22), rand(10.5, 14.5), rand(-26, -10));
            c.rotation.y = rand(0, 1); clouds.push(c);
        }
        // 쏟아지는 빗줄기
        const RN = 140, rain = inst(kit, RN, glowMat(0xbfe8ff, 0.45), far);
        const rp = Array.from({ length: RN }, () => [rand(-18, 18), rand(-24, -6), Math.random(), rand(0.9, 1.4)]);
        const edge = glowMat(pick(0), 0.5);
        // 구름 속에서 빛나는 번개 문장 (번쩍일 때만 보임)
        const rune = new THREE.Group(); rune.position.set(0, 12, -20); far.add(rune);
        const runeM = glowMat(pick(0), 0.0);
        [[0, 0, 0.6, 6, 0.3], [1.4, 1.2, 0.5, 3.4, -0.6], [-1.4, -1.2, 0.5, 3.4, -0.6]].forEach(([x, y, w, h, rz]) => { box(runeM, w, h, 0.1, x, y, 0, rune).rotation.z = rz; });
        const sigil = box(glowMat(0xffffff, 0.0), 0.1, 0.1, 0.1, 0, 0, 0, rune);
        // 낙뢰: 지그재그 선분들 (매번 모양이 바뀜)
        const bolts = [0, 1, 2].map(() => { const g = kit.bolt(10, glowMat(0xe8ffff, 1)); far.add(g); return { g, next: rand(0, 2), life: 0 }; });
        let flash = 0;
        tick((t, dt) => {
            flash = Math.max(0, flash - dt * 3);
            bolts.forEach(b => {
                b.life -= dt;
                if (t > b.next) {
                    const x = rand(-12, 12), z = rand(-22, -10);
                    b.g.reshape([x + rand(-3, 3), 11.5, z], [x, 0, z], 1.4);
                    b.life = 0.18; b.next = t + rand(0.7, 2.4); flash = 1;
                }
                b.g.visible = b.life > 0 && (b.life * 40 | 0) % 2 === 0;
            });
            cloudM.emissiveIntensity = 0.05 + flash * 0.9;
            runeM.opacity = flash * 0.9;
            rp.forEach((r, i) => { const k = (t * r[3] + r[2]) % 1; put(kit, rain, i, r[0] - k * 2, 12 - k * 12, r[1], 0.05, 0, 0, 0.15, 1.3, 0.05); });
            rain.instanceMatrix.needsUpdate = true;
            clouds.forEach((c, i) => { c.position.x += Math.sin(t * 0.2 + i) * 0.004; });
        });
    },

    /* 샌즈 — 노을빛 심판의 복도: 끝없이 늘어선 기둥, 창으로 쏟아지는 빛, 바닥에서 솟는 뼈 */
    sans(ctx) {
        const { kit, tick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const gold = std(0xc9a24a, 0x3a2a08, 0.4, 0.6);
        // 양옆으로 멀어지는 기둥 줄
        for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
            const z = -8 - i * 4.5, x = s * (9 + i * 0.4);
            box(gold, 1.6, 18, 1.6, x, 9, z); box(gold, 2.4, 0.8, 2.4, x, 0.4, z); box(gold, 2.4, 0.8, 2.4, x, 17.6, z);
        }
        // 뒤쪽 큰 창 (스테인드글라스처럼 칸칸이)
        const glass = glowMat(0xffd27a, 0.5);
        for (const x of [-6, 0, 6]) {
            box(std(0x7a5a20), 4.4, 9.4, 0.6, x, 9, -38);
            for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) box(glass, 1.7, 1.9, 0.1, x - 0.95 + c * 1.9, 5.6 + r * 2.2, -37.6);
        }
        // 창에서 비스듬히 들어오는 빛줄기
        const shafts = [-6, 0, 6].map((x, i) => { const s = box(glowMat(0xffe0a0, 0.06), 3.6, 34, 0.4, x + 4, 8, -24); s.rotation.set(0.45, 0, -0.55); return s; });
        // 먼지
        const D = 70, dust = inst(kit, D, glowMat(0xffe7b0, 0.8), far);
        const dp = Array.from({ length: D }, () => [rand(-10, 10), rand(1, 16), rand(-30, -8), Math.random()]);
        // 바닥에서 솟아오르는 뼈 벽 (5초마다 한 줄씩 앞으로 밀려옴)
        const B = 24, bones = inst(kit, B, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), far);
        tick(t => {
            shafts.forEach((s, i) => { s.material.opacity = 0.025 + Math.max(0, Math.sin(t * 0.5 + i * 1.3)) * 0.03; });
            dp.forEach((p, i) => put(kit, dust, i, p[0] + Math.sin(t * 0.3 + i) * 0.6, p[1] + Math.sin(t * 0.5 + p[3] * 6) * 0.4, p[2], 0.07));
            dust.instanceMatrix.needsUpdate = true;
            const k = (t % 5) / 5;
            const z = -28 + k * 18, up = Math.sin(Math.min(1, k * 1.4) * Math.PI);
            for (let i = 0; i < B; i++) {
                const x = -11.5 + i;
                const h = (1.2 + ((i * 7) % 5) * 0.5) * Math.max(0, up);
                put(kit, bones, i, x, h / 2, z, 0.32, 0, 0, 0, Math.max(0.01, h), 0.32);
            }
            bones.instanceMatrix.needsUpdate = true;
        });
    },

    /* 창조주 — 세상의 첫 빛: 무지개 부채살, 태어나는 성운, 궤도를 그리며 뭉쳐지는 행성들 */
    creator(ctx) {
        const { kit, tick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box } = setup(ctx);
        const prism = [0xff5a8a, 0xffb02e, 0xffe14d, 0x7dff6a, 0x5ab0ff, 0xb26bff];
        // 위에서 펼쳐지는 무지개 부채살
        const fan = new THREE.Group(); fan.position.set(0, 20, -26); far.add(fan);
        const rays = prism.map((c, i) => { const r = box(glowMat(c, 0.1), 1.6, 16, 0.1, 0, -8, 0, new THREE.Group()); const pv = r.parent; pv.rotation.z = (i - 2.5) * 0.16; fan.add(pv); return r; });
        // 성운 (크고 옅은 색 덩어리)
        const neb = [];
        for (let i = 0; i < 9; i++) { const n = box(glowMat(prism[i % 6], 0.05), rand(6, 11), rand(3, 6), 0.1, rand(-18, 18), rand(6, 16), -30 + i * 0.1); n.rotation.z = rand(-0.6, 0.6); neb.push(n); }
        // 궤도를 도는 행성들 (블록 덩어리)
        const sys = new THREE.Group(); sys.position.set(0, 9, -22); sys.rotation.x = 1.1; far.add(sys);
        const planets = [5, 8, 11.5].map((r, i) => {
            const orbit = kit.square(r * 2, 0.06, glowMat(0xffffff, 0.18)); sys.add(orbit);
            const p = new THREE.Group(); sys.add(p);
            const m = new THREE.MeshStandardMaterial({ color: prism[i * 2 + 1], emissive: prism[i * 2 + 1], emissiveIntensity: 0.35, roughness: 0.5 });
            const bits = [];
            for (let k = 0; k < 14; k++) { const b = box(m, 0.55, 0.55, 0.55, rand(-0.7, 0.7), rand(-0.7, 0.7), rand(-0.7, 0.7), p); b.userData.home = b.position.clone(); bits.push(b); }
            return { p, r, bits, orbit };
        });
        tick(t => {
            fan.rotation.z = Math.sin(t * 0.2) * 0.12;
            rays.forEach((r, i) => { r.material.opacity = 0.05 + Math.max(0, Math.sin(t * 0.8 + i * 0.9)) * 0.07; });
            neb.forEach((n, i) => { n.material.opacity = 0.035 + Math.sin(t * 0.4 + i) * 0.02; n.rotation.z += 0.0008; });
            planets.forEach(({ p, r, bits, orbit }, i) => {
                const a = t * (0.5 / (i + 1)) + i * 2;
                p.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
                p.rotation.set(t, t * 0.7, 0);
                orbit.rotation.set(Math.PI / 2, 0, t * 0.02);
                const k = Math.min(1, ((t + i * 3) % 10) / 3);   // 흩어진 조각이 뭉쳐 행성이 됨
                bits.forEach(b => b.position.copy(b.userData.home).multiplyScalar(1 + (1 - k) * 4));
            });
        });
    },

    /* 어드민 — 세계의 소스 코드: 흘러내리는 데이터 벽, 떠 있는 창들, 회전하는 와이어 큐브 */
    admin(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box } = setup(ctx);
        // 데이터 벽 (세로 줄마다 블록이 흘러내림)
        const COLS = 34, PER = 7, N = COLS * PER;
        const rain = inst(kit, N, glowMat(0xffffff, 0.85), far);
        const cA = new THREE.Color(pick(0)), cB = new THREE.Color(0xffffff), cc = new THREE.Color();
        const cols = Array.from({ length: COLS }, (_, i) => ({ x: -17 + i, sp: rand(2, 5), ph: rand(0, 20) }));
        for (let i = 0; i < N; i++) rain.setColorAt(i, cc.copy(cA).lerp(cB, (i % PER) === 0 ? 0.8 : 0.1));
        box(glowMat(pick(0), 0.04), 36, 22, 0.1, 0, 10, -28.5);   // 벽 바탕
        // 관리자 창들 (제목줄 + 테두리)
        const wins = [[-9, 13, -20, 7, 4.5], [9, 11, -19, 6, 4], [0, 17, -24, 9, 3.5]].map(([x, y, z, w, h], i) => {
            const g = new THREE.Group(); g.position.set(x, y, z); far.add(g);
            const fr = glowMat(i === 2 ? pick(2) : pick(0), 0.7);
            box(fr, w, 0.12, 0.05, 0, h / 2, 0, g); box(fr, w, 0.12, 0.05, 0, -h / 2, 0, g);
            box(fr, 0.12, h, 0.05, -w / 2, 0, 0, g); box(fr, 0.12, h, 0.05, w / 2, 0, 0, g);
            box(glowMat(i === 2 ? pick(2) : pick(0), 0.35), w, 0.6, 0.04, 0, h / 2 - 0.3, 0, g);
            box(glowMat(0x000000, 0.0), w, h, 0.02, 0, 0, -0.05, g);
            for (let r = 0; r < 4; r++) box(glowMat(0xffffff, 0.35), rand(w * 0.3, w * 0.8), 0.12, 0.04, -w * 0.1, h / 2 - 1.2 - r * 0.7, 0, g);
            return g;
        });
        // 회전하는 거대 와이어 큐브 (규칙 그 자체)
        const cube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7, 7, 7)), new THREE.LineBasicMaterial({ color: pick(0), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
        cube.position.set(0, 9, -22); far.add(cube);
        const inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.5, 3.5, 3.5)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
        cube.add(inner);
        tick(t => {
            let i = 0;
            cols.forEach(c => {
                const head = 22 - ((t * c.sp + c.ph) % 26);
                for (let k = 0; k < PER; k++) put(kit, rain, i++, c.x, head + k * 0.75, -28, 0.42, 0, 0, 0, 0.42, 0.05);
            });
            rain.instanceMatrix.needsUpdate = true;
            cube.rotation.set(t * 0.3, t * 0.45, 0);
            inner.rotation.set(-t * 0.8, 0, t * 0.6);
            wins.forEach((g, k) => { g.position.y += Math.sin(t * 0.8 + k * 2) * 0.006; });
        });
    },

    /* 호박 대왕 — 주황 달 아래 유령의 성, 성 주위를 맴도는 박쥐 떼 */
    pumpkinKing(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const moon = disc(kit, 7, new THREE.MeshBasicMaterial({ color: 0xff9a3a, toneMapped: false, transparent: true, opacity: 0.85 })); moon.position.set(-7, 14, -34); far.add(moon);
        const castleM = std(0x140a1e), win = glowMat(pick(0), 0.85);
        const castle = new THREE.Group(); castle.position.set(4, 0, -28); far.add(castle);
        // 성벽 + 탑 + 뾰족 지붕
        box(castleM, 18, 6, 3, 0, 3, 0, castle);
        [[-8, 12], [-3.5, 15], [2.5, 18], [8, 13]].forEach(([x, h]) => {
            box(castleM, 2.6, h, 2.6, x, h / 2, 0.5, castle);
            for (let k = 0; k < 4; k++) { const r = box(castleM, 3 - k * 0.7, 0.7, 3 - k * 0.7, x, h + 0.35 + k * 0.7, 0.5, castle); r.rotation.y = Math.PI / 4; }
            for (let y = 3; y < h - 1; y += 2.6) box(win, 0.5, 0.9, 0.1, x, y, 1.85, castle);
        });
        for (let x = -8; x <= 8; x += 2) box(castleM, 1, 1, 3, x, 6.5, 0, castle);   // 성가퀴
        // 박쥐 떼 (날개 두 장씩)
        const N = 26, wingM = new THREE.MeshBasicMaterial({ color: 0x0a0610 });
        const wl = inst(kit, N, wingM, far), wr = inst(kit, N, wingM, far), bd = inst(kit, N, wingM, far);
        const bats = Array.from({ length: N }, () => ({ r: rand(6, 14), y: rand(8, 18), sp: rand(0.3, 0.7) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6.28) }));
        tick(t => {
            bats.forEach((b, i) => {
                const a = t * b.sp + b.ph, x = 4 + Math.cos(a) * b.r, z = -26 + Math.sin(a) * b.r * 0.4, y = b.y + Math.sin(t * 2 + i) * 0.6;
                const f = Math.sin(t * 14 + i) * 0.7, ry = -a + (b.sp > 0 ? 0 : Math.PI);
                put(kit, bd, i, x, y, z, 0.3, 0, ry, 0, 0.3, 0.5);
                put(kit, wl, i, x + Math.cos(ry) * 0.45, y + f * 0.2, z - Math.sin(ry) * 0.45, 0.7, 0, ry, f, 0.05, 0.4);
                put(kit, wr, i, x - Math.cos(ry) * 0.45, y + f * 0.2, z + Math.sin(ry) * 0.45, 0.7, 0, ry, -f, 0.05, 0.4);
            });
            wl.instanceMatrix.needsUpdate = wr.instanceMatrix.needsUpdate = bd.instanceMatrix.needsUpdate = true;
            win.opacity = 0.65 + Math.sin(t * 5) * 0.15 * Math.sin(t * 1.3);
        });
    },

    /* 가장 어두운 밤 — 저승의 문: 거대한 아치, 푸른 불꽃 화로, 문 앞을 흐르는 영혼의 강 */
    hades(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const stone = std(0x10141f, pick(1), 0.05);
        const gate = new THREE.Group(); gate.position.set(0, 0, -30); far.add(gate);
        box(stone, 3, 20, 3, -9, 10, 0, gate); box(stone, 3, 20, 3, 9, 10, 0, gate);
        for (let k = 0; k < 7; k++) { const a = (k / 6) * Math.PI, b = box(stone, 3, 3, 3, Math.cos(a) * 9, 20 + Math.sin(a) * 5, 0, gate); b.rotation.z = a - Math.PI / 2; }
        const portal = box(glowMat(pick(0), 0.07), 15, 22, 0.1, 0, 11, -0.5, gate);
        // 화로 + 푸른 불꽃
        const fires = [];
        for (const x of [-13, 13, -5.5, 5.5]) {
            box(stone, 1.6, 4, 1.6, x, 2, -24); box(stone, 2.4, 0.6, 2.4, x, 4.3, -24);
            const f = inst(kit, 10, glowMat(pick(0), 0.85), far); fires.push({ f, x, ph: rand(0, 6) });
        }
        // 사슬 (위에서 늘어짐)
        const chainM = std(0x3a3f50, 0, 0, 0.5);
        for (const x of [-15, -11, 11, 15]) for (let k = 0; k < 9; k++) { const l = box(chainM, 0.35, 0.8, 0.12, x, 20 - k * 0.75, -20); l.rotation.y = k % 2 ? Math.PI / 2 : 0; }
        // 영혼의 강: 옆으로 흘러가는 빛 조각
        const N = 140, river = inst(kit, N, glowMat(0xffffff, 0.7), far);
        const cA = new THREE.Color(pick(0)), cB = new THREE.Color(pick(1)), cc = new THREE.Color();
        const rv = Array.from({ length: N }, (_, i) => { river.setColorAt(i, cc.copy(cA).lerp(cB, Math.random())); return { x: rand(-30, 30), z: rand(-19, -13), y: rand(0.1, 1.2), sp: rand(1.5, 3.5), s: rand(0.12, 0.3) }; });
        tick(t => {
            portal.material.opacity = 0.05 + Math.sin(t * 0.8) * 0.03;
            fires.forEach(({ f, x, ph }) => {
                for (let i = 0; i < 10; i++) { const k = ((t * 1.4 + i / 10 + ph) % 1); put(kit, f, i, x + Math.sin(t * 6 + i) * 0.3 * (1 - k), 4.8 + k * 3, -24, 0.55 * (1 - k) + 0.08, t + i, t, 0); }
                f.instanceMatrix.needsUpdate = true;
            });
            rv.forEach((p, i) => { const x = ((p.x + t * p.sp + 30) % 60) - 30; put(kit, river, i, x, p.y + Math.sin(t * 2 + x * 0.4) * 0.25, p.z, p.s, 0, 0, 0, p.s * 0.6, p.s); });
            river.instanceMatrix.needsUpdate = true;
        });
    },

    /* 🆕 세계수 공병은 — 하늘을 받치는 거대한 나무, 바닥을 덮는 빛나는 뿌리, 가지에 매달린 세계들 */
    worldTree(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const bark = std(0x4a3220, 0x1a0e04, 0.2, 0.95), barkD = std(0x33220f, 0, 0, 1);
        const tree = new THREE.Group(); tree.position.set(0, 0, -22); tree.scale.setScalar(0.62); far.add(tree);
        // 줄기: 아래가 굵고 살짝 비틀린 블록 기둥
        for (let i = 0; i < 16; i++) { const w = 6 - i * 0.22; const b = box(i % 2 ? bark : barkD, w, 1.4, w, Math.sin(i * 0.5) * 0.5, 0.7 + i * 1.4, 0, tree); b.rotation.y = i * 0.12; }
        // 가지
        const branches = [[-1, 15, 0.7], [1, 16.5, 0.6], [-1, 19, 0.45], [1, 20, 0.5], [0, 22, 0]];
        branches.forEach(([s, y, rz]) => { if (!s) return; const b = box(bark, 9, 1.2, 1.4, s * 5, y, 0, tree); b.rotation.z = s * rz; });
        // 잎 덩어리 (빛나는 초록)
        const leafCol = [pick(0), pick(2), 0x2fa84a];
        const leaves = [];
        for (let i = 0; i < 34; i++) {
            const a = rand(0, 6.28), r = rand(2, 13);
            const l = box(new THREE.MeshStandardMaterial({ color: leafCol[i % 3], emissive: leafCol[i % 3], emissiveIntensity: 0.35, roughness: 0.7, flatShading: true }), rand(2.2, 4), rand(1.6, 3), rand(2.2, 4), Math.cos(a) * r, 22 + rand(-2, 4) + (13 - r) * 0.25, Math.sin(a) * r * 0.4, tree);
            leaves.push(l);
        }
        // 가지에 매달린 세 세계 (빛 구슬)
        const worlds = [[-9, 14.5, pick(1)], [9.5, 15.5, 0x7ae8ff], [-3, 17, 0xffe27a]].map(([x, y, c]) => {
            const g = new THREE.Group(); g.position.set(x, y, 1.5); tree.add(g);
            box(glowMat(0xffffff, 0.4), 0.06, 2.2, 0.06, 0, 1.1, 0, g);
            const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.8, flatShading: true }));
            g.add(orb);
            const halo = kit.square(3, 0.06, glowMat(c, 0.5)); g.add(halo);
            return { g, orb, halo };
        });
        // 바닥까지 뻗은 빛나는 뿌리 (앞으로 흘러오는 빛)
        const rootG = new THREE.Group(); far.add(rootG);
        const roots = [];
        for (let i = 0; i < 9; i++) {
            const a = Math.PI * (0.08 + (i / 8) * 0.84);
            const len = rand(14, 22);
            const r = box(barkD, 0.7, 0.35, len, Math.cos(a) * len * 0.5, 0.18, -22 + Math.sin(a) * len * 0.5, rootG);
            r.rotation.y = Math.PI / 2 - a;
            const glow = box(glowMat(pick(0), 0.6), 0.25, 0.4, 1.6, 0, 0.2, 0, rootG);
            roots.push({ a, len, glow, ph: Math.random() });
        }
        // 떨어지는 빛 잎
        const N = 60, fall = inst(kit, N, glowMat(pick(0), 0.85), far);
        const fp = Array.from({ length: N }, () => ({ x: rand(-16, 16), z: rand(-26, -8), ph: Math.random(), sp: rand(0.04, 0.09) }));
        tick(t => {
            leaves.forEach((l, i) => { l.rotation.y = Math.sin(t * 0.5 + i) * 0.08; });
            worlds.forEach(({ g, orb, halo }, i) => { g.rotation.z = Math.sin(t * 0.7 + i * 2) * 0.12; orb.rotation.set(t * 0.4, t * 0.6, 0); halo.rotation.set(Math.PI / 2, t * (i % 2 ? 0.6 : -0.6), 0); });
            roots.forEach(r => {   // 뿌리를 타고 빛이 앞으로 흘러옴
                const k = (t * 0.25 + r.ph) % 1, d = r.len * (1 - k);
                r.glow.position.set(Math.cos(r.a) * d, 0.3, -22 + Math.sin(r.a) * d);
                r.glow.rotation.y = Math.PI / 2 - r.a;
                r.glow.material.opacity = 0.7 * Math.sin(k * Math.PI);
            });
            fp.forEach((p, i) => { const k = (t * p.sp + p.ph) % 1; put(kit, fall, i, p.x + Math.sin(t + i) * 1.5, 24 - k * 25, p.z, 0.28, t + i, t * 0.7, Math.sin(t * 2 + i)); });
            fall.instanceMatrix.needsUpdate = true;
        });
    },
    /* 일식 — 지평선 위에 뜬 거대한 검은 태양, 하늘을 뒤덮는 코로나와 홍염, 어둠 속에 떠오르는 별, 타며 떨어지는 재 */
    eclipse(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box } = setup(ctx);
        const sun = new THREE.Group(); sun.position.set(0, 13, -26); far.add(sun);
        const core = disc(kit, 6, new THREE.MeshBasicMaterial({ color: 0x000000 })); core.position.z = 0.2; sun.add(core);
        const ring = disc(kit, 6.6, glowMat(0xffe0a0, 0.9)); sun.add(ring);
        const glowA = disc(kit, 10, glowMat(pick(0), 0.25)); glowA.position.z = -0.2; sun.add(glowA);
        const glowB = disc(kit, 16, glowMat(pick(1), 0.08)); glowB.position.z = -0.4; sun.add(glowB);
        const R = 70, rays = inst(kit, R, glowMat(0xffc27a, 0.5), sun);
        const rp = Array.from({ length: R }, (_, i) => ({ a: i / R * Math.PI * 2 + rand(-0.03, 0.03), l: rand(2, 6), ph: rand(0, 6) }));
        const F = 4, flares = Array.from({ length: F }, (_, k) => inst(kit, 16, glowMat(pick(1), 0.85), sun));
        const S2 = 90, stars = inst(kit, S2, glowMat(0xffffff, 0.9), far);
        const sp = Array.from({ length: S2 }, () => ({ x: rand(-40, 40), y: rand(8, 34), z: rand(-34, -22), s: rand(0.08, 0.2), ph: rand(0, 6) }));
        const A = 50, ash = inst(kit, A, glowMat(0xff8a3a, 0.8), far);
        const ap = Array.from({ length: A }, () => ({ x: rand(-20, 20), z: rand(-18, -6), ph: Math.random(), sp: rand(0.05, 0.12) }));
        const horizon = box(glowMat(pick(0), 0.35), 90, 0.6, 0.2, 0, 0.6, -30);
        tick(t => {
            ring.scale.setScalar(1 + Math.sin(t * 1.8) * 0.02); glowA.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06);
            rp.forEach((r, i) => { const l = r.l * (0.7 + 0.3 * Math.sin(t * 1.5 + r.ph)); put(kit, rays, i, Math.cos(r.a) * (6.6 + l / 2), Math.sin(r.a) * (6.6 + l / 2), 0, 0.12, 0, 0, r.a - Math.PI / 2, l, 0.05); });
            rays.instanceMatrix.needsUpdate = true;
            flares.forEach((f, k) => { const base = t * 0.15 + k * 1.6, ph = (t * 0.25 + k / F) % 1; for (let i = 0; i < 16; i++) { const u = i / 15, a = base + u * 0.7, h = Math.sin(u * Math.PI) * 4 * Math.sin(ph * Math.PI); put(kit, f, i, Math.cos(a) * (6.4 + h), Math.sin(a) * (6.4 + h), 0.1, 0.45 * Math.sin(ph * Math.PI) + 0.05); } f.instanceMatrix.needsUpdate = true; });
            sp.forEach((o, i) => put(kit, stars, i, o.x, o.y, o.z, o.s * (0.6 + 0.4 * Math.sin(t * 2 + o.ph))));
            stars.instanceMatrix.needsUpdate = true;
            ap.forEach((o, i) => { const k = (t * o.sp + o.ph) % 1; put(kit, ash, i, o.x + Math.sin(t + i) * 1.2, 22 - k * 23, o.z, 0.14, t + i, t * 0.6, 0); });
            ash.instanceMatrix.needsUpdate = true;
            horizon.material.opacity = 0.3 + 0.1 * Math.sin(t * 0.8);
        });
    },
    /* 꿈을 엮는 자 — 보랏빛 꿈 하늘에 걸린 거대한 초승달, 폭포가 흘러내리는 떠 있는 섬들, 구름 바다와 쏟아지는 별똥별 */
    dreamWeaver(ctx) {
        const { kit, tick, pick } = ctx;
        const { THREE, glowMat, rand } = kit;
        const { far, box, std } = setup(ctx);
        const moon = new THREE.Group(); moon.position.set(-8, 17, -28); far.add(moon);
        const m1 = disc(kit, 5, glowMat(0xfff3c0, 0.95)); moon.add(m1);
        const cut = disc(kit, 4.6, new THREE.MeshBasicMaterial({ color: 0x140a24 })); cut.position.set(1.8, 1.0, 0.1); moon.add(cut);
        const mg = disc(kit, 8, glowMat(pick(0), 0.15)); mg.position.z = -0.2; moon.add(mg);
        const isles = [[-14, 8, -22, 1.4], [12, 11, -24, 1.8], [4, 5, -18, 1.0], [-4, 13, -26, 1.2]].map(([x, y, z, s2]) => {
            const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s2); far.add(g);
            box(std(0x7ad65a, 0x1a4a1a, 0.4), 4, 0.6, 4, 0, 0, 0, g); box(std(0x8a6a4a), 3.2, 1.4, 3.2, 0, -1, 0, g); box(std(0x6a4a3a), 1.6, 1.4, 1.6, 0, -2.4, 0, g);
            box(std(0xff9ac8, 0x6a2a4a, 0.5), 0.8, 1.6, 0.8, 0.8, 1.1, 0.3, g); box(std(0x5a3a2a), 0.25, 1, 0.25, 0.8, 0.5, 0.3, g);
            const fall = box(glowMat(0x9fe8ff, 0.5), 0.5, 6, 0.3, -1.6, -3.3, 1.4, g);
            return { g, y, fall };
        });
        const C = 40, cloud = inst(kit, C, std(0xe8d8ff, 0x6a5aaa, 0.5), far);
        const cp = Array.from({ length: C }, () => ({ x: rand(-40, 40), z: rand(-32, -16), s: rand(2, 5), ph: rand(0, 6) }));
        const S2 = 6, shoot = inst(kit, S2, glowMat(0xffffff, 0.9), far);
        const sp = Array.from({ length: S2 }, () => ({ x: rand(-30, 30), y: rand(18, 28), ph: Math.random() }));
        const ST = 80, stars = inst(kit, ST, glowMat(pick(1), 0.85), far);
        const stp = Array.from({ length: ST }, () => ({ x: rand(-40, 40), y: rand(10, 34), z: rand(-34, -24), s: rand(0.08, 0.2), ph: rand(0, 6) }));
        tick(t => {
            moon.rotation.z = Math.sin(t * 0.2) * 0.05;
            isles.forEach((o, i) => { o.g.position.y = o.y + Math.sin(t * 0.5 + i) * 0.6; o.fall.material.opacity = 0.35 + 0.15 * Math.sin(t * 3 + i); });
            cp.forEach((o, i) => put(kit, cloud, i, o.x + Math.sin(t * 0.1 + o.ph) * 2, 1.5 + Math.sin(t * 0.3 + o.ph) * 0.3, o.z, o.s, 0, o.ph, 0, o.s * 0.35, o.s * 0.7));
            cloud.instanceMatrix.needsUpdate = true;
            sp.forEach((o, i) => { const k = (t * 0.3 + o.ph) % 1; put(kit, shoot, i, o.x + k * 14, o.y - k * 8, -26, k < 0.6 ? 2.4 : 0.01, 0, 0, -0.5, 0.1, 0.1); });
            shoot.instanceMatrix.needsUpdate = true;
            stp.forEach((o, i) => put(kit, stars, i, o.x, o.y, o.z, o.s * (0.6 + 0.4 * Math.sin(t * 2 + o.ph))));
            stars.instanceMatrix.needsUpdate = true;
        });
    }
};
