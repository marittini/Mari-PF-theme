현재 0.35: RELEASE_AUDIT_0.35.md가 이번 변경·검증의 기준입니다. 아래는 이전 이력입니다.

현재 0.34: RELEASE_AUDIT_0.34.md가 이번 변경·검증의 기준입니다. 아래는 이전 이력입니다.

현재 0.33: RELEASE_AUDIT_0.33.md가 이번 변경·검증의 기준입니다. 아래는 이전 이력입니다.

현재 버전 0.32: RELEASE_AUDIT_0.32.md가 이번 변경·검증의 기준입니다. 이후 버전은 0.33, 0.34 순서입니다. 아래는 이전 이력입니다.

현재 0.31.14 변경·검증 기준: RELEASE_AUDIT_0.31.14.md. 아래 기록은 이전 버전의 이력입니다.

# 현재 검증: 0.31.13

RELEASE_AUDIT_0.31.13.md가 이번 변경과 실행 결과의 기준입니다. 아래 기록은 이전 버전의 이력이며 현재 통과의 증거로 사용하지 않습니다.

# 요청 기능 및 경로 감사 · 0.31.12

2026-10-15, 현재 소스/배포 ZIP 기준. **“모의 통과”는 실제 서버·실기기의 동작 보증이 아닙니다.** 사용자 재현이 있으면 해당 항목은 다시 열어야 합니다.

## 0.31.12 데스크톱 패널 containment

기존 데스크톱 모의 환경은 실제 RightPanelDesktopSlot 부모의 contain:layout paint를 재현하지 않아 1920px 잘림을 놓쳤습니다. 해당 순정 규칙을 직접 읽어 구성한 desktop-panel-containment.cjs에서 이전 CSS의 잘림과 수정 후 표시·클릭을 비교했습니다. 실행 JS 변경 없이 CSS 선언 하나로 한정했습니다. DESKTOP_PANEL_AUDIT.md 참조.

## 0.31.11 모드 선택창 회귀

0.31.10의 생성 중 뒤로가기 예약이 순정 패널의 지연 정리 이벤트까지 사용자 취소로 처리했습니다. 지연 마운트 조건을 추가한 lazy-launch.cjs에서 이전 배포본의 모드 선택창 소실을 재현하고, 수정본의 세 버튼 유지·클릭을 확인했습니다. 실행 변경 파일은 engine/history.js 하나입니다. LAUNCH_CLEANUP_AUDIT.md 참조.

## 0.31.10 생성/기존 방/뒤로가기 전환 재검수

SETUP_HANDOFF_AUDIT.md 참조. 0.31.9 모의 검사는 생성창을 일반 role=dialog 팝업으로 단순화하고 초기화 액션이 DOM 조회 지점에 모두 있는 것으로 가정했습니다. 실제 순정 구조와 다른 조건이었으므로 두 제보를 막지 못했습니다. 이번에는 역할 표기 없는 ChatSetupWizard, DOM 없는 컴포넌트의 액션, 순정 Window 뒤로가기 선행을 포함해 재현·수정 검사를 추가했습니다.

## 0.31.9 액션/표시 일치 재검수

ACTION_COHERENCE_AUDIT.md에 추가 경로 10개의 원인·조치·검사 및 미검증 범위를 기록했습니다. 상세 편집 대상 ID와 실제 표시 데이터 일치, 외부 확장의 동일 패널 재사용, 실기기 브라우저 왕복은 추가 통합 검증 대상으로 남습니다.

## 0.31.8 추가 원인과 수정

- A → 홈에서 engineHome()이 실패해도 go()/returnFromNative()가 실패 결과를 무시했습니다. 현재 React 액션 조회 지점이 사라지면 홈 뒤에 A가 남을 수 있었습니다. 이전 감사의 내비게이션 모의 검사는 액션 조회 지점이 유지되는 조건에 치우쳤습니다.
- 이제 앞서 확인한 순정 setActiveChatId 액션을 재사용하고 해제된 ID를 확인합니다. 실패하면 홈 표시를 진행하지 않으며 제한된 재시도만 수행합니다. 저장 키를 임의로 지워 엔진 상태와 다르게 만드는 방식이 아닙니다.
- 홈에서 복귀할 때 잔여 활성 방을 재확인합니다. B가 실제 표시 중인 경우에는 B를 해제하지 않습니다.
- 홈/알림 이동의 전체 데이터 캐시 삭제를 채팅 데이터 무효화로 좁혔습니다. 캐릭터/페르소나/폴더의 실제 저장 요청에 의한 기존 캐시 무효화와 TTL은 유지합니다.
- 추가 검사: adapter-session.cjs, home-session.cjs. PC/모바일의 A→홈/뒤로가기→다른 브라우저 왕복, A→B 비교, React 조회 지점 소실, 홈 복귀 추가 조회 0회 조건을 확인했습니다. 실제 기기 검증이라는 뜻은 아닙니다.

