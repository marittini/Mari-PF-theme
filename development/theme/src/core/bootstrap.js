/** bootstrap: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createBootstrap(deps) {
  const mftModuleState = {

  };

  

  const initialize = [
    { order: 27600, run() {
      deps.navigation.go('home', true);
    } },
    { order: 27700, run() {
      deps.mounts.bindShell();
    } },
    { order: 27800, run() {
      deps.notifications.syncNotifications();
    } },
    { order: 27900, run() {
      deps.history.installBackWatcher();
    } },
    { order: 28000, run() {
      deps.chats.hydrateSavedUnread(true);
    } }
  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup };
}
