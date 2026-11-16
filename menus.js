/**
 * 경희대 거지맵 — 38개 전 매장 대표 이미지 & 상세 메뉴판 데이터베이스 (menus.js)
 * - 각 식당 상세 화면에서 구글맵/네이버플레이스 스타일의 깔끔한 전체 메뉴판과 대표 음식 사진을 제공합니다.
 * - 구글 시트에서 rep_menu가 수정되거나 새 식당이 추가된 경우에도 자동으로 메뉴 항목을 파싱해 표시합니다.
 */
(() => {
  "use strict";

  const PLACE_MENU_BOARDS = {
    "1": {
      photo: "./assets/places/place-1.jpg",
      photoCaption: "청운관 학생식당 오늘의 백반·일품 코너",
      menus: [
        { name: "조·중·석식 기본 학식 백반", price: "5,500원", badge: "대표", desc: "따뜻한 국·메인 반찬·셀프 김치 구성" },
        { name: "중식 스페셜 일품 코너", price: "6,500원", badge: "인기", desc: "돈카츠·덮밥·특식 메뉴 일별 변경" },
        { name: "계절 면·분식 코너", price: "4,500~5,500원", badge: "초가성비", desc: "우동·라면·냉면 등 빠른 식사" },
        { name: "공깃밥 추가", price: "1,000원", badge: "", desc: "든든하게 양 추가 가능" },
      ],
    },
    "2": {
      photo: "./assets/places/place-2.jpg",
      photoCaption: "푸른솔문화관 천원의 아침밥 & 생협 식당",
      menus: [
        { name: "천원의 아침밥 (재학생 조식)", price: "1,000원", badge: "초가성비", desc: "평일 08:00~ 선착순 든든한 한식 조식" },
        { name: "학생식당 중·석식 정식", price: "5,500~6,500원", badge: "대표", desc: "2024 대학생협 조리명장 최우수상 식단" },
        { name: "교직원식당 한식 뷔페식 정식", price: "7,000원", badge: "인기", desc: "학생 이용 가능 · 주 2회 특식일 8,000원" },
      ],
    },
    "3": {
      photo: "./assets/places/place-3.jpg",
      photoCaption: "알촌 경희외대점 매콤·순한 알밥",
      menus: [
        { name: "매콤알밥", price: "5,300원", badge: "대표", desc: "톡톡 터지는 날치알과 중독성 있는 매콤 소스" },
        { name: "순한알밥", price: "5,500원", badge: "초가성비", desc: "매운 걸 못 먹어도 고소하게 즐기는 기본 알밥" },
        { name: "약매알밥 (약간 매콤)", price: "5,700원", badge: "인기", desc: "가장 많이 찾는 황금 밸런스 맵기" },
        { name: "치즈알밥", price: "6,500원", badge: "", desc: "고소한 모짜렐라 치즈 듬뿍 토핑" },
        { name: "숯불제육알밥", price: "6,800원", badge: "", desc: "불향 가득 제육볶음 토핑 든든 메뉴" },
      ],
    },
    "4": {
      photo: "./assets/places/place-4.jpg",
      photoCaption: "푸른하늘 두툼 왕김밥 & 곱빼기 무료 라볶이",
      menus: [
        { name: "원조 푸른하늘 김밥", price: "3,800원", badge: "초가성비", desc: "생활의 달인 소개 속 재료 꽉 찬 왕김밥" },
        { name: "참치김밥 / 치즈김밥", price: "5,000~5,500원", badge: "인기", desc: "한 줄만 먹어도 배부른 묵직한 두께" },
        { name: "제육김밥 / 돈가스김밥", price: "5,500원", badge: "", desc: "고기 토핑 듬뿍 든든 김밥" },
        { name: "라볶이 (기본·곱빼기 동일가)", price: "7,000원", badge: "대표", desc: "주문 시 곱빼기 요청 무료 업그레이드!" },
        { name: "쫄면 (기본·곱빼기 동일가)", price: "7,000원", badge: "곱빼기무료", desc: "새콤달콤 야채 듬뿍 쫄면 곱빼기 동일가" },
      ],
    },
    "5": {
      photo: "./assets/places/place-5.jpg",
      photoCaption: "안녕 유부 대용량 우동 & 수제 유부초밥",
      menus: [
        { name: "대용량 가쓰오 우동", price: "5,500원", badge: "대표", desc: "1.5인분급 푸짐한 면발과 깊은 국물" },
        { name: "얼큰 해장 우동", price: "6,000원", badge: "초가성비", desc: "칼칼하고 시원한 국물 우동" },
        { name: "기본 유부초밥 (4pcs)", price: "4,800원", badge: "", desc: "달콤짭짤 촉촉한 수제 대왕 유부초밥" },
        { name: "불고기 / 참치마요 토핑 유부", price: "5,800~6,500원", badge: "인기", desc: "우동과 찰떡궁합 토핑 유부초밥" },
      ],
    },
    "6": {
      photo: "./assets/places/place-6.jpg",
      photoCaption: "사나이뚝배기 우거지된장·제육 & 밥 무한리필",
      menus: [
        { name: "우거지된장뚝배기", price: "6,300원", badge: "초가성비", desc: "공깃밥·반찬 셀프바 무한리필 포함!" },
        { name: "해물순두부뚝배기", price: "7,000원", badge: "인기", desc: "얼큰하고 구수한 순두부 + 밥 무한리필" },
        { name: "김치제육뚝배기", price: "8,000원", badge: "대표", desc: "보글보글 자작한 국물 제육 + 밥 무한리필" },
        { name: "소불고기뚝배기", price: "8,500원", badge: "", desc: "달짝지근한 당면·소불고기 전골식 뚝배기" },
        { name: "계란후라이 / 조미김 추가", price: "500원", badge: "꿀팁", desc: "500원으로 완성하는 갓성비 비빔밥 조합" },
      ],
    },
    "7": {
      photo: "./assets/places/place-7.jpg",
      photoCaption: "79번지 국수집 8시간 닭육수 닭칼국수 & 파전",
      menus: [
        { name: "닭칼국수", price: "7,000원", badge: "대표", desc: "매일 8시간 직접 우린 진한 닭육수 칼국수" },
        { name: "초계국수 / 비빔국수", price: "7,000원", badge: "인기", desc: "살얼음 동동 새콤시원 별미 국수" },
        { name: "잔치국수", price: "6,000원", badge: "초가성비", desc: "부담 없이 호로록 즐기는 멸치·닭육수 국수" },
        { name: "고기김치전 / 감자해물파전", price: "9,000원", badge: "인기", desc: "겉바속촉 두툼한 가성비 안주·사이드" },
      ],
    },
    "8": {
      photo: "./assets/places/place-8.jpg",
      photoCaption: "도읍지 순두부·제육 백반 & 폭탄 계란찜",
      menus: [
        { name: "순두부찌개 백반", price: "9,000원", badge: "대표", desc: "집밥 밑반찬 가득 한 상 차림" },
        { name: "제육볶음 백반", price: "9,500원", badge: "인기", desc: "불맛 살아있는 정문 골목 32년 전통 제육" },
        { name: "김치찌개 / 부대찌개 백반", price: "9,000원", badge: "", desc: "얼큰하고 묵직한 집밥 찌개 정식" },
        { name: "폭탄 계란찜", price: "5,000원", badge: "꿀팁", desc: "뚝배기 위로 부풀어 오르는 명물 계란찜" },
      ],
    },
    "9": {
      photo: "./assets/places/place-9.jpg",
      photoCaption: "여기가좋겠네 진한 국물 닭볶음탕 & 닭불백",
      menus: [
        { name: "닭볶음탕 소 (반마리·2인)", price: "17,000원", badge: "대표", desc: "1인당 8,500원꼴! 감자·떡 듬뿍 진한 국물" },
        { name: "뼈없는 안동찜닭 소 (2인)", price: "17,000원", badge: "인기", desc: "당면 가득 단짠 간장 찜닭" },
        { name: "닭불고기 백반 (1인 식사)", price: "9,000원", badge: "", desc: "혼밥·점심 식사로 든든한 매콤 닭불백" },
        { name: "볶음밥 / 우동사리 추가", price: "2,000원", badge: "", desc: "남은 양념에 필수 코스 볶음밥" },
      ],
    },
    "10": {
      photo: "./assets/places/place-10.jpg",
      photoCaption: "버거리 경희대점 4천원대 수제버거",
      menus: [
        { name: "프레쉬버거 (단품)", price: "4,900원", badge: "초가성비", desc: "신선한 양상추·토마토 수제 패티 기본 버거" },
        { name: "소불고기버거", price: "5,200원", badge: "인기", desc: "한국인 입맛 저격 달콤짭짤 수제 버거" },
        { name: "통새우 쉬림프버거", price: "5,800원", badge: "대표", desc: "탱글한 새우 패티와 타르타르 소스" },
        { name: "클래식 치즈버거", price: "5,500원", badge: "", desc: "진한 체다치즈와 육즙 패티의 조화" },
        { name: "감자튀김 + 탄산 세트 변경", price: "+3,700원", badge: "", desc: "바삭한 케이준/크리스피 프라이 & 음료" },
      ],
    },
    "11": {
      photo: "./assets/places/place-11.jpg",
      photoCaption: "텐동토리텐 바삭한 직화 토리텐동",
      menus: [
        { name: "토리텐동 (닭안심 튀김 덮밥)", price: "9,500원", badge: "대표", desc: "촉촉한 닭안심·온센타마고·야채 튀김 한 그릇" },
        { name: "에비텐동 (새우 튀김 덮밥)", price: "11,500원", badge: "인기", desc: "큼직한 블랙타이거급 새우튀김 텐동" },
        { name: "토리·에비 믹스 텐동 & 카레", price: "12,500원", badge: "", desc: "텐동과 진한 일본식 카레를 한 번에" },
        { name: "온센타마고 추가", price: "1,000원", badge: "", desc: "간장 타레 밥에 비벼 먹는 반숙 계란" },
      ],
    },
    "12": {
      photo: "./assets/places/place-12.jpg",
      photoCaption: "온복국수 속 편한 글루텐프리 쌀면 국수",
      menus: [
        { name: "온복 잔치국수", price: "7,500원", badge: "대표", desc: "소화 잘 되는 쌀면과 깊고 깔끔한 멸치·사골 육수" },
        { name: "얼큰 어묵국수", price: "8,500원", badge: "인기", desc: "수제 어묵이 듬뿍 들어간 해장 쌀국수" },
        { name: "새콤달콤 비빔국수", price: "8,900원", badge: "", desc: "쫄깃한 쌀면에 과일 숙성 비빔장" },
        { name: "진한 고기국수", price: "9,500원", badge: "", desc: "부드러운 수육 고명이 올라간 든든한 한 그릇" },
      ],
    },
    "13": {
      photo: "./assets/places/place-13.jpg",
      photoCaption: "닭갈비제작소 철판닭갈비 & 삼겹살 무한리필",
      menus: [
        { name: "철판닭갈비 + 삼겹 무한리필 (성인)", price: "15,900원", badge: "무한리필", desc: "닭갈비·삼겹·우동/라면사리·볶음밥 무제한!" },
        { name: "점심 특선 무한리필", price: "14,900원", badge: "대표", desc: "평일 점심 공강·모임 가성비 만찬" },
        { name: "모짜렐라 치즈 퐁듀 추가", price: "4,000원", badge: "인기", desc: "매콤 닭갈비를 찍어 먹는 고소한 치즈링" },
      ],
    },
    "14": {
      photo: "./assets/places/place-14.jpg",
      photoCaption: "레알라면 3단계 맵기 라면 & 공깃밥·치즈 셀프바 무료",
      menus: [
        { name: "옐로우 라면 (순한맛·해장)", price: "7,000원", badge: "인기", desc: "소고기·숙주·떡 토핑 + 밥·치즈 셀프바 무료!" },
        { name: "오렌지 라면 (중간 매콤맛)", price: "7,000원", badge: "대표", desc: "가장 인기 많은 칼칼한 해장 라면 + 밥 무한" },
        { name: "레드 라면 (매운맛 마니아)", price: "7,000원", badge: "", desc: "스트레스 확 풀리는 얼큰 매운맛" },
        { name: "공깃밥·치즈·콩나물·김가루 셀프바", price: "무료", badge: "무한리필", desc: "1인 1라면 주문 시 전 토핑 무제한 제공" },
      ],
    },
    "15": {
      photo: "./assets/places/place-15.jpg",
      photoCaption: "불꽃냉면 장칼국수 만원 이하 면 요리",
      menus: [
        { name: "물냉면 / 비빔냉면", price: "8,000원", badge: "대표", desc: "동대문구 착한가격 만원 이하 선정 메뉴" },
        { name: "강원도식 얼큰 장칼국수", price: "8,500원", badge: "인기", desc: "걸쭉하고 칼칼한 고추장 베이스 손칼국수" },
        { name: "숯불고기 + 냉면 세트", price: "9,500원", badge: "가성비", desc: "달콤한 숯불고기 한 접시 포함 든든 세트" },
        { name: "고기왕만두 (반접시)", price: "4,500원", badge: "", desc: "칼국수·냉면과 곁들이기 좋은 왕만두" },
      ],
    },
    "16": {
      photo: "./assets/places/place-16.jpg",
      photoCaption: "153구포국수 회기역점 지단김밥 & 잔치국수",
      menus: [
        { name: "153 계란지단김밥", price: "6,500원", badge: "대표", desc: "폭신한 계란지단이 가득 들어간 시그니처 김밥" },
        { name: "구포 멸치 잔치국수", price: "7,000원", badge: "인기", desc: "진한 남해 멸치 육수와 쫄깃한 중면" },
        { name: "비빔국수 / 얼큰어묵국수", price: "8,500원", badge: "", desc: "회기역 1번 출구 앞 빠른 혼밥 추천" },
        { name: "수제 등심돈까스", price: "9,500원", badge: "", desc: "바삭한 경양식 스타일 돈까스" },
      ],
    },
    "17": {
      photo: "./assets/places/place-17.jpg",
      photoCaption: "춘하추우동 자가제면 수제우동 & 카츠카레",
      menus: [
        { name: "가케 수제우동", price: "7,500원", badge: "대표", desc: "탱글한 수제 면발과 깊고 순한 가쓰오 육수" },
        { name: "우동 + 미니규동/유부 세트", price: "8,500원", badge: "인기", desc: "우동 단품에 1,000원만 더한 알찬 세트" },
        { name: "수제 등심 카츠카레", price: "9,000원", badge: "", desc: "진한 일본식 숙성 카레와 두툼한 돈카츠" },
        { name: "치킨 가라아게 (소)", price: "5,500원", badge: "초가성비", desc: "혼밥 사이드로 딱 좋은 바삭한 닭튀김" },
      ],
    },
    "18": {
      photo: "./assets/places/place-18.jpg",
      photoCaption: "굿갓레스토랑 회기직영점 9천원대 파스타 & 스테이크",
      menus: [
        { name: "매콤 알리오올리오 파스타", price: "9,000원", badge: "대표", desc: "마늘 풍미 가득 만원 이하 가성비 파스타" },
        { name: "베이컨 크림 / 토마토 파스타", price: "9,800원", badge: "인기", desc: "선후배 밥약으로 부담 없는 정통 파스타" },
        { name: "수비드 돼지목심 스테이크", price: "15,000원", badge: "인기", desc: "둘이 나눠 먹기 좋은 두툼한 가성비 스테이크" },
        { name: "해산물 필라프 / 리조또", price: "10,500원", badge: "", desc: "불향 살려 볶아낸 든든한 라이스 메뉴" },
      ],
    },
    "19": {
      photo: "./assets/places/place-19.jpg",
      photoCaption: "일구구삼 고기 삼겹살 600g 한 판 & 소고기 된장라면",
      menus: [
        { name: "숙성 삼겹살 한 판 (600g)", price: "30,000원", badge: "대표", desc: "200g(1인분) 환산 10,000원! 압도적 중량 가성비" },
        { name: "숙성 목살 한 판 (600g)", price: "30,000원", badge: "인기", desc: "육즙 가득 두툼한 목살 3인분 분량" },
        { name: "소고기 된장라면", price: "6,000원", badge: "초가성비", desc: "고기 먹고 필수로 시키는 구수한 후식 라면" },
        { name: "날치알 볶음밥", price: "4,000원", badge: "", desc: "철판 위에서 볶아주는 마무리 별미" },
      ],
    },
    "20": {
      photo: "./assets/places/place-20.jpg",
      photoCaption: "꽃돼지무한삼겹 통삼겹·라면·음료 풀코스 무한리필",
      menus: [
        { name: "점심 통삼겹 무한리필", price: "12,500원", badge: "대표", desc: "통삼겹+된장찌개+밥+라면+음료수 전부 무제한!" },
        { name: "저녁 통삼겹 무한리필", price: "13,500원", badge: "무한리필", desc: "저녁 모임·회식 추가금 걱정 없는 풀코스" },
        { name: "통삼겹 + 우삼겹 무한리필", price: "15,500원", badge: "인기", desc: "고소한 우삼겹까지 무제한 업그레이드" },
      ],
    },
    "21": {
      photo: "./assets/places/place-21.jpg",
      photoCaption: "고레가 2,900원 하이볼 & 만원 이하 이자카야 안주",
      menus: [
        { name: "산토리 스타일 하이볼", price: "2,900원", badge: "초가성비", desc: "부담 없이 가볍게 즐기는 가성비 하이볼" },
        { name: "안키모(아귀간) 크래커", price: "7,000원", badge: "대표", desc: "고소하고 녹진한 이자카야 시그니처 안주" },
        { name: "한우 스지 수육 전골", price: "8,000원", badge: "인기", desc: "만원 이하로 즐기는 뜨끈한 쫀득 스지 수육" },
        { name: "명란 구이 / 치킨 가라아게", price: "7,500~8,500원", badge: "", desc: "맥주·하이볼과 잘 어울리는 실속 요리" },
      ],
    },
    "22": {
      photo: "./assets/places/place-22.jpg",
      photoCaption: "39돈가스 경양식 매콤돈가스 & 피자돈가스",
      menus: [
        { name: "기본 경양식 수제돈가스", price: "8,500원", badge: "인기", desc: "바삭한 튀김옷에 추억의 걸쭉한 데미 소스" },
        { name: "매콤돈가스", price: "9,000원", badge: "대표", desc: "느끼함 없이 끝까지 맛있는 외대·후문 명물" },
        { name: "모짜렐라 피자돈가스", price: "10,000원", badge: "", desc: "치즈가 듬뿍 올라간 별미 돈가스" },
        { name: "쫄면 + 미니돈가스 세트", price: "9,500원", badge: "가성비", desc: "새콤한 쫄면과 돈가스를 동시에" },
      ],
    },
    "23": {
      photo: "./assets/places/place-23.jpg",
      photoCaption: "이상한떡볶이집 식사 주문 시 즉석떡볶이 무료 무한리필",
      menus: [
        { name: "김치볶음밥 (+떡볶이 무한리필)", price: "7,500원", badge: "대표", desc: "1인 1메뉴 주문 시 냄비 떡볶이 무료 무제한!" },
        { name: "매콤 오븐 스파게티 (+떡볶이 리필)", price: "8,000원", badge: "인기", desc: "치즈 오븐 스파게티와 떡볶이 꿀조합" },
        { name: "철판 팬스테이크 (+떡볶이 리필)", price: "9,500원", badge: "", desc: "만원 안쪽으로 스테이크와 떡볶이까지 든든하게" },
        { name: "즉석 떡볶이 리필 코너", price: "무료", badge: "무한리필", desc: "원하는 만큼 계속 리필해 먹는 혜자 서비스" },
      ],
    },
    "24": {
      photo: "./assets/places/place-24.jpg",
      photoCaption: "순대실록 한국외대점 진한 사골 전통순댓국",
      menus: [
        { name: "전통 순댓국", price: "10,000원", badge: "대표", desc: "직접 만든 수제 순대와 진한 사골 국밥" },
        { name: "살코기 순댓국", price: "10,500원", badge: "인기", desc: "내장 없이 담백한 머릿고기와 순대 구성" },
        { name: "얼큰 순댓국", price: "10,500원", badge: "", desc: "야작·음주 다음 날 해장에 딱 맞는 칼칼함" },
        { name: "시그니처 순대스테이크", price: "15,000원", badge: "", desc: "철판에 바삭하게 구워낸 별미 사이드" },
      ],
    },
    "25": {
      photo: "./assets/places/place-25.jpg",
      photoCaption: "샤브온당 외대점 1인 전용 화구 소고기 샤브샤브",
      menus: [
        { name: "온당 기본 소고기 샤브 (1인)", price: "10,900원", badge: "대표", desc: "신선한 야채·소고기·칼국수면 개인 화구 제공" },
        { name: "나주 미나리 소고기 샤브", price: "11,900원", badge: "인기", desc: "향긋한 미나리가 듬뿍 올라간 인기 메뉴" },
        { name: "얼큰 마라 / 매운 육수 샤브", price: "11,900원", badge: "", desc: "취향대로 고르는 1인 전용 육수" },
        { name: "직화 소고기 덮밥 (점심)", price: "8,900원", badge: "가성비", desc: "공강 시간 빠르게 먹는 든든 덮밥" },
      ],
    },
    "26": {
      photo: "./assets/places/place-26.jpg",
      photoCaption: "옛날할머니보쌈 된장찌개·집밥 반찬 보쌈정식",
      menus: [
        { name: "할머니 보쌈정식 (1인 가능)", price: "11,000원", badge: "대표", desc: "야들한 수육 + 구수한 된장찌개 + 집밥 밑반찬" },
        { name: "보쌈정식 특 (고기 증량)", price: "14,000원", badge: "인기", desc: "고기 양을 넉넉히 늘린 특사이즈 정식" },
        { name: "쟁반막국수 (소)", price: "8,000원", badge: "", desc: "보쌈과 함께 곁들이는 새콤매콤 막국수" },
      ],
    },
    "27": {
      photo: "./assets/places/place-27.jpg",
      photoCaption: "영화장 50년 전통 백년가게 짜장면 & 짬뽕",
      menus: [
        { name: "유니 짜장면", price: "7,500원", badge: "대표", desc: "중소벤처기업부 백년가게 선정 50년 내공 짜장" },
        { name: "삼선 간짜장", price: "9,500원", badge: "인기", desc: "주문 즉시 센 불에 볶아내는 양파·해물 간짜장" },
        { name: "얼큰 해물짬뽕", price: "9,000원", badge: "인기", desc: "시원하고 깊은 불향 가득 해장 짬뽕" },
        { name: "바삭 옛날 탕수육 (소)", price: "18,000원", badge: "", desc: "여럿이 밥약할 때 곁들이기 좋은 정통 탕수육" },
      ],
    },
    "28": {
      photo: "./assets/places/place-28.jpg",
      photoCaption: "밀플랜비 치킨·소고기 라이스 부리또",
      menus: [
        { name: "치킨라이스 부리또", price: "6,000원", badge: "대표", desc: "매콤고소 소스·치킨·라이스가 꽉 찬 한 끼" },
        { name: "소고기라이스 부리또", price: "6,000원", badge: "초가성비", desc: "풍미 깊은 비프와 밥이 어우러진 인기 메뉴" },
        { name: "감자베이컨 부리또", price: "6,500원", badge: "인기", desc: "웨지감자가 들어가 포만감 최고 부리또" },
        { name: "점보 사이즈 업 / 치즈 추가", price: "+1,000원", badge: "", desc: "배고픈 날 더 묵직하게 커스텀" },
      ],
    },
    "29": {
      photo: "./assets/places/place-29.jpg",
      photoCaption: "국제캠 학생회관 천원의 아침밥 & 생협 학식",
      menus: [
        { name: "천원의 아침밥 (재학생·포장 가능)", price: "1,000원", badge: "초가성비", desc: "평일 08:20~10:00 운영 · 테이크아웃 예약 지원" },
        { name: "학생회관 중·석식 기본 학식", price: "5,500원", badge: "대표", desc: "영양 균형 잡힌 국제캠 대표 생협 백반" },
        { name: "일품·특식 코너", price: "6,500원", badge: "인기", desc: "돈카츠·덮밥·면류 일별 특식 운영" },
      ],
    },
    "30": {
      photo: "./assets/places/place-30.jpg",
      photoCaption: "국제캠 제2기숙사 구내식당 백반",
      menus: [
        { name: "중·석식 기숙사 정식 백반", price: "5,500원", badge: "대표", desc: "우정원·제2기숙사 사생 및 외부 재학생 이용 가능" },
        { name: "중식 일품 특식 메뉴", price: "6,500원", badge: "인기", desc: "점심 시간대 별도 운영하는 스페셜 메뉴" },
      ],
    },
    "31": {
      photo: "./assets/places/place-31.jpg",
      photoCaption: "호식당 영통 수제 돈까스카레 & 밥·카레 무료 리필",
      menus: [
        { name: "호카레 (기본 숙성 카레)", price: "7,500원", badge: "초가성비", desc: "밥·카레 소스 무료 리필 + 장국·김치 셀프바!" },
        { name: "수제 등심돈까스 카레", price: "9,500원", badge: "대표", desc: "바삭한 생등심 돈까스와 진한 카레 든든 조합" },
        { name: "직화 차슈덮밥", price: "9,500원", badge: "인기", desc: "불향 입힌 부드러운 삼겹 차슈 덮밥" },
        { name: "새우튀김 카레", price: "9,500원", badge: "", desc: "통통한 새우튀김 토핑 일본 가정식 카레" },
        { name: "밥 & 카레 소스 리필", price: "무료", badge: "무한리필", desc: "1인 1메뉴 주문 시 부족하면 언제든 무료 리필" },
      ],
    },
    "32": {
      photo: "./assets/places/place-32.jpg",
      photoCaption: "보용만두 영통점 쫄면 & 바삭 군만두 조합",
      menus: [
        { name: "고기만두 / 김치손만두", price: "7,500원", badge: "인기", desc: "얇은 피에 육즙 가득한 수원 명물 찐만두" },
        { name: "바삭 군만두", price: "8,000원", badge: "대표", desc: "쫄면과 함께 시키면 환상 궁합인 노릇한 군만두" },
        { name: "매콤새콤 쫄면", price: "9,000원", badge: "대표", desc: "양배추 듬뿍 보용만두 시그니처 베스트셀러" },
        { name: "진한 사골 만두국", price: "9,000원", badge: "", desc: "속이 확 풀리는 뜨끈한 한 그릇 식사" },
      ],
    },
    "33": {
      photo: "./assets/places/place-33.jpg",
      photoCaption: "겐코 경희대점 직화 부타동 & 돈코츠라멘",
      menus: [
        { name: "직화 부타동 (돼지고기 덮밥)", price: "8,000원", badge: "대표", desc: "특제 간장소스로 직화 구이한 정건 혼밥 1티어" },
        { name: "특미 돈코츠라멘", price: "8,500원", badge: "인기", desc: "진하고 구수한 돼지사골 육수 일본식 라멘" },
        { name: "매운 카라구치 라멘", price: "9,000원", badge: "", desc: "얼큰한 국물이 당길 때 추천하는 매콤 라멘" },
        { name: "라멘 + 미니 부타동 세트", price: "11,000원", badge: "가성비", desc: "면과 직화 덮밥을 한 번에 즐기는 배부른 세트" },
      ],
    },
    "34": {
      photo: "./assets/places/place-34.jpg",
      photoCaption: "마라정 영통 원하는 만큼 담는 마라탕 & 마라반",
      menus: [
        { name: "마라탕 (재료 자율 선택)", price: "7,000원~", badge: "대표", desc: "최소주문 7,000원부터 내 지갑 예산만큼 조절!" },
        { name: "새콤매콤 마라반 (비빔)", price: "8,000원~", badge: "인기", desc: "국물 없이 꾸덕하고 중독성 강한 마라 비빔" },
        { name: "소고기 / 양고기 추가 (100g)", price: "3,000원", badge: "", desc: "고소한 육향을 더해주는 고기 토핑" },
        { name: "바삭 꿔바로우 (미니/소)", price: "9,000~14,000원", badge: "", desc: "달콤새콤 쫀득한 찹쌀 탕수육" },
      ],
    },
    "35": {
      photo: "./assets/places/place-35.jpg",
      photoCaption: "9.4닭갈비 수원경희대점 푸짐한 춘천식 철판닭갈비",
      menus: [
        { name: "9.4 철판닭갈비 (1인분)", price: "14,500원", badge: "대표", desc: "기본 양이 넉넉해 사리 부담 적은 정건 밥약 성지" },
        { name: "눈꽃 치즈 철판닭갈비", price: "16,500원", badge: "인기", desc: "고소한 모짜렐라 치즈 듬뿍 토핑" },
        { name: "우동 / 쫄면 / 라면 사리", price: "2,500원", badge: "", desc: "양념이 쏙 배어드는 필수 사리" },
        { name: "철판 날치알·김가루 볶음밥", price: "4,000원", badge: "인기", desc: "한국인의 디저트 철판 볶음밥" },
      ],
    },
    "36": {
      photo: "./assets/places/place-36.jpg",
      photoCaption: "송탄진대광부대찌개 햄 가득 부대찌개 & 밥 무한리필",
      menus: [
        { name: "진대광 송탄식 부대찌개 (1인)", price: "13,000원", badge: "대표", desc: "공깃밥 무한리필 + 라면사리 기본 포함!" },
        { name: "우삼겹 부대찌개", price: "15,000원", badge: "인기", desc: "고소한 우삼겹과 폭탄 소시지·햄의 조화" },
        { name: "공깃밥 무한리필", price: "무료", badge: "무한리필", desc: "진한 치즈·햄 국물에 밥 마음껏 리필 가능" },
      ],
    },
    "37": {
      photo: "./assets/places/place-37.jpg",
      photoCaption: "더진국 수육국밥 영통역점 24시 마감 진한 수육국밥",
      menus: [
        { name: "특허 육수 수육국밥", price: "9,000원", badge: "대표", desc: "잡내 없이 맑고 진한 육수와 야들한 수육 고기" },
        { name: "전통 순대국밥", price: "9,000원", badge: "인기", desc: "속 꽉 찬 순대와 수육이 함께 들어간 국밥" },
        { name: "얼큰 수육국밥", price: "9,500원", badge: "인기", desc: "밤 12시까지 야작·해장으로 든든한 얼큰 국밥" },
        { name: "직화 냉면 + 수육 정식", price: "11,500원", badge: "", desc: "살얼음 냉면과 수육 한 접시 가성비 정식" },
      ],
    },
    "38": {
      photo: "./assets/places/place-38.jpg",
      photoCaption: "등촌샤브칼국수 수원영통점 버섯매운탕 + 칼국수 + 볶음밥",
      menus: [
        { name: "버섯매운탕 칼국수 (칼국수+볶음밥)", price: "11,000원", badge: "대표", desc: "미나리·버섯 얼큰 전골에 칼국수와 계란볶음밥까지!" },
        { name: "샤브용 소고기 추가", price: "10,000원", badge: "인기", desc: "둘 이상 방문 시 소고기 추가하면 풀코스 완성" },
        { name: "계란 야채 볶음밥 (코스 포함)", price: "기본포함", badge: "꿀팁", desc: "직원분이 냄비에 고소하게 볶아주는 마무리 별미" },
      ],
    },
  };

  /**
   * rep_menu 문자열(구글시트 신규 추가 식당 등)에서 자동 메뉴 항목 추출 폴백
   */
  function parseMenusFromRepText(place) {
    const raw = String(place?.rep_menu || "").trim();
    if (!raw) return [];
    const tokens = raw
      .split(/\s*[·/]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);

    return tokens.map((tk, idx) => {
      const priceMatch = tk.match(/([0-9][0-9,~원+]+(?:원|~)?)/);
      if (priceMatch) {
        const priceStr = priceMatch[1].trim();
        const nameStr = tk.replace(priceMatch[0], "").trim() || tk;
        return {
          name: nameStr,
          price: priceStr.endsWith("원") || priceStr.endsWith("~") ? priceStr : `${priceStr}원`,
          badge: idx === 0 ? "대표" : "",
          desc: idx === 0 && place?.perks ? String(place.perks) : "",
        };
      }
      return {
        name: tk,
        price: place?.minPrice ? `${place.minPrice.toLocaleString("ko-KR")}원~` : "매장 확인",
        badge: idx === 0 ? "대표" : "",
        desc: "",
      };
    });
  }

  function getPlaceVisualAndMenu(place) {
    if (!place) {
      return { photoUrl: "", photoCaption: "", menus: [] };
    }
    const pid = String(place.id || "").trim();
    const entry = PLACE_MENU_BOARDS[pid];

    // 구글시트 image_url 컬럼이 입력되어 있으면 최우선 반영
    const customImg = String(place.image_url || place.photo || "").trim();
    const photoUrl = customImg || (entry ? entry.photo : "");
    const photoCaption = entry?.photoCaption || `${place.name} 대표 메뉴`;

    const menus =
      entry && Array.isArray(entry.menus) && entry.menus.length > 0
        ? entry.menus
        : parseMenusFromRepText(place);

    return {
      photoUrl,
      photoCaption,
      menus,
    };
  }

  window.PlaceMenusData = {
    PLACE_MENU_BOARDS,
    getPlaceVisualAndMenu,
    parseMenusFromRepText,
  };
})();
