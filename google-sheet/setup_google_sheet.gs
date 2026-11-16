/**
 * ============================================================================
 * 🍚 경희대 거지맵 — 마스터 구글 시트 원클릭 자동 구축 스크립트 (setup_google_sheet.gs)
 * ============================================================================
 * [1분 설치 방법]
 * 1. 새 구글 스프레드시트 열기 (주소창에 https://sheets.new 입력)
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 파일 내용을 통째로 붙여넣은 뒤 저장(Cmd+S / Ctrl+S)
 * 4. 상단 함수 선택창에서 [setupGeojimapSheet] 선택 후 [▶ 실행] 클릭 (최초 1회 권한 허용)
 * 5. 시트로 돌아오면 38곳 전체 데이터 + 드롭다운 + 색상 서식 + [🍚 거지맵 관리] 메뉴가 완성됩니다!
 * ============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🍚 거지맵 관리")
    .addItem("➕ 맨 아래 새 식당 행 추가", "appendNewRestaurantTemplateRow")
    .addItem("📍 빈 위도·경도(lat/lng) 주소로 자동 채우기", "fillMissingCoordinatesFromAddress")
    .addSeparator()
    .addItem("🔗 웹앱(app.js) 자동연동 코드 확인·복사", "showWebAppConnectModal")
    .addItem("🎨 드롭다운·색상 서식 다시 적용", "applySheetFormattingOnly")
    .addSeparator()
    .addItem("🚀 초기 38곳 마스터 시트 전체 세팅(초기화)", "setupGeojimapSheet")
    .addToUi();
}

/**
 * [최초 1회 실행] 식당목록(38곳) + 입력가이드 탭 + 드롭다운 + 조건부 서식을 한 번에 생성합니다.
 */
function setupGeojimapSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename("경희대 거지맵 마스터 시트 (서울·국제캠)");

  // 1. 첫 번째 시트를 '식당목록'으로 준비
  var sheet = ss.getSheetByName("식당목록");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("식당목록");
  }

  // 기존 데이터 행이 이미 있으면 덮어쓸지 확인 (UI 컨텍스트가 있을 때만)
  if (sheet.getLastRow() > 1) {
    try {
      var ui = SpreadsheetApp.getUi();
      var resp = ui.alert(
        "초기 38곳 데이터 세팅",
        "현재 '식당목록' 시트에 데이터가 있습니다. 기본 38곳 초기 데이터로 새로 세팅할까요?",
        ui.ButtonSet.YES_NO
      );
      if (resp !== ui.Button.YES) {
        return;
      }
    } catch (e) {
      // Apps Script 에디터에서 직접 최초 실행 시 그대로 진행
    }
  }

  sheet.clear();
  sheet.clearConditionalFormatRules();

  var headers = getMasterHeaders_();
  var initialRows = getInitial38Places_();
  var allValues = [headers].concat(initialRows);

  sheet.getRange(1, 1, allValues.length, headers.length).setValues(allValues);

  // 서식·드롭다운·메모 적용
  applyMasterFormatting_(sheet);

  // 2. 두 번째 시트 '📘 입력가이드' 생성
  buildGuideSheet_(ss);

  // 첫 번째 시트 활성화 및 메뉴 생성
  ss.setActiveSheet(sheet);
  try {
    onOpen();
    showWebAppConnectModal();
  } catch (e) {
    Logger.log("초기 세팅 완료! 시트 URL: " + ss.getUrl());
  }
}

/**
 * 데이터는 유지한 채 드롭다운·컬럼폭·색상 서식만 다시 깔끔하게 입힙니다.
 */
function applySheetFormattingOnly() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("식당목록") || ss.getSheets()[0];
  applyMasterFormatting_(sheet);
  SpreadsheetApp.getActiveSpreadsheet().toast("드롭다운과 색상 서식을 다시 적용했습니다 ✨", "거지맵 관리", 4);
}

/**
 * 맨 아래에 새 식당 입력용 행(자동 ID + 오늘 날짜 + 기본 상태)을 추가합니다.
 */
function appendNewRestaurantTemplateRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("식당목록") || ss.getSheets()[0];
  var lastRow = Math.max(sheet.getLastRow(), 1);

  var nextId = 1;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var n = parseInt(ids[i][0], 10);
      if (!isNaN(n) && n >= nextId) {
        nextId = n + 1;
      }
    }
  }

  var todayKst = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
  var newRow = [
    nextId,        // id
    "seoul",       // campus (seoul / global)
    "정문",        // zone
    "한식·백반",   // category
    "",            // name (식당명 입력!)
    "",            // min_price (숫자만 예: 6000)
    "",            // rep_menu
    "",            // perks
    "확정가격",    // price_status
    "혼밥가능,만원이하", // tags
    "",            // summary
    "",            // address (주소만 적고 메뉴에서 위경도 자동채우기 가능!)
    "",            // lat
    "",            // lng
    "",            // link
    "매일",        // days
    "",            // hours
    "",            // hours_detail
    "",            // break_time
    "",            // last_order
    "",            // closed_days
    "운영",        // status
    todayKst,      // verified_at
    ""             // note
  ];

  var targetRow = lastRow + 1;
  sheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);
  sheet.setActiveSelection(sheet.getRange(targetRow, 5)); // 식당명(E열) 셀로 바로 포커스!
  ss.toast(targetRow + "행이 추가되었습니다! 식당명(E열)부터 입력해 주세요.", "새 식당 추가", 5);
}

/**
 * 주소(L열)는 적혀 있는데 위도(M열)·경도(N열)가 비어 있는 행을 찾아 자동으로 좌표를 채웁니다.
 */
function fillMissingCoordinatesFromAddress() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("식당목록") || ss.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, 1, lastRow - 1, 24);
  var values = range.getValues();
  var geocoder = Maps.newGeocoder().setLanguage("ko").setRegion("kr");
  var updatedCount = 0;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var name = String(row[4] || "").trim();
    var addr = String(row[11] || "").trim();
    var lat = String(row[12] || "").trim();
    var lng = String(row[13] || "").trim();
    var link = String(row[14] || "").trim();

    if (!name) continue;

    // 네이버 지도 링크가 비어 있으면 최신 PC·모바일 통합 링크로 자동 생성
    if (!link) {
      var campusHint = String(row[1] || "").toLowerCase().indexOf("global") >= 0 ? "영통 " : "회기 ";
      row[14] = "https://map.naver.com/p/search/" + encodeURIComponent(campusHint + name);
    }

    if ((!lat || !lng) && addr) {
      try {
        var res = geocoder.geocode(addr);
        if (res.status === "OK" && res.results && res.results.length > 0) {
          var loc = res.results[0].geometry.location;
          row[12] = Number(loc.lat).toFixed(6);
          row[13] = Number(loc.lng).toFixed(6);
          updatedCount++;
          Utilities.sleep(180); // 일일 쿼터 보호
        }
      } catch (err) {
        Logger.log("지오코딩 실패 (" + name + "): " + err);
      }
    }
  }

  range.setValues(values);
  ss.toast(
    updatedCount > 0
      ? updatedCount + "곳의 위도·경도 좌표를 주소 기반으로 자동 입력했습니다! 📍"
      : "새로 채울 빈 위도·경도 행이 없습니다. (주소 L열을 먼저 입력해 주세요)",
    "좌표 자동 채우기",
    5
  );
}

