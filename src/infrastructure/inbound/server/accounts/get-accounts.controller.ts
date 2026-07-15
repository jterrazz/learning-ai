import { type GetAccountsUseCase } from '../../../../application/use-cases/accounts/get-accounts.use-case.js';
import { GetAccountsRequestHandler } from './get-accounts-request.handler.js';
import { GetAccountsResponsePresenter } from './get-accounts-response.presenter.js';

/**
 * Orchestrates HTTP request handling for get accounts endpoint
 * Delegates request processing, use case execution, and response formatting
 */
export class GetAccountsController {
    private readonly requestHandler: GetAccountsRequestHandler;
    private readonly responsePresenter: GetAccountsResponsePresenter;

    constructor(private readonly getAccountsUseCase: GetAccountsUseCase) {
        this.requestHandler = new GetAccountsRequestHandler();
        this.responsePresenter = new GetAccountsResponsePresenter();
    }

    async getAccounts(rawQuery: unknown) {
        const validatedParams = this.requestHandler.handle(rawQuery);

        const result = await this.getAccountsUseCase.execute(validatedParams);

        return this.responsePresenter.present(result);
    }
}
