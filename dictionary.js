// Original, compact learning dictionary. This is a selection of common senses,
// not an exhaustive account of every word or regional conjugation.
export const entries = new Map();
export function normalize(text) {
  return text.normalize('NFC').trim().toLocaleLowerCase('es').replace(/^[¿¡\s.,!?;:"“”'()]+|[\s.,!?;:"“”'()]+$/gu, '').replace(/\s+/g, ' ');
}
function add(word, entry) {
  const key = normalize(word);
  entries.set(key, [...(entries.get(key) || []), { word: key, source: 'local', ...entry }]);
}
const people = ['yo', 'tú', 'él / ella / usted', 'nosotros / nosotras', 'vosotros / vosotras', 'ellos / ellas / ustedes'];
const persons = ['一人称単数（私）', '二人称単数（君）', '三人称単数／usted', '一人称複数（私たち）', '二人称複数（君たち）', '三人称複数／ustedes'];
export const verbs = [
  ['haber', 'to have (auxiliary); there to be', '（完了形を作る）〜した／存在する', ['he','has','ha','hemos','habéis','han'], ['hube','hubiste','hubo','hubimos','hubisteis','hubieron'], ['había','habías','había','habíamos','habíais','habían'], 'habido', 'habiendo', 'He comido una manzana.', 'I have eaten an apple.', '私はりんごを1個食べました。', 'haber ＋ 過去分詞で完了形を作ります。「持っている」という所有は、ふつう tener を使います。'],
  ['ser', 'to be', '〜である（性質・身元など）', ['soy','eres','es','somos','sois','son'], ['fui','fuiste','fue','fuimos','fuisteis','fueron'], ['era','eras','era','éramos','erais','eran'], 'sido', 'siendo', 'Soy estudiante.', 'I am a student.', '私は学生です。', '身元・職業・性質などを表します。ir と点過去の活用が同じなので、文脈で判断します。'],
  ['estar', 'to be', '〜にいる／〜の状態にある', ['estoy','estás','está','estamos','estáis','están'], ['estuve','estuviste','estuvo','estuvimos','estuvisteis','estuvieron'], ['estaba','estabas','estaba','estábamos','estabais','estaban'], 'estado', 'estando', 'Estoy en casa.', 'I am at home.', '私は家にいます。', '人や物の所在、状態を表します。ser との使い分けは、何を伝えるかによって変わります。'],
  ['ir', 'to go', '行く', ['voy','vas','va','vamos','vais','van'], ['fui','fuiste','fue','fuimos','fuisteis','fueron'], ['iba','ibas','iba','íbamos','ibais','iban'], 'ido', 'yendo', 'Fui a Madrid.', 'I went to Madrid.', '私はマドリードに行きました。', 'ir a ＋ 不定詞で「〜する予定だ」。点過去は ser と同じ形です。'],
  ['tener', 'to have', '持っている／（年齢が）〜歳である', ['tengo','tienes','tiene','tenemos','tenéis','tienen'], ['tuve','tuviste','tuvo','tuvimos','tuvisteis','tuvieron'], ['tenía','tenías','tenía','teníamos','teníais','tenían'], 'tenido', 'teniendo', 'Tengo un libro.', 'I have a book.', '私は本を1冊持っています。', '所有に使います。tener que ＋ 不定詞は「〜しなければならない」。'],
  ['hacer', 'to do; to make', 'する／作る', ['hago','haces','hace','hacemos','hacéis','hacen'], ['hice','hiciste','hizo','hicimos','hicisteis','hicieron'], ['hacía','hacías','hacía','hacíamos','hacíais','hacían'], 'hecho', 'haciendo', 'Hago café.', 'I make coffee.', '私はコーヒーをいれます。', '過去分詞は不規則な hecho。Hace frío. は「寒い」です。'],
  ['decir', 'to say; to tell', '言う／伝える', ['digo','dices','dice','decimos','decís','dicen'], ['dije','dijiste','dijo','dijimos','dijisteis','dijeron'], ['decía','decías','decía','decíamos','decíais','decían'], 'dicho', 'diciendo', 'Digo la verdad.', 'I tell the truth.', '私は本当のことを言います。', '過去分詞は dicho、現在分詞は diciendo です。'],
  ['poder', 'can; to be able to', '〜できる', ['puedo','puedes','puede','podemos','podéis','pueden'], ['pude','pudiste','pudo','pudimos','pudisteis','pudieron'], ['podía','podías','podía','podíamos','podíais','podían'], 'podido', 'pudiendo', 'Puedo hablar español.', 'I can speak Spanish.', '私はスペイン語を話せます。', 'poder の後ろに不定詞を置きます。'],
  ['querer', 'to want; to love', '欲しい／〜したい／愛する', ['quiero','quieres','quiere','queremos','queréis','quieren'], ['quise','quisiste','quiso','quisimos','quisisteis','quisieron'], ['quería','querías','quería','queríamos','queríais','querían'], 'querido', 'queriendo', 'Quiero aprender español.', 'I want to learn Spanish.', '私はスペイン語を学びたいです。', 'querer ＋ 不定詞で「〜したい」。Te quiero. は愛情を伝える表現です。'],
  ['venir', 'to come', '来る', ['vengo','vienes','viene','venimos','venís','vienen'], ['vine','viniste','vino','vinimos','vinisteis','vinieron'], ['venía','venías','venía','veníamos','veníais','venían'], 'venido', 'viniendo', 'Vengo de Japón.', 'I come from Japan.', '私は日本から来ました。', 'vino は venir の活用ですが、名詞では「ワイン」という意味もあります。'],
  ['ver', 'to see', '見る／見える', ['veo','ves','ve','vemos','veis','ven'], ['vi','viste','vio','vimos','visteis','vieron'], ['veía','veías','veía','veíamos','veíais','veían'], 'visto', 'viendo', 'Veo el mar.', 'I see the sea.', '海が見えます。', '過去分詞は不規則な visto です。'],
  ['dar', 'to give', '与える／渡す', ['doy','das','da','damos','dais','dan'], ['di','diste','dio','dimos','disteis','dieron'], ['daba','dabas','daba','dábamos','dabais','daban'], 'dado', 'dando', 'Te doy las gracias.', 'I thank you.', 'あなたに感謝します。', 'dar las gracias で「感謝する」。'],
  ['saber', 'to know', '知っている／やり方がわかる', ['sé','sabes','sabe','sabemos','sabéis','saben'], ['supe','supiste','supo','supimos','supisteis','supieron'], ['sabía','sabías','sabía','sabíamos','sabíais','sabían'], 'sabido', 'sabiendo', 'Sé nadar.', 'I know how to swim.', '私は泳げます。', 'sé（私は知っている）は、アクセントのない se（代名詞）と別の語です。'],
  ['hablar', 'to speak; to talk', '話す', null, null, null, 'hablado', 'hablando', 'Hablo español.', 'I speak Spanish.', '私はスペイン語を話します。', '規則的な -ar 動詞です。'],
  ['comer', 'to eat', '食べる', null, null, null, 'comido', 'comiendo', 'Como una manzana.', 'I eat an apple.', '私はりんごを1個食べます。', 'como は comer の活用のほか、接続詞・前置詞・副詞としての用法もあります。'],
  ['vivir', 'to live', '住む／生きる', null, null, null, 'vivido', 'viviendo', 'Vivo en Tokio.', 'I live in Tokyo.', '私は東京に住んでいます。', '規則的な -ir 動詞です。'],
  ['aprender', 'to learn', '学ぶ／覚える', null, null, null, 'aprendido', 'aprendiendo', 'Aprendo español.', 'I am learning Spanish.', '私はスペイン語を学んでいます。', 'aprender a ＋ 不定詞で「〜することを学ぶ」。'],
  ['estudiar', 'to study', '勉強する', null, null, null, 'estudiado', 'estudiando', 'Estudio todos los días.', 'I study every day.', '私は毎日勉強します。', '規則的な -ar 動詞です。'],
  ['beber', 'to drink', '飲む', null, null, null, 'bebido', 'bebiendo', 'Bebo agua.', 'I drink water.', '私は水を飲みます。', '規則的な -er 動詞です。'],
  ['escribir', 'to write', '書く', null, null, null, 'escrito', 'escribiendo', 'Escribo una carta.', 'I write a letter.', '私は手紙を書きます。', '過去分詞は不規則な escrito です。'],
  ['leer', 'to read', '読む', ['leo','lees','lee','leemos','leéis','leen'], ['leí','leíste','leyó','leímos','leísteis','leyeron'], ['leía','leías','leía','leíamos','leíais','leían'], 'leído', 'leyendo', 'Leo un libro.', 'I read a book.', '私は本を読みます。', '過去分詞 leído の í にはアクセント記号が付きます。'],
];
const endings = {
  ar: [['o','as','a','amos','áis','an'], ['é','aste','ó','amos','asteis','aron'], ['aba','abas','aba','ábamos','abais','aban']],
  er: [['o','es','e','emos','éis','en'], ['í','iste','ió','imos','isteis','ieron'], ['ía','ías','ía','íamos','íais','ían']],
  ir: [['o','es','e','imos','ís','en'], ['í','iste','ió','imos','isteis','ieron'], ['ía','ías','ía','íamos','íais','ían']],
};
for (const [lemma, en, ja, present, past, imperfect, participle, gerund, esExample, enExample, jaExample, note] of verbs) {
  const base = { lemma, en, ja, pos: lemma === 'haber' ? '動詞・助動詞' : '動詞', gender: '', note, example: { es: esExample, en: enExample, ja: jaExample } };
  const tables = [present, past, imperfect].map((forms, i) => forms || endings[lemma.slice(-2)][i].map(end => lemma.slice(0,-2) + end));
  const tenses = ['直説法・現在形', '直説法・点過去', '直説法・線過去'];
  add(lemma, { ...base, form: '不定詞（原形）', person: '—', conjugations: tables[0].map((word,i) => ({ person: people[i], word })), tableLabel: tenses[0] });
  tables.forEach((forms,t) => forms.forEach((word,i) => add(word, { ...base, form: tenses[t], person: persons[i], conjugations: forms.map((word,j) => ({ person: people[j], word })), tableLabel: tenses[t] })));
  add(participle, { ...base, form: '過去分詞', person: '人称による変化なし', note: `haber と組み合わせて完了形を作れます。形容詞として使う場合は性・数が変化することがあります。${note}` });
  add(gerund, { ...base, form: '現在分詞（gerundio）', person: '人称による変化なし', note: `estar と組み合わせて「〜している」という進行を表せます。${note}` });
}
const nouns = [
 ['libro','libros','book','本','男性','el libro','Leo un libro.','I read a book.','私は本を読みます。'],
 ['casa','casas','house; home','家','女性','la casa','La casa es grande.','The house is big.','その家は大きいです。'],
 ['agua','aguas','water','水','女性','el agua','El agua está fría.','The water is cold.','水は冷たいです。','強勢のある a で始まる女性名詞です。単数の直前は el を使いますが、性は女性のまま。複数は las aguas、形容詞は fría です。'],
 ['problema','problemas','problem','問題','男性','el problema','Tenemos un problema.','We have a problem.','私たちには問題があります。','-a で終わっていても男性名詞です。語尾だけで性は決められません。'],
 ['mano','manos','hand','手','女性','la mano','Levanta la mano.','Raise your hand.','手を上げてください。','-o で終わっていても女性名詞です。'],
 ['día','días','day','日／一日','男性','el día','Hoy es un buen día.','Today is a good day.','今日は良い日です。','-a で終わっていても男性名詞です。'],
 ['noche','noches','night','夜','女性','la noche','La noche es tranquila.','The night is quiet.','静かな夜です。'],
 ['mujer','mujeres','woman','女性','女性','la mujer','La mujer lee.','The woman reads.','その女性は読書をします。'],
 ['hombre','hombres','man','男性／人','男性','el hombre','El hombre habla español.','The man speaks Spanish.','その男性はスペイン語を話します。'],
 ['niño','niños','boy; child','男の子／子ども','男性','el niño','El niño juega.','The boy plays.','男の子が遊んでいます。'],
 ['niña','niñas','girl','女の子','女性','la niña','La niña canta.','The girl sings.','女の子が歌っています。'],
 ['amigo','amigos','friend','友人（男性）','男性','el amigo','Mi amigo vive aquí.','My friend lives here.','私の友人はここに住んでいます。'],
 ['amiga','amigas','friend','友人（女性）','女性','la amiga','Mi amiga vive aquí.','My friend lives here.','私の友人はここに住んでいます。'],
 ['perro','perros','dog','犬','男性','el perro','El perro duerme.','The dog sleeps.','犬が眠っています。'],
 ['gato','gatos','cat','猫','男性','el gato','El gato es pequeño.','The cat is small.','猫は小さいです。'],
 ['mesa','mesas','table','テーブル','女性','la mesa','El libro está en la mesa.','The book is on the table.','本はテーブルの上にあります。'],
 ['silla','sillas','chair','椅子','女性','la silla','La silla es cómoda.','The chair is comfortable.','その椅子は座り心地が良いです。'],
 ['comida','comidas','food; meal','食べ物／食事','女性','la comida','La comida está buena.','The food is good.','その料理はおいしいです。'],
 ['pan','panes','bread','パン','男性','el pan','Quiero pan.','I want bread.','パンが欲しいです。'],
 ['café','cafés','coffee; café','コーヒー／喫茶店','男性','el café','Tomo café.','I drink coffee.','私はコーヒーを飲みます。'],
 ['vino','vinos','wine','ワイン','男性','el vino','El vino es tinto.','The wine is red.','そのワインは赤ワインです。','動詞 venir の点過去（三人称単数）と同じ形です。'],
 ['leche','leches','milk','牛乳','女性','la leche','Bebo leche.','I drink milk.','私は牛乳を飲みます。'],
 ['manzana','manzanas','apple; city block','りんご／街区','女性','la manzana','Como una manzana.','I eat an apple.','私はりんごを1個食べます。'],
 ['ciudad','ciudades','city','都市／街','女性','la ciudad','La ciudad es bonita.','The city is beautiful.','その街は美しいです。'],
 ['país','países','country','国','男性','el país','Japón es un país.','Japan is a country.','日本は国です。'],
 ['idioma','idiomas','language','言語','男性','el idioma','Aprendo un idioma.','I am learning a language.','私は言語を学んでいます。','-a で終わりますが男性名詞です。'],
 ['palabra','palabras','word','単語／ことば','女性','la palabra','Es una palabra nueva.','It is a new word.','それは新しい単語です。'],
 ['tiempo','tiempos','time; weather','時間／天気','男性','el tiempo','No tengo tiempo.','I do not have time.','私は時間がありません。'],
 ['año','años','year','年','男性','el año','Tengo veinte años.','I am twenty years old.','私は20歳です。','ñ は n とは別の文字です。años と anos は別の語なので、ñ を省略しないようにしましょう。'],
 ['trabajo','trabajos','work; job','仕事','男性','el trabajo','Tengo mucho trabajo.','I have a lot of work.','私は仕事がたくさんあります。','trabajo は trabajar の現在形（一人称単数）としても使われます。'],
 ['escuela','escuelas','school','学校','女性','la escuela','Voy a la escuela.','I go to school.','私は学校に行きます。'],
 ['estudiante','estudiantes','student','学生','男性・女性（共通形）','el / la estudiante','Soy estudiante.','I am a student.','私は学生です。','人の性に応じて el estudiante / la estudiante を使い分けます。'],
 ['flor','flores','flower','花','女性','la flor','La flor es bonita.','The flower is beautiful.','その花はきれいです。'],
 ['foto','fotos','photo','写真','女性','la foto','Es una foto de Madrid.','It is a photo of Madrid.','マドリードの写真です。','fotografía の短縮形なので、-o で終わっても女性名詞です。'],
 ['mar','mares','sea','海','男性・女性','el mar / la mar','Veo el mar.','I see the sea.','海が見えます。','ふつうは男性名詞ですが、船乗りの表現や詩などで女性名詞としても使います。'],
];
for (const [lemma, plural, en, ja, gender, article, es, english, japanese, note] of nouns) {
  const base = { lemma, en, ja, pos: '名詞', gender, article, note: note || `冠詞と一緒に ${article} と覚えると、名詞の性も覚えやすくなります。`, example: { es, en: english, ja: japanese } };
  add(lemma, { ...base, form: '単数形', person: '', plural });
  add(plural, { ...base, form: '複数形', person: '', plural });
}
const simple = (word, en, ja, pos, note, example, extra={}) => add(word, { lemma: word, en, ja, pos, gender:'', form:'基本形', person:'', note, example, ...extra });
simple('hola','hello','こんにちは','間投詞','h は発音しません。あいさつに使います。',{es:'¡Hola! ¿Qué tal?',en:'Hello! How are you?',ja:'こんにちは！元気ですか？'});
simple('gracias','thank you','ありがとう','間投詞・名詞由来の表現','感謝を伝える定型表現です。名詞 gracia の複数形でもあります。',{es:'Muchas gracias.',en:'Thank you very much.',ja:'どうもありがとうございます。'});
simple('como','as; like; since','〜のように／〜として／〜なので','接続詞・前置詞・副詞','comer の「私は食べる」と同じつづりです。cómo（どう・どのように）とはアクセントで区別します。',{es:'Trabajo como profesor.',en:'I work as a teacher.',ja:'私は教師として働いています。'});
simple('cómo','how','どう／どのように','疑問副詞','直接疑問でも間接疑問でもアクセント記号が付きます。como とは別の用法です。',{es:'¿Cómo estás?',en:'How are you?',ja:'元気ですか？'});
simple('el','the','その（男性単数の定冠詞）','冠詞','él（彼）とはアクセント記号で区別します。el agua のように一部の女性名詞の直前でも使います。',{es:'El libro es nuevo.',en:'The book is new.',ja:'その本は新しいです。'},{gender:'男性（通常）',form:'単数形'});
simple('él','he; him','彼／彼を・彼に（前置詞の後）','代名詞','アクセントのない el は定冠詞です。',{es:'Él habla español.',en:'He speaks Spanish.',ja:'彼はスペイン語を話します。'},{gender:'男性',form:'三人称単数'});
simple('la','the','その（女性単数の定冠詞）','冠詞','女性単数名詞の前で使います。',{es:'La casa es bonita.',en:'The house is beautiful.',ja:'その家はきれいです。'},{gender:'女性',form:'単数形'});
simple('la','her; it','彼女を／それを（女性）','代名詞','女性単数の直接目的語を置き換えます。',{es:'La veo.',en:'I see her / it.',ja:'彼女が／それが見えます。'},{gender:'女性',form:'三人称単数・直接目的語'});
simple('sí','yes','はい','副詞','si（もし）とはアクセント記号で区別します。',{es:'Sí, quiero.',en:'Yes, I want to.',ja:'はい、そうしたいです。'});
simple('si','if; whether','もし〜なら／〜かどうか','接続詞','肯定の sí（はい）にはアクセント記号があります。',{es:'Si llueve, no voy.',en:'If it rains, I will not go.',ja:'雨が降れば、行きません。'});
simple('se','oneself; each other; reflexive marker','自分を・自分に／再帰・受け身などの標識','代名詞','アクセントのある sé（saber の活用）とは別の語です。se には再帰・相互・受け身・非人称など複数の用法があります。',{es:'Se llama Ana.',en:'Her name is Ana.',ja:'彼女の名前はアナです。'});
simple('hay','there is; there are','〜がある／〜がいる','動詞・存在表現','haber の非人称の現在形です。後ろが複数でも hay のまま使います。',{es:'Hay dos libros.',en:'There are two books.',ja:'本が2冊あります。'},{lemma:'haber',form:'直説法・現在形（非人称）',person:'非人称'});
export function lookupLocal(word) { return entries.get(normalize(word)) || []; }
export const localWordCount = entries.size;
