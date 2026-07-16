import { LoggerLevelSchema } from '@jterrazz/telemetry';
import { z } from 'zod';

import {
    type ConfigurationPort,
    type InboundConfigurationPort,
    type OutboundConfigurationPort,
} from '../../../application/ports/inbound/configuration.port.js';

const httpSchema = z.object({
    host: z.string(),
    port: z.coerce.number().int().positive(),
});

const loggerSchema = z.object({
    level: LoggerLevelSchema,
    prettyPrint: z.boolean(),
});

const inboundSchema = z.object({
    env: z.enum(['development', 'production', 'test']),
    http: httpSchema,
    logger: loggerSchema,
});

const outboundSchema = z.object({
    openRouter: z.object({
        apiKey: z.string().min(1),
    }),
});

const configurationSchema = z.object({
    inbound: inboundSchema,
    outbound: outboundSchema,
});

type Configuration = z.infer<typeof configurationSchema>;

/**
 * Node.js configuration adapter that loads configuration from node-config
 */
export class NodeConfigAdapter implements ConfigurationPort {
    private readonly configuration: Configuration;

    constructor(configurationInput: unknown) {
        this.configuration = configurationSchema.parse(configurationInput);
    }

    public getInboundConfiguration(): InboundConfigurationPort {
        return this.configuration.inbound;
    }

    public getOutboundConfiguration(): OutboundConfigurationPort {
        return this.configuration.outbound;
    }
}
