const MENTION_CALENDAR = /<.*>/g
const CHANNEL_ID= PropertiesService.getScriptProperties().getProperty("CHANNEL_ID_CALENDAR_APP")
// 参考にしたサイト：https://ocomoji.co.jp/knowledge_01
//Slackからの投稿を受け取る
//**********  START Main **********
function doPost(e) {
  //受信データをパース（解析してデータを抽出）
  const postParam = JSON.parse(e.postData.getDataAsString());
  
  //Challenge認証用

  //1.この認証処理はNG
  /*
  if (postParam.type === 'url_verification') {
    return ContentService.createTextOutput(postParam.challenge);
  }
  */

  //2.この認証処理だとOK
  if('challenge' in postParam){
    return ContentService.createTextOutput(postParam.challenge);
  }
  
  //3.Slackで投稿したチャンネルへ文を返す
  //sendSlack(postParam.event.channel, 'Slackから投稿キャッチ！GASから返信するよ！');

  //イベント再送回避
  //キャッシュに積まれていれば処理済
  //未処理の場合はキャッシュに積む（有効期間5m）
  const event_id = postParam.event_id;
  const cache = CacheService.getScriptCache();
  const isProcessed = cache.get(event_id);

  if (isProcessed) return;

  cache.put(event_id, true, 601);

  //サブタイプが設定されたイベント
  if('subtype' in postParam.event) return;

  //ChatGPTBotが送信した場合
  //ChatGPTで応答メッセージを作成し、Slackに送信する
  const botId = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_ID');
  if (postParam.event && postParam.event.user !== botId) {
    const channel = postParam.event.channel;
    const text = postParam.event.text;
    var message = deleteMention(text); // todo
    //s = listupEvent("shimada.lab.kyutech@gmail.com");
    sendSlack(channel, message); 
  }

  return;
}
//**********  END MAIN **********


//**********  START SlackBotsを通してメッセージを送信する **********
//20230301 これ単体では動作することを確認済
function sendSlack(channel, message="default") {
  const slackToken = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  const slackApp = SlackApp.create(slackToken);
  slackApp.chatPostMessage(channel, message);
}
//**********  END SlackBotsを通してメッセージを送信する **********
function deleteMention(text){
  const without_calendar=text.replace(MENTION_CALENDAR,'');
  console.log(without_calendar)
  return without_calendar;
}

// 参考にしたサイト: https://designmemo.jp/2017/05/bot-googlecalendar-mmost.html
function listupEvent(day=0)
{
  const cal_id=PropertiesService.getScriptProperties().getProperty('GOOGLE_ACCOUNT');
  var list = "";
  var cal = CalendarApp.getCalendarById(cal_id);
  var today=new Date();
  var target_day=new Date(today.getFullYear(),today.getMonth(), today.getDate()+day);
  console.log(target_day);
  var events = cal.getEventsForDay(target_day);
  for(var i=0; i < events.length; i++){
    s = '';
    if (events[i].isAllDayEvent()) {
      s += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","MM/dd  ");
    } else {
      s += Utilities.formatDate(events[i].getStartTime(),"GMT+0900","MM/dd HH:mm");
      s += Utilities.formatDate(events[i].getEndTime(), "GMT+0900","-HH:mm  ");
    }
    s += events[i].getTitle();
    Logger.log(s);

    list += s + "\n";
  }
  console.log(list);
  return list;
}

function send_today_schedule(){
  const channel = PropertiesService.getScriptProperties().getProperty("CHANNEL_ID_CALENDAR_APP");
  const schedule = listupEvent(0);
  sendSlack(channel,schedule);
}

function auto_send_tomorrow_schedule(){
  const channel = PropertiesService.getScriptProperties().getProperty("CHANNEL_ID_SCHEDULE");
  const schedule = listupEvent(day=1);
  if (schedule!=""){
    let message="明日の予定をお知らせします！\n" +schedule;
    sendSlack(channel,message);
  }
  //sendSlack(channel,schedule);
}
