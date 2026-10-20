import { AURA_DATA } from './auras.js?v=51';
import { CRAFT_ITEMS } from './craftItems.js?v=51';
import { createMusicPlayer, coverArt } from './music.js?v=51';
import { PETS, PET_BY_ID, EGGS, EGG_BY_ID, STAR_MAX, starMult } from './petsData.js?v=51';
import { BIOMES, BIOME_BY_ID, BIOME_CHECK_MS, rollBiome, randomBiome, createBiomeFx } from './biomes.js?v=51';

/* =========================================================
   📦 게임 데이터
   ========================================================= */

// 등급 = 확률 구간 (자릿수마다 한 등급)
const GRADES = ["COMMON", "RARE", "EPIC", "LEGEND", "MYTHIC", "ANCIENT", "ABSOLUTE", "JXS"];
const GRADE_ODDS = {
    COMMON: "1 in 1 ~ 99",
    RARE: "1 in 100 ~ 999",
    EPIC: "1 in 1,000 ~ 9,999",
    LEGEND: "1 in 10,000 ~ 99,999",
    MYTHIC: "1 in 100,000 ~ 999,999",
    ANCIENT: "1 in 1,000,000 ~ 9,999,999",
    ABSOLUTE: "1 in 10,000,000 ~ 99,999,999",
    JXS: "1 in 100,000,000 ~ 999,999,999"
};
const HIGH_GRADES = ["LEGEND", "MYTHIC", "ANCIENT", "ABSOLUTE", "JXS"];
const CUTSCENE_GRADES = ["ANCIENT", "ABSOLUTE", "JXS"];

const SHOP_ITEMS = [
    { id: "luck_1", name: "행운의 물약 1", price: 300, type: "luck", level: 1, value: 0.15, duration: 120, desc: "+15% 행운 (2분)", frame: "UNCOMMON", color: "#5fe08a" },
    { id: "luck_2", name: "행운의 물약 2", price: 800, type: "luck", level: 2, value: 0.30, duration: 120, desc: "+30% 행운 (2분)", frame: "UNCOMMON", color: "#5fe08a" },
    { id: "luck_3", name: "행운의 물약 3", price: 2000, type: "luck", level: 3, value: 0.66, duration: 120, desc: "+66% 행운 (2분)", frame: "UNCOMMON", color: "#5fe08a" },
    { id: "speed_1", name: "속도의 물약 1", price: 500, type: "speed", level: 1, value: 0.15, duration: 180, desc: "+15% 속도 (3분)", frame: "RARE", color: "#4da3ff" },
    { id: "speed_2", name: "속도의 물약 2", price: 1200, type: "speed", level: 2, value: 0.30, duration: 180, desc: "+30% 속도 (3분)", frame: "RARE", color: "#4da3ff" },
    { id: "speed_3", name: "속도의 물약 3", price: 3000, type: "speed", level: 3, value: 0.55, duration: 180, desc: "+55% 속도 (3분)", frame: "RARE", color: "#4da3ff" },
    { id: "limit_potion", name: "한계의 물약", price: 40000, type: "luck_mult", value: 6000, maxUses: 3, desc: "×6,000 행운 (3회)", frame: "LEGEND", color: "#ff7a1a" },
    { id: "overcome_potion", name: "극복의 물약", price: 250000, type: "luck_mult", value: 60000, maxUses: 2, desc: "×60,000 행운 (2회)", frame: "MYTHIC", color: "#00e5ff", color2: "#6a5cff" },
    { id: "heaven_potion", name: "천상의 물약", price: 400000, type: "luck_mult", value: 180000, maxUses: 1, desc: "×180,000 행운 (1회)", frame: "ANCIENT", color: "#ffe39a" },
    { id: "void_potion", name: "공허의 물약", price: 2000000, type: "luck_mult", value: 850000, maxUses: 1, desc: "×850,000 행운 (1회)", frame: "JXS", unique: "voidpotion", color: "#b026ff", color2: "#ff2d55" },
    // 💥 최상급 물약 (공허 → 초신성 → 창세 순서로 강함) (상점에선 안 팜 · 뽑기 아주 낮은 확률 / 암시장 / 시즌 패스로만)
    { id: "nebula_potion", gacha: "special", name: "초신성의 물약", type: "luck_mult", value: 3000000, maxUses: 1, desc: "×3,000,000 행운 (1회) · 별이 터지는 순간의 빛을 한 병에 담았다", frame: "JXS", color: "#5ab0ff", color2: "#ff6fd8" },
    { id: "genesis_potion", gacha: "special", name: "창세의 물약", type: "luck_mult", value: 15000000, maxUses: 1, desc: "×15,000,000 행운 (1회) · 세상이 처음 만들어지던 순간의 빛", frame: "JXS", unique: "voidpotion", color: "#fff3c0", color2: "#7dff9a" },
    // 🎰 상점 뽑기 전용 (상점에서 안 팔고 뽑기에서만 나옴)
    { id: "dice_potion", gacha: true, name: "주사위 물약", type: "dice", faces: [1200, 6000, 24000, 60000, 150000, 360000], desc: "주사위를 굴려 ×1,200 ~ ×360,000 행운 (1회)", frame: "EPIC", color: "#ff3b5c", color2: "#ffffff" },
    { id: "star_potion", gacha: true, name: "별빛 물약", type: "luck", level: 4, value: 3, duration: 180, desc: "+300% 행운 (3분)", frame: "LEGEND", color: "#d7b8ff", color2: "#7ae8ff" },
    { id: "warp_potion", gacha: true, name: "시간 가속 물약", type: "speed", level: 4, value: 1, duration: 120, desc: "+100% 속도 (2분)", frame: "LEGEND", color: "#7ae8ff", color2: "#4da3ff" },
    { id: "biome_potion", gacha: true, name: "바이옴 소환 물약", type: "biome", desc: "지금 바로 랜덤 바이옴을 불러옵니다", frame: "MYTHIC", color: "#8fb8ff", color2: "#ff4a5a" },
    // 🎃 할로윈 한정 뽑기 전용
    { id: "candy_potion", gacha: "halloween", name: "사탕 물약", type: "luck", level: 5, value: 5, duration: 120, desc: "+500% 행운 (2분)", frame: "EPIC", color: "#ff3b7a", color2: "#ffe14d" },
    { id: "pumpkin_potion", gacha: "halloween", name: "호박 물약", type: "luck_mult", value: 12000, maxUses: 2, desc: "×12,000 행운 (2회)", frame: "LEGEND", color: "#ff7a1a", color2: "#3a8c2a" },
    { id: "ghost_potion", gacha: "halloween", name: "유령 물약", type: "biome", biome: "halloween", desc: "할로윈의 밤 바이옴을 바로 불러옵니다", frame: "MYTHIC", color: "#c8b8ff", color2: "#5a2a8a" }
];

/* 🎰 상점 뽑기 (JC로 굴림). w = 가중치 */
const GACHA_COST = 45000, GACHA_COST10 = 405000, GACHA_PITY = 100;   // 전시장 수입이 생겨서 올림
const GACHA_POOL = [
    // 한 번(3만 JC)에 평균 2만 8천 JC어치 정도 나오게 맞춤 (물약은 상점가 기준). 장비가 나오면 이득
    { kind: 'jc', min: 8000, max: 38000, w: 260, tier: 'COMMON', label: 'JC 주머니' },
    { kind: 'egg', id: 'egg_basic', w: 95, tier: 'RARE' },
    { kind: 'egg', id: 'egg_rare', w: 32, tier: 'EPIC' },
    { kind: 'egg', id: 'egg_legend', w: 9, tier: 'LEGEND' },
    { kind: 'egg', id: 'egg_mythic', w: 2, tier: 'MYTHIC' },
    { kind: 'items', items: { luck_3: 2, speed_3: 2 }, w: 230, tier: 'COMMON', label: '물약 꾸러미' },
    { kind: 'items', items: { limit_potion: 1 }, w: 100, tier: 'RARE' },
    { kind: 'items', items: { dice_potion: 1 }, w: 60, tier: 'RARE' },
    { kind: 'items', items: { warp_potion: 1 }, w: 70, tier: 'EPIC' },
    { kind: 'items', items: { star_potion: 1 }, w: 55, tier: 'EPIC' },
    { kind: 'items', items: { biome_potion: 1 }, w: 50, tier: 'EPIC' },
    { kind: 'items', items: { overcome_potion: 1 }, w: 15, tier: 'LEGEND' },
    { kind: 'gear', id: 'gacha_clover', w: 10, tier: 'LEGEND', dupe: 60000 },
    { kind: 'gear', id: 'gacha_dice', w: 9, tier: 'LEGEND', dupe: 80000 },
    { kind: 'gear', id: 'gacha_compass', w: 6, tier: 'MYTHIC', dupe: 150000 },
    { kind: 'gear', id: 'gacha_jackpot', w: 3.5, tier: 'MYTHIC', dupe: 300000 },
    { kind: 'items', items: { heaven_potion: 1 }, w: 2.5, tier: 'MYTHIC' },
    { kind: 'gear', id: 'gacha_cat', w: 1, tier: 'ANCIENT', dupe: 800000 },
    { kind: 'gear', id: 'gacha_comet', w: 0.5, tier: 'ABSOLUTE', dupe: 1500000 },
    { kind: 'items', items: { nebula_potion: 1 }, w: 0.15, tier: 'ABSOLUTE' }
];

/* 🎃 할로윈 한정 뽑기 (이 날짜까지) */
const HALLOWEEN_END = new Date('2026-11-03T00:00:00+09:00').getTime();
const isHalloween = () => Date.now() < HALLOWEEN_END;
const activeEvents = () => isHalloween() ? ['halloween'] : [];
const HW_POOL = [
    // 한 번(3만 5천 JC)에 평균 2만 8천 JC어치 정도. 한정 장비가 목적
    { kind: 'jc', min: 8000, max: 50000, w: 330, tier: 'COMMON', label: 'JC 사탕 주머니' },
    { kind: 'items', items: { luck_3: 2, speed_3: 2 }, w: 230, tier: 'COMMON', label: '물약 꾸러미' },
    { kind: 'items', items: { candy_potion: 1 }, w: 90, tier: 'RARE' },
    { kind: 'items', items: { limit_potion: 1 }, w: 80, tier: 'RARE' },
    { kind: 'items', items: { ghost_potion: 1 }, w: 70, tier: 'EPIC' },
    { kind: 'items', items: { pumpkin_potion: 1 }, w: 50, tier: 'EPIC' },
    { kind: 'items', items: { overcome_potion: 1 }, w: 14, tier: 'LEGEND' },
    { kind: 'gear', id: 'hw_pumpkin', w: 9, pw: 62, tier: 'LEGEND', dupe: 100000 },
    { kind: 'gear', id: 'hw_ghost', w: 7, pw: 32, tier: 'MYTHIC', dupe: 120000 },
    { kind: 'gear', id: 'hw_candy', w: 2.5, pw: 4, tier: 'MYTHIC', dupe: 250000 },
    { kind: 'items', items: { heaven_potion: 1 }, w: 2, tier: 'MYTHIC' },
    { kind: 'gear', id: 'hw_skull', w: 3, pw: 2, tier: 'ANCIENT', dupe: 400000 }
];
// 뽑기 종류 (상점 탭 이름 = 키)
const BANNERS = {
    gacha: { title: 'JS LUCKY BOX', pool: GACHA_POOL, cost: GACHA_COST, cost10: GACHA_COST10, pity: GACHA_PITY, pityKey: 'gachaPity', potionTag: true, label: '뽑기 전용' },
    halloween: { title: 'HALLOWEEN NIGHT', pool: HW_POOL, cost: 50000, cost10: 450000, pity: 100, pityKey: 'hwPity', potionTag: 'halloween', label: '할로윈 한정', end: HALLOWEEN_END }
};
for (const b of Object.values(BANNERS)) {
    b.total = b.pool.reduce((s, e) => s + e.w, 0);
    b.gearW = b.pool.filter(e => e.kind === 'gear').reduce((s, e) => s + (e.pw ?? e.w), 0);   // 천장 때 가중치 합
}
const bannerOfGear = id => Object.entries(BANNERS).find(([, b]) => b.pool.some(e => e.id === id));
// 확률 글자: 1% 밑이면 소수 둘째 자리까지
const gachaPct = (w, total) => { const p = w / total * 100; return p.toFixed(p < 1 ? 2 : 1) + '%'; };

const QUEST_DATA = [
    {
        id: "quest_swift", name: "신속하게", repeatable: false,
        desc: "빠른 롤을 쓸 자격을 증명하세요.",
        rewardDesc: "빠른 롤 해금 + 천상의 물약 5개",
        reward: { unlockQuickRoll: true, items: { heaven_potion: 5 } },
        targets: { rolls: 2500, epic: 10, legend: 2, jc: 750000, shopPurchases: 10 }
    },
    {
        id: "quest_repeat_overcome", name: "극복의 시련", repeatable: true,
        desc: "지속적인 시련을 극복하고 성장의 기반을 다지세요.",
        rewardDesc: "🧪 극복의 물약 1개 + 🪙 70,000 JC",
        reward: { items: { overcome_potion: 1 }, jc: 70000 },
        targets: { rolls: 800, rare: 10, epic: 3 }
    },
    {
        id: "quest_repeat_heaven", name: "천상의 시련", repeatable: true,
        desc: "천상에 도달하기 위한 극한의 운명을 테스트하세요.",
        rewardDesc: "🧪 천상의 물약 1개 + 🪙 140,000 JC",
        reward: { items: { heaven_potion: 1 }, jc: 140000 },
        targets: { rolls: 1500, epic: 6, legend: 1 }
    }
];
const QUEST_TARGET_LABELS = {
    rolls: n => `롤 ${fmt(n)}번 하기`,
    rare: n => `RARE 이상 ${n}개 뽑기`,
    epic: n => `EPIC 이상 ${n}개 뽑기`,
    legend: n => `LEGEND ${n}개 뽑기`,
    mythic: n => `MYTHIC ${n}개 뽑기`,
    ancient: n => `ANCIENT ${n}개 뽑기`,
    absolute: n => `ABSOLUTE ${n}개 뽑기`,
    jc: n => `${fmt(n)} JC 모으기`,
    shopPurchases: n => `상점 아이템 ${n}개 구매`
};

const COUPONS = {
    'UPDATE2': { items: { void_potion: 1 }, msg: "🧪 공허의 물약 1개" },
    'SEASONPASS': { jc: 1000000, items: { heaven_potion: 5 }, msg: "🪙 100만 JC + 🧪 천상의 물약 5개" }
};

const DEV_PASSWORD = "3699";
const SAVE_KEY = 'js_rng_demo_save';   // 데모 버전: 예전 기록과 따로 새로 시작
const SOUND_KEY = 'js_rng_sound';

// 칭호 확률·판매가 계산
AURA_DATA.sort((a, b) => a.in - b.in);
for (const aura of AURA_DATA) {
    aura.chance = 100 / aura.in;
    let baseJc = Math.max(1, Math.floor(aura.in / 5));
    if (["MYTHIC", "ANCIENT", "ABSOLUTE", "JXS"].includes(aura.grade)) baseJc = Math.floor(baseJc * 0.5);
    if (["ANCIENT", "ABSOLUTE", "JXS"].includes(aura.grade)) baseJc = Math.floor(baseJc * 0.6);
    aura.jcValue = Math.max(1, baseJc);
}
const AURA_BY_ID = Object.fromEntries(AURA_DATA.map(a => [a.id, a]));
const SHOP_BY_ID = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));
const CRAFT_BY_ID = Object.fromEntries(CRAFT_ITEMS.map(i => [i.id, i]));

/* =========================================================
   🛠️ 작은 도우미
   ========================================================= */

const $ = id => document.getElementById(id);
const fmt = n => Number(n || 0).toLocaleString();
const gradeCol = g => `col-${g.toLowerCase()}`;

// 칭호 색 3개 (아우라 색 그대로)
function auraColors(aura) {
    const c = aura.fx?.colors || [aura.color];
    return [c[0], c[1] || c[0], c[2] || c[1] || c[0]];
}
function colorVars(c) { return `--c1:${c[0]};--c2:${c[1]};--c3:${c[2]};`; }

// 칭호 이름 (등급마다 다른 글자 연출: rarity.css 의 .nm-<등급>)
function auraNameHtml(aura) {
    return `<span class="nm nm-${aura.grade.toLowerCase()}" style="${colorVars(auraColors(aura))}">${aura.name}</span>`;
}

// 카드 테두리 (rarity.css 의 .fr-<등급>). JXS는 번개 SVG를 같이 넣음
function frameAttrs(grade, colors, unique) {
    return `class="fr fr-${grade.toLowerCase()}${unique ? ` fr-u-${unique}` : ''}" style="${colorVars(colors)}"`;
}
function boltSvg() {
    const edge = side => {
        // 테두리 한 변을 따라 지그재그
        let d = '', n = 7;
        const start = Math.random() * 40, len = 35 + Math.random() * 30;
        for (let i = 0; i <= n; i++) {
            const along = start + (len * i) / n, off = (Math.random() - 0.5) * 9;
            const [x, y] = side === 0 ? [along, off + 2] : side === 1 ? [98 + off, along] : side === 2 ? [100 - along, 98 + off] : [off + 2, 100 - along];
            d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
        }
        return `<path d="${d}"/>`;
    };
    return `<svg class="fr-bolts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${[0, 1, 2, 3].map(edge).join('')}</svg>`;
}
// 고유 테두리 장식
function voidCracks() {
    const crack = (x, y, a) => {
        let d = `M${x} ${y}`, px = x, py = y;
        for (let i = 0; i < 4; i++) { a += (Math.random() - 0.5) * 1.2; px += Math.cos(a) * 7; py += Math.sin(a) * 7; d += ` L${px.toFixed(1)} ${py.toFixed(1)}`; }
        return `<path d="${d}"/>`;
    };
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${crack(0, 20, 0.3)}${crack(100, 70, Math.PI - 0.3)}${crack(30, 100, -1.3)}${crack(80, 0, 1.9)}</svg>`;
}
function roseDeco() {
    const rose = (x, y) => `<g class="rose">${[0, 1, 2, 3].map(i => `<rect x="${x - 5 + i * 1.2}" y="${y - 5 + i * 1.2}" width="${10 - i * 2.4}" height="${10 - i * 2.4}" fill="hsl(350,100%,${30 + i * 9}%)" transform="rotate(${i * 22} ${x} ${y})"/>`).join('')}</g>`;
    const petal = x => `<rect class="petal" x="${x}" y="0" width="3" height="2" fill="#ff3d63"/>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${rose(4, 4)}${rose(96, 96)}${petal(20)}${petal(50)}${petal(75)}${petal(35)}</svg>`;
}
function sansDeco() {
    const bone = x => `<g class="bone"><rect x="${x}" y="82" width="2.4" height="16" fill="#fff"/><rect x="${x - 1}" y="80" width="2" height="3" fill="#fff"/><rect x="${x + 1.4}" y="80" width="2" height="3" fill="#fff"/></g>`;
    const heart = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'].map((row, r) => [...row].map((c, k) => c === '1' ? `<rect x="${4 + k * 1.1}" y="${5 + r * 1.1}" width="1.1" height="1.1" fill="#ff1a1a"/>` : '').join('')).join('');
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${[14, 30, 46, 62, 78, 90].map(bone).join('')}<g class="soul">${heart}</g><rect class="eye" x="90" y="5" width="4" height="4"/></svg>`;
}
function hadesDeco() {
    // 위아래 금빛 그리스 무늬(네모 소용돌이) + 바닥에서 피어오르는 푸른 불꽃
    let key = '';
    for (let x = 0; x < 100; x += 10) key += `<path d="M${x} 3 h8 v4 h-5 v-2 h2" fill="none" stroke="#c9a24a" stroke-width="1"/><path d="M${x} 97 h8 v-4 h-5 v2 h2" fill="none" stroke="#c9a24a" stroke-width="1"/>`;
    const flame = x => `<rect class="hf" x="${x}" y="78" width="3" height="14" fill="#5cf2ff"/>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${key}${[8, 22, 37, 52, 66, 80, 92].map(flame).join('')}</svg>`;
}
function pumpkinDeco() {
    // 아래엔 호박등 줄, 위엔 박쥐
    const pk = x => `<g class="pk"><rect x="${x}" y="84" width="9" height="8" fill="#ff7a1a"/><rect x="${x + 3.8}" y="82" width="1.4" height="2.4" fill="#3a8c2a"/><rect class="pkf" x="${x + 1.6}" y="86" width="1.8" height="1.6" fill="#ffe14d"/><rect class="pkf" x="${x + 5.6}" y="86" width="1.8" height="1.6" fill="#ffe14d"/><rect class="pkf" x="${x + 2}" y="89.3" width="5" height="1" fill="#ffe14d"/></g>`;
    const bat = (x, y) => `<g class="bt" style="--d:${(x % 7) * 0.2}s"><rect x="${x}" y="${y}" width="3" height="1.6" fill="#0a0410"/><rect class="w" x="${x - 3}" y="${y - 0.8}" width="3" height="1" fill="#0a0410"/><rect class="w" x="${x + 3}" y="${y - 0.8}" width="3" height="1" fill="#0a0410"/></g>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${[4, 30, 58, 86].map(pk).join('')}${bat(18, 8)}${bat(70, 12)}${bat(45, 5)}</svg>`;
}
function adminDeco() {
    // 위엔 ADMIN 콘솔 줄, 아래엔 금 왕관 셋
    const crown = x => `<g><rect x="${x}" y="88" width="10" height="3" fill="#ffd23a"/><rect x="${x}" y="84" width="2" height="4" fill="#ffd23a"/><rect x="${x + 4}" y="82.5" width="2" height="5.5" fill="#ffd23a"/><rect x="${x + 8}" y="84" width="2" height="4" fill="#ffd23a"/><rect class="cg" x="${x + 4.2}" y="88.6" width="1.6" height="1.6" fill="#ff3b5c"/></g>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="0" width="100" height="7" fill="rgba(255,210,58,0.85)"/><text x="3" y="5.4" font-size="5" font-family="monospace" font-weight="bold" fill="#1a1200">ADMIN CONSOLE</text><rect class="cur" x="88" y="1.6" width="2" height="4" fill="#1a1200"/>${[20, 45, 70].map(crown).join('')}</svg>`;
}
function creatorDeco() {
    // 무지개 블록이 테두리를 따라 하나씩 쌓임
    const cols = ['#ff5a8a', '#ffb02e', '#ffe14d', '#7dff6a', '#5ab0ff', '#b26bff'];
    let b = '';
    for (let i = 0; i < 12; i++) b += `<rect class="cb" style="--d:${i * 0.18}s" x="${4 + i * 8}" y="91" width="6" height="5" fill="${cols[i % 6]}"/>`;
    for (let i = 0; i < 6; i++) b += `<rect class="cb" style="--d:${1 + i * 0.25}s" x="${30 + i * 7}" y="3" width="4" height="3" fill="${cols[(i + 2) % 6]}"/>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${b}</svg>`;
}
function worldTreeDeco() {
    // 아래에서 덩굴이 자라 올라오고 잎이 하나씩 피어남
    let b = '';
    for (let i = 0; i < 10; i++) {
        const x = 3 + i * 10.5;
        b += `<rect class="wv" style="--d:${i * 0.22}s" x="${x}" y="84" width="1.6" height="13" fill="#3a7a3a"/>`;
        b += `<rect class="wl" style="--d:${0.6 + i * 0.22}s" x="${x - 2}" y="${84 + (i % 3) * 3}" width="4" height="3" fill="${i % 2 ? '#7dff9a' : '#ffe27a'}"/>`;
    }
    for (let i = 0; i < 5; i++) b += `<rect class="wl" style="--d:${1.4 + i * 0.3}s" x="${12 + i * 18}" y="2" width="5" height="3" fill="#7dff9a"/>`;
    return `<svg class="fr-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${b}</svg>`;
}
function frameDeco(grade, unique) {
    if (unique === 'creator') return creatorDeco();
    if (unique === 'worldtree') return worldTreeDeco();
    if (unique === 'admin') return adminDeco();
    if (unique === 'pumpkin') return pumpkinDeco();
    if (unique === 'void') return voidCracks();
    if (unique === 'hades') return hadesDeco();
    if (unique === 'sans') return sansDeco();
    if (unique === 'rose') return roseDeco();
    if (unique === 'voidpotion') return '';
    return grade === 'JXS' ? boltSvg() : '';
}

function addItems(items) {
    for (const id in items) gameState.itemInventory[id] = (gameState.itemInventory[id] || 0) + items[id];
}

/* ---------- 토스트 ---------- */
function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    const wrap = $('toast-wrap');
    while (wrap.children.length >= 2) wrap.firstChild.remove();
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
}

/* ---------- 확인 / 입력 다이얼로그 ---------- */
function ask({ title, message = '', input = false, text = false, value = '', okText = '확인', danger = false }) {
    return new Promise(resolve => {
        // text: true 면 글자 입력 칸(자기소개 등), 아니면 숫자 비밀번호 칸
        $('ask-input').classList.add('hidden'); $('ask-text').classList.add('hidden');
        const dlg = $('ask-dialog'), inp = text ? $('ask-text') : $('ask-input'), ok = $('ask-ok');
        if (text) input = true;
        $('ask-title').textContent = title;
        $('ask-msg').textContent = message;
        ok.textContent = okText;
        ok.className = `btn ${danger ? 'btn-red' : 'btn-primary'}`;
        inp.classList.toggle('hidden', !input);
        inp.value = value;
        dlg.classList.remove('hidden');
        if (input) setTimeout(() => inp.focus(), 50);

        const done = val => {
            dlg.classList.add('hidden');
            dlg.removeEventListener('click', onClick);
            inp.removeEventListener('keydown', onKey);
            resolve(val);
        };
        const onClick = e => {
            const act = e.target.dataset.ask;
            if (act === 'ok') done(input ? inp.value : true);
            else if (act === 'cancel' || e.target === dlg) done(input ? null : false);
        };
        const onKey = e => { if (e.key === 'Enter') done(inp.value); };
        dlg.addEventListener('click', onClick);
        inp.addEventListener('keydown', onKey);
    });
}

/* ---------- 수량 선택 다이얼로그 (판매/구매/사용 공용) ---------- */
const qty = { max: 1, min: 1, priceEach: 0, totalLabel: '', onConfirm: null };

function openQtyDialog({ title, sub = '', max, min = 1, initial, priceEach = 0, totalLabel = '', okText = '확인', onConfirm }) {
    Object.assign(qty, { max, min, priceEach, totalLabel, onConfirm });
    $('qty-title').textContent = title;
    $('qty-sub').textContent = sub;
    $('qty-confirm').textContent = okText;
    const slider = $('qty-slider');
    slider.min = min; slider.max = Math.max(min, max);
    setQty(initial ?? min);
    $('qty-dialog').classList.remove('hidden');
}

function setQty(v) {
    v = parseInt(v);
    if (isNaN(v)) v = qty.min;
    v = Math.min(qty.max, Math.max(qty.min, v));
    $('qty-slider').value = v;
    $('qty-input').value = v;
    $('qty-total').textContent = qty.priceEach ? `${qty.totalLabel} ${fmt(v * qty.priceEach)} JC` : '';
    return v;
}

$('qty-slider').addEventListener('input', e => setQty(e.target.value));
$('qty-input').addEventListener('change', e => setQty(e.target.value));
$('qty-dialog').addEventListener('click', async e => {
    const t = e.target;
    if (t.dataset.step) {
        const cur = parseInt($('qty-input').value) || qty.min;
        setQty(t.dataset.step === 'max' ? qty.max : cur + parseInt(t.dataset.step));
    } else if (t.dataset.qty === 'cancel' || t === $('qty-dialog')) {
        $('qty-dialog').classList.add('hidden');
    } else if (t.dataset.qty === 'ok') {
        const v = setQty($('qty-input').value);
        $('qty-dialog').classList.add('hidden');
        if (qty.onConfirm) await qty.onConfirm(v);
    }
});

/* =========================================================
   💾 상태 & 저장 (이 기기 localStorage)
   ========================================================= */

function createInitialGameState() {
    return {
        rolls: 0, luck: 1, jc: 0,
        inventory: {}, itemInventory: {}, discoveredAuras: [],
        autoDelete: {},
        activeBuffs: { luckBonus: 0, speedBonus: 0, luckExpireTime: 0, speedExpireTime: 0, luckLevel: 0, speedLevel: 0 },
        activeMultBuffs: [],
        gear: null, amulet: null, amuletStack: 0, craftedGears: [], usedCodes: [],
        petList: [], pet: null, eggs: {}, nests: [null, null, null],
        completedQuests: [], activeQuest: null, questProgress: {}, quickRollUnlocked: false,
        equippedAura: null
    };
}

let gameState = createInitialGameState();
let backupGameState = null;   // 개발자 모드 중 원본 보관
let nextRollOverride = null;

function saveGame() {
    if (backupGameState !== null) return;
    gameState.savedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
    const base = createInitialGameState();
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (saved) {
            gameState = { ...base, ...saved, activeBuffs: { ...base.activeBuffs, ...(saved.activeBuffs || {}) } };
        }
    } catch (e) { gameState = base; }
    for (const id in gameState.inventory) {
        if (!gameState.discoveredAuras.includes(id)) gameState.discoveredAuras.push(id);
    }
}

window.addEventListener('beforeunload', () => {
    if (backupGameState !== null) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(backupGameState));
    }
});

/* =========================================================
   🔊 사운드
   ========================================================= */

let soundSettings = { enabled: true, master: 1.0, bgm: 0.7, cutscene: 0.5, click: 1.0, roll: 1.0 };
try { soundSettings = { ...soundSettings, ...JSON.parse(localStorage.getItem(SOUND_KEY) || '{}') }; } catch (e) {}
const saveSoundSettings = () => localStorage.setItem(SOUND_KEY, JSON.stringify(soundSettings));

const audioFiles = {
    click: new Audio('click.mp3'),
    dropLegend: new Audio('drop_legend.mp3'),
    dropMythic: new Audio('drop_mythic.mp3'),
    divine_all: new Audio('divine_full.mp3'),
    cosmic_all: new Audio('cosmic_full.mp3'),
    js_all: new Audio('js_full.mp3')
};
const music = createMusicPlayer({
    getVolume: () => soundSettings.master * soundSettings.bgm,
    isEnabled: () => soundSettings.enabled,
    // 유튜브 곡 목록은 게임 저장에 넣음 → 로그인하면 다른 기기에서도 그대로
    onYtChange: list => { gameState.ytTracks = list; saveGame(); },
    onYtError: (code, t) => toast(code === 101 || code === 150 ? `▶ 「${t?.title || '영상'}」은(는) 유튜브에서 다른 사이트 재생을 막아 둔 영상이에요` : '▶ 유튜브 영상을 못 틀었어요', 'bad'),
    pip: { box: document.getElementById('yt-pip'), host: 'yt-host' }
});
function updateBgmVolume() { music.updateVolume(); }
function playBgm(type) { music.start(type); }
function stopBgm() {
    music.stop();
}

