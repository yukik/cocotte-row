cocotte-row
=====

# はじめに

データを格納できる行オブジェクトのクラスです  
行オブジェクトは、フィールドごとに値をもちます  
さらに、変更前の値と変更後の値を同時に保持します  

## 使用例

```
var Row = require('cocotte-row');
var Field = require('cocotte-field');

var fields = {
  field1: {
    type: Field.Text,
    required: true
  },
  field2: {
    type: Field.Number,
    max: 100
  },
};

var row = new Row({fields: fields});

row.field1 = 'foo';
row.field2 = 50;
```

# コンストラクタ引数

## fields

フィールドを指定します  
あらかじめ指定したフィールド以外に値を設定することはできません  
キーにフィールド名、値にフィールド型やオプションを設定します
指定できるフィールドとオプションはcocotte-fieldモジュールのREADME.mdを参照してください

## state

行状態を指定します  
行状態とは、その行が所属する元のコレクションでどのような存在かを示すものです  
コレクションは通常データソースです  
既定値は1です

  + 値=1、追加予定、 元のコレクションに存在せず、追加する予定があります
  + 値=2、既存行、   元のコレクションに存在しています
  + 値=3、削除予定、 元のコレクションに存在し、削除する予定があります
  + 値=4、所属なし、 コレクションには所属していません

## data

保持する値をオブジェクトで指定します  
フィールド名をキーにします  
値は、stateの値により変更前の値か、変更後の値に設定されるか決まります  
追加予定(state=1)の場合は、変更後の値に設定されます  
それ以外は、変更前の値に設定されます  
もし、既存行、削除予定、所属なしで変更後の値も設定したい場合は、配列で
`[変更前の値、変更後の値]`とします

## updated

フィールドやid,stateの値が変更された時に、コールバックされる関数を設定することができます  
thisは行オブジェクトで、第一引数にフィールド名もしくはid,stateの文字列が渡されます

# 行オブジェクト

行オブジェクトは幾つかの固定のプロパティとフィールドのプロパティが設定されています  
インスタンスメソッドは存在しません

## id

行番号を取得・変更する事ができます  
コレクション内で行を特定するために使用します

## state

行状態を取得・変更する事ができます  
元のコレクションに対して行がどのような存在かを示します

  + 1: 追加予定 (既定値)
  + 2: 既存
  + 3: 削除予定
  + 4: 削除済

## フィールド

フィールド名のプロパティに対して、値の取得・変更する事ができます  
このフィールドは変更前の値と変更後の値を同時に持ちます  
代入を行うと変更後の値として設定されます  
変更前の値と同じ値を設定すると、変更後の値は未設定となります

# クラスメソッド

typeを除いて、クラスメソッドは行に対しての操作を行うことができます  
いずれも第一引数のインスタンスを引き渡します

## Row.type({Object} fields, {Function} updated)

フィールド定義されたクラスを定義して返します  
このクラスはRowクラスのサブクラスです  
Rowクラスと同じように行オブジェクトを作成することができます  
その際にfieldsとupdatedはすでに設定されているため省略します


## Row.copy({String} id, {Row} row)

同じフィールド・同じデータをもつ行を新たに作成し返します  
行状態は 追加予定(state=1)で設定されます


## Row.reset({Row} row, {String} name)

変更後の値を破棄します  
nameにフィールド名を指定しなかった場合はすべての値を破棄し、
指定した場合はそのフィールドだけ破棄します


## Row.save({Row} row)

変更後の値を変更前の値に設定します


## Row.getBefore({Row} row, {String} name)

変更前の値を取得する


## Row.getAfter({Row} row, {String} name)

変更後の値を取得する


## Row.setBefore({Row} row, {String} name, {Mixed} value)

変更前の値に設定する  変更後の値と同じ値を設定した場合は、変更後の値が未設定になります  
特定のフィールドの変更前の値を設定することができる唯一の方法です  
setAfterは存在しません。`row.field1 = value`を使用してください


## Row.hasBefore({Row} row, {String} name)

変更前の値が設定されているか  
name省略時は変更前の値がひとつでもnullでない場合にtrue


## Row.hasAfter({Row} row, {String} name)

変更後の値が設定されているか  
name省略時は変更後の値がひとつでも設定されている場合はtrue


## Row.data({Row} row, {Boolean} diff)

行をデータオブジェクトにして返します
diffにtrueを設定すると変更後の値のみを返します
