import { createIntelligence, type Intelligence } from '@jterrazz/intelligence';
import { createLogger, type LoggerPort } from '@jterrazz/telemetry';
import { Container, Injectable } from '@snap/ts-inject';
import { default as nodeConfiguration } from 'config';

import type { ConfigurationPort } from '../application/ports/inbound/configuration.port.js';
import type { ServerPort } from '../application/ports/inbound/server.port.js';
import { type TransactionCategorizerAgentPort } from '../application/ports/outbound/agents/transaction-categorizer.agent.js';
import { type AccountRepositoryPort } from '../application/ports/outbound/persistence/account-repository.port.js';
import { type TransactionRepositoryPort } from '../application/ports/outbound/persistence/transaction-repository.port.js';
import { GetAccountsUseCase } from '../application/use-cases/accounts/get-accounts.use-case.js';
import { NodeConfigAdapter } from '../infrastructure/inbound/configuration/node-config.adapter.js';
import { GetAccountsController } from '../infrastructure/inbound/server/accounts/get-accounts.controller.js';
import { HonoServerAdapter } from '../infrastructure/inbound/server/hono.adapter.js';
import { ExampleAgentAdapter } from '../infrastructure/outbound/agents/example/example.js';
import { TransactionCategorizerAgentAdapter } from '../infrastructure/outbound/agents/transaction-categorizer/transaction-categorizer.js';
import { InMemoryAccountAdapter } from '../infrastructure/outbound/persistence/accounts/in-memory-account.adapter.js';
import { InMemoryTransactionAdapter } from '../infrastructure/outbound/persistence/transactions/in-memory-transaction.adapter.js';

/**
 * Outbound adapters
 */
const loggerFactory = Injectable(
    'Logger',
    ['Configuration'] as const,
    (config: ConfigurationPort) =>
        createLogger({
            level: config.getInboundConfiguration().logger.level,
            pretty: config.getInboundConfiguration().logger.prettyPrint,
        }),
);

const intelligenceFactory = Injectable(
    'Intelligence',
    ['Configuration', 'Logger'] as const,
    (config: ConfigurationPort, logger: LoggerPort): Intelligence => {
        const { agents, providers } = config.getOutboundConfiguration().intelligence;

        return createIntelligence({
            agents,
            logger,
            providers: {
                openrouter: {
                    ...providers.openrouter,
                    metadata: {
                        application: 'learning-ai',
                    },
                },
            },
        });
    },
);

const accountRepositoryFactory = Injectable(
    'AccountRepository',
    () => new InMemoryAccountAdapter(),
);

const transactionRepositoryFactory = Injectable(
    'TransactionRepository',
    () => new InMemoryTransactionAdapter(),
);

const exampleAgentFactory = Injectable(
    'ExampleAgent',
    ['Intelligence', 'Logger'] as const,
    (intelligence: Intelligence, logger: LoggerPort) =>
        new ExampleAgentAdapter(intelligence.model('example'), logger),
);

const transactionCategorizerAgentFactory = Injectable(
    'TransactionCategorizerAgent',
    ['Intelligence', 'Logger'] as const,
    (intelligence: Intelligence, logger: LoggerPort): TransactionCategorizerAgentPort =>
        new TransactionCategorizerAgentAdapter(
            intelligence.model('transaction-categorizer'),
            logger,
        ),
);

/**
 * Use case factories
 */
const getAccountsUseCaseFactory = Injectable(
    'GetAccounts',
    ['AccountRepository', 'TransactionRepository', 'TransactionCategorizerAgent'] as const,
    (
        accountRepository: AccountRepositoryPort,
        transactionRepository: TransactionRepositoryPort,
        categorizerAgent: TransactionCategorizerAgentPort,
    ) => new GetAccountsUseCase(accountRepository, transactionRepository, categorizerAgent),
);

/**
 * Controller factories
 */
const controllersFactory = Injectable(
    'Controllers',
    ['GetAccounts'] as const,
    (getAccounts: GetAccountsUseCase) => ({
        getAccounts: new GetAccountsController(getAccounts),
    }),
);

/**
 * Inbound adapters
 */
const configurationFactory = Injectable(
    'Configuration',
    () => new NodeConfigAdapter(nodeConfiguration),
);

const serverFactory = Injectable(
    'Server',
    ['Logger', 'Controllers', 'AccountRepository'] as const,
    (
        logger: LoggerPort,
        controllers: { getAccounts: GetAccountsController },
        accountsRepository: AccountRepositoryPort,
    ): ServerPort => {
        logger.info('Initializing Server', { implementation: 'Hono' });
        const server = new HonoServerAdapter(logger, controllers.getAccounts, accountsRepository);
        return server;
    },
);

/**
 * Container configuration
 */
export const createContainer = () =>
    Container
        // Outbound adapters
        .provides(configurationFactory)
        .provides(loggerFactory)
        .provides(intelligenceFactory)
        .provides(accountRepositoryFactory)
        .provides(transactionRepositoryFactory)
        .provides(exampleAgentFactory)
        .provides(transactionCategorizerAgentFactory)
        // Use cases
        .provides(getAccountsUseCaseFactory)
        // Controllers and tasks
        .provides(controllersFactory)
        // Inbound adapters
        .provides(serverFactory);
