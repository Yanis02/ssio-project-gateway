import { Injectable } from '@nestjs/common';

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  keyrockManagementToken: string;
  oauth2AccessToken: string;
  oauth2RefreshToken?: string;
  keyrockTokenExpiry: Date;
  oauth2TokenExpiry: Date;
}

@Injectable()
export class SessionService {
  private sessions: Map<string, SessionData> = new Map();

  createSession(userId: string, sessionData: SessionData): void {
    console.log('Creating session for userId:', userId);
    this.sessions.set(userId, sessionData);
    console.log('Total sessions:', this.sessions.size);
  }

  getSession(userId: string): SessionData | undefined {
    return this.sessions.get(userId);
  }

  updateSession(userId: string, updates: Partial<SessionData>): void {
    const session = this.sessions.get(userId);
    if (session) {
      this.sessions.set(userId, { ...session, ...updates });
    }
  }

  deleteSession(userId: string): void {
    this.sessions.delete(userId);
  }

  isTokenExpired(expiry: Date): boolean {
    return new Date() >= expiry;
  }
}
