/**
 * dependencies
 */
var STATES = require('./states');

// exports
module.exports = function (Row) {
  Row.copy = copy;
  Row.reset = reset;
  Row.save = save;
  Row.getStore = getStore;
  Row.getAfter = getAfter;
  Row.getInput = getInput;
  Row.getError = getError;
  Row.setStore = setStore;
  Row.setAfter = setAfter;
  Row.setError = setError;
  Row.hasStore = hasStore;
  Row.hasAfter = hasAfter;
  Row.hasError = hasError;
  Row.data = data;
};

/**
 * 行の複製
 * 同じフィールド・同じデータをもつ行を返します
 * 行状態は新規行で、コールバック関数も同じものが設定されます
 * @method copy
 * @param  {Row}    row
 * @return {Row}    copied
 */
function copy (row, id) {
  var Typed = row.constructor;
  var fields = row._fields;

  var data = Object.keys(fields).reduce(function (d, name) {
    var field = fields[name];
    d[name] = field.copy(row[name]);
    return d;
  }, {});
  return new Typed({
    id: id || null,
    state: STATES.ADDED,
    data: data
  });
}

/**
 * 行をストアの値にもどします
 * 第二引数にフィールド名を指定しなかった場合は、
 * すべてのフィールドを変更します
 * @method reset
 * @param  {Row}     row
 * @param  {String}  name
 * @return {Boolean} updated
 */
function reset (row, name) {
  var fields = row._fields;
  var after = row._data.after;
  var updated = row._updated ? row._updated.bind(row) : null;
  if (!name) {
    var names = Object.keys(after);
    names.forEach(function (name){
      delete after[name];
    });
    if (updated) {
      names.forEach(function (name){
        updated(name);
      });
    }
    return 0 < names.length;

  } else if (fields[name] && name in after) {
    delete after[name];
    if (updated) {
      updated(name);
    }
    return true;

  } else {
    return false;
  }
}

/**
 * 変更値をストア値に設定します
 * @method save
 * @param  {Row}     row
 * @return {Boolean} 変更値が存在しているかどうか
 */
function save (row) {
  var store = row._data.store;
  var after = row._data.after;
  var names = Object.keys(after);
  names.forEach(function(name) {
    store[name] = after[name];
    delete after[name];
  });
  var updated = row._updated ? row._updated.bind(row) : null;
  if (updated) {
    names.forEach(function(name) {
      updated(name);
    });
  }
  return 0 < names.length;
}

/**
 * ストア値を取得する
 * @method getStore
 * @param  {Row}     row
 * @param  {String}  name
 * @return {Mixed}   store
 */
function getStore (row, name) {
  return row._data.store[name];
}

/**
 * 変更値を取得する
 * @method getAfter
 * @param  {Row}    row
 * @param  {String} name
 * @return {Mixed}  after
 */
function getAfter (row, name) {
  return row._data.after[name];
}

/**
 * 入力値を取得する
 *   エラーが存在する場合はエラー時の入力の値
 *   エラーが存在しない場合は通常の値を返す
 * @method getInput
 * @param  {Row} row
 * @param  {String} name
 * @return {Mixed} value
 */
function getInput (row, name) {
  var errors = row._data.errors;
  return name in errors ? errors[name].input : row[name];
}

/**
 * エラーを取得する
 * @method getError
 * @param  {Row}    row
 * @param  {String} name
 * @return {String} message
 */
function getError (row, name) {
  var errors = row._data.errors;
  return name in errors ? errors[name].message : null;
}

/**
 * ストア値に設定する
 * 変更値と同じ値を設定した場合は、変更値が未設定になります
 * @method setStore
 * @param  {Row}    row
 * @param  {String} name
 * @param  {Mixed}  value
 */
function setStore (row, name, value) {
  var data = row._data;
  var after = data.after;
  var store = data.store;
  var field = row._fields[name];

  if (!field) {
    var msg = '不明なフィールドです';
    throw new Error(msg);
  }

  field.valid(value, {readonly: true, require: true});
  if (field.equal(store[name], value)) {
    return;
  } else if (field.equal(after[name], value)) {
    store[name] = value;
    delete after[name];
  } else {
    store[name] = value;
  }
  if (row._updated) {
    row._updated(name);
  }
}

/**
 * 変更値に設定する
 * 読み取り専用のフィールドにも設定することができます
 * @method setAfter
 * @param  {Row}    row
 * @param  {String} name
 * @param  {Mixed}  value
 */
function setAfter (row, name, value) {
  var data = row._data;
  var after = data.after;
  var store = data.store;
  var field = row._fields[name];

  if (!field) {
    var msg = '不明なフィールドです';
    throw new Error(msg);
  }

  field.valid(value, {readonly: true});
  if (field.equal(after[name], value)) {
    return;
  } else if (field.equal(store[name], value)) {
    delete after[name];
  } else {
    after[name] = value;
  }
  if (row._updated) {
    row._updated(name);
  }
}

/**
 * エラーを設定する
 * @method setError
 * @param  {Row}    row
 * @param  {String} name
 * @param  {Mixed}  input
 * @param  {String} message
 */
function setError (row, name, input, message) {
  var data = row._data;
  var errors = data.errors;
  var field = row._fields[name];

  if (!field) {
    var msg = '不明なフィールドです';
    throw new Error(msg);
  }
  errors[name] = {
    input: input,
    message: message
  };
  if (row._updated) {
    row._updated(name);
  }
}

/**
 * ストア値が設定されているか
 * @method hasStore
 * @param  {Row}     row
 * @param  {String}  name
 *          省略時はストア値がひとつでもnullでない場合にtrue
 * @return {Boolean} has
 */
function hasStore(row, name) {
  if (name) {
    return row._data.store[name] !== null;
  } else {
    return Object.keys(row._data.store).some(function(name) {
      return row._data.store[name] !== null;
    });
  }
}

/**
 * 変更値が設定されているか
 * @method hasAfter
 * @param  {Row}     row
 * @param  {String}  name
 *          省略時は変更値がひとつでも設定されている場合はtrue
 * @return {Boolean} has
 */
function hasAfter(row, name) {
  if (name) {
    return name in row._data.after;
  } else {
    return 0 < Object.keys(row._data.after).length;
  }
}

/**
 * エラーが存在するか
 * @method hasError
 * @param  {Row}  row
 * @param  {String}  name
 *          省略時はエラーがひとつでも設定されている場合はtrue
 * @return {Boolean}      [description]
 */
function hasError(row, name) {
  if (name) {
    return name in row._data.errors;
  } else {
    return 0 < Object.keys(row._data.errors).length;
  }
}


/**
 * 行をデータオブジェクトにして返す
 * @method data
 * @param  {Row}     row
 * @param  {Boolean} diff 変更後の値のみ
 * @return {Object}  
 */
function data(row, diff) {
  var Row = this;
  if (!(row instanceof Row)) {
    return null;
  } else if (diff) {
    return Object.keys(row._data.after).reduce(function(x, name){
      x[name] = row[name];
      return x;
    }, {});
  } else {
    return Object.keys(row._fields).reduce(function(x, name){
      x[name] = row[name];
      return x;
    }, {
      id: row.id,
      state: row.state
    });
  }
}
