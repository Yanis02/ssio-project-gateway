import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { randomUUID } from 'crypto';

export interface ActivityLog {
    id: string;
    timestamp: Date;
    userId: string | null;
    username: string | null;
    statusCode: number;
    durationMs: number;
    // Client-facing fields (shown in dashboard)
    message: string;
    category: ActivityLogCategory;
    severity: 'info' | 'warning' | 'error';
    // Raw technical fields
    method: string;
    path: string;
}

export type ActivityLogCategory =
    | 'Authentication'
    | 'Users'
    | 'Roles'
    | 'Permissions'
    | 'IoT'
    | 'Orion'
    | 'System';

export interface CreateActivityLogDto {
    userId?: string | null;
    username?: string | null;
    statusCode: number;
    durationMs: number;
    message: string;
    category: ActivityLogCategory;
    severity: 'info' | 'warning' | 'error';
    method: string;
    path: string;
}

@Injectable()
export class LogsService {
    private readonly MAX_LOGS = 1000;
    private readonly logs: ActivityLog[] = [];
    private readonly subject = new Subject<ActivityLog>();

    push(dto: CreateActivityLogDto): void {
        const entry: ActivityLog = {
            id: randomUUID(),
            timestamp: new Date(),
            userId: dto.userId ?? null,
            username: dto.username ?? null,
            statusCode: dto.statusCode,
            durationMs: dto.durationMs,
            message: dto.message,
            category: dto.category,
            severity: dto.severity,
            method: dto.method,
            path: dto.path,
        };

        this.logs.push(entry);

        // Keep the ring buffer capped
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift();
        }

        this.subject.next(entry);
    }

    getAll(limit = 50, offset = 0): { total: number; logs: ActivityLog[] } {
        const reversed = [...this.logs].reverse(); // newest first
        return {
            total: reversed.length,
            logs: reversed.slice(offset, offset + limit),
        };
    }

    asObservable(): Observable<ActivityLog> {
        return this.subject.asObservable();
    }
}
