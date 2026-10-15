# 0.31 변경

- 마크다운 도움말을 독립 모듈로 추가했습니다. 현재 29개 모듈입니다.
- 번역 확장의 DOM 소유 영역을 테마 줄바꿈 분리와 구분하고 형제 관계를 보존합니다.
- 모바일 복귀의 선톡 메타데이터 보충 조회를 이벤트 기반으로 추가합니다.
- 상세 소개는 Creator Notes만 사용합니다.

현재 유지보수 기준은 MAINTENANCE.md와 MODULES.md입니다.

---

# 0.30 아키텍처

현재 소스 구조와 수정 절차는 MAINTENANCE.md와 MODULES.md를 기준으로 합니다.
28개 팩토리 모듈, 명시적 레지스트리, 순서가 있는 초기화/정리, 기능별 CSS 소스에서 단일 배포 JS/CSS를 생성합니다. 기존 기능과 CSS 적용 순서를 보존하는 리팩토링입니다.

아래는 기존 버전의 설계 기록입니다. 이전의 단일 runtime.js 및 native.css/shadow.css 원본 경로는 현재 구조에서 대체되었습니다.

---

# 마리나라 플랫폼화 0.21.0

표시 계층은 Shadow DOM, 순정 기능과 저장 데이터는 엔진이 소유한다.

- 순정 폴더 변경은 ChatSidebar의 원래 UI와 액션을 사용한다. 확장은 저장 폴더 필터만 읽는다.
- 채팅과 편집은 ID 기반으로 연결하며 목적지 준비 전까지 현재 확장 화면을 유지한다.
- 진입 당시 탭/프로필/모드/목록 선택/폴더/스크롤을 복귀용으로 기록한다.
- 테마는 UI store setTheme를 우선 호출하며 숨겨진 설정 화면 준비는 대안 경로다.
- 설치 앱 메타데이터 요청은 재사용하고 사용 가능한 앱만 대표 에셋으로 표시한다.
- 오늘의 캐릭터는 공식 catalog를 순차적으로 읽으며 하루 한 명만 보관한다.
  전체 캐릭터 DOM 또는 별도 영구 카탈로그를 복제하지 않는다.
- 알림은 순정 레일의 장착/변경과 현재 store 스냅샷을 읽는다. 별도 메시지 폴링은 하지 않는다.
- 분리 표시의 원본 자식 DOM은 변경하지 않는다. 별도 Shadow DOM만 교체한다.
  표시 자료는 현재 렌더된 내용이며 저장 메시지 raw content에서 다시 읽지 않는다.
  생성 요소는 .mari-message-bubble 클래스를 갖지 않고 다른 스캐너에서 분리된다.
- 관찰은 활성 콘보 스크롤 영역과 알림 영역으로 제한한다. 페이지 이동/해제 시 정리한다.
- RP 원형/직사각형/없음/패널 분기는 엔진의 기존 클래스와 구조를 따른다.
  넓은 패널은 CSS grid/display:contents로 표시 순서만 조정하고 React 노드를 재배치하지 않는다.
- 게임 사이드 대사는 .experience-side-line 실제 순정 훅으로 글자색을 지정한다.

참조한 공식 소스 (2026-10-13)
https://github.com/Pasta-Devs/Marinara-Engine
packages/client/src/components/layout/AppShell.tsx
packages/client/src/components/layout/ChatSidebar.tsx
packages/client/src/components/chat/HomeBrowserHub.tsx
packages/client/src/components/chat/ChatNotificationBubbles.tsx
packages/client/src/components/chat/ConversationMessage.tsx
packages/client/src/components/chat/ConversationMessageBubble.tsx
packages/client/src/components/chat/ConversationMessageShared.tsx
packages/client/src/components/chat/ChatMessage.tsx
packages/client/src/components/game/GameNarration.tsx
packages/client/src/components/game/GameNarrationVisuals.tsx
packages/client/src/stores/chat.store.ts
packages/client/src/stores/ui.store.ts
packages/client/src/lib/daily-characters.ts

