var Row = require('..');
var Field = require('cocotte-field');

var fields = {
  name: {type: Field.Text},
  age : {type: Field.Number}
};

var data = {
  name : 'foo',
  age  : 30
};

var newRow = new Row({fields:fields});
console.log('newRow ', Row.data(newRow));

var dataRow = new Row({fields:fields, data:data});
console.log('dataRow', Row.data(dataRow));

var copied = Row.copy(dataRow);
console.log('copied ', Row.data(copied));

var dbRow = new Row({fields:fields, state: 2, data:data});
console.log('dbRow  ', Row.data(dbRow));

