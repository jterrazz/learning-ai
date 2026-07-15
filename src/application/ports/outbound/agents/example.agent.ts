/**
 * @description
 * Port for the Example Agent that generates word definitions
 */
export interface ExampleAgentPort {
    run: (input: ExampleInput) => Promise<ExampleResult>;
}

/**
 * @description
 * Input data required for word definition
 */
export interface ExampleInput {
    word: string;
}

/**
 * @description
 * Result of word definition
 */
export interface ExampleResult {
    definition: string;
}
