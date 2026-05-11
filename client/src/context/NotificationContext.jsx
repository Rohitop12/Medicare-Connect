import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import { toast } from 'react-toastify';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_reminder', (data) => {
        toast.info(data.title, { position: "top-right", autoClose: 5000 });
        setNotifications((prev) => [{ ...data, isRead: false, createdAt: new Date() }, ...prev]);
      });

      return () => {
        socket.off('new_reminder');
      };
    }
  }, [socket]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
