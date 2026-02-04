import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { JwtPayload } from './type';

export function verifyToken(request: IncomingMessage): JwtPayload | null {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('No token provided');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}