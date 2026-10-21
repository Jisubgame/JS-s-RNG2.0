/* =========================================================
   🕺 칭호별 포즈 (poses.js)
   매 프레임 pose(t, d, rolling) 가 불려서 캐릭터 관절을 정함.
   d = { root, head, torso, armL, armR, legL, legR } (각각 rotation/position 있음)

   방향 메모 (캐릭터는 화면 쪽 +z 를 봄)
     팔 rotation.x 가 음수  → 팔이 앞으로 (-1.57 이면 앞으로 쭉)
     armR.rotation.z 가 양수 / armL.rotation.z 가 음수 → 팔을 옆으로 벌림 (±1.57 수평, ±2.9 위로)
     다리 rotation.x 음수 → 다리가 앞으로
     root.rotation.x 양수 → 몸이 앞으로 숙여짐
   ========================================================= */

const S = Math.sin, C = Math.cos;
const set = (o, x = 0, y = 0, z = 0) => o.rotation.set(x, y, z);
// 0~1 사이를 부드럽게 오가는 주기 (period 초마다 한 번, 0~dur 구간에 1까지 올라갔다 내려옴)
const pulse = (t, period, dur, offset = 0) => {
    const k = ((t + offset) % period) / dur;
    return k < 1 ? S(k * Math.PI) : 0;
};
const mix = (a, b, k) => a + (b - a) * k;

