/* =========================================================
   🪺 펫 둥지 · 알 3D 모형 (nest3d.js)
   - 'nest:<알id>:<상태>' → 짚 둥지 (+ 알)   상태: idle / wobble / ready
   - 'egg:<알id>'         → 알만 (뽑기 결과·가진 알 칸)
   미리보기 렌더러(gearPreview.js)가 그림
   ========================================================= */

import * as THREE from 'three';
import { EGG_BY_ID } from './petsData.js?v=49';

// 위아래가 다른 달걀 모양 (깎은 보석처럼 각지게)
const EGG_GEO = (() => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
        const t = i / 12, y = -1 + 2 * t;
        const r = Math.sqrt(Math.max(0, 1 - y * y)) * (1 - 0.18 * y);
        pts.push(new THREE.Vector2(r * 0.78, y));
    }
    return new THREE.LatheGeometry(pts, 10);
})();
const STRAW = ['#e8c27a', '#d9a95a', '#c48f42', '#a8742e', '#f3d38f', '#8f5f26'];
const BOX = new THREE.BoxGeometry(1, 1, 1);

function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildEgg(egg, sparkle) {
    const g = new THREE.Group();
    const col = new THREE.Color(egg.color);
    const shell = new THREE.Mesh(EGG_GEO, new THREE.MeshStandardMaterial({
        color: col, flatShading: true, roughness: 0.45, metalness: egg.tier === 'MYTHIC' || egg.tier === 'LEGEND' ? 0.35 : 0.05,
        emissive: col, emissiveIntensity: egg.tier === 'MYTHIC' ? 0.35 : egg.tier === 'LEGEND' ? 0.18 : 0.04
    }));
    g.add(shell);
    // 무늬: 껍데기 표면에 붙은 네모 점
    const spotMat = new THREE.MeshStandardMaterial({ color: egg.spot, flatShading: true, roughness: 0.5, emissive: egg.spot, emissiveIntensity: egg.tier === 'MYTHIC' ? 0.6 : 0.1 });
    const r = rng(egg.id.length * 977 + egg.hours * 31);
    for (let i = 0; i < 9; i++) {
        const y = -0.65 + r() * 1.3, a = r() * Math.PI * 2;
        const rad = Math.sqrt(Math.max(0, 1 - y * y)) * (1 - 0.18 * y) * 0.78;
        const s = 0.16 + r() * 0.14;
        const m = new THREE.Mesh(BOX, spotMat);
        m.scale.set(s, s, 0.06);
        m.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
        m.lookAt(m.position.x * 2, y * 1.1, m.position.z * 2);
        g.add(m);
    }
    // 띠 (전설·신화 알)
    if (egg.tier === 'LEGEND' || egg.tier === 'MYTHIC') {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.045, 4, 20), new THREE.MeshStandardMaterial({ color: '#fff3c0', emissive: egg.spot, emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 }));
        band.rotation.x = Math.PI / 2; band.position.y = 0.05;
        g.add(band);
    }
    // 반짝이 (신화 알은 항상, 다 깐 알도)
    const sparks = [];
    if (sparkle || egg.tier === 'MYTHIC') {
        const sm = new THREE.MeshBasicMaterial({ color: sparkle ? '#fff6b0' : egg.spot });
        for (let i = 0; i < 6; i++) {
            const m = new THREE.Mesh(BOX, sm);
            m.scale.setScalar(0.09);
            g.add(m); sparks.push(m);
        }
    }
    g.userData.update = t => sparks.forEach((m, i) => {
        const a = t * 1.6 + i * 1.05;
        m.position.set(Math.cos(a) * 1.15, Math.sin(t * 2 + i) * 0.7, Math.sin(a) * 1.15);
        m.rotation.set(t * 2, t * 3, 0);
        m.scale.setScalar(0.06 + 0.05 * (0.5 + 0.5 * Math.sin(t * 5 + i * 2)));
    });
    return g;
}

