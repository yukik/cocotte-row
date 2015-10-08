/**
 * dependencies
 */
var Field = require('cocotte-field');
var STATES = require('./states');

// プロパティ情報
var properties = {
  fields: {
    keyType: Field,
    copy: false,
    required: true,
    description: 'フィールド'
  },
  id: {
    type: String,
    copy: false,
    description: [
      '行番号',
      '元のコレクション内の行と紐付けするためのIDを設定します'
    ]
  },
  state: {
    type: Number,
    copy: false,
    description: [
      '行状態',
      '元のコレクションでどのような存在かを示します',
      '1: 追加予定 (既定値)',
      '2: 既存',
      '3: 削除予定',
      '4: 削除済'
    ],
    test: function (value) {
      if (value === STATES.ADDED || value === STATES.EXISTS ||
          value === STATES.DELETED || value === STATES.DETACHED) {
        return;
      }
      throw new Error('不正な値です');
    }
  },
  data: {
    type: Object,
    copy: false,
    description: [
      '初期データ',
      '{フィールド1:値1, フィールド2:値2,}を配列で設定します',
      '新規行の場合は変更値に、それ以外の場合はストア値で設定されます',
      'ストア値、変更値、エラーを指定し設定することができます',
      'その場合は,値を[ストア値, 変更値, エラー]とします'
    ]
  },
  updated: {
    type: Function,
    copy: false,
    description: [
      '行が更新された場合に実行されるコールバック関数',
      'thisは行、第一引数には変更があったフィールド名または"id"、"state"の文字列です'
    ]
  },
  threw: {
    type: Function,
    copy: false,
    description: [
      '値の設定に失敗した場合に実行されるコールバック関数',
      'thisは行、第一引数には失敗したフィールド名です'
    ]
  }
};

module.exports = properties;