/** daily: module-owned state and explicit application dependencies.
 * @param {import('../contracts.js').Modules} deps
 */
export function createDaily(deps) {
  const mftModuleState = {

  };

  // Same compact catalog route as the official home widget; select one stable daily ID.
  function localDay() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  
  function dailyRank(day, id) {
    let hash = 2166136261;
    for (const ch of day + ':' + id) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
    return hash >>> 0;
  }
  
  async function characterOfDay(ticket) {
    const day = localDay();
    let previous;
    try {
      previous = JSON.parse(localStorage.getItem('mft-daily-character') || 'null');
    } catch {}
    if (previous?.day === day && previous.card) return previous.card;
    let chosen = null,
      alternate = null,
      rank = Infinity,
      otherRank = Infinity,
      offset = 0,
      generation;
    for (let attempt = 0; attempt < 3; attempt++) {
      chosen = alternate = null;
      rank = otherRank = Infinity;
      offset = 0;
      generation = undefined;
      while (true) {
        const page = await deps.data.get('/characters/catalog?' + new URLSearchParams({
          limit: '100',
          offset: String(offset)
        }), ticket);
        generation ??= page.catalogGeneration;
        if (page.catalogGeneration !== generation) break;
        for (const r of page.items || []) {
          if (!String(r.name || '').trim()) continue;
          const value = dailyRank(day, String(r.id));
          if (value < rank || value === rank && String(r.id) < chosen?.id) {
            rank = value;
            chosen = deps.data.compact(r);
          }
          if (r.id !== previous?.card?.id && (value < otherRank || value === otherRank && String(r.id) < alternate?.id)) {
            otherRank = value;
            alternate = deps.data.compact(r);
          }
        }
        if (!page.hasMore) {
          const pick = alternate || chosen;
          try {
            if (pick) localStorage.setItem('mft-daily-character', JSON.stringify({
              day,
              card: pick
            }));
          } catch {}
          return pick;
        }
        const advance = Number(page.limit) || Number(page.items?.length) || 0;
        if (!advance) throw Error('캐릭터 목록을 불러오지 못했어요.');
        offset += advance;
      }
    }
    throw Error('라이브러리가 변경됐어요. 다시 시도해 주세요.');
  }
  // Existing engine navigation callback provides an ID route when a named action is not selected in a hook.

  const initialize = [

  ];
  const cleanup = [

  ];
  return { state: mftModuleState, initialize, cleanup, localDay, dailyRank, characterOfDay };
}