let audioCtx = null;
function initSynthAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(freq, type, vol, attack, release) {
    if (!soundSettings.enabled) return;
    try {
        initSynthAudio();
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        const t = audioCtx.currentTime;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(soundSettings.master * vol, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, t + attack + release);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(t + attack + release);
    } catch (e) {}
}
const playRollTick = () => playTone(150, 'triangle', 0.15 * soundSettings.roll, 0.01, 0.08);
const playNormalDrop = () => playTone(600, 'sine', 0.2 * soundSettings.cutscene, 0.02, 0.4);

function playClip(key, volume) {
    if (!soundSettings.enabled || !audioFiles[key]) return null;
    const clip = audioFiles[key].cloneNode();
    clip.volume = volume;
    clip.play().catch(() => {});
    return clip;
}

function playDropSound(grade) {
    const vol = soundSettings.master * soundSettings.cutscene;
    if (grade === "MYTHIC") playClip('dropMythic', vol);
    else if (grade === "LEGEND") playClip('dropLegend', vol);
    else if (!CUTSCENE_GRADES.includes(grade)) playNormalDrop();
}

let cutsceneAudio = null;
function stopCutsceneAudio() {
    if (cutsceneAudio) { cutsceneAudio.pause(); cutsceneAudio = null; }
}

document.body.addEventListener('click', () => {
    initSynthAudio();
    music.unlock();
}, { once: true });

document.body.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn && btn.id !== 'roll-btn' && btn.id !== 'skip-cutscene-btn') {
        playClip('click', soundSettings.master * soundSettings.click);
    }
});

/* =========================================================
   🍀 행운 / 속도 계산
   ========================================================= */

// 뽑기 장비 강화: 중복으로 나오면 +1 (최대 +5), 강화마다 효과 +10%
const GEAR_LV_MAX = 5;
const gearLv = id => (gameState.gearLv || {})[id] || 0;
function gearOf(id) {
    const g = CRAFT_BY_ID[id];
    if (!g) return null;
    const lv = gearLv(id);
    if (!lv) return g;
    const k = 1 + 0.1 * lv, r1 = v => v ? Math.round(v * k * 100) / 100 : v;
    return { ...g, lv, luckBonus: r1(g.luckBonus), speedBonus: r1(g.speedBonus), amuletMult: r1(g.amuletMult), biomeBoost: r1(g.biomeBoost), jcBonusMax: g.jcBonusMax ? Math.round(g.jcBonusMax * k) : g.jcBonusMax };
}
const lvTag = g => g?.lv ? ` <span class="gear-lv">+${g.lv}</span>` : '';
// 🆕 능력 부적 (장착한 부적의 값)
const amu = () => gearOf(gameState.amulet) || {};
const sellMult = () => amu().sellMult || 1;
function streakMult() { const a = amu(); return a.abil === 'streak' ? 1 + Math.min(a.streakMax, (gameState.streak || 0) * a.streakRate) : 1; }
function abilText(g) {
    if (g.abil === 'streak') return `롤마다 행운 +${Math.round(g.streakRate * 100)}% 누적 (최대 +${Math.round(g.streakMax * 100)}%) · EPIC↑ 나오면 초기화`;
    if (g.abil === 'twin') return `${Math.round(g.twinChance * 100)}% 확률로 칭호 하나 더`;
    if (g.abil === 'sell') return `판매가 +${Math.round((g.sellMult - 1) * 100)}% · 신전 수입 +${Math.round((g.showMult - 1) * 100)}%`;
    if (g.abil === 'hatch') return `부화 시간 -${Math.round(g.hatchCut * 100)}% · 펫 효과 +${Math.round((g.petMult - 1) * 100)}%`;
    if (g.abil === 'brew') return `배수 물약 ${Math.round(g.brewSave * 100)}% 확률로 안 닳음 · 시간 물약 ×${g.brewTime}`;
    return '';
}
function getGear() { return gameState.gear ? gearOf(gameState.gear) : null; }
function getAmuletMult() {
    if (gameState.amulet === "amulet_drum") return 2;
    if (gameState.amulet === "amulet_commander") return 5;
    return gearOf(gameState.amulet)?.amuletMult || 0;
}
// 부적이 몇 롤마다 터지는지
function getAmuletEvery() { return CRAFT_BY_ID[gameState.amulet]?.amuletEvery || 10; }
function getMultBonus() {
    return (gameState.activeMultBuffs || []).reduce((s, b) => s + b.bonus, 0);
}
// 펫 저장 칸 정리 (예전 레벨 방식 저장도 1성 여러 마리로 바꿔 줌)
function petState() {
    const g = gameState;
    if (!Array.isArray(g.petList) || (g.pets && typeof g.pets === 'object')) {
        if (!Array.isArray(g.petList)) g.petList = [];
        const old = g.pets || {}, oldOn = g.pet;
        g.pet = null;
        for (const [id, lv] of Object.entries(old)) for (let i = 0; i < lv; i++) {
            const u = newPetUid(); g.petList.push({ u, id, s: 1 });
            if (id === oldOn && !g.pet) g.pet = u;
        }
        delete g.pets;
    }
    g.eggs = g.eggs || {};
    if (!Array.isArray(g.nests)) g.nests = [null, null, null];
    return g;
}
const newPetUid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const petOn = () => petState().petList.find(p => p.u === gameState.pet) || null;
// 데리고 다니는 펫 효과 (성이 높을수록 커짐)
function getPetBonus() {
    const on = petOn(), p = on && PET_BY_ID[on.id];
    if (!p) return { luck: 0, speed: 0 };
    const m = starMult(on.s) * (amu().petMult || 1);
    return { luck: (p.luck || 0) * m, speed: (p.speed || 0) * m };
}
function petEffectText(p, star) {
    const m = starMult(star);
    return [p.luck ? `행운 +${Math.round(p.luck * m * 100)}%` : '', p.speed ? `속도 +${Math.round(p.speed * m * 100)}%` : ''].filter(Boolean).join(' · ');
}
function getSpeedBonus() {
    return (gameState.activeBuffs.speedBonus || 0) + (getGear()?.speedBonus || 0) + getSetBonus().speed + getPetBonus().speed;
}
function getBaseLuck() {
    return (gameState.luck + (getGear()?.luckBonus || 0) + (amu().luckBonus || 0) + (gameState.activeBuffs.luckBonus || 0) + getSetBonus().luck + getPetBonus().luck) * getEnvLuck() * streakMult();
}
// 바이옴 배수 + 관리자 배수는 곱하지 않고 더함 (×10 바이옴 + ×10 관리자 = ×20)
function getEnvLuck() {
    const m = [getBiome()?.luck || 1, getAdminLuck()].filter(v => v > 1);
    return m.length ? m.reduce((a, b) => a + b, 0) : 1;
}
// 화면 표시용 (다음 롤 기준)
function getDisplayLuck() {
    let luck = getBaseLuck();
    const am = getAmuletMult();
    if (am && gameState.amuletStack >= getAmuletEvery()) luck *= am;
    return luck + getMultBonus();
}

/* =========================================================
   🎲 뽑기
   ========================================================= */

let isRolling = false, isAutoRolling = false, isQuickRollActive = false;
let resultSettleTimer = 0;

const workerBlob = new Blob([`
    let timer = null;
    self.onmessage = e => {
        if (e.data.command === 'start') { clearInterval(timer); timer = setInterval(() => self.postMessage('tick'), e.data.interval || 100); }
        else { clearInterval(timer); timer = null; }
    };
`], { type: 'application/javascript' });
const autoWorker = new Worker(URL.createObjectURL(workerBlob));
autoWorker.onmessage = e => { if (e.data === 'tick' && isAutoRolling && !isRolling) startRoll(); };
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isAutoRolling && !isRolling) startRoll();
});

function trackQuestProgress(type, amount = 1) {
    const qId = gameState.activeQuest;
    if (!qId) return;
    if (!gameState.questProgress[qId]) gameState.questProgress[qId] = {};
    gameState.questProgress[qId][type] = (gameState.questProgress[qId][type] || 0) + amount;
}

function startRoll() {
    if (isRolling) return;
    isRolling = true;
    ui.rollBtn.disabled = true;
    ui.rollBtn.classList.remove('cooldown-active');
    gameState.rolls++;
    trackQuestProgress("rolls");
    passAddXp(1);
    renderStats();
    saveGame();

    stage3d?.setRolling(true);
    if (isQuickRollActive && gameState.quickRollUnlocked) { finishRoll(); return; }

    const maxTime = Math.max(400, 1200 * (1 - getSpeedBonus()));
    const step = 60;
    let elapsed = 0;
    const timer = setInterval(() => {
        playRollTick();
        const fake = AURA_DATA[Math.floor(Math.random() * AURA_DATA.length)];
        ui.display.innerHTML = `<div class="rolling-text result-name">${auraNameHtml(fake)}</div>`;
        elapsed += step;
        if (elapsed >= maxTime) { clearInterval(timer); finishRoll(); }
    }, step);
}

function pickAura() {
    if (nextRollOverride) {
        const forced = AURA_BY_ID[nextRollOverride];
        nextRollOverride = null;
        if (forced) return forced;
    }

    let baseLuck = getBaseLuck();
    const am = getAmuletMult();
    if (am) {
        if (gameState.amuletStack >= getAmuletEvery()) { baseLuck *= am; gameState.amuletStack = 0; }
        else gameState.amuletStack = (gameState.amuletStack || 0) + 1;
    }

    const multBonus = getMultBonus();
    const totalLuck = baseLuck + multBonus;

    // 솔스 RNG 방식: 가장 희귀한 칭호부터 '행운 ÷ N' 확률로 판정.
    // 배수 물약은 행운만 크게 올려 줌 → 희귀 칭호 확률이 행운만큼 올라가고,
    // 행운보다 흔한 칭호 중 가장 희귀한 것이 바닥(보장)이 됨.
    // (예전엔 행운보다 흔한 칭호를 통째로 빼서 특정 칭호 하나만 쏟아지던 버그)
    // 배수 물약을 쓴 롤: 모든 칭호 확률(1/N)에 배율을 곱함.
    // 배율보다 흔한 칭호(N ≤ 배율)는 아예 안 나오고, 나머지는 '배율 ÷ N' 비율로 한 번에 뽑음.
    // (확률 합이 1보다 작으면 남는 몫은 배율 바로 아래 칭호가 가져감)
    // 바이옴과 어울리는 칭호는 확률 ×boost (N을 boost로 나눈 것과 같음)
    const biome = getBiome();
    // 바이옴 전용 칭호(a.biome)는 그 바이옴일 때만 나옴
    const effIn = a => a.pass || (a.biome && a.biome !== biome?.id) ? Infinity : biome && biome.auras.includes(a.id) ? a.in / biome.boost : a.in;
    if (multBonus > 0) {
        const pool = AURA_DATA.filter(a => effIn(a) > totalLuck && isFinite(effIn(a)));
        const sum = pool.reduce((s, a) => s + totalLuck / effIn(a), 0);
        let r = Math.random() * Math.max(1, sum);
        for (const a of pool) { r -= totalLuck / effIn(a); if (r <= 0) return a; }
        for (let i = AURA_DATA.length - 1; i >= 0; i--) if (effIn(AURA_DATA[i]) <= totalLuck) return AURA_DATA[i];
        return AURA_DATA[0];
    }
    for (let i = AURA_DATA.length - 1; i >= 0; i--) {
        if (Math.random() < totalLuck / effIn(AURA_DATA[i])) return AURA_DATA[i];
    }
    return AURA_DATA[0];
}

async function finishRoll() {
    const rolled = pickAura();

    const gradeKey = rolled.grade.toLowerCase();
    if (["legend", "mythic", "ancient", "absolute"].includes(gradeKey)) trackQuestProgress(gradeKey);
    // RARE 이상 / EPIC 이상 개수 (퀘스트용)
    const gi = GRADES.indexOf(rolled.grade);
    if (gi >= 1) trackQuestProgress("rare");
    if (gi >= 2) trackQuestProgress("epic");

    if (gameState.activeMultBuffs.length) {
        const save = amu().abil === 'brew' ? amu().brewSave : 0;
        gameState.activeMultBuffs.forEach(b => { if (!(save && Math.random() < save)) b.uses--; });
        gameState.activeMultBuffs = gameState.activeMultBuffs.filter(b => b.uses > 0);
    }

    const isNew = !gameState.discoveredAuras.includes(rolled.id);
    if (isNew) { gameState.discoveredAuras.push(rolled.id); setBonusCache = null; announceSetDone(rolled.id); }

    if (['ANCIENT', 'ABSOLUTE', 'JXS'].includes(rolled.grade)) broadcastRare(rolled);   // 접속한 모두에게 알림
    if (CUT_CFG[rolled.grade] && stage3d) {
        await playCinematic(rolled);
    } else if (CUTSCENE_GRADES.includes(rolled.grade)) {
        // 3D를 못 쓰는 기기: 소리 + 화면 가장자리 빛만
        playClip(CUT_CFG[rolled.grade].sound, soundSettings.master * soundSettings.cutscene);
        playShakeGlow(rolled);
    } else if (rolled.grade === "LEGEND" || rolled.grade === "MYTHIC") {
        playShakeGlow(rolled);
        setTimeout(() => playDropSound(rolled.grade), 50);
    }

    music.unduck();

    let soldHtml = "";
    const jcBonus = CRAFT_BY_ID[gameState.amulet]?.jcBonus;
    if (jcBonus) gameState.jc += Math.min(gearOf(gameState.amulet).jcBonusMax || Infinity, Math.max(1, Math.floor(rolled.jcValue * jcBonus)));
    // 쌍둥이 별 부적: 가끔 하나 더
    const twins = amu().abil === 'twin' && Math.random() < amu().twinChance ? 2 : 1;
    if (gameState.autoDelete[rolled.grade]) {
        const got = Math.floor(rolled.jcValue * sellMult()) * twins;
        gameState.jc += got;
        soldHtml = `<div class="result-sold">자동 판매 +${fmt(got)} JC${twins > 1 ? ' · ✨ 쌍둥이!' : ''}</div>`;
    } else {
        gameState.inventory[rolled.id] = (gameState.inventory[rolled.id] || 0) + twins;
        if (twins > 1) soldHtml = `<div class="result-sold">✨ 쌍둥이 별! 하나 더 받았어요</div>`;
    }
    // 인내의 모래시계: EPIC 이상이면 초기화, 아니면 쌓임
    if (amu().abil === 'streak') gameState.streak = GRADES.indexOf(rolled.grade) >= 2 ? 0 : (gameState.streak || 0) + 1;
    saveGame();
    renderStats();

    stage3d?.setRolling(false);
    ui.display.innerHTML = `
        <div class="result-pop" style="--res:${rolled.color}">
            <div class="result-grade ${gradeCol(rolled.grade)}">${rolled.grade}${isNew ? '<span class="new-tag">NEW</span>' : ''}</div>
            <div class="result-name">${auraNameHtml(rolled)}</div>
            <div class="result-chance">1 in ${fmt(rolled.in)}</div>
            ${soldHtml}
        </div>`;

    // 결과를 잠깐 크게 보여 줬다가 작게 물러나게
    document.body.classList.add('result-fresh');
    clearTimeout(resultSettleTimer);
    const pop = ui.display.querySelector('.result-pop');
    resultSettleTimer = setTimeout(() => { pop?.classList.add('settled'); document.body.classList.remove('result-fresh'); }, HIGH_GRADES.includes(rolled.grade) ? 4000 : 2200);

    const cooldown = Math.max(300, (isAutoRolling ? 2000 : 1000) * (1 - getSpeedBonus()));
    ui.rollBtn.classList.remove('cooldown-active');
    void ui.cooldownBar.offsetWidth;
    ui.cooldownBar.style.animationDuration = `${cooldown}ms`;
    ui.rollBtn.classList.add('cooldown-active');

    setTimeout(() => {
        ui.rollBtn.classList.remove('cooldown-active');
        ui.rollBtn.disabled = false;
        isRolling = false;
        renderStats();
        if (isAutoRolling) startRoll();
    }, cooldown);
}

/* ---------- 3D 컷씬 ----------
   사운드 길이와 터지는 지점에 맞춤 (ffprobe로 잰 값)
     divine_full.mp3  19.6초, 9.5초에 쾅
     cosmic_full.mp3  18.6초, 10.25초에 쾅
     js_full.mp3      22.8초, 9.5초에 1차 / 16초에 2차 클라이맥스
   MYTHIC은 솔스처럼 짧은 별 뽑기 (등장음은 터질 때)
*/
const CUT_CFG = {
    MYTHIC:   { tier: 'MYTHIC',   hit: 2.3,  total: 4.4,  sound: null },
    ANCIENT:  { tier: 'ANCIENT',  hit: 9.5,  total: 19.6, sound: 'divine_all' },
    ABSOLUTE: { tier: 'ABSOLUTE', hit: 10.25, total: 18.6, sound: 'cosmic_all' },
    JXS:      { tier: 'JXS',      hit: 9.5,  hit2: 16.0, total: 22.8, sound: 'js_all' }
};

const cine = {
    el: $('cine'),
    flash: document.querySelector('.cine-flash'),
    crack: document.querySelector('.cine-crack'),
    title: document.querySelector('.cine-title'),
    grade: document.querySelector('.cine-grade'),
    name: document.querySelector('.cine-name'),
    chance: document.querySelector('.cine-chance'),
    line: document.querySelector('.cine-line'),
    skip: document.querySelector('.cine-skip')
};

// 짧은 상승음 (MYTHIC 별 뽑기용)
function playRiser(sec) {
    if (!soundSettings.enabled) return;
    try {
        initSynthAudio();
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + sec);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.08 * soundSettings.master * soundSettings.cutscene, t + sec * 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + sec);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(t + sec);
    } catch (e) {}
}

