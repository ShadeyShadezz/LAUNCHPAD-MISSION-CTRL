import jwt from 'jsonwebtoken';
import { config } from './config';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const JWT_SECRET = config.JWT_SECRET;

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  for (const c of cookieHeader.split(';')) {
    const [key, ...val] = c.trim().split('=');
    if (key === name) return val.join('=');
  }
  return undefined;
}

export function verifyAuth(request: Request): JwtPayload {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.split(' ')[1];
  if (!token) {
    token = getCookie(request, 'token') || getCookie(request, 'authToken');
  }
  if (!token) throw new Error('No token provided');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: config.JWT_MAX_AGE_SECONDS });
}
