import {
    CombinedError
} from '../utils/errorHandlers';
import {
    TEARDOWN
} from '../utils/constants';

export const composeExchanges = (client, exchanges) => {
    return exchanges.reduceRight((inner, exchange) => {
        return exchange({
            client,
            forward: inner
        })
    }, fallback);
};

const fallback = sendResult => operation => {
    if (operation.operationName !== TEARDOWN) {
        sendResult({
            operation,
            data: undefined,
            error: new CombinedError({
                networkError: new Error("Unhandled Operation")
            })
        });
    }
};