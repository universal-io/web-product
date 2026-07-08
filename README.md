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

## Vision版(v2)ヒーローセクション — /vision

投資家・仲間集め向けに、技術的制約を取り払った「あるべき姿」を提示するビジョンモックアップ。
現行サイトとは別ルートで共存し、`/vision`（英語）/ `/ja/vision`（日本語）からアクセスできる。

- **コンセプト**: 「こころに杖とメガネを」— 能力・言語・文化・経験・知識のギャップを滑らかにする、
  ユーザーとあらゆるツールの間に存在する「薄いガラスの膜」としての Universal I/O
- **フォント**: General Sans（Fontshare、`src/fonts/` に自己ホスト）/ LINE Seed JP（next/font/google）。
  既存ページのフォント（Geist / Noto Sans JP）には影響しない、`/vision` 専用の layout.tsx でスコープ
- **背景**: `public/vision/hero-bg.webp`（デスクトップ）/ `hero-bg-portrait.webp`（モバイル）。
  `<picture><source>` によるアートディレクションで、ビューポートに応じた画像のみをダウンロードする。
  ゆっくりとした Ken Burns 効果（20秒で scale 1.0→1.06）付き。`prefers-reduced-motion` で停止
- **主要コンポーネント**:
  - `src/components/vision/VisionHero.tsx` — 背景・ナビ・コピー・CTA
  - `src/components/vision/MembranePanel.tsx` — 「膜パネル」。プログレッシブブラーのすりガラス表現、
    声の波形・トーンリング・エネルギーゲージ・話者関係性などのライブ計測 UI（すべてフィクション）、
    ガイドモード（Shift 2回でスクリーンを読み取る）を訴求する黒カード
- **アニメーション**: `motion`（旧 framer-motion）。カーソル追従のスペキュラーハイライト、
  呼吸するようなゲージ、入場時の stagger fade-up。すべて `prefers-reduced-motion` 対応
- **翻訳**: `messages/{en,ja}.json` の `vision` ネームスペースにすべての文言を格納（ハードコード無し）
- **画像最適化に関する注意**: `public/vision/*.webp` を差し替えても、`next/image` の最適化キャッシュ
  （`.next/cache/images/`）が古い版を返し続けることがある。差し替え後に反映されない場合は
  `rm -rf .next` してから `npm run dev` を再起動する

**今後の展開(構想)**: 現在の膜パネルはヒーロー直下の「2ページ目」の要素として独立させ、
ヒーロー自体には入力窓を新設。ユーザーの入力 → レビュー → アプリ画面が表示され、それを解釈した
膜パネルがコパイロットとして操作をガイドする、という一連の流れを同一トーンでアニメーション提示する予定。

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
- [ ] 会社概要（/company）・プライバシーポリシー（/privacy）・利用規約（/terms）は**ダミー内容**。公開前に正式な内容へ差し替える
