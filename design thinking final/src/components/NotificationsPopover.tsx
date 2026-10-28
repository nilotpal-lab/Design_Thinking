import React, { useState } from 'react';
import { Bell, Check, X, Clock, MapPin, AlertCircle, ShoppingBag, Calendar } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'issue' | 'event' | 'marketplace' | 'space';
  isRead: boolean;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Issue #0241 Assigned',
      message: 'Maintenance team assigned to Projector failure in Room 204.',
      time: '10m ago',
      category: 'issue',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Upcoming Event Today',
      message: '"AI and Beyond - Ethical Dilemmas" starts at 4:30 PM in Seminar Hall 1.',
      time: '45m ago',
      category: 'event',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'New Marketplace Listing',
      message: 'HP Laptop (i5, 8GB RAM) listed in Hostel Block A for ₹22,000.',
      time: '2h ago',
      category: 'marketplace',
      isRead: true,
    },
    {
      id: 'notif-4',
      title: 'Classroom Availability',
      message: 'Room 302 is now Free for self-study until Period 6 (3:15 PM).',
      time: '3h ago',
      category: 'space',
      isRead: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-black/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="p-4 bg-[#FAF8F5] border-b border-black/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-charcoal">Campus Alerts</span>
          {unreadCount > 0 && (
            <span className="bg-[#155137] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-forest hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-charcoal-muted space-y-1">
            <Bell className="w-8 h-8 mx-auto text-charcoal-muted/40" />
            <p className="text-xs font-semibold text-charcoal">No notifications</p>
            <p className="text-[11px]">You're all caught up with campus events and announcements.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (n.category === 'issue') onNavigate('issues');
                else if (n.category === 'event') onNavigate('calendar');
                else if (n.category === 'marketplace') onNavigate('marketplace');
                else if (n.category === 'space') onNavigate('spaces');
                onClose();
              }}
              className={`p-3.5 hover:bg-[#FAF8F5] cursor-pointer transition-colors flex items-start gap-3 ${
                !n.isRead ? 'bg-[#EAF4EE]/30' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.category === 'issue' && (
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.category === 'event' && (
                  <div className="w-7 h-7 rounded-full bg-[#EBF5F0] text-[#155137] flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.category === 'marketplace' && (
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                )}
                {n.category === 'space' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-charcoal truncate">{n.title}</h4>
                  <span className="text-[10px] text-charcoal-muted shrink-0">{n.time}</span>
                </div>
                <p className="text-[11px] text-charcoal-muted line-clamp-2 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#155137] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-[#FAF8F5] border-t border-black/5 text-center">
          <button
            onClick={clearAll}
            className="text-[11px] font-medium text-charcoal-muted hover:text-charcoal"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};
