/* =========================================================
   🌀 레이드 보스 장면 (boss3d.js)
   - 공통: 전투장 바닥·결계, 내 칭호(원 위에서 보스를 바라봄), 어깨 너머 카메라, 입자·번개·충격파
   - 보스마다: 모델 + 뒤 배경 + 공격 동작 (BOSS_BUILDERS)
       rift  균열의 군주  — 흑요석 거인, 떠 있는 두 주먹, 뒤에 차원 균열
       frost 서리 거신    — 얼음 골렘, 거대한 두 팔, 빙하 벽과 오로라, 눈보라
       magma 용암 비룡    — 용암 드래곤, 날개·꼬리·화염 숨결, 뒤에 화산
       storm 천공의 뇌조  — 번개 새, 거대한 날개, 먹구름과 낙뢰, 비
   무대 렌더러(aura3d)를 빌려서 그림 → stage.setTakeover(createBossScene(id))
   ========================================================= */

import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = THREE.MathUtils.lerp;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0.3, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 0, side: o.side ?? THREE.FrontSide });
const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
function box(parent, mat, w, h, d, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(BOX, mat);
    m.scale.set(w, h, d); m.position.set(x, y, z);
    parent.add(m);
    return m;
}
const sqRing = (size, th, mat) => {
    const g = new THREE.Group();
    box(g, mat, size, 0.04, th, 0, 0, size / 2); box(g, mat, size, 0.04, th, 0, 0, -size / 2);
    box(g, mat, th, 0.04, size, size / 2, 0, 0); box(g, mat, th, 0.04, size, -size / 2, 0, 0);
    return g;
};
// 떨어지거나 떠오르는 작은 입자 무리 (눈, 불씨, 비)
function drift(scene, n, mat, sx, sy, sz) {
    const m = new THREE.InstancedMesh(BOX, mat, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m);
    const P = Array.from({ length: n }, () => ({ x: rand(-22, 22), z: rand(-24, 14), ph: Math.random(), sp: rand(0.6, 1.4) }));
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(sx, sy, sz), V = new THREE.Vector3();
    return (t, f) => { P.forEach((p, i) => { const r = f(p, t); V.set(r[0], r[1], r[2]); E.set(r[3] || 0, r[4] || 0, r[5] || 0); Q.setFromEuler(E); M.compose(V, Q, S); m.setMatrixAt(i, M); }); m.instanceMatrix.needsUpdate = true; };
}

export const BOSS_THEMES = {
    rift:  { bg: 0x05030c, fog: [22, 60], floor: [0x0e0a18, 0x130d20, 0x0a0712], seam: 0x9a5aff, tint: 0xc070ff, ring2: 0xff6ad8, hemi: [0x7a5ab0, 0x0a0614], rim: 0xb86bff, core: 0xff4ad8 },
    frost: { bg: 0x070d1a, fog: [26, 70], floor: [0x2c3d52, 0x24344a, 0x34485e], seam: 0x9ff0ff, tint: 0x7ae8ff, ring2: 0xd8fbff, hemi: [0x8aa8d0, 0x0a1220], hemiI: 0.55, rim: 0x7ad0ff, core: 0x8af6ff },
    magma: { bg: 0x0c0403, fog: [24, 64], floor: [0x1c1310, 0x241713, 0x150e0c], seam: 0xff6a1a, tint: 0xff7a2a, ring2: 0xffc24a, hemi: [0xff9a5a, 0x1a0602], rim: 0xff5a1a, core: 0xffb03a },
    storm: { bg: 0x060912, fog: [24, 66], floor: [0x182030, 0x1e2838, 0x121722], seam: 0x5ac8ff, tint: 0x6ad0ff, ring2: 0xffe14d, hemi: [0x8aa8e0, 0x080c18], rim: 0x6a9aff, core: 0xffe14d }
};

