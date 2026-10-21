/* =========================================================
   🐾 펫 3D (pets3d.js) — 전부 네모 박스로
   - createPetRig(dummy): 캐릭터 옆(화면 기준 오른쪽)에서 따라다님
   - buildPetModel(id): 미리보기용 (gearPreview 가 같이 씀)
   ========================================================= */

import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const std = (color, { metal = 0.1, rough = 0.6, emissive = null, ei = 0, opacity = 1 } = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emissive ?? 0x000000, emissiveIntensity: ei, transparent: opacity < 1, opacity });
const glow = (color, opacity = 1) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
function box(parent, mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(BOX, mat);
    m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    parent.add(m); return m;
}
const eyes = (g, y, z, gap = 0.12, s = 0.08, col = 0x111111) => {
    const m = std(col);
    return [box(g, m, s, s * 1.3, 0.02, -gap, y, z), box(g, m, s, s * 1.3, 0.02, gap, y, z)];
};

/* 각 펫: (g, up) → g 에 몸을 만들고, up 에 매 프레임 함수(t)를 넣음. 바닥 기준 y=0, 앞은 +z */
const PET_BUILD = {
    pet_slime(g, up) {
        const body = new THREE.Group(); g.add(body);
        box(body, std('#5ad65a', { opacity: 0.85, rough: 0.2, emissive: '#1a6a1a', ei: 0.4 }), 0.7, 0.55, 0.7, 0, 0.28, 0);
        box(body, std('#9dff9d', { opacity: 0.5 }), 0.3, 0.2, 0.3, -0.1, 0.35, 0.05);
        eyes(body, 0.36, 0.36);
        up.push(t => { const k = Math.abs(Math.sin(t * 4)); body.position.y = k * 0.25; body.scale.set(1 + (1 - k) * 0.15, 1 - (1 - k) * 0.18, 1 + (1 - k) * 0.15); });
    },
    pet_puppy(g, up) {
        const fur = std('#c8864a'), dark = std('#6a3a1a');
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.45, 0.4, 0.75, 0, 0.42, 0);
        const head = new THREE.Group(); head.position.set(0, 0.72, 0.38); body.add(head);
        box(head, fur, 0.45, 0.42, 0.42, 0, 0, 0);
        box(head, std('#e8b88a'), 0.24, 0.16, 0.12, 0, -0.08, 0.24);
        box(head, dark, 0.08, 0.06, 0.04, 0, -0.03, 0.31);
        eyes(head, 0.06, 0.215, 0.11);
        const earL = box(head, dark, 0.1, 0.24, 0.16, -0.25, 0.05, 0), earR = box(head, dark, 0.1, 0.24, 0.16, 0.25, 0.05, 0);
        const tail = box(body, fur, 0.08, 0.3, 0.08, 0, 0.62, -0.4, -0.6);
        const legs = [[-0.14, 0.25], [0.14, 0.25], [-0.14, -0.25], [0.14, -0.25]].map(([x, z]) => box(body, fur, 0.12, 0.25, 0.12, x, 0.12, z));
        up.push(t => {
            tail.rotation.z = Math.sin(t * 14) * 0.6;
            earL.rotation.z = 0.2 + Math.sin(t * 3) * 0.1; earR.rotation.z = -0.2 - Math.sin(t * 3) * 0.1;
            head.rotation.x = Math.sin(t * 2) * 0.08;
            legs.forEach((l, i) => { l.position.y = 0.12 + Math.max(0, Math.sin(t * 8 + i * 1.6)) * 0.05; });
            body.position.y = Math.abs(Math.sin(t * 8)) * 0.03;
        });
    },
    pet_cat(g, up) {
        const fur = std('#f0a050'), stripe = std('#c8642a'), white = std('#fff6ea');
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.42, 0.45, 0.5, 0, 0.28, -0.05);
        box(body, white, 0.3, 0.3, 0.05, 0, 0.28, 0.21);
        for (const y of [0.18, 0.36]) box(body, stripe, 0.44, 0.06, 0.52, 0, y, -0.05);
        const head = new THREE.Group(); head.position.set(0, 0.68, 0.05); body.add(head);
        box(head, fur, 0.48, 0.38, 0.4, 0, 0, 0);
        box(head, white, 0.22, 0.12, 0.06, 0, -0.1, 0.2);
        eyes(head, 0.04, 0.205, 0.12, 0.07, 0x2a7a2a);
        for (const s of [-1, 1]) { box(head, fur, 0.12, 0.16, 0.08, s * 0.16, 0.25, 0, 0, 0, s * -0.3); box(head, std('#ff9ac8'), 0.06, 0.08, 0.02, s * 0.16, 0.24, 0.045); }
        const tailG = new THREE.Group(); tailG.position.set(0, 0.15, -0.3); body.add(tailG);
        const tail = [0, 1, 2, 3].map(i => box(tailG, i === 3 ? stripe : fur, 0.08, 0.16, 0.08, 0, 0.08 + i * 0.15, -i * 0.04));
        up.push(t => {
            tailG.rotation.z = Math.sin(t * 1.6) * 0.5;
            const yawn = (t % 7) < 0.8 ? Math.sin(((t % 7) / 0.8) * Math.PI) : 0;
            head.rotation.x = -yawn * 0.4; head.scale.y = 1 + yawn * 0.1;
            head.rotation.z = Math.sin(t * 0.9) * 0.08;
        });
    },
    pet_penguin(g, up) {
        const black = std('#1a1d26'), white = std('#f6f6f6'), orange = std('#ff9a1a');
        const body = new THREE.Group(); g.add(body);
        box(body, black, 0.48, 0.65, 0.4, 0, 0.4, 0);
        box(body, white, 0.36, 0.5, 0.05, 0, 0.36, 0.2);
        box(body, black, 0.42, 0.32, 0.36, 0, 0.88, 0);
        box(body, white, 0.3, 0.18, 0.04, 0, 0.86, 0.18);
        eyes(body, 0.92, 0.185, 0.08, 0.06);
        box(body, orange, 0.12, 0.06, 0.12, 0, 0.82, 0.25);
        const wL = box(body, black, 0.08, 0.4, 0.24, -0.28, 0.45, 0), wR = box(body, black, 0.08, 0.4, 0.24, 0.28, 0.45, 0);
        box(body, orange, 0.14, 0.05, 0.2, -0.1, 0.03, 0.06); box(body, orange, 0.14, 0.05, 0.2, 0.1, 0.03, 0.06);
        up.push(t => {
            body.rotation.z = Math.sin(t * 6) * 0.12;
            const f = Math.max(0, Math.sin(t * 9)) * 0.7;
            wL.rotation.z = -f; wR.rotation.z = f;
        });
    },
    pet_fox(g, up) {
        const fur = std('#ff6a1a', { emissive: '#7a2000', ei: 0.3 }), white = std('#fff2e0'), dark = std('#2a1a10');
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.4, 0.38, 0.75, 0, 0.4, 0);
        const head = new THREE.Group(); head.position.set(0, 0.7, 0.4); body.add(head);
        box(head, fur, 0.42, 0.36, 0.36, 0, 0, 0);
        box(head, white, 0.22, 0.14, 0.24, 0, -0.08, 0.2);
        box(head, dark, 0.07, 0.06, 0.04, 0, -0.04, 0.33);
        eyes(head, 0.06, 0.185, 0.1, 0.06, 0xffe14d);
        for (const s of [-1, 1]) box(head, fur, 0.12, 0.22, 0.08, s * 0.14, 0.26, 0, 0, 0, s * -0.2);
        for (const [x, z] of [[-0.13, 0.25], [0.13, 0.25], [-0.13, -0.25], [0.13, -0.25]]) box(body, dark, 0.1, 0.24, 0.1, x, 0.12, z);
        const tail = new THREE.Group(); tail.position.set(0, 0.52, -0.38); body.add(tail);
        box(tail, fur, 0.26, 0.26, 0.5, 0, 0.1, -0.2, 0.5);
        box(tail, white, 0.22, 0.22, 0.16, 0, 0.26, -0.46, 0.5);
        const flames = [0, 1, 2].map(i => box(tail, glow('#ffb03a', 0.9), 0.14, 0.24, 0.14, (i - 1) * 0.08, 0.5, -0.5));
        up.push(t => {
            tail.rotation.y = Math.sin(t * 2.2) * 0.4;
            flames.forEach((f, i) => { f.scale.set(0.14, 0.2 + Math.abs(Math.sin(t * 9 + i * 2)) * 0.25, 0.14); f.position.y = 0.5 + Math.sin(t * 9 + i) * 0.04; });
            head.rotation.y = Math.sin(t * 0.8) * 0.3;
        });
    },
    pet_owl(g, up) {
        const fur = std('#5a3a8a', { emissive: '#1a0a3a', ei: 0.4 }), belly = std('#c8b0ff'), yellow = std('#ffe14d', { emissive: '#ffb000', ei: 0.8 });
        g.position.y = 1.6;   // 공중에 떠 있음
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.5, 0.6, 0.45, 0, 0, 0);
        box(body, belly, 0.34, 0.36, 0.05, 0, -0.06, 0.23);
        for (const s of [-1, 1]) { box(body, yellow, 0.14, 0.14, 0.03, s * 0.12, 0.16, 0.235); box(body, std('#111'), 0.06, 0.06, 0.02, s * 0.12, 0.16, 0.25); box(body, fur, 0.1, 0.16, 0.08, s * 0.18, 0.36, 0, 0, 0, s * -0.4); }
        box(body, std('#ff9a1a'), 0.06, 0.08, 0.06, 0, 0.06, 0.25);
        const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.26, 0.05, 0); box(w, fur, 0.5, 0.06, 0.34, s * 0.25, 0, 0); body.add(w); return { w, s }; });
        const bolt = [0, 1].map(s => { const b = box(body, glow('#bfe0ff', 1), 0.04, 0.22, 0.04, 0, 0, 0); b.visible = false; return b; });
        up.push(t => {
            const f = Math.sin(t * 10);
            wings.forEach(({ w, s }) => { w.rotation.z = s * f * 0.7; });
            body.position.y = Math.sin(t * 2) * 0.12;
            const zap = Math.sin(t * 10) > 0.95;
            bolt.forEach((b, i) => { b.visible = zap; b.position.set((i ? 1 : -1) * 0.7, -0.1, 0); b.rotation.z = i ? 0.5 : -0.5; });
        });
    },
    pet_dragon(g, up) {
        const crystal = std('#7fe8ff', { metal: 0.3, rough: 0.1, emissive: '#2a9ad6', ei: 0.6, opacity: 0.92 }), dark = std('#2a6a9a', { metal: 0.4, rough: 0.2 });
        g.position.y = 1.8;
        const body = new THREE.Group(); g.add(body);
        box(body, crystal, 0.4, 0.4, 0.7, 0, 0, 0);
        const neck = box(body, crystal, 0.24, 0.24, 0.3, 0, 0.18, 0.38, -0.5);
        const head = new THREE.Group(); head.position.set(0, 0.34, 0.55); body.add(head);
        box(head, crystal, 0.34, 0.28, 0.4, 0, 0, 0);
        box(head, dark, 0.26, 0.12, 0.2, 0, -0.06, 0.24);
        eyes(head, 0.06, 0.205, 0.09, 0.06, 0xffe14d);
        for (const s of [-1, 1]) box(head, std('#e0fbff', { emissive: '#7fe8ff', ei: 0.8 }), 0.05, 0.22, 0.05, s * 0.1, 0.22, -0.08, -0.5);
        const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.2, 0.15, 0); box(w, std('#bff6ff', { opacity: 0.7, emissive: '#7fe8ff', ei: 0.5 }), 0.7, 0.03, 0.5, s * 0.38, 0, -0.05); box(w, crystal, 0.06, 0.06, 0.5, s * 0.72, 0, -0.05); body.add(w); return { w, s }; });
        const tail = [0, 1, 2, 3].map(i => box(body, crystal, 0.2 - i * 0.04, 0.2 - i * 0.04, 0.24, 0, 0, -0.45 - i * 0.22));
        const sp = box(g, glow('#bff6ff', 0.9), 0.08, 0.08, 0.08, 0, 0, 0);
        up.push(t => {
            const f = Math.sin(t * 7);
            wings.forEach(({ w, s }) => { w.rotation.z = s * f * 0.6; });
            body.position.y = Math.sin(t * 2) * 0.15; body.rotation.z = Math.sin(t * 1.3) * 0.1;
            tail.forEach((s, i) => { s.position.x = Math.sin(t * 3 - i * 0.7) * 0.06 * i; });
            neck.rotation.x = -0.5 + Math.sin(t * 2) * 0.05;
            const k = (t * 0.8) % 1; sp.position.set(Math.sin(t * 3) * 0.5, -0.3 - k * 0.6, -0.4); sp.scale.setScalar(0.08 * (1 - k));
        });
    },
    pet_whale(g, up) {
        const navy = std('#1a2a6a', { emissive: '#0a1450', ei: 0.4 }), belly = std('#9fb8ff'), star = glow('#ffffff', 1);
        g.position.y = 1.9;
        const body = new THREE.Group(); g.add(body);
        box(body, navy, 0.6, 0.5, 1.0, 0, 0, 0);
        box(body, belly, 0.5, 0.18, 0.9, 0, -0.2, 0.02);
        eyes(body, 0.05, 0.51, 0.18, 0.06, 0xffffff);
        for (let i = 0; i < 6; i++) box(body, star, 0.05, 0.05, 0.05, (i % 2 ? 1 : -1) * 0.31, 0.1 - (i % 3) * 0.08, -0.3 + i * 0.1);
        const tail = new THREE.Group(); tail.position.set(0, 0.05, -0.55); body.add(tail);
        box(tail, navy, 0.24, 0.2, 0.3, 0, 0, -0.1);
        box(tail, navy, 0.7, 0.06, 0.24, 0, 0.05, -0.3);
        const fins = [-1, 1].map(s => box(body, navy, 0.3, 0.05, 0.2, s * 0.38, -0.15, 0.15, 0, 0, s * -0.3));
        const spout = [0, 1, 2, 3, 4].map(() => box(g, glow('#bfe8ff', 0.8), 0.07, 0.07, 0.07, 0, 0, 0));
        up.push(t => {
            body.position.y = Math.sin(t * 1.2) * 0.15; body.rotation.x = Math.sin(t * 1.2) * 0.08;
            tail.rotation.x = Math.sin(t * 2.4) * 0.35;
            fins.forEach((f, i) => { f.rotation.x = Math.sin(t * 2.4 + i) * 0.3; });
            spout.forEach((s, i) => { const k = (t * 0.6 + i / 5) % 1; s.position.set(Math.sin(i * 2.3) * 0.25 * k, 0.3 + k * 0.7 + body.position.y, 0.15); s.scale.setScalar(0.07 * (1 - k)); });
        });
    },
    pet_phoenix(g, up) {
        const gold = std('#ffc94d', { metal: 0.6, rough: 0.3, emissive: '#ff8a00', ei: 0.6 }), red = std('#ff4a1a', { emissive: '#a01a00', ei: 0.7 });
        g.position.y = 2.0;
        const body = new THREE.Group(); g.add(body);
        box(body, gold, 0.34, 0.34, 0.55, 0, 0, 0);
        const head = new THREE.Group(); head.position.set(0, 0.24, 0.35); body.add(head);
        box(head, gold, 0.26, 0.26, 0.28, 0, 0, 0);
        box(head, std('#ffe14d'), 0.08, 0.06, 0.14, 0, -0.04, 0.2);
        eyes(head, 0.05, 0.145, 0.07, 0.05);
        for (let i = 0; i < 3; i++) box(head, red, 0.05, 0.2 - i * 0.04, 0.05, 0, 0.2, -0.05 - i * 0.07, -0.5);
        const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.17, 0.08, 0); for (let i = 0; i < 4; i++) box(w, i % 2 ? red : gold, 0.22, 0.04, 0.34 - i * 0.05, s * (0.12 + i * 0.18), 0, -i * 0.03); body.add(w); return { w, s }; });
        const trail = Array.from({ length: 8 }, (_, i) => box(g, glow(i < 3 ? '#ffe27a' : '#ff6a1a', 0.85 - i * 0.09), 0.16, 0.16, 0.16, 0, 0, 0));
        up.push(t => {
            const f = Math.sin(t * 8);
            wings.forEach(({ w, s }) => { w.rotation.z = s * f * 0.7; });
            body.position.y = Math.sin(t * 2) * 0.15;
            trail.forEach((b, i) => { b.position.set(Math.sin(t * 3 - i * 0.4) * 0.12, body.position.y - 0.05 + Math.sin(t * 2 - i * 0.3) * 0.05, -0.4 - i * 0.18); b.scale.setScalar(0.16 * (1 - i / 9)); });
        });
    },
    /* ---------- 🆕 펫 업데이트 ---------- */
    // 햄찌: 볼주머니 빵빵, 제자리에서 쳇바퀴 돌듯 종종
    pet_hamster(g, up) {
        const fur = std('#e8b070'), white = std('#fff6ea'), pink = std('#ff9ac8');
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.55, 0.45, 0.6, 0, 0.28, 0); box(body, white, 0.4, 0.3, 0.05, 0, 0.24, 0.3);
        const cheeks = [-1, 1].map(s => box(body, white, 0.16, 0.16, 0.16, s * 0.26, 0.28, 0.2));
        for (const s of [-1, 1]) { box(body, fur, 0.12, 0.12, 0.06, s * 0.17, 0.55, 0.05); box(body, pink, 0.07, 0.07, 0.02, s * 0.17, 0.55, 0.085); }
        box(body, pink, 0.06, 0.05, 0.03, 0, 0.32, 0.32);
        eyes(body, 0.4, 0.305, 0.12, 0.06);
        const feet = [-1, 1].map(s => box(body, pink, 0.1, 0.06, 0.12, s * 0.15, 0.03, 0.2));
        up.push(t => { body.position.y = Math.abs(Math.sin(t * 10)) * 0.04; feet.forEach((f, i) => { f.position.z = 0.2 + Math.sin(t * 14 + i * Math.PI) * 0.06; }); const k = (t % 4) < 0.4 ? Math.sin((t % 4) / 0.4 * Math.PI) : 0; cheeks.forEach(c => c.scale.setScalar(0.16 * (1 + k * 0.6))); });
    },
    // 병아리: 노란 네모, 날개 파닥이며 콩콩
    pet_chick(g, up) {
        const yel = std('#ffe14d', { emissive: '#6a5a00', ei: 0.2 }), org = std('#ff9a1a');
        const body = new THREE.Group(); g.add(body);
        box(body, yel, 0.45, 0.45, 0.45, 0, 0.26, 0); box(body, yel, 0.06, 0.12, 0.06, 0, 0.55, 0); box(body, org, 0.12, 0.08, 0.12, 0, 0.26, 0.27);
        eyes(body, 0.36, 0.23, 0.1, 0.05);
        const wings = [-1, 1].map(s => box(body, yel, 0.06, 0.2, 0.25, s * 0.26, 0.26, -0.02));
        for (const s of [-1, 1]) box(body, org, 0.06, 0.08, 0.12, s * 0.1, 0.02, 0.05);
        up.push(t => { const h = Math.max(0, Math.sin(t * 6)); body.position.y = h * 0.18; wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.2 + h * 0.8); }); });
    },
    // 달토끼: 긴 귀, 옆을 도는 작은 초승달
    pet_bunny(g, up) {
        const white = std('#f6f6ff'), pink = std('#ffb0d0');
        const body = new THREE.Group(); g.add(body);
        box(body, white, 0.45, 0.4, 0.55, 0, 0.25, 0); box(body, white, 0.15, 0.15, 0.15, 0, 0.3, -0.32);
        const head = new THREE.Group(); head.position.set(0, 0.55, 0.2); body.add(head);
        box(head, white, 0.38, 0.34, 0.34, 0, 0, 0); eyes(head, 0.03, 0.175, 0.1, 0.06, 0xd0306a); box(head, pink, 0.05, 0.04, 0.02, 0, -0.05, 0.175);
        const ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.1, 0.17, 0); head.add(e); box(e, white, 0.1, 0.45, 0.06, 0, 0.22, 0); box(e, pink, 0.05, 0.36, 0.02, 0, 0.22, 0.035); return e; });
        const moon = new THREE.Group(); g.add(moon);
        box(moon, glow('#fff3a0', 0.95), 0.16, 0.16, 0.04, 0, 0, 0); box(moon, std('#0a0a20'), 0.13, 0.13, 0.05, 0.05, 0.03, 0.01);
        up.push(t => { const h = Math.max(0, Math.sin(t * 5)); body.position.y = h * 0.2; ears.forEach((e, i) => { e.rotation.z = (i ? -1 : 1) * (0.1 + Math.sin(t * 3) * 0.1); e.rotation.x = -h * 0.3; }); moon.position.set(Math.cos(t) * 0.55, 0.9 + Math.sin(t * 2) * 0.1, Math.sin(t) * 0.55); });
    },
    // 돌거북: 이끼 낀 육각 등껍질, 느릿느릿 고개를 내밀었다 넣었다
    pet_turtle(g, up) {
        const shell = std('#3a7a3a', { rough: 0.8 }), plate = std('#5a9a4a'), skin = std('#9ac87a'), moss = std('#7ad65a', { emissive: '#1a5a1a', ei: 0.3 });
        const body = new THREE.Group(); g.add(body);
        box(body, skin, 0.6, 0.12, 0.7, 0, 0.12, 0);
        box(body, shell, 0.7, 0.3, 0.75, 0, 0.32, 0);
        for (const [x, z] of [[0, 0], [-0.2, 0.2], [0.2, 0.2], [-0.2, -0.2], [0.2, -0.2]]) box(body, plate, 0.18, 0.06, 0.18, x, 0.48, z);
        box(body, moss, 0.2, 0.06, 0.12, 0.1, 0.52, -0.05);
        const head = new THREE.Group(); head.position.set(0, 0.25, 0.42); body.add(head);
        box(head, skin, 0.22, 0.2, 0.25, 0, 0, 0.08); eyes(head, 0.04, 0.21, 0.07, 0.05);
        const legs = [[-0.28, 0.25], [0.28, 0.25], [-0.28, -0.25], [0.28, -0.25]].map(([x, z]) => box(body, skin, 0.14, 0.14, 0.16, x, 0.07, z));
        up.push(t => { head.position.z = 0.42 + Math.max(0, Math.sin(t * 0.8)) * 0.12 - 0.06; legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 2 + i * 1.6) * 0.3; }); body.rotation.z = Math.sin(t * 2) * 0.03; });
    },
    // 별 해파리: 반투명 우산 + 하늘거리는 촉수, 안에서 별빛이 깜빡
    pet_jellyfish(g, up) {
        g.position.y = 1.3;
        const bell = std('#c8a0ff', { opacity: 0.6, rough: 0.1, emissive: '#6a3aff', ei: 0.6 });
        const body = new THREE.Group(); g.add(body);
        box(body, bell, 0.6, 0.35, 0.6, 0, 0, 0); box(body, bell, 0.42, 0.15, 0.42, 0, 0.24, 0);
        const star = box(body, glow('#fff3a0', 1), 0.14, 0.14, 0.14, 0, 0.05, 0);
        eyes(body, 0.02, 0.305, 0.1, 0.05, 0x3a1a6a);
        const tent = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; const tg = new THREE.Group(); tg.position.set(Math.cos(a) * 0.2, -0.18, Math.sin(a) * 0.2); body.add(tg); const segs = [0, 1, 2, 3].map(k => box(tg, glow(k % 2 ? '#7af7ff' : '#c8a0ff', 0.8), 0.04, 0.14, 0.04, 0, -0.08 - k * 0.14, 0)); return { tg, segs, i }; });
        up.push(t => { const p = Math.sin(t * 2.2); body.position.y = Math.sin(t * 1.1) * 0.15; body.scale.set(1 + p * 0.08, 1 - p * 0.1, 1 + p * 0.08); star.rotation.set(t * 2, t * 3, 0); star.scale.setScalar(0.14 * (1 + 0.4 * Math.sin(t * 6))); tent.forEach(o => o.segs.forEach((s, k) => { s.position.x = Math.sin(t * 3 - k * 0.7 + o.i) * 0.04 * k; })); });
    },
    // 꼬마 골렘: 돌 몸통, 등에 박힌 빛나는 수정, 쿵쿵 걸음
    pet_golem(g, up) {
        const stone = std('#8a8a96', { rough: 0.9 }), dark = std('#5a5a66', { rough: 0.9 }), crys = std('#7af0ff', { emissive: '#2ab0ff', ei: 1.2, rough: 0.1 });
        const body = new THREE.Group(); g.add(body);
        box(body, stone, 0.6, 0.55, 0.45, 0, 0.55, 0); box(body, dark, 0.45, 0.35, 0.38, 0, 0.98, 0.02);
        box(body, glow('#7af0ff', 1), 0.28, 0.06, 0.02, 0, 1.0, 0.215);
        const cr = [0, 1, 2].map(i => box(body, crys, 0.1, 0.25 - i * 0.05, 0.1, (i - 1) * 0.15, 0.95, -0.25, -0.5, 0, (i - 1) * 0.3));
        const arms = [-1, 1].map(s => box(body, dark, 0.2, 0.45, 0.22, s * 0.42, 0.5, 0));
        const legs = [-1, 1].map(s => box(body, dark, 0.2, 0.28, 0.24, s * 0.16, 0.14, 0));
        up.push(t => { const st = Math.sin(t * 3); legs.forEach((l, i) => { l.position.y = 0.14 + Math.max(0, (i ? -st : st)) * 0.08; }); arms.forEach((a, i) => { a.rotation.x = (i ? -st : st) * 0.4; }); body.rotation.z = st * 0.04; cr.forEach((c, i) => { c.material.emissiveIntensity = 1 + Math.sin(t * 4 + i) * 0.5; }); });
    },
    // 무지개 유니콘: 금빛 뿔, 무지개 갈기와 꼬리, 사뿐사뿐
    pet_unicorn(g, up) {
        const white = std('#fafaff', { emissive: '#3a3a5a', ei: 0.2 }), gold = std('#ffd23a', { metal: 0.8, rough: 0.2, emissive: '#6a4a00', ei: 0.5 });
        const rb = ['#ff5a7a', '#ffb03a', '#ffe14d', '#5ae07a', '#5ab0ff', '#b07aff'];
        const body = new THREE.Group(); g.add(body);
        box(body, white, 0.4, 0.4, 0.8, 0, 0.6, 0);
        const neck = new THREE.Group(); neck.position.set(0, 0.78, 0.35); body.add(neck);
        box(neck, white, 0.24, 0.45, 0.24, 0, 0.18, 0.05, -0.4);
        const head = new THREE.Group(); head.position.set(0, 0.42, 0.18); neck.add(head);
        box(head, white, 0.26, 0.26, 0.42, 0, 0, 0.08); eyes(head, 0.06, 0.13, 0.1, 0.05, 0x3a2a6a);
        box(head, gold, 0.06, 0.36, 0.06, 0, 0.28, 0.12, 0.35);
        rb.forEach((c, i) => box(neck, std(c, { emissive: c, ei: 0.5 }), 0.08, 0.12, 0.08, 0, 0.5 - i * 0.09, -0.12));
        const tail = rb.map((c, i) => box(body, std(c, { emissive: c, ei: 0.5 }), 0.07, 0.16, 0.07, 0, 0.62 - i * 0.07, -0.42 - i * 0.04));
        const legs = [[-0.12, 0.3], [0.12, 0.3], [-0.12, -0.3], [0.12, -0.3]].map(([x, z]) => box(body, white, 0.1, 0.42, 0.1, x, 0.21, z));
        legs.forEach(l => box(body, gold, 0.11, 0.06, 0.11, l.position.x, 0.03, l.position.z));
        up.push(t => { body.position.y = Math.abs(Math.sin(t * 4)) * 0.08; legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 8 + i * 1.6) * 0.35; }); tail.forEach((s, i) => { s.position.x = Math.sin(t * 4 - i * 0.6) * 0.04 * i; }); head.rotation.x = Math.sin(t * 2) * 0.1; });
    },
    // 구미호 여우불: 꼬리 셋 끝에 푸른 여우불, 머리 위를 도는 여우불 구슬
    pet_kitsune(g, up) {
        const fur = std('#fff0e0'), red = std('#ff4a3a', { emissive: '#6a0a0a', ei: 0.3 });
        const body = new THREE.Group(); g.add(body);
        box(body, fur, 0.38, 0.36, 0.62, 0, 0.36, 0);
        const head = new THREE.Group(); head.position.set(0, 0.65, 0.3); body.add(head);
        box(head, fur, 0.38, 0.32, 0.34, 0, 0, 0); box(head, fur, 0.16, 0.12, 0.18, 0, -0.06, 0.24); box(head, std('#1a1a1a'), 0.05, 0.04, 0.03, 0, -0.03, 0.33);
        for (const s of [-1, 1]) { box(head, fur, 0.1, 0.18, 0.06, s * 0.13, 0.22, 0); box(head, red, 0.08, 0.04, 0.02, s * 0.1, 0.06, 0.175); }
        eyes(head, 0.04, 0.175, 0.1, 0.05, 0xd03a1a);
        const tails = [-1, 0, 1].map(k => { const tg = new THREE.Group(); tg.position.set(k * 0.1, 0.45, -0.3); body.add(tg); const segs = [0, 1, 2, 3].map(i => box(tg, i === 3 ? glow('#5ac8ff', 0.95) : fur, 0.12, 0.16, 0.12, 0, 0.1 + i * 0.14, -i * 0.06)); return { tg, k }; });
        const orbs = [0, 1, 2].map(() => box(g, glow('#5ac8ff', 0.95), 0.1, 0.14, 0.1, 0, 0, 0));
        up.push(t => { tails.forEach(({ tg, k }) => { tg.rotation.set(-0.5 + Math.sin(t * 2 + k) * 0.15, 0, k * 0.5 + Math.sin(t * 1.6 + k) * 0.2); }); orbs.forEach((o, i) => { const a = t * 2 + i / 3 * Math.PI * 2; o.position.set(Math.cos(a) * 0.5, 1.15 + Math.sin(t * 4 + i) * 0.08, Math.sin(a) * 0.5); o.scale.y = 0.14 * (1 + 0.3 * Math.sin(t * 10 + i)); }); head.rotation.y = Math.sin(t * 0.8) * 0.2; });
    },
    // 그리폰: 독수리 머리·날개 + 사자 몸, 낮게 떠서 날갯짓
    pet_griffin(g, up) {
        g.position.y = 0.5;
        const white = std('#f2f2f2'), gold = std('#d9a84a', { metal: 0.3, rough: 0.6 }), beak = std('#ffc23a', { metal: 0.5 }), wing = std('#8a5a2a');
        const body = new THREE.Group(); g.add(body);
        box(body, gold, 0.42, 0.4, 0.8, 0, 0.3, -0.05);
        const head = new THREE.Group(); head.position.set(0, 0.62, 0.4); body.add(head);
        box(head, white, 0.32, 0.32, 0.32, 0, 0, 0); box(head, beak, 0.12, 0.1, 0.18, 0, -0.04, 0.22); eyes(head, 0.06, 0.165, 0.09, 0.05);
        box(head, white, 0.08, 0.16, 0.06, 0, 0.2, -0.1, -0.4);
        const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.2, 0.45, 0.05); body.add(w); for (let i = 0; i < 4; i++) box(w, i % 2 ? wing : white, 0.24, 0.05, 0.42 - i * 0.06, s * (0.14 + i * 0.2), 0, -i * 0.04); return { w, s }; });
        const tail = box(body, gold, 0.06, 0.06, 0.4, 0, 0.3, -0.6, 0.4);
        box(body, std('#6a3a1a'), 0.12, 0.12, 0.12, 0, 0.18, -0.8);
        const legs = [[-0.14, 0.25], [0.14, 0.25], [-0.14, -0.3], [0.14, -0.3]].map(([x, z]) => box(body, gold, 0.1, 0.25, 0.1, x, 0.02, z));
        up.push(t => { const f = Math.sin(t * 7); wings.forEach(({ w, s }) => { w.rotation.z = s * f * 0.6; }); body.position.y = Math.sin(t * 2) * 0.12; tail.rotation.y = Math.sin(t * 2) * 0.4; legs.forEach((l, i) => { l.rotation.x = 0.4 + Math.sin(t * 2 + i) * 0.1; }); });
    },
    // 심해의 레비아탄: 물결치며 헤엄치는 긴 바다뱀, 청록빛 등지느러미와 빛나는 눈
    pet_leviathan(g, up) {
        g.position.y = 1.2;
        const scale = std('#1a6a8a', { metal: 0.4, rough: 0.3, emissive: '#0a3a5a', ei: 0.5 }), belly = std('#bff4ff', { emissive: '#3a8aaa', ei: 0.3 }), fin = glow('#5af0ff', 0.8);
        const segs = Array.from({ length: 10 }, (_, i) => { const s = new THREE.Group(); g.add(s); const w = 0.3 - i * 0.02; box(s, scale, w, w, 0.24, 0, 0, 0); box(s, belly, w * 0.8, w * 0.3, 0.24, 0, -w * 0.4, 0); if (i % 2 === 0 && i < 9) box(s, fin, 0.03, 0.14, 0.18, 0, w * 0.6, 0); return s; });
        const head = new THREE.Group(); segs[0].add(head);
        box(head, scale, 0.36, 0.3, 0.4, 0, 0.02, 0.22); box(head, scale, 0.26, 0.12, 0.2, 0, -0.08, 0.45);
        for (const s of [-1, 1]) { box(head, glow('#ffe14d', 1), 0.06, 0.05, 0.02, s * 0.12, 0.08, 0.42); box(head, fin, 0.03, 0.22, 0.16, s * 0.18, 0.12, 0.1, -0.5, 0, s * 0.4); }
        up.push(t => { segs.forEach((s, i) => { s.position.set(Math.sin(t * 2 - i * 0.55) * 0.25, Math.sin(t * 1.4 - i * 0.4) * 0.12, 0.6 - i * 0.2); s.rotation.y = Math.cos(t * 2 - i * 0.55) * 0.5; }); });
    },
    // 성운 고양이: 보랏빛 고양이 모양에 별이 반짝, 꼬리 끝에서 은하가 흩어짐, 주위를 도는 별
    pet_nebulacat(g, up) {
        g.position.y = 0.3;
        const neb = std('#3a1a6a', { emissive: '#6a2aff', ei: 0.7, rough: 0.3 });
        const body = new THREE.Group(); g.add(body);
        box(body, neb, 0.42, 0.42, 0.5, 0, 0.28, -0.05);
        const head = new THREE.Group(); head.position.set(0, 0.66, 0.05); body.add(head);
        box(head, neb, 0.46, 0.36, 0.38, 0, 0, 0); for (const s of [-1, 1]) box(head, neb, 0.12, 0.16, 0.08, s * 0.15, 0.24, 0, 0, 0, s * -0.3);
        eyes(head, 0.04, 0.195, 0.12, 0.07, 0xfff3a0);
        const specks = Array.from({ length: 10 }, () => box(body, glow('#ffffff', 1), 0.03, 0.03, 0.03, (Math.random() - 0.5) * 0.4, 0.1 + Math.random() * 0.8, (Math.random() - 0.5) * 0.45 + 0.02));
        const tail = Array.from({ length: 6 }, (_, i) => box(body, glow(i % 2 ? '#ff7ad8' : '#7ac8ff', 0.9 - i * 0.12), 0.08, 0.08, 0.08, 0, 0, 0));
        const stars = [0, 1, 2].map(() => box(g, glow('#fff3a0', 1), 0.07, 0.07, 0.07, 0, 0, 0));
        up.push(t => { body.position.y = Math.sin(t * 1.5) * 0.1; tail.forEach((b, i) => { b.position.set(Math.sin(t * 2 - i * 0.5) * 0.12, 0.3 + i * 0.12, -0.32 - i * 0.07); }); specks.forEach((s, i) => s.scale.setScalar(0.03 * (0.5 + Math.abs(Math.sin(t * 3 + i))))); stars.forEach((s, i) => { const a = t * 1.5 + i * 2.1; s.position.set(Math.cos(a) * 0.6, 0.7 + Math.sin(a * 2) * 0.15, Math.sin(a) * 0.6); s.rotation.set(t, t, 0); }); head.rotation.z = Math.sin(t * 0.8) * 0.1; });
    },
    // 천룡: 금빛 비늘의 기다란 동양 용이 원을 그리며 날고, 앞에서 여의주가 빛남
    pet_skydragon(g, up) {
        g.position.y = 1.6;
        const gold = std('#ffd23a', { metal: 0.8, rough: 0.25, emissive: '#7a4a00', ei: 0.6 }), white = std('#fff8e8', { emissive: '#6a5a3a', ei: 0.3 }), red = std('#ff4a3a', { emissive: '#7a0a0a', ei: 0.4 });
        const N = 14;
        const segs = Array.from({ length: N }, (_, i) => { const s = new THREE.Group(); g.add(s); const w = 0.24 - i * 0.01; box(s, i % 2 ? gold : white, w, w, 0.22, 0, 0, 0); if (i % 3 === 1) box(s, red, 0.05, 0.14, 0.12, 0, w * 0.6, 0); if (i === 4 || i === 10) for (const sd of [-1, 1]) box(s, gold, 0.05, 0.16, 0.05, sd * 0.14, -0.12, 0.04); return s; });
        const head = new THREE.Group(); segs[0].add(head);
        box(head, gold, 0.32, 0.26, 0.36, 0, 0.02, 0.2); box(head, white, 0.22, 0.1, 0.2, 0, -0.08, 0.42);
        for (const s of [-1, 1]) { box(head, glow('#ff4a3a', 1), 0.05, 0.04, 0.02, s * 0.1, 0.08, 0.38); box(head, std('#f2e6c8'), 0.04, 0.04, 0.3, s * 0.1, 0.2, -0.05, 0.6, s * 0.3, 0); box(head, red, 0.02, 0.02, 0.3, s * 0.12, -0.06, 0.5, 0.2, s * 0.6, 0); }
        const pearl = box(g, glow('#bff4ff', 1), 0.16, 0.16, 0.16, 0, 0, 0);
        up.push(t => {
            const path = k => { const a = t * 1.2 - k * 0.32; return [Math.cos(a) * 0.55, Math.sin(t * 2 - k * 0.5) * 0.18, Math.sin(a) * 0.55]; };
            segs.forEach((s, i) => { const [x, y, z] = path(i); s.position.set(x, y, z); const [x2, y2, z2] = path(i - 0.4); s.lookAt(s.parent.localToWorld(new THREE.Vector3(x2, y2, z2))); });
            const [px, py, pz] = path(-1.4); pearl.position.set(px, py + 0.05, pz); pearl.rotation.set(t * 2, t * 3, 0); pearl.scale.setScalar(0.16 * (1 + 0.2 * Math.sin(t * 6)));
        });
    },
};

