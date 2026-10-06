import React, { useEffect, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Expense,
  formatMoney,
  getExpenses,
} from '../utils/financeStorage';

const HEALTH_KEY = 'smart_health_fitness';
const TASK_KEY = 'smart_todo_tasks';

export default function DailyInsights() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  const isDesktop = width >= 800;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const AsyncStorage =
        require(
          '@react-native-async-storage/async-storage',
        ).default;

      // -----------------------------
      // HEALTH DATA
      // -----------------------------
      const health = await AsyncStorage.getItem(
        HEALTH_KEY,
      );

      if (health) {
        const data = JSON.parse(health);

        setSteps(Number(data.steps) || 0);
        setWater(Number(data.water) || 0);
      }

      // -----------------------------
      // TASK DATA
      // -----------------------------
      const taskData = await AsyncStorage.getItem(
        TASK_KEY,
      );

      if (taskData) {
        const tasks = JSON.parse(taskData);

        setTotalTasks(
          Array.isArray(tasks)
            ? tasks.length
            : 0,
        );

        setCompletedTasks(
          Array.isArray(tasks)
            ? tasks.filter(
                (item: any) =>
                  item.completed === true,
              ).length
            : 0,
        );
      }

      // -----------------------------
      // FINANCE DATA
      // -----------------------------
      const expenseData = await getExpenses();

      setExpenses(
        Array.isArray(expenseData)
          ? expenseData
          : [],
      );
    } catch (error) {
      console.log(
        'Daily insights loading error:',
        error,
      );
    }
  };

  // -----------------------------
  // BACK BUTTON
  // -----------------------------
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/task' as any);
    }
  };

  // -----------------------------
  // TOTAL EXPENSE
  // -----------------------------
  const totalExpense = expenses.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0,
  );

  // -----------------------------
  // TASK PROGRESS
  // -----------------------------
  const taskProgress =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100,
        )
      : 0;

  // -----------------------------
  // HEALTH PROGRESS
  // -----------------------------
  const healthProgress = Math.min(
    Math.round(
      (steps / 10000) * 50 +
        (water / 2500) * 50,
    ),
    100,
  );

  // -----------------------------
  // OVERALL SCORE
  // -----------------------------
  const overall = Math.round(
    (taskProgress +
      healthProgress) /
      2,
  );

  // -----------------------------
  // SMART MESSAGE
  // -----------------------------
  let message =
    'Start small and build consistency.';

  if (overall >= 80) {
    message =
      '🔥 Amazing! You are having a highly productive day.';
  } else if (overall >= 60) {
    message =
      '✨ Great progress! Keep your momentum going.';
  } else if (overall >= 40) {
    message =
      '💪 You are making progress. Keep moving forward.';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          isDesktop && styles.desktopContainer,
        ]}
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#101828"
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                SMART LIFE
              </Text>

              <Text style={styles.title}>
                Daily Insights
              </Text>

              <Text style={styles.subtitle}>
                One simple view of your day.
              </Text>
            </View>
          </View>
        </View>

        {/* ================================= */}
        {/* SMART SCORE */}
        {/* ================================= */}

        <View style={styles.hero}>
          <View style={styles.scoreIconCircle}>
            <Ionicons
              name="sparkles"
              size={22}
              color="#126EED"
            />
          </View>

          <Text style={styles.heroSmall}>
            TODAY'S SMART SCORE
          </Text>

          <Text style={styles.score}>
            {overall}%
          </Text>

          <View style={styles.scoreProgressBackground}>
            <View
              style={[
                styles.scoreProgressFill,
                {
                  width: `${overall}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.message}>
            {message}
          </Text>
        </View>

        {/* ================================= */}
        {/* INSIGHT CARDS */}
        {/* ================================= */}

        <View style={styles.grid}>
          {/* TASKS */}
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={25}
                color="#126EED"
              />
            </View>

            <Text style={styles.label}>
              Tasks
            </Text>

            <Text style={styles.value}>
              {completedTasks}/{totalTasks}
            </Text>

            <Text style={styles.meta}>
              {taskProgress}% completed
            </Text>
          </View>

          {/* STEPS */}
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="walk"
                size={25}
                color="#16A34A"
              />
            </View>

            <Text style={styles.label}>
              Steps
            </Text>

            <Text style={styles.value}>
              {steps.toLocaleString()}
            </Text>

            <Text style={styles.meta}>
              Goal: 10,000
            </Text>
          </View>

          {/* WATER */}
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
                styles.cyanIcon,
              ]}
            >
              <Ionicons
                name="water"
                size={25}
                color="#0891B2"
              />
            </View>

            <Text style={styles.label}>
              Water
            </Text>

            <Text style={styles.value}>
              {water} ml
            </Text>

            <Text style={styles.meta}>
              Goal: 2,500 ml
            </Text>
          </View>

          {/* EXPENSES */}
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="wallet"
                size={25}
                color="#EA580C"
              />
            </View>

            <Text style={styles.label}>
              Expenses
            </Text>

            <Text style={styles.value}>
              {formatMoney(totalExpense)}
            </Text>

            <Text style={styles.meta}>
              Recorded today
            </Text>
          </View>
        </View>

        {/* ================================= */}
        {/* DAILY INSIGHT */}
        {/* ================================= */}

        <View style={styles.insight}>
          <View style={styles.insightHeader}>
            <View style={styles.brainCircle}>
              <Ionicons
                name="bulb"
                size={22}
                color="#FACC15"
              />
            </View>

            <Text style={styles.insightTitle}>
              Your Daily Insight
            </Text>
          </View>

          <Text style={styles.insightText}>
            You completed{' '}
            <Text style={styles.bold}>
              {completedTasks}
            </Text>{' '}
            tasks, walked{' '}
            <Text style={styles.bold}>
              {steps.toLocaleString()}
            </Text>{' '}
            steps and drank{' '}
            <Text style={styles.bold}>
              {water} ml
            </Text>{' '}
            of water today.
          </Text>

          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniValue}>
                {taskProgress}%
              </Text>

              <Text style={styles.miniLabel}>
                Task Progress
              </Text>
            </View>

            <View style={styles.miniDivider} />

            <View style={styles.miniStat}>
              <Text style={styles.miniValue}>
                {healthProgress}%
              </Text>

              <Text style={styles.miniLabel}>
                Health Progress
              </Text>
            </View>

            <View style={styles.miniDivider} />

            <View style={styles.miniStat}>
              <Text style={styles.miniValue}>
                {overall}%
              </Text>

              <Text style={styles.miniLabel}>
                Smart Score
              </Text>
            </View>
          </View>
        </View>

        {/* ================================= */}
        {/* ACTION BUTTONS */}
        {/* ================================= */}

        <View style={styles.actions}>
          {/* TASK PROGRESS */}
          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() =>
              router.push(
                '/track-progress' as any,
              )
            }
          >
            <View
              style={[
                styles.actionIcon,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="stats-chart"
                size={22}
                color="#126EED"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                View Task Progress
              </Text>

              <Text style={styles.actionSubtitle}>
                Track your productivity
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#98A2B3"
            />
          </Pressable>

          {/* HEALTH */}
          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() =>
              router.push(
                '/health-fitness' as any,
              )
            }
          >
            <View
              style={[
                styles.actionIcon,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="heart"
                size={22}
                color="#16A34A"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Health Dashboard
              </Text>

              <Text style={styles.actionSubtitle}>
                Steps, water & fitness
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#98A2B3"
            />
          </Pressable>

          {/* FINANCE */}
          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() =>
              router.push(
                '/finance' as any,
              )
            }
          >
            <View
              style={[
                styles.actionIcon,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="wallet"
                size={22}
                color="#EA580C"
              />
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Finance Dashboard
              </Text>

              <Text style={styles.actionSubtitle}>
                Manage your money & expenses
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#98A2B3"
            />
          </Pressable>
        </View>

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <View style={styles.footer}>
          <Ionicons
            name="sparkles"
            size={16}
            color="#126EED"
          />

          <Text style={styles.footerText}>
            Smart Life • Your day, your progress,
            your insights.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 70,
  },

  desktopContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
  },

  // ==============================
  // HEADER
  // ==============================

  header: {
    marginBottom: 22,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    marginRight: 13,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  backButtonPressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: '#126EED',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },

  title: {
    color: '#101828',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },

  subtitle: {
    color: '#667085',
    marginTop: 5,
    fontSize: 14,
  },

  // ==============================
  // HERO
  // ==============================

  hero: {
    backgroundColor: '#126EED',
    borderRadius: 27,
    padding: 30,
    alignItems: 'center',
    marginBottom: 18,

    shadowColor: '#126EED',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },

  scoreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  heroSmall: {
    color: '#CFE2FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  score: {
    color: '#FFFFFF',
    fontSize: 65,
    fontWeight: '900',
    marginTop: 2,
  },

  scoreProgressBackground: {
    width: '80%',
    maxWidth: 500,
    height: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    marginTop: 4,
  },

  scoreProgressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  message: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 15,
    lineHeight: 21,
  },

  // ==============================
  // GRID
  // ==============================

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
  },

  card: {
    flexGrow: 1,
    width: '47%',
    minWidth: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF0',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  blueIcon: {
    backgroundColor: '#EAF2FF',
  },

  greenIcon: {
    backgroundColor: '#EAF8EF',
  },

  cyanIcon: {
    backgroundColor: '#E7F8FC',
  },

  orangeIcon: {
    backgroundColor: '#FFF1E8',
  },

  label: {
    color: '#667085',
    fontWeight: '800',
    marginTop: 12,
    fontSize: 14,
  },

  value: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },

  meta: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 4,
  },

  // ==============================
  // INSIGHT
  // ==============================

  insight: {
    backgroundColor: '#101828',
    borderRadius: 23,
    padding: 24,
    marginTop: 18,
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brainCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(250,204,21,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  insightTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  insightText: {
    color: '#D0D5DD',
    lineHeight: 23,
    marginTop: 13,
    fontSize: 14,
  },

  bold: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  miniStat: {
    flex: 1,
    alignItems: 'center',
  },

  miniValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  miniLabel: {
    color: '#98A2B3',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },

  miniDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // ==============================
  // ACTIONS
  // ==============================

  actions: {
    marginTop: 18,
    gap: 10,
  },

  action: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  actionPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionContent: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '900',
  },

  actionSubtitle: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 3,
  },

  // ==============================
  // FOOTER
  // ==============================

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 7,
  },

  footerText: {
    color: '#98A2B3',
    fontSize: 11,
    textAlign: 'center',
  },
});