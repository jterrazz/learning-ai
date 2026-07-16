import type { LanguageModelV4 } from '@ai-sdk/provider';
import { createSchemaPrompt, generateStructured } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/telemetry';
import { z } from 'zod';

import {
    type ExampleAgentPort,
    type ExampleInput,
    type ExampleResult,
} from '../../../application/ports/outbound/agents/example.agent.js';

export class ExampleAgentAdapter implements ExampleAgentPort {
    static readonly SCHEMA = z.object({
        definition: z.string(),
    });

    // System prompt tailored for a dictionary-style word-definition generator
    static readonly SYSTEM_PROMPT = [
        'You are an experienced lexicographer for an English dictionary.',
        'Provide concise, clearly-written definitions suitable for a general audience (CEFR B2). Use no more than 30 words, start with an uppercase letter and avoid repeating the headword.',
        createSchemaPrompt(ExampleAgentAdapter.SCHEMA),
    ].join('\n\n');

    public readonly name = 'ExampleAgent';

    constructor(
        private readonly model: LanguageModelV4,
        private readonly logger: LoggerPort,
    ) {}

    static readonly USER_PROMPT = (input: ExampleInput) =>
        [
            `Headword: ${input.word}`,
            'TASK: Write a single, concise English definition for the headword.',
        ].join('\n\n');

    async run(input: ExampleInput): Promise<ExampleResult> {
        this.logger.info(`Generating definition for word "${input.word}"`);

        const result = await generateStructured({
            model: this.model,
            prompt: ExampleAgentAdapter.USER_PROMPT(input),
            schema: ExampleAgentAdapter.SCHEMA,
            system: ExampleAgentAdapter.SYSTEM_PROMPT,
        });

        if (!result.success) {
            throw new Error(`Example agent failed (${result.error.code}): ${result.error.message}`);
        }

        // Log successful composition for debugging
        this.logger.info('Successfully generated definition', {
            definitionLength: result.data.definition.length,
        });

        return result.data;
    }
}
