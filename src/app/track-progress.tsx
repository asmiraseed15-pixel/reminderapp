import React, { useMemo } from 'react';

import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';

export default function TrackProgress() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { tasks, toggleTask } = useTasks();

  const isTablet = width >= 700;

  // ---------------------------------------------------------
  // REAL TASK STATISTICS
  // ---------------------------------------------------------

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task: any) => task.completed === true
  ).length;

  const pendingTasks = tasks.filter(
    (task: any) => task.completed !== true
  ).length;

  const savedTasks = tasks.filter(
    (task: any) => task.saved === true
  ).length;

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // ---------------------------------------------------------
  // CATEGORY PROGRESS
  // ---------------------------------------------------------

  const categoryStats = useMemo(() => {
    const categories = [
      'Personal',
      'Work',
      'Study',
      'Health',
      'Shopping',
      'Other',
    ];

    return categories.map((category) => {
      const categoryTasks = tasks.filter(
        (task: any) =>
          String(task.category || 'Other').toLowerCase() ===
          category.toLowerCase()
      );

      const completed = categoryTasks.filter(
        (task: any) => task.completed === true
      ).length;

      const total = categoryTasks.length;

      const percentage =
        total === 0
          ? 0
          : Math.round((completed / total) * 100);

      return {
        category,
        total,
        completed,
        percentage,
      };
    });
  }, [tasks]);

  // ---------------------------------------------------------
  // TODAY
  // ---------------------------------------------------------

  const today = new Date();

  const todayString =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${String(today.getDate()).padStart(
      2,
      '0'
    )}`;

  const todayTasks = tasks.filter(
    (task: any) => String(task.date || '') === todayString
  );

  const todayCompleted = todayTasks.filter(
    (task: any) => task.completed === true
  ).length;

  const todayPending = todayTasks.filter(
    (task: any) => task.completed !== true
  ).length;

  const todayPercentage =
    todayTasks.length === 0
      ? 0
      : Math.round(
          (todayCompleted / todayTasks.length) * 100
        );

  // ---------------------------------------------------------
  // PRODUCTIVITY MESSAGE
  // ---------------------------------------------------------

  const getProgressMessage = () => {
    if (totalTasks === 0) {
      return {
        title: 'Start your productivity journey 🚀',
        message:
          'Create your first task and start tracking your progress.',
        icon: 'rocket-outline',
      };
    }

    if (progressPercentage === 100) {
      return {
        title: 'Amazing! Everything is complete 🎉',
        message:
          'You completed every task. Keep this momentum going!',
        icon: 'trophy-outline',
      };
    }

    if (progressPercentage >= 75) {
      return {
        title: 'Excellent progress! 🔥',
        message:
          'You are almost there. Finish the remaining tasks.',
        icon: 'flame-outline',
      };
    }

    if (progressPercentage >= 50) {
      return {
        title: 'You are doing great! 💪',
        message:
          'More than half of your tasks are completed.',
        icon: 'trending-up-outline',
      };
    }

    if (progressPercentage >= 25) {
      return {
        title: 'Good start! 🌱',
        message:
          'Keep going and turn your pending tasks into wins.',
        icon: 'leaf-outline',
      };
    }

    return {
      title: 'Let’s get productive! ✨',
      message:
        'Start completing your tasks one by one.',
      icon: 'sparkles-outline',
    };
  };

  const progressMessage = getProgressMessage();

  // ---------------------------------------------------------
  // OPEN TASK
  // ---------------------------------------------------------

  const openTask = (id: string) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: String(id),
      },
    } as any);
  };

  // ---------------------------------------------------------
  // CATEGORY ICON
  // ---------------------------------------------------------

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'personal':
        return 'person-outline';

      case 'work':
        return 'briefcase-outline';

      case 'study':
        return 'book-outline';

      case 'health':
        return 'heart-outline';

      case 'shopping':
        return 'cart-outline';

      default:
        return 'apps-outline';
    }
  };

  // ---------------------------------------------------------
  // CATEGORY COLOR
  // ---------------------------------------------------------

  const getCategoryBackground = (category: string) => {
    switch (category.toLowerCase()) {
      case 'personal':
        return '#EAF3FF';

      case 'work':
        return '#FFF1E6';

      case 'study':
        return '#F0ECFF';

      case 'health':
        return '#E8F8F0';

      case 'shopping':
        return '#FFF7DE';

      default:
        return '#F1F3F5';
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          isTablet && styles.containerTablet,
        ]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#18202A"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Track Progress
            </Text>

            <Text style={styles.headerSubtitle}>
              See how much you have accomplished
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={23}
              color="#126EED"
            />
          </View>
        </View>

        {/* MAIN PROGRESS CARD */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressSmallTitle}>
                OVERALL PROGRESS
              </Text>

              <Text style={styles.progressTitle}>
                {progressPercentage}% Completed
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>
                {progressPercentage}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {completedTasks} completed
            </Text>

            <Text style={styles.progressFooterText}>
              {pendingTasks} remaining
            </Text>
          </View>
        </View>

        {/* STAT CARDS */}

        <View
          style={[
            styles.statsGrid,
            isTablet && styles.statsGridTablet,
          ]}
        >
          {/* TOTAL */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#EAF3FF',
                },
              ]}
            >
              <Ionicons
                name="layers-outline"
                size={21}
                color="#126EED"
              />
            </View>

            <Text style={styles.statNumber}>
              {totalTasks}
            </Text>

            <Text style={styles.statLabel}>
              Total Tasks
            </Text>
          </View>

          {/* COMPLETED */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#E8F8F0',
                },
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={21}
                color="#16835A"
              />
            </View>

            <Text style={styles.statNumber}>
              {completedTasks}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

          {/* PENDING */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#FFF3E3',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={21}
                color="#E77900"
              />
            </View>

            <Text style={styles.statNumber}>
              {pendingTasks}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          {/* SAVED */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#F0ECFF',
                },
              ]}
            >
              <Ionicons
                name="bookmark-outline"
                size={21}
                color="#7654D6"
              />
            </View>

            <Text style={styles.statNumber}>
              {savedTasks}
            </Text>

            <Text style={styles.statLabel}>
              Saved
            </Text>
          </View>
        </View>

        {/* TODAY'S PROGRESS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Today’s Progress
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your performance for today
            </Text>
          </View>

          <View style={styles.todayBadge}>
            <Ionicons
              name="today-outline"
              size={14}
              color="#126EED"
            />

            <Text style={styles.todayBadgeText}>
              {todayPercentage}%
            </Text>
          </View>
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayTop}>
            <View style={styles.todayCircle}>
              <Text style={styles.todayCircleText}>
                {todayPercentage}%
              </Text>
            </View>

            <View style={styles.todayInfo}>
              <Text style={styles.todayTitle}>
                Today
              </Text>

              <Text style={styles.todayDescription}>
                {todayTasks.length === 0
                  ? 'No tasks scheduled for today.'
                  : `${todayCompleted} of ${todayTasks.length} tasks completed`}
              </Text>
            </View>
          </View>

          <View style={styles.todayProgressBackground}>
            <View
              style={[
                styles.todayProgressFill,
                {
                  width: `${todayPercentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.todayBottom}>
            <View>
              <Text style={styles.todayNumber}>
                {todayCompleted}
              </Text>

              <Text style={styles.todayLabel}>
                Completed
              </Text>
            </View>

            <View>
              <Text style={styles.todayNumber}>
                {todayPending}
              </Text>

              <Text style={styles.todayLabel}>
                Remaining
              </Text>
            </View>

            <View>
              <Text style={styles.todayNumber}>
                {todayTasks.length}
              </Text>

              <Text style={styles.todayLabel}>
                Total
              </Text>
            </View>
          </View>
        </View>

        {/* PRODUCTIVITY MESSAGE */}

        <View style={styles.messageCard}>
          <View style={styles.messageIcon}>
            <Ionicons
              name={progressMessage.icon as any}
              size={25}
              color="#126EED"
            />
          </View>

          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>
              {progressMessage.title}
            </Text>

            <Text style={styles.messageText}>
              {progressMessage.message}
            </Text>
          </View>
        </View>

        {/* CATEGORY PROGRESS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Category Progress
            </Text>

            <Text style={styles.sectionSubtitle}>
              See which areas need more attention
            </Text>
          </View>
        </View>

        <View style={styles.categoryContainer}>
          {categoryStats.map((item) => (
            <View
              key={item.category}
              style={styles.categoryCard}
            >
              <View style={styles.categoryTop}>
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        getCategoryBackground(
                          item.category
                        ),
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      getCategoryIcon(
                        item.category
                      ) as any
                    }
                    size={19}
                    color="#126EED"
                  />
                </View>

                <View style={styles.categoryNameArea}>
                  <Text style={styles.categoryName}>
                    {item.category}
                  </Text>

                  <Text style={styles.categoryCount}>
                    {item.completed}/{item.total} completed
                  </Text>
                </View>

                <Text style={styles.categoryPercentage}>
                  {item.percentage}%
                </Text>
              </View>

              <View style={styles.categoryProgressBackground}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    {
                      width: `${item.percentage}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* RECENT TASKS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Tasks
            </Text>

            <Text style={styles.sectionSubtitle}>
              Quickly manage your task progress
            </Text>
          </View>
        </View>

        <View style={styles.taskList}>
          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="clipboard-outline"
                  size={36}
                  color="#126EED"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No tasks yet
              </Text>

              <Text style={styles.emptyText}>
                Create your first task to start
                tracking your progress.
              </Text>

              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.85}
                onPress={() =>
                  router.push('/add-task' as any)
                }
              >
                <Ionicons
                  name="add"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.createButtonText}>
                  Create Task
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            tasks.slice(0, 8).map((task: any) => (
              <View
                key={String(task.id)}
                style={styles.taskCard}
              >
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    task.completed &&
                      styles.checkboxCompleted,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    toggleTask(String(task.id))
                  }
                >
                  {task.completed && (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.taskContent}
                  activeOpacity={0.8}
                  onPress={() =>
                    openTask(String(task.id))
                  }
                >
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed &&
                        styles.taskTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {String(
                      task.title || 'Untitled Task'
                    )}
                  </Text>

                  <View style={styles.taskMeta}>
                    <Ionicons
                      name={
                        getCategoryIcon(
                          String(
                            task.category || 'Other'
                          )
                        ) as any
                      }
                      size={13}
                      color="#7A828D"
                    />

                    <Text style={styles.taskCategory}>
                      {String(
                        task.category || 'Other'
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View
                  style={[
                    styles.taskStatus,
                    task.completed
                      ? styles.completedStatus
                      : styles.pendingStatus,
                  ]}
                >
                  <Text
                    style={[
                      styles.taskStatusText,
                      task.completed
                        ? styles.completedStatusText
                        : styles.pendingStatusText,
                    ]}
                  >
                    {task.completed
                      ? 'Done'
                      : 'Pending'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* BOTTOM ACTION */}

        <TouchableOpacity
          style={styles.viewTasksButton}
          activeOpacity={0.88}
          onPress={() =>
            router.push('/task' as any)
          }
        >
          <Ionicons
            name="list-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.viewTasksText}>
            View All Tasks
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
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

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  containerTablet: {
    width: '100%',
    maxWidth: 1100,
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
    borderColor: '#E5E8ED',
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18202A',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#7B838D',
    marginTop: 3,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // MAIN PROGRESS

  progressCard: {
    backgroundColor: '#126EED',
    borderRadius: 24,
    padding: 21,
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressSmallTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#CFE2FF',
  },

  progressTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 5,
  },

  progressCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCircleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#126EED',
  },

  progressBarBackground: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#438CF1',
    overflow: 'hidden',
    marginTop: 22,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  progressFooterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCEBFF',
  },

  // STATS

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
  },

  statsGridTablet: {
    gap: 14,
  },

  statCard: {
    width: '48.5%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    minHeight: 125,
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '900',
    color: '#18202A',
  },

  statLabel: {
    fontSize: 12,
    color: '#7B838D',
    marginTop: 2,
  },

  // SECTION

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#18202A',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#7B838D',
    marginTop: 3,
  },

  // TODAY

  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  todayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#126EED',
  },

  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  todayTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  todayCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayCircleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#126EED',
  },

  todayInfo: {
    flex: 1,
    marginLeft: 14,
  },

  todayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D252E',
  },

  todayDescription: {
    fontSize: 12,
    color: '#7A828D',
    marginTop: 4,
  },

  todayProgressBackground: {
    height: 9,
    backgroundColor: '#E9EDF2',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 18,
  },

  todayProgressFill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 10,
  },

  todayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  todayNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18202A',
  },

  todayLabel: {
    fontSize: 10,
    color: '#7A828D',
    marginTop: 2,
  },

  // MESSAGE

  messageCard: {
    backgroundColor: '#EAF3FF',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#D8E9FF',
  },

  messageIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  messageContent: {
    flex: 1,
  },

  messageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#163B68',
  },

  messageText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#60738B',
    marginTop: 4,
  },

  // CATEGORY

  categoryContainer: {
    gap: 11,
    marginBottom: 25,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryNameArea: {
    flex: 1,
    marginLeft: 11,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C242E',
  },

  categoryCount: {
    fontSize: 10,
    color: '#7B838D',
    marginTop: 3,
  },

  categoryPercentage: {
    fontSize: 14,
    fontWeight: '900',
    color: '#126EED',
  },

  categoryProgressBackground: {
    height: 7,
    backgroundColor: '#EEF1F4',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 13,
  },

  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 8,
  },

  // TASKS

  taskList: {
    gap: 10,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B8BEC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxCompleted: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  taskContent: {
    flex: 1,
    marginLeft: 12,
  },

  taskTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C242E',
  },

  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#979DA5',
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },

  taskCategory: {
    fontSize: 10,
    color: '#7A828D',
  },

  taskStatus: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  completedStatus: {
    backgroundColor: '#E8F8F0',
  },

  pendingStatus: {
    backgroundColor: '#FFF3E3',
  },

  taskStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  completedStatusText: {
    color: '#16835A',
  },

  pendingStatusText: {
    color: '#E77900',
  },

  // EMPTY

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAEF',
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18202A',
  },

  emptyText: {
    fontSize: 12,
    color: '#7A828D',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  createButton: {
    marginTop: 17,
    backgroundColor: '#126EED',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  createButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // BOTTOM

  viewTasksButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },

  viewTasksText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});