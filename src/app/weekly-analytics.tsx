import React, { useEffect, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  Expense,
  formatMoney,
  getExpenses,
} from '../utils/financeStorage';

export default function WeeklyAnalytics() {
  const router = useRouter();

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [steps, setSteps] =
    useState(0);

  const [water, setWater] =
    useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const expenseData =
      await getExpenses();

    setExpenses(expenseData);

    try {
      const AsyncStorage =
        require(
          '@react-native-async-storage/async-storage',
        ).default;

      const health =
        await AsyncStorage.getItem(
          'smart_health_fitness',
        );

      if (health) {
        const data =
          JSON.parse(health);

        setSteps(data.steps || 0);
        setWater(data.water || 0);
      }
    } catch {}
  };

  const totalExpense =
    expenses.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    );

  const averageSteps =
    Math.round(steps / 7);

  const averageWater =
    Math.round(water / 7);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              ANALYTICS
            </Text>

            <Text style={styles.title}>
              Weekly Analytics
            </Text>

            <Text style={styles.subtitle}>
              Understand your habits and
              improve consistently.
            </Text>
          </View>

          <Pressable
            style={styles.back}
            onPress={() =>
              router.back()
            }
          >
            <Text>← Back</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Your Week at a Glance
          </Text>

          <Text style={styles.heroText}>
            Small improvements every day create
            meaningful progress over time.
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.icon}>
              🚶
            </Text>

            <Text style={styles.label}>
              Current Steps
            </Text>

            <Text style={styles.value}>
              {steps.toLocaleString()}
            </Text>

            <Text style={styles.meta}>
              Avg: {averageSteps}/day
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.icon}>
              💧
            </Text>

            <Text style={styles.label}>
              Water Intake
            </Text>

            <Text style={styles.value}>
              {water} ml
            </Text>

            <Text style={styles.meta}>
              Avg: {averageWater} ml/day
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.icon}>
              💰
            </Text>

            <Text style={styles.label}>
              Recorded Expenses
            </Text>

            <Text style={styles.value}>
              {formatMoney(
                totalExpense,
              )}
            </Text>

            <Text style={styles.meta}>
              Based on tracked records
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Weekly Targets
          </Text>

          <AnalyticsBar
            title="Steps"
            current={steps}
            goal={70000}
            unit="steps"
          />

          <AnalyticsBar
            title="Water"
            current={water}
            goal={17500}
            unit="ml"
          />

          <AnalyticsBar
            title="Healthy Days"
            current={
              steps >= 5000 &&
              water >= 1500
                ? 1
                : 0
            }
            goal={7}
            unit="days"
          />
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipTitle}>
            📈 Improvement Strategy
          </Text>

          <Text style={styles.tipText}>
            Try increasing your activity gradually
            instead of making drastic changes.
            Consistency is more important than
            perfection.
          </Text>
        </View>

        <Pressable
          style={styles.insightButton}
          onPress={() =>
            router.push(
              '/daily-insights' as any,
            )
          }
        >
          <Text
            style={
              styles.insightButtonText
            }
          >
            🧠 Open Daily Insights
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function AnalyticsBar({
  title,
  current,
  goal,
  unit,
}: {
  title: string;
  current: number;
  goal: number;
  unit: string;
}) {
  const percentage = Math.min(
    (current / goal) * 100,
    100,
  );

  return (
    <View style={styles.analytics}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>
          {title}
        </Text>

        <Text style={styles.analyticsValue}>
          {current.toLocaleString()} /{' '}
          {goal.toLocaleString()} {unit}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.percent}>
        {Math.round(percentage)}%
      </Text>
    </View>
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
    padding: 24,
    paddingBottom: 70,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
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
    marginTop: 5,
  },

  subtitle: {
    color: '#667085',
    marginTop: 5,
  },

  back: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },

  hero: {
    backgroundColor: '#101828',
    padding: 26,
    borderRadius: 24,
    marginBottom: 18,
  },

  heroTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },

  heroText: {
    color: '#D0D5DD',
    marginTop: 7,
    lineHeight: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
  },

  card: {
    flex: 1,
    minWidth: 230,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  icon: {
    fontSize: 27,
  },

  label: {
    color: '#667085',
    fontWeight: '800',
    marginTop: 8,
  },

  value: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
  },

  meta: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 4,
  },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 18,
  },

  analytics: {
    marginBottom: 20,
  },

  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  analyticsTitle: {
    fontWeight: '900',
    color: '#344054',
  },

  analyticsValue: {
    color: '#667085',
    fontSize: 11,
  },

  track: {
    height: 10,
    backgroundColor: '#EAECF0',
    borderRadius: 20,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 20,
  },

  percent: {
    color: '#126EED',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
  },

  tip: {
    backgroundColor: '#EEF5FF',
    padding: 21,
    borderRadius: 20,
    marginTop: 18,
  },

  tipTitle: {
    color: '#126EED',
    fontWeight: '900',
  },

  tipText: {
    color: '#475467',
    lineHeight: 20,
    marginTop: 6,
  },

  insightButton: {
    backgroundColor: '#126EED',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 18,
  },

  insightButtonText: {
    color: '#FFF',
    fontWeight: '900',
  },
});