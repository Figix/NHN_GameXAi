// 실제 진명/힌트/배치 데이터는 scripts/build_content.py가 Place&Object + TrueName CSV를
// 조인해서 만든 data/content.json을 fetch로 불러온다(아래 loadContent() 참고) — 더 이상
// 이 파일에 하드코딩돼 있지 않다. 장소(큰 단위)/View(작은 단위) 용어는
// docs/02_게임플레이_흐름.md 기준.

const DEMO_PLACES = {
  library: { label: "도서관" },
  station: { label: "기차역" },
  museum: { label: "박물관" },
  "post-office": { label: "우체국" },
  market: { label: "시장" },
  cafe: { label: "카페" },
  park: { label: "공원" },
};

// data/content.json의 places(장소 한글명 기준)를 fetch로 받아서 loadContent()가 채운다.
// [placeId(영문), koLabel, objectNames] 형태는 그대로 유지 — DEMO_SCENES 구성 로직
// (buildDemoScenes)이 이 모양을 그대로 소비하기 때문에 fetch 이전과 이후로 아무것도
// 안 바뀐다.
let RAW_PLACE_DATA = [];

// docs/10_히트박스_시스템.md에서 제안한 영문 슬러그와 동일하게 맞춘다
// (나중에 배경/마스크 이미지 폴더명과 그대로 이어지도록).
const VIEW_SLUGS = {
  열람실: "reading-room", 서고: "stacks", 로비: "lobby", 휴게공간: "lounge",
  대합실: "waiting-hall", 플랫폼: "platform", 매표소: "ticket-office", 분실물보관소: "lost-and-found",
  전시실: "exhibition-hall", 특별전시실: "special-exhibition", 기념품점: "gift-shop",
  창구: "counter", 대기실: "waiting-room", 소포포장대: "packing-station",
  청과물가게: "produce-shop", 생선가게: "fish-shop", 골목시장: "alley", 분식집: "snack-stall",
  홀: "hall", 창가자리: "window-seat", 바카운터: "bar-counter",
  벤치구역: "bench-area", 분수대: "fountain", 산책로: "trail", 놀이터: "playground",
};

// TrueName 데이터(사물명 -> 리들/힌트3/리빌)는 data/content.json에서 fetch로 불러온다
// (아래 loadContent() 참고) — 더 이상 이 파일에 하드코딩돼 있지 않다.
let TRUENAME_DATA = {};

// data/content.json(scripts/build_content.py가 Place&Object + TrueName CSV를 조인해서
// 만든 결과물)을 fetch로 불러와 RAW_PLACE_DATA/TRUENAME_DATA를 채우고 DEMO_SCENES까지
// 구성한다. startGame()이 게임을 실제로 시작하기 전에 이 프라미스를 기다린다 — 인트로가
// 재생되는 동안 백그라운드로 미리 불러와 두므로(인트로만 최소 십수 초) 실제로 로딩을
// 기다리게 되는 경우는 거의 없다.
async function loadContent() {
  try {
    const res = await fetch("data/content.json");
    const data = await res.json();
    TRUENAME_DATA = data.objects;

    // JSON은 장소를 한글 이름 그대로 담고 있다(예: "도서관") — DEMO_PLACES가 이미 갖고
    // 있는 한글 라벨을 거꾸로 뒤집어서 기존 영문 placeId("library" 등)를 구해 붙인다.
    // 이렇게 해야 DEMO_SCENES 구성 로직(buildDemoScenes)이 예전 하드코딩 시절과 똑같은
    // 모양의 RAW_PLACE_DATA를 받아서 아무것도 안 바뀐 것처럼 동작한다.
    const placeIdByLabel = {};
    Object.keys(DEMO_PLACES).forEach((id) => {
      placeIdByLabel[DEMO_PLACES[id].label] = id;
    });
    RAW_PLACE_DATA = data.places.map((p) => [placeIdByLabel[p.place], p.view, p.objects]);

    buildDemoScenes();
  } catch (err) {
    // file://로 index.html을 직접 열면 fetch 자체가 막힌다(마스크 캔버스 판독이
    // SecurityError를 던지는 것과 같은 이유) — 로컬 서버로 열어야 한다는 걸 콘솔에서
    // 바로 알 수 있게 한다.
    console.error("[content] data/content.json을 불러오지 못했습니다 — " + err.message);
  }
}
const contentReadyPromise = loadContent();

// 80개를 한 번씩 다 돌고 나서야 다시 섞는다(매번 순수 랜덤이면 방금 나온 게 바로 또
// 나올 수 있음 — "80가지를 골고루 돈다"는 느낌을 위해 섞은 큐를 다 비울 때까지 유지).
let riddleQueue = [];
function ensureRiddleQueue() {
  if (riddleQueue.length === 0) {
    riddleQueue = Object.keys(TRUENAME_DATA);
    for (let i = riddleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [riddleQueue[i], riddleQueue[j]] = [riddleQueue[j], riddleQueue[i]];
    }
  }
}
function nextObjectName() {
  ensureRiddleQueue();
  return riddleQueue.pop();
}

// 세션 리듬 — 파도(Wave) 시스템. 80개를 한 세션에서 쭉 풀면 8~10문제부터 루프가
// 다 읽혀서 물리는 문제를, 하루 제한 대신 세션 내부에 주기적인 변주를 줘서 완화한다.
// 규칙은 docs/02_게임플레이_흐름.md "12-1. 세션 리듬 — 파도 시스템" 참고. 사물 80개의
// 무작위 순환(riddleQueue)과는 완전히 별개의 카운터로 돈다 — 맞물릴 필요 없음.
// 파도 하나당 3문제씩 균등하게 둬서(9문제 사이클) "3문제마다 흐름이 바뀐다"는 리듬을
// 항상 일정하게 유지한다 — 예전엔 baseline만 5문제라 그 구간에서 체감 빈도가 늘어졌었다.
const WAVE_CYCLE = [
  { type: "baseline", length: 3 },
  { type: "reverse", length: 3 },
  { type: "decoy", length: 3 },
];
const WAVE_CYCLE_TOTAL = WAVE_CYCLE.reduce((sum, wave) => sum + wave.length, 0);

function waveTypeForIndex(index) {
  const pos = index % WAVE_CYCLE_TOTAL;
  let acc = 0;
  for (const wave of WAVE_CYCLE) {
    acc += wave.length;
    if (pos < acc) return wave.type;
  }
  return "baseline"; // 도달할 일 없음(방어용)
}

// 디코이 파도에서, 아직 안 나온 사물 중 previousAnswer와 같은 View에 함께 배치된
// 것을 큐에서 찾아 그 인덱스를 반환한다. candidateScenesFor()는 아래에서 정의되지만
// 함수 선언은 호이스팅되므로 여기서 먼저 참조해도 문제없다.
function findCoLocatedQueueIndex(previousAnswer) {
  const previousScenes = candidateScenesFor(previousAnswer);
  for (let i = riddleQueue.length - 1; i >= 0; i--) {
    const candidateScenes = candidateScenesFor(riddleQueue[i]);
    if (candidateScenes.some((id) => previousScenes.includes(id))) return i;
  }
  return -1;
}

