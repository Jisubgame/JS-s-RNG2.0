/* =========================================================
   🌀 균열 레이드 (dungeon.js) — 포켓몬GO 레이드처럼
   - 레이드 칭호(16개 + 던전 칭호 2개)만 싸울 수 있음. 칭호마다 속성 · 기본기 · 필살기
   - 칭호 6개로 팀을 짜서 입장 → 앞의 칭호가 쓰러지면 다음 칭호가 나옴, 전멸하면 재정비 후 다시
   - 화면을 탭(꾹 누르기)하면 기본기 → 에너지가 차면 필살기, 좌우로 밀면 회피
   - 보스 약점 속성이면 피해 ×1.6, 저항 속성이면 ×0.625
   - 이기면 보상이 바로 들어옴 (낮은 확률로 레이드 전용 장비·칭호)
   - 솔로: 서버 없음 / 파티(최대 4명): Supabase 실시간 채널 (DB 저장 없음, 보스 체력만 같이 깎음)
   - 던전 티켓(상점에서 판매) + 하루 3판까지
   ========================================================= */

export const ELEMENTS = {
    fire:  { name: '불',   icon: '🔥', color: '#ff7a2a', fx: 'burn',   fast: { name: '불꽃 튀기기',   pw: 10, t: 0.7, en: 7 }, charged: { name: '화염 폭발',     pw: 90,  cost: 50 } },
    ice:   { name: '얼음', icon: '❄', color: '#7ae8ff', fx: 'freeze', fast: { name: '얼음 조각',     pw: 9,  t: 0.6, en: 8 }, charged: { name: '눈보라',        pw: 140, cost: 100 } },
    volt:  { name: '번개', icon: '⚡', color: '#ffe14d', fx: 'chain',  fast: { name: '전기 쇼크',     pw: 7,  t: 0.5, en: 9 }, charged: { name: '낙뢰',          pw: 55,  cost: 33 } },
    light: { name: '빛',   icon: '✨', color: '#fff3a0', fx: 'strike', fast: { name: '빛의 화살',     pw: 11, t: 0.8, en: 7 }, charged: { name: '성스러운 심판', pw: 100, cost: 50 } },
    dark:  { name: '어둠', icon: '🌑', color: '#a070ff', fx: 'drain',  fast: { name: '그림자 할퀴기', pw: 10, t: 0.7, en: 7 }, charged: { name: '암흑 파동',     pw: 70,  cost: 33 } },
    rift:  { name: '균열', icon: '🌀', color: '#ff6ad8', fx: 'rend',   fast: { name: '균열 손톱',     pw: 12, t: 0.7, en: 8 }, charged: { name: '차원 붕괴',     pw: 160, cost: 100 } }
};
// 레이드 보스 (hp·dmg = 기본 난이도 수치에 곱하는 배율)
// 속성 문양 (SVG)
const EMB = {
    fire:  '<path class="f" d="M12 1.5c.6 3.6 4.6 5.6 5.4 9.6.9 4.5-2 9.4-5.4 9.4s-6.6-3-6.1-7.6c.3-2.8 2.3-4 2.6-6.6 1.3 1.1 1.9 2.6 1.9 4.2 1.5-2.2 2-5.3 1.6-9z"/><path class="i" d="M12 12.5c.4 1.9 2.4 2.9 2.4 5.1 0 1.6-1.1 2.8-2.4 2.8s-2.4-1.1-2.4-2.6c0-1.6 1.4-2.4 2.4-5.3z"/>',
    ice:   '<g class="s"><path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10"/><path d="M9.3 3.6L12 6l2.7-2.4M9.3 20.4L12 18l2.7 2.4M3.6 10.1l3.5-.9-.9-3.5M20.4 13.9l-3.5.9.9 3.5M6.2 18.3l.9-3.5-3.5-.9M17.8 5.7l-.9 3.5 3.5.9"/></g><circle class="f" cx="12" cy="12" r="2.2"/>',
    volt:  '<path class="f" d="M13.5 1.5L4 13.6h6.6l-1.6 8.9 10-12.6h-6.7z"/>',
    light: '<path class="f" d="M12 1.8l1.9 6.2 6.3-1.6-4.5 4.6 4.5 4.6-6.3-1.6L12 20.2 10.1 14l-6.3 1.6 4.5-4.6-4.5-4.6 6.3 1.6z"/><circle class="i" cx="12" cy="11" r="2.6"/>',
    dark:  '<path class="f" d="M15.5 2.2a9.6 9.6 0 100 19.6 8 8 0 01-.3-19.6z"/><path class="i" d="M18.5 6l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>',
    rift:  '<path class="f" d="M12 1l2.2 5.4-1.5 3 2.3 3.6-2.3 3.4 1.2 6.6-1.9-6.2-2.4-3.8 2.2-3.4-1.7-3.3z"/><path class="s" d="M6 8l2 1M18 8l-2 1M6 16l2-1M18 16l-2-1"/>'
};
export const embSvg = (el, cls = '') => `<svg class="emb ${cls}" viewBox="0 0 24 24" style="--ec:${ELEMENTS[el].color}" aria-hidden="true">${EMB[el]}</svg>`;
// 보스 문양 (선택 카드·소개 화면)
const BOSS_ART = {
    rift:  '<path class="f" d="M50 4l7 20-5 10 8 14-8 12 4 36-6-34-8-14 7-12-6-12z"/><path class="s" d="M24 30l14 8M76 30l-14 8M24 70l14-8M76 70l-14-8"/>',
    frost: '<g class="s"><path d="M50 6v88M12 28l76 44M12 72l76-44"/><path d="M40 12l10 10 10-10M40 88l10-10 10 10M14 42l14-2-3-14M86 58l-14 2 3 14M25 86l3-14-14-2M75 14l-3 14 14 2"/></g><path class="f" d="M50 38l10 12-10 12-10-12z"/>',
    magma: '<path class="f" d="M50 8c4 14 22 22 24 40 3 20-10 40-24 40S22 76 26 56c2-11 10-16 11-26 6 5 9 11 9 18 6-9 8-20 4-40z"/><path class="i" d="M36 52c6-4 22-4 28 0-6 4-22 4-28 0z"/><path class="k" d="M49 46h2v12h-2z"/>',
    storm: '<path class="f" d="M50 30L8 18l18 18-14 4 26 6 12 14 12-14 26-6-14-4 18-18z"/><path class="i" d="M54 42L42 64h9l-4 22 15-28h-9z"/>'
};
const bossArt = (id, cls = '') => `<svg class="boss-art ${cls}" viewBox="0 0 100 100" aria-hidden="true">${BOSS_ART[id]}</svg>`;

export const BOSSES = [
    { id: 'rift',  name: '균열의 군주', sub: 'RIFT LORD',      weak: 'light', resist: 'dark', color: '#c070ff', color2: '#ff6ad8', hp: 1,    dmg: 1,    desc: '차원의 틈에서 깨어난 흑요석 거인',
      drops: [{ kind: 'gear', id: 'gear_riftbreaker', p: [0, 0.008, 0.02, 0.045] }, { kind: 'gear', id: 'amu_riftcore', p: [0, 0.01, 0.025, 0.055] }, { kind: 'aura', id: 'dng_riftwalker', p: [0, 0.006, 0.015, 0.035] }, { kind: 'aura', id: 'dng_riftlord', p: [0, 0, 0.002, 0.008] }] },
    { id: 'frost', name: '서리 거신',   sub: 'FROST COLOSSUS', weak: 'fire',  resist: 'ice',  color: '#7ae8ff', color2: '#d8fbff', hp: 1.15, dmg: 1.05, desc: '만년설 아래 잠들어 있던 빙하의 거인',
      drops: [{ kind: 'gear', id: 'gear_glacierfist', p: [0, 0.008, 0.02, 0.045] }, { kind: 'aura', id: 'dng_frostheart', p: [0, 0.005, 0.012, 0.03] }] },
    { id: 'magma', name: '용암 비룡',   sub: 'MAGMA WYRM',     weak: 'ice',   resist: 'fire', color: '#ff7a2a', color2: '#ffd23a', hp: 1.3,  dmg: 1.1,  desc: '화산 심장부에서 깨어난 불의 용',
      drops: [{ kind: 'gear', id: 'amu_dragonheart', p: [0, 0.008, 0.02, 0.045] }, { kind: 'aura', id: 'dng_dragonheir', p: [0, 0.005, 0.012, 0.03] }] },
    { id: 'storm', name: '천공의 뇌조', sub: 'STORM ROC',      weak: 'dark',  resist: 'volt', color: '#ffe14d', color2: '#6ad0ff', hp: 1.45, dmg: 1.15, desc: '먹구름을 몰고 다니는 번개의 새',
      drops: [{ kind: 'gear', id: 'gear_stormtalon', p: [0, 0.008, 0.02, 0.045] }, { kind: 'aura', id: 'dng_stormrider', p: [0, 0, 0.004, 0.012] }] }
];
export const BOSS_BY_ID = Object.fromEntries(BOSSES.map(b => [b.id, b]));
let CUR = BOSSES[0];   // 지금 고른(싸우는) 보스
const effOf = (el, b = CUR) => el === b.weak ? 1.6 : el === b.resist ? 0.625 : 1;
export const bossesWeakTo = el => BOSSES.filter(b => b.weak === el);

