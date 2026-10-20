/* =========================================================
   🌀 던전 보스 장면 (boss3d.js)
   균열의 군주: 흑요석 블록 몸, 가슴의 균열 핵, 떠 있는 두 주먹, 머리 위 수정 왕관
   뒤에는 세로로 찢어진 차원 균열, 바닥은 갈라진 결계 타일
   무대 렌더러(aura3d)를 빌려서 그림 → stage.setTakeover(createBossScene())
   ========================================================= */

import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const rand = (a, b) => a + Math.random() * (b - a);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0.3, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 0 });
const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
function box(parent, mat, w, h, d, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(BOX, mat);
    m.scale.set(w, h, d); m.position.set(x, y, z);
    parent.add(m);
    return m;
}

export function createBossScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05030c);
    scene.fog = new THREE.Fog(0x05030c, 22, 60);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    const look = new THREE.Vector3(0, 4.9, 0);

    scene.add(new THREE.HemisphereLight(0x7a5ab0, 0x0a0614, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(5, 10, 9); scene.add(key);
    const rimL = new THREE.DirectionalLight(0xb86bff, 1.4); rimL.position.set(-6, 6, -6); scene.add(rimL);
    const coreLight = new THREE.PointLight(0xff4ad8, 30, 18, 1.6); coreLight.position.set(0, 5.1, 2.4); scene.add(coreLight);
    const riftLight = new THREE.PointLight(0xa070ff, 35, 30, 1.4); riftLight.position.set(0, 7, -6); scene.add(riftLight);

    const BASE_EM = new THREE.Color(0x2a0a4a), WHITE = new THREE.Color(0xffffff);
    const RIFT = new THREE.Color(0xc070ff), RAGE = new THREE.Color(0xff3a3a), ICE = new THREE.Color(0x7ae8ff);
    const tint = new THREE.Color().copy(RIFT);

    /* ---------- 바닥: 갈라진 결계 타일 ---------- */
    const floor = new THREE.Group(); scene.add(floor);
    const tileMat = [std(0x0e0a18, { rough: 0.8, metal: 0.2 }), std(0x130d20, { rough: 0.7, metal: 0.25 }), std(0x0a0712, { rough: 0.9 })];
    const seamMat = glow(0x9a5aff, 0.35);
    const hotTiles = [];
    for (let x = -7; x <= 7; x++) for (let z = -6; z <= 6; z++) {
        const t = box(floor, tileMat[(x * 7 + z * 3 + 99) % 3], 1.86, 0.4, 1.86, x * 1.9, -0.2 + rand(-0.05, 0.05), z * 1.9);
        if (Math.random() < 0.08) { const h = box(floor, glow(0xc070ff, 0.0), 1.7, 0.02, 1.7, x * 1.9, 0.02, z * 1.9); hotTiles.push({ m: h, ph: Math.random() * 6 }); }
        t.userData.d = Math.hypot(x, z);
    }
    for (let i = -7; i <= 7; i++) { box(floor, seamMat, 28.5, 0.03, 0.06, 0, 0.01, i * 1.9 + 0.95); box(floor, seamMat, 0.06, 0.03, 25, i * 1.9 + 0.95, 0.01, 0); }
    // 보스 발밑 결계 고리 (사각 링 2겹)
    const sqRing = (size, th, mat) => {
        const g = new THREE.Group();
        box(g, mat, size, 0.04, th, 0, 0, size / 2); box(g, mat, size, 0.04, th, 0, 0, -size / 2);
        box(g, mat, th, 0.04, size, size / 2, 0, 0); box(g, mat, th, 0.04, size, -size / 2, 0, 0);
        return g;
    };
    const runeA = sqRing(7, 0.14, glow(0xc070ff, 0.7)); runeA.position.y = 0.04; scene.add(runeA);
    const runeB = sqRing(5, 0.08, glow(0xff6ad8, 0.6)); runeB.position.y = 0.05; runeB.rotation.y = Math.PI / 4; scene.add(runeB);
    // 회피 경고: 바닥 전체에 퍼지는 빨간 경고판
    const warnMat = glow(0xff2a4a, 0);
    const warnPlate = box(scene, warnMat, 28, 0.02, 24, 0, 0.06, 2);

    /* ---------- 뒤의 차원 균열 ---------- */
    const rift = new THREE.Group(); rift.position.set(0, 7.5, -8); scene.add(rift);
    const riftBars = [];
    for (let i = 0; i < 46; i++) {
        const k = i / 45, y = (k - 0.5) * 17;
        const w = Math.pow(Math.sin(k * Math.PI), 0.8) * 3.4 * (0.75 + 0.25 * Math.sin(i * 1.7));
        const core = box(rift, glow(0xffffff, 0.55), Math.max(0.05, w * 0.18), 0.42, 0.1, Math.sin(i * 0.9) * 0.3, y, 0.1);
        const mid = box(rift, glow(0xff6ad8, 0.55), w * 0.6, 0.4, 0.1, Math.sin(i * 0.9) * 0.3, y, 0);
        const out = box(rift, glow(0x7a3aff, 0.35), w, 0.38, 0.1, Math.sin(i * 0.9) * 0.3, y, -0.1);
        riftBars.push({ core, mid, out, w, ph: i * 0.37 });
    }
    // 떠다니는 파편
    const debris = [];
    for (let i = 0; i < 26; i++) {
        const m = box(scene, i % 3 ? tileMat[0] : std(0x2a1a44, { emissive: 0x6a2aff, ei: 0.6 }), rand(0.3, 1.1), rand(0.3, 1.1), rand(0.3, 1.1));
        debris.push({ m, a: rand(0, 6.28), r: rand(7, 13), y: rand(1.5, 13), sp: rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1), rs: rand(0.2, 0.8) });
    }

    /* ---------- 보스 ---------- */
    const boss = new THREE.Group(); scene.add(boss);
    const body = new THREE.Group(); boss.add(body);
    const obsidian = std(0x1b1428, { rough: 0.35, metal: 0.45, emissive: 0x2a0a4a, ei: 0.35 });
    const obsidian2 = std(0x261b38, { rough: 0.4, metal: 0.4, emissive: 0x1a0630, ei: 0.3 });
    const crackMat = glow(0xc070ff, 1);
    const eyeMat = glow(0xff6ad8, 1);
    const bodyMats = [obsidian, obsidian2];

    // 아래: 흩어지는 옷자락 (점점 좁아지는 블록 + 떨어져 나가는 조각)
    [[2.6, 1.0, 3.6], [2.0, 0.9, 2.75], [1.4, 0.8, 2.0], [0.8, 0.6, 1.35]].forEach(([w, h, y], i) => box(body, i % 2 ? obsidian2 : obsidian, w, h, w * 0.75, 0, y, 0));
    // 몸통
    box(body, obsidian, 3.4, 3.0, 2.0, 0, 5.2, 0);
    box(body, obsidian2, 3.6, 0.5, 2.2, 0, 3.9, 0);   // 허리띠
    box(body, obsidian2, 2.2, 0.9, 2.3, 0, 6.5, 0);   // 가슴판 위
    // 몸 앞 균열 (빛나는 금)
    const cracks = [];
    [[-1.1, 5.9, 0.08, 1.1, 0.4], [-0.7, 4.6, 0.08, 0.9, -0.5], [1.0, 5.7, 0.08, 1.2, -0.35], [0.8, 4.4, 0.08, 0.8, 0.6], [-1.4, 4.9, 0.06, 0.6, 1.2], [1.45, 5.0, 0.06, 0.5, -1.1]]
        .forEach(([x, y, w, h, rz]) => { const c = box(body, crackMat, w, h, 0.05, x, y, 1.02); c.rotation.z = rz; cracks.push(c); });
    // 가슴 핵
    const coreG = new THREE.Group(); coreG.position.set(0, 5.15, 1.05); body.add(coreG);
    const coreMat = std(0xff4ad8, { emissive: 0xff4ad8, ei: 2.2, metal: 0.2, rough: 0.2 });
    const core = box(coreG, coreMat, 0.8, 0.8, 0.3);
    const coreFrame = box(coreG, std(0x3a2a5a, { metal: 0.8, rough: 0.25 }), 1.15, 1.15, 0.2, 0, 0, -0.08); coreFrame.rotation.z = Math.PI / 4;
    const coreHalo = box(coreG, glow(0xff6ad8, 0.45), 1.6, 1.6, 0.02, 0, 0, 0.18); coreHalo.rotation.z = Math.PI / 4;
    // 어깨 + 수정 가시
    const crystalMat = std(0x9a6aff, { emissive: 0x7a3aff, ei: 1.1, metal: 0.1, rough: 0.15 });
    for (const s of [-1, 1]) {
        box(body, obsidian2, 1.5, 1.1, 1.7, s * 2.35, 6.35, 0);
        box(body, obsidian, 1.2, 0.3, 1.4, s * 2.35, 6.98, 0);
        for (let i = 0; i < 3; i++) { const c = box(body, crystalMat, 0.24, 1.1 - i * 0.2, 0.24, s * (2.0 + i * 0.4), 7.5 - i * 0.1, (i - 1) * 0.4); c.rotation.z = -s * (0.35 + i * 0.25); }
    }
    // 머리
    const head = new THREE.Group(); head.position.set(0, 7.45, 0.1); body.add(head);
    box(head, obsidian, 1.5, 1.35, 1.4);
    box(head, obsidian2, 1.6, 0.35, 1.5, 0, 0.45, 0);
    box(head, obsidian2, 1.3, 0.25, 0.1, 0, -0.4, 0.7);
    const eyes = [-0.36, 0.36].map(x => box(head, eyeMat, 0.42, 0.13, 0.06, x, 0.05, 0.72));
    // 수정 왕관 (머리 위에 떠서 천천히 돎)
    const crown = new THREE.Group(); crown.position.set(0, 9.0, 0.1); body.add(crown);
    const crownCr = [];
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2, tall = i % 2 ? 0.9 : 1.5;
        const c = box(crown, crystalMat, 0.26, tall, 0.26, Math.cos(a) * 1.0, tall / 2, Math.sin(a) * 1.0);
        c.rotation.set(0, -a, Math.cos(a) * 0.15);
        crownCr.push(c);
    }
    const crownRing = sqRing(2.1, 0.08, glow(0xff9aec, 0.7)); crown.add(crownRing);

    // 떠 있는 두 주먹
    const fists = [-1, 1].map(s => {
        const g = new THREE.Group(); boss.add(g);
        box(g, obsidian, 1.6, 1.5, 1.6);
        box(g, obsidian2, 1.7, 0.4, 1.7, 0, -0.55, 0);
        for (let i = 0; i < 4; i++) box(g, obsidian2, 0.34, 0.34, 0.3, (i - 1.5) * 0.38, 0.3, 0.88);
        const band = box(g, glow(0xc070ff, 0.85), 1.72, 0.1, 1.72, 0, -0.25, 0);
        const shard = box(g, crystalMat, 0.3, 0.9, 0.3, s * 0.3, 0.95, -0.2); shard.rotation.z = -s * 0.4;
        const home = new THREE.Vector3(s * 3.7, 4.7, 0.9);
        g.position.copy(home);
        return { g, s, home, band, anim: null };
    });
    // 몸 주위를 도는 파편 고리
    const orbit = [];
    for (let i = 0; i < 12; i++) orbit.push(box(boss, i % 2 ? crystalMat : glow(0xff6ad8, 0.9), 0.22, 0.22, 0.22));

    // 기절 표시: 머리 위를 도는 별 큐브 + 몸을 감싼 얼음 조각
    const stunStars = Array.from({ length: 5 }, () => { const m = box(scene, glow(0xfff6a0, 1), 0.22, 0.22, 0.22); m.visible = false; return m; });
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xbff4ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, emissive: 0x3ac8ff, emissiveIntensity: 0.5 });
    const ice = [];
    for (let i = 0; i < 14; i++) { const m = box(boss, iceMat, rand(0.6, 1.3), rand(0.8, 2.2), rand(0.6, 1.2), rand(-2.2, 2.2), rand(2.2, 7.4), rand(0.4, 1.4)); m.rotation.set(rand(-0.4, 0.4), rand(-0.6, 0.6), rand(-0.5, 0.5)); m.visible = false; ice.push(m); }

    /* ---------- 입자 (스킬 효과·피격·폭발 공용) ---------- */
    const PN = 260;
    const pMesh = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), PN);
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pMesh.frustumCulled = false;
    scene.add(pMesh);
    const parts = Array.from({ length: PN }, () => ({ life: 0 }));
    let pNext = 0;
    const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpC = new THREE.Color();
    function emit(n, o) {
        for (let i = 0; i < n; i++) {
            const p = parts[pNext]; pNext = (pNext + 1) % PN;
            p.x = o.x + rand(-o.spread || 0, o.spread || 0); p.y = o.y + rand(-(o.spreadY ?? o.spread ?? 0), o.spreadY ?? o.spread ?? 0); p.z = o.z + rand(-(o.spreadZ ?? 0.3), o.spreadZ ?? 0.3);
            const sp = rand(o.speed * 0.4, o.speed);
            const dir = o.dir || [rand(-1, 1), rand(-1, 1), rand(-0.3, 1)];
            const len = Math.hypot(...dir) || 1;
            p.vx = dir[0] / len * sp + rand(-1, 1) * (o.jitter || 0); p.vy = dir[1] / len * sp + rand(-1, 1) * (o.jitter || 0); p.vz = dir[2] / len * sp + rand(-1, 1) * (o.jitter || 0);
            p.g = o.gravity ?? 0; p.max = p.life = rand(o.life * 0.6, o.life); p.size = rand(o.size * 0.6, o.size);
            p.c = new THREE.Color(Array.isArray(o.color) ? o.color[i % o.color.length] : o.color);
            p.rx = rand(0, 6); p.rs = rand(-6, 6); p.home = o.home || null;
        }
    }
    function updateParts(dt) {
        for (let i = 0; i < PN; i++) {
            const p = parts[i];
            if (p.life <= 0) { tmpM.makeScale(0, 0, 0); pMesh.setMatrixAt(i, tmpM); continue; }
            p.life -= dt;
            if (p.home) {   // 핵으로 빨려 들어가는 입자
                p.x += (p.home.x - p.x) * Math.min(1, dt * 3); p.y += (p.home.y - p.y) * Math.min(1, dt * 3); p.z += (p.home.z - p.z) * Math.min(1, dt * 3);
            } else {
                p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
                if (p.g && p.y < 0.1) { p.y = 0.1; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
            }
            p.rx += p.rs * dt;
            const k = Math.max(0, p.life / p.max);
            tmpE.set(p.rx, p.rx * 0.7, 0); tmpQ.setFromEuler(tmpE);
            tmpS.setScalar(p.size * (0.3 + 0.7 * k)); tmpP.set(p.x, p.y, p.z);
            tmpM.compose(tmpP, tmpQ, tmpS); pMesh.setMatrixAt(i, tmpM);
            tmpC.copy(p.c).multiplyScalar(0.4 + k * 1.6); pMesh.setColorAt(i, tmpC);
        }
        pMesh.instanceMatrix.needsUpdate = true;
        if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
    }

    // 하늘에서 내리치는 번개 (연쇄 번개 스킬)
    const bolts = Array.from({ length: 3 }, () => { const g = new THREE.Group(); g.visible = false; scene.add(g); for (let i = 0; i < 8; i++) box(g, glow(0xbfe6ff, 1), 0.18, 1.6, 0.18); return { g, life: 0 }; });
    function bolt(x, z) {
        const b = bolts.find(o => o.life <= 0) || bolts[0];
        b.life = 0.22; b.g.visible = true;
        let px = x, py = 16;
        b.g.children.forEach((m, i) => { const ny = py - 1.6, nx = x + rand(-0.6, 0.6); m.position.set((px + nx) / 2, (py + ny) / 2, z); m.rotation.z = Math.atan2(nx - px, 1.6) * -1; px = nx; py = ny; });
    }
    // 큰 베기 (일격·균열 베기)
    const slash = box(scene, glow(0xffffff, 0), 9, 0.35, 0.1, 0, 5.3, 2.6); slash.rotation.z = -0.6;
    let slashT = 0;
    // 충격파 (내려찍기)
    const wave = sqRing(1, 0.35, glow(0xff6ad8, 0)); wave.position.y = 0.1; scene.add(wave);
    let waveT = -1;
    // 방벽 (방벽 스킬): 화면 앞쪽에 반투명 육면 벽
    const shieldWall = box(scene, glow(0x5ab0ff, 0), 12, 7, 0.1, 0, 3.6, 9.5);
    let shieldT = 0;

    /* ---------- 상태 ---------- */
    let t = 0, shake = 0, flashBody = 0, flashScreen = 0;
    let chargeT = 0, chargeDur = 1, stunned = false, enraged = false, dead = false, deadT = 0, punchSide = 0, hp = 1;
    let entryT = 0;

    function setTint(target, dt) {
        tint.lerp(target, Math.min(1, dt * 3));
        crackMat.color.copy(tint); fists.forEach(f => f.band.material.color.copy(tint));
        seamMat.color.copy(tint).multiplyScalar(0.8);
        runeA.children.forEach(m => m.material.color.copy(tint));
        riftLight.color.copy(tint);
    }

    function update(dt, W, H) {
        t += dt; entryT = Math.min(1, entryT + dt * 0.7);
        // 카메라: 폰처럼 세로로 긴 화면이면 더 멀리서
        const aspect = W / H;
        const fovT = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const dist = Math.max(17, 10.2 / (2 * fovT * aspect), 12.5 / (2 * fovT)) * (1.25 - 0.25 * entryT);
        const yaw = Math.sin(t * 0.15) * 0.08;
        camera.position.set(Math.sin(yaw) * dist, 5.6 + Math.sin(t * 0.4) * 0.15, Math.cos(yaw) * dist);
        if (shake > 0.001) { camera.position.x += rand(-1, 1) * shake; camera.position.y += rand(-1, 1) * shake; shake *= Math.pow(0.015, dt); }
        camera.lookAt(look);

        setTint(stunned ? ICE : enraged ? RAGE : RIFT, dt);

        // 바닥·균열
        hotTiles.forEach(h => { h.m.material.opacity = Math.max(0, Math.sin(t * 1.2 + h.ph)) * 0.35; h.m.material.color.copy(tint); });
        runeA.rotation.y = t * 0.15; runeB.rotation.y = Math.PI / 4 - t * 0.25;
        riftBars.forEach((b, i) => {
            const f = 0.8 + 0.2 * Math.sin(t * 6 + b.ph) + (enraged ? 0.15 * Math.sin(t * 17 + i) : 0);
            const open = dead ? Math.max(0, 1 - deadT * 0.6) : 1;
            b.out.scale.x = b.w * f * open; b.mid.scale.x = b.w * 0.6 * f * open; b.core.scale.x = Math.max(0.05, b.w * 0.18 * f) * open;
            b.mid.material.color.copy(tint).lerp(new THREE.Color(0xff6ad8), stunned ? 0 : 0.5);
            b.out.material.color.copy(tint).multiplyScalar(0.7);
        });
        if (Math.random() < dt * (enraged ? 14 : 7) && !dead) emit(1, { x: rand(-1.5, 1.5), y: rand(1, 14), z: -7.8, spread: 0.3, speed: 2, dir: [rand(-1, 1), rand(-0.2, 0.4), 1], life: 3, size: 0.18, color: [tint.getHex(), 0xff6ad8] });
        debris.forEach(d => { d.a += d.sp * dt; d.m.position.set(Math.cos(d.a) * d.r, d.y + Math.sin(t * 0.6 + d.a) * 0.5, Math.sin(d.a) * d.r - 3); d.m.rotation.x += d.rs * dt; d.m.rotation.y += d.rs * 0.7 * dt; });

        // 보스 본체
        if (!dead) {
            const bob = Math.sin(t * 1.3) * 0.18;
            boss.position.y = bob + (1 - entryT) * -6;
            body.rotation.z = stunned ? Math.sin(t * 2) * 0.05 + 0.06 : Math.sin(t * 0.7) * 0.015;
            body.rotation.x = stunned ? 0.12 : 0;
            head.rotation.y = Math.sin(t * 0.5) * 0.15; head.rotation.x = stunned ? 0.3 : 0;
            crown.rotation.y = t * (enraged ? 1.4 : 0.5);
            crown.position.y = 9.0 + Math.sin(t * 2) * 0.12;
            orbit.forEach((m, i) => { const a = t * (enraged ? 1.6 : 0.8) + (i / orbit.length) * Math.PI * 2; m.position.set(Math.cos(a) * 4.4, 5 + Math.sin(a * 2 + t) * 0.6, Math.sin(a) * 2.2); m.rotation.set(t * 2 + i, t * 3, 0); });

            // 핵: 평소 맥박, 충전 중이면 하얗게 달아오르며 커짐
            const ch = chargeT > 0 ? 1 - chargeT / chargeDur : 0;
            const pulse = 1 + Math.sin(t * (enraged ? 7 : 3)) * 0.08;
            coreG.scale.setScalar(pulse * (1 + ch * 0.9));
            coreMat.emissive.copy(stunned ? ICE : enraged ? RAGE : new THREE.Color(0xff4ad8)).lerp(new THREE.Color(0xffffff), ch * 0.8);
            coreMat.emissiveIntensity = (stunned ? 0.6 : 2.2) + ch * 5;
            coreHalo.rotation.z = Math.PI / 4 + t * 1.2; coreHalo.material.opacity = 0.35 + ch * 0.6;
            coreLight.intensity = (stunned ? 8 : 30) + ch * 120;
            coreLight.color.copy(coreMat.emissive);
            eyeMat.color.copy(stunned ? ICE : enraged ? RAGE : new THREE.Color(0xff6ad8));
            const fl = flashBody;
            bodyMats.forEach(m => { m.emissive.copy(BASE_EM).lerp(WHITE, Math.min(1, fl)); m.emissiveIntensity = 0.35 + fl * 0.9; });
            if (chargeT > 0) {
                chargeT -= dt;
                if (Math.random() < dt * 40) emit(1, { x: rand(-7, 7), y: rand(0.5, 11), z: rand(-2, 5), spread: 0, speed: 0, life: 0.9, size: 0.2, color: [0xffffff, 0xff4a6a], home: coreG.getWorldPosition(new THREE.Vector3()) });
                warnMat.opacity = 0.08 + Math.abs(Math.sin(t * (6 + ch * 14))) * (0.12 + ch * 0.25);
            } else warnMat.opacity *= Math.pow(0.001, dt);

            // 주먹
            fists.forEach((f, i) => {
                const a = f.anim;
                let px = f.home.x, py = f.home.y + Math.sin(t * 1.7 + i * 2) * 0.3, pz = f.home.z, rx = 0, rz = Math.sin(t + i) * 0.1;
                if (chargeT > 0) { const k = Math.min(1, (1 - chargeT / chargeDur) * 2.5); py = THREE.MathUtils.lerp(py, 10.2, k); px = THREE.MathUtils.lerp(px, f.s * 2.2, k); rx = -0.6 * k; }
                if (a) {
                    a.t += dt;
                    const k = a.t / a.dur;
                    if (a.type === 'punch') {
                        // 뒤로 당겼다가 앞(카메라 쪽)으로 쭉
                        const back = k < 0.45 ? Math.sin(k / 0.45 * Math.PI / 2) : 1;
                        const fwd = k < 0.45 ? 0 : k < 0.62 ? (k - 0.45) / 0.17 : Math.max(0, 1 - (k - 0.62) / 0.38);
                        pz += -1.6 * back * (1 - fwd) + 6.5 * fwd; px *= 1 - fwd * 0.55; py += 0.8 * back - fwd * 0.6; rx = fwd * 0.4;
                        if (!a.hit && k >= 0.6) { a.hit = true; shake = Math.max(shake, 0.25); emit(14, { x: px, y: py, z: pz + 0.8, spread: 0.4, speed: 7, life: 0.5, size: 0.22, color: [0xff6ad8, 0xffffff], jitter: 2 }); }
                    } else if (a.type === 'slam') {
                        // 위에서 바닥으로 쾅
                        const k2 = Math.min(1, k / 0.25);
                        py = THREE.MathUtils.lerp(10.2, 0.9, k2 * k2); px = THREE.MathUtils.lerp(f.s * 2.2, f.s * 2.0, k2); pz = THREE.MathUtils.lerp(0.9, 3.2, k2); rx = -0.6 + k2 * 0.6;
                        if (k > 0.25) { const back = Math.min(1, (k - 0.25) / 0.75); py = THREE.MathUtils.lerp(0.9, f.home.y, back * back); px = THREE.MathUtils.lerp(f.s * 2.0, f.home.x, back); pz = THREE.MathUtils.lerp(3.2, f.home.z, back); }
                    }
                    if (k >= 1) f.anim = null;
                }
                f.g.position.set(px, py, pz); f.g.rotation.set(rx, Math.sin(t * 0.9 + i) * 0.2, rz);
            });
        } else {
            deadT += dt;
            boss.position.y -= dt * deadT * 1.5;
            body.rotation.z += dt * 0.3;
            boss.scale.setScalar(Math.max(0.01, 1 - deadT * 0.35));
            coreLight.intensity = Math.max(0, 200 - deadT * 120);
        }

        // 기절 연출
        stunStars.forEach((m, i) => { m.visible = stunned && !dead; const a = t * 4 + i * 1.26; m.position.set(Math.cos(a) * 1.4, 9.4 + boss.position.y + Math.sin(t * 6 + i) * 0.1, 0.1 + Math.sin(a) * 1.4); m.rotation.set(t * 3, t * 2, 0); });
        ice.forEach(m => { m.visible = stunned && !dead; });

        // 효과들
        if (slashT > 0) { slashT -= dt; slash.material.opacity = Math.max(0, slashT / 0.3); slash.scale.x = 9 * (1.3 - slashT); }
        if (waveT >= 0) { waveT += dt; const s = 1 + waveT * 26; wave.scale.set(s, 1, s); wave.children.forEach(m => { m.material.opacity = Math.max(0, 0.9 - waveT * 1.4); m.material.color.copy(tint); }); if (waveT > 0.8) waveT = -1; }
        if (shieldT > 0) { shieldT -= dt; shieldWall.material.opacity = Math.max(0, Math.min(0.25, shieldT * 0.3)) * (0.7 + 0.3 * Math.sin(t * 10)); }
        bolts.forEach(b => { if (b.life > 0) { b.life -= dt; b.g.visible = b.life > 0 && Math.sin(t * 90) > -0.4; } });
        flashBody *= Math.pow(0.0005, dt);
        updateParts(dt);
    }

    const front = () => ({ x: rand(-1.6, 1.6), y: 5 + rand(-1.4, 1.6) + boss.position.y, z: 1.4 });

    return {
        scene, camera, update,
        // 기본 공격: 주먹 한쪽으로 지르기
        attack() {
            if (dead || stunned) return;
            const f = fists[punchSide = 1 - punchSide];
            if (!f.anim) f.anim = { type: 'punch', t: 0, dur: 0.75 };
        },
        // 균열 폭발 충전 (dur 초 동안 주먹을 들어 올리고 핵이 달아오름)
        charge(dur) { if (dead) return; chargeT = chargeDur = dur; },
        slam() {
            if (dead) return;
            chargeT = 0;
            fists.forEach(f => { f.anim = { type: 'slam', t: 0, dur: 1.2 }; });
            setTimeout(() => {
                waveT = 0; shake = 0.9;
                emit(40, { x: 0, y: 0.4, z: 2.5, spread: 5, spreadY: 0.1, spreadZ: 2, speed: 9, dir: null, life: 1, size: 0.35, color: [tint.getHex(), 0xffffff, 0x2a1a44], gravity: 14, jitter: 3 });
            }, 280);
        },
        cancel() { chargeT = 0; },
        setStun(v) { if (v && !stunned) { emit(30, { ...front(), spread: 2.5, speed: 5, life: 0.8, size: 0.3, color: [0xbff4ff, 0x7ae8ff, 0xffffff] }); chargeT = 0; } stunned = v; },
        setEnrage(v) { if (v && !enraged) { shake = 0.5; emit(50, { x: 0, y: 5, z: 1, spread: 2, speed: 10, life: 1, size: 0.3, color: [0xff3a3a, 0xff9a3a] }); } enraged = v; },
        setHp(k) { hp = k; },
        // 내가 때림 (power 0~1: 셀수록 크게 번쩍)
        hit(power = 0.3, color = 0xffffff) {
            if (dead) return;
            flashBody = Math.max(flashBody, power * 0.7);
            const p = front();
            emit(3 + Math.round(power * 10), { ...p, spread: 0.3, speed: 4 + power * 6, life: 0.45, size: 0.14 + power * 0.12, color: [color, 0xffffff], jitter: 1.5 });
            if (power > 0.6) shake = Math.max(shake, 0.18);
        },
        // 스킬 연출
        skillFx(type, color = 0xffffff) {
            if (dead) return;
            const p = front();
            if (type === 'strike' || type === 'rend' || type === 'collapse') {
                slashT = 0.3; slash.material.color.setHex(color); slash.rotation.z = rand(-0.9, -0.3) * (Math.random() < 0.5 ? 1 : -1); shake = Math.max(shake, 0.3);
                emit(26, { ...p, spread: 1.4, speed: 9, life: 0.6, size: 0.25, color: [color, 0xffffff], jitter: 3 });
                if (type === 'collapse') { waveT = 0; emit(30, { x: 0, y: 7.5, z: -7.5, spread: 3, spreadY: 6, speed: 8, dir: [0, 0, 1], life: 1, size: 0.3, color: [0xff6ad8, 0xc070ff] }); }
            } else if (type === 'chain') {
                [0, 160, 320].forEach((d, i) => setTimeout(() => { bolt(rand(-1.5, 1.5), 1.5); emit(10, { ...front(), spread: 0.6, speed: 6, life: 0.4, size: 0.2, color: [0xbfe6ff, 0xffffff] }); shake = Math.max(shake, 0.15); }, d));
            } else if (type === 'burn') {
                emit(40, { ...p, spread: 1.8, spreadY: 1.5, speed: 3, dir: [0, 1, 0.3], life: 1.2, size: 0.3, color: [0xff6a1a, 0xffc24a, 0xff2a2a], jitter: 1 });
            } else if (type === 'freeze') {
                emit(36, { ...p, spread: 2.2, speed: 5, life: 0.9, size: 0.32, color: [0xbff4ff, 0x7ae8ff] });
            } else if (type === 'drain') {
                emit(26, { ...p, spread: 1, speed: 6, dir: [0, -0.2, 1], life: 0.9, size: 0.22, color: [0xff2a4a, 0x8a0a2a] });
            } else if (type === 'heal') {
                emit(40, { x: 0, y: 1, z: 9, spread: 5, spreadY: 0.5, speed: 3, dir: [0, 1, 0], life: 1.3, size: 0.22, color: [0x7dff9a, 0xffffff] });
            } else if (type === 'shield') {
                shieldT = 1.4;
            } else if (type === 'rally') {
                emit(40, { x: 0, y: 0.5, z: 8, spread: 6, spreadY: 0.2, speed: 6, dir: [0, 1, 0], life: 1, size: 0.2, color: [0xffd23a, 0xffffff] });
            }
        },
        die() {
            if (dead) return;
            dead = true; deadT = 0; shake = 1.2; chargeT = 0; warnMat.opacity = 0;
            emit(120, { x: 0, y: 5, z: 0.5, spread: 2.5, spreadY: 3, speed: 12, life: 2.4, size: 0.5, color: [0x1b1428, 0xc070ff, 0xff6ad8, 0xffffff], gravity: 9, jitter: 3 });
            fists.forEach(f => { f.anim = null; });
        },
        shake(v) { shake = Math.max(shake, v); },
        dispose() {
            scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); });
        }
    };
}
