
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useTasks } from '../context/TaskContext';

const PROFILE_KEY = 'smart_todo_profile';
const SETTINGS_KEY = 'smart_todo_settings';
const HEALTH_KEY = 'smart_health_fitness';
const FINANCE_KEY = 'smart_todo_finance_transactions';

type Appearance = 'System' | 'Light' | 'Dark';

type ProfileData = {
  name: string;
  profession: string;
  email: string;
  mobile: string;
  location: string;
  bio: string;
  linkedin: string;
  github: string;
  portfolio: string;
  dailyGoal: string;
  profileImage: string;
};

type SettingsData = {
  notifications: boolean;
  appearance: Appearance;
};

type HealthData = {
  steps: number;
  water: number;
  calories: number;
  weight: number;
  date: string;
};

type FinanceTransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note?: string;
  createdAt: string;
};

const defaultProfile: ProfileData = {
  name: '',
  profession: '',
  email: '',
  mobile: '',
  location: '',
  bio: '',
  linkedin: '',
  github: '',
  portfolio: '',
  dailyGoal: '5',
  profileImage: '',
};

const defaultSettings: SettingsData = {
  notifications: true,
  appearance: 'System',
};

const COLORS = {
  primary: '#126EED',
  primaryDark: '#0B56C7',
  background: '#F4F7FB',
  card: '#FFFFFF',
  text: '#152238',
  muted: '#718096',
  border: '#E5EAF1',
  green: '#16A34A',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#7C3AED',
  pink: '#EC4899',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { tasks } = useTasks();

  const isWeb = Platform.OS === 'web';
  const isWide = width >= 850;

  const [profile, setProfile] =
    useState<ProfileData>(defaultProfile);

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [editing, setEditing] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  /* =========================================
     LOAD PROFILE
  ========================================= */

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile =
        await AsyncStorage.getItem(PROFILE_KEY);

      const savedSettings =
        await AsyncStorage.getItem(SETTINGS_KEY);

      if (savedProfile) {
        setProfile({
          ...defaultProfile,
          ...JSON.parse(savedProfile),
        });
      }

      if (savedSettings) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        });
      }
    } catch (error) {
      console.log(
        'Profile loading error:',
        error,
      );
    }
  };

  /* =========================================
     BACK
  ========================================= */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/task' as any);
    }
  };

  /* =========================================
     UPDATE PROFILE
  ========================================= */

  const updateProfile = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K],
  ) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /* =========================================
     SAVE
  ========================================= */

  const saveProfile = async () => {
    try {
      setSaving(true);

      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile),
      );

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings),
      );

      setEditing(false);

      if (isWeb) {
        window.alert(
          'Profile saved successfully!',
        );
      } else {
        Alert.alert(
          'Profile Saved',
          'Your profile has been updated successfully.',
        );
      }
    } catch (error) {
      console.log(
        'Save profile error:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const resetProfile = () => {
    const performReset = async () => {
      try {
        await AsyncStorage.removeItem(
          PROFILE_KEY,
        );

        await AsyncStorage.removeItem(
          SETTINGS_KEY,
        );

        setProfile(defaultProfile);
        setSettings(defaultSettings);
        setEditing(false);

        if (isWeb) {
          window.alert(
            'Profile has been reset.',
          );
        } else {
          Alert.alert(
            'Profile Reset',
            'Your profile information has been reset.',
          );
        }
      } catch (error) {
        console.log(
          'Reset error:',
          error,
        );
      }
    };

    if (isWeb) {
      const confirmed =
        window.confirm(
          'Are you sure you want to reset your profile?',
        );

      if (confirmed) {
        performReset();
      }
    } else {
      Alert.alert(
        'Reset Profile',
        'Are you sure you want to reset your profile?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: performReset,
          },
        ],
      );
    }
  };

  /* =========================================
     PROFILE IMAGE
  ========================================= */

  const pickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (isWeb) {
          window.alert(
            'Please allow photo access to select a profile picture.',
          );
        } else {
          Alert.alert(
            'Permission Required',
            'Please allow photo access to select a profile picture.',
          );
        }

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        updateProfile(
          'profileImage',
          result.assets[0].uri,
        );
      }
    } catch (error) {
      console.log(
        'Image picker error:',
        error,
      );
    }
  };

  /* =========================================
     OPEN LINK
  ========================================= */

  const openLink = async (url: string) => {
    if (!url.trim()) {
      return;
    }

    let finalUrl = url.trim();

    if (
      !finalUrl.startsWith('http://') &&
      !finalUrl.startsWith('https://')
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      await Linking.openURL(finalUrl);
    } catch (error) {
      console.log(
        'Link opening error:',
        error,
      );
    }
  };

  /* =========================================
     TASK STATISTICS
  ========================================= */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed,
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed,
  ).length;

  const savedTasks = tasks.filter(
    (task) => task.saved,
  ).length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100,
        );

  const todayKey = new Date()
    .toISOString()
    .slice(0, 10);

  const todayTasks = tasks.filter(
    (task) =>
      String(task.date || '').slice(0, 10) ===
      todayKey,
  );

  const todayCompleted =
    todayTasks.filter(
      (task) => task.completed,
    ).length;

  const todayGoal = Math.max(
    Number(profile.dailyGoal) || 5,
    1,
  );

  const goalProgress = Math.min(
    Math.round(
      (todayCompleted / todayGoal) * 100,
    ),
    100,
  );

  /* =========================================
     ACHIEVEMENTS
  ========================================= */

  const achievements = useMemo(() => {
    return [
      {
        icon: 'rocket-outline',
        title: 'Task Starter',
        description:
          'Created your first task',
        unlocked: totalTasks >= 1,
      },
      {
        icon: 'checkmark-circle-outline',
        title: 'Task Finisher',
        description:
          'Completed your first task',
        unlocked: completedTasks >= 1,
      },
      {
        icon: 'trophy-outline',
        title: 'Productive Mind',
        description:
          'Completed 10 tasks',
        unlocked: completedTasks >= 10,
      },
      {
        icon: 'flame-outline',
        title: 'Consistency',
        description:
          'Completed 20 tasks',
        unlocked: completedTasks >= 20,
      },
    ];
  }, [
    totalTasks,
    completedTasks,
  ]);

  /* =========================================
     PROFILE COMPLETION
  ========================================= */

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.name,
      profile.profession,
      profile.email,
      profile.mobile,
      profile.location,
      profile.bio,
      profile.profileImage,
    ];

    const completed = fields.filter(
      (item) =>
        String(item || '').trim().length > 0,
    ).length;

    return Math.round(
      (completed / fields.length) * 100,
    );
  }, [profile]);

  /* =========================================
     APPEARANCE
  ========================================= */

  const selectedAppearance =
    settings.appearance;

  const setAppearance = (
    value: Appearance,
  ) => {
    setSettings((previous) => ({
      ...previous,
      appearance: value,
    }));

    setThemeModal(false);
  };

  /* =========================================
     HTML ESCAPE
  ========================================= */

  const escapeHtml = (
    value: unknown,
  ) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  /* =========================================
     MONEY
  ========================================= */

  const formatMoney = (
    amount: number,
  ) => {
    return `₹${Number(
      amount || 0,
    ).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (
    value: unknown,
  ) => {
    const text = String(
      value || '',
    );

    if (!text) {
      return '-';
    }

    const date = new Date(text);

    if (Number.isNaN(date.getTime())) {
      return text;
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

  /* =========================================
     SHARE ALL RECORDS AS PDF
  ========================================= */

  const shareAllRecords = async () => {
    if (sharing) {
      return;
    }

    try {
      setSharing(true);

      /* -------------------------------------
         HEALTH
      ------------------------------------- */

      let health: HealthData = {
        steps: 0,
        water: 0,
        calories: 0,
        weight: 60,
        date: todayKey,
      };

      const savedHealth =
        await AsyncStorage.getItem(
          HEALTH_KEY,
        );

      if (savedHealth) {
        try {
          health = {
            ...health,
            ...JSON.parse(savedHealth),
          };
        } catch (error) {
          console.log(
            'Health parsing error:',
            error,
          );
        }
      }

      /* -------------------------------------
         FINANCE
      ------------------------------------- */

      let financeTransactions:
        FinanceTransaction[] = [];

      const savedFinance =
        await AsyncStorage.getItem(
          FINANCE_KEY,
        );

      if (savedFinance) {
        try {
          const parsed =
            JSON.parse(savedFinance);

          if (Array.isArray(parsed)) {
            financeTransactions =
              parsed;
          }
        } catch (error) {
          console.log(
            'Finance parsing error:',
            error,
          );
        }
      }

      const income =
        financeTransactions
          .filter(
            (item) =>
              item.type === 'income',
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0,
              ),
            0,
          );

      const expenses =
        financeTransactions
          .filter(
            (item) =>
              item.type === 'expense',
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0,
              ),
            0,
          );

      const balance =
        income - expenses;

      /* -------------------------------------
         SORT TASKS
      ------------------------------------- */

      const sortedTasks =
        [...tasks].sort(
          (a, b) => {
            const dateA =
              String(
                a.date || '',
              );

            const dateB =
              String(
                b.date || '',
              );

            const dateCompare =
              dateA.localeCompare(
                dateB,
              );

            if (
              dateCompare !== 0
            ) {
              return dateCompare;
            }

            return String(
              a.time || '',
            ).localeCompare(
              String(
                b.time || '',
              ),
            );
          },
        );

      /* -------------------------------------
         ALL TASK ROWS
      ------------------------------------- */

      const taskRows =
        sortedTasks.length > 0
          ? sortedTasks
              .map((task) => {
                const status =
                  task.completed
                    ? 'Completed'
                    : 'Pending';

                return `
                  <tr>
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
                      ${escapeHtml(
                        formatDate(
                          task.date,
                        ),
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        task.time ||
                          '-',
                      )}
                    </td>

                    <td>
                      <span class="${
                        task.completed
                          ? 'status completed'
                          : 'status pending'
                      }">
                        ${status}
                      </span>
                    </td>
                  </tr>
                `;
              })
              .join('')
          : `
              <tr>
                <td
                  colspan="5"
                  class="empty"
                >
                  No tasks available
                </td>
              </tr>
            `;

      /* -------------------------------------
         TODAY TASKS
      ------------------------------------- */

      const todayTaskRows =
        todayTasks.length > 0
          ? todayTasks
              .map(
                (task) => `
                  <div class="mini-task">
                    <div>
                      <strong>
                        ${escapeHtml(
                          task.title ||
                            'Untitled Task',
                        )}
                      </strong>

                      <span>
                        ${escapeHtml(
                          task.category ||
                            'Personal',
                        )}

                        ${
                          task.time
                            ? ` • ${escapeHtml(
                                task.time,
                              )}`
                            : ''
                        }
                      </span>
                    </div>

                    <b class="${
                      task.completed
                        ? 'green-text'
                        : 'orange-text'
                    }">
                      ${
                        task.completed
                          ? 'Completed'
                          : 'Pending'
                      }
                    </b>
                  </div>
                `,
              )
              .join('')
          : `
              <div class="empty-box">
                No tasks scheduled for today.
              </div>
            `;

      /* -------------------------------------
         CALENDAR / SCHEDULE ROWS
      ------------------------------------- */

      const scheduleRows =
        sortedTasks.length > 0
          ? sortedTasks
              .map(
                (task) => `
                  <tr>
                    <td>
                      ${escapeHtml(
                        formatDate(
                          task.date,
                        ),
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        task.time ||
                          '-',
                      )}
                    </td>

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
                      ${
                        task.completed
                          ? 'Completed'
                          : 'Pending'
                      }
                    </td>
                  </tr>
                `,
              )
              .join('')
          : `
              <tr>
                <td
                  colspan="5"
                  class="empty"
                >
                  No schedule records available
                </td>
              </tr>
            `;

      /* -------------------------------------
         FINANCE ROWS
      ------------------------------------- */

      const financeRows =
        financeTransactions.length > 0
          ? financeTransactions
              .slice()
              .sort((a, b) =>
                String(
                  b.date || '',
                ).localeCompare(
                  String(
                    a.date || '',
                  ),
                ),
              )
              .map(
                (transaction) => {
                  const isIncome =
                    transaction.type ===
                    'income';

                  return `
                    <tr>
                      <td>
                        ${escapeHtml(
                          transaction.title ||
                            'Transaction',
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          transaction.category ||
                            'Other',
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          formatDate(
                            transaction.date,
                          ),
                        )}
                      </td>

                      <td class="${
                        isIncome
                          ? 'income'
                          : 'expense'
                      }">
                        ${
                          isIncome
                            ? '+'
                            : '-'
                        }${formatMoney(
                          Number(
                            transaction.amount ||
                              0,
                          ),
                        )}
                      </td>
                    </tr>
                  `;
                },
              )
              .join('')
          : `
              <tr>
                <td
                  colspan="4"
                  class="empty"
                >
                  No finance records available
                </td>
              </tr>
            `;

      /* -------------------------------------
         GENERATED DATE
      ------------------------------------- */

      const generatedDate =
        new Date().toLocaleString(
          'en-IN',
          {
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        );

      /* -------------------------------------
         PDF HTML
      ------------------------------------- */

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
  Smart Life Report
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  background: #f4f7fb;
  color: #152238;
}

.page {
  padding: 30px;
}

.hero {
  background:
    linear-gradient(
      135deg,
      #126eed,
      #7c3aed
    );
  color: white;
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 24px;
}

.brand {
  font-size: 29px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.92;
  margin-top: 6px;
}

.generated {
  margin-top: 18px;
  font-size: 11px;
  opacity: 0.82;
}

.profile-box {
  background: white;
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 22px;
  border: 1px solid #e5eaf1;
}

.profile-name {
  font-size: 23px;
  font-weight: 900;
}

.profile-profession {
  color: #126eed;
  font-weight: 700;
  margin-top: 5px;
}

.profile-line {
  font-size: 12px;
  color: #718096;
  margin-top: 6px;
}

.section-title {
  font-size: 19px;
  font-weight: 900;
  margin-top: 25px;
  margin-bottom: 12px;
}

.stats,
.health-grid,
.finance-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat,
.health-card,
.finance-card {
  flex: 1;
  min-width: 130px;
  background: white;
  border: 1px solid #e5eaf1;
  border-radius: 15px;
  padding: 16px;
}

.stat-value {
  font-size: 23px;
  font-weight: 900;
  color: #126eed;
}

.stat-label,
.health-label,
.finance-label {
  font-size: 11px;
  color: #718096;
  margin-top: 5px;
}

.health-value,
.finance-value {
  font-size: 20px;
  font-weight: 900;
}

.summary {
  background: #eaf3ff;
  border: 1px solid #cfe2ff;
  border-radius: 17px;
  padding: 20px;
  margin-top: 20px;
}

.summary-title {
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 10px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e5eaf1;
}

th {
  background: #eef5ff;
  color: #152238;
  font-size: 10px;
  text-align: left;
  padding: 11px;
}

td {
  border-top: 1px solid #edf0f5;
  padding: 10px;
  font-size: 10px;
  color: #4e5969;
}

.status {
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 800;
}

.completed {
  background: #e9f9ef;
  color: #16a34a;
}

.pending {
  background: #fff6e2;
  color: #d97706;
}

.income {
  color: #16a34a;
  font-weight: 900;
}

.expense {
  color: #ef4444;
  font-weight: 900;
}

.mini-task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e5eaf1;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
}

.mini-task strong {
  display: block;
  font-size: 12px;
}

.mini-task span {
  display: block;
  color: #718096;
  font-size: 10px;
  margin-top: 3px;
}

.green-text {
  color: #16a34a;
  font-size: 10px;
}

.orange-text {
  color: #f59e0b;
  font-size: 10px;
}

.empty,
.empty-box {
  color: #8b95a5;
  text-align: center;
  padding: 18px;
}

.empty-box {
  background: white;
  border: 1px solid #e5eaf1;
  border-radius: 13px;
  font-size: 12px;
}

.footer {
  text-align: center;
  color: #9aa3b2;
  font-size: 10px;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #e5eaf1;
}

@media print {

  body {
    background: white;
  }

  .page {
    padding: 15px;
  }

  .section-title {
    break-after: avoid;
  }

  table {
    break-inside: auto;
  }

  tr {
    break-inside: avoid;
  }

}

</style>

</head>

<body>

<div class="page">

  <!-- HERO -->

  <div class="hero">

    <div class="brand">
      SMART LIFE
    </div>

    <div class="subtitle">
      Personal Productivity & Life Report
    </div>

    <div class="generated">
      Generated on
      ${escapeHtml(
        generatedDate,
      )}
    </div>

  </div>


  <!-- PROFILE -->

  <div class="section-title">
    Profile
  </div>

  <div class="profile-box">

    <div class="profile-name">
      ${escapeHtml(
        profile.name ||
          'Smart Life User',
      )}
    </div>

    <div class="profile-profession">
      ${escapeHtml(
        profile.profession ||
          'Productivity Enthusiast',
      )}
    </div>

    <div class="profile-line">
      Email:
      ${escapeHtml(
        profile.email || '-',
      )}
    </div>

    <div class="profile-line">
      Mobile:
      ${escapeHtml(
        profile.mobile || '-',
      )}
    </div>

    <div class="profile-line">
      Location:
      ${escapeHtml(
        profile.location || '-',
      )}
    </div>

    <div class="profile-line">
      Daily Goal:
      ${escapeHtml(
        profile.dailyGoal || '5',
      )}
      tasks
    </div>

    ${
      profile.bio
        ? `
          <div class="profile-line">
            About:
            ${escapeHtml(
              profile.bio,
            )}
          </div>
        `
        : ''
    }

  </div>


  <!-- TASK SUMMARY -->

  <div class="section-title">
    Task Summary
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
        Saved Tasks
      </div>
    </div>

  </div>


  <!-- PRODUCTIVITY -->

  <div class="summary">

    <div class="summary-title">
      Productivity Performance
    </div>

    <div class="summary-line">
      <span>
        Completion Rate
      </span>

      <strong>
        ${completionRate}%
      </strong>
    </div>

    <div class="summary-line">
      <span>
        Today's Completed
      </span>

      <strong>
        ${todayCompleted}
      </strong>
    </div>

    <div class="summary-line">
      <span>
        Today's Goal
      </span>

      <strong>
        ${todayGoal}
      </strong>
    </div>

    <div class="summary-line">
      <span>
        Goal Progress
      </span>

      <strong>
        ${goalProgress}%
      </strong>
    </div>

  </div>


  <!-- TODAY -->

  <div class="section-title">
    Today's Tasks
  </div>

  ${todayTaskRows}


  <!-- CALENDAR -->

  <div class="section-title">
    Calendar / Schedule Records
  </div>

  <table>

    <thead>

      <tr>

        <th>
          Date
        </th>

        <th>
          Time
        </th>

        <th>
          Task
        </th>

        <th>
          Category
        </th>

        <th>
          Status
        </th>

      </tr>

    </thead>

    <tbody>

      ${scheduleRows}

    </tbody>

  </table>


  <!-- ALL TASKS -->

  <div class="section-title">
    All Task Records
  </div>

  <table>

    <thead>

      <tr>

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

        <th>
          Status
        </th>

      </tr>

    </thead>

    <tbody>

      ${taskRows}

    </tbody>

  </table>


  <!-- HEALTH -->

  <div class="section-title">
    Health & Fitness
  </div>

  <div class="health-grid">

    <div class="health-card">

      <div class="health-value">
        ${Number(
          health.steps || 0,
        ).toLocaleString()}
      </div>

      <div class="health-label">
        Steps
      </div>

    </div>

    <div class="health-card">

      <div class="health-value">
        ${Number(
          health.calories || 0,
        ).toLocaleString()}
      </div>

      <div class="health-label">
        Calories Burned
      </div>

    </div>

    <div class="health-card">

      <div class="health-value">
        ${Number(
          health.water || 0,
        ).toLocaleString()}
        ml
      </div>

      <div class="health-label">
        Water Intake
      </div>

    </div>

    <div class="health-card">

      <div class="health-value">
        ${Number(
          health.weight || 0,
        )}
        kg
      </div>

      <div class="health-label">
        Weight
      </div>

    </div>

  </div>


  <!-- HEALTH SUMMARY -->

  <div class="summary">

    <div class="summary-title">
      Health Progress
    </div>

    <div class="summary-line">

      <span>
        Step Goal
      </span>

      <strong>
        10,000
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Steps Completed
      </span>

      <strong>
        ${Number(
          health.steps || 0,
        ).toLocaleString()}
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Water Goal
      </span>

      <strong>
        2,500 ml
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Water Intake
      </span>

      <strong>
        ${Number(
          health.water || 0,
        ).toLocaleString()}
        ml
      </strong>

    </div>

  </div>


  <!-- FINANCE -->

  <div class="section-title">
    Finance Summary
  </div>

  <div class="finance-grid">

    <div class="finance-card">

      <div
        class="finance-value income"
      >
        ${formatMoney(income)}
      </div>

      <div class="finance-label">
        Total Income
      </div>

    </div>

    <div class="finance-card">

      <div
        class="finance-value expense"
      >
        ${formatMoney(expenses)}
      </div>

      <div class="finance-label">
        Total Expenses
      </div>

    </div>

    <div class="finance-card">

      <div class="finance-value">
        ${formatMoney(balance)}
      </div>

      <div class="finance-label">
        Current Balance
      </div>

    </div>

    <div class="finance-card">

      <div class="finance-value">
        ${financeTransactions.length}
      </div>

      <div class="finance-label">
        Transactions
      </div>

    </div>

  </div>


  <!-- FINANCE RECORDS -->

  <div class="section-title">
    Finance Records
  </div>

  <table>

    <thead>

      <tr>

        <th>
          Title
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

      </tr>

    </thead>

    <tbody>

      ${financeRows}

    </tbody>

  </table>


  <!-- FINAL SUMMARY -->

  <div class="summary">

    <div class="summary-title">
      Smart Life Summary
    </div>

    <div class="summary-line">

      <span>
        Profile Completion
      </span>

      <strong>
        ${profileCompletion}%
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Task Completion
      </span>

      <strong>
        ${completionRate}%
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Steps Today
      </span>

      <strong>
        ${Number(
          health.steps || 0,
        ).toLocaleString()}
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Water Today
      </span>

      <strong>
        ${Number(
          health.water || 0,
        ).toLocaleString()}
        ml
      </strong>

    </div>

    <div class="summary-line">

      <span>
        Finance Balance
      </span>

      <strong>
        ${formatMoney(balance)}
      </strong>

    </div>

  </div>


  <div class="footer">

    Smart Life • Organize your day.
    Conquer your goals.

    <br />

    Generated automatically from
    your Smart Life records.

  </div>

</div>

</body>

</html>
`;

      /* =====================================
         WEB
      ===================================== */

      if (Platform.OS === 'web') {
        const printWindow =
          window.open(
            '',
            '_blank',
          );

        if (printWindow) {
          printWindow.document.write(
            html,
          );

          printWindow.document.close();

          printWindow.focus();

          setTimeout(() => {
            printWindow.print();
          }, 600);
        } else {
          window.alert(
            'Please allow pop-ups to generate your PDF report.',
          );
        }

        return;
      }

      /* =====================================
         GENERATE PDF
      ===================================== */

      const { uri } =
        await Print.printToFileAsync({
          html,
          base64: false,
        });

      /* =====================================
         SHARE PDF
      ===================================== */

      const canShare =
        await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          'Sharing Not Available',
          'Your device does not currently support the system share sheet.',
        );

        return;
      }

      await Sharing.shareAsync(
        uri,
        {
          mimeType:
            'application/pdf',

          dialogTitle:
            'Share Smart Life Report',

          UTI: 'com.adobe.pdf',
        },
      );

    } catch (error) {
      console.log(
        'PDF sharing error:',
        error,
      );

      if (isWeb) {
        window.alert(
          'Unable to generate the PDF report. Please try again.',
        );
      } else {
        Alert.alert(
          'PDF Error',
          'Unable to generate or share the PDF report. Please try again.',
        );
      }
    } finally {
      setSharing(false);
    }
  };

  /* =========================================
     INPUT
  ========================================= */

  const renderInput = (
    label: string,
    value: string,
    key: keyof ProfileData,
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    multiline = false,
    keyboardType:
      | 'default'
      | 'email-address'
      | 'phone-pad'
      | 'url' = 'default',
  ) => {
    return (
      <View style={styles.inputGroup}>

        <Text style={styles.inputLabel}>
          {label}
        </Text>

        <View
          style={[
            styles.inputWrapper,
            multiline &&
              styles.multilineWrapper,
          ]}
        >

          <Ionicons
            name={icon}
            size={19}
            color={COLORS.muted}
            style={styles.inputIcon}
          />

          <TextInput
            value={value}
            onChangeText={(text) =>
              updateProfile(
                key,
                text,
              )
            }
            placeholder={placeholder}
            placeholderTextColor="#A0A9B8"
            editable={editing}
            multiline={multiline}
            keyboardType={
              keyboardType
            }
            autoCapitalize="none"
            style={[
              styles.input,
              multiline &&
                styles.multilineInput,
              !editing &&
                styles.disabledInput,
            ]}
          />

        </View>

      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        <View
          style={[
            styles.container,
            isWide &&
              styles.wideContainer,
          ]}
        >

          {/* =================================
              HEADER
          ================================= */}

          <View style={styles.header}>

            <View
              style={
                styles.headerLeft
              }
            >

              <TouchableOpacity
                onPress={handleBack}
                style={
                  styles.backButton
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={
                    COLORS.text
                  }
                />

              </TouchableOpacity>

              <View>

                <Text
                  style={
                    styles.headerTitle
                  }
                >
                  My Profile
                </Text>

                <Text
                  style={
                    styles.headerSubtitle
                  }
                >
                  Manage your personal
                  productivity profile
                </Text>

              </View>

            </View>

            <TouchableOpacity
              onPress={() =>
                setEditing(
                  (previous) =>
                    !previous,
                )
              }
              style={[
                styles.editButton,
                editing &&
                  styles.cancelButton,
              ]}
              activeOpacity={0.8}
            >

              <Ionicons
                name={
                  editing
                    ? 'close-outline'
                    : 'create-outline'
                }
                size={19}
                color={
                  editing
                    ? COLORS.text
                    : '#FFFFFF'
                }
              />

              <Text
                style={[
                  styles.editButtonText,
                  editing &&
                    styles.cancelButtonText,
                ]}
              >
                {editing
                  ? 'Cancel'
                  : 'Edit Profile'}
              </Text>

            </TouchableOpacity>

          </View>


          {/* =================================
              PROFILE HERO
          ================================= */}

          <View
            style={
              styles.heroCard
            }
          >

            <View
              style={
                styles.profileTop
              }
            >

              <View
                style={
                  styles.avatarContainer
                }
              >

                {profile.profileImage ? (
                  <Image
                    source={{
                      uri:
                        profile.profileImage,
                    }}
                    style={
                      styles.avatar
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.avatarPlaceholder
                    }
                  >

                    <Ionicons
                      name="person"
                      size={48}
                      color="#FFFFFF"
                    />

                  </View>
                )}

                {editing && (
                  <TouchableOpacity
                    onPress={
                      pickProfileImage
                    }
                    style={
                      styles.cameraButton
                    }
                    activeOpacity={
                      0.8
                    }
                  >

                    <Ionicons
                      name="camera"
                      size={17}
                      color="#FFFFFF"
                    />

                  </TouchableOpacity>
                )}

              </View>


              <View
                style={
                  styles.heroInfo
                }
              >

                <Text
                  style={
                    styles.profileName
                  }
                >
                  {profile.name ||
                    'Your Name'}
                </Text>

                <Text
                  style={
                    styles.profileProfession
                  }
                >
                  {profile.profession ||
                    'Your Profession'}
                </Text>

                <View
                  style={
                    styles.profileMeta
                  }
                >

                  <View
                    style={
                      styles.metaItem
                    }
                  >

                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={
                        COLORS.muted
                      }
                    />

                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {profile.location ||
                        'Add your location'}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.metaItem
                    }
                  >

                    <Ionicons
                      name="mail-outline"
                      size={15}
                      color={
                        COLORS.muted
                      }
                    />

                    <Text
                      style={
                        styles.metaText
                      }
                      numberOfLines={1}
                    >
                      {profile.email ||
                        'Add your email'}
                    </Text>

                  </View>

                </View>

              </View>

            </View>


            {/* PROFILE COMPLETION */}

            <View
              style={
                styles.completionBox
              }
            >

              <View
                style={
                  styles.completionHeader
                }
              >

                <View>

                  <Text
                    style={
                      styles.completionTitle
                    }
                  >
                    Profile Completion
                  </Text>

                  <Text
                    style={
                      styles.completionSubtitle
                    }
                  >
                    Keep your profile
                    complete
                  </Text>

                </View>

                <Text
                  style={
                    styles.completionPercent
                  }
                >
                  {profileCompletion}%
                </Text>

              </View>

              <View
                style={
                  styles.progressTrack
                }
              >

                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${profileCompletion}%`,
                    },
                  ]}
                />

              </View>

            </View>

          </View>


          {/* =================================
              PRODUCTIVITY OVERVIEW
          ================================= */}

          <View
            style={
              styles.sectionHeader
            }
          >

            <View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Productivity Overview
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Your current task
                performance
              </Text>

            </View>

          </View>


          <View
            style={[
              styles.statsGrid,
              isWide &&
                styles.statsGridWide,
            ]}
          >

            <StatCard
              icon="list-outline"
              value={totalTasks}
              label="Total Tasks"
              iconColor={
                COLORS.primary
              }
            />

            <StatCard
              icon="checkmark-done-outline"
              value={
                completedTasks
              }
              label="Completed"
              iconColor={
                COLORS.green
              }
            />

            <StatCard
              icon="time-outline"
              value={
                pendingTasks
              }
              label="Pending"
              iconColor={
                COLORS.orange
              }
            />

            <StatCard
              icon="bookmark-outline"
              value={
                savedTasks
              }
              label="Saved Tasks"
              iconColor={
                COLORS.purple
              }
            />

          </View>


          {/* =================================
              PRODUCTIVITY SCORE
          ================================= */}

          <View
            style={
              styles.scoreCard
            }
          >

            <View
              style={
                styles.scoreIcon
              }
            >

              <Ionicons
                name="trending-up-outline"
                size={26}
                color="#FFFFFF"
              />

            </View>

            <View
              style={
                styles.scoreContent
              }
            >

              <Text
                style={
                  styles.scoreTitle
                }
              >
                Productivity Score
              </Text>

              <Text
                style={
                  styles.scoreDescription
                }
              >
                {completionRate >=
                80
                  ? 'Excellent! You are crushing your goals.'
                  : completionRate >=
                      50
                    ? 'Great progress! Keep going.'
                    : totalTasks ===
                        0
                      ? 'Create your first task to get started.'
                      : 'Keep completing tasks to improve your score.'}
              </Text>

            </View>

            <Text
              style={
                styles.scoreValue
              }
            >
              {completionRate}%
            </Text>

          </View>


          {/* =================================
              PERSONAL INFORMATION
          ================================= */}

          <SectionHeader
            title="Personal Information"
            subtitle="Keep your details updated"
          />

          <View
            style={
              styles.card
            }
          >

            {renderInput(
              'Full Name',
              profile.name,
              'name',
              'Enter your full name',
              'person-outline',
            )}

            {renderInput(
              'Profession',
              profile.profession,
              'profession',
              'e.g. Frontend Developer',
              'briefcase-outline',
            )}

            {renderInput(
              'Email Address',
              profile.email,
              'email',
              'your@email.com',
              'mail-outline',
              false,
              'email-address',
            )}

            {renderInput(
              'Mobile Number',
              profile.mobile,
              'mobile',
              '+91 XXXXX XXXXX',
              'call-outline',
              false,
              'phone-pad',
            )}

            {renderInput(
              'Location',
              profile.location,
              'location',
              'City, State, Country',
              'location-outline',
            )}

            {renderInput(
              'About You',
              profile.bio,
              'bio',
              'Write a short professional bio...',
              'document-text-outline',
              true,
            )}

          </View>


          {/* =================================
              PROFESSIONAL LINKS
          ================================= */}

          <SectionHeader
            title="Professional Links"
            subtitle="Connect your professional profiles"
          />

          <View
            style={
              styles.card
            }
          >

            {renderInput(
              'LinkedIn',
              profile.linkedin,
              'linkedin',
              'https://linkedin.com/in/...',
              'logo-linkedin',
              false,
              'url',
            )}

            {renderInput(
              'GitHub',
              profile.github,
              'github',
              'https://github.com/...',
              'logo-github',
              false,
              'url',
            )}

            {renderInput(
              'Portfolio',
              profile.portfolio,
              'portfolio',
              'https://yourportfolio.com',
              'globe-outline',
              false,
              'url',
            )}

            <View
              style={
                styles.linksPreview
              }
            >

              {profile.linkedin ? (
                <TouchableOpacity
                  style={
                    styles.linkButton
                  }
                  onPress={() =>
                    openLink(
                      profile.linkedin,
                    )
                  }
                >

                  <Ionicons
                    name="logo-linkedin"
                    size={19}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.linkButtonText
                    }
                  >
                    LinkedIn
                  </Text>

                </TouchableOpacity>
              ) : null}

              {profile.github ? (
                <TouchableOpacity
                  style={
                    styles.linkButton
                  }
                  onPress={() =>
                    openLink(
                      profile.github,
                    )
                  }
                >

                  <Ionicons
                    name="logo-github"
                    size={19}
                    color={
                      COLORS.text
                    }
                  />

                  <Text
                    style={
                      styles.linkButtonText
                    }
                  >
                    GitHub
                  </Text>

                </TouchableOpacity>
              ) : null}

              {profile.portfolio ? (
                <TouchableOpacity
                  style={
                    styles.linkButton
                  }
                  onPress={() =>
                    openLink(
                      profile.portfolio,
                    )
                  }
                >

                  <Ionicons
                    name="globe-outline"
                    size={19}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.linkButtonText
                    }
                  >
                    Portfolio
                  </Text>

                </TouchableOpacity>
              ) : null}

            </View>

          </View>


          {/* =================================
              DAILY GOAL
          ================================= */}

          <SectionHeader
            title="Daily Productivity Goal"
            subtitle="Set how many tasks you want to complete every day"
          />

          <View
            style={
              styles.goalCard
            }
          >

            <View
              style={
                styles.goalTop
              }
            >

              <View
                style={
                  styles.goalIcon
                }
              >

                <Ionicons
                  name="flag-outline"
                  size={25}
                  color={
                    COLORS.primary
                  }
                />

              </View>

              <View
                style={
                  styles.goalInfo
                }
              >

                <Text
                  style={
                    styles.goalTitle
                  }
                >
                  Today's Goal
                </Text>

                <Text
                  style={
                    styles.goalSubtitle
                  }
                >
                  {todayCompleted} of{' '}
                  {todayGoal} tasks
                  completed
                </Text>

              </View>

              {editing ? (
                <TextInput
                  value={
                    profile.dailyGoal
                  }
                  onChangeText={(
                    text,
                  ) =>
                    updateProfile(
                      'dailyGoal',
                      text.replace(
                        /[^0-9]/g,
                        '',
                      ),
                    )
                  }
                  keyboardType="number-pad"
                  style={
                    styles.goalInput
                  }
                  maxLength={2}
                />
              ) : (
                <Text
                  style={
                    styles.goalNumber
                  }
                >
                  {todayGoal}
                </Text>
              )}

            </View>

            <View
              style={
                styles.goalTrack
              }
            >

              <View
                style={[
                  styles.goalFill,
                  {
                    width: `${goalProgress}%`,
                  },
                ]}
              />

            </View>

            <View
              style={
                styles.goalFooter
              }
            >

              <Text
                style={
                  styles.goalFooterText
                }
              >
                {goalProgress}%
                completed
              </Text>

              <Text
                style={
                  styles.goalFooterText
                }
              >
                {Math.max(
                  todayGoal -
                    todayCompleted,
                  0,
                )}{' '}
                remaining
              </Text>

            </View>

          </View>


          {/* =================================
              ACHIEVEMENTS
          ================================= */}

          <SectionHeader
            title="Achievements"
            subtitle="Milestones you have unlocked"
          />

          <View
            style={
              styles.achievementGrid
            }
          >

            {achievements.map(
              (achievement) => (
                <View
                  key={
                    achievement.title
                  }
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked &&
                      styles.lockedAchievement,
                  ]}
                >

                  <View
                    style={[
                      styles.achievementIcon,
                      !achievement.unlocked &&
                        styles.lockedIcon,
                    ]}
                  >

                    <Ionicons
                      name={
                        achievement.unlocked
                          ? (achievement.icon as any)
                          : 'lock-closed-outline'
                      }
                      size={24}
                      color={
                        achievement.unlocked
                          ? COLORS.orange
                          : '#A7AFBC'
                      }
                    />

                  </View>

                  <Text
                    style={[
                      styles.achievementTitle,
                      !achievement.unlocked &&
                        styles.lockedText,
                    ]}
                  >
                    {
                      achievement.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.achievementDescription
                    }
                  >
                    {
                      achievement.description
                    }
                  </Text>

                  <View
                    style={[
                      styles.achievementStatus,
                      achievement.unlocked &&
                        styles.unlockedStatus,
                    ]}
                  >

                    <Text
                      style={[
                        styles.achievementStatusText,
                        achievement.unlocked &&
                          styles.unlockedStatusText,
                      ]}
                    >
                      {achievement.unlocked
                        ? 'Unlocked'
                        : 'Locked'}
                    </Text>

                  </View>

                </View>
              ),
            )}

          </View>


          {/* =================================
              APP PREFERENCES
          ================================= */}

          <SectionHeader
            title="App Preferences"
            subtitle="Customize your Smart Todo experience"
          />

          <View
            style={
              styles.card
            }
          >

            <PreferenceRow
              icon="notifications-outline"
              title="Notifications"
              description="Receive task reminders"
              right={
                <Switch
                  value={
                    settings.notifications
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setSettings(
                      (previous) => ({
                        ...previous,
                        notifications:
                          value,
                      }),
                    )
                  }
                  disabled={!editing}
                  trackColor={{
                    false:
                      '#D7DDE6',
                    true:
                      '#A9CBFF',
                  }}
                  thumbColor={
                    settings.notifications
                      ? COLORS.primary
                      : '#FFFFFF'
                  }
                />
              }
            />

            <View
              style={
                styles.divider
              }
            />

            <PreferenceRow
              icon="color-palette-outline"
              title="Appearance"
              description="Choose your preferred theme"
              right={
                <TouchableOpacity
                  onPress={() => {
                    if (editing) {
                      setThemeModal(
                        true,
                      );
                    }
                  }}
                  style={
                    styles.appearanceButton
                  }
                >

                  <Text
                    style={
                      styles.appearanceText
                    }
                  >
                    {
                      selectedAppearance
                    }
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={
                      COLORS.muted
                    }
                  />

                </TouchableOpacity>
              }
            />

          </View>


          {/* =================================
              QUICK ACTIONS
          ================================= */}

          <SectionHeader
            title="Quick Actions"
          />

          <View
            style={
              styles.quickActions
            }
          >

            <QuickAction
              icon="add-circle-outline"
              title="Create Task"
              onPress={() =>
                router.push(
                  '/add-task' as any,
                )
              }
            />

            <QuickAction
              icon="analytics-outline"
              title="Track Progress"
              onPress={() =>
                router.push(
                  '/track-progress' as any,
                )
              }
            />

            <QuickAction
              icon="information-circle-outline"
              title="About Smart Todo"
              onPress={() =>
                router.push(
                  '/about' as any,
                )
              }
            />

          </View>


          {/* =================================
              SHARE ALL RECORDS
          ================================= */}

          <View
            style={
              styles.shareSection
            }
          >

            <View
              style={
                styles.shareCard
              }
            >

              <View
                style={
                  styles.shareIconContainer
                }
              >

                <Ionicons
                  name="document-text"
                  size={28}
                  color="#FFFFFF"
                />

              </View>

              <Text
                style={
                  styles.shareTitle
                }
              >
                Share All Records
              </Text>

              <Text
                style={
                  styles.shareDescription
                }
              >
                Generate a professional
                Smart Life PDF report
                containing your profile,
                tasks, calendar schedule,
                health and finance records.
              </Text>

              <View
                style={
                  styles.shareIncludes
                }
              >

                <IncludeItem
                  icon="person-outline"
                  text="Profile"
                />

                <IncludeItem
                  icon="checkmark-circle-outline"
                  text="Tasks"
                />

                <IncludeItem
                  icon="calendar-outline"
                  text="Calendar"
                />

                <IncludeItem
                  icon="heart-outline"
                  text="Health"
                />

                <IncludeItem
                  icon="wallet-outline"
                  text="Finance"
                />

              </View>

              <TouchableOpacity
                onPress={
                  shareAllRecords
                }
                disabled={sharing}
                style={[
                  styles.shareButton,
                  sharing &&
                    styles.shareButtonDisabled,
                ]}
                activeOpacity={0.8}
              >

                <Ionicons
                  name={
                    sharing
                      ? 'hourglass-outline'
                      : 'share-social-outline'
                  }
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.shareButtonText
                  }
                >
                  {sharing
                    ? 'Preparing PDF...'
                    : 'Share PDF'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>


          {/* =================================
              SAVE
          ================================= */}

          {editing && (
            <TouchableOpacity
              onPress={
                saveProfile
              }
              disabled={saving}
              style={
                styles.saveButton
              }
              activeOpacity={0.8}
            >

              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveButtonText
                }
              >
                {saving
                  ? 'Saving...'
                  : 'Save Profile & Settings'}
              </Text>

            </TouchableOpacity>
          )}


          {/* =================================
              RESET
          ================================= */}

          <TouchableOpacity
            onPress={
              resetProfile
            }
            style={
              styles.resetButton
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="refresh-outline"
              size={18}
              color={
                COLORS.red
              }
            />

            <Text
              style={
                styles.resetButtonText
              }
            >
              Reset Profile
            </Text>

          </TouchableOpacity>


          <Text
            style={
              styles.footerText
            }
          >
            Smart Todo • Organize
            your day. Conquer your
            goals.
          </Text>

        </View>

      </ScrollView>


      {/* =====================================
          THEME MODAL
      ===================================== */}

      <Modal
        visible={themeModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setThemeModal(false)
        }
      >

        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setThemeModal(false)
          }
        >

          <Pressable
            style={
              styles.themeModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Choose Appearance
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select how Smart Todo
                  should look
                </Text>

              </View>

              <TouchableOpacity
                onPress={() =>
                  setThemeModal(
                    false,
                  )
                }
              >

                <Ionicons
                  name="close"
                  size={23}
                  color={
                    COLORS.text
                  }
                />

              </TouchableOpacity>

            </View>

            {(
              [
                'System',
                'Light',
                'Dark',
              ] as Appearance[]
            ).map((theme) => (

              <TouchableOpacity
                key={theme}
                onPress={() =>
                  setAppearance(
                    theme,
                  )
                }
                style={[
                  styles.themeOption,
                  selectedAppearance ===
                    theme &&
                    styles.selectedTheme,
                ]}
              >

                <View
                  style={
                    styles.themeOptionLeft
                  }
                >

                  <View
                    style={
                      styles.themeIcon
                    }
                  >

                    <Ionicons
                      name={
                        theme ===
                        'System'
                          ? 'phone-portrait-outline'
                          : theme ===
                              'Light'
                            ? 'sunny-outline'
                            : 'moon-outline'
                      }
                      size={21}
                      color={
                        COLORS.primary
                      }
                    />

                  </View>

                  <Text
                    style={
                      styles.themeText
                    }
                  >
                    {theme}
                  </Text>

                </View>

                {selectedAppearance ===
                  theme && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color={
                        COLORS.primary
                      }
                    />
                )}

              </TouchableOpacity>

            ))}

          </Pressable>

        </Pressable>

      </Modal>

    </SafeAreaView>
  );
}


/* =========================================
   SECTION HEADER
========================================= */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >

      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      ) : null}

    </View>
  );
}


/* =========================================
   INCLUDE ITEM
========================================= */

function IncludeItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View
      style={
        styles.includeItem
      }
    >

      <Ionicons
        name={icon}
        size={15}
        color={
          COLORS.green
        }
      />

      <Text
        style={
          styles.includeText
        }
      >
        {text}
      </Text>

    </View>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  value,
  label,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  iconColor: string;
}) {
  return (
    <View
      style={
        styles.statCard
      }
    >

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${iconColor}15`,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />

      </View>

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>

    </View>
  );
}


