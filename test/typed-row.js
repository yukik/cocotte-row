var Field = require('cocotte-field');
var Row = require('..');
var assert = require('assert');
var eq = assert.deepEqual;


var fields = {
  name: {
    type: Field.Text
  },
  age: {
    type: Field.Number
  }
};

var cnt = 0;

function updated () {cnt++;}

var TypedRow = Row.type(fields, updated);

eq(TypedRow.prototype._updated, updated);

eq(TypedRow.prototype._fields, {
  name: new Field.Text(),
  age: new Field.Number(),
});


var names = Object.getOwnPropertyNames(TypedRow.prototype);

eq(names, ['constructor', '_fields', '_updated', 'name', 'age']);

eq(cnt, 0);

var row = new TypedRow();

eq(cnt, 0);

row.name = 'foo';

eq(row.name, 'foo');

eq(cnt, 1);

assert.throws(function(){
  row.name = 1;
});







