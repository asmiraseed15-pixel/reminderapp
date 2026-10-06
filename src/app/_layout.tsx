import React from 'react';
import { Stack } from 'expo-router';

import { TaskProvider } from '../context/TaskContext';
import { FinanceProvider } from '../context/FinanceContext';
import { HealthProvider } from '../context/HealthContext';

export default function RootLayout() {
  return (
    <TaskProvider>
      <FinanceProvider>
        <HealthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </HealthProvider>
      </FinanceProvider>
    </TaskProvider>
  );
}