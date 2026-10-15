# 0.33 · 폴더 관리 모드 / 로컬 모델 카드 / 오늘의 캐릭터 여백

## 기준과 범위

기준은 전달한 0.32 ZIP입니다. 수정 전 실행 파일과 해당 ZIP의 일치를 확인하고 0.32를 복구점으로 보존했습니다. ME 본체는 수정하지 않았습니다. 실행 소스는 navigation.js와 CSS 두 부분만 변경했습니다.

## 요청별 결과

| 요청 | 변경 | 검증 |
| --- | --- | --- |
| 전체 대화→대화·폴더 관리에서 같은 모드의 순정 목록 열기 | 순정 ui.store의 requestChatModeShortcut과 ChatSidebar의 모드 선택 효과가 있어 가능합니다. 기존 액션을 유지하고 진입 시 모드를 캡처합니다. 순정 목록이 열린 뒤 해당 data-chat-mode-tab 버튼의 aria-pressed=true까지 확인합니다. 액션이 노출되지 않으면 실제 순정 버튼을 눌러 같은 모드를 선택합니다. 사용자 선택을 계속 덮어쓰는 관찰자나 폴링은 추가하지 않았습니다. | Chromium PC/터치에서 CONVO·RP·GAME 각 모드, shortcut 있음/없음 총 12경로. 실제 선택 상태와 순정 폴더 만들기 버튼 동작 확인. |
| 연결 화면의 로컬 모델 설치 섹션 숨김 | 테마가 활성화된 연결 패널에서만 순정 SidecarCard를 CSS로 숨깁니다. 순정 카드의 BrainCircuit 아이콘과 직접 자식 구조를 기준으로 지정했습니다. 모델/연결 저장 데이터나 설치 기능 코드는 변경하지 않았습니다. | 접힘/펼침 상태 모두 숨김. API 연결과 TTS 버튼은 보이고 클릭 가능. 다른 패널의 같은 아이콘은 유지. 테마 비활성화 시 원래 카드가 다시 표시됨. |
| 오늘의 캐릭터 문구 위 여백 | daily-pick의 위 padding을 18px→30px로 변경했습니다. 좌우·아래 padding과 제목 정렬은 유지합니다. | 320/390/767/768/1024/1920px × 16/20px 글자 × PC/터치 = 24조건. 위 padding 30px, 제목 중앙 정렬, 가로 넘침 없음 확인. |

## 검사

- `v033-ui.cjs`: 빌드된 전체 확장 JS/CSS를 이용한 위 3개 요청 검사. 모의 HTTP/native 엔진입니다.
- 순정 ChatSidebar.tsx의 `data-chat-mode-tab` / `aria-pressed` / onClick 및 모드 shortcut 효과를 확인했습니다. ConnectionsPanel.tsx에서 SidecarCard 루트·아이콘 구조와 API/TTS가 별도 형제인 것을 확인했습니다.
- 기존 공유 검사 fixture의 순정 탭도 실제 계약에 맞춰 세 모드와 aria-pressed 상태를 갖추게 보완했습니다. 선택 상태를 검사하지 않고 패널 존재만 보는 검사로 대체하지 않았습니다.
- `v031.cjs`: 기존 전체 기능 회귀 검사.
- `v0317-compat.cjs`: 선톡·미읽음·번역 DOM 호환 검사.
- `v032-roundtrip.cjs`: PC/터치 3모드 총 12회 방 진입/복귀 후 최근·전체 미리보기 유지 검사.
- `v03114-regressions.cjs`: 미리보기 경합·미읽음·지연 사전설정창 유지 검사.
- `module-contracts.cjs`와 `build.py --check`: 모듈 계약 및 실행 파일 일치 검사.
- ZIP 구성·압축 무결성·추출 후 재빌드는 PACKAGE_VERIFICATION.json에 기록합니다.

## 변경 통제

실행 변경: `src/engine/navigation.js`, `styles/native/resources.css`, `styles/shadow/catalog.css`.

미리보기/선톡/게임 생성·취소/번역/TTS/설정 저장 코드와 나머지 스타일은 0.32와 동일합니다. 버전은 0.33이며 다음은 0.34입니다. 루트 및 development/의 실행 파일을 동일하게 묶었습니다.

## 미검증

실서버, 실제 React 엔진 전체, 물리 Android/iPhone, Safari/WebKit·Firefox 및 외부 확장 전체 조합은 미검증입니다. 이번 검사는 Chromium의 모의 환경이며 실기기 정상 동작 보증이 아닙니다.
