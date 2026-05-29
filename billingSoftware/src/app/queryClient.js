import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query client.
 *
 * Retry strategy: skip retries for auth errors (Axios interceptor handles
 * token refresh and re-queuing); retry other failures up to 3 times.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const status = error?.response?.status;
                if (status === 401 || status === 403 || status === 404) return false;
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 2,   // 2 minutes
            gcTime: 1000 * 60 * 10,  // 10 minutes
        },
        mutations: {
            retry: 0,
        },
    },
});
