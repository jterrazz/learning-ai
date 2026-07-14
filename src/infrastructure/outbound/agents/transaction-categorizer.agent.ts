import {
    BasicAgentAdapter,
    type ModelPort,
    PROMPT_LIBRARY,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/telemetry';
import { z } from 'zod/v4';

import { type TransactionCategorizerAgentPort } from '../../../application/ports/outbound/agents/transaction-categorizer.agent.js';

import { type Transaction, TransactionCategory } from '../../../domain/transaction.entity.js';

export class TransactionCategorizerAgentAdapter implements TransactionCategorizerAgentPort {
    static readonly SCHEMA = z.object({
        categories: z.record(z.string(), z.nativeEnum(TransactionCategory)),
    });

    static readonly SYSTEM_PROMPT = new SystemPromptAdapter(
        'You are an expert financial categorization engine.',
        'You receive an array of transactions and must return a JSON mapping of transaction IDs to a suitable category enum value: GROCERIES, SALARY, COFFEE, OTHER. Only output valid JSON conforming to the schema.',
        PROMPT_LIBRARY.FOUNDATIONS.CONTEXTUAL_ONLY,
    );

    public readonly name = 'TransactionCategorizerAgent';

    private readonly agent: BasicAgentAdapter<
        z.infer<typeof TransactionCategorizerAgentAdapter.SCHEMA>
    >;

    constructor(
        private readonly model: ModelPort,
        private readonly logger: LoggerPort,
    ) {
        this.agent = new BasicAgentAdapter(this.name, {
            logger: this.logger,
            model: this.model,
            schema: TransactionCategorizerAgentAdapter.SCHEMA,
            systemPrompt: TransactionCategorizerAgentAdapter.SYSTEM_PROMPT,
        });
    }

    static readonly USER_PROMPT = (transactions: Transaction[]) =>
        new UserPromptAdapter(
            'Transactions',
            JSON.stringify(
                transactions.map((t) => ({
                    amount: t.amount,
                    currency: t.currency,
                    description: t.description,
                    id: t.id,
                })),
            ),
            'TASK: Categorize each transaction and return a JSON object mapping transaction IDs to category values.',
        );

    async categorize(transactions: Transaction[]): Promise<Record<string, TransactionCategory>> {
        if (transactions.length === 0) return {};

        this.logger.info(`Categorizing ${transactions.length} transactions`);

        const result = await this.agent.run(
            TransactionCategorizerAgentAdapter.USER_PROMPT(transactions),
        );

        console.log(result);

        if (!result) {
            throw new Error('Agent returned no result');
        }

        return result.categories;
    }
}
