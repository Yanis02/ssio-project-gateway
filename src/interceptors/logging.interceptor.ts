import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
    LogsService,
    ActivityLogCategory,
    CreateActivityLogDto,
} from '../services/logs.service';

interface LogMessageResult {
    message: string;
    category: ActivityLogCategory;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logsService: LogsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        const method: string = request.method;
        const path: string = request.path ?? request.url ?? '';
        const user = request.user;
        const userId: string | null = user?.userId ?? null;
        const username: string | null = user?.username ?? null;
        const actor = username ?? 'Anonymous';

        return next.handle().pipe(
            tap((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode: number = response.statusCode ?? 200;
                const durationMs = Date.now() - startTime;

                const { message, category } = this.buildMessage(method, path, actor, statusCode);
                const severity = this.getSeverity(statusCode);

                const dto: CreateActivityLogDto = {
                    userId,
                    username,
                    statusCode,
                    durationMs,
                    message,
                    category,
                    severity,
                    method,
                    path,
                };

                this.logsService.push(dto);
            }),
            catchError((error) => {
                const statusCode: number = error?.status ?? error?.statusCode ?? 500;
                const durationMs = Date.now() - startTime;

                const { message, category } = this.buildMessage(method, path, actor, statusCode);
                const severity = this.getSeverity(statusCode);

                this.logsService.push({
                    userId,
                    username,
                    statusCode,
                    durationMs,
                    message,
                    category,
                    severity,
                    method,
                    path,
                });

                return throwError(() => error);
            }),
        );
    }

    private getSeverity(statusCode: number): 'info' | 'warning' | 'error' {
        if (statusCode >= 400) return 'error';
        if (statusCode >= 300) return 'warning';
        return 'info';
    }

    private buildMessage(
        method: string,
        path: string,
        actor: string,
        statusCode: number,
    ): LogMessageResult {
        const p = path.toLowerCase();

        // ── Authentication ──────────────────────────────────────────────────
        if (method === 'POST' && p === '/auth/login') {
            if (statusCode >= 400) {
                return { message: 'Failed sign-in attempt', category: 'Authentication' };
            }
            return { message: `${actor} signed in`, category: 'Authentication' };
        }
        if (method === 'POST' && p === '/auth/logout') {
            return { message: `${actor} signed out`, category: 'Authentication' };
        }
        if (method === 'GET' && p === '/auth/me') {
            return { message: `${actor} checked their profile`, category: 'Authentication' };
        }

        // ── Users ───────────────────────────────────────────────────────────
        if (p.startsWith('/users')) {
            // Role-related subpaths
            if (p.includes('/roles')) {
                if (method === 'POST') {
                    return { message: `${actor} assigned a role to a user`, category: 'Users' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed a role from a user`, category: 'Users' };
                }
            }
            if (method === 'POST' && p === '/users') {
                return { message: `${actor} created a new user account`, category: 'Users' };
            }
            if (method === 'GET' && p === '/users') {
                return { message: `${actor} viewed the user list`, category: 'Users' };
            }
            if (method === 'GET') {
                return { message: `${actor} looked up user details`, category: 'Users' };
            }
            if (method === 'PUT') {
                return { message: `${actor} updated a user account`, category: 'Users' };
            }
            if (method === 'DELETE') {
                return { message: `${actor} removed a user account`, category: 'Users' };
            }
        }

        // ── Roles ────────────────────────────────────────────────────────────
        if (p.startsWith('/roles')) {
            if (p.includes('/permissions')) {
                if (method === 'POST') {
                    return { message: `${actor} assigned a permission to a role`, category: 'Roles' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed a permission from a role`, category: 'Roles' };
                }
            }
            if (method === 'POST') {
                return { message: `${actor} created a new role`, category: 'Roles' };
            }
            if (method === 'GET' && p === '/roles') {
                return { message: `${actor} viewed all roles`, category: 'Roles' };
            }
            if (method === 'GET') {
                return { message: `${actor} looked up a role`, category: 'Roles' };
            }
            if (method === 'PUT') {
                return { message: `${actor} updated a role`, category: 'Roles' };
            }
            if (method === 'DELETE') {
                return { message: `${actor} deleted a role`, category: 'Roles' };
            }
        }

        // ── Permissions ──────────────────────────────────────────────────────
        if (p.startsWith('/permissions')) {
            if (method === 'POST') {
                return { message: `${actor} created a new permission`, category: 'Permissions' };
            }
            if (method === 'GET' && p === '/permissions') {
                return { message: `${actor} viewed all permissions`, category: 'Permissions' };
            }
            if (method === 'GET') {
                return { message: `${actor} looked up a permission`, category: 'Permissions' };
            }
            if (method === 'PUT') {
                return { message: `${actor} updated a permission`, category: 'Permissions' };
            }
            if (method === 'DELETE') {
                return { message: `${actor} deleted a permission`, category: 'Permissions' };
            }
        }

        // ── IoT ──────────────────────────────────────────────────────────────
        if (p.startsWith('/iot')) {
            if (p.includes('/sensors')) {
                if (p.includes('/permanent-token') && method === 'POST') {
                    return { message: `${actor} generated a permanent sensor token`, category: 'IoT' };
                }
                if (p.includes('/reset-password') && method === 'PATCH') {
                    return { message: `${actor} reset an IoT sensor password`, category: 'IoT' };
                }
                if (method === 'POST') {
                    return { message: `${actor} provisioned a new IoT sensor account`, category: 'IoT' };
                }
                if (method === 'GET' && /\/iot\/sensors$/.test(p)) {
                    return { message: `${actor} viewed IoT sensors`, category: 'IoT' };
                }
                if (method === 'GET') {
                    return { message: `${actor} looked up an IoT sensor`, category: 'IoT' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} deleted an IoT sensor account`, category: 'IoT' };
                }
            }

            if (p.includes('/service-groups')) {
                if (method === 'POST') {
                    return { message: `${actor} created an IoT service group`, category: 'IoT' };
                }
                if (method === 'GET') {
                    return { message: `${actor} viewed IoT service groups`, category: 'IoT' };
                }
                if (method === 'PUT') {
                    return { message: `${actor} updated an IoT service group`, category: 'IoT' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed an IoT service group`, category: 'IoT' };
                }
            }

            if (p.includes('/devices')) {
                if (method === 'POST') {
                    return { message: `${actor} registered a new IoT device`, category: 'IoT' };
                }
                if (method === 'GET' && /\/iot\/devices$/.test(p)) {
                    return { message: `${actor} viewed IoT devices`, category: 'IoT' };
                }
                if (method === 'GET') {
                    return { message: `${actor} looked up an IoT device`, category: 'IoT' };
                }
                if (method === 'PUT') {
                    return { message: `${actor} updated an IoT device`, category: 'IoT' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed an IoT device`, category: 'IoT' };
                }
            }
        }

        // ── Orion Context Broker ─────────────────────────────────────────────
        if (p.startsWith('/orion')) {
            if (p.includes('/subscriptions')) {
                if (method === 'POST') {
                    return { message: `${actor} created an Orion subscription`, category: 'Orion' };
                }
                if (method === 'GET' && /subscriptions$/.test(p)) {
                    return { message: `${actor} viewed Orion subscriptions`, category: 'Orion' };
                }
                if (method === 'GET') {
                    return { message: `${actor} looked up an Orion subscription`, category: 'Orion' };
                }
                if (method === 'PATCH') {
                    return { message: `${actor} modified an Orion subscription`, category: 'Orion' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed an Orion subscription`, category: 'Orion' };
                }
            }

            if (p.includes('/entities')) {
                if (method === 'POST' && /entities$/.test(p)) {
                    return { message: `${actor} created a context entity`, category: 'Orion' };
                }
                if (method === 'GET' && /entities$/.test(p)) {
                    return { message: `${actor} queried context entities`, category: 'Orion' };
                }
                if (method === 'GET') {
                    return { message: `${actor} looked up a context entity`, category: 'Orion' };
                }
                if (method === 'PATCH') {
                    return { message: `${actor} updated context entity attributes`, category: 'Orion' };
                }
                if (method === 'PUT') {
                    return { message: `${actor} replaced context entity attributes`, category: 'Orion' };
                }
                if (method === 'DELETE') {
                    return { message: `${actor} removed a context entity`, category: 'Orion' };
                }
            }

            if (p.includes('/op/update')) {
                return { message: `${actor} performed a batch entity update`, category: 'Orion' };
            }

            if (p.includes('/types')) {
                return { message: `${actor} viewed context entity types`, category: 'Orion' };
            }
        }

        // ── Logs endpoint itself ─────────────────────────────────────────────
        if (p.startsWith('/logs')) {
            return { message: `${actor} accessed the activity log`, category: 'System' };
        }

        // ── Fallback ─────────────────────────────────────────────────────────
        return { message: `${actor} performed an action on the system`, category: 'System' };
    }
}
