import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const HEALTH_STORAGE_KEY = 'smart_life_health_data';

export type HealthData = {
  steps: number;
  calories: number;
  water: number;
  waterGoal: number;
  workouts: number;
  workoutMinutes: number;
  lastUpdated: string;
};

type HealthContextType = {
  health: HealthData;

  setSteps: (steps: number) => void;
  addSteps: (steps: number) => void;

  setCalories: (calories: number) => void;
  addCalories: (calories: number) => void;

  setWater: (water: number) => void;
  addWater: (amount: number) => void;

  addWorkout: (minutes: number, calories: number) => void;

  resetToday: () => void;
};

const defaultHealth: HealthData = {
  steps: 0,
  calories: 0,
  water: 0,
  waterGoal: 8,
  workouts: 0,
  workoutMinutes: 0,
  lastUpdated: new Date().toISOString(),
};

const HealthContext =
  createContext<HealthContextType | undefined>(
    undefined
  );

export function HealthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [health, setHealth] =
    useState<HealthData>(defaultHealth);

  /*
   * Load saved health data
   */
  useEffect(() => {
    loadHealth();
  }, []);

  /*
   * Save whenever health changes
   */
  useEffect(() => {
    AsyncStorage.setItem(
      HEALTH_STORAGE_KEY,
      JSON.stringify(health)
    ).catch(() => {});
  }, [health]);

  const loadHealth = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          HEALTH_STORAGE_KEY
        );

      if (stored) {
        const parsed = JSON.parse(stored);

        setHealth({
          ...defaultHealth,
          ...parsed,
        });
      }
    } catch (error) {
      console.log(
        'Health data loading error:',
        error
      );
    }
  };

  const setSteps = (steps: number) => {
    setHealth((previous) => ({
      ...previous,
      steps: Math.max(0, steps),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addSteps = (steps: number) => {
    setHealth((previous) => ({
      ...previous,
      steps: Math.max(
        0,
        previous.steps + steps
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setCalories = (calories: number) => {
    setHealth((previous) => ({
      ...previous,
      calories: Math.max(0, calories),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addCalories = (calories: number) => {
    setHealth((previous) => ({
      ...previous,
      calories: Math.max(
        0,
        previous.calories + calories
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setWater = (water: number) => {
    setHealth((previous) => ({
      ...previous,
      water: Math.max(0, water),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addWater = (amount: number) => {
    setHealth((previous) => ({
      ...previous,
      water: Math.max(
        0,
        previous.water + amount
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addWorkout = (
    minutes: number,
    calories: number
  ) => {
    setHealth((previous) => ({
      ...previous,

      workouts: previous.workouts + 1,

      workoutMinutes:
        previous.workoutMinutes +
        Math.max(0, minutes),

      calories:
        previous.calories +
        Math.max(0, calories),

      lastUpdated: new Date().toISOString(),
    }));
  };

  const resetToday = () => {
    setHealth({
      ...defaultHealth,
      lastUpdated: new Date().toISOString(),
    });
  };

  const value = useMemo(
    () => ({
      health,
      setSteps,
      addSteps,
      setCalories,
      addCalories,
      setWater,
      addWater,
      addWorkout,
      resetToday,
    }),
    [health]
  );

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context =
    useContext(HealthContext);

  if (!context) {
    throw new Error(
      'useHealth must be used inside HealthProvider'
    );
  }

  return context;
}