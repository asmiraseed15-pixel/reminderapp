import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

import {
  WellnessData,
  getTodayKey,
  getWellness,
  saveWellness,
} from '../utils/lifeStorage';

const STEP_GOAL = 10000;
const CALORIES_PER_STEP = 0.04;

export default function WellnessScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [data, setData] = useState<WellnessData | null>(null);
  const [stepSubscription, setStepSubscription] =
    useState<any>(null);

  const [manualSteps, setManualSteps] = useState('');

  const isDesktop = width >= 900;

  useEffect(() => {
    loadData();

    startPedometer();

    return () => {
      if (stepSubscription) {
        stepSubscription.remove();
      }
    };
  }, []);

  const loadData = async () => {
    const saved = await getWellness();
    setData(saved);
  };

  const startPedometer = async () => {
    try {
      if (Platform.OS === 'web') return;

      const available = await Pedometer.isAvailableAsync();

      if (!available) return;

      const subscription = Pedometer.watchStepCount(
        async (result) => {
          setData((previous) => {
            if (!previous) return previous;

            const steps = Math.max(
              previous.steps,
              result.steps
            );

            const updated = {
              ...previous,
              steps,
              calories: Math.round(
                steps * CALORIES_PER_STEP
              ),
            };

            saveWellness(updated);

            return updated;
          });
        }
      );

      setStepSubscription(subscription);
    } catch (error) {
      console.log('Pedometer unavailable:', error);
    }
  };

  const updateData = async (
    updates: Partial<WellnessData>
  ) => {
    if (!data) return;

    const updated = {
      ...data,
      ...updates,
    };

    setData(updated);
    await saveWellness(updated);
  };

  const addWater = async () => {
    if (!data) return;

    if (data.water >= data.waterGoal) {
      showMessage(
        'Hydration Goal',
        'You already reached your water goal today! 💧'
      );
      return;
    }

    await updateData({
      water: data.water + 1,
    });
  };

  const addActivity = async () => {
    if (!data) return;

    await updateData({
      activeMinutes: data.activeMinutes + 10,
      calories:
        data.calories + 40,
    });
  };

  const saveManualSteps = async () => {
    if (!data) return;

    const steps = Number(manualSteps);

    if (!Number.isFinite(steps) || steps < 0) {
      showMessage(
        'Invalid Steps',
        'Please enter a valid step count.'
      );
      return;
    }

    await updateData({
      steps,
      calories: Math.round(
        steps * CALORIES_PER_STEP
      ),
    });

    setManualSteps('');

    showMessage(
      'Steps Updated',
      `${steps.toLocaleString()} steps saved successfully! 🚶`
    );
  };

  const showMessage = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const stepProgress = useMemo(() => {
    if (!data) return 0;

    return Math.min(
      100,
      Math.round(
        (data.steps / STEP_GOAL) * 100
      )
    );
  }, [data]);

  const waterProgress = useMemo(() => {
    if (!data) return 0;

    return Math.min(
      100,
      Math.round(
        (data.water / data.waterGoal) * 100
      )
    );
  }, [data]);

  const sleepProgress = useMemo(() => {
    if (!data) return 0;

    return Math.min(
      100,
      Math.round(
        (data.sleepHours / data.sleepGoal) * 100
      )
    );
  }, [data]);

  const wellnessScore = useMemo(() => {
    if (!data) return 0;

    const stepsScore = Math.min(
      100,
      (data.steps / STEP_GOAL) * 100
    );

    const waterScore = Math.min(
      100,
      (data.water / data.waterGoal) * 100
    );

    const sleepScore = Math.min(
      100,
      (data.sleepHours / data.sleepGoal) * 100
    );

    const activityScore = Math.min(
      100,
      (data.activeMinutes / 60) * 100
    );

    return Math.round(
      stepsScore * 0.35 +
        waterScore * 0.20 +
        sleepScore * 0.25 +
        activityScore * 0.20
    );
  }, [data]);

  if (!data) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading wellness...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            maxWidth: isDesktop ? 1200 : undefined,
          },
        ]}
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
              Wellness
            </Text>

            <Text style={styles.subtitle}>
              Take care of your body while
              conquering your goals.
            </Text>
          </View>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>
              {wellnessScore}%
            </Text>
            <Text style={styles.scoreLabel}>
              Wellness
            </Text>
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="heart"
              size={28}
              color="#ffffff"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              Today's Wellness
            </Text>

            <Text style={styles.heroText}>
              Small healthy habits create big
              results. Keep going! 💪
            </Text>
          </View>
        </View>

        {/* STATS */}

        <View
          style={[
            styles.statsGrid,
            isDesktop && styles.desktopGrid,
          ]}
        >
          <StatCard
            icon="walk"
            title="Steps"
            value={data.steps.toLocaleString()}
            subtitle={`Goal ${STEP_GOAL.toLocaleString()}`}
            progress={stepProgress}
          />

          <StatCard
            icon="flame"
            title="Calories"
            value={`${Math.round(data.calories)} kcal`}
            subtitle="Estimated burn"
            progress={Math.min(
              100,
              Math.round(
                (data.calories / 400) * 100
              )
            )}
          />

          <StatCard
            icon="water"
            title="Water"
            value={`${data.water}/${data.waterGoal}`}
            subtitle="Glasses today"
            progress={waterProgress}
          />

          <StatCard
            icon="moon"
            title="Sleep"
            value={`${data.sleepHours} hrs`}
            subtitle={`Goal ${data.sleepGoal} hrs`}
            progress={sleepProgress}
          />
        </View>

        {/* STEPS */}

        <SectionTitle
          icon="footsteps"
          title="Step Tracker"
          subtitle="Track your daily movement"
        />

        <View style={styles.card}>
          <View style={styles.bigRow}>
            <View style={styles.roundIcon}>
              <Ionicons
                name="walk"
                size={30}
                color="#126EED"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bigNumber}>
                {data.steps.toLocaleString()}
              </Text>

              <Text style={styles.muted}>
                of {STEP_GOAL.toLocaleString()} steps
              </Text>
            </View>

            <Text style={styles.percent}>
              {stepProgress}%
            </Text>
          </View>

          <ProgressBar progress={stepProgress} />

          <Text style={styles.tip}>
            {stepProgress >= 100
              ? '🎉 Step goal completed!'
              : `${(
                  STEP_GOAL - data.steps
                ).toLocaleString()} steps remaining today`}
          </Text>

          <View style={styles.manualRow}>
            <TextInput
              value={manualSteps}
              onChangeText={setManualSteps}
              placeholder="Enter steps manually"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.smallButton}
              onPress={saveManualSteps}
            >
              <Text style={styles.smallButtonText}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {Platform.OS !== 'web' && (
            <Text style={styles.sensorText}>
              📱 Motion sensor tracking is available
              on supported mobile devices.
            </Text>
          )}
        </View>

        {/* WATER */}

        <SectionTitle
          icon="water"
          title="Hydration"
          subtitle="Stay hydrated throughout the day"
        />

        <View style={styles.card}>
          <View style={styles.waterTop}>
            <View>
              <Text style={styles.bigNumber}>
                {data.water}
              </Text>
              <Text style={styles.muted}>
                glasses of water
              </Text>
            </View>

            <TouchableOpacity
              style={styles.waterButton}
              onPress={addWater}
            >
              <Ionicons
                name="add"
                size={22}
                color="#ffffff"
              />
              <Text style={styles.waterButtonText}>
                Add Glass
              </Text>
            </TouchableOpacity>
          </View>

          <ProgressBar progress={waterProgress} />

          <Text style={styles.tip}>
            {waterProgress >= 100
              ? '💧 Hydration goal completed!'
              : `${data.waterGoal - data.water} glasses remaining`}
          </Text>
        </View>

        {/* ACTIVITY */}

        <SectionTitle
          icon="fitness"
          title="Activity"
          subtitle="Build an active lifestyle"
        />

        <View style={styles.activityGrid}>
          <ActivityCard
            icon="timer-outline"
            title="Active Minutes"
            value={`${data.activeMinutes} min`}
          />

          <ActivityCard
            icon="flame-outline"
            title="Burned"
            value={`${Math.round(data.calories)} kcal`}
          />

          <ActivityCard
            icon="bicycle-outline"
            title="Activity"
            value={data.activity}
          />
        </View>

        <TouchableOpacity
          style={styles.activityButton}
          onPress={addActivity}
        >
          <Ionicons
            name="add-circle"
            size={22}
            color="#ffffff"
          />

          <Text style={styles.activityButtonText}>
            Add 10 Minutes Activity
          </Text>
        </TouchableOpacity>

        {/* SLEEP */}

        <SectionTitle
          icon="moon"
          title="Sleep"
          subtitle="Rest well and perform better"
        />

        <View style={styles.card}>
          <Text style={styles.sleepValue}>
            {data.sleepHours} hours
          </Text>

          <ProgressBar progress={sleepProgress} />

          <View style={styles.sleepButtons}>
            {[6, 7, 8, 9].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.sleepButton,
                  data.sleepHours === hours &&
                    styles.sleepButtonActive,
                ]}
                onPress={() =>
                  updateData({
                    sleepHours: hours,
                  })
                }
              >
                <Text
                  style={[
                    styles.sleepButtonText,
                    data.sleepHours === hours &&
                      styles.sleepButtonTextActive,
                  ]}
                >
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ACHIEVEMENT */}

        <View style={styles.achievementCard}>
          <Text style={styles.achievementEmoji}>
            🏆
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.achievementTitle}>
              Keep Your Streak Alive
            </Text>

            <Text style={styles.achievementText}>
              Consistency is more powerful than
              perfection. Keep moving every day!
            </Text>
          </View>

          <Text style={styles.streak}>
            🔥 {data.streak}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  progress,
}: {
  icon: any;
  title: string;
  value: string;
  subtitle: string;
  progress: number;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={22}
          color="#126EED"
        />
      </View>

      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statSubtitle}>
        {subtitle}
      </Text>

      <ProgressBar progress={progress} />
    </View>
  );
}

