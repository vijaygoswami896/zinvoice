import { usePageTitle } from '../../hooks/usePageTitle';

const DashboardPage = () => {
    usePageTitle('Dashboard');

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Dashboard</h2>
                    <p className="page-subtitle">Welcome back. Here's what's happening today.</p>
                </div>
            </div>
            {/* Stats, charts, and summary cards will go here */}
        </div>
    );
};

export default DashboardPage;
