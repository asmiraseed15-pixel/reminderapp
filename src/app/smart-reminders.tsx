import React, { useMemo, useState } from 'react';

import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';
import * as Notifications from 'expo-notifications';

type FilterType = 'all' | 'active' | 'off' | 'completed';

export default function SmartReminders() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { tasks, updateTask } = useTasks();

  const [filter, setFilter] = useState<FilterType>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const isTablet = width >= 700;
  const isWeb = Platform.OS === 'web';

  // =========================================================
  // SAFE BACK
  // =========================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/about' as any);
    }
  };

  // =========================================================
  // DATE / TIME HELPERS
  // =========================================================

  const getTaskDateTime = (task: any): Date | null => {
    try {
      const date = String(task?.date || '').trim();
      const time = String(task?.time || '').trim();

      if (!date) {
        return null;
      }

      // No time
      if (!time) {
        const result = new Date(`${date}T00:00:00`);

        if (isNaN(result.getTime())) {
          return null;
        }

        return result;
      }

      // 12-hour format
      const ampmMatch = time.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
      );

      if (ampmMatch) {
        let hour = Number(ampmMatch[1]);
        const minute = Number(ampmMatch[2]);
        const ampm = ampmMatch[3].toUpperCase();

        if (ampm === 'PM' && hour !== 12) {
          hour += 12;
        }

        if (ampm === 'AM' && hour === 12) {
          hour = 0;
        }

        const result = new Date(`${date}T00:00:00`);

        if (isNaN(result.getTime())) {
          return null;
        }

        result.setHours(hour, minute, 0, 0);

        return result;
      }

      // 24-hour format
      const result = new Date(`${date}T${time}`);

      if (isNaN(result.getTime())) {
        return null;
      }

      return result;
    } catch (error) {
      console.log('Date parsing error:', error);
      return null;
    }
  };

  const formatDate = (task: any) => {
    const date = String(task?.date || '').trim();

    if (!date) {
      return 'No date';
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isToday = (task: any) => {
    const taskDate = getTaskDateTime(task);

    if (!taskDate) {
      return false;
    }

    const today = new Date();

    return (
      taskDate.getFullYear() === today.getFullYear() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getDate() === today.getDate()
    );
  };

  // =========================================================
  // REQUEST NOTIFICATION PERMISSION
  // =========================================================

  const requestNotificationPermission = async () => {
    if (isWeb) {
      return true;
    }

    try {
      const existing =
        await Notifications.getPermissionsAsync();

      let finalStatus = existing.status;

      if (finalStatus !== 'granted') {
        const requested =
          await Notifications.requestPermissionsAsync();

        finalStatus = requested.status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.log(
        'Notification permission error:',
        error
      );

      return false;
    }
  };

  // =========================================================
  // CANCEL OLD NOTIFICATION
  // =========================================================

  const cancelTaskNotification = async (task: any) => {
    const taskId = String(task?.id || '');

    /*
      First try stored notification ID.
    */

    if (task?.reminderNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          String(task.reminderNotificationId)
        );
      } catch (error) {
        console.log(
          'Stored notification cancellation:',
          error
        );
      }
    }

    /*
      Also search scheduled notifications.

      This helps when an older version of the app created
      a reminder but did not correctly save its notification ID.
    */

    try {
      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduled) {
        const notificationData =
          notification.content?.data || {};

        const notificationTaskId =
          String(notificationData?.taskId || '');

        const notificationTitle =
          String(notification.content?.title || '');

        const notificationBody =
          String(notification.content?.body || '');

        const currentTaskTitle =
          String(task?.title || '');

        const matchesTaskId =
          notificationTaskId !== '' &&
          notificationTaskId === taskId;

        const matchesTitle =
          currentTaskTitle !== '' &&
          (
            notificationTitle === currentTaskTitle ||
            notificationBody.includes(currentTaskTitle)
          );

        if (matchesTaskId || matchesTitle) {
          try {
            await Notifications.cancelScheduledNotificationAsync(
              notification.identifier
            );
          } catch (error) {
            console.log(
              'Scheduled notification cancel error:',
              error
            );
          }
        }
      }
    } catch (error) {
      console.log(
        'Get scheduled notifications error:',
        error
      );
    }
  };

  // =========================================================
  // SCHEDULE NOTIFICATION
  // =========================================================

  const scheduleTaskNotification = async (
    task: any
  ): Promise<string | null> => {
    if (isWeb) {
      /*
        Expo notification scheduling is not reliable
        as a native notification service on web.

        We still allow the reminder switch to work and
        persist the reminder state.
      */
      return null;
    }

    const reminderDate = getTaskDateTime(task);

    if (!reminderDate) {
      throw new Error(
        'Invalid task date or time.'
      );
    }

    if (reminderDate.getTime() <= Date.now()) {
      throw new Error(
        'Reminder time must be in the future.'
      );
    }

    const hasPermission =
      await requestNotificationPermission();

    if (!hasPermission) {
      throw new Error(
        'Notification permission was not granted.'
      );
    }

    /*
      Create a unique notification.

      taskId is stored inside data so we can identify
      this notification later when OFF is pressed.
    */

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Smart Todo Reminder',
          body:
            String(task.title || 'You have a task to complete.'),
          sound: 'default',
          data: {
            taskId: String(task.id),
            taskTitle: String(task.title || ''),
          },
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

    return notificationId;
  };

  // =========================================================
  // ENABLE REMINDER
  // =========================================================

  const enableReminder = async (task: any) => {
    const taskId = String(task.id);

    if (busyId) {
      return;
    }

    try {
      setBusyId(taskId);

      const reminderDate =
        getTaskDateTime(task);

      if (!reminderDate) {
        Alert.alert(
          'Missing Date & Time',
          'Please add a valid date and time before enabling the reminder.'
        );

        return;
      }

      if (
        reminderDate.getTime() <= Date.now()
      ) {
        Alert.alert(
          'Invalid Reminder Time',
          'Please choose a future date and time for this reminder.'
        );

        return;
      }

      /*
        Before creating a new reminder,
        remove any previous reminder for this task.

        This prevents duplicate notifications when
        OFF → ON is used multiple times.
      */

      await cancelTaskNotification(task);

      /*
        Schedule fresh notification.
      */

      const notificationId =
        await scheduleTaskNotification(task);

      /*
        Save the complete reminder state.
      */

      await updateTask(taskId, {
        reminderEnabled: true,

        reminderNotificationId:
          notificationId,

        reminderTime:
          reminderDate.toISOString(),
      } as any);

      if (isWeb) {
        Alert.alert(
          'Reminder Enabled',
          `"${task.title}" reminder is enabled.\n\nWeb preview saves the reminder state, while actual scheduled notifications require the Expo Go/native app.`
        );
      } else {
        Alert.alert(
          'Reminder Enabled 🔔',
          `"${task.title}" will remind you on ${formatDate(
            task
          )} at ${String(task.time || '')}.`
        );
      }
    } catch (error: any) {
      console.log(
        'Enable reminder error:',
        error
      );

      Alert.alert(
        'Reminder Error',
        error?.message ||
          'Unable to schedule this reminder. Please check notification permission.'
      );
    } finally {
      setBusyId(null);
    }
  };

  // =========================================================
  // DISABLE REMINDER
  // =========================================================

  const disableReminder = async (task: any) => {
    const taskId = String(task.id);

    if (busyId) {
      return;
    }

    try {
      setBusyId(taskId);

      /*
        Cancel the actual notification first.
      */

      if (!isWeb) {
        await cancelTaskNotification(task);
      }

      /*
        Clear every reminder field.

        This is important because when the user
        switches ON again, a completely fresh
        notification will be created.
      */

      await updateTask(taskId, {
        reminderEnabled: false,
        reminderNotificationId: null,
        reminderTime: null,
      } as any);

      /*
        Small confirmation.
      */

      Alert.alert(
        'Reminder Off',
        `"${task.title}" reminder has been turned off.`
      );
    } catch (error) {
      console.log(
        'Disable reminder error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to disable this reminder.'
      );
    } finally {
      setBusyId(null);
    }
  };

  // =========================================================
  // TOGGLE
  // =========================================================

  const handleToggleReminder = async (
    task: any
  ) => {
    if (busyId) {
      return;
    }

    if (task.reminderEnabled === true) {
      await disableReminder(task);
    } else {
      await enableReminder(task);
    }
  };

  // =========================================================
  // FILTERED TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks)
      ? [...tasks]
      : [];

    let result = safeTasks;

    if (filter === 'active') {
      result = result.filter(
        (task: any) =>
          task.reminderEnabled === true &&
          task.completed !== true
      );
    }

    if (filter === 'off') {
      result = result.filter(
        (task: any) =>
          task.reminderEnabled !== true &&
          task.completed !== true
      );
    }

    if (filter === 'completed') {
      result = result.filter(
        (task: any) =>
          task.completed === true
      );
    }

    result.sort((a: any, b: any) => {
      const aDate =
        getTaskDateTime(a)?.getTime() || 0;

      const bDate =
        getTaskDateTime(b)?.getTime() || 0;

      return aDate - bDate;
    });

    return result;
  }, [tasks, filter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const activeReminders = useMemo(() => {
    return Array.isArray(tasks)
      ? tasks.filter(
          (task: any) =>
            task.reminderEnabled === true &&
            task.completed !== true
        ).length
      : 0;
  }, [tasks]);

  const todayReminders = useMemo(() => {
    return Array.isArray(tasks)
      ? tasks.filter(
          (task: any) =>
            task.reminderEnabled === true &&
            task.completed !== true &&
            isToday(task)
        ).length
      : 0;
  }, [tasks]);

  const completedReminders = useMemo(() => {
    return Array.isArray(tasks)
      ? tasks.filter(
          (task: any) =>
            task.completed === true
        ).length
      : 0;
  }, [tasks]);

  // =========================================================
  // ROUTING
  // =========================================================

  const openTaskDetails = (task: any) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: String(task.id),
      },
    } as any);
  };

  const createReminder = () => {
    router.push('/add-task' as any);
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (
    category: string
  ) => {
    switch (
      String(category || '').toLowerCase()
    ) {
      case 'work':
        return 'briefcase-outline';

      case 'study':
        return 'book-outline';

      case 'health':
        return 'heart-outline';

      case 'shopping':
        return 'cart-outline';

      case 'personal':
        return 'person-outline';

      default:
        return 'apps-outline';
    }
  };

  // =========================================================
  // TASK CARD
  // =========================================================

  const renderTask = (task: any) => {
    const taskId = String(task.id);

    const isBusy =
      busyId === taskId;

    const reminderOn =
      task.reminderEnabled === true;

    return (
      <View
        key={taskId}
        style={[
          styles.taskCard,
          isTablet && styles.taskCardTablet,
        ]}
      >
        <View style={styles.taskTopRow}>
          {/* ICON */}

          <View style={styles.taskIcon}>
            <Ionicons
              name={
                reminderOn
                  ? 'notifications'
                  : 'notifications-off-outline'
              }
              size={23}
              color={
                reminderOn
                  ? '#126EED'
                  : '#8A8F98'
              }
            />
          </View>

          {/* TASK */}

          <View style={styles.taskMain}>
            <Text
              style={[
                styles.taskTitle,
                task.completed &&
                  styles.completedTitle,
              ]}
              numberOfLines={2}
            >
              {String(
                task.title ||
                  'Untitled Task'
              )}
            </Text>

            <View style={styles.categoryRow}>
              <Ionicons
                name={
                  getCategoryIcon(
                    task.category
                  ) as any
                }
                size={14}
                color="#777E89"
              />

              <Text
                style={styles.categoryText}
              >
                {String(
                  task.category ||
                    'Personal'
                )}
              </Text>
            </View>
          </View>

          {/* SWITCH */}

          <Switch
            value={reminderOn}
            onValueChange={() =>
              handleToggleReminder(task)
            }
            disabled={isBusy}
            trackColor={{
              false: '#D8DCE2',
              true: '#A9CBFF',
            }}
            thumbColor={
              reminderOn
                ? '#126EED'
                : '#F4F5F6'
            }
          />
        </View>

        <View style={styles.divider} />

        {/* DATE / TIME */}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#126EED"
            />

            <Text
              style={styles.detailText}
            >
              {formatDate(task)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#126EED"
            />

            <Text
              style={styles.detailText}
            >
              {String(
                task.time || 'No time'
              )}
            </Text>
          </View>
        </View>

        {/* STATUS / EDIT */}

        <View style={styles.actionRow}>
          <View
            style={[
              styles.statusBadge,
              reminderOn
                ? styles.activeBadge
                : styles.offBadge,
            ]}
          >
            <Ionicons
              name={
                reminderOn
                  ? 'checkmark-circle'
                  : 'pause-circle-outline'
              }
              size={14}
              color={
                reminderOn
                  ? '#087443'
                  : '#737982'
              }
            />

            <Text
              style={[
                styles.statusText,
                reminderOn
                  ? styles.activeStatusText
                  : styles.offStatusText,
              ]}
            >
              {reminderOn
                ? 'Reminder Active'
                : 'Reminder Off'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() =>
              openTaskDetails(task)
            }
            disabled={isBusy}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color="#126EED"
            />

            <Text
              style={styles.editButtonText}
            >
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* PROCESSING */}

        {isBusy && (
          <View
            style={styles.processingRow}
          >
            <Ionicons
              name="sync-outline"
              size={14}
              color="#126EED"
            />

            <Text
              style={styles.processingText}
            >
              {reminderOn
                ? 'Turning reminder off...'
                : 'Turning reminder on...'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // =========================================================
  // EMPTY STATE
  // =========================================================

  const renderEmpty = () => {
    let title =
      'No reminders found';

    let message =
      'Create a task and turn on its reminder to stay on track.';

    if (filter === 'active') {
      title =
        'No active reminders';

      message =
        'Turn on reminders for your upcoming tasks.';
    }

    if (filter === 'off') {
      title =
        'No reminder-off tasks';

      message =
        'All your pending tasks currently have reminders enabled.';
    }

    if (filter === 'completed') {
      title =
        'No completed tasks';

      message =
        'Complete tasks to see them here.';
    }

    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="notifications-outline"
            size={40}
            color="#126EED"
          />
        </View>

        <Text
          style={styles.emptyTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.emptyMessage}
        >
          {message}
        </Text>

        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.85}
          onPress={createReminder}
        >
          <Ionicons
            name="add"
            size={19}
            color="#FFFFFF"
          />

          <Text
            style={styles.emptyButtonText}
          >
            Create Reminder
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,
          isTablet &&
            styles.scrollContentTablet,
        ]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#18202A"
            />
          </TouchableOpacity>

          <View
            style={styles.headerTextContainer}
          >
            <Text
              style={styles.headerTitle}
            >
              Smart Reminders
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Never miss what matters
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAddButton}
            activeOpacity={0.85}
            onPress={createReminder}
          >
            <Ionicons
              name="add"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="notifications"
              size={30}
              color="#126EED"
            />
          </View>

          <View
            style={styles.heroContent}
          >
            <Text
              style={styles.heroTitle}
            >
              Stay one step ahead
            </Text>

            <Text
              style={styles.heroText}
            >
              Set reminders for important
              tasks and get notified at
              the right time.
            </Text>
          </View>
        </View>

        {/* STATS */}

        <View
          style={[
            styles.statsGrid,
            isTablet &&
              styles.statsGridTablet,
          ]}
        >
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.blueStatIcon,
              ]}
            >
              <Ionicons
                name="notifications"
                size={20}
                color="#126EED"
              />
            </View>

            <Text
              style={styles.statNumber}
            >
              {activeReminders}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Active
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.orangeStatIcon,
              ]}
            >
              <Ionicons
                name="today-outline"
                size={20}
                color="#E77900"
              />
            </View>

            <Text
              style={styles.statNumber}
            >
              {todayReminders}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Today
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.greenStatIcon,
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#16835A"
              />
            </View>

            <Text
              style={styles.statNumber}
            >
              {completedReminders}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Completed
            </Text>
          </View>
        </View>

        {/* SECTION */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Your Reminders
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Manage notification alerts
            for your tasks
          </Text>
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterScroll
          }
        >
          <FilterButton
            label="All"
            icon="apps-outline"
            active={filter === 'all'}
            onPress={() =>
              setFilter('all')
            }
          />

          <FilterButton
            label="Active"
            icon="notifications-outline"
            active={filter === 'active'}
            onPress={() =>
              setFilter('active')
            }
          />

          <FilterButton
            label="Reminder Off"
            icon="notifications-off-outline"
            active={filter === 'off'}
            onPress={() =>
              setFilter('off')
            }
          />

          <FilterButton
            label="Completed"
            icon="checkmark-circle-outline"
            active={
              filter === 'completed'
            }
            onPress={() =>
              setFilter('completed')
            }
          />
        </ScrollView>

        {/* TASK LIST */}

        <View style={styles.taskList}>
          {filteredTasks.length === 0
            ? renderEmpty()
            : filteredTasks.map(
                renderTask
              )}
        </View>

        {/* TIP */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#126EED"
            />
          </View>

          <View
            style={styles.tipContent}
          >
            <Text
              style={styles.tipTitle}
            >
              Smart productivity tip
            </Text>

            <Text
              style={styles.tipText}
            >
              Add reminders to important
              tasks and complete them before
              their scheduled time. Small
              reminders can make a big
              difference.
            </Text>
          </View>
        </View>

        {/* CREATE */}

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.88}
          onPress={createReminder}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={styles.createButtonText}
          >
            Create New Reminder
          </Text>
        </TouchableOpacity>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// FILTER BUTTON
