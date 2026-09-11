# 勤務表作成ツール

ブラウザだけで動く、月次勤務表の作成・集計ツールです。サーバーやビルド不要の
純粋な HTML / CSS / JavaScript で作られており、GitHub Pages でそのまま公開できます。

## 使い方

1. [index.html](index.html) をブラウザで開く（または公開後のURLにアクセスする）
2. 氏名・対象年月・既定の休憩時間を入力し「勤務表を作成」を押す
3. 各日の出勤時刻・退勤時刻・休憩時間・備考を入力する
4. 実働時間と月合計が自動で計算される
5. 「印刷 / PDF出力」でそのまま印刷、またはPDFとして保存できる

入力内容はブラウザの `localStorage` にのみ保存され、外部には送信されません。

## ローカルで確認する

このプロジェクトはビルド不要です。`index.html` をブラウザで直接開くか、
簡易サーバーを立てて確認できます。

```bash
# Node.js がある場合
npx serve .

# Python がある場合
python -m http.server 8000
```

## GitHub Pages で公開する

1. GitHubのリポジトリページで **Settings > Pages** を開く
2. 「Source」を `Deploy from a branch` に設定し、ブランチを `main` / フォルダを `/ (root)` に指定して保存
3. しばらく待つと `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

## ファイル構成

- [index.html](index.html) — ページ本体
- [style.css](style.css) — スタイル
- [script.js](script.js) — 勤務表の生成・計算・保存ロジック
