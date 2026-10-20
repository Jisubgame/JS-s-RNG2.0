/* =========================================================
   🛠 제작창 3D 미리보기
   무대에서 이미 쓰고 있는 렌더러로 장비 모형을 작은 화면에 그려
   카드마다 있는 캔버스에 복사한다 (WebGL 창을 따로 만들면 폰에 따라 안 뜨는 경우가 있어서)
   ========================================================= */

import * as THREE from 'three';
import { buildGearModel } from './gear3d.js?v=44';
import { buildPetModel } from './pets3d.js?v=44';
import { buildNestModel } from './nest3d.js?v=44';

export function createGearPreviews(renderer) {
    const SIZE = 160;
    const rt = new THREE.WebGLRenderTarget(SIZE, SIZE);
    const buf = new Uint8Array(SIZE * SIZE * 4);
    // 렌더 타깃은 선형 색이라 화면용(sRGB)으로 바꾸는 표
    const LUT = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        const c = i / 255;
        LUT[i] = Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
    }
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x8a7bff, 1.0); rim.position.set(-4, 2, -3); scene.add(rim);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.3, 6.6);
    camera.lookAt(0, -0.1, 0);
    const holder = new THREE.Group(); scene.add(holder);
    const clear = new THREE.Color();

    const models = new Map();
    let canvases = [];
    let raf = 0, t0 = performance.now(), last = 0;

    function model(id) {
        if (!models.has(id)) {
            let m = null;
            try { m = buildGearModel(id) || buildPetModel(id) || buildNestModel(id); } catch (e) { console.warn(e); }
            models.set(id, m);
        }
        return models.get(id);
    }

    function draw(c, t) {
        const m = model(c.dataset.gear);
        if (!m) return;
        holder.clear();
        holder.add(m.root);
        // 부적은 앞에 매단 부적이 보이게 앞쪽에서 좌우로만 흔듦
        if (m.isNest || m.isEgg) {   // 둥지는 살짝 내려다보며 천천히 돎
            m.root.rotation.set(m.isNest ? 0.5 : 0.1, t * (m.isNest ? 0.3 : 0.6) + (+c.dataset.ph || 0), 0);
            m.root.position.y = m.isNest ? -0.15 : 0;
        } else {
        const ry = m.isAmulet || m.isPet ? Math.sin(t * 0.8 + (+c.dataset.ph || 0)) * 0.8 : t * 0.7 + (+c.dataset.ph || 0);
        m.root.rotation.set(0.12, ry, m.isPet ? 0 : m.isAmulet ? 0.25 : -0.25);
        m.root.position.y = m.isPet ? -0.35 : m.isAmulet ? -0.55 : 0.45;
        }
        m.update(t);
        const prev = renderer.getRenderTarget();
        renderer.getClearColor(clear);
        const prevAlpha = renderer.getClearAlpha();
        renderer.setRenderTarget(rt);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.readRenderTargetPixels(rt, 0, 0, SIZE, SIZE, buf);
        renderer.setRenderTarget(prev);
        renderer.setClearColor(clear, prevAlpha);
        const ctx = c.getContext('2d');
        const img = ctx.createImageData(SIZE, SIZE);
        const d = img.data;
        for (let y = 0; y < SIZE; y++) {
            const src = (SIZE - 1 - y) * SIZE * 4, dst = y * SIZE * 4;   // 위아래 뒤집기
            for (let x = 0; x < SIZE * 4; x += 4) {
                d[dst + x] = LUT[buf[src + x]];
                d[dst + x + 1] = LUT[buf[src + x + 1]];
                d[dst + x + 2] = LUT[buf[src + x + 2]];
                d[dst + x + 3] = buf[src + x + 3];
            }
        }
        ctx.putImageData(img, 0, 0);
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        if (now - last < 50) return;   // 20fps 면 충분
        last = now;
        const t = (now - t0) / 1000;
        canvases = canvases.filter(c => c.isConnected);
        if (!canvases.length) { stop(); return; }
        for (const c of canvases) {
            const r = c.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) continue;   // 화면 밖은 안 그림
            draw(c, t);
        }
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    return {
        attach(root) {
            canvases = [...root.querySelectorAll('canvas[data-gear]')];
            canvases.forEach((c, i) => { c.width = c.height = SIZE; c.dataset.ph = i * 0.9; draw(c, 0); });   // 바로 한 장 그려 둠
            if (!raf && canvases.length) raf = requestAnimationFrame(frame);
        },
        stop
    };
}
