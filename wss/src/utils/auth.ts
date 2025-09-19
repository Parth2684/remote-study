import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { UserInfo } from '../types';
import { CONFIG } from '../config';

export class AuthService {
  static verifyToken(token: string): UserInfo | null {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
      return {
        userId: decoded.id,
        userType: decoded.role,
        name: decoded.name,
        email: decoded.email
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  static extractTokenFromRequest(req: IncomingMessage): string | null {
    try {
      const { query } = parse(req.url || '', true);
      return query.token as string || null;
    } catch (error) {
      console.error('Error extracting token:', error);
      return null;
    }
  }

  static async verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): Promise<boolean> {
    try {
      const token = AuthService.extractTokenFromRequest(info.req);
      
      if (!token) {
        console.log('No token provided');
        return false;
      }

      const userInfo = AuthService.verifyToken(token);
      
      if (!userInfo) {
        console.log('Invalid token');
        return false;
      }

      // Store user info in the request for later use
      (info.req as any).userInfo = userInfo;
      return true;
    } catch (error) {
      console.error('Client verification failed:', error);
      return false;
    }
  }
}