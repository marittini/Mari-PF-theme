/**
 * Application modules. Internal React/DOM dependencies are concentrated in engine/.
 * @typedef {Object} Modules
 * @property {ReturnType<typeof import('./engine/launch.js').createLaunch>} launch
 * @property {ReturnType<typeof import('./features/help.js').createHelp>} help
 * @property {ReturnType<typeof import('./core/lifecycle.js').createLifecycle>} lifecycle
 * @property {ReturnType<typeof import('./ui/shell.js').createUi>} ui
 * @property {ReturnType<typeof import('./ui/theme.js').createTheme>} theme
 * @property {ReturnType<typeof import('./core/data.js').createData>} data
 * @property {ReturnType<typeof import('./core/runtime.js').createCore>} core
 * @property {ReturnType<typeof import('./engine/navigation.js').createNavigation>} navigation
 * @property {ReturnType<typeof import('./engine/history.js').createHistory>} history
 * @property {ReturnType<typeof import('./features/avatars.js').createAvatars>} avatars
 * @property {ReturnType<typeof import('./features/catalog.js').createCatalog>} catalog
 * @property {ReturnType<typeof import('./features/chats.js').createChats>} chats
 * @property {ReturnType<typeof import('./features/design.js').createDesign>} design
 * @property {ReturnType<typeof import('./engine/adapter.js').createAdapter>} adapter
 * @property {ReturnType<typeof import('./features/notifications.js').createNotifications>} notifications
 * @property {ReturnType<typeof import('./ui/hub.js').createHub>} hub
 * @property {ReturnType<typeof import('./engine/extensions.js').createExtensions>} extensions
 * @property {ReturnType<typeof import('./engine/mounts.js').createMounts>} mounts
 * @property {ReturnType<typeof import('./ui/markdown.js').createMarkdown>} markdown
 * @property {ReturnType<typeof import('./ui/gestures.js').createGestures>} gestures
 * @property {ReturnType<typeof import('./features/previews.js').createPreviews>} previews
 * @property {ReturnType<typeof import('./features/daily.js').createDaily>} daily
 * @property {ReturnType<typeof import('./engine/query-updates.js').createUpdates>} updates
 * @property {ReturnType<typeof import('./features/translations.js').createTranslations>} translations
 * @property {ReturnType<typeof import('./features/convo.js').createConvo>} convo
 * @property {ReturnType<typeof import('./features/writing.js').createWriting>} writing
 * @property {ReturnType<typeof import('./features/native-ui.js').createNativeUi>} nativeUi
 * @property {ReturnType<typeof import('./features/tags.js').createTags>} tags
 * @property {ReturnType<typeof import('./features/settings.js').createSettings>} settings
 * @property {ReturnType<typeof import('./core/bootstrap.js').createBootstrap>} bootstrap
 */
export {};
