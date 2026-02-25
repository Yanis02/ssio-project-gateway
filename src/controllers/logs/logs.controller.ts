import {
    Controller,
    Get,
    Query,
    Res,
    Req,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';
import { LogsService } from '../../services/logs.service';

@ApiTags('Logs')
@ApiBearerAuth('JWT-auth')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('provider')
export class LogsController {
    constructor(
        private readonly logsService: LogsService,
        // RolesGuard needs Reflector – wired via module
    ) { }

    // ──────────────────────────────────────────────────────────────────────────
    //  GET /logs  (paginated history)
    // ──────────────────────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({
        summary: 'Get activity logs',
        description:
            'Returns paginated activity logs (newest first). Admin only.',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
    @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
    @ApiResponse({
        status: 200,
        description: 'Activity logs returned successfully',
        schema: {
            example: {
                total: 123,
                logs: [
                    {
                        id: 'uuid',
                        timestamp: '2026-02-25T00:00:00.000Z',
                        userId: 'user-uuid',
                        username: 'alice',
                        message: 'alice created a new user account',
                        category: 'Users',
                        severity: 'info',
                        statusCode: 201,
                        durationMs: 142,
                        method: 'POST',
                        path: '/users',
                    },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden – admin role required' })
    getLogs(
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    ) {
        return this.logsService.getAll(limit, offset);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  GET /logs/stream  (Server-Sent Events real-time feed)
    // ──────────────────────────────────────────────────────────────────────────
    @Get('stream')
    @ApiOperation({
        summary: 'Stream activity logs (SSE)',
        description:
            'Opens a real-time Server-Sent Events stream. Connect from the dashboard with the browser native EventSource API. Admin only.',
    })
    @ApiResponse({ status: 200, description: 'SSE stream opened' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden – admin role required' })
    streamLogs(@Req() req: Request, @Res() res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
        res.flushHeaders();

        // Send a welcome comment so the client knows the connection is open
        res.write(': connected\n\n');

        // Push every new log to the stream
        const subscription = this.logsService.asObservable().subscribe((log) => {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
        });

        // Keep-alive ping every 30 s (prevents proxy timeouts)
        const keepAlive = setInterval(() => {
            res.write(': keep-alive\n\n');
        }, 30_000);

        // Clean up on disconnect
        req.on('close', () => {
            clearInterval(keepAlive);
            subscription.unsubscribe();
            res.end();
        });
    }
}
