export type RequestUser =
  | { isAuthenticated: true; sub: string; exp?: number; iat?: number }
  | { isAuthenticated: false, sub: undefined, exp: undefined, iat: undefined};
