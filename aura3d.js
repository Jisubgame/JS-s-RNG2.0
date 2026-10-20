/* =========================================================
   🧊 3D 아우라 무대 (aura3d.js)
   - 더미 캐릭터, 바닥, 별, 아우라 전부 네모 박스로만 만든다
   - 화면 전체 배경에 그리고, 캐릭터는 .stage 영역 가운데에 오게 맞춘다
   ========================================================= */

import * as THREE from 'three';
import { EffectComposer } from './lib/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './lib/jsm/postprocessing/OutputPass.js';
import { SIGNATURES, jxsGrand } from './auraSignatures.js?v=48';
import { JXS_BACKDROPS } from './jxsBackdrops.js?v=48';
import { POSES } from './poses.js?v=48';
import { createGearRig } from './gear3d.js?v=48';
import { createPetRig } from './pets3d.js?v=48';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- 얼굴 (머리 앞면에만 붙이는 그림) ---------- */
// eye: 눈 색, smile: 웃는 입, glowEyes: 빛나는 네모 눈 (JXS용)
function makeFaceTexture(base, { eye = '#15151c', smile = true, glowEyes = false } = {}) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    if (glowEyes) {
        g.shadowColor = eye; g.shadowBlur = 28;
        g.fillStyle = eye;
        g.fillRect(78, 96, 34, 14); g.fillRect(144, 96, 34, 14);
        g.fillStyle = '#ffffff';
        g.fillRect(86, 99, 18, 8); g.fillRect(152, 99, 18, 8);
        g.shadowBlur = 0;
    } else {
        g.fillStyle = eye;
        g.beginPath(); g.ellipse(98, 104, 9, 15, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(158, 104, 9, 15, 0, 0, Math.PI * 2); g.fill();
    }
    if (smile) {
        g.strokeStyle = eye;
        g.lineWidth = 9;
        g.lineCap = 'round';
        g.beginPath(); g.arc(128, 140, 40, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

/* ---------- 더미 캐릭터 (R6) ---------- */
function makeDummy() {
    const SKIN = '#c3c7d2';
    const mat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6, metalness: 0.05 });
    const faceMat = new THREE.MeshStandardMaterial({ map: makeFaceTexture(SKIN), roughness: 0.6 });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x5d6170, transparent: true, opacity: 0.55 });

    const root = new THREE.Group();
    const parts = [];   // 외곽 빛 테두리용

    function part(w, h, d, x, y, z, pivotY = 0, material = mat) {
        const pivot = new THREE.Group();
        pivot.position.set(x, y + pivotY, z);
        const mesh = new THREE.Mesh(BOX, material);
        mesh.scale.set(w, h, d);
        mesh.position.y = -pivotY;
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), edgeMat);
        edges.scale.copy(mesh.scale);
        edges.position.copy(mesh.position);
        pivot.add(mesh, edges);
        root.add(pivot);
        parts.push(mesh);
        return pivot;
    }

    // 몸 크기 (Roblox R6 비율)
    const legL = part(0.98, 2, 1, -0.5, 1, 0, 1);
    const legR = part(0.98, 2, 1, 0.5, 1, 0, 1);
    const torso = part(2, 2, 1, 0, 3, 0);
    const armL = part(1, 2, 1, -1.5, 3, 0, 0.9);
    const armR = part(1, 2, 1, 1.5, 3, 0, 0.9);
    const headMats = [mat, mat, mat, mat, faceMat, mat];   // +z 면에만 얼굴
    const head = part(1.25, 1.2, 1.2, 0, 4.62, 0, 0, headMats);

    return { root, parts, legL, legR, armL, armR, head, torso, mat, faceMat, edgeMat, SKIN };
}

/* ---------- 네모 링 (얇은 박스 4개) ---------- */
function makeSquareRing(size, thick, mat) {
    const g = new THREE.Group();
    const h = size / 2;
    const sides = [[0, h, size + thick, thick], [0, -h, size + thick, thick], [h, 0, thick, size - thick], [-h, 0, thick, size - thick]];
    for (const [x, z, w, d] of sides) {
        const m = new THREE.Mesh(BOX, mat);
        m.scale.set(w, thick, d);
        m.position.set(x, 0, z);
        g.add(m);
    }
    return g;
}

function glowMat(color, opacity = 1) {
    return new THREE.MeshBasicMaterial({
        color, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
    });
}

/* ---------- 고급 아우라용 도구 ---------- */
function solidMat(color, glow = 1) {
    return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: glow, roughness: 0.5, metalness: 0.1 });
}

// 반투명 빛 더미 (잔상, 유령)
function makeGhost(color, opacity) {
    const g = new THREE.Group();
    const mat = glowMat(color, opacity);
    for (const [w, h, d, x, y] of [[0.98, 2, 1, -0.5, 1], [0.98, 2, 1, 0.5, 1], [2, 2, 1, 0, 3], [1, 2, 1, -1.5, 3], [1, 2, 1, 1.5, 3], [1.25, 1.2, 1.2, 0, 4.62]]) {
        const m = new THREE.Mesh(BOX, mat);
        m.scale.set(w, h, d); m.position.set(x, y, 0);
        g.add(m);
    }
    return g;
}

