import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // 알림 목록
  unreadCount: 0, // 읽지 않은 알림 개수
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((notif) => !notif.read).length;
    },
    markAsReadInStore: (state, action) => {
      const notifId = action.payload;
      const updatedNotifications = state.notifications.map((notif) =>
        notif.id === notifId ? { ...notif, read: true } : notif
      );
      state.notifications = updatedNotifications;
      state.unreadCount = updatedNotifications.filter((notif) => !notif.read).length;
    },
  },
});

export const { setNotifications, markAsReadInStore } = notificationSlice.actions;
export default notificationSlice.reducer;
