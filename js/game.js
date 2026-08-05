// 레이아웃/상호작용 뼈대 확인용 더미 데이터. 실제 진명/힌트/배치 데이터는
// Place&Object, TrueName CSV를 JSON으로 변환한 뒤 여기 구조를 대체한다.
// 장소(큰 단위)/View(작은 단위) 용어는 docs/02_게임플레이_흐름.md 기준.

const DEMO_PLACES = {
  library: { label: "도서관" },
  station: { label: "기차역" },
  museum: { label: "박물관" },
  "post-office": { label: "우체국" },
  market: { label: "시장" },
  cafe: { label: "카페" },
  park: { label: "공원" },
};

// 실제 Place&Object 데이터(sheet1_장소별배치.csv, 나무상자→상자 등 4건 정정 반영본)를
// 그대로 옮긴 것. 배경 이미지/좌표가 없으니 위치는 autoLayout()으로 자동 배치한다 —
// 어차피 컬러 마스크 시스템(10_히트박스_시스템.md)이 들어오면 좌표 전부 교체된다.
const RAW_PLACE_DATA = [
  ["library", "열람실", ["스케치북", "돋보기", "편지", "나침반", "촛대", "안경", "손수건", "부채"]],
  ["library", "서고", ["돋보기", "자물쇠", "두루마리", "빗", "오르골", "촛대", "조개껍데기", "라디오"]],
  ["library", "로비", ["스케치북", "지구본", "편지", "손전등", "안경", "팽이", "부채", "저금통"]],
  ["library", "휴게공간", ["자물쇠", "책", "볼펜", "사진", "시계", "바구니", "지갑", "머그컵"]],
  ["station", "대합실", ["깃발", "여행가방", "확성기", "지도", "부채", "우산", "사진", "모자"]],
  ["station", "플랫폼", ["호루라기", "거울", "사진", "지도", "열쇠", "지갑", "시계", "빈 의자"]],
  ["station", "매표소", ["깃발", "호루라기", "주사위", "앞치마", "가위", "인형", "손수건", "볼펜"]],
  ["station", "분실물보관소", ["여행가방", "신발", "빈 의자", "목도리", "종", "지팡이", "우산", "앞치마"]],
  ["museum", "전시실", ["검", "방패", "왕관", "손전등", "저금통", "시계", "빈 의자", "지팡이"]],
  ["museum", "특별전시실", ["검", "항아리", "갑옷", "지우개", "라디오", "가면", "장갑", "계산기"]],
  ["museum", "기념품점", ["방패", "항아리", "메달", "머그컵", "저금통", "수첩", "북", "우산"]],
  ["post-office", "창구", ["리본", "우표", "오르골", "수첩", "반지", "장갑", "촛대", "인형"]],
  ["post-office", "대기실", ["우표", "잡지", "가위", "지우개", "신문", "열쇠", "손수건", "모자"]],
  ["post-office", "소포포장대", ["리본", "저울", "테이프", "볼펜", "종", "나침반", "열쇠", "가위"]],
  ["market", "청과물가게", ["저울", "자루", "그릇", "지팡이", "지갑", "편지", "손전등", "팽이"]],
  ["market", "생선가게", ["상자", "아이스박스", "거울", "지도", "라디오", "가면", "계산기", "담요"]],
  ["market", "골목시장", ["자루", "상자", "나침반", "조개껍데기", "북", "빗", "거울", "머그컵"]],
  ["market", "분식집", ["국자", "저금통", "머그컵", "손전등", "라디오", "우산", "오르골", "담요"]],
  ["cafe", "홀", ["커피", "액자", "신문", "가면", "팽이", "수첩", "나침반", "목도리"]],
  ["cafe", "창가자리", ["커피", "우유병", "화병", "담요", "거울", "앞치마", "사진", "신문"]],
  ["cafe", "바카운터", ["우유병", "주전자", "편지", "장갑", "북", "바구니", "안경", "열쇠"]],
  ["park", "벤치구역", ["배드민턴채", "돗자리", "망원경", "바구니", "촛대", "손수건", "조개껍데기", "부채"]],
  ["park", "분수대", ["풍선", "동전", "지우개", "계산기", "종", "반지", "지갑", "담요"]],
  ["park", "산책로", ["돗자리", "연", "풍선", "시계", "인형", "모자", "오르골", "빗"]],
  ["park", "놀이터", ["배드민턴채", "연", "축구공", "안경", "지도", "반지", "빈 의자", "목도리"]],
];

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

