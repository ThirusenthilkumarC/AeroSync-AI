import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Info, Sparkles, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { notificationsData } from '../data/notifications';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifs = notifications.filter(n => 
    activeCategory === 'ALL' || n.category === activeCategory
  );

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full uppercase">
              OCC TELEMETRY FEED & SYSTEM ALERTS
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl font-extrabold tracking-tight text-on-surface">
            Notification Center
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-3xl mt-1">
            Real-time incident streams, crew duty warnings, gate conflict alerts, and synthetic AI recovery plan dispatches.
          </p>
        </div>

        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm font-semibold text-xs border border-surface-container-highest"
        >
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {['ALL', 'Critical', 'Warning', 'AI Recommendation', 'Info'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-surface-container-highest hover:bg-surface-container-high'
            }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => notif.actionPath && navigate(notif.actionPath)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !notif.read ? 'bg-surface-container-lowest border-secondary/40 shadow-sm' : 'bg-surface-container-low/60 border-surface-container-highest'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notif.category === 'Critical' ? 'bg-error-container text-on-error-container' :
                notif.category === 'Warning' ? 'bg-amber-100 text-amber-900' :
                notif.category === 'AI Recommendation' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                'bg-surface-container-high text-on-surface'
              }`}>
                {notif.category === 'Critical' ? <AlertTriangle className="w-5 h-5" /> :
                 notif.category === 'Warning' ? <AlertTriangle className="w-5 h-5" /> :
                 notif.category === 'AI Recommendation' ? <Sparkles className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-label-code font-bold uppercase ${
                    notif.category === 'Critical' ? 'bg-error text-on-error' :
                    notif.category === 'Warning' ? 'bg-amber-500 text-white' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {notif.category}
                  </span>
                  <h3 className="font-bold text-sm text-on-surface font-headline-md">{notif.title}</h3>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.description}</p>
                <div className="text-[11px] text-outline font-label-code mt-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            </div>

            {notif.actionPath && (
              <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold shrink-0 flex items-center gap-1">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
