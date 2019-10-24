import {
    print
} from 'graphql';
import {
    CombinedError
} from '../utils/errorHandlers';
import {
    TEARDOWN
} from '../utils/constants';

export const fetchExchange = ({
    client,
    forward
}) => sendResult => {
    const next = forward(sendResult)
    const controllers = new Map();

    return operation => {
        if (operation.operationName === TEARDOWN) {
            const controller = controllers.get(operation.key);
            if (controller !== undefined) controller.abort();
            return next(operation);
        } else if (operation.operationName === 'subscription') {
            return next(operation)
        }

        const {
            query,
            variables,
            context
        } = operation;
        const {
            fetchOptions,
            url
        } = context;

        // New to most browsers. Might require a polyfill 
        const controller = new AbortController();
        controllers.set(operation.key, controller)

        const options = {
            signal: controller.signal,
            method: "POST",
            body: JSON.stringify({
                query: print(query),
                variables
            }),
            headers: {
                "content-type": "application/json",
                ...fetchOptions.headers
            },
            ...fetchOptions
        };

        context.fetch(url, options)
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(res.statusText);
                } else {
                    return res.json();
                }
            })
            .then(({
                data,
                errors
            }) => {
                controllers.delete(operation.key);
                sendResult({
                    operation,
                    data,
                    error: errors ? new CombinedError({
                        graphQLErrors: errors
                    }) : undefined
                });
            })
            .catch(networkError => {
                controllers.delete(operation.key);
                if (networkError.name === 'AbortError') return;
                sendResult({
                    operation,
                    data: undefined,
                    error: new CombinedError({
                        networkError
                    })
                });
            });
    };
};