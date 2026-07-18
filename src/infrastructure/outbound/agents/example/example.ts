import { type LoggerPort } from '@jterrazz/telemetry';
import { generateText, type LanguageModel, Output } from 'ai';
import { z } from 'zod';

import {
    type ExampleAgentPort,
    type ExampleInput,
    type ExampleResult,
} from '../../../../application/ports/outbound/agents/example.agent.js';
import { buildPrompt, buildSystemPrompt } from './example.prompt.js';

export class ExampleAgentAdapter implements ExampleAgentPort {
    static readonly SCHEMA = z.object({
        definition: z.string(),
    });

    public readonly name = 'ExampleAgent';

    constructor(
        private readonly model: LanguageModel,
        private readonly logger: LoggerPort,
    ) {}

    async run(input: ExampleInput): Promise<ExampleResult> {
        this.logger.info(`Generating definition for word "${input.word}"`);

        const result = await generateText({
            model: this.model,
            output: Output.object({ schema: ExampleAgentAdapter.SCHEMA }),
            prompt: buildPrompt({ word: input.word }),
            system: buildSystemPrompt(),
        });

        // Log successful composition for debugging
        this.logger.info('Successfully generated definition', {
            definitionLength: result.output.definition.length,
        });

        return result.output;
    }
}
