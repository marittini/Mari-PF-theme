# 모듈 참조

생성: `python3 theme/tools/report-modules.py` (development 폴더 기준).

상태는 각 팩토리 인스턴스가 소유합니다. 의존성은 app.js의 레지스트리로 연결됩니다. 기존 기능 사이의 순환 참조는 유지되며, 팩토리 생성 시 다른 모듈의 기능을 실행하지 않습니다.

| 모듈 | 소스 | 의존 모듈 |
| --- | --- | --- |
| ui | `src/ui/shell.js` | core, gestures, nativeUi, navigation, settings |
| theme | `src/ui/theme.js` | design, navigation, ui |
| data | `src/core/data.js` | catalog, core, navigation, tags, ui |
| core | `src/core/runtime.js` | avatars, convo, data, design, previews, tags, translations, ui, updates |
| navigation | `src/engine/navigation.js` | adapter, avatars, catalog, chats, convo, core, data, extensions, gestures, help, history, hub, nativeUi, notifications, ui |
| history | `src/engine/history.js` | catalog, core, gestures, navigation, ui |
| avatars | `src/features/avatars.js` | adapter, core, navigation, ui |
| catalog | `src/features/catalog.js` | avatars, core, daily, data, design, extensions, history, markdown, navigation, ui |
| chats | `src/features/chats.js` | avatars, core, data, navigation, notifications, previews, ui, updates |
| design | `src/features/design.js` | adapter, core, navigation, theme, ui |
| adapter | `src/engine/adapter.js` | avatars |
| notifications | `src/features/notifications.js` | adapter, avatars, chats, core, data, navigation, ui, updates |
| hub | `src/ui/hub.js` | catalog, design, extensions, navigation, ui |
| extensions | `src/engine/extensions.js` | adapter, core, data, history, navigation, theme, ui |
| mounts | `src/engine/mounts.js` | avatars, chats, convo, core, navigation, notifications, ui, updates |
| markdown | `src/ui/markdown.js` | ui |
| gestures | `src/ui/gestures.js` | adapter, catalog, chats, core, data, history, navigation, ui |
| previews | `src/features/previews.js` | chats, core, data, ui |
| daily | `src/features/daily.js` | data |
| updates | `src/engine/query-updates.js` | adapter, avatars, chats, core, data, navigation, notifications, previews, ui |
| translations | `src/features/translations.js` | core, navigation, ui |
| convo | `src/features/convo.js` | adapter, core, translations, ui |
| writing | `src/features/writing.js` | core, ui |
| nativeUi | `src/features/native-ui.js` | core, navigation, settings, ui |
| tags | `src/features/tags.js` | core, data, ui, updates |
| settings | `src/features/settings.js` | nativeUi, ui |
| bootstrap | `src/core/bootstrap.js` | chats, history, mounts, navigation, notifications |
| lifecycle | `src/core/lifecycle.js` | 없음 |
| help | `src/features/help.js` | markdown, navigation, ui |

## ui

팩토리: `createUi`

공개 함수: `button`, `icon`, `notice`, `resumeMedia`, `own`, `native`, `error`

소유 상태: `root`, `shadow`, `css`, `body`, `html`, `paths`, `el`, `header`, `brand`, `logo`, `headerAgents`, `brandGroup`, `refreshButton`, `main`, `status`, `nav`, `tabs`, `pausedMedia`, `visible`, `navSizeObserver`

다른 모듈 상태 쓰기: `navigation.nativeGrace`, `navigation.returnView`

## theme

팩토리: `createTheme`

공개 함수: `isolate`, `syncTheme`

소유 상태: `themes`, `themeObserver`, `accentPaint`, `themePaintSignature`, `previousAccent`, `previousBanner`, `themeStateObserver`

다른 모듈 상태 쓰기: 없음

## data

팩토리: `createData`

공개 함수: `resourceFetchWrapper`, `compact`, `get`, `jsonRequest`

소유 상태: `cache`, `viewRequests`, `request`, `refreshWriteQueued`, `resourceFetch`

다른 모듈 상태 쓰기: 없음

## core

팩토리: `createCore`

공개 함수: `later`, `stop`, `bindLater`

소유 상태: `timers`, `disposed`, `epoch`, `bootstrapTimers`

다른 모듈 상태 쓰기: `avatars.cropTimer`, `convo.splitConnected`, `convo.splitTask`, `data.request`, `translations.translationConnected`

## navigation

팩토리: `createNavigation`

공개 함수: `waitEngine`, `beginRoute`, `finishRoute`, `routeFailure`, `actionsReady`, `clearLayers`, `openNative`, `bridge`, `engineHome`, `settings`, `go`, `onModeClick`

