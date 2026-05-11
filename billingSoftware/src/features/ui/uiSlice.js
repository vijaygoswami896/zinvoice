import { createSlice } from '@reduxjs/toolkit';

const isMobile = () => window.innerWidth < 769;

const initialState = {
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    pageTitle: 'Dashboard',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar(state) {
            if (isMobile()) {
                state.sidebarMobileOpen = !state.sidebarMobileOpen;
            } else {
                state.sidebarCollapsed = !state.sidebarCollapsed;
            }
        },
        setSidebarCollapsed(state, { payload }) {
            state.sidebarCollapsed = payload;
        },
        setSidebarMobileOpen(state, { payload }) {
            state.sidebarMobileOpen = payload;
        },
        closeMobileSidebar(state) {
            state.sidebarMobileOpen = false;
        },
        setPageTitle(state, { payload }) {
            state.pageTitle = payload;
        },
    },
});

export const {
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarMobileOpen,
    closeMobileSidebar,
    setPageTitle,
} = uiSlice.actions;

export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (s) => s.ui.sidebarMobileOpen;
export const selectPageTitle = (s) => s.ui.pageTitle;

export default uiSlice.reducer;
