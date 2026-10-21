/* =========================================================
   👑 고급 칭호 전용 아우라 (LEGEND 이상)
   칭호마다 이름에 맞는 연출 하나. 전부 네모 블록.
   auras.js 의 fx.signature 이름으로 연결된다.

   각 함수가 받는 것:
     group     여기에 붙인 건 아우라 바꿀 때 같이 지워짐
     tick(fn)  매 프레임 fn(t, dt, speed) 실행
     colors    칭호 색들 (THREE.Color), pick(i) 로 돌려쓰기
     dummy     캐릭터 (root, parts, head, torso, armL, armR, legL, legR)
     stage     { scene, setSky(hex), floorTiles(fn), onClear(fn) }
     kit       { THREE, BOX, glowMat, solidMat, square, rand, ghost, sword, bolt }
   ========================================================= */

// 신규 칭호용 공통 도구: box(재질, 가로, 세로, 깊이, x, y, z, 부모) · attach(캐릭터 부위, 물체)
function sk(group, kit, stage) {
    const owned = [];
    const attach = (p, o) => { p.add(o); owned.push([p, o]); };
    stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
    const box = (m, w, h, d, x = 0, y = 0, z = 0, p = group) => { const b = new kit.THREE.Mesh(kit.BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
    return { box, attach };
}

export const SIGNATURES = {

    /* =================== 🆕 UPDATE 3 칭호 =================== */

    /* 카우보이 박지성 — 카우보이 모자, 머리 위로 빙빙 도는 올가미, 굴러가는 회전초, 사막 바닥 */
    cowboy({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#1a0e06');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const brown = new THREE.MeshStandardMaterial({ color: 0x7a4a22, roughness: 0.7 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.8 });
        // 모자 (넓은 챙 + 양옆이 살짝 올라감)
        const hat = new THREE.Group(); hat.position.y = 0.62;
        box(brown, 1.5, 0.08, 1.9, 0, 0, 0, hat);
        for (const s of [-1, 1]) box(brown, 0.4, 0.08, 1.9, s * 0.9, 0.12, 0, hat).rotation.z = s * 0.5;
        box(brown, 1.0, 0.55, 1.05, 0, 0.3, 0, hat); box(dark, 1.02, 0.12, 1.07, 0, 0.1, 0, hat);
        attach(dummy.head, hat);
        // 조끼 + 보안관 별
        const vest = new THREE.Group();
        box(new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 }), 2.14, 2.12, 1.14, 0, 0, 0, vest);
        box(new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.9, roughness: 0.2, emissive: 0x6a4a00, emissiveIntensity: 0.5 }), 0.32, 0.32, 0.06, -0.5, 0.4, 0.6, vest).rotation.z = 0.785;
        attach(dummy.torso, vest);
        // 올가미: 오른손에서 위로 이어진 밧줄 + 머리 위 도는 고리
        const ropeM = new THREE.MeshStandardMaterial({ color: 0xd9b07a, roughness: 0.9 });
        const loop = new THREE.Group(); group.add(loop);
        const N = 18, segs = Array.from({ length: N }, () => box(ropeM, 0.12, 0.12, 0.36, 0, 0, 0, loop));
        // 회전초 (블록 덩어리가 굴러감)
        const weeds = [0, 1].map(k => { const w = new THREE.Group(); for (let i = 0; i < 10; i++) box(new THREE.MeshStandardMaterial({ color: 0x9a7a40, roughness: 1 }), 0.25, 0.25, 0.25, rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4), w); group.add(w); return { w, ph: k * 3 }; });
        // 모래 바닥 + 선인장
        for (let i = 0; i < 12; i++) box(new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9a95a : 0xc4904a, roughness: 1 }), rand(1, 2), 0.04, rand(1, 2), rand(-4, 4), 0.03, rand(-3, 2));
        const cact = new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.8 });
        [[-4, -3], [4.2, -2.6]].forEach(([x, z]) => { box(cact, 0.5, 2.6, 0.5, x, 1.3, z); box(cact, 0.35, 1, 0.35, x + 0.45, 1.6, z); box(cact, 0.35, 0.8, 0.35, x - 0.45, 1.2, z); });
        sig.spin = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            const cy = 6.6 + lift, r = 1.3;
            segs.forEach((b, i) => { const a = t * 6 + (i / N) * Math.PI * 2; b.position.set(1.1 + Math.cos(a) * r, cy + Math.sin(a * 2) * 0.05, Math.sin(a) * r); b.rotation.y = -a; });
            weeds.forEach(({ w, ph }) => { const k = ((t * 0.18 + ph) % 1); w.position.set(-6 + k * 12, 0.45 + Math.abs(Math.sin(t * 4 + ph)) * 0.3, -1.5 + ph * 0.4); w.rotation.z = -t * 4; });
            sig.spin = t;
        });
    },

    /* 마법소녀 김민채 — 별 지팡이, 리본, 하트 마법진, 반짝이가 흩날리고 4초마다 변신 빛 */
    magicalGirl({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand } = kit;
        stage.setSky('#14061a');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const pink = new THREE.MeshStandardMaterial({ color: 0xff8ad8, roughness: 0.5, emissive: 0x6a1a4a, emissiveIntensity: 0.3 });
        const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        // 리본 머리띠 + 옷
        const bow = new THREE.Group(); bow.position.set(0, 0.62, 0);
        box(pink, 0.5, 0.36, 0.14, -0.3, 0.05, 0, bow).rotation.z = 0.4; box(pink, 0.5, 0.36, 0.14, 0.3, 0.05, 0, bow).rotation.z = -0.4; box(white, 0.18, 0.2, 0.18, 0, 0.05, 0, bow);
        attach(dummy.head, bow);
        const dress = new THREE.Group(); box(pink, 2.14, 2.12, 1.14, 0, 0, 0, dress); box(white, 2.3, 0.3, 1.3, 0, -0.95, 0, dress); box(new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffb02e, emissiveIntensity: 0.6 }), 0.3, 0.3, 0.08, 0, 0.5, 0.6, dress).rotation.z = 0.785;
        attach(dummy.torso, dress);
        // 지팡이 (왼손 = armR): 막대 끝에 별 + 도는 링
        const wand = new THREE.Group(); wand.position.set(0, -2.2, 0.3);
        box(white, 0.1, 1.6, 0.1, 0, -0.2, 0, wand);
        const star = new THREE.Group(); star.position.y = 0.8; wand.add(star);
        const starM = new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffd23a, emissiveIntensity: 1.2 });
        box(starM, 0.4, 0.4, 0.1, 0, 0, 0, star); box(starM, 0.4, 0.4, 0.1, 0, 0, 0, star).rotation.z = 0.785;
        const ring = square(0.8, 0.04, glowMat(pick(0), 0.9)); ring.rotation.x = Math.PI / 2; star.add(ring);
        attach(dummy.armR, wand);
        // 하트 마법진 (바닥, 블록 하트)
        const heart = new THREE.Group(); heart.position.y = 0.06; group.add(heart);
        const H = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
        H.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') box(glowMat(pick(0), 0.55), 0.5, 0.03, 0.5, (x - 3) * 0.55, 0, (y - 2.5) * 0.55, heart); }));
        const rim = square(5, 0.08, glowMat(pick(1), 0.7)); rim.position.y = 0.06; group.add(rim);
        // 반짝이
        const sp = Array.from({ length: 24 }, () => ({ m: box(glowMat(Math.random() < 0.5 ? pick(1) : pick(2), 0.9), 0.14, 0.14, 0.02, 0, 0, 0), a: rand(0, 6.28), r: rand(1.8, 3.4), y: rand(0, 6), sp: rand(0.4, 1) }));
        sig.cast = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            star.rotation.z = t * 2; ring.rotation.z = -t * 3;
            heart.rotation.y = t * 0.4; rim.rotation.y = -t * 0.3;
            sp.forEach((p, i) => { const a = p.a + t * p.sp; p.m.position.set(Math.cos(a) * p.r, (p.y + t * 0.6) % 7 + lift, Math.sin(a) * p.r); p.m.rotation.set(0, -a, t * 3 + i); });
            const c = (t % 4) / 4; sig.cast = c > 0.8 ? Math.sin((c - 0.8) / 0.2 * Math.PI) : 0;
            rim.scale.setScalar(1 + sig.cast * 0.15);
        });
    },

    /* 불꽃놀이 공병은 — 손에 든 폭죽 막대, 밤하늘에 연달아 터지는 불꽃, 떨어지는 불티 */
    fireworks({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#03030e');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        // 유카타 + 폭죽 막대
        const yuka = new THREE.Group(); box(new THREE.MeshStandardMaterial({ color: 0x1a2a6a, roughness: 0.7 }), 2.14, 2.12, 1.14, 0, 0, 0, yuka); box(new THREE.MeshStandardMaterial({ color: 0xff5a3a }), 2.18, 0.3, 1.18, 0, -0.2, 0, yuka);
        attach(dummy.torso, yuka);
        const stick = new THREE.Group(); stick.position.set(0, -2.3, 0.3);
        box(new THREE.MeshStandardMaterial({ color: 0x8a6a40 }), 0.08, 1.2, 0.08, 0, 0, 0, stick);
        const spark = box(glowMat(0xffe7a0, 1), 0.2, 0.2, 0.2, 0, 0.65, 0, stick);
        attach(dummy.armR, stick);
        // 하늘 불꽃: 터지는 위치마다 InstancedMesh 조각
        const SHELLS = 4, P = 40;
        const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
        const shells = Array.from({ length: SHELLS }, (_, k) => {
            const col = new THREE.Color([pick(0), pick(1), pick(2), 0xff7ad8][k]);
            const m = new THREE.InstancedMesh(BOX, glowMat(col, 0.95), P); far.add(m);
            const trail = box(glowMat(col, 0.9), 0.12, 0.6, 0.12, 0, -10, 0, far);
            const dirs = Array.from({ length: P }, () => new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-0.5, 0.5)).normalize());
            return { m, trail, dirs, ph: k * 0.9, at: new THREE.Vector3() };
        });
        // 떨어지는 불티 (가까이)
        const D = 30, embers = new THREE.InstancedMesh(BOX, glowMat(0xffb02e, 0.9), D); group.add(embers);
        const ep = Array.from({ length: D }, () => [rand(-3, 3), Math.random(), rand(-2, 2), rand(0.2, 0.5)]);
        sig.boom = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            spark.scale.setScalar(0.15 + Math.random() * 0.15);
            let boom = 0;
            shells.forEach(s => {
                const c = ((t + s.ph) % 3.6) / 3.6;
                if (c < 0.03) s.at.set(rand(-7, 7), rand(9, 13), rand(-14, -8));
                if (c < 0.25) {   // 쏘아 올림
                    const k = c / 0.25;
                    s.trail.position.set(s.at.x, 1 + (s.at.y - 1) * k, s.at.z); s.trail.visible = true; s.m.count = 0;
                } else {          // 펑
                    s.trail.visible = false; s.m.count = P;
                    const k = (c - 0.25) / 0.75, r = Math.pow(k, 0.5) * 4.5;
                    if (k < 0.08) boom = 1 - k / 0.08;
                    s.dirs.forEach((d, i) => { TMP.p.copy(d).multiplyScalar(r).add(s.at); TMP.p.y -= k * k * 2.5; TMP.q.identity(); TMP.sc.setScalar(0.22 * (1 - k) + 0.02); s.m.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc)); });
                    s.m.instanceMatrix.needsUpdate = true;
                    s.m.material.opacity = 0.95 * (1 - k * k);
                }
            });
            ep.forEach((e, i) => { const k = (e[1] + t * e[3]) % 1; TMP.p.set(e[0] + Math.sin(t + i) * 0.3, 7 - k * 7 + lift * 0.3, e[2]); TMP.q.identity(); TMP.sc.setScalar(0.06 + 0.05 * (1 - k)); embers.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc)); });
            embers.instanceMatrix.needsUpdate = true;
            sig.boom = boom;
        });
    },

    /* 만월의 늑대 김가은 — 늑대 귀와 꼬리, 등 뒤 거대한 보름달, 주위를 도는 영혼 늑대 무리, 6초마다 하울링 */
    moonWolf({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand } = kit;
        stage.setSky('#020414');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const fur = new THREE.MeshStandardMaterial({ color: 0xd8e4f0, roughness: 0.8 });
        const furD = new THREE.MeshStandardMaterial({ color: 0x8a9ab0, roughness: 0.8 });
        // 귀 + 목도리 털 + 꼬리
        const ears = new THREE.Group(); ears.position.y = 0.6;
        for (const s of [-1, 1]) { box(fur, 0.32, 0.5, 0.2, s * 0.42, 0.25, 0, ears).rotation.z = -s * 0.25; box(new THREE.MeshStandardMaterial({ color: 0xffb0c0 }), 0.16, 0.3, 0.05, s * 0.42, 0.22, 0.11, ears).rotation.z = -s * 0.25; }
        attach(dummy.head, ears);
        const ruff = new THREE.Group(); ruff.position.y = 0.85; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(fur, 0.5, 0.35, 0.5, Math.cos(a) * 0.95, 0, Math.sin(a) * 0.55, ruff); }
        attach(dummy.torso, ruff);
        const tail = new THREE.Group(); tail.position.set(0, -0.8, -0.6);
        const tseg = Array.from({ length: 5 }, (_, i) => box(i < 4 ? fur : new THREE.MeshStandardMaterial({ color: 0xffffff }), 0.42 - i * 0.04, 0.42 - i * 0.04, 0.45, 0, 0, -i * 0.38, tail));
        attach(dummy.torso, tail);
        // 보름달 + 달무리
        const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
        const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({ color: 0xeef4ff, toneMapped: false, transparent: true, opacity: 0.92 }));
        moon.position.set(0, 8, -18); far.add(moon);
        const halo = new THREE.Mesh(new THREE.CircleGeometry(8, 40), glowMat(pick(1), 0.15)); halo.position.set(0, 8, -18.2); far.add(halo);
        for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(0.4 + Math.random() * 0.7, 10), new THREE.MeshBasicMaterial({ color: 0xc8d4e8, transparent: true, opacity: 0.6 })); c.position.set(rand(-3.5, 3.5), 8 + rand(-3, 3), -17.9); far.add(c); }
        // 영혼 늑대 (반투명, 원을 그리며 달림)
        const ghostM = glowMat(pick(0), 0.45);
        const wolves = [0, 1, 2, 3].map(k => {
            const w = new THREE.Group(); group.add(w);
            box(ghostM, 0.6, 0.5, 1.3, 0, 0.6, 0, w); box(ghostM, 0.45, 0.45, 0.5, 0, 0.85, 0.8, w); box(ghostM, 0.3, 0.2, 0.3, 0, 0.75, 1.15, w);
            for (const s of [-1, 1]) box(ghostM, 0.12, 0.22, 0.1, s * 0.15, 1.15, 0.75, w);
            const legs = [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].map(([x, z]) => box(ghostM, 0.14, 0.45, 0.14, x, 0.22, z, w));
            box(ghostM, 0.18, 0.18, 0.6, 0, 0.75, -0.85, w);
            return { w, legs, ph: k * Math.PI / 2 };
        });
        sig.howl = 0;
        tick(t => {
            tseg.forEach((b, i) => { b.position.x = Math.sin(t * 3 - i * 0.6) * 0.08 * i; b.position.y = i * 0.12; });
            wolves.forEach(({ w, legs, ph }, k) => {
                const a = t * 0.7 + ph, r = 3.4 + Math.sin(t + k) * 0.3;
                w.position.set(Math.cos(a) * r, Math.abs(Math.sin(t * 6 + k)) * 0.15, Math.sin(a) * r * 0.8);
                w.rotation.y = -a;
                legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 12 + i * Math.PI / 2 + k) * 0.6; });
            });
            const c = (t % 6) / 6; sig.howl = c > 0.7 && c < 0.95 ? Math.sin((c - 0.7) / 0.25 * Math.PI) : 0;
            halo.material.opacity = 0.12 + sig.howl * 0.25;
            moon.scale.setScalar(1 + sig.howl * 0.04);
        });
    },

    /* =================== 🌀 레이드 보스 드롭 칭호 =================== */

    /* 균열을 걷는 자 — 두건 쓴 차원 암살자. 양손의 균열 단검, 등 뒤에서 열렸다 닫히는 차원의 문,
       4초마다 순간이동 잔상과 함께 앞을 X자로 가르는 균열 */
    riftWalker({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, ghost, heldSword } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#07030f');
        const obs = new THREE.MeshStandardMaterial({ color: 0x15101f, roughness: 0.3, metalness: 0.5, emissive: 0x2a0a4a, emissiveIntensity: 0.45 });
        const trim = glowMat(pick(0), 1);
        // 두건 + 얼굴 가리개
        const hood = new THREE.Group(); hood.position.y = 0.1;
        box(obs, 1.5, 0.28, 1.5, 0, 0.74, 0, hood); for (const s of [-1, 1]) box(obs, 0.16, 1.35, 1.5, s * 0.74, 0.05, 0, hood); box(obs, 1.5, 1.35, 0.16, 0, 0.05, -0.74, hood);
        box(obs, 1.1, 0.5, 0.08, 0, -0.32, 0.66, hood); box(trim, 1.12, 0.05, 0.09, 0, -0.06, 0.67, hood); box(trim, 1.52, 0.05, 0.05, 0, 0.6, 0.76, hood);
        attach(dummy.head, hood);
        // 망토: 끝으로 갈수록 조각조각 흩어짐
        const cape = new THREE.Group(); cape.position.set(0, 0.95, -0.62);
        const capeSegs = Array.from({ length: 7 }, (_, i) => box(obs, 2.2 - i * 0.12, 0.5, 0.08, 0, -i * 0.48, 0, cape));
        const capeTrim = capeSegs.map((s, i) => box(trim, 2.2 - i * 0.12, 0.04, 0.09, 0, -i * 0.48 - 0.24, 0, cape));
        attach(dummy.torso, cape);
        const belt = new THREE.Group(); box(obs, 2.14, 0.3, 1.14, 0, -0.7, 0, belt); box(trim, 0.3, 0.3, 0.06, 0, -0.7, 0.58, belt).rotation.z = Math.PI / 4; attach(dummy.torso, belt);
        // 양손 균열 단검
        const daggers = [dummy.armL, dummy.armR].map((arm, i) => { const d = heldSword(1.5, pick(0), pick(1), 0.3, false); d.position.set(0, -1.95, 0); d.rotation.x = Math.PI * (i ? 0.75 : 0.55); attach(arm, d); return d; });
        // 등 뒤 차원의 문
        const door = new THREE.Group(); door.position.set(0, 3.2, -1.7); group.add(door);
        const bars = Array.from({ length: 22 }, (_, i) => { const k = i / 21; return { a: box(glowMat(0xffffff, 0.8), 1, 0.3, 0.05, Math.sin(i * 1.3) * 0.12, (k - 0.5) * 6.4, 0.04, door), b: box(glowMat(pick(0), 0.6), 1, 0.3, 0.05, Math.sin(i * 1.3) * 0.12, (k - 0.5) * 6.4, 0, door), c: box(glowMat(pick(1), 0.35), 1, 0.3, 0.05, Math.sin(i * 1.3) * 0.12, (k - 0.5) * 6.4, -0.04, door), w: Math.pow(Math.sin(k * Math.PI), 0.7) }; });
        // X자 베기
        const slashes = [0.75, -0.75].map(rz => { const m = box(glowMat(pick(0), 0), 5.5, 0.16, 0.05, 0, 3.2, 1.4); m.rotation.z = rz; return m; });
        // 순간이동 잔상
        const after = ghost(pick(0), 0); after.scale.setScalar(0.98); group.add(after);
        // 맴도는 파편
        const shards = Array.from({ length: 12 }, (_, i) => ({ m: box(i % 3 ? obs : glowMat(pick(i % 2), 0.95), 0.22, 0.4, 0.22, 0, 0, 0), a: i / 12 * Math.PI * 2, r: 1.9 + (i % 3) * 0.35, y: 1 + (i % 4) * 1.1 }));
        sig.slash = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            capeSegs.forEach((b, i) => { const w = Math.sin(t * 2.6 - i * 0.7) * 0.07 * i; b.rotation.x = 0.12 + w; b.position.z = -i * 0.12; capeTrim[i].rotation.x = b.rotation.x; capeTrim[i].position.z = b.position.z; if (i > 3) { b.scale.x = (2.2 - i * 0.12) * (0.75 + 0.25 * Math.sin(t * 7 + i)); capeTrim[i].scale.x = b.scale.x; } });
            const open = 0.65 + 0.35 * Math.sin(t * 1.4);
            bars.forEach((b, i) => { const f = open * (0.85 + 0.15 * Math.sin(t * 10 + i)); b.a.scale.x = Math.max(0.03, b.w * 0.22 * f); b.b.scale.x = b.w * 0.7 * f; b.c.scale.x = b.w * 1.2 * f; });
            door.position.y = 3.2 + lift;
            const c = (t % 4) / 4;
            sig.slash = c > 0.72 && c < 0.92 ? Math.sin((c - 0.72) / 0.2 * Math.PI) : 0;
            slashes.forEach((m, i) => { const k = Math.max(0, Math.min(1, (c - 0.74 - i * 0.04) / 0.1)); m.material.opacity = k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; m.scale.x = 5.5 * k; m.position.y = 3.2 + lift; });
            const g = c > 0.66 && c < 0.9 ? 1 - Math.abs(c - 0.74) / 0.16 : 0;
            after.position.set(c < 0.74 ? -2.2 : 2.2, lift, -0.4);
            after.children.forEach(m => { m.material.opacity = Math.max(0, g) * 0.35; });
            shards.forEach((s, i) => { const a = s.a + t * (0.6 + (i % 3) * 0.2); s.m.position.set(Math.cos(a) * s.r, s.y + lift + Math.sin(t * 2 + i) * 0.2, Math.sin(a) * s.r); s.m.rotation.set(t * 2 + i, t * 3, 0.5); });
            trim.color.set(pick(0)).multiplyScalar(0.8 + 0.4 * Math.sin(t * 4));
        });
    },

    /* 균열의 지배자 — 흑요석 황제. 등 뒤에 균열로 된 거대한 날개, 머리 위 수정 왕관 고리,
       떠 있는 두 건틀렛이 명령에 맞춰 내려찍고, 발밑에서 충격파가 퍼짐 */
    riftLord({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, square, rand } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#0a0414');
        const obs = new THREE.MeshStandardMaterial({ color: 0x1b1428, roughness: 0.28, metalness: 0.6, emissive: 0x2a0a4a, emissiveIntensity: 0.45 });
        const obs2 = new THREE.MeshStandardMaterial({ color: 0x2a1d3e, roughness: 0.32, metalness: 0.55, emissive: 0x1a0630, emissiveIntensity: 0.4 });
        const crystal = new THREE.MeshStandardMaterial({ color: 0xb08aff, emissive: 0x7a3aff, emissiveIntensity: 1.3, roughness: 0.12 });
        const crack = glowMat(pick(0), 1);
        // 갑옷 + 어깨 수정 + 가슴 핵
        const armor = new THREE.Group();
        box(obs, 2.2, 2.18, 1.2, 0, 0, 0, armor); box(obs2, 2.24, 0.3, 1.24, 0, -0.75, 0, armor);
        for (const s of [-1, 1]) { box(obs2, 1.05, 0.65, 1.45, s * 1.32, 0.95, 0, armor); for (let i = 0; i < 3; i++) box(crystal, 0.18, 0.9 - i * 0.18, 0.18, s * (1.25 + i * 0.25), 1.55 - i * 0.05, (i - 1) * 0.4, armor).rotation.z = -s * (0.25 + i * 0.25); }
        [[-0.6, 0.35, 0.5], [0.55, -0.3, -0.6], [-0.3, -0.55, 0.9], [0.65, 0.4, -0.3]].forEach(([x, y, rz]) => box(crack, 0.06, 0.7, 0.04, x, y, 0.62, armor).rotation.z = rz);
        const coreM = new THREE.MeshStandardMaterial({ color: 0xff4ad8, emissive: 0xff4ad8, emissiveIntensity: 2.4 });
        const core = box(coreM, 0.5, 0.5, 0.1, 0, 0.15, 0.64, armor); core.rotation.z = Math.PI / 4;
        box(obs2, 0.75, 0.75, 0.06, 0, 0.15, 0.6, armor).rotation.z = Math.PI / 4;
        attach(dummy.torso, armor);
        // 망토 (보라 안감)
        const cape = new THREE.Group(); cape.position.set(0, 0.95, -0.66);
        const capeSegs = Array.from({ length: 6 }, (_, i) => { const g = new THREE.Group(); g.position.y = -i * 0.55; cape.add(g); box(obs, 2.4, 0.56, 0.08, 0, 0, 0, g); box(glowMat(pick(1), 0.35), 2.3, 0.5, 0.02, 0, 0, 0.05, g); return g; });
        attach(dummy.torso, cape);
        // 수정 왕관 고리 (두 겹으로 반대로 돎)
        const crown = new THREE.Group(); group.add(crown);
        const ringA = new THREE.Group(), ringB = new THREE.Group(); crown.add(ringA, ringB);
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, h = i % 2 ? 0.45 : 0.85; box(crystal, 0.14, h, 0.14, Math.cos(a) * 0.82, h / 2, Math.sin(a) * 0.82, ringA); }
        for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; box(glowMat(pick(i % 2), 0.9), 0.1, 0.1, 0.1, Math.cos(a) * 1.25, 0.25, Math.sin(a) * 1.25, ringB); }
        ringA.add(square(1.7, 0.05, glowMat(pick(1), 0.8)));
        // 균열 날개 (등 뒤에서 위로 펼쳐지는 빛의 틈 여러 갈래)
        const wings = [-1, 1].map(s => {
            const w = new THREE.Group(); w.position.set(s * 0.6, 4.2, -1.1); group.add(w);
            const blades = [0, 1, 2, 3].map(j => {
                const b = new THREE.Group(); b.rotation.z = -s * (0.35 + j * 0.32); w.add(b);
                const len = 3.6 - j * 0.45;
                const segs = Array.from({ length: 10 }, (_, k) => { const kk = k / 9, wd = Math.sin(kk * Math.PI) * 0.55; return { a: box(glowMat(0xffffff, 0.75), wd * 0.25 + 0.03, 0.34, 0.04, 0, kk * len, 0.03, b), b: box(glowMat(pick(0), 0.55), wd * 0.7, 0.34, 0.04, 0, kk * len, 0, b), c: box(glowMat(pick(1), 0.3), wd * 1.2, 0.34, 0.04, 0, kk * len, -0.03, b), wd }; });
                b.position.x = s * 0.2;
                return { b, segs, j };
            });
            return { w, s, blades };
        });
        // 떠 있는 두 건틀렛
        const fists = [-1, 1].map(s => {
            const g = new THREE.Group(); group.add(g);
            box(obs, 1.15, 1.05, 1.15, 0, 0, 0, g); box(obs2, 1.25, 0.3, 1.25, 0, -0.4, 0, g);
            for (let i = 0; i < 4; i++) box(obs2, 0.24, 0.24, 0.2, (i - 1.5) * 0.27, 0.22, 0.62, g);
            box(glowMat(pick(0), 0.9), 1.27, 0.07, 1.27, 0, -0.18, 0, g);
            box(crystal, 0.2, 0.6, 0.2, s * 0.25, 0.7, -0.15, g).rotation.z = -s * 0.4;
            return { g, s };
        });
        // 명령할 때 퍼지는 충격파
        const shock = [0, 1].map(() => { const r = square(1, 0.12, glowMat(pick(0), 0)); r.position.y = 0.08; group.add(r); return r; });
        sig.command = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            coreM.emissiveIntensity = 2 + Math.sin(t * 3) * 0.8;
            crown.position.set(0, 6.15 + lift + Math.sin(t * 2) * 0.08, 0); ringA.rotation.y = t * 0.6; ringB.rotation.y = -t * 1.1;
            capeSegs.forEach((g, i) => { g.rotation.x = 0.1 + Math.sin(t * 2 - i * 0.6) * 0.05 * i; g.position.z = -i * 0.1; });
            const c = (t % 5) / 5, cmd = c > 0.7 ? Math.sin((c - 0.7) / 0.3 * Math.PI) : 0;
            sig.command = cmd;
            wings.forEach(w => {
                w.w.position.y = 4.2 + lift;
                w.blades.forEach(bl => { bl.b.rotation.z = -w.s * (0.35 + bl.j * 0.32 + cmd * 0.15 + Math.sin(t * 1.2 + bl.j) * 0.04); bl.segs.forEach((sg, k) => { const f = 0.8 + 0.2 * Math.sin(t * 8 + k + bl.j) + cmd * 0.4; sg.a.scale.x = Math.max(0.03, sg.wd * 0.25 * f); sg.b.scale.x = sg.wd * 0.7 * f; sg.c.scale.x = sg.wd * 1.2 * f; }); });
            });
            fists.forEach(({ g, s }, i) => {
                const hit = c > 0.7 && c < 0.85 ? Math.sin((c - 0.7) / 0.15 * Math.PI) : 0;
                g.position.set(s * (2.7 - cmd * 0.5), 3.4 + lift + Math.sin(t * 1.6 + i * 2) * 0.25 + cmd * 1.4 - hit * 2.6, 0.6 + cmd * 1.2);
                g.rotation.set(-cmd * 0.6, Math.sin(t + i) * 0.2, s * 0.1);
            });
            shock.forEach((r, i) => { const k = ((c - 0.8 - i * 0.06) / 0.2); const v = k > 0 && k < 1; r.scale.setScalar(v ? 1 + k * 9 : 0.01); r.children.forEach(m => { m.material.opacity = v ? (1 - k) * 0.9 : 0; }); });
        });
    },

    /* 빙하의 심장 — 얼음 갑옷과 두 번씩 뛰는 얼음 심장, 머리 위 빙정 왕관, 몸을 도는 서리 고리,
       주위를 천천히 맴도는 거대한 얼음 조각과 흩날리는 눈 */
    frostHeart({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, square, rand } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#08121f');
        const ice = new THREE.MeshStandardMaterial({ color: 0xbfeaff, roughness: 0.08, metalness: 0.2, emissive: 0x2a7ab0, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 });
        const deep = new THREE.MeshStandardMaterial({ color: 0x3a8ac8, roughness: 0.15, metalness: 0.3, emissive: 0x0a3a6a, emissiveIntensity: 0.5 });
        const crystal = new THREE.MeshStandardMaterial({ color: 0xe0fbff, emissive: 0x5ad8ff, emissiveIntensity: 1.2, roughness: 0.05 });
        // 얼음 갑옷 조각
        const arm = new THREE.Group();
        box(ice, 2.16, 1.0, 1.16, 0, 0.5, 0, arm); box(deep, 2.2, 0.2, 1.2, 0, -0.1, 0, arm);
        for (const s of [-1, 1]) { box(ice, 1.0, 0.5, 1.3, s * 1.3, 0.95, 0, arm); for (let i = 0; i < 4; i++) box(crystal, 0.16, 0.7 - i * 0.12, 0.16, s * (1.1 + i * 0.22), 1.4, (i - 1.5) * 0.3, arm).rotation.z = -s * (0.2 + i * 0.25); }
        // 얼음 심장 (두 번씩 뜀)
        const heartM = new THREE.MeshStandardMaterial({ color: 0x8af6ff, emissive: 0x8af6ff, emissiveIntensity: 2.2, roughness: 0.05 });
        const heart = new THREE.Group(); heart.position.set(0, 0.35, 0.66); arm.add(heart);
        box(heartM, 0.3, 0.3, 0.2, -0.13, 0.08, 0, heart).rotation.z = Math.PI / 4; box(heartM, 0.3, 0.3, 0.2, 0.13, 0.08, 0, heart).rotation.z = Math.PI / 4; box(heartM, 0.36, 0.36, 0.2, 0, -0.1, 0, heart).rotation.z = Math.PI / 4;
        const heartHalo = box(glowMat(pick(0), 0.4), 0.9, 0.9, 0.02, 0, 0, 0.12, heart); heartHalo.rotation.z = Math.PI / 4;
        attach(dummy.torso, arm);
        // 빙정 왕관
        const crown = new THREE.Group(); crown.position.y = 0.72;
        for (let i = 0; i < 7; i++) { const x = (i - 3) * 0.22, h = 0.5 + (3 - Math.abs(i - 3)) * 0.22; box(crystal, 0.14, h, 0.14, x, h / 2, 0.55).rotation.z = (i - 3) * -0.1; }
        box(deep, 1.35, 0.15, 1.35, 0, 0, 0, crown);
        attach(dummy.head, crown);
        // 서리 고리 (허리 둘레를 기울어진 채 돎)
        const rings = [0, 1, 2].map(i => { const r = square(2.8 + i * 0.6, 0.06, glowMat(pick(i % 2), 0.7)); group.add(r); for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(kit.BOX, crystal); m.scale.set(0.12, 0.3, 0.12); const a = k / 6 * Math.PI * 2; m.position.set(Math.cos(a) * (1.4 + i * 0.3), 0, Math.sin(a) * (1.4 + i * 0.3)); r.add(m); } return r; });
        // 맴도는 큰 얼음 조각
        const bergs = Array.from({ length: 6 }, (_, i) => { const g = new THREE.Group(); group.add(g); const h = rand(0.9, 1.6); box(ice, 0.5, h, 0.5, 0, 0, 0, g); box(crystal, 0.3, h * 0.6, 0.3, 0.15, h * 0.4, 0.1, g); return { g, a: i / 6 * Math.PI * 2, y: rand(1.5, 5), r: rand(2.6, 3.2) }; });
        // 흩날리는 눈
        const N = 40, snow = new THREE.InstancedMesh(kit.BOX, glowMat(0xffffff, 0.9), N); group.add(snow);
        const sp = Array.from({ length: N }, () => ({ x: rand(-3.5, 3.5), z: rand(-2.5, 2.5), ph: Math.random(), s: rand(0.05, 0.11) }));
        const { m4, q, p, sc, e } = kit.TMP;
        sig.beat = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            const k = (t % 1.4) / 1.4, beat = Math.max(0, Math.sin(Math.min(1, k / 0.12) * Math.PI)) + 0.6 * Math.max(0, Math.sin(Math.min(1, Math.max(0, k - 0.18) / 0.12) * Math.PI));
            sig.beat = beat;
            heart.scale.setScalar(1 + beat * 0.25); heartM.emissiveIntensity = 1.8 + beat * 2; heartHalo.scale.setScalar(1 + beat * 0.8); heartHalo.material.opacity = 0.2 + beat * 0.4;
            rings.forEach((r, i) => { r.position.y = 1.6 + i * 0.9 + lift; r.rotation.set(0.35 * Math.sin(t * 0.5 + i), t * (0.4 + i * 0.25) * (i % 2 ? -1 : 1), 0.2); });
            bergs.forEach((b, i) => { const a = b.a + t * 0.25; b.g.position.set(Math.cos(a) * b.r, b.y + lift + Math.sin(t + i) * 0.3, Math.sin(a) * b.r); b.g.rotation.set(Math.sin(t * 0.5 + i) * 0.3, t * 0.4 + i, 0.2); });
            sp.forEach((o, i) => { const kk = (t * 0.15 + o.ph) % 1; p.set(o.x + Math.sin(t + i) * 0.4, 6.5 - kk * 6.5 + lift, o.z); q.setFromEuler(e.set(t + i, t, 0)); sc.setScalar(o.s); snow.setMatrixAt(i, m4.compose(p, q, sc)); });
            snow.instanceMatrix.needsUpdate = true;
        });
    },

    /* 화룡의 계승자 — 용의 뿔과 비늘 갑옷, 등에서 퍼덕이는 용 날개, 몸을 나선으로 감싸며 도는 불의 용 */
    dragonHeir({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#140602');
        const scale = new THREE.MeshStandardMaterial({ color: 0x3a1a10, roughness: 0.4, metalness: 0.5, emissive: 0x3a0a00, emissiveIntensity: 0.5 });
        const horn = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.35, metalness: 0.6 });
        const lava = glowMat(pick(0), 1);
        const memb = new THREE.MeshStandardMaterial({ color: 0x7a1a08, emissive: 0xff3a0a, emissiveIntensity: 0.45, roughness: 0.6, side: THREE.DoubleSide });
        // 뿔
        const horns = new THREE.Group(); horns.position.y = 0.5;
        for (const s of [-1, 1]) { let x = s * 0.45, y = 0, z = -0.1; for (let k = 0; k < 4; k++) { const seg = box(k === 3 ? lava : horn, 0.26 - k * 0.04, 0.5, 0.26 - k * 0.04, x, y + 0.25, z, horns); seg.rotation.set(-0.5 - k * 0.2, 0, -s * 0.3); x += s * 0.12; y += 0.38; z -= 0.22 + k * 0.05; } }
        attach(dummy.head, horns);
        // 비늘 갑옷 + 용암 결
        const ar = new THREE.Group();
        box(scale, 2.18, 2.16, 1.18, 0, 0, 0, ar);
        for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 4; c2++) box(horn, 0.42, 0.12, 0.06, (c2 - 1.5) * 0.5 + (r % 2) * 0.25, 0.75 - r * 0.45, 0.61, ar);
        [[-0.5, 0.2, 0.6], [0.45, -0.3, -0.5], [0, -0.7, 0.2]].forEach(([x, y, rz]) => box(lava, 0.06, 0.8, 0.04, x, y, 0.63, ar).rotation.z = rz);
        const coreM = new THREE.MeshStandardMaterial({ color: 0xffb03a, emissive: 0xffb03a, emissiveIntensity: 2.2 });
        box(coreM, 0.42, 0.42, 0.08, 0, 0.25, 0.64, ar).rotation.z = Math.PI / 4;
        for (const s of [-1, 1]) { box(scale, 1.0, 0.55, 1.35, s * 1.3, 0.92, 0, ar); for (let i = 0; i < 3; i++) box(horn, 0.14, 0.45, 0.14, s * 1.3, 1.3, (i - 1) * 0.4, ar).rotation.z = -s * 0.3; }
        attach(dummy.torso, ar);
        // 용 날개 (등에 붙어 퍼덕임)
        const wings = [-1, 1].map(s => {
            const w = new THREE.Group(); w.position.set(s * 0.5, 0.6, -0.6); attach(dummy.torso, w);
            const arm = new THREE.Group(); w.add(arm);
            box(horn, 2.6, 0.2, 0.2, s * 1.3, 0.9, 0, arm).rotation.z = s * 0.5;
            const tip = new THREE.Group(); tip.position.set(s * 2.3, 2.1, 0); arm.add(tip);
            for (let i = 0; i < 4; i++) { box(horn, 0.12, 2.4 - i * 0.35, 0.12, s * i * 0.55, -1.0 + i * 0.1, 0, tip).rotation.z = s * (0.15 + i * 0.25); box(memb, 0.6, 2.2 - i * 0.4, 0.04, s * (i * 0.55 + 0.28), -1.0 + i * 0.15, -0.02, tip).rotation.z = s * (0.2 + i * 0.25); }
            box(memb, 2.4, 1.6, 0.04, s * 1.2, 0.3, -0.02, arm).rotation.z = s * 0.35;
            return { arm, tip, s };
        });
        // 나선으로 감도는 불의 용 (머리 + 몸 마디)
        const N = 26;
        const fd = Array.from({ length: N }, (_, i) => box(i === 0 ? new THREE.MeshStandardMaterial({ color: 0xffd23a, emissive: 0xff7a1a, emissiveIntensity: 2 }) : glowMat(i % 3 ? pick(0) : pick(1), 1 - i / N * 0.7), i === 0 ? 0.55 : 0.42 - i * 0.012, i === 0 ? 0.4 : 0.42 - i * 0.012, i === 0 ? 0.7 : 0.42 - i * 0.012, 0, 0, 0));
        const fhorns = [-1, 1].map(s => box(horn, 0.08, 0.08, 0.4, 0, 0, 0));
        const prev = new THREE.Vector3();
        // 불씨
        const E = 30, emb = new THREE.InstancedMesh(kit.BOX, glowMat(0xff8a2a, 0.9), E); group.add(emb);
        const ep = Array.from({ length: E }, () => ({ x: rand(-2.5, 2.5), z: rand(-2, 2), ph: Math.random() }));
        const { m4, q, p, sc, e } = kit.TMP;
        sig.flap = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            const flap = Math.sin(t * 2.4); sig.flap = flap;
            wings.forEach(w => { w.arm.rotation.set(0, w.s * -0.5, w.s * (0.1 + flap * 0.3)); w.tip.rotation.z = w.s * flap * 0.25; });
            coreM.emissiveIntensity = 2 + Math.sin(t * 4) * 0.7;
            const path = k => { const a = t * 1.6 - k * 0.38; return [Math.cos(a) * (2.0 + Math.sin(k * 0.5) * 0.2), 0.8 + ((t * 0.9 - k * 0.12) % 6 + 6) % 6 + lift, Math.sin(a) * 2.0]; };
            fd.forEach((m, k) => { const [x, y, z] = path(k); m.position.set(x, y, z); const [x2, y2, z2] = path(k + 0.3); m.lookAt(x2, y2, z2); m.rotateY(Math.PI); });
            fhorns.forEach((h, i) => { h.position.copy(fd[0].position); h.quaternion.copy(fd[0].quaternion); h.translateX(i ? 0.18 : -0.18); h.translateY(0.25); h.translateZ(-0.25); h.rotateX(-0.6); });
            ep.forEach((o, i) => { const k = (t * 0.25 + o.ph) % 1; p.set(o.x + Math.sin(t * 2 + i) * 0.3, k * 6.5 + lift, o.z); q.setFromEuler(e.set(t * 3 + i, t, 0)); sc.setScalar(0.1 * (1 - k) + 0.02); emb.setMatrixAt(i, m4.compose(p, q, sc)); });
            emb.instanceMatrix.needsUpdate = true;
        });
    },

    /* 뇌조의 기수 — 깃털 망토와 깃 투구, 등에 펼친 번개 깃털 날개, 손에 번개 창,
       머리 위를 맴도는 작은 뇌조와 주위에 내리꽂는 번개 */
    stormRider({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, heldSword, bolt } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#060a16');
        const plume = new THREE.MeshStandardMaterial({ color: 0x1a2a6a, roughness: 0.4, metalness: 0.3, emissive: 0x0a1a5a, emissiveIntensity: 0.6 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xffd23a, roughness: 0.2, metalness: 0.85, emissive: 0x6a4a00, emissiveIntensity: 0.5 });
        const volt = glowMat(pick(0), 1);
        // 깃 투구 + 고글
        const helm = new THREE.Group(); helm.position.y = 0.2;
        box(plume, 1.38, 0.5, 1.38, 0, 0.5, 0, helm); box(gold, 1.42, 0.12, 1.42, 0, 0.28, 0, helm);
        box(glowMat(0x9fe8ff, 0.9), 1.0, 0.22, 0.06, 0, 0.05, 0.66, helm);
        for (let i = 0; i < 5; i++) { const f = box(i % 2 ? volt : gold, 0.12, 0.9 - i * 0.08, 0.12, 0, 1.0, 0.3 - i * 0.22, helm); f.rotation.x = -0.4 - i * 0.15; }
        attach(dummy.head, helm);
        // 깃털 망토
        const cloak = new THREE.Group(); cloak.position.set(0, 0.9, -0.62);
        const feathers = [];
        for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 5; c2++) feathers.push(box(r % 2 ? plume : new THREE.MeshStandardMaterial({ color: 0x2a4ab0, emissive: 0x0a2a8a, emissiveIntensity: 0.5 }), 0.42, 0.7, 0.06, (c2 - 2) * 0.44, -r * 0.55, -r * 0.05, cloak));
        attach(dummy.torso, cloak);
        // 번개 창
        const spear = heldSword(3.2, pick(0), '#ffd23a', 0.2, false); spear.position.set(0, -1.95, 0); spear.rotation.x = Math.PI * 0.62; attach(dummy.armL, spear);
        // 번개 깃털 날개
        const wings = [-1, 1].map(s => {
            const w = new THREE.Group(); w.position.set(s * 0.6, 3.9, -0.9); group.add(w);
            const fs = Array.from({ length: 7 }, (_, i) => { const f = new THREE.Group(); f.rotation.z = -s * (0.15 + i * 0.22); w.add(f); box(i % 2 ? plume : gold, 0.22, 2.6 - i * 0.15, 0.06, 0, (2.6 - i * 0.15) / 2, 0, f); const edge = box(volt, 0.06, 2.6 - i * 0.15, 0.08, s * 0.12, (2.6 - i * 0.15) / 2, 0, f); return { f, edge, i }; });
            return { w, s, fs };
        });
        // 작은 뇌조
        const bird = new THREE.Group(); group.add(bird);
        box(plume, 0.5, 0.4, 0.8, 0, 0, 0, bird); box(gold, 0.18, 0.15, 0.35, 0, 0.05, 0.5, bird);
        const bw = [-1, 1].map(s => { const g = new THREE.Group(); g.position.x = s * 0.25; bird.add(g); box(plume, 1.0, 0.06, 0.45, s * 0.5, 0, 0, g); box(volt, 1.0, 0.07, 0.06, s * 0.5, 0, 0.22, g); return g; });
        // 주위 번개
        const bolts = [0, 1, 2].map(() => { const b = bolt(7, glowMat(pick(1), 1)); b.visible = false; group.add(b); return { b, life: 0 }; });
        const rings = [0, 1].map(i => { const r = kit.square(2.4 + i * 1.2, 0.06, glowMat(pick(0), 0.6)); r.position.y = 0.06; group.add(r); return r; });
        sig.strike = 0;
        let next = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            wings.forEach(w => { w.w.position.y = 3.9 + lift; w.fs.forEach(o => { o.f.rotation.z = -w.s * (0.15 + o.i * 0.22 + Math.sin(t * 2.4 - o.i * 0.3) * 0.06); o.edge.material.opacity = 0.6 + 0.4 * Math.sin(t * 9 + o.i); }); });
            feathers.forEach((f, i) => { f.rotation.x = 0.1 + Math.sin(t * 3 - i * 0.4) * 0.06; });
            const a = t * 1.3; bird.position.set(Math.cos(a) * 2.4, 6.4 + lift + Math.sin(t * 2.6) * 0.3, Math.sin(a) * 2.4); bird.rotation.set(0, -a, Math.sin(t * 4) * 0.2); bw.forEach((g, i) => { g.rotation.z = (i ? -1 : 1) * Math.sin(t * 12) * 0.6; });
            rings.forEach((r, i) => { r.rotation.y = t * (i ? -0.8 : 0.5); r.scale.setScalar(1 + 0.05 * Math.sin(t * 6 + i)); });
            if (t > next) {
                next = t + rand(0.5, 1.2);
                const o = bolts.find(x => x.life <= 0) || bolts[0]; o.life = 0.18; o.b.visible = true;
                const ang = rand(0, Math.PI * 2), r = rand(2.2, 3.4);
                o.b.reshape([Math.cos(ang) * r * 0.6, 9, Math.sin(ang) * r * 0.6], [Math.cos(ang) * r, 0.1, Math.sin(ang) * r], 0.5);
                sig.strike = 1;
            }
            bolts.forEach(o => { if (o.life > 0) { o.life -= dt; o.b.visible = o.life > 0; } });
            sig.strike = Math.max(0, sig.strike - dt * 4);
        });
    },

    /* =================== 🆕 UPDATE 4 칭호 =================== */

    /* 천문학자 김티비 — 별 무늬 모자, 옆에 세운 놋쇠 망원경, 몸 주위를 도는 행성들, 머리 위로 이어지는 별자리 */
    astronomer({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, square } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#050818');
        const navy = new THREE.MeshStandardMaterial({ color: 0x1a2550, roughness: 0.6, emissive: 0x0a1030, emissiveIntensity: 0.4 });
        const brass = new THREE.MeshStandardMaterial({ color: 0xd9a84a, metalness: 0.85, roughness: 0.25, emissive: 0x3a2a00, emissiveIntensity: 0.3 });
        // 고깔모자
        const hat = new THREE.Group(); hat.position.y = 0.62;
        box(navy, 1.8, 0.12, 1.8, 0, 0, 0, hat); [1.1, 0.8, 0.5, 0.25].forEach((w, i) => box(navy, w, 0.45, w, 0, 0.25 + i * 0.4, -i * 0.08, hat));
        for (let i = 0; i < 6; i++) box(glowMat(0xffe9a0, 1), 0.08, 0.08, 0.02, rand(-0.45, 0.45), 0.3 + rand(0, 1.2), 0.56, hat);
        attach(dummy.head, hat);
        // 망원경 (삼각대 위에서 하늘을 향함)
        const scope = new THREE.Group(); scope.position.set(-2.2, 0, 0.6); group.add(scope);
        for (const a of [0, 2.1, 4.2]) { const l = box(brass, 0.08, 2.4, 0.08, Math.cos(a) * 0.35, 1.15, Math.sin(a) * 0.35, scope); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
        const tube = new THREE.Group(); tube.position.y = 2.4; scope.add(tube);
        box(brass, 0.32, 0.32, 1.8, 0, 0, 0.2, tube); box(navy, 0.42, 0.42, 0.3, 0, 0, 1.1, tube); box(glowMat(0x9fd8ff, 0.8), 0.3, 0.3, 0.04, 0, 0, 1.26, tube);
        // 행성들
        const planets = [[1.9, 0.28, 0xff8a5a, 1.1], [2.6, 0.38, 0x7ac8ff, 0.7], [3.3, 0.48, 0xffd38a, 0.45]].map(([r, s, col, sp], i) => {
            const g = new THREE.Group(); group.add(g);
            box(new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6, roughness: 0.5 }), s, s, s, 0, 0, 0, g);
            if (i === 2) { const rg = square(s * 2.4, 0.05, glowMat(0xffe9a0, 0.8)); rg.rotation.x = 0.4; g.add(rg); }
            const orbit = square(r * 2, 0.02, glowMat(pick(1), 0.25)); orbit.rotation.set(0.25, 0, 0.1); group.add(orbit);
            return { g, r, sp, orbit, ph: i * 2 };
        });
        // 별자리 (점과 선이 차례로 켜짐)
        const stars = [[-1.6, 7.2], [-0.6, 7.9], [0.4, 7.4], [1.4, 8.1], [2.1, 7.2], [0.9, 6.6]].map(([x, y]) => box(glowMat(0xffffff, 1), 0.14, 0.14, 0.14, x, y, -0.8));
        const lines = [];
        for (let i = 0; i < stars.length - 1; i++) { const a = stars[i].position, b = stars[i + 1].position; const l = box(glowMat(pick(0), 0.6), Math.hypot(b.x - a.x, b.y - a.y), 0.03, 0.03, (a.x + b.x) / 2, (a.y + b.y) / 2, -0.8); l.rotation.z = Math.atan2(b.y - a.y, b.x - a.x); lines.push(l); }
        sig.look = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            tube.rotation.set(-0.9 + Math.sin(t * 0.4) * 0.1, Math.sin(t * 0.3) * 0.3, 0);
            planets.forEach(p2 => { const a = t * p2.sp + p2.ph; p2.g.position.set(Math.cos(a) * p2.r, 3.2 + lift + Math.sin(a) * p2.r * 0.25, Math.sin(a) * p2.r); p2.g.rotation.y = t; p2.orbit.position.y = 3.2 + lift; });
            const k = (t * 0.35) % 1.4;
            stars.forEach((s, i) => { s.position.y = s.userData.y0 ?? (s.userData.y0 = s.position.y); s.position.y = s.userData.y0 + lift; s.material.opacity = Math.min(1, Math.max(0.15, (k * 6 - i))); s.scale.setScalar(0.14 * (1 + 0.4 * Math.sin(t * 5 + i))); });
            lines.forEach((l, i) => { l.position.y = (stars[i].position.y + stars[i + 1].position.y) / 2; l.material.opacity = Math.max(0, Math.min(0.7, k * 6 - i - 1)); });
            sig.look = Math.sin(t * 0.4);
        });
    },

    /* 그림자 검객 김건우 — 검은 목도리를 휘날리며 칼을 쥔 검객, 뒤에 늘어선 그림자 분신 셋,
       주위를 돌다 앞을 향해 정렬하는 그림자 칼날들, 발밑에서 피어오르는 그림자 연기 */
    shadowBlade({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, ghost, heldSword, sword } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#06040c');
        const black = new THREE.MeshStandardMaterial({ color: 0x0c0a14, roughness: 0.7 });
        // 목도리 (뒤로 길게 휘날림)
        const scarf = new THREE.Group(); scarf.position.set(0, -0.55, 0);
        box(black, 1.4, 0.35, 1.4, 0, 0, 0, scarf);
        const tails = Array.from({ length: 8 }, (_, i) => box(i % 2 ? black : glowMat(pick(0), 0.5), 0.35, 0.22, 0.5, 0.35, 0, -0.75 - i * 0.48, scarf));
        attach(dummy.head, scarf);
        const blade = heldSword(2.6, null, pick(0), 0.24, true); blade.position.set(0, -1.95, 0); blade.rotation.x = Math.PI * 0.58; attach(dummy.armR, blade);
        // 그림자 분신
        const clones = [-1, 1, 0].map((s, i) => { const g = ghost(pick(0), 0.18); g.position.set(s * 1.5, 0, -1.2 - i * 0.6); group.add(g); return g; });
        // 그림자 칼날 고리
        const blades = Array.from({ length: 8 }, (_, i) => { const s = sword(1.4, pick(0), '#000000', 0.2); group.add(s); return { s, a: i / 8 * Math.PI * 2 }; });
        // 연기
        const N = 26, smoke = new THREE.InstancedMesh(kit.BOX, glowMat(pick(1), 0.35), N); group.add(smoke);
        const sp = Array.from({ length: N }, () => ({ a: rand(0, 6.28), r: rand(0.6, 2.2), ph: Math.random() }));
        const { m4, q, p, sc, e } = kit.TMP;
        sig.draw = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            tails.forEach((m, i) => { m.position.x = 0.35 + Math.sin(t * 5 - i * 0.6) * 0.12 * i; m.position.y = Math.sin(t * 4 - i * 0.5) * 0.06 * i; });
            const c = (t % 4.5) / 4.5, aim = c > 0.6 ? Math.min(1, (c - 0.6) / 0.15) * (c > 0.9 ? Math.max(0, 1 - (c - 0.9) / 0.1) : 1) : 0;
            sig.draw = aim;
            blades.forEach((b, i) => {
                const a = b.a + t * 0.9;
                const ox = Math.cos(a) * 2.2, oz = Math.sin(a) * 2.2, oy = 2.8 + Math.sin(t * 2 + i) * 0.3;
                const tx = (i - 3.5) * 0.45, ty = 4.6 + Math.abs(i - 3.5) * -0.15, tz = 1.4;
                b.s.position.set(ox + (tx - ox) * aim, oy + (ty - oy) * aim + lift, oz + (tz - oz) * aim);
                b.s.rotation.set(aim * Math.PI / 2, aim ? 0 : -a, aim ? 0 : Math.PI / 2);
            });
            clones.forEach((g, i) => { g.position.y = lift + Math.sin(t * 1.5 + i) * 0.1; g.children.forEach(m => { m.material.opacity = 0.12 + 0.1 * Math.sin(t * 2 + i * 2); }); });
            sp.forEach((o, i) => { const k = (t * 0.3 + o.ph) % 1; p.set(Math.cos(o.a + t * 0.2) * o.r, k * 2.2, Math.sin(o.a + t * 0.2) * o.r); q.setFromEuler(e.set(t + i, t * 0.5, 0)); sc.setScalar(0.35 * (1 - k) + 0.05); smoke.setMatrixAt(i, m4.compose(p, q, sc)); });
            smoke.instanceMatrix.needsUpdate = true;
        });
    },

    /* 별을 벼리는 박지성 — 대장장이 앞치마와 큰 망치, 옆 모루 위에서 달궈지는 별,
       망치가 내려칠 때마다 불꽃이 튀고, 다 벼린 별은 하늘로 떠오름 */
    starForge({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#120804');
        const leather = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 });
        const iron = new THREE.MeshStandardMaterial({ color: 0x3a3a44, metalness: 0.85, roughness: 0.3 });
        const apron = new THREE.Group(); box(leather, 1.9, 1.9, 0.1, 0, -0.15, 0.58, apron); box(iron, 0.3, 0.3, 0.06, 0, 0.4, 0.64, apron); attach(dummy.torso, apron);
        // 망치
        const hammer = new THREE.Group(); hammer.position.set(0, -1.95, 0); hammer.rotation.x = Math.PI * 0.55;
        box(leather, 0.16, 2.0, 0.16, 0, 0.9, 0, hammer); box(iron, 0.6, 0.5, 0.95, 0, 2.0, 0, hammer); box(glowMat(pick(0), 0.8), 0.62, 0.08, 0.97, 0, 1.85, 0, hammer);
        attach(dummy.armR, hammer);
        // 모루 + 달궈지는 별
        const anvil = new THREE.Group(); anvil.position.set(1.7, 0, 1.3); anvil.rotation.y = -0.6; group.add(anvil);
        box(iron, 0.6, 0.7, 0.6, 0, 0.35, 0, anvil); box(iron, 0.9, 0.25, 0.5, 0, 0.8, 0, anvil); box(iron, 0.4, 0.3, 0.45, 0.6, 0.85, 0, anvil);
        const starM = new THREE.MeshStandardMaterial({ color: 0xfff0b0, emissive: pick(0), emissiveIntensity: 2.4 });
        const star = new THREE.Group(); star.position.y = 1.15; anvil.add(star);
        box(starM, 0.36, 0.36, 0.12, 0, 0, 0, star); box(starM, 0.36, 0.36, 0.12, 0, 0, 0, star).rotation.z = Math.PI / 4;
        // 떠오르는 완성된 별들
        const risen = Array.from({ length: 5 }, (_, i) => { const g = new THREE.Group(); box(glowMat(0xfff0b0, 1), 0.3, 0.3, 0.05, 0, 0, 0, g); box(glowMat(pick(0), 0.9), 0.3, 0.3, 0.05, 0, 0, 0, g).rotation.z = Math.PI / 4; group.add(g); return { g, ph: i / 5 }; });
        // 불꽃
        const N = 40, spark = new THREE.InstancedMesh(kit.BOX, glowMat(0xffc24a, 1), N); group.add(spark);
        const sp = Array.from({ length: N }, () => ({ v: new THREE.Vector3(rand(-1, 1), rand(1, 2.5), rand(-1, 1)) }));
        const { m4, q, p, sc, e } = kit.TMP;
        const forge = kit.square(3.2, 0.08, glowMat(pick(0), 0.6)); forge.position.y = 0.06; group.add(forge);
        sig.strike = 0;
        let sparkT = 9;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = (t % 1.6) / 1.6;
            sig.strike = c < 0.6 ? c / 0.6 : Math.max(0, 1 - (c - 0.6) / 0.1);
            if (c > 0.6 && c - dt / 1.6 <= 0.6) sparkT = 0;
            sparkT += dt;
            starM.emissiveIntensity = 2 + Math.max(0, 1 - sparkT * 3) * 3; star.rotation.z = t * 0.5;
            sp.forEach((o, i) => { const k = Math.min(1, sparkT / 0.8); p.set(anvil.position.x + o.v.x * k * 1.6, 1.2 + o.v.y * k - 4 * k * k + lift * 0, anvil.position.z + o.v.z * k * 1.6); sc.setScalar(k < 1 ? 0.08 * (1 - k) : 0); q.identity(); spark.setMatrixAt(i, m4.compose(p, q, sc)); });
            spark.instanceMatrix.needsUpdate = true;
            risen.forEach((r, i) => { const k = (t * 0.12 + r.ph) % 1; r.g.position.set(1.7 + Math.sin(t + i) * 0.6 * k, 1.4 + k * 7 + lift, 1.3 - k * 2); r.g.rotation.z = t * 2 + i; r.g.scale.setScalar(0.6 + k * 1.4); r.g.children.forEach(m => { m.material.opacity = Math.sin(k * Math.PI); }); });
            forge.rotation.y = t * 0.2;
        });
    },

    /* 파도를 부르는 김가은 — 조개 왕관, 몸을 휘감아 오르는 물결 고리, 등 뒤에서 솟아오르는 물기둥,
       주위를 헤엄치는 물고기 떼와 떠오르는 물방울 */
    tideCaller({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, square } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#03101c');
        const water = new THREE.MeshStandardMaterial({ color: 0x3ac8ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, emissive: 0x0a5a8a, emissiveIntensity: 0.6 });
        const shell = new THREE.MeshStandardMaterial({ color: 0xffd8e8, roughness: 0.4, emissive: 0x6a3a4a, emissiveIntensity: 0.3 });
        const crown = new THREE.Group(); crown.position.y = 0.72;
        for (let i = 0; i < 5; i++) { const s = box(shell, 0.3, 0.5 - Math.abs(i - 2) * 0.08, 0.08, (i - 2) * 0.26, 0.2, 0.6, crown); s.rotation.z = (i - 2) * -0.15; }
        box(glowMat(0xffffff, 0.9), 0.14, 0.14, 0.14, 0, 0.15, 0.7, crown);
        attach(dummy.head, crown);
        // 휘감아 오르는 물결
        const helix = Array.from({ length: 36 }, (_, i) => box(i % 4 ? water : glowMat(pick(0), 0.8), 0.32, 0.18, 0.32, 0, 0, 0));
        // 물기둥 다섯
        const pillars = [-2, -1, 0, 1, 2].map((k, i) => { const g = new THREE.Group(); g.position.set(k * 1.1, 0, -1.8 - Math.abs(k) * 0.3); group.add(g); const segs = Array.from({ length: 10 }, (_, j) => box(j % 3 ? water : glowMat(pick(1), 0.6), 0.6 - j * 0.03, 0.55, 0.6 - j * 0.03, 0, j * 0.5 + 0.25, 0, g)); return { g, segs, ph: i * 0.7 }; });
        // 물고기
        const fish = Array.from({ length: 7 }, (_, i) => { const g = new THREE.Group(); group.add(g); const col = [0xffa04a, 0x7af0ff, 0xff7ab6][i % 3]; const m = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5 }); box(m, 0.18, 0.2, 0.4, 0, 0, 0, g); const tail = box(m, 0.04, 0.22, 0.18, 0, 0, -0.28, g); return { g, tail, a: i / 7 * Math.PI * 2, r: 2 + (i % 3) * 0.5, y: 1.2 + (i % 4) * 1.1, sp: 0.7 + (i % 3) * 0.2 }; });
        const N = 30, bub = new THREE.InstancedMesh(kit.BOX, glowMat(0xd8f8ff, 0.8), N); group.add(bub);
        const bp = Array.from({ length: N }, () => ({ x: rand(-2.6, 2.6), z: rand(-2, 2), ph: Math.random() }));
        const { m4, q, p, sc, e } = kit.TMP;
        sig.call = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            helix.forEach((m, i) => { const k = i / helix.length, a = t * 2 + k * Math.PI * 4; m.position.set(Math.cos(a) * (1.5 + k * 0.3), 0.3 + k * 5.6 + lift, Math.sin(a) * (1.5 + k * 0.3)); m.rotation.y = -a; });
            const call = (Math.sin(t * 0.9) + 1) / 2; sig.call = call;
            pillars.forEach(pl => { pl.segs.forEach((s, j) => { const h = Math.max(0, call * 10 - j - Math.abs(pl.g.position.x)); s.visible = h > 0; s.position.x = Math.sin(t * 3 + j * 0.6 + pl.ph) * 0.12 * j * 0.3; s.scale.y = Math.min(1, h) * 0.55; }); });
            fish.forEach((f, i) => { const a = f.a + t * f.sp; f.g.position.set(Math.cos(a) * f.r, f.y + lift + Math.sin(t * 2 + i) * 0.2, Math.sin(a) * f.r); f.g.rotation.y = -a; f.tail.rotation.y = Math.sin(t * 12 + i) * 0.5; });
            bp.forEach((o, i) => { const k = (t * 0.25 + o.ph) % 1; p.set(o.x + Math.sin(t * 2 + i) * 0.15, k * 6.5 + lift, o.z); q.identity(); sc.setScalar(0.09 * (0.5 + k)); bub.setMatrixAt(i, m4.compose(p, q, sc)); });
            bub.instanceMatrix.needsUpdate = true;
        });
    },

    /* 시계탑의 주인 공병은 — 실크해트와 외눈 안경, 등 뒤의 거대한 시계(초침이 빙빙),
       맞물려 도는 톱니바퀴들과 흔들리는 진자, 흩날리는 모래 시간 */
    clockTower({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, square } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#0c0a06');
        const brass = new THREE.MeshStandardMaterial({ color: 0xd9a84a, metalness: 0.9, roughness: 0.25, emissive: 0x3a2a00, emissiveIntensity: 0.35 });
        const black = new THREE.MeshStandardMaterial({ color: 0x14110c, roughness: 0.5 });
        const face = new THREE.MeshStandardMaterial({ color: 0xf2e6c8, roughness: 0.5, emissive: 0x6a5a30, emissiveIntensity: 0.35 });
        // 실크해트 + 외눈 안경
        const hat = new THREE.Group(); hat.position.y = 0.62;
        box(black, 1.7, 0.1, 1.7, 0, 0, 0, hat); box(black, 1.05, 1.0, 1.05, 0, 0.55, 0, hat); box(brass, 1.08, 0.15, 1.08, 0, 0.18, 0, hat);
        attach(dummy.head, hat);
        const mono = new THREE.Group(); box(brass, 0.36, 0.36, 0.04, 0.3, 0.1, 0.64, mono); box(glowMat(0xfff3c0, 0.6), 0.26, 0.26, 0.05, 0.3, 0.1, 0.65, mono); attach(dummy.head, mono);
        // 등 뒤 큰 시계
        const clock = new THREE.Group(); clock.position.set(0, 4.4, -1.8); group.add(clock);
        const R = 2.6;
        for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; box(brass, 0.5, 0.2, 0.2, Math.cos(a) * R, Math.sin(a) * R, 0, clock).rotation.z = a + Math.PI / 2; }
        for (let r = 0; r < 5; r++) box(face, (R - 0.15) * 2 * Math.sin(Math.acos((r - 2) / 2.6)), (R * 2) / 5.2, 0.05, 0, (r - 2) * (R * 2 / 5.2), -0.05, clock);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(i % 3 ? black : glowMat(pick(0), 1), 0.12, i % 3 ? 0.3 : 0.5, 0.06, Math.sin(a) * (R - 0.45), Math.cos(a) * (R - 0.45), 0.02, clock).rotation.z = -a; }
        const hands = [[1.4, 0.14], [2.0, 0.09], [2.2, 0.04]].map(([l, w], i) => { const h = new THREE.Group(); h.position.z = 0.06 + i * 0.02; clock.add(h); box(i === 2 ? glowMat(pick(1), 1) : black, w, l, 0.03, 0, l / 2 - 0.15, 0, h); return h; });
        box(brass, 0.3, 0.3, 0.1, 0, 0, 0.12, clock);
        // 진자
        const pend = new THREE.Group(); pend.position.set(0, -R, 0); clock.add(pend);
        box(brass, 0.06, 1.6, 0.06, 0, -0.8, 0, pend); box(brass, 0.55, 0.55, 0.12, 0, -1.7, 0, pend).rotation.z = Math.PI / 4;
        // 톱니바퀴
        const gear = (r, teeth, mat) => { const g = new THREE.Group(); box(mat, r * 1.4, r * 1.4, 0.12, 0, 0, 0, g).rotation.z = Math.PI / 4; box(mat, r * 1.4, r * 1.4, 0.12, 0, 0, 0, g); for (let i = 0; i < teeth; i++) { const a = i / teeth * Math.PI * 2; box(mat, 0.18, 0.22, 0.12, Math.cos(a) * r, Math.sin(a) * r, 0, g).rotation.z = a; } box(black, r * 0.4, r * 0.4, 0.14, 0, 0, 0.02, g); return g; };
        const gears = [[2.6, 6.6, -1.2, 0.7, 10, 1], [-2.7, 6.1, -1.0, 0.55, 8, -1.3], [-3.0, 2.2, -0.6, 0.8, 12, 0.8], [2.9, 1.8, -0.4, 0.5, 8, -1.5]].map(([x, y, z, r, n, sp]) => { const g = gear(r, n, brass); g.position.set(x, y, z); group.add(g); return { g, sp, y }; });
        // 모래 시간
        const N = 30, sand = new THREE.InstancedMesh(kit.BOX, glowMat(0xffd98a, 0.9), N); group.add(sand);
        const sp = Array.from({ length: N }, () => ({ a: rand(0, 6.28), r: rand(1.2, 3), ph: Math.random() }));
        const { m4, q, p, sc, e } = kit.TMP;
        sig.tock = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            clock.position.y = 4.4 + lift;
            hands[0].rotation.z = -t * 0.08; hands[1].rotation.z = -t * 0.6; hands[2].rotation.z = -Math.floor(t * 2) * (Math.PI / 30);
            pend.rotation.z = Math.sin(t * 2.4) * 0.35; sig.tock = Math.sin(t * 2.4);
            gears.forEach(o => { o.g.rotation.z = t * o.sp; o.g.position.y = o.y + lift; });
            sp.forEach((o, i) => { const k = (t * 0.2 + o.ph) % 1; p.set(Math.cos(o.a + k * 3) * o.r, 6 - k * 6 + lift, Math.sin(o.a + k * 3) * o.r); q.identity(); sc.setScalar(0.06); sand.setMatrixAt(i, m4.compose(p, q, sc)); });
            sand.instanceMatrix.needsUpdate = true;
        });
    },

    /* 일식의 김건우 — 등 뒤에 떠오른 검은 태양과 불꽃 코로나, 한 바퀴씩 휘어 솟는 홍염,
       어둠의 망토와 손 위에 띄운 작은 일식 구슬, 주위를 도는 검은 파편 */
    eclipse({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, glowMat, rand, square } = kit;
        const { box, attach } = sk(group, kit, stage);
        stage.setSky('#030202');
        const dark = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.4, metalness: 0.4, emissive: 0x1a0a00, emissiveIntensity: 0.4 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xffb03a, metalness: 0.9, roughness: 0.2, emissive: 0x6a3a00, emissiveIntensity: 0.6 });
        // 왕관 (해살 모양)
        const crown = new THREE.Group(); crown.position.y = 0.66;
        box(gold, 1.3, 0.18, 1.3, 0, 0, 0, crown);
        for (let i = 0; i < 9; i++) { const x = (i - 4) * 0.15; const h = 0.3 + (4 - Math.abs(i - 4)) * 0.1; box(gold, 0.08, h, 0.08, x, h / 2 + 0.08, 0.62, crown); }
        box(new THREE.MeshBasicMaterial({ color: 0x000000 }), 0.22, 0.22, 0.05, 0, 0.35, 0.66, crown);
        attach(dummy.head, crown);
        // 망토
        const cape = new THREE.Group(); cape.position.set(0, 0.95, -0.62);
        const capeSegs = Array.from({ length: 6 }, (_, i) => { const g = new THREE.Group(); g.position.y = -i * 0.55; cape.add(g); box(dark, 2.4, 0.56, 0.08, 0, 0, 0, g); box(glowMat(pick(0), 0.4), 2.42, 0.04, 0.09, 0, -0.26, 0, g); return g; });
        attach(dummy.torso, cape);
        // 검은 태양 + 코로나 + 홍염
        const sun = new THREE.Group(); sun.position.set(0, 5.6, -2.0); group.add(sun);
        const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), new THREE.MeshBasicMaterial({ color: 0x000000 })); disc.position.z = 0.05; sun.add(disc);
        const halo = new THREE.Mesh(new THREE.CircleGeometry(2.05, 40), glowMat(0xffe0a0, 0.95)); sun.add(halo);
        const halo2 = new THREE.Mesh(new THREE.CircleGeometry(2.8, 40), glowMat(pick(0), 0.35)); halo2.position.z = -0.05; sun.add(halo2);
        const rays = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2; const m = box(glowMat(i % 2 ? pick(0) : 0xffe0a0, 0.6), 0.1, 1.2, 0.02, Math.cos(a) * 2.5, Math.sin(a) * 2.5, -0.02, sun); m.rotation.z = a - Math.PI / 2; return { m, a }; });
        const prom = Array.from({ length: 3 }, (_, k) => Array.from({ length: 12 }, (_, i) => box(glowMat(pick(1), 0.8), 0.16, 0.16, 0.02, 0, 0, 0.02, sun)));
        // 손 위 일식 구슬
        const orb = new THREE.Group(); orb.position.set(0, -2.3, 0.2); attach(dummy.armR, orb);
        box(new THREE.MeshBasicMaterial({ color: 0x000000 }), 0.3, 0.3, 0.3, 0, 0, 0, orb);
        const orbHalo = box(glowMat(0xffc24a, 0.8), 0.45, 0.45, 0.45, 0, 0, 0, orb);
        // 검은 파편
        const shards = Array.from({ length: 14 }, (_, i) => ({ m: box(i % 3 ? dark : glowMat(pick(0), 0.9), 0.2, 0.36, 0.2, 0, 0, 0), a: i / 14 * Math.PI * 2, r: 2.2 + (i % 3) * 0.4, y: 0.8 + (i % 5) * 0.9 }));
        sig.flare = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            sun.position.y = 5.6 + lift;
            halo.scale.setScalar(1 + Math.sin(t * 2) * 0.03); halo2.scale.setScalar(1 + Math.sin(t * 1.3) * 0.08);
            rays.forEach((r, i) => { const l = 1 + 0.5 * Math.sin(t * 3 + i * 1.7); r.m.scale.y = 1.2 * l; r.m.position.set(Math.cos(r.a) * (2.1 + 0.6 * l), Math.sin(r.a) * (2.1 + 0.6 * l), -0.02); });
            prom.forEach((arc, k) => { const base = t * 0.3 + k * 2.1, ph = ((t * 0.5 + k / 3) % 1); arc.forEach((m, i) => { const u = i / 11, a = base + u * 0.9, h = Math.sin(u * Math.PI) * 1.2 * Math.sin(ph * Math.PI); m.position.set(Math.cos(a) * (1.8 + h), Math.sin(a) * (1.8 + h), 0.02); m.material.opacity = 0.8 * Math.sin(ph * Math.PI); }); });
            capeSegs.forEach((g, i) => { g.rotation.x = 0.1 + Math.sin(t * 2 - i * 0.6) * 0.05 * i; });
            orb.rotation.set(t, t * 1.3, 0); orbHalo.scale.setScalar(0.45 * (1 + Math.sin(t * 5) * 0.15) / 0.45);
            shards.forEach((s, i) => { const a = s.a + t * 0.7; s.m.position.set(Math.cos(a) * s.r, s.y + lift + Math.sin(t * 2 + i) * 0.2, Math.sin(a) * s.r); s.m.rotation.set(t * 2 + i, t, 0.4); });
            sig.flare = Math.sin(t * 0.8);
        });
    },

    /* =================== 🎫 시즌 패스 칭호 =================== */

    /* 시즌1 개척자 — 등에 멘 배낭과 깃발, 발밑에 펼쳐지는 지도, 주위를 도는 나침반 */
    pioneer({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const canvas = new THREE.MeshStandardMaterial({ color: 0xc8a06a, roughness: 0.8 });
        const strap = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.7 });
        // 탐험모 + 배낭
        const hat = new THREE.Group(); hat.position.y = 0.6;
        box(canvas, 1.7, 0.1, 1.7, 0, 0, 0, hat); box(canvas, 1.1, 0.45, 1.1, 0, 0.25, 0, hat); box(strap, 1.12, 0.12, 1.12, 0, 0.08, 0, hat);
        attach(dummy.head, hat);
        const pack = new THREE.Group(); pack.position.set(0, 0.1, -0.85);
        box(canvas, 1.6, 1.8, 0.7, 0, 0, 0, pack); box(strap, 1.62, 0.15, 0.72, 0, 0.4, 0, pack); box(new THREE.MeshStandardMaterial({ color: 0x3a6ab0 }), 1.5, 0.35, 0.4, 0, -1.05, 0.05, pack);
        // 배낭에 꽂힌 깃발
        const pole = box(new THREE.MeshStandardMaterial({ color: 0x8a6a40 }), 0.08, 3.2, 0.08, 0.6, 1.9, 0, pack);
        const flag = new THREE.Group(); flag.position.set(0.6, 3.1, 0); pack.add(flag);
        const fseg = Array.from({ length: 6 }, (_, i) => box(new THREE.MeshStandardMaterial({ color: i % 2 ? new THREE.Color(pick(0)) : new THREE.Color(pick(1)), emissive: pick(0), emissiveIntensity: 0.3, side: THREE.DoubleSide }), 0.24, 0.7, 0.03, 0.12 + i * 0.22, 0, 0, flag));
        attach(dummy.torso, pack);
        // 발밑 지도 (격자 + 길 + X 표시)
        const map = new THREE.Group(); map.position.y = 0.04; group.add(map);
        box(new THREE.MeshStandardMaterial({ color: 0xe8d4a0, roughness: 0.9 }), 6, 0.04, 4.4, 0, 0, 0, map);
        for (let i = -2; i <= 2; i++) { box(glowMat(0x8a6a40, 0.35), 6, 0.05, 0.03, 0, 0.01, i * 0.9, map); box(glowMat(0x8a6a40, 0.35), 0.03, 0.05, 4.4, i * 1.2, 0.01, 0, map); }
        const path = [];
        for (let i = 0; i < 14; i++) path.push(box(glowMat(pick(1), 0.9), 0.14, 0.06, 0.14, -2.6 + i * 0.4, 0.03, Math.sin(i * 0.7) * 1.3));
        const xm = new THREE.Group(); xm.position.set(2.7, 0.04, Math.sin(13 * 0.7) * 1.3); map.add(xm);
        box(glowMat(0xff4a5a, 1), 0.6, 0.06, 0.12, 0, 0, 0, xm).rotation.y = 0.785; box(glowMat(0xff4a5a, 1), 0.6, 0.06, 0.12, 0, 0, 0, xm).rotation.y = -0.785;
        // 도는 나침반
        const comp = new THREE.Group(); group.add(comp);
        const rim = square(1.2, 0.08, glowMat(pick(1), 0.9)); rim.rotation.x = Math.PI / 2; comp.add(rim);
        const needle = new THREE.Group(); comp.add(needle);
        box(glowMat(0xff4a5a, 1), 0.1, 0.5, 0.04, 0, 0.25, 0, needle); box(glowMat(0xffffff, 1), 0.1, 0.5, 0.04, 0, -0.25, 0, needle);
        sig.step = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            fseg.forEach((b, i) => { b.position.z = Math.sin(t * 5 - i * 0.8) * 0.08 * i; b.rotation.y = Math.sin(t * 5 - i * 0.8) * 0.25; });
            const k = (t * 0.4) % 1;
            path.forEach((b, i) => { b.material.opacity = 0.25 + 0.75 * Math.max(0, 1 - Math.abs(i / 13 - k) * 5); });
            xm.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
            comp.position.set(Math.cos(t * 0.8) * 2.6, 3.6 + Math.sin(t * 1.6) * 0.3 + lift, Math.sin(t * 0.8) * 2.6);
            comp.rotation.y = -t * 0.8;
            needle.rotation.z = Math.sin(t * 2.2) * 0.8;
            sig.step = Math.sin(t * 3);
        });
    },

    /* 황금 개척왕 — 황금 갑옷과 망토, 뒤에 꽂힌 황금 깃발 셋, 발밑이 황금으로 물들고 금화가 쏟아짐 */
    goldKing({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#120c02');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const gold = new THREE.MeshStandardMaterial({ color: 0xffcf4a, metalness: 0.9, roughness: 0.22, emissive: 0x6a4500, emissiveIntensity: 0.5 });
        const red = new THREE.MeshStandardMaterial({ color: 0xb01830, roughness: 0.6 });
        // 갑옷 + 왕관
        const armor = new THREE.Group(); armor.add(box(gold, 2.16, 2.14, 1.16, 0, 0, 0, armor));
        box(new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffd23a, emissiveIntensity: 0.8 }), 0.5, 0.5, 0.06, 0, 0.3, 0.6, armor).rotation.z = 0.785;
        for (const s of [-1, 1]) box(gold, 0.9, 0.5, 1.3, s * 1.25, 0.85, 0, armor);   // 어깨 갑옷
        attach(dummy.torso, armor);
        const crown = new THREE.Group(); crown.position.y = 0.72;
        box(gold, 1.3, 0.3, 1.3, 0, 0, 0, crown);
        for (let i = 0; i < 4; i++) for (const s of [-1, 1]) box(gold, 0.2, 0.4, 0.2, (i - 1.5) * 0.36, 0.3, s * 0.55, crown);
        box(new THREE.MeshStandardMaterial({ color: 0xff3b5c, emissive: 0xff3b5c, emissiveIntensity: 0.8 }), 0.22, 0.22, 0.1, 0, 0.05, 0.66, crown);
        attach(dummy.head, crown);
        // 망토
        const cape = new THREE.Group(); cape.position.set(0, 0.9, -0.62);
        const capeSegs = Array.from({ length: 5 }, (_, i) => box(red, 2.2, 0.62, 0.1, 0, -i * 0.6, 0, cape));
        attach(dummy.torso, cape);
        // 뒤에 꽂힌 황금 깃발 셋
        const flags = [-3.4, 0, 3.4].map((x, k) => {
            const g = new THREE.Group(); g.position.set(x, 0, -3 - (k === 1 ? 1.2 : 0)); g.userData.noFit = true; group.add(g);
            box(gold, 0.16, 7.5 + (k === 1 ? 1.5 : 0), 0.16, 0, 3.75 + (k === 1 ? 0.75 : 0), 0, g);
            const fl = new THREE.Group(); fl.position.y = 7 + (k === 1 ? 1.5 : 0); g.add(fl);
            const segs = Array.from({ length: 6 }, (_, i) => box(new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffcf4a : 0xb01830, metalness: i % 2 ? 0.8 : 0, roughness: 0.4, side: THREE.DoubleSide }), 0.36, 1.4, 0.04, 0.2 + i * 0.34, -0.6, 0, fl));
            return segs;
        });
        // 황금으로 물드는 바닥
        const floor = new THREE.Group(); floor.position.y = 0.05; group.add(floor);
        const tiles = [];
        for (let x = -3; x <= 3; x++) for (let z = -3; z <= 2; z++) { const tl = box(gold.clone(), 0.95, 0.04, 0.95, x, 0, z, floor); tl.userData.d = Math.hypot(x, z); tiles.push(tl); }
        // 떨어지는 금화
        const N = 40, coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.95, roughness: 0.2, emissive: 0x6a4500, emissiveIntensity: 0.6 }), N);
        group.add(coins);
        const cp = Array.from({ length: N }, () => ({ x: rand(-4, 4), z: rand(-2.5, 2.5), ph: Math.random(), sp: rand(0.25, 0.45), r: rand(0, 6) }));
        sig.rule = 0;
        tick(t => {
            capeSegs.forEach((b, i) => { b.rotation.x = 0.1 + Math.sin(t * 2.2 - i * 0.6) * 0.06 * i; b.position.z = -i * 0.08; });
            flags.forEach((segs, k) => segs.forEach((b, i) => { b.position.z = Math.sin(t * 4 + k - i * 0.8) * 0.1 * i; b.rotation.y = Math.sin(t * 4 + k - i * 0.8) * 0.3; }));
            const wave = (t * 1.5) % 6;
            tiles.forEach(tl => { const k = Math.max(0, 1 - Math.abs(tl.userData.d - wave) * 0.8); tl.material.emissiveIntensity = 0.3 + k * 1.2; tl.position.y = k * 0.12; });
            cp.forEach((c, i) => { const k = (t * c.sp + c.ph) % 1; TMP.p.set(c.x, 9 - k * 9, c.z); TMP.e.set(t * 3 + c.r, t * 2, c.r); TMP.q.setFromEuler(TMP.e); TMP.sc.setScalar(1); coins.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc)); });
            coins.instanceMatrix.needsUpdate = true;
            sig.rule = Math.max(0, Math.sin(t * 0.8));
        });
    },

    /* =================== 🆕 새 칭호 (v43) =================== */

    /* 연금술사 김가은 — 손 위에서 끓는 플라스크, 주위를 도는 약병, 바닥의 변환진 */
    alchemist({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        // 고글 + 망토
        const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.7, roughness: 0.3 });
        const goggle = new THREE.Group(); goggle.position.set(0, 0.35, 0.62);
        box(brass, 1.3, 0.14, 0.1, 0, 0, 0, goggle);
        for (const x of [-0.3, 0.3]) box(glowMat(pick(1), 0.9), 0.36, 0.3, 0.12, x, 0, 0.04, goggle);
        attach(dummy.head, goggle);
        const coat = new THREE.MeshStandardMaterial({ color: 0x3a2a5a, roughness: 0.7 });
        attach(dummy.torso, (() => { const b = new THREE.Mesh(BOX, coat); b.scale.set(2.14, 2.12, 1.14); return b; })());
        // 손 위 플라스크 (왼손 = armR)
        const flask = new THREE.Group(); flask.position.set(0, -2.4, 0.2);
        const glass = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 });
        box(glass, 0.7, 0.6, 0.7, 0, 0, 0, flask); box(glass, 0.25, 0.4, 0.25, 0, 0.5, 0, flask);
        const liquid = box(glowMat(pick(0), 0.9), 0.6, 0.35, 0.6, 0, -0.1, 0, flask);
        attach(dummy.armR, flask);
        const bub = [];
        for (let i = 0; i < 8; i++) bub.push(box(glowMat(pick(0), 0.8), 0.1, 0.1, 0.1, 0, 0, 0, flask));
        // 주위를 도는 약병들
        const vials = [0, 1, 2, 3, 4].map(i => {
            const v = new THREE.Group(); group.add(v);
            box(glass, 0.36, 0.6, 0.36, 0, 0, 0, v); box(glowMat(pick(i % 3), 0.9), 0.28, 0.36, 0.28, 0, -0.1, 0, v);
            box(new THREE.MeshStandardMaterial({ color: 0x8a5a2a }), 0.22, 0.14, 0.22, 0, 0.36, 0, v);
            return v;
        });
        // 변환진: 사각+삼각 무늬 회전
        const circle = new THREE.Group(); circle.position.y = 0.06; group.add(circle);
        const rings = [3.2, 4.6].map((s, i) => { const r = square(s, 0.07, glowMat(pick(i), 0.6)); circle.add(r); return r; });
        for (let i = 0; i < 3; i++) { const l = box(glowMat(pick(1), 0.5), 0.06, 0.04, 3.9, 0, 0, 0, circle); l.rotation.y = (i / 3) * Math.PI; l.position.set(Math.cos(i / 3 * Math.PI * 2) * 1.1, 0, Math.sin(i / 3 * Math.PI * 2) * 1.1); }
        const runes = [];
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; runes.push(box(glowMat(pick(2), 0.8), 0.25, 0.04, 0.25, Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2, circle)); }
        sig.brew = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            const c = (t % 5) / 5; sig.brew = c > 0.7 ? Math.sin((c - 0.7) / 0.3 * Math.PI) : 0;
            liquid.scale.y = 0.35 + Math.sin(t * 6) * 0.05 + sig.brew * 0.2;
            bub.forEach((b, i) => { const k = (t * 1.5 + i / 8) % 1; b.position.set(Math.sin(i * 2.3) * 0.2, -0.1 + k * (1.4 + sig.brew * 2), Math.cos(i * 2.3) * 0.2); b.scale.setScalar(0.1 * (1 - k) + 0.03); });
            vials.forEach((v, i) => { const a = t * 0.8 + (i / 5) * Math.PI * 2; v.position.set(Math.cos(a) * 2.6, 2.8 + Math.sin(t * 1.6 + i) * 0.4 + lift, Math.sin(a) * 2.6); v.rotation.set(Math.sin(t + i) * 0.3, -a, Math.sin(t * 1.3 + i) * 0.3); });
            circle.rotation.y = t * 0.3 * (1 + sig.brew * 3);
            rings.forEach((r, i) => { r.rotation.y = t * (i ? -0.5 : 0.4); });
            runes.forEach((r, i) => { r.material.opacity = 0.4 + Math.max(0, Math.sin(t * 3 - i)) * 0.6; });
        });
    },

    /* 서커스 단장 김건우 — 실크햇과 지팡이, 줄무늬 천막 무대, 위에서 저글링 공이 돌고 스포트라이트 */
    ringmaster({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand } = kit;
        stage.setSky('#120612');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const black = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.5 });
        const red = new THREE.MeshStandardMaterial({ color: 0xd8203a, roughness: 0.6 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xffc94d, metalness: 0.6, roughness: 0.3 });
        // 실크햇
        const hat = new THREE.Group(); hat.position.y = 0.62;
        box(black, 1.6, 0.1, 1.6, 0, 0, 0, hat); box(black, 1.0, 1.0, 1.0, 0, 0.55, 0, hat); box(red, 1.02, 0.18, 1.02, 0, 0.15, 0, hat);
        attach(dummy.head, hat);
        // 빨간 연미복 + 금단추
        const coat = new THREE.Group(); coat.add(box(red, 2.14, 2.12, 1.14, 0, 0, 0, coat));
        for (let i = 0; i < 3; i++) coat.add(box(gold, 0.16, 0.16, 0.06, 0, 0.6 - i * 0.5, 0.6, coat));
        attach(dummy.torso, coat);
        // 지팡이 (오른손 = armL)
        const cane = new THREE.Group(); cane.position.set(0, -2.1, 0.3);
        box(black, 0.12, 2.6, 0.12, 0, -0.4, 0, cane); box(gold, 0.26, 0.26, 0.26, 0, 0.95, 0, cane);
        attach(dummy.armL, cane);
        // 줄무늬 천막 (뒤쪽 반원)
        const tent = new THREE.Group(); tent.position.z = -6; group.add(tent);
        for (let i = 0; i < 14; i++) {
            const a = Math.PI * (i / 13), x = Math.cos(a) * 10, z = -Math.sin(a) * 4;
            const s = box(i % 2 ? red : new THREE.MeshStandardMaterial({ color: 0xf6efe6, roughness: 0.7 }), 2.4, 12, 0.3, x, 6, z, tent);
            s.rotation.y = a - Math.PI / 2;
        }
        // 동그란 무대 테두리 (블록)
        for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; box(i % 2 ? red : gold, 0.6, 0.3, 0.6, Math.cos(a) * 3.6, 0.15, Math.sin(a) * 3.6); }
        // 저글링 공
        const balls = [0, 1, 2, 3, 4].map(i => box(new THREE.MeshStandardMaterial({ color: pick(i % 3), emissive: pick(i % 3), emissiveIntensity: 0.5 }), 0.4, 0.4, 0.4, 0, 0, 0));
        // 스포트라이트 두 개
        const spots = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 6, 12, -2); group.add(g); const b = box(glowMat(0xfff2c0, 0.1), 2, 13, 2, 0, -6.5, 0, g); return { g, s }; });
        sig.toss = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            balls.forEach((b, i) => {
                const k = (t * 0.9 + i / 5) % 1, side = Math.floor(t * 0.9 + i / 5) % 2 ? 1 : -1;
                b.position.set(side * (1 - 2 * k) * 1.6, 6.3 + Math.sin(k * Math.PI) * 2.4 + lift, 0.8);
                b.rotation.set(t * 3, t * 2, 0);
            });
            sig.toss = Math.sin(t * 5.65) * 0.5 + 0.5;
            spots.forEach(({ g, s }, i) => { g.rotation.z = s * 0.45 + Math.sin(t * 0.9 + i * 2) * 0.12; });
        });
    },

    /* 등대지기 김티비 — 등 뒤 바다 위 등대가 빛을 돌리고, 파도 블록이 출렁 */
    lighthouse({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#030a16');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        // 비옷 + 손전등 랜턴
        const yellow = new THREE.MeshStandardMaterial({ color: 0xffc928, roughness: 0.5 });
        attach(dummy.torso, (() => { const b = new THREE.Mesh(BOX, yellow); b.scale.set(2.14, 2.12, 1.14); return b; })());
        const hood = new THREE.Group(); hood.position.y = 0.55; box(yellow, 1.4, 0.3, 1.4, 0, 0, 0, hood); box(yellow, 1.7, 0.08, 1.7, 0, -0.1, 0.1, hood);
        attach(dummy.head, hood);
        const lantern = new THREE.Group(); lantern.position.set(0, -2.4, 0.2);
        box(new THREE.MeshStandardMaterial({ color: 0x2a2a30 }), 0.5, 0.08, 0.5, 0, 0.35, 0, lantern);
        const flame = box(glowMat(0xffe7a0, 1), 0.34, 0.5, 0.34, 0, 0, 0, lantern);
        attach(dummy.armR, lantern);
        // 등대
        const lh = new THREE.Group(); lh.position.set(-7, 0, -9); lh.userData.noFit = true; group.add(lh);
        for (let i = 0; i < 8; i++) box(new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd8203a : 0xf4f0ea, roughness: 0.6 }), 2.2 - i * 0.12, 1.4, 2.2 - i * 0.12, 0, 0.7 + i * 1.4, 0, lh);
        box(new THREE.MeshStandardMaterial({ color: 0x222222 }), 1.8, 0.2, 1.8, 0, 11.4, 0, lh);
        const lamp = box(glowMat(0xfff2c0, 1), 0.9, 0.9, 0.9, 0, 12.1, 0, lh);
        box(new THREE.MeshStandardMaterial({ color: 0x222222 }), 1.4, 0.5, 1.4, 0, 12.9, 0, lh);
        const beam = new THREE.Group(); beam.position.set(0, 12.1, 0); lh.add(beam);
        box(glowMat(0xfff2c0, 0.18), 24, 1.2, 1.2, 12, 0, 0, beam); box(glowMat(0xfff2c0, 0.32), 24, 0.4, 0.4, 12, 0, 0, beam);
        // 파도 (블록 바다)
        const W = 18, D = 7, N = W * D;
        const sea = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1a5ab0, roughness: 0.3, emissive: 0x0a2a5a, emissiveIntensity: 0.6 }), N);
        sea.userData.noFit = true; group.add(sea);
        sig.sweep = 0;
        tick(t => {
            beam.rotation.y = t * 0.9;
            const fwd = Math.cos(t * 0.9 + 0.5);
            sig.sweep = Math.max(0, fwd);
            lamp.material.opacity = 0.7 + sig.sweep * 0.3;
            flame.scale.set(0.34, 0.5 + Math.sin(t * 13) * 0.06, 0.34);
            let i = 0;
            for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) {
                const px = -17 + x * 2, pz = -8 - z * 2;
                const h = 0.6 + Math.sin(t * 1.6 + x * 0.6 + z * 0.9) * 0.4;
                TMP.p.set(px, h / 2 - 0.3, pz); TMP.q.identity(); TMP.sc.set(1.95, h, 1.95);
                sea.setMatrixAt(i++, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            sea.instanceMatrix.needsUpdate = true;
        });
    },

    /* 사막의 파라오 김민채 — 황금 네메스 두건, 뒤로 솟은 피라미드, 손의 앙크, 모래 회오리 */
    pharaoh({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#1a0c04');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const gold = new THREE.MeshStandardMaterial({ color: 0xffc94d, metalness: 0.8, roughness: 0.25, emissive: 0x5a3a00, emissiveIntensity: 0.5 });
        const lapis = new THREE.MeshStandardMaterial({ color: 0x1f4ab8, metalness: 0.4, roughness: 0.35 });
        // 네메스 두건 (금·청 줄무늬) + 뱀 장식
        const nemes = new THREE.Group();
        for (let i = 0; i < 5; i++) box(i % 2 ? lapis : gold, 1.36, 0.22, 1.36, 0, 0.62 - i * 0.24, -0.02, nemes);
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) box(i % 2 ? lapis : gold, 0.38, 0.3, 0.5, s * 0.72, -0.2 - i * 0.3, 0.1, nemes);
        box(gold, 0.18, 0.4, 0.14, 0, 0.75, 0.7, nemes);
        attach(dummy.head, nemes);
        // 금 목걸이 (넓은 칼라)
        const collar = new THREE.Group(); collar.position.y = 0.85;
        for (let i = 0; i < 3; i++) box(i % 2 ? lapis : gold, 2.2 - i * 0.2, 0.18, 1.2, 0, -i * 0.18, 0.02, collar);
        attach(dummy.torso, collar);
        // 앙크 (왼손 = armR)
        const ankh = new THREE.Group(); ankh.position.set(0, -2.5, 0.2);
        box(gold, 0.16, 1.1, 0.16, 0, -0.3, 0, ankh); box(gold, 0.7, 0.16, 0.16, 0, 0.25, 0, ankh);
        box(gold, 0.5, 0.12, 0.16, 0, 0.75, 0, ankh); box(gold, 0.12, 0.5, 0.16, -0.22, 0.55, 0, ankh); box(gold, 0.12, 0.5, 0.16, 0.22, 0.55, 0, ankh);
        const glowAnkh = box(glowMat(pick(0), 0.5), 0.9, 1.7, 0.1, 0, 0.1, -0.05, ankh);
        attach(dummy.armR, ankh);
        // 피라미드 셋 (계단식 블록)
        const sand = new THREE.MeshStandardMaterial({ color: 0xd9a95a, roughness: 0.9, flatShading: true });
        const pyr = new THREE.Group(); pyr.userData.noFit = true; group.add(pyr);
        [[0, -16, 9], [-11, -20, 6], [10, -19, 7]].forEach(([x, z, n]) => {
            for (let i = 0; i < n; i++) box(sand, (n - i) * 2.2, 1.2, (n - i) * 2.2, x, 0.6 + i * 1.2, z, pyr);
            box(gold, 1, 0.8, 1, x, n * 1.2 + 0.3, z, pyr);
        });
        // 모래 회오리
        const N = 90, dust = new THREE.InstancedMesh(BOX, glowMat(0xffd08a, 0.7), N); group.add(dust);
        const dp = Array.from({ length: N }, () => ({ a: rand(0, 6.28), h: Math.random(), r: rand(2.2, 3.4), s: rand(0.08, 0.2) }));
        // 떠오르는 스카라브 (금 풍뎅이)
        const scar = [0, 1, 2].map(i => { const g = new THREE.Group(); box(gold, 0.6, 0.2, 0.8, 0, 0, 0, g); box(glowMat(pick(1), 0.9), 0.9, 0.06, 0.4, 0, 0.12, -0.05, g); group.add(g); return g; });
        sig.raise = 0;
        tick(t => {
            const lift = dummy.root.position.y;
            dp.forEach((p, i) => { const h = (p.h + t * 0.15) % 1, a = p.a + t * 2.2 + h * 3; TMP.p.set(Math.cos(a) * p.r * (0.6 + h * 0.6), h * 7, Math.sin(a) * p.r * (0.6 + h * 0.6)); TMP.q.identity(); TMP.sc.setScalar(p.s); dust.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc)); });
            dust.instanceMatrix.needsUpdate = true;
            const c = (t % 6) / 6; sig.raise = c > 0.6 ? Math.sin((c - 0.6) / 0.4 * Math.PI) : 0;
            glowAnkh.material.opacity = 0.3 + sig.raise * 0.7;
            scar.forEach((g, i) => { const a = t * 0.6 + i * 2.1; g.position.set(Math.cos(a) * 3.2, 4.2 + Math.sin(t * 1.4 + i) * 0.5 + lift, Math.sin(a) * 3.2); g.rotation.y = -a; });
        });
    },

    /* 거울 세계 김건우 — 앞뒤에 반대로 움직이는 거울 분신, 주위를 도는 거울 조각, 7초마다 와장창 */
    mirror({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, mini } = kit;
        stage.setSky('#05060c');
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const glassM = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, metalness: 1, roughness: 0.05, emissive: pick(0), emissiveIntensity: 0.15 });
        // 거울 분신 (좌우 반전된 포즈, 반투명 크롬)
        const twin = mini(0xffffff, { scale: 1 });
        const chrome = new THREE.MeshStandardMaterial({ color: 0xbfd8ff, metalness: 1, roughness: 0.15, transparent: true, opacity: 0.6, emissive: pick(0), emissiveIntensity: 0.25 });
        twin.root.traverse(o => { if (o.isMesh) o.material = chrome; });
        twin.root.position.set(0, 0, -3.2); twin.root.rotation.y = Math.PI;
        group.add(twin.root);
        // 분신과 나 사이의 거울 판 (테두리만)
        const frame = new THREE.Group(); frame.position.set(0, 3, -1.6); group.add(frame);
        const fm = glowMat(pick(0), 0.85);
        box(fm, 4.6, 0.14, 0.1, 0, 3.2, 0, frame); box(fm, 4.6, 0.14, 0.1, 0, -3.2, 0, frame);
        box(fm, 0.14, 6.4, 0.1, -2.3, 0, 0, frame); box(fm, 0.14, 6.4, 0.1, 2.3, 0, 0, frame);
        const pane = box(new THREE.MeshStandardMaterial({ color: 0x9ac8ff, transparent: true, opacity: 0.12, metalness: 1, roughness: 0 }), 4.5, 6.3, 0.04, 0, 0, 0, frame);
        // 거울 조각 (도는 파편)
        const N = 22, shards = [];
        const shardG = new THREE.Group(); shardG.userData.noFit = true; group.add(shardG);   // 터질 때 멀리 날아가도 카메라는 그대로
        for (let i = 0; i < N; i++) { const s = box(glassM, rand(0.3, 0.8), rand(0.5, 1.2), 0.05, 0, 0, 0, shardG); shards.push({ s, a: rand(0, 6.28), r: rand(3, 5.5), y: rand(0.5, 7), sp: rand(0.3, 0.8) }); }
        // 바닥: 반사되는 검은 거울 타일
        const floorG = new THREE.Group(); floorG.userData.noFit = true; group.add(floorG);
        const floorM = new THREE.MeshStandardMaterial({ color: 0x0a0c14, metalness: 1, roughness: 0.1 });
        for (let x = -3; x <= 3; x++) for (let z = -3; z <= 1; z++) box(floorM, 1.9, 0.04, 1.9, x * 2, 0.02, z * 2, floorG);
        const parts = ['legL', 'legR', 'armL', 'armR', 'head', 'torso'];
        sig.shatter = 0;
        tick(t => {
            // 분신은 내 포즈를 좌우 바꿔서 따라함
            parts.forEach(k => { const src = k.endsWith('L') ? dummy[k.slice(0, -1) + 'R'] : k.endsWith('R') ? dummy[k.slice(0, -1) + 'L'] : dummy[k]; twin[k].rotation.set(src.rotation.x, -src.rotation.y, -src.rotation.z); });
            twin.root.position.y = dummy.root.position.y;
            const c = (t % 7) / 7;
            const burst = c > 0.85 ? (c - 0.85) / 0.15 : 0;   // 와장창
            sig.shatter = burst > 0 ? 1 - burst : 0;
            pane.material.opacity = burst > 0 ? 0.12 * (1 - burst) : 0.12;
            shards.forEach((p, i) => {
                const a = p.a + t * p.sp, r = p.r + burst * 6;
                p.s.position.set(Math.cos(a) * r, p.y + Math.sin(t + i) * 0.3 + dummy.root.position.y, Math.sin(a) * r);
                p.s.rotation.set(t * p.sp, -a, Math.sin(t + i) * 0.5);
            });
        });
    },

    /* 세계수 김건우 — 나무껍질 갑옷, 머리에 잎사귀 관, 발밑에서 자라나는 덩굴 (뒤 배경은 jxsBackdrops) */
    worldTree({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand } = kit;
        stage.setSky('#030a06');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, p = group) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); p.add(b); return b; };
        const bark = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.95, flatShading: true });
        const leafM = new THREE.MeshStandardMaterial({ color: new THREE.Color(pick(0)), emissive: pick(0), emissiveIntensity: 0.5, roughness: 0.6 });
        // 나무껍질 갑옷 (판 여러 장)
        const armor = new THREE.Group();
        for (let i = 0; i < 4; i++) box(bark, 2.16, 0.48, 1.16, 0, 0.75 - i * 0.5, 0, armor).rotation.z = (i % 2 ? 1 : -1) * 0.03;
        attach(dummy.torso, armor);
        // 잎사귀 관 + 작은 뿔가지
        const crown = new THREE.Group(); crown.position.y = 0.7;
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; box(leafM, 0.36, 0.3, 0.36, Math.cos(a) * 0.7, 0.05 + (i % 2) * 0.12, Math.sin(a) * 0.7, crown); }
        for (const s of [-1, 1]) { box(bark, 0.14, 0.8, 0.14, s * 0.45, 0.45, 0, crown).rotation.z = -s * 0.4; box(leafM, 0.3, 0.3, 0.3, s * 0.72, 0.85, 0, crown); }
        attach(dummy.head, crown);
        // 발밑에서 자라나는 덩굴 (블록이 차례로 자람)
        const vines = [];
        for (let k = 0; k < 6; k++) {
            const a = k / 6 * Math.PI * 2, segs = [];
            for (let i = 0; i < 9; i++) segs.push(box(i % 3 ? new THREE.MeshStandardMaterial({ color: 0x2f7a3a, roughness: 0.7 }) : leafM, 0.3, 0.3, 0.3, Math.cos(a + i * 0.25) * (0.9 + i * 0.32), 0.15 + Math.sin(i * 0.8) * 0.12, Math.sin(a + i * 0.25) * (0.9 + i * 0.32)));
            vines.push(segs);
        }
        // 손 위의 작은 씨앗 빛 (왼손 = armR)
        const seed = new THREE.Group(); seed.position.set(0, -2.5, 0.2);
        const seedCore = box(glowMat(0xffffff, 0.9), 0.35, 0.35, 0.35, 0, 0, 0, seed);
        const seedHalo = box(glowMat(pick(0), 0.4), 0.8, 0.8, 0.8, 0, 0, 0, seed);
        attach(dummy.armR, seed);
        sig.grow = 0;
        tick(t => {
            const c = (t % 9) / 9;
            const grow = c < 0.5 ? c / 0.5 : c < 0.85 ? 1 : 1 - (c - 0.85) / 0.15;
            sig.grow = grow;
            vines.forEach(segs => segs.forEach((s, i) => { const k = Math.min(1, Math.max(0, grow * 10 - i)); s.scale.setScalar(0.3 * k + 0.001); }));
            seedCore.rotation.set(t, t * 1.4, 0); seedHalo.rotation.set(-t * 0.7, t, 0);
            seedHalo.scale.setScalar(0.8 + Math.sin(t * 3) * 0.15);
            crown.rotation.y = Math.sin(t * 0.6) * 0.1;
        });
    },

    /* =================== 🆕 새 칭호 (v36) =================== */

    /* 스케이트보더 박지성 — 보드를 타고 3.5초마다 킥플립, 바닥엔 그래피티 타일 */
    skater({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 모자(거꾸로 쓴 캡) + 후드
        const capM = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.6 });
        attach(dummy.head, box(capM, 1.32, 0.3, 1.3, 0, 0.62, 0));
        attach(dummy.head, box(capM, 1.0, 0.1, 0.6, 0, 0.5, -0.85));
        const hood = new THREE.MeshStandardMaterial({ color: 0xff5a2b, roughness: 0.7 });
        attach(dummy.torso, box(hood, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), 0.9, 0.5, 1.14, 0, 0.2, 0));
        // 보드 (옆으로 길게). 몸에 붙어서 같이 뜸
        const board = new THREE.Group(); board.position.set(0, -0.12, 0.1);
        const deck = new THREE.Group(); board.add(deck);
        deck.add(box(new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.5 }), 3.4, 0.1, 1.05, 0, 0, 0));
        deck.add(box(new THREE.MeshStandardMaterial({ color: new THREE.Color(pick(0)), roughness: 0.4, emissive: pick(0), emissiveIntensity: 0.3 }), 3.3, 0.02, 0.95, 0, -0.06, 0));
        for (const s of [-1, 1]) { const tail = box(new THREE.MeshStandardMaterial({ color: 0x2a1a10 }), 0.4, 0.1, 1.05, s * 1.85, 0.08, 0); tail.rotation.z = s * 0.25; deck.add(tail); }
        const wheelM = glowMat(pick(1), 1);
        for (const x of [-1.1, 1.1]) for (const z of [-0.38, 0.38]) deck.add(box(wheelM, 0.24, 0.24, 0.2, x, -0.2, z));
        attach(dummy.root, board);
        // 그래피티 바닥
        const graf = [];
        const cols = ['#ff3b7a', '#5ab0ff', '#7dff6a', '#ffe14d', '#c08bff'];
        for (let i = 0; i < 14; i++) {
            const t = box(glowMat(cols[i % cols.length], 0.35), rand(0.6, 1.4), 0.02, rand(0.6, 1.4), rand(-3.5, 3.5), 0.03, rand(-2.5, 2.5));
            t.rotation.y = rand(0, 1); group.add(t); graf.push(t);
        }
        // 착지 불꽃
        const N = 24;
        const sparks = new THREE.InstancedMesh(BOX, glowMat(0xffe27a, 1), N);
        const sp = Array.from({ length: N }, () => ({ v: new THREE.Vector3(), p: new THREE.Vector3(), life: 0 }));
        group.add(sparks);
        sig.jump = 0; sig.air = 0;
        let landed = true;
        tick((t, dt) => {
            const c = t % 3.5;
            // 0~0.25 웅크림, 0.25~1.05 공중(킥플립), 착지
            const air = c > 0.25 && c < 1.05 ? (c - 0.25) / 0.8 : -1;
            sig.air = air;
            sig.jump = air >= 0 ? Math.sin(air * Math.PI) : 0;
            deck.rotation.x = air >= 0 ? air * Math.PI * 2 : 0;
            board.position.y = -0.12 + (air >= 0 ? Math.sin(air * Math.PI) * 0.4 : 0);
            board.rotation.z = Math.sin(t * 2) * 0.03;
            if (air < 0 && !landed && c >= 1.05) {
                landed = true;
                sp.forEach(s => { s.life = 1; s.p.set(rand(-1.6, 1.6), 0.1, rand(-0.4, 0.6)); s.v.set(rand(-2, 2), rand(2, 4), rand(-1, 2)); });
                stage.shake?.(0.08);
            }
            if (air >= 0) landed = false;
            sp.forEach((s, i) => {
                if (s.life > 0) { s.life -= dt * 1.6; s.v.y -= 9 * dt; s.p.addScaledVector(s.v, dt); }
                TMP.p.copy(s.p); TMP.q.identity(); TMP.sc.setScalar(Math.max(0, s.life) * 0.12);
                sparks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            sparks.instanceMatrix.needsUpdate = true;
            graf.forEach((g, i) => { g.material.opacity = 0.25 + Math.sin(t * 2 + i) * 0.1; });
        });
    },

    /* 요리왕 김건우 — 높은 요리사 모자, 프라이팬으로 재료를 휙휙 뒤집고, 팬 밑엔 불길 */
    chef({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const white = new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.6 });
        // 모자
        const hat = new THREE.Group(); hat.position.y = 0.66;
        hat.add(box(white, 1.3, 0.35, 1.3, 0, 0.1, 0));
        for (const [x, z] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25], [0, 0]]) hat.add(box(white, 0.75, 0.7, 0.75, x, 0.6 + (x === 0 ? 0.15 : 0), z));
        attach(dummy.head, hat);
        // 앞치마 + 스카프
        attach(dummy.torso, box(white, 1.7, 1.9, 0.08, 0, -0.1, 0.55));
        attach(dummy.torso, box(new THREE.MeshStandardMaterial({ color: 0xd8262f }), 1.0, 0.2, 1.12, 0, 0.88, 0));
        // 프라이팬 (캐릭터 오른손 = armL). 팔을 앞으로 뻗으면 팬이 수평이 되게 (팔 끝 방향 = -y, 위쪽 = +z)
        const pan = new THREE.Group(); pan.position.set(0, -1.95, 0);
        const iron = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.8, roughness: 0.35 });
        pan.add(box(new THREE.MeshStandardMaterial({ color: 0x3a2412 }), 0.16, 0.9, 0.12, 0, -0.45, 0));
        const dish = new THREE.Group(); dish.position.y = -1.6; pan.add(dish);
        dish.add(box(iron, 1.5, 1.5, 0.1, 0, 0, 0));
        for (const [x, y, w, h] of [[0, 0.75, 1.6, 0.1], [0, -0.75, 1.6, 0.1], [0.75, 0, 0.1, 1.6], [-0.75, 0, 0.1, 1.6]]) dish.add(box(iron, w, h, 0.25, x, y, 0.1));
        // 재료 (팬 위로 튀었다 떨어짐)
        const foods = [];
        const egg = new THREE.Group(); egg.add(box(white, 0.6, 0.6, 0.08, 0, 0, 0)); egg.add(box(new THREE.MeshStandardMaterial({ color: 0xffc21a, emissive: 0xaa6600, emissiveIntensity: 0.4 }), 0.26, 0.26, 0.14, 0, 0, 0.04)); dish.add(egg); foods.push(egg);
        const steak = box(new THREE.MeshStandardMaterial({ color: 0x8a3a1a, roughness: 0.7 }), 0.7, 0.45, 0.14, 0.2, 0.25, 0); dish.add(steak); foods.push(steak);
        attach(dummy.armL, pan);
        // 팬 불길 (월드에서 팬 아래)
        const NF = 18;
        const flames = new THREE.InstancedMesh(BOX, glowMat(0xff8a1f, 0.9), NF);
        const fD = Array.from({ length: NF }, () => ({ k: Math.random(), x: rand(-0.5, 0.5), z: rand(-0.5, 0.5) }));
        flames.userData.noFit = true; group.add(flames);
        // 둥둥 떠다니는 재료
        const ing = [];
        [[0xff3b3b, 0.4], [0xffe14d, 0.35], [0x5ad65a, 0.45], [0xf6f0e0, 0.3], [0xff8a3d, 0.38]].forEach(([c, s], i) => {
            const m = box(new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, emissive: c, emissiveIntensity: 0.15 }), s, s, s, 0, 0, 0);
            group.add(m); ing.push({ m, a: (i / 5) * Math.PI * 2, y: 1.5 + (i % 3) * 1.1 });
        });
        const panPos = new THREE.Vector3();
        sig.flip = 0;
        tick((t, dt) => {
            const c = t % 2.4;
            const toss = c < 1 ? c : -1;
            sig.flip = c < 0.25 ? c / 0.25 : c < 0.5 ? 1 - (c - 0.25) / 0.25 : 0;
            foods.forEach((f, i) => {
                const k = toss >= 0 ? Math.min(1, toss / (0.9 + i * 0.08)) : 1;
                f.position.z = 0.15 + (k < 1 ? Math.sin(k * Math.PI) * (1.6 + i * 0.4) : 0);
                f.rotation.x = k < 1 ? k * Math.PI * 2 * (i ? -1 : 1) : 0;
            });
            dish.getWorldPosition(panPos);
            fD.forEach((d, i) => {
                d.k += dt * 1.8; if (d.k > 1) d.k = 0;
                TMP.p.set(panPos.x + d.x * (1 - d.k), panPos.y - 0.7 + d.k * 0.6, panPos.z + d.z * (1 - d.k));
                TMP.q.setFromEuler(TMP.e.set(0, t * 3 + i, 0.78)); TMP.sc.setScalar(0.24 * (1 - d.k) + 0.04);
                flames.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            flames.instanceMatrix.needsUpdate = true;
            ing.forEach((o, i) => {
                const a = o.a + t * 0.7;
                o.m.position.set(Math.cos(a) * 2.6, o.y + Math.sin(t * 2 + i) * 0.2 + dummy.root.position.y, Math.sin(a) * 2.6);
                o.m.rotation.set(t + i, t * 1.3, 0);
            });
        });
    },

    /* 구미호 김티비 — 여우 귀, 등 뒤로 부채처럼 펼쳐진 아홉 꼬리, 주위를 도는 푸른 여우불 */
    gumiho({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#04030c');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const fur = new THREE.MeshStandardMaterial({ color: 0xf2f0f8, roughness: 0.7, emissive: 0x2a2a60, emissiveIntensity: 0.3 });
        const inner = new THREE.MeshStandardMaterial({ color: 0xff9ac8, roughness: 0.6 });
        // 귀
        for (const s of [-1, 1]) {
            const ear = new THREE.Group(); ear.position.set(s * 0.42, 0.62, 0); ear.rotation.z = -s * 0.25;
            ear.add(box(fur, 0.34, 0.5, 0.18, 0, 0.2, 0)); ear.add(box(fur, 0.22, 0.3, 0.18, 0, 0.55, 0));
            ear.add(box(inner, 0.18, 0.4, 0.04, 0, 0.25, 0.1));
            attach(dummy.head, ear);
        }
        // 머리 장식 + 한복 느낌 옷
        const robe = new THREE.MeshStandardMaterial({ color: 0x2a1450, roughness: 0.6 });
        attach(dummy.torso, box(robe, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(new THREE.MeshStandardMaterial({ color: 0xff5a8a, roughness: 0.5 }), 2.14, 0.3, 1.14, 0, 0.3, 0));
        // 아홉 꼬리
        const tails = [];
        const tipM = glowMat(pick(0), 0.9);
        for (let i = 0; i < 9; i++) {
            const base = new THREE.Group(); base.position.set(0, 1.9, -0.6);
            base.rotation.z = (i - 4) * 0.34;
            const segs = [];
            let parent = base;
            for (let k = 0; k < 6; k++) {
                const seg = new THREE.Group(); seg.position.y = k ? 0.55 : 0;
                const w = 0.62 - k * 0.04;
                seg.add(box(k === 5 ? tipM : fur, w, 0.62, w, 0, 0.3, 0));
                parent.add(seg); segs.push(seg); parent = seg;
            }
            attach(dummy.root, base);
            tails.push({ base, segs, ph: i * 0.7 });
        }
        // 여우불
        const NF = 7;
        const orbs = [];
        for (let i = 0; i < NF; i++) {
            const o = new THREE.Group();
            o.add(box(glowMat(pick(0), 1), 0.3, 0.3, 0.3, 0, 0, 0));
            o.add(box(glowMat(0xffffff, 0.8), 0.14, 0.14, 0.14, 0, 0, 0));
            const fl = box(glowMat(pick(0), 0.6), 0.2, 0.45, 0.2, 0, 0.3, 0); o.add(fl);
            group.add(o); orbs.push({ o, fl, a: (i / NF) * Math.PI * 2, y: 1.6 + (i % 3) * 1.2 });
        }
        // 꽃잎
        const NP = 28;
        const petals = new THREE.InstancedMesh(BOX, glowMat(0xffb3d6, 0.8), NP);
        const pD = Array.from({ length: NP }, () => ({ x: rand(-4, 4), y: rand(0, 8), z: rand(-3, 2), v: rand(0.3, 0.7), r: rand(0, 6) }));
        group.add(petals);
        sig.wave = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            sig.wave = (Math.sin(t * 0.8) + 1) / 2;
            tails.forEach(({ base, segs, ph }, i) => {
                base.position.y = 1.9 + lift;
                base.rotation.x = -0.3 - sig.wave * 0.1;
                // 끝으로 갈수록 살짝 앞·바깥으로 말려서 앞에서도 꼬리가 보이게
                segs.forEach((s, k) => { if (k) { s.rotation.x = 0.06 + Math.sin(t * 2 + ph + k * 0.6) * 0.1; s.rotation.z = (i - 4) * 0.04 + Math.sin(t * 1.5 + ph + k * 0.5) * 0.1; } });
            });
            orbs.forEach(({ o, fl, a, y }, i) => {
                const aa = a + t * 0.9;
                o.position.set(Math.cos(aa) * 2.3, y + lift + Math.sin(t * 2 + i) * 0.25, Math.sin(aa) * 2.3);
                fl.scale.set(0.2, 0.45 + Math.sin(t * 10 + i) * 0.15, 0.2);
            });
            pD.forEach((d, i) => {
                d.y -= d.v * dt; d.x += Math.sin(t + d.r) * dt * 0.4;
                if (d.y < 0) { d.y = 8; d.x = rand(-4, 4); }
                TMP.p.set(d.x, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t + d.r, t * 1.4, d.r)); TMP.sc.set(0.18, 0.03, 0.12);
                petals.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            petals.instanceMatrix.needsUpdate = true;
        });
    },

    /* 용왕 박지성 — 비늘이 반짝이는 동양 용이 몸을 휘감아 돌고, 손엔 여의주, 발밑엔 소용돌이 물결 */
    dragonKing({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#020a10');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const gold = solidMat(new THREE.Color('#ffc94d'), 0.35);
        const jade = new THREE.MeshStandardMaterial({ color: 0x1fae8a, metalness: 0.5, roughness: 0.3, emissive: 0x0a3a2a, emissiveIntensity: 0.5 });
        const jade2 = new THREE.MeshStandardMaterial({ color: 0x2fd6a8, metalness: 0.5, roughness: 0.3, emissive: 0x0a4a3a, emissiveIntensity: 0.5 });
        const belly = new THREE.MeshStandardMaterial({ color: 0xffe9a8, roughness: 0.5 });
        // 왕관 + 용포
        const crown = new THREE.Group(); crown.position.y = 0.72;
        crown.add(box(gold, 1.42, 0.24, 1.42, 0, 0, 0));
        for (const s of [-1, 1]) { const h = box(gold, 0.14, 0.7, 0.14, s * 0.5, 0.4, 0); h.rotation.z = -s * 0.4; crown.add(h); }
        crown.add(box(glowMat(0x7fffe0, 1), 0.22, 0.22, 0.06, 0, 0.05, 0.72));
        attach(dummy.head, crown);
        const robe = new THREE.MeshStandardMaterial({ color: 0x0f4a6a, roughness: 0.5, emissive: 0x041a2a, emissiveIntensity: 0.5 });
        attach(dummy.torso, box(robe, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(gold, 0.6, 0.6, 1.14, 0, 0.2, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(robe, 1.08, 2.04, 1.08, 0, -1.0, 0));
        // 여의주 (캐릭터 왼손 = armR)
        const pearl = new THREE.Group(); pearl.position.set(0, -2.3, 0);
        pearl.add(box(glowMat(0xbfffef, 1), 0.5, 0.5, 0.5, 0, 0, 0));
        const pearlHalo = box(glowMat(pick(0), 0.4), 0.9, 0.9, 0.9, 0, 0, 0); pearl.add(pearlHalo);
        attach(dummy.armR, pearl);
        // 용 몸통 (마디 44개가 나선 경로를 따라감)
        const N = 44;
        const segs = [];
        for (let i = 0; i < N; i++) {
            const g = new THREE.Group();
            const s = 1 - i / N * 0.65;
            g.add(box(i % 2 ? jade : jade2, 0.8 * s, 0.8 * s, 0.9, 0, 0, 0));
            g.add(box(belly, 0.5 * s, 0.25 * s, 0.85, 0, -0.38 * s, 0));
            if (i % 3 === 0 && i < N - 4) g.add(box(gold, 0.12, 0.4 * s, 0.3, 0, 0.5 * s, 0));   // 등지느러미
            group.add(g); segs.push(g);
        }
        // 용 머리
        const head = new THREE.Group(); group.add(head);
        head.add(box(jade, 1.1, 0.9, 1.4, 0, 0, 0));
        head.add(box(jade2, 0.9, 0.5, 0.8, 0, -0.15, 0.95));
        head.add(box(belly, 0.8, 0.12, 0.7, 0, -0.42, 0.95));
        for (const s of [-1, 1]) {
            const horn = box(gold, 0.14, 0.8, 0.14, s * 0.35, 0.7, -0.3); horn.rotation.x = -0.6; horn.rotation.z = -s * 0.3; head.add(horn);
            head.add(box(glowMat(0xffe14d, 1), 0.12, 0.14, 0.2, s * 0.4, 0.15, 0.62));
            const wh = box(gold, 0.04, 0.04, 1.4, s * 0.45, -0.25, 1.6); wh.rotation.y = s * 0.4; head.add(wh);
        }
        for (let i = 0; i < 5; i++) head.add(box(new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0x7a2a00, emissiveIntensity: 0.6 }), 0.9 - i * 0.1, 0.12, 0.3, 0, 0.5 - i * 0.05, -0.6 - i * 0.2));
        // 물결 소용돌이 + 물방울
        const waves = [0, 1, 2].map(i => { const r = square(3 + i * 1.6, 0.14, glowMat(i === 1 ? 0x7fffe0 : 0x2a8cff, 0.6)); r.position.y = 0.1 + i * 0.03; group.add(r); return r; });
        const ND = 30;
        const drops = new THREE.InstancedMesh(BOX, glowMat(0x9fe6ff, 0.8), ND);
        const dD = Array.from({ length: ND }, () => ({ a: rand(0, 6.3), r: rand(1.5, 4), y: rand(0, 6), v: rand(0.8, 1.6) }));
        group.add(drops);
        const path = (u, t) => {
            // 위아래로 오르내리는 나선 (u: 0=머리 쪽)
            const a = t * 0.8 - u * 6.2;
            const r = 3.0 + Math.sin(u * 4 + t) * 0.3;
            return TMP.v.set(Math.cos(a) * r, 3.4 + Math.sin(a * 0.5 + t * 0.6) * 2.2 + Math.sin(u * 9 + t * 2) * 0.25, Math.sin(a) * r * 0.85 - 0.3);
        };
        const p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
        sig.raise = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            sig.raise = (Math.sin(t * 0.7) + 1) / 2;
            for (let i = 0; i < N; i++) {
                const u = (i + 1) / (N + 1);
                p0.copy(path(u, t)); p1.copy(path(u + 0.01, t));
                segs[i].position.copy(p0).setY(p0.y + lift * 0.5);
                segs[i].lookAt(p1.x, p1.y + lift * 0.5, p1.z);
            }
            p0.copy(path(0, t)); p1.copy(path(-0.02, t));
            head.position.copy(p0).setY(p0.y + lift * 0.5);
            head.lookAt(p1.x, p1.y + lift * 0.5, p1.z);
            pearlHalo.scale.setScalar(0.9 + Math.sin(t * 3) * 0.15);
            waves.forEach((r, i) => { r.rotation.y = t * (i % 2 ? -0.5 : 0.4); r.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.05); });
            dD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 6) d.y = 0;
                TMP.p.set(Math.cos(d.a + t * 0.5) * d.r, d.y, Math.sin(d.a + t * 0.5) * d.r); TMP.q.identity(); TMP.sc.set(0.08, 0.16, 0.08).multiplyScalar(1 - d.y / 6 + 0.2);
                drops.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            drops.instanceMatrix.needsUpdate = true;
        });
    },

    /* 시간을 멈춘 자 공병은 — 등 뒤 거대한 시계, 양옆 톱니바퀴. 6초마다 '정지': 시곗바늘·톱니·떠다니는 조각이 전부 멈추고 세상이 잿빛 */
    timeStop({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#05050a');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.85, roughness: 0.3 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.5, roughness: 0.4 });
        // 코트 + 외눈 안경
        attach(dummy.torso, box(dark, 2.14, 2.1, 1.14, 0, 0, 0));
        attach(dummy.torso, box(brass, 0.12, 2.0, 1.16, 0.45, 0, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(dark, 1.06, 2.04, 1.08, 0, -1.0, 0));
        attach(dummy.head, box(brass, 0.4, 0.4, 0.05, 0.25, 0.08, 0.62));
        attach(dummy.head, box(glowMat(pick(0), 0.8), 0.3, 0.3, 0.03, 0.25, 0.08, 0.64));
        // 거대한 시계 (뒤)
        const clock = new THREE.Group(); clock.position.set(0, 4.4, -2.4); group.add(clock);
        const face = box(new THREE.MeshStandardMaterial({ color: 0x10101a, roughness: 0.4, emissive: 0x0a0a20, emissiveIntensity: 0.5 }), 6.6, 6.6, 0.15, 0, 0, -0.1);
        clock.add(face);
        const rim = square(6.8, 0.25, brass); rim.rotation.x = Math.PI / 2; clock.add(rim);
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const m = box(i % 3 ? brass : glowMat(pick(0), 1), i % 3 ? 0.14 : 0.24, i % 3 ? 0.45 : 0.7, 0.1, Math.sin(a) * 2.8, Math.cos(a) * 2.8, 0.05); m.rotation.z = -a; clock.add(m); }
        const hourH = new THREE.Group(), minH = new THREE.Group(), secH = new THREE.Group();
        hourH.add(box(brass, 0.22, 1.6, 0.08, 0, 0.8, 0.1)); minH.add(box(brass, 0.14, 2.4, 0.08, 0, 1.2, 0.15)); secH.add(box(glowMat(pick(0), 1), 0.06, 2.7, 0.05, 0, 1.15, 0.2));
        clock.add(hourH, minH, secH, box(brass, 0.4, 0.4, 0.2, 0, 0, 0.2));
        // 톱니바퀴
        function gear(r, teeth, mat) {
            const g = new THREE.Group();
            g.add(box(mat, r * 1.4, r * 1.4, 0.2, 0, 0, 0));
            for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2; const tt = box(mat, 0.3, 0.4, 0.2, Math.cos(a) * r, Math.sin(a) * r, 0); tt.rotation.z = a; g.add(tt); }
            g.add(box(dark, r * 0.4, r * 0.4, 0.25, 0, 0, 0));
            return g;
        }
        const gears = [[-3.6, 6.2, 1.1, 10, 1], [3.7, 5.6, 0.9, 8, -1.3], [-3.2, 2.4, 0.7, 7, 1.6], [3.4, 2.0, 1.2, 11, -0.9]].map(([x, y, r, n, sp]) => { const g = gear(r, n, brass); g.position.set(x, y, -1.6); group.add(g); return { g, sp }; });
        // 멈춰 있는 조각들
        const NS = 40;
        const shards = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.85), NS);
        const sD = Array.from({ length: NS }, () => ({ p: new THREE.Vector3(rand(-4.5, 4.5), rand(0, 8), rand(-2, 2.5)), v: new THREE.Vector3(rand(-0.4, 0.4), rand(0.3, 0.9), rand(-0.2, 0.2)), r: new THREE.Euler(rand(0, 3), rand(0, 3), 0), s: rand(0.08, 0.2) }));
        group.add(shards);
        const ripple = square(1, 0.12, glowMat(0xffffff, 0.9)); ripple.visible = false; group.add(ripple);
        const SKY = new THREE.Color('#05050a'), GREY = new THREE.Color('#2a2a30');
        let clockT = 0, wasStop = false;
        sig.stop = 0;
        tick((t, dt) => {
            const c = t % 6;
            const stopped = c > 3.5 && c < 5.3;
            sig.stop = stopped ? 1 : Math.max(0, sig.stop - dt * 3);
            if (stopped && !wasStop) { stage.flash?.(0.3); stage.shake?.(0.1); }
            if (!stopped && wasStop) { ripple.visible = true; ripple.userData.k = 0; }
            wasStop = stopped;
            const sp = stopped ? 0 : 1;
            clockT += dt * sp;
            secH.rotation.z = -clockT * 2.2; minH.rotation.z = -clockT * 0.25; hourH.rotation.z = -clockT * 0.03;
            gears.forEach(({ g, sp: s }) => { g.rotation.z += dt * s * sp; });
            stage.scene.background?.lerpColors?.(SKY, GREY, sig.stop * 0.8);
            sD.forEach((d, i) => {
                if (!stopped) { d.p.addScaledVector(d.v, dt); d.r.x += dt; d.r.y += dt * 0.7; if (d.p.y > 8) d.p.y = 0; }
                TMP.p.copy(d.p); TMP.q.setFromEuler(d.r); TMP.sc.setScalar(d.s);
                shards.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            shards.instanceMatrix.needsUpdate = true;
            if (ripple.visible) {
                ripple.userData.k += dt * 1.3;
                const k = ripple.userData.k;
                ripple.position.set(0, 3 + dummy.root.position.y, 0); ripple.rotation.set(Math.PI / 2, 0, 0);
                ripple.scale.setScalar(1 + k * 12);
                ripple.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
                if (k >= 1) ripple.visible = false;
            }
        });
    },

    /* 창조주 김가은 — 허공에서 블록이 날아와 떠 있는 섬이 지어지고, 손 위에선 작은 행성이 빚어지며, 뒤로는 은하가 소용돌이 */
    creator({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#03020a');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const white = new THREE.MeshStandardMaterial({ color: 0xfaf8ff, roughness: 0.4, emissive: 0x302850, emissiveIntensity: 0.4 });
        const prism = [0xff5a8a, 0xffb02e, 0xffe14d, 0x7dff6a, 0x5ab0ff, 0xb26bff];
        // 빛의 옷 + 무지개 고리 왕관
        attach(dummy.torso, box(white, 2.12, 2.1, 1.12, 0, 0, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(white, 1.06, 2.04, 1.08, 0, -1.0, 0));
        const halo = new THREE.Group(); halo.position.y = 1.0;
        prism.forEach((c, i) => { const a = (i / 6) * Math.PI * 2; halo.add(box(glowMat(c, 1), 0.2, 0.2, 0.2, Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9)); });
        attach(dummy.head, halo);
        // 손 위의 행성 (캐릭터 왼손 = armR)
        const planet = new THREE.Group(); planet.position.set(0, -2.6, 0);
        const PN = 26, pBlocks = [];
        for (let i = 0; i < PN; i++) {
            const u = rand(-1, 1), th = rand(0, 6.3), s = Math.sqrt(1 - u * u);
            const c = i < 8 ? 0x2a8cff : i < 18 ? 0x3ddc6a : 0xc8a06a;
            const b = box(new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, emissive: c, emissiveIntensity: 0.25 }), 0.28, 0.28, 0.28, Math.cos(th) * s * 0.45, u * 0.45, Math.sin(th) * s * 0.45);
            b.userData.home = b.position.clone();
            planet.add(b); pBlocks.push(b);
        }
        const pRing = square(1.4, 0.04, glowMat(0xffffff, 0.7)); pRing.rotation.set(0.4, 0, 0.3); planet.add(pRing);
        attach(dummy.armR, planet);
        // 떠 있는 섬들 (블록이 날아와서 지어짐)
        const grass = new THREE.MeshStandardMaterial({ color: 0x4ad65a, roughness: 0.6 });
        const dirt = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.8 });
        const leaf = new THREE.MeshStandardMaterial({ color: 0x2fa84a, roughness: 0.6 });
        const islands = [];
        [[-3.4, 4.2, -1.2], [3.5, 5.6, -1.6], [-2.6, 7.4, -2.6], [2.8, 2.2, -0.6]].forEach(([x, y, z], k) => {
            const isl = new THREE.Group(); isl.position.set(x, y, z);
            const blocks = [];
            const add = (m, bx, by, bz, s = 0.5) => { const b = box(m, s, s, s, bx, by, bz); b.userData.home = b.position.clone(); b.userData.from = new THREE.Vector3(rand(-6, 6), rand(-6, 6), rand(-6, 6)); isl.add(b); blocks.push(b); };
            for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) add(grass, i * 0.5, 0, j * 0.5);
            for (let i = 0; i <= 1; i++) for (let j = 0; j <= 1; j++) add(dirt, i * 0.5 - 0.25, -0.5, j * 0.5 - 0.25);
            add(dirt, 0, -1.0, 0);
            add(new THREE.MeshStandardMaterial({ color: 0x6a4a2a }), 0, 0.5, 0, 0.18); add(new THREE.MeshStandardMaterial({ color: 0x6a4a2a }), 0, 0.75, 0, 0.18);
            add(leaf, 0, 1.1, 0, 0.6); add(leaf, 0, 1.45, 0, 0.36);
            group.add(isl); islands.push({ isl, blocks, ph: k * 2.5 });
        });
        // 은하 (멀리, 회전)
        const galaxy = new THREE.Group(); galaxy.position.set(0, 5, -16); galaxy.rotation.x = 0.9; galaxy.userData.noFit = true; group.add(galaxy);
        const NG = 220;
        const stars = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.9), NG);
        const gc = new THREE.Color();
        for (let i = 0; i < NG; i++) {
            const arm = i % 3, d = Math.pow(Math.random(), 0.7) * 9, a = arm * (Math.PI * 2 / 3) + d * 0.55 + rand(-0.25, 0.25);
            TMP.p.set(Math.cos(a) * d, rand(-0.3, 0.3), Math.sin(a) * d); TMP.q.identity(); TMP.sc.setScalar(rand(0.08, 0.22));
            stars.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            stars.setColorAt(i, gc.set(prism[i % 6]).lerp(new THREE.Color(0xffffff), 0.5));
        }
        galaxy.add(stars);
        galaxy.add(box(glowMat(0xfff3d0, 0.9), 1.2, 1.2, 1.2, 0, 0, 0));
        // 바닥 창조 문양
        const runes = [0, 1, 2].map(i => { const r = square(3 + i * 1.5, 0.08, glowMat(prism[i * 2], 0.6)); r.position.y = 0.1; group.add(r); return r; });
        sig.create = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            galaxy.rotation.y = t * 0.08;
            halo.rotation.y = t * 0.8;
            planet.rotation.y = t * 0.6; planet.rotation.x = Math.sin(t * 0.4) * 0.3;
            // 행성: 8초마다 흩어졌다가 다시 빚어짐
            const pc = (t % 8) / 8;
            const pk = pc < 0.15 ? 1 - pc / 0.15 : Math.min(1, (pc - 0.15) / 0.35);
            pBlocks.forEach((b, i) => { b.position.copy(b.userData.home).multiplyScalar(1 + (1 - pk) * 2.5); b.rotation.set(t + i, t * 0.7, 0); });
            sig.create = pc > 0.15 && pc < 0.5 ? 1 : 0;
            islands.forEach(({ isl, blocks, ph }, k) => {
                // 12초 주기: 흩어진 블록이 차례로 날아와 섬이 됨 → 잠깐 유지 → 다시 흩어짐
                const c = ((t + ph) % 12) / 12;
                isl.position.y += (Math.sin(t * 0.8 + k) * 0.003);
                isl.rotation.y = t * 0.15 + k;
                blocks.forEach((b, i) => {
                    const start = 0.04 + i * 0.025;
                    const into = Math.min(1, Math.max(0, (c - start) / 0.12));
                    const out = c > 0.82 ? Math.min(1, (c - 0.82) / 0.12) : 0;
                    const e = 1 - Math.pow(1 - into, 3);
                    b.position.lerpVectors(b.userData.from, b.userData.home, e - out);
                    b.rotation.set((1 - e + out) * 4, (1 - e + out) * 3, 0);
                    b.visible = into > 0 && out < 1;
                });
            });
            runes.forEach((r, i) => { r.rotation.y = t * (i % 2 ? -0.3 : 0.2) * (1 + sig.create); });
        });
    },


    /* =================== 👑 어드민의 영역 전용 =================== */

    /* 디버거 공병은 — 허공의 코드 창을 두드리고, 바닥을 기어다니는 버그를 잡음. 몸이 가끔 지지직 */
    debugger({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#020a06');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 헤드셋 + 안경
        const dark = new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.4, metalness: 0.5 });
        attach(dummy.head, box(dark, 1.36, 0.12, 0.3, 0, 0.66, 0));
        for (const s of [-1, 1]) attach(dummy.head, box(dark, 0.14, 0.5, 0.5, s * 0.68, 0.1, 0));
        attach(dummy.head, box(dark, 0.08, 0.08, 0.5, 0.68, -0.18, 0.35));
        const lens = glowMat(pick(0), 0.85);
        for (const s of [-1, 1]) attach(dummy.head, box(lens, 0.34, 0.2, 0.04, s * 0.27, 0.08, 0.62));
        attach(dummy.head, box(dark, 0.9, 0.05, 0.04, 0, 0.08, 0.63));
        // 코드 창 (캔버스 글자)
        const LINES = ['if (luck > 1e9) {', '  roll(JXS);', '}', 'bug.fix();', '// TODO: nerf', 'while(true) rng++', 'admin.abuse()', 'return 404;'];
        function codeTex(seed) {
            const c = document.createElement('canvas'); c.width = 256; c.height = 160;
            const g = c.getContext('2d');
            g.fillStyle = 'rgba(0,30,12,0.85)'; g.fillRect(0, 0, 256, 160);
            g.strokeStyle = '#3dff8a'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 156);
            g.fillStyle = '#3dff8a'; g.fillRect(0, 0, 256, 18);
            g.fillStyle = '#021'; g.font = 'bold 12px monospace'; g.fillText('debug.js', 8, 13);
            g.font = '15px monospace';
            for (let i = 0; i < 6; i++) { g.fillStyle = i === seed % 6 ? '#ffd23a' : '#9dffbf'; g.fillText(LINES[(seed + i) % LINES.length], 10, 40 + i * 20); }
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
        }
        const panels = [];
        [[-2.4, 4.6, 0.6, 0.35], [2.4, 4.3, 0.6, -0.35], [0, 6.6, -0.8, 0], [-2.7, 2.3, -0.4, 0.5], [2.7, 2.1, -0.4, -0.5]].forEach(([x, y, z, ry], i) => {
            const m = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ map: codeTex(i * 3), transparent: true, opacity: 0.92, toneMapped: false }));
            m.scale.set(1.9, 1.2, 0.02); m.position.set(x, y, z); m.rotation.y = ry;
            group.add(m); panels.push({ m, y, ph: i });
        });
        // 버그들 (네모 몸 + 다리)
        const bugM = new THREE.MeshStandardMaterial({ color: 0xff3b5c, roughness: 0.5, emissive: 0x500010, emissiveIntensity: 0.6 });
        const bugs = [];
        for (let i = 0; i < 6; i++) {
            const b = new THREE.Group();
            b.add(box(bugM, 0.36, 0.2, 0.5, 0, 0.18, 0));
            b.add(box(bugM, 0.24, 0.18, 0.2, 0, 0.2, 0.32));
            for (const s of [-1, 1]) for (const z of [-0.15, 0.05, 0.22]) b.add(box(bugM, 0.26, 0.04, 0.04, s * 0.26, 0.08, z));
            const zap = box(glowMat(0x3dff8a, 1), 0.7, 0.7, 0.7, 0, 0.2, 0); zap.visible = false; b.add(zap);
            b.userData = { a: rand(0, 6.3), r: rand(2, 3.6), sp: rand(0.5, 1) * (i % 2 ? 1 : -1), zap, dead: 0 };
            group.add(b); bugs.push(b);
        }
        // 지지직 잔상
        const ghost = kit.ghost(pick(0), 0.18); ghost.visible = false; group.add(ghost);
        const ghost2 = kit.ghost(0xff3b5c, 0.14); ghost2.visible = false; group.add(ghost2);
        sig.type = 0;
        tick((t, dt) => {
            sig.type = t;
            panels.forEach(({ m, y, ph }) => { m.position.y = y + Math.sin(t * 1.2 + ph) * 0.15 + dummy.root.position.y; m.material.opacity = 0.8 + Math.sin(t * 9 + ph) * 0.1; });
            bugs.forEach((b, i) => {
                const u = b.userData;
                if (u.dead > 0) { u.dead -= dt; u.zap.visible = true; u.zap.scale.setScalar(0.7 + (0.6 - u.dead) * 2); u.zap.material.opacity = Math.max(0, u.dead / 0.6); b.children.forEach(c => { if (c !== u.zap) c.visible = false; }); if (u.dead <= 0) { b.children.forEach(c => c.visible = c !== u.zap); u.a = rand(0, 6.3); } return; }
                u.a += u.sp * dt;
                b.position.set(Math.cos(u.a) * u.r, 0, Math.sin(u.a) * u.r * 0.7);
                b.rotation.y = -u.a + (u.sp > 0 ? 0 : Math.PI);
                b.position.y = Math.abs(Math.sin(t * 14 + i)) * 0.05;
                if (Math.random() < dt * 0.25) u.dead = 0.6;
            });
            const glitch = (t % 3.3) < 0.18;
            ghost.visible = ghost2.visible = glitch;
            if (glitch) {
                ghost.position.set(rand(-0.3, 0.3), dummy.root.position.y, 0.05);
                ghost2.position.set(rand(-0.4, 0.4), dummy.root.position.y + rand(-0.1, 0.1), -0.05);
            }
        });
    },

    /* 밴해머 김건우 — 거대한 밴 망치를 휘둘러 내려찍으면 BANNED 도장이 쾅, 주변 꼬마들이 튕겨 날아감 */
    banHammer({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, mini, rand } = kit;
        stage.setSky('#0a0204');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        function textTex(text, bg, fg, w = 512, h = 128, size = 86) {
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            const g = c.getContext('2d');
            if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
            g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
            g.fillStyle = fg; g.font = `900 ${size}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(text, w / 2, h / 2 + 4);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
        }
        // 심판관 옷: 검은 법복 + 빨간 띠
        const robe = new THREE.MeshStandardMaterial({ color: 0x111014, roughness: 0.7 });
        const red = new THREE.MeshStandardMaterial({ color: 0xc8102a, roughness: 0.4, emissive: 0x400008, emissiveIntensity: 0.6 });
        const gold = solidMat(new THREE.Color('#ffc94d'), 0.35);
        attach(dummy.torso, box(robe, 2.14, 2.1, 1.14, 0, 0, 0));
        attach(dummy.torso, box(red, 0.5, 2.12, 1.16, 0, 0, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(robe, 1.08, 2.04, 1.08, 0, -1.0, 0));
        for (const arm of [dummy.armL, dummy.armR]) attach(arm, box(robe, 1.1, 1.5, 1.1, 0, -0.55, 0));
        attach(dummy.head, box(robe, 1.34, 0.25, 1.3, 0, 0.6, 0));
        // 망치 (캐릭터 오른손 = armL). 손잡이가 팔 끝에서 이어지고, 머리는 앞뒤(z)로 길어서 끝면으로 찍음
        const hammer = new THREE.Group(); hammer.position.set(0, -1.95, 0);
        const wood = new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.6 });
        hammer.add(box(wood, 0.28, 3.6, 0.28, 0, -1.7, 0));
        hammer.add(box(gold, 0.4, 0.3, 0.4, 0, -0.1, 0));
        const head = new THREE.Group(); head.position.y = -3.7; hammer.add(head);
        head.add(box(red, 1.5, 1.4, 2.8, 0, 0, 0));
        head.add(box(gold, 1.56, 0.2, 2.86, 0, 0.55, 0)); head.add(box(gold, 1.56, 0.2, 2.86, 0, -0.55, 0));
        const banTex = textTex('BAN', null, '#ffffff', 256, 128, 92);
        for (const s of [-1, 1]) { const f = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ map: banTex, transparent: true, toneMapped: false })); f.scale.set(2.2, 0.9, 0.02); f.position.set(s * 0.77, 0, 0); f.rotation.y = s * Math.PI / 2; head.add(f); }
        const faceGlow = box(glowMat(pick(0), 0.9), 1.3, 1.2, 0.06, 0, 0, 1.43); head.add(faceGlow);
        attach(dummy.armL, hammer);
        // BANNED 도장 (찍은 자리 바닥에)
        const stamp = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ map: textTex('BANNED', 'rgba(120,0,10,0.35)', '#ff2a3d'), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
        stamp.scale.set(4.4, 0.02, 1.1); stamp.position.set(0, 0.06, 2.6); group.add(stamp);
        const stampUp = new THREE.Mesh(BOX, stamp.material); stampUp.scale.set(5, 1.25, 0.02); stampUp.position.set(0, 7.2, -1); group.add(stampUp);
        const shock = square(1, 0.16, glowMat(pick(0), 0.9)); shock.visible = false; group.add(shock);
        // 쫓겨나는 꼬마들
        const victims = [];
        const vm = new THREE.MeshStandardMaterial({ color: 0x9aa0ad, roughness: 0.6 });
        for (let i = 0; i < 5; i++) {
            const m = mini(0x9aa0ad, { scale: 0.32 });
            m.root.traverse(o => { if (o.isMesh) o.material = vm; });
            m.root.userData.noFit = true;
            const a = -0.9 + i * 0.45;
            group.add(m.root);
            victims.push({ m, home: new THREE.Vector3(Math.sin(a) * 3.4, 0, 2.2 + Math.cos(a) * 0.6), v: new THREE.Vector3(), fly: 0 });
        }
        // 바닥 금 (내려찍으면 빛남)
        const cracks = [];
        for (let i = 0; i < 8; i++) { const c = box(glowMat(pick(0), 0), 0.12, 0.03, rand(1.2, 2.6), 0, 0.05, 2.6); c.rotation.y = (i / 8) * Math.PI * 2; c.position.x += Math.sin(c.rotation.y) * 0.8; c.position.z += Math.cos(c.rotation.y) * 0.8; group.add(c); cracks.push(c); }
        sig.phase = 0;
        let lastHit = -1;
        tick((t, dt) => {
            const c = t % 5;
            // 0~2.6 들어올림, 2.6~2.9 내려찍기, 2.9~ 여운
            sig.phase = c < 2.6 ? Math.min(1, c / 1.4) : c < 2.9 ? 1 - (c - 2.6) / 0.3 : 0;
            const n = Math.floor(t / 5);
            if (c >= 2.9 && lastHit !== n) {
                lastHit = n;
                shock.visible = true; shock.userData.k = 0;
                stage.shake?.(0.3); stage.flash?.(0.35);
                victims.forEach(v => { v.fly = 1; v.v.set(v.home.x * rand(1.2, 2), rand(6, 9), rand(2, 5)); });
            }
            const after = c - 2.9;
            const sk = after > 0 ? Math.max(0, 1 - after / 1.8) : 0;
            stamp.material.opacity = sk;
            stampUp.scale.set(5 * (after > 0 && after < 0.25 ? 1.4 - after * 1.6 : 1), 1.25, 0.02);
            cracks.forEach(cr => { cr.material.opacity = sk * 0.9; });
            faceGlow.material.opacity = 0.5 + sig.phase * 0.5;
            if (shock.visible) {
                shock.userData.k += dt * 1.4;
                const k = shock.userData.k;
                shock.position.set(0, 0.1, 2.6); shock.scale.setScalar(1 + k * 12);
                shock.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
                if (k >= 1) shock.visible = false;
            }
            victims.forEach((v, i) => {
                const m = v.m.root;
                if (v.fly > 0) {
                    v.v.y -= 14 * dt;
                    m.position.addScaledVector(v.v, dt);
                    m.rotation.x += dt * 8; m.rotation.z += dt * 5;
                    v.fly -= dt * 0.55;
                    if (v.fly <= 0) { m.position.copy(v.home).setY(-3); m.rotation.set(0, Math.PI, 0); }
                } else {
                    m.position.x = v.home.x; m.position.z = v.home.z;
                    m.position.y = Math.min(0, m.position.y + dt * 3);
                    m.rotation.set(0, Math.PI + Math.atan2(v.home.x, v.home.z), 0);
                    const shake = Math.sin(t * 20 + i) * 0.08 * sig.phase;
                    v.m.armL.rotation.x = -2.6 + shake; v.m.armR.rotation.x = -2.6 - shake;   // 손 들고 벌벌
                }
            });
        });
    },

    /* 어드민 박지성 — 세계를 만든 사람. 금빛 왕관과 흰 망토로 떠 있고, 명령어 창이 차례로 떠서 실행되며,
       하늘의 거대한 커서가 딸깍 누를 때마다 번개가 떨어짐. 꼬마 플레이어들이 둘러서 절함 */
    admin({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, mini, rand, TMP } = kit;
        stage.setSky('#060400');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const gold = solidMat(new THREE.Color('#ffd23a'), 0.45);
        const white = new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.4, emissive: 0x3a3020, emissiveIntensity: 0.4 });
        // 왕관
        const crown = new THREE.Group(); crown.position.y = 0.75;
        crown.add(box(gold, 1.46, 0.32, 1.46, 0, 0, 0));
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; crown.add(box(gold, 0.22, 0.4 + (i % 2) * 0.3, 0.22, Math.cos(a) * 0.64, 0.3 + (i % 2) * 0.15, Math.sin(a) * 0.64)); }
        const gem = box(glowMat(0xff3b5c, 1), 0.26, 0.26, 0.06, 0, 0.02, 0.74); crown.add(gem);
        attach(dummy.head, crown);
        // 흰 옷 + 금 장식 + 망토
        attach(dummy.torso, box(white, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(gold, 2.14, 0.18, 1.14, 0, -0.95, 0));
        attach(dummy.torso, box(gold, 0.18, 2.12, 1.14, 0.55, 0, 0));
        for (const arm of [dummy.armL, dummy.armR]) { attach(arm, box(white, 1.08, 1.6, 1.08, 0, -0.6, 0)); attach(arm, box(gold, 1.12, 0.16, 1.12, 0, -1.4, 0)); }
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(white, 1.04, 2.04, 1.06, 0, -1.0, 0));
        const cape = new THREE.Group(); cape.position.set(0, 4.0, -0.66);
        const capeSegs = [];
        for (let i = 0; i < 7; i++) { const s = new THREE.Group(); s.position.y = -i * 0.6; s.add(box(white, 2.5 + i * 0.25, 0.62, 0.06, 0, -0.3, 0)); s.add(box(gold, 2.52 + i * 0.25, 0.1, 0.07, 0, -0.62, 0)); cape.add(s); capeSegs.push(s); }
        attach(dummy.root, cape);
        // 뒤의 금빛 후광 (네모 링 겹)
        const halo = new THREE.Group(); halo.position.set(0, 5.2, -1.2); group.add(halo);
        const rings = [2.4, 3.2, 4.1].map((s, i) => { const r = square(s, 0.08, glowMat(i === 1 ? 0xffffff : pick(0), 0.7)); r.rotation.x = Math.PI / 2; halo.add(r); return r; });
        // 명령어 창
        const CMDS = [':luck all 100', ':biome admin', ':give all heaven', ':fly jisung', ':god me', ':ban bug', ':roll jxs', ':spawn crown'];
        function cmdTex(text, done) {
            const c = document.createElement('canvas'); c.width = 320; c.height = 96;
            const g = c.getContext('2d');
            g.fillStyle = 'rgba(12,10,4,0.9)'; g.fillRect(0, 0, 320, 96);
            g.strokeStyle = '#ffd23a'; g.lineWidth = 5; g.strokeRect(2, 2, 316, 92);
            g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 320, 20);
            g.fillStyle = '#1a1200'; g.font = 'bold 13px monospace'; g.fillText('ADMIN CONSOLE', 10, 15);
            g.font = 'bold 26px monospace'; g.fillStyle = '#fff3c0'; g.fillText('> ' + text, 12, 60);
            g.font = 'bold 15px monospace'; g.fillStyle = done ? '#3dff8a' : '#ffd23a'; g.fillText(done ? '✓ executed' : 'running…', 12, 85);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
        }
        const wins = [];
        for (let i = 0; i < 4; i++) {
            const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false });
            const m = new THREE.Mesh(BOX, mat); m.scale.set(2.6, 0.78, 0.02);
            group.add(m); wins.push({ m, mat, cmd: -1, done: false });
        }
        const winPos = [[-2.6, 6.2], [2.6, 5.4], [-2.8, 3.4], [2.8, 2.6]];
        // 하늘의 커서
        const cursor = new THREE.Group(); cursor.userData.noFit = true; group.add(cursor);
        const CUR = ['10000000', '11000000', '11100000', '11110000', '11111000', '11111100', '11111110', '11111000', '11011000', '10001100', '00001100', '00000110'];
        const curM = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), curB = new THREE.MeshBasicMaterial({ color: 0x111111 });
        CUR.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '1') { const edge = k === 0 || row[k + 1] !== '1' || (CUR[r + 1] || '')[k] !== '1'; cursor.add(box(edge ? curB : curM, 0.42, 0.42, 0.2, k * 0.42, -r * 0.42, 0)); } }));
        // 번개
        const boltMat = glowMat(0xfff3a0, 1);
        const bolt = kit.bolt(10, boltMat); bolt.visible = false; group.add(bolt);
        const hit = square(1, 0.14, glowMat(pick(0), 0.9)); hit.visible = false; group.add(hit);
        // 절하는 플레이어들
        const fans = [];
        const fanCols = [0x5ab0ff, 0xff7eb6, 0x7dff6a, 0xffb347, 0xc08bff, 0x7fe0ff];
        for (let i = 0; i < 6; i++) {
            const m = mini(fanCols[i], { scale: 0.34 });
            const a = Math.PI * 0.15 + (i / 5) * Math.PI * 0.7;
            m.root.position.set(Math.cos(a) * 4, 0, Math.sin(a) * 2.6 + 0.4);
            m.root.rotation.y = Math.atan2(-m.root.position.x, -m.root.position.z);
            m.root.userData.noFit = true;
            group.add(m.root); fans.push(m);
        }
        // 금빛 입자 + 바닥 룬
        const runes = [0, 1].map(i => { const r = square(4 + i * 2, 0.1, glowMat(pick(0), 0.5)); r.position.y = 0.1; group.add(r); return r; });
        const NP = 36;
        const dust = new THREE.InstancedMesh(BOX, glowMat(0xffe27a, 0.9), NP);
        const dD = Array.from({ length: NP }, () => ({ a: rand(0, 6.3), r: rand(1.4, 3.4), y: rand(0, 8), v: rand(0.5, 1.2) }));
        group.add(dust);
        sig.click = 0;
        let lastCmd = -1, clickN = -1;
        const target = new THREE.Vector3();
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            halo.position.y = 5.2 + lift;
            rings.forEach((r, i) => { r.rotation.y = t * (i % 2 ? -0.6 : 0.4); });
            capeSegs.forEach((s, i) => { s.rotation.x = -0.15 - Math.sin(t * 2 + i * 0.6) * 0.05 * (i + 1) * 0.4; });
            gem.material.opacity = 0.7 + Math.sin(t * 4) * 0.3;
            // 1.5초마다 명령어 하나씩
            const ci = Math.floor(t / 1.5);
            if (ci !== lastCmd) {
                lastCmd = ci;
                const w = wins[ci % wins.length];
                w.text = CMDS[ci % CMDS.length];
                w.mat.map?.dispose(); w.mat.map = cmdTex(w.text, false); w.mat.needsUpdate = true;
                w.born = t; w.done = false;
            }
            wins.forEach((w, i) => {
                if (w.born === undefined) return;
                const age = t - w.born;
                if (!w.done && age > 0.9) { w.done = true; w.mat.map.dispose(); w.mat.map = cmdTex(w.text, true); }
                const [x, y] = winPos[i];
                w.m.position.set(x, y + lift + Math.sin(t + i) * 0.1, 0.4);
                w.m.rotation.y = x > 0 ? -0.35 : 0.35;
                const pop = Math.min(1, age / 0.2);
                w.m.scale.set(2.6 * pop, 0.78 * pop, 0.02);
                w.mat.opacity = age > 5.2 ? Math.max(0, 1 - (age - 5.2) / 0.5) : 0.95;
            });
            // 커서: 하늘을 떠다니다 4초마다 바닥 한 곳을 딸깍 → 번개
            const c = t % 4;
            const cn = Math.floor(t / 4);
            const tx = Math.sin(cn * 2.3) * 2.6, tz = 1.4 + Math.cos(cn * 1.7) * 0.8;
            const move = Math.min(1, c / 2);
            cursor.position.set(THREE.MathUtils.lerp(Math.sin((cn - 1) * 2.3) * 2.6, tx, move) + 0.2, 9.5 - (c > 2 && c < 2.25 ? 0.4 : 0), -2);
            const press = c > 2 && c < 2.25;
            cursor.scale.setScalar(press ? 0.85 : 1);
            sig.click = c > 1.8 && c < 2.8 ? 1 : 0;
            if (c > 2 && clickN !== cn) {
                clickN = cn;
                target.set(tx, 0, tz);
                bolt.visible = true; bolt.userData.k = 0;
                hit.visible = true; hit.userData.k = 0;
                stage.flash?.(0.3);
            }
            if (bolt.visible) {
                bolt.userData.k += dt * 3;
                bolt.reshape([cursor.position.x - 0.2, 9, cursor.position.z + 1], [target.x, 0.1, target.z], 0.5);
                boltMat.opacity = Math.max(0, 1 - bolt.userData.k);
                if (bolt.userData.k >= 1) bolt.visible = false;
            }
            if (hit.visible) {
                hit.userData.k += dt * 1.5;
                const k = hit.userData.k;
                hit.position.set(target.x, 0.12, target.z); hit.scale.setScalar(0.5 + k * 5);
                hit.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
                if (k >= 1) hit.visible = false;
            }
            // 플레이어들 절하기
            fans.forEach((m, i) => {
                const bow = (Math.sin(t * 2.2 + i * 0.5) * 0.5 + 0.5);
                m.root.rotation.x = 0;
                m.torso.rotation.x = bow * 0.9; m.head.rotation.x = bow * 0.5;
                m.armL.rotation.x = -0.4 - bow * 1.2; m.armR.rotation.x = -0.4 - bow * 1.2;
                m.head.position.z = bow * 0.6; m.armL.position.z = m.armR.position.z = bow * 0.5;
            });
            runes.forEach((r, i) => { r.rotation.y = t * (i ? -0.25 : 0.18); });
            dD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 8) d.y = 0;
                TMP.p.set(Math.cos(d.a + t * 0.3) * d.r, d.y, Math.sin(d.a + t * 0.3) * d.r);
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 2, 0.78)); TMP.sc.setScalar(0.12 * (1 - d.y / 8) + 0.03);
                dust.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            dust.instanceMatrix.needsUpdate = true;
        });
    },


    /* =================== 🎃 할로윈의 밤 전용 =================== */

    /* 호박머리 공병은 — 머리가 잭오랜턴, 손에 흔들리는 등불, 주위를 둥실 도는 꼬마 호박들 */
    pumpkinHead({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#0a0414');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, rz = 0) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); b.rotation.z = rz; return b; };
        const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55, emissive: 0x6a2200, emissiveIntensity: 0.5 });
        const rib = new THREE.MeshStandardMaterial({ color: 0xc8520a, roughness: 0.7 });
        const stemM = new THREE.MeshStandardMaterial({ color: 0x3a7a2a, roughness: 0.8 });
        const fire = new THREE.MeshStandardMaterial({ color: 0xffd23a, emissive: 0xffa000, emissiveIntensity: 2.2 });
        // 호박 머리
        const head = new THREE.Group(); head.position.y = 0.1;
        head.add(box(orange, 1.7, 1.45, 1.6, 0, 0, 0));
        for (const x of [-0.5, 0, 0.5]) { head.add(box(rib, 0.1, 1.46, 0.04, x, 0, 0.81)); head.add(box(rib, 0.1, 1.46, 0.04, x, 0, -0.81)); }
        for (const z of [-0.45, 0.45]) { head.add(box(rib, 0.04, 1.46, 0.1, 0.86, 0, z)); head.add(box(rib, 0.04, 1.46, 0.1, -0.86, 0, z)); }
        head.add(box(stemM, 0.2, 0.4, 0.2, 0.05, 0.9, 0, 0.25));
        head.add(box(stemM, 0.4, 0.06, 0.2, 0.3, 0.85, 0.1, -0.3));
        const face = new THREE.Group(); face.position.z = 0.82;
        face.add(box(fire, 0.32, 0.32, 0.03, -0.38, 0.22, 0, Math.PI / 4));
        face.add(box(fire, 0.32, 0.32, 0.03, 0.38, 0.22, 0, Math.PI / 4));
        face.add(box(fire, 0.14, 0.14, 0.03, 0, -0.02, 0, Math.PI / 4));
        face.add(box(fire, 1.0, 0.14, 0.03, 0, -0.32, 0));
        for (const x of [-0.3, 0, 0.3]) face.add(box(fire, 0.14, 0.12, 0.03, x + 0.15, -0.22, 0));
        for (const x of [-0.3, 0]) face.add(box(fire, 0.14, 0.12, 0.03, x + 0.15, -0.42, 0));
        head.add(face);
        attach(dummy.head, head);
        const headLight = new THREE.PointLight(0xffa040, 4, 7, 1.6); headLight.userData.own = true; headLight.position.set(0, 0.2, 1.4); attach(dummy.head, headLight);
        // 등불 (캐릭터 왼손)
        const lantern = new THREE.Group(); lantern.position.set(0, -2.0, 0);
        const iron = new THREE.MeshStandardMaterial({ color: 0x1a1a20, metalness: 0.7, roughness: 0.4 });
        lantern.add(box(iron, 0.05, 0.5, 0.05, 0, -0.25, 0));
        const lamp = new THREE.Group(); lamp.position.y = -0.7; lantern.add(lamp);
        lamp.add(box(iron, 0.5, 0.08, 0.5, 0, 0.3, 0)); lamp.add(box(iron, 0.5, 0.08, 0.5, 0, -0.3, 0));
        for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) lamp.add(box(iron, 0.06, 0.6, 0.06, x, 0, z));
        const flame = box(glowMat(pick(0), 1), 0.2, 0.3, 0.2, 0, 0, 0); lamp.add(flame);
        lamp.add(box(glowMat(0xffd27a, 0.25), 0.44, 0.52, 0.44, 0, 0, 0));
        attach(dummy.armR, lantern);
        // 둥실 도는 꼬마 호박들
        const minis = [];
        for (let i = 0; i < 6; i++) {
            const p = new THREE.Group();
            p.add(box(orange, 0.6, 0.5, 0.56, 0, 0, 0));
            p.add(box(stemM, 0.08, 0.16, 0.08, 0, 0.32, 0));
            const f = box(fire, 0.36, 0.08, 0.02, 0, -0.08, 0.29); p.add(f);
            p.add(box(fire, 0.1, 0.1, 0.02, -0.12, 0.08, 0.29, Math.PI / 4)); p.add(box(fire, 0.1, 0.1, 0.02, 0.12, 0.08, 0.29, Math.PI / 4));
            group.add(p); minis.push({ p, a: (i / 6) * Math.PI * 2, r: 2.4 + (i % 2) * 0.5, y: 1.2 + (i % 3) * 0.9 });
        }
        // 낙엽 + 불씨
        const N = 26;
        const leaves = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0xc8520a, roughness: 0.8, emissive: 0x401000, emissiveIntensity: 0.4 }), N);
        const lD = Array.from({ length: N }, () => ({ x: rand(-4, 4), y: rand(0, 7), z: rand(-3, 2), v: rand(0.4, 0.9), r: rand(0, 6) }));
        group.add(leaves);
        tick((t, dt) => {
            fire.emissiveIntensity = 1.8 + Math.sin(t * 13) * 0.4 + Math.sin(t * 7.1) * 0.3;
            headLight.intensity = 3.5 + Math.sin(t * 11) * 0.8;
            flame.scale.set(0.2, 0.3 + Math.sin(t * 15) * 0.06, 0.2);
            lamp.rotation.z = Math.sin(t * 1.8) * 0.25; lamp.rotation.x = Math.sin(t * 1.3) * 0.15;
            const lift = dummy.root.position.y;
            minis.forEach((m, i) => {
                const a = m.a + t * 0.6;
                m.p.position.set(Math.cos(a) * m.r, m.y + lift + Math.sin(t * 2 + i) * 0.25, Math.sin(a) * m.r);
                m.p.rotation.y = -a + Math.PI / 2;
                m.p.rotation.z = Math.sin(t * 2.2 + i) * 0.15;
            });
            lD.forEach((d, i) => {
                d.y -= d.v * dt; d.x += Math.sin(t + d.r) * dt * 0.5;
                if (d.y < 0) { d.y = 7; d.x = rand(-4, 4); }
                TMP.p.set(d.x, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t * 2 + d.r, t + i, t * 1.5)); TMP.sc.set(0.22, 0.03, 0.16);
                leaves.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            leaves.instanceMatrix.needsUpdate = true;
        });
    },

    /* 마녀 김티비 — 뾰족 모자, 빗자루를 타고 둥실, 꼬리엔 검은 고양이, 아래엔 끓는 솥, 지팡이로 초록 마법 */
    witch({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#08030f');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const cloth = new THREE.MeshStandardMaterial({ color: 0x2a1240, roughness: 0.75 });
        const band = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.5, emissive: 0x7a2a00, emissiveIntensity: 0.5 });
        // 모자
        const hat = new THREE.Group(); hat.position.y = 0.66;
        hat.add(box(cloth, 2.3, 0.1, 2.3, 0, 0, 0));
        hat.add(box(band, 1.42, 0.2, 1.42, 0, 0.15, 0));
        const cone = new THREE.Group(); hat.add(cone);
        [[1.3, 0.5], [1.0, 0.5], [0.72, 0.5], [0.46, 0.45], [0.24, 0.4]].reduce((y, [w, h], i) => {
            const b = box(cloth, w, h, w, i * 0.07, y + h / 2, -i * 0.04); cone.add(b); return y + h;
        }, 0.1);
        cone.rotation.z = -0.12;
        hat.add(box(glowMat(0x7dff6a, 0.9), 0.16, 0.16, 0.04, 0.3, 0.2, 0.72));
        attach(dummy.head, hat);
        // 긴 머리 (뒤로)
        const hair = new THREE.MeshStandardMaterial({ color: 0x4a2a6a, roughness: 0.7 });
        attach(dummy.head, box(hair, 1.32, 1.5, 0.3, 0, -0.35, -0.55));
        // 치마 + 망토
        attach(dummy.torso, box(cloth, 2.1, 2.08, 1.1, 0, 0, 0));
        attach(dummy.torso, box(band, 2.12, 0.16, 1.12, 0, -0.9, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(cloth, 1.1, 1.2, 1.1, 0, -0.5, 0));
        // 빗자루 (몸에 붙어서 같이 뜸). 앞뒤(z)로 길게
        const broom = new THREE.Group(); broom.position.set(0, 1.85, 0.25); broom.rotation.y = Math.PI / 2;
        const wood = new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: 0.8 });
        broom.add(box(wood, 0.22, 0.22, 5.2, 0, 0, 0.3));
        const straw = new THREE.MeshStandardMaterial({ color: 0xd9a84a, roughness: 0.9 });
        for (let i = 0; i < 9; i++) { const s = box(straw, 0.12, 0.12, 1.4, Math.cos(i * 0.7) * 0.25, Math.sin(i * 0.7) * 0.25, -2.7); s.rotation.set(Math.sin(i * 0.7) * 0.25, -Math.cos(i * 0.7) * 0.25, 0); broom.add(s); }
        broom.add(box(band, 0.4, 0.4, 0.2, 0, 0, -2.0));
        // 고양이 (빗자루 뒤쪽)
        const catM = new THREE.MeshStandardMaterial({ color: 0x0d0a12, roughness: 0.6 });
        const cat = new THREE.Group(); cat.position.set(0, 0.42, -1.55); cat.rotation.y = Math.PI;
        cat.add(box(catM, 0.4, 0.36, 0.6, 0, 0, 0));
        cat.add(box(catM, 0.38, 0.34, 0.34, 0, 0.3, -0.32));
        cat.add(box(catM, 0.1, 0.14, 0.08, -0.12, 0.53, -0.32)); cat.add(box(catM, 0.1, 0.14, 0.08, 0.12, 0.53, -0.32));
        const catEyes = glowMat(0xffe14d, 1);
        cat.add(box(catEyes, 0.08, 0.05, 0.02, -0.08, 0.33, -0.5)); cat.add(box(catEyes, 0.08, 0.05, 0.02, 0.08, 0.33, -0.5));
        const tail = box(catM, 0.07, 0.5, 0.07, 0, 0.25, 0.32); cat.add(tail);
        broom.add(cat);
        attach(dummy.root, broom);
        // 지팡이 (캐릭터 오른손 = armL)
        const wand = new THREE.Group(); wand.position.set(0, -2.0, 0); wand.rotation.x = Math.PI * 0.6;
        wand.add(box(wood, 0.08, 1.3, 0.08, 0, 0.6, 0));
        const tip = box(glowMat(pick(1), 1), 0.22, 0.22, 0.22, 0, 1.3, 0); wand.add(tip);
        attach(dummy.armL, wand);
        // 솥
        const pot = new THREE.Group(); pot.position.set(0, 0, 1.4); pot.userData.noFit = true; pot.scale.setScalar(0.8);
        const potM = new THREE.MeshStandardMaterial({ color: 0x141418, metalness: 0.6, roughness: 0.4 });
        pot.add(box(potM, 1.8, 0.9, 1.8, 0, 0.45, 0)); pot.add(box(potM, 2.0, 0.16, 2.0, 0, 0.92, 0));
        for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) pot.add(box(potM, 0.2, 0.2, 0.2, x, 0.05, z));
        const brew = box(glowMat(0x7dff6a, 0.9), 1.6, 0.06, 1.6, 0, 0.98, 0); pot.add(brew);
        group.add(pot);
        const potLight = new THREE.PointLight(0x7dff6a, 3, 6, 1.6); potLight.userData.own = true; potLight.position.set(0, 1.6, 1.4); group.add(potLight);
        const B = 18;
        const bubbles = new THREE.InstancedMesh(BOX, glowMat(0x9dff7a, 0.8), B);
        const bD = Array.from({ length: B }, () => ({ x: rand(-0.6, 0.6), z: rand(-0.6, 0.6), y: rand(0, 2), v: rand(0.6, 1.4) }));
        bubbles.userData.noFit = true; group.add(bubbles);
        // 별가루 꼬리 (빗자루 뒤로)
        const S = 30;
        const dust = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.85), S);
        const sD = Array.from({ length: S }, () => ({ k: Math.random(), x: rand(-0.4, 0.4), y: rand(-0.3, 0.3) }));
        group.add(dust);
        // 마법 고리
        const rings = [0, 1].map(() => { const r = square(1, 0.06, glowMat(pick(1), 0.9)); r.visible = false; group.add(r); return r; });
        sig.castK = 0;
        const wtip = new THREE.Vector3();
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = t % 5;
            sig.castK = c < 0.5 ? c / 0.5 : c < 1.4 ? 1 : c < 1.9 ? 1 - (c - 1.4) / 0.5 : 0;
            tip.scale.setScalar(0.22 * (1 + sig.castK * 0.8));
            tail.rotation.z = Math.sin(t * 3) * 0.6;
            brew.scale.y = 0.06 + Math.abs(Math.sin(t * 4)) * 0.04;
            bD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 2) d.y = 0;
                TMP.p.set(d.x * 0.8, 0.8 + d.y, 1.4 + d.z * 0.8); TMP.q.identity(); TMP.sc.setScalar(0.2 * (1 - d.y / 2));
                bubbles.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            bubbles.instanceMatrix.needsUpdate = true;
            sD.forEach((d, i) => {
                d.k += dt * 0.5; if (d.k > 1) d.k = 0;
                TMP.p.set(-2.9 - d.k * 3.5, 1.85 + lift + d.y + Math.sin(t * 2 + d.k * 6) * 0.3 * d.k, 0.25 + d.x + Math.sin(t * 3 + i) * 0.2 * d.k);
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 2, 0.78)); TMP.sc.setScalar(0.16 * (1 - d.k));
                dust.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            dust.instanceMatrix.needsUpdate = true;
            tip.getWorldPosition(wtip);
            rings.forEach((r, i) => {
                const k = (c - 1.0 - i * 0.25) / 1.2;
                r.visible = k > 0 && k < 1;
                if (!r.visible) return;
                r.position.copy(wtip); r.rotation.set(Math.PI / 2, t * 2, 0);
                r.scale.setScalar(0.4 + k * 4);
                r.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
            });
        });
    },

    /* 뱀파이어 백작 김건우 — 창백한 얼굴, 높은 깃 망토가 날개처럼 펼쳐짐, 박쥐 떼 소용돌이, 핏빛 달과 고성 */
    vampire({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#070006');
        stage.setSkin({ color: '#dcd7e4', eye: '#ff1f3d', glowEyes: true, smile: false, emissive: 0.04 });
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const black = new THREE.MeshStandardMaterial({ color: 0x0c0a10, roughness: 0.5, metalness: 0.2 });
        const red = new THREE.MeshStandardMaterial({ color: 0x8a0a1a, roughness: 0.45, emissive: 0x3a0008, emissiveIntensity: 0.6 });
        const white = new THREE.MeshStandardMaterial({ color: 0xf2f0f4, roughness: 0.5 });
        const gold = solidMat(new THREE.Color('#d4a84a'), 0.3);
        // 옷
        attach(dummy.torso, box(black, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(red, 0.7, 1.9, 1.14, 0, 0, 0));
        attach(dummy.torso, box(white, 0.4, 0.5, 1.16, 0, 0.6, 0));
        attach(dummy.torso, box(gold, 0.18, 0.18, 1.2, 0, 0.25, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(black, 1.04, 2.04, 1.06, 0, -1.0, 0));
        for (const arm of [dummy.armL, dummy.armR]) { attach(arm, box(black, 1.08, 1.7, 1.08, 0, -0.65, 0)); attach(arm, box(white, 1.1, 0.16, 1.1, 0, -1.55, 0)); }
        // 머리: 뒤로 넘긴 검은 머리
        attach(dummy.head, box(black, 1.3, 0.3, 1.26, 0, 0.55, -0.02));
        attach(dummy.head, box(black, 1.3, 1.0, 0.25, 0, 0.1, -0.56));
        // 송곳니
        attach(dummy.head, box(white, 0.08, 0.14, 0.03, -0.15, -0.3, 0.61)); attach(dummy.head, box(white, 0.08, 0.14, 0.03, 0.15, -0.3, 0.61));
        // 높은 깃 + 망토 (반쪽씩 어깨에서 펼쳐짐)
        const collar = new THREE.Group(); collar.position.set(0, 4.15, -0.45);
        for (const s of [-1, 1]) { const c = box(red, 0.9, 1.5, 0.08, s * 0.65, 0.6, 0); c.rotation.set(-0.2, s * 0.5, s * -0.15); collar.add(c); const c2 = box(black, 0.92, 1.52, 0.06, s * 0.66, 0.6, -0.06); c2.rotation.copy(c.rotation); collar.add(c2); }
        attach(dummy.root, collar);
        const halves = [];
        for (const s of [-1, 1]) {
            const pv = new THREE.Group(); pv.position.set(s * 0.9, 3.95, -0.6);
            const segs = [];
            for (let i = 0; i < 6; i++) {
                const seg = new THREE.Group(); seg.position.y = -i * 0.62;
                seg.add(box(black, 1.2 + i * 0.12, 0.64, 0.08, s * (0.5 + i * 0.06), -0.3, 0));
                seg.add(box(red, 1.16 + i * 0.12, 0.62, 0.04, s * (0.5 + i * 0.06), -0.3, 0.06));
                pv.add(seg); segs.push(seg);
            }
            attach(dummy.root, pv);
            halves.push({ pv, s, segs });
        }
        // 핏빛 달 + 고성 (멀리, 카메라 맞춤에서 뺌)
        const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
        const moon = box(new THREE.MeshBasicMaterial({ color: 0xc8102a, toneMapped: false }), 10, 10, 0.2, 7, 12, -40);
        far.add(moon);
        far.add(box(glowMat(0xff2040, 0.25), 15, 15, 0.1, 7, 12, -40.5));
        const crater = new THREE.MeshBasicMaterial({ color: 0x8a0018, toneMapped: false });
        far.add(box(crater, 2, 2, 0.1, 5, 13.5, -39.8)); far.add(box(crater, 1.4, 1.4, 0.1, 9, 10.5, -39.8)); far.add(box(crater, 1, 1, 0.1, 6.5, 9.5, -39.8));
        const stoneM = new THREE.MeshStandardMaterial({ color: 0x0a0810, roughness: 1 });
        const winM = glowMat(0xffc060, 0.9);
        [[-12, 9, 3], [-8, 13, 2.4], [-4.5, 7, 3.4], [-15, 6, 2], [12, 6, 2.6]].forEach(([x, h, w]) => {
            far.add(box(stoneM, w, h, w, x, h / 2, -26));
            far.add(box(stoneM, w * 0.5, 2, w * 0.5, x, h + 1, -26));
            for (let k = 0; k < 3; k++) if ((x + k) % 2) far.add(box(winM, 0.35, 0.6, 0.05, x - w * 0.2 + k * 0.3, h * (0.4 + k * 0.17), -26 + w / 2 + 0.03));
        });
        // 촛대 링
        const candles = [];
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + 0.5;
            const cg = new THREE.Group(); cg.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 2.4 - 0.5);
            cg.add(box(gold, 0.16, 2.2, 0.16, 0, 1.1, 0)); cg.add(box(gold, 0.5, 0.1, 0.5, 0, 2.2, 0));
            cg.add(box(white, 0.2, 0.5, 0.2, 0, 2.5, 0));
            const f = box(glowMat(0xffb040, 1), 0.14, 0.24, 0.14, 0, 2.9, 0); cg.add(f); candles.push(f);
            group.add(cg);
        }
        // 박쥐 떼
        const NB = 36;
        const batM = new THREE.MeshStandardMaterial({ color: 0x120810, roughness: 0.6, emissive: 0x2a0006, emissiveIntensity: 0.5 });
        const bodyI = new THREE.InstancedMesh(BOX, batM, NB), wingI = new THREE.InstancedMesh(BOX, batM, NB * 2);
        bodyI.userData.noFit = wingI.userData.noFit = true;
        group.add(bodyI, wingI);
        const bats = Array.from({ length: NB }, (_, i) => ({ a: rand(0, 6.3), r: rand(1.8, 3.6), y: rand(0.5, 6.5), sp: rand(0.8, 1.6) * (i % 3 ? 1 : -1), ph: rand(0, 6) }));
        const wq = new THREE.Quaternion(), wp = new THREE.Vector3(), off = new THREE.Vector3();
        const burstRing = square(1, 0.08, glowMat(pick(0), 0.9)); burstRing.visible = false; group.add(burstRing);
        sig.spread = 0;
        tick((t, dt) => {
            const c = t % 7;
            // 0~2: 망토로 몸을 감쌈 / 2~2.6: 확 펼침 / ~5.5 유지 / 다시 감쌈
            const sp = c < 2 ? 0 : c < 2.5 ? (c - 2) / 0.5 : c < 5.5 ? 1 : c < 6.5 ? 1 - (c - 5.5) : 0;
            sig.spread = sp;
            halves.forEach(({ pv, s, segs }) => {
                pv.rotation.y = s * (-0.9 + sp * 0.9) ;
                pv.rotation.z = s * sp * 0.55;
                segs.forEach((seg, i) => { seg.rotation.x = Math.sin(t * 3 + i * 0.6) * 0.06 * (1 + sp); seg.rotation.y = s * sp * i * 0.05; });
            });
            const burst = c - 2;
            burstRing.visible = burst > 0 && burst < 1;
            if (burstRing.visible) {
                burstRing.position.set(0, 3 + dummy.root.position.y, 0); burstRing.rotation.y = 0.785;
                burstRing.scale.setScalar(1 + burst * 9);
                burstRing.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - burst); });
            }
            candles.forEach((f, i) => f.scale.set(0.14, 0.24 + Math.sin(t * 12 + i) * 0.05, 0.14));
            const flap = t * 18;
            bats.forEach((b, i) => {
                const out = sp > 0.5 && c < 3.2 ? (c - 2.2) * 2.5 : 0;
                const a = b.a + t * b.sp;
                const r = b.r + Math.max(0, out);
                TMP.p.set(Math.cos(a) * r, b.y + Math.sin(t * 2 + b.ph) * 0.4 + dummy.root.position.y * 0.5, Math.sin(a) * r);
                TMP.q.setFromEuler(TMP.e.set(0, -a + (b.sp > 0 ? 0 : Math.PI), 0));
                TMP.sc.set(0.22, 0.16, 0.3);
                bodyI.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                const f = Math.sin(flap + b.ph) * 0.8;
                for (const s of [-1, 1]) {
                    wq.setFromEuler(TMP.e.set(0, -a + (b.sp > 0 ? 0 : Math.PI), s * f));
                    off.set(s * 0.26, 0, 0).applyQuaternion(wq);
                    wp.copy(TMP.p).add(off);
                    TMP.sc.set(0.38, 0.04, 0.24);
                    wingI.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), TMP.m4.compose(wp, wq, TMP.sc));
                }
            });
            bodyI.instanceMatrix.needsUpdate = true; wingI.instanceMatrix.needsUpdate = true;
        });
    },

    /* 목 없는 기사 김가은 — 머리 대신 초록 혼불, 손엔 불타는 호박, 옆엔 앞발을 드는 유령마 */
    headless({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP, heldSword } = kit;
        stage.setSky('#020804');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => { owned.forEach(([p, o]) => p.remove(o)); dummy.head.visible = true; });
        dummy.head.visible = false;
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const armor = new THREE.MeshStandardMaterial({ color: 0x5a636e, metalness: 0.85, roughness: 0.28, emissive: 0x0a2a12, emissiveIntensity: 0.5 });
        const trim = new THREE.MeshStandardMaterial({ color: 0x2a6a2a, metalness: 0.5, roughness: 0.3, emissive: pick(0), emissiveIntensity: 0.35 });
        const soul = glowMat(pick(0), 0.85);
        // 갑옷
        attach(dummy.torso, box(armor, 2.16, 2.12, 1.16, 0, 0, 0));
        attach(dummy.torso, box(trim, 2.18, 0.14, 1.18, 0, 0.95, 0));
        attach(dummy.torso, box(trim, 0.16, 2.0, 1.18, 0, 0, 0));
        for (const arm of [dummy.armL, dummy.armR]) { attach(arm, box(armor, 1.3, 0.7, 1.3, 0, 0.0, 0)); attach(arm, box(armor, 1.1, 1.2, 1.1, 0, -1.2, 0)); }
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(armor, 1.06, 2.06, 1.08, 0, -1.0, 0));
        // 목에서 솟는 혼불
        const NF = 22;
        const neck = new THREE.InstancedMesh(BOX, soul, NF);
        const nD = Array.from({ length: NF }, () => ({ k: Math.random(), x: rand(-0.35, 0.35), z: rand(-0.3, 0.3), v: rand(0.8, 1.5) }));
        group.add(neck);
        // 해진 망토
        const cape = new THREE.Group(); cape.position.set(0, 3.95, -0.62);
        const capeSegs = [];
        for (let i = 0; i < 6; i++) {
            const row = new THREE.Group(); row.position.y = -i * 0.6;
            for (let k = 0; k < 4; k++) if (!(i > 3 && (k + i) % 2)) row.add(box(new THREE.MeshStandardMaterial({ color: 0x0b0d0c, roughness: 0.9 }), 0.62, 0.62, 0.05, -0.93 + k * 0.62, -0.3, 0));
            cape.add(row); capeSegs.push(row);
        }
        attach(dummy.root, cape);
        // 불타는 호박 (캐릭터 왼손 = armR, 높이 듦)
        const pk = new THREE.Group(); pk.position.set(0, -2.45, 0);
        const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.5, emissive: 0x5a1a00, emissiveIntensity: 0.6 });
        pk.add(box(orange, 1.0, 0.85, 0.95, 0, 0, 0));
        const greenFire = new THREE.MeshStandardMaterial({ color: 0xb6ff9a, emissive: pick(0), emissiveIntensity: 2.4 });
        pk.add(box(greenFire, 0.2, 0.2, 0.03, -0.22, 0.12, 0.49)); pk.add(box(greenFire, 0.2, 0.2, 0.03, 0.22, 0.12, 0.49));
        pk.add(box(greenFire, 0.6, 0.1, 0.03, 0, -0.18, 0.49));
        const pkFlames = [];
        for (let i = 0; i < 5; i++) { const f = box(soul, 0.2, 0.4, 0.2, -0.3 + i * 0.15, 0.6, 0); pk.add(f); pkFlames.push(f); }
        attach(dummy.armR, pk);
        const pkLight = new THREE.PointLight(0x7dff6a, 2.5, 7, 1.8); pkLight.userData.own = true; pkLight.position.set(0, -2.4, 0.6); attach(dummy.armR, pkLight);
        // 검 (캐릭터 오른손 = armL)
        const sw = heldSword(2.6, pick(0), '#3a4a3a', 0.42, true); sw.position.set(0, -1.95, 0); sw.rotation.x = Math.PI * 0.62;
        attach(dummy.armL, sw);
        // 유령마
        const horse = new THREE.Group(); horse.position.set(-2.9, 0, -1.8); horse.rotation.y = 0.45; horse.scale.setScalar(0.85);
        const hide = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.5, metalness: 0.4, emissive: 0x06200c, emissiveIntensity: 0.6 });
        const body = new THREE.Group(); body.position.y = 2.3; horse.add(body);
        body.add(box(hide, 1.3, 1.3, 3.0, 0, 0, 0));
        const neckG = new THREE.Group(); neckG.position.set(0, 0.4, 1.2); body.add(neckG);
        neckG.add(box(hide, 0.75, 1.7, 0.8, 0, 0.75, 0.3));
        const headG = new THREE.Group(); headG.position.set(0, 1.5, 0.6); neckG.add(headG);
        headG.add(box(hide, 0.6, 0.6, 1.3, 0, 0, 0.4));
        headG.add(box(hide, 0.14, 0.3, 0.14, -0.2, 0.42, 0)); headG.add(box(hide, 0.14, 0.3, 0.14, 0.2, 0.42, 0));
        const hEye = glowMat(pick(0), 1);
        headG.add(box(hEye, 0.04, 0.12, 0.16, -0.31, 0.1, 0.4)); headG.add(box(hEye, 0.04, 0.12, 0.16, 0.31, 0.1, 0.4));
        const mane = [];
        for (let i = 0; i < 6; i++) { const m = box(soul, 0.24, 0.4, 0.24, 0, 1.6 - i * 0.28, 0.0 - i * 0.05); neckG.add(m); mane.push(m); }
        const tailF = [];
        for (let i = 0; i < 5; i++) { const m = box(soul, 0.24, 0.24, 0.4, 0, 0.3 - i * 0.25, -1.6 - i * 0.25); body.add(m); tailF.push(m); }
        const legs = [];
        for (const [x, z] of [[-0.45, 1.1], [0.45, 1.1], [-0.45, -1.1], [0.45, -1.1]]) {
            const lg = new THREE.Group(); lg.position.set(x, -0.5, z);
            lg.add(box(hide, 0.32, 1.7, 0.36, 0, -0.85, 0));
            lg.add(box(soul, 0.4, 0.26, 0.42, 0, -1.72, 0));
            body.add(lg); legs.push(lg);
        }
        group.add(horse);
        // 땅: 초록 안개, 죽은 나무, 호박등
        const fog = [0, 1, 2].map(i => { const r = square(4 + i * 1.6, 0.3, glowMat(pick(0), 0.07)); r.position.y = 0.12; group.add(r); return r; });
        const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
        const treeM = new THREE.MeshStandardMaterial({ color: 0x050605, roughness: 1 });
        [[-9, -14, 1], [8, -16, -1], [13, -20, 1]].forEach(([x, z, s]) => {
            far.add(box(treeM, 0.8, 9, 0.8, x, 4.5, z));
            for (let k = 0; k < 4; k++) { const br = box(treeM, 0.3, 3 - k * 0.4, 0.3, x + s * (0.8 + k * 0.3), 6 + k * 1.1, z); br.rotation.z = -s * (0.7 + k * 0.15); far.add(br); }
        });
        const wave = square(1, 0.12, glowMat(pick(0), 0.9)); wave.visible = false; group.add(wave);
        sig.raise = 0;
        let wasRear = false;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = t % 6;
            // 3초쯤 유령마가 앞발을 들고, 기사는 호박을 높이 쳐듦
            const rear = c > 2.6 && c < 4.2 ? Math.sin((c - 2.6) / 1.6 * Math.PI) : 0;
            sig.raise = rear;
            body.rotation.x = -rear * 0.55;
            body.position.y = 2.3 + rear * 0.6;
            neckG.rotation.x = -rear * 0.3 + Math.sin(t * 1.5) * 0.05;
            headG.rotation.x = 0.4 + rear * 0.3;
            legs.forEach((lg, i) => { lg.rotation.x = i < 2 ? -rear * 1.2 + Math.sin(t * 9 + i) * 0.3 * rear : rear * 0.5 + Math.sin(t * 1.2 + i) * 0.05; });
            mane.forEach((m, i) => m.scale.set(0.24, 0.4 + Math.sin(t * 10 + i) * 0.15, 0.24));
            tailF.forEach((m, i) => { m.position.y = 0.3 - i * 0.25 + Math.sin(t * 6 + i) * 0.12; });
            pkFlames.forEach((f, i) => f.scale.set(0.2, 0.35 + Math.abs(Math.sin(t * 9 + i * 1.3)) * 0.4 * (1 + rear), 0.2));
            pkLight.intensity = 2 + Math.sin(t * 13) * 0.5 + rear * 1.5;
            nD.forEach((d, i) => {
                d.k += d.v * dt; if (d.k > 1) d.k = 0;
                TMP.p.set(d.x * (1 - d.k * 0.5), 4.2 + lift + d.k * 1.6, d.z * (1 - d.k * 0.5));
                TMP.q.setFromEuler(TMP.e.set(0, t * 2 + i, 0.78)); TMP.sc.setScalar(0.3 * (1 - d.k) + 0.05);
                neck.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            neck.instanceMatrix.needsUpdate = true;
            capeSegs.forEach((r, i) => { r.rotation.x = -0.1 - Math.sin(t * 2.5 + i * 0.7) * 0.08 * (i + 1) * 0.4; });
            fog.forEach((r, i) => { r.rotation.y = t * (i % 2 ? -0.15 : 0.1); });
            if (rear > 0.95 && !wasRear) { wasRear = true; wave.visible = true; wave.userData.k = 0; stage.shake?.(0.15); }
            if (rear < 0.5) wasRear = false;
            if (wave.visible) {
                wave.userData.k += dt * 1.2;
                const k = wave.userData.k;
                wave.position.set(0, 0.2, 0); wave.scale.setScalar(1 + k * 14);
                wave.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
                if (k >= 1) wave.visible = false;
            }
        });
    },

    /* 호박 대왕 김민채 — 하늘을 가득 채운 거대한 잭오랜턴이 웃음을 터뜨리고, 호박머리 군단이 왕 둘레를 행진 */
    pumpkinKing({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, mini, rand, TMP } = kit;
        stage.setSky('#07020c');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const box = (m, w, h, d, x, y, z, rz = 0) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); b.rotation.z = rz; return b; };
        const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55, emissive: 0x6a2200, emissiveIntensity: 0.55 });
        const rib = new THREE.MeshStandardMaterial({ color: 0xb8480a, roughness: 0.7 });
        const vine = new THREE.MeshStandardMaterial({ color: 0x2f6a24, roughness: 0.8 });
        const purple = new THREE.MeshStandardMaterial({ color: 0x3a145a, roughness: 0.6, emissive: 0x1a0430, emissiveIntensity: 0.5 });
        const gold = solidMat(new THREE.Color('#ffc94d'), 0.35);
        const fire = new THREE.MeshStandardMaterial({ color: 0xffe07a, emissive: 0xff9a00, emissiveIntensity: 2.4 });
        // 거대한 호박 (멀리)
        const giant = new THREE.Group(); giant.position.set(0, 9.5, -30); giant.userData.noFit = true; group.add(giant);
        giant.add(box(orange, 22, 17, 12, 0, 0, 0));
        for (const x of [-7.5, -2.5, 2.5, 7.5]) giant.add(box(rib, 0.8, 17.2, 0.4, x, 0, 6.05));
        giant.add(box(vine, 1.6, 3.5, 1.6, 0.6, 9.8, 0, 0.2));
        giant.add(box(vine, 6, 0.6, 0.6, 3.5, 9.6, 0, -0.25));
        const gFace = new THREE.Group(); gFace.position.z = 6.15; giant.add(gFace);
        const eyeL = box(fire, 4.2, 4.2, 0.2, -5, 3.2, 0, Math.PI / 4), eyeR = box(fire, 4.2, 4.2, 0.2, 5, 3.2, 0, Math.PI / 4);
        gFace.add(eyeL, eyeR);
        gFace.add(box(fire, 1.8, 1.8, 0.2, 0, 0, 0, Math.PI / 4));
        const mouth = new THREE.Group(); mouth.position.y = -3.8; gFace.add(mouth);
        mouth.add(box(fire, 14, 1.8, 0.2, 0, 0, 0));
        const teethUp = [], teethDn = [];
        for (let i = 0; i < 5; i++) { const tu = box(orange, 1.4, 1.0, 0.3, -5.6 + i * 2.8, 0.5, 0.05); mouth.add(tu); teethUp.push(tu); }
        for (let i = 0; i < 4; i++) { const td = box(orange, 1.4, 1.0, 0.3, -4.2 + i * 2.8, -0.5, 0.05); mouth.add(td); teethDn.push(td); }
        const giantGlow = box(glowMat(0xff8a1f, 0.18), 30, 24, 0.1, 0, 0, -6.2); giant.add(giantGlow);
        const gLight = new THREE.PointLight(0xff8a1f, 0, 40, 1.4); gLight.userData.own = true; gLight.position.set(0, 6, -12); group.add(gLight);
        // 왕관 (사탕옥수수 뾰족)
        const crown = new THREE.Group(); crown.position.y = 0.72;
        crown.add(box(gold, 1.42, 0.3, 1.42, 0, 0, 0));
        const candy = [0xfff2d0, 0xff9a1a, 0xffd23a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: 0.25 }));
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const sp = new THREE.Group(); sp.position.set(Math.cos(a) * 0.58, 0.2, Math.sin(a) * 0.58);
            [0.3, 0.22, 0.14].forEach((w, k) => sp.add(box(candy[2 - k], w, 0.22, w, 0, k * 0.22 + 0.1, 0)));
            crown.add(sp);
        }
        crown.add(box(glowMat(0x7dff6a, 1), 0.24, 0.24, 0.06, 0, 0.05, 0.73, Math.PI / 4));
        attach(dummy.head, crown);
        // 왕의 옷 + 망토
        attach(dummy.torso, box(purple, 2.12, 2.1, 1.12, 0, 0, 0));
        attach(dummy.torso, box(orange, 2.14, 0.2, 1.14, 0, -0.95, 0));
        attach(dummy.torso, box(gold, 0.5, 0.5, 1.16, 0, 0.3, 0));
        const cape = new THREE.Group(); cape.position.set(0, 4.0, -0.66);
        const capeSegs = [];
        for (let i = 0; i < 7; i++) {
            const seg = new THREE.Group(); seg.position.y = -i * 0.6;
            seg.add(box(purple, 2.6 + i * 0.22, 0.62, 0.06, 0, -0.3, 0));
            seg.add(box(orange, 2.62 + i * 0.22, 0.1, 0.07, 0, -0.62, 0));
            cape.add(seg); capeSegs.push(seg);
        }
        attach(dummy.root, cape);
        // 큰 낫 (캐릭터 오른손 = armL), 손잡이를 쥐고 위로
        const scythe = new THREE.Group(); scythe.position.set(0, -1.95, 0); scythe.rotation.x = 0.2;
        const wood = new THREE.MeshStandardMaterial({ color: 0x2a1408, roughness: 0.7 });
        scythe.add(box(wood, 0.18, 6.4, 0.18, 0, 1.4, 0));
        scythe.add(box(gold, 0.3, 0.3, 0.3, 0, 4.6, 0));
        const bladeM = new THREE.MeshStandardMaterial({ color: 0xd8dde6, metalness: 0.8, roughness: 0.2, emissive: 0xff7a1a, emissiveIntensity: 0.3 });
        for (let i = 0; i < 6; i++) { const b = box(bladeM, 0.12, 0.5, 0.7 - i * 0.06, 0, 4.4 - Math.pow(i, 1.4) * 0.12, 0.5 + i * 0.55); b.rotation.x = -0.15 - i * 0.12; scythe.add(b); }
        scythe.add(box(glowMat(pick(0), 0.6), 0.06, 0.2, 3.2, 0, 4.25, 1.8));
        attach(dummy.armL, scythe);
        // 호박머리 군단
        const army = [];
        const armyBody = new THREE.MeshStandardMaterial({ color: 0x1a0f22, roughness: 0.7 });
        for (let i = 0; i < 8; i++) {
            const m = mini(0x1a0f22, { scale: 0.36 });
            m.root.traverse(o => { if (o.isMesh) o.material = armyBody; });
            const ph = new THREE.Group();
            ph.add(box(orange, 1.7, 1.45, 1.6, 0, 0, 0));
            ph.add(box(vine, 0.2, 0.4, 0.2, 0, 0.9, 0));
            ph.add(box(fire, 0.34, 0.34, 0.03, -0.38, 0.2, 0.81, Math.PI / 4)); ph.add(box(fire, 0.34, 0.34, 0.03, 0.38, 0.2, 0.81, Math.PI / 4));
            ph.add(box(fire, 0.9, 0.16, 0.03, 0, -0.3, 0.81));
            m.head.add(ph);
            const lan = box(glowMat(0xffb040, 1), 0.4, 0.5, 0.4, 0, -2.2, 0); m.armR.add(lan);
            m.root.userData.noFit = true;
            group.add(m.root);
            army.push({ m, a: (i / 8) * Math.PI * 2 });
        }
        // 박쥐 떼 + 사탕 비 + 유령
        const NB = 24;
        const batM = new THREE.MeshStandardMaterial({ color: 0x0a0410, roughness: 0.6, emissive: 0x2a0a3a, emissiveIntensity: 0.5 });
        const batI = new THREE.InstancedMesh(BOX, batM, NB * 3); batI.userData.noFit = true; group.add(batI);
        const bats = Array.from({ length: NB }, () => ({ a: rand(0, 6.3), r: rand(4, 7), y: rand(4, 9), sp: rand(0.5, 1.1), ph: rand(0, 6) }));
        const NC = 40;
        const candyI = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ roughness: 0.4 }), NC); candyI.userData.noFit = true; group.add(candyI);
        const cCols = ['#ff3b7a', '#5ab0ff', '#7dff6a', '#ffe14d', '#c08bff', '#ff8a1f'].map(c => new THREE.Color(c));
        const cD = Array.from({ length: NC }, (_, i) => { candyI.setColorAt(i, cCols[i % cCols.length]); return { x: rand(-6, 6), y: rand(0, 12), z: rand(-4, 3), v: rand(1.2, 2.4), r: rand(0, 6) }; });
        const ghostM = new THREE.MeshStandardMaterial({ color: 0xf4f2ff, emissive: 0xb8b0ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 });
        const ghosts = [0, 1, 2].map(i => {
            const gh = new THREE.Group();
            gh.add(box(ghostM, 0.9, 0.9, 0.8, 0, 0.2, 0));
            for (const x of [-0.3, 0, 0.3]) gh.add(box(ghostM, 0.26, 0.4, 0.74, x, -0.4, 0));
            const ink = new THREE.MeshBasicMaterial({ color: 0x120a1a });
            gh.add(box(ink, 0.16, 0.22, 0.02, -0.18, 0.3, 0.41)); gh.add(box(ink, 0.16, 0.22, 0.02, 0.18, 0.3, 0.41)); gh.add(box(ink, 0.2, 0.16, 0.02, 0, 0.0, 0.41));
            gh.userData.noFit = true; group.add(gh); return gh;
        });
        // 바닥 룬 + 웃음 충격파
        const runes = [0, 1, 2].map(i => { const r = square(3 + i * 1.5, 0.08, glowMat(i === 1 ? 0x9a4dff : pick(0), 0.7)); r.position.y = 0.12; group.add(r); return r; });
        const shock = square(1, 0.14, glowMat(0xff8a1f, 0.9)); shock.visible = false; group.add(shock);
        sig.laugh = 0;
        let lastLaugh = -1;
        tick((t, dt) => {
            const c = t % 8;
            // 5초쯤: 거대 호박이 껄껄 웃음 (입이 크게 벌어지며 덜컹덜컹)
            const laugh = c > 4.8 && c < 7.2 ? Math.sin((c - 4.8) / 2.4 * Math.PI) : 0;
            sig.laugh = laugh;
            const chatter = laugh * (0.5 + 0.5 * Math.abs(Math.sin(t * 18)));
            mouth.scale.y = 1 + chatter * 1.8;
            teethUp.forEach(tu => { tu.position.y = 0.5 + chatter * 0.4; }); teethDn.forEach(td => { td.position.y = -0.5 - chatter * 0.4; });
            const blink = (t % 5) < 0.12 ? 0.15 : 1;
            eyeL.scale.set(4.2, 4.2 * blink, 0.2); eyeR.scale.copy(eyeL.scale);
            fire.emissiveIntensity = 2.0 + Math.sin(t * 11) * 0.4 + laugh * 2;
            giantGlow.material.opacity = 0.14 + laugh * 0.25 + Math.sin(t * 9) * 0.03;
            gLight.intensity = 2 + laugh * 10;
            giant.rotation.z = Math.sin(t * 0.6) * 0.03 + chatter * 0.02 * Math.sin(t * 30);
            giant.position.y = 9.5 + Math.sin(t * 0.5) * 0.4;
            const n = Math.floor(t / 8);
            if (laugh > 0.6 && lastLaugh !== n) { lastLaugh = n; shock.visible = true; shock.userData.k = 0; stage.shake?.(0.22); stage.flash?.(0.3); }
            if (shock.visible) {
                shock.userData.k += dt * 0.9;
                const k = shock.userData.k;
                shock.position.y = 0.2; shock.scale.setScalar(1 + k * 20);
                shock.children.forEach(ch => { ch.material.opacity = 0.9 * (1 - k); });
                if (k >= 1) shock.visible = false;
            }
            capeSegs.forEach((s, i) => { s.rotation.x = -0.12 - Math.sin(t * 2 + i * 0.6) * 0.05 * (i + 1) * 0.4; });
            // 군단 행진 (웃을 땐 제자리 껑충)
            army.forEach(({ m, a }, i) => {
                const aa = a + t * 0.35;
                const r = 4.2;
                const hop = laugh > 0.2 ? Math.abs(Math.sin(t * 9 + i)) * 0.6 * laugh : 0;
                m.root.position.set(Math.cos(aa) * r, hop, Math.sin(aa) * r * 0.75 - 0.6);
                m.root.rotation.y = -aa;
                const step = Math.sin(t * 7 + i);
                m.legL.rotation.x = step * 0.6; m.legR.rotation.x = -step * 0.6;
                m.armL.rotation.x = -step * 0.4; m.armR.rotation.x = -0.9;
                m.root.rotation.z = Math.sin(t * 7 + i) * 0.05;
            });
            bats.forEach((b, i) => {
                const a = b.a + t * b.sp;
                TMP.p.set(Math.cos(a) * b.r, b.y + Math.sin(t * 2 + b.ph) * 0.6, Math.sin(a) * b.r * 0.6 - 2);
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0)); TMP.sc.set(0.3, 0.2, 0.36);
                batI.setMatrixAt(i * 3, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                const f = Math.sin(t * 20 + b.ph) * 0.9;
                for (const s of [-1, 1]) {
                    const q2 = new THREE.Quaternion().setFromEuler(TMP.e.set(0, -a, s * f));
                    const p2 = TMP.v.set(s * 0.32, 0, 0).applyQuaternion(q2).add(TMP.p);
                    TMP.sc.set(0.46, 0.05, 0.28);
                    batI.setMatrixAt(i * 3 + (s > 0 ? 1 : 2), TMP.m4.compose(p2, q2, TMP.sc));
                }
            });
            batI.instanceMatrix.needsUpdate = true;
            cD.forEach((d, i) => {
                d.y -= d.v * dt; if (d.y < 0) { d.y = 12; d.x = rand(-6, 6); }
                TMP.p.set(d.x, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t * 2 + d.r, t * 3, d.r)); TMP.sc.set(0.3, 0.16, 0.16);
                candyI.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            candyI.instanceMatrix.needsUpdate = true;
            ghosts.forEach((gh, i) => {
                const a = t * 0.4 + i * 2.1;
                gh.position.set(Math.cos(a) * 6, 3.5 + i * 1.6 + Math.sin(t * 1.5 + i) * 0.5, Math.sin(a) * 2.5 - 3);
                gh.rotation.y = -a + Math.PI / 2;
            });
            runes.forEach((r, i) => { r.rotation.y = t * (i % 2 ? -0.3 : 0.2) * (1 + laugh * 3); });
        });
    },


    /* 크레이지콩 — 콩 큐브가 바닥에서 통통 튀며 찌그러짐 */
    crazyBounce({ group, tick, pick, dummy, kit }) {
        const { THREE, BOX, solidMat, rand } = kit;
        const beans = [];
        for (let i = 0; i < 11; i++) {
            const m = new THREE.Mesh(BOX, solidMat(pick(i), 1.4));
            const a = (i / 11) * Math.PI * 2 + rand(-0.2, 0.2);
            const r = rand(1.9, 3.3);
            m.userData = { x: Math.cos(a) * r, z: Math.sin(a) * r, h: rand(1.2, 3.2), sp: rand(3.2, 5.2), ph: rand(0, 6), s: rand(0.32, 0.48) };
            beans.push(m);
            group.add(m);
        }
        tick(t => {
            beans.forEach(b => {
                const d = b.userData;
                const k = Math.abs(Math.sin(t * d.sp + d.ph));
                const y = k * d.h;
                const squash = k < 0.15 ? 1 - (0.15 - k) * 3 : 1 + Math.min(0.25, k * 0.25);
                b.scale.set(d.s / Math.sqrt(squash), d.s * squash, d.s / Math.sqrt(squash));
                b.position.set(d.x, y + b.scale.y / 2, d.z);
                b.rotation.y = t * 2 + d.ph;
            });
            dummy.root.rotation.z = Math.sin(t * 9) * 0.025;   // 신나서 들썩
        });
    },

    /* 광속의 김민채 — 잔상 2개 + 옆으로 스치는 속도선 */
    lightspeed({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, rand, ghost } = kit;
        const g1 = ghost(pick(0), 0.32), g2 = ghost(pick(1), 0.16);
        group.add(g1, g2);
        const lines = [];
        for (let i = 0; i < 26; i++) {
            const m = new THREE.Mesh(BOX, glowMat(pick(i), 0.8));
            m.userData = { y: rand(0.2, 6.5), z: rand(-2.5, 2.5), v: rand(18, 34), len: rand(1.5, 5), x: rand(-12, 12) };
            m.scale.set(m.userData.len, 0.035, 0.035);
            m.userData.noFit = true;
            lines.push(m); group.add(m);
        }
        tick((t, dt) => {
            g1.position.set(-1.0 + Math.sin(t * 7) * 0.08, 0, -0.5);
            g2.position.set(-2.1 + Math.sin(t * 7 + 1) * 0.1, 0, -1.0);
            lines.forEach(l => {
                const d = l.userData;
                d.x -= d.v * dt;
                if (d.x < -12) { d.x = 12; d.y = rand(0.2, 6.5); }
                l.position.set(d.x, d.y, d.z);
            });
        });
    },

    /* 대마법사 공병은 — 겹겹이 반대로 도는 네모 마법진 + 나선으로 솟는 룬 */
    archmage({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, square } = kit;
        const circle = new THREE.Group();
        const outer = square(4.6, 0.06, glowMat(pick(0), 0.95));
        const mid = square(3.4, 0.05, glowMat(pick(1), 0.9)); mid.rotation.y = Math.PI / 4;
        const inner = square(2.2, 0.05, glowMat(pick(0), 0.9));
        const runes = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const side = i % 4, f = (Math.floor(i / 4) + 0.5) / 5 - 0.5;
            const rr = new THREE.Mesh(BOX, glowMat(pick(1), 1));
            rr.scale.set(0.16, 0.04, 0.16);
            const p = [[f * 4.6, 2.65], [f * 4.6, -2.65], [2.65, f * 4.6], [-2.65, f * 4.6]][side];
            rr.position.set(p[0], 0, p[1]);
            runes.add(rr);
        }
        circle.add(outer, mid, inner, runes);
        circle.position.y = 0.06;
        group.add(circle);
        const orbs = [];
        for (let i = 0; i < 4; i++) {
            const o = new THREE.Mesh(BOX, glowMat(pick(i), 1));
            orbs.push(o); group.add(o);
        }
        tick((t, dt, speed) => {
            outer.rotation.y = t * 0.25 * speed;
            mid.rotation.y = Math.PI / 4 - t * 0.5 * speed;
            inner.rotation.y = t * 0.9 * speed;
            runes.rotation.y = t * 0.25 * speed;
            orbs.forEach((o, i) => {
                const k = ((t * 0.35 + i / 4) % 1);
                const a = k * Math.PI * 3 + (i * Math.PI) / 2;
                const r = 2.4 * (1 - k * 0.85);
                o.position.set(Math.cos(a) * r, 0.2 + k * 6, Math.sin(a) * r);
                o.scale.setScalar(0.28 * (1 - k * 0.6));
                o.rotation.set(t * 3, t * 2, 0);
                o.material.opacity = Math.min(1, (1 - k) * 2.5);
            });
        });
    },

    /* 김민제미나이 — 깜빡이는 데이터 벽 + 몸을 훑는 스캔선 + 8자로 도는 쌍둥이 큐브 */
    gemini({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, rand } = kit;
        const COLS = 11, ROWS = 9, n = COLS * ROWS;
        const wall = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.75), n);
        const m4 = new THREE.Matrix4(), col = new THREE.Color();
        const seeds = [];
        let i = 0;
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
            m4.makeScale(0.42, 0.42, 0.05);
            m4.setPosition((x - (COLS - 1) / 2) * 0.62, 0.6 + y * 0.66, -2.4);
            wall.setMatrixAt(i, m4);
            seeds.push({ sp: rand(0.6, 3), ph: rand(0, 6), c: rand() < 0.7 ? 0 : 1 });
            i++;
        }
        group.add(wall);
        const scan = new THREE.Mesh(BOX, glowMat(pick(0), 0.9));
        scan.scale.set(3.4, 0.04, 1.6);
        group.add(scan);
        const twinA = new THREE.Mesh(BOX, glowMat(pick(0), 1));
        const twinB = new THREE.Mesh(BOX, glowMat(pick(1), 1));
        twinA.scale.setScalar(0.32); twinB.scale.setScalar(0.32);
        group.add(twinA, twinB);
        tick((t, dt, speed) => {
            seeds.forEach((s, k) => {
                const on = Math.sin(t * s.sp + s.ph) > 0.35 ? 1 : 0.08;
                col.copy(pick(s.c)).multiplyScalar(on);
                wall.setColorAt(k, col);
            });
            wall.instanceColor.needsUpdate = true;
            scan.position.y = 0.2 + (Math.sin(t * 1.4) * 0.5 + 0.5) * 5.4;
            const a = t * 1.3 * speed;
            twinA.position.set(Math.sin(a) * 2.2, 3 + Math.sin(a * 2) * 0.8, Math.cos(a) * 1.4);
            twinB.position.set(-Math.sin(a) * 2.2, 3 - Math.sin(a * 2) * 0.8, -Math.cos(a) * 1.4);
            twinA.rotation.set(t * 2, t * 3, 0); twinB.rotation.set(-t * 2, t * 3, 0);
        });
    },

    /* 건숭이 — 근두운 블록 위에 떠서, 여의봉이 몸 주위를 휘돎 */
    monkeyKing({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, solidMat, glowMat, rand } = kit;
        const cloud = new THREE.Group();
        const puffs = [[0, 0, 0, 2.2, 0.55, 1.6], [-1.2, 0.05, 0.2, 1.3, 0.45, 1.2], [1.25, 0.02, -0.1, 1.4, 0.5, 1.3], [0.3, -0.12, 0.9, 1.4, 0.4, 0.9], [-0.4, -0.1, -0.9, 1.5, 0.42, 0.9], [2.0, -0.08, 0.4, 0.8, 0.32, 0.8], [-2.0, -0.1, -0.3, 0.8, 0.3, 0.7]];
        const cloudMat = solidMat(new THREE.Color('#fff4d6'), 0.35);
        for (const [x, y, z, w, h, d] of puffs) {
            const p = new THREE.Mesh(BOX, cloudMat);
            p.scale.set(w, h, d); p.position.set(x, y, z);
            cloud.add(p);
        }
        group.add(cloud);
        const staff = new THREE.Group();
        const rod = new THREE.Mesh(BOX, solidMat(pick(0), 1.2));
        rod.scale.set(5.6, 0.13, 0.13);
        const capL = new THREE.Mesh(BOX, solidMat(pick(1), 1.6)), capR = capL.clone();
        capL.scale.set(0.45, 0.22, 0.22); capR.scale.copy(capL.scale);
        capL.position.x = -2.9; capR.position.x = 2.9;
        staff.add(rod, capL, capR);
        group.add(staff);
        const trail = [];
        for (let i = 0; i < 14; i++) {
            const m = new THREE.Mesh(BOX, glowMat(new THREE.Color('#fff4d6'), 0.5));
            m.userData = { k: rand(0, 1), x: rand(-1.6, 1.6), z: rand(-0.8, 0.8) };
            trail.push(m); group.add(m);
        }
        stage.onClear(() => { dummy.root.position.y = 0; });
        tick((t, dt, speed) => {
            const lift = 1.15 + Math.sin(t * 1.4) * 0.15;
            dummy.root.position.y = lift;
            cloud.position.y = lift - 0.32;
            cloud.rotation.y = Math.sin(t * 0.5) * 0.15;
            staff.position.y = lift + 2.6;
            staff.rotation.set(Math.sin(t * 0.9) * 0.35, t * 2.6 * speed, Math.cos(t * 1.1) * 0.25);
            trail.forEach(m => {
                const d = m.userData;
                d.k += dt * 0.6; if (d.k > 1) d.k = 0;
                m.position.set(d.x + d.k * 0.5, lift - 0.5 - d.k * 1.2, d.z - d.k * 1.5);
                m.scale.setScalar(0.22 * (1 - d.k));
            });
        });
    },

    /* 두 개의 심장 박지성 — 가슴 큐브 심장 2개가 쿵쿵, 뛸 때마다 네모 충격파 */
    twoHearts({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, square } = kit;
        const hearts = [0, 1].map(i => {
            const h = new THREE.Mesh(BOX, glowMat(pick(i === 0 ? 1 : 0), 1));
            h.position.set(i === 0 ? -0.42 : 0.42, 3.25, 0.62);
            h.rotation.z = Math.PI / 4;
            group.add(h);
            return h;
        });
        const waves = Array.from({ length: 6 }, (_, i) => {
            const w = square(1, 0.05, glowMat(pick(i % 2 ? 0 : 1), 0.9));
            w.visible = false; w.userData = { k: 1 };
            group.add(w);
            return w;
        });
        let next = 0, wi = 0, beatN = 0;
        const pulse = [0, 0];
        tick((t, dt) => {
            if (t > next) {
                const which = beatN % 2;                 // 쿵(왼) - 쿵(오) 번갈아
                pulse[which] = 1;
                const w = waves[wi++ % waves.length];
                w.userData.k = 0; w.visible = true;
                w.position.set(which === 0 ? -0.4 : 0.4, 3.2, 0);
                next = t + (which === 0 ? 0.22 : 0.68);
                beatN++;
            }
            hearts.forEach((h, i) => {
                pulse[i] *= Math.pow(0.002, dt);
                h.scale.setScalar(0.42 + pulse[i] * 0.3);
            });
            waves.forEach(w => {
                if (!w.visible) return;
                w.userData.k += dt * 0.9;
                const k = w.userData.k;
                if (k >= 1) { w.visible = false; return; }
                w.scale.setScalar(0.6 + k * 7);
                w.children.forEach(c => { c.material.opacity = 0.9 * (1 - k); });
            });
        });
    },

    /* 초월자 김건우 — 공중부양 + 등 뒤 거대한 세로 네모 후광 + 내려오는 빛줄기 */
    transcend({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, square, rand } = kit;
        const halo = new THREE.Group();
        const big = square(5.6, 0.09, glowMat(pick(0), 1));
        const inner = square(3.6, 0.07, glowMat(pick(1), 0.9)); inner.rotation.y = Math.PI / 4;
        halo.add(big, inner);
        for (let i = 0; i < 16; i++) {
            const s = new THREE.Mesh(BOX, glowMat(pick(i % 3), 0.55));
            const a = (i / 16) * Math.PI * 2;
            s.scale.set(0.04, 0.04, 1.3);
            s.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
            s.rotation.y = -a + Math.PI / 2;
            halo.add(s);
        }
        halo.rotation.x = Math.PI / 2;      // 세워서 화면을 향하게
        halo.position.set(0, 4.2, -1.6);
        group.add(halo);
        const rays = Array.from({ length: 7 }, () => {
            const r = new THREE.Mesh(BOX, glowMat(pick(0), 0.6));
            r.userData = { k: rand(0, 1), x: rand(-3.5, 3.5), z: rand(-2.5, 1.5), sp: rand(0.35, 0.6), noFit: true };
            group.add(r); return r;
        });
        stage.onClear(() => { dummy.root.position.y = 0; });
        tick((t, dt) => {
            const lift = 0.85 + Math.sin(t * 1.1) * 0.12;
            dummy.root.position.y = lift;
            halo.rotation.z = t * 0.15;
            inner.rotation.y = Math.PI / 4 - t * 0.4;
            halo.position.y = 4.2 + lift;
            rays.forEach(r => {
                const d = r.userData;
                d.k += dt * d.sp;
                if (d.k > 1) { d.k = 0; d.x = rand(-3.5, 3.5); d.z = rand(-2.5, 1.5); }
                const len = 4;
                r.scale.set(0.05, len, 0.05);
                r.position.set(d.x, 14 - d.k * 16 + len / 2, d.z);
                r.material.opacity = 0.6 * Math.sin(d.k * Math.PI);
            });
        });
    },

    /* 빛의 기사 김가은 : 성검의 소유자 — 등 뒤 땅에 꽂힌 거대한 성검 + 머리 위를 도는 작은 검들 */
    holySword({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, sword, rand } = kit;
        const big = sword(5.6, pick(0), pick(2), 1.3);
        big.position.set(2.25, -0.7, -0.6);   // 기사 옆, 칼끝이 바닥에 꽂힘
        big.rotation.z = -0.07;
        group.add(big);
        const ring = new THREE.Group();
        const smalls = [];
        for (let i = 0; i < 6; i++) {
            const s = sword(1.5, pick(1), pick(0), 0.35);
            const a = (i / 6) * Math.PI * 2;
            s.position.set(Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7);
            s.userData.ph = a;
            ring.add(s); smalls.push(s);
        }
        ring.position.y = 6.1;
        group.add(ring);
        const motes = Array.from({ length: 16 }, () => {
            const m = new THREE.Mesh(BOX, glowMat(pick(0), 0.9));
            m.userData = { k: rand(0, 1), x: rand(-0.3, 0.3) };
            group.add(m); return m;
        });
        tick((t, dt) => {
            ring.rotation.y = t * 0.5;
            smalls.forEach(s => { s.position.y = Math.sin(t * 2 + s.userData.ph) * 0.15; });
            motes.forEach(m => {
                const d = m.userData;
                d.k += dt * 0.25; if (d.k > 1) d.k = 0;
                m.position.set(2.25 + d.x, -0.5 + d.k * 5.6, -0.6);
                m.scale.setScalar(0.12 * Math.sin(d.k * Math.PI));
            });
        });
    },

    /* 곤지암병은 — 깜빡이는 형광등, 바닥에서 솟는 유령 손, 붉은 눈 유령, 정전과 순간이동 */
    haunted({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, rand, ghost, TMP } = kit;
        stage.setSky('#010604');

        // 천장 형광등 3개 (하나는 흔들림)
        const tubes = [-2.4, 0.2, 2.6].map((x, i) => {
            const g = new THREE.Group();
            const housing = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1a1f1c, roughness: 0.8 }));
            housing.scale.set(2.2, 0.16, 0.42);
            const tube = new THREE.Mesh(BOX, glowMat(new THREE.Color('#dfffe9'), 1));
            tube.scale.set(2.0, 0.08, 0.14); tube.position.y = -0.12;
            const wire = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x222222 }));
            wire.scale.set(0.03, 1.4, 0.03); wire.position.y = 0.75;
            g.add(housing, tube, wire);
            g.position.set(x, 8.6 - i * 0.2, -0.5 - i * 0.6);
            g.userData = { tube, ph: rand(0, 6), noFit: true };
            group.add(g);
            return g;
        });
        const lamp = new THREE.PointLight(new THREE.Color('#bfffd8'), 9, 14, 1.4);
        lamp.userData.own = true;
        lamp.position.set(0, 7.5, 0.5);
        group.add(lamp);

        // 바닥에서 솟는 유령 손
        const handMat = new THREE.MeshStandardMaterial({ color: 0x9fe8bf, emissive: pick(0), emissiveIntensity: 0.35, transparent: true, opacity: 0.85, roughness: 0.6 });
        const hands = Array.from({ length: 6 }, (_, i) => {
            const h = new THREE.Group();
            const arm = new THREE.Mesh(BOX, handMat); arm.scale.set(0.34, 1.7, 0.34); arm.position.y = 0.85;
            const palm = new THREE.Mesh(BOX, handMat); palm.scale.set(0.42, 0.32, 0.2); palm.position.y = 1.85;
            h.add(arm, palm);
            const fingers = [];
            for (let f = 0; f < 4; f++) {
                const fp = new THREE.Group(); fp.position.set(-0.15 + f * 0.1, 2.0, 0);
                const fm = new THREE.Mesh(BOX, handMat); fm.scale.set(0.07, 0.42, 0.07); fm.position.y = 0.21;
                fp.add(fm); h.add(fp); fingers.push(fp);
            }
            const a = (i / 6) * Math.PI * 2 + 0.3, r = 1.5 + (i % 2) * 0.9;
            h.position.set(Math.cos(a) * r, -2.4, Math.sin(a) * r);
            h.rotation.y = -a + Math.PI / 2;
            h.rotation.z = Math.cos(a) * 0.25; h.rotation.x = -Math.sin(a) * 0.25;
            h.userData = { fingers, ph: i * 0.83 };
            group.add(h);
            return h;
        });

        // 붉은 눈 유령
        const ghosts = [0, 1, 2].map(i => {
            const g = ghost(pick(0), 0);
            for (const x of [-0.28, 0.28]) {
                const eye = new THREE.Mesh(BOX, glowMat(new THREE.Color('#ff1a2a'), 1));
                eye.scale.set(0.2, 0.09, 0.05); eye.position.set(x, 4.72, 0.62);
                g.add(eye);
            }
            g.userData = { k: rand(0, 1) + i * 0.5, x: 0, z: 0, noFit: true };
            group.add(g);
            return g;
        });
        const mist = [];
        for (let i = 0; i < 12; i++) {
            const m = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: pick(1), transparent: true, opacity: 0.22, depthWrite: false }));
            m.scale.set(rand(1.5, 3), 0.15, rand(1, 2));
            m.userData = { x: rand(-4, 4), z: rand(-3, 2), v: rand(0.2, 0.5), noFit: true };
            mist.push(m); group.add(m);
        }

        let blackout = 0, nextBlack = 4, glitch = 0, nextGlitch = 2, gx = 0;
        tick((t, dt) => {
            // 형광등 깜빡임
            tubes.forEach((g, i) => {
                const on = blackout > 0 ? 0 : (Math.sin(t * 13 + g.userData.ph) > -0.85 && Math.random() > 0.04 ? 1 : 0.05);
                g.userData.tube.material.opacity = on;
                if (i === 1) g.rotation.z = Math.sin(t * 1.3) * 0.18;
            });
            lamp.intensity = blackout > 0 ? 0 : (Math.random() < 0.06 ? 0.5 : 9);

            // 유령 손: 솟아서 움켜쥐고 가라앉음
            hands.forEach(h => {
                const k = ((t * 0.32 + h.userData.ph) % 2) / 2;   // 0~1
                const rise = k < 0.35 ? Math.sin((k / 0.35) * Math.PI / 2) : k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
                h.position.y = -2.4 + rise * 2.2;
                const grab = k > 0.35 && k < 0.7 ? 1 : 0;
                h.userData.fingers.forEach((f, n) => { f.rotation.x = grab * (1.1 + Math.sin(t * 20 + n) * 0.1); });
            });

            // 유령: 나타났다 사라짐, 캐릭터를 바라봄
            ghosts.forEach((g, i) => {
                const d = g.userData;
                d.k += dt * 0.42;
                if (d.k > 1.7) {
                    d.k = 0;
                    if (i === 0 && Math.random() < 0.4) { d.x = 0.9; d.z = -1.3; }   // 어깨 뒤에 바짝
                    else { const a = rand(0, Math.PI * 2), r = rand(2.8, 4.2); d.x = Math.cos(a) * r; d.z = Math.sin(a) * r - 1; }
                }
                const vis = d.k < 1 ? Math.sin(d.k * Math.PI) : 0;
                g.position.set(d.x, 0, d.z);
                g.rotation.y = Math.atan2(-d.x, -d.z);
                g.children.forEach((o, n) => { o.material.opacity = n < 6 ? vis * 0.33 : vis; });
            });
            mist.forEach(m => { const d = m.userData; d.x += d.v * dt; if (d.x > 5) d.x = -5; m.position.set(d.x, 0.15, d.z); });

            // 정전: 잠깐 완전히 어두워지고, 다시 켜지면 유령이 더 가까이
            if (t > nextBlack) { blackout = 0.22; nextBlack = t + rand(4, 7); stage.setSky('#000000'); }
            if (blackout > 0) { blackout -= dt; if (blackout <= 0) stage.setSky('#010604'); }
            // 순간이동 글리치
            if (t > nextGlitch) { glitch = 0.1; gx = rand(-0.7, 0.7); nextGlitch = t + rand(1.8, 3.8); }
            glitch -= dt;
            if (glitch > 0) dummy.root.position.x += gx;
        });
    },

    /* 강철검 공병은 : 강철검제 — 검 부채, 3.2초마다 일제사격, 허리 검 고리, 칼날 왕관 */
    steelEmperor({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, sword, square, rand, TMP } = kit;
        stage.setSky('#03060c');
        const up = new THREE.Vector3(0, 1, 0);
        const CENTER = new THREE.Vector3(0, 3.4, -1.4);
        const N = 13;
        const blades = [];
        for (let i = 0; i < N; i++) {
            const a = -Math.PI * 0.45 + (i / (N - 1)) * Math.PI * 0.9;   // 위쪽 반원
            const out = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
            const s = sword(3.2, null, pick(1), 0.36, true);
            group.add(s);
            blades.push({ s, out, home: CENTER.clone().addScaledVector(out, 4.4), target: new THREE.Vector3(), state: 0, k: 0, delay: 0 });
        }
        // 착지 충격 링
        const rings = blades.map(() => { const r = square(1, 0.05, glowMat(pick(0), 0)); r.userData.noFit = true; r.userData.k = 1; group.add(r); return r; });

        // 허리를 도는 검 고리
        const waist = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const holder = new THREE.Group();
            const s = sword(1.3, null, pick(1), 0.22, true);
            s.rotation.z = Math.PI / 2;   // 눕혀서 둘레 방향으로
            s.position.set(0, 0, 2.2);
            holder.add(s);
            holder.rotation.y = (i / 8) * Math.PI * 2;
            waist.add(holder);
        }
        group.add(waist);

        // 칼날 왕관 (칼끝이 위로)
        const crown = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const s = sword(0.7, null, pick(0), 0.16, true);
            s.rotation.x = Math.PI;   // 칼끝이 위
            const a = (i / 8) * Math.PI * 2;
            s.position.set(Math.cos(a) * 0.62, 1.15, Math.sin(a) * 0.62);
            crown.add(s);
        }
        group.add(crown);

        // 칼날 반사광
        const glints = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), 8);
        group.add(glints);

        const rim = new THREE.PointLight(pick(1), 10, 10, 1.5);
        rim.userData.own = true;
        rim.position.set(0, 4, -2.6);
        group.add(rim);

        let lastVolley = -1;
        const v = new THREE.Vector3();
        tick((t, dt, speed) => {
            const lift = dummy.root.position.y;
            // 3.2초마다 일제사격 (포즈의 휘두르는 순간과 맞춤)
            const vol = Math.floor((t + 0.1 - 0.15) / 3.2);
            if (vol !== lastVolley) {
                lastVolley = vol;
                blades.forEach((b, i) => {
                    b.state = 1; b.k = 0; b.delay = i * 0.035;
                    b.target.set(-4 + (i / (N - 1)) * 8 + rand(-0.3, 0.3), 0.05, rand(2.5, 4.5));
                });
            }
            blades.forEach((b, i) => {
                const home = TMP.v.copy(b.home); home.y += lift * 0.5;
                if (b.state === 0) {
                    const breathe = Math.sin(t * 1.6 - i * 0.35) * 0.25;
                    b.s.position.copy(home).addScaledVector(b.out, breathe);
                    b.s.quaternion.setFromUnitVectors(up, v.copy(b.out).negate());   // 칼끝이 바깥
                    b.s.rotateY(Math.sin(t * 0.8 + i) * 0.4);
                    return;
                }
                if (b.delay > 0) { b.delay -= dt; return; }
                b.k += dt;
                if (b.state === 1) {               // 날아감
                    const k = Math.min(1, b.k / 0.3);
                    b.s.position.lerpVectors(home, b.target, k * k);
                    b.s.quaternion.setFromUnitVectors(up, v.subVectors(home, b.target).normalize());
                    if (k >= 1) {
                        b.state = 2; b.k = 0;
                        const r = rings[i]; r.userData.k = 0; r.position.copy(b.target);
                    }
                } else if (b.state === 2) {        // 꽂혀 있음
                    if (b.k > 0.45) { b.state = 3; b.k = 0; }
                } else {                           // 돌아옴
                    const k = Math.min(1, b.k / 0.5);
                    const e = 1 - Math.pow(1 - k, 3);
                    b.s.position.lerpVectors(b.target, home, e);
                    b.s.quaternion.setFromUnitVectors(up, v.copy(b.out).negate());
                    if (k >= 1) b.state = 0;
                }
            });
            rings.forEach(r => {
                if (r.userData.k >= 1) { r.visible = false; return; }
                r.visible = true;
                r.userData.k = Math.min(1, r.userData.k + dt * 2);
                r.scale.setScalar(0.3 + r.userData.k * 2.4);
                r.children.forEach(c => { c.material.opacity = 1 - r.userData.k; });
            });
            waist.position.y = 2.4 + lift;
            waist.rotation.y = t * 2.2 * speed;
            crown.position.y = 4.62 + lift;
            crown.rotation.y = t * 0.9;
            for (let g = 0; g < 8; g++) {
                const b = blades[(g * 5 + Math.floor(t * 3)) % N];
                const on = Math.sin(t * 7 + g * 2) > 0.6;
                TMP.p.copy(b.s.position).addScaledVector(b.out, -1.4 - (g % 3) * 0.4);
                TMP.sc.setScalar(on ? 0.13 : 0.0001);
                TMP.q.setFromEuler(TMP.e.set(t * 4, t * 3, 0.78));
                glints.setMatrixAt(g, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            glints.instanceMatrix.needsUpdate = true;
        });
    },

    /* 공허왕 공허병은 — 등 뒤 거신 그림자, 망토, 공허의 문, 무너지는 바닥, 공허를 부르는 맥동 */
    voidKing({ group, tick, pick, kit, stage, dummy }) {
        const { THREE, BOX, glowMat, square, rand, bolt, TMP } = kit;
        stage.setSky('#0a0006');
        stage.setSkin({ color: '#16121c', eye: '#ff1a40', glowEyes: true, smile: false, emissive: 0.08 });

        // 등 뒤 거신 그림자 (캐릭터와 같은 모양, 2.6배)
        const colossus = new THREE.Group();
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050008, transparent: true, opacity: 0.92 });
        const cparts = {};
        for (const [k, w, h, d, x, y, py] of [['legL', 0.98, 2, 1, -0.5, 1, 1], ['legR', 0.98, 2, 1, 0.5, 1, 1], ['torso', 2, 2, 1, 0, 3, 0], ['armL', 1, 2, 1, -1.5, 3, 0.9], ['armR', 1, 2, 1, 1.5, 3, 0.9], ['head', 1.25, 1.2, 1.2, 0, 4.62, 0]]) {
            const pv = new THREE.Group(); pv.position.set(x, y + py, 0);
            const m = new THREE.Mesh(BOX, shadowMat); m.scale.set(w, h, d); m.position.y = -py;
            const e = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: pick(0), transparent: true, opacity: 0.35, toneMapped: false }));
            e.scale.copy(m.scale); e.position.copy(m.position);
            pv.add(m, e); colossus.add(pv); cparts[k] = pv;
        }
        const eyes = [-0.3, 0.3].map(x => {
            const e = new THREE.Mesh(BOX, glowMat(pick(0), 1));
            e.scale.set(0.3, 0.12, 0.05); e.position.set(x, 0.08, 0.62);
            cparts.head.add(e); return e;
        });
        colossus.scale.setScalar(2.6);
        colossus.position.set(0, -2.2, -7.5);
        colossus.userData.noFit = true;
        group.add(colossus);

        // 공허의 문 (검은 태양)
        const gate = new THREE.Group();
        const gatePlane = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        gatePlane.scale.set(4.6, 4.6, 0.05);
        const gOuter = square(5.0, 0.09, glowMat(pick(0), 1));
        const gInner = square(3.6, 0.07, glowMat(pick(1), 1));
        gOuter.rotation.x = gInner.rotation.x = Math.PI / 2;
        gate.add(gatePlane, gOuter, gInner);
        gate.position.set(0, 4.2, -2.6);
        group.add(gate);
        const gateBolts = [0, 1, 2].map(() => { const b = bolt(5, glowMat(pick(0), 1)); b.userData.noFit = true; group.add(b); return b; });

        // 망토 (어깨에서 늘어진 블록 5줄, 펄럭임) — 캐릭터 몸에 붙음
        const cape = new THREE.Group();
        cape.position.set(0, 3.95, -0.58);
        const capeMat = new THREE.MeshStandardMaterial({ color: 0x0a0008, emissive: pick(0), emissiveIntensity: 0.15, roughness: 0.5 });
        const strips = [];
        for (let i = 0; i < 5; i++) {
            const pv = new THREE.Group(); pv.position.x = -0.9 + i * 0.45;
            const m = new THREE.Mesh(BOX, capeMat); m.scale.set(0.46, 3.7, 0.06); m.position.y = -1.85;
            const edge = new THREE.Mesh(BOX, glowMat(pick(0), 0.8)); edge.scale.set(0.46, 0.06, 0.07); edge.position.y = -3.7;
            pv.add(m, edge); cape.add(pv); strips.push(pv);
        }
        dummy.root.add(cape);
        stage.onClear(() => { dummy.root.remove(cape); capeMat.dispose(); });

        // 검은 파편 날개
        const wings = [-1, 1].map(side => {
            const w = new THREE.Group();
            for (let k = 0; k < 7; k++) {
                const f = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x050008, emissive: pick(k % 2 ? 1 : 0), emissiveIntensity: 0.6, roughness: 0.4 }));
                const len = 3.0 - k * 0.3;
                f.scale.set(len, 0.26, 0.1);
                f.position.set(side * (len / 2 + 0.15), 0.9 - k * 0.38, -k * 0.04);
                f.rotation.z = side * (0.55 - k * 0.15);
                w.add(f);
            }
            group.add(w);
            return w;
        });
        // 큐브 왕관
        const crown = new THREE.Group();
        for (let k = 0; k < 6; k++) {
            const c = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 }));
            const e = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: pick(0), toneMapped: false }));
            const a = (k / 6) * Math.PI * 2;
            c.position.set(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85); e.position.copy(c.position);
            c.scale.setScalar(0.28); e.scale.setScalar(0.29);
            crown.add(c, e);
        }
        group.add(crown);

        // 무너져 공허로 떨어지는 바닥 타일
        const tileMat = new THREE.MeshStandardMaterial({ color: 0x14142a, roughness: 0.35, metalness: 0.5, emissive: pick(0), emissiveIntensity: 0.5 });
        const tiles = Array.from({ length: 10 }, () => {
            const m = new THREE.Mesh(BOX, tileMat);
            m.userData = { k: rand(0, 1), x: 0, z: 0, sp: rand(0.25, 0.45), noFit: true };
            group.add(m); return m;
        });
        const resetTile = d => { d.x = Math.round(rand(-3, 3)) * 1.02; d.z = Math.round(rand(-3, 3)) * 1.02; d.k = 0; };
        tiles.forEach(m => resetTile(m.userData));
        const pit = square(7.4, 0.08, glowMat(pick(0), 0.8));
        pit.position.y = -0.3; pit.userData.noFit = true;
        group.add(pit);

        // 크게 궤도를 도는 잔해
        const DEB = 26;
        const debris = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 }), DEB);
        const debrisGlow = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.9), DEB);
        debris.userData.noFit = debrisGlow.userData.noFit = true;
        const debData = Array.from({ length: DEB }, () => ({ r: rand(4.5, 7), y: rand(0.5, 8), a: rand(0, 6.28), s: rand(0.15, 0.45), sp: rand(0.1, 0.25) }));
        group.add(debris, debrisGlow);

        const glow = new THREE.PointLight(pick(0), 10, 12, 1.4);
        glow.userData.own = true;
        glow.position.set(0, 7, 0);
        group.add(glow);

        let gateNext = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const call = (t % 5) / 2.2 < 1 ? Math.sin(((t % 5) / 2.2) * Math.PI) : 0;   // 포즈와 같은 5초 맥동

            // 거신: 팔을 같이 펼치고, 공허를 부를 때 눈이 타오름
            const open = 0.7 + call * 1.0;
            cparts.armL.rotation.set(-0.2 - call * 0.3, 0, -open);
            cparts.armR.rotation.set(-0.2 - call * 0.3, 0, open);
            cparts.head.rotation.x = 0.35 - call * 0.15;
            colossus.position.y = -2.2 + Math.sin(t * 0.6) * 0.15;
            eyes.forEach(e => { e.scale.set(0.3 + call * 0.25, 0.12 + call * 0.08, 0.05); });
            stage.setSky(call > 0.85 ? '#2a0008' : '#0a0006');
            glow.intensity = 10 + call * 25;

            gOuter.rotation.y = t * 0.6; gInner.rotation.y = -t * 1.1;
            gatePlane.rotation.z = t * 0.2;
            gate.scale.setScalar(1 + call * 0.25);
            gate.position.y = 4.2 + lift * 0.6;

            strips.forEach((pv, i) => { pv.rotation.x = 0.18 + Math.sin(t * 2.2 + i * 0.7) * 0.12 + call * 0.25; });
            const flap = Math.sin(t * 1.8) * 0.25 + call * 0.3;
            wings[0].rotation.y = 0.4 + flap; wings[1].rotation.y = -0.4 - flap;
            wings.forEach((w, i) => w.position.set(i ? 0.7 : -0.7, 3.9 + lift, -0.8));
            crown.position.y = 6.0 + lift + Math.sin(t * 2) * 0.08;
            crown.rotation.y = t * 1.4;

            tiles.forEach(m => {
                const d = m.userData;
                d.k += dt * d.sp;
                if (d.k > 1) resetTile(d);
                const k = d.k;
                m.position.set(d.x, -0.09 - k * k * 9, d.z);
                m.rotation.set(k * 3, k * 2, k * 1.5);
                m.scale.set(0.96 * (1 - k * 0.4), 0.18, 0.96 * (1 - k * 0.4));
            });
            pit.children.forEach(c => { c.material.opacity = 0.5 + call * 0.5; });

            debData.forEach((d, i) => {
                const a = d.a + t * d.sp;
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.7 + i) * 0.3, Math.sin(a) * d.r - 1);
                TMP.q.setFromEuler(TMP.e.set(t * 0.5 + i, t * 0.7, 0));
                TMP.sc.setScalar(d.s);
                debris.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                TMP.sc.setScalar(d.s * 1.08 * (i % 3 === 0 ? 1 : 0.0001));
                debrisGlow.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            debris.instanceMatrix.needsUpdate = true;
            debrisGlow.instanceMatrix.needsUpdate = true;

            if (t > gateNext) {
                gateNext = t + rand(0.06, 0.22);
                gateBolts.forEach(b => {
                    b.visible = Math.random() < 0.55 + call * 0.4;
                    const a = rand(0, Math.PI * 2), a2 = a + rand(1, 2.5);
                    b.reshape([Math.cos(a) * 2.3, gate.position.y + Math.sin(a) * 2.3, -2.5], [Math.cos(a2) * 1.1, gate.position.y + Math.sin(a2) * 1.1, -2.5], 0.5);
                });
            }
        });
    },

    /* 번개의 좌 박지성 (제우스) — 최강 칭호
       떠서 번개를 들고 → 몸을 비틀어 힘을 모으면(번개가 커지고 불꽃이 손으로 모이고 하늘이 어두워짐)
       → 내던짐: 갈라지는 낙뢰 + 폭발 + 화면 흔들림.
       금빛 후광, 하늘을 도는 블록 독수리, 기둥 사이를 잇는 전기, 발밑 올림포스 구름 */
    thunderThrone({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, bolt, TMP } = kit;
        const SKY = '#03070e';
        stage.setSky(SKY);
        stage.setSkin({ color: '#d9e2ee', eye: '#7af7ff', glowEyes: true, smile: false, emissive: 0.04 });
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));

        // 흰 수염 + 금빛 월계관
        const beardMat = solidMat(new THREE.Color('#f4f7ff'), 0.25);
        for (const [w, h, d, x, y, z] of [[1.15, 0.5, 0.3, 0, -0.42, 0.55], [0.8, 0.45, 0.28, 0, -0.85, 0.52], [0.42, 0.35, 0.26, 0, -1.18, 0.48], [0.75, 0.12, 0.12, 0, -0.08, 0.64]]) {
            const b = new THREE.Mesh(BOX, beardMat); b.scale.set(w, h, d); b.position.set(x, y, z); attach(dummy.head, b);
        }
        const goldMat = solidMat(new THREE.Color('#ffd34d'), 0.9);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            if (Math.abs(Math.sin(a)) < 0.2 && Math.cos(a) > 0) continue;
            const leaf = new THREE.Mesh(BOX, goldMat);
            leaf.scale.set(0.24, 0.1, 0.12); leaf.position.set(Math.sin(a) * 0.72, 0.5, Math.cos(a) * 0.68); leaf.rotation.set(0.5, a, 0.4);
            attach(dummy.head, leaf);
        }
        // 등 뒤 금빛 후광 (머리에 붙어 따라다님)
        const halo = new THREE.Group();
        const hOuter = square(2.4, 0.07, glowMat(new THREE.Color('#ffd34d'), 1)); hOuter.rotation.x = Math.PI / 2;
        const hInner = square(1.7, 0.05, glowMat(pick(0), 1)); hInner.rotation.x = Math.PI / 2; hInner.rotation.y = Math.PI / 4;
        halo.add(hOuter, hInner);
        for (let i = 0; i < 12; i++) {
            const r = new THREE.Mesh(BOX, glowMat(new THREE.Color('#fff3b0'), 0.7));
            const a = (i / 12) * Math.PI * 2;
            r.scale.set(0.05, 0.9, 0.05); r.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0); r.rotation.z = a - Math.PI / 2;
            halo.add(r);
        }
        halo.position.set(0, 0.1, -0.85);
        attach(dummy.head, halo);

        // 손에 든 번개 (힘을 모을수록 커짐)
        const handBolt = new THREE.Group();
        const pts = [[0, 0], [0.25, -0.6], [-0.1, -0.75], [0.3, -1.5], [0.05, -1.6], [0.35, -2.5]];
        const hbMat = glowMat(new THREE.Color('#e8fdff'), 1);
        for (let i = 0; i < pts.length - 1; i++) {
            const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
            const seg = new THREE.Mesh(BOX, hbMat);
            seg.scale.set(0.16, Math.hypot(x2 - x1, y2 - y1) + 0.08, 0.16);
            seg.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
            seg.rotation.z = -Math.atan2(x2 - x1, -(y2 - y1));
            handBolt.add(seg);
        }
        const hbGlow = new THREE.Mesh(BOX, glowMat(pick(0), 0.15));
        hbGlow.scale.set(0.42, 2.6, 0.3); hbGlow.position.set(0.15, -1.25, 0);
        handBolt.add(hbGlow);
        handBolt.position.set(-0.1, -1.75, 0);
        attach(dummy.armR, handBolt);
        const tip = new THREE.Object3D(); tip.position.set(0.35, -2.5, 0); handBolt.add(tip);
        const hand = new THREE.Object3D(); hand.position.set(0, -1.9, 0); attach(dummy.armR, hand);

        // 대리석 기둥 2개 + 금테 대리석 왕좌
        const marble = new THREE.MeshStandardMaterial({ color: 0xe9ecf2, roughness: 0.45, metalness: 0.05 });
        const flute = new THREE.MeshStandardMaterial({ color: 0xbfc5d2, roughness: 0.5 });
        const colTops = [];
        for (const x of [-3.6, 3.6]) {
            const col = new THREE.Group();
            for (const [w, h, d, y, m] of [[1.5, 0.35, 1.5, 0.18, marble], [1.05, 6.4, 1.05, 3.55, marble], [1.6, 0.3, 1.6, 6.9, marble], [1.8, 0.28, 1.8, 7.2, goldMat]]) {
                const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.y = y; col.add(b);
            }
            for (const [fx, fz] of [[0.53, 0], [-0.53, 0], [0, 0.53], [0, -0.53]]) {
                const f = new THREE.Mesh(BOX, flute); f.scale.set(fx ? 0.06 : 0.3, 6.2, fz ? 0.06 : 0.3); f.position.set(fx, 3.55, fz); col.add(f);
            }
            col.position.set(x, 0, -1.6);
            group.add(col);
            colTops.push([x, 7.4, -1.6]);
        }
        const throne = new THREE.Group();
        const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#ffd34d'), toneMapped: false });
        for (const [x, y, z, w, h, d] of [[0, 4.4, -2.4, 3.2, 7, 0.5], [-2.0, 1.4, -1.6, 0.6, 1.4, 1.6], [2.0, 1.4, -1.6, 0.6, 1.4, 1.6], [0, 0.5, -1.8, 3.6, 1.0, 1.0], [0, 8.3, -2.4, 1.4, 0.8, 0.5]]) {
            const b = new THREE.Mesh(BOX, marble); b.scale.set(w, h, d); b.position.set(x, y, z);
            const e = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), edgeMat); e.scale.copy(b.scale); e.position.copy(b.position);
            throne.add(b, e);
        }
        group.add(throne);

        // 발밑 올림포스 구름 + 머리 위 먹구름
        const puffMat = new THREE.MeshStandardMaterial({ color: 0x8e98ab, roughness: 0.95 });
        const floorClouds = [];
        for (let k = 0; k < 14; k++) {
            const c = new THREE.Mesh(BOX, puffMat);
            const a = (k / 14) * Math.PI * 2, r = rand(1.8, 4.4);
            c.scale.set(rand(1.2, 2.2), rand(0.35, 0.7), rand(1, 1.8));
            c.position.set(Math.cos(a) * r, rand(0.1, 0.4), Math.sin(a) * r * 0.8 - 0.4);
            c.userData = { y: c.position.y, ph: rand(0, 6), noFit: true };
            group.add(c); floorClouds.push(c);
        }
        const cloud = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({ color: 0x1a1f33, roughness: 0.9, emissive: pick(0), emissiveIntensity: 0 });
        for (let k = 0; k < 16; k++) {
            const c = new THREE.Mesh(BOX, cloudMat);
            c.scale.set(rand(1.4, 2.8), rand(0.5, 1), rand(1.2, 2.4));
            c.position.set(rand(-4.4, 4.4), rand(-0.3, 0.4), rand(-3, 0.4));
            cloud.add(c);
        }
        cloud.position.y = 11.5; cloud.userData.noFit = true;
        group.add(cloud);

        // 블록 독수리 (하늘을 돎)
        const eagle = new THREE.Group();
        const brown = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.7 });
        const whiteM = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 });
        const yellowM = solidMat(new THREE.Color('#ffb800'), 0.4);
        const body = new THREE.Mesh(BOX, brown); body.scale.set(0.5, 0.45, 1.3);
        const ehead = new THREE.Mesh(BOX, whiteM); ehead.scale.set(0.42, 0.42, 0.45); ehead.position.set(0, 0.15, 0.8);
        const beak = new THREE.Mesh(BOX, yellowM); beak.scale.set(0.16, 0.14, 0.28); beak.position.set(0, 0.08, 1.12);
        const tail = new THREE.Mesh(BOX, whiteM); tail.scale.set(0.5, 0.08, 0.5); tail.position.set(0, 0, -0.85);
        eagle.add(body, ehead, beak, tail);
        const wingsE = [-1, 1].map(side => {
            const w = new THREE.Group();
            const a = new THREE.Mesh(BOX, brown); a.scale.set(1.3, 0.08, 0.7); a.position.x = side * 0.65;
            const b = new THREE.Mesh(BOX, brown); b.scale.set(1.1, 0.06, 0.5); b.position.x = side * 1.75;
            w.add(a, b); w.position.x = side * 0.22; eagle.add(w); return w;
        });
        eagle.userData.noFit = true;
        group.add(eagle);

        // 낙뢰 (본줄기 + 갈래 2개), 폭발 파편, 충격 링, 섬광, 그을린 타일
        const strikes = [bolt(10, glowMat(new THREE.Color('#ffffff'), 1)), bolt(6, glowMat(pick(0), 1)), bolt(6, glowMat(pick(1), 1))];
        const strikeGlow = bolt(10, glowMat(pick(0), 0.55));
        [...strikes, strikeGlow].forEach(b => { b.userData.noFit = true; group.add(b); });
        const ring = square(1, 0.08, glowMat(pick(0), 1)); ring.userData.noFit = true; group.add(ring);
        const ring2 = square(1, 0.05, glowMat(new THREE.Color('#ffd34d'), 1)); ring2.userData.noFit = true; group.add(ring2);
        const flash = new THREE.PointLight(pick(0), 0, 16, 1.2); flash.userData.own = true; group.add(flash);
        const scorch = Array.from({ length: 4 }, () => { const sc = new THREE.Mesh(BOX, glowMat(pick(0), 0)); sc.scale.set(0.96, 0.03, 0.96); sc.userData.noFit = true; group.add(sc); return sc; });
        const DEB = 18;
        const debris = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), DEB); debris.userData.noFit = true; group.add(debris);
        const debData = Array.from({ length: DEB }, () => ({ v: new THREE.Vector3() }));
        // 힘을 모을 때 손으로 빨려드는 불꽃
        const SP = 16;
        const sparks = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), SP); sparks.userData.noFit = true; group.add(sparks);
        const spData = Array.from({ length: SP }, () => ({ dir: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize(), d: rand(1, 3) }));
        // 몸·기둥에 튀는 전기, 멀리 떨어지는 번개
        const arcs = [0, 1, 2, 3].map(() => { const a = bolt(3, glowMat(pick(0), 1)); group.add(a); return a; });
        const colArc = bolt(7, glowMat(pick(0), 1)); colArc.userData.noFit = true; group.add(colArc);
        const farBolt = bolt(8, glowMat(new THREE.Color('#bdf6ff'), 0.8)); farBolt.userData.noFit = true; group.add(farBolt);
        const bodyPts = [[0, 4.8, 0.5], [-1.5, 2.3, 0.4], [0, 3, 0.55], [-0.5, 0.4, 0.5], [0.5, 0.4, 0.5], [1.5, 3.5, 0.4]];

        const CYCLE = 3.2, WIND_START = 1.2, THROW_AT = 2.0;
        let life = 0, debK = 1, scorchI = 0, cloudFlash = 0, arcNext = 0, farNext = 1, thrown = -1;
        const tipW = new THREE.Vector3(), handW = new THREE.Vector3(), hit = new THREE.Vector3();
        sig.windK = 0; sig.throwK = 0;
        tick((t, dt) => {
            const c = t % CYCLE, n = Math.floor(t / CYCLE);
            // 힘 모으기 → 던지기 → 회복
            sig.windK = c < WIND_START ? 0 : c < THROW_AT ? Math.sin(((c - WIND_START) / (THROW_AT - WIND_START)) * Math.PI / 2) : Math.max(0, 1 - (c - THROW_AT) / 0.15);
            sig.throwK = c < THROW_AT ? 0 : c < THROW_AT + 0.15 ? (c - THROW_AT) / 0.15 : Math.max(0, 1 - (c - THROW_AT - 0.15) / 0.7);
            const charging = sig.windK > 0 && sig.throwK === 0;

            // 손에 든 번개: 모을수록 커지고 밝아짐, 던지고 잠깐 사라짐
            handBolt.visible = !(c > THROW_AT + 0.05 && c < THROW_AT + 0.7);
            handBolt.scale.setScalar(1 + sig.windK * 0.7);
            hbGlow.material.opacity = 0.12 + sig.windK * 0.45 + Math.random() * 0.1;
            stage.setSky(charging ? (Math.random() < 0.06 ? '#06101a' : '#010205') : SKY);

            // 손으로 모이는 불꽃
            hand.getWorldPosition(handW); group.worldToLocal(handW);
            spData.forEach((sp, i) => {
                if (charging) { sp.d -= dt * 4; if (sp.d < 0.2) { sp.d = rand(1.5, 3); sp.dir.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize(); } }
                TMP.p.copy(sp.dir).multiplyScalar(sp.d).add(handW);
                TMP.q.setFromEuler(TMP.e.set(t * 6 + i, t * 4, 0));
                TMP.sc.setScalar(charging ? 0.12 : 0.0001);
                sparks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            sparks.instanceMatrix.needsUpdate = true;

            // 던지는 순간
            if (n !== thrown && c >= THROW_AT + 0.06) {
                thrown = n;
                tip.getWorldPosition(tipW); group.worldToLocal(tipW);
                hit.set(rand(-2.8, 2.8), 0, rand(1.6, 3.6));
                strikes[0].reshape([tipW.x, tipW.y, tipW.z], [hit.x, 0, hit.z], 0.8);
                strikeGlow.reshape([tipW.x, tipW.y, tipW.z], [hit.x, 0, hit.z], 0.8);
                strikeGlow.children.forEach(ch => { ch.scale.x = ch.scale.z = 0.4; });
                strikes[1].reshape([hit.x, 2.5, hit.z], [hit.x + rand(-2.5, 2.5), 0, hit.z + rand(-1, 1)], 0.6);
                strikes[2].reshape([hit.x, 3.5, hit.z], [hit.x + rand(-2.5, 2.5), 0, hit.z + rand(-1.5, 0.5)], 0.6);
                ring.position.set(hit.x, 0.08, hit.z); ring2.position.copy(ring.position);
                flash.position.set(hit.x, 1.5, hit.z);
                const sc = scorch[scorchI++ % scorch.length];
                sc.position.set(Math.round(hit.x / 1.02) * 1.02, 0.02, Math.round(hit.z / 1.02) * 1.02); sc.material.opacity = 1;
                debK = 0;
                debData.forEach(d => d.v.set(rand(-1, 1), rand(0.6, 1.6), rand(-1, 1)).normalize().multiplyScalar(rand(4, 8)));
                life = 1; cloudFlash = 1;
                stage.shake(0.45); stage.flash(0.5);
            }
            life = Math.max(0, life - dt * 2.6);
            strikes.forEach((b, i) => { b.visible = life > (i ? 0.62 : 0.45) && Math.random() > 0.12; });
            strikeGlow.visible = strikes[0].visible;
            ring.visible = ring2.visible = life > 0;
            ring.scale.setScalar(0.4 + (1 - life) * 5.5); ring2.scale.setScalar(0.3 + (1 - life) * 3.5);
            ring.children.forEach(ch => { ch.material.opacity = life; }); ring2.children.forEach(ch => { ch.material.opacity = life; });
            flash.intensity = life * 12;
            scorch.forEach(sc => { sc.material.opacity *= Math.pow(0.35, dt); });
            if (debK < 1) {
                debK = Math.min(1, debK + dt * 1.6);
                debData.forEach((d, i) => {
                    TMP.p.set(hit.x + d.v.x * debK, Math.max(0, d.v.y * debK * 1.2 - 6 * debK * debK), hit.z + d.v.z * debK);
                    TMP.q.setFromEuler(TMP.e.set(debK * 9 + i, debK * 7, 0));
                    TMP.sc.setScalar(0.16 * (1 - debK));
                    debris.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                });
                debris.instanceMatrix.needsUpdate = true;
            }
            debris.visible = debK < 1;

            // 하늘, 구름, 독수리
            cloudFlash = Math.max(cloudFlash * Math.pow(0.02, dt), charging ? 0.3 + Math.random() * 0.4 : 0);
            cloudMat.emissiveIntensity = cloudFlash * 2.2 + (Math.random() < 0.03 ? 1 : 0);
            cloud.rotation.y = t * 0.05;
            floorClouds.forEach(fc => { fc.position.y = fc.userData.y + Math.sin(t * 0.8 + fc.userData.ph) * 0.08; });
            const ea = t * 0.55;
            eagle.position.set(Math.cos(ea) * 4.8, 9 + Math.sin(t * 1.3) * 0.4, Math.sin(ea) * 3.2 - 1);
            eagle.rotation.set(0, -ea, Math.sin(t * 1.3) * 0.15 + 0.35);
            const flapE = Math.sin(t * 5) * 0.45;
            wingsE[0].rotation.z = flapE; wingsE[1].rotation.z = -flapE;
            edgeMat.color.setRGB(1, 0.83 + Math.random() * 0.17, 0.3);
            halo.rotation.z = t * 0.4; hInner.rotation.y = Math.PI / 4 - t * 1.2;

            // 전기: 몸, 기둥 사이, 먼 하늘
            if (t > arcNext) {
                arcNext = t + rand(0.04, 0.16);
                const lift = dummy.root.position.y;
                arcs.forEach(a => {
                    a.visible = Math.random() < 0.65 + sig.windK * 0.3;
                    const p = bodyPts[Math.floor(rand(0, bodyPts.length))], q = bodyPts[Math.floor(rand(0, bodyPts.length))];
                    a.reshape([p[0], p[1] + lift, p[2]], [q[0] + rand(-0.5, 0.5), q[1] + lift, q[2]], 0.4);
                });
                colArc.visible = Math.random() < 0.35 + sig.windK * 0.5;
                if (colArc.visible) colArc.reshape(colTops[0], colTops[1], 0.6);
            }
            if (t > farNext) {
                farNext = t + rand(0.4, 1.2);
                const a = rand(0, Math.PI * 2);
                farBolt.reshape([Math.cos(a) * 14, 18, Math.sin(a) * 6 - 10], [Math.cos(a) * 14 + rand(-2, 2), 0, Math.sin(a) * 6 - 10], 1.4);
                farBolt.userData.life = 0.12;
            }
            farBolt.userData.life = (farBolt.userData.life || 0) - dt;
            farBolt.visible = farBolt.userData.life > 0;
        });
    },

    /* ================= 새 칭호 ================= */

    /* 김티비디오 — 지지직거리는 블록 TV들이 둥둥 */
    tvStatic({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, rand } = kit;
        const cv = document.createElement('canvas'); cv.width = 32; cv.height = 24;
        const g2 = cv.getContext('2d');
        const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter;
        const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        const caseMat = new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.6 });
        const tvs = [0, 1, 2, 3].map(i => {
            const tv = new THREE.Group();
            const body = new THREE.Mesh(BOX, caseMat); body.scale.set(1, 0.8, 0.7);
            const scr = new THREE.Mesh(BOX, screenMat); scr.scale.set(0.78, 0.58, 0.02); scr.position.z = 0.36;
            const ant1 = new THREE.Mesh(BOX, caseMat); ant1.scale.set(0.03, 0.6, 0.03); ant1.position.set(-0.15, 0.65, 0); ant1.rotation.z = 0.4;
            const ant2 = ant1.clone(); ant2.position.x = 0.15; ant2.rotation.z = -0.4;
            tv.add(body, scr, ant1, ant2);
            tv.userData = { a: (i / 4) * Math.PI * 2, y: rand(2.5, 5.5) };
            group.add(tv); return tv;
        });
        let next = 0, mode = 0;
        const img = g2.createImageData(32, 24);
        tick(t => {
            if (t > next) {
                next = t + 0.08;
                if (Math.random() < 0.03) mode = 1 - mode;
                for (let i = 0; i < 32 * 24; i++) {
                    let r, gg, b;
                    if (mode) { const bar = Math.floor((i % 32) / 4.6); [r, gg, b] = [[255,255,255],[255,255,0],[0,255,255],[0,255,0],[255,0,255],[255,0,0],[0,0,255]][bar]; }
                    else { r = gg = b = Math.random() * 255; }
                    img.data.set([r, gg, b, 255], i * 4);
                }
                g2.putImageData(img, 0, 0);
                tex.needsUpdate = true;
            }
            tvs.forEach((tv, i) => {
                const a = tv.userData.a + t * 0.4;
                tv.position.set(Math.cos(a) * 2.4, tv.userData.y + Math.sin(t * 1.5 + i) * 0.2, Math.sin(a) * 1.6 - 0.3);
                tv.rotation.set(Math.sin(t + i) * 0.15, Math.atan2(-tv.position.x, 6 - tv.position.z), Math.sin(t * 0.8 + i) * 0.2);
            });
        });
    },

    /* 김민채소로날유혹해 — 옆에 블록 소 + 하트 큐브 */
    cowCharm({ group, tick, pick, kit, sig }) {
        const { THREE, BOX, glowMat, rand } = kit;
        const cow = new THREE.Group();
        const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.7 });
        const black = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.7 });
        const pink = new THREE.MeshStandardMaterial({ color: 0xffa8c6, roughness: 0.6 });
        const add = (m, w, h, d, x, y, z, parent = cow) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); parent.add(b); return b; };
        add(white, 2.4, 1.3, 1.2, 0, 1.75, 0);
        add(black, 0.7, 0.6, 1.22, -0.4, 2.0, 0); add(black, 0.5, 0.5, 1.22, 0.6, 1.5, 0); add(black, 0.4, 0.4, 1.22, -0.9, 1.4, 0);
        for (const [x, z] of [[-0.85, 0.4], [0.85, 0.4], [-0.85, -0.4], [0.85, -0.4]]) { add(white, 0.32, 1.2, 0.32, x, 0.6, z); add(black, 0.34, 0.2, 0.34, x, 0.1, z); }
        const head = new THREE.Group(); head.position.set(-1.45, 2.3, 0); cow.add(head);
        add(white, 0.9, 0.85, 0.85, 0, 0, 0, head);
        add(pink, 0.35, 0.45, 0.75, -0.55, -0.2, 0, head);
        add(black, 0.3, 0.15, 0.08, -0.15, 0.48, 0.32, head); add(black, 0.3, 0.15, 0.08, -0.15, 0.48, -0.32, head);
        add(white, 0.12, 0.3, 0.12, 0.1, 0.55, 0.4, head); add(white, 0.12, 0.3, 0.12, 0.1, 0.55, -0.4, head);
        add(black, 0.1, 0.12, 0.05, -0.47, 0.12, 0.25, head); add(black, 0.1, 0.12, 0.05, -0.47, 0.12, -0.25, head);
        const tail = add(white, 0.1, 0.9, 0.1, 1.25, 1.8, 0);
        cow.position.set(2.9, 0, 0.2);
        cow.rotation.y = 0.35;
        group.add(cow);
        // 픽셀 하트
        const heartCells = [[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]];
        const hearts = [0, 1, 2].map(i => {
            const h = new THREE.Group();
            const m = glowMat(pick(0), 1);
            heartCells.forEach(([x, y]) => { const c = new THREE.Mesh(BOX, m); c.scale.setScalar(0.12); c.position.set((x - 2) * 0.12, -y * 0.12, 0); h.add(c); });
            h.userData = { k: i / 3, x: 0 }; h.userData.noFit = true;
            group.add(h); return h;
        });
        tick((t, dt) => {
            head.rotation.z = Math.sin(t * 3) * 0.08;            // 우물우물
            head.rotation.y = 0.2 + Math.sin(t * 0.7) * 0.15;
            tail.rotation.x = Math.sin(t * 4) * 0.4;
            hearts.forEach((h, i) => {
                h.userData.k += dt * 0.35;
                if (h.userData.k > 1) { h.userData.k = 0; h.userData.x = rand(0.8, 2.2); }
                const k = h.userData.k;
                h.position.set(h.userData.x + Math.sin(k * 8 + i) * 0.2, 3.2 + k * 3, 0.6);
                h.scale.setScalar(Math.sin(k * Math.PI) * 1.4);
                h.rotation.y = Math.sin(t * 2 + i) * 0.4;
            });
        });
    },

    /* 꽁꽁병은 — 얼음 블록에 꽁꽁, 서리와 고드름 */
    frozen({ group, tick, pick, kit }) {
        const { THREE, BOX, glowMat, rand } = kit;
        const ice = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2, emissive: pick(0), emissiveIntensity: 0.15, depthWrite: false }));
        ice.scale.set(3.4, 5.9, 1.9); ice.position.y = 2.95;
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false }));
        edges.scale.copy(ice.scale); edges.position.copy(ice.position);
        group.add(ice, edges);
        // 얼음 금 (면 위의 하얀 선)
        for (let i = 0; i < 6; i++) {
            const c = new THREE.Mesh(BOX, glowMat(new THREE.Color('#ffffff'), 0.6));
            c.scale.set(rand(0.4, 1.2), 0.025, 0.02); c.position.set(rand(-1.4, 1.4), rand(0.5, 5.5), 0.96); c.rotation.z = rand(-1, 1);
            group.add(c);
        }
        // 바닥 얼음 결정
        for (let i = 0; i < 10; i++) {
            const c = new THREE.Mesh(BOX, glowMat(pick(i % 3), 0.55));
            const a = rand(0, Math.PI * 2), r = rand(1.9, 3.2);
            c.scale.set(0.25, rand(0.5, 1.4), 0.25); c.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
            c.rotation.set(rand(-0.4, 0.4), rand(0, 3), rand(-0.4, 0.4));
            group.add(c);
        }
        // 고드름 (얼음 블록 윗모서리)
        for (let i = 0; i < 7; i++) {
            const c = new THREE.Mesh(BOX, glowMat(new THREE.Color('#e6f9ff'), 0.7));
            const h = rand(0.25, 0.6); c.scale.set(0.12, h, 0.12); c.position.set(-1.5 + i * 0.5, 5.9 - h / 2 - 0.05, 0.95);
            group.add(c);
        }
        tick(t => { ice.material.emissiveIntensity = 0.12 + Math.sin(t * 2) * 0.05; });
    },

    /* 김건우족을보았다 — 미니 김건우 부족이 둘러싸고 의식 춤, 모닥불, 북 */
    gunwooTribe({ group, tick, pick, dummy, kit }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, mini } = kit;
        const tribe = Array.from({ length: 7 }, (_, i) => {
            const m = mini(0xb98a62, { paint: i % 2 ? '#ff9a3c' : '#c23b22', scale: 0.42 });
            const spear = new THREE.Group();
            const shaft = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x6b4423 })); shaft.scale.set(0.15, 4.5, 0.15); shaft.position.y = -1.6;
            const head = new THREE.Mesh(BOX, solidMat(new THREE.Color('#dddddd'), 0.2)); head.scale.set(0.3, 0.6, 0.12); head.position.y = 0.8; head.rotation.z = Math.PI / 4;
            spear.add(shaft, head); spear.position.y = -1.9; m.armR.add(spear);
            m.root.userData = { a: (i / 7) * Math.PI * 2 };
            group.add(m.root);
            return m;
        });
        // 모닥불 (뒤쪽)
        const fire = new THREE.Group();
        const log = new THREE.MeshStandardMaterial({ color: 0x4a2e17 });
        for (const r of [0.6, -0.6]) { const l = new THREE.Mesh(BOX, log); l.scale.set(1.6, 0.25, 0.25); l.rotation.y = r; l.position.y = 0.15; fire.add(l); }
        const flames = Array.from({ length: 10 }, (_, i) => { const f = new THREE.Mesh(BOX, glowMat(pick(i % 2), 0.9)); fire.add(f); f.userData.ph = rand(0, 6); return f; });
        fire.position.set(0, 0, -2.4);
        const fireLight = new THREE.PointLight(pick(0), 12, 9, 1.4); fireLight.userData.own = true; fireLight.position.set(0, 1.2, -2.4);
        group.add(fire, fireLight);
        // 북 2개 + 북소리 링
        const drumMat = new THREE.MeshStandardMaterial({ color: 0x7a4b25, roughness: 0.6 });
        const drums = [-2.7, 2.7].map(x => {
            const d = new THREE.Group();
            const b = new THREE.Mesh(BOX, drumMat); b.scale.set(0.9, 1.0, 0.9); b.position.y = 0.5;
            const top = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xe8d3a8 })); top.scale.set(0.92, 0.06, 0.92); top.position.y = 1.02;
            d.add(b, top); d.position.set(x, 0, -0.6); group.add(d);
            const r = square(1, 0.04, glowMat(pick(0), 1)); r.position.set(x, 1.05, -0.6); r.userData.noFit = true; group.add(r);
            return { d, r };
        });
        tick((t, dt) => {
            const beat = (t % 0.5) / 0.5;
            tribe.forEach((m, i) => {
                const a = m.root.userData.a + t * 0.45;
                m.root.position.set(Math.cos(a) * 3.0, Math.abs(Math.sin(t * 6.28 + i)) * 0.25, Math.sin(a) * 2.2 - 0.3);
                m.root.rotation.y = -a - Math.PI / 2 + Math.sin(t * 3 + i) * 0.3;
                const up = Math.sin(t * 6.28 + i) * 0.5 + 0.5;
                m.armL.rotation.z = -0.4 - up * 2.2; m.armR.rotation.z = 0.5 + (1 - up) * 1.6;
                m.legL.rotation.x = Math.sin(t * 12.56 + i) * 0.5; m.legR.rotation.x = -Math.sin(t * 12.56 + i) * 0.5;
            });
            flames.forEach((f, i) => {
                const k = ((t * 1.4 + f.userData.ph) % 1);
                f.scale.setScalar(0.45 * (1 - k)); f.position.set(Math.sin(f.userData.ph + t * 3) * 0.3, 0.3 + k * 1.6, Math.cos(f.userData.ph) * 0.25);
                f.rotation.set(t * 3 + i, t * 2, 0);
            });
            fireLight.intensity = 10 + Math.random() * 6;
            drums.forEach(({ d, r }) => {
                d.scale.y = 1 - (beat < 0.15 ? (0.15 - beat) * 0.8 : 0);
                r.scale.setScalar(0.6 + beat * 2.5);
                r.children.forEach(c => { c.material.opacity = 1 - beat; });
            });
        });
    },

    /* 170KG OOO — 거대한 바벨을 들었다 내리찍음. 쾅 할 때 땅이 흔들림 */
    heavy170({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        // 몸집을 크게
        dummy.torso.scale.set(1.35, 1, 1.45);
        dummy.legL.scale.set(1.15, 1, 1.15); dummy.legR.scale.set(1.15, 1, 1.15);
        const bar = new THREE.Group();
        const steel = new THREE.MeshStandardMaterial({ color: 0xcfd3da, metalness: 0.8, roughness: 0.3 });
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.5 });
        const rod = new THREE.Mesh(BOX, steel); rod.scale.set(6.2, 0.14, 0.14); bar.add(rod);
        for (const side of [-1, 1]) {
            [[1.7, 1.7, 0.28], [1.45, 1.45, 0.26], [1.15, 1.15, 0.24]].forEach(([h, d, w], k) => {
                const p = new THREE.Mesh(BOX, plateMat); p.scale.set(w, h, d); p.position.x = side * (2.35 + k * 0.3); bar.add(p);
                const rimEdge = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: pick(0), toneMapped: false }));
                rimEdge.scale.copy(p.scale); rimEdge.position.copy(p.position); bar.add(rimEdge);
            });
            const collar = new THREE.Mesh(BOX, steel); collar.scale.set(0.2, 0.4, 0.4); collar.position.x = side * 2.05; bar.add(collar);
        }
        bar.position.z = 0.2;
        group.add(bar);
        const ring = square(1, 0.1, glowMat(pick(0), 1)); ring.userData.noFit = true; group.add(ring);
        const ring2 = square(1, 0.06, glowMat(pick(1), 1)); ring2.userData.noFit = true; group.add(ring2);
        const cracks = Array.from({ length: 8 }, () => { const c = new THREE.Mesh(BOX, glowMat(pick(0), 0)); c.userData.noFit = true; group.add(c); return c; });
        const DEB = 20;
        const debris = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2a2a3a }), DEB); debris.userData.noFit = true; group.add(debris);
        const debData = Array.from({ length: DEB }, () => ({ v: new THREE.Vector3(), x: 0 }));
        const CYCLE = 3.4;
        let slamN = -1, k = 1;
        sig.liftK = 1;
        tick((t, dt) => {
            const c = t % CYCLE, n = Math.floor(t / CYCLE);
            // 0~1.5 머리 위로 버팀, 1.5~1.8 떨어뜨림, 1.8~2.3 바닥, 2.3~3.4 다시 들어올림
            let y;
            if (c < 1.5) { sig.liftK = 1; y = 6.4 + Math.sin(t * 9) * 0.04; }
            else if (c < 1.8) { const q = (c - 1.5) / 0.3; sig.liftK = 1 - q * q; y = 6.4 - (6.4 - 0.85) * q * q; }
            else if (c < 2.3) { sig.liftK = 0; y = 0.85; }
            else { const q = (c - 2.3) / 1.1; const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; sig.liftK = e; y = 0.85 + (6.4 - 0.85) * e; }
            bar.position.y = y + (sig.liftK > 0.9 ? dummy.root.position.y : 0);
            bar.rotation.z = Math.sin(t * 2) * 0.03 * sig.liftK;
            if (n !== slamN && c >= 1.8) {
                slamN = n; k = 0;
                stage.shake(0.7); stage.flash(0.8);
                cracks.forEach(cr => {
                    const a = rand(0, Math.PI * 2), len = rand(1.2, 3.2);
                    cr.scale.set(len, 0.03, 0.08); cr.position.set(Math.cos(a) * (len / 2 + 0.6), 0.03, Math.sin(a) * (len / 2 + 0.6) + 0.2); cr.rotation.y = -a;
                    cr.material.opacity = 1;
                });
                debData.forEach(d => { d.v.set(rand(-1, 1), rand(0.8, 1.6), rand(-1, 1)).normalize().multiplyScalar(rand(3, 7)); d.x = rand(-3, 3); });
            }
            if (k < 1) {
                k = Math.min(1, k + dt * 1.4);
                ring.visible = ring2.visible = true;
                ring.position.set(0, 0.08, 0.2); ring2.position.copy(ring.position);
                ring.scale.setScalar(0.6 + k * 9); ring2.scale.setScalar(0.4 + k * 6);
                ring.children.forEach(c2 => { c2.material.opacity = 1 - k; }); ring2.children.forEach(c2 => { c2.material.opacity = 1 - k; });
                debData.forEach((d, i) => {
                    TMP.p.set(d.x * 0.6 + d.v.x * k, Math.max(0, d.v.y * k * 1.4 - 7 * k * k), 0.2 + d.v.z * k);
                    TMP.q.setFromEuler(TMP.e.set(k * 9 + i, k * 6, 0));
                    TMP.sc.setScalar(0.3 * (1 - k * 0.7));
                    debris.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                });
                debris.instanceMatrix.needsUpdate = true;
                debris.visible = true;
            } else { ring.visible = ring2.visible = debris.visible = false; }
            cracks.forEach(cr => { cr.material.opacity *= Math.pow(0.4, dt); });
        });
    },

    /* 절대여제 김가은 — 황금 단상, 거대한 왕관, 손에 든 홀, 망토, 엎드린 신하, 깃발 */
    empress({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, mini, TMP } = kit;
        const gold = solidMat(new THREE.Color('#ffd34d'), 0.6);
        const royal = new THREE.MeshStandardMaterial({ color: 0x4a1a7a, roughness: 0.5, emissive: pick(0), emissiveIntensity: 0.15 });
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        // 3단 단상
        [[5.2, 0.25, 4.2], [4.2, 0.25, 3.4], [3.2, 0.25, 2.6]].forEach(([w, h, d], i) => {
            const st = new THREE.Mesh(BOX, royal); st.scale.set(w, h, d); st.position.set(0, 0.12 + i * 0.25, -0.2); group.add(st);
            const trim = new THREE.Mesh(BOX, gold); trim.scale.set(w + 0.02, 0.05, d + 0.02); trim.position.set(0, 0.25 + i * 0.25, -0.2); group.add(trim);
        });
        // 거대한 왕관 (머리 위 높이)
        const crown = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            const side = new THREE.Mesh(BOX, gold); side.scale.set(2.6, 0.45, 0.12);
            const a = (i * Math.PI) / 2; side.position.set(Math.sin(a) * 1.25, 0, Math.cos(a) * 1.25); side.rotation.y = a; crown.add(side);
            for (const off of [-0.9, 0, 0.9]) {
                const sp = new THREE.Mesh(BOX, gold); sp.scale.set(0.22, off === 0 ? 0.9 : 0.6, 0.12);
                sp.position.set(Math.sin(a) * 1.25 + Math.cos(a) * off, off === 0 ? 0.6 : 0.45, Math.cos(a) * 1.25 - Math.sin(a) * off); sp.rotation.y = a; crown.add(sp);
                const gem = new THREE.Mesh(BOX, glowMat(pick(off === 0 ? 0 : 2), 1)); gem.scale.setScalar(0.18);
                gem.position.copy(sp.position); gem.position.y += off === 0 ? 0.5 : 0.35; gem.rotation.set(0.78, 0.78, 0); crown.add(gem);
            }
        }
        group.add(crown);
        // 손에 든 홀
        const scepter = new THREE.Group();
        const rod = new THREE.Mesh(BOX, gold); rod.scale.set(0.12, 2.6, 0.12); rod.position.y = -1.3;
        const orb = new THREE.Mesh(BOX, glowMat(pick(0), 1)); orb.scale.setScalar(0.38); orb.position.y = -2.75; orb.rotation.set(0.78, 0.78, 0);
        const wingL = new THREE.Mesh(BOX, gold); wingL.scale.set(0.5, 0.1, 0.08); wingL.position.set(-0.28, -2.45, 0); wingL.rotation.z = 0.5;
        const wingR = wingL.clone(); wingR.position.x = 0.28; wingR.rotation.z = -0.5;
        scepter.add(rod, orb, wingL, wingR);
        scepter.position.y = -1.6;
        attach(dummy.armR, scepter);
        // 망토 (보라 + 금테)
        const cape = new THREE.Group(); cape.position.set(0, 3.95, -0.58);
        const strips = [];
        for (let i = 0; i < 5; i++) {
            const pv = new THREE.Group(); pv.position.x = -0.9 + i * 0.45;
            const m = new THREE.Mesh(BOX, royal); m.scale.set(0.46, 4.2, 0.06); m.position.y = -2.1;
            const e = new THREE.Mesh(BOX, gold); e.scale.set(0.46, 0.12, 0.07); e.position.y = -4.2;
            pv.add(m, e); cape.add(pv); strips.push(pv);
        }
        attach(dummy.root, cape);
        // 엎드린 신하들
        const servants = Array.from({ length: 6 }, (_, i) => {
            const m = mini(0x2a2238, { scale: 0.4 });
            const side = i < 3 ? -1 : 1, k = i % 3;
            m.root.position.set(side * (2.6 + k * 0.4), 0, 1.0 - k * 1.1);
            m.root.rotation.y = side * -1.2;
            group.add(m.root);
            return m;
        });
        // 깃발 2개
        const banners = [-3.8, 3.8].map(x => {
            const pole = new THREE.Mesh(BOX, gold); pole.scale.set(0.12, 7.5, 0.12); pole.position.set(x, 3.75, -1.8); group.add(pole);
            const flag = new THREE.Group(); flag.position.set(x, 7.2, -1.8);
            const cloth = new THREE.Mesh(BOX, royal); cloth.scale.set(1.3, 3.2, 0.05); cloth.position.y = -1.6;
            const emblem = new THREE.Mesh(BOX, gold); emblem.scale.set(0.5, 0.5, 0.07); emblem.position.y = -1.3; emblem.rotation.z = Math.PI / 4;
            flag.add(cloth, emblem); group.add(flag); return flag;
        });
        // 금가루
        const DUST = 30;
        const dust = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffe7a0'), 1), DUST); dust.userData.noFit = true; group.add(dust);
        const dustD = Array.from({ length: DUST }, () => ({ x: rand(-4, 4), y: rand(0, 10), z: rand(-3, 2), v: rand(0.3, 0.8) }));
        const ring = square(1, 0.07, glowMat(new THREE.Color('#ffd34d'), 1)); ring.userData.noFit = true; group.add(ring);
        let slamN = -1, rk = 1;
        sig.slamK = 0;
        tick((t, dt) => {
            const c = t % 4.5, n = Math.floor(t / 4.5);
            sig.slamK = c > 3.6 && c < 4.2 ? Math.sin(((c - 3.6) / 0.6) * Math.PI) : 0;
            if (n !== slamN && c > 3.9) { slamN = n; rk = 0; stage.shake(0.25); stage.flash(0.7); }
            const lift = dummy.root.position.y;
            crown.position.y = 7.4 + lift + Math.sin(t * 1.2) * 0.15;
            crown.rotation.y = t * 0.35;
            strips.forEach((pv, i) => { pv.rotation.x = 0.15 + Math.sin(t * 1.8 + i * 0.6) * 0.1; });
            servants.forEach((m, i) => {
                const bow = 0.9 + Math.sin(t * 1.5 + i * 0.4) * 0.15 + (rk < 0.6 ? 0.3 : 0);
                // 무릎 꿇고 몸을 숙여 절함
                m.root.rotation.x = bow * 0.85;
                m.legL.rotation.x = m.legR.rotation.x = -1.5;
                m.armL.rotation.x = m.armR.rotation.x = -1.3;
                m.root.position.y = -0.3;
            });
            banners.forEach((b, i) => { b.rotation.y = Math.sin(t * 1.4 + i) * 0.25; });
            dustD.forEach((d, i) => {
                d.y -= d.v * dt; if (d.y < 0) d.y = 10;
                TMP.p.set(d.x + Math.sin(t + i) * 0.3, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t, 0));
                TMP.sc.setScalar(0.07);
                dust.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            dust.instanceMatrix.needsUpdate = true;
            if (rk < 1) {
                rk = Math.min(1, rk + dt * 1.2);
                ring.visible = true; ring.position.set(0, 0.85, -0.2); ring.scale.setScalar(0.5 + rk * 8);
                ring.children.forEach(cc => { cc.material.opacity = 1 - rk; });
            } else ring.visible = false;
        });
    },

    /* 흉악범 — 장미와 마술사 (괴도)
       실크햇·가면·망토·지팡이, 카드 폭풍, 피어나는 장미, 꽃잎 소용돌이,
       등 뒤 거대한 네모 장미, 인사 → 꽃잎 속으로 사라졌다가 옆에서 나타나는 마술 */
    phantomRose({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#0a0004');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const black = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.35, metalness: 0.2 });
        const crimson = new THREE.MeshStandardMaterial({ color: 0x8a0018, roughness: 0.4, emissive: pick(0), emissiveIntensity: 0.25 });
        const gold = solidMat(new THREE.Color('#ffd34d'), 0.6);

        // 실크햇 + 가면
        const hat = new THREE.Group();
        const brim = new THREE.Mesh(BOX, black); brim.scale.set(1.75, 0.08, 1.6);
        const top = new THREE.Mesh(BOX, black); top.scale.set(1.1, 1.0, 1.05); top.position.y = 0.52;
        const band = new THREE.Mesh(BOX, crimson); band.scale.set(1.12, 0.2, 1.07); band.position.y = 0.16;
        const rosePin = new THREE.Mesh(BOX, glowMat(pick(0), 1)); rosePin.scale.setScalar(0.22); rosePin.position.set(0.5, 0.2, 0.45); rosePin.rotation.set(0.78, 0.78, 0);
        hat.add(brim, top, band, rosePin);
        hat.position.set(0, 0.64, 0); hat.rotation.z = -0.12;
        attach(dummy.head, hat);
        const mask = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xf6f6f6, roughness: 0.3 }));
        mask.scale.set(0.62, 0.75, 0.05); mask.position.set(0.3, 0.05, 0.62);
        attach(dummy.head, mask);
        // 지팡이 (왼손)
        const cane = new THREE.Group();
        const shaft = new THREE.Mesh(BOX, black); shaft.scale.set(0.1, 2.6, 0.1); shaft.position.y = -1.0;
        const knob = new THREE.Mesh(BOX, gold); knob.scale.setScalar(0.24); knob.position.y = 0.3;
        cane.add(shaft, knob); cane.position.y = -1.9;
        attach(dummy.armL, cane);
        // 망토 (겉은 검정, 안은 진홍) + 높은 깃
        const cape = new THREE.Group(); cape.position.set(0, 4.0, -0.58);
        const strips = [];
        for (let i = 0; i < 6; i++) {
            const pv = new THREE.Group(); pv.position.x = -1.05 + i * 0.42;
            const outer = new THREE.Mesh(BOX, black); outer.scale.set(0.43, 4.1, 0.05); outer.position.set(0, -2.05, -0.03);
            const inner = new THREE.Mesh(BOX, crimson); inner.scale.set(0.43, 4.1, 0.03); inner.position.set(0, -2.05, 0.02);
            pv.add(outer, inner); cape.add(pv); strips.push(pv);
        }
        const collar = new THREE.Mesh(BOX, crimson); collar.scale.set(2.4, 0.9, 0.06); collar.position.set(0, 0.35, 0.05); collar.rotation.x = -0.35;
        cape.add(collar);
        attach(dummy.root, cape);

        // 등 뒤 거대한 네모 장미 (겹겹이 돌린 네모 = 꽃잎)
        const bigRose = new THREE.Group();
        for (let i = 0; i < 9; i++) {
            const sz = 4.6 - i * 0.48;
            const petal = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.98, 0.9, 0.12 + i * 0.045), emissive: pick(0), emissiveIntensity: 0.05 + i * 0.03, roughness: 0.5 }));
            petal.scale.set(sz, sz, 0.08); petal.position.z = i * 0.06; petal.rotation.z = i * 0.35;
            bigRose.add(petal);
        }
        const stemBig = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x0e3d1a })); stemBig.scale.set(0.25, 5, 0.1); stemBig.position.set(0, -4.6, -0.05);
        bigRose.add(stemBig);
        bigRose.position.set(0, 5.2, -3.2);
        group.add(bigRose);

        // 바닥에서 피는 장미들
        const roses = Array.from({ length: 8 }, (_, i) => {
            const r = new THREE.Group();
            const stem = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1d6b2e })); stem.scale.set(0.08, 1.2, 0.08); stem.position.y = 0.6;
            const leaf = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2a8a3e })); leaf.scale.set(0.35, 0.05, 0.18); leaf.position.set(0.15, 0.55, 0); leaf.rotation.z = 0.4;
            r.add(stem, leaf);
            for (let k = 0; k < 3; k++) {
                const b = new THREE.Mesh(BOX, glowMat(new THREE.Color().setHSL(0.98, 1, 0.35 + k * 0.08), 1));
                b.scale.setScalar(0.42 - k * 0.11); b.position.y = 1.3 + k * 0.05; b.rotation.set(0.6, k * 0.8, 0.6);
                r.add(b);
            }
            const a = (i / 8) * Math.PI * 2 + 0.2, rr = i % 2 ? 2.5 : 3.3;
            r.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr * 0.75);
            r.userData.ph = i * 0.7;
            group.add(r); return r;
        });

        // 카드 폭풍
        const CARDS = 36;
        const cardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.15 });
        const cards = new THREE.InstancedMesh(BOX, cardMat, CARDS);
        const suit = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), CARDS);
        for (let i = 0; i < CARDS; i++) suit.setColorAt(i, i % 2 ? new THREE.Color('#ff1744') : new THREE.Color('#111111'));
        cards.userData.noFit = suit.userData.noFit = true;
        group.add(cards, suit);
        const cardD = Array.from({ length: CARDS }, (_, i) => ({ a: rand(0, 6.28), y: rand(0.3, 7), r: rand(1.6, 3.6), sp: rand(0.8, 1.6) }));
        // 꽃잎 소용돌이
        const PET = 60;
        const petals = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.7), PET);
        for (let i = 0; i < PET; i++) petals.setColorAt(i, new THREE.Color().setHSL(0.97 + Math.random() * 0.03, 1, 0.3 + Math.random() * 0.25));
        petals.userData.noFit = true;
        group.add(petals);
        const petD = Array.from({ length: PET }, () => ({ a: rand(0, 6.28), y: rand(0, 7), r: rand(0.8, 3.2), v: rand(0.3, 0.9), burst: 0 }));
        const light = new THREE.PointLight(pick(0), 5, 9, 1.6); light.userData.own = true; light.position.set(0, 4, 2.5); group.add(light);

        // 마술: 인사 → 꽃잎 속으로 사라짐 → 옆에서 나타나 두 팔 활짝 → 제자리로
        const CYCLE = 6.4;
        let lastVanish = -1, burstK = 1, offX = 0;
        sig.bowK = 0; sig.revealK = 0;
        tick((t, dt, speed) => {
            const c = t % CYCLE, n = Math.floor(t / CYCLE);
            sig.bowK = c > 1.4 && c < 2.6 ? Math.sin(((c - 1.4) / 1.2) * Math.PI) : 0;
            const hidden = c > 2.6 && c < 3.05;
            if (n !== lastVanish && c > 2.6) {
                lastVanish = n; burstK = 0; offX = (n % 2 ? 1 : -1) * 1.3;
                stage.flash(0.6);
            }
            sig.revealK = c > 3.05 && c < 5.0 ? Math.min(1, (c - 3.05) / 0.3) * (c > 4.6 ? (5.0 - c) / 0.4 : 1) : 0;
            const slide = c > 3.05 && c < 6.0 ? (c < 5.0 ? 1 : 1 - (c - 5.0) / 1.0) : 0;
            dummy.root.visible = !hidden;
            dummy.root.position.x += offX * slide;
            burstK = Math.min(1, burstK + dt * 1.2);

            strips.forEach((pv, i) => { pv.rotation.x = 0.2 + Math.sin(t * 2 + i * 0.6) * 0.12 + sig.revealK * 0.5; pv.rotation.z = (i - 2.5) * 0.04 * sig.revealK; });
            bigRose.rotation.z = t * 0.12;
            bigRose.children.forEach((pt, i) => { if (i < 9) pt.rotation.z = i * 0.35 + Math.sin(t * 0.5 + i * 0.3) * 0.1; });
            roses.forEach((r, i) => {
                const bloom = 0.6 + 0.4 * Math.sin(t * 0.8 + r.userData.ph);
                r.scale.setScalar(0.9 + bloom * 0.35);
                r.rotation.y = Math.sin(t * 0.6 + i) * 0.3;
            });
            for (let i = 0; i < CARDS; i++) {
                const d = cardD[i];
                const a = d.a + t * d.sp * speed;
                const r = d.r + (burstK < 1 ? (1 - burstK) * 3 : 0);
                TMP.p.set(Math.cos(a) * r + offX * slide * 0.5, d.y + Math.sin(t + i) * 0.3, Math.sin(a) * r * 0.8 - 0.3);
                TMP.q.setFromEuler(TMP.e.set(Math.sin(t * 2 + i) * 0.6, -a + Math.PI / 2, t * 1.5 + i));
                TMP.sc.set(0.5, 0.72, 0.02);
                cards.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                TMP.sc.set(0.16, 0.16, 0.04);
                suit.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            cards.instanceMatrix.needsUpdate = true; suit.instanceMatrix.needsUpdate = true;
            for (let i = 0; i < PET; i++) {
                const d = petD[i];
                d.y += d.v * dt * 0.6; if (d.y > 8) d.y = 0;
                const a = d.a + t * 0.7;
                const r = d.r + (1 - burstK) * 4 * (i % 3 ? 1 : 0.4);
                TMP.p.set(Math.cos(a) * r + offX * slide * 0.3, d.y + (hidden ? 2 : 0), Math.sin(a) * r * 0.8);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t * 1.3, i));
                TMP.sc.set(0.22, 0.03, 0.18);
                petals.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            petals.instanceMatrix.needsUpdate = true;
            light.intensity = 4 + Math.sin(t * 2) * 1.5 + (1 - burstK) * 20;
        });
    },

    /* 폭풍의 김가은 — 몸을 감아 도는 두 줄기 바람, 휘말려 오르는 잎, 머리 위 먹구름과 번쩍임 */
    stormDancer({ group, tick, pick, dummy, kit }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        const N = 36;
        const wind = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.75), N * 2);
        group.add(wind);
        const LEAF = 22;
        const leaves = new THREE.InstancedMesh(BOX, solidMat(new THREE.Color('#5fe08a'), 0.5), LEAF);
        group.add(leaves);
        const leafD = Array.from({ length: LEAF }, () => ({ a: rand(0, 6.3), y: rand(0, 7), r: rand(1.6, 3), v: rand(0.8, 1.6) }));
        const cloud = new THREE.Group();
        const cMat = new THREE.MeshStandardMaterial({ color: 0x2a2f45, roughness: 0.9 });
        for (let i = 0; i < 9; i++) {
            const c = new THREE.Mesh(BOX, cMat);
            c.scale.set(rand(1.2, 2.2), rand(0.6, 1.0), rand(1.0, 1.8));
            c.position.set(rand(-2, 2), rand(-0.2, 0.3), rand(-1.2, 0.6));
            cloud.add(c);
        }
        const zap = new THREE.Mesh(BOX, glowMat(pick(1), 0)); zap.scale.set(4.5, 0.9, 2.5); cloud.add(zap);
        cloud.userData.noFit = true;
        group.add(cloud);
        tick((t, dt, speed) => {
            const lift = dummy.root.position.y;
            for (let s = 0; s < 2; s++) {
                for (let i = 0; i < N; i++) {
                    const k = i / N;
                    const a = k * Math.PI * 4 + t * 3.4 * speed + s * Math.PI;
                    const r = 1.7 + k * 1.1 + Math.sin(t * 2 + i) * 0.08;
                    TMP.p.set(Math.cos(a) * r, 0.2 + k * 6.2 + lift * 0.5, Math.sin(a) * r);
                    TMP.q.setFromEuler(TMP.e.set(0, -a, 0.35));
                    TMP.sc.set(0.05, 0.05, 0.55 + k * 0.4);
                    wind.setMatrixAt(s * N + i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
            }
            wind.instanceMatrix.needsUpdate = true;
            leafD.forEach((d, i) => {
                d.y += dt * d.v * speed; if (d.y > 7.5) d.y = 0;
                const a = d.a + t * 2.6 * speed;
                TMP.p.set(Math.cos(a) * d.r, d.y, Math.sin(a) * d.r);
                TMP.q.setFromEuler(TMP.e.set(t * 3 + i, t * 2, i));
                TMP.sc.set(0.2, 0.03, 0.14);
                leaves.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            leaves.instanceMatrix.needsUpdate = true;
            cloud.position.set(0, 8.2 + lift, -0.6);
            cloud.rotation.y = t * 0.15;
            const f = (t * 0.9) % 2.6;
            zap.material.opacity = f < 0.08 || (f > 0.16 && f < 0.22) ? 0.55 : 0;
        });
    },

    /* 심해의 공병은 — 잠수 헬멧, 올라오는 물방울, 흔들리는 해초, 위에서 내리는 빛줄기, 뒤에서 도는 거대 고래 */
    deepSea({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#020a1a');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        // 잠수 헬멧
        const brass = new THREE.MeshStandardMaterial({ color: 0xc8933a, metalness: 0.85, roughness: 0.3 });
        const helmet = new THREE.Group();
        const glass = new THREE.Mesh(BOX, glowMat(pick(1), 0.16)); glass.scale.set(1.7, 1.6, 1.6); helmet.add(glass);
        const collar = new THREE.Mesh(BOX, brass); collar.scale.set(1.8, 0.25, 1.7); collar.position.y = -0.82; helmet.add(collar);
        for (const [w, h, x, y] of [[1.0, 0.1, 0, 0.5], [1.0, 0.1, 0, -0.45], [0.1, 1.0, 0.5, 0], [0.1, 1.0, -0.5, 0]]) {
            const fr = new THREE.Mesh(BOX, brass); fr.scale.set(w, h, 0.08); fr.position.set(x, y, 0.82); helmet.add(fr);
        }
        const topV = new THREE.Mesh(BOX, brass); topV.scale.set(0.4, 0.25, 0.4); topV.position.y = 0.9; helmet.add(topV);
        attach(dummy.head, helmet);
        // 물방울
        const B = 46;
        const bubbles = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.55), B);
        const bD = Array.from({ length: B }, () => ({ x: rand(-4, 4), z: rand(-4, 2.5), y: rand(0, 10), v: rand(0.6, 1.6), s: rand(0.06, 0.2), ph: rand(0, 6) }));
        group.add(bubbles);
        // 해초
        const kelpMat = solidMat(new THREE.Color('#1f8a5a'), 0.25);
        const kelps = [];
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI * 0.9 + (i / 6) * Math.PI * 0.8 + rand(-0.1, 0.1);
            const r = rand(3.6, 5.2);
            let parent = new THREE.Group();
            parent.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 1);
            parent.userData.noFit = true;
            group.add(parent);
            const segs = [];
            for (let j = 0; j < 9; j++) {
                const seg = new THREE.Group();
                const m = new THREE.Mesh(BOX, kelpMat); m.scale.set(0.32, 0.8, 0.12); m.position.y = 0.4; seg.add(m);
                seg.position.y = j === 0 ? 0 : 0.8;
                parent.add(seg); parent = seg; segs.push(seg);
            }
            kelps.push({ segs, ph: rand(0, 6) });
        }
        // 빛줄기
        const rays = [];
        for (let i = 0; i < 5; i++) {
            const r = new THREE.Mesh(BOX, glowMat(pick(0), 0.04));
            r.scale.set(rand(0.4, 0.9), 16, 0.2);
            r.position.set(rand(-5, 5), 9, rand(-5, -1));
            r.rotation.z = rand(-0.25, 0.25);
            r.userData = { noFit: true, ph: rand(0, 6), x: r.position.x };
            group.add(r); rays.push(r);
        }
        // 고래
        const whale = new THREE.Group();
        const wMat = new THREE.MeshStandardMaterial({ color: 0x1d3a66, roughness: 0.6, emissive: pick(0), emissiveIntensity: 0.08 });
        const belly = new THREE.MeshStandardMaterial({ color: 0x9fb8d8, roughness: 0.7 });
        const body = new THREE.Mesh(BOX, wMat); body.scale.set(2.6, 2.2, 6); whale.add(body);
        const head = new THREE.Mesh(BOX, wMat); head.scale.set(2.4, 2.0, 2.0); head.position.set(0, 0.1, 3.6); whale.add(head);
        const bel = new THREE.Mesh(BOX, belly); bel.scale.set(2.2, 0.4, 7.6); bel.position.set(0, -1.05, 0.8); whale.add(bel);
        const eye = new THREE.Mesh(BOX, glowMat(pick(1), 1)); eye.scale.set(2.5, 0.18, 0.18); eye.position.set(0, 0.4, 3.9); whale.add(eye);
        const tail = new THREE.Group(); tail.position.z = -3;
        const stem = new THREE.Mesh(BOX, wMat); stem.scale.set(1.2, 1.0, 2.4); stem.position.z = -1.2; tail.add(stem);
        const fluke = new THREE.Mesh(BOX, wMat); fluke.scale.set(4.2, 0.25, 1.2); fluke.position.z = -2.6; tail.add(fluke);
        whale.add(tail);
        for (const s of [-1, 1]) { const fin = new THREE.Mesh(BOX, wMat); fin.scale.set(1.8, 0.2, 1.0); fin.position.set(s * 2.0, -0.6, 1.6); fin.rotation.z = s * -0.4; whale.add(fin); }
        whale.userData.noFit = true;
        whale.scale.setScalar(0.9);
        group.add(whale);
        sig.swimK = 0;
        tick((t, dt) => {
            bD.forEach((d, i) => {
                d.y += dt * d.v; if (d.y > 10) { d.y = 0; d.x = rand(-4, 4); }
                TMP.p.set(d.x + Math.sin(t * 2 + d.ph) * 0.2, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 0.7, 0));
                TMP.sc.setScalar(d.s);
                bubbles.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            bubbles.instanceMatrix.needsUpdate = true;
            kelps.forEach(k => k.segs.forEach((s, j) => { s.rotation.z = Math.sin(t * 1.1 + k.ph + j * 0.5) * 0.12; s.rotation.x = Math.sin(t * 0.8 + k.ph + j * 0.4) * 0.06; }));
            rays.forEach(r => { r.position.x = r.userData.x + Math.sin(t * 0.3 + r.userData.ph) * 0.8; r.material.opacity = 0.025 + 0.025 * Math.sin(t * 0.7 + r.userData.ph); });
            const a = t * 0.22;
            whale.position.set(Math.cos(a) * 10, 6.5 + Math.sin(t * 0.5) * 0.6, Math.sin(a) * 6 - 11);
            whale.rotation.y = -a + Math.PI;   // 진행 방향을 봄
            whale.rotation.z = Math.sin(t * 0.5) * 0.08;
            tail.rotation.x = Math.sin(t * 1.6) * 0.35;
            sig.swimK = Math.sin(t * 1.4);
        });
    },

    /* 멸종의 김민채 — 뒤에 서 있는 거대한 공룡 화석, 쏟아지는 유성, 재와 불씨, 바닥의 용암 균열 */
    extinction({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#160502');
        // 공룡 화석
        const bone = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.85, emissive: pick(0), emissiveIntensity: 0.06 });
        const fossil = new THREE.Group();
        const spine = [];
        for (let i = 0; i < 16; i++) {
            const k = i / 15;
            const v = new THREE.Mesh(BOX, bone);
            const x = -7 + k * 13, y = 6.2 + Math.sin(k * Math.PI * 0.9 + 0.3) * 1.6 - (k > 0.75 ? (k - 0.75) * 6 : 0);
            v.scale.set(0.55, 0.5, 0.5); v.position.set(x, y, 0); v.rotation.z = (i % 2) * 0.2;
            fossil.add(v); spine.push(v);
            if (i > 3 && i < 11) {
                for (const s of [-1, 1]) {
                    const rib = new THREE.Mesh(BOX, bone); rib.scale.set(0.16, 2.2 - Math.abs(i - 7) * 0.2, 0.16);
                    rib.position.set(x, y - 1.1, s * 0.6); rib.rotation.x = s * 0.35; fossil.add(rib);
                }
            }
        }
        // 머리뼈 + 턱
        const skull = new THREE.Group(); skull.position.set(6.6, 4.2, 0);
        const cran = new THREE.Mesh(BOX, bone); cran.scale.set(2.6, 1.3, 1.3); skull.add(cran);
        const socket = new THREE.Mesh(BOX, glowMat(pick(0), 1)); socket.scale.set(0.35, 0.35, 1.35); socket.position.set(-0.4, 0.25, 0); skull.add(socket);
        const jaw = new THREE.Group(); jaw.position.set(-1.0, -0.6, 0);
        const jm = new THREE.Mesh(BOX, bone); jm.scale.set(2.5, 0.4, 1.1); jm.position.x = 1.25; jaw.add(jm);
        for (let i = 0; i < 6; i++) { const tth = new THREE.Mesh(BOX, bone); tth.scale.set(0.12, 0.3, 0.12); tth.position.set(0.4 + i * 0.38, 0.3, 0.4); jaw.add(tth); const t2 = tth.clone(); t2.position.z = -0.4; jaw.add(t2); }
        skull.add(jaw);
        fossil.add(skull);
        // 다리뼈
        for (const [x, z] of [[-2.5, 0.5], [-2.0, -0.5], [2.6, 0.5], [3.1, -0.5]]) {
            const th = new THREE.Mesh(BOX, bone); th.scale.set(0.4, 3.0, 0.4); th.position.set(x, 3.3, z); th.rotation.z = 0.25; fossil.add(th);
            const sh = new THREE.Mesh(BOX, bone); sh.scale.set(0.32, 2.4, 0.32); sh.position.set(x + 0.2, 1.2, z); sh.rotation.z = -0.3; fossil.add(sh);
            const ft = new THREE.Mesh(BOX, bone); ft.scale.set(1.0, 0.25, 0.5); ft.position.set(x + 0.6, 0.12, z); fossil.add(ft);
        }
        fossil.position.set(-0.5, 0, -7.5);
        fossil.rotation.y = 0.12;
        fossil.userData.noFit = true;
        group.add(fossil);

        // 유성
        const M = 5;
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x3a1a0e, emissive: pick(0), emissiveIntensity: 0.9, roughness: 0.8 });
        const TRAIL = 10;
        const trail = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.85), M * TRAIL);
        trail.userData.noFit = true;
        group.add(trail);
        const rings = [];
        const meteors = Array.from({ length: M }, (_, i) => {
            const m = new THREE.Mesh(BOX, rockMat); m.userData.noFit = true; group.add(m);
            const r = square(1, 0.08, glowMat(pick(0), 0)); r.userData.noFit = true; r.visible = false; group.add(r); rings.push(r);
            return { m, r, from: new THREE.Vector3(), to: new THREE.Vector3(), k: 1, dur: 1, s: 1, wait: i * 0.9 + rand(0, 0.5), rk: 1, big: false };
        });
        function launch(me, big) {
            me.big = big;
            me.to.set(big ? rand(-2, 2) : rand(-7, 7), 0, big ? rand(-6, -4) : rand(-9, -2));
            me.from.set(me.to.x + rand(8, 13), rand(18, 24), me.to.z + rand(-3, 1));
            me.k = 0; me.dur = big ? 1.4 : rand(0.8, 1.2); me.s = big ? 1.3 : rand(0.35, 0.65);
        }
        // 재와 불씨
        const ASH = 60;
        const ash = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.7), ASH);
        const ashD = Array.from({ length: ASH }, () => ({ x: rand(-6, 6), y: rand(0, 11), z: rand(-6, 3), v: rand(0.3, 0.8), ph: rand(0, 6) }));
        group.add(ash);
        // 용암 균열
        const cracks = [];
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2 + rand(-0.2, 0.2), len = rand(1.4, 3.4);
            const c = new THREE.Mesh(BOX, glowMat(pick(0), 0.8));
            c.scale.set(len, 0.03, 0.1); c.position.set(Math.cos(a) * (len / 2 + 1.0), 0.03, Math.sin(a) * (len / 2 + 1.0)); c.rotation.y = -a;
            c.userData.noFit = true; c.userData.ph = rand(0, 6);
            group.add(c); cracks.push(c);
        }
        const glowL = new THREE.PointLight(pick(0), 6, 14, 1.5); glowL.userData.own = true; glowL.position.set(0, 1, 1.5); group.add(glowL);
        const BIG = 5.0;
        let bigN = -1;
        sig.callK = 0;
        tick((t, dt) => {
            // 5초마다 큰 유성 하나를 불러 내림 (포즈: 팔을 들었다가 내려찍음)
            const c = t % BIG, n = Math.floor(t / BIG);
            sig.callK = c < 1.2 ? Math.sin((c / 1.2) * Math.PI * 0.5) : c < 2.6 ? 1 - (c - 1.2) / 1.4 : 0;
            if (n !== bigN && c > 1.0) { bigN = n; launch(meteors[0], true); }
            meteors.forEach((me, i) => {
                if (me.k >= 1) {
                    if (i > 0) { me.wait -= dt; if (me.wait <= 0) { launch(me, false); me.wait = rand(0.6, 1.8); } }
                    me.m.visible = false;
                } else {
                    me.k = Math.min(1, me.k + dt / me.dur);
                    const e = me.k * me.k;
                    me.m.visible = true;
                    me.m.position.lerpVectors(me.from, me.to, e);
                    me.m.scale.setScalar(me.s);
                    me.m.rotation.set(t * 3 + i, t * 2, 0);
                    if (me.k >= 1) {
                        me.rk = 0; me.r.position.copy(me.to); me.r.position.y = 0.06;
                        if (me.big) { stage.shake(0.45); stage.flash(0.5); }
                    }
                }
                for (let j = 0; j < TRAIL; j++) {
                    const on = me.k < 1;
                    const q = Math.max(0, me.k * me.k - j * 0.025);
                    TMP.p.lerpVectors(me.from, me.to, q);
                    TMP.q.setFromEuler(TMP.e.set(t * 4 + j, t * 3, j));
                    TMP.sc.setScalar(on ? me.s * (1 - j / TRAIL) * 0.9 : 0.0001);
                    trail.setMatrixAt(i * TRAIL + j, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
                if (me.rk < 1) {
                    me.rk = Math.min(1, me.rk + dt * 1.5);
                    me.r.visible = true;
                    me.r.scale.setScalar((me.big ? 1.5 : 0.6) + me.rk * (me.big ? 9 : 3.5));
                    me.r.children.forEach(ch => { ch.material.opacity = 1 - me.rk; });
                } else me.r.visible = false;
            });
            trail.instanceMatrix.needsUpdate = true;
            ashD.forEach((d, i) => {
                d.y -= dt * d.v; if (d.y < 0) d.y = 11;
                TMP.p.set(d.x + Math.sin(t * 0.7 + d.ph) * 0.6, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 1.3, 0));
                TMP.sc.setScalar(i % 4 ? 0.05 : 0.09);
                ash.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            ash.instanceMatrix.needsUpdate = true;
            cracks.forEach(cr => { cr.material.opacity = 0.45 + 0.4 * Math.sin(t * 2 + cr.userData.ph); });
            jaw.rotation.z = -0.15 - Math.max(0, Math.sin(t * 0.8)) * 0.35;
            socket.material.opacity = 0.6 + 0.4 * Math.sin(t * 3);
            glowL.intensity = 5 + Math.sin(t * 2.3) * 1.5;
        });
    },

    /* 마지막 기관사 김건우 — 뒤에서 하늘로 감아 올라가는 나선 철로 위를 달리는 거대한 증기기관차,
       기관사 모자와 랜턴, 발밑 승강장, 6초마다 기적 소리와 함께 증기 폭발 */
    lastConductor({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#07050c');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const gold = solidMat(new THREE.Color('#ffcc55'), 0.45);
        const navy = new THREE.MeshStandardMaterial({ color: 0x1a2140, roughness: 0.5 });

        // 기관사 모자
        const cap = new THREE.Group();
        const crown = new THREE.Mesh(BOX, navy); crown.scale.set(1.36, 0.42, 1.36); crown.position.y = 0.8; cap.add(crown);
        const top = new THREE.Mesh(BOX, navy); top.scale.set(1.5, 0.12, 1.5); top.position.y = 1.04; cap.add(top);
        const band = new THREE.Mesh(BOX, gold); band.scale.set(1.38, 0.1, 1.38); band.position.y = 0.64; cap.add(band);
        const brim = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x0b0d16, roughness: 0.3 })); brim.scale.set(1.1, 0.07, 0.55); brim.position.set(0, 0.6, 0.85); cap.add(brim);
        const badge = new THREE.Mesh(BOX, glowMat(pick(0), 1)); badge.scale.set(0.24, 0.22, 0.06); badge.position.set(0, 0.85, 0.7); cap.add(badge);
        attach(dummy.head, cap);
        // 랜턴 (캐릭터 왼손)
        const lantern = new THREE.Group(); lantern.position.y = -2.0;
        const handle = new THREE.Mesh(BOX, gold); handle.scale.set(0.08, 0.35, 0.08); handle.position.y = -0.15; lantern.add(handle);
        const frameL = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.7, roughness: 0.3 })); frameL.scale.set(0.5, 0.1, 0.5); frameL.position.y = -0.35; lantern.add(frameL);
        const flame = new THREE.Mesh(BOX, glowMat(pick(0), 1)); flame.scale.set(0.36, 0.5, 0.36); flame.position.y = -0.65; lantern.add(flame);
        const base = frameL.clone(); base.position.y = -0.95; lantern.add(base);
        attach(dummy.armR, lantern);

        // 승강장
        const platform = new THREE.Group();
        const slab = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2b2a33, roughness: 0.8 })); slab.scale.set(6.5, 0.3, 3.4); slab.position.y = 0.15; platform.add(slab);
        const edge = new THREE.Mesh(BOX, glowMat(new THREE.Color('#ffd23f'), 0.9)); edge.scale.set(6.5, 0.04, 0.2); edge.position.set(0, 0.32, 1.55); platform.add(edge);
        for (const s of [-1, 1]) {
            const post = new THREE.Mesh(BOX, navy); post.scale.set(0.16, 4.2, 0.16); post.position.set(s * 2.9, 2.3, -1.2); platform.add(post);
            const arm = new THREE.Mesh(BOX, navy); arm.scale.set(0.7, 0.12, 0.12); arm.position.set(s * 2.65, 4.35, -1.2); platform.add(arm);
            const lamp = new THREE.Mesh(BOX, glowMat(pick(2), 1)); lamp.scale.set(0.34, 0.3, 0.34); lamp.position.set(s * 2.4, 4.15, -1.2); platform.add(lamp);
        }
        group.add(platform);

        // 나선 철로 (캐릭터 뒤에서 하늘로)
        const CX = 0, CZ = -15, R = 8, PITCH = 0.62, TURNS = 3.2, Y0 = 0.3;
        const L = Math.sqrt(R * R + PITCH * PITCH);
        const TOTAL = TURNS * Math.PI * 2 * L;
        const at = (s, out) => { const a = s / L - Math.PI / 2; return out.set(CX + Math.cos(a) * R, Y0 + (s / L) * PITCH, CZ + Math.sin(a) * R); };
        const track = new THREE.Group(); track.userData.noFit = true; group.add(track);
        const NT = Math.floor(TOTAL / 0.9);
        const ties = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 0.9 }), NT);
        const rails = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.85, roughness: 0.25, emissive: pick(0), emissiveIntensity: 0.12 }), NT * 2);
        const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), side = new THREE.Vector3(), fwd = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), m3 = new THREE.Matrix4();
        const frameAt = (s, pos, quat) => {
            at(s, pos); at(s + 0.3, p2);
            fwd.subVectors(p2, pos).normalize();
            side.crossVectors(Y, fwd).normalize();
            const up = TMP.v.crossVectors(fwd, side).normalize();
            m3.makeBasis(side, up, fwd);
            quat.setFromRotationMatrix(m3);
        };
        const q0 = new THREE.Quaternion();
        for (let i = 0; i < NT; i++) {
            const s = i * 0.9;
            frameAt(s, p1, q0);
            ties.setMatrixAt(i, TMP.m4.compose(p1, q0, TMP.sc.set(2.6, 0.18, 0.45)));
            for (const k of [0, 1]) {
                TMP.p.copy(p1).addScaledVector(side, k ? 0.85 : -0.85).addScaledVector(TMP.v.set(0, 1, 0), 0.16);
                rails.setMatrixAt(i * 2 + k, TMP.m4.compose(TMP.p, q0, TMP.sc.set(0.14, 0.16, 0.95)));
            }
        }
        track.add(ties, rails);
        // 받침 기둥 (첫 바퀴만, 바닥까지)
        const pierMat = new THREE.MeshStandardMaterial({ color: 0x25222c, roughness: 0.7 });
        for (let s = 6; s < TOTAL * 0.62; s += 7) {
            at(s, p1);
            const pier = new THREE.Mesh(BOX, pierMat); pier.scale.set(0.5, p1.y, 0.5); pier.position.set(p1.x, p1.y / 2 - 0.1, p1.z);
            track.add(pier);
        }
        // 위아래 차고 문 (열차가 여기서 나오고 들어감)
        const gate = s => {
            const g = new THREE.Group();
            frameAt(s, p1, q0); g.position.copy(p1); g.quaternion.copy(q0);
            for (const [w, h, x, y] of [[3.6, 0.25, 0, 3.7], [0.25, 3.8, 1.75, 1.9], [0.25, 3.8, -1.75, 1.9]]) {
                const b = new THREE.Mesh(BOX, glowMat(pick(0), 1)); b.scale.set(w, h, 0.25); b.position.set(x, y, 0); g.add(b);
            }
            const veil = new THREE.Mesh(BOX, glowMat(pick(2), 0.35)); veil.scale.set(3.3, 3.5, 0.05); veil.position.y = 1.85; g.add(veil);
            track.add(g);
            return g;
        };
        gate(0.2); const topGate = gate(TOTAL - 0.2);

        // 열차
        const loco = buildLocomotive(kit, pick);
        const cars = [{ g: loco.g, off: 0, len: 5.2 }];
        const tender = buildTender(kit); cars.push({ g: tender, off: 5.2 / 2 + 2.9 / 2 + 0.3, len: 2.9 });
        let off = cars[1].off + 2.9 / 2;
        for (let i = 0; i < 4; i++) {
            const c = buildCoach(kit, pick, i);
            off += 0.35 + 4.2 / 2;
            cars.push({ g: c.g, off, len: 4.2, wheels: c.wheels });
            off += 4.2 / 2;
        }
        const TRAIN = off + 1;
        const trainG = new THREE.Group(); trainG.userData.noFit = true; group.add(trainG);
        cars.forEach(c => trainG.add(c.g));
        // 증기
        const PUFF = 34;
        const puffs = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#aab0c0'), 0.2), PUFF);
        puffs.userData.noFit = true; group.add(puffs);
        const puffD = Array.from({ length: PUFF }, () => ({ p: new THREE.Vector3(0, -50, 0), v: new THREE.Vector3(), age: 9, life: 1.6 }));
        let puffI = 0, puffAcc = 0;
        const emit = (pos, n, big) => {
            for (let i = 0; i < n; i++) {
                const d = puffD[puffI++ % PUFF];
                d.p.copy(pos); d.v.set(rand(-0.6, 0.6), rand(1.6, 2.8) * (big ? 1.6 : 1), rand(-0.6, 0.6)); d.age = 0; d.life = big ? 2.4 : rand(1.2, 1.8);
            }
        };
        const chimneyW = new THREE.Vector3();
        const SPEED = 6.5;
        const WHISTLE = 6;
        let whistleN = -1;
        sig.whistleK = 0;
        tick((t, dt, speed) => {
            const head = (t * SPEED) % (TOTAL + TRAIN + 6) - 2;
            cars.forEach((c, i) => {
                const s = head - c.off;
                const vis = s > 0.6 && s < TOTAL - 0.6;
                c.g.visible = vis;
                if (!vis) return;
                frameAt(s, c.g.position, c.g.quaternion);
                c.g.position.addScaledVector(TMP.v.set(0, 1, 0), 0.25);
            });
            loco.wheels.forEach(w => { w.rotation.x = -t * SPEED / 0.6; });
            const ang = -t * SPEED / 0.6;
            loco.rods.forEach((r, k) => { r.position.y = r.userData.y + Math.sin(ang) * 0.3; r.position.z = r.userData.z + Math.cos(ang) * 0.3; });
            cars.forEach(c => c.wheels?.forEach(w => { w.rotation.x = ang * 1.4; }));
            // 증기
            puffAcc += dt;
            if (loco.g.visible && puffAcc > 0.08) {
                puffAcc = 0;
                loco.chimney.getWorldPosition(chimneyW);
                group.worldToLocal(chimneyW);
                emit(chimneyW, 1, false);
            }
            const c6 = t % WHISTLE, wn = Math.floor(t / WHISTLE);
            sig.whistleK = c6 < 1.6 ? Math.sin((c6 / 1.6) * Math.PI) : 0;
            if (wn !== whistleN && c6 > 0.3) {
                whistleN = wn;
                if (loco.g.visible) { loco.chimney.getWorldPosition(chimneyW); group.worldToLocal(chimneyW); emit(chimneyW, 10, true); }
                stage.shake(0.12);
            }
            puffD.forEach((d, i) => {
                d.age += dt;
                const k = d.age / d.life;
                if (k >= 1) { TMP.sc.setScalar(0.0001); TMP.p.set(0, -50, 0); }
                else {
                    d.p.addScaledVector(d.v, dt);
                    d.v.multiplyScalar(Math.pow(0.5, dt));
                    TMP.p.copy(d.p);
                    TMP.sc.setScalar(0.35 + k * 1.2);
                }
                TMP.q.setFromEuler(TMP.e.set(i, d.age, i * 0.5));
                puffs.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            puffs.instanceMatrix.needsUpdate = true;
            loco.headlight.material.opacity = 0.85 + Math.sin(t * 20) * 0.1;
            flame.scale.set(0.36, 0.5 + Math.sin(t * 13) * 0.05, 0.36);
            topGate.children[3].material.opacity = 0.3 + 0.15 * Math.sin(t * 3);
        });
    },

    /* 닌자 박지성 — 두건, 연기 속에서 나타났다 사라지는 그림자 분신, 몸 주위를 도는 표창 */
    ninja({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, rand, ghost, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const cloth = new THREE.MeshStandardMaterial({ color: 0x15121f, roughness: 0.8 });
        const hood = new THREE.Group();
        const add = (w, h, d, x, y, z, m = cloth) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); hood.add(b); return b; };
        add(1.36, 0.42, 1.36, 0, 0.45, 0);          // 머리 위
        add(1.36, 1.26, 0.14, 0, 0, -0.62);         // 뒤
        add(0.1, 1.26, 1.36, 0.66, 0, 0); add(0.1, 1.26, 1.36, -0.66, 0, 0);
        add(1.36, 0.5, 0.1, 0, -0.36, 0.63);        // 입 가리개
        const bandM = new THREE.MeshStandardMaterial({ color: 0x6a4dff, emissive: pick(0), emissiveIntensity: 0.4 });
        add(1.4, 0.12, 1.4, 0, 0.2, 0, bandM);
        const tails = [add(0.16, 0.08, 0.9, 0.15, 0.2, -1.1, bandM), add(0.16, 0.08, 0.8, -0.15, 0.15, -1.05, bandM)];
        attach(dummy.head, hood);
        // 분신 2개
        const clones = [ghost(pick(2).clone().lerp(pick(0), 0.4), 0.45), ghost(pick(2).clone().lerp(pick(0), 0.4), 0.45)];
        clones.forEach(c => { c.scale.setScalar(0.95); group.add(c); });
        const cloneSpots = [new THREE.Vector3(-2.6, 0, -1.2), new THREE.Vector3(2.6, 0, -1.2)];
        // 표창
        const stars = [];
        const steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd8, metalness: 0.9, roughness: 0.2 });
        for (let i = 0; i < 6; i++) {
            const s = new THREE.Group();
            for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(BOX, steel); b.scale.set(0.6, 0.12, 0.04); b.rotation.z = k * Math.PI / 2; s.add(b); }
            const core = new THREE.Mesh(BOX, glowMat(pick(0), 1)); core.scale.set(0.14, 0.14, 0.06); s.add(core);
            group.add(s); stars.push(s);
        }
        // 연기
        const SM = 30;
        const smoke = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#8a86a8'), 0.35), SM);
        smoke.userData.noFit = true; group.add(smoke);
        const smD = Array.from({ length: SM }, () => ({ p: new THREE.Vector3(0, -50, 0), v: new THREE.Vector3(), age: 9 }));
        let smI = 0;
        const puff = (pos, n) => { for (let i = 0; i < n; i++) { const d = smD[smI++ % SM]; d.p.copy(pos).add(TMP.v.set(rand(-0.6, 0.6), rand(0, 3.5), rand(-0.4, 0.4))); d.v.set(rand(-1, 1), rand(0.3, 1), rand(-1, 1)); d.age = 0; } };
        let lastJump = -1;
        sig.sealK = 0;
        tick((t, dt, speed) => {
            const n = Math.floor(t / 2.2);
            const c = t % 2.2;
            if (n !== lastJump) {
                lastJump = n;
                clones.forEach((cl, i) => {
                    puff(cl.position, 5);
                    cloneSpots[i].set((i ? 1 : -1) * rand(2.2, 3.2), 0, rand(-2, -0.4));
                    cl.position.copy(cloneSpots[i]);
                    cl.rotation.y = (i ? -1 : 1) * 0.4;
                    puff(cl.position, 5);
                });
            }
            clones.forEach((cl, i) => {
                const vis = c > 0.15 && c < 2.0;
                cl.visible = vis;
                cl.children.forEach(m => { m.material.opacity = 0.35 + Math.sin(t * 6 + i) * 0.1; });
                cl.position.y = Math.sin(t * 2 + i) * 0.08;
            });
            sig.sealK = c < 0.4 ? 1 - c / 0.4 : 0;
            stars.forEach((s, i) => {
                const a = t * 1.8 * speed + (i / stars.length) * Math.PI * 2;
                s.position.set(Math.cos(a) * 2.2, 2.6 + Math.sin(a * 2 + i) * 0.6 + dummy.root.position.y, Math.sin(a) * 2.2);
                s.rotation.set(Math.PI / 2 + Math.sin(t) * 0.3, 0, t * 14);
            });
            tails.forEach((tl, i) => { tl.rotation.x = Math.sin(t * 6 + i) * 0.2; tl.rotation.y = Math.sin(t * 4 + i) * 0.25; });
            smD.forEach((d, i) => {
                d.age += dt;
                const k = d.age / 1.1;
                if (k >= 1) { TMP.p.set(0, -50, 0); TMP.sc.setScalar(0.0001); }
                else { d.p.addScaledVector(d.v, dt); TMP.p.copy(d.p); TMP.sc.setScalar(0.3 + k * 0.9); }
                TMP.q.setFromEuler(TMP.e.set(i, d.age * 2, 0));
                smoke.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            smoke.instanceMatrix.needsUpdate = true;
        });
    },

    /* 해적선장 공병은 — 삼각모, 안대, 손에 든 커틀러스, 어깨 위 앵무새, 뒤에서 펄럭이는 해골 깃발, 도는 포탄과 금화 */
    pirate({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, sword, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const black = new THREE.MeshStandardMaterial({ color: 0x14121a, roughness: 0.6 });
        const gold = solidMat(new THREE.Color('#ffcc55'), 0.4);
        const bone = new THREE.MeshStandardMaterial({ color: 0xf2e6c9, roughness: 0.6 });
        const hat = new THREE.Group();
        const hb = (w, h, d, x, y, z, ry = 0, m = black) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); b.rotation.y = ry; hat.add(b); return b; };
        hb(1.3, 0.55, 1.3, 0, 0.9, 0);
        for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + Math.PI / 2; hb(1.9, 0.42, 0.16, Math.cos(a) * 0.62, 0.82, Math.sin(a) * 0.62, -a + Math.PI / 2).rotation.x = 0; }
        hb(1.95, 0.07, 0.18, 0, 1.05, 0.68, 0, gold);
        hb(0.32, 0.3, 0.06, 0, 0.92, 0.82, 0, bone);
        attach(dummy.head, hat);
        const patch = new THREE.Mesh(BOX, black); patch.scale.set(0.36, 0.3, 0.05); patch.position.set(0.3, 0.08, 0.62); attach(dummy.head, patch);
        const strap = new THREE.Mesh(BOX, black); strap.scale.set(1.3, 0.06, 1.28); strap.position.set(0, 0.2, 0); strap.rotation.z = -0.3; attach(dummy.head, strap);
        // 커틀러스 (캐릭터 오른손)
        const blade = kit.heldSword(2.4, null, new THREE.Color('#ffcc55'), 0.34, true);
        blade.rotation.x = 2.5; blade.position.set(0, -1.95, 0);   // 손잡이를 쥐고 칼끝은 앞쪽 위로
        attach(dummy.armL, blade);
        // 앵무새 (왼쪽 어깨)
        const bird = new THREE.Group();
        const red = solidMat(new THREE.Color('#e5322d'), 0.25), green = solidMat(new THREE.Color('#2fbf5a'), 0.25), yellow = solidMat(new THREE.Color('#ffd23f'), 0.4);
        const bb = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); bird.add(b); return b; };
        bb(red, 0.4, 0.55, 0.4, 0, 0.3, 0); bb(red, 0.36, 0.34, 0.36, 0, 0.72, 0.05); bb(yellow, 0.14, 0.14, 0.2, 0, 0.68, 0.3);
        const wingL = bb(green, 0.08, 0.4, 0.34, 0.24, 0.32, -0.02), wingR = bb(green, 0.08, 0.4, 0.34, -0.24, 0.32, -0.02);
        bb(red, 0.2, 0.08, 0.5, 0, 0.05, -0.3);
        bird.position.set(1.5, 4.0, 0);
        group.add(bird);
        // 해골 깃발
        const flag = new THREE.Group(); flag.position.set(-2.8, 0, -2.2); flag.userData.noFit = true;
        const pole = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x5a3a22 })); pole.scale.set(0.16, 8, 0.16); pole.position.y = 4; flag.add(pole);
        const cloths = [];
        for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(BOX, black); c.scale.set(0.5, 2.2, 0.05); c.position.set(0.33 + i * 0.5, 6.7, 0); flag.add(c); cloths.push(c); }
        const skull = new THREE.Mesh(BOX, bone); skull.scale.set(0.7, 0.6, 0.08); skull.position.set(1.6, 6.9, 0.04); flag.add(skull);
        for (const r of [0.6, -0.6]) { const x = new THREE.Mesh(BOX, bone); x.scale.set(1.4, 0.12, 0.08); x.position.set(1.6, 6.3, 0.04); x.rotation.z = r; flag.add(x); }
        group.add(flag);
        // 포탄 + 금화
        const balls = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1c1c22, metalness: 0.8, roughness: 0.3 }), 5);
        const coins = new THREE.InstancedMesh(BOX, glowMat(pick(0), 1), 16);
        group.add(balls, coins);
        tick((t, dt, speed) => {
            const lift = dummy.root.position.y;
            bird.position.set(1.5, 4.0 + lift + Math.abs(Math.sin(t * 3)) * 0.08, 0);
            bird.rotation.y = Math.sin(t * 0.8) * 0.5;
            const flap = Math.max(0, Math.sin(t * 14)) * (Math.sin(t * 0.7) > 0.6 ? 1 : 0.1);
            wingL.rotation.z = -flap * 0.9; wingR.rotation.z = flap * 0.9;
            cloths.forEach((c, i) => { c.position.z = Math.sin(t * 4 - i * 0.8) * 0.18 * (i / 5); c.rotation.y = Math.cos(t * 4 - i * 0.8) * 0.25; });
            for (let i = 0; i < 5; i++) {
                const a = t * 1.2 * speed + (i / 5) * Math.PI * 2;
                TMP.p.set(Math.cos(a) * 2.6, 1.4 + Math.sin(a * 2) * 0.4 + lift, Math.sin(a) * 2.6);
                TMP.q.setFromEuler(TMP.e.set(t, t, 0)); TMP.sc.setScalar(0.42);
                balls.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            for (let i = 0; i < 16; i++) {
                const k = ((t * 0.6 + i / 16) % 1);
                const a = i * 2.4;
                TMP.p.set(Math.cos(a) * (0.6 + k * 2.4), 1 + Math.sin(k * Math.PI) * 4, Math.sin(a) * (0.6 + k * 2.4));
                TMP.q.setFromEuler(TMP.e.set(t * 6 + i, t * 3, 0)); TMP.sc.set(0.26, 0.26, 0.05);
                coins.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            balls.instanceMatrix.needsUpdate = coins.instanceMatrix.needsUpdate = true;
        });
    },

    /* 황금손 김가은 — 금빛 두 손, 주위에 금으로 굳은 사람 조각상들, 쏟아지는 금화, 손끝에서 퍼지는 황금 바닥 */
    midas({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, mini, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const goldM = new THREE.MeshStandardMaterial({ color: 0xffcf40, metalness: 0.55, roughness: 0.3, emissive: 0x8a5a00, emissiveIntensity: 0.55 });
        for (const arm of [dummy.armL, dummy.armR]) {
            const h = new THREE.Mesh(BOX, goldM); h.scale.set(1.08, 0.75, 1.08); h.position.y = -1.55; attach(arm, h);
            const g2 = new THREE.Mesh(BOX, glowMat(pick(0), 0.5)); g2.scale.set(1.2, 0.2, 1.2); g2.position.y = -1.2; attach(arm, g2);
        }
        // 조각상
        const statues = [];
        const poses = [[-2.6, 0.6], [2.7, -0.4], [-3.6, -2.4], [3.4, -2.8], [0, -4.2]];
        poses.forEach(([x, z], i) => {
            const m = mini(0xffcf40, { scale: 0.5 });
            m.root.traverse(o => { if (o.isMesh) o.material = goldM; });
            m.root.position.set(x, 0, z);
            m.root.rotation.y = Math.atan2(-x, -z) + Math.PI;
            const pose = i % 3;
            if (pose === 0) { m.armL.rotation.z = -2.6; m.armR.rotation.z = 0.3; }
            else if (pose === 1) { m.armL.rotation.x = -1.4; m.armR.rotation.x = -1.4; m.head.rotation.x = -0.3; }
            else { m.armR.rotation.z = 1.4; m.legL.rotation.x = -0.5; m.root.rotation.x = 0.12; }
            m.root.userData.noFit = true;
            group.add(m.root); statues.push(m.root);
        });
        // 금화 비
        const C = 36;
        const coins = new THREE.InstancedMesh(BOX, goldM, C);
        const cD = Array.from({ length: C }, () => ({ x: rand(-5, 5), z: rand(-5, 2.5), y: rand(0, 12), v: rand(2, 4), r: rand(0, 6) }));
        group.add(coins);
        // 황금 바닥 물결
        const waves = [0, 1, 2].map(() => { const r = square(1, 0.08, glowMat(pick(0), 1)); r.userData.noFit = true; group.add(r); return r; });
        const tiles = new THREE.InstancedMesh(BOX, goldM, 49);
        tiles.userData.noFit = true; group.add(tiles);
        const SP = 14;
        const sparks = new THREE.InstancedMesh(BOX, glowMat(pick(1), 1), SP);
        group.add(sparks);
        tick((t, dt) => {
            cD.forEach((d, i) => {
                d.y -= d.v * dt; if (d.y < 0) { d.y = 12; d.x = rand(-5, 5); }
                TMP.p.set(d.x, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t * 4 + d.r, t * 2 + d.r, 0));
                TMP.sc.set(0.3, 0.3, 0.05);
                coins.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            coins.instanceMatrix.needsUpdate = true;
            waves.forEach((w, i) => {
                const k = ((t * 0.45 + i / 3) % 1);
                w.position.set(0, 0.04, 0);
                w.scale.setScalar(1 + k * 9);
                w.children.forEach(c => { c.material.opacity = (1 - k) * 0.8; });
            });
            // 바닥 타일이 번갈아 금으로 반짝
            let n = 0;
            for (let gx = -3; gx <= 3; gx++) for (let gz = -3; gz <= 3; gz++) {
                const dd = Math.hypot(gx, gz);
                const k = (Math.sin(t * 2 - dd * 0.9) + 1) / 2;
                TMP.p.set(gx * 1.05, 0.02 + k * 0.03, gz * 1.05);
                TMP.q.identity();
                TMP.sc.set(1, 0.04 * k + 0.0001, 1);
                tiles.setMatrixAt(n++, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            tiles.instanceMatrix.needsUpdate = true;
            const lift = dummy.root.position.y;
            for (let i = 0; i < SP; i++) {
                const side = i % 2 ? 1 : -1;
                const k = ((t * 1.3 + i / SP) % 1);
                TMP.p.set(side * (1.5 + Math.sin(i * 3) * 0.3), 1.2 + lift + k * 1.6, Math.cos(i * 5) * 0.4);
                TMP.q.setFromEuler(TMP.e.set(t * 5, t * 3, i)); TMP.sc.setScalar(0.1 * (1 - k));
                sparks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            sparks.instanceMatrix.needsUpdate = true;
            statues.forEach((s, i) => { s.position.y = Math.max(0, Math.sin(t * 0.8 + i) * 0.04); });
        });
    },

    /* 시간여행자 김민채 — 뒤의 거대한 네모 시계(바늘이 미친 듯 돔), 과거와 미래의 잔상, 도는 톱니, 모래시계 */
    timeTraveler({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, ghost, TMP } = kit;
        stage.setSky('#050414');
        const clock = new THREE.Group(); clock.position.set(0, 5.2, -4.2); clock.userData.noFit = true;
        const rim = square(7.2, 0.22, glowMat(pick(0), 0.9)); rim.rotation.x = Math.PI / 2; clock.add(rim);
        const rim2 = square(6.4, 0.06, glowMat(pick(1), 0.7)); rim2.rotation.x = Math.PI / 2; clock.add(rim2);
        const face = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x0b0a1e, roughness: 0.7, transparent: true, opacity: 0.75 })); face.scale.set(7, 7, 0.1); face.position.z = -0.1; clock.add(face);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const tk = new THREE.Mesh(BOX, glowMat(i % 3 ? pick(1) : pick(2), 1));
            tk.scale.set(i % 3 ? 0.14 : 0.24, i % 3 ? 0.4 : 0.7, 0.08);
            tk.position.set(Math.sin(a) * 2.9, Math.cos(a) * 2.9, 0.05); tk.rotation.z = -a;
            clock.add(tk);
        }
        const hand = (len, w, c) => { const g = new THREE.Group(); const m = new THREE.Mesh(BOX, glowMat(c, 1)); m.scale.set(w, len, 0.08); m.position.y = len / 2; g.add(m); g.position.z = 0.12; clock.add(g); return g; };
        const hH = hand(1.7, 0.22, pick(2)), mH = hand(2.6, 0.12, pick(0)), sH = hand(2.8, 0.05, pick(1));
        group.add(clock);
        // 잔상 (과거/미래)
        const past = ghost(pick(1), 0.22), future = ghost(pick(0), 0.22);
        group.add(past, future);
        // 톱니 (네모 십자)
        const gears = [];
        for (let i = 0; i < 6; i++) {
            const g = new THREE.Group();
            const m = solidMat(i % 2 ? pick(0) : pick(1), 0.5);
            for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(BOX, m); b.scale.set(0.9, 0.22, 0.12); b.rotation.z = k * Math.PI / 4; g.add(b); }
            const a = (i / 6) * Math.PI * 2;
            g.position.set(Math.cos(a) * 3, 1.5 + (i % 3) * 1.6, Math.sin(a) * 1.6 - 0.5);
            g.userData.sp = (i % 2 ? 1 : -1) * rand(1.5, 3);
            group.add(g); gears.push(g);
        }
        // 모래시계 (발 앞)
        const hg = new THREE.Group(); hg.position.set(0, 0, 1.8);
        const frameM = solidMat(new THREE.Color('#c9a96e'), 0.2);
        for (const y of [0.05, 1.55]) { const p = new THREE.Mesh(BOX, frameM); p.scale.set(0.9, 0.1, 0.9); p.position.y = y; hg.add(p); }
        const glassT = new THREE.Mesh(BOX, glowMat(pick(2), 0.12)); glassT.scale.set(0.6, 0.65, 0.6); glassT.position.y = 1.18; hg.add(glassT);
        const glassB = glassT.clone(); glassB.position.y = 0.42; hg.add(glassB);
        const sandT = new THREE.Mesh(BOX, glowMat(pick(0), 0.9)); sandT.position.y = 1.0; hg.add(sandT);
        const sandB = new THREE.Mesh(BOX, glowMat(pick(0), 0.9)); hg.add(sandB);
        const stream = new THREE.Mesh(BOX, glowMat(pick(0), 0.9)); stream.scale.set(0.05, 0.75, 0.05); stream.position.y = 0.8; hg.add(stream);
        group.add(hg);
        const portals = [0, 1].map(i => { const r = square(4 + i * 1.4, 0.06, glowMat(pick(i), 0.8)); r.position.y = 0.05; r.userData.noFit = true; group.add(r); return r; });
        tick((t, dt, speed) => {
            const lift = dummy.root.position.y;
            const warp = Math.sin(t * 0.5) > 0.7 ? 6 : 1;   // 가끔 시간이 휘어서 바늘이 미친 듯 돔
            hH.rotation.z = -t * 0.3 * warp; mH.rotation.z = -t * 2.2 * warp; sH.rotation.z = -Math.floor(t * 4) * (Math.PI / 30) * warp;
            clock.rotation.z = Math.sin(t * 0.4) * 0.05;
            const lag = Math.sin(t * 1.4);
            past.position.set(-1.3 - lag * 0.2, lift * 0.8 + Math.sin(t * 1.4 - 1) * 0.1, -0.8);
            future.position.set(1.3 + lag * 0.2, lift * 1.2 + Math.sin(t * 1.4 + 1) * 0.1, -0.8);
            past.rotation.y = 0.25; future.rotation.y = -0.25;
            past.children.forEach(m => { m.material.opacity = 0.14 + 0.1 * Math.sin(t * 3); });
            gears.forEach(g => { g.rotation.z = t * g.userData.sp * speed; g.rotation.y = Math.sin(t) * 0.3; });
            const k = (t % 6) / 6;
            hg.rotation.z = k > 0.95 ? (k - 0.95) / 0.05 * Math.PI : 0;
            sandT.scale.set(0.5, 0.5 * (1 - k) + 0.01, 0.5); sandT.position.y = 0.88 + 0.25 * (1 - k);
            sandB.scale.set(0.5, 0.5 * k + 0.01, 0.5); sandB.position.y = 0.12 + 0.25 * k;
            portals.forEach((p, i) => { p.rotation.y = (i ? -1 : 1) * t * 0.6; });
        });
    },

    /* 태극권 박지성 — 뒤에 떠서 도는 픽셀 태극, 바닥의 팔괘, 두 손을 따라 남는 붉고 푸른 기의 흐름, 대나무와 꽃잎 */
    taichi({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#060a10');
        // 픽셀 태극
        const N = 18, S = 0.36, R = (N / 2) * S;
        const cells = [];
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const x = (i - N / 2 + 0.5) * S, y = (j - N / 2 + 0.5) * S;
            const d = Math.hypot(x, y);
            if (d > R) continue;
            let white = x > 0;
            if (Math.hypot(x, y - R / 2) < R / 2) white = true;
            if (Math.hypot(x, y + R / 2) < R / 2) white = false;
            if (Math.hypot(x, y - R / 2) < R / 6) white = false;
            if (Math.hypot(x, y + R / 2) < R / 6) white = true;
            const rimCell = d > R - S;
            cells.push({ x, y, c: rimCell ? 2 : white ? 1 : 0 });
        }
        const yy = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.12 }), cells.length);
        const cols = [new THREE.Color('#0d0f18'), new THREE.Color('#eef3ff'), new THREE.Color('#ffd27a')];
        cells.forEach((c, i) => {
            yy.setMatrixAt(i, TMP.m4.compose(TMP.p.set(c.x, c.y, 0), TMP.q.identity(), TMP.sc.set(S * 0.94, S * 0.94, 0.25)));
            yy.setColorAt(i, cols[c.c]);
        });
        const yyG = new THREE.Group(); yyG.add(yy); yyG.position.set(0, 5.2, -3.8); yyG.userData.noFit = true;
        group.add(yyG);
        // 팔괘 (막대 3줄, 끊긴 막대는 두 조각)
        const TRI = ['111', '110', '101', '100', '011', '010', '001', '000'];
        const bagua = new THREE.Group(); bagua.position.y = 0.05; bagua.userData.noFit = true;
        const barM = glowMat(pick(0), 0.85);
        TRI.forEach((code, i) => {
            const a = (i / 8) * Math.PI * 2;
            const g = new THREE.Group();
            [...code].forEach((b, k) => {
                const r = 3.0 + k * 0.32;
                if (b === '1') { const m = new THREE.Mesh(BOX, barM); m.scale.set(1.3, 0.04, 0.16); m.position.z = r; g.add(m); }
                else for (const sx of [-0.4, 0.4]) { const m = new THREE.Mesh(BOX, barM); m.scale.set(0.5, 0.04, 0.16); m.position.set(sx, 0, r); g.add(m); }
            });
            g.rotation.y = a;
            bagua.add(g);
        });
        group.add(bagua);
        // 기의 흐름 (두 손의 궤적)
        const TR = 22;
        const trailR = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.85), TR);
        const trailB = new THREE.InstancedMesh(BOX, glowMat(pick(2), 0.85), TR);
        group.add(trailR, trailB);
        const histR = Array.from({ length: TR }, () => new THREE.Vector3()), histB = Array.from({ length: TR }, () => new THREE.Vector3());
        const handL = new THREE.Object3D(); handL.position.y = -2.0; dummy.armL.add(handL);
        const handR = new THREE.Object3D(); handR.position.y = -2.0; dummy.armR.add(handR);
        stage.onClear(() => { dummy.armL.remove(handL); dummy.armR.remove(handR); });
        // 대나무
        const bamboo = solidMat(new THREE.Color('#3f8a4a'), 0.15);
        const bambooG = new THREE.Group(); bambooG.userData.noFit = true;
        for (let i = 0; i < 8; i++) {
            const side = i % 2 ? 1 : -1;
            const st = new THREE.Group(); st.position.set(side * rand(4.5, 7), 0, rand(-6, -2));
            for (let k = 0; k < 10; k++) { const seg = new THREE.Mesh(BOX, bamboo); seg.scale.set(0.3, 1.0, 0.3); seg.position.y = 0.5 + k * 1.05; st.add(seg); }
            st.userData.ph = rand(0, 6);
            bambooG.add(st);
        }
        group.add(bambooG);
        const PET = 26;
        const petals = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffb3c7'), 0.9), PET);
        const pD = Array.from({ length: PET }, () => ({ x: rand(-6, 6), y: rand(0, 11), z: rand(-5, 3), v: rand(0.4, 0.9), ph: rand(0, 6) }));
        group.add(petals);
        const wp = new THREE.Vector3();
        sig.flow = 0;
        tick((t, dt) => {
            yyG.rotation.z = t * 0.35;
            yyG.position.y = 5.2 + dummy.root.position.y * 0.5 + Math.sin(t * 0.6) * 0.15;
            bagua.rotation.y = -t * 0.12;
            sig.flow = t;
            handL.getWorldPosition(wp); group.worldToLocal(wp); histR.unshift(histR.pop().copy(wp));
            handR.getWorldPosition(wp); group.worldToLocal(wp); histB.unshift(histB.pop().copy(wp));
            for (let i = 0; i < TR; i++) {
                const s = 0.2 * (1 - i / TR) + 0.02;
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 0.7, 0)); TMP.sc.setScalar(s);
                trailR.setMatrixAt(i, TMP.m4.compose(histR[i], TMP.q, TMP.sc));
                trailB.setMatrixAt(i, TMP.m4.compose(histB[i], TMP.q, TMP.sc));
            }
            trailR.instanceMatrix.needsUpdate = trailB.instanceMatrix.needsUpdate = true;
            bambooG.children.forEach(st => { st.rotation.z = Math.sin(t * 0.7 + st.userData.ph) * 0.03; });
            pD.forEach((d, i) => {
                d.y -= d.v * dt; if (d.y < 0) d.y = 11;
                TMP.p.set(d.x + Math.sin(t * 0.8 + d.ph) * 0.8, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t + i, 0)); TMP.sc.set(0.16, 0.03, 0.12);
                petals.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            petals.instanceMatrix.needsUpdate = true;
        });
    },

    /* 대악마 김티비 — 검붉은 피부와 빛나는 눈, 뿔, 거대한 박쥐 날개, 지옥불 고리, 하늘에서 늘어진 사슬, 어둠 속 거대한 눈 */
    archdemon({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#120003');
        stage.setSkin({ color: '#4a0a14', eye: '#ff2a2a', glowEyes: true, smile: false, emissive: 0.08 });
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const hornM = new THREE.MeshStandardMaterial({ color: 0x1a1014, roughness: 0.4, metalness: 0.3 });
        for (const s of [-1, 1]) {
            const horn = new THREE.Group(); horn.position.set(s * 0.5, 0.6, 0);
            let px = 0, py = 0;
            for (let k = 0; k < 6; k++) {
                const b = new THREE.Mesh(BOX, k === 5 ? glowMat(pick(0), 1) : hornM);
                const w = 0.34 - k * 0.045;
                b.scale.set(w, 0.36, w);
                px += s * (0.16 - k * 0.01); py += 0.3 - k * 0.02;
                b.position.set(px + s * (k > 3 ? -0.08 * (k - 3) : 0), py, -k * 0.04);
                b.rotation.z = -s * (0.5 - k * 0.12);
                horn.add(b);
            }
            attach(dummy.head, horn);
        }
        // 날개
        const memM = new THREE.MeshStandardMaterial({ color: 0x3a0610, roughness: 0.6, emissive: pick(0), emissiveIntensity: 0.18, side: THREE.DoubleSide });
        const wings = [];
        for (const s of [-1, 1]) {
            const w = new THREE.Group(); w.position.set(s * 0.6, 3.6, -0.6);
            const bones = [[2.4, 0.6], [2.2, 1.6], [1.8, 2.4]];
            bones.forEach(([len, up], k) => {
                const b = new THREE.Mesh(BOX, hornM); b.scale.set(len, 0.14, 0.14);
                b.position.set(s * len / 2 * (1 + k * 0.3), up * 0.8, 0); b.rotation.z = s * (0.25 + k * 0.25);
                w.add(b);
            });
            for (let k = 0; k < 5; k++) {
                const m = new THREE.Mesh(BOX, memM); m.scale.set(0.9, 2.6 - k * 0.3, 0.05);
                m.position.set(s * (0.7 + k * 0.85), 0.9 - k * 0.15 + (k > 2 ? (k - 2) * 0.25 : 0), -0.02);
                m.rotation.z = s * (0.15 + k * 0.08);
                w.add(m);
            }
            const claw = new THREE.Mesh(BOX, glowMat(pick(0), 1)); claw.scale.setScalar(0.22); claw.position.set(s * 4.2, 2.3, 0); w.add(claw);
            group.add(w); wings.push({ w, s });
        }
        // 지옥불 고리
        const F = 40;
        const flames = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.85), F);
        const fD = Array.from({ length: F }, (_, i) => ({ a: (i / F) * Math.PI * 2, ph: rand(0, 1), h: rand(1, 2.4) }));
        flames.userData.noFit = true; group.add(flames);
        const sigil = [0, 1, 2].map(i => { const r = square(3.4 + i * 1.2, 0.06, glowMat(pick(0), 0.9)); r.position.y = 0.05; r.rotation.y = i * Math.PI / 4; r.userData.noFit = true; group.add(r); return r; });
        // 사슬
        const linkM = new THREE.MeshStandardMaterial({ color: 0x4a4650, metalness: 0.9, roughness: 0.3 });
        const chains = [];
        for (let c = 0; c < 4; c++) {
            const ch = new THREE.Group(); ch.position.set((c - 1.5) * 3.2, 14, -4 - (c % 2) * 2); ch.userData.noFit = true;
            for (let k = 0; k < 14; k++) { const l = new THREE.Mesh(BOX, linkM); l.scale.set(0.3, 0.55, 0.1); l.position.y = -k * 0.5; l.rotation.y = k % 2 ? Math.PI / 2 : 0; ch.add(l); }
            ch.userData.ph = rand(0, 6);
            group.add(ch); chains.push(ch);
        }
        // 어둠 속 눈
        const eyes = new THREE.Group(); eyes.position.set(0, 9, -16); eyes.userData.noFit = true;
        const eyeM = glowMat(pick(0), 1);
        for (const s of [-1, 1]) { const e = new THREE.Mesh(BOX, eyeM); e.scale.set(2.6, 0.5, 0.2); e.position.x = s * 2.4; e.rotation.z = s * -0.15; eyes.add(e); }
        group.add(eyes);
        const EMB = 40;
        const embers = new THREE.InstancedMesh(BOX, glowMat(pick(1), 1), EMB);
        const eD = Array.from({ length: EMB }, () => ({ x: rand(-5, 5), z: rand(-4, 3), y: rand(0, 10), v: rand(1, 2.5) }));
        group.add(embers);
        const rim = new THREE.PointLight(pick(0), 9, 12, 1.5); rim.userData.own = true; rim.position.set(0, 1, 2); group.add(rim);
        let burstN = -1;
        sig.rageK = 0;
        tick((t, dt, speed) => {
            const lift = dummy.root.position.y;
            const c = t % 5, n = Math.floor(t / 5);
            sig.rageK = c < 0.6 ? c / 0.6 : c < 1.6 ? 1 : c < 2.4 ? 1 - (c - 1.6) / 0.8 : 0;
            if (n !== burstN && c > 0.6) { burstN = n; stage.shake(0.35); stage.flash(0.4); }
            const rage = sig.rageK;
            wings.forEach(({ w, s }) => {
                w.position.y = 3.6 + lift;
                w.rotation.y = -s * (0.35 + Math.sin(t * 2.2) * 0.25 - rage * 0.3);
                w.rotation.z = s * (Math.sin(t * 2.2) * 0.12 + rage * 0.15);
            });
            fD.forEach((d, i) => {
                const k = (t * 1.4 + d.ph) % 1;
                const r = 3.0 + Math.sin(i * 7) * 0.4;
                TMP.p.set(Math.cos(d.a + t * 0.3) * r, k * d.h * (1 + rage * 1.4), Math.sin(d.a + t * 0.3) * r);
                TMP.q.setFromEuler(TMP.e.set(0, d.a, t * 2 + i));
                TMP.sc.setScalar(0.32 * (1 - k) + 0.02);
                flames.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            flames.instanceMatrix.needsUpdate = true;
            sigil.forEach((r, i) => { r.rotation.y = i * Math.PI / 4 + t * (i % 2 ? -0.4 : 0.4); r.children.forEach(m => { m.material.opacity = 0.6 + 0.4 * rage; }); });
            chains.forEach(ch => { ch.rotation.z = Math.sin(t * 0.8 + ch.userData.ph) * 0.06; });
            const blink = (t % 7) > 6.8 ? 0.05 : 1;
            eyes.scale.set(1, blink * (0.6 + rage * 0.6), 1);
            eD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 10) d.y = 0;
                TMP.p.set(d.x + Math.sin(t + i) * 0.3, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t * 3 + i, t, 0)); TMP.sc.setScalar(0.07);
                embers.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            embers.instanceMatrix.needsUpdate = true;
            rim.intensity = 7 + rage * 8;
        });
    },

    /* 샌즈. 김티비 — 파란 후드, 해골 얼굴과 번쩍이는 왼쪽 눈, 가스터 블래스터 일제사격, 바닥에서 솟는 뼈 벽,
       옆으로 미끄러지는 파란 뼈, 뒤에 떠 있는 전투 상자와 빨간 영혼 */
    sans({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#000000');
        stage.setSkin({ color: '#cfcfd4', eye: '#111111', smile: false });
        // 해골 얼굴
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#cfcfd4'; g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#0a0a0a';
        g.fillRect(64, 70, 44, 40); g.fillRect(148, 70, 44, 40);           // 눈구멍
        g.fillStyle = '#ffffff'; g.fillRect(80, 84, 12, 12); g.fillRect(164, 84, 12, 12);   // 눈동자
        g.fillStyle = '#0a0a0a'; g.fillRect(120, 124, 8, 14); g.fillRect(130, 124, 8, 14);  // 코
        g.fillRect(44, 156, 168, 8); g.fillRect(52, 196, 152, 8);          // 웃는 입 위아래
        g.fillRect(40, 148, 8, 12); g.fillRect(208, 148, 8, 12);
        for (let x = 52; x <= 200; x += 18) g.fillRect(x, 160, 4, 40);     // 이빨 줄
        const faceTex = new THREE.CanvasTexture(c); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.magFilter = THREE.NearestFilter;
        dummy.faceMat.map?.dispose?.();
        dummy.faceMat.map = faceTex; dummy.faceMat.needsUpdate = true;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        // 옷
        const blue = new THREE.MeshStandardMaterial({ color: 0x3561c9, roughness: 0.8 });
        const fur = new THREE.MeshStandardMaterial({ color: 0xe9eef7, roughness: 1 });
        const shorts = new THREE.MeshStandardMaterial({ color: 0x15161c, roughness: 0.8 });
        const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const pink = new THREE.MeshStandardMaterial({ color: 0xff8fc2, roughness: 0.7 });
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        attach(dummy.torso, box(blue, 2.1, 2.08, 1.12, 0, 0, 0));
        attach(dummy.torso, box(fur, 2.2, 0.32, 1.2, 0, 0.92, 0));            // 후드 털
        attach(dummy.torso, box(new THREE.MeshStandardMaterial({ color: 0x2a2d36 }), 0.9, 1.6, 0.04, 0, 0, 0.58));   // 안에 입은 검은 티
        attach(dummy.torso, box(new THREE.MeshStandardMaterial({ color: 0x284c9f }), 1.7, 0.4, 0.06, 0, -0.65, 0.58)); // 주머니
        for (const arm of [dummy.armL, dummy.armR]) { attach(arm, box(blue, 1.1, 1.75, 1.1, 0, -0.75, 0)); attach(arm, box(fur, 1.12, 0.18, 1.12, 0, -1.6, 0)); }
        for (const leg of [dummy.legL, dummy.legR]) {
            attach(leg, box(shorts, 1.04, 1.0, 1.06, 0, -0.45, 0));
            attach(leg, box(white, 0.1, 0.9, 1.07, leg === dummy.legL ? -0.5 : 0.5, -0.45, 0));
            attach(leg, box(pink, 1.1, 0.3, 1.45, 0, -1.9, 0.16));
        }
        // 왼쪽 눈 불꽃 (캐릭터 기준 왼눈 = 화면 오른쪽)
        const eye = box(glowMat(pick(0), 1), 0.2, 0.2, 0.08, 0.27, 0.12, 0.64);
        attach(dummy.head, eye);
        const eyeTrail = [0, 1, 2, 3].map(k => { const e = box(glowMat(pick(0), 0.6 - k * 0.13), 0.15 - k * 0.025, 0.15 - k * 0.025, 0.05, 0.4 + k * 0.17, 0.2 + k * 0.03, 0.62); attach(dummy.head, e); return e; });
        const eyeL = new THREE.PointLight(pick(0), 0.8, 4, 2); eyeL.position.set(0.3, 0.1, 1); attach(dummy.head, eyeL);

        // 가스터 블래스터
        const skullM = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.5 });
        const darkM = new THREE.MeshBasicMaterial({ color: 0x000000 });
        function blaster() {
            const root = new THREE.Group();
            const b = (m, w, h, d, x, y, z, p = root) => { const o = new THREE.Mesh(BOX, m); o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o; };
            b(skullM, 1.8, 1.3, 1.6, 0, 0.2, -0.3);           // 머리
            b(skullM, 1.3, 0.55, 1.4, 0, 0.15, 1.0);          // 위 주둥이
            b(darkM, 0.42, 0.38, 0.1, -0.45, 0.45, 0.51); b(darkM, 0.42, 0.38, 0.1, 0.45, 0.45, 0.51);
            const pupils = [b(glowMat(pick(0), 1), 0.16, 0.16, 0.06, -0.45, 0.45, 0.56), b(glowMat(pick(0), 1), 0.16, 0.16, 0.06, 0.45, 0.45, 0.56)];
            for (const s of [-1, 1]) { const h = b(skullM, 0.3, 0.9, 0.3, s * 0.8, 0.6, -1.0); h.rotation.x = -0.9; h.rotation.z = s * 0.3; }
            for (let i = 0; i < 4; i++) b(skullM, 0.14, 0.24, 0.14, -0.45 + i * 0.3, -0.18, 1.55);
            const jaw = new THREE.Group(); jaw.position.set(0, -0.15, -0.2); root.add(jaw);
            b(skullM, 1.25, 0.32, 1.9, 0, -0.18, 0.85, jaw);
            for (let i = 0; i < 4; i++) b(skullM, 0.14, 0.22, 0.14, -0.45 + i * 0.3, 0.06, 1.7, jaw);
            const mouth = b(glowMat(pick(2), 0), 0.9, 0.3, 0.3, 0, -0.1, 1.4);
            const beamCore = b(glowMat(new THREE.Color('#ffffff'), 1), 1, 1, 1, 0, -0.1, 1.5);
            const beamGlow = b(glowMat(pick(0), 0.45), 1, 1, 1, 0, -0.1, 1.5);
            beamCore.userData.noFit = beamGlow.userData.noFit = true;
            root.userData.noFit = true;
            return { root, jaw, mouth, beamCore, beamGlow, pupils, from: new THREE.Vector3(), at: new THREE.Vector3(), aim: new THREE.Vector3(), k: 0, delay: 0 };
        }
        const BL = 5;
        const blasters = Array.from({ length: BL }, blaster);
        blasters.forEach(bl => group.add(bl.root));
        const CYCLE = 3.6;
        let volley = -1;
        // 뼈 (기둥 + 양끝 마디)
        const NB = 26;
        const boneShaft = new THREE.InstancedMesh(BOX, skullM, NB);
        const boneKnob = new THREE.InstancedMesh(BOX, skullM, NB * 4);
        boneShaft.userData.noFit = boneKnob.userData.noFit = true;
        group.add(boneShaft, boneKnob);
        const boneD = Array.from({ length: NB }, (_, i) => ({ a: (i / NB) * Math.PI * 2, h: rand(1.2, 3.4) }));
        const BLUE = 6;
        const blueShaft = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.95), BLUE);
        const blueKnob = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.95), BLUE * 4);
        blueShaft.userData.noFit = blueKnob.userData.noFit = true;
        group.add(blueShaft, blueKnob);
        const putBone = (shaft, knob, i, x, y, z, h, ry = 0) => {
            TMP.q.setFromEuler(TMP.e.set(0, ry, 0));
            shaft.setMatrixAt(i, TMP.m4.compose(TMP.p.set(x, y + h / 2, z), TMP.q, TMP.sc.set(0.16, Math.max(0.001, h), 0.16)));
            const ks = h > 0.05 ? 0.2 : 0.0001;
            let k = 0;
            for (const yy of [y, y + h]) for (const dx of [-0.09, 0.09]) {
                TMP.v.set(dx, 0, 0).applyQuaternion(TMP.q);
                knob.setMatrixAt(i * 4 + k++, TMP.m4.compose(TMP.p.set(x + TMP.v.x, yy, z + TMP.v.z), TMP.q, TMP.sc.set(ks, ks, ks)));
            }
        };
        // 전투 상자 + 영혼
        const battle = new THREE.Group(); battle.position.set(-4.2, 3.2, -3.2); battle.rotation.y = 0.35; battle.userData.noFit = true;
        const frameW = 2.8, frameH = 2.0;
        for (const [w, h, x, y] of [[frameW, 0.1, 0, frameH / 2], [frameW, 0.1, 0, -frameH / 2], [0.1, frameH, frameW / 2, 0], [0.1, frameH, -frameW / 2, 0]]) battle.add(box(glowMat(new THREE.Color('#ffffff'), 1), w, h, 0.08, x, y, 0));
        battle.add(box(darkM, frameW, frameH, 0.02, 0, 0, -0.06));
        const soul = new THREE.Group();
        const HEART = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
        const heartM = glowMat(new THREE.Color('#ff1a1a'), 1);
        HEART.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '1') soul.add(box(heartM, 0.06, 0.06, 0.06, (k - 3) * 0.06, (2.5 - r) * 0.06, 0)); }));
        soul.position.z = 0.05; battle.add(soul);
        const mini = [0, 1, 2].map(() => { const m = box(skullM, 0.08, 0.6, 0.06, 0, 0, 0.04); battle.add(m); return m; });
        group.add(battle);
        sig.castK = 0; sig.dodge = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            // 눈: 파랑 ↔ 노랑
            const yellow = Math.floor(t * 6) % 5 === 0;
            const ec = yellow ? pick(1) : pick(0);
            eye.material.color.copy(ec); eyeL.color.copy(ec);
            const flick = 0.85 + Math.sin(t * 30) * 0.15;
            eye.scale.set(0.2 * flick, 0.2 * flick, 0.08);
            eyeTrail.forEach((e, k) => { e.material.color.copy(ec); e.position.y = 0.2 + k * 0.03 + Math.sin(t * 8 + k) * 0.04; });

            // 블래스터: CYCLE 마다 일제사격 (0~0.6 등장, 0.6~1.2 입 벌리며 충전, 1.2~1.7 발사, 1.7~2.3 사라짐)
            const cyc = t % CYCLE, vn = Math.floor(t / CYCLE);
            if (vn !== volley) {
                volley = vn;
                blasters.forEach((bl, i) => {
                    const a = rand(-Math.PI, 0) - 0.2;   // 뒤쪽 반원 + 양옆
                    const r = rand(5, 7);
                    bl.at.set(Math.cos(a) * r, rand(3.5, 7.5), Math.sin(a) * r * 0.7 - 1);
                    bl.from.copy(bl.at).multiplyScalar(2.2);
                    bl.aim.set(rand(-3, 3), rand(0.5, 2.5), rand(0.5, 3));   // 캐릭터 앞쪽을 가로질러 쏨
                    bl.delay = i * 0.08;
                });
            }
            sig.castK = cyc < 0.5 ? cyc / 0.5 : cyc < 1.7 ? 1 : cyc < 2.2 ? 1 - (cyc - 1.7) / 0.5 : 0;
            let firing = false;
            blasters.forEach((bl, i) => {
                const k = cyc - bl.delay;
                const app = Math.min(1, Math.max(0, k / 0.6));
                const gone = Math.min(1, Math.max(0, (k - 1.8) / 0.5));
                const vis = k > 0 && gone < 1;
                bl.root.visible = vis;
                if (!vis) return;
                const e = 1 - Math.pow(1 - app, 3);
                bl.root.position.lerpVectors(bl.from, bl.at, e);
                bl.root.position.y += lift;
                bl.root.lookAt(TMP.v.copy(bl.aim));
                bl.root.position.addScaledVector(TMP.p.subVectors(bl.root.position, bl.aim).normalize(), gone * 2);
                bl.root.scale.setScalar((0.3 + e * 0.7) * (1 - gone * 0.6) * 1.15);
                const charge = Math.min(1, Math.max(0, (k - 0.6) / 0.6));
                const fire = k > 1.2 && k < 1.75;
                bl.jaw.rotation.x = charge * 0.55 + (fire ? 0.15 : 0);
                bl.mouth.material.opacity = charge * 0.9;
                bl.mouth.scale.set(0.9 * (0.5 + charge * 0.6), 0.3 + charge * 0.3, 0.3);
                bl.pupils.forEach(p => { p.material.color.copy(Math.floor(t * 10) % 2 && charge > 0.5 ? pick(1) : pick(0)); });
                const fk = fire ? Math.sin(((k - 1.2) / 0.55) * Math.PI) : 0;
                const len = 30;
                bl.beamCore.visible = bl.beamGlow.visible = fire;
                bl.beamCore.scale.set(0.55 * fk + 0.01, 0.55 * fk + 0.01, len); bl.beamCore.position.z = 1.5 + len / 2;
                bl.beamGlow.scale.set(1.2 * fk + 0.01, 1.2 * fk + 0.01, len); bl.beamGlow.position.z = 1.5 + len / 2;
                if (fire) firing = true;
            });
            if (firing && cyc > 1.2 && cyc < 1.3) { stage.shake(0.18); stage.flash(0.25); }

            // 뼈 벽: 블래스터 사이사이에 바닥에서 솟음
            const wave = ((t + 1.8) % CYCLE) / CYCLE;
            const up = wave < 0.15 ? wave / 0.15 : wave < 0.4 ? 1 : wave < 0.55 ? 1 - (wave - 0.4) / 0.15 : 0;
            boneD.forEach((d, i) => {
                const r = 3.4 + (i % 2) * 0.5;
                const h = d.h * up;
                putBone(boneShaft, boneKnob, i, Math.cos(d.a + t * 0.1) * r, 0, Math.sin(d.a + t * 0.1) * r, h);
            });
            boneShaft.instanceMatrix.needsUpdate = boneKnob.instanceMatrix.needsUpdate = true;
            // 파란 뼈: 앞을 가로질러 미끄러짐
            for (let i = 0; i < BLUE; i++) {
                const k = ((t * 0.35 + i / BLUE) % 1);
                putBone(blueShaft, blueKnob, i, -7 + k * 14, 0, 2.2 + (i % 2) * 0.6, 1.6 + (i % 3) * 0.5);
            }
            blueShaft.instanceMatrix.needsUpdate = blueKnob.instanceMatrix.needsUpdate = true;
            // 영혼이 상자 안에서 뼈를 피함
            soul.position.set(Math.sin(t * 2.3) * 0.9, Math.sin(t * 3.1) * 0.6 - 0.1 + Math.abs(Math.sin(t * 6)) * 0.12, 0.05);
            mini.forEach((m, i) => { const k = ((t * 0.5 + i / 3) % 1); m.position.set(1.3 - k * 2.6, -0.65 + (i % 2) * 1.0, 0.04); });
            battle.position.y = 3.2 + Math.sin(t * 0.9) * 0.15;
            // 4초마다 옆으로 슥 피함
            const dc = t % 4;
            sig.dodge = dc < 0.25 ? Math.sin((dc / 0.25) * Math.PI / 2) : dc < 1.0 ? 1 : dc < 1.3 ? 1 - (dc - 1.0) / 0.3 : 0;
        });
    },

    /* 검객 공병은 — 허리의 칼집과 손의 칼, 4초마다 발도술로 공기를 가르는 빛의 궤적, 흩날리는 꽃잎 */
    swordsman({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, sword, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const blade = kit.heldSword(2.6, null, pick(0), 0.22, true);
        blade.rotation.x = 2.4; blade.position.set(0, -1.95, 0);
        attach(dummy.armL, blade);
        const sheath = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1a1018, roughness: 0.4 }));
        sheath.scale.set(0.18, 0.22, 2.6); sheath.position.set(-0.9, -0.85, 0.2); sheath.rotation.y = 0.25;
        attach(dummy.torso, sheath);
        const band = new THREE.Mesh(BOX, solidMat(pick(0), 0.4)); band.scale.set(1.4, 0.14, 1.4); band.position.y = 0.25; attach(dummy.head, band);
        // 베기 궤적: 반원 위의 얇은 막대들
        const ARC = 26;
        const slash = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.95), ARC);
        const slash2 = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.7), ARC);
        slash.userData.noFit = slash2.userData.noFit = true;
        group.add(slash, slash2);
        const PET = 30;
        const petals = new THREE.InstancedMesh(BOX, glowMat(pick(2), 0.9), PET);
        const pD = Array.from({ length: PET }, () => ({ x: rand(-5, 5), y: rand(0, 9), z: rand(-4, 3), v: rand(0.5, 1.1), ph: rand(0, 6) }));
        group.add(petals);
        sig.drawK = 0;
        tick((t, dt) => {
            const c = t % 4;
            // 0~0.9 자세 잡기, 0.9~1.1 베기, 1.1~2 남은 궤적
            sig.drawK = c < 0.9 ? c / 0.9 : c < 1.1 ? 1 : c < 2 ? 1 - (c - 1.1) / 0.9 : 0;
            const sk = c >= 0.9 && c < 2 ? (c - 0.9) / 1.1 : -1;
            const lift = dummy.root.position.y;
            for (let i = 0; i < ARC; i++) {
                const a = -1.2 + (i / ARC) * 2.6;
                const vis = sk >= 0 && i / ARC < Math.min(1, sk * 6);
                const fade = vis ? 1 - sk : 0;
                for (const [m, r, w] of [[slash, 3.0, 0.07], [slash2, 3.3, 0.16]]) {
                    TMP.p.set(Math.sin(a) * r, 2.6 + lift + Math.cos(a) * 0.4, Math.cos(a) * r * 0.6 + 0.5);
                    TMP.q.setFromEuler(TMP.e.set(0, a, 0.15));
                    TMP.sc.set(w * fade + 0.0001, w * 0.6 * fade + 0.0001, 0.42);
                    m.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
            }
            slash.instanceMatrix.needsUpdate = slash2.instanceMatrix.needsUpdate = true;
            if (c > 0.9 && c < 0.95) stage.flash(0.25);
            pD.forEach((d, i) => {
                const burst = sk >= 0 && sk < 0.3 ? (0.3 - sk) * 8 : 0;
                d.y -= d.v * dt; if (d.y < 0) d.y = 9;
                d.x += burst * dt * (d.x > 0 ? 1 : -1);
                if (Math.abs(d.x) > 6) d.x = rand(-3, 3);
                TMP.p.set(d.x + Math.sin(t + d.ph) * 0.5, d.y, d.z);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t + i, 0)); TMP.sc.set(0.16, 0.03, 0.12);
                petals.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            petals.instanceMatrix.needsUpdate = true;
        });
    },

    /* DJ 김티비 — 앞의 DJ 부스(돌아가는 턴테이블 둘), 양옆 스피커가 박자에 쿵쿵, 바닥 이퀄라이저, 휘젓는 조명 */
    dj({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#07031a');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        // 헤드폰
        const hpM = new THREE.MeshStandardMaterial({ color: 0x18161f, roughness: 0.4 });
        const hp = new THREE.Group();
        const arc = new THREE.Mesh(BOX, hpM); arc.scale.set(1.5, 0.14, 0.3); arc.position.y = 0.72; hp.add(arc);
        for (const s of [-1, 1]) { const cup = new THREE.Mesh(BOX, hpM); cup.scale.set(0.24, 0.6, 0.6); cup.position.set(s * 0.7, 0.05, 0); hp.add(cup); const l = new THREE.Mesh(BOX, glowMat(pick(1), 1)); l.scale.set(0.05, 0.36, 0.36); l.position.set(s * 0.83, 0.05, 0); hp.add(l); }
        attach(dummy.head, hp);
        // 부스
        const booth = new THREE.Group(); booth.position.set(0, 0, 1.7);
        const deskM = new THREE.MeshStandardMaterial({ color: 0x14121c, roughness: 0.5 });
        const desk = new THREE.Mesh(BOX, deskM); desk.scale.set(3.6, 2.2, 1.0); desk.position.y = 1.1; booth.add(desk);
        const front = new THREE.Mesh(BOX, glowMat(pick(0), 0.8)); front.scale.set(3.4, 0.1, 0.05); front.position.set(0, 1.4, 0.52); booth.add(front);
        const front2 = new THREE.Mesh(BOX, glowMat(pick(2), 0.8)); front2.scale.set(3.4, 0.1, 0.05); front2.position.set(0, 0.8, 0.52); booth.add(front2);
        const decks = [];
        for (const s of [-1, 1]) {
            const plate = new THREE.Group(); plate.position.set(s * 1.0, 2.26, 0);
            const disc = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.2 })); disc.scale.set(0.95, 0.06, 0.95); plate.add(disc);
            const label = new THREE.Mesh(BOX, glowMat(s > 0 ? pick(1) : pick(2), 1)); label.scale.set(0.3, 0.07, 0.3); plate.add(label);
            booth.add(plate); decks.push(plate);
        }
        group.add(booth);
        // 스피커
        const speakers = [];
        for (const s of [-1, 1]) {
            const sp = new THREE.Group(); sp.position.set(s * 3.6, 0, -0.6); sp.userData.noFit = true;
            const cab = new THREE.Mesh(BOX, deskM); cab.scale.set(1.6, 3.6, 1.2); cab.position.y = 1.8; sp.add(cab);
            const cones = [];
            for (const [y, sz] of [[2.6, 0.9], [1.1, 1.1]]) { const c = new THREE.Mesh(BOX, solidMat(pick(0), 0.3)); c.scale.set(sz, sz, 0.1); c.position.set(0, y, 0.62); sp.add(c); cones.push(c); }
            group.add(sp); speakers.push({ sp, cones });
        }
        // 바닥 이퀄라이저
        const EQ = 24;
        const eq = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.85), EQ);
        eq.userData.noFit = true; group.add(eq);
        // 조명 빔
        const beams = [0, 1, 2, 3].map(i => { const b = new THREE.Mesh(BOX, glowMat(i % 2 ? pick(0) : pick(2), 0.12)); b.scale.set(0.4, 14, 0.4); b.userData.noFit = true; group.add(b); return b; });
        const BPM = 128, beat = 60 / BPM;
        sig.beat = 0;
        tick((t) => {
            const ph = (t % beat) / beat;
            const kick = Math.pow(1 - ph, 3);
            sig.beat = kick;
            decks.forEach((d, i) => { d.rotation.y = t * (i ? -3.3 : 3.3); });
            speakers.forEach(({ cones }) => cones.forEach(c => { c.scale.z = 0.1 + kick * 0.5; c.position.z = 0.62 + kick * 0.18; }));
            for (let i = 0; i < EQ; i++) {
                const a = (i / EQ) * Math.PI * 2;
                const h = 0.2 + (Math.abs(Math.sin(t * 3 + i * 1.7)) * 0.6 + kick * 0.8) * (0.6 + 0.4 * Math.sin(i * 3));
                TMP.p.set(Math.cos(a) * 2.6, h / 2, Math.sin(a) * 2.6 - 0.2);
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0)); TMP.sc.set(0.3, h, 0.16);
                eq.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            eq.instanceMatrix.needsUpdate = true;
            beams.forEach((b, i) => {
                b.position.set((i - 1.5) * 2.4, 8, -4);
                b.rotation.z = Math.sin(t * (0.8 + i * 0.2) + i) * 0.6;
                b.rotation.x = Math.cos(t * 0.6 + i) * 0.2;
                b.material.opacity = 0.08 + kick * 0.12;
            });
            front.material.opacity = 0.4 + kick * 0.6; front2.material.opacity = 0.4 + (1 - kick) * 0.4;
        });
    },

    /* 우주비행사 박지성 — 우주 헬멧과 제트팩(불꽃), 주위를 도는 네모 행성들과 고리, 인공위성, 둥둥 떠다님 */
    astronaut({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        stage.setSky('#01030c');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const suit = new THREE.MeshStandardMaterial({ color: 0xeef0f4, roughness: 0.7 });
        const glass = new THREE.Mesh(BOX, glowMat(pick(0), 0.18)); glass.scale.set(1.75, 1.65, 1.65); attach(dummy.head, glass);
        const visor = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xffb347, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.45 })); visor.scale.set(1.3, 0.8, 0.05); visor.position.set(0, 0.05, 0.84); attach(dummy.head, visor);
        const ring = new THREE.Mesh(BOX, suit); ring.scale.set(1.9, 0.25, 1.75); ring.position.y = -0.82; attach(dummy.head, ring);
        // 제트팩
        const pack = new THREE.Group(); pack.position.set(0, 0.1, -0.85);
        const body = new THREE.Mesh(BOX, suit); body.scale.set(1.5, 1.7, 0.7); pack.add(body);
        const flames = [];
        for (const s of [-1, 1]) {
            const noz = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x55585f, metalness: 0.8, roughness: 0.3 })); noz.scale.set(0.4, 0.4, 0.4); noz.position.set(s * 0.45, -1.0, 0); pack.add(noz);
            const f = new THREE.Mesh(BOX, glowMat(pick(1), 0.9)); f.position.set(s * 0.45, -1.6, 0); pack.add(f); flames.push(f);
            const f2 = new THREE.Mesh(BOX, glowMat(new THREE.Color('#ffffff'), 0.9)); f2.position.set(s * 0.45, -1.35, 0); pack.add(f2); flames.push(f2);
        }
        attach(dummy.torso, pack);
        // 행성
        const planets = [];
        [[1.0, 4.2, 0.35, '#ff9a3c'], [0.7, 5.6, -0.22, '#6ad1ff'], [1.4, 7.0, 0.15, '#c78bff']].forEach(([size, r, sp, c], i) => {
            const p = new THREE.Group();
            const ball = new THREE.Mesh(BOX, solidMat(new THREE.Color(c), 0.35)); ball.scale.setScalar(size); p.add(ball);
            if (i !== 1) { const rg = square(size * 2.2, 0.06, glowMat(new THREE.Color(c), 0.8)); rg.rotation.z = 0.4; p.add(rg); }
            p.userData = { r, sp, ph: i * 2, noFit: i === 2 };
            group.add(p); planets.push(p);
        });
        // 인공위성
        const sat = new THREE.Group();
        const core = new THREE.Mesh(BOX, solidMat(new THREE.Color('#d9d9e0'), 0.2)); core.scale.set(0.5, 0.5, 0.7); sat.add(core);
        for (const s of [-1, 1]) { const pn = new THREE.Mesh(BOX, solidMat(new THREE.Color('#2a5bd6'), 0.4)); pn.scale.set(1.2, 0.04, 0.5); pn.position.x = s * 0.85; sat.add(pn); }
        group.add(sat);
        const ST = 50;
        const stars = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffffff'), 1), ST);
        const sD = Array.from({ length: ST }, () => ({ p: new THREE.Vector3(rand(-12, 12), rand(-1, 14), rand(-14, -4)), s: rand(0.05, 0.14), ph: rand(0, 6) }));
        stars.userData.noFit = true; group.add(stars);
        tick((t) => {
            const lift = dummy.root.position.y;
            flames.forEach((f, i) => { const k = 0.7 + Math.random() * 0.5; f.scale.set(i % 2 ? 0.2 : 0.32, (i % 2 ? 0.5 : 0.95) * k, i % 2 ? 0.2 : 0.32); });
            planets.forEach(p => {
                const a = t * p.userData.sp + p.userData.ph;
                p.position.set(Math.cos(a) * p.userData.r, 3 + lift + Math.sin(a * 0.7) * 1.2, Math.sin(a) * p.userData.r * 0.6 - 1);
                p.rotation.set(t * 0.3, t * 0.5, 0);
            });
            sat.position.set(Math.cos(t * 0.5 + 2) * 3, 6.2 + lift, Math.sin(t * 0.5 + 2) * 2 - 1);
            sat.rotation.set(t * 0.4, t * 0.7, 0.3);
            sD.forEach((d, i) => {
                TMP.q.identity(); TMP.sc.setScalar(d.s * (0.6 + 0.4 * Math.sin(t * 2 + d.ph)));
                stars.setMatrixAt(i, TMP.m4.compose(d.p, TMP.q, TMP.sc));
            });
            stars.instanceMatrix.needsUpdate = true;
        });
    },

    /* 용기사 김민채 — 머리 위를 크게 도는 블록 용(몸통 마디가 머리를 따라옴), 가끔 불을 뿜음, 손에 든 창 */
    dragonKnight({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const scaleM = new THREE.MeshStandardMaterial({ color: 0x1f7a4a, roughness: 0.5, metalness: 0.2, emissive: pick(0), emissiveIntensity: 0.12 });
        const bellyM = new THREE.MeshStandardMaterial({ color: 0xd9c27a, roughness: 0.6 });
        const hornM = new THREE.MeshStandardMaterial({ color: 0xeae2cc, roughness: 0.4 });
        // 창 (캐릭터 오른손)
        const lance = new THREE.Group();
        const shaft = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x5a3a22 })); shaft.scale.set(0.14, 5.2, 0.14); lance.add(shaft);
        const tip = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xd5dce6, metalness: 0.85, roughness: 0.2 })); tip.scale.set(0.3, 1.1, 0.12); tip.position.y = 3.0; lance.add(tip);
        const ribbon = new THREE.Mesh(BOX, glowMat(pick(1), 0.9)); ribbon.scale.set(0.5, 0.25, 0.04); ribbon.position.set(0.3, 2.3, 0); lance.add(ribbon);
        lance.position.set(0, -1.9, 0.2); lance.rotation.x = 0.1;
        attach(dummy.armL, lance);
        // 용
        const SEG = 14;
        const head = new THREE.Group();
        const skull = new THREE.Mesh(BOX, scaleM); skull.scale.set(1.3, 1.0, 1.6); head.add(skull);
        const snout = new THREE.Mesh(BOX, scaleM); snout.scale.set(0.9, 0.55, 1.1); snout.position.set(0, -0.15, 1.2); head.add(snout);
        const jaw = new THREE.Mesh(BOX, bellyM); jaw.scale.set(0.8, 0.22, 1.1); jaw.position.set(0, -0.5, 1.0); head.add(jaw);
        for (const s of [-1, 1]) {
            const h = new THREE.Mesh(BOX, hornM); h.scale.set(0.18, 0.18, 1.2); h.position.set(s * 0.45, 0.55, -0.6); h.rotation.x = 0.5; head.add(h);
            const e = new THREE.Mesh(BOX, glowMat(pick(1), 1)); e.scale.set(0.2, 0.12, 0.1); e.position.set(s * 0.45, 0.15, 0.82); head.add(e);
        }
        const fire = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.9), 18); fire.userData.noFit = true;
        head.userData.noFit = true;
        group.add(head, fire);
        const segs = [];
        for (let i = 0; i < SEG; i++) {
            const s = new THREE.Group();
            const k = 1 - i / SEG;
            const b = new THREE.Mesh(BOX, scaleM); b.scale.set(1.0 * k + 0.25, 0.9 * k + 0.25, 1.0); s.add(b);
            const bl = new THREE.Mesh(BOX, bellyM); bl.scale.set(0.8 * k + 0.2, 0.2, 0.95); bl.position.y = -0.45 * k - 0.1; s.add(bl);
            const sp = new THREE.Mesh(BOX, hornM); sp.scale.set(0.12, 0.35 * k + 0.1, 0.3); sp.position.y = 0.5 * k + 0.15; s.add(sp);
            if (i === 3) for (const sd of [-1, 1]) {
                const wing = new THREE.Group(); wing.position.x = sd * 0.5;
                const wm = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x2a8a5a, roughness: 0.6, side: THREE.DoubleSide, emissive: pick(0), emissiveIntensity: 0.1 }));
                wm.scale.set(3.2, 0.06, 1.6); wm.position.x = sd * 1.6; wing.add(wm);
                s.add(wing); s.userData.wing = s.userData.wing || []; s.userData.wing.push({ wing, sd });
            }
            s.userData.noFit = true;
            group.add(s); segs.push(s);
        }
        const path = (u, out) => out.set(Math.cos(u) * 6.5, 7.2 + Math.sin(u * 2) * 1.0, Math.sin(u) * 4.0 - 2.5);
        const p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const u = t * 0.45;
            path(u, head.position); head.position.y += lift;
            path(u + 0.02, p1); p1.y += lift;
            head.lookAt(p1);
            segs.forEach((s, i) => {
                path(u - 0.13 * (i + 1), s.position); s.position.y += lift;
                path(u - 0.13 * (i + 1) + 0.02, p2); p2.y += lift;
                s.lookAt(p2);
                s.userData.wing?.forEach(({ wing, sd }) => { wing.rotation.z = sd * Math.sin(t * 4) * 0.5; });
            });
            jaw.rotation.x = 0;
            const breath = (t % 5) > 3.6 && (t % 5) < 4.6;
            jaw.position.y = breath ? -0.65 : -0.5;
            for (let i = 0; i < 18; i++) {
                const k = ((t * 3 + i / 18) % 1);
                if (breath) {
                    TMP.p.set(0, -0.2, 1.8 + k * 6).applyMatrix4(head.matrixWorld);
                    group.worldToLocal(TMP.p);
                    TMP.sc.setScalar(0.25 + k * 0.9);
                } else { TMP.p.set(0, -50, 0); TMP.sc.setScalar(0.0001); }
                TMP.q.setFromEuler(TMP.e.set(t * 5 + i, t * 3, 0));
                fire.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            fire.instanceMatrix.needsUpdate = true;
        });
    },

    /* 명예와 영광 김민채 — 거대한 판금 갑옷 기사. 어깨에 멘 큰 전투 망치, 왼팔로 펼치는 빛의 방패벽,
       붉은 망토, 6초마다 망치를 높이 들어 땅을 내리쳐 앞으로 갈라지는 충격파 */
    crusader({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        dummy.torso.scale.set(1.25, 1.05, 1.3);
        const steel = new THREE.MeshStandardMaterial({ color: 0xd4d9e2, metalness: 0.35, roughness: 0.32, emissive: 0x1a1c22, emissiveIntensity: 0.4 });
        const darkSteel = new THREE.MeshStandardMaterial({ color: 0x7a808c, metalness: 0.35, roughness: 0.4 });
        const key = new THREE.PointLight(0xfff2d6, 4, 14, 1.6); key.userData.own = true; key.position.set(1.5, 7, 6); group.add(key);
        const gold = solidMat(new THREE.Color('#ffc94d'), 0.35);
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 투구: 통짜 + 가운데 세로 볏 + 가로 눈 틈
        attach(dummy.head, box(steel, 1.42, 1.36, 1.38, 0, 0.02, 0));
        attach(dummy.head, box(gold, 0.16, 0.5, 1.5, 0, 0.82, -0.05));
        attach(dummy.head, box(new THREE.MeshBasicMaterial({ color: 0x000000 }), 1.0, 0.14, 0.05, 0, 0.12, 0.7));
        attach(dummy.head, box(glowMat(pick(1), 1), 0.7, 0.05, 0.05, 0, 0.12, 0.72));
        attach(dummy.head, box(gold, 1.44, 0.1, 1.4, 0, -0.35, 0));
        // 가슴판, 어깨 갑옷
        attach(dummy.torso, box(steel, 2.12, 2.1, 1.16, 0, 0, 0));
        attach(dummy.torso, box(gold, 0.5, 0.5, 0.06, 0, 0.35, 0.6));
        attach(dummy.torso, box(gold, 2.14, 0.12, 1.18, 0, -0.75, 0));
        for (const [arm, s] of [[dummy.armL, -1], [dummy.armR, 1]]) {
            const pa = new THREE.Group();
            pa.add(box(steel, 1.5, 0.45, 1.5, s * 0.15, 0.28, 0));
            pa.add(box(steel, 1.35, 0.4, 1.35, s * 0.2, -0.05, 0));
            pa.add(box(gold, 1.52, 0.08, 1.52, s * 0.15, 0.5, 0));
            attach(arm, pa);
            attach(arm, box(darkSteel, 1.12, 0.9, 1.12, 0, -1.5, 0));
        }
        for (const leg of [dummy.legL, dummy.legR]) { attach(leg, box(steel, 1.06, 1.1, 1.08, 0, -1.3, 0.02)); attach(leg, box(darkSteel, 1.1, 0.35, 1.3, 0, -1.85, 0.1)); }
        // 망토
        const cape = new THREE.Group(); cape.position.set(0, 3.9, -0.7);
        const capeM = new THREE.MeshStandardMaterial({ color: 0x8a1420, roughness: 0.7, side: THREE.DoubleSide });
        const capeSegs = [];
        for (let i = 0; i < 6; i++) { const c = box(capeM, 2.4 + i * 0.12, 0.62, 0.06, 0, -0.3 - i * 0.6, 0); cape.add(c); capeSegs.push(c); }
        group.add(cape);
        // 전투 망치 (캐릭터 오른손)
        const hammer = new THREE.Group();
        hammer.add(box(new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.6 }), 0.2, 4.4, 0.2, 0, 1.4, 0));
        const head = new THREE.Group(); head.position.y = 3.7;
        head.add(box(steel, 2.0, 1.2, 1.2, 0, 0, 0));
        head.add(box(gold, 2.04, 0.18, 1.24, 0, 0.35, 0)); head.add(box(gold, 2.04, 0.18, 1.24, 0, -0.35, 0));
        head.add(box(darkSteel, 0.3, 1.0, 1.0, 1.15, 0, 0)); head.add(box(darkSteel, 0.3, 1.0, 1.0, -1.15, 0, 0));
        const core = box(glowMat(pick(1), 1), 0.4, 0.4, 1.26, 0, 0, 0); head.add(core);
        hammer.add(head);
        hammer.position.set(0, -1.9, 0.1);
        attach(dummy.armL, hammer);
        // 빛의 방패벽 (네모 판 격자)
        const shield = new THREE.Group(); shield.position.set(1.6, 2.6, 2.4); shield.rotation.y = -0.35;
        const tiles = [];
        for (let x = -3; x <= 3; x++) for (let y = -2; y <= 2; y++) {
            const tl = new THREE.Mesh(BOX, glowMat(pick(1), 0.18)); tl.scale.set(0.62, 0.62, 0.04); tl.position.set(x * 0.66, y * 0.66, 0);
            tl.userData.d = Math.hypot(x, y); shield.add(tl); tiles.push(tl);
        }
        const rimS = square(4.7, 0.08, glowMat(pick(1), 0.9)); rimS.rotation.x = Math.PI / 2; rimS.scale.set(1, 1, 3.4 / 4.7); shield.add(rimS);
        const crest = box(glowMat(pick(0), 0.8), 0.6, 0.6, 0.06, 0, 0, 0.04); crest.rotation.z = Math.PI / 4; shield.add(crest);
        shield.userData.noFit = true;
        group.add(shield);
        // 충격파 (앞으로 갈라지며 솟는 돌)
        const RK = 16;
        const rocks = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9, emissive: pick(0), emissiveIntensity: 0.25 }), RK);
        rocks.userData.noFit = true; group.add(rocks);
        const ringW = square(1, 0.1, glowMat(pick(0), 0)); ringW.userData.noFit = true; group.add(ringW);
        // 뒤의 깃발 두 개
        for (const s of [-1, 1]) {
            const b = new THREE.Group(); b.position.set(s * 3.4, 0, -3); b.userData.noFit = true;
            b.add(box(darkSteel, 0.14, 7, 0.14, 0, 3.5, 0));
            b.add(box(capeM, 1.4, 3.0, 0.05, 0, 5.2, 0.1));
            b.add(box(gold, 0.6, 0.6, 0.06, 0, 5.6, 0.14));
            group.add(b);
        }
        const CYC = 6;
        let slamN = -1, sk = 1;
        sig.raiseK = 0; sig.slamK = 0; sig.shieldK = 0;
        tick((t, dt) => {
            const c = t % CYC, n = Math.floor(t / CYC);
            // 0~1.6 방패 올림, 1.6~3.0 망치 들기, 3.0~3.25 내리침, 3.25~4.2 버팀, 이후 원위치
            sig.shieldK = c < 0.4 ? c / 0.4 : c < 1.6 ? 1 : c < 2.0 ? 1 - (c - 1.6) / 0.4 : 0;
            sig.raiseK = c >= 1.6 && c < 3.0 ? Math.min(1, (c - 1.6) / 1.0) : 0;
            sig.slamK = c >= 3.0 && c < 4.2 ? 1 : c >= 4.2 && c < 4.8 ? 1 - (c - 4.2) / 0.6 : 0;
            if (n !== slamN && c >= 3.15) { slamN = n; sk = 0; stage.shake(0.6); stage.flash(0.45); }
            // 망치 각도 (팔 기준): 평소엔 머리를 앞 바닥에 세워 두고, 들 땐 머리 뒤로, 내리칠 땐 앞 바닥으로
            const REST = 2.7, UP = 1.63, SLAM = 3.39;
            // (y 로 90도 돌려 망치 머리의 넓은 면이 내려치는 방향을 향하게)
            hammer.rotation.set(sig.slamK > 0 ? REST + (SLAM - REST) * sig.slamK : REST + (UP - REST) * sig.raiseK, Math.PI / 2, 0);
            tiles.forEach(tl => {
                const on = sig.shieldK > tl.userData.d / 4;
                tl.material.opacity = on ? 0.16 + 0.08 * Math.sin(t * 4 + tl.userData.d) : 0;
            });
            rimS.children.forEach(m => { m.material.opacity = 0.9 * sig.shieldK; });
            crest.material.opacity = 0.8 * sig.shieldK;
            shield.visible = sig.shieldK > 0.01;
            core.material.opacity = 0.6 + 0.4 * Math.max(sig.raiseK, Math.sin(t * 3) * 0.5 + 0.5);
            capeSegs.forEach((cs, i) => { cs.rotation.x = 0.15 + Math.sin(t * 2 - i * 0.6) * 0.08 * (i + 1) / 3; cs.position.z = -i * 0.08; });
            cape.position.y = 3.9 + dummy.root.position.y;
            if (sk < 1) {
                sk = Math.min(1, sk + dt * 1.2);
                for (let i = 0; i < RK; i++) {
                    const along = 1.2 + i * 0.5;
                    const show = sk * 10 > i * 0.5;
                    const h = show ? Math.max(0, Math.sin(Math.min(1, sk * 10 - i * 0.5) * Math.PI)) * (0.6 + (i % 3) * 0.3) * (1 - sk) * 2 : 0;
                    TMP.p.set(Math.sin(i * 2.1) * 0.4 - 0.6, h / 2, along);
                    TMP.q.setFromEuler(TMP.e.set(i, i * 2, 0.3)); TMP.sc.set(0.5, Math.max(0.001, h), 0.5);
                    rocks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
                rocks.instanceMatrix.needsUpdate = true;
                rocks.visible = true;
                ringW.visible = true; ringW.position.set(-0.6, 0.05, 1.4); ringW.scale.setScalar(0.5 + sk * 7);
                ringW.children.forEach(m => { m.material.opacity = 1 - sk; });
            } else { rocks.visible = false; ringW.visible = false; }
        });
    },

    /* 저거너트 김민채 — 붉은 균열이 맥동하는 검은 강철 중갑, 등 뒤에 같은 동작을 하는 거대한 붉은 환영,
       '검이라 부르기엔 너무 큰' 철판 대검. 5초마다 대검을 머리 위로 들어 내려찍으면
       땅이 갈라져 용암이 솟고, 붉은 번개가 떨어지고, 충격파와 바위가 터져 나감 */
    juggernaut({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, rand, bolt, mini, TMP } = kit;
        stage.setSky('#0b0304');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        dummy.torso.scale.set(1.35, 1.08, 1.4);
        dummy.legL.scale.set(1.18, 1, 1.18); dummy.legR.scale.set(1.18, 1, 1.18);
        const iron = new THREE.MeshStandardMaterial({ color: 0x3c3f49, metalness: 0.5, roughness: 0.45 });
        const ironEdge = new THREE.MeshStandardMaterial({ color: 0x7a7d88, metalness: 0.5, roughness: 0.3 });
        const seam = glowMat(pick(0), 0.7);            // 갑옷 틈의 붉은 빛
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        const key = new THREE.PointLight(0xffe0d0, 12, 14, 1.6); key.userData.own = true; key.position.set(-1.5, 6, 4); group.add(key);
        const back = new THREE.PointLight(pick(0), 14, 12, 1.5); back.userData.own = true; back.position.set(0, 3, -2.5); group.add(back);

        // 투구: 통투구 + 이마 뿔 두 개 + T자 눈 틈
        attach(dummy.head, box(iron, 1.46, 1.42, 1.44, 0, 0.02, 0));
        attach(dummy.head, box(ironEdge, 1.5, 0.14, 1.48, 0, 0.42, 0));
        attach(dummy.head, box(ironEdge, 0.16, 1.0, 1.5, 0, 0.1, 0.02));
        for (const s of [-1, 1]) {
            const h = new THREE.Group(); h.position.set(s * 0.5, 0.75, 0.1);
            for (let k = 0; k < 4; k++) { const b = box(k === 3 ? seam : iron, 0.26 - k * 0.05, 0.4, 0.26 - k * 0.05, s * k * 0.12, k * 0.32, -k * 0.08); b.rotation.z = -s * 0.35; h.add(b); }
            attach(dummy.head, h);
        }
        const slit = glowMat(pick(0), 1);
        attach(dummy.head, box(slit, 1.0, 0.1, 0.05, 0, 0.14, 0.74));
        attach(dummy.head, box(slit, 0.1, 0.5, 0.05, 0, -0.1, 0.74));
        // 몸통 겹판 + 붉은 틈
        attach(dummy.torso, box(iron, 2.16, 2.12, 1.2, 0, 0, 0));
        const seams = [];
        for (let i = 0; i < 4; i++) {
            attach(dummy.torso, box(ironEdge, 2.18, 0.1, 1.22, 0, 0.75 - i * 0.45, 0));
            const sm = box(seam, 2.1, 0.04, 1.24, 0, 0.53 - i * 0.45, 0); attach(dummy.torso, sm); seams.push(sm);
        }
        const core = box(glowMat(pick(0), 1), 0.36, 0.36, 0.06, 0, 0.3, 0.62); core.rotation.z = Math.PI / 4; attach(dummy.torso, core);
        // 어깨 (겹겹 + 가시)
        for (const [arm, s] of [[dummy.armL, -1], [dummy.armR, 1]]) {
            for (let k = 0; k < 3; k++) attach(arm, box(k % 2 ? ironEdge : iron, 1.75 - k * 0.15, 0.4, 1.75 - k * 0.15, s * (0.25 - k * 0.05), 0.35 - k * 0.32, 0));
            for (let k = 0; k < 3; k++) { const sp = box(ironEdge, 0.18, 0.55, 0.18, s * 0.55, 0.75, -0.5 + k * 0.5); sp.rotation.z = -s * 0.4; attach(arm, sp); }
            attach(arm, box(seam, 1.6, 0.04, 1.6, s * 0.2, 0.2, 0));
            attach(arm, box(iron, 1.18, 1.1, 1.18, 0, -1.4, 0));
            const chain = new THREE.Group(); chain.position.set(0, -1.8, 0.3);
            for (let k = 0; k < 4; k++) { const l = box(ironEdge, 0.18, 0.32, 0.06, 0, -k * 0.28, 0); l.rotation.y = k % 2 ? Math.PI / 2 : 0; chain.add(l); }
            attach(arm, chain);
        }
        for (const leg of [dummy.legL, dummy.legR]) { attach(leg, box(iron, 1.1, 1.3, 1.12, 0, -1.2, 0.02)); attach(leg, box(seam, 1.12, 0.04, 1.14, 0, -0.55, 0)); }
        // 너덜너덜한 망토
        const cloakM = new THREE.MeshStandardMaterial({ color: 0x1a0f0e, roughness: 0.95, side: THREE.DoubleSide });
        const cloak = new THREE.Group(); cloak.position.set(0, 4.0, -0.8);
        const strips = [];
        for (let i = 0; i < 7; i++) {
            const st = new THREE.Group(); st.position.x = -1.2 + i * 0.4;
            const len = rand(2.4, 3.8);
            st.add(box(cloakM, 0.42, len, 0.05, 0, -len / 2, 0));
            st.add(box(seam, 0.42, 0.05, 0.06, 0, -len, 0));
            cloak.add(st); strips.push(st);
        }
        group.add(cloak);
        // 철판 대검: 자루를 쥔 손에서 +y 방향으로 칼날
        function makeSlab(scale = 1, ghostMat = null) {
            const g = new THREE.Group();
            const bm = ghostMat || new THREE.MeshStandardMaterial({ color: 0x5a5c66, metalness: 0.5, roughness: 0.45 });
            const em = ghostMat || ironEdge;
            g.add(box(bm, 1.0, 6.4, 0.26, 0, 3.6, 0));
            g.add(box(em, 0.12, 6.2, 0.3, 0.48, 3.6, 0), box(em, 0.12, 6.2, 0.3, -0.48, 3.6, 0));
            g.add(box(em, 1.5, 0.3, 0.4, 0, 0.35, 0));
            g.add(box(ghostMat || new THREE.MeshStandardMaterial({ color: 0x2a1a12 }), 0.24, 1.3, 0.24, 0, -0.4, 0));
            g.scale.setScalar(scale);
            return g;
        }
        const sword = makeSlab();
        const glowEdgeM = glowMat(pick(0), 0.3);
        sword.add(box(glowEdgeM, 0.08, 6.2, 0.32, 0.55, 3.6, 0), box(glowEdgeM, 0.08, 6.2, 0.32, -0.55, 3.6, 0));
        sword.position.set(0, -1.9, 0.15);
        attach(dummy.armL, sword);

        // 등 뒤의 거대한 붉은 환영 (같은 동작)
        const ghostM = new THREE.MeshBasicMaterial({ color: pick(0), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
        const phantom = mini(0x000000, { scale: 1.55 });
        phantom.root.traverse(o => { if (o.isMesh) o.material = ghostM; });
        phantom.root.position.set(0, -0.5, -6.5);
        phantom.root.userData.noFit = true;
        const pEyes = box(glowMat(pick(0), 1), 0.9, 0.12, 0.1, 0, 0.12, 0.62); phantom.head.add(pEyes);
        const pSword = makeSlab(1, ghostM); pSword.position.set(0, -1.9, 0.15); phantom.armL.add(pSword);
        group.add(phantom.root);

        // 바닥 균열 (평소엔 은은, 내려찍으면 확 타오름)
        const cracks = [];
        for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2 + rand(-0.2, 0.2), len = rand(2, 5);
            const c = box(glowMat(pick(1), 0.3), len, 0.04, 0.12, Math.cos(a) * (len / 2 + 1.2), 0.03, Math.sin(a) * (len / 2 + 1.2) + 1.2);
            c.rotation.y = -a; c.userData.noFit = true; group.add(c); cracks.push(c);
        }
        // 용암 분출 / 바위 / 충격파 / 번개
        const LAVA = 30;
        const lava = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.95), LAVA);
        const lD = Array.from({ length: LAVA }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3() }));
        lava.userData.noFit = true; group.add(lava);
        const RK = 18;
        const rocks = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x3a302c, roughness: 0.9, emissive: pick(0), emissiveIntensity: 0.3 }), RK);
        rocks.userData.noFit = true; group.add(rocks);
        const waves = [0, 1].map(i => { const r = square(1, 0.12, glowMat(pick(i), 0)); r.userData.noFit = true; group.add(r); return r; });
        const bolts = [0, 1, 2, 3].map(() => { const b = bolt(9, glowMat(pick(0), 1)); b.userData.noFit = true; b.visible = false; group.add(b); return b; });
        // 몸에서 피어오르는 기운 + 검은 연기
        const AU = 60;
        const aura = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.6), AU);
        const auD = Array.from({ length: AU }, () => ({ a: rand(0, 6.3), r: rand(0.6, 2.0), y: rand(0, 7), v: rand(1.2, 2.8), s: rand(0.12, 0.32) }));
        group.add(aura);
        const smoke = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0x050203, transparent: true, opacity: 0.55, depthWrite: false }), 24);
        const smD = Array.from({ length: 24 }, () => ({ a: rand(0, 6.3), r: rand(0.8, 2.4), y: rand(0, 6), v: rand(0.6, 1.2) }));
        smoke.userData.noFit = true; group.add(smoke);
        // 내려찍는 세로 궤적
        const ARC = 22;
        const arc = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.9), ARC);
        arc.userData.noFit = true; group.add(arc);

        const CYC = 5;
        let slamN = -1, ik = 1;
        sig.raiseK = 0; sig.slamK = 0; sig.rage = 0;
        // 칼 각도 (팔 기준): 평소엔 어깨에 걸침, 들 땐 등 뒤로 늘어뜨림, 내려찍을 땐 앞 바닥으로
        const REST = -0.05, UP = 0.79, SLAM = 3.24;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = t % CYC, n = Math.floor(t / CYC);
            // 0~1.4 숨 고르기, 1.4~2.4 들어올림, 2.4~2.55 내려찍기, 2.55~3.6 버팀, 3.6~4.3 원위치
            sig.raiseK = c >= 1.4 && c < 2.4 ? (c - 1.4) / 1.0 : c >= 2.4 && c < 2.55 ? 1 : 0;
            sig.slamK = c >= 2.4 && c < 2.55 ? (c - 2.4) / 0.15 : c >= 2.55 && c < 3.6 ? 1 : c >= 3.6 && c < 4.3 ? 1 - (c - 3.6) / 0.7 : 0;
            if (c >= 2.4) sig.raiseK = 0;
            const wpn = sig.slamK > 0 ? REST + (SLAM - REST) * sig.slamK : REST + (UP - REST) * sig.raiseK;
            // 칼날(얇은 쪽)이 내려찍는 방향으로 가게 세움. 정면에서도 넓적함이 보이도록 살짝만 비틈
            sword.rotation.set(wpn, Math.PI / 2 - 0.35, 0);
            pSword.rotation.set(wpn, Math.PI / 2 - 0.35, 0);
            if (n !== slamN && c >= 2.55) {
                slamN = n; ik = 0;
                stage.shake(0.9); stage.flash(0.7);
                lD.forEach(d => { d.p.set(rand(-1.5, 1.5), 0.1, rand(2.5, 4.5)); d.v.set(rand(-3, 3), rand(5, 11), rand(-2, 3)); });
                bolts.forEach(b => { const x = rand(-6, 6), z = rand(-5, 2); b.reshape([x + rand(-2, 2), 16, z], [x, 0, z], 1.2); b.visible = true; });
            }
            sig.rage = ik < 1 ? 1 - ik : Math.max(0, sig.raiseK);
            const rage = sig.rage;
            // 환영도 같은 자세
            const armX = sig.slamK > 0 ? -1.0 + (-1.2 + 1.0) * sig.slamK : -1.0 + (-3.0 + 1.0) * sig.raiseK;
            phantom.armL.rotation.set(armX, 0, 0.3); phantom.armR.rotation.set(sig.raiseK > 0 || sig.slamK > 0 ? armX : -0.3, 0, -0.3);
            phantom.root.rotation.x = sig.slamK * 0.3;
            phantom.root.position.y = -0.5 + Math.sin(t * 0.8) * 0.15 + lift * 0.5;
            ghostM.opacity = 0.08 + rage * 0.14 + Math.sin(t * 2) * 0.02;
            // 갑옷 틈 맥동
            const pulse = 0.45 + 0.25 * Math.sin(t * 3) + rage * 0.5;
            seam.opacity = Math.min(1, pulse);
            glowEdgeM.opacity = 0.25 + sig.raiseK * 0.5 + rage * 0.4;
            core.scale.set(0.36 * (1 + rage * 0.5), 0.36 * (1 + rage * 0.5), 0.06);
            back.intensity = 10 + rage * 20;
            cracks.forEach((cr, i) => { cr.material.opacity = 0.25 + 0.1 * Math.sin(t * 2 + i) + rage * 0.7; });
            // 내려찍기 효과
            if (ik < 1) {
                ik = Math.min(1, ik + dt * 0.9);
                lD.forEach((d, i) => {
                    TMP.p.set(d.p.x + d.v.x * ik, Math.max(0, d.p.y + d.v.y * ik - 9 * ik * ik), d.p.z + d.v.z * ik);
                    TMP.q.setFromEuler(TMP.e.set(ik * 9 + i, ik * 5, 0)); TMP.sc.setScalar(0.28 * (1 - ik));
                    lava.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                });
                lava.instanceMatrix.needsUpdate = true; lava.visible = true;
                for (let i = 0; i < RK; i++) {
                    const along = 1.5 + i * 0.45;
                    const show = ik * 9 > i * 0.4;
                    const h = show ? Math.max(0, Math.sin(Math.min(1, ik * 9 - i * 0.4) * Math.PI)) * (0.8 + (i % 3) * 0.5) * (1 - ik) * 2.4 : 0;
                    TMP.p.set(Math.sin(i * 2.1) * 0.6, h / 2, along);
                    TMP.q.setFromEuler(TMP.e.set(i, i * 2, 0.3)); TMP.sc.set(0.6, Math.max(0.001, h), 0.6);
                    rocks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
                rocks.instanceMatrix.needsUpdate = true; rocks.visible = true;
                waves.forEach((w, i) => {
                    w.visible = true; w.position.set(0, 0.06, 2.5);
                    w.scale.setScalar(0.5 + ik * (i ? 7 : 11));
                    w.children.forEach(m => { m.material.opacity = (1 - ik) * (i ? 0.7 : 1); });
                });
                bolts.forEach(b => { b.visible = ik < 0.25 && Math.random() > 0.3; });
            } else { lava.visible = rocks.visible = false; waves.forEach(w => { w.visible = false; }); bolts.forEach(b => { b.visible = false; }); }
            // 세로 궤적
            const sw = c >= 2.4 && c < 3.0 ? (c - 2.4) / 0.6 : -1;
            for (let i = 0; i < ARC; i++) {
                const a = -0.4 + (i / ARC) * 2.2;
                const vis = sw >= 0 && i / ARC < Math.min(1, sw * 4);
                const fade = vis ? 1 - sw : 0;
                TMP.p.set(-0.9, 3.6 + lift + Math.cos(a) * 4.2, 0.3 + Math.sin(a) * 4.2);
                TMP.q.setFromEuler(TMP.e.set(-a, 0, 0));
                TMP.sc.set(0.5 * fade + 0.0001, 0.08 * fade + 0.0001, 0.9);
                arc.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            arc.instanceMatrix.needsUpdate = true;
            auD.forEach((d, i) => {
                d.y += d.v * dt * (1 + rage); if (d.y > 7) d.y = 0;
                const k = d.y / 7;
                TMP.p.set(Math.cos(d.a + t * 0.5) * d.r * (1 - k * 0.4), d.y + lift, Math.sin(d.a + t * 0.5) * d.r * (1 - k * 0.4));
                TMP.q.setFromEuler(TMP.e.set(t + i, t * 2, 0)); TMP.sc.setScalar(d.s * (1 - k) * (1 + rage * 0.6));
                aura.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            aura.instanceMatrix.needsUpdate = true;
            smD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 6) d.y = 0;
                const k = d.y / 6;
                TMP.p.set(Math.cos(d.a - t * 0.3) * d.r, d.y + lift, Math.sin(d.a - t * 0.3) * d.r - 0.4);
                TMP.q.setFromEuler(TMP.e.set(i, t, 0)); TMP.sc.setScalar(0.3 + k * 0.7);
                smoke.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            smoke.instanceMatrix.needsUpdate = true;
            cloak.position.y = 4.0 + lift;
            strips.forEach((st, i) => { st.rotation.x = 0.2 + Math.sin(t * 1.8 + i) * 0.12 + rage * 0.5; st.rotation.z = Math.sin(t * 1.3 + i * 2) * 0.05; });
        });
    },

    /* 그림자 사냥꾼 박지성 — 양손 단검, 바닥에서 꿈틀대며 솟는 그림자 촉수, 보랏빛 눈 */
    shadowHunter({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, sword, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        for (const arm of [dummy.armL, dummy.armR]) { const d = kit.heldSword(1.2, null, pick(0), 0.16, true); d.position.set(0, -1.95, 0); d.rotation.x = Math.PI - 0.2; attach(arm, d); }
        const eye = new THREE.Mesh(BOX, glowMat(pick(0), 1)); eye.scale.set(0.95, 0.1, 0.05); eye.position.set(0, 0.1, 0.63); attach(dummy.head, eye);
        const shadowM = new THREE.MeshStandardMaterial({ color: 0x1a0b2e, roughness: 0.8, emissive: pick(0), emissiveIntensity: 0.35 });
        const tents = [];
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + 0.3;
            let parent = new THREE.Group(); parent.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
            group.add(parent);
            const segs = [];
            for (let k = 0; k < 8; k++) {
                const s = new THREE.Group();
                const m = new THREE.Mesh(BOX, k === 7 ? glowMat(pick(0), 1) : shadowM); m.scale.setScalar(0.42 - k * 0.04); m.position.y = 0.28; s.add(m);
                s.position.y = k ? 0.42 - k * 0.02 : 0;
                parent.add(s); parent = s; segs.push(s);
            }
            tents.push({ segs, ph: rand(0, 6) });
        }
        tick(t => {
            tents.forEach(({ segs, ph }) => segs.forEach((s, k) => { s.rotation.z = Math.sin(t * 2 + ph + k * 0.6) * 0.32; s.rotation.x = Math.cos(t * 1.6 + ph + k * 0.5) * 0.25; }));
            eye.material.opacity = 0.7 + 0.3 * Math.sin(t * 6);
        });
    },

    /* 네온 라이더 김가은 — 뒤의 줄무늬 네모 태양, 앞으로 흘러오는 네온 격자 바닥, 네온 고글, 스쳐 가는 속도선 */
    neonRider({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#0a0218');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const goggle = new THREE.Mesh(BOX, glowMat(pick(1), 0.95)); goggle.scale.set(1.3, 0.28, 0.06); goggle.position.set(0, 0.12, 0.64); attach(dummy.head, goggle);
        const sun = new THREE.Group(); sun.position.set(0, 5.5, -9); sun.userData.noFit = true;
        for (let i = 0; i < 9; i++) {
            const k = i / 8;
            const w = 6 * Math.sqrt(1 - Math.pow((i - 4) / 4.6, 2));
            const c = new THREE.Color(pick(0)).lerp(new THREE.Color(pick(1)), k);
            const b = new THREE.Mesh(BOX, glowMat(c, 0.9)); b.scale.set(w, 0.6 - k * 0.3, 0.1); b.position.y = 2.4 - i * 0.62; sun.add(b);
        }
        group.add(sun);
        const lines = [];
        for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(BOX, glowMat(pick(0), 0.8)); l.scale.set(0.05, 0.02, 30); l.position.set((i - 4) * 1.4, 0.02, -8); l.userData.noFit = true; group.add(l); }
        for (let i = 0; i < 10; i++) { const l = new THREE.Mesh(BOX, glowMat(pick(0), 0.8)); l.scale.set(12, 0.02, 0.05); l.userData.noFit = true; group.add(l); lines.push(l); }
        const SP = 18;
        const speed = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.85), SP);
        const sD = Array.from({ length: SP }, () => ({ x: rand(-4, 4), y: rand(0.5, 6), z: rand(-12, 6), v: rand(14, 26) }));
        group.add(speed);
        tick((t, dt) => {
            lines.forEach((l, i) => { l.position.set(0, 0.02, ((i * 1.6 + t * 4) % 16) - 13); });
            sD.forEach((d, i) => {
                d.z += d.v * dt; if (d.z > 7) { d.z = -12; d.x = rand(-4, 4); }
                TMP.p.set(d.x, d.y, d.z); TMP.q.identity(); TMP.sc.set(0.04, 0.04, 1.6);
                speed.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            speed.instanceMatrix.needsUpdate = true;
            sun.position.y = 5.5 + Math.sin(t * 0.5) * 0.15;
        });
    },

    /* 강령술사 김티비 — 손 위에 펼쳐진 마도서, 초록 영혼 불꽃, 무덤에서 기어 올라오는 해골 졸개들, 도는 영혼 */
    necromancer({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, mini, rand, TMP } = kit;
        stage.setSky('#030a06');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const hood = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x141a16, roughness: 0.9 })); hood.scale.set(1.4, 1.36, 1.4); hood.position.set(0, 0.08, -0.06); attach(dummy.head, hood);
        const eyes = new THREE.Mesh(BOX, glowMat(pick(0), 1)); eyes.scale.set(0.9, 0.12, 0.05); eyes.position.set(0, 0.08, 0.66); attach(dummy.head, eyes);
        const book = new THREE.Group(); book.position.set(0, -2.15, 0.6);
        const cover = new THREE.MeshStandardMaterial({ color: 0x3a1f2a, roughness: 0.6 });
        for (const s of [-1, 1]) { const c = new THREE.Mesh(BOX, cover); c.scale.set(0.7, 0.05, 0.9); c.position.x = s * 0.36; c.rotation.z = s * 0.25; book.add(c); }
        const pages = new THREE.Mesh(BOX, glowMat(pick(1), 0.9)); pages.scale.set(1.2, 0.06, 0.8); pages.position.y = 0.06; book.add(pages);
        attach(dummy.armR, book);
        // 무덤 + 해골
        const stone = new THREE.MeshStandardMaterial({ color: 0x4a4f54, roughness: 0.9 });
        const boneM = new THREE.MeshStandardMaterial({ color: 0xe7e2cf, roughness: 0.7, emissive: pick(0), emissiveIntensity: 0.08 });
        const minions = [];
        [[-2.8, -0.6], [2.8, -0.6], [-1.8, -2.6], [1.8, -2.6]].forEach(([x, z], i) => {
            const tomb = new THREE.Mesh(BOX, stone); tomb.scale.set(0.9, 1.3, 0.25); tomb.position.set(x, 0.65, z - 0.7); tomb.rotation.z = (i % 2 ? 1 : -1) * 0.1; group.add(tomb);
            const m = mini(0xe7e2cf, { scale: 0.42 });
            m.root.traverse(o => { if (o.isMesh) o.material = boneM; });
            const e = new THREE.Mesh(BOX, glowMat(pick(0), 1)); e.scale.set(0.9, 0.15, 0.1); e.position.set(0, 0.1, 0.62); m.head.add(e);
            m.root.position.set(x, 0, z); m.root.rotation.y = Math.atan2(-x, 2 - z) * 0.4;
            m.root.userData.noFit = true;
            group.add(m.root); minions.push({ m, ph: i * 0.7 });
        });
        const F = 40;
        const flames = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.8), F);
        const fD = Array.from({ length: F }, () => ({ a: rand(0, 6.3), r: rand(0.5, 3), y: rand(0, 4), v: rand(0.8, 1.8) }));
        group.add(flames);
        const W = 5;
        const wisps = new THREE.InstancedMesh(BOX, glowMat(pick(1), 1), W * 6);
        group.add(wisps);
        sig.castK = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = t % 6;
            sig.castK = c < 0.6 ? c / 0.6 : c < 2.4 ? 1 : c < 3 ? 1 - (c - 2.4) / 0.6 : 0;
            minions.forEach(({ m, ph }, i) => {
                const k = Math.min(1, Math.max(0, (c - 0.4 - i * 0.25) / 1.2));
                const down = c > 5.2 ? (c - 5.2) / 0.8 : 0;
                m.root.position.y = -2.4 + 2.4 * (1 - Math.pow(1 - k, 3)) - down * 2.4;
                m.armL.rotation.x = -1.4 + Math.sin(t * 3 + ph) * 0.3; m.armR.rotation.x = -1.4 + Math.sin(t * 3 + ph + 1) * 0.3;
                m.root.rotation.z = Math.sin(t * 2 + ph) * 0.08;
            });
            fD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 4) d.y = 0;
                const k = d.y / 4;
                TMP.p.set(Math.cos(d.a + t * 0.4) * d.r, d.y, Math.sin(d.a + t * 0.4) * d.r);
                TMP.q.setFromEuler(TMP.e.set(0, t + i, 0.78)); TMP.sc.setScalar(0.22 * (1 - k));
                flames.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            flames.instanceMatrix.needsUpdate = true;
            for (let w = 0; w < W; w++) for (let k = 0; k < 6; k++) {
                const a = t * 1.4 + (w / W) * Math.PI * 2 - k * 0.12;
                TMP.p.set(Math.cos(a) * 2.4, 3 + lift + Math.sin(a * 2 + w) * 0.8, Math.sin(a) * 2.4);
                TMP.q.identity(); TMP.sc.setScalar(0.2 * (1 - k / 6));
                wisps.setMatrixAt(w * 6 + k, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            wisps.instanceMatrix.needsUpdate = true;
            pages.material.opacity = 0.6 + 0.4 * sig.castK;
            book.rotation.y = Math.sin(t) * 0.1;
        });
    },

    /* 기계 천사 김민채 — 펼쳤다 접히는 강철 깃털 날개, 머리 위 톱니 후광, 주위를 돌며 바닥을 겨누는 드론 */
    mechAngel({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        const steel = new THREE.MeshStandardMaterial({ color: 0xd8dde6, metalness: 0.5, roughness: 0.3 });
        const wings = [];
        for (const s of [-1, 1]) {
            const w = new THREE.Group(); w.position.set(s * 0.6, 4.0, -0.7);
            const feathers = [];
            for (let i = 0; i < 7; i++) {
                const f = new THREE.Group();
                const plate = new THREE.Mesh(BOX, steel); plate.scale.set(0.34, 3.4 - i * 0.25, 0.1); plate.position.y = (3.4 - i * 0.25) / 2; f.add(plate);
                const line = new THREE.Mesh(BOX, glowMat(pick(0), 0.9)); line.scale.set(0.06, 3.2 - i * 0.25, 0.12); line.position.set(s * 0.12, (3.4 - i * 0.25) / 2, 0); f.add(line);
                w.add(f); feathers.push(f);
            }
            const thr = new THREE.Mesh(BOX, glowMat(pick(1), 0.9)); thr.scale.set(0.3, 0.3, 0.6); thr.position.set(0, -0.1, -0.3); w.add(thr);
            group.add(w); wings.push({ w, s, feathers, thr });
        }
        const halo = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const g = new THREE.Group(); const a = (i / 8) * Math.PI * 2;
            for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(BOX, solidMat(pick(1), 0.6)); b.scale.set(0.34, 0.1, 0.1); b.rotation.z = k * Math.PI / 2; g.add(b); }
            g.position.set(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9); halo.add(g);
        }
        group.add(halo);
        const drones = [0, 1, 2].map(i => {
            const d = new THREE.Group();
            const b = new THREE.Mesh(BOX, steel); b.scale.set(0.5, 0.25, 0.5); d.add(b);
            const e = new THREE.Mesh(BOX, glowMat(pick(0), 1)); e.scale.set(0.2, 0.1, 0.1); e.position.z = 0.26; d.add(e);
            const beam = new THREE.Mesh(BOX, glowMat(pick(0), 0.7)); beam.userData.noFit = true; group.add(beam);
            group.add(d); return { d, beam, ph: i * 2.1 };
        });
        tick((t) => {
            const lift = dummy.root.position.y;
            const open = 0.5 + 0.5 * Math.sin(t * 0.9);
            wings.forEach(({ w, s, feathers, thr }) => {
                w.position.y = 4.0 + lift;
                feathers.forEach((f, i) => { f.rotation.z = -s * (0.25 + i * (0.12 + open * 0.13)); f.rotation.x = Math.sin(t * 2 + i) * 0.04; });
                thr.material.opacity = 0.5 + 0.5 * Math.random();
            });
            halo.position.set(0, 6.0 + lift, -0.2); halo.rotation.y = t * 1.2;
            halo.children.forEach((g, i) => { g.rotation.y = -t * 3 + i; });
            drones.forEach(({ d, beam, ph }) => {
                const a = t * 0.8 + ph;
                d.position.set(Math.cos(a) * 3.2, 4.2 + lift + Math.sin(t * 2 + ph) * 0.4, Math.sin(a) * 2.2);
                d.lookAt(0, 0, 0);
                const fire = Math.sin(t * 1.5 + ph) > 0.85;
                beam.visible = fire;
                if (fire) {
                    const tx = Math.cos(a) * 1.5, tz = Math.sin(a) * 1.2;
                    TMP.v.set(tx, 0, tz).sub(d.position);
                    const len = TMP.v.length();
                    beam.scale.set(0.06, 0.06, len);
                    beam.position.copy(d.position).addScaledVector(TMP.v, 0.5);
                    beam.lookAt(tx, 0, tz);
                }
            });
        });
    },

    /* 블랙홀 공병은 — 머리 위의 검은 사건의 지평선, 빛이 휘는 고리, 안으로 빨려 드는 강착원반, 끌려가는 파편 */
    blackHole({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#020108');
        const hole = new THREE.Group(); hole.userData.noFit = true;
        const core = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 })); core.scale.setScalar(2.2); hole.add(core);
        const rings = [0, 1, 2].map(i => { const r = square(3.0 + i * 0.6, 0.08, glowMat(i === 1 ? pick(1) : pick(0), 0.9)); r.rotation.x = Math.PI / 2 + (i - 1) * 0.3; hole.add(r); return r; });
        group.add(hole);
        const D = 140;
        const disk = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.9), D);
        disk.userData.noFit = true;
        const dD = Array.from({ length: D }, () => ({ a: rand(0, 6.3), r: rand(1.8, 6), s: rand(0.06, 0.18) }));
        const ca = new THREE.Color(pick(0)), cb = new THREE.Color(pick(1));
        dD.forEach((d, i) => disk.setColorAt(i, ca.clone().lerp(cb, Math.random())));
        group.add(disk);
        const DEB = 18;
        const debris = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x5a5a6a, roughness: 0.8 }), DEB);
        const deb = Array.from({ length: DEB }, () => ({ p: new THREE.Vector3(rand(-8, 8), rand(0, 2), rand(-4, 4)), k: rand(0, 1) }));
        debris.userData.noFit = true; group.add(debris);
        const C = new THREE.Vector3();
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            C.set(0, 7.2 + lift * 0.5, -3.2);
            hole.position.copy(C);
            core.rotation.set(t * 0.3, t * 0.5, 0);
            rings.forEach((r, i) => { r.rotation.y = t * (0.4 + i * 0.3) * (i % 2 ? -1 : 1); r.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.04); });
            dD.forEach((d, i) => {
                d.r -= dt * (0.35 + 1.6 / d.r); if (d.r < 1.6) { d.r = rand(5, 6.5); d.a = rand(0, 6.3); }
                d.a += dt * (3.5 / d.r);
                TMP.p.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r * 0.22, Math.sin(d.a) * d.r * 0.5).add(C);
                TMP.q.setFromEuler(TMP.e.set(0, -d.a, 0)); TMP.sc.set(d.s * 2.4, d.s * 0.5, d.s);
                disk.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            disk.instanceMatrix.needsUpdate = true;
            deb.forEach((d, i) => {
                d.k += dt * 0.18; if (d.k > 1) { d.k = 0; d.p.set(rand(-8, 8), rand(0, 2), rand(-4, 4)); }
                const e = d.k * d.k;
                TMP.p.lerpVectors(d.p, C, e);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t * 3, 0)); TMP.sc.setScalar(0.35 * (1 - e));
                debris.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            debris.instanceMatrix.needsUpdate = true;
        });
    },

    /* 불사조 김가은 — 등 뒤의 거대한 불꽃 날개(깃털 블록), 늘어진 꼬리 깃털, 피어오르는 불씨, 6초마다 재에서 다시 타오르는 불꽃 고리 */
    phoenix({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#120402');
        const wings = [];
        for (const s of [-1, 1]) {
            const w = new THREE.Group(); w.position.set(s * 0.5, 3.9, -0.7);
            const fs = [];
            for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) {
                const k = i / 5;
                const c = new THREE.Color(pick(0)).lerp(new THREE.Color(pick(1)), row / 2);
                const f = new THREE.Mesh(BOX, glowMat(c, 0.85 - row * 0.15));
                const len = 1.6 + (5 - i) * 0.25 + row * 0.6;
                f.scale.set(len, 0.3, 0.06);
                f.position.set(s * (0.6 + i * 0.6 + len / 2 * 0.3), 1.2 - row * 0.55 - i * 0.08, -row * 0.05);
                f.rotation.z = s * (0.5 - k * 0.9) - row * s * 0.2;
                w.add(f); fs.push(f);
            }
            group.add(w); wings.push({ w, s });
        }
        const tail = [];
        for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(BOX, glowMat(pick(i % 2), 0.8)); f.scale.set(0.2, 2.6 + i * 0.3, 0.05); group.add(f); tail.push(f); }
        const E = 50;
        const embers = new THREE.InstancedMesh(BOX, glowMat(pick(1), 1), E);
        const eD = Array.from({ length: E }, () => ({ x: rand(-4, 4), z: rand(-3, 2), y: rand(0, 9), v: rand(1, 2.6) }));
        group.add(embers);
        const ring = square(1, 0.12, glowMat(pick(0), 0)); ring.userData.noFit = true; group.add(ring);
        const ring2 = square(1, 0.06, glowMat(pick(1), 0)); ring2.userData.noFit = true; group.add(ring2);
        let rebN = -1, rk = 1;
        sig.flapK = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const flap = Math.sin(t * 2.4);
            sig.flapK = flap;
            wings.forEach(({ w, s }) => { w.position.y = 3.9 + lift; w.rotation.z = s * flap * 0.25; w.rotation.y = -s * (0.3 + flap * 0.15); });
            tail.forEach((f, i) => { f.position.set((i - 2) * 0.3, 1.3 + lift - i * 0.1, -0.9 - i * 0.05); f.rotation.x = 0.4 + Math.sin(t * 2 + i) * 0.1; f.rotation.z = (i - 2) * 0.12; });
            eD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 9) d.y = 0;
                TMP.p.set(d.x + Math.sin(t + i) * 0.4, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t * 3 + i, t, 0)); TMP.sc.setScalar(0.09 * (1 - d.y / 9) + 0.02);
                embers.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            embers.instanceMatrix.needsUpdate = true;
            const n = Math.floor(t / 6);
            if (n !== rebN && t % 6 > 0.2) { rebN = n; rk = 0; stage.flash(0.35); }
            if (rk < 1) {
                rk = Math.min(1, rk + dt * 0.9);
                ring.visible = ring2.visible = true;
                ring.position.set(0, 0.06, 0); ring2.position.set(0, 0.06, 0);
                ring.scale.setScalar(0.6 + rk * 8); ring2.scale.setScalar(0.3 + rk * 5);
                ring.children.forEach(m => { m.material.opacity = 1 - rk; }); ring2.children.forEach(m => { m.material.opacity = 1 - rk; });
            } else ring.visible = ring2.visible = false;
        });
    },

    /* 성운의 주인 박지성 — 뒤에 떠다니는 분홍·파랑 성운, 별을 이어 그린 별자리, 바닥에서 도는 두 팔 은하, 별 왕관 */
    nebula({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#03020c');
        const clouds = [];
        for (let i = 0; i < 12; i++) {
            const c = new THREE.Mesh(BOX, glowMat(pick(i % 3), 0.07));
            c.scale.set(rand(3, 6), rand(2, 4), rand(1, 2));
            c.position.set(rand(-8, 8), rand(3, 11), rand(-12, -6));
            c.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
            c.userData = { noFit: true, sp: rand(-0.1, 0.1) };
            group.add(c); clouds.push(c);
        }
        // 별자리 (사자자리 비슷한 꺾인 선)
        const pts = [[-3.2, 9.5], [-1.6, 10.4], [0, 9.8], [1.2, 10.8], [2.8, 10.2], [3.6, 8.8], [2.0, 8.2], [0.4, 8.6]].map(([x, y]) => new THREE.Vector3(x, y, -5));
        const starsG = new THREE.Group(); starsG.userData.noFit = true; group.add(starsG);
        const stars = pts.map((p, i) => { const s = new THREE.Mesh(BOX, glowMat(pick(2), 1)); s.scale.setScalar(0.28); s.position.copy(p); s.rotation.z = Math.PI / 4; starsG.add(s); return s; });
        const links = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1];
            const l = new THREE.Mesh(BOX, glowMat(pick(1), 0.6));
            const len = a.distanceTo(b);
            l.scale.set(len, 0.04, 0.04); l.position.copy(a).add(b).multiplyScalar(0.5);
            l.rotation.z = Math.atan2(b.y - a.y, b.x - a.x);
            starsG.add(l); links.push(l);
        }
        // 은하
        const G = 160;
        const gal = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.9), G);
        const ca = new THREE.Color(pick(0)), cb = new THREE.Color(pick(1)), cw = new THREE.Color('#ffffff');
        const gD = Array.from({ length: G }, (_, i) => { const arm = i % 2, r = Math.pow(Math.random(), 0.7) * 4.5 + 0.4; return { arm, r, off: rand(-0.3, 0.3) }; });
        gD.forEach((d, i) => gal.setColorAt(i, (d.r < 1.2 ? cw : d.arm ? ca : cb).clone().lerp(cw, Math.random() * 0.3)));
        gal.userData.noFit = true; group.add(gal);
        const crown = new THREE.Group();
        const cr = square(1.1, 0.06, glowMat(pick(2), 1)); crown.add(cr);
        for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(BOX, glowMat(pick(i % 2), 1)); s.scale.setScalar(0.18); const a = (i / 4) * Math.PI * 2; s.position.set(Math.cos(a) * 0.55, 0.35, Math.sin(a) * 0.55); s.rotation.z = Math.PI / 4; crown.add(s); }
        group.add(crown);
        tick((t) => {
            const lift = dummy.root.position.y;
            clouds.forEach(c => { c.rotation.y += c.userData.sp * 0.016; c.material.opacity = 0.06 + 0.02 * Math.sin(t * 0.5 + c.position.x); });
            stars.forEach((s, i) => { s.scale.setScalar(0.22 + 0.1 * Math.sin(t * 3 + i * 1.3)); });
            links.forEach((l, i) => { l.material.opacity = 0.35 + 0.3 * Math.sin(t * 1.5 - i * 0.6); });
            gD.forEach((d, i) => {
                const a = d.r * 1.1 + d.arm * Math.PI + t * 0.35 + d.off;
                TMP.p.set(Math.cos(a) * d.r, 0.08 + Math.sin(i) * 0.05, Math.sin(a) * d.r);
                TMP.q.identity(); TMP.sc.setScalar(d.r < 1 ? 0.14 : 0.08);
                gal.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            gal.instanceMatrix.needsUpdate = true;
            crown.position.set(0, 5.7 + lift, 0); crown.rotation.y = t * 0.8;
        });
    },

    /* 얼음 여제 김티비 — 뒤의 얼음 왕좌, 얼음 왕관과 홀, 홀을 들면 둥글게 솟는 얼음 가시, 눈보라, 하늘의 오로라 */
    iceEmperor({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#020812');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const ice = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.75, emissive: pick(0), emissiveIntensity: 0.25 });
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 왕좌
        const throne = new THREE.Group(); throne.position.set(0, 0, -2.2); throne.userData.noFit = true;
        throne.add(box(ice, 3.6, 1.2, 2.2, 0, 0.6, 0));
        throne.add(box(ice, 3.6, 6.5, 0.6, 0, 3.6, -0.9));
        for (let i = 0; i < 5; i++) throne.add(box(ice, 0.45, 1.6 + Math.abs(2 - i) * -0.4 + 1.2, 0.45, -1.4 + i * 0.7, 7.2 - Math.abs(2 - i) * 0.3, -0.9));
        for (const s of [-1, 1]) throne.add(box(ice, 0.6, 2.2, 2.2, s * 2.1, 1.6, 0));
        group.add(throne);
        // 왕관 + 홀
        const crown = new THREE.Group(); crown.position.y = 0.7;
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const sp = box(ice, 0.16, 0.5 + (i % 2) * 0.35, 0.16, Math.cos(a) * 0.62, 0.2, Math.sin(a) * 0.62); crown.add(sp); }
        attach(dummy.head, crown);
        const scepter = new THREE.Group();
        scepter.add(box(solidMat(new THREE.Color('#9fd8ff'), 0.3), 0.14, 3.2, 0.14, 0, 1.0, 0));
        const gem = box(glowMat(pick(1), 1), 0.45, 0.45, 0.45, 0, 2.8, 0); gem.rotation.set(0.6, 0.6, 0); scepter.add(gem);
        scepter.position.set(0, -1.9, 0.2); scepter.rotation.x = Math.PI / 2 + 0.6;
        attach(dummy.armL, scepter);
        // 얼음 가시 고리
        const SPK = 18;
        const spikes = [];
        for (let i = 0; i < SPK; i++) {
            const a = (i / SPK) * Math.PI * 2;
            const sp = box(ice, 0.5, 1, 0.5, Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4 + 0.3);
            sp.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); sp.userData.noFit = true; sp.userData.h = rand(1.6, 3.2);
            group.add(sp); spikes.push(sp);
        }
        // 눈보라 + 오로라
        const SN = 70;
        const snow = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffffff'), 0.9), SN);
        const sD = Array.from({ length: SN }, () => ({ x: rand(-7, 7), y: rand(0, 10), z: rand(-5, 4), v: rand(2, 5) }));
        group.add(snow);
        const aur = [];
        for (let i = 0; i < 14; i++) { const a = new THREE.Mesh(BOX, glowMat(i % 2 ? pick(2) : pick(1), 0.07)); a.scale.set(0.9, 5, 0.1); a.position.set(-9 + i * 1.4, 13, -12); a.userData.noFit = true; group.add(a); aur.push(a); }
        sig.raiseK = 0;
        tick((t, dt) => {
            const c = t % 6;
            sig.raiseK = c < 0.6 ? c / 0.6 : c < 2.2 ? 1 : c < 2.8 ? 1 - (c - 2.2) / 0.6 : 0;
            spikes.forEach((sp, i) => {
                const k = Math.max(0, Math.min(1, (c - 0.6 - i * 0.03) / 0.3));
                const down = c > 3.6 ? Math.min(1, (c - 3.6) / 0.8) : 0;
                const h = sp.userData.h * k * (1 - down) + 0.001;
                sp.scale.y = h; sp.position.y = h / 2;
            });
            if (c > 0.6 && c < 0.65) { stage.shake(0.3); }
            sD.forEach((d, i) => {
                d.x += d.v * dt; d.y -= dt * 0.6; if (d.x > 7) { d.x = -7; d.y = rand(0, 10); } if (d.y < 0) d.y = 10;
                TMP.p.set(d.x, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t + i, t, 0)); TMP.sc.setScalar(0.06);
                snow.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            snow.instanceMatrix.needsUpdate = true;
            aur.forEach((a, i) => { a.position.y = 12 + Math.sin(t * 0.7 + i * 0.5) * 1.2; a.scale.y = 4 + Math.sin(t * 0.9 + i) * 1.5; a.material.opacity = 0.05 + 0.03 * Math.sin(t + i * 0.7); });
            gem.rotation.y = t * 1.5;
        });
    },

    /* 혼돈의 신 김가은 — 서로 다른 축으로 도는 세 겹 고리(색이 계속 바뀜), 공중에 뜬 깨진 바닥 조각,
       번쩍 나타났다 사라지는 글리치 큐브, 공간이 찢긴 틈, 그녀를 바라보는 눈들 */
    chaosGod({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, square, rand, TMP } = kit;
        stage.setSky('#05000a');
        const gyro = new THREE.Group(); group.add(gyro);
        const rings = [0, 1, 2].map(i => { const r = square(4.2 - i * 0.7, 0.1, glowMat(pick(i), 0.95)); gyro.add(r); return r; });
        const TILE = 22;
        const tiles = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x1a1428, roughness: 0.7, emissive: pick(0), emissiveIntensity: 0.12 }), TILE);
        const tD = Array.from({ length: TILE }, () => ({ a: rand(0, 6.3), r: rand(3.5, 6.5), y: rand(0.5, 7), s: rand(0.6, 1.4), sp: rand(0.1, 0.35), ph: rand(0, 6) }));
        tiles.userData.noFit = true; group.add(tiles);
        const GL = 20;
        const glitch = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.9), GL);
        const ca = new THREE.Color(pick(0)), cb = new THREE.Color(pick(1)), cc = new THREE.Color(pick(2));
        for (let i = 0; i < GL; i++) glitch.setColorAt(i, [ca, cb, cc][i % 3]);
        group.add(glitch);
        const tears = [0, 1, 2].map(i => {
            const g = new THREE.Group(); g.userData.noFit = true;
            const black = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x000000 })); black.scale.set(0.35, 3.2, 0.05); g.add(black);
            for (const s of [-1, 1]) { const e = new THREE.Mesh(BOX, glowMat(pick(0), 1)); e.scale.set(0.06, 3.3, 0.06); e.position.x = s * 0.2; g.add(e); }
            g.position.set((i - 1) * 4.5, 4 + (i % 2) * 2, -4 - (i % 2)); g.rotation.z = (i - 1) * 0.3;
            group.add(g); return g;
        });
        const eyes = [0, 1, 2, 3].map(i => {
            const g = new THREE.Group();
            const w = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xf2eef8, roughness: 0.4 })); w.scale.set(0.7, 0.45, 0.2); g.add(w);
            const iris = new THREE.Mesh(BOX, glowMat(pick(i % 3), 1)); iris.scale.set(0.25, 0.25, 0.22); iris.position.z = 0.02; g.add(iris);
            g.userData.ph = i * 1.57; group.add(g); return g;
        });
        const hsl = { h: 0, s: 1, l: 0.6 };
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            gyro.position.set(0, 3 + lift, 0);
            rings[0].rotation.set(t * 0.7, 0, t * 0.3);
            rings[1].rotation.set(Math.PI / 2, t * 0.9, 0);
            rings[2].rotation.set(t * 0.5, t * 1.1, Math.PI / 4);
            rings.forEach((r, i) => { r.children.forEach(m => m.material.color.setHSL(((t * 0.15) + i / 3) % 1, 1, 0.6)); });
            tD.forEach((d, i) => {
                const a = d.a + t * d.sp;
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t + d.ph) * 0.4, Math.sin(a) * d.r * 0.7 - 1.5);
                TMP.q.setFromEuler(TMP.e.set(Math.sin(t * 0.5 + d.ph) * 0.6, a, Math.cos(t * 0.4 + d.ph) * 0.6)); TMP.sc.set(d.s, 0.18, d.s);
                tiles.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            tiles.instanceMatrix.needsUpdate = true;
            for (let i = 0; i < GL; i++) {
                const slot = Math.floor(t * 8 + i * 7.3);
                const on = (slot * 9301 + 49297) % 233280 / 233280 > 0.5;
                const rx = Math.sin(slot * 12.9898) * 43758.5453 % 1, ry = Math.sin(slot * 78.233) * 12345.678 % 1;
                TMP.p.set(rx * 6, 1 + Math.abs(ry) * 7, -1 + (i % 4) - 1.5);
                TMP.q.identity(); TMP.sc.set(on ? 0.4 + Math.abs(rx) * 0.8 : 0.0001, on ? 0.12 : 0.0001, 0.12);
                glitch.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            glitch.instanceMatrix.needsUpdate = true;
            tears.forEach((g, i) => { g.scale.x = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.3 + i)); g.children[1].material.opacity = g.children[2].material.opacity = 0.7 + 0.3 * Math.sin(t * 7 + i); });
            eyes.forEach((g, i) => {
                const a = t * 0.25 + g.userData.ph;
                g.position.set(Math.cos(a) * 5.5, 6.5 + Math.sin(t * 0.6 + i) * 0.8 + lift, Math.sin(a) * 2.5 - 2.5);
                g.lookAt(0, 3 + lift, 0);
                const blink = (t + i * 1.7) % 5 > 4.85 ? 0.1 : 1;
                g.scale.set(1, blink, 1);
            });
        });
    },

    /* 태양왕 김건우 — 등 뒤에 떠오른 거대한 블록 태양, 사방으로 도는 햇살, 표면에서 솟았다 떨어지는 홍염,
       햇살 왕관과 황금 어깨 갑옷, 5초마다 태양 폭발 */
    sunKing({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#140602');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const gold = new THREE.MeshStandardMaterial({ color: 0xffc23d, metalness: 0.55, roughness: 0.3, emissive: 0x8a4a00, emissiveIntensity: 0.4 });
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 왕관 (햇살 모양)
        const crown = new THREE.Group(); crown.position.y = 0.72;
        crown.add(box(gold, 1.42, 0.22, 1.42, 0, 0, 0));
        for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.45 + (i / 8) * Math.PI * 0.9; const r = box(gold, 0.14, 0.6 + (i % 2) * 0.4, 0.1, Math.sin(a) * 0.7, 0.4 + Math.cos(a) * 0.2, 0.68); r.rotation.z = -a * 0.6; crown.add(r); }
        attach(dummy.head, crown);
        for (const [arm, s] of [[dummy.armL, -1], [dummy.armR, 1]]) { attach(arm, box(gold, 1.5, 0.4, 1.5, s * 0.15, 0.3, 0)); attach(arm, box(gold, 1.3, 0.3, 1.3, s * 0.2, 0, 0)); }
        attach(dummy.torso, box(gold, 2.12, 0.5, 1.14, 0, 0.75, 0));
        // 블록 태양
        const SUN = new THREE.Group(); SUN.position.set(0, 7.5, -7); SUN.userData.noFit = true;
        const R = 3.4, S = 0.6;
        const cells = [];
        for (let x = -R; x <= R; x += S) for (let y = -R; y <= R; y += S) for (let z = -R; z <= R; z += S) {
            const d = Math.hypot(x, y, z);
            if (d <= R && d > R - S * 1.1) cells.push([x, y, z]);
        }
        const sunMesh = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), cells.length);
        const c1 = new THREE.Color(pick(0)), c2 = new THREE.Color(pick(1));
        cells.forEach(([x, y, z], i) => { sunMesh.setMatrixAt(i, TMP.m4.compose(TMP.p.set(x, y, z), TMP.q.identity(), TMP.sc.setScalar(S * 0.96))); sunMesh.setColorAt(i, c1.clone().lerp(c2, Math.random())); });
        SUN.add(sunMesh);
        const RAYS = 16;
        const rays = new THREE.Group(); SUN.add(rays);
        for (let i = 0; i < RAYS; i++) { const a = (i / RAYS) * Math.PI * 2; const r = box(glowMat(i % 2 ? pick(0) : pick(1), 0.5), 0.25, i % 2 ? 4 : 6, 0.1, Math.cos(a) * (R + 2.5), Math.sin(a) * (R + 2.5), 0); r.rotation.z = a - Math.PI / 2; rays.add(r); }
        group.add(SUN);
        // 홍염 (태양 가장자리에서 솟는 고리)
        const FL = 3, FN = 14;
        const flare = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.9), FL * FN);
        flare.userData.noFit = true; SUN.add(flare);
        const flD = Array.from({ length: FL }, () => ({ a: rand(0, 6.3), k: rand(0, 1), v: rand(0.3, 0.5) }));
        // 열기 입자
        const HP = 40;
        const heat = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.8), HP);
        const hD = Array.from({ length: HP }, () => ({ x: rand(-4, 4), z: rand(-3, 2), y: rand(0, 8), v: rand(0.8, 2) }));
        group.add(heat);
        const pillars = [-1, 1].map(s => { const p = box(glowMat(pick(1), 0.15), 1.4, 14, 1.4, s * 3.4, 7, -2.5); p.userData.noFit = true; group.add(p); return p; });
        let flN = -1, fk = 1;
        sig.flareK = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            SUN.position.y = 7.5 + Math.sin(t * 0.4) * 0.2;
            sunMesh.rotation.y = t * 0.15; sunMesh.rotation.x = t * 0.07;
            rays.rotation.z = t * 0.2;
            rays.children.forEach((r, i) => { r.material.opacity = 0.3 + 0.25 * Math.sin(t * 2 + i) + (1 - fk) * 0.5; });
            flD.forEach((f, j) => {
                f.k += dt * f.v; if (f.k > 1) { f.k = 0; f.a = rand(0, 6.3); }
                for (let i = 0; i < FN; i++) {
                    const u = i / (FN - 1);
                    const arcA = u * Math.PI;
                    const h = Math.sin(arcA) * 2.4 * Math.sin(f.k * Math.PI);
                    const along = (u - 0.5) * 1.6;
                    const dirx = Math.cos(f.a), diry = Math.sin(f.a);
                    TMP.p.set(dirx * (R + h) - diry * along, diry * (R + h) + dirx * along, 0.2);
                    TMP.q.identity(); TMP.sc.setScalar(0.3 * Math.sin(f.k * Math.PI) + 0.01);
                    flare.setMatrixAt(j * FN + i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
                }
            });
            flare.instanceMatrix.needsUpdate = true;
            hD.forEach((d, i) => {
                d.y += d.v * dt; if (d.y > 8) d.y = 0;
                TMP.p.set(d.x + Math.sin(t * 2 + i) * 0.2, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(0, t + i, 0.78)); TMP.sc.setScalar(0.08 * (1 - d.y / 8) + 0.02);
                heat.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            heat.instanceMatrix.needsUpdate = true;
            const n = Math.floor(t / 5);
            if (n !== flN && t % 5 > 1.5) { flN = n; fk = 0; stage.flash(0.55); stage.shake(0.3); }
            if (fk < 1) fk = Math.min(1, fk + dt * 0.8);
            sig.flareK = 1 - fk;
            SUN.scale.setScalar(1 + (1 - fk) * 0.12);
            pillars.forEach((p, i) => { p.material.opacity = 0.1 + 0.05 * Math.sin(t * 1.5 + i) + (1 - fk) * 0.25; });
        });
    },

    /* 독수리 조련사 공병은 — 하늘을 크게 돌다가 팔 위로 내려앉는 블록 독수리, 깃털, 가죽 토시 */
    falconer({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const glove = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.8 })); glove.scale.set(1.12, 0.9, 1.12); glove.position.y = -1.45; attach(dummy.armR, glove);
        const brown = solidMat(new THREE.Color('#6b4426'), 0.15), white = solidMat(new THREE.Color('#f2efe6'), 0.15), beakM = solidMat(new THREE.Color('#ffc23d'), 0.4);
        const eagle = new THREE.Group();
        const b = (m, w, h, d, x, y, z, p = eagle) => { const o = new THREE.Mesh(BOX, m); o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o; };
        b(brown, 0.6, 0.55, 1.2, 0, 0, 0); b(white, 0.5, 0.48, 0.5, 0, 0.3, 0.7); b(beakM, 0.18, 0.16, 0.3, 0, 0.25, 1.05);
        b(brown, 0.5, 0.12, 0.6, 0, -0.05, -0.85);
        const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.3, 0.1, 0); b(brown, 1.8, 0.08, 0.7, s * 0.9, 0, 0, w); b(white, 0.4, 0.09, 0.5, s * 1.7, 0, -0.05, w); eagle.add(w); return { w, s }; });
        eagle.userData.noFit = true;
        group.add(eagle);
        const perch = new THREE.Object3D(); perch.position.set(0, -2.15, 0.1); attach(dummy.armR, perch);
        const F = 14;
        const feathers = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.8), F);
        const fD = Array.from({ length: F }, () => ({ x: rand(-4, 4), y: rand(0, 9), z: rand(-3, 2), v: rand(0.3, 0.7), ph: rand(0, 6) }));
        group.add(feathers);
        const wp = new THREE.Vector3(), nxt = new THREE.Vector3();
        sig.perchK = 0;
        tick((t, dt) => {
            const c = t % 8;
            // 0~5.5 하늘을 돎, 5.5~6.3 내려앉음, 6.3~7.6 팔 위, 7.6~8 날아오름
            perch.getWorldPosition(wp); group.worldToLocal(wp);
            const fly = (u, out) => out.set(Math.cos(u) * 5, 8 + Math.sin(u * 2) * 0.8, Math.sin(u) * 3 - 1);
            let flap = Math.sin(t * 8);
            if (c < 5.5) { fly(t * 0.9, eagle.position); fly(t * 0.9 + 0.05, nxt); eagle.lookAt(nxt); sig.perchK = 0; flap = Math.sin(t * 4) * 0.5; }
            else if (c < 6.3) { const k = (c - 5.5) / 0.8; fly(t * 0.9, nxt); eagle.position.lerpVectors(nxt, wp, k * k); eagle.lookAt(wp.x, wp.y, wp.z + 2); sig.perchK = k; }
            else if (c < 7.6) { eagle.position.copy(wp); eagle.position.y += 0.4; eagle.rotation.set(0, 0.3, 0); sig.perchK = 1; flap = c < 6.6 ? Math.sin(t * 10) : -0.6; }
            else { const k = (c - 7.6) / 0.4; eagle.position.copy(wp); eagle.position.y += 0.4 + k * 3; sig.perchK = 1 - k; }
            wings.forEach(({ w, s }) => { w.rotation.z = s * flap * 0.7; });
            fD.forEach((d, i) => {
                d.y -= d.v * dt; if (d.y < 0) d.y = 9;
                TMP.p.set(d.x + Math.sin(t + d.ph) * 0.6, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t + i, t * 0.7, i)); TMP.sc.set(0.08, 0.3, 0.02);
                feathers.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            feathers.instanceMatrix.needsUpdate = true;
        });
    },

    /* 사막의 공주 김티비 — 금빛 티아라와 베일, 발밑의 하늘을 나는 양탄자, 뒤에 떠 있는 계단식 피라미드, 모래 폭풍, 도는 황금 풍뎅이 */
    desertPrince({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#1a0d04');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const goldM = solidMat(new THREE.Color('#ffc857'), 0.45);
        const tiara = new THREE.Group(); tiara.position.y = 0.5;
        const band = new THREE.Mesh(BOX, goldM); band.scale.set(1.34, 0.12, 1.34); tiara.add(band);
        for (let i = -2; i <= 2; i++) { const p = new THREE.Mesh(BOX, goldM); p.scale.set(0.12, 0.22 + (2 - Math.abs(i)) * 0.12, 0.08); p.position.set(i * 0.22, 0.12 + (2 - Math.abs(i)) * 0.06, 0.66); tiara.add(p); }
        attach(dummy.head, tiara);
        const jewel = new THREE.Mesh(BOX, glowMat(pick(1), 1)); jewel.scale.set(0.2, 0.2, 0.06); jewel.position.set(0, 0.55, 0.72); jewel.rotation.z = Math.PI / 4; attach(dummy.head, jewel);
        const veil = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xffe9c2, roughness: 0.9, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); veil.scale.set(1.36, 2.2, 0.05); veil.position.set(0, -0.2, -0.72); attach(dummy.head, veil);
        const veilF = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0xffe9c2, transparent: true, opacity: 0.35 })); veilF.scale.set(0.9, 0.45, 0.04); veilF.position.set(0, -0.35, 0.64); attach(dummy.head, veilF);
        const carpet = new THREE.Group();
        const cm = [new THREE.MeshStandardMaterial({ color: 0x8a1a2a, roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: 0xd9a03a, roughness: 0.6 })];
        const strips = [];
        for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(BOX, cm[i % 2 ? 0 : 0]); s.scale.set(3.4, 0.08, 0.42); s.position.z = -1.5 + i * 0.42; carpet.add(s); strips.push(s); const tr = new THREE.Mesh(BOX, cm[1]); tr.scale.set(3.5, 0.09, 0.06); tr.position.z = s.position.z; carpet.add(tr); }
        group.add(carpet);
        const pyr = new THREE.Group(); pyr.position.set(0, 4, -9); pyr.userData.noFit = true;
        const sand = new THREE.MeshStandardMaterial({ color: 0xd9a75a, roughness: 0.9, emissive: pick(0), emissiveIntensity: 0.1 });
        for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(BOX, sand); l.scale.set(6 - i, 0.9, 6 - i); l.position.y = -2.25 + i * 0.9; pyr.add(l); }
        const cap = new THREE.Mesh(BOX, glowMat(pick(1), 1)); cap.scale.setScalar(0.8); cap.position.y = 3.1; pyr.add(cap);
        group.add(pyr);
        const SD = 90;
        const storm = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.6), SD);
        const sD = Array.from({ length: SD }, () => ({ a: rand(0, 6.3), r: rand(2, 5), y: rand(0, 7), sp: rand(0.8, 1.6) }));
        storm.userData.noFit = true; group.add(storm);
        const scarabs = [0, 1, 2, 3].map(i => { const s = new THREE.Group(); const b = new THREE.Mesh(BOX, solidMat(new THREE.Color('#ffc23d'), 0.6)); b.scale.set(0.4, 0.15, 0.5); s.add(b); const h = new THREE.Mesh(BOX, glowMat(pick(1), 1)); h.scale.set(0.2, 0.12, 0.15); h.position.z = 0.3; s.add(h); group.add(s); return s; });
        tick((t) => {
            const lift = dummy.root.position.y;
            carpet.position.set(0, 0.35 + lift + Math.sin(t * 1.5) * 0.1, 0.2);
            strips.forEach((s, i) => { s.position.y = Math.sin(t * 3 - i * 0.7) * 0.08; });
            pyr.rotation.y = t * 0.15; pyr.position.y = 4 + Math.sin(t * 0.5) * 0.2;
            sD.forEach((d, i) => {
                const a = d.a + t * d.sp;
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.2, Math.sin(a) * d.r * 0.7);
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0)); TMP.sc.set(0.03, 0.03, 0.4);
                storm.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            storm.instanceMatrix.needsUpdate = true;
            scarabs.forEach((s, i) => { const a = t * 1.3 + i * Math.PI / 2; s.position.set(Math.cos(a) * 2.2, 3 + lift + Math.sin(a * 2) * 0.4, Math.sin(a) * 2.2); s.rotation.y = -a; });
        });
    },

    /* 강철 골렘 박지성 — 등 뒤에 선 거대한 돌 골렘(가슴과 눈의 룬이 빛남), 주위를 도는 바위 조각, 바닥의 룬 고리 */
    golem({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, square, mini, rand, TMP } = kit;
        const stone = new THREE.MeshStandardMaterial({ color: 0x6a6660, roughness: 0.95 });
        const g = mini(0x6a6660, { scale: 1.15 });
        g.root.traverse(o => { if (o.isMesh) o.material = stone; });
        g.root.position.set(0, 0, -3.6); g.root.userData.noFit = true;
        g.torso.scale.set(1.4, 1, 1.3); g.armL.scale.set(1.3, 1.1, 1.3); g.armR.scale.set(1.3, 1.1, 1.3);
        const rune = glowMat(pick(0), 1);
        const core = new THREE.Mesh(BOX, rune); core.scale.set(0.7, 0.7, 0.1); core.position.set(0, 0.2, 0.56); core.rotation.z = Math.PI / 4; g.torso.add(core);
        const eyes = new THREE.Mesh(BOX, rune); eyes.scale.set(0.9, 0.14, 0.05); eyes.position.set(0, 0.1, 0.62); g.head.add(eyes);
        for (const arm of [g.armL, g.armR]) { const r = new THREE.Mesh(BOX, rune); r.scale.set(1.04, 0.1, 1.04); r.position.y = -1.0; arm.add(r); }
        group.add(g.root);
        const R = 10;
        const rocks = new THREE.InstancedMesh(BOX, stone, R);
        const rD = Array.from({ length: R }, (_, i) => ({ a: (i / R) * 6.3, r: rand(2.2, 3.2), y: rand(1, 5), s: rand(0.3, 0.6) }));
        group.add(rocks);
        const circle = [0, 1].map(i => { const c = square(3.6 + i * 1.2, 0.07, glowMat(pick(i), 0.8)); c.position.y = 0.05; c.rotation.y = i * Math.PI / 4; c.userData.noFit = true; group.add(c); return c; });
        let slamN = -1;
        sig.golemK = 0;
        tick((t) => {
            const c = t % 6, n = Math.floor(t / 6);
            const raise = c > 3 && c < 4.2 ? (c - 3) / 1.2 : 0, slam = c >= 4.2 && c < 4.6 ? 1 - (c - 4.2) / 0.4 : 0;
            g.armL.rotation.x = -0.2 - raise * 2.6 + (c >= 4.2 && c < 4.6 ? -2.8 * slam : 0);
            g.armR.rotation.x = g.armL.rotation.x;
            g.root.position.y = Math.sin(t * 0.8) * 0.05;
            g.head.rotation.y = Math.sin(t * 0.4) * 0.3;
            if (n !== slamN && c >= 4.2) { slamN = n; stage.shake(0.5); stage.flash(0.25); }
            const glow = 0.6 + 0.4 * Math.sin(t * 2) + (c >= 4.2 && c < 5 ? 0.5 : 0);
            rune.opacity = Math.min(1, glow);
            sig.golemK = raise;
            rD.forEach((d, i) => {
                const a = d.a + t * 0.5;
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.3, Math.sin(a) * d.r);
                TMP.q.setFromEuler(TMP.e.set(t * 0.5 + i, t * 0.3, i)); TMP.sc.setScalar(d.s);
                rocks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            rocks.instanceMatrix.needsUpdate = true;
            circle.forEach((cc, i) => { cc.rotation.y = i * Math.PI / 4 + t * (i ? -0.3 : 0.3); });
        });
    },

    /* 오로라 여왕 김가은 — 머리 위로 출렁이는 오로라 커튼, 몸을 감아 오르는 빛의 리본, 얼음 결정 왕관, 별가루 */
    auroraQueen({ group, tick, pick, dummy, kit, stage }) {
        const { THREE, BOX, glowMat, rand, TMP } = kit;
        stage.setSky('#020615');
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const crown = new THREE.Group(); crown.position.y = 0.72;
        for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(BOX, glowMat(pick(i % 3), 0.9)); c.scale.set(0.16, 0.45 + (i === 2 ? 0.35 : (i % 2) * 0.15), 0.16); c.position.set(-0.5 + i * 0.25, 0.25, 0.55); c.rotation.z = (i - 2) * 0.12; crown.add(c); }
        attach(dummy.head, crown);
        const CUR = 3, COL = 22;
        const cur = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffffff'), 0.22), CUR * COL);
        cur.userData.noFit = true;
        for (let c = 0; c < CUR; c++) for (let i = 0; i < COL; i++) cur.setColorAt(c * COL + i, new THREE.Color(pick(c % 3)));
        group.add(cur);
        const RB = 2, RN = 40;
        const ribbons = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffffff'), 0.85), RB * RN);
        for (let r = 0; r < RB; r++) for (let i = 0; i < RN; i++) ribbons.setColorAt(r * RN + i, new THREE.Color(pick(r)).lerp(new THREE.Color(pick(2)), i / RN));
        group.add(ribbons);
        const DS = 40;
        const dust = new THREE.InstancedMesh(BOX, glowMat(pick(2), 1), DS);
        const dD = Array.from({ length: DS }, () => ({ x: rand(-5, 5), y: rand(0, 10), z: rand(-5, 2), ph: rand(0, 6) }));
        group.add(dust);
        tick((t) => {
            const lift = dummy.root.position.y;
            for (let c = 0; c < CUR; c++) for (let i = 0; i < COL; i++) {
                const x = -10 + i * 0.95;
                const h = 3 + Math.sin(t * 0.8 + i * 0.4 + c) * 1.4;
                TMP.p.set(x, 10.5 + c * 0.6 + Math.sin(t * 0.6 + i * 0.3 + c * 2) * 0.8, -6 - c * 1.5 + Math.sin(t * 0.5 + i * 0.5) * 0.8);
                TMP.q.setFromEuler(TMP.e.set(0, Math.sin(t * 0.4 + i) * 0.3, 0)); TMP.sc.set(1.0, h, 0.1);
                cur.setMatrixAt(c * COL + i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            cur.instanceMatrix.needsUpdate = true;
            for (let r = 0; r < RB; r++) for (let i = 0; i < RN; i++) {
                const k = i / RN;
                const a = k * Math.PI * 4 + t * 1.6 + r * Math.PI;
                TMP.p.set(Math.cos(a) * (1.6 + k * 0.6), 0.3 + k * 6.2 + lift * 0.5, Math.sin(a) * (1.6 + k * 0.6));
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0.2)); TMP.sc.set(0.05, 0.22, 0.42);
                ribbons.setMatrixAt(r * RN + i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            ribbons.instanceMatrix.needsUpdate = true;
            dD.forEach((d, i) => {
                TMP.p.set(d.x, d.y + Math.sin(t * 0.5 + d.ph) * 0.3, d.z); TMP.q.setFromEuler(TMP.e.set(0, 0, 0.78)); TMP.sc.setScalar(0.06 + 0.05 * Math.sin(t * 3 + d.ph));
                dust.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            dust.instanceMatrix.needsUpdate = true;
        });
    },

    /* 벼락 신수 김민채 — 곁을 도는 거대한 블록 늑대(번개 무늬), 가끔 멈춰 하늘을 향해 울부짖으면 번개가 떨어짐 */
    thunderBeast({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, bolt, rand, TMP } = kit;
        const fur = new THREE.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.7, emissive: pick(0), emissiveIntensity: 0.08 });
        const light = glowMat(pick(0), 1);
        const wolf = new THREE.Group(); wolf.userData.noFit = true;
        const b = (m, w, h, d, x, y, z, p = wolf) => { const o = new THREE.Mesh(BOX, m); o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o; };
        b(fur, 1.5, 1.4, 3.2, 0, 2.0, 0);
        const head = new THREE.Group(); head.position.set(0, 2.9, 1.9); wolf.add(head);
        b(fur, 1.2, 1.0, 1.2, 0, 0, 0, head); b(fur, 0.7, 0.5, 0.9, 0, -0.2, 0.9, head);
        const jaw = b(fur, 0.65, 0.2, 0.8, 0, -0.5, 0.8, head);
        for (const s of [-1, 1]) { b(fur, 0.25, 0.5, 0.2, s * 0.4, 0.7, -0.2, head); b(light, 0.22, 0.1, 0.05, s * 0.3, 0.15, 0.62, head); }
        const legs = [[-0.5, 1.2], [0.5, 1.2], [-0.5, -1.2], [0.5, -1.2]].map(([x, z]) => { const l = new THREE.Group(); l.position.set(x, 1.4, z); b(fur, 0.45, 1.4, 0.45, 0, -0.7, 0, l); wolf.add(l); return l; });
        const tail = new THREE.Group(); tail.position.set(0, 2.4, -1.6); b(fur, 0.35, 0.35, 1.5, 0, 0, -0.7, tail); wolf.add(tail);
        for (let i = 0; i < 4; i++) { const s = b(light, 1.56, 0.08, 0.2, 0, 2.2 + (i % 2) * 0.3, -1.2 + i * 0.8); s.rotation.x = 0.4; }
        wolf.scale.setScalar(0.9);
        group.add(wolf);
        const bolts = [0, 1, 2].map(() => { const bo = bolt(8, glowMat(pick(1), 1)); bo.visible = false; bo.userData.noFit = true; group.add(bo); return bo; });
        const SP = 20;
        const sparks = new THREE.InstancedMesh(BOX, glowMat(pick(0), 1), SP);
        group.add(sparks);
        let howlN = -1;
        sig.howlK = 0;
        tick((t) => {
            const c = t % 7, n = Math.floor(t / 7);
            const howl = c > 4.5 && c < 6.2;
            const u = howl ? 4.5 * 0.55 : c * 0.55;
            const a = u + Math.floor(t / 7) * 1.2;
            wolf.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 2.6 - 1.2);
            wolf.rotation.y = -a + Math.PI;
            const run = howl ? 0 : 1;
            legs.forEach((l, i) => { l.rotation.x = run * Math.sin(t * 9 + (i % 2 ? Math.PI : 0) + (i > 1 ? 1 : 0)) * 0.6; });
            const hk = howl ? Math.sin(Math.min(1, (c - 4.5) / 0.5) * Math.PI / 2) : 0;
            head.rotation.x = -hk * 0.9; jaw.rotation.x = hk * 0.5; wolf.rotation.x = -hk * 0.15;
            tail.rotation.x = 0.3 + Math.sin(t * 6) * 0.2 * run;
            sig.howlK = hk;
            if (howl && n !== howlN && c > 4.9) { howlN = n; stage.shake(0.3); stage.flash(0.4); bolts.forEach(bo => { const x = rand(-5, 5), z = rand(-4, 2); bo.reshape([x, 14, z], [x + rand(-1, 1), 0, z], 1); bo.visible = true; }); }
            if (!howl || c > 5.4) bolts.forEach(bo => { bo.visible = false; });
            else bolts.forEach(bo => { bo.visible = Math.random() > 0.3; });
            for (let i = 0; i < SP; i++) {
                TMP.p.set(wolf.position.x + Math.sin(t * 13 + i) * 1.2, 1 + Math.abs(Math.sin(t * 7 + i * 3)) * 2.5, wolf.position.z + Math.cos(t * 11 + i) * 1.4);
                TMP.q.setFromEuler(TMP.e.set(t * 5 + i, t, 0)); TMP.sc.set(0.04, 0.3, 0.04);
                sparks.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            }
            sparks.instanceMatrix.needsUpdate = true;
        });
    },

    /* 운명의 직조자 김건우 — 뒤의 거대한 빛의 베틀(세로 실), 손끝에서 베틀로 이어진 실, 도는 운명의 바퀴, 실 위를 흐르는 빛 */
    fateWeaver({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, rand, TMP } = kit;
        stage.setSky('#07050f');
        const loom = new THREE.Group(); loom.position.set(0, 0, -4.5); loom.userData.noFit = true;
        const wood = solidMat(new THREE.Color('#c9a96e'), 0.25);
        const box = (m, w, h, d, x, y, z, p = loom) => { const o = new THREE.Mesh(BOX, m); o.scale.set(w, h, d); o.position.set(x, y, z); p.add(o); return o; };
        box(wood, 0.4, 10, 0.4, -5, 5, 0); box(wood, 0.4, 10, 0.4, 5, 5, 0); box(wood, 10.4, 0.4, 0.4, 0, 10, 0); box(wood, 10.4, 0.4, 0.4, 0, 0.6, 0);
        const T = 24;
        const threads = [];
        for (let i = 0; i < T; i++) { const th = box(glowMat(pick(i % 3), 0.5), 0.05, 9.2, 0.05, -4.6 + i * 0.4, 5.3, 0); threads.push(th); }
        const weft = [];
        for (let j = 0; j < 9; j++) { const w = box(glowMat(pick((j + 1) % 3), 0.0), 9.4, 0.08, 0.06, 0, 1.2 + j * 0.95, 0.05); weft.push(w); }
        group.add(loom);
        const wheel = new THREE.Group(); wheel.position.set(0, 8.4, -3.8); wheel.userData.noFit = true;
        for (let i = 0; i < 8; i++) { const sp = new THREE.Mesh(BOX, glowMat(pick(2), 0.9)); sp.scale.set(0.1, 2.6, 0.1); sp.rotation.z = (i / 8) * Math.PI; wheel.add(sp); }
        const rimW = kit.square(2.8, 0.1, glowMat(pick(0), 0.9)); rimW.rotation.x = Math.PI / 2; wheel.add(rimW);
        group.add(wheel);
        const links = [0, 1, 2, 3, 4, 5].map(i => { const l = new THREE.Mesh(BOX, glowMat(pick(i % 3), 0.7)); l.userData.noFit = true; group.add(l); return l; });
        const hands = [dummy.armL, dummy.armR].map(arm => { const h = new THREE.Object3D(); h.position.y = -2.0; arm.add(h); return h; });
        stage.onClear(() => { dummy.armL.remove(hands[0]); dummy.armR.remove(hands[1]); });
        const P = 30;
        const pulses = new THREE.InstancedMesh(BOX, glowMat(new THREE.Color('#ffffff'), 1), P);
        const pD = Array.from({ length: P }, () => ({ i: Math.floor(rand(0, T)), k: rand(0, 1), v: rand(0.2, 0.5) }));
        pulses.userData.noFit = true; group.add(pulses);
        const hp = new THREE.Vector3(), tp = new THREE.Vector3();
        tick((t, dt) => {
            const woven = (t * 0.6) % 10;
            weft.forEach((w, j) => { w.material.opacity = j < woven ? 0.7 : 0.05; });
            threads.forEach((th, i) => { th.position.x = -4.6 + i * 0.4 + Math.sin(t * 2 + i * 0.5) * 0.04; });
            wheel.rotation.z = t * 0.6;
            links.forEach((l, i) => {
                hands[i % 2].getWorldPosition(hp); group.worldToLocal(hp);
                tp.set(-4.6 + ((i * 4 + 2) % T) * 0.4, 3 + i * 0.9, -4.5);
                const len = hp.distanceTo(tp);
                l.scale.set(0.04, 0.04, len);
                l.position.copy(hp).add(tp).multiplyScalar(0.5);
                l.lookAt(tp);
                l.material.opacity = 0.5 + 0.3 * Math.sin(t * 3 + i);
            });
            pD.forEach((d, n) => {
                d.k += dt * d.v; if (d.k > 1) { d.k = 0; d.i = Math.floor(rand(0, T)); }
                TMP.p.set(-4.6 + d.i * 0.4, 0.8 + d.k * 9, -4.4); TMP.q.identity(); TMP.sc.setScalar(0.13);
                pulses.setMatrixAt(n, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            pulses.instanceMatrix.needsUpdate = true;
        });
    },

    /* 폭풍의 눈 공병은 — 거대한 태풍 한가운데 고요한 눈에 떠 있음. 둘레를 도는 구름 벽, 안쪽을 휘감는 바람,
       구름 속 번개, 휘말려 도는 파편. 6초마다 손을 들면 구름 벽에서 번개가 일제히 내리꽂힘 */
    stormEye({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, bolt, rand, TMP } = kit;
        stage.setSky('#05070d');
        const CL = 70;
        const cloud = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x3a4152, roughness: 0.95, emissive: pick(0), emissiveIntensity: 0.06 }), CL);
        const cD = Array.from({ length: CL }, (_, i) => ({ a: (i / CL) * Math.PI * 2 * 3, r: rand(6.5, 8.5), y: (i / CL) * 11 - 1, s: rand(1.4, 2.6) }));
        cloud.userData.noFit = true; group.add(cloud);
        const WN = 48;
        const wind = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.6), WN);
        const wD = Array.from({ length: WN }, () => ({ a: rand(0, 6.3), r: rand(2.5, 5.5), y: rand(0, 9), v: rand(1.2, 2.2) }));
        wind.userData.noFit = true; group.add(wind);
        const DB = 16;
        const debris = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 }), DB);
        const dD = Array.from({ length: DB }, () => ({ a: rand(0, 6.3), r: rand(3, 5.5), y: rand(1, 8), s: rand(0.25, 0.6), sp: rand(0.6, 1.1) }));
        debris.userData.noFit = true; group.add(debris);
        const flashes = Array.from({ length: 5 }, () => { const f = new THREE.Mesh(BOX, glowMat(pick(1), 0)); f.scale.set(3, 2, 3); f.userData.noFit = true; group.add(f); return f; });
        const bolts = Array.from({ length: 5 }, () => { const b = bolt(8, glowMat(pick(1), 1)); b.visible = false; b.userData.noFit = true; group.add(b); return b; });
        const calm = kit.square(2.6, 0.06, glowMat(pick(0), 0.8)); calm.position.y = 0.05; calm.userData.noFit = true; group.add(calm);
        let strikeN = -1, sk = 1;
        sig.callK = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            cD.forEach((d, i) => {
                // 구름 벽은 캐릭터 뒤쪽 반원에만 (앞에 있으면 화면을 가림). 양끝에서는 작아졌다 다시 나타남
                const u = ((d.a / (Math.PI * 2)) + t * 0.05) % 1;
                const a = Math.PI * (1.02 + u * 0.96);
                const edge = Math.min(1, u * 8, (1 - u) * 8);
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.5 + i) * 0.2, Math.sin(a) * d.r * 0.8 - 2);
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0)); TMP.sc.set(d.s * 1.4 * edge, d.s * 0.8 * edge, d.s * edge);
                cloud.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            cloud.instanceMatrix.needsUpdate = true;
            wD.forEach((d, i) => {
                d.y += d.v * dt * 0.6; if (d.y > 9) d.y = 0;
                const a = d.a + t * d.v;
                TMP.p.set(Math.cos(a) * d.r, d.y, Math.sin(a) * d.r - 1);
                TMP.q.setFromEuler(TMP.e.set(0, -a, 0.15)); TMP.sc.set(0.04, 0.04, 0.9);
                wind.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            wind.instanceMatrix.needsUpdate = true;
            dD.forEach((d, i) => {
                const a = d.a + t * d.sp;
                TMP.p.set(Math.cos(a) * d.r, d.y + Math.sin(t + i) * 0.4, Math.sin(a) * d.r - 1);
                TMP.q.setFromEuler(TMP.e.set(t * 2 + i, t, 0)); TMP.sc.setScalar(d.s);
                debris.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            debris.instanceMatrix.needsUpdate = true;
            flashes.forEach((f, i) => {
                const k = (t * 0.7 + i * 0.37) % 1.6;
                const a = i * 1.26 + t * 0.35;
                f.position.set(Math.cos(a) * 7.5, 2 + i * 1.8, Math.sin(a) * 7.5 - 1);
                f.material.opacity = k < 0.06 ? 0.5 : 0;
            });
            const c = t % 6, n = Math.floor(t / 6);
            sig.callK = c > 3.2 && c < 4.0 ? (c - 3.2) / 0.8 : c >= 4.0 && c < 4.8 ? 1 : c >= 4.8 && c < 5.4 ? 1 - (c - 4.8) / 0.6 : 0;
            if (n !== strikeN && c >= 4.0) {
                strikeN = n; sk = 0; stage.shake(0.5); stage.flash(0.5);
                bolts.forEach((b, i) => { const a = (i / 5) * Math.PI * 2 + rand(-0.3, 0.3); const r = rand(2.5, 4.5); b.reshape([Math.cos(a) * 7, 11, Math.sin(a) * 7 - 1], [Math.cos(a) * r, 0, Math.sin(a) * r - 1], 0.9); });
            }
            sk = Math.min(1, sk + dt * 2.5);
            bolts.forEach(b => { b.visible = sk < 1 && Math.random() > 0.25; });
            calm.rotation.y = t * 0.5; calm.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05 + sig.callK * 0.3);
        });
    },

    /* 가장 어두운 밤 김민채 — 저승의 왕. 검은 의복과 푸른 불꽃이 타오르는 어둠의 관, 손에 든 두 갈래 창,
       곁에 엎드린 머리 셋 달린 지옥의 개, 발밑을 흐르는 영혼의 강, 하늘의 검은 일식, 솟아오르는 망령들 */
    hades({ group, tick, pick, dummy, kit, stage, sig }) {
        const { THREE, BOX, glowMat, solidMat, square, mini, rand, TMP } = kit;
        stage.setSky('#010103');
        stage.setSkin({ color: '#9aa3ad', eye: pick(0).getStyle ? '#' + pick(0).getHexString() : '#5cf2ff', glowEyes: true, smile: false, emissive: 0.05 });
        const owned = [];
        const attach = (parent, obj) => { parent.add(obj); owned.push([parent, obj]); };
        stage.onClear(() => owned.forEach(([p, o]) => p.remove(o)));
        const robe = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.7, emissive: 0x0a1a3a, emissiveIntensity: 0.6 });
        const key = new THREE.PointLight(0xbfe8ff, 6, 14, 1.6); key.userData.own = true; key.position.set(1.5, 6.5, 5); group.add(key);
        const obsidian = new THREE.MeshStandardMaterial({ color: 0x15131c, metalness: 0.6, roughness: 0.25 });
        const gold = solidMat(new THREE.Color('#c9a24a'), 0.25);
        const fire = glowMat(pick(0), 0.9);
        const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };
        // 의복 + 금 장식
        attach(dummy.torso, box(robe, 2.14, 2.12, 1.16, 0, 0, 0));
        attach(dummy.torso, box(gold, 0.4, 2.14, 1.18, 0.55, 0, 0));
        for (const leg of [dummy.legL, dummy.legR]) attach(leg, box(robe, 1.06, 2.04, 1.08, 0, -1.0, 0));
        for (const arm of [dummy.armL, dummy.armR]) attach(arm, box(robe, 1.1, 1.6, 1.1, 0, -0.6, 0));
        // 어둠의 관 + 푸른 불꽃
        const crown = new THREE.Group(); crown.position.y = 0.7;
        crown.add(box(obsidian, 1.44, 0.2, 1.44, 0, 0, 0));
        const flames = [];
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2;
            crown.add(box(obsidian, 0.16, 0.5 + (i % 2) * 0.3, 0.16, Math.cos(a) * 0.62, 0.3, Math.sin(a) * 0.62));
            const f = box(fire, 0.2, 0.4, 0.2, Math.cos(a) * 0.62, 0.8 + (i % 2) * 0.3, Math.sin(a) * 0.62); crown.add(f); flames.push(f);
        }
        attach(dummy.head, crown);
        // 망토 (아래로 갈수록 연기처럼 사라짐)
        const cape = new THREE.Group(); cape.position.set(0, 4.0, -0.7);
        const capeSegs = [];
        for (let i = 0; i < 7; i++) { const c = box(new THREE.MeshBasicMaterial({ color: 0x050409, transparent: true, opacity: 1 - i * 0.12 }), 2.5 + i * 0.25, 0.6, 0.05, 0, -0.3 - i * 0.58, 0); cape.add(c); capeSegs.push(c); }
        group.add(cape);
        // 두 갈래 창 (캐릭터 오른손) — 손잡이를 쥐고 갈래가 +y
        const bident = new THREE.Group();
        bident.add(box(obsidian, 0.16, 6.2, 0.16, 0, 1.6, 0));
        bident.add(box(gold, 1.1, 0.16, 0.18, 0, 4.7, 0));
        for (const s of [-1, 1]) { bident.add(box(obsidian, 0.16, 1.3, 0.16, s * 0.48, 5.4, 0)); bident.add(box(fire, 0.2, 0.4, 0.2, s * 0.48, 6.2, 0)); }
        bident.position.set(0, -1.95, 0); bident.rotation.x = 0.3;
        attach(dummy.armL, bident);
        // 지옥의 개 (머리 셋)
        const dogM = new THREE.MeshStandardMaterial({ color: 0x2a2428, roughness: 0.6, emissive: 0x1a0505, emissiveIntensity: 0.5 });
        const dog = new THREE.Group(); dog.position.set(-2.9, 0, 1.2); dog.rotation.y = 0.55; dog.scale.setScalar(1.05); dog.userData.noFit = true;
        dog.add(box(dogM, 1.8, 1.4, 3.0, 0, 1.6, 0));
        for (const [x, z] of [[-0.6, 1.1], [0.6, 1.1], [-0.6, -1.1], [0.6, -1.1]]) dog.add(box(dogM, 0.5, 1.0, 0.5, x, 0.5, z));
        const heads = [];
        [-0.75, 0, 0.75].map((x, i) => {
            const h = new THREE.Group(); h.position.set(x, 2.6 + (i === 1 ? 0.2 : 0), 1.6); h.rotation.y = -x * 0.4;
            h.add(box(dogM, 0.75, 0.7, 0.85, 0, 0, 0)); h.add(box(dogM, 0.45, 0.35, 0.6, 0, -0.12, 0.6));
            h.add(box(glowMat(new THREE.Color('#ff3b2a'), 1), 0.55, 0.08, 0.05, 0, 0.12, 0.44));
            for (const s of [-1, 1]) h.add(box(dogM, 0.15, 0.35, 0.12, s * 0.25, 0.45, -0.15));
            const jaw = box(dogM, 0.42, 0.12, 0.55, 0, -0.35, 0.55); h.add(jaw);
            dog.add(h); heads.push({ h, jaw, ph: i * 1.3 });
        });
        const tail = box(dogM, 0.25, 0.25, 1.4, 0, 2.1, -2.0); tail.rotation.x = 0.6; dog.add(tail);
        group.add(dog);
        // 영혼의 강 (발밑을 흐르는 푸른 띠)
        const RV = 60;
        const river = new THREE.InstancedMesh(BOX, glowMat(pick(1), 0.55), RV);
        const rvD = Array.from({ length: RV }, () => ({ x: rand(-9, 9), z: rand(1.6, 3.6), s: rand(0.3, 1.0), v: rand(1.2, 2.4) }));
        river.userData.noFit = true; group.add(river);
        // 일식 (검은 네모 + 푸른 코로나)
        const ecl = new THREE.Group(); ecl.position.set(0, 10.5, -14); ecl.userData.noFit = true;
        ecl.add(box(new THREE.MeshBasicMaterial({ color: 0x000000 }), 4.6, 4.6, 0.3, 0, 0, 0.2));
        ecl.add(box(glowMat(pick(0), 0.5), 5.2, 5.2, 0.1, 0, 0, 0));
        const corona = new THREE.Group(); ecl.add(corona);
        for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const r = box(glowMat(pick(i % 2), 0.55), 0.18, i % 2 ? 2.2 : 3.6, 0.05, Math.cos(a) * (i % 2 ? 4.0 : 4.7), Math.sin(a) * (i % 2 ? 4.0 : 4.7), 0); r.rotation.z = a - Math.PI / 2; corona.add(r); }
        group.add(ecl);
        // 저승의 문 (두 기둥 위에 계단식 박공)
        const gate = new THREE.Group(); gate.position.set(0, 9, -4); gate.userData.noFit = true;
        for (let i = 0; i < 4; i++) gate.add(box(obsidian, 10.4 - i * 2.4, 0.5, 1.0, 0, i * 0.5, 0));
        gate.add(box(gold, 10.4, 0.12, 1.04, 0, -0.25, 0));
        group.add(gate);
        // 등 뒤의 거대한 저승왕 환영 (같은 동작)
        const ghostM = new THREE.MeshBasicMaterial({ color: pick(0), transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
        const phantom = mini(0x000000, { scale: 1.7 });
        phantom.root.traverse(o => { if (o.isMesh) o.material = ghostM; });
        phantom.root.position.set(0, -0.6, -7.5); phantom.root.userData.noFit = true;
        phantom.head.add(box(glowMat(pick(0), 1), 0.95, 0.14, 0.1, 0, 0.12, 0.62));
        const pCrown = new THREE.Group(); pCrown.position.y = 0.75;
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; pCrown.add(box(glowMat(pick(i % 2), 0.6), 0.22, 0.6 + (i % 2) * 0.4, 0.22, Math.cos(a) * 0.62, 0.3, Math.sin(a) * 0.62)); }
        phantom.head.add(pCrown);
        const pBident = new THREE.Group(); pBident.position.set(0, -1.95, 0);
        pBident.add(box(ghostM, 0.2, 6.2, 0.2, 0, 1.6, 0)); pBident.add(box(ghostM, 1.1, 0.18, 0.2, 0, 4.7, 0));
        for (const sx of [-1, 1]) pBident.add(box(glowMat(pick(0), 0.5), 0.2, 1.4, 0.2, sx * 0.48, 5.4, 0));
        phantom.armL.add(pBident);
        group.add(phantom.root);
        // 발밑에서 타오르는 저승불 기둥
        const FN = 46;
        const ghostFire = new THREE.InstancedMesh(BOX, glowMat(pick(0), 0.7), FN);
        const gfD = Array.from({ length: FN }, () => ({ a: rand(0, 6.3), r: rand(0.6, 1.9), y: rand(0, 5), v: rand(1.4, 3), s: rand(0.14, 0.3) }));
        group.add(ghostFire);
        // 주위를 도는 해골들
        const skullM = new THREE.MeshStandardMaterial({ color: 0xd8d4c6, roughness: 0.6 });
        const skulls = Array.from({ length: 5 }, (_, i) => {
            const k = new THREE.Group();
            k.add(box(skullM, 0.55, 0.5, 0.5, 0, 0, 0)); k.add(box(skullM, 0.4, 0.18, 0.4, 0, -0.3, 0.05));
            for (const sx of [-1, 1]) k.add(box(glowMat(pick(0), 1), 0.14, 0.12, 0.05, sx * 0.13, 0.05, 0.26));
            group.add(k); return k;
        });
        // 내리꽂으면 땅에서 솟는 망자의 손들
        const HN = 12;
        const hands = Array.from({ length: HN }, (_, i) => {
            const h = new THREE.Group(); const a = (i / HN) * Math.PI * 2;
            h.add(box(ghostM, 0.3, 1.4, 0.3, 0, 0.7, 0));
            for (let f = 0; f < 3; f++) h.add(box(ghostM, 0.08, 0.35, 0.08, -0.1 + f * 0.1, 1.55, 0));
            h.position.set(Math.cos(a) * 2.6, -2, Math.sin(a) * 2.6); h.rotation.z = Math.cos(a) * 0.3; h.rotation.x = -Math.sin(a) * 0.3;
            h.userData.noFit = true; group.add(h); return h;
        });
        const shock = square(1, 0.14, glowMat(pick(0), 0)); shock.userData.noFit = true; group.add(shock);
        // 지옥개 목줄 (캐릭터 왼손 → 개 목)
        const leashHand = new THREE.Object3D(); leashHand.position.y = -1.95; attach(dummy.armR, leashHand);
        const LK = 10;
        const leash = Array.from({ length: LK }, (_, i) => { const l = box(obsidian, 0.12, 0.2, 0.06, 0, 0, 0); l.userData.noFit = true; group.add(l); return l; });
        const lp = new THREE.Vector3(), dp = new THREE.Vector3();
        // 오벨리스크 기둥
        for (const s of [-1, 1]) { const col = box(obsidian, 0.9, 9, 0.9, s * 4.6, 4.5, -4); col.userData.noFit = true; group.add(col); const f = box(fire, 0.5, 0.6, 0.5, s * 4.6, 9.4, -4); f.userData.noFit = true; group.add(f); flames.push(f); }
        // 망령 (솟아오르는 반투명 형체)
        const WR = 6;
        const wraiths = Array.from({ length: WR }, (_, i) => {
            const m = kit.ghost(pick(0), 0.18); m.scale.setScalar(0.35); m.userData = { x: rand(-5, 5), z: rand(-3, 1), k: i / WR, noFit: true };
            group.add(m); return m;
        });
        const SP = 50;
        const embers = new THREE.InstancedMesh(BOX, glowMat(pick(0), 1), SP);
        const eD = Array.from({ length: SP }, () => ({ x: rand(-6, 6), y: rand(0, 10), z: rand(-5, 3), v: rand(0.5, 1.3) }));
        group.add(embers);
        const rim = new THREE.PointLight(pick(0), 10, 12, 1.6); rim.userData.own = true; rim.position.set(0, 3, -2.2); group.add(rim);
        let slamN = -1, sk = 1;
        sig.raiseK = 0; sig.slamK = 0;
        tick((t, dt) => {
            const lift = dummy.root.position.y;
            const c = t % 7, n = Math.floor(t / 7);
            // 0~3.5 군림, 3.5~4.6 창을 높이 듦, 4.6~4.8 바닥에 내리꽂음, 4.8~5.8 버팀
            sig.raiseK = c >= 3.5 && c < 4.6 ? (c - 3.5) / 1.1 : 0;
            sig.slamK = c >= 4.6 && c < 4.8 ? (c - 4.6) / 0.2 : c >= 4.8 && c < 5.8 ? 1 : c >= 5.8 && c < 6.4 ? 1 - (c - 5.8) / 0.6 : 0;
            if (n !== slamN && c >= 4.75) { slamN = n; sk = 0; stage.shake(0.6); stage.flash(0.4); }
            const rage = sk < 1 ? 1 - sk : 0;
            sk = Math.min(1, sk + dt * 0.5);
            flames.forEach((f, i) => { const k = 0.8 + Math.sin(t * 9 + i * 2) * 0.25 + rage * 0.8; f.scale.set(0.2 * k, 0.45 * k, 0.2 * k); });
            capeSegs.forEach((cs, i) => { cs.rotation.x = 0.15 + Math.sin(t * 1.6 - i * 0.6) * 0.06 * (i + 1) / 3; });
            cape.position.y = 4.0 + lift;
            heads.forEach(({ h, jaw, ph }) => { h.rotation.x = Math.sin(t * 1.4 + ph) * 0.1 - rage * 0.5; jaw.rotation.x = rage * 0.5 + Math.max(0, Math.sin(t * 2 + ph)) * 0.15; });
            tail.rotation.y = Math.sin(t * 3) * 0.3;
            rvD.forEach((d, i) => {
                d.x += d.v * dt; if (d.x > 9) d.x = -9;
                TMP.p.set(d.x, 0.04, d.z); TMP.q.identity(); TMP.sc.set(d.s, 0.03, 0.12);
                river.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            river.instanceMatrix.needsUpdate = true;
            corona.rotation.z = t * 0.08;
            corona.children.forEach((r, i) => { r.material.opacity = 0.35 + 0.2 * Math.sin(t * 2 + i) + rage * 0.4; });
            // 환영도 같은 자세
            const pArm = sig.slamK > 0 ? -0.3 + (-1.3 + 0.3) * sig.slamK : -0.3 + (-2.8 + 0.3) * sig.raiseK;
            phantom.armL.rotation.set(pArm, 0, 0.2); phantom.armR.rotation.set(-0.2 - sig.raiseK * 0.4, 0, -0.45 - sig.raiseK * 0.9);
            pBident.rotation.x = bident.rotation.x;
            phantom.root.position.y = -0.6 + Math.sin(t * 0.7) * 0.15 + lift * 0.5;
            phantom.root.rotation.x = sig.slamK * 0.15;
            ghostM.opacity = 0.08 + rage * 0.12 + sig.raiseK * 0.05;
            pCrown.children.forEach((f, i) => { f.scale.y = 1 + Math.sin(t * 8 + i) * 0.3 + rage; });
            gfD.forEach((d, i) => {
                d.y += d.v * dt * (1 + rage * 1.5); if (d.y > 5) d.y = 0;
                const k = d.y / 5;
                TMP.p.set(Math.cos(d.a + t * 0.6) * d.r * (1 - k * 0.5), d.y + lift, Math.sin(d.a + t * 0.6) * d.r * (1 - k * 0.5));
                TMP.q.setFromEuler(TMP.e.set(0, t + i, 0.78)); TMP.sc.setScalar(d.s * (1 - k) * (1 + rage * 0.6));
                ghostFire.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            ghostFire.instanceMatrix.needsUpdate = true;
            skulls.forEach((k, i) => {
                const a = t * 0.7 + (i / 5) * Math.PI * 2;
                k.position.set(Math.cos(a) * 2.8, 4.6 + lift + Math.sin(t * 1.5 + i) * 0.4, Math.sin(a) * 2.0);
                k.lookAt(0, 4 + lift, 0);
            });
            hands.forEach((h, i) => {
                const up = rage > 0 ? Math.sin(Math.min(1, (1 - rage) * 1.6) * Math.PI) : 0;
                h.position.y = -2 + up * (2 + (i % 3) * 0.4);
                h.visible = up > 0.01;
            });
            shock.visible = rage > 0;
            if (rage > 0) { shock.position.set(0, 0.06, 0.6); shock.scale.setScalar(0.5 + (1 - rage) * 10); shock.children.forEach(m => { m.material.opacity = rage; }); }
            // 목줄
            leashHand.getWorldPosition(lp); group.worldToLocal(lp);
            dp.set(-2.9 + 0.6, 2.7, 1.2 + 1.2);
            leash.forEach((l, i) => {
                const k = (i + 0.5) / LK;
                l.position.lerpVectors(lp, dp, k); l.position.y -= Math.sin(k * Math.PI) * 0.5;
                l.rotation.set(0, i % 2 ? Math.PI / 2 : 0, Math.atan2(dp.y - lp.y, dp.x - lp.x) - Math.PI / 2);
            });
            wraiths.forEach((w, i) => {
                const u = w.userData;
                u.k += dt * (0.12 + rage * 0.4); if (u.k > 1) { u.k = 0; u.x = rand(-5, 5); }
                w.position.set(u.x + Math.sin(t + i) * 0.3, -1.5 + u.k * 9, u.z);
                w.children.forEach(m => { m.material.opacity = 0.18 * Math.sin(u.k * Math.PI); });
            });
            eD.forEach((d, i) => {
                d.y += d.v * dt * (1 + rage * 2); if (d.y > 10) d.y = 0;
                TMP.p.set(d.x + Math.sin(t + i) * 0.3, d.y, d.z); TMP.q.setFromEuler(TMP.e.set(t + i, t, 0.78)); TMP.sc.setScalar(0.07);
                embers.setMatrixAt(i, TMP.m4.compose(TMP.p, TMP.q, TMP.sc));
            });
            embers.instanceMatrix.needsUpdate = true;
            rim.intensity = 8 + rage * 14;
            // 창: 평소엔 세워 짚음, 들 땐 머리 위, 내리꽂을 땐 앞 바닥으로
            const REST = 0.3, UP = 2.8, SLAM = 3.4;   // 팔 각도와 합쳐서: 평소/들 때는 갈래가 위, 내리꽂을 땐 앞 아래
            bident.rotation.set(sig.slamK > 0 ? REST + (SLAM - REST) * sig.slamK : REST + (UP - REST) * sig.raiseK, 0, 0);
        });
    }
};

/* ---------- 열차 블록 모형 (나선 철로, 컷씬에서 같이 씀). 앞이 +z ---------- */
export function buildLocomotive(kit, pick) {
    const { THREE, BOX, glowMat, solidMat } = kit;
    const g = new THREE.Group();
    const iron = new THREE.MeshStandardMaterial({ color: 0x16171c, metalness: 0.6, roughness: 0.4 });
    const body = new THREE.MeshStandardMaterial({ color: 0x1b2448, metalness: 0.45, roughness: 0.35 });
    const red = new THREE.MeshStandardMaterial({ color: 0xa31c1c, metalness: 0.3, roughness: 0.4, emissive: 0x3a0505, emissiveIntensity: 0.6 });
    const gold = solidMat(new THREE.Color('#ffcc55'), 0.35);
    const add = (mat, w, h, d, x, y, z) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); g.add(m); return m; };
    add(iron, 2.0, 0.45, 5.2, 0, 0.95, 0);          // 차대
    add(body, 1.7, 1.7, 3.3, 0, 2.05, 0.75);        // 보일러
    for (const z of [-0.3, 0.6, 1.5, 2.2]) add(gold, 1.74, 1.74, 0.1, 0, 2.05, z);
    add(iron, 1.8, 1.8, 0.6, 0, 2.05, 2.55);        // 연기실
    add(gold, 0.9, 0.9, 0.06, 0, 2.05, 2.88);       // 문 테두리
    add(iron, 0.7, 0.7, 0.08, 0, 2.05, 2.9);
    const headlight = add(glowMat(new THREE.Color('#fff3c0'), 0.9), 0.55, 0.45, 0.2, 0, 3.15, 2.75);
    const beam = add(glowMat(new THREE.Color('#fff3c0'), 0.05), 0.9, 0.7, 6, 0, 3.15, 5.8); beam.userData.noFit = true;
    const chimney = add(iron, 0.55, 1.1, 0.55, 0, 3.4, 1.95);
    add(iron, 0.85, 0.22, 0.85, 0, 4.0, 1.95);
    add(gold, 0.65, 0.5, 0.65, 0, 3.1, 0.6);        // 증기 돔
    add(body, 2.1, 2.3, 1.7, 0, 2.35, -1.75);        // 기관실
    add(iron, 2.4, 0.2, 2.0, 0, 3.55, -1.75);       // 지붕
    for (const s of [-1, 1]) add(glowMat(pick(0), 0.9), 0.06, 0.7, 0.9, s * 1.06, 2.8, -1.75);   // 창문
    for (let i = 0; i < 4; i++) { const w = add(red, 0.36, 0.5, 0.14, -0.6 + i * 0.4, 0.55, 2.75); w.rotation.x = -0.5; }   // 배장기
    add(red, 2.06, 0.12, 5.2, 0, 1.22, 0);          // 빨간 띠
    const wheels = [], rods = [];
    for (const s of [-1, 1]) {
        for (const z of [1.3, 0, -1.3]) {
            const w = new THREE.Group(); w.position.set(s * 1.05, 0.62, z);
            const a = new THREE.Mesh(BOX, red); a.scale.set(0.16, 1.2, 1.2);
            const b = new THREE.Mesh(BOX, red); b.scale.set(0.16, 1.2, 1.2); b.rotation.x = Math.PI / 4;
            const hub = new THREE.Mesh(BOX, gold); hub.scale.set(0.2, 0.3, 0.3);
            w.add(a, b, hub); g.add(w); wheels.push(w);
        }
        const rod = add(gold, 0.08, 0.12, 2.8, s * 1.2, 0.62, 0); rod.userData.y = 0.62; rod.userData.z = 0; rods.push(rod);
    }
    return { g, wheels, rods, chimney, headlight };
}
function buildTender(kit) {
    const { THREE, BOX } = kit;
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0x1b2448, metalness: 0.45, roughness: 0.35 });
    const coal = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 1 });
    const m = new THREE.Mesh(BOX, body); m.scale.set(2.0, 1.7, 2.9); m.position.y = 1.65; g.add(m);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(BOX, coal); c.scale.setScalar(0.5); c.position.set(-0.6 + (i % 3) * 0.6, 2.6, -0.6 + Math.floor(i / 3) * 1.1); c.rotation.set(i, i * 2, 0); g.add(c); }
    const base = new THREE.Mesh(BOX, new THREE.MeshStandardMaterial({ color: 0x16171c })); base.scale.set(2.0, 0.4, 2.9); base.position.y = 0.6; g.add(base);
    return g;
}
function buildCoach(kit, pick, n) {
    const { THREE, BOX, glowMat, solidMat } = kit;
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: n % 2 ? 0x6e1020 : 0x7d1426, metalness: 0.3, roughness: 0.4 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x14151b, roughness: 0.5 });
    const gold = solidMat(new THREE.Color('#ffcc55'), 0.35);
    const add = (mat, w, h, d, x, y, z) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y, z); g.add(m); return m; };
    add(body, 2.0, 2.1, 4.2, 0, 2.0, 0);
    add(dark, 2.2, 0.25, 4.3, 0, 3.15, 0);
    add(gold, 2.04, 0.1, 4.22, 0, 1.25, 0);
    const win = glowMat(pick(2), 0.9);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) add(win, 0.05, 0.6, 0.62, s * 1.02, 2.3, -1.4 + i * 0.93);
    const wheels = [];
    for (const s of [-1, 1]) for (const z of [-1.4, 1.4]) {
        const w = new THREE.Group(); w.position.set(s * 0.9, 0.55, z);
        const a = new THREE.Mesh(BOX, dark); a.scale.set(0.14, 0.8, 0.8);
        const b = a.clone(); b.rotation.x = Math.PI / 4;
        w.add(a, b); g.add(w); wheels.push(w);
    }
    add(dark, 1.9, 0.35, 4.0, 0, 0.85, 0);
    return { g, wheels };
}

/* =========================================================
   👑 JXS 공통 '거대한 무대' — 모든 JXS 칭호 위에 덧씌움
   - 캐릭터 뒤에 3.4배 크기의 빛나는 분신이 똑같이 움직임
   - 하늘엔 겹겹이 도는 거대한 문장(시길), 둘레엔 하늘까지 닿는 빛기둥
   - 위로는 큰 큐브 왕관이 돌고, 바닥엔 3초마다 거대한 충격파
   전부 카메라 맞춤(noFit)에서 빼서 캐릭터 크기는 그대로
   opts: { colossus: false (분신 빼기), z: 분신 거리, sigilY, sigilZ }
   ========================================================= */
export function jxsGrand({ group, tick, pick, dummy, kit }, opts = {}) {
    const { THREE, BOX, glowMat, square, mini, rand } = kit;
    const far = new THREE.Group(); far.userData.noFit = true; group.add(far);
    const c0 = pick(0), c1 = pick(1), c2 = pick(2);
    const box = (m, w, h, d, x, y, z) => { const b = new THREE.Mesh(BOX, m); b.scale.set(w, h, d); b.position.set(x, y, z); return b; };

    // 1) 거대한 분신 (관절이 있는 꼬마 모형을 크게 키워서 캐릭터 포즈를 그대로 따라함)
    let giant = null;
    if (opts.colossus !== false) {
        // 속은 아주 옅게, 테두리 선만 또렷하게 → 화면이 하얗게 뒤덮이지 않음
        giant = mini(0xffffff, { scale: 2.3 });
        const gm = glowMat(c0, 0.05);
        const edgeGeo = new THREE.EdgesGeometry(BOX);
        const edgeMat = new THREE.LineBasicMaterial({ color: c1, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
        const meshes = [];
        giant.root.traverse(o => { if (o.isMesh) meshes.push(o); });
        meshes.forEach(o => { o.material = gm; const e = new THREE.LineSegments(edgeGeo, edgeMat); e.scale.copy(o.scale); e.position.copy(o.position); o.parent.add(e); });
        giant.root.position.set(0, 1.5, opts.z ?? -14);
        far.add(giant.root);
    }
    // 2) 하늘의 문장
    const sigil = new THREE.Group(); sigil.position.set(0, opts.sigilY ?? 10, opts.sigilZ ?? -18); far.add(sigil);
    const sRings = [7, 10, 13.5].map((s, i) => { const r = square(s, 0.12 + i * 0.04, glowMat(i === 1 ? c1 : c0, 0.4)); sigil.add(r); return r; });
    const beams = new THREE.Group(); sigil.add(beams);
    for (let i = 0; i < 8; i++) { const b = box(glowMat(i % 2 ? c2 : c0, 0.3), 0.1, 13, 0.05, 0, 0, 0); b.rotation.z = (i / 8) * Math.PI; beams.add(b); }
    const ticks = new THREE.Group(); sigil.add(ticks);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const tk = box(glowMat(c1, 0.7), 0.3, i % 3 ? 0.6 : 1.3, 0.05, Math.cos(a) * 6, Math.sin(a) * 6, 0); tk.rotation.z = a + Math.PI / 2; ticks.add(tk); }
    const core = box(glowMat(0xffffff, 0.5), 1.4, 1.4, 0.1, 0, 0, 0.1); core.rotation.z = Math.PI / 4; sigil.add(core);
    // 3) 하늘까지 닿는 빛기둥
    const pillars = [];
    for (let i = 0; i < 6; i++) {
        const a = Math.PI * 0.15 + (i / 5) * Math.PI * 0.7;
        const p = box(glowMat(i % 2 ? c1 : c0, 0.12), 0.45, 40, 0.45, -Math.cos(a) * 12, 18, -Math.sin(a) * 10 - 4);
        far.add(p); pillars.push(p);
    }
    // 4) 큐브 왕관
    const crownG = new THREE.Group(); crownG.position.y = 9; crownG.rotation.x = 0.35; far.add(crownG);
    const cubes = [];
    for (let i = 0; i < 10; i++) { const c = box(glowMat(i % 2 ? c0 : c2, 0.85), 0.7, 0.7, 0.7, 0, 0, 0); crownG.add(c); cubes.push(c); }
    // 5) 바닥 충격파 + 큰 바닥 문양
    const floorRings = [6, 9.5].map((s, i) => { const r = square(s, 0.14, glowMat(i ? c1 : c0, 0.35)); r.position.y = 0.06; far.add(r); return r; });
    const shock = square(1, 0.25, glowMat(c0, 0.9)); shock.position.y = 0.08; far.add(shock);
    const parts = giant ? ['legL', 'legR', 'armL', 'armR', 'head', 'torso'] : [];
    tick((t, dt) => {
        const lift = dummy.root.position.y;
        if (giant) {
            parts.forEach(k => giant[k].rotation.copy(dummy[k].rotation));
            giant.root.position.y = 1.5 + lift * 1.5 + Math.sin(t * 0.7) * 0.3;
            giant.root.rotation.y = Math.sin(t * 0.3) * 0.08;
        }
        sigil.rotation.z = t * 0.05;
        sRings.forEach((r, i) => { r.rotation.set(Math.PI / 2, t * (i % 2 ? -0.25 : 0.18) + i, 0); });
        beams.rotation.z = -t * 0.12;
        ticks.rotation.z = t * 0.2;
        core.scale.set(1.4 + Math.sin(t * 2) * 0.2, 1.4 + Math.sin(t * 2) * 0.2, 0.1);
        pillars.forEach((p, i) => { p.material.opacity = 0.05 + Math.max(0, Math.sin(t * 1.3 + i * 1.1)) * 0.14; });
        cubes.forEach((c, i) => { const a = t * 0.5 + (i / cubes.length) * Math.PI * 2; c.position.set(Math.cos(a) * 7, Math.sin(a * 3 + t) * 0.4, Math.sin(a) * 7); c.rotation.set(t + i, t * 1.3, 0); });
        crownG.position.y = 9 + lift;
        floorRings.forEach((r, i) => { r.rotation.y = t * (i ? -0.1 : 0.14); });
        const k = (t % 3) / 3;
        shock.scale.setScalar(1 + k * 26);
        shock.children.forEach(ch => { ch.material.opacity = 0.8 * (1 - k); });
    });
}
