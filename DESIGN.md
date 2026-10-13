# 마리나라 플랫폼화 0.12.0

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
