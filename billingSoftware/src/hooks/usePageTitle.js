import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@features/ui/uiSlice';
import { APP_NAME } from '@constants';

/**
 * Sets the page title in Redux (for the topbar) and the document title.
 *
 * @param {string} title
 * @param {string} [section] - Optional breadcrumb parent section
 *
 * @example
 *   usePageTitle('Invoices');
 *   usePageTitle('New Invoice', 'Invoices');
 */
export const usePageTitle = (title, section) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const label = section ? `${section} / ${title}` : title;
        dispatch(setPageTitle(label));
        document.title = `${title} — ${APP_NAME}`;

        return () => {
            document.title = APP_NAME;
        };
    }, [title, section, dispatch]);
};