// 블록 검: 칼끝이 원점, 날이 위로, 그 위에 손잡이
function makeSword(len, bladeColor, accent, w = 0.4, metal = false) {
    const g = new THREE.Group();
    const bw = w * 0.55;
    const bladeMat = metal
        ? new THREE.MeshStandardMaterial({ color: 0xd5dce6, metalness: 0.75, roughness: 0.28 })
        : solidMat(bladeColor, 1.6);
    const tip = new THREE.Mesh(BOX, bladeMat);
    tip.scale.set(bw * 0.72, bw * 0.72, bw * 0.18);
    tip.rotation.z = Math.PI / 4;
    tip.position.y = bw * 0.25;
    const blade = new THREE.Mesh(BOX, bladeMat);
    blade.scale.set(bw, len - bw * 0.4, bw * 0.18);
    blade.position.y = bw * 0.4 + (len - bw * 0.4) / 2;
    const accMat = solidMat(accent, metal ? 1.2 : 1);
    const guard = new THREE.Mesh(BOX, accMat);
    guard.scale.set(bw * 3.2, bw * 0.4, bw * 0.5);
    guard.position.y = len;
    const grip = new THREE.Mesh(BOX, accMat);
    grip.scale.set(bw * 0.38, len * 0.18, bw * 0.38);
    grip.position.y = len + len * 0.09 + bw * 0.2;
    const pommel = new THREE.Mesh(BOX, accMat);
    pommel.scale.setScalar(bw * 0.6);
    pommel.position.y = len + len * 0.18 + bw * 0.4;
    g.add(tip, blade, guard, grip, pommel);
    if (metal) {
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: accent, toneMapped: false }));
        edge.scale.copy(blade.scale); edge.position.copy(blade.position);
        g.add(edge);
    }
    return g;
}

// 꺾인 번개 줄기 (박스 여러 개). bolt.reshape(시작, 끝, 흔들림)
function makeBolt(segments, mat) {
    const g = new THREE.Group();
    for (let i = 0; i < segments; i++) g.add(new THREE.Mesh(BOX, mat));
    const a = new THREE.Vector3(), b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
    g.reshape = (from, to, jitter) => {
        let px = from[0], py = from[1], pz = from[2];
        g.children.forEach((seg, i) => {
            const k = (i + 1) / segments;
            const last = i === segments - 1;
            const nx = from[0] + (to[0] - from[0]) * k + (last ? 0 : rand(-jitter, jitter));
            const ny = from[1] + (to[1] - from[1]) * k + (last ? 0 : rand(-jitter, jitter) * 0.3);
            const nz = from[2] + (to[2] - from[2]) * k + (last ? 0 : rand(-jitter, jitter));
            a.set(px, py, pz); b.set(nx, ny, nz);
            const len = a.distanceTo(b);
            seg.scale.set(0.06, len, 0.06);
            seg.position.copy(a).add(b).multiplyScalar(0.5);
            seg.quaternion.setFromUnitVectors(up, dir.copy(b).sub(a).normalize());
            px = nx; py = ny; pz = nz;
        });
    };
    return g;
}

// 매 프레임 재사용하는 임시 객체 (new 를 반복하면 폰에서 버벅임)
const TMP = { m4: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), sc: new THREE.Vector3(), e: new THREE.Euler(), up: new THREE.Vector3(0, 1, 0), v: new THREE.Vector3() };

// 작은 사람 모형 (부족원, 신하 등). 관절은 피벗이라 rotation 으로 움직임
function makeMini(color, { paint = null, scale = 0.45 } = {}) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const root = new THREE.Group();
    const part = (w, h, d, x, y, py = 0, m = mat) => {
        const pv = new THREE.Group(); pv.position.set(x, y + py, 0);
        const mesh = new THREE.Mesh(BOX, m); mesh.scale.set(w, h, d); mesh.position.y = -py;
        pv.add(mesh); root.add(pv); return pv;
    };
    const p = {
        legL: part(0.98, 2, 1, -0.5, 1, 1), legR: part(0.98, 2, 1, 0.5, 1, 1),
        torso: part(2, 2, 1, 0, 3), armL: part(1, 2, 1, -1.5, 3, 0.9), armR: part(1, 2, 1, 1.5, 3, 0.9),
        head: part(1.25, 1.2, 1.2, 0, 4.62)
    };
    if (paint) {
        const pm = new THREE.MeshBasicMaterial({ color: paint, toneMapped: false });
        for (const y of [-0.15, 0.25]) { const st = new THREE.Mesh(BOX, pm); st.scale.set(1.28, 0.12, 0.05); st.position.set(0, y, 0.61); p.head.add(st); }
        const belt = new THREE.Mesh(BOX, pm); belt.scale.set(2.05, 0.25, 1.05); belt.position.y = -0.85; p.torso.add(belt);
    }
    root.scale.setScalar(scale);
    return { root, ...p };
}

// 손에 쥐는 검: 원점이 손잡이, 칼날은 +y 쪽으로 뻗고, 날(얇은 쪽)이 앞뒤(±z)를 향함
//  → 팔을 앞뒤로 휘두르면 칼날로 베게 됨. 겉 그룹의 rotation.x 로 칼 방향을 정함
//    (π 면 팔이 뻗은 방향 그대로, π/2 면 손에서 앞으로)
function makeHeldSword(len, bladeColor, accent, w = 0.4, metal = false) {
    const holder = new THREE.Group();
    const spin = new THREE.Group(); spin.rotation.y = Math.PI / 2;
    const s = makeSword(len, bladeColor, accent, w, metal);
    const bw = w * 0.55;
    const gripY = len + len * 0.09 + bw * 0.2;
    s.rotation.x = Math.PI;      // 칼끝이 -y 로
    s.position.y = gripY;        // 손잡이를 원점으로 → 칼날은 +y
    spin.add(s); holder.add(spin);
    return holder;
}

const KIT = { TMP, THREE, BOX, mini: makeMini, glowMat, solidMat, square: makeSquareRing, rand, ghost: makeGhost, sword: makeSword, heldSword: makeHeldSword, bolt: makeBolt };

/* ---------- 아우라 만들기 ---------- */
// JXS 공통 무대 설정 (자기 거대 연출이 이미 있는 칭호는 분신을 빼거나 뒤로)
const JXS_GRAND = {
    hades: { colossus: false },            // 이미 거대한 하데스 환영이 있음
    pumpkinKing: { colossus: false, sigilY: 16, sigilZ: -24 },   // 하늘을 채운 호박이 주인공
    creator: { z: -13, sigilZ: -20 },
    admin: { z: -12, sigilY: 12 }
};
const SIGNATURE_PARTICLES = { LEGEND: 22, MYTHIC: 32, ANCIENT: 44, ABSOLUTE: 56, JXS: 80 };