공식 public navigation API가 아닌 내부 연결부는 실제 배포 빌드와의 추가 통합 검증이 필요하다.

0.8.0 표시 계약
- TTS의 숨긴 원문 → 처리본 관계를 보존한다. 분리 자료는 숨긴 원문이 아니라 현재 처리본이다.
- 숨김 후처리 노드는 복제 표시에서 제외한다. 분리 표시를 Shadow DOM에 격리하고 처리본 하나만 숨긴다.
- 편집 및 처리본 교체 시 이전 표시를 폐기한다. linear는 분리 대상으로 삼지 않는다.
- 성공한 순정 캐릭터 저장의 URL/메서드만 관찰하여 캐시를 무효화한다. 응답 본문이나 요청 내용을 수집하지 않는다.
- 앱 새로고침은 브라우저 location.reload()를 사용한다.

TTS 표시 계약 참조: https://github.com/marittini/TTS-11LABS-ADD
verification/tts-dom-reference.js는 검사에 필요한 원본 표시 함수 발췌다.

0.9.0 동기화 계약
- 알림 진입은 순정 onNavigate를 우선 실행한다. 새 방 준비 상태 해제는 순정 처리 순서와 같다.
- QueryClientProvider의 기존 QueryCache를 구독하고 성공/무효화/상태 변경만 처리한다. 구독은 해제 시 정리한다.
- 새 메시지 이벤트는 내비게이션을 실행하지 않는다. 표시 중인 확장 대화 목록에만 갱신을 예약한다.
- 채팅 내부 터치 제스처는 순정에 맡긴다. 확장 탭 스와이프와 재생성 스와이프를 겹치지 않는다.
- TTS의 native source → sibling copy 계약이 끊긴 표시본은 정리한다. React 원문 자식과 저장 내용은 변경하지 않는다.
- 콘보 관찰의 연결 상태를 별도로 기록해 화면 복귀 시 관찰을 다시 장착한다.

0.10.0 표시 계약
- 토스트 수명은 chatNotifications, 읽지 않음 수명은 unreadCounts가 소유한다. 둘을 배지 계산에 혼용하지 않는다.
- Sidebar의 실제 selector snapshot 또는 full state unreadCounts를 읽고 순정 읽음 처리 결과를 따른다.
- 순정 상태가 아직 없는 경우 목록 저장 메타데이터와 관찰한 개수를 보존한다. 확인된 방 진입에서만 대안 표시를 정리한다.
- 오늘의 캐릭터 장식은 프사 주변의 aria-hidden CSS 요소이며 이벤트·추가 타이머를 생성하지 않는다.

0.11.0 뒤로가기 계약
- popstate 목적지가 확장의 native room entry이면 순정 팝업 sentinel 정리 또는 팝업 뒤로가기다. 엔진 처리에 맡기고 방을 종료하지 않는다.
- 방 entry 자체를 벗어나는 뒤로가기에서만 원래 목록/프로필로 복귀한다.
- 채팅 안에서 닫는 순정 패널은 채팅을 유지한다. 확장 메뉴에서 연 패널의 복귀 동작은 유지한다.
- 토스트 드래그는 해당 toast row에서만 처리하며 unreadCounts/메시지 원문에 관여하지 않는다.
참조: 공식 packages/client/src/lib/back-navigation.ts 및 components/ui/AppDialogRenderer.tsx.

0.12.0 CPU 작업 범위
- 최초 연결과 백그라운드 복귀만 전체 분리 동기화를 실행한다. 이후 MutationRecord의 메시지 단위로 후보와 처리본을 읽는다.
- 제거된 메시지 표시본은 정리하고, 변경 없는 나머지 메시지는 다시 복제하지 않는다.
- 알림 관찰은 microtask 한 번으로 병합하고 동일한 배지 값은 DOM에 다시 쓰지 않는다.
- 화면이 숨겨지면 DOM 분리와 알림 표시 갱신을 중단하고, 장식 효과를 일시 정지한다.
- 드래그 이동 중 레이아웃 읽기를 반복하지 않고 줄바꿈 위치 탐색을 순차 처리한다.
- 주기적 폴링이나 항상 실행하는 requestAnimationFrame 루프를 추가하지 않는다.
실제 온도, 배터리 및 모바일 CPU 프로파일은 측정하지 않았다.

