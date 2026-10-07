
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =========================================================
   STORAGE KEYS
========================================================= */

export const WELLNESS_STORAGE_KEY = 'smart_life_wellness';
export const WELLNESS_HISTORY_KEY = 'smart_life_wellness_history';
export const FINANCE_STORAGE_KEY = 'smart_life_finance';

/* =========================================================
   WELLNESS TYPES
========================================================= */

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

export type WellnessHistory = Record<string, WellnessData>;

/* =========================================================
   FINANCE TYPES
========================================================= */

export type FinanceTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  paymentMethod:
    | 'UPI'
    | 'Cash'
    | 'Card'
    | 'Bank Transfer';
  note: string;
  date: string;
};

export type FinanceData = {
  monthlyBudget: number;
  savingsGoal: number;
  currentSavings: number;
  transactions: FinanceTransaction[];
};

/* =========================================================
   DATE HELPERS
========================================================= */

export const getTodayKey = (): string => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getYesterdayKey = (): string => {
  const date = new Date();

  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/* =========================================================
   DEFAULT WELLNESS
========================================================= */

const createDefaultWellness = (
  date: string = getTodayKey()
): WellnessData => {
  return {
    date,
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
};

/* =========================================================
   WELLNESS HISTORY
========================================================= */

export const getWellnessHistory =
  async (): Promise<WellnessHistory> => {
    try {
      const raw = await AsyncStorage.getItem(
        WELLNESS_HISTORY_KEY
      );

      if (!raw) {
        return {};
      }

      const history = JSON.parse(raw);

      if (
        !history ||
        typeof history !== 'object' ||
        Array.isArray(history)
      ) {
        return {};
      }

      return history;
    } catch (error) {
      console.log(
        'Unable to load wellness history:',
        error
      );

      return {};
    }
  };

/* =========================================================
   SAVE WELLNESS HISTORY
========================================================= */

export const saveWellnessHistory =
  async (
    history: WellnessHistory
  ): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        WELLNESS_HISTORY_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.log(
        'Unable to save wellness history:',
        error
      );
    }
  };

/* =========================================================
   GET TODAY WELLNESS
========================================================= */

export const getWellness =
  async (): Promise<WellnessData> => {
    try {
      const today = getTodayKey();

      const raw = await AsyncStorage.getItem(
        WELLNESS_STORAGE_KEY
      );

      /* ---------------------------------------------
         First time user
      --------------------------------------------- */

      if (!raw) {
        const defaultData =
          createDefaultWellness(today);

        await AsyncStorage.setItem(
          WELLNESS_STORAGE_KEY,
          JSON.stringify(defaultData)
        );

        return defaultData;
      }

      const data = JSON.parse(raw);

      /* ---------------------------------------------
         Invalid stored data
      --------------------------------------------- */

      if (
        !data ||
        typeof data !== 'object'
      ) {
        const defaultData =
          createDefaultWellness(today);

        await AsyncStorage.setItem(
          WELLNESS_STORAGE_KEY,
          JSON.stringify(defaultData)
        );

        return defaultData;
      }

      /* ---------------------------------------------
         Same day
      --------------------------------------------- */

      if (data.date === today) {
        return {
          ...createDefaultWellness(today),
          ...data,
          date: today,
        };
      }

      /* ---------------------------------------------
         New day
         
         IMPORTANT:
         Previous day's data is saved to history
         instead of being deleted.
      --------------------------------------------- */

      const previousData: WellnessData = {
        ...createDefaultWellness(data.date),
        ...data,
      };

      const history =
        await getWellnessHistory();

      history[previousData.date] =
        previousData;

      await saveWellnessHistory(history);

      /* ---------------------------------------------
         Calculate streak
      --------------------------------------------- */

      const yesterday =
        getYesterdayKey();

      const yesterdayData =
        history[yesterday];

      let newStreak = 0;

      if (yesterdayData) {
        const wasActive =
          yesterdayData.steps > 0 ||
          yesterdayData.water > 0 ||
          yesterdayData.sleepHours > 0 ||
          yesterdayData.activeMinutes > 0;

        if (wasActive) {
          newStreak =
            (yesterdayData.streak || 0) + 1;
        }
      }

      /* ---------------------------------------------
         Create today's fresh data
      --------------------------------------------- */

      const todayData: WellnessData = {
        ...createDefaultWellness(today),
        streak: newStreak,
      };

      await AsyncStorage.setItem(
        WELLNESS_STORAGE_KEY,
        JSON.stringify(todayData)
      );

      return todayData;
    } catch (error) {
      console.log(
        'Unable to load wellness:',
        error
      );

      return createDefaultWellness();
    }
  };

