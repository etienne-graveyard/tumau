import { RoutePattern as R } from '../src';

const home = R.create();
const admin = R.create('admin');
const adminUser = R.create(admin, R.string('user'));

it('match pattern', () => {
  expect(R.match(home, [])).not.toBe(false);
  expect(R.match(adminUser, [])).toBe(false);
});

it('parse pattern', () => {
  expect(R.parse('/').parts).toMatchInlineSnapshot(`Array []`);
  expect(R.parse('/admin/:user/').parts).toMatchInlineSnapshot(`
    Array [
      "admin",
      Object {
        "name": "user",
        "validate": [Function],
      },
    ]
  `);
});

it('match multiple', () => {
  const pattern = R.create('demo', R.multiple(R.number('nums')), R.optional(R.string('foo')));

  const match1 = R.match(pattern, R.splitPathname('/demo/45/7/8/yolo'));

  expect(match1).not.toBe(false);
  if (match1) {
    expect(match1.params).toMatchInlineSnapshot(`
          Object {
            "foo": Object {
              "present": true,
              "value": "yolo",
            },
            "nums": Array [
              45,
              7,
              8,
            ],
          }
      `);
  }

  const match2 = R.match(pattern, R.splitPathname('/demo/45/6'));
  expect(match2).not.toBe(false);
  if (match2) {
    expect(match2.params).toMatchInlineSnapshot(`
      Object {
        "foo": Object {
          "present": false,
        },
        "nums": Array [
          45,
          6,
        ],
      }
    `);
  }
});
