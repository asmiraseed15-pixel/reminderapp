import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/* =========================================================
   STORAGE KEYS
========================================================= */

const PROFILE_KEY = 'smart_todo_profile';

const TASK_STORAGE_KEYS = [
  'smart_todo_tasks',
  'todo_tasks',
];

const FINANCE_KEY =
  'smart_todo_finance_transactions';

const HEALTH_KEY =
  'smart_health_fitness';

/* =========================================================
   TYPES
========================================================= */

type ProfileData = {
  name?: string;
  profession?: string;
  email?: string;
  mobile?: string;
  location?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  dailyGoal?: string;
  profileImage?: string;
};

type TaskRecord = {
  id?: string;
  title?: string;
  category?: string;
  priority?: string;
  date?: string;
  time?: string;
  completed?: boolean;
  saved?: boolean;
  reminderEnabled?: boolean;
  reminderTime?: string;
  notes?: string;
  subtasks?: any[];
  createdAt?: string;
};

type FinanceTransaction = {
  id?: string;
  title?: string;
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  date?: string;
  note?: string;
  createdAt?: string;
};

type HealthData = {
  steps?: number;
  water?: number;
  calories?: number;
  weight?: number;
  date?: string;
};

/* =========================================================
   HELPERS
========================================================= */

const escapeHtml = (
  value: unknown,
): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatDate = (
  value?: string,
): string => {
  if (!value) {
    return 'Not specified';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatTime = (
  value?: string,
): string => {
  if (!value) {
    return '';
  }

  return value;
};

const formatAmount = (
  value: number = 0,
): string => {
  return `₹${Number(value).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    },
  )}`;
};

const safeArray = (
  value: any,
): any[] => {
  return Array.isArray(value)
    ? value
    : [];
};

/* =========================================================
   LOAD TASKS
========================================================= */

const loadTasks = async (): Promise<
  TaskRecord[]
> => {
  try {
    for (
      const key of TASK_STORAGE_KEYS
    ) {
      const stored =
        await AsyncStorage.getItem(
          key,
        );

      if (stored) {
        const parsed =
          JSON.parse(stored);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }

    return [];
  } catch (error) {
    console.log(
      'Task records loading error:',
      error,
    );

    return [];
  }
};

/* =========================================================
   LOAD PROFILE
========================================================= */

const loadProfile =
  async (): Promise<ProfileData> => {
    try {
      const stored =
        await AsyncStorage.getItem(
          PROFILE_KEY,
        );

      if (!stored) {
        return {};
      }

      return JSON.parse(stored);
    } catch (error) {
      console.log(
        'Profile loading error:',
        error,
      );

      return {};
    }
  };

/* =========================================================
   LOAD FINANCE
========================================================= */

const loadFinance =
  async (): Promise<
    FinanceTransaction[]
  > => {
    try {
      const stored =
        await AsyncStorage.getItem(
          FINANCE_KEY,
        );

      if (!stored) {
        return [];
      }

      const parsed =
        JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (error) {
      console.log(
        'Finance loading error:',
        error,
      );

      return [];
    }
  };

/* =========================================================
   LOAD HEALTH
========================================================= */

const loadHealth =
  async (): Promise<HealthData> => {
    try {
      const stored =
        await AsyncStorage.getItem(
          HEALTH_KEY,
        );

      if (!stored) {
        return {};
      }

      return JSON.parse(stored);
    } catch (error) {
      console.log(
        'Health loading error:',
        error,
      );

      return {};
    }
  };

/* =========================================================
   CREATE TASK HTML
========================================================= */

const createTaskRows = (
  tasks: TaskRecord[],
): string => {
  if (tasks.length === 0) {
    return `
      <tr>
        <td colspan="7" class="empty">
          No task records found.
        </td>
      </tr>
    `;
  }

  return tasks
    .map((task, index) => {
      const status = task.completed
        ? 'Completed'
        : 'Pending';

      const statusClass = task.completed
        ? 'completed'
        : 'pending';

      return `
        <tr>
          <td>${index + 1}</td>

          <td>
            <strong>
              ${escapeHtml(
                task.title ||
                  'Untitled Task',
              )}
            </strong>

            ${
              task.notes
                ? `
                  <div class="small-text">
                    ${escapeHtml(
                      task.notes,
                    )}
                  </div>
                `
                : ''
            }
          </td>

          <td>
            ${escapeHtml(
              task.category ||
                'Personal',
            )}
          </td>

          <td>
            ${escapeHtml(
              task.priority ||
                'Medium',
            )}
          </td>

          <td>
            ${formatDate(task.date)}
            ${
              task.time
                ? `<br /><span class="small-text">${escapeHtml(
                    formatTime(
                      task.time,
                    ),
                  )}</span>`
                : ''
            }
          </td>

          <td>
            <span class="status ${statusClass}">
              ${status}
            </span>
          </td>

          <td>
            ${
              task.reminderEnabled
                ? `
                  <span class="reminder-on">
                    🔔 ${escapeHtml(
                      task.reminderTime ||
                        'Enabled',
                    )}
                  </span>
                `
                : `
                  <span class="muted">
                    Off
                  </span>
                `
            }
          </td>
        </tr>
      `;
    })
    .join('');
};

/* =========================================================
   CREATE FINANCE ROWS
========================================================= */

const createFinanceRows = (
  transactions: FinanceTransaction[],
): string => {
  if (transactions.length === 0) {
    return `
      <tr>
        <td colspan="6" class="empty">
          No finance records found.
        </td>
      </tr>
    `;
  }

  return transactions
    .map(
      (
        transaction,
        index,
      ) => {
        const isIncome =
          transaction.type ===
          'income';

        return `
          <tr>
            <td>${index + 1}</td>

            <td>
              <strong>
                ${escapeHtml(
                  transaction.title ||
                    'Transaction',
                )}
              </strong>

              ${
                transaction.note
                  ? `
                    <div class="small-text">
                      ${escapeHtml(
                        transaction.note,
                      )}
                    </div>
                  `
                  : ''
              }
            </td>

            <td>
              ${escapeHtml(
                transaction.category ||
                  'Other',
              )}
            </td>

            <td>
              ${formatDate(
                transaction.date,
              )}
            </td>

            <td>
              <span
                class="${
                  isIncome
                    ? 'income'
                    : 'expense'
                }"
              >
                ${
                  isIncome
                    ? '+'
                    : '-'
                }
                ${formatAmount(
                  transaction.amount ||
                    0,
                )}
              </span>
            </td>

            <td>
              ${
                isIncome
                  ? 'Income'
                  : 'Expense'
              }
            </td>
          </tr>
        `;
      },
    )
    .join('');
};

/* =========================================================
   CREATE CALENDAR / UPCOMING TASKS
========================================================= */

const createScheduleRows = (
  tasks: TaskRecord[],
): string => {
  const scheduledTasks =
    [...tasks]
      .filter(
        (task) =>
          task.date &&
          String(task.date).trim(),
      )
      .sort((a, b) => {
        const dateA =
          new Date(
            a.date || '',
          ).getTime();

        const dateB =
          new Date(
            b.date || '',
          ).getTime();

        return dateA - dateB;
      })
      .slice(0, 30);

  if (
    scheduledTasks.length === 0
  ) {
    return `
      <tr>
        <td colspan="5" class="empty">
          No scheduled records found.
        </td>
      </tr>
    `;
  }

  return scheduledTasks
    .map(
      (
        task,
        index,
      ) => `
        <tr>
          <td>${index + 1}</td>

          <td>
            ${escapeHtml(
              task.title ||
                'Untitled Task',
            )}
          </td>

          <td>
            ${escapeHtml(
              task.category ||
                'Personal',
            )}
          </td>

          <td>
            ${formatDate(
              task.date,
            )}
          </td>

          <td>
            ${escapeHtml(
              task.time ||
                'Anytime',
            )}
          </td>
        </tr>
      `,
    )
    .join('');
};

/* =========================================================
   MAIN PDF GENERATOR
========================================================= */

export const shareAllRecords =
  async (): Promise<void> => {
    try {
      /*
       * WEB
       *
       * expo-sharing does not provide
       * the same native file-share
       * experience on web.
       */
      if (Platform.OS === 'web') {
        if (
          typeof window !==
          'undefined'
        ) {
          window.alert(
            'PDF sharing is currently available in the mobile app. Please open Smart Life in Expo Go to share the PDF through WhatsApp, Gmail, Email and other apps.',
          );
        }

        return;
      }

      /*
       * LOAD ALL DATA
       */

      const [
        profile,
        tasks,
        finance,
        health,
      ] = await Promise.all([
        loadProfile(),
        loadTasks(),
        loadFinance(),
        loadHealth(),
      ]);

      /*
       * TASK STATISTICS
       */

      const totalTasks =
        tasks.length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.completed === true,
        ).length;

      const pendingTasks =
        tasks.filter(
          (task) =>
            task.completed !== true,
        ).length;

      const savedTasks =
        tasks.filter(
          (task) =>
            task.saved === true,
        ).length;

      const completionRate =
        totalTasks === 0
          ? 0
          : Math.round(
              (completedTasks /
                totalTasks) *
                100,
            );

      /*
       * FINANCE STATISTICS
       */

      const totalIncome =
        finance.reduce(
          (sum, item) =>
            item.type ===
            'income'
              ? sum +
                Number(
                  item.amount || 0,
                )
              : sum,
          0,
        );

      const totalExpense =
        finance.reduce(
          (sum, item) =>
            item.type ===
            'expense'
              ? sum +
                Number(
                  item.amount || 0,
                )
              : sum,
          0,
        );

      const balance =
        totalIncome -
        totalExpense;

      /*
       * HEALTH VALUES
       */

      const steps =
        Number(
          health.steps || 0,
        );

      const calories =
        Number(
          health.calories || 0,
        );

      const water =
        Number(
          health.water || 0,
        );

      const weight =
        Number(
          health.weight || 0,
        );

      /*
       * TODAY
       */

      const generatedDate =
        new Date();

      const generatedDateText =
        generatedDate.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          },
        );

      const generatedTime =
        generatedDate.toLocaleTimeString(
          'en-IN',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        );

      /*
       * DAILY GOAL
       */

      const dailyGoal =
        Math.max(
          Number(
            profile.dailyGoal ||
              5,
          ),
          1,
        );

      /*
       * TODAY TASKS
       */

      const todayKey =
        generatedDate
          .toISOString()
          .slice(0, 10);

      const todayTasks =
        tasks.filter(
          (task) =>
            String(
              task.date || '',
            ).slice(0, 10) ===
            todayKey,
        );

      const todayCompleted =
        todayTasks.filter(
          (task) =>
            task.completed ===
            true,
        ).length;

      const todayProgress =
        Math.min(
          Math.round(
            (todayCompleted /
              dailyGoal) *
              100,
          ),
          100,
        );

      /*
       * HTML
       */

      const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  Smart Life - Complete Records
</title>

<style>

  * {
    box-sizing: border-box;
  }

  body {
    font-family:
      Arial,
      Helvetica,
      sans-serif;

    margin: 0;

    padding: 0;

    background: #f4f7fb;

    color: #152238;

    font-size: 12px;
  }

  .page {
    width: 100%;

    padding: 28px;
  }

  .cover {
    background:
      linear-gradient(
        135deg,
        #126eed,
        #7c3aed
      );

    color: white;

    border-radius: 20px;

    padding: 30px;

    margin-bottom: 22px;
  }

  .brand {
    font-size: 13px;

    letter-spacing: 2px;

    font-weight: 700;

    opacity: 0.85;
  }

  .cover-title {
    font-size: 30px;

    font-weight: 900;

    margin-top: 12px;

    margin-bottom: 8px;
  }

  .cover-subtitle {
    font-size: 14px;

    opacity: 0.9;

    line-height: 1.6;
  }

  .generated {
    margin-top: 22px;

    padding-top: 15px;

    border-top:
      1px solid
      rgba(255,255,255,0.25);

    font-size: 11px;

    opacity: 0.9;
  }

  .section {
    background: white;

    border-radius: 16px;

    padding: 20px;

    margin-bottom: 18px;

    border:
      1px solid #e5eaf1;
  }

  .section-title {
    font-size: 18px;

    font-weight: 800;

    margin: 0 0 4px;
  }

  .section-subtitle {
    color: #718096;

    font-size: 11px;

    margin-bottom: 16px;
  }

  .profile-grid {
    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 12px;
  }

  .profile-item {
    background: #f8fafc;

    border-radius: 10px;

    padding: 11px;
  }

  .profile-label {
    color: #718096;

    font-size: 10px;

    margin-bottom: 4px;
  }

  .profile-value {
    font-weight: 700;

    font-size: 12px;

    word-break: break-word;
  }

  .bio {
    margin-top: 12px;

    background: #f8fafc;

    border-radius: 10px;

    padding: 12px;

    line-height: 1.6;
  }

  .stats {
    display: grid;

    grid-template-columns:
      repeat(4, 1fr);

    gap: 10px;
  }

  .stat {
    padding: 14px;

    border-radius: 12px;

    background: #f8fafc;

    text-align: center;
  }

  .stat-value {
    font-size: 22px;

    font-weight: 900;

    color: #126eed;
  }

  .stat-label {
    color: #718096;

    font-size: 10px;

    margin-top: 4px;
  }

  .health-grid {
    display: grid;

    grid-template-columns:
      repeat(4, 1fr);

    gap: 10px;
  }

  .health-item {
    background: #fff6f8;

    border:
      1px solid #ffe1e8;

    border-radius: 12px;

    padding: 14px;

    text-align: center;
  }

  .health-value {
    font-size: 20px;

    font-weight: 900;

    color: #ef476f;
  }

  .health-label {
    color: #718096;

    font-size: 10px;

    margin-top: 4px;
  }

  .finance-grid {
    display: grid;

    grid-template-columns:
      repeat(3, 1fr);

    gap: 10px;

    margin-bottom: 15px;
  }

  .finance-card {
    padding: 15px;

    border-radius: 12px;

    text-align: center;
  }

  .income-card {
    background: #ecfdf5;

    border:
      1px solid #c8f3df;
  }

  .expense-card {
    background: #fff1f2;

    border:
      1px solid #ffd4da;
  }

  .balance-card {
    background: #eff6ff;

    border:
      1px solid #d4e6ff;
  }

  .finance-value {
    font-size: 19px;

    font-weight: 900;
  }

  .income-text {
    color: #16a34a;
  }

  .expense-text {
    color: #ef4444;
  }

  .balance-text {
    color: #126eed;
  }

  .finance-label {
    font-size: 10px;

    color: #718096;

    margin-top: 4px;
  }

  table {
    width: 100%;

    border-collapse: collapse;

    margin-top: 8px;
  }

  th {
    background: #f1f5f9;

    color: #4b5563;

    text-align: left;

    font-size: 9px;

    padding: 9px;

    border-bottom:
      1px solid #e5eaf1;
  }

  td {
    padding: 9px;

    border-bottom:
      1px solid #edf0f4;

    vertical-align: top;

    font-size: 10px;
  }

  tr {
    page-break-inside: avoid;
  }

  .small-text {
    color: #718096;

    font-size: 8px;

    margin-top: 3px;
  }

  .status {
    display: inline-block;

    padding:
      4px 7px;

    border-radius: 20px;

    font-size: 8px;

    font-weight: 800;
  }

  .completed {
    background: #dcfce7;

    color: #15803d;
  }

  .pending {
    background: #fff7ed;

    color: #c2410c;
  }

  .reminder-on {
    color: #7c3aed;

    font-weight: 700;
  }

  .muted {
    color: #9aa3b2;
  }

  .income {
    color: #16a34a;

    font-weight: 800;
  }

  .expense {
    color: #ef4444;

    font-weight: 800;
  }

  .empty {
    text-align: center;

    padding: 20px;

    color: #8a94a5;
  }

  .insight {
    background: #eef6ff;

    border:
      1px solid #d4e8ff;

    border-radius: 12px;

    padding: 15px;

    line-height: 1.6;
  }

  .footer {
    text-align: center;

    color: #8a94a5;

    font-size: 9px;

    margin-top: 22px;

    padding-top: 15px;

    border-top:
      1px solid #e5eaf1;
  }

  .page-break {
    page-break-before: always;
  }

  @media print {

    body {
      background: white;
    }

    .page {
      padding: 0;
    }

    .section {
      box-shadow: none;
    }
  }

</style>

</head>

<body>

<div class="page">

  <!-- =================================
       COVER
  ================================== -->

  <div class="cover">

    <div class="brand">
      SMART LIFE
    </div>

    <div class="cover-title">
      Personal Productivity Report
    </div>

    <div class="cover-subtitle">
      Your complete productivity,
      health, schedule and finance
      records in one place.
    </div>

    <div class="generated">

      Generated on
      ${escapeHtml(
        generatedDateText,
      )}
      at
      ${escapeHtml(
        generatedTime,
      )}

    </div>

  </div>


  <!-- =================================
       PROFILE
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      👤 Profile
    </h2>

    <div class="section-subtitle">
      Personal and professional information
    </div>

    <div class="profile-grid">

      <div class="profile-item">
        <div class="profile-label">
          Name
        </div>

        <div class="profile-value">
          ${escapeHtml(
            profile.name ||
              'Not provided',
          )}
        </div>
      </div>


      <div class="profile-item">
        <div class="profile-label">
          Profession
        </div>

        <div class="profile-value">
          ${escapeHtml(
            profile.profession ||
              'Not provided',
          )}
        </div>
      </div>


      <div class="profile-item">
        <div class="profile-label">
          Email
        </div>

        <div class="profile-value">
          ${escapeHtml(
            profile.email ||
              'Not provided',
          )}
        </div>
      </div>


      <div class="profile-item">
        <div class="profile-label">
          Mobile
        </div>

        <div class="profile-value">
          ${escapeHtml(
            profile.mobile ||
              'Not provided',
          )}
        </div>
      </div>


      <div class="profile-item">
        <div class="profile-label">
          Location
        </div>

        <div class="profile-value">
          ${escapeHtml(
            profile.location ||
              'Not provided',
          )}
        </div>
      </div>


      <div class="profile-item">
        <div class="profile-label">
          Daily Goal
        </div>

        <div class="profile-value">
          ${dailyGoal} tasks/day
        </div>
      </div>

    </div>


    ${
      profile.bio
        ? `
          <div class="bio">

            <strong>
              About
            </strong>

            <br />

            ${escapeHtml(
              profile.bio,
            )}

          </div>
        `
        : ''
    }

  </div>


  <!-- =================================
       PRODUCTIVITY SUMMARY
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      ✅ Productivity Summary
    </h2>

    <div class="section-subtitle">
      Overview of your task performance
    </div>

    <div class="stats">

      <div class="stat">

        <div class="stat-value">
          ${totalTasks}
        </div>

        <div class="stat-label">
          Total Tasks
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${completedTasks}
        </div>

        <div class="stat-label">
          Completed
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${pendingTasks}
        </div>

        <div class="stat-label">
          Pending
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${savedTasks}
        </div>

        <div class="stat-label">
          Saved
        </div>

      </div>

    </div>

  </div>


  <!-- =================================
       TODAY GOAL
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      🎯 Today's Goal
    </h2>

    <div class="section-subtitle">
      Your daily productivity progress
    </div>

    <div class="stats">

      <div class="stat">

        <div class="stat-value">
          ${todayCompleted}
        </div>

        <div class="stat-label">
          Completed Today
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${dailyGoal}
        </div>

        <div class="stat-label">
          Daily Goal
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${todayProgress}%
        </div>

        <div class="stat-label">
          Goal Progress
        </div>

      </div>


      <div class="stat">

        <div class="stat-value">
          ${completionRate}%
        </div>

        <div class="stat-label">
          Overall Completion
        </div>

      </div>

    </div>

  </div>


  <!-- =================================
       HEALTH
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      ❤️ Health & Fitness
    </h2>

    <div class="section-subtitle">
      Today's health and activity records
    </div>

    <div class="health-grid">

      <div class="health-item">

        <div class="health-value">
          ${steps.toLocaleString(
            'en-IN',
          )}
        </div>

        <div class="health-label">
          Steps
        </div>

      </div>


      <div class="health-item">

        <div class="health-value">
          ${calories}
        </div>

        <div class="health-label">
          Calories
        </div>

      </div>


      <div class="health-item">

        <div class="health-value">
          ${water}
          ml
        </div>

        <div class="health-label">
          Water Intake
        </div>

      </div>


      <div class="health-item">

        <div class="health-value">
          ${
            weight > 0
              ? `${weight} kg`
              : '—'
          }
        </div>

        <div class="health-label">
          Weight
        </div>

      </div>

    </div>

  </div>


  <!-- =================================
       FINANCE
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      💰 Finance Summary
    </h2>

    <div class="section-subtitle">
      Income, expenses and balance
    </div>

    <div class="finance-grid">

      <div class="finance-card income-card">

        <div class="finance-value income-text">
          ${formatAmount(
            totalIncome,
          )}
        </div>

        <div class="finance-label">
          Total Income
        </div>

      </div>


      <div class="finance-card expense-card">

        <div class="finance-value expense-text">
          ${formatAmount(
            totalExpense,
          )}
        </div>

        <div class="finance-label">
          Total Expenses
        </div>

      </div>


      <div class="finance-card balance-card">

        <div class="finance-value balance-text">
          ${formatAmount(
            balance,
          )}
        </div>

        <div class="finance-label">
          Current Balance
        </div>

      </div>

    </div>

  </div>


  <!-- =================================
       SCHEDULE
  ================================== -->

  <div class="section page-break">

    <h2 class="section-title">
      📅 Calendar & Schedule
    </h2>

    <div class="section-subtitle">
      Scheduled tasks and planned activities
    </div>

    <table>

      <thead>

        <tr>

          <th>
            #
          </th>

          <th>
            Task
          </th>

          <th>
            Category
          </th>

          <th>
            Date
          </th>

          <th>
            Time
          </th>

        </tr>

      </thead>

      <tbody>

        ${createScheduleRows(
          tasks,
        )}

      </tbody>

    </table>

  </div>


  <!-- =================================
       ALL TASKS
  ================================== -->

  <div class="section page-break">

    <h2 class="section-title">
      ✅ All Task Records
    </h2>

    <div class="section-subtitle">
      Complete task history including
      status, category and reminders
    </div>

    <table>

      <thead>

        <tr>

          <th>
            #
          </th>

          <th>
            Task
          </th>

          <th>
            Category
          </th>

          <th>
            Priority
          </th>

          <th>
            Date / Time
          </th>

          <th>
            Status
          </th>

          <th>
            Reminder
          </th>

        </tr>

      </thead>

      <tbody>

        ${createTaskRows(
          tasks,
        )}

      </tbody>

    </table>

  </div>


  <!-- =================================
       FINANCE RECORDS
  ================================== -->

  <div class="section page-break">

    <h2 class="section-title">
      💳 Finance Records
    </h2>

    <div class="section-subtitle">
      Complete income and expense history
    </div>

    <table>

      <thead>

        <tr>

          <th>
            #
          </th>

          <th>
            Transaction
          </th>

          <th>
            Category
          </th>

          <th>
            Date
          </th>

          <th>
            Amount
          </th>

          <th>
            Type
          </th>

        </tr>

      </thead>

      <tbody>

        ${createFinanceRows(
          finance,
        )}

      </tbody>

    </table>

  </div>


  <!-- =================================
       SMART INSIGHT
  ================================== -->

  <div class="section">

    <h2 class="section-title">
      💡 Smart Insight
    </h2>

    <div class="section-subtitle">
      A quick summary of your current records
    </div>

    <div class="insight">

      ${
        completionRate >= 80
          ? `
            Excellent productivity!
            You have completed
            ${completionRate}%
            of your tasks.
            Keep maintaining this
            consistency.
          `
          : completionRate >= 50
            ? `
              You are making good progress.
              Your current task completion
              rate is
              ${completionRate}%.
              Keep focusing on your
              highest-priority tasks.
            `
            : `
              You have room to improve
              your productivity.
              Start by completing your
              most important pending task
              and build momentum.
            `
      }

      <br /><br />

      Your health records show
      ${steps.toLocaleString(
        'en-IN',
      )}
      steps and
      ${water}
      ml of water recorded today.

      <br /><br />

      Financially, your recorded
      balance is
      ${formatAmount(
        balance,
      )}.

    </div>

  </div>


  <!-- =================================
       FOOTER
  ================================== -->

  <div class="footer">

    Smart Life • Organize your day.
    Conquer your goals.

    <br />

    This report was generated
    automatically from your Smart Life
    app records.

  </div>

</div>

</body>

</html>
      `;

      /*
       * CREATE PDF
       */

      const pdf =
        await Print.printToFileAsync({
          html,
          base64: false,
        });

      if (!pdf.uri) {
        throw new Error(
          'PDF file could not be created.',
        );
      }

      /*
       * CHECK SHARE AVAILABILITY
       */

      const canShare =
        await Sharing.isAvailableAsync();

      if (!canShare) {
        throw new Error(
          'Sharing is not available on this device.',
        );
      }

      /*
       * OPEN NATIVE SHARE SHEET
       *
       * This allows the user to choose:
       *
       * WhatsApp
       * Gmail
       * Email
       * Messages
       * Google Drive
       * etc.
       */

      await Sharing.shareAsync(
        pdf.uri,
        {
          mimeType:
            'application/pdf',

          dialogTitle:
            'Share Smart Life Report',

          UTI:
            'com.adobe.pdf',
        },
      );
    } catch (error) {
      console.log(
        'Share all records error:',
        error,
      );

      if (
        Platform.OS === 'web'
      ) {
        if (
          typeof window !==
          'undefined'
        ) {
          window.alert(
            'Unable to create the PDF report.',
          );
        }
      } else {
        /*
         * Avoid importing Alert at the
         * top because this utility can
         * be used from different pages.
         */

        const message =
          error instanceof Error
            ? error.message
            : 'Unable to create or share the PDF report.';

        console.log(
          'PDF sharing message:',
          message,
        );

        throw error;
      }
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default shareAllRecords;