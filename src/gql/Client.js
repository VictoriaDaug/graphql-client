import {
    fetchExchange
} from './fetchExchange';
import {
    dedupExchange
} from './dedupExchange';
import {
    composeExchanges
} from './composeExchanges';
import {
    TEARDOWN
} from '../utils/constants';

export class Client {
    constructor(url, opts = {}) {
        this.context = {
            url,
            fetch: opts.fetch || window.fetch.bind(window),
            fetchOptions: opts.fetchOptions || {},
            requestPolicy: opts.requestPolicy || 'cache-first'
        };
        const exchanges = opts.exchanges || [dedupExchange, fetchExchange];
        this.sendOperation = composeExchanges(this, exchanges)(this.onResult.bind(this));
        this.listeners = {};
    }

    getListeners(key) {
        return this.listeners[key] || (this.listeners[key] = new Set())
    }
    onOperationStart(operation, cb) {
        const {
            key
        } = operation;
        const listeners = this.getListeners(key)
        listeners.add(cb)

        this.sendOperation(operation);
    }

    onOperationEnd(operation, cb) {
        const {
            key
        } = operation;
        const listeners = this.getListeners(key)
        listeners.delete(cb)
        if (listeners.size === 0) {
            this.sendOperation({
                ...operation,
                operationName: TEARDOWN
            });
        }
    }

    onResult = result => {
        const {
            key
        } = result.operation;
        const listeners = this.getListeners(key)
        listeners.forEach(listener => listener(result))
    }

    execute = (baseOperation, cb) => {
        const operation = {
            ...baseOperation,
            context: {
                ...this.context,
                ...baseOperation.context
            }
        };

        this.onOperationStart(operation, cb);
        return () => this.onOperationEnd(operation, cb);
    };
}