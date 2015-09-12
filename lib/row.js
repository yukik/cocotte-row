/*
 * @license
 * cocotte-row v0.2.0
 * Copyright(c) 2015 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */

/**
 * dependencies
 */
var helper = require('cocotte-helper');
var Field = require('cocotte-field');
var TypedRow = require('./typed-row');
var typedProperties = require('./typed-properties');
var STATES = require('./states');

// exports
module.exports = Row;

/**
 * 行
 * @method Row
 * @param  {Object} config
 */
function Row (config) {
  var copied = helper.copy(config, this);
  var Typed = Row.type(copied.fields, copied.updated);
  return new Typed(copied);
}

var proto = Row.prototype;

Object.defineProperty(proto, 'id', {
  get: function () {
    return this._data.id;
  },
  set: function (value) {
    if (value === undefined) {
      value = null;
    }
    if (value === this._data.id) {
      return;
    } else if (value === null || typeof value === 'string') {
      this._data.id = value;
      if (this._updated) {
        this._updated('id');
      }
    } else {
      throw new TypeError('idは文字列を設定してください');
    }
  },
  enumerable: true,
  configurable: false
});

Object.defineProperty(proto, 'state', {
  get: function () {
    return this._data.state;
  },
  set: function (value) {
    if (value === STATES.ADDED || value === STATES.EXISTS ||
        value === STATES.DELETED || value === STATES.DETACHED) {
      if (this._data.state !== value) {
        this._data.state = value;
        if (this._updated) {
          this._updated('state');
        }
      }
    } else {
      var msg = 'state:不正な値です';
      throw new Error(msg);
    }
  },
  enumerable: true,
  configurable: false
});

/**
 * 行状態
 * @property {Object} STATES
 */
Row.STATES = STATES;

/**
 * フィルード定義済みのクラスを作成する
 * @method type
 * @param  {Object} fields
 * @param  {Function} updated
 * @return {Function} TypedRow
 */
Row.type = function type (fields, updated) {
  var Typed = function (config) {
    TypedRow.call(this, config);
  };

  // Rowの継承クラスに設定
  Typed.super_ = Row;
  Typed.prototype = Object.create(Row.prototype, {
    constructor: {
      value: Typed,
      enumerable: false,
      configurable: true,
      writable: true
    },
    _fields: {
      value: getFields(fields),
      enumerable: false,
      configurable: false,
      writable: false
    },
    _updated: {
      value: typeof updated === 'function' ? updated : null,
      enumerable: false,
      configurable: false,
      writable: true
    }
  });
  Typed.properties = typedProperties;
  defFields(Typed, fields);
  return Typed;
};

/**
 * フィールド定義の取得
 * @method getFields
 * @param  {Object}  fields
 * @return {Object}  fields
 */
function getFields(fields) {
  var msg;
  if (!fields || typeof fields !== 'object') {
    msg = 'フィールド定義が不正です';
    throw new Error(msg);
  }
  var names = Object.keys(fields);
  if (names.every(function(name) {return fields[name] instanceof Field;})) {
    return fields;
  }
  return names.reduce(function(x, name){
    var config = fields[name];
    var Type = config.type;
    if (typeof Type !== 'function') {
      msg = name + ':typeが不明です';
      throw new Error(msg);
    }
    var field = new Type(config);
    if (field instanceof Field) {
      x[name] = field;
    } else {
      msg = name + ':typeがフィールドのインスタンスではありません';
      throw new Error(msg);
    }
    return x;
  }, {});
}

// フィールドプロパティの設定
function defFields (Typed, fields) {
  var proto = Typed.prototype;
  Object.keys(fields).forEach(function (name){
    defField(proto, name);
  });
}
function defField(proto, name) {
  Object.defineProperty(proto, name, {
    enumerable: true,
    configurable: false,
    get: function () {
      var data = this._data;
      var after = data.after;
      var before = data.before;
      return name in after ? after[name] : before[name];
    },
    set: function (value) {
      var data = this._data;
      var after = data.after;
      var before = data.before;
      var field = this._fields[name];
      field.valid(value);
      if (field.equal(after[name], value)) {
        return;
      } else if (field.equal(before[name], value)) {
        delete after[name];
      } else {
        after[name] = value;
      }
      if (this._updated) {
        this._updated(name);
      }
    }
  });
}

// helper用プロパティ
Row.properties = require('./properties');

// クラスメソッド
require('./class-method')(Row);


// クライアント用
if (typeof window === 'object') {
  if (!window.Cocotte){
    window.Cocotte = {};
  }
  window.Cocotte.Row = Row;
}
