# slack_bot_lab
研究室用に作ったbotの進捗管理・備忘録

## 使用技術
* Slack API
* Google Apps Script (Github上ではJavaScriptとして置いた)

## Bot基本機能
* おうむがえし (チュートリアルがてら作成)
* 時間トリガーによる，Google Calendarの通知機能
### 今後つけたい機能
* OpenAI APIの導入により，Slack上で自然言語でスケジュールの登録・閲覧を可能にする．
* 会話中から予定やTODOを拾ってカレンダーに登録するかを聞く
* Slack workspace内の絵文字ランキング
* このコードをClaspを使ってGit管理する

## Botとは直接関係ない機能 (add_schedule.gs)
* Spreadsheetでゼミの予定をGoogle Calendarに一括登録するためのGAS

(spreadsheetの見た目)
<img width="891" alt="image" src="https://github.com/saaaya-11/slack_bot_lab/assets/39193854/e02cfe0e-a8ff-42af-bb6d-01e97dfcc405">

## 参考にしたサイト
* https://ocomoji.co.jp/knowledge_01
* https://designmemo.jp/2017/05/bot-googlecalendar-mmost.html
