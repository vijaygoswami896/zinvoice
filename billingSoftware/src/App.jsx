import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from './store/store';
import { queryClient } from '@app/queryClient';
import { setupInterceptors } from '@api/interceptors';
import AuthInitialiser from '@components/auth/AuthInitialiser';
import AppRoutes from '@routes/AppRoutes';

// Wire auth-aware Axios interceptors once the store exists
setupInterceptors(store);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Silently restores session from httpOnly cookie on page load */}
        <AuthInitialiser />
        <AppRoutes />
      </BrowserRouter>
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </Provider>
);

export default App;



// import { Provider } from 'react-redux';
// import { BrowserRouter } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { store } from './app/store';
// import AuthInitialiser from './components/auth/AuthInitialiser';
// import AppRoutes from './routes/AppRoutes';

// /**
//  * TanStack Query client.
//  *
//  * Configured conservatively:
//  *   - No automatic background refetching on window focus (invoices don't
//  *     change that fast; opt-in per query where needed).
//  *   - 3 retries on failure before surfacing the error.
//  *   - 401 errors are NOT retried — the Axios interceptor handles token refresh.
//  */
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: (failureCount, error) => {
//         // Don't retry auth errors
//         if (error?.response?.status === 401) return false;
//         if (error?.response?.status === 403) return false;
//         return failureCount < 3;
//       },
//       refetchOnWindowFocus: false,
//       staleTime: 1000 * 60 * 2, // 2 minutes
//     },
//     mutations: {
//       retry: 0,
//     },
//   },
// });

// const App = () => (
//   <Provider store={store}>
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         {/*
//           AuthInitialiser runs once on mount and performs a silent token refresh
//           using the httpOnly cookie. It must be inside BrowserRouter (uses dispatch)
//           but renders nothing itself.
//         */}
//         <AuthInitialiser />
//         <AppRoutes />
//       </BrowserRouter>
//     </QueryClientProvider>
//   </Provider>
// );

// export default App;
