import { Platform } from 'react-native';

/*
  Expo Go compatible notification helper.

  Android remote push notifications are not supported
  in Expo Go for SDK 53+.

  These functions are kept so the rest of the app
  can safely call them without crashing.
*/

export async function setupNotifications() {
  if (Platform.OS === 'web') {
    return false;
  }

  return false;
}

export async function scheduleTaskReminder(
  title: string,
  date: string,
  time: string
) {
  console.log(
    `Reminder requested: ${title} - ${date} ${time}`
  );

  /*
    Real Android notifications require a Development Build.
    Expo Go cannot schedule the required remote notification
    functionality on SDK 53+.
  */

  return null;
}

export async function cancelTaskReminder(
  notificationId?: string | null
) {
  if (!notificationId) {
    return;
  }

  return;
}

export async function cancelAllNotifications() {
  return;
}