/* =========================================
   PREFERENCE ROW
========================================= */

function PreferenceRow({
  icon,
  title,
  description,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <View
      style={
        styles.preferenceRow
      }
    >

      <View
        style={
          styles.preferenceLeft
        }
      >

        <View
          style={
            styles.preferenceIcon
          }
        >

          <Ionicons
            name={icon}
            size={21}
            color={
              COLORS.primary
            }
          />

        </View>

        <View
          style={
            styles.preferenceText
          }
        >

          <Text
            style={
              styles.preferenceTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.preferenceDescription
            }
          >
            {description}
          </Text>

        </View>

      </View>

      {right}

    </View>
  );
}


/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        styles.quickAction
      }
      activeOpacity={0.8}
    >

      <View
        style={
          styles.quickActionIcon
        }
      >

        <Ionicons
          name={icon}
          size={22}
          color={
            COLORS.primary
          }
        />

      </View>

      <Text
        style={
          styles.quickActionText
        }
      >
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={
          COLORS.muted
        }
      />

    </TouchableOpacity>
  );
}


/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    paddingBottom: 50,
  },

  container: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  wideContainer: {
    paddingHorizontal: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 22,
    gap: 15,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      '#FFFFFF',
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  headerSubtitle: {
    fontSize: 13,
    color:
      COLORS.muted,
    marginTop: 3,
  },

  editButton: {
    minHeight: 43,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 7,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  cancelButton: {
    backgroundColor:
      '#E9EDF3',
  },

  cancelButtonText: {
    color:
      COLORS.text,
  },

  heroCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 25,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  avatarContainer: {
    position: 'relative',
  },

  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },

  avatarPlaceholder: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 3,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor:
      COLORS.primaryDark,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 3,
    borderColor:
      '#FFFFFF',
  },

  heroInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 25,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  profileProfession: {
    fontSize: 15,
    color:
      COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },

  profileMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 11,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },

  metaText: {
    color:
      COLORS.muted,
    fontSize: 13,
  },

  completionBox: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  completionHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  completionTitle: {
    color:
      COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  completionSubtitle: {
    color:
      COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },

  completionPercent: {
    color:
      COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },

  progressTrack: {
    height: 9,
    backgroundColor:
      '#E8EDF4',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 11,
  },

  progressFill: {
    height: '100%',
    backgroundColor:
      COLORS.primary,
    borderRadius: 20,
  },

  sectionHeader: {
    marginBottom: 12,
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  sectionSubtitle: {
    color:
      COLORS.muted,
    fontSize: 12.5,
    marginTop: 3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  statsGridWide: {
    gap: 14,
  },

  statCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 145,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 11,
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  statLabel: {
    fontSize: 12,
    color:
      COLORS.muted,
    marginTop: 2,
  },

  scoreCard: {
    backgroundColor:
      '#EAF3FF',
    borderWidth: 1,
    borderColor:
      '#CFE2FF',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 13,
  },

  scoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  scoreContent: {
    flex: 1,
  },

  scoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  scoreDescription: {
    fontSize: 12,
    color:
      COLORS.muted,
    marginTop: 3,
  },

  scoreValue: {
    fontSize: 23,
    fontWeight: '900',
    color:
      COLORS.primary,
  },

  card: {
    backgroundColor:
      COLORS.card,
    borderRadius: 19,
    padding: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    color:
      COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  inputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    backgroundColor:
      '#FAFBFD',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  multilineWrapper: {
    alignItems:
      'flex-start',
    paddingVertical: 10,
  },

  inputIcon: {
    marginRight: 9,
  },

  input: {
    flex: 1,
    color:
      COLORS.text,
    fontSize: 14,
    minHeight: 46,
    outlineStyle:
      'none',
  } as any,

  disabledInput: {
    color:
      '#4E5969',
  },

  multilineInput: {
    minHeight: 85,
    textAlignVertical:
      'top',
  },

  linksPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 2,
  },

  linkButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor:
      '#F3F7FD',
    borderWidth: 1,
    borderColor:
      '#DDE8F8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  linkButtonText: {
    color:
      COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  goalCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 19,
    padding: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 25,
  },

  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      '#EAF3FF',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  goalInfo: {
    flex: 1,
    marginLeft: 12,
  },

  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  goalSubtitle: {
    fontSize: 12,
    color:
      COLORS.muted,
    marginTop: 3,
  },

  goalNumber: {
    fontSize: 24,
    fontWeight: '900',
    color:
      COLORS.primary,
  },

  goalInput: {
    width: 58,
    height: 43,
    borderWidth: 1,
    borderColor:
      COLORS.primary,
    borderRadius: 11,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color:
      COLORS.primary,
    backgroundColor:
      '#F7FAFF',
    outlineStyle:
      'none',
  } as any,

  goalTrack: {
    height: 10,
    borderRadius: 20,
    backgroundColor:
      '#E8EDF4',
    overflow: 'hidden',
    marginTop: 17,
  },

  goalFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor:
      COLORS.primary,
  },

  goalFooter: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginTop: 9,
  },

  goalFooterText: {
    color:
      COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },

  achievementCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor:
      '#F1D69D',
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 155,
  },

  lockedAchievement: {
    borderColor:
      COLORS.border,
    opacity: 0.72,
  },

  achievementIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      '#FFF6E2',
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 10,
  },

  lockedIcon: {
    backgroundColor:
      '#F0F2F5',
  },

  achievementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  lockedText: {
    color:
      '#7C8594',
  },

  achievementDescription: {
    color:
      COLORS.muted,
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 17,
  },

  achievementStatus: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor:
      '#F0F2F5',
  },

  unlockedStatus: {
    backgroundColor:
      '#E9F9EF',
  },

  achievementStatusText: {
    color:
      '#8B95A5',
    fontSize: 10,
    fontWeight: '800',
  },

  unlockedStatusText: {
    color:
      COLORS.green,
  },

  preferenceRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 15,
  },

  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  preferenceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      '#EAF3FF',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },

  preferenceTitle: {
    color:
      COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  preferenceDescription: {
    color:
      COLORS.muted,
    fontSize: 11.5,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 8,
  },

  appearanceButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor:
      '#F5F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  appearanceText: {
    color:
      COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  quickActions: {
    gap: 10,
    marginBottom: 22,
  },

  quickAction: {
    minHeight: 60,
    backgroundColor:
      COLORS.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  quickActionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor:
      '#EAF3FF',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  quickActionText: {
    flex: 1,
    color:
      COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },

  /* =====================================
     SHARE PDF
  ===================================== */

  shareSection: {
    marginBottom: 22,
  },

  shareCard: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor:
      '#D9E6F8',
    padding: 20,
    overflow: 'hidden',
  },

  shareIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 14,
  },

  shareTitle: {
    fontSize: 20,
    fontWeight: '900',
    color:
      COLORS.text,
  },

  shareDescription: {
    fontSize: 12.5,
    color:
      COLORS.muted,
    lineHeight: 19,
    marginTop: 6,
  },

  shareIncludes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    marginBottom: 17,
  },

  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  includeText: {
    fontSize: 11,
    color:
      '#536071',
    fontWeight: '700',
  },

  shareButton: {
    minHeight: 53,
    borderRadius: 14,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 9,
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  shareButtonDisabled: {
    opacity: 0.65,
  },

  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  resetButton: {
    minHeight: 47,
    borderRadius: 13,
    backgroundColor:
      '#FFF3F3',
    borderWidth: 1,
    borderColor:
      '#FFD6D6',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 7,
  },

  resetButtonText: {
    color:
      COLORS.red,
    fontSize: 13,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    color:
      '#9AA3B2',
    fontSize: 11,
    marginTop: 22,
    lineHeight: 18,
  },

  /* =====================================
     MODAL
  ===================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.42)',
    justifyContent:
      'center',
    alignItems: 'center',
    padding: 20,
  },

  themeModal: {
    width: '100%',
    maxWidth: 450,
    backgroundColor:
      '#FFFFFF',
    borderRadius: 21,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems:
      'flex-start',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      COLORS.text,
  },

  modalSubtitle: {
    fontSize: 12,
    color:
      COLORS.muted,
    marginTop: 3,
  },

  themeOption: {
    minHeight: 58,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  selectedTheme: {
    borderColor:
      '#A9CBFF',
    backgroundColor:
      '#F1F7FF',
  },

  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  themeIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      '#EAF3FF',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  themeText: {
    color:
      COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

});