function ActivityCard({
  icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.activityCard}>
      <Ionicons
        name={icon}
        size={24}
        color="#126EED"
      />

      <Text style={styles.activityTitle}>
        {title}
      </Text>

      <Text style={styles.activityValue}>
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#126EED"
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function ProgressBar({
  progress,
}: {
  progress: number;
}) {
  return (
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 50,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '700',
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

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#126EED',
    letterSpacing: 1.5,
  },

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    color: '#6B7280',
    fontSize: 14,
  },

  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#126EED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },

  scoreLabel: {
    color: '#DCEAFF',
    fontSize: 9,
    fontWeight: '700',
  },

  heroCard: {
    flexDirection: 'row',
    gap: 15,
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#126EED',
    marginBottom: 20,
    alignItems: 'center',
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },

  heroText: {
    color: '#DCEAFF',
    marginTop: 5,
    lineHeight: 20,
  },

  statsGrid: {
    gap: 14,
    marginBottom: 24,
  },

  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flex: 1,
    minWidth: 220,
    elevation: 2,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statTitle: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },

  statValue: {
    color: '#111827',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 4,
  },

  statSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    marginTop: 6,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    elevation: 2,
  },

  bigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  roundIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
  },

  muted: {
    color: '#6B7280',
    fontSize: 13,
  },

  percent: {
    color: '#126EED',
    fontSize: 20,
    fontWeight: '900',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 10,
  },

  tip: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },

  manualRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },

  smallButton: {
    backgroundColor: '#126EED',
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
  },

  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  sensorText: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
  },

  waterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  waterButton: {
    backgroundColor: '#126EED',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  waterButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flex: 1,
    minWidth: 150,
  },

  activityTitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 9,
  },

  activityValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },

  activityButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },

  activityButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  sleepValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },

  sleepButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  sleepButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },

  sleepButtonActive: {
    backgroundColor: '#126EED',
  },

  sleepButtonText: {
    fontWeight: '800',
    color: '#374151',
  },

  sleepButtonTextActive: {
    color: '#FFFFFF',
  },

  achievementCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  achievementEmoji: {
    fontSize: 35,
  },

  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  achievementText: {
    color: '#CBD5E1',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },

  streak: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});