소유 상태: `engineHomeIntent`, `agentActive`, `bridgeBusy`, `view`, `returnView`, `nativeGrace`, `nativeOrigin`, `restoreScrollTarget`, `navController`, `routeIntent`, `roomId`, `expectedEnginePops`, `expectedEnginePopUntil`, `engineOverlayOwned`

다른 모듈 상태 쓰기: `avatars.nativeCharacterIds`, `chats.chatMode`, `extensions.installedMetaAt`, `history.exitUntil`, `history.nativeBackArmed`

## history

팩토리: `createHistory`

공개 함수: `armNativeBack`, `remember`, `onBack`, `onNativeHome`, `installBackWatcher`

소유 상태: `nativeBackArmed`, `historyOwned`, `historyToken`, `closeWatcher`, `exitUntil`, `exitTimer`

다른 모듈 상태 쓰기: `navigation.engineOverlayOwned`, `navigation.expectedEnginePopUntil`, `navigation.expectedEnginePops`

## avatars

팩토리: `createAvatars`

공개 함수: `observeImages`, `cropStyle`, `avatar`, `scheduleCrops`, `imageKey`, `applyNativeCrops`, `refreshNativeCrops`, `onImageLoad`

소유 상태: `nativeCharacterIds`, `imageObserver`, `cropTimer`, `cropRequest`, `cropOriginals`, `nativeCrops`

다른 모듈 상태 쓰기: `navigation.restoreScrollTarget`

## catalog

팩토리: `createCatalog`

공개 함수: `card`, `section`, `dailySection`, `officialBannerLogo`, `homeChrome`, `loadHome`, `detail`, `personaGallery`

소유 상태: `searchTimer`, `pageOffset`, `query`, `filter`, `detailCard`, `personaOffset`, `personaSearch`

다른 모듈 상태 쓰기: `navigation.view`

## chats

팩토리: `createChats`

공개 함수: `rememberChatVisit`, `normalizedChat`, `ingestChats`, `orderedChats`, `hydrateSavedUnread`, `chats`, `chatFolders`

소유 상태: `chatMode`, `chatsAll`, `chatRegistry`, `chatVisits`, `folderFilter`, `folderRows`, `roomRows`

다른 모듈 상태 쓰기: `notifications.unreadHydration`

## design

팩토리: `createDesign`

공개 함수: `applyChatTypography`, `pickerColor`, `setMainColor`, `liveColorPreview`, `clearColorPreview`, `colorPicker`, `saveDesignPreferences`, `themePreferences`

소유 상태: `showHomeBanner`, `homeView`, `personaView`, `chatLetterSpacing`, `chatLineHeight`, `roleplayPadding`, `translationReduction`, `previousLetterSpacing`, `previousLineHeight`, `previousRpPadding`, `previousTranslationReduction`, `previewAccent`, `previewFrame`

다른 모듈 상태 쓰기: `navigation.bridgeBusy`, `navigation.routeIntent`, `theme.themePaintSignature`

## adapter

팩토리: `createAdapter`

공개 함수: `nativeTarget`, `engineActions`, `surfaceHasChatId`, `prepareChat`, `personaCropForImage`, `engineNavigator`, `eachHook`, `liveBubble`

소유 상태: `actionNames`

다른 모듈 상태 쓰기: 없음

## notifications

팩토리: `createNotifications`

공개 함수: `notificationSnapshot`, `nativeNotificationAction`, `notificationCopy`, `saveUnreadLedger`, `chatUnreadMetadata`, `acknowledgeUnread`, `persistedUnread`, `unreadSnapshot`, `syncUnreadBadges`, `toastLifetime`, `toastKey`, `dismissToast`, `bindToastSwipe`, `scheduleNotifications`, `syncNotifications`, `refreshUnreadSources`

소유 상태: `unreadHydration`, `notificationObserver`, `notificationRail`, `notificationGetter`, `notificationSignature`, `alertTray`, `unreadGetter`, `retainedUnread`, `readUnreadVersions`, `readLiveCounts`, `unreadStorageSignature`, `dismissedToasts`, `toastClocks`, `notificationsQueued`

다른 모듈 상태 쓰기: 없음

## hub

팩토리: `createHub`

공개 함수: `menu`, `hub`, `designScreen`

소유 상태: 없음

다른 모듈 상태 쓰기: 없음

## extensions

팩토리: `createExtensions`

공개 함수: `agentShortcuts`, `retryNative`, `setEngineTheme`, `openAgent`, `runExtension`, `extensionShortcuts`, `homeAgents`

소유 상태: `installedMeta`, `installedMetaAt`, `installedMetaPending`, `agentRender`