function buildAura(aura, dummy, stage) {
    const fx = { ...(aura.fx || {}) };
    if (fx.signature && !fx.particles) { fx.particles = SIGNATURE_PARTICLES[aura.grade] || 0; fx.rise = fx.rise || 1.1; }
    const colors = (fx.colors || [aura.color]).map(c => new THREE.Color(c));
    const c0 = colors[0];
    const pick = i => colors[i % colors.length];
    const group = new THREE.Group();
    const updaters = [];
    const glow = fx.glow || 0;

    // 캐릭터 둘레 빛 테두리
    if (glow > 0) {
        const outlineMat = new THREE.MeshBasicMaterial({
            color: c0, side: THREE.BackSide, transparent: true,
            opacity: Math.min(0.42, 0.08 + glow * 0.12),
            blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
        });
        for (const p of dummy.parts) {
            const o = new THREE.Mesh(BOX, outlineMat);
            o.scale.setScalar(1).multiply(new THREE.Vector3(1.09, 1.06, 1.12));
            p.add(o);
            group.userData.outlines = group.userData.outlines || [];
            group.userData.outlines.push(o);
        }
        updaters.push(t => { outlineMat.opacity = Math.min(0.42, 0.08 + glow * 0.12) * (0.75 + 0.25 * Math.sin(t * 3)); });
    }

    // 몸 쪽 조명
    const light = new THREE.PointLight(c0, Math.min(glow * 2.5, 4.5), 7, 1.8);
    light.position.set(0, 3, 1.6);
    group.add(light);

    // 위로 떠오르는 큐브
    if (fx.particles) {
        const n = fx.particles, rise = fx.rise || 1;
        const mesh = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.7), n);
        const data = [];
        for (let i = 0; i < n; i++) {
            data.push({ r: rand(1.7, 3.1), a: rand(0, Math.PI * 2), y: rand(0, 6), v: rand(0.5, 1.4) * rise, s: rand(0.08, 0.2), spin: rand(-3, 3) });
            mesh.setColorAt(i, pick(i));
        }
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
        updaters.push((t, dt) => {
            data.forEach((d, i) => {
                d.y += d.v * dt;
                if (d.y > 6.5) { d.y = 0; d.a = rand(0, Math.PI * 2); }
                const fade = Math.min(1, d.y * 2) * Math.max(0, 1 - (d.y - 4.5) / 2);
                p.set(Math.cos(d.a + t * 0.2) * d.r, d.y, Math.sin(d.a + t * 0.2) * d.r);
                e.set(t * d.spin, t * d.spin * 0.7, 0); q.setFromEuler(e);
                sc.setScalar(d.s * fade);
                mesh.setMatrixAt(i, m4.compose(p, q, sc));
            });
            mesh.instanceMatrix.needsUpdate = true;
        });
        group.add(mesh);
    }

    // 몸 주위를 도는 큐브
    if (fx.orbit) {
        const n = fx.orbit;
        const mesh = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), n);
        for (let i = 0; i < n; i++) mesh.setColorAt(i, pick(i + 1));
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
        updaters.push((t, dt, speed) => {
            for (let i = 0; i < n; i++) {
                const a = t * 1.1 * speed + (i / n) * Math.PI * 2;
                p.set(Math.cos(a) * 2.3, 2.8 + Math.sin(a * 2 + i) * 0.9, Math.sin(a) * 2.3);
                e.set(t * 2 + i, t * 1.5, 0); q.setFromEuler(e);
                sc.setScalar(0.26);
                mesh.setMatrixAt(i, m4.compose(p, q, sc));
            }
            mesh.instanceMatrix.needsUpdate = true;
        });
        group.add(mesh);
    }

    // 발밑 네모 링
    for (let i = 0; i < (fx.rings || 0); i++) {
        const ring = makeSquareRing(3.4 + i * 0.9, 0.07, glowMat(pick(i), 0.85));
        ring.position.y = 0.2 + i * 0.06;
        const dir = i % 2 ? -1 : 1, sp = 0.4 + i * 0.15;
        updaters.push((t, dt, speed) => {
            ring.rotation.y = t * sp * dir * speed;
            ring.position.y = 0.2 + i * 0.06 + Math.sin(t * 1.5 + i) * 0.05;
        });
        group.add(ring);
    }

    // 머리 위 네모 후광
    if (fx.halo) {
        const halo = new THREE.Group();
        const outer = makeSquareRing(1.5, 0.08, glowMat(c0, 1));
        const inner = makeSquareRing(1.0, 0.06, glowMat(pick(1), 0.9));
        inner.rotation.y = Math.PI / 4;
        halo.add(outer, inner);
        halo.position.y = 5.75;
        updaters.push(t => {
            halo.rotation.y = t * 0.8;
            inner.rotation.y = Math.PI / 4 - t * 1.6;
            halo.position.y = 5.75 + Math.sin(t * 2) * 0.06;
        });
        group.add(halo);
    }

    // 빛기둥
    if (fx.pillar) {
        const pillar = new THREE.Group();
        const colMat = glowMat(c0, 0.5);
        for (const [x, z] of [[1.7, 1.7], [-1.7, 1.7], [1.7, -1.7], [-1.7, -1.7]]) {
            const col = new THREE.Mesh(BOX, colMat);
            col.scale.set(0.06, 18, 0.06);
            col.position.set(x, 9, z);
            col.userData.noFit = true;
            pillar.add(col);
        }
        updaters.push(t => {
            pillar.rotation.y = t * 0.25;
            colMat.opacity = 0.35 + 0.2 * Math.sin(t * 2.4);
        });
        group.add(pillar);
    }

    // 블록 날개
    if (fx.wings) {
        const makeWing = side => {
            const w = new THREE.Group();
            for (let k = 0; k < 6; k++) {
                const f = new THREE.Mesh(BOX, glowMat(pick(k), 0.75 - k * 0.07));
                const len = 2.6 - k * 0.28;
                f.scale.set(len, 0.22, 0.08);
                f.position.set(side * (len / 2 + 0.1), 0.55 - k * 0.32, 0);
                f.rotation.z = side * (0.35 - k * 0.14);
                w.add(f);
            }
            w.position.set(side * 0.6, 3.6, -0.75);
            return w;
        };
        const L = makeWing(-1), R = makeWing(1);
        updaters.push(t => {
            const flap = Math.sin(t * 2.2) * 0.22;
            L.rotation.y = 0.35 + flap; R.rotation.y = -0.35 - flap;
        });
        group.add(L, R);
    }

    // 떠다니는 크리스탈 큐브
    if (fx.shards) {
        const n = fx.shards;
        const mesh = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 0.4), n);
        for (let i = 0; i < n; i++) mesh.setColorAt(i, pick(i + 2));
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
        updaters.push((t, dt, speed) => {
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2 - t * 0.35 * speed;
                p.set(Math.cos(a) * 3.3, 2.4 + Math.sin(t * 1.3 + i * 1.7) * 1.4, Math.sin(a) * 3.3);
                e.set(t * 0.8 + i, t * 1.1 + i, Math.PI / 4); q.setFromEuler(e);
                sc.set(0.42, 0.42, 0.42);
                mesh.setMatrixAt(i, m4.compose(p, q, sc));
            }
            mesh.instanceMatrix.needsUpdate = true;
        });
        group.add(mesh);
    }

    // 공허: 검은 큐브가 소용돌이치며 빨려 들어감
    if (fx.void) {
        const n = 46;
        const mesh = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0x050008, transparent: true, opacity: 0.85, depthWrite: false }), n);
        const data = Array.from({ length: n }, () => ({ k: Math.random(), a: rand(0, Math.PI * 2), y: rand(0.5, 5.5), s: rand(0.12, 0.3) }));
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
        updaters.push((t, dt) => {
            data.forEach((d, i) => {
                d.k -= dt * 0.25;
                if (d.k < 0) { d.k = 1; d.a = rand(0, Math.PI * 2); d.y = rand(0.5, 5.5); }
                const r = 0.9 + d.k * 3.6, a = d.a + (1 - d.k) * 4;
                p.set(Math.cos(a) * r, d.y, Math.sin(a) * r);
                e.set(t + i, t * 1.3, 0); q.setFromEuler(e);
                sc.setScalar(d.s * Math.min(1, d.k * 3));
                mesh.setMatrixAt(i, m4.compose(p, q, sc));
            });
            mesh.instanceMatrix.needsUpdate = true;
        });
        group.add(mesh);
    }

    // 번개: 꺾인 박스 줄기가 번쩍
    if (fx.lightning) {
        const bolts = [];
        for (let b = 0; b < 4; b++) {
            const bolt = new THREE.Group();
            for (let s = 0; s < 6; s++) bolt.add(new THREE.Mesh(BOX, glowMat(pick(b === 0 ? 2 : 0), 1)));
            bolts.push(bolt);
            group.add(bolt);
        }
        let next = 0;
        const reshape = bolt => {
            const a = rand(0, Math.PI * 2), r = rand(1.6, 3.2);
            let x = Math.cos(a) * r, z = Math.sin(a) * r, y = 7.5;
            bolt.children.forEach(seg => {
                const nx = x + rand(-0.7, 0.7), nz = z + rand(-0.7, 0.7), ny = y - rand(0.9, 1.4);
                const len = Math.hypot(nx - x, ny - y, nz - z);
                seg.scale.set(0.07, len, 0.07);
                seg.position.set((x + nx) / 2, (y + ny) / 2, (z + nz) / 2);
                seg.lookAt(nx, ny, nz); seg.rotateX(Math.PI / 2);
                x = nx; y = ny; z = nz;
            });
        };
        updaters.push(t => {
            if (t > next) {
                next = t + rand(0.08, 0.35);
                bolts.forEach(b => { b.visible = Math.random() < 0.55; if (b.visible) reshape(b); });
            }
        });
    }

    // 고급 칭호: 전용 연출
    // 칭호끼리 주고받는 값 (예: 제우스가 번개 던지는 순간 → 포즈)
    const sig = {};
    if (fx.signature && SIGNATURES[fx.signature]) {
        SIGNATURES[fx.signature]({ group, tick: fn => updaters.push(fn), colors, pick, c0, dummy, kit: KIT, stage, sig });
    }
    // JXS 는 공통 '거대한 무대'를 한 겹 더 (칭호마다 분신 거리 등만 조금씩 다름)
    if (aura.grade === 'JXS') {
        // JXS마다 자기만의 배경 세계 (없으면 예전 공통 무대)
        const ctx = { group, tick: fn => updaters.push(fn), pick, dummy, kit: KIT };
        const bd = JXS_BACKDROPS[fx.signature];
        if (bd) bd(ctx); else jxsGrand(ctx, JXS_GRAND[fx.signature] || {});
    }

    return { group, updaters, color: c0, glow, sig, grade: aura.grade, pose: POSES[aura.id] || null };
}