// 첫 진명(waveQuestionIndex === 0) 전용 사물 선정 — 장소 이동과 그 장소 안에서의 View
// 이동을 둘 다 반드시 겪어야 찾아지는 사물을 골라서, 어느 세션에서든 튜토리얼 UX(장소
// 이동 + 사물 가리키기)가 확실히 재생되게 한다. docs/03_판정_연출_시스템.md "첫 진명
// 튜토리얼" 참고.
function defaultSceneIdForPlace(placeId) {
  return Object.keys(DEMO_SCENES).find((id) => DEMO_SCENES[id].place === placeId);
}
function qualifiesForTutorial(name) {
  const scenes = candidateScenesFor(name);
  if (scenes.length === 0) return false;
  return scenes.every((id) => {
    const place = DEMO_SCENES[id].place;
    // library면 애초에 장소 이동이 필요 없고, 그 장소의 기본(첫) View면 장소만
    // 옮겨도 바로 찾아져서 View 이동을 안 겪는다 — 둘 다 배제해야 "장소 이동 →
    // View 이동 → 클릭" 3단계를 항상 지나가게 된다.
    return place !== "library" && id !== defaultSceneIdForPlace(place);
  });
}
function findTutorialQueueIndex() {
  ensureRiddleQueue();
  for (let i = riddleQueue.length - 1; i >= 0; i--) {
    if (qualifiesForTutorial(riddleQueue[i])) return i;
  }
  return -1;
}

function pickNextObjectName(previousAnswer) {
  if (waveQuestionIndex === 0 && solvedObjects.size === 0) {
    // solvedObjects가 이미 있으면(= "이어서 하기"로 불러온 기존 기록) 튜토리얼 대상이
    // 아닌 진짜 신규 플레이어이므로, 이 제약(장소+View 이동을 강제하는 선정) 없이
    // 평소처럼 고른다.
    const tutorialIndex = findTutorialQueueIndex();
    if (tutorialIndex !== -1) return riddleQueue.splice(tutorialIndex, 1)[0];
  }
  if (currentWaveType === "decoy" && previousAnswer) {
    const decoyIndex = findCoLocatedQueueIndex(previousAnswer);
    if (decoyIndex !== -1) return riddleQueue.splice(decoyIndex, 1)[0];
  }
  return nextObjectName();
}

// 현재 진행 중인 진명 상태 — loadNextRiddle()이 매번 갱신한다.
let currentAnswerObject = null;
let currentHints = [];
let currentReveal = "";
// 화면에 뭐가 먼저 보이든(정방향/역방향) 실제 진명 문장은 항상 여기 보관한다 —
// 역방향 파도에서 정답을 맞힌 뒤 사후 공개할 때 씀.
let currentRiddleText = "";
let waveQuestionIndex = -1; // loadNextRiddle 최초 호출에서 0부터 시작하도록 -1에서 출발
let currentWaveType = "baseline";

function loadNextRiddle() {
  waveQuestionIndex++;
  currentWaveType = waveTypeForIndex(waveQuestionIndex);

  const previousAnswer = currentAnswerObject;
  currentAnswerObject = pickNextObjectName(previousAnswer);

  // 이 진명 동안 쓸 Case B 대사 말투를 하나씩 고정으로 뽑아둔다(js/messages.js 참고) —
  // 매번 새로 무작위로 고르면 같은 안내가 반복될 때 appendOrEmphasizeLog의 중복 억제가
  // 깨진다.
  currentCaseB1Template = pickRandomTemplate(CASE_B1_TEMPLATES);
  currentCaseB2Template = pickRandomTemplate(CASE_B2_TEMPLATES);

  const d = TRUENAME_DATA[currentAnswerObject];
  currentHints = d.hints;
  currentReveal = d.reveal;
  currentRiddleText = d.riddle;

  if (currentWaveType === "reverse") {
    // 역방향 파도: 진명 대신 Hint_Level1을 먼저 보여준다. 첫 힌트는 이미 공개된 상태로
    // 시작하므로, 사물 힌트 버튼을 눌렀을 때 hints[1]부터 이어서 공개되게 hintPressCount를
    // 1로 둔다. 힌트 총량 3개 중 1개를 이미 공짜로 줬으니 남은 스택도 2로 줄인다.
    document.getElementById("riddle-text").textContent = currentHints[0];
    hintPressCount = 1;
    hintStackRemaining = 2;
  } else {
    document.getElementById("riddle-text").textContent = currentRiddleText;
    hintPressCount = 0;
    hintStackRemaining = 3;
  }
  updateObjectHintButton();
}

// 사물 힌트 버튼은 항상 눌린다 — 위치에 따라 비활성화했더니, 버튼이 눌리는지 여부
// 자체가 "여기가 정답 장소다"를 클릭 한 번 없이 미리 알려주는 꼴이 돼서 탐색하는
// 재미가 줄어든다는 피드백을 받았다. 그래서 대신 정답 사물이 없는 곳에서 누르면
// "그것은 여기 없다."로 스택만 소모하고 끝난다(handleObjectHintButtonClick) —
// 위치를 확신 못 하고 누르면 손해를 볼 수 있다는 긴장감을 남겨둔다.
function updateObjectHintButton() {
  objectHintButton.textContent = hintStackRemaining > 0 ? `사물 힌트 (${hintStackRemaining})` : "정답 보기";
}

// docs/hotspot_color_map.csv 그대로 — hex(대문자) -> 사물명. 컬러 마스크 클릭 판정에 쓴다.
const HOTSPOT_COLORS = {
  "#D62929": "가면",
  "#29D65B": "가위",
  "#8E29D6": "갑옷",
  "#D6C129": "거울",
  "#29B9D6": "검",
  "#D62987": "계산기",
  "#54D629": "국자",
  "#3029D6": "그릇",
  "#D66329": "깃발",
  "#29D695": "상자",
  "#C829D6": "나침반",
  "#B2D629": "담요",
  "#297FD6": "돋보기",
  "#D6294D": "돗자리",
  "#29D638": "동전",
  "#6A29D6": "두루마리",
  "#D69D29": "라디오",
  "#29D6CF": "리본",
  "#D629AA": "망원경",
  "#78D629": "머그컵",
  "#2945D6": "메달",
  "#D63F29": "모자",
  "#29D672": "목도리",
  "#A429D6": "바구니",
  "#D6D629": "반지",
  "#29A3D6": "방패",
  "#D62970": "배드민턴채",
  "#3ED629": "볼펜",
  "#4629D6": "부채",
  "#D67929": "북",
  "#29D6AC": "빈 의자",
  "#D629CE": "빗",
  "#9CD629": "사진",
  "#2969D6": "손수건",
  "#D62936": "손전등",
  "#29D64E": "수첩",
  "#8029D6": "스케치북",
  "#D6B329": "시계",
  "#29C7D6": "신문",
  "#D62994": "신발",
  "#62D629": "아이스박스",
  "#292FD6": "안경",
  "#D65529": "앞치마",
  "#29D688": "액자",
  "#BA29D6": "여행가방",
  "#BFD629": "연",
  "#298DD6": "열쇠",
  "#D6295A": "오르골",
  "#29D62A": "왕관",
  "#5D29D6": "우산",
  "#D68F29": "우유병",
  "#29D6C2": "우표",
  "#D629B8": "인형",
  "#85D629": "자루",
  "#2953D6": "자물쇠",
  "#D63129": "잡지",
  "#29D664": "장갑",
  "#9629D6": "저금통",
  "#D6C929": "저울",
  "#29B1D6": "종",
  "#D6297E": "주사위",
  "#4CD629": "주전자",
  "#3929D6": "지갑",
  "#D66B29": "지구본",
  "#29D69E": "지도",
  "#D029D6": "지우개",
  "#A9D629": "지팡이",
  "#2977D6": "책",
  "#D62944": "촛대",
  "#29D640": "축구공",
  "#7329D6": "커피",
  "#D6A529": "팽이",
  "#29D5D6": "편지",
  "#D629A2": "테이프",
  "#6FD629": "풍선",
  "#293DD6": "항아리",
  "#D64729": "호루라기",
  "#29D67A": "화병",
  "#AD29D6": "조개껍데기",
  "#CDD629": "확성기",
};