다른 모듈 상태 쓰기: `navigation.agentActive`, `navigation.bridgeBusy`, `navigation.navController`, `navigation.routeIntent`

## mounts

팩토리: `createMounts`

공개 함수: `checkEngineHome`, `bindShell`, `visibility`, `resumeActivity`

소유 상태: `shellObserver`, `centerObserver`, `notificationMountObserver`, `resumeTimer`, `resumeAt`

다른 모듈 상태 쓰기: `navigation.routeIntent`

## markdown

팩토리: `createMarkdown`

공개 함수: `renderMarkdown`

소유 상태: 없음

다른 모듈 상태 쓰기: 없음

## gestures

팩토리: `createGestures`

공개 함수: `refreshCurrentView`, `returnFromNative`, `onSwipeStart`, `onSwipeCancel`, `onSwipeEnd`

소유 상태: `swipe`, `phone`

다른 모듈 상태 쓰기: `chats.chatMode`, `chats.chatsAll`, `chats.folderFilter`, `navigation.agentActive`, `navigation.bridgeBusy`, `navigation.nativeOrigin`, `navigation.restoreScrollTarget`, `navigation.routeIntent`

## previews

팩토리: `createPreviews`

공개 함수: `fillPreviews`

소유 상태: `previewCache`, `previewRequests`, `previewObserver`, `previewGeneration`

다른 모듈 상태 쓰기: 없음

## daily

팩토리: `createDaily`

공개 함수: `localDay`, `dailyRank`, `characterOfDay`

소유 상태: 없음

다른 모듈 상태 쓰기: 없음

## updates

팩토리: `createUpdates`

공개 함수: `invalidateChats`, `queueChatRefresh`, `refreshChatRows`, `bindQueryUpdates`

소유 상태: `queryCache`, `queryUnsubscribe`, `chatRefreshTimer`, `chatRefreshRequest`, `chatRevision`, `chatRefreshBurst`

다른 모듈 상태 쓰기: `navigation.restoreScrollTarget`

## translations

팩토리: `createTranslations`

공개 함수: `restoreTranslationSizes`, `sizeTranslation`, `bindTranslationSizes`

소유 상태: `translationRoots`, `translationObserver`, `translationConnected`, `translationSizes`

다른 모듈 상태 쓰기: 없음

## convo

팩토리: `createConvo`

공개 함수: `resetSplit`, `displayedBubble`, `renderedLineFragments`, `makeSplit`, `syncSplits`, `bindSplits`

소유 상태: `splitObserver`, `splitRoot`, `splitTask`, `splitConnected`, `splitFull`, `splitDirty`, `splitSources`, `presentationOwners`

다른 모듈 상태 쓰기: 없음

## writing

팩토리: `createWriting`

공개 함수: `writingShell`, `onWritingStart`, `onWritingExit`, `onWritingOutside`, `onWritingEscape`

소유 상태: `writingDesktop`

다른 모듈 상태 쓰기: 없음

## nativeUi

팩토리: `createNativeUi`

공개 함수: `enhanceNativeUi`, `bindNativeUi`

소유 상태: `nativeUiObserver`, `nativeUiRoots`, `nativeUiQueued`, `duplicateTagNodes`, `nativeUiAdditions`

다른 모듈 상태 쓰기: 없음

## tags

팩토리: `createTags`

공개 함수: `collectExistingTags`, `existingTags`, `closeTagMenu`, `drawTagMenu`, `chooseTag`, `onTagFocus`, `onTagInput`, `onTagKey`, `onTagOutside`, `onTagBlur`

소유 상태: `tagInputLists`, `tagOptionCache`, `tagOptionsPending`, `tagFetchControllers`, `activeTagMenu`, `tagMenuSequence`

다른 모듈 상태 쓰기: 없음

## settings

팩토리: `createSettings`

공개 함수: `setSettingsFold`, `restoreSettingsFolds`, `revealSettings`, `resetSettingsFolds`, `onSettingsSearch`, `onSettingsSearchClick`, `enhanceSettingsFolds`

소유 상태: `settingsFolds`, `settingsRevealUntil`, `settingsSearchTarget`

다른 모듈 상태 쓰기: 없음

## bootstrap

팩토리: `createBootstrap`

공개 함수: 없음

소유 상태: 없음

다른 모듈 상태 쓰기: 없음

## lifecycle

팩토리: `createLifecycle`

공개 함수: `configure`, `start`, `dispose`

소유 상태: `started`, `disposed`, `initialization`, `teardown`

다른 모듈 상태 쓰기: 없음

## help

팩토리: `createHelp`

공개 함수: `show`

소유 상태: 없음

다른 모듈 상태 쓰기: 없음