/* =========================================================
   SAVE TODAY WELLNESS
========================================================= */

export const saveWellness =
  async (
    data: WellnessData
  ): Promise<void> => {
    try {
      const today = getTodayKey();

      const updatedData: WellnessData = {
        ...createDefaultWellness(today),
        ...data,
        date: today,
      };

      /* Save current day */

      await AsyncStorage.setItem(
        WELLNESS_STORAGE_KEY,
        JSON.stringify(updatedData)
      );

      /* ---------------------------------------------
         Also update history
         
         This means today's data is available
         immediately in the history database.
      --------------------------------------------- */

      const history =
        await getWellnessHistory();

      history[today] = updatedData;

      await saveWellnessHistory(history);
    } catch (error) {
      console.log(
        'Unable to save wellness:',
        error
      );
    }
  };

/* =========================================================
   GET WELLNESS FOR SPECIFIC DATE
========================================================= */

export const getWellnessByDate =
  async (
    date: string
  ): Promise<WellnessData | null> => {
    try {
      const today = getTodayKey();

      /* Today's data */

      if (date === today) {
        return await getWellness();
      }

      /* Previous data */

      const history =
        await getWellnessHistory();

      return history[date] || null;
    } catch (error) {
      console.log(
        'Unable to get wellness by date:',
        error
      );

      return null;
    }
  };

/* =========================================================
   GET LAST N DAYS
========================================================= */

export const getRecentWellness =
  async (
    days: number = 7
  ): Promise<WellnessData[]> => {
    try {
      const history =
        await getWellnessHistory();

      const today =
        await getWellness();

      const records: WellnessData[] = [
        ...Object.values(history),
      ];

      /* Include today's data */

      const existingTodayIndex =
        records.findIndex(
          (item) =>
            item.date === today.date
        );

      if (existingTodayIndex >= 0) {
        records[existingTodayIndex] =
          today;
      } else {
        records.push(today);
      }

      /* Sort newest first */

      records.sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      return records.slice(0, days);
    } catch (error) {
      console.log(
        'Unable to get recent wellness:',
        error
      );

      return [];
    }
  };

/* =========================================================
   DELETE WELLNESS HISTORY
========================================================= */

export const clearWellnessHistory =
  async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(
        WELLNESS_HISTORY_KEY
      );

      await AsyncStorage.removeItem(
        WELLNESS_STORAGE_KEY
      );
    } catch (error) {
      console.log(
        'Unable to clear wellness data:',
        error
      );
    }
  };

/* =========================================================
   FINANCE
========================================================= */

export const getFinance =
  async (): Promise<FinanceData> => {
    try {
      const raw =
        await AsyncStorage.getItem(
          FINANCE_STORAGE_KEY
        );

      if (!raw) {
        return {
          monthlyBudget: 0,
          savingsGoal: 0,
          currentSavings: 0,
          transactions: [],
        };
      }

      const data = JSON.parse(raw);

      return {
        monthlyBudget:
          Number(data.monthlyBudget) || 0,

        savingsGoal:
          Number(data.savingsGoal) || 0,

        currentSavings:
          Number(data.currentSavings) || 0,

        transactions:
          Array.isArray(data.transactions)
            ? data.transactions
            : [],
      };
    } catch (error) {
      console.log(
        'Unable to load finance data:',
        error
      );

      return {
        monthlyBudget: 0,
        savingsGoal: 0,
        currentSavings: 0,
        transactions: [],
      };
    }
  };

/* =========================================================
   SAVE FINANCE
========================================================= */

export const saveFinance =
  async (
    data: FinanceData
  ): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        FINANCE_STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log(
        'Unable to save finance data:',
        error
      );
    }
  };