// 화면 깨짐: 터진 지점에서 사방으로 금
function drawCrack(color) {
    const cx = 50 + (Math.random() - 0.5) * 8, cy = 40 + (Math.random() - 0.5) * 8;
    let paths = '';
    for (let i = 0; i < 14; i++) {
        let a = (i / 14) * Math.PI * 2 + Math.random() * 0.3, x = cx, y = cy, d = `M${x} ${y}`;
        for (let k = 0; k < 6; k++) {
            a += (Math.random() - 0.5) * 0.7;
            const len = 6 + Math.random() * 12;
            x += Math.cos(a) * len; y += Math.sin(a) * len;
            d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        paths += `<path d="${d}"/>`;
    }
    let rings = '';
    for (let r = 6; r < 40; r += 9 + Math.random() * 6) {
        const pts = Array.from({ length: 9 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2, rr = r * (0.8 + Math.random() * 0.4);
            return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
        }).join(' ');
        rings += `<polyline points="${pts}"/>`;
    }
    cine.crack.innerHTML = `<g stroke="${color}" fill="none" stroke-width="0.35" vector-effect="non-scaling-stroke">${paths}${rings}</g>`;
    cine.crack.classList.remove('show'); void cine.crack.getBoundingClientRect(); cine.crack.classList.add('show');
}

function cineFlash(strong) {
    cine.flash.classList.remove('go', 'strong');
    void cine.flash.offsetWidth;
    cine.flash.classList.add('go');
    if (strong) cine.flash.classList.add('strong');
}

async function playCinematic(rolled) {
    const cfg = CUT_CFG[rolled.grade];
    const finalHit = cfg.hit2 || cfg.hit;

    // 칭호 공개 글자 준비
    cine.grade.textContent = rolled.grade;
    cine.grade.className = `cine-grade ${gradeCol(rolled.grade)}`;
    cine.name.innerHTML = auraNameHtml(rolled);
    cine.chance.textContent = `1 in ${fmt(rolled.in)}`;
    cine.line.textContent = rolled.line || '';
    cine.el.className = `tier-${cfg.tier.toLowerCase()}`;
    cine.title.classList.remove('show', 'pre');
    cine.crack.classList.remove('show');
    document.body.classList.add('cine-on');
    music.duck();

    // 시계 (사운드와 같이 감)
    const t0 = performance.now();
    let offset = 0;
    const getTime = () => (performance.now() - t0) / 1000 + offset;

    stopCutsceneAudio();
    if (cfg.sound) cutsceneAudio = playClip(cfg.sound, soundSettings.master * soundSettings.cutscene);
    else playRiser(cfg.hit);

    let done = false;
    const onSkip = () => {
        const now = getTime();
        if (now < finalHit - 0.3) {
            // 터지는 순간 바로 앞으로 건너뜀
            offset += (finalHit - 0.25) - now;
            if (cutsceneAudio) cutsceneAudio.currentTime = finalHit - 0.25;
        } else {
            offset += cfg.total - now;   // 바로 끝
        }
    };
    cine.skip.addEventListener('click', onSkip);

    // 화면 효과 (섬광, 깨짐, 글자)를 시간에 맞춰
    const fired = {};
    const loop = () => {
        if (done) return;
        const t = getTime();
        if (!fired.hit && t >= cfg.hit) {
            fired.hit = true;
            cineFlash(true);
            if (cfg.tier === 'MYTHIC') playDropSound('MYTHIC');
            if (cfg.tier === 'ABSOLUTE' || (cfg.tier === 'JXS' && !cfg.hit2)) drawCrack('#ffffff');
            if (cfg.hit2) { drawCrack(rolled.color); cine.title.classList.add('pre'); }
        }
        if (cfg.hit2 && !fired.hit2 && t >= cfg.hit2) {
            fired.hit2 = true;
            cineFlash(true);
            drawCrack('#ffffff');
            cine.title.classList.remove('pre');
        }
        if (!fired.title && t >= finalHit + 0.35) {
            fired.title = true;
            cine.title.classList.add('show');
        }
        if (!fired.out && t >= cfg.total - 0.7) {
            fired.out = true;
            cine.el.classList.add('closing');
        }
        requestAnimationFrame(loop);
    };
    cine.el.classList.remove('hidden');
    requestAnimationFrame(loop);

    await stage3d.playCutscene(rolled, cfg, getTime);

    done = true;
    cine.skip.removeEventListener('click', onSkip);
    if (cutsceneAudio && getTime() < cfg.total - 0.5) {
        // 건너뛰어서 일찍 끝났으면 소리를 부드럽게 줄임
        const a = cutsceneAudio, v0 = a.volume;
        let k = 0;
        const fade = setInterval(() => { k += 0.1; a.volume = Math.max(0, v0 * (1 - k)); if (k >= 1) { clearInterval(fade); a.pause(); } }, 40);
    }
    cine.el.classList.add('hidden');
    cine.el.classList.remove('closing');
    document.body.classList.remove('cine-on');
}

/* ---------- 연출 ---------- */
function playShakeGlow(rolled) {
    stage3d?.shake(CUTSCENE_GRADES.includes(rolled.grade) ? 0.6 : 0.35);
    ui.glowOverlay.style.boxShadow = `inset 0 0 70px 25px ${rolled.color || "#f1c40f"}`;
    ui.glowOverlay.classList.remove('hidden');
    setTimeout(() => { ui.glowOverlay.classList.add('hidden'); }, 1500);
}

/* =========================================================
   🖥️ UI 참조
   ========================================================= */

const ui = {
    rollCount: $('roll-count'), jcCount: $('jc-count'),
    luck: $('luck-multiplier'), speed: $('speed-multiplier'), buffs: $('active-buffs'),
    display: $('aura-display'), stage: document.querySelector('.stage'),
    rollBtn: $('roll-btn'), btnSub: $('btn-sub-text'), cooldownBar: $('cooldown-bar'),
    autoBtn: $('auto-roll-btn'), quickBtn: $('quick-roll-btn'),
    glowOverlay: $('border-glow-overlay'),
    inventoryGrid: $('inventory-grid'), potionGrid: $('potion-grid'),
    craftGrid: $('craft-grid'), shopGrid: $('shop-grid'), questList: $('quest-list'),
    indexGrid: $('index-grid'), indexProgress: $('index-progress'),
    autoSellGrid: $('auto-sell-grid'), gradeTable: $('grade-table'),
    mainDevBtn: $('main-dev-btn')
};

/* =========================================================
   🎨 렌더링
   ========================================================= */

function setNum(el, text) {
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}

function renderStats() {
    setNum(ui.rollCount, fmt(gameState.rolls));
    setNum(ui.jcCount, fmt(gameState.jc));
    ui.luck.textContent = fmt(Math.round(getDisplayLuck() * 100) / 100);
    ui.speed.textContent = (1 + getSpeedBonus()).toFixed(2);

    const am = getAmuletMult();
    ui.btnSub.classList.toggle('hidden', !am);
    if (am) {
        const every = getAmuletEvery();
        ui.btnSub.textContent = gameState.amuletStack >= every ? `다음 롤 행운 ×${am}!` : `부적 ${gameState.amuletStack} / ${every}`;
        ui.btnSub.style.color = gameState.amuletStack >= every ? 'var(--gold)' : '';
    }
}

function renderBuffs() {
    const now = Date.now();
    const b = gameState.activeBuffs;
    const pills = [];
    if (b.luckExpireTime > now) pills.push(`<span class="buff">행운 물약 ${b.luckLevel}  ${Math.ceil((b.luckExpireTime - now) / 1000)}s</span>`);
    if (b.speedExpireTime > now) pills.push(`<span class="buff">속도 물약 ${b.speedLevel}  ${Math.ceil((b.speedExpireTime - now) / 1000)}s</span>`);
    gameState.activeMultBuffs.forEach(m => pills.push(`<span class="buff mult">${m.name} ×${m.uses}</span>`));
    if (adminLuck.until > now) { const s = Math.ceil((adminLuck.until - now) / 1000); pills.unshift(`<span class="buff admin">👑 어드민 행운 ×${fmt(adminLuck.mult)}  ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</span>`); }
    const gear = getGear();
    if (gear) pills.push(`<span class="buff gear">${gear.name}</span>`);
    if (gameState.amulet) pills.push(`<span class="buff gear">${CRAFT_BY_ID[gameState.amulet]?.name || ''}</span>`);
    // 숫자(남은 시간)만 바뀐 거면 글자만 고침 → 알약이 매초 새로 생기며 튀어나오지 않게
    const sig = pills.map(p => p.replace(/[\d:,]/g, '')).join('|');
    if (ui.buffs.dataset.sig === sig && ui.buffs.children.length === pills.length) {
        pills.forEach((p, i) => { const t = p.replace(/<[^>]+>/g, ''); if (ui.buffs.children[i].textContent !== t) ui.buffs.children[i].textContent = t; });
        return;
    }
    ui.buffs.dataset.sig = sig;
    ui.buffs.innerHTML = pills.join('');
}

function renderRollToggles() {
    ui.autoBtn.classList.toggle('active', isAutoRolling);
    ui.autoBtn.textContent = 'AUTO';
    ui.quickBtn.disabled = !gameState.quickRollUnlocked;
    ui.quickBtn.classList.toggle('active', isQuickRollActive);
    ui.quickBtn.textContent = gameState.quickRollUnlocked ? 'QUICK' : 'QUICK 🔒';
}

function gradeHeader(grade, extra = '') {
    return `<div class="grade-header ${gradeCol(grade)}">${grade}${extra ? ` <span class="count">${extra}</span>` : ''}</div>`;
}

function renderInventory() {
    let html = '';
    for (const grade of GRADES) {
        const owned = AURA_DATA.filter(a => a.grade === grade && gameState.inventory[a.id]);
        if (!owned.length) continue;
        html += gradeHeader(grade);
        for (const a of owned) {
            const on = gameState.equippedAura === a.id;
            html += `
            <button type="button" ${frameAttrs(a.grade, auraColors(a), a.frame).replace('class="', `class="card bag-card ${on ? 'is-on' : ''} `)} data-aura="${a.id}">${frameDeco(a.grade, a.frame)}
                ${on ? '<span class="eq-tag">장착 중</span>' : ''}
                <div class="card-name">${auraNameHtml(a)}</div>
                <div class="card-have">×${fmt(gameState.inventory[a.id])}</div>
            </button>`;
        }
    }
    ui.inventoryGrid.classList.add('card-grid');
    ui.inventoryGrid.innerHTML = html || `<div class="empty">아직 칭호가 없습니다.<br>ROLL로 첫 칭호를 뽑아 보세요.</div>`;
}

function renderPotions() {
    const ids = Object.keys(gameState.itemInventory).filter(id => SHOP_BY_ID[id] && gameState.itemInventory[id] > 0);
    ui.potionGrid.classList.add('row-list');
    ui.potionGrid.innerHTML = ids.length ? ids.map(id => {
        const item = SHOP_BY_ID[id];
        return `
        <div ${frameAttrs(item.frame, [item.color, item.color2 || item.color, item.color], item.unique).replace('class="', 'class="row ')}>${frameDeco(item.frame, item.unique)}
            ${vialHtml(item)}
            <div class="row-main">
                <div class="row-name">${item.name}</div>
                <div class="row-desc">${item.desc}</div>
            </div>
            <div class="row-side">
                <div class="row-have">×${fmt(gameState.itemInventory[id])}</div>
                <button class="btn btn-sm btn-green" data-use="${id}">사용</button>
            </div>
        </div>`;
    }).join('') : `<div class="empty">물약이 없습니다.<br>상점에서 구매할 수 있어요.</div>`;
}

// 네모 물약병 아이콘
function vialHtml(item) {
    return `<div class="vial" style="--c1:${item.color};--c2:${item.color2 || item.color}"><i class="vial-neck"></i><i class="vial-body"><i class="vial-liquid"></i></i></div>`;
}

let craftTab = "gauntlet";
const AMULET_MULT = { amulet_drum: 2, amulet_commander: 5 };
// 제작창 3D 미리보기 (three.js 가 준비된 뒤에 불러옴)
let gearPreviews = null, gearPreviewLoading = false, gearPreviewRoot = null;
function attachGearPreviews(root = ui.craftGrid) {
    gearPreviewRoot = root;
    if (gearPreviews) { gearPreviews.attach(root); return; }
    if (gearPreviewLoading || !stage3d) return;
    gearPreviewLoading = true;
    import('./gearPreview.js?v=51').then(({ createGearPreviews }) => {
        gearPreviews = createGearPreviews(stage3d.getRenderer());
        if (gearPreviewRoot?.isConnected && gearPreviewRoot.offsetParent) gearPreviews.attach(gearPreviewRoot);
    }).catch(err => console.warn('장비 미리보기를 켤 수 없어요', err));
}

function renderCraft() {
    const items = CRAFT_ITEMS.filter(g => (g.category || "gauntlet") === craftTab);
    ui.craftGrid.classList.add('list');
    // 제작템 먼저, 뽑기 전용은 아래에
    items.sort((a, b) => !!a.gacha - !!b.gacha);
    ui.craftGrid.innerHTML = items.map(gear => {
        const equipped = gear.category === "amulet" ? gameState.amulet === gear.id : gameState.gear === gear.id;
        const owned = gameState.craftedGears.includes(gear.id);
        let canCraft = true, metN = 0, reqN = 0;
        let reqHtml = '';
        if (!owned && !gear.gacha) {
            for (const reqId in gear.req) {
                const a = AURA_BY_ID[reqId];
                const need = gear.req[reqId], have = gameState.inventory[reqId] || 0;
                const met = have >= need;
                reqN++; if (met) metN++; else canCraft = false;
                reqHtml += `
                <div class="creq ${met ? 'met' : ''}">
                    <i class="creq-dot" style="background:${a ? a.color : '#888'}"></i>
                    <span class="creq-name">${a ? a.name : reqId}</span>
                    <span class="creq-num">${fmt(Math.min(have, need))}<small>/${fmt(need)}</small></span>
                    <div class="creq-bar"><div style="width:${Math.min(100, have / need * 100)}%"></div></div>
                </div>`;
            }
        }
        const chips = [];
        if (gear.luckBonus) chips.push(`<span class="chip luck">행운 +${Math.round(gear.luckBonus * 100)}%</span>`);
        if (gear.speedBonus) chips.push(`<span class="chip speed">속도 +${Math.round(gear.speedBonus * 100)}%</span>`);
        if (AMULET_MULT[gear.id]) chips.push(`<span class="chip amulet">10롤마다 행운 ×${AMULET_MULT[gear.id]}</span>`);
        if (gear.amuletMult) chips.push(`<span class="chip amulet">${gear.amuletEvery || 10}롤마다 행운 ×${gear.amuletMult}</span>`);
        if (gear.biomeBoost) chips.push(`<span class="chip biome">바이옴 ×${gear.biomeBoost} · 지속 ×${gear.biomeTime}</span>`);
        if (gear.gacha) chips.push(`<span class="chip gacha">${gear.gacha === 'halloween' ? '🎃 할로윈 한정' : gear.gacha === 'pass' ? '🎫 시즌 패스 PRO' : '뽑기 전용'}</span>`);
        if (gear.jcBonus) chips.push(`<span class="chip amulet">롤마다 판매가 ${Math.round(gear.jcBonus * 100)}% JC (최대 ${fmt(gear.jcBonusMax)})</span>`);
        if (gear.abil) chips.push(`<span class="chip abil">✦ ${abilText(gear)}</span>`);
        const state = equipped ? '<span class="cstate on">장착 중</span>' : owned ? '<span class="cstate owned">보유</span>' : gear.gacha ? '<span class="cstate">미보유</span>' : `<span class="cstate">${metN}/${reqN}</span>`;
        const btn = owned
            ? `<button class="btn btn-block" data-gotobag="${gear.category}">가방에서 ${equipped ? '해제' : '장착'}</button>`
            : gear.gacha === 'pass'
                ? `<button class="btn btn-block" data-gotopass>시즌 패스 PRO 15레벨 보상</button>`
            : gear.gacha
                    ? (gear.gacha === 'halloween' && !isHalloween()
                        ? `<button class="btn btn-block" disabled>할로윈 이벤트 종료</button>`
                        : `<button class="btn btn-block" data-gotogacha="${gear.gacha === 'halloween' ? 'halloween' : 'gacha'}">${gear.gacha === 'halloween' ? '할로윈 뽑기에서 얻기' : '상점 뽑기에서 얻기'}</button>`)
                    : `<button class="btn btn-block btn-gold" data-craft="${gear.id}" ${canCraft ? '' : 'disabled'}>${canCraft ? '제작하기' : '재료 부족'}</button>`;
        return `
        <div class="craft-card ${equipped ? 'equipped' : ''} ${owned ? 'owned' : ''}">
            <div class="craft-top">
                <div class="craft-view"><canvas data-gear="${gear.id}" aria-hidden="true"></canvas>${state}</div>
                <div class="craft-info">
                    <div class="craft-name">${gear.name}</div>
                    <div class="chips">${chips.join('')}</div>
                    <div class="craft-desc">${gear.category === 'amulet' ? '왼팔에 매다는 부적' : '오른팔에 끼는 건틀렛'}</div>
                </div>
            </div>
            ${owned || gear.gacha ? '' : `<div class="creq-list">${reqHtml}</div>`}
            ${btn}
        </div>`;
    }).join('');
    attachGearPreviews();
}

function renderShop() {
    if (BANNERS[shopTab]) renderGacha();
    ui.shopGrid.classList.add('row-list');
    ui.shopGrid.innerHTML = SHOP_ITEMS.filter(item => !item.gacha).map(item => {
        const have = gameState.itemInventory[item.id] || 0;
        return `
        <div ${frameAttrs(item.frame, [item.color, item.color2 || item.color, item.color], item.unique).replace('class="', 'class="row ')}>${frameDeco(item.frame, item.unique)}
            ${vialHtml(item)}
            <div class="row-main">
                <div class="row-name">${item.name}</div>
                <div class="row-desc">${item.desc}${have ? ` · 보유 ${fmt(have)}` : ''}</div>
            </div>
            <div class="row-side">
                <div class="row-price">${fmt(item.price)} <small>JC</small></div>
                <button class="btn btn-sm btn-gold" data-buy="${item.id}" ${gameState.jc < item.price ? 'disabled' : ''}>구매</button>
            </div>
        </div>`;
    }).join('');
}

function questState(quest) {
    const p = gameState.questProgress[quest.id] || {};
    const rows = Object.entries(quest.targets).filter(([, n]) => n > 0).map(([key, need]) => {
        const have = Math.min(need, key === 'jc' ? gameState.jc : (p[key] || 0));
        return { key, need, have, met: have >= need };
    });
    return { rows, canClaim: rows.every(r => r.met) };
}

function questRewardHtml(q) {
    const chips = [];
    if (q.reward.unlockQuickRoll) chips.push(`<span class="rw rw-unlock">⚡ 빠른 롤 해금</span>`);
    for (const id in q.reward.items || {}) {
        const item = SHOP_BY_ID[id];
        if (item) chips.push(`<span class="rw">${vialHtml(item)}<span>${item.name} <b>×${q.reward.items[id]}</b></span></span>`);
    }
    if (q.reward.jc) chips.push(`<span class="rw rw-jc"><i class="coin"></i><span><b>${fmt(q.reward.jc)}</b> JC</span></span>`);
    return chips.join('');
}

function renderQuests() {
    ui.questList.classList.add('list');
    ui.questList.innerHTML = QUEST_DATA.map(q => {
        const done = !q.repeatable && gameState.completedQuests.includes(q.id);
        const active = gameState.activeQuest === q.id;
        const { rows, canClaim } = questState(q);
        const pct = done ? 100 : Math.round(rows.reduce((s, r) => s + Math.min(1, r.have / r.need), 0) / rows.length * 100);

        const status = done ? '<span class="qstate done">완료</span>'
            : active && canClaim ? '<span class="qstate ready">보상 대기</span>'
            : active ? '<span class="qstate ing">진행 중</span>' : '';

        let btn;
        if (done) btn = `<button class="btn btn-block" disabled>완료됨</button>`;
        else if (active && canClaim) btn = `<button class="btn btn-block btn-green q-claim" data-claim="${q.id}">보상 받기</button>`;
        else if (active) btn = '';
        else btn = `<button class="btn btn-block btn-primary" data-quest="${q.id}">이 퀘스트 진행하기</button>`;

        const goals = done ? '' : `<div class="qgoals">${rows.map(r => `
            <div class="qgoal ${r.met ? 'met' : ''}">
                <div class="qgoal-top"><span>${QUEST_TARGET_LABELS[r.key](r.need)}</span><i class="qcheck"></i></div>
                <div class="qgoal-num">${fmt(r.have)}<small> / ${fmt(r.need)}</small></div>
                <div class="qgoal-bar"><div style="width:${r.have / r.need * 100}%"></div></div>
            </div>`).join('')}</div>`;

        return `
        <div class="qcard ${done ? 'done' : ''} ${active ? 'active' : ''} ${active && canClaim ? 'ready' : ''}">
            <div class="qhead">
                <div>
                    <div class="qkind">${q.repeatable ? 'REPEAT' : 'ONCE'}</div>
                    <div class="qtitle">${q.name}</div>
                </div>
                <div class="qpct" style="--p:${pct}">
                    <svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" class="qpct-bg"/><rect x="3" y="3" width="34" height="34" class="qpct-fg" pathLength="100"/></svg>
                    <span>${pct}<small>%</small></span>
                </div>
            </div>
            <div class="qdesc">${q.desc} ${status}</div>
            ${goals}
            <div class="qreward"><div class="qreward-label">REWARD</div><div class="qreward-items">${questRewardHtml(q)}</div></div>
            ${btn}
        </div>`;
    }).join('') + `<div class="qnote">퀘스트는 한 번에 하나만 진행돼요. 바꿔도 진행도는 남아요.</div>`;
}

/* =========================================================
   📚 세트 도감 — 묶음 칭호를 한 번씩 다 뽑으면(도감에 등록) 영구 버프
   ========================================================= */
const FRIENDS = ['김티비', '박지성', '공병은', '김민채', '김가은', '김건우'];
const AURA_SETS = [
    { id: 'desert', icon: '🏜️', name: '사막 세트', color: '#ffc46b', auras: ['leg_desert_tv', 'abs_sunking_gunwoo', 'myth_midas_gaeun', 'ep_falconer_byungeun'], luck: 0.4 },
    { id: 'ice', icon: '❄️', name: '얼음 세트', color: '#9fe6ff', auras: ['ep_frozen_byungeun', 'myth_aurora_gaeun', 'anc_iceemperor_tv'], speed: 0.15 },
    { id: 'storm', icon: '⛈️', name: '폭풍 세트', color: '#8fb8ff', auras: ['leg_storm_gaeun', 'myth_thunderbeast_minchae', 'abs_breaker_byungeun', 'js_lightning_jisung'], luck: 0.6, speed: 0.05 },
    { id: 'space', icon: '🌌', name: '우주 세트', color: '#d7b8ff', auras: ['gemini_basic', 'myth_astro_jisung', 'myth_blackhole_byungeun', 'anc_nebula_jisung'], luck: 0.5 },
    { id: 'fire', icon: '🔥', name: '불꽃 세트', color: '#ff6b2b', auras: ['ep_fire_jisung', 'ep_lava_tv', 'myth_phoenix_gaeun', 'abs_archdemon_tv'], luck: 0.2, speed: 0.1 },
    { id: 'warrior', icon: '⚔️', name: '전사 세트', color: '#ff5a8a', auras: ['ep_blackbelt_gunwoo', 'leg_swordsman_byungeun', 'leg_ninja_jisung', 'myth_dragonknight_minchae', 'anc_honor_minchae', 'abs_juggernaut_minchae', 'cosmic_steel_emperor'], luck: 0.8, speed: 0.1 },
    { id: 'school', icon: '🏫', name: '학교 세트', color: '#5fe08a', auras: ['unc_lunch_gunwoo', 'unc_late_gaeun', 'rare_escape_tv', 'rare_president_byungeun', 'rare_captain_minchae', 'rare_relay_gunwoo'], speed: 0.08 },
    { id: 'halloween', icon: '🎃', name: '할로윈 세트', color: '#ff8a1f', auras: AURA_DATA.filter(a => a.biome === 'halloween').map(a => a.id), luck: 1, speed: 0.1, limited: true },
    { id: 'admin', icon: '👑', name: '어드민 세트', color: '#ffd23a', auras: AURA_DATA.filter(a => a.biome === 'admin').map(a => a.id), luck: 1.5, speed: 0.15, limited: true },
    // 친구별 세트: 이름이 들어간 칭호 전부 (바이옴 한정 칭호는 빼고)
    // 사람마다 효과가 다름 (행운형 / 속도형 / 반반)
    ...FRIENDS.map((f, i) => ({ id: 'f' + i, icon: '🧑', name: `${f} 세트`, color: ['#7fe0ff', '#00fa9a', '#6495ed', '#ff2a4a', '#c77dff', '#ffb02e'][i], auras: AURA_DATA.filter(a => !a.biome && a.name.includes(f)).map(a => a.id), ...[{ luck: 2.5 }, { speed: 0.35 }, { luck: 1.5, speed: 0.2 }, { speed: 0.45 }, { luck: 3 }, { luck: 1.2, speed: 0.25 }][i], friend: true }))   // 사람 세트는 모으기 엄청 어려워서 효과를 크게
];
let setBonusCache = null, setBonusKey = null;
function setFound() { return new Set([...gameState.discoveredAuras, ...Object.keys(gameState.inventory)]); }
// 완성한 세트 중 테마 하나(activeSet) + 사람 하나(activeFriendSet)를 골라 버프를 받음
const setSlot = s => s.friend ? 'activeFriendSet' : 'activeSet';
function getSetBonus() {
    // 세이브가 통째로 바뀌거나(로그인/로그아웃/개발자 모드) 새 칭호 등록·세트 변경 때 다시 계산
    const key = gameState.discoveredAuras.length + ':' + Object.keys(gameState.inventory).length + ':' + (gameState.activeSet || '') + ':' + (gameState.activeFriendSet || '');
    if (setBonusCache && setBonusKey === key && setBonusCache.gs === gameState) return setBonusCache;
    setBonusKey = key;
    const found = setFound();
    const b = { luck: 0, speed: 0, done: 0, theme: null, friend: null };
    for (const s of AURA_SETS) {
        if (!s.auras.length || !s.auras.every(id => found.has(id))) continue;
        b.done++;
        if (s.id === gameState[setSlot(s)]) { b.luck += s.luck || 0; b.speed += s.speed || 0; b[s.friend ? 'friend' : 'theme'] = s; }
    }
    b.gs = gameState;
    return (setBonusCache = b);
}
function setRewardText(s) { return [s.luck ? `행운 +${Math.round(s.luck * 100)}%` : '', s.speed ? `속도 +${Math.round(s.speed * 100)}%` : ''].filter(Boolean).join(' · '); }
// 방금 뽑은 칭호로 세트가 완성됐으면 축하
function announceSetDone(id) {
    const found = setFound();
    for (const s of AURA_SETS) {
        if (!s.auras.includes(id) || !s.auras.every(x => found.has(x))) continue;
        // 처음 완성한 세트는 바로 적용 (이미 고른 세트가 있으면 그대로 두고 알림만)
        if (!gameState[setSlot(s)]) { gameState[setSlot(s)] = s.id; setBonusCache = null; }
        setTimeout(() => toast(`📚 ${s.icon} ${s.name} 완성!\n${gameState[setSlot(s)] === s.id ? `${setRewardText(s)} 적용 중` : '도감 → 세트에서 적용할 수 있어요'}`, 'gold'), 1500);
    }
}
let indexTab = 'all';
function renderSets() {
    const found = setFound(), bonus = getSetBonus();
    const card = s => {
        const have = s.auras.filter(id => found.has(id)).length, done = have === s.auras.length;
        const on = done && gameState[setSlot(s)] === s.id;
        return `<div class="set-card ${done ? 'done' : ''} ${on ? 'on' : ''}" style="--c:${s.color}">
            <div class="set-head">
                <span class="set-icon">${s.icon}</span>
                <div class="set-title"><b>${s.name}</b>${s.limited ? '<small>한정</small>' : ''}</div>
                <span class="set-count">${have}<small>/${s.auras.length}</small></span>
            </div>
            <div class="set-bar"><div style="width:${have / s.auras.length * 100}%"></div></div>
            <div class="set-auras">${s.auras.map(id => { const a = AURA_BY_ID[id]; const f = found.has(id); return `<span class="set-aura ${f ? 'on' : ''} ${gradeCol(a.grade)}" style="${f ? `--ac:${a.color}` : ''}">${f ? a.name : '???'}</span>`; }).join('')}</div>
            <div class="set-foot">
                <div class="set-reward">${done ? '✓ ' : '🔒 '}세트 효과: <b>${setRewardText(s)}</b></div>
                ${done ? (on ? '<span class="set-on">적용 중</span>' : `<button class="btn btn-sm" data-useset="${s.id}">적용</button>`) : ''}
            </div>
        </div>`;
    };
    $('set-grid').innerHTML = `
        <div class="set-total">
            <div><span>완성한 세트</span><b>${bonus.done}<small> / ${AURA_SETS.length}</small></b></div>
            <div class="wide"><span>지금 받는 세트 효과</span><b><small class="luck">행운 +${Math.round(bonus.luck * 100)}%</small> <small class="speed">속도 +${Math.round(bonus.speed * 100)}%</small></b></div>
        </div>
        <div class="set-slots">
            <div class="set-slot"><span>테마 칸</span><b>${bonus.theme ? `${bonus.theme.icon} ${bonus.theme.name}` : '<small>비어 있음</small>'}</b></div>
            <div class="set-slot"><span>사람 칸</span><b>${bonus.friend ? `🧑 ${bonus.friend.name}` : '<small>비어 있음</small>'}</b></div>
        </div>
        <div class="set-note">완성한 세트 중 <b>테마 하나 + 사람 하나</b>를 골라 효과를 받아요.</div>
        <div class="set-label">테마 세트</div>
        ${AURA_SETS.filter(s => !s.friend).map(card).join('')}
        <div class="set-label">친구 세트 <small>그 사람 이름이 들어간 칭호 전부</small></div>
        ${AURA_SETS.filter(s => s.friend).map(card).join('')}
        <div class="set-note">칭호를 한 번이라도 뽑으면(도감 등록) 세트에 들어가요. 팔아도 안 빠져요.</div>`;
}
$('set-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-useset]');
    if (!b) return;
    const s = AURA_SETS.find(x => x.id === b.dataset.useset);
    gameState[setSlot(s)] = s.id;
    setBonusCache = null;
    saveGame(); renderStats(); renderSets();
    toast(`${s.icon} ${s.name} 적용: ${setRewardText(s)}`, 'good');
});
bindTabs('index-tabs', tab => {
    indexTab = tab;
    ui.indexGrid.classList.toggle('hidden', tab === 'sets');
    $('set-grid').classList.toggle('hidden', tab !== 'sets');
    if (tab === 'sets') { renderSets(); stagger($('set-grid')); } else { renderIndex(); stagger(ui.indexGrid.querySelector('.index-grid')); }
});

// 한정 칭호: 바이옴 전용 또는 시즌 패스 보상 (일반 롤로는 안 나옴)
const isLimitedAura = a => !!(a.biome || a.pass);
const limitedKey = a => a.pass ? 'pass:' + a.pass : 'biome:' + a.biome;
function limitedTitle(k) {
    const [t, id] = k.split(':');
    if (t === 'pass') return `🎫 시즌 패스 ${id === 'pro' ? 'PRO' : 'BASIC'} 보상`;
    const b = BIOME_BY_ID[id];
    return b ? `${b.icon} ${b.name} 바이옴 전용` : id;
}
// 바이옴 전용 칭호 표시
function biomeTag(a) {
    if (a.pass) return `<span class="biome-tag" style="--bc:#b9a8ff">🎫 패스 ${a.pass === 'pro' ? 'PRO' : 'BASIC'} 보상</span>`;
    const b = a.biome && BIOME_BY_ID[a.biome];
    return b ? `<span class="biome-tag" style="--bc:${b.color}">${b.icon} ${b.name} 전용</span>` : '';
}
function renderIndex() {
    const found = new Set([...gameState.discoveredAuras, ...Object.keys(gameState.inventory)]);
    const total = AURA_DATA.length;
    const foundCount = AURA_DATA.filter(a => found.has(a.id)).length;
    ui.indexProgress.textContent = `${foundCount} / ${total}`;

    let html = `<div class="index-bar"><div style="width:${foundCount / total * 100}%"></div></div><div class="index-grid">`;
    // 한정 칭호(바이옴 전용·시즌 패스)는 '한정' 탭에 따로, 출처별로 묶음
    const lim = indexTab === 'limited';
    const groups = lim
        ? [...new Set(AURA_DATA.filter(isLimitedAura).map(limitedKey))].map(k => ({ key: k, list: AURA_DATA.filter(a => isLimitedAura(a) && limitedKey(a) === k) }))
        : GRADES.map(g => ({ key: g, list: AURA_DATA.filter(a => a.grade === g && !isLimitedAura(a)) }));
    for (const { key: grade, list } of groups) {
        if (!list.length) continue;
        const gFound = list.filter(a => found.has(a.id)).length;
        html += lim ? `<div class="grade-header limited-head">${limitedTitle(grade)} <span class="count">${gFound}/${list.length}</span></div>` : gradeHeader(grade, `${gFound}/${list.length}`);
        for (const a of list) {
            html += found.has(a.id)
                ? `<div ${frameAttrs(a.grade, auraColors(a), a.frame).replace('class="', 'class="index-cell ')}>${frameDeco(a.grade, a.frame)}<div class="card-name">${auraNameHtml(a)}</div><div class="card-meta">1 in ${fmt(a.in)}${biomeTag(a)}</div></div>`
                : `<div class="index-cell unknown"><div class="card-name">?</div><div class="card-meta">1 in ${fmt(a.in)}${biomeTag(a)}</div></div>`;
        }
    }
    ui.indexGrid.innerHTML = html + '</div>';
}

function renderAutoSell() {
    ui.autoSellGrid.innerHTML = GRADES.map(g =>
        `<button class="sell-chip ${gradeCol(g)} ${gameState.autoDelete[g] ? 'on' : ''}" data-autosell="${g}">${g}${gameState.autoDelete[g] ? ' ✓' : ''}</button>`
    ).join('');
}

function renderGradeTable() {
    ui.gradeTable.innerHTML = GRADES.map(g => `
        <div class="grade-row"><span class="${gradeCol(g)}">${g}</span><span class="grade-odds">${GRADE_ODDS[g]}</span></div>`).join('');
}

function renderSoundUI() {
    for (const key of ['master', 'bgm', 'cutscene', 'click', 'roll']) {
        const v = Math.round((soundSettings[key] ?? 1) * 100);
        $(`vol-${key}`).value = v;
        $(`vol-${key}-val`).textContent = v;
    }
    const btn = $('sound-toggle-btn');
    btn.textContent = soundSettings.enabled ? 'ON' : 'OFF';
    btn.classList.toggle('on', soundSettings.enabled);
}

function renderAll() {
    renderStats(); renderBuffs(); renderRollToggles();
    renderInventory(); renderPotions(); renderCraft(); renderShop(); renderQuests(); renderIndex();
    renderAutoSell();
}

/* =========================================================
   📂 시트 열고 닫기
   ========================================================= */

const SHEET_RENDER = {
    'sheet-bag': () => { renderInventory(); renderPotions(); if (bagTab === 'gauntlet' || bagTab === 'amulet') renderBagGear(); },
    'sheet-craft': renderCraft,
    'sheet-shop': renderShop,
    'sheet-quest': renderQuests,
    'sheet-index': () => { renderIndex(); renderSets(); },
    'sheet-settings': () => { renderSoundUI(); renderAutoSell(); if (setTab === 'account') renderAccount(); },
    'sheet-profile': () => renderProfileSheet(),
    'sheet-attend': () => renderAttend(),
    'sheet-show': () => renderShowcase(),
    'sheet-pass': () => renderPass(),
    'sheet-bm': () => renderBM(),
    'sheet-pet': () => renderPets()
};

function stagger(el) {
    if (!el) return;
    el.classList.remove('stagger');
    [...el.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 24)));
    void el.offsetWidth;
    el.classList.add('stagger');
    clearTimeout(el._staggerT);
    el._staggerT = setTimeout(() => el.classList.remove('stagger'), 1400);
}
const SHEET_LIST = {
    'sheet-bag': () => [ui.inventoryGrid, ui.potionGrid, $('gear-grid')],
    'sheet-craft': () => [ui.craftGrid],
    'sheet-shop': () => [BANNERS[shopTab] ? $('gacha-panel') : ui.shopGrid],
    'sheet-pet': () => [$('pet-panel')],
    'sheet-quest': () => [ui.questList],
    'sheet-index': () => [indexTab === 'sets' ? $('set-grid') : ui.indexGrid.querySelector('.index-grid')],
    'sheet-settings': () => [$('sheet-settings').querySelector(`.set-pane[data-pane="${setTab}"]`)]
};

function openSheet(id) {
    SHEET_RENDER[id]?.();
    const el = $(id);
    el.classList.remove('hidden', 'closing');
    (SHEET_LIST[id]?.() || []).forEach(stagger);
    stage3d?.setLowPower(true);
    document.querySelectorAll(`[data-sheet="${id}"]`).forEach(b => b.classList.add('open'));
}
function closeSheet(id) {
    const el = $(id);
    if (el.classList.contains('hidden')) return;
    if (id === 'sheet-craft' || id === 'sheet-shop' || id === 'sheet-bag') gearPreviews?.stop();
    el.classList.add('closing');
    document.querySelectorAll(`[data-sheet="${id}"]`).forEach(b => b.classList.remove('open'));
    setTimeout(() => {
        el.classList.add('hidden'); el.classList.remove('closing');
        if (!document.querySelector('.sheet-backdrop:not(.hidden)')) stage3d?.setLowPower(false);
    }, 210);
}

document.querySelectorAll('[data-sheet]').forEach(btn => btn.addEventListener('click', () => openSheet(btn.dataset.sheet)));
document.querySelectorAll('.sheet-backdrop').forEach(bd => {
    bd.addEventListener('click', e => {
        if (e.target === bd || e.target.closest('[data-close]')) closeSheet(bd.id);
    });
});
$('settings-btn').addEventListener('click', () => openSheet('sheet-settings'));
ui.mainDevBtn.addEventListener('click', () => openSheet('sheet-dev'));

function bindTabs(containerId, onChange) {
    const box = $(containerId);
    box.addEventListener('click', e => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        box.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        onChange(tab.dataset.tab);
    });
}
let bagTab = 'aura';
function setBagTab(tab) {
    bagTab = tab;
    $('bag-tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const gearTab = tab === 'gauntlet' || tab === 'amulet';
    ui.inventoryGrid.classList.toggle('hidden', tab !== 'aura');
    ui.potionGrid.classList.toggle('hidden', tab !== 'potion');
    $('gear-grid').classList.toggle('hidden', !gearTab);
    if (gearTab) renderBagGear(); else gearPreviews?.stop();
    stagger(tab === 'aura' ? ui.inventoryGrid : tab === 'potion' ? ui.potionGrid : $('gear-grid'));
}
bindTabs('bag-tabs', tab => setBagTab(tab));

// 가방: 가진 건틀렛/부적 장착·해제
// 위에 '지금 장착 중' 슬롯 하나, 아래에 나머지를 한 줄씩 (줄을 누르면 바로 장착)
function gearEffectHtml(gear) {
    const parts = [];
    if (gear.luckBonus) parts.push(`<b class="ef-luck">행운 +${fmt(Math.round(gear.luckBonus * 100))}%</b>`);
    if (gear.speedBonus) parts.push(`<b class="ef-speed">속도 +${Math.round(gear.speedBonus * 100)}%</b>`);
    if (AMULET_MULT[gear.id]) parts.push(`<b class="ef-amu">10롤마다 ×${AMULET_MULT[gear.id]}</b>`);
    if (gear.amuletMult) parts.push(`<b class="ef-amu">${gear.amuletEvery || 10}롤마다 ×${gear.amuletMult}</b>`);
    if (gear.biomeBoost) parts.push(`<b class="ef-biome">바이옴 ×${gear.biomeBoost} · 지속 ×${gear.biomeTime}</b>`);
    if (gear.jcBonus) parts.push(`<b class="ef-amu">롤마다 판매가 ${Math.round(gear.jcBonus * 100)}% JC (최대 ${fmt(gear.jcBonusMax)})</b>`);
    if (gear.abil) parts.push(`<b class="ef-abil">✦ ${abilText(gear)}${gear.abil === 'streak' && gameState.amulet === gear.id ? ` · 지금 +${Math.round((streakMult() - 1) * 100)}%` : ''}</b>`);
    return parts.join('');
}
function gearPower(g) { return (g.luckBonus || 0) * 10 + (g.speedBonus || 0) + (g.amuletMult || AMULET_MULT[g.id] || 0) * 10 / (g.amuletEvery || 10) + (g.biomeBoost || 0) + (g.jcBonus || 0) + (g.abil ? 12 : 0); }
function renderBagGear() {
    const el = $('gear-grid');
    const cat = bagTab === 'amulet' ? 'amulet' : 'gauntlet';
    const word = cat === 'amulet' ? '부적' : '건틀렛';
    const owned = CRAFT_ITEMS.filter(g => (g.category || 'gauntlet') === cat && gameState.craftedGears.includes(g.id)).map(g => gearOf(g.id)).sort((a, b) => gearPower(b) - gearPower(a));
    el.classList.remove('list');
    if (!owned.length) {
        el.innerHTML = `<div class="empty">${word}이 없습니다.<br>제작하거나 상점 뽑기에서 얻을 수 있어요.</div>`;
        return;
    }
    const onId = cat === 'amulet' ? gameState.amulet : gameState.gear;
    const on = gearOf(onId);
    const rest = owned.filter(g => g.id !== onId);
    el.innerHTML = `
        <div class="bg-slot ${on ? '' : 'empty-slot'}">
            <div class="bg-label">장착 중인 ${word}</div>
            ${on ? `
            <div class="bg-slot-card">
                <div class="bg-slot-view"><canvas data-gear="${on.id}" aria-hidden="true"></canvas></div>
                <div class="bg-slot-info">
                    <div class="bg-name">${on.name}${lvTag(on)}</div>
                    <div class="bg-eff">${gearEffectHtml(on)}</div>
                    <button class="btn btn-sm bg-off" data-unequip="${on.id}">해제</button>
                </div>
            </div>` : `<div class="bg-slot-none">비어 있어요 · 아래에서 눌러서 장착</div>`}
        </div>
        ${rest.length ? `<div class="bg-label">가지고 있는 ${word} <span>${rest.length}</span></div>
        <div class="bg-list">${rest.map(g => `
            <button type="button" class="bg-row" data-equip="${g.id}">
                <div class="bg-row-view"><canvas data-gear="${g.id}" aria-hidden="true"></canvas></div>
                <div class="bg-row-info"><div class="bg-name">${g.name}${lvTag(g)}</div><div class="bg-eff">${gearEffectHtml(g)}</div></div>
                <span class="bg-row-go">장착</span>
            </button>`).join('')}</div>` : ''}`;
    attachGearPreviews(el);
}
$('gear-grid').addEventListener('click', e => {
    const eq = e.target.closest('[data-equip]'), un = e.target.closest('[data-unequip]');
    if (eq) { equip(CRAFT_BY_ID[eq.dataset.equip]); toast(`${CRAFT_BY_ID[eq.dataset.equip].name} 장착`, 'good'); }
    else if (un) {
        if (CRAFT_BY_ID[un.dataset.unequip].category === "amulet") { gameState.amulet = null; gameState.amuletStack = 0; }
        else gameState.gear = null;
    } else return;
    saveGame(); renderStats(); renderBuffs(); renderBagGear(); applyGear();
    stagger($('gear-grid'));
});
bindTabs('craft-tabs', tab => { craftTab = tab; renderCraft(); stagger(ui.craftGrid); });
bindTabs('shop-tabs', tab => setShopTab(tab));
// 설정 탭
let setTab = 'account';
function setSettingsTab(tab) {
    setTab = tab;
    $('set-tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('#sheet-settings .set-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== tab));
    if (tab === 'account') renderAccount();
}
bindTabs('set-tabs', tab => setSettingsTab(tab));
$('shop-tabs').querySelector('[data-tab="halloween"]').classList.toggle('hidden', !isHalloween());

/* =========================================================
   🎮 동작
   ========================================================= */

$('game-start-btn').addEventListener('click', () => {
    initSynthAudio();
    const lobby = $('lobby-screen'), main = $('main-game');
    lobby.classList.add('leaving');
    setTimeout(() => {
        lobby.classList.add('hidden');
        lobby.classList.remove('leaving');
        main.classList.remove('hidden');
        main.classList.add('entering');
        setTimeout(() => main.classList.remove('entering'), 1300);
        stage3d?.resize();
        applyEquippedAura();
        applyBiome(false);   // 저장된 바이옴이 남아 있으면 이어서
        updateAttendDot(); updatePetDot(); setInterval(updatePetDot, 60000); updateShowDot(); setInterval(updateShowDot, 60000); updatePassDot(); updateBMBtn();
        startAdminEvents();
        cloudPull();   // 다른 기기에서 하던 기록이 더 많으면 불러옴
        if (!gameState.tutorialDone && !(gameState.rolls > 0)) setTimeout(() => startTutorial(true), 900);   // 처음 온 사람은 튜토리얼부터
        else if (canAttend()) setTimeout(() => openSheet('sheet-attend'), 900);   // 오늘 출석 안 했으면 바로 띄움
    }, 420);
    playBgm('main');
});

ui.rollBtn.addEventListener('click', () => {
    ui.rollBtn.classList.remove('pressed'); void ui.rollBtn.offsetWidth; ui.rollBtn.classList.add('pressed');
    startRoll();
});

ui.autoBtn.addEventListener('click', () => {
    isAutoRolling = !isAutoRolling;
    autoWorker.postMessage({ command: isAutoRolling ? 'start' : 'stop', interval: 100 });
    renderRollToggles();
    if (isAutoRolling && !isRolling) startRoll();
});

ui.quickBtn.addEventListener('click', () => {
    if (!gameState.quickRollUnlocked) return;
    isQuickRollActive = !isQuickRollActive;
    renderRollToggles();
});

/* ---------- 판매 ---------- */
ui.inventoryGrid.addEventListener('click', e => {
    const card = e.target.closest('[data-aura]');
    if (card) openAuraDialog(card.dataset.aura);
});

// 칭호를 누르면 뜨는 창: 정보 + 장착 / 판매
let auraDlgId = null;
function openAuraDialog(id) {
    const a = AURA_BY_ID[id];
    if (!a || !gameState.inventory[id]) return;
    auraDlgId = id;
    const on = gameState.equippedAura === id;
    $('ad-card').innerHTML = `<div ${frameAttrs(a.grade, auraColors(a), a.frame).replace('class="', 'class="ad-preview ')}>${frameDeco(a.grade, a.frame)}
        <div class="ad-grade ${gradeCol(a.grade)}">${a.grade}</div>
        <div class="ad-name">${auraNameHtml(a)}</div>
        ${a.line ? `<div class="ad-line">${a.line}</div>` : ''}
    </div>`;
    $('ad-odds').textContent = `1 in ${fmt(a.in)}`;
    $('ad-have').textContent = `×${fmt(gameState.inventory[id])}`;
    $('ad-value').textContent = `${fmt(a.jcValue)} JC`;
    const eq = $('ad-equip');
    eq.disabled = on;
    eq.textContent = on ? '장착 중' : '장착';
    $('aura-dialog').classList.remove('hidden');
}
function closeAuraDialog() { $('aura-dialog').classList.add('hidden'); auraDlgId = null; }
$('aura-dialog').addEventListener('click', e => {
    if (e.target.id === 'aura-dialog' || e.target.closest('[data-ad="close"]')) { closeAuraDialog(); return; }
    const id = auraDlgId;
    if (!id) return;
    if (e.target.closest('#ad-equip')) {
        gameState.equippedAura = id;
        saveGame(); applyEquippedAura(); renderInventory();
        ui.inventoryGrid.querySelector(`[data-aura="${id}"]`)?.classList.add('just-equipped');
        toast(`${AURA_BY_ID[id].name} 장착`, 'good');
        closeAuraDialog();
    } else if (e.target.closest('#ad-sell')) {
        closeAuraDialog();
        sellAura(id);
    }
});

function sellAura(id) {
    const a = AURA_BY_ID[id], count = gameState.inventory[id];
    if (!a || !count) return;
    if (a.pass) { toast('시즌 패스 칭호는 팔 수 없어요', 'bad'); return; }
    openQtyDialog({
        title: `${a.name}`,
        sub: `${a.grade} 칭호 판매 (보유 ${fmt(count)}개)`,
        max: count, initial: count,
        priceEach: Math.floor(a.jcValue * sellMult()), totalLabel: '받는 금액',
        okText: '판매',
        onConfirm: async n => {
            if (HIGH_GRADES.includes(a.grade)) {
                const ok = await ask({ title: `${a.grade} 칭호를 판매할까요?`, message: `${a.name} ${fmt(n)}개`, okText: '판매', danger: true });
                if (!ok) return;
            }
            gameState.inventory[id] -= n;
            if (gameState.inventory[id] <= 0) {
                delete gameState.inventory[id];
                if (gameState.equippedAura === id) { gameState.equippedAura = null; applyEquippedAura(); }
            }
            gameState.jc += Math.floor(a.jcValue * sellMult()) * n;
            saveGame(); renderStats(); renderInventory();
            toast(`${fmt(n)}개 판매  +${fmt(Math.floor(a.jcValue * sellMult()) * n)} JC`, 'gold');
        }
    });
}

/* ---------- 구매 ---------- */
ui.shopGrid.addEventListener('click', e => {
    const id = e.target.dataset.buy;
    if (!id) return;
    const item = SHOP_BY_ID[id];
    if (!item || item.gacha) return;
    const max = Math.floor(gameState.jc / item.price);
    if (max < 1) { toast('JC가 부족해요', 'bad'); return; }
    openQtyDialog({
        title: `${item.name}`,
        sub: `${item.desc}\n보유 JC ${fmt(gameState.jc)}`,
        max, initial: 1,
        priceEach: item.price, totalLabel: '총',
        okText: '구매',
        onConfirm: n => {
            const cost = n * item.price;
            if (gameState.jc < cost) { toast('JC가 부족해요', 'bad'); return; }
            gameState.jc -= cost;
            addItems({ [id]: n });
            trackQuestProgress("shopPurchases", n);
            saveGame(); renderStats(); renderShop();
            toast(`${item.name} ${n}개 구매`, 'good');
        }
    });
});

/* ---------- 물약 사용 ---------- */
ui.potionGrid.addEventListener('click', e => {
    const id = e.target.dataset.use;
    if (!id) return;
    const item = SHOP_BY_ID[id], count = gameState.itemInventory[id];
    if (!item || !count) return;

    const b = gameState.activeBuffs, now = Date.now();
    if (item.type === 'luck' && b.luckExpireTime > now && b.luckLevel !== item.level) {
        toast(`이미 행운의 물약 ${b.luckLevel}을(를) 쓰는 중이에요`, 'bad'); return;
    }
    if (item.type === 'speed' && b.speedExpireTime > now && b.speedLevel !== item.level) {
        toast(`이미 속도의 물약 ${b.speedLevel}을(를) 쓰는 중이에요`, 'bad'); return;
    }

    openQtyDialog({
        title: `${item.name} 사용`,
        sub: `${item.desc}\n보유 ${fmt(count)}개.` + (item.type === 'biome' ? ' 한 번에 하나만 쓸 수 있어요.' : ' 여러 개 쓰면 시간이나 횟수가 늘어납니다.'),
        max: item.type === 'biome' ? 1 : count, initial: 1, okText: '사용',
        onConfirm: n => {
            if ((gameState.itemInventory[id] || 0) < n) return;
            gameState.itemInventory[id] -= n;
            if (gameState.itemInventory[id] <= 0) delete gameState.itemInventory[id];
            const now = Date.now();
            if (item.type === 'luck' || item.type === 'speed') {
                const k = item.type;
                gameState.activeBuffs[`${k}Bonus`] = item.value;
                gameState.activeBuffs[`${k}Level`] = item.level;
                const expire = gameState.activeBuffs[`${k}ExpireTime`];
                gameState.activeBuffs[`${k}ExpireTime`] = Math.max(now, expire || 0) + item.duration * 1000 * n * (amu().abil === 'brew' ? amu().brewTime : 1);
            } else if (item.type === 'luck_mult') {
                gameState.activeMultBuffs.push({ name: item.name, bonus: item.value, uses: item.maxUses * n });
            } else if (item.type === 'dice') {
                // 개수만큼 주사위를 굴려서 나온 배율을 각각 1회씩
                const got = Array.from({ length: n }, () => item.faces[Math.floor(Math.random() * item.faces.length)]);
                got.forEach(v => gameState.activeMultBuffs.push({ name: `주사위 ×${fmt(v)}`, bonus: v, uses: 1 }));
                saveGame(); renderStats(); renderBuffs(); renderPotions();
                toast(`🎲 ${got.map(v => '×' + fmt(v)).join(', ')}`, 'gold');
                return;
            } else if (item.type === 'biome') {
                startBiome(item.biome ? BIOME_BY_ID[item.biome] : randomBiome(activeEvents()));
            }
            saveGame(); renderStats(); renderBuffs(); renderPotions();
            toast(`${item.name} ${n}개 사용`, 'good');
        }
    });
});

/* ---------- 제작 / 장착 ---------- */
ui.craftGrid.addEventListener('click', e => {
    const d = e.target.dataset;
    if (d.craft) {
        const gear = CRAFT_BY_ID[d.craft];
        for (const r in gear.req) {
            if ((gameState.inventory[r] || 0) < gear.req[r]) { toast('재료가 부족해요', 'bad'); return; }
        }
        for (const r in gear.req) {
            gameState.inventory[r] -= gear.req[r];
            if (gameState.inventory[r] <= 0) delete gameState.inventory[r];
        }
        gameState.craftedGears.push(gear.id);
        toast(`${gear.name} 제작 완료\n가방에서 장착할 수 있어요`, 'good');
    } else if (d.gotobag) {
        closeSheet('sheet-craft'); openSheet('sheet-bag'); setBagTab(d.gotobag);
        return;
    } else if (d.gotogacha) {
        closeSheet('sheet-craft'); openSheet('sheet-shop'); setShopTab(d.gotogacha);
        return;
    } else if ('gotopass' in d) {
        closeSheet('sheet-craft'); openSheet('sheet-pass');
        return;
    } else if (d.equip) {
        equip(CRAFT_BY_ID[d.equip]);
    } else if (d.unequip) {
        const item = CRAFT_BY_ID[d.unequip];
        if (item.category === "amulet") { gameState.amulet = null; gameState.amuletStack = 0; }
        else gameState.gear = null;
    } else return;
    saveGame(); renderStats(); renderBuffs(); renderCraft(); applyGear();
});

function equip(item) {
    if (item.category === "amulet") { gameState.amulet = item.id; gameState.amuletStack = 0; }
    else gameState.gear = item.id;
}

/* ---------- 퀘스트 ---------- */
ui.questList.addEventListener('click', e => {
    const d = e.target.dataset;
    if (d.quest) {
        gameState.activeQuest = d.quest;
        if (!gameState.questProgress[d.quest]) gameState.questProgress[d.quest] = {};
        saveGame(); renderQuests();
    } else if (d.claim) {
        const q = QUEST_DATA.find(x => x.id === d.claim);
        if (!q || !questState(q).canClaim) return;
        if (!q.repeatable) gameState.completedQuests.push(q.id);
        gameState.activeQuest = null;
        delete gameState.questProgress[q.id];
        if (q.reward.unlockQuickRoll) gameState.quickRollUnlocked = true;
        if (q.reward.items) addItems(q.reward.items);
        if (q.reward.jc) gameState.jc += q.reward.jc;
        saveGame(); renderStats(); renderQuests(); renderRollToggles();
        toast(`퀘스트 완료\n${q.rewardDesc}`, 'gold');
    }
});

/* ---------- 설정 ---------- */
for (const key of ['master', 'bgm', 'cutscene', 'click', 'roll']) {
    $(`vol-${key}`).addEventListener('input', e => {
        soundSettings[key] = e.target.value / 100;
        $(`vol-${key}-val`).textContent = e.target.value;
        updateBgmVolume();
        if (cutsceneAudio) cutsceneAudio.volume = soundSettings.master * soundSettings.cutscene;
        saveSoundSettings();
    });
}
$('sound-toggle-btn').addEventListener('click', () => {
    soundSettings.enabled = !soundSettings.enabled;
    saveSoundSettings(); renderSoundUI();
    if (!soundSettings.enabled) stopBgm();
    else playBgm($('lobby-screen').classList.contains('hidden') ? 'main' : 'lobby');
});

ui.autoSellGrid.addEventListener('click', e => {
    const g = e.target.dataset.autosell;
    if (!g) return;
    gameState.autoDelete[g] = !gameState.autoDelete[g];
    saveGame(); renderAutoSell();
});

$('submit-code-btn').addEventListener('click', redeemCode);
$('code-input').addEventListener('keydown', e => { if (e.key === 'Enter') redeemCode(); });
function redeemCode() {
    const code = $('code-input').value.trim().toUpperCase();
    if (!code) return;
    if (gameState.usedCodes.includes(code)) { toast('이미 사용한 쿠폰이에요', 'bad'); return; }
    const c = COUPONS[code];
    if (!c) { toast('없는 쿠폰 코드예요', 'bad'); return; }
    gameState.usedCodes.push(code);
    if (c.jc) gameState.jc += c.jc;
    if (c.items) addItems(c.items);
    saveGame(); renderStats();
    $('code-input').value = '';
    toast(`🎁 ${code} 쿠폰 사용!\n${c.msg}`, 'gold');
}

/* ---------- 개발자 모드 ---------- */
// 👑 관리자 패널 (개발자 모드와 따로. 내 데이터 그대로라 어드민 이벤트 보상도 받음)
const ADMIN_KEY = 'js_rng_admin';
function openAdminSheet() {
    const absel = $('ab-biome');
    if (!absel.children.length) absel.innerHTML = BIOMES.map(b => `<option value="${b.id}">${b.icon} ${b.name}</option>`).join('');
    const gsel = $('ab-gift');
    if (!gsel.children.length) gsel.innerHTML = `<option value="jc">🪙 10만 JC</option>` + SHOP_ITEMS.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    setOnline(!!evOnline);
    closeSheet('sheet-settings');
    openSheet('sheet-admin');
}
function showAdminBtn() { try { $('admin-btn').classList.toggle('hidden', localStorage.getItem(ADMIN_KEY) !== '1'); } catch (e) {} }
$('admin-open-btn').addEventListener('click', async () => {
    let ok = false;
    try { ok = localStorage.getItem(ADMIN_KEY) === '1'; } catch (e) {}
    if (!ok) {
        const pwd = await ask({ title: '관리자 패널', message: '비밀번호를 입력하세요', input: true });
        if (pwd === null) return;
        if (pwd !== DEV_PASSWORD) { toast('비밀번호가 틀렸어요', 'bad'); return; }
        try { localStorage.setItem(ADMIN_KEY, '1'); } catch (e) {}
        showAdminBtn();
    }
    openAdminSheet();
});
$('admin-btn').addEventListener('click', openAdminSheet);
$('admin-lock-btn').addEventListener('click', () => { try { localStorage.removeItem(ADMIN_KEY); } catch (e) {} showAdminBtn(); closeSheet('sheet-admin'); toast('관리자 패널 잠금'); });
showAdminBtn();

$('dev-btn').addEventListener('click', async () => {
    if (backupGameState !== null) { openSheet('sheet-dev'); return; }
    const pwd = await ask({ title: '개발자 모드', message: '비밀번호를 입력하세요', input: true });
    if (pwd === null) return;
    if (pwd !== DEV_PASSWORD) { toast('비밀번호가 틀렸어요', 'bad'); return; }
    backupGameState = JSON.parse(JSON.stringify(gameState));
    ui.mainDevBtn.classList.remove('hidden');
    const sel = $('dev-aura-select');
    if (!sel.children.length) {
        sel.innerHTML = AURA_DATA.map(a => `<option value="${a.id}">[${a.grade}] ${a.name}</option>`).join('');
    }
    const bsel = $('dev-biome-select');
    if (!bsel.children.length) bsel.innerHTML = BIOMES.map(b => `<option value="${b.id}">${b.icon} ${b.name}</option>`).join('');
    closeSheet('sheet-settings');
    openSheet('sheet-dev');
    toast('개발자 모드 ON. 끌 때까지 저장되지 않습니다.', 'gold');
});

$('sheet-dev').addEventListener('click', e => {
    const act = e.target.dataset.dev;
    if (!act) return;
    if (act === 'jc') { gameState.jc += 1000000; toast('+100만 JC'); }
    else if (act === 'luck') { gameState.luck = 10000; toast('기본 행운 10,000배'); }
    else if (act === 'auras') {
        AURA_DATA.forEach(a => {
            gameState.inventory[a.id] = (gameState.inventory[a.id] || 0) + 50;
            if (!gameState.discoveredAuras.includes(a.id)) gameState.discoveredAuras.push(a.id);
        });
        toast('모든 칭호 50개씩 지급');
    } else if (act === 'quests') {
        QUEST_DATA.forEach(q => {
            gameState.questProgress[q.id] = { ...q.targets };
        });
        gameState.quickRollUnlocked = true;
        toast('모든 퀘스트 조건 달성');
    } else if (act === 'crafts') {
        CRAFT_ITEMS.forEach(i => { if (!gameState.craftedGears.includes(i.id)) gameState.craftedGears.push(i.id); });
        toast('모든 제작템 획득');
    } else if (act === 'biome') {
        startBiome(BIOME_BY_ID[$('dev-biome-select').value]);
    } else if (act === 'biome-end') {
        if (gameState.biome) gameState.biome.until = 0;
        biomeTick();
    } else if (act === 'next') {
        nextRollOverride = $('dev-aura-select').value;
        const a = AURA_BY_ID[nextRollOverride];
        toast(`다음 롤: [${a.grade}] ${a.name}`);
    } else if (act === 'exit') {
        gameState = backupGameState;
        backupGameState = null;
        nextRollOverride = null;
        saveGame();
        ui.mainDevBtn.classList.add('hidden');
        closeSheet('sheet-dev');
        toast('개발자 모드 OFF. 원래 데이터로 복구했습니다.', 'good');
    }
    renderAll();
    applyEquippedAura();
    applyBiome(false);
});


/* =========================================================
   🎰 상점 뽑기 (JC)
   ========================================================= */

let shopTab = 'potion';
const TIER_COL = { COMMON: '#9aa0ad', UNCOMMON: '#5fe08a', RARE: '#4da3ff', EPIC: '#b44dff', LEGEND: '#ff7a1a', MYTHIC: '#00e5ff', ANCIENT: '#ffe14d', ABSOLUTE: '#ff2a4a' };
const TIER_ORDER = Object.keys(TIER_COL);

function setShopTab(tab) {
    shopTab = tab;
    $('shop-tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    ui.shopGrid.classList.toggle('hidden', tab !== 'potion');
    $('gacha-panel').classList.toggle('hidden', !BANNERS[tab]);
    if (BANNERS[tab]) { renderGacha(); stagger($('gacha-panel')); }
    else { gearPreviews?.stop(); renderShop(); stagger(ui.shopGrid); }
}

function gachaEntryName(e) {
    if (e.kind === 'gear') return CRAFT_BY_ID[e.id].name;
    if (e.kind === 'egg') return '🥚 ' + EGG_BY_ID[e.id].name;
    if (e.label) return e.label;
    const [id, n] = Object.entries(e.items)[0];
    return `${SHOP_BY_ID[id].name}${n > 1 ? ` ×${n}` : ''}`;
}

let pityHelpOpen = false;
function renderGacha() {
    const el = $('gacha-panel');
    const B = BANNERS[shopTab] || BANNERS.gacha;
    const hw = B === BANNERS.halloween;
    const pity = gameState[B.pityKey] || 0;
    const gears = B.pool.filter(e => e.kind === 'gear');
    el.classList.toggle('hw', hw);
    const capCols = hw ? ['#ff7a1a', '#7a2aff', '#3ddc6a', '#ff7a1a', '#1a0f22', '#c8b8ff', '#ff7a1a'] : TIER_ORDER.map(t => TIER_COL[t]);
    // 캡슐 더미: 아래 줄일수록 많이, 위로 갈수록 엇갈려 쌓임
    const ROWS = [9, 8, 6, 4, 2];
    let ci = 0, caps = '';
    ROWS.forEach((n, row) => {
        const span = 100 - row * 12, left0 = (100 - span) / 2;
        for (let k = 0; k < n; k++) {
            const c = capCols[(ci * 5 + row * 3) % capCols.length];
            const x = left0 + (k + 0.5) * (span / n) + ((ci * 7) % 5 - 2) * 0.6;
            const b = 2 + row * 19 + ((ci * 11) % 5);
            caps += `<i class="cap" style="--c:${c};--x:${x}%;--b:${b}px;--r:${(ci * 47) % 360}deg;--d:${((ci * 0.29) % 2.4).toFixed(2)}s;--z:${10 - row}"></i>`;
            ci++;
        }
    });
    const ended = B.end && Date.now() >= B.end;
    let timeLeft = '';
    if (B.end && !ended) {
        const ms = B.end - Date.now(), d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24;
        timeLeft = `<div class="gevent">🎃 한정 판매 · 종료까지 <b>${d ? `${d}일 ` : ''}${h}시간</b> <small>(11월 2일까지)</small></div>`;
    }
    el.innerHTML = `
        <div class="gm">
            <div class="gm-head"><span>${B.title}</span><span class="gm-lamp"></span></div>
            ${hw ? '<div class="gm-hw-deco" aria-hidden="true"><i class="pk"></i><i class="bat b1"></i><i class="bat b2"></i></div>' : ''}
            <div class="gm-window">${caps}</div>
            <div class="gm-foot"><div class="gm-slot"></div><div class="gm-knob"></div></div>
        </div>
        ${timeLeft}
        <div class="gpity ${pityHelpOpen ? 'open' : ''}">
            <div class="gpity-top"><span>장비 천장 <button class="gpity-help" data-pityhelp aria-label="천장 확률 보기">?</button></span><span><b>${pity}</b> / ${B.pity}</span></div>
            <div class="gpity-bar"><div style="width:${pity / B.pity * 100}%"></div></div>
            <div class="gpity-note">${B.pity}번 안에 <b>새 장비</b>가 안 나오면 ${B.pity}번째에 아직 없는 장비 하나가 확정! (이미 있는 장비가 나오면 강화되고 천장은 그대로)</div>
            <div class="gpity-odds">${gears.map(e => `<span style="--c:${TIER_COL[e.tier]}"><i></i>${CRAFT_BY_ID[e.id].name.replace(/ (건틀렛|부적)$/, '')}<b>${pityPct(B, e)}</b></span>`).join('')}</div>
        </div>
        ${!hw && (gameState.tickets || 0) > 0 ? `<button class="gbtn gbtn-ticket" data-ticket><i class="ticket-ico"></i><span>뽑기권으로 뽑기</span><b>${fmt(gameState.tickets)}장 남음</b></button>` : ''}
        <div class="gbtns">
            <button class="gbtn" data-pull="1" ${ended || gameState.jc < B.cost ? 'disabled' : ''}><span>1회 뽑기</span><b>${fmt(B.cost)} JC</b></button>
            <button class="gbtn gbtn-10" data-pull="10" ${ended || gameState.jc < B.cost10 ? 'disabled' : ''}><span>10회 뽑기</span><b>${fmt(B.cost10)} JC</b><em>10% 할인</em></button>
        </div>
        <div class="glabel">${B.label} 장비</div>
        <div class="ggears">${gears.map(e => {
            const g = CRAFT_BY_ID[e.id], own = gameState.craftedGears.includes(e.id);
            return `<div class="ggear ${own ? 'own' : ''}" style="--c:${TIER_COL[e.tier]}" data-ggear="${e.id}" role="button">
                <div class="ggear-view"><canvas data-gear="${e.id}" aria-hidden="true"></canvas>${own ? `<span class="ggear-own">${gearLv(e.id) ? `+${gearLv(e.id)}` : '보유'}</span>` : ''}</div>
                <div class="ggear-name">${g.name}</div>
                <div class="ggear-tier">${e.tier} · ${gachaPct(e.w, B.total)}</div>
            </div>`;
        }).join('')}</div>
        <div class="glabel">${B.label} 물약</div>
        <div class="row-list">${SHOP_ITEMS.filter(i => i.gacha === B.potionTag).map(item => `
            <div ${frameAttrs(item.frame, [item.color, item.color2 || item.color, item.color], item.unique).replace('class="', 'class="row ')}>${frameDeco(item.frame, item.unique)}
                ${vialHtml(item)}
                <div class="row-main"><div class="row-name">${item.name}</div><div class="row-desc">${item.desc}</div></div>
                <div class="row-side"><div class="row-have">${gameState.itemInventory[item.id] ? '×' + fmt(gameState.itemInventory[item.id]) : ''}</div></div>
            </div>`).join('')}</div>
        <details class="godds"><summary>전체 확률 보기</summary>${B.pool.slice().sort((a, b) => b.w - a.w).map(e => `
            <div class="godd"><i style="background:${TIER_COL[e.tier]}"></i><span>${gachaEntryName(e)}${e.kind === 'jc' ? ` (${fmt(e.min)}~${fmt(e.max)})` : ''}</span><b>${gachaPct(e.w, B.total)}</b></div>`).join('')}
            <div class="godd-note">이미 가진 장비가 또 나오면 강화 +1 (최대 +5, 강화마다 효과 +10%) · MAX면 JC로 바꿔 줘요</div>
        </details>`;
    attachGearPreviews(el.querySelector('.ggears'));
}

// 천장 때 나올 수 있는 장비: 아직 없는 장비만 (다 모았으면 전부)
function pityPool(B) {
    const gears = B.pool.filter(e => e.kind === 'gear');
    const fresh = gears.filter(e => !gameState.craftedGears.includes(e.id));
    return fresh.length ? fresh : gears;
}
function pityPct(B, e) {
    const pool = pityPool(B);
    if (!pool.includes(e)) return '보유 · 제외';
    return gachaPct(e.pw ?? e.w, pool.reduce((s, x) => s + (x.pw ?? x.w), 0));
}
// 천장은 '새 장비'가 나올 때만 초기화 (이미 있는 장비가 나오면 강화만 되고 천장은 그대로)
function gachaPick(B) {
    gameState[B.pityKey] = (gameState[B.pityKey] || 0) + 1;
    const pity = gameState[B.pityKey] >= B.pity;
    const pool = pity ? pityPool(B) : B.pool;
    const wOf = e => pity ? (e.pw ?? e.w) : e.w;
    let r = Math.random() * pool.reduce((s, e) => s + wOf(e), 0);
    let pick = pool[pool.length - 1];
    for (const e of pool) { r -= wOf(e); if (r <= 0) { pick = e; break; } }
    if (pick.kind === 'gear' && (pity || !gameState.craftedGears.includes(pick.id))) gameState[B.pityKey] = 0;
    return pick;
}

// 뽑은 것을 실제로 지급하고 결과 카드 정보를 돌려줌
function gachaGrant(e) {
    const res = { tier: e.tier, name: gachaEntryName(e), sub: '', icon: '' };
    if (e.kind === 'jc') {
        const amt = Math.round((e.min + Math.random() * (e.max - e.min)) / 500) * 500;
        gameState.jc += amt;
        res.name = `${fmt(amt)} JC`;
        res.icon = '<i class="gr-coin"></i>';
    } else if (e.kind === 'items') {
        addItems(e.items);
        const first = SHOP_BY_ID[Object.keys(e.items)[0]];
        res.icon = vialHtml(first);
        res.sub = e.label ? Object.entries(e.items).map(([id, n]) => `${SHOP_BY_ID[id].name} ×${n}`).join(' · ') : '';
    } else if (e.kind === 'egg') {
        const eggs = petState().eggs;
        eggs[e.id] = (eggs[e.id] || 0) + 1;
        res.icon = `<canvas data-gear="egg:${e.id}" aria-hidden="true"></canvas>`;
        res.gear = true;
        res.sub = '펫 창 둥지에 넣어 부화시켜요';
        updatePetDot();
    } else {
        res.icon = `<canvas data-gear="${e.id}" aria-hidden="true"></canvas>`;
        res.gear = true;
        if (gameState.craftedGears.includes(e.id)) {
            const lv = gearLv(e.id);
            if (lv < GEAR_LV_MAX) {
                gameState.gearLv = gameState.gearLv || {};
                gameState.gearLv[e.id] = lv + 1;
                res.sub = `⚒ 강화 +${lv} → +${lv + 1} (효과 +10%)`;
                applyGear();
            } else {
                gameState.jc += e.dupe;
                res.sub = `강화 MAX → +${fmt(e.dupe)} JC`;
            }
        } else {
            gameState.craftedGears.push(e.id);
            res.sub = 'NEW · 가방에서 장착';
            res.isNew = true;
        }
    }
    return res;
}

function pullGacha(n, ticket = false) {
    const B = BANNERS[shopTab];
    if (!B) return;
    if (B.end && Date.now() >= B.end) { toast('이벤트가 끝났어요', 'bad'); renderGacha(); return; }
    if (ticket) {
        if (B !== BANNERS.gacha || !(gameState.tickets > 0)) return;
        gameState.tickets--;
    } else {
        const cost = n === 10 ? B.cost10 : B.cost * n;
        if (gameState.jc < cost) { toast('JC가 부족해요', 'bad'); return; }
        gameState.jc -= cost;
    }
    const results = Array.from({ length: n }, () => gachaGrant(gachaPick(B)));
    trackQuestProgress("shopPurchases", n);
    saveGame(); renderStats();
    showGachaResult(results);
}

let gachaRevealTimer = 0;
function showGachaResult(results) {
    const box = $('gacha-result');
    const best = results.reduce((b, r) => TIER_ORDER.indexOf(r.tier) > TIER_ORDER.indexOf(b) ? r.tier : b, 'COMMON');
    const bi = TIER_ORDER.indexOf(best);
    const col = TIER_COL[best];
    box.style.setProperty('--best', col);
    box.classList.remove('hidden', 'revealed');
    box.classList.toggle('big', bi >= TIER_ORDER.indexOf('MYTHIC'));
    if (!box.classList.contains('egg-mode')) box.querySelector('.gr-capsule').innerHTML = '<i></i><i></i>';
    const grid = box.querySelector('.gr-grid');
    grid.classList.toggle('single', results.length === 1);
    grid.innerHTML = results.map((r, i) => `
        <div ${frameAttrs(r.tier, [TIER_COL[r.tier], TIER_COL[r.tier], TIER_COL[r.tier]]).replace('class="', `class="gr-card ${r.isNew ? 'is-new' : ''} `).replace('style="', `style="--i:${i};`)}>${frameDeco(r.tier)}
            <div class="gr-icon ${r.gear ? 'gear' : ''}">${r.icon}</div>
            <div class="gr-tier">${r.tier}</div>
            <div class="gr-name">${r.name}</div>
            ${r.sub ? `<div class="gr-sub">${r.sub}</div>` : ''}
        </div>`).join('');
    // 캡슐이 흔들리다 터짐 (좋은 게 나올수록 오래, 소리도 올라감)
    const wait = bi >= 5 ? 2000 : bi >= 4 ? 1400 : 900;
    let k = 0;
    const tick = setInterval(() => { playTone(300 + k * 40 + bi * 30, 'square', 0.08 * soundSettings.master, 0.005, 0.06); k++; }, 110);
    clearTimeout(gachaRevealTimer);
    const reveal = () => {
        clearInterval(tick);
        clearTimeout(gachaRevealTimer);
        if (box.classList.contains('revealed')) return;
        box.classList.add('revealed');
        if (bi >= 4) playDropSound(bi >= 5 ? 'MYTHIC' : 'LEGEND'); else playNormalDrop();
        if (results.some(r => r.gear)) attachGearPreviews(grid);
    };
    gachaRevealTimer = setTimeout(reveal, wait);
    box.querySelector('.gr-capsule').onclick = reveal;
}
$('gacha-result').addEventListener('click', e => {
    if (!e.target.closest('.gr-ok')) return;
    const hatch = box_isHatch();
    $('gacha-result').classList.add('hidden');
    $('gacha-result').classList.remove('egg-mode');
    if (hatch) { renderPets(); stagger($('pet-panel')); } else renderGacha();
});

/* =========================================================
   🐾 펫 창: 둥지 3칸 · 알 부화 · 성 합성
   ========================================================= */
function eggHtml(egg, cls = '') {
    return `<div class="egg ${cls}" style="--ec:${egg.color};--es:${egg.spot}"><i></i><i></i><i></i><i></i></div>`;
}
const box_isHatch = () => $('gacha-result').classList.contains('egg-mode');
const petStarHtml = s => `<span class="pet-star">${'★'.repeat(s)}<i>${'★'.repeat(STAR_MAX - s)}</i></span>`;
const fmtLeft = ms => { const m = Math.ceil(ms / 60000), h = Math.floor(m / 60); return h ? `${h}시간 ${m % 60}분` : `${m}분`; };
let petTab = 'nest', petPickNest = -1, petTimer = 0;
const NEST_PRICE = [500000, 2000000];   // 4번째·5번째 둥지 (최대 5개)
function updatePetDot() {
    const st = petState();
    const ready = st.nests.some(n => n && n.end <= Date.now());
    const canPut = st.nests.some(n => !n) && Object.values(st.eggs).some(v => v > 0);
    document.querySelector('.pet-dot')?.classList.toggle('hidden', !(ready || canPut));
}
/* ---------- ✨ 합성의 제단 ---------- */
let mergeSel = null;   // 'petId:성'
const gKey = g => `${g.id}:${g.s}`;
function mergeAltarHtml(groups) {
    const can = groups.filter(g => g.s < STAR_MAX && g.list.length >= 2);
    if (!can.some(g => gKey(g) === mergeSel)) mergeSel = can[0] ? gKey(can[0]) : null;
    const sel = can.find(g => gKey(g) === mergeSel);
    const d = sel && PET_BY_ID[sel.id];
    const slot = (cls, g, s) => g
        ? `<div class="al-slot ${cls}" style="--c:${TIER_COL[PET_BY_ID[g.id].tier]}"><canvas data-gear="${g.id}" aria-hidden="true"></canvas>${petStarHtml(s)}</div>`
        : `<div class="al-slot ${cls} empty"><span>?</span></div>`;
    const totalMerges = can.reduce((n, g) => n + Math.floor(g.list.length / 2), 0);
    return `
        <div class="altar ${sel ? 'ready' : ''}" ${d ? `style="--c:${TIER_COL[d.tier]}"` : ''}>
            <div class="al-head"><i></i><span>합성의 제단</span><i></i></div>
            <div class="al-stage">
                <div class="al-ring r1"></div><div class="al-ring r2"></div>
                ${slot('a', sel, sel?.s)}
                <div class="al-plus">＋</div>
                ${slot('b', sel, sel?.s)}
                <div class="al-beam l"></div><div class="al-beam r"></div>
                ${sel ? `<div class="al-slot out" style="--c:${TIER_COL[d.tier]}"><canvas data-gear="${sel.id}" aria-hidden="true"></canvas>${petStarHtml(sel.s + 1)}<em>NEW</em></div>` : `<div class="al-slot out empty"><span>✦</span></div>`}
            </div>
            <div class="al-info">${sel ? `
                <b>${d.name}</b>
                <div class="al-cmp"><span>★${sel.s} · ${petEffectText(d, sel.s)}</span><i>▶</i><span class="up">★${sel.s + 1} · ${petEffectText(d, sel.s + 1)}</span></div>` : `<b>합성할 수 있는 펫이 없어요</b><div class="al-cmp"><span>같은 펫 · 같은 성 2마리를 모으면 한 성 위 1마리가 돼요</span></div>`}
            </div>
            <button class="btn btn-block btn-gold al-go" data-mergego ${sel ? '' : 'disabled'}>✨ 합성하기</button>
        </div>
        ${can.length ? `<div class="glabel">재료 고르기 <span style="letter-spacing:0">${can.length}종</span>${totalMerges > 1 ? `<button class="al-all" data-mergeall>전부 합성 (${totalMerges}번)</button>` : ''}</div>
        <div class="al-pick">${can.map(g => {
            const pd = PET_BY_ID[g.id];
            return `<button class="al-card ${gKey(g) === mergeSel ? 'on' : ''}" data-mergesel="${gKey(g)}" style="--c:${TIER_COL[pd.tier]}">
                <div class="al-card-view"><canvas data-gear="${g.id}" aria-hidden="true"></canvas><span class="pet-cnt">×${g.list.length}</span></div>
                <div class="al-card-name">${pd.name}</div>${petStarHtml(g.s)}
            </button>`;
        }).join('')}</div>` : ''}
        ${groups.some(g => g.s < STAR_MAX && g.list.length < 2) ? `<div class="glabel">한 마리 더 필요해요</div>
        <div class="merge-wait">${groups.filter(g => g.s < STAR_MAX && g.list.length < 2).map(g => `<span style="--c:${TIER_COL[PET_BY_ID[g.id].tier]}">${PET_BY_ID[g.id].name} ★${g.s} <b>1/2</b></span>`).join('')}</div>` : ''}
        <div class="set-note">★2 효과 ×1.4 · ★3 ×1.9 · ★4 ×2.5 · ★5 ×3.2 (최대 ★${STAR_MAX})</div>`;
}

/* ---------- 🪙 펫 상인 (판매) ---------- */
const sellQty = {};
const spareOf = g => g.list.filter(p => p.u !== gameState.pet);
function petMerchantHtml(groups) {
    const rows = groups.filter(g => spareOf(g).length);
    // 중복 정리: 펫마다 가장 높은 성 1마리만 남기고 나머지
    const dupVal = petDupSweep(true);
    return `
        <div class="merchant">
            <div class="mc-head"><span class="mc-icon">🪙</span><div><b>펫 상인</b><small>남는 펫을 JC로 바꿔 드려요 · 함께하는 펫은 안 팔아요</small></div></div>
            <button class="btn btn-block mc-sweep" data-sellsweep ${dupVal.n ? '' : 'disabled'}>🧹 중복 정리 · 펫마다 제일 높은 성 1마리만 남기고 팔기${dupVal.n ? `<small>${dupVal.n}마리 → +${fmt(dupVal.jc)} JC</small>` : '<small>정리할 중복이 없어요</small>'}</button>
        </div>
        ${rows.length ? `<div class="mc-list">${rows.map(g => {
            const pd = PET_BY_ID[g.id], k = gKey(g), max = spareOf(g).length;
            const q = Math.min(max, Math.max(1, sellQty[k] || 1)), each = petSellPrice(g.id, g.s);
            return `<div class="mc-row" style="--c:${TIER_COL[pd.tier]}">
                <div class="mc-view"><canvas data-gear="${g.id}" aria-hidden="true"></canvas></div>
                <div class="mc-info">
                    <div class="mc-name">${pd.name} ${petStarHtml(g.s)}</div>
                    <small>팔 수 있는 ${max}마리 · 1마리 ${fmt(each)} JC</small>
                    <div class="mc-qty">
                        <button data-sellstep="${k}:-1" ${q <= 1 ? 'disabled' : ''}>−</button><b>${q}</b><button data-sellstep="${k}:1" ${q >= max ? 'disabled' : ''}>＋</button>
                        <button class="mc-max" data-sellstep="${k}:max">최대</button>
                    </div>
                </div>
                <button class="btn btn-sm btn-gold mc-go" data-sellgo="${k}">팔기<small>+${fmt(each * q)}</small></button>
            </div>`;
        }).join('')}</div>` : `<div class="empty">팔 수 있는 펫이 없어요</div>`}`;
}
// 중복 정리 계산 (dry=true면 계산만)
function petDupSweep(dry) {
    const st = petState(), best = {};
    for (const p of st.petList) if (!best[p.id] || p.s > best[p.id].s || (p.s === best[p.id].s && p.u === gameState.pet)) best[p.id] = p;
    if (gameState.pet) { const on = petOn(); if (on) best[on.id] = best[on.id]?.s > on.s ? best[on.id] : on; }
    const keep = new Set([...Object.values(best).map(p => p.u), gameState.pet]);
    const sell = st.petList.filter(p => !keep.has(p.u));
    const jc = sell.reduce((t, p) => t + petSellPrice(p.id, p.s), 0);
    if (!dry) { st.petList = st.petList.filter(p => keep.has(p.u)); gameState.jc += jc; }
    return { n: sell.length, jc };
}
function sellPetGroup(k, n) {
    const [id, sStr] = k.split(':'), s = +sStr, st = petState();
    const spare = st.petList.filter(p => p.id === id && p.s === s && p.u !== gameState.pet).slice(0, n);
    if (!spare.length) return;
    const jc = spare.reduce((t, p) => t + petSellPrice(p.id, p.s), 0);
    const gone = new Set(spare.map(p => p.u));
    st.petList = st.petList.filter(p => !gone.has(p.u));
    gameState.jc += jc; delete sellQty[k];
    saveGame(); renderStats(); renderPets();
    toast(`🪙 ${PET_BY_ID[id].name} ★${s} ${spare.length}마리 판매 +${fmt(jc)} JC`, 'gold');
    playTone(880, 'triangle', 0.1 * soundSettings.master, 0.005, 0.15);
}

function renderPets() {
    const st = petState(), el = $('pet-panel');
    clearInterval(petTimer);
    document.querySelectorAll('#sheet-pet .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === petTab));
    if (petTab === 'nest') {
        const now = Date.now();
        const eggsOwned = EGGS.filter(e => st.eggs[e.id] > 0);
        el.innerHTML = `
            <div class="nests">${st.nests.map((n, i) => {
                if (!n) return `<button class="nest nest-empty ${petPickNest === i ? 'pick' : ''}" data-nest="${i}"><div class="nest-view"><canvas data-gear="nest::idle" aria-hidden="true"></canvas><span class="nest-plus">＋</span></div><div class="nest-name">빈 둥지</div><small>${petPickNest === i ? '아래에서 알 고르기' : '눌러서 알 넣기'}</small></button>`;
                const egg = EGG_BY_ID[n.egg], left = n.end - now, ready = left <= 0;
                const pct = Math.min(100, (now - n.start) / (n.end - n.start) * 100);
                return `<button class="nest ${ready ? 'ready' : ''}" data-nest="${i}">
                    <div class="nest-view"><canvas data-gear="nest:${egg.id}:${ready ? 'ready' : left < 600000 ? 'wobble' : 'idle'}" aria-hidden="true"></canvas>${ready ? '<span class="nest-glow"></span>' : ''}</div>
                    <div class="nest-name">${egg.name}</div>
                    ${ready ? '<div class="nest-ready">부화!</div>' : `<div class="nest-bar"><i style="width:${pct}%"></i></div><small class="nest-left" data-left="${n.end}">${fmtLeft(left)}</small>`}
                </button>`;
            }).join('')}${NEST_PRICE.slice(st.nests.length - 3).map((price, k) => {
                const i = st.nests.length + k;
                return `<button class="nest nest-locked" ${k === 0 ? `data-nestbuy="${i}"` : 'disabled'}><div class="nest-view"><canvas data-gear="nest::idle" aria-hidden="true"></canvas><span class="nest-plus">🔒</span></div><div class="nest-name">${i + 1}번 둥지</div><small>${k === 0 ? `${fmt(price)} JC` : '앞 둥지 먼저'}</small></button>`;
            }).join('')}</div>
            <div class="glabel">가진 알 ${petPickNest >= 0 ? '<span class="pet-hint">· 넣을 알을 골라요</span>' : ''}</div>
            ${eggsOwned.length ? `<div class="egg-inv">${eggsOwned.map(e => `
                <button class="egg-slot" data-putegg="${e.id}" style="--ec:${e.color}">
                    <div class="egg-slot-view"><canvas data-gear="egg:${e.id}" aria-hidden="true"></canvas><span class="egg-n">×${st.eggs[e.id]}</span></div><b>${e.name}</b><small style="color:${TIER_COL[e.tier]}">${e.tier} · ${e.hours}시간</small>
                </button>`).join('')}</div>` : `<div class="empty">알이 없어요.<br>상점 → 행운 뽑기에서 가끔 나와요.</div>`}
            <details class="godds"><summary>알 정보</summary>${EGGS.map(e => {
                const t = Object.values(e.odds).reduce((a, b) => a + b, 0);
                return `<div class="egg-od"><b style="color:${TIER_COL[e.tier]}">${e.name}</b> · ${e.hours}시간<br>${Object.entries(e.odds).map(([k, w]) => `<span style="color:${TIER_COL[k]}">${k} ${Math.round(w / t * 100)}%</span>`).join(' ')}</div>`;
            }).join('')}</details>
            ${backupGameState !== null ? `<div class="dev-eggs"><div class="glabel">🛠 개발자</div>
                <button class="btn btn-block" data-devhatch="nests">⚡ 둥지 전부 바로 부화</button>
                <button class="btn btn-block" data-devhatch="all">⚡ 가진 알 전부 한번에 까기</button></div>` : ''}`;
        attachGearPreviews(el);
        petTimer = setInterval(() => {
            if ($('sheet-pet').classList.contains('hidden')) return clearInterval(petTimer);
            let redo = false;
            el.querySelectorAll('[data-left]').forEach(s => { const l = +s.dataset.left - Date.now(); if (l <= 0) redo = true; else s.textContent = fmtLeft(l); });
            if (redo) { renderPets(); updatePetDot(); }
        }, 10000);
    } else if (petTab === 'mine' || petTab === 'merge' || petTab === 'sell') {
        // 같은 펫 · 같은 성끼리 한 칸으로 묶음
        const groups = [];
        for (const p of st.petList) {
            let g = groups.find(x => x.id === p.id && x.s === p.s);
            if (!g) groups.push(g = { id: p.id, s: p.s, list: [] });
            g.list.push(p);
        }
        const score = g => { const d = PET_BY_ID[g.id]; return ((d.luck || 0) + (d.speed || 0) * 4) * starMult(g.s); };
        groups.sort((a, b) => score(b) - score(a));
        if (!groups.length) { el.innerHTML = `<div class="empty">아직 펫이 없어요.<br>🪺 둥지에 알을 넣어 부화시켜 봐요.</div>`; return; }
        const on = petOn();
        if (petTab === 'mine') {
            const od = on && PET_BY_ID[on.id];
            el.innerHTML = `
                <div class="pet-hero ${on ? '' : 'none'}" ${on ? `style="--c:${TIER_COL[od.tier]}"` : ''}>
                    ${on ? `<div class="pet-hero-view"><canvas data-gear="${on.id}" aria-hidden="true"></canvas></div>
                    <div class="pet-hero-info">
                        <div class="pet-hero-label">함께하는 펫</div>
                        <div class="pet-hero-name">${od.name}</div>
                        ${petStarHtml(on.s)}
                        <div class="pet-hero-eff">${petEffectText(od, on.s)}</div>
                        <button class="btn btn-sm" data-petuse="${on.u}">집에 보내기</button>
                    </div>` : `<div class="pet-hero-empty">함께하는 펫이 없어요<br><small>아래에서 눌러서 데려가요</small></div>`}
                </div>
                <div class="glabel">내 펫 <span style="letter-spacing:0">${st.petList.length}마리</span> <span class="pet-hint">· 누르면 데려가기</span></div>
                <div class="pet-grid">${groups.map(g => {
                    const d = PET_BY_ID[g.id], isOn = on && g.list.some(p => p.u === on.u);
                    return `<button class="pet-card ${isOn ? 'on' : ''}" data-petuse="${isOn ? '' : g.list[0].u}" style="--c:${TIER_COL[d.tier]}">
                        <div class="pet-card-view"><canvas data-gear="${g.id}" aria-hidden="true"></canvas>
                            ${g.list.length > 1 ? `<span class="pet-cnt">×${g.list.length}</span>` : ''}${isOn ? '<span class="pet-on">함께하는 중</span>' : ''}</div>
                        <div class="pet-card-name">${d.name}</div>
                        ${petStarHtml(g.s)}
                        <div class="pet-card-eff">${petEffectText(d, g.s)}</div>
                    </button>`;
                }).join('')}</div>`;
        } else {
            if (petTab === 'merge') el.innerHTML = mergeAltarHtml(groups);
            else el.innerHTML = petMerchantHtml(groups);
        }
        attachGearPreviews(el);
    } else {
        el.innerHTML = `<div class="glabel">펫 도감 <span style="letter-spacing:0">${PETS.filter(p => st.petList.some(x => x.id === p.id)).length} / ${PETS.length}</span></div>
        <div class="ggears">${PETS.map(p => {
            const best = Math.max(0, ...st.petList.filter(x => x.id === p.id).map(x => x.s));
            return `<div class="ggear ${best ? 'own' : 'locked'}" style="--c:${TIER_COL[p.tier]}">
                <div class="ggear-view"><canvas data-gear="${p.id}" aria-hidden="true"></canvas>${best ? `<span class="ggear-own">★${best}</span>` : ''}</div>
                <div class="ggear-name">${best ? p.name : '???'}</div>
                <div class="ggear-tier">${p.tier} · ${petEffectText(p, 1)}</div>
            </div>`;
        }).join('')}</div>`;
        attachGearPreviews(el.querySelector('.ggears'));
    }
}
// 알 하나를 까서 펫 한 마리 추가 → 결과 카드 정보
function rollPetFromEgg(egg) {
    const st = petState();
    let r = Math.random() * Object.values(egg.odds).reduce((a, b) => a + b, 0), tier = 'COMMON';
    for (const [t, w] of Object.entries(egg.odds)) { r -= w; if (r <= 0) { tier = t; break; } }
    const pool = PETS.filter(p => p.tier === tier);
    const pet = pool[Math.floor(Math.random() * pool.length)];
    const isNew = !st.petList.some(p => p.id === pet.id);
    const u = newPetUid();
    st.petList.push({ u, id: pet.id, s: 1 });
    if (!gameState.pet) gameState.pet = u;
    return { pet, tier, isNew };
}
function showHatch(egg, got) {
    saveGame(); renderStats(); applyGear(); updatePetDot();
    renderPets();   // 둥지·알 칸 바로 갱신
    // 같은 펫은 한 장으로 묶음
    const cards = [];
    for (const g of got) {
        const c = cards.find(x => x.id === g.pet.id);
        if (c) { c.n++; c.isNew ||= g.isNew; continue; }
        cards.push({ id: g.pet.id, n: 1, tier: g.tier, pet: g.pet, isNew: g.isNew });
    }
    $('gacha-result').classList.add('egg-mode');
    $('gacha-result').querySelector('.gr-capsule').innerHTML = eggHtml(egg, 'big');
    showGachaResult(cards.map(c => ({ tier: c.tier, name: c.pet.name + (c.n > 1 ? ` ×${c.n}` : ''), sub: `★1 · ${petEffectText(c.pet, 1)}`, icon: `<canvas data-gear="${c.pet.id}" aria-hidden="true"></canvas>`, gear: true, isNew: c.isNew })));
}
function hatchNest(i) {
    const st = petState(), n = st.nests[i];
    if (!n || n.end > Date.now()) return;
    const egg = EGG_BY_ID[n.egg];
    st.nests[i] = null;
    showHatch(egg, [rollPetFromEgg(egg)]);
}
// 개발자 모드: 기다리지 않고 한번에 부화
function devHatch(kind) {
    if (backupGameState === null) return;
    const st = petState(), got = [];
    let best = null;
    const take = egg => { got.push(rollPetFromEgg(egg)); if (!best || EGGS.indexOf(egg) > EGGS.indexOf(best)) best = egg; };
    st.nests.forEach((n, i) => { if (n) { take(EGG_BY_ID[n.egg]); st.nests[i] = null; } });
    if (kind === 'all') for (const e of EGGS) { while (st.eggs[e.id] > 0) { st.eggs[e.id]--; take(e); } delete st.eggs[e.id]; }
    if (!got.length) { toast('깔 알이 없어요', 'bad'); return; }
    showHatch(best, got);
}
// 펫 판매가: 등급 기본값 × 2^(성-1)
const PET_SELL = { COMMON: 3000, RARE: 12000, EPIC: 45000, LEGEND: 180000, MYTHIC: 700000 };
const petSellPrice = (id, s) => PET_SELL[PET_BY_ID[id].tier] * Math.pow(2, s - 1);
function sellPet(u) {
    const st = petState(), p = st.petList.find(x => x.u === u);
    if (!p || p.u === gameState.pet) return;
    const price = petSellPrice(p.id, p.s);
    st.petList.splice(st.petList.indexOf(p), 1);
    gameState.jc += price;
    saveGame(); renderStats(); renderPets();
    toast(`🐾 ${PET_BY_ID[p.id].name} ★${p.s} 판매 +${fmt(price)} JC`, 'gold');
}
function mergeAllPets() {
    const st = petState();
    let n = 0, guard = 0;
    for (;;) {
        if (guard++ > 500) break;
        const p = st.petList.find(a => a.s < STAR_MAX && st.petList.some(b => b !== a && b.id === a.id && b.s === a.s));
        if (!p) break;
        mergePet(p.u, true); n++;
    }
    saveGame(); renderStats(); applyGear(); renderPets(); stagger($('pet-panel'));
    toast(`✨ ${n}번 합성했어요!`, 'gold');
}
function mergePet(u, quiet = false) {
    const st = petState(), a = st.petList.find(p => p.u === u);
    if (!a || a.s >= STAR_MAX) return;
    // 데리고 있는 애는 남기고, 다른 한 마리를 재료로 씀
    const b = st.petList.find(p => p.u !== a.u && p.id === a.id && p.s === a.s && p.u !== gameState.pet) || st.petList.find(p => p.u !== a.u && p.id === a.id && p.s === a.s);
    if (!b) return;
    const keep = b.u === gameState.pet ? b : a, gone = keep === a ? b : a;
    st.petList.splice(st.petList.indexOf(gone), 1);
    keep.s++;
    if (quiet) return;
    saveGame(); renderStats(); applyGear(); renderPets(); stagger($('pet-panel'));
    toast(`✨ ${PET_BY_ID[keep.id].name} ★${keep.s} 달성!`, 'gold');
    playTone(660, 'triangle', 0.12 * soundSettings.master, 0.01, 0.3);
    setTimeout(() => playTone(990, 'triangle', 0.12 * soundSettings.master, 0.01, 0.5), 120);
}
$('sheet-pet').addEventListener('click', e => {
    const tab = e.target.closest('#sheet-pet .tab');
    if (tab) { petTab = tab.dataset.tab; petPickNest = -1; renderPets(); stagger($('pet-panel')); return; }
    const st = petState();
    const nb = e.target.closest('[data-nestbuy]');
    if (nb) {
        const price = NEST_PRICE[+nb.dataset.nestbuy - 3];
        if (gameState.jc < price) { toast('JC가 부족해요', 'bad'); return; }
        gameState.jc -= price; st.nests.push(null);
        saveGame(); renderStats(); renderPets(); updatePetDot();
        toast(`🪺 ${st.nests.length}번 둥지를 열었어요`, 'good');
        return;
    }
    const nest = e.target.closest('[data-nest]');
    if (nest) {
        const i = +nest.dataset.nest, n = st.nests[i];
        if (!n) {
            const have = EGGS.filter(x => st.eggs[x.id] > 0);
            if (!have.length) { toast('알이 없어요. 행운 뽑기에서 나와요', 'bad'); return; }
            petPickNest = petPickNest === i ? -1 : i;
            renderPets();
        } else if (n.end <= Date.now()) hatchNest(i);
        else toast(`🥚 ${fmtLeft(n.end - Date.now())} 남았어요`);
        return;
    }
    const pe = e.target.closest('[data-putegg]');
    if (pe) {
        const i = petPickNest >= 0 && !st.nests[petPickNest] ? petPickNest : st.nests.findIndex(n => !n);
        if (i < 0) { toast('둥지가 꽉 찼어요', 'bad'); return; }
        const egg = EGG_BY_ID[pe.dataset.putegg];
        st.eggs[egg.id]--;
        if (st.eggs[egg.id] <= 0) delete st.eggs[egg.id];
        const cut = amu().abil === 'hatch' ? amu().hatchCut : 0;
        st.nests[i] = { egg: egg.id, start: Date.now(), end: Date.now() + egg.hours * 3600000 * (1 - cut) };
        petPickNest = -1;
        saveGame(); renderPets(); updatePetDot();
        toast(`🪺 ${egg.name}을(를) 둥지에 넣었어요 · ${egg.hours}시간 뒤 부화`, 'good');
        return;
    }
    const use = e.target.closest('[data-petuse]');
    if (use) {
        if (!use.dataset.petuse) return;
        gameState.pet = gameState.pet === use.dataset.petuse ? null : use.dataset.petuse;
        if (gameState.pet) toast(`🐾 ${PET_BY_ID[petOn().id].name}와(과) 함께해요`, 'good');
        saveGame(); renderStats(); applyGear(); renderPets();
        return;
    }
    const dh = e.target.closest('[data-devhatch]');
    if (dh) { devHatch(dh.dataset.devhatch); return; }
    if (e.target.closest('[data-mergeall]')) { mergeAllPets(); return; }
    const ms = e.target.closest('[data-mergesel]');
    if (ms) { mergeSel = ms.dataset.mergesel; renderPets(); return; }
    if (e.target.closest('[data-mergego]')) {
        const [id, sStr] = (mergeSel || '').split(':');
        const p = st.petList.find(x => x.id === id && x.s === +sStr);
        if (!p) return;
        const alt = $('pet-panel').querySelector('.altar');
        alt?.classList.add('fusing');
        e.target.closest('[data-mergego]').disabled = true;
        playTone(440, 'sawtooth', 0.06 * soundSettings.master, 0.01, 0.6);
        setTimeout(() => mergePet(p.u), 900);
        return;
    }
    const sst = e.target.closest('[data-sellstep]');
    if (sst) {
        const [id, sv, d] = sst.dataset.sellstep.split(':'), k = `${id}:${sv}`;
        const max = st.petList.filter(p => p.id === id && p.s === +sv && p.u !== gameState.pet).length;
        sellQty[k] = d === 'max' ? max : Math.max(1, Math.min(max, (sellQty[k] || 1) + +d));
        renderPets(); return;
    }
    const sg = e.target.closest('[data-sellgo]');
    if (sg) { const k = sg.dataset.sellgo; sellPetGroup(k, sellQty[k] || 1); return; }
    if (e.target.closest('[data-sellsweep]')) {
        const v = petDupSweep(true);
        if (!v.n) return;
        ask({ title: '중복 펫을 정리할까요?', message: `펫마다 제일 높은 성 1마리만 남기고\n${v.n}마리를 팔아요 (+${fmt(v.jc)} JC)\n\n합성 재료로 쓸 펫도 같이 팔려요!`, okText: '정리하기', danger: true }).then(ok => {
            if (!ok) return;
            const r = petDupSweep(false);
            saveGame(); renderStats(); renderPets();
            toast(`🧹 ${r.n}마리 정리 +${fmt(r.jc)} JC`, 'gold');
        });
        return;
    }
    const ps = e.target.closest('[data-petsell]');
    if (ps) { sellPet(ps.dataset.petsell); return; }
    const mg = e.target.closest('[data-merge]');
    if (mg) mergePet(mg.dataset.merge);
});
$('gacha-panel').addEventListener('click', e => {
    const b = e.target.closest('[data-pull]');
    if (b) pullGacha(+b.dataset.pull);
    if (e.target.closest('[data-ticket]')) pullGacha(1, true);
    const g = e.target.closest('[data-ggear]');
    if (g) openGearDetail(g.dataset.ggear);
    if (e.target.closest('[data-pityhelp]')) {
        pityHelpOpen = !pityHelpOpen;
        e.target.closest('.gpity').classList.toggle('open', pityHelpOpen);
    }
});

// 뽑기 장비를 누르면 크게 보여 줌 (3D + 효과 + 확률)
function openGearDetail(id) {
    const found = bannerOfGear(id);
    const gear = CRAFT_BY_ID[id];
    if (!gear || !found) return;
    const B = found[1], e = B.pool.find(x => x.id === id);
    const own = gameState.craftedGears.includes(id);
    const gEn = gearOf(id), lv = gearLv(id);
    const chips = [];
    if (gEn.luckBonus) chips.push(`<span class="chip luck">행운 +${Math.round(gEn.luckBonus * 100)}%</span>`);
    if (gEn.speedBonus) chips.push(`<span class="chip speed">속도 +${Math.round(gEn.speedBonus * 100)}%</span>`);
    if (gEn.amuletMult) chips.push(`<span class="chip amulet">${gear.amuletEvery || 10}롤마다 행운 ×${gEn.amuletMult}</span>`);
    if (gEn.biomeBoost) chips.push(`<span class="chip biome">바이옴 ×${gEn.biomeBoost} · 지속 ×${gear.biomeTime}</span>`);
    if (gear.jcBonus) chips.push(`<span class="chip amulet">롤마다 판매가 ${Math.round(gear.jcBonus * 100)}% JC (최대 ${fmt(gEn.jcBonusMax)})</span>`);
    const box = $('gear-detail');
    box.style.setProperty('--c', TIER_COL[e.tier]);
    box.querySelector('.gd-card').innerHTML = `
        <button class="gd-close" data-gdclose aria-label="닫기">✕</button>
        <div class="gd-view"><canvas data-gear="${id}" aria-hidden="true"></canvas></div>
        <div class="gd-tier">${e.tier}</div>
        <div class="gd-name">${gear.name}${lvTag(gEn)}</div>
        <div class="chips gd-chips">${chips.join('')}</div>
        <div class="gd-desc">${gear.desc}<br><span>${gear.category === 'amulet' ? '왼팔에 매다는 부적' : '오른팔에 끼는 건틀렛'}</span></div>
        <div class="gd-odds">
            <div><span>뽑기 1회</span><b>${gachaPct(e.w, B.total)}</b></div>
            <div><span>천장 때</span><b>${pityPct(B, e)}</b></div>
            <div><span>중복이면</span><b>${lv < GEAR_LV_MAX ? `강화 +1 (효과 +10%)` : `+${fmt(e.dupe)} JC`}</b></div>
        </div>
        <div class="gd-own ${own ? 'on' : ''}">${own ? `보유 중 · 강화 ${lv} / ${GEAR_LV_MAX}${lv >= GEAR_LV_MAX ? ' MAX' : ''}` : '아직 없음'}</div>`;
    box.classList.remove('hidden');
    attachGearPreviews(box);
}
$('gear-detail').addEventListener('click', e => {
    if (e.target.closest('[data-gdclose]') || e.target.id === 'gear-detail') {
        $('gear-detail').classList.add('hidden');
        attachGearPreviews($('gacha-panel').querySelector('.ggears'));
    }
});

/* =========================================================
   👑 어드민 어뷰즈 (Supabase)
   - 관리자 모드에서 이벤트를 보내면 admin_events 표에 한 줄 추가됨
   - 모든 게임이 20초마다(화면 안 볼 땐 2분마다) 새 줄이 있는지 확인해서 터뜨림
   - 늦게 들어온 사람도 아직 안 끝난 행운 폭탄/바이옴/선물은 받음
   ========================================================= */

const SB_URL = 'https://vccpgfalbvanmwitkoqy.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY3BnZmFsYnZhbm13aXRrb3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjU3MDUsImV4cCI6MjEwNzY0MTcwNX0.oQ1lvr191cygdxK1qkQMjxWvvqMV9bUisOpR7xbFq4U';
const SB_HEADERS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
let adminLuck = { mult: 1, until: 0 };
let evLastId = 0, evStarted = false, evTimer = 0, evOnline = null;
const evDone = new Set();
function getAdminLuck() { return adminLuck.until > Date.now() ? adminLuck.mult : 1; }

async function sbFetch(path, opts = {}) {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { ...SB_HEADERS, ...(opts.headers || {}) }, cache: 'no-store' });
    if (!r.ok) throw new Error(`supabase ${r.status}`);
    return r.status === 204 || r.status === 201 ? null : r.json();
}
function setOnline(v) { evOnline = v; const el = $('admin-status'); if (el) { el.textContent = v ? '🟢 서버 연결됨' : '🔴 서버 연결 안 됨'; el.classList.toggle('on', v); } }

// 이벤트 한 줄을 실제 게임에 적용. late = 게임 켜면서 지난 이벤트를 따라잡는 중
function applyAdminEvent(ev, late) {
    if (evDone.has(ev.id)) return;
    evDone.add(ev.id);
    const start = new Date(ev.created_at).getTime();
    const end = start + (ev.duration || 0) * 1000;
    const now = Date.now();
    const d = ev.data || {};
    if (ev.kind === 'luck') {
        if (end <= now) return;
        adminLuck = { mult: d.mult || 2, until: end };
        adminBanner('👑', `어드민 어뷰즈!`, `모두 행운 ×${fmt(d.mult)} · ${Math.round(ev.duration / 60)}분`, '#ffd23a');
        renderStats(); renderBuffs();
    } else if (ev.kind === 'biome') {
        const b = BIOME_BY_ID[d.biome];
        if (!b || end <= now) return;
        gameState.biome = { id: b.id, until: end };
        saveGame(); applyBiome(true);
    } else if (ev.kind === 'announce') {
        // 이미 본 공지 / 오래된 공지는 다시 안 띄움 (게임 다시 켜도)
        if (ev.id <= seenAnnId() || now - start > (late ? 90000 : 600000)) return;
        markAnnSeen(ev.id);
        chatLine(d.nick || '관리자', d.text || '');
    } else if (ev.kind === 'rare') {
        if (d.cid === CLIENT_ID) return;               // 내가 뽑은 건 내 컷씬으로 봄
        if (ev.id <= seenAnnId() || now - start > (late ? 60000 : 600000)) return;
        markAnnSeen(ev.id);
        const a = AURA_BY_ID[d.aura];
        if (a) queueRareBanner(d.nick || '누군가', a);
    } else if (ev.kind === 'gift') {
        if (end <= now) return;
        gameState.claimedEvents = gameState.claimedEvents || [];
        if (gameState.claimedEvents.includes(ev.id)) return;
        gameState.claimedEvents.push(ev.id);
        if (gameState.claimedEvents.length > 60) gameState.claimedEvents.splice(0, 20);
        if (d.jc) gameState.jc += d.jc;
        if (d.items) addItems(d.items);
        saveGame(); renderStats(); renderPotions();
        const what = [d.jc ? `${fmt(d.jc)} JC` : '', ...Object.entries(d.items || {}).map(([id, n]) => `${SHOP_BY_ID[id]?.name || id} ×${n}`)].filter(Boolean).join(' · ');
        adminBanner('🎁', '어드민 선물!', what, '#ff9ad0');
    }
}
// 마지막으로 본 공지 번호 (새로고침해도 기억)
function seenAnnId() { try { return +localStorage.getItem('js_rng_ann') || 0; } catch (e) { return 0; } }
function markAnnSeen(id) { try { if (id > seenAnnId()) localStorage.setItem('js_rng_ann', id); } catch (e) {} }
// 로블록스 채팅처럼 "이름: 내용" 한 줄씩 위에 쌓임
function chatLine(nick, text) {
    const feed = $('chat-feed');
    const line = document.createElement('div');
    line.className = 'chat-line';
    line.innerHTML = `<b class="chat-nick">👑 ${escapeHtml(nick)}</b><span class="chat-sep">:</span> <span class="chat-text">${escapeHtml(text)}</span>`;
    feed.appendChild(line);
    while (feed.children.length > 4) feed.firstChild.remove();
    setTimeout(() => line.classList.add('out'), 12000);
    setTimeout(() => line.remove(), 12600);
    playTone(880, 'triangle', 0.1 * soundSettings.master, 0.005, 0.12);
    setTimeout(() => playTone(1175, 'triangle', 0.1 * soundSettings.master, 0.005, 0.18), 90);
}
function adminBanner(icon, title, sub, color, ms = 4200) {
    const ban = $('admin-banner');
    ban.style.setProperty('--ac', color);
    ban.innerHTML = `<div class="ab-crown">${icon}</div><div class="ab-title">${escapeHtml(title)}</div><div class="ab-sub">${escapeHtml(sub)}</div>`;
    ban.classList.remove('hidden', 'show'); void ban.offsetWidth; ban.classList.add('show');
    ban.style.animationDuration = `${ms}ms`;
    clearTimeout(ban._t); ban._t = setTimeout(() => ban.classList.add('hidden'), ms);
    stage3d?.flash?.();
    playTone(523, 'square', 0.12 * soundSettings.master, 0.01, 0.25);
    setTimeout(() => playTone(784, 'square', 0.12 * soundSettings.master, 0.01, 0.4), 140);
    setTimeout(() => playTone(1046, 'triangle', 0.14 * soundSettings.master, 0.01, 0.8), 280);
}

/* ---------- 🌟 희귀 칭호 전체 알림 (ANCIENT 이상) ---------- */
const CLIENT_ID = (() => { try { let c = localStorage.getItem('js_rng_cid'); if (!c) { c = Math.random().toString(36).slice(2, 12); localStorage.setItem('js_rng_cid', c); } return c; } catch (e) { return 'x' + Math.random(); } })();
function broadcastRare(a) {
    if (backupGameState !== null) return;   // 개발자 모드는 방송 안 함
    const nick = session?.nick || '게스트';
    fetch(`${SB_URL}/rest/v1/admin_events`, { method: 'POST', cache: 'no-store', headers: { ...SB_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ kind: 'rare', data: { nick, aura: a.id, cid: CLIENT_ID }, duration: 0 }) }).catch(() => {});
}
const rareQueue = [];
let rareShowing = false;
function queueRareBanner(nick, a) { rareQueue.push({ nick, a }); showNextRare(); }
function showNextRare() {
    if (rareShowing || !rareQueue.length) return;
    if (document.body.classList.contains('cine-on')) { setTimeout(showNextRare, 1500); return; }   // 내 컷씬 끝나고
    rareShowing = true;
    const { nick, a } = rareQueue.shift();
    const el = $('rare-banner');
    el.style.setProperty('--rc', a.color);
    el.innerHTML = `<span class="rb-star">${a.grade === 'JXS' ? '👑' : a.grade === 'ABSOLUTE' ? '💠' : '🌟'}</span>
        <span class="rb-text"><b>${escapeHtml(nick)}</b>님이 <span class="rb-grade ${gradeCol(a.grade)}">${a.grade}</span> <b class="rb-name">${escapeHtml(a.name)}</b>을(를) 뽑았습니다!<small>1 in ${fmt(a.in)}</small></span>`;
    el.className = `rare-banner g-${a.grade.toLowerCase()}`;
    void el.offsetWidth; el.classList.add('show');
    playTone(a.grade === 'JXS' ? 880 : 660, 'triangle', 0.12 * soundSettings.master, 0.01, 0.6);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => { rareShowing = false; showNextRare(); }, 500); }, a.grade === 'JXS' ? 7000 : 5000);
}

let evPrimed = false;
async function pollAdminEvents(first) {
    if (!first && !evPrimed) first = true;   // 첫 확인이 끝나기 전엔 옛 이벤트를 새 것처럼 받지 않게
    try {
        // 처음엔 최근 6시간치(진행 중인 이벤트 따라잡기), 그다음부턴 새 줄만
        const q = first
            ? `admin_events?select=*&created_at=gte.${new Date(Date.now() - 6 * 3600000).toISOString()}&order=id.asc&limit=200`
            : `admin_events?select=*&id=gt.${evLastId}&order=id.asc&limit=20`;
        const rows = await sbFetch(q);
        setOnline(true);
        for (const ev of rows || []) { evLastId = Math.max(evLastId, ev.id); applyAdminEvent(ev, first); }
        evPrimed = true;
    } catch (e) { setOnline(false); }
}
function scheduleAdminPoll() {
    clearTimeout(evTimer);
    evTimer = setTimeout(async () => { await pollAdminEvents(false); scheduleAdminPoll(); }, document.hidden ? 120000 : 20000);
}
function startAdminEvents() {
    if (evStarted) return;
    evStarted = true;
    pollAdminEvents(true).then(scheduleAdminPoll);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { pollAdminEvents(false); scheduleAdminPoll(); } });
}
async function sendAdminEvent(kind, data, duration) {
    try {
        await sbFetch('admin_events', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ kind, data, duration }) });
        toast('👑 보냈어요! 모두에게 20초 안에 터져요', 'gold');
        pollAdminEvents(false);
    } catch (e) { toast('서버에 못 보냈어요. 표를 만들었는지 확인해 주세요', 'bad'); }
}
$('sheet-admin').addEventListener('click', e => {
    const b = e.target.closest('[data-abuse]');
    if (!b) return;
    const k = b.dataset.abuse;
    if (k === 'luck') sendAdminEvent('luck', { mult: +$('ab-luck-mult').value }, +$('ab-luck-min').value * 60);
    else if (k === 'biome') sendAdminEvent('biome', { biome: $('ab-biome').value }, +$('ab-biome-min').value * 60);
    else if (k === 'announce') {
        const text = $('ab-text').value.trim();
        if (!text) { toast('공지 내용을 써 주세요', 'bad'); return; }
        sendAdminEvent('announce', { nick: session?.nick || '관리자', text: text.slice(0, 80) }, 0);
        $('ab-text').value = '';
    } else if (k === 'gift') {
        const v = $('ab-gift').value, n = Math.max(1, Math.min(99, +$('ab-gift-n').value || 1));
        sendAdminEvent('gift', v === 'jc' ? { jc: 100000 * n } : { items: { [v]: n } }, 1800);   // 30분 안에 들어온 사람까지 받음
    }
});

/* =========================================================
   🔑 계정 · 클라우드 저장 · 프로필 · 랭킹 (Supabase)
   - 닉네임 + 비밀번호로 가입/로그인 (이메일 대신 닉네임으로 가짜 주소를 만들어 씀)
   - 저장은 3분마다 + 게임을 내릴 때만 (롤마다 안 함 → 데이터 아낌)
   - 랭킹은 랭킹 창을 열 때만 한 번 읽음
   ========================================================= */

const SESSION_KEY = 'js_rng_session';
let session = null;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) {}
let cloudSavedAt = 0, cloudLastRolls = -1, cloudBusy = false;
// 이 기기가 마지막으로 서버와 맞춘 서버 저장 시각 (다른 기기가 그 뒤에 저장했는지 보는 용도)
const syncKey = () => `js_rng_sync_${session?.uid}`;
const syncedAt = () => { try { return +localStorage.getItem(syncKey()) || 0; } catch (e) { return 0; } };
const setSynced = t => { try { localStorage.setItem(syncKey(), String(t)); } catch (e) {} };
function adoptCloud(cloud) {
    const base = createInitialGameState();
    gameState = { ...base, ...cloud, activeBuffs: { ...base.activeBuffs, ...(cloud.activeBuffs || {}) } };
    if (backupGameState === null) localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    renderAll(); applyEquippedAura(); applyBiome(false); applyGear(); updateAttendDot(); updatePetDot();
    music.importYt(gameState.ytTracks);
    cloudLastRolls = gameState.rolls;
}
// 다른 기기에서 더 많이 한 기록이 서버에 있으면 자동으로 불러옴 (불러왔으면 true)
async function cloudPull() {
    if (!session || backupGameState !== null || cloudBusy) return false;
    try {
        const rows = await userFetch(`saves?select=updated_at,r:data->rolls&id=eq.${session.uid}`);
        const row = rows?.[0];
        if (!row) return false;
        const at = Date.parse(row.updated_at);
        if (!(at > syncedAt())) return false;                 // 내가 마지막으로 맞춘 뒤로 아무도 저장 안 함
        if ((+row.r || 0) < (gameState.rolls || 0)) return false;   // 이 기기가 더 많이 함 → 이 기기 걸로 덮어씀
        const full = await userFetch(`saves?select=data,updated_at&id=eq.${session.uid}`);
        if (!full?.[0]?.data) return false;
        adoptCloud(full[0].data);
        setSynced(Date.parse(full[0].updated_at));
        cloudSavedAt = Date.now();
        toast('☁️ 다른 기기 기록을 불러왔어요', 'good');
        return true;
    } catch (e) { console.warn('클라우드 확인 실패', e); return false; }
}
const saveSession = () => { try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch (e) {} };

async function nickEmail(nick) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('jsrng:' + nick.normalize('NFC').toLowerCase()));
    return 'p' + [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('') + '@jsrng.app';
}
async function authCall(path, body, token) {
    const r = await fetch(`${SB_URL}/auth/v1/${path}`, {
        method: 'POST', cache: 'no-store',
        headers: { apikey: SB_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body || {})
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.msg || j.error_description || j.message || `auth ${r.status}`), { code: j.error_code || j.code, status: r.status });
    return j;
}
function takeSession(j, nick) {
    session = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user?.id, nick: nick || session?.nick };
    saveSession();
}
async function userToken() {
    if (!session) return null;
    if (Date.now() > session.exp - 60000) {
        try { takeSession(await authCall('token?grant_type=refresh_token', { refresh_token: session.refresh })); }
        catch (e) { if (e.status === 400 || e.status === 401) { session = null; saveSession(); renderAccount(); renderProfileBtn(); } return null; }
    }
    return session.access;
}
// 로그인한 사람으로 표 읽기/쓰기
async function userFetch(path, opts = {}) {
    const tok = await userToken();
    if (!tok) throw new Error('로그인이 필요해요');
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, cache: 'no-store', headers: { apikey: SB_KEY, Authorization: `Bearer ${tok}`, ...(opts.headers || {}) } });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.message || `db ${r.status}`), { code: j.code, status: r.status }); }
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
}

const NICK_RE = /^[가-힣a-zA-Z0-9_]{2,12}$/;
async function signUp(nick, pw) {
    if (!NICK_RE.test(nick)) throw new Error('닉네임은 한글·영어·숫자 2~12자예요');
    if (pw.length < 6) throw new Error('비밀번호는 6자 이상이에요');
    let j;
    try { j = await authCall('signup', { email: await nickEmail(nick), password: pw, data: { nickname: nick } }); }
    catch (e) { if (/registered|exists/i.test(e.message)) throw new Error('이미 있는 닉네임이에요'); throw e; }
    if (!j.access_token) throw new Error('Supabase에서 이메일 확인(Confirm email)을 꺼야 해요');
    takeSession(j, nick);
    await userFetch('profiles', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ id: session.uid, nickname: nick }) });
    await cloudUpload(true);
}
async function logIn(nick, pw) {
    let j;
    try { j = await authCall('token?grant_type=password', { email: await nickEmail(nick), password: pw }); }
    catch (e) { throw new Error(/invalid/i.test(e.message) ? '닉네임이나 비밀번호가 틀렸어요' : e.message); }
    takeSession(j, nick);
    try { const pr = await userFetch(`profiles?select=avatar&id=eq.${session.uid}`); myAvatar = pr?.[0]?.avatar || null; myAvatar ? localStorage.setItem(AVATAR_KEY, myAvatar) : localStorage.removeItem(AVATAR_KEY); } catch (e) {}
    // 서버 기록과 이 폰 기록 중 고르기
    const rows = await userFetch(`saves?select=data,updated_at&id=eq.${session.uid}`);
    const cloud = rows?.[0]?.data;
    if (cloud && (cloud.rolls || 0) > 0) {
        const useCloud = (gameState.rolls || 0) === 0 || await ask({
            title: '어떤 기록을 쓸까요?',
            message: `☁️ 서버 기록: ${fmt(cloud.rolls)} 롤 · ${fmt(cloud.jc)} JC\n📱 이 폰 기록: ${fmt(gameState.rolls)} 롤 · ${fmt(gameState.jc)} JC\n\n확인 = 서버 기록 불러오기\n취소 = 이 폰 기록으로 서버 덮어쓰기`,
            okText: '서버 기록 불러오기'
        });
        if (useCloud) {
            adoptCloud(cloud);
            setSynced(Date.parse(rows[0].updated_at));
            toast('☁️ 서버 기록을 불러왔어요', 'good');
            return;
        }
    }
    await cloudUpload(true, true);   // 이 기기 기록으로 서버 덮어쓰기
}
async function logOut() {
    await cloudUpload(true);
    if (cloudSavedAt < Date.now() - 10000) throw new Error('서버에 저장을 못 해서 로그아웃을 멈췄어요. 인터넷을 확인해 주세요');
    try { await authCall('logout', {}, session?.access); } catch (e) {}
    try { localStorage.removeItem(syncKey()); } catch (e) {}
    session = null; saveSession();
    myAvatar = null; try { localStorage.removeItem(AVATAR_KEY); } catch (e) {}
    // 이 폰은 새 게임으로 (기록은 서버에 있어서 다시 로그인하면 돌아옴)
    gameState = createInitialGameState();
    cloudLastRolls = -1; cloudSavedAt = 0;
    music.importYt([]);
    saveGame(); renderAll(); applyEquippedAura(); applyBiome(false); updateAttendDot(); updatePetDot();
}

// 랭킹·프로필용 숫자들
function profileStats() {
    const found = new Set([...gameState.discoveredAuras, ...Object.keys(gameState.inventory)]);
    let best = null;
    for (const id of found) { const a = AURA_BY_ID[id]; if (a && (!best || a.in > best.in)) best = a; }
    return { rolls: gameState.rolls || 0, jc: Math.floor(gameState.jc || 0), found: AURA_DATA.filter(a => found.has(a.id)).length, best_aura: best?.id || null, best_in: best?.in || 0, equipped: gameState.equippedAura || null, attend: gameState.attend?.total || 0 };
}
async function cloudUpload(force, overwrite = false) {
    if (!session || backupGameState !== null || cloudBusy) return;
    if (!force && (gameState.savedAt || 0) <= cloudSavedAt) return;   // 바뀐 게 없으면 안 올림
    cloudBusy = true;
    try {
        // 올리기 전에: 다른 기기가 더 많이 한 기록을 올려놨으면 덮어쓰지 않음
        const rows = await userFetch(`saves?select=updated_at,r:data->rolls&id=eq.${session.uid}`);
        const row = rows?.[0];
        if (!overwrite && row && Date.parse(row.updated_at) > syncedAt() && (+row.r || 0) > (gameState.rolls || 0)) {
            cloudBusy = false;
            await cloudPull();
            return;
        }
        const now = new Date().toISOString();
        await userFetch('saves?on_conflict=id', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: session.uid, data: gameState, updated_at: now }) });
        await userFetch(`profiles?id=eq.${session.uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ ...profileStats(), updated_at: now }) });
        cloudSavedAt = Date.now(); cloudLastRolls = gameState.rolls;
        setSynced(Date.parse(now));
        if (!$('sheet-settings').classList.contains('hidden') && setTab === 'account') renderAccount();
    } catch (e) { console.warn('클라우드 저장 실패', e); }
    finally { cloudBusy = false; }
}
setInterval(async () => { if (!document.hidden && !(await cloudPull())) cloudUpload(false); }, 180000);
document.addEventListener('visibilitychange', () => { document.hidden ? cloudUpload(false) : cloudPull(); });

