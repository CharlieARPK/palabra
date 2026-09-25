const posNames = { Noun:'名詞', Verb:'動詞', Adjective:'形容詞', Adverb:'副詞', Pronoun:'代名詞', Preposition:'前置詞', Conjunction:'接続詞', Interjection:'間投詞', Article:'冠詞', Determiner:'限定詞', Participle:'分詞', Numeral:'数詞', 'Proper noun':'固有名詞', Phrase:'句', Contraction:'縮約形', Letter:'文字', Prefix:'接頭辞', Suffix:'接尾辞' };
import { fetchJSON, wikiApiURL } from './api.js';
const jpPos = new Set(Object.values(posNames));
const clean = node => node.textContent.replace(/\s+/g,' ').trim();
export function parseWiki(html, word, lang, Parser = DOMParser) {
  const doc = new Parser().parseFromString(html, 'text/html');
  // Parsed source is never inserted into the live document.
  doc.querySelectorAll('script,style,link,iframe,object,embed,.mw-editsection').forEach(n=>n.remove());
  let active=false, current=null;
  const result=[];
  for (const node of doc.querySelectorAll('h2,h3,h4,h5,h6,p,ol')) {
    if (node.tagName==='H2') {
      active = lang==='en' ? clean(node)==='Spanish' : clean(node)==='スペイン語';
      current=null;
      continue;
    }
    if (!active) continue;
    if (/^H[3-6]$/.test(node.tagName)) {
      const name=clean(node).replace(/\s*\d+$/, '').trim();
      const pos=lang==='en' ? posNames[name] : [...jpPos].find(p=>name===p || name.startsWith(p+'：') || name.startsWith(p+':') || name.startsWith(p+'・'));
      current=pos ? {word,lemma:word,pos,gender:'',definitions:[],lemmas:[],form:'辞書の見出し',person:'',source:'wiki'} : null;
      if (current) result.push(current);
      continue;
    }
    if (!current || node.closest('table,li,dd,dl,.NavFrame,.etytree')) continue;
    if (node.tagName==='P') {
      const genders=[...node.querySelectorAll('.gender abbr')].map(n=>n.getAttribute('title')||clean(n));
      if (genders.length) {
        const male=genders.some(g=>/masculine|^m$/.test(g)), female=genders.some(g=>/feminine|^f$/.test(g));
        current.gender=male&&female?'男性・女性':male?'男性':female?'女性':'';
      } else if(lang==='ja' && current.pos==='名詞') {
        if(clean(node).includes('男性')) current.gender='男性';
        if(clean(node).includes('女性')) current.gender=current.gender?'男性・女性':'女性';
      }
    }
    if(node.tagName==='OL' && !node.parentElement.closest('ol')) {
      for(const li of [...node.children].filter(n=>n.tagName==='LI').slice(0,5)) {
        const clone=li.cloneNode(true);
        clone.querySelectorAll('dl,ul,.quotation,.usage-example').forEach(n=>n.remove());
        const text=clean(clone);
        if(!text) continue;
        current.definitions.push(text.slice(0,1200));
        clone.querySelectorAll('.form-of-definition-link [lang="es"] a,.form-of-definition-link a').forEach(a=> {
          const lemma=clean(a);
          if(lemma && lemma!==word && /^[\p{L}\p{M} -]{1,80}$/u.test(lemma)) current.lemmas.push(lemma);
        });
      }
    }
  }
  return result.filter(e=>e.definitions.length).map(e=>({...e,lemmas:[...new Set(e.lemmas)]}));
}
export async function getWiki(word, lang, signal) {
  const data=await fetchJSON(wikiApiURL(word,lang),signal);
  if(data.error) {
    if(['missingtitle','invalidtitle'].includes(data.error.code)) return [];
    throw new Error('辞書サービスが一時的に利用できません。');
  }
  return parseWiki(data.parse?.text?.['*'] || '',word,lang);
}
export function grammarJapanese(text) {
  const replacements=[['first-person','一人称'],['second-person','二人称'],['third-person','三人称'],['singular','単数'],['plural','複数'],['present perfect','現在完了'],['present','現在'],['preterite','点過去'],['imperfect','線過去'],['future','未来'],['conditional','過去未来'],['indicative','直説法'],['subjunctive','接続法'],['imperative','命令法'],['participle','分詞'],['gerund','現在分詞'],['inflection of','活用元：'],['feminine','女性'],['masculine','男性']];
  return replacements.reduce((s,[from,to])=>s.replaceAll(from,to),text).replace(/ of ([\p{L}\p{M}-]+)/gu,'（原形：$1）');
}
