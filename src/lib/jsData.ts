import { L } from './data';
import type { Chapter } from './types';

/**
 * JSTrail: a plain-JavaScript review track, separate from TypeTrail's
 * TypeScript curriculum in data.ts. Exercises here intentionally carry no
 * type annotations — the focus is JS mechanics (array methods, async
 * control flow) on their own, before TypeTrail layers types on top.
 */
export const JS_DATA: Chapter[] = [
  { num: '01', title: '配列を操る：map・filter・reduce', sub: '配列から欲しい形を取り出す',
    steps: [
      { kicker: 'STEP 1', heading: 'map は変換、filter は絞り込み',
        body: ['`map` は配列の要素を1つずつ変換して、同じ長さの新しい配列を作ります。',
               '`filter` はコールバックが true を返した要素だけを残した新しい配列を作ります。どちらも元の配列は書き換えません。'],
        code: ['const scores = [80, 45, 92, 30];', 'const passed = scores.filter((s) => s >= 60);', 'const bonus = passed.map((s) => s + 5);'],
        note: '`forEach` は「1つずつ処理するだけ」で、新しい配列は返しません。値を作りたいときは map・filter を使います。',
        ex: { file: 'scores.js', goal: 'filter と map で配列を変換しよう',
          lines: [ L('const scores = [80, 45, 92, 30];'),
                   L('const passed = scores.', ['filter'], '((s) => s >= 60);'),
                   L('const bonus = passed.', ['map'], '((s) => s + 5);') ],
          pool: ['forEach', 'find', 'some', 'every'],
          hint: '条件で絞るのは filter、値を変換するのは map です。',
          out: ['✓ 実行できました', 'bonus → [85, 97]'] } },
      { kicker: 'STEP 2', heading: 'reduce は「まとめて1つの値」にする',
        body: ['`reduce` は配列を先頭から畳み込んで、1つの値にまとめます。第1引数がコールバック、第2引数が初期値です。',
               'コールバックは (それまでの結果, 今の要素) => 次の結果、という形で呼ばれます。'],
        code: ['const bonus = [85, 97];', 'const total = bonus.reduce((sum, s) => sum + s, 0);', '// sum: 0 → 85 → 182'],
        note: '初期値を書き忘れると、配列が空のときにエラーになります。集計処理では必ず初期値を書きましょう。',
        ex: { file: 'scores.js', goal: 'reduce で合計を求めよう',
          lines: [ L('const bonus = [85, 97];'),
                   L('const total = bonus.', ['reduce'], '((sum, s) => sum + s, 0);') ],
          pool: ['forEach', 'map', 'filter'],
          hint: '配列をまとめて1つの値にするのは reduce です。',
          out: ['✓ 実行できました', 'total → 182'] } },
      { kicker: 'STEP 3', heading: 'find・some・every で探す/判定する',
        body: ['`find` は条件に合う最初の要素を1つだけ返します（新しい配列ではなく要素そのもの）。見つからなければ undefined です。',
               '`some` は「1つでも条件を満たす要素があるか」、`every` は「全部の要素が条件を満たすか」を true/false で返します。'],
        code: ['const scores = [80, 45, 92, 30];', 'const first90 = scores.find((s) => s >= 90);   // 92', 'const anyFailed = scores.some((s) => s < 60);  // true', 'const allPassed = scores.every((s) => s >= 60); // false'],
        note: 'find・some・every はどれも「新しい配列」ではなく単一の値（要素や真偽値）を返す点が map・filter と違います。',
        ex: { file: 'scores.js', goal: 'find・some・every で探す/判定しよう',
          lines: [ L('const scores = [80, 45, 92, 30];'),
                   L('const first90 = scores.', ['find'], '((s) => s >= 90);'),
                   L('const anyFailed = scores.', ['some'], '((s) => s < 60);'),
                   L('const allPassed = scores.', ['every'], '((s) => s >= 60);') ],
          pool: ['filter', 'map', 'reduce'],
          hint: '1つ探すのは find、1つでも条件を満たすかは some、全部かは every です。',
          out: ['✓ 実行できました', 'first90 → 92, anyFailed → true, allPassed → false'] } }
    ] },

  { num: '02', title: '非同期処理：Promise と async/await', sub: '「待ってから使う」を書く',
    steps: [
      { kicker: 'STEP 1', heading: '非同期の結果は Promise という「箱」に入る',
        body: ['時間のかかる処理（通信やタイマーなど）は、値をすぐに返せません。代わりに「あとで解決される箱」である Promise を返します。',
               '`Promise.resolve(値)` は、その値をそのまま解決済みの Promise に包みます。'],
        code: ['function fetchName() {', '  return Promise.resolve("ada");', '}'],
        note: '`.then(callback)` で Promise の中身を受け取ることもできますが、async/await の方が普通の処理っぽく書けます。',
        ex: { file: 'greet.js', goal: 'Promise を返す関数を書こう',
          lines: [ L('function fetchName() {'),
                   L('  return ', ['Promise.resolve'], '("ada");'), L('}') ],
          pool: ['Promise.reject', 'Promise.all', 'fetch'],
          hint: '値をそのまま Promise に包むには Promise.resolve を使います。',
          out: ['✓ 実行できました', 'fetchName() → Promise<"ada">'] } },
      { kicker: 'STEP 2', heading: 'async/await で中身を取り出す',
        body: ['`async` をつけて定義した関数は、戻り値を自動的に Promise で包んでくれます。',
               '`await` をつけると Promise が解決されるまで待って、中身の値を直接受け取れます。`await` は `async` をつけた関数の中でしか使えません。'],
        code: ['async function greet() {', '  const name = await fetchName();', '  return `hi, ${name}`;', '}'],
        note: 'エラーは Promise の reject として伝わるので、実務では try/catch で受け止めます。',
        ex: { file: 'greet.js', goal: 'async/await で非同期関数をつなげよう',
          lines: [ L('', ['async'], ' function greet() {'),
                   L('  const name = ', ['await'], ' fetchName();'),
                   L('  return `hi, ${name}`;'), L('}') ],
          pool: ['sync', 'yield', 'then'],
          hint: '非同期関数の頭には async を、中身を待つところには await をつけます。',
          out: ['✓ 実行できました', 'await greet() → "hi, ada"'] } }
    ] }
];
