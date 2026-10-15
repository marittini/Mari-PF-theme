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

## 캐릭터에서 새 대화 시작 · 0.31.2

navigation.bridge의 start 분기는 순정 앱을 표시한 상태로 원래 start-character-chat 모달을 엽니다. start 레이어에서는 순정 HomeBrowserHub만 가립니다. 모드 선택과 옵션 설정은 엔진 핸들러가 소유하며 테마의 지연 클릭 내비게이션이나 prepareChat 상태 초기화를 적용하지 않습니다.

mounts.watchStart는 이 시작 과정에서만 DOM 관찰자를 붙입니다. 본문 밖으로 포털된 설정창도 포함합니다. 이전 방 ID와 다른 실제 채팅 표면을 확인하고, 설정 모달/복구 로딩이 끝난 뒤 roomId와 모드를 기록하여 finishRoute를 실행합니다. 완료·취소·라우트 중단·확장 종료 시 관찰자와 취소 타이머를 정리합니다. 주기적 폴링과 추가 방 생성 요청은 없습니다.

검사: node tests/start-flow.cjs. PC/모바일의 세 모드에서 숨겨진 설정창, 중복 클릭, 옵션 보존, 방 식별, 취소 복귀를 검사합니다. 출발 화면이 이전 방인 경우의 오래된 표면도 배제합니다.
