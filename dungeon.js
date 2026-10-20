/* =========================================================
   🌀 균열 던전 (dungeon.js) — 보스전
   - EPIC 이상 칭호에는 전투 스킬이 붙어 있음 → 칭호 3개를 골라 들고 입장
   - 솔로: 서버 없이 폰 안에서만
   - 파티(최대 4명): Supabase 실시간 채널로 주고받음 (DB에 저장 안 함)
       방장이 보스를 돌리고(체력·공격 타이밍), 각자 자기 체력·회피·데미지를 계산해서 보냄
   - 입장은 던전 티켓 (매일 3장까지 채워짐)
   ========================================================= */

const GRADE_ATK = { COMMON: 4, RARE: 12, EPIC: 35, LEGEND: 80, MYTHIC: 170, ANCIENT: 320, ABSOLUTE: 560, JXS: 950 };
const SKILL_GRADES = ['EPIC', 'LEGEND', 'MYTHIC', 'ANCIENT', 'ABSOLUTE', 'JXS'];
const GRADE_MULT = { EPIC: 1, LEGEND: 1.15, MYTHIC: 1.3, ANCIENT: 1.5, ABSOLUTE: 1.75, JXS: 2.1 };
const r1 = v => Math.round(v * 10) / 10;
const pct = v => Math.round(v * 100) + '%';

export const SKILLS = {
    strike:   { name: '일격',      icon: '⚔', cd: 7,  color: 0xffffff, desc: g => `공격력 ×${r1(8 * g)} 피해` },
    chain:    { name: '연쇄 번개', icon: '⚡', cd: 9,  color: 0xbfe6ff, desc: g => `공격력 ×${r1(2 * g)} 피해 5번` },
    burn:     { name: '화염',      icon: '🔥', cd: 12, color: 0xff7a2a, desc: g => `7초 동안 공격력 ×${r1(14 * g)} 화상 피해` },
    freeze:   { name: '빙결',      icon: '❄', cd: 20, color: 0x7ae8ff, desc: (g, tier) => `보스 ${r1(3.5 + 0.3 * tier)}초 기절 · 균열 폭발 저지 · 기절 중 받는 피해 +25%` },
    heal:     { name: '치유',      icon: '✚', cd: 16, color: 0x7dff9a, desc: g => `파티 전원 체력 ${pct(Math.min(0.8, 0.35 * g))} 회복 · 쓰러진 동료 부활` },
    shield:   { name: '방벽',      icon: '🛡', cd: 18, color: 0x5ab0ff, desc: g => `8초 동안 파티 전원에게 내 체력 ${pct(0.4 * g)}만큼 보호막` },
    rally:    { name: '고무',      icon: '📯', cd: 22, color: 0xffd23a, desc: g => `8초 동안 파티 전원 피해 +${pct(0.4 * g)}` },
    drain:    { name: '흡혈',      icon: '🩸', cd: 10, color: 0xff2a4a, desc: g => `공격력 ×${r1(6 * g)} 피해 · 내 체력 ${pct(0.2 * g)} 회복` },
    rend:     { name: '균열 베기', icon: '🌀', cd: 8,  color: 0xff6ad8, desc: g => `공격력 ×${r1(14 * g)} 피해` },
    collapse: { name: '균열 붕괴', icon: '🌌', cd: 12, color: 0xc070ff, desc: g => `공격력 ×${r1(10 * g)} 피해 · 6초 동안 파티 피해 +25%` }
};
// 칭호 id 에 들어간 단어로 스킬을 정함 (위에서부터 먼저 맞는 것)
const SKILL_RULES = [
    ['shield', ['divine_knight', 'golem', 'honor', 'juggernaut', 'steel', '170kg', 'crazykong', 'blackbelt', 'cyborg', 'admin', 'swordsman']],
    ['freeze', ['icetag', 'frozen', 'aurora', 'iceemperor', 'timestop', 'time_', 'moonwolf', 'taichi', 'sans', 'debugger', 'astro']],
    ['heal',   ['heart', 'mechangel', 'sakura', 'lighthouse', 'worldtree', 'gemini', 'divine_god', 'empress', 'balloon', 'chef']],
    ['burn',   ['fire', 'lava', 'phoenix', 'archdemon', 'sunking', 'pumpkin', 'dragonking', 'darkdragon', 'desert', 'pharaoh', 'dragonknight', 'extinct']],
    ['rally',  ['dj', 'ringmaster', 'magician', 'magical', 'youtuber', 'conductor', 'tribe', 'pirate', 'cowboy', 'monkey', 'midas', 'fate', 'creator', 'pioneer', 'goldking', 'alchemist', 'skater']],
    ['drain',  ['vampire', 'necro', 'blackhole', 'void', 'felon', 'darkestnight', 'headless', 'gonjiam', 'gumiho', 'witch', 'shadow', 'abyss', 'nebula', 'chaos', 'mirror']],
    ['chain',  ['storm', 'thunder', 'lightning', 'breaker', 'ninja', 'speed', 'neon', 'wizard', 'banhammer', 'falconer']]
];
export function auraSkill(a) {
    if (!a || !SKILL_GRADES.includes(a.grade)) return null;
    let type = a.dskill;
    if (!type) type = (SKILL_RULES.find(([, ws]) => ws.some(w => a.id.includes(w))) || ['strike'])[0];
    const tier = SKILL_GRADES.indexOf(a.grade);
    return { type, tier, g: GRADE_MULT[a.grade], ...SKILLS[type] };
}