## 이번에 확인한 누락 경로

1. 엔진의 AppShell은 활성 방의 미읽음을 지울 때 페이지가 숨겨졌는지 확인하지 않습니다. 테마는 활성 방을 복귀 직후 읽은 것으로 처리했습니다. 다른 방만 대상으로 한 이전 검사는 이 경로를 놓쳤습니다.
2. 쿼리 목록 갱신만 반영하고 `chats/detail`의 미읽음 메타데이터를 저장하지 않았습니다. 숨김 상태에서 양수 메타데이터가 곧바로 삭제되면 복귀 조회만으로는 복구할 수 없었습니다.
3. `visibilitychange` 중심의 복귀 처리에 `blur/pagehide/freeze` 체크포인트가 빠져 있었습니다.
4. 토스트 이동은 방 모드를 `conversation`으로 고정했습니다. 등록된 대상 방의 실제 모드와 캐릭터 ID를 사용하도록 수정했습니다.

## 수정한 동작

- 미읽음 메타데이터는 조회/상세 갱신을 받는 순간 저장합니다. 이후 엔진이 0으로 갱신해도 아직 확인하지 않은 로컬 기록을 지우지 않습니다.
- 같은 방 복귀는 확인으로 취급하지 않습니다. 해당 채팅 영역의 누름/키 입력/직접 휠 스크롤 또는 명시적인 방 열기가 확인 경로입니다. 일반 팝업 조작은 확인에서 제외합니다.
- 메타데이터가 이미 지워진 활성 CONVO에 한해, 이탈 이후 갱신되었다면 최근 50개 메시지를 추가로 확인합니다. 새 assistant 메시지만 세며 user/숨김/이탈 이전 메시지는 제외합니다. 과도한 전체 이력 조회는 하지 않습니다. 이 복구 경로에서 이탈 중 50개보다 많은 메시지가 생긴 경우 정확한 전체 개수는 보장하지 못합니다.
- 정상 복구 후 주기적인 서버 조회를 추가하지 않았습니다. 정상적인 백그라운드 처리를 중단하거나 순정 읽음 API를 막지 않습니다.
- 이번 작업에서 기존 기능을 롤백하지 않았습니다. 0.31.4에서 도입했다가 0.31.5에 철회한 전역 최적화는 과거 이력이며, 현재 수치로 인용하지 않습니다.

## 항목별 구현/검증표

소스는 development/theme 아래, 검사는 development/tests 아래입니다. 표의 증거는 현재 구현 위치와 실행한 검사를 구분합니다.

