import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export type FinanceType = 'income' | 'expense';

export type FinanceCategory =
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Bills'
  | 'Health'
  | 'Education'
  | 'Entertainment'
  | 'Salary'
  | 'UPI'
  | 'Other';

export type FinanceTransaction = {
  id: string;
  title: string;
  amount: number;
  type: FinanceType;
  category: FinanceCategory;
  date: string;
  note?: string;
  createdAt: string;
};

type FinanceContextType = {
  transactions: FinanceTransaction[];

  addTransaction: (
    transaction: FinanceTransaction
  ) => Promise<void>;

  deleteTransaction: (
    id: string
  ) => Promise<void>;

  clearTransactions: () => Promise<void>;

  totalIncome: number;
  totalExpense: number;
  balance: number;
};

const STORAGE_KEY = 'smart_todo_finance_transactions';

const FinanceContext =
  createContext<FinanceContextType | undefined>(
    undefined
  );

export function FinanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] =
    useState<FinanceTransaction[]>([]);

  const [loaded, setLoaded] = useState(false);

  // ==========================================
  // LOAD
  // ==========================================

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (stored) {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setTransactions(parsed);
          }
        }
      } catch (error) {
        console.log(
          'Finance load error:',
          error
        );
      } finally {
        setLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  // ==========================================
  // SAVE
  // ==========================================

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    ).catch((error) => {
      console.log(
        'Finance save error:',
        error
      );
    });
  }, [transactions, loaded]);

  // ==========================================
  // ADD TRANSACTION
  // ==========================================

  const addTransaction = async (
    transaction: FinanceTransaction
  ) => {
    const cleanTransaction: FinanceTransaction = {
      ...transaction,

      id:
        transaction.id ||
        `${Date.now()}-${Math.random()}`,

      title: String(
        transaction.title || ''
      ).trim(),

      amount: Number(
        transaction.amount || 0
      ),

      date:
        transaction.date ||
        new Date().toISOString(),

      createdAt:
        transaction.createdAt ||
        new Date().toISOString(),
    };

    setTransactions((previous) => [
      cleanTransaction,
      ...previous,
    ]);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteTransaction = async (
    id: string
  ) => {
    setTransactions((previous) =>
      previous.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  // ==========================================
  // CLEAR
  // ==========================================

  const clearTransactions = async () => {
    setTransactions([]);
  };

  // ==========================================
  // TOTALS
  // ==========================================

  const totalIncome = useMemo(() => {
    return transactions
      .filter(
        (item) => item.type === 'income'
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(
        (item) => item.type === 'expense'
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  const balance =
    totalIncome - totalExpense;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        clearTransactions,
        totalIncome,
        totalExpense,
        balance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context =
    useContext(FinanceContext);

  if (!context) {
    throw new Error(
      'useFinance must be used inside FinanceProvider'
    );
  }

  return context;
}