0.13.0 데이터/표시 계약
- 페르소나 폴더는 /characters/persona-groups/list의 personaIds를 읽는다. 별도 폴더를 만들거나 소속을 수정하지 않는다.
- 최근 조회 ID/시간만 기기에 저장하고 서버 대화 날짜/폴더 순서는 변경하지 않는다.
- 초기 읽지 않음 복원에는 기존 QueryCache의 chats/list를 우선 사용한다. 수신/읽음 갱신은 기존 순정 query 이벤트와 metadata를 따른다.
- --marinara-app-accent-static을 읽어 공통 컬러를 연결한다. 동일한 정적 컬러/테마에서는 DOM 색상 값을 다시 쓰지 않는다.
- native panel/detail 화면에서만 순정 홈을 숨긴다. 패널의 기능/상태/원래 클릭 핸들러는 유지한다.
- 팝업 높이는 visual viewport에서 실제 하단 메뉴와 여백을 제외한다. 데스크톱은 왼쪽 메뉴를 제외한다.
참조한 공식 소스: PersonasPanel.tsx, use-characters.ts, App.tsx, shared/types/chat.ts, server/services/storage/chats.storage.ts.

0.14.0 설정과 레이아웃 계약
- 메인컬러는 순정 setAppAccentColor를 사용한다. 액션이 아직 노출되지 않으면 숨겨진 Appearance 화면을 준비해 같은 setter를 호출한다.
- 색상은 change 시 한 번만 저장하며 입력 중 지속 갱신/폴링을 추가하지 않는다.
- 홈 배너 표시만 mft-preferences에 저장한다. 메시지와 엔진 설정을 복제 저장하지 않는다.
- 확장 폰트 종류는 --font-user/상속, 크기는 rem을 사용한다. 분리 표시본에는 현재 소스의 인라인 서식만 전달한다.
- PeekPromptModal의 실제 data-chat-floating-panel + mari-chat-action-panel 구조에 여백을 적용한다.
  RightPanelMobile/MobileDetailSheet/ChatSidebarPanel은 하단 메뉴 위 사용 영역 전체를 채운다.
- 갤러리와 헤더 변경은 CSS로 처리하며 추가 관찰자/타이머를 만들지 않는다.
참조: 공식 App.tsx, SettingsPanel.tsx, PeekPromptModal.tsx, FloatingWindow.tsx (2026-10-14).

0.15.0 계약
- 피커는 CSS HSV 색상판 + 범위 입력 + HEX/RGB 입력이다. Pointer capture로 드래그하고 키보드 방향키로 채도/밝기를 조정한다.
- 색상 변경은 로컬 draft이며 Apply에만 기존 순정 setAppAccentColor를 호출한다. OS input[type=color]를 사용하지 않는다.
- 토스트 lifetime은 chatId+count/kind/callId/name 단위로 6500ms다. 화면 전환/다른 알림 변경으로 재시작하지 않는다.
  알림 제거 시 타이머를 정리하고 확장 해제 시 모두 정리한다. 만료 시 순정 읽지 않음 상태를 변경하지 않는다.
- RP 입력 집중 표시를 순정 ChatInput의 입력바 직계 자식과 CSS :focus와 사용자 포커스/입력/포인터 이벤트에 한정한다.
  원본 React DOM/핸들러를 교체하지 않으며 마우스 이탈/포커스 해제/Esc로 모든 컨트롤이 복귀한다. 포인터가 돌아와 버튼을 클릭할 때 재접힘을 막는다.