/**
 * 웹앱(app.js)과 즉시 연동하는 안내 모달을 띄웁니다.
 */
function showWebAppConnectModal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("식당목록") || ss.getSheets()[0];
  var ssId = ss.getId();
  var gid = sheet.getSheetId();

  var liveCsvUrl =
    "https://docs.google.com/spreadsheets/d/" + ssId + "/gviz/tq?tqx=out:csv&gid=" + gid;
  var appJsLine = 'const GOOGLE_SHEET_CSV_URL = "' + liveCsvUrl + '";';

  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Pretendard,-apple-system,sans-serif;padding:8px 4px;color:#181C2E;line-height:1.55;">' +
      '<h3 style="margin:0 0 10px;color:#B91C1C;font-size:16px;">🔗 경희대 거지맵 실시간 연동 2단계</h3>' +
      '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:13px;">' +
      '<strong>1단계 (최초 1번만!):</strong> 우측 상단 초록색 <b>[공유]</b> 버튼 클릭 → 일반 액세스를 <b>"링크가 있는 모든 사용자 (뷰어)"</b>로 변경 후 [완료]를 눌러주세요.' +
      "</div>" +
      '<div style="font-size:13px;margin-bottom:6px;"><strong>2단계:</strong> 아래 연동 URL 또는 <code>app.js</code> 1번 줄 코드를 복사해 연결하세요!</div>' +
      '<div style="font-size:11.5px;color:#5B627A;margin-bottom:4px;">① 웹앱 <code>☰ 메뉴 → 구글 시트 실시간 연동</code> 칸에 바로 붙여넣기용 URL:</div>' +
      '<input id="urlBox" readonly value="' +
      liveCsvUrl +
      '" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #D1D5DB;border-radius:7px;font-size:12px;margin-bottom:6px;" />' +
      '<button onclick="navigator.clipboard.writeText(document.getElementById(\'urlBox\').value);this.innerText=\'✓ 연동 URL 복사 완료!\'" style="background:#059669;color:#fff;border:none;padding:7px 12px;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px;margin-bottom:12px;">📋 연동 URL 복사하기</button>' +
      '<div style="font-size:11.5px;color:#5B627A;margin-bottom:4px;">② GitHub Pages 전체 배포용 (<code>app.js</code> 맨 첫 줄 덮어쓰기):</div>' +
      '<input id="codeBox" readonly value=\'' +
      appJsLine +
      '\' style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #D1D5DB;border-radius:7px;font-family:monospace;font-size:11.5px;margin-bottom:6px;" />' +
      '<button onclick="navigator.clipboard.writeText(document.getElementById(\'codeBox\').value);this.innerText=\'✓ app.js 코드 복사 완료!\'" style="background:#B91C1C;color:#fff;border:none;padding:7px 12px;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px;">📋 app.js 1번 줄 코드 복사하기</button>' +
      '<p style="font-size:11.5px;color:#5B627A;margin-top:12px;">💡 이제 이 시트에서 가격을 고치거나 행을 추가하면 <b>코드 수정 없이</b> 거지맵 웹앱에 실시간으로 바로 반영됩니다!</p>' +
      "</div>"
  )
    .setWidth(520)
    .setHeight(390);

  SpreadsheetApp.getUi().showModalDialog(html, "🍚 경희대 거지맵 웹앱 연동");
}

function applyMasterFormatting_(sheet) {
  var headers = getMasterHeaders_();
  var notes = getHeaderNotes_();
  var maxRows = Math.max(sheet.getLastRow() + 80, 150);

  // 1행 고정 및 헤더 디자인
  sheet.setFrozenRows(1);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setBackground("#991B1B")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setNotes([notes]);
  sheet.setRowHeight(1, 34);

  // 본문 기본 폰트 및 정렬
  var bodyRange = sheet.getRange(2, 1, maxRows - 1, headers.length);
  bodyRange.setFontSize(10).setVerticalAlignment("middle");

  // 숫자 포맷
  sheet.getRange(2, 1, maxRows - 1, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 2, maxRows - 1, 3).setHorizontalAlignment("center");
  sheet.getRange(2, 6, maxRows - 1, 1).setNumberFormat("#,##0").setHorizontalAlignment("right");
  sheet.getRange(2, 9, maxRows - 1, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 22, maxRows - 1, 2).setHorizontalAlignment("center");

  // 컬럼별 보기 편한 너비 세팅
  var widths = [
    48,  // A: id
    78,  // B: campus
    90,  // C: zone
    105, // D: category
    165, // E: name
    85,  // F: min_price
    260, // G: rep_menu
    230, // H: perks
    115, // I: price_status
    185, // J: tags
    260, // K: summary
    220, // L: address
    95,  // M: lat
    95,  // N: lng
    160, // O: link
    120, // P: days
    115, // Q: hours
    190, // R: hours_detail
    155, // S: break_time
    85,  // T: last_order
    85,  // U: closed_days
    78,  // V: status
    98,  // W: verified_at
    200  // X: note
  ];
  for (var c = 0; c < widths.length; c++) {
    sheet.setColumnWidth(c + 1, widths[c]);
  }

  // 드롭다운(데이터 확인) 규칙 — 직접 입력도 허용(setAllowInvalid(true))하여 붙여넣기 시 에러 방지
  var dvCampus = SpreadsheetApp.newDataValidation()
    .requireValueInList(["seoul", "global"], true)
    .setAllowInvalid(true)
    .build();
  var dvZone = SpreadsheetApp.newDataValidation()
    .requireValueInList(["교내", "정문", "회기역", "후문·외대", "정건", "중상·영통"], true)
    .setAllowInvalid(true)
    .build();
  var dvCat = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ["학식", "한식·백반", "분식", "국수·면", "돈가스·일식", "중식·마라", "양식", "고기·무한리필", "가성비술집"],
      true
    )
    .setAllowInvalid(true)
    .build();
  var dvPriceStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(["확정가격", "가격대·혜택확인", "단가확인필요"], true)
    .setAllowInvalid(true)
    .build();
  var dvStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(["운영", "임시휴업", "폐업"], true)
    .setAllowInvalid(true)
    .build();

  sheet.getRange(2, 2, maxRows - 1, 1).setDataValidation(dvCampus);
  sheet.getRange(2, 3, maxRows - 1, 1).setDataValidation(dvZone);
  sheet.getRange(2, 4, maxRows - 1, 1).setDataValidation(dvCat);
  sheet.getRange(2, 9, maxRows - 1, 1).setDataValidation(dvPriceStatus);
  sheet.getRange(2, 22, maxRows - 1, 1).setDataValidation(dvStatus);

  // 조건부 서식: 폐업(회색), 초가성비 6천원이하(초록), 미확정가격(주황)
  var fullDataRange = sheet.getRange(2, 1, maxRows - 1, headers.length);
  var priceColRange = sheet.getRange(2, 6, maxRows - 1, 1);
  var priceStatusRange = sheet.getRange(2, 9, maxRows - 1, 1);

  var ruleClosed = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$V2="폐업"')
    .setBackground("#F3F4F6")
    .setFontColor("#9CA3AF")
    .setStrikethrough(true)
    .setRanges([fullDataRange])
    .build();

  var ruleTempClosed = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$V2="임시휴업"')
    .setBackground("#F9FAFB")
    .setFontColor("#6B7280")
    .setRanges([fullDataRange])
    .build();

  var ruleUltraCheap = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=AND(ISNUMBER($F2), $F2>0, $F2<=6000)")
    .setBackground("#ECFDF5")
    .setFontColor("#047857")
    .setBold(true)
    .setRanges([priceColRange])
    .build();

  var ruleNeedPriceCheck = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($E2<>"", $I2<>"확정가격")')
    .setBackground("#FFFBEB")
    .setFontColor("#B45309")
    .setRanges([priceStatusRange])
    .build();

  sheet.setConditionalFormatRules([ruleClosed, ruleTempClosed, ruleUltraCheap, ruleNeedPriceCheck]);
}

