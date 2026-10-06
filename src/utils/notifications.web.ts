export async function requestNotificationPermission() {
  return true;
}

export async function scheduleTaskNotification(
  title: string,
  body: string,
  taskId: string,
  date: Date
) {
  console.log(
    'Web notification scheduling is not available.'
  );

  return null;
}

export async function cancelNotification(
  notificationId?: string | null
) {
  return;
}

export async function getScheduledNotifications() {
  return [];
}