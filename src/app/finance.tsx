import React, { useMemo, useState } from 'react';

import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  PieChart,
  BarChart,
} from 'react-native-chart-kit';

import {
  FinanceTransaction,
  useFinance,
} from '../context/FinanceContext';

const screenWidth = Dimensions.get('window').width;

const categoryColors = [
  '#126EED',
  '#7C4DFF',
  '#00A878',
  '#FF9F1C',
  '#E5484D',
  '#00B8D9',
  '#F06292',
  '#607D8B',
  '#8BC34A',
];

const months = [
  'All',
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

function formatMoney(value: number) {
  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

function getMonthIndex(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return -1;
  }

  return parsed.getMonth();
}

function getYear(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return -1;
  }

  return parsed.getFullYear();
}

export default function FinanceScreen() {
  const router = useRouter();

  const {
    transactions,
    deleteTransaction,
  } = useFinance();

  const [selectedMonth, setSelectedMonth] =
    useState('All');

  // ==========================================
  // BACK BUTTON
  // ==========================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/task');
    }
  };

  // ==========================================
  // CURRENT YEAR
  // ==========================================

  const currentYear = new Date().getFullYear();

  // ==========================================
  // FILTER TRANSACTIONS
  // ==========================================

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'All') {
      return transactions;
    }

    const monthIndex =
      months.indexOf(selectedMonth) - 1;

    return transactions.filter(transaction => {
      return (
        getMonthIndex(transaction.date) ===
          monthIndex &&
        getYear(transaction.date) ===
          currentYear
      );
    });
  }, [
    transactions,
    selectedMonth,
    currentYear,
  ]);

  // ==========================================
  // INCOME
  // ==========================================

  const income = useMemo(
    () =>
      filteredTransactions
        .filter(item => item.type === 'income')
        .reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0,
        ),
    [filteredTransactions],
  );

  // ==========================================
  // EXPENSE
  // ==========================================

  const expense = useMemo(
    () =>
      filteredTransactions
        .filter(item => item.type === 'expense')
        .reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0,
        ),
    [filteredTransactions],
  );

  // ==========================================
  // BALANCE
  // ==========================================

  const balance = income - expense;

  // ==========================================
  // CATEGORY SPENDING
  // ==========================================

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    filteredTransactions
      .filter(item => item.type === 'expense')
      .forEach(item => {
        map[item.category] =
          (map[item.category] || 0) +
          Number(item.amount || 0);
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9);
  }, [filteredTransactions]);

  // ==========================================
  // PIE CHART
  // ==========================================

  const pieData = categoryData.map(
    ([name, amount], index) => ({
      name,
      amount,
      color:
        categoryColors[
          index % categoryColors.length
        ],
      legendFontColor: '#566174',
      legendFontSize: 12,
    }),
  );

  // ==========================================
  // BAR CHART
  // ==========================================

  const barLabels =
    categoryData.length > 0
      ? categoryData
          .slice(0, 6)
          .map(([name]) =>
            name.length > 8
              ? `${name.slice(0, 8)}…`
              : name,
          )
      : ['No Data'];

  const barValues =
    categoryData.length > 0
      ? categoryData
          .slice(0, 6)
          .map(([, amount]) => amount)
      : [0];

  const chartWidth =
    Platform.OS === 'web'
      ? Math.min(screenWidth - 48, 720)
      : Math.max(screenWidth - 40, 300);

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================

  const confirmDelete = (
    transaction: FinanceTransaction,
  ) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Delete "${transaction.title}"?`,
      );

      if (confirmed) {
        deleteTransaction(transaction.id);
      }

      return;
    }

    Alert.alert(
      'Delete Transaction',
      `Delete "${transaction.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteTransaction(transaction.id),
        },
      ],
    );
  };

  // ==========================================
  // OPEN ADD MONEY
  // ==========================================

  const openAddMoney = () => {
    router.push('/add-money' as any);
  };

  // ==========================================
  // OPEN SAVINGS GOALS
  // ==========================================

  const openSavingsGoals = () => {
    router.push('/savings-goals' as any);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================
            HEADER
        ====================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
                size={23}
                color="#111827"
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                SMART LIFE
              </Text>

              <Text style={styles.title}>
                Finance Dashboard
              </Text>

              <Text style={styles.subtitle}>
                Understand your money. Control your
                future.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={openAddMoney}
          >
            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.addText}>
              Add Money
            </Text>
          </Pressable>
        </View>

        {/* ======================================
            MONTH FILTER
        ====================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRow}
        >
          {months.map(month => (
            <Pressable
              key={month}
              onPress={() =>
                setSelectedMonth(month)
              }
              style={[
                styles.monthButton,
                selectedMonth === month &&
                  styles.monthButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === month &&
                    styles.monthTextActive,
                ]}
              >
                {month}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ======================================
            BALANCE CARD
        ====================================== */}

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            {selectedMonth === 'All'
              ? 'Total Balance'
              : `${selectedMonth} ${currentYear} Balance`}
          </Text>

          <Text style={styles.balance}>
            {formatMoney(balance)}
          </Text>

          <Text style={styles.balanceHint}>
            {balance >= 0
              ? 'You are financially positive ✨'
              : 'Expenses are higher than income ⚠️'}
          </Text>
        </View>

        {/* ======================================
            INCOME / EXPENSE
        ====================================== */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              📈
            </Text>

            <Text style={styles.statLabel}>
              Income
            </Text>

            <Text
              style={[
                styles.statValue,
                { color: '#159957' },
              ]}
            >
              {formatMoney(income)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              📉
            </Text>

            <Text style={styles.statLabel}>
              Expense
            </Text>

            <Text
              style={[
                styles.statValue,
                { color: '#E5484D' },
              ]}
            >
              {formatMoney(expense)}
            </Text>
          </View>
        </View>

        {/* ======================================
            SAVINGS GOALS SHORTCUT
        ====================================== */}

        <Pressable
          style={styles.savingsShortcut}
          onPress={openSavingsGoals}
        >
          <View style={styles.savingsIconBox}>
            <Text style={styles.savingsIcon}>
              🎯
            </Text>
          </View>

          <View style={styles.savingsContent}>
            <Text style={styles.savingsTitle}>
              Savings Goals
            </Text>

            <Text style={styles.savingsSubtitle}>
              Create and track your financial goals
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#126EED"
          />
        </Pressable>

        {/* ======================================
            SPENDING BREAKDOWN
        ====================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Spending Breakdown
          </Text>

          <Text style={styles.sectionSubtitle}>
            Where your money is going
          </Text>

          {pieData.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <PieChart
                data={pieData}
                width={chartWidth}
                height={240}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
                chartConfig={{
                  color: () => '#126EED',
                  labelColor: () =>
                    '#566174',
                }}
                absolute
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyIcon}>
                📊
              </Text>

              <Text style={styles.emptyTitle}>
                No expense data yet
              </Text>

              <Text style={styles.emptyText}>
                Add an expense to see your spending
                chart.
              </Text>
            </View>
          )}
        </View>

        {/* ======================================
            CATEGORY BAR CHART
        ====================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Category Spending
          </Text>

          <Text style={styles.sectionSubtitle}>
            Top expense categories
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <BarChart
              data={{
                labels: barLabels,
                datasets: [
                  {
                    data: barValues,
                  },
                ],
              }}
              width={Math.max(
                chartWidth,
                420,
              )}
              height={260}
              fromZero
              showValuesOnTopOfBars
              chartConfig={{
                backgroundGradientFrom:
                  '#FFFFFF',
                backgroundGradientTo:
                  '#FFFFFF',
                decimalPlaces: 0,
                color: () => '#126EED',
                labelColor: () =>
                  '#566174',
                propsForBackgroundLines: {
                  stroke: '#E8ECF2',
                },
              }}
              style={styles.barChart}
              yAxisLabel="₹"
              yAxisSuffix=""
            />
          </ScrollView>
        </View>

        {/* ======================================
            TRANSACTIONS
        ====================================== */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Transactions
              </Text>

              <Text style={styles.sectionSubtitle}>
                {filteredTransactions.length}{' '}
                record
                {filteredTransactions.length ===
                1
                  ? ''
                  : 's'}
              </Text>
            </View>

            <Pressable
              onPress={openAddMoney}
            >
              <Text style={styles.link}>
                + Add
              </Text>
            </Pressable>
          </View>

          {filteredTransactions.length ===
          0 ? (
            <View
              style={styles.emptyTransactions}
            >
              <Text style={styles.emptyIcon}>
                💳
              </Text>

              <Text style={styles.emptyTitle}>
                No transactions
              </Text>

              <Text style={styles.emptyText}>
                Start tracking your money by adding
                your first transaction.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={openAddMoney}
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Add Transaction
                </Text>
              </Pressable>
            </View>
          ) : (
            filteredTransactions.map(
              transaction => (
                <View
                  key={transaction.id}
                  style={
                    styles.transactionCard
                  }
                >
                  <View
                    style={
                      styles.transactionIcon
                    }
                  >
                    <Text>
                      {transaction.type ===
                      'income'
                        ? '💰'
                        : '💸'}
                    </Text>
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
                      numberOfLines={1}
                    >
                      {transaction.title}
                    </Text>

                    <Text
                      style={
                        styles.transactionMeta
                      }
                    >
                      {transaction.category} •{' '}
                      {new Date(
                        transaction.date,
                      ).toLocaleDateString(
                        'en-IN',
                      )}
                    </Text>

                    {transaction.note ? (
                      <Text
                        style={
                          styles.transactionNote
                        }
                        numberOfLines={1}
                      >
                        {transaction.note}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={
                      styles.transactionRight
                    }
                  >
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.type ===
                            'income'
                              ? '#159957'
                              : '#E5484D',
                        },
                      ]}
                    >
                      {transaction.type ===
                      'income'
                        ? '+'
                        : '-'}
                      {formatMoney(
                        transaction.amount,
                      )}
                    </Text>

                    <Pressable
                      onPress={() =>
                        confirmDelete(
                          transaction,
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ),
            )
          )}
        </View>

        {/* ======================================
            SMART TIP
        ====================================== */}

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Smart Finance Tip
            </Text>

            <Text style={styles.tipText}>
              Track every expense for a clearer
              picture of your monthly spending and
              savings.
            </Text>
          </View>
        </View>
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
    backgroundColor: '#F5F7FB',
  },

  container: {
    padding: 20,
    paddingBottom: 50,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    elevation: 2,
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: '#126EED',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },

  subtitle: {
    color: '#788294',
    marginTop: 5,
    maxWidth: 480,
  },

  // ==========================================
  // ADD MONEY
  // ==========================================

  addButton: {
    backgroundColor: '#126EED',
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  addText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ==========================================
  // MONTHS
  // ==========================================

  monthRow: {
    gap: 8,
    paddingBottom: 16,
  },

  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EF',
  },

  monthButtonActive: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  monthText: {
    color: '#667085',
    fontWeight: '700',
  },

  monthTextActive: {
    color: '#FFFFFF',
  },

  // ==========================================
  // BALANCE
  // ==========================================

  balanceCard: {
    backgroundColor: '#126EED',
    borderRadius: 26,
    padding: 26,
    marginBottom: 14,
  },

  balanceLabel: {
    color: '#DCEAFF',
    fontWeight: '600',
  },

  balance: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 7,
  },

  balanceHint: {
    color: '#DCEAFF',
    marginTop: 8,
  },

  // ==========================================
  // STATS
  // ==========================================

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  statIcon: {
    fontSize: 24,
  },

  statLabel: {
    color: '#7A8495',
    marginTop: 8,
    fontWeight: '600',
  },

  statValue: {
    fontSize: 21,
    fontWeight: '900',
    marginTop: 4,
  },

  // ==========================================
  // SAVINGS SHORTCUT
  // ==========================================

  savingsShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7EBF1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  savingsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  savingsIcon: {
    fontSize: 25,
  },

  savingsContent: {
    flex: 1,
    marginLeft: 13,
  },

  savingsTitle: {
    color: '#172033',
    fontSize: 15,
    fontWeight: '900',
  },

  savingsSubtitle: {
    color: '#8992A2',
    fontSize: 12,
    marginTop: 4,
  },

  // ==========================================
  // SECTIONS
  // ==========================================

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#8992A2',
    fontSize: 13,
    marginTop: 4,
  },

  link: {
    color: '#126EED',
    fontWeight: '800',
  },

  // ==========================================
  // CHART EMPTY
  // ==========================================

  emptyChart: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#252D3A',
  },

  emptyText: {
    color: '#8790A0',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 350,
    lineHeight: 20,
  },

  emptyButton: {
    backgroundColor: '#126EED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ==========================================
  // BAR CHART
  // ==========================================

  barChart: {
    marginTop: 15,
    borderRadius: 16,
  },

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    gap: 12,
  },

  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    color: '#202938',
    fontWeight: '800',
    fontSize: 14,
  },

  transactionMeta: {
    color: '#8992A2',
    fontSize: 12,
    marginTop: 4,
  },

  transactionNote: {
    color: '#A0A7B3',
    fontSize: 11,
    marginTop: 3,
  },

  transactionRight: {
    alignItems: 'flex-end',
  },

  transactionAmount: {
    fontWeight: '900',
    fontSize: 14,
  },

  deleteText: {
    color: '#E5484D',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  // ==========================================
  // TIP
  // ==========================================

  tipCard: {
    marginTop: 14,
    padding: 18,
    backgroundColor: '#EEF6FF',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
  },

  tipIcon: {
    fontSize: 26,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontWeight: '900',
    color: '#172033',
  },

  tipText: {
    color: '#647084',
    marginTop: 4,
    lineHeight: 19,
  },
});