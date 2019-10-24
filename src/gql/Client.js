import {
    print
} from 'graphql';
import {
    CombinedError
} from '../utils/errorHandlers';

const executeFetch = async operation => {
    const {
        query,
        variables,
        context
    } = operation;

    const options = {
        method: 'POST',
        body: JSON.stringify({
            query: print(query),
            variables
        }),
        headers: {
            'content-type': 'application/json',
            ...context.fetchOptions.headers
        },
        ...context.fetchOptions
    }
    return context.fetch(context.url, options)
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
            error: errors ?
                new CombinedError({
                    graphQLErrors: errors
                }) : undefined
        }))
        .catch(networkError => ({
            operation,
            data: undefined,
            error: new CombinedError({
                networkError
            })
        }));
};

export class Client {
    constructor(url, context = {}) {
        this.context = {
            url,
            fetch: context.fetch || window.fetch.bind(window),
            fetchOptions: context.fetchOptions || {},
            requestPolicy: context.requestPolicy || 'cache-first'
        };
    }

    execute = async (baseOperation, cb) => {
        const operation = {
            ...baseOperation,
            context: {
                ...this.context,
                ...baseOperation.context
            }
        };

        const result = await executeFetch(operation);
        cb(result);
    };
}