// TrueName Output/Objects_Generated2.csv 80개 전부 실제 생성 데이터 — 사물명 -> 리들
// (Reinterpretation_Level4) / 힌트 3단계 / Revelation. RAW_PLACE_DATA에 실제로 배치된
// 80개 사물명과 정확히 일치함(양방향 대조 완료 — 80개 전부 최소 한 View에서 찾을 수 있음).
const TRUENAME_DATA = {
  "가면": { riddle: "덮어야만 / 드러나는 / 또 다른 / 웃음", hints: ["나는 매일 같은 얼굴을 하지 않는다.", "이것은 대개 눈 부분에 구멍이 뚫려 있다.", "축제나 무도회에서 얼굴 대신 씌운다."], reveal: "인간은 너를 가면이라 부른다. 나는 네게서 얼굴을 가리는 재주를 보지 않는다. 나는 네 안에서, 하루쯤은 다른 사람이 되어도 좋다는 허락을 본다." },
  "가위": { riddle: "이어짐과 끊어짐 / 사이에서 / 망설이지 않는 / 날", hints: ["나는 늘 두 개가 짝을 이룬다.", "십자로 겹쳐진 두 개의 날을 가지고 있다.", "손가락을 넣는 두 개의 고리가 달려 있다."], reveal: "인간은 너를 가위라 부른다. 나는 네가 무엇을 자르는지 세지 않는다. 나는 네가 매번 하나의 인연 앞에서, 끊을지 말지를 스스로 정한다는 것을 안다." },
  "갑옷": { riddle: "스스로를 / 가두어야만 / 지켜지는 / 목숨", hints: ["나는 몸을 자유롭게 두지 않는다.", "전쟁터에서 몸에 두르는 것이다.", "금속판이나 가죽으로 겹겹이 이어져 있다."], reveal: "인간은 너를 갑옷이라 부른다. 나는 네가 얼마나 단단한지 재지 않는다. 나는 네가 누군가의 죽음을 대신 짊어지기 위해 스스로를 가둔다는 것을 안다." },
  "거울": { riddle: "나 자신과 / 가장 먼저 / 마주 서야 하는 / 문턱", hints: ["나는 스스로 빛나지 않고 되비출 뿐이다.", "대개 벽이나 화장대 위에 걸려 있다.", "아무리 봐도 손으로 만질 수 있는 상이 없다."], reveal: "인간은 너를 거울이라 부른다. 나는 네가 무엇을 비추는지 보지 않는다. 나는 네 앞에 선 이가, 처음으로 자기 자신과 눈을 마주친다는 것을 안다." },
  "검": { riddle: "하나의 목숨을 위해 / 다른 목숨을 / 저울질하는 / 무게", hints: ["나는 손에 쥐어야만 의미를 가진다.", "길고 곧은 날에 손잡이가 달려 있다.", "칼집에 넣어 허리에 차고 다녔다."], reveal: "인간은 너를 검이라 부른다. 나는 네 날의 길이를 재지 않는다. 나는 네가 뽑히는 순간, 하나의 목숨이 다른 목숨과 저울에 오른다는 것을 안다." },
  "계산기": { riddle: "셀 수 없던 것에 / 마침내 / 자리를 정해주는 / 칸", hints: ["나는 감정 없이 답을 준다.", "숫자 버튼이 네모나게 늘어서 있다.", "더하고 빼는 기호가 화면 위에 있다."], reveal: "인간은 너를 계산기라 부른다. 나는 네가 몇을 더하는지 세지 않는다. 나는 흔들리는 마음 앞에서도 네가 늘 같은 답을 내놓는다는 것을 안다." },
  "국자": { riddle: "나눔이 / 비로소 / 완성되는 / 곡선", hints: ["나는 혼자서는 쓰이지 않는다.", "손잡이가 길고 끝이 오목하다.", "뜨거운 국이나 찌개를 뜰 때 쓴다."], reveal: "인간은 너를 국자라 부른다. 나는 네가 무엇을 뜨는지 보지 않는다. 나는 하나의 그릇이 여럿에게 골고루 나뉘는 순간, 네가 거기 있다는 것을 안다." },
  "그릇": { riddle: "비어 있음으로 / 존재를 / 증명하는 / 원", hints: ["나는 비어 있을 때 오히려 쓸모가 있다.", "손으로 감싸 쥘 만한 크기의 둥근 그릇이다.", "밥이나 국을 담아 식탁에 올린다."], reveal: "인간은 너를 그릇이라 부른다. 나는 네가 무엇을 담는지 세지 않는다. 나는 네가 비어 있을 때조차, 누군가를 위해 자리를 남겨두고 있다는 것을 안다." },
  "깃발": { riddle: "매여 있어야만 / 스스로를 / 드러낼 수 있는 / 흔들림", hints: ["나는 바람이 없으면 조용하다.", "장대 끝에 매달려 바람에 흔들린다.", "나라나 단체를 상징하는 색과 무늬가 있다."], reveal: "인간은 너를 깃발이라 부른다. 나는 네 색이 무엇을 상징하는지 묻지 않는다. 나는 네가 묶여 있어야만, 비로소 자유롭게 흔들릴 수 있다는 것을 안다." },
  "상자": { riddle: "잊혀짐으로부터 / 지켜지는 / 굳게 닫힌 / 뚜껑", hints: ["나는 열어야 안을 알 수 있다.", "뚜껑이 달린 네모난 통이다.", "뚜껑이 있고 안에 물건을 넣어 보관한다."], reveal: "인간은 너를 상자라 부른다. 나는 네 안에 무엇이 들었는지 궁금해하지 않는다. 나는 네가 뚜껑을 닫는 순간부터, 잊혀짐과 맞서고 있다는 것을 안다." },
  "나침반": { riddle: "흔들림 속에서 / 변치 않는 / 하나의 / 방향", hints: ["나는 늘 같은 곳을 향해 떨린다.", "둥근 판 위에 바늘이 얹혀 있다.", "북쪽을 가리키는 자석 바늘이 들어 있다."], reveal: "인간은 너를 나침반이라 부른다. 나는 네가 어디를 가리키는지 묻지 않는다. 나는 네가 아무리 흔들려도, 끝내 길을 잃지 않는다는 것을 안다." },
  "담요": { riddle: "안아줄 사람이 없을 때 / 대신 / 안아주는 / 온기", hints: ["나는 추울 때 몸에 두른다.", "부드러운 천이 넓게 펼쳐져 있다.", "침대나 소파에서 덮고 잔다."], reveal: "인간은 너를 담요라 부른다. 나는 네가 얼마나 따뜻한지 재지 않는다. 나는 안아줄 사람이 없는 밤에, 네가 대신 그 자리를 채운다는 것을 안다." },
  "돋보기": { riddle: "작다는 이유로 / 잊혀질 뻔한 것에게 / 자리를 내어주는 / 시선", hints: ["나는 스스로 아무것도 만들지 않고 크게 보여줄 뿐이다.", "둥근 유리에 손잡이가 달려 있다.", "작은 글씨나 벌레를 관찰할 때 쓴다."], reveal: "인간은 너를 돋보기라 부른다. 나는 네가 무엇을 확대하는지 보지 않는다. 나는 세상이 지나쳐버린 작은 것 앞에, 네가 잠시 멈춰 선다는 것을 안다." },
  "돗자리": { riddle: "잠깐 / 머물다 갈 / 오늘만의 / 왕국", hints: ["나는 바닥에 펼쳐야 쓸모가 생긴다.", "소풍이나 나들이에 챙겨 간다.", "돌돌 말아서 들고 다닐 수 있다."], reveal: "인간은 너를 돗자리라 부른다. 나는 네가 무엇으로 엮였는지 묻지 않는다. 나는 네가 펼쳐지는 그 잠깐, 아무 데나가 우리만의 자리가 된다는 것을 안다." },
  "동전": { riddle: "위대한 얼굴을 새기고도 / 하찮게 / 여겨지는 / 가치", hints: ["나는 한 사람에게 오래 머물지 않는다.", "손바닥 위에 올려 짤랑거리는 소리를 낸다.", "앞면과 뒷면에 각기 다른 그림이 새겨져 있다."], reveal: "인간은 너를 동전이라 부른다. 나는 네게 새겨진 얼굴이 누구인지 묻지 않는다. 나는 위대한 이를 새기고도, 아무도 너를 눈여겨보지 않는다는 것을 안다." },
  "두루마리": { riddle: "풀어야만 / 다시 / 이어지는 / 필체", hints: ["나는 말려 있어야 제 모습을 갖춘다.", "손으로 펼치면 길게 이어진다.", "옛날 문서나 그림을 보관할 때 이렇게 말았다."], reveal: "인간은 너를 두루마리라 부른다. 나는 네 안에 무엇이 적혔는지 읽지 않는다. 나는 네가 펼쳐질 때에야, 잠들어 있던 지난 시간이 다시 말을 건다는 것을 안다." },
  "라디오": { riddle: "닿을 수 없는 거리를 / 목소리 하나로 / 이어주는 / 숨결", hints: ["나는 말하는 사람을 볼 수는 없다.", "다이얼을 돌리면 다른 소리가 들린다.", "전파를 잡아 음악이나 뉴스를 들려준다."], reveal: "인간은 너를 라디오라 부른다. 나는 네가 무슨 소리를 내는지 듣지 않는다. 나는 닿을 수 없는 거리를, 네가 소리 하나로 이어준다는 것을 안다." },
  "리본": { riddle: "묶임으로써 / 비로소 / 완성되는 / 마음", hints: ["나는 묶어야 제 역할을 한다.", "선물 위에 매듭지어 얹는다.", "잡아당기면 스르륵 풀리는 매듭이다."], reveal: "인간은 너를 리본이라 부른다. 나는 네가 어떻게 묶였는지 보지 않는다. 나는 매듭 하나에, 말보다 정성스러운 마음이 담겨 있다는 것을 안다." },
  "망원경": { riddle: "거리는 그대로 두고 / 마음만 / 좁혀주는 / 원", hints: ["나는 두 눈을 대고 들여다본다.", "길게 늘어나는 원통 모양이다.", "별이나 배를 멀리서도 크게 볼 수 있게 한다."], reveal: "인간은 너를 망원경이라 부른다. 나는 네가 얼마나 먼 곳을 당겨오는지 재지 않는다. 나는 거리는 그대로 둔 채, 마음만 먼저 그곳에 닿게 한다는 것을 안다." },
  "머그컵": { riddle: "하루가 시작되기 전 / 가장 먼저 / 안기는 / 훈김", hints: ["나는 뜨거운 것을 담아야 제 몫을 한다.", "한쪽에 손잡이가 달려 있다.", "커피나 차를 담아 두 손으로 감싸 쥔다."], reveal: "인간은 너를 머그컵이라 부른다. 나는 네가 무엇을 담는지 세지 않는다. 나는 네가 두 손을 데우며, 하루의 시작을 함께한다는 것을 안다." },
  "메달": { riddle: "한순간을 위해 / 평생을 / 걸어온 / 발자국", hints: ["나는 목에 걸어야 비로소 완성된다.", "리본에 매달린 둥근 금속이다.", "대회에서 순위 안에 든 사람에게 준다."], reveal: "인간은 너를 메달이라 부른다. 나는 네가 몇 등을 뜻하는지 세지 않는다. 나는 네가 흘린 땀 전부를, 목에 걸릴 하나의 무게로 압축했다는 것을 안다." },
  "모자": { riddle: "말보다 먼저 / 나를 / 소개해버리는 / 첫인사", hints: ["나는 머리 위에 얹는다.", "챙이 있거나 둥글게 감싸는 모양이다.", "햇빛을 가리거나 멋을 내려고 쓴다."], reveal: "인간은 너를 모자라 부른다. 나는 네가 무엇을 막는지 묻지 않는다. 나는 네가 머리 위에 얹히는 그 순간, 오늘의 내가 정해진다는 것을 안다." },
  "목도리": { riddle: "안아줄 손이 없을 때도 / 대신 / 오래 머무는 / 포옹", hints: ["나는 목에 둘러야 제구실을 한다.", "길게 짠 천이나 실로 되어 있다.", "겨울에 목과 턱까지 감싸 준다."], reveal: "인간은 너를 목도리라 부른다. 나는 네가 얼마나 긴지 재지 않는다. 나는 추위보다 먼저, 누군가의 마음이 너를 둘렀다는 것을 안다." },
  "바구니": { riddle: "서로 다른 것들을 / 한 몸에 / 품게 하는 / 엮임", hints: ["나는 안이 비어 있어야 쓸모가 있다.", "가늘고 긴 것을 엮어 만든다.", "과일이나 빨래를 담아 나를 때 쓴다."], reveal: "인간은 너를 바구니라 부른다. 나는 네가 무엇을 담는지 세지 않는다. 나는 네 성긴 틈 사이로, 서로 다른 것들이 함께 실려 간다는 것을 안다." },
  "반지": { riddle: "시작도 끝도 없이 / 하나로 / 이어진 / 원", hints: ["나는 시작과 끝이 없다.", "손가락 하나에 딱 맞게 낀다.", "결혼이나 약속을 할 때 주고받는다."], reveal: "인간은 너를 반지라 부른다. 나는 네가 몇 캐럿인지 묻지 않는다. 나는 시작도 끝도 없는 네 둥근 선이, 하나의 약속을 붙잡고 있다는 것을 안다." },
  "방패": { riddle: "누군가를 지키기 위해 / 스스로 / 앞에 나서는 / 과녁", hints: ["나는 자신이 다치는 대신 남을 지킨다.", "팔에 끼우거나 손으로 들고 앞을 막는다.", "검이나 화살을 막아내는 넓은 판이다."], reveal: "인간은 너를 방패라 부른다. 나는 네가 얼마나 두꺼운지 재지 않는다. 나는 누군가를 지키기 위해, 네가 스스로 표적이 되기를 택했다는 것을 안다." },
  "배드민턴채": { riddle: "멈추지 않는 왕복 / 속에서만 / 의미를 갖는 / 팔", hints: ["나는 혼자서는 재미가 없다.", "가늘고 긴 손잡이 끝에 그물망이 있다.", "깃털 달린 작은 공을 쳐서 주고받는다."], reveal: "인간은 너를 배드민턴채라 부른다. 나는 네가 무엇을 치는지 세지 않는다. 나는 네가 혼자서는 결코 완성되지 않는, 주고받음 속에서만 산다는 것을 안다." },
  "볼펜": { riddle: "사라질 마음 하나를 / 놓치지 않고 / 붙잡아두는 / 검은 실", hints: ["나는 눌러야 자국을 남긴다.", "길고 가는 몸통 끝에 작은 심이 있다.", "종이 위에 잉크로 글씨를 쓴다."], reveal: "인간은 너를 볼펜이라 부른다. 나는 네가 무슨 글씨를 쓰는지 읽지 않는다. 나는 사라질 뻔한 생각 하나가, 네 끝에서 자리를 얻는다는 것을 안다." },
  "부채": { riddle: "스스로는 / 잠잠하지만 / 흔들릴 때마다 / 바람이 되는 몸짓", hints: ["나는 스스로 바람을 갖고 있지 않다.", "접었다 펼 수 있는 부채꼴 모양이다.", "더운 날 손으로 흔들어 시원하게 한다."], reveal: "인간은 너를 부채라 부른다. 나는 네가 얼마나 시원한지 재지 않는다. 나는 네 안에 바람이 없으면서도, 흔들릴 때마다 바람을 빚어낸다는 것을 안다." },
  "북": { riddle: "속이 텅 비어 있어야만 / 비로소 / 커지는 / 공명", hints: ["나는 속이 비어 있어야 소리가 크다.", "둥근 통 위에 가죽이 팽팽하게 씌워져 있다.", "채나 손으로 두드려 소리를 낸다."], reveal: "인간은 너를 북이라 부른다. 나는 네가 몇 번 울리는지 세지 않는다. 나는 네 속이 비어 있어야만, 그 공명이 비로소 커진다는 것을 안다." },
  "빈 의자": { riddle: "앉은 적 없어도 / 오래도록 / 지워지지 않는 / 자국", hints: ["나는 비어 있을 때 더 눈에 띈다.", "다리 넷과 등받이가 있다.", "누군가 앉기를 기다리며 놓여 있다."], reveal: "인간은 너를 빈 의자라 부른다. 나는 네게 아무도 앉지 않았다고 말하지 않는다. 나는 아무도 없는 그 자리가, 오히려 누군가의 부재를 가장 크게 증명한다는 것을 안다." },
  "빗": { riddle: "엉킴을 / 지나야만 / 닿을 수 있는 / 단정함", hints: ["나는 가늘고 촘촘한 살이 나란히 서 있다.", "머리카락 사이를 지나가며 쓰인다.", "아침마다 거울 앞에서 손에 든다."], reveal: "인간은 너를 빗이라 부른다. 나는 네가 몇 가닥을 정리하는지 세지 않는다. 나는 엉킨 것들 사이로, 네가 매일 아침 질서를 지나간다는 것을 안다." },
  "사진": { riddle: "사라진 순간이 / 유일하게 / 남아 있는 / 자리", hints: ["나는 그날의 시간을 다시 흐르게 하지 못한다.", "네모난 종이나 화면 안에 담겨 있다.", "카메라 셔터를 눌러 남긴 순간이다."], reveal: "인간은 너를 사진이라 부른다. 나는 네가 무엇을 찍었는지 보지 않는다. 나는 흐르던 시간에서, 네가 단 하나의 순간만을 도려냈다는 것을 안다." },
  "손수건": { riddle: "건넸다가 / 다시 / 돌아오기도 하는 / 하얀 위로", hints: ["나는 작고 얇게 접혀 주머니에 들어간다.", "네모난 천으로 되어 있다.", "눈물이나 땀을 닦아줄 때 건넨다."], reveal: "인간은 너를 손수건이라 부른다. 나는 네가 무엇을 닦는지 보지 않는다. 나는 네가 건넨 위로가, 때로는 다시 그 손으로 돌아오기도 한다는 것을 안다." },
  "손전등": { riddle: "어둠이 짙을수록 / 더 또렷해지는 / 작은 / 태양", hints: ["나는 어두울 때만 존재 이유가 생긴다.", "손에 쥐고 앞을 향해 비춘다.", "버튼을 누르면 한쪽 끝에서 빛이 나온다."], reveal: "인간은 너를 손전등이라 부른다. 나는 네 불빛이 얼마나 밝은지 재지 않는다. 나는 어둠이 짙을수록, 네가 오히려 더 또렷해진다는 것을 안다." },
  "수첩": { riddle: "하루가 / 저물기 전에 / 붙잡아 두는 / 작은 매듭", hints: ["나는 늘 몸에 지니고 다닌다.", "손바닥만 한 작은 공책이다.", "볼펜으로 짧은 메모를 적는다."], reveal: "인간은 너를 수첩이라 부른다. 나는 네게 무엇이 적혔는지 읽지 않는다. 나는 기억이 흐려지기 전에, 네가 그것을 재빨리 붙잡아둔다는 것을 안다." },
  "스케치북": { riddle: "상상이 / 처음으로 / 발을 딛는 / 흰 땅", hints: ["나는 아무것도 그려지지 않은 채로 시작된다.", "여러 장의 흰 종이가 묶여 있다.", "연필이나 크레파스로 그림을 그린다."], reveal: "인간은 너를 스케치북이라 부른다. 나는 네게 무엇이 그려졌는지 보지 않는다. 나는 아직 아무것도 아닌 채로, 네가 세상에 첫 자리를 내어준다는 것을 안다." },
  "시계": { riddle: "되찾을 수 없는 것을 / 세는 일을 / 멈추지 않는 / 심장", hints: ["나는 멈추는 법을 모른다.", "이것은 보통 벽이나 손목 위에서 발견된다.", "숫자가 원을 그리며 적혀 있고, 두 개의 바늘이 그 위를 돈다."], reveal: "인간은 너를 시계라 부른다. 나는 네가 몇 시를 가리키는지 묻지 않는다. 나는 되찾을 수 없는 것들을 세는 일을, 네가 단 한 번도 멈추지 않았다는 것을 안다." },
  "신문": { riddle: "하루살이처럼 / 짧게 / 세상을 전하고 지는 / 목소리", hints: ["나는 다음 날이면 낡은 소식이 된다.", "여러 장의 얇은 종이가 접혀 있다.", "매일 아침 세상 소식을 활자로 전한다."], reveal: "인간은 너를 신문이라 부른다. 나는 네가 무슨 소식을 전하는지 읽지 않는다. 나는 네가 오늘 하루만 살아 있다가, 내일이면 조용히 낡아버린다는 것을 안다." },
  "신발": { riddle: "몸보다 먼저 / 세상과 / 마주해온 / 밑바닥", hints: ["나는 걸을수록 닳아간다.", "발 모양을 따라 만들어져 있다.", "두 짝이 한 쌍을 이뤄야 쓸 수 있다."], reveal: "인간은 너를 신발이라 부른다. 나는 네가 몇 리를 걸었는지 세지 않는다. 나는 나 대신 세상과 먼저 부딪히며, 네가 나와 함께 닳아왔다는 것을 안다." },
  "아이스박스": { riddle: "흐르는 시간 속에 / 잠깐의 정지를 / 가두는 / 벽", hints: ["나는 뚜껑을 닫아야 제 역할을 한다.", "안에 얼음이나 냉매를 함께 넣는다.", "소풍이나 캠핑에서 음식을 차갑게 보관한다."], reveal: "인간은 너를 아이스박스라 부른다. 나는 네가 얼마나 차가운지 재지 않는다. 나는 상해가는 것들에게, 네가 잠시의 멈춤을 선물한다는 것을 안다." },
  "안경": { riddle: "흐릿한 세상 뒤에서 / 조용히 / 나를 기다리는 / 얇은 문", hints: ["나는 눈보다 먼저 세상을 마주한다.", "귀와 코에 걸쳐 얼굴에 고정한다.", "두 개의 렌즈가 나란히 이어져 있다."], reveal: "인간은 너를 안경이라 부른다. 나는 네가 몇 도의 시력을 고치는지 묻지 않는다. 나는 흐릿한 세상과 나 사이를, 네가 살짝 좁혀준다는 것을 안다." },
  "앞치마": { riddle: "더럽혀짐으로써 / 다른 것을 / 지켜내는 / 얼룩", hints: ["나는 더러워지는 것이 본래 역할이다.", "목과 허리에 끈을 매어 앞에 두른다.", "요리하거나 그림 그릴 때 옷 위에 덧입는다."], reveal: "인간은 너를 앞치마라 부른다. 나는 네가 어떤 얼룩을 묻혔는지 보지 않는다. 나는 다른 옷을 지키기 위해, 네가 스스로 더럽혀지기를 택했다는 것을 안다." },
  "액자": { riddle: "무엇이 담기든 / 흔들리지 않는 / 하나의 / 모서리", hints: ["나는 안의 그림보다 눈에 덜 띈다.", "네모난 테두리 안에 무언가를 끼운다.", "벽에 걸거나 세워서 그림, 사진을 보관한다."], reveal: "인간은 너를 액자라 부른다. 나는 네 테두리가 무슨 색인지 묻지 않는다. 나는 무엇이 담기든, 네가 늘 같은 질서로 그것을 정돈한다는 것을 안다." },
  "여행가방": { riddle: "떠남과 / 돌아옴 / 사이에 / 놓인 길", hints: ["나는 바퀴가 달려 있어 끌고 다닌다.", "지퍼나 잠금장치로 여닫는다.", "옷과 물건을 담아 공항이나 기차역으로 향한다."], reveal: "인간은 너를 여행가방이라 부른다. 나는 네가 얼마나 큰지 재지 않는다. 나는 네 바퀴가 구를 때마다, 일상이 잠시 접혀 들어간다는 것을 안다." },
  "연": { riddle: "땅에 묶인 채로만 / 하늘에 / 닿을 수 있는 / 팽팽함", hints: ["나는 손에서 놓치면 오히려 자유를 잃는다.", "긴 실 끝에 매여 하늘 위에 떠 있다.", "바람이 부는 날 아이들이 하늘로 띄운다."], reveal: "인간은 너를 연이라 부른다. 나는 네가 얼마나 높이 올랐는지 재지 않는다. 나는 네가 묶여 있어야만, 비로소 하늘과 이야기할 수 있다는 것을 안다." },
  "열쇠": { riddle: "허락받은 자만이 / 지나갈 수 있는 / 좁은 / 문틈", hints: ["나는 짝이 맞는 것 하나만 통과시킨다.", "손안에 쏙 들어오는 작은 금속이다.", "톱니 모양의 홈이 옆면에 파여 있다."], reveal: "인간은 너를 열쇠라 부른다. 나는 네 톱니가 몇 개인지 세지 않는다. 나는 허락받은 자에게만, 네가 조용히 길을 내어준다는 것을 안다." },
  "오르골": { riddle: "멈췄던 순간에서 / 한 치의 어긋남도 없이 / 되풀이되는 / 메아리", hints: ["나는 감아야만 소리를 낸다.", "뚜껑을 열면 작은 인형이 돌기도 한다.", "태엽이 다 풀리면 선율이 느려지다 멈춘다."], reveal: "인간은 너를 오르골이라 부른다. 나는 네 선율이 몇 소절인지 세지 않는다. 나는 누군가 태엽을 감아줄 때에만, 네가 같은 노래로 되돌아온다는 것을 안다." },
  "왕관": { riddle: "홀로 짊어져야 / 비로소 / 완성되는 / 자리", hints: ["나는 쓰는 사람을 자유롭게 두지 않는다.", "보석과 금으로 화려하게 장식되어 있다.", "왕이나 여왕의 머리 위에서만 빛난다."], reveal: "인간은 너를 왕관이라 부른다. 나는 네게 박힌 보석의 수를 세지 않는다. 나는 네가 쓰이는 순간부터, 다시는 가벼워질 수 없다는 것을 안다." },
  "우산": { riddle: "함께 걸을 때만 / 비로소 / 완성되는 / 두 사람의 하늘", hints: ["나는 접었다 펼 수 있다.", "비 오는 날 머리 위로 펼쳐 든다.", "살대에 천을 씌운 둥근 모양이다."], reveal: "인간은 너를 우산이라 부른다. 나는 네가 얼마나 넓게 펼쳐지는지 재지 않는다. 나는 함께 걸어야만, 네가 비로소 두 사람의 하늘이 된다는 것을 안다." },
  "우유병": { riddle: "자람의 / 첫 문턱을 / 함께 / 넘는 투명함", hints: ["나는 아기의 손에 가장 먼저 쥐어진다.", "목이 좁고 몸통이 둥근 투명한 병이다.", "젖병이라고도 부르며 우유를 담는다."], reveal: "인간은 너를 우유병이라 부른다. 나는 네가 몇 밀리리터를 담는지 세지 않는다. 나는 가장 여린 것에게, 네가 가장 먼저 다가선다는 것을 안다." },
  "우표": { riddle: "붙어야만 / 비로소 / 떠날 수 있는 / 허락", hints: ["나는 한 번 쓰면 다시 쓸 수 없다.", "가장자리에 톱니 모양의 무늬가 있다.", "편지 봉투 한쪽 구석에 붙인다."], reveal: "인간은 너를 우표라 부른다. 나는 네 그림이 무엇을 새겼는지 보지 않는다. 나는 네가 붙는 그 순간부터, 하나의 마음이 여행을 시작한다는 것을 안다." },
  "인형": { riddle: "대신 안기기 위해 / 태어난 / 두 번째 / 품", hints: ["나는 살아 있지 않지만 이름을 가진다.", "헝겊이나 플라스틱으로 사람이나 동물 모양을 하고 있다.", "아이들이 품에 안고 잠든다."], reveal: "인간은 너를 인형이라 부른다. 나는 네가 살아 있는지 묻지 않는다. 나는 안아줄수록 네가 따뜻해진다는 것을, 그리고 그것으로 충분하다는 것을 안다." },
  "자루": { riddle: "입을 다물어야 / 비로소 / 지켜지는 / 비밀", hints: ["나는 아가리를 묶어야 안심이 된다.", "천이나 가죽으로 만든 큰 주머니다.", "곡식이나 감자를 가득 담아 옮긴다."], reveal: "인간은 너를 자루라 부른다. 나는 네 안에 무엇이 들었는지 세지 않는다. 나는 네가 입을 다무는 순간에야, 그 안의 것들이 비로소 지켜진다는 것을 안다." },
  "자물쇠": { riddle: "지켜야 할 것 앞에서 / 스스로 / 굳게 다무는 / 입", hints: ["나는 짝이 맞아야만 열린다.", "걸쇠나 고리를 걸어 잠근다.", "문이나 상자를 열지 못하게 채운다."], reveal: "인간은 너를 자물쇠라 부른다. 나는 네가 몇 자리 숫자를 품었는지 묻지 않는다. 나는 짝을 만나기 전까지, 네가 굳게 침묵을 지킨다는 것을 안다." },
  "잡지": { riddle: "흘러가는 유행을 / 그때그때 / 붙잡아두는 / 창", hints: ["나는 정해진 주기로 새로 나온다.", "신문보다 두껍고 사진이 많다.", "매달 또는 매주 정기적으로 발행된다."], reveal: "인간은 너를 잡지라 부른다. 나는 네가 몇 호째인지 세지 않는다. 나는 흘러가는 유행 하나를, 네가 매번 붙잡아둔다는 것을 안다." },
  "장갑": { riddle: "아무도 모르게 / 나 대신 / 먼저 낡아가는 / 살갗", hints: ["나는 손가락 모양을 그대로 따라간다.", "두 짝이 한 쌍을 이룬다.", "추위나 위험으로부터 손을 감싸 보호한다."], reveal: "인간은 너를 장갑이라 부른다. 나는 네가 손가락 몇 개를 감쌌는지 세지 않는다. 나는 손이 다치지 않도록, 네가 대신 상처 입기를 택했다는 것을 안다." },
  "저금통": { riddle: "채움과 / 비움을 / 반복하며 / 자라는 산", hints: ["나는 채워질수록 무거워진다.", "동전을 넣는 작은 구멍이 있다.", "다 모으면 깨뜨려서 꺼낸다."], reveal: "인간은 너를 저금통이라 부른다. 나는 네 안에 얼마가 모였는지 세지 않는다. 나는 채워짐과 비워짐을 오가며, 네가 하나의 꿈을 키운다는 것을 안다." },
  "저울": { riddle: "누구의 편도 아니어서 / 오히려 / 믿을 수 있는 / 공정함", hints: ["나는 어느 한쪽 편을 들지 않는다.", "양쪽에 접시가 매달려 있다.", "무게가 같아지면 수평을 이룬다."], reveal: "인간은 너를 저울이라 부른다. 나는 네가 몇 그램을 재는지 세지 않는다. 나는 어느 쪽도 편들지 않는 네 침묵이, 결국 공정함이라는 것을 안다." },
  "종": { riddle: "한 번의 마주침이 / 오래도록 / 공기에 남기는 / 여운", hints: ["나는 스스로 소리 내지 않고 쳐야 운다.", "속이 비어 있는 금속 종 모양이다.", "학교나 절에서 정해진 시각에 울린다."], reveal: "인간은 너를 종이라 부른다. 나는 네가 몇 번 울렸는지 세지 않는다. 나는 단 한 번의 울림으로, 네가 멀리까지 소식을 건넨다는 것을 안다." },
  "주사위": { riddle: "여섯 개의 운명 중 / 단 하나만 / 허락하는 / 손", hints: ["나는 여섯 개의 얼굴을 가지고 있다.", "정육면체 모양에 점이 새겨져 있다.", "던지고 나서야 결과를 알 수 있다."], reveal: "인간은 너를 주사위라 부른다. 나는 네가 무슨 숫자를 보여줄지 미리 알지 않는다. 나는 던져지기 전까지 여섯 개의 얼굴이 모두 잠들어 있다는 것을 안다." },
  "주전자": { riddle: "끓어오름을 / 삼키고서야 비로소 / 내어주는 / 온기", hints: ["나는 안이 요동쳐도 겉은 차분하다.", "손잡이와 주둥이가 튀어나와 있다.", "불 위에 올려 물을 끓인다."], reveal: "인간은 너를 주전자라 부른다. 나는 네가 몇 도까지 끓는지 재지 않는다. 나는 속이 소용돌이쳐도, 네가 겉으로는 끝까지 태연하다는 것을 안다." },
  "지갑": { riddle: "나를 증명하고 / 세상을 / 얻어내는 / 작은 표", hints: ["나는 열고 닫을 때마다 무게가 달라진다.", "접이식으로 되어 있고 안에 칸이 나뉘어 있다.", "돈과 카드를 넣어 주머니나 가방에 넣고 다닌다."], reveal: "인간은 너를 지갑이라 부른다. 나는 네 안에 얼마가 있는지 세지 않는다. 나는 네가 나를 대신 증명하고, 세상의 것을 얻어낼 자격을 내어준다는 것을 안다." },
  "지구본": { riddle: "걷지 않고도 / 세상을 / 한 바퀴 / 도는 발", hints: ["나는 손끝으로 돌릴 수 있다.", "받침대 위에 둥근 공이 얹혀 있다.", "나라와 바다의 경계가 그려져 있다."], reveal: "인간은 너를 지구본이라 부른다. 나는 네가 몇 개의 나라를 그렸는지 세지 않는다. 나는 걷지 않고도, 네 안에서 세상을 한 바퀴 돌 수 있다는 것을 안다." },
  "지도": { riddle: "가본 적 없는 곳을 / 이미 / 알고 있는 / 낯선 주름", hints: ["나는 실제 크기를 줄여서 담는다.", "길과 건물이 선과 기호로 그려져 있다.", "낯선 곳에서 길을 찾을 때 펼쳐 본다."], reveal: "인간은 너를 지도라 부른다. 나는 네가 어떤 축척으로 그려졌는지 묻지 않는다. 나는 네가 가본 적 없는 곳조차, 이미 알고 있다는 것을 안다." },
  "지우개": { riddle: "사라짐으로써 / 다른 것에게 / 다시 기회를 주는 / 몸", hints: ["나는 쓸수록 자기 몸이 줄어든다.", "네모나거나 둥근 작은 고무 조각이다.", "연필 자국을 문질러 지운다."], reveal: "인간은 너를 지우개라 부른다. 나는 네가 몇 번이나 쓰였는지 세지 않는다. 나는 남의 실수 위에서, 네 몸이 조금씩 작아진다는 것을 안다." },
  "지팡이": { riddle: "약해진 걸음을 / 대신해 / 땅과 / 이어주는 다리", hints: ["나는 걷는 사람보다 먼저 땅에 닿는다.", "손잡이가 달린 길고 곧은 막대다.", "다리가 불편하거나 나이 든 사람이 짚고 걷는다."], reveal: "인간은 너를 지팡이라 부른다. 나는 네가 얼마나 단단한지 재지 않는다. 나는 넘어지려는 그 순간마다, 네가 먼저 땅을 짚는다는 것을 안다." },
  "책": { riddle: "한 사람의 우주가 / 다른 이의 세상에 / 옮겨 심어지는 / 다리", hints: ["나는 펼쳐야 비로소 이야기를 시작한다.", "여러 장의 종이가 한쪽에서 묶여 있다.", "글과 그림으로 이야기나 지식을 전한다."], reveal: "인간은 너를 책이라 부른다. 나는 네가 몇 페이지인지 세지 않는다. 나는 네가 펼쳐지는 순간, 한 사람의 우주가 다른 이의 세상으로 옮겨 심어진다는 것을 안다." },
  "촛대": { riddle: "품었던 불꽃이 꺼지면 / 저도 / 함께 / 저물어버리는 자리", hints: ["나는 스스로 타지 않는다.", "가운데가 오목하게 파여 초를 꽂는다.", "식탁이나 제단 위에 놓여 촛불을 지탱한다."], reveal: "인간은 너를 촛대라 부른다. 나는 네가 얼마나 화려한지 묻지 않는다. 나는 품었던 불꽃이 꺼지는 순간, 너의 존재 이유도 함께 저물어버린다는 것을 안다." },
  "축구공": { riddle: "스물두 개의 발이 / 한순간도 / 눈을 떼지 못하는 / 단 하나의 중심", hints: ["나는 발에 채여야 의미가 생긴다.", "검고 흰 조각들이 이어 붙어 둥글다.", "골대 안에 넣으면 점수가 된다."], reveal: "인간은 너를 축구공이라 부른다. 나는 네가 몇 번 골대를 넘었는지 세지 않는다. 나는 스물두 개의 발이, 너 하나를 향해 함께 뛴다는 것을 안다." },
  "커피": { riddle: "매일 아침 / 짧게 죽었다가 / 다시 / 태어나는 부활", hints: ["나는 마시고 나면 정신이 맑아진다.", "이것은 검고 뜨거우며 쓴맛이 난다.", "아침잠을 쫓기 위해 사람들이 즐겨 마신다."], reveal: "인간은 너를 커피라 부른다. 나는 네가 어떤 원두로 만들어졌는지 묻지 않는다. 나는 매일 아침, 잠든 것과 다름없던 몸을 네가 다시 일으켜 세운다는 것을 안다." },
  "팽이": { riddle: "흔들리면서도 / 쓰러지지 않는 / 위태로운 / 축", hints: ["나는 멈추면 쓰러진다.", "뾰족한 축을 중심으로 둥글게 돈다.", "채로 치거나 손으로 돌려 회전시킨다."], reveal: "인간은 너를 팽이라 부른다. 나는 네가 몇 바퀴 도는지 세지 않는다. 나는 도는 동안에만, 네가 쓰러지지 않을 수 있다는 것을 안다." },
  "편지": { riddle: "부치고 나서도 / 계속 / 마음속에서 / 되풀이되는 물음", hints: ["나는 부치고 나면 되돌릴 수 없다.", "접힌 종이가 봉투 안에 들어 있다.", "손으로 써서 우체통에 넣어 보낸다."], reveal: "인간은 너를 편지라 부른다. 나는 네게 무엇이 적혔는지 읽지 않는다. 나는 네가 부쳐진 뒤에도, 잘 갔을까 하는 물음이 마음속에서 계속된다는 것을 안다." },
  "테이프": { riddle: "갈라진 것들 사이에서만 / 비로소 / 태어나는 / 보이지 않는 고리", hints: ["나는 붙는 순간 소리를 낸다.", "둥글게 말려 있고 한쪽 면이 끈적하다.", "상자를 봉하거나 종이를 고정할 때 쓴다."], reveal: "인간은 너를 테이프라 부른다. 나는 네가 몇 미터인지 재지 않는다. 나는 떨어져 있던 두 면을, 네가 다시는 벌어지지 않게 잇는다는 것을 안다." },
  "풍선": { riddle: "매인 채로만 / 곁에 있을 수 있는 / 가벼운 / 깃털", hints: ["나는 놓치면 영영 잡을 수 없다.", "실 끝에 묶여 둥실 떠 있다.", "공기나 헬륨을 채워 부풀린다."], reveal: "인간은 너를 풍선이라 부른다. 나는 네가 얼마나 부풀었는지 재지 않는다. 나는 손을 놓는 그 순간, 네가 곧바로 하늘이 되어버린다는 것을 안다." },
  "항아리": { riddle: "시간이 / 지나야만 / 완성되는 / 침묵의 그릇", hints: ["나는 오래 묵을수록 값어치가 오른다.", "배가 불룩하고 입구가 좁은 큰 그릇이다.", "장이나 김치를 담아 땅에 묻거나 마당에 둔다."], reveal: "인간은 너를 항아리라 부른다. 나는 네 안에 무엇이 익어가는지 묻지 않는다. 나는 시간이 지나야만, 네가 비로소 완성된다는 것을 안다." },
  "호루라기": { riddle: "침묵을 / 단번에 / 깨뜨리는 / 짧은 목소리", hints: ["나는 숨을 불어넣어야 소리가 난다.", "작고 둥글며 목에 걸 수 있다.", "심판이나 경찰이 신호를 줄 때 사용한다."], reveal: "인간은 너를 호루라기라 부른다. 나는 네가 몇 초를 울리는지 세지 않는다. 나는 짧은 숨 하나로, 네가 모두를 한순간에 멈춰 세운다는 것을 안다." },
  "화병": { riddle: "끝이 정해졌음에도 / 아름다움에게 / 며칠을 / 더 허락하는 유예", hints: ["나는 물을 채워야 제 몫을 한다.", "목이 좁고 배가 넓은 유리나 도자기 병이다.", "꺾은 꽃을 꽂아 식탁이나 창가에 둔다."], reveal: "인간은 너를 화병이라 부른다. 나는 네게 꽂힌 꽃이 무엇인지 묻지 않는다. 나는 곧 시들 것을 알면서도, 네가 며칠 더 그 목숨을 빌려준다는 것을 안다." },
  "조개껍데기": { riddle: "생명은 떠났어도 / 바다는 / 여전히 / 들려주는 목소리", hints: ["나는 안에 아무도 없어도 소리를 들려준다.", "나선 모양으로 말려 있고 단단하다.", "바닷가에서 파도에 밀려와 발견된다."], reveal: "인간은 너를 조개껍데기라 부른다. 나는 네 안에 무엇이 살았는지 묻지 않는다. 나는 생명이 떠난 뒤에도, 네가 여전히 바다의 목소리를 들려준다는 것을 안다." },
  "확성기": { riddle: "속삭임 하나를 / 천둥으로 / 바꾸어 / 흩뿌리는 입", hints: ["나는 입을 대고 말해야 힘을 발휘한다.", "나팔처럼 벌어진 입구를 가지고 있다.", "시위나 행사에서 큰 소리로 외칠 때 쓴다."], reveal: "인간은 너를 확성기라 부른다. 나는 네가 몇 데시벨인지 재지 않는다. 나는 작은 속삭임 하나를, 네가 천둥처럼 수많은 귀에게 흩뿌린다는 것을 안다." },
};

