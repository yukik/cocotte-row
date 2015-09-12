var Field = require('cocotte-field');
var Row = require('..');
var assert = require('assert');
var eq = assert.equal;


var cnt = 0;

var fields = {
  name: {
    type: Field.Text
  },
  age: {
    type: Field.Number
  }
};

var config = {
  fields: fields,
  updated: function(){cnt++;},
  state: 2,
  id: 'id1',
  data: {
    name: 'foo',
    age: 20
  }
};

/*
 * フィールドを直接configに設定した行を作成する
 */
var row = new Row(config);

eq(row.id, 'id1');
eq(row.state, 2);
eq(row.name, 'foo');
eq(row.age, 20);
eq(cnt, 0);

row.name = 'bar';
eq(row.name, 'bar');
eq(cnt, 1);

/*
 * 行の複製で、複製元のフィールド定義が再利用されてることを確認する
 */
var copied = Row.copy(row);

eq(copied._fields, row._fields);
eq(copied._updated, row._updated);

eq(copied.id, null);
eq(copied.state, 1);
eq(copied.name, 'bar');
eq(copied.age, 20);
eq(cnt, 1);

/*
 * resetとsaveで、フィールドの値が変更されるかを確認
 */
Row.reset(row);
eq(row.name, 'foo');
eq(copied.name, 'bar');
eq(cnt, 2);


row.name = 'baz';
eq(cnt, 3);

Row.save(row);
eq(row.name, 'baz');
eq(cnt, 4);

Row.reset(row);
eq(cnt, 4);

eq(row.name, 'baz');