- 홈은 /characters/groups/list의 characterIds를 현재 catalog 페이지와 결합한다. 추가 전체 카탈로그/프로필 조회는 하지 않는다.
- 확장 페르소나 화면의 부모는 제작 화면이며 CloseWatcher/popstate 양쪽 분기를 명시한다.
참조: 공식 ChatInput.tsx, chat-input-styles.ts, chat.store.ts, use-characters.ts, characters.routes.ts.

0.16.0 계약
- 미분류 shelf/페르소나 section은 h2를 만들지 않고 첫 폴더 앞에 배치한다. 저장 폴더 소속은 변경하지 않는다.
- 색상 draft는 --mft-user-accent/banner로 프레임 단위 미리보기한다. 엔진 setter는 Apply에서만 호출한다.
  Cancel/화면 전환은 RAF를 취소하고 기존 엔진 static 색상으로 복귀한다.
- 모바일은 focus/input에서 집중 표시하고 pointerout을 무시한다 (터치 후 pointerout 발생으로 즉시 해제되는 것 방지).
- 모바일 입력바의 도구 버튼은 원래 React 자식을 변경하지 않고 별도 클래스의 버튼으로 추가한다.
  pointerdown 기본 포커스 이동을 막아 키보드를 유지하며 도구 복귀만 수행한다.
  순정 재렌더로 버튼이 사라지면 다음 입력 이벤트에서만 복구한다. 해제 시 버튼과 모든 이벤트를 정리한다.
- 선톡 토스트 타이머는 5200ms이며 원래 unread state/notification callback은 변경하지 않는다.

0.17.0 계약
- 폴더 밖 section의 제목을 캐릭터/페르소나로 지정하고 첫 section 배치를 유지한다.
- 입력 집중 상태는 data-mft-writing 속성이다. 순정 hasInput className 변경에 덮어써지지 않는다.
  focusout은 microtask에서 현재 textarea 포커스를 다시 확인하며 실제 포커스 해제만 복귀한다.
  삭제된 노드의 pointerout/focusout은 상태를 해제하지 않는다.
- 입력바는 padding 14px 16px, margin-block 12px, min-height 70px; 입력칸 min-height 38px/세로 패딩 7px다.
- PresetsPanel의 실제 data-touch-drag-card=preset/data-preset-open-action/data-preset-image-action에 CSS를 한정한다.
  절대 위치 액션을 flex 항목으로 표시하고 pr-36 예약 공간을 없앤다. React 노드/핸들러는 교체하지 않는다.
- SettingControls의 실제 switch-track/thumb 및 checkbox:checked 관계를 사용한다.
  트랙 30×18px, thumb 14px/이동 12px, label 34×28px이며 체크 동작은 원래 input을 사용한다.
참조: 공식 PresetsPanel.tsx, settings/SettingControls.tsx, ChatInput.tsx.

0.18.0 계약
- 순정 data-touch-drag-card의 preset/lorebook/connection/persona/character/agent 값에 공통 목록 CSS를 한정한다.
- 제목 우측 pointer-events-none 액션 그룹은 static flex, 버튼 24px/SVG 12px이다. 원래 콜백/접근성 라벨을 보존한다.
- 행 내부 모바일용 pr-* 예약 공간과 40px 대표 이미지 크기를 줄인다. 필터/설정/채팅 메시지 버튼에는 적용하지 않는다.
- RP 넓은 패딩/여백/최소 높이는 data-mft-writing에만 적용한다. 일반 상태의 엔진 여백·입력 크기 규칙을 재사용한다.
- 채팅 목록 선택 버튼만 세로 패딩 7px/바 패딩 3px/세로 마진 9px이며 equal grid columns는 유지한다.
참조: 공식 PersonasPanel.tsx, LorebooksPanel.tsx, CharactersPanel.tsx, ConnectionsPanel.tsx, AgentsPanel.tsx, PresetsPanel.tsx.