// 25개 View 전체가 배경 하나(tex_seq_Base.png) + 마스크 하나(tex_seq_Mask.png)의
// 4열×7행 시퀀스 텍스처(각 셀 1280×720, 16:9)에 다 들어있다. 셀 순서는 RAW_PLACE_DATA와
// 정확히 같은 순서(row-major)라 별도 매핑 없이 배열 인덱스에서 바로 col/row를 계산한다 —
// 실제 픽셀로 검증 완료(cell(0,0)이 열람실 마스크의 촛대 색 #D62944와 정확히 일치).
const ATLAS = {
  background: "img/tex_seq_Base.png",
  hotspots: "img/tex_seq_Mask.png",
  cols: 4,
  rows: 7,
  cellWidth: 1280,
  cellHeight: 720,
};

// 마스크 아틀라스는 전체를 한 번만 로드해서 오프스크린 캔버스에 원본 해상도 그대로 그려두고
// (리샘플링 금지 — 10_히트박스_시스템.md), View마다 그 캔버스에서 자기 셀 영역만 잘라 쓴다.
let atlasMaskCtxPromise = null;
function loadAtlasMaskCtx() {
  if (atlasMaskCtxPromise) return atlasMaskCtxPromise;
  atlasMaskCtxPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      resolve(ctx);
    };
    img.onerror = () => reject(new Error("아틀라스 마스크 이미지를 불러오지 못했습니다: " + ATLAS.hotspots));
    img.src = ATLAS.hotspots;
  });
  return atlasMaskCtxPromise;
}

// 이 View의 셀 영역(sumX/sumY 계산은 셀 내부 상대좌표 기준)에서 사물별 중심 좌표(centroid,
// 셀 대비 %)를 계산해둔다. 정답/오답 시 사물 위에 마커를 띄우던 용도로 만들었으나 그
// 연출은 제거했다 — 지금은 안 쓰이지만, 나중에 진명 기록(도감) 표시 위치 등에 재사용할
// 수 있어 계산만 남겨둔다(04_진행시스템.md 참고).
function loadMask(scene) {
  if (scene.maskPromise) return scene.maskPromise;
  if (location.protocol === "file:") {
    // file://로 index.html을 직접 열면 <canvas>가 "오염(tainted)" 상태로 취급되어
    // getImageData()가 SecurityError를 던진다 — 반드시 로컬 서버(.claude/launch.json의
    // http.server 등)를 통해 http://localhost:PORT 로 열어야 마스크 판정이 동작한다.
    console.error(
      "[hitbox] file:// 경로에서는 컬러 마스크를 읽을 수 없습니다(캔버스 보안 제한). " +
        "로컬 서버(예: python -m http.server)로 열어주세요 — 지금은 모든 클릭이 빈 공간으로 처리됩니다."
    );
  }
  scene.maskPromise = loadAtlasMaskCtx()
    .then((atlasCtx) => {
      const { col, row } = scene.realAssets;
      const ox = col * ATLAS.cellWidth;
      const oy = row * ATLAS.cellHeight;

      let imageData;
      try {
        imageData = atlasCtx.getImageData(ox, oy, ATLAS.cellWidth, ATLAS.cellHeight);
      } catch (err) {
        console.error("[hitbox] 마스크 픽셀을 읽을 수 없습니다 — " + err.message);
        return;
      }
      const { data, width, height } = imageData;
      const sums = {}; // 사물명 -> {sumX, sumY, count} (셀 내부 상대좌표 기준)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r === 0 && g === 0 && b === 0) continue; // 빈 배경
          const hex =
            "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
          const name = HOTSPOT_COLORS[hex];
          if (!name) continue; // 색표에 없는 색(안티앨리어싱 등 마스크 제작 실수) — 무시
          const s = sums[name] || (sums[name] = { sumX: 0, sumY: 0, count: 0 });
          s.sumX += x;
          s.sumY += y;
          s.count++;
        }
      }
      const centroids = {};
      Object.keys(sums).forEach((name) => {
        const s = sums[name];
        centroids[name] = {
          xPercent: (s.sumX / s.count / width) * 100,
          yPercent: (s.sumY / s.count / height) * 100,
        };
      });

      scene.atlasCtx = atlasCtx;
      scene.atlasOffsetX = ox;
      scene.atlasOffsetY = oy;
      scene.maskWidth = ATLAS.cellWidth;
      scene.maskHeight = ATLAS.cellHeight;
      scene.centroids = centroids;
    })
    .catch((err) => console.error("[hitbox] " + err.message));
  return scene.maskPromise;
}

// 화면 클릭 좌표 -> 배경 이미지 안에서의 비율(0~1) -> 마스크 원본 픽셀 좌표로 환산해
// 그 픽셀 색을 읽고 사물명을 찾는다 (10_히트박스_시스템.md "실행 시 판정 방식" 그대로).
function resolveMaskClick(scene, clientX, clientY) {
  if (!scene.atlasCtx) return null;
  const rect = sceneFrame.getBoundingClientRect();
  const ratioX = (clientX - rect.left) / rect.width;
  const ratioY = (clientY - rect.top) / rect.height;
  if (ratioX < 0 || ratioX > 1 || ratioY < 0 || ratioY > 1) return null;
  const px = Math.min(scene.maskWidth - 1, Math.floor(ratioX * scene.maskWidth));
  const py = Math.min(scene.maskHeight - 1, Math.floor(ratioY * scene.maskHeight));
  const [r, g, b] = scene.atlasCtx.getImageData(scene.atlasOffsetX + px, scene.atlasOffsetY + py, 1, 1).data;
  if (r === 0 && g === 0 && b === 0) return null; // 빈 공간
  const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  return HOTSPOT_COLORS[hex] || null;
}

// 정답 시 사물 위를 덮던 단단한 원형 마커(배경색 꽉 찬 원)는 사물을 가려서 뺐지만,
// 그 주변에 번지던 주황색 글로우는 남겨달라는 피드백을 반영해 이 dot은 여전히 사물의
// centroid에 위치시켜둔다 — 실제로 화면에 보이는 건 handleClick()이 정답일 때만
// className을 "correct-glow"로 바꿔 붙이는 순간부터다(오답이면 계속 빈 채로 남아
// 아무것도 렌더링되지 않는다). dataset.transient는 handleClick()의 정리 로직이 쓴다.
function makeTransientDot(scene, name) {
  // scene.centroids는 loadMask()가 비동기로 채운다 — 아직 안 끝났으면(드물지만 "정답
  // 보기"를 아주 빨리 누르는 경우 등) undefined일 수 있어 옵셔널 체이닝으로 방어한다.
  const centroid = scene.centroids?.[name] || { xPercent: 50, yPercent: 50 };
  const dot = document.createElement("div");
  dot.dataset.transient = "true";
  dot.style.left = centroid.xPercent + "%";
  dot.style.top = centroid.yPercent + "%";
  return dot;
}

function autoLayout(count) {
  const cols = 4;
  return Array.from({ length: count }, (_, i) => ({
    x: 15 + (i % cols) * 23,
    y: Math.floor(i / cols) === 0 ? 35 : 68,
  }));
}