/* =========================================================
   등급별 캐릭터 움직임
   lift: 떠오르는 높이, arms: 팔 벌림, sway: 몸 흔들림,
   burst: 몇 초마다 힘이 터지는 연출 (0이면 없음)
   ========================================================= */
const TIER_MOTION = {
    COMMON:   { lift: 0,    arms: 0,    sway: 0,    burst: 0 },
    UNCOMMON: { lift: 0,    arms: 0,    sway: 0,    burst: 0 },
    RARE:     { lift: 0,    arms: 0.05, sway: 0.05, burst: 0 },
    EPIC:     { lift: 0,    arms: 0.1,  sway: 0.1,  burst: 0 },
    LEGEND:   { lift: 0.15, arms: 0.18, sway: 0.15, burst: 0 },
    MYTHIC:   { lift: 0.35, arms: 0.3,  sway: 0.2,  burst: 4.5 },
    ANCIENT:  { lift: 0.55, arms: 0.55, sway: 0.25, burst: 3.6 },
    ABSOLUTE: { lift: 0.7,  arms: 0.75, sway: 0.3,  burst: 3.0 },
    JXS:      { lift: 0.9,  arms: 1.25, sway: 0.35, burst: 2.2 }
};

/* =========================================================
   무대
   ========================================================= */