export function createBossScene(bossId = 'rift') {
    const TH = BOSS_THEMES[bossId] || BOSS_THEMES.rift;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(TH.bg);
    scene.fog = new THREE.Fog(TH.bg, TH.fog[0], TH.fog[1]);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 220);
    const look = new THREE.Vector3(0, 4.9, 0);

    const hemi = new THREE.HemisphereLight(TH.hemi[0], TH.hemi[1], TH.hemiI ?? 0.85); scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(5, 10, 9); scene.add(key);
    const rimL = new THREE.DirectionalLight(TH.rim, 1.5); rimL.position.set(-6, 6, -6); scene.add(rimL);
    const coreLight = new THREE.PointLight(TH.core, 30, 18, 1.6); coreLight.position.set(0, 5.1, 2.4); scene.add(coreLight);
    const backLight = new THREE.PointLight(TH.tint, 35, 34, 1.4); backLight.position.set(0, 7, -7); scene.add(backLight);

    const WHITE = new THREE.Color(0xffffff);
    const BASE = new THREE.Color(TH.tint), RAGE = new THREE.Color(0xff3a3a), ICE = new THREE.Color(0x7ae8ff);
    const tint = new THREE.Color().copy(BASE);

    /* ---------- 바닥 ---------- */
    const floor = new THREE.Group(); scene.add(floor);
    const tileMat = TH.floor.map((c, i) => std(c, { rough: 0.75 + i * 0.05, metal: 0.2 }));
    const seamMat = glow(TH.seam, 0.35);
    const hotTiles = [];
    for (let x = -7; x <= 7; x++) for (let z = -6; z <= 6; z++) {
        box(floor, tileMat[(x * 7 + z * 3 + 99) % 3], 1.86, 0.4, 1.86, x * 1.9, -0.2 + rand(-0.05, 0.05), z * 1.9);
        if (Math.random() < 0.08) hotTiles.push({ m: box(floor, glow(TH.tint, 0), 1.7, 0.02, 1.7, x * 1.9, 0.02, z * 1.9), ph: Math.random() * 6 });
    }
    for (let i = -7; i <= 7; i++) { box(floor, seamMat, 28.5, 0.03, 0.06, 0, 0.01, i * 1.9 + 0.95); box(floor, seamMat, 0.06, 0.03, 25, i * 1.9 + 0.95, 0.01, 0); }
    const runeA = sqRing(7, 0.14, glow(TH.tint, 0.7)); runeA.position.y = 0.04; scene.add(runeA);
    const runeB = sqRing(5, 0.08, glow(TH.ring2, 0.6)); runeB.position.y = 0.05; runeB.rotation.y = Math.PI / 4; scene.add(runeB);
    const warnMat = glow(0xff2a4a, 0);
    box(scene, warnMat, 28, 0.02, 24, 0, 0.06, 2);

    /* ---------- 입자 (공용) ---------- */
    const PN = 300;
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
            if (p.home) { p.x += (p.home.x - p.x) * Math.min(1, dt * 3); p.y += (p.home.y - p.y) * Math.min(1, dt * 3); p.z += (p.home.z - p.z) * Math.min(1, dt * 3); }
            else {
                p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
                if (p.g && p.y < 0.1) { p.y = 0.1; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
            }
            p.rx += p.rs * dt;
            const k = Math.max(0, p.life / p.max);
            tmpE.set(p.rx, p.rx * 0.7, 0); tmpQ.setFromEuler(tmpE);
            tmpS.setScalar(p.size * (0.3 + 0.7 * k)); tmpP.set(p.x, p.y, p.z);
            tmpM.compose(tmpP, tmpQ, tmpS); pMesh.setMatrixAt(i, tmpM);
            tmpC.copy(p.c).multiplyScalar(0.25 + k * 0.85); pMesh.setColorAt(i, tmpC);
        }
        pMesh.instanceMatrix.needsUpdate = true;
        if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
    }
    // 하늘에서 내리치는 번개
    const bolts = Array.from({ length: 6 }, () => { const g = new THREE.Group(); g.visible = false; scene.add(g); for (let i = 0; i < 9; i++) box(g, glow(0xbfe6ff, 1), 0.2, 1.8, 0.2); return { g, life: 0 }; });
    function bolt(x, z, color = 0xbfe6ff) {
        const b = bolts.find(o => o.life <= 0) || bolts[0];
        b.life = 0.24; b.g.visible = true;
        let px = x + rand(-1, 1), py = 18;
        b.g.children.forEach(m => { m.material.color.setHex(color); const ny = py - 2, nx = x + rand(-0.7, 0.7); m.position.set((px + nx) / 2, (py + ny) / 2, z); m.rotation.z = -Math.atan2(nx - px, 2); px = nx; py = ny; });
        emit(10, { x, y: 0.3, z, spread: 0.5, speed: 7, life: 0.5, size: 0.22, color: [color, 0xffffff] });
    }
    const slash = box(scene, glow(0xffffff, 0), 9, 0.35, 0.1, 0, 5.3, 2.6);
    let slashT = 0;
    const wave = sqRing(1, 0.35, glow(TH.tint, 0)); wave.position.y = 0.1; scene.add(wave);
    let waveT = -1;

    /* ---------- 상태 ---------- */
    const player = new THREE.Group(); player.scale.setScalar(0.55); scene.add(player);
    const PR = 8.5;
    let ang = 0, angT = 0, lungeT = 0, recoilT = 0, flinch = 0;
    const toBoss = new THREE.Vector3();
    let t = 0, shake = 0, flashBody = 0;
    let chargeT = 0, chargeDur = 1, stunned = false, enraged = false, dead = false, deadT = 0;
    let entryT = 0;

    /* ---------- 보스 ---------- */
    const boss = new THREE.Group(); scene.add(boss);
    const body = new THREE.Group(); boss.add(body);
    const ctx = {
        THREE, scene, boss, body, box, std, glow, sqRing, emit, rand, bolt, drift, TH,
        shake: v => { shake = Math.max(shake, v); },
        wave: () => { waveT = 0; },
        playerPos: () => player.position,
        mouthDir: new THREE.Vector3()
    };
    const B = (BOSS_BUILDERS[bossId] || BOSS_BUILDERS.rift)(ctx);
    const H = B.H || 9.6;

    // 기절 표시
    const stunStars = Array.from({ length: 5 }, () => { const m = box(scene, glow(0xfff6a0, 1), 0.22, 0.22, 0.22); m.visible = false; return m; });

    function update(dt, W, H2) {
        t += dt; entryT = Math.min(1, entryT + dt * 0.6);
        ang += (angT - ang) * Math.min(1, dt * 9);
        lungeT = Math.max(0, lungeT - dt); recoilT = Math.max(0, recoilT - dt);
        const push = Math.sin(lungeT / 0.25 * Math.PI) * 0.9 - Math.sin(recoilT / 0.35 * Math.PI) * 0.8;
        const sx = Math.sin(ang), sz = Math.cos(ang);
        player.position.set(sx * (PR - push), 0, sz * (PR - push));
        player.rotation.y = ang + Math.PI;
        // 어깨 너머 카메라 (등장할 땐 높은 곳에서 내려오며 다가옴)
        const aspect = W / H2;
        const e = 1 - Math.pow(1 - entryT, 3);
        const back = (aspect < 0.7 ? 13 : 10) + (1 - e) * 10;
        const side = aspect < 0.7 ? 2.6 : 3.4;
        camera.position.set(sx * (PR + back) + sz * side, 6.4 + (1 - e) * 7 + Math.sin(t * 0.4) * 0.12, sz * (PR + back) - sx * side);
        if (shake > 0.001) { camera.position.x += rand(-1, 1) * shake; camera.position.y += rand(-1, 1) * shake; shake *= Math.pow(0.015, dt); }
        look.set(sx * 1.5, 4.6 + (H - 9.6) * 0.3, sz * 1.5);
        camera.lookAt(look);
        boss.rotation.y += (ang - boss.rotation.y) * Math.min(1, dt * 3);
        flinch *= Math.pow(0.002, dt);
        body.position.z = -flinch;

        tint.lerp(stunned ? ICE : enraged ? RAGE : BASE, Math.min(1, dt * 3));
        seamMat.color.copy(tint).multiplyScalar(0.8);
        runeA.children[0].material.color.copy(tint);
        hotTiles.forEach(h => { h.m.material.opacity = Math.max(0, Math.sin(t * 1.2 + h.ph)) * 0.35; h.m.material.color.copy(tint); });
        runeA.rotation.y = t * 0.15; runeB.rotation.y = Math.PI / 4 - t * 0.25;
        backLight.color.copy(tint);

        const ch = chargeT > 0 ? 1 - chargeT / chargeDur : 0;
        if (!dead) {
            boss.position.y = (1 - e) * -7;
            const fl = flashBody;
            B.mats.forEach(m => { if (!m.userData.em0) m.userData.em0 = m.emissive.clone(), m.userData.ei0 = m.emissiveIntensity; m.emissive.copy(m.userData.em0).lerp(WHITE, Math.min(0.6, fl * 0.7)); m.emissiveIntensity = m.userData.ei0 + fl * 0.45; });
            if (B.coreMat) {
                B.coreMat.emissive.copy(stunned ? ICE : enraged ? RAGE : new THREE.Color(TH.core)).lerp(WHITE, ch * 0.8);
                B.coreMat.emissiveIntensity = (stunned ? 0.6 : 2.2) + ch * 5;
            }
            coreLight.intensity = (stunned ? 8 : 30) + ch * 120;
            coreLight.color.copy(B.coreMat ? B.coreMat.emissive : tint);
            if (B.coreG) B.coreG.getWorldPosition(coreLight.position);
            (B.eyeMats || []).forEach(m => m.color.copy(stunned ? ICE : enraged ? RAGE : new THREE.Color(B.eyeColor ?? TH.core)));
            (B.tintMats || []).forEach(m => m.color.copy(tint));
            if (chargeT > 0) {
                chargeT -= dt;
                if (B.coreG && Math.random() < dt * 40) emit(1, { x: rand(-7, 7), y: rand(0.5, 11), z: rand(-2, 5), spread: 0, speed: 0, life: 0.9, size: 0.2, color: [0xffffff, TH.core], home: B.coreG.getWorldPosition(new THREE.Vector3()) });
                warnMat.opacity = 0.08 + Math.abs(Math.sin(t * (6 + ch * 14))) * (0.12 + ch * 0.25);
            } else warnMat.opacity *= Math.pow(0.001, dt);
        } else {
            deadT += dt;
            boss.position.y -= dt * deadT * 1.5;
            body.rotation.z += dt * 0.3;
            boss.scale.setScalar(Math.max(0.01, 1 - deadT * 0.35));
            coreLight.intensity = Math.max(0, 200 - deadT * 120);
        }
        B.update(t, dt, { ch, charging: chargeT > 0, stunned, enraged, dead, deadT, tint });
        stunStars.forEach((m, i) => { m.visible = stunned && !dead; const a = t * 4 + i * 1.26; m.position.set(Math.cos(a) * 1.4, H + 0.4 + boss.position.y + Math.sin(t * 6 + i) * 0.1, Math.sin(a) * 1.4); m.rotation.set(t * 3, t * 2, 0); });
        if (slashT > 0) { slashT -= dt; slash.material.opacity = Math.max(0, slashT / 0.3); slash.scale.x = 9 * (1.3 - slashT); }
        if (waveT >= 0) { waveT += dt; const s = 1 + waveT * 26; wave.scale.set(s, 1, s); wave.children[0].material.opacity = Math.max(0, 0.9 - waveT * 1.4); wave.children[0].material.color.copy(tint); if (waveT > 0.8) waveT = -1; }
        bolts.forEach(b => { if (b.life > 0) { b.life -= dt; b.g.visible = b.life > 0 && Math.sin(t * 90) > -0.4; } });
        flashBody *= Math.pow(0.0005, dt);
        updateParts(dt);
    }

    const front = () => { const l = rand(-1.5, 1.5); return { x: Math.sin(ang) * 1.6 + Math.cos(ang) * l, y: (B.hitY || 5) + rand(-1.4, 1.6) + boss.position.y, z: Math.cos(ang) * 1.6 - Math.sin(ang) * l }; };
    function shot(color, n, size) {
        const px = player.position.x, pz = player.position.z;
        toBoss.set(-px, ((B.hitY || 5) - 2.4) / 8, -pz).normalize();
        emit(n, { x: px + toBoss.x * 1.2, y: 2.4, z: pz + toBoss.z * 1.2, spread: 0.25, spreadZ: 0.25, speed: 26, dir: [toBoss.x, toBoss.y, toBoss.z], life: 0.32, size, color: [color, 0xffffff] });
    }

    return {
        scene, camera, update, player, H,
        attack() { if (!dead && !stunned) B.attack(); },
        charge(dur) { if (dead) return; chargeT = chargeDur = dur; B.charge?.(dur); },
        slam() { if (dead) return; chargeT = 0; B.slam(); },
        cancel() { chargeT = 0; },
        setStun(v) { if (v && !stunned) { emit(30, { ...front(), spread: 2.5, speed: 5, life: 0.8, size: 0.3, color: [0xbff4ff, 0x7ae8ff, 0xffffff] }); chargeT = 0; } stunned = v; },
        setEnrage(v) { if (v && !enraged) { shake = 0.5; emit(50, { x: 0, y: 5, z: 1, spread: 2, speed: 10, life: 1, size: 0.3, color: [0xff3a3a, 0xff9a3a] }); } enraged = v; },
        setHp() {},
        dodge(dir) { angT = Math.max(-1.1, Math.min(1.1, angT + dir * 0.55)); },
        lunge(color = 0xffffff, big = false) { lungeT = 0.25; shot(color, big ? 18 : 5, big ? 0.35 : 0.2); },
        recoil() { recoilT = 0.35; },
        hit(power = 0.3, color = 0xffffff) {
            if (dead) return;
            flinch = Math.max(flinch, 0.15 + power * 0.45);
            flashBody = Math.max(flashBody, 0.15 + power * 0.4);
            emit(4 + Math.round(power * 12), { ...front(), spread: 0.3, speed: 4 + power * 6, life: 0.45, size: 0.14 + power * 0.12, color: [color, 0xffffff], jitter: 1.5 });
            if (power > 0.6) shake = Math.max(shake, 0.18);
        },
        // 내 필살기 연출 (속성별)
        skillFx(type, color = 0xffffff) {
            if (dead) return;
            const p = front();
            if (type === 'strike' || type === 'rend') {
                slashT = 0.3; slash.material.color.setHex(color); slash.position.set(Math.sin(ang) * 2.6, (B.hitY || 5) + 0.3, Math.cos(ang) * 2.6); slash.rotation.set(0, ang, rand(-0.9, -0.3) * (Math.random() < 0.5 ? 1 : -1)); shake = Math.max(shake, 0.3);
                emit(26, { ...p, spread: 1.4, speed: 9, life: 0.6, size: 0.25, color: [color, 0xffffff], jitter: 3 });
                if (type === 'rend') { waveT = 0; emit(24, { ...p, spread: 2, speed: 12, life: 0.7, size: 0.28, color: [0xff6ad8, 0xc070ff] }); }
            } else if (type === 'chain') {
                [0, 140, 280].forEach(d => setTimeout(() => { bolt(p.x + rand(-1.5, 1.5), p.z + rand(-1, 1), color); shake = Math.max(shake, 0.15); }, d));
            } else if (type === 'burn') {
                emit(46, { ...p, spread: 1.8, spreadY: 1.5, speed: 3, dir: [0, 1, 0.3], life: 1.2, size: 0.32, color: [0xff6a1a, 0xffc24a, 0xff2a2a], jitter: 1 });
            } else if (type === 'freeze') {
                emit(40, { ...p, spread: 2.2, speed: 5, life: 0.9, size: 0.32, color: [0xbff4ff, 0x7ae8ff] });
            } else if (type === 'drain') {
                emit(30, { ...p, spread: 1, speed: 6, dir: [Math.sin(ang), -0.2, Math.cos(ang)], life: 0.9, size: 0.22, color: [0xa070ff, 0x3a0a6a] });
            }
        },
        die() {
            if (dead) return;
            dead = true; deadT = 0; shake = 1.2; chargeT = 0; warnMat.opacity = 0;
            emit(130, { x: 0, y: H * 0.55, z: 0.5, spread: 2.5, spreadY: 3, speed: 12, life: 2.4, size: 0.5, color: [TH.floor[0], TH.tint, TH.core, 0xffffff], gravity: 9, jitter: 3 });
        },
        shake(v) { shake = Math.max(shake, v); },
        dispose() { scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }); }
    };
}

