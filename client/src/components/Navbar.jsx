import React, { useContext, useState } from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ title }) => {
  const { user } = useContext(AuthContext);
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => markAsRead(notif._id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <h4 className="text-sm font-semibold text-gray-800">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notif.body}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <UserIcon />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
