import React, { useEffect, useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  SavingGoal,
  formatMoney,
  getSavingsGoals,
  saveSavingsGoals,
} from '../utils/financeStorage';

export default function SavingsGoals() {
  const router = useRouter();

  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  // ==============================
  // LOAD SAVINGS GOALS
  // ==============================
  const load = async () => {
    try {
      const savedGoals = await getSavingsGoals();
      setGoals(savedGoals);
    } catch (error) {
      console.log('Failed to load savings goals:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ==============================
  // BACK BUTTON
  // ==============================
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/finance');
    }
  };

  // ==============================
  // CREATE GOAL
  // ==============================
  const createGoal = async () => {
    const targetAmount = Number(target);

    if (!title.trim()) {
      Alert.alert(
        'Missing Goal',
        'Please enter a goal name.',
      );
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid target amount.',
      );
      return;
    }

    const goal: SavingGoal = {
      id: Date.now().toString(),
      title: title.trim(),
      targetAmount,
      savedAmount: 0,
      targetDate: '',
      createdAt: new Date().toISOString(),
    };

    const updated = [goal, ...goals];

    try {
      await saveSavingsGoals(updated);

      setGoals(updated);
      setTitle('');
      setTarget('');

      Alert.alert(
        '🎯 Goal Created',
        'Your savings goal is ready.',
      );
    } catch (error) {
      console.log('Create goal error:', error);

      Alert.alert(
        'Error',
        'Unable to create the savings goal.',
      );
    }
  };

  // ==============================
  // ADD MONEY
  // ==============================
  const addMoney = async (goal: SavingGoal) => {
    if (goal.savedAmount >= goal.targetAmount) {
      Alert.alert(
        '🎉 Goal Completed',
        'You already reached this goal.',
      );
      return;
    }

    // WEB
    if (Platform.OS === 'web') {
      const value = window.prompt(
        `Enter amount to save for "${goal.title}":`,
      );

      if (value === null) {
        return;
      }

      const amount = Number(value);

      if (!amount || amount <= 0) {
        window.alert('Please enter a valid amount.');
        return;
      }

      const updated = goals.map(item => {
        if (item.id !== goal.id) {
          return item;
        }

        return {
          ...item,
          savedAmount: Math.min(
            item.savedAmount + amount,
            item.targetAmount,
          ),
        };
      });

      try {
        await saveSavingsGoals(updated);
        setGoals(updated);
      } catch (error) {
        console.log('Add money error:', error);
      }

      return;
    }

    // MOBILE
    Alert.alert(
      '💰 Add Money',
      'Amount entry on mobile can be added with a dedicated amount modal.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
    );
  };

  // ==============================
  // DELETE GOAL
  // ==============================
  const deleteGoal = async (id: string) => {
    const action = async () => {
      const updated = goals.filter(
        item => item.id !== id,
      );

      try {
        await saveSavingsGoals(updated);
        setGoals(updated);
      } catch (error) {
        console.log('Delete goal error:', error);
      }
    };

    // WEB
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Delete this savings goal?',
      );

      if (confirmed) {
        await action();
      }

      return;
    }

    // MOBILE
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this savings goal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: action,
        },
      ],
    );
  };

  // ==============================
  // UI
  // ==============================
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            android_ripple={{
              color: '#E4E7EC',
              borderless: true,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#101828"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FINANCIAL GROWTH
            </Text>

            <Text style={styles.title}>
              Savings Goals
            </Text>

            <Text style={styles.subtitle}>
              Build your future, one goal at a time.
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CREATE GOAL ================= */}

        <View style={styles.form}>
          <View style={styles.formIconBox}>
            <Text style={styles.formIcon}>🎯</Text>
          </View>

          <Text style={styles.formTitle}>
            Create a Savings Goal
          </Text>

          <Text style={styles.formSubtitle}>
            Set a target and track your progress.
          </Text>

          <Text style={styles.label}>
            Goal Name
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Example: New Laptop"
            placeholderTextColor="#98A2B3"
            style={styles.input}
          />

          <Text style={styles.label}>
            Target Amount
          </Text>

          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="₹ 50,000"
            placeholderTextColor="#98A2B3"
            keyboardType="numeric"
            style={styles.input}
          />

          <Pressable
            style={styles.create}
            onPress={createGoal}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.createText}>
              Create Goal
            </Text>
          </Pressable>
        </View>

        {/* ================= GOALS TITLE ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.section}>
              Your Goals
            </Text>

            <Text style={styles.sectionSubtitle}>
              {goals.length === 0
                ? 'Start your first financial goal'
                : `${goals.length} goal${
                    goals.length > 1 ? 's' : ''
                  } in progress`}
            </Text>
          </View>

          {goals.length > 0 && (
            <View style={styles.goalCount}>
              <Text style={styles.goalCountText}>
                {goals.length}
              </Text>
            </View>
          )}
        </View>

        {/* ================= EMPTY ================= */}

        {goals.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>
                🎯
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No savings goals
            </Text>

            <Text style={styles.emptyText}>
              Create your first financial goal and
              start building your future.
            </Text>
          </View>
        ) : (
          /* ================= GOALS ================= */

          goals.map(goal => {
            const percentage =
              goal.targetAmount > 0
                ? Math.min(
                    (goal.savedAmount /
                      goal.targetAmount) *
                      100,
                    100,
                  )
                : 0;

            const remaining = Math.max(
              goal.targetAmount -
                goal.savedAmount,
              0,
            );

            const isCompleted =
              percentage >= 100;

            return (
              <View
                key={goal.id}
                style={styles.goal}
              >
                {/* Goal Header */}

                <View style={styles.goalHeader}>
                  <View
                    style={styles.goalInfo}
                  >
                    <View
                      style={styles.goalIcon}
                    >
                      <Ionicons
                        name={
                          isCompleted
                            ? 'checkmark-circle'
                            : 'flag'
                        }
                        size={20}
                        color={
                          isCompleted
                            ? '#039855'
                            : '#126EED'
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.goalTextContainer
                      }
                    >
                      <Text
                        style={
                          styles.goalTitle
                        }
                        numberOfLines={2}
                      >
                        {goal.title}
                      </Text>

                      <Text
                        style={
                          styles.goalTarget
                        }
                      >
                        Target:{' '}
                        {formatMoney(
                          goal.targetAmount,
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.percentBox
                    }
                  >
                    <Text
                      style={
                        styles.percent
                      }
                    >
                      {Math.round(
                        percentage,
                      )}
                      %
                    </Text>
                  </View>
                </View>

                {/* Progress */}

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

                {/* Numbers */}

                <View
                  style={
                    styles.goalNumbers
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.numberLabel
                      }
                    >
                      SAVED
                    </Text>

                    <Text
                      style={styles.saved}
                    >
                      {formatMoney(
                        goal.savedAmount,
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.remainingContainer
                    }
                  >
                    <Text
                      style={
                        styles.numberLabel
                      }
                    >
                      REMAINING
                    </Text>

                    <Text
                      style={
                        styles.remaining
                      }
                    >
                      {formatMoney(
                        remaining,
                      )}
                    </Text>
                  </View>
                </View>

                {/* Actions */}

                <View
                  style={styles.actions}
                >
                  <Pressable
                    style={[
                      styles.addMoney,
                      isCompleted &&
                        styles.disabledButton,
                    ]}
                    disabled={isCompleted}
                    onPress={() =>
                      addMoney(goal)
                    }
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={
                        isCompleted
                          ? '#98A2B3'
                          : '#126EED'
                      }
                    />

                    <Text
                      style={[
                        styles.addMoneyText,
                        isCompleted &&
                          styles.disabledText,
                      ]}
                    >
                      Add Money
                    </Text>
                  </Pressable>

                  <Pressable
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteGoal(goal.id)
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#D92D20"
                    />

                    <Text
                      style={styles.delete}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>

                {/* Completed */}

                {isCompleted && (
                  <View
                    style={
                      styles.completed
                    }
                  >
                    <Ionicons
                      name="trophy-outline"
                      size={20}
                      color="#027A48"
                    />

                    <Text
                      style={
                        styles.completedText
                      }
                    >
                      🎉 Savings goal
                      completed!
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 70,
  },

  // ================= HEADER =================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  headerText: {
    flex: 1,
  },

  headerSpacer: {
    width: 10,
  },

  eyebrow: {
    color: '#126EED',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },

  subtitle: {
    color: '#667085',
    fontSize: 13,
    marginTop: 5,
  },

  // ================= FORM =================

  form: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  formIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  formIcon: {
    fontSize: 25,
  },

  formTitle: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '900',
  },

  formSubtitle: {
    color: '#667085',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },

  label: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 13,
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 13,
    paddingHorizontal: 14,
    color: '#101828',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },

  create: {
    backgroundColor: '#126EED',
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },

  createText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },

  // ================= SECTION =================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  section: {
    color: '#101828',
    fontSize: 21,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#667085',
    fontSize: 12,
    marginTop: 3,
  },

  goalCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalCountText: {
    color: '#126EED',
    fontWeight: '900',
  },

  // ================= EMPTY =================

  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    color: '#101828',
    fontWeight: '900',
    fontSize: 18,
    marginTop: 13,
  },

  emptyText: {
    color: '#667085',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ================= GOAL =================

  goal: {
    backgroundColor: '#FFFFFF',
    padding: 21,
    borderRadius: 21,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EAECF0',
    elevation: 2,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },

  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  goalInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingRight: 12,
  },

  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  goalTextContainer: {
    flex: 1,
  },

  goalTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '900',
  },

  goalTarget: {
    color: '#667085',
    fontSize: 12,
    marginTop: 5,
  },

  percentBox: {
    minWidth: 55,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percent: {
    color: '#126EED',
    fontSize: 17,
    fontWeight: '900',
  },

  // ================= PROGRESS =================

  track: {
    height: 11,
    backgroundColor: '#EAECF0',
    borderRadius: 20,
    marginTop: 17,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: '#126EED',
    borderRadius: 20,
  },

  // ================= NUMBERS =================

  goalNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  numberLabel: {
    color: '#98A2B3',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  saved: {
    color: '#039855',
    fontSize: 13,
    fontWeight: '900',
  },

  remainingContainer: {
    alignItems: 'flex-end',
  },

  remaining: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
  },

  // ================= ACTIONS =================

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
  },

  addMoney: {
    backgroundColor: '#EEF5FF',
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  addMoneyText: {
    color: '#126EED',
    fontWeight: '900',
  },

  disabledButton: {
    backgroundColor: '#F2F4F7',
  },

  disabledText: {
    color: '#98A2B3',
  },

  deleteButton: {
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  delete: {
    color: '#D92D20',
    fontWeight: '800',
  },

  // ================= COMPLETED =================

  completed: {
    backgroundColor: '#ECFDF3',
    borderRadius: 12,
    padding: 11,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  completedText: {
    color: '#027A48',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 13,
  },
});