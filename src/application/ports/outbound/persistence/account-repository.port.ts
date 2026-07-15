import { type Account } from '../../../../domain/account.entity.js';

/**
 * Account repository port – defines how account entities can be persisted and retrieved.
 */
export interface AccountRepositoryPort {
    /**
     * Find accounts matching the given criteria
     */
    findMany: (options: FindManyOptions) => Promise<Account[]>;
}

export interface FindManyOptions {
    currency?: string;
}