// 캐릭터를 따라다니는 펫
export function createPetRig(dummy) {
    const holder = new THREE.Group();
    holder.position.set(2.6, 0, 0.9);
    holder.userData.noFit = true;
    dummy.root.add(holder);
    let cur = null, up = [], id = null;
    function dispose(g) { g.traverse(o => { if (o.material) o.material.dispose?.(); }); }
    return {
        set(petId) {
            if (petId === id) return;
            id = petId;
            if (cur) { holder.remove(cur); dispose(cur); cur = null; up = []; }
            const build = petId && PET_BUILD[petId];
            if (!build) return;
            cur = new THREE.Group();
            build(cur, up);
            holder.add(cur);
        },
        update(t) {
            if (!cur) return;
            // 캐릭터 쪽을 살짝 보며 둥실둥실
            holder.rotation.y = -0.5 + Math.sin(t * 0.5) * 0.15;
            holder.position.x = 2.6 + Math.sin(t * 0.7) * 0.15;
            up.forEach(u => u(t));
        }
    };
}

// 미리보기용 모형 (가운데 정렬, 너무 크지 않게)
export function buildPetModel(id) {
    const build = PET_BUILD[id];
    if (!build) return null;
    const root = new THREE.Group();
    const inner = new THREE.Group();
    const up = [];
    build(inner, up);
    inner.position.y -= inner.position.y + 0.45;   // 떠 있는 펫도 가운데로
    inner.scale.setScalar(1.9);
    root.add(inner);
    return {
        root, isAmulet: false, isPet: true,
        update(t) { up.forEach(u => u(t)); },
        dispose() { root.traverse(o => { if (o.material) o.material.dispose?.(); }); }
    };
}
