// Case B(위치 안내) 대사 템플릿 — js/intro.js처럼 콘텐츠만 따로 떼어서 여기 둔다.
// 신의 문체(담담함, 자세한 원칙은 docs/08_신_문체가이드.md/docs/05_톤앤매너.md)에 맞춰
// 새 템플릿을 추가하고 싶으면 이 파일의 배열에만 추가하면 된다 — js/game.js는
// 안 건드려도 된다.
//
// 각 항목은 (label) => 완성된 문장을 돌려주는 함수다. withParticle()은 js/game.js에
// 정의돼 있지만, 이 파일이 실제로 실행되는(=함수가 호출되는) 시점엔 이미 모든 스크립트가
// 로드된 뒤라 로드 순서는 상관없다.
//
// game.js의 buildCaseBMessage()가 진명 하나당 템플릿을 하나씩 무작위로 골라 고정해서
// 쓴다(loadNextRiddle에서 매번 다시 뽑음) — 매번 무작위로 고르면 같은 안내가 반복될 때
// appendOrEmphasizeLog의 "직전 줄과 완전히 같은 문장이면 새 줄 대신 강조"가 깨져서
// 로그가 다시 늘어지기 때문이다. 그래서 "이 진명 동안은 한 가지 말투로 통일"이 맞다.

const CASE_B1_TEMPLATES = [
  // Case B-1: 정답 사물이 있는 후보가 전부 다른 장소에 있을 때 ("장소"만 안내)
  (place) => `그것은 이곳에 없다. ${withParticle(place, "으로", "로")} 가보아라.`,
  (place) => `네가 찾는 것은 여기 없다. ${withParticle(place, "으로", "로")} 가보아라.`,
  (place) => `이곳에는 그 진명이 깃들어 있지 않다. ${withParticle(place, "으로", "로")} 가보아라.`,
  (place) => `그것이 머무는 자리는 따로 있다. ${withParticle(place, "으로", "로")} 가보아라.`,
  (place) => `여기서는 찾을 수 없다. ${withParticle(place, "으로", "로")} 가보아라.`,
];

const CASE_B2_TEMPLATES = [
  // Case B-2: 같은 장소 안에 후보가 있을 때 (구체적인 "View"까지 안내)
  (view) => `그것은 여기 없다. ${withParticle(view, "을", "를")} 다시 보아라.`,
  (view) => `이 자리에서는 찾을 수 없다. ${withParticle(view, "을", "를")} 다시 들여다보아라.`,
  (view) => `네가 찾는 것은 이곳에 없다. ${withParticle(view, "을", "를")} 다시 살펴보아라.`,
  (view) => `여기엔 없다. ${withParticle(view, "을", "를")} 다시 보아라.`,
  (view) => `그것은 이 자리를 벗어나 있다. ${withParticle(view, "을", "를")} 다시 보아라.`,
];