// RAW_PLACE_DATA가 fetch로 채워진 뒤에 loadContent()가 호출한다 — 그 전에는
// DEMO_SCENES가 비어있는 채로 남아있는다(이 시점엔 아무도 참조하지 않는다).
const DEMO_SCENES = {};
function buildDemoScenes() {
  RAW_PLACE_DATA.forEach(([placeId, koLabel, objectNames], sceneIndex) => {
  const positions = autoLayout(objectNames.length);
  const slug = VIEW_SLUGS[koLabel];
  DEMO_SCENES[slug] = {
    place: placeId,
    label: koLabel,
    hotspots: objectNames.map((name, i) => ({
      name,
      x: positions[i].x,
      y: positions[i].y,
    })),
    // RAW_PLACE_DATA 순서가 tex_seq_Base/Mask.png의 4열×7행 셀 순서와 정확히 같아서
    // (픽셀로 검증됨), 배열 인덱스에서 바로 col/row를 계산한다.
    realAssets: { col: sceneIndex % ATLAS.cols, row: Math.floor(sceneIndex / ATLAS.cols) },
  };
  });
}

// 첫 진명 전용 튜토리얼 대사 — 별도 튜토리얼 화면 없이, 첫 진명 자체가 조작법을
// 알려주게 한다. maybeShowTutorialGuidance() 참고.
const TUTORIAL_POINT_HINT = "해당 물건을 가리켜보아라. 클릭 및 터치로 가리킬 수 있다.";
// INTRO_LINES는 js/intro.js에서 정의된다 (index.html에서 game.js보다 먼저 로드).

// 한국어 조사(을/를, 으로/로)는 받침 유무에 따라 달라져서, 장소/View 이름이
// 뭐가 오든 문법이 안 깨지게 헬퍼로 처리한다.
function hasBatchim(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}
function withParticle(word, withBatchim, withoutBatchim) {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}
// Case B 대사 템플릿(CASE_B1_TEMPLATES/CASE_B2_TEMPLATES)은 js/messages.js에 있다.
// 진명 하나당 템플릿을 하나씩 무작위로 골라 loadNextRiddle()에서 고정해두고, 이 두
// 함수는 그 고정된 템플릿에 장소/View 이름만 끼워 넣는다 — 매번 새로 무작위로 고르면
// 같은 안내가 반복될 때 appendOrEmphasizeLog의 중복 억제가 깨진다(아래 "반복되는 로그
// 문구는 새 줄 대신 강조" 참고, docs/03_판정_연출_시스템.md).
let currentCaseB1Template = CASE_B1_TEMPLATES[0];
let currentCaseB2Template = CASE_B2_TEMPLATES[0];
function pickRandomTemplate(templates) {
  return templates[Math.floor(Math.random() * templates.length)];
}
function caseB1Message(placeLabel) {
  return currentCaseB1Template(placeLabel);
}
function caseB2Message(sceneLabel) {
  return currentCaseB2Template(sceneLabel);
}

const sceneView = document.getElementById("scene-view");
const sceneFrame = document.getElementById("scene-frame");
const sceneBg = document.getElementById("scene-bg");
const dimOverlay = document.getElementById("dim-overlay");
const logEl = document.getElementById("log");
const infoPanel = document.getElementById("info-panel");
const panelToggle = document.getElementById("panel-toggle");
const placeSwitcher = document.getElementById("place-switcher");
const sceneSwitcher = document.getElementById("scene-switcher");
const continuePrompt = document.getElementById("continue-prompt");
const placeTransition = document.getElementById("place-transition");
const codexToggle = document.getElementById("codex-toggle");
const codexOverlay = document.getElementById("codex-overlay");
const codexClose = document.getElementById("codex-close");
const codexList = document.getElementById("codex-list");
const codexProgress = document.getElementById("codex-progress");
const objectHintButton = document.getElementById("object-hint-button");
const locationHintButton = document.getElementById("location-hint-button");

// ---------- 오디오 ----------
// Audio/03_생성_프롬프트.md 스펙으로 생성한 파일들 — audio/sfx, audio/ambience, audio/music.
// sfx_place_complete/sfx_ending_full/sfx_ending_partial은 그 상태(장소 매듭/엔딩 도달)를
// 판정하는 게임 로직 자체가 아직 없어서(docs/TODO.md "게임 시스템 — 기획서엔 있지만
// 미구현" 참고) 여기 연결하지 않는다 — audio/sfx/에 파일만 미리 둔다.
const SFX_FILES = {
  correct: "audio/sfx/sfx_correct_answer.wav",
  wrong: "audio/sfx/sfx_wrong_answer.wav",
  empty: "audio/sfx/sfx_empty_click.wav",
  hint: "audio/sfx/sfx_hint_button.wav",
  reveal: "audio/sfx/sfx_reveal_answer.wav",
  transition: "audio/sfx/sfx_place_transition.wav",
};
const SFX_VOLUME = 0.6;
function playSfx(name) {
  const src = SFX_FILES[name];
  if (!src) return;
  // 매번 새 Audio 인스턴스를 만들어 재생한다 — 연달아 오답을 눌러도(shakeScene처럼
  // 재시작 애니메이션이 아니라) 이전 재생과 겹쳐서 들리게 하기 위함. 브라우저가
  // 리소스는 캐싱하므로 매번 새로 받아오지 않는다.
  const audio = new Audio(src);
  audio.volume = SFX_VOLUME;
  audio.play().catch(() => {}); // 자동재생 차단 등은 조용히 무시 — 게임 플레이엔 지장 없어야 함
}

// 장소별 앙비언스 — 01_톤_방향.md "여백을 존중한다" 원칙대로 SFX보다 훨씬 낮은 볼륨.
const AMBIENCE_FILES = {
  library: "audio/ambience/amb_library.mp3",
  station: "audio/ambience/amb_station.mp3",
  museum: "audio/ambience/amb_museum.mp3",
  "post-office": "audio/ambience/amb_post_office.mp3",
  market: "audio/ambience/amb_market.mp3",
  cafe: "audio/ambience/amb_cafe.mp3",
  park: "audio/ambience/amb_park.mp3",
};
const ambienceAudio = new Audio();
ambienceAudio.loop = true;
ambienceAudio.volume = 0.22;
let ambiencePlaceId = null;
// renderPlace()가 매번 호출한다 — playBlinkTransition의 swapContent 안에서 실행되므로
// 화면이 완전히 암전된 순간(HOLD)에 트랙이 바뀌어 전환이 귀에 거슬리지 않는다.
function playAmbienceForPlace(placeId) {
  if (placeId === ambiencePlaceId) return;
  const src = AMBIENCE_FILES[placeId];
  if (!src) return;
  ambiencePlaceId = placeId;
  ambienceAudio.src = src;
  ambienceAudio.play().catch(() => {});
}

const introMusic = new Audio("audio/music/music_intro.mp3");
introMusic.loop = true;
introMusic.volume = 0.35;
introMusic.play().catch(() => {}); // 인트로 시작과 동시에 시도 — 자동재생 정책에 막히면 아래에서 재시도

// 01_톤_방향.md "잽스케어성 급격한 볼륨 변화 금지" — 인트로 종료 시 뚝 끊지 않고
// 짧게 페이드아웃한다.
function fadeOutAndPause(audio, durationMs) {
  const startVolume = audio.volume;
  const steps = 10;
  let i = 0;
  const timer = setInterval(() => {
    i++;
    audio.volume = Math.max(0, startVolume * (1 - i / steps));
    if (i >= steps) {
      clearInterval(timer);
      audio.pause();
      audio.volume = startVolume; // 다음 재생을 위해 원래 볼륨으로 복원
    }
  }, durationMs / steps);
}
function stopIntroMusic() {
  fadeOutAndPause(introMusic, 500);
}

