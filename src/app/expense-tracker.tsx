import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
  useFinance,
} from '../context/FinanceContext';

export default function ExpenseTrackerScreen() {
  const router = useRouter();

  const {
    transactions,
    deleteTransaction,
  } = useFinance();

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  const currentYear =
    new Date().getFullYear();

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
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
  // MONTH EXPENSES
  // ==========================================

  const monthExpenses = useMemo(() => {
    return transactions
      .filter((item) => {
        if (item.type !== 'expense') {
          return false;
        }

        const date = new Date(
          item.date
        );

        return (
          date.getMonth() ===
            selectedMonth &&
          date.getFullYear() ===
            currentYear
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [
    transactions,
    selectedMonth,
    currentYear,
  ]);

  const totalExpense =
    monthExpenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  // ==========================================
  // DELETE
  // ==========================================

  const removeExpense = (
    id: string
  ) => {
    const performDelete = async () => {
      await deleteTransaction(id);
    };

    if (Platform.OS === 'web') {
      const confirmed =
        window.confirm(
          'Delete this expense?'
        );

      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
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
              style={styles.title}
            >
              Expense Tracker
            </Text>

            <Text
              style={styles.subtitle}
            >
              Track your monthly spending
            </Text>
          </View>
        </View>

        {/* TOTAL */}

        <View
          style={styles.totalCard}
        >
          <View
            style={styles.totalIcon}
          >
            <Ionicons
              name="trending-up-outline"
              size={27}
              color="#EF4444"
            />
          </View>

          <View>
            <Text
              style={styles.totalLabel}
            >
              {months[selectedMonth]}{' '}
              {currentYear} Expenses
            </Text>

            <Text
              style={styles.totalAmount}
            >
              ₹
              {totalExpense.toLocaleString(
                'en-IN'
              )}
            </Text>
          </View>
        </View>

        {/* MONTHS */}

        <Text
          style={styles.sectionTitle}
        >
          Select Month
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.monthRow
          }
        >
          {months.map(
            (month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth ===
                    index &&
                    styles.monthActive,
                ]}
                onPress={() =>
                  setSelectedMonth(index)
                }
              >
                <Text
                  style={[
                    styles.monthText,
                    selectedMonth ===
                      index &&
                      styles.monthActiveText,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* ADD */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push(
              '/add-money' as any
            )
          }
        >
          <Ionicons
            name="add-circle-outline"
            size={23}
            color="#FFFFFF"
          />

          <Text
            style={styles.addButtonText}
          >
            Add Expense
          </Text>
        </TouchableOpacity>

        {/* LIST */}

        <View style={styles.listCard}>
          <Text
            style={styles.sectionTitle}
          >
            {months[selectedMonth]}{' '}
            Expenses
          </Text>

          {monthExpenses.length === 0 ? (
            <View
              style={styles.empty}
            >
              <Ionicons
                name="receipt-outline"
                size={48}
                color="#CBD5E1"
              />

              <Text
                style={styles.emptyTitle}
              >
                No expenses yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Add your first expense
                for this month.
              </Text>
            </View>
          ) : (
            monthExpenses.map(
              (item) => (
                <View
                  key={item.id}
                  style={styles.transaction}
                >
                  <View
                    style={
                      styles.transactionIcon
                    }
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color="#EF4444"
                    />
                  </View>

                  <View
                    style={
                      styles.transactionInfo
                    }
                  >
                    <Text
                      style={
                        styles.transactionTitle
                      }
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={
                        styles.transactionMeta
                      }
                    >
                      {item.category} •{' '}
                      {new Date(
                        item.date
                      ).toLocaleDateString(
                        'en-IN'
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.transactionRight
                    }
                  >
                    <Text
                      style={
                        styles.transactionAmount
                      }
                    >
                      -₹
                      {Number(
                        item.amount
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        removeExpense(
                          String(item.id)
                        )
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )
          )}
        </View>

        {/* FINANCE */}

        <TouchableOpacity
          style={
            styles.financeButton
          }
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
              styles.financeButtonText
            }
          >
            View Finance Dashboard
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
    gap: 14,
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    color: '#6B7280',
    marginTop: 3,
  },

  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 24,
  },

  totalIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalLabel: {
    color: '#6B7280',
    fontSize: 13,
  },

  totalAmount: {
    fontSize: 27,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },

  monthRow: {
    gap: 8,
    paddingBottom: 17,
  },

  monthButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  monthActive: {
    backgroundColor: '#126EED',
  },

  monthText: {
    fontWeight: '700',
    color: '#4B5563',
  },

  monthActiveText: {
    color: '#FFFFFF',
  },

  addButton: {
    height: 55,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#374151',
    marginTop: 12,
  },

  emptyText: {
    color: '#9CA3AF',
    marginTop: 5,
  },

  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },

  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
  },

  transactionTitle: {
    fontWeight: '800',
    color: '#111827',
  },

  transactionMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },

  transactionRight: {
    alignItems: 'flex-end',
    gap: 7,
  },

  transactionAmount: {
    color: '#EF4444',
    fontWeight: '900',
  },

  financeButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  financeButtonText: {
    color: '#126EED',
    fontWeight: '800',
  },
});