// 80개를 한 번씩 다 돌고 나서야 다시 섞는다(매번 순수 랜덤이면 방금 나온 게 바로 또
// 나올 수 있음 — "80가지를 골고루 돈다"는 느낌을 위해 섞은 큐를 다 비울 때까지 유지).
let riddleQueue = [];
function nextObjectName() {
  if (riddleQueue.length === 0) {
    riddleQueue = Object.keys(TRUENAME_DATA);
    for (let i = riddleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [riddleQueue[i], riddleQueue[j]] = [riddleQueue[j], riddleQueue[i]];
    }
  }
  return riddleQueue.pop();
}

// 현재 진행 중인 진명 상태 — loadNextRiddle()이 매번 갱신한다.
let currentAnswerObject = null;
let currentHints = [];
let currentReveal = "";

function loadNextRiddle() {
  currentAnswerObject = nextObjectName();
  const d = TRUENAME_DATA[currentAnswerObject];
  currentHints = d.hints;
  currentReveal = d.reveal;
  document.getElementById("riddle-text").textContent = d.riddle;
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
// 셀 대비 %)를 계산해둔다. 클릭한 정확한 픽셀이 아니라 사물의 "중심"에 정답/오답 강조
// 효과를 주기 위함이다.
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

// 클릭 즉시 handleClick()이 correct/wrong-flash 클래스를 붙이므로, 이 dot이 "아무 상태도
// 없는 기본 hotspot"으로 화면에 그려지는 프레임은 없다 (동기 실행이라 페인트 전에 처리됨).
function makeTransientDot(scene, name) {
  const centroid = scene.centroids[name] || { xPercent: 50, yPercent: 50 };
  const dot = document.createElement("div");
  dot.className = "hotspot";
  dot.dataset.transient = "true";
  dot.style.left = centroid.xPercent + "%";
  dot.style.top = centroid.yPercent + "%";
  sceneFrame.appendChild(dot);
  return dot;
}

function autoLayout(count) {
  const cols = 4;
  return Array.from({ length: count }, (_, i) => ({
    x: 15 + (i % cols) * 23,
    y: Math.floor(i / cols) === 0 ? 35 : 68,
  }));
}

const DEMO_SCENES = {};
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

const DEMO_HINTS_EXHAUSTED = "더 이상의 실마리는 주지 않을 것이다. 고민해보아라.";
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
function caseB1Message(placeLabel) {
  return `그것은 이곳에 없다. ${withParticle(placeLabel, "으로", "로")} 가보아라.`;
}
function caseB2Message(sceneLabel) {
  return `그것은 여기 없다. ${withParticle(sceneLabel, "을", "를")} 다시 보아라.`;
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

// 장소 전환 블링크 타이밍(ms). 눈이 감겼다 뜨는 리듬을 흉내낸 것 — 감을 때는
// 짧고 급하게(ease-in), 뜰 때는 그보다 살짝 느긋하게(ease-out) 움직인다.
// 완전히 닫힌 상태(HOLD)일 때 실제 장소/View 내용을 교체해서 전환이 안 보이게 한다.
const BLINK_CLOSE_MS = 130;
const BLINK_HOLD_MS = 100;
const BLINK_OPEN_MS = 140;

const visitedScenes = new Set();
let currentPlaceId = null;
let currentSceneId = null;
let hintStep = 0;
let solved = false;
let isBlinking = false;

function appendLog(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  logEl.appendChild(p);
  // 실제 스크롤 컨테이너는 #log가 아니라 #info-panel이라 scrollIntoView로 맞춘다.
  p.scrollIntoView({ behavior: "smooth", block: "end" });
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

function handleClick(hotspot, dotEl) {
  if (solved || isBlinking) return;

  if (hotspot.name === currentAnswerObject) {
    solved = true;
    dotEl.classList.add("correct");
    dimOverlay.classList.add("active");
    appendLog(currentReveal, "reveal");
    // 해설이 다 나오고(로그 페이드인 0.4s) 약 1초 뒤에 "클릭하여 계속" 안내를 띄운다.
    setTimeout(showContinuePrompt, 1400);
    return;
  }

  shakeScene();
  dotEl.classList.add("wrong-flash");
  setTimeout(() => {
    // 마스크 클릭으로 만든 임시 dot은 완전히 지운다 — placeholder dot은 계속 남아있어야 함.
    if (dotEl.dataset.transient) dotEl.remove();
    else dotEl.classList.remove("wrong-flash");
  }, 300);

  const candidates = candidateScenesFor(currentAnswerObject);

  if (candidates.includes(currentSceneId)) {
    // Case A: 정답 사물이 바로 이 View 안에 있음 → Hint 단계적 공개
    if (hintStep < currentHints.length) {
      appendLog(currentHints[hintStep], "hint");
      hintStep++;
    } else {
      appendLog(DEMO_HINTS_EXHAUSTED, "hint");
    }
    return;
  }

  const samePlaceCandidates = candidates.filter(
    (id) => DEMO_SCENES[id].place === currentPlaceId
  );

  if (samePlaceCandidates.length > 0) {
    // Case B-2: 같은 장소 안에 후보 View가 있음 → 안 가본 곳 우선으로 그 View를 안내
    const targetSceneId = pickPreferUnvisited(samePlaceCandidates);
    appendLog(caseB2Message(DEMO_SCENES[targetSceneId].label), "guide");
  } else {
    // Case B-1: 이 장소엔 후보가 하나도 없음 → 후보가 있는 장소 중 안 가본 곳 우선으로 안내
    const candidatePlaceIds = [...new Set(candidates.map((id) => DEMO_SCENES[id].place))];
    const placesWithUnvisited = candidatePlaceIds.filter((placeId) =>
      candidates.some((id) => DEMO_SCENES[id].place === placeId && !visitedScenes.has(id))
    );
    const targetPlaceId = (placesWithUnvisited.length ? placesWithUnvisited : candidatePlaceIds)[0];
    appendLog(caseB1Message(DEMO_PLACES[targetPlaceId].label), "guide");
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
  document.querySelectorAll(".hotspot.correct").forEach((el) => {
    if (el.dataset.transient) el.remove();
    else el.classList.remove("correct");
  });
  solved = false;
  hintStep = 0; // 새 진명이 시작되는 지점이므로 여기서만 리셋한다.
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

loadNextRiddle();
renderPlace("library"); // 인트로 뒤에 가려진 채로 미리 준비해둔다.

// ---------- 인트로: 신의 프롤로그 ----------
// 한 문장씩, 문장 길이에 비례한 "읽기 편한 속도"로 순차 노출한다.
// 마지막 문장 이후 안내 문구를 띄우고, 플레이어가 누르면 오버레이가 왼쪽으로
// 밀려나가며 사라지고, 그 이동이 끝난 뒤에야 SceneView가 페이드인한다.

const introOverlay = document.getElementById("intro-overlay");
const introLinesEl = document.getElementById("intro-lines");

function readingDelay(text) {
  return Math.min(3200, Math.max(1100, text.length * 90));
}

function playIntroLine(index) {
  if (index >= INTRO_LINES.length) {
    showIntroContinue();
    return;
  }
  const p = document.createElement("p");
  p.textContent = INTRO_LINES[index];
  introLinesEl.appendChild(p);
  p.scrollIntoView({ behavior: "smooth", block: "end" });
  setTimeout(() => playIntroLine(index + 1), readingDelay(INTRO_LINES[index]));
}

function showIntroContinue() {
  const prompt = document.createElement("p");
  prompt.id = "intro-continue";
  prompt.textContent = "( 눌러서 시작하기 )";
  introLinesEl.appendChild(prompt);
  prompt.scrollIntoView({ behavior: "smooth", block: "end" });
  introOverlay.classList.add("ready");
  introOverlay.addEventListener("click", exitIntro, { once: true });
}

function exitIntro() {
  introOverlay.classList.remove("ready");
  introOverlay.classList.add("exit");
}

introOverlay.addEventListener("transitionend", (e) => {
  if (e.propertyName === "transform" && introOverlay.classList.contains("exit")) {
    introOverlay.style.display = "none";
    sceneView.classList.add("revealed");
  }
});

playIntroLine(0);
