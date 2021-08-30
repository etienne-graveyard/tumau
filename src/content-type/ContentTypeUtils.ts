import { ContentTypeObject, ContentTypeParameters } from './ContentType';
import { PARAM_REGEXP, QESC_REGEXP, QUOTE_REGEXP, TEXT_REGEXP, TOKEN_REGEXP, TYPE_REGEXP } from './constants';

export const ContentTypeUtils = {
  parse,
  format,
};

function format(obj: ContentTypeObject): string {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('argument obj is required');
  }

  const parameters = obj.parameters;
  const type = obj.type;

  if (!type || !TYPE_REGEXP.test(type)) {
    throw new TypeError('invalid type');
  }

  let string = type;

  // append parameters
  if (parameters && typeof parameters === 'object') {
    Object.entries(parameters)
      .sort()
      .forEach(([param, value]) => {
        if (value === undefined) {
          return;
        }
        if (!TOKEN_REGEXP.test(param)) {
          throw new TypeError('invalid parameter name');
        }
        string += '; ' + param + '=' + qstring(value);
      });
  }

  return string;
}

function parse(string: string): ContentTypeObject {
  let index = string.indexOf(';');
  const type = index !== -1 ? string.substr(0, index).trim() : string.trim();

  if (!TYPE_REGEXP.test(type)) {
    throw new TypeError('invalid media type');
  }

  const parameters: ContentTypeParameters = {};

  // parse parameters
  if (index !== -1) {
    let key;
    let match;
    let value;

    PARAM_REGEXP.lastIndex = index;

    while ((match = PARAM_REGEXP.exec(string))) {
      if (match.index !== index) {
        throw new TypeError('invalid parameter format');
      }

      index += match[0].length;
      key = match[1].toLowerCase();
      value = match[2];

      if (value[0] === '"') {
        // remove quotes and escapes
        value = value.substr(1, value.length - 2).replace(QESC_REGEXP, '$1');
      }

      parameters[key] = value;
    }

    if (index !== string.length) {
      throw new TypeError('invalid parameter format');
    }
  }

  const obj: ContentTypeObject = {
    type: type.toLowerCase(),
    parameters,
  };

  return obj;
}

/**
 * Quote a string if necessary.
 */
function qstring(val: string): string {
  const str = String(val);

  // no need to quote tokens
  if (TOKEN_REGEXP.test(str)) {
    return str;
  }

  if (str.length > 0 && !TEXT_REGEXP.test(str)) {
    throw new TypeError('invalid parameter value');
  }

  return '"' + str.replace(QUOTE_REGEXP, '\\$1') + '"';
}
