import React from 'react'
import { useAuth } from '../../hooks/useAuth';

const DashboadPage = () => {
    const { logout, isLoggingOut } = useAuth();

    const handleLogout = () => {
        logout();
    }

    if (isLoggingOut) {
        return <div>Logging out...</div>;
    }

    return (
        <>
            <div>
                Welcome to Dashboard
            </div>

            <button onClick={handleLogout}>
                Logout
            </button>
        </>
    )
}

export default DashboadPage