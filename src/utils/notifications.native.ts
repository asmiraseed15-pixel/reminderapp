import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

async function getNotifications() {
  // Android Expo Go does not support remote notifications
  if (Platform.OS === 'android' && isExpoGo) {
    console.log(
      'Notifications are disabled in Expo Go. Use a development build for notifications.'
    );

    return null;
  }

  try {
    const Notifications = await import('expo-notifications');
    return Notifications;
  } catch (error) {
    console.log(
      'Expo Notifications could not be loaded:',
      error
    );

    return null;
  }
}

export async function requestNotificationPermission() {
  const Notifications = await getNotifications();

  // Expo Go Android → safely skip
  if (!Notifications) {
    return false;
  }

  try {
    const existing =
      await Notifications.getPermissionsAsync();

    let status = existing.status;

    if (status !== 'granted') {
      const requested =
        await Notifications.requestPermissionsAsync();

      status = requested.status;
    }

    return status === 'granted';
  } catch (error) {
    console.log(
      'Notification permission error:',
      error
    );

    return false;
  }
}

export async function scheduleTaskNotification(
  title: string,
  body: string,
  taskId: string,
  date: Date
) {
  const Notifications = await getNotifications();

  // Expo Go Android → don't crash
  if (!Notifications) {
    console.log(
      'Notification skipped because the app is running in Expo Go.'
    );

    return null;
  }

  const hasPermission =
    await requestNotificationPermission();

  if (!hasPermission) {
    throw new Error(
      'Notification permission was not granted.'
    );
  }

  try {
    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: {
            taskId,
          },
        },

        trigger: {
          type:
            Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });

    return notificationId;
  } catch (error) {
    console.log(
      'Schedule notification error:',
      error
    );

    return null;
  }
}

export async function cancelNotification(
  notificationId?: string | null
) {
  if (!notificationId) return;

  const Notifications = await getNotifications();

  if (!Notifications) {
    console.log(
      'Notification cancellation skipped in Expo Go.'
    );

    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      notificationId
    );
  } catch (error) {
    console.log(
      'Cancel notification error:',
      error
    );
  }
}

export async function getScheduledNotifications() {
  const Notifications = await getNotifications();

  if (!Notifications) {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log(
      'Get scheduled notifications error:',
      error
    );

    return [];
  }
}