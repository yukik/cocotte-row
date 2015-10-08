

module.exports = setData;


var STATES = require('./states.js');

/**
 * 行のフィールドの状態をすべて設定します
 * この関数は、rowのupdatedやthrewイベントを発行しないで設定します
 * 初期化に使用します
 * 
 *  dataが配列ではない場合
 *    stateがADDEDの場合は変更値のみ設定
 *    それ以外の場合はストア値として設定
 *  dataに配列を渡した場合
 *    [ストア前, 変更値, エラー]とし設定
 * @method setData
 * @param  {Row} row
 * @param  {Object} data
 * @param  {String} id
 * @param  {Number} state
 */
function setData(row, data, id, state) {

  var rowData = row._data;

  // id
  rowData.id = id;

  // state
  if (state === STATES.ADDED || state === STATES.EXISTS ||
      state === STATES.DELETED || state === STATES.DETACHED) {
    rowData.state = state;
  } else {
    rowData.state = STATES.ADDED;
  }

  // store,after,errors
  var store  = rowData.store;
  var after  = rowData.after;
  var errors = rowData.errors;
  var fields = row._fields;
  var names = Object.keys(fields);

  // データなし
  if (!data) {
    names.forEach(function(name){
      store[name] = null;
    });
    return;
  }

  // データあり
  var skip = {readonly: true, require: true};
  names.forEach(function(name){
    // フィールド値なし
    if (!(name in data)) {
      store[name] = null;
      return;
    }

    var field = fields[name];
    var value = data[name];

    if (Array.isArray(value)) {
      // ストア値
      field.valid(value[0], skip);
      store[name] = value[0];
      // 変更値
      if (2 <= value.length && !field.equal(value[0], value[1])) {
        field.valid(value[1]);
        after[name] = value[1];
      }
      // エラー値
      if (value[2] && typeof value[2] === 'object') {
        errors[name] = {
          input: value[2].input,
          message: value[2].message
        };
      }

    } else if (row.state === STATES.ADDED) {
      // ストア値
      store[name] = null;
      // 変更値
      if (value !== null) {
        field.valid(value);
        after[name] = value;
      }

    } else {
      // ストア値
      field.valid(value, skip);
      store[name] = value;
    }
  });
}