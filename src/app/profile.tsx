
import React, { useEffect, useMemo, useState } from 'react';

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

import { useTasks } from '../context/TaskContext';

const PROFILE_KEY = 'smart_todo_profile';
const SETTINGS_KEY = 'smart_todo_settings';

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

  /* ----------------------------------
     LOAD PROFILE
  ----------------------------------- */

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
      console.log('Profile loading error:', error);
    }
  };

  /* ----------------------------------
     BACK BUTTON FIX
  ----------------------------------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/task' as any);
    }
  };

  /* ----------------------------------
     UPDATE PROFILE
  ----------------------------------- */

  const updateProfile = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K],
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ----------------------------------
     SAVE PROFILE
  ----------------------------------- */

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
        window.alert('Profile saved successfully!');
      } else {
        Alert.alert(
          'Profile Saved',
          'Your profile has been updated successfully.',
        );
      }
    } catch (error) {
      console.log('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------
     RESET PROFILE
  ----------------------------------- */

  const resetProfile = () => {
    const performReset = async () => {
      try {
        await AsyncStorage.removeItem(PROFILE_KEY);
        await AsyncStorage.removeItem(SETTINGS_KEY);

        setProfile(defaultProfile);
        setSettings(defaultSettings);
        setEditing(false);

        if (isWeb) {
          window.alert('Profile has been reset.');
        } else {
          Alert.alert(
            'Profile Reset',
            'Your profile information has been reset.',
          );
        }
      } catch (error) {
        console.log('Reset error:', error);
      }
    };

    if (isWeb) {
      const confirmed = window.confirm(
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

  /* ----------------------------------
     PROFILE IMAGE
  ----------------------------------- */

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
      console.log('Image picker error:', error);
    }
  };

  /* ----------------------------------
     OPEN SOCIAL LINK
  ----------------------------------- */

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
      console.log('Link opening error:', error);
    }
  };

  /* ----------------------------------
     TASK STATISTICS
  ----------------------------------- */

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

  const todayCompleted = todayTasks.filter(
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

  /* ----------------------------------
     ACHIEVEMENTS
  ----------------------------------- */

  const achievements = useMemo(() => {
    return [
      {
        icon: 'rocket-outline',
        title: 'Task Starter',
        description: 'Created your first task',
        unlocked: totalTasks >= 1,
      },
      {
        icon: 'checkmark-circle-outline',
        title: 'Task Finisher',
        description: 'Completed your first task',
        unlocked: completedTasks >= 1,
      },
      {
        icon: 'trophy-outline',
        title: 'Productive Mind',
        description: 'Completed 10 tasks',
        unlocked: completedTasks >= 10,
      },
      {
        icon: 'flame-outline',
        title: 'Consistency',
        description: 'Completed 20 tasks',
        unlocked: completedTasks >= 20,
      },
    ];
  }, [totalTasks, completedTasks]);

  /* ----------------------------------
     PROFILE COMPLETION
  ----------------------------------- */

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

  /* ----------------------------------
     APPEARANCE
  ----------------------------------- */

  const selectedAppearance =
    settings.appearance;

  const setAppearance = (
    value: Appearance,
  ) => {
    setSettings((prev) => ({
      ...prev,
      appearance: value,
    }));

    setThemeModal(false);
  };

  /* ----------------------------------
     INPUT COMPONENT
  ----------------------------------- */

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
              updateProfile(key, text)
            }
            placeholder={placeholder}
            placeholderTextColor="#A0A9B8"
            editable={editing}
            multiline={multiline}
            keyboardType={keyboardType}
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
          {/* =========================
              HEADER
          ========================== */}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>

              <View>
                <Text style={styles.headerTitle}>
                  My Profile
                </Text>

                <Text
                  style={styles.headerSubtitle}
                >
                  Manage your personal
                  productivity profile
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                setEditing(
                  (prev) => !prev,
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

          {/* =========================
              PROFILE HERO
          ========================== */}

          <View style={styles.heroCard}>
            <View style={styles.profileTop}>
              <View
                style={styles.avatarContainer}
              >
                {profile.profileImage ? (
                  <Image
                    source={{
                      uri: profile.profileImage,
                    }}
                    style={styles.avatar}
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
                    activeOpacity={0.8}
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
                style={styles.heroInfo}
              >
                <Text
                  style={styles.profileName}
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
                  style={styles.profileMeta}
                >
                  <View
                    style={styles.metaItem}
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
                    style={styles.metaItem}
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

          {/* =========================
              PRODUCTIVITY OVERVIEW
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
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
              value={pendingTasks}
              label="Pending"
              iconColor={
                COLORS.orange
              }
            />

            <StatCard
              icon="bookmark-outline"
              value={savedTasks}
              label="Saved Tasks"
              iconColor={
                COLORS.purple
              }
            />
          </View>

          {/* =========================
              PRODUCTIVITY SCORE
          ========================== */}

          <View
            style={styles.scoreCard}
          >
            <View
              style={styles.scoreIcon}
            >
              <Ionicons
                name="trending-up-outline"
                size={26}
                color="#FFFFFF"
              />
            </View>

            <View
              style={styles.scoreContent}
            >
              <Text
                style={styles.scoreTitle}
              >
                Productivity Score
              </Text>

              <Text
                style={
                  styles.scoreDescription
                }
              >
                {completionRate >= 80
                  ? 'Excellent! You are crushing your goals.'
                  : completionRate >= 50
                    ? 'Great progress! Keep going.'
                    : totalTasks === 0
                      ? 'Create your first task to get started.'
                      : 'Keep completing tasks to improve your score.'}
              </Text>
            </View>

            <Text
              style={styles.scoreValue}
            >
              {completionRate}%
            </Text>
          </View>

          {/* =========================
              PERSONAL INFORMATION
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Personal Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Keep your details
                updated
              </Text>
            </View>
          </View>

          <View style={styles.card}>
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

          {/* =========================
              PROFESSIONAL LINKS
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Professional Links
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Connect your professional
                profiles
              </Text>
            </View>
          </View>

          <View style={styles.card}>
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
                    color={COLORS.text}
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

          {/* =========================
              DAILY GOAL
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Daily Productivity Goal
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Set how many tasks you
                want to complete every
                day
              </Text>
            </View>
          </View>

          <View
            style={styles.goalCard}
          >
            <View
              style={styles.goalTop}
            >
              <View
                style={styles.goalIcon}
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
                style={styles.goalInfo}
              >
                <Text
                  style={styles.goalTitle}
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
              style={styles.goalTrack}
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
              style={styles.goalFooter}
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

          {/* =========================
              ACHIEVEMENTS
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Achievements
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Milestones you have
                unlocked
              </Text>
            </View>
          </View>

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

          {/* =========================
              APP PREFERENCES
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                App Preferences
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Customize your Smart
                Todo experience
              </Text>
            </View>
          </View>

          <View style={styles.card}>
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
                      (prev) => ({
                        ...prev,
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
              style={styles.divider}
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

          {/* =========================
              QUICK ACTIONS
          ========================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={styles.sectionTitle}
            >
              Quick Actions
            </Text>
          </View>

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
              icon="settings-outline"
              title="About Smart Todo"
              onPress={() =>
                router.push(
                  '/about' as any,
                )
              }
            />
          </View>

          {/* =========================
              SAVE
          ========================== */}

          {editing && (
            <TouchableOpacity
              onPress={saveProfile}
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

          {/* =========================
              RESET
          ========================== */}

          <TouchableOpacity
            onPress={resetProfile}
            style={
              styles.resetButton
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={COLORS.red}
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
            style={styles.footerText}
          >
            Smart Todo • Organize
            your day. Conquer your
            goals.
          </Text>
        </View>
      </ScrollView>

      {/* =========================
          THEME MODAL
      ========================== */}

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
                  Select how Smart
                  Todo should look
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

/* ==================================
   STAT CARD
================================== */

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
    <View style={styles.statCard}>
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
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </View>
  );
}

/* ==================================
   PREFERENCE ROW
================================== */

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
            color={COLORS.primary}
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

/* ==================================
   QUICK ACTION
================================== */

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
          color={COLORS.primary}
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
        color={COLORS.muted}
      />
    </TouchableOpacity>
  );
}

/* ==================================
   STYLES
================================== */

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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
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
    backgroundColor: '#E9EDF3',
  },

  cancelButtonText: {
    color: COLORS.text,
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
    borderColor: '#FFFFFF',
  },

  heroInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
  },

  profileProfession: {
    fontSize: 15,
    color: COLORS.primary,
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
    color: COLORS.muted,
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
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  completionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },

  completionPercent: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },

  progressTrack: {
    height: 9,
    backgroundColor: '#E8EDF4',
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
    color: COLORS.text,
  },

  sectionSubtitle: {
    color: COLORS.muted,
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
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
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
    color: COLORS.text,
  },

  scoreDescription: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  scoreValue: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.primary,
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
    color: COLORS.text,
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
    alignItems: 'flex-start',
    paddingVertical: 10,
  },

  inputIcon: {
    marginRight: 9,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 46,
    outlineStyle: 'none',
  } as any,

  disabledInput: {
    color: '#4E5969',
  },

  multilineInput: {
    minHeight: 85,
    textAlignVertical: 'top',
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
    color: COLORS.text,
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
    color: COLORS.text,
  },

  goalSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  goalNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
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
    color: COLORS.primary,
    backgroundColor:
      '#F7FAFF',
    outlineStyle: 'none',
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
    color: COLORS.muted,
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
    color: COLORS.text,
  },

  lockedText: {
    color: '#7C8594',
  },

  achievementDescription: {
    color: COLORS.muted,
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
    color: '#8B95A5',
    fontSize: 10,
    fontWeight: '800',
  },

  unlockedStatusText: {
    color: COLORS.green,
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
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  preferenceDescription: {
    color: COLORS.muted,
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
    color: COLORS.text,
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
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
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
    color: COLORS.red,
    fontSize: 13,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    color: '#9AA3B2',
    fontSize: 11,
    marginTop: 22,
    lineHeight: 18,
  },

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
    color: COLORS.text,
  },

  modalSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
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
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
});