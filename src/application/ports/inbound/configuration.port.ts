import { type LoggerLevel } from '@jterrazz/telemetry';

/**
 * Configuration port providing access to application settings
 */
export interface ConfigurationPort {
    /**
     * Get the inbound configuration
     */
    getInboundConfiguration(): InboundConfigurationPort;

    /**
     * Get the outbound configuration
     */
    getOutboundConfiguration(): OutboundConfigurationPort;
}

/**
 * Inbound configuration (defined by the user)
 */
export interface InboundConfigurationPort {
    env: 'development' | 'production' | 'test';
    http: {
        host: string;
        port: number;
    };
    logger: {
        level: LoggerLevel;
        prettyPrint: boolean;
    };
}

/**
 * Outbound configuration (defined by external services)
 */
export interface OutboundConfigurationPort {
    openRouter: {
        apiKey: string;
    };
}