function buildGuideSheet_(ss) {
  var guide = ss.getSheetByName("📘 입력가이드");
  if (!guide) {
    guide = ss.insertSheet("📘 입력가이드");
  } else {
    guide.clear();
  }

  var guideRows = [
    ["컬럼명 (영문키)", "한글 의미", "필수 여부", "입력 규칙 및 실제 예시"],
    ["id", "고유 번호", "필수", "1, 2, 3... 중복 없는 숫자 (?place=ID 공유 링크에 사용됨)"],
    ["campus", "캠퍼스 구분", "필수", "seoul (서울캠) 또는 global (국제캠) — 한글로 '서울캠'/'국제캠' 입력해도 자동 인식됨"],
    ["zone", "상권 권역", "필수", "서울캠: 교내, 정문, 회기역, 후문·외대 / 국제캠: 교내, 정건, 중상·영통"],
    ["category", "업종 카테고리", "필수", "학식, 한식·백반, 분식, 국수·면, 돈가스·일식, 중식·마라, 양식, 고기·무한리필, 가성비술집"],
    ["name", "식당 이름", "필수", "예: 청운관 학생식당, 안녕 유부, 호식당 영통"],
    ["min_price", "최저 식사 단가", "권장", "숫자만 입력 (예: 5500). 모르면 빈칸으로 두면 '리필혜택' 또는 '가격확인' 핀으로 표시됨"],
    ["rep_menu", "대표 메뉴·가격 요약", "권장", "예: 닭칼국수 7,000원 · 초계국수 7,000원 · 파전 9,000원"],
    ["perks", "리필·핵심 가성비 혜택", "권장", "예: 공기밥 무한리필 · 곱빼기 가격 동일 · 천원의 아침밥 운영"],
    ["price_status", "가격 신뢰도", "필수", "확정가격 / 가격대·혜택확인 / 단가확인필요 (미확정 시 상세 시트에 제보 버튼 강조)"],
    ["tags", "검색·생존카드 해시태그", "권장", "쉼표로 구분! 추천 태그: 초가성비,만원이하,학식,천원의아침밥,밥리필,곱빼기무료,무한리필,혼밥가능,해장국물,집밥백반,밥약추천,단체모임,포장추천,야식심야,가성비술집"],
    ["summary", "한 줄 소개", "권장", "상세 시트 상단에 표시될 깔끔한 한 줄 요약"],
    ["address", "도로명/지번 주소", "권장", "주소만 적고 상단 [🍚 거지맵 관리 -> 📍 빈 위도·경도 자동 채우기]를 누르면 좌표가 자동 입력됩니다!"],
    ["lat / lng", "위도 / 경도", "선택", "예: 37.592630 / 127.051877 (비워두어도 권역 기준점 근처에 안전하게 핀이 배치됩니다)"],
    ["link", "외부 링크 (네이버 플레이스/식단표)", "선택", "네이버 지도에서 식당 공유 링크(https://naver.me/... 또는 https://map.naver.com/p/entry/place/숫자ID)를 붙여넣으면 식당 상세페이지로 직결됩니다!"],
    ["days / hours", "영업일 / 기본 영업시간", "선택", "예: 매일 / 09:00 ~ 21:00 또는 평일 (주말 휴무) / 08:30 ~ 18:20"],
    ["hours_detail", "요일별 상세 영업시간(우선 적용)", "권장", "예: 월-금 10:00-22:00; 토-일 10:30-21:00 (자정 넘김: 월-일 17:00-02:00)"],
    ["break_time", "브레이크타임 (다중 지원!)", "선택", "예: 15:00-16:30 또는 학식 다중 브레이크: 10:00-11:00; 14:00-17:00"],
    ["last_order", "라스트오더", "선택", "예: 20:30"],
    ["closed_days", "정기 휴무 요일", "선택", "예: 일 또는 토,일 또는 화"],
    ["status", "운영 상태", "필수", "운영 / 임시휴업 / 폐업 ('폐업'으로 바꾸면 웹앱 지도·목록에서 즉시 자동 숨김 처리!)"],
    ["verified_at", "최종 확인일", "권장", "YYYY-MM-DD 형식 (예: 2026-11-13). 60일 경과 시 웹앱에 업데이트 필요 배지 자동 표시"],
    ["note", "추가 참고 팁", "선택", "예: 주말 라스트오더 20:20 / 온누리상품권 가맹점"]
  ];

  guide.getRange(1, 1, guideRows.length, 4).setValues(guideRows);
  guide.setFrozenRows(1);
  guide
    .getRange(1, 1, 1, 4)
    .setBackground("#181C2E")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");
  guide.getRange(2, 1, guideRows.length - 1, 4).setFontSize(10).setVerticalAlignment("middle").setWrap(true);
  guide.setColumnWidth(1, 160);
  guide.setColumnWidth(2, 180);
  guide.setColumnWidth(3, 85);
  guide.setColumnWidth(4, 520);
}

