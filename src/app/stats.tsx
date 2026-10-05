
import React, { useMemo } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTaskContext } from '../context/TaskContext';

const PRIMARY = '#126EED';

export default function StatsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { tasks } = useTaskContext();

  // =====================================================
  // SAFE TASK DATA
  // =====================================================

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // =====================================================
  // MAIN STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = safeTasks.length;

    const completed = safeTasks.filter(
      (task) => Boolean(task.completed)
    ).length;

    const pending = Math.max(
      0,
      total - completed
    );

    const percentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      completed,
      pending,
      percentage,
    };
  }, [safeTasks]);

  // =====================================================
  // CATEGORY STATISTICS
  // =====================================================

  const categoryStats = useMemo(() => {
    const categories = [
      {
        name: 'Personal',
        icon: 'person-outline' as const,
      },
      {
        name: 'Work',
        icon: 'briefcase-outline' as const,
      },
      
      {
        name: 'Shopping',
        icon: 'cart-outline' as const,
      },
      {
        name: 'Study',
        icon: 'book-outline' as const,
      },
      {
        name: 'Health',
        icon: 'heart-outline' as const,
      },
      {
        name: 'Other',
        icon: 'folder-outline' as const,
      },
    ];

    return categories.map((category) => {
      const categoryTasks = safeTasks.filter(
        (task) =>
          String(task.category || '').toLowerCase() ===
          category.name.toLowerCase()
      );

      const total = categoryTasks.length;

      const completed = categoryTasks.filter(
        (task) => Boolean(task.completed)
      ).length;

      const percentage =
        total > 0
          ? Math.round((completed / total) * 100)
          : 0;

      return {
        ...category,
        total,
        completed,
        percentage,
      };
    });
  }, [safeTasks]);

  // =====================================================
  // PROGRESS WIDTH
  // =====================================================

  const getProgressWidth = (
    completed: number,
    total: number
  ): `${number}%` => {
    if (!Number.isFinite(total) || total <= 0) {
      return '0%';
    }

    if (!Number.isFinite(completed) || completed <= 0) {
      return '0%';
    }

    const percentage = Math.min(
      100,
      Math.max(
        0,
        Math.round((completed / total) * 100)
      )
    );

    return `${percentage}%`;
  };

  // =====================================================
  // BACK BUTTON
  // =====================================================

  const handleBack = () => {
    /*
      IMPORTANT:

      We do NOT use /todo here.

      If Stats was opened using:

      router.push('/stats')

      router.back() will return to the page
      from which Stats was opened.
    */

    if (router.canGoBack()) {
      router.back();
      return;
    }

    /*
      If there is no navigation history,
      go to the root/index page.
    */

    router.replace('/task' as any);
  };

  // =====================================================
  // ADD TASK
  // =====================================================

  const handleAddTask = () => {
    router.push('/add-task' as any);
  };

  // =====================================================
  // RESPONSIVE
  // =====================================================

  const isTablet = width >= 768;

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.tabletContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Statistics
            </Text>

            <Text style={styles.headerSubtitle}>
              Track your productivity
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart"
              size={23}
              color={PRIMARY}
            />
          </View>
        </View>

        {/* =================================================
            PRODUCTIVITY OVERVIEW
        ================================================= */}

        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.overviewTextContainer}>
              <Text style={styles.overviewTitle}>
                Your Productivity
              </Text>

              <Text style={styles.overviewSubtitle}>
                Keep going and complete your goals
              </Text>
            </View>

            <View style={styles.percentCircle}>
              <Text style={styles.percentText}>
                {statistics.percentage}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: getProgressWidth(
                    statistics.completed,
                    statistics.total
                  ),
                },
              ]}
            />
          </View>

          <Text style={styles.progressLabel}>
            {statistics.completed} of{' '}
            {statistics.total} tasks completed
          </Text>
        </View>

        {/* =================================================
            STAT CARDS
        ================================================= */}

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
                styles.totalIcon,
              ]}
            >
              <Ionicons
                name="list-outline"
                size={25}
                color={PRIMARY}
              />
            </View>

            <Text style={styles.statNumber}>
              {statistics.total}
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
                styles.completedIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={25}
                color="#16A34A"
              />
            </View>

            <Text style={styles.statNumber}>
              {statistics.completed}
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
                styles.pendingIcon,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={25}
                color="#F59E0B"
              />
            </View>

            <Text style={styles.statNumber}>
              {statistics.pending}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>
        </View>

        {/* =================================================
            CATEGORY PROGRESS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Category Progress
          </Text>

          <Ionicons
            name="pie-chart-outline"
            size={21}
            color={PRIMARY}
          />
        </View>

        {categoryStats.map((category) => (
          <View
            key={category.name}
            style={styles.categoryCard}
          >
            <View style={styles.categoryTop}>
              <View style={styles.categoryLeft}>
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={category.icon}
                    size={22}
                    color={PRIMARY}
                  />
                </View>

                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>
                    {category.name}
                  </Text>

                  <Text style={styles.categoryTasks}>
                    {category.completed} of{' '}
                    {category.total} completed
                  </Text>
                </View>
              </View>

              <Text style={styles.categoryPercentage}>
                {category.percentage}%
              </Text>
            </View>

            {/* Category Progress */}

            <View style={styles.categoryProgressBackground}>
              <View
                style={[
                  styles.categoryProgressFill,
                  {
                    width: getProgressWidth(
                      category.completed,
                      category.total
                    ),
                  },
                ]}
              />
            </View>
          </View>
        ))}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {statistics.total === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={42}
                color={PRIMARY}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Tasks Yet
            </Text>

            <Text style={styles.emptyText}>
              Add some tasks to start tracking
              your productivity.
            </Text>

            <TouchableOpacity
              style={styles.addTaskButton}
              activeOpacity={0.8}
              onPress={handleAddTask}
            >
              <Ionicons
                name="add"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.addTaskText}>
                Add Task
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            MOTIVATION CARD
        ================================================= */}

        {statistics.total > 0 && (
          <View style={styles.motivationCard}>
            <View style={styles.motivationIcon}>
              <Ionicons
                name={
                  statistics.percentage >= 80
                    ? 'trophy-outline'
                    : statistics.percentage >= 50
                    ? 'flash-outline'
                    : 'rocket-outline'
                }
                size={28}
                color={PRIMARY}
              />
            </View>

            <View style={styles.motivationContent}>
              <Text style={styles.motivationTitle}>
                {statistics.percentage >= 80
                  ? 'Excellent work! 🎉'
                  : statistics.percentage >= 50
                  ? 'Great progress! 💪'
                  : 'Keep going! 🚀'}
              </Text>

              <Text style={styles.motivationText}>
                {statistics.percentage >= 80
                  ? 'You are doing an amazing job completing your tasks.'
                  : statistics.percentage >= 50
                  ? 'You are more than halfway there. Keep it up!'
                  : 'Complete your pending tasks and build your productivity.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 40,
  },

  tabletContent: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#6B7280',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ====================================================
  // OVERVIEW
  // ====================================================

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 3,
  },

  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  overviewTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  overviewSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: '#6B7280',
  },

  percentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percentText: {
    fontSize: 17,
    fontWeight: '800',
    color: PRIMARY,
  },

  progressBackground: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginTop: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: PRIMARY,
  },

  progressLabel: {
    marginTop: 9,
    fontSize: 12,
    color: '#6B7280',
  },

  // ====================================================
  // STAT CARDS
  // ====================================================

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },

  statsGridTablet: {
    gap: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  totalIcon: {
    backgroundColor: '#EAF2FF',
  },

  completedIcon: {
    backgroundColor: '#EAF8EF',
  },

  pendingIcon: {
    backgroundColor: '#FFF5DF',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },

  // ====================================================
  // SECTION
  // ====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // ====================================================
  // CATEGORY
  // ====================================================

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  categoryText: {
    flex: 1,
  },

  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  categoryTasks: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
  },

  categoryPercentage: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },

  categoryProgressBackground: {
    height: 7,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    marginTop: 15,
    overflow: 'hidden',
  },

  categoryProgressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: PRIMARY,
  },

  // ====================================================
  // EMPTY STATE
  // ====================================================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 7,

    elevation: 2,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 280,
  },

  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    marginTop: 18,
    gap: 7,
  },

  addTaskText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ====================================================
  // MOTIVATION
  // ====================================================

  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
  },

  motivationIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  motivationContent: {
    flex: 1,
  },

  motivationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  motivationText: {
    fontSize: 12,
    color: '#5B6472',
    lineHeight: 18,
    marginTop: 3,
  },
});

