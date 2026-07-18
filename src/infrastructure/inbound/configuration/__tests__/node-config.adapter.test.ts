import { describe, expect, test } from 'vitest';
import { ZodError } from 'zod';

import { NodeConfigAdapter } from '../node-config.adapter.js';

describe('Node Config Adapter', () => {
    const validConfig = {
        inbound: {
            env: 'development',
            http: {
                host: 'localhost',
                port: 3000,
            },
            logger: {
                level: 'info',
                prettyPrint: false,
            },
        },
        outbound: {
            intelligence: {
                agents: {
                    example: {
                        provider: 'openrouter',
                        model: 'google/gemini-2.5-flash-lite',
                    },
                    'transaction-categorizer': {
                        provider: 'openrouter',
                        model: 'google/gemini-2.5-flash-lite',
                    },
                },
                providers: {
                    openrouter: {
                        apiKey: 'test-openrouter-key',
                        type: 'openrouter',
                    },
                },
            },
        },
    } as const;

    test('should load valid configuration', () => {
        const configAdapter = new NodeConfigAdapter(validConfig);
        expect(configAdapter.getInboundConfiguration()).toEqual(validConfig.inbound);
        expect(configAdapter.getOutboundConfiguration()).toEqual(validConfig.outbound);
    });

    /* =============================
     *  Validation error scenarios
     * ============================ */

    test('should fail with invalid environment', () => {
        const invalidConfig = {
            ...validConfig,
            inbound: {
                ...validConfig.inbound,
                env: 'invalid-env',
            },
        };

        expect(() => new NodeConfigAdapter(invalidConfig)).toThrow(ZodError);
    });

    test('should fail with missing API key', () => {
        const invalidConfig = {
            ...validConfig,
            outbound: {
                intelligence: {
                    ...validConfig.outbound.intelligence,
                    providers: {
                        openrouter: { apiKey: '', type: 'openrouter' }, // Empty api key should fail
                    },
                },
            },
        };

        expect(() => new NodeConfigAdapter(invalidConfig)).toThrow(ZodError);
    });

    test('should fail with invalid port', () => {
        const invalidConfig = {
            ...validConfig,
            inbound: {
                ...validConfig.inbound,
                http: {
                    ...validConfig.inbound.http,
                    port: 'invalid-port',
                },
            },
        };

        expect(() => new NodeConfigAdapter(invalidConfig)).toThrow(ZodError);
    });

    test('should fail with invalid log level', () => {
        const invalidConfig = {
            ...validConfig,
            inbound: {
                ...validConfig.inbound,
                logger: {
                    ...validConfig.inbound.logger,
                    level: 'invalid-level',
                },
            },
        };

        expect(() => new NodeConfigAdapter(invalidConfig)).toThrow(ZodError);
    });

    test('should fail with missing host', () => {
        const invalidConfig = {
            ...validConfig,
            inbound: {
                ...validConfig.inbound,
                http: {
                    port: 3000, // Host is missing
                },
            },
        };

        expect(() => new NodeConfigAdapter(invalidConfig)).toThrow(ZodError);
    });
});
