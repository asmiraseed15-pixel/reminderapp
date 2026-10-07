import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

type FilterType = 'all' | 'active' | 'off' | 'completed';

type Task = {
  id: string;
  title: string;
  category?: string;
  date?: string;
  time?: string;
  completed?: boolean;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  reminderNotificationId?: string | null;
  notes?: string;
};

const TASK_STORAGE_KEY = 'todo_tasks';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

/* -------------------------------------------------------
   SAFE NOTIFICATION LOADER
------------------------------------------------------- */

async function getNotifications() {
  if (Platform.OS === 'android' && isExpoGo) {
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');
    return Notifications;
  } catch (error) {
    console.log('Notifications unavailable:', error);
    return null;
  }
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export default function SmartReminders() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  /* -------------------------------------------------------
     LOAD TASKS
  ------------------------------------------------------- */

  const loadTasks = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(TASK_STORAGE_KEY);

      if (!raw) {
        setTasks([]);
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setTasks(parsed);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.log('Load tasks error:', error);
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  const onRefresh = async () => {
    setRefreshing(true);

    await loadTasks();

    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  };

  /* -------------------------------------------------------
     SAVE TASKS
  ------------------------------------------------------- */

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(
        TASK_STORAGE_KEY,
        JSON.stringify(updatedTasks)
      );

      setTasks(updatedTasks);
    } catch (error) {
      console.log('Save tasks error:', error);
    }
  };

  /* -------------------------------------------------------
     NOTIFICATION PERMISSION
  ------------------------------------------------------- */

  const requestNotificationPermission = async () => {
    const Notifications = await getNotifications();

    if (!Notifications) {
      Alert.alert(
        'Notifications',
        'Android Expo Go does not support notifications. Use a development build to enable real notifications.'
      );

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
  };

  /* -------------------------------------------------------
     SCHEDULE NOTIFICATION
  ------------------------------------------------------- */

  const scheduleNotification = async (
    task: Task
  ): Promise<string | null> => {
    const Notifications = await getNotifications();

    if (!Notifications) {
      return null;
    }

    const permission =
      await requestNotificationPermission();

    if (!permission) {
      return null;
    }

    if (!task.date || !task.time) {
      return null;
    }

    try {
      const dateTime = createTaskDate(
        task.date,
        task.time
      );

      if (!dateTime || dateTime.getTime() <= Date.now()) {
        return null;
      }

      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Smart Reminder',
            body: task.title,
            sound: 'default',
            data: {
              taskId: task.id,
            },
          },
          trigger: {
            type:
              Notifications.SchedulableTriggerInputTypes
                .DATE,
            date: dateTime,
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
  };

  /* -------------------------------------------------------
     CANCEL NOTIFICATION
  ------------------------------------------------------- */

  const cancelNotification = async (
    notificationId?: string | null
  ) => {
    if (!notificationId) return;

    const Notifications = await getNotifications();

    if (!Notifications) return;

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
  };

  /* -------------------------------------------------------
     TOGGLE REMINDER
  ------------------------------------------------------- */

  const toggleReminder = async (
    task: Task,
    enabled: boolean
  ) => {
    try {
      if (enabled) {
        if (!task.date || !task.time) {
          Alert.alert(
            'Date & Time Required',
            'Please add a date and time to this task before enabling the reminder.'
          );

          return;
        }

        const dateTime = createTaskDate(
          task.date,
          task.time
        );

        if (!dateTime) {
          Alert.alert(
            'Invalid Date',
            'Please check the task date and time.'
          );

          return;
        }

        if (dateTime.getTime() <= Date.now()) {
          Alert.alert(
            'Past Time',
            'Please select a future date and time for the reminder.'
          );

          return;
        }

        const notificationId =
          await scheduleNotification(task);

        const updatedTasks = tasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                reminderEnabled: true,
                reminderTime: task.time,
                reminderNotificationId:
                  notificationId,
              }
            : item
        );

        await saveTasks(updatedTasks);

        if (
          Platform.OS === 'android' &&
          isExpoGo
        ) {
          Alert.alert(
            'Reminder Saved',
            'The reminder setting was saved. Real Android notifications require a development build.'
          );
        }

        return;
      }

      await cancelNotification(
        task.reminderNotificationId
      );

      const updatedTasks = tasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              reminderEnabled: false,
              reminderNotificationId: null,
            }
          : item
      );

      await saveTasks(updatedTasks);
    } catch (error) {
      console.log(
        'Toggle reminder error:',
        error
      );
    }
  };

  /* -------------------------------------------------------
     CREATE DATE
  ------------------------------------------------------- */

  const createTaskDate = (
    dateValue: string,
    timeValue: string
  ): Date | null => {
    try {
      let date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        const parts = dateValue.split('-');

        if (parts.length === 3) {
          date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
          );
        }
      }

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      const timeParts = timeValue
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .match(
          /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/
        );

      if (!timeParts) {
        return null;
      }

      let hours = Number(timeParts[1]);
      const minutes = Number(
        timeParts[2] || 0
      );

      const meridiem = timeParts[3];

      if (meridiem === 'pm' && hours < 12) {
        hours += 12;
      }

      if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return date;
    } catch {
      return null;
    }
  };

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(
          (task) =>
            !task.completed &&
            task.reminderEnabled
        );

      case 'off':
        return tasks.filter(
          (task) => !task.reminderEnabled
        );

      case 'completed':
        return tasks.filter(
          (task) => task.completed
        );

      default:
        return tasks;
    }
  }, [tasks, filter]);

  /* -------------------------------------------------------
     STATISTICS
  ------------------------------------------------------- */

  const totalReminders = tasks.filter(
    (task) => task.reminderEnabled
  ).length;

  const activeReminders = tasks.filter(
    (task) =>
      task.reminderEnabled &&
      !task.completed
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  /* -------------------------------------------------------
     OPEN TASK
  ------------------------------------------------------- */

  const openTask = (task: Task) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: task.id,
      },
    });
  };

  /* -------------------------------------------------------
     FORMAT DATE
  ------------------------------------------------------- */

  const formatDate = (date?: string) => {
    if (!date) return 'No date';

    try {
      const parsed = new Date(date);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        );
      }

      return date;
    } catch {
      return date;
    }
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Smart Reminders
            </Text>

            <Text style={styles.subtitle}>
              Never miss what matters
            </Text>
          </View>

          <View style={styles.bellCircle}>
            <Ionicons
              name="notifications"
              size={23}
              color="#126EED"
            />
          </View>
        </View>

        {/* EXPO GO NOTICE */}

        {Platform.OS === 'android' &&
          isExpoGo && (
            <View style={styles.notice}>
              <View style={styles.noticeIcon}>
                <Ionicons
                  name="information-circle"
                  size={22}
                  color="#126EED"
                />
              </View>

              <View style={styles.noticeText}>
                <Text style={styles.noticeTitle}>
                  Expo Go Mode
                </Text>

                <Text style={styles.noticeDescription}>
                  Reminder settings work here,
                  but real Android notifications
                  require a development build.
                </Text>
              </View>
            </View>
          )}

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summarySmall}>
                YOUR REMINDERS
              </Text>

              <Text style={styles.summaryNumber}>
                {totalReminders}
              </Text>

              <Text style={styles.summaryLabel}>
                active reminder settings
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="alarm"
                size={30}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottom}>
            <View style={styles.summaryItem}>
              <Ionicons
                name="flash"
                size={18}
                color="#126EED"
              />

              <Text style={styles.summaryItemText}>
                {activeReminders} Active
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#16A34A"
              />

              <Text style={styles.summaryItemText}>
                {completedTasks} Completed
              </Text>
            </View>
          </View>
        </View>

        {/* FILTER */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {[
            {
              key: 'all',
              label: 'All',
            },
            {
              key: 'active',
              label: 'Active',
            },
            {
              key: 'off',
              label: 'Reminder Off',
            },
            {
              key: 'completed',
              label: 'Completed',
            },
          ].map((item) => {
            const selected =
              filter === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterButton,
                  selected &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilter(
                    item.key as FilterType
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TASKS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Reminder Tasks
          </Text>

          <Text style={styles.taskCount}>
            {filteredTasks.length}
          </Text>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={38}
                color="#126EED"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No reminders found
            </Text>

            <Text style={styles.emptyText}>
              Add a task with a date and time
              to create a smart reminder.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              activeOpacity={0.85}
              style={styles.taskCard}
              onPress={() => openTask(task)}
            >
              <View
                style={[
                  styles.taskIcon,
                  task.completed &&
                    styles.taskIconCompleted,
                ]}
              >
                <Ionicons
                  name={
                    task.completed
                      ? 'checkmark-circle'
                      : task.reminderEnabled
                      ? 'notifications'
                      : 'notifications-off-outline'
                  }
                  size={24}
                  color={
                    task.completed
                      ? '#16A34A'
                      : task.reminderEnabled
                      ? '#126EED'
                      : '#9CA3AF'
                  }
                />
              </View>

              <View style={styles.taskContent}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.taskTitle,
                    task.completed &&
                      styles.completedTitle,
                  ]}
                >
                  {task.title}
                </Text>

                <View style={styles.metaRow}>
                  {task.category ? (
                    <View style={styles.categoryBadge}>
                      <Text
                        style={
                          styles.categoryText
                        }
                      >
                        {task.category}
                      </Text>
                    </View>
                  ) : null}

                  {task.date ? (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6B7280"
                      />

                      <Text
                        style={styles.metaText}
                      >
                        {formatDate(task.date)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {task.time ? (
                  <View style={styles.timeRow}>
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color="#126EED"
                    />

                    <Text style={styles.timeText}>
                      {task.time}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={styles.switchContainer}
              >
                <Switch
                  value={
                    task.reminderEnabled === true
                  }
                  onValueChange={(value) =>
                    toggleReminder(
                      task,
                      value
                    )
                  }
                  trackColor={{
                    false: '#D1D5DB',
                    true: '#9CC4FF',
                  }}
                  thumbColor={
                    task.reminderEnabled
                      ? '#126EED'
                      : '#F9FAFB'
                  }
                />
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* BOTTOM INFO */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={23}
              color="#F59E0B"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Smart Reminder Tip
            </Text>

            <Text style={styles.tipText}>
              Add a date and time to your task,
              then switch on the reminder.
              Your task will be ready for
              scheduled notifications.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },

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
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  bellCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notice: {
    flexDirection: 'row',
    backgroundColor: '#EAF3FF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CFE3FF',
  },

  noticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  noticeText: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#126EED',
    marginBottom: 3,
  },

  noticeDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },

  summaryCard: {
    backgroundColor: '#126EED',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summarySmall: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#DCEBFF',
  },

  summaryNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#DCEBFF',
  },

  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginVertical: 17,
  },

  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  summaryItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  filterContainer: {
    paddingBottom: 18,
    gap: 9,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterButtonActive: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  taskCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    color: '#126EED',
    textAlign: 'center',
    paddingTop: 6,
    fontSize: 12,
    fontWeight: '800',
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },

  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  taskIconCompleted: {
    backgroundColor: '#ECFDF3',
  },

  taskContent: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#111827',
  },

  completedTitle: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 7,
  },

  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 10,
    color: '#6B7280',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },

  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#126EED',
  },

  switchContainer: {
    marginLeft: 7,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 6,
  },

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 15,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },

  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },

  tipText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#78716C',
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },
});