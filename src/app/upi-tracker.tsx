import React, { useEffect, useMemo, useState } from 'react';

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

import { useRouter } from 'expo-router';

import {
  UPITransaction,
  formatMoney,
  getToday,
  getUPITransactions,
  saveUPITransactions,
} from '../utils/financeStorage';

const apps = [
  'GPay',
  'PhonePe',
  'Paytm',
  'Bank UPI',
  'Other',
];

const categories = [
  'Food',
  'Shopping',
  'Bills',
  'Travel',
  'Family',
  'Other',
];

export default function UPITracker() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState<UPITransaction[]>([]);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] =
    useState<'Paid' | 'Received'>('Paid');

  const [app, setApp] =
    useState('GPay');

  const [category, setCategory] =
    useState('Food');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setTransactions(
      await getUPITransactions(),
    );
  };

  const paid = useMemo(
    () =>
      transactions
        .filter(
          item => item.type === 'Paid',
        )
        .reduce(
          (sum, item) =>
            sum + item.amount,
          0,
        ),
    [transactions],
  );

  const received = useMemo(
    () =>
      transactions
        .filter(
          item =>
            item.type === 'Received',
        )
        .reduce(
          (sum, item) =>
            sum + item.amount,
          0,
        ),
    [transactions],
  );

  const addTransaction =
    async () => {
      const numericAmount =
        Number(amount);

      if (!title.trim()) {
        Alert.alert(
          'Missing Details',
          'Enter transaction title.',
        );
        return;
      }

      if (
        !numericAmount ||
        numericAmount <= 0
      ) {
        Alert.alert(
          'Invalid Amount',
          'Enter a valid amount.',
        );
        return;
      }

      const item: UPITransaction = {
        id: Date.now().toString(),
        title: title.trim(),
        amount: numericAmount,
        type,
        app,
        category,
        date: getToday(),
        createdAt:
          new Date().toISOString(),
      };

      const updated = [
        item,
        ...transactions,
      ];

      await saveUPITransactions(
        updated,
      );

      setTransactions(updated);
      setTitle('');
      setAmount('');

      Alert.alert(
        'Saved',
        'UPI transaction recorded.',
      );
    };

  const remove = async (
    id: string,
  ) => {
    const action = async () => {
      const updated =
        transactions.filter(
          item => item.id !== id,
        );

      await saveUPITransactions(
        updated,
      );

      setTransactions(updated);
    };

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          'Delete this transaction?',
        )
      ) {
        action();
      }

      return;
    }

    Alert.alert(
      'Delete Transaction',
      'Are you sure?',
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              DIGITAL PAYMENTS
            </Text>

            <Text style={styles.title}>
              UPI Tracker
            </Text>

            <Text style={styles.subtitle}>
              Keep a simple record of your
              digital payments.
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

        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>
              PAID
            </Text>

            <Text style={styles.paid}>
              {formatMoney(paid)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>
              RECEIVED
            </Text>

            <Text style={styles.received}>
              {formatMoney(received)}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            Add UPI Transaction
          </Text>

          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                type === 'Paid' &&
                  styles.paidActive,
              ]}
              onPress={() =>
                setType('Paid')
              }
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'Paid' &&
                    styles.activeTypeText,
                ]}
              >
                ↑ Paid
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeButton,
                type === 'Received' &&
                  styles.receivedActive,
              ]}
              onPress={() =>
                setType('Received')
              }
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'Received' &&
                    styles.activeTypeText,
                ]}
              >
                ↓ Received
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>
            Transaction Name
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Example: Grocery payment"
            placeholderTextColor="#98A2B3"
            style={styles.input}
          />

          <Text style={styles.label}>
            Amount
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="₹ 0"
            placeholderTextColor="#98A2B3"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>
            Payment App
          </Text>

          <View style={styles.chips}>
            {apps.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  app === item &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setApp(item)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    app === item &&
                      styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>
            Category
          </Text>

          <View style={styles.chips}>
            {categories.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  category === item &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setCategory(item)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    category === item &&
                      styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.addButton}
            onPress={addTransaction}
          >
            <Text style={styles.addText}>
              + Save Transaction
            </Text>
          </Pressable>
        </View>

        <Text style={styles.historyTitle}>
          Transaction History
        </Text>

        {transactions.map(item => (
          <View
            key={item.id}
            style={styles.transaction}
          >
            <View style={styles.appIcon}>
              <Text style={styles.appEmoji}>
                📱
              </Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>
                {item.title}
              </Text>

              <Text style={styles.meta}>
                {item.app} • {item.category} •{' '}
                {item.date}
              </Text>
            </View>

            <View style={styles.amountSide}>
              <Text
                style={[
                  styles.amount,
                  item.type === 'Received'
                    ? styles.received
                    : styles.paid,
                ]}
              >
                {item.type === 'Received'
                  ? '+'
                  : '-'}
                {formatMoney(
                  item.amount,
                )}
              </Text>

              <Pressable
                onPress={() =>
                  remove(item.id)
                }
              >
                <Text
                  style={styles.delete}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    maxWidth: 900,
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
    fontSize: 11,
    fontWeight: '900',
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

  summary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  summaryLabel: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '900',
  },

  paid: {
    color: '#F04438',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 6,
  },

  received: {
    color: '#039855',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 6,
  },

  form: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
  },

  formTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 14,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  typeButton: {
    flex: 1,
    padding: 13,
    borderRadius: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },

  paidActive: {
    backgroundColor: '#FEF3F2',
    borderColor: '#F04438',
  },

  receivedActive: {
    backgroundColor: '#ECFDF3',
    borderColor: '#039855',
  },

  typeText: {
    fontWeight: '800',
    color: '#475467',
  },

  activeTypeText: {
    color: '#101828',
  },

  label: {
    color: '#344054',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 13,
    paddingHorizontal: 14,
    color: '#101828',
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },

  activeChip: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  chipText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '700',
  },

  activeChipText: {
    color: '#FFF',
  },

  addButton: {
    backgroundColor: '#126EED',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },

  addText: {
    color: '#FFF',
    fontWeight: '900',
  },

  historyTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 28,
    marginBottom: 12,
  },

  transaction: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  appIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appEmoji: {
    fontSize: 22,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontWeight: '900',
    color: '#101828',
  },

  meta: {
    color: '#667085',
    fontSize: 11,
    marginTop: 4,
  },

  amountSide: {
    alignItems: 'flex-end',
  },

  amount: {
    fontWeight: '900',
  },

  delete: {
    color: '#D92D20',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },
});