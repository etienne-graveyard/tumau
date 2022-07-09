import { ContentType } from '../src';

describe('ContentType.parse', () => {
  const invalidTypes = [
    ' ',
    'null',
    'undefined',
    '/',
    'text / plain',
    'text/;plain',
    'text/"plain"',
    'text/p£ain',
    'text/(plain)',
    'text/@plain',
    'text/plain,wrong',
  ];

  test('should parse basic type', () => {
    const type = ContentType.parse('text/html');
    expect(type.type).toBe('text/html');
  });

  test('should parse with suffix', () => {
    const type = ContentType.parse('image/svg+xml');
    expect(type.type).toBe('image/svg+xml');
  });

  test('should parse basic type with surrounding OWS', () => {
    const type = ContentType.parse(' text/html ');
    expect(type.type).toBe('text/html');
  });

  test('should parse parameters', () => {
    const type = ContentType.parse('text/html; charset=utf-8; foo=bar');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'utf-8',
      foo: 'bar',
    });
  });

  test('should parse parameters with extra LWS', () => {
    const type = ContentType.parse('text/html ; charset=utf-8 ; foo=bar');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'utf-8',
      foo: 'bar',
    });
  });

  test('should lower-case type', () => {
    const type = ContentType.parse('IMAGE/SVG+XML');
    expect(type.type).toBe('image/svg+xml');
  });

  test('should lower-case parameter names', () => {
    const type = ContentType.parse('text/html; Charset=UTF-8');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-8',
    });
  });

  test('should unquote parameter values', () => {
    const type = ContentType.parse('text/html; charset="UTF-8"');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-8',
    });
  });

  test('should unquote parameter values with escapes', () => {
    const type = ContentType.parse('text/html; charset = "UT\\F-\\\\\\"8\\""');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-\\"8"',
    });
  });

  test('should handle balanced quotes', () => {
    const type = ContentType.parse('text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      param: 'charset="utf-8"; foo=bar',
      bar: 'foo',
    });
  });

  describe('should throw on invalid media type', () => {
    invalidTypes.forEach(function (type) {
      test('media type: ' + type, () => {
        expect(() => ContentType.parse(type)).toThrow(/invalid media type/);
      });
    });
  });

  test('should throw on invalid parameter format', () => {
    expect(() => ContentType.parse('text/plain; foo="bar')).toThrow(/invalid parameter format/);
    expect(() => ContentType.parse('text/plain; profile=http://localhost; foo=bar')).toThrow(
      /invalid parameter format/
    );
    expect(() => ContentType.parse('text/plain; profile=http://localhost')).toThrow(/invalid parameter format/);
  });
});

describe('ContentType.fomrat', () => {
  test('should format basic type', function () {
    const str = ContentType.format('text/html');
    expect(str).toBe('text/html');
  });

  test('should format type with suffix', function () {
    const str = ContentType.format('image/svg+xml');
    expect(str).toBe('image/svg+xml');
  });

  test('should format type with parameter', function () {
    const str = ContentType.format('text/html', { charset: 'utf-8' });
    expect(str).toBe('text/html; charset=utf-8');
  });

  test('should format type with parameter that needs quotes', function () {
    const str = ContentType.format('text/html', { foo: 'bar or "baz"' });
    expect(str).toBe('text/html; foo="bar or \\"baz\\""');
  });

  test('should format type with parameter with empty value', function () {
    const str = ContentType.format('text/html', { foo: '' });
    expect(str).toBe('text/html; foo=""');
  });

  test('should format type with multiple parameters', function () {
    const str = ContentType.format('text/html', { charset: 'utf-8', foo: 'bar', bar: 'baz' });
    expect(str).toBe('text/html; bar=baz; charset=utf-8; foo=bar');
  });

  test('should reject invalid type', function () {
    expect(() => ContentType.format('text/')).toThrow(/invalid type/);
  });

  test('should reject invalid type with LWS', function () {
    expect(() => ContentType.format(' text/html')).toThrow(/invalid type/);
  });

  test('should reject invalid parameter name', function () {
    expect(() => ContentType.format('image/svg', { 'foo/': 'bar' })).toThrow(/invalid parameter name/);
  });

  test('should reject invalid parameter value', function () {
    expect(() => ContentType.format('image/svg', { foo: 'bar\u0000' })).toThrow(/invalid parameter value/);
  });
});