// 브라우저 자동재생 정책상 사용자가 페이지와 한 번도 상호작용하기 전엔 소리가 막힐 수
// 있다 — 첫 클릭/터치에서 인트로 음악(과 이미 재생 시도된 앙비언스)을 한 번 더 시도한다.
function unlockAudioOnFirstInteraction() {
  introMusic.play().catch(() => {});
  if (ambiencePlaceId) ambienceAudio.play().catch(() => {});
  document.removeEventListener("pointerdown", unlockAudioOnFirstInteraction);
}
document.addEventListener("pointerdown", unlockAudioOnFirstInteraction);

// 장소 전환 블링크 타이밍(ms). 눈이 감겼다 뜨는 리듬을 흉내낸 것 — 감을 때는
// 짧고 급하게(ease-in), 뜰 때는 그보다 살짝 느긋하게(ease-out) 움직인다.
// 완전히 닫힌 상태(HOLD)일 때 실제 장소/View 내용을 교체해서 전환이 안 보이게 한다.
const BLINK_CLOSE_MS = 130;
const BLINK_HOLD_MS = 100;
const BLINK_OPEN_MS = 140;

const visitedScenes = new Set();
let currentPlaceId = null;
let currentSceneId = null;
// 힌트 버튼 3스택 시스템(docs/03_판정_연출_시스템.md "힌트 버튼") — hintPressCount는
// 다음에 Case A가 걸렸을 때 currentHints의 몇 번째(Hint_Level)를 보여줄지, hintStackRemaining은
// 남은 버튼 클릭 횟수를 추적한다. 둘 다 loadNextRiddle()이 파도 종류에 맞게 초기화한다.
let hintPressCount = 0;
let hintStackRemaining = 3;
let solved = false;
let isBlinking = false;

// 저장/불러오기 — 지금은 진명 기록(도감)의 뼈대인 solvedObjects(맞춘 사물명 집합)만
// localStorage에 저장한다. 진행 중이던 진명 자체(currentAnswerObject, hintStep 등)나
// 파도 사이클 위치는 저장하지 않고 새 세션마다 처음부터 다시 돈다 — "지금까지 모은
// 것이 안 사라진다"는 핵심만 우선 구현. 나머지 저장 값(solveMethod, locationsCleared,
// endingsUnlocked, hintStack 등)은 그 시스템들 자체가 아직 없어서 다음 확장 대상이다
// (docs/04_진행시스템.md 참고).
const SAVE_KEY = "sinuieoneo:save:v1";
let solvedObjects = new Set();

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.solvedObjects)) return null;
    return data;
  } catch (err) {
    console.error("[save] 저장 데이터를 읽지 못했습니다 — " + err.message);
    return null;
  }
}

function saveGame() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, solvedObjects: [...solvedObjects], savedAt: Date.now() })
    );
  } catch (err) {
    // 프라이빗 브라우징/저장공간 제한 등으로 실패할 수 있음 — 저장이 안 되더라도
    // 게임 플레이 자체는 계속 가능해야 하므로 조용히 넘어간다.
    console.error("[save] 저장하지 못했습니다 — " + err.message);
  }
}

function appendLog(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  logEl.appendChild(p);
  // 실제 스크롤 컨테이너는 #log가 아니라 #info-panel이라 scrollIntoView로 맞춘다.
  p.scrollIntoView({ behavior: "smooth", block: "end" });
}

// 위치 안내(Case B)나 힌트 소진 메시지처럼, 같은 상황이 유지되는 동안 오답을 낼 때마다
// 그대로 반복되는 문구가 있다. 그럴 때마다 새 줄을 쌓으면 로그가 계속 길어지고 스크롤이
// 생기므로, 로그의 마지막 줄과 내용이 같으면 새로 추가하지 않고 그 줄을 0.2초 흔들어
// 다시 눈에 띄게만 한다. 내용이 다르면(예: 힌트 단계가 올라감) 평소처럼 새 줄을 추가한다.
function appendOrEmphasizeLog(text, className) {
  const lastP = logEl.lastElementChild;
  if (lastP && lastP.textContent === text) {
    lastP.classList.remove("emphasize");
    void lastP.offsetWidth; // reflow로 애니메이션 재시작
    lastP.classList.add("emphasize");
    return;
  }
  appendLog(text, className);
}

function buildPlaceSwitcher() {
  Object.keys(DEMO_PLACES).forEach((placeId) => {
    const btn = document.createElement("button");
    btn.textContent = DEMO_PLACES[placeId].label;
    btn.dataset.place = placeId;
    btn.addEventListener("click", () => {
      // 정답 연출(암전) 확인 전이거나, 블링크 재생 중이거나, 이미 그 장소면 무시.
      if (solved || isBlinking || placeId === currentPlaceId) return;
      playBlinkTransition(() => renderPlace(placeId));
    });
    placeSwitcher.appendChild(btn);
  });
}

// 중앙의 밝은 구멍(::before)을 화면 전체 크기->0으로 좁혀 가장자리부터 암전시키고,
// 완전히 덮인 순간 swapContent()로 실제 내용을 바꾼 뒤 다시 0->전체 크기로 넓혀서 연다.
function playBlinkTransition(swapContent) {
  isBlinking = true;
  playSfx("transition");
  placeTransition.classList.remove("opening");
  placeTransition.classList.add("closed"); // 130ms ease-in으로 닫힘

  setTimeout(() => {
    swapContent(); // 화면이 완전히 검게 덮인 순간에 교체
    setTimeout(() => {
      placeTransition.classList.add("opening"); // 140ms ease-out으로 열림
      placeTransition.classList.remove("closed");
      setTimeout(() => {
        placeTransition.classList.remove("opening");
        isBlinking = false;
      }, BLINK_OPEN_MS);
    }, BLINK_HOLD_MS);
  }, BLINK_CLOSE_MS);
}

function renderPlace(placeId) {
  currentPlaceId = placeId;
  playAmbienceForPlace(placeId);
  document.querySelectorAll("#place-switcher button").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.place === placeId)
  );

  // 이 장소 소속 View 버튼들을 새로 그린다 (View 목록은 장소마다 다르므로 매번 재생성).
  sceneSwitcher.innerHTML = "";
  const sceneIds = Object.keys(DEMO_SCENES).filter(
    (id) => DEMO_SCENES[id].place === placeId
  );
  sceneIds.forEach((id) => {
    const btn = document.createElement("button");
    btn.textContent = DEMO_SCENES[id].label;
    btn.dataset.scene = id;
    btn.addEventListener("click", () => { if (!solved && !isBlinking) renderScene(id); });
    sceneSwitcher.appendChild(btn);
  });

  renderScene(sceneIds[0]);
}

