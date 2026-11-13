/**
 * 경희대 거지맵 — 실시간 KST 영업시간 & 다중 브레이크타임 엔진 (hours.js)
 * 기기 로컬 시간대와 무관하게 항상 Asia/Seoul (KST) 기준으로 판정합니다.
 */
(function (global) {
  "use strict";

  const KOR_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const KOR_DAY_TO_INDEX = {
    일: 0,
    월: 1,
    화: 2,
    수: 3,
    목: 4,
    금: 5,
    토: 6,
  };
  const ENG_WEEKDAY_TO_INDEX = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const kstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  /**
   * 임의 시각(Date | number | string)을 KST 구성요소로 변환
   */
  function getKstParts(refDate = new Date()) {
    const dateObj = refDate instanceof Date ? refDate : new Date(refDate);
    const safeDate = Number.isNaN(dateObj.getTime()) ? new Date() : dateObj;
    const parts = kstFormatter.formatToParts(safeDate);
    const map = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        map[part.type] = part.value;
      }
    }

    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    const hour = Number(map.hour) % 24;
    const minute = Number(map.minute);
    const second = Number(map.second);
    const weekday =
      ENG_WEEKDAY_TO_INDEX[map.weekday] !== undefined
        ? ENG_WEEKDAY_TO_INDEX[map.weekday]
        : new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    return {
      year,
      month,
      day,
      weekday,
      weekdayKor: KOR_DAYS[weekday],
      hour,
      minute,
      second,
      minutesOfDay: hour * 60 + minute,
      dateString: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    };
  }

  /**
   * 분(minute) 단위를 HH:MM 문자열로 포맷
   * keep24 Midnight 옵션이 true이고 정확히 1440분이면 "24:00" 반환
   */
  function formatMinutes(totalMin, keep24Midnight = false) {
    if (keep24Midnight && totalMin === 1440) {
      return "24:00";
    }
    const normalized = ((totalMin % 1440) + 1440) % 1440;
    const hh = Math.floor(normalized / 60);
    const mm = normalized % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  /**
   * 요일 범위 확장 (예: 월-금, 월-일, 토-일, 수-일 모두 순환 지원)
   */
  function expandDayRange(startChar, endChar) {
    const s = KOR_DAY_TO_INDEX[startChar];
    const e = KOR_DAY_TO_INDEX[endChar];
    if (s === undefined || e === undefined) return [];
    const result = [];
    let cur = s;
    for (let guard = 0; guard < 7; guard++) {
      result.push(cur);
      if (cur === e) break;
      cur = (cur + 1) % 7;
    }
    return result;
  }

  /**
   * 요일 표현 문자열에서 요일 인덱스 배열 추출
   */
  function parseDaySpec(daySpecRaw) {
    const spec = String(daySpecRaw || "").trim();
    if (!spec) return [];

    if (/매일|연중무휴|전일/.test(spec)) {
      return [0, 1, 2, 3, 4, 5, 6];
    }

    const daysSet = new Set();

    if (/평일/.test(spec)) {
      [1, 2, 3, 4, 5].forEach((d) => daysSet.add(d));
    }
    if (/주말/.test(spec)) {
      [0, 6].forEach((d) => daysSet.add(d));
    }

    // 범위 패턴: 월-금, 월~토, 토-일, 수-일 등
    const rangeRegex = /([일월화수목금토])(?:요일)?\s*[-~]\s*([일월화수목금토])(?:요일)?/g;
    let cleaned = spec;
    let match;
    while ((match = rangeRegex.exec(spec)) !== null) {
      expandDayRange(match[1], match[2]).forEach((d) => daysSet.add(d));
      cleaned = cleaned.replace(match[0], " ");
    }

    // 개별 요일 토큰: 월, 수, 금 / 화요일 등
    const singleRegex = /([일월화수목금토])(?:요일)?/g;
    while ((match = singleRegex.exec(cleaned)) !== null) {
      const idx = KOR_DAY_TO_INDEX[match[1]];
      if (idx !== undefined) daysSet.add(idx);
    }

    return Array.from(daysSet);
  }

  /**
   * closed_days 및 days 내 휴무 문구에서 휴무 요일 Set 추출
   */
  function parseClosedDays(closedDaysRaw, daysRaw) {
    const closedSet = new Set();
    const closedStr = String(closedDaysRaw || "").trim();

    if (closedStr && !/연중무휴|없음/.test(closedStr)) {
      // 격주/특정일 문구가 아닌 정기 요일 추출
      parseDaySpec(closedStr).forEach((d) => closedSet.add(d));
    }

    const daysStr = String(daysRaw || "").trim();
    if (daysStr) {
      if (/주말\s*휴무/.test(daysStr)) {
        closedSet.add(0);
        closedSet.add(6);
      }
      // "(일 휴무)", "매주 화요일 휴무", "토,일 휴무" 등 감지
      const holidayClauseRegex = /([일월화수목금토](?:요일)?(?:\s*[,·/]\s*[일월화수목금토](?:요일)?)*)\s*휴무/g;
      let m;
      while ((m = holidayClauseRegex.exec(daysStr)) !== null) {
        parseDaySpec(m[1]).forEach((d) => closedSet.add(d));
      }
    }

    return closedSet;
  }

  /**
   * 시간 구간 문자열 파싱 (24시간 영업 및 자정 넘김 16:00 ~ 00:30 지원)
   */
  function parseTimeIntervals(timeRaw) {
    const str = String(timeRaw || "").trim();
    if (!str) return [];

    // 확인 필요 / 불완전 표기 방어 (예: "오전 ~ 15:00경", "11:00 ~ (마감 확인 필요)")
    if (/확인\s*필요|미정|문의/.test(str)) {
      return [];
    }

    if (/24\s*시간/.test(str)) {
      return [
        {
          startMin: 0,
          endMin: 1440,
          is24h: true,
          startText: "00:00",
          endText: "24:00",
        },
      ];
    }

    const intervals = [];
    const timeRangeRegex = /(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/g;
    let match;
    while ((match = timeRangeRegex.exec(str)) !== null) {
      const h1 = Number(match[1]);
      const m1 = Number(match[2]);
      const h2 = Number(match[3]);
      const m2 = Number(match[4]);

      if (h1 > 24 || m1 > 59 || h2 > 24 || m2 > 59) continue;
      if (h1 === 24 && m1 > 0) continue;
      if (h2 === 24 && m2 > 0) continue;

      const startMin = h1 === 24 ? 0 : h1 * 60 + m1;
      let endMin = h2 === 24 && m2 === 0 ? 1440 : h2 * 60 + m2;

      const is24h = startMin === 0 && endMin === 1440;
      if (!is24h && endMin <= startMin) {
        // 자정 넘김 영업 (예: 16:00 ~ 00:30 -> 960 ~ 1470)
        endMin += 1440;
      }

      intervals.push({
        startMin,
        endMin,
        is24h,
        startText: formatMinutes(startMin, false),
        endText: formatMinutes(endMin, endMin === 1440),
      });
    }

    intervals.sort((a, b) => a.startMin - b.startMin);
    return intervals;
  }

  /**
   * [거지맵 핵심 기능] 세미콜론(;)으로 구분된 복수 브레이크타임 구간 배열 파싱
   * 예: "10:00-11:00; 14:00-17:00" 또는 "15:00-16:30"
   */
  function parseBreakTimes(breakTimeRaw) {
    const raw = String(breakTimeRaw || "").trim();
    if (!raw || /없음|해당없음|- ===/.test(raw)) return [];

    const segments = raw
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const breaks = [];
    for (const seg of segments) {
      const parsed = parseTimeIntervals(seg);
      for (const item of parsed) {
        breaks.push({
          startMin: item.startMin,
          endMin: item.endMin,
          startText: item.startText,
          endText: formatMinutes(item.endMin, false),
        });
      }
    }

    breaks.sort((a, b) => a.startMin - b.startMin);
    return breaks;
  }

  /**
   * 장소 객체에서 요일별 영업 스케줄 구축 (hours_detail 우선, 없으면 days + hours 파싱)
   */
  function parseSchedule(place) {
    const byDay = Array.from({ length: 7 }, () => []);
    if (!place || typeof place !== "object") {
      return { valid: false, byDay };
    }

    const hoursDetail = String(place.hours_detail || "").trim();
    const daysRaw = String(place.days || "").trim();
    const hoursRaw = String(place.hours || "").trim();
    const closedSet = parseClosedDays(place.closed_days, daysRaw);

    let parsedAny = false;

    // 1순위: hours_detail 파싱 (예: "월-금 10:00-22:00; 토-일 10:30-21:00")
    if (hoursDetail && !/확인\s*필요/.test(hoursDetail)) {
      const clauses = hoursDetail
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean);

      for (const clause of clauses) {
        const intervals = parseTimeIntervals(clause);
        if (intervals.length === 0) continue;

        // 시간 부분 이전의 요일 문자열 분리
        const firstTimeIdx = clause.search(/(\d{1,2}:\d{2}|24\s*시간)/);
        const dayPart = firstTimeIdx > 0 ? clause.slice(0, firstTimeIdx).trim() : "매일";
        const activeDays = parseDaySpec(dayPart);
        const targetDays = activeDays.length > 0 ? activeDays : [0, 1, 2, 3, 4, 5, 6];

        for (const d of targetDays) {
          for (const iv of intervals) {
            byDay[d].push({ ...iv });
            parsedAny = true;
          }
        }
      }
    }

    // 2순위: hours_detail이 없거나 파싱 실패 시 days + hours 조합 파싱
    if (!parsedAny) {
      if (
        !hoursRaw ||
        /확인\s*필요|미정|문의/.test(daysRaw) ||
        /확인\s*필요|미정|문의/.test(hoursRaw)
      ) {
        return { valid: false, byDay };
      }

      const intervals = parseTimeIntervals(hoursRaw);
      if (intervals.length === 0) {
        return { valid: false, byDay };
      }

      // 괄호 안 휴무 안내 제거 후 영업 요일 추출
      const daysWithoutParen = daysRaw.replace(/\([^)]*\)/g, " ").trim();
      let activeDays = [];

      if (!daysWithoutParen || /휴무/.test(daysWithoutParen)) {
        // "매주 화요일 휴무"처럼 휴무일만 명시된 경우 전체 요일에서 시작해 closedSet으로 차감
        const withoutHolidayPhrase = daysWithoutParen
          .replace(/매주\s*[일월화수목금토](?:요일)?\s*휴무/g, "")
          .replace(/[일월화수목금토](?:요일)?\s*휴무/g, "")
          .trim();
        activeDays = withoutHolidayPhrase
          ? parseDaySpec(withoutHolidayPhrase)
          : [0, 1, 2, 3, 4, 5, 6];
      } else {
        activeDays = parseDaySpec(daysWithoutParen);
      }

      if (activeDays.length === 0) {
        activeDays = [0, 1, 2, 3, 4, 5, 6];
      }

      for (const d of activeDays) {
        for (const iv of intervals) {
          byDay[d].push({ ...iv });
          parsedAny = true;
        }
      }
    }

    if (!parsedAny) {
      return { valid: false, byDay };
    }

    // 정기 휴무일(closed_days 및 휴무 명시 요일) 제외
    for (const closedDay of closedSet) {
      byDay[closedDay] = [];
    }

    for (let d = 0; d < 7; d++) {
      byDay[d].sort((a, b) => a.startMin - b.startMin);
    }

    const hasAnyOpenDay = byDay.some((arr) => arr.length > 0);
    return { valid: hasAnyOpenDay, byDay };
  }

  /**
   * 다음 오픈 시각 탐색 (최대 7일 후까지)
   */
  function findNextOpenInfo(byDay, currentWeekday, nowMin) {
    const todayHasShifts = byDay[currentWeekday] && byDay[currentWeekday].length > 0;

    // 1) 오늘 아직 시작 전인 영업 구간 확인
    if (todayHasShifts) {
      for (const shift of byDay[currentWeekday]) {
        if (shift.startMin > nowMin) {
          return {
            dayOffset: 0,
            weekday: currentWeekday,
            openText: shift.startText,
            label: `영업 전 · ${shift.startText} 오픈`,
          };
        }
      }
    }

    // 2) 내일 ~ 7일 이내 가장 빠른 오픈 구간 확인
    for (let offset = 1; offset <= 7; offset++) {
      const targetDay = (currentWeekday + offset) % 7;
      const shifts = byDay[targetDay];
      if (shifts && shifts.length > 0) {
        const firstShift = shifts[0];
        const prefix = todayHasShifts ? "영업 종료" : "오늘 휴무";
        const dayLabel = offset === 1 ? "내일" : KOR_DAYS[targetDay];
        return {
          dayOffset: offset,
          weekday: targetDay,
          openText: firstShift.startText,
          label: `${prefix} · ${dayLabel} ${firstShift.startText} 오픈`,
        };
      }
    }

    return null;
  }

  /**
   * 매장의 실시간 영업 상태 판정 (KST 기준)
   * @param {Object} place - CSV/시트에서 파싱된 매장 데이터 객체
   * @param {Date|string|number} [refDate=new Date()] - 기준 시각
   */
  function getPlaceBusinessStatus(place, refDate = new Date()) {
    if (!place || typeof place !== "object") {
      return {
        hidden: false,
        state: "unknown",
        badgeTone: "muted",
        label: "영업시간 확인 필요",
        shortLabel: "확인 필요",
        isOpen: false,
        breakIntervals: [],
      };
    }

    const rawStatus = String(place.status || "운영").trim();

    // 1. 폐업 / 임시휴업 우선 처리
    if (rawStatus === "폐업") {
      return {
        hidden: true,
        state: "closed_permanently",
        badgeTone: "gray",
        label: "폐업",
        shortLabel: "폐업",
        isOpen: false,
        breakIntervals: [],
      };
    }

    if (rawStatus === "임시휴업") {
      return {
        hidden: false,
        state: "temp_closed",
        badgeTone: "gray",
        label: "임시휴업",
        shortLabel: "임시휴업",
        isOpen: false,
        breakIntervals: [],
      };
    }

    const kst = getKstParts(refDate);
    const breakIntervals = parseBreakTimes(place.break_time);
    const schedule = parseSchedule(place);

    // 5. 해석 불가능하거나 "현장 확인 필요"인 경우 안전하게 unknown 반환
    if (!schedule.valid) {
      return {
        hidden: false,
        state: "unknown",
        badgeTone: "muted",
        label: "영업시간 확인 필요",
        shortLabel: "확인 필요",
        isOpen: false,
        breakIntervals,
        kst,
      };
    }

    const { weekday, minutesOfDay: nowMin } = kst;
    const yesterday = (weekday + 6) % 7;

    // 현재 시각에 걸친 활성 영업 구간 탐색 (전날 자정 넘김 영업 우선 확인 후 당일 확인)
    let activeContext = null;

    for (const shift of schedule.byDay[yesterday]) {
      if (shift.endMin > 1440) {
        const relNow = nowMin + 1440;
        if (relNow >= shift.startMin && relNow < shift.endMin) {
          activeContext = { shift, relNow, shiftDay: yesterday };
          break;
        }
      }
    }

    if (!activeContext) {
      for (const shift of schedule.byDay[weekday]) {
        if (nowMin >= shift.startMin && nowMin < shift.endMin) {
          activeContext = { shift, relNow: nowMin, shiftDay: weekday };
          break;
        }
      }
    }

    // 현재 영업 시간대 내부인 경우 -> 다중 브레이크타임 및 마감 임박 판정
    if (activeContext) {
      const { shift, relNow } = activeContext;

      // 3. 다중 브레이크타임 구간 체크
      for (const brk of breakIntervals) {
        const brkStart = relNow >= 1440 && brk.startMin < shift.startMin ? brk.startMin + 1440 : brk.startMin;
        const brkEnd = relNow >= 1440 && brk.endMin <= shift.startMin ? brk.endMin + 1440 : brk.endMin;
        if (relNow >= brkStart && relNow < brkEnd) {
          return {
            hidden: false,
            state: "break",
            badgeTone: "blue",
            label: `브레이크 · ${brk.endText} 재오픈`,
            shortLabel: "브레이크",
            reopenAt: brk.endText,
            isOpen: false,
            breakIntervals,
            kst,
          };
        }
      }

      // 24시간 영업 처리 (다음 날도 24시간 영업이면 상시 오픈)
      const tomorrow = (weekday + 1) % 7;
      const tomorrowHas24h = schedule.byDay[tomorrow].some((s) => s.is24h);
      if (shift.is24h && tomorrowHas24h) {
        return {
          hidden: false,
          state: "open",
          badgeTone: "green",
          label: "영업 중 · 24시간",
          shortLabel: "영업 중",
          closeAt: "24:00",
          isOpen: true,
          breakIntervals,
          kst,
        };
      }

      const remainingMinutes = shift.endMin - relNow;

      // 4. 마감 60분 전 이내: closing_soon
      if (remainingMinutes > 0 && remainingMinutes <= 60) {
        return {
          hidden: false,
          state: "closing_soon",
          badgeTone: "orange",
          label: `곧 마감 · ${remainingMinutes}분 남음`,
          shortLabel: "곧 마감",
          remainingMinutes,
          closeAt: shift.endText,
          isOpen: true,
          breakIntervals,
          kst,
        };
      }

      return {
        hidden: false,
        state: "open",
        badgeTone: "green",
        label: `영업 중 · ${shift.endText} 마감`,
        shortLabel: "영업 중",
        remainingMinutes,
        closeAt: shift.endText,
        isOpen: true,
        breakIntervals,
        kst,
      };
    }

    // 영업 전 / 영업 종료 / 정기 휴무 -> 다음 오픈 시각 안내
    const nextOpen = findNextOpenInfo(schedule.byDay, weekday, nowMin);
    return {
      hidden: false,
      state: "closed",
      badgeTone: "gray",
      label: nextOpen ? nextOpen.label : "영업 종료",
      shortLabel: "영업 종료",
      nextOpen,
      isOpen: false,
      breakIntervals,
      kst,
    };
  }

  /**
   * 6. 확인일(verified_at)로부터 60일 경과 여부 검증 (KST 날짜 기준)
   */
  function evaluateVerifiedAt(verified_at, refDate = new Date()) {
    const raw = String(verified_at || "").trim();
    const match = raw.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
    if (!match) {
      return {
        isStale: true,
        daysElapsed: null,
        verifiedAt: null,
        isValid: false,
      };
    }

    const vYear = Number(match[1]);
    const vMonth = Number(match[2]);
    const vDay = Number(match[3]);
    const verifiedUtcMs = Date.UTC(vYear, vMonth - 1, vDay);

    const kstNow = getKstParts(refDate);
    const refUtcMs = Date.UTC(kstNow.year, kstNow.month - 1, kstNow.day);

    const daysElapsed = Math.floor((refUtcMs - verifiedUtcMs) / 86400000);
    const normalized = `${String(vYear).padStart(4, "0")}-${String(vMonth).padStart(2, "0")}-${String(vDay).padStart(2, "0")}`;

    return {
      isStale: daysElapsed >= 60,
      daysElapsed,
      verifiedAt: normalized,
      isValid: true,
    };
  }

  global.HoursEngine = {
    getKstParts,
    parseBreakTimes,
    parseSchedule,
    getPlaceBusinessStatus,
    evaluateVerifiedAt,
  };
})(window);
