/**
 * 경희대 거지맵 — 162개 전 매장 대표 이미지 & 상세 메뉴판 데이터베이스 (menus.js)
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
        { name: "순한알밥", price: "5,500원", badge: "초가성비", desc: "매운 걸 못 먹어도 고소하게 즐기는 기본 알밥" },
        { name: "약매알밥 / 매콤알밥", price: "5,700원", badge: "대표", desc: "톡톡 터지는 날치알과 중독성 있는 매콤 소스" },
        { name: "진매알밥 / 진진매알밥", price: "5,800~5,900원", badge: "인기", desc: "매운맛 마니아 학우들이 찾는 화끈한 단계" },
        { name: "치킨마요알밥 / 카레알밥", price: "6,000~6,200원", badge: "", desc: "든든한 토핑이 올라간 별미 알밥" },
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
        { name: "안녕유부 (2pcs)", price: "3,200원", badge: "초가성비", desc: "달콤짭짤 촉촉한 수제 대왕 유부초밥" },
        { name: "소불고기 / 소고기김치 / 참치마요 유부", price: "2,800~3,000원", badge: "인기", desc: "취향대로 골라 담는 토핑 유부초밥" },
        { name: "유부우동 / 매운유부우동", price: "6,400원", badge: "대표", desc: "푸짐한 면발과 깊은 국물의 든든한 우동" },
        { name: "안녕유부 추천 4P 세트", price: "13,900원", badge: "", desc: "인기 토핑 유부초밥 알찬 세트 구성" },
      ],
    },
    "6": {
      photo: "./assets/places/place-6.jpg",
      photoCaption: "사나이뚝배기 우거지된장·제육 & 밥 무한리필",
      menus: [
        { name: "우거지된장뚝배기 / 멸치된장뚝배기", price: "7,300원", badge: "대표", desc: "공깃밥·반찬 셀프바 무한리필 포함!" },
        { name: "돼지짜글이 / 참치짜글이", price: "7,300원", badge: "인기", desc: "밥 비벼 먹기 딱 좋은 칼칼진한 짜글이" },
        { name: "짜뚝세트 / 참뚝세트", price: "7,500원", badge: "가성비세트", desc: "뚝배기와 비빔 토핑을 함께 즐기는 실속 세트" },
        { name: "제육국물뚝배기 / 우삼겹된장뚝배기", price: "7,800~8,300원", badge: "밥리필", desc: "고기 듬뿍 들어간 사나이뚝배기 베스트셀러" },
      ],
    },
    "7": {
      photo: "./assets/places/place-7.jpg",
      photoCaption: "79번지 국수집 8시간 닭육수 닭칼국수 & 파전",
      menus: [
        { name: "김치말이냉국수", price: "6,000원", badge: "초가성비", desc: "살얼음 동동 새콤시원한 6천원 별미 국수" },
        { name: "닭칼국수 / 초계국수 / 닭국수", price: "7,000원", badge: "대표", desc: "매일 8시간 직접 우린 진한 닭육수 시그니처" },
        { name: "초계비빔국수 / 떡만두국", price: "8,000원", badge: "인기", desc: "사계절 든든하게 즐기는 별미 면·만두국" },
        { name: "고기김치전 / 감자해물파전", price: "9,000원", badge: "막걸리안주", desc: "바삭하고 두툼한 가성비 최고 전 메뉴" },
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
        { name: "닭볶음탕 소 (2인분)", price: "15,000원", badge: "대표", desc: "2인 방문 시 1인당 7,500원꼴! 진한 국물 노포 닭볶음탕" },
        { name: "고기떡볶이", price: "7,000원", badge: "인기", desc: "매콤달콤 푸짐하게 나오는 가성비 별미" },
        { name: "뼈없는찜닭 소 (2인분)", price: "20,000원", badge: "밥약추천", desc: "순살로 편하게 즐기는 단짠 간장 찜닭" },
      ],
    },
    "10": {
      photo: "./assets/places/place-10.jpg",
      photoCaption: "버거리 경희대점 4천원대 수제버거",
      menus: [
        { name: "텍사스바베큐버거", price: "4,900원", badge: "초가성비", desc: "4천원대에 즐기는 스모키 수제 패티 버거" },
        { name: "프레쉬버거", price: "5,300원", badge: "대표", desc: "신선한 야채와 육즙 가득 패티의 클래식 수제버거" },
        { name: "생와사비 새우버거 / 트러플치즈버거", price: "6,000~6,600원", badge: "인기", desc: "탱글한 통새우와 진한 트러플 풍미" },
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
        { name: "착한점심 특선", price: "11,900원", badge: "점심특선", desc: "낮 시간대 가성비 최고로 즐기는 점심 구성" },
        { name: "무한리필 학생 (철판닭갈비·닭구이·삼겹살)", price: "14,900원", badge: "대표", desc: "사리·셀프바까지 전부 무제한 제공" },
        { name: "무한리필 일반 성인", price: "15,900원", badge: "무한리필", desc: "단체 모임·회식에 딱 맞는 푸짐한 구성" },
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
        { name: "돼지·스팸·참치 김치찌개 / 황태떡국", price: "8,000원", badge: "대표", desc: "아침 6시부터 든든하게 속 채우는 8천원 식사" },
        { name: "얼큰 장칼국수 / 구수한 들깨칼국수", price: "9,000원", badge: "인기", desc: "진하고 걸쭉한 국물의 강원도식 장칼국수" },
        { name: "양념제육덮밥 / 김치제육덮밥", price: "9,000원", badge: "만원이하", desc: "푸짐하게 볶아내는 매콤 제육 한 그릇" },
      ],
    },
    "16": {
      photo: "./assets/places/place-16.jpg",
      photoCaption: "153구포국수 회기역점 지단김밥 & 잔치국수",
      menus: [
        { name: "꼬마 김밥 5종", price: "6,000원", badge: "초가성비", desc: "국수와 곁들이기 딱 좋은 알찬 김밥" },
        { name: "키토마요 김밥", price: "6,900원", badge: "인기", desc: "계란 지단이 가득 들어간 담백고소 김밥" },
        { name: "따뜻한 잔치국수 / 매콤 비빔국수", price: "8,500원", badge: "대표", desc: "24시간 언제든 든든하게 혼밥 가능한 시그니처 국수" },
        { name: "매콤고기국수", price: "9,500원", badge: "해장추천", desc: "진한 고기 육수에 칼칼함을 더한 인기 메뉴" },
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
        { name: "점심 통삼겹 무한리필", price: "14,500원", badge: "대표", desc: "통삼겹+된장찌개+공깃밥+라면+음료수 전부 무제한!" },
        { name: "저녁 통삼겹 무한리필", price: "15,500원", badge: "무한리필", desc: "저녁 모임·회식 가성비 끝판왕 무제한 고기" },
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
        { name: "바삭 등심돈가스", price: "8,500원", badge: "대표", desc: "8,500원에 든든하게 즐기는 경양식 수제 등심돈가스" },
        { name: "김치돈가스 / 매콤돈가스", price: "9,000원", badge: "인기", desc: "느끼함 없이 매콤칼칼하게 즐기는 별미 돈가스" },
        { name: "부드러운 안심돈가스", price: "9,500원", badge: "만원이하", desc: "담백하고 촉촉한 안심 부위 돈가스" },
        { name: "치즈 듬뿍 피자돈가스", price: "11,000원", badge: "", desc: "고소한 모짜렐라 치즈 토핑 돈가스" },
      ],
    },
    "23": {
      photo: "./assets/places/place-23.jpg",
      photoCaption: "이상한떡볶이집 식사 주문 시 즉석떡볶이 무료 무한리필",
      menus: [
        { name: "김치볶음밥 / 오무라이스 (+떡볶이 무한리필)", price: "9,000원", badge: "대표", desc: "메인 식사 주문 시 냄비 즉석떡볶이 무료 무한리필 제공!" },
        { name: "새우볶음밥 (+떡볶이 무한리필)", price: "10,000원", badge: "만원이하", desc: "탱글한 새우 볶음밥과 무한 떡볶이 조합" },
        { name: "매콤토마토 / 베이컨크림 / 날치새우크림 파스타", price: "12,000원", badge: "밥약추천", desc: "선후배 밥약 때 나눠 먹기 좋은 푸짐한 파스타" },
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
        { name: "간장 소고기 덮밥", price: "8,900원", badge: "만원이하", desc: "공강 시간에 깔끔하고 든든하게 즐기는 1인 덮밥" },
        { name: "저염저당 1인 샤브", price: "9,900원", badge: "인기", desc: "1만원 미만에 개인 전용 화구로 즐기는 담백 샤브샤브" },
        { name: "온당 기본 샤브 / 소유당·미나리 샤브", price: "10,900~11,900원", badge: "대표", desc: "취향별 육수를 골라 혼자서도 편하게 먹는 1인 샤브" },
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
        { name: "소고기 라이스 / 새우 감자 부리또", price: "7,000원", badge: "대표", desc: "한 개만 먹어도 든든한 대학가 대표 부리또" },
        { name: "치킨 감자 부리또 (Best) / 치킨 라이스 부리또", price: "7,500원", badge: "인기", desc: "가장 많이 찾는 바삭 감자+치킨 조합" },
        { name: "기본 수제 핫도그", price: "7,000원", badge: "", desc: "간편하게 포장해 먹기 좋은 핫도그" },
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
        { name: "호카레 (기본 숙성 카레)", price: "8,500원", badge: "대표", desc: "밥·카레 무료 리필 가능! 정건 대표 카레" },
        { name: "오믈렛카레 / 수제치킨카레 / 차슈덮밥", price: "8,900원", badge: "인기", desc: "부드러운 오믈렛·치킨 토핑과 직화 덮밥" },
        { name: "수제등심돈까스카레 (1장)", price: "9,500원", badge: "밥리필", desc: "바삭한 등심돈까스가 올라간 든든한 한 그릇" },
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
        { name: "직화 부타동 (M)", price: "10,500원", badge: "대표", desc: "불향 가득 구워낸 정건 인기 돼지고기 덮밥" },
        { name: "차슈동 (M) / 규동 (M)", price: "11,000~11,500원", badge: "인기", desc: "부드러운 차슈와 달짝지근한 소고기 덮밥" },
        { name: "미소라멘 / 시오버터라멘 (M)", price: "11,500~12,000원", badge: "해장추천", desc: "진한 육수의 일본식 라멘" },
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
      photoCaption: "은하식당 정갈한 집밥 제육·찌개 백반 한상",
      menus: [
        { name: "불땡초 비빔쫄면 / 뜨끈한 물쫄면", price: "5,900원", badge: "초가성비", desc: "5,900원에 즐기는 매콤·시원 가성비 별미 면" },
        { name: "옛날동치미막국수 / 들기름막국수", price: "8,000원", badge: "인기", desc: "고소하고 시원한 메밀 막국수" },
        { name: "(점심특선) 한우사골부대찌개", price: "10,000원", badge: "대표", desc: "낮 시간대 든든하게 즐기는 진한 사골 부대찌개" },
        { name: "돌판직화제육볶음", price: "12,000원", badge: "", desc: "불향 가득 볶아내는 돌판 제육" },
      ],
    },
    "38": {
      photo: "./assets/places/place-38.jpg",
      photoCaption: "등촌샤브칼국수 수원영통점 버섯매운탕 + 칼국수 + 볶음밥",
      menus: [
        { name: "얼큰 / 맑은 / 들깨 버섯칼국수", price: "10,000원", badge: "대표", desc: "미나리·버섯 듬뿍 칼국수와 볶음밥 풀코스" },
        { name: "소고기 샤브샤브", price: "10,000원", badge: "인기", desc: "1만원으로 즐기는 담백얼큰 샤브 코스" },
        { name: "왕만두 (3개)", price: "4,000원", badge: "", desc: "칼국수와 곁들이기 좋은 속 꽉 찬 왕만두" },
      ],
    },
    "39": {
      photo: "./assets/places/place-39.jpg",
      photoCaption: "행복기숙사 식당 영양 가득 집밥형 기숙사 학식",
      menus: [
        { name: "조·중·석식 기숙사 정식 백반", price: "5,500원", badge: "대표", desc: "일반 재학생도 현장 식권 구매 후 이용 가능한 든든 백반" },
        { name: "중식 일품·특식 코너", price: "6,500원", badge: "인기", desc: "수제돈까스·고기덮밥 등 요일별 스페셜 일품 식단" },
        { name: "사생 정기식 / 다회 식권", price: "할인가", badge: "초가성비", desc: "기숙사 사생 신청 시 끼니당 4천원대 가성비" },
      ],
    },
    "40": {
      photo: "./assets/places/place-40.jpg",
      photoCaption: "국제캠 우정원 1층 멀티 푸드코트 돌솥·덮밥·분식",
      menus: [
        { name: "한식·돌솥비빔밥·제육덮밥 코너", price: "5,500원", badge: "대표", desc: "공강 시간에 빠르게 나오는 따끈한 뚝배기·덮밥류" },
        { name: "분식·라면·김밥 코너", price: "4,500원", badge: "초가성비", desc: "5천원 미만으로 가볍게 해결하는 분식 한 끼" },
        { name: "돈까스·일품 면류 코너", price: "6,500원", badge: "인기", desc: "바삭한 등심돈까스와 우동·냉면 코너" },
      ],
    },
    "41": {
      photo: "./assets/places/place-41.jpg",
      photoCaption: "솔낭구 노릇한 고등어구이 & 제육 집밥 백반",
      menus: [
        { name: "고등어구이 집밥 백반", price: "9,500원", badge: "대표", desc: "겉바속촉 구워낸 고등어구이와 정갈한 집밥 반찬" },
        { name: "매콤 제육볶음 백반", price: "9,000원", badge: "인기", desc: "밥 한 공기 뚝딱 비우는 정문 대표 제육 백반" },
        { name: "묵은지 김치찌개 / 순두부 백반", price: "8,500원", badge: "가성비", desc: "따끈한 찌개와 계란·나물 밑반찬 한상" },
      ],
    },
    "42": {
      photo: "./assets/places/place-42.jpg",
      photoCaption: "그린김밥 속 꽉 찬 즉석 김밥 & 라면·떡볶이",
      menus: [
        { name: "한강라면", price: "4,000원", badge: "초가성비", desc: "김밥과 환상 궁합인 뜨끈한 라면" },
        { name: "그린김밥 (기본 속 꽉 찬 집김밥)", price: "5,500원", badge: "대표", desc: "계란·야채 속 재료가 아낌없이 들어간 시그니처 김밥" },
        { name: "치즈김밥 / 참치김밥 / 진미채김밥", price: "6,000~6,500원", badge: "인기", desc: "한 줄만 먹어도 든든한 프리미엄 수제 김밥" },
      ],
    },
    "43": {
      photo: "./assets/places/place-43.jpg",
      photoCaption: "월미당 경희대점 진한 육수 차돌양지 쌀국수 (면·숙주 리필)",
      menus: [
        { name: "차돌쌀국수 / 불고기쌀국수", price: "11,000원", badge: "대표", desc: "1인 1메뉴 주문 시 면·숙주 무료 리필!" },
        { name: "양지쌀국수 / 냉쌀국수", price: "11,500원", badge: "인기", desc: "깊게 우린 진한 육수의 정문 대표 쌀국수" },
        { name: "차돌양지쌀국수", price: "12,000원", badge: "밥리필", desc: "차돌과 양지를 동시에 즐기는 든든한 메뉴" },
      ],
    },
    "44": {
      photo: "./assets/places/place-44.jpg",
      photoCaption: "하마쌀국수 6,500원 진한 양지·소고기 쌀국수",
      menus: [
        { name: "매장에서 직접 삶은 고기 듬뿍 쌀국수", price: "8,900원", badge: "대표", desc: "진한 육수에 고기가 푸짐하게 올라간 시그니처 쌀국수" },
        { name: "특제양념 소불고기 쌀국수", price: "8,900원", badge: "인기", desc: "불고기 토핑으로 든든함을 더한 쌀국수" },
        { name: "분짜 비빔쌀국수 / 불향 마라 매운 쌀국수", price: "9,500원", badge: "만원이하", desc: "새콤달콤 분짜와 해장에 딱 좋은 매운 쌀국수" },
      ],
    },
    "45": {
      photo: "./assets/places/place-45.jpg",
      photoCaption: "핵밥 경희대점 1인 정식 트레이 직화 고기듬뿍덮밥",
      menus: [
        { name: "치킨마요덮밥", price: "9,900원", badge: "만원이하", desc: "1인 트레이 정식 구성 + 밥·소스 리필 가능" },
        { name: "고기듬뿍덮밥 / 돼지갈비양념덮밥", price: "10,900원", badge: "대표", desc: "불향 가득 구워낸 핵밥 시그니처 고기 덮밥" },
        { name: "항정살덮밥 / 마제소바 / 경양식왕돈까스", price: "11,900원", badge: "인기", desc: "선후배 밥약·혼밥으로 인기가 높은 베스트 메뉴" },
        { name: "큐브스테이크덮밥", price: "13,900원", badge: "", desc: "육즙 가득 부채살 스테이크 덮밥" },
      ],
    },
    "46": {
      photo: "./assets/places/place-46.jpg",
      photoCaption: "온정돈까스 경희대점 바삭한 국내산 수제 등심돈까스",
      menus: [
        { name: "온정 수제 등심돈까스", price: "11,900원", badge: "대표", desc: "두툼하고 바삭하게 튀겨낸 정문 인기 돈까스" },
        { name: "온정 통 생선까스", price: "12,900원", badge: "인기", desc: "타르타르 소스와 찰떡궁합인 겉바속촉 생선까스" },
        { name: "온정 치즈까스 / 고구마까스", price: "13,900원", badge: "", desc: "통모짜렐라 치즈가 흘러넘치는 인기 메뉴" },
      ],
    },
    "47": {
      photo: "./assets/places/place-47.jpg",
      photoCaption: "시키카츠 회기본점 저온숙성 프리미엄 히레·로스카츠",
      menus: [
        { name: "숙성 로스카츠 (등심)", price: "13,000원", badge: "대표", desc: "육즙 가득 저온 숙성 프리미엄 일식 등심카츠" },
        { name: "숙성 히레카츠 (안심)", price: "14,000원", badge: "인기", desc: "입에서 살살 녹는 부드러운 안심카츠" },
        { name: "치즈돈카츠 / 특로스카츠", price: "15,000~16,000원", badge: "밥약추천", desc: "선후배 밥약 일식당 1순위로 꼽히는 특선 메뉴" },
      ],
    },
    "48": {
      photo: "./assets/places/place-48.jpg",
      photoCaption: "향미중식당 진한 마라우육면 & 소분 중화 가정식",
      menus: [
        { name: "마라우육면 / 대만식 우육면", price: "7,500원", badge: "대표", desc: "진한 소고기 육수에 부드러운 사태 고기가 올라간 대표 면" },
        { name: "토마토 계란 덮밥", price: "6,500원", badge: "초가성비", desc: "자극 없이 부드럽고 든든한 중국 가정식 스테디셀러" },
        { name: "소분 미니 탕수육 / 어향육슬", price: "5,000원~", badge: "인기", desc: "혼밥러도 부담 없이 곁들이는 몇 천원대 소분 요리" },
        { name: "마파두부 덮밥", price: "7,000원", badge: "", desc: "얼얼하고 감칠맛 나는 정통 사천식 마파두부" },
      ],
    },
    "49": {
      photo: "./assets/places/place-49.jpg",
      photoCaption: "탕화쿵푸마라탕 경희대점 진한 사골 마라탕 & 꿔바로우",
      menus: [
        { name: "사골 마라탕 (최소주문)", price: "6,000원~", badge: "초가성비", desc: "원하는 재료를 무게대로 담아 6천원부터 즐기는 혼밥 마라탕" },
        { name: "마라향궈 (100g당)", price: "3,000원", badge: "인기", desc: "불향 가득 볶아내는 매콤얼얼 마라향궈" },
        { name: "찹쌀 꿔바로우", price: "13,000원", badge: "대표", desc: "바삭쫀득 새콤달콤 꿔바로우" },
      ],
    },
    "50": {
      photo: "./assets/places/place-50.jpg",
      photoCaption: "홍콩반점0410 경희대점 6천원대 짜장면 & 가성비 탕짜면",
      menus: [
        { name: "짜장면", price: "7,000원", badge: "대표", desc: "호불호 없이 든든한 정문 앞 가성비 짜장면" },
        { name: "고추짜장 / 짬뽕(면·밥)", price: "8,500~9,000원", badge: "인기", desc: "칼칼하고 불향 진한 해장 짬뽕·고추짜장" },
        { name: "볶음밥", price: "9,500원", badge: "만원이하", desc: "고슬고슬 볶아낸 중화 볶음밥" },
        { name: "찹쌀 탕수육 (소)", price: "16,800원", badge: "", desc: "둘이 나눠 먹기 딱 좋은 쫀득 탕수육" },
      ],
    },
    "51": {
      photo: "./assets/places/place-51.jpg",
      photoCaption: "춘리마라탕 외대점 최소주문 6,900원 가성비 사골 마라탕",
      menus: [
        { name: "사골 마라탕 (최소 6,900원~)", price: "6,900원~", badge: "초가성비", desc: "100g 1,700원대 착한 단가로 가볍게 한 그릇 가능" },
        { name: "불향 마라샹궈", price: "15,000원~", badge: "인기", desc: "센 불에 얼얼하게 볶아낸 밥도둑·맥주안주 마라샹궈" },
        { name: "새콤달콤 찹쌀 꿔바로우", price: "13,900원", badge: "인기", desc: "마라탕의 매운맛을 잡아주는 바삭한 꿔바로우" },
      ],
    },
    "52": {
      photo: "./assets/places/place-52.jpg",
      photoCaption: "탕화쿵푸마라탕 영통점 고소한 땅콩·사골 육수 마라탕",
      menus: [
        { name: "탕화쿵푸 마라탕 (최소 7,000원~)", price: "7,000원~", badge: "대표", desc: "호불호 없이 고소하고 깊은 한국인 입맛 저격 육수" },
        { name: "직화 마라샹궈", price: "15,000원~", badge: "인기", desc: "영통역 중심상가 밥약·소모임 단골 볶음 요리" },
        { name: "바삭 꿔바로우 (소)", price: "13,000원", badge: "", desc: "새콤달콤 소스가 코팅된 쫄깃한 찹쌀 탕수육" },
      ],
    },
    "53": {
      photo: "./assets/places/place-53.jpg",
      photoCaption: "코지인무르무르 쫄깃한 직접 뽑은 생면 빠네 & 구운 감자뇨끼",
      menus: [
        { name: "앤쵸비 알리오올리오", price: "17,800원", badge: "대표", desc: "깊은 감칠맛의 코지인무르무르 시그니처 오일 파스타" },
        { name: "오징어먹물 리조토", price: "18,800원", badge: "인기", desc: "고소하고 진한 풍미의 밥약·데이트 인기 메뉴" },
        { name: "부라타치즈 뽀모도로", price: "19,800원", badge: "밥약추천", desc: "통 부라타 치즈가 올라간 상큼한 토마토 파스타" },
      ],
    },
    "54": {
      photo: "./assets/places/place-54.jpg",
      photoCaption: "봄의정원 회기점 시그니처 구름 크림떡볶이 & 로제 파스타",
      menus: [
        { name: "구름 크림 떡볶이", price: "14,000원", badge: "대표", desc: "폭신한 크림 폼이 구름처럼 올라간 인스타 인증샷 필승 메뉴" },
        { name: "쉬림프 로제 파스타", price: "15,900원", badge: "인기", desc: "탱글한 새우와 진한 로제 소스가 어우러진 인기 파스타" },
        { name: "수비드 부채살 스테이크", price: "25,000원", badge: "", desc: "선후배 밥약·기념일에 곁들이기 좋은 부드러운 스테이크" },
      ],
    },
    "55": {
      photo: "./assets/places/place-55.jpg",
      photoCaption: "파앤피파스타하우스 알리오올리오 & 토마토·크림 파스타",
      menus: [
        { name: "베이컨올리오 파스타", price: "7,500원", badge: "대표", desc: "7,500원에 즐기는 외대앞 가성비 오일 파스타" },
        { name: "크리미까르보나라 / 핫스파이시까르보나라 / 미트러버", price: "9,800원", badge: "만원이하", desc: "1만원 미만에 푸짐하게 즐기는 인기 파스타 3종" },
        { name: "파앤피 레드 / 화이트 스페셜", price: "18,900원", badge: "밥약추천", desc: "둘이 함께 나눠 먹기 좋은 시그니처 메뉴" },
      ],
    },
    "56": {
      photo: "./assets/places/place-56.jpg",
      photoCaption: "썬프란시스코마켓 국제캠 밥약 원탑 미국식 수제피자 & 파스타",
      menus: [
        { name: "클램차우더와 치즈 브레드 / 마켓 샐러드", price: "16,000원", badge: "인기", desc: "진하고 꾸덕한 수프와 바삭한 치즈 브레드" },
        { name: "그램스 새우 로제 떡볶이", price: "17,000원", badge: "밥약추천", desc: "탱글한 새우가 듬뿍 들어간 꾸덕 로제" },
        { name: "썬프란시스코 시그니처 피자", price: "18,000원", badge: "대표", desc: "선후배 밥약·소개팅 때 가장 많이 시키는 대표 메뉴" },
      ],
    },
    "57": {
      photo: "./assets/places/place-57.jpg",
      photoCaption: "롤링파스타 수원영통역점 6~8천원대 초가성비 파스타 한상",
      menus: [
        { name: "알리오 올리오 / 버터 갈릭 파스타", price: "7,900원", badge: "대표", desc: "7천원대에 부담 없이 즐기는 가성비 오일 파스타" },
        { name: "봉골레 / 매운 우삼겹 오일파스타", price: "8,900원", badge: "인기", desc: "만원 미만으로 든든하게 즐기는 인기 파스타" },
        { name: "오븐 머쉬룸 크림뇨끼 / 치즈 오븐 라자냐", price: "11,500~13,500원", badge: "", desc: "노릇하게 구워낸 오븐 스페셜 메뉴" },
      ],
    },
    "58": {
      photo: "./assets/places/place-58.jpg",
      photoCaption: "정통집 회기역점 불향 가득 돼지김치구이 & 철판볶음밥",
      menus: [
        { name: "돼지김치구이 / 대패파절이구이 소 (2인)", price: "27,000원", badge: "대표", desc: "2인 방문 시 1인 13,500원! 다 구워져 나오는 김치구이" },
        { name: "특미 볶음밥", price: "3,000원", badge: "필수코스", desc: "남은 양념에 옥수수콘·김가루 듬뿍 볶아 먹는 마무리" },
      ],
    },
    "59": {
      photo: "./assets/places/place-59.jpg",
      photoCaption: "명륜진사갈비 수원영통점 7종 고기 & 프리미엄 셀프바 무한리필",
      menus: [
        { name: "명륜진사갈비 자유이용 (성인)", price: "21,900원", badge: "무한리필", desc: "돼지갈비·통삼겹·닭갈비·셀프바·밥 무제한 이용" },
        { name: "후식 물냉면 / 비빔냉면", price: "5,800원", badge: "인기", desc: "숯불갈비와 싸 먹기 딱 좋은 살얼음 냉면" },
      ],
    },
    "60": {
      photo: "./assets/places/place-60.jpg",
      photoCaption: "이모네왕파전 회기 파전골목 명물 돈까스급 바삭 해물왕파전",
      menus: [
        { name: "바삭 해물 왕파전 (단품)", price: "15,000원", badge: "대표", desc: "튀김처럼 두툼하고 바삭해 경희대생이라면 누구나 아는 명물" },
        { name: "A세트 (왕파전+떡볶이+콘버터+어묵탕)", price: "24,000원", badge: "초가성비", desc: "3~4명이 배 터지게 먹는 파전골목 가성비 끝판왕 세트" },
        { name: "얼큰 해물짬뽕탕 / 도토리묵", price: "13,000원", badge: "인기", desc: "비 오는 날 막걸리와 찰떡궁합인 국물·별미 안주" },
      ],
    },
    "61": {
      photo: "./assets/places/place-61.jpg",
      photoCaption: "노천파전 회기 파전골목 두툼 바삭 해물파전",
      menus: [
        { name: "노천 바삭 해물파전", price: "13,000원", badge: "대표", desc: "오징어와 대파가 듬뿍 들어간 두툼한 파전골목 명물" },
        { name: "파전 + 도토리묵 세트", price: "22,000원", badge: "가성비", desc: "여럿이 막걸리 마실 때 가장 알찬 세트 구성" },
        { name: "매콤 김치전 / 감자전", price: "12,000원", badge: "인기", desc: "노릇하게 부쳐낸 바삭한 전 안주" },
      ],
    },
    "62": {
      photo: "./assets/places/place-62.jpg",
      photoCaption: "밤길 들기름 삼겹두부김치 & 수육한판 칼비빔면 감성 주점",
      menus: [
        { name: "수육한판과 칼비빔면", price: "21,000원", badge: "대표", desc: "야들한 보쌈 수육에 매콤새콤 칼비빔면으로 저녁 겸 술자리 해결" },
        { name: "들기름 삼겹 두부김치", price: "18,000원", badge: "인기", desc: "고소한 들기름에 구운 두부와 볶음김치·삼겹살 한상" },
        { name: "수제 고구마크림 막걸리", price: "10,000원", badge: "시그니처", desc: "달콤부드러워 술 못 마시는 동기도 반하는 인기 전통주" },
      ],
    },
    "63": {
      photo: "./assets/places/place-63.jpg",
      photoCaption: "역전할머니맥주 서울경희대점 살얼음 생맥주 & 가성비 안주",
      menus: [
        { name: "살얼음 생맥주 500cc", price: "4,500원", badge: "대표", desc: "전용 냉동잔에 살얼음이 동동 띄워져 나오는 시그니처 맥주" },
        { name: "매콤 치즈라볶이", price: "9,000원", badge: "인기", desc: "튀김만두·어묵·치즈가 듬뿍 들어간 1위 식사형 안주" },
        { name: "직화 염통꼬치 (10pcs)", price: "8,000원", badge: "가성비", desc: "특제 매콤달콤 소스를 발라 구운 맥주 도둑 꼬치" },
        { name: "갈릭빠다포테이토", price: "7,000원", badge: "인기", desc: "버터갈릭 시즈닝과 소스가 중독적인 가성비 감자튀김" },
      ],
    },
    "64": {
      photo: "./assets/places/place-64.jpg",
      photoCaption: "오너셰프 영통 불향 가득 연탄불고기 & 꼬마김밥 한상",
      menus: [
        { name: "직화 연탄불고기 + 꼬마김밥 세트", price: "19,000원", badge: "대표", desc: "은은한 연탄 불향 고기와 꼬마김밥으로 배까지 든든한 1등 안주" },
        { name: "얼큰 국물 닭발 / 무뼈닭발", price: "18,000원", badge: "인기", desc: "매콤칼칼하게 끓여내 소주 안주로 사랑받는 메뉴" },
        { name: "점심 제육·불고기 백반 정식", price: "10,000원", badge: "가성비", desc: "낮 시간대에는 든든한 식사 메뉴로도 운영" },
      ],
    },
    "65": {
      photo: "./assets/places/place-65.jpg",
      photoCaption: "역전할머니맥주 수원영통점 버터갈릭 감자튀김 & 살얼음 맥주",
      menus: [
        { name: "갈릭빠다포테이토", price: "7,000원", badge: "대표", desc: "7천원으로 동기들과 집어 먹기 최고인 달콤짭조름 감자튀김" },
        { name: "살얼음 생맥주 500cc", price: "4,500원", badge: "인기", desc: "시험 끝난 날 갈증을 단번에 날려주는 살얼음 맥주" },
        { name: "살얼음 파인애플", price: "7,000원", badge: "가성비", desc: "2차에서 상큼시원하게 입가심하기 좋은 가성비 안주" },
        { name: "짜파구리 & 반숙계란", price: "9,000원", badge: "", desc: "출출한 밤 맥주와 함께 비벼 먹는 든든 메뉴" },
      ],
    },
    "66": {
      photo: "./assets/places/place-66.jpg",
      photoCaption: "맘스터치 수원경희대점 바삭 통다리살 싸이버거 세트",
      menus: [
        { name: "싸이버거 단품 / 세트", price: "4,900원", badge: "대표", desc: "두툼한 통다리살 패티의 가성비 끝판왕 버거 (세트 7,200원)" },
        { name: "화이트갈릭버거 단품", price: "5,300원", badge: "인기", desc: "부드러운 화이트갈릭 소스와 더블햄·통가슴살 조화" },
        { name: "딥치즈버거 단품", price: "5,200원", badge: "인기", desc: "진한 체다치즈 소스가 듬뿍 올라간 인기 버거" },
        { name: "케이준 양념감자 (중)", price: "2,100원", badge: "", desc: "바삭짭조름한 시그니처 감자튀김" },
      ],
    },
    "67": {
      photo: "./assets/places/place-67.jpg",
      photoCaption: "쑝쑝돈까스 바삭한 경양식 왕돈까스 & 큐브치즈카츠",
      menus: [
        { name: "따끈 유부우동 / 수제어묵꼬지우동", price: "6,500~7,900원", badge: "초가성비", desc: "공강 시간에 빠르게 속 채우는 따끈한 우동" },
        { name: "쑝쑝돈까스 / 불닭돈까스", price: "8,400~8,500원", badge: "대표", desc: "바삭한 등심돈까스를 8천원대에 즐기는 정건 인기 메뉴" },
        { name: "경양식 왕돈까스 / 프리미엄카츠", price: "8,900원", badge: "인기", desc: "만원 미만으로 배불리 먹는 가성비 카츠" },
        { name: "냉우동+돈까스 / 김치우동+돈까스 세트", price: "9,500원", badge: "만원이하", desc: "면과 돈까스를 한 번에 즐기는 실속 세트" },
      ],
    },
    "68": {
      photo: "./assets/places/place-68.jpg",
      photoCaption: "도스마스 수원경희대점 속 꽉 찬 믹스 부리또",
      menus: [
        { name: "도스마스 부리또 (치킨·비프·믹스)", price: "7,000원~", badge: "대표", desc: "밥과 고기·치즈가 묵직하게 꽉 찬 대학가 대표 부리또" },
        { name: "감자튀김 + 음료 세트 업그레이드", price: "+2,500원대", badge: "인기", desc: "든든한 한 끼 세트 구성" },
      ],
    },
    "69": {
      photo: "./assets/places/place-69.jpg",
      photoCaption: "봉구스밥버거 3~4천원대 든든한 햄치즈·제육 밥버거",
      menus: [
        { name: "봉구스 밥버거 (참치마요+김치)", price: "3,500원", badge: "초가성비", desc: "3,500원에 참치마요와 볶음김치가 꽉 찬 스테디셀러" },
        { name: "제육 밥버거", price: "4,500원", badge: "대표", desc: "매콤한 제육볶음이 들어가 든든한 인기 메뉴" },
        { name: "햄치즈 밥버거", price: "5,100원", badge: "인기", desc: "스팸 햄과 고소한 치즈가 더해진 실패 없는 맛" },
        { name: "통살돈까스 밥버거", price: "5,000원", badge: "", desc: "바삭한 돈까스 패티가 통째로 들어간 밥버거" },
      ],
    },
    "70": {
      photo: "./assets/places/place-70.jpg",
      photoCaption: "한솥도시락 빅치킨마요 & 돈까스도련님 가성비 한끼",
      menus: [
        { name: "치킨마요 / 빅치킨마요", price: "3,900원", badge: "초가성비", desc: "대학생 영원한 소울푸드 (빅사이즈 4,600원)" },
        { name: "돈까스도련님 도시락", price: "4,800원", badge: "대표", desc: "돈까스·치킨·햄버그스테이크 3종 구성 실속 도시락" },
        { name: "돈까스도련님 고기고기", price: "6,300원", badge: "인기", desc: "제육과 소불고기까지 추가된 고기 폭탄 도시락" },
        { name: "진달래 도시락", price: "8,000원", badge: "", desc: "새우튀김·떡햄버그·불고기까지 푸짐한 정식" },
      ],
    },
    "71": {
      photo: "./assets/places/place-71.jpg",
      photoCaption: "짜마차이나 착한가격업소 6,500원 옛날 짜장면",
      menus: [
        { name: "옛날 짜장면", price: "7,500원", badge: "대표", desc: "정건 앞에서 빠르게 혼밥하기 좋은 짜장면" },
        { name: "얼큰 해물짬뽕", price: "8,500원", badge: "인기", desc: "칼칼하고 시원한 해장 국물" },
        { name: "탕짜면 / 탕짬면 (1인 반반세트)", price: "9,000~9,500원", badge: "만원이하", desc: "혼자서도 탕수육까지 함께 먹는 가성비 1인 메뉴" },
      ],
    },
    "72": {
      photo: "./assets/places/place-72.jpg",
      photoCaption: "경희 옛날 왕돈까스 접시를 덮는 경양식 수제 왕돈까스",
      menus: [
        { name: "잔치국수 / 매콤 쫄면", price: "6,900원", badge: "만원이하", desc: "6,900원에 푸짐하게 즐기는 국수·쫄면" },
        { name: "경희 옛날 왕돈까스", price: "9,900원", badge: "대표", desc: "접시 가득 나오는 바삭한 정건 경양식 왕돈까스" },
      ],
    },
    "73": {
      photo: "./assets/places/place-73.jpg",
      photoCaption: "신슨즈 치즈 나초 안주 & 시그니처 칵테일·생맥주",
      menus: [
        { name: "12종 칵테일 무제한 패스", price: "18,000원", badge: "무한리필", desc: "12가지 인기 칵테일을 부담 없이 마음껏 즐기는 패스" },
        { name: "레드락 생맥주 / 피치크러쉬", price: "4,000원~", badge: "초가성비", desc: "생맥주 4,000원 · 단품 칵테일 8,000~9,000원" },
        { name: "리코스 치즈 나초", price: "8,000원", badge: "대표", desc: "가볍게 2차 안주로 집어 먹기 좋은 바삭 나초" },
        { name: "브리치즈 & 페퍼치즈 플레이트", price: "10,000원", badge: "인기", desc: "칵테일·맥주와 찰떡궁합인 가성비 치즈 안주" },
      ],
    },
    "74": {
      photo: "./assets/places/place-74.jpg",
      photoCaption: "라사천마라탕 경희대국제캠퍼스점 진한 사골 마라탕",
      menus: [
        { name: "사골 마라탕 (셀프 중량제)", price: "7,000원~", badge: "대표", desc: "먹고 싶은 만큼만 담아 예산 맞춰 즐기는 혼밥 마라탕" },
        { name: "비빔 마라반", price: "8,000원~", badge: "인기", desc: "국물 없이 새콤달콤 매콤하게 비벼 먹는 별미" },
        { name: "직화 마라샹궈", price: "15,000원~", badge: "", desc: "둘 이상 밥약할 때 시키기 좋은 불향 가득 마라샹궈" },
        { name: "찹쌀 꿔바로우 (소)", price: "12,000원", badge: "인기", desc: "바삭쫀득한 식감의 탕수육 사이드" },
      ],
    },
    "75": {
      photo: "./assets/places/place-75.jpg",
      photoCaption: "얜시부 7천원 운남쌀국수 & 바삭한 정통 꿔바로우",
      menus: [
        { name: "마라탕 (기본 6,000원~)", price: "6,000원~", badge: "초가성비", desc: "깊은 현지 풍미 육수에 가성비 최고 중량 단가" },
        { name: "운남 소고기 쌀국수", price: "7,000원", badge: "대표", desc: "7천원으로 속 시원하게 해장하는 쫄깃한 쌀국수" },
        { name: "바삭 꿔바로우", price: "14,000원", badge: "인기", desc: "제대로 튀겨낸 정통 동북식 꿔바로우" },
        { name: "궁보계정 / 어향가지 덮밥·요리", price: "12,000원", badge: "인기", desc: "단짠매콤 밥도둑 본토 중화요리" },
      ],
    },
    "76": {
      photo: "./assets/places/place-76.jpg",
      photoCaption: "서천교동짬뽕 불향 가득 진한 7,000원 교동짬뽕",
      menus: [
        { name: "옛날 짜장면", price: "5,000원", badge: "초가성비", desc: "요즘 보기 힘든 5천원 한 장 착한 가격 짜장면!" },
        { name: "진한 불향 교동짬뽕 / 짬뽕밥", price: "7,000원", badge: "대표", desc: "묵직한 고기·야채 불향 육수로 줄 서서 먹는 대표 짬뽕" },
        { name: "바삭 탕수육 (소)", price: "10,000원", badge: "인기", desc: "둘이 와서 짜장+짬뽕+탕수육 시켜도 총 22,000원!" },
        { name: "바삭 군만두 (6알)", price: "3,000원", badge: "", desc: "혼밥할 때 3천원으로 가볍게 곁들이는 사이드" },
      ],
    },
    "77": {
      photo: "./assets/places/place-77.jpg",
      photoCaption: "머내 큼직한 무쇠 돌판 생삼겹살 & 구운 김치·무생채",
      menus: [
        { name: "돌판 생삼겹살 (1인분)", price: "16,000원", badge: "대표", desc: "커다란 돌판에 김치·콩나물·무생채와 함께 굽는 생삼겹" },
        { name: "진한 선지해장국 (고기 주문 시)", price: "기본제공", badge: "꿀팁", desc: "국물만으로도 소주·공깃밥 순삭되는 시그니처 서비스" },
        { name: "돌판 김치 치즈 볶음밥", price: "3,000원", badge: "인기", desc: "삼겹 기름에 무생채 넣고 볶아 누룽지까지 긁어먹는 별미" },
      ],
    },
    "78": {
      photo: "./assets/places/place-78.jpg",
      photoCaption: "초밥쟁이 영통점 신선한 모듬초밥 & 미니우동 세트",
      menus: [
        { name: "시원 냉소바 / 쭌이초밥(8p)", price: "9,500원", badge: "만원이하", desc: "1만원 미만에 가볍고 깔끔하게 즐기는 메뉴" },
        { name: "싱싱 활어 회덮밥", price: "13,500원", badge: "인기", desc: "두툼한 회가 듬뿍 올라간 든든한 회덮밥" },
        { name: "오늘의 초밥 (10p)", price: "16,000원", badge: "대표", desc: "밥약으로 인기 많은 숙성 모둠 초밥" },
      ],
    },
    "79": {
      photo: "./assets/places/place-79.jpg",
      photoCaption: "뜨돈 수원영통점 바삭한 한돈 수제 돈가스 & 모닝빵 세트",
      menus: [
        { name: "뜨돈 옛날돈가스", price: "10,900원", badge: "대표", desc: "큼직하고 바삭한 경양식 수제 왕돈가스" },
        { name: "쉬림프 로제 짬뽕 파스타", price: "11,900원", badge: "인기", desc: "돈가스와 함께 시키기 좋은 매콤꾸덕 파스타" },
        { name: "뜨돈 수제 돈가스 / 치즈가스", price: "12,900~14,900원", badge: "밥약추천", desc: "영통역 대표 돈가스·파스타 맛집 메뉴" },
      ],
    },
    "80": {
      photo: "./assets/places/place-80.jpg",
      photoCaption: "꾼돈 숯불갈비 영통역점 노릇한 숯불갈비 & 삼겹살",
      menus: [
        { name: "수제 양념 숯불돼지갈비", price: "15,900원", badge: "대표", desc: "참숯 향 가득 구워 먹는 부드러운 수제 양념갈비" },
        { name: "두툼 숙성 삼겹살 / 목살", price: "15,900원", badge: "인기", desc: "육즙 가득한 한돈 삼겹·목살 구이" },
        { name: "쌈채소·밑반찬 셀프바", price: "무료리필", badge: "무한리필", desc: "신선한 쌈채소와 곁들임 반찬 무제한 이용" },
      ],
    },
    "81": {
      photo: "./assets/places/place-81.jpg",
      photoCaption: "생각나는순대국 영통점 건더기 푸짐한 진한 순대국밥",
      menus: [
        { name: "진한 사골 순대국", price: "10,000원", badge: "대표", desc: "머릿고기와 찰순대가 듬뿍 들어간 영통 대표 해장 국밥" },
        { name: "매콤/백 순대철판볶음", price: "12,000원", badge: "인기", desc: "저녁 식사 겸 가볍게 반주하기 좋은 철판 볶음" },
        { name: "1인 수육정식 / 족발정식", price: "13,000원", badge: "인기", desc: "혼자서도 보쌈 수육과 국물을 함께 즐기는 알찬 정식" },
      ],
    },
    "82": {
      photo: "./assets/places/place-82.jpg",
      photoCaption: "이수국밥 고소한 고기·대창 섞어국밥 & 부추무침",
      menus: [
        { name: "경상도식 진한 돼지국밥", price: "10,000원", badge: "대표", desc: "깔끔하고 깊은 육수에 얇게 썬 살코기가 푸짐한 국밥" },
        { name: "고기 + 대창 섞어국밥", price: "10,000원", badge: "인기", desc: "고소한 대창과 살코기를 만원 한 장으로 동시에!" },
        { name: "촉촉 접시 수육 (소)", price: "15,000원", badge: "", desc: "둘이 방문했을 때 곁들이기 좋은 부드러운 수육" },
      ],
    },
    "83": {
      photo: "./assets/places/place-83.jpg",
      photoCaption: "청명칼국수 깊고 진한 닭칼국수 & 매콤 겉절이",
      menus: [
        { name: "청명 진한 닭칼국수", price: "10,000원", badge: "대표", desc: "깊게 우려낸 닭육수와 쫄깃한 생면·닭고명 칼국수" },
        { name: "바삭 수제 튀김손만두", price: "7,000원", badge: "인기", desc: "칼국수와 함께 나눠 먹기 딱 좋은 겉바속촉 만두" },
        { name: "얼큰 해장 칼국수", price: "10,000원", badge: "", desc: "칼칼한 국물이 당기는 날 추천하는 메뉴" },
      ],
    },
    "84": {
      photo: "./assets/places/place-84.jpg",
      photoCaption: "대덕골보쌈칼국수 시원한 해물칼국수 & 마늘보쌈 정식",
      menus: [
        { name: "시원 해물칼국수", price: "9,000원", badge: "대표", desc: "바지락·해물 육수가 진하고 시원한 손칼국수" },
        { name: "보쌈정식 (점심특선)", price: "9,900원", badge: "만원이하", desc: "만원 미만에 야들한 보쌈과 식사를 함께 즐기는 점심 메뉴" },
        { name: "마늘보쌈정식 (점심특선)", price: "10,500원", badge: "인기", desc: "달콤알싸한 마늘 소스가 듬뿍 올라간 시그니처 정식" },
      ],
    },
    "85": {
      photo: "./assets/places/place-85.jpg",
      photoCaption: "고봉민김밥인 수원영통점 바삭 통돈까스김밥 & 분식",
      menus: [
        { name: "고봉민 기본김밥", price: "4,000원", badge: "초가성비", desc: "우엉과 계란지단이 푸짐하게 들어간 정갈한 김밥" },
        { name: "바삭 돈까스김밥", price: "5,000원", badge: "대표", desc: "두툼한 돈까스 스틱이 통째로 들어간 부동의 1위" },
        { name: "청양 매운김밥 / 참치김밥", price: "4,800원", badge: "인기", desc: "알싸한 청양고추 토핑이 매력적인 별미 김밥" },
        { name: "수제비 / 가락우동 / 쫄면", price: "6,500원", badge: "", desc: "김밥과 함께 곁들이기 좋은 분식 면류" },
      ],
    },
    "86": {
      photo: "./assets/places/place-86.jpg",
      photoCaption: "두끼 수원영통점 내 맘대로 소스 조합 즉석떡볶이 무한리필",
      menus: [
        { name: "즉석떡볶이·튀김·볶음밥 무한리필 (성인)", price: "11,900원", badge: "무한리필", desc: "떡·우삼겹·분모자·모둠튀김·어묵·볶음밥·음료 전부 포함!" },
        { name: "중·고·학생 할인 요금", price: "10,900원", badge: "가성비", desc: "학생증 지참 시 프로모션/학생 요금 확인" },
        { name: "눈꽃치즈 / 퐁듀치즈 토핑 추가", price: "4,000원", badge: "인기", desc: "여럿이 가서 치즈 링 두르면 밥약 비주얼 완성" },
      ],
    },
    "87": {
      photo: "./assets/places/place-87.jpg",
      photoCaption: "청년다방 불향 가득 차돌떡볶이 & 버터갈릭 감자튀김",
      menus: [
        { name: "불향 차돌 떡볶이 (2~3인 중)", price: "16,500원", badge: "대표", desc: "고소한 차돌박이와 쫄깃한 롱떡이 어우러진 1위 메뉴" },
        { name: "통큰 오짱 떡볶이 (2~3인 중)", price: "16,500원", badge: "인기", desc: "통오징어 튀김 한 마리가 통째로 올라간 비주얼 메뉴" },
        { name: "버터갈릭 감자튀김", price: "5,500원", badge: "필수사이드", desc: "청년다방 오면 무조건 시키는 달콤고소 감자튀김" },
        { name: "바삭 청년돈까스 (1인 식사)", price: "9,500원", badge: "가성비", desc: "만원 미만으로 즐기는 바삭한 단품 돈까스" },
      ],
    },
    "88": {
      photo: "./assets/places/place-88.jpg",
      photoCaption: "긴자료코 영통점 1.5인분 무료 업그레이드 데미그라스 돈까스",
      menus: [
        { name: "토마토파스타우동 / 로제파스타우동", price: "9,500~10,000원", badge: "만원이하", desc: "전 메뉴 1.5인분 사이즈업 무료 제공!" },
        { name: "가츠동 / 오야꼬동", price: "10,500원", badge: "인기", desc: "푸짐한 양으로 배불리 먹는 일본식 덮밥" },
        { name: "데미그라스 수제 돈까스", price: "13,500원", badge: "대표", desc: "진한 데미그라스 소스의 긴자료코 시그니처" },
      ],
    },
    "89": {
      photo: "./assets/places/place-89.jpg",
      photoCaption: "백소정 수원영통점 감칠맛 가득 마제소바 & 바삭 등심카츠",
      menus: [
        { name: "에비텐어묵우동", price: "10,500원", badge: "따끈국물", desc: "큼직한 새우튀김과 어묵이 올라간 깊은 우동" },
        { name: "백소정 시그니처 마제소바 (+밥 무료)", price: "10,900원", badge: "대표", desc: "특제 민찌 양념에 비벼 먹고 남은 소스에 공기밥 비빔!" },
        { name: "로스카츠(등심) / 치즈카츠(4p)", price: "11,500~13,500원", badge: "인기", desc: "겉바속촉 수제 일식 돈카츠" },
      ],
    },
    "90": {
      photo: "./assets/places/place-90.jpg",
      photoCaption: "승도리네곱도리탕 영통점 고소한 대창 가득 얼큰 곱도리탕",
      menus: [
        { name: "소주 / 맥주 / 음료 파격 특가", price: "1,900원", badge: "초특가", desc: "회식·술자리 술값 부담을 확 낮춰주는 시그니처 혜택" },
        { name: "승도리네 곱도리탕 (1인 기준)", price: "15,000원", badge: "대표", desc: "고소한 대창·소곱창과 매콤 닭볶음탕의 황금 조합" },
        { name: "바삭 감자전", price: "9,000원", badge: "인기", desc: "매콤한 곱도리탕과 찰떡궁합인 사이드 전" },
      ],
    },
    "91": {
      photo: "./assets/places/place-91.jpg",
      photoCaption: "인쌩맥주 영통중앙점 바삭 옛날통닭 & 가성비 호프 안주",
      menus: [
        { name: "파인애플 샤베트", price: "8,900원", badge: "인기", desc: "시원달콤 가성비 최고 과일 안주" },
        { name: "인생떡볶이 / 옛날김치우동 / 염통꼬치(10p)", price: "9,400~9,900원", badge: "대표", desc: "만원 미만에 푸짐하게 나오는 주점 대표 안주" },
        { name: "인생치킨 / 매운어묵", price: "11,900~16,900원", badge: "", desc: "여럿이 나눠 먹기 좋은 바삭 치킨·어묵탕" },
      ],
    },
    "92": {
      photo: "./assets/places/place-92.jpg",
      photoCaption: "투다리 영통점 얼큰 시그니처 김치우동 & 직화 꼬치",
      menus: [
        { name: "숯불 닭산적 꼬치", price: "9,500원", badge: "인기", desc: "짭조름 달콤한 숯불 양념 꼬치" },
        { name: "바삭 진미채튀김", price: "10,000원", badge: "맥주안주", desc: "중독성 있는 고소바삭 마른안주" },
        { name: "투다리 시그니처 김치우동", price: "11,000원", badge: "대표", desc: "칼칼하고 깊은 국물의 영원한 베스트셀러" },
      ],
    },
    "93": {
      photo: "./assets/places/place-93.jpg",
      photoCaption: "분식나라김밥마을 속 꽉 찬 옛날 집김밥 & 얼큰 라면",
      menus: [
        { name: "원조 야채김밥", price: "3,500원", badge: "초가성비", desc: "정건 바로 앞에서 부담 없이 먹는 든든한 김밥" },
        { name: "양푼 비빔밥", price: "4,500~7,500원", badge: "인기", desc: "야채 듬뿍 고추장 비빔밥" },
        { name: "김치찌개 / 손칼국수", price: "5,000~8,000원", badge: "대표", desc: "착한 가격에 속 든든하게 채우는 정건 터줏대감 식사" },
      ],
    },
    "94": {
      photo: "./assets/places/place-94.jpg",
      photoCaption: "오토김밥 수원영통점 폭신한 계란지단 김밥 & 바삭 닭강정 콤보",
      menus: [
        { name: "오토김밥", price: "6,000원", badge: "대표", desc: "계란 지단과 매콤 어묵이 조화로운 시그니처 김밥" },
        { name: "고추냉이김밥 / 스팸김밥", price: "6,000~6,500원", badge: "인기", desc: "알싸하고 감칠맛 나는 인기 김밥" },
        { name: "김밥 + 바삭 닭강정 콤보", price: "10,500원~", badge: "포장추천", desc: "김밥과 바삭한 닭강정을 한 박스에 즐기는 세트" },
      ],
    },
    "95": {
      photo: "./assets/places/place-95.jpg",
      photoCaption: "장터밥상 푸짐한 집밥 밑반찬 & 보글보글 김치찌개·제육 백반",
      menus: [
        { name: "오늘의 장터 집밥 백반", price: "9,000원", badge: "대표", desc: "정갈한 나물·밑반찬과 국이 나오는 자취생 집밥 성지" },
        { name: "장터도시락", price: "10,000원", badge: "만원이하", desc: "알찬 반찬 구성의 든든한 한식 도시락" },
        { name: "제육볶음 / 고등어구이 정식", price: "11,000~12,000원", badge: "인기", desc: "매콤한 제육과 노릇한 생선구이" },
      ],
    },
    "96": {
      photo: "./assets/places/place-96.jpg",
      photoCaption: "씨유쑨 꾸덕한 시그니처 크림 파스타 & 감성 다이닝 플레이트",
      menus: [
        { name: "시그니처 크림 / 오일 파스타", price: "13,000원~", badge: "대표", desc: "깊은 풍미의 수제 소스로 선후배 밥약 만족도 높은 파스타" },
        { name: "트러플 크림 리조또 / 뇨끼", price: "14,000원", badge: "인기", desc: "꾸덕하고 고소한 식감의 베스트 양식 메뉴" },
        { name: "글라스 하우스와인 / 하이볼", price: "7,000원~", badge: "분위기", desc: "저녁 타임 가볍게 분위기 내기 좋은 주류 라인업" },
      ],
    },
    "97": {
      photo: "./assets/places/place-97.jpg",
      photoCaption: "보영만두 영통직영점 노릇바삭 군만두 & 매콤새콤 수원 명물 쫄면",
      menus: [
        { name: "고기찐만두 / 김치찐만두 / 따끈 우동", price: "7,000원", badge: "인기", desc: "담백하고 속이 꽉 찬 수원 정통 만두" },
        { name: "바삭 고기군만두", price: "8,000원", badge: "대표", desc: "쫄면과 함께 시키는 국룰 바삭 군만두" },
        { name: "보영 쫄면 (안매운맛·중간맛·매운맛)", price: "8,000원", badge: "만원이하", desc: "중독성 강한 새콤매콤 수원 명물 쫄면" },
      ],
    },
    "98": {
      photo: "./assets/places/place-98.jpg",
      photoCaption: "깡우동 영통본점 쫄깃한 자가제면 얼큰 어묵우동 & 바삭 탕수육",
      menus: [
        { name: "자가제면 얼큰 깡우동", price: "9,000원", badge: "대표", desc: "쑥갓 향과 칼칼한 국물이 일품인 해장·안주 겸용 시그니처 우동" },
        { name: "푸짐한 어묵우동", price: "10,000원", badge: "인기", desc: "꼬치 어묵과 쫄깃한 생면이 듬뿍 들어간 든든한 한 그릇" },
        { name: "바삭 옛날 수제 탕수육", price: "15,000원", badge: "인기", desc: "얼큰한 우동 국물과 찰떡궁합인 새콤달콤 바삭 탕수육" },
      ],
    },
    "99": {
      photo: "./assets/places/place-99.jpg",
      photoCaption: "누루 노릇바삭 구운 삼겹김치·닭갈비 주먹밥 & 따끈한 우동",
      menus: [
        { name: "삼겹김치 누루 (구운주먹밥)", price: "3,800원", badge: "대표", desc: "노릇한 누룽지 겉면 속에 볶음김치와 삼겹살이 꽉 찬 베스트 메뉴" },
        { name: "매콤 닭갈비 누루 / 참치마요 누루", price: "3,800원", badge: "초가성비", desc: "두 개를 골라 먹어도 7천원대인 든든한 수제 구운주먹밥" },
        { name: "따끈 누루우동 / 김치우동", price: "5,500원~", badge: "인기", desc: "구운 주먹밥과 찰떡궁합인 가쓰오 국물 우동" },
      ],
    },
    "100": {
      photo: "./assets/places/place-100.jpg",
      photoCaption: "청록미나리식당 향긋한 산더미 미나리 오리불고기 & 바삭 미나리전",
      menus: [
        { name: "산더미 미나리 오리불고기 덮밥", price: "11,900원", badge: "대표", desc: "점심에 깔끔하고 든든하게 즐기는 향긋한 미나리 오리덮밥" },
        { name: "청록 미나리 샤브샤브 칼국수", price: "13,900원", badge: "인기", desc: "미나리+버섯+소고기 샤브 후 칼국수·볶음밥까지 즐기는 코스" },
        { name: "바삭 통오징어 미나리전", price: "9,000원", badge: "가성비", desc: "테이블마다 필수로 곁들이는 초록빛 바삭 미나리전" },
      ],
    },
    "101": {
      photo: "./assets/places/place-101.jpg",
      photoCaption: "이삭토스트 노릇한 버터 철판 햄치즈·베이컨베스트 토스트",
      menus: [
        { name: "햄치즈 토스트", price: "3,600원", badge: "초가성비", desc: "달콤한 이삭 소스와 햄·치즈의 클래식 조합" },
        { name: "프렌치 햄치즈 / 햄스페셜 토스트", price: "4,000~4,100원", badge: "대표", desc: "1교시 등교·공강 간식으로 가장 많이 찾는 베스트 메뉴" },
        { name: "계란후라이 햄치즈 / 잠봉 치즈 베이글", price: "4,200~5,200원", badge: "인기", desc: "든든하게 한 끼 식사가 되는 토스트·베이글" },
      ],
    },
    "102": {
      photo: "./assets/places/place-102.jpg",
      photoCaption: "트로이케밥 직화 고기·야채 듬뿍 치킨&비프 터키식 케밥",
      menus: [
        { name: "치킨케밥", price: "7,900원", badge: "대표", desc: "구운 치킨과 신선한 야채·소스가 꽉 찬 정통 케밥" },
        { name: "양고기 케밥", price: "8,900원", badge: "인기", desc: "육향 가득한 정통 터키식 양고기 케밥" },
        { name: "믹스 케밥 (치킨+양고기)", price: "9,900원", badge: "만원이하", desc: "두 가지 고기를 푸짐하게 즐기는 든든 메뉴" },
      ],
    },
    "103": {
      photo: "./assets/places/place-103.jpg",
      photoCaption: "수누리감자탕 영통점 살코기 두툼한 24시 얼큰 뼈다귀해장국 & 감자탕",
      menus: [
        { name: "얼큰 우거지 뼈해장국", price: "10,000원", badge: "대표", desc: "부드러운 등뼈 살코기와 우거지가 뚝배기 가득 나오는 24시 해장국" },
        { name: "수누리 감자탕 (소 2~3인)", price: "32,000원", badge: "심야술집", desc: "동기들과 밤새 소주 기울이며 수제비·볶음밥까지 먹는 정건 명물" },
        { name: "깍두기 볶음밥 / 라면사리", price: "3,000원", badge: "인기", desc: "감자탕 전골 국물에 볶아 먹는 K-디저트" },
      ],
    },
    "104": {
      photo: "./assets/places/place-104.jpg",
      photoCaption: "미미카츠 바삭하고 촉촉한 숙성 등심·치즈 일식 돈카츠 정식",
      menus: [
        { name: "치킨 커리 덮밥", price: "8,700원", badge: "만원이하", desc: "진한 커리와 바삭한 치킨 토핑의 든든한 덮밥" },
        { name: "미미 등심카츠 / 치킨카츠", price: "9,500원", badge: "대표", desc: "만원 미만에 즐기는 겉바속촉 수제 일식 카츠" },
        { name: "통모짜 치즈카츠 / 부드러운 안심카츠", price: "12,000~12,500원", badge: "인기", desc: "정건 카츠 맛집으로 입소문 난 베스트셀러" },
      ],
    },
    "105": {
      photo: "./assets/places/place-105.jpg",
      photoCaption: "이모찌마 햄·두부 가득 7천원대 얼큰 부대찌개 & 집밥 반찬 한상",
      menus: [
        { name: "이모찌마 부대찌개 (소)", price: "10,900원", badge: "대표", desc: "햄·소시지와 진한 육수가 어우러진 든든한 부대찌개" },
        { name: "국내산 냉장고기 김치찌개 (소)", price: "11,900원", badge: "인기", desc: "신선한 생돼지고기가 듬뿍 들어간 칼칼한 김치찌개" },
      ],
    },
    "106": {
      photo: "./assets/places/place-106.jpg",
      photoCaption: "하전관 돼지국밥 뽀얗고 진한 사골 돼지국밥 & 부추무침 한상",
      menus: [
        { name: "하전관 돼지국밥", price: "10,000원", badge: "대표", desc: "잡내 없이 진하고 구수하게 우려낸 정통 돼지국밥" },
        { name: "내장국밥 / 막창국밥", price: "12,000~13,000원", badge: "인기", desc: "쫄깃하고 고소한 내장·막창이 듬뿍 들어간 해장 국밥" },
      ],
    },
    "107": {
      photo: "./assets/places/place-107.jpg",
      photoCaption: "콩마루 전주 콩나물국밥 6천원대 시원칼칼 뚝배기 콩나물국밥 & 수란",
      menus: [
        { name: "전주 콩나물국밥", price: "7,000원", badge: "대표", desc: "시원칼칼하게 속 풀어주는 7,000원 가성비 국밥" },
        { name: "김치콩나물국밥 / 콩나물비빔밥", price: "8,000~8,500원", badge: "인기", desc: "칼칼한 김치 국밥과 고소한 비빔밥" },
        { name: "황태콩나물국밥 / 돌솥비빔밥", price: "9,000원", badge: "해장추천", desc: "진한 황태 육수로 해장에 최고인 메뉴" },
      ],
    },
    "108": {
      photo: "./assets/places/place-108.jpg",
      photoCaption: "고운돈 79냉삼집 호일 불판 노릇한 7,900원 급랭삼겹살 & 구운 김치",
      menus: [
        { name: "국내산 급랭삼겹살 / 대패삼겹살", price: "7,900원", badge: "초가성비", desc: "행안부 착한가격업소 인증 7,900원 혜자 냉삼겹" },
        { name: "얼큰 김치술밥 / 구수한 된장술밥", price: "6,000원", badge: "대표", desc: "고기 구운 뒤 소주 한 병 더 부르는 든든한 마무리 술밥" },
        { name: "양푼 김치찌개 / 된장찌개", price: "3,500원~", badge: "인기", desc: "된장찌개 3,500원 · 소주 4,000원 대학생 통장 지킴이" },
      ],
    },
    "109": {
      photo: "./assets/places/place-109.jpg",
      photoCaption: "금별맥주 수원영통점 바삭한 페퍼로니 페스츄리 피자 & 살얼음 맥주",
      menus: [
        { name: "핫 페퍼로니 / 베이컨치즈 페스츄리 피자", price: "13,900원", badge: "대표", desc: "겹겹이 바삭한 페스츄리 도우로 맥주와 찰떡궁합인 시그니처" },
        { name: "백합조개 버터술찜 (+파스타면 추가)", price: "18,000원", badge: "인기", desc: "고소하고 시원한 버터 조개 육수에 면까지 추가해 먹는 안주" },
        { name: "파인애플 샤베트 / 허니치킨 가라아게", price: "9,900원~", badge: "가성비", desc: "만원 안팎으로 가볍게 시키기 좋은 2차 인기 메뉴" },
      ],
    },
    "110": {
      photo: "./assets/places/place-110.jpg",
      photoCaption: "냉삼집 영통점 노릇노릇 구운 급랭삼겹살 & 매콤 비빔쫄면 한상",
      menus: [
        { name: "급랭삼겹살 (200g)", price: "9,900원", badge: "대표", desc: "200g 1인분 9,900원! 새벽 4시까지 즐기는 가성비 냉삼" },
        { name: "돈차돌 (200g)", price: "11,000원", badge: "인기", desc: "고소하고 야들한 돈차돌 구이" },
        { name: "차돌된장찌개 / 김치찌개 / 짜게치", price: "5,000원", badge: "필수사이드", desc: "냉삼과 찰떡궁합인 5천원 알짜 식사·안주" },
      ],
    },
    "111": {
      photo: "./assets/places/place-111.jpg",
      photoCaption: "화성옥 영통점 24시 얼큰 전통 육개장 & 시원한 콩나물국밥",
      menus: [
        { name: "전주식 콩나물국밥", price: "9,000원", badge: "대표", desc: "24시간 언제든 속 시원하게 해장하는 콩나물국밥" },
        { name: "콩나물비빔밥 / 김치·황태콩나물국밥", price: "9,500~10,000원", badge: "만원이하", desc: "든든한 식사 및 야간 해장 인기 메뉴" },
        { name: "전통육개장 / 뚝배기불고기", price: "11,000원", badge: "인기", desc: "진하고 얼큰한 육개장과 달짝지근 불고기" },
      ],
    },
    "112": {
      photo: "./assets/places/place-112.jpg",
      photoCaption: "생마차 경희대점 바삭 단짠 테바나카 닭날개 피라미드 & 1,900원 생맥주",
      menus: [
        { name: "테바나카 닭날개튀김 (10pcs)", price: "9,000원", badge: "초가성비", desc: "개당 900원꼴! 후추향과 특제 간장소스가 중독적인 시그니처 치킨" },
        { name: "살얼음 생맥주 (300cc)", price: "1,900원", badge: "대표", desc: "물 대신 시켜도 부담 없는 1,900원 가성비 생맥주" },
        { name: "철판 오코노미야끼 / 네기마요 타코야끼", price: "9,000원~", badge: "인기", desc: "만원 안쪽으로 푸짐하게 집어 먹는 일본식 길거리 안주" },
      ],
    },
    "113": {
      photo: "./assets/places/place-113.jpg",
      photoCaption: "나은이네 얼큰진한 곱도리탕 & 고소한 맷돌 들기름 메밀국수",
      menus: [
        { name: "맷돌 메밀 들기름 국수 / 물국수", price: "12,000원", badge: "인기", desc: "직접 갈아 만든 고소한 메밀면 시그니처" },
        { name: "명란오이구이 / 청량교자튀김", price: "10,000~14,000원", badge: "가성비안주", desc: "가볍게 술 한잔 곁들이기 좋은 별미 안주" },
        { name: "나은이네 곱도리탕 / 메밀치킨", price: "23,000~25,000원", badge: "대표", desc: "회기 감성 주점 나은이네 대표 메인 요리" },
      ],
    },
    "114": {
      photo: "./assets/places/place-114.jpg",
      photoCaption: "호텔글로리 회기본점 불향 가득 차돌숙주볶음 & 얼음생맥주",
      menus: [
        { name: "불향 가득 차돌숙주볶음", price: "14,900원", badge: "대표", desc: "아삭한 숙주와 고소한 차돌박이를 수북하게 볶아낸 베스트 안주" },
        { name: "얼큰 차돌전골 / 부대전골", price: "16,900원~", badge: "심야해장", desc: "새벽까지 소주 기울이기 좋은 진한 국물 전골" },
        { name: "살얼음 생맥주 / 하이볼", price: "4,500원~", badge: "인기", desc: "부담 없는 가격대의 시원한 주류 구성" },
      ],
    },
    "115": {
      photo: "./assets/places/place-115.jpg",
      photoCaption: "역전우동0410 회기역점 24시간 따끈한 가쓰오 옛날우동 & 돈까스덮밥",
      menus: [
        { name: "가쓰오 옛날우동", price: "4,500원", badge: "초가성비", desc: "4,500원에 진한 가쓰오 국물과 쫄깃한 면발을 즐기는 24시 국민 우동" },
        { name: "칼칼한 얼큰우동 / 어묵우동", price: "5,500원~", badge: "해장추천", desc: "술 마신 뒤 귀갓길 해장으로 완벽한 매콤칼칼 우동" },
        { name: "소불고기 김치덮밥 / 더블치즈돈까스", price: "7,500원~", badge: "대표", desc: "새벽에도 든든하게 밥 한 끼 챙길 수 있는 덮밥·돈까스" },
      ],
    },
    "116": {
      photo: "./assets/places/place-116.jpg",
      photoCaption: "88맵도리분식포차 화끈한 국물닭발·맵도리탕 & 날치알 주먹밥",
      menus: [
        { name: "88 즉석 포차떡볶이", price: "10,000원", badge: "대표", desc: "매콤달콤 푸짐하게 끓여 먹는 시그니처 안주" },
        { name: "88 매콤 국물닭발", price: "13,000원", badge: "인기", desc: "스트레스 확 풀리는 칼칼한 국물닭발" },
        { name: "88 닭도리탕 / 묵은지닭도리탕", price: "24,000~27,000원", badge: "", desc: "여럿이 든든하게 먹는 포차 대표 전골" },
      ],
    },
    "117": {
      photo: "./assets/places/place-117.jpg",
      photoCaption: "토리키치 회기역점 직화 숯불 야키토리 모둠꼬치 & 시원한 하이볼",
      menus: [
        { name: "야키토리 단품 꼬치 (대파닭·염통·껍질)", price: "2,900원~", badge: "가성비", desc: "먹고 싶은 부위만 골라 주문하는 특제 타레소스 숯불꼬치" },
        { name: "야키토리 & 쿠시카츠 모둠 세트", price: "15,900원", badge: "대표", desc: "인기 꼬치와 바삭한 오사카식 튀김꼬치를 한 번에!" },
        { name: "타코야끼 / 포테토사라다 / 리얼하이볼", price: "4,900원~", badge: "인기", desc: "하이볼 4,900원 · 가벼운 사이드 안주 7,900원" },
      ],
    },
    "118": {
      photo: "./assets/places/place-118.jpg",
      photoCaption: "하마루 회기점 가쓰오부시 듬뿍 철판 해물 오꼬노미야끼 & 야끼소바",
      menus: [
        { name: "수제 반죽 해물 오꼬노미야끼", price: "17,000원", badge: "대표", desc: "양배추와 해물이 아낌없이 들어간 두툼한 일본식 철판 부침개" },
        { name: "직화 해물 야끼소바 / 명란 치즈 계란말이", price: "16,000원", badge: "인기", desc: "짭조름한 특제 소스 볶음면으로 저녁 겸 안주 해결" },
        { name: "야키토리 5종 오마카세", price: "17,000원", badge: "", desc: "숯불 향 가득 구워낸 대표 꼬치 5종 구성" },
      ],
    },
    "119": {
      photo: "./assets/places/place-119.jpg",
      photoCaption: "투다리 경희대점 얼큰 칼칼 시그니처 뚝배기 김치우동 & 꼬치구이",
      menus: [
        { name: "숯불 닭산적 꼬치", price: "9,500원", badge: "인기", desc: "부담 없이 시키기 좋은 투다리 대표 꼬치" },
        { name: "바삭 진미채튀김", price: "10,000원", badge: "맥주안주", desc: "시원한 생맥주와 찰떡궁합 튀김" },
        { name: "투다리 시그니처 김치우동", price: "11,000원", badge: "대표", desc: "2차 해장 안주로 빠지지 않는 칼칼한 김치우동" },
      ],
    },
    "120": {
      photo: "./assets/places/place-120.jpg",
      photoCaption: "생활맥주 외대점 겉바속촉 앵그리버드 크리스피 치킨 & 수제 생맥주",
      menus: [
        { name: "유동 골빔면", price: "12,000원", badge: "인기", desc: "매콤새콤 수제맥주와 잘 어울리는 별미 면 안주" },
        { name: "버팔로 윙과 감자 / 크리스피 텐더와 새우", price: "20,000원", badge: "맥주안주", desc: "바삭한 텐더·윙과 감자튀김 실속 플래터" },
        { name: "앵그리버드 크리스피 치킨", price: "22,000원", badge: "대표", desc: "생활맥주 시그니처 매콤바삭 치킨" },
      ],
    },
    "121": {
      photo: "./assets/places/place-121.jpg",
      photoCaption: "따뜻한밥상 회기 3,000원 보글보글 김치찌개 & 반숙 계란후라이",
      menus: [
        { name: "김치찌개 1인분 (+공깃밥 무한리필)", price: "3,000원", badge: "초가성비", desc: "요즘 물가에 믿기지 않는 3,000원 김치찌개와 밥 무한리필" },
        { name: "직접 부치는 계란후라이 / 라면사리", price: "500원", badge: "필수추가", desc: "셀프 코너 계란후라이 500원 · 꼬들한 라면사리 500원" },
        { name: "스팸 햄사리 / 고기사리 추가", price: "2,000원~", badge: "인기", desc: "고기·햄 사리를 푸짐하게 추가해도 5~6천원대!" },
      ],
    },
    "122": {
      photo: "./assets/places/place-122.jpg",
      photoCaption: "17(십칠) 쫄깃한 정통 수제 화덕 마르게리따·페퍼로니 피자",
      menus: [
        { name: "화덕 치즈 피자", price: "9,500원", badge: "만원이하", desc: "화덕에서 갓 구워낸 쫄깃한 도우의 가성비 피자" },
        { name: "페페로니 피자 / 마르게리따", price: "10,000~11,000원", badge: "대표", desc: "만원 초반대에 즐기는 골목식당 극찬 화덕피자" },
        { name: "리코타 페페로니 / 포치즈 피자", price: "12,000~14,000원", badge: "밥약추천", desc: "선후배 밥약·데이트로 최고 인기인 치즈 풍미 피자" },
      ],
    },
    "123": {
      photo: "./assets/places/place-123.jpg",
      photoCaption: "왼손 우동짜장탕수육 정겨운 3,000원 옛날짜장면 & 바삭 탕수육",
      menus: [
        { name: "옛날 짜장면 / 옛날 우동", price: "3,000원", badge: "초가성비", desc: "단돈 3천원으로 즐기는 쫄깃한 기계식 생면 짜장·우동" },
        { name: "칼칼한 얼큰우동 / 시원 냉우동 / 짜장밥", price: "4,000원", badge: "인기", desc: "4천원에 든든하게 속을 풀어주는 인기 식사류" },
        { name: "바삭 옛날 탕수육 (1인~소)", price: "6,000원", badge: "대표", desc: "짜장면(3,000원)과 함께 시켜도 총 9,000원인 혜자 탕수육!" },
      ],
    },
    "124": {
      photo: "./assets/places/place-124.jpg",
      photoCaption: "다해식당 보글보글 순두부·참치김치찌개 & 정겨운 집밥 백반",
      menus: [
        { name: "순두부찌개 / 참치찌개 / 김치찌개", price: "7,000원", badge: "초가성비", desc: "푸짐한 집밥 밑반찬과 함께 나오는 7천원 뚝배기 백반" },
        { name: "제육덮밥 / 김치볶음밥 (+계란후라이)", price: "8,000원", badge: "대표", desc: "계란후라이와 국물까지 넉넉히 챙겨주는 대학가 소울푸드" },
        { name: "지글지글 돌솥비빔밥 / 알밥", price: "8,000원", badge: "인기", desc: "누룽지까지 긁어 먹는 든든한 돌솥 메뉴" },
      ],
    },
    "125": {
      photo: "./assets/places/place-125.jpg",
      photoCaption: "아리랑동가스 바삭달콤 추억의 6천원대 옛날 경양식 돈가스",
      menus: [
        { name: "아리랑 옛날 경양식 돈가스", price: "6,000원~", badge: "초가성비", desc: "고소한 데미소스가 듬뿍 뿌려진 추억의 바삭 돈가스" },
        { name: "바삭 생선가스 / 반반 정식", price: "7,500원~", badge: "인기", desc: "담백한 생선가스와 돈가스를 부담 없이 즐기는 메뉴" },
        { name: "케첩 옛날 오므라이스", price: "7,000원~", badge: "", desc: "포슬포슬 계란 지단에 감싸진 정겨운 오므라이스" },
      ],
    },
    "126": {
      photo: "./assets/places/place-126.jpg",
      photoCaption: "신의한국수 외대점 4,900원 따끈한 잔치국수·유부우동 & 야채김밥",
      menus: [
        { name: "진한 멸치 잔치국수 / 유부우동", price: "4,900원", badge: "초가성비", desc: "5천원 미만으로 따끈하게 속을 채우는 시그니처 면 요리" },
        { name: "야채김밥 / 튀김만두 사이드", price: "3,800원~", badge: "인기", desc: "국수와 함께 곁들이기 딱 좋은 3~4천원대 실속 메뉴" },
        { name: "얼큰 김치우동 / 비빔국수", price: "6,000원~", badge: "대표", desc: "매콤칼칼한 맛으로 학생들에게 가장 인기 많은 메뉴" },
      ],
    },
    "127": {
      photo: "./assets/places/place-127.jpg",
      photoCaption: "정성서울국수집 착한가격업소 5,000원 진한 멸치국수 & 수제 손만두",
      menus: [
        { name: "직접 우린 멸치국수", price: "5,000원", badge: "초가성비", desc: "착한가격업소 인증! 매일 끓이는 깊은 멸치육수 잔치국수" },
        { name: "새콤매콤 비빔국수", price: "6,000원", badge: "인기", desc: "직접 만든 과일 양념장으로 비벼낸 입맛 돋우는 국수" },
        { name: "따끈 칼국수 / 직접 빚은 수제만두", price: "7,000원", badge: "대표", desc: "속이 꽉 찬 직접 빚은 손만두와 바지락·멸치 칼국수" },
      ],
    },
    "128": {
      photo: "./assets/places/place-128.jpg",
      photoCaption: "현대반점 정겨운 동네 노포 5,000원 옛날 짜장면",
      menus: [
        { name: "옛날 짜장면", price: "8,000원", badge: "대표", desc: "회기동 골목을 오래 지켜온 정통 노포 짜장면" },
        { name: "간짜장 / 얼큰 짬뽕 / 우동", price: "9,000원", badge: "인기", desc: "주문 즉시 볶아내는 불향 가득 간짜장과 짬뽕" },
        { name: "탕수육 + 짜장1 세트", price: "22,000원", badge: "가성비세트", desc: "바삭한 옛날 탕수육과 식사를 함께 즐기는 세트" },
      ],
    },
    "129": {
      photo: "./assets/places/place-129.jpg",
      photoCaption: "언니네함바그 지글지글 철판 수제 치즈 함박스테이크 & 반숙 계란",
      menus: [
        { name: "기본 / 매콤 수제 함박 스테이크", price: "12,500원", badge: "대표", desc: "육즙 가득 두툼하게 구워낸 수제 함박 스테이크" },
        { name: "치즈 / 카레 함박 스테이크", price: "13,500원", badge: "인기", desc: "고소한 치즈와 진한 카레 소스를 듬뿍 얹은 메뉴" },
      ],
    },
    "130": {
      photo: "./assets/places/place-130.jpg",
      photoCaption: "아욱꽃 바삭 수제 등심돈가스 & 매콤 김치볶음밥 세트",
      menus: [
        { name: "수제 돈가스 + 미니 김치볶음밥 세트", price: "10,500원", badge: "대표", desc: "돈가스와 김치볶음밥 두 가지 소울푸드를 동시에 맛보는 1위 세트" },
        { name: "아욱꽃 수제 등심돈가스", price: "9,500원", badge: "인기", desc: "직접 두드려 튀겨낸 바삭하고 부드러운 경양식 돈가스" },
        { name: "작은 김치볶음밥 (+계란후라이)", price: "6,500원", badge: "가성비", desc: "가볍게 한 끼 챙기기 좋은 불향 가득 김치볶음밥" },
      ],
    },
    "131": {
      photo: "./assets/places/place-131.jpg",
      photoCaption: "통일 부대찌개 햄·소시지 듬뿍 칼칼한 2대 전통 부대찌개",
      menus: [
        { name: "통일 전통 부대찌개 (1인분)", price: "9,000원", badge: "대표", desc: "진한 육수와 햄·소시지가 푸짐한 정문 터줏대감 부대찌개" },
        { name: "차돌 부대찌개 (1인분)", price: "11,000원", badge: "인기", desc: "고소한 차돌박이를 더해 국물이 더욱 깊은 메뉴" },
      ],
    },
    "132": {
      photo: "./assets/places/place-132.jpg",
      photoCaption: "아지매식당 노릇한 돼지불백·제육볶음 & 정갈한 집밥 반찬 한상",
      menus: [
        { name: "매콤 제육볶음 / 간장 돼지불백 백반", price: "8,000원", badge: "대표", desc: "푸짐한 고기와 집밥 밑반찬·국물이 함께 나오는 8천원 한상" },
        { name: "시골 된장찌개 / 생고기 김치찌개", price: "7,500원~", badge: "집밥", desc: "집에서 끓인 듯 깊고 구수한 뚝배기 찌개 백반" },
        { name: "오징어볶음 / 고등어구이 백반", price: "9,000원", badge: "인기", desc: "둘이 가서 제육+생선구이 나눠 먹기 딱 좋은 조합" },
      ],
    },
    "133": {
      photo: "./assets/places/place-133.jpg",
      photoCaption: "미스터국밥 경희대직영점 고기 듬뿍 진한 8,000원 수육국밥",
      menus: [
        { name: "진한 수육 고기국밥", price: "8,000원", badge: "대표", desc: "부드러운 살코기가 넉넉히 들어간 8,000원 가성비 국밥" },
        { name: "칼칼한 얼큰 고기국밥 / 순대국밥", price: "8,500원", badge: "해장추천", desc: "전날 술자리 해장으로 속 확 풀리는 얼큰 육수" },
        { name: "1인 국밥 + 맛보기 수육 정식", price: "11,500원", badge: "인기", desc: "촉촉한 수육 한 접시까지 함께 즐기는 든든 정식" },
      ],
    },
    "134": {
      photo: "./assets/places/place-134.jpg",
      photoCaption: "참이맛감자탕&순대국 들깨가루 듬뿍 구수한 9,000원 순대국밥",
      menus: [
        { name: "참이맛 뼈해장국 / 전통 순대국", price: "10,000원", badge: "대표", desc: "살코기 두툼한 뼈해장국과 진한 순대국" },
        { name: "묵은지뼈해장국 / 얼큰순대국", price: "11,000원", badge: "해장추천", desc: "칼칼하게 속 풀어주는 얼큰 해장 메뉴" },
        { name: "참이맛 감자탕 (소)", price: "33,000원", badge: "단체모임", desc: "선후배 모임·회식으로 푸짐하게 즐기는 감자탕" },
      ],
    },
    "135": {
      photo: "./assets/places/place-135.jpg",
      photoCaption: "고황24시뼈다귀해장국감자탕 살코기 푸짐한 정문 명물 뼈해장국",
      menus: [
        { name: "고황 뼈다귀해장국", price: "9,000원", badge: "대표", desc: "9,000원에 푸짐한 뼈고기와 우거지가 가득 나오는 해장 성지" },
        { name: "감자탕 소 (2~3인)", price: "25,000원", badge: "초가성비전골", desc: "둘·셋이서 25,000원에 배불리 먹는 가성비 감자탕" },
        { name: "매콤 뼈다귀찜 소", price: "29,000원", badge: "인기", desc: "중독성 있는 매콤 양념 뼈찜" },
      ],
    },
    "136": {
      photo: "./assets/places/place-136.jpg",
      photoCaption: "놀부만두 착한가격업소 피 얇고 속 꽉 찬 7,000원 수제 통만두",
      menus: [
        { name: "수제 고기통만두 (10개 한 판)", price: "7,000원", badge: "대표", desc: "착한가격업소 인증! 육즙 가득 직접 빚은 고기만두 10피스" },
        { name: "매콤 수제 김치만두 (8개 한 판)", price: "7,000원", badge: "인기", desc: "아삭하고 칼칼한 김치소가 꽉 찬 별미 손만두" },
        { name: "시원 살얼음 냉모밀 / 떡만둣국", price: "8,000원", badge: "계절별미", desc: "통만두와 함께 곁들이기 최고인 모밀·만둣국" },
      ],
    },
    "137": {
      photo: "./assets/places/place-137.jpg",
      photoCaption: "갈비장터 구수한 착한가격 된장찌개 백반 & 노릇한 숯불 돼지갈비",
      menus: [
        { name: "구수한 된장찌개 식사 백반", price: "8,000원", badge: "착한가격", desc: "동대문구 착한가격업소 등재 푸짐한 된장찌개 한식 한상" },
        { name: "수제 양념 돼지갈비 (1인분)", price: "15,000원~", badge: "대표", desc: "새벽 2시까지 합리적인 가격에 구워 먹는 달콤짭조름 갈비" },
        { name: "시원 물냉면 / 비빔냉면", price: "8,000원", badge: "인기", desc: "양념갈비와 함께 싸 먹는 개운한 마무리 냉면" },
      ],
    },
    "138": {
      photo: "./assets/places/place-138.jpg",
      photoCaption: "마루기 진한 사골 돈코츠라멘 & 촉촉한 수제 가츠동",
      menus: [
        { name: "촉촉한 일식 수제 가츠동", price: "9,500원", badge: "만원이하", desc: "두툼한 돈카츠와 반숙 계란·특제 쯔유 소스가 어우러진 덮밥" },
        { name: "정통 돈코츠라멘 / 매운 돈코츠라멘", price: "10,000원~", badge: "대표", desc: "직접 깊게 우려낸 진한 사골 육수와 차슈·반숙란 라멘" },
        { name: "바삭 야끼교자 (6pcs)", price: "3,500원", badge: "초가성비", desc: "3,500원에 6피스 나오는 가성비 최고 군만두 사이드" },
      ],
    },
    "139": {
      photo: "./assets/places/place-139.jpg",
      photoCaption: "오관스시 두툼하고 윤기 흐르는 숙성 네타 모둠초밥 한판",
      menus: [
        { name: "오관 점심/기본 모둠초밥 세트", price: "14,000원~", badge: "대표", desc: "가격 대비 압도적인 두께와 숙성도를 자랑하는 시그니처 스시" },
        { name: "특선 숙성 모둠초밥 (장국 포함)", price: "18,000원~", badge: "밥약원탑", desc: "선후배 밥약 때 사주면 두고두고 칭찬받는 1티어 메뉴" },
        { name: "연어·광어 지느러미 단품 추가", price: "피스별", badge: "인기", desc: "입에서 녹는 숙성 연어와 엔가와 추가" },
      ],
    },
    "140": {
      photo: "./assets/places/place-140.jpg",
      photoCaption: "우시라멘 경희대 후문 앞 진한 육수의 돈코츠·카라이 라멘",
      menus: [
        { name: "진한 돈코츠 라멘 / 매운 돈코츠 라멘", price: "10,000원", badge: "대표", desc: "경희대 후문 1분 거리 깊고 진한 사골 육수 라멘" },
        { name: "차슈 덮밥 / 규동", price: "10,000원", badge: "만원이하", desc: "혼밥으로 든든하게 즐기는 일본식 고기 덮밥" },
        { name: "구로마유·바질 라멘 / 수제 돈카츠 카레", price: "10,500원", badge: "인기", desc: "별미 라멘과 바삭한 수제 카츠 카레" },
      ],
    },
    "141": {
      photo: "./assets/places/place-141.jpg",
      photoCaption: "경희쌈밥 무제한 싱싱 모둠 쌈채소 & 매콤 직화 제육쌈밥 한상",
      menus: [
        { name: "든든 한식뷔페 (1인 식사)", price: "8,000원", badge: "초가성비", desc: "혼밥 자취생도 8,000원에 집밥 반찬을 배불리 먹는 혜자 뷔페!" },
        { name: "제육볶음 / 삼겹살 2인 쌈밥정식세트 (2인분)", price: "26,000원", badge: "대표", desc: "2인 방문 시 1인 13,000원! 10여 종 싱싱 쌈채소 무한리필" },
        { name: "소불고기 / 오리훈제 / 쭈꾸미 2인 쌈밥세트", price: "27,000원", badge: "밥약추천", desc: "선후배 밥약으로 가장 사랑받는 푸짐한 2인 한상" },
        { name: "제육 / 삼겹 1인 쌈밥정식", price: "16,000원", badge: "", desc: "1인 단독 쌈밥 정식 주문 가능" },
      ],
    },
    "142": {
      photo: "./assets/places/place-142.jpg",
      photoCaption: "장수식당 다채로운 제철 나물 보리밥 & 구수한 된장찌개 한상",
      menus: [
        { name: "장수 나물 보리밥 한상", price: "12,000원", badge: "대표", desc: "정갈한 나물과 구수한 찌개가 함께 나오는 건강 백반" },
        { name: "얼큰 돼지 김치찌개", price: "12,000원", badge: "인기", desc: "진하게 끓여낸 집밥 스타일 김치찌개" },
        { name: "매콤 제육볶음 한접시", price: "24,000원", badge: "단체추천", desc: "보리밥과 함께 나눠 먹기 좋은 푸짐한 제육" },
      ],
    },
    "143": {
      photo: "./assets/places/place-143.jpg",
      photoCaption: "한식뷔페칠성 경희대점 매일 바뀌는 고기반찬·집밥 무제한 한상",
      menus: [
        { name: "자율배식 무제한 한식뷔페 (평일·주말)", price: "9,000원", badge: "대표", desc: "새벽 05:30 오픈! 매일 바뀌는 고기 메인과 수제 반찬 무제한" },
        { name: "금요일 스페셜 삼겹살데이 뷔페", price: "10,000원", badge: "인기", desc: "매주 금요일 노릇한 삼겹살까지 무제한으로 즐기는 날!" },
        { name: "셀프 라면 / 캔음료 추가", price: "1,000원", badge: "초특가", desc: "천 원으로 끓여 먹는 뜨끈한 라면" },
      ],
    },
    "144": {
      photo: "./assets/places/place-144.jpg",
      photoCaption: "중식당 배유 동글폭신한 목화솜 탕수육 & 진한 해물짬뽕",
      menus: [
        { name: "유니 짜장면", price: "6,000원~", badge: "초가성비", desc: "거지맵 등재 가성비 좋은 정통 동네 짜장면" },
        { name: "얼큰 해물짬뽕 / 차돌박이짬뽕", price: "8,500원~", badge: "대표", desc: "신선한 해물과 불향이 살아있는 해장 짬뽕" },
        { name: "동글바삭 목화솜 탕수육", price: "16,000원~", badge: "인기", desc: "구름처럼 폭신하고 쫀득한 배유만의 시그니처 탕수육" },
      ],
    },
    "145": {
      photo: "./assets/places/place-145.jpg",
      photoCaption: "유림식당 노릇바삭 고등어구이 & 정갈한 서천 집밥 백반",
      menus: [
        { name: "매콤 제육볶음 / 오징어볶음 백반", price: "9,000원~", badge: "대표", desc: "엄마 손맛 밑반찬이 푸짐하게 깔리는 대표 백반" },
        { name: "화덕/철판 고등어구이 정식", price: "9,500원", badge: "인기", desc: "자취방에서 못 구워 먹는 바삭촉촉 생선구이 한상" },
        { name: "구수한 청국장 / 생고기 김치찌개", price: "9,000원", badge: "집밥", desc: "깊고 진한 국물로 속이 든든해지는 찌개 백반" },
      ],
    },
    "146": {
      photo: "./assets/places/place-146.jpg",
      photoCaption: "밥풀떼기 한식부페 갓 만든 고기반찬·잡채·집밥 무한리필",
      menus: [
        { name: "오늘의 수제 한식뷔페 무제한 1인", price: "10,000원", badge: "무한리필", desc: "매일 아침 직접 만드는 메인 고기요리와 10여 종 반찬 무제한" },
        { name: "오늘의 국 · 찌개 · 누룽지 코너", price: "무료포함", badge: "인기", desc: "따끈한 국물과 구수한 숭늉·식혜 후식까지 완비" },
        { name: "셀프 계란·비빔밥 코너", price: "무료포함", badge: "꿀팁", desc: "신선한 나물을 넣어 양푼 비빔밥으로도 제조 가능" },
      ],
    },
    "147": {
      photo: "./assets/places/place-147.jpg",
      photoCaption: "키와마루아지 경희대점 24시간 우린 진한 돈코츠 미라멘 & 반숙란",
      menus: [
        { name: "미라멘 (가마솥 돈코츠) / 직화 부타동", price: "8,500원", badge: "대표", desc: "진한 24시간 돈코츠 라멘과 직화 덮밥 · 공기밥 무료!" },
        { name: "규동 (소고기 덮밥)", price: "9,000원", badge: "만원이하", desc: "달짝지근 촉촉한 일본식 규동" },
        { name: "극라멘 (매운 돈코츠) / 진한 츠케멘", price: "9,500원", badge: "인기", desc: "해장에 최고인 얼큰 극라멘과 쫄깃한 찍먹 츠케멘" },
      ],
    },
    "148": {
      photo: "./assets/places/place-148.jpg",
      photoCaption: "홍대쌀국수 경희대국제캠퍼스점 숙주 듬뿍 시원한 소고기 쌀국수",
      menus: [
        { name: "베트남 소고기 양지 쌀국수", price: "6,900원~", badge: "초가성비", desc: "깔끔하고 진한 육수에 숙주와 소고기가 푸짐한 대표 메뉴" },
        { name: "얼큰 해장 매운 쌀국수", price: "7,900원~", badge: "해장추천", desc: "전날 술자리 속을 확 풀어주는 칼칼한 쌀국수" },
        { name: "불향 볶음쌀국수 / 짜조 사이드", price: "8,500원~", badge: "인기", desc: "매콤달콤 소스에 볶아낸 별미 볶음면" },
      ],
    },
    "149": {
      photo: "./assets/places/place-149.jpg",
      photoCaption: "오늘국수 깔끔하고 깊은 6,000원 진한 멸치국수 & 주먹밥",
      menus: [
        { name: "오늘 진한 멸치국수", price: "6,500원", badge: "초가성비", desc: "깊고 깔끔한 멸치 육수에 푸짐하게 말아주는 서천마을 대표 국수" },
        { name: "시원 냉국수 / 새콤매콤 비빔국수", price: "7,500~8,000원", badge: "인기", desc: "입맛 돋우는 살얼음 냉국수와 비빔국수" },
        { name: "손수제비 / 멸치칼국수 / 제육덮밥", price: "8,500~9,000원", badge: "대표", desc: "든든한 한 끼 식사로 인기 많은 수제비·덮밥" },
      ],
    },
    "150": {
      photo: "./assets/places/place-150.jpg",
      photoCaption: "소담샤브칼국수 열무보리밥+소고기샤브+칼국수+죽 4단 풀코스",
      menus: [
        { name: "새콤매콤 비빔국수", price: "8,000원", badge: "만원이하", desc: "가볍고 개운하게 즐기는 별미 국수" },
        { name: "버섯 칼국수 / 바삭 수제돈까스", price: "10,000원", badge: "인기", desc: "1만원 정액으로 든든하게 먹는 칼국수·돈까스" },
        { name: "버섯 소고기 샤브 풀코스 (보리밥+샤브+칼국수)", price: "12,000원", badge: "대표", desc: "열무보리비빔밥부터 소고기샤브·칼국수까지 나오는 혜자 코스!" },
      ],
    },
    "151": {
      photo: "./assets/places/place-151.jpg",
      photoCaption: "하루텐동 갓 튀겨 바삭한 새우·야채 튀김 가득 1만원 텐동",
      menus: [
        { name: "따끈 사누끼우동", price: "7,000원", badge: "만원이하", desc: "탱글한 면발과 깊은 쯔유 국물의 가성비 우동" },
        { name: "시그니처 하루텐동 / 사누끼우동+덴푸라", price: "12,000원", badge: "대표", desc: "새우·오징어·단호박·가지·연근 바삭 튀김이 가득 올라간 텐동" },
        { name: "이카(오징어)텐동 / 에비(새우)텐동", price: "13,000~15,000원", badge: "인기", desc: "부드러운 오징어와 통통한 새우튀김 스페셜 텐동" },
      ],
    },
    "152": {
      photo: "./assets/places/place-152.jpg",
      photoCaption: "미소노키 깊은 풍미의 히레카츠 카레 & 일본 가정식 한상",
      menus: [
        { name: "특제 미소 마제소바 (+마무리 밥)", price: "11,500원", badge: "대표", desc: "고소하고 깊은 미소 민찌 소스에 비벼 먹는 별미 소바" },
        { name: "촉촉 히레카츠(안심) 카레", price: "13,000원", badge: "인기", desc: "부드러운 수제 안심카츠가 올라간 진한 일본식 카레" },
        { name: "부타 가쿠니(일본식 동파육) 정식", price: "15,000원", badge: "밥약원탑", desc: "입안에서 사르르 녹는 삼겹 조림 일품 가정식" },
      ],
    },
    "153": {
      photo: "./assets/places/place-153.jpg",
      photoCaption: "호우덴 바삭한 수제 안심·대구까스 & 시원한 판모밀 정식",
      menus: [
        { name: "부드러운 수제 히레까스 / 돌솥알밥", price: "9,500~10,500원", badge: "인기", desc: "수십 년 단골이 찾는 담백바삭 안심까스와 돌솥알밥" },
        { name: "우동정식 / 모밀정식 / 가쓰오철판돈까스", price: "11,000~12,000원", badge: "가성비정식", desc: "돈까스와 판모밀·우동을 함께 즐기는 푸짐한 정식" },
        { name: "명물 대구까스 / 호우덴 정식 A Set", price: "13,000원", badge: "대표", desc: "영통에서 오직 호우덴에서만 맛보는 두툼 고소 대구살까스!" },
      ],
    },
    "154": {
      photo: "./assets/places/place-154.jpg",
      photoCaption: "레알떡볶이 4,500원 혜자 떡튀순 세트 & 매콤달콤 옛날 떡볶이",
      menus: [
        { name: "추억의 쌀/밀 떡볶이 1인분", price: "3,000원", badge: "초가성비", desc: "단돈 3,000원에 즐기는 매콤달콤 꾸덕한 학교 앞 떡볶이" },
        { name: "내 맘대로 떡·튀·순 알찬 세트", price: "4,500원~", badge: "대표", desc: "떡볶이+순대+바삭한 튀김까지 5천원 안쪽으로 해결!" },
        { name: "따끈 어묵꼬치 / 바삭 모둠튀김", price: "2,500원~", badge: "인기", desc: "김말이·오징어·고구마 튀김을 떡볶이 국물에 범벅!" },
      ],
    },
    "155": {
      photo: "./assets/places/place-155.jpg",
      photoCaption: "단카레 진하게 숙성한 수제 일본식 돈카츠 카레라이스",
      menus: [
        { name: "숙성 단(單)카레", price: "8,900원", badge: "대표", desc: "오랜 시간 정성껏 저어 깊고 진한 감칠맛을 낸 기본 일본식 카레" },
        { name: "카레우동 (새우튀김1 + 밥 반공기 포함)", price: "10,900원", badge: "인기", desc: "쫄깃한 우동 면발 후 밥까지 비벼 먹는 든든 구성" },
        { name: "돈카츠 / 가라아게 / 새우튀김 카레", price: "11,900원", badge: "밥약추천", desc: "바삭한 수제 튀김 토핑을 듬뿍 올린 인기 메뉴" },
      ],
    },
    "156": {
      photo: "./assets/places/place-156.jpg",
      photoCaption: "사계면반 영통본점 자가제면 메밀냉면 & 큼직한 수제 손만두",
      menus: [
        { name: "자가제면 평양 물냉면 / 비빔냉면", price: "12,000원", badge: "대표", desc: "깊은 육향과 메밀 향이 살아있는 사계면반 시그니처" },
        { name: "직화 돼지불고기 한접시 / 손만두(5p)", price: "8,000원~", badge: "인기", desc: "냉면이나 곰탕에 곁들이면 환상적인 8~9천원 불고기·만두" },
        { name: "진한 소곰탕 / 수제 손만둣국", price: "12,000원~", badge: "해장국물", desc: "추운 날 속을 따뜻하게 채워주는 맑고 진한 사골 국물" },
      ],
    },
    "157": {
      photo: "./assets/places/place-157.jpg",
      photoCaption: "뚱보아저씨 서천본점 접시 가득 수제 왕돈까스 & 살얼음 물비빔국수",
      menus: [
        { name: "살얼음 동동 물비빔국수 / 멸치국수", price: "8,000원", badge: "만원이하", desc: "새콤매콤 시원한 육수로 돈까스와 천생연분인 시그니처 국수" },
        { name: "뚱보 수제 옛날 왕돈까스", price: "12,000원", badge: "대표", desc: "국내산 생등심을 큼직하고 바삭하게 튀겨낸 대왕 돈까스" },
        { name: "수제 통치즈 돈까스", price: "14,000원", badge: "인기", desc: "고소한 치즈가 듬뿍 들어간 별미 돈까스" },
      ],
    },
    "158": {
      photo: "./assets/places/place-158.jpg",
      photoCaption: "강릉해변메밀막국수 시원한 살얼음 동치미 막국수 & 메밀전병",
      menus: [
        { name: "살얼음 동치미 메밀 물막국수 / 메밀온면", price: "10,000원", badge: "대표", desc: "만원 정액으로 속 시원하게 즐기는 구수한 메밀 막국수" },
        { name: "매콤새콤 메밀 비빔막국수", price: "11,000원", badge: "인기", desc: "특제 비빔장 감칠맛이 일품인 비빔막국수" },
        { name: "바삭 메밀전병 / 메밀만두", price: "8,000~9,000원", badge: "별미사이드", desc: "막국수와 곁들이면 환상적인 강원도식 전병·만두" },
      ],
    },
    "159": {
      photo: "./assets/places/place-159.jpg",
      photoCaption: "마선생얼큰국밥 수원영통점 칼칼하고 진한 뚝배기 얼큰국밥",
      menus: [
        { name: "마선생 얼큰 살코기 / 돼지국밥", price: "9,000원~", badge: "대표", desc: "잡내 없이 부드러운 고기와 칼칼한 육수가 일품인 해장국밥" },
        { name: "얼큰 찰순대·내장 국밥", price: "9,500원~", badge: "인기", desc: "건더기 푸짐하게 들어간 든든한 한 끼" },
        { name: "1인 수육 + 얼큰국밥 정식", price: "12,500원", badge: "든든세트", desc: "야들한 보쌈 수육까지 함께 나오는 가성비 정식" },
      ],
    },
    "160": {
      photo: "./assets/places/place-160.jpg",
      photoCaption: "백채김치찌개 영통점 두툼한 한돈 통고기 김치찌개 & 대왕 달걀말이",
      menus: [
        { name: "한돈 통고기 돼지김치찌개 / 햄김치찌개 (1인)", price: "10,000원", badge: "대표", desc: "큼직한 생돼지고기와 묵은지를 보글보글 끓여 먹는 시그니처!" },
        { name: "폭신 두툼 달걀말이 / 노릇 햄구이", price: "7,000원", badge: "필수사이드", desc: "매콤칼칼한 김치찌개와 환상의 짝꿍인 계란말이·햄구이" },
        { name: "김치찌개 2인 풀세트", price: "27,000원", badge: "인기", desc: "찌개+계란말이·사리까지 알차게 즐기는 2인 세트" },
      ],
    },
    "161": {
      photo: "./assets/places/place-161.jpg",
      photoCaption: "화붐짬뽕 영통점 불향 가득 매콤 직화 볶음짬뽕 & 바삭 탕수육",
      menus: [
        { name: "직화 시그니처 화붐 볶음짬뽕", price: "11,000원", badge: "대표", desc: "강한 화력에 해물과 야채를 매콤하게 볶아낸 중독적 불향" },
        { name: "수제 옛날 짜장면 / 국물 짬뽕", price: "7,000원~", badge: "가성비", desc: "짜장면 7,000원 · 진한 해장 국물짬뽕 10,000원" },
        { name: "바삭 찹쌀 미니 탕수육", price: "11,000원", badge: "인기", desc: "1~2인이 식사와 함께 부담 없이 곁들이는 미니 사이즈" },
      ],
    },
    "162": {
      photo: "./assets/places/place-162.jpg",
      photoCaption: "청년찌개 경희대 국제캠퍼스점 칼칼한 1인 뚝배기 김치·부대찌개",
      menus: [
        { name: "청년 1인 생고기 김치찌개 / 부대찌개", price: "7,500원~", badge: "대표", desc: "교내에서 밤 10시까지 든든하게 비우는 얼큰 1인 뚝배기" },
        { name: "매콤 직화 제육볶음 백반 / 덮밥", price: "8,000원~", badge: "인기", desc: "불향 제육과 찌개 국물을 함께 즐기는 인기 한 끼" },
        { name: "스팸구이 / 반숙 계란후라이 / 라면사리", price: "1,000원~", badge: "꿀조합", desc: "천원대 토핑 추가로 기숙사 집밥 완성" },
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
