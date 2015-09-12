/**
 * dependencies
 */
var STATES = require('./states');

// exports
module.exports = function (Row) {
  Row.copy = copy;
  Row.reset = reset;
  Row.save = save;
  Row.getBefore = getBefore;
  Row.getAfter = getAfter;
  Row.setBefore = setBefore;
  Row.hasBefore = hasBefore;
  Row.hasAfter = hasAfter;
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
 * 行を変更前の値にもどします
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
 * 変更後の値を変更前に設定します
 * @method save
 * @param  {Row}     row
 * @return {Boolean} 変更前の値が存在しているかどうか
 */
function save (row) {
  var before = row._data.before;
  var after = row._data.after;
  var names = Object.keys(after);
  names.forEach(function(name) {
    before[name] = after[name];
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
 * 変更前の値を取得する
 * @method getBefore
 * @param  {Row}     row
 * @param  {String}  name
 * @return {Mixed}   before
 */
function getBefore (row, name) {
  return row._data.before[name];
}

/**
 * 変更後の値を取得する
 * @method getAfter
 * @param  {Row}    row
 * @param  {String} name
 */
function getAfter (row, name) {
  return row._data.after[name];
}

/**
 * 変更前の値に設定する
 * 変更後の値と同じ値を設定した場合は、変更後の値が未設定になります
 * @method setBefore
 * @param  {Row}    row
 * @param  {String} name
 * @param  {Mixed}  value
 */
function setBefore (row, name, value) {
  var data = row._data;
  var after = data.after;
  var before = data.before;
  var prefix = name + ':';
  var field = row._fields[name];

  if (!field) {
    var msg = prefix + '不明なフィールドです';
    throw new Error(msg);
  }

  field.valid(value, {readonly: true, require: true}, prefix);
  if (field.equal(before[name], value)) {
    return;
  } else if (field.equal(after[name], value)) {
    before[name] = value;
    delete after[name];
  } else {
    before[name] = value;
  }
  if (row._updated) {
    row._updated(name);
  }
}

/**
 * 変更前の値が設定されているか
 * @method hasBefore
 * @param  {Row}     row
 * @param  {String}  name
 *          省略時は変更前の値がひとつでもnullでない場合にtrue
 * @return {Boolean} has
 */
function hasBefore(row, name) {
  if (name) {
    return row._data.before[name] !== null;
  } else {
    return Object.keys(row._data.before).some(function(name) {
      return row._data.before[name] !== null;
    });
  }
}

/**
 * 変更後の値が設定されているか
 * @method hasAfter
 * @param  {Row}     row
 * @param  {String}  name
 *          省略時は変更後の値がひとつでも設定されている場合はtrue
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
 * 行をデータオブジェクトにして返す
 * @method data
 * @param  {Row}     row
 * @param  {Boolean} diff 差分データのみ
 * @return {Object}  
 */
function data(row, diff) {
  if (diff) {
    return row._data.after;
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
