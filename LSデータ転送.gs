//Looker StudioからGmailへ送られてくるレポートを取得してSlackへ送るスクリプト
//Looker Studioの自動レポート送信後にGASのスクリプトが実行されるようにトリガーを設定する。
//スプシデータ蓄積と同じチャンネルに送るとエラーメッセージが送られてしまうので、違うチャンネルへ出力が望ましい

//日付データ取得
const today = new Date().toDateString();

//Gmailで送られてくるPDFファイルの日付部分にフォーマット
const todayFormat = today.slice(3,10)+", "+today.slice(11)
//Gmailで送られてくるPDFファイル名
const lsMail ='GAS自動連携Prj -'+todayFormat


//Gmailデータ取得＆Slack送付関数(この関数をトリガーで指定する)
function lsGmailApp() {
  const query = `subject:(${lsMail})`
  const threads = GmailApp.search(query);
  Logger.log(threads)

  const thread = threads[0];

  const messages = thread.getMessages();
  const message = messages[0];

  const getPDFs = message.getAttachments();
  const getPDF = getPDFs[1]

  Logger.log(getPDF.getName())

  const imageData = getPDF.copyBlob();


  postImageToSlack(imageData)
}

//Slackに画像をアップロードする関数
function postImageToSlack(imageData){
  //スクリプトプロパティで以下を指定
  const channelId = PropertiesService.getScriptProperties().getProperty("OUTPUT_CHANNEL_ID");
  const slackToken = PropertiesService.getScriptProperties().getProperty("SLACK_API_TOKEN");

  //Slackに画像をアップロード
  const url = 'https://slack.com/api/files.upload';
  const options = {
    method:'post',
    payload:{
      token:slackToken,
      channels:channelId,
      filename:'GAS自動連携Prj.pdf',
      filetype: "pdf",
      file:imageData,
      muteHttpExceptions: true,
    }
  };
  const response = UrlFetchApp.fetch(url,options);

  Logger.log(response.getContentText());
}