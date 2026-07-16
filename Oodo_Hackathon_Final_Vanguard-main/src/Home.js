import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-[#1a2e1f] rounded-xl shadow-2xl p-8 border border-[#dbe6de] dark:border-[#2a4531]">
                <h1 className="text-3xl font-bold text-[#111813] dark:text-white mb-6">Welcome to Subscription Management</h1>
                <p className="text-[#61896b] dark:text-[#a0cfa5] mb-8">
                    You have successfully logged in. This is your dashboard.
                </p>
                <button
                    onClick={handleLogout}
                    className="bg-primary hover:bg-primary-dark text-[#111813] font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Home;
