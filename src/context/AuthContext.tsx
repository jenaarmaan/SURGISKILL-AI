// SurgiSkill AI - Authentication & Role-Based Access Control Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, NotificationItem } from '../types/index.ts';
import { MOCK_USERS } from '../data/mockSurgicalData.ts';
import { ApiClient } from '../services/apiClient.ts';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.student);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial load
    ApiClient.getCurrentUser()
      .then((res) => {
        if (res.user) setCurrentUser(res.user);
      })
      .catch((err) => console.log('Using local user session:', err));

    refreshNotifications();
  }, []);

  const refreshNotifications = async () => {
    try {
      const res = await ApiClient.getNotifications();
      if (res.notifications) setNotifications(res.notifications);
    } catch (err) {
      console.log('Using local notifications');
    }
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.switchRole(newRole);
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      // Local fallback
      const target =
        newRole === 'STUDENT'
          ? MOCK_USERS.student
          : newRole === 'FACULTY'
          ? MOCK_USERS.faculty
          : newRole === 'CLINICAL_LEAD'
          ? MOCK_USERS.clinicalLead
          : newRole === 'INSTITUTION_ADMIN'
          ? MOCK_USERS.institutionAdmin
          : MOCK_USERS.superAdmin;
      setCurrentUser(target);
    } finally {
      setIsLoading(false);
      refreshNotifications();
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await ApiClient.markNotificationRead(id);
    } catch {
      // local
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        switchRole,
        notifications,
        unreadCount,
        markNotificationAsRead,
        refreshNotifications,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
