export const SameSite = {
  Strict: 'Strict',
  Lax: 'Lax',
  None: 'None',
} as const;

export type SameSite = typeof SameSite[keyof typeof SameSite];

export interface SetCookie {
  name: string;
  value: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
}

export type SetCookies = Array<SetCookie>;

export type Cookies = { [name: string]: string | undefined };

export interface CreateCookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
}

export const SetCookie = {
  toString,
  create: createCookie,
  delete: deleteCookie,
};

export const Cookies = {
  parse: parseCookies,
};

function parseCookies(cookiesStr: string): Cookies {
  const pairs = cookiesStr.split(/\s*;\s*/);
  const cookies: Cookies = {};
  pairs.forEach(pair => {
    const [name, value] = pair.split('=');
    const trimedName = name.trim();
    cookies[trimedName] = value;
  });
  return cookies;
}

function createCookie(name: string, value: string, options: CreateCookieOptions = {}): SetCookie {
  const { httpOnly = true, path = '/' } = options;
  return {
    name,
    value,
    httpOnly,
    path,
    ...options,
  };
}

function deleteCookie(name: string): SetCookie {
  return createCookie(name, '', {
    expires: new Date(0),
  });
}

function toString(name: string, cookie: SetCookie): string {
  const out: Array<string> = [];
  out.push(`${name}=${cookie.value}`);

  // Fallback for invalid Set-Cookie
  // ref: https://tools.ietf.org/html/draft-ietf-httpbis-cookie-prefixes-00#section-3.1
  if (name.startsWith('__Secure')) {
    cookie.secure = true;
  }
  if (name.startsWith('__Host')) {
    cookie.path = '/';
    cookie.secure = true;
    delete cookie.domain;
  }

  if (cookie.expires) {
    const dateString = toIMF(cookie.expires);
    out.push(`Expires=${dateString}`);
  }
  if (cookie.maxAge && Number.isInteger(cookie.maxAge)) {
    if (cookie.maxAge <= 0) {
      throw new Error('Max-Age must be an integer superior to 0');
    }
    out.push(`Max-Age=${cookie.maxAge}`);
  }
  if (cookie.domain) {
    out.push(`Domain=${cookie.domain}`);
  }
  if (cookie.path) {
    out.push(`Path=${cookie.path}`);
  }
  if (cookie.secure) {
    out.push('Secure');
  }
  if (cookie.httpOnly) {
    out.push('HttpOnly');
  }
  if (cookie.sameSite) {
    out.push(`SameSite=${cookie.sameSite}`);
  }
  return out.join('; ');
}

function toIMF(date: Date): string {
  function dtPad(v: string): string {
    return v.padStart(2, '0');
  }
  const d = dtPad(date.getUTCDate().toString());
  const h = dtPad(date.getUTCHours().toString());
  const min = dtPad(date.getUTCMinutes().toString());
  const s = dtPad(date.getUTCSeconds().toString());
  const y = date.getUTCFullYear();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getUTCDay()]}, ${d} ${months[date.getUTCMonth()]} ${y} ${h}:${min}:${s} GMT`;
}
