// Public, anonymous APIs work directly from static hosts such as GitHub Pages.
export async function fetchJSON(url, signal, fetcher = fetch) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('辞書への接続がタイムアウトしました。もう一度お試しください。', 'TimeoutError')), 16000);
  try {
    const response = await fetcher(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('辞書サービスが応答しませんでした。時間をおいて再検索してください。');
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function wikiApiURL(word, lang) {
  if (!['en', 'ja'].includes(lang) || !/^[\p{L}\p{M} -]{1,80}$/u.test(word)) throw new Error('スペイン語の単語を入力してください。');
  const query = new URLSearchParams({ action: 'parse', page: word, prop: 'text', format: 'json', redirects: '1', disableeditsection: '1', origin: '*' });
  return `https://${lang}.wiktionary.org/w/api.php?${query}`;
}

export async function translateEnglish(text, signal, fetcher = fetch) {
  // MyMemory accepts at most 500 UTF-8 bytes per request.
  let excerpt = [...text].slice(0, 350).join('');
  while (new TextEncoder().encode(excerpt).length > 470) excerpt = [...excerpt].slice(0, -1).join('');
  if (!excerpt.trim()) throw new Error('翻訳する説明がありません。');
  const data = await fetchJSON(`https://api.mymemory.translated.net/get?${new URLSearchParams({ q: excerpt, langpair: 'en|ja' })}`, signal, fetcher);
  if (Number(data.responseStatus) !== 200 || data.quotaFinished) throw new Error('無料翻訳の利用上限、または一時的なエラーです。英語の説明をご利用ください。');
  const translated = data.responseData?.translatedText;
  if (typeof translated !== 'string' || !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(translated)) throw new Error('日本語の表記を取得できませんでした。英語の説明と出典をご確認ください。');
  return translated;
}
