interface Variables {
    transactionsJson: string;
}

export const buildSystemPrompt = (): string => {
    return `You are an expert financial categorization engine.

You receive an array of transactions and must return a JSON mapping of transaction IDs to a suitable category enum value: GROCERIES, SALARY, COFFEE, OTHER. Only output valid JSON conforming to the schema.`;
};

export const buildPrompt = (v: Variables): string => {
    return `Transactions

${v.transactionsJson}

TASK: Categorize each transaction and return a JSON object mapping transaction IDs to category values.`;
};
