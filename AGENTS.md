<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# このリポジトリは universal-io の2つのうちの1つ（毎セッション必読）

`/Users/kaya.matsumoto/projects/universal-io/` の下に**独立した2つのgitリポジトリ**がある。

| パス | 中身 | `main` へのpushが意味すること |
|---|---|---|
| `web-product` | 製品サイト（このリポジトリ） | `universal-io.com` の本番デプロイ |
| `app-mac` | macOSアプリ ＋ Gateway（`web/`） | `api.universal-io.com` の本番デプロイ |

**エージェントのシェルの既定作業ディレクトリは `app-mac` の側で、コマンドごとにそこへ戻る。**
`cd` した直後でも次のコマンドでは `app-mac` にいるため、裸の
`git add -A && git commit` は**このリポジトリではなく `app-mac` にコミットされる**。

実際に2026-08-02〜03のセッションで、このリポジトリ向けのコミットが2回
`app-mac` に入った（どちらも `git reset --soft` で取り消し済み）。

規則:

- **gitは必ず `git -C /Users/kaya.matsumoto/projects/universal-io/web-product` を使う。**
  `cd` してから裸の `git` を打たない。
- npmも `cd <パス> && npm run ...` を1コマンド内で完結させる。
- コミット前に `git -C <パス> status --short` で、想定したファイルだけが載っているか確認する。

なお `app-mac` 側にも `web/` という Next.js プロジェクトがある（Gateway＝API・認証専用で、
製品サイトではない）。「Next.jsの方」だけでは特定できないので、必ずパスで判断する。