export function createAuraStage(canvas, { getStageRect, onLabel }) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    // 화질 단계: 프레임이 느리면 자동으로 낮추고, 여유 있으면 올림
    const DPR = window.devicePixelRatio || 1;
    const QUALITY = [
        { pr: Math.min(DPR, 2), bloomDiv: 2 },
        { pr: Math.min(DPR, 1.75), bloomDiv: 2 },
        { pr: Math.min(DPR, 1.5), bloomDiv: 3 },
        { pr: Math.min(DPR, 1.25), bloomDiv: 3 },
        { pr: 1.0, bloomDiv: 4 }
    ];
    let qLevel = 0;
    renderer.setPixelRatio(QUALITY[qLevel].pr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03030a);
    scene.fog = new THREE.Fog(0x03030a, 26, 90);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
    const target = new THREE.Vector3(0, 3.1, 0);

    scene.add(new THREE.HemisphereLight(0x8a90c0, 0x0a0a18, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 9, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6b5cff, 1.2);
    rim.position.set(-5, 5, -6);
    scene.add(rim);

    // 별 (작은 큐브)
    const STARS = 700;
    const stars = new THREE.InstancedMesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false }), STARS);
    {
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
        for (let i = 0; i < STARS; i++) {
            const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = rand(70, 160);
            const s = Math.sqrt(1 - u * u);
            p.set(Math.cos(th) * s * r, u * r * 0.7 + 10, Math.sin(th) * s * r);
            q.setFromEuler(new THREE.Euler(rand(0, 3), rand(0, 3), 0));
            sc.setScalar(Math.random() ** 3 * 0.45 + 0.12);
            stars.setMatrixAt(i, m4.compose(p, q, sc));
            const b = rand(0.35, 1.25);
            stars.setColorAt(i, c.setRGB(b, b, b * rand(1, 1.25)));
        }
    }
    scene.add(stars);

    // 바닥 타일
    const floor = new THREE.Group();
    const TILES = 7, T = 1.02;
    const tileMesh = new THREE.InstancedMesh(BOX, new THREE.MeshStandardMaterial({ color: 0x14142a, roughness: 0.35, metalness: 0.5 }), TILES * TILES);
    {
        const m4 = new THREE.Matrix4();
        let i = 0;
        for (let x = 0; x < TILES; x++) for (let z = 0; z < TILES; z++) {
            m4.makeScale(0.96, 0.18, 0.96);
            m4.setPosition((x - (TILES - 1) / 2) * T, -0.09, (z - (TILES - 1) / 2) * T);
            tileMesh.setMatrixAt(i++, m4);
        }
    }
    const gapGlow = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x5b4dff, toneMapped: false }));
    gapGlow.scale.set(TILES * T - 0.06, 0.02, TILES * T - 0.06);
    gapGlow.position.y = -0.16;
    floor.add(tileMesh, gapGlow);
    scene.add(floor);

    // 캐릭터
    const dummy = makeDummy();
    scene.add(dummy.root);
    const gear = createGearRig(dummy);   // 건틀렛/부적
    const pet = createPetRig(dummy);     // 따라다니는 펫
    const defaultFace = dummy.faceMat.map;

    // 아우라
    let current = null;
    let auraScale = 0;
    let rolling = false, speed = 1;
    let flash = 0;
    let shakeAmt = 0;
    let motion = TIER_MOTION.COMMON;
    let burstAt = 0;

    const SKY = 0x03030a;
    let clearFns = [];
    const stageApi = {
        scene,
        setSky(hex) { scene.background.set(hex); scene.fog.color.set(hex); },
        onClear(fn) { clearFns.push(fn); },
        // 캐릭터 피부 바꾸기 (JXS 등). 아우라 바뀌면 원래대로
        setSkin({ color, eye, glowEyes = false, smile = true, emissive = 0 }) {
            dummy.mat.color.set(color);
            dummy.mat.emissive.set(eye || color);
            dummy.mat.emissiveIntensity = emissive;
            dummy.faceMat.map = makeFaceTexture(new THREE.Color(color).getStyle(), { eye, smile, glowEyes });
            dummy.faceMat.needsUpdate = true;
            dummy.edgeMat.color.set(eye || 0x5d6170);
        },
        burst(fn) { burstHooks.push(fn); },
        shake(a) { shakeAmt = Math.max(shakeAmt, a); },
        flash(v) { flash = Math.max(flash, v); }
    };
    let burstHooks = [];

    function resetSkin() {
        dummy.mat.color.set(dummy.SKIN);
        dummy.mat.emissiveIntensity = 0;
        if (dummy.faceMat.map !== defaultFace) { dummy.faceMat.map.dispose(); dummy.faceMat.map = defaultFace; dummy.faceMat.needsUpdate = true; }
        dummy.edgeMat.color.set(0x5d6170);
    }

    // 몇 초마다 터지는 힘 (네모 충격파 + 튀어나가는 큐브)
    const burstGroup = new THREE.Group();
    scene.add(burstGroup);
    const burstRing = makeSquareRing(1, 0.06, glowMat(0xffffff, 1));
    burstRing.visible = false;
    burstGroup.add(burstRing);
    const BURST_N = 28;
    const burstCubes = new THREE.InstancedMesh(BOX, glowMat(0xffffff, 1), BURST_N);
    burstCubes.visible = false;
    burstGroup.add(burstCubes);
    const burstData = Array.from({ length: BURST_N }, () => ({ v: new THREE.Vector3() }));
    let burstK = 1;
    function fireBurst(strength = 1) {
        if (!current) return;
        burstK = 0;
        burstRing.visible = burstCubes.visible = true;
        burstRing.children.forEach(c => c.material.color.copy(current.color));
        burstCubes.material.color.copy(current.color);
        burstData.forEach(d => {
            const a = rand(0, Math.PI * 2), up = rand(-0.2, 1);
            d.v.set(Math.cos(a), up, Math.sin(a)).normalize().multiplyScalar(rand(4, 9) * strength);
        });
        burstHooks.forEach(fn => fn());
        flash = Math.max(flash, 0.6 * strength);
    }
    function updateBurst(dt) {
        if (burstK >= 1) return;
        burstK = Math.min(1, burstK + dt * 1.3);
        const k = burstK;
        burstRing.scale.setScalar(0.5 + k * 9);
        burstRing.position.y = 2.6 + dummy.root.position.y;
        burstRing.children.forEach(c => { c.material.opacity = 1 - k; });
        const { m4, q, p, sc, e } = TMP;
        burstData.forEach((d, i) => {
            p.copy(d.v).multiplyScalar(k * 0.9);
            p.y += 2.8 + dummy.root.position.y;
            q.setFromEuler(e.set(k * 8 + i, k * 6, 0));
            sc.setScalar(0.22 * (1 - k));
            burstCubes.setMatrixAt(i, m4.compose(p, q, sc));
        });
        burstCubes.instanceMatrix.needsUpdate = true;
        if (k >= 1) burstRing.visible = burstCubes.visible = false;
    }

    function clearAura() {
        clearFns.forEach(fn => fn()); clearFns = [];
        burstHooks = [];
        scene.background.set(SKY); scene.fog.color.set(SKY);
        dummy.root.position.set(0, 0, 0); dummy.root.rotation.set(0, 0, 0);
        dummy.root.visible = true;
        [dummy.torso, dummy.legL, dummy.legR, dummy.armL, dummy.armR, dummy.head].forEach(pv => pv.scale.set(1, 1, 1));
        resetSkin();
        if (!current) return;
        scene.remove(current.group);
        current.group.traverse(o => { if (o.material) o.material.dispose?.(); });
        for (const p of dummy.parts) {
            [...p.children].forEach(ch => { ch.material?.dispose?.(); p.remove(ch); });
        }
        current = null;
    }

    function setAura(aura, { force = false } = {}) {
        if (!force && current && aura && current.id === aura.id) return;
        clearAura();
        motion = TIER_MOTION[aura?.grade] || TIER_MOTION.COMMON;
        burstAt = 1.5;
        resetFit();
        if (!aura) return;
        current = buildAura(aura, dummy, stageApi);
        current.id = aura.id;
        current.grade = aura.grade;
        scene.add(current.group);
        gapGlow.material.color.copy(current.color).multiplyScalar(0.35 + Math.min(1, current.glow) * 0.4);
        rim.color.copy(current.color);
        bloom.strength = 0.5 + Math.min(current.glow, 2) * 0.12 + (aura.grade === 'JXS' ? 0.08 : 0);
        auraScale = 0;
        flash = 1;
        applyFxBudget(true);
    }

    /* ---------- 렉 줄이기: 효과 양 조절 ----------
       화질 단계(자동으로 내려가는 것 포함)와 설정의 '효과 양'에 맞춰
       - 입자(InstancedMesh)는 그리는 개수를 줄이고
       - 칭호 전용 조명은 화질이 많이 낮으면 끔 (조명 하나가 화면 전체 계산을 늘림) */
    const FX_Q = [1, 0.85, 0.7, 0.55, 0.42];
    const FX_USER = { high: 1, mid: 0.65, low: 0.4 };
    let fxMode = 'high', fxApplied = -1, fxTimer = 0;
    function fxFactor() { return FX_Q[qLevel] * (FX_USER[fxMode] || 1); }
    function applyFxBudget(force) {
        if (!current) return;
        const f = fxFactor();
        if (!force && Math.abs(f - fxApplied) < 0.01) return;
        fxApplied = f;
        current.group.traverse(o => {
            if (o.isInstancedMesh) {
                if (o.userData.maxCount === undefined) o.userData.maxCount = o.count;
                o.count = Math.max(1, Math.round(o.userData.maxCount * f));
            }
            if (o.isPointLight && o.userData.own) o.visible = f >= 0.5;
        });
    }

    // 블룸
    // 계단 현상 줄이기: WebGL2 면 블룸 화면에도 멀티샘플(MSAA) 적용
    const msaa = renderer.capabilities.isWebGL2 ? 4 : 0;
    const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: msaa }));
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.32, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ---------- 화면 맞춤 ----------
       아우라가 실제로 차지하는 크기를 재서, 캐릭터와 아우라가 무대 안에 다 보이도록
       카메라 거리를 정한다. (폰처럼 좁은 화면이면 알아서 멀어짐) */
    const BASE_BOUNDS = { minX: -2.1, maxX: 2.1, minZ: -1, maxZ: 1, minY: -0.2, maxY: 5.4 };
    let bounds = { ...BASE_BOUNDS };
    let fitSampleT = 0, fitSamples = 0;
    function resetFit() { bounds = { ...BASE_BOUNDS }; fitSamples = 0; fitSampleT = 0.6; }   // 아우라가 다 커진 뒤부터 잼
    const tmpBox = new THREE.Box3();
    function sampleBounds() {
        if (!current) return;
        current.group.updateMatrixWorld(true);
        const visit = o => {
            if (o.userData.noFit || !o.visible) return;
            if (o.isMesh && !o.isInstancedMesh && o.geometry) {
                tmpBox.setFromObject(o);
                if (isFinite(tmpBox.min.x)) {
                    bounds.minX = Math.min(bounds.minX, tmpBox.min.x); bounds.maxX = Math.max(bounds.maxX, tmpBox.max.x);
                    bounds.minZ = Math.min(bounds.minZ, tmpBox.min.z); bounds.maxZ = Math.max(bounds.maxZ, tmpBox.max.z);
                    bounds.minY = Math.min(bounds.minY, tmpBox.min.y); bounds.maxY = Math.max(bounds.maxY, tmpBox.max.y);
                }
            }
            o.children.forEach(visit);
        };
        current.group.children.forEach(visit);
        // 큐브 입자들은 몸 주위 반경 3 정도
        if (current.group.children.some(c => c.isInstancedMesh && !c.userData.noFit)) {
            bounds.minX = Math.min(bounds.minX, -3.2); bounds.maxX = Math.max(bounds.maxX, 3.2);
            bounds.maxY = Math.max(bounds.maxY, 6.6);
        }
        bounds.maxY = Math.max(bounds.maxY, 5.4 + dummy.root.position.y + 1.7);   // 머리 위 이름표 자리까지
        // 너무 큰 건(기둥, 하늘에서 오는 번개 등) 무시하도록 위아래 한도
        bounds.maxY = Math.min(bounds.maxY, 11);
        bounds.minX = Math.max(bounds.minX, -6); bounds.maxX = Math.min(bounds.maxX, 6);
    }

    let W = 1, H = 1;
    let usable = { cx: 0.5, cy: 0.55, w: 1, h: 0.45 };
    function resize() {
        W = window.innerWidth; H = window.innerHeight;
        renderer.setPixelRatio(QUALITY[qLevel].pr);
        renderer.setSize(W, H, false);
        composer.setPixelRatio(QUALITY[qLevel].pr);
        // 화질이 낮은 단계에선 계단 현상 줄이기(MSAA)를 꺼서 많이 가볍게
        const wantSamples = qLevel >= 3 ? 0 : msaa;
        [composer.renderTarget1, composer.renderTarget2].forEach(rt => { if (rt && rt.samples !== wantSamples) { rt.samples = wantSamples; rt.dispose(); } });
        composer.setSize(W, H);
        bloom.resolution.set(W / QUALITY[qLevel].bloomDiv, H / QUALITY[qLevel].bloomDiv);
        const r = getStageRect && getStageRect();
        if (r && r.height > 40) {
            // 위쪽 결과 글자(약 100px)와 아래 배율 글자(약 30px)를 뺀 곳에 캐릭터를 맞춤
            const top = r.top + Math.min(112, r.height * 0.28), bottom = r.bottom - 30;
            usable = { cx: (r.left + r.width / 2) / W, cy: ((top + bottom) / 2) / H, w: r.width / W, h: Math.max(80, bottom - top) / H };
        } else {
            usable = { cx: 0.5, cy: 0.5, w: 1, h: 0.42 };
        }
        camera.aspect = W / H;
        applyViewOffset();
    }
    // 평소엔 화면 중심을 무대 칸 가운데로 옮겨 둠. 컷씬 중에는 화면 정가운데로 (centerK: 0 평소 → 1 정가운데)
    let centerK = 0;
    function applyViewOffset() {
        const k = 1 - centerK;
        camera.setViewOffset(W, H, (W / 2 - usable.cx * W) * k, (H / 2 - usable.cy * H) * k, W, H);
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    const fovT = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    let dist = 20;
    function fitDistance() {
        const hgt = (bounds.maxY - bounds.minY) * 1.08;
        const halfW = Math.max(-bounds.minX, bounds.maxX, -bounds.minZ * 0.35, bounds.maxZ * 0.35) * 1.08;
        const dH = hgt / (2 * fovT * usable.h);
        const dW = (2 * halfW) / (2 * fovT * usable.w * (W / H));
        return Math.max(dH, dW, 12);
    }

    // 컷씬 (cutscene3d.js 가 카메라를 잠시 맡음)
    let cine = null;
    const cineCtx = {
        THREE, scene, camera, dummy, floor, stars, kit: KIT, bloom, target,
        setAura: (a, o) => setAura(a, o), clearAura, stageApi,
        getNormalView: () => ({ dist, target: target.clone() }),
        setCenter: k => { if (Math.abs(k - centerK) > 0.001) { centerK = k; applyViewOffset(); } },
        flash: v => { flash = Math.max(flash, v); }
    };

    // 루프
    const clock = new THREE.Clock();
    const headTop = new THREE.Vector3();
    let t = 0;
    // 프레임 시간 재서 화질 조절
    let perfAcc = 0, perfN = 0, perfCooldown = 3;
    let lowPower = false, skip = 0, pendingDt = 0;
    // 화질 자동 조절: 90프레임마다 검사.
    //  느린 프레임(25ms 넘음)이 많으면 한 단계 낮추고, 다시 여유가 생기면(평균 20ms 미만, 느린 프레임 거의 없음) 한 단계 올림
    let perfSlow = 0;
    let qualityMode = 'auto';
    function adaptQuality(rawDt) {
        if (qualityMode !== 'auto') return;
        if (perfCooldown > 0) { perfCooldown -= rawDt; perfAcc = 0; perfN = 0; perfSlow = 0; return; }
        if (rawDt > 0.25) return;   // 탭 전환 등으로 생긴 큰 공백은 빼고 셈
        perfAcc += rawDt; perfN++;
        if (rawDt > 1 / 40) perfSlow++;
        if (perfN < 90) return;
        const avg = perfAcc / perfN, slow = perfSlow / perfN;
        perfAcc = 0; perfN = 0; perfSlow = 0;
        if (slow > 0.3 && qLevel < QUALITY.length - 1) { qLevel++; resize(); perfCooldown = 1.5; }
        else if (avg < 1 / 50 && slow < 0.06 && qLevel > 0) { qLevel--; resize(); perfCooldown = 3; }
    }

    function tick() {
        requestAnimationFrame(tick);
        const rawDt = clock.getDelta();
        // 메뉴 창이 화면을 덮고 있으면 3프레임에 1번만 그림
        if (lowPower && !cine?.active) {
            skip = (skip + 1) % 3;
            if (skip) { pendingDt += rawDt; return; }
        }
        const dt = Math.min(rawDt + pendingDt, 0.05);
        pendingDt = 0;
        if (!lowPower && !document.hidden) adaptQuality(rawDt);
        fxTimer -= rawDt;
        if (fxTimer <= 0) { fxTimer = 0.5; applyFxBudget(false); }
        speed += ((rolling ? 3.2 : 1) - speed) * Math.min(1, dt * 4);
        t += dt;

        // 아우라 크기 재기 (처음 3초 동안 여러 번)
        if (current && fitSamples < 12) {
            fitSampleT -= dt;
            if (fitSampleT <= 0) { sampleBounds(); fitSamples++; fitSampleT = 0.2; }
        }
        // 크기를 다 잰 다음에만 카메라를 움직임 (재는 도중에 움직이면 뽑을 때마다 확대→축소가 반복돼 보임)
        if (!current || fitSamples >= 12) {
            const wantDist = fitDistance() * (current?.grade === 'JXS' ? 1.15 : 1);   // JXS는 뒤 배경 세계가 보이게 한 발 물러섬
            dist += (wantDist - dist) * Math.min(1, dt * 2.5);
            const wantY = (bounds.minY + bounds.maxY) / 2;
            target.y += (wantY - target.y) * Math.min(1, dt * 2.5);
        }

        // 캐릭터: 매 프레임 기본자세로 돌린 다음 아우라/등급 움직임을 얹음
        dummy.root.position.set(0, 0, 0);
        dummy.root.rotation.set(0, 0, 0);
        const breathe = Math.sin(t * 1.6);
        dummy.torso.position.y = 3 + breathe * 0.02;
        dummy.head.position.y = 4.62 + breathe * 0.03;
        dummy.head.rotation.set(0, 0, 0);

        if (current) {
            auraScale += (1 - auraScale) * Math.min(1, dt * 5);
            current.group.scale.setScalar(0.4 + 0.6 * auraScale);
            current.updaters.forEach(u => u(t, dt, speed));
            current.group.children.forEach(ch => { if (ch.isPointLight && !ch.userData.own) ch.intensity = Math.min(current.glow * 2.5, 4.5) * (1 + flash * 1.2); });
        }

        // 등급 움직임
        const m = motion;
        dummy.root.position.y += m.lift * (0.75 + 0.25 * Math.sin(t * 1.3));
        dummy.root.rotation.y += Math.sin(t * 0.7) * m.sway;
        const armOpen = m.arms + (rolling ? 0.25 : 0);
        dummy.armL.rotation.set(Math.sin(t * 1.2) * (0.06 + m.arms * 0.08), 0, -0.04 - armOpen);
        dummy.armR.rotation.set(-Math.sin(t * 1.2) * (0.06 + m.arms * 0.08), 0, 0.04 + armOpen);
        dummy.legL.rotation.set(m.lift > 0 ? Math.sin(t * 1.3) * 0.08 : 0, 0, -m.lift * 0.08);
        dummy.legR.rotation.set(m.lift > 0 ? -Math.sin(t * 1.3) * 0.08 : 0, 0, m.lift * 0.08);
        if (m.lift > 0.5) dummy.head.rotation.x = -0.12 - Math.sin(t * 0.9) * 0.05;   // 고개를 살짝 듦
        if (current?.pose) current.pose(t, dummy, rolling, current.sig);            // 칭호별 포즈
        gear.update(t, dt, speed);
        pet.update(t);
        if (m.burst && current && !cine?.active) {
            burstAt -= dt;
            if (burstAt <= 0) { fireBurst(current.grade === 'JXS' ? 1.4 : 1); burstAt = m.burst; if (current.grade === 'JXS') shakeAmt = Math.max(shakeAmt, 0.12); }
        }
        updateBurst(dt);

        // 카메라
        if (cine?.active) {
            cine.update(dt);
        } else {
            const yaw = Math.sin(t * 0.18) * 0.35;
            camera.position.set(Math.sin(yaw) * dist, target.y + dist * 0.14, Math.cos(yaw) * dist);
        }
        if (shakeAmt > 0.001) {
            camera.position.x += rand(-1, 1) * shakeAmt;
            camera.position.y += rand(-1, 1) * shakeAmt;
            shakeAmt *= Math.pow(0.02, dt);
        }
        if (!cine?.active) camera.lookAt(target);

        stars.rotation.y = t * 0.004;
        flash *= Math.pow(0.04, dt);

        composer.render();

        if (onLabel) {
            headTop.set(0, 6.35 + dummy.root.position.y, 0).project(camera);
            onLabel((headTop.x * 0.5 + 0.5) * W, (-headTop.y * 0.5 + 0.5) * H);
        }
    }
    requestAnimationFrame(tick);

    return {
        setAura,
        resize,
        setRolling(v) { rolling = v; },
        setGear(opts) { gear.set(opts); },
        setPet(id) { pet.set(id); },
        getRenderer() { return renderer; },
        // 화질: 'auto'(자동) | 'high' | 'mid' | 'low'
        setQualityMode(mode) {
            qualityMode = mode;
            const fixed = { high: 0, mid: 2, low: 4 }[mode];
            if (fixed !== undefined) qLevel = fixed;
            else { qLevel = 0; perfCooldown = 2; }
            resize();
        },
        setLowPower(v) { lowPower = v; },
        // 효과 양: 'high' | 'mid' | 'low'
        setFxMode(mode) { fxMode = mode; applyFxBudget(true); },
        flash() { flash = 1; },
        shake(amount = 0.35) { shakeAmt = amount; flash = 1; },
        // 3D 컷씬 재생. cfg = { hit, hit2, total, tier }, getTime() = 지금 컷씬 몇 초인지
        async playCutscene(aura, cfg, getTime) {
            if (!cine) {
                const { createCutscene } = await import('./cutscene3d.js?v=48');
                cine = createCutscene(cineCtx);
            }
            return cine.play(aura, cfg, getTime, { shake: a => { shakeAmt = Math.max(shakeAmt, a); } });
        },
        isCutscene() { return !!cine?.active; }
    };
}
