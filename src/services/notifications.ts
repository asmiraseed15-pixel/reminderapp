
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const result =
      await Notifications.requestPermissionsAsync();

    finalStatus = result.status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

export async function scheduleTaskReminder(
  taskId: string,
  taskTitle: string,
  reminderDate: Date
) {
  if (Platform.OS === 'web') {
    return null;
  }

  const allowed = await setupNotifications();

  if (!allowed) {
    return null;
  }

  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  const notificationId =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Task Reminder',
        body: `"${taskTitle}" is due now. Stay focused, stay organized, and get it done! ✅`,
        sound: 'default',
        data: {
          taskId,
          type: 'task-reminder',
        },
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

  return notificationId;
}

export async function cancelTaskReminder(
  notificationId?: string | null
) {
  if (
    Platform.OS === 'web' ||
    !notificationId
  ) {
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