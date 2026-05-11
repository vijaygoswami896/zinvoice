import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { selectSidebarCollapsed } from '@features/ui/uiSlice';

/**
 * AppLayout — authenticated shell.
 *
 * Structure:
 *   ┌──────────┬─────────────────────────────────┐
 *   │          │  Topbar (fixed)                  │
 *   │ Sidebar  ├─────────────────────────────────┤
 *   │ (fixed)  │  <Outlet /> (page content)       │
 *   │          │                                  │
 *   └──────────┴─────────────────────────────────┘
 *
 * On mobile: sidebar slides in as a drawer over an overlay.
 */
const AppLayout = () => {
  const collapsed = useSelector(selectSidebarCollapsed);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={clsx('main-content', { 'main-content--collapsed': collapsed })}>
        <Topbar />
        <main className="content-area" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