// 레이드에 나갈 수 있는 칭호 (속성)
export const RAID_AURAS = {
    ep_fire_jisung: 'fire', ep_frozen_byungeun: 'ice',
    leg_storm_gaeun: 'volt', legend_wizard: 'light', leg_necro_tv: 'dark',
    myth_phoenix_gaeun: 'fire', myth_aurora_gaeun: 'ice', myth_thunderbeast_minchae: 'volt', myth_dragonknight_minchae: 'light',
    anc_iceemperor_tv: 'ice', anc_vampire_gunwoo: 'dark', divine_knight_gaen_sword: 'light',
    abs_archdemon_tv: 'fire', abs_breaker_byungeun: 'volt',
    js_lightning_jisung: 'volt', jxs_creator_gaeun: 'light',
    dng_riftwalker: 'rift', dng_riftlord: 'rift',
    dng_frostheart: 'ice', dng_dragonheir: 'fire', dng_stormrider: 'volt',
    leg_shadowblade_gunwoo: 'dark', myth_starforger_jisung: 'fire', myth_tidecaller_gaeun: 'ice', anc_clockmaster_byungeun: 'light', jxs_eclipse_gunwoo: 'dark',
    leg_lantern_minchae: 'fire', leg_mecha_byungeun: 'volt', myth_crystalwitch_tv: 'dark', anc_skywhale_gaeun: 'ice', abs_valkyrie_minchae: 'light',
    leg_archer_byungeun: 'light', myth_glitch_tv: 'rift', anc_worldserpent_minchae: 'dark', abs_seraph_tv: 'fire', jxs_dreamweaver_minchae: 'ice',
    leg_icarus_tv: 'fire', leg_moonspider_gaeun: 'dark', myth_kaleido_minchae: 'rift', myth_crane_gaeun: 'ice', anc_titan_jisung: 'fire', abs_meteor_byungeun: 'volt', jxs_genesis_jisung: 'light'
};
// 등급 차이는 작게 (JXS 하나로 다 이기지 않게) — 속성·팀 구성이 더 중요
const GRADE_STAT = { EPIC: [900, 6000], LEGEND: [980, 6400], MYTHIC: [1060, 6800], ANCIENT: [1140, 7200], ABSOLUTE: [1220, 7600], JXS: [1300, 8000] };
const STAT_OVERRIDE = { dng_riftwalker: [1200, 7200], dng_riftlord: [1360, 8000], dng_frostheart: [1260, 7600], dng_dragonheir: [1260, 7600], dng_stormrider: [1360, 8000] };
export function raidInfo(a, bossId) {
    const el = a && RAID_AURAS[a.id];
    if (!el) return null;
    const [atk, hp] = STAT_OVERRIDE[a.id] || GRADE_STAT[a.grade];
    return { el, E: ELEMENTS[el], atk, hp, eff: effOf(el, bossId ? BOSS_BY_ID[bossId] : CUR) };
}

export const DIFFS = [
    { id: 'easy',   star: 1, label: '쉬움',   color: '#5fe08a', hp: 20000,  hit: 120, slam: 600,  jc: 60000,   xp: 1500, chests: 1 },
    { id: 'normal', star: 3, label: '보통',   color: '#ffd23a', hp: 60000,  hit: 300, slam: 1200, jc: 200000,  xp: 3000, chests: 2 },
    { id: 'hard',   star: 5, label: '어려움', color: '#ff8a3a', hp: 120000, hit: 500, slam: 2200, jc: 600000,  xp: 5000, chests: 3 },
    { id: 'hell',   star: 6, label: '지옥',   color: '#ff2a4a', hp: 250000, hit: 800, slam: 3500, jc: 1800000, xp: 8000, chests: 4 }
];
// 🎁 레이드 상자: 보스마다 다른 상자, 열면 보스마다 다른 보상 (뽑기처럼 하나씩)
//   kind: items/egg/jc/gear 는 상점 뽑기와 같은 방식, tickets(뽑기권)/dtk(던전 티켓)/xp(패스 XP)는 여기서 직접
export const CHESTS = {
    rift: { name: '균열의 상자', theme: '배수 물약', pool: [
        { kind: 'items', items: { limit_potion: 2 }, w: 40, tier: 'COMMON' },
        { kind: 'items', items: { dice_potion: 2 }, w: 18, tier: 'RARE' },
        { kind: 'items', items: { overcome_potion: 1 }, w: 22, tier: 'RARE' },
        { kind: 'items', items: { heaven_potion: 1 }, w: 8, tier: 'EPIC' },
        { kind: 'items', items: { void_potion: 1 }, w: 2.2, tier: 'LEGEND' },
        { kind: 'items', items: { nebula_potion: 1 }, w: 0.25, tier: 'MYTHIC' }] },
    frost: { name: '서리의 상자', theme: '시간 물약 · 알', pool: [
        { kind: 'items', items: { star_potion: 2 }, w: 32, tier: 'COMMON' },
        { kind: 'items', items: { warp_potion: 2 }, w: 28, tier: 'COMMON' },
        { kind: 'egg', id: 'egg_rare', w: 18, tier: 'RARE' },
        { kind: 'dtk', n: 1, w: 10, tier: 'RARE' },
        { kind: 'egg', id: 'egg_legend', w: 7, tier: 'EPIC' },
        { kind: 'egg', id: 'egg_forest', w: 14, tier: 'RARE' },
        { kind: 'egg', id: 'egg_mythic', w: 1.6, tier: 'LEGEND' },
        { kind: 'egg', id: 'egg_ancient', w: 0.6, tier: 'MYTHIC' },
        { kind: 'egg', id: 'egg_cosmic', w: 0.08, tier: 'ABSOLUTE' }] },
    magma: { name: '용암의 상자', theme: 'JC · 주사위', pool: [
        { kind: 'jc', min: 80000, max: 180000, w: 42, tier: 'COMMON', label: '녹은 금화' },
        { kind: 'items', items: { dice_potion: 3 }, w: 20, tier: 'RARE' },
        { kind: 'jc', min: 300000, max: 600000, w: 18, tier: 'RARE', label: '용암 금괴' },
        { kind: 'items', items: { biome_potion: 2 }, w: 10, tier: 'EPIC' },
        { kind: 'jc', min: 1500000, max: 3000000, w: 2.5, tier: 'LEGEND', label: '화룡의 보물' },
        { kind: 'gear', id: 'gacha_jackpot', w: 0.8, tier: 'MYTHIC', dupe: 300000 }] },
    storm: { name: '폭풍의 상자', theme: '뽑기권 · 패스 XP', pool: [
        { kind: 'tickets', n: 1, w: 34, tier: 'COMMON' },
        { kind: 'xp', n: 3000, w: 30, tier: 'COMMON' },
        { kind: 'tickets', n: 3, w: 15, tier: 'RARE' },
        { kind: 'xp', n: 10000, w: 11, tier: 'RARE' },
        { kind: 'dtk', n: 1, w: 6, tier: 'EPIC' },
        { kind: 'tickets', n: 10, w: 1.4, tier: 'LEGEND' }] }
};
const chestPick = pool => { let r = Math.random() * pool.reduce((a, e) => a + e.w, 0); for (const e of pool) if ((r -= e.w) < 0) return e; return pool[0]; };
const chestHtml = (id, cls = '') => `<span class="rchest ${cls}" style="--cc:${BOSS_BY_ID[id].color};--cc2:${BOSS_BY_ID[id].color2}"><i class="rc-lid"></i><i class="rc-body"></i><i class="rc-lock"></i></span>`;
export const TICKET_DAILY = 2, TICKET_PRICE = 250000, RUN_CAP = 3;
const TIME = 180, MAX_PARTY = 4, TEAM = 6, REJOIN_MS = 8000;
const stars = n => '★'.repeat(n);
const hex = c => typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c;

/* =========================================================
   실시간 통신
   ========================================================= */
function makeNet(topic, api) {
    const hs = {};
    const fire = (ev, p) => (hs[ev] || []).forEach(f => { try { f(p); } catch (e) { console.warn(e); } });
    let tx;
    if (topic === null) tx = { send() {}, close() {} };   // 솔로: 혼자 주고받기만
    else if (window.__DNG_BC) {                              // 테스트용 (같은 브라우저 탭끼리)
        const bc = new BroadcastChannel('dng:' + topic);
        bc.onmessage = e => fire(e.data.ev, e.data.p);
        tx = { send: (ev, p) => bc.postMessage({ ev, p }), close: () => bc.close() };
        setTimeout(() => fire('_ready'), 30);
    } else tx = supaTx(topic, fire, api);
    return {
        on(ev, fn) { (hs[ev] = hs[ev] || []).push(fn); },
        send(ev, p) { tx.send(ev, p); },              // 다른 사람에게만
        emit(ev, p) { tx.send(ev, p); fire(ev, p); },  // 나 포함 전원
        close() { tx.close(); for (const k in hs) delete hs[k]; }
    };
}
// Supabase Realtime (Phoenix 채널) 웹소켓을 직접 씀
function supaTx(topic, fire, api) {
    const url = `${api.SB_URL.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${api.SB_KEY}&vsn=1.0.0`;
    const T = 'realtime:' + topic;
    let ws = null, ref = 0, joinRef = null, ready = false, hb = 0, closed = false, retry = 0;
    const q = [];
    const raw = o => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) {} };
    const msg = (ev, p) => ({ topic: T, event: 'broadcast', payload: { type: 'broadcast', event: ev, payload: p }, ref: String(++ref), join_ref: joinRef });
    function open() {
        try { ws = new WebSocket(url); } catch (e) { fire('_error'); return; }
        ws.onopen = () => {
            joinRef = String(++ref);
            raw({ topic: T, event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { enabled: false }, private: false } }, ref: joinRef, join_ref: joinRef });
            clearInterval(hb);
            hb = setInterval(() => raw({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) }), 25000);
        };
        ws.onmessage = e => {
            let m; try { m = JSON.parse(e.data); } catch (er) { return; }
            if (m.topic !== T) return;
            if (m.event === 'phx_reply' && m.ref === joinRef) {
                if (m.payload?.status === 'ok') { ready = true; retry = 0; q.splice(0).forEach(([ev, p]) => raw(msg(ev, p))); fire('_ready'); }
                else fire('_error', m.payload);
            } else if (m.event === 'broadcast' && m.payload) fire(m.payload.event, m.payload.payload);
        };
        ws.onclose = () => { ready = false; clearInterval(hb); if (!closed) { fire('_lost'); setTimeout(() => !closed && open(), Math.min(5000, 700 * ++retry)); } };
        ws.onerror = () => {};
    }
    open();
    return {
        send(ev, p) { if (ready) raw(msg(ev, p)); else if (q.length < 40) q.push([ev, p]); },
        close() { closed = true; clearInterval(hb); try { raw({ topic: T, event: 'phx_leave', payload: {}, ref: String(++ref), join_ref: joinRef }); ws && ws.close(); } catch (e) {} }
    };
}