| # | 분야 | 요청 | 구현 위치 | 검사/근거 | 상태 |
|---|---|---|---|---|---|
| 1 | 내비게이션 | 홈·채팅·제작·마이페이지 및 순정 진입/복귀 | src/engine/navigation.js, src/ui/hub.js | v031.cjs | 모의 통과 |
| 2 | 내비게이션 | 상단 Marinara·작은 앱 전체 새로고침 | src/ui/shell.js, src/ui/gestures.js | v031.cjs | 모의 통과 |
| 3 | 내비게이션 | 설정·연결·확장 관리의 순정 홈 노출 억제 | src/engine/navigation.js, styles/native/foundation.css | v031.cjs | 모의 통과 |
| 4 | 내비게이션 | 페르소나 관리 뒤로가기 시 제작 복귀 | src/engine/history.js, src/features/catalog.js | v031.cjs | 모의 통과 |
| 5 | 생성 | 대화/롤플레이/게임 연속 생성 및 순정 옵션 유지 | src/engine/launch.js, navigation.js | start-flow.cjs | 모의 통과 |
| 6 | 생성 | 게임 X 후 빈 방 삭제 대기·저장된 게임 유지 | src/engine/launch.js, adapter.js | start-flow.cjs | 모의 통과 |
| 7 | 생성 | 중첩 선택창 취소·긴 설정·등장 애니메이션 | src/engine/launch.js | launch-lifecycle.cjs | 가상시계 통과 |
| 8 | 생성 | 새 게임 하단 버튼·본문 스크롤·키보드 높이 | styles/native/foundation.css | game-setup-layout.cjs | 20조건 모의 통과 |
| 9 | 라이브러리 | 홈과 페르소나의 실제 폴더별 분류 | src/features/catalog.js | v031.cjs, performance.cjs | 모의 통과 |
| 10 | 라이브러리 | 미분류 항목을 캐릭터/페르소나로 표시·맨 위 | src/features/catalog.js | v031.cjs | 모의 통과 |
| 11 | 라이브러리 | title/comment만 표시·빈 값 생략·description 미표시 | src/core/data.js, src/features/native-ui.js | v031.cjs | 모의 통과 |
| 12 | 라이브러리 | 상세 소개는 Creator Notes·빈 값 안내 | src/features/catalog.js | v0317-compat.cjs | 모의 통과 |
| 13 | 라이브러리 | 갤러리/스크롤 선택·홈/페르소나 독립 저장 | src/features/design.js, catalog.js | v031.cjs | 모의 통과 |
| 14 | 라이브러리 | 페르소나 왼쪽 정렬·폴더 구분선·간격 | styles/shadow/catalog.css | v031.cjs | 모의 통과 |
| 15 | 라이브러리 | 수평 스크롤 중 옆 탭으로 이동 방지 | src/ui/gestures.js | v031.cjs | 터치 모의 통과 |
| 16 | 라이브러리 | 검색·페이지 이동·폴더 지연 응답 격리 | src/features/catalog.js | performance.cjs | 모의 통과 |
| 17 | 라이브러리 | 즐겨찾기 변경 후 홈 반영 | src/core/data.js | v031.cjs | 모의 통과 |
| 18 | 라이브러리 | 오늘의 캐릭터 문구·초상 주변 효과·중앙 정렬 | src/features/daily.js, catalog.js | v031.cjs | 모의 통과 |
| 19 | 사진 | 순정 캐릭터/페르소나 원형·네온/뒤판 제거 | styles/native/catalog.css | v031.cjs | 모의 통과 |
| 20 | 사진 | 로딩 대체 글자 숨김·단색 지향색 | src/features/avatars.js, styles/native/catalog.css | v031.cjs | 모의 통과 |
| 21 | 사진 | RP 캐릭터/페르소나 현재 사진·크롭·배너 비율 | src/features/avatars.js, src/engine/adapter.js | v031.cjs | 모의 통과 |
| 22 | 선톡 | 토스트 시간·스와이프 닫기와 미읽음 분리 | src/features/notifications.js | v031.cjs | 모의 통과 |
| 23 | 선톡 | 새로고침/다른 방/방 없는 상태에서 배지 유지 | src/features/notifications.js, chats.js | v031.cjs, v0317-compat.cjs | 모의 통과 |
| 24 | 선톡 | 현재 CONVO를 둔 채 이탈·엔진 선행 읽음 삭제 | src/features/notifications.js, chats.js, src/engine/query-updates.js | unread-ledger.cjs, v0317-compat.cjs | 이번 수정·모의 통과 |
| 25 | 선톡 | blur/pagehide/freeze 복귀·실패 재시도·무한 조회 없음 | src/engine/mounts.js | v0317-compat.cjs, resume-races.cjs | 이번 보강·모의 통과 |
| 26 | 선톡 | 메타데이터가 이미 사라진 활성 CONVO의 메시지 복구 | src/features/chats.js | unread-ledger.cjs | 이번 보강·단위 통과 |
| 27 | 선톡 | 대화/롤플레이/게임 분류별 배지 | src/features/notifications.js | v031.cjs, v0317-compat.cjs | 모의 통과 |
| 28 | 선톡 | 토스트에서 대상 방 모드 보존 | src/features/notifications.js | unread-ledger.cjs | 이번 누락 수정·단위 통과 |
| 29 | 채팅 | 최근 대화는 방문순·전체는 최근 메시지순 | src/features/chats.js | v031.cjs | 모의 통과 |
| 30 | 채팅 | 최근 대화의 폴더 숨김·전체 대화 순정 폴더 연결 | src/features/chats.js | v031.cjs | 모의 통과 |
| 31 | 채팅 | 새 답변 시 채팅 목록 갱신 | src/engine/query-updates.js | v031.cjs | 모의 통과 |
| 32 | CONVO | bubble/linear 간격·아바타 상단·줄바꿈 | src/features/convo.js, styles/native/messages.css | v031.cjs | 모의 통과 |
| 33 | CONVO | 편집 완료/취소의 원문 중복 제거 | src/features/convo.js | v031.cjs, v0317-compat.cjs | 모의 통과 |
| 34 | CONVO | 재생성 확인/아니요/삭제/스와이프 후 방 유지 | src/engine/history.js, navigation.js | v031.cjs | 모의 통과 |
| 35 | 외부 호환 | 번역 양방향 확장: 복제 DOM·인접·클릭·편집 보존 | src/features/convo.js, styles/native/messages.css | v0317-compat.cjs | 참조 DOM 함수 모의 통과 |
| 36 | 외부 호환 | TTS 태그 숨김·원문/복제본 양쪽 로딩 순서 | src/features/convo.js | v031.cjs | 참조 DOM 함수 모의 통과 |
| 37 | 외부 호환 | 에이전트/외부 확장 바로가기·순정 액션 호출 | src/engine/extensions.js | v031.cjs | 모의 통과 |
| 38 | 외부 호환 | 외부 확장의 컨텍스트 주입·실제 모델 요청 | src/core/data.js, src/engine/extensions.js | 생성 API를 재작성하지 않는 범위 정적 확인 | 실제 서버 미검증 |
| 39 | RP | 타임스탬프 숨김·이름 확대/none 숨김·프사 크기 | styles/native/roleplay.css | v031.cjs | 모의 통과 |
| 40 | RP | 본문 왼쪽 정렬·확인 팝업 중앙 정렬 | styles/native/chats.css, roleplay.css | v031.cjs | 모의 통과 |
| 41 | RP | 포커스 때만 입력창 확장·아이콘 복귀·모바일 깜빡임 | src/features/writing.js | v031.cjs | 터치 모의 통과 |
| 42 | 디자인 | 지향색 피커·실시간 미리보기·적용/취소·리셋 제거 | src/features/design.js | v031.cjs | 모의 통과 |
| 43 | 디자인 | 사용자 말풍선/아이콘/페르소나 지향색 | src/ui/theme.js, styles/native/messages.css | v031.cjs | 모의 통과 |
| 44 | 디자인 | 홈 배너 선택·전용 디자인 화면/섹션 | src/features/design.js, src/ui/hub.js | v031.cjs | 모의 통과 |
| 45 | 디자인 | 채팅 자간/행간·RP 좌우 여백·번역문 축소량 저장 | src/features/design.js, translations.js | v031.cjs, module-contracts.cjs | 모의 통과 |
| 46 | 디자인 | 엔진 글꼴/글자 크기 상속 | styles/native/resources.css, src/features/translations.js | v031.cjs | 모의 통과 |
| 47 | 디자인 | 라이트/다크·엔진 테마 변경 반영 | src/ui/theme.js, src/engine/extensions.js | v031.cjs | 모의 통과 |
| 48 | 디자인 | OS 자동 테마의 독립 선택 항목 | src/ui/hub.js | 현재 자체 선택지는 라이트/다크뿐임 | 독립 옵션 없음·누락 기록 |
| 49 | 순정 UI | 6종 관리 목록의 작은 액션·원형 사진·토글 | src/features/native-ui.js, styles/native/resources.css | v031.cjs | 모의 통과 |
| 50 | 순정 UI | 모바일 태그 자체 목록·검색·키보드·기존 태그 | src/features/tags.js | v031.cjs | 모의 통과 |
| 51 | 순정 UI | description 숨김·캐릭터 태그 중복 제거 | src/features/native-ui.js | v031.cjs | 모의 통과 |
| 52 | 순정 UI | 로어북 작은 도움말·제목/액션·빠른 설정 경계 | src/features/native-ui.js, styles/native/resources.css | v031.cjs | 모의 통과 |
| 53 | 순정 UI | 프리셋 제목·이동/복사 액션 배치·모바일 경계 | src/features/native-ui.js, styles/native/resources.css | v031.cjs | 모의 통과 |
| 54 | 순정 UI | 설정 기본 접힘·찾기·트래커 패널 접기 | src/features/settings.js | v031.cjs: 일반 설정 접기 검사, 트래커 하위 섹션은 소스 확인 | 부분 검사·트래커 개별 재현 필요 |
| 55 | 순정 UI | 프롬프트 확인/채팅 설정창 하단 여백·관리 탭 전체 높이 | styles/native/chats.css, foundation.css | v031.cjs | 모의 통과 |
| 56 | 도움말 | 마이페이지 우측 도움말·md 편집·쉬운 내용·뒤로가기 | src/features/help.js, content/help.md | v0317-compat.cjs | 모의 통과 |
| 57 | 구조 | 30개 모듈·명시 의존·상태 격리·종료/실패 복구 | module-contracts.json, src/core/lifecycle.js | module-contracts.cjs, build-contracts.py | 계약 통과 |
| 58 | 성능 | 홈/페르소나 선표시·이미지 지연 로딩·변경 관찰 범위 | src/features/catalog.js, avatars.js, convo.js | performance.cjs, v031.cjs | 제어 환경 통과 |
| 59 | 성능 | 실제 모바일 발열·배터리·첫 로딩 시간 | 사용자 기기 및 실제 서버 필요 | 이번 환경에서 실측 불가 | 미검증 |
| 60 | 호환성 | iPhone Safari/WebKit·Android 실기기 | 로컬 Chromium 터치와 실제 브라우저는 다름 | 실기기 직접 검증 없음 | 미검증 |
| 61 | 별도 산출물 | 끄끼/끄버 PC·폰 설명서 목업 | 확장 런타임 기능이 아닌 별도 이미지 요청 | 별도 Marinara-Four-Tabs-Manual-Mockups.zip 존재 | 별도 산출물 존재·현재 UI와 일치 미검증 |

