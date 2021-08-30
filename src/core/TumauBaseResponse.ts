const IS_TUMAU_RESPONSE = Symbol.for('IS_TUMAU_RESPONSE');

export class TumauBaseResponse {
  [IS_TUMAU_RESPONSE]: true;
}