0.19.0 계약
- 순정 mari-avatar-placeholder--character/persona 클래스에 원형/무글로우 디자인을 적용한다.
- placeholder-start/end/text를 mft-accent/on-accent에 연결해 고정 teal을 제거한다.
- 이미지의 크롭/transform/좌표는 수정하지 않는다. 내부 클립 래퍼를 원형으로 만들고 큰 crop 이미지 자체의 radius는 0으로 둔다.
- 즐겨찾기 배지가 있는 컨테이너는 바깥 overflow를 유지해 배지가 잘리지 않게 한다.
  배지 없는 프사/직접 이미지 렌더 컨테이너는 원형 overflow clip을 적용한다.
- 페르소나 카메라 overlay/원래 클릭 핸들러를 유지하고 CSS로만 형태/글로우를 바꾼다.
참조: 공식 globals.css의 mari-avatar-placeholder--persona 고정 색상과 CharactersPanel/PersonasPanel 내부 클립 구조.

0.20.0 계약
- SettingsSwitchTrack/thumb의 Tailwind independent translate를 none으로 중화하고 transform 한 번만 적용한다.
  트랙 내부 box sizing/overflow를 고정하고 불필요한 thumb 이동 애니메이션을 제거한다.
- persona 목록 description 마지막 줄만 CSS로 숨긴다. profile editor의 원문과 저장 데이터는 건드리지 않는다.
- character row의 비 italic 메타데이터 텍스트가 실제 태그 배지와 같을 때 표시 속성으로만 숨긴다.
  title/comment/버전은 삭제하지 않고 React DOM 텍스트를 다시 쓰지 않는다.
- 활성 관리/편집 root에만 childList/characterData 관찰을 붙이고 own/chat 진입 시 해제한다.
  도움말 추가 중 관찰을 해제하고 즉시 재연결해 자기 생성 DOM의 반복 처리를 막는다.
- LorebookEntryRow ExpandedDrawer에 별도 details 안내와 Field label 도움말을 추가한다.
- PresetEditor data-touch-reorder-item=preset-section header의 제목을 독립 flex 행으로 표시한다.
- native 글자 크기 강제를 제거하고 family를 inherit/엔진 --font-user 및 --mari-widget-font-override로 연결한다.
- 기존 태그는 metadata 입력 focus에서만 catalog/personas/list를 100개 페이지로 조회해 datalist를 만든다.
  중복 요청 공유/캐시/해제 시 AbortController 정리를 사용한다. 입력값과 순정 추가 핸들러를 변경하지 않는다.
참조: 공식 PersonaEditor.tsx, CharacterEditor.tsx, PersonasPanel.tsx, CharactersPanel.tsx,
LorebookEntryRow.tsx, PresetEditor.tsx, SettingControls.tsx, App.tsx, globals.css.

0.21.0 계약
- 태그 combobox/listbox는 입력 행 다음에 별도 노드로 추가한다. React 입력값은 native value setter + input 이벤트로 전달한다.
  원래 Add/Enter 등록 기능은 유지하며 키보드 추천 선택 시에만 이벤트를 소비한다.
  목록 닫기/이동/해제 시 노드와 이벤트를 정리하고 원래 ARIA/list/autocomplete 속성을 복구한다.
- 추천 목록의 childList 변경을 nativeUiObserver에서 제외해 키 입력이 전체 에디터 검사로 이어지지 않게 한다.
- 태그 자료는 기존 QueryCache의 완전한 personas/characters list 배열이 있으면 재사용한다.
  raw storage JSON/decoded data/top-level tags를 해석하고 조회와 결과는 중복 공유·캐시한다.
- viewRequests 집합으로 독립 자료/폴더 GET을 병렬 실행하고 stop에서 모두 abort한다. cache는 12개 상한이다.
- 프리셋 header는 movement/title-row/metadata grid, 로어북은 title-first flex wrap으로 배치한다.
  원본 React 노드/콜백 순서를 변경하지 않는다.
