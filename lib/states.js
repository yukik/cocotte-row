/**
 * const
 * 行が実在しているかを確認するための定数
 */
var STATES = {
  ADDED   : 1, // 追加予定
  EXISTS  : 2, // 既存
  DELETED : 3, // 削除予定
  DETACHED: 4  // 削除済
};

module.exports = STATES;