/* ---------- 설정 → 계정 탭 ---------- */
let accMode = 'login';
function renderAccount() {
    const el = $('account-panel');
    if (!el) return;
    if (session) {
        const ago = cloudSavedAt ? `${Math.max(0, Math.round((Date.now() - cloudSavedAt) / 60000))}분 전` : '아직 안 함';
        el.innerHTML = `
            <div class="acc-card">
                <div class="acc-ava" style="--c:${AURA_BY_ID[gameState.equippedAura]?.color || '#5b4dff'}">${escapeHtml(session.nick?.[0] || '?')}</div>
                <div class="acc-info"><b>${escapeHtml(session.nick || '')}</b><small>☁️ 마지막 서버 저장: ${ago}</small></div>
            </div>
            <div class="acc-btns">
                <button class="btn btn-block btn-primary" data-acc="profile">내 프로필 · 랭킹</button>
                <button class="btn btn-block" data-acc="save">지금 서버에 저장</button>
                <button class="btn btn-block btn-red" data-acc="logout">로그아웃</button>
            </div>
            <div class="set-note">저장은 3분마다, 그리고 게임을 내릴 때 자동으로 돼요.<br>폰·컴 같은 계정이면 게임을 켤 때 더 많이 한 쪽 기록으로 자동으로 맞춰져요.</div>`;
    } else {
        el.innerHTML = `
            <div class="acc-hero"><b>로그인하면</b><span>☁️ 폰을 바꿔도 기록 유지 · 🏆 랭킹 · 🪪 프로필</span></div>
            <div class="seg seg2" id="acc-seg"><button data-am="login" class="${accMode === 'login' ? 'on' : ''}">로그인</button><button data-am="signup" class="${accMode === 'signup' ? 'on' : ''}">새 계정</button></div>
            <input id="acc-nick" type="text" maxlength="12" placeholder="닉네임 (한글·영어·숫자 2~12자)" autocomplete="username">
            <input id="acc-pw" type="password" placeholder="비밀번호 (6자 이상)" autocomplete="${accMode === 'login' ? 'current-password' : 'new-password'}">
            ${accMode === 'signup' ? '<input id="acc-pw2" type="password" placeholder="비밀번호 한 번 더" autocomplete="new-password">' : ''}
            <button class="btn btn-block btn-gold" data-acc="go">${accMode === 'login' ? '로그인' : '계정 만들기'}</button>
            <div class="set-note">${accMode === 'signup' ? '지금 이 폰에서 하던 기록이 새 계정으로 올라가요. 비밀번호는 잊어버리면 찾을 수 없어요!' : '로그인 안 해도 지금처럼 이 폰에서 계속 할 수 있어요.'}</div>`;
    }
}
$('account-panel').addEventListener('click', async e => {
    const am = e.target.closest('[data-am]');
    if (am) { accMode = am.dataset.am; renderAccount(); return; }
    const b = e.target.closest('[data-acc]');
    if (!b) return;
    const act = b.dataset.acc;
    if (act === 'go') {
        const nick = $('acc-nick').value.trim(), pw = $('acc-pw').value;
        if (!nick || !pw) { toast('닉네임과 비밀번호를 넣어 주세요', 'bad'); return; }
        if (accMode === 'signup' && pw !== $('acc-pw2').value) { toast('비밀번호가 서로 달라요', 'bad'); return; }
        b.disabled = true; b.textContent = '잠깐만요…';
        try {
            if (accMode === 'signup') { await signUp(nick, pw); toast(`🎉 ${nick} 계정을 만들었어요`, 'gold'); }
            else { await logIn(nick, pw); toast(`👋 ${nick} 로그인`, 'good'); }
        } catch (err) { toast(err.message || '실패했어요', 'bad'); }
        renderAccount(); renderProfileBtn();
    } else if (act === 'save') {
        b.disabled = true; await cloudUpload(true); toast(cloudSavedAt > Date.now() - 5000 ? '☁️ 저장했어요' : '저장 실패. 인터넷을 확인해 주세요', cloudSavedAt > Date.now() - 5000 ? 'good' : 'bad'); renderAccount();
    } else if (act === 'logout') {
        if (!await ask({ title: '로그아웃할까요?', message: '지금 기록을 서버에 저장하고, 이 폰은 새 게임으로 시작해요.\n다시 로그인하면 기록이 그대로 돌아와요.', okText: '로그아웃', danger: true })) return;
        b.disabled = true;
        try { await logOut(); accMode = 'login'; toast('로그아웃했어요. 새 게임으로 시작해요'); }
        catch (err) { toast(err.message, 'bad'); }
        renderAccount(); renderProfileBtn();
    } else if (act === 'profile') {
        closeSheet('sheet-settings'); setTimeout(() => openSheet('sheet-profile'), 200);
    }
});