- 실제 .mari-chat-settings-drawer.mari-window와 .mari-window__body에 높이/스크롤을 적용한다.
  모바일 viewport/nav 높이 변화에 CSS 변수로 대응하고 PC 창 geometry는 원래 엔진을 따른다.
참조: 공식 FloatingWindow.tsx, ChatSettingsDrawer.tsx, persona-cache.ts, PresetEditor.tsx, LorebookEntryRow.tsx.

0.22.0 계약
- 로어북 quick-controls relative wrapper는 열렸을 때 display:contents; 실제 popup은 static/full-basis로 card flow에 둔다.
  React 노드 이동, 필드 값 재작성, 원래 토글/완료/저장 콜백 변경은 없다.
- 프리셋 title+toggle / movement+group+actions 두 줄. 역할 장식 glyph는 숨기며 role select는 유지한다.
  expanded name/role grid는 minmax(0,…)로 폭 제한하고 380px 이하는 한 열로 배치한다.
- CenterContent도 native editing 동안 mount 관찰에 포함한다. 추가/변경된 row의 부모 영역만 즉시 microtask로 검사한다.
  채팅/자체 화면에서는 관찰을 중단하며 도우미 자체 변경은 제외한다. 반복 타이머/가이드 네트워크 요청은 없다.
- homeView/personaView는 mft-preferences에 각각 저장한다. banner preference 변경 시 같이 보존한다.
  data-catalog-view에 CSS만 적용하여 목록 카드의 상세 열기·폴더·검색·페이지 이동 계약을 보존한다.

0.23.0 계약
- retainedUnread를 mft-unread-ledger에 500개 상한으로 저장한다. 빈 native Map은 읽음 신호로 취급하지 않는다.
  finishRoute(chat) 성공 시 해당 방을 비우며 toast/visibility/reload는 acknowledgeUnread를 호출하지 않는다.
  readUnreadVersions와 chatVisits로 이전 서버 metadata 표시의 부활을 억제한다.
- 홈 scroll(default)=original rail, gallery=grid; persona gallery(default)=original grid, scroll=horizontal rail.
  v0.22의 vertical-list CSS를 제거한다. React 서버 데이터와 카드/폴더 계약을 변경하지 않는다.
- design은 자체 Shadow UI로 My 탭에 속한다. banner/view/spacing 저장은 같은 preferences 객체를 보존한다.
  range input은 즉시 CSS custom property를 갱신하고 change에서 저장한다. cleanup은 원래 변수를 복구한다.
- SettingsSwitch checked property와 native translate-x-4 모두 12px 위치에 매핑하고 공통 30x18/14 geometry를 쓴다.
- SettingsSection 원본 DOM 위치·필드·핸들러를 유지한다. header에 toggle만 추가하고 border-t content를 CSS로 접는다.
  native 검색은 모든 해당 section을 펼친다. 설정 전체 분류/검색/저장은 순정이 담당한다.
- 바로가기는 원래 DOM click을 실행하며 stale button을 label로 재탐색한다. hook/plugin API·chat payload를 수정하지 않는다.
  fetch wrapper는 character resource write 성공 확인만 담당하며 chat generation/context 요청은 원본으로 통과한다.
- observer/microtask batching과 lazy images/cache/cancel을 유지한다. interval, 반복 스캔 타이머를 추가하지 않는다.

0.24.0 계약
- own 재진입과 native settings tab/group 클릭에서 모든 설정을 접고 검색 요청을 초기화한다.
- 검색 input은 전체 섹션을 펼치지 않는다. 검색 결과의 native 분류 제목으로 해당 section만 펼친다.
  1.5초의 대상 식별 유효 기간은 React 지연 mount를 위한 값이며 반복 타이머는 없다.
