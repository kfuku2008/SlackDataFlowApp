//Slack APIを使用(デプロイ後ウェブアプリURLをEvent Subscriptionsに貼り付け)
//Subscribes bot events に　message.channels　を付与
//OAuth & PermissionsのScopesに　channels:history,chat:write,files:write,incoming-webhookを付与

//スクリプトプロパティを付与⇔削除することでエラーメッセージを制御
const ERROR_KEY = "LAST_ERROR_MESSAGE_" + ScriptApp.getScriptId();
//Slackへ送るエラーメッセージ(任意設定可能)
const errorMessage = "入力エラー！\n『料金：費目』で入力してください。\n改行で複数入力可能です。";
//Slackへ送る入力完了メッセージ(任意設定可能)
const completeMessage = "スプレッドシートへの入力が完了しました！"

function doPost(eventObj) {
  try {
    //Slack送信データを取得
    const params = JSON.parse(eventObj.postData.getDataAsString());

    //https://api.slack.com/events/url_verification 対応。
    if(params.type === 'url_verification') {
      return ContentService.createTextOutput(params.challenge);
    }

    // スプレットシードへの書き込み
    const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    const ss = SpreadsheetApp.openById(id);

    //出力したいシート名を記載
    const sheet = ss.getSheetByName("出力先");
    const sheetLastRow = sheet.getLastRow();

    //Slack送信時刻を取得
    const time = new Date(params.event.ts * 1000);

    //文字データ加工（改行があったら分割）
    const textSplit = params.event.text.split("\n");
    
    const textList =[]

    for (let v=0;v<textSplit.length;v++){
      const textSplit2 = textSplit[v].split(":");

      //金額：費目で入力されていなかった場合の処理
      if (textSplit2.length < 2) {
        // カンマで分割されていないデータがある場合、エラーメッセージを返信

        // 直近のエラーメッセージと比較して重複していなければSlackに送信
        if (errorMessage !== PropertiesService.getScriptProperties().getProperty(ERROR_KEY)) {
          sendErrorMessage(errorMessage);
          // エラーメッセージを記録
          PropertiesService.getScriptProperties().setProperty(ERROR_KEY, errorMessage);
        }
        
        return ContentService.createTextOutput(errorMessage);
        
      }

      textSplit2.unshift(time);
      textList.push(textSplit2);

    }
    
    sheet.getRange(sheetLastRow+1,1,textList.length,textList[0].length).setValues(textList);
    
    // エラーメッセージが出ないようスクリプトプロパティをセット
    PropertiesService.getScriptProperties().setProperty(ERROR_KEY, errorMessage);


    sendCompleteMessage(completeMessage);
    return ContentService.createTextOutput(completeMessage);

  } catch (error) {
    // エラーが発生した場合、エラーメッセージを返信
    const errorMessage = "エラーが発生しました：" + error.message;

    // 直近のエラーメッセージと比較して重複していなければSlackに送信
    if (errorMessage !== PropertiesService.getScriptProperties().getProperty(ERROR_KEY)) {
      sendErrorMessage(errorMessage);
      // エラーメッセージを記録
      PropertiesService.getScriptProperties().setProperty(ERROR_KEY, errorMessage);
    }
  }
  PropertiesService.getScriptProperties().deleteProperty(ERROR_KEY);
}


//エラーメッセージ送付関数
function sendErrorMessage(message) {
  // Slackにエラーメッセージを送信する処理を実装
  // 以下はSlackにメッセージを送信するためのサンプルコード
  const slackWebhookUrl = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
  const payload = {
    text: message,
  };
 const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  try {
    // UrlFetchApp.fetchが失敗した場合、エラーをハンドリング
    UrlFetchApp.fetch(slackWebhookUrl, options);
  } catch (fetchError) {
    console.error("Slackへのメッセージ送信中にエラーが発生しました：" + fetchError.message);
  }
}

//完了メッセージ送付関数
function sendCompleteMessage(message) {
  // Slackに入力完了メッセージを送信する処理を実装
  // 以下はSlackにメッセージを送信するためのサンプルコード
  const slackWebhookUrl = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
  const payload = {
    text: message,
  };
 const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  try {
    // UrlFetchApp.fetchが失敗した場合、エラーをハンドリング
    UrlFetchApp.fetch(slackWebhookUrl, options);
  } catch (fetchError) {
    console.error("Slackへのメッセージ送信中にエラーが発生しました：" + fetchError.message);
  }
}