function renderScene(id) {
  currentSceneId = id;
  visitedScenes.add(id); // Case B에서 "안 가본 곳 우선" 안내에 쓴다.
  // hintStep은 여기서 리셋하지 않는다 — 장소를 옮겨도 힌트 진행은 유지되고,
  // 새 진명이 시작될 때(handleContinueClick)만 리셋된다.

  const scene = DEMO_SCENES[id];
  document.querySelectorAll(".hotspot").forEach((el) => el.remove());

  if (scene.realAssets) {
    // 실제 배경/마스크가 있는 View — 시퀀스 텍스처(ATLAS)에서 이 View의 셀만 보이도록
    // background-position/size로 잘라 보여주고, 클릭은 마스크 색으로 판정한다(아래
    // sceneFrame의 공용 click 리스너에서 처리). 좌표 기반 .hotspot dot은 안 만든다.
    const { col, row } = scene.realAssets;
    sceneBg.textContent = "";
    sceneBg.style.backgroundImage = `url(${ATLAS.background})`;
    sceneBg.style.backgroundSize = `${ATLAS.cols * 100}% ${ATLAS.rows * 100}%`;
    sceneBg.style.backgroundPosition =
      `${(col / (ATLAS.cols - 1)) * 100}% ${(row / (ATLAS.rows - 1)) * 100}%`;
    loadMask(scene);
  } else {
    sceneBg.style.backgroundImage = "";
    sceneBg.textContent = `[배경 이미지 자리 — ${scene.label}]`;
    scene.hotspots.forEach((h) => {
      const dot = document.createElement("div");
      dot.className = "hotspot";
      dot.style.left = h.x + "%";
      dot.style.top = h.y + "%";
      dot.addEventListener("click", () => handleClick(h, dot));
      sceneFrame.appendChild(dot);
    });
  }

  // scene-switcher 버튼은 renderPlace()에서 매번 새로 만들어지므로 매번 다시 조회한다.
  document.querySelectorAll("#scene-switcher button").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.scene === id)
  );

  maybeShowTutorialGuidance(); // 첫 진명이 아니면 내부에서 즉시 반환됨
}

// 정답 사물명을 가진 hotspot이 있는 모든 View id를 찾는다 (복수 정답 지원).
function candidateScenesFor(objectName) {
  return Object.keys(DEMO_SCENES).filter((id) =>
    DEMO_SCENES[id].hotspots.some((h) => h.name === objectName)
  );
}

// 후보 중 "아직 안 가본 곳"을 우선한다. 전부 가본 상태면 그냥 첫 번째.
function pickPreferUnvisited(sceneIds) {
  const unvisited = sceneIds.filter((id) => !visitedScenes.has(id));
  return (unvisited.length ? unvisited : sceneIds)[0];
}

// 정답 사물이 현재 View에 없을 때(Case B) 어디로 가야 하는지 안내 문구를 만든다.
// 실제 오답 클릭(handleClick)과 첫 진명 튜토리얼 선제 안내(maybeShowTutorialGuidance)가
// 이 함수를 공유한다 — 둘 다 "같은 장소면 View만, 다른 장소면 장소부터" 안내 로직은 동일해야
// 하기 때문(안내 문구가 서로 달라지면 튜토리얼이 실제 게임 동작과 어긋나 보인다).
function buildCaseBMessage(candidates) {
  const samePlaceCandidates = candidates.filter((id) => DEMO_SCENES[id].place === currentPlaceId);
  if (samePlaceCandidates.length > 0) {
    // Case B-2: 같은 장소 안에 후보 View가 있음 → 안 가본 곳 우선으로 그 View를 안내
    const targetSceneId = pickPreferUnvisited(samePlaceCandidates);
    return caseB2Message(DEMO_SCENES[targetSceneId].label);
  }
  // Case B-1: 이 장소엔 후보가 하나도 없음 → 후보가 있는 장소 중 안 가본 곳 우선으로 안내
  const candidatePlaceIds = [...new Set(candidates.map((id) => DEMO_SCENES[id].place))];
  const placesWithUnvisited = candidatePlaceIds.filter((placeId) =>
    candidates.some((id) => DEMO_SCENES[id].place === placeId && !visitedScenes.has(id))
  );
  const targetPlaceId = (placesWithUnvisited.length ? placesWithUnvisited : candidatePlaceIds)[0];
  return caseB1Message(DEMO_PLACES[targetPlaceId].label);
}

// 튜토리얼: 첫 진명(waveQuestionIndex === 0)이면서 도감 기록이 비어있는(solvedObjects.size
// === 0, 즉 세이브를 불러오지 않은 진짜 신규 플레이어인) 경우에 한해서만, 장면이 바뀔
// 때마다(장소 이동, View 이동 전부 포함) 플레이어가 실제로 오답을 내기를 기다리지 않고
// 지금 상황에 맞는 Case A/B 안내를 선제적으로 보여준다 — renderScene()이 매번 호출한다.
// "이어서 하기"로 기존 기록을 불러온 경우엔 waveQuestionIndex가 0이어도(세션은 새로
// 시작하니까) 튜토리얼을 다시 보여주지 않는다. 문구는 실제 Case A/B와 완전히 같은 걸
// 재사용해서(buildCaseBMessage), 튜토리얼이 실제 게임과 다른 말을 하는 일이 없게 한다.
// 장소만 옮기고 아직 정답 View가 아닌 채로 머무는 경우(예: 정답의 장소는 맞혔지만 그
// 장소의 기본 View라 아직 못 찾는 경우)에도 매번 다시 안내가 나가야 "이동했는데 아무
// 반응이 없다"는 느낌이 없다 — 대신 매번 새 줄을 쌓지 않고 appendOrEmphasizeLog로
// 처리해서, 같은 곳을 왔다 갔다 해도 로그가 무한히 길어지지 않는다.
function maybeShowTutorialGuidance() {
  if (waveQuestionIndex !== 0 || solvedObjects.size !== 0) return;
  const candidates = candidateScenesFor(currentAnswerObject);
  if (candidates.includes(currentSceneId)) {
    appendOrEmphasizeLog(TUTORIAL_POINT_HINT, "guide");
  } else {
    appendOrEmphasizeLog(buildCaseBMessage(candidates), "guide");
  }
}

// 오답 클릭 시 반응 대사(정답 사물이 이 View 안에 있는데 다른 걸 클릭한 경우). 매번
// 같은 문구라 appendOrEmphasizeLog로 처리해서 연달아 오답을 내도 로그가 안 쌓인다.
const WRONG_REACTION = "그것은 내가 부른 이름이 아니다.";

// 정답 판정(직접 클릭이든 "정답 보기"든) 공통 처리. dotEl은 글로우/스포트라이트 위치용 —
// "정답 보기"로 부를 땐 실제 클릭 지점이 없으므로 makeTransientDot()의 centroid 기본값
// (화면 중앙, 50%/50%)으로 대체된다. viaReveal이 true면(정답 보기 경로) 스스로 찾았을 때와
// 소리를 구분한다(SFX/05_정답보기버튼.md — 같은 "금색" 계열이지만 더 옅고 덜 만족스럽게).
function solveCurrentRiddle(dotEl, viaReveal) {
  playSfx(viaReveal ? "reveal" : "correct");
  solved = true;
  solvedObjects.add(currentAnswerObject); // 도감 기록 — "정답 보기"로 확인해도 스스로 찾은 것과 동일하게 기록
  saveGame();
  dotEl.className = "correct-glow"; // 사물을 덮는 단단한 원 없이, centroid에서 번지는 글로우만
  sceneFrame.appendChild(dotEl);
  // 암전(#dim-overlay)이 화면 전체를 균일하게 덮지 않고, 정답 사물의 centroid를 중심으로
  // 구멍을 남기며 어두워지게 한다(radial-gradient 위치를 CSS 변수로 넘김) — glow와 같은
  // centroid를 쓰므로 dotEl에 이미 설정된 left/top(%) 값을 그대로 재사용한다.
  dimOverlay.style.setProperty("--spot-x", dotEl.style.left || "50%");
  dimOverlay.style.setProperty("--spot-y", dotEl.style.top || "50%");
  dimOverlay.classList.add("active");
  appendLog(currentReveal, "reveal");
  if (currentWaveType === "reverse") {
    // 역방향 파도 — 정답을 먼저 확인시키고, 그 사물의 원래 진명(리들)을
    // 뒤늦게 공개한다("찾고 나서야 뜻을 알게 되는" 여운).
    setTimeout(() => appendLog(currentRiddleText, "echo"), 600);
  }
  // 해설이 다 나오고(로그 페이드인 0.4s) 약 1초 뒤에 "클릭하여 계속" 안내를 띄운다.
  setTimeout(showContinuePrompt, 1400);
}

