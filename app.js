import { lookupLocal, normalize } from './dictionary.js';
import { createOnlineLookup } from './lookup.js';
import { selectSpanishVoice } from './speech.js';


const $=selector=>document.querySelector(selector);
const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const soundIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></svg>';
const speakButton=text=>`<button class="speak" data-speak="${esc(text)}" aria-label="${esc(text)} を発音" title="スペイン語で発音">${soundIcon}</button>`;
const wikiURL=(word,lang='en')=>`https://${lang}.wiktionary.org/wiki/${encodeURIComponent(word)}#${lang==='en'?'Spanish':'スペイン語'}`;
let saved=[];
try { const data=JSON.parse(localStorage.getItem('palabra.saved.v1') || '[]'); saved=Array.isArray(data)?data.filter(x=>x && typeof x.word==='string' && typeof x.ja==='string').slice(0,100):[]; } catch {}
let currentWord='he', currentEntries=[], requestId=0, controller;
function status(text,error=false){$('#status').textContent=text;$('#status').classList.toggle('error',error);}
function renderSaved(){
  $('#saved-count').textContent=saved.length;
  $('#saved-list').innerHTML=saved.length?saved.map(item=>`<div class="saved-item"><button class="saved-word" data-word="${esc(item.word)}">${esc(item.word)}<small>${esc(item.ja.slice(0,38))}</small></button>${speakButton(item.word)}<button class="remove" data-remove="${esc(item.word)}" aria-label="${esc(item.word)} を単語帳から削除">×</button></div>`).join(''):'<div class="empty-saved">未保存</div>';
  document.querySelectorAll('.save').forEach(button=>{const yes=saved.some(s=>s.word===currentWord);button.textContent=yes?'✓ 保存済み':'＋ 保存';button.classList.toggle('active',yes);button.setAttribute('aria-pressed',yes);});
}
function persist(){try{localStorage.setItem('palabra.saved.v1',JSON.stringify(saved));}catch{status('このブラウザには保存できませんでした。単語帳は画面を閉じるまで保持します。',true);}renderSaved();}
function render(entries,word){
  currentWord=word;currentEntries=entries;
  $('#results').innerHTML=entries.map((entry,index)=>{
    const online=entry.source==='wiki';
    const isVerb=entry.pos.includes('動詞') || entry.form.includes('分詞');
    const badges=[`<span class="badge">${esc(entry.pos)}</span>`,entry.gender?`<span class="badge blue">${esc(entry.gender)}${entry.pos==='名詞'?'名詞':''}</span>`:'',`<span class="badge tan">${esc(entry.form || '基本形')}</span>`].join('');
    const details=[['人称',entry.person],['冠詞',entry.article],['複数形',entry.plural]].filter(([,v])=>v && v!=='—');
    return `<article class="result-card"><div class="result-top"><div class="result-meta"><span>${entries.length>1?`${index+1} / ${entries.length}`:''}</span><button class="save" aria-pressed="false">＋ 保存</button></div><div class="word-line"><h2 lang="es">${esc(word)}</h2>${speakButton(word)}</div><div class="badges">${badges}</div><div class="meanings"><div><span class="lang-label">ENGLISH${isVerb && word!==entry.lemma?' · 原形の意味':''}</span><p class="meaning english" lang="en">${esc(entry.en)}</p></div><div><span class="lang-label">日本語${isVerb && word!==entry.lemma?' · 原形の意味':''}</span><p class="meaning">${esc(entry.ja || (entry.pending?'日本語を取得中…':'日本語の項目が見つかりませんでした。'))}</p>${entry.machine?'<div class="translation-note">MyMemory による参考翻訳</div>':''}${entry.translationError?`<div class="translation-note">${esc(entry.translationError)}</div>`:''}</div></div></div><div class="grammar-section"><div class="lemma-box"><span class="lemma-from" lang="es">${esc(word)}</span><span class="lemma-arrow">→</span><div><span class="lemma-caption">${isVerb?'原形':'基本形'}</span><button class="lemma-word" data-word="${esc(entry.lemma)}" lang="es">${esc(entry.lemma)}</button></div>${speakButton(entry.lemma)}</div>${details.length?`<div class="grammar-details">${details.map(([label,value])=>`<div><p class="detail-label">${label}</p><p class="detail-value">${esc(value)}</p></div>`).join('')}</div>`:''}${entry.note?`<p class="explanation">${esc(entry.note)}</p>`:''}${entry.conjugations?`<details class="conjugation"><summary>${esc(entry.tableLabel)}の活用を見る</summary><table aria-label="${esc(entry.lemma)}の活用"><tbody>${entry.conjugations.filter(row=>$('#dialect').value==='es-ES' || !row.person.startsWith('vosotros')).map(row=>`<tr${row.word===word?' class="current"':''}><td lang="es">${esc(row.person)}</td><td lang="es">${esc(row.word)}</td><td>${speakButton(row.word)}</td></tr>`).join('')}</tbody></table></details>`:''}</div>${entry.example?`<div class="example-box"><div class="example-heading">例文</div><p class="example-es" lang="es"><span>${esc(entry.example.es)}</span>${speakButton(entry.example.es)}</p><p class="example-en" lang="en">${esc(entry.example.en)}</p><p class="example-ja">${esc(entry.example.ja)}</p></div>`:''}<div class="source"><span>${online?'Wiktionary · 編集済 · CC BY-SA 4.0':''}</span><span><a href="${esc(wikiURL(word))}" target="_blank" rel="noopener noreferrer">英語の辞書 ↗</a> · <a href="${esc(wikiURL(entry.lemma,'ja'))}" target="_blank" rel="noopener noreferrer">日本語の辞書 ↗</a>${online && entry.lemma!==word?` · <a href="${esc(wikiURL(entry.lemma))}" target="_blank" rel="noopener noreferrer">原形の辞書 ↗</a>`:''}</span></div></article>`;
  }).join('');
  if(!entries.length) $('#results').innerHTML='<div class="notice">該当なし。つづりを確認してください。</div>';
  if(entries.some(e=>e.source==='local')) $('#results').insertAdjacentHTML('beforeend','<button id="online-more" class="quiet">オンライン検索 ↗</button>');
  renderSaved();
}
let resultStorage;
try { resultStorage=window.localStorage; } catch {}
const lookupOnline=createOnlineLookup({storage:resultStorage});
async function search(raw,forceOnline=false){
  const word=normalize(raw);
  if(!word){status('スペイン語の単語を入力してください。',true);$('#word').focus();return;}
  if(!/^[\p{L}\p{M} -]{1,80}$/u.test(word)){status('スペイン語の文字で単語を入力してください。',true);return;}
  if(word.includes(' ')){
    controller?.abort();requestId++;
    $('#tokens').hidden=false;
    $('#tokens').innerHTML=[...new Set(word.split(' '))].map(token=>`<button data-word="${esc(token)}">${esc(token)}</button>`).join('');
    status('聞き取った文から、調べたい単語を選んでください。');$('#results').removeAttribute('aria-busy');return;
  }
  $('#tokens').hidden=true;$('#word').value=word;updateClear();
  controller?.abort();controller=new AbortController();const id=++requestId;
  const local=lookupLocal(word);
  if(local.length && !forceOnline){render(local,word);$('#results').removeAttribute('aria-busy');status(local.length>1?'複数の解釈があります。':'');return;}
  status('検索中…');$('#results').setAttribute('aria-busy','true');
  try{
    const result=await lookupOnline(word,controller.signal,entries=>{
      if(id!==requestId)return;
      render(entries,word);status(entries.some(entry=>entry.pending)?'日本語を取得中…':'検索中…');
    },{refresh:forceOnline});
    if(id!==requestId)return;
    if(forceOnline && !result.entries.length && local.length){render(local,word);status('オンラインで追加の項目が見つからなかったため、内蔵辞書を表示しています。');}
    else {render(result.entries,word);status(result.entries.length?(result.jaFailed?'日本語辞書に接続できなかったため、利用可能な参考訳を表示しています。':''):'辞書にスペイン語の項目が見つかりませんでした。');}
  }catch(error){
    if(id!==requestId || error.name==='AbortError')return;
    if(local.length)render(local,word);
    else{$('#results').innerHTML=`<div class="notice"><h2>オンライン辞書に接続できませんでした</h2><p>${esc(error.message)}</p><button data-word="${esc(word)}">もう一度調べる</button></div>`;currentEntries=[];}
    status(local.length?'接続できなかったため、内蔵辞書を表示しています。':error.message,true);
  }finally{if(id===requestId)$('#results').removeAttribute('aria-busy');}
}
function updateClear(){ $('#clear-word').hidden=!$('#word').value; }
$('#word').addEventListener('input',updateClear);
$('#clear-word').addEventListener('click',()=>{
  controller?.abort();requestId++;
  recognition?.abort();
  $('#word').value='';updateClear();$('#tokens').hidden=true;
  $('#tokens').replaceChildren();$('#results').replaceChildren();
  currentWord='';currentEntries=[];
  $('#results').removeAttribute('aria-busy');status('');$('#word').focus();
});
updateClear();
$('#search-form').addEventListener('submit',event=>{event.preventDefault();search($('#word').value);});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.word){search(button.dataset.word);return;}
  if(button.dataset.speak){speak(button.dataset.speak);return;}
  if(button.dataset.remove){saved=saved.filter(x=>x.word!==button.dataset.remove);persist();return;}
  if(button.classList.contains('save')){
    if(saved.some(x=>x.word===currentWord))saved=saved.filter(x=>x.word!==currentWord);
    else if(saved.length<100)saved.unshift({word:currentWord,ja:currentEntries[0]?.ja || ''});
    else{status('単語帳は100語までです。不要な単語を削除すると追加できます。',true);return;}
    persist();return;
  }
  if(button.id==='online-more')search(currentWord,true);
});
const settingsKey='palabra.speech.v1';
try {
  const settings=JSON.parse(localStorage.getItem(settingsKey) || '{}');
  for(const id of ['dialect','speed'])if([...$('#'+id).options].some(o=>o.value===settings[id]))$('#'+id).value=settings[id];
} catch {}
for(const id of ['dialect','speed'])$('#'+id).addEventListener('change',()=>{
  try{localStorage.setItem(settingsKey,JSON.stringify({dialect:$('#dialect').value,speed:$('#speed').value}));}catch{}
  updateVoices();
  if(id==='dialect' && currentWord)render(currentEntries,currentWord);
});
let voices=[], speechTimer, speechSequence=0, activeUtterance;
function voiceFallbackNote(){
  const voice=selectSpanishVoice(voices,$('#dialect').value);
  if(!voice)return '音声は端末・ブラウザに依存';
  if(voice.lang.replaceAll('_','-').toLowerCase()===$('#dialect').value.toLowerCase())return '';
  return `代替音声：${voice.name}（${voice.lang}）`;
}
function updateVoices(){
  if(!('speechSynthesis' in window)){ $('#voice-note').textContent='このブラウザは読み上げに対応していません。';return; }
  voices=window.speechSynthesis.getVoices().filter(voice=>/^es(?:-|_)/i.test(voice.lang));
  $('#voice-note').textContent=voiceFallbackNote();
}
function speak(text){
  if(!('speechSynthesis' in window)){status('このブラウザは発音の読み上げに対応していません。',true);return;}
  const sequence=++speechSequence;clearTimeout(speechTimer);
  updateVoices();window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=$('#dialect').value;utterance.rate=Number($('#speed').value);
  activeUtterance=utterance;
  const voice=selectSpanishVoice(voices,utterance.lang);if(voice){utterance.voice=voice;utterance.lang=voice.lang;}
  status(`「${text}」の発音を準備しています…`);
  speechTimer=setTimeout(()=>{if(sequence!==speechSequence)return;window.speechSynthesis.cancel();status('発音を開始できませんでした。Chromeなどの対応ブラウザで開くか、端末にスペイン語音声を追加してください。',true);},6000);
  utterance.onstart=()=>{if(sequence!==speechSequence)return;clearTimeout(speechTimer);status(`「${text}」を発音しています。`);};
  utterance.onend=()=>{if(sequence!==speechSequence)return;clearTimeout(speechTimer);activeUtterance=null;status('');};
  utterance.onerror=e=>{if(sequence!==speechSequence)return;clearTimeout(speechTimer);activeUtterance=null;if(!['canceled','interrupted'].includes(e.error))status('発音を再生できません。対応ブラウザと端末のスペイン語音声を確認してください。',true);};
  window.speechSynthesis.speak(utterance);
}
if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',updateVoices);
updateVoices();
const Recognition=window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition, listening=false;
if(!Recognition){$('#mic').disabled=true;$('#mic').title='このブラウザは音声入力に未対応です。対応ブラウザを使うか文字入力してください。';status('音声入力はこのブラウザに未対応です。文字入力・発音ボタンをお使いください。');}
else{
  recognition=new Recognition();recognition.interimResults=false;recognition.maxAlternatives=1;recognition.continuous=false;
  recognition.onstart=()=>{listening=true;$('#mic').classList.add('listening');$('#mic').setAttribute('aria-label','音声入力を停止');status('聞いています… スペイン語を話してください。');};
  recognition.onresult=event=>{$('#word').value=normalize(event.results[0][0].transcript);updateClear();status('聞き取りました。文字を確認・修正して「調べる」を押してください。');$('#word').focus();};
  recognition.onerror=event=>{const messages={'not-allowed':'マイクの使用が許可されていません。ブラウザのサイト設定で許可してください。','service-not-allowed':'音声認識サービスがこのブラウザで利用できません。','audio-capture':'マイクが見つかりません。端末の接続を確認してください。','no-speech':'音声を聞き取れませんでした。もう一度お試しください。','network':'音声認識サービスに接続できません。対応ブラウザとネット接続を確認してください。','language-not-supported':'このブラウザでは選択したスペイン語の音声認識が利用できません。','aborted':'音声入力を停止しました。'};status(messages[event.error]||'音声入力に失敗しました。文字でも入力できます。',true);};
  recognition.onend=()=>{listening=false;$('#mic').classList.remove('listening');$('#mic').setAttribute('aria-label','スペイン語を音声入力');};
  $('#mic').addEventListener('click',()=>{if(listening){recognition.stop();status('音声入力を停止しています…');return;}recognition.lang=$('#dialect').value;try{recognition.start();}catch{status('音声入力の準備中です。少し待ってからお試しください。',true);}});
}
render(lookupLocal('he'),'he');
window.addEventListener('pagehide',()=>{recognition?.abort();window.speechSynthesis?.cancel();controller?.abort();});

