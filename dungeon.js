/* =========================================================
   🌀 균열 레이드 (dungeon.js) — 포켓몬GO 레이드처럼
   - 레이드 칭호(16개 + 던전 칭호 2개)만 싸울 수 있음. 칭호마다 속성 · 기본기 · 필살기
   - 칭호 6개로 팀을 짜서 입장 → 앞의 칭호가 쓰러지면 다음 칭호가 나옴, 전멸하면 재정비 후 다시
   - 화면을 탭(꾹 누르기)하면 기본기 → 에너지가 차면 필살기, 좌우로 밀면 회피
   - 보스 약점 속성이면 피해 ×1.6, 저항 속성이면 ×0.625
   - 이기면 포획 단계: 구슬을 던져 던전 칭호를 붙잡음
   - 솔로: 서버 없음 / 파티(최대 4명): Supabase 실시간 채널 (DB 저장 없음, 보스 체력만 같이 깎음)
   - 던전 티켓 + 하루 3판까지
   ========================================================= */

export const ELEMENTS = {
    fire:  { name: '불',   icon: '🔥', color: '#ff7a2a', fx: 'burn',   fast: { name: '불꽃 튀기기',   pw: 10, t: 0.7, en: 7 }, charged: { name: '화염 폭발',     pw: 90,  cost: 50 } },
    ice:   { name: '얼음', icon: '❄', color: '#7ae8ff', fx: 'freeze', fast: { name: '얼음 조각',     pw: 9,  t: 0.6, en: 8 }, charged: { name: '눈보라',        pw: 140, cost: 100 } },
    volt:  { name: '번개', icon: '⚡', color: '#ffe14d', fx: 'chain',  fast: { name: '전기 쇼크',     pw: 7,  t: 0.5, en: 9 }, charged: { name: '낙뢰',          pw: 55,  cost: 33 } },
    light: { name: '빛',   icon: '✨', color: '#fff3a0', fx: 'strike', fast: { name: '빛의 화살',     pw: 11, t: 0.8, en: 7 }, charged: { name: '성스러운 심판', pw: 100, cost: 50 } },
    dark:  { name: '어둠', icon: '🌑', color: '#a070ff', fx: 'drain',  fast: { name: '그림자 할퀴기', pw: 10, t: 0.7, en: 7 }, charged: { name: '암흑 파동',     pw: 70,  cost: 33 } },
    rift:  { name: '균열', icon: '🌀', color: '#ff6ad8', fx: 'rend',   fast: { name: '균열 손톱',     pw: 12, t: 0.7, en: 8 }, charged: { name: '차원 붕괴',     pw: 160, cost: 100 } }
};
export const BOSS = { name: '균열의 군주', weak: 'light', resist: 'dark' };
const effOf = el => el === BOSS.weak ? 1.6 : el === BOSS.resist ? 0.625 : 1;

// 레이드에 나갈 수 있는 칭호 (속성)
export const RAID_AURAS = {
    ep_fire_jisung: 'fire', ep_frozen_byungeun: 'ice',
    leg_storm_gaeun: 'volt', legend_wizard: 'light', leg_necro_tv: 'dark',
    myth_phoenix_gaeun: 'fire', myth_aurora_gaeun: 'ice', myth_thunderbeast_minchae: 'volt', myth_dragonknight_minchae: 'light',
    anc_iceemperor_tv: 'ice', anc_vampire_gunwoo: 'dark', divine_knight_gaen_sword: 'light',
    abs_archdemon_tv: 'fire', abs_breaker_byungeun: 'volt',
    js_lightning_jisung: 'volt', jxs_creator_gaeun: 'light',
    dng_riftwalker: 'rift', dng_riftlord: 'rift'
};
const GRADE_STAT = { EPIC: [600, 4000], LEGEND: [900, 5500], MYTHIC: [1300, 7500], ANCIENT: [1800, 10000], ABSOLUTE: [2400, 13000], JXS: [3200, 17000] };
const STAT_OVERRIDE = { dng_riftwalker: [1500, 8000], dng_riftlord: [2700, 14000] };
export function raidInfo(a) {
    const el = a && RAID_AURAS[a.id];
    if (!el) return null;
    const [atk, hp] = STAT_OVERRIDE[a.id] || GRADE_STAT[a.grade];
    return { el, E: ELEMENTS[el], atk, hp, eff: effOf(el) };
}