/* ---------- 프로필 · 랭킹 창 ---------- */
let profTab = 'me', rankKey = 'rolls';
const RANK_KEYS = { rolls: ['롤 수', p => `${fmt(p.rolls)} 롤`], best_in: ['최고 칭호', p => AURA_BY_ID[p.best_aura]?.name || '-'], found: ['도감', p => `${p.found} / ${AURA_DATA.length}`] };
function renderProfileBtn() {
    const btn = $('profile-btn');
    if (!btn) return;
    const a = AURA_BY_ID[gameState.equippedAura];
    btn.style.setProperty('--c', a?.color || '#5b4dff');
    btn.textContent = session?.nick?.[0] || '?';
    if (session && myAvatar) btn.innerHTML = `<img src="${myAvatar}" alt="">`;
    btn.classList.toggle('guest', !session);
}
const AVATAR_KEY = 'js_rng_avatar';
let myAvatar = null;
try { myAvatar = localStorage.getItem(AVATAR_KEY); } catch (e) {}
// 사진 또는 닉네임 첫 글자
function avaHtml(p, cls) {
    const av = p.avatar && /^data:image\/(jpeg|png|webp);base64,/.test(p.avatar) ? p.avatar : null;
    return `<span class="${cls} ${av ? 'has-img' : ''}">${av ? `<img src="${av}" alt="">` : escapeHtml((p.nickname || '?')[0])}</span>`;
}
// 고른 사진을 가운데 네모로 잘라 128px JPEG 로 줄임 (보통 5~10KB)
function shrinkImage(file) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
            const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
            const m = Math.min(img.width, img.height);
            c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
            URL.revokeObjectURL(img.src);
            let q = 0.82, url = c.toDataURL('image/jpeg', q);
            while (url.length > 30000 && q > 0.3) { q -= 0.12; url = c.toDataURL('image/jpeg', q); }
            res(url);
        };
        img.onerror = rej;
        img.src = URL.createObjectURL(file);
    });
}
async function setAvatar(url) {
    await userFetch(`profiles?id=eq.${session.uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ avatar: url }) });
    myAvatar = url;
    try { url ? localStorage.setItem(AVATAR_KEY, url) : localStorage.removeItem(AVATAR_KEY); } catch (e) {}
    renderProfileBtn();
}
function profileCardHtml(p, mine) {
    const eq = AURA_BY_ID[p.equipped], best = AURA_BY_ID[p.best_aura];
    const since = p.created_at ? new Date(p.created_at).toLocaleDateString('ko-KR') : '';
    return `
        <div class="pf-card" style="--c:${eq?.color || '#5b4dff'}">
            <div class="pf-top">
                <div class="pf-ava-wrap">${avaHtml(p, 'pf-ava')}${mine && session ? '<button class="pf-photo" data-pf="photo" aria-label="사진 바꾸기">📷</button>' : ''}</div>
                <div class="pf-name"><b>${escapeHtml(p.nickname || '게스트')}</b>${since ? `<small>${since} 가입</small>` : '<small>로그인 안 함</small>'}</div>
            </div>
            <div class="pf-bio">${p.bio ? escapeHtml(p.bio) : '<i>자기소개가 없어요</i>'}${mine && session ? ` <button class="pf-edit" data-pf="bio" data-bio="${escapeHtml(p.bio || '')}">✏️</button>` : ''}</div>
            ${eq ? `<div ${frameAttrs(eq.grade, auraColors(eq), eq.frame).replace('class="', 'class="pf-eq ')}>${frameDeco(eq.grade, eq.frame)}<span class="pf-label">장착 칭호</span><div class="pf-eq-name">${auraNameHtml(eq)}</div><span class="pf-eq-sub ${gradeCol(eq.grade)}">${eq.grade} · 1 in ${fmt(eq.in)}</span></div>` : ''}
            <div class="pf-stats">
                <div><span>롤</span><b>${fmt(p.rolls)}</b></div>
                <div><span>도감</span><b>${p.found}<small>/${AURA_DATA.length}</small></b></div>
                <div><span>출석</span><b>${fmt(p.attend || 0)}일</b></div>
                <div class="wide"><span>최고 칭호</span><b class="${best ? gradeCol(best.grade) : ''}">${best ? `${best.name} <small>1 in ${fmt(best.in)}</small>` : '-'}</b></div>
            </div>
        </div>`;
}
async function renderProfileSheet() {
    const el = $('profile-panel');
    $('prof-tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === profTab));
    if (profTab === 'me') {
        const p = { ...profileStats(), nickname: session?.nick, bio: '', created_at: null, avatar: session ? myAvatar : null };
        el.innerHTML = profileCardHtml(p, true) + (session ? '' : `<button class="btn btn-block btn-gold" data-pf="login">로그인하고 랭킹에 올라가기</button>`);
        if (session) {
            try {
                const r = await userFetch(`profiles?select=bio,created_at,avatar&id=eq.${session.uid}`);
                if (r?.[0]) {
                    p.bio = r[0].bio; p.created_at = r[0].created_at; p.avatar = r[0].avatar;
                    if ((r[0].avatar || null) !== myAvatar) { myAvatar = r[0].avatar || null; try { myAvatar ? localStorage.setItem(AVATAR_KEY, myAvatar) : localStorage.removeItem(AVATAR_KEY); } catch (e) {} renderProfileBtn(); }
                    if (profTab === 'me') el.innerHTML = profileCardHtml(p, true);
                }
            } catch (e) {}
        }
        return;
    }
    el.innerHTML = `<div class="seg seg3" id="rank-seg">${Object.entries(RANK_KEYS).map(([k, [label]]) => `<button data-rk="${k}" class="${rankKey === k ? 'on' : ''}">${label}</button>`).join('')}</div><div class="rank-list"><div class="empty">불러오는 중…</div></div>`;
    try {
        const r = await fetch(`${SB_URL}/rest/v1/profiles?select=id,nickname,rolls,best_aura,best_in,found,equipped,attend,bio,created_at,avatar&order=${rankKey}.desc&limit=30`, { headers: SB_HEADERS, cache: 'no-store' });
        if (!r.ok) throw new Error();
        const rows = await r.json();
        rankRows = rows;
        const list = el.querySelector('.rank-list');
        if (!list) return;
        list.innerHTML = rows.length ? rows.map((p, i) => {
            const eq = AURA_BY_ID[p.equipped];
            return `<button class="rank-row ${p.id === session?.uid ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}" data-rank="${i}">
                <span class="rk-no">${i + 1}</span>
                <span style="--c:${eq?.color || '#5b4dff'};display:contents">${avaHtml(p, 'rk-ava')}</span>
                <span class="rk-main"><b>${escapeHtml(p.nickname)}</b><small>${eq ? eq.name : '칭호 없음'}</small></span>
                <span class="rk-val">${RANK_KEYS[rankKey][1](p)}</span>
            </button>`;
        }).join('') : `<div class="empty">아직 아무도 없어요.<br>로그인하면 첫 번째가 될 수 있어요!</div>`;
    } catch (e) {
        const list = el.querySelector('.rank-list');
        if (list) list.innerHTML = `<div class="empty">랭킹을 못 불러왔어요.<br>인터넷을 확인해 주세요.</div>`;
    }
}
let rankRows = [];
bindTabs('prof-tabs', tab => { profTab = tab; renderProfileSheet(); });
$('profile-panel').addEventListener('click', async e => {
    const rk = e.target.closest('[data-rk]');
    if (rk) { rankKey = rk.dataset.rk; renderProfileSheet(); return; }
    const row = e.target.closest('[data-rank]');
    if (row) {
        const p = rankRows[+row.dataset.rank];
        if (!p) return;
        $('pf-view').innerHTML = profileCardHtml(p, false) + `<button class="btn btn-block" data-pfclose>닫기</button>`;
        $('pf-dialog').classList.remove('hidden');
        return;
    }
    const pf = e.target.closest('[data-pf]');
    if (!pf) return;
    if (pf.dataset.pf === 'photo') {
        const pick = await ask({ title: '프로필 사진', message: '사진을 고르면 네모로 잘라서 올려요.', okText: '사진 고르기' });
        if (!pick) return;
        $('avatar-file').click();
        return;
    }
    if (pf.dataset.pf === 'login') { closeSheet('sheet-profile'); setTimeout(() => { openSheet('sheet-settings'); setSettingsTab('account'); }, 200); }
    else if (pf.dataset.pf === 'bio') {
        const text = await ask({ title: '자기소개', message: '최대 40자', text: true, value: pf.dataset.bio || '', okText: '저장' });
        if (text === null) return;
        try {
            await userFetch(`profiles?id=eq.${session.uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ bio: text.trim().slice(0, 40) }) });
            toast('저장했어요', 'good'); renderProfileSheet();
        } catch (err) { toast('저장 실패', 'bad'); }
    }
});
$('pf-dialog').addEventListener('click', e => { if (e.target.id === 'pf-dialog' || e.target.closest('[data-pfclose]')) $('pf-dialog').classList.add('hidden'); });
$('avatar-file').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f || !session) return;
    try {
        const url = await shrinkImage(f);
        await setAvatar(url);
        toast('📷 프로필 사진을 바꿨어요', 'good');
        renderProfileSheet();
    } catch (err) { toast('사진을 못 올렸어요', 'bad'); }
});
$('profile-btn').addEventListener('click', () => openSheet('sheet-profile'));
renderProfileBtn();
if (session) setTimeout(() => cloudUpload(true), 8000);   // 켜고 조금 뒤 한 번 맞춰 둠

