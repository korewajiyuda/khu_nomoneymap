/**
 * 경희대 거지맵 — 3D 요정 마스코트 & 실제 GPS 실시간 연동 도보 길안내 엔진 (nav-fairy.js)
 * - Google Maps 스타일의 미니멀 Turn-by-Turn 길안내 + 실제 GPS(watchPosition) 실시간 위치 추적
 * - 사용자의 실제 이동 좌표에 따라 3D 길안내 요정(fairy-fly.webp)이 부드럽게 따라오며 남은 경로·거리·회전 안내 자동 갱신
 * - 경로 이탈(>45m) 시 현위치 기준 실시간 도보 재탐색(Auto Re-routing) 지원
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
      { id: "yeongtong", label: "영통역 중심상가", shortLabel: "영통역", lat: 37.25245, lng: 127.07525 },
    ],
  };

  const CAMPUS_PEDESTRIAN_GRAPH = {
    seoul: {
      nodes: {
        s_chungwoon: { lat: 37.59494, lng: 127.05182, name: "청운관 앞" },
        s_pureunsol: { lat: 37.59505, lng: 127.05573, name: "푸른솔문화관 앞" },
        s_campus_mid: { lat: 37.59380, lng: 127.05190, name: "경희대 진입로" },
        s_main_gate: { lat: 37.59270, lng: 127.05192, name: "경희대 정문" },
        s_kh3gil: { lat: 37.59252, lng: 127.05192, name: "경희대로3길 입구" },
        s_kh4gil_w: { lat: 37.59195, lng: 127.05202, name: "경희대로4길 입구" },
        s_kh4gil_e: { lat: 37.59192, lng: 127.05275, name: "경희대로4길" },
        s_samgeori: { lat: 37.59132, lng: 127.05208, name: "경희대삼거리" },
        s_kh6gil: { lat: 37.59132, lng: 127.05320, name: "경희대로1가길" },
        s_hoegi13: { lat: 37.59035, lng: 127.05145, name: "회기로13길 입구" },
        s_hoegi_mid: { lat: 37.59058, lng: 127.05368, name: "회기로 사거리" },
        s_hoegi21_s: { lat: 37.59052, lng: 127.05435, name: "회기로21길 입구" },
        s_hoegi21_n: { lat: 37.59142, lng: 127.05405, name: "회기로21길" },
        s_hoegi25_s: { lat: 37.59038, lng: 127.05530, name: "회기로25길 입구" },
        s_hoegi25_n: { lat: 37.59112, lng: 127.05535, name: "회기로25길" },
        s_hoegi_e: { lat: 37.59018, lng: 127.05705, name: "회기역 1번출구 앞" },
        s_hoegi_stn: { lat: 37.58978, lng: 127.05758, name: "회기역 광장" },
        s_imun_s: { lat: 37.58915, lng: 127.05668, name: "이문로 남측" },
        s_back_slope: { lat: 37.59528, lng: 127.05642, name: "후문 보행로" },
        s_back_gate: { lat: 37.59552, lng: 127.05705, name: "경희대 후문" },
        s_cheonjang: { lat: 37.59608, lng: 127.05782, name: "천장산로 사거리" },
        s_hwigyeong2: { lat: 37.59592, lng: 127.05902, name: "휘경로2길" },
        s_imun_hufs: { lat: 37.59572, lng: 127.06035, name: "외대사거리" },
        s_imun_n: { lat: 37.59725, lng: 127.06050, name: "이문로 북측" },
        s_oedae_stn: { lat: 37.59608, lng: 127.06265, name: "외대앞역 휘경로" },
      },
      edges: [
        ["s_chungwoon", "s_campus_mid", "경희대 보행로", true],
        ["s_chungwoon", "s_pureunsol", "교내 순환로", false],
        ["s_pureunsol", "s_back_slope", "후문 연결길", false],
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
        ["s_kh6gil", "s_hoegi21_n", "회기로21길", false],
        ["s_hoegi_mid", "s_hoegi21_s", "회기로", true],
        ["s_hoegi21_s", "s_hoegi21_n", "회기로21길", false],
        ["s_hoegi21_s", "s_hoegi25_s", "회기로", true],
        ["s_hoegi21_n", "s_hoegi25_n", "회기로 안길", false],
        ["s_hoegi25_s", "s_hoegi25_n", "회기로25길", false],
        ["s_hoegi25_s", "s_hoegi_e", "회기로", true],
        ["s_hoegi25_n", "s_hoegi_e", "회기로25길", false],
        ["s_hoegi_e", "s_hoegi_stn", "회기로", true],
        ["s_hoegi_stn", "s_imun_s", "이문로", true],
        ["s_hoegi_e", "s_imun_hufs", "이문로", true],
        ["s_back_gate", "s_cheonjang", "천장산로", true],
        ["s_back_gate", "s_hwigyeong2", "후문길", false],
        ["s_cheonjang", "s_hwigyeong2", "휘경로2길", false],
        ["s_hwigyeong2", "s_imun_hufs", "휘경로", true],
        ["s_imun_hufs", "s_imun_n", "이문로", true],
        ["s_imun_hufs", "s_oedae_stn", "휘경로", true],
      ],
    },
    global: {
      nodes: {
        g_student_hall: { lat: 37.24185, lng: 127.08003, name: "학생회관 앞" },
        g_campus_lake: { lat: 37.24350, lng: 127.07855, name: "사색의광장" },
        g_dorm2: { lat: 37.24366, lng: 127.07689, name: "제2기숙사 앞" },
        g_campus_north: { lat: 37.24585, lng: 127.07725, name: "정문 진입로" },
        g_main_gate: { lat: 37.24745, lng: 127.07735, name: "국제캠 정문" },
        g_jeonggeon_c: { lat: 37.24815, lng: 127.07675, name: "정건 사거리" },
        g_yeongil_e: { lat: 37.24802, lng: 127.07865, name: "영일로6번길" },
        g_yeongil_mid: { lat: 37.24840, lng: 127.07605, name: "영일로 중심" },
        g_maeyeong: { lat: 37.24922, lng: 127.07678, name: "매영로415번길" },
        g_yeongil_w: { lat: 37.24895, lng: 127.07495, name: "영일로 서측" },
        g_bandal_s: { lat: 37.25035, lng: 127.07510, name: "반달로 입구" },
        g_bandal_n: { lat: 37.25158, lng: 127.07505, name: "반달로 중심상가" },
        g_cheongmyeong_w: { lat: 37.25208, lng: 127.07455, name: "청명남로 서측" },
        g_yeongtong_plaza: { lat: 37.25245, lng: 127.07525, name: "영통역 중심상가" },
        g_cheongmyeong_e: { lat: 37.25285, lng: 127.07588, name: "청명남로 동측" },
      },
      edges: [
        ["g_student_hall", "g_campus_lake", "교내 중심 보행로", true],
        ["g_campus_lake", "g_dorm2", "기숙사 보행로", false],
        ["g_campus_lake", "g_campus_north", "교내 정문길", true],
        ["g_dorm2", "g_campus_north", "기숙사 정문길", true],
        ["g_campus_north", "g_main_gate", "덕영대로 횡단보도", true],
        ["g_main_gate", "g_jeonggeon_c", "영일로", true],
        ["g_main_gate", "g_yeongil_e", "영일로6번길", false],
        ["g_jeonggeon_c", "g_yeongil_e", "영일로6번길", false],
        ["g_jeonggeon_c", "g_yeongil_mid", "영일로", true],
        ["g_jeonggeon_c", "g_maeyeong", "매영로415번길", false],
        ["g_yeongil_mid", "g_maeyeong", "정건 골목", false],
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
    originMode: "gps_auto", // 기본값: 실제 GPS 우선 추적 ('gps_auto' | 'gps' | preset.id)
    routeOption: "recommended",
    origin: null,
    routeData: null,
    currentStepIdx: 0,
    voiceEnabled: false,

    // 실제 실시간 GPS 추적 상태
    gpsStatus: "idle", // 'idle' | 'searching' | 'tracking' | 'denied' | 'far_campus'
    gpsFollowCamera: true,
    gpsWatchId: null,
    liveUserCoords: null, // { lat, lng, accuracy, heading, timestamp }
    displayedFairyCoords: null,
    liveRemainMeters: null,
    lastRerouteAt: 0,
    rerouteInFlight: false,

    animFrameId: null,
    routeRequestSeq: 0,
    ignoreNextMapDrag: false,

    // Leaflet 레이어
    routeLayerGroup: null,
    walkedPolyline: null,
    haloPolyline: null,
    mainPolyline: null,
    dashPolyline: null,
    gpsAccuracyCircle: null,
    flyingFairyMarker: null,
    anchorFairyMarker: null,
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
      return `${period} ${h12}:${String(kst.minute).padStart(2, "0")} 도착`;
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
    clearTimeout(showAppToast._tid);
    showAppToast._tid = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function triggerFairyHop(targetEl) {
    if (!targetEl) return;
    targetEl.classList.remove("is-fairy-hopping");
    void targetEl.offsetWidth;
    targetEl.classList.add("is-fairy-hopping");
    setTimeout(() => targetEl.classList.remove("is-fairy-hopping"), 650);
  }

  function speakKoreanGuide(text) {
    if (!navState.voiceEnabled || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.rate = 1.04;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  /* ==========================================================================
     1. 기준점 요정 (평상시) — 심플하게 캠퍼스 기준점/내 위치 표시
     ========================================================================== */

  function syncCampusAnchorFairy() {
    const map = getMapInstance();
    const app = getAppBridge();
    if (!map || !app) return;

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
    let anchorLabel = `${campusCfg.defaultRadiusAnchor.name}`;
    let imgSrc = FAIRY_ASSETS.wave;

    const gps = navState.liveUserCoords || st.userCoords;
    if (gps) {
      const distToCampus = haversineMeters(
        gps.lat,
        gps.lng,
        campusCfg.center[0],
        campusCfg.center[1]
      );
      if (distToCampus <= 12000) {
        anchorLat = gps.lat;
        anchorLng = gps.lng;
        anchorLabel = "내 위치";
        imgSrc = FAIRY_ASSETS.fly;
      }
    } else if (st.filters.zone && st.filters.zone !== "all") {
      const zAnchor = campusCfg.anchors[st.filters.zone];
      if (zAnchor) {
        anchorLat = zAnchor.lat;
        anchorLng = zAnchor.lng;
        anchorLabel = st.filters.zone;
      }
    }

    const html = `
      <div class="fairy-anchor-pin" title="클릭하면 지갑사정(예산)을 고를 수 있어요">
        <span class="fairy-anchor-pulse" aria-hidden="true"></span>
        <img src="${escapeHtml(imgSrc)}" alt="" class="fairy-anchor-img" draggable="false" />
        <span class="fairy-anchor-badge">${escapeHtml(anchorLabel)}</span>
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
        if (app && typeof app.openWalletModal === "function") {
          app.openWalletModal();
        }
      });
    }
  }

  /* ==========================================================================
     2. 출발지 결정 (실제 GPS 최우선!) & 보행자 도로망 경로 탐색
     ========================================================================== */

  function getOriginPresetsForCampus(campusKey) {
    return CAMPUS_ORIGIN_PRESETS[campusKey] || CAMPUS_ORIGIN_PRESETS.seoul;
  }

  function resolveNavigationOrigin(place) {
    const app = getAppBridge();
    const st = app ? app.getState() : null;
    const campusKey = place.campus || (st ? st.currentCampus : "seoul");
    const presets = getOriginPresetsForCampus(campusKey);
    const gps = navState.liveUserCoords || (st && st.userCoords);

    // 1) 명시적으로 GPS 모드이거나 기본 gps_auto 모드일 때 실제 GPS 좌표 사용
    if (navState.originMode === "gps" || navState.originMode === "gps_auto") {
      if (gps && Number.isFinite(gps.lat) && Number.isFinite(gps.lng)) {
        const distToDest = haversineMeters(gps.lat, gps.lng, place.lat, place.lng);
        // 목적지와 25km 이내면 실제 GPS에서 바로 도보 길안내 경로 생성!
        if (distToDest <= 25000 || navState.originMode === "gps") {
          if (navState.gpsStatus !== "tracking") {
            navState.gpsStatus = "tracking";
          }
          return {
            id: "gps",
            label: "내 현위치 (실시간 GPS)",
            shortLabel: "내 위치",
            lat: gps.lat,
            lng: gps.lng,
            isGps: true,
          };
        }
        // 너무 먼 타 지역(25km 초과)에 있을 때는 캠퍼스 기준점 경로를 보여주되 GPS 상태 표시
        navState.gpsStatus = "far_campus";
      }
    }

    // 2) 사용자가 수동으로 정문/후문 등 특정 출발 기준점을 탭한 경우
    if (navState.originMode !== "gps_auto" && navState.originMode !== "gps") {
      const chosen = presets.find((p) => p.id === navState.originMode);
      if (chosen) return { ...chosen, isGps: false };
    }

    // 3) 아직 GPS 수신 전이거나 권한 거부 시 캠퍼스 대표 교문 폴백
    if (campusKey === "seoul" && place.zone === "후문·외대") {
      return { ...presets[1], isGps: false };
    }
    return { ...presets[0], isGps: false };
  }

  function extractStreetNameFromAddress(addr) {
    const raw = String(addr || "").trim();
    if (!raw) return "";
    const match = raw.match(/([가-힣0-9]+(?:로|길)(?:[0-9가-힣]*길)?)/);
    return match ? match[1] : "";
  }

  function turnTypeFromDeltaAngle(deltaDeg) {
    if (deltaDeg < -32) return { type: "left", label: "좌회전" };
    if (deltaDeg > 32) return { type: "right", label: "우회전" };
    if (deltaDeg < -14) return { type: "slight_left", label: "왼쪽 방향" };
    if (deltaDeg > 14) return { type: "slight_right", label: "오른쪽 방향" };
    return { type: "straight", label: "직진" };
  }

  function getTurnIconSvg(type) {
    switch (type) {
      case "left":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`;
      case "right":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>`;
      case "slight_left":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-6l-8-8"/><path d="M15 6H9v6"/></svg>`;
      case "slight_right":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20v-6l8-8"/><path d="M9 6h6v6"/></svg>`;
      case "arrive":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
    }
  }

  function buildCampusGraphRoute(origin, place, routeOption = "recommended") {
    const campusKey = place.campus === "global" ? "global" : "seoul";
    const graph = CAMPUS_PEDESTRIAN_GRAPH[campusKey];
    const directMeters = haversineMeters(origin.lat, origin.lng, place.lat, place.lng);

    if (!graph || directMeters <= 80) {
      const midLat = (origin.lat + place.lat) / 2;
      const midLng = (origin.lng + place.lng) / 2 + 0.00003;
      const coords = [
        [origin.lat, origin.lng],
        [midLat, midLng],
        [place.lat, place.lng],
      ];
      const total = Math.max(15, Math.round(directMeters));
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
            distanceMeters: total,
            title: `${origin.shortLabel}에서 ${place.name}까지 ${formatMeters(total)} 직진`,
            fairyTip: "바로 근처예요! 요정이 앞장설게요.",
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
            title: `${place.name} 도착`,
            fairyTip: "맛있는 식사 되세요!",
          },
        ],
      };
    }

    const adj = new Map();
    const nodeMap = new Map();
    for (const [id, n] of Object.entries(graph.nodes)) {
      nodeMap.set(id, n);
      adj.set(id, []);
    }

    const weightFactor = (isMainRoad) => {
      if (routeOption === "main_road") return isMainRoad ? 0.78 : 1.28;
      if (routeOption === "shortest") return 1.0;
      return isMainRoad ? 0.93 : 1.04;
    };

    for (const [u, v, roadName, isMainRoad] of graph.edges) {
      const nu = nodeMap.get(u);
      const nv = nodeMap.get(v);
      if (!nu || !nv) continue;
      const dist = haversineMeters(nu.lat, nu.lng, nv.lat, nv.lng);
      const cost = dist * weightFactor(isMainRoad);
      adj.get(u).push({ to: v, dist, cost, roadName });
      adj.get(v).push({ to: u, dist, cost, roadName });
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
        roadName: `${graph.nodes[item.id].name} 방면`,
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
      });
    }

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

    const denseCoords = [];
    const waypointCoordIndices = [0];
    for (let i = 0; i < filteredPts.length - 1; i += 1) {
      const a = filteredPts[i];
      const b = filteredPts[i + 1];
      const segM = haversineMeters(a.lat, a.lng, b.lat, b.lng);
      const subCount = Math.max(1, Math.min(14, Math.ceil(segM / 15)));
      for (let s = 0; s < subCount; s += 1) {
        const t = s / subCount;
        denseCoords.push([a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t]);
      }
      waypointCoordIndices.push(denseCoords.length);
    }
    const lastPt = filteredPts[filteredPts.length - 1];
    denseCoords.push([lastPt.lat, lastPt.lng]);

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
        const delta = ((b2 - b1 + 540) % 360) - 180;
        const nextRoad = filteredRoads[i + 1] || "보행로";
        const turnInfo = turnTypeFromDeltaAngle(delta);

        if (Math.abs(delta) >= 26 || (nextRoad !== groupRoad && accDist >= 45)) {
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
                ? `${pA.name} 교차점에서 ${groupTurn.label}하세요.`
                : "인도를 따라 직진하세요.",
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
              : `${groupNodeName}에서 ${groupTurn.label} 후 ${formatMeters(accDist)} 이동`,
          fairyTip: `잠시 후 ${place.shortName || place.name}에 도착합니다.`,
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
      title: `${place.name} 도착`,
      fairyTip: "목적지에 도착했습니다!",
    });

    const roundedTotal = Math.max(20, Math.round(totalMeters));
    return {
      coords: denseCoords,
      totalMeters: roundedTotal,
      walkMinutes: Math.max(1, Math.round(roundedTotal / 67)),
      source: "campus_footpath",
      steps,
    };
  }

  async function fetchOsrmFootRoute(origin, place, routeOption) {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${origin.lng},${origin.lat};${place.lng},${place.lat}` +
      `?overview=full&geometries=geojson&steps=true&alternatives=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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

      const straightM = haversineMeters(origin.lat, origin.lng, place.lat, place.lng);
      if (straightM > 80 && straightM < 3000 && chosenRoute.distance > straightM * 2.65) {
        return null;
      }

      const coords = geoCoords.map(([lng, lat]) => [lat, lng]);
      if (haversineMeters(origin.lat, origin.lng, coords[0][0], coords[0][1]) > 5) {
        coords.unshift([origin.lat, origin.lng]);
      }
      const tail = coords[coords.length - 1];
      if (haversineMeters(place.lat, place.lng, tail[0], tail[1]) > 5) {
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
          `${place.zone || "보행자"} 도로`;

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
              ? `${roadName} 방면으로 ${turnLabel}하세요.`
              : `${roadName} 보행로를 따라 이동하세요.`,
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
        title: `${place.name} 도착`,
        fairyTip: "목적지에 도착했습니다!",
      });

      const totalMeters = Math.max(20, Math.round(chosenRoute.distance));
      return {
        coords,
        totalMeters,
        walkMinutes: Math.max(1, Math.round(totalMeters / 67)),
        source: "osrm_live",
        steps: parsedSteps,
      };
    } catch (_) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /* ==========================================================================
     3. 실제 실시간 GPS 위치 투영(Snap) & 요정 따라가기 애니메이션
     ========================================================================== */

  /**
   * 사용자의 실제 GPS 좌표를 경로 폴리라인 선분 위에 투영하여
   * 가장 가까운 지점, 경로 이탈 거리(offRouteMeters), 남은 실제 보행 거리(remainMeters) 계산
   */
  function projectGpsOntoRoute(lat, lng, coords) {
    if (!Array.isArray(coords) || coords.length < 2) {
      return null;
    }

    let bestDist = Infinity;
    let bestSegIdx = 0;
    let bestPoint = coords[0];

    for (let i = 0; i < coords.length - 1; i += 1) {
      const [ay, ax] = coords[i];
      const [by, bx] = coords[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const lenSq = dx * dx + dy * dy;
      let t = 0;
      if (lenSq > 0) {
        t = ((lng - ax) * dx + (lat - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const py = ay + dy * t;
      const px = ax + dx * t;
      const d = haversineMeters(lat, lng, py, px);
      if (d < bestDist) {
        bestDist = d;
        bestSegIdx = i;
        bestPoint = [py, px];
      }
    }

    // bestPoint부터 종점까지 남은 경로 길이 합산
    let remainMeters = haversineMeters(
      bestPoint[0],
      bestPoint[1],
      coords[bestSegIdx + 1][0],
      coords[bestSegIdx + 1][1]
    );
    for (let j = bestSegIdx + 1; j < coords.length - 1; j += 1) {
      remainMeters += haversineMeters(
        coords[j][0],
        coords[j][1],
        coords[j + 1][0],
        coords[j + 1][1]
      );
    }

    return {
      snappedPoint: bestPoint,
      segIdx: bestSegIdx,
      offRouteMeters: bestDist,
      remainMeters: Math.round(remainMeters),
    };
  }

  function updateFairyFacingByLngDelta(dLng) {
    const wrapEl = document.getElementById("mapFlyingFairyWrap");
    if (!wrapEl || Math.abs(dLng) < 0.000004) return;
    if (dLng < 0) {
      wrapEl.classList.add("is-facing-left");
      wrapEl.classList.remove("is-facing-right");
    } else {
      wrapEl.classList.add("is-facing-right");
      wrapEl.classList.remove("is-facing-left");
    }
  }

  /**
   * 실제 GPS 수신 좌표로 요정 마커와 정확도 반경 원을 부드럽게(Lerp) 이동
   */
  function smoothMoveFairyToCoord(targetLat, targetLng, accuracyMeters = 18, durationMs = 420) {
    if (!navState.flyingFairyMarker) return;

    if (navState.animFrameId) {
      cancelAnimationFrame(navState.animFrameId);
      navState.animFrameId = null;
    }

    const prev = navState.displayedFairyCoords || [targetLat, targetLng];
    const startLat = prev[0];
    const startLng = prev[1];
    updateFairyFacingByLngDelta(targetLng - startLng);

    if (navState.gpsAccuracyCircle) {
      navState.gpsAccuracyCircle.setRadius(Math.max(10, Math.min(65, accuracyMeters || 18)));
    }

    const dist = haversineMeters(startLat, startLng, targetLat, targetLng);
    if (dist < 0.8 || durationMs <= 0) {
      navState.displayedFairyCoords = [targetLat, targetLng];
      navState.flyingFairyMarker.setLatLng([targetLat, targetLng]);
      if (navState.gpsAccuracyCircle) {
        navState.gpsAccuracyCircle.setLatLng([targetLat, targetLng]);
      }
      return;
    }

    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const ease = 1 - Math.pow(1 - p, 3);
      const curLat = startLat + (targetLat - startLat) * ease;
      const curLng = startLng + (targetLng - startLng) * ease;

      navState.displayedFairyCoords = [curLat, curLng];
      if (navState.flyingFairyMarker) {
        navState.flyingFairyMarker.setLatLng([curLat, curLng]);
      }
      if (navState.gpsAccuracyCircle) {
        navState.gpsAccuracyCircle.setLatLng([curLat, curLng]);
      }

      if (p < 1) {
        navState.animFrameId = requestAnimationFrame(step);
      } else {
        navState.animFrameId = null;
      }
    };
    navState.animFrameId = requestAnimationFrame(step);
  }

  /**
   * 실시간 GPS 좌표 업데이트 처리기 (watchPosition 콜백 + 테스트 시뮬레이션 공용)
   * - 사용자의 실제 위치에 요정이 정확히 따라붙고, 지나온 길/남은 길 분리 및 자동 구간 전환 수행!
   */
  async function handleRealtimeGpsPosition(lat, lng, accuracy = 15) {
    const prevGps = navState.liveUserCoords;
    navState.liveUserCoords = {
      lat,
      lng,
      accuracy: Number.isFinite(accuracy) ? accuracy : 15,
      timestamp: Date.now(),
    };

    const app = getAppBridge();
    if (app) {
      app.getState().userCoords = { lat, lng };
    }

    if (!navState.active || !navState.place) {
      syncCampusAnchorFairy();
      return;
    }

    const distToDest = haversineMeters(lat, lng, navState.place.lat, navState.place.lng);

    // 1) 처음 GPS 좌표를 잡았는데 기존 출발지가 정문(폴백)이었던 경우 -> 즉시 내 실제 GPS 위치 출발로 경로 재구성!
    if (
      (navState.originMode === "gps_auto" || navState.originMode === "gps") &&
      (!navState.origin || !navState.origin.isGps) &&
      distToDest <= 25000
    ) {
      navState.gpsStatus = "tracking";
      await computeAndRenderActiveRoute(true);
      return;
    }

    if (distToDest > 25000 && navState.originMode === "gps_auto") {
      navState.gpsStatus = "far_campus";
      renderFairyNavSheet();
      return;
    }

    navState.gpsStatus = "tracking";

    // 2) 요정 마커를 실제 내 GPS 위치(또는 도로 스냅 위치)로 즉시 따라오게 이동!
    if (!navState.routeData) return;
    const { coords, steps } = navState.routeData;
    const proj = projectGpsOntoRoute(lat, lng, coords);

    // 경로에서 48m 이상 벗어난 경우 자동으로 내 현위치에서 재탐색 (12초 쿨다운)
    const nowMs = Date.now();
    if (
      proj &&
      proj.offRouteMeters > 48 &&
      nowMs - navState.lastRerouteAt > 12000 &&
      !navState.rerouteInFlight
    ) {
      navState.lastRerouteAt = nowMs;
      navState.rerouteInFlight = true;
      showAppToast("🧚 현위치 기준으로 도보 경로를 다시 안내합니다");
      await computeAndRenderActiveRoute(false);
      navState.rerouteInFlight = false;
      return;
    }

    // 18m 이내면 보도 선분 위에 깔끔하게 스냅, 그 외엔 실제 GPS 좌표 그대로 표시하여 요정이 나를 따라오게 함
    const fairyLat = proj && proj.offRouteMeters <= 18 ? proj.snappedPoint[0] : lat;
    const fairyLng = proj && proj.offRouteMeters <= 18 ? proj.snappedPoint[1] : lng;
    smoothMoveFairyToCoord(fairyLat, fairyLng, accuracy, 420);

    // 태그 텍스트 업데이트
    const tagEl = document.getElementById("mapFlyingFairyTag");
    if (tagEl) {
      tagEl.textContent = distToDest <= 22 ? "도착 완료! 🎉" : "GPS 따라가는 중";
    }

    // 3) 지나온 경로 / 남은 경로 폴리라인 실시간 분할
    if (proj && navState.walkedPolyline && navState.mainPolyline && navState.haloPolyline && navState.dashPolyline) {
      navState.liveRemainMeters = proj.remainMeters;
      const walkedPts = [...coords.slice(0, proj.segIdx + 1), proj.snappedPoint];
      const remainPts = [proj.snappedPoint, ...coords.slice(proj.segIdx + 1)];
      navState.walkedPolyline.setLatLngs(walkedPts);
      if (remainPts.length >= 2) {
        navState.mainPolyline.setLatLngs(remainPts);
        navState.haloPolyline.setLatLngs(remainPts);
        navState.dashPolyline.setLatLngs(remainPts);
      }
    }

    // 4) 목적지 22m 이내 도착 판정 또는 다음 회전 교차점 24m 이내 진입 시 자동 스텝 진행
    if (distToDest <= 22 && navState.currentStepIdx !== steps.length - 1) {
      navState.currentStepIdx = steps.length - 1;
      speakKoreanGuide(`${navState.place.name}에 도착했습니다!`);
    } else {
      for (let s = navState.currentStepIdx + 1; s < steps.length; s += 1) {
        const dStep = haversineMeters(lat, lng, steps[s].lat, steps[s].lng);
        if (dStep <= 24) {
          navState.currentStepIdx = s;
          speakKoreanGuide(steps[s].title);
          break;
        }
      }
    }

    // 5) 카메라 자동 팔로우 (사용자가 직접 지도를 드래그 중이 아닐 때)
    if (navState.gpsFollowCamera) {
      const movedEnough =
        !prevGps || haversineMeters(prevGps.lat, prevGps.lng, lat, lng) >= 3;
      if (movedEnough) {
        panMapToActiveCoord(fairyLat, fairyLng);
      }
    }

    updateTurnByTurnHud();
    renderFairyNavSheet();
  }

  function panMapToActiveCoord(lat, lng) {
    const map = getMapInstance();
    if (!map) return;
    navState.ignoreNextMapDrag = true;
    const sheetH = Math.min(320, Math.round(window.innerHeight * 0.44));
    const targetZoom = Math.max(map.getZoom(), 16);
    const pt = map.project([lat, lng], targetZoom);
    const shifted = map.unproject(pt.add([0, Math.round((sheetH - 92) / 2)]), targetZoom);
    map.panTo(shifted, { animate: true, duration: 0.4 });
    setTimeout(() => {
      navState.ignoreNextMapDrag = false;
    }, 450);
  }

  function startLiveGpsWatch() {
    if (!navigator.geolocation) {
      navState.gpsStatus = "denied";
      renderFairyNavSheet();
      return;
    }

    if (navState.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(navState.gpsWatchId);
      navState.gpsWatchId = null;
    }

    if (!navState.liveUserCoords) {
      navState.gpsStatus = "searching";
    }

    navState.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        handleRealtimeGpsPosition(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy
        );
      },
      (err) => {
        navState.gpsStatus = err && err.code === 1 ? "denied" : "idle";
        renderFairyNavSheet();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1500,
        timeout: 10000,
      }
    );
  }

  function stopLiveGpsWatch() {
    if (navState.gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navState.gpsWatchId);
    }
    navState.gpsWatchId = null;
  }

  /* ==========================================================================
     4. 지도 경로 그리기 + Google Maps 스타일 Turn-by-Turn HUD
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
    navState.gpsAccuracyCircle = null;
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

    // Google Maps 스타일 블루 경로 컬러 (#1A73E8)
    const routeColor =
      navState.routeOption === "shortest"
        ? "#188038"
        : navState.routeOption === "main_road"
        ? "#1967D2"
        : "#1A73E8";

    navState.walkedPolyline = L.polyline([coords[0]], {
      color: "#9AA0A6",
      weight: 6,
      opacity: 0.7,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    navState.haloPolyline = L.polyline(coords, {
      color: routeColor,
      weight: 12,
      opacity: 0.18,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    navState.mainPolyline = L.polyline(coords, {
      color: routeColor,
      weight: 6.5,
      opacity: 0.96,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    navState.dashPolyline = L.polyline(coords, {
      color: "#FFFFFF",
      weight: 2.2,
      opacity: 0.9,
      dashArray: "6 12",
      className: "fairy-route-flow-dash",
      lineCap: "round",
    }).addTo(group);

    steps.forEach((st, idx) => {
      if (idx === 0 || st.type === "arrive") return;
      L.circleMarker([st.lat, st.lng], {
        radius: 4.5,
        color: routeColor,
        weight: 2,
        fillColor: "#FFFFFF",
        fillOpacity: 1,
      }).addTo(group);
    });

    const startIcon = L.divIcon({
      className: "route-endpoint-wrap",
      html: `<div class="route-endpoint-pill is-start">${escapeHtml(
        navState.origin.shortLabel
      )}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker(coords[0], { icon: startIcon, zIndexOffset: 2600, keyboard: false }).addTo(group);

    const endIcon = L.divIcon({
      className: "route-endpoint-wrap",
      html: `<div class="route-endpoint-pill is-end">${escapeHtml(
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

    // 실제 GPS 정확도 원 + 3D 비행 길안내 요정 마커
    const initCoord = navState.origin.isGps && navState.liveUserCoords
      ? [navState.liveUserCoords.lat, navState.liveUserCoords.lng]
      : coords[0];

    navState.displayedFairyCoords = initCoord;

    navState.gpsAccuracyCircle = L.circle(initCoord, {
      radius: navState.liveUserCoords?.accuracy || 18,
      color: "#1A73E8",
      weight: 1.2,
      fillColor: "#1A73E8",
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(group);

    const tagLabel = navState.origin.isGps ? "GPS 따라가는 중" : "길안내 요정";
    const flyIcon = L.divIcon({
      className: "fairy-flying-pin-container",
      html: `
        <div class="fairy-flying-pin-wrap is-facing-right" id="mapFlyingFairyWrap">
          <div class="fairy-gps-dot" aria-hidden="true"></div>
          <div class="fairy-flying-aura" aria-hidden="true"></div>
          <img src="${FAIRY_ASSETS.fly}" alt="길안내 요정" class="fairy-flying-img" draggable="false" />
          <span class="fairy-flying-tag" id="mapFlyingFairyTag">${escapeHtml(tagLabel)}</span>
        </div>
      `,
      iconSize: [58, 58],
      iconAnchor: [29, 34],
    });

    navState.flyingFairyMarker = L.marker(initCoord, {
      icon: flyIcon,
      zIndexOffset: 3400,
      keyboard: false,
    }).addTo(group);

    if (fitMap) {
      fitRouteBoundsWithUiPadding();
    }
  }

  function fitRouteBoundsWithUiPadding() {
    const map = getMapInstance();
    if (!map || !navState.routeData) return;
    navState.ignoreNextMapDrag = true;
    const bounds = L.latLngBounds(navState.routeData.coords);
    const visibleSheetH = Math.min(330, Math.round(window.innerHeight * 0.45));
    map.fitBounds(bounds, {
      paddingTopLeft: [32, 112],
      paddingBottomRight: [32, visibleSheetH + 28],
      maxZoom: 17,
      animate: true,
      duration: 0.55,
    });
    setTimeout(() => {
      navState.ignoreNextMapDrag = false;
    }, 650);
  }

  function syncRouteProgressToStep(stepIdx, panMap = true) {
    if (!navState.routeData) return;
    const { coords, steps } = navState.routeData;
    const clampedIdx = Math.max(0, Math.min(steps.length - 1, stepIdx));
    const targetStep = steps[clampedIdx];
    navState.currentStepIdx = clampedIdx;

    const coordIdx = Math.max(0, Math.min(coords.length - 1, targetStep.coordIdx));
    if (navState.walkedPolyline && navState.mainPolyline && navState.haloPolyline && navState.dashPolyline) {
      const walkedSlice = coords.slice(0, Math.max(1, coordIdx + 1));
      const remainSlice = coords.slice(coordIdx);
      navState.walkedPolyline.setLatLngs(walkedSlice);
      if (remainSlice.length >= 2) {
        navState.mainPolyline.setLatLngs(remainSlice);
        navState.haloPolyline.setLatLngs(remainSlice);
        navState.dashPolyline.setLatLngs(remainSlice);
      }
    }

    smoothMoveFairyToCoord(coords[coordIdx][0], coords[coordIdx][1], 14, 480);
    if (panMap) {
      panMapToActiveCoord(targetStep.lat, targetStep.lng);
    }

    updateTurnByTurnHud();
    renderFairyNavSheet();
    if (navState.voiceEnabled) {
      speakKoreanGuide(targetStep.title);
    }
  }

  function updateTurnByTurnHud() {
    const hudEl = document.getElementById("mapTurnByTurnHud");
    if (!hudEl) return;

    if (!navState.active || !navState.routeData || !navState.place) {
      hudEl.hidden = true;
      return;
    }

    const { steps, totalMeters } = navState.routeData;
    const step = steps[navState.currentStepIdx] || steps[0];
    const nextStep = steps[navState.currentStepIdx + 1] || null;

    const remainM =
      navState.liveRemainMeters !== null ? navState.liveRemainMeters : totalMeters;
    const remainMin = Math.max(1, Math.round(remainM / 67));
    const etaLabel =
      step.type === "arrive"
        ? "목적지 도착"
        : `${formatMeters(remainM)} 남음 · ${formatArrivalKstTime(remainMin)}`;

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
          <span class="tbt-sub-badge">다음</span>
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
     5. Google Maps 스타일 미니멀 하단 길안내 시트 (#fairyNavSheet)
     ========================================================================== */

  function getGpsStatusBadgeHtml() {
    if (navState.origin?.isGps && navState.gpsStatus === "tracking") {
      return `<span class="fnav-gps-badge is-live">● 실시간 GPS 따라가는 중</span>`;
    }
    if (navState.gpsStatus === "searching") {
      return `<span class="fnav-gps-badge is-searching">◌ GPS 위치 수신 중…</span>`;
    }
    if (navState.gpsStatus === "far_campus") {
      return `<span class="fnav-gps-badge">캠퍼스 외부 위치 · 교문 출발 기준</span>`;
    }
    if (navState.gpsStatus === "denied") {
      return `<span class="fnav-gps-badge">위치 권한 허용 시 요정이 내 위치를 따라와요</span>`;
    }
    return `<span class="fnav-gps-badge">실시간 보행 경로</span>`;
  }

  function renderFairyNavSheet() {
    const container = document.getElementById("fairyNavBody");
    if (!container || !navState.active || !navState.place || !navState.routeData) return;

    const place = navState.place;
    const origin = navState.origin;
    const { steps, totalMeters, walkMinutes } = navState.routeData;
    const step = steps[navState.currentStepIdx] || steps[0];
    const isArrived = step.type === "arrive";
    const presets = getOriginPresetsForCampus(place.campus);

    const effectiveMeters =
      navState.liveRemainMeters !== null ? navState.liveRemainMeters : totalMeters;
    const effectiveMin = Math.max(1, Math.round(effectiveMeters / 67));

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
      <!-- 상단 요약 행 (Google Maps 스타일: 소요시간 · 거리 · GPS 상태) -->
      <div class="fnav-summary-card">
        <div class="fnav-sum-left">
          <div class="fnav-sum-headline">
            <strong class="fnav-walk-min">${effectiveMin}분</strong>
            <span class="fnav-eta-inline">(${formatMeters(effectiveMeters)}) · ${escapeHtml(
      formatArrivalKstTime(effectiveMin)
    )}</span>
          </div>
          <div class="fnav-gps-row">
            ${getGpsStatusBadgeHtml()}
          </div>
        </div>
        <div class="fnav-sum-actions">
          <button
            type="button"
            class="fnav-icon-pill${navState.gpsFollowCamera ? " is-on" : ""}"
            data-nav-action="recenter-gps"
            title="내 위치 중심으로 고정"
          >
            📍 내위치 고정
          </button>
          <button
            type="button"
            class="fnav-icon-pill${navState.voiceEnabled ? " is-on" : ""}"
            data-nav-action="toggle-voice"
            title="음성 안내"
          >
            ${navState.voiceEnabled ? "🔊 음성 켜짐" : "🔇 음성"}
          </button>
        </div>
      </div>

      <!-- 요정 현재 구간 브리핑 카드 -->
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
          <p class="fnav-speech-main">${escapeHtml(step.title)}</p>
          <p class="fnav-speech-tip">${escapeHtml(step.fairyTip)} · 걸어가면 요정이 실시간으로 따라가요</p>
        </div>
      </div>

      <!-- 출발 기준 & 경로 옵션 (깔끔한 1줄 칩) -->
      <div class="fnav-origin-bar" role="group" aria-label="출발지 선택">
        <span class="fnav-origin-lbl">출발</span>
        <div class="fnav-origin-scroll">
          ${originChipsHtml}
        </div>
      </div>

      <div class="fnav-route-tabs" role="tablist" aria-label="경로 옵션">
        <button type="button" class="fnav-rtab${
          navState.routeOption === "recommended" ? " is-active" : ""
        }" data-route-opt="recommended">추천 경로</button>
        <button type="button" class="fnav-rtab${
          navState.routeOption === "main_road" ? " is-active" : ""
        }" data-route-opt="main_road">큰길 우선</button>
        <button type="button" class="fnav-rtab${
          navState.routeOption === "shortest" ? " is-active" : ""
        }" data-route-opt="shortest">최단 거리</button>
      </div>

      <!-- 구간 수동 미리보기 컨트롤 -->
      <div class="fnav-step-controls">
        <button
          type="button"
          class="fnav-ctrl-btn"
          data-nav-action="prev-step"
          ${navState.currentStepIdx <= 0 ? "disabled" : ""}
        >
          이전 구간
        </button>
        <button
          type="button"
          class="fnav-ctrl-btn is-primary"
          data-nav-action="next-step"
          ${navState.currentStepIdx >= steps.length - 1 ? "disabled" : ""}
        >
          ${navState.currentStepIdx >= steps.length - 2 ? "도착 확인" : "다음 구간 보기"}
        </button>
      </div>

      <!-- 상세 도보 구간 목록 -->
      <div class="fnav-timeline-box">
        <div class="fnav-tl-head">
          <strong>구간별 경로 안내 (${steps.length}단계)</strong>
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
                  <span class="fnav-step-num">${st.type === "arrive" ? "✓" : i + 1}</span>
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

      <!-- 외부 지도 앱 연동 -->
      <div class="fnav-ext-handoff">
        <a
          href="${escapeHtml(naverWalkUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="ext-link-btn is-naver"
        >
          네이버 지도 앱 길찾기
        </a>
        <a
          href="${escapeHtml(kakaoWalkUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="ext-link-btn is-kakao"
        >
          카카오맵 앱 길찾기
        </a>
      </div>
    `;
  }

  /* ==========================================================================
     6. 길안내 시작 / 종료 (시작 즉시 실제 GPS 연동 자동 활성화!)
     ========================================================================== */

  async function computeAndRenderActiveRoute(fitMap = true) {
    if (!navState.place) return;
    const reqSeq = ++navState.routeRequestSeq;

    navState.origin = resolveNavigationOrigin(navState.place);
    navState.currentStepIdx = 0;
    navState.liveRemainMeters = null;

    navState.routeData = buildCampusGraphRoute(
      navState.origin,
      navState.place,
      navState.routeOption
    );

    const titleEl = document.getElementById("fairyNavDestTitle");
    if (titleEl) {
      titleEl.textContent = `${navState.place.name} 길안내`;
    }

    drawFairyRouteOnMap(fitMap);
    updateTurnByTurnHud();
    renderFairyNavSheet();

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

    if (targetPlace.campus !== app.getCurrentCampus()) {
      app.switchCampus(targetPlace.campus, { animate: false });
    }

    app.selectPlace(targetPlace.id, { source: "navigation" });

    navState.active = true;
    navState.place = targetPlace;
    navState.originMode = options.originMode || "gps_auto";
    navState.gpsFollowCamera = true;
    navState.liveRemainMeters = null;
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

    // 시작과 동시에 실제 GPS watchPosition 실시간 추적 자동 가동!
    startLiveGpsWatch();
    computeAndRenderActiveRoute(true);
    return true;
  }

  function stopFairyNavigation(options = { reopenDetail: true }) {
    if (!navState.active) return;

    const prevPlace = navState.place;
    navState.active = false;
    navState.routeRequestSeq += 1;
    stopLiveGpsWatch();
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

  /* ==========================================================================
     7. 상세 시트 내 심플한 요정 도보 길안내 버튼 빌더
     ========================================================================== */

  function buildDetailFairyNavigationHubHtml(place, biz, walkSummaryText) {
    const isResting = biz.state === "break" || biz.state === "closed" || biz.state === "temp_closed";
    const restWarningHtml = isResting
      ? `
        <div class="detail-fairy-sleep-alert">
          <img src="${FAIRY_ASSETS.sleep}" alt="" class="df-sleep-img" draggable="false" />
          <div class="df-sleep-txt">
            <strong>${
              biz.state === "break"
                ? "현재 브레이크타임(쉬는 시간)입니다"
                : "현재 영업 종료 시간입니다"
            }</strong>
            <span>방문 전 아래 영업시간을 꼭 확인해 주세요.</span>
          </div>
        </div>
      `
      : "";

    return `
      ${restWarningHtml}
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
            <strong>요정 실시간 GPS 길안내</strong>
            <span>${escapeHtml(walkSummaryText)} · 내 위치를 따라 요정이 안내해요</span>
          </span>
        </span>
        <span class="frc-go-pill">출발</span>
      </button>
    `;
  }

  /* ==========================================================================
     8. 이벤트 바인딩 초기화
     ========================================================================== */

  function bindFairyNavDomEvents() {
    const map = getMapInstance();
    if (map) {
      // 사용자가 지도를 직접 드래그하면 카메라 고정만 잠시 해제 (내위치 고정 버튼으로 복귀 가능)
      map.on("dragstart", () => {
        if (navState.active && !navState.ignoreNextMapDrag) {
          navState.gpsFollowCamera = false;
          renderFairyNavSheet();
        }
      });
    }

    const navBackBtn = document.getElementById("fairyNavBackBtn");
    const navExpandBtn = document.getElementById("fairyNavExpandBtn");
    const navCloseBtn = document.getElementById("fairyNavCloseBtn");

    if (navBackBtn) {
      navBackBtn.addEventListener("click", () => stopFairyNavigation({ reopenDetail: true }));
    }
    if (navCloseBtn) {
      navCloseBtn.addEventListener("click", () => stopFairyNavigation({ reopenDetail: false }));
    }
    if (navExpandBtn) {
      navExpandBtn.addEventListener("click", () => {
        const app = getAppBridge();
        if (!app) return;
        const curSnap = app.getState().sheetSnap;
        const nextSnap = curSnap === "full" ? "half" : "full";
        app.setSheetSnap(nextSnap);
      });
    }

    const navBodyEl = document.getElementById("fairyNavBody");
    if (navBodyEl) {
      navBodyEl.addEventListener("click", (e) => {
        const originBtn = e.target.closest("[data-nav-origin]");
        if (originBtn) {
          const originKey = originBtn.getAttribute("data-nav-origin");
          if (originKey === "gps") {
            navState.originMode = "gps";
            navState.gpsFollowCamera = true;
            startLiveGpsWatch();
            if (navState.liveUserCoords) {
              computeAndRenderActiveRoute(true);
            } else if (navigator.geolocation) {
              showAppToast("현재 GPS 위치를 확인하고 있습니다…");
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  handleRealtimeGpsPosition(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    pos.coords.accuracy
                  );
                },
                () => {
                  showAppToast("브라우저 위치 권한을 허용해 주세요.");
                },
                { enableHighAccuracy: true, timeout: 8000 }
              );
            }
            return;
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
            navState.gpsFollowCamera = false;
            syncRouteProgressToStep(navState.currentStepIdx - 1, true);
          } else if (act === "next-step") {
            navState.gpsFollowCamera = false;
            syncRouteProgressToStep(navState.currentStepIdx + 1, true);
          } else if (act === "recenter-gps") {
            navState.gpsFollowCamera = true;
            if (navState.liveUserCoords) {
              navState.originMode = "gps";
              panMapToActiveCoord(navState.liveUserCoords.lat, navState.liveUserCoords.lng);
            } else {
              startLiveGpsWatch();
              showAppToast("실시간 GPS 위치를 추적합니다.");
            }
            renderFairyNavSheet();
          } else if (act === "toggle-voice") {
            navState.voiceEnabled = !navState.voiceEnabled;
            renderFairyNavSheet();
            if (navState.voiceEnabled && navState.routeData) {
              const st = navState.routeData.steps[navState.currentStepIdx];
              if (st) speakKoreanGuide(st.title);
              showAppToast("음성 안내가 켜졌습니다.");
            } else {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
            }
          }
          return;
        }

        const stepItem = e.target.closest("[data-step-index]");
        if (stepItem) {
          const idx = Number(stepItem.getAttribute("data-step-index"));
          if (Number.isFinite(idx)) {
            navState.gpsFollowCamera = false;
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
    handleRealtimeGpsPosition,
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
