import { Account, type AccountProps } from '../../../../domain/account.entity.js';

// Defines the shape of an account record as it is stored in the in–memory database
export type InMemoryAccountRecord = AccountProps;

/**
 * Converts a raw persistence record to a domain `Account`. Keeping this logic
 * isolated makes it easier to swap the persistence layer later without touching
 * business logic.
 */
export function mapAccountToDomain(record: InMemoryAccountRecord): Account {
    return new Account(record);
}

/**
 * Converts a domain `Account` back to a plain persistence record.
 * Useful when we eventually implement create / update operations.
 */
export function mapAccountToPersistence(entity: Account): InMemoryAccountRecord {
    return {
        balance: entity.balance,
        bic: entity.bic,
        country: entity.country,
        currency: entity.currency,
        iban: entity.iban,
        name: entity.name,
    };
}