function handleClick(hotspot, dotEl) {
  if (solved || isBlinking) return;

  if (hotspot.name === currentAnswerObject) {
    solveCurrentRiddle(dotEl);
    return;
  }

  // 오답 클릭은 힌트(Hint_Level)와는 완전히 분리됐다 — 그건 오직 힌트 버튼을 눌러야만
  // 나온다. 다만 위치 안내(Case B)는 사물의 특징을 좁혀주는 정보가 아니라 그냥
  // 길찾기라서, 오답 클릭만으로도 무료로·자동으로 알려준다. 정답 사물이 이 View
  // 안에 있는데 다른 걸 클릭했을 때만(Case A) 짧은 반응 한 줄로 그친다.
  shakeScene();
  playSfx("wrong");
  const candidates = candidateScenesFor(currentAnswerObject);
  if (candidates.includes(currentSceneId)) {
    appendOrEmphasizeLog(WRONG_REACTION, "hint");
  } else {
    appendOrEmphasizeLog(buildCaseBMessage(candidates), "guide");
  }
  dotEl.classList.add("wrong-flash");
  setTimeout(() => {
    // 마스크 클릭으로 만든 임시 dot은 완전히 지운다 — placeholder dot은 계속 남아있어야 함.
    if (dotEl.dataset.transient) dotEl.remove();
    else dotEl.classList.remove("wrong-flash");
  }, 300);
}

// 정답 사물이 지금 이 View에 없는데 사물 힌트 버튼을 눌렀을 때 뜨는 문구 — 위치를
// 확신 못 하고 사물 힌트를 눌러버리면 새 정보 없이 스택만 날린다는 뜻이다. 장소 힌트
// (완전 무료)로 먼저 확인하고 오는 게 더 안전하다는 긴장감을 의도적으로 남겨둔다.
const OBJECT_HINT_WRONG_PLACE = "그것은 여기 없다.";

// 사물 힌트 버튼 클릭 — 항상 눌리고, 항상 스택을 소모한다(위치가 틀려도 마찬가지 —
// 위 OBJECT_HINT_WRONG_PLACE 참고). 스택을 다 썼으면(버튼이 "정답 보기") 어느
// 위치에서 눌러도 항상 정답을 공개한다.
function handleObjectHintButtonClick() {
  if (solved || isBlinking) return;

  if (hintStackRemaining <= 0) {
    // "정답 보기" — 실제 클릭 지점이 없으니 centroid 기본값(화면 중앙)에 글로우를 띄운다.
    solveCurrentRiddle(makeTransientDot(DEMO_SCENES[currentSceneId], currentAnswerObject), true);
    return;
  }

  hintStackRemaining--;
  playSfx("hint");
  if (candidateScenesFor(currentAnswerObject).includes(currentSceneId)) {
    // Hint_Level을 "Case A로 눌린 횟수" 순서대로 공개한다.
    appendLog(currentHints[hintPressCount], "hint");
    hintPressCount++;
  } else {
    appendOrEmphasizeLog(OBJECT_HINT_WRONG_PLACE, "hint");
  }
  updateObjectHintButton();
}

// 정답 사물이 지금 이 View에 있을 때 뜨는 확인 문구 — 위치 안내(caseB1/2Message)의
// "없다" 쪽과 짝을 이루는 "있다" 쪽. caseB2Message와 같은 문법(조사 없이 "여기")을 쓴다.
const LOCATION_HERE_MESSAGE = "그것은 여기 있다.";

// 장소 힌트 버튼 클릭 — 스택과 무관하게 항상 무료다. 정답 사물이 이 View에 있으면
// "여기 있다"로 확인만 해주고(사물 자체가 무엇인지는 알려주지 않음 — 그건 사물 힌트의
// 몫), 없으면 평소와 같은 위치 안내(Case B)를 보여준다. 오답 클릭 시 자동으로 뜨는
// 위치 안내와 같은 로직(buildCaseBMessage)을 공유한다.
function handleLocationHintButtonClick() {
  if (solved || isBlinking) return;

  playSfx("hint");
  const candidates = candidateScenesFor(currentAnswerObject);
  if (candidates.includes(currentSceneId)) {
    appendOrEmphasizeLog(LOCATION_HERE_MESSAGE, "guide");
  } else {
    appendOrEmphasizeLog(buildCaseBMessage(candidates), "guide");
  }
}

function showContinuePrompt() {
  dimOverlay.classList.add("awaiting-continue");
  continuePrompt.classList.add("show");
  dimOverlay.addEventListener("click", handleContinueClick, { once: true });
}

function handleContinueClick(e) {
  e.stopPropagation(); // sceneFrame의 빈 공간 클릭(리플) 리스너로 버블링되지 않게 막는다.
  dimOverlay.classList.remove("active", "awaiting-continue");
  continuePrompt.classList.remove("show");
  document.querySelectorAll(".correct-glow").forEach((el) => {
    if (el.dataset.transient) el.remove();
    else el.className = "hotspot"; // 이론상 placeholder(비-mask) 모드의 영구 dot이면 원래 모습으로 복귀
  });
  solved = false;
  // hintPressCount/hintStackRemaining/힌트 버튼 라벨은 loadNextRiddle() 안에서 파도
  // 종류에 맞게 설정한다 — 새 진명이 시작되는 지점이므로 리셋도 거기서만 일어난다.
  logEl.innerHTML = ""; // 힌트/오답 로그도 새 진명 시작 시 초기화 — 계속 쌓이면 스크롤 압박이 생김.
  loadNextRiddle();
}

function shakeScene() {
  sceneFrame.classList.remove("shake");
  void sceneFrame.offsetWidth; // reflow로 애니메이션 재시작
  sceneFrame.classList.add("shake");
}

