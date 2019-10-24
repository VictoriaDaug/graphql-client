import {
    useState,
    useEffect
} from 'react';
import {
    useRequest
} from './useRequest';
import {
    useClient
} from '../contexts/contextCreator';
import {
    QUERY
} from '../utils/constants'

export const useQuery = ({
    query,
    variables
}) => {
    const client = useClient();
    const request = useRequest(QUERY, query, variables);

    const [result, setResult] = useState({
        fetching: true
    });

    useEffect(() => {
        setResult(res => ({
            ...res,
            fetching: true
        }));

        return client.execute(request, result => {
            setResult({
                ...result,
                fetching: false
            });
        });
    }, [request, client]);

    return result;
};