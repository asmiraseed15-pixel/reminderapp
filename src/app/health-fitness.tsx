import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

const STORAGE_KEY = 'smart_health_fitness';

const STEP_GOAL = 10000;
const WATER_GOAL = 2500;
const DEFAULT_WEIGHT = 60;

type HealthData = {
  steps: number;
  water: number;
  calories: number;
  weight: number;
  date: string;
};

const getTodayKey = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const calculateCalories = (
  steps: number,
  weight: number,
) => {
  /*
    Approximate walking calories.

    This is an estimate, not a medical measurement.
    Formula:
    calories ≈ steps × distance per step × calories per kg/km
  */

  const averageStepLength = 0.0007; // km
  const distance = steps * averageStepLength;

  const calories = distance * weight * 0.5;

  return Math.round(calories);
};

export default function HealthFitness() {
  const router = useRouter();

  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isSmallScreen = width < 700;

  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);

  const [isPedometerAvailable, setIsPedometerAvailable] =
    useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);

  const calories = useMemo(() => {
    return calculateCalories(steps, weight);
  }, [steps, weight]);

  const stepProgress = Math.min(
    (steps / STEP_GOAL) * 100,
    100,
  );

  const waterProgress = Math.min(
    (water / WATER_GOAL) * 100,
    100,
  );

  /*
   * Load saved data
   */
  useEffect(() => {
    loadHealthData();
  }, []);

  /*
   * Save data whenever values change
   */
  useEffect(() => {
    if (!loading) {
      saveHealthData();
    }
  }, [steps, water, weight, loading]);

  /*
   * Start live pedometer
   */
  useEffect(() => {
    let subscription: any = null;

    const startPedometer = async () => {
      try {
        if (Platform.OS === 'web') {
          setIsPedometerAvailable(false);
          return;
        }

        const available = await Pedometer.isAvailableAsync();

        setIsPedometerAvailable(available);

        if (!available) {
          return;
        }

        const permission =
          await Pedometer.requestPermissionsAsync();

        if (!permission.granted) {
          setIsPedometerAvailable(false);
          return;
        }

        subscription = Pedometer.watchStepCount(
          (result) => {
            setSteps((currentSteps) => {
              /*
               * The callback returns steps detected during
               * the current subscription period.
               *
               * We keep the larger value so the counter
               * doesn't accidentally decrease.
               */
              return Math.max(currentSteps, result.steps);
            });
          },
        );
      } catch (error) {
        console.log(
          'Pedometer error:',
          error,
        );

        setIsPedometerAvailable(false);
      }
    };

    startPedometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const loadHealthData = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setLoading(false);
        return;
      }

      const data: HealthData = JSON.parse(saved);

      /*
       * Automatically start a new day.
       */
      if (data.date !== getTodayKey()) {
        const newData: HealthData = {
          steps: 0,
          water: 0,
          calories: 0,
          weight: data.weight || DEFAULT_WEIGHT,
          date: getTodayKey(),
        };

        setSteps(0);
        setWater(0);
        setWeight(
          data.weight || DEFAULT_WEIGHT,
        );

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newData),
        );
      } else {
        setSteps(data.steps || 0);
        setWater(data.water || 0);
        setWeight(
          data.weight || DEFAULT_WEIGHT,
        );
      }
    } catch (error) {
      console.log(
        'Health data load error:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const saveHealthData = async () => {
    try {
      const data: HealthData = {
        steps,
        water,
        calories,
        weight,
        date: getTodayKey(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      );
    } catch (error) {
      console.log(
        'Health data save error:',
        error,
      );
    }
  };

  const addWater = () => {
    setWater((current) =>
      Math.min(current + 250, 10000),
    );
  };

  const removeWater = () => {
    setWater((current) =>
      Math.max(current - 250, 0),
    );
  };

  const resetToday = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        window.confirm(
          'Reset all health data for today?',
        );

      if (!confirmed) return;

      setSteps(0);
      setWater(0);

      return;
    }

    Alert.alert(
      'Reset Today',
      'Are you sure you want to reset today\'s health data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSteps(0);
            setWater(0);
          },
        },
      ],
    );
  };

  const formatNumber = (
    number: number,
  ) => {
    return number.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isSmallScreen &&
            styles.mobileContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              SMART LIFE
            </Text>

            <Text style={styles.title}>
              Health & Fitness
            </Text>

            <Text style={styles.subtitle}>
              Track your daily movement,
              hydration and wellness.
            </Text>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace(
                  '/about' as any,
                );
              }
            }}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </Pressable>
        </View>

        {/* MAIN HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroSmall}>
                TODAY'S ACTIVITY
              </Text>

              <Text style={styles.heroTitle}>
                Keep moving. Keep growing.
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                LIVE
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.heroStats,
              isSmallScreen &&
                styles.heroStatsMobile,
            ]}
          >
            <View style={styles.heroStat}>
              <Text style={styles.heroEmoji}>
                🚶
              </Text>

              <Text style={styles.heroValue}>
                {formatNumber(steps)}
              </Text>

              <Text style={styles.heroLabel}>
                Steps
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroEmoji}>
                🔥
              </Text>

              <Text style={styles.heroValue}>
                {calories}
              </Text>

              <Text style={styles.heroLabel}>
                kcal
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroEmoji}>
                💧
              </Text>

              <Text style={styles.heroValue}>
                {water}
              </Text>

              <Text style={styles.heroLabel}>
                ml
              </Text>
            </View>
          </View>
        </View>

        {/* PEDOMETER STATUS */}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusEmoji}>
              {isPedometerAvailable
                ? '📱'
                : 'ℹ️'}
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {isPedometerAvailable
                ? 'Live Step Tracking Active'
                : isWeb
                ? 'Step sensor unavailable on Web'
                : 'Step sensor unavailable'}
            </Text>

            <Text style={styles.statusText}>
              {isPedometerAvailable
                ? 'Your device is detecting movement and updating your steps.'
                : isWeb
                ? 'Open this app on your physical phone using Expo Go for live step tracking.'
                : 'Your device does not currently provide a usable pedometer sensor.'}
            </Text>
          </View>
        </View>

        {/* STEP CARD */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                🚶 Steps Counter
              </Text>

              <Text style={styles.cardSubtitle}>
                Daily target: {formatNumber(
                  STEP_GOAL,
                )} steps
              </Text>
            </View>

            <Text style={styles.percentage}>
              {Math.round(stepProgress)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stepProgress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.progressText}>
              {formatNumber(steps)} steps
            </Text>

            <Text style={styles.progressText}>
              {formatNumber(
                Math.max(
                  STEP_GOAL - steps,
                  0,
                ),
              )}{' '}
              left
            </Text>
          </View>

          {steps >= STEP_GOAL && (
            <View style={styles.goalMessage}>
              <Text style={styles.goalMessageText}>
                🎉 Daily step goal completed!
              </Text>
            </View>
          )}
        </View>

        {/* CALORIES */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                🔥 Calories Burned
              </Text>

              <Text style={styles.cardSubtitle}>
                Estimated from your movement
              </Text>
            </View>

            <Text style={styles.calorieValue}>
              {calories} kcal
            </Text>
          </View>

          <View style={styles.calorieBox}>
            <View>
              <Text style={styles.calorieNumber}>
                {calories}
              </Text>

              <Text style={styles.calorieUnit}>
                calories burned
              </Text>
            </View>

            <View style={styles.fireCircle}>
              <Text style={styles.fireEmoji}>
                🔥
              </Text>
            </View>
          </View>

          <Text style={styles.infoText}>
            Calories are an approximate estimate
            based on your steps and body weight.
          </Text>
        </View>

        {/* WATER */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                💧 Water Intake
              </Text>

              <Text style={styles.cardSubtitle}>
                Daily target: {WATER_GOAL} ml
              </Text>
            </View>

            <Text style={styles.percentage}>
              {Math.round(waterProgress)}%
            </Text>
          </View>

          <View style={styles.waterMain}>
            <View style={styles.waterCircle}>
              <Text style={styles.waterEmoji}>
                💧
              </Text>

              <Text style={styles.waterAmount}>
                {water}
              </Text>

              <Text style={styles.waterUnit}>
                ml
              </Text>
            </View>

            <View style={styles.waterControls}>
              <Text style={styles.waterLabel}>
                Add a glass
              </Text>

              <View style={styles.waterButtons}>
                <Pressable
                  style={styles.minusButton}
                  onPress={removeWater}
                >
                  <Text
                    style={styles.minusText}
                  >
                    −
                  </Text>
                </Pressable>

                <View style={styles.glassInfo}>
                  <Text
                    style={styles.glassValue}
                  >
                    250 ml
                  </Text>

                  <Text
                    style={styles.glassText}
                  >
                    1 glass
                  </Text>
                </View>

                <Pressable
                  style={styles.plusButton}
                  onPress={addWater}
                >
                  <Text
                    style={styles.plusText}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.waterProgress,
                {
                  width: `${waterProgress}%`,
                },
              ]}
            />
          </View>

          {water >= WATER_GOAL && (
            <View style={styles.goalMessage}>
              <Text style={styles.goalMessageText}>
                💧 Daily hydration goal completed!
              </Text>
            </View>
          )}
        </View>

        {/* DAILY SUMMARY */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📊 Today's Summary
          </Text>

          <View
            style={[
              styles.summaryGrid,
              isSmallScreen &&
                styles.summaryGridMobile,
            ]}
          >
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>
                🚶
              </Text>

              <Text style={styles.summaryValue}>
                {formatNumber(steps)}
              </Text>

              <Text style={styles.summaryLabel}>
                Steps
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>
                🔥
              </Text>

              <Text style={styles.summaryValue}>
                {calories}
              </Text>

              <Text style={styles.summaryLabel}>
                Calories
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>
                💧
              </Text>

              <Text style={styles.summaryValue}>
                {water}
              </Text>

              <Text style={styles.summaryLabel}>
                Water ml
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>
                🎯
              </Text>

              <Text style={styles.summaryValue}>
                {Math.round(
                  (stepProgress +
                    waterProgress) /
                    2,
                )}
                %
              </Text>

              <Text style={styles.summaryLabel}>
                Daily Progress
              </Text>
            </View>
          </View>
        </View>

        {/* HEALTH TIPS */}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            ✨ Smart Health Tip
          </Text>

          <Text style={styles.tipText}>
            Small consistent actions make a big
            difference. Walk regularly, stay
            hydrated and keep moving throughout
            your day.
          </Text>
        </View>

        {/* RESET */}

        <Pressable
          style={styles.resetButton}
          onPress={resetToday}
        >
          <Text style={styles.resetText}>
            ↻ Reset Today's Health Data
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          Smart Life • Health & Fitness
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 60,
  },

  mobileContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#126EED',
    letterSpacing: 2,
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 7,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 600,
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },

  backText: {
    color: '#344054',
    fontWeight: '800',
  },

  heroCard: {
    backgroundColor: '#126EED',
    borderRadius: 28,
    padding: 28,
    marginBottom: 18,
    shadowColor: '#126EED',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroSmall: {
    color: '#CFE2FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 5,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },

  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },

  heroStatsMobile: {
    justifyContent: 'space-between',
  },

  heroStat: {
    flex: 1,
    alignItems: 'center',
  },

  heroEmoji: {
    fontSize: 26,
    marginBottom: 7,
  },

  heroValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },

  heroLabel: {
    color: '#D8E7FF',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
  },

  heroDivider: {
    width: 1,
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  statusEmoji: {
    fontSize: 22,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#101828',
  },

  statusText: {
    marginTop: 4,
    color: '#667085',
    lineHeight: 19,
    fontSize: 13,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 23,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardTitle: {
    color: '#101828',
    fontSize: 19,
    fontWeight: '900',
  },

  cardSubtitle: {
    color: '#667085',
    fontSize: 13,
    marginTop: 4,
  },

  percentage: {
    color: '#126EED',
    fontSize: 18,
    fontWeight: '900',
  },

  progressTrack: {
    height: 12,
    borderRadius: 20,
    backgroundColor: '#E9EEF5',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#126EED',
  },

  waterProgress: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#06B6D4',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  progressText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },

  goalMessage: {
    backgroundColor: '#ECFDF3',
    borderRadius: 12,
    padding: 10,
    marginTop: 15,
  },

  goalMessageText: {
    color: '#027A48',
    fontWeight: '800',
    textAlign: 'center',
  },

  calorieValue: {
    color: '#F04438',
    fontSize: 17,
    fontWeight: '900',
  },

  calorieBox: {
    backgroundColor: '#FFF6ED',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  calorieNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F04438',
  },

  calorieUnit: {
    color: '#8A2C0B',
    fontWeight: '700',
    marginTop: 2,
  },

  fireCircle: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fireEmoji: {
    fontSize: 31,
  },

  infoText: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  waterMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  waterCircle: {
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: '#EFFCFF',
    borderWidth: 8,
    borderColor: '#CFFAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },

  waterEmoji: {
    fontSize: 23,
  },

  waterAmount: {
    color: '#0891B2',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },

  waterUnit: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },

  waterControls: {
    flex: 1,
  },

  waterLabel: {
    color: '#344054',
    fontWeight: '800',
    marginBottom: 10,
  },

  waterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  minusButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  minusText: {
    fontSize: 25,
    color: '#344054',
    fontWeight: '600',
  },

  plusButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  plusText: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  glassInfo: {
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  glassValue: {
    color: '#101828',
    fontWeight: '900',
    fontSize: 14,
  },

  glassText: {
    color: '#667085',
    fontSize: 11,
    marginTop: 2,
  },

  summaryGrid: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  summaryGridMobile: {
    flexWrap: 'wrap',
  },

  summaryItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 17,
    alignItems: 'center',
  },

  summaryEmoji: {
    fontSize: 23,
    marginBottom: 7,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#101828',
  },

  summaryLabel: {
    color: '#667085',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '700',
    textAlign: 'center',
  },

  tipCard: {
    backgroundColor: '#101828',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },

  tipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  tipText: {
    color: '#D0D5DD',
    lineHeight: 21,
    fontSize: 13,
    marginTop: 9,
  },

  resetButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F04438',
  },

  resetText: {
    color: '#D92D20',
    fontWeight: '800',
  },

  footerText: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 24,
  },
});