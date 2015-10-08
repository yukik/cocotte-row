cocotte-row
=====

# はじめに

データを格納できる行オブジェクトのクラスです  
行オブジェクトは、フィールドごとに値をもちます  
さらに、ストア値・変更値・エラー情報を同時に保持します  

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
値は、stateの値によりストア値か、変更値に設定されるか決まります  
追加予定(state=1)の場合は、変更値に設定されます  
それ以外は、ストア値に設定されます  
それぞれを個別に設定したい場合は`[ストア値, 変更値, エラー]`とします  
エラーは`{input: エラーの入力値, message: エラーメッセージ}`です


## updated

フィールドやid,stateの値が変更された時に、コールバックされる関数を設定することができます  
thisは行オブジェクトで、第一引数にフィールド名もしくはid,stateの文字列が渡されます


## threw

id,state以外のフィールドの値の変更に失敗した時に、コールバックされる関数を設定することができます  
thisは行オブジェクトで、第一引数にフィールド名が渡されます


# 行オブジェクト

行オブジェクトは幾つかの固定のプロパティとフィールドのプロパティが設定されています  
インスタンスメソッドは存在しません

## id

行番号を取得・変更する事ができます  
コレクション内で行を特定するために使用します


## state

行状態を取得・変更する事ができます  
元のコレクションに対して行がどのような存在かを示します  
値は1から4の整数ですが、`Row.STATES`に定数が定義されています

  + 1(Row.STATES.ADDED): 追加予定 (既定値)
  + 2(Row.STATES.EXISTS): 既存
  + 3(Row.STATES.DELETED): 削除予定
  + 4(Row.STATES.DETACHED): 削除済


## フィールド

フィールド名のプロパティに対して、値の取得・変更する事ができます  
このフィールドはストア値と変更値を同時に持ちます  
代入を行うと変更値として設定されます  
ストア値と同じ値を設定すると、変更値は未設定となります


# クラスメソッド

typeを除くクラスメソッドは行に対しての操作を行います  
いずれも第一引数のインスタンスを引き渡します

## Row.type({Object} fields, {Function} updated)

フィールド定義されたクラスを定義して返します  
このクラスはRowクラスのサブクラスです  
Rowクラスと同じように行オブジェクトを作成することができます  
その際にfieldsとupdatedはすでに設定されているため省略します


## Row.copy({Row} row, {String} id)

同じフィールド・同じデータをもつ行を新たに作成し返します  
行状態は 追加予定(Row.STATES.ADDED)で設定されます  
idは省略可能です


## Row.reset({Row} row, {String} name)

変更値を破棄します  
nameにフィールド名を指定しなかった場合はすべての値を破棄し、
指定した場合はそのフィールドだけ破棄します


## Row.save({Row} row)

変更値をストア値に設定します


## Row.getStore({Row} row, {String} name)

ストア値を取得する


## Row.getAfter({Row} row, {String} name)

変更値を取得する  
値が設定されていない場合は,undefinedを返します  
nullは明確にnullが設定されていることを示します


## Row.getInput({Row} row, {String} name)

入力値を取得します  
エラーが存在する場合はエラー時の入力の値をエラーが存在しない場合は通常の値を返します


## Row.getError({Row} row, {String} name)

入力にエラーが存在する場合は、エラーメッセージを返します  
エラーがない場合はnullを返します


## Row.setStore({Row} row, {String} name, {Mixed} value)

ストア値に設定する  変更値と同じ値を設定した場合は、変更値が未設定になります  
特定のフィールドのストア値を設定することができる唯一の方法です


## Row.setAfter({Row} row, {String} name, {Mixed} value)

変更値に設定する  ストア値と同じ値を設定した場合は、変更値は未設定になります  
`row.field1 = value`と同じ動作をします  
ただし、読み取り専用のフィールドに設定するにはsetAfterを使用する必要があります
読み取り専用のフィールドの場合は代入時に例外が発生します


## Row.setError({Row} row, {Srting} name, {Mixed} value, {String} message)

エラーを設定します


## Row.hasStore({Row} row, {String} name)

ストア値が設定されているか  
name省略時はストア値がひとつでもnullでない場合にtrue


## Row.hasAfter({Row} row, {String} name)

変更値が設定されているか  
name省略時は変更値がひとつでも設定されている場合はtrue


## Row.hasError({Row} row, {String} name)

エラーが存在するか
name省略時はエラーがひとつでも設定されている場合はtrue


## Row.data({Row} row, {Boolean} diff)

行をデータオブジェクトにして返します
diffにtrueを設定すると変更値のみを返します
