## 0.31.4 loading and refresh invariants

- data.get merges option-free GETs only within the same view epoch. Writes never share a pending read or read cache. Each pending entry removes only itself on completion.
- Catalog and folder requests run concurrently. Cards render independently; late folders reuse per-ID card pools (including membership in multiple folders) and must check the epoch before touching the view.
- Chat refresh uses maps for rendered/stored rows and a cursor for minimal reorder. Keep unchanged rows in place to preserve focus, scroll and foreign DOM.
- Preview lookup starts from rendered nodes, not the whole room list. Single-room message changes preserve unrelated cached previews.
- Image IntersectionObserver is retained and disconnected on view stop; do not introduce periodic scans.
- Regressions: tests/performance.cjs, tests/list-updates.cjs, tests/v031.cjs, tests/v031-compat.cjs and tests/start-flow.cjs. Performance fixtures do not measure physical device heat.

# 유지보수 안내 · 0.31.0

설치용 파일은 manifest.json, extension.js, extension.css입니다. 개발 소스는 development/theme 아래에 있습니다. 소스만 수정하고 빌드한 결과를 설치합니다. 배포 JS는 하나의 IIFE이며 런타임 모듈 다운로드가 없습니다.

## 수정할 위치

| 작업 | 소스 |
| --- | --- |
| 조립·초기화 순서 | src/app.js, src/core/lifecycle.js |
| 순정 엔진 내부 액션·React 조회 | src/engine/adapter.js |
| 화면 이동·뒤로가기·순정 화면 연결 | src/engine/navigation.js, history.js, mounts.js |
| 순정 쿼리 갱신·외부 확장 연결 | src/engine/query-updates.js, extensions.js |
| 요청·캐시·취소 | src/core/data.js, runtime.js |
| 홈·페르소나·폴더·오늘의 캐릭터 | src/features/catalog.js, daily.js |
| 채팅 목록·선톡·미리보기 | src/features/chats.js, notifications.js, previews.js |
| 콘보·번역·입력 집중·프사 크롭 | src/features/convo.js, translations.js, writing.js, avatars.js |
| 디자인 설정·순정 UI·접기·태그 | src/features/design.js, native-ui.js, settings.js, tags.js |
| 화면 셸·마이페이지·테마·제스처 | src/ui/ |
| 순정 화면 CSS / 확장 내부 CSS | styles/native/ / styles/shadow/ |

전체 공개 함수·상태·의존성은 MODULES.md, 기계 검증용 계약은 module-contracts.json을 봅니다.

## 모듈 경계

각 파일은 createX(deps) 팩토리를 내보냅니다. 인스턴스별 state를 소유하며 공개 함수와 initialize/cleanup 작업 목록을 반환합니다. app.js가 모두 생성한 뒤 lifecycle이 순서대로 시작합니다. 기존 시작·종료 순서를 보존하기 위해 order 값을 사용합니다. 파일 이동만을 이유로 order를 바꾸지 않습니다.

다른 모듈은 deps를 통해 접근합니다. 기존 기능 사이의 상태 쓰기도 crossStateWrites에 명시되어 있습니다. 새 연결을 추가할 때는 소유 모듈의 함수로 처리하는 것을 우선하고, 필요한 계약 변경을 함께 검토합니다. 기존 상호 의존성을 모두 제거한 구조는 아닙니다.

이벤트·관찰자·타이머를 추가하면 해당 모듈의 cleanup에도 정리를 추가합니다. dispose는 한 번만 실행되며 개별 정리가 실패해도 나머지를 계속 정리합니다. 초기화 실패 시에도 정리합니다. 새 상시 폴링이나 전역 DOM 전체 스캔은 추가하기 전에 기존 관찰자·큐·캐시를 재사용할 수 있는지 확인합니다.

## 스타일 수정

style-order.json은 CSS 적용 순서입니다. 기능별 CSS의 @mft-part / @mft-end 구간을 빌드가 순서대로 합칩니다. 동일 기능의 여러 구간이 다른 시점에 적용될 수 있으므로 파일명 순으로 단순 결합하지 않습니다. 새 구간은 manifest에도 한 번만 등록합니다. 기존 구간 내용·순서를 보존한 상태로 분리했습니다.

폰트는 사용자 설정을 상속하는 기존 정책을 유지합니다. 새 CSS에서 폰트명을 고정하거나 범위가 넓은 !important 규칙을 추가하기 전에 채팅·번역·순정 편집 화면을 확인합니다.

## 빌드와 검사

development 폴더에서 실행합니다. 빌드는 Python 표준 라이브러리만 사용합니다. npm 설치는 빌드에 필요하지 않습니다.

```sh
python3 theme/build.py
python3 theme/build.py --check
node --check theme/extension.js
node tests/module-contracts.cjs
python3 tests/build-contracts.py
python3 theme/tools/report-modules.py
```

브라우저 회귀 검사는 Node 20 이상에서 다음과 같이 실행합니다.

```sh
npm install
npx playwright install chromium
node tests/v031.cjs
node tests/v031-compat.cjs
```

build.py는 누락된 모듈·공개 함수·상태, 미등록 의존성·상태 쓰기, 잘못된 초기화 순서, CSS 중복·누락을 검사합니다. --check는 생성물이 소스와 일치하는지도 검사하며 파일을 쓰지 않습니다. 버전·이름·설명은 project.json에서 바꿉니다.

