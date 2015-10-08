/*global Cocotte*/
var isClient = typeof window === 'object';
var Row   = isClient ? Cocotte.Row   : require('..');
var Field = isClient ? Cocotte.Field : require('cocotte-field');

var fields = {
  name: {type: Field.Text, required: true},
  age : {type: Field.Number, min:0, max: 150},
};

var row = new Row({fields: fields});

row.name = 'foo';
row.age = 20;

console.log(Row.data(row));