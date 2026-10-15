# 0.34 · 순정 관리 도구 숨김 / 홈 봇카드 다운로드 / 전체 접기·펼치기 제거

기준은 전달한 0.33 ZIP입니다. 수정 전 JS/CSS/manifest 일치를 확인했고 0.33 ZIP을 복구점으로 보존했습니다. ME 본체는 수정하지 않았습니다.

## 요청과 변경

| 요청 | 구현 범위 | 실행 검증 |
| --- | --- | --- |
| 순정 UI의 검색·정렬 숨김 | 사용자 추가 답변 ‘프리셋, 로어북, 캐릭터 등 마리나라 기본 UI창’을 기준으로 캐릭터·페르소나·로어북·프리셋·연결·에이전트 패널과 순정 채팅 목록의 공통 Search + Sort 행을 CSS로 숨겼습니다. 순정 input/select의 직접 자식 구조와 mari-chrome-sort-field를 사용합니다. 편집기 본문 필드·테마 홈 검색·온라인 봇카드 검색·설정 검색은 제외합니다. 검색/정렬 저장값을 강제로 초기화하지 않습니다. | PC/터치에서 6개 자원 패널+순정 채팅 목록 숨김. 기존 편집 필드 값·버튼 클릭 유지. 테마 비활성 시 원래 CSS 표시 복구. |
| 홈에서 온라인 봇카드 다운로드 접근 | 홈 검색창 아래에 ‘봇카드 다운로드’ 버튼을 추가했습니다. 순정 openBotBrowser 액션을 호출합니다. 첫 진입 때 액션이 아직 노출되지 않았으면 캐릭터 패널을 통해 읽은 뒤 닫고 다운로드 화면으로 연결합니다. | PC/터치에서 첫 액션 지연·반복 진입·닫힌 DOM 재사용 및 class 변경만 있는 재열기 확인. 순정 닫기와 브라우저 Back 모두 홈 복귀. 순정 가져오기 핸들러와 온라인 검색 접근 확인. 외부 사이트의 실제 다운로드는 실행하지 않았습니다. |
| 설정 모두 접기·펼치기 버튼 제거 | settings.js의 전체 버튼 생성 블록을 제거했습니다. CSS로 잠깐 가리는 방식이 아닙니다. 개별 섹션의 접기/펼치기는 그대로입니다. | 설정 섹션 3회 교체/재마운트 × PC/터치에서 전체 버튼 0개, 개별 토글과 원래 필드/버튼 동작 확인. |

## 봇카드 처리 경로

순정 ui.store.openBotBrowser, CharactersPanel 다운로드 버튼, AppShell의 MountOnceWhenOpened 및 BotBrowserView의 직접 헤더 닫기 버튼을 소스로 확인했습니다. 별도 다운로드 API를 만들거나 외부 사이트를 직접 스크래핑하지 않았습니다.

라우트는 자체 AbortSignal과 기존 engineHome/clearLayers를 사용합니다. 방 해제 후 순정 화면을 열고 열린 BotBrowserView를 확인해 native 화면으로 전환합니다. 닫힌 retained 화면은 pointer-events-none 부모로 제외하며, 그 화면을 재열 때 필요한 class 변경 감시는 이 대기 동안에만 추가합니다. 기존 waitEngine 호출의 감시 범위는 유지합니다. 순정 닫기는 원래 동작 후 기존 테마 복귀 경로를 사용합니다.

## 검사와 한계

- `v034-ui.cjs`: 실제 빌드된 확장과 모의 native/HTTP로 위 세 요청을 검사. 홈 버튼은 320/390/767/768/1024/1920px에서 클릭 영역을 확인했습니다. 모바일 fixture에 viewport meta를 넣고 실제 innerWidth가 지정한 너비인지 확인했습니다. 순정 retained view의 pointer-events/opacity도 fixture에 반영했습니다.
- 같은 검사에서 순정 관리 도구만 숨고 온라인/홈/설정 검색과 원래 편집 필드가 남는지 확인했습니다. 봇카드 화면은 환경별 3회, 총 6회 진입·복귀 및 native 가져오기 핸들러를 확인했습니다.
- `v031.cjs`: 기존 전체 기능 검사. 요청에 따라 사라진 전체 접기/펼치기를 호출하던 검사만 개별 섹션 토글 검사와 전체 버튼 부재 검사로 변경했습니다. 원래 설정 값/버튼/검색 후 섹션 펼침 검사는 유지했습니다.
- `v0317-compat.cjs`: 선톡·미읽음·번역 DOM 호환.
- `v032-roundtrip.cjs`: 3모드 전체/최근 미리보기 및 PC/터치 12회 왕복.
- `v033-ui.cjs`: 앞 버전의 폴더 관리 모드·로컬 모델 카드 숨김·오늘의 캐릭터 여백 유지.
- `v03114-regressions.cjs`: 미리보기 경합·미읽음·지연 설정창 유지.
- `action-coherence.cjs`, `cleanup-pop.cjs`, `module-contracts.cjs`, `build.py --check`: 취소·오래된 액션·native 정리 Back·모듈 계약·생성 파일 일치.
- 최종 ZIP 구성·소스 일치·압축 무결성·추출 재빌드는 PACKAGE_VERIFICATION.json에 기록합니다.

외부 카드 서비스의 실제 검색/로그인/다운로드·가져오기는 호출하지 않았습니다. 해당 기능은 순정 화면과 핸들러에 연결했으며 실제 서비스 통합 검증으로 간주하지 않습니다. 실제 React 엔진 전체·사용자 서버·물리 Android/iPhone·Safari/WebKit·Firefox·외부 확장 전체 조합도 미검증입니다.

## 변경 통제

실행 소스 6개만 변경했습니다: `engine/adapter.js`, `engine/navigation.js`, `features/catalog.js`, `features/settings.js`, `styles/native/resources.css`, `styles/shadow/catalog.css`.

그 외 미리보기·선톡·게임 생성/취소·TTS/번역·설정 저장 코드는 0.33 그대로입니다. 추가로 모듈 계약에는 새 내비게이션 API를 명시하고 버전·검수 문서·검사를 갱신했습니다. 버전은 0.34, 다음은 0.35입니다.
