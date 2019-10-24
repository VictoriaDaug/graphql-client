import {
    print
} from 'graphql';
import {
    CombinedError
} from '../utils/errorHandlers';

export const fetchExchange = () => sendResult => {
    return operation => {
        const {
            query,
            variables,
            context
        } = operation;
        const {
            fetchOptions,
            url
        } = context;

        const options = {
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
            }) => ({
                operation,
                data,
                error: errors ? new CombinedError({
                    graphQLErrors: errors
                }) : undefined
            }))
            .catch(networkError => ({
                operation,
                data: undefined,
                error: new CombinedError({
                    networkError
                })
            }))
            .then(sendResult);
    };
};