/* =========================================================
   📅 일일 출석 (7일 한 바퀴, 하루 빠져도 이어서 받음)
   ========================================================= */

// 30일 출석판 (7·14·21·28·30일째는 큰 보상)
const ATTEND_REWARDS = [
    { jc: 10000 }, { items: { luck_3: 3 } }, { jc: 20000 }, { eggs: { egg_basic: 1 } }, { items: { speed_3: 3, luck_3: 2 } }, { items: { limit_potion: 1 } },
    { jc: 80000, eggs: { egg_rare: 1 }, big: true },
    { jc: 30000 }, { items: { dice_potion: 1 } }, { items: { star_potion: 1 } }, { jc: 40000 }, { eggs: { egg_basic: 2 } }, { items: { warp_potion: 2 } },
    { jc: 120000, items: { overcome_potion: 1 }, big: true },
    { items: { limit_potion: 2 } }, { jc: 60000 }, { eggs: { egg_rare: 1 } }, { items: { biome_potion: 1 } }, { items: { dice_potion: 2 } }, { jc: 100000 },
    { items: { heaven_potion: 1 }, eggs: { egg_legend: 1 }, big: true },
    { items: { star_potion: 2 } }, { jc: 150000 }, { items: { overcome_potion: 1 } }, { eggs: { egg_rare: 2 } }, { items: { limit_potion: 3 } }, { jc: 250000 },
    { jc: 300000, items: { heaven_potion: 1 }, big: true },
    { items: { dice_potion: 3 } },
    { jc: 1000000, items: { void_potion: 1 }, eggs: { egg_mythic: 1 }, big: true, final: true }
];
const ATTEND_N = ATTEND_REWARDS.length;
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function attendState() { return gameState.attend || (gameState.attend = { last: '', count: 0, total: 0 }); }
const canAttend = () => attendState().last !== todayKey();
function rewardChips(r) {
    const out = [];
    if (r.jc) out.push(`<span class="at-rw"><i class="coin"></i>${fmt(r.jc)}</span>`);
    for (const id in r.items || {}) out.push(`<span class="at-rw">${vialHtml(SHOP_BY_ID[id])}<small>${SHOP_BY_ID[id].name} ×${r.items[id]}</small></span>`);
    for (const id in r.eggs || {}) out.push(`<span class="at-rw">${eggHtml(EGG_BY_ID[id], 'at-egg')}<small>${EGG_BY_ID[id].name} ×${r.eggs[id]}</small></span>`);
    if (r.tickets) out.push(`<span class="at-rw"><i class="ticket-ico"></i><small>뽑기권 ×${r.tickets}</small></span>`);
    return out.join('');
}
/* =========================================================
   🏛 전시장: 가진 칭호를 올려 두면 시간마다 JC가 쌓임 (게임 꺼도 최대 12시간)
   ========================================================= */
