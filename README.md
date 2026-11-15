# Fork Lens

公開 GitHub リポジトリの fork にある独自の変更を整理する Web アプリ。現在は開発基盤と接続確認用 API のみ実装しています。

## 構成

- `apps/web`: React + Vite+。静的ファイルを配信する Worker が `/api/*` を API Worker に転送。
- `apps/api`: Hono + Hono CLI。D1 と Workers AI の binding を持つ独立した Worker。
- `packages/db`: Drizzle ORM の D1 クライアント、スキーマ、SQL マイグレーション。
- Bun workspaces と Turborepo で依存関係・タスクを管理。
- Vite+ に同梱される Oxlint、Oxfmt、Vitest を使用。`bunfig.toml` は isolated 配置を使用します。Oxc の依存解決をリポジトリ内に固定するため、Oxlint・Oxfmt は Vite+ 同梱版と同じバージョンをルートにも指定しています。

## 開発

Node.js 24 と Bun 1.4.4 を使用します。Nix を使う場合は `direnv allow`（direnv の shell hook が必要）、または `nix develop` で開発環境に入れます。Nix のパッケージは `flake.lock` で固定します。

```sh
bun install --frozen-lockfile
bun run db:migrate:local
bun run dev
```

Web は http://localhost:5173 、API は http://localhost:8787/api/health です。Web の `/api/*` は開発時もデプロイ時も Service Binding を通ります。`/api/health` は起動状態、`/api/ready` は D1 接続を確認します。

```sh
bun run check          # format、lint、型チェック、テスト
bun run build          # Web ビルドと両 Worker の Cloudflare Build Output 生成
bun run format         # Oxfmt
bun run db:generate    # スキーマ変更から SQL を生成
bun run db:migrate:local
bun run --cwd apps/api request -P /api/health
```

Vitest と Miniflare で、ビルド済み API Worker、ローカル D1、マイグレーションを検証します。Web Worker の転送処理もテストします。テスト前のビルドは Turborepo が実行します。

Cloudflare の binding 型は `bun run typecheck` で生成します。`cloudflare.config.ts`を変更したときも実行してください。

## Workers でのローカル確認

`bun run build` の後、別々のターミナルで以下を起動します。

```sh
bun run --cwd apps/api dev
bun run --cwd apps/web preview
```

http://localhost:8788/api/ready で Service Binding を通した D1 接続を確認できます。

## デプロイ

Web と API は別の Worker です。API は `workersDev: false` とし、Web から Service Binding でアクセスします。

最初に Cloudflare へログインして D1 を作成し、出力された `database_id` を `apps/api/cloudflare.config.ts` の仮 ID と置き換えます。

```sh
cd apps/api
bunx cf auth login
bunx cf d1 create --name fork-lens
cd ../..
```

マイグレーション、API、Web の順に実行します。

```sh
bun run --cwd apps/api db:migrate:remote <DATABASE_ID>
bun run deploy:api
bun run deploy:web
```

Workers AI は `env.AI` から使用できます。モデルの選定と解析処理は未実装です。AI 推論はローカル開発時も Cloudflare 側で実行されるため、開発用 Vite plugin は `remoteBindings: false` とし、テストでは AI を呼びません。実際に AI を試す場合は別途リモート binding を有効にしてください。

ローカルの秘密情報は各アプリの `.dev.vars` に置きます。Git 管理の対象外です。CI は認証情報なしで検証のみ行います。

Cloudflare CLI (`cf`) と Cloudflare Vite plugin 2 は beta のため、動作確認済みの版を固定しています。設定は各アプリの `cloudflare.config.ts`、ビルド成果物・型・ローカル D1 は `.cloudflare/` に置かれます。旧 `.wrangler/` のローカルデータは自動移行されません。ローカル D1 の ID は `db:migrate:local` と API 設定で揃えてください。

## 参考

- 設計: [docs/architecture.md](docs/architecture.md)
- Vite+: https://www.viteplus.dev/guide/monorepo
- Hono CLI: https://hono.dev/docs/agents/cli
- Cloudflare CLI: https://developers.cloudflare.com/cf/
- D1 とローカルデータ: https://developers.cloudflare.com/cf/projects/#local-resource-data
- Workers AI: https://developers.cloudflare.com/workers-ai/configuration/bindings/
