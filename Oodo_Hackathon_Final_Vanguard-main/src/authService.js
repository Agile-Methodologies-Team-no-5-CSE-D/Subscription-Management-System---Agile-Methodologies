const STORAGE_TOKEN_KEY = 'token';
const STORAGE_USER_SESSION = 'user';

const API_BASE_URL = "http://localhost:5000";

// 1. REGISTER
export const register = async (name, email, password, role = 'user') => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed.");
    }

    const data = await res.json();
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.setItem(STORAGE_USER_SESSION, JSON.stringify(data.user || data)); // Backend returns {token, user} or {token, id, name...}
    return data;
};

// 2. LOGIN
export const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Invalid email or password.");
    }

    const data = await res.json();
    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    // Ensure we store a consistent user object
    const user = data.user || { id: data.id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem(STORAGE_USER_SESSION, JSON.stringify(user));
    return { ...data, user };
};

// 3. REQUEST PASSWORD RESET (OTP)
export const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to request OTP.");
    }

    return await res.json();
};

// 4. VERIFY OTP
export const verifyOtp = async (email, otp) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "OTP verification failed.");
    }

    return await res.json();
};

// 5. RESET PASSWORD
export const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Password reset failed.");
    }

    return await res.json();
};

// 6. LOGOUT
export const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_SESSION);
};

// 7. CHECK AUTH
export const getStoredUser = () => {
    const userRaw = localStorage.getItem(STORAGE_USER_SESSION);
    if (!userRaw) return null;
    try {
        return JSON.parse(userRaw);
    } catch (e) {
        return null;
    }
};
