import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  ADMIN: {
    id: 1,
    name: 'Admin Manager',
    email: 'admin@ghuleskitchen.com',
    role: 'admin',
  },
  KITCHEN: {
    id: 2,
    name: 'Spice Hub (Dipali & Manali)',
    email: 'kitchen@ghuleskitchen.com',
    role: 'kitchen',
    kitchen_id: 1
  },
  COOK: {
    id: 5,
    name: 'Priya Sharma',
    email: 'cook@ghuleskitchen.com',
    role: 'cook',
    cook_id: 1
  },
  CUSTOMER: {
    id: 4,
    name: 'Rahul Verma',
    email: 'customer@ghuleskitchen.com',
    role: 'customer'
  }
};

export const AuthProvider = ({ children }) => {
  // Default to Kitchen role so user immediately sees the Overload Demo upon landing or switching!
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ghules_user');
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.KITCHEN;
  });

  const [role, setRole] = useState(() => user.role || 'kitchen');

  useEffect(() => {
    if (user) {
      localStorage.setItem('ghules_user', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('ghules_user');
    }
  }, [user]);

  const switchDemoRole = (roleKey) => {
    const target = DEMO_ACCOUNTS[roleKey.toUpperCase()];
    if (target) {
      setUser(target);
      setRole(target.role);
      localStorage.setItem('ghules_token', `demo-token-${target.role}`);
    }
  };

  const loginUser = (userData, token) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('ghules_token', token);
  };

  const logout = () => {
    setUser(DEMO_ACCOUNTS.CUSTOMER);
    setRole('customer');
    localStorage.removeItem('ghules_token');
  };

  return (
    <AuthContext.Provider value={{ user, role, switchDemoRole, loginUser, logout, DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
