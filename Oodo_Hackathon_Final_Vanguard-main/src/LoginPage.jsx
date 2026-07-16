import React, { useState, useEffect } from 'react';
import { login, register, logout, getStoredUser, requestPasswordReset, verifyOtp, resetPassword } from './authService';

const AuthStatus = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
};

const LoginPage = () => {
    const [mode, setMode] = useState('LOGIN');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState(AuthStatus.IDLE);
    const [errorMessage, setErrorMessage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetStep, setResetStep] = useState(1);
    const [resetMessage, setResetMessage] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            if (storedUser.role === 'admin' || storedUser.role === 'internal_staff') {
                window.location.href = '/';
            } else {
                window.location.href = '/portal/home';
            }
        }
    }, []);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setRole('user');
        setErrorMessage(null);
        setStatus(AuthStatus.IDLE);
        setResetEmail('');
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setResetStep(1);
        setResetMessage(null);
    };

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'FORGOT') return;
        setStatus(AuthStatus.LOADING);
        setErrorMessage(null);

        try {
            let response;
            if (mode === 'REGISTER') {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                response = await register(name, email, password, role);
            } else {
                response = await login(email, password);
            }

            setCurrentUser(response.user);
            setStatus(AuthStatus.SUCCESS);

            // Role-based redirection
            if (response.user.role === 'admin' || response.user.role === 'internal_staff') {
                window.location.href = '/';
            } else {
                window.location.href = '/portal/home';
            }
        } catch (err) {
            setStatus(AuthStatus.ERROR);
            setErrorMessage(err.message || "An unexpected error occurred");
        }
    };

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setStatus(AuthStatus.IDLE);
        setMode('LOGIN');
    };

    const handleRequestOtp = async () => {
        setStatus(AuthStatus.LOADING);
        setErrorMessage(null);
        setResetMessage(null);
        try {
            const response = await requestPasswordReset(resetEmail);
            setResetMessage(response.message + (response.otp ? ` OTP: ${response.otp}` : ''));
            setResetStep(2);
            setStatus(AuthStatus.IDLE);
        } catch (err) {
            setStatus(AuthStatus.ERROR);
            setErrorMessage(err.message || "Failed to request OTP");
        }
    };

    const handleVerifyOtp = async () => {
        setStatus(AuthStatus.LOADING);
        setErrorMessage(null);
        try {
            await verifyOtp(resetEmail, resetOtp);
            setResetStep(3);
            setStatus(AuthStatus.IDLE);
        } catch (err) {
            setStatus(AuthStatus.ERROR);
            setErrorMessage(err.message || "OTP verification failed");
        }
    };

    const handleResetPassword = async () => {
        setStatus(AuthStatus.LOADING);
        setErrorMessage(null);
        if (resetNewPassword !== resetConfirmPassword) {
            setStatus(AuthStatus.ERROR);
            setErrorMessage("Passwords do not match");
            return;
        }
        try {
            const response = await resetPassword(resetEmail, resetOtp, resetNewPassword);
            setResetMessage(response.message);
            setStatus(AuthStatus.SUCCESS);
            setMode('LOGIN');
            setEmail(resetEmail);
            setPassword('');
        } catch (err) {
            setStatus(AuthStatus.ERROR);
            setErrorMessage(err.message || "Password reset failed");
        }
    };


    // --- AUTH FORMS ---
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-display">
            <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark pointer-events-none z-0"></div>

            <div className="w-full max-w-md bg-white dark:bg-[#1a2e1f] rounded-xl shadow-2xl relative z-10 border border-[#dbe6de] dark:border-[#2a4531]">
                <div className="flex items-center border-b border-[#f0f4f1] dark:border-[#2a4531]">
                    <button
                        onClick={() => handleModeSwitch('LOGIN')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors relative ${mode === 'LOGIN' ? 'text-primary' : 'text-[#61896b] hover:text-[#111813] dark:hover:text-white'}`}
                    >
                        Sign In
                        {mode === 'LOGIN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                    <button
                        onClick={() => handleModeSwitch('REGISTER')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors relative ${mode === 'REGISTER' ? 'text-primary' : 'text-[#61896b] hover:text-[#111813] dark:hover:text-white'}`}
                    >
                        Create Account
                        {mode === 'REGISTER' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                </div>

                <div className="px-8 py-8 flex flex-col gap-6">
                    <div className="text-center">
                        <h1 className="text-[#111813] dark:text-white text-2xl font-bold tracking-tight mb-2">
                            {mode === 'LOGIN' ? 'Welcome Back' : 'Get Started'}
                        </h1>
                        <p className="text-[#61896b] dark:text-[#a0cfa5] text-sm">
                            {mode === 'LOGIN' ? 'Enter your credentials to access your account.' : 'Join us to manage your projects efficiently.'}
                        </p>
                    </div>

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm animate-pulse">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errorMessage}
                            </div>
                        )}
                        {resetMessage && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                {resetMessage}
                            </div>
                        )}

                        {mode === 'FORGOT' ? (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="resetEmail">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61896b] flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </span>
                                        <input
                                            id="resetEmail"
                                            name="resetEmail"
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white pl-11 pr-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                        />
                                    </div>
                                </div>
                                {resetStep >= 2 && (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="resetOtp">OTP</label>
                                        <input
                                            id="resetOtp"
                                            name="resetOtp"
                                            type="text"
                                            required
                                            placeholder="6-digit OTP"
                                            value={resetOtp}
                                            onChange={(e) => setResetOtp(e.target.value)}
                                            className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white px-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                        />
                                    </div>
                                )}
                                {resetStep >= 3 && (
                                    <>
                                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="resetNewPassword">New Password</label>
                                            <input
                                                id="resetNewPassword"
                                                name="resetNewPassword"
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="••••••••"
                                                value={resetNewPassword}
                                                onChange={(e) => setResetNewPassword(e.target.value)}
                                                className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white px-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="resetConfirmPassword">Confirm New Password</label>
                                            <input
                                                id="resetConfirmPassword"
                                                name="resetConfirmPassword"
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="••••••••"
                                                value={resetConfirmPassword}
                                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                                className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white px-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                                {resetStep === 1 && <button type="button" onClick={handleRequestOtp} className="mt-2 w-full font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary hover:bg-primary-dark text-[#111813]">{status === AuthStatus.LOADING ? 'Sending...' : 'Send OTP'}</button>}
                                {resetStep === 2 && <button type="button" onClick={handleVerifyOtp} className="mt-2 w-full font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary hover:bg-primary-dark text-[#111813]">{status === AuthStatus.LOADING ? 'Verifying...' : 'Verify OTP'}</button>}
                                {resetStep === 3 && <button type="button" onClick={handleResetPassword} className="mt-2 w-full font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary hover:bg-primary-dark text-[#111813]">{status === AuthStatus.LOADING ? 'Updating...' : 'Reset Password'}</button>}
                            </>
                        ) : (
                            <>
                                {mode === 'REGISTER' && (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="name">Full Name</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61896b] flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-[20px]">person</span>
                                            </span>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white pl-11 pr-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {mode === 'REGISTER' && (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold">Account Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setRole('user')}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${role === 'user' ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary font-bold shadow-sm' : 'bg-white dark:bg-[#15251a] border-[#dbe6de] dark:border-[#3a5840] text-[#61896b] hover:border-primary/50'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">person</span>
                                                User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('admin')}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${role === 'admin' ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-sm' : 'bg-white dark:bg-[#15251a] border-[#dbe6de] dark:border-[#3a5840] text-[#61896b] hover:border-purple-400'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                                Admin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('internal_staff')}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${role === 'internal_staff' ? 'bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-sm' : 'bg-white dark:bg-[#15251a] border-[#dbe6de] dark:border-[#3a5840] text-[#61896b] hover:border-teal-400'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">badge</span>
                                                Staff
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="email">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61896b] flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white pl-11 pr-4 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="password">Password</label>
                                        {mode === 'LOGIN' && <button type="button" onClick={() => handleModeSwitch('FORGOT')} className="text-[#61896b] hover:text-primary text-xs font-medium transition-colors font-semibold uppercase tracking-wider">Forgot password?</button>}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61896b] flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[20px]">lock</span>
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white pl-11 pr-12 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61896b] hover:text-[#111813] dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {mode === 'REGISTER' && (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[#111813] dark:text-[#e0e7e1] text-sm font-semibold" htmlFor="confirmPassword">Confirm Password</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61896b] flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                                            </span>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="form-input w-full rounded-lg border border-[#dbe6de] dark:border-[#3a5840] bg-white dark:bg-[#15251a] text-[#111813] dark:text-white pl-11 pr-12 py-3 focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary placeholder-[#61896b]/60 dark:placeholder-[#61896b] outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === AuthStatus.LOADING}
                                    className={`mt-2 w-full font-bold py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group ${status === AuthStatus.LOADING ? 'opacity-80' : ''} ${mode === 'REGISTER' && role === 'admin' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20' : mode === 'REGISTER' && role === 'internal_staff' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20' : 'bg-primary hover:bg-primary-dark text-[#111813] shadow-primary/20'}`}
                                >
                                    {status === AuthStatus.LOADING ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <><span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span><span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span></>}
                                </button>
                            </>
                        )}
                    </form>

                    <div className="pt-2 flex flex-col items-center gap-4 border-t border-[#f0f4f1] dark:border-[#2a4531]">
                        <p className="text-sm text-[#61896b] dark:text-[#8ab895]">
                            {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => handleModeSwitch(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                                className="text-[#111813] dark:text-white font-semibold hover:text-primary transition-colors hover:underline"
                            >
                                {mode === 'LOGIN' ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
