const GOOGLE_SHEET_CSV_URL = "";
const REPORT_FORM_URL = "";

/**
 * 경희대 거지맵 — Final Application (Step 1~4, app.js)
 * - Step 1·2·3: RFC-4180 CSV 파서, 구글시트 폴백, KST HoursEngine, 컬러 캡슐 핀,
 *   3단 드래그 바텀시트, 빠른 필터바 & 방문시각 시뮬레이터, 생존 카드 8종 모달
 * - Step 4: 5단 식당 상세 시트(#detailSheet), localStorage 찜하기(BookmarkStore) & ?place=ID 딥링크 공유,
 *   학우 꿀팁 한줄평(TipStore 분리 아키텍처), ☰ 메뉴 현황판(#menuModal) & 2탭 제보 모달(#reportModal)
 */
(function () {
  "use strict";

  const LOCAL_CSV_PATH = "./data.csv";

  const CATEGORY_LIST = [
    "학식",
    "한식·백반",
    "분식",
    "국수·면",
    "돈가스·일식",
    "중식·마라",
    "양식",
    "고기·무한리필",
    "가성비술집",
  ];

  const CATEGORY_EMOJI_MAP = {
    학식: "🎓",
    분식: "🍙",
    "한식·백반": "🍚",
    "국수·면": "🍜",
    "돈가스·일식": "🍱",
    "중식·마라": "🌶️",
    양식: "🍝",
    "고기·무한리필": "🥩",
    가성비술집: "🍺",
  };

  const SHORT_CATEGORY_MAP = {
    학식: "학식",
    분식: "분식",
    "한식·백반": "한식",
    "국수·면": "국수",
    "돈가스·일식": "일식",
    "중식·마라": "중식·마라",
    양식: "양식",
    "고기·무한리필": "고기",
    가성비술집: "술집",
  };

  const SHORT_ZONE_MAP = {
    "후문·외대": "후문",
    "중상·영통": "중상",
  };

  /**
   * 캠퍼스 기준점 및 권역 칩 설정 (CAMPUS_ANCHORS)
   */
  const CAMPUS_ANCHORS = {
    seoul: {
      key: "seoul",
      label: "서울캠",
      center: [37.5928, 127.0542],
      zoom: 15,
      defaultRadiusAnchor: { name: "정문", lat: 37.5927, lng: 127.0519 },
      coreGateAnchors: [
        { name: "정문", lat: 37.5927, lng: 127.0519 },
        { name: "후문", lat: 37.596, lng: 127.0575 },
      ],
      primaryAnchors: [
        { name: "정문", lat: 37.5927, lng: 127.0519 },
        { name: "후문", lat: 37.596, lng: 127.0575 },
        { name: "회기역", lat: 37.58978, lng: 127.05758 },
      ],
      zoneOptions: [
        { zone: "all", label: "전체" },
        { zone: "교내", label: "교내(학식)" },
        { zone: "정문", label: "정문" },
        { zone: "회기역", label: "회기역" },
        { zone: "후문·외대", label: "후문·외대" },
      ],
      anchors: {
        정문: { lat: 37.5927, lng: 127.0519 },
        후문: { lat: 37.596, lng: 127.0575 },
        "후문·외대": { lat: 37.596, lng: 127.0575 },
        회기역: { lat: 37.58978, lng: 127.05758 },
        교내: { lat: 37.59499, lng: 127.05377 },
      },
    },
    global: {
      key: "global",
      label: "국제캠",
      center: [37.24845, 127.07725],
      zoom: 15,
      defaultRadiusAnchor: { name: "정건", lat: 37.24845, lng: 127.07725 },
      coreGateAnchors: [{ name: "정건", lat: 37.24845, lng: 127.07725 }],
      primaryAnchors: [
        { name: "정건", lat: 37.24845, lng: 127.07725 },
        { name: "중상", lat: 37.25285, lng: 127.07585 },
        { name: "마을", lat: 37.24685, lng: 127.07645 },
      ],
      zoneOptions: [
        { zone: "all", label: "전체" },
        { zone: "교내", label: "교내(학식)" },
        { zone: "정건", label: "정건" },
        { zone: "중상·영통", label: "중상·영통" },
      ],
      anchors: {
        정건: { lat: 37.24845, lng: 127.07725 },
        중상: { lat: 37.25285, lng: 127.07585 },
        "중상·영통": { lat: 37.25285, lng: 127.07585 },
        마을: { lat: 37.24685, lng: 127.07645 },
        교내: { lat: 37.24275, lng: 127.07846 },
      },
    },
  };

  /**
   * 오늘의 생존 카드 8종 정의
   */
  const SURVIVAL_CARDS = [
    {
      id: "ultra_budget",
      emoji: "🪙",
      title: "통장 비상! 6천원대 초가성비",
      shortTitle: "6천원대 초가성비",
      subtitle: "6천원 이하 · 초가성비 최저가순",
      sortOverride: "price_asc",
    },
    {
      id: "morning_coop",
      emoji: "🌅",
      title: "1교시 전 든든하게, 천원의 아침밥·학식",
      shortTitle: "천원의 아침밥·학식",
      subtitle: "교내 생협 학식 · 천원의 아침밥",
      sortOverride: null,
    },
    {
      id: "quick_solo",
      emoji: "⚡",
      title: "공강 40분 컷! 학교 코앞 혼밥",
      shortTitle: "공강 40분 컷 혼밥",
      subtitle: "핵심 기준점 450m 이내 · 가까운순",
      sortOverride: "distance_asc",
    },
    {
      id: "refill_king",
      emoji: "🍚",
      title: "배고파 현기증 날 때, 밥·면 리필 & 곱빼기",
      shortTitle: "밥·면 리필 & 곱빼기",
      subtitle: "밥 무한리필 · 곱빼기 동일가",
      sortOverride: null,
    },
    {
      id: "pro_solo",
      emoji: "🎧",
      title: "눈치 제로 프로혼밥러 성지",
      shortTitle: "프로혼밥러 성지",
      subtitle: "혼밥 가능 + 1만원 이하 예산",
      sortOverride: null,
    },
    {
      id: "hangover_soup",
      emoji: "🍲",
      title: "어제 마신 술 해장 시급! 뜨끈 국물",
      shortTitle: "뜨끈 해장 국물",
      subtitle: "찌개·국밥·칼국수·라멘 해장",
      sortOverride: null,
    },
    {
      id: "bapyak_course",
      emoji: "💝",
      title: "선배 멋짐 폭발, 가성비 밥약 코스",
      shortTitle: "가성비 밥약 코스",
      subtitle: "분위기·맛 다 잡는 선후배 밥약",
      sortOverride: null,
    },
    {
      id: "late_night",
      emoji: "🌙",
      title: "야작·시험기간 심야 밥집 & 가성비 한잔",
      shortTitle: "심야 밥집 & 한잔",
      subtitle: "22시 이후 영업 · 야식 · 술집",
      sortOverride: null,
    },
  ];

  const SORT_HINT_MAP = {
    recommended: "영업중·저가 우선",
    price_asc: "확정 저가순",
    distance_asc: "기준점 거리순",
  };

  function createDefaultFilters() {
    return {
      query: "",
      openOnly: false,
      bookmarkedOnly: false,
      visitTimeMode: "now", // 'now' | '08:40' | '12:30' | '15:30' | '18:00' | '22:30' | 'custom'
      customVisitTime: "15:30",
      visitDayMode: "today", // 'today' | 'weekday' | 'sat' | 'sun'
      budget: null, // null | '6000' | '10000'
      zone: "all", // 'all' | campus zone string
      refillOnly: false,
      survivalCard: null, // null | SURVIVAL_CARDS[i].id
      categories: new Set(), // multi-select categories
      maxDistance: null, // null | 300 | 500 | 1000
      confirmedPriceOnly: false,
    };
  }

  const state = {
    currentCampus: "seoul",
    sortBy: "recommended",
    sheetSnap: "half",
    selectedPlaceId: null,
    isDetailOpen: false,
    detailTipRating: "god",
    reportTab: "modify",
    lastCopiedReportText: "",
    filters: createDefaultFilters(),
    places: [],
    sortedCampusPlaces: [],
    map: null,
    radiusLayer: null,
    markerLayer: null,
    markerById: new Map(),
    renderedMarkers: [],
    userLocationMarker: null,
    userCoords: null,
    toastTimer: null,
    drag: {
      pointerId: null,
      isPointerDown: false,
      isDragging: false,
      startY: 0,
      startTranslateY: 0,
      currentTranslateY: 0,
      lastY: 0,
      lastTime: 0,
      velocityY: 0,
      startedOnGrabber: false,
    },
  };

  /**
   * HTML 특수문자 이스케이프
   */
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * RFC-4180 단일 필드 CSV 직렬화 (제보용 CSV 한 줄 생성)
   */
  function csvEscapeField(val) {
    const str = String(val ?? "").replace(/\r?\n/g, " ").trim();
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * 클립보드 복사 유틸 (Clipboard API + execCommand 폴백)
   */
  async function copyTextToClipboard(text) {
    const str = String(text ?? "");
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(str);
        return true;
      } catch (_) {
        // fallback below
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = str;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (_) {
      return false;
    }
  }

  /* ==========================================================================
     Step 4 스토리지 모듈: BookmarkStore / TipStore / ReportStore
     ========================================================================== */

  /**
   * 찜하기(북마크) 로컬 스토리지 매니저
   */
  const BookmarkStore = {
    STORAGE_KEY: "geojimap_bookmarks",

    getAll() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch (_) {
        return [];
      }
    },

    has(placeId) {
      return this.getAll().includes(String(placeId));
    },

    toggle(placeId) {
      const idStr = String(placeId);
      const list = this.getAll();
      const idx = list.indexOf(idStr);
      let added = false;
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(idStr);
        added = true;
      }
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (_) {
        // ignore quota errors
      }
      return added;
    },

    count() {
      return this.getAll().length;
    },
  };

  /**
   * 경희대 학우 꿀팁 한줄평 매니저 (TipStore)
   * - localStorage(`geojimap_tips_${placeId}`) 즉시 동작
   * - 추후 Firebase / Google Apps Script 웹훅 확장이 쉽도록 독립 객체로 분리
   */
  const TipStore = {
    STORAGE_PREFIX: "geojimap_tips_",
    CLIENT_TOKEN_KEY: "geojimap_client_token",
    WEBHOOK_URL: "", // 선택적 백엔드(Apps Script / Firebase REST) 연동 시 URL 입력

    RATINGS: {
      god: { code: "god", label: "💰 갓성비", badgeClass: "rate-god" },
      good: { code: "good", label: "👍 무난해요", badgeClass: "rate-good" },
      up: { code: "up", label: "🤔 가격 올랐어요", badgeClass: "rate-up" },
    },

    getClientToken() {
      try {
        let token = localStorage.getItem(this.CLIENT_TOKEN_KEY);
        if (!token) {
          token = `khu_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;
          localStorage.setItem(this.CLIENT_TOKEN_KEY, token);
        }
        return token;
      } catch (_) {
        return "khu_session_guest";
      }
    },

    storageKey(placeId) {
      return `${this.STORAGE_PREFIX}${String(placeId)}`;
    },

    list(placeId) {
      try {
        const raw = localStorage.getItem(this.storageKey(placeId));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    },

    isMine(tip) {
      return Boolean(tip && tip.authorToken === this.getClientToken());
    },

    add(placeId, { rating = "god", text = "" }) {
      const cleanText = String(text || "").trim().slice(0, 140);
      if (!cleanText) return null;

      const safeRating = this.RATINGS[rating] ? rating : "god";
      const kst = window.HoursEngine.getKstParts(new Date());
      const createdAt = `${kst.dateString} ${String(kst.hour).padStart(
        2,
        "0"
      )}:${String(kst.minute).padStart(2, "0")}`;

      const entry = {
        id: `tip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        placeId: String(placeId),
        rating: safeRating,
        text: cleanText,
        authorToken: this.getClientToken(),
        createdAt,
      };

      const nextList = [entry, ...this.list(placeId)];
      try {
        localStorage.setItem(this.storageKey(placeId), JSON.stringify(nextList));
      } catch (_) {
        // ignore storage quota errors
      }

      if (this.WEBHOOK_URL) {
        fetch(this.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        }).catch(() => {});
      }

      return entry;
    },

    remove(placeId, tipId) {
      const list = this.list(placeId);
      const target = list.find((t) => t.id === tipId);
      if (!target || !this.isMine(target)) return false;
      const filtered = list.filter((t) => t.id !== tipId);
      try {
        localStorage.setItem(this.storageKey(placeId), JSON.stringify(filtered));
      } catch (_) {
        // ignore
      }
      return true;
    },
  };

  window.TipStore = TipStore;

  /**
   * 가격 수정 · 신규 맛집 제보 로컬 보관함 매니저
   */
  const ReportStore = {
    STORAGE_KEY: "geojimap_reports",

    list() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    },

    save(reportItem) {
      const items = [reportItem, ...this.list()].slice(0, 50);
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (_) {
        // ignore
      }
      return reportItem;
    },
  };

  /**
   * RFC-4180 호환 CSV 파서
   */
  function parseCSV(csvText) {
    const text = String(csvText || "").replace(/^\uFEFF/, "");
    const rows = [];
    let currentRow = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"') {
          if (next === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentField += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          currentRow.push(currentField);
          currentField = "";
        } else if (ch === "\r" && next === "\n") {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = "";
          i++;
        } else if (ch === "\n" || ch === "\r") {
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = "";
        } else {
          currentField += ch;
        }
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    const nonEmptyRows = rows.filter(
      (r) => r.length > 1 || (r.length === 1 && r[0].trim() !== "")
    );
    if (nonEmptyRows.length === 0) return [];

    const headers = nonEmptyRows[0].map((h) => h.trim());
    const objects = [];

    for (let rIdx = 1; rIdx < nonEmptyRows.length; rIdx++) {
      const rawRow = nonEmptyRows[rIdx];
      const item = {};
      for (let cIdx = 0; cIdx < headers.length; cIdx++) {
        const key = headers[cIdx];
        if (!key) continue;
        item[key] = rawRow[cIdx] !== undefined ? rawRow[cIdx].trim() : "";
      }
      if (item.name || item.id) {
        objects.push(item);
      }
    }

    return objects;
  }

  function hashString(str) {
    let h = 2166136261;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * 하버사인 공식 기반 두 좌표 간 직선거리(m) 계산
   */
  function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatDistanceMeters(meters) {
    if (!Number.isFinite(meters)) return "";
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    const rounded = Math.max(10, Math.round(meters / 10) * 10);
    return `${rounded}m`;
  }

  function computeNearestAnchorInfo(campusKey, lat, lng) {
    const cfg = CAMPUS_ANCHORS[campusKey] || CAMPUS_ANCHORS.seoul;
    let best = null;
    for (const anchor of cfg.primaryAnchors) {
      const dist = haversineMeters(lat, lng, anchor.lat, anchor.lng);
      if (!best || dist < best.meters) {
        best = {
          anchorName: anchor.name,
          meters: dist,
          label: `${anchor.name} ${formatDistanceMeters(dist)}`,
        };
      }
    }
    return best || { anchorName: "", meters: 99999, label: "" };
  }

  /**
   * 캠퍼스 핵심 교문 기준점(서울캠 정문/후문, 국제캠 정건)까지의 최소 거리(m)
   */
  function computeCoreGateDistanceMeters(campusKey, lat, lng) {
    const cfg = CAMPUS_ANCHORS[campusKey] || CAMPUS_ANCHORS.seoul;
    let minD = Infinity;
    for (const g of cfg.coreGateAnchors) {
      const d = haversineMeters(lat, lng, g.lat, g.lng);
      if (d < minD) minD = d;
    }
    return minD;
  }

  function resolvePlaceCoordinates(place, fallbackIndex = 0) {
    const rawLat = parseFloat(place.lat);
    const rawLng = parseFloat(place.lng);

    if (
      Number.isFinite(rawLat) &&
      Number.isFinite(rawLng) &&
      rawLat >= 33 &&
      rawLat <= 39 &&
      rawLng >= 124 &&
      rawLng <= 132
    ) {
      return {
        lat: rawLat,
        lng: rawLng,
        isFallbackCoord: false,
      };
    }

    const campusKey = place.campus === "global" ? "global" : "seoul";
    const campusCfg = CAMPUS_ANCHORS[campusKey];
    const zoneName = String(place.zone || "").trim();

    let base = campusCfg.anchors[zoneName];
    if (!base) {
      const matchedKey = Object.keys(campusCfg.anchors).find(
        (k) => zoneName.includes(k) || k.includes(zoneName)
      );
      base = matchedKey
        ? campusCfg.anchors[matchedKey]
        : { lat: campusCfg.center[0], lng: campusCfg.center[1] };
    }

    const seed = hashString(`${place.id || fallbackIndex}-${place.name || ""}`);
    const step = (seed % 11) + 1;
    const angle = ((seed % 360) * Math.PI) / 180 + fallbackIndex * 2.39996;
    const radiusLat = 0.00022 + (step % 4) * 0.00009;
    const radiusLng = 0.00028 + (step % 4) * 0.00011;

    return {
      lat: Number((base.lat + Math.sin(angle) * radiusLat).toFixed(6)),
      lng: Number((base.lng + Math.cos(angle) * radiusLng).toFixed(6)),
      isFallbackCoord: true,
    };
  }

  function getShortPlaceName(name) {
    const raw = String(name || "").trim();
    if (!raw) return "";
    const shortened = raw
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(
        /\s+(수원경희대점|수원영통점|한국외대점|회기직영점|회기역점|경희대점|외대점|영통역점|영통점|영통)$/,
        ""
      )
      .trim();
    return shortened || raw;
  }

  function getPriceTierInfo(place) {
    const p = place.minPrice;
    if (typeof p === "number" && p > 0) {
      const formatted = `${p.toLocaleString("ko-KR")}원`;
      const cardFormatted = `${formatted}~`;

      if (p <= 6000) {
        return {
          tierClass: "tier-emerald",
          pinLabel: formatted,
          cardLabel: cardFormatted,
          hasPerkTag: false,
        };
      }
      if (p <= 10000) {
        return {
          tierClass: "tier-amber",
          pinLabel: formatted,
          cardLabel: cardFormatted,
          hasPerkTag: false,
        };
      }
      return {
        tierClass: "tier-crimson",
        pinLabel: formatted,
        cardLabel: cardFormatted,
        hasPerkTag: false,
      };
    }

    const tags = place.tagsList || [];
    const perksText = String(place.perks || "");
    const hasRefillPerk =
      tags.includes("밥리필") ||
      tags.includes("곱빼기무료") ||
      tags.includes("무한리필");

    if (hasRefillPerk) {
      let cardBenefitLabel = "리필 혜택";
      if (tags.includes("곱빼기무료")) {
        cardBenefitLabel = "곱빼기 동일가";
      } else if (tags.includes("무한리필")) {
        cardBenefitLabel = "무한리필";
      } else if (/카레/.test(perksText)) {
        cardBenefitLabel = "밥·카레 리필";
      } else if (/떡볶이/.test(perksText)) {
        cardBenefitLabel = "떡볶이 리필";
      } else {
        cardBenefitLabel = "밥 무한리필";
      }

      return {
        tierClass: "tier-perk",
        pinLabel: "리필혜택",
        cardLabel: cardBenefitLabel,
        hasPerkTag: true,
      };
    }

    return {
      tierClass: "tier-slate",
      pinLabel: "가격확인",
      cardLabel: "가격대 확인",
      hasPerkTag: false,
    };
  }

  function extractPerkHighlight(place) {
    const tags = place.tagsList || [];
    const perks = String(place.perks || "").trim();

    if (tags.includes("천원의아침밥") || /천원의\s*아침밥/.test(perks)) {
      return "✨ 천원의 아침밥";
    }
    if (/밥·카레\s*무료\s*리필/.test(perks)) {
      return "✨ 밥·카레 리필";
    }
    if (/떡볶이\s*리필/.test(perks)) {
      return "✨ 떡볶이 리필";
    }
    if (tags.includes("밥리필") || /(공기밥|밥)\s*무한\s*리필/.test(perks)) {
      return "✨ 밥 무한리필";
    }
    if (tags.includes("곱빼기무료") || /곱빼기.*동일/.test(perks)) {
      return "✨ 곱빼기 동일가";
    }
    if (tags.includes("무한리필")) {
      return "✨ 셀프 무한리필";
    }
    if (/2,900원\s*하이볼|하이볼\s*2,900원/.test(perks)) {
      return "✨ 하이볼 2,900원";
    }
    if (/온누리상품권/.test(perks)) {
      return "✨ 온누리상품권";
    }
    if (/개인\s*전용\s*화구/.test(perks)) {
      return "✨ 1인 전용 화구";
    }
    if (/폭탄\s*계란찜/.test(perks)) {
      return "✨ 폭탄 계란찜";
    }
    if (/8시간\s*우린\s*닭육수/.test(perks)) {
      return "✨ 8시간 닭육수";
    }

    if (perks) {
      const firstToken = perks.split(/[·+/]/)[0].trim();
      if (firstToken && firstToken.length <= 15) {
        return `✨ ${firstToken}`;
      }
    }

    return "";
  }

  /**
   * 22:00 이후 심야 영업 여부 사전 판별 (생존 카드 #8 용)
   */
  function checkClosesAfter22(place) {
    const sched = window.HoursEngine.parseSchedule(place);
    if (!sched.valid) return false;
    return sched.byDay.some((shifts) =>
      shifts.some((s) => s.endMin > 22 * 60 || s.is24h)
    );
  }

  function normalizePlace(raw, idx) {
    const campus = String(raw.campus || "seoul").trim().toLowerCase();
    const coords = resolvePlaceCoordinates({ ...raw, campus }, idx);
    const numericPrice = Number(String(raw.min_price || "").replace(/,/g, ""));
    const minPrice =
      Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null;

    const tagsList = String(raw.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const anchorInfo = computeNearestAnchorInfo(campus, coords.lat, coords.lng);
    const coreGateMeters = computeCoreGateDistanceMeters(
      campus,
      coords.lat,
      coords.lng
    );

    const searchableText = [
      raw.name,
      raw.rep_menu,
      raw.perks,
      raw.category,
      raw.tags,
      raw.summary,
      raw.zone,
    ]
      .join(" ")
      .toLowerCase();

    const place = {
      ...raw,
      id: String(raw.id || idx + 1),
      campus,
      minPrice,
      tagsList,
      lat: coords.lat,
      lng: coords.lng,
      isFallbackCoord: coords.isFallbackCoord,
      shortName: getShortPlaceName(raw.name),
      emoji: CATEGORY_EMOJI_MAP[raw.category] || "🍽️",
      shortCategory: SHORT_CATEGORY_MAP[raw.category] || raw.category || "식당",
      shortZone: SHORT_ZONE_MAP[raw.zone] || raw.zone || "",
      nearestAnchor: anchorInfo,
      coreGateMeters,
      closesAfter22: checkClosesAfter22(raw),
      searchableText,
    };

    place.priceTier = getPriceTierInfo(place);
    place.perkHighlight = extractPerkHighlight(place);
    return place;
  }

  async function loadPlacesData() {
    const sheetUrl = GOOGLE_SHEET_CSV_URL.trim();

    const fetchCsvText = async (url) => {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        throw new Error(`CSV 로드 실패 (${res.status}): ${url}`);
      }
      return res.text();
    };

    if (!sheetUrl) {
      const localText = await fetchCsvText(LOCAL_CSV_PATH);
      const localRows = parseCSV(localText);
      return localRows.map((row, idx) => normalizePlace(row, idx));
    }

    const [sheetResult, localResult] = await Promise.allSettled([
      fetchCsvText(sheetUrl),
      fetchCsvText(LOCAL_CSV_PATH),
    ]);

    const localRows =
      localResult.status === "fulfilled" ? parseCSV(localResult.value) : [];

    if (sheetResult.status !== "fulfilled") {
      console.warn(
        "[거지맵] 구글시트 로드 실패 -> 로컬 data.csv로 폴백합니다.",
        sheetResult.reason
      );
      return localRows.map((row, idx) => normalizePlace(row, idx));
    }

    const sheetRows = parseCSV(sheetResult.value);
    if (sheetRows.length === 0) {
      return localRows.map((row, idx) => normalizePlace(row, idx));
    }

    const localById = new Map();
    const localByCampusName = new Map();
    for (const lRow of localRows) {
      if (lRow.id) localById.set(String(lRow.id), lRow);
      if (lRow.campus && lRow.name) {
        localByCampusName.set(`${lRow.campus}::${lRow.name}`, lRow);
      }
    }

    const mergedRows = sheetRows.map((sRow) => {
      const fallback =
        (sRow.id && localById.get(String(sRow.id))) ||
        localByCampusName.get(`${sRow.campus}::${sRow.name}`) ||
        {};
      const merged = { ...fallback };
      for (const [k, v] of Object.entries(sRow)) {
        if (v !== undefined && String(v).trim() !== "") {
          merged[k] = v;
        }
      }
      return merged;
    });

    return mergedRows.map((row, idx) => normalizePlace(row, idx));
  }

  /* ==========================================================================
     방문 예정 시각 시뮬레이터 & 거리 기준점 계산
     ========================================================================== */

  /**
   * 현재 설정된 방문 시각(실시간 또는 시뮬레이션 KST 시각) Date 반환
   * KST(UTC+9) 고정을 위해 Date.UTC(Y, M-1, D, hh - 9, mm) 사용
   */
  function getEffectiveRefDate() {
    const { visitTimeMode, customVisitTime, visitDayMode } = state.filters;
    if (visitTimeMode === "now" && visitDayMode === "today") {
      return new Date();
    }

    const kstNow = window.HoursEngine.getKstParts(new Date());
    let hh = kstNow.hour;
    let mm = kstNow.minute;

    if (visitTimeMode !== "now") {
      const timeStr =
        visitTimeMode === "custom" ? customVisitTime : visitTimeMode;
      const m = String(timeStr || "").match(/^(\d{1,2}):(\d{2})$/);
      if (m) {
        hh = Math.min(23, Math.max(0, Number(m[1])));
        mm = Math.min(59, Math.max(0, Number(m[2])));
      }
    }

    let dayDelta = 0;
    if (visitDayMode === "weekday") {
      if (kstNow.weekday === 0) dayDelta = 1; // 일 -> 월
      else if (kstNow.weekday === 6) dayDelta = 2; // 토 -> 월
    } else if (visitDayMode === "sat") {
      dayDelta = (6 - kstNow.weekday + 7) % 7;
    } else if (visitDayMode === "sun") {
      dayDelta = (0 - kstNow.weekday + 7) % 7;
    }

    const utcMs = Date.UTC(
      kstNow.year,
      kstNow.month - 1,
      kstNow.day + dayDelta,
      hh - 9,
      mm,
      0
    );
    return new Date(utcMs);
  }

  function isVisitTimeSimulated() {
    return (
      state.filters.visitTimeMode !== "now" ||
      state.filters.visitDayMode !== "today"
    );
  }

  function getVisitTimeDisplayLabel() {
    if (!isVisitTimeSimulated()) {
      return "⏰ 지금 방문 ▾";
    }
    const kst = window.HoursEngine.getKstParts(getEffectiveRefDate());
    const hhmm = `${String(kst.hour).padStart(2, "0")}:${String(
      kst.minute
    ).padStart(2, "0")}`;
    const dayPrefix =
      state.filters.visitDayMode === "today" ? "" : `${kst.weekdayKor} `;
    return `⏰ ${dayPrefix}${hhmm} 방문 ▾`;
  }

  /**
   * 현재 캠퍼스에서 반경 필터(L.circle) 및 권역 거리 계산에 사용할 기준점 반환
   */
  function getActiveReferenceAnchor(campusKey = state.currentCampus) {
    const cfg = CAMPUS_ANCHORS[campusKey] || CAMPUS_ANCHORS.seoul;

    // 1순위: 내 GPS 위치가 현재 캠퍼스 반경 8km 이내인 경우
    if (state.userCoords) {
      const userToCampus = haversineMeters(
        state.userCoords.lat,
        state.userCoords.lng,
        cfg.center[0],
        cfg.center[1]
      );
      if (userToCampus <= 8000) {
        return {
          name: "내위치",
          lat: state.userCoords.lat,
          lng: state.userCoords.lng,
          isSpecific: true,
        };
      }
    }

    // 2순위: 권역 칩이 특정 권역으로 선택된 경우 해당 권역 기준점 사용
    if (state.filters.zone && state.filters.zone !== "all") {
      const zAnchor = cfg.anchors[state.filters.zone];
      if (zAnchor) {
        const shortName =
          SHORT_ZONE_MAP[state.filters.zone] || state.filters.zone;
        return {
          name: shortName,
          lat: zAnchor.lat,
          lng: zAnchor.lng,
          isSpecific: true,
        };
      }
    }

    // 3순위: 캠퍼스 기본 대표 기준점 (서울캠 정문 / 국제캠 정건)
    return {
      name: cfg.defaultRadiusAnchor.name,
      lat: cfg.defaultRadiusAnchor.lat,
      lng: cfg.defaultRadiusAnchor.lng,
      isSpecific: false,
    };
  }

  /**
   * 개별 매장의 카드 표기 거리 및 정렬용 거리 계산
   */
  function getPlaceDistanceContext(place) {
    // 생존 카드 #3(공강 40분 컷)이 켜져 있으면 교문(정문/후문 또는 정건) 최단거리 우선 활용
    if (
      state.filters.survivalCard === "quick_solo" &&
      state.filters.zone === "all" &&
      !state.userCoords
    ) {
      const cfg = CAMPUS_ANCHORS[place.campus] || CAMPUS_ANCHORS.seoul;
      let bestGate = cfg.coreGateAnchors[0];
      let bestMeters = Infinity;
      for (const g of cfg.coreGateAnchors) {
        const d = haversineMeters(place.lat, place.lng, g.lat, g.lng);
        if (d < bestMeters) {
          bestMeters = d;
          bestGate = g;
        }
      }
      return {
        meters: bestMeters,
        label: `${bestGate.name} ${formatDistanceMeters(bestMeters)}`,
      };
    }

    const activeRef = getActiveReferenceAnchor(place.campus);
    if (activeRef.isSpecific) {
      const d = haversineMeters(
        activeRef.lat,
        activeRef.lng,
        place.lat,
        place.lng
      );
      return {
        meters: d,
        label: `${activeRef.name} ${formatDistanceMeters(d)}`,
      };
    }

    return {
      meters: place.nearestAnchor.meters,
      label: place.nearestAnchor.label,
    };
  }

  /* ==========================================================================
     통합 필터 엔진 (빠른 칩 + 생존 카드 8종 + 세부 다중 조건)
     ========================================================================== */

  function matchesBudgetRule(place, budgetCode) {
    if (budgetCode === "6000") {
      return (
        (place.minPrice !== null && place.minPrice <= 6000) ||
        (place.minPrice === null && place.tagsList.includes("초가성비"))
      );
    }
    if (budgetCode === "10000") {
      return (
        (place.minPrice !== null && place.minPrice <= 10000) ||
        (place.minPrice === null &&
          (place.tagsList.includes("만원이하") ||
            place.tagsList.includes("초가성비")))
      );
    }
    return true;
  }

  function hasRefillOrUpgradeTag(place) {
    return (
      place.tagsList.includes("밥리필") ||
      place.tagsList.includes("곱빼기무료") ||
      place.tagsList.includes("무한리필")
    );
  }

  function matchesSurvivalCard(place, cardId) {
    if (!cardId) return true;
    switch (cardId) {
      case "ultra_budget":
        return matchesBudgetRule(place, "6000");
      case "morning_coop":
        return (
          place.category === "학식" || place.tagsList.includes("천원의아침밥")
        );
      case "quick_solo":
        return (
          place.tagsList.includes("혼밥가능") && place.coreGateMeters <= 450
        );
      case "refill_king":
        return hasRefillOrUpgradeTag(place);
      case "pro_solo":
        return (
          place.tagsList.includes("혼밥가능") &&
          matchesBudgetRule(place, "10000")
        );
      case "hangover_soup":
        return place.tagsList.includes("해장국물");
      case "bapyak_course":
        return place.tagsList.includes("밥약추천");
      case "late_night":
        return (
          place.tagsList.includes("야식심야") ||
          place.tagsList.includes("가성비술집") ||
          place.closesAfter22
        );
      default:
        return true;
    }
  }

  /**
   * 단일 매장이 현재 모든 필터 조건에 부합하는지 판정
   */
  function evaluatePlaceMatch(place, refDate) {
    if (place.campus !== state.currentCampus) {
      return { matched: false, biz: null };
    }

    const biz = window.HoursEngine.getPlaceBusinessStatus(place, refDate);
    if (biz.hidden) {
      return { matched: false, biz };
    }

    const f = state.filters;

    // 1) 검색어 부분 일치 (공백 구분 다중 키워드 지원)
    if (f.query) {
      const tokens = f.query.toLowerCase().split(/\s+/).filter(Boolean);
      for (const tk of tokens) {
        if (!place.searchableText.includes(tk)) {
          return { matched: false, biz };
        }
      }
    }

    // 2) 영업 중만 토글 (open 및 closing_soon만 허용, closed / break / unknown 제외!)
    if (f.openOnly) {
      if (biz.state !== "open" && biz.state !== "closing_soon") {
        return { matched: false, biz };
      }
    }

    // 2-b) 찜한 맛집만 보기 토글
    if (f.bookmarkedOnly && !BookmarkStore.has(place.id)) {
      return { matched: false, biz };
    }

    // 3) 예산 원터치 칩
    if (f.budget && !matchesBudgetRule(place, f.budget)) {
      return { matched: false, biz };
    }

    // 4) 캠퍼스 권역 칩
    if (f.zone && f.zone !== "all" && place.zone !== f.zone) {
      return { matched: false, biz };
    }

    // 5) 밥·사리 리필 칩
    if (f.refillOnly && !hasRefillOrUpgradeTag(place)) {
      return { matched: false, biz };
    }

    // 6) 생존 카드 8종
    if (f.survivalCard && !matchesSurvivalCard(place, f.survivalCard)) {
      return { matched: false, biz };
    }

    // 7) 업종 다중 선택
    if (f.categories.size > 0 && !f.categories.has(place.category)) {
      return { matched: false, biz };
    }

    // 8) 거리 반경 필터
    if (f.maxDistance !== null) {
      const refAnchor = getActiveReferenceAnchor(place.campus);
      const distFromRef = haversineMeters(
        refAnchor.lat,
        refAnchor.lng,
        place.lat,
        place.lng
      );
      if (distFromRef > f.maxDistance) {
        return { matched: false, biz };
      }
    }

    // 9) 확정 가격 매장만 보기
    if (f.confirmedPriceOnly && place.price_status !== "확정가격") {
      return { matched: false, biz };
    }

    return { matched: true, biz };
  }

  function getBusinessStateRank(bizState) {
    if (bizState === "open" || bizState === "closing_soon") return 0;
    if (bizState === "break") return 1;
    if (bizState === "unknown") return 2;
    return 3;
  }

  /**
   * 필터 통과 매장 정렬 (추천순 | 낮은가격순 | 가까운순)
   */
  function filterAndSortCampusPlaces(refDate = getEffectiveRefDate()) {
    const decorated = [];

    for (const place of state.places) {
      const { matched, biz } = evaluatePlaceMatch(place, refDate);
      if (!matched) continue;
      const distCtx = getPlaceDistanceContext(place);
      decorated.push({
        place,
        biz,
        dist: distCtx.meters,
        distLabel: distCtx.label,
      });
    }

    const sortBy = state.sortBy;
    decorated.sort((a, b) => {
      const hasPriceA =
        typeof a.place.minPrice === "number" && a.place.minPrice > 0;
      const hasPriceB =
        typeof b.place.minPrice === "number" && b.place.minPrice > 0;

      if (sortBy === "price_asc") {
        if (hasPriceA && !hasPriceB) return -1;
        if (!hasPriceA && hasPriceB) return 1;
        if (hasPriceA && hasPriceB && a.place.minPrice !== b.place.minPrice) {
          return a.place.minPrice - b.place.minPrice;
        }
        if (!hasPriceA && !hasPriceB) {
          if (a.place.priceTier.hasPerkTag !== b.place.priceTier.hasPerkTag) {
            return a.place.priceTier.hasPerkTag ? -1 : 1;
          }
        }
        const rankDiff =
          getBusinessStateRank(a.biz.state) - getBusinessStateRank(b.biz.state);
        if (rankDiff !== 0) return rankDiff;
        if (a.dist !== b.dist) return a.dist - b.dist;
        return Number(a.place.id) - Number(b.place.id);
      }

      if (sortBy === "distance_asc") {
        if (Math.abs(a.dist - b.dist) > 1) {
          return a.dist - b.dist;
        }
        const rankDiff =
          getBusinessStateRank(a.biz.state) - getBusinessStateRank(b.biz.state);
        if (rankDiff !== 0) return rankDiff;
        return Number(a.place.id) - Number(b.place.id);
      }

      // recommended (영업중 우선 + 확정저가순)
      const rankDiff =
        getBusinessStateRank(a.biz.state) - getBusinessStateRank(b.biz.state);
      if (rankDiff !== 0) return rankDiff;

      if (hasPriceA && !hasPriceB) return -1;
      if (!hasPriceA && hasPriceB) return 1;
      if (hasPriceA && hasPriceB && a.place.minPrice !== b.place.minPrice) {
        return a.place.minPrice - b.place.minPrice;
      }

      if (a.place.priceTier.hasPerkTag !== b.place.priceTier.hasPerkTag) {
        return a.place.priceTier.hasPerkTag ? -1 : 1;
      }
      if (a.dist !== b.dist) return a.dist - b.dist;
      return Number(a.place.id) - Number(b.place.id);
    });

    return decorated;
  }

  /* ==========================================================================
     지도 반경 원(L.circle) 시각화
     ========================================================================== */
  function syncRadiusCircles() {
    if (!state.map || !state.radiusLayer) return;
    state.radiusLayer.clearLayers();

    const circleStyle = {
      color: "#EA580C",
      weight: 1.8,
      dashArray: "6 6",
      fillColor: "#F59E0B",
      fillOpacity: 0.08,
      interactive: false,
    };

    if (state.filters.maxDistance !== null) {
      const ref = getActiveReferenceAnchor(state.currentCampus);
      L.circle([ref.lat, ref.lng], {
        ...circleStyle,
        radius: state.filters.maxDistance,
      }).addTo(state.radiusLayer);
      return;
    }

    // 생존 카드 #3(공강 40분 컷 450m 이내) 활성 시 핵심 교문 반경 원 표시
    if (state.filters.survivalCard === "quick_solo") {
      const cfg =
        CAMPUS_ANCHORS[state.currentCampus] || CAMPUS_ANCHORS.seoul;
      for (const gate of cfg.coreGateAnchors) {
        L.circle([gate.lat, gate.lng], {
          ...circleStyle,
          radius: 450,
        }).addTo(state.radiusLayer);
      }
    }
  }

  /* ==========================================================================
     활성 필터 칩 목록 생성 & 개별 해제 / 전체 초기화
     ========================================================================== */

  function getActiveFilterDescriptors() {
    const f = state.filters;
    const list = [];

    if (f.query) {
      list.push({ key: "query", label: `🔍 "${f.query}"` });
    }
    if (isVisitTimeSimulated()) {
      const kst = window.HoursEngine.getKstParts(getEffectiveRefDate());
      const hhmm = `${String(kst.hour).padStart(2, "0")}:${String(
        kst.minute
      ).padStart(2, "0")}`;
      const dayTxt =
        f.visitDayMode === "today" ? "오늘" : `${kst.weekdayKor}요일`;
      list.push({ key: "visitTime", label: `⏰ ${dayTxt} ${hhmm}` });
    }
    if (f.openOnly) {
      list.push({ key: "openOnly", label: "🟢 영업 중만" });
    }
    if (f.bookmarkedOnly) {
      list.push({ key: "bookmarkedOnly", label: "❤️ 찜한 곳" });
    }
    if (f.survivalCard) {
      const card = SURVIVAL_CARDS.find((c) => c.id === f.survivalCard);
      if (card) {
        list.push({
          key: "survivalCard",
          label: `${card.emoji} ${card.shortTitle}`,
        });
      }
    }
    if (f.budget === "6000") {
      list.push({ key: "budget", label: "💸 6천원 이하" });
    } else if (f.budget === "10000") {
      list.push({ key: "budget", label: "💴 1만원 이하" });
    }
    if (f.zone && f.zone !== "all") {
      list.push({ key: "zone", label: `📍 ${f.zone}` });
    }
    if (f.refillOnly) {
      list.push({ key: "refillOnly", label: "🍚 밥·사리 리필" });
    }
    for (const cat of f.categories) {
      list.push({
        key: `cat:${cat}`,
        label: `${CATEGORY_EMOJI_MAP[cat] || "🍽️"} ${cat}`,
      });
    }
    if (f.maxDistance !== null) {
      const distTxt =
        f.maxDistance >= 1000 ? "1km 이내" : `${f.maxDistance}m 이내`;
      list.push({ key: "maxDistance", label: `📏 ${distTxt}` });
    }
    if (f.confirmedPriceOnly) {
      list.push({ key: "confirmedPriceOnly", label: "✓ 확정가격만" });
    }

    return list;
  }

  function removeSingleFilter(descriptorKey) {
    const f = state.filters;
    if (descriptorKey === "query") {
      f.query = "";
      const inputEl = document.getElementById("searchInput");
      const clearEl = document.getElementById("searchClearBtn");
      if (inputEl) inputEl.value = "";
      if (clearEl) clearEl.hidden = true;
    } else if (descriptorKey === "visitTime") {
      f.visitTimeMode = "now";
      f.visitDayMode = "today";
    } else if (descriptorKey === "openOnly") {
      f.openOnly = false;
    } else if (descriptorKey === "bookmarkedOnly") {
      f.bookmarkedOnly = false;
    } else if (descriptorKey === "survivalCard") {
      f.survivalCard = null;
    } else if (descriptorKey === "budget") {
      f.budget = null;
    } else if (descriptorKey === "zone") {
      f.zone = "all";
    } else if (descriptorKey === "refillOnly") {
      f.refillOnly = false;
    } else if (descriptorKey.startsWith("cat:")) {
      const cat = descriptorKey.slice(4);
      f.categories.delete(cat);
    } else if (descriptorKey === "maxDistance") {
      f.maxDistance = null;
    } else if (descriptorKey === "confirmedPriceOnly") {
      f.confirmedPriceOnly = false;
    }

    refreshCampusView({ rebuildMarkers: true, resetScroll: true });
  }

  function resetAllFilters(options = { flyToCampusCenter: false }) {
    state.filters = createDefaultFilters();
    state.sortBy = "recommended";
    closeDetailView({ clearSelection: true, updateUrl: true });

    const inputEl = document.getElementById("searchInput");
    const clearEl = document.getElementById("searchClearBtn");
    if (inputEl) inputEl.value = "";
    if (clearEl) clearEl.hidden = true;

    document.querySelectorAll(".sort-tab").forEach((btn) => {
      const active = btn.getAttribute("data-sort") === "recommended";
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    closeVisitTimePopover();
    refreshCampusView({ rebuildMarkers: true, resetScroll: true });

    if (options.flyToCampusCenter && state.map) {
      const cfg = CAMPUS_ANCHORS[state.currentCampus];
      state.map.flyTo(cfg.center, cfg.zoom, { duration: 0.65 });
    }
  }

  /* ==========================================================================
     바텀시트 3단 스냅 & 포인터 드래그 엔진 (목록 모드 & 상세 시트 공통 지원)
     ========================================================================== */

  function getSheetMetrics() {
    const stageEl = document.getElementById("mapStage");
    const sheetEl = document.getElementById("bottomSheet");
    const headerEl = state.isDetailOpen
      ? document.getElementById("detailDragHeader")
      : document.getElementById("sheetHeader");

    const viewportH = window.innerHeight || 800;
    const stageH = stageEl ? stageEl.clientHeight : viewportH - 54;
    const sheetH = sheetEl ? sheetEl.offsetHeight : Math.max(300, stageH - 8);
    const headerH =
      headerEl && headerEl.offsetHeight > 0
        ? headerEl.offsetHeight
        : state.isDetailOpen
        ? 62
        : 88;

    const collapsedVisible = state.isDetailOpen ? 64 : 88;
    const halfRatio = state.isDetailOpen ? 0.54 : 0.46;
    const halfVisible = Math.min(
      sheetH - 56,
      Math.max(220, Math.round(viewportH * halfRatio))
    );
    const fullVisible = sheetH;

    return {
      stageH,
      sheetH,
      headerH,
      snaps: {
        full: { translateY: 0, visibleH: fullVisible },
        half: {
          translateY: Math.max(0, sheetH - halfVisible),
          visibleH: halfVisible,
        },
        collapsed: {
          translateY: Math.max(0, sheetH - collapsedVisible),
          visibleH: collapsedVisible,
        },
      },
    };
  }

  function applySheetLayout(snapKey) {
    const sheetEl = document.getElementById("bottomSheet");
    const listScrollEl = document.getElementById("sheetListScroll");
    const detailScrollEl = document.getElementById("detailScrollBody");
    const detailExpandBtn = document.getElementById("detailExpandBtn");
    const controlsEl = document.getElementById("customMapControls");
    const stageEl = document.getElementById("mapStage");
    const btnWide = document.getElementById("btnSheetMapWide");
    const btnFull = document.getElementById("btnSheetFullList");

    if (!sheetEl) return;

    const metrics = getSheetMetrics();
    const target = metrics.snaps[snapKey] || metrics.snaps.half;

    state.sheetSnap = snapKey;
    state.drag.currentTranslateY = target.translateY;

    sheetEl.dataset.snap = snapKey;
    sheetEl.style.setProperty("--sheet-translate-y", `${target.translateY}px`);

    const contentH = Math.max(0, target.visibleH - metrics.headerH);
    if (listScrollEl && !state.isDetailOpen) {
      listScrollEl.style.setProperty("--sheet-list-height", `${contentH}px`);
    }
    if (detailScrollEl && state.isDetailOpen) {
      detailScrollEl.style.setProperty(
        "--detail-scroll-height",
        `${contentH}px`
      );
    }

    if (detailExpandBtn) {
      detailExpandBtn.textContent =
        snapKey === "full" ? "지도와 함께" : "크게 보기";
    }

    if (stageEl && controlsEl) {
      if (snapKey === "full") {
        controlsEl.classList.add("is-hidden");
      } else {
        controlsEl.classList.remove("is-hidden");
        stageEl.style.setProperty(
          "--controls-bottom",
          `${target.visibleH + 12}px`
        );
      }
    }

    if (btnWide) {
      btnWide.classList.toggle("is-active", snapKey === "collapsed");
    }
    if (btnFull) {
      btnFull.classList.toggle("is-active", snapKey === "full");
    }
  }

  function setSheetSnap(snapKey) {
    if (!["collapsed", "half", "full"].includes(snapKey)) return;
    const sheetEl = document.getElementById("bottomSheet");
    if (sheetEl) sheetEl.classList.remove("is-dragging");
    applySheetLayout(snapKey);
  }

  function getVisibleSheetHeightPx() {
    const metrics = getSheetMetrics();
    const snapInfo = metrics.snaps[state.sheetSnap] || metrics.snaps.half;
    if (state.sheetSnap === "full") {
      return metrics.snaps.half.visibleH;
    }
    return snapInfo.visibleH;
  }

  /**
   * 상단 플로팅 필터바(약 82px)와 하단 바텀시트 사이 가시 영역 정중앙으로 핀 오프셋 이동
   */
  function flyToPlaceWithOffset(place, targetZoomOverride = null) {
    if (!state.map || !place) return;
    const currentZoom = state.map.getZoom();
    const targetZoom = targetZoomOverride || Math.max(currentZoom, 16);
    const topFilterHeightPx = 82;
    const sheetHeightPx = getVisibleSheetHeightPx();

    const yShift = Math.round((sheetHeightPx - topFilterHeightPx) / 2);
    const pinPoint = state.map.project([place.lat, place.lng], targetZoom);
    const offsetCenterPoint = pinPoint.add([0, yShift]);
    const offsetLatLng = state.map.unproject(offsetCenterPoint, targetZoom);

    state.map.flyTo(offsetLatLng, targetZoom, {
      duration: 0.55,
      easeLinearity: 0.25,
    });
  }

  function scrollCardIntoSheet(placeId, behavior = "smooth") {
    const listScrollEl = document.getElementById("sheetListScroll");
    if (!listScrollEl) return;

    const cardEl = listScrollEl.querySelector(
      `.place-card[data-place-id="${CSS.escape(String(placeId))}"]`
    );
    if (!cardEl) return;

    const pad = 12;
    const viewH = listScrollEl.clientHeight;
    const cardTop = cardEl.offsetTop;
    const cardBottom = cardTop + cardEl.offsetHeight;
    const curTop = listScrollEl.scrollTop;

    if (viewH <= 0) {
      cardEl.scrollIntoView({ behavior, block: "nearest" });
      return;
    }

    if (cardTop < curTop + pad) {
      listScrollEl.scrollTo({ top: Math.max(0, cardTop - pad), behavior });
    } else if (cardBottom > curTop + viewH - pad) {
      listScrollEl.scrollTo({
        top: Math.max(0, cardBottom - viewH + pad),
        behavior,
      });
    }
  }

  function initBottomSheetDrag() {
    const sheetEl = document.getElementById("bottomSheet");
    const listHeaderEl = document.getElementById("sheetHeader");
    const detailHeaderEl = document.getElementById("detailDragHeader");
    if (!sheetEl) return;

    const attachDragHandlers = (handleEl) => {
      if (!handleEl) return;

      handleEl.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button, a, select, input")) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        state.drag.pointerId = e.pointerId;
        state.drag.isPointerDown = true;
        state.drag.isDragging = false;
        state.drag.startY = e.clientY;
        state.drag.lastY = e.clientY;
        state.drag.lastTime = performance.now();
        state.drag.velocityY = 0;
        state.drag.startTranslateY = state.drag.currentTranslateY;
        state.drag.startedOnGrabber = Boolean(
          e.target.closest("#sheetGrabber, #detailGrabber")
        );

        try {
          handleEl.setPointerCapture(e.pointerId);
        } catch (_) {
          // ignore synthetic pointer capture failure
        }
      });

      handleEl.addEventListener("pointermove", (e) => {
        if (!state.drag.isPointerDown || e.pointerId !== state.drag.pointerId) {
          return;
        }

        const dy = e.clientY - state.drag.startY;
        if (!state.drag.isDragging && Math.abs(dy) > 4) {
          state.drag.isDragging = true;
          sheetEl.classList.add("is-dragging");
        }

        if (!state.drag.isDragging) return;

        const now = performance.now();
        const dt = now - state.drag.lastTime;
        if (dt > 0) {
          state.drag.velocityY = (e.clientY - state.drag.lastY) / dt;
          state.drag.lastY = e.clientY;
          state.drag.lastTime = now;
        }

        const metrics = getSheetMetrics();
        const minTranslate = metrics.snaps.full.translateY;
        const maxTranslate = metrics.snaps.collapsed.translateY;
        const nextY = Math.min(
          maxTranslate,
          Math.max(minTranslate, state.drag.startTranslateY + dy)
        );

        state.drag.currentTranslateY = nextY;
        sheetEl.style.setProperty("--sheet-translate-y", `${nextY}px`);
      });

      const finishDrag = (e) => {
        if (!state.drag.isPointerDown) return;
        if (
          e.pointerId !== undefined &&
          state.drag.pointerId !== null &&
          e.pointerId !== state.drag.pointerId
        ) {
          return;
        }

        const wasDragging = state.drag.isDragging;
        const vy = state.drag.velocityY;
        const startedOnGrabber = state.drag.startedOnGrabber;

        state.drag.isPointerDown = false;
        state.drag.isDragging = false;
        state.drag.pointerId = null;
        sheetEl.classList.remove("is-dragging");

        if (!wasDragging) {
          if (startedOnGrabber) {
            const nextCycle =
              state.sheetSnap === "collapsed"
                ? "half"
                : state.sheetSnap === "half"
                ? "full"
                : "half";
            setSheetSnap(nextCycle);
          }
          return;
        }

        const metrics = getSheetMetrics();
        const curY = state.drag.currentTranslateY;
        const order = ["full", "half", "collapsed"];
        const currentIdx = order.indexOf(state.sheetSnap);

        let targetSnap = state.sheetSnap;
        if (vy < -0.45 && currentIdx > 0) {
          targetSnap = order[currentIdx - 1];
        } else if (vy > 0.45 && currentIdx < order.length - 1) {
          targetSnap = order[currentIdx + 1];
        } else {
          let minDist = Infinity;
          for (const key of order) {
            const dist = Math.abs(curY - metrics.snaps[key].translateY);
            if (dist < minDist) {
              minDist = dist;
              targetSnap = key;
            }
          }
        }

        setSheetSnap(targetSnap);
      };

      handleEl.addEventListener("pointerup", finishDrag);
      handleEl.addEventListener("pointercancel", finishDrag);
    };

    attachDragHandlers(listHeaderEl);
    attachDragHandlers(detailHeaderEl);
  }

  /* ==========================================================================
     UI 렌더링: 빠른 필터바, 모달, 마커, 바텀시트 카드, 활성 필터바
     ========================================================================== */

  /**
   * 캠퍼스별 권역 빠른 칩 렌더링
   */
  function renderZoneQuickChips() {
    const container = document.getElementById("zoneChipsInline");
    if (!container) return;

    const cfg = CAMPUS_ANCHORS[state.currentCampus] || CAMPUS_ANCHORS.seoul;
    container.innerHTML = cfg.zoneOptions
      .map((opt) => {
        const isActive = state.filters.zone === opt.zone;
        return `
          <button
            type="button"
            class="qchip zone-chip${isActive ? " is-active" : ""}"
            data-zone="${escapeHtml(opt.zone)}"
          >
            ${escapeHtml(opt.label)}
          </button>
        `;
      })
      .join("");
  }

  /**
   * 모달 내 생존 카드 8종 & 업종 멀티 칩 초기 생성
   */
  function buildFilterModalStaticDom() {
    const survivalGrid = document.getElementById("survivalGrid");
    if (survivalGrid) {
      survivalGrid.innerHTML = SURVIVAL_CARDS.map(
        (card) => `
          <button
            type="button"
            class="survival-card"
            data-survival-id="${escapeHtml(card.id)}"
          >
            <span class="scard-emoji" aria-hidden="true">${escapeHtml(
              card.emoji
            )}</span>
            <strong class="scard-title">${escapeHtml(card.title)}</strong>
            <span class="scard-sub">${escapeHtml(card.subtitle)}</span>
          </button>
        `
      ).join("");
    }

    const catContainer = document.getElementById("modalCategoryChips");
    if (catContainer) {
      const allBtn = `<button type="button" class="mchip is-active" data-category="all">전체</button>`;
      const catBtns = CATEGORY_LIST.map(
        (cat) => `
          <button type="button" class="mchip" data-category="${escapeHtml(cat)}">
            ${escapeHtml(CATEGORY_EMOJI_MAP[cat] || "")} ${escapeHtml(cat)}
          </button>
        `
      ).join("");
      catContainer.innerHTML = allBtn + catBtns;
    }
  }

  /**
   * 빠른 필터 칩, 방문시각 팝오버, 맞춤필터 배지, 모달 내 상태 UI 동기화
   */
  function syncFilterControlsUI(matchedCount) {
    const f = state.filters;

    // 1) 상단 빠른 칩 활성화 동기화
    const chipOpenOnly = document.getElementById("chipOpenOnly");
    if (chipOpenOnly) chipOpenOnly.classList.toggle("is-active", f.openOnly);

    const chipBookmarkedOnly = document.getElementById("chipBookmarkedOnly");
    const chipBookmarkedLabel = document.getElementById("chipBookmarkedLabel");
    if (chipBookmarkedOnly) {
      chipBookmarkedOnly.classList.toggle("is-active", f.bookmarkedOnly);
    }
    if (chipBookmarkedLabel) {
      const favCount = BookmarkStore.count();
      chipBookmarkedLabel.textContent =
        favCount > 0 ? `❤️ 찜한 곳 ${favCount}` : "❤️ 찜한 곳";
    }

    const chipVisitTime = document.getElementById("chipVisitTime");
    const chipVisitTimeLabel = document.getElementById("chipVisitTimeLabel");
    if (chipVisitTime) {
      chipVisitTime.classList.toggle("is-active", isVisitTimeSimulated());
    }
    if (chipVisitTimeLabel) {
      chipVisitTimeLabel.textContent = getVisitTimeDisplayLabel();
    }

    const chipB6 = document.getElementById("chipBudget6000");
    const chipB10 = document.getElementById("chipBudget10000");
    if (chipB6) chipB6.classList.toggle("is-active", f.budget === "6000");
    if (chipB10) chipB10.classList.toggle("is-active", f.budget === "10000");

    const chipRefill = document.getElementById("chipRefillOnly");
    if (chipRefill) chipRefill.classList.toggle("is-active", f.refillOnly);

    renderZoneQuickChips();

    // 2) [🎯 맞춤필터] 배지 숫자 동기화
    const activeDescriptors = getActiveFilterDescriptors();
    const filterBtn = document.getElementById("openFilterModalBtn");
    const badgeEl = document.getElementById("filterCountBadge");
    if (filterBtn && badgeEl) {
      const cnt = activeDescriptors.length;
      filterBtn.classList.toggle("has-active", cnt > 0);
      if (cnt > 0) {
        badgeEl.textContent = String(cnt);
        badgeEl.hidden = false;
      } else {
        badgeEl.hidden = true;
      }
    }

    // 3) 방문시각 미니 팝오버 내부 버튼 동기화
    document.querySelectorAll(".vtp-day-btn").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-day-mode") === f.visitDayMode
      );
    });
    document.querySelectorAll(".vtp-preset").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-time-preset") === f.visitTimeMode
      );
    });

    // 4) 모달 내부 상태 동기화
    document.querySelectorAll(".survival-card").forEach((cardEl) => {
      cardEl.classList.toggle(
        "is-active",
        cardEl.getAttribute("data-survival-id") === f.survivalCard
      );
    });

    const modalOpenChk = document.getElementById("modalOpenOnlyCheckbox");
    if (modalOpenChk) modalOpenChk.checked = f.openOnly;

    document.querySelectorAll("#modalTimePresets .mchip").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-modal-time") === f.visitTimeMode
      );
    });

    document.querySelectorAll("#modalCategoryChips .mchip").forEach((btn) => {
      const cat = btn.getAttribute("data-category");
      if (cat === "all") {
        btn.classList.toggle("is-active", f.categories.size === 0);
      } else {
        btn.classList.toggle("is-active", f.categories.has(cat));
      }
    });

    document.querySelectorAll("#modalDistanceChips .mchip").forEach((btn) => {
      const rVal = btn.getAttribute("data-radius");
      const active =
        rVal === "" ? f.maxDistance === null : Number(rVal) === f.maxDistance;
      btn.classList.toggle("is-active", active);
    });

    const anchorHintEl = document.getElementById("modalRadiusAnchorHint");
    if (anchorHintEl) {
      const ref = getActiveReferenceAnchor(state.currentCampus);
      anchorHintEl.textContent = `기준: ${ref.name}`;
    }

    const confirmedChk = document.getElementById("confirmedPriceOnlyCheckbox");
    if (confirmedChk) confirmedChk.checked = f.confirmedPriceOnly;

    const modalApplyBtn = document.getElementById("modalApplyBtn");
    if (modalApplyBtn) {
      modalApplyBtn.textContent = `조건에 맞는 맛집 ${matchedCount}곳 보기`;
    }

    // 5) 바텀시트 상단 활성 필터 요약 바 렌더링
    renderActiveFiltersBar(activeDescriptors);
  }

  /**
   * 바텀시트 최상단 활성 필터 요약 바 렌더링
   */
  function renderActiveFiltersBar(descriptors) {
    const barEl = document.getElementById("activeFiltersBar");
    if (!barEl) return;

    if (!descriptors || descriptors.length === 0) {
      barEl.hidden = true;
      barEl.innerHTML = "";
      return;
    }

    const chipsHtml = descriptors
      .map(
        (d) => `
        <button
          type="button"
          class="afb-chip"
          data-remove-filter="${escapeHtml(d.key)}"
          title="클릭하여 필터 해제"
        >
          <span>${escapeHtml(d.label)}</span>
          <span aria-hidden="true">✕</span>
        </button>
      `
      )
      .join("");

    barEl.innerHTML = `
      <div class="afb-chips">${chipsHtml}</div>
      <button type="button" class="afb-clear-all" id="afbClearAllBtn">전체 해제</button>
    `;
    barEl.hidden = false;
  }

  /* ==========================================================================
     Step 4: URL 딥링크 (?place=ID, ?campus=global) & 공유 링크 헬퍼
     ========================================================================== */

  function buildPlaceShareUrl(placeId) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("campus");
      url.searchParams.set("place", String(placeId));
      return url.toString();
    } catch (_) {
      return `${window.location.origin}${window.location.pathname}?place=${encodeURIComponent(
        String(placeId)
      )}`;
    }
  }

  function syncUrlQueryWithPlace(placeId) {
    try {
      const url = new URL(window.location.href);
      if (placeId !== null && placeId !== undefined && String(placeId) !== "") {
        url.searchParams.delete("campus");
        url.searchParams.set("place", String(placeId));
      } else {
        url.searchParams.delete("place");
      }
      window.history.replaceState(null, "", url.toString());
    } catch (_) {
      // ignore history API restrictions
    }
  }

  function applyInitialUrlDeepLink() {
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (_) {
      return false;
    }

    const campusParam = (params.get("campus") || "").trim().toLowerCase();
    const placeParam = (params.get("place") || "").trim();

    if (campusParam && CAMPUS_ANCHORS[campusParam]) {
      if (campusParam !== state.currentCampus) {
        switchCampus(campusParam, { animate: false });
      }
    }

    if (placeParam) {
      const targetPlace = state.places.find(
        (p) => String(p.id) === String(placeParam)
      );
      if (
        targetPlace &&
        !window.HoursEngine.getPlaceBusinessStatus(targetPlace).hidden
      ) {
        if (targetPlace.campus !== state.currentCampus) {
          switchCampus(targetPlace.campus, { animate: false });
        }
        selectPlace(targetPlace.id, { source: "deeplink" });
        return true;
      }
    }

    return false;
  }

  /* ==========================================================================
     Step 4: 한눈에 읽히는 5블록 식당 상세 시트 (#detailSheet)
     ========================================================================== */

  function isCafeteriaMenuLink(place) {
    if (!place) return false;
    const link = String(place.link || "").trim();
    return (
      place.category === "학식" ||
      /khucoop\.com|khu\.ac\.kr|dorm2\.khu\.ac\.kr/i.test(link)
    );
  }

  function formatBreakTimeDisplay(rawBreak) {
    return String(rawBreak || "")
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" / ");
  }

  function buildBizStateBadgeTitle(bizState) {
    switch (bizState) {
      case "open":
        return "🟢 영업 중";
      case "closing_soon":
        return "🟠 곧 마감";
      case "break":
        return "⏸ 브레이크타임";
      case "temp_closed":
        return "⚪ 임시휴업";
      case "unknown":
        return "⚪ 영업시간 확인 필요";
      default:
        return "⚪ 영업 종료";
    }
  }

  function renderDetailTipsListHtml(placeId) {
    const tips = TipStore.list(placeId);
    if (tips.length === 0) {
      return `<li class="tip-empty">아직 등록된 학우 팁이 없어요. 첫 솔직 꿀팁을 남겨주세요!</li>`;
    }

    return tips
      .map((tip) => {
        const meta = TipStore.RATINGS[tip.rating] || TipStore.RATINGS.god;
        const canDelete = TipStore.isMine(tip);
        return `
          <li class="tip-item" data-tip-id="${escapeHtml(tip.id)}">
            <div class="tip-item-head">
              <span class="tip-badge ${escapeHtml(meta.badgeClass)}">${escapeHtml(
          meta.label
        )}</span>
              <div class="tip-meta-right">
                <span class="tip-date">${escapeHtml(tip.createdAt || "")}</span>
                ${
                  canDelete
                    ? `<button type="button" class="tip-delete-btn" data-action="delete-tip" data-tip-id="${escapeHtml(
                        tip.id
                      )}">삭제</button>`
                    : ""
                }
              </div>
            </div>
            <p class="tip-content">${escapeHtml(tip.text)}</p>
          </li>
        `;
      })
      .join("");
  }

  function renderDetailSheet(
    place,
    options = { preserveScroll: false, preserveTipInput: false }
  ) {
    const scrollBody = document.getElementById("detailScrollBody");
    if (!scrollBody || !place) return;

    const prevScrollTop = options.preserveScroll ? scrollBody.scrollTop : 0;
    const prevTipInputVal = options.preserveTipInput
      ? document.getElementById("tipTextInput")?.value || ""
      : "";

    const refDate = getEffectiveRefDate();
    const biz = window.HoursEngine.getPlaceBusinessStatus(place, refDate);
    const verInfo = window.HoursEngine.evaluateVerifiedAt(
      place.verified_at,
      refDate
    );
    const isBookmarked = BookmarkStore.has(place.id);
    const campusLabel = place.campus === "global" ? "국제캠" : "서울캠";

    // 1) 가격 신뢰도 배지 & 제보 버튼 구성
    const isConfirmedPrice = place.price_status === "확정가격";
    const priceStatusBadgeHtml = isConfirmedPrice
      ? `<span class="pstatus-badge is-confirmed">✓ 확인된 가격${
          verInfo.isValid && !verInfo.isStale ? ` (${escapeHtml(verInfo.verifiedAt)})` : ""
        }</span>`
      : `<span class="pstatus-badge is-unconfirmed">⚠️ 최신 메뉴판 가격 제보 환영</span>`;

    const staleBadgeHtml = verInfo.isStale
      ? `<span class="pstatus-stale-badge">정보 업데이트 필요</span>`
      : "";

    const priceReportBtnHtml = isConfirmedPrice
      ? `<button type="button" class="btn-inline-price-report" id="detailReportPriceBtn" data-action="report-price">✏️ 가격 변동 제보</button>`
      : `<button type="button" class="btn-inline-price-report" id="detailReportPriceBtn" data-action="report-price">✏️ 실제 가격 제보하기</button>`;

    // 리필·혜택 항목 리스트
    const perksSegments = String(place.perks || "")
      .split(/[·+]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const perksBoxHtml =
      perksSegments.length > 0
        ? `<div class="dprice-perks-list">
            ${perksSegments
              .map(
                (seg) =>
                  `<div class="dprice-perk-item"><span aria-hidden="true">✨</span><span>${escapeHtml(
                    seg
                  )}</span></div>`
              )
              .join("")}
          </div>`
        : "";

    // 해시태그 칩 나열
    const tagsRowHtml =
      place.tagsList && place.tagsList.length > 0
        ? `<div class="detail-tags-row" aria-label="식당 태그">
            ${place.tagsList
              .map(
                (tag) =>
                  `<button type="button" class="detail-tag-chip" data-action="filter-tag" data-tag="${escapeHtml(
                    tag
                  )}">#${escapeHtml(tag)}</button>`
              )
              .join("")}
          </div>`
        : "";

    // 3) 실시간 영업시간 & 브레이크타임 상세 표
    const hoursScheduleText = place.hours_detail
      ? String(place.hours_detail)
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(" / ")
      : [place.days, place.hours]
          .map((s) => String(s || "").trim())
          .filter(Boolean)
          .join(" · ") || "현장 확인 필요";

    const formattedBreak = formatBreakTimeDisplay(place.break_time);
    const breakBannerHtml = formattedBreak
      ? `<div class="detail-break-highlight">⏸ 브레이크타임: ${escapeHtml(
          formattedBreak
        )}</div>`
      : "";

    const breakTableRowHtml = formattedBreak
      ? `<dt>브레이크</dt><dd class="is-break-em">⏸ ${escapeHtml(
          formattedBreak
        )}</dd>`
      : biz.state !== "unknown"
      ? `<dt>브레이크</dt><dd>브레이크타임 없음</dd>`
      : "";

    const lastOrderRowHtml = place.last_order
      ? `<dt>라스트오더</dt><dd>${escapeHtml(place.last_order)}</dd>`
      : "";

    const closedDaysRowHtml = place.closed_days
      ? `<dt>정기휴무</dt><dd>매주 ${escapeHtml(place.closed_days)} 휴무</dd>`
      : "";

    const noteRowHtml = place.note
      ? `<dt>참고 팁</dt><dd>${escapeHtml(place.note)}</dd>`
      : "";

    const simSuffix = isVisitTimeSimulated() ? " (시뮬레이션 기준)" : "";

    // 4) 위치 & 도보 예상 시간 (분속 67m 기준) & 외부 지도·식단표 바로가기
    const distCtx = getPlaceDistanceContext(place);
    const anchorName = place.nearestAnchor?.anchorName || "기준점";
    const anchorMeters = Number.isFinite(place.nearestAnchor?.meters)
      ? place.nearestAnchor.meters
      : distCtx.meters;
    const walkMinutes = Math.max(1, Math.round(anchorMeters / 67));
    const walkSummaryText = `${anchorName}에서 약 ${walkMinutes}분 · ${formatDistanceMeters(
      anchorMeters
    )}`;

    const addressText = place.address || "상세 주소 현장 확인";
    const naverSearchFallbackUrl = `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(
      `경희대 ${place.name}`
    )}`;
    const primaryLinkUrl = String(place.link || "").trim() || naverSearchFallbackUrl;
    const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent(
      place.name
    )},${place.lat},${place.lng}`;

    const isCoop = isCafeteriaMenuLink(place);
    const externalButtonsHtml = isCoop
      ? `
        <div class="dloc-ext-links">
          <a
            href="${escapeHtml(primaryLinkUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="ext-link-btn is-coop"
            id="detailMenuLinkBtn"
          >
            📋 금주 학식 식단표 보기
          </a>
          <div class="dloc-ext-row-2">
            <a
              href="${escapeHtml(naverSearchFallbackUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="ext-link-btn is-naver"
              id="detailNaverMapBtn"
            >
              🟢 네이버 지도 보기
            </a>
            <a
              href="${escapeHtml(kakaoRouteUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="ext-link-btn is-kakao"
              id="detailKakaoRouteBtn"
            >
              🟡 카카오맵 길찾기
            </a>
          </div>
        </div>
      `
      : `
        <div class="dloc-ext-links">
          <div class="dloc-ext-row-2">
            <a
              href="${escapeHtml(primaryLinkUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="ext-link-btn is-naver"
              id="detailMenuLinkBtn"
            >
              🟢 네이버 지도·메뉴판 보기
            </a>
            <a
              href="${escapeHtml(kakaoRouteUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="ext-link-btn is-kakao"
              id="detailKakaoRouteBtn"
            >
              🟡 카카오맵 길찾기
            </a>
          </div>
        </div>
      `;

    // 5) 학우 꿀팁 한줄평 (TipStore)
    const tipCount = TipStore.list(place.id).length;
    const activeRate = state.detailTipRating || "god";

    scrollBody.innerHTML = `
      <!-- [블록 1] 상단 타이틀 & 액션 헤더 -->
      <article class="detail-hero-card">
        <div class="dhero-top">
          <div class="dhero-title-col">
            <div class="dhero-badges">
              <span class="dhero-campus-pill">${escapeHtml(campusLabel)}</span>
              <span class="dhero-zone-cat">${escapeHtml(
                place.zone
              )} · ${escapeHtml(place.emoji)} ${escapeHtml(place.category)}</span>
            </div>
            <h2 class="dhero-name" id="detailPlaceName">${escapeHtml(
              place.name
            )}</h2>
          </div>

          <div class="dhero-actions">
            <button
              type="button"
              class="dhero-action-btn${isBookmarked ? " is-bookmarked" : ""}"
              id="detailBookmarkBtn"
              data-action="toggle-bookmark"
              aria-pressed="${String(isBookmarked)}"
              title="찜하기"
            >
              <span aria-hidden="true">${isBookmarked ? "❤️" : "🤍"}</span>
              <span>${isBookmarked ? "찜됨" : "찜하기"}</span>
            </button>
            <button
              type="button"
              class="dhero-action-btn"
              id="detailShareBtn"
              data-action="share-place"
              title="공유 링크 복사"
            >
              <span aria-hidden="true">🔗</span>
              <span>공유</span>
            </button>
          </div>
        </div>
        ${
          place.summary
            ? `<p class="dhero-summary">${escapeHtml(place.summary)}</p>`
            : ""
        }
      </article>

      <!-- [블록 2] 핵심 가격 & 리필·혜택 하이라이트 카드 -->
      <section class="detail-price-box" aria-label="가격 및 리필 혜택">
        <div class="dprice-trust-row">
          <div class="dprice-badges-left">
            ${priceStatusBadgeHtml}
            ${staleBadgeHtml}
          </div>
          ${priceReportBtnHtml}
        </div>

        <p class="dprice-main-menu">${escapeHtml(
          place.rep_menu || "대표 메뉴 현장 확인 필요"
        )}</p>

        ${perksBoxHtml}
        ${tagsRowHtml}
      </section>

      <!-- [블록 3] 실시간 영업시간 & 브레이크타임 상세 박스 -->
      <section class="detail-section-card" aria-label="영업시간 및 브레이크타임">
        <div class="dsec-title-row">
          <h3 class="dsec-heading">🕒 실시간 영업시간 &amp; 브레이크타임</h3>
        </div>

        <div class="detail-biz-banner">
          <span class="dbiz-pill state-${escapeHtml(biz.state)}">${escapeHtml(
      buildBizStateBadgeTitle(biz.state)
    )}</span>
          <span class="dbiz-detail-txt">${escapeHtml(
            biz.label + simSuffix
          )}</span>
        </div>

        ${breakBannerHtml}

        <dl class="dhours-table">
          <dt>영업일·시간</dt>
          <dd>${escapeHtml(hoursScheduleText)}</dd>
          ${breakTableRowHtml}
          ${lastOrderRowHtml}
          ${closedDaysRowHtml}
          ${noteRowHtml}
        </dl>
      </section>

      <!-- [블록 4] 위치 & 원터치 외부 지도·메뉴판 바로가기 바 -->
      <section class="detail-section-card" aria-label="위치 및 길찾기">
        <div class="dsec-title-row">
          <h3 class="dsec-heading">📍 위치 &amp; 길찾기 바로가기</h3>
          <span class="dloc-walk-pill">🚶 ${escapeHtml(walkSummaryText)}</span>
        </div>

        <div class="dloc-addr-row">
          <span class="dloc-addr-text" id="detailAddrText">${escapeHtml(
            addressText
          )}</span>
          <button
            type="button"
            class="dloc-copy-btn"
            id="detailCopyAddrBtn"
            data-action="copy-address"
          >
            주소 복사
          </button>
        </div>

        ${externalButtonsHtml}
      </section>

      <!-- [블록 5] 경희대 학우 꿀팁 한줄평 (TipStore) -->
      <section class="detail-section-card" aria-label="학우 꿀팁 한줄평">
        <div class="dsec-title-row">
          <h3 class="dsec-heading">💬 경희대 학우 꿀팁 한줄평</h3>
          <span class="dtips-count-badge" id="detailTipsCountBadge">${tipCount}개 팁</span>
        </div>

        <div class="tip-rating-group" role="radiogroup" aria-label="체감 가성비 선택">
          <button
            type="button"
            class="tip-rating-btn${activeRate === "god" ? " is-active" : ""}"
            data-action="select-tip-rating"
            data-rating="god"
          >
            💰 갓성비
          </button>
          <button
            type="button"
            class="tip-rating-btn${activeRate === "good" ? " is-active" : ""}"
            data-action="select-tip-rating"
            data-rating="good"
          >
            👍 무난해요
          </button>
          <button
            type="button"
            class="tip-rating-btn${activeRate === "up" ? " is-active" : ""}"
            data-action="select-tip-rating"
            data-rating="up"
          >
            🤔 가격 올랐어요
          </button>
        </div>

        <div class="tip-input-row">
          <input
            type="text"
            id="tipTextInput"
            class="tip-text-input"
            maxlength="120"
            placeholder="꿀팁 남기기 (예: 제육 양 진짜 많아요 / 12시엔 웨이팅)"
            aria-label="학우 한줄평 입력"
          />
          <button
            type="button"
            id="tipSubmitBtn"
            class="tip-submit-btn"
            data-action="submit-tip"
          >
            등록
          </button>
        </div>

        <ul class="tip-list" id="detailTipList">
          ${renderDetailTipsListHtml(place.id)}
        </ul>
      </section>
    `;

    if (options.preserveTipInput && prevTipInputVal) {
      const tipInputEl = document.getElementById("tipTextInput");
      if (tipInputEl) tipInputEl.value = prevTipInputVal;
    }

    scrollBody.scrollTop = prevScrollTop;
  }

  function closeDetailView(
    options = { clearSelection: false, updateUrl: true }
  ) {
    const sheetEl = document.getElementById("bottomSheet");
    const detailEl = document.getElementById("detailSheet");
    const prevSelectedId = state.selectedPlaceId;

    state.isDetailOpen = false;
    if (sheetEl) sheetEl.classList.remove("is-detail-mode");
    if (detailEl) detailEl.hidden = true;

    if (options.clearSelection) {
      state.selectedPlaceId = null;
      for (const [, record] of state.markerById.entries()) {
        record.marker.setZIndexOffset(0);
        const el = record.marker.getElement();
        if (el) {
          el.classList.remove("is-active-marker");
          const pinEl = el.querySelector(".capsule-pin");
          if (pinEl) pinEl.classList.remove("is-selected");
        }
      }
      const listEl = document.getElementById("placeList");
      if (listEl) {
        listEl
          .querySelectorAll(".place-card.is-selected")
          .forEach((el) => el.classList.remove("is-selected"));
      }
    }

    if (options.updateUrl) {
      syncUrlQueryWithPlace(null);
    }

    applySheetLayout(state.sheetSnap);

    if (!options.clearSelection && prevSelectedId) {
      requestAnimationFrame(() => {
        scrollCardIntoSheet(prevSelectedId, "auto");
      });
    }
  }

  function backToListView() {
    closeDetailView({ clearSelection: false, updateUrl: true });
  }

  function selectPlace(placeId, options = {}) {
    const { source = "programmatic" } = options;
    const idStr =
      placeId !== null && placeId !== undefined ? String(placeId) : null;

    if (!idStr) {
      clearPlaceSelection();
      return null;
    }

    let targetPlace = null;
    const foundInSorted = state.sortedCampusPlaces.find(
      (entry) => String(entry.place.id) === idStr
    );

    if (foundInSorted) {
      targetPlace = foundInSorted.place;
    } else {
      const anyPlace = state.places.find((p) => String(p.id) === idStr);
      if (
        !anyPlace ||
        window.HoursEngine.getPlaceBusinessStatus(anyPlace).hidden
      ) {
        return null;
      }
      if (anyPlace.campus !== state.currentCampus) {
        switchCampus(anyPlace.campus, { animate: false });
      }
      // 필터에 가려져 있었다면 필터를 풀고 표시
      if (!state.sortedCampusPlaces.some((e) => String(e.place.id) === idStr)) {
        state.filters = createDefaultFilters();
        refreshCampusView({ rebuildMarkers: true, resetScroll: false });
      }
      targetPlace = anyPlace;
    }

    state.selectedPlaceId = idStr;
    state.isDetailOpen = true;
    state.detailTipRating = "god";

    for (const [mId, record] of state.markerById.entries()) {
      const isTarget = mId === idStr;
      record.marker.setZIndexOffset(isTarget ? 2500 : 0);
      const el = record.marker.getElement();
      if (el) {
        el.classList.toggle("is-active-marker", isTarget);
        const pinEl = el.querySelector(".capsule-pin");
        if (pinEl) pinEl.classList.toggle("is-selected", isTarget);
      }
    }

    const listEl = document.getElementById("placeList");
    if (listEl) {
      listEl.querySelectorAll(".place-card").forEach((cardEl) => {
        const isTarget = cardEl.getAttribute("data-place-id") === idStr;
        cardEl.classList.toggle("is-selected", isTarget);
      });
    }

    const sheetEl = document.getElementById("bottomSheet");
    const detailEl = document.getElementById("detailSheet");
    if (sheetEl) sheetEl.classList.add("is-detail-mode");
    if (detailEl) detailEl.hidden = false;

    renderDetailSheet(targetPlace, {
      preserveScroll: false,
      preserveTipInput: false,
    });

    // 지도가 상단에 보이도록 collapsed나 full 상태면 half로 자연스럽게 스냅
    if (
      source === "marker" ||
      source === "card" ||
      source === "deeplink" ||
      state.sheetSnap === "collapsed"
    ) {
      setSheetSnap("half");
    } else {
      applySheetLayout(state.sheetSnap);
    }

    syncUrlQueryWithPlace(idStr);
    flyToPlaceWithOffset(targetPlace);

    return targetPlace;
  }

  function clearPlaceSelection() {
    closeDetailView({ clearSelection: true, updateUrl: true });
  }

  function buildCardBusinessLineHtml(place, biz) {
    let icon = "●";
    let text = biz.label;

    if (biz.state === "break") {
      icon = "⏸";
    } else if (biz.state === "unknown") {
      text = "영업시간 현장 확인";
    }

    const lastOrderHtml = place.last_order
      ? `<span class="card-last-order">(LO ${escapeHtml(
          place.last_order
        )})</span>`
      : "";

    return `
      <div class="card-line-2">
        <span class="biz-status-inline state-${escapeHtml(biz.state)}">
          <span aria-hidden="true">${icon}</span>
          <span>${escapeHtml(text)}</span>
        </span>
        ${lastOrderHtml}
      </div>
    `;
  }

  function renderPlaceCards(decoratedPlaces) {
    const listEl = document.getElementById("placeList");
    const emptyEl = document.getElementById("emptyStateBox");
    if (!listEl) return;

    if (decoratedPlaces.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    const htmlItems = decoratedPlaces.map(({ place, biz, distLabel }) => {
      const isSelected = state.selectedPlaceId === String(place.id);
      const isFav = BookmarkStore.has(place.id);
      const metaTag = `${place.shortZone} · ${place.shortCategory}`;
      const repMenuText =
        place.rep_menu || place.summary || "대표 메뉴 현장 확인";

      return `
        <li
          class="place-card${isSelected ? " is-selected" : ""}"
          data-place-id="${escapeHtml(place.id)}"
          tabindex="0"
          role="button"
          aria-label="${escapeHtml(place.name)} ${escapeHtml(
        place.priceTier.cardLabel
      )}"
        >
          <div class="card-line-1">
            <div class="card-title-wrap">
              <span class="card-meta-tag">${escapeHtml(metaTag)}</span>
              <h3 class="card-place-name">${escapeHtml(place.name)}</h3>
              ${
                isFav
                  ? '<span class="card-fav-heart" aria-label="찜한 식당">❤️</span>'
                  : ""
              }
              <span class="card-distance">${escapeHtml(distLabel)}</span>
            </div>
            <span class="card-price-badge ${escapeHtml(
              place.priceTier.tierClass
            )}">
              ${escapeHtml(place.priceTier.cardLabel)}
            </span>
          </div>

          ${buildCardBusinessLineHtml(place, biz)}

          <div class="card-line-3">
            ${
              place.perkHighlight
                ? `<span class="card-perk-chip">${escapeHtml(
                    place.perkHighlight
                  )}</span>`
                : ""
            }
            <span class="card-rep-menu">${escapeHtml(repMenuText)}</span>
          </div>
        </li>
      `;
    });

    listEl.innerHTML = htmlItems.join("");
  }

  function renderMapMarkers(decoratedPlaces) {
    if (!state.map || !state.markerLayer) return;

    state.markerLayer.clearLayers();
    state.markerById.clear();
    state.renderedMarkers = [];

    for (const { place, biz } of decoratedPlaces) {
      const isSelected = state.selectedPlaceId === String(place.id);
      const isDimmed =
        biz.state === "closed" ||
        biz.state === "temp_closed" ||
        biz.state === "break";

      const pinClasses = [
        "capsule-pin",
        place.priceTier.tierClass,
        isDimmed ? "is-dimmed" : "",
        isSelected ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const iconHtml = `
        <div class="${escapeHtml(pinClasses)}" data-place-id="${escapeHtml(
        place.id
      )}">
          <span class="capsule-emoji" aria-hidden="true">${escapeHtml(
            place.emoji
          )}</span>
          <span class="capsule-name">${escapeHtml(place.shortName)}</span>
          <span class="capsule-divider" aria-hidden="true"></span>
          <span class="capsule-badge">${escapeHtml(
            place.priceTier.pinLabel
          )}</span>
        </div>
      `;

      const divIcon = L.divIcon({
        className: `price-capsule-marker${
          isSelected ? " is-active-marker" : ""
        }`,
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([place.lat, place.lng], {
        icon: divIcon,
        title: `${place.name} (${place.priceTier.pinLabel})`,
        keyboard: true,
        zIndexOffset: isSelected ? 2500 : isDimmed ? -200 : 100,
      });

      marker.on("click", (ev) => {
        if (ev && ev.originalEvent) {
          ev.originalEvent.stopPropagation();
        }
        selectPlace(place.id, { source: "marker" });
      });

      marker.addTo(state.markerLayer);

      const record = { place, marker };
      state.markerById.set(String(place.id), record);
      state.renderedMarkers.push(record);
    }
  }

  function updateSheetHeaderSummary(campusKey, decoratedPlaces, refDate) {
    const campusCfg = CAMPUS_ANCHORS[campusKey];
    const totalCount = decoratedPlaces.length;
    const openCount = decoratedPlaces.filter(({ biz }) => biz.isOpen).length;

    const sheetTitleEl = document.getElementById("sheetTitle");
    if (sheetTitleEl) {
      sheetTitleEl.textContent = `${campusCfg.label} 가성비 맛집 ${totalCount}곳`;
    }

    const sheetOpenSubEl = document.getElementById("sheetOpenSub");
    if (sheetOpenSubEl) {
      const simulated = isVisitTimeSimulated();
      sheetOpenSubEl.classList.toggle("is-simulated", simulated);
      if (simulated) {
        const kst = window.HoursEngine.getKstParts(refDate);
        const hhmm = `${String(kst.hour).padStart(2, "0")}:${String(
          kst.minute
        ).padStart(2, "0")}`;
        sheetOpenSubEl.textContent = `· ${hhmm} 기준 영업 중 ${openCount}곳`;
      } else {
        sheetOpenSubEl.textContent = `· 지금 영업 중 ${openCount}곳`;
      }
    }

    const sortHintEl = document.getElementById("sortHint");
    if (sortHintEl) {
      sortHintEl.textContent = SORT_HINT_MAP[state.sortBy] || "";
    }
  }

  /**
   * 전체 뷰(마커, 반경 원, 카드 리스트, 상세 시트, 필터 컨트롤, 카운트) 일괄 갱신
   */
  function refreshCampusView(
    options = { rebuildMarkers: true, resetScroll: false }
  ) {
    const refDate = getEffectiveRefDate();
    const decorated = filterAndSortCampusPlaces(refDate);
    state.sortedCampusPlaces = decorated;

    // 현재 선택된 매장이 필터 결과에서 제외되었다면 상세 시트 및 선택 해제
    if (
      state.selectedPlaceId &&
      !decorated.some((d) => String(d.place.id) === state.selectedPlaceId)
    ) {
      closeDetailView({ clearSelection: true, updateUrl: true });
    } else if (state.isDetailOpen && state.selectedPlaceId) {
      const activeEntry = decorated.find(
        (d) => String(d.place.id) === state.selectedPlaceId
      );
      if (activeEntry) {
        renderDetailSheet(activeEntry.place, {
          preserveScroll: true,
          preserveTipInput: true,
        });
      }
    }

    syncRadiusCircles();
    if (options.rebuildMarkers) {
      renderMapMarkers(decorated);
    }
    renderPlaceCards(decorated);
    updateSheetHeaderSummary(state.currentCampus, decorated, refDate);
    syncFilterControlsUI(decorated.length);

    if (options.resetScroll) {
      const listScrollEl = document.getElementById("sheetListScroll");
      if (listScrollEl) listScrollEl.scrollTop = 0;
    }
  }

  function setSortBy(sortKey, shouldRefresh = true) {
    if (!["recommended", "price_asc", "distance_asc"].includes(sortKey)) return;
    state.sortBy = sortKey;

    document.querySelectorAll(".sort-tab").forEach((btn) => {
      const active = btn.getAttribute("data-sort") === sortKey;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    if (shouldRefresh) {
      refreshCampusView({ rebuildMarkers: false, resetScroll: true });
    }
  }

  function switchCampus(campusKey, options = { animate: true }) {
    if (!CAMPUS_ANCHORS[campusKey]) return;

    closeDetailView({ clearSelection: true, updateUrl: true });
    state.currentCampus = campusKey;
    state.filters.zone = "all";

    const seoulBtn = document.getElementById("btnCampusSeoul");
    const globalBtn = document.getElementById("btnCampusGlobal");

    if (seoulBtn && globalBtn) {
      const isSeoul = campusKey === "seoul";
      seoulBtn.classList.toggle("is-active", isSeoul);
      seoulBtn.setAttribute("aria-selected", String(isSeoul));
      globalBtn.classList.toggle("is-active", !isSeoul);
      globalBtn.setAttribute("aria-selected", String(!isSeoul));
    }

    refreshCampusView({ rebuildMarkers: true, resetScroll: true });

    if (state.map) {
      const target = CAMPUS_ANCHORS[campusKey];
      if (options.animate) {
        state.map.flyTo(target.center, target.zoom, {
          duration: 0.85,
          easeLinearity: 0.25,
        });
      } else {
        state.map.setView(target.center, target.zoom);
      }
    }
  }

  /* ==========================================================================
     팝오버 · 맞춤필터 모달 · ☰ 메뉴 모달 · 제보 모달 제어
     ========================================================================== */

  function toggleVisitTimePopover(forceOpen) {
    const pop = document.getElementById("visitTimePopover");
    const chip = document.getElementById("chipVisitTime");
    if (!pop) return;
    const willOpen = forceOpen !== undefined ? forceOpen : pop.hidden;
    pop.hidden = !willOpen;
    if (chip) chip.setAttribute("aria-expanded", String(willOpen));
  }

  function closeVisitTimePopover() {
    toggleVisitTimePopover(false);
  }

  function openFilterModal() {
    closeVisitTimePopover();
    closeMenuModal();
    closeReportModal();
    const modal = document.getElementById("filterModal");
    if (!modal) return;
    modal.hidden = false;
  }

  function closeFilterModal() {
    const modal = document.getElementById("filterModal");
    if (!modal) return;
    modal.hidden = true;
  }

  function updateMenuModalStats() {
    const activePlaces = state.places.filter(
      (p) => !window.HoursEngine.getPlaceBusinessStatus(p).hidden
    );
    const seoulCount = activePlaces.filter((p) => p.campus === "seoul").length;
    const globalCount = activePlaces.filter((p) => p.campus === "global").length;
    const ultraCount = activePlaces.filter((p) =>
      matchesBudgetRule(p, "6000")
    ).length;
    const favCount = BookmarkStore.count();
    const reportCount = ReportStore.list().length;

    const latestVerified = activePlaces
      .map((p) => String(p.verified_at || "").trim())
      .filter(Boolean)
      .sort()
      .pop();

    const elTotal = document.getElementById("statTotalPlaces");
    const elSplit = document.getElementById("statCampusSplit");
    const elUltra = document.getElementById("statUltraBudget");
    const elFav = document.getElementById("statMyBookmarks");
    const elVer = document.getElementById("menuVerifiedDateLabel");
    const elMyReports = document.getElementById("menuMyReportsBar");

    if (elTotal) elTotal.textContent = `${activePlaces.length}곳`;
    if (elSplit) elSplit.textContent = `${seoulCount} / ${globalCount}곳`;
    if (elUltra) elUltra.textContent = `${ultraCount}곳`;
    if (elFav) elFav.textContent = `${favCount}곳`;
    if (elVer && latestVerified) {
      elVer.textContent = `기준일 ${latestVerified}`;
    }

    if (elMyReports) {
      if (reportCount > 0) {
        elMyReports.textContent = `📮 내 브라우저에 저장된 제보 내역 ${reportCount}건이 있습니다.`;
        elMyReports.hidden = false;
      } else {
        elMyReports.hidden = true;
      }
    }
  }

  function openMenuModal() {
    closeVisitTimePopover();
    closeFilterModal();
    closeReportModal();
    updateMenuModalStats();
    const modal = document.getElementById("menuModal");
    if (modal) modal.hidden = false;
  }

  function closeMenuModal() {
    const modal = document.getElementById("menuModal");
    if (modal) modal.hidden = true;
  }

  function populateReportPlaceDatalist() {
    const dl = document.getElementById("reportPlaceDatalist");
    if (!dl) return;
    dl.innerHTML = state.places
      .map((p) => `<option value="${escapeHtml(p.name)}"></option>`)
      .join("");
  }

  function syncNewPlaceZoneOptions(campusKey) {
    const zoneSelect = document.getElementById("repNewZone");
    if (!zoneSelect) return;
    const zones =
      campusKey === "global"
        ? ["정건", "중상·영통", "교내"]
        : ["정문", "회기역", "후문·외대", "교내"];
    zoneSelect.innerHTML = zones
      .map((z) => `<option value="${escapeHtml(z)}">${escapeHtml(z)}</option>`)
      .join("");
  }

  function syncReportModifyCurrentHint(placeObjOrName) {
    const box = document.getElementById("repModCurrentBox");
    const hiddenId = document.getElementById("repModPlaceId");
    if (!box) return;

    let found = null;
    if (placeObjOrName && typeof placeObjOrName === "object") {
      found = placeObjOrName;
    } else if (typeof placeObjOrName === "string" && placeObjOrName.trim()) {
      const q = placeObjOrName.trim().toLowerCase();
      found = state.places.find((p) => p.name.toLowerCase() === q);
    }

    if (!found) {
      box.hidden = true;
      box.innerHTML = "";
      if (hiddenId) hiddenId.value = "";
      return;
    }

    if (hiddenId) hiddenId.value = String(found.id);
    const cName = found.campus === "global" ? "국제캠" : "서울캠";
    box.innerHTML = `
      <strong>현재 등록 정보 (${escapeHtml(cName)} · ${escapeHtml(
      found.zone
    )})</strong><br />
      메뉴·가격: ${escapeHtml(found.rep_menu || "미기재")} (${escapeHtml(
      found.price_status || "확인필요"
    )})
    `;
    box.hidden = false;
  }

  function switchReportTab(tabKey) {
    const mode = tabKey === "new" ? "new" : "modify";
    state.reportTab = mode;

    const tabMod = document.getElementById("tabReportModify");
    const tabNew = document.getElementById("tabReportNew");
    const formMod = document.getElementById("reportModifyForm");
    const formNew = document.getElementById("reportNewForm");
    const previewBox = document.getElementById("repPreviewResult");

    if (tabMod) {
      tabMod.classList.toggle("is-active", mode === "modify");
      tabMod.setAttribute("aria-selected", String(mode === "modify"));
    }
    if (tabNew) {
      tabNew.classList.toggle("is-active", mode === "new");
      tabNew.setAttribute("aria-selected", String(mode === "new"));
    }
    if (formMod) formMod.hidden = mode !== "modify";
    if (formNew) formNew.hidden = mode !== "new";
    if (previewBox) previewBox.hidden = true;
  }

  function openReportModal(options = {}) {
    const { tab = "modify", place = null } = options;
    closeVisitTimePopover();
    closeMenuModal();
    closeFilterModal();

    // REPORT_FORM_URL이 설정되어 있지 않을 때는 내장 #reportModal 오픈 (설정 시 제출 단계에서도 외부 폼 연결)
    const modal = document.getElementById("reportModal");
    if (!modal) {
      if (REPORT_FORM_URL.trim()) {
        window.open(REPORT_FORM_URL.trim(), "_blank", "noopener");
      }
      return;
    }

    populateReportPlaceDatalist();
    switchReportTab(tab);

    // 폼 초기화 및 자동 채움
    const modNameInput = document.getElementById("repModPlaceName");
    const modPriceInput = document.getElementById("repModPriceMenu");
    const modHoursInput = document.getElementById("repModHours");
    const modClosedCheck = document.getElementById("repModClosedCheck");
    const modNoteInput = document.getElementById("repModNote");

    if (modPriceInput) modPriceInput.value = "";
    if (modHoursInput) modHoursInput.value = "";
    if (modClosedCheck) modClosedCheck.checked = false;
    if (modNoteInput) modNoteInput.value = "";

    const targetPlace =
      place ||
      (state.selectedPlaceId
        ? state.places.find((p) => String(p.id) === String(state.selectedPlaceId))
        : null);

    if (tab === "modify" && targetPlace) {
      if (modNameInput) modNameInput.value = targetPlace.name;
      syncReportModifyCurrentHint(targetPlace);
      if (
        modPriceInput &&
        targetPlace.rep_menu &&
        targetPlace.price_status === "확정가격"
      ) {
        modPriceInput.placeholder = `현재: ${targetPlace.rep_menu}`;
      } else if (modPriceInput) {
        modPriceInput.placeholder =
          "예: 호카레 8,000원 · 등심돈까스카레 9,500원";
      }
    } else {
      if (modNameInput) modNameInput.value = "";
      syncReportModifyCurrentHint(null);
    }

    const newCampusSelect = document.getElementById("repNewCampus");
    if (newCampusSelect) {
      newCampusSelect.value = state.currentCampus;
      syncNewPlaceZoneOptions(state.currentCampus);
    }
    ["repNewMinPrice", "repNewName", "repNewMenuPrice", "repNewPerks", "repNewAddress"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      }
    );

    modal.hidden = false;
  }

  function closeReportModal() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.hidden = true;
  }

  function extractLowestPriceFromText(text) {
    const matches = String(text || "").match(/\d{1,3}(?:,\d{3})+|\d{4,6}/g);
    if (!matches) return "";
    const nums = matches
      .map((m) => Number(m.replace(/,/g, "")))
      .filter((n) => Number.isFinite(n) && n >= 500 && n <= 100000);
    if (nums.length === 0) return "";
    return String(Math.min(...nums));
  }

  async function handleReportSubmit() {
    const kstToday = window.HoursEngine.getKstParts(new Date()).dateString;

    if (state.reportTab === "modify") {
      const placeIdVal =
        document.getElementById("repModPlaceId")?.value.trim() || "";
      const placeName =
        document.getElementById("repModPlaceName")?.value.trim() || "";
      const priceMenu =
        document.getElementById("repModPriceMenu")?.value.trim() || "";
      const hoursChange =
        document.getElementById("repModHours")?.value.trim() || "";
      const isClosed = Boolean(
        document.getElementById("repModClosedCheck")?.checked
      );
      const extraNote =
        document.getElementById("repModNote")?.value.trim() || "";

      if (!placeName) {
        showToast("수정 제보할 식당 이름을 입력해주세요.");
        document.getElementById("repModPlaceName")?.focus();
        return;
      }
      if (!priceMenu && !hoursChange && !isClosed && !extraNote) {
        showToast("변경된 가격, 영업시간 또는 폐업 여부를 입력해주세요.");
        document.getElementById("repModPriceMenu")?.focus();
        return;
      }

      const existing =
        state.places.find((p) => String(p.id) === placeIdVal) ||
        state.places.find(
          (p) => p.name.toLowerCase() === placeName.toLowerCase()
        );

      const detectedPrice =
        extractLowestPriceFromText(priceMenu) ||
        (existing && existing.minPrice ? String(existing.minPrice) : "");

      const csvColumns = [
        existing ? existing.id : "수정확인",
        existing ? existing.campus : state.currentCampus,
        existing ? existing.zone : "",
        existing ? existing.category : "",
        placeName,
        detectedPrice,
        priceMenu || (existing ? existing.rep_menu : ""),
        existing ? existing.perks : "",
        priceMenu ? "확정가격" : existing ? existing.price_status : "단가확인필요",
        existing ? existing.tags : "",
        existing ? existing.summary : "",
        existing ? existing.address : "",
        existing ? existing.lat : "",
        existing ? existing.lng : "",
        existing ? existing.link : "",
        existing ? existing.days : "",
        hoursChange || (existing ? existing.hours : ""),
        existing ? existing.hours_detail : "",
        existing ? existing.break_time : "",
        existing ? existing.last_order : "",
        existing ? existing.closed_days : "",
        isClosed ? "폐업" : existing ? existing.status : "운영",
        kstToday,
        [extraNote, hoursChange ? `시간제보:${hoursChange}` : ""]
          .filter(Boolean)
          .join(" / ") || (existing ? existing.note : ""),
      ];

      const csvLine = csvColumns.map(csvEscapeField).join(",");
      const summaryLines = [
        `[경희대 거지맵 · 정보 수정 제보] (${kstToday})`,
        `- 식당명: ${placeName}${existing ? ` (ID: ${existing.id})` : ""}`,
        priceMenu ? `- 변경 메뉴/가격: ${priceMenu}` : null,
        hoursChange ? `- 영업시간/브레이크 변경: ${hoursChange}` : null,
        isClosed ? `- 상태 변경: ⚠️ 폐업/이전 제보` : null,
        extraNote ? `- 추가 팁: ${extraNote}` : null,
        ``,
        `[geojimap_master 시트 붙여넣기용 CSV 1줄]`,
        csvLine,
      ]
        .filter((line) => line !== null)
        .join("\n");

      state.lastCopiedReportText = summaryLines;
      await copyTextToClipboard(summaryLines);

      ReportStore.save({
        id: `rep_${Date.now()}`,
        type: "modify",
        placeName,
        createdAt: kstToday,
        summaryText: summaryLines,
        csvLine,
      });

      const previewBox = document.getElementById("repPreviewResult");
      const previewCode = document.getElementById("repPreviewCode");
      if (previewBox && previewCode) {
        previewCode.textContent = summaryLines;
        previewBox.hidden = false;
      }

      showToast("제보 내용이 클립보드에 복사·저장되었어요! 감사합니다 🙏", 2800);
      if (REPORT_FORM_URL.trim()) {
        window.open(REPORT_FORM_URL.trim(), "_blank", "noopener");
      }
      return;
    }

    // 탭 2: 새 가성비 맛집 추천
    const campus =
      document.getElementById("repNewCampus")?.value || state.currentCampus;
    const zone = document.getElementById("repNewZone")?.value || "정문";
    const category =
      document.getElementById("repNewCategory")?.value || "한식·백반";
    const rawMinPrice =
      document.getElementById("repNewMinPrice")?.value.trim() || "";
    const name = document.getElementById("repNewName")?.value.trim() || "";
    const menuPrice =
      document.getElementById("repNewMenuPrice")?.value.trim() || "";
    const perks = document.getElementById("repNewPerks")?.value.trim() || "";
    const address =
      document.getElementById("repNewAddress")?.value.trim() || "";

    if (!name) {
      showToast("추천할 식당 이름을 입력해주세요.");
      document.getElementById("repNewName")?.focus();
      return;
    }
    if (!menuPrice) {
      showToast("대표 메뉴와 가격을 입력해주세요.");
      document.getElementById("repNewMenuPrice")?.focus();
      return;
    }

    const minPrice = rawMinPrice || extractLowestPriceFromText(menuPrice);
    const numPrice = Number(minPrice);
    const autoTags = [];
    if (numPrice > 0 && numPrice <= 6000) autoTags.push("초가성비");
    if (numPrice > 0 && numPrice <= 10000) autoTags.push("만원이하");
    if (/밥.*리필|공기밥.*리필/.test(perks)) autoTags.push("밥리필");
    if (/곱빼기/.test(perks)) autoTags.push("곱빼기무료");
    if (/무한리필/.test(perks)) autoTags.push("무한리필");
    if (/혼밥|1인/.test(perks)) autoTags.push("혼밥가능");

    const nextId = state.places.length + ReportStore.list().length + 1;
    const searchLink = `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(
      `${campus === "global" ? "영통" : "회기"} ${name}`
    )}`;

    const csvColumns = [
      nextId,
      campus,
      zone,
      category,
      name,
      minPrice,
      menuPrice,
      perks || "학우 추천 가성비 맛집",
      minPrice ? "가격대·혜택확인" : "단가확인필요",
      autoTags.join(","),
      `${zone} 인근 학우 추천 ${category} 맛집`,
      address,
      "",
      "",
      searchLink,
      "현장 확인 필요",
      "",
      "",
      "",
      "",
      "",
      "운영",
      kstToday,
      "학우 신규 제보",
    ];

    const csvLine = csvColumns.map(csvEscapeField).join(",");
    const campusKor = campus === "global" ? "국제캠" : "서울캠";
    const summaryLines = [
      `[경희대 거지맵 · 신규 맛집 추천] (${kstToday})`,
      `- 캠퍼스/권역: ${campusKor} · ${zone} (${category})`,
      `- 식당명: ${name}`,
      `- 대표 메뉴/가격: ${menuPrice}${minPrice ? ` (최저 ${Number(minPrice).toLocaleString("ko-KR")}원)` : ""}`,
      perks ? `- 가성비 포인트: ${perks}` : null,
      address ? `- 위치/주소: ${address}` : null,
      ``,
      `[geojimap_master 시트 붙여넣기용 CSV 1줄]`,
      csvLine,
    ]
      .filter((line) => line !== null)
      .join("\n");

    state.lastCopiedReportText = summaryLines;
    await copyTextToClipboard(summaryLines);

    ReportStore.save({
      id: `rep_${Date.now()}`,
      type: "new",
      placeName: name,
      createdAt: kstToday,
      summaryText: summaryLines,
      csvLine,
    });

    const previewBox = document.getElementById("repPreviewResult");
    const previewCode = document.getElementById("repPreviewCode");
    if (previewBox && previewCode) {
      previewCode.textContent = summaryLines;
      previewBox.hidden = false;
    }

    showToast("추천 맛집 정보가 클립보드에 복사·저장되었어요! 감사합니다 🙏", 2800);
    if (REPORT_FORM_URL.trim()) {
      window.open(REPORT_FORM_URL.trim(), "_blank", "noopener");
    }
  }

  function showToast(message, durationMs = 2300) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.hidden = false;

    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, durationMs);
  }

  function handleLocateUser() {
    const locateBtn = document.getElementById("locateBtn");
    if (!navigator.geolocation) {
      showToast("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
      return;
    }

    if (locateBtn) locateBtn.classList.add("is-locating");
    showToast("현재 위치를 확인하고 있어요...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (locateBtn) locateBtn.classList.remove("is-locating");
        const { latitude, longitude } = pos.coords;
        state.userCoords = { lat: latitude, lng: longitude };

        if (!state.map) return;

        if (state.userLocationMarker) {
          state.userLocationMarker.setLatLng([latitude, longitude]);
        } else {
          const locIcon = L.divIcon({
            className: "user-location-marker",
            html: '<div class="user-loc-dot" title="내 위치"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          state.userLocationMarker = L.marker([latitude, longitude], {
            icon: locIcon,
            zIndexOffset: 1800,
          }).addTo(state.map);
        }

        const distSeoul = haversineMeters(
          latitude,
          longitude,
          CAMPUS_ANCHORS.seoul.center[0],
          CAMPUS_ANCHORS.seoul.center[1]
        );
        const distGlobal = haversineMeters(
          latitude,
          longitude,
          CAMPUS_ANCHORS.global.center[0],
          CAMPUS_ANCHORS.global.center[1]
        );
        const nearerCampus = distGlobal < distSeoul ? "global" : "seoul";

        if (
          nearerCampus !== state.currentCampus &&
          Math.min(distSeoul, distGlobal) <= 8000
        ) {
          switchCampus(nearerCampus, { animate: false });
        } else {
          refreshCampusView({ rebuildMarkers: true, resetScroll: false });
        }

        state.map.flyTo([latitude, longitude], 16, { duration: 0.75 });
        showToast("내 위치 기준으로 거리를 갱신했습니다.");
      },
      (err) => {
        if (locateBtn) locateBtn.classList.remove("is-locating");
        const msg =
          err && err.code === 1
            ? "위치 권한이 거부되었습니다. 브라우저 설정을 확인해주세요."
            : "현재 위치를 가져오지 못했습니다.";
        showToast(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  function initMap() {
    const initialCampus = CAMPUS_ANCHORS[state.currentCampus];

    const map = L.map("map", {
      center: initialCampus.center,
      zoom: initialCampus.zoom,
      zoomControl: false,
      minZoom: 11,
      maxZoom: 19,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    state.map = map;
    state.radiusLayer = L.layerGroup().addTo(map);
    state.markerLayer = L.layerGroup().addTo(map);

    map.on("click", () => {
      closeVisitTimePopover();
      if (state.selectedPlaceId !== null) {
        clearPlaceSelection();
      }
    });

    window.addEventListener("resize", () => {
      map.invalidateSize();
      applySheetLayout(state.sheetSnap);
    });
  }

  /* ==========================================================================
     이벤트 바인딩
     ========================================================================== */
  function bindEvents() {
    const seoulBtn = document.getElementById("btnCampusSeoul");
    const globalBtn = document.getElementById("btnCampusGlobal");
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const locateBtn = document.getElementById("locateBtn");
    const menuBtn = document.getElementById("menuBtn");
    const btnWide = document.getElementById("btnSheetMapWide");
    const btnFull = document.getElementById("btnSheetFullList");
    const placeListEl = document.getElementById("placeList");

    // 검색 입력바 & 지우기 버튼
    const searchInput = document.getElementById("searchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const val = searchInput.value.trim();
        state.filters.query = val;
        if (searchClearBtn) searchClearBtn.hidden = val.length === 0;
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.hidden = true;
        state.filters.query = "";
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
        searchInput.focus();
      });
    }

    // 빠른 칩: 영업 중만 / 찜한 곳 / 방문시각 / 예산 / 리필 / 권역
    const chipOpenOnly = document.getElementById("chipOpenOnly");
    if (chipOpenOnly) {
      chipOpenOnly.addEventListener("click", () => {
        state.filters.openOnly = !state.filters.openOnly;
        if (state.isDetailOpen) backToListView();
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    const chipBookmarkedOnly = document.getElementById("chipBookmarkedOnly");
    if (chipBookmarkedOnly) {
      chipBookmarkedOnly.addEventListener("click", () => {
        state.filters.bookmarkedOnly = !state.filters.bookmarkedOnly;
        if (state.isDetailOpen) backToListView();
        if (state.filters.bookmarkedOnly && BookmarkStore.count() === 0) {
          showToast("식당 상세에서 🤍 찜하기를 눌러 나만의 맛집을 모아보세요!");
        }
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    const chipVisitTime = document.getElementById("chipVisitTime");
    if (chipVisitTime) {
      chipVisitTime.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleVisitTimePopover();
      });
    }

    const vtpCloseBtn = document.getElementById("vtpCloseBtn");
    if (vtpCloseBtn) {
      vtpCloseBtn.addEventListener("click", closeVisitTimePopover);
    }

    document.querySelectorAll(".vtp-day-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dayMode = btn.getAttribute("data-day-mode");
        if (dayMode) {
          state.filters.visitDayMode = dayMode;
          refreshCampusView({ rebuildMarkers: true, resetScroll: false });
        }
      });
    });

    document.querySelectorAll(".vtp-preset").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-time-preset");
        if (!preset) return;
        state.filters.visitTimeMode = preset;
        if (preset === "now") {
          state.filters.visitDayMode = "today";
        }
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
        closeVisitTimePopover();
      });
    });

    const applyCustomTimeBtn = document.getElementById("applyCustomTimeBtn");
    const customVisitTimeInput = document.getElementById(
      "customVisitTimeInput"
    );
    if (applyCustomTimeBtn && customVisitTimeInput) {
      applyCustomTimeBtn.addEventListener("click", () => {
        if (customVisitTimeInput.value) {
          state.filters.customVisitTime = customVisitTimeInput.value;
          state.filters.visitTimeMode = "custom";
          refreshCampusView({ rebuildMarkers: true, resetScroll: true });
          closeVisitTimePopover();
        }
      });
    }

    // 예산 단일 토글 칩 (6천원 이하 / 1만원 이하)
    ["chipBudget6000", "chipBudget10000"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", () => {
        const b = el.getAttribute("data-budget");
        state.filters.budget = state.filters.budget === b ? null : b;
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    });

    const chipRefillOnly = document.getElementById("chipRefillOnly");
    if (chipRefillOnly) {
      chipRefillOnly.addEventListener("click", () => {
        state.filters.refillOnly = !state.filters.refillOnly;
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 권역 칩 클릭 위임 (해당 권역 기준점으로 지도 이동 + 거리 기준 전환)
    const zoneChipsInline = document.getElementById("zoneChipsInline");
    if (zoneChipsInline) {
      zoneChipsInline.addEventListener("click", (e) => {
        const zBtn = e.target.closest(".zone-chip");
        if (!zBtn) return;
        const targetZone = zBtn.getAttribute("data-zone") || "all";
        state.filters.zone =
          state.filters.zone === targetZone && targetZone !== "all"
            ? "all"
            : targetZone;

        refreshCampusView({ rebuildMarkers: true, resetScroll: true });

        if (state.map) {
          const cfg = CAMPUS_ANCHORS[state.currentCampus];
          if (state.filters.zone === "all") {
            state.map.flyTo(cfg.center, cfg.zoom, { duration: 0.65 });
          } else {
            const zAnchor = cfg.anchors[state.filters.zone];
            if (zAnchor) {
              state.map.flyTo([zAnchor.lat, zAnchor.lng], 16, {
                duration: 0.65,
              });
            }
          }
        }
      });
    }

    // 맞춤필터 모달 열기/닫기 ([🎯 맞춤필터]) 및 우측 상단 ☰ 메뉴 모달 연동
    const openFilterModalBtn = document.getElementById("openFilterModalBtn");
    const closeFilterModalBtn = document.getElementById("closeFilterModalBtn");
    const filterModal = document.getElementById("filterModal");
    const modalApplyBtn = document.getElementById("modalApplyBtn");
    const modalResetBtn = document.getElementById("modalResetBtn");

    if (openFilterModalBtn) {
      openFilterModalBtn.addEventListener("click", openFilterModal);
    }
    if (menuBtn) {
      menuBtn.addEventListener("click", openMenuModal);
    }
    if (closeFilterModalBtn) {
      closeFilterModalBtn.addEventListener("click", closeFilterModal);
    }
    if (filterModal) {
      filterModal.addEventListener("click", (e) => {
        if (e.target === filterModal) closeFilterModal();
      });
    }
    if (modalApplyBtn) {
      modalApplyBtn.addEventListener("click", () => {
        closeFilterModal();
        if (state.isDetailOpen) backToListView();
        if (state.sheetSnap === "collapsed") {
          setSheetSnap("half");
        }
      });
    }
    if (modalResetBtn) {
      modalResetBtn.addEventListener("click", () => {
        resetAllFilters({ flyToCampusCenter: true });
      });
    }

    // Step 4: 우측 상단 ☰ 메뉴 모달 (#menuModal) 이벤트
    const menuModal = document.getElementById("menuModal");
    const closeMenuModalBtn = document.getElementById("closeMenuModalBtn");
    const menuOpenNewPlaceBtn = document.getElementById("menuOpenNewPlaceBtn");
    const menuOpenPriceReportBtn = document.getElementById(
      "menuOpenPriceReportBtn"
    );
    const menuOpenSurvivalBtn = document.getElementById("menuOpenSurvivalBtn");

    if (closeMenuModalBtn) {
      closeMenuModalBtn.addEventListener("click", closeMenuModal);
    }
    if (menuModal) {
      menuModal.addEventListener("click", (e) => {
        if (e.target === menuModal) closeMenuModal();
      });
    }
    if (menuOpenNewPlaceBtn) {
      menuOpenNewPlaceBtn.addEventListener("click", () => {
        openReportModal({ tab: "new" });
      });
    }
    if (menuOpenPriceReportBtn) {
      menuOpenPriceReportBtn.addEventListener("click", () => {
        openReportModal({ tab: "modify" });
      });
    }
    if (menuOpenSurvivalBtn) {
      menuOpenSurvivalBtn.addEventListener("click", openFilterModal);
    }

    // Step 4: 가격 수정 · 신규 맛집 제보 모달 (#reportModal) 이벤트
    const reportModal = document.getElementById("reportModal");
    const closeReportModalBtn = document.getElementById("closeReportModalBtn");
    const cancelReportModalBtn = document.getElementById(
      "cancelReportModalBtn"
    );
    const tabReportModify = document.getElementById("tabReportModify");
    const tabReportNew = document.getElementById("tabReportNew");
    const repModPlaceName = document.getElementById("repModPlaceName");
    const repNewCampus = document.getElementById("repNewCampus");
    const submitReportBtn = document.getElementById("submitReportBtn");
    const repRecopyBtn = document.getElementById("repRecopyBtn");

    if (closeReportModalBtn) {
      closeReportModalBtn.addEventListener("click", closeReportModal);
    }
    if (cancelReportModalBtn) {
      cancelReportModalBtn.addEventListener("click", closeReportModal);
    }
    if (reportModal) {
      reportModal.addEventListener("click", (e) => {
        if (e.target === reportModal) closeReportModal();
      });
    }
    if (tabReportModify) {
      tabReportModify.addEventListener("click", () =>
        switchReportTab("modify")
      );
    }
    if (tabReportNew) {
      tabReportNew.addEventListener("click", () => switchReportTab("new"));
    }
    if (repModPlaceName) {
      repModPlaceName.addEventListener("input", () => {
        syncReportModifyCurrentHint(repModPlaceName.value);
      });
    }
    if (repNewCampus) {
      repNewCampus.addEventListener("change", () => {
        syncNewPlaceZoneOptions(repNewCampus.value);
      });
    }
    if (submitReportBtn) {
      submitReportBtn.addEventListener("click", () => {
        handleReportSubmit();
      });
    }
    if (repRecopyBtn) {
      repRecopyBtn.addEventListener("click", async () => {
        if (state.lastCopiedReportText) {
          await copyTextToClipboard(state.lastCopiedReportText);
          showToast("제보 텍스트와 CSV 포맷을 다시 복사했어요!");
        }
      });
    }

    // Step 4: 식당 상세 시트 (#detailSheet) 네비게이션 및 내부 액션 위임
    const detailBackBtn = document.getElementById("detailBackBtn");
    const detailExpandBtn = document.getElementById("detailExpandBtn");
    const detailCloseBtn = document.getElementById("detailCloseBtn");
    const detailScrollBody = document.getElementById("detailScrollBody");

    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", backToListView);
    }
    if (detailExpandBtn) {
      detailExpandBtn.addEventListener("click", () => {
        setSheetSnap(state.sheetSnap === "full" ? "half" : "full");
      });
    }
    if (detailCloseBtn) {
      detailCloseBtn.addEventListener("click", clearPlaceSelection);
    }

    const submitCurrentPlaceTip = () => {
      if (!state.selectedPlaceId) return;
      const tipInput = document.getElementById("tipTextInput");
      if (!tipInput) return;
      const val = tipInput.value.trim();
      if (!val) {
        showToast("한줄 꿀팁 내용을 입력해주세요!");
        tipInput.focus();
        return;
      }
      const created = TipStore.add(state.selectedPlaceId, {
        rating: state.detailTipRating || "god",
        text: val,
      });
      if (!created) return;

      tipInput.value = "";
      const tipListEl = document.getElementById("detailTipList");
      const countBadgeEl = document.getElementById("detailTipsCountBadge");
      if (tipListEl) {
        tipListEl.innerHTML = renderDetailTipsListHtml(state.selectedPlaceId);
      }
      if (countBadgeEl) {
        countBadgeEl.textContent = `${
          TipStore.list(state.selectedPlaceId).length
        }개 팁`;
      }
      showToast("소중한 학우 꿀팁이 등록되었어요 💬");
    };

    if (detailScrollBody) {
      detailScrollBody.addEventListener("click", async (e) => {
        const actionEl = e.target.closest("[data-action]");
        if (!actionEl || !state.selectedPlaceId) return;

        const currentPlace = state.places.find(
          (p) => String(p.id) === String(state.selectedPlaceId)
        );
        if (!currentPlace) return;

        const action = actionEl.getAttribute("data-action");

        if (action === "toggle-bookmark") {
          const added = BookmarkStore.toggle(currentPlace.id);
          showToast(
            added ? "찜한 맛집에 저장했어요 ❤️" : "찜 목록에서 해제했어요"
          );
          refreshCampusView({ rebuildMarkers: false, resetScroll: false });
          return;
        }

        if (action === "share-place") {
          const shareUrl = buildPlaceShareUrl(currentPlace.id);
          await copyTextToClipboard(shareUrl);
          showToast("링크가 복사되었어요!");
          return;
        }

        if (action === "report-price") {
          openReportModal({ tab: "modify", place: currentPlace });
          return;
        }

        if (action === "filter-tag") {
          const tag = actionEl.getAttribute("data-tag") || "";
          if (!tag) return;
          state.filters.query = tag;
          if (searchInput) searchInput.value = tag;
          if (searchClearBtn) searchClearBtn.hidden = false;
          closeDetailView({ clearSelection: true, updateUrl: true });
          refreshCampusView({ rebuildMarkers: true, resetScroll: true });
          if (state.sheetSnap === "collapsed") setSheetSnap("half");
          showToast(`#${tag} 태그로 필터링했어요`);
          return;
        }

        if (action === "copy-address") {
          const addr = currentPlace.address || currentPlace.name;
          await copyTextToClipboard(addr);
          showToast("주소가 복사되었어요!");
          return;
        }

        if (action === "select-tip-rating") {
          const rate = actionEl.getAttribute("data-rating") || "god";
          state.detailTipRating = rate;
          detailScrollBody
            .querySelectorAll(".tip-rating-btn")
            .forEach((btn) => {
              btn.classList.toggle(
                "is-active",
                btn.getAttribute("data-rating") === rate
              );
            });
          return;
        }

        if (action === "submit-tip") {
          submitCurrentPlaceTip();
          return;
        }

        if (action === "delete-tip") {
          const tipId = actionEl.getAttribute("data-tip-id");
          if (tipId && TipStore.remove(currentPlace.id, tipId)) {
            const tipListEl = document.getElementById("detailTipList");
            const countBadgeEl = document.getElementById(
              "detailTipsCountBadge"
            );
            if (tipListEl) {
              tipListEl.innerHTML = renderDetailTipsListHtml(currentPlace.id);
            }
            if (countBadgeEl) {
              countBadgeEl.textContent = `${
                TipStore.list(currentPlace.id).length
              }개 팁`;
            }
            showToast("한줄 팁을 삭제했어요");
          }
        }
      });

      detailScrollBody.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target && e.target.id === "tipTextInput") {
          e.preventDefault();
          submitCurrentPlaceTip();
        }
      });
    }

    // 생존 카드 8종 토글
    const survivalGrid = document.getElementById("survivalGrid");
    if (survivalGrid) {
      survivalGrid.addEventListener("click", (e) => {
        const cardBtn = e.target.closest(".survival-card");
        if (!cardBtn) return;
        const cardId = cardBtn.getAttribute("data-survival-id");
        const cardDef = SURVIVAL_CARDS.find((c) => c.id === cardId);
        if (!cardDef) return;

        if (state.filters.survivalCard === cardId) {
          state.filters.survivalCard = null;
          if (cardDef.sortOverride && state.sortBy === cardDef.sortOverride) {
            setSortBy("recommended", false);
          }
        } else {
          state.filters.survivalCard = cardId;
          if (cardDef.sortOverride) {
            setSortBy(cardDef.sortOverride, false);
          }
        }

        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 모달 내 방문시각 & 영업중 체크박스
    const modalOpenChk = document.getElementById("modalOpenOnlyCheckbox");
    if (modalOpenChk) {
      modalOpenChk.addEventListener("change", () => {
        state.filters.openOnly = modalOpenChk.checked;
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    const modalTimePresets = document.getElementById("modalTimePresets");
    if (modalTimePresets) {
      modalTimePresets.addEventListener("click", (e) => {
        const btn = e.target.closest(".mchip");
        if (!btn) return;
        const t = btn.getAttribute("data-modal-time");
        if (!t) return;
        state.filters.visitTimeMode = t;
        if (t === "now") state.filters.visitDayMode = "today";
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 모달 내 업종 다중 선택
    const modalCatChips = document.getElementById("modalCategoryChips");
    if (modalCatChips) {
      modalCatChips.addEventListener("click", (e) => {
        const btn = e.target.closest(".mchip");
        if (!btn) return;
        const cat = btn.getAttribute("data-category");
        if (!cat) return;

        if (cat === "all") {
          state.filters.categories.clear();
        } else {
          if (state.filters.categories.has(cat)) {
            state.filters.categories.delete(cat);
          } else {
            state.filters.categories.add(cat);
          }
        }
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 모달 내 거리 반경 선택 (L.circle 즉시 반영)
    const modalDistChips = document.getElementById("modalDistanceChips");
    if (modalDistChips) {
      modalDistChips.addEventListener("click", (e) => {
        const btn = e.target.closest(".mchip");
        if (!btn) return;
        const rawR = btn.getAttribute("data-radius");
        state.filters.maxDistance = rawR === "" ? null : Number(rawR);
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 모달 내 확정 가격 매장만 보기 체크박스
    const confirmedChk = document.getElementById("confirmedPriceOnlyCheckbox");
    if (confirmedChk) {
      confirmedChk.addEventListener("change", () => {
        state.filters.confirmedPriceOnly = confirmedChk.checked;
        refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      });
    }

    // 활성 필터 요약 바: 개별 칩 제거 및 전체 해제
    const activeFiltersBar = document.getElementById("activeFiltersBar");
    if (activeFiltersBar) {
      activeFiltersBar.addEventListener("click", (e) => {
        const clearAll = e.target.closest("#afbClearAllBtn");
        if (clearAll) {
          resetAllFilters({ flyToCampusCenter: true });
          return;
        }
        const chip = e.target.closest(".afb-chip");
        if (chip) {
          const key = chip.getAttribute("data-remove-filter");
          if (key) removeSingleFilter(key);
        }
      });
    }

    // 빈 상태 0건 안내 박스 내 [필터 전체 초기화] 원터치 버튼
    const emptyResetBtn = document.getElementById("emptyResetBtn");
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener("click", () => {
        resetAllFilters({ flyToCampusCenter: true });
      });
    }

    // 캠퍼스 토글
    if (seoulBtn) {
      seoulBtn.addEventListener("click", () => {
        if (state.currentCampus !== "seoul") {
          switchCampus("seoul", { animate: true });
        } else if (state.map) {
          clearPlaceSelection();
          state.map.flyTo(
            CAMPUS_ANCHORS.seoul.center,
            CAMPUS_ANCHORS.seoul.zoom,
            { duration: 0.65 }
          );
        }
      });
    }

    if (globalBtn) {
      globalBtn.addEventListener("click", () => {
        if (state.currentCampus !== "global") {
          switchCampus("global", { animate: true });
        } else if (state.map) {
          clearPlaceSelection();
          state.map.flyTo(
            CAMPUS_ANCHORS.global.center,
            CAMPUS_ANCHORS.global.zoom,
            { duration: 0.65 }
          );
        }
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        if (state.map) state.map.zoomIn();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        if (state.map) state.map.zoomOut();
      });
    }

    if (locateBtn) {
      locateBtn.addEventListener("click", handleLocateUser);
    }

    if (btnWide) {
      btnWide.addEventListener("click", () => {
        setSheetSnap(state.sheetSnap === "collapsed" ? "half" : "collapsed");
      });
    }

    if (btnFull) {
      btnFull.addEventListener("click", () => {
        setSheetSnap(state.sheetSnap === "full" ? "half" : "full");
      });
    }

    document.querySelectorAll(".sort-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sortKey = btn.getAttribute("data-sort");
        if (sortKey) setSortBy(sortKey);
      });
    });

    if (placeListEl) {
      placeListEl.addEventListener("click", (e) => {
        const cardEl = e.target.closest(".place-card");
        if (!cardEl) return;
        const placeId = cardEl.getAttribute("data-place-id");
        if (placeId) selectPlace(placeId, { source: "card" });
      });

      placeListEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const cardEl = e.target.closest(".place-card");
          if (!cardEl) return;
          e.preventDefault();
          const placeId = cardEl.getAttribute("data-place-id");
          if (placeId) selectPlace(placeId, { source: "card" });
        }
      });
    }

    // ESC 키로 모달/팝오버/상세시트 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeVisitTimePopover();
        closeFilterModal();
        closeMenuModal();
        closeReportModal();
      }
    });
  }

  async function initApp() {
    initMap();
    buildFilterModalStaticDom();
    initBottomSheetDrag();
    bindEvents();
    applySheetLayout("half");

    try {
      state.places = await loadPlacesData();
      refreshCampusView({ rebuildMarkers: true, resetScroll: true });
      const openedFromDeepLink = applyInitialUrlDeepLink();
      if (!openedFromDeepLink) {
        requestAnimationFrame(() => applySheetLayout(state.sheetSnap));
      }

      setInterval(() => {
        if (!isVisitTimeSimulated()) {
          refreshCampusView({ rebuildMarkers: true, resetScroll: false });
        }
      }, 60000);
    } catch (error) {
      console.error("[거지맵] 데이터 초기화 오류:", error);
      showToast("데이터를 불러오지 못했습니다.");
    }
  }

  window.KhuBeggarMap = {
    CAMPUS_ANCHORS,
    SURVIVAL_CARDS,
    BookmarkStore,
    TipStore,
    ReportStore,
    parseCSV,
    resolvePlaceCoordinates,
    haversineMeters,
    getState: () => state,
    getPlaces: () => state.places,
    getCurrentCampus: () => state.currentCampus,
    getRenderedMarkerCount: () => state.renderedMarkers.length,
    getSortedCampusPlaces: () => state.sortedCampusPlaces.map((d) => d.place),
    getEffectiveRefDate,
    buildPlaceShareUrl,
    switchCampus,
    setSortBy,
    setSheetSnap,
    selectPlace,
    backToListView,
    clearPlaceSelection,
    resetAllFilters,
    openFilterModal,
    closeFilterModal,
    openMenuModal,
    closeMenuModal,
    openReportModal,
    closeReportModal,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
