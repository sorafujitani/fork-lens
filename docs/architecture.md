# Architecture

Fork Lensは、公開GitHubリポジトリのforkにある独自の変更を要約し、自分のforkへ取り込むためのプロンプトを作るWebアプリ。
初期構成はCloudflareにまとめ、解析結果の再利用で運用費を抑える。

## 構成

| 用途 | サービス | 役割 |
| --- | --- | --- |
| 画面・API | Cloudflare Workers | 画面配信、GitHub APIからの情報取得、解析の受付 |
| DB | Cloudflare D1 | リポジトリ情報、解析状態、要約、根拠となるコミット・ファイル、利用回数の保存 |
| AI | Cloudflare Workers AI | コード差分から機能や変更の説明を生成 |
| 大きなファイルの保存 | Cloudflare R2 | 大きな差分の保存が必要になったら追加 |

AIモデルはGLM-4.7-Flashを候補とし、実際の差分で要約の正確さを確認してから決める。

## 処理の流れ

1. ユーザーがupstreamと調べたいforkを指定する。
2. WorkersがGitHub APIからリポジトリ情報と差分を取得する。
3. D1に同じ差分・解析条件の結果があれば再利用する。なければWorkers AIで解析し、要約と根拠を保存する。
4. ユーザーが取り込みたい変更と、自分のforkを指定する。
5. 保存済みの要約・参照コミット・取り込み先URLをテンプレートに埋め込み、プロンプトを生成する。

取り込み先のコードに合わせた詳細な適合性チェックは、必要なときに追加解析する。

## 費用を抑える設計

- AI解析はユーザーが選んだforkだけ実行する。
- upstreamとforkのコミットSHA、モデル・プロンプトなどの解析条件をキーに結果を保存する。
- 公開リポジトリの共通の要約は利用者間で再利用し、取り込み先ごとの情報は別に扱う。
- 閲覧やプロンプトのコピーではAIを呼ばない。
- 差分サイズ、出力トークン数、再試行回数、利用者ごと・サービス全体の新規解析数に上限を設ける。大きな差分を一部だけ解析した場合は、その範囲を表示する。

## 予算の考え方

試作は無料枠から始める。Workers無料枠のCPU時間は1回あたり10msなので、差分の加工が収まるか実測する。
必要に応じてWorkers Paidへ移行し、月$5からの基本料金と、各サービスの含有枠を超えた従量料金を見込む。
AI費用は閲覧数よりも、新しく解析する差分の量と回数に左右される。

料金・制限の確認先（2026-11-15確認）：

- Workers: https://developers.cloudflare.com/workers/platform/pricing/
- D1: https://developers.cloudflare.com/d1/platform/pricing/
- D1の容量制限: https://developers.cloudflare.com/d1/platform/limits/
- Workers AI: https://developers.cloudflare.com/workers-ai/platform/pricing/
- GLM-4.7-Flash: https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/