export const DIFFS = [
    { id: 'easy',   star: 1, label: '쉬움',   color: '#5fe08a', hp: 20000,  hit: 120, slam: 600,  jc: 60000,   xp: 1500, items: { limit_potion: 1 },                    egg: ['egg_basic', 0.2],   catchP: null },
    { id: 'normal', star: 3, label: '보통',   color: '#ffd23a', hp: 60000,  hit: 300, slam: 1200, jc: 200000,  xp: 3000, items: { limit_potion: 2, star_potion: 1 },    egg: ['egg_rare', 0.25],   catchP: { walker: 0.03, lord: 0, lordP: 0 } },
    { id: 'hard',   star: 5, label: '어려움', color: '#ff8a3a', hp: 200000, hit: 500, slam: 2200, jc: 600000,  xp: 5000, items: { overcome_potion: 1, dice_potion: 1 }, egg: ['egg_legend', 0.25], catchP: { walker: 0.06, lord: 0.03, lordP: 0.03 } },
    { id: 'hell',   star: 6, label: '지옥',   color: '#ff2a4a', hp: 500000, hit: 800, slam: 3500, jc: 1800000, xp: 8000, items: { heaven_potion: 1 },                   egg: ['egg_mythic', 0.25], catchP: { walker: 0.10, lord: 0.04, lordP: 0.10 }, extra: ['void_potion', 0.3] }
];
// 레이드 클리어 시 장비 드롭 (난이도별 확률)
export const DROPS = [
    { id: 'gear_riftbreaker', p: [0, 0.02, 0.05, 0.12] },
    { id: 'amu_riftcore',     p: [0, 0.03, 0.07, 0.15] }
];
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
    let party = null;     // 파티 대기실
    let lobby = null;     // 열린 파티 목록 채널
    let B = null;         // 진행 중인 레이드

    function st() {
        const gs = api.gs();
        if (!gs.dng) gs.dng = { tk: TICKET_DAILY, day: '', clears: {} };
        const s = gs.dng;
        if (!s.clears) s.clears = {};
        if (!Array.isArray(s.team) || s.team.length !== TEAM) s.team = Array(TEAM).fill(null);
        const today = api.today();
        if (s.day !== today) { s.day = today; s.tk = Math.max(s.tk || 0, TICKET_DAILY); s.runs = 0; }
        s.runs = s.runs || 0;
        return s;
    }
    const owned = id => id && (api.gs().inventory[id] || 0) > 0;
    const team = () => st().team.map(id => owned(id) && RAID_AURAS[id] ? id : null);
    const unlocked = i => i === 0 || (st().clears[DIFFS[i - 1].id] || 0) > 0;
    const runsLeft = () => Math.max(0, RUN_CAP - st().runs);
    const canPlay = () => st().tk > 0 && runsLeft() > 0 && team().some(Boolean);
    const whyNot = () => !team().some(Boolean) ? '레이드 팀에 칭호를 넣어 주세요' : runsLeft() <= 0 ? `오늘은 ${RUN_CAP}판을 다 했어요` : st().tk <= 0 ? '던전 티켓이 없어요' : '';

    // 장비·부적·펫 보너스 (공격 배율 / 체력 배율)
    function mults() {
        const g = api.gear(), am = api.amu(), pet = api.pet();
        const gm = 1 + (g?.luckBonus || 0) * 0.12 + (g?.dngAtk || 0);
        const amm = am.abil === 'rift' ? am.riftAtk : 1;
        const pm = 1 + (pet.luck || 0) * 0.1 + (pet.speed || 0) * 0.2;
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
    function bossCard() {
        const D = DIFFS[selDiff], W = ELEMENTS[BOSS.weak], R = ELEMENTS[BOSS.resist];
        return `
            <div class="rd-boss" style="--dc:${D.color}">
                <div class="rd-boss-art"><div class="dg-rift"><i></i><i></i><i></i></div></div>
                <div class="rd-boss-txt">
                    <small>RIFT RAID · <span>${stars(D.star)}</span></small>
                    <b>${BOSS.name}</b>
                    <div class="rd-tags"><span class="rd-tag weak">약점 ${W.icon} ${W.name}</span><span class="rd-tag resist">저항 ${R.icon} ${R.name}</span></div>
                </div>
            </div>`;
    }
    function starsRow(disabled) {
        const s = st();
        return `<div class="rd-stars">${DIFFS.map((d, i) => `<button class="rd-star ${i === selDiff ? 'on' : ''} ${unlocked(i) ? '' : 'lock'}" style="--dc:${d.color}" data-dgdiff="${i}" ${disabled ? 'disabled' : ''}><b>${unlocked(i) ? stars(d.star) : '🔒'}</b><small>${d.label}${s.clears[d.id] ? ' ✓' : ''}</small></button>`).join('')}</div>`;
    }
    function rewardsHtml() {
        const D = DIFFS[selDiff], c = D.catchP;
        return `<div class="rd-rw">
            <div class="rd-rw-row">${api.rewardChips({ jc: D.jc, items: D.items })}<span class="at-rw">🎫 ${fmt(D.xp)} XP</span></div>
            <div class="rd-rw-row"><span class="at-rw">🥚 ${api.eggName(D.egg[0])} ${Math.round(D.egg[1] * 100)}%</span>${D.extra ? `<span class="at-rw">${api.itemName(D.extra[0])} ${Math.round(D.extra[1] * 100)}%</span>` : ''}${DROPS.filter(x => x.p[selDiff]).map(x => `<span class="at-rw rd-gear">⚒ ${esc(api.gearName(x.id))} ${Math.round(x.p[selDiff] * 1000) / 10}%</span>`).join('')}</div>
            <div class="rd-rw-note">${c ? `🎯 클리어하면 포획 단계 — 「${esc(api.aura('dng_riftwalker').name)}」${c.lordP ? ` · ${Math.round(c.lordP * 100)}% 확률로 「${esc(api.aura('dng_riftlord').name)}」 등장` : ''}` : '★1은 포획 단계가 없어요'}</div>
        </div>`;
    }
    function teamHtml(disabled) {
        return `<div class="rd-team">${team().map((id, i) => {
            if (!id) return `<button class="rd-mem empty" data-dgslot="${i}" ${disabled ? 'disabled' : ''}><i>+</i></button>`;
            const x = member(id);
            return `<button class="rd-mem" data-dgslot="${i}" style="--ec:${x.E.color}" ${disabled ? 'disabled' : ''}>
                <span class="rd-mem-el">${x.E.icon}</span>${x.eff > 1 ? '<span class="rd-mem-up">약점</span>' : x.eff < 1 ? '<span class="rd-mem-down">저항</span>' : ''}
                <b>${esc(x.a.name)}</b><small>${fmt(x.atk)}</small>
            </button>`;
        }).join('')}</div>`;
    }
    function mainView() {
        const s = st(), D = DIFFS[selDiff], m = mults(), lock = !unlocked(selDiff), why = lock ? `${DIFFS[selDiff - 1]?.label}을 먼저 깨야 해요` : whyNot();
        return `
            ${bossCard()}
            ${starsRow(false)}
            <button class="rd-line" data-dg="rw"><span>체력 <b>${fmt(D.hp)}</b></span><span>제한 <b>3분</b></span><span class="rd-line-rw">보상 ${showRw ? '▴' : '▾'}</span></button>
            ${showRw ? rewardsHtml() : ''}
            <div class="rd-head"><span>레이드 팀</span><small>전투력 ${fmt(power())}</small><button class="rd-auto" data-dg="auto">자동 편성</button></div>
            ${teamHtml(false)}
            <div class="rd-mult">장비 ×${m.gm.toFixed(2)} · 부적 ×${m.amm.toFixed(2)} · 펫 ×${m.pm.toFixed(2)}</div>
            <div class="rd-foot">
                <div class="rd-count">
                    <span>오늘 <b>${s.runs}</b>/${RUN_CAP}판</span>
                    <span>🎟 티켓 <b>${s.tk}</b> <button class="rd-buy" data-dg="buy" ${api.gs().jc >= TICKET_PRICE ? '' : 'disabled'}>+ ${fmt(TICKET_PRICE / 10000)}만</button></span>
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
        if (party) return head + bossCard() + starsRow(party.role !== 'host') + lobbyHtml();
        const rooms = lobby ? [...lobby.rooms.values()].filter(r => Date.now() - r.at < 7000) : [];
        return `${head}
            <button class="btn btn-block btn-primary rd-make" data-dg="host" ${canPlay() && unlocked(selDiff) ? '' : 'disabled'}>방 만들기 <small>${DIFFS[selDiff].label} ${stars(DIFFS[selDiff].star)}</small></button>
            ${canPlay() ? '' : `<div class="rd-why">${whyNot()}</div>`}
            <div class="rd-join"><input id="dg-code" inputmode="numeric" maxlength="4" placeholder="방 번호"><button class="btn" data-dg="join">참가</button></div>
            <div class="rd-head"><span>열린 방</span><small>${lobby ? '' : '연결 중…'}</small></div>
            <div class="rd-rooms">${rooms.length ? rooms.map(r => `<button class="rd-room" data-dgroom="${r.code}" style="--dc:${DIFFS[r.diff]?.color}"><b>${esc(r.host)}</b><span>${stars(DIFFS[r.diff]?.star || 1)}</span><small>${r.n}/${MAX_PARTY}명 · #${r.code}</small></button>`).join('') : '<div class="rd-empty">열린 방이 없어요</div>'}</div>`;
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
                                <span class="rd-pk-el">${x.E.icon}<small>${x.E.name}</small></span>
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
        const t = e.target.closest('[data-dg],[data-dgslot],[data-dgdiff],[data-dgpick],[data-dgroom]');
        if (!t) { if (e.target.classList.contains('dg-picker')) { picking = -1; render(); } return; }
        const d = t.dataset, s = st();
        if (d.dgslot !== undefined) { picking = +d.dgslot; render(); return; }
        if (d.dgpick !== undefined) { s.team[picking] = d.dgpick || null; picking = -1; api.save(); render(); return; }
        if (d.dgdiff !== undefined) { const i = +d.dgdiff; if (!unlocked(i)) { api.toast(`${DIFFS[i - 1].label}을 먼저 깨야 해요`, 'bad'); return; } selDiff = i; render(); return; }
        if (d.dgroom) { joinParty(d.dgroom); return; }
        switch (d.dg) {
            case 'pkclose': picking = -1; render(); break;
            case 'rw': showRw = !showRw; render(); break;
            case 'auto': autoTeam(); break;
            case 'buy': {
                const gs = api.gs();
                if (gs.jc < TICKET_PRICE) return;
                gs.jc -= TICKET_PRICE; s.tk++; api.save(); api.renderStats(); render();
                api.toast('🎟 던전 티켓 +1', 'gold');
                break;
            }
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
            p.net.send('roster', { code: p.code, diff: selDiff, ps: p.roster });
            lobby?.net.send('room', { code: p.code, host: p.roster[0].nick, n: p.roster.length, diff: selDiff });
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
            render();
        });
        p.net.on('full', m => { if (m.uid === me) { api.toast('파티가 가득 찼어요', 'bad'); leaveParty(true); } });
        p.net.on('closed', () => { if (party === p) { api.toast('방장이 방을 닫았어요', 'bad'); leaveParty(true); } });
        p.net.on('start', m => {
            if (party !== p || !(m.ps || []).some(r => r.uid === me)) return;
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
        p.net.send('start', { diff: selDiff, ps: roster });
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
        const bossMax = Math.round(D.hp * (1 + 0.6 * (roster.length - 1)));
        const mem = team().filter(Boolean).map(member);
        mem.forEach(x => { x.hp = x.max; });
        B = {
            diff, D, net, host, roster, scene: null, over: false, t0: now, last: now, lastSt: now, end: now + TIME * 1000,
            me: { uid: me.uid, nick: me.nick, dmg: 0, pend: 0 },
            team: mem, cur: 0, busyUntil: now + 1200, holding: false, dodgeUntil: 0, rejoinUntil: 0,
            nextHit: now + 3000, nextCharge: now + 9000, tele: null,
            boss: { hp: bossMax, max: bossMax },
            party: new Map(roster.map(r => [r.uid, { nick: r.nick, dmg: 0 }])),
            repT: 0.6
        };
        if (host) B.sim = { hp: bossMax, max: bossMax, end: now + TIME * 1000, over: false, stT: 0, ps: Object.fromEntries(roster.map(r => [r.uid, { nick: r.nick, dmg: 0, last: now }])) };
        wireNet();
        api.setBusy(true);
        buildBattleUI();
        import('./boss3d.js?v=58').then(({ createBossScene }) => {
            if (!B || B.net !== net) return;
            B.scene = createBossScene();
            api.setTakeover(B.scene);
        }).catch(e => console.warn(e));
        B.timer = setInterval(tick, 50);
        floatText(`${BOSS.name} ${stars(D.star)}`, 'big', 50, 30);
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
        net.on('fx', f => { if (B && !B.over && f?.from !== B.me.nick) B.scene?.skillFx(f.type, f.color); });
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
            floatText('다시 도전!', 'big', 50, 40);
        }
        if (!B.rejoinUntil) {
            if (B.holding) fastAttack();
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
            B.tele = { at: now + 1600, d: D.slam };
            B.scene?.charge(1.6); flash(true);
            B.nextCharge = now + 9000 + Math.random() * 3000;
            return;
        }
        if (now >= B.nextHit) {
            B.scene?.attack();
            B.nextHit = now + 2000 + Math.random() * 700;
            const at = now + 450;
            setTimeout(() => { if (B && !B.over && !B.rejoinUntil) hurt(D.hit, Date.now() <= B.dodgeUntil + 100 && B.dodgeUntil >= at - 500, false); }, 450);
        }
    }
    function hurt(d, dodged, big) {
        const x = curM();
        if (!x || x.dead) return;
        const v = Math.round(d * (dodged ? 0.25 : 1));
        x.hp -= v;
        x.en = Math.min(100, x.en + v / x.max * 40);   // 맞으면 에너지가 조금 참
        B.hurtAt = Date.now();
        floatText(dodged ? `회피! -${fmt(v)}` : `-${fmt(v)}`, dodged ? 'dodge' : 'hurt', 30, 74);
        try { navigator.vibrate?.(big && !dodged ? 160 : 30); } catch (e) {}
        if (big && !dodged) B.scene?.shake(0.6);
        if (x.hp <= 0) { x.hp = 0; x.dead = true; floatText(`${x.a.name} 쓰러짐!`, 'hurt', 30, 66); setTimeout(nextAlive, 600); }
    }
    function nextAlive() {
        if (!B || B.over) return;
        const i = B.team.findIndex(x => !x.dead);
        if (i < 0) {
            B.rejoinUntil = Date.now() + REJOIN_MS; B.tele = null; flash(false); B.holding = false;
            return;
        }
        B.cur = i; B.busyUntil = Date.now() + 700;
        floatText(`가라, ${B.team[i].a.name}!`, 'swap', 30, 66);
    }
    function fastAttack() {
        const x = curM(), now = Date.now();
        if (!x || x.dead || B.over || B.rejoinUntil || now < B.busyUntil) return;
        const F = x.E.fast;
        B.busyUntil = now + F.t * 1000;
        x.en = Math.min(100, x.en + F.en);
        deal(F.pw * x.atk / 100 * x.eff, false, x);
    }
    function chargedAttack() {
        const x = curM(), now = Date.now();
        if (!x || x.dead || B.over || B.rejoinUntil || now < B.busyUntil) return;
        const C = x.E.charged;
        if (x.en < C.cost) return;
        x.en -= C.cost;
        B.busyUntil = now + 1300;
        B.scene?.skillFx(x.E.fx, parseInt(x.E.color.slice(1), 16));
        B.net.send('fx', { type: x.E.fx, color: parseInt(x.E.color.slice(1), 16), from: B.me.nick });
        floatText(C.name, 'move', 50, 44);
        setTimeout(() => {
            if (!B || B.over) return;
            deal(C.pw * x.atk / 100 * x.eff, true, x);
            if (x.eff > 1) floatText('효과가 굉장했다!', 'eff up', 50, 52);
            else if (x.eff < 1) floatText('효과가 별로인 듯하다…', 'eff down', 50, 52);
        }, 450);
    }
    function dodge(dir) {
        const now = Date.now();
        if (!B || B.over || B.rejoinUntil || curM()?.dead || now < B.dodgeUntil + 300) return;
        B.dodgeUntil = now + 600;
        B.busyUntil = Math.max(B.busyUntil, now + 450);
        const el = $('db-stage');
        el?.classList.remove('dl', 'dr'); void el?.offsetWidth; el?.classList.add(dir < 0 ? 'dl' : 'dr');
    }
    function swapTo(i) {
        const now = Date.now(), x = B?.team[i];
        if (!x || x.dead || B.cur === i || B.rejoinUntil || now < B.busyUntil) return;
        B.cur = i; B.busyUntil = now + 700;
        floatText(`가라, ${x.a.name}!`, 'swap', 30, 66);
    }
    function deal(n, big, x) {
        const v = Math.round(n);
        B.me.pend += v; B.me.dmg += v;
        B.boss.hp = Math.max(0, B.boss.hp - v);
        floatText(fmt(v), big ? 'crit' : x.eff > 1 ? 'dmg up' : 'dmg');
        B.scene?.hit(big ? 0.9 : 0.12, big ? 0xffd23a : 0xffffff);
    }

    /* ---------- 전투 화면 ---------- */
    function buildBattleUI() {
        const el = $('dng-battle');
        document.body.classList.add('in-dng');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div id="db-stage" class="db-stage"></div>
            <div id="db-flash" class="db-flash"></div>
            <div class="db-top">
                <div class="db-boss">
                    <div class="db-bname"><b>${BOSS.name}</b><small style="color:${B.D.color}">${stars(B.D.star)}</small><span id="db-timer">3:00</span></div>
                    <div class="db-hpbar"><div id="db-hplag"></div><div id="db-hpfill"></div><span id="db-hptext"></span></div>
                </div>
                <button id="db-quit" class="db-quit">나가기</button>
            </div>
            <div id="db-party" class="db-party"></div>
            <div id="db-float" class="db-float"></div>
            <div id="db-hurt" class="db-hurt"></div>
            <div class="db-hint" id="db-hint">탭 · 꾹 눌러 공격 &nbsp;|&nbsp; 좌우로 밀어 회피</div>
            <div class="db-bottom">
                <div class="db-curbox">
                    <div class="db-cur" id="db-cur"></div>
                    <div class="db-team" id="db-team"></div>
                </div>
                <button id="db-charged" class="db-charged"><div class="db-ch-segs" id="db-segs"></div><b id="db-ch-name"></b></button>
            </div>
            <div id="db-rejoin" class="db-rejoin hidden"><b>팀 전멸</b><small>재정비 중… <span id="db-rj-t">8</span>초 뒤 다시 들어가요</small></div>
            <div id="db-catch" class="db-catch hidden"></div>
            <div id="db-result" class="db-result hidden"></div>`;
        // 화면 조작: 누르면 공격(꾹 누르면 계속), 좌우로 밀면 회피
        const stage = $('db-stage');
        let sx = 0, sy = 0, moved = false;
        stage.onpointerdown = e => { sx = e.clientX; sy = e.clientY; moved = false; if (B) { B.holding = true; fastAttack(); } try { stage.setPointerCapture(e.pointerId); } catch (er) {} };
        stage.onpointermove = e => {
            if (!B || moved) return;
            const dx = e.clientX - sx;
            if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(e.clientY - sy)) { moved = true; B.holding = false; dodge(Math.sign(dx)); }
        };
        stage.onpointerup = stage.onpointercancel = () => { if (B) B.holding = false; };
        el.onclick = e => {
            const sw = e.target.closest('[data-dbsw]');
            if (sw) { swapTo(+sw.dataset.dbsw); return; }
            if (e.target.closest('#db-charged')) { chargedAttack(); return; }
            if (e.target.closest('#db-quit')) { quit(); return; }
            if (e.target.closest('[data-dbthrow]')) { throwBall(); return; }
            if (e.target.closest('[data-dbdone]')) closeBattle();
        };
        drawUI(Date.now());
    }
    function flash(on) { $('db-flash')?.classList.toggle('on', on); }
    function drawUI(now) {
        if (!B) return;
        const b = B.boss, k = b.max ? b.hp / b.max : 0;
        $('db-hpfill').style.width = (k * 100) + '%';
        $('db-hplag').style.width = (k * 100) + '%';
        $('db-hptext').textContent = `${fmt(Math.ceil(b.hp))} / ${fmt(b.max)}`;
        const left = Math.max(0, Math.ceil(((B.sim ? B.sim.end : B.end) - now) / 1000));
        const tm = $('db-timer');
        tm.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
        tm.classList.toggle('low', left <= 30);
        $('db-party').innerHTML = B.roster.length > 1 ? [...B.party.entries()].map(([uid, p]) => `<div class="db-pm ${uid === B.me.uid ? 'me' : ''}"><b>${esc(p.nick)}</b><small>${fmt(uid === B.me.uid ? Math.round(B.me.dmg) : p.dmg)}</small></div>`).join('') : '';
        const x = curM();
        $('db-cur').innerHTML = x ? `<div class="db-cur-top" style="--ec:${x.E.color}"><span>${x.E.icon}</span><b>${esc(x.a.name)}</b></div><div class="db-cur-hp"><div style="width:${x.hp / x.max * 100}%" class="${x.hp / x.max < 0.25 ? 'low' : ''}"></div><span>${fmt(Math.ceil(x.hp))} / ${fmt(x.max)}</span></div>` : '';
        $('db-team').innerHTML = B.team.map((m, i) => `<button class="db-tm ${i === B.cur ? 'on' : ''} ${m.dead ? 'dead' : ''}" data-dbsw="${i}" style="--ec:${m.E.color}"><span>${m.E.icon}</span><i style="height:${m.hp / m.max * 100}%"></i></button>`).join('');
        if (x) {
            const C = x.E.charged, n = Math.round(100 / C.cost);
            $('db-segs').innerHTML = Array.from({ length: n }, (_, i) => `<i><b style="width:${Math.max(0, Math.min(1, (x.en - i * C.cost) / C.cost)) * 100}%"></b></i>`).join('');
            $('db-ch-name').textContent = C.name;
            const ch = $('db-charged');
            ch.style.setProperty('--ec', x.E.color);
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
        d.style.left = (x ?? 34 + Math.random() * 32) + '%';
        d.style.top = (y ?? 32 + Math.random() * 16) + '%';
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

    /* ---------- 결과 · 포획 ---------- */
    function finish(m) {
        if (!B || B.over) return;
        B.over = true;
        B.holding = false;
        clearInterval(B.timer);
        flash(false);
        $('db-hint')?.classList.add('fade');
        const s = st(), D = B.D, gs = api.gs();
        B.lines = []; B.won = !!m.win; B.result = m;
        if (m.lost) { s.tk++; s.runs = Math.max(0, s.runs - 1); B.lines.push('<span class="at-rw">🎟 티켓·입장 횟수를 돌려받았어요</span>'); }
        else if (B.won) {
            B.scene?.die();
            gs.jc += D.jc; B.lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(D.jc)}</span>`);
            api.passAddXp(D.xp); B.lines.push(`<span class="at-rw">🎫 ${fmt(D.xp)} XP</span>`);
            api.addItems(D.items); B.lines.push(api.rewardChips({ items: D.items }));
            if (D.extra && Math.random() < D.extra[1]) { api.addItems({ [D.extra[0]]: 1 }); B.lines.push(api.rewardChips({ items: { [D.extra[0]]: 1 } })); }
            if (Math.random() < D.egg[1]) { api.addEgg(D.egg[0]); B.lines.push(api.rewardChips({ eggs: { [D.egg[0]]: 1 } })); }
            for (const x of DROPS) if (Math.random() < x.p[B.diff]) { const t = api.grantGear(x.id); B.rare = `⚒ ${esc(api.gearName(x.id))}`; B.lines.push(`<span class="at-rw dg-rare">⚒ ${esc(api.gearName(x.id))} <small>${t}</small></span>`); }
            s.clears[D.id] = (s.clears[D.id] || 0) + 1;
            api.dailyTrack('dungeon');
        } else {
            const frac = m.frac ?? (1 - B.boss.hp / B.boss.max);
            const jc = Math.round(D.jc * 0.3 * frac / 100) * 100;
            if (jc > 0) { gs.jc += jc; B.lines.push(`<span class="at-rw"><i class="coin"></i>${fmt(jc)} <small>(위로금)</small></span>`); }
        }
        api.save(); api.renderStats();
        if (B.won && D.catchP) setTimeout(startCatch, 2000);
        else setTimeout(showResult, B.won ? 1800 : 900);
    }
    // 포획: 줄어드는 고리가 작을 때 던질수록 잘 잡힘
    function startCatch() {
        if (!B) return;
        const c = B.D.catchP;
        const lord = c.lordP && Math.random() < c.lordP;
        const id = lord ? 'dng_riftlord' : 'dng_riftwalker';
        const ranks = B.result.dmg ? Object.entries(B.result.dmg).sort((a, b) => b[1][1] - a[1][1]) : [];
        const top = ranks.length > 1 && ranks[0][0] === B.me.uid;
        B.catch = { id, rate: lord ? c.lord : c.walker, balls: 5 + (B.roster.length - 1) + (top ? 1 : 0), t0: performance.now(), busy: false, done: false, bonus: [B.roster.length > 1 ? `파티 +${B.roster.length - 1}` : '', top ? '피해 1등 +1' : ''].filter(Boolean) };
        const a = api.aura(id), el = $('db-catch');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div class="dc-title">${lord ? '✦ 균열의 지배자가 나타났다!' : '흩어지는 균열의 기운을 붙잡으세요'}</div>
            <div class="dc-target" style="--c:${a.color}">
                <div class="dc-orb"></div><div class="dc-ring" id="dc-ring"></div>
                <div class="dc-name ${api.gradeCol(a.grade)}"><small>${a.grade}</small>${esc(a.name)}</div>
                <div class="dc-ball hidden" id="dc-ball"></div>
            </div>
            <div class="dc-msg" id="dc-msg">고리가 작을 때 던지면 더 잘 잡혀요</div>
            <button class="dc-throw" data-dbthrow><i class="dc-ball-ico"></i><b>던지기</b><small id="dc-left"></small></button>
            ${B.catch.bonus.length ? `<div class="dc-bonus">구슬 보너스: ${B.catch.bonus.join(' · ')}</div>` : ''}`;
        const loop = () => {
            if (!B?.catch || B.catch.done) return;
            const k = ((performance.now() - B.catch.t0) % 1700) / 1700;
            const r = $('dc-ring');
            if (r && !B.catch.busy) { r.style.transform = `translate(-50%, -50%) scale(${1 - 0.72 * k})`; r.style.borderColor = 1 - 0.72 * k < 0.45 ? '#ff4a6a' : 1 - 0.72 * k < 0.65 ? '#ffd23a' : '#6ff2c0'; }
            $('dc-left').textContent = `구슬 ${B.catch.balls}개`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    function throwBall() {
        const C = B?.catch;
        if (!C || C.busy || C.done || C.balls <= 0) return;
        C.busy = true; C.balls--;
        const k = ((performance.now() - C.t0) % 1700) / 1700, size = 1 - 0.72 * k;
        const [q, mul] = size < 0.45 ? ['Excellent!', 2] : size < 0.65 ? ['Great!', 1.6] : size < 0.85 ? ['Nice!', 1.3] : ['', 1];
        const ok = Math.random() < Math.min(1, C.rate * mul);
        const ball = $('dc-ball'), msg = $('dc-msg');
        ball.classList.remove('hidden', 'shake', 'pop', 'got'); void ball.offsetWidth; ball.classList.add('fly');
        msg.textContent = q || '…';
        const shakes = ok ? 3 : 1 + Math.floor(Math.random() * 3);
        setTimeout(() => { ball.classList.remove('fly'); ball.classList.add('shake'); ball.style.setProperty('--n', shakes); }, 600);
        setTimeout(() => {
            ball.classList.remove('shake');
            if (ok) {
                C.done = true; ball.classList.add('got');
                msg.textContent = '잡았다!';
                api.grantAura(C.id);
                api.broadcastAura?.(C.id);
                B.rare = `✦ 「${esc(api.aura(C.id).name)}」`;
                B.lines.unshift(`<span class="at-rw dg-rare">✦ 던전 칭호 「${esc(api.aura(C.id).name)}」</span>`);
                api.save();
                setTimeout(showResult, 1600);
            } else {
                ball.classList.add('pop');
                msg.textContent = C.balls > 0 ? '아앗! 빠져나왔다!' : '균열의 기운이 사라졌다…';
                C.busy = false;
                if (C.balls <= 0) { C.done = true; setTimeout(showResult, 1500); }
            }
        }, 600 + shakes * 650 + 200);
    }
    function showResult() {
        if (!B) return;
        $('db-catch')?.classList.add('hidden');
        const m = B.result, D = B.D;
        const dmg = m.dmg ? Object.entries(m.dmg).sort((a, b) => b[1][1] - a[1][1]) : [[B.me.uid, [B.me.nick, Math.round(B.me.dmg)]]];
        const total = dmg.reduce((a, [, v]) => a + v[1], 0) || 1;
        const title = m.lost ? '연결이 끊겼어요' : B.won ? 'VICTORY' : m.quit ? '나갔어요' : 'TIME OVER';
        const el = $('db-result');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div class="db-res-box ${B.won ? 'win' : 'lose'}">
                <div class="db-res-title">${title}</div>
                <div class="db-res-sub">${BOSS.name} <span style="color:${D.color}">${stars(D.star)}</span> · ${Math.round((Date.now() - B.t0) / 1000)}초</div>
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
        _dbg: () => ({ B, party, lobby })
    };
}