export const POSES = {
    /* ---------- COMMON ---------- */
    // 평범한 김티비: 가만히 서서 두리번
    com_normal(t, d) {
        d.head.rotation.y = S(t * 0.6) * 0.45;
        set(d.armL, 0, 0, -0.06); set(d.armR, 0, 0, 0.06);
    },
    // 하품하는 박지성: 4초마다 기지개 + 고개 젖힘
    com_sleepy_jisung(t, d) {
        const k = pulse(t, 5, 1.8);
        set(d.armL, 0, 0, -0.08 - k * 2.7); set(d.armR, 0, 0, 0.08 + k * 2.7);
        d.head.rotation.x = -k * 0.4 + (1 - k) * 0.15;
        d.root.rotation.x = 0.05 - k * 0.08;
    },
    // 그저 공병은: 주머니에 손, 짝다리
    com_just_byungeun(t, d) {
        set(d.armL, 0.12, 0, 0.04); set(d.armR, 0.12, 0, -0.04);
        d.root.rotation.z = 0.05 + S(t * 0.8) * 0.02;
        set(d.legL, 0, 0, -0.08);
        d.head.rotation.z = -0.08;
    },

    /* ---------- UNCOMMON ---------- */
    // 뛰어가는 김민채: 제자리 달리기
    unc_running(t, d) {
        const s = S(t * 9);
        set(d.legL, s * 0.8); set(d.legR, -s * 0.8);
        set(d.armL, -s * 0.9, 0, -0.1); set(d.armR, s * 0.9, 0, 0.1);
        d.root.rotation.x = 0.12;
        d.root.position.y += Math.abs(S(t * 9)) * 0.15;
    },
    // 피곤한 박지성: 구부정, 고개 푹, 가끔 꾸벅
    unc_tired(t, d) {
        const nod = pulse(t, 4.5, 1.2);
        d.root.rotation.x = 0.15;
        d.head.rotation.x = 0.45 + nod * 0.35;
        set(d.armL, -0.15, 0, 0.05); set(d.armR, -0.15, 0, -0.05);
        d.root.rotation.z = S(t * 0.7) * 0.04;
    },

    /* ---------- RARE ---------- */
    // 예비군 공병은: 경례
    rare_soldier(t, d) {
        set(d.armR, -2.35, 0, -0.75);
        set(d.armL, 0, 0, -0.02);
        d.root.rotation.x = -0.04;
        d.head.rotation.x = -0.05;
    },
    // 폭주기관차 김민채: 숙이고 전력질주
    rare_train(t, d) {
        const s = S(t * 14);
        set(d.legL, s * 1.0); set(d.legR, -s * 1.0);
        set(d.armL, -s * 1.1, 0, -0.1); set(d.armR, s * 1.1, 0, 0.1);
        d.root.rotation.x = 0.3;
        d.root.position.y += Math.abs(S(t * 14)) * 0.18;
    },
    // 축구공 차는 박지성: 오른발 킥
    rare_new_jisung(t, d) {
        const k = (t % 2.2) / 2.2;
        const kick = k < 0.45 ? mix(0, 0.9, k / 0.45) : k < 0.6 ? mix(0.9, -1.5, (k - 0.45) / 0.15) : mix(-1.5, 0, (k - 0.6) / 0.4);
        set(d.legR, kick); set(d.legL, 0);
        set(d.armL, 0.3, 0, -0.7); set(d.armR, -0.4, 0, 0.6);
        d.root.rotation.x = -kick * 0.08;
    },

    /* ---------- EPIC ---------- */
    // 밪지성: 근육 자랑 (팔 수평으로 들고 펌핑)
    ep_baksisung(t, d) {
        const p = S(t * 3) * 0.2;
        set(d.armL, 0, 0, -1.5 - p); set(d.armR, 0, 0, 1.5 + p);
        d.head.rotation.x = -0.1;
    },
    // 파괴신 김건우: 넓은 자세, 주먹 쥐고 3초마다 쿵
    epic_destroy(t, d) {
        const k = pulse(t, 3, 0.5);
        set(d.legL, 0, 0, -0.22); set(d.legR, 0, 0, 0.22);
        set(d.armL, -0.3 - k * 1.2, 0, -0.45); set(d.armR, -0.3 - k * 1.2, 0, 0.45);
        d.root.position.y -= k * 0.15;
        d.root.rotation.x = 0.1 + k * 0.1;
    },

    /* ---------- LEGEND ---------- */
    // 크레이지콩: 미친 춤
    ep_crazykong(t, d) {
        const a = S(t * 6), b = S(t * 6 + Math.PI);
        set(d.armL, 0, 0, -0.4 - (a * 0.5 + 0.5) * 2.4); set(d.armR, 0, 0, 0.4 + (b * 0.5 + 0.5) * 2.4);
        set(d.legL, S(t * 12) * 0.5); set(d.legR, -S(t * 12) * 0.5);
        d.root.rotation.y += S(t * 3) * 0.5;
        d.head.rotation.z = S(t * 6) * 0.25;
        d.root.position.y += Math.abs(S(t * 6)) * 0.3;
    },
    // 광속의 김민채: 나루토 달리기 (팔 뒤로, 몸 숙임)
    legend_speed(t, d) {
        const s = S(t * 16);
        set(d.legL, s * 1.1); set(d.legR, -s * 1.1);
        set(d.armL, 1.35, 0, -0.15); set(d.armR, 1.35, 0, 0.15);
        d.root.rotation.x = 0.55;
        d.head.rotation.x = -0.45;
        d.root.position.y += Math.abs(S(t * 16)) * 0.12;
    },
    // 대마법사 공병은: 한 손 높이, 다른 손 앞으로. 4초마다 주문을 던짐
    legend_wizard(t, d) {
        const k = pulse(t, 4, 0.7);
        set(d.armR, -k * 1.9, 0, mix(2.7, 0.3, k));
        set(d.armL, -1.3 + S(t * 2) * 0.1, 0, -0.25);
        d.head.rotation.x = -0.15 + k * 0.2;
        d.root.rotation.x = k * 0.12;
    },

    /* ---------- MYTHIC ---------- */
    // 김민제미나이: 공중 명상 (책상다리, 손은 무릎 위)
    gemini_basic(t, d) {
        set(d.legL, -1.45, 0.35, 0.55); set(d.legR, -1.45, -0.35, -0.55);
        set(d.armL, -0.75, 0, -0.35); set(d.armR, -0.75, 0, 0.35);
        d.root.position.y += 0.9 + S(t * 1.2) * 0.15;
        d.root.rotation.y += t * 0.25;
        d.head.rotation.x = 0.12;
    },
    // 건숭이: 손차양 하고 멀리 살핌, 한쪽 다리 들고
    epic_monkey(t, d) {
        set(d.armR, -2.75, 0, -0.85);
        set(d.armL, -0.4, 0, -0.55);
        set(d.legL, -0.7, 0, -0.1);
        d.root.rotation.x = 0.12;
        d.head.rotation.y = S(t * 0.8) * 0.6;
    },
    // 두 개의 심장 박지성: 두 손을 가슴에
    mythic_heart(t, d) {
        const beat = pulse(t, 0.9, 0.18) + pulse(t, 0.9, 0.18, -0.22) * 0.7;
        set(d.armL, -1.2, 0, 0.62); set(d.armR, -1.2, 0, -0.62);
        d.root.rotation.x = -beat * 0.06;
        d.head.rotation.x = -0.1 - beat * 0.08;
    },

    /* ---------- ANCIENT ---------- */
    // 초월자 김건우: 두 팔 하늘로, 고개 들고 승천
    divine_god(t, d) {
        const open = 2.35 + S(t * 0.8) * 0.15;
        set(d.armL, 0, 0, -open); set(d.armR, 0, 0, open);
        d.head.rotation.x = -0.4;
        set(d.legL, 0.15, 0, 0.04); set(d.legR, 0.15, 0, -0.04);
        d.root.rotation.y += S(t * 0.3) * 0.3;
    },
    // 성검의 소유자: 왼손 가슴(맹세), 오른손 칼자루 쪽. 6초마다 오른손을 하늘로
    divine_knight_gaen_sword(t, d) {
        const k = pulse(t, 6, 1.6);
        set(d.armL, -1.25, 0, 0.6);
        set(d.armR, -k * 2.8, 0, mix(0.55, 0.15, k));
        d.head.rotation.x = 0.1 - k * 0.45;
        d.root.rotation.y = -0.25;
    },

    /* ---------- ABSOLUTE ---------- */
    // 곤지암병은: 꺾인 목, 앞으로 뻗은 뻣뻣한 팔, 축 늘어진 다리, 가끔 경련
    legend_gonjiam(t, d) {
        const twitch = (S(t * 37) > 0.97 ? 1 : 0) + (S(t * 23 + 1) > 0.985 ? -1 : 0);
        d.head.rotation.set(0.25 + twitch * 0.2, twitch * 0.3, 0.8 + S(t * 0.7) * 0.08 + twitch * 0.25);
        set(d.armL, -1.5 + S(t * 1.3) * 0.05 + twitch * 0.2, 0, 0.05);
        set(d.armR, -1.45 + S(t * 1.1) * 0.05 - twitch * 0.2, 0, -0.05);
        set(d.legL, 0.25 + S(t * 0.9) * 0.06, 0, 0.03); set(d.legR, 0.3 - S(t * 0.9) * 0.06, 0, -0.03);
        d.root.rotation.z = S(t * 0.5) * 0.06 + twitch * 0.06;
        d.root.position.y += 0.5;
    },
    // 강철검제: 오른손을 앞으로 뻗어 명령, 왼손은 뒷짐. 일제사격 때 크게 휘두름
    cosmic_steel_emperor(t, d) {
        const k = pulse(t, 3.2, 0.5, 0.1);
        set(d.armR, -1.55 + k * 0.4, 0, mix(-0.1, 1.2, k));
        set(d.armL, 0.45, 0, 0.05);
        d.head.rotation.x = -0.18;
        d.root.rotation.y = mix(-0.2, -0.45, k);
        set(d.legL, 0, 0, -0.12); set(d.legR, 0, 0, 0.12);
    },

    /* ---------- JXS ---------- */
    // 공허왕 공병은: 공중에서 내려다보며 두 팔을 펼침. 5초마다 팔을 크게 들어 공허를 부름
    js_void_king(t, d) {
        const k = pulse(t, 5, 2.2);
        const open = mix(0.8, 1.9, k);
        set(d.armL, -0.25 - k * 0.4, 0, -open); set(d.armR, -0.25 - k * 0.4, 0, open);
        d.head.rotation.x = mix(0.22, -0.25, k);
        set(d.legL, 0.18, 0, 0.05); set(d.legR, 0.22, 0, -0.05);
        d.root.rotation.y = S(t * 0.25) * 0.15;
    },
    // 번개의 좌 박지성 (제우스): 떠서 번개를 높이 듦 → 팔을 뒤로 젖히며 몸을 비틀어 힘을 모음 → 앞으로 내던짐
    js_lightning_jisung(t, d, _r, sig) {
        const w = sig?.windK ?? 0, k = sig?.throwK ?? 0;
        const idleSway = S(t * 1.1) * 0.06;
        // 오른팔: 위로 → 뒤로 젖힘 → 앞으로 휘두름
        const rx = mix(mix(0, 0.95, w), -1.95, k);
        const rz = mix(mix(2.85 + idleSway, 2.25, w), 0.75, k);
        set(d.armR, rx, 0, rz);
        // 왼팔: 평소엔 아래로 위엄, 모을 땐 목표를 가리킴, 던지면 뒤로
        set(d.armL, mix(mix(-0.6, -1.55, w), 0.6, k), 0, mix(mix(-0.55, -0.25, w), -0.9, k));
        // 몸: 비틀기와 숙임
        d.root.rotation.y = mix(mix(-0.15 + S(t * 0.5) * 0.08, 0.6, w), -0.5, k);
        d.root.rotation.x = mix(mix(-0.05, -0.18, w), 0.32, k);
        d.root.rotation.z = mix(0, 0.08, w) - k * 0.06;
        // 다리: 던질 때 앞으로 내딛음
        set(d.legL, mix(mix(-0.25, 0.1, w), -0.75, k), 0, -0.12);
        set(d.legR, mix(mix(0.15, -0.2, w), 0.55, k), 0, 0.12);
        d.head.rotation.set(mix(-0.15, 0.1, k), mix(0, -0.4, w) + k * 0.3, 0);
        d.root.position.y += 0.35 + S(t * 1.4) * 0.12 - k * 0.15;
    },

    /* ---------- 새 칭호 ---------- */
    // 김건우: 팔짱 끼고 발 까딱
    com_gunwoo(t, d) {
        set(d.armL, -0.95, 0, 0.55); set(d.armR, -0.85, 0, -0.55);
        set(d.legR, -Math.max(0, S(t * 5)) * 0.15);
        d.head.rotation.y = S(t * 0.4) * 0.2;
    },
    // 김티비디오: 두 손으로 카메라 들고 촬영 중
    unc_tvideo(t, d) {
        set(d.armL, -1.5, 0, 0.32); set(d.armR, -1.6, 0, -0.32);
        d.head.rotation.set(0.05, 0, S(t * 0.9) * 0.08);
        d.root.rotation.y = S(t * 0.5) * 0.35;
        d.root.position.y += Math.abs(S(t * 2.4)) * 0.04;
    },
    // 김민채소로날유혹해: 한 손 허리, 한 손 머리 뒤, 골반 흔들기 (옆의 소를 향해)
    rare_cow_minchae(t, d) {
        set(d.armL, 0.35, 0, -0.5);
        set(d.armR, -2.5, 0, -0.75);
        d.root.rotation.z = S(t * 2.2) * 0.09;
        d.root.rotation.y = 0.45 + S(t * 1.1) * 0.1;
        d.head.rotation.set(-0.08, 0, 0.18);
        set(d.legL, 0, 0, -0.06); set(d.legR, -0.15, 0, 0.1);
    },
    // 꽁꽁병은: 몸을 감싸 쥐고 오들오들
    ep_frozen_byungeun(t, d) {
        const sh = S(t * 45) * 0.025;
        set(d.armL, -1.15, 0, 0.6 + sh); set(d.armR, -1.15, 0, -0.6 - sh);
        set(d.legL, 0, 0, 0.05); set(d.legR, 0, 0, -0.05);
        d.head.rotation.set(0.3, sh * 2, 0);
        d.root.position.x += sh * 0.6;
    },
    // 김건우족을보았다: 부족장의 의식 춤 (팔을 번갈아 하늘로, 발 구르기)
    leg_gunwoo_tribe(t, d) {
        const a = S(t * 4);
        set(d.armL, -0.2, 0, -1.6 - a * 0.9); set(d.armR, -0.2, 0, 1.6 - a * 0.9);
        set(d.legL, Math.max(0, S(t * 4)) * -0.6); set(d.legR, Math.max(0, -S(t * 4)) * -0.6);
        d.root.position.y += Math.abs(S(t * 4)) * 0.25;
        d.head.rotation.x = -0.25 + Math.abs(a) * 0.15;
        d.root.rotation.y = S(t * 1) * 0.5;
    },
    // 170KG OOO: 바벨을 머리 위로 들었다가 바닥에 내리찍음
    mythic_170kg(t, d, _r, sig) {
        const up = sig?.liftK ?? 1;   // 1 = 머리 위, 0 = 바닥
        set(d.armL, -0.15 * (1 - up), 0, -mix(0.35, 2.85, up)); set(d.armR, -0.15 * (1 - up), 0, mix(0.35, 2.85, up));
        set(d.legL, mix(-0.8, 0, up), 0, -0.22); set(d.legR, mix(-0.8, 0, up), 0, 0.22);
        d.root.rotation.x = mix(0.45, -0.05, up);
        d.root.position.y += mix(-0.55, 0, up);
        d.head.rotation.x = mix(0.2, -0.25, up);
    },
    // 절대여제 김가은: 한 손 허리, 한 손에 홀을 높이. 가끔 홀로 바닥을 내리침
    anc_empress_gaen(t, d, _r, sig) {
        const k = sig?.slamK ?? 0;
        set(d.armR, mix(-2.35, -1.2, k), 0, mix(0.35, 0.1, k));
        set(d.armL, 0.35, 0, -0.45);
        d.head.rotation.x = mix(-0.22, 0.05, k);
        d.root.rotation.y = S(t * 0.35) * 0.25;
        set(d.legL, 0, 0, -0.04); set(d.legR, -0.12, 0, 0.08);
    },
    // 흉악범: 인사(모자 들고 허리 숙임) ↔ 두 팔을 활짝 펼치는 마술 공개
    jxs_felon(t, d, _r, sig) {
        const bow = sig?.bowK ?? 0, reveal = sig?.revealK ?? 0;
        set(d.armR, mix(mix(-0.4, -1.25, bow), -0.35, reveal), 0, mix(mix(0.2, -0.65, bow), 2.25, reveal));
        set(d.armL, mix(mix(0.25, 0.55, bow), -0.35, reveal), 0, mix(-0.25, -2.25, reveal));
        d.root.rotation.x = mix(0, 0.45, bow) - reveal * 0.12;
        d.root.rotation.y = S(t * 0.6) * 0.2 + mix(0, -0.3, bow);
        d.head.rotation.x = mix(0, 0.3, bow) - reveal * 0.2;
        set(d.legL, mix(0, -0.35, bow), 0, -0.06); set(d.legR, mix(0, 0.25, bow), 0, 0.06);
        d.root.position.y += 0.25 + S(t * 1.6) * 0.1 + reveal * 0.4;
    },

    /* ---------- 새 칭호 ---------- */
    // 배고픈 김가은: 배를 문지르며 축 처짐, 가끔 꼬르륵 들썩
    com_hungry_gaeun(t, d) {
        const k = pulse(t, 4, 0.5);
        set(d.armL, -0.55 + S(t * 3) * 0.08, 0, 0.35); set(d.armR, -0.5, 0, -0.3);
        d.root.rotation.x = 0.12 + k * 0.1;
        d.head.rotation.x = 0.25;
        d.root.position.y -= k * 0.08;
    },
    // 폰만 보는 김티비: 고개 숙이고 두 손으로 폰, 엄지만 바쁨
    com_phone_tv(t, d) {
        set(d.armL, -1.15, 0, 0.32 + S(t * 9) * 0.03); set(d.armR, -1.15, 0, -0.32 - S(t * 9 + 1) * 0.03);
        d.head.rotation.x = 0.45;
        d.root.rotation.y = S(t * 0.3) * 0.1;
    },
    // 산책하는 공병은: 제자리 걸음, 팔 흔들기
    unc_walk_byungeun(t, d) {
        const w = S(t * 3.2);
        set(d.armL, w * 0.45, 0, -0.06); set(d.armR, -w * 0.45, 0, 0.06);
        set(d.legL, -w * 0.4, 0, 0); set(d.legR, w * 0.4, 0, 0);
        d.root.position.y += Math.abs(w) * 0.06;
        d.head.rotation.y = S(t * 0.5) * 0.3;
    },
    // PC방 박지성: 키보드 연타 + 마우스 휙휙, 가끔 승리 만세
    unc_pc_jisung(t, d) {
        const win = pulse(t, 6, 1.2);
        set(d.armL, mix(-1.2 + S(t * 22) * 0.05, -0.3, win), 0, mix(0.15, -2.6, win));
        set(d.armR, mix(-1.2, -0.3, win), 0, mix(-0.15 + S(t * 4) * 0.12, 2.6, win));
        d.root.rotation.x = mix(0.18, -0.1, win);
        d.head.rotation.x = mix(0.1, -0.3, win);
    },
    // 축구부 주장 김민채: 공 리프팅 (오른발 툭툭) + 왼팔로 지휘
    rare_captain_minchae(t, d) {
        const k = Math.max(0, S(t * 5));
        set(d.legR, -k * 0.7, 0, 0.04); set(d.legL, 0, 0, -0.06);
        set(d.armL, -1.4 - S(t * 0.8) * 0.2, 0, 0.3); set(d.armR, 0, 0, 0.35);
        d.head.rotation.x = 0.2;
    },
    // 야자 탈출 김티비: 몰래 뛰는 자세, 두리번
    rare_escape_tv(t, d) {
        const w = S(t * 7);
        set(d.armL, w * 0.8, 0, -0.1); set(d.armR, -w * 0.8, 0, 0.1);
        set(d.legL, -w * 0.6, 0, 0); set(d.legR, w * 0.6, 0, 0);
        d.root.rotation.x = 0.25;
        d.head.rotation.y = S(t * 1.3) * 0.6;
        d.root.position.y += Math.abs(w) * 0.12;
    },
    // 불꽃 슛 박지성: 3초마다 크게 뒤로 젖혔다 슛
    ep_fire_jisung(t, d) {
        const c = t % 3;
        const wind = c < 1.2 ? c / 1.2 : 0, kick = c >= 1.2 && c < 1.6 ? 1 - (c - 1.2) / 0.4 : 0;
        set(d.legR, mix(0, 0.9, wind) - kick * 1.6, 0, 0.05);
        set(d.armL, -0.6 * wind - kick * 0.8, 0, -0.5); set(d.armR, 0.4 * wind, 0, 0.6);
        d.root.rotation.x = -0.15 * wind + kick * 0.2;
    },
    // 흑염룡 김티비: 한 손으로 얼굴 가리고, 다른 팔엔 봉인된 용 (부들부들)
    ep_darkdragon_tv(t, d) {
        const shake = S(t * 30) * 0.04;
        set(d.armR, -2.1, 0, -0.55); set(d.armL, -0.6 + shake, 0, -0.9 + shake);
        d.head.rotation.x = 0.15; d.head.rotation.y = -0.2;
        d.root.rotation.y = 0.3;
        set(d.legL, -0.2, 0, -0.15); set(d.legR, 0.15, 0, 0.12);
    },
    // 폭풍의 김가은: 한 팔 높이 들고 빙글 회전하며 폭풍을 부림
    leg_storm_gaeun(t, d) {
        set(d.armR, -0.2, 0, 2.7 + S(t * 2) * 0.15); set(d.armL, 0, 0, -1.2 - S(t * 2) * 0.2);
        d.root.rotation.y = t * 1.2;
        d.root.position.y += 0.5 + S(t * 1.5) * 0.15;
        set(d.legL, -0.3, 0, -0.1); set(d.legR, 0.2, 0, 0.1);
        d.head.rotation.x = -0.2;
    },
    // 심해의 공병은: 물속에 떠서 천천히 헤엄
    myth_abyss_byungeun(t, d, _r, sig) {
        const sw = sig?.swimK ?? S(t * 1.4);
        set(d.armL, -0.3 + sw * 0.3, 0, -1.1 - sw * 0.4); set(d.armR, -0.3 - sw * 0.3, 0, 1.1 + sw * 0.4);
        set(d.legL, S(t * 1.4) * 0.35, 0, -0.08); set(d.legR, -S(t * 1.4) * 0.35, 0, 0.08);
        d.root.position.y += 0.9 + S(t * 0.7) * 0.25;
        d.root.rotation.x = 0.1 + S(t * 0.7) * 0.06;
        d.root.rotation.z = S(t * 0.5) * 0.06;
    },
    // 멸종의 김민채: 팔을 들어 유성을 부르고, 떨어질 때 내려찍음
    anc_extinct_minchae(t, d, _r, sig) {
        const k = sig?.callK ?? 0;
        set(d.armR, -0.3 - k * 0.3, 0, mix(0.35, 2.8, k)); set(d.armL, mix(0.2, -0.8, k), 0, -0.45);
        d.head.rotation.x = mix(0.05, -0.4, k);
        d.root.rotation.y = -0.2 + S(t * 0.4) * 0.15;
        set(d.legL, -0.15, 0, -0.14); set(d.legR, 0.1, 0, 0.14);
    },
    // 마지막 기관사 김건우: 랜턴을 든 채 차렷, 기적이 울리면 랜턴을 높이 흔들고 반대 손으로 '출발' 지적
    abs_last_conductor(t, d, _r, sig) {
        const k = sig?.whistleK ?? 0;
        set(d.armR, mix(-0.25, -0.5, k), 0, mix(0.12, 2.5 + S(t * 9) * 0.25 * k, k));
        set(d.armL, mix(0.05, -1.55, k), mix(0, -0.35, k), mix(-0.05, -0.15, k));
        d.head.rotation.x = mix(0.02, -0.12, k);
        d.head.rotation.y = mix(S(t * 0.4) * 0.25, -0.2, k);
        d.root.rotation.y = mix(0, 0.15, k);
    },

    // 급식실 김건우: 식판 들고 두리번, 가끔 한 입
    unc_lunch_gunwoo(t, d) {
        const bite = pulse(t, 3.5, 0.6);
        set(d.armL, -1.3, 0, 0.25); set(d.armR, mix(-1.3, -2.4, bite), 0, mix(-0.25, -0.6, bite));
        d.head.rotation.y = S(t * 0.9) * 0.35 * (1 - bite);
        d.head.rotation.x = -bite * 0.15;
    },
    // 지각한 김가은: 허겁지겁 달리기 + 손목시계 확인
    unc_late_gaeun(t, d) {
        const w = S(t * 9), look = pulse(t, 2.5, 0.6);
        set(d.armL, mix(w * 1.0, -1.6, look), 0, mix(-0.1, 0.5, look)); set(d.armR, -w * 1.0, 0, 0.1);
        set(d.legL, -w * 0.8, 0, 0); set(d.legR, w * 0.8, 0, 0);
        d.root.rotation.x = 0.3; d.head.rotation.x = look * 0.3;
        d.root.position.y += Math.abs(w) * 0.15;
    },
    // 반장 공병은: 뒷짐 지고 손가락으로 지시
    rare_president_byungeun(t, d) {
        const k = pulse(t, 3, 0.8);
        set(d.armR, mix(0.3, -1.5, k), 0, mix(-0.2, 0.1, k)); set(d.armL, 0.35, 0, 0.2);
        d.head.rotation.x = -0.1; d.root.rotation.y = S(t * 0.5) * 0.2;
    },
    // 노래방 김민채: 마이크 잡고 열창, 고개 흔들기
    rare_karaoke_minchae(t, d) {
        const hi = pulse(t, 4, 1.2);
        set(d.armL, -2.2, 0, 0.5); set(d.armR, -0.3, 0, mix(0.4 + S(t * 4) * 0.2, 2.6, hi));
        d.head.rotation.z = S(t * 4) * 0.18; d.head.rotation.x = -0.15 - hi * 0.2;
        d.root.rotation.z = S(t * 2) * 0.05;
        d.root.position.y += Math.abs(S(t * 4)) * 0.06;
    },
    // 검은 띠 김건우: 정권 지르기 반복
    ep_blackbelt_gunwoo(t, d) {
        const c = (t * 1.6) % 2, left = c < 1, k = S((c % 1) * Math.PI);
        set(d.armL, left ? -1.57 * k - 0.2 : -0.4, 0, 0.1); set(d.armR, left ? -0.4 : -1.57 * k - 0.2, 0, -0.1);
        set(d.legL, -0.4, 0, -0.25); set(d.legR, 0.3, 0, 0.25);
        d.root.position.y -= 0.25; d.root.rotation.y = (left ? 0.15 : -0.15) * k;
    },
    // 독버섯 김티비: 비틀비틀 어지러움
    ep_mushroom_tv(t, d) {
        set(d.armL, S(t * 1.3) * 0.4, 0, -0.5 - S(t) * 0.3); set(d.armR, -S(t * 1.1) * 0.4, 0, 0.5 + S(t * 1.2) * 0.3);
        d.root.rotation.z = S(t * 1.1) * 0.12; d.root.rotation.x = S(t * 0.7) * 0.08;
        d.head.rotation.z = S(t * 1.7) * 0.25;
    },
    // 닌자 박지성: 낮은 자세, 분신술 순간에 인 맺기
    leg_ninja_jisung(t, d, _r, sig) {
        const seal = sig?.sealK ?? 0;
        set(d.armL, mix(0.4, -1.3, seal), 0, mix(-0.5, 0.45, seal)); set(d.armR, mix(-0.9, -1.3, seal), 0, mix(0.2, -0.45, seal));
        set(d.legL, -0.55, 0, -0.3); set(d.legR, 0.45, 0, 0.3);
        d.root.position.y -= 0.45; d.root.rotation.x = 0.2; d.head.rotation.x = -0.15;
        d.root.rotation.y = S(t * 0.6) * 0.3;
    },
    // 해적선장 공병은: 칼을 앞으로 겨누고 한 발 올림
    leg_pirate_byungeun(t, d) {
        const k = pulse(t, 4, 0.8);
        set(d.armL, mix(-1.3, -2.5, k), 0, 0.15); set(d.armR, 0.2, 0, 0.5);
        set(d.legL, -0.9, 0, -0.1); set(d.legR, 0.1, 0, 0.12);
        d.root.rotation.y = -0.3 + S(t * 0.7) * 0.1; d.head.rotation.x = -0.15;
        d.root.rotation.z = S(t * 1.2) * 0.04;   // 배 위처럼 흔들
    },
    // 황금손 김가은: 두 손을 앞으로 펼쳐 보이며 천천히 돎
    myth_midas_gaeun(t, d) {
        const k = pulse(t, 4, 1.4);
        set(d.armL, mix(-1.2, -1.9, k), 0, mix(0.45, -0.3, k)); set(d.armR, mix(-1.2, -1.9, k), 0, mix(-0.45, 0.3, k));
        d.root.rotation.y = S(t * 0.4) * 0.5; d.head.rotation.x = 0.15 - k * 0.3;
        d.root.position.y += 0.3 + S(t * 0.9) * 0.1;
    },
    // 시간여행자 김민채: 회중시계 들여다보다 손을 휘저어 시간을 감음
    myth_time_minchae(t, d) {
        const k = pulse(t, 5, 1.6);
        set(d.armL, -1.3, 0, 0.35); set(d.armR, mix(-1.2, -0.6, k), 0, mix(-0.2, 1.4 + S(t * 6) * 0.6 * k, k));
        d.head.rotation.x = mix(0.35, -0.2, k);
        d.root.position.y += 0.4 + S(t * 0.8) * 0.12;
        d.root.rotation.y = mix(0, S(t * 3) * 0.3, k);
    },
    // 태극권 박지성: 마보 자세로 천천히 운수(구름 손) — 두 손이 원을 그리며 엇갈림
    anc_taichi_jisung(t, d) {
        const a = t * 0.9;
        set(d.armL, -1.1 + S(a) * 0.55, 0, 0.6 + C(a) * 0.55);
        set(d.armR, -1.1 - S(a) * 0.55, 0, -0.6 - C(a) * 0.55);
        set(d.legL, -0.15, 0, -0.32); set(d.legR, 0.15, 0, 0.32);
        d.root.position.y -= 0.35 + S(a * 0.5) * 0.08;
        d.root.rotation.y = S(a) * 0.35; d.head.rotation.y = -S(a) * 0.25;
        d.root.position.x += S(a * 0.5) * 0.15;
    },
    // 대악마 김티비: 공중에 떠서 내려다봄, 분노가 차면 두 팔을 활짝 펴고 고개를 젖힘
    abs_archdemon_tv(t, d, _r, sig) {
        const r = sig?.rageK ?? 0;
        set(d.armL, mix(-0.3, -0.5, r), 0, mix(-0.55, -2.3, r)); set(d.armR, mix(-0.3, -0.5, r), 0, mix(0.55, 2.3, r));
        d.head.rotation.x = mix(0.25, -0.35, r);
        set(d.legL, 0.15, 0, -0.08); set(d.legR, -0.1, 0, 0.08);
        d.root.position.y += 0.6 + S(t * 1.1) * 0.15;
        d.root.rotation.x = mix(0.08, -0.1, r);
    },
    // 샌즈. 김티비: 주머니에 손, 건들건들. 블래스터 부를 땐 한 손을 들고, 4초마다 옆으로 슥 피함
    jxs_sans_tv(t, d, _r, sig) {
        const c = sig?.castK ?? 0, dg = sig?.dodge ?? 0;
        set(d.armL, 0.18, 0, 0.12); set(d.armR, mix(0.18, -0.4, c), 0, mix(-0.12, 2.0, c));
        d.head.rotation.z = S(t * 0.9) * 0.08 * (1 - c); d.head.rotation.x = 0.08 - c * 0.12;
        d.root.rotation.z = S(t * 0.9) * 0.03;
        d.root.position.x += dg * 1.4;
        d.root.rotation.y = -dg * 0.25;
        set(d.legL, 0, 0, -0.04); set(d.legR, 0, 0, 0.04);
    },

    // 편의점 알바 박지성: 바코드 찍기 (삑, 삑)
    rare_cvs_jisung(t, d) {
        const k = pulse(t, 1.2, 0.35);
        set(d.armL, -1.2 - k * 0.3, 0, 0.3); set(d.armR, -1.0, 0, -0.5 + k * 0.2);
        d.head.rotation.x = 0.3; d.head.rotation.y = -0.15;
    },
    // 자전거 타는 김티비: 페달 밟기 + 핸들
    rare_bike_tv(t, d) {
        const p = t * 6;
        set(d.legL, -0.9 + S(p) * 0.5, 0, 0); set(d.legR, -0.9 - S(p) * 0.5, 0, 0);
        set(d.armL, -1.2, 0, 0.15); set(d.armR, -1.2, 0, -0.15);
        d.root.rotation.x = 0.25; d.root.position.y += 0.6 + Math.abs(S(p)) * 0.04;
    },
    // 드럼 치는 공병은: 양손 번갈아 내리치기
    rare_drum_byungeun(t, d) {
        const l = Math.max(0, S(t * 12)), r = Math.max(0, S(t * 12 + Math.PI));
        set(d.armL, -1.0 - l * 0.6, 0, 0.35); set(d.armR, -1.0 - r * 0.6, 0, -0.35);
        d.head.rotation.x = 0.1 + Math.abs(S(t * 6)) * 0.15;
        set(d.legL, -0.4 - Math.max(0, S(t * 6)) * 0.3, 0, 0);
    },
    // 마술사 김건우: 손을 펼치며 짠!
    ep_magician_gunwoo(t, d) {
        const k = pulse(t, 3, 0.9);
        set(d.armL, -0.4, 0, mix(-0.3, -1.9, k)); set(d.armR, mix(-1.4, -0.4, k), 0, mix(-0.2, 1.9, k));
        d.root.rotation.x = -k * 0.08; d.head.rotation.x = -k * 0.15;
    },
    // 사이보그 김가은: 딱딱하게 끊기는 로봇 동작
    ep_cyborg_gaeun(t, d) {
        const st = Math.floor(t * 2) % 4;
        const poses = [[-1.57, 0, 0, 0], [0, -1.57, 0.3, 0], [-1.57, -1.57, 0, 0.4], [0, 0, -0.3, 0]];
        const [al, ar, hy, rz] = poses[st];
        set(d.armL, al, 0, 0.05); set(d.armR, ar, 0, -0.05);
        d.head.rotation.y = hy; d.root.rotation.y = rz;
    },
    // 용암 김티비: 뜨거워서 발을 동동
    ep_lava_tv(t, d) {
        const w = S(t * 10);
        set(d.legL, -Math.max(0, w) * 0.8, 0, -0.05); set(d.legR, -Math.max(0, -w) * 0.8, 0, 0.05);
        set(d.armL, 0, 0, -0.6 - Math.abs(w) * 0.3); set(d.armR, 0, 0, 0.6 + Math.abs(w) * 0.3);
        d.root.position.y += Math.abs(w) * 0.15;
    },
    // 검객 공병은: 낮은 발도 자세 → 베기
    leg_swordsman_byungeun(t, d, _r, sig) {
        const k = sig?.drawK ?? 0;
        set(d.armL, mix(0.3, -1.4, k), mix(0, 0.9, k), mix(0.25, -0.2, k));
        set(d.armR, -0.6, 0, -0.4);
        set(d.legL, -0.6 * (0.5 + k * 0.5), 0, -0.2); set(d.legR, 0.45, 0, 0.2);
        d.root.position.y -= 0.3 + k * 0.15; d.root.rotation.y = mix(0.4, -0.5, k);
        d.head.rotation.y = -0.3;
    },
    // DJ 김티비: 한 손은 헤드폰, 한 손은 턴테이블, 박자 맞춰 끄덕
    leg_dj_tv(t, d, _r, sig) {
        const b = sig?.beat ?? 0;
        const up = pulse(t, 8, 1.5);
        set(d.armR, -0.25, 0, mix(2.2, 2.9, up)); set(d.armL, -1.0 - S(t * 3) * 0.15, 0, 0.3);
        d.head.rotation.x = 0.05 + b * 0.25; d.head.rotation.z = -0.15;
        d.root.position.y -= b * 0.08;
    },
    // 우주비행사 박지성: 무중력으로 둥둥, 천천히 돌며 손 흔들기
    myth_astro_jisung(t, d) {
        set(d.armL, -0.3, 0, -0.9 - S(t * 0.8) * 0.2); set(d.armR, -0.2, 0, 2.3 + S(t * 4) * 0.25);
        set(d.legL, S(t * 0.6) * 0.3, 0, -0.15); set(d.legR, -S(t * 0.6) * 0.3, 0, 0.15);
        d.root.position.y += 1.0 + S(t * 0.7) * 0.3;
        d.root.rotation.z = S(t * 0.4) * 0.2; d.root.rotation.x = S(t * 0.3) * 0.15;
    },
    // 용기사 김민채: 창을 세우고 하늘의 용을 올려다봄
    myth_dragonknight_minchae(t, d) {
        const k = pulse(t, 5, 1.2, 3.6);
        set(d.armL, mix(-0.6, -2.7, k), 0, 0.2); set(d.armR, 0.2, 0, 0.35);
        d.head.rotation.x = -0.35; d.head.rotation.y = S(t * 0.45) * 0.4;
        set(d.legL, -0.2, 0, -0.12); set(d.legR, 0.15, 0, 0.12);
    },
    // 명예와 영광 김민채: 평소엔 두 손으로 망치 자루를 짚고 우뚝 섬 → 방패를 앞으로 → 두 손으로 망치를 머리 뒤로 → 앞 바닥에 쾅
    anc_honor_minchae(t, d, _r, sig) {
        const sh = sig?.shieldK ?? 0, up = sig?.raiseK ?? 0, sl = sig?.slamK ?? 0;
        const armX = sl > 0 ? mix(-0.5, -1.3, sl) : mix(-0.5, -2.9, up);
        set(d.armL, armX, 0, 0.28);
        if (sh > 0) set(d.armR, mix(armX, -1.55, sh), mix(0, -0.45, sh), mix(-0.28, 0.05, sh));
        else set(d.armR, armX, 0, -0.28);
        d.root.rotation.x = sl * 0.32 - up * 0.08;
        d.root.position.y -= sl * 0.3;
        set(d.legL, -0.15 - 0.3 * sl, 0, -0.16); set(d.legR, 0.1 + 0.25 * sl, 0, 0.16);
        d.head.rotation.x = -up * 0.25 + sl * 0.12 + 0.03;
        d.root.rotation.y = (1 - Math.max(sh, up, sl)) * S(t * 0.4) * 0.12 - sh * 0.3;
    },
    // 저거너트 김민채: 대검을 어깨에 걸치고 앞으로 숙인 채 숨을 고름 → 두 손으로 머리 위로 → 앞에 내려찍음
    abs_juggernaut_minchae(t, d, _r, sig) {
        const up = sig?.raiseK ?? 0, sl = sig?.slamK ?? 0;
        const armX = sl > 0 ? mix(-1.0, -1.2, sl) : mix(-1.0, -3.0, up);
        set(d.armL, armX, 0, mix(0.35, 0.15, Math.max(up, sl)));
        const both = Math.max(up, sl);
        set(d.armR, mix(0.25 + S(t * 1.5) * 0.05, armX, both), 0, mix(-0.45, -0.15, both));
        d.root.rotation.x = 0.18 + S(t * 1.5) * 0.03 - up * 0.2 + sl * 0.45;
        d.root.position.y -= 0.3 + sl * 0.35;
        set(d.legL, -0.35 - sl * 0.25, 0, -0.25); set(d.legR, 0.3 + sl * 0.2, 0, 0.25);
        d.head.rotation.x = 0.1 - up * 0.3 + sl * 0.1;
        d.root.rotation.y = (1 - both) * S(t * 0.35) * 0.12;
    },

    // 그림자 사냥꾼 박지성: 낮게 웅크려 양손 단검을 역수로 쥠
    ep_shadow_jisung(t, d) {
        const k = pulse(t, 3, 0.4);
        set(d.armL, -0.9 - k * 0.8, 0.3, 0.5); set(d.armR, -0.6, -0.3, -0.6);
        set(d.legL, -0.7, 0, -0.25); set(d.legR, 0.5, 0, 0.25);
        d.root.position.y -= 0.55; d.root.rotation.x = 0.3; d.head.rotation.x = -0.25;
        d.root.rotation.y = S(t * 0.8) * 0.25;
    },
    // 네온 라이더 김가은: 한 손 앞으로 핸들, 바람 맞으며 몸을 숙임
    ep_neon_gaeun(t, d) {
        set(d.armL, -1.4, 0, 0.2); set(d.armR, -1.4, 0, -0.2);
        set(d.legL, -1.1, 0, -0.1); set(d.legR, -1.1, 0, 0.1);
        d.root.rotation.x = 0.35; d.root.position.y += 0.7 + S(t * 9) * 0.03;
        d.head.rotation.x = -0.35; d.root.rotation.z = S(t * 0.7) * 0.1;
    },
    // 강령술사 김티비: 책을 펼친 손을 내밀고, 해골을 부를 땐 반대 손을 하늘로
    // 스케이트보더 박지성: 옆으로 선 자세, 킥플립 때 웅크리며 뜀
    leg_skater_jisung(t, d, _r, sig) {
        const j = sig?.jump ?? 0, air = sig?.air ?? -1;
        const crouch = air >= 0 ? 0.6 * j : (t % 3.5) < 0.25 ? 0.4 : 0;
        set(d.legL, -crouch, 0, -0.28); set(d.legR, -crouch * 0.6, 0, 0.28);
        set(d.armL, -0.3 - j * 0.6, 0, -1.1 - j * 0.3); set(d.armR, 0.2, 0, 0.9 + j * 0.5);
        d.root.position.y += 0.38 + j * 1.5 - crouch * 0.15;   // 보드 위에 올라섬
        d.root.rotation.y = 0.35; d.head.rotation.y = -0.3; d.root.rotation.z = S(t * 2) * 0.03;
    },
    // 요리왕 김건우: 팬을 앞으로 들고, 2.4초마다 손목을 탁 올려 뒤집기
    leg_chef_gunwoo(t, d, _r, sig) {
        const f = sig?.flip ?? 0;
        set(d.armL, -1.45 - f * 0.45, 0, -0.05);
        set(d.armR, -0.3, 0, 0.45);
        d.head.rotation.x = 0.15 - f * 0.25; d.root.rotation.x = 0.04;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 구미호 김티비: 살짝 떠서 한 손에 여우불을 올리고 고개를 갸웃
    myth_gumiho_tv(t, d, _r, sig) {
        const w = sig?.wave ?? 0;
        d.root.position.y += 0.5 + S(t * 1.2) * 0.12;
        set(d.armL, -1.7 + S(t * 1.2) * 0.1, 0, -0.35); set(d.armR, -0.1, 0, 0.3 + w * 0.2);
        d.head.rotation.z = -0.15 + S(t * 0.8) * 0.06; d.head.rotation.y = 0.15;
        set(d.legL, -0.2, 0, -0.04); set(d.legR, 0.15, 0, 0.04);
    },
    // 용왕 박지성: 여의주를 든 손을 천천히 높이 올림
    anc_dragonking_jisung(t, d, _r, sig) {
        const k = sig?.raise ?? 0;
        set(d.armR, -0.2 - k * 0.3, 0, mix(1.4, 2.7, k)); set(d.armL, -0.5, 0, -0.2);
        d.head.rotation.x = mix(0, -0.25, k); d.root.position.y += 0.2 + k * 0.3;
        set(d.legL, 0, 0, -0.08); set(d.legR, 0, 0, 0.08);
    },
    // 시간을 멈춘 자 공병은: 멈출 때 손바닥을 앞으로 쭉
    // 연금술사 김가은: 플라스크를 눈높이로 들어 살펴보고, 끓어오를 땐 몸을 살짝 뒤로
    leg_alchemist_gaeun(t, d, _r, sig) {
        const b = sig?.brew ?? 0;
        set(d.armR, -1.5 - b * 0.3, 0, 0.35); set(d.armL, -0.4 + S(t * 1.5) * 0.1, 0, -0.35);
        d.head.rotation.x = 0.1 - b * 0.2; d.head.rotation.y = 0.25; d.root.rotation.x = -b * 0.08;
        set(d.legL, 0.05, 0, -0.06); set(d.legR, -0.05, 0, 0.06);
    },
    // 서커스 단장 김건우: 지팡이를 짚고 반대 팔을 활짝, 저글링 박자에 맞춰 까딱
    leg_ringmaster_gunwoo(t, d, _r, sig) {
        const k = sig?.toss ?? 0;
        set(d.armL, -0.35, 0, -0.25); set(d.armR, -0.3 - k * 0.3, 0, 1.7);
        d.head.rotation.x = -0.15 - k * 0.05; d.head.rotation.z = S(t * 2.8) * 0.08;
        d.root.position.y += k * 0.08;
        set(d.legL, 0, 0, -0.12); set(d.legR, 0, 0, 0.12);
    },
    // 등대지기 김티비: 랜턴을 앞으로 들어 바다를 비추고 먼 곳을 바라봄
    myth_lighthouse_tv(t, d, _r, sig) {
        const w = sig?.sweep ?? 0;
        set(d.armR, -1.25, 0, 0.15); set(d.armL, -0.15, 0, -0.2);
        d.head.rotation.y = -0.35 + w * 0.2; d.head.rotation.x = -0.1;
        d.root.rotation.z = S(t * 0.9) * 0.05;   // 배 위처럼 살짝 흔들
        set(d.legL, 0, 0, -0.1); set(d.legR, 0, 0, 0.1);
    },
    // 사막의 파라오 김민채: 앙크를 가슴에, 때때로 하늘 높이 치켜듦
    anc_pharaoh_minchae(t, d, _r, sig) {
        const k = sig?.raise ?? 0;
        set(d.armR, mix(-1.1, -0.2, k), 0, mix(-0.6, 2.8, k)); set(d.armL, -1.0, 0, 0.55);
        d.head.rotation.x = mix(0.05, -0.3, k); d.root.position.y += 0.15 + k * 0.4;
        set(d.legL, 0, 0, -0.04); set(d.legR, 0, 0, 0.04);
    },
    // 거울 세계 김건우: 거울을 향해 손을 뻗고, 깨질 때 고개를 젖힘
    abs_mirror_gunwoo(t, d, _r, sig) {
        const k = sig?.shatter ?? 0;
        set(d.armL, -1.4 + S(t * 0.8) * 0.1, 0, -0.1); set(d.armR, -0.2, 0, 0.3 + k * 0.8);
        d.head.rotation.x = -k * 0.35; d.head.rotation.y = S(t * 0.5) * 0.15;
        d.root.position.y += 0.15 + S(t * 1.2) * 0.08;
        set(d.legL, -0.05, 0, -0.06); set(d.legR, 0.05, 0, 0.06);
    },
    // 세계수 김건우: 씨앗을 두 손으로 받쳐 들고, 덩굴이 자랄수록 팔을 넓게 펼침
    jxs_worldtree_gunwoo(t, d, _r, sig) {
        const g = sig?.grow ?? 0;
        set(d.armR, mix(-1.2, -0.4, g), 0, mix(0.2, 1.3, g)); set(d.armL, mix(-1.2, -0.4, g), 0, mix(-0.2, -1.3, g));
        d.head.rotation.x = mix(0.2, -0.25, g); d.root.position.y += 0.3 + g * 0.5 + S(t * 0.9) * 0.08;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 균열을 걷는 자: 낮게 웅크린 암살자 자세, 베는 순간 두 단검을 X자로 휘두름
    dng_riftwalker(t, d, _r, sig) {
        const k = sig?.slash ?? 0;
        set(d.armL, mix(-0.9, -2.2, k), 0, mix(-0.5, 0.9, k)); set(d.armR, mix(-0.9, -2.2, k), 0, mix(0.5, -0.9, k));
        d.root.rotation.x = 0.18 + k * 0.1; d.root.position.y -= 0.25; d.head.rotation.x = -0.15;
        set(d.legL, -0.5, 0, -0.12); set(d.legR, 0.35, 0, 0.12);
    },
    // 균열의 지배자: 공중에 떠서 팔을 벌리고, 가끔 두 팔을 앞으로 내밀어 명령
    dng_riftlord(t, d, _r, sig) {
        const k = sig?.command ?? 0;
        set(d.armR, mix(-0.3, -1.5, k), 0, mix(1.0, 0.3, k)); set(d.armL, mix(-0.3, -1.5, k), 0, mix(-1.0, -0.3, k));
        d.root.position.y += 0.7 + S(t * 1.1) * 0.12; d.head.rotation.x = -0.18 + k * 0.1;
        set(d.legL, 0.15, 0, -0.06); set(d.legR, -0.05, 0, 0.06);
    },
    // 빙하의 심장: 한 손을 가슴의 심장에 얹고 다른 손으로 냉기를 내뿜음
    dng_frostheart(t, d, _r, sig) {
        const b = sig?.beat ?? 0;
        set(d.armR, -1.4, 0, 0.9); set(d.armL, -1.2 - b * 0.1, 0, -0.5);
        d.root.position.y += 0.3 + S(t) * 0.08; d.head.rotation.x = -0.1 + b * 0.03;
        set(d.legL, 0, 0, -0.08); set(d.legR, 0, 0, 0.08);
    },
    // 화룡의 계승자: 다리를 벌리고 주먹을 쥔 채 포효
    dng_dragonheir(t, d, _r, sig) {
        const f = sig?.flap ?? 0;
        set(d.armL, -0.4, 0, -0.9 - f * 0.1); set(d.armR, -0.4, 0, 0.9 + f * 0.1);
        d.head.rotation.x = -0.25 + S(t * 3) * 0.03; d.root.position.y += 0.2 + f * 0.05;
        set(d.legL, 0, 0, -0.22); set(d.legR, 0, 0, 0.22);
    },
    // 뇌조의 기수: 창을 높이 들고, 번개가 칠 때 창끝을 내리찍음
    dng_stormrider(t, d, _r, sig) {
        const k = sig?.strike ?? 0;
        set(d.armL, mix(-2.8, -1.6, k), 0, -0.2); set(d.armR, -0.3, 0, 0.6);
        d.root.position.y += 0.6 + S(t * 1.6) * 0.15; d.head.rotation.x = -0.2;
        set(d.legL, -0.3, 0, -0.1); set(d.legR, 0.2, 0, 0.1);
    },
    // 천문학자 김티비: 한 손으로 하늘을 가리키며 별을 셈
    leg_astronomer_tv(t, d, _r, sig) {
        set(d.armR, -2.6, 0, 0.3); set(d.armL, -0.4, 0, -0.2);
        d.head.rotation.set(-0.45, 0.2 + (sig?.look ?? 0) * 0.15, 0);
        set(d.legL, 0, 0, -0.06); set(d.legR, 0, 0, 0.06);
    },
    // 그림자 검객 김건우: 발도 자세. 칼날들이 정렬하면 칼을 앞으로 겨눔
    leg_shadowblade_gunwoo(t, d, _r, sig) {
        const k = sig?.draw ?? 0;
        set(d.armR, mix(-0.6, -1.5, k), 0, mix(0.6, 0.1, k)); set(d.armL, -0.5, 0, -0.3);
        d.root.rotation.y = mix(-0.4, 0, k); d.root.rotation.x = 0.12; d.root.position.y -= 0.2;
        set(d.legL, -0.45, 0, -0.1); set(d.legR, 0.3, 0, 0.1);
    },
    // 별을 벼리는 박지성: 망치를 들어 올렸다가 모루로 내려침
    myth_starforger_jisung(t, d, _r, sig) {
        const k = sig?.strike ?? 0;
        set(d.armR, mix(-0.6, -2.9, k), 0, 0.3); set(d.armL, -0.6, 0, -0.3);
        d.root.rotation.y = -0.5; d.root.rotation.x = 0.1 * (1 - k);
        set(d.legL, -0.2, 0, -0.12); set(d.legR, 0.15, 0, 0.12);
    },
    // 파도를 부르는 김가은: 두 팔을 위로 들어 물결을 부름
    myth_tidecaller_gaeun(t, d, _r, sig) {
        const c = sig?.call ?? 0;
        set(d.armR, -0.2, 0, mix(0.9, 2.6, c)); set(d.armL, -0.2, 0, mix(-0.9, -2.6, c));
        d.root.position.y += 0.4 + S(t * 1.2) * 0.1; d.head.rotation.x = -0.2 * c;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 시계탑의 주인 공병은: 한 손에 회중시계를 들여다보고 다른 손은 뒷짐
    anc_clockmaster_byungeun(t, d, _r, sig) {
        set(d.armL, -1.5, 0, 0.3); set(d.armR, 0.3, 0, -0.2);
        d.head.rotation.set(0.35, 0, (sig?.tock ?? 0) * 0.05);
        set(d.legL, 0, 0, -0.04); set(d.legR, 0, 0, 0.04);
    },
    // 일식의 김건우: 공중에 떠 일식 구슬을 든 손을 내밀고 다른 팔은 펼침
    jxs_eclipse_gunwoo(t, d, _r, sig) {
        set(d.armR, -1.3, 0, 0.2); set(d.armL, -0.2, 0, -1.2 - (sig?.flare ?? 0) * 0.1);
        d.root.position.y += 0.9 + S(t * 0.9) * 0.12; d.head.rotation.x = -0.12;
        set(d.legL, 0.15, 0, -0.05); set(d.legR, -0.1, 0, 0.05);
    },
    // 등불지기 김민채: 장대 등불을 앞으로 내밀고 살랑살랑
    leg_lantern_minchae(t, d, _r, sig) {
        set(d.armL, -1.3 + (sig?.sway ?? 0) * 0.08, 0, -0.2); set(d.armR, -0.2, 0, 0.25);
        d.head.rotation.set(-0.15, 0.15, 0); d.root.rotation.y = 0.2;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 메카 조종사 공병은: 조종간을 잡듯 두 팔을 앞으로, 발사 때 몸을 앞으로 숙임
    leg_mecha_byungeun(t, d, _r, sig) {
        const f = sig?.fire ?? 0;
        set(d.armL, -1.2, 0, -0.15); set(d.armR, -1.2, 0, 0.15);
        d.root.rotation.x = 0.08 + f * 0.08; d.root.position.y += 0.3 + S(t * 6) * 0.03 * f;
        set(d.legL, -0.15, 0, -0.1); set(d.legR, 0.1, 0, 0.1);
    },
    // 벚꽃 검성 김건우: 칼을 비스듬히 내린 채 서 있다가 꽃잎 베기 때 크게 휘두름
    myth_cherryblade_gunwoo(t, d, _r, sig) {
        const k = sig?.cut ?? 0;
        set(d.armR, mix(-0.5, -2.4, k), 0, mix(0.5, -0.6, k)); set(d.armL, -0.3, 0, -0.3);
        d.root.rotation.y = mix(0.3, -0.4, k); d.root.position.y -= 0.15;
        set(d.legL, -0.4, 0, -0.1); set(d.legR, 0.3, 0, 0.1);
    },
    // 수정 마녀 김티비: 수정 구슬 위로 두 손을 펼쳐 주문을 욈
    myth_crystalwitch_tv(t, d, _r, sig) {
        const c = sig?.cast ?? 0;
        set(d.armL, -1.4, 0, -0.4 - c * 0.2); set(d.armR, -1.4, 0, 0.4 + c * 0.2);
        d.root.position.y += 0.5 + S(t * 1.5) * 0.1; d.head.rotation.x = 0.2;
        set(d.legL, 0.2, 0, -0.05); set(d.legR, -0.1, 0, 0.05);
    },
    // 하늘고래와 김가은: 고래를 올려다보며 손을 흔듦
    anc_skywhale_gaeun(t, d, _r, sig) {
        set(d.armR, -0.3 + S(t * 4) * 0.2, 0, 2.6); set(d.armL, -0.2, 0, -0.3);
        d.head.rotation.set(-0.5, S(t * 0.35) * 0.6, 0); d.root.position.y += 0.3 + S(t * 1.2) * 0.1;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 발키리 김민채: 방패를 앞에 들고 창을 높이 세움, 날개를 펼칠 때 하늘로 솟음
    abs_valkyrie_minchae(t, d, _r, sig) {
        const k = sig?.spread ?? 0;
        set(d.armL, -2.4, 0, -0.2); set(d.armR, -1.1, 0, 0.3);
        d.root.position.y += 0.8 + k * 0.6 + S(t * 1.3) * 0.1; d.head.rotation.x = -0.15 - k * 0.1;
        set(d.legL, 0.2, 0, -0.06); set(d.legR, -0.1, 0, 0.06);
    },
    // 인형술사 김가은: 두 팔을 들어 조종대를 번갈아 당김
    leg_puppeteer_gaeun(t, d, _r, sig) {
        const k = sig?.pull ?? 0;
        set(d.armL, -2.3 + k * 0.25, 0, -0.4); set(d.armR, -2.3 - k * 0.25, 0, 0.4);
        d.head.rotation.x = -0.25; d.root.rotation.y = k * 0.1;
        set(d.legL, 0, 0, -0.08); set(d.legR, 0, 0, 0.08);
    },
    // 별빛 궁수 공병은: 활을 앞으로 겨누고 시위를 당겼다 놓으며 하늘로 쏨
    leg_archer_byungeun(t, d, _r, sig) {
        const k = sig?.draw ?? 0;
        set(d.armL, -2.6, 0, -0.1); set(d.armR, -2.4 + k * 0.4, 0, 0.6 - k * 0.3);
        d.root.rotation.y = 0.5; d.head.rotation.set(-0.5, -0.3, 0);
        set(d.legL, -0.25, 0, -0.12); set(d.legR, 0.2, 0, 0.12);
    },
    // 먹물 용 박지성: 붓을 크게 휘두르며 획을 그음
    myth_inkdragon_jisung(t, d, _r, sig) {
        const k = sig?.stroke ?? 0;
        set(d.armR, -1.6 + k * 0.6, 0, 0.5 + k * 0.4); set(d.armL, -0.3, 0, -0.4);
        d.root.rotation.y = k * 0.25; d.root.rotation.x = 0.06;
        set(d.legL, -0.2, 0, -0.12); set(d.legR, 0.15, 0, 0.12);
    },
    // 글리치 김티비: 뻣뻣하게 서 있다 끊길 때 관절이 엉뚱하게 꺾임
    myth_glitch_tv(t, d, _r, sig) {
        const g = sig?.glitch ?? 0;
        set(d.armL, g ? -1.7 : -0.1, 0, g ? -0.3 : -0.08); set(d.armR, g ? 0.6 : -0.1, 0, g ? 1.4 : 0.08);
        d.head.rotation.set(g ? 0.4 : 0, g ? 0.8 : 0, g ? -0.3 : 0);
        set(d.legL, 0, 0, -0.05); set(d.legR, g ? -0.4 : 0, 0, 0.05);
    },
    // 세계뱀 김민채: 팔짱을 낀 채 뱀 고리 안에 떠 있음
    anc_worldserpent_minchae(t, d, _r, sig) {
        set(d.armL, -1.4, 0, 0.9); set(d.armR, -1.4, 0, -0.9);
        d.root.position.y += 0.5 + S(t * 0.8) * 0.12; d.head.rotation.x = -0.1 + (sig?.coil ?? 0) * 0.05;
        set(d.legL, 0.1, 0, -0.04); set(d.legR, -0.05, 0, 0.04);
    },
    // 세라핌 김티비: 불타는 검을 하늘로 높이 치켜들고 공중에 뜸
    abs_seraph_tv(t, d, _r, sig) {
        const k = sig?.raise ?? 0;
        set(d.armR, 0, 0, mix(2.4, 2.9, k)); set(d.armL, -0.4, 0, -0.9);
        d.root.position.y += 1.0 + S(t * 1.1) * 0.15; d.head.rotation.x = -0.3;
        set(d.legL, 0.2, 0, -0.04); set(d.legR, -0.1, 0, 0.04);
    },
    // 꿈을 엮는 김민채: 손끝을 돌리며 실을 엮고, 잠든 듯 둥실
    jxs_dreamweaver_minchae(t, d, _r, sig) {
        const w = sig?.weave ?? 0;
        set(d.armL, -1.2 + w * 0.3, 0, -0.6); set(d.armR, -1.2 - w * 0.3, 0, 0.6);
        d.root.position.y += 1.0 + S(t * 0.8) * 0.15; d.root.rotation.z = S(t * 0.6) * 0.06; d.head.rotation.z = 0.15;
        set(d.legL, 0.3, 0, -0.05); set(d.legR, 0.1, 0, 0.05);
    },
    // 자전거 타는 공병은: 핸들 잡고 페달 밟기
    rare_cyclist_byungeun(t, d) {
        set(d.armL, -1.2, 0, -0.15); set(d.armR, -1.2, 0, 0.15);
        d.root.rotation.x = 0.25; d.root.position.y += 0.6;
        set(d.legL, -1.2 + S(t * 6) * 0.6, 0, -0.05); set(d.legR, -1.2 - S(t * 6) * 0.6, 0, 0.05);
        d.head.rotation.x = -0.3;
    },
    // 비눗방울 김민채: 막대를 입 앞에 대고 후~ 불기
    ep_bubble_minchae(t, d) {
        const k = pulse(t, 2.4, 1.2);
        set(d.armR, -2.0, 0, -0.3); set(d.armL, -0.3, 0, -0.2);
        d.head.rotation.x = -0.15 - k * 0.15; d.root.rotation.y = S(t * 0.5) * 0.2;
        set(d.legL, 0, 0, -0.06); set(d.legR, 0, 0, 0.06);
    },
    // 로봇 춤 박지성: 딱딱 끊기는 팝핀
    ep_robot_jisung(t, d) {
        const b = Math.floor(t * 2.5) % 4;
        const A = [[-1.57, 0, 0, 0.3], [0, 1.57, 0.3, 0], [-1.57, -1.57, -0.3, 0], [0, 0, 0, -0.3]][b];
        set(d.armL, A[0], 0, -0.1 - (b === 1 ? 1.4 : 0)); set(d.armR, A[1] ? -1.57 : 0, 0, 0.1 + (b === 2 ? 1.4 : 0));
        d.head.rotation.y = A[2]; d.root.rotation.y = A[3];
        set(d.legL, 0, 0, -0.06); set(d.legR, b % 2 ? -0.3 : 0, 0, 0.06);
    },
    // 달빛 거미 김가은: 실에 매달린 듯 살짝 떠서 흔들림
    leg_moonspider_gaeun(t, d, _r, sig) {
        const k = sig?.crawl ?? 0;
        set(d.armL, -0.6, 0, -0.9 + k * 0.1); set(d.armR, -0.6, 0, 0.9 - k * 0.1);
        d.root.position.y += 0.7 + S(t * 0.9) * 0.15; d.root.rotation.z = S(t * 0.7) * 0.05; d.head.rotation.x = 0.1;
        set(d.legL, 0.3, 0, -0.15); set(d.legR, -0.1, 0, 0.15);
    },
    // 이카루스 김티비: 팔을 활짝 펴고 날갯짓에 맞춰 위아래로
    leg_icarus_tv(t, d, _r, sig) {
        const f = sig?.flap ?? 0;
        set(d.armL, 0, 0, -1.4 - f * 0.35); set(d.armR, 0, 0, 1.4 + f * 0.35);
        d.root.position.y += 1.0 + f * 0.25; d.root.rotation.x = 0.1; d.head.rotation.x = -0.35;
        set(d.legL, 0.2, 0, -0.05); set(d.legR, 0.1, 0, 0.05);
    },
    // 종이학 김가은: 두 손을 모아 학을 접어 날려 보냄
    myth_crane_gaeun(t, d, _r, sig) {
        const k = sig?.fold ?? 0, rel = k > 0.8 ? (k - 0.8) / 0.2 : 0;
        set(d.armL, -1.3 - rel * 0.8, 0, 0.35 - rel * 0.5); set(d.armR, -1.3 - rel * 0.8, 0, -0.35 + rel * 0.5);
        d.head.rotation.x = 0.25 - rel * 0.6;
        set(d.legL, 0, 0, -0.06); set(d.legR, 0, 0, 0.06);
    },
    // 만화경 김민채: 만화경을 눈에 대고 이리저리 돌려 봄
    myth_kaleido_minchae(t, d, _r, sig) {
        const k = sig?.peek ?? 0;
        set(d.armR, -2.5, 0, -0.2); set(d.armL, -1.0, 0, 0.5);
        d.head.rotation.set(-0.1, -0.15 + S(t * 0.8) * 0.2, k * 0.2); d.root.rotation.y = S(t * 0.4) * 0.3;
        set(d.legL, 0, 0, -0.08); set(d.legR, -0.15, 0, 0.08);
    },
    // 티탄 박지성: 두 팔로 천구를 떠받치고 버팀
    anc_titan_jisung(t, d, _r, sig) {
        const k = sig?.strain ?? 0;
        set(d.armL, 0, 0, -2.75 + k * 0.06); set(d.armR, 0, 0, 2.75 - k * 0.06);
        d.root.position.y -= 0.15 + k * 0.05; d.head.rotation.x = -0.25;
        set(d.legL, -0.3, 0, -0.3); set(d.legR, 0.3, 0, 0.3);
    },
    // 별을 떨어뜨리는 공병은: 지팡이를 하늘로 치켜들었다 내림
    abs_meteor_byungeun(t, d, _r, sig) {
        const k = sig?.cast ?? 0;
        set(d.armR, 0, 0, mix(1.4, 2.9, k)); set(d.armL, -0.5, 0, -0.6 - k * 0.4);
        d.root.position.y += 0.6 + S(t * 1.1) * 0.12; d.head.rotation.x = -0.2 - k * 0.3;
        set(d.legL, 0.15, 0, -0.08); set(d.legR, -0.1, 0, 0.08);
    },
    // 태초의 박지성: 두 손바닥을 벌려 빛을 빚어내며 높이 떠 있음
    jxs_genesis_jisung(t, d, _r, sig) {
        const k = sig?.create ?? 0;
        set(d.armL, -1.1 - k * 0.5, 0, -0.7 - k * 0.3); set(d.armR, -1.1 - k * 0.5, 0, 0.7 + k * 0.3);
        d.root.position.y += 1.3 + S(t * 0.7) * 0.18; d.head.rotation.x = -0.15 - k * 0.15;
        set(d.legL, 0.25, 0, -0.03); set(d.legR, 0.05, 0, 0.03);
    },
    // 시즌1 개척자: 한 손을 이마에 대고 먼 곳을 바라보며 걷는 듯 살랑
    pass_pioneer(t, d, _r, sig) {
        const w = sig?.step ?? 0;
        set(d.armL, -2.2, 0, -0.5); set(d.armR, -0.2 + w * 0.15, 0, 0.2);
        d.head.rotation.y = 0.3 + S(t * 0.5) * 0.15; d.head.rotation.x = -0.1;
        set(d.legL, w * 0.25, 0, -0.04); set(d.legR, -w * 0.25, 0, 0.04);
    },
    // 황금 개척왕: 허리에 손을 얹고 당당하게, 가끔 한 팔을 앞으로 뻗어 명령
    pass_goldking(t, d, _r, sig) {
        const k = sig?.rule ?? 0;
        set(d.armR, -0.2, 0, -0.6); set(d.armL, mix(-0.2, -1.5, k), 0, mix(0.6, -0.1, k));
        d.head.rotation.x = -0.12; d.root.position.y += 0.1 + S(t * 1.1) * 0.05;
        set(d.legL, 0, 0, -0.14); set(d.legR, 0, 0, 0.14);
    },
    // 카우보이 박지성: 한 팔을 높이 들어 올가미를 돌리고 짝다리
    leg_cowboy_jisung(t, d) {
        set(d.armL, -0.3 + S(t * 6) * 0.15, 0, -2.7); set(d.armR, -0.2, 0, 0.35);
        d.root.rotation.z = 0.05; d.head.rotation.y = -0.2;
        set(d.legL, 0, 0, -0.12); set(d.legR, -0.15, 0, 0.18);
    },
    // 마법소녀 김민채: 지팡이를 앞으로 내밀고 살짝 뜸, 변신 빛 때 두 팔 활짝
    leg_magical_minchae(t, d, _r, sig) {
        const k = sig?.cast ?? 0;
        set(d.armR, mix(-1.5, -0.4, k), 0, mix(0.2, 1.6, k)); set(d.armL, mix(-0.4, -0.4, k), 0, mix(-0.4, -1.6, k));
        d.root.position.y += 0.4 + S(t * 2) * 0.1; d.head.rotation.z = S(t * 1.4) * 0.08;
        set(d.legL, -0.3, 0, -0.05); set(d.legR, 0.1, 0, 0.05);
    },
    // 불꽃놀이 공병은: 폭죽 막대를 들고 하늘을 올려다봄, 펑 할 때 움찔
    myth_fireworks_byungeun(t, d, _r, sig) {
        const b = sig?.boom ?? 0;
        set(d.armR, -1.1, 0, 0.3); set(d.armL, -0.2 - b * 0.4, 0, -0.3);
        d.head.rotation.x = -0.45 - b * 0.1; d.root.position.y += b * 0.1;
        set(d.legL, 0, 0, -0.05); set(d.legR, 0, 0, 0.05);
    },
    // 만월의 늑대 김가은: 웅크렸다가 하울링 때 고개를 젖히고 포효
    anc_moonwolf_gaeun(t, d, _r, sig) {
        const h = sig?.howl ?? 0;
        set(d.armL, mix(-0.6, -0.2, h), 0, mix(-0.3, -0.9, h)); set(d.armR, mix(-0.6, -0.2, h), 0, mix(0.3, 0.9, h));
        d.head.rotation.x = mix(0.15, -0.8, h); d.root.rotation.x = mix(0.12, -0.08, h);
        d.root.position.y += mix(-0.15, 0.1, h);
        set(d.legL, mix(-0.4, 0, h), 0, -0.1); set(d.legR, mix(-0.4, 0, h), 0, 0.1);
    },
    abs_timestop_byungeun(t, d, _r, sig) {
        const k = sig?.stop ?? 0;
        set(d.armL, mix(-0.3, -1.6, k), 0, mix(-0.15, 0, k)); set(d.armR, -0.35, 0, 0.2);
        d.head.rotation.x = mix(0.15, -0.05, k); d.head.rotation.y = mix(S(t * 0.6) * 0.2, 0, k);
        d.root.position.y += mix(S(t * 1.1) * 0.06, 0, k);
        set(d.legL, -0.1, 0, -0.06); set(d.legR, 0.1, 0, 0.06);
    },
    // 창조주 김가은: 높이 떠서 행성을 든 손을 앞으로, 다른 손은 펼침
    jxs_creator_gaeun(t, d, _r, sig) {
        const c = sig?.create ?? 0;
        d.root.position.y += 1.1 + S(t * 0.9) * 0.15;
        set(d.armR, -1.6 - c * 0.3, 0, 0.3); set(d.armL, -0.4 - c * 0.6, 0, -1.2 + S(t * 0.9) * 0.1);
        set(d.legL, 0.12, 0, -0.05); set(d.legR, -0.1, 0, 0.05);
        d.head.rotation.x = -0.1; d.head.rotation.y = S(t * 0.5) * 0.12;
    },
    // 디버거 공병은: 허공의 키보드를 두드림 (두 팔 앞으로, 손이 번갈아 톡톡)
    myth_debugger_byungeun(t, d) {
        set(d.armL, -1.25 + S(t * 14) * 0.08, 0, -0.05); set(d.armR, -1.25 + S(t * 14 + 1.6) * 0.08, 0, 0.05);
        d.head.rotation.x = 0.18 + S(t * 0.7) * 0.05; d.head.rotation.y = S(t * 0.9) * 0.25;
        d.root.position.y += 0.4 + S(t * 1.4) * 0.08;
        set(d.legL, -0.15, 0, -0.04); set(d.legR, 0.1, 0, 0.04);
    },
    // 밴해머 김건우: 망치를 높이 들었다가(phase 1) 앞으로 쾅
    abs_banhammer_gunwoo(t, d, _r, sig) {
        const k = sig?.phase ?? 0;
        set(d.armL, mix(-0.9, -3.05, k), 0, -0.1);
        set(d.armR, mix(-0.3, -0.7, k), 0, 0.25);
        d.root.rotation.x = mix(0.18, -0.12, k); d.head.rotation.x = mix(0.25, -0.15, k);
        set(d.legL, mix(-0.35, -0.1, k), 0, -0.08); set(d.legR, mix(0.3, 0.1, k), 0, 0.08);
    },
    // 호박머리 공병은: 등불을 앞으로 들고 흐느적, 가끔 고개를 갸웃
    leg_pumpkin_byungeun(t, d) {
        const tilt = pulse(t, 4, 1.4);
        set(d.armR, -1.0 + S(t * 1.8) * 0.08, 0, 0.15); set(d.armL, S(t * 1.1) * 0.15, 0, -0.12);
        d.head.rotation.z = tilt * 0.45; d.head.rotation.y = S(t * 0.7) * 0.2;
        d.root.rotation.z = S(t * 1.1) * 0.06; d.root.position.y += Math.abs(S(t * 1.1)) * 0.06;
        set(d.legL, S(t * 1.1) * 0.12); set(d.legR, -S(t * 1.1) * 0.12);
    },
    // 마녀 김티비: 빗자루에 걸터앉아 둥실, 지팡이를 휘두름
    myth_witch_tv(t, d, _r, sig) {
        const k = sig?.castK ?? 0;
        d.root.position.y += 0.8 + S(t * 1.6) * 0.2;
        d.root.rotation.z = S(t * 1.6) * 0.05; d.root.rotation.x = -0.05;
        set(d.legL, -1.45, 0, -0.12); set(d.legR, -1.45, 0, 0.12);
        set(d.armR, -0.9, 0, 0.1);
        set(d.armL, mix(-0.5, -2.6, k) + S(t * 9) * 0.15 * k, 0, mix(-0.3, -0.5, k));
        d.head.rotation.z = -0.1 + S(t * 0.8) * 0.08; d.head.rotation.x = -k * 0.2;
    },
    // 목 없는 기사 김가은: 불타는 호박을 높이 들고, 유령마가 앞발을 들 때 더 높이
    abs_headless_gaeun(t, d, _r, sig) {
        const k = sig?.raise ?? 0;
        set(d.armR, mix(-1.1, -2.3, k), 0, mix(0.9, 0.5, k)); set(d.armL, -0.7 + S(t * 1.3) * 0.06, 0, -0.15);
        d.root.position.y += S(t * 1.3) * 0.05; d.root.rotation.x = -k * 0.08;
        set(d.legL, 0.05, 0, -0.06); set(d.legR, -0.05, 0, 0.06);
    },
    leg_necro_tv(t, d, _r, sig) {
        const k = sig?.castK ?? 0;
        set(d.armR, -1.1, 0, -0.2); set(d.armL, mix(0.1, -0.4, k), 0, mix(0.15, 2.6, k));
        d.head.rotation.x = mix(0.25, -0.2, k); d.root.position.y += 0.3 + S(t) * 0.08;
    },
    // 기계 천사 김민채: 공중에 떠서 두 팔을 아래로 펼침
    leg_mechangel_minchae(t, d) {
        set(d.armL, -0.2, 0, -0.7 - S(t * 0.9) * 0.2); set(d.armR, -0.2, 0, 0.7 + S(t * 0.9) * 0.2);
        set(d.legL, 0.1, 0, -0.05); set(d.legR, -0.1, 0, 0.05);
        d.root.position.y += 1.0 + S(t * 0.9) * 0.2; d.head.rotation.x = 0.15;
    },
    // 뱀파이어 백작 김건우: 망토로 얼굴을 가렸다가, 펼칠 때 두 팔을 활짝
    anc_vampire_gunwoo(t, d, _r, sig) {
        const k = sig?.spread ?? 0;
        set(d.armL, mix(-1.5, -0.2, k), 0, mix(1.1, -1.9, k));
        set(d.armR, mix(-0.2, -0.2, k), 0, mix(0.1, 1.9, k));
        d.head.rotation.x = mix(0.2, -0.25, k); d.head.rotation.y = mix(0.3, 0, k);
        d.root.position.y += 0.25 * k + S(t * 1.2) * 0.06;
        set(d.legL, 0, 0, -0.04 - k * 0.08); set(d.legR, 0, 0, 0.04 + k * 0.08);
    },
    // 블랙홀 공병은: 머리 위 블랙홀에 끌려가듯 몸이 들리고 팔이 위로 당겨짐
    myth_blackhole_byungeun(t, d) {
        set(d.armL, -0.3, 0, -2.3 - S(t * 1.3) * 0.2); set(d.armR, -0.3, 0, 2.3 + S(t * 1.1) * 0.2);
        set(d.legL, 0.25, 0, -0.1); set(d.legR, -0.15, 0, 0.1);
        d.root.position.y += 1.2 + S(t * 0.6) * 0.3; d.root.rotation.z = S(t * 0.5) * 0.15; d.head.rotation.x = -0.4;
    },
    // 불사조 김가은: 날갯짓에 맞춰 팔을 크게 펼침
    myth_phoenix_gaeun(t, d, _r, sig) {
        const f = sig?.flapK ?? S(t * 2.4);
        set(d.armL, -0.2, 0, -1.4 - f * 0.4); set(d.armR, -0.2, 0, 1.4 + f * 0.4);
        set(d.legL, 0.1, 0, -0.05); set(d.legR, -0.1, 0, 0.05);
        d.root.position.y += 1.1 - f * 0.15; d.head.rotation.x = -0.25;
    },
    // 성운의 주인 박지성: 지휘하듯 두 팔로 별을 그림
    anc_nebula_jisung(t, d) {
        set(d.armL, -1.0 + S(t * 0.8) * 0.5, 0, 0.9 + C(t * 0.8) * 0.4);
        set(d.armR, -1.6 + S(t * 0.8 + 2) * 0.6, 0, -1.2 - C(t * 0.8 + 2) * 0.5);
        d.root.position.y += 0.7 + S(t * 0.6) * 0.15; d.head.rotation.x = -0.3; d.root.rotation.y = S(t * 0.3) * 0.3;
    },
    // 얼음 여제 김티비: 홀을 높이 들어 얼음 가시를 부름
    anc_iceemperor_tv(t, d, _r, sig) {
        const k = sig?.raiseK ?? 0;
        set(d.armL, mix(-0.7, -2.6, k), 0, 0.2); set(d.armR, 0.25, 0, -0.35);
        d.head.rotation.x = mix(0.05, -0.25, k); d.root.rotation.x = -k * 0.05;
        set(d.legL, 0, 0, -0.1); set(d.legR, 0, 0, 0.1);
    },
    // 혼돈의 신 김가은: 공중에서 비틀린 자세로 두 팔을 펼침, 가끔 몸이 끊기듯 튐
    abs_chaos_gaeun(t, d) {
        const g = Math.floor(t * 3) % 7 === 0 ? 0.25 : 0;
        set(d.armL, -0.6 + S(t * 1.1) * 0.3, 0.3, 1.7 + g); set(d.armR, -0.2 + S(t * 0.9) * 0.3, -0.3, -1.3 - g);
        d.root.position.y += 1.3 + S(t * 0.7) * 0.25; d.root.position.x += g * 0.6;
        d.root.rotation.z = S(t * 0.6) * 0.2 + g; d.head.rotation.z = -0.3 + S(t * 1.3) * 0.15;
        set(d.legL, 0.3, 0, -0.2); set(d.legR, -0.25, 0, 0.15);
    },
    // 태양왕 김건우: 가슴을 펴고 두 팔을 하늘로, 폭발할 때 더 크게
    abs_sunking_gunwoo(t, d, _r, sig) {
        const f = sig?.flareK ?? 0;
        set(d.armL, -0.25, 0, -2.3 - f * 0.5); set(d.armR, -0.25, 0, 2.3 + f * 0.5);
        d.head.rotation.x = -0.35 - f * 0.15; d.root.position.y += 0.6 + f * 0.3;
        set(d.legL, 0, 0, -0.12); set(d.legR, 0, 0, 0.12);
    },

    // 체육대회 계주 김건우: 바통 들고 전력질주
    rare_relay_gunwoo(t, d) {
        const w = S(t * 11);
        set(d.armL, w * 1.1, 0, -0.1); set(d.armR, -w * 1.1, 0, 0.1);
        set(d.legL, -w * 0.9, 0, 0); set(d.legR, w * 0.9, 0, 0);
        d.root.rotation.x = 0.3; d.root.position.y += Math.abs(w) * 0.2;
    },
    // 치킨 배달 박지성: 한 손에 봉지 들고 다른 손으로 폰 확인
    rare_chicken_jisung(t, d) {
        const look = pulse(t, 4, 1.4);
        set(d.armL, -0.1, 0, 0.15); set(d.armR, mix(-0.3, -1.4, look), 0, -0.2);
        d.head.rotation.x = look * 0.35; d.head.rotation.y = S(t * 0.8) * 0.3 * (1 - look);
    },
    // 독수리 조련사 공병은: 독수리가 내려앉을 땐 팔을 옆으로 내밀어 받침
    ep_falconer_byungeun(t, d, _r, sig) {
        const k = sig?.perchK ?? 0;
        set(d.armR, mix(-0.4, -0.3, k), 0, mix(0.4, 1.45, k)); set(d.armL, 0.2, 0, -0.2);
        d.head.rotation.x = mix(-0.45, 0.05, k); d.head.rotation.y = mix(S(t * 0.9) * 0.6, -0.5, k);
    },
    // 벚꽃 무희 김가은: 한 바퀴 돌며 팔을 흐르듯
    ep_sakura_gaeun(t, d) {
        set(d.armL, -0.4 + S(t * 1.5) * 0.4, 0, 1.6 + S(t * 1.5) * 0.6); set(d.armR, -0.4 - S(t * 1.5) * 0.4, 0, -1.2 - C(t * 1.5) * 0.5);
        d.root.rotation.y = t * 0.9; set(d.legL, -0.4, 0, 0); d.root.position.y += 0.15 + Math.abs(S(t * 1.5)) * 0.1;
    },
    // 사막의 공주 김티비: 양탄자 위에 팔짱 끼고 섬
    leg_desert_tv(t, d) {
        set(d.armL, -1.3, 0.6, 0.9); set(d.armR, -1.3, -0.6, -0.9);
        d.root.position.y += 0.35 + S(t * 1.5) * 0.1; d.head.rotation.x = -0.1; d.root.rotation.y = S(t * 0.4) * 0.3;
    },
    // 강철 골렘 박지성: 골렘과 같이 주먹을 들었다 내려침
    leg_golem_jisung(t, d, _r, sig) {
        const k = sig?.golemK ?? 0;
        set(d.armL, -0.2 - k * 2.6, 0, 0.2); set(d.armR, -0.2 - k * 2.6, 0, -0.2);
        set(d.legL, -0.2, 0, -0.18); set(d.legR, 0.15, 0, 0.18); d.root.position.y -= 0.15;
    },
    // 오로라 여왕 김가은: 두 팔을 하늘로 펼쳐 오로라를 부름
    myth_aurora_gaeun(t, d) {
        set(d.armL, -0.3, 0, -2.4 - S(t * 0.7) * 0.25); set(d.armR, -0.3, 0, 2.4 + S(t * 0.7 + 1) * 0.25);
        d.root.position.y += 0.8 + S(t * 0.6) * 0.2; d.head.rotation.x = -0.35; d.root.rotation.y = S(t * 0.25) * 0.4;
    },
    // 벼락 신수 김민채: 늑대가 울부짖을 때 한 팔을 하늘로
    myth_thunderbeast_minchae(t, d, _r, sig) {
        const k = sig?.howlK ?? 0;
        set(d.armL, mix(-0.4, -0.3, k), 0, mix(0.3, 2.8, k)); set(d.armR, 0.2, 0, -0.35);
        d.head.rotation.x = mix(0.05, -0.4, k); set(d.legL, -0.2, 0, -0.15); set(d.legR, 0.15, 0, 0.15);
    },
    // 운명의 직조자 김건우: 양손을 들어 실을 당기듯 손을 번갈아 움직임
    anc_fate_gunwoo(t, d) {
        set(d.armL, -1.5 + S(t * 1.2) * 0.35, 0, 0.6); set(d.armR, -1.5 - S(t * 1.2) * 0.35, 0, -0.6);
        d.root.position.y += 0.5 + S(t * 0.6) * 0.12; d.head.rotation.x = 0.1; d.root.rotation.y = S(t * 0.4) * 0.2;
    },
    // 폭풍의 눈 공병은: 태풍 한가운데 떠서 팔짱 → 번개를 부를 땐 한 손을 하늘로
    abs_breaker_byungeun(t, d, _r, sig) {
        const k = sig?.callK ?? 0;
        set(d.armL, mix(-1.3, -0.3, k), mix(0.6, 0, k), mix(0.9, 2.9, k)); set(d.armR, -1.3, -0.6, -0.9);
        d.root.position.y += 1.2 + S(t * 0.7) * 0.2; d.head.rotation.x = mix(0.1, -0.35, k);
        set(d.legL, 0.15, 0, -0.06); set(d.legR, -0.1, 0, 0.06);
        d.root.rotation.y = S(t * 0.3) * 0.25;
    },
    // 가장 어두운 밤 김민채: 두 갈래 창을 짚고 군림 → 창을 높이 들어 → 바닥에 내리꽂음
    // 어드민 박지성: 떠서 한 손을 들어 명령, 커서가 누를 때 손가락으로 딱
    jxs_admin_jisung(t, d, _r, sig) {
        const k = sig?.click ?? 0;
        d.root.position.y += 0.9 + S(t * 1.2) * 0.12;
        set(d.armL, mix(-0.4, -1.9, k), 0, mix(-0.4, -0.1, k));
        set(d.armR, -0.25, 0, 0.55 + S(t * 1.2) * 0.05);
        set(d.legL, 0.15, 0, -0.06); set(d.legR, -0.1, 0, 0.06);
        d.head.rotation.x = -0.12; d.head.rotation.y = S(t * 0.5) * 0.15;
    },
    // 호박 대왕 김민채: 낫을 짚고 서 있다가, 거대 호박이 웃을 때 빈손을 번쩍
    jxs_pumpkinking_minchae(t, d, _r, sig) {
        const k = sig?.laugh ?? 0;
        set(d.armL, -0.35, 0, -0.18);
        set(d.armR, -0.2 - k * 0.3, 0, mix(0.15, 2.7, k));
        d.head.rotation.x = mix(0.05, -0.3, k); d.head.rotation.y = S(t * 0.5) * 0.15 * (1 - k);
        d.root.position.y += S(t * 1.1) * 0.05 + k * 0.3;
        set(d.legL, 0, 0, -0.1); set(d.legR, 0, 0, 0.1);
    },
    jxs_darkestnight_minchae(t, d, _r, sig) {
        const up = sig?.raiseK ?? 0, sl = sig?.slamK ?? 0;
        const armX = sl > 0 ? mix(-0.3, -1.3, sl) : mix(-0.3, -2.8, up);
        set(d.armL, armX, 0, mix(0.2, 0.1, Math.max(up, sl)));
        set(d.armR, mix(-0.2, -0.6, up), 0, mix(-0.45, -1.4, up));
        d.head.rotation.x = mix(0.12, -0.25, up) + sl * 0.15;
        d.root.position.y += 0.4 + S(t * 0.6) * 0.1 - sl * 0.2;
        d.root.rotation.x = sl * 0.2;
        set(d.legL, 0, 0, -0.1); set(d.legR, 0, 0, 0.1);
    }
};