/* =========================================================
   보스 모델들
   각 함수는 { mats(피격 때 번쩍일 재질), coreMat/coreG(충전 때 달아오르는 핵), eyeMats, tintMats,
              H(머리 꼭대기 높이), hitY(맞는 높이), update(t, dt, s), attack(), slam(), charge?() } 를 돌려줌
   ========================================================= */
const BOSS_BUILDERS = {

    /* 🌀 균열의 군주 — 흑요석 거인 + 떠 있는 두 주먹 + 수정 왕관, 뒤에 세로로 찢어진 차원 균열 */
    rift(c) {
        const { scene, boss, body, box, std, glow, sqRing, emit, rand } = c;
        const obsidian = std(0x1b1428, { rough: 0.35, metal: 0.45, emissive: 0x2a0a4a, ei: 0.35 });
        const obsidian2 = std(0x261b38, { rough: 0.4, metal: 0.4, emissive: 0x1a0630, ei: 0.3 });
        const crackMat = glow(0xc070ff, 1), eyeMat = glow(0xff6ad8, 1);
        const crystalMat = std(0x9a6aff, { emissive: 0x7a3aff, ei: 1.1, metal: 0.1, rough: 0.15 });
        // 뒤 균열
        const rift = new THREE.Group(); rift.position.set(0, 7.5, -8); scene.add(rift);
        const bars = [];
        for (let i = 0; i < 46; i++) {
            const k = i / 45, y = (k - 0.5) * 17, w = Math.pow(Math.sin(k * Math.PI), 0.8) * 3.4 * (0.75 + 0.25 * Math.sin(i * 1.7));
            bars.push({ core: box(rift, glow(0xffffff, 0.55), Math.max(0.05, w * 0.18), 0.42, 0.1, Math.sin(i * 0.9) * 0.3, y, 0.1), mid: box(rift, glow(0xff6ad8, 0.55), w * 0.6, 0.4, 0.1, Math.sin(i * 0.9) * 0.3, y, 0), out: box(rift, glow(0x7a3aff, 0.35), w, 0.38, 0.1, Math.sin(i * 0.9) * 0.3, y, -0.1), w, ph: i * 0.37 });
        }
        const debris = Array.from({ length: 26 }, (_, i) => ({ m: box(scene, i % 3 ? obsidian : std(0x2a1a44, { emissive: 0x6a2aff, ei: 0.6 }), rand(0.3, 1.1), rand(0.3, 1.1), rand(0.3, 1.1)), a: rand(0, 6.28), r: rand(7, 13), y: rand(1.5, 13), sp: rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1), rs: rand(0.2, 0.8) }));
        // 몸
        [[2.6, 1.0, 3.6], [2.0, 0.9, 2.75], [1.4, 0.8, 2.0], [0.8, 0.6, 1.35]].forEach(([w, h, y], i) => box(body, i % 2 ? obsidian2 : obsidian, w, h, w * 0.75, 0, y, 0));
        box(body, obsidian, 3.4, 3.0, 2.0, 0, 5.2, 0);
        box(body, obsidian2, 3.6, 0.5, 2.2, 0, 3.9, 0);
        box(body, obsidian2, 2.2, 0.9, 2.3, 0, 6.5, 0);
        [[-1.1, 5.9, 0.08, 1.1, 0.4], [-0.7, 4.6, 0.08, 0.9, -0.5], [1.0, 5.7, 0.08, 1.2, -0.35], [0.8, 4.4, 0.08, 0.8, 0.6], [-1.4, 4.9, 0.06, 0.6, 1.2], [1.45, 5.0, 0.06, 0.5, -1.1]]
            .forEach(([x, y, w, h, rz]) => { box(body, crackMat, w, h, 0.05, x, y, 1.02).rotation.z = rz; });
        const coreG = new THREE.Group(); coreG.position.set(0, 5.15, 1.05); body.add(coreG);
        const coreMat = std(0xff4ad8, { emissive: 0xff4ad8, ei: 2.2, metal: 0.2, rough: 0.2 });
        box(coreG, coreMat, 0.8, 0.8, 0.3);
        box(coreG, std(0x3a2a5a, { metal: 0.8, rough: 0.25 }), 1.15, 1.15, 0.2, 0, 0, -0.08).rotation.z = Math.PI / 4;
        const halo = box(coreG, glow(0xff6ad8, 0.45), 1.6, 1.6, 0.02, 0, 0, 0.18); halo.rotation.z = Math.PI / 4;
        for (const s of [-1, 1]) {
            box(body, obsidian2, 1.5, 1.1, 1.7, s * 2.35, 6.35, 0); box(body, obsidian, 1.2, 0.3, 1.4, s * 2.35, 6.98, 0);
            for (let i = 0; i < 3; i++) box(body, crystalMat, 0.24, 1.1 - i * 0.2, 0.24, s * (2.0 + i * 0.4), 7.5 - i * 0.1, (i - 1) * 0.4).rotation.z = -s * (0.35 + i * 0.25);
        }
        const head = new THREE.Group(); head.position.set(0, 7.45, 0.1); body.add(head);
        box(head, obsidian, 1.5, 1.35, 1.4); box(head, obsidian2, 1.6, 0.35, 1.5, 0, 0.45, 0); box(head, obsidian2, 1.3, 0.25, 0.1, 0, -0.4, 0.7);
        [-0.36, 0.36].forEach(x => box(head, eyeMat, 0.42, 0.13, 0.06, x, 0.05, 0.72));
        const crown = new THREE.Group(); crown.position.set(0, 9.0, 0.1); body.add(crown);
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, tall = i % 2 ? 0.9 : 1.5; box(crown, crystalMat, 0.26, tall, 0.26, Math.cos(a), tall / 2, Math.sin(a)).rotation.set(0, -a, Math.cos(a) * 0.15); }
        crown.add(sqRing(2.1, 0.08, glow(0xff9aec, 0.7)));
        const fists = [-1, 1].map(s => {
            const g = new THREE.Group(); boss.add(g);
            box(g, obsidian, 1.6, 1.5, 1.6); box(g, obsidian2, 1.7, 0.4, 1.7, 0, -0.55, 0);
            for (let i = 0; i < 4; i++) box(g, obsidian2, 0.34, 0.34, 0.3, (i - 1.5) * 0.38, 0.3, 0.88);
            const band = box(g, glow(0xc070ff, 0.85), 1.72, 0.1, 1.72, 0, -0.25, 0);
            box(g, crystalMat, 0.3, 0.9, 0.3, s * 0.3, 0.95, -0.2).rotation.z = -s * 0.4;
            const home = new THREE.Vector3(s * 3.7, 4.7, 0.9); g.position.copy(home);
            return { g, s, home, band, anim: null };
        });
        const orbit = Array.from({ length: 12 }, (_, i) => box(boss, i % 2 ? crystalMat : glow(0xff6ad8, 0.9), 0.22, 0.22, 0.22));
        let side = 0;
        return {
            mats: [obsidian, obsidian2], coreMat, coreG, eyeMats: [eyeMat], eyeColor: 0xff6ad8, tintMats: [crackMat, ...fists.map(f => f.band.material)], H: 9.6, hitY: 5,
            attack() { const f = fists[side = 1 - side]; if (!f.anim) f.anim = { type: 'punch', t: 0, dur: 0.75 }; },
            slam() { fists.forEach(f => { f.anim = { type: 'slam', t: 0, dur: 1.2 }; }); setTimeout(() => { c.wave(); c.shake(0.9); emit(40, { x: 0, y: 0.4, z: 2.5, spread: 5, spreadY: 0.1, spreadZ: 2, speed: 9, life: 1, size: 0.35, color: [0xc070ff, 0xffffff, 0x2a1a44], gravity: 14, jitter: 3 }); }, 280); },
            update(t, dt, s) {
                bars.forEach((b, i) => {
                    const f = 0.8 + 0.2 * Math.sin(t * 6 + b.ph) + (s.enraged ? 0.15 * Math.sin(t * 17 + i) : 0), open = s.dead ? Math.max(0, 1 - s.deadT * 0.6) : 1;
                    b.out.scale.x = b.w * f * open; b.mid.scale.x = b.w * 0.6 * f * open; b.core.scale.x = Math.max(0.05, b.w * 0.18 * f) * open;
                    b.out.material.color.copy(s.tint).multiplyScalar(0.7);
                });
                if (Math.random() < dt * 7 && !s.dead) emit(1, { x: rand(-1.5, 1.5), y: rand(1, 14), z: -7.8, spread: 0.3, speed: 2, dir: [rand(-1, 1), rand(-0.2, 0.4), 1], life: 3, size: 0.18, color: [s.tint.getHex(), 0xff6ad8] });
                debris.forEach(d => { d.a += d.sp * dt; d.m.position.set(Math.cos(d.a) * d.r, d.y + Math.sin(t * 0.6 + d.a) * 0.5, Math.sin(d.a) * d.r - 3); d.m.rotation.x += d.rs * dt; d.m.rotation.y += d.rs * 0.7 * dt; });
                if (s.dead) return;
                boss.position.y += Math.sin(t * 1.3) * 0.18;
                body.rotation.z = s.stunned ? Math.sin(t * 2) * 0.05 + 0.06 : Math.sin(t * 0.7) * 0.015;
                head.rotation.y = Math.sin(t * 0.5) * 0.15;
                crown.rotation.y = t * 0.5; crown.position.y = 9.0 + Math.sin(t * 2) * 0.12;
                coreG.scale.setScalar((1 + Math.sin(t * 3) * 0.08) * (1 + s.ch * 0.9)); halo.rotation.z = Math.PI / 4 + t * 1.2;
                orbit.forEach((m, i) => { const a = t * 0.8 + (i / orbit.length) * Math.PI * 2; m.position.set(Math.cos(a) * 4.4, 5 + Math.sin(a * 2 + t) * 0.6, Math.sin(a) * 2.2); m.rotation.set(t * 2 + i, t * 3, 0); });
                fists.forEach((f, i) => {
                    const a = f.anim;
                    let px = f.home.x, py = f.home.y + Math.sin(t * 1.7 + i * 2) * 0.3, pz = f.home.z, rx = 0;
                    if (s.charging) { const k = Math.min(1, s.ch * 2.5); py = lerp(py, 10.2, k); px = lerp(px, f.s * 2.2, k); rx = -0.6 * k; }
                    if (a) {
                        a.t += dt; const k = a.t / a.dur;
                        if (a.type === 'punch') {
                            const back = k < 0.45 ? Math.sin(k / 0.45 * Math.PI / 2) : 1, fwd = k < 0.45 ? 0 : k < 0.62 ? (k - 0.45) / 0.17 : Math.max(0, 1 - (k - 0.62) / 0.38);
                            pz += -1.6 * back * (1 - fwd) + 6.5 * fwd; px *= 1 - fwd * 0.55; py += 0.8 * back - fwd * 0.6; rx = fwd * 0.4;
                            if (!a.hit && k >= 0.6) { a.hit = true; c.shake(0.25); }
                        } else {
                            const k2 = Math.min(1, k / 0.25);
                            py = lerp(10.2, 0.9, k2 * k2); px = lerp(f.s * 2.2, f.s * 2.0, k2); pz = lerp(0.9, 3.2, k2); rx = -0.6 + k2 * 0.6;
                            if (k > 0.25) { const b2 = Math.min(1, (k - 0.25) / 0.75); py = lerp(0.9, f.home.y, b2 * b2); px = lerp(f.s * 2.0, f.home.x, b2); pz = lerp(3.2, f.home.z, b2); }
                        }
                        if (k >= 1) f.anim = null;
                    }
                    f.g.position.set(px, py + boss.position.y * 0, pz); f.g.rotation.set(rx, Math.sin(t * 0.9 + i) * 0.2, Math.sin(t + i) * 0.1);
                });
            }
        };
    },

    /* ❄ 서리 거신 — 얼음 갑옷 골렘, 거대한 두 팔, 등에 솟은 빙정, 뒤에 빙하 절벽과 오로라, 눈보라 */
    frost(c) {
        const { scene, boss, body, box, std, glow, emit, rand, drift } = c;
        const ice = std(0x6aa8d8, { rough: 0.2, metal: 0.3, emissive: 0x0a2a4a, ei: 0.3 });
        const rock = std(0x9fb0c4, { rough: 0.9, metal: 0.05, emissive: 0x0a1420, ei: 0.15 });
        const deep = std(0x24507a, { rough: 0.25, metal: 0.3, emissive: 0x061a30, ei: 0.3 });
        const crystal = std(0xa8e8ff, { rough: 0.05, metal: 0.1, emissive: 0x2a9ad8, ei: 0.8 });
        const lineMat = glow(0x9ff0ff, 0.9), eyeMat = glow(0x8af6ff, 1);
        // 빙하 절벽 (반원으로 둘러쌈)
        const cliff = new THREE.Group(); scene.add(cliff);
        for (let i = 0; i < 18; i++) {
            const a = -1.3 + (i / 17) * 2.6, r = rand(17, 22), h = rand(7, 17);
            const m = box(cliff, i % 3 ? std(0x5a7a98, { rough: 0.3, emissive: 0x0a2a4a, ei: 0.3 }) : deep, rand(2.5, 4.5), h, rand(2, 3.5), Math.sin(a) * r, h / 2 - 0.5, -Math.cos(a) * r);
            m.rotation.y = -a + rand(-0.2, 0.2);
            box(cliff, rock, m.scale.x * 1.05, 0.5, m.scale.z * 1.05, m.position.x, h - 0.4, m.position.z).rotation.y = m.rotation.y;
        }
        // 오로라 (하늘에 물결치는 빛의 띠 세 줄)
        const aurora = [0x7dff9a, 0x5ae0ff, 0xb07aff].map((col, k) => Array.from({ length: 34 }, (_, i) => ({ m: box(scene, glow(col, 0.28), 1.3, 3.2, 0.1, (i - 17) * 1.25, 17 + k * 1.6, -26 - k * 2), i, k })));
        // 눈보라
        const snow = drift(scene, 140, new THREE.MeshBasicMaterial({ color: 0xdfefff, transparent: true, opacity: 0.6 }), 0.1, 0.1, 0.1);
        // 몸: 다리 + 허리 + 몸통
        for (const s of [-1, 1]) { box(body, deep, 1.5, 2.6, 1.5, s * 1.15, 1.3, 0); box(body, rock, 1.8, 0.6, 2.1, s * 1.15, 0.3, 0.2); box(body, ice, 1.6, 0.6, 1.6, s * 1.15, 2.4, 0.05); }
        box(body, deep, 3.4, 1.0, 2.0, 0, 3.0, 0);
        box(body, ice, 4.2, 3.4, 2.5, 0, 5.1, 0);
        box(body, rock, 4.4, 0.8, 2.7, 0, 6.6, 0);
        box(body, deep, 2.4, 1.6, 0.3, 0, 4.4, 1.3);
        [[-1.2, 5.6, 0.5], [1.1, 4.6, -0.6], [-0.6, 4.2, 1.0], [1.4, 6.0, 0.3]].forEach(([x, y, rz]) => box(body, lineMat, 0.07, 1.0, 0.05, x, y, 1.27).rotation.z = rz);
        // 가슴 핵 (얼음 결정)
        const coreG = new THREE.Group(); coreG.position.set(0, 5.3, 1.3); body.add(coreG);
        const coreMat = std(0x8af6ff, { emissive: 0x8af6ff, ei: 2.2, rough: 0.05 });
        const core = box(coreG, coreMat, 0.75, 0.75, 0.75); core.rotation.set(0.6, 0.6, 0);
        const halo = box(coreG, glow(0xd8fbff, 0.4), 1.5, 1.5, 0.02, 0, 0, 0.3); halo.rotation.z = Math.PI / 4;
        // 등 빙정
        const spikes = [];
        for (let i = 0; i < 7; i++) { const sp = box(body, crystal, 0.4, rand(1.8, 3.4), 0.4, (i - 3) * 0.6, 7 + rand(0, 0.6), -1.1 - Math.abs(i - 3) * 0.1); sp.rotation.set(-0.5, 0, (i - 3) * 0.18); spikes.push(sp); }
        // 머리: 얼음 투구 + 고드름 수염 + 큰 뿔 두 개
        const head = new THREE.Group(); head.position.set(0, 7.75, 0.3); body.add(head);
        box(head, rock, 1.7, 1.5, 1.6); box(head, ice, 1.85, 0.4, 1.75, 0, 0.6, 0); box(head, deep, 1.5, 0.3, 0.1, 0, 0.15, 0.82);
        [-0.38, 0.38].forEach(x => box(head, eyeMat, 0.36, 0.14, 0.06, x, 0.12, 0.85));
        for (let i = 0; i < 6; i++) box(head, crystal, 0.16, rand(0.4, 0.9), 0.16, (i - 2.5) * 0.25, -0.95, 0.7).rotation.z = rand(-0.15, 0.15);
        for (const s of [-1, 1]) { let px = s * 0.9, py = 0.6; for (let k = 0; k < 4; k++) { const seg = box(head, k % 2 ? crystal : ice, 0.32 - k * 0.05, 0.75, 0.32 - k * 0.05, px + s * 0.25, py + 0.3, -0.1 - k * 0.12); seg.rotation.z = -s * (0.5 + k * 0.35); px += s * 0.42; py += 0.45 - k * 0.08; } }
        // 팔 (어깨 → 팔꿈치 → 주먹)
        const arms = [-1, 1].map(s => {
            const sh = new THREE.Group(); sh.position.set(s * 2.75, 6.3, 0); body.add(sh);
            box(sh, rock, 2.0, 1.6, 2.0, s * 0.3, 0.3, 0);
            for (let i = 0; i < 3; i++) box(sh, crystal, 0.28, 1.2 - i * 0.2, 0.28, s * (0.4 + i * 0.4), 1.4, (i - 1) * 0.5).rotation.z = -s * (0.3 + i * 0.25);
            box(sh, ice, 1.2, 2.2, 1.2, s * 0.25, -1.3, 0);
            const el = new THREE.Group(); el.position.set(s * 0.25, -2.4, 0); sh.add(el);
            box(el, deep, 1.3, 1.9, 1.3, 0, -1, 0);
            box(el, rock, 1.9, 1.7, 1.9, 0, -2.6, 0.1);
            for (let i = 0; i < 4; i++) box(el, crystal, 0.3, 0.5, 0.3, (i - 1.5) * 0.42, -2.3, 1.1).rotation.x = 0.6;
            box(el, lineMat, 1.95, 0.08, 1.95, 0, -1.9, 0.1);
            return { sh, el, s, anim: null };
        });
        // 바닥에서 솟는 얼음 가시 (내려찍기)
        const rise = Array.from({ length: 18 }, (_, i) => { const m = box(scene, crystal, 0.6, 3, 0.6, 0, -2, 0); m.visible = false; return { m, a: (i / 18) * Math.PI * 2, r: rand(2.5, 9) }; });
        let riseT = -1, side = 0;
        return {
            mats: [ice, rock, deep], coreMat, coreG, eyeMats: [eyeMat], eyeColor: 0x8af6ff, tintMats: [lineMat], H: 10.6, hitY: 5.2,
            attack() { const a = arms[side = 1 - side]; if (!a.anim) a.anim = { type: 'smash', t: 0, dur: 0.85 }; },
            slam() {
                arms.forEach(a => { a.anim = { type: 'both', t: 0, dur: 1.1 }; });
                setTimeout(() => {
                    c.wave(); c.shake(1);
                    riseT = 0;
                    const pp = c.playerPos();
                    rise.forEach(o => { o.m.visible = true; o.m.position.set(pp.x * 0.5 + Math.cos(o.a) * o.r, -2, pp.z * 0.5 + Math.sin(o.a) * o.r); o.m.rotation.set(rand(-0.3, 0.3), rand(0, 3), rand(-0.3, 0.3)); });
                    emit(46, { x: 0, y: 0.4, z: 3, spread: 5, spreadY: 0.1, spreadZ: 2, speed: 9, life: 1.1, size: 0.3, color: [0xffffff, 0x9ff0ff], gravity: 12, jitter: 3 });
                }, 300);
            },
            update(t, dt, s) {
                snow(t, (p, tt) => { const k = (tt * 0.12 * p.sp + p.ph) % 1; return [p.x + Math.sin(tt * 0.8 + p.ph * 9) * 1.5 + k * 6, 20 - k * 21, p.z, tt + p.ph, tt * 0.5]; });
                aurora.forEach(row => row.forEach(o => { o.m.position.y = 17 + o.k * 1.6 + Math.sin(t * 0.7 + o.i * 0.35 + o.k) * 1.2; o.m.material.opacity = 0.16 + 0.14 * Math.sin(t * 1.3 + o.i * 0.5 + o.k * 2); }));
                if (riseT >= 0) { riseT += dt; const k = riseT < 0.2 ? riseT / 0.2 : riseT > 1.2 ? Math.max(0, 1 - (riseT - 1.2) / 0.4) : 1; rise.forEach(o => { o.m.position.y = -2 + k * 2.8; }); if (riseT > 1.6) { riseT = -1; rise.forEach(o => { o.m.visible = false; }); } }
                if (s.dead) return;
                boss.position.y += Math.sin(t * 0.9) * 0.06;
                body.rotation.z = s.stunned ? 0.06 + Math.sin(t * 2) * 0.04 : Math.sin(t * 0.6) * 0.012;
                head.rotation.y = Math.sin(t * 0.4) * 0.12;
                coreG.scale.setScalar((1 + Math.sin(t * 2.4) * 0.07) * (1 + s.ch * 0.8)); core.rotation.y = t; halo.rotation.z = Math.PI / 4 + t * 0.8;
                spikes.forEach((sp, i) => { sp.material.emissiveIntensity = 1.1 + Math.sin(t * 3 + i) * 0.3 + s.ch * 2; });
                if (Math.random() < dt * 3) emit(2, { x: Math.sin(boss.rotation.y) * 1.4, y: 7.4, z: Math.cos(boss.rotation.y) * 1.4, spread: 0.2, speed: 1.5, dir: [Math.sin(boss.rotation.y), -0.2, Math.cos(boss.rotation.y)], life: 1.2, size: 0.25, color: [0xffffff, 0xbff4ff] });
                arms.forEach((a, i) => {
                    let rx = Math.sin(t * 1.1 + i) * 0.06, ez = 0, er = -0.15;
                    if (s.charging) { const k = Math.min(1, s.ch * 2.2); rx = lerp(rx, -2.8, k); er = lerp(er, -0.3, k); }
                    if (a.anim) {
                        a.anim.t += dt; const k = a.anim.t / a.anim.dur;
                        if (a.anim.type === 'smash') {
                            const up = k < 0.45 ? Math.sin(k / 0.45 * Math.PI / 2) : 1, down = k < 0.45 ? 0 : k < 0.6 ? (k - 0.45) / 0.15 : Math.max(0, 1 - (k - 0.6) / 0.4);
                            rx = -2.6 * up * (1 - down) - 1.25 * down; er = -0.5 * up * (1 - down);
                            if (!a.anim.hit && k > 0.58) { a.anim.hit = true; c.shake(0.3); }
                        } else {
                            const k2 = Math.min(1, k / 0.25); rx = lerp(-2.8, -0.95, k2 * k2); er = -0.3;
                            if (k > 0.3) rx = lerp(-0.95, 0, Math.min(1, (k - 0.3) / 0.7));
                        }
                        if (k >= 1) a.anim = null;
                    }
                    a.sh.rotation.set(rx, 0, a.s * 0.08 + ez); a.el.rotation.x = er;
                });
            }
        };
    },

    /* 🔥 용암 비룡 — 현무암 비늘의 드래곤, 갈라진 틈에서 용암이 빛남, 화염 숨결, 뒤에 분화하는 화산 */
    magma(c) {
        const { scene, boss, body, box, std, glow, emit, rand, drift } = c;
        const scale = std(0x2a1610, { rough: 0.55, metal: 0.35, emissive: 0x3a0a00, ei: 0.45 });
        const scale2 = std(0x3c1e14, { rough: 0.6, metal: 0.3, emissive: 0x2a0800, ei: 0.4 });
        const horn = std(0x1a1210, { rough: 0.4, metal: 0.5 });
        const memb = std(0x6a1a08, { rough: 0.7, metal: 0.1, emissive: 0xff3a0a, ei: 0.35, side: THREE.DoubleSide });
        const lava = glow(0xff7a2a, 0.95), eyeMat = glow(0xffd23a, 1);
        // 화산 셋 + 흘러내리는 용암
        const volc = new THREE.Group(); scene.add(volc);
        const lavaStrips = [];
        [[-16, -24, 15], [2, -30, 21], [18, -23, 13]].forEach(([x, z, h]) => {
            for (let k = 0; k < 6; k++) { const w = (6 - k) * 2.6; box(volc, k % 2 ? std(0x1a100c, { rough: 0.95 }) : std(0x24160f, { rough: 0.95 }), w, h / 6, w * 0.8, x, h / 12 + k * h / 6, z); }
            box(volc, glow(0xff6a1a, 0.9), 2.4, 0.3, 2, x, h + 0.1, z);
            for (let r = 0; r < 3; r++) lavaStrips.push(box(volc, glow(0xff5a1a, 0.4), 0.3, h * 0.9, 0.2, x + (r - 1) * 2.2, h * 0.45, z + 6.5 - Math.abs(r - 1)));
        });
        const embers = drift(scene, 110, glow(0xff8a2a, 0.9), 0.14, 0.14, 0.14);
        // 몸통 (앞이 +z)
        box(body, scale, 3.0, 2.4, 4.6, 0, 3.4, -0.4);
        box(body, scale2, 2.6, 0.5, 4.2, 0, 4.7, -0.4);
        for (let i = 0; i < 6; i++) box(body, horn, 0.3, 0.6, 0.3, 0, 5.1, 1.4 - i * 0.75);
        box(body, lava, 2.0, 0.1, 3.4, 0, 2.15, -0.3);
        [[-1.52, 3.5, 0.6, 0.4], [1.52, 3.2, -0.6, -0.5], [-1.52, 3.0, -1.4, -0.3], [1.52, 3.8, 0.9, 0.6]].forEach(([x, y, z, r]) => box(body, lava, 0.05, 0.12, 1.4, x, y, z).rotation.x = r);
        // 가슴 용광로 (핵)
        const coreG = new THREE.Group(); coreG.position.set(0, 3.1, 1.95); body.add(coreG);
        const coreMat = std(0xffb03a, { emissive: 0xffb03a, ei: 2.2 });
        box(coreG, coreMat, 1.4, 1.2, 0.3);
        for (let i = 0; i < 3; i++) box(coreG, horn, 1.6, 0.12, 0.35, 0, -0.4 + i * 0.4, 0.05);
        // 다리
        const legs = [[-1.3, 1.3], [1.3, 1.3], [-1.3, -2.0], [1.3, -2.0]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 2.6, z); body.add(g); box(g, scale2, 1.0, 2.2, 1.1, 0, -1.2, 0); box(g, scale, 1.2, 0.5, 1.5, 0, -2.3, 0.2); for (let k = 0; k < 3; k++) box(g, horn, 0.18, 0.25, 0.4, (k - 1) * 0.35, -2.45, 1.0); return g; });
        // 목 + 머리
        const neck = new THREE.Group(); neck.position.set(0, 4.4, 1.6); body.add(neck);
        const nsegs = Array.from({ length: 4 }, (_, i) => box(neck, i % 2 ? scale2 : scale, 1.4 - i * 0.08, 1.2, 1.2, 0, 0.9 + i * 0.95, 0.45 + i * 0.45));
        const head = new THREE.Group(); head.position.set(0, 4.6, 2.4); neck.add(head);
        box(head, scale, 1.7, 1.1, 2.0); box(head, scale2, 1.2, 0.7, 1.4, 0, -0.05, 1.6);
        [-0.5, 0.5].forEach(x => box(head, eyeMat, 0.32, 0.12, 0.06, x, 0.2, 1.02));
        for (const s of [-1, 1]) { box(head, horn, 0.25, 0.25, 1.6, s * 0.6, 0.7, -1.2).rotation.x = 0.5; box(head, horn, 0.2, 0.2, 1.0, s * 0.85, 0.35, -1.0).rotation.set(0.3, s * 0.4, 0); }
        for (let i = 0; i < 4; i++) box(head, std(0xf2e6d0, { rough: 0.5 }), 0.12, 0.25, 0.12, (i - 1.5) * 0.3, -0.45, 2.15);
        const jaw = new THREE.Group(); jaw.position.set(0, -0.55, 0.4); head.add(jaw);
        box(jaw, scale2, 1.1, 0.35, 2.1, 0, 0, 0.9); box(jaw, lava, 0.8, 0.06, 1.6, 0, 0.2, 0.9);
        const mouth = new THREE.Object3D(); mouth.position.set(0, -0.2, 2.4); head.add(mouth);
        // 날개
        const wings = [-1, 1].map(s => {
            const g = new THREE.Group(); g.position.set(s * 1.3, 4.9, 0.4); body.add(g);
            const bones = [[2.6, 0.3], [2.4, 0.9], [2.0, 1.5]];
            box(g, horn, 3.2, 0.3, 0.3, s * 1.6, 0.6, 0);
            const tip = new THREE.Group(); tip.position.set(s * 3.2, 0.6, 0); g.add(tip);
            box(tip, horn, 3.0, 0.25, 0.25, s * 1.5, 0.8, 0).rotation.z = s * 0.5;
            bones.forEach(([l, a], i) => box(tip, horn, 0.15, l, 0.15, s * (0.8 + i * 0.9), -l / 2 + 0.4, 0).rotation.z = s * a * 0.3);
            for (let i = 0; i < 4; i++) box(g, memb, 1.6, 2.4 - i * 0.2, 0.05, s * (0.8 + i * 0.8), -0.6, 0.02);
            for (let i = 0; i < 4; i++) box(tip, memb, 1.0, 2.6 - i * 0.4, 0.05, s * (0.5 + i * 0.85), -0.5, 0.02);
            return { g, tip, s };
        });
        // 꼬리
        const tail = Array.from({ length: 7 }, (_, i) => { const g = new THREE.Group(); box(g, i % 2 ? scale2 : scale, 1.1 - i * 0.12, 0.9 - i * 0.08, 1.3, 0, 0, -0.6); if (i < 6) box(g, horn, 0.2, 0.4, 0.2, 0, 0.55, -0.6); return g; });
        tail.reduce((par, g, i) => { g.position.set(0, i ? 0 : 3.2, i ? -1.2 : -2.7); par.add(g); return g; }, body);
        let biteT = -1, rearT = 0;
        const breath = (n, spread, speed, size) => {
            const p = new THREE.Vector3(); mouth.getWorldPosition(p);
            const pp = c.playerPos(); const d = new THREE.Vector3(pp.x - p.x, 1.2 - p.y, pp.z - p.z).normalize();
            emit(n, { x: p.x, y: p.y, z: p.z, spread: 0.2, speed, dir: [d.x, d.y, d.z], jitter: spread, life: 0.7, size, color: [0xffd23a, 0xff7a2a, 0xff3a1a] });
        };
        return {
            mats: [scale, scale2], coreMat, coreG, eyeMats: [eyeMat], eyeColor: 0xffd23a, tintMats: [lava], H: 10.2, hitY: 4.4,
            attack() { biteT = 0; setTimeout(() => breath(26, 2, 22, 0.32), 330); },
            charge() { rearT = 0.01; },
            slam() { rearT = 0; c.shake(0.8); c.wave(); let n = 0; const iv = setInterval(() => { breath(30, 4, 26, 0.42); if (++n >= 5) clearInterval(iv); }, 70); emit(40, { x: 0, y: 0.4, z: 3, spread: 5, spreadY: 0.1, spreadZ: 2, speed: 8, life: 1, size: 0.3, color: [0xff7a2a, 0x1a100c], gravity: 12, jitter: 3 }); },
            update(t, dt, s) {
                embers(t, (p, tt) => { const k = (tt * 0.08 * p.sp + p.ph) % 1; return [p.x + Math.sin(tt + p.ph * 7) * 1.2, k * 22, p.z, tt * 2 + p.ph, tt]; });
                lavaStrips.forEach((m, i) => { m.material.opacity = 0.22 + 0.12 * Math.sin(t * 2 + i); });
                if (Math.random() < dt * 0.6) emit(14, { x: [-16, 2, 18][Math.floor(rand(0, 3))], y: 16, z: -26, spread: 1, speed: 9, dir: [0, 1, 0.2], jitter: 3, life: 1.6, size: 0.4, color: [0xffd23a, 0xff5a1a], gravity: 6 });
                if (s.dead) return;
                // 날갯짓 · 숨 · 꼬리
                const flap = Math.sin(t * (s.charging ? 5 : 1.6));
                wings.forEach(w => { w.g.rotation.set(0, w.s * -0.35, w.s * (0.25 + flap * 0.35 + (s.charging ? 0.5 : 0))); w.tip.rotation.z = w.s * (-0.4 + flap * 0.25); });
                tail.forEach((g, i) => { g.rotation.set(-0.12, Math.sin(t * 1.4 - i * 0.6) * 0.18, 0); });
                const rear = s.charging ? Math.min(1, s.ch * 2) : 0;
                body.rotation.x = -0.38 * rear + (s.stunned ? 0.1 : 0);
                body.position.y = 1.2 * rear;
                legs.forEach((g, i) => { g.rotation.x = i < 2 ? -0.8 * rear : 0; });
                let neckR = Math.sin(t * 0.8) * 0.06, jawR = 0.08 + Math.max(0, Math.sin(t * 2)) * 0.05, hz = 0;
                if (biteT >= 0) { biteT += dt; const k = biteT / 0.8; const fwd = k < 0.35 ? -k / 0.35 * 0.4 : k < 0.5 ? (k - 0.35) / 0.15 * 1.2 - 0.4 : Math.max(0, 0.8 * (1 - (k - 0.5) / 0.5)); neckR = fwd * 0.35; hz = fwd * 1.4; jawR = 0.1 + Math.max(0, fwd) * 0.7; if (k >= 1) biteT = -1; }
                if (s.charging) { jawR = 0.6; neckR = -0.25; if (Math.random() < dt * 30) { const p = new THREE.Vector3(); mouth.getWorldPosition(p); emit(1, { x: p.x, y: p.y, z: p.z, spread: 0.3, speed: 1, life: 0.4, size: 0.25, color: [0xffd23a, 0xff5a1a] }); } }
                neck.rotation.x = neckR; head.position.z = 2.4 + hz; head.rotation.x = -neckR * 0.6; jaw.rotation.x = jawR;
                nsegs.forEach((m, i) => { m.position.z = 0.45 + i * 0.45 + hz * i / 4; });
                coreG.scale.setScalar((1 + Math.sin(t * 3.5) * 0.06) * (1 + s.ch * 0.6));
            }
        };
    },

    /* ⚡ 천공의 뇌조 — 남색·금빛 깃털의 거대한 번개 새, 날개 끝을 잇는 전류, 뒤에 먹구름과 낙뢰, 빗줄기 */
    storm(c) {
        const { scene, boss, body, box, std, glow, emit, rand, drift, bolt } = c;
        const plume = std(0x1a2a6a, { rough: 0.4, metal: 0.3, emissive: 0x0a1a5a, ei: 0.5 });
        const plume2 = std(0x2a4ab0, { rough: 0.45, metal: 0.25, emissive: 0x0a2a8a, ei: 0.45 });
        const bellyM = std(0xd8e6ff, { rough: 0.6, emissive: 0x2a3a6a, ei: 0.3 });
        const gold = std(0xffd23a, { rough: 0.2, metal: 0.8, emissive: 0x6a4a00, ei: 0.5 });
        const volt = glow(0xffe14d, 0.95), eyeMat = glow(0xffffff, 1);
        // 먹구름 고리 + 구름 속 번쩍임
        const clouds = new THREE.Group(); scene.add(clouds);
        const cloudMat = std(0x1a2030, { rough: 1, emissive: 0x2a3a6a, ei: 0.1 });
        for (let i = 0; i < 34; i++) { const a = rand(0, Math.PI * 2), r = rand(14, 26); box(clouds, cloudMat, rand(5, 11), rand(2, 4), rand(4, 8), Math.cos(a) * r, rand(15, 21), Math.sin(a) * r - 6).rotation.y = rand(0, 3); }
        const farBolts = Array.from({ length: 3 }, () => { const g = new THREE.Group(); g.visible = false; scene.add(g); for (let i = 0; i < 8; i++) box(g, glow(0xd8f0ff, 1), 0.35, 2.4, 0.35); return { g, life: 0 }; });
        const rain = drift(scene, 160, new THREE.MeshBasicMaterial({ color: 0x9fc8ff, transparent: true, opacity: 0.45, toneMapped: false }), 0.04, 0.9, 0.04);
        // 떠 있는 바위 조각
        const rocks = Array.from({ length: 10 }, () => ({ m: box(scene, std(0x252c3a, { rough: 0.9 }), rand(1, 2.5), rand(0.6, 1.4), rand(1, 2.5)), a: rand(0, 6.28), r: rand(11, 16), y: rand(2, 9) }));
        // 몸 (공중에 뜸)
        const core0 = new THREE.Group(); core0.position.y = 5.6; body.add(core0);
        box(core0, plume, 2.6, 2.3, 3.4); box(core0, bellyM, 2.0, 1.6, 2.4, 0, -0.5, 0.6); box(core0, plume2, 2.2, 0.5, 3.0, 0, 1.25, -0.2);
        const coreG = new THREE.Group(); coreG.position.set(0, 0.3, 1.75); core0.add(coreG);
        const coreMat = std(0xffe14d, { emissive: 0xffe14d, ei: 2.2, metal: 0.3 });
        const gem = box(coreG, coreMat, 0.6, 0.6, 0.2); gem.rotation.z = Math.PI / 4;
        box(coreG, gold, 0.9, 0.9, 0.12, 0, 0, -0.06).rotation.z = Math.PI / 4;
        const head = new THREE.Group(); head.position.set(0, 1.6, 1.7); core0.add(head);
        box(head, plume, 1.4, 1.2, 1.4); box(head, bellyM, 1.0, 0.6, 0.3, 0, -0.25, 0.7);
        box(head, gold, 0.5, 0.35, 1.1, 0, -0.05, 1.15); box(head, gold, 0.35, 0.22, 0.6, 0, -0.32, 1.0);
        [-0.42, 0.42].forEach(x => box(head, eyeMat, 0.24, 0.12, 0.05, x, 0.22, 0.71));
        const crest = Array.from({ length: 5 }, (_, i) => { const g = new THREE.Group(); g.position.set(0, 0.6, -0.2 - i * 0.18); head.add(g); g.rotation.x = -0.7 - i * 0.12; box(g, i % 2 ? volt : gold, 0.14, 1.4 - i * 0.12, 0.14, 0, 0.7, 0); box(g, volt, 0.14, 0.5, 0.14, 0.12, 1.5 - i * 0.1, 0).rotation.z = -0.8; return g; });
        // 날개 (안·바깥 두 마디, 깃털 판)
        const wings = [-1, 1].map(s => {
            const g = new THREE.Group(); g.position.set(s * 1.2, 0.6, 0); core0.add(g);
            for (let i = 0; i < 5; i++) box(g, i % 2 ? plume2 : plume, 0.8, 0.18, 2.6 - i * 0.25, s * (0.5 + i * 0.75), 0, -0.2 - i * 0.05);
            const tip = new THREE.Group(); tip.position.set(s * 3.9, 0, 0); g.add(tip);
            const feathers = [];
            for (let i = 0; i < 6; i++) { const f = box(tip, i % 2 ? plume2 : plume, 0.6, 0.12, 3.0 - i * 0.2, s * (0.35 + i * 0.6), 0, -0.6 - i * 0.12); f.rotation.y = s * i * 0.08; feathers.push(f); box(tip, volt, 0.62, 0.03, 0.12, s * (0.35 + i * 0.6), -0.07, 0.9 - i * 0.22); }
            const end = new THREE.Object3D(); end.position.set(s * 3.8, 0, -0.6); tip.add(end);
            return { g, tip, s, end };
        });
        // 꼬리 깃 + 발톱
        const tailG = new THREE.Group(); tailG.position.set(0, -0.3, -1.8); core0.add(tailG);
        for (let i = 0; i < 7; i++) { const f = box(tailG, i % 2 ? plume2 : gold, 0.35, 0.1, 3.4, 0, 0, -1.6); f.rotation.set(0.35, (i - 3) * 0.2, 0); }
        for (const s of [-1, 1]) { box(core0, gold, 0.35, 1.4, 0.35, s * 0.6, -1.7, 0.3); for (let k = 0; k < 3; k++) box(core0, gold, 0.12, 0.12, 0.5, s * 0.6 + (k - 1) * 0.18, -2.4, 0.55).rotation.x = 0.5; }
        // 날개 끝을 잇는 전류
        const arcMat = glow(0xfff3a0, 0.55);
        const arc = Array.from({ length: 12 }, () => box(scene, arcMat, 0.05, 0.05, 1, 0, 0, 0));
        const pa = new THREE.Vector3(), pb = new THREE.Vector3();
        let slashT = -1, diveT = -1;
        return {
            mats: [plume, plume2, bellyM], coreMat, coreG, eyeMats: [eyeMat], eyeColor: 0xffffff, tintMats: [], H: 11, hitY: 5.8,
            attack() { slashT = 0; setTimeout(() => { const pp = c.playerPos(); bolt(pp.x * 0.85 + rand(-0.8, 0.8), pp.z * 0.85 + rand(-0.8, 0.8), 0xffe14d); c.shake(0.25); }, 420); },
            slam() { diveT = 0; setTimeout(() => { c.wave(); c.shake(1); const pp = c.playerPos(); for (let i = 0; i < 6; i++) setTimeout(() => bolt(pp.x * 0.7 + rand(-3, 3), pp.z * 0.7 + rand(-3, 3), i % 2 ? 0xffe14d : 0xbfe6ff), i * 60); }, 260); },
            update(t, dt, s) {
                rain(t, (p, tt) => { const k = (tt * 0.9 * p.sp + p.ph) % 1; return [p.x + k * 3, 22 - k * 23, p.z, 0, 0, 0.14]; });
                rocks.forEach((r, i) => { r.a += dt * 0.05; r.m.position.set(Math.cos(r.a) * r.r, r.y + Math.sin(t * 0.7 + i) * 0.4, Math.sin(r.a) * r.r - 4); r.m.rotation.y += dt * 0.2; });
                farBolts.forEach(b => { if (b.life > 0) { b.life -= dt; b.g.visible = b.life > 0 && Math.sin(t * 80) > -0.3; } });
                if (Math.random() < dt * 0.5) { const b = farBolts.find(o => o.life <= 0); if (b) { b.life = 0.3; b.g.visible = true; const x = rand(-20, 20), z = rand(-26, -14); let px = x, py = 18; b.g.children.forEach(m => { const ny = py - 2.4, nx = x + rand(-1, 1); m.position.set((px + nx) / 2, (py + ny) / 2, z); m.rotation.z = -Math.atan2(nx - px, 2.4); px = nx; py = ny; }); cloudMat.emissiveIntensity = 1.2; } }
                cloudMat.emissiveIntensity = Math.max(0.1, cloudMat.emissiveIntensity - dt * 3);
                if (s.dead) { arc.forEach(m => { m.visible = false; }); return; }
                // 둥실둥실 · 날갯짓
                let lift = Math.sin(t * 1.2) * 0.45, pitch = 0;
                if (s.charging) lift += Math.min(1, s.ch * 1.6) * 3;
                if (diveT >= 0) { diveT += dt; const k = diveT / 0.9; lift = k < 0.3 ? 3 - (k / 0.3) * 4.2 : -1.2 + Math.min(1, (k - 0.3) / 0.7) * 1.2; pitch = k < 0.3 ? 0.5 : 0.5 * (1 - (k - 0.3) / 0.7); if (k >= 1) diveT = -1; }
                core0.position.y = 5.6 + lift; core0.rotation.x = pitch + (s.stunned ? 0.15 : 0);
                const flap = Math.sin(t * (s.charging ? 7 : 2.2));
                wings.forEach(w => {
                    let wz = w.s * (0.15 + flap * 0.4), wy = 0;
                    if (s.charging) wz = w.s * (0.9 + flap * 0.1);
                    if (slashT >= 0 && w.s === 1) { const k = slashT / 0.7; wy = -Math.sin(Math.min(1, k) * Math.PI) * 1.1; }
                    w.g.rotation.set(0, wy, wz); w.tip.rotation.z = w.s * (-0.25 + flap * 0.3);
                });
                if (slashT >= 0) { slashT += dt; if (slashT > 0.7) slashT = -1; }
                crest.forEach((g, i) => { g.rotation.z = Math.sin(t * 6 + i) * 0.06; });
                head.rotation.y = Math.sin(t * 0.6) * 0.2;
                coreG.scale.setScalar((1 + Math.sin(t * 4) * 0.07) * (1 + s.ch * 0.8)); gem.rotation.z = Math.PI / 4 + t * 0.5;
                // 전류
                wings[0].end.getWorldPosition(pa); wings[1].end.getWorldPosition(pb);
                arc.forEach((m, i) => {
                    const k0 = i / arc.length, k1 = (i + 1) / arc.length, j = (s.charging ? 1.6 : 0.6);
                    const ax = lerp(pa.x, pb.x, k0), ay = lerp(pa.y, pb.y, k0) + Math.sin(k0 * Math.PI) * 1.5 + rand(-j, j) * Math.sin(k0 * Math.PI), az = lerp(pa.z, pb.z, k0) + rand(-0.3, 0.3);
                    const bx = lerp(pa.x, pb.x, k1), by = lerp(pa.y, pb.y, k1) + Math.sin(k1 * Math.PI) * 1.5, bz = lerp(pa.z, pb.z, k1);
                    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); m.lookAt(bx, by, bz); m.scale.set(0.05, 0.05, Math.hypot(bx - ax, by - ay, bz - az));
                    m.visible = Math.random() < (s.charging ? 0.9 : 0.35);
                });
            }
        };
    }
};
