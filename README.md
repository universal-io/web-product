# Universal I/O — 製品サイト

universal-io.com の製品ランディングページ。
`mockup/Universal IO Landing.dc.html`（Claude デザインのモックアップ）を正として再現し、
多言語対応・モバイル最適化を加えたもの。

## 技術スタック

- **Next.js 16**（App Router / Turbopack / SSG）
- **Tailwind CSS v4**（デザイントークンは `src/app/globals.css` の `@theme` に定義）
- **next-intl v4**（多言語。`/` = 英語、`/ja` = 日本語）
- フォント: Geist / Geist Mono / Noto Sans JP（next/font 経由）

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド（/en /ja を静的生成）
npm run lint
```

## ディレクトリ

```
mockup/               # Claude デザインのモックアップ（参照用。lint 対象外）
messages/             # 翻訳ファイル（en.json / ja.json）
src/
  app/[locale]/       # ページ・レイアウト（locale ごとに静的生成）
  app/sitemap.ts      # サイトマップ（hreflang 付き）
  app/robots.ts
  components/         # セクションごとのコンポーネント
  i18n/               # next-intl 設定（routing / navigation / request）
  proxy.ts            # ロケール判定ミドルウェア
```

## 言語の追加方法（韓国語・中国語など）

1. `src/i18n/routing.ts` の `locales` にロケールを追加（例: `"ko"`, `"zh-CN"`, `"zh-TW"`）
2. `localeNames` に表示名を追加（例: `ko: "한국어"`）
3. `messages/<locale>.json` を `en.json` をベースに作成
4. 必要なら `src/app/[locale]/layout.tsx` の `alternates.languages` に追記

これだけで言語スイッチャー・サイトマップ・静的生成に自動反映される。

## デプロイ（Vercel）

1. GitHub リポジトリ（`universal-io/web-product`）を Vercel にインポート
2. フレームワークは Next.js として自動検出される（設定変更不要）
3. ドメイン `universal-io.com` を Vercel プロジェクトに割り当てる

## TODO

- [ ] 早期アクセスフォームの送信先（現在はフロントのみで成功表示。Supabase / Resend / フォームサービス等に接続する）
- [ ] OG 画像の追加
- [ ] ko / zh-CN / zh-TW の翻訳追加
