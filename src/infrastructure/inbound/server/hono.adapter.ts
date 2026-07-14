import { serve } from '@hono/node-server';
import { type LoggerPort } from '@jterrazz/telemetry';
import { Hono } from 'hono';

import {
    type ServerConfiguration,
    type ServerPort,
} from '../../../application/ports/inbound/server.port.js';
import { type AccountRepositoryPort } from '../../../application/ports/outbound/persistence/account-repository.port.js';

import { createAccountsRouter } from './accounts/accounts.routes.js';
import { type GetAccountsController } from './accounts/get-accounts.controller.js';
import { createHealthCheckRouter } from './health/health.routes.js';

export class HonoServerAdapter implements ServerPort {
    private app: Hono;
    private server: null | ReturnType<typeof serve> = null;

    constructor(
        private readonly logger: LoggerPort,
        private readonly getAccountsController: GetAccountsController,
        private readonly accountsRepository: AccountRepositoryPort,
    ) {
        this.app = new Hono();
        this.registerRoutes();
    }

    public async request(
        path: string,
        options?: { body?: object | string; headers?: Record<string, string>; method?: string },
    ): Promise<Response> {
        const init: RequestInit = {
            body: options?.body ? JSON.stringify(options.body) : undefined,
            headers: options?.headers,
            method: options?.method,
        };
        return this.app.request(path, init);
    }

    public async start(config: ServerConfiguration): Promise<void> {
        return new Promise((resolve) => {
            this.logger.debug('Starting server', { host: config.host, port: config.port });

            this.server = serve(this.app, (info) => {
                this.logger.debug('Server listening', { host: config.host, port: info.port });
                resolve();
            });
        });
    }

    public async stop(): Promise<void> {
        if (!this.server) return;

        this.logger.info('Stopping server');
        await this.server.close();
        this.server = null;
        this.logger.info('Server stopped');
    }

    private registerRoutes(): void {
        this.app.route('/', createHealthCheckRouter(this.accountsRepository));
        this.app.route('/accounts', createAccountsRouter(this.getAccountsController));
    }
}