function getMasterHeaders_() {
  return [
    "id",
    "campus",
    "zone",
    "category",
    "name",
    "min_price",
    "rep_menu",
    "perks",
    "price_status",
    "tags",
    "summary",
    "address",
    "lat",
    "lng",
    "link",
    "days",
    "hours",
    "hours_detail",
    "break_time",
    "last_order",
    "closed_days",
    "status",
    "verified_at",
    "note"
  ];
}

function getHeaderNotes_() {
  return [
    "고유 번호 (1, 2, 3...)\n공유 링크(?place=ID)에 사용됩니다.",
    "캠퍼스: seoul(서울캠) 또는 global(국제캠)",
    "권역:\n서울캠 - 교내, 정문, 회기역, 후문·외대\n국제캠 - 교내, 정건, 중상·영통",
    "업종: 학식, 한식·백반, 분식, 국수·면, 돈가스·일식, 중식·마라, 양식, 고기·무한리필, 가성비술집",
    "식당 이름",
    "최저 식사 가격 (숫자만! 예: 5500)\n미기재 시 리필혜택/가격확인 배지로 표시",
    "대표 메뉴 및 가격 요약 텍스트",
    "밥·사리 무한리필, 곱빼기 무료, 천원의 아침밥 등 핵심 혜택",
    "확정가격 / 가격대·혜택확인 / 단가확인필요",
    "쉼표(,) 구분 해시태그\n예: 초가성비,혼밥가능,만원이하,밥리필",
    "식당 한 줄 소개",
    "도로명 또는 지번 주소\n(입력 후 상단 거지맵 관리 메뉴에서 위경도 자동 변환 가능)",
    "위도 (예: 37.594939) — 비워도 권역 근처에 자동 배치",
    "경도 (예: 127.051819) — 비워도 권역 근처에 자동 배치",
    "네이버 지도 URL 또는 생협 학식 식단표 URL",
    "영업 요일 요약 (예: 매일, 평일 (주말 휴무))",
    "영업시간 요약 (예: 09:00 ~ 21:00)",
    "실시간 엔진 우선 파싱 시간표\n예: 월-금 10:00-22:00; 토-일 10:30-21:00",
    "브레이크타임 (다중 구간은 ; 로 구분)\n예: 10:00-11:00; 14:00-17:00",
    "라스트오더 시각 (예: 20:30)",
    "정기휴무 요일 (예: 일 / 토,일 / 화)",
    "운영 / 임시휴업 / 폐업\n('폐업' 선택 시 웹앱에서 즉시 숨김 처리)",
    "정보 확인일 (YYYY-MM-DD)",
    "기타 참고 팁"
  ];
}