const SHOW_CAP_H = 12;
const SHOW_SLOTS = 3;   // 신전 받침대는 3개
const showIncome = a => a ? Math.round(Math.pow(a.in, 0.35) * 30 * (amu().showMult || 1)) : 0;   // 시간당 JC
function showState() {
    const g = gameState;
    if (!g.show) g.show = { slots: [null, null, null], at: Date.now(), bank: 0 };
    if (g.show.slots.length > SHOW_SLOTS) g.show.slots.length = SHOW_SLOTS;
    return g.show;
}
const showAura = id => (id && gameState.inventory[id] > 0) ? AURA_BY_ID[id] : null;   // 팔았으면 빠짐
function showPerHour() { return showState().slots.reduce((t, id) => t + showIncome(showAura(id)), 0); }
// 지난 정산 뒤로 쌓인 JC를 은행에 넣음 (최대 12시간치)
function showSettle() {
    const st = showState(), now = Date.now();
    const cap = showPerHour() * SHOW_CAP_H;
    st.bank = Math.min(cap, (st.bank || 0) + showPerHour() * Math.max(0, now - (st.at || now)) / 3600000);
    st.at = now;
    return st;
}
function updateShowDot() {
    const st = showSettle(), ph = showPerHour();
    document.querySelector('.show-dot')?.classList.toggle('hidden', !(ph && st.bank >= ph));   // 1시간치 넘게 쌓이면 빨간 점
}
let showPick = -1;
function renderShowcase() {
    const st = showSettle(), ph = showPerHour(), cap = ph * SHOW_CAP_H;
    const el = $('show-panel');
    const owned = Object.keys(gameState.inventory).filter(id => gameState.inventory[id] > 0 && AURA_BY_ID[id]).map(id => AURA_BY_ID[id]).sort((a, b) => b.in - a.in);
    const used = new Set(st.slots.filter(Boolean));
    el.innerHTML = `
        <div class="temple">
            <div class="tp-roof"><span>전시의 신전</span></div>
            <div class="tp-frieze">${'<i></i>'.repeat(9)}</div>
            <div class="tp-hall">
                <div class="tp-col"></div>
                ${st.slots.map((id, i) => {
                    const a = showAura(id);
                    return `<button class="tp-alcove ${a ? 'on' : ''} ${showPick === i ? 'pick' : ''}" data-showslot="${i}" ${a ? `style="--c:${a.color}"` : ''}>
                        <div class="tp-beam"></div>
                        <div class="tp-gem"><i></i></div>
                        <div class="tp-ped"></div>
                    </button><div class="tp-col"></div>`;
                }).join('')}
            </div>
            <div class="tp-steps"><i></i><i></i><i></i></div>
        </div>
        <div class="tp-labels">${st.slots.map((id, i) => {
            const a = showAura(id);
            return `<button class="tp-label ${showPick === i ? 'pick' : ''}" data-showslot="${i}">${a ? `<b class="${gradeCol(a.grade)}">${a.name}</b><small>${a.grade} · 시간당 ${fmt(showIncome(a))}</small>` : `<b>빈 받침대</b><small>눌러서 올리기</small>`}</button>`;
        }).join('')}</div>
        <div class="show-bank">
            <div class="show-bank-top"><span>쌓인 JC</span><b>${fmt(Math.floor(st.bank))}</b></div>
            <div class="gpity-bar"><div style="width:${cap ? Math.min(100, st.bank / cap * 100) : 0}%"></div></div>
            <div class="show-bank-note">시간당 <b>${fmt(ph)} JC</b> · 게임을 꺼도 최대 ${SHOW_CAP_H}시간치(${fmt(cap)})까지 쌓여요</div>
            <button class="btn btn-block btn-gold" data-showcollect ${st.bank >= 1 ? '' : 'disabled'}>💰 받기</button>
        </div>
        ${showPick >= 0 ? `<div class="glabel">${showPick + 1}번 받침대에 올릴 칭호 <span class="pet-hint">· 희귀할수록 많이 벌어요</span></div>
        <div class="show-pick">
            ${st.slots[showPick] ? `<button class="show-opt off" data-showset="">받침대 비우기</button>` : ''}
            ${owned.filter(a => !used.has(a.id) || a.id === st.slots[showPick]).slice(0, 40).map(a => `
            <button class="show-opt ${a.id === st.slots[showPick] ? 'cur' : ''}" data-showset="${a.id}" style="--c:${a.color}">
                <span class="${gradeCol(a.grade)}">${a.name}</span><small>${a.grade} · 시간당 <b>${fmt(showIncome(a))}</b></small>
            </button>`).join('') || '<div class="empty">가진 칭호가 없어요</div>'}
        </div>` : ''}
        <div class="set-note">전시한 칭호를 팔면 받침대에서 빠져요. 장착은 그대로 할 수 있어요.</div>`;
}
$('show-panel').addEventListener('click', e => {
    const st = showSettle();
    if (e.target.closest('[data-showcollect]')) {
        const got = Math.floor(st.bank);
        if (got < 1) return;
        st.bank -= got; gameState.jc += got;
        saveGame(); renderStats(); renderShowcase(); updateShowDot();
        toast(`💰 전시장 수입 +${fmt(got)} JC`, 'gold');
        playTone(880, 'triangle', 0.1 * soundSettings.master, 0.005, 0.15);
        return;
    }
    const sl = e.target.closest('[data-showslot]');
    if (sl) { showPick = showPick === +sl.dataset.showslot ? -1 : +sl.dataset.showslot; renderShowcase(); return; }
    const set = e.target.closest('[data-showset]');
    if (set && showPick >= 0) {
        st.slots[showPick] = set.dataset.showset || null;   // 정산은 위에서 이미 함 → 새 칭호 수입은 지금부터
        showPick = -1;
        saveGame(); renderShowcase(); updateShowDot();
    }
});
$('show-btn').addEventListener('click', () => { showPick = -1; openSheet('sheet-show'); });

/* =========================================================
   🎫 시즌 패스 (BASIC 무료 / PRO 1천만 JC)
   - 롤 1번 = 1 XP, 출석 = 50 XP. 레벨마다 BASIC·PRO 보상
   - PRO는 언제 사도 지난 레벨 보상까지 다 받을 수 있음
   ========================================================= */
const SEASON = { id: 's1', name: '시즌 1 · 개척의 시대', end: new Date('2026-12-01T00:00:00+09:00').getTime(), xp: 700, pro: 10000000 };
// 50레벨. 5레벨마다 조금 큰 보상, 10레벨마다 큰 보상
const PASS_BASIC = Array.from({ length: 50 }, (_, i) => {
    const lv = i + 1;
    const SPECIAL = {
        10: { eggs: { egg_rare: 1 }, tickets: 2, big: true },
        20: { eggs: { egg_legend: 1 }, items: { overcome_potion: 1 }, big: true },
        30: { aura: 'pass_pioneer', tickets: 3, big: true },
        40: { items: { nebula_potion: 1 }, eggs: { egg_legend: 1 }, big: true },
        50: { jc: 1500000, eggs: { egg_mythic: 1 }, tickets: 5, big: true }
    };
    if (SPECIAL[lv]) return SPECIAL[lv];
    if (lv % 5 === 0) return { tickets: 1, jc: 40000 * lv / 5 };
    const ROT = [
        { jc: 20000 + lv * 4000 }, { items: { luck_3: 4 } }, { items: { limit_potion: 1 + (lv > 25 ? 1 : 0) } }, { eggs: { egg_basic: 1 } },
        { items: { star_potion: 1 } }, { items: { dice_potion: 1 } }, { items: { speed_3: 4 } }, { eggs: { egg_rare: lv > 25 ? 1 : 0, egg_basic: lv > 25 ? 0 : 2 } }
    ];
    const r = ROT[i % ROT.length];
    if (r.eggs) for (const k in r.eggs) if (!r.eggs[k]) delete r.eggs[k];
    return r;
});
const PASS_PRO = Array.from({ length: 50 }, (_, i) => {
    const lv = i + 1;
    const SPECIAL = {
        5: { items: { heaven_potion: 1 }, tickets: 2, big: true },
        10: { eggs: { egg_legend: 1 }, tickets: 3, big: true },
        15: { gear: 'pass_gauntlet', big: true },
        20: { eggs: { egg_mythic: 1 }, jc: 500000, big: true },
        25: { items: { void_potion: 1 }, tickets: 5, big: true },
        30: { gear: 'pass_amulet', big: true },
        35: { items: { nebula_potion: 1 }, jc: 800000, big: true },
        40: { eggs: { egg_mythic: 2 }, tickets: 5, big: true },
        45: { items: { nebula_potion: 2 }, big: true },
        50: { aura: 'pass_goldking', items: { genesis_potion: 1 }, big: true }
    };
    if (SPECIAL[lv]) return SPECIAL[lv];
    const ROT = [
        { jc: 100000 + lv * 20000 }, { items: { overcome_potion: 1 } }, { tickets: 2 }, { items: { star_potion: 2 } },
        { eggs: { egg_rare: 2 } }, { items: { heaven_potion: 1 } }, { items: { dice_potion: 2 } }, { eggs: { egg_legend: 1 } }, { items: { limit_potion: 4 } }
    ];
    return ROT[i % ROT.length];
});
const PASS_MAX = PASS_BASIC.length;
function passState() {
    const g = gameState;
    if (!g.pass || g.pass.season !== SEASON.id) g.pass = { season: SEASON.id, xp: 0, pro: false, b: [], p: [] };
    return g.pass;
}
const passLevel = () => Math.min(PASS_MAX, Math.floor(passState().xp / SEASON.xp));
const passEnded = () => Date.now() >= SEASON.end;
function passAddXp(n) {
    if (passEnded()) return;
    const st = passState(), before = passLevel();
    st.xp += n;
    if (passLevel() > before) { toast(`🎫 시즌 패스 ${passLevel()}레벨!`, 'gold'); updatePassDot(); }
}
function passClaimable() {
    const st = passState(), lv = passLevel();
    let n = 0;
    for (let i = 0; i < lv; i++) { if (!st.b.includes(i)) n++; if (st.pro && !st.p.includes(i)) n++; }
    return n;
}
function updatePassDot() {
    const lvEl = $('pass-lv'); if (lvEl) lvEl.textContent = passLevel();
    document.querySelector('.pass-dot')?.classList.toggle('hidden', !passClaimable());
}
// 보상 지급 (JC·물약·알·장비·칭호)
function grantReward(r) {
    if (r.jc) gameState.jc += r.jc;
    if (r.items) addItems(r.items);
    if (r.tickets) gameState.tickets = (gameState.tickets || 0) + r.tickets;
    if (r.eggs) { const eg = petState().eggs; for (const id in r.eggs) eg[id] = (eg[id] || 0) + r.eggs[id]; updatePetDot(); }
    if (r.gear && !gameState.craftedGears.includes(r.gear)) gameState.craftedGears.push(r.gear);
    if (r.aura) { gameState.inventory[r.aura] = (gameState.inventory[r.aura] || 0) + 1; if (!gameState.discoveredAuras.includes(r.aura)) gameState.discoveredAuras.push(r.aura); }
}
function rewardText(r) {
    return [r.jc ? `${fmt(r.jc)} JC` : '', r.tickets ? `뽑기권 ×${r.tickets}` : '', ...Object.entries(r.items || {}).map(([id, n]) => `${SHOP_BY_ID[id].name} ×${n}`), ...Object.entries(r.eggs || {}).map(([id, n]) => `${EGG_BY_ID[id].name} ×${n}`), r.gear ? CRAFT_BY_ID[r.gear].name : '', r.aura ? `칭호 「${AURA_BY_ID[r.aura].name}」` : ''].filter(Boolean).join(' · ');
}
function passCell(r, track, i, lv, st) {
    const got = (track === 'p' ? st.p : st.b).includes(i);
    const can = i < lv && !got && (track === 'b' || st.pro);
    const lockedPro = track === 'p' && !st.pro;
    let icon = '';
    if (r.aura) { const a = AURA_BY_ID[r.aura]; icon = `<span class="ps-aura ${gradeCol(a.grade)}" style="--c:${a.color}">✦</span><small class="ps-name">${a.name}</small>`; }
    else if (r.gear) icon = `<span class="ps-gear"><canvas data-gear="${r.gear}" aria-hidden="true"></canvas></span><small class="ps-name">${CRAFT_BY_ID[r.gear].name}</small>`;
    else icon = rewardChips(r);
    return `<button class="ps-cell ${track} ${r.big ? 'big' : ''} ${got ? 'got' : ''} ${can ? 'can' : ''} ${lockedPro ? 'lock' : ''}" ${can ? `data-passclaim="${track}:${i}"` : ''} title="${escapeHtml(rewardText(r))}">${icon}${got ? '<i class="at-check"></i>' : ''}${lockedPro ? '<em>🔒</em>' : ''}</button>`;
}
function renderPass() {
    const st = passState(), lv = passLevel(), el = $('pass-panel');
    const inLv = lv >= PASS_MAX ? SEASON.xp : st.xp - lv * SEASON.xp;
    const days = Math.max(0, Math.ceil((SEASON.end - Date.now()) / 86400000));
    const claim = passClaimable();
    el.innerHTML = `
        <div class="ps-head">
            <div class="ps-season"><b>${SEASON.name}</b><small>${passEnded() ? '시즌 종료' : `${days}일 남음`}</small></div>
            <div class="ps-lv"><span>LV</span><b>${lv}</b><small>/ ${PASS_MAX}</small></div>
            <div class="ps-bar"><div style="width:${inLv / SEASON.xp * 100}%"></div></div>
            <div class="ps-xp">${lv >= PASS_MAX ? '최고 레벨!' : `${fmt(inLv)} / ${fmt(SEASON.xp)} XP · 롤 1번 = 1 XP · 출석 = 50 XP`}</div>
            <div class="ps-tickets"><i class="ticket-ico"></i> 뽑기권 <b>${fmt(gameState.tickets || 0)}</b>장 <small>· 상점 행운 뽑기에서 써요</small></div>
        </div>
        <div class="ps-tracks-head"><span>LV</span><span class="b">BASIC <small>무료</small></span><span class="p">PRO ${st.pro ? '<small>보유 중</small>' : ''}</span></div>
        ${st.pro ? '' : `<button class="btn btn-block ps-buy" data-passbuy ${gameState.jc >= SEASON.pro ? '' : 'disabled'}>👑 PRO 패스 열기 · ${fmt(SEASON.pro)} JC<small>지난 레벨 PRO 보상도 전부 받을 수 있어요 · 전용 건틀렛·칭호</small></button>`}
        ${claim ? `<button class="btn btn-block btn-gold" data-passall>🎁 받을 수 있는 보상 전부 받기 (${claim})</button>` : ''}
        <div class="ps-rows">${PASS_BASIC.map((r, i) => `
            <div class="ps-row ${i < lv ? 'reached' : ''} ${i === lv ? 'next' : ''}">
                <div class="ps-num">${i + 1}</div>
                ${passCell(r, 'b', i, lv, st)}
                ${passCell(PASS_PRO[i], 'p', i, lv, st)}
            </div>`).join('')}</div>
        <div class="set-note">시즌이 끝나면 레벨과 보상이 새 시즌으로 바뀌어요. 받은 칭호·장비는 계속 가져요.</div>`;
    attachGearPreviews(el);
    // 다음 레벨 줄이 보이게
    requestAnimationFrame(() => {
        const row = el.querySelector('.ps-row.next'), body = el.closest('.sheet-body');
        if (row && body) body.scrollTop = Math.max(0, row.offsetTop - body.offsetTop - body.clientHeight / 2);
    });
}
function passClaim(track, i) {
    const st = passState();
    const list = track === 'p' ? st.p : st.b, r = (track === 'p' ? PASS_PRO : PASS_BASIC)[i];
    if (list.includes(i) || i >= passLevel() || (track === 'p' && !st.pro)) return null;
    list.push(i); grantReward(r);
    return r;
}
$('pass-panel').addEventListener('click', e => {
    const st = passState();
    if (e.target.closest('[data-passbuy]')) {
        if (gameState.jc < SEASON.pro) { toast('JC가 부족해요', 'bad'); return; }
        ask({ title: 'PRO 패스를 열까요?', message: `${fmt(SEASON.pro)} JC를 써요.\n지난 레벨 PRO 보상도 바로 받을 수 있어요.`, okText: '열기' }).then(ok => {
            if (!ok || gameState.jc < SEASON.pro) return;
            gameState.jc -= SEASON.pro; st.pro = true;
            saveGame(); renderStats(); renderPass(); updatePassDot();
            playDropSound('LEGEND'); toast('👑 PRO 패스를 열었어요!', 'gold');
        });
        return;
    }
    if (e.target.closest('[data-passall]')) {
        const got = [];
        for (let i = 0; i < passLevel(); i++) for (const tr of ['b', 'p']) { const r = passClaim(tr, i); if (r) got.push(r); }
        if (!got.length) return;
        saveGame(); renderStats(); renderPass(); updatePassDot(); applyGear();
        toast(`🎁 보상 ${got.length}개를 받았어요`, 'gold');
        if (got.some(r => r.aura || r.gear)) playDropSound('MYTHIC');
        return;
    }
    const c = e.target.closest('[data-passclaim]');
    if (c) {
        const [tr, i] = c.dataset.passclaim.split(':');
        const r = passClaim(tr, +i);
        if (!r) return;
        saveGame(); renderStats(); renderPass(); updatePassDot();
        toast(`🎫 ${rewardText(r)}`, 'gold');
        if (r.aura || r.gear) playDropSound('MYTHIC');
    }
});
$('pass-btn').addEventListener('click', () => openSheet('sheet-pass'));

/* =========================================================
   🕶 암시장: 매일 08:00 / 20:00 (한국 시간)에 10분 동안만 열림
   - 그 회차마다 모두에게 같은 물건 6개 (날짜로 정해지는 랜덤)
   - 10% ~ 70% 할인, 한 사람당 한정 수량
   ========================================================= */
