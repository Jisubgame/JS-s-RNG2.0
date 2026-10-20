export const CRAFT_ITEMS = [
    // 🥊 건틀렛 (영구 행운/속도)
    {
        id: "gear_beginner",
        category: "gauntlet",
        name: "초보자의 운수대통 건틀렛",
        desc: "영구적으로 행운이 10% 증가합니다.",
        luckBonus: 0.1,
        speedBonus: 0,
        req: { "com_normal": 15, "com_sleepy_jisung": 10, "unc_tired": 3 }
    },
    {
        id: "gear_speed",
        category: "gauntlet",
        name: "폭주기관차의 건틀렛",
        desc: "영구적으로 롤 속도와 쿨타임이 10% 단축됩니다.",
        luckBonus: 0,
        speedBonus: 0.1,
        req: { "rare_train": 5, "unc_running": 15, "com_just_byungeun": 20 }
    },
    {
        id: "gear_destroyer_fist",
        category: "gauntlet",
        name: "파괴신의 건틀렛",
        desc: "영구적으로 행운 25%, 속도 15%가 증가합니다.",
        luckBonus: 0.25,
        speedBonus: 0.15,
        req: { "epic_destroy": 3, "ep_baksisung": 6, "rare_new_jisung": 10, "unc_tired": 30 }
    },
    {
        id: "gear_crazykong_heart",
        category: "gauntlet",
        name: "크레이지콩 건틀렛",
        desc: "영구적으로 행운 50%, 속도 20%가 증가합니다.",
        luckBonus: 0.5,
        speedBonus: 0.2,
        req: { "ep_crazykong": 2, "epic_destroy": 5, "rare_soldier": 25 }
    },
    {
        id: "gear_wizard",
        category: "gauntlet",
        name: "대마법사의 건틀렛",
        desc: "영구적으로 행운 100%, 속도 25%가 증가합니다.",
        luckBonus: 1.0,
        speedBonus: 0.25,
        req: { "legend_wizard": 1, "legend_speed": 2, "ep_crazykong": 4, "epic_destroy": 10 }
    },
    {
        id: "gear_two_hearts",
        category: "gauntlet",
        name: "두 심장의 건틀렛",
        desc: "영구적으로 행운 250%, 속도 30%가 증가합니다.",
        luckBonus: 2.5,
        speedBonus: 0.3,
        req: { "mythic_heart": 1, "epic_monkey": 2, "gemini_basic": 2, "legend_wizard": 4 }
    },

    // 📜 부적 (10롤마다 다음 1롤 행운 배수)
    {
        id: "amulet_drum",
        category: "amulet",
        name: "평범함의 부적",
        desc: "롤을 10회 돌리면 다음 1회 롤에 행운이 2배로 증가합니다.",
        luckBonus: 0,
        speedBonus: 0,
        req: { "com_normal": 300 }
    },
    {
        id: "amulet_commander",
        category: "amulet",
        name: "미나이의 부적",
        desc: "롤을 10회 돌리면 다음 1회 롤에 행운이 5배로 증가합니다.",
        luckBonus: 0,
        speedBonus: 0,
        req: { "gemini_basic": 2, "legend_speed": 4, "rare_soldier": 50, "com_just_byungeun": 300 }
    },

    // 🎰 상점 뽑기 전용 (제작 불가, 뽑기에서만 나옴)
    {
        id: "gacha_dice", category: "gauntlet", gacha: true,
        name: "행운의 주사위 건틀렛",
        desc: "영구적으로 행운 150%, 속도 15%가 증가합니다.",
        luckBonus: 1.5, speedBonus: 0.15, req: {}
    },
    {
        id: "gacha_jackpot", category: "gauntlet", gacha: true,
        name: "잭팟 건틀렛",
        desc: "영구적으로 행운 400%, 속도 10%가 증가합니다.",
        luckBonus: 4, speedBonus: 0.1, req: {}
    },
    {
        id: "gacha_comet", category: "gauntlet", gacha: true,
        name: "별똥별 건틀렛",
        desc: "영구적으로 행운 800%, 속도 5%가 증가합니다.",
        luckBonus: 8, speedBonus: 0.05, req: {}
    },
    {
        id: "gacha_clover", category: "amulet", gacha: true,
        name: "네잎클로버 부적",
        desc: "롤을 7회 돌리면 다음 1회 롤에 행운이 3배로 증가합니다.",
        luckBonus: 0, speedBonus: 0, amuletMult: 3, amuletEvery: 7, req: {}
    },
    {
        id: "gacha_compass", category: "amulet", gacha: true,
        name: "폭풍 나침반 부적",
        desc: "바이옴이 2배 더 자주 오고, 1.5배 더 오래 머뭅니다.",
        luckBonus: 0, speedBonus: 0, biomeBoost: 2, biomeTime: 1.5, req: {}
    },
    {
        id: "gacha_cat", category: "amulet", gacha: true,
        name: "황금 고양이 부적",
        desc: "롤을 10회 돌리면 다음 1회 롤에 행운이 10배로 증가합니다.",
        luckBonus: 0, speedBonus: 0, amuletMult: 10, amuletEvery: 10, req: {}
    },

    // 🎃 할로윈 한정 뽑기 전용
    {
        id: "hw_pumpkin", category: "gauntlet", gacha: "halloween",
        name: "잭오랜턴 건틀렛",
        desc: "영구적으로 행운 250%, 속도 15%가 증가합니다.",
        luckBonus: 2.5, speedBonus: 0.15, req: {}
    },
    {
        id: "hw_skull", category: "gauntlet", gacha: "halloween",
        name: "해골왕 건틀렛",
        desc: "영구적으로 행운 600%, 속도 5%가 증가합니다.",
        luckBonus: 6, speedBonus: 0.05, req: {}
    },
    {
        id: "hw_ghost", category: "amulet", gacha: "halloween",
        name: "꼬마 유령 부적",
        desc: "롤을 8회 돌리면 다음 1회 롤에 행운이 4배로 증가합니다.",
        luckBonus: 0, speedBonus: 0, amuletMult: 4, amuletEvery: 8, req: {}
    },
    {
        id: "hw_candy", category: "amulet", gacha: "halloween",
        name: "사탕 바구니 부적",
        desc: "롤마다 뽑은 칭호 판매가의 10%만큼 JC를 더 받습니다. (한 번에 최대 500 JC)",
        luckBonus: 0, speedBonus: 0, jcBonus: 0.1, jcBonusMax: 500, req: {}
    },
    // 🎫 시즌 패스 전용 (PRO 15레벨 보상)
    {
        id: "pass_gauntlet", category: "gauntlet", gacha: "pass",
        name: "개척자의 건틀렛",
        desc: "시즌 1 PRO 패스 보상. 영구적으로 행운 500%, 속도 15%가 증가합니다.",
        luckBonus: 5, speedBonus: 0.15, req: {}
    },
    {
        id: "pass_amulet", category: "amulet", gacha: "pass",
        name: "개척의 별 부적",
        desc: "시즌 1 PRO 패스 보상. 8롤마다 행운이 ×12배가 됩니다. 행운 +50%.",
        luckBonus: 0.5, speedBonus: 0, amuletMult: 12, amuletEvery: 8, req: {}
    }
];
