/*
 * @license
 * cocotte-row v0.3.0
 * Copyright(c) 2015 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */

/**
 * dependencies
 */
var helper = require('cocotte-helper');
var Field = require('cocotte-field');
var setData = require('./set-data');
var typedProperties = require('./typed-properties');
var STATES = require('./states');

// exports
module.exports = Row;

/*global window*/
// クライアント用
if (typeof window === 'object') {
  if (!window.Cocotte){
    window.Cocotte = {};
  }
  window.Cocotte.Row = Row;
}

/**
 * 行
 * @method Row
 * @param  {Object} config
 */
function Row (config) {
  var copied = helper.copy(config, this);
  var Typed = Row.type(copied.fields, copied.updated, copied.threw);
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
    }
    if (value === null || typeof value === 'string') {
      this._data.id = value;
      if (this._updated) {
        this._updated('id');
      }
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
    if (this._data.state === value) {
      return;
    }
    if (value === STATES.ADDED || value === STATES.EXISTS ||
        value === STATES.DELETED || value === STATES.DETACHED) {
      this._data.state = value;
      if (this._updated) {
        this._updated('state');
      }
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
 * フィールド定義済みのクラスを作成する
 * @method type
 * @param  {Object} fields
 * @param  {Function} updated
 * @param  {Function} threw
 * @return {Function} TypedRow
 */
Row.type = function type (fields, updated, threw) {
  function TypedRow (config) {
    initTypeRow(this, config);
  }

  // Rowの継承クラスに設定
  TypedRow.super_ = Row;
  TypedRow.prototype = Object.create(Row.prototype, {
    constructor: {
      value: TypedRow,
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
    },
    _threw: {
      value: typeof threw === 'function' ? threw : null,
      enumerable: false,
      configurable: false,
      writable: true
    }
  });
  TypedRow.properties = typedProperties;
  defFields(TypedRow, fields);
  return TypedRow;
};

// フィールド定義済みのクラスの初期化
function initTypeRow (self, config) {
  Object.defineProperty(self, '_data', {
    value: {
      id    : null,
      state : null,
      store : {},
      after : {},
      errors: {}
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
  var copied = helper.copy(config, self);
  setData(self, copied.data, copied.id, copied.state);
  Object.preventExtensions(self);
}

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
      var store = data.store;
      return name in after ? after[name] : store[name];
    },
    set: function (value) {
      var data = this._data;
      var after = data.after;
      var errors = data.errors;
      var store = data.store;
      var field = this._fields[name];
      var threw = false;
      try {
        field.valid(value);
        if (field.equal(after[name], value)) {
          if (!errors[name]) {
            // まったく同じ値を入力でもともとエラーもなし
            return;
          }
        } else if (field.equal(store[name], value)) {
          delete after[name];
        } else {
          after[name] = value;
        }
        delete errors[name];
      } catch(e) {
        errors[name] = {
          input: value,
          message: e.message
        };
        threw = this._threw;
      }
      if (this._updated) {
        this._updated(name);
      }
      if (threw) {
        this._threw(name);
      }
    }
  });
}

// helper用プロパティ
Row.properties = require('./properties');

// クラスメソッド
require('./class-method')(Row);

