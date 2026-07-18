interface Variables {
    word: string;
}

export const buildSystemPrompt = (): string => {
    return `You are an experienced lexicographer for an English dictionary.

Provide concise, clearly-written definitions suitable for a general audience (CEFR B2). Use no more than 30 words, start with an uppercase letter and avoid repeating the headword.`;
};

export const buildPrompt = (v: Variables): string => {
    return `Headword: ${v.word}

TASK: Write a single, concise English definition for the headword.`;
};
