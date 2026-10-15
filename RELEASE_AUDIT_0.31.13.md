# 0.31.13 변경·검수표

## 기준과 복구점

- ME 공식 main: `c56501495a8baf76c258e76534c8728a9b7859bb`, package.json `2.5.0`. 이번에 GitHub에서 다시 읽은 소스만 순정 계약 근거로 사용했습니다.
- 테마 GitHub main: `cd1790d4e6d7b1f800d1996079cabb56d4c989a6`, 0.31.4. 작업 폴더의 최신 배포는 0.31.12입니다. GitHub 최신과 배포 이력을 혼동하지 않았습니다.
- 수정 전 extension.js / extension.css / manifest.json이 0.31.12 ZIP과 바이트 단위로 일치함을 확인했습니다. 이전 ZIP은 복구점으로 보존했습니다.
- 실제 사용자 서버의 설치 버전·활성 확장 조합은 접근할 수 없어 확인하지 못했습니다. 0.31.12를 수정 기준으로 사용했습니다.
- ME 본체 변경 없음. 순정 참조 파일은 development/refs의 읽기 전용 검증 자료이며 설치 실행 파일이 아닙니다.

## 요구사항과 변경

| 요청 / 이력 | 소스 확인과 조치 | 이번 검증 / 한계 |
| --- | --- | --- |
| 게임 사전설정 Back 후 없는 방 무한로딩 | 순정 GameSurface는 빈 초기 게임을 삭제합니다. useDeleteChat의 onMutate가 detail 캐시를 먼저 제거하면 컴포넌트별 onSuccess가 소실될 수 있습니다. 생성·설정·삭제 방식은 유지하고, 생성 거래 동안 순정 MutationCache의 삭제 성공을 관찰합니다. | 공식 useDeleteChat 본문의 onMutate/onError/onSettled를 실행한 검사에서 이전 버전 실패, 수정본 통과. 실제 React/TanStack 런타임 전체 실행은 아님. |
| 삭제 후 활성 방 해제 누락 | 삭제 context(previousGroups/affectedGroupIds), 성공 action, 생성 거래·대상 ID·게임 취소 상태가 모두 일치할 때만 순정 setter로 해당 활성 방을 해제합니다. 이미 방이 닫혔거나 다른 방/화면이면 변경하지 않습니다. | 콜백 소실/정상 콜백/실패 복원/다른 mutation/다른 방/다른 화면/구독 정리 검사 통과. 강제 홈 이동·재생성·별도 DELETE 없음. 기존 origin 복귀 경로 유지. |
| 설정 도중 복귀 안내 | 0.31.12에 이미 설정 시간 제한이 제거되어 있었습니다. 안내 타이머를 새로 추가하지 않았습니다. | 가상 시계 90초 설정·10분 생성, 중첩 선택창 취소, opacity 0 마운트 검사 통과. 실제 10분 모델 호출은 아님. 제보 기기에서 발생 여부는 미검증. |
| PC 오른쪽 패널 공백 / 768px 분기 누락 | 0.31.12의 패널 CSS는 1024px 이상만 대응했습니다. 수정은 실제 열린 DesktopSlot/패널 DOM에 적용하고, 테마의 1024px 좌측 레일 구분은 유지합니다. | 이전 CSS가 944px에서 패널을 좁은 슬롯에 가둠(x=560)을 재현. 수정본 84개 너비·입력·패널 너비 조합 통과. 768px DesktopSlot도 별도 검사. |
| 실제 ME 분기와 검사 불일치 | 공식 ui.store의 media query와 isMobileShellViewport 본문을 검사에서 사용합니다. 767px 경계 외에 터치/coarse 1440px 및 패널 너비에 따른 capacity fallback도 있습니다. 1024px을 순정 분기로 가정하지 않습니다. | 320/390/600/767/768/769/900/944/959/960/961/1023/1024/1152/1280/1440/1441/1920/2560px, 크기 왕복, 패널 너비 280/384, 터치/마우스. 설정·연결·확장 첫/마지막 버튼 클릭, 새로고침, 닫힌 슬롯·비활성 테마의 순정 contain 유지. Chromium 모의 레이아웃. |
| 채팅이 비었는데 불러오는 중 | 미리보기 없음과 조회 대기를 구분합니다. 명시적 lastMessageAt:null 또는 latestMessage:null인 빈 방은 메시지 조회 없이 빈 상태를 표시합니다. 알 수 없는 경우 기존 조회를 유지하고 빈 응답/실패 결과를 표시합니다. | 빈 방 추가 조회 0회, 알 수 없는 방의 빈 응답과 503 실패 문구 확인. 전체 초기 로딩 성능 향상을 주장하지 않습니다. |
| CONVO 다른 메시지 스트리밍 시 사용자 분할 해제 | adapter.liveBubble이 가장 가까운 메시지의 ctx/message를 기준으로 판단합니다. 사용자는 스트리밍 대상으로 보지 않고, 완료된 메시지의 false를 상위 화면 true보다 우선합니다. 분할 모듈 자체는 그대로입니다. | 이전 버전에서 기존 사용자 분할 노드 소실 재현. 수정본 PC/터치에서 사용자/완료 assistant 분할 노드 유지, 현재 assistant 완료 후 분할 확인. |
| 주변 처리 경로·기능 보존 | 관련 실행 소스 6개에만 변경. 전체 재작성, 전역 최적화, 기능 제거, 임시 비활성화 없음. | 기존 전체 기능·선톡 복귀·번역 DOM·방 생성/기존 방 진입·연속 생성·취소·native Back·지연 chooser 검사 실행. 실사용 전 조합을 검증한 것은 아님. |
| 최초 로딩/발열, TTS·Noodle·Slurp·Gacha Forge 전체 호환 | 이번 변경에서 전역 요청·캐시·로딩 정책은 유지했습니다. 외부 확장 실제 설치 조합은 확보하지 못했습니다. | 기존 TTS/번역 DOM 및 모의 라우팅 검사 통과. 실제 API·전체 외부 확장 통합·실서버 속도·발열은 미검증. |

## 실제 실행한 검사

- `game-delete-settlement.cjs`: 공식 삭제 hook 본문 + scoped MutationCache 계약 검사.
- `message-state-regressions.cjs`: 메시지별 스트리밍·분할 노드 보존, 빈 방/조회 실패 미리보기.
- `panel-environments.cjs`: 위 84개 환경 조합과 768px DesktopSlot 방어 검사. 실제 ME의 media/capacity 분기를 직접 사용합니다.
- `game-setup-environments.cjs`: 320/390/430/600/767/768/769/844/960/1024/1280/1920/2560px, 16/20px 글자, 키보드/viewport offset 총 52조건. 하단 버튼 클릭·마지막 필드 접근·가로 넘침 확인. 큰 화면에서 내용이 모두 보이면 스크롤이 불필요하므로 강제로 스크롤 발생을 요구하지 않습니다.
- `v031.cjs`: 기존 전체 기능 모의 회귀 검사.
- `v0317-compat.cjs`: 선톡/미읽음 보존·복귀·번역 DOM 소유권·원문/번역 클릭/키보드/편집.
- `start-flow.cjs`, `setup-handoff.cjs`, `lazy-launch.cjs`: 각 모드 반복 생성·기존 방 진입·native-first/theme-first 게임 Back·설정 취소·지연 chooser.
- `home-session.cjs`, `action-coherence.cjs`, `native-back-state.cjs`: A→홈·A→B 미읽음, 실패/늦은 액션, 중복 취소 방지.
- `resume-races.cjs`, `list-updates.cjs`: 복귀 요청 경합 및 기존 목록/캐시 동작 유지.
- `launch-lifecycle.cjs`, `cleanup-pop.cjs`, `adapter-session.cjs`, `module-contracts.cjs`: 장시간 설정·정리 이벤트·활성 ID 검증·모듈 초기화/정리 계약.
- `build.py --check`: 생성된 실행 파일과 실제 수정 소스 일치. ZIP의 중복 실행 파일·필수 파일·추출 후 재빌드 검증은 `PACKAGE_VERIFICATION.json` 참조.

이번 실행 결과는 development/output에 포함합니다. `*-before.log`의 실패는 이전 0.31.12 재현 증거이며, 배포본의 통과 결과와 구분했습니다. 기존 61항목 FEATURE_AUDIT의 과거 완료 선언을 새 버전 검증 근거로 대신 사용하지 않았습니다.

## 변경 파일

실행 소스: `src/engine/adapter.js`, `src/engine/launch.js`, `src/engine/query-updates.js`, `src/features/chats.js`, `src/features/previews.js`, `styles/native/foundation.css`.

그 외: 모듈 계약의 구독 정리 상태/API 명시, 생성된 JS/CSS, 버전·검수 문서·검사 파일. navigation/history/convo/notifications/data 및 설정 저장 코드는 0.31.12와 동일합니다.

## 미검증 / 배포 판단 범위

물리 Android/iPhone, Safari/WebKit, Firefox, 실제 사용자 서버 및 외부 확장 전체 조합은 미검증입니다. 최초 로딩·발열 실측을 하지 않았으며 성능 향상을 보증하지 않습니다. 검사에서 확인된 수정본 실패는 남아 있지 않지만, 공개 배포 전 실기기/실서버 확인은 여전히 필요합니다. 모의 검사 통과를 전체 정상 보증으로 표현하지 않습니다.