- roleplay-tracker wrapper 아래 native section + fieldset을 기존 SettingsSection 계약과 함께 처리한다.
- fold button은 텍스트 대신 26x28px 화살표이며 aria-expanded/controls/label과 title을 유지한다.
- touch composedPath에서 rail/gallery/persona/card 및 실제 overflow-x scroll 영역을 구분한다.
  수평 컨테이너 안의 공백도 navigation swipe에서 제외하며 passive native scrolling을 유지한다.
  자체 비주요 탭(persona/detail/design)은 일반 탭 스와이프 대상으로 계산하지 않는다.

- 설정 content/header가 교체되면 연결이 끊긴 fold 상태를 해제하고 현재 DOM에 재연결한다. native handler와 값은 보존한다.

0.25.0 계약
- 공식 Convo .texting-bubble-user 직접 선택자로 background를 --mft-accent에 연결한다.
- background-image:none으로 native fixed-blue gradient를 제거하며 message DOM/서식/외부 처리본을 바꾸지 않는다.
- bubble selector만 사용하여 linear 메시지의 투명 배경을 보존한다. 새 관찰자나 타이머는 없다.

0.26.0 계약
- RP image의 현재 React memoizedProps 조상에서 해당 message/personaInfo만 최대 24단계 확인한다.
- user message.extra의 personaSnapshot 우선, 없으면 personaInfo를 사용한다. 이미지 URL과 일치할 때만 crop을 적용한다.
- URL-only character crop cache보다 메시지별 persona crop을 우선하여 같은 사진/다른 크롭을 보존한다.
- 기존 applyNativeCrops/cropStyle/100ms event batching을 재사용한다. user rpg-avatar-panel-media도 적용한다.
- roleplayPadding은 null일 때 원래 형식별 여백을 유지하며 숫자일 때 0~40px로 제한한다.
  기존 RP 본문 padding 규칙의 horizontal 값만 변수로 연결한다. 세로 여백/프사 크기는 유지한다.
- range 입력은 실시간 CSS, change는 preferences 저장; cleanup은 원래 CSS 변수를 복원한다.

0.27.0 계약
- 현재 personaInfo.id와 snapshot.personaId가 일치하거나 snapshot ID가 없고, 표시 URL이 같을 때 현재 crop 우선.
- 다른 메시지 페르소나/사진은 snapshot crop 유지. 현재·스냅샷 사진과 다른 expression은 보정하지 않는다.
- nearest DOM fiber까지 부모 5단계, 이후 memoizedProps 조상 최대 32단계; message 객체 여부도 검사한다.
- 실제 rpg-avatar-panel-stack/media 구조에서 캐릭터와 동일 cropStyle 및 aspect-cover 계산을 사용한다.
- cropped img의 native fade mask를 제거한다. 추가 조회/관찰자/타이머는 없다.

0.28.0 계약
- native chat 모드 루트에 scoped translation observer를 연결한다. 자체/비활성/백그라운드 화면에서는 중단한다.
- 원문과 번역이 sibling이면 해당 메시지 원문의 computed font-size를 translation CSS property로 연결한다.
- 이미 같은 값이면 쓰지 않고 source style/class 또는 신규 translation DOM만 갱신한다.
- root가 같고 관찰 중이면 재검색하지 않는다. characterData/polling은 사용하지 않는다.
- cleanup/root 교체 시 원래 translation CSS property를 복원한다. 메시지·번역 데이터/React 핸들러는 그대로 둔다.

0.29.0 계약
- translationReduction preference(0~12px, default 0)를 다른 디자인 값과 함께 저장한다.
- separate translation size = max(1px, original computed px - CSS reduction variable).
  range preview는 CSS 변수만 바꾸며 추가 메시지 스캔은 하지 않는다.
- sibling 번역 또는 VN mt-2/border-t 번역이 감소 대상; in-place 본문은 원래 크기를 유지한다.
- 디자인 DOM을 세 그룹으로 구성하고 동일 preference-row/range/value/preview 구조를 사용한다.
- 저장을 saveDesignPreferences 함수로 통일하여 설정 변경 시 다른 값이 누락되지 않도록 한다.
