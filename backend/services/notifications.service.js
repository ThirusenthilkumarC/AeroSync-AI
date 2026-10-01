import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedNotifications } from '../data/seedData.js';

let notificationsStore = [...seedNotifications];

export const getNotificationsService = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (data?.length) return data;
    } catch (err) {
      console.warn('[NotificationsService] Supabase fallback:', err.message);
    }
  }
  return notificationsStore;
};

export const markNotificationAsReadService = async (id) => {
  const notif = notificationsStore.find(n => n.id === id);
  if (notif) {
    notif.is_read = true;
    return notif;
  }
  return null;
};

export const createNotificationService = async (notifData) => {
  const newNotif = {
    id: `notif-${Date.now()}`,
    ...notifData,
    is_read: false,
    created_at: new Date().toISOString()
  };
  notificationsStore.unshift(newNotif);
  return newNotif;
};
