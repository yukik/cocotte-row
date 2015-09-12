var helper = require('cocotte-helper');
var STATES = require('./states');

module.exports = TypedRow;

/**
 * フィールド定義済行クラスからコンストラクタで呼ばれる関数
 * (TypedRowはクラスではない)
 * @method TypedRow
 * @param  {Object} config
 */
function TypedRow (config) {
  var self = this;
  Object.defineProperty(self, '_data', {
    value: {
      id: null,
      state: null,
      before: {},
      after: {}
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
  var copied = helper.copy(config, self);
  this._updated = null;  // 一時的にコールバック関数を切る
  self.id = copied.id;
  self.state = copied.state || STATES.ADDED;
  setInitData(self, copied.data);
  delete this._updated;  // コールバック関数の復活
  Object.preventExtensions(self);
}

/**
 * 初期データ設定
 *   stateがADDEDの場合は変更後の値として設定
 *   それ以外の場合は変更前の値として設定し、さらに
 *   値に配列を渡した場合は[変更前, 変更後]と判断し
 *   両方を設定する
 * @method setInitData
 * @param  {Row} row
 * @param  {Object} data
 */
function setInitData(row, data) {
  var fields = row._fields;
  var before = row._data.before;
  var after = row._data.after;
  if (!data){
    Object.keys(fields).forEach(function(name){
      before[name] = null;
    });
  } else {
    var skip = {readonly: true, require: true};
    Object.keys(fields).forEach(function(name){
      var field = fields[name];
      var prefix = name + ':';
      if (name in data) {
        var value = data[name];
        if (row.state === STATES.ADDED) {
          before[name] = null;
          if (value !== null) {
            field.valid(value, null, prefix);
            after[name] = value;
          }
        } else if (Array.isArray(value) && !field.equal(value[0], value[1])) {
          field.valid(value[0], skip, prefix);
          before[name] = value[0];
          field.valid(value[1], null, prefix);
          after[name] = value[1];
        } else {
          field.valid(value, skip, prefix);
          before[name] = value;
        }
      } else {
        before[name] = null;
      }
    });
  }
}