function getInitial38Places_() {
  return [
    [1,"seoul","교내","학식","청운관 학생식당",5500,"조·중·석식 기본 5,500원 · 중식 일품 6,500원","조·중·석식 전 시간대 운영하는 서울캠 대표 생협 학식","확정가격","학식,초가성비,혼밥가능,만원이하","조식부터 석식까지 저렴하게 다양한 코너 메뉴를 제공하는 청운관 지하 2층 학생식당","서울 동대문구 경희대로 26 청운관 지하2층",37.594939,127.051819,"https://khucoop.com/36","평일 (주말 휴무)","08:30 ~ 18:20","월-금 08:30-18:20","10:00-11:00; 14:00-17:00","18:00","토,일","운영","2026-11-13","조식 08:30-10:00 / 중식 11:00-14:00 / 석식 17:00-18:20 (소진 시 조기 종료)"],
    [2,"seoul","교내","학식","푸른솔문화관 식당",1000,"천원의 아침밥 1,000원 · 교직원식당 기본 7,000원(주 2회 8,000원)","2024 대학생협 조리명장 최우수상 · 천원의 아침밥 운영","확정가격","학식,천원의아침밥,혼밥가능,만원이하","예능 맛있는 녀석들에 소개된 푸른솔문화관 내 생협 학생·교직원 식당","서울 동대문구 경희대로 26 푸른솔문화관",37.595047,127.055727,"https://khucoop.com/37","평일 (주말 휴무)","08:00 ~ 18:30","월-금 08:00-18:30","10:00-11:00; 14:00-17:00","18:00","토,일","운영","2026-11-13","푸른솔 천원의 아침밥 운영 · 교직원식당 기본 7,000원 / 주 2회 8,000원 병행"],
    [3,"seoul","후문·외대","분식","알촌 경희외대점",5300,"매콤알밥 5,300원 · 순한알밥 5,500원 · 약매알밥 5,700원","5천원대 초가성비 퓨전 알밥 · 국물·어묵·피클 셀프바 무료","확정가격","초가성비,혼밥가능,만원이하,집밥백반","5천 원대 예산으로 든든하게 배를 채우는 경희대·외대 학생들의 초가성비 알밥 성지","서울 동대문구 천장산로7길 10-3 지하1층",37.59568,127.05742,"https://map.naver.com/p/entry/place/1084928205","일~금 (토 휴무)","10:00 ~ 20:30","월-금 10:00-20:30; 일 10:00-20:30","15:00-16:30","","토","운영","2026-11-13","매주 토요일 정기휴무 · 키오스크 주문 및 셀프 반찬바 운영"],
    [4,"seoul","정문","분식","푸른하늘",3800,"원조김밥 3,800원 · 참치·제육·돈가스김밥 5,500원 · 라볶이 7,000원","라볶이·쫄면 기본과 곱빼기 가격 동일 · 두툼한 왕김밥","확정가격","초가성비,곱빼기무료,만원이하,포장추천","생활의 달인에 소개된 두꺼운 왕김밥과 곱빼기 동일가 라볶이·쫄면으로 유명한 정문 앞 분식집","서울 동대문구 경희대로6길 3-4",37.59122,127.05318,"https://map.naver.com/p/entry/place/35092309","월~토 (일 휴무)","08:30 ~ 15:00","월-토 08:30-15:00","","","일","운영","2026-11-13","재료 소진 시 15시경 조기 마감 · 라볶이·쫄면 곱빼기 무료"],
    [5,"seoul","정문","돈가스·일식","안녕 유부",5500,"대용량 우동 5,500원 · 유부초밥 메뉴","5,500원에 1인분 넘치는 푸짐한 우동 양 · 온누리상품권 가맹","확정가격","초가성비,혼밥가능,만원이하","정문 바로 앞에서 5천 원대 가격에 푸짐한 우동과 유부초밥을 즐기는 혼밥 맛집","서울 동대문구 경희대로3길 11 1층",37.59263,127.051877,"https://map.naver.com/p/entry/place/1171142449","매일","09:00 ~ 21:00","월-일 09:00-21:00","","20:30","","운영","2026-11-13","온누리상품권 가맹점"],
    [6,"seoul","정문","한식·백반","사나이뚝배기 경희대점",6300,"우거지된장뚝배기 6,300원 · 순두부·김치제육뚝배기 7,000~8,500원","밥 무한 리필 셀프코너 · 반찬·육수 셀프 · 계란후라이·김 각 500원","확정가격","밥리필,혼밥가능,초가성비,만원이하","전 메뉴 1만 원 미만에 밥 무한리필 셀프바와 1인 테이블을 갖춘 정문 앞 대표 뚝배기 한식당","서울 동대문구 경희대로4길 5 1층",37.591942,127.052674,"https://map.naver.com/p/entry/place/1272428755","매일","10:00 ~ 22:00","월-일 10:00-22:00","","","","운영","2026-11-13","제로페이·포장 가능 · 공기밥 셀프 무한리필"],
    [7,"seoul","정문","국수·면","79번지 국수집",7000,"닭칼국수 7,000원 · 초계국수 7,000원 · 고기김치전·감자해물파전 9,000원","매일 8시간 우린 닭육수 · 파전+막걸리 가성비 명소","확정가격","초가성비,혼밥가능,만원이하,해장국물,가성비술집","경희대생 추천 리스트에 단골로 꼽히는 30년 전통 국숫집으로 닭칼국수와 파전이 유명한 곳","서울 동대문구 회기로13길 25 1층",37.58985,127.05142,"https://map.naver.com/p/entry/place/32005753","매일","10:00 ~ 22:00","월-금 10:00-22:00; 토-일 10:30-21:00","","21:20","","운영","2026-11-13","주말 라스트오더 20:20"],
    [8,"seoul","정문","한식·백반","도읍지",9000,"순두부찌개백반 9,000원 · 제육백반 · 김치찌개백반 · 부대찌개백반","폭탄 계란찜과 넉넉한 한식 밑반찬 상차림","확정가격","만원이하,집밥백반,밥약추천","32년째 정문 인근 골목을 지켜온 한식 백반집으로 다양한 찌개 백반과 폭탄 계란찜이 유명한 곳","서울 동대문구 회기로21길 38-1",37.59168,127.05398,"https://map.naver.com/p/entry/place/18091308","매일","10:30 ~ 22:00","월-일 10:30-22:00","15:00-16:30","21:00","","운영","2026-11-13","동대문구청 안내 순두부찌개백반 9,000원 기준"],
    [9,"seoul","정문","한식·백반","여기가좋겠네",8500,"닭볶음탕·뼈없는찜닭 소(2인) 17,000원(1인 8,500원) · 닭불백 9,000원","2인 17,000원 진한 국물 닭볶음탕 · 정문 앞 노포 한식당","가격대·혜택확인","해장국물,혼밥가능,집밥백반,만원이하","국물이 진한 닭볶음탕(반마리 17,000원)과 식사 메뉴로 사랑받는 회기동 대표 노포 한식당","서울 동대문구 회기로21길 25 1층",37.59115,127.05412,"https://map.naver.com/p/entry/place/19877681","매일","11:00 ~ 23:00","월-일 11:00-23:00","","","","운영","2026-11-13","닭볶음탕 소(반마리) 17,000원 / 중(한마리) 23,000원"],
    [10,"seoul","정문","분식","버거리 경희대점",4900,"프레쉬버거 4,900원 · 소불고기버거 5,200원 · 쉬림프버거 5,800원","4~5천원대 수제버거 단품 · 빠른 공강 식사 가능","확정가격","초가성비,혼밥가능,만원이하,포장추천","공강 시간에 4~5천 원대 예산으로 가볍고 든든하게 한 끼를 해결할 수 있는 수제버거 매장","서울 동대문구 회기로 144 1층",37.59058,127.05365,"https://map.naver.com/p/entry/place/2047220333","매일","10:30 ~ 21:30","월-일 10:30-21:30","","","","운영","2026-11-13","단품 4,900원~ / 세트 변경 시 +3,700원대"],
    [11,"seoul","정문","돈가스·일식","텐동토리텐",9500,"토리텐동 9,500원 · 토리·에비 믹스 텐동&카레 12,500원","창가 다찌석·1인 좌석 완비 · 바삭한 직화 텐동&카레","확정가격","혼밥가능,만원이하,밥약추천","창가 1인 좌석이 잘 갖춰져 있고 회전이 빨라 혼자서도 편하게 텐동을 즐길 수 있는 일식당","서울 동대문구 회기로25길 11 1층",37.59086,127.05514,"https://map.naver.com/p/entry/place/1110562117","월~토 (일 휴무)","11:30 ~ 20:30","월-토 11:30-20:30","15:00-17:00","20:00","일","운영","2026-11-13","기본 텐동 9,500원~ · 브레이크타임 15:00-17:00"],
    [12,"seoul","정문","국수·면","온복국수 경희대점",7500,"온복 잔치국수 7,500원 · 어묵국수 8,500원 · 비빔국수 8,900원","밀가루 부담 없는 쌀면 글루텐프리 국수 · 진한 육수","확정가격","혼밥가능,만원이하,해장국물","소화가 잘되는 쌀면 기반 글루텐프리 국수를 7천 원대부터 깔끔하게 맛볼 수 있는 국숫집","서울 동대문구 경희대로1가길 10 1층",37.59161,127.05346,"https://map.naver.com/p/entry/place/2055650177","매일","11:00 ~ 21:00","월-일 11:00-21:00","","","","운영","2026-11-13","온복 잔치국수 7,500원 · 고기국수 9,500원"],
    [13,"seoul","정문","고기·무한리필","닭갈비제작소 경희대점",15900,"철판닭갈비 · 닭갈비구이·삼겹 무한리필 성인 15,900원","닭갈비·삼겹·사리·셀프바 무제한 제공","확정가격","무한리필,단체모임","정문 도보 5분 거리에서 닭갈비와 삼겹살·사리를 셀프바와 함께 무제한으로 즐기는 무한리필 매장","서울 동대문구 경희대로4길 8 2층",37.59188,127.05229,"https://map.naver.com/p/entry/place/1279552058","매일","11:00 ~ 22:00","월-일 11:00-22:00","","","","운영","2026-11-13","성인 무한리필 15,900원 기준"],
    [14,"seoul","회기역","분식","레알라면",7000,"레알라면(옐로우·오렌지·레드) 7,000원","공깃밥·치즈·콩나물·김가루 셀프바 무료 무제한","확정가격","혼밥가능,만원이하,해장국물,밥리필","7,000원 단일 라면에 공깃밥·치즈·콩나물 셀프바까지 무제한으로 즐기는 회기 명물 해장 라면집","서울 동대문구 회기로25길 23-5 1층",37.59132,127.05532,"https://map.naver.com/p/entry/place/31076674","월~토 (일 휴무)","11:00 ~ 20:30","월-토 11:00-20:30","","","일","운영","2026-11-13","라면 7,000원 + 공깃밥·치즈 셀프바 무료"],
    [15,"seoul","회기역","국수·면","불꽃냉면 장칼국수",8000,"냉면 8,000원 · 장칼국수 8,500원","동대문구 만원 이하 식당 리스트 등재","확정가격","혼밥가능,만원이하","회기동에서 10년째 만 원 이하의 합리적인 가격에 냉면과 장칼국수를 내어주는 면 요리집","서울 동대문구 경희대로3길 13 2층",37.59248,127.05195,"https://map.naver.com/p/entry/place/1882455079","매일","11:00 ~ 21:00","월-일 11:00-21:00","","","","운영","2026-11-13","냉면 8,000원 기준"],
    [16,"seoul","회기역","국수·면","153구포국수 회기역점",6500,"153지단김밥 6,500원 · 잔치국수 7,000원 · 비빔·어묵국수 8,500원","회기역 1번 출구 바로 앞 바 좌석 혼밥 최적화","확정가격","혼밥가능,만원이하","회기역 앞에서 다양한 국수와 계란지단김밥·돈까스를 바 좌석에서 부담 없이 혼밥하기 좋은 식당","서울 동대문구 회기로 189 1층",37.59018,127.05712,"https://map.naver.com/p/entry/place/1413008941","매일","10:30 ~ 22:00","월-일 10:30-22:00","","","","운영","2026-11-13","회기역 1번 출구 통학 동선 혼밥 최적"],
    [17,"seoul","회기역","돈가스·일식","춘하추우동",7500,"수제우동 7,500원 · 우동세트 8,500원 · 카츠카레 9,000원","순한 수제 우동·카레와 합리적 세트 구성","확정가격","혼밥가능,만원이하","자극적이지 않은 수제 우동·돈카츠·카레를 합리적인 가격에 혼밥할 수 있는 회기 일식당","서울 동대문구 이문로 37 1층",37.58912,127.05665,"https://map.naver.com/p/entry/place/37442101","월~토 (일 휴무)","11:00 ~ 21:00","월-토 11:00-21:00","15:00-17:00","","일","운영","2026-11-13","우동 7,500원 · 가라아게(소) 5,500원"],
    [18,"seoul","회기역","양식","굿갓레스토랑 회기직영점",9000,"매콤 알리오올리오 9,000원 · 돼지목심 스테이크 15,000원","아늑한 분위기에서 파스타 9,000원대 가성비 밥약","확정가격","만원이하,밥약추천","파스타 9천 원대 구성으로 선후배 밥약이나 데이트 때 부담 없이 찾기 좋은 대학가 양식당","서울 동대문구 회기로21길 29 2층",37.59074,127.05445,"https://map.naver.com/p/entry/place/1096198166","매일","11:30 ~ 21:30","월-일 11:30-21:30","15:30-17:00","20:45","","운영","2026-11-13","돼지목심 스테이크 웰던 요청 팁"],
    [19,"seoul","회기역","고기·무한리필","일구구삼 고기",10000,"삼겹살 600g 30,000원 (200g 환산 10,000원) · 소고기 된장라면 6,000원","삼겹살 200g당 1만원꼴의 높은 중량 가성비","확정가격","초가성비,단체모임,밥약추천","삼겹살 600g 한 판이 3만 원이라 둘이서 5만 원 안쪽으로 푸짐하게 고기를 즐길 수 있는 고깃집","서울 동대문구 회기로25길 18 1층",37.59098,127.05618,"https://map.naver.com/p/entry/place/1316861264","매일","16:00 ~ 24:00","월-일 16:00-24:00","","","","운영","2026-11-13","600g 30,000원 중량 가성비"],
    [20,"seoul","회기역","고기·무한리필","꽃돼지무한삼겹 경희대점",12500,"점심 무한리필 12,500원 · 저녁 무한리필 13,500원","통삼겹+된장찌개+공깃밥+라면+음료수까지 전부 무한리필","확정가격","무한리필,단체모임,밥리필","1만 원 초반대에 통삼겹살은 물론 라면·공깃밥·음료수까지 무제한으로 즐기는 회기 대표 가성비 고깃집","서울 동대문구 회기로19길 11 1층",37.59029,127.05378,"https://map.naver.com/p/entry/place/1288462505","매일","11:00 ~ 23:30","월-일 11:00-23:30","","","","운영","2026-11-13","점심 12,500원 / 저녁 13,500원 (소액 추가 시 우삼겹 포함)"],
    [21,"seoul","회기역","가성비술집","고레가",7000,"하이볼 2,900원 · 안키모크래커 7,000원 · 한우스지수육 8,000원","1만원 이하 요리 안주 + 2,900원 하이볼","확정가격","가성비술집,만원이하,밥약추천,야식심야","만 원 이하의 특색 있는 안주와 2,900원 하이볼로 부담 없이 분위기 내기 좋은 감성 이자카야","서울 동대문구 회기로21길 19 1층",37.59068,127.05482,"https://map.naver.com/p/entry/place/2088203171","매일","17:30 ~ 02:00","월-일 17:30-02:00","","01:00","","운영","2026-11-13","하이볼 2,900원 · 새벽 2시까지 영업"],
    [22,"seoul","후문·외대","돈가스·일식","39돈가스",9000,"매콤돈가스 9,000원~ · 피자돈가스","키오스크 주문·셀프 배식으로 간편한 1만원 이하 혼밥","확정가격","혼밥가능,만원이하","바삭한 경양식 돈가스에 걸쭉한 소스를 곁들여 만 원 이하로 편하게 혼밥하는 외대·후문 식당","서울 동대문구 휘경로2길 5-2",37.596015,127.058795,"https://map.naver.com/p/entry/place/37535322","매일","10:00 ~ 20:30","월-일 10:00-20:30","","","","운영","2026-11-13","키오스크 셀프 경양식 돈가스"],
    [23,"seoul","후문·외대","분식","이상한떡볶이집",7500,"김치볶음밥 7,500원 · 매콤스파게티 8,000원 · 팬스테이크 9,500원","1인 1메뉴 주문 시 즉석 떡볶이 무료 무한리필 제공","가격대·혜택확인","밥리필,만원이하,밥약추천","김치볶음밥이나 스파게티 등 1인 1주문을 하면 떡볶이를 무료로 무한리필해 주는 외대·후문 명소","서울 동대문구 휘경로2가길 6",37.59572,127.05964,"https://map.naver.com/p/entry/place/19550724","월~토 (일 휴무)","11:00 ~ 20:30","월-토 11:00-20:30","","","일","운영","2026-11-13","1인 1주문 기준 떡볶이 무한리필"],
    [24,"seoul","후문·외대","한식·백반","순대실록 한국외대점",10000,"전통순댓국 10,000원 · 살코기순댓국 10,500원","늦은 밤에도 찾기 쉬운 든든한 국밥 한 끼","확정가격","혼밥가능,만원이하,해장국물,야식심야","야간 과제나 카공 후 늦은 시간에도 제약이 적어 든든하게 속을 채우기 좋은 순댓국 전문점","서울 동대문구 이문로 120 1층",37.59735,127.06052,"https://map.naver.com/p/entry/place/2006846249","매일","09:00 ~ 24:00","월-일 09:00-24:00","","","","운영","2026-11-13","전통순댓국 10,000원"],
    [25,"seoul","후문·외대","한식·백반","샤브온당 외대점",10900,"온당 샤브 10,900원 · 나주 미나리 샤브 11,900원 · 소고기 덮밥","1인석 및 개인 전용 화구 완비","확정가격","혼밥가능,해장국물,밥약추천","1인 좌석과 개인 화구가 마련되어 혼자서도 원하는 육수와 소스로 샤브샤브를 즐기는 곳","서울 동대문구 이문로28길 12 1층",37.595654,127.060402,"https://map.naver.com/p/entry/place/2051930453","매일","11:00 ~ 21:30","월-일 11:00-21:30","","21:00","","운영","2026-11-13","개인 전용 화구 1인 샤브"],
    [26,"seoul","후문·외대","한식·백반","옛날할머니보쌈 (경희대후문)",11000,"보쌈정식 11,000원 · 보쌈정식 특 14,000원","구수한 된장찌개와 정갈한 집밥 밑반찬 구성","확정가격","집밥백반,밥약추천,혼밥가능","야들야들한 보쌈고기에 된장찌개·콩자반·멸치볶음 등 집밥 반찬이 나와 자취생이 즐겨 찾는 한식당","서울 동대문구 이문로 100 2층",37.59548,127.05712,"https://map.naver.com/p/entry/place/1510419800","매일","11:00 ~ 22:00","월-일 11:00-22:00","","","","운영","2026-11-13","보쌈정식 11,000원"],
    [27,"seoul","후문·외대","중식·마라","영화장",7500,"짜장면 7,500원 · 삼선간짜장 · 굴짬뽕 · 탕수육","50년 전통 백년가게 인증 · 혼밥·밥약 모두 좋은 노포 중식당","확정가격","혼밥가능,만원이하,해장국물,밥약추천","외대앞역 인근에서 50년 넘게 사랑받아온 백년가게 인증 가성비 노포 중국집","서울 동대문구 휘경로 3-8 1층",37.59609,127.06285,"https://map.naver.com/p/entry/place/18119095","매일","11:00 ~ 21:30","월-일 11:00-21:30","15:00-17:00","","","운영","2026-11-13","중소벤처기업부 백년가게 선정 · 브레이크타임 15:00-17:00"],
    [28,"seoul","후문·외대","분식","밀플랜비 한국외대점",6000,"치킨라이스·소고기라이스 부리또 6,000원 · 감자부리또 6,500원","6천원대 든든한 부리또 · 빠른 포장과 공강 식사 최적","확정가격","초가성비,혼밥가능,만원이하,포장추천","공강 시간 이동 중에도 6천 원으로 간편하고 든든하게 배를 채울 수 있는 대학가 부리또 매장","서울 동대문구 천장산로 36 1층",37.59618,127.05788,"https://map.naver.com/p/entry/place/1612695122","매일","11:00 ~ 21:00","월-일 11:00-21:00","","","","운영","2026-11-13","치킨·소고기 부리또 6,000원~"],
    [29,"global","교내","학식","국제캠 학생회관 식당",1000,"천원의 아침밥 1,000원 · 일반학식 5,500~6,500원","천원의 아침밥 TAKE OUT 예약 가능 · 청운관 동일 식단","확정가격","학식,천원의아침밥,초가성비,혼밥가능,만원이하","천원의 아침밥 포장 서비스까지 운영하는 국제캠퍼스 생협 학생식당","경기 용인시 기흥구 덕영대로 1732 학생회관 1층",37.241852,127.080031,"https://www.khu.ac.kr/kor/user/bbs/BMSR00040/list.do?menuNo=200283&catId=137","평일 (주말 휴무)","08:20 ~ 18:30","월-금 08:20-18:30","10:00-11:00; 14:00-17:00","18:00","토,일","운영","2026-11-13","조식 08:20-10:00 / 중식 11:00-14:00 / 석식 17:00-18:30"],
    [30,"global","교내","학식","제2기숙사 식당",5500,"중·석식 기본 5,500원 · 중식 일품 6,500원","우정원 사생 포함 기숙사권 핵심 학생식당","확정가격","학식,초가성비,혼밥가능,만원이하","별도 학생식당이 없는 우정원 기숙사생까지 함께 이용하는 제2기숙사 1층 구내식당","경기 용인시 기흥구 덕영대로 1732 제2기숙사 1층",37.243659,127.076893,"https://dorm2.khu.ac.kr/50/5030.do","평일 (주말 휴무)","11:30 ~ 18:30","월-금 11:30-18:30","13:30-17:00","18:15","토,일","운영","2026-11-13","중식 11:30-13:30 / 석식 17:00-18:30 (조식·주말 미운영)"],
    [31,"global","정건","돈가스·일식","호식당 영통",7500,"호카레 7,500원 · 등심돈까스카레 9,500원 · 차슈덮밥 9,500원","밥·카레 무료 리필 가능 + 셀프바(김치·단무지·장국)","가격대·혜택확인","밥리필,혼밥가능,만원이하","담백한 일본 가정식 카레와 덮밥을 밥·카레 무료 리필로 든든하게 먹는 정건 대표 혼밥 식당","경기 수원시 영통구 영일로 16-10 1층",37.24881,127.07508,"https://map.naver.com/p/entry/place/1591876399","월~토 (일 휴무)","11:00 ~ 20:00","월-금 11:00-20:00; 토 11:00-14:55","","","일","운영","2026-11-13","밥·카레 무료 리필 · 토요일 14:55 조기 마감"],
    [32,"global","정건","분식","보용만두 영통점",7500,"고기·김치손만두 7,500원 · 군만두 8,000원 · 쫄면·만두국 9,000원","수원 명물 쫄면+군만두 가성비 조합 · 혼밥 및 포장 편리","확정가격","혼밥가능,만원이하,포장추천","학교 정문 건너편에서 찐만두·군만두와 쫄면을 푸짐하고 빠르게 즐길 수 있는 터줏대감 분식집","경기 수원시 영통구 영일로 16 1층",37.249135,127.074664,"https://map.naver.com/p/entry/place/36988501","매일","10:00 ~ 21:30","월-일 10:00-21:30","","","","운영","2026-11-13","찐만두 7,500원 · 군만두 8,000원 · 쫄면 9,000원"],
    [33,"global","정건","돈가스·일식","겐코 경희대점",8000,"직화 부타동 8,000원 · 특미 돈코츠라멘 8,500원 · 미니덮밥 세트","빠른 회전율과 라멘+미니덮밥 든든한 혼밥 구성","가격대·혜택확인","혼밥가능,만원이하","직화 돼지고기 덮밥(부타동)과 진한 돈코츠 라멘 조합으로 점심 공강에 빠르게 혼밥하기 좋은 정건 일식집","경기 수원시 영통구 영일로 8 메가플러스 1층",37.248297,127.076108,"https://map.naver.com/p/entry/place/1181880213","월~토 (일 휴무)","11:00 ~ 20:30","월-토 11:00-20:30","15:00-17:00","","일","운영","2026-11-13","설국티비 소개 정건 부타동·라멘 맛집"],
    [34,"global","정건","중식·마라","마라정 (영통)",7000,"마라탕 기본(최소주문) 7,000원~ · 마라반 · 고기추가 3,000원","바 좌석 완비 · 예산에 맞춘 재료 중량 선택 과금","가격대·혜택확인","혼밥가능,만원이하,해장국물","정건 골목에서 바 좌석에 앉아 7천 원대부터 원하는 예산만큼 재료를 담아 혼밥하기 편한 마라탕 전문점","경기 수원시 영통구 영일로6번길 54 1층",37.247988,127.078898,"https://map.naver.com/p/entry/place/1769635243","매일","10:30 ~ 21:30","월-일 10:30-21:30","","21:00","","운영","2026-11-13","바 좌석 혼밥 편리"],
    [35,"global","정건","고기·무한리필","9.4닭갈비 수원경희대점",14500,"닭갈비 1인분 14,500원 · 볶음밥 4,000원","기본 양이 넉넉해 사리 추가 부담 적음","확정가격","밥약추천,단체모임","정문 건너편 골목에서 푸짐한 철판 닭갈비와 볶음밥으로 밥약·소모임하기 좋은 식당","경기 수원시 영통구 매영로415번길 42-12 1층",37.24924,127.07682,"https://map.naver.com/p/entry/place/2073100515","매주 화요일 휴무","11:00 ~ 22:00","월 11:00-22:00; 수-일 11:00-22:00","","","화","운영","2026-11-13","화요일 정기휴무"],
    [36,"global","중상·영통","한식·백반","송탄진대광부대찌개 영통점",13000,"대광부대찌개 1인 13,000원 (공깃밥 무한리필 · 라면사리 포함)","푸짐한 송탄식 햄·소시지 구성 + 공기밥 무한리필 제공","확정가격","밥리필,해장국물,단체모임","햄이 산더미처럼 들어간 부대찌개에 공깃밥 무한리필과 라면사리까지 더해 배불리 먹는 영통역 한식당","경기 수원시 영통구 반달로 21 2층",37.25162,127.07504,"https://map.naver.com/p/entry/place/1321879398","매일","10:30 ~ 22:00","월-일 10:30-22:00","","","","운영","2026-11-13","1인 13,000원 · 공기밥 무한리필"],
    [37,"global","중상·영통","한식·백반","더진국 수육국밥 영통역점",9000,"수육국밥 9,000원 · 순대국밥 9,000원 · 얼큰국밥 9,500원","자정(24:00)까지 넉넉한 야간 영업 · 특허 육수 수육국밥","확정가격","혼밥가능,만원이하,해장국물,야식심야","영통역 중심상가에서 밤 12시까지 9천 원 뜨끈한 수육국밥으로 야간 혼밥이나 해장을 해결할 수 있는 곳","경기 수원시 영통구 청명남로 21 1층 104호",37.252072,127.074467,"https://map.naver.com/p/entry/place/36174694","매일","09:30 ~ 24:00","월-일 09:30-24:00","","","","운영","2026-11-13","수육국밥 9,000원 · 밤 12시 마감"],
    [38,"global","중상·영통","국수·면","등촌샤브칼국수 수원영통점",11000,"버섯매운탕칼국수 11,000원 · 소고기 샤브세트 (칼국수+볶음밥 코스)","얼큰 버섯칼국수+미나리+볶음밥 풀코스 가성비","확정가격","밥약추천,해장국물","영통역 도보권에서 얼큰한 버섯매운탕칼국수와 계란볶음밥 코스를 합리적으로 즐길 수 있는 식당","경기 수원시 영통구 청명남로 25 3층 308호",37.25288,127.07592,"https://map.naver.com/p/entry/place/1496657953","매일","11:00 ~ 21:30","월-일 11:00-21:30","15:30-17:00","20:40","","운영","2026-11-13","버섯칼국수 11,000원 · 샤브+칼국수+볶음밥 코스"]
  ];
}
