import { ContentTypeUtils } from '../src';

describe('ContentTypeUtils.parse', () => {
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
    const type = ContentTypeUtils.parse('text/html');
    expect(type.type).toBe('text/html');
  });

  test('should parse with suffix', () => {
    const type = ContentTypeUtils.parse('image/svg+xml');
    expect(type.type).toBe('image/svg+xml');
  });

  test('should parse basic type with surrounding OWS', () => {
    const type = ContentTypeUtils.parse(' text/html ');
    expect(type.type).toBe('text/html');
  });

  test('should parse parameters', () => {
    const type = ContentTypeUtils.parse('text/html; charset=utf-8; foo=bar');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'utf-8',
      foo: 'bar',
    });
  });

  test('should parse parameters with extra LWS', () => {
    const type = ContentTypeUtils.parse('text/html ; charset=utf-8 ; foo=bar');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'utf-8',
      foo: 'bar',
    });
  });

  test('should lower-case type', () => {
    const type = ContentTypeUtils.parse('IMAGE/SVG+XML');
    expect(type.type).toBe('image/svg+xml');
  });

  test('should lower-case parameter names', () => {
    const type = ContentTypeUtils.parse('text/html; Charset=UTF-8');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-8',
    });
  });

  test('should unquote parameter values', () => {
    const type = ContentTypeUtils.parse('text/html; charset="UTF-8"');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-8',
    });
  });

  test('should unquote parameter values with escapes', () => {
    const type = ContentTypeUtils.parse('text/html; charset = "UT\\F-\\\\\\"8\\""');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      charset: 'UTF-\\"8"',
    });
  });

  test('should handle balanced quotes', () => {
    const type = ContentTypeUtils.parse('text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo');
    expect(type.type).toBe('text/html');
    expect(type.parameters).toEqual({
      param: 'charset="utf-8"; foo=bar',
      bar: 'foo',
    });
  });

  describe('should throw on invalid media type', () => {
    invalidTypes.forEach(function(type) {
      test('media type: ' + type, () => {
        expect(() => ContentTypeUtils.parse(type)).toThrow(/invalid media type/);
      });
    });
  });

  test('should throw on invalid parameter format', () => {
    expect(() => ContentTypeUtils.parse('text/plain; foo="bar')).toThrow(/invalid parameter format/);
    expect(() => ContentTypeUtils.parse('text/plain; profile=http://localhost; foo=bar')).toThrow(
      /invalid parameter format/
    );
    expect(() => ContentTypeUtils.parse('text/plain; profile=http://localhost')).toThrow(/invalid parameter format/);
  });
});

describe('ContentTypeUtils.fomrat', () => {
  test('should format basic type', function() {
    const str = ContentTypeUtils.format({ type: 'text/html' });
    expect(str).toBe('text/html');
  });

  test('should format type with suffix', function() {
    const str = ContentTypeUtils.format({ type: 'image/svg+xml' });
    expect(str).toBe('image/svg+xml');
  });

  test('should format type with parameter', function() {
    const str = ContentTypeUtils.format({
      type: 'text/html',
      parameters: { charset: 'utf-8' },
    });
    expect(str).toBe('text/html; charset=utf-8');
  });

  test('should format type with parameter that needs quotes', function() {
    const str = ContentTypeUtils.format({
      type: 'text/html',
      parameters: { foo: 'bar or "baz"' },
    });
    expect(str).toBe('text/html; foo="bar or \\"baz\\""');
  });

  test('should format type with parameter with empty value', function() {
    const str = ContentTypeUtils.format({
      type: 'text/html',
      parameters: { foo: '' },
    });
    expect(str).toBe('text/html; foo=""');
  });

  test('should format type with multiple parameters', function() {
    const str = ContentTypeUtils.format({
      type: 'text/html',
      parameters: { charset: 'utf-8', foo: 'bar', bar: 'baz' },
    });
    expect(str).toBe('text/html; bar=baz; charset=utf-8; foo=bar');
  });

  test('should reject invalid type', function() {
    const obj = { type: 'text/' };
    expect(() => ContentTypeUtils.format(obj)).toThrow(/invalid type/);
  });

  test('should reject invalid type with LWS', function() {
    const obj = { type: ' text/html' };
    expect(() => ContentTypeUtils.format(obj)).toThrow(/invalid type/);
  });

  test('should reject invalid parameter name', function() {
    const obj = { type: 'image/svg', parameters: { 'foo/': 'bar' } };
    expect(() => ContentTypeUtils.format(obj)).toThrow(/invalid parameter name/);
  });

  test('should reject invalid parameter value', function() {
    const obj = { type: 'image/svg', parameters: { foo: 'bar\u0000' } };
    expect(() => ContentTypeUtils.format(obj)).toThrow(/invalid parameter value/);
  });
});