/* =========================================================
   본체
   ========================================================= */
export function createDungeon(api) {
    const { fmt, esc } = api;
    const $ = id => document.getElementById(id);
    let selDiff = 0, picking = -1, view = 'main', showRw = false;
    const pickBoss = id => { CUR = BOSS_BY_ID[id] || BOSSES[0]; };
    // 보스·난이도별 클리어 기록 키 (균열의 군주는 예전 기록 그대로)
    const ck = (i, b = CUR) => b.id === 'rift' ? DIFFS[i].id : `${b.id}:${DIFFS[i].id}`;
    let party = null;     // 파티 대기실
    let lobby = null;     // 열린 파티 목록 채널
    let B = null;         // 진행 중인 레이드

    function st() {
        const gs = api.gs();
        if (!gs.dng) gs.dng = { tk: TICKET_DAILY, day: '', clears: {} };
        const s = gs.dng;
        if (!s.clears) s.clears = {};
        if (!s.chests) s.chests = {};
        if (!Array.isArray(s.team) || s.team.length !== TEAM) s.team = Array(TEAM).fill(null);
        const today = api.today();
        if (s.day !== today) { s.day = today; s.tk = Math.max(s.tk || 0, TICKET_DAILY); s.runs = 0; }
        s.runs = s.runs || 0;
        return s;
    }
    const owned = id => id && (api.gs().inventory[id] || 0) > 0;
    const team = () => st().team.map(id => owned(id) && RAID_AURAS[id] ? id : null);
    const unlocked = i => i === 0 || (st().clears[ck(i - 1)] || 0) > 0;
    const runsLeft = () => Math.max(0, RUN_CAP - st().runs);
    const canPlay = () => st().tk > 0 && runsLeft() > 0 && team().some(Boolean);
    const whyNot = () => !team().some(Boolean) ? '레이드 팀에 칭호를 넣어 주세요' : runsLeft() <= 0 ? `오늘은 ${RUN_CAP}판을 다 했어요` : st().tk <= 0 ? '던전 티켓이 없어요' : '';

    // 장비·부적·펫 보너스 (공격 배율 / 체력 배율)
    function mults() {
        const g = api.gear(), am = api.amu(), pet = api.pet();
        const gm = 1 + Math.min(0.3, (g?.luckBonus || 0) * 0.04) + (g?.dngAtk || 0);
        const amm = am.abil === 'rift' ? am.riftAtk : 1;
        const pm = 1 + Math.min(0.15, (pet.luck || 0) * 0.04 + (pet.speed || 0) * 0.1);
        const hpm = (am.abil === 'rift' ? am.riftHp : 1) * (1 + (g?.dngHp || 0));
        return { atk: gm * amm * pm, hp: hpm, gm, amm, pm };
    }
    function member(id) {
        const a = api.aura(id), r = raidInfo(a), m = mults();
        return { id, a, el: r.el, E: r.E, eff: r.eff, atk: Math.round(r.atk * m.atk), max: Math.round(r.hp * m.hp), hp: 0, en: 0, dead: false };
    }
    // 팀 전투력 (공격 × 약점 배율의 합) — 대기실·화면 표시용
    const power = () => Math.round(team().filter(Boolean).reduce((s, id) => { const x = member(id); return s + x.atk * x.eff; }, 0));
    const meEntry = () => { const me = api.me(); return { uid: me.uid, nick: me.nick, pw: power(), ok: canPlay(), last: Date.now() }; };

    /* =========================================================
       레이드 창
       ========================================================= */
    function render() {
        const el = $('dng-panel');
        if (!el) return;
        el.innerHTML = (party || view === 'party' ? partyView() : mainView()) + pickerHtml();
    }
    function bossCard(selectable) {
        const D = DIFFS[selDiff], W = ELEMENTS[CUR.weak], R2 = ELEMENTS[CUR.resist], st0 = st();
        const pick = selectable ? `<div class="rd-bosses">${BOSSES.map(b => {
            const done = DIFFS.filter((_, i) => st0.clears[ck(i, b)]).length;
            return `<button class="rd-bcard ${b === CUR ? 'on' : ''}" data-dgboss="${b.id}" style="--bc:${b.color};--bc2:${b.color2}">${bossArt(b.id)}<b>${b.name}</b><small>${'★'.repeat(done)}${'☆'.repeat(4 - done)}</small></button>`;
        }).join('')}</div>` : '';
        return `${pick}
            <div class="rd-boss" style="--bc:${CUR.color};--bc2:${CUR.color2};--dc:${D.color}">
                <div class="rd-boss-art">${bossArt(CUR.id, 'big')}<i class="rd-art-ring"></i><i class="rd-art-ring r2"></i></div>
                <div class="rd-boss-txt">
                    <small>${CUR.sub} · <span>${stars(D.star)}</span></small>
                    <b>${CUR.name}</b>
                    <em>${CUR.desc}</em>
                    <div class="rd-tags"><span class="rd-tag weak">${embSvg(CUR.weak)} 약점 ${W.name} ×1.6</span><span class="rd-tag resist">${embSvg(CUR.resist)} 저항 ${R2.name}</span></div>
                </div>
            </div>`;
    }
    function starsRow(disabled) {
        const s = st();
        return `<div class="rd-stars">${DIFFS.map((d, i) => `<button class="rd-star ${i === selDiff ? 'on' : ''} ${unlocked(i) ? '' : 'lock'}" style="--dc:${d.color}" data-dgdiff="${i}" ${disabled ? 'disabled' : ''}><b>${unlocked(i) ? stars(d.star) : '🔒'}</b><small>${d.label}${s.clears[ck(i)] ? ' ✓' : ''}</small></button>`).join('')}</div>`;
    }
    // 보상 안내: 클리어 보상 / 상자 내용물 / 전용 드롭을 칸을 나눠 한눈에
    const TCOL = { COMMON: '#9aa0ad', RARE: '#4da3ff', EPIC: '#b44dff', LEGEND: '#ff7a1a', MYTHIC: '#00e5ff', ANCIENT: '#ffe14d', ABSOLUTE: '#ff2a4a' };
    const pctTxt = v => v >= 0.1 ? `${Math.round(v * 1000) / 10}%` : `${Math.round(v * 10000) / 100}%`;
    function rewardsHtml() {
        const D = DIFFS[selDiff], C = CHESTS[CUR.id], tot = C.pool.reduce((a, e) => a + e.w, 0);
        const drops = CUR.drops.filter(x => x.p[selDiff]);
        const maxP = Math.max(...C.pool.map(e => e.w / tot));
        return `<div class="rw2">
            <div class="rw2-sec">
                <div class="rw2-h">🏆 클리어 보상 <small>${D.label} ${stars(D.star)}</small></div>
                <div class="rw2-tiles">
                    <div class="rw2-tile"><i class="coin"></i><b>${fmt(D.jc)}</b><small>JC</small></div>
                    <div class="rw2-tile"><span class="rw2-ico">🎫</span><b>${fmt(D.xp)}</b><small>패스 XP</small></div>
                    <div class="rw2-tile chest" style="--cc:${CUR.color}">${chestHtml(CUR.id)}<b>×${D.chests}</b><small>${C.name}</small></div>
                </div>
            </div>
            <div class="rw2-sec">
                <div class="rw2-h">🎁 ${C.name} 안에 든 것 <small>${C.theme} · 하나 열면 한 개</small></div>
                <div class="rw2-list">${C.pool.map(e => { const v = e.w / tot; return `<div class="rw2-row" style="--tc:${TCOL[e.tier]}"><i class="rw2-dot"></i><span>${entryName(e)}</span><div class="rw2-bar"><i style="width:${v / maxP * 100}%"></i></div><b>${pctTxt(v)}</b></div>`; }).join('')}</div>
            </div>
            <div class="rw2-sec">
                <div class="rw2-h">✦ ${CUR.name} 전용 드롭 <small>상자와 따로 · 클리어할 때마다</small></div>
                ${drops.length ? `<div class="rw2-list">${drops.map(x => { const nm = x.kind === 'aura' ? api.aura(x.id).name : api.gearName(x.id), col = x.kind === 'aura' ? api.aura(x.id).color : CUR.color; return `<div class="rw2-row rare" style="--tc:${col}"><i class="rw2-dot"></i><span>${x.kind === 'aura' ? '✦ 칭호' : '⚒ 장비'} · ${esc(nm)}</span><b>${pctTxt(x.p[selDiff])}</b></div>`; }).join('')}</div>` : '<div class="rw2-none">★1은 전용 드롭이 없어요 · ★3부터 나와요</div>'}
            </div>
        </div>`;
    }
    function entryName(e) {
        if (e.kind === 'tickets') return `뽑기권 ×${e.n}`;
        if (e.kind === 'dtk') return `던전 티켓 ×${e.n}`;
        if (e.kind === 'xp') return `패스 ${fmt(e.n)} XP`;
        if (e.kind === 'jc') return `${e.label} ${fmt(e.min / 10000)}~${fmt(e.max / 10000)}만`;
        return api.gachaName(e);
    }
    // 가진 상자 (눌러서 열기)
    function chestRow() {
        const s = st();
        return `<div class="rd-head"><span>레이드 상자</span><small>보스를 잡으면 그 보스의 상자를 줘요</small></div>
            <div class="rd-chests">${BOSSES.map(b => { const n = s.chests[b.id] || 0; return `<button class="rd-chest ${n ? 'has' : ''}" data-dgchest="${b.id}" ${n ? '' : 'disabled'} style="--cc:${b.color}">${chestHtml(b.id)}<b>${CHESTS[b.id].name}</b><small>${n ? `${n}개 · 열기` : '없음'}</small>${n > 1 ? `<em data-dgchestall="${b.id}">모두</em>` : ''}</button>`; }).join('')}</div>`;
    }
    function openChest(id, all) {
        const s = st(), have = s.chests[id] || 0;
        if (!have) return;
        const n = all ? Math.min(have, 10) : 1;
        s.chests[id] = have - n;
        const results = Array.from({ length: n }, () => {
            const e = chestPick(CHESTS[id].pool);
            if (e.kind === 'tickets') { api.gs().tickets = (api.gs().tickets || 0) + e.n; return { tier: e.tier, name: `뽑기권 ×${e.n}`, icon: '<i class="ticket-ico big"></i>', sub: '상점 행운 뽑기에서 써요' }; }
            if (e.kind === 'dtk') { s.tk += e.n; return { tier: e.tier, name: `던전 티켓 ×${e.n}`, icon: '<i class="dtk-ico"></i>', sub: '레이드 입장권' }; }
            if (e.kind === 'xp') { api.passAddXp(e.n); return { tier: e.tier, name: `패스 ${fmt(e.n)} XP`, icon: '<b class="gr-xp">XP</b>', sub: '시즌 패스 경험치' }; }
            return api.gachaGrant(e);
        });
        api.save(); api.renderStats();
        render();
        playChestOpen(id, results);
    }
    // 🎁 상자 열기 연출: 상자가 떨어져 흔들리다 뚜껑이 열리며 빛이 터지고, 보상 카드가 튀어나옴
    const TIER_ORD = ['COMMON', 'RARE', 'EPIC', 'LEGEND', 'MYTHIC', 'ANCIENT', 'ABSOLUTE'];
    function playChestOpen(id, results) {
        const b = BOSS_BY_ID[id], best = results.reduce((m, r) => TIER_ORD.indexOf(r.tier) > TIER_ORD.indexOf(m) ? r.tier : m, 'COMMON');
        const bi = TIER_ORD.indexOf(best), bc = TCOL[best];
        let el = $('chest-open');
        if (!el) { el = document.createElement('div'); el.id = 'chest-open'; document.body.appendChild(el); }
        el.className = 'chest-open';
        el.style.setProperty('--cc', b.color); el.style.setProperty('--cc2', b.color2); el.style.setProperty('--bc', bc);
        el.innerHTML = `
            <div class="co-bg"></div>
            <div class="co-title">${CHESTS[id].name}${results.length > 1 ? ` ×${results.length}` : ''}</div>
            <div class="co-stage">
                <div class="co-rays"></div>
                <div class="co-chest">
                    <div class="co-lid"><i class="co-lid-band"></i><i class="co-lid-band r"></i></div>
                    <div class="co-glow"></div>
                    <div class="co-body"><i class="co-band"></i><i class="co-band r"></i><i class="co-lock"></i></div>
                </div>
                <div class="co-sparks">${Array.from({ length: 18 }, (_, i) => `<i style="--a:${i * 20}deg;--d:${0.4 + (i % 5) * 0.12}s"></i>`).join('')}</div>
            </div>
            <div class="co-hint">눌러서 열기</div>
            <div class="co-cards ${results.length === 1 ? 'single' : ''}">${results.map((r, i) => `
                <div class="co-card" style="--i:${i};--tc:${TCOL[r.tier] || '#9aa0ad'}">
                    <div class="co-card-ico ${r.gear ? 'gear' : ''}">${r.icon}</div>
                    <div class="co-card-tier">${r.tier}</div>
                    <div class="co-card-name">${r.name}</div>
                    ${r.sub ? `<div class="co-card-sub">${r.sub}</div>` : ''}
                </div>`).join('')}</div>
            <div class="co-btns"><button class="btn btn-block btn-gold" data-co="ok">확인</button>${(st().chests[id] || 0) > 0 ? `<button class="btn btn-block" data-co="again">하나 더 열기 <small>(${st().chests[id]}개 남음)</small></button>` : ''}</div>`;
        const shakeMs = bi >= 4 ? 2100 : bi >= 3 ? 1600 : 1100;
        let opened = false;
        const open = () => {
            if (opened) return;
            opened = true;
            el.classList.add('open');
            api.dropSound(bi >= 5 ? 'MYTHIC' : bi >= 3 ? 'LEGEND' : null);
            setTimeout(() => { el.classList.add('cards'); api.attachPreviews(el.querySelector('.co-cards')); }, 650);
        };
        requestAnimationFrame(() => el.classList.add('in'));
        const timer = setTimeout(open, 700 + shakeMs);
        setTimeout(() => el.classList.add('shake'), 700);
        el.onclick = e => {
            const btn = e.target.closest('[data-co]');
            if (!opened) { clearTimeout(timer); open(); return; }
            if (!btn) return;
            el.className = 'chest-open hidden'; el.innerHTML = '';
            if (btn.dataset.co === 'again') openChest(id, false);
        };
    }
    function teamHtml(disabled) {
        return `<div class="rd-team">${team().map((id, i) => {
            if (!id) return `<button class="rd-mem empty" data-dgslot="${i}" ${disabled ? 'disabled' : ''}><i>+</i></button>`;
            const x = member(id);
            return `<button class="rd-mem" data-dgslot="${i}" style="--ec:${x.E.color}" ${disabled ? 'disabled' : ''}>
                <span class="rd-mem-el">${embSvg(x.el)}</span>${x.eff > 1 ? '<span class="rd-mem-up">약점</span>' : x.eff < 1 ? '<span class="rd-mem-down">저항</span>' : ''}
                <b>${esc(x.a.name)}</b><small>${fmt(x.atk)}</small>
            </button>`;
        }).join('')}</div>`;
    }
    function mainView() {
        const s = st(), D = DIFFS[selDiff], m = mults(), lock = !unlocked(selDiff), why = lock ? `${DIFFS[selDiff - 1]?.label}을 먼저 깨야 해요` : whyNot();
        return `
            ${bossCard(true)}
            ${starsRow(false)}
            <button class="rd-line" data-dg="rw"><span>체력 <b>${fmt(Math.round(D.hp * CUR.hp))}</b></span><span>제한 <b>3분</b></span><span class="rd-line-rw">보상 ${showRw ? '▴' : '▾'}</span></button>
            ${showRw ? rewardsHtml() : ''}
            <div class="rd-head"><span>레이드 팀</span><small>전투력 ${fmt(power())}</small><button class="rd-auto" data-dg="auto">자동 편성</button></div>
            ${teamHtml(false)}
            ${chestRow()}
            <div class="rd-mult">장비 ×${m.gm.toFixed(2)} · 부적 ×${m.amm.toFixed(2)} · 펫 ×${m.pm.toFixed(2)}</div>
            <div class="rd-foot">
                <div class="rd-count">
                    <span>오늘 <b>${s.runs}</b>/${RUN_CAP}판</span>
                    <span>🎟 티켓 <b>${s.tk}</b> <button class="rd-buy" data-dg="shop">상점에서 사기</button></span>
                </div>
                <div class="rd-go">
                    <button class="btn btn-primary" data-dg="solo" ${lock || !canPlay() ? 'disabled' : ''}>⚔ 혼자 도전</button>
                    <button class="btn" data-dg="party">👥 파티</button>
                </div>
                ${why ? `<div class="rd-why">${why}</div>` : ''}
            </div>`;
    }
    function partyView() {
        const head = `<div class="rd-subhead">${party ? '' : '<button class="rd-back" data-dg="back">‹</button>'}<b>파티 레이드</b><small>최대 ${MAX_PARTY}명 · 각자 티켓 1장</small></div>`;
        if (party) return head + bossCard(party.role === 'host') + starsRow(party.role !== 'host') + lobbyHtml();
        const rooms = lobby ? [...lobby.rooms.values()].filter(r => Date.now() - r.at < 7000) : [];
        return `${head}
            <button class="btn btn-block btn-primary rd-make" data-dg="host" ${canPlay() && unlocked(selDiff) ? '' : 'disabled'}>방 만들기 <small>${DIFFS[selDiff].label} ${stars(DIFFS[selDiff].star)}</small></button>
            ${canPlay() ? '' : `<div class="rd-why">${whyNot()}</div>`}
            <div class="rd-join"><input id="dg-code" inputmode="numeric" maxlength="4" placeholder="방 번호"><button class="btn" data-dg="join">참가</button></div>
            <div class="rd-head"><span>열린 방</span><small>${lobby ? '' : '연결 중…'}</small></div>
            <div class="rd-rooms">${rooms.length ? rooms.map(r => `<button class="rd-room" data-dgroom="${r.code}" style="--dc:${DIFFS[r.diff]?.color}"><b>${esc(r.host)} · ${BOSS_BY_ID[r.boss]?.name || ''}</b><span>${stars(DIFFS[r.diff]?.star || 1)}</span><small>${r.n}/${MAX_PARTY}명 · #${r.code}</small></button>`).join('') : '<div class="rd-empty">열린 방이 없어요</div>'}</div>`;
    }
    function lobbyHtml() {
        const p = party, me = api.me().uid, host = p.role === 'host';
        const all = p.roster.every(r => r.ok);
        return `
            <div class="rd-lobby">
                <div class="rd-code"><small>방 번호</small><b>${p.code}</b><span>${host ? '친구에게 알려 주세요' : p.roster.length ? '방장이 시작하길 기다리는 중…' : '방을 찾는 중…'}</span></div>
                <div class="rd-mems">${Array.from({ length: MAX_PARTY }, (_, i) => {
                    const r = p.roster[i];
                    return r ? `<div class="rd-pm ${r.uid === me ? 'me' : ''} ${r.ok ? '' : 'bad'}"><b>${i === 0 ? '👑 ' : ''}${esc(r.nick)}</b><small>${r.ok ? `전투력 ${fmt(r.pw)}` : '입장 불가'}</small></div>` : '<div class="rd-pm empty">빈 자리</div>';
                }).join('')}</div>
                ${host ? `<button class="btn btn-block btn-primary" data-dg="start" ${all && unlocked(selDiff) ? '' : 'disabled'}>⚔ 시작 <small>${p.roster.length}명</small></button>` : ''}
                <button class="btn btn-block" data-dg="leave">${host ? '방 닫기' : '나가기'}</button>
            </div>`;
    }
    function pickerHtml() {
        if (picking < 0) return '';
        const cur = st().team;
        const list = Object.keys(RAID_AURAS).map(id => api.aura(id)).filter(Boolean)
            .map(a => ({ a, have: owned(a.id), inTeam: cur.includes(a.id), x: raidInfo(a) }))
            .sort((p, q) => (q.have - p.have) || (q.x.atk * q.x.eff - p.x.atk * p.x.eff));
        return `
            <div class="dg-picker">
                <div class="dg-pk-box">
                    <div class="dg-pk-head"><b>${picking + 1}번 칸</b><small>레이드에 나갈 수 있는 칭호는 ${list.length}개예요</small><button class="sheet-close" data-dg="pkclose">✕</button></div>
                    <div class="dg-pk-list">
                        ${cur[picking] ? '<button class="rd-pk clear" data-dgpick="">칸 비우기</button>' : ''}
                        ${list.map(({ a, have, inTeam, x }) => {
                            const m = have ? member(a.id) : null;
                            return `<button class="rd-pk ${have ? '' : 'no'} ${inTeam ? 'in' : ''}" ${have && !inTeam ? `data-dgpick="${a.id}"` : 'disabled'} style="--ec:${x.E.color}">
                                <span class="rd-pk-el">${embSvg(x.el)}<small>${x.E.name}</small></span>
                                <span class="rd-pk-main"><b class="${api.gradeCol(a.grade)}">${esc(a.name)}</b><small>${x.E.fast.name} · ${x.E.charged.name}</small></span>
                                <span class="rd-pk-side">${have ? `<b>${fmt(m.atk)}</b><small>체력 ${fmt(m.max)}</small>` : '<small>미보유</small>'}${inTeam ? '<em>팀에 있음</em>' : x.eff > 1 ? '<em class="up">약점 ×1.6</em>' : x.eff < 1 ? '<em class="down">저항</em>' : ''}</span>
                            </button>`;
                        }).join('')}
                    </div>
                </div>
            </div>`;
    }
    function autoTeam() {
        const s = st();
        const ids = Object.keys(RAID_AURAS).filter(owned).map(member).sort((p, q) => q.atk * q.eff - p.atk * p.eff).slice(0, TEAM).map(x => x.id);
        if (!ids.length) { api.toast('레이드에 나갈 수 있는 칭호가 없어요', 'bad'); return; }
        s.team = [...ids, ...Array(TEAM - ids.length).fill(null)];
        api.save(); render();
    }

    /* ---------- 창 클릭 ---------- */
    function onClick(e) {
        const all = e.target.closest('[data-dgchestall]');
        if (all) { openChest(all.dataset.dgchestall, true); return; }
        const t = e.target.closest('[data-dg],[data-dgslot],[data-dgdiff],[data-dgpick],[data-dgroom],[data-dgboss],[data-dgchest]');
        if (!t) { if (e.target.classList.contains('dg-picker')) { picking = -1; render(); } return; }
        const d = t.dataset, s = st();
        if (d.dgslot !== undefined) { picking = +d.dgslot; render(); return; }
        if (d.dgpick !== undefined) { s.team[picking] = d.dgpick || null; picking = -1; api.save(); render(); return; }
        if (d.dgchest) { openChest(d.dgchest, false); return; }
        if (d.dgboss) { pickBoss(d.dgboss); while (selDiff > 0 && !unlocked(selDiff)) selDiff--; render(); return; }
        if (d.dgdiff !== undefined) { const i = +d.dgdiff; if (!unlocked(i)) { api.toast(`${DIFFS[i - 1].label}을 먼저 깨야 해요`, 'bad'); return; } selDiff = i; render(); return; }
        if (d.dgroom) { joinParty(d.dgroom); return; }
        switch (d.dg) {
            case 'pkclose': picking = -1; render(); break;
            case 'rw': showRw = !showRw; render(); break;
            case 'auto': autoTeam(); break;
            case 'shop': api.closeSheet('sheet-dungeon'); setTimeout(() => api.openShop(), 200); break;
            case 'solo':
                if (!canPlay() || !unlocked(selDiff)) return;
                startBattle({ diff: selDiff, roster: [meEntry()], host: true, net: makeNet(null, api) });
                break;
            case 'party': view = 'party'; render(); break;
            case 'back': view = 'main'; render(); break;
            case 'host': createParty(); break;
            case 'join': { const c = ($('dg-code')?.value || '').trim(); if (!/^\d{4}$/.test(c)) { api.toast('방 번호 4자리를 넣어 주세요', 'bad'); return; } joinParty(c); break; }
            case 'leave': leaveParty(); break;
            case 'start': hostStart(); break;
        }
    }

    /* ---------- 열린 방 목록 ---------- */
    function openLobby() {
        if (lobby) return;
        lobby = { net: makeNet('dng-lobby', api), rooms: new Map() };
        lobby.net.on('room', r => { if (!r?.code) return; if (r.closed) lobby.rooms.delete(r.code); else lobby.rooms.set(r.code, { ...r, at: Date.now() }); softRender(); });
        lobby.net.on('_ready', softRender);
        lobby.timer = setInterval(softRender, 3000);
    }
    function closeLobby() { if (!lobby) return; clearInterval(lobby.timer); lobby.net.close(); lobby = null; }
    // 파티 화면에서만, 입력 중인 방 번호는 지키면서 다시 그림
    function softRender() {
        if (B || party || view !== 'party' || picking >= 0 || !document.querySelector('#dng-panel .rd-rooms')) return;
        const code = $('dg-code')?.value, focus = document.activeElement?.id === 'dg-code';
        render();
        if (code && $('dg-code')) { $('dg-code').value = code; if (focus) $('dg-code').focus(); }
    }

    /* ---------- 파티 ---------- */
    function createParty() {
        if (party || B || !canPlay()) return;
        const code = String(1000 + Math.floor(Math.random() * 9000));
        party = { role: 'host', code, net: makeNet('dng-' + code, api), roster: [meEntry()] };
        const p = party;
        p.net.on('hello', m => {
            if (!m?.uid || m.uid === p.roster[0].uid) return;
            const i = p.roster.findIndex(r => r.uid === m.uid);
            if (i >= 0) p.roster[i] = { ...m, last: Date.now() };
            else if (p.roster.length >= MAX_PARTY) { p.net.send('full', { uid: m.uid }); return; }
            else { p.roster.push({ ...m, last: Date.now() }); api.toast(`👥 ${m.nick} 님이 들어왔어요`); }
            render();
        });
        p.net.on('leave', m => { const i = p.roster.findIndex(r => r.uid === m?.uid); if (i > 0) { p.roster.splice(i, 1); render(); } });
        const beat = () => {
            const now = Date.now(), before = p.roster.length;
            p.roster[0] = meEntry();
            p.roster = p.roster.filter((r, i) => i === 0 || now - r.last < 7000);
            p.net.send('roster', { code: p.code, diff: selDiff, boss: CUR.id, ps: p.roster });
            lobby?.net.send('room', { code: p.code, host: p.roster[0].nick, n: p.roster.length, diff: selDiff, boss: CUR.id });
            if (p.roster.length !== before) render();
        };
        p.timer = setInterval(beat, 1500);
        beat(); render();
    }
    function joinParty(code) {
        if (party || B) return;
        if (!canPlay()) { api.toast(whyNot(), 'bad'); return; }
        party = { role: 'member', code, net: makeNet('dng-' + code, api), roster: [], since: Date.now() };
        const p = party, me = api.me().uid;
        p.net.on('roster', m => {
            if (m.code !== code || party !== p) return;
            p.roster = m.ps || []; p.got = Date.now();
            if (DIFFS[m.diff]) selDiff = m.diff;
            if (BOSS_BY_ID[m.boss]) pickBoss(m.boss);
            render();
        });
        p.net.on('full', m => { if (m.uid === me) { api.toast('파티가 가득 찼어요', 'bad'); leaveParty(true); } });
        p.net.on('closed', () => { if (party === p) { api.toast('방장이 방을 닫았어요', 'bad'); leaveParty(true); } });
        p.net.on('start', m => {
            if (party !== p || !(m.ps || []).some(r => r.uid === me)) return;
            clearInterval(p.timer);
            const net = p.net; party = null;
            if (BOSS_BY_ID[m.boss]) pickBoss(m.boss);
            startBattle({ diff: m.diff, roster: m.ps, host: false, net });
        });
        const beat = () => {
            p.net.send('hello', meEntry());
            if (!p.got && Date.now() - p.since > 9000) { api.toast(`#${code} 방을 찾을 수 없어요`, 'bad'); leaveParty(true); }
            else if (p.got && Date.now() - p.got > 8000) { api.toast('방장과 연결이 끊겼어요', 'bad'); leaveParty(true); }
        };
        p.timer = setInterval(beat, 1500);
        beat(); render();
    }
    function leaveParty(quiet) {
        const p = party;
        if (!p) return;
        clearInterval(p.timer);
        if (p.role === 'host') { p.net.send('closed', {}); lobby?.net.send('room', { code: p.code, closed: true }); }
        else if (!quiet) p.net.send('leave', { uid: api.me().uid });
        setTimeout(() => p.net.close(), 300);
        party = null;
        render();
    }
    function hostStart() {
        const p = party;
        if (!p || p.role !== 'host') return;
        p.roster[0] = meEntry();
        if (!p.roster.every(r => r.ok)) { api.toast('입장할 수 없는 사람이 있어요', 'bad'); return; }
        clearInterval(p.timer);
        lobby?.net.send('room', { code: p.code, closed: true });
        const roster = p.roster.map(({ last, ...r }) => r);
        p.net.send('start', { diff: selDiff, boss: CUR.id, ps: roster });
        const net = p.net; party = null;
        startBattle({ diff: selDiff, roster, host: true, net });
    }

    /* =========================================================
       레이드 전투
       ========================================================= */
    function startBattle({ diff, roster, host, net }) {
        const s = st();
        if (!canPlay()) { api.toast(whyNot(), 'bad'); net.close(); return; }
        s.tk--; s.runs++; api.save();
        view = 'main';
        api.closeSheet('sheet-dungeon');
        closeLobby();
        const me = api.me(), D = DIFFS[diff], now = Date.now();
        const bossMax = Math.round(D.hp * CUR.hp * (1 + 0.5 * (roster.length - 1)));
        const mem = team().filter(Boolean).map(member);
        mem.forEach(x => { x.hp = x.max; });
        B = {
            diff, D, bd: CUR, net, host, roster, scene: null, over: false, t0: now, last: now, lastSt: now, end: now + TIME * 1000,
            me: { uid: me.uid, nick: me.nick, dmg: 0, pend: 0 },
            team: mem, cur: 0, busyUntil: now + 1500, holding: false, dodgeUntil: 0, rejoinUntil: 0, swapOpen: false,
            nextHit: now + 3500, nextCharge: now + 9000, tele: null,
            boss: { hp: bossMax, max: bossMax },
            party: new Map(roster.map(r => [r.uid, { nick: r.nick, dmg: 0 }])),
            repT: 0.6
        };
        if (host) B.sim = { hp: bossMax, max: bossMax, end: now + TIME * 1000, over: false, stT: 0, ps: Object.fromEntries(roster.map(r => [r.uid, { nick: r.nick, dmg: 0, last: now }])) };
        wireNet();
        api.setBusy(true);
        buildBattleUI();
        import('./boss3d.js?v=66').then(({ createBossScene }) => {
            if (!B || B.net !== net) return;
            B.scene = createBossScene(B.bd.id);
            api.setTakeover(B.scene);
            showCur();
        }).catch(e => console.warn(e));
        B.timer = setInterval(tick, 50);
        showIntro();
    }

    function wireNet() {
        const net = B.net;
        net.on('st', m => {
            if (!B) return;
            B.lastSt = Date.now();
            B.boss.hp = Math.max(0, m.hp - B.me.pend); B.boss.max = m.max;
            if (!B.host) B.end = Date.now() + m.left * 1000;
            for (const uid in m.ps) { const p = B.party.get(uid); if (p) p.dmg = m.ps[uid]; }
        });
        net.on('ev', m => { if (B && !B.over && m.k === 'end') finish(m); });
        if (B.host) net.on('act', a => {
            const S = B?.sim;
            if (!S || S.over || !a?.uid || !S.ps[a.uid]) return;
            const d = Math.max(0, Math.min(a.dmg || 0, 1e9));
            S.ps[a.uid].dmg += d; S.ps[a.uid].last = Date.now(); S.hp -= d;
            if (S.hp <= 0) simEnd(true);
        });
    }
    // 방장: 보스 체력·시간만 관리 (보스 공격은 각자 화면에서)
    function simTick(now) {
        const S = B.sim;
        if (S.over) return;
        if (S.hp <= 0) return simEnd(true);
        if (now >= S.end) return simEnd(false);
        if (now - S.stT >= 400) {
            S.stT = now;
            const ps = {};
            for (const uid in S.ps) ps[uid] = Math.round(S.ps[uid].dmg);
            B.net.emit('st', { hp: Math.max(0, Math.round(S.hp)), max: S.max, left: Math.max(0, Math.ceil((S.end - now) / 1000)), ps });
        }
    }
    function simEnd(win) {
        const S = B.sim;
        if (S.over) return;
        S.over = true;
        const dmg = {};
        for (const uid in S.ps) dmg[uid] = [S.ps[uid].nick, Math.round(S.ps[uid].dmg)];
        B.net.emit('ev', { k: 'end', win, dmg, frac: Math.min(1, (S.max - Math.max(0, S.hp)) / S.max) });
    }

    const curM = () => B.team[B.cur];
    const colorNum = x => parseInt(x.E.color.slice(1), 16);
    // 무대 캐릭터에 지금 칭호를 입힘
    function showCur() { const x = B && curM(); if (x && B.scene) api.raidAura(x.id); }
    function tick() {
        if (!B || B.over) return;
        const now = Date.now();
        if (B.sim) simTick(now);
        if (!B || B.over) return;
        // 재정비 끝 → 팀 전원 다시 일어남
        if (B.rejoinUntil && now >= B.rejoinUntil) {
            B.rejoinUntil = 0;
            B.team.forEach(x => { x.hp = x.max; x.dead = false; x.en = 0; });
            B.cur = 0; B.busyUntil = now + 800; B.nextHit = now + 2500; B.nextCharge = now + 8000;
            showCur();
            floatText('다시 도전!', 'big', 50, 40);
        }
        if (!B.rejoinUntil) {
            if (B.holding && !B.swapOpen) fastAttack();
            bossAi(now);
        }
        B.repT -= 0.05;
        if (B.repT <= 0) {
            B.repT = 0.6;
            B.net.emit('act', { uid: B.me.uid, dmg: Math.round(B.me.pend) });
            B.me.pend = 0;
        }
        if (!B.host && now - B.lastSt > 8000) { finish({ win: false, lost: true }); return; }
        if (!B.host && now > B.end + 5000) { finish({ win: false }); return; }
        drawUI(now);
    }
    // 보스 공격 (내 화면에서만 돌아감 — 포켓몬GO처럼 각자 따로 맞음)
    function bossAi(now) {
        const D = B.D;
        if (B.tele) {
            if (now >= B.tele.at) {
                const t = B.tele; B.tele = null;
                B.scene?.slam(); flash(false);
                setTimeout(() => { if (B && !B.over && !B.rejoinUntil) hurt(t.d, Date.now() <= B.dodgeUntil + 150, true); }, 300);
                B.nextHit = now + 1800;
            }
            return;
        }
        if (now >= B.nextCharge) {
            B.tele = { at: now + 1600, d: D.slam * B.bd.dmg };
            B.scene?.charge(1.6); flash(true);
            B.nextCharge = now + 9000 + Math.random() * 3000;
            return;
        }
        if (now >= B.nextHit) {
            B.scene?.attack();
            B.nextHit = now + 2000 + Math.random() * 700;
            const at = now + 450;
            setTimeout(() => { if (B && !B.over && !B.rejoinUntil) hurt(D.hit * B.bd.dmg, Date.now() <= B.dodgeUntil + 100 && B.dodgeUntil >= at - 500, false); }, 450);
        }
    }
    function hurt(d, dodged, big) {
        const x = curM();
        if (!x || x.dead) return;
        const v = Math.round(d * (dodged ? 0.25 : 1));
        x.hp -= v;
        x.en = Math.min(100, x.en + v / x.max * 40);   // 맞으면 에너지가 조금 참
        B.hurtAt = Date.now();
        if (!dodged) B.scene?.recoil();
        floatText(dodged ? `회피! -${fmt(v)}` : `-${fmt(v)}`, dodged ? 'dodge' : 'hurt', 26, 58);
        try { navigator.vibrate?.(big && !dodged ? 160 : 30); } catch (e) {}
        if (big && !dodged) B.scene?.shake(0.6);
        if (x.hp <= 0) { x.hp = 0; x.dead = true; floatText(`${x.a.name} 쓰러짐!`, 'hurt', 30, 50); setTimeout(nextAlive, 700); }
    }
    // 정해 둔 순서대로 다음 칭호
    function nextAlive() {
        if (!B || B.over) return;
        const n = B.team.length;
        let i = -1;
        for (let k = 1; k <= n; k++) { const j = (B.cur + k) % n; if (!B.team[j].dead) { i = j; break; } }
        if (i < 0) {
            B.rejoinUntil = Date.now() + REJOIN_MS; B.tele = null; flash(false); B.holding = false; closeSwap();
            return;
        }
        B.cur = i; B.busyUntil = Date.now() + 800;
        showCur();
        floatText(`가라, ${B.team[i].a.name}!`, 'swap', 30, 50);
    }
    function fastAttack() {
        const x = curM(), now = Date.now();
        if (!x || x.dead || B.over || B.rejoinUntil || now < B.busyUntil) return;
        const F = x.E.fast;
        B.busyUntil = now + F.t * 1000;
        x.en = Math.min(100, x.en + F.en);
        api.raidPunch('fast');
        B.scene?.lunge(colorNum(x), false);
        const v = F.pw * x.atk / 100 * x.eff;
        setTimeout(() => B && !B.over && deal(v, false, x), 140);
    }
    function chargedAttack() {
        const x = curM(), now = Date.now();
        if (!x || x.dead || B.over || B.rejoinUntil || now < B.busyUntil) return;
        const C = x.E.charged;
        if (x.en < C.cost) return;
        x.en -= C.cost;
        B.busyUntil = now + 1300;
        api.raidPunch('charged');
        floatText(C.name, 'move', 50, 46);
        setTimeout(() => {
            if (!B || B.over) return;
            B.scene?.lunge(colorNum(x), true);
            B.scene?.skillFx(x.E.fx, colorNum(x));
        }, 380);
        setTimeout(() => {
            if (!B || B.over) return;
            deal(C.pw * x.atk / 100 * x.eff, true, x);
            if (x.eff > 1) floatText('효과가 굉장했다!', 'eff up', 50, 40);
            else if (x.eff < 1) floatText('효과가 별로인 듯하다…', 'eff down', 50, 40);
        }, 560);
    }
    function dodge(dir) {
        const now = Date.now();
        if (!B || B.over || B.rejoinUntil || curM()?.dead || now < B.dodgeUntil + 300) return;
        B.dodgeUntil = now + 600;
        B.busyUntil = Math.max(B.busyUntil, now + 450);
        B.scene?.dodge(dir);
    }
    function swapTo(i) {
        const now = Date.now(), x = B?.team[i];
        closeSwap();
        if (!x || x.dead || B.cur === i || B.rejoinUntil) return;
        B.cur = i; B.busyUntil = Math.max(B.busyUntil, now + 800);
        showCur();
        floatText(`가라, ${x.a.name}!`, 'swap', 30, 50);
    }
    function deal(n, big, x) {
        const v = Math.round(n);
        B.me.pend += v; B.me.dmg += v;
        B.boss.hp = Math.max(0, B.boss.hp - v);
        floatText(fmt(v), big ? 'crit' : x.eff > 1 ? 'dmg up' : 'dmg', 50 + (Math.random() - 0.3) * 26, 26 + Math.random() * 14);
        B.scene?.hit(big ? 1 : 0.35, big ? 0xffd23a : colorNum(x));
        const hb = $('db-bosshp');
        hb?.classList.remove('hit'); void hb?.offsetWidth; hb?.classList.add('hit');
    }

    /* ---------- 전투 화면 (포켓몬GO 레이드처럼) ---------- */
    function buildBattleUI() {
        const el = $('dng-battle');
        document.body.classList.add('in-dng');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div id="db-stage" class="db-stage"></div>
            <div id="db-flash" class="db-flash"></div>
            <div id="db-hurt" class="db-hurt"></div>
            <div class="db-top">
                <div class="db-mine" id="db-mine"></div>
                <div class="db-timer" id="db-timer">180</div>
                <div class="db-bossbox" id="db-bosshp">
                    <div class="db-bname"><b>${B.bd.name}</b><small style="color:${B.D.color}">${stars(B.D.star)}</small></div>
                    <div class="db-hpbar"><div id="db-hplag"></div><div id="db-hpfill"></div></div>
                    <small id="db-hptext"></small>
                </div>
            </div>
            <div id="db-party" class="db-party"></div>
            <div id="db-float" class="db-float"></div>
            <div class="db-hint" id="db-hint">화면 탭 · 꾹 눌러 공격 &nbsp;|&nbsp; 양옆 화살표로 회피</div>
            <button id="db-quit" class="db-quit" aria-label="나가기"><svg viewBox="0 0 24 24"><path d="M14 4a2 2 0 110 .01M10 9l3-1 3 3 3 1M13 8l-2 6 3 3v4M11 14l-3 2-3-1"/></svg></button>
            <button id="db-charged" class="db-charged"><svg class="db-ch-ring" viewBox="0 0 100 100"><g id="db-arcs"></g></svg><span class="db-ch-core" id="db-ch-core"></span></button>
            <div class="db-ch-name" id="db-ch-name"></div>
            <div id="db-intro" class="db-intro"></div>
            <button id="db-dodge-l" class="db-dodge l" aria-label="왼쪽으로 회피"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg><small>회피</small></button>
            <button id="db-dodge-r" class="db-dodge r" aria-label="오른쪽으로 회피"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg><small>회피</small></button>
            <button id="db-swap" class="db-swapbtn" aria-label="교체"><svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg><small>교체</small></button>
            <div id="db-swappanel" class="db-swappanel hidden"></div>
            <div id="db-rejoin" class="db-rejoin hidden"><b>팀 전멸</b><small>재정비 중… <span id="db-rj-t">8</span>초 뒤 다시 들어가요</small></div>
            <div id="db-result" class="db-result hidden"></div>`;
        // 화면 조작: 누르면 공격(꾹 누르면 계속), 옆으로 그으면 회피
        const stage = $('db-stage');
        let sx = 0, sy = 0, moved = false;
        stage.onpointerdown = e => { sx = e.clientX; sy = e.clientY; moved = false; if (B) { closeSwap(); B.holding = true; fastAttack(); } try { stage.setPointerCapture(e.pointerId); } catch (er) {} };
        stage.onpointermove = e => {
            if (!B || moved) return;
            const dx = e.clientX - sx;
            if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(e.clientY - sy)) { moved = true; B.holding = false; dodge(Math.sign(dx)); }
        };
        stage.onpointerup = stage.onpointercancel = () => { if (B) B.holding = false; };
        // 회피 버튼: 누르는 순간 바로 (클릭 지연 없이)
        for (const [id, dir] of [['db-dodge-l', -1], ['db-dodge-r', 1]]) {
            $(id).onpointerdown = e => { e.preventDefault(); e.stopPropagation(); if (B) { B.holding = false; dodge(dir); const b = $(id); b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire'); } };
        }
        el.onclick = e => {
            const sw = e.target.closest('[data-dbsw]');
            if (sw) { swapTo(+sw.dataset.dbsw); return; }
            if (e.target.closest('#db-swap')) { toggleSwap(); return; }
            if (e.target.closest('#db-charged')) { chargedAttack(); return; }
            if (e.target.closest('#db-quit')) { quit(); return; }
            if (e.target.closest('[data-dbdone]')) closeBattle();
        };
        drawUI(Date.now());
    }
    // 등장 연출: 보스 이름 카드가 미끄러져 들어왔다 사라짐
    function showIntro() {
        const el = $('db-intro'), b = B.bd;
        if (!el) return;
        el.style.setProperty('--bc', b.color); el.style.setProperty('--bc2', b.color2);
        el.innerHTML = `<div class="db-intro-in">${bossArt(b.id)}<small>RAID BATTLE · ${stars(B.D.star)}</small><b>${b.name}</b><span>${b.sub}</span><em>약점 ${embSvg(b.weak)} ${ELEMENTS[b.weak].name}</em></div>`;
        el.classList.add('on');
        setTimeout(() => el.classList.remove('on'), 2600);
    }
    function toggleSwap() {
        if (!B || B.over || B.rejoinUntil) return;
        B.swapOpen = !B.swapOpen; B.holding = false;
        const p = $('db-swappanel');
        p.classList.toggle('hidden', !B.swapOpen);
        if (B.swapOpen) p.innerHTML = `<div class="db-sw-head">교체할 칭호</div>` + B.team.map((m, i) => `
            <button class="db-sw ${i === B.cur ? 'on' : ''} ${m.dead ? 'dead' : ''}" data-dbsw="${i}" ${m.dead || i === B.cur ? 'disabled' : ''} style="--ec:${m.E.color}">
                <span class="db-sw-n">${i + 1}</span><span class="db-sw-el">${embSvg(m.el)}</span>
                <span class="db-sw-main"><b>${esc(m.a.name)}</b><i><em style="width:${m.hp / m.max * 100}%"></em></i></span>
                <small>${i === B.cur ? '전투 중' : m.dead ? '쓰러짐' : `${fmt(Math.ceil(m.hp))}`}</small>
            </button>`).join('');
    }
    function closeSwap() { if (B) B.swapOpen = false; $('db-swappanel')?.classList.add('hidden'); }
    function flash(on) { $('db-flash')?.classList.toggle('on', on); }
    function drawUI(now) {
        if (!B) return;
        const b = B.boss, k = b.max ? b.hp / b.max : 0;
        $('db-hpfill').style.width = (k * 100) + '%';
        $('db-hplag').style.width = (k * 100) + '%';
        $('db-hptext').textContent = `${fmt(Math.ceil(b.hp))} / ${fmt(b.max)}`;
        const left = Math.max(0, Math.ceil(((B.sim ? B.sim.end : B.end) - now) / 1000));
        const tm = $('db-timer');
        tm.textContent = left;
        tm.classList.toggle('low', left <= 30);
        $('db-party').innerHTML = B.roster.length > 1 ? [...B.party.entries()].map(([uid, p]) => `<div class="db-pm ${uid === B.me.uid ? 'me' : ''}"><b>${esc(p.nick)}</b><small>${fmt(uid === B.me.uid ? Math.round(B.me.dmg) : p.dmg)}</small></div>`).join('') : '';
        const x = curM();
        if (x) {
            $('db-mine').innerHTML = `<div class="db-mine-top" style="--ec:${x.E.color}">${embSvg(x.el)}<b>${esc(x.a.name)}</b></div>
                <div class="db-mine-hp"><div style="width:${x.hp / x.max * 100}%" class="${x.hp / x.max < 0.25 ? 'low' : ''}"></div></div>
                <small>${fmt(Math.ceil(x.hp))} / ${fmt(x.max)} · 남은 칭호 ${B.team.filter(m => !m.dead).length}/${B.team.length}</small>`;
            const C = x.E.charged, n = Math.round(100 / C.cost), R0 = 44, CIRC = 2 * Math.PI * R0, gap = n > 1 ? 7 : 0, seg = CIRC / n - gap;
            $('db-arcs').innerHTML = Array.from({ length: n }, (_, i) => {
                const f = Math.max(0, Math.min(1, (x.en - i * C.cost) / C.cost)), off = -(i * CIRC / n) - gap / 2;
                return `<circle class="tr" r="${R0}" cx="50" cy="50" stroke-dasharray="${seg} ${CIRC - seg}" stroke-dashoffset="${off}"/><circle class="fl ${f >= 1 ? 'full' : ''}" r="${R0}" cx="50" cy="50" stroke-dasharray="${seg * f} ${CIRC - seg * f}" stroke-dashoffset="${off}"/>`;
            }).join('');
            const core = $('db-ch-core');
            if (core.dataset.el !== x.el) { core.dataset.el = x.el; core.innerHTML = embSvg(x.el, 'big'); }
            $('db-ch-name').textContent = C.name;
            const ch = $('db-charged');
            ch.style.setProperty('--ec', x.E.color);
            $('db-ch-name').style.setProperty('--ec', x.E.color);
            ch.classList.toggle('ready', x.en >= C.cost && !x.dead && !B.rejoinUntil);
        }
        $('db-hurt').classList.toggle('on', now - (B.hurtAt || 0) < 220);
        $('db-rejoin').classList.toggle('hidden', !B.rejoinUntil || B.over);
        if (B.rejoinUntil) $('db-rj-t').textContent = Math.ceil((B.rejoinUntil - now) / 1000);
        if (now - B.t0 > 12000) $('db-hint')?.classList.add('fade');
    }
    function floatText(txt, cls = 'dmg', x, y) {
        const box = $('db-float');
        if (!box || box.childElementCount > 24) return;
        const d = document.createElement('div');
        d.className = 'db-num ' + cls;
        d.textContent = txt;
        d.style.left = (x ?? 38 + Math.random() * 24) + '%';
        d.style.top = (y ?? 28 + Math.random() * 12) + '%';
        box.appendChild(d);
        setTimeout(() => d.remove(), cls.includes('big') || cls.includes('eff') || cls === 'move' ? 1500 : 900);
    }
    async function quit() {
        if (!B || B.over) return;
        const solo = B.roster.length === 1;
        const ok = await api.ask({ title: '레이드에서 나갈까요?', message: B.host && !solo ? '방장이 나가면 파티 전원의 레이드가 끝나요.' : '티켓과 입장 횟수는 돌려받지 못해요.', okText: '나가기', danger: true });
        if (!ok || !B || B.over) return;
        if (B.sim) simEnd(false);
        else { B.net.emit('act', { uid: B.me.uid, dmg: Math.round(B.me.pend) }); B.me.pend = 0; finish({ win: false, quit: true }); }
    }

    /* ---------- 결과 (보상은 바로 들어옴) ---------- */
    function finish(m) {
        if (!B || B.over) return;
        B.over = true;
        B.holding = false;
        clearInterval(B.timer);
        flash(false); closeSwap();
        $('db-hint')?.classList.add('fade');
        const s = st(), D = B.D, gs = api.gs();
        B.lines = []; B.won = !!m.win; B.result = m;
        if (m.lost) { s.tk++; s.runs = Math.max(0, s.runs - 1); B.lines.push('<span class="at-rw">🎟 티켓·입장 횟수를 돌려받았어요</span>'); }
        else if (B.won) {
            B.scene?.die();
            gs.jc += D.jc; B.lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(D.jc)}</span>`);
            api.passAddXp(D.xp); B.lines.push(`<span class="at-rw">🎫 ${fmt(D.xp)} XP</span>`);
            s.chests[B.bd.id] = (s.chests[B.bd.id] || 0) + D.chests;
            B.lines.push(`<span class="at-rw rd-chestchip">${chestHtml(B.bd.id, 'sm')} ${CHESTS[B.bd.id].name} ×${D.chests}</span>`);
            for (const x of CUR.drops) {
                if (!(Math.random() < x.p[B.diff])) continue;
                if (x.kind === 'aura') {
                    api.grantAura(x.id); api.broadcastAura?.(x.id);
                    B.rare = `✦ 「${esc(api.aura(x.id).name)}」`;
                    B.lines.unshift(`<span class="at-rw dg-rare">✦ 레이드 칭호 「${esc(api.aura(x.id).name)}」</span>`);
                } else {
                    const t = api.grantGear(x.id);
                    B.rare = B.rare || `⚒ ${esc(api.gearName(x.id))}`;
                    B.lines.unshift(`<span class="at-rw dg-rare">⚒ ${esc(api.gearName(x.id))} <small>${t}</small></span>`);
                }
            }
            s.clears[ck(B.diff)] = (s.clears[ck(B.diff)] || 0) + 1;
            api.dailyTrack('dungeon');
        } else {
            const frac = m.frac ?? (1 - B.boss.hp / B.boss.max);
            const jc = Math.round(D.jc * 0.3 * frac / 100) * 100;
            if (jc > 0) { gs.jc += jc; B.lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(jc)} <small>(위로금)</small></span>`); }
        }
        api.save(); api.renderStats();
        setTimeout(showResult, B.won ? 1800 : 900);
    }
    function showResult() {
        if (!B) return;
        const m = B.result, D = B.D;
        const dmg = m.dmg ? Object.entries(m.dmg).sort((a, b) => b[1][1] - a[1][1]) : [[B.me.uid, [B.me.nick, Math.round(B.me.dmg)]]];
        const total = dmg.reduce((a, [, v]) => a + v[1], 0) || 1;
        const title = m.lost ? '연결이 끊겼어요' : B.won ? 'VICTORY' : m.quit ? '나갔어요' : 'TIME OVER';
        const el = $('db-result');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div class="db-res-box ${B.won ? 'win' : 'lose'}">
                <div class="db-res-title">${title}</div>
                <div class="db-res-sub">${B.bd.name} <span style="color:${D.color}">${stars(D.star)}</span> · ${Math.round((Date.now() - B.t0) / 1000)}초</div>
                ${B.rare ? `<div class="db-res-rare">${B.rare} 획득!</div>` : ''}
                <div class="db-res-sec">피해 순위</div>
                <div class="db-res-rank">${dmg.map(([uid, [nick, v]], i) => `<div class="db-res-row ${uid === B.me.uid ? 'me' : ''}"><span>${i + 1}</span><b>${esc(nick)}</b><div class="db-res-bar"><i style="width:${v / total * 100}%"></i></div><small>${fmt(v)}</small></div>`).join('')}</div>
                <div class="db-res-sec">보상</div>
                <div class="db-res-rw">${B.lines.join('') || '<small>보상 없음</small>'}</div>
                <button class="btn btn-block ${B.won ? 'btn-gold' : ''}" data-dbdone>돌아가기</button>
            </div>`;
    }
    function closeBattle() {
        if (!B) return;
        const b = B;
        clearInterval(b.timer);
        api.setTakeover(null);
        setTimeout(() => b.scene?.dispose(), 100);
        setTimeout(() => b.net.close(), 400);
        const el = $('dng-battle');
        el.classList.add('hidden'); el.innerHTML = ''; el.onclick = null;
        document.body.classList.remove('in-dng');
        B = null;
        api.setBusy(false);
        api.openSheet('sheet-dungeon');
    }

    return {
        render,
        onOpen() { openLobby(); render(); },
        onClose() { if (!party) { closeLobby(); view = 'main'; } picking = -1; },
        bind() { $('dng-panel').addEventListener('click', onClick); },
        busy: () => !!B,
        ticketAdd(n) { st().tk += n; },
        tickets: () => st().tk,
        _dbg: () => ({ B, party, lobby })
    };
}