const BM_HOURS = [8, 20], BM_MIN = 10;
const kstNow = () => new Date(Date.now() + 9 * 3600000);   // UTC 기준으로 9시간 더한 '한국 시각'
function bmSession(t = Date.now()) {
    const k = new Date(t + 9 * 3600000);
    const day = k.toISOString().slice(0, 10), h = k.getUTCHours(), m = k.getUTCMinutes();
    for (const H of BM_HOURS) if (h === H && m < BM_MIN) {
        const start = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), H) - 9 * 3600000;
        return { key: `${day}-${H}`, end: start + BM_MIN * 60000 };
    }
    return null;
}
let bmForced = null;   // 개발자 모드에서 강제로 열기
function bmCurrent() { return bmSession() || (bmForced && bmForced.end > Date.now() ? bmForced : null); }
function bmNextOpen() {
    const k = kstNow();
    for (let d = 0; d < 2; d++) for (const H of BM_HOURS) {
        const t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + d, H) - 9 * 3600000;
        if (t > Date.now()) return t;
    }
    return Date.now() + 86400000;
}
// 암시장에 나올 수 있는 물건 (가치 = 원래 가격 기준)
const BM_POOL = [
    { kind: 'items', items: { luck_3: 5 }, v: 10000 }, { kind: 'items', items: { speed_3: 5 }, v: 15000 },
    { kind: 'items', items: { limit_potion: 1 }, v: 40000 }, { kind: 'items', items: { overcome_potion: 1 }, v: 250000 },
    { kind: 'items', items: { heaven_potion: 1 }, v: 400000 }, { kind: 'items', items: { void_potion: 1 }, v: 2000000, rare: true },
    { kind: 'items', items: { dice_potion: 1 }, v: 90000 }, { kind: 'items', items: { star_potion: 1 }, v: 60000 },
    { kind: 'items', items: { warp_potion: 1 }, v: 60000 }, { kind: 'items', items: { biome_potion: 1 }, v: 120000 },
    { kind: 'egg', id: 'egg_basic', v: 40000 }, { kind: 'egg', id: 'egg_rare', v: 220000 }, { kind: 'egg', id: 'egg_legend', v: 1200000, rare: true },
    { kind: 'egg', id: 'egg_mythic', v: 5000000, rare: true },
    { kind: 'items', items: { nebula_potion: 1 }, v: 7000000, rare: true }, { kind: 'items', items: { genesis_potion: 1 }, v: 35000000, rare: true },
    { kind: 'gear', id: 'gacha_clover', v: 600000, dupe: 60000 }, { kind: 'gear', id: 'gacha_dice', v: 700000, dupe: 80000 },
    { kind: 'gear', id: 'gacha_compass', v: 1500000, dupe: 150000, rare: true }, { kind: 'gear', id: 'gacha_jackpot', v: 2500000, dupe: 300000, rare: true }
];
function bmOffers(key) {
    // 회차 이름으로 정해지는 랜덤 → 모두가 같은 물건을 봄
    let h = 2166136261; for (const ch of key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
    const pool = BM_POOL.slice(), out = [];
    let rares = 0;
    while (out.length < 6 && pool.length) {
        const e = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
        if (e.rare && rares >= 2) continue;
        if (e.rare) rares++;
        const off = 10 + Math.floor(rnd() * 13) * 5;                 // 10% ~ 70%
        const stock = e.v >= 1000000 ? 1 : e.v >= 200000 ? 1 + Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 4);
        out.push({ ...e, off, stock, price: Math.round(e.v * (100 - off) / 100 / 100) * 100 });
    }
    return out;
}
function bmEntryName(e) { return e.kind === 'items' ? gachaEntryName(e) : e.kind === 'egg' ? '🥚 ' + EGG_BY_ID[e.id].name : CRAFT_BY_ID[e.id].name; }
function bmEntryIcon(e) {
    if (e.kind === 'items') return vialHtml(SHOP_BY_ID[Object.keys(e.items)[0]]);
    if (e.kind === 'egg') return `<canvas data-gear="egg:${e.id}" aria-hidden="true"></canvas>`;
    return `<canvas data-gear="${e.id}" aria-hidden="true"></canvas>`;
}
let bmTimer = 0;
function renderBM() {
    const el = $('bm-panel'), cur = bmCurrent();
    clearInterval(bmTimer);
    if (!cur) {
        const nx = bmNextOpen(), d = new Date(nx + 9 * 3600000);
        el.innerHTML = `<div class="bm-closed">
            <div class="bm-sign">CLOSED</div>
            <div class="bm-next">다음 오픈 <b>${d.getUTCHours() === 8 ? '오전 8시' : '오후 8시'}</b> · ${fmtLeft(nx - Date.now())} 뒤</div>
            <div class="set-note">암시장은 매일 오전 8시와 오후 8시에 딱 10분만 열려요.<br>열릴 때마다 물건과 할인율이 바뀌어요 (10% ~ 70%).</div>
            ${backupGameState !== null ? '<button class="btn btn-block" data-bmforce>🛠 개발자: 지금 열어 보기</button>' : ''}
        </div>`;
        return;
    }
    const st = gameState.bm && gameState.bm.key === cur.key ? gameState.bm : (gameState.bm = { key: cur.key, bought: {} });
    const offers = bmOffers(cur.key);
    el.innerHTML = `
        <div class="bm-top"><span>🕶 지금 열려 있어요</span><b class="bm-left" data-bmend="${cur.end}">${fmtClock(cur.end - Date.now())}</b></div>
        <div class="bm-grid">${offers.map((o, i) => {
            const left = o.stock - (st.bought[i] || 0);
            return `<div class="bm-item ${left <= 0 ? 'sold' : ''}">
                <span class="bm-off">-${o.off}%</span>
                <div class="bm-icon">${bmEntryIcon(o)}</div>
                <div class="bm-name">${bmEntryName(o)}</div>
                <div class="bm-price"><s>${fmt(o.v)}</s><b>${fmt(o.price)} JC</b></div>
                <button class="btn btn-sm ${left > 0 ? 'btn-gold' : ''}" data-bmbuy="${i}" ${left > 0 && gameState.jc >= o.price ? '' : 'disabled'}>${left > 0 ? `구매 · 남은 ${left}개` : '품절'}</button>
            </div>`;
        }).join('')}</div>
        <div class="set-note">수량은 한 사람당이에요. 이미 가진 장비를 사면 강화 +1 (MAX면 JC로 돌려줘요).</div>`;
    attachGearPreviews(el);
    bmTimer = setInterval(() => {
        const t = el.querySelector('[data-bmend]');
        if ($('sheet-bm').classList.contains('hidden') || !t) return clearInterval(bmTimer);
        const left = +t.dataset.bmend - Date.now();
        if (left <= 0) { renderBM(); updateBMBtn(); return; }
        t.textContent = fmtClock(left);
    }, 1000);
}
const fmtClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
$('bm-panel').addEventListener('click', e => {
    if (e.target.closest('[data-bmforce]')) { bmForced = { key: 'dev-' + Date.now(), end: Date.now() + BM_MIN * 60000 }; renderBM(); updateBMBtn(); return; }
    const b = e.target.closest('[data-bmbuy]');
    if (!b) return;
    const cur = bmCurrent();
    if (!cur) { renderBM(); return; }
    const st = gameState.bm, i = +b.dataset.bmbuy, o = bmOffers(cur.key)[i];
    if ((st.bought[i] || 0) >= o.stock) return;
    if (gameState.jc < o.price) { toast('JC가 부족해요', 'bad'); return; }
    gameState.jc -= o.price;
    st.bought[i] = (st.bought[i] || 0) + 1;
    const res = gachaGrant({ ...o, tier: 'EPIC' });
    trackQuestProgress('shopPurchases', 1);
    saveGame(); renderStats(); renderBM(); applyGear();
    toast(`🕶 ${bmEntryName(o)}${res.sub ? ` · ${res.sub}` : ''}`, 'gold');
});
function updateBMBtn() {
    const btn = $('bm-btn'), lab = $('bm-label');
    if (!btn) return;
    const cur = bmCurrent(), nx = bmNextOpen();
    btn.classList.toggle('open', !!cur);
    btn.classList.toggle('soon', !cur && nx - Date.now() < 30 * 60000);
    lab.textContent = cur ? fmtClock(cur.end - Date.now()) : (nx - Date.now() < 30 * 60000 ? `곧 열림` : '암시장');
}
$('bm-btn').addEventListener('click', () => openSheet('sheet-bm'));
setInterval(updateBMBtn, 1000);

/* ---------- 📖 스포트라이트 튜토리얼 (누를 곳만 밝게) ---------- */
const TUT_STEPS = [
    { sel: '#roll-btn', text: '먼저 <b>ROLL</b>을 눌러서 아우라를 뽑아 봐요!', click: true, wait: 2600 },
    { sel: '#aura-display', text: '방금 뽑은 아우라가 여기 나와요.<br>희귀할수록 <b>1/숫자</b>가 커지고 연출도 화려해져요.' },
    { sel: '.stats', text: '<b>LUCK</b>이 높을수록 희귀한 게 잘 나오고<br><b>SPEED</b>가 높을수록 빨리 굴려요.' },
    { sel: '#auto-roll-btn', text: '<b>AUTO</b>를 켜면 알아서 계속 굴려요.<br>폰 켜 두고 방치해도 OK!' },
    { sel: '.bottom-nav', text: '<b>가방</b> 아우라·장비 · <b>제작</b> 건틀릿·부적 · <b>상점</b> 물약·뽑기<br><b>퀘스트</b> · <b>펫</b> 알 부화·합성 · <b>도감</b> 세트 버프', pad: 4 },
    { sel: '.nav-btn[data-sheet="sheet-shop"]', text: '상점을 눌러 볼까요?', click: true, wait: 450 },
    { sel: '#sheet-shop .sheet', text: '물약으로 행운·속도를 올리고<br><b>뽑기</b>에선 장비랑 <b>🥚 펫 알</b>도 나와요.', close: 'sheet-shop', pad: -2 },
    { sel: '#attend-btn', text: '매일 <b>출석</b>하면 보상을 받아요. 7일째가 제일 커요!' },
    { sel: '#settings-btn', text: '<b>설정</b>에서 로그인·랭킹·소리·화질을 바꿀 수 있어요.<br>튜토리얼도 여기서 다시 볼 수 있어요.' },
    { sel: null, text: '준비 끝! 🎉<br>희귀한 아우라를 찾아 떠나 볼까요?', last: true }
];
const TUT_REWARD = 5000;
let tutIdx = -1, tutFirst = false, tutTimer = 0;
function tutRect(st) {
    const el = st.sel && document.querySelector(st.sel);
    if (!el || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return null;
    const r = el.getBoundingClientRect(), p = st.pad ?? 6;
    return { x: r.left - p, y: r.top - p, w: r.width + p * 2, h: r.height + p * 2 };
}
function tutShow() {
    const box = $('tut'), st = TUT_STEPS[tutIdx];
    const hole = box.querySelector('.tut-hole'), hand = box.querySelector('.tut-hand'), bub = box.querySelector('.tut-bubble');
    const r = tutRect(st);
    const W = innerWidth, H = innerHeight;
    if (r) Object.assign(hole.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', borderRadius: '6px' });
    else Object.assign(hole.style, { left: W / 2 + 'px', top: H / 2 + 'px', width: '0px', height: '0px' });
    box.classList.toggle('no-target', !r);
    box.classList.toggle('need-click', !!st.click);
    hand.classList.toggle('hidden', !r || !st.click);
    if (r) { hand.style.left = (r.x + r.w / 2 - 14) + 'px'; hand.style.top = (r.y + r.h * 0.55) + 'px'; }
    bub.querySelector('.tut-step').textContent = st.last ? '' : `${tutIdx + 1} / ${TUT_STEPS.length - 1}`;
    bub.querySelector('.tut-text').innerHTML = st.text + (st.last && tutFirst ? `<div class="tut-gift">🎁 +${fmt(TUT_REWARD)} JC</div>` : '');
    bub.querySelector('.tut-next').textContent = st.last ? '시작하기!' : '다음';
    bub.querySelector('.tut-next').classList.toggle('hidden', !!st.click);
    bub.querySelector('.tut-skip').classList.toggle('hidden', !!st.last);
    // 말풍선: 밝은 곳 위나 아래 중 넓은 쪽
    bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
    const bh = bub.offsetHeight || 120;
    let top;
    if (!r) top = H / 2 - bh / 2;
    else if (r.y + r.h + bh + 24 < H - 8 && (H - (r.y + r.h)) > r.y) top = r.y + r.h + (st.click ? 44 : 14);
    else top = Math.max(8, r.y - bh - 14);
    bub.style.top = Math.min(H - bh - 8, top) + 'px';
}
function startTutorial(first = false) {
    document.querySelectorAll('.sheet-backdrop:not(.hidden)').forEach(s => closeSheet(s.id));
    tutFirst = first && !gameState.tutorialDone;
    tutIdx = 0;
    const box = $('tut');
    box.classList.remove('hidden', 'leaving');
    document.body.classList.add('tut-on');
    setTimeout(tutShow, 260);
}
function tutNext() {
    const st = TUT_STEPS[tutIdx];
    if (st?.close) closeSheet(st.close);
    if (st?.last) return endTutorial(true);
    tutIdx++;
    setTimeout(tutShow, st?.close ? 240 : 0);
}
function endTutorial(done) {
    clearTimeout(tutTimer);
    const box = $('tut');
    TUT_STEPS.forEach(s => s.close && closeSheet(s.close));
    box.classList.add('leaving');
    setTimeout(() => { box.classList.add('hidden'); box.classList.remove('leaving'); document.body.classList.remove('tut-on'); }, 300);
    if (tutFirst && done) { gameState.jc += TUT_REWARD; toast(`🎁 튜토리얼 보상 +${fmt(TUT_REWARD)} JC`, 'good'); renderStats(); }
    const wasFirst = tutFirst;
    tutFirst = false; tutIdx = -1;
    gameState.tutorialDone = true;
    saveGame();
    if (wasFirst && canAttend()) setTimeout(() => openSheet('sheet-attend'), 700);
}
$('tut').querySelector('.tut-next').addEventListener('click', tutNext);
$('tut').querySelector('.tut-skip').addEventListener('click', () => endTutorial(false));
// 어두운 곳은 막고, 밝은 곳을 누르면 그 버튼을 대신 눌러 줌
$('tut').querySelector('.tut-catch').addEventListener('click', e => {
    const st = TUT_STEPS[tutIdx];
    if (!st?.click || tutTimer) return;
    const r = tutRect(st);
    if (!r || e.clientX < r.x || e.clientX > r.x + r.w || e.clientY < r.y || e.clientY > r.y + r.h) {
        $('tut').querySelector('.tut-hole').classList.remove('nudge'); void $('tut').offsetWidth;
        $('tut').querySelector('.tut-hole').classList.add('nudge');
        return;
    }
    document.querySelector(st.sel).click();
    $('tut').classList.add('waiting');
    tutTimer = setTimeout(() => { tutTimer = 0; $('tut').classList.remove('waiting'); tutNext(); }, st.wait || 300);
});
addEventListener('resize', () => { if (tutIdx >= 0) tutShow(); });
$('tut-replay-btn').addEventListener('click', () => startTutorial(false));

function renderAttend() {
    const st = attendState(), can = canAttend();
    const idx = st.count % ATTEND_N;       // 오늘 받을 칸
    $('attend-panel').innerHTML = `
        <div class="at-head">
            <div><b>${fmt(st.total)}</b>일째 출석</div>
            <div class="at-sub">${ATTEND_N}일마다 한 바퀴 · 하루 빠져도 이어서 받아요 · 지금 DAY ${Math.min(ATTEND_N, idx + (can ? 1 : 0)) || ATTEND_N}</div>
        </div>
        <div class="at-grid">${ATTEND_REWARDS.map((r, i) => {
            const claimed = can ? i < idx : i < (idx === 0 ? ATTEND_N : idx);
            const today = can && i === idx;
            return `<div class="at-day ${claimed ? 'done' : ''} ${today ? 'today' : ''} ${r.big ? 'big' : ''} ${r.final ? 'final' : ''}">
                <div class="at-num">DAY ${i + 1}</div>
                <div class="at-items">${rewardChips(r)}</div>
                ${claimed ? '<i class="at-check"></i>' : ''}
            </div>`;
        }).join('')}</div>
        <button class="btn btn-block ${can ? 'btn-gold' : ''}" data-attend ${can ? '' : 'disabled'}>${can ? `DAY ${idx + 1} 보상 받기` : '오늘은 받았어요 · 내일 또 와요'}</button>`;
}
function updateAttendDot() { document.querySelector('#attend-btn .attend-dot')?.classList.toggle('hidden', !canAttend()); }
$('attend-btn').addEventListener('click', () => openSheet('sheet-attend'));
$('attend-panel').addEventListener('click', e => {
    if (!e.target.closest('[data-attend]') || !canAttend()) return;
    const st = attendState();
    const r = ATTEND_REWARDS[st.count % ATTEND_N];
    if (r.jc) gameState.jc += r.jc;
    if (r.items) addItems(r.items);
    if (r.eggs) { const eg = petState().eggs; for (const id in r.eggs) eg[id] = (eg[id] || 0) + r.eggs[id]; updatePetDot(); }
    st.last = todayKey(); st.count++; st.total++;
    passAddXp(50);
    saveGame(); renderStats(); renderAttend(); updateAttendDot();
    playDropSound('LEGEND');
    toast(`📅 출석 ${st.total}일째!\n${[r.jc ? `${fmt(r.jc)} JC` : '', ...Object.entries(r.items || {}).map(([id, n]) => `${SHOP_BY_ID[id].name} ×${n}`), ...Object.entries(r.eggs || {}).map(([id, n]) => `${EGG_BY_ID[id].name} ×${n}`)].filter(Boolean).join(' · ')}`, 'gold');
});

/* =========================================================
   🌦️ 바이옴
   ========================================================= */

let biomeFx = null;
let nextBiomeCheck = Date.now() + BIOME_CHECK_MS;
function getBiome() {
    const b = gameState.biome;
    return b && b.until > Date.now() ? BIOME_BY_ID[b.id] || null : null;
}
function startBiome(b) {
    const am = gearOf(gameState.amulet);
    gameState.biome = { id: b.id, until: Date.now() + b.duration * (am?.biomeTime || 1) * 1000 };
    saveGame();
    applyBiome(true);
}
function endBiome() {
    const was = BIOME_BY_ID[gameState.biome?.id];
    gameState.biome = null;
    nextBiomeCheck = Date.now() + BIOME_CHECK_MS;
    saveGame();
    applyBiome(false);
    if (was) toast(`${was.icon} ${was.name}이(가) 지나갔어요`);
}
function applyBiome(announce) {
    const b = getBiome();
    if (!biomeFx) { try { biomeFx = createBiomeFx($('biome-fx')); } catch (e) { biomeFx = { set() {} }; } }
    biomeFx.set(b);
    document.body.dataset.biome = b ? b.id : '';
    renderBiomeBadge();
    renderStats();
    if (b && announce) {
        const ban = $('biome-banner');
        ban.style.setProperty('--bc', b.color);
        ban.innerHTML = `<div class="bn-icon">${b.icon}</div><div class="bn-name">${b.name}</div><div class="bn-msg">${b.msg}</div><div class="bn-luck">행운 ×${b.luck} · 어울리는 칭호 ×${b.boost}</div>`;
        ban.classList.remove('hidden', 'show'); void ban.offsetWidth; ban.classList.add('show');
        clearTimeout(ban._t); ban._t = setTimeout(() => ban.classList.add('hidden'), 3600);
        playTone(220, 'sawtooth', 0.12 * soundSettings.master, 0.05, 0.9);
        setTimeout(() => playTone(330, 'triangle', 0.12 * soundSettings.master, 0.05, 1.1), 180);
    }
}
function renderBiomeBadge() {
    const el = $('biome-badge'), b = getBiome();
    el.classList.toggle('hidden', !b);
    if (!b) return;
    const left = Math.max(0, Math.ceil((gameState.biome.until - Date.now()) / 1000));
    el.style.setProperty('--bc', b.color);
    el.innerHTML = `<span class="bb-icon">${b.icon}</span><span class="bb-name">${b.name}</span><span class="bb-luck">×${b.luck}</span><span class="bb-time">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span>`;
}
function biomeTick() {
    if ($('main-game').classList.contains('hidden')) return;
    if (gameState.biome) {
        if (gameState.biome.until <= Date.now()) endBiome();
        else renderBiomeBadge();
        return;
    }
    if (Date.now() < nextBiomeCheck) return;
    nextBiomeCheck = Date.now() + BIOME_CHECK_MS;
    const b = rollBiome(gearOf(gameState.amulet)?.biomeBoost || 1, activeEvents());
    if (b) startBiome(b);
}
$('biome-badge').addEventListener('click', () => {
    const b = getBiome();
    if (!b) return;
    const names = b.auras.map(id => AURA_BY_ID[id]).filter(Boolean).map(a => `· ${a.name} (1 in ${fmt(Math.round(a.in / b.boost))})`).join('\n');
    const only = AURA_DATA.filter(a => a.biome === b.id).map(a => `· [${a.grade}] ${a.name} (1 in ${fmt(a.in)})`).join('\n');
    ask({ title: `${b.icon} ${b.name}`, message: `${b.msg}\n행운 ×${b.luck}\n\n이 바이옴에서 확률 ×${b.boost}\n${names}` + (only ? `\n\n✦ 이 바이옴에서만 나오는 칭호\n${only}` : '') });
});

/* =========================================================
   ⏱️ 버프 타이머 (1초마다)
   ========================================================= */

setInterval(() => {
    const now = Date.now(), b = gameState.activeBuffs;
    let expired = false;
    if (b.luckExpireTime && now > b.luckExpireTime) { b.luckBonus = 0; b.luckExpireTime = 0; b.luckLevel = 0; expired = true; }
    if (b.speedExpireTime && now > b.speedExpireTime) { b.speedBonus = 0; b.speedExpireTime = 0; b.speedLevel = 0; expired = true; }
    if (expired) { renderStats(); saveGame(); }
    renderBuffs();
    biomeTick();
}, 1000);

/* =========================================================
   ✨ 별 배경 (천천히 떠다니며 반짝임)
   ========================================================= */

function startStarfield2D() {
    const cv = $('starfield'), ctx = cv.getContext('2d');
    cv.classList.remove('hidden');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, dpr, stars = [];
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.width = innerWidth * dpr;
        h = cv.height = innerHeight * dpr;
        const count = Math.round(innerWidth * innerHeight / 3200);
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: (Math.random() ** 3 * 1.4 + 0.3) * dpr,
            a: Math.random() * 0.6 + 0.2,
            t: Math.random() * Math.PI * 2,
            s: Math.random() * 0.012 + 0.004,
            v: (Math.random() * 0.06 + 0.02) * dpr
        }));
    }
    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const st of stars) {
            st.t += st.s;
            st.y -= st.v;
            if (st.y < -2) { st.y = h + 2; st.x = Math.random() * w; }
            ctx.globalAlpha = st.a * (0.55 + 0.45 * Math.sin(st.t));
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
        }
        if (!reduce) requestAnimationFrame(draw);
    }
    addEventListener('resize', resize);
    resize(); draw();
}

/* =========================================================
   🧊 3D 아우라 무대
   ========================================================= */

let stage3d = null;
const nametag = $('nametag');

// 화질 설정
const QUALITY_KEY = 'js_rng_quality';
let qualityMode = 'auto';
try { qualityMode = localStorage.getItem(QUALITY_KEY) || 'auto'; } catch (e) {}
function applyQuality() {
    stage3d?.setQualityMode(qualityMode);
    document.querySelectorAll('#quality-seg button').forEach(b => b.classList.toggle('on', b.dataset.q === qualityMode));
}
$('quality-seg').addEventListener('click', e => {
    const q = e.target.dataset.q;
    if (!q) return;
    qualityMode = q;
    try { localStorage.setItem(QUALITY_KEY, q); } catch (err) {}
    applyQuality();
});
applyQuality();
// 효과 양 (입자 수)
const FX_KEY = 'js_rng_fx';
let fxMode = 'high';
try { fxMode = localStorage.getItem(FX_KEY) || 'high'; } catch (e) {}
function applyFxMode() {
    stage3d?.setFxMode?.(fxMode);
    document.querySelectorAll('#fx-seg button').forEach(b => b.classList.toggle('on', b.dataset.fx === fxMode));
}
$('fx-seg').addEventListener('click', e => {
    const f = e.target.dataset.fx;
    if (!f) return;
    fxMode = f;
    try { localStorage.setItem(FX_KEY, f); } catch (err) {}
    applyFxMode();
});
applyFxMode();

// 건틀렛/부적을 3D 캐릭터 팔에 끼움
function applyGear() {
    stage3d?.setGear({ gauntlet: gameState.gear, amulet: gameState.amulet, visible: gameState.showGear !== false });
    stage3d?.setPet?.(petOn()?.id || null);
    const btn = $('gear-toggle-btn');
    if (btn) { btn.textContent = gameState.showGear !== false ? 'ON' : 'OFF'; btn.classList.toggle('on', gameState.showGear !== false); }
}
$('gear-toggle-btn').addEventListener('click', () => {
    gameState.showGear = gameState.showGear === false;
    saveGame(); applyGear();
});

function applyEquippedAura() {
    applyGear();
    const aura = AURA_BY_ID[gameState.equippedAura] || null;
    stage3d?.setAura(aura);
    document.documentElement.style.setProperty('--aura', aura ? aura.color : '#5b4dff');
    const inGame = !$('main-game').classList.contains('hidden');
    if (aura && inGame) {
        if (nametag.dataset.id !== aura.id) {
            nametag.dataset.id = aura.id;
            nametag.innerHTML = auraNameHtml(aura);
            nametag.classList.remove('swap'); void nametag.offsetWidth; nametag.classList.add('swap');
        }
        nametag.classList.remove('hidden');
    } else {
        nametag.classList.add('hidden');
    }
}

import('./aura3d.js?v=51')
    .then(({ createAuraStage }) => {
        stage3d = createAuraStage($('stage3d'), {
            getStageRect: () => {
                const r = ui.stage.getBoundingClientRect();
                return r.height > 0 ? r : null;
            },
            onLabel: (x, y) => { nametag.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`; }
        });
        applyQuality();
        applyFxMode();
        applyEquippedAura();
    })
    .catch(err => {
        console.warn('3D를 켤 수 없어 2D 배경으로 대신합니다:', err);
        $('stage3d').remove();
        startStarfield2D();
    });

/* =========================================================
   🔄 새 버전 자동 확인
   index.html의 ?v= 숫자와 version.json이 다르면
   브라우저에 남은 예전 화면 대신 새 버전으로 다시 연다
   ========================================================= */

const APP_VERSION = new URL(import.meta.url).searchParams.get('v') || '0';
fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(({ v }) => {
        const tried = sessionStorage.getItem('js_rng_reload');
        if (String(v) !== APP_VERSION && tried !== String(v)) {
            sessionStorage.setItem('js_rng_reload', String(v));
            location.replace(`${location.pathname}?v=${v}`);
        }
    })
    .catch(() => {});

/* =========================================================
   🚀 시작
   ========================================================= */

loadGame();
music.importYt(gameState.ytTracks);
renderSoundUI();
/* =========================================================
   🎧 뮤직 플레이어 UI
   ========================================================= */
const fmtTime = sec => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60), ss = Math.floor(sec % 60);
    return `${m}:${String(ss).padStart(2, '0')}`;
};
let seeking = false;
function renderMusic(kind) {
    const t = music.current, tm = music.time();
    const frac = tm.dur ? tm.cur / tm.dur : 0;
    $('mp-progress-fill').style.transform = `scaleX(${frac})`;
    if (!seeking) $('np-seek').value = Math.round(frac * 1000);
    $('np-cur').textContent = fmtTime(tm.cur);
    $('np-dur').textContent = fmtTime(tm.dur);
    $('np-seek').style.setProperty('--p', `${frac * 100}%`);
    if (kind === 'time') return;

    const cover = coverArt(t);
    for (const id of ['mp-cover', 'np-cover']) if ($(id).getAttribute('src') !== cover) $(id).src = cover;
    for (const id of ['mp-cover', 'np-cover']) $(id).classList.toggle('yt', !!t.yt);
    $('mp-title').textContent = t.title; $('mp-artist').textContent = t.artist;
    $('np-title').textContent = t.title; $('np-artist').textContent = t.artist;
    // 제목이 길면 흘러가게
    const box = $('mp-title').parentElement;
    box.classList.toggle('scroll', $('mp-title').scrollWidth > box.clientWidth + 2);

    const playing = music.playing;
    document.querySelectorAll('.mini-player, .np').forEach(n => n.classList.toggle('playing', playing));
    $('np-shuffle').classList.toggle('on', music.state.shuffle);
    $('np-repeat').classList.toggle('on', music.state.repeat !== 'off');
    $('np-repeat').classList.toggle('one', music.state.repeat === 'one');

    const q = $('queue-list');
    q.innerHTML = music.state.tracks.map(tr => `
        <div class="q-item ${tr.id === t.id ? 'current' : ''}" data-id="${tr.id}">
            <img class="q-cover ${tr.yt ? 'yt' : ''}" src="${coverArt(tr)}" alt="">
            <div class="q-meta"><div class="q-title">${tr.yt ? '<span class="yt-badge">YouTube</span>' : ''}${escapeHtml(tr.title)}</div><div class="q-artist">${escapeHtml(tr.artist)}</div></div>
            ${tr.id === t.id ? `<div class="mp-eq ${playing ? '' : 'stop'}"><i></i><i></i><i></i><i></i></div>` : ''}
            ${tr.builtin ? '' : `<button class="q-del" data-del="${tr.id}" aria-label="삭제">✕</button>`}
        </div>`).join('');
}
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
music.on(renderMusic);

$('mini-player').addEventListener('click', e => {
    if (e.target.closest('#mp-play')) { music.toggle(); return; }
    if (e.target.closest('#mp-next')) { music.next(); return; }
    openSheet('sheet-music');
});
$('np-play').addEventListener('click', () => music.toggle());
$('np-next').addEventListener('click', () => music.next());
$('np-prev').addEventListener('click', () => music.prev());
$('np-shuffle').addEventListener('click', () => music.setShuffle());
$('np-repeat').addEventListener('click', () => {
    music.cycleRepeat();
    toast(music.state.repeat === 'all' ? '🔁 전체 반복' : music.state.repeat === 'one' ? '🔂 한 곡 반복' : '반복 끔');
});
$('np-seek').addEventListener('input', e => {
    seeking = true;
    $('np-cur').textContent = fmtTime((e.target.value / 1000) * (music.time().dur || 0));
    $('np-seek').style.setProperty('--p', `${e.target.value / 10}%`);
});
$('np-seek').addEventListener('change', e => { music.seek(e.target.value / 1000); seeking = false; });
$('queue-list').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) { music.remove(del.dataset.del); return; }
    const item = e.target.closest('.q-item');
    if (item) music.play(item.dataset.id);
});
$('music-file').addEventListener('change', async e => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const n = await music.addFiles(files);
    toast(n ? `🎵 ${n}곡 추가됨` : '오디오 파일만 추가할 수 있어요');
});
// 유튜브 / 유튜브 뮤직 링크 추가
async function addYtFromInput() {
    const inp = $('yt-url'), v = inp.value.trim();
    if (!v) { toast('유튜브 링크를 붙여 넣어 주세요', 'bad'); return; }
    const btn = $('yt-add-btn');
    btn.disabled = true; btn.textContent = '…';
    try {
        const r = await music.addYouTube(v);
        if (r.error) toast('유튜브 / 유튜브 뮤직 링크만 넣을 수 있어요', 'bad');
        else if (!r.added) toast(r.dup ? '이미 재생목록에 있어요' : '재생목록을 못 불러왔어요 (공개 목록인지 확인해 주세요)', 'bad');
        else { toast(`▶ 유튜브 ${r.added}곡 추가됨${r.dup ? ` · 이미 있던 ${r.dup}곡은 뺐어요` : ''}`, 'good'); inp.value = ''; }
    } finally { btn.disabled = false; btn.textContent = '추가'; }
}
$('yt-add-btn').addEventListener('click', addYtFromInput);
$('yt-url').addEventListener('keydown', e => { if (e.key === 'Enter') addYtFromInput(); });
$('yt-pip').addEventListener('click', e => { if (e.target.closest('.yt-pip-x')) music.toggle(false); else openSheet('sheet-music'); });
$('open-music-btn').addEventListener('click', () => { closeSheet('sheet-settings'); setTimeout(() => openSheet('sheet-music'), 220); });
renderMusic();

renderGradeTable();
renderAll();
if (gameState.rolls > 0) {
    $('lobby-save-info').textContent = `${fmt(gameState.rolls)} ROLLS`;
}
playBgm('lobby');
