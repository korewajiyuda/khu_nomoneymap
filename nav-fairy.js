/**
 * 경희대 거지맵 — 3D 요정 마스코트 & 실시간 도보 길안내 엔진 (nav-fairy.js)
 * - 텅 빈 지갑 요정(fairy-broke.png) 응원·절약 브리핑 인터랙션
 * - 기준점 손인사 요정(fairy-wave.webp) & 내 위치 비행 요정(fairy-fly.webp)
 * - 캠퍼스 실제 보행로 그래프(Dijkstra) + 실시간 OSRM 도보 라우팅 하이브리드 길안내
 * - 상단 Turn-by-Turn HUD + 지도 비행 애니메이션 + 실시간 GPS 추적 + 한국어 음성안내(TTS)
 */
(() => {
  "use strict";

  const FAIRY_ASSETS = {
    broke: "./assets/fairy/fairy-broke.png",
    fly: "./assets/fairy/fairy-fly.webp",
    wave: "./assets/fairy/fairy-wave.webp",
    trio: "./assets/fairy/fairy-trio.webp",
    sleep: "./assets/fairy/fairy-sleep.webp",
    headPin: "./assets/fairy/fairy-head-pin.webp",
  };

  const BROKE_FAIRY_QUOTES = [
    "헉 지갑이 텅 비었다구요?! 💸 걱정 마세요, 천원의 아침밥부터 5천원대 혜자 밥집까지 제가 길 안내해 드릴게요!",
    "제발요… 내 통장 눈감아 😭 오늘 점심은 무한리필·곱빼기 무료 식당으로 저만 따라오세요!",
    "배달비 4,000원 아끼면 공깃밥이 네 공기! 🧚 요정 도보 길안내로 산책 겸 걸어가 볼까요?",
    "브레이크타임 헛걸음 절대 금지! ⏰ 영업 중인 가성비 식당만 쏙 골라 골목골목 안내해 드려요!",
    "월말 텅장 생존 모드 발동! ✨ 식당 카드를 누르고 [요정 길안내]를 켜면 바로 앞까지 데려다 드려요!",
  ];

  const ANCHOR_GREETINGS = [
    "안녕! 여기서부터 가성비 식당까지 도보 몇 분인지 제가 딱 재고 있어요! ✨",
    "식당을 고르고 [🧚 요정 도보 길안내]를 누르면 제가 별지팡이 들고 날아가며 안내해요!",
    "공강 시간 아껴야죠! 🏃 가장 빠른 횡단보도·골목 동선으로 안내해 드릴게요!",
  ];

  const CAMPUS_ORIGIN_PRESETS = {
    seoul: [
      { id: "main_gate", label: "서울캠 정문", shortLabel: "정문", lat: 37.5927, lng: 127.05192 },
      { id: "back_gate", label: "경희대 후문", shortLabel: "후문", lat: 37.59552, lng: 127.05705 },
      { id: "hoegi_stn", label: "회기역 1번출구", shortLabel: "회기역", lat: 37.58978, lng: 127.05758 },
      { id: "chungwoon", label: "청운관(교내)", shortLabel: "청운관", lat: 37.59494, lng: 127.05182 },
    ],
    global: [
      { id: "jeonggeon", label: "국제캠 정문(정건)", shortLabel: "정건·정문", lat: 37.24765, lng: 127.07715 },
      { id: "student_hall", label: "학생회관(교내)", shortLabel: "학생회관", lat: 37.24185, lng: 127.08003 },
      { id: "dorm2", label: "제2기숙사", shortLabel: "제2기숙사", lat: 37.24366, lng: 127.07689 },
      { id: "yeongtong", label: "영통역 중심상가", shortLabel: "영통역·중상", lat: 37.25245, lng: 127.07525 },
    ],
  };

  /**
   * 실제 캠퍼스 보행자 도로·교차로 네트워크 (서울캠 & 국제캠)
   * - 오프라인/방화벽 환경에서도 실제 도로·횡단보도를 따라 정확한 Turn-by-Turn 경로 생성
   */
  const CAMPUS_PEDESTRIAN_GRAPH = {
    seoul: {
      nodes: {
        s_chungwoon: { lat: 37.59494, lng: 127.05182, name: "청운관 앞 광장" },
        s_pureunsol: { lat: 37.59505, lng: 127.05573, name: "푸른솔문화관 앞" },
        s_campus_mid: { lat: 37.59380, lng: 127.05190, name: "경희대 본관 진입로" },
        s_main_gate: { lat: 37.59270, lng: 127.05192, name: "경희대 정문 횡단보도" },
        s_kh3gil: { lat: 37.59252, lng: 127.05192, name: "경희대로3길 입구" },
        s_kh4gil_w: { lat: 37.59195, lng: 127.05202, name: "경희대로4길 입구" },
        s_kh4gil_e: { lat: 37.59192, lng: 127.05275, name: "경희대로4길 먹자골목" },
        s_samgeori: { lat: 37.59132, lng: 127.05208, name: "경희대삼거리" },
        s_kh6gil: { lat: 37.59132, lng: 127.05320, name: "경희대로1가길·6길 교차점" },
        s_hoegi13: { lat: 37.59035, lng: 127.05145, name: "회기로13길 입구" },
        s_hoegi_mid: { lat: 37.59058, lng: 127.05368, name: "회기로 중앙사거리" },
        s_hoegi21_s: { lat: 37.59052, lng: 127.05435, name: "회기로21길 입구" },
        s_hoegi21_n: { lat: 37.59142, lng: 127.05405, name: "회기로21길 골목" },
        s_hoegi25_s: { lat: 37.59038, lng: 127.05530, name: "회기로25길 입구" },
        s_hoegi25_n: { lat: 37.59112, lng: 127.05535, name: "회기로25길 먹자골목" },
        s_hoegi_e: { lat: 37.59018, lng: 127.05705, name: "회기역 1번출구 앞" },
        s_hoegi_stn: { lat: 37.58978, lng: 127.05758, name: "회기역 광장" },
        s_imun_s: { lat: 37.58915, lng: 127.05668, name: "이문로 회기역 남측" },
        s_back_slope: { lat: 37.59528, lng: 127.05642, name: "경희대 후문길" },
        s_back_gate: { lat: 37.59552, lng: 127.05705, name: "경희대 후문" },
        s_cheonjang: { lat: 37.59608, lng: 127.05782, name: "천장산로 사거리" },
        s_hwigyeong2: { lat: 37.59592, lng: 127.05902, name: "휘경로2길 먹자골목" },
        s_imun_hufs: { lat: 37.59572, lng: 127.06035, name: "이문로 외대사거리" },
        s_imun_n: { lat: 37.59725, lng: 127.06050, name: "이문로 외대앞역 북측" },
        s_oedae_stn: { lat: 37.59608, lng: 127.06265, name: "외대앞역 휘경로" },
      },
      edges: [
        ["s_chungwoon", "s_campus_mid", "경희대 캠퍼스 보행로", true],
        ["s_chungwoon", "s_pureunsol", "교내 순환 보행로", false],
        ["s_pureunsol", "s_back_slope", "후문 연결 보행로", false],
        ["s_back_slope", "s_back_gate", "경희대 후문길", true],
        ["s_campus_mid", "s_main_gate", "경희대로", true],
        ["s_main_gate", "s_kh3gil", "경희대로", true],
        ["s_kh3gil", "s_kh4gil_w", "경희대로", true],
        ["s_kh4gil_w", "s_kh4gil_e", "경희대로4길", false],
        ["s_kh4gil_e", "s_kh6gil", "경희대로6길", false],
        ["s_kh4gil_w", "s_samgeori", "경희대로", true],
        ["s_samgeori", "s_kh6gil", "경희대로1가길", false],
        ["s_samgeori", "s_hoegi13", "회기로", true],
        ["s_samgeori", "s_hoegi_mid", "회기로", true],
        ["s_kh6gil", "s_hoegi_mid", "경희대로1가길", false],
        ["s_kh6gil", "s_hoegi21_n", "회기로21길 골목", false],
        ["s_hoegi_mid", "s_hoegi21_s", "회기로", true],
        ["s_hoegi21_s", "s_hoegi21_n", "회기로21길", false],
        ["s_hoegi21_s", "s_hoegi25_s", "회기로", true],
        ["s_hoegi21_n", "s_hoegi25_n", "회기로 안길", false],
        ["s_hoegi25_s", "s_hoegi25_n", "회기로25길", false],
        ["s_hoegi25_s", "s_hoegi_e", "회기로", true],
        ["s_hoegi25_n", "s_hoegi_e", "회기로25길", false],
        ["s_hoegi_e", "s_hoegi_stn", "회기로·이문로", true],
        ["s_hoegi_stn", "s_imun_s", "이문로", true],
        ["s_hoegi_e", "s_imun_hufs", "이문로", true],
        ["s_back_gate", "s_cheonjang", "천장산로", true],
        ["s_back_gate", "s_hwigyeong2", "이문로·후문길", false],
        ["s_cheonjang", "s_hwigyeong2", "휘경로2길", false],
        ["s_hwigyeong2", "s_imun_hufs", "휘경로", true],
        ["s_imun_hufs", "s_imun_n", "이문로", true],
        ["s_imun_hufs", "s_oedae_stn", "휘경로", true],
      ],
    },
    global: {
      nodes: {
        g_student_hall: { lat: 37.24185, lng: 127.08003, name: "학생회관 앞" },
        g_campus_lake: { lat: 37.24350, lng: 127.07855, name: "사색의광장 보행로" },
        g_dorm2: { lat: 37.24366, lng: 127.07689, name: "제2기숙사 앞" },
        g_campus_north: { lat: 37.24585, lng: 127.07725, name: "국제캠 정문 진입로" },
        g_main_gate: { lat: 37.24745, lng: 127.07735, name: "국제캠 정문 횡단보도" },
        g_jeonggeon_c: { lat: 37.24815, lng: 127.07675, name: "정건 중심사거리" },
        g_yeongil_e: { lat: 37.24802, lng: 127.07865, name: "영일로6번길" },
        g_yeongil_mid: { lat: 37.24840, lng: 127.07605, name: "영일로 메가플러스 앞" },
        g_maeyeong: { lat: 37.24922, lng: 127.07678, name: "매영로415번길" },
        g_yeongil_w: { lat: 37.24895, lng: 127.07495, name: "영일로 보용만두 사거리" },
        g_bandal_s: { lat: 37.25035, lng: 127.07510, name: "반달로 보행자거리 입구" },
        g_bandal_n: { lat: 37.25158, lng: 127.07505, name: "반달로 중심상가" },
        g_cheongmyeong_w: { lat: 37.25208, lng: 127.07455, name: "청명남로 서측" },
        g_yeongtong_plaza: { lat: 37.25245, lng: 127.07525, name: "영통역 중심상가 광장" },
        g_cheongmyeong_e: { lat: 37.25285, lng: 127.07588, name: "청명남로 동측" },
      },
      edges: [
        ["g_student_hall", "g_campus_lake", "교내 중심 보행로", true],
        ["g_campus_lake", "g_dorm2", "기숙사 보행로", false],
        ["g_campus_lake", "g_campus_north", "교내 정문 보행로", true],
        ["g_dorm2", "g_campus_north", "기숙사 정문길", true],
        ["g_campus_north", "g_main_gate", "덕영대로 정문 횡단보도", true],
        ["g_main_gate", "g_jeonggeon_c", "영일로", true],
        ["g_main_gate", "g_yeongil_e", "영일로6번길", false],
        ["g_jeonggeon_c", "g_yeongil_e", "영일로6번길", false],
        ["g_jeonggeon_c", "g_yeongil_mid", "영일로", true],
        ["g_jeonggeon_c", "g_maeyeong", "매영로415번길", false],
        ["g_yeongil_mid", "g_maeyeong", "정건 먹자골목", false],
        ["g_yeongil_mid", "g_yeongil_w", "영일로", true],
        ["g_maeyeong", "g_bandal_s", "매영로 보행통로", false],
        ["g_yeongil_w", "g_bandal_s", "반달로", true],
        ["g_bandal_s", "g_bandal_n", "반달로 보행자거리", true],
        ["g_bandal_n", "g_cheongmyeong_w", "청명남로", true],
        ["g_bandal_n", "g_yeongtong_plaza", "반달로 광장길", true],
        ["g_cheongmyeong_w", "g_yeongtong_plaza", "청명남로", true],
        ["g_yeongtong_plaza", "g_cheongmyeong_e", "청명남로", true],
      ],
    },
  };

  const navState = {
    active: false,
    place: null,
    originMode: "auto", // 'auto' | 'gps' | preset.id
    routeOption: "recommended", // 'recommended' | 'main_road' | 'shortest'
    origin: null,
    routeData: null, // { coords, steps, totalMeters, walkMinutes, source }
    currentStepIdx: 0,
    voiceEnabled: false,
    gpsFollow: false,
    gpsWatchId: null,
    liveUserCoords: null,
    animFrameId: null,
    routeRequestSeq: 0,
    quoteCursor: 0,
    anchorGreetingCursor: 0,

    // Leaflet layers
    routeLayerGroup: null,
    walkedPolyline: null,
    haloPolyline: null,
    mainPolyline: null,
    dashPolyline: null,
    flyingFairyMarker: null,
    anchorFairyMarker: null,
    gpsFairyMarker: null,
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function computeBearing(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function formatMeters(m) {
    const rounded = Math.max(0, Math.round(m));
    if (rounded >= 1000) {
      return `${(rounded / 1000).toFixed(1)}km`;
    }
    return `${rounded}m`;
  }

  function formatArrivalKstTime(walkMinutes) {
    const now = new Date(Date.now() + walkMinutes * 60000);
    if (window.HoursEngine && typeof window.HoursEngine.getKstParts === "function") {
      const kst = window.HoursEngine.getKstParts(now);
      const period = kst.hour >= 12 ? "오후" : "오전";
      const h12 = kst.hour % 12 === 0 ? 12 : kst.hour % 12;
      return `${period} ${h12}:${String(kst.minute).padStart(2, "0")} 도착 예정`;
    }
    return `약 ${walkMinutes}분 후 도착`;
  }

  function getAppBridge() {
    return window.KhuBeggarMap || null;
  }

  function getMapInstance() {
    const app = getAppBridge();
    return app ? app.getState().map : null;
  }

  function showAppToast(msg) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add("is-visible");
    clearTimeout(showAppToast._tid);
    showAppToast._tid = setTimeout(() => {
      toastEl.classList.remove("is-visible");
      toastEl.hidden = true;
    }, 2800);
  }

  /**
   * 요정 클릭 시 통통 튀는 모션 + 반짝이 파티클 연출
   */
  function triggerFairyHop(targetEl) {
    if (!targetEl) return;
    targetEl.classList.remove("is-fairy-hopping");
    void targetEl.offsetWidth;
    targetEl.classList.add("is-fairy-hopping");
    setTimeout(() => {
      targetEl.classList.remove("is-fairy-hopping");
    }, 680);
  }

  /**
   * 한국어 음성 안내 (Web Speech API)
   */
  function speakKoreanGuide(text) {
    if (!navState.voiceEnabled || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.rate = 1.04;
      utter.pitch = 1.08;
      window.speechSynthesis.speak(utter);
    } catch (_) {
      // ignore TTS errors
    }
  }

  /* ==========================================================================
     1. 기준점 손인사 요정 마커 (fairy-wave.webp) & 내 위치 요정 마커
     ========================================================================== */

  function syncCampusAnchorFairy() {
    const map = getMapInstance();
    const app = getAppBridge();
    if (!map || !app) return;

    // 길안내 진행 중에는 출발/도착/비행 요정에 집중하도록 기준점 요정 숨김
    if (navState.active) {
      if (navState.anchorFairyMarker) {
        map.removeLayer(navState.anchorFairyMarker);
        navState.anchorFairyMarker = null;
      }
      return;
    }

    const st = app.getState();
    const campusCfg = app.CAMPUS_ANCHORS[st.currentCampus] || app.CAMPUS_ANCHORS.seoul;

    let anchorLat = campusCfg.defaultRadiusAnchor.lat;
    let anchorLng = campusCfg.defaultRadiusAnchor.lng;
    let anchorLabel = `${campusCfg.label} ${campusCfg.defaultRadiusAnchor.name}`;
    let imgSrc = FAIRY_ASSETS.wave;

    if (st.userCoords) {
      const distToCampus = haversineMeters(
        st.userCoords.lat,
        st.userCoords.lng,
        campusCfg.center[0],
        campusCfg.center[1]
      );
      if (distToCampus <= 8000) {
        anchorLat = st.userCoords.lat;
        anchorLng = st.userCoords.lng;
        anchorLabel = "내 현위치";
        imgSrc = FAIRY_ASSETS.fly;
      }
    } else if (st.filters.zone && st.filters.zone !== "all") {
      const zAnchor = campusCfg.anchors[st.filters.zone];
      if (zAnchor) {
        anchorLat = zAnchor.lat;
        anchorLng = zAnchor.lng;
        anchorLabel = `${st.filters.zone} 기준`;
      }
    }

    const html = `
      <div class="fairy-anchor-pin" title="클릭하면 길안내 요정이 인사해요!">
        <span class="fairy-anchor-pulse" aria-hidden="true"></span>
        <img src="${escapeHtml(imgSrc)}" alt="" class="fairy-anchor-img" draggable="false" />
        <span class="fairy-anchor-badge">🧚 ${escapeHtml(anchorLabel)}</span>
      </div>
    `;

    const icon = L.divIcon({
      className: "fairy-anchor-marker-wrap",
      html,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (navState.anchorFairyMarker) {
      navState.anchorFairyMarker.setLatLng([anchorLat, anchorLng]);
      navState.anchorFairyMarker.setIcon(icon);
    } else {
      navState.anchorFairyMarker = L.marker([anchorLat, anchorLng], {
        icon,
        zIndexOffset: -90,
        keyboard: false,
      }).addTo(map);

      navState.anchorFairyMarker.on("click", (ev) => {
        if (ev && ev.originalEvent) ev.originalEvent.stopPropagation();
        const el = navState.anchorFairyMarker?.getElement();
        triggerFairyHop(el);
        const msg = ANCHOR_GREETINGS[navState.anchorGreetingCursor % ANCHOR_GREETINGS.length];
        navState.anchorGreetingCursor += 1;
        showAppToast(`🧚 ${msg}`);
      });
    }
  }

  /* ==========================================================================
     2. 출발지 결정 & 실제 보행자 도로망 경로 탐색 (캠퍼스 그래프 + OSRM Foot)
     ========================================================================== */

  function getOriginPresetsForCampus(campusKey) {
    return CAMPUS_ORIGIN_PRESETS[campusKey] || CAMPUS_ORIGIN_PRESETS.seoul;
  }

  function resolveNavigationOrigin(place) {
    const app = getAppBridge();
    const st = app ? app.getState() : null;
    const campusKey = place.campus || (st ? st.currentCampus : "seoul");
    const presets = getOriginPresetsForCampus(campusKey);

    if (navState.originMode === "gps") {
      const gps = navState.liveUserCoords || (st && st.userCoords);
      if (gps) {
        return {
          id: "gps",
          label: "내 현위치 (GPS)",
          shortLabel: "내 위치",
          lat: gps.lat,
          lng: gps.lng,
          isGps: true,
        };
      }
    }

    if (navState.originMode !== "auto" && navState.originMode !== "gps") {
      const chosen = presets.find((p) => p.id === navState.originMode);
      if (chosen) return { ...chosen, isGps: false };
    }

    // auto 모드: 캠퍼스 인근 GPS가 있으면 GPS 우선, 없으면 권역에 가장 잘 맞는 캠퍼스 기준점 선택
    if (st && st.userCoords) {
      const dist = haversineMeters(st.userCoords.lat, st.userCoords.lng, place.lat, place.lng);
      if (dist <= 6000) {
        return {
          id: "gps",
          label: "내 현위치 (GPS)",
          shortLabel: "내 위치",
          lat: st.userCoords.lat,
          lng: st.userCoords.lng,
          isGps: true,
        };
      }
    }

    if (campusKey === "seoul") {
      if (place.zone === "후문·외대") return { ...presets[1], isGps: false };
      if (place.zone === "회기역") return { ...presets[0], isGps: false };
      return { ...presets[0], isGps: false };
    }

    if (place.zone === "교내") {
      // 교내 식당은 정건에서 출발하거나 기숙사에서 출발
      return { ...presets[0], isGps: false };
    }
    return { ...presets[0], isGps: false };
  }

  function turnTypeFromDeltaAngle(deltaDeg) {
    // deltaDeg in [-180, 180]
    if (deltaDeg < -32) return { type: "left", label: "좌회전" };
    if (deltaDeg > 32) return { type: "right", label: "우회전" };
    if (deltaDeg < -14) return { type: "slight_left", label: "왼쪽 방향" };
    if (deltaDeg > 14) return { type: "slight_right", label: "오른쪽 방향" };
    return { type: "straight", label: "직진" };
  }

  function getTurnIconSvg(type) {
    switch (type) {
      case "left":
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`;
      case "right":
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>`;
      case "slight_left":
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-6l-8-8"/><path d="M15 6H9v6"/></svg>`;
      case "slight_right":
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20v-6l8-8"/><path d="M9 6h6v6"/></svg>`;
      case "arrive":
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      default:
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
    }
  }

  /**
   * 캠퍼스 보행자 도로망 그래프 기반 즉시 경로 탐색 (Dijkstra)
   */
  function buildCampusGraphRoute(origin, place, routeOption = "recommended") {
    const campusKey = place.campus === "global" ? "global" : "seoul";
    const graph = CAMPUS_PEDESTRIAN_GRAPH[campusKey];
    const directMeters = haversineMeters(origin.lat, origin.lng, place.lat, place.lng);

    // 75m 이내 초근거리(예: 정문 바로 앞 안녕 유부)는 2구간 직관 보행선 생성
    if (!graph || directMeters <= 80) {
      const midLat = (origin.lat + place.lat) / 2;
      const midLng = (origin.lng + place.lng) / 2 + 0.00004;
      const coords = [
        [origin.lat, origin.lng],
        [midLat, midLng],
        [place.lat, place.lng],
      ];
      const d1 = haversineMeters(coords[0][0], coords[0][1], coords[1][0], coords[1][1]);
      const d2 = haversineMeters(coords[1][0], coords[1][1], coords[2][0], coords[2][1]);
      const total = Math.max(15, Math.round(d1 + d2));
      const walkMinutes = Math.max(1, Math.round(total / 67));
      return {
        coords,
        totalMeters: total,
        walkMinutes,
        source: "campus_footpath",
        steps: [
          {
            idx: 0,
            coordIdx: 0,
            lat: coords[0][0],
            lng: coords[0][1],
            type: "straight",
            turnLabel: "출발",
            roadName: place.zone || "보행로",
            distanceMeters: Math.round(total),
            title: `${origin.shortLabel}에서 ${place.name} 방향으로 ${formatMeters(total)} 직진`,
            fairyTip: `바로 코앞이에요! 🧚 걸어서 1분이면 도착해요!`,
          },
          {
            idx: 1,
            coordIdx: coords.length - 1,
            lat: place.lat,
            lng: place.lng,
            type: "arrive",
            turnLabel: "도착",
            roadName: place.address || place.name,
            distanceMeters: 0,
            title: `${place.name} 도착!`,
            fairyTip: `${place.rep_menu || "맛있는 가성비 식사"} 맛있게 드세요! 🍚`,
          },
        ],
      };
    }

    // 가상 START / END 노드를 가장 가까운 실제 교차로 3곳에 연결
    const adj = new Map();
    const nodeMap = new Map();
    for (const [id, n] of Object.entries(graph.nodes)) {
      nodeMap.set(id, n);
      adj.set(id, []);
    }

    const weightFactor = (isMainRoad) => {
      if (routeOption === "main_road") return isMainRoad ? 0.78 : 1.28;
      if (routeOption === "shortest") return 1.0;
      return isMainRoad ? 0.93 : 1.04; // recommended
    };

    for (const [u, v, roadName, isMainRoad] of graph.edges) {
      const nu = nodeMap.get(u);
      const nv = nodeMap.get(v);
      if (!nu || !nv) continue;
      const dist = haversineMeters(nu.lat, nu.lng, nv.lat, nv.lng);
      const cost = dist * weightFactor(isMainRoad);
      adj.get(u).push({ to: v, dist, cost, roadName, isMainRoad });
      adj.get(v).push({ to: u, dist, cost, roadName, isMainRoad });
    }

    nodeMap.set("__START__", { lat: origin.lat, lng: origin.lng, name: origin.shortLabel });
    nodeMap.set("__END__", { lat: place.lat, lng: place.lng, name: place.name });
    adj.set("__START__", []);
    adj.set("__END__", []);

    const sortedByOrigin = Object.entries(graph.nodes)
      .map(([id, n]) => ({ id, dist: haversineMeters(origin.lat, origin.lng, n.lat, n.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    for (const item of sortedByOrigin) {
      adj.get("__START__").push({
        to: item.id,
        dist: item.dist,
        cost: item.dist * 1.05,
        roadName: `${graph.nodes[item.id].name} 연결 보행로`,
        isMainRoad: true,
      });
    }

    const sortedByEnd = Object.entries(graph.nodes)
      .map(([id, n]) => ({ id, dist: haversineMeters(place.lat, place.lng, n.lat, n.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    for (const item of sortedByEnd) {
      adj.get(item.id).push({
        to: "__END__",
        dist: item.dist,
        cost: item.dist * 1.05,
        roadName: extractStreetNameFromAddress(place.address) || `${place.zone} 골목`,
        isMainRoad: false,
      });
    }

    // Dijkstra 탐색
    const distScore = new Map();
    const prevEdge = new Map();
    const visited = new Set();
    for (const id of nodeMap.keys()) distScore.set(id, Infinity);
    distScore.set("__START__", 0);

    while (visited.size < nodeMap.size) {
      let bestNode = null;
      let bestVal = Infinity;
      for (const [id, val] of distScore.entries()) {
        if (!visited.has(id) && val < bestVal) {
          bestVal = val;
          bestNode = id;
        }
      }
      if (!bestNode || bestNode === "__END__") break;
      visited.add(bestNode);

      for (const edge of adj.get(bestNode) || []) {
        if (visited.has(edge.to)) continue;
        const cand = bestVal + edge.cost;
        if (cand < distScore.get(edge.to)) {
          distScore.set(edge.to, cand);
          prevEdge.set(edge.to, { from: bestNode, edge });
        }
      }
    }

    // 경로 복원
    const nodeSeq = [];
    const edgeSeq = [];
    let cur = "__END__";
    while (cur && prevEdge.has(cur)) {
      const rec = prevEdge.get(cur);
      nodeSeq.unshift(cur);
      edgeSeq.unshift(rec.edge);
      cur = rec.from;
    }
    nodeSeq.unshift("__START__");

    // 거의 같은 위치의 중복 좌표 정리 및 부드러운 세분화
    const rawWaypoints = nodeSeq.map((id) => {
      const n = nodeMap.get(id);
      return { id, lat: n.lat, lng: n.lng, name: n.name };
    });

    const filteredPts = [rawWaypoints[0]];
    const filteredRoads = [];
    for (let i = 1; i < rawWaypoints.length; i += 1) {
      const prev = filteredPts[filteredPts.length - 1];
      const pt = rawWaypoints[i];
      const segD = haversineMeters(prev.lat, prev.lng, pt.lat, pt.lng);
      if (segD >= 8 || i === rawWaypoints.length - 1) {
        filteredPts.push(pt);
        filteredRoads.push(edgeSeq[i - 1]?.roadName || "보행로");
      }
    }

    // 촘촘한 애니메이션용 보간 좌표열 생성 (약 18m 간격)
    const denseCoords = [];
    const waypointCoordIndices = [0];
    for (let i = 0; i < filteredPts.length - 1; i += 1) {
      const a = filteredPts[i];
      const b = filteredPts[i + 1];
      const segM = haversineMeters(a.lat, a.lng, b.lat, b.lng);
      const subCount = Math.max(1, Math.min(12, Math.ceil(segM / 18)));
      for (let s = 0; s < subCount; s += 1) {
        const t = s / subCount;
        denseCoords.push([a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t]);
      }
      waypointCoordIndices.push(denseCoords.length);
    }
    const lastPt = filteredPts[filteredPts.length - 1];
    denseCoords.push([lastPt.lat, lastPt.lng]);

    // Turn-by-Turn 단계 병합 생성 (같은 도로 직진은 합쳐서 보기 쉽게!)
    const steps = [];
    let totalMeters = 0;

    let accDist = 0;
    let groupStartIdx = 0;
    let groupTurn = { type: "straight", label: "출발" };
    let groupRoad = filteredRoads[0] || "보행로";
    let groupNodeName = filteredPts[0].name;

    for (let i = 0; i < filteredPts.length - 1; i += 1) {
      const pA = filteredPts[i];
      const pB = filteredPts[i + 1];
      const segDist = haversineMeters(pA.lat, pA.lng, pB.lat, pB.lng);
      totalMeters += segDist;
      accDist += segDist;

      const hasNext = i + 1 < filteredPts.length - 1;
      if (hasNext) {
        const pC = filteredPts[i + 2];
        const b1 = computeBearing(pA.lat, pA.lng, pB.lat, pB.lng);
        const b2 = computeBearing(pB.lat, pB.lng, pC.lat, pC.lng);
        let delta = ((b2 - b1 + 540) % 360) - 180;
        const nextRoad = filteredRoads[i + 1] || "보행로";
        const turnInfo = turnTypeFromDeltaAngle(delta);

        const shouldSplit =
          Math.abs(delta) >= 26 || (nextRoad !== groupRoad && accDist >= 45);

        if (shouldSplit) {
          steps.push({
            idx: steps.length,
            coordIdx: waypointCoordIndices[groupStartIdx],
            lat: filteredPts[groupStartIdx].lat,
            lng: filteredPts[groupStartIdx].lng,
            type: groupTurn.type,
            turnLabel: groupTurn.label,
            roadName: groupRoad,
            distanceMeters: Math.max(5, Math.round(accDist)),
            title:
              steps.length === 0
                ? `${groupNodeName}에서 ${groupRoad} 따라 ${formatMeters(accDist)} 이동`
                : `${pA.name}에서 ${groupTurn.label} 후 ${groupRoad} 방면 ${formatMeters(accDist)}`,
            fairyTip:
              groupTurn.type === "left" || groupTurn.type === "right"
                ? `${pA.name} 모퉁이에서 ${groupTurn.label}만 기억하세요! 🧚`
                : `보도를 따라 쭉 걸어가면 금방이에요! ✨`,
          });

          accDist = 0;
          groupStartIdx = i + 1;
          groupTurn = turnInfo;
          groupRoad = nextRoad;
          groupNodeName = pB.name;
        }
      } else {
        steps.push({
          idx: steps.length,
          coordIdx: waypointCoordIndices[groupStartIdx],
          lat: filteredPts[groupStartIdx].lat,
          lng: filteredPts[groupStartIdx].lng,
          type: groupTurn.type,
          turnLabel: steps.length === 0 ? "출발" : groupTurn.label,
          roadName: groupRoad,
          distanceMeters: Math.max(5, Math.round(accDist)),
          title:
            steps.length === 0
              ? `${groupNodeName}에서 ${groupRoad} 따라 ${formatMeters(accDist)} 이동`
              : `${groupNodeName}에서 ${groupTurn.label} 후 ${place.name} 앞까지 ${formatMeters(accDist)}`,
          fairyTip: `거의 다 왔어요! 간판(${place.shortName || place.name})을 확인해 보세요 👀`,
        });
      }
    }

    steps.push({
      idx: steps.length,
      coordIdx: denseCoords.length - 1,
      lat: place.lat,
      lng: place.lng,
      type: "arrive",
      turnLabel: "도착",
      roadName: place.address || place.name,
      distanceMeters: 0,
      title: `${place.name} 도착!`,
      fairyTip: `${place.rep_menu || "든든한 가성비 메뉴"} 맛있게 드세요! 지갑 방어 성공 💸✨`,
    });

    const roundedTotal = Math.max(20, Math.round(totalMeters));
    const walkMinutes = Math.max(1, Math.round(roundedTotal / 67));

    return {
      coords: denseCoords,
      totalMeters: roundedTotal,
      walkMinutes,
      source: "campus_footpath",
      steps,
    };
  }

  function extractStreetNameFromAddress(addr) {
    const raw = String(addr || "").trim();
    if (!raw) return "";
    const match = raw.match(/([가-힣0-9]+(?:로|길)(?:[0-9가-힣]*길)?)/);
    return match ? match[1] : "";
  }

  /**
   * 온라인 환경에서 실시간 OSRM 보행자 라우터(OpenStreetMap footway)로 정밀 업그레이드
   */
  async function fetchOsrmFootRoute(origin, place, routeOption) {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${origin.lng},${origin.lat};${place.lng},${place.lat}` +
      `?overview=full&geometries=geojson&steps=true&alternatives=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3200);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.code !== "Ok" || !Array.isArray(data.routes) || !data.routes.length) {
        return null;
      }

      let chosenRoute = data.routes[0];
      if (data.routes.length > 1 && routeOption === "shortest") {
        chosenRoute = [...data.routes].sort((a, b) => a.distance - b.distance)[0];
      } else if (data.routes.length > 1 && routeOption === "main_road") {
        chosenRoute = data.routes[data.routes.length - 1];
      }

      const geoCoords = chosenRoute.geometry?.coordinates;
      if (!Array.isArray(geoCoords) || geoCoords.length < 2) return null;

      // OSRM foot 라우터가 자동차 우회도로로 과도하게 돌아가는 경우(>2.6배 직선거리) 캠퍼스 보행자 전용 그래프 유지
      const straightM = haversineMeters(origin.lat, origin.lng, place.lat, place.lng);
      if (straightM > 80 && chosenRoute.distance > straightM * 2.55) {
        return null;
      }

      const coords = geoCoords.map(([lng, lat]) => [lat, lng]);
      if (haversineMeters(origin.lat, origin.lng, coords[0][0], coords[0][1]) > 6) {
        coords.unshift([origin.lat, origin.lng]);
      }
      const tail = coords[coords.length - 1];
      if (haversineMeters(place.lat, place.lng, tail[0], tail[1]) > 6) {
        coords.push([place.lat, place.lng]);
      }

      const rawSteps = chosenRoute.legs?.[0]?.steps || [];
      const parsedSteps = [];

      for (let i = 0; i < rawSteps.length; i += 1) {
        const st = rawSteps[i];
        const mType = st.maneuver?.type || "";
        const mod = st.maneuver?.modifier || "";
        if (mType === "arrive") continue;

        const distM = Math.round(Number(st.distance) || 0);
        if (distM < 6 && i > 0) continue;

        const loc = st.maneuver?.location
          ? [st.maneuver.location[1], st.maneuver.location[0]]
          : coords[0];

        // coords 내 가장 가까운 인덱스 매칭
        let nearestIdx = 0;
        let minD = Infinity;
        for (let c = 0; c < coords.length; c += 1) {
          const d = haversineMeters(loc[0], loc[1], coords[c][0], coords[c][1]);
          if (d < minD) {
            minD = d;
            nearestIdx = c;
          }
        }

        let type = "straight";
        let turnLabel = parsedSteps.length === 0 ? "출발" : "직진";
        if (mod.includes("left")) {
          type = mod.includes("slight") ? "slight_left" : "left";
          turnLabel = mod.includes("slight") ? "왼쪽 방향" : "좌회전";
        } else if (mod.includes("right")) {
          type = mod.includes("slight") ? "slight_right" : "right";
          turnLabel = mod.includes("slight") ? "오른쪽 방향" : "우회전";
        }

        const roadName =
          (st.name && st.name.trim()) ||
          extractStreetNameFromAddress(place.address) ||
          `${place.zone || "캠퍼스"} 보행로`;

        parsedSteps.push({
          idx: parsedSteps.length,
          coordIdx: nearestIdx,
          lat: coords[nearestIdx][0],
          lng: coords[nearestIdx][1],
          type,
          turnLabel,
          roadName,
          distanceMeters: Math.max(5, distM),
          title:
            parsedSteps.length === 0
              ? `${origin.shortLabel}에서 ${roadName} 따라 ${formatMeters(distM)} 이동`
              : `${turnLabel} 후 ${roadName} 따라 ${formatMeters(distM)} 이동`,
          fairyTip:
            type === "left" || type === "right"
              ? `${roadName} 교차 지점에서 ${turnLabel}하세요! 🧚`
              : `${roadName} 인도를 따라 안전하게 직진해요 ✨`,
        });
      }

      if (parsedSteps.length === 0) return null;

      parsedSteps.push({
        idx: parsedSteps.length,
        coordIdx: coords.length - 1,
        lat: place.lat,
        lng: place.lng,
        type: "arrive",
        turnLabel: "도착",
        roadName: place.address || place.name,
        distanceMeters: 0,
        title: `${place.name} 도착!`,
        fairyTip: `${place.rep_menu || "가성비 식사"} 맛있게 드세요! 지갑 방어 성공 💸`,
      });

      const totalMeters = Math.max(20, Math.round(chosenRoute.distance));
      const walkMinutes = Math.max(1, Math.round(totalMeters / 67));

      return {
        coords,
        totalMeters,
        walkMinutes,
        source: "osrm_live",
        steps: parsedSteps,
      };
    } catch (_) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /* ==========================================================================
     3. 지도 위 경로 폴리라인 + 비행 요정 애니메이션 + 상단 Turn-by-Turn HUD
     ========================================================================== */

  function clearRouteMapLayers() {
    if (navState.animFrameId) {
      cancelAnimationFrame(navState.animFrameId);
      navState.animFrameId = null;
    }
    const map = getMapInstance();
    if (map && navState.routeLayerGroup) {
      map.removeLayer(navState.routeLayerGroup);
    }
    navState.routeLayerGroup = null;
    navState.walkedPolyline = null;
    navState.haloPolyline = null;
    navState.mainPolyline = null;
    navState.dashPolyline = null;
    navState.flyingFairyMarker = null;
  }

  function drawFairyRouteOnMap(fitMap = true) {
    const map = getMapInstance();
    if (!map || !navState.routeData || !navState.place || !navState.origin) return;

    clearRouteMapLayers();

    const group = L.layerGroup().addTo(map);
    navState.routeLayerGroup = group;

    const coords = navState.routeData.coords;
    const steps = navState.routeData.steps;

    // 1) 이미 걸어온 구간 (차분한 슬레이트 점선)
    navState.walkedPolyline = L.polyline([coords[0]], {
      color: "#94A3B8",
      weight: 6,
      opacity: 0.65,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    // 2) 남은 경로 외곽 글로우 + 메인 라인 + 흐르는 화살표 대시
    const themeColor =
      navState.routeOption === "main_road"
        ? "#2563EB"
        : navState.routeOption === "shortest"
        ? "#059669"
        : "#EA580C";

    navState.haloPolyline = L.polyline(coords, {
      color: themeColor,
      weight: 13,
      opacity: 0.2,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    navState.mainPolyline = L.polyline(coords, {
      color: themeColor,
      weight: 6.5,
      opacity: 0.96,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    navState.dashPolyline = L.polyline(coords, {
      color: "#FFFFFF",
      weight: 2.6,
      opacity: 0.92,
      dashArray: "7 13",
      className: "fairy-route-flow-dash",
      lineCap: "round",
    }).addTo(group);

    // 3) 회전 교차점 미니 스텝 도트
    steps.forEach((st, idx) => {
      if (idx === 0 || st.type === "arrive") return;
      L.circleMarker([st.lat, st.lng], {
        radius: 5,
        color: themeColor,
        weight: 2.2,
        fillColor: "#FFFFFF",
        fillOpacity: 1,
      })
        .bindTooltip(`${idx}구간 · ${st.turnLabel}`, {
          direction: "top",
          offset: [0, -6],
        })
        .addTo(group);
    });

    // 4) 출발 / 도착 배지 핀
    const startIcon = L.divIcon({
      className: "route-endpoint-wrap",
      html: `<div class="route-endpoint-pill is-start">출발 · ${escapeHtml(
        navState.origin.shortLabel
      )}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker(coords[0], { icon: startIcon, zIndexOffset: 2600, keyboard: false }).addTo(group);

    const endIcon = L.divIcon({
      className: "route-endpoint-wrap",
      html: `<div class="route-endpoint-pill is-end">도착 · ${escapeHtml(
        navState.place.shortName || navState.place.name
      )}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker(coords[coords.length - 1], {
      icon: endIcon,
      zIndexOffset: 2650,
      keyboard: false,
    }).addTo(group);

    // 5) 별지팡이 비행 길안내 요정 마커 (fairy-fly.webp)
    const flyIcon = L.divIcon({
      className: "fairy-flying-pin-container",
      html: `
        <div class="fairy-flying-pin-wrap is-facing-right" id="mapFlyingFairyWrap">
          <div class="fairy-flying-aura" aria-hidden="true"></div>
          <img src="${FAIRY_ASSETS.fly}" alt="길안내 요정" class="fairy-flying-img" draggable="false" />
          <span class="fairy-flying-tag" id="mapFlyingFairyTag">길안내 중 ✨</span>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 34],
    });

    navState.flyingFairyMarker = L.marker(coords[0], {
      icon: flyIcon,
      zIndexOffset: 3400,
      keyboard: false,
    }).addTo(group);

    navState.flyingFairyMarker.on("click", () => {
      replayFullRouteFlight();
    });

    if (fitMap) {
      fitRouteBoundsWithUiPadding();
    }

    // 시작 직후 첫 구간을 부드럽게 비행 시연
    animateFairyBetweenIndices(0, Math.min(coords.length - 1, Math.max(2, Math.floor(coords.length * 0.32))), 1100, () => {
      syncRouteProgressToStep(navState.currentStepIdx, false);
    });
  }

  function fitRouteBoundsWithUiPadding() {
    const map = getMapInstance();
    if (!map || !navState.routeData) return;
    const bounds = L.latLngBounds(navState.routeData.coords);
    const sheetEl = document.getElementById("bottomSheet");
    const visibleSheetH = sheetEl ? Math.min(340, Math.round(window.innerHeight * 0.46)) : 280;
    map.fitBounds(bounds, {
      paddingTopLeft: [34, 118],
      paddingBottomRight: [34, visibleSheetH + 28],
      maxZoom: 17,
      animate: true,
      duration: 0.6,
    });
  }

  function updateFairyFacingBySegment(fromPt, toPt) {
    const wrapEl = document.getElementById("mapFlyingFairyWrap");
    if (!wrapEl || !fromPt || !toPt) return;
    const dLng = toPt[1] - fromPt[1];
    if (Math.abs(dLng) < 0.000005) return;
    if (dLng < 0) {
      wrapEl.classList.add("is-facing-left");
      wrapEl.classList.remove("is-facing-right");
    } else {
      wrapEl.classList.add("is-facing-right");
      wrapEl.classList.remove("is-facing-left");
    }
  }

  function animateFairyBetweenIndices(startIdx, endIdx, durationMs = 850, onDone = null) {
    if (!navState.routeData || !navState.flyingFairyMarker) return;
    const coords = navState.routeData.coords;
    if (coords.length < 2) return;

    if (navState.animFrameId) {
      cancelAnimationFrame(navState.animFrameId);
      navState.animFrameId = null;
    }

    const sIdx = Math.max(0, Math.min(coords.length - 1, startIdx));
    const eIdx = Math.max(0, Math.min(coords.length - 1, endIdx));
    if (sIdx === eIdx) {
      navState.flyingFairyMarker.setLatLng(coords[eIdx]);
      if (onDone) onDone();
      return;
    }

    const t0 = performance.now();
    const stepFrame = (now) => {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / Math.max(180, durationMs));
      const eased = 1 - Math.pow(1 - p, 3);
      const floatIdx = sIdx + (eIdx - sIdx) * eased;
      const i0 = Math.floor(floatIdx);
      const i1 = Math.min(coords.length - 1, Math.ceil(floatIdx));
      const frac = floatIdx - i0;

      const lat = coords[i0][0] + (coords[i1][0] - coords[i0][0]) * frac;
      const lng = coords[i0][1] + (coords[i1][1] - coords[i0][1]) * frac;

      navState.flyingFairyMarker.setLatLng([lat, lng]);
      if (i0 !== i1) {
        updateFairyFacingBySegment(coords[i0], coords[i1]);
      }

      if (p < 1) {
        navState.animFrameId = requestAnimationFrame(stepFrame);
      } else {
        navState.animFrameId = null;
        if (onDone) onDone();
      }
    };

    navState.animFrameId = requestAnimationFrame(stepFrame);
  }

  function replayFullRouteFlight() {
    if (!navState.routeData) return;
    const lastIdx = navState.routeData.coords.length - 1;
    showAppToast("🧚 요정이 전체 도보 동선을 미리 날아보여 드려요!");
    fitRouteBoundsWithUiPadding();
    animateFairyBetweenIndices(0, lastIdx, 2200, () => {
      setTimeout(() => {
        if (navState.active) {
          syncRouteProgressToStep(navState.currentStepIdx, false);
        }
      }, 450);
    });
  }

  function syncRouteProgressToStep(stepIdx, panMap = true) {
    if (!navState.routeData) return;
    const { coords, steps } = navState.routeData;
    const clampedIdx = Math.max(0, Math.min(steps.length - 1, stepIdx));
    const prevStep = steps[navState.currentStepIdx] || steps[0];
    const targetStep = steps[clampedIdx];
    navState.currentStepIdx = clampedIdx;

    const coordIdx = Math.max(0, Math.min(coords.length - 1, targetStep.coordIdx));

    // 걸어온 구간과 남은 구간 분리 업데이트
    if (navState.walkedPolyline && navState.mainPolyline && navState.haloPolyline && navState.dashPolyline) {
      const walkedSlice = coords.slice(0, Math.max(1, coordIdx + 1));
      const remainSlice = coords.slice(coordIdx);
      navState.walkedPolyline.setLatLngs(walkedSlice);
      if (remainSlice.length >= 2) {
        navState.mainPolyline.setLatLngs(remainSlice);
        navState.haloPolyline.setLatLngs(remainSlice);
        navState.dashPolyline.setLatLngs(remainSlice);
      } else {
        navState.mainPolyline.setLatLngs([coords[coords.length - 1]]);
        navState.haloPolyline.setLatLngs([coords[coords.length - 1]]);
        navState.dashPolyline.setLatLngs([coords[coords.length - 1]]);
      }
    }

    // 요정 비행 이동
    const prevCoordIdx = Math.max(0, Math.min(coords.length - 1, prevStep.coordIdx || 0));
    animateFairyBetweenIndices(prevCoordIdx, coordIdx, 520, () => {
      const tagEl = document.getElementById("mapFlyingFairyTag");
      if (tagEl) {
        tagEl.textContent =
          targetStep.type === "arrive"
            ? "목적지 도착! 🎉"
            : `${clampedIdx + 1}/${steps.length} · ${targetStep.turnLabel}`;
      }
    });

    if (panMap) {
      const map = getMapInstance();
      if (map) {
        const sheetH = Math.min(340, Math.round(window.innerHeight * 0.44));
        const targetZoom = Math.max(map.getZoom(), 16);
        const pt = map.project([targetStep.lat, targetStep.lng], targetZoom);
        const shifted = map.unproject(pt.add([0, Math.round((sheetH - 96) / 2)]), targetZoom);
        map.panTo(shifted, { animate: true, duration: 0.45 });
      }
    }

    updateTurnByTurnHud();
    renderFairyNavSheet();

    if (navState.voiceEnabled) {
      speakKoreanGuide(`${targetStep.title}. ${targetStep.fairyTip.replace(/[^\w\s가-힣.,!?]/g, "")}`);
    }
  }

  function updateTurnByTurnHud() {
    const hudEl = document.getElementById("mapTurnByTurnHud");
    if (!hudEl) return;

    if (!navState.active || !navState.routeData || !navState.place) {
      hudEl.hidden = true;
      return;
    }

    const { steps, walkMinutes } = navState.routeData;
    const step = steps[navState.currentStepIdx] || steps[0];
    const nextStep = steps[navState.currentStepIdx + 1] || null;

    // 남은 거리 합산
    let remainMeters = 0;
    for (let i = navState.currentStepIdx; i < steps.length; i += 1) {
      remainMeters += steps[i].distanceMeters || 0;
    }
    const remainMinutes = Math.max(1, Math.round(remainMeters / 67));
    const etaLabel =
      step.type === "arrive" ? "도착 완료 🎉" : formatArrivalKstTime(remainMinutes || walkMinutes);

    hudEl.innerHTML = `
      <div class="tbt-hud-main">
        <div class="tbt-turn-icon-box is-${escapeHtml(step.type)}">
          ${getTurnIconSvg(step.type)}
          <span class="tbt-turn-dist">${
            step.type === "arrive" ? "도착" : formatMeters(step.distanceMeters)
          }</span>
        </div>
        <div class="tbt-hud-body">
          <div class="tbt-hud-meta">
            <span class="tbt-step-pill">${navState.currentStepIdx + 1} / ${steps.length} 구간</span>
            <span class="tbt-eta-txt">${escapeHtml(etaLabel)}</span>
          </div>
          <strong class="tbt-primary-text">${escapeHtml(step.title)}</strong>
        </div>
        <button type="button" class="tbt-hud-close-btn" id="btnCloseTbtHud" aria-label="길안내 종료">
          ✕
        </button>
      </div>
      ${
        nextStep
          ? `
        <div class="tbt-hud-sub">
          <span class="tbt-sub-badge">다음 안내</span>
          <span class="tbt-sub-text">${escapeHtml(nextStep.turnLabel)} · ${escapeHtml(
              nextStep.title
            )}</span>
        </div>
      `
          : ""
      }
    `;
    hudEl.hidden = false;

    const closeBtn = document.getElementById("btnCloseTbtHud");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => stopFairyNavigation({ reopenDetail: true }));
    }
  }

  /* ==========================================================================
     4. 하단 요정 길안내 시트 (#fairyNavSheet) 렌더링 & 인터랙션
     ========================================================================== */

  function buildWalletSavingMessage(place) {
    const p = place.minPrice;
    if (p && p <= 3000) {
      return `편의점 삼각김밥값(${p.toLocaleString()}원)으로 든든한 한 끼! 오늘 지갑 완벽 방어예요 💸`;
    }
    if (p && p <= 6500) {
      return `평균 외식비 대비 약 ${(10000 - p).toLocaleString()}원 절약! 배달비까지 아끼면 커피 두 잔 값 세이브 ✨`;
    }
    if (place.perkHighlight) {
      return `${place.perkHighlight} 혜택 챙기고 배달비 4,000원까지 걸어서 아껴봐요! 🍚`;
    }
    return `배달 앱 최소주문·배달비 걱정 없이 도보로 가볍게 다녀오세요! ✨`;
  }

  function renderFairyNavSheet() {
    const container = document.getElementById("fairyNavBody");
    if (!container || !navState.active || !navState.place || !navState.routeData) return;

    const place = navState.place;
    const origin = navState.origin;
    const { steps, totalMeters, walkMinutes, source } = navState.routeData;
    const step = steps[navState.currentStepIdx] || steps[0];
    const isArrived = step.type === "arrive";
    const presets = getOriginPresetsForCampus(place.campus);

    const kcal = Math.max(4, Math.round(totalMeters * 0.048));
    const stepWalkCount = Math.max(25, Math.round(totalMeters / 0.72));

    const sourceBadge =
      source === "osrm_live"
        ? `<span class="fnav-source-pill is-live">🟢 실시간 보행자 도로망 반영</span>`
        : `<span class="fnav-source-pill">🧭 캠퍼스 보행 전용 동선</span>`;

    const originChipsHtml = [
      `<button type="button" class="fnav-origin-chip${
        origin.isGps ? " is-active" : ""
      }" data-nav-origin="gps">📍 내 현위치(GPS)</button>`,
      ...presets.map(
        (pr) => `
        <button type="button" class="fnav-origin-chip${
          !origin.isGps && origin.id === pr.id ? " is-active" : ""
        }" data-nav-origin="${escapeHtml(pr.id)}">
          ${escapeHtml(pr.shortLabel)}
        </button>
      `
      ),
    ].join("");

    const naverWalkUrl = `https://map.naver.com/p/directions/${origin.lng},${origin.lat},${encodeURIComponent(
      origin.label
    )}/${place.lng},${place.lat},${encodeURIComponent(place.name)}/-/walk`;
    const kakaoWalkUrl = `https://map.kakao.com/link/from/${encodeURIComponent(
      origin.label
    )},${origin.lat},${origin.lng}/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

    container.innerHTML = `
      <!-- 1) 출발지 변경 칩 바 -->
      <div class="fnav-origin-bar" role="group" aria-label="출발 기준점 선택">
        <span class="fnav-origin-lbl">출발</span>
        <div class="fnav-origin-scroll">
          ${originChipsHtml}
        </div>
      </div>

      <!-- 2) 경로 옵션 탭 (추천경로 | 큰길우선 | 최단거리) -->
      <div class="fnav-route-tabs" role="tablist" aria-label="도보 경로 옵션">
        <button type="button" class="fnav-rtab${
          navState.routeOption === "recommended" ? " is-active" : ""
        }" data-route-opt="recommended">✨ 요정 추천경로</button>
        <button type="button" class="fnav-rtab${
          navState.routeOption === "main_road" ? " is-active" : ""
        }" data-route-opt="main_road">🛣️ 큰길 우선</button>
        <button type="button" class="fnav-rtab${
          navState.routeOption === "shortest" ? " is-active" : ""
        }" data-route-opt="shortest">⚡ 최단 골목</button>
      </div>

      <!-- 3) 핵심 소요 시간 · 거리 · 칼로리 요약 카드 -->
      <div class="fnav-summary-card">
        <div class="fnav-sum-left">
          <div class="fnav-sum-headline">
            <strong class="fnav-walk-min">도보 ${walkMinutes}분</strong>
            <span class="fnav-eta-inline">${escapeHtml(formatArrivalKstTime(walkMinutes))}</span>
          </div>
          <p class="fnav-sum-sub">
            총 ${formatMeters(totalMeters)} · 약 ${stepWalkCount.toLocaleString()}걸음 · ${kcal}kcal 소모
          </p>
        </div>
        <div class="fnav-sum-right">
          ${sourceBadge}
        </div>
      </div>

      <!-- 4) 3D 요정 실시간 음성·말풍선 스테이지 -->
      <div class="fnav-fairy-stage${isArrived ? " is-arrived" : ""}">
        <div class="fnav-stage-avatar-wrap">
          <img
            src="${isArrived ? FAIRY_ASSETS.wave : FAIRY_ASSETS.fly}"
            alt="길안내 요정"
            class="fnav-stage-avatar"
            draggable="false"
          />
        </div>
        <div class="fnav-stage-speech">
          <div class="fnav-speech-top">
            <span class="fnav-speech-who">🧚 ${
              isArrived ? "도착 환영 요정" : "별지팡이 길안내 요정"
            }</span>
            <div class="fnav-mini-toggles">
              <button
                type="button"
                class="fnav-mini-btn${navState.gpsFollow ? " is-on" : ""}"
                data-nav-action="toggle-gps"
                title="실시간 GPS 위치 추적"
              >
                🛰️ ${navState.gpsFollow ? "GPS 추적중" : "내위치 추적"}
              </button>
              <button
                type="button"
                class="fnav-mini-btn${navState.voiceEnabled ? " is-on" : ""}"
                data-nav-action="toggle-voice"
                title="한국어 음성 안내 켜기/끄기"
              >
                ${navState.voiceEnabled ? "🔊 음성 ON" : "🔇 음성안내"}
              </button>
            </div>
          </div>
          <p class="fnav-speech-main">${escapeHtml(step.title)}</p>
          <p class="fnav-speech-tip">${escapeHtml(step.fairyTip)}</p>
        </div>
      </div>

      <!-- 5) 구간 이동 컨트롤 버튼 바 -->
      <div class="fnav-step-controls">
        <button
          type="button"
          class="fnav-ctrl-btn"
          data-nav-action="prev-step"
          ${navState.currentStepIdx <= 0 ? "disabled" : ""}
        >
          ◀ 이전 구간
        </button>
        <button
          type="button"
          class="fnav-ctrl-btn is-flight"
          data-nav-action="replay-flight"
          title="전체 경로 비행 미리보기"
        >
          🧚 경로 비행 보기
        </button>
        <button
          type="button"
          class="fnav-ctrl-btn is-primary"
          data-nav-action="next-step"
          ${navState.currentStepIdx >= steps.length - 1 ? "disabled" : ""}
        >
          ${navState.currentStepIdx >= steps.length - 2 ? "도착 완료 🎉" : "다음 구간 안내 ▶"}
        </button>
      </div>

      <!-- 6) 지갑 벌린 거지요정의 절약 응원 브리핑 -->
      <div class="fnav-wallet-cheer">
        <img src="${FAIRY_ASSETS.broke}" alt="텅 빈 지갑 요정" class="fnav-wallet-img" draggable="false" />
        <div class="fnav-wallet-txt">
          <strong>💸 지갑 지킴이 요정의 한마디</strong>
          <span>${escapeHtml(buildWalletSavingMessage(place))}</span>
        </div>
      </div>

      <!-- 7) 전체 Turn-by-Turn 구간 타임라인 -->
      <div class="fnav-timeline-box">
        <div class="fnav-tl-head">
          <img src="${FAIRY_ASSETS.trio}" alt="" class="fnav-trio-mini" draggable="false" />
          <strong>상세 도보 구간 안내 (${steps.length}구간)</strong>
          <span>구간을 누르면 지도가 이동해요</span>
        </div>
        <ol class="fnav-step-list" id="fairyNavStepList">
          ${steps
            .map((st, i) => {
              const cls =
                i === navState.currentStepIdx
                  ? " is-current"
                  : i < navState.currentStepIdx
                  ? " is-passed"
                  : "";
              return `
                <li class="fnav-step-item${cls}" data-step-index="${i}" tabindex="0" role="button">
                  <span class="fnav-step-num">${st.type === "arrive" ? "🏁" : i + 1}</span>
                  <div class="fnav-step-info">
                    <strong>${escapeHtml(st.title)}</strong>
                    <span>${escapeHtml(st.roadName)}${
                st.distanceMeters > 0 ? ` · ${formatMeters(st.distanceMeters)}` : ""
              }</span>
                  </div>
                </li>
              `;
            })
            .join("")}
        </ol>
      </div>

      <!-- 8) 네이버/카카오 도보 길찾기 앱 연동 버튼 -->
      <div class="fnav-ext-handoff">
        <a
          href="${escapeHtml(naverWalkUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="ext-link-btn is-naver"
        >
          🟢 네이버 도보 길찾기 앱
        </a>
        <a
          href="${escapeHtml(kakaoWalkUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="ext-link-btn is-kakao"
        >
          🟡 카카오맵 도보 길찾기
        </a>
      </div>
    `;
  }

  /* ==========================================================================
     5. 실시간 GPS 추적 (navigator.geolocation.watchPosition)
     ========================================================================== */

  function startLiveGpsTracking() {
    if (!navigator.geolocation) {
      showAppToast("이 브라우저에서는 GPS 위치 추적을 지원하지 않아요.");
      return;
    }

    stopLiveGpsTracking(false);
    navState.gpsFollow = true;
    showAppToast("🛰️ 실시간 내 위치를 따라 도보 안내를 시작합니다!");

    navState.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        navState.liveUserCoords = { lat, lng };

        const app = getAppBridge();
        if (app) {
          app.getState().userCoords = { lat, lng };
        }

        if (!navState.active || !navState.routeData) return;

        // 현재 경로에서 가장 가까운 구간 자동 매칭
        const { steps } = navState.routeData;
        let closestStep = navState.currentStepIdx;
        let minStepDist = Infinity;
        for (let i = navState.currentStepIdx; i < steps.length; i += 1) {
          const d = haversineMeters(lat, lng, steps[i].lat, steps[i].lng);
          if (d < minStepDist) {
            minStepDist = d;
            closestStep = i;
          }
        }

        // 다음 회전 지점 반경 25m 이내 진입 시 자동 다음 스텝 전환
        const nextIdx = Math.min(steps.length - 1, navState.currentStepIdx + 1);
        const distToNext = haversineMeters(lat, lng, steps[nextIdx].lat, steps[nextIdx].lng);
        if (distToNext <= 25 && nextIdx !== navState.currentStepIdx) {
          syncRouteProgressToStep(nextIdx, true);
        } else if (closestStep > navState.currentStepIdx && minStepDist <= 30) {
          syncRouteProgressToStep(closestStep, true);
        } else if (navState.flyingFairyMarker) {
          navState.flyingFairyMarker.setLatLng([lat, lng]);
        }
      },
      () => {
        navState.gpsFollow = false;
        showAppToast("GPS 신호를 가져오지 못해 수동 구간 안내 모드로 유지합니다.");
        renderFairyNavSheet();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 9000,
      }
    );

    renderFairyNavSheet();
  }

  function stopLiveGpsTracking(rerender = true) {
    if (navState.gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navState.gpsWatchId);
    }
    navState.gpsWatchId = null;
    navState.gpsFollow = false;
    if (rerender && navState.active) {
      renderFairyNavSheet();
    }
  }

  /* ==========================================================================
     6. 길안내 시작 / 종료 / 가장 가까운 초가성비 식당 바로 안내
     ========================================================================== */

  async function computeAndRenderActiveRoute(fitMap = true) {
    if (!navState.place) return;
    const reqSeq = ++navState.routeRequestSeq;

    navState.origin = resolveNavigationOrigin(navState.place);
    navState.currentStepIdx = 0;

    // 1단계: 캠퍼스 실제 보행자 도로망 그래프 즉시(0ms) 렌더링
    navState.routeData = buildCampusGraphRoute(
      navState.origin,
      navState.place,
      navState.routeOption
    );

    const titleEl = document.getElementById("fairyNavDestTitle");
    if (titleEl) {
      titleEl.textContent = `🧚 ${navState.place.name} 도보 길안내`;
    }

    drawFairyRouteOnMap(fitMap);
    updateTurnByTurnHud();
    renderFairyNavSheet();

    // 2단계: 온라인 OSRM 보행자 도로망 정밀 경로 비동기 업그레이드
    const liveRoute = await fetchOsrmFootRoute(
      navState.origin,
      navState.place,
      navState.routeOption
    );
    if (reqSeq !== navState.routeRequestSeq || !navState.active) return;

    if (liveRoute) {
      navState.routeData = liveRoute;
      navState.currentStepIdx = 0;
      drawFairyRouteOnMap(fitMap);
      updateTurnByTurnHud();
      renderFairyNavSheet();
    }
  }

  function startFairyNavigation(placeOrId, options = {}) {
    const app = getAppBridge();
    if (!app) return false;

    const places = app.getPlaces();
    const targetPlace =
      typeof placeOrId === "object" && placeOrId
        ? placeOrId
        : places.find((p) => String(p.id) === String(placeOrId));

    if (!targetPlace) return false;

    // 다른 캠퍼스 식당이면 캠퍼스 먼저 전환
    if (targetPlace.campus !== app.getCurrentCampus()) {
      app.switchCampus(targetPlace.campus, { animate: false });
    }

    // 선택 마커 하이라이트 동기화 (상세시트 대신 길안내 뷰 활성화)
    app.selectPlace(targetPlace.id, { source: "navigation" });

    navState.active = true;
    navState.place = targetPlace;
    if (options.originMode) {
      navState.originMode = options.originMode;
    } else {
      navState.originMode = "auto";
    }
    if (options.routeOption) {
      navState.routeOption = options.routeOption;
    }

    const sheetEl = document.getElementById("bottomSheet");
    const detailEl = document.getElementById("detailSheet");
    const navSheetEl = document.getElementById("fairyNavSheet");
    const filterZoneEl = document.getElementById("floatingFilterZone");
    const helperBtn = document.getElementById("brokeFairyHelperBtn");

    if (detailEl) detailEl.hidden = true;
    if (navSheetEl) navSheetEl.hidden = false;
    if (sheetEl) {
      sheetEl.classList.remove("is-detail-mode");
      sheetEl.classList.add("is-fairy-nav-mode");
    }
    if (filterZoneEl) filterZoneEl.classList.add("is-nav-hidden");
    if (helperBtn) helperBtn.classList.add("is-nav-hidden");

    app.setSheetSnap("half");
    syncCampusAnchorFairy();

    computeAndRenderActiveRoute(true);
    showAppToast(`🧚 ${targetPlace.name}까지 실시간 도보 길안내를 시작합니다!`);
    return true;
  }

  function stopFairyNavigation(options = { reopenDetail: true }) {
    if (!navState.active) return;

    const prevPlace = navState.place;
    navState.active = false;
    navState.routeRequestSeq += 1;
    stopLiveGpsTracking(false);
    clearRouteMapLayers();

    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    const hudEl = document.getElementById("mapTurnByTurnHud");
    const sheetEl = document.getElementById("bottomSheet");
    const navSheetEl = document.getElementById("fairyNavSheet");
    const filterZoneEl = document.getElementById("floatingFilterZone");
    const helperBtn = document.getElementById("brokeFairyHelperBtn");

    if (hudEl) hudEl.hidden = true;
    if (navSheetEl) navSheetEl.hidden = true;
    if (sheetEl) sheetEl.classList.remove("is-fairy-nav-mode");
    if (filterZoneEl) filterZoneEl.classList.remove("is-nav-hidden");
    if (helperBtn) helperBtn.classList.remove("is-nav-hidden");

    const app = getAppBridge();
    syncCampusAnchorFairy();

    if (options.reopenDetail && prevPlace && app) {
      app.selectPlace(prevPlace.id, { source: "card" });
    } else if (app) {
      app.clearPlaceSelection();
    }
  }

  /**
   * 좌하단 '지갑 벌리고 놀란 요정' 플로팅 버튼 클릭 시:
   * - 선택된 식당이 있으면 즉시 해당 식당 도보 길안내 시작!
   * - 선택된 식당이 없으면 현재 영업 중인 가장 저렴한 초가성비 맛집을 찾아 길안내 추천!
   */
  function handleBrokeFairyHelperClick() {
    const app = getAppBridge();
    if (!app) return;

    const helperBtn = document.getElementById("brokeFairyHelperBtn");
    triggerFairyHop(helperBtn);

    const st = app.getState();
    if (st.selectedPlaceId) {
      const selected = app.getPlaces().find((p) => String(p.id) === String(st.selectedPlaceId));
      if (selected) {
        startFairyNavigation(selected);
        return;
      }
    }

    // 현재 캠퍼스에서 영업 중이면서 가장 저렴한(초가성비) 식당 자동 픽!
    const refDate = app.getEffectiveRefDate();
    const campusPlaces = app
      .getPlaces()
      .filter((p) => p.campus === st.currentCampus)
      .map((place) => ({
        place,
        biz: window.HoursEngine.getPlaceBusinessStatus(place, refDate),
      }))
      .filter((d) => !d.biz.hidden);

    const openCheap = campusPlaces
      .filter((d) => d.biz.isOpen && typeof d.place.minPrice === "number")
      .sort((a, b) => a.place.minPrice - b.place.minPrice);

    const bestPick =
      openCheap[0]?.place ||
      campusPlaces.sort((a, b) => (a.place.minPrice || 99999) - (b.place.minPrice || 99999))[0]
        ?.place;

    if (bestPick) {
      const priceTxt = bestPick.minPrice
        ? `${bestPick.minPrice.toLocaleString()}원`
        : "초가성비";
      showAppToast(
        `💸 텅 빈 지갑 긴급 구조! ${bestPick.name}(${priceTxt})으로 길안내할게요!`
      );
      startFairyNavigation(bestPick);
    } else {
      const quote = BROKE_FAIRY_QUOTES[navState.quoteCursor % BROKE_FAIRY_QUOTES.length];
      navState.quoteCursor += 1;
      showAppToast(quote);
    }
  }

  /* ==========================================================================
     7. 상세 시트 내 '요정 지갑 브리핑 & 실시간 도보 길안내 허브' HTML 빌더
     ========================================================================== */

  function buildDetailFairyNavigationHubHtml(place, biz, walkSummaryText) {
    const isResting = biz.state === "break" || biz.state === "closed" || biz.state === "temp_closed";
    const restWarningHtml = isResting
      ? `
        <div class="detail-fairy-sleep-alert">
          <img src="${FAIRY_ASSETS.sleep}" alt="잠자는 요정" class="df-sleep-img" draggable="false" />
          <div class="df-sleep-txt">
            <strong>${
              biz.state === "break"
                ? "앗! 지금은 브레이크타임(쉬는 시간)이에요 😴"
                : "지금은 영업 종료 시간이에요 🌙"
            }</strong>
            <span>헛걸음하지 않도록 방문 시각을 꼭 확인하고 출발하세요!</span>
          </div>
        </div>
      `
      : "";

    return `
      ${restWarningHtml}
      <div class="detail-fairy-nav-hub">
        <div class="df-wallet-banner">
          <img src="${FAIRY_ASSETS.broke}" alt="지갑 벌리고 놀란 요정" class="df-broke-img" draggable="false" />
          <div class="df-wallet-copy">
            <span class="df-wallet-kicker">💸 텅 빈 지갑 구출 브리핑</span>
            <p class="df-wallet-desc">${escapeHtml(buildWalletSavingMessage(place))}</p>
          </div>
        </div>

        <button
          type="button"
          class="fairy-route-cta-btn"
          id="btnStartFairyRoute"
          data-action="start-fairy-nav"
          data-place-id="${escapeHtml(place.id)}"
        >
          <span class="frc-left">
            <img src="${FAIRY_ASSETS.fly}" alt="" class="frc-fly-img" draggable="false" />
            <span class="frc-text-col">
              <strong>🧚 요정 실시간 도보 길안내 시작</strong>
              <span>${escapeHtml(walkSummaryText)} · 골목 Turn-by-Turn &amp; 음성 안내</span>
            </span>
          </span>
          <span class="frc-go-pill">출발 ›</span>
        </button>
      </div>
    `;
  }

  /* ==========================================================================
     8. 이벤트 바인딩 초기화
     ========================================================================== */

  function bindFairyNavDomEvents() {
    // 1) 상단 브랜드 로고의 지갑 벌린 요정 클릭 시 응원 토스트
    const brandBadge = document.getElementById("brandBadge");
    if (brandBadge) {
      brandBadge.addEventListener("click", (e) => {
        e.preventDefault();
        const logoImg = brandBadge.querySelector(".brand-fairy-img");
        triggerFairyHop(logoImg || brandBadge);
        const quote = BROKE_FAIRY_QUOTES[navState.quoteCursor % BROKE_FAIRY_QUOTES.length];
        navState.quoteCursor += 1;
        showAppToast(quote);
      });
    }

    // 2) 지도 좌하단 '지갑 벌리고 놀란 요정' 플로팅 도우미 버튼
    const helperBtn = document.getElementById("brokeFairyHelperBtn");
    if (helperBtn) {
      helperBtn.addEventListener("click", handleBrokeFairyHelperClick);
    }

    // 3) 하단 요정 길안내 시트 헤더 버튼 ([← 상세정보] / [크게 보기] / [✕])
    const navBackBtn = document.getElementById("fairyNavBackBtn");
    const navExpandBtn = document.getElementById("fairyNavExpandBtn");
    const navCloseBtn = document.getElementById("fairyNavCloseBtn");

    if (navBackBtn) {
      navBackBtn.addEventListener("click", () => {
        stopFairyNavigation({ reopenDetail: true });
      });
    }
    if (navCloseBtn) {
      navCloseBtn.addEventListener("click", () => {
        stopFairyNavigation({ reopenDetail: false });
      });
    }
    if (navExpandBtn) {
      navExpandBtn.addEventListener("click", () => {
        const app = getAppBridge();
        if (!app) return;
        const curSnap = app.getState().sheetSnap;
        const nextSnap = curSnap === "full" ? "half" : "full";
        app.setSheetSnap(nextSnap);
        navExpandBtn.textContent = nextSnap === "full" ? "지도와 함께" : "크게 보기";
      });
    }

    // 4) 하단 요정 길안내 시트 내부 위임 클릭 핸들러
    const navBodyEl = document.getElementById("fairyNavBody");
    if (navBodyEl) {
      navBodyEl.addEventListener("click", (e) => {
        const originBtn = e.target.closest("[data-nav-origin]");
        if (originBtn) {
          const originKey = originBtn.getAttribute("data-nav-origin");
          if (originKey === "gps") {
            const app = getAppBridge();
            const hasCoords = navState.liveUserCoords || (app && app.getState().userCoords);
            if (!hasCoords && navigator.geolocation) {
              showAppToast("📍 내 GPS 위치를 확인하고 있어요...");
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  navState.liveUserCoords = coords;
                  if (app) app.getState().userCoords = coords;
                  navState.originMode = "gps";
                  computeAndRenderActiveRoute(true);
                },
                () => {
                  showAppToast("위치 권한을 허용하면 내 현위치에서 출발할 수 있어요!");
                },
                { enableHighAccuracy: true, timeout: 7000 }
              );
              return;
            }
          }
          navState.originMode = originKey;
          computeAndRenderActiveRoute(true);
          return;
        }

        const routeOptBtn = e.target.closest("[data-route-opt]");
        if (routeOptBtn) {
          const opt = routeOptBtn.getAttribute("data-route-opt");
          if (opt && opt !== navState.routeOption) {
            navState.routeOption = opt;
            computeAndRenderActiveRoute(true);
          }
          return;
        }

        const actionBtn = e.target.closest("[data-nav-action]");
        if (actionBtn) {
          const act = actionBtn.getAttribute("data-nav-action");
          if (act === "prev-step") {
            syncRouteProgressToStep(navState.currentStepIdx - 1, true);
          } else if (act === "next-step") {
            syncRouteProgressToStep(navState.currentStepIdx + 1, true);
          } else if (act === "replay-flight") {
            replayFullRouteFlight();
          } else if (act === "toggle-voice") {
            navState.voiceEnabled = !navState.voiceEnabled;
            renderFairyNavSheet();
            if (navState.voiceEnabled && navState.routeData) {
              const st = navState.routeData.steps[navState.currentStepIdx];
              if (st) speakKoreanGuide(st.title);
              showAppToast("🔊 요정 한국어 음성 안내를 켰어요!");
            } else {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              showAppToast("🔇 음성 안내를 껐어요.");
            }
          } else if (act === "toggle-gps") {
            if (navState.gpsFollow) {
              stopLiveGpsTracking(true);
              showAppToast("실시간 GPS 추적을 중지했어요.");
            } else {
              startLiveGpsTracking();
            }
          }
          return;
        }

        const stepItem = e.target.closest("[data-step-index]");
        if (stepItem) {
          const idx = Number(stepItem.getAttribute("data-step-index"));
          if (Number.isFinite(idx)) {
            syncRouteProgressToStep(idx, true);
          }
        }
      });
    }
  }

  window.FairyNavEngine = {
    FAIRY_ASSETS,
    isActive: () => navState.active,
    getState: () => navState,
    init: bindFairyNavDomEvents,
    syncCampusAnchorFairy,
    startFairyNavigation,
    stopFairyNavigation,
    replayFullRouteFlight,
    goToStep: (idx) => syncRouteProgressToStep(idx, true),
    setOriginMode: (mode) => {
      navState.originMode = mode;
      return computeAndRenderActiveRoute(true);
    },
    setRouteOption: (opt) => {
      navState.routeOption = opt;
      return computeAndRenderActiveRoute(true);
    },
    buildDetailFairyNavigationHubHtml,
    triggerFairyHop,
  };
})();
