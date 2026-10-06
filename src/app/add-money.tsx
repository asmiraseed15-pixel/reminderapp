import React, { useState } from 'react';

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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
  FinanceCategory,
  FinanceType,
  useFinance,
} from '../context/FinanceContext';

export default function AddMoneyScreen() {
  const router = useRouter();

  const { addTransaction } =
    useFinance();

  const [type, setType] =
    useState<FinanceType>('expense');

  const [title, setTitle] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [category, setCategory] =
    useState<FinanceCategory>('Food');

  const [note, setNote] =
    useState('');

  const categories: FinanceCategory[] = [
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Health',
    'Education',
    'Entertainment',
    'Salary',
    'UPI',
    'Other',
  ];

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/finance' as any);
    }
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = async () => {
    const numericAmount =
      Number(amount);

    if (!title.trim()) {
      showMessage(
        'Please enter a title.'
      );
      return;
    }

    if (
      !amount.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      showMessage(
        'Please enter a valid amount.'
      );
      return;
    }

    await addTransaction({
      id: `${Date.now()}-${Math.random()}`,

      title: title.trim(),

      amount: numericAmount,

      type,

      category,

      date: new Date().toISOString(),

      note: note.trim(),

      createdAt:
        new Date().toISOString(),
    });

    if (Platform.OS === 'web') {
      window.alert(
        type === 'expense'
          ? 'Expense added successfully!'
          : 'Income added successfully!'
      );

      router.replace('/finance' as any);
    } else {
      Alert.alert(
        'Success',
        type === 'expense'
          ? 'Expense added successfully!'
          : 'Income added successfully!',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                '/finance' as any
              ),
          },
        ]
      );
    }
  };

  const showMessage = (
    message: string
  ) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Finance', message);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </TouchableOpacity>

          <View>
            <Text
              style={styles.headerTitle}
            >
              Add Money
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Track your income and expenses
            </Text>
          </View>
        </View>

        {/* TYPE */}

        <View style={styles.typeCard}>
          <Text style={styles.sectionTitle}>
            Transaction Type
          </Text>

          <View
            style={styles.typeRow}
          >
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' &&
                  styles.incomeActive,
              ]}
              onPress={() =>
                setType('income')
              }
            >
              <Ionicons
                name="arrow-down-circle-outline"
                size={22}
                color={
                  type === 'income'
                    ? '#FFFFFF'
                    : '#16A34A'
                }
              />

              <Text
                style={[
                  styles.typeText,
                  type === 'income' &&
                    styles.activeTypeText,
                ]}
              >
                Add Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' &&
                  styles.expenseActive,
              ]}
              onPress={() =>
                setType('expense')
              }
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={22}
                color={
                  type === 'expense'
                    ? '#FFFFFF'
                    : '#EF4444'
                }
              />

              <Text
                style={[
                  styles.typeText,
                  type === 'expense' &&
                    styles.activeTypeText,
                ]}
              >
                Add Expense
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM */}

        <View style={styles.card}>
          <Text style={styles.label}>
            {type === 'expense'
              ? 'Expense Name'
              : 'Income Name'}
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === 'expense'
                ? 'Example: Grocery shopping'
                : 'Example: Monthly salary'
            }
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>
            Amount
          </Text>

          <View
            style={styles.amountBox}
          >
            <Text
              style={styles.currency}
            >
              ₹
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.amountInput}
            />
          </View>

          <Text style={styles.label}>
            Category
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categoryScroll
            }
          >
            {categories.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryButton,
                    category === item &&
                      styles.categoryActive,
                  ]}
                  onPress={() =>
                    setCategory(item)
                  }
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item &&
                        styles.categoryActiveText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <Text style={styles.label}>
            Note
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional note..."
            placeholderTextColor="#9CA3AF"
            multiline
            style={[
              styles.input,
              styles.noteInput,
            ]}
          />
        </View>

        {/* SAVE */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            type === 'income'
              ? styles.saveIncome
              : styles.saveExpense,
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Ionicons
            name={
              type === 'expense'
                ? 'arrow-up-circle'
                : 'arrow-down-circle'
            }
            size={24}
            color="#FFFFFF"
          />

          <Text
            style={styles.saveText}
          >
            {type === 'expense'
              ? 'Save Expense'
              : 'Save Income'}
          </Text>
        </TouchableOpacity>

        {/* QUICK BACK */}

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() =>
            router.replace(
              '/finance' as any
            )
          }
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color="#126EED"
          />

          <Text
            style={
              styles.dashboardText
            }
          >
            Back to Finance Dashboard
          </Text>
        </TouchableOpacity>
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
    padding: 20,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 14,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    color: '#6B7280',
    marginTop: 3,
  },

  typeCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },

  typeButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  incomeActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },

  expenseActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },

  typeText: {
    fontWeight: '800',
    color: '#374151',
  },

  activeTypeText: {
    color: '#FFFFFF',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 22,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 15,
    color: '#111827',
    backgroundColor: '#FAFBFC',
    fontSize: 15,
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 15,
  },

  currency: {
    fontSize: 22,
    fontWeight: '800',
    color: '#126EED',
  },

  amountInput: {
    flex: 1,
    height: 55,
    marginLeft: 8,
    fontSize: 20,
    color: '#111827',
    fontWeight: '700',
  },

  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },

  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  categoryActive: {
    backgroundColor: '#126EED',
  },

  categoryText: {
    color: '#4B5563',
    fontWeight: '700',
  },

  categoryActiveText: {
    color: '#FFFFFF',
  },

  noteInput: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  saveButton: {
    minHeight: 58,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  saveIncome: {
    backgroundColor: '#16A34A',
  },

  saveExpense: {
    backgroundColor: '#EF4444',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  dashboardButton: {
    marginTop: 15,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  dashboardText: {
    color: '#126EED',
    fontWeight: '800',
  },
});