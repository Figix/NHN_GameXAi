// 작은 엔딩 / 완전한 엔딩 대사 — js/intro.js·js/messages.js·js/rewards.js와 같은 성격의
// 콘텐츠 파일이다. 판정 로직(몇 번째 자리에 뭐가 들어가는지, 힌트 등급 기준 등)은
// js/game.js에 그대로 두고, 실제로 화면에 뜨는 문구만 여기로 뺐다 — 대사만 고치고
// 싶을 때 이 파일만 열면 된다.

// 작은 엔딩 — 장소(STAGE) 하나를 완전히 마쳤을 때. docs/04_진행시스템.md "엔딩 대사" 원안.
// placeLabel(장소 이름) / hintFeedbackLine(아래 HINT_FEEDBACK_*로 game.js가 만들어 넘김) /
// reward(js/rewards.js REWARD_POOL에서 뽑은 문구) 세 자리를 game.js가 채운다.
const SMALL_ENDING_LINES = (placeLabel, hintFeedbackLine, reward) => [
  `너는 ${placeLabel}에 깃든 모든 진명을 알아냈다.`,
  "증명할 수 없어도 괜찮다. 나는 보았다.",
  hintFeedbackLine,
  `너에게 하나를 건넨다: ${reward}.`,
  "아직 끝나지 않았다. 다른 곳에도, 너를 기다리는 이름들이 있다.",
];

// 완전한 엔딩 — 80개(=7개 STAGE) 전부를 마쳤을 때. color/place/person은
// js/rewards.js REWARD_COLORS/REWARD_PLACES/REWARD_PEOPLE에서 하나씩 뽑아 넘긴다.
const FULL_ENDING_LINES = (hintFeedbackLine, color, place, person) => [
  "여든 개의 진명을, 너는 전부 마주했다.",
  "어떤 것은 금방 알아챘고, 어떤 것은 오래 헤맸을 것이다.",
  "헤맨 시간이야말로 내가 바라던 것이었다.",
  hintFeedbackLine,
  `행운의 색은 ${color}, 행운의 장소는 ${place}, 만날 사람은 ${person}.`,
  "너는 오늘을 기억하지 못할 것이다. 그래도 무언가는 달라져 있을 것이다.",
];

// 힌트 사용 피드백 — 4단계. 어느 등급을 쓸지(비율 기준)는 game.js의 buildHintFeedbackLine이
// 정하고, 실제 문장은 여기서 가져간다. 가장 낮은 등급도 질책 없이 격려로 끝맺는다
// (01_톤_방향.md "조용함/신비함" 원칙 유지) — 이 결을 벗어나지 않는 선에서만 문구를 고칠 것.
const HINT_FEEDBACK_NONE = "힌트를 하나도 빌리지 않았다. 오롯이 네 힘으로 여기까지 왔다.";
const HINT_FEEDBACK_GOOD = (n) => `힌트를 ${n}번 빌렸을 뿐, 나머지는 스스로 알아냈다. 제법이구나.`;
const HINT_FEEDBACK_OK = (n) => `힌트를 ${n}번 빌렸다. 헤매는 것도 나쁘지 않다.`;
const HINT_FEEDBACK_MUCH = (n) => `힌트를 ${n}번이나 빌렸구나. 아직 멀었다 — 그래도 서두를 것 없다.`;
