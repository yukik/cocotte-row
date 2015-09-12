var Row = require('cocotte-row');
var Field = require('cocotte-field');

var fields = {
  name: {type: Field.Text, required: true},
  age : {type: Field.Number, min:0, max: 150},
};

var row = new Row({fields: fields});

row.name = 'foo';
row.age = 20;
