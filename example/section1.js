/*jshint forin:false */

var Field = require('cocotte-field');
var Row = require('..');

var fields = {
  name   : {type: Field.Text, max: 10},
  age    : {type: Field.Number},
  address: {type: Field.Text},
  phone  : {type: Field.Text}
};

var row = new Row({
  fields: fields,
  id: '1234',
  data: {
    name: 'foo',
    address: 'tokyo'
  },
  updated: function (name) {
    console.log('--------updated', this.id, name);
  }
});

var copied = Row.copy(row, 'xxxxx');

console.log();

copied.name = 'zzz';

var fn;

for(fn in row) {
  console.log(fn, row[fn]);
}

console.log();

for(fn in copied) {
  console.log(fn, copied[fn]);
}
