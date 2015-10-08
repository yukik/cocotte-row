# Change Log

 0.3.0 / 2015-10-08
===================

 * beforeをstoreと名称変更
    * 入力たびにbeforeが変わると勘違いされるため
    * メソッド名もgetBeforeはgetStore、setBeforeはsetStore、hasBeforeはhasStoreに変更
 * フィールドに値を設定した時の例外を発行しないようにし、代わりにthrewイベントを発行する
    * row._data.errorsを追加
    * 入力時のエラーの値とメッセージを保持する
    * クラスメソッドgetInput、getError、setError、hasErrorを追加
 * Row.typeメソッドの第三引数にthrewイベントのコールバック関数を設定できるようにした
 * typed-row.jsを削除し、内容をrow.jsとset-data.jsに分割


 0.2.0 / 2015-09-12
===================

 * インスタンスごとのプライベート変数の格納方法を変更した
 * statesの種類を整理


 0.1.0 / 2015-04-13
===================

 * 初期リリース