// 빈 공간 클릭: 오답으로 취급하지 않는다 (흔들림·힌트 없음). 리플만 남겨서
// 클릭이 씹히지 않았다는 것만 알려준다. 실제 사물(.hotspot) 클릭은 이 리스너
// 이전에 자신의 핸들러가 이미 처리했으므로 closest 체크로 걸러낸다.
sceneFrame.addEventListener("click", (e) => {
  if (solved || isBlinking) return;
  if (e.target.closest(".hotspot")) return;

  const scene = DEMO_SCENES[currentSceneId];
  if (scene.realAssets && scene.atlasCtx) {
    const matchedName = resolveMaskClick(scene, e.clientX, e.clientY);
    if (matchedName) {
      handleClick({ name: matchedName }, makeTransientDot(scene, matchedName));
      return;
    }
    // 검정(빈 공간) 클릭이면 아래 리플 처리로 그대로 넘어간다.
  }

  playSfx("empty");
  const rect = sceneFrame.getBoundingClientRect();
  const ripple = document.createElement("div");
  ripple.className = "ripple";
  ripple.style.left = e.clientX - rect.left + "px";
  ripple.style.top = e.clientY - rect.top + "px";
  sceneFrame.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

buildPlaceSwitcher();

panelToggle.addEventListener("click", () => {
  const open = infoPanel.classList.toggle("open");
  panelToggle.textContent = open ? "▼ 닫기" : "▲ 신의 말";
});

// 진명 기록(도감) — 사물을 게임 화면 안에서 직접 표시(외곽선/빛)하는 대신, 열고 닫는
// 목록 패널로 범위를 좁혔다. 찾은 사물은 이름을, 아직 못 찾은 사물은 이름 글자 수만큼
// "*"로 가려서 보여준다("이 사물이 어딘가 있다"는 것만 알려주고 무엇인지는 숨김).
// 열 때마다 다시 그려서 방금 찾은 것까지 바로 반영한다.
function renderCodex() {
  const names = Object.keys(TRUENAME_DATA).sort((a, b) => a.localeCompare(b, "ko"));
  codexList.innerHTML = "";
  names.forEach((name) => {
    const found = solvedObjects.has(name);
    const item = document.createElement("p");
    item.className = found ? "found" : "";
    item.textContent = found ? name : "*".repeat(name.length);
    codexList.appendChild(item);
  });
  codexProgress.textContent = `${solvedObjects.size} / ${names.length}`;
}

codexToggle.addEventListener("click", () => {
  renderCodex();
  codexOverlay.classList.add("open");
});
codexClose.addEventListener("click", () => codexOverlay.classList.remove("open"));
// 패널 바깥(어두운 배경) 클릭 시에도 닫는다 — 패널 자체 클릭은 버블링을 안 막아도
// #codex-panel이 이벤트 타깃이 되므로 target === codexOverlay 체크만으로 충분하다.
codexOverlay.addEventListener("click", (e) => {
  if (e.target === codexOverlay) codexOverlay.classList.remove("open");
});

objectHintButton.addEventListener("click", handleObjectHintButtonClick);
locationHintButton.addEventListener("click", handleLocationHintButtonClick);

// 게임 본편 시작 — 새 게임/이어서 하기 선택이 끝난 뒤(showStartChoice())에만 호출한다.
// 그때 이미 solvedObjects가 확정돼 있어야(빈 Set이든 불러온 기록이든) 첫 진명의 튜토리얼
// 여부(maybeShowTutorialGuidance)가 정확히 판단된다 — 그래서 부팅 시 무조건 실행하지 않고
// 선택 시점까지 미룬다. 인트로 슬라이드 전환(1.1s)이 도는 동안 배경/마스크가 미리 로드될
// 시간은 충분해서, 미뤄도 로딩이 눈에 띄게 늦어 보이지는 않는다.
async function startGame() {
  await contentReadyPromise; // 인트로 재생 중 백그라운드로 미리 불러와 둬서 보통은 즉시 통과한다
  loadNextRiddle();
  renderPlace("library");
}

// ---------- 인트로: 신의 프롤로그 ----------
// 한 문장씩, 문장 길이에 비례한 "읽기 편한 속도"로 순차 노출한다. 기다리는 게
// 답답하다는 피드백을 반영해, 문장이 나온 뒤 자동 대기 중에 클릭하면 그 대기를
// 건너뛰고 바로 다음 문장으로 넘어간다(예정된 딜레이는 취소). 마지막 문장 이후엔
// 안내 문구를 띄우고, 플레이어가 누르면 오버레이가 왼쪽으로 밀려나가며 사라지고,
// 그 이동이 끝난 뒤에야 SceneView가 페이드인한다.

const introOverlay = document.getElementById("intro-overlay");
const introLinesEl = document.getElementById("intro-lines");

function readingDelay(text) {
  return Math.min(3200, Math.max(1100, text.length * 90));
}

let introIndex = 0;
let introTimeoutId = null;
let introFinished = false; // true가 되면 클릭은 스킵이 아니라 exitIntro()가 처리한다.

function showNextIntroLine() {
  if (introIndex >= INTRO_LINES.length) {
    if (!introFinished) {
      introFinished = true;
      showStartChoice();
    }
    return;
  }
  const text = INTRO_LINES[introIndex];
  introIndex++;
  const p = document.createElement("p");
  p.textContent = text;
  introLinesEl.appendChild(p);
  p.scrollIntoView({ behavior: "smooth", block: "end" });
  introTimeoutId = setTimeout(showNextIntroLine, readingDelay(text));
}

// 자동 대기 중 클릭하면 남은 대기를 취소하고 바로 다음 문장을 보여준다.
introOverlay.addEventListener("click", () => {
  if (introFinished) return; // 마지막 문장 이후엔 showStartChoice()가 만든 버튼들이 각자 처리
  clearTimeout(introTimeoutId);
  showNextIntroLine();
});

// 새 게임/이어서 하기 — 화면을 좌우로 나눠서 보여준다. 기록이 없으면 양쪽 다 같은
// 문구로 새 게임을 시작하고(반으로 나뉜 형태 자체는 유지 — 나중에 기록이 생기면 같은
// 자리가 실제로 두 가지 의미로 갈라진다는 것을 시각적으로 미리 보여주는 셈), 기록이
// 있으면 좌측은 새로 시작(기존 기록 삭제 전 확인), 우측은 그 기록을 불러와 이어간다.
function showStartChoice() {
  const save = loadSave();
  const hasSave = !!(save && save.solvedObjects.length > 0);

  const choice = document.createElement("div");
  choice.id = "start-choice";
  const newBtn = document.createElement("button");
  newBtn.type = "button";
  const continueBtn = document.createElement("button");
  continueBtn.type = "button";

  if (hasSave) {
    choice.classList.add("has-save");
    newBtn.textContent = "( 처음부터 다시 시작한다 )";
    continueBtn.textContent = "( 이어서 계속한다 )";
  } else {
    newBtn.textContent = "( 눌러서 시작하기 )";
    continueBtn.textContent = "( 눌러서 시작하기 )";
  }

  // "새로 시작"에서 확인창을 취소하면 아무 것도 안 하고 다시 선택할 수 있어야 하므로
  // {once:true}를 안 쓴다 — 대신 실제로 진행이 확정된 순간(proceed) 두 리스너를 함께
  // 떼어내서 중복 클릭으로 startGame()이 두 번 불리는 일을 막는다.
  async function proceed(nextSolvedObjects, clearSave) {
    newBtn.removeEventListener("click", onNewClick);
    continueBtn.removeEventListener("click", onContinueClick);
    if (clearSave) localStorage.removeItem(SAVE_KEY);
    solvedObjects = nextSolvedObjects;
    await startGame();
    exitIntro();
  }
  function onNewClick(e) {
    e.stopPropagation();
    if (hasSave && !confirm("지금까지 모은 진명 기록이 모두 사라진다. 새로 시작할까?")) return;
    proceed(new Set(), true);
  }
  function onContinueClick(e) {
    e.stopPropagation();
    proceed(hasSave ? new Set(save.solvedObjects) : new Set(), false);
  }
  newBtn.addEventListener("click", onNewClick);
  continueBtn.addEventListener("click", onContinueClick);

  choice.appendChild(newBtn);
  choice.appendChild(continueBtn);
  introLinesEl.appendChild(choice);
  choice.scrollIntoView({ behavior: "smooth", block: "end" });
  introOverlay.classList.add("ready");
}

function exitIntro() {
  stopIntroMusic();
  introOverlay.classList.remove("ready");
  introOverlay.classList.add("exit");
}

introOverlay.addEventListener("transitionend", (e) => {
  if (e.propertyName === "transform" && introOverlay.classList.contains("exit")) {
    introOverlay.style.display = "none";
    sceneView.classList.add("revealed");
    codexToggle.classList.add("revealed");
  }
});

showNextIntroLine();
