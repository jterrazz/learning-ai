import {
    BasicAgentAdapter,
    type ModelPort,
    PROMPT_LIBRARY,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/telemetry';
import { z } from 'zod/v4';

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
    static readonly SYSTEM_PROMPT = new SystemPromptAdapter(
        'You are an experienced lexicographer for an English dictionary.',
        'Provide concise, clearly-written definitions suitable for a general audience (CEFR B2). Use no more than 30 words, start with an uppercase letter and avoid repeating the headword.',
        PROMPT_LIBRARY.FOUNDATIONS.CONTEXTUAL_ONLY,
    );

    public readonly name = 'ExampleAgent';

    private readonly agent: BasicAgentAdapter<z.infer<typeof ExampleAgentAdapter.SCHEMA>>;

    constructor(
        private readonly model: ModelPort,
        private readonly logger: LoggerPort,
    ) {
        this.agent = new BasicAgentAdapter(this.name, {
            logger: this.logger,
            model: this.model,
            schema: ExampleAgentAdapter.SCHEMA,
            systemPrompt: ExampleAgentAdapter.SYSTEM_PROMPT,
        });
    }

    static readonly USER_PROMPT = (input: ExampleInput) =>
        new UserPromptAdapter(
            `Headword: ${input.word}`,
            '',
            'TASK: Write a single, concise English definition for the headword.',
        );

    async run(input: ExampleInput): Promise<ExampleResult> {
        this.logger.info(`Generating definition for word "${input.word}"`);

        const result = await this.agent.run(ExampleAgentAdapter.USER_PROMPT(input));

        if (!result) {
            throw new Error('Example agent returned no result');
        }

        // Log successful composition for debugging
        this.logger.info('Successfully generated definition', {
            definitionLength: result.definition.length,
        });

        return result;
    }
}
