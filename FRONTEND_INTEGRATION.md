# Frontend Integration Guide

This guide explains how to integrate the backend API with the existing React frontend.

## Overview

The current frontend uses localStorage for data persistence. This guide shows how to replace localStorage calls with API calls to the new backend.

## Step 1: Install Dependencies

Add axios for API calls:

```bash
cd sales-tracker
npm install axios
```

## Step 2: Create API Client

Create `src/utils/api.js`:

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Step 3: Create Auth Context

Create `src/context/AuthContext.js`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      setLoading(false);
    } catch (error) {
      logout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return user;
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { token, user } = response.data.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Step 4: Update storage.js

Replace `src/utils/storage.js` with API calls:

```javascript
import api from './api';

/**
 * Get goals for current user
 */
export const getGoals = async () => {
  try {
    const response = await api.get('/goals');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

/**
 * Save goals for current user
 */
export const saveGoals = async (goals) => {
  try {
    const response = await api.put('/goals', goals);
    return response.data.data;
  } catch (error) {
    console.error('Error saving goals:', error);
    throw error;
  }
};

/**
 * Get week data for current user
 */
export const getWeekData = async (weekStart) => {
  try {
    const response = await api.get(`/activity/week/${weekStart}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No data for this week
    }
    console.error('Error fetching week data:', error);
    throw error;
  }
};

/**
 * Save week data for current user
 */
export const saveWeekData = async (weekStart, data) => {
  try {
    const response = await api.post('/activity/week', {
      weekStartDate: weekStart,
      ...data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error saving week data:', error);
    throw error;
  }
};

/**
 * Get all activities for export
 */
export const getAllActivities = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/activity/all', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw error;
  }
};
```

## Step 5: Create Login Page

Create `src/components/Login.js`:

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required={!isLogin}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            {!isLogin && (
              <p className="text-sm text-gray-600 mt-1">
                Min 8 characters, 1 uppercase, 1 number
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

## Step 6: Update App.js

Wrap your app with AuthProvider and add routing:

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

## Step 7: Update Dashboard Component

Update Dashboard to use async data fetching:

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGoals, getWeekData, saveWeekData } from '../utils/storage';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState(null);
  const [weekData, setWeekData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, activityData] = await Promise.all([
        getGoals(),
        getWeekData(getCurrentMonday()),
      ]);
      setGoals(goalsData);
      setWeekData(activityData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <header className="bg-blue-600 text-white p-4 flex justify-between">
        <h1>Sales Activity Tracker</h1>
        <div>
          <span>{user.firstName} {user.lastName}</span>
          <button onClick={logout} className="ml-4 underline">
            Logout
          </button>
        </div>
      </header>
      {/* Rest of your dashboard */}
    </div>
  );
};

export default Dashboard;
```

## Step 8: Add Environment Variable

Create `.env` in the frontend root:

```
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Step 9: Install React Router

```bash
npm install react-router-dom
```

## Migration Path

For existing users with localStorage data:

1. Create a migration utility that reads localStorage
2. After login, check if localStorage has old data
3. If yes, call migration endpoint or manually POST each week
4. Clear localStorage after successful migration

## Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] Token persists on page reload
- [ ] User is redirected to login when token expires
- [ ] Goals are fetched from API
- [ ] Goals can be updated via API
- [ ] Weekly activities are fetched from API
- [ ] Weekly activities can be saved via API
- [ ] Excel export works with API data
- [ ] Logout clears token and redirects to login

## Common Issues

### CORS Errors
- Ensure backend CORS_ORIGIN matches your frontend URL
- Check browser console for specific CORS errors

### 401 Errors
- Verify token is being sent in Authorization header
- Check token hasn't expired
- Ensure user is logged in

### Network Errors
- Verify backend is running on correct port
- Check REACT_APP_API_URL is correct
- Ensure no firewall blocking requests

## Next Steps

1. Remove sales rep selector (now uses logged-in user)
2. Add admin dashboard for viewing other users
3. Add profile page for updating user info
4. Add password reset functionality
5. Add organization management (if needed)

