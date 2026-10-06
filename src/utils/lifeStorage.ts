import AsyncStorage from '@react-native-async-storage/async-storage';

export const WELLNESS_STORAGE_KEY = 'smart_life_wellness';
export const FINANCE_STORAGE_KEY = 'smart_life_finance';

export type WellnessData = {
  date: string;
  steps: number;
  water: number;
  waterGoal: number;
  sleepHours: number;
  sleepGoal: number;
  activeMinutes: number;
  calories: number;
  activity: string;
  streak: number;
};

export type FinanceTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  paymentMethod: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer';
  note: string;
  date: string;
};

export type FinanceData = {
  monthlyBudget: number;
  savingsGoal: number;
  currentSavings: number;
  transactions: FinanceTransaction[];
};

export const getTodayKey = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getWellness = async (): Promise<WellnessData> => {
  try {
    const raw = await AsyncStorage.getItem(WELLNESS_STORAGE_KEY);

    if (!raw) {
      return {
        date: getTodayKey(),
        steps: 0,
        water: 0,
        waterGoal: 8,
        sleepHours: 0,
        sleepGoal: 8,
        activeMinutes: 0,
        calories: 0,
        activity: 'Walking',
        streak: 0,
      };
    }

    const data = JSON.parse(raw);

    if (data.date !== getTodayKey()) {
      return {
        ...data,
        date: getTodayKey(),
        steps: 0,
        water: 0,
        sleepHours: 0,
        activeMinutes: 0,
        calories: 0,
      };
    }

    return data;
  } catch {
    return {
      date: getTodayKey(),
      steps: 0,
      water: 0,
      waterGoal: 8,
      sleepHours: 0,
      sleepGoal: 8,
      activeMinutes: 0,
      calories: 0,
      activity: 'Walking',
      streak: 0,
    };
  }
};

export const saveWellness = async (
  data: WellnessData
): Promise<void> => {
  await AsyncStorage.setItem(
    WELLNESS_STORAGE_KEY,
    JSON.stringify(data)
  );
};

export const getFinance = async (): Promise<FinanceData> => {
  try {
    const raw = await AsyncStorage.getItem(FINANCE_STORAGE_KEY);

    if (!raw) {
      return {
        monthlyBudget: 0,
        savingsGoal: 0,
        currentSavings: 0,
        transactions: [],
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      monthlyBudget: 0,
      savingsGoal: 0,
      currentSavings: 0,
      transactions: [],
    };
  }
};

export const saveFinance = async (
  data: FinanceData
): Promise<void> => {
  await AsyncStorage.setItem(
    FINANCE_STORAGE_KEY,
    JSON.stringify(data)
  );
};