function buildNest(group) {
    const r = rng(7);
    const mats = STRAW.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true }));
    // 안쪽 오목한 바닥
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.15, 12, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
        new THREE.MeshStandardMaterial({ color: '#5a3a16', roughness: 1, flatShading: true, side: THREE.DoubleSide }));
    bowl.position.y = 0.25; bowl.scale.y = 0.55;
    group.add(bowl);
    // 짚을 빙 둘러 여러 겹 감음
    for (let layer = 0; layer < 5; layer++) {
        const n = 26 + layer * 3;
        const rad = 1.0 + layer * 0.07 - (layer === 4 ? 0.05 : 0);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + r() * 0.2 + layer * 0.4;
            const m = new THREE.Mesh(BOX, mats[Math.floor(r() * mats.length)]);
            const len = 0.5 + r() * 0.35;
            m.scale.set(0.07 + r() * 0.03, 0.06 + r() * 0.03, len);
            m.position.set(Math.cos(a) * rad, -0.42 + layer * 0.12 + (r() - 0.5) * 0.05, Math.sin(a) * rad);
            m.rotation.set((r() - 0.5) * 0.5, -a, (r() - 0.5) * 0.9);
            group.add(m);
        }
    }
    // 위로 삐죽 나온 짚
    for (let i = 0; i < 16; i++) {
        const a = r() * Math.PI * 2, rad = 1.05 + r() * 0.2;
        const m = new THREE.Mesh(BOX, mats[Math.floor(r() * mats.length)]);
        m.scale.set(0.05, 0.05, 0.45 + r() * 0.3);
        m.position.set(Math.cos(a) * rad, 0.02 + r() * 0.12, Math.sin(a) * rad);
        m.rotation.set(-0.5 - r() * 0.6, -a + (r() - 0.5) * 1.2, 0);
        group.add(m);
    }
    // 바닥 깃털 두 개
    const feather = new THREE.MeshStandardMaterial({ color: '#fff6ea', roughness: 0.8, flatShading: true });
    [[0.35, -0.1, 0.3, 0.6], [-0.4, -0.12, -0.2, -0.9]].forEach(([x, y, z, ry]) => {
        const f = new THREE.Mesh(BOX, feather);
        f.scale.set(0.16, 0.03, 0.42); f.position.set(x, y, z); f.rotation.set(0.1, ry, 0.15);
        group.add(f);
    });
}

export function buildNestModel(id) {
    const [kind, eggId, state] = id.split(':');
    if (kind !== 'nest' && kind !== 'egg') return null;
    const egg = EGG_BY_ID[eggId];
    if (kind === 'egg' && !egg) return null;
    const root = new THREE.Group();
    const inner = new THREE.Group();
    root.add(inner);
    let eggG = null;
    if (kind === 'nest') {
        buildNest(inner);
        inner.scale.setScalar(1.05);
        if (egg) {
            eggG = buildEgg(egg, state === 'ready');
            eggG.scale.setScalar(0.62);
            eggG.position.y = 0.32;
            inner.add(eggG);
        }
    } else {
        eggG = buildEgg(egg, false);
        eggG.scale.setScalar(1.05);
        inner.add(eggG);
    }
    return {
        root, isNest: kind === 'nest', isEgg: kind === 'egg',
        update(t) {
            if (!eggG) return;
            eggG.userData.update(t);
            if (state === 'ready') {            // 곧 깨질 듯 덜덜
                eggG.rotation.z = Math.sin(t * 22) * 0.16;
                eggG.position.y = 0.32 + Math.abs(Math.sin(t * 11)) * 0.06;
            } else if (state === 'wobble') {    // 가끔 흔들
                const k = (t % 2.4) / 2.4;
                eggG.rotation.z = k > 0.7 ? Math.sin((k - 0.7) * 40) * 0.15 * (1 - k) * 3 : 0;
            } else if (kind === 'egg') {
                eggG.position.y = Math.sin(t * 1.6) * 0.06;
            }
        },
        dispose() {}
    };
}
