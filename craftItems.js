export const CRAFT_ITEMS = [
    // 🥊 건틀렛 (영구 행운/속도)
    {
        id: "gear_beginner",
        category: "gauntlet",
        name: "초보자의 운수대통 건틀렛",
        desc: "영구적으로 행운이 10% 증가합니다.",
        luckBonus: 0.1,
        speedBonus: 0,
        req: { "com_normal": 100, "com_sleepy_jisung": 60, "unc_tired": 20 }
    },
    {
        id: "gear_speed",
        category: "gauntlet",
        name: "폭주기관차의 건틀렛",
        desc: "영구적으로 롤 속도와 쿨타임이 10% 단축됩니다.",
        luckBonus: 0,
        speedBonus: 0.1,
        req: { "rare_train": 3, "unc_running": 80, "com_just_byungeun": 150 }
    },
    {
        id: "gear_destroyer_fist",
        category: "gauntlet",
        name: "파괴신의 건틀렛",
        desc: "영구적으로 행운 25%, 속도 15%가 증가합니다.",
        luckBonus: 0.25,
        speedBonus: 0.15,
        req: { "epic_destroy": 1, "ep_baksisung": 3, "rare_new_jisung": 8, "unc_tired": 200 }
    },
    {
        id: "gear_crazykong_heart",
        category: "gauntlet",
        name: "크레이지콩 건틀렛",
        desc: "영구적으로 행운 50%, 속도 20%가 증가합니다.",
        luckBonus: 0.5,
        speedBonus: 0.2,
        req: { "ep_crazykong": 1, "epic_destroy": 3, "rare_soldier": 30, "com_gunwoo": 500 }
    },
    {
        id: "gear_wizard",
        category: "gauntlet",
        name: "대마법사의 건틀렛",
        desc: "영구적으로 행운 100%, 속도 25%가 증가합니다.",
        luckBonus: 1.0,
        speedBonus: 0.25,
        req: { "legend_wizard": 1, "legend_speed": 2, "ep_crazykong": 1, "epic_destroy": 5, "rare_soldier": 60 }
    },
    {
        id: "gear_two_hearts",
        category: "gauntlet",
        name: "두 심장의 건틀렛",
        desc: "영구적으로 행운 250%, 속도 30%가 증가합니다.",
        luckBonus: 2.5,
        speedBonus: 0.3,
        req: { "mythic_heart": 1, "gemini_basic": 1, "epic_monkey": 1, "legend_wizard": 3, "ep_baksisung": 15 }
    },

    // 🆕 UPDATE 3 제작 건틀렛 (뽑기 장비와 비슷한 급, 대신 칭호를 모아야 함)
    {
        id: "gear_timewarp", category: "gauntlet",
        name: "시간 가속 건틀렛",
        desc: "영구적으로 속도 45%, 행운 80%가 증가합니다. 속도 특화.",
        luckBonus: 0.8, speedBonus: 0.45,
        req: { "myth_time_minchae": 2, "legend_speed": 5, "ep_neon_gaeun": 15, "rare_train": 120, "unc_running": 1000 }
    },
    {
        id: "gear_thunderhunt", category: "gauntlet",
        name: "번개 사냥꾼 건틀렛",
        desc: "영구적으로 행운 150%, 속도 20%가 증가합니다. (행운의 주사위 건틀렛 급)",
        luckBonus: 1.5, speedBonus: 0.2,
        req: { "myth_thunderbeast_minchae": 1, "leg_ninja_jisung": 4, "leg_storm_gaeun": 3, "ep_fire_jisung": 20, "rare_relay_gunwoo": 100, "com_sleepy_jisung": 1500 }
    },
    {
        id: "gear_abyssking", category: "gauntlet",
        name: "심해 군주의 건틀렛",
        desc: "영구적으로 행운 350%, 속도 12%가 증가합니다. (잭팟 건틀렛 급)",
        luckBonus: 3.5, speedBonus: 0.12,
        req: { "anc_dragonking_jisung": 1, "myth_abyss_byungeun": 2, "myth_aurora_gaeun": 2, "leg_pirate_byungeun": 5, "ep_swim_gaeun": 25, "rare_fishing_gunwoo": 200, "unc_walk_byungeun": 1500 }
    },
    {
        id: "gear_sunforge", category: "gauntlet",
        name: "태양 대장간 건틀렛",
        desc: "영구적으로 행운 650%, 속도 15%가 증가합니다. (별똥별 건틀렛 바로 아래 급)",
        luckBonus: 6.5, speedBonus: 0.15,
        req: { "abs_sunking_gunwoo": 1, "anc_pharaoh_minchae": 2, "myth_midas_gaeun": 3, "leg_desert_tv": 8, "ep_lava_tv": 40, "rare_cvs_jisung": 250, "com_gunwoo": 2500 }
    },

    // 🆕 UPDATE 3 제작 부적 (배수 말고 새로운 능력)
    {
        id: "amu_hourglass", category: "amulet", abil: "streak",
        name: "인내의 모래시계 부적",
        desc: "롤마다 행운이 +1%씩 쌓입니다 (최대 +150%). LEGEND 이상이 나오면 다시 0부터.",
        luckBonus: 0, speedBonus: 0, streakRate: 0.01, streakMax: 1.5, streakReset: "LEGEND",
        req: { "legend_speed": 3, "ep_magician_gunwoo": 12, "rare_relay_gunwoo": 100, "unc_walk_byungeun": 1000 }
    },
    {
        id: "amu_twinstar", category: "amulet", abil: "twin",
        name: "쌍둥이 별 부적",
        desc: "3% 확률로 뽑은 칭호를 하나 더 받습니다.",
        luckBonus: 0, speedBonus: 0, twinChance: 0.03,
        req: { "anc_nebula_jisung": 1, "gemini_basic": 2, "leg_mechangel_minchae": 4, "ep_sakura_gaeun": 20, "rare_karaoke_minchae": 150, "com_hungry_gaeun": 2000 }
    },
    {
        id: "amu_scale", category: "amulet", abil: "sell",
        name: "연금 저울 부적",
        desc: "칭호 판매가가 +25% (자동 판매 포함), 신전 수입이 +15% 늘어납니다.",
        luckBonus: 0, speedBonus: 0, sellMult: 1.25, showMult: 1.15,
        req: { "myth_midas_gaeun": 2, "leg_alchemist_gaeun": 5, "ep_miner_byungeun": 20, "rare_cvs_jisung": 200, "com_phone_tv": 1500 }
    },
    {
        id: "amu_cradle", category: "amulet", abil: "hatch",
        name: "생명의 요람 부적",
        desc: "알 부화 시간이 20% 줄고, 함께하는 펫 효과가 +10% 커집니다.",
        luckBonus: 0, speedBonus: 0, hatchCut: 0.2, petMult: 1.1,
        req: { "myth_phoenix_gaeun": 2, "leg_chef_gunwoo": 4, "ep_balloon_minchae": 20, "rare_fishing_gunwoo": 200, "unc_lunch_gunwoo": 1200 }
    },
    {
        id: "amu_brewer", category: "amulet", abil: "brew",
        name: "물약 장인의 부적",
        desc: "배수 물약을 쓸 때 15% 확률로 횟수가 안 줄고, 시간 물약 지속시간이 +25% 늘어납니다.",
        luckBonus: 0, speedBonus: 0, brewSave: 0.15, brewTime: 1.25,
        req: { "myth_time_minchae": 2, "leg_alchemist_gaeun": 4, "ep_mushroom_tv": 20, "rare_cupramen_gaeun": 200, "unc_tvideo": 1200 }
    },

    // 📜 부적 (10롤마다 다음 1롤 행운 배수)
    {
        id: "amulet_drum",
        category: "amulet",
        name: "평범함의 부적",
        desc: "롤을 10회 돌리면 다음 1회 롤에 행운이 2배로 증가합니다.",
        luckBonus: 0,
        speedBonus: 0,
        req: { "com_normal": 600, "unc_tired": 100 }
    },
    {
        id: "amulet_commander",
        category: "amulet",
        name: "미나이의 부적",
        desc: "롤을 10회 돌리면 다음 1회 롤에 행운이 5배로 증가합니다.",
        luckBonus: 0,
        speedBonus: 0,
        req: { "gemini_basic": 1, "legend_speed": 3, "rare_soldier": 60, "com_just_byungeun": 1000 }
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
    },

    // 🌀 균열 던전 보스 드롭
    {
        id: "gear_riftbreaker", category: "gauntlet", gacha: "dungeon",
        name: "균열파괴자의 건틀렛",
        desc: "균열의 군주에게서 떨어진 주먹 조각. 행운 450%, 속도 20%. 레이드 공격력 +25%, 체력 +20%.",
        luckBonus: 4.5, speedBonus: 0.2, dngAtk: 0.25, dngHp: 0.2, req: {}
    },
    {
        id: "amu_riftcore", category: "amulet", gacha: "dungeon", abil: "rift",
        name: "균열의 핵 부적",
        desc: "보스의 가슴에서 꺼낸 핵. 행운 +100%. 레이드 공격력 ×1.2, 체력 ×1.2.",
        luckBonus: 1, speedBonus: 0, riftAtk: 1.2, riftHp: 1.2, req: {}
    }
];