// =========================================================

function FilterButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: any;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        active &&
          styles.filterButtonActive,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          active
            ? '#FFFFFF'
            : '#626A75'
        }
      />

      <Text
        style={[
          styles.filterButtonText,
          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  scrollContentTablet: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 30,
  },

  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E6E9EE',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17202A',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#737B87',
    marginTop: 3,
  },

  headerAddButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  // HERO

  heroCard: {
    backgroundColor: '#EAF3FF',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D8E9FF',
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#163B68',
  },

  heroText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#60738B',
    marginTop: 5,
  },

  // STATS

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },

  statsGridTablet: {
    gap: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EBEF',
    minHeight: 125,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  blueStatIcon: {
    backgroundColor: '#EAF3FF',
  },

  orangeStatIcon: {
    backgroundColor: '#FFF3E3',
  },

  greenStatIcon: {
    backgroundColor: '#E7F8F0',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18202A',
  },

  statLabel: {
    fontSize: 12,
    color: '#7A828C',
    marginTop: 2,
  },

  // SECTION

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18202A',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#7B838D',
    marginTop: 3,
  },

  // FILTERS

  filterScroll: {
    gap: 8,
    paddingBottom: 15,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E4E9',
  },

  filterButtonActive: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#626A75',
  },

  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // TASK LIST

  taskList: {
    gap: 13,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  taskCardTablet: {
    padding: 20,
  },

  taskTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EDF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  taskMain: {
    flex: 1,
    paddingRight: 8,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C242E',
    lineHeight: 20,
  },

  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#969CA5',
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },

  categoryText: {
    fontSize: 11,
    color: '#777E89',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginVertical: 14,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6772',
  },

  actionRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#E8F8F0',
  },

  offBadge: {
    backgroundColor: '#F1F2F4',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  activeStatusText: {
    color: '#087443',
  },

  offStatusText: {
    color: '#737982',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#EDF5FF',
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#126EED',
  },

  processingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  processingText: {
    fontSize: 11,
    color: '#126EED',
    fontWeight: '600',
  },

  // EMPTY

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B232D',
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#7A828D',
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 400,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#126EED',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // TIP

  tipCard: {
    marginTop: 18,
    backgroundColor: '#FFF9E8',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F7E7B7',
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#624A00',
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#806E32',
    marginTop: 4,
  },

  // CREATE

  createButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});