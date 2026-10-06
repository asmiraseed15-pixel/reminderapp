import React, { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

const DAILY_GOAL = 10000;

// These are approximate estimates.
const CALORIES_PER_STEP = 0.04;
const METERS_PER_STEP = 0.75;

// Storage key for body measurements
const BODY_METRICS_KEY = 'user_body_metrics';

type BodyMetrics = {
  weight: number;
  heightCm: number;
};

export default function StepsScreen() {
  const router = useRouter();

  // -----------------------------
  // STEP TRACKING
  // -----------------------------

  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // -----------------------------
  // BODY METRICS
  // -----------------------------

  const [weight, setWeight] = useState(60);
  const [heightCm, setHeightCm] = useState(165);

  const [weightInput, setWeightInput] = useState('60');
  const [heightInput, setHeightInput] = useState('165');

  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [savingMetrics, setSavingMetrics] = useState(false);

  // -----------------------------
  // LOAD BODY METRICS
  // -----------------------------

  useEffect(() => {
    const loadBodyMetrics = async () => {
      try {
        const saved = await AsyncStorage.getItem(BODY_METRICS_KEY);

        if (saved) {
          const parsed: BodyMetrics = JSON.parse(saved);

          if (
            typeof parsed.weight === 'number' &&
            typeof parsed.heightCm === 'number'
          ) {
            setWeight(parsed.weight);
            setHeightCm(parsed.heightCm);

            setWeightInput(String(parsed.weight));
            setHeightInput(String(parsed.heightCm));
          }
        }
      } catch (error) {
        console.log('Unable to load body metrics:', error);
      }
    };

    loadBodyMetrics();
  }, []);

  // -----------------------------
  // PEDOMETER
  // -----------------------------

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;

    const setupPedometer = async () => {
      try {
        setLoading(true);

        const available = await Pedometer.isAvailableAsync();

        setIsAvailable(available);

        if (!available) {
          setLoading(false);
          return;
        }

        const permission =
          await Pedometer.requestPermissionsAsync();

        if (!permission.granted) {
          setHasPermission(false);
          setLoading(false);

          Alert.alert(
            'Permission Required',
            'Please allow physical activity permission to count your steps.'
          );

          return;
        }

        setHasPermission(true);

        // Today's date
        const today = new Date();

        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const endOfToday = new Date();

        const result = await Pedometer.getStepCountAsync(
          startOfDay,
          endOfToday
        );

        if (result) {
          setSteps(result.steps);
        }

        // Live updates
        subscription = Pedometer.watchStepCount((result) => {
          setSteps((currentSteps) => {
            return currentSteps + result.steps;
          });

          setIsLive(true);
        });
      } catch (error) {
        console.log('Pedometer error:', error);

        Alert.alert(
          'Steps Error',
          'Unable to access the step counter on this device.'
        );
      } finally {
        setLoading(false);
      }
    };

    setupPedometer();

    return () => {
      subscription?.remove();
    };
  }, []);

  // -----------------------------
  // CALCULATIONS
  // -----------------------------

  const heightMeters = heightCm / 100;

  const bmi = useMemo(() => {
    if (heightMeters <= 0 || weight <= 0) {
      return 0;
    }

    return weight / (heightMeters * heightMeters);
  }, [weight, heightMeters]);

  const bmiValue = bmi.toFixed(1);

  const bmiStatus = useMemo(() => {
    if (bmi <= 0) {
      return 'Not available';
    }

    if (bmi < 18.5) {
      return 'Underweight';
    }

    if (bmi < 25) {
      return 'Normal';
    }

    if (bmi < 30) {
      return 'Overweight';
    }

    return 'Obesity';
  }, [bmi]);

  const bmiIcon = useMemo(() => {
    if (bmi < 18.5) {
      return 'arrow-down-circle';
    }

    if (bmi < 25) {
      return 'checkmark-circle';
    }

    if (bmi < 30) {
      return 'alert-circle';
    }

    return 'warning';
  }, [bmi]);

  const progress = useMemo(() => {
    return Math.min(steps / DAILY_GOAL, 1);
  }, [steps]);

  const progressPercentage = Math.round(progress * 100);

  // Step-based calorie estimate
  const calories = Math.round(
    steps * CALORIES_PER_STEP
  );

  const distanceKm = (
    (steps * METERS_PER_STEP) /
    1000
  ).toFixed(2);

  const remainingSteps = Math.max(
    DAILY_GOAL - steps,
    0
  );

  const goalCompleted = steps >= DAILY_GOAL;

  // Estimated calorie target based on weight.
  // This is only a simple activity estimate.
  const estimatedDailyCalories = Math.round(
    weight * 24 + calories
  );

  // -----------------------------
  // SAVE BODY METRICS
  // -----------------------------

  const saveBodyMetrics = async () => {
    const parsedWeight = Number(
      weightInput.replace(',', '.')
    );

    const parsedHeight = Number(
      heightInput.replace(',', '.')
    );

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      parsedWeight > 500
    ) {
      Alert.alert(
        'Invalid Weight',
        'Please enter a valid weight in kilograms.'
      );
      return;
    }

    if (
      !Number.isFinite(parsedHeight) ||
      parsedHeight < 50 ||
      parsedHeight > 250
    ) {
      Alert.alert(
        'Invalid Height',
        'Please enter a valid height in centimeters.'
      );
      return;
    }

    try {
      setSavingMetrics(true);

      const newMetrics: BodyMetrics = {
        weight: parsedWeight,
        heightCm: parsedHeight,
      };

      await AsyncStorage.setItem(
        BODY_METRICS_KEY,
        JSON.stringify(newMetrics)
      );

      setWeight(parsedWeight);
      setHeightCm(parsedHeight);

      setShowMetricsModal(false);

      Alert.alert(
        'Profile Updated',
        'Your weight and height have been saved successfully.'
      );
    } catch (error) {
      console.log('Save metrics error:', error);

      Alert.alert(
        'Save Failed',
        'Unable to save your body metrics.'
      );
    } finally {
      setSavingMetrics(false);
    }
  };

  // -----------------------------
  // PERMISSION
  // -----------------------------

  const requestStepPermission = async () => {
    try {
      const permission =
        await Pedometer.requestPermissionsAsync();

      if (permission.granted) {
        setHasPermission(true);

        Alert.alert(
          'Permission Granted',
          'Step tracking is now enabled.'
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Please allow physical activity permission from your phone settings.'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================
            HEADER
        ========================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Wellness Dashboard
            </Text>

            <Text style={styles.headerSubtitle}>
              Your daily health activity
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowMetricsModal(true)}
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#126EED"
            />
          </TouchableOpacity>
        </View>

        {/* =========================
            LIVE STATUS
        ========================== */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              isLive
                ? styles.liveDot
                : styles.offlineDot,
            ]}
          />

          <View style={styles.statusTextContainer}>
            <Text style={styles.statusText}>
              {loading
                ? 'Checking step sensor...'
                : isLive
                ? 'Live step tracking'
                : 'Step tracking ready'}
            </Text>

            <Text style={styles.statusSubText}>
              {isLive
                ? 'Your movement is being tracked'
                : 'Waiting for live movement data'}
            </Text>
          </View>

          <Ionicons
            name="pulse-outline"
            size={24}
            color={isLive ? '#22C55E' : '#9CA3AF'}
          />
        </View>

        {/* =========================
            MAIN STEPS CARD
        ========================== */}

        <View style={styles.stepsCard}>
          <View style={styles.stepsCardTop}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="footsteps"
                size={42}
                color="#126EED"
              />
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />

              <Text style={styles.liveBadgeText}>
                LIVE
              </Text>
            </View>
          </View>

          <Text style={styles.smallTitle}>
            TODAY'S STEPS
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#126EED"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.stepsNumber}>
              {steps.toLocaleString()}
            </Text>
          )}

          <Text style={styles.goalText}>
            Daily goal: {DAILY_GOAL.toLocaleString()} steps
          </Text>

          {/* Progress */}

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressPercentage}>
              {progressPercentage}%
            </Text>

            <Text style={styles.remainingText}>
              {goalCompleted
                ? 'Goal completed 🎉'
                : `${remainingSteps.toLocaleString()} steps remaining`}
            </Text>
          </View>
        </View>

        {/* =========================
            ACTIVITY STATISTICS
        ========================== */}

        <Text style={styles.sectionTitle}>
          Today's Activity
        </Text>

        <View style={styles.statsRow}>
          {/* Calories */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.calorieIcon,
              ]}
            >
              <Ionicons
                name="flame"
                size={24}
                color="#F97316"
              />
            </View>

            <Text style={styles.statValue}>
              {calories}
            </Text>

            <Text style={styles.statLabel}>
              Calories Burned
            </Text>

            <Text style={styles.statUnit}>
              kcal
            </Text>
          </View>

          {/* Distance */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.distanceIcon,
              ]}
            >
              <Ionicons
                name="navigate"
                size={24}
                color="#10B981"
              />
            </View>

            <Text style={styles.statValue}>
              {distanceKm}
            </Text>

            <Text style={styles.statLabel}>
              Distance
            </Text>

            <Text style={styles.statUnit}>
              km
            </Text>
          </View>
        </View>

        {/* =========================
            BODY METRICS
        ========================== */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Body Metrics
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your personal health measurements
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setWeightInput(String(weight));
              setHeightInput(String(heightCm));
              setShowMetricsModal(true);
            }}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color="#126EED"
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weight + Height */}

        <View style={styles.metricsGrid}>
          {/* Weight */}

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                styles.weightIcon,
              ]}
            >
              <Ionicons
                name="scale-outline"
                size={23}
                color="#8B5CF6"
              />
            </View>

            <Text style={styles.metricLabel}>
              Weight
            </Text>

            <Text style={styles.metricValue}>
              {weight}
              <Text style={styles.metricUnit}>
                {' '}
                kg
              </Text>
            </Text>

            <Text style={styles.metricHint}>
              Body weight
            </Text>
          </View>

          {/* Height */}

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                styles.heightIcon,
              ]}
            >
              <Ionicons
                name="resize-outline"
                size={23}
                color="#06B6D4"
              />
            </View>

            <Text style={styles.metricLabel}>
              Height
            </Text>

            <Text style={styles.metricValue}>
              {heightCm}
              <Text style={styles.metricUnit}>
                {' '}
                cm
              </Text>
            </Text>

            <Text style={styles.metricHint}>
              {heightMeters.toFixed(2)} m
            </Text>
          </View>
        </View>

        {/* =========================
            BMI CARD
        ========================== */}

        <View style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <View style={styles.bmiTitleContainer}>
              <View style={styles.bmiIcon}>
                <Ionicons
                  name="heart-outline"
                  size={25}
                  color="#EF4444"
                />
              </View>

              <View>
                <Text style={styles.bmiTitle}>
                  Body Mass Index
                </Text>

                <Text style={styles.bmiSubtitle}>
                  BMI based on your height & weight
                </Text>
              </View>
            </View>

            <Ionicons
              name={bmiIcon as any}
              size={28}
              color={
                bmiStatus === 'Normal'
                  ? '#22C55E'
                  : '#F59E0B'
              }
            />
          </View>

          <View style={styles.bmiMain}>
            <View>
              <Text style={styles.bmiLabel}>
                YOUR BMI
              </Text>

              <Text style={styles.bmiValue}>
                {bmiValue}
              </Text>
            </View>

            <View style={styles.bmiStatusBox}>
              <Text style={styles.bmiStatusLabel}>
                STATUS
              </Text>

              <Text
                style={[
                  styles.bmiStatus,
                  bmiStatus === 'Normal'
                    ? styles.normalStatus
                    : styles.otherStatus,
                ]}
              >
                {bmiStatus}
              </Text>
            </View>
          </View>

          {/* BMI Scale */}

          <View style={styles.bmiScale}>
            <View style={styles.bmiScaleSegment} />
            <View style={styles.bmiScaleSegment} />
            <View style={styles.bmiScaleSegment} />
            <View style={styles.bmiScaleSegment} />
          </View>

          <View style={styles.bmiScaleLabels}>
            <Text style={styles.scaleText}>
              Under
            </Text>

            <Text style={styles.scaleText}>
              Normal
            </Text>

            <Text style={styles.scaleText}>
              Over
            </Text>

            <Text style={styles.scaleText}>
              Obesity
            </Text>
          </View>

          <View style={styles.bmiFormula}>
            <Ionicons
              name="calculator-outline"
              size={17}
              color="#6B7280"
            />

            <Text style={styles.formulaText}>
              BMI = weight ÷ height²
            </Text>

            <Text style={styles.formulaValue}>
              {weight} kg ÷ {heightMeters.toFixed(2)}² m
            </Text>
          </View>
        </View>

        {/* =========================
            ENERGY CARD
        ========================== */}

        <View style={styles.energyCard}>
          <View style={styles.energyIcon}>
            <Ionicons
              name="flash"
              size={25}
              color="#F97316"
            />
          </View>

          <View style={styles.energyContent}>
            <Text style={styles.energyTitle}>
              Estimated Daily Energy
            </Text>

            <Text style={styles.energySubtitle}>
              A simple estimate based on your body weight
              and today's activity
            </Text>
          </View>

          <View style={styles.energyValueBox}>
            <Text style={styles.energyValue}>
              {estimatedDailyCalories}
            </Text>

            <Text style={styles.energyUnit}>
              kcal
            </Text>
          </View>
        </View>

        {/* =========================
            DEVICE STATUS
        ========================== */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name={
                isAvailable
                  ? 'phone-portrait-outline'
                  : 'warning-outline'
              }
              size={24}
              color="#126EED"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Step Sensor
            </Text>

            <Text style={styles.infoText}>
              {isAvailable === null
                ? 'Checking device support...'
                : isAvailable
                ? hasPermission
                  ? 'Your device supports step tracking and activity permission is enabled.'
                  : 'Activity permission is required to count steps.'
                : 'Pedometer is not available on this device.'}
            </Text>
          </View>
        </View>

        {/* =========================
            PERMISSION BUTTON
        ========================== */}

        {!hasPermission && !loading && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestStepPermission}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.permissionButtonText}>
              Allow Step Tracking
            </Text>
          </TouchableOpacity>
        )}

        {/* =========================
            MOTIVATION
        ========================== */}

        <View style={styles.motivationCard}>
          <View style={styles.trophyCircle}>
            <Ionicons
              name="trophy-outline"
              size={27}
              color="#126EED"
            />
          </View>

          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>
              {goalCompleted
                ? 'Amazing work! 🏆'
                : steps > 5000
                ? 'You are doing great! 💪'
                : 'Keep moving! 🚶‍♀️'}
            </Text>

            <Text style={styles.motivationText}>
              {goalCompleted
                ? 'You reached your daily step goal. Keep maintaining your active lifestyle!'
                : 'Every step takes you closer to your daily wellness goal.'}
            </Text>
          </View>
        </View>

        {/* =========================
            DISCLAIMER
        ========================== */}

        <Text style={styles.disclaimer}>
          Steps are read from your device pedometer.
          Calories, distance and energy values are
          approximate estimates and are not medical-grade
          measurements.
        </Text>
      </ScrollView>

      {/* =========================
          BODY METRICS MODAL
      ========================== */}

      <Modal
        visible={showMetricsModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowMetricsModal(false)
        }
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  My Health Profile
                </Text>

                <Text style={styles.modalSubtitle}>
                  Update your body measurements
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() =>
                  setShowMetricsModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            {/* Weight */}

            <Text style={styles.inputLabel}>
              Weight
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="scale-outline"
                size={21}
                color="#8B5CF6"
              />

              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="Enter weight"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.inputUnit}>
                kg
              </Text>
            </View>

            {/* Height */}

            <Text style={styles.inputLabel}>
              Height
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="resize-outline"
                size={21}
                color="#06B6D4"
              />

              <TextInput
                value={heightInput}
                onChangeText={setHeightInput}
                placeholder="Enter height"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.inputUnit}>
                cm
              </Text>
            </View>

            {/* Automatic conversion */}

            <View style={styles.conversionCard}>
              <Ionicons
                name="swap-vertical-outline"
                size={20}
                color="#126EED"
              />

              <View style={styles.conversionContent}>
                <Text style={styles.conversionTitle}>
                  Height Conversion
                </Text>

                <Text style={styles.conversionText}>
                  {Number(heightInput) > 0
                    ? `${heightInput} cm = ${(
                        Number(heightInput) / 100
                      ).toFixed(2)} m`
                    : 'Enter your height in centimeters'}
                </Text>
              </View>
            </View>

            {/* Save */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveBodyMetrics}
              disabled={savingMetrics}
            >
              {savingMetrics ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Save Health Profile
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.modalDisclaimer}>
              Your measurements are stored locally on
              this device.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // STATUS

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 17,
    marginBottom: 18,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  liveDot: {
    backgroundColor: '#22C55E',
  },

  offlineDot: {
    backgroundColor: '#9CA3AF',
  },

  statusTextContainer: {
    flex: 1,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  statusSubText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // STEPS

  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  stepsCardTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  liveBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  liveBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#16A34A',
  },

  smallTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#6B7280',
  },

  stepsNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#126EED',
    marginTop: 5,
  },

  loader: {
    height: 70,
  },

  goalText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 24,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 10,
  },

  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  progressPercentage: {
    fontSize: 15,
    fontWeight: '800',
    color: '#126EED',
  },

  remainingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  // SECTIONS

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // STATS

  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  calorieIcon: {
    backgroundColor: '#FFF1E8',
  },

  distanceIcon: {
    backgroundColor: '#E8FFF5',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111827',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 2,
    textAlign: 'center',
  },

  statUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // EDIT BUTTON

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#126EED',
  },

  // METRICS

  metricsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },

  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  metricIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  weightIcon: {
    backgroundColor: '#F3E8FF',
  },

  heightIcon: {
    backgroundColor: '#E0F7FA',
  },

  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 23,
    fontWeight: '900',
    color: '#111827',
  },

  metricUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },

  metricHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // BMI

  bmiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bmiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  bmiIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  bmiTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  bmiSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },

  bmiMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },

  bmiLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#9CA3AF',
  },

  bmiValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },

  bmiStatusBox: {
    alignItems: 'flex-end',
  },

  bmiStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#9CA3AF',
  },

  bmiStatus: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },

  normalStatus: {
    color: '#16A34A',
  },

  otherStatus: {
    color: '#F59E0B',
  },

  bmiScale: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 20,
  },

  bmiScaleSegment: {
    flex: 1,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
  },

  bmiScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  scaleText: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  bmiFormula: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginTop: 16,
    gap: 7,
  },

  formulaText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },

  formulaValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // ENERGY

  energyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  energyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  energyContent: {
    flex: 1,
  },

  energyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9A3412',
  },

  energySubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: '#C2410C',
    marginTop: 3,
    paddingRight: 8,
  },

  energyValueBox: {
    alignItems: 'center',
  },

  energyValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#EA580C',
  },

  energyUnit: {
    fontSize: 10,
    color: '#C2410C',
    fontWeight: '700',
  },

  // INFO

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  // PERMISSION

  permissionButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 18,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // MOTIVATION

  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  trophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  motivationContent: {
    flex: 1,
    marginLeft: 14,
  },

  motivationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#126EED',
    marginBottom: 4,
  },

  motivationText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 16,
    paddingHorizontal: 20,
  },

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 35 : 24,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
    paddingVertical: 0,
  },

  inputUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },

  conversionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  conversionContent: {
    marginLeft: 10,
  },

  conversionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#126EED',
  },

  conversionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 3,
  },

  saveButton: {
    height: 55,
    borderRadius: 17,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  modalDisclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 12,
  },
});