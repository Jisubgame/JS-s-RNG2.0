/* =========================================================
   🐾 펫 데이터 (petsData.js)
   - 일반 뽑기에서 알이 나옴 → 펫 창 둥지(3칸)에 넣고 기다리면 부화
   - 같은 펫 같은 성 2마리를 합성하면 성이 올라감 (최대 5성)
   - 한 번에 한 마리만 데리고 다님
   ========================================================= */

export const PET_TIERS = ['COMMON', 'RARE', 'EPIC', 'LEGEND', 'MYTHIC', 'ANCIENT', 'ABSOLUTE'];

export const PETS = [
    { id: 'pet_slime', name: '꼬마 슬라임', tier: 'COMMON', luck: 0.05, desc: '말랑말랑 통통 튀어요' },
    { id: 'pet_puppy', name: '네모 강아지', tier: 'COMMON', speed: 0.03, desc: '꼬리를 흔들며 졸졸 따라와요' },
    { id: 'pet_cat', name: '픽셀 고양이', tier: 'RARE', luck: 0.12, desc: '가끔 하품을 해요' },
    { id: 'pet_penguin', name: '아기 펭귄', tier: 'RARE', speed: 0.06, desc: '뒤뚱뒤뚱 날개를 파닥여요' },
    { id: 'pet_fox', name: '불꽃 여우', tier: 'EPIC', luck: 0.25, speed: 0.05, desc: '꼬리 끝에서 불꽃이 일렁여요' },
    { id: 'pet_owl', name: '번개 부엉이', tier: 'EPIC', speed: 0.1, desc: '날갯짓마다 번개가 튀어요' },
    { id: 'pet_dragon', name: '크리스탈 드래곤', tier: 'LEGEND', luck: 0.6, desc: '수정 날개로 하늘을 날아요' },
    { id: 'pet_whale', name: '우주 고래', tier: 'LEGEND', luck: 0.4, speed: 0.1, desc: '별을 품고 허공을 헤엄쳐요' },
    { id: 'pet_phoenix', name: '황금 불사조', tier: 'MYTHIC', luck: 1.2, speed: 0.12, desc: '불꽃 꼬리를 남기며 날아요' },
    // 🆕 펫 업데이트
    { id: 'pet_hamster', name: '볼빵빵 햄찌', tier: 'COMMON', speed: 0.04, desc: '볼에 해바라기씨를 가득 넣고 다녀요' },
    { id: 'pet_chick', name: '삐약 병아리', tier: 'COMMON', luck: 0.06, desc: '콩콩 뛰며 날개를 파닥여요' },
    { id: 'pet_bunny', name: '달토끼', tier: 'RARE', luck: 0.1, speed: 0.03, desc: '작은 초승달이 옆을 따라다녀요' },
    { id: 'pet_turtle', name: '이끼 돌거북', tier: 'RARE', luck: 0.16, desc: '느리지만 행운을 꾹꾹 모아요' },
    { id: 'pet_jellyfish', name: '별 해파리', tier: 'EPIC', luck: 0.32, desc: '몸속에서 별빛이 깜빡여요' },
    { id: 'pet_golem', name: '꼬마 골렘', tier: 'EPIC', luck: 0.1, speed: 0.12, desc: '등의 수정이 쿵쿵 걸을 때마다 빛나요' },
    { id: 'pet_unicorn', name: '무지개 유니콘', tier: 'LEGEND', luck: 0.7, speed: 0.05, desc: '무지개 갈기를 휘날리며 사뿐사뿐' },
    { id: 'pet_kitsune', name: '여우불 구미호', tier: 'LEGEND', luck: 0.5, speed: 0.12, desc: '꼬리 끝에서 푸른 여우불이 타올라요' },
    { id: 'pet_griffin', name: '하늘 그리폰', tier: 'MYTHIC', luck: 1.0, speed: 0.18, desc: '사자의 몸, 독수리의 날개' },
    { id: 'pet_leviathan', name: '심해의 레비아탄', tier: 'ANCIENT', luck: 1.8, speed: 0.12, desc: '허공을 바다처럼 헤엄치는 고대의 바다뱀' },
    { id: 'pet_nebulacat', name: '성운 고양이', tier: 'ANCIENT', luck: 1.4, speed: 0.28, desc: '꼬리 끝에서 은하가 흩어져요' },
    { id: 'pet_skydragon', name: '천룡', tier: 'ABSOLUTE', luck: 2.8, speed: 0.25, desc: '여의주를 쫓아 하늘을 휘감는 금빛 용' }
];
export const PET_BY_ID = Object.fromEntries(PETS.map(p => [p.id, p]));

// 알: 일반 뽑기에서 나옴 → 펫 창 둥지에 넣으면 시간이 지나 부화
// odds = 어떤 등급 펫이 나오는지 (가중치), hours = 부화까지 걸리는 시간
export const EGGS = [
    { id: 'egg_basic', name: '평범한 알', tier: 'RARE', hours: 1, color: '#d8d2c0', spot: '#9aa0ad', odds: { COMMON: 70, RARE: 25, EPIC: 5 } },
    { id: 'egg_forest', name: '숲의 알', tier: 'EPIC', hours: 2, color: '#8ad65a', spot: '#3a8a2a', odds: { COMMON: 30, RARE: 45, EPIC: 22, LEGEND: 3 } },
    { id: 'egg_rare', name: '반짝이는 알', tier: 'EPIC', hours: 3, color: '#9fd8ff', spot: '#4da3ff', odds: { RARE: 55, EPIC: 35, LEGEND: 9, MYTHIC: 1 } },
    { id: 'egg_legend', name: '전설의 알', tier: 'LEGEND', hours: 6, color: '#ffd23a', spot: '#ff7a1a', odds: { EPIC: 50, LEGEND: 42, MYTHIC: 8 } },
    { id: 'egg_mythic', name: '신화의 알', tier: 'MYTHIC', hours: 12, color: '#7af0ff', spot: '#c86bff', odds: { LEGEND: 58, MYTHIC: 39, ANCIENT: 3 } },
    { id: 'egg_ancient', name: '고대의 알', tier: 'ANCIENT', hours: 24, color: '#e8c87a', spot: '#5a3a1a', odds: { MYTHIC: 70, ANCIENT: 28, ABSOLUTE: 2 } },
    { id: 'egg_cosmic', name: '우주의 알', tier: 'ABSOLUTE', hours: 48, color: '#2a1a5a', spot: '#ff7ad8', odds: { ANCIENT: 80, ABSOLUTE: 20 } }
];
export const EGG_BY_ID = Object.fromEntries(EGGS.map(e => [e.id, e]));

// 성: 같은 펫 + 같은 성 2마리를 합치면 한 성 올라감 (최대 5성)
export const STAR_MAX = 5;
export const STAR_MULT = [1, 1, 1.4, 1.9, 2.5, 3.2];
export const starMult = s => STAR_MULT[Math.max(1, Math.min(STAR_MAX, s))];