export const DIFFS = [
    { id: 'easy',   name: '쉬움',   color: '#5fe08a', hp: 50000,   hit: 25,  slam: 220,  time: 180, jc: 60000,   xp: 1500, items: { limit_potion: 1 },                    egg: ['egg_basic', 0.2] },
    { id: 'normal', name: '보통',   color: '#ffd23a', hp: 200000,  hit: 40,  slam: 500,  time: 180, jc: 200000,  xp: 3000, items: { limit_potion: 2, star_potion: 1 },    egg: ['egg_rare', 0.25] },
    { id: 'hard',   name: '어려움', color: '#ff8a3a', hp: 1000000, hit: 100, slam: 1200, time: 180, jc: 600000,  xp: 5000, items: { overcome_potion: 1, dice_potion: 1 }, egg: ['egg_legend', 0.25] },
    { id: 'hell',   name: '지옥',   color: '#ff2a4a', hp: 6000000, hit: 200, slam: 2600, time: 180, jc: 1800000, xp: 8000, items: { heaven_potion: 1 },                   egg: ['egg_mythic', 0.25], extra: ['void_potion', 0.3] }
];
// 던전 전용 드롭 (난이도별 확률: 쉬움, 보통, 어려움, 지옥)
export const DROPS = [
    { kind: 'gear', id: 'gear_riftbreaker', p: [0, 0.02, 0.05, 0.12] },
    { kind: 'gear', id: 'amu_riftcore',     p: [0, 0.03, 0.07, 0.15] },
    { kind: 'aura', id: 'dng_riftwalker',   p: [0, 0.04, 0.10, 0.20] },
    { kind: 'aura', id: 'dng_riftlord',     p: [0, 0, 0.01, 0.05] }
];
export const TICKET_DAILY = 3, TICKET_PRICE = 250000;
const BOSS_NAME = '균열의 군주';
const MAX_PARTY = 4;

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
    let selDiff = 0, picking = -1;
    let party = null;     // 파티 대기실
    let lobby = null;     // 열린 파티 목록 채널
    let B = null;         // 진행 중인 전투

    function st() {
        const gs = api.gs();
        if (!gs.dng) gs.dng = { tk: TICKET_DAILY, day: '', clears: {}, slots: [null, null, null] };
        const s = gs.dng;
        if (!s.slots) s.slots = [null, null, null];
        if (!s.clears) s.clears = {};
        const today = api.today();
        if (s.day !== today) { s.day = today; s.tk = Math.max(s.tk || 0, TICKET_DAILY); }
        return s;
    }
    const owned = id => id && (api.gs().inventory[id] || 0) > 0;
    const slots = () => st().slots.map(id => owned(id) ? id : null);
    const unlocked = i => i === 0 || (st().clears[DIFFS[i - 1].id] || 0) > 0;

    function stats() {
        let base = 30, hp = 800;
        for (const id of slots()) if (id) { const a = api.aura(id); base += GRADE_ATK[a.grade]; hp += GRADE_ATK[a.grade] * 2.5; }
        const g = api.gear(), am = api.amu(), pet = api.pet();
        const gm = 1 + (g?.luckBonus || 0) * 0.12 + (g?.dngAtk || 0);
        const amm = am.abil === 'rift' ? am.riftAtk : 1;
        const pm = 1 + (pet.luck || 0) * 0.1 + (pet.speed || 0) * 0.2;
        const hpm = (am.abil === 'rift' ? am.riftHp : 1) * (1 + (g?.dngHp || 0));
        return { atk: Math.round(base * gm * amm * pm), hp: Math.round(hp * hpm), gm, amm, pm, hpm };
    }
    const meEntry = () => { const s = stats(), me = api.me(); return { uid: me.uid, nick: me.nick, atk: s.atk, hp: s.hp, tk: st().tk > 0, last: Date.now() }; };

    /* ---------- 던전 창 ---------- */
    function skillHtml(sk) {
        if (!sk) return '<div class="dk-skill none">스킬 없음 <small>EPIC 이상 칭호만 스킬이 있어요</small></div>';
        return `<div class="dk-skill" style="--sc:#${sk.color.toString(16).padStart(6, '0')}"><b>${sk.icon} ${sk.name}</b><small>${sk.desc(sk.g, sk.tier)} · 재사용 ${sk.cd}초</small></div>`;
    }
    function render() {
        const el = $('dng-panel');
        if (!el) return;
        const s = st(), S = stats(), D = DIFFS[selDiff];
        const sl = slots();
        const lock = !unlocked(selDiff);
        const n = party ? party.roster.length : 1;
        const head = `
            <div class="dg-hero">
                <div class="dg-rift"><i></i><i></i><i></i></div>
                <div class="dg-hero-txt"><small>RIFT DUNGEON</small><b>${BOSS_NAME}</b><span>차원의 틈에서 깨어난 흑요석 거인. 3분 안에 쓰러뜨리세요.</span></div>
            </div>
            <div class="dg-ticket">
                <div><i class="dg-tk-ico"></i> 던전 티켓 <b>${s.tk}</b>장 <small>매일 ${TICKET_DAILY}장까지 채워져요</small></div>
                <button class="btn btn-sm btn-gold" data-dg="buy" ${api.gs().jc >= TICKET_PRICE ? '' : 'disabled'}>구매 ${fmt(TICKET_PRICE)} JC</button>
            </div>`;
        const load = `
            <div class="dg-sec"><span>전투 칭호</span><small>칭호마다 스킬이 달라요 · 눌러서 바꾸기</small></div>
            <div class="dg-slots">${sl.map((id, i) => {
                const a = id && api.aura(id), sk = a && auraSkill(a);
                return `<button class="dg-slot ${a ? api.gradeCol(a.grade) : 'empty'}" data-dgslot="${i}" ${party || B ? 'disabled' : ''} style="--c:${a ? a.color : '#555'}">
                    <span class="dg-slot-n">${i + 1}</span>
                    ${a ? `<span class="dg-slot-g">${a.grade}</span><b>${esc(a.name)}</b>${sk ? `<em>${sk.icon} ${sk.name}</em>` : '<em class="none">스킬 없음</em>'}` : '<b class="none">+ 비어 있음</b>'}
                </button>`;
            }).join('')}</div>
            <div class="dg-stats">
                <div><small>공격력</small><b>${fmt(S.atk)}</b></div>
                <div><small>체력</small><b>${fmt(S.hp)}</b></div>
                <div class="dg-mult"><small>장비 ×${r1(S.gm)} · 부적 ×${r1(S.amm)} · 펫 ×${r1(S.pm)}</small></div>
            </div>`;
        const diffs = `
            <div class="dg-sec"><span>난이도</span><small>앞 난이도를 한 번 깨면 다음이 열려요</small></div>
            <div class="dg-diffs">${DIFFS.map((d, i) => `<button class="dg-diff ${i === selDiff ? 'on' : ''} ${unlocked(i) ? '' : 'lock'}" style="--dc:${d.color}" data-dgdiff="${i}" ${party && party.role !== 'host' ? 'disabled' : ''}>${unlocked(i) ? '' : '🔒 '}${d.name}<small>${s.clears[d.id] ? `${s.clears[d.id]}회 클리어` : '미클리어'}</small></button>`).join('')}</div>
            <div class="dg-info" style="--dc:${D.color}">
                <div class="dg-info-row"><span>보스 체력</span><b>${fmt(Math.round(D.hp * (1 + 0.75 * (n - 1))))}</b>${n > 1 ? `<small>(${n}명)</small>` : ''}</div>
                <div class="dg-info-row"><span>보스 공격</span><b>${fmt(D.hit)}</b><small>· 균열 폭발 ${fmt(D.slam)} (회피 가능)</small></div>
                <div class="dg-rw">${api.rewardChips({ jc: D.jc, items: D.items })}<span class="at-rw">🎫 ${fmt(D.xp)} XP</span><span class="at-rw">🥚 ${api.eggName(D.egg[0])} ${pct(D.egg[1])}</span>${D.extra ? `<span class="at-rw">${api.itemName(D.extra[0])} ${pct(D.extra[1])}</span>` : ''}</div>
                <div class="dg-drops">${DROPS.filter(x => x.p[selDiff] > 0).map(x => `<span class="dg-drop ${x.kind}">${x.kind === 'aura' ? '✦ ' + esc(api.aura(x.id).name) : '⚒ ' + esc(api.gearName(x.id))}<b>${Math.round(x.p[selDiff] * 1000) / 10}%</b></span>`).join('') || '<small class="dg-nodrop">쉬움은 전용 드롭이 없어요</small>'}</div>
            </div>`;
        el.innerHTML = head + load + diffs + (party ? partyHtml() : actionsHtml(lock)) + pickerHtml();
    }
    function actionsHtml(lock) {
        const s = st();
        const rooms = lobby ? [...lobby.rooms.values()].filter(r => Date.now() - r.at < 7000) : [];
        return `
            <div class="dg-actions">
                <button class="btn btn-block btn-primary dg-go" data-dg="solo" ${lock || s.tk < 1 ? 'disabled' : ''}>⚔ 솔로 입장 <small>티켓 1장</small></button>
                <button class="btn btn-block dg-go" data-dg="host" ${lock || s.tk < 1 ? 'disabled' : ''}>👥 파티 만들기 <small>최대 ${MAX_PARTY}명</small></button>
            </div>
            <div class="dg-join">
                <input id="dg-code" inputmode="numeric" maxlength="4" placeholder="방 번호 4자리">
                <button class="btn btn-sm" data-dg="join">참가</button>
            </div>
            <div class="dg-sec"><span>열린 파티</span><small>${lobby ? '친구가 만든 방이 여기 떠요' : '연결 중…'}</small></div>
            <div class="dg-rooms">${rooms.length ? rooms.map(r => `<button class="dg-room" data-dgroom="${r.code}" style="--dc:${DIFFS[r.diff]?.color}"><b>${esc(r.host)}</b>의 방 <span>${DIFFS[r.diff]?.name}</span><small>${r.n}/${MAX_PARTY} · #${r.code}</small></button>`).join('') : '<div class="dg-empty">지금 열린 파티가 없어요</div>'}</div>`;
    }
    function partyHtml() {
        const p = party, me = api.me().uid, host = p.role === 'host';
        const all = p.roster.every(r => r.tk);
        const rows = Array.from({ length: MAX_PARTY }, (_, i) => {
            const r = p.roster[i];
            return r ? `<div class="dg-mem ${r.uid === me ? 'me' : ''}"><span class="dg-mem-n">${i === 0 ? '👑' : i + 1}</span><b>${esc(r.nick)}</b><small>공격 ${fmt(r.atk)} · 체력 ${fmt(r.hp)}</small>${r.tk ? '' : '<em>티켓 없음</em>'}</div>`
                : `<div class="dg-mem empty"><span class="dg-mem-n">${i + 1}</span><b>빈 자리</b></div>`;
        }).join('');
        return `
            <div class="dg-party">
                <div class="dg-party-head"><small>방 번호</small><b>${p.code}</b><span>${host ? '친구에게 이 번호를 알려 주세요' : p.roster.length ? '방장이 시작하길 기다리는 중…' : '방을 찾는 중…'}</span></div>
                <div class="dg-mems">${rows}</div>
                ${host ? `<button class="btn btn-block btn-primary dg-go" data-dg="start" ${all && unlocked(selDiff) ? '' : 'disabled'}>⚔ ${DIFFS[selDiff].name} 시작 <small>${all ? `${p.roster.length}명 · 각자 티켓 1장` : '티켓 없는 사람이 있어요'}</small></button>` : `<div class="dg-wait">난이도 <b style="color:${DIFFS[p.diff ?? 0].color}">${DIFFS[p.diff ?? 0].name}</b></div>`}
                <button class="btn btn-block" data-dg="leave">${host ? '방 닫기' : '나가기'}</button>
            </div>`;
    }
    function pickerHtml() {
        if (picking < 0) return '';
        const gs = api.gs(), cur = st().slots;
        const list = api.auras.filter(a => owned(a.id) && !cur.includes(a.id)).sort((a, b) => GRADE_ATK[b.grade] - GRADE_ATK[a.grade] || b.in - a.in);
        return `
            <div class="dg-picker">
                <div class="dg-pk-box">
                    <div class="dg-pk-head"><b>${picking + 1}번 칸 칭호 고르기</b><button class="sheet-close" data-dg="pkclose">✕</button></div>
                    <div class="dg-pk-list">
                        ${cur[picking] ? `<button class="dg-pk-item clear" data-dgpick="">칸 비우기</button>` : ''}
                        ${list.map(a => { const sk = auraSkill(a); return `<button class="dg-pk-item ${api.gradeCol(a.grade)}" data-dgpick="${a.id}" style="--c:${a.color}"><span class="dg-pk-g">${a.grade}</span><b>${esc(a.name)}</b><small>공격 +${GRADE_ATK[a.grade]} · 체력 +${fmt(GRADE_ATK[a.grade] * 2.5)}</small>${skillHtml(sk)}</button>`; }).join('') || '<div class="dg-empty">넣을 수 있는 칭호가 없어요</div>'}
                    </div>
                </div>
            </div>`;
    }

    /* ---------- 창 클릭 ---------- */
    function onClick(e) {
        const t = e.target.closest('[data-dg],[data-dgslot],[data-dgdiff],[data-dgpick],[data-dgroom]');
        if (!t) { if (e.target.classList.contains('dg-picker')) { picking = -1; render(); } return; }
        const d = t.dataset, s = st();
        if (d.dgslot !== undefined) { picking = +d.dgslot; render(); return; }
        if (d.dgpick !== undefined) { s.slots[picking] = d.dgpick || null; picking = -1; api.save(); render(); return; }
        if (d.dgdiff !== undefined) { const i = +d.dgdiff; if (!unlocked(i)) { api.toast(`${DIFFS[i - 1].name}을 먼저 깨야 해요`, 'bad'); return; } selDiff = i; if (party?.role === 'host') party.diff = i; render(); return; }
        if (d.dgroom) { joinParty(d.dgroom); return; }
        switch (d.dg) {
            case 'pkclose': picking = -1; render(); break;
            case 'buy': {
                const gs = api.gs();
                if (gs.jc < TICKET_PRICE) return;
                gs.jc -= TICKET_PRICE; s.tk++; api.save(); api.renderStats(); render();
                api.toast('🎟 던전 티켓 +1', 'gold');
                break;
            }
            case 'solo':
                if (s.tk < 1 || !unlocked(selDiff)) return;
                startBattle({ diff: selDiff, roster: [meEntry()], host: true, net: makeNet(null, api) });
                break;
            case 'host': createParty(); break;
            case 'join': { const c = ($('dg-code')?.value || '').trim(); if (!/^\d{4}$/.test(c)) { api.toast('방 번호 4자리를 넣어 주세요', 'bad'); return; } joinParty(c); break; }
            case 'leave': leaveParty(); break;
            case 'start': hostStart(); break;
        }
    }

    /* ---------- 열린 파티 목록 ---------- */
    function openLobby() {
        if (lobby) return;
        lobby = { net: makeNet('dng-lobby', api), rooms: new Map() };
        lobby.net.on('room', r => { if (!r?.code) return; if (r.closed) lobby.rooms.delete(r.code); else lobby.rooms.set(r.code, { ...r, at: Date.now() }); if (!party && !B) renderSoft(); });
        lobby.net.on('_ready', () => { if (!party && !B) renderSoft(); });
        lobby.timer = setInterval(() => { if (!party && !B) renderSoft(); }, 3000);
    }
    function closeLobby() { if (!lobby) return; clearInterval(lobby.timer); lobby.net.close(); lobby = null; }
    // 입력 중인 방 번호는 지우지 않고 목록만 다시 그림
    function renderSoft() {
        const box = document.querySelector('#dng-panel .dg-rooms');
        if (!box || picking >= 0) return;
        const code = $('dg-code')?.value, focus = document.activeElement?.id === 'dg-code';
        render();
        if (code && $('dg-code')) { $('dg-code').value = code; if (focus) $('dg-code').focus(); }
    }

    /* ---------- 파티 ---------- */
    function createParty() {
        if (party || B) return;
        const code = String(1000 + Math.floor(Math.random() * 9000));
        party = { role: 'host', code, net: makeNet('dng-' + code, api), roster: [meEntry()], diff: selDiff };
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
            const now = Date.now();
            p.roster[0] = meEntry();
            const before = p.roster.length;
            p.roster = p.roster.filter((r, i) => i === 0 || now - r.last < 7000);
            p.diff = selDiff;
            p.net.send('roster', { code: p.code, diff: p.diff, ps: p.roster });
            lobby?.net.send('room', { code: p.code, host: p.roster[0].nick, n: p.roster.length, diff: p.diff });
            if (p.roster.length !== before) render();
        };
        p.timer = setInterval(beat, 1500);
        beat();
        render();
    }
    function joinParty(code) {
        if (party || B) return;
        if (st().tk < 1) { api.toast('던전 티켓이 없어요', 'bad'); return; }
        party = { role: 'member', code, net: makeNet('dng-' + code, api), roster: [], diff: 0, since: Date.now() };
        const p = party, me = api.me().uid;
        p.net.on('roster', m => {
            if (m.code !== code) return;
            p.roster = m.ps || []; p.diff = m.diff; p.got = Date.now();
            if (p.diff !== undefined && unlocked(p.diff)) selDiff = p.diff;
            render();
        });
        p.net.on('full', m => { if (m.uid === me) { api.toast('파티가 가득 찼어요', 'bad'); leaveParty(true); } });
        p.net.on('closed', () => { api.toast('방장이 방을 닫았어요', 'bad'); leaveParty(true); });
        p.net.on('start', m => {
            if (!party || party !== p) return;
            if (!(m.ps || []).some(r => r.uid === me)) return;
            clearInterval(p.timer);
            const net = p.net; party = null;
            startBattle({ diff: m.diff, roster: m.ps, host: false, net });
        });
        const beat = () => {
            p.net.send('hello', meEntry());
            if (!p.got && Date.now() - p.since > 9000) { api.toast(`#${code} 방을 찾을 수 없어요`, 'bad'); leaveParty(true); }
            else if (p.got && Date.now() - p.got > 8000) { api.toast('방장과 연결이 끊겼어요', 'bad'); leaveParty(true); }
        };
        p.timer = setInterval(beat, 1500);
        beat();
        render();
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
        if (!p.roster.every(r => r.tk)) { api.toast('티켓 없는 사람이 있어요', 'bad'); return; }
        clearInterval(p.timer);
        lobby?.net.send('room', { code: p.code, closed: true });
        const roster = p.roster.map(({ last, ...r }) => r);
        p.net.send('start', { diff: selDiff, ps: roster });
        const net = p.net; party = null;
        startBattle({ diff: selDiff, roster, host: true, net });
    }

    /* =========================================================
       전투
       ========================================================= */
    function startBattle({ diff, roster, host, net }) {
        const s = st();
        if (s.tk < 1) { api.toast('던전 티켓이 없어요', 'bad'); net.close(); return; }
        s.tk--; api.save();
        api.closeSheet('sheet-dungeon');
        closeLobby();
        const me = api.me(), S = stats(), D = DIFFS[diff], now = Date.now();
        const bossMax = Math.round(D.hp * (1 + 0.75 * (roster.length - 1)));
        B = {
            diff, D, net, host, roster, scene: null, over: false, t0: now, last: now, lastSt: now,
            me: { uid: me.uid, nick: me.nick, hp: S.hp, max: S.hp, shield: 0, shieldUntil: 0, dead: false, dmg: 0, pend: 0, dodgeUntil: 0, dodgeCd: 0, hurt: 0 },
            atk: S.atk,
            skills: slots().map(id => { const a = id && api.aura(id), sk = a && auraSkill(a); return sk ? { aura: a, sk, readyAt: now + 1500 } : null; }),
            boss: { hp: bossMax, max: bossMax, shown: bossMax, stun: false, enr: false, left: D.time },
            party: new Map(roster.map(r => [r.uid, { nick: r.nick, hp: r.hp, max: r.hp, dead: false, dmg: 0 }])),
            charge: null, dots: [], rally: { until: 0, pct: 0 }, autoT: 1, repT: 0.6, floats: 0
        };
        if (host) B.sim = {
            hp: bossMax, max: bossMax, end: now + D.time * 1000, nextHit: now + 3000, nextCharge: now + 10000,
            chargeUntil: 0, stunUntil: 0, enr: false, over: false, stT: 0,
            ps: Object.fromEntries(roster.map(r => [r.uid, { nick: r.nick, hp: r.hp, max: r.hp, dead: false, dmg: 0, last: now }]))
        };
        wireNet();
        api.setBusy(true);
        buildBattleUI();
        import('./boss3d.js?v=57').then(({ createBossScene }) => {
            if (!B || B.net !== net) return;
            B.scene = createBossScene();
            api.setTakeover(B.scene);
        }).catch(e => console.warn(e));
        B.timer = setInterval(tick, 100);
        floatText(`${BOSS_NAME} 출현!`, 'big', 50, 32);
    }

    function wireNet() {
        const net = B.net, me = B.me.uid;
        net.on('st', m => {
            if (!B) return;
            B.lastSt = Date.now();
            const b = B.boss;
            b.hp = Math.max(0, m.hp - B.me.pend); b.max = m.max; b.left = m.left;   // 아직 안 보낸 내 피해는 미리 빼서 보여 줌
            if (b.stun !== m.stun) { b.stun = m.stun; B.scene?.setStun(m.stun); if (m.stun) hideWarn(); }
            if (b.enr !== m.enr) { b.enr = m.enr; B.scene?.setEnrage(m.enr); if (m.enr) floatText('광폭화!', 'big rage', 50, 30); }
            for (const uid in m.ps) { const [hp, max, dmg, dead] = m.ps[uid], p = B.party.get(uid); if (p) Object.assign(p, { hp, max, dmg, dead: !!dead }); }
        });
        net.on('ev', m => {
            if (!B || B.over) return;
            if (m.k === 'hit') {
                B.scene?.attack();
                if (m.to === me) setTimeout(() => B && !B.over && takeDmg(m.d, false), 450);
            } else if (m.k === 'charge') {
                B.charge = { at: Date.now() + m.dur, d: m.d, dur: m.dur };
                B.scene?.charge(m.dur / 1000);
                showWarn();
            } else if (m.k === 'cancel') {
                B.charge = null; B.scene?.cancel(); hideWarn();
                floatText('균열 폭발 저지!', 'big ice', 50, 40);
            } else if (m.k === 'end') finish(m);
        });
        net.on('fx', f => {
            if (!B || B.over || !f) return;
            const m = B.me, now = Date.now();
            const who = f.from && f.from !== m.nick ? `${f.from}의 ` : '';
            if (f.k === 'heal') {
                if (m.dead && f.revive) { m.dead = false; m.hp = m.max * 0.3; floatText(`${who}치유로 부활!`, 'heal', 50, 70); }
                else if (!m.dead) { m.hp = Math.min(m.max, m.hp + m.max * f.v); floatText(`${who}치유 +${fmt(Math.round(m.max * f.v))}`, 'heal', 50, 72); }
                B.scene?.skillFx('heal');
            } else if (f.k === 'shield') {
                if (!m.dead) { m.shield = Math.max(m.shield, f.v); m.shieldUntil = now + f.dur; floatText(`${who}방벽 ${fmt(f.v)}`, 'shield', 50, 72); }
                B.scene?.skillFx('shield');
            } else if (f.k === 'rally') {
                B.rally = { until: now + f.dur, pct: Math.max(now < B.rally.until ? B.rally.pct : 0, f.pct) };
                floatText(`${who}고무 피해 +${pct(f.pct)}`, 'rally', 50, 72);
                B.scene?.skillFx('rally');
            } else if (f.k === 'freeze') {
                B.scene?.skillFx('freeze');
                if (B.sim) simFreeze(f.dur);
            } else if (f.k === 'vis' && f.from !== m.nick) B.scene?.skillFx(f.type, f.color);
        });
        if (B.host) net.on('act', a => {
            const S = B?.sim;
            if (!S || S.over || !a?.uid) return;
            const p = S.ps[a.uid];
            if (!p) return;
            Object.assign(p, { hp: a.hp, max: a.max, dead: !!a.dead, last: Date.now() });
            const d = Math.max(0, Math.min(a.dmg || 0, 1e12));
            p.dmg += d; S.hp -= d;
            if (S.hp <= 0) simEnd(true);
        });
    }

    /* ---------- 방장: 보스 움직임 ---------- */
    function simTick(now) {
        const S = B.sim, D = B.D;
        if (S.over) return;
        for (const uid in S.ps) { const p = S.ps[uid]; if (uid !== B.me.uid && now - p.last > 8000) p.dead = true; }   // 연결 끊긴 사람
        const alive = Object.keys(S.ps).filter(u => !S.ps[u].dead);
        if (S.hp <= 0) return simEnd(true);
        if (!alive.length || now >= S.end) return simEnd(false);
        S.enr = S.hp / S.max <= 0.3;
        const stunned = now < S.stunUntil, mult = S.enr ? 1.3 : 1;
        if (stunned) S.nextHit = Math.max(S.nextHit, S.stunUntil + 600);
        else {
            if (now >= S.nextHit) {
                B.net.emit('ev', { k: 'hit', to: alive[Math.floor(Math.random() * alive.length)], d: Math.round(D.hit * mult) });
                S.nextHit = now + (S.enr ? 1800 : 2500);
            }
            if (!S.chargeUntil && now >= S.nextCharge) {
                S.chargeUntil = now + 3000;
                S.nextHit = Math.max(S.nextHit, now + 3800);
                B.net.emit('ev', { k: 'charge', dur: 3000, d: Math.round(D.slam * mult) });
            }
        }
        if (S.chargeUntil && now >= S.chargeUntil) { S.chargeUntil = 0; S.nextCharge = now + (S.enr ? 10000 : 14000); }
        if (now - S.stT >= 300) {
            S.stT = now;
            const ps = {};
            for (const uid in S.ps) { const p = S.ps[uid]; ps[uid] = [Math.round(p.hp), p.max, Math.round(p.dmg), p.dead ? 1 : 0]; }
            B.net.emit('st', { hp: Math.max(0, Math.round(S.hp)), max: S.max, stun: stunned, enr: S.enr, left: Math.max(0, Math.ceil((S.end - now) / 1000)), ps });
        }
    }
    function simFreeze(dur) {
        const S = B.sim, now = Date.now();
        if (!S || S.over) return;
        S.stunUntil = Math.max(S.stunUntil, now + dur);
        if (S.chargeUntil) { S.chargeUntil = 0; S.nextCharge = S.stunUntil + 6000; B.net.emit('ev', { k: 'cancel' }); }
    }
    function simEnd(win) {
        const S = B.sim;
        if (S.over) return;
        S.over = true;
        const dmg = {};
        for (const uid in S.ps) dmg[uid] = [S.ps[uid].nick, Math.round(S.ps[uid].dmg)];
        B.net.emit('st', { hp: win ? 0 : Math.max(0, Math.round(S.hp)), max: S.max, stun: false, enr: S.enr, left: 0, ps: Object.fromEntries(Object.entries(S.ps).map(([u, p]) => [u, [Math.round(p.hp), p.max, Math.round(p.dmg), p.dead ? 1 : 0]])) });
        B.net.emit('ev', { k: 'end', win, dmg, frac: Math.min(1, (S.max - Math.max(0, S.hp)) / S.max) });
    }

    /* ---------- 내 쪽 ---------- */
    function tick() {
        if (!B || B.over) return;
        const now = Date.now(), dt = Math.min(2, (now - B.last) / 1000);   // 폰이 타이머를 늦춰도 자동 공격 시간이 안 사라지게
        B.last = now;
        if (B.sim) simTick(now);
        if (!B || B.over) return;
        const m = B.me;
        if (!m.dead) {
            B.autoT -= dt;
            while (B.autoT <= 0) { B.autoT += 1; deal(B.atk, 'auto'); }
            B.dots = B.dots.filter(d => now < d.until);
            for (const d of B.dots) { deal(d.dps * dt, 'dot', true); d.acc = (d.acc || 0) + d.dps * dt; if (now - (d.shown || 0) > 1000) { d.shown = now; floatText(fmt(Math.round(d.acc)), 'dot'); d.acc = 0; } }
            m.hp = Math.min(m.max, m.hp + m.max * 0.006 * dt);
        }
        if (m.shield && now > m.shieldUntil) m.shield = 0;
        if (B.charge && now >= B.charge.at) {
            const c = B.charge; B.charge = null;
            B.scene?.slam(); hideWarn();
            if (!m.dead) {
                if (now <= m.dodgeUntil) floatText('회피!', 'big dodge', 50, 62);
                else setTimeout(() => B && !B.over && takeDmg(c.d, true), 300);
            }
        }
        B.repT -= dt;
        if (B.repT <= 0) {
            B.repT = 0.6;
            B.net.emit('act', { uid: m.uid, nick: m.nick, dmg: Math.round(m.pend), hp: Math.round(m.hp), max: m.max, dead: m.dead });
            m.pend = 0;
        }
        if (!B.host && now - B.lastSt > 8000) { finish({ win: false, lost: true }); return; }
        drawUI(now);
    }
    function deal(n, kind, silent) {
        const now = Date.now(), b = B.boss;
        const v = n * (1 + (now < B.rally.until ? B.rally.pct : 0) + (b.stun ? 0.25 : 0));
        B.me.pend += v; B.me.dmg += v;
        b.hp = Math.max(0, b.hp - v);
        if (silent) return;
        const big = kind === 'skill';
        floatText(fmt(Math.round(v)), big ? 'crit' : 'dmg');
        B.scene?.hit(big ? 0.9 : 0.15, big ? 0xffd23a : 0xffffff);
    }
    function takeDmg(d, big) {
        const m = B.me;
        if (m.dead) return;
        let x = d;
        if (m.shield > 0) { const a = Math.min(m.shield, x); m.shield -= a; x -= a; if (a) floatText(`막음 ${fmt(Math.round(a))}`, 'shield', 50, 74); }
        if (x <= 0) return;
        m.hp -= x; m.hurt = Date.now();
        floatText(`-${fmt(Math.round(x))}`, 'hurt', 50, 78);
        try { navigator.vibrate?.(big ? 180 : 40); } catch (e) {}
        if (big) B.scene?.shake(0.6);
        if (m.hp <= 0) { m.hp = 0; m.dead = true; floatText('쓰러졌어요', 'big hurt', 50, 55); }
    }
    function useSkill(i) {
        const s = B?.skills[i], m = B?.me, now = Date.now();
        if (!s || !B || B.over || m.dead || now < s.readyAt) return;
        s.readyAt = now + s.sk.cd * 1000;
        const A = B.atk, g = s.sk.g, type = s.sk.type, net = B.net, from = m.nick;
        const skill = mult => deal(A * mult * g, 'skill');
        switch (type) {
            case 'strike': skill(8); break;
            case 'chain': for (let k = 0; k < 5; k++) setTimeout(() => B && !B.over && skill(2), k * 150); break;
            case 'burn': B.dots.push({ until: now + 7000, dps: A * 2 * g }); floatText('화염!', 'crit'); break;
            case 'freeze': skill(3); net.emit('fx', { k: 'freeze', dur: (3.5 + 0.3 * s.sk.tier) * 1000, from }); break;
            case 'heal': net.emit('fx', { k: 'heal', v: Math.min(0.8, 0.35 * g), revive: true, from }); break;
            case 'shield': net.emit('fx', { k: 'shield', v: Math.round(m.max * 0.4 * g), dur: 8000, from }); break;
            case 'rally': net.emit('fx', { k: 'rally', pct: 0.4 * g, dur: 8000, from }); break;
            case 'drain': skill(6); m.hp = Math.min(m.max, m.hp + m.max * 0.2 * g); break;
            case 'rend': skill(14); break;
            case 'collapse': skill(10); net.emit('fx', { k: 'rally', pct: 0.25, dur: 6000, from }); break;
        }
        if (!['heal', 'shield', 'rally', 'freeze'].includes(type)) { B.scene?.skillFx(type, s.sk.color); net.send('fx', { k: 'vis', type, color: s.sk.color, from }); }
        drawUI(now);
    }
    function dodge() {
        const m = B?.me, now = Date.now();
        if (!B || B.over || m.dead || now < m.dodgeCd) return;
        m.dodgeUntil = now + 900; m.dodgeCd = now + 3500;
        $('db-dodge')?.classList.add('fire');
        setTimeout(() => $('db-dodge')?.classList.remove('fire'), 500);
    }

    /* ---------- 전투 화면 ---------- */
    function buildBattleUI() {
        const el = $('dng-battle');
        document.body.classList.add('in-dng');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div class="db-top">
                <div class="db-boss">
                    <div class="db-bname"><b>${BOSS_NAME}</b><small style="color:${B.D.color}">${B.D.name}</small><span id="db-timer">3:00</span></div>
                    <div class="db-hpbar"><div id="db-hplag"></div><div id="db-hpfill"></div><span id="db-hptext"></span><i class="db-mark" style="left:30%"></i></div>
                    <div id="db-status" class="db-status"></div>
                </div>
                <button id="db-quit" class="db-quit">포기</button>
            </div>
            <div id="db-party" class="db-party"></div>
            <div id="db-warn" class="db-warn hidden"><b>⚠ 균열 폭발</b><span id="db-warn-t">3.0</span><small>터지는 순간 회피를 누르세요!</small></div>
            <div id="db-float" class="db-float"></div>
            <div id="db-hurt" class="db-hurt"></div>
            <div class="db-bottom">
                <div class="db-me">
                    <div class="db-me-top"><b>${esc(B.me.nick)}</b><small>공격력 ${fmt(B.atk)}</small></div>
                    <div class="db-mehp"><div id="db-mehpfill"></div><div id="db-meshield"></div><span id="db-mehptext"></span></div>
                </div>
                <div class="db-skills">
                    ${B.skills.map((s, i) => s ? `<button class="db-sk" data-dbsk="${i}" style="--sc:#${s.sk.color.toString(16).padStart(6, '0')}"><i class="db-sk-cd"></i><span class="db-sk-ico">${s.sk.icon}</span><b>${s.sk.name}</b><small>${esc(s.aura.name)}</small><em class="db-sk-t"></em></button>` : `<button class="db-sk empty" disabled><span class="db-sk-ico">·</span><b>빈 칸</b></button>`).join('')}
                    <button id="db-dodge" class="db-sk db-dodge"><i class="db-sk-cd"></i><span class="db-sk-ico">💨</span><b>회피</b><small>균열 폭발 피하기</small></button>
                </div>
            </div>
            <div id="db-dead" class="db-dead hidden"><b>쓰러졌어요</b><small>${B.roster.length > 1 ? '동료가 치유 스킬을 쓰면 부활해요' : '보스가 승리를 선언합니다…'}</small></div>
            <div id="db-result" class="db-result hidden"></div>`;
        el.onclick = e => {
            const sk = e.target.closest('[data-dbsk]');
            if (sk) { useSkill(+sk.dataset.dbsk); return; }
            if (e.target.closest('#db-dodge')) { dodge(); return; }
            if (e.target.closest('#db-quit')) { quit(); return; }
            if (e.target.closest('[data-dbdone]')) closeBattle();
        };
        drawUI(Date.now());
    }
    function drawUI(now) {
        if (!B) return;
        const b = B.boss, m = B.me;
        const k = b.max ? b.hp / b.max : 0;
        $('db-hpfill').style.width = (k * 100) + '%';
        $('db-hplag').style.width = (k * 100) + '%';
        $('db-hptext').textContent = `${fmt(Math.ceil(b.hp))} / ${fmt(b.max)}`;
        B.scene?.setHp(k);
        const left = B.host && B.sim ? Math.max(0, Math.ceil((B.sim.end - now) / 1000)) : b.left;
        $('db-timer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
        $('db-timer').classList.toggle('low', left <= 30);
        const chips = [];
        if (b.stun) chips.push('<span class="db-chip ice">❄ 기절</span>');
        if (b.enr) chips.push('<span class="db-chip rage">🔥 광폭화</span>');
        if (now < B.rally.until) chips.push(`<span class="db-chip rally">📯 피해 +${pct(B.rally.pct)}</span>`);
        if (B.dots.length) chips.push('<span class="db-chip burn">🔥 화상</span>');
        $('db-status').innerHTML = chips.join('');
        // 파티
        $('db-party').innerHTML = B.roster.length > 1 ? [...B.party.entries()].map(([uid, p]) => {
            const mine = uid === m.uid, hp = mine ? m.hp : p.hp, max = mine ? m.max : p.max, dead = mine ? m.dead : p.dead;
            return `<div class="db-pm ${dead ? 'dead' : ''} ${mine ? 'me' : ''}"><b>${esc(p.nick)}</b><div class="db-pm-bar"><div style="width:${max ? hp / max * 100 : 0}%"></div></div><small>${fmt(Math.round(mine ? m.dmg : p.dmg))}</small></div>`;
        }).join('') : '';
        // 나
        $('db-mehpfill').style.width = (m.hp / m.max * 100) + '%';
        $('db-meshield').style.width = Math.min(100, m.shield / m.max * 100) + '%';
        $('db-mehptext').textContent = `${fmt(Math.ceil(m.hp))} / ${fmt(m.max)}${m.shield ? `  🛡${fmt(Math.round(m.shield))}` : ''}`;
        $('db-hurt').classList.toggle('on', now - m.hurt < 250);
        $('db-dead').classList.toggle('hidden', !m.dead || B.over);
        // 스킬 쿨타임
        document.querySelectorAll('#dng-battle [data-dbsk]').forEach(btn => {
            const s = B.skills[+btn.dataset.dbsk], rem = Math.max(0, s.readyAt - now);
            btn.style.setProperty('--p', rem ? rem / (s.sk.cd * 1000) : 0);
            btn.classList.toggle('cool', rem > 0 || m.dead);
            btn.querySelector('.db-sk-t').textContent = rem ? (rem / 1000).toFixed(rem < 10000 ? 1 : 0) : '';
        });
        const dg = $('db-dodge'), drem = Math.max(0, m.dodgeCd - now);
        dg.style.setProperty('--p', drem / 3500);
        dg.classList.toggle('cool', drem > 0 || m.dead);
        dg.classList.toggle('urgent', !!B.charge && !m.dead);
        if (B.charge) $('db-warn-t').textContent = Math.max(0, (B.charge.at - now) / 1000).toFixed(1);
    }
    function showWarn() { $('db-warn')?.classList.remove('hidden'); }
    function hideWarn() { $('db-warn')?.classList.add('hidden'); }
    function floatText(txt, cls = 'dmg', x, y) {
        const box = $('db-float');
        if (!box || box.childElementCount > 26) return;
        const d = document.createElement('div');
        d.className = 'db-num ' + cls;
        d.textContent = txt;
        d.style.left = (x ?? 30 + Math.random() * 40) + '%';
        d.style.top = (y ?? 30 + Math.random() * 18) + '%';
        box.appendChild(d);
        setTimeout(() => d.remove(), cls.includes('big') ? 1600 : 950);
    }
    async function quit() {
        if (!B || B.over) return;
        const ok = await api.ask({ title: '던전을 포기할까요?', message: B.host && B.roster.length > 1 ? '방장이 나가면 파티 전원의 전투가 끝나요. 티켓은 돌려받지 못해요.' : '티켓은 돌려받지 못해요.', okText: '포기', danger: true });
        if (!ok || !B || B.over) return;
        if (B.sim) simEnd(false);
        else { B.me.dead = true; B.net.emit('act', { uid: B.me.uid, nick: B.me.nick, dmg: Math.round(B.me.pend), hp: 0, max: B.me.max, dead: true }); finish({ win: false, quit: true }); }
    }

    /* ---------- 결과 ---------- */
    function finish(m) {
        if (!B || B.over) return;
        B.over = true;
        clearInterval(B.timer);
        hideWarn();
        const s = st(), D = B.D, gs = api.gs();
        const won = !!m.win;
        const lines = [];
        let rare = null, rareAura = null;
        if (m.lost) { s.tk++; lines.push('🎟 티켓을 돌려받았어요'); }
        else if (won) {
            B.scene?.die();
            gs.jc += D.jc; lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(D.jc)}</span>`);
            api.passAddXp(D.xp); lines.push(`<span class="at-rw">🎫 ${fmt(D.xp)} XP</span>`);
            api.addItems(D.items); lines.push(api.rewardChips({ items: D.items }));
            if (D.extra && Math.random() < D.extra[1]) { api.addItems({ [D.extra[0]]: 1 }); lines.push(api.rewardChips({ items: { [D.extra[0]]: 1 } })); }
            if (Math.random() < D.egg[1]) { api.addEgg(D.egg[0]); lines.push(api.rewardChips({ eggs: { [D.egg[0]]: 1 } })); }
            for (const x of DROPS) {
                if (!(Math.random() < x.p[B.diff])) continue;
                if (x.kind === 'aura') { api.grantAura(x.id); rareAura = x.id; rare = `✦ 던전 칭호 「${esc(api.aura(x.id).name)}」`; lines.push(`<span class="at-rw dg-rare">${rare}</span>`); }
                else { const t = api.grantGear(x.id); rare = rare || `⚒ ${esc(api.gearName(x.id))}`; lines.push(`<span class="at-rw dg-rare">⚒ ${esc(api.gearName(x.id))} <small>${t}</small></span>`); }
            }
            s.clears[D.id] = (s.clears[D.id] || 0) + 1;
            api.dailyTrack('dungeon');
        } else {
            const frac = m.frac ?? (1 - B.boss.hp / B.boss.max);
            const jc = Math.round(D.jc * 0.3 * frac / 100) * 100;
            if (jc > 0) { gs.jc += jc; lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(jc)} <small>(위로금)</small></span>`); }
        }
        api.save(); api.renderStats();
        const dmg = m.dmg ? Object.entries(m.dmg).sort((a, b) => b[1][1] - a[1][1]) : [[B.me.uid, [B.me.nick, Math.round(B.me.dmg)]]];
        const total = dmg.reduce((a, [, v]) => a + v[1], 0) || 1;
        const title = m.lost ? '연결이 끊겼어요' : won ? 'VICTORY' : m.quit ? '포기했어요' : 'DEFEAT';
        setTimeout(() => {
            const el = $('db-result');
            if (!el) return;
            el.classList.remove('hidden');
            el.innerHTML = `
                <div class="db-res-box ${won ? 'win' : 'lose'}">
                    <div class="db-res-title">${title}</div>
                    <div class="db-res-sub">${BOSS_NAME} · <span style="color:${D.color}">${D.name}</span> · ${Math.round((Date.now() - B.t0) / 1000)}초</div>
                    ${rare ? `<div class="db-res-rare">${rare} 획득!</div>` : ''}
                    <div class="db-res-sec">피해 순위</div>
                    <div class="db-res-rank">${dmg.map(([uid, [nick, v]], i) => `<div class="db-res-row ${uid === B.me.uid ? 'me' : ''}"><span>${i + 1}</span><b>${esc(nick)}</b><div class="db-res-bar"><i style="width:${v / total * 100}%"></i></div><small>${fmt(v)}</small></div>`).join('')}</div>
                    <div class="db-res-sec">보상</div>
                    <div class="db-res-rw">${lines.join('') || '<small>보상 없음</small>'}</div>
                    <button class="btn btn-block ${won ? 'btn-gold' : ''}" data-dbdone>돌아가기</button>
                </div>`;
        }, won ? 1800 : 900);
        if (rareAura) api.broadcastAura?.(rareAura);
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
        onClose() { if (!party) closeLobby(); picking = -1; },
        bind() { $('dng-panel').addEventListener('click', onClick); },
        busy: () => !!B,
        ticketAdd(n) { st().tk += n; },
        tickets: () => st().tk,
        // 테스트·개발자용
        _dbg: () => ({ B, party, lobby })
    };
}