## 범위와 남은 확인

- iPhone Safari/WebKit와 Android 실기기에서 실제 다른 브라우저로 왕복하는 검증은 수행하지 못했습니다. Chromium에서 touch/모바일 viewport 및 수동 lifecycle 이벤트를 사용했습니다.
- 실제 서버에서 외부 확장의 컨텍스트가 최종 모델 요청에 포함되는지, 실제 발열/배터리, 50개 초과 메시지의 복구 개수는 미검증입니다.
- OS 자동 테마의 자체 선택 UI는 현재 없습니다. 라이트/다크 및 엔진의 테마 변경 반영과 구분해 누락으로 기록합니다. 안전한 미읽음 복구 작업과 섞어서 새 테마 경로를 추가하지 않았습니다.
- 설명서 목업은 별도 Marinara-Four-Tabs-Manual-Mockups.zip으로 존재합니다. 이번 설치 ZIP에 포함하지 않았으며 현재 UI와의 일치는 재검증하지 않았습니다.

## 원인 확인에 사용한 엔진 기준

Pasta-Devs/Marinara-Engine commit `c56501495a8baf76c258e76534c8728a9b7859bb`의 AppShell.tsx 활성 방 읽음 effect, ConversationAutonomousEffects.tsx, ChatSidebar.tsx, use-generate.ts 및 use-autonomous-messaging.ts를 읽었습니다. 사용자 서버가 같은 커밋이라는 의미는 아닙니다.

https://github.com/Pasta-Devs/Marinara-Engine/blob/c56501495a8baf76c258e76534c8728a9b7859bb/packages/client/src/components/layout/AppShell.tsx

## 재검수 운영 기준

- 변경 항목마다 기존 요청과 진입/복귀 경로, 취소/확인, 배경 전환, 종료 정리의 검사를 함께 유지합니다.
- 실패한 기존 검사를 지우거나 원래 요구를 다른 요구로 바꿔서 통과 처리하지 않습니다.
- 플랫폼/실기기 미검증은 PASS와 분리합니다. 로컬 측정만으로 발열·실서버 로딩 개선을 단정하지 않습니다.
