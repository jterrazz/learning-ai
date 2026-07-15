import {
    type AccountRepositoryPort,
    type FindManyOptions,
} from '../../../../application/ports/outbound/persistence/account-repository.port.js';
import { type Account } from '../../../../domain/account.entity.js';
import {
    type InMemoryAccountRecord,
    mapAccountToDomain,
    mapAccountToPersistence,
} from './in-memory-account.mapper.js';

/**
 * Simple, thread-unsafe in-memory implementation of the {@link AccountRepositoryPort}.
 * Suitable for unit testing and local development. **Do not use in production.**
 */
export class InMemoryAccountAdapter implements AccountRepositoryPort {
    private readonly records: InMemoryAccountRecord[];

    /**
     * Creates an in-memory store pre-populated with two demo accounts so the
     * application has predictable data out of the box.
     */
    constructor() {
        this.records = [
            {
                balance: 1000,
                bic: 'REVOGB21',
                country: 'GB',
                currency: 'GBP',
                iban: 'GB29NWBK60161331926819',
                name: 'Personal',
            },
            {
                balance: 2000,
                bic: 'DEUTDEFF',
                country: 'DE',
                currency: 'EUR',
                iban: 'DE89370400440532013000',
                name: 'Savings',
            },
        ];
    }

    /**
     * Finds accounts that match the optional filter criteria.
     *
     * Currently supports filtering by currency and will silently ignore unsupported options.
     */
    public async findMany(options: FindManyOptions = {}): Promise<Account[]> {
        const { currency } = options;

        let filteredRecords = this.records;
        if (currency) {
            filteredRecords = filteredRecords.filter(
                (record) => record.currency.toUpperCase() === currency.toUpperCase(),
            );
        }

        return filteredRecords.map(mapAccountToDomain);
    }

    /**
     * Adds a new account to the in-memory store. Handy in tests.
     */
    public insert(account: Account): void {
        this.records.push(mapAccountToPersistence(account));
    }
}
