import type { Chapter, LineSpec } from './types';

// Lesson content tracks the chapter order of サバイバルTypeScript (typescriptbook.jp):
// 値・型・変数 → オブジェクト指向 → 型の再利用 → ジェネリクス.

export function L(pre: string, t: string[] = [], post = '', unionAt?: number): LineSpec {
  return { pre, t, post, unionAt };
}

export const DATA: Chapter[] = [
  {
    num: '01', title: '型注釈と型推論', sub: '「ここには何が入るか」を書く',
    steps: [
      {
        kicker: 'STEP 1', heading: 'JS の変数に、ひとこと足すだけ',
        body: ['TypeScript は JavaScript にちょい足しする言語です。まずは変数名のうしろに `: 型` を書くところから。',
          'これだけで、あとから数値を入れようとしたときにエディタが止めてくれます。'],
        code: ['let userName: string = "ada";', 'userName = 12; // ← ここで怒られる'],
        note: 'string / number / boolean は全部小文字。大文字始まりの `String` は別モノなので使いません。',
        ex: {
          file: 'annotate.ts', goal: '変数に型注釈をつけよう',
          lines: [L('let userName', [':', 'string'], ' = "ada";')],
          pool: ['boolean', 'any', 'number'],
          hint: '文字列には string を使います。',
          out: ['✓ 型チェックを通過しました', 'userName → "ada"']
        }
      },
      {
        kicker: 'STEP 2', heading: '書かなくても、TS は察してくれる',
        body: ['初期値があるときは型を省略できます。TS が中身から型を推測してくれる「型推論」です。',
          '一方で、関数の引数は推論できません。ここは自分で書きましょう。'],
        code: ['let level = 12;      // number と推論される', 'function up(n: number): number {', '  return n + 1;', '}'],
        note: '迷ったら「引数は書く、変数はまかせる」。これだけで実務のコードはだいぶ読みやすくなります。',
        ex: {
          file: 'annotate.ts', goal: '関数の戻り値にも型注釈をつけよう',
          lines: [L('let level', [':', 'number'], ' = 12;'),
          L('function up(n: number)', [':', 'number'], ' {'),
          L('  return n + 1;'), L('}')],
          pool: ['string', 'boolean', 'void'],
          hint: '関数の戻り値も、返している値の型と同じです。',
          out: ['✓ 型チェックを通過しました', 'up(level) → 13']
        }
      },
      {
        kicker: 'STEP 3', heading: 'let と const で、推論の結果が変わる',
        body: ['`let` で初期化すると、値が属する「広い型」（string や number）に丸めて推論されます。あとで別の値を再代入できるからです。',
          '`const` で初期化すると再代入できないぶん、より狭い「その値そのものの型」（リテラル型）として推論されます。'],
        code: ['let a = "hello";   // string 型と推論される', 'const b = "hello"; // "hello" 型（リテラル型）と推論される', 'a = "world";  // OK: string 型の範囲内', 'b = "world";  // ← const なので再代入自体がエラー'],
        note: 'この「広げて推論する」ふるまいは widening と呼ばれます。細かい違いですが、リテラル型を使うユニオン型（次の章）を理解する土台になります。',
        ex: {
          file: 'widening.ts', goal: 'widening とリテラル型の違いを型注釈で確認しよう',
          lines: [L('let a', [':', 'string'], ' = "hello";'),
          L('const b', [':', '"hello"'], ' = "hello";')],
          pool: ['number', '"world"', 'boolean'],
          hint: 'let の変数は string のような広い型、const の変数は "hello" のようなリテラル型です。',
          out: ['✓ 型チェックを通過しました', 'typeof a → string / typeof b → "hello"']
        }
      }
    ]
  },

  {
    num: '02', title: 'プリミティブ型とリテラル型', sub: '値そのものを型にする',
    steps: [
      {
        kicker: 'STEP 1', heading: 'プリミティブ型は全部で決まった顔ぶれ',
        body: ['TypeScript の値は必ずどれかのプリミティブ型を持ちます。基本は string・number・boolean の3つで、多くのコードはこれでまかなえます。',
          'ほかに null・undefined・symbol・bigint もありますが、まずは代表的な3つを押さえれば十分です。'],
        code: ['let name: string = "ada";', 'let age: number = 30;', 'let active: boolean = true;'],
        note: '`null` と `undefined` はどちらも「値がない」を表しますが、null は「意図的に空」、undefined は「まだ値が入っていない」というニュアンスの違いがあります。',
        ex: {
          file: 'primitives.ts', goal: 'プリミティブ型で変数に型をつけよう',
          lines: [L('let name', [':', 'string'], ' = "ada";'),
          L('let age', [':', 'number'], ' = 30;'),
          L('let active', [':', 'boolean'], ' = true;')],
          pool: ['any', 'void', 'symbol'],
          hint: '文字列は string、数値は number、真偽値は boolean です。',
          out: ['✓ 型チェックを通過しました', 'name → "ada"']
        }
      },
      {
        kicker: 'STEP 2', heading: '値そのものを型にする「リテラル型」',
        body: ['string や number だけでなく、`"admin"` のような特定の値そのものを型として使えます。これがリテラル型です。',
          'ユニオン型と組み合わせると「決まった選択肢のどれか」を型で表現できます。'],
        code: ['type Status = "idle" | "loading" | "done";', 'let status: Status = "idle";', 'status = "paused"; // ← 候補にないので怒られる'],
        note: 'リテラル型は enum の代わりとしてもよく使われます。文字列のまま比較できるので扱いやすいです。',
        ex: {
          file: 'status.ts', goal: 'リテラル型のユニオンで Status を定義しよう',
          lines: [L('type Status = ', ['"idle"', '|', '"loading"', '|', '"done"'], ';', 0),
          L('let current', [':', 'Status'], ' = "idle";'),
          L('function next(s: Status)', [':', 'Status'], ' {'),
          L('  return s ', ['===', '"idle"'], ' ? "loading" : "done";'),
          L('}')],
          pool: ['string', 'enum', '==', 'number', '"paused"'],
          hint: '候補は | でつなぎます。比較は厳密等価（イコール3つ）で。',
          out: ['✓ 型チェックを通過しました', 'next("idle") → "loading"']
        }
      }
    ]
  },

  {
    num: '03', title: '配列とタプル', sub: '並び方の決まった値をまとめる',
    steps: [
      {
        kicker: 'STEP 1', heading: '同じ型の値が並ぶ「配列」',
        body: ['配列は `型[]` と書きます。中身の型を1種類に決めることで、要素を使うときの安心感が上がります。',
          'ジェネリクスの記法で `Array<型>` と書くこともできますが、`型[]` の方がよく使われます。'],
        code: ['let scores: number[] = [80, 92, 76];', 'let names: string[] = ["ada", "grace"];'],
        note: '配列に別の型の値を push しようとすると、その場でエディタが赤線を出してくれます。',
        ex: {
          file: 'collections.ts', goal: '配列に型をつけよう',
          lines: [L('let scores', [':', 'number[]'], ' = [80, 92, 76];'),
          L('let names', [':', 'string[]'], ' = ["ada", "grace"];')],
          pool: ['Array<number>', 'any[]', 'object'],
          hint: '配列は「型[]」のように書きます。',
          out: ['✓ 型チェックを通過しました', 'scores → [80, 92, 76]']
        }
      },
      {
        kicker: 'STEP 2', heading: '順番と型が決まっている「タプル」',
        body: ['タプルは配列に似ていますが、要素ごとに型と個数が決まっています。「名前は文字列、年齢は数値」のような組を表すのに向いています。'],
        code: ['let pair: [string, number] = ["ada", 30];', 'pair = [30, "ada"]; // ← 順番が違うと怒られる'],
        note: '3つ目以降の要素を増やしたいときは `[string, number, boolean]` のように型を並べて増やします。',
        ex: {
          file: 'collections.ts', goal: 'タプルに型をつけよう',
          lines: [L('let pair', [':', '[string, number]'], ' = ["ada", 30];'),
          L('function first(p: [string, number])', [':', 'string'], ' {'),
          L('  return p[0];'), L('}')],
          pool: ['number', '[number, string]', 'any'],
          hint: 'タプルは「[型, 型]」のように順番どおりに書きます。',
          out: ['✓ 型チェックを通過しました', 'first(pair) → "ada"']
        }
      }
    ]
  },

  {
    num: '04', title: 'オブジェクトと構造的型付け', sub: '型の互換性は「形」で決まる',
    steps: [
      {
        kicker: 'STEP 1', heading: '「形」が同じなら同じ型として扱われる',
        body: ['TypeScript の型互換性は名前ではなく「形」で決まります。これを構造的型付けと呼びます。',
          '別々に定義した型でも、プロパティの形が一致していれば代入できます。'],
        code: ['interface Point { x: number; y: number; }', 'const p = { x: 1, y: 2, z: 3 };', 'const q: Point = p; // 余分な z があってもOK'],
        note: '直接オブジェクトリテラルを代入する場合だけは「余分なプロパティ」がエラーになります（過剰プロパティチェック）。',
        ex: {
          file: 'point.ts', goal: '構造的型付けにそって Point インターフェースを宣言しよう',
          lines: [L('', ['interface', 'Point'], ' {'),
          L('  x', [':', 'number'], ';'),
          L('  y', [':', 'number'], ';'),
          L('}')],
          pool: ['type', 'class', 'string'],
          hint: 'オブジェクトの形を宣言するには interface を使います。',
          out: ['✓ 型チェックを通過しました', 'Point = { x, y }']
        }
      },
      {
        kicker: 'STEP 2', heading: 'オブジェクトの型はその場でも書ける',
        body: ['`interface` を作らず、`{ x: number; y: number }` のようにその場で型を書くこともできます。使い捨ての形にはこちらが便利です。'],
        code: ['function dist(p: { x: number; y: number }) {', '  return Math.sqrt(p.x ** 2 + p.y ** 2);', '}'],
        note: '同じ形を何度も書くなら interface か型エイリアスにまとめたほうが読みやすくなります。',
        ex: {
          file: 'point.ts', goal: 'その場で書いたオブジェクト型で関数を書こう',
          lines: [L('function dist(p', [':', '{ x: number; y: number }'], ') {'),
          L('  return Math.sqrt(p.x ** 2 + p.y ** 2);'), L('}')],
          pool: ['Point', 'void', 'any'],
          hint: 'interface を作らず、その場で { x: number; y: number } のように書けます。',
          out: ['✓ 型チェックを通過しました', 'dist({x:3,y:4}) → 5']
        }
      }
    ]
  },

  {
    num: '05', title: 'ユニオン型と型ガード', sub: '「どっちか」を安全にさばく',
    steps: [
      {
        kicker: 'STEP 1', heading: '「文字列か数値」をそのまま型にできる',
        body: ['`|` でつなぐと「どちらか」を表せます。JS でよくある「引数がどっちでも動く関数」を、そのまま型にできます。'],
        code: ['function show(v: string | number) {', '  // v は string かも number かも', '}'],
        note: 'この状態では `v.toUpperCase()` は書けません。number の可能性が残っているからです。',
        ex: {
          file: 'guard.ts', goal: 'ユニオン型で引数を受け取ろう',
          lines: [L('function show(v', [':', 'string', '|', 'number'], ') {', 1),
          L('  // v は string かも number かも'), L('}')],
          pool: ['&', 'boolean', 'any'],
          hint: '「どちらか」は | でつなぎます。',
          out: ['✓ 型チェックを通過しました', '型: string | number']
        }
      },
      {
        kicker: 'STEP 2', heading: 'if で絞ると、型も絞られる',
        body: ['`typeof v === "string"` のような判定を書くと、その中では v が string 型として扱われます。これが型ガードです。',
          'JS で普段書いている条件分岐が、そのまま型の絞り込みになります。'],
        code: ['if (typeof v === "string") {', '  return v.toUpperCase(); // OK', '}', 'return v.toFixed(1);'],
        note: 'if を抜けた後は number だと確定するので、toFixed が使えます。',
        ex: {
          file: 'guard.ts', goal: 'typeof で型を絞り込もう',
          lines: [L('function show(v: string | number) {'),
          L('  if (', ['typeof', 'v', '===', '"string"'], ') {'),
          L('    return v.toUpperCase();'),
          L('  }'),
          L('  return v.toFixed(1);'), L('}')],
          pool: ['instanceof', '"number"', '=='],
          hint: '2行目は typeof 演算子で v の中身を調べます。比較は厳密等価（イコール3つ）で。',
          out: ['✓ 型チェックを通過しました', 'show("ada") → "ADA"', 'show(1) → "1.0"']
        }
      }
    ]
  },

  {
    num: '06', title: '判別可能なユニオン型', sub: '共通の目印で型を見分ける',
    steps: [
      {
        kicker: 'STEP 1', heading: '共通の目印で型を見分ける',
        body: ['オブジェクトのユニオン型に、共通の「目印」となるプロパティ（判別子）を持たせると、if 文だけで型を安全に絞り込めます。',
          'ここでは `kind` というプロパティを目印にします。'],
        code: ['interface Circle { kind: "circle"; radius: number; }', 'interface Square { kind: "square"; side: number; }', 'type Shape = Circle | Square;'],
        note: '目印にはリテラル型（`"circle"` のような固定文字列）を使うのがポイントです。',
        ex: {
          file: 'shape.ts', goal: '判別子つきのユニオン型を作ろう',
          lines: [L('interface Circle { kind', [':', '"circle"'], '; radius: number; }'),
          L('interface Square { kind', [':', '"square"'], '; side: number; }'),
          L('type Shape', ['=', 'Circle', '|', 'Square'], ';', 1)],
          pool: ['string', 'extends', '&'],
          hint: '目印になるプロパティにはリテラル型を使います。ユニオンは | でつなぎます。',
          out: ['✓ 型チェックを通過しました', 'Shape = Circle | Square']
        }
      },
      {
        kicker: 'STEP 2', heading: 'switch でそのまま分岐できる',
        body: ['`shape.kind` で分岐すると、各 case の中では TypeScript が自動的に型を絞り込んでくれます。radius や side に安心してアクセスできます。'],
        code: ['function area(shape: Shape): number {', '  switch (shape.kind) {', '    case "circle": return Math.PI * shape.radius ** 2;', '    case "square": return shape.side ** 2;', '  }', '}'],
        note: 'if / else でも同じことができますが、選択肢が3つ以上になったら switch の方が読みやすくなります。',
        ex: {
          file: 'shape.ts', goal: 'switch で型を絞り込んで面積を計算しよう',
          lines: [L('function area(shape: Shape)', [':', 'number'], ' {'),
          L('  switch (shape.kind) {'),
          L('    case "circle": return Math.PI * shape.radius ** 2;'),
          L('    case "square": return shape.side ** 2;'),
          L('  }'), L('}')],
          pool: ['string', 'boolean', 'void'],
          hint: 'shape.kind で分岐すると、各 case の中で型が絞り込まれます。',
          out: ['✓ 型チェックを通過しました', 'area({kind:"circle",radius:2}) → 約12.57']
        }
      }
    ]
  },

  {
    num: '07', title: 'interface と type', sub: 'オブジェクトの「かたち」に名前をつける',
    steps: [
      {
        kicker: 'STEP 1', heading: '毎回書くのがつらい、を解決する',
        body: ['引数のオブジェクトに毎回 `{ id: number; name: string }` と書くのは大変。`interface` で名前をつけて使い回しましょう。'],
        code: ['interface User {', '  id: number;', '  name: string;', '  nickname?: string;', '}'],
        note: '`?:` は「あってもなくてもいい」。nickname の型は string | undefined になります。',
        ex: {
          file: 'user.ts', goal: 'User インターフェースを宣言しよう',
          lines: [L('', ['interface', 'User'], ' {'),
          L('  id', [':', 'number'], ';'),
          L('  name: string;'),
          L('  nickname', ['?:', 'string'], ';'),
          L('}')],
          pool: ['type', 'class', '!:'],
          hint: '?: は「あってもなくてもいい」という意味です。',
          out: ['✓ 型チェックを通過しました', 'User = { id, name, nickname? }']
        }
      },
      {
        kicker: 'STEP 2', heading: '型エイリアスとの使い分け',
        body: ['`type` はオブジェクト以外にも名前をつけられます。ユニオン型や関数型を扱うなら type が便利。',
          '迷ったら「オブジェクトの形は interface、それ以外は type」で困りません。'],
        code: ['type Role = "admin" | "member";', 'type Formatter = (u: User) => string;'],
        note: 'interface は同じ名前で後から追加できる（宣言のマージ）という違いもあります。',
        ex: {
          file: 'user.ts', goal: 'type エイリアスでユニオン型と関数型に名前をつけよう',
          lines: [L('type Role', ['=', '"admin"', '|', '"member"'], ';', 1),
          L('type Formatter', ['=', '(u: User) => string'], ';')],
          pool: ['interface', 'Role[]', 'boolean'],
          hint: 'オブジェクトの形は interface、それ以外は type で困りません。',
          out: ['✓ 型チェックを通過しました', 'Role = "admin" | "member"']
        }
      }
    ]
  },

  {
    num: '08', title: '型アサーションと as const', sub: '「これはこの型」と伝える',
    steps: [
      {
        kicker: 'STEP 1', heading: '「これは絶対この型」と伝える as',
        body: ['TypeScript が推論できない場面で、開発者側から「この値はこの型として扱って」と伝えるのが型アサーションです。`as` を使います。',
          '間違った型を主張すると実行時エラーの原因になるので、多用は禁物です。'],
        code: ['const el = document.getElementById("app") as HTMLDivElement;', 'el.style.color = "red";'],
        note: '`<HTMLDivElement>el` という書き方もありますが、JSX と衝突するので `as` の方が主流です。',
        ex: {
          file: 'assertion.ts', goal: 'as で型アサーションをしよう',
          lines: [L('const el = document.getElementById("app")', ['as', 'HTMLDivElement'], ';'),
          L('el.style.color = "red";')],
          pool: ['unknown', 'typeof', 'keyof'],
          hint: '「この値はこの型として扱って」と伝えるときは as を使います。',
          out: ['✓ 型チェックを通過しました', 'el.style.color → "red"']
        }
      },
      {
        kicker: 'STEP 2', heading: '配列やオブジェクトを固定する as const',
        body: ['`as const` をつけると、配列やオブジェクトのリテラルがそれぞれの値のまま「読み取り専用」で固定されます。',
          'ユニオン型の元ネタとしてもよく使われます。'],
        code: ['const colors = ["red", "green", "blue"] as const;', 'type Color = typeof colors[number]; // "red" | "green" | "blue"'],
        note: 'as const を外すと colors の型はただの string[] になり、要素の絞り込みが失われます。',
        ex: {
          file: 'assertion.ts', goal: 'as const でユニオン型のもとになる配列を作ろう',
          lines: [L('const colors', ['=', '["red", "green", "blue"]', 'as const'], ';'),
          L('type Color', ['=', 'typeof colors[number]'], ';'),
          L('let picked', [':', 'Color'], ' = "green";'),
          L('picked = "yellow"; // ← 型エラーになる想定')],
          pool: ['string[]', 'keyof', 'Array<string>', 'as any', 'unknown'],
          hint: '配列を固定するには as const。そこから取り出したユニオン型は typeof 配列名[number] という形で作れます。',
          out: ['✓ 型チェックを通過しました', 'picked → "green"']
        }
      }
    ]
  },

  {
    num: '09', title: 'クラスと interface の実装', sub: '「守るべき形」を約束する',
    steps: [
      {
        kicker: 'STEP 1', heading: 'クラスに型を足すと、プロパティも安全になる',
        body: ['TypeScript のクラスはプロパティに型注釈をつけられます。コンストラクタで初期化を忘れるとエラーで教えてくれます。'],
        code: ['class User {', '  name: string;', '  constructor(name: string) {', '    this.name = name;', '  }', '}'],
        note: '`constructor(private name: string) {}` のように書くと、プロパティ宣言と代入を1行にまとめられます。',
        ex: {
          file: 'user-class.ts', goal: 'クラスのプロパティに型をつけよう',
          lines: [L('class User {'),
          L('  name', [':', 'string'], ';'),
          L('  constructor(name: string) {'),
          L('    this.name = name;'),
          L('  }'), L('}')],
          pool: ['number', 'boolean', 'private'],
          hint: 'プロパティにも通常の変数と同じように型注釈をつけられます。',
          out: ['✓ 型チェックを通過しました', 'new User("ada").name → "ada"']
        }
      },
      {
        kicker: 'STEP 2', heading: 'interface で「守るべき形」を約束する',
        body: ['`implements` を使うと、クラスが interface の形を満たしているかチェックしてくれます。メソッドの実装漏れもすぐ分かります。'],
        code: ['interface Greetable {', '  greet(): string;', '}', 'class User implements Greetable {', '  greet() { return "hi"; }', '}'],
        note: 'interface 自体は実装を持たず「約束」だけを表します。実装するのはクラス側の役目です。',
        ex: {
          file: 'user-class.ts', goal: 'interface を実装するクラスを書こう',
          lines: [L('interface Greetable {'),
          L('  greet()', [':', 'string'], ';'),
          L('}'),
          L('class User', ['implements', 'Greetable'], ' {'),
          L('  constructor(private name', [':', 'string'], ') {}'),
          L('  greet()', [':', 'string'], ' {'),
          L('    return `hi, ${this.name}`;'),
          L('  }'), L('}')],
          pool: ['extends', 'public', 'void', 'abstract', 'number'],
          hint: 'クラスが interface を満たすときは implements。メソッドの戻り値は string です。',
          out: ['✓ 型チェックを通過しました', 'new User("ada").greet() → "hi, ada"']
        }
      }
    ]
  },

  {
    num: '10', title: 'アクセス修飾子と readonly', sub: '公開範囲と書き換え不可を約束する',
    steps: [
      {
        kicker: 'STEP 1', heading: '外から触れる範囲を決める「アクセス修飾子」',
        body: ['クラスのプロパティやメソッドには public・private・protected をつけて、外から触れてよい範囲を決められます。',
          '何もつけなければ public 扱いになります。'],
        code: ['class Wallet {', '  private balance: number = 0;', '  deposit(amount: number) {', '    this.balance += amount;', '  }', '}'],
        note: '`private` は同じクラスの中だけ、`protected` はそのクラスと継承先のクラスの中まで、`public` はどこからでもアクセスできます。',
        ex: {
          file: 'wallet.ts', goal: 'private でプロパティを守ろう',
          lines: [L('class Wallet {'),
          L('  ', ['private', 'balance'], ': number;'),
          L('  constructor(amount: number) {'),
          L('    this.balance = amount;'),
          L('  }'),
          L('  deposit(amount: number)', [':', 'void'], ' {'),
          L('    this.balance += amount;'),
          L('  }'), L('}')],
          pool: ['public', 'protected', 'number'],
          hint: '外から触られたくないプロパティには private をつけます。戻り値がないメソッドは void です。',
          out: ['✓ 型チェックを通過しました', 'new Wallet(0).deposit(100)']
        }
      },
      {
        kicker: 'STEP 2', heading: '書き換えさせたくないなら readonly',
        body: ['コンストラクタで一度だけ値を入れて、あとは変更させたくないプロパティには readonly をつけます。',
          'アクセス修飾子と組み合わせて `private readonly owner: string` のようにも書けます。'],
        code: ['class User {', '  readonly id: string;', '  constructor(id: string) {', '    this.id = id;', '  }', '}', 'const u = new User("u1");', 'u.id = "u2"; // ← ここで怒られる'],
        note: 'readonly はコンパイル時のチェックです。実行時に書き換えを止めているわけではありません。',
        ex: {
          file: 'user-readonly.ts', goal: 'private readonly で書き換え不可にしよう',
          lines: [L('class User {'),
          L('  ', ['private', 'readonly', 'id'], ': string;'),
          L('  constructor(id: string) {'),
          L('    this.id = id;'),
          L('  }'), L('}')],
          pool: ['public', 'protected', 'number'],
          hint: '一度入れたら変更させたくない値には readonly を。アクセス修飾子と組み合わせて private readonly のように書けます。',
          out: ['✓ 型チェックを通過しました', 'new User("u1").id → "u1"']
        }
      }
    ]
  },

  {
    num: '11', title: '継承と抽象クラス', sub: '共通の振る舞いを親クラスにまとめる',
    steps: [
      {
        kicker: 'STEP 1', heading: 'extends で親クラスの機能を引き継ぐ',
        body: ['クラスは `extends` で他のクラスを継承できます。親クラスのプロパティやメソッドをそのまま使えます。',
          '親のコンストラクタを呼ぶには `super(...)` を使います。'],
        code: ['class Animal {', '  constructor(public name: string) {}', '  speak() { return "..."; }', '}', 'class Dog extends Animal {', '  speak() { return `${this.name}: bow!`; }', '}'],
        note: 'サブクラスのコンストラクタの中で `super()` を呼ぶ前は this を使えません。',
        ex: {
          file: 'animals.ts', goal: 'extends でクラスを継承しよう',
          lines: [L('class Animal {'),
          L('  constructor(public name: string) {}'),
          L('  speak() { return "..."; }'),
          L('}'),
          L('class Dog', ['extends', 'Animal'], ' {'),
          L('  speak() { return `${this.name}: bow!`; }'),
          L('}')],
          pool: ['implements', 'interface', 'super'],
          hint: '親クラスを継承するには extends を使います。',
          out: ['✓ 型チェックを通過しました', 'new Dog("pochi").speak() → "pochi: bow!"']
        }
      },
      {
        kicker: 'STEP 2', heading: '中身を持たない「約束」だけのクラス：抽象クラス',
        body: ['`abstract class` は new できません。共通の実装をまとめつつ、一部のメソッドをサブクラスに実装させたいときに使います。',
          '`abstract` を付けたメソッドは中身を書かず、サブクラス側で実装します。'],
        code: ['abstract class Shape {', '  abstract area(): number;', '  describe() { return `area: ${this.area()}`; }', '}', 'class Circle extends Shape {', '  constructor(private radius: number) { super(); }', '  area() { return Math.PI * this.radius ** 2; }', '}'],
        note: '抽象クラスは interface と似ていますが、実装済みのメソッド（ここでは describe）も一緒に持たせられるのが違いです。',
        ex: {
          file: 'shapes.ts', goal: '抽象クラスを継承して面積を計算しよう',
          lines: [L('', ['abstract', 'class'], ' Shape {'),
          L('  ', ['abstract'], ' area(): number;'),
          L('  describe()', [':', 'string'], ' {'),
          L('    return `area: ${this.area()}`;'),
          L('  }'), L('}'),
          L('class Square', ['extends', 'Shape'], ' {'),
          L('  constructor(private side: number) {'),
          L('    super();'),
          L('  }'),
          L('  area()', [':', 'number'], ' {'),
          L('    return this.side ** 2;'),
          L('  }'), L('}')],
          pool: ['interface', 'implements', 'protected', 'void', 'static'],
          hint: '抽象クラスは abstract class、抽象メソッドは先頭に abstract だけをつけます。Square は Shape を継承するので extends Shape。',
          out: ['✓ 型チェックを通過しました', 'new Square(4).describe() → "area: 16"']
        }
      }
    ]
  },

  {
    num: '12', title: 'ジェネリクス入門', sub: '型そのものを引数として渡す',
    steps: [
      {
        kicker: 'STEP 1', heading: 'any にすると、型が消える',
        body: ['配列の先頭を返す関数を `any` で書くと、呼び出し側で型が分からなくなります。せっかくの補完も効きません。',
          'まずは string 専用の版から書いてみましょう。'],
        code: ['function first(items: any[]): any {', '  return items[0];', '}', 'const s = first(tags); // any…'],
        note: '`any` は「チェックしないで」の宣言。使うほど TS の旨みが減っていきます。',
        ex: {
          file: 'generic.ts', goal: 'まずは string 専用の first 関数を書こう',
          lines: [L('function first(items', [':', 'string[]'], '): string {'),
          L('  return items[0];'), L('}')],
          pool: ['any', 'number[]', 'void'],
          hint: '配列の要素を返す関数なので、戻り値の型は要素の型と同じです。',
          out: ['✓ 型チェックを通過しました', 'first(["ts","js"]) → "ts"']
        }
      },
      {
        kicker: 'STEP 2', heading: '型を受け取って、そのまま返す',
        body: ['`<T>` と書くと、呼び出し時の型（型変数）を受け取って引数と戻り値で使い回せます。string を渡せば string が返ります。',
          'T はただの名前。慣習で T が使われているだけです。'],
        code: ['function first<T>(items: T[]): T | undefined {', '  return items[0];', '}'],
        note: '空配列なら何も返らないので、戻り値に `undefined` を足しておくのが安全です。',
        ex: {
          file: 'generic.ts', goal: '型を受け取る関数に書きかえよう',
          lines: [L('function first', ['<', 'T', '>'], '(items: T[]): T | undefined {'),
          L('  return items[0];'), L('}'),
          L('const s', [':', 'string', '|', 'undefined'], ' = first(tags);', 1)],
          pool: ['any', 'K', '[', ']', 'null', 'number'],
          hint: '山かっこで型を受け取ります。最後の行は first(tags) が返しうる型をそのまま書きます。',
          out: ['✓ 型チェックを通過しました', 'first(["ts","js"]) → "ts"']
        }
      }
    ]
  },

  {
    num: '13', title: '型引数の制約と keyof', sub: '「どんな型でもいい」を少しだけ絞る',
    steps: [
      {
        kicker: 'STEP 1', heading: '「どんな型でもいい」を少しだけ絞る',
        body: ['ジェネリクスの型変数 T は、そのままだと本当に何でも受け取れてしまいます。`extends` で制約をつけると、必要なプロパティを持つ型だけに絞れます。'],
        code: ['function getLength<T extends { length: number }>(x: T) {', '  return x.length;', '}', 'getLength("hi"); // OK: string は length を持つ', 'getLength(3); // ← number には length がない'],
        note: 'ここでの `extends` は継承ではなく「この形を満たすこと」という制約の意味で使われています。',
        ex: {
          file: 'safe-get.ts', goal: '型引数に制約をつけよう',
          lines: [L('function getLength<T', ['extends', '{ length: number }'], '>(x: T) {'),
          L('  return x.length;'), L('}')],
          pool: ['implements', 'keyof T', 'in'],
          hint: '「この形を満たすこと」という制約は extends で書きます。',
          out: ['✓ 型チェックを通過しました', 'getLength("hi") → 2']
        }
      },
      {
        kicker: 'STEP 2', heading: 'keyof で「持っているキー」を型にする',
        body: ['`keyof T` は、オブジェクト型 T のプロパティ名をユニオン型として取り出します。安全にプロパティへアクセスする関数が書けます。'],
        code: ['function get<T, K extends keyof T>(obj: T, key: K) {', '  return obj[key];', '}', 'get({ id: 1, name: "ada" }, "name"); // OK', 'get({ id: 1, name: "ada" }, "age"); // ← 存在しないキー'],
        note: 'K を keyof T で制約しているので、存在しないキー名を渡すとその場でエラーになります。',
        ex: {
          file: 'safe-get.ts', goal: 'keyof で制約したジェネリクス関数を書こう',
          lines: [L('function get<T, K', ['extends', 'keyof T'], '>(obj: T, key: K) {'),
          L('  return obj[key];'),
          L('}'),
          L('const user', ['=', '{ id: 1, name: "ada" }'], ';'),
          L('get(user', [',', '"name"'], ');')],
          pool: ['implements', 'typeof T', 'in', 'K[]', '"email"'],
          hint: 'K を制約するには T のキー一覧、つまり keyof T を使います。',
          out: ['✓ 型チェックを通過しました', 'get(user, "name") → "ada"']
        }
      }
    ]
  },

  {
    num: '14', title: 'ユーティリティ型で楽をする', sub: '型から型を作る',
    steps: [
      {
        kicker: 'STEP 1', heading: '毎回書かなくても、型から型を作れる',
        body: ['TypeScript には既存の型を変形させるユーティリティ型が標準で用意されています。よく使うのは Partial・Pick・Omit の3つです。'],
        code: ['interface User { id: number; name: string; email: string; }', 'type DraftUser = Partial<User>; // 全部のプロパティが省略可能に', 'type UserPreview = Pick<User, "id" | "name">; // id と name だけ'],
        note: '`Partial<User>` は「User だけど全部 ? つき」という意味になります。フォームの入力途中を表すのに便利です。',
        ex: {
          file: 'utility.ts', goal: 'Partial と Pick で型を作ろう',
          lines: [L('interface User { id: number; name: string; email: string; }'),
          L('type DraftUser', ['=', 'Partial<User>'], ';'),
          L('type UserPreview', ['=', 'Pick<User', ',', '"id" | "name">'], ';')],
          pool: ['Omit<User', 'Required<User>', 'keyof User'],
          hint: '全部省略可 → Partial。一部だけ残す → Pick。',
          out: ['✓ 型チェックを通過しました', 'DraftUser = { id?, name?, email? }']
        }
      },
      {
        kicker: 'STEP 2', heading: 'Omit で「これ以外」を型にする',
        body: ['Pick が「これだけ残す」なのに対し、Omit は「これを除いた残り全部」を型にします。パスワードなど見せたくないフィールドを除くのに向いています。'],
        code: ['type PublicUser = Omit<User, "email">;', 'const preview: PublicUser = { id: 1, name: "ada" };'],
        note: 'Record<K, V> も覚えておくと便利です。「キーが K、値が V のオブジェクト」をまとめて表せます。',
        ex: {
          file: 'utility.ts', goal: 'Omit で除外した型を作ろう',
          lines: [L('type PublicUser', ['=', 'Omit<User', ',', '"email">'], ';')],
          pool: ['Pick<User', 'Record<User>', 'in'],
          hint: 'これを除いた残り全部、というときは Omit です。',
          out: ['✓ 型チェックを通過しました', 'PublicUser = { id, name }']
        }
      }
    ]
  },

  {
    num: '15', title: 'JS を TS に書きかえる', sub: '仕上げ：実務っぽいコードで練習',
    steps: [
      {
        kicker: 'STEP 1', heading: 'いつもの reduce に、型をつける',
        body: ['ここまでの道具で、実際の JS 関数を書きかえます。まずは対象のコードを見てみましょう。'],
        code: ['function total(items) {', '  return items.reduce(', '    (sum, item) => sum + item.price,', '    0', '  );', '}'],
        note: 'items が何の配列なのか、コードからは分かりません。ここに型をつけていきます。',
        ex: {
          file: 'cart.ts', goal: '配列の引数に型をつけよう',
          lines: [L('function total(items', [':', 'Item', '[]'], ') {'),
          L('  return items.reduce('),
          L('    (sum, item) => sum + item.price,'),
          L('    0'), L('  );'), L('}')],
          pool: ['any', 'string', 'object'],
          hint: '配列は「型[]」の形で書きます。`Item` という interface はすでにある前提です。',
          out: ['✓ 型チェックを通過しました', 'total(cart) → 4200']
        }
      },
      {
        kicker: 'STEP 2', heading: '外側から順に埋めていく',
        body: ['引数 → コールバックの引数 → 戻り値、の順で考えるとラクです。`Item` という interface はすでにある前提。'],
        code: ['interface Item {', '  name: string;', '  price: number;', '}'],
        note: 'sum に number をつけると、reduce の初期値 0 とも噛み合って全体が number に確定します。',
        ex: {
          file: 'cart.ts', goal: 'コールバックの引数にも型をつけよう',
          lines: [L('function total(items: Item[]) {'),
          L('  return items.reduce('),
          L('    (sum', [':', 'number', ',', 'item', ':', 'Item'], ') => sum + item.price,'),
          L('    0'), L('  );'), L('}')],
          pool: ['any', 'string', 'price'],
          hint: 'コールバックは (合計, 要素) の順に受け取ります。',
          out: ['✓ 型チェックを通過しました', 'total(cart) → 4200']
        }
      }
    ]
  }
];