## 순정 엔진 업데이트 대응

1. adapter.js의 액션 이름, React 내부 조회, 채팅·페르소나 스냅샷 구조를 먼저 확인합니다.
2. navigation/history/mounts에서 재생성 취소·삭제·팝업·뒤로가기가 방을 닫지 않는지 확인합니다.
3. query-updates와 notifications에서 새 답변, 새로고침·앱 복귀 뒤 미확인 선톡 유지를 확인합니다.
4. 실제 순정 DOM이 바뀌면 native-ui/settings/tags와 styles/native의 선택자를 확인합니다.
5. 외부 확장 처리본·번역·컨텍스트 주입은 원래 이벤트와 요청 내용을 보존하는지 확인합니다.

자동 검사는 모의 순정 엔진 계약을 사용합니다. 실제 Android/iOS, 서버, 설치된 외부 확장 조합과 발열·배터리 수치를 보장하는 검사는 아닙니다. 엔진 업데이트 시 실제 환경 확인을 병행합니다.

## 도움말 내용 편집

`content/help.md`가 도움말 원본입니다. 제목·목록·강조·링크·코드 블록을 지원합니다. 안전한 기존 Markdown 렌더러를 사용하며 HTML은 실행하지 않습니다. 내용을 편집한 뒤 build.py를 실행하고 생성된 파일을 교체합니다. 런타임에 별도 파일 조회나 폴링은 없습니다. 화면 동작은 src/features/help.js, 스타일은 styles/shadow/help.css입니다.

## 번역 확장 호환과 복귀 갱신 · 0.31

문단 번역 확장의 `.ptx-view`, `data-ptx-hidden`, `data-ptx-active` 소유 영역은 테마의 콘보 분리에서 제외합니다. 원문을 숨길 때 inline display를 복제본에 물려주지 않고 범위가 제한된 data 속성 CSS를 사용합니다. `.ptx-view`는 이 규칙에서 제외하며 번역 확장의 인접 형제 관계와 이벤트 핸들러를 보존합니다. 번역이 종료되면 원래 콘보 분리를 다시 적용합니다. 번역 DOM은 외부 확장 소유이며 테마 종료 시 제거하지 않습니다.

visibility/focus/pageshow/online 복귀 이벤트는 120ms 단위로 합쳐 처리하고 서버의 `/chats`를 no-store로 조회합니다. 이전 쿼리 캐시는 복귀 때 사용하지 않습니다. 같은 복귀의 중복 이벤트는 제한하며 실제 숨김→복귀 및 네트워크 복구는 새 조회 기회를 갖습니다. 숨김 시 이전 보충 요청을 취소하며 요청은 12초 뒤 종료합니다. 미확인 장부는 서버 응답이 비어도 지우지 않습니다. 홈 피드 캐시 성공 이벤트의 선톡 메타데이터도 반영합니다.

첨부 확장 전체 코드를 수정하거나 배포물에 포함하지 않습니다. tests/ptx-dom-reference.js는 제공된 코드의 DOM 처리 함수만 추출한 검사용 참조이며 출처 해시를 기록했습니다. API 번역 요청 자체나 모든 외부 확장 조합을 통합 검증한 것은 아닙니다.

## 캐릭터 시작·반복 생성·게임 취소 · 0.31.3

전용 src/engine/launch.js가 새 대화의 choosing/creating/setup/opening/closing/ready 단계를 관리합니다. mode 버튼과 닫기 버튼을 관찰하며 원래 핸들러를 호출하거나 대체하지 않습니다. 방 생성 API나 생성 옵션을 테마에서 수정하지 않습니다.

adapter.activeSession은 엔진이 setActiveChatId에서 동기적으로 기록/해제하는 marinara-active-chat-id를 읽습니다. 이전 방과 다른 ID인지 확인하며, composer 또는 현재 방 props도 해당 ID와 맞는지 검사합니다. 같은 모드에서 DOM과 React alternate가 재사용되어도 예전 방을 채택하지 않습니다. localStorage 접근이 불가능한 경우에만 DOM 기반 확인으로 제한합니다.

설정 UI를 실제로 관찰한 뒤 닫히는 시점까지 기다립니다. Lazy/AnimatePresence의 빈 구간을 임의의 500ms 취소로 간주하지 않습니다. 게임의 시작/인트로 화면에는 data-chat-mode나 입력창이 없을 수 있어 roomReady가 현재 방 props를 제한된 후보 범위에서 확인합니다.

GameSetupWizard의 X는 순정에서 빈 방을 비동기로 삭제하고 활성 방 ID를 null로 바꿉니다. launch는 이를 확인하면 예전 RestoringChat이 남아 있어도 원래 카드로 복귀합니다. 저장된 게임을 유지하는 닫기는 현재 방을 유지합니다. 시작 중 history pop은 순정에 맡깁니다. 완료·취소·라우트 abort·종료 시 관찰자/리스너/타이머를 해제합니다. 주기적 폴링은 없습니다.

검사: node tests/start-flow.cjs. PC/모바일에서 각 모드 두 번 연속 생성, DOM 재사용과 이전 Fiber, 늦게 마운트되는 설정, 옵션 보존, 중복 생성, 게임 X 비동기 삭제와 오래된 로딩, 선택창 취소를 검사합니다. 모의 엔진 계약이며 제보자의 실제 설치 환경에서 직접 실행한 검사는 아닙니다.
