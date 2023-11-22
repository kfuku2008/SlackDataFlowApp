//エラーメッセージを制御するスクリプトプロパティ（使い勝手はあまりよくない、、）
//4時間毎にトリガー設定(頻度調整可能)
//スクリプトプロパティが残っているとエラーメッセージが表示されない
//永続的なエラーメッセージ防止対策
function scriptPropatyDelete() {
  //入力後スクリプトプロパティが残っていたらトリガーで消す
  const ERROR_KEY = "LAST_ERROR_MESSAGE_" + ScriptApp.getScriptId();
  PropertiesService.getScriptProperties().deleteProperty(ERROR_KEY);
}
