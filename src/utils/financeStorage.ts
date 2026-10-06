import AsyncStorage from '@react-native-async-storage/async-storage';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  notes?: string;
  createdAt: string;
};

export type UPITransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'Paid' | 'Received';
  app: string;
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
};

export type SavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  createdAt: string;
};

const EXPENSE_KEY = 'smart_finance_expenses';
const UPI_KEY = 'smart_finance_upi';
const SAVINGS_KEY = 'smart_finance_savings';

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(EXPENSE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveExpenses = async (
  expenses: Expense[],
) => {
  await AsyncStorage.setItem(
    EXPENSE_KEY,
    JSON.stringify(expenses),
  );
};

export const getUPITransactions =
  async (): Promise<UPITransaction[]> => {
    try {
      const data = await AsyncStorage.getItem(UPI_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

export const saveUPITransactions = async (
  transactions: UPITransaction[],
) => {
  await AsyncStorage.setItem(
    UPI_KEY,
    JSON.stringify(transactions),
  );
};

export const getSavingsGoals =
  async (): Promise<SavingGoal[]> => {
    try {
      const data =
        await AsyncStorage.getItem(SAVINGS_KEY);

      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

export const saveSavingsGoals = async (
  goals: SavingGoal[],
) => {
  await AsyncStorage.setItem(
    SAVINGS_KEY,
    JSON.stringify(goals),
  );
};

export const formatMoney = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};