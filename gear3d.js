/* =========================================================
   🥊 장비 3D (gear3d.js)
   - 건틀렛: 캐릭터 기준 오른팔(dummy.armL, 화면에선 왼쪽) 아래팔에 낌
   - 부적:   캐릭터 기준 왼팔(dummy.armR) 윗팔에 띠를 감고 부적 종이를 매담
   - 전부 네모 박스로만 만든다
   - 팔 피벗 기준: 팔은 y 0.1 ~ -1.9, 폭 1 x 1 (손끝이 -1.9)
   ========================================================= */

import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);

const std = (color, { metal = 0.2, rough = 0.55, emissive = null, ei = 0 } = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive: emissive ?? 0x000000, emissiveIntensity: ei });
const glow = (color, opacity = 1) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

function box(parent, mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(BOX, mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
}

// 아래팔을 감싸는 기본 껍데기. side = 바깥쪽 방향 (-1: 화면 왼쪽)
function shell(g, mat, { top = -0.95, bottom = -1.98, grow = 0.12 } = {}) {
    const h = top - bottom;
    return box(g, mat, 1 + grow, h, 1 + grow, 0, (top + bottom) / 2, 0);
}

/* ---------- 건틀렛 ---------- */
const GAUNTLETS = {
    // ⏩ 시간 가속: 은색 + 시계 문자판, 바늘이 빠르게 돌고 잔상 고리
    gear_timewarp(g, up, side) {
        const silver = std('#cfd6e6', { metal: 0.9, rough: 0.2 });
        const blue = std('#2a5aff', { emissive: '#1a3aff', ei: 0.7, metal: 0.4 });
        shell(g, silver, { top: -0.8 });
        box(g, blue, 1.18, 0.1, 1.18, 0, -0.85, 0); box(g, blue, 1.18, 0.1, 1.18, 0, -1.92, 0);
        const dial = new THREE.Group(); dial.position.set(0, -1.38, 0.6); g.add(dial);
        box(dial, std('#f4f6ff', { emissive: '#9ab0ff', ei: 0.3 }), 0.5, 0.5, 0.04, 0, 0, 0);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(dial, std('#1a2040'), 0.03, i % 3 ? 0.04 : 0.08, 0.02, Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.03, 0, 0, -a); }
        const hand = new THREE.Group(); dial.add(hand); box(hand, glow('#2a8cff', 1), 0.03, 0.2, 0.02, 0, 0.1, 0.04);
        const rings = [0, 1, 2].map(i => box(g, glow('#7ab0ff', 0.4), 1.3 + i * 0.12, 0.03, 1.3 + i * 0.12, 0, -1.0 - i * 0.35, 0));
        up.push(t => { hand.rotation.z = -t * 9; rings.forEach((r, i) => { r.rotation.y = t * (2 + i); r.material.opacity = 0.2 + Math.sin(t * 6 + i) * 0.15; }); });
    },
    // ⚡ 번개 사냥꾼: 검은 가죽 + 노란 번개 문양, 손등 위로 전기가 튐
    gear_thunderhunt(g, up, side) {
        const leather = std('#1a1a22', { rough: 0.6 });
        const volt = glow('#ffe14d', 1);
        shell(g, leather, { top: -0.8 });
        box(g, std('#ffd23a', { metal: 0.8, rough: 0.3 }), 1.2, 0.07, 1.2, 0, -0.84, 0);
        [[0, -1.1], [0.12, -1.3], [-0.06, -1.5], [0.08, -1.7]].forEach(([x, y], i) => box(g, volt, 0.22, 0.06, 0.03, x, y, 0.585, 0, 0, i % 2 ? 0.7 : -0.7));
        for (const s2 of [-1, 1]) box(g, std('#3a3a48', { metal: 0.7 }), 0.1, 0.5, 0.3, s2 * 0.62, -1.4, 0);
        const sparks = Array.from({ length: 5 }, () => box(g, volt, 0.04, 0.16, 0.04, 0, 0, 0));
        up.push(t => sparks.forEach((b, i) => { const k = (t * 3 + i * 0.2) % 1; b.visible = k < 0.5; b.position.set(Math.sin(i * 7 + t * 20) * 0.4, -1.0 - k * 0.6, 0.64); b.rotation.z = Math.sin(t * 30 + i) * 1.2; }));
    },
    // 🌊 심해 군주: 청록 비늘 + 산호 뿔, 주위를 도는 물방울
    gear_abyssking(g, up, side) {
        const scale = std('#1a6a7a', { metal: 0.5, rough: 0.3, emissive: '#0a3a4a', ei: 0.4 });
        shell(g, scale, { top: -0.75, grow: 0.16 });
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) box(g, std('#2a9aaa', { metal: 0.6, rough: 0.25 }), 0.28, 0.16, 0.03, (c - 1) * 0.32 + (r % 2) * 0.12, -0.95 - r * 0.24, 0.6);
        const coral = std('#ff6a8a', { emissive: '#ff2a5a', ei: 0.4 });
        for (let i = 0; i < 3; i++) box(g, coral, 0.08, 0.3 + i * 0.08, 0.08, side * (0.62 + i * 0.04), -0.9 - i * 0.12, (i - 1) * 0.25, 0, 0, side * 0.5);
        const drops = Array.from({ length: 6 }, () => box(g, glow('#7af0ff', 0.85), 0.08, 0.1, 0.08, 0, 0, 0));
        up.push(t => drops.forEach((d, i) => { const a = t * 1.4 + i / 6 * Math.PI * 2; d.position.set(Math.cos(a) * 0.85, -1.3 + Math.sin(t * 2 + i) * 0.35, Math.sin(a) * 0.85); }));
    },
    // ☀ 태양 대장간: 붉게 달아오른 금속 + 손등의 작은 태양, 불꽃이 위로
    gear_sunforge(g, up, side) {
        const iron = std('#3a2a20', { metal: 0.8, rough: 0.35, emissive: '#ff4a10', ei: 0.25 });
        const gold = std('#ffcf4a', { metal: 0.95, rough: 0.15, emissive: '#7a4a00', ei: 0.5 });
        shell(g, iron, { top: -0.75, grow: 0.18 });
        box(g, gold, 1.24, 0.1, 1.24, 0, -0.78, 0); box(g, gold, 1.24, 0.1, 1.24, 0, -1.95, 0);
        for (let i = 0; i < 4; i++) box(g, glow('#ff7a1a', 0.9), 1.22, 0.03, 0.03, 0, -1.05 - i * 0.22, 0.6);
        const sun = new THREE.Group(); sun.position.set(0, -1.38, 0.68); g.add(sun);
        box(sun, std('#fff3c0', { emissive: '#ffb02e', ei: 1.6 }), 0.24, 0.24, 0.1, 0, 0, 0);
        const rays = Array.from({ length: 8 }, (_, i) => { const r = new THREE.Group(); r.rotation.z = i / 8 * Math.PI * 2; sun.add(r); box(r, glow('#ffd23a', 0.9), 0.04, 0.14, 0.03, 0, 0.22, 0); return r; });
        const fl = Array.from({ length: 6 }, () => box(g, glow('#ff8a2a', 0.9), 0.07, 0.07, 0.07, 0, 0, 0));
        up.push(t => { sun.rotation.z = t * 0.8; fl.forEach((f, i) => { const k = (t * 0.9 + i / 6) % 1; f.position.set(Math.sin(i * 3) * 0.45, -1.9 + k * 1.3, 0.3 + Math.cos(i * 2) * 0.2); f.scale.setScalar(0.07 * (1 - k) + 0.01); }); });
    },
    // 초보자의 운수대통: 갈색 가죽 + 금 징 + 손등에 네모 네잎클로버
    gear_beginner(g, up, side) {
        const leather = std('#7a4a2a', { rough: 0.85 });
        const strap = std('#4a2c18', { rough: 0.9 });
        const gold = std('#ffcf4a', { metal: 0.8, rough: 0.3, emissive: '#ffb300', ei: 0.25 });
        shell(g, leather, { top: -1.15 });
        box(g, strap, 1.16, 0.12, 1.16, 0, -1.3, 0);
        box(g, strap, 1.16, 0.12, 1.16, 0, -1.62, 0);
        for (const z of [-0.3, 0.3]) for (const y of [-1.3, -1.62]) box(g, gold, 0.1, 0.1, 0.1, side * 0.6, y, z);
        // 손등(앞면)에 네잎클로버
        const leaf = std('#3ddc6a', { emissive: '#1fbf4a', ei: 0.55, rough: 0.5 });
        const clover = new THREE.Group();
        clover.position.set(0, -1.55, 0.6);
        for (const [x, y] of [[-0.13, 0.13], [0.13, 0.13], [-0.13, -0.13], [0.13, -0.13]]) box(clover, leaf, 0.22, 0.22, 0.06, x, y, 0, 0, 0, Math.PI / 4);
        box(clover, std('#2a8c3c'), 0.05, 0.22, 0.05, 0.08, -0.3, 0, 0, 0, 0.4);
        g.add(clover);
        up.push(t => { clover.rotation.z = Math.sin(t * 2) * 0.12; clover.scale.setScalar(1 + Math.sin(t * 4) * 0.04); });
    },

    // 폭주기관차: 검은 무쇠 + 빨간 줄 + 굴뚝 + 피스톤 + 연기 큐브
    gear_speed(g, up, side) {
        const iron = std('#26272c', { metal: 0.7, rough: 0.45 });
        const red = std('#d8262f', { metal: 0.3, rough: 0.4, emissive: '#7a0a10', ei: 0.4 });
        const brass = std('#c8a24a', { metal: 0.85, rough: 0.3 });
        shell(g, iron, { top: -0.9 });
        box(g, red, 1.15, 0.14, 1.15, 0, -1.1, 0);
        box(g, red, 1.15, 0.14, 1.15, 0, -1.75, 0);
        // 앞쪽 소 잡는 쟁기(카우캐처): 손끝 앞쪽 비스듬한 판
        for (let i = 0; i < 4; i++) box(g, red, 0.16, 0.36, 0.12, -0.36 + i * 0.24, -2.0, 0.52, -0.5, 0, 0);
        // 굴뚝 (바깥쪽 위로)
        const stack = new THREE.Group();
        stack.position.set(side * 0.62, -1.15, 0);
        box(stack, iron, 0.3, 0.42, 0.3, 0, 0.1, 0);
        box(stack, brass, 0.42, 0.1, 0.42, 0, 0.34, 0);
        g.add(stack);
        // 피스톤
        const rod = box(g, brass, 0.08, 0.08, 0.8, side * 0.6, -1.6, 0.05);
        // 리벳
        for (const y of [-1.25, -1.45, -1.6]) for (const z of [-0.35, 0, 0.35]) box(g, brass, 0.06, 0.06, 0.06, 0, y, 0.57).position.x = z;
        // 헤드라이트
        box(g, std('#fff4c0', { emissive: '#ffe066', ei: 1.6 }), 0.26, 0.26, 0.05, 0, -1.42, 0.59);
        // 연기
        const smokeMat = glow('#c7c9d6', 0.5);
        const puffs = [];
        for (let i = 0; i < 6; i++) { const p = box(g, smokeMat, 0.18, 0.18, 0.18, 0, 0, 0); puffs.push(p); }
        up.push((t, dt, speed = 1) => {
            rod.position.z = 0.05 + Math.sin(t * 9 * speed) * 0.15;
            puffs.forEach((p, i) => {
                const k = ((t * 0.9 * speed + i / puffs.length) % 1);
                p.position.set(side * (0.62 + k * 0.5), -0.75 + k * 1.2, Math.sin(i * 7 + t) * 0.1);
                const s = 0.12 + k * 0.32;
                p.scale.set(s, s, s);
                p.rotation.set(k * 3, k * 2, 0);
                p.material.opacity = 0.5 * (1 - k);
            });
        });
    },

    // 파괴신: 두툼한 검붉은 갑옷 + 가시 + 붉게 빛나는 균열
    gear_destroyer_fist(g, up, side) {
        const plate = std('#2a0d10', { metal: 0.65, rough: 0.35 });
        const edge = std('#5a1418', { metal: 0.6, rough: 0.35 });
        const lava = glow('#ff3a1f', 0.95);
        shell(g, plate, { top: -0.7, grow: 0.22 });
        box(g, edge, 1.3, 0.16, 1.3, 0, -0.72, 0);
        box(g, edge, 1.34, 0.4, 1.3, 0, -1.85, 0.02);   // 주먹 덩어리
        // 손가락 마디 가시
        for (const x of [-0.42, -0.14, 0.14, 0.42]) box(g, edge, 0.12, 0.12, 0.34, x, -1.85, 0.75, 0, 0, Math.PI / 4);
        // 바깥쪽 큰 가시
        for (const [y, s] of [[-0.95, 0.55], [-1.3, 0.7], [-1.62, 0.5]]) {
            const sp = box(g, edge, s, 0.14, 0.14, side * (0.66 + s / 2), y, 0, 0, 0, side * 0.35);
            sp.rotation.x = Math.PI / 4;
        }
        // 균열 (빛)
        const cracks = [];
        for (const [w, h, x, y, rz] of [[0.06, 0.5, -0.15, -1.1, 0.4], [0.06, 0.4, 0.2, -1.45, -0.5], [0.3, 0.06, 0.05, -1.3, 0], [0.06, 0.3, -0.3, -1.55, 0.2]]) {
            cracks.push(box(g, lava, w, h, 0.04, x, y, 0.62, 0, 0, rz));
            cracks.push(box(g, lava, w, h, 0.04, x, y, -0.62, 0, 0, -rz));
        }
        const core = box(g, std('#ff4a1f', { emissive: '#ff2a00', ei: 1.4 }), 0.22, 0.22, 0.06, 0, -1.3, 0.63, 0, 0, Math.PI / 4);
        up.push(t => {
            const p = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.6));
            cracks.forEach(c => { c.material.opacity = p; });
            const k = 0.85 + p * 0.3; core.scale.set(0.22 * k, 0.22 * k, 0.06);
        });
    },

    // 크레이지콩: 커다란 고릴라 주먹 (털 큐브가 들썩들썩)
    gear_crazykong_heart(g, up, side) {
        const fur = std('#8a5a32', { rough: 0.95 });
        const furDark = std('#5e3b1f', { rough: 0.95 });
        const skin = std('#5a4a40', { rough: 0.8 });
        const fist = new THREE.Group();
        g.add(fist);
        box(fist, fur, 1.24, 0.8, 1.24, 0, -1.2, 0);
        box(fist, skin, 1.5, 0.75, 1.45, 0, -1.92, 0.05);      // 왕주먹
        for (const x of [-0.5, -0.17, 0.17, 0.5]) box(fist, skin, 0.3, 0.3, 0.2, x, -1.75, 0.82);
        box(fist, std('#ffd84a', { emissive: '#ffc400', ei: 0.4 }), 1.46, 0.1, 0.1, 0, -1.58, 0.78);   // 바나나색 손목띠
        const tufts = [];
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2;
            tufts.push(box(fist, i % 2 ? fur : furDark, 0.22, 0.32, 0.22, Math.cos(a) * 0.66, -0.9 + (i % 3) * -0.12, Math.sin(a) * 0.66, 0, 0, Math.cos(a) * 0.3));
        }
        up.push((t, dt, speed = 1) => {
            const b = Math.max(0, Math.sin(t * 5 * speed));
            fist.position.y = -b * 0.06;
            fist.scale.set(1 + b * 0.05, 1, 1 + b * 0.05);
            tufts.forEach((tf, i) => { tf.rotation.x = Math.sin(t * 6 + i) * 0.25; });
        });
    },

    // 대마법사: 보라 천 토시 + 금테 + 손등 보석 + 손목 둘레를 도는 룬 큐브
    gear_wizard(g, up, side) {
        const cloth = std('#2c1a66', { rough: 0.7 });
        const trim = std('#e8c25a', { metal: 0.85, rough: 0.25, emissive: '#a07a10', ei: 0.3 });
        shell(g, cloth, { top: -0.85 });
        box(g, trim, 1.17, 0.1, 1.17, 0, -0.88, 0);
        box(g, trim, 1.17, 0.1, 1.17, 0, -1.95, 0);
        // 넓게 퍼지는 소맷부리
        box(g, cloth, 1.36, 0.18, 1.36, 0, -0.96, 0);
        const gem = box(g, std('#7af7ff', { emissive: '#36d6ff', ei: 2.0, rough: 0.1 }), 0.26, 0.26, 0.1, 0, -1.5, 0.6, 0, 0, Math.PI / 4);
        box(g, trim, 0.4, 0.4, 0.06, 0, -1.5, 0.57, 0, 0, Math.PI / 4);
        const runeMat = glow('#9a7bff', 0.9);
        const runes = [];
        for (let i = 0; i < 5; i++) runes.push(box(g, runeMat, 0.12, 0.12, 0.12, 0, 0, 0));
        up.push(t => {
            runes.forEach((r, i) => {
                const a = t * 1.6 + (i / runes.length) * Math.PI * 2;
                r.position.set(Math.cos(a) * 0.95, -1.45 + Math.sin(t * 2 + i) * 0.18, Math.sin(a) * 0.95);
                r.rotation.set(t * 2 + i, t * 3, 0);
            });
            gem.material.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.6;
        });
    },

    // 두 심장: 흰 판금 + 픽셀 하트 두 개가 번갈아 쿵쾅
    gear_two_hearts(g, up, side) {
        const white = std('#f1eef4', { metal: 0.5, rough: 0.3 });
        const crimson = std('#b3122e', { metal: 0.4, rough: 0.35 });
        shell(g, white, { top: -0.8, grow: 0.16 });
        box(g, crimson, 1.2, 0.14, 1.2, 0, -0.82, 0);
        box(g, crimson, 1.2, 0.14, 1.2, 0, -1.95, 0);
        // 픽셀 하트 모양
        const HEART = ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000'];
        function pixelHeart(color) {
            const h = new THREE.Group();
            const m = std(color, { emissive: color, ei: 1.1, rough: 0.4 });
            const s = 0.055;
            HEART.forEach((row, r) => [...row].forEach((c, k) => {
                if (c === '1') box(h, m, s, s, 0.05, (k - 3.5) * s, (2.5 - r) * s, 0);
            }));
            return h;
        }
        const h1 = pixelHeart('#ff2a4f'); h1.position.set(-0.2, -1.25, 0.6);
        const h2 = pixelHeart('#ff7aa0'); h2.position.set(0.2, -1.6, 0.6);
        g.add(h1, h2);
        // 옆면 혈관 줄
        for (const y of [-1.1, -1.4, -1.7]) box(g, crimson, 0.05, 0.05, 1.0, side * 0.59, y, 0);
        up.push(t => {
            const beat = k => { const x = (t * 1.3 + k) % 1; return x < 0.12 ? 1 + x * 3 : x < 0.24 ? 1.36 - (x - 0.12) * 3 : 1; };
            h1.scale.setScalar(beat(0));
            h2.scale.setScalar(beat(0.5));
        });
    },
    // 🎲 행운의 주사위: 카지노 빨강 판금 + 손등의 큰 주사위 + 팔을 도는 작은 주사위 2개
    gacha_dice(g, up, side) {
        const red = std('#b0102a', { metal: 0.45, rough: 0.35 });
        const black = std('#15151c', { metal: 0.6, rough: 0.4 });
        const gold = std('#ffd25a', { metal: 0.9, rough: 0.25, emissive: '#ffae00', ei: 0.3 });
        shell(g, red, { top: -0.9, grow: 0.14 });
        box(g, black, 1.18, 0.12, 1.18, 0, -0.92, 0);
        box(g, black, 1.18, 0.12, 1.18, 0, -1.92, 0);
        box(g, gold, 1.2, 0.04, 1.2, 0, -0.85, 0);
        // 다이아 무늬 (카드 무늬처럼 옆면)
        for (const y of [-1.2, -1.6]) box(g, gold, 0.14, 0.14, 0.04, side * 0.58, y, 0, 0, Math.PI / 2, Math.PI / 4);
        // 주사위 만들기 (눈은 검은 네모)
        const PIPS = { 1: [[0, 0]], 2: [[-1, 1], [1, -1]], 3: [[-1, 1], [0, 0], [1, -1]], 4: [[-1, 1], [1, 1], [-1, -1], [1, -1]], 5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]], 6: [[-1, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [1, -1]] };
        function die(size, body, pipMat) {
            const d = new THREE.Group();
            box(d, body, size, size, size, 0, 0, 0);
            const off = size * 0.27, ps = size * 0.16, sur = size / 2 + 0.005;
            const faces = [[1, [0, 0, 1]], [6, [0, 0, -1]], [2, [0, 1, 0]], [5, [0, -1, 0]], [3, [1, 0, 0]], [4, [-1, 0, 0]]];
            for (const [n, [nx, ny, nz]] of faces) for (const [a, b] of PIPS[n]) {
                const pip = new THREE.Mesh(BOX, n === 1 ? std('#e01030', { emissive: '#ff1030', ei: 0.6 }) : pipMat);
                if (nz) { pip.scale.set(ps, ps, 0.02); pip.position.set(a * off, b * off, nz * sur); }
                else if (ny) { pip.scale.set(ps, 0.02, ps); pip.position.set(a * off, ny * sur, b * off); }
                else { pip.scale.set(0.02, ps, ps); pip.position.set(nx * sur, b * off, a * off); }
                d.add(pip);
            }
            return d;
        }
        const ivory = std('#f6f2e8', { rough: 0.35 });
        const big = die(0.46, ivory, black);
        big.position.set(0, -1.42, 0.78);
        g.add(big);
        box(g, gold, 0.6, 0.6, 0.06, 0, -1.42, 0.58);   // 받침
        const minis = [die(0.22, ivory, black), die(0.22, std('#1a1a22', { metal: 0.5 }), std('#ffd25a', { emissive: '#ffae00', ei: 0.8 }))];
        minis.forEach(m => g.add(m));
        const spark = glow('#ffe27a', 0.9);
        const sparks = Array.from({ length: 4 }, () => box(g, spark, 0.06, 0.06, 0.06, 0, 0, 0));
        up.push((t) => {
            // 큰 주사위: 2초마다 데굴 굴렀다가 멈춤
            const ph = t % 2.4, roll = Math.min(1, ph / 0.5);
            const e = 1 - Math.pow(1 - roll, 3);
            const n = Math.floor(t / 2.4);
            big.rotation.set((n + e) * Math.PI / 2, (n % 2) * Math.PI / 2 * e, 0);
            big.position.z = 0.78 + Math.sin(roll * Math.PI) * 0.15;
            minis.forEach((m, i) => {
                const a = t * 1.8 + i * Math.PI;
                m.position.set(Math.cos(a) * 0.95, -1.35 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.95);
                m.rotation.set(t * 2.5 + i, t * 1.7, t * 0.9);
            });
            sparks.forEach((s, i) => {
                const k = (t * 0.8 + i / 4) % 1;
                s.position.set(Math.sin(i * 2.1) * 0.35, -1.42 + k * 0.9, 0.85 + Math.cos(i * 1.3) * 0.15);
                s.scale.setScalar(0.06 * (1 - k));
            });
        });
    },

    // 🎰 잭팟: 금빛 슬롯머신. 손등에 릴 3개가 돌다 멈추고, 바깥쪽 레버가 당겨지면 코인이 튐
    gacha_jackpot(g, up, side) {
        const gold = std('#e9b530', { metal: 0.9, rough: 0.22, emissive: '#7a5200', ei: 0.25 });
        const dark = std('#2a1036', { metal: 0.4, rough: 0.4 });
        const red = std('#e8213a', { metal: 0.3, rough: 0.3, emissive: '#a0001a', ei: 0.5 });
        shell(g, gold, { top: -0.82, grow: 0.16 });
        box(g, dark, 1.2, 0.16, 1.2, 0, -0.86, 0);
        box(g, dark, 1.2, 0.16, 1.2, 0, -1.94, 0);
        // 릴 창
        box(g, dark, 0.98, 0.5, 0.08, 0, -1.38, 0.6);
        const SYM = ['#ff2a44', '#ffd23a', '#3ddc6a', '#5ab0ff'];
        const reels = [];
        for (let i = 0; i < 3; i++) {
            const reel = new THREE.Group();
            reel.position.set((i - 1) * 0.3, -1.38, 0.6);
            for (let k = 0; k < 4; k++) {
                const face = new THREE.Group();
                face.rotation.x = k * Math.PI / 2;
                box(face, std('#fff6e0', { rough: 0.5 }), 0.24, 0.3, 0.02, 0, 0, 0.15);
                // 7 / 체리 / 바 / 다이아 를 네모로
                const sm = std(SYM[k], { emissive: SYM[k], ei: 0.7 });
                if (k === 0) { box(face, sm, 0.14, 0.04, 0.02, 0, 0.08, 0.17); box(face, sm, 0.04, 0.18, 0.02, 0.03, -0.02, 0.17, 0, 0, -0.35); }
                else if (k === 1) { box(face, sm, 0.07, 0.07, 0.02, -0.04, -0.05, 0.17); box(face, sm, 0.07, 0.07, 0.02, 0.05, -0.04, 0.17); box(face, std('#2a8c3c'), 0.03, 0.12, 0.02, 0.01, 0.06, 0.17, 0, 0, 0.4); }
                else if (k === 2) { box(face, sm, 0.18, 0.06, 0.02, 0, 0.05, 0.17); box(face, sm, 0.18, 0.06, 0.02, 0, -0.05, 0.17); }
                else box(face, sm, 0.11, 0.11, 0.02, 0, 0, 0.17, 0, 0, Math.PI / 4);
                reel.add(face);
            }
            g.add(reel); reels.push(reel);
        }
        // 테두리 전구 (번갈아 깜빡)
        const bulbsA = glow('#fff2a0', 1), bulbsB = glow('#ff7a30', 1);
        for (let i = 0; i < 6; i++) {
            box(g, i % 2 ? bulbsA : bulbsB, 0.07, 0.07, 0.07, -0.45 + i * 0.18, -1.08, 0.64);
            box(g, i % 2 ? bulbsB : bulbsA, 0.07, 0.07, 0.07, -0.45 + i * 0.18, -1.68, 0.64);
        }
        // 레버 (바깥쪽)
        const lever = new THREE.Group();
        lever.position.set(side * 0.66, -1.5, 0);
        box(lever, dark, 0.12, 0.2, 0.2, 0, 0, 0);
        const stick = new THREE.Group(); lever.add(stick);
        box(stick, std('#cfd3dc', { metal: 0.9, rough: 0.2 }), 0.06, 0.55, 0.06, side * 0.05, 0.3, 0);
        box(stick, red, 0.16, 0.16, 0.16, side * 0.05, 0.6, 0);
        g.add(lever);
        // 코인
        const coinMat = std('#ffd84a', { metal: 1, rough: 0.2, emissive: '#ffb300', ei: 0.6 });
        const coins = Array.from({ length: 5 }, () => { const c = box(g, coinMat, 0.16, 0.16, 0.04, 0, 0, 0); c.visible = false; return c; });
        const coinV = coins.map(() => new THREE.Vector3());
        let lastPull = -1;
        up.push((t, dt = 1 / 60) => {
            const cyc = t % 3, n = Math.floor(t / 3);
            stick.rotation.z = -side * (cyc < 0.25 ? cyc / 0.25 * 1.1 : cyc < 0.5 ? (0.5 - cyc) / 0.25 * 1.1 : 0);
            reels.forEach((r, i) => {
                const stopAt = 0.9 + i * 0.35;
                if (cyc < stopAt) r.rotation.x += dt * 22;
                else r.rotation.x += (Math.round(r.rotation.x / (Math.PI / 2)) * Math.PI / 2 - r.rotation.x) * Math.min(1, dt * 14);
            });
            bulbsA.opacity = (Math.floor(t * 6) % 2) ? 1 : 0.25;
            bulbsB.opacity = (Math.floor(t * 6) % 2) ? 0.25 : 1;
            if (cyc > 2 && lastPull !== n) {
                lastPull = n;
                coins.forEach((c, i) => { c.visible = true; c.position.set((i - 2) * 0.08, -1.1, 0.65); coinV[i].set((i - 2) * 0.5, 2.2 + Math.random(), 0.6 + Math.random() * 0.5); });
            }
            coins.forEach((c, i) => {
                if (!c.visible) return;
                coinV[i].y -= 6 * dt;
                c.position.addScaledVector(coinV[i], dt);
                c.rotation.y += dt * 12;
                if (c.position.y < -2.6) c.visible = false;
            });
        });
    },

    // 🌠 별똥별: 밤하늘 판금(별 박힌) + 손등 수정 + 팔을 비스듬히 도는 혜성과 꼬리
    // 🎫 개척자의 건틀렛: 흰 가죽 + 금 테두리, 손등에 도는 나침반, 손목에 휘날리는 깃발 리본
    pass_gauntlet(g, up, side) {
        const leather = std('#f2ede2', { rough: 0.6 });
        const gold = std('#ffcf4a', { metal: 0.9, rough: 0.2, emissive: '#5a3a00', ei: 0.4 });
        const navy = std('#1f3a7a', { metal: 0.3, rough: 0.4 });
        shell(g, leather, { top: -0.8, grow: 0.14 });
        box(g, gold, 1.22, 0.08, 1.22, 0, -0.82, 0);
        box(g, gold, 1.22, 0.08, 1.22, 0, -1.95, 0);
        box(g, navy, 1.2, 0.18, 1.2, 0, -1.12, 0);
        for (let i = 0; i < 4; i++) box(g, gold, 0.08, 0.08, 0.08, (i - 1.5) * 0.28, -1.12, 0.61);
        // 나침반
        const comp = new THREE.Group(); comp.position.set(0, -1.5, 0.66);
        box(comp, gold, 0.5, 0.5, 0.06, 0, 0, 0);
        box(comp, std('#0b1430', { emissive: '#1a3aa0', ei: 0.6 }), 0.4, 0.4, 0.07, 0, 0, 0.01);
        const needle = new THREE.Group(); comp.add(needle);
        box(needle, glow('#ff4a5a', 1), 0.05, 0.18, 0.02, 0, 0.09, 0.05);
        box(needle, glow('#ffffff', 1), 0.05, 0.18, 0.02, 0, -0.09, 0.05);
        const ring = box(comp, glow('#ffd23a', 0.5), 0.62, 0.62, 0.02, 0, 0, -0.02, 0, 0, Math.PI / 4);
        g.add(comp);
        // 리본 깃발 (바깥쪽으로 휘날림)
        const flag = new THREE.Group(); flag.position.set(side * 0.62, -0.9, 0); g.add(flag);
        const segs = Array.from({ length: 5 }, (_, i) => box(flag, i % 2 ? navy : std('#7ad0ff', { emissive: '#2a7aff', ei: 0.4 }), 0.04, 0.16, 0.18, side * (0.05 + i * 0.12), 0, 0));
        up.push(t => {
            needle.rotation.z = Math.sin(t * 1.3) * 0.6 + Math.sin(t * 3.1) * 0.15;
            ring.rotation.z = Math.PI / 4 + t * 0.6;
            ring.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.15;
            segs.forEach((b, i) => { b.position.y = Math.sin(t * 6 - i * 0.9) * 0.05 * i; b.rotation.x = Math.sin(t * 6 - i) * 0.3; });
        });
    },

    gacha_comet(g, up, side) {
        const night = std('#0d1640', { metal: 0.75, rough: 0.25, emissive: '#0a1450', ei: 0.35 });
        const silver = std('#dfe6ff', { metal: 0.95, rough: 0.15 });
        shell(g, night, { top: -0.75, grow: 0.16 });
        box(g, silver, 1.21, 0.07, 1.21, 0, -0.78, 0);
        box(g, silver, 1.21, 0.07, 1.21, 0, -1.95, 0);
        // 박힌 별
        const starM = glow('#ffffff', 1);
        for (let i = 0; i < 18; i++) {
            const f = i % 4, y = -0.95 - Math.random() * 0.9, u = (Math.random() - 0.5) * 1.0;
            const s = 0.03 + Math.random() * 0.04;
            f === 0 ? box(g, starM, s, s, 0.02, u, y, 0.585) : f === 1 ? box(g, starM, s, s, 0.02, u, y, -0.585) : box(g, starM, 0.02, s, s, f === 2 ? 0.585 : -0.585, y, u);
        }
        // 지느러미 (바깥쪽)
        for (let i = 0; i < 3; i++) box(g, silver, 0.06, 0.3 - i * 0.06, 0.34 - i * 0.06, side * (0.64 + i * 0.05), -1.05 - i * 0.18, 0, 0, 0, side * 0.3);
        // 손등 수정
        const gem = new THREE.Group(); gem.position.set(0, -1.38, 0.66);
        box(gem, std('#7ae8ff', { emissive: '#30c8ff', ei: 1.4, metal: 0.3, rough: 0.1 }), 0.26, 0.26, 0.26, 0, 0, 0, 0, 0, Math.PI / 4);
        const halo = box(gem, glow('#7ae8ff', 0.35), 0.5, 0.5, 0.02, 0, 0, -0.02, 0, 0, Math.PI / 4);
        g.add(gem);
        // 혜성
        const orbit = new THREE.Group(); orbit.position.y = -1.35; orbit.rotation.set(0.5, 0, side * 0.35);
        const head = box(orbit, glow('#ffffff', 1), 0.16, 0.16, 0.16, 0, 0, 0);
        const TAIL = 9;
        const tail = Array.from({ length: TAIL }, (_, i) => box(orbit, glow(i < 3 ? '#bfefff' : '#6a8cff', 0.8 * (1 - i / TAIL)), 0.12, 0.12, 0.12, 0, 0, 0));
        g.add(orbit);
        up.push(t => {
            const a = t * 2.4;
            head.position.set(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95);
            head.rotation.set(t * 4, t * 3, 0);
            tail.forEach((b, i) => {
                const aa = a - (i + 1) * 0.16;
                b.position.set(Math.cos(aa) * 0.95, 0, Math.sin(aa) * 0.95);
                b.scale.setScalar(0.12 * (1 - i / TAIL * 0.8));
            });
            gem.rotation.y = t * 1.2;
            gem.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
            halo.material.opacity = 0.25 + Math.sin(t * 3) * 0.12;
            starM.opacity = 0.6 + Math.sin(t * 5) * 0.4;
        });
    },
    // 🎃 잭오랜턴: 골진 주황 호박 껍데기 + 손등에 촛불처럼 일렁이는 얼굴 + 덩굴 + 팔을 도는 박쥐
    hw_pumpkin(g, up, side) {
        const orange = std('#ff7a1a', { rough: 0.6, emissive: '#7a2a00', ei: 0.25 });
        const dark = std('#d45a0a', { rough: 0.7 });
        const vine = std('#2f7a2a', { rough: 0.8 });
        shell(g, orange, { top: -0.85, grow: 0.16 });
        // 세로 골
        for (const x of [-0.36, 0, 0.36]) { box(g, dark, 0.07, 1.1, 0.04, x, -1.4, 0.59); box(g, dark, 0.07, 1.1, 0.04, x, -1.4, -0.59); }
        for (const z of [-0.36, 0, 0.36]) { box(g, dark, 0.04, 1.1, 0.07, 0.59, -1.4, z); box(g, dark, 0.04, 1.1, 0.07, -0.59, -1.4, z); }
        // 덩굴 감기 + 꼭지
        box(g, vine, 1.2, 0.1, 1.2, 0, -0.86, 0);
        for (let i = 0; i < 4; i++) box(g, vine, 0.1, 0.1, 0.24, side * 0.62, -1.0 - i * 0.12, -0.2 + (i % 2) * 0.3, 0, 0.4, 0);
        const leaf = std('#3ddc6a', { rough: 0.6 });
        box(g, leaf, 0.22, 0.04, 0.16, side * 0.7, -0.92, 0.2, 0, 0, side * 0.5);
        // 얼굴 (빛나는 구멍)
        const fire = std('#ffd23a', { emissive: '#ffb000', ei: 2 });
        const face = new THREE.Group(); face.position.set(0, -1.38, 0.6);
        box(face, fire, 0.16, 0.16, 0.03, -0.18, 0.14, 0, 0, 0, Math.PI / 4);
        box(face, fire, 0.16, 0.16, 0.03, 0.18, 0.14, 0, 0, 0, Math.PI / 4);
        box(face, fire, 0.08, 0.08, 0.03, 0, 0.0, 0, 0, 0, Math.PI / 4);
        box(face, fire, 0.5, 0.08, 0.03, 0, -0.2, 0);
        for (const x of [-0.17, 0, 0.17]) box(face, fire, 0.07, 0.07, 0.03, x + 0.08, -0.14, 0);
        g.add(face);
        const batM = std('#140a1c', { rough: 0.6, emissive: '#3a0a50', ei: 0.4 });
        const bats = [0, 1].map(() => {
            const b = new THREE.Group();
            box(b, batM, 0.1, 0.08, 0.08, 0, 0, 0);
            const wl = box(b, batM, 0.16, 0.03, 0.08, -0.12, 0, 0), wr = box(b, batM, 0.16, 0.03, 0.08, 0.12, 0, 0);
            b.userData.w = [wl, wr];
            g.add(b); return b;
        });
        up.push(t => {
            fire.emissiveIntensity = 1.6 + Math.sin(t * 13) * 0.35 + Math.sin(t * 7.3) * 0.3;
            bats.forEach((b, i) => {
                const a = t * 2 + i * Math.PI;
                b.position.set(Math.cos(a) * 0.9, -1.0 - i * 0.5 + Math.sin(t * 4 + i) * 0.08, Math.sin(a) * 0.9);
                b.rotation.y = -a;
                const f = Math.sin(t * 22 + i) * 0.7;
                b.userData.w[0].rotation.z = f; b.userData.w[1].rotation.z = -f;
            });
        });
    },

    // 💀 해골왕: 검은 판금 위 갈비뼈 + 손등의 해골(턱이 딱딱) + 뼈 손톱 + 초록 도깨비불
    hw_skull(g, up, side) {
        const black = std('#17121f', { metal: 0.6, rough: 0.35 });
        const bone = std('#efe6d0', { rough: 0.55 });
        const soul = std('#7dff6a', { emissive: '#3dff2a', ei: 1.6 });
        shell(g, black, { top: -0.78, grow: 0.16 });
        box(g, bone, 1.2, 0.08, 1.2, 0, -0.8, 0);
        // 갈비뼈 (옆에서 앞으로 휘어짐)
        for (let i = 0; i < 4; i++) {
            const y = -0.98 - i * 0.14;
            box(g, bone, 0.06, 0.06, 0.9, side * 0.6, y, 0);
            box(g, bone, 0.5, 0.06, 0.06, side * 0.36, y, 0.6);
        }
        box(g, bone, 0.08, 0.6, 0.08, 0, -1.2, 0.6);   // 흉골
        // 해골
        const skull = new THREE.Group(); skull.position.set(0, -1.55, 0.7); skull.scale.setScalar(1.35);
        box(skull, bone, 0.4, 0.3, 0.3, 0, 0.05, 0);
        const sock = std('#0a0a0a');
        box(skull, sock, 0.1, 0.09, 0.02, -0.09, 0.07, 0.15); box(skull, sock, 0.1, 0.09, 0.02, 0.09, 0.07, 0.15);
        const eyes = [box(skull, soul, 0.05, 0.05, 0.02, -0.09, 0.07, 0.165), box(skull, soul, 0.05, 0.05, 0.02, 0.09, 0.07, 0.165)];
        box(skull, sock, 0.04, 0.05, 0.02, 0, -0.03, 0.15);
        const jaw = new THREE.Group(); jaw.position.set(0, -0.1, 0.05);
        box(jaw, bone, 0.32, 0.08, 0.22, 0, -0.04, 0);
        for (const x of [-0.1, -0.03, 0.04, 0.11]) box(jaw, bone, 0.05, 0.05, 0.02, x - 0.005, 0.01, 0.12);
        skull.add(jaw);
        g.add(skull);
        // 뼈 손톱
        for (const x of [-0.3, -0.1, 0.1, 0.3]) box(g, bone, 0.08, 0.22, 0.08, x, -2.05, 0.3, 0.4, 0, 0);
        // 도깨비불
        const wisps = Array.from({ length: 6 }, () => box(g, glow('#7dff6a', 0.7), 0.08, 0.08, 0.08, 0, 0, 0));
        up.push(t => {
            jaw.position.y = -0.1 - Math.max(0, Math.sin(t * 9)) * 0.05;
            const ek = 0.8 + Math.sin(t * 5) * 0.25;
            eyes.forEach(e => e.scale.set(0.05 * ek, 0.05 * ek, 0.02));
            soul.emissiveIntensity = 1.3 + Math.sin(t * 5) * 0.5;
            wisps.forEach((w, i) => {
                const k = (t * 0.6 + i / 6) % 1, a = i * 2.1 + t;
                w.position.set(Math.cos(a) * 0.65, -1.9 + k * 1.3, Math.sin(a) * 0.65);
                w.scale.setScalar(0.08 * (1 - k) + 0.02);
                w.material.opacity = 0.8 * (1 - k);
            });
        });
    },
    // 🌀 균열파괴자: 흑요석 판금에 보라 균열, 손등의 핵이 맥박치고 수정 가시 셋, 주위에 열리는 작은 틈
    gear_riftbreaker(g, up, side) {
        const obs = std('#1b1428', { metal: 0.55, rough: 0.3, emissive: '#2a0a4a', ei: 0.5 });
        const obs2 = std('#2a1d3e', { metal: 0.5, rough: 0.35 });
        const crys = std('#9a6aff', { emissive: '#7a3aff', ei: 1.2, rough: 0.15 });
        shell(g, obs, { top: -0.8, grow: 0.16 });
        box(g, obs2, 1.24, 0.14, 1.24, 0, -0.84, 0); box(g, obs2, 1.24, 0.14, 1.24, 0, -1.95, 0);
        const cracks = [[-0.25, -1.2, 0.5], [0.25, -1.55, -0.6], [-0.1, -1.75, 0.9]].map(([x, y, rz]) => box(g, glow('#c070ff', 1), 0.05, 0.36, 0.03, x, y, 0.6, 0, 0, rz));
        const core = box(g, std('#ff4ad8', { emissive: '#ff4ad8', ei: 2 }), 0.3, 0.3, 0.08, 0, -1.4, 0.64, 0, 0, Math.PI / 4);
        const halo = box(g, glow('#ff6ad8', 0.5), 0.5, 0.5, 0.02, 0, -1.4, 0.69, 0, 0, Math.PI / 4);
        for (let i = 0; i < 3; i++) box(g, crys, 0.12, 0.4 - i * 0.06, 0.12, side * 0.62, -1.0 - i * 0.3, (i - 1) * 0.25, 0, 0, side * -0.9);
        const tear = new THREE.Group(); tear.position.set(side * -0.9, -1.4, 0.2); g.add(tear);
        const bars = Array.from({ length: 7 }, (_, i) => { const k = i / 6; return { m: box(tear, glow(i % 2 ? '#ff6ad8' : '#ffffff', 0.9), 0.2, 0.09, 0.02, 0, (k - 0.5) * 0.7, 0), w: Math.sin(k * Math.PI) }; });
        up.push(t => {
            const p = 1 + Math.sin(t * 4) * 0.12;
            core.scale.set(0.3 * p, 0.3 * p, 0.08); halo.rotation.z = Math.PI / 4 + t; halo.material.opacity = 0.3 + Math.sin(t * 4) * 0.2;
            cracks.forEach((c, i) => { c.material.opacity = 0.6 + 0.4 * Math.sin(t * 5 + i * 2); });
            const k = (t * 0.4) % 1, open = k < 0.6 ? Math.sin(k / 0.6 * Math.PI) : 0;
            bars.forEach((b, i) => { b.m.scale.x = Math.max(0.005, b.w * 0.22 * open * (0.8 + 0.2 * Math.sin(t * 14 + i))); });
        });
    },
};

/* ---------- 부적 ---------- */
function talismanTexture(paper, ink, title) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = paper; g.fillRect(0, 0, 64, 128);
    g.strokeStyle = ink; g.lineWidth = 3;
    g.strokeRect(5, 5, 54, 118);
    g.fillStyle = ink;
    // 위쪽 네모 도장
    g.fillRect(20, 12, 24, 4); g.fillRect(20, 28, 24, 4); g.fillRect(20, 12, 4, 20); g.fillRect(40, 12, 4, 20);
    g.fillRect(28, 18, 8, 8);
    // 가운데 글씨 (세로)
    g.font = 'bold 18px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    [...title].forEach((ch, i) => g.fillText(ch, 32, 50 + i * 20));
    // 아래 꼬불 획 (네모로)
    g.fillRect(14, 112, 36, 3); g.fillRect(30, 100, 3, 14);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    return tex;
}

const AMULETS = {
    // ⏳ 인내의 모래시계: 띠에 매달린 금빛 모래시계, 모래가 떨어지고 4초마다 뒤집힘
    amu_hourglass(g, up, side) {
        box(g, std('#5a3a22', { rough: 0.8 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        const gold = std('#e8b84a', { metal: 0.9, rough: 0.25 });
        const hg = new THREE.Group(); hg.position.set(0, -0.82, 0.62); g.add(hg);
        box(hg, gold, 0.34, 0.05, 0.2, 0, 0.26, 0); box(hg, gold, 0.34, 0.05, 0.2, 0, -0.26, 0);
        for (const x of [-0.15, 0.15]) box(hg, gold, 0.03, 0.5, 0.03, x, 0, 0.08);
        const glass = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.1 });
        box(hg, glass, 0.22, 0.2, 0.14, 0, 0.12, 0); box(hg, glass, 0.22, 0.2, 0.14, 0, -0.12, 0);
        const top = box(hg, std('#ffd98a', { emissive: '#ffb02e', ei: 0.6 }), 0.16, 0.12, 0.1, 0, 0.12, 0);
        const bot = box(hg, std('#ffd98a', { emissive: '#ffb02e', ei: 0.6 }), 0.16, 0.02, 0.1, 0, -0.2, 0);
        const fall = box(hg, glow('#ffe7a0', 1), 0.02, 0.18, 0.02, 0, 0, 0);
        up.push(t => {
            const c = (t % 4) / 4, k = Math.min(1, c / 0.85);
            top.scale.y = Math.max(0.05, 1 - k); top.position.y = 0.06 + 0.06 * (1 - k);
            bot.scale.y = 0.2 + k * 5; bot.position.y = -0.21 + k * 0.05;
            fall.visible = k < 1;
            hg.rotation.z = c > 0.85 ? (c - 0.85) / 0.15 * Math.PI : 0;
        });
    },
    // ✨ 쌍둥이 별: 남색 띠 + 서로 도는 두 별 (하늘/분홍)
    amu_twinstar(g, up, side) {
        box(g, std('#1a1f3a', { metal: 0.5, rough: 0.35 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        box(g, glow('#c08bff', 0.9), 1.12, 0.04, 1.12, 0, -0.32, 0);
        const pivot = new THREE.Group(); pivot.position.set(0, -0.82, 0.62); g.add(pivot);
        const mk = c => { const st = new THREE.Group(); const m = std(c, { emissive: c, ei: 1.2 }); box(st, m, 0.14, 0.14, 0.06, 0, 0, 0); box(st, m, 0.14, 0.14, 0.06, 0, 0, 0, 0, 0, Math.PI / 4); pivot.add(st); return st; };
        const a = mk('#7ae8ff'), b = mk('#ff8ad8');
        const link = box(pivot, glow('#ffffff', 0.5), 0.3, 0.02, 0.02, 0, 0, 0);
        up.push(t => { const r = t * 2; a.position.set(Math.cos(r) * 0.16, Math.sin(r) * 0.16, 0); b.position.set(-Math.cos(r) * 0.16, -Math.sin(r) * 0.16, 0); a.rotation.z = b.rotation.z = t * 3; link.rotation.z = r; });
    },
    // ⚖ 연금 저울: 금 저울 양쪽 접시에 금화, 천천히 기울며 균형
    amu_scale(g, up, side) {
        box(g, std('#3a2a5a', { rough: 0.6 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        const gold = std('#ffcf4a', { metal: 0.95, rough: 0.2 });
        const sc = new THREE.Group(); sc.position.set(0, -0.62, 0.62); g.add(sc);
        box(sc, gold, 0.04, 0.4, 0.04, 0, -0.2, 0);
        const beam = new THREE.Group(); beam.position.y = -0.04; sc.add(beam);
        box(beam, gold, 0.56, 0.03, 0.03, 0, 0, 0);
        const pans = [-1, 1].map(s2 => { const p = new THREE.Group(); p.position.x = s2 * 0.26; beam.add(p); box(p, gold, 0.01, 0.16, 0.01, 0, -0.08, 0); box(p, gold, 0.18, 0.02, 0.14, 0, -0.17, 0); box(p, std('#fff0a0', { emissive: '#ffb02e', ei: 0.5, metal: 0.8 }), 0.08, 0.04, 0.08, 0, -0.14, 0); return p; });
        up.push(t => { beam.rotation.z = Math.sin(t * 1.2) * 0.25; pans.forEach(p => { p.rotation.z = -beam.rotation.z; }); });
    },
    // 🥚 생명의 요람: 초록 잎 띠 + 잎사귀 요람 속에 빛나는 작은 알
    amu_cradle(g, up, side) {
        box(g, std('#2f6a3a', { rough: 0.7 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        const leaf = std('#4ad65a', { emissive: '#22a040', ei: 0.4 });
        const cr = new THREE.Group(); cr.position.set(0, -0.76, 0.62); g.add(cr);
        for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 2.2; box(cr, leaf, 0.08, 0.2, 0.05, Math.sin(a) * 0.16, -Math.cos(a) * 0.1, 0, 0, 0, a); }
        const egg = box(cr, std('#fff3e0', { emissive: '#ffd98a', ei: 0.7 }), 0.13, 0.17, 0.12, 0, 0.0, 0.02);
        const motes = Array.from({ length: 4 }, () => box(g, glow('#b6ffcb', 1), 0.04, 0.04, 0.04, 0, 0, 0));
        up.push(t => { egg.rotation.z = Math.sin(t * 2.4) * 0.15; motes.forEach((m, i) => { const k = (t * 0.6 + i / 4) % 1; m.position.set(Math.sin(i * 2 + t) * 0.2, -0.85 + k * 0.5, 0.66); m.scale.setScalar(0.04 * (1 - k) + 0.005); }); });
    },
    // ⚗ 물약 장인: 가죽 띠에 꽂힌 작은 물약 세 병, 거품이 올라옴
    amu_brewer(g, up, side) {
        box(g, std('#6a4a2a', { rough: 0.8 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        const glass = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.1 });
        const cols = ['#ff5a8a', '#7dff6a', '#5ab0ff'];
        const bub = [];
        cols.forEach((c, i) => {
            const v = new THREE.Group(); v.position.set((i - 1) * 0.24, -0.55, 0.6); g.add(v);
            box(v, glass, 0.16, 0.24, 0.12, 0, -0.12, 0); box(v, std(c, { emissive: c, ei: 0.8 }), 0.13, 0.15, 0.09, 0, -0.16, 0);
            box(v, std('#8a5a2a'), 0.08, 0.05, 0.06, 0, 0.02, 0);
            bub.push(box(v, glow('#ffffff', 0.9), 0.03, 0.03, 0.03, 0, 0, 0));
        });
        up.push(t => bub.forEach((b, i) => { const k = (t * 1.2 + i * 0.33) % 1; b.position.set(Math.sin(t * 3 + i) * 0.03, -0.22 + k * 0.2, 0.05); b.scale.setScalar(0.03 * (1 - k) + 0.005); }));
    },
    // 평범함의 부적: 회색 천 띠 + 누런 종이 부적 한 장
    amulet_drum(g, up, side) {
        const band = std('#6c6e78', { rough: 0.9 });
        box(g, band, 1.1, 0.26, 1.1, 0, -0.42, 0);
        box(g, std('#3d3f48'), 1.12, 0.06, 1.12, 0, -0.32, 0);
        const paper = new THREE.Group();
        paper.position.set(side * 0.2, -0.5, 0.57);
        const mat = new THREE.MeshStandardMaterial({ map: talismanTexture('#e9d27a', '#b3261e', '평범'), roughness: 0.9 });
        box(paper, mat, 0.42, 0.84, 0.03, 0, -0.42, 0);
        g.add(paper);
        up.push(t => { paper.rotation.x = 0.08 + Math.sin(t * 1.7) * 0.07; paper.rotation.z = Math.sin(t * 1.3) * 0.06; });
    },

    // 미나이의 부적: 쌍둥이 부적 두 장 (하늘/보라) + 빛나는 띠 + 띠 둘레를 도는 별 큐브 2개
    amulet_commander(g, up, side) {
        const band = std('#1a1f3a', { metal: 0.6, rough: 0.3 });
        box(g, band, 1.12, 0.3, 1.12, 0, -0.42, 0);
        const line = glow('#7af7ff', 0.9);
        box(g, line, 1.14, 0.05, 1.14, 0, -0.34, 0);
        box(g, glow('#c08bff', 0.9), 1.14, 0.05, 1.14, 0, -0.5, 0);
        const papers = [];
        [['#bff3ff', '#1a4fd6', '미나'], ['#e7d4ff', '#7a1fd6', '이']].forEach(([paperC, ink, txt], i) => {
            const p = new THREE.Group();
            p.position.set((i ? 0.23 : -0.23), -0.52, 0.58);
            const mat = new THREE.MeshStandardMaterial({ map: talismanTexture(paperC, ink, txt), roughness: 0.8, emissive: paperC, emissiveIntensity: 0.18 });
            box(p, mat, 0.38, 0.76, 0.03, 0, -0.38, 0);
            g.add(p); papers.push(p);
        });
        const stars = [glow('#7af7ff', 1), glow('#c08bff', 1)].map(m => box(g, m, 0.1, 0.1, 0.1, 0, 0, 0));
        up.push(t => {
            papers.forEach((p, i) => { p.rotation.x = 0.08 + Math.sin(t * 1.6 + i * 1.5) * 0.08; p.rotation.z = Math.sin(t * 1.2 + i) * 0.08; });
            stars.forEach((s, i) => {
                const a = t * 2.2 + i * Math.PI;
                s.position.set(Math.cos(a) * 0.82, -0.42 + Math.sin(a * 2) * 0.08, Math.sin(a) * 0.82);
                s.rotation.set(t * 3, t * 2, 0);
            });
        });
    },
    // 🎫 개척의 별 부적: 남색 띠 + 금사슬 끝에 도는 금빛 팔각 별, 둘레에 작은 궤도 고리
    pass_amulet(g, up, side) {
        const band = std('#1f3a7a', { rough: 0.6 });
        const gold = std('#ffcf4a', { metal: 0.9, rough: 0.2, emissive: '#7a5000', ei: 0.4 });
        box(g, band, 1.1, 0.26, 1.1, 0, -0.42, 0);
        box(g, gold, 1.12, 0.05, 1.12, 0, -0.3, 0); box(g, gold, 1.12, 0.05, 1.12, 0, -0.54, 0);
        const charm = new THREE.Group(); charm.position.set(0, -0.56, 0.6);
        for (let i = 0; i < 4; i++) box(charm, gold, 0.05, 0.05, 0.05, 0, -i * 0.07, 0);
        const star = new THREE.Group(); star.position.y = -0.5; charm.add(star);
        const core = std('#fff3c0', { emissive: '#ffd23a', ei: 1.2, metal: 0.4, rough: 0.2 });
        box(star, core, 0.2, 0.2, 0.08, 0, 0, 0); box(star, core, 0.2, 0.2, 0.08, 0, 0, 0, 0, 0, Math.PI / 4);
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(star, gold, 0.06, 0.12, 0.05, Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0, 0, 0, a - Math.PI / 2); }
        const ring = new THREE.Group(); ring.position.y = -0.5; charm.add(ring);
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; box(ring, glow('#7ad0ff', 0.9), 0.03, 0.03, 0.03, Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); }
        g.add(charm);
        up.push(t => { star.rotation.z = t * 1.4; ring.rotation.set(0.6, t * 2, 0.3); charm.rotation.z = Math.sin(t * 1.5) * 0.12; });
    },
    // 🍀 네잎클로버: 초록 띠 + 금사슬에 매달린 클로버가 빙글빙글
    gacha_clover(g, up, side) {
        const band = std('#1f6b3a', { rough: 0.7 });
        box(g, band, 1.1, 0.26, 1.1, 0, -0.42, 0);
        const gold = std('#ffd25a', { metal: 0.9, rough: 0.25, emissive: '#c08a00', ei: 0.3 });
        box(g, gold, 1.12, 0.05, 1.12, 0, -0.3, 0);
        box(g, gold, 1.12, 0.05, 1.12, 0, -0.54, 0);
        const charm = new THREE.Group();
        charm.position.set(0, -0.56, 0.6);
        for (let i = 0; i < 4; i++) box(charm, gold, 0.05, 0.05, 0.05, 0, -i * 0.07, 0);
        const clover = new THREE.Group(); clover.position.y = -0.48;
        const leaf = std('#3ddc6a', { emissive: '#22c45a', ei: 0.7, rough: 0.4 });
        for (const [x, y] of [[0, 0.11], [0.11, 0], [0, -0.11], [-0.11, 0]]) box(clover, leaf, 0.16, 0.16, 0.05, x, y, 0, 0, 0, Math.PI / 4);
        box(clover, gold, 0.06, 0.06, 0.07, 0, 0, 0);
        box(clover, std('#2a8c3c'), 0.035, 0.16, 0.04, 0.04, -0.2, 0, 0, 0, 0.4);
        charm.add(clover);
        g.add(charm);
        const sp = glow('#b6ffcb', 1);
        const sparks = Array.from({ length: 3 }, () => box(g, sp, 0.05, 0.05, 0.05, 0, 0, 0));
        up.push(t => {
            clover.rotation.y = t * 1.6;
            charm.rotation.z = Math.sin(t * 1.5) * 0.12;
            sparks.forEach((s, i) => {
                const k = (t * 0.7 + i / 3) % 1;
                s.position.set(Math.sin(i * 2 + t) * 0.25, -1.0 + k * 0.5, 0.65);
                s.scale.setScalar(0.05 * (1 - k));
            });
        });
    },

    // 🧭 폭풍 나침반: 가죽 띠 + 놋쇠 나침반. 바늘이 미친 듯 돌다 멈추고, 작은 구름과 번개가 맴돔
    gacha_compass(g, up, side) {
        box(g, std('#5a3a22', { rough: 0.85 }), 1.1, 0.28, 1.1, 0, -0.42, 0);
        const brass = std('#c9a24a', { metal: 0.9, rough: 0.28 });
        const comp = new THREE.Group(); comp.position.set(0, -0.62, 0.62);
        box(comp, brass, 0.5, 0.5, 0.1, 0, 0, 0);
        box(comp, std('#f2ead2', { rough: 0.6 }), 0.4, 0.4, 0.02, 0, 0, 0.055);
        for (const [x, y] of [[0, 0.16], [0, -0.16], [0.16, 0], [-0.16, 0]]) box(comp, std('#3a2a1a'), 0.03, 0.03, 0.02, x, y, 0.065);
        box(comp, brass, 0.12, 0.1, 0.1, 0, 0.3, 0);   // 고리
        const needle = new THREE.Group(); needle.position.z = 0.075;
        box(needle, std('#e8213a', { emissive: '#ff2040', ei: 0.6 }), 0.05, 0.16, 0.02, 0, 0.08, 0);
        box(needle, std('#2a6bff', { emissive: '#2050ff', ei: 0.4 }), 0.05, 0.16, 0.02, 0, -0.08, 0);
        box(needle, brass, 0.06, 0.06, 0.03, 0, 0, 0.01);
        comp.add(needle);
        g.add(comp);
        const cloudM = std('#d8dde8', { rough: 0.9, emissive: '#8a95b0', ei: 0.2 });
        const clouds = [0, 1, 2].map(() => {
            const c = new THREE.Group();
            box(c, cloudM, 0.18, 0.1, 0.12, 0, 0, 0); box(c, cloudM, 0.12, 0.12, 0.12, 0.05, 0.05, 0);
            g.add(c); return c;
        });
        const boltM = glow('#bfe0ff', 1);
        const boltB = [box(g, boltM, 0.03, 0.12, 0.03, 0, 0, 0), box(g, boltM, 0.03, 0.12, 0.03, 0, 0, 0)];
        up.push(t => {
            const ph = t % 4;
            needle.rotation.z = ph < 1.4 ? t * 14 : Math.sin(t * 6) * Math.max(0, 0.6 - (ph - 1.4)) + Math.round(t * 14 / (Math.PI * 2)) * Math.PI * 2;
            comp.rotation.x = 0.1 + Math.sin(t * 1.4) * 0.06;
            clouds.forEach((c, i) => {
                const a = t * 1.1 + i * (Math.PI * 2 / 3);
                c.position.set(Math.cos(a) * 0.78, -0.3 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.78);
            });
            const flick = Math.sin(t * 23) > 0.85;
            boltB.forEach((b, i) => {
                b.visible = flick;
                const c = clouds[Math.floor(t) % 3];
                b.position.set(c.position.x + (i ? 0.03 : 0), c.position.y - 0.12 - i * 0.1, c.position.z);
                b.rotation.z = i ? -0.5 : 0.5;
            });
        });
    },

    // 🐱 황금 고양이: 붉은 띠 + 손 흔드는 금빛 마네키네코, 방울 + 코인
    gacha_cat(g, up, side) {
        box(g, std('#b3122e', { rough: 0.6 }), 1.1, 0.26, 1.1, 0, -0.38, 0);
        const gold = std('#ffd75a', { metal: 0.55, rough: 0.3, emissive: '#e0a000', ei: 0.75 });
        const white = std('#fff8ec', { rough: 0.5 });
        const red = std('#e01b33', { rough: 0.4 });
        const cat = new THREE.Group(); cat.position.set(0, -0.58, 0.66); cat.scale.setScalar(0.85);
        box(cat, gold, 0.42, 0.4, 0.3, 0, -0.2, 0);          // 몸
        box(cat, gold, 0.46, 0.36, 0.32, 0, 0.16, 0);        // 머리
        box(cat, gold, 0.1, 0.1, 0.08, -0.15, 0.38, 0); box(cat, gold, 0.1, 0.1, 0.08, 0.15, 0.38, 0);  // 귀
        box(cat, red, 0.06, 0.06, 0.02, -0.15, 0.37, 0.04); box(cat, red, 0.06, 0.06, 0.02, 0.15, 0.37, 0.04);
        box(cat, std('#1a1206'), 0.08, 0.03, 0.02, -0.1, 0.19, 0.165); box(cat, std('#1a1206'), 0.08, 0.03, 0.02, 0.1, 0.19, 0.165);  // 웃는 눈
        box(cat, red, 0.04, 0.03, 0.02, 0, 0.11, 0.165);
        box(cat, white, 0.36, 0.08, 0.02, 0, 0.03, 0.165);   // 수염 판
        box(cat, red, 0.44, 0.06, 0.32, 0, -0.03, 0);         // 목줄
        const bell = box(cat, std('#ffe680', { metal: 1, rough: 0.15, emissive: '#ffb300', ei: 0.8 }), 0.1, 0.1, 0.1, 0, -0.09, 0.17);
        const coin = box(cat, gold, 0.22, 0.28, 0.04, -0.1, -0.24, 0.17);
        box(cat, red, 0.1, 0.03, 0.01, -0.1, -0.2, 0.195); box(cat, red, 0.03, 0.12, 0.01, -0.1, -0.26, 0.195);
        const paw = new THREE.Group(); paw.position.set(0.2, 0.0, 0.05);
        box(paw, gold, 0.11, 0.26, 0.11, 0, 0.13, 0);
        box(paw, white, 0.12, 0.06, 0.12, 0, 0.27, 0);
        cat.add(paw);
        g.add(cat);
        const sp = glow('#ffe27a', 1);
        const sparks = Array.from({ length: 4 }, () => box(g, sp, 0.05, 0.05, 0.05, 0, 0, 0));
        up.push(t => {
            paw.rotation.z = -0.3 - Math.max(0, Math.sin(t * 5)) * 0.8;
            cat.rotation.z = Math.sin(t * 1.4) * 0.06;
            bell.rotation.z = Math.sin(t * 8) * 0.4;
            coin.rotation.y = Math.sin(t * 2) * 0.2;
            sparks.forEach((s, i) => {
                const a = t * 1.5 + i * Math.PI / 2;
                s.position.set(Math.cos(a) * 0.4, -0.58 + Math.sin(a * 1.5) * 0.2, 0.7 + Math.sin(a) * 0.12);
                s.scale.setScalar(0.05 * (0.6 + Math.sin(t * 6 + i) * 0.4));
            });
        });
    },
    // 👻 꼬마 유령: 보라 띠 + 팔 둘레를 둥실둥실 도는 꼬마 유령
    hw_ghost(g, up, side) {
        box(g, std('#3a1a5a', { rough: 0.6 }), 1.1, 0.26, 1.1, 0, -0.42, 0);
        box(g, glow('#b48bff', 0.8), 1.12, 0.04, 1.12, 0, -0.3, 0);
        const sheet = new THREE.MeshStandardMaterial({ color: '#f4f2ff', emissive: '#b8b0ff', emissiveIntensity: 0.45, roughness: 0.5, transparent: true, opacity: 0.92 });
        const ghost = new THREE.Group();
        box(ghost, sheet, 0.34, 0.32, 0.3, 0, 0.08, 0);
        const tails = [-0.12, 0, 0.12].map(x => box(ghost, sheet, 0.1, 0.14, 0.28, x, -0.13, 0));
        const ink = std('#120a1a');
        box(ghost, ink, 0.06, 0.08, 0.02, -0.07, 0.12, 0.155); box(ghost, ink, 0.06, 0.08, 0.02, 0.07, 0.12, 0.155);
        box(ghost, ink, 0.07, 0.06, 0.02, 0, 0.0, 0.155);
        box(ghost, std('#ff9ac8', { emissive: '#ff6aa8', ei: 0.4 }), 0.05, 0.03, 0.02, -0.13, 0.04, 0.155);
        box(ghost, std('#ff9ac8', { emissive: '#ff6aa8', ei: 0.4 }), 0.05, 0.03, 0.02, 0.13, 0.04, 0.155);
        const armL = box(ghost, sheet, 0.08, 0.14, 0.08, -0.21, 0.02, 0), armR = box(ghost, sheet, 0.08, 0.14, 0.08, 0.21, 0.02, 0);
        g.add(ghost);
        const trail = Array.from({ length: 4 }, (_, i) => box(g, glow('#c8b8ff', 0.35 - i * 0.07), 0.12, 0.12, 0.12, 0, 0, 0));
        up.push(t => {
            const a = t * 1.3;
            ghost.position.set(Math.cos(a) * 0.82, -0.55 + Math.sin(t * 2.6) * 0.1, Math.sin(a) * 0.82);
            ghost.rotation.y = -a + Math.PI / 2;
            tails.forEach((tl, i) => { tl.position.y = -0.13 + Math.sin(t * 8 + i * 1.6) * 0.03; });
            armL.rotation.z = 0.4 + Math.sin(t * 6) * 0.4; armR.rotation.z = -0.4 - Math.sin(t * 6) * 0.4;
            trail.forEach((b, i) => {
                const aa = a - (i + 1) * 0.22;
                b.position.set(Math.cos(aa) * 0.82, -0.6 + Math.sin(t * 2.6 - i * 0.3) * 0.1, Math.sin(aa) * 0.82);
            });
        });
    },

    // 🍬 사탕 바구니: 주황 띠 + 호박 바구니가 흔들리고 사탕이 톡톡 튀어나옴
    hw_candy(g, up, side) {
        box(g, std('#ff7a1a', { rough: 0.6 }), 1.1, 0.26, 1.1, 0, -0.38, 0);
        box(g, std('#1a0f22'), 1.12, 0.05, 1.12, 0, -0.5, 0);
        const bucket = new THREE.Group(); bucket.position.set(0, -0.55, 0.64);
        const handle = std('#1a0f22', { rough: 0.5 });
        box(bucket, handle, 0.04, 0.24, 0.04, -0.17, -0.06, 0); box(bucket, handle, 0.04, 0.24, 0.04, 0.17, -0.06, 0);
        box(bucket, handle, 0.38, 0.04, 0.04, 0, 0.06, 0);
        const body = new THREE.Group(); body.position.y = -0.36; bucket.add(body);
        box(body, std('#ff8a1f', { rough: 0.5, emissive: '#a03a00', ei: 0.3 }), 0.4, 0.3, 0.32, 0, 0, 0);
        const lit = std('#ffd23a', { emissive: '#ffb000', ei: 1.6 });
        box(body, lit, 0.07, 0.07, 0.02, -0.09, 0.04, 0.165, 0, 0, Math.PI / 4); box(body, lit, 0.07, 0.07, 0.02, 0.09, 0.04, 0.165, 0, 0, Math.PI / 4);
        box(body, lit, 0.2, 0.04, 0.02, 0, -0.07, 0.165);
        const CANDY = ['#ff3b7a', '#5ab0ff', '#7dff6a', '#ffe14d', '#c08bff'];
        for (let i = 0; i < 4; i++) box(body, std(CANDY[i], { emissive: CANDY[i], ei: 0.4 }), 0.08, 0.08, 0.08, -0.12 + i * 0.08, 0.17, (i % 2) * 0.06 - 0.03);
        g.add(bucket);
        const pops = Array.from({ length: 3 }, (_, i) => { const c = box(g, std(CANDY[i + 1], { emissive: CANDY[i + 1], ei: 0.6 }), 0.07, 0.07, 0.07, 0, 0, 0); c.visible = false; return c; });
        up.push(t => {
            bucket.rotation.z = Math.sin(t * 2.2) * 0.14;
            bucket.rotation.x = 0.06 + Math.sin(t * 1.6) * 0.05;
            pops.forEach((c, i) => {
                const k = (t * 0.7 + i / 3) % 1;
                c.visible = k < 0.6;
                const kk = k / 0.6;
                c.position.set(Math.sin(i * 2.3) * 0.18 * kk, -0.75 + kk * 0.5 - kk * kk * 0.55, 0.68 + kk * 0.12);
                c.rotation.set(t * 6, t * 4, 0);
            });
        });
    },
    // 🌀 균열의 핵: 흑요석 띠 위에 떠서 도는 분홍 핵 + 둘레를 도는 수정 파편
    amu_riftcore(g, up, side) {
        box(g, std('#1b1428', { metal: 0.55, rough: 0.3, emissive: '#2a0a4a', ei: 0.4 }), 1.1, 0.28, 1.1, 0, -0.42, 0);
        box(g, glow('#c070ff', 0.9), 1.12, 0.05, 1.12, 0, -0.32, 0);
        box(g, glow('#ff6ad8', 0.9), 1.12, 0.05, 1.12, 0, -0.52, 0);
        const charm = new THREE.Group(); charm.position.set(0, -0.62, 0.66); g.add(charm);
        const coreM = std('#ff4ad8', { emissive: '#ff4ad8', ei: 2.2 });
        const core = box(charm, coreM, 0.22, 0.22, 0.22, 0, -0.3, 0, 0.6, 0.6, 0);
        const frame = box(charm, std('#3a2a5a', { metal: 0.8, rough: 0.25 }), 0.3, 0.3, 0.06, 0, -0.3, -0.05, 0, 0, Math.PI / 4);
        const shards = Array.from({ length: 5 }, (_, i) => box(charm, i % 2 ? std('#9a6aff', { emissive: '#7a3aff', ei: 1.1 }) : glow('#ff9aec', 1), 0.06, 0.12, 0.06, 0, 0, 0));
        up.push(t => {
            core.rotation.set(t * 1.2, t * 1.6, 0); coreM.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.8;
            charm.position.y = -0.62 + Math.sin(t * 2) * 0.04; frame.rotation.z = Math.PI / 4 - t * 0.6;
            shards.forEach((m, i) => { const a = t * 2 + i / 5 * Math.PI * 2; m.position.set(Math.cos(a) * 0.28, -0.3 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.28); m.rotation.set(t * 3, t * 2, 0); });
        });
    },
};

/* ---------- 장착 관리 ---------- */
// dummy: makeDummy() 결과. 반환: { set({gauntlet, amulet, visible}), update(t, dt, speed) }
export function createGearRig(dummy) {
    const slots = {
        gauntlet: { arm: dummy.armL, side: -1, group: null, up: [], id: null, table: GAUNTLETS },
        amulet: { arm: dummy.armR, side: 1, group: null, up: [], id: null, table: AMULETS }
    };
    let visible = true;

    function disposeGroup(grp) {
        grp.traverse(o => {
            if (o.material) { o.material.map?.dispose?.(); o.material.dispose?.(); }
        });
    }

    function setSlot(slot, id) {
        if (slot.id === id) return;
        if (slot.group) { slot.arm.remove(slot.group); disposeGroup(slot.group); }
        slot.group = null; slot.up = []; slot.id = id;
        const build = id && slot.table[id];
        if (!build) return;
        const g = new THREE.Group();
        g.userData.noFit = true;
        build(g, slot.up, slot.side);
        g.visible = visible;
        slot.arm.add(g);
        slot.group = g;
    }

    return {
        set({ gauntlet = null, amulet = null, visible: vis = true } = {}) {
            visible = vis;
            setSlot(slots.gauntlet, gauntlet);
            setSlot(slots.amulet, amulet);
            for (const s of Object.values(slots)) if (s.group) s.group.visible = visible;
        },
        update(t, dt, speed) {
            if (!visible) return;
            for (const s of Object.values(slots)) if (s.group) s.up.forEach(u => u(t, dt, speed));
        }
    };
}

/* ---------- 제작창 미리보기용: 팔 하나에 장비를 낀 모형 ---------- */
export function buildGearModel(id) {
    const isAmulet = !!AMULETS[id];
    const build = AMULETS[id] || GAUNTLETS[id];
    if (!build) return null;
    const root = new THREE.Group();
    const arm = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0xc3c7d2, roughness: 0.6 });
    const m = new THREE.Mesh(BOX, skin); m.scale.set(1, 2, 1); m.position.y = -0.9; arm.add(m);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: 0x5d6170 }));
    edges.scale.copy(m.scale); edges.position.copy(m.position); arm.add(edges);
    const g = new THREE.Group();
    const up = [];
    build(g, up, isAmulet ? 1 : -1);
    arm.add(g);
    root.add(arm);
    arm.position.y = 0.9;
    return {
        root, isAmulet,
        update(t) { up.forEach(u => u(t, 1 / 60, 1)); },
        dispose() { root.traverse(o => { if (o.material) { o.material.map?.dispose?.(); o.material.dispose?.(); } }); }
    };
}
