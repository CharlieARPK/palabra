import { getWiki, grammarJapanese } from './wiki.js';
import { lookupLocal } from './dictionary.js';
import { translateEnglish } from './api.js';

const CACHE_KEY = 'palabra.results.v1';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const settled = promise => promise.then(value => ({ value }), error => ({ error }));

export function createOnlineLookup({ wiki = getWiki, local = lookupLocal, translate = translateEnglish, storage, now = Date.now } = {}) {
  const resultsCache = new Map();
  const wikiCache = new Map();
  try {
    const records = JSON.parse(storage?.getItem(CACHE_KEY) || '[]');
    if (Array.isArray(records)) for (const record of records.slice(-50)) {
      if (record && typeof record.word === 'string' && Number.isFinite(record.time) && now() - record.time < MAX_AGE && Array.isArray(record.entries) && record.entries.length && record.entries.every(e => e && ['lemma', 'pos', 'form', 'en', 'ja'].every(key => typeof e[key] === 'string'))) resultsCache.set(record.word, record);
    }
  } catch {}

  function save(word, entries) {
    resultsCache.delete(word);
    resultsCache.set(word, { word, time: now(), entries });
    while (resultsCache.size > 50) resultsCache.delete(resultsCache.keys().next().value);
    try {
      let records = [...resultsCache.values()];
      while (JSON.stringify(records).length > 750000 && records.length > 1) records.shift();
      storage?.setItem(CACHE_KEY, JSON.stringify(records));
    } catch { /* A full or disabled localStorage must not prevent searching. */ }
  }

  return async function lookup(word, signal, onProgress = () => {}, { refresh = false } = {}) {
    signal.throwIfAborted();
    const cached = resultsCache.get(word);
    if (!refresh && cached && now() - cached.time < MAX_AGE) return { entries: cached.entries, jaFailed: false };
    const pending = new Map();
    const translations = new Map();
    function read(term, lang) {
      const key = `${lang}:${term}`;
      const cached = wikiCache.get(key);
      if (!refresh && cached && now() - cached.time < MAX_AGE) return Promise.resolve(cached.entries);
      if (!pending.has(key)) pending.set(key, wiki(term, lang, signal).then(entries => {
        signal.throwIfAborted();
        wikiCache.delete(key);
        if (wikiCache.size >= 100) wikiCache.delete(wikiCache.keys().next().value);
        wikiCache.set(key, { time: now(), entries });
        return entries;
      }));
      return pending.get(key);
    }
    const japanese = settled(read(word, 'ja'));
    const originals = await read(word, 'en');
    signal.throwIfAborted();
    const jobs = originals.slice(0, 6).flatMap(original => (original.lemmas.length ? original.lemmas : [word]).slice(0, 3).map(lemma => ({ original, lemma })));
    const entries = new Array(jobs.length);
    let next = 0, jaFailed = false;
    const publish = () => { signal.throwIfAborted(); onProgress(entries.filter(Boolean).map(entry => ({ ...entry }))); };
    async function worker() {
      while (next < jobs.length) {
        const index = next++;
        const { original, lemma } = jobs[index];
        signal.throwIfAborted();
        const known = lemma !== word ? local(lemma).find(e => e.pos === original.pos || e.pos.includes(original.pos)) : null;
        const jaRequest = lemma === word ? japanese : known?.ja ? Promise.resolve({ value: [] }) : settled(read(lemma, 'ja'));
        let en = known?.en || original.definitions.slice(0, 2).join('; ');
        if (lemma !== word && !known) {
          const root = await settled(read(lemma, 'en'));
          const matching = root.value?.find(e => e.pos === original.pos);
          if (matching) en = matching.definitions.slice(0, 2).join('; ');
        }
        signal.throwIfAborted();
        const entry = { ...original, lemma, en, ja: known?.ja || '', pending: !known?.ja, form: lemma !== word ? '活用形・変化形' : '辞書の見出し', note: lemma !== word ? grammarJapanese(original.definitions.filter(d => d.includes(lemma)).join('／') || original.definitions.join('／')) : '', example: known?.example };
        entries[index] = entry;
        publish();
        if (!entry.ja) {
          const jaResult = await jaRequest;
          signal.throwIfAborted();
          jaFailed ||= Boolean(jaResult.error);
          entry.ja = jaResult.value?.find(e => e.pos === original.pos)?.definitions.slice(0, 2).join('／') || '';
          if (!entry.ja) {
            try {
              if (!translations.has(en)) translations.set(en, translate(en, signal));
              entry.ja = await translations.get(en);
              entry.machine = true;
            } catch (error) {
              signal.throwIfAborted();
              entry.translationError = error.message || '日本語の参考翻訳を取得できませんでした。';
            }
          }
        }
        entry.pending = false;
        publish();
      }
    }
    // Bound simultaneous lookups while avoiding a long serial chain of senses.
    await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, worker));
    signal.throwIfAborted();
    if (entries.length && !jaFailed && entries.every(entry => !entry.translationError)) save(word, entries);
    return { entries, jaFailed };
  };
}

