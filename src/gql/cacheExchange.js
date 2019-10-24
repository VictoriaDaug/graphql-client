import {
    addTypenames
} from "../utils/addTypenames";
import {
    collectTypes
} from '../utils/collectTypes';
import {
    QUERY,
    MUTATION
} from '../utils/constants'

export const cacheExchange = ({
    client,
    forward
}) => sendResult => {
    const resultCache = new Map();
    const typeCache = Object.create(null);

    const next = forward(result => {
        const {
            data,
            error,
            operation
        } = result;
        const types = collectTypes(data);

        if (operation.operationName === QUERY && data && !error) {
            resultCache.set(operation.key, data);
            types.forEach(type => {
                const ops = typeCache[type] || (typeCache[type] = []);
                ops.push(operation);
            });
        } else if (operation.operationName === MUTATION && data) {
            types.forEach(type => {
                const ops = typeCache[type] || (typeCache[type] = []);
                ops.forEach(op => client.reexecute(op));
                ops.forEach(op => {
                    resultCache.delete(op.key);
                    client.reexecute({
                        ...op,
                        context: {
                            ...op.context,
                            requestPolicy: 'network-only'
                        }
                    })
                });
                ops.length = 0;
            });
        }
        sendResult(result);
    });
    return inputOperation => {
        const {
            requestPolicy
        } = inputOperation.context;
        const operation = {
            ...inputOperation,
            query: addTypenames(inputOperation.query)
        };

        if (
            requestPolicy !== 'network-only' &&
            operation.operationName === QUERY &&
            resultCache.has(operation.key)
        ) {
            const data = resultCache.get(operation.key);
            sendResult({
                operation,
                data
            });
            if (requestPolicy === 'cache-and-network') {
                next(operation);
            }
        } else {
            next(operation);
        }
    };
};