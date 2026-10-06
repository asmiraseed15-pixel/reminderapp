import React, { useCallback, useState } from 'react';

import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';
import {
  getFinance,
  getWellness,
  FinanceData,
  WellnessData,
} from '../utils/lifeStorage';

export default function InsightsScreen() {
  const router = useRouter();
  const { tasks } = useTasks();

  const [wellness, setWellness] =
    useState<WellnessData | null>(null);

  const [finance, setFinance] =
    useState<FinanceData | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadData = async () => {
    const wellnessData =
      await getWellness();

    const financeData =
      await getFinance();

    setWellness(wellnessData);
    setFinance(financeData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const refresh = async () => {
    setRefreshing(true);

    await loadData();

    setRefreshing(false);
  };

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const taskProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const income =
    finance?.transactions
      .filter(
        (item) => item.type === 'income'
      )
      .reduce(
        (sum, item) => sum + item.amount,
        0
      ) || 0;

  const expenses =
    finance?.transactions
      .filter(
        (item) => item.type === 'expense'
      )
      .reduce(
        (sum, item) => sum + item.amount,
        0
      ) || 0;

  const balance = income - expenses;

  const wellnessScore = wellness
    ? Math.round(
        Math.min(
          100,
          (wellness.steps / 10000) *
            100 *
            0.35
        ) +
          Math.min(
            100,
            (wellness.water /
              wellness.waterGoal) *
              100
          ) *
            0.2 +
          Math.min(
            100,
            (wellness.sleepHours /
              wellness.sleepGoal) *
              100
          ) *
            0.25 +
          Math.min(
            100,
            (wellness.activeMinutes / 60) *
              100
          ) *
            0.2
      )
    : 0;

  const overallScore = Math.round(
    taskProgress * 0.4 +
      wellnessScore * 0.3 +
      (finance && finance.monthlyBudget > 0
        ? Math.max(
            0,
            100 -
              (expenses /
                finance.monthlyBudget) *
                100
          )
        : 70) *
        0.3
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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
                router.replace('/task' as any);
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              SMART LIFE
            </Text>

            <Text style={styles.title}>
              Insights
            </Text>

            <Text style={styles.subtitle}>
              One place to understand your day.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
          >
            <Ionicons
              name="refresh"
              size={21}
              color="#126EED"
            />
          </TouchableOpacity>
        </View>

        {/* OVERALL */}

        <View style={styles.overallCard}>
          <View style={styles.overallCircle}>
            <Text style={styles.overallNumber}>
              {overallScore}%
            </Text>

            <Text style={styles.overallLabel}>
              Overall
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.overallTitle}>
              Your Smart Life Score
            </Text>

            <Text style={styles.overallText}>
              Balance productivity, wellness and
              financial habits to build a better
              routine.
            </Text>
          </View>
        </View>

        {/* THREE AREAS */}

        <Text style={styles.sectionTitle}>
          Today's Overview
        </Text>

        <View style={styles.areaGrid}>
          <TouchableOpacity
            style={styles.areaCard}
            onPress={() =>
              router.push('/task' as any)
            }
          >
            <View style={styles.areaIcon}>
              <Ionicons
                name="checkmark-done"
                size={24}
                color="#126EED"
              />
            </View>

            <Text style={styles.areaTitle}>
              Productivity
            </Text>

            <Text style={styles.areaValue}>
              {taskProgress}%
            </Text>

            <Text style={styles.areaText}>
              {completedTasks}/{totalTasks}{' '}
              tasks complete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.areaCard}
            onPress={() =>
              router.push('/wellness' as any)
            }
          >
            <View style={styles.areaIcon}>
              <Ionicons
                name="heart"
                size={24}
                color="#126EED"
              />
            </View>

            <Text style={styles.areaTitle}>
              Wellness
            </Text>

            <Text style={styles.areaValue}>
              {wellnessScore}%
            </Text>

            <Text style={styles.areaText}>
              {wellness?.steps.toLocaleString() ||
                0}{' '}
              steps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.areaCard}
            onPress={() =>
              router.push('/finance' as any)
            }
          >
            <View style={styles.areaIcon}>
              <Ionicons
                name="wallet"
                size={24}
                color="#126EED"
              />
            </View>

            <Text style={styles.areaTitle}>
              Finance
            </Text>

            <Text style={styles.areaValue}>
              ₹{expenses.toLocaleString('en-IN')}
            </Text>

            <Text style={styles.areaText}>
              total expenses
            </Text>
          </TouchableOpacity>
        </View>

        {/* WELLNESS */}

        <Text style={styles.sectionTitle}>
          Wellness Snapshot
        </Text>

        <View style={styles.card}>
          <MetricRow
            icon="walk"
            title="Steps"
            value={
              wellness
                ? wellness.steps.toLocaleString()
                : '0'
            }
            progress={
              wellness
                ? Math.min(
                    100,
                    (wellness.steps / 10000) *
                      100
                  )
                : 0
            }
          />

          <MetricRow
            icon="water"
            title="Water"
            value={
              wellness
                ? `${wellness.water}/${wellness.waterGoal}`
                : '0/8'
            }
            progress={
              wellness
                ? (wellness.water /
                    wellness.waterGoal) *
                  100
                : 0
            }
          />

          <MetricRow
            icon="moon"
            title="Sleep"
            value={
              wellness
                ? `${wellness.sleepHours} hrs`
                : '0 hrs'
            }
            progress={
              wellness
                ? (wellness.sleepHours /
                    wellness.sleepGoal) *
                  100
                : 0
            }
          />

          <MetricRow
            icon="flame"
            title="Calories"
            value={
              wellness
                ? `${Math.round(
                    wellness.calories
                  )} kcal`
                : '0 kcal'
            }
            progress={
              wellness
                ? Math.min(
                    100,
                    (wellness.calories / 400) *
                      100
                  )
                : 0
            }
          />

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() =>
              router.push('/wellness' as any)
            }
          >
            <Text style={styles.outlineText}>
              Open Wellness
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#126EED"
            />
          </TouchableOpacity>
        </View>

        {/* FINANCE */}

        <Text style={styles.sectionTitle}>
          Finance Snapshot
        </Text>

        <View style={styles.financeCard}>
          <View style={styles.financeRow}>
            <View>
              <Text style={styles.financeLabel}>
                Income
              </Text>

              <Text style={styles.income}>
                + ₹{income.toLocaleString('en-IN')}
              </Text>
            </View>

            <View>
              <Text style={styles.financeLabel}>
                Expenses
              </Text>

              <Text style={styles.expense}>
                - ₹{expenses.toLocaleString(
                  'en-IN'
                )}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.balanceLabel}>
            Current Balance
          </Text>

          <Text style={styles.financeBalance}>
            ₹{balance.toLocaleString('en-IN')}
          </Text>

          <TouchableOpacity
            style={styles.financeButton}
            onPress={() =>
              router.push('/finance' as any)
            }
          >
            <Text style={styles.financeButtonText}>
              Open Finance
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* PRODUCTIVITY */}

        <Text style={styles.sectionTitle}>
          Productivity
        </Text>

        <View style={styles.card}>
          <View style={styles.taskProgressTop}>
            <View>
              <Text style={styles.cardTitle}>
                Task Completion
              </Text>

              <Text style={styles.cardSubtitle}>
                Keep your momentum going.
              </Text>
            </View>

            <Text style={styles.progressNumber}>
              {taskProgress}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${taskProgress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.taskStats}>
            <View>
              <Text style={styles.taskStatNumber}>
                {totalTasks}
              </Text>

              <Text style={styles.taskStatLabel}>
                Total
              </Text>
            </View>

            <View>
              <Text style={styles.taskStatNumber}>
                {completedTasks}
              </Text>

              <Text style={styles.taskStatLabel}>
                Completed
              </Text>
            </View>

            <View>
              <Text style={styles.taskStatNumber}>
                {totalTasks -
                  completedTasks}
              </Text>

              <Text style={styles.taskStatLabel}>
                Pending
              </Text>
            </View>
          </View>
        </View>

        {/* FINAL MESSAGE */}

        <View style={styles.messageCard}>
          <Text style={styles.messageEmoji}>
            ✨
          </Text>

          <Text style={styles.messageTitle}>
            Progress, not perfection.
          </Text>

          <Text style={styles.messageText}>
            Complete your tasks, move your body,
            take care of your money and keep
            building better habits.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({
  icon,
  title,
  value,
  progress,
}: {
  icon: any;
  title: string;
  value: string;
  progress: number;
}) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#126EED"
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.metricTop}>
          <Text style={styles.metricTitle}>
            {title}
          </Text>

          <Text style={styles.metricValue}>
            {value}
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  Math.max(0, progress)
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  eyebrow: {
    color: '#126EED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '900',
  },

  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 3,
  },

  overallCard: {
    backgroundColor: '#126EED',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 25,
  },

  overallCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overallNumber: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },

  overallLabel: {
    color: '#DCEAFF',
    fontSize: 11,
    fontWeight: '700',
  },

  overallTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  overallText: {
    color: '#DCEAFF',
    lineHeight: 20,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    marginTop: 5,
  },

  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },

  areaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flex: 1,
    minWidth: 200,
  },

  areaIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  areaTitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 12,
  },

  areaValue: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 3,
  },

  areaText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 3,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metricTitle: {
    color: '#374151',
    fontWeight: '700',
  },

  metricValue: {
    color: '#111827',
    fontWeight: '900',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 7,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 10,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#126EED',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  outlineText: {
    color: '#126EED',
    fontWeight: '900',
  },

  financeCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    marginBottom: 25,
  },

  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  financeLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  income: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  expense: {
    color: '#FB7185',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 18,
  },

  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  financeBalance: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    marginTop: 4,
  },

  financeButton: {
    backgroundColor: '#126EED',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },

  financeButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  taskProgressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },

  cardSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
  },

  progressNumber: {
    color: '#126EED',
    fontSize: 22,
    fontWeight: '900',
  },

  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 22,
  },

  taskStatNumber: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },

  taskStatLabel: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  messageEmoji: {
    fontSize: 35,
  },

  messageTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },

  messageText: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
});