import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  meetingReminders: boolean;
  taskReminders: boolean;
  dailyDigest: boolean;
  reminderTime: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  meetingReminders: true,
  taskReminders: true,
  dailyDigest: false,
  reminderTime: 60,
};

class NotificationService {
  private initialized = false;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async initialize(): Promise<void> {
    if (this.initialized || Platform.OS === 'web') {
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (hasPermission) {
      this.initialized = true;
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  async scheduleMeetingNotification(meeting: {
    id: string;
    title: string;
    startTime: string;
    location?: string;
    minutesBefore?: number;
  }): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    const settings = await this.getSettings();
    if (!settings.enabled || !settings.meetingReminders) {
      return null;
    }

    try {
      await this.initialize();

      const meetingDate = new Date(meeting.startTime);
      const now = new Date();

      const minutesBeforeReminder = meeting.minutesBefore !== undefined ? meeting.minutesBefore : settings.reminderTime;
      const reminderDate = new Date(meetingDate.getTime() - minutesBeforeReminder * 60 * 1000);

      if (reminderDate <= now) {
        return null;
      }

      const timeText = minutesBeforeReminder === 0 ? 'зараз' : `через ${minutesBeforeReminder} хв`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🗓️ Зустріч незабаром',
          body: `${meeting.title}${meeting.location ? ` в ${meeting.location}` : ''} ${timeText}`,
          data: { meetingId: meeting.id, type: 'meeting' },
          sound: true,
        },
        trigger: {
          type: 'date' as const,
          date: reminderDate,
        } as any,
      });

      await this.saveNotificationMapping(meeting.id, notificationId, 'meeting');

      return notificationId;
    } catch (error) {
      console.error('Error scheduling meeting notification:', error);
      return null;
    }
  }

  async scheduleTaskNotification(task: {
    id: string;
    title: string;
    dueDate: string;
    priority?: string;
  }): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    const settings = await this.getSettings();
    if (!settings.enabled || !settings.taskReminders) {
      return null;
    }

    try {
      await this.initialize();

      const dueDate = new Date(task.dueDate);
      const now = new Date();

      const reminderDate = new Date(dueDate);
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate <= now) {
        return null;
      }

      const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${priorityEmoji} Нагадування про завдання`,
          body: `${task.title} - термін сьогодні`,
          data: { taskId: task.id, type: 'task' },
          sound: true,
        },
        trigger: {
          type: 'date' as const,
          date: reminderDate,
        } as any,
      });

      await this.saveNotificationMapping(task.id, notificationId, 'task');

      return notificationId;
    } catch (error) {
      console.error('Error scheduling task notification:', error);
      return null;
    }
  }

  async scheduleDailyDigest(hour: number = 9): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    const settings = await this.getSettings();
    if (!settings.enabled || !settings.dailyDigest) {
      return;
    }

    try {
      await this.initialize();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Щоденний звіт',
          body: 'Переглянь свої завдання та зустрічі на сьогодні',
          data: { type: 'daily_digest' },
          sound: true,
        },
        trigger: {
          type: 'calendar' as const,
          hour,
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling daily digest:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('notification_mappings');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async cancelNotificationsForItem(itemId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const notificationIds = await this.getNotificationIds(itemId);
      for (const notificationId of notificationIds) {
        await this.cancelNotification(notificationId);
      }
      await this.removeNotificationMapping(itemId);
    } catch (error) {
      console.error('Error canceling notifications for item:', error);
    }
  }

  private async saveNotificationMapping(
    itemId: string,
    notificationId: string,
    type: 'meeting' | 'task'
  ): Promise<void> {
    try {
      const mappingsStr = await AsyncStorage.getItem('notification_mappings');
      const mappings = mappingsStr ? JSON.parse(mappingsStr) : {};

      if (!mappings[itemId]) {
        mappings[itemId] = [];
      }

      mappings[itemId].push({ notificationId, type, createdAt: new Date().toISOString() });

      await AsyncStorage.setItem('notification_mappings', JSON.stringify(mappings));
    } catch (error) {
      console.error('Error saving notification mapping:', error);
    }
  }

  private async getNotificationIds(itemId: string): Promise<string[]> {
    try {
      const mappingsStr = await AsyncStorage.getItem('notification_mappings');
      const mappings = mappingsStr ? JSON.parse(mappingsStr) : {};
      return mappings[itemId]?.map((m: any) => m.notificationId) || [];
    } catch (error) {
      console.error('Error getting notification IDs:', error);
      return [];
    }
  }

  private async removeNotificationMapping(itemId: string): Promise<void> {
    try {
      const mappingsStr = await AsyncStorage.getItem('notification_mappings');
      const mappings = mappingsStr ? JSON.parse(mappingsStr) : {};
      delete mappings[itemId];
      await AsyncStorage.setItem('notification_mappings', JSON.stringify(mappings));
    } catch (error) {
      console.error('Error removing notification mapping:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
