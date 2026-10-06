import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission() {
  const existing = await Notifications.getPermissionsAsync();

  let status = existing.status;

  if (status !== 'granted') {
    const requested =
      await Notifications.requestPermissionsAsync();

    status = requested.status;
  }

  return status === 'granted';
}

export async function scheduleTaskNotification(
  title: string,
  body: string,
  taskId: string,
  date: Date
) {
  const hasPermission =
    await requestNotificationPermission();

  if (!hasPermission) {
    throw new Error(
      'Notification permission was not granted.'
    );
  }

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
}

export async function cancelNotification(
  notificationId?: string | null
) {
  if (!notificationId) return;

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
  return await Notifications.getAllScheduledNotificationsAsync();
}