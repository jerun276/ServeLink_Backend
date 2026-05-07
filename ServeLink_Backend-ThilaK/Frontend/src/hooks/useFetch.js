import { useCallback, useEffect, useState } from 'react';

const useFetch = ({ request, immediate = true, args = [] }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState('');

  const execute = useCallback(
    async (...runtimeArgs) => {
      setLoading(true);
      setError('');
      try {
        const response = await request(...runtimeArgs);
        setData(response);
        return response;
      } catch (apiError) {
        const message = apiError?.response?.data?.message || apiError?.message || 'Request failed.';
        setError(message);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  useEffect(() => {
    if (!immediate) return;
    execute(...args);
  }, [execute, immediate]);

  return { data, loading, error, execute };
};

export default useFetch;
