> 0.31.12의 과거 기록입니다. 1024px 분기 가정은 0.31.13에서 폐기했습니다. 최신 판정은 RELEASE_AUDIT_0.31.13.md 및 panel-environments.cjs 참조.

# 데스크톱 오른쪽 패널 잘림 · 0.31.12

제보: 1920px 전체화면에서 마이페이지의 순정 메뉴/추가 확장 패널이 비거나 순정 홈처럼 보이며, 부모 RightPanelDesktopSlot의 contain을 none으로 바꾸면 표시됨.

순정 AppShell의 데스크톱 오른쪽 패널은 좁은 RightPanelDesktopSlot 안에 들어갑니다. globals.css의 mari-shell-panel-slot은 contain:layout paint를 사용합니다. 테마가 자식 RightPanelDesktop을 fixed로 화면 전체에 펼칠 때, 부모의 containment가 그 위치의 기준과 페인트 영역을 좁은 슬롯에 묶습니다. 이전 모의 검사는 이 부모 구조/규칙이 없어 잘림을 놓쳤습니다.

변경은 기존 foundation-042 미디어 규칙 안의 선언 하나입니다.

```css
@media (min-width:1024px) {
  html.mft-enabled [data-component="RightPanelDesktopSlot"][aria-hidden="false"] {
    contain: none !important;
  }
}
```

열린 데스크톱 슬롯에만 적용합니다. 모바일, 닫힌 슬롯과 확장 비활성 상태의 순정 containment는 유지합니다. JavaScript와 생성/취소·선톡·번역 동작은 변경하지 않습니다. 다른 요소의 containment를 일괄 해제하지 않습니다.

검사: desktop-panel-containment.cjs가 순정 globals.css의 슬롯/모션 규칙을 발췌한 tests/native-panel-css.css를 읽고 같은 부모-자식 구조를 구성합니다. 이전 배포 CSS에서는 1920px에서 패널의 x가 1628px로 밀려 실패하고, 수정 CSS에서는 기대 위치 92px를 확인합니다. 390/959/960/961/1023/1024/1280/1920/2560px 크기 왕복과 새로고침, 설정·연결·추가 확장 패널 구조의 첫/마지막 버튼 클릭, 닫힌 슬롯·테마 비활성 상태를 검사합니다.

이것은 순정 구조를 반영한 Chromium DOM/레이아웃 검사입니다. 실제 React 엔진 전체, 사용자 서버, 개별 외부 확장의 모든 기능을 실행한 통합 검증은 아닙니다.
