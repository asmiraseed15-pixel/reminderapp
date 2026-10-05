

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../components/BottomNav';

import { useTasks } from '../context/TaskContext';

const PROFILE_KEY = 'smart_todo_profile';
const SETTINGS_KEY = 'smart_todo_settings';

type ThemeMode =
  | 'light'
  | 'dark'
  | 'system';

interface ProfileData {
  name: string;
  email: string;
}

interface AppSettings {
  notifications: boolean;
  appearance: ThemeMode;
}

export default function ProfileScreen() {

  // =====================================================
  // TASK DATA
  // =====================================================

  const { tasks } = useTasks();

  // =====================================================
  // CALCULATE STATISTICS
  // =====================================================

  const totalTasks = useMemo(() => {
    return tasks.length;
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.completed === true
    ).length;
  }, [tasks]);

  const pendingTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.completed !== true
    ).length;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (completedTasks / totalTasks) * 100
    );
  }, [totalTasks, completedTasks]);

  // =====================================================
  // PROFILE
  // =====================================================

  const [name, setName] =
    useState('My Profile');

  const [email, setEmail] =
    useState('your@email.com');

  const [editing, setEditing] =
    useState(false);

  // =====================================================
  // SETTINGS
  // =====================================================

  const [notifications, setNotifications] =
    useState(true);

  const [appearance, setAppearance] =
    useState<ThemeMode>('light');

  // =====================================================
  // MODAL
  // =====================================================

  const [appearanceModal, setAppearanceModal] =
    useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          PROFILE_KEY
        );

      if (stored) {
        const profile: ProfileData =
          JSON.parse(stored);

        if (profile.name) {
          setName(profile.name);
        }

        if (profile.email) {
          setEmail(profile.email);
        }
      }
    } catch (error) {
      console.log(
        'Profile loading error:',
        error
      );
    }
  };

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  const loadSettings = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          SETTINGS_KEY
        );

      if (stored) {
        const settings: AppSettings =
          JSON.parse(stored);

        if (
          typeof settings.notifications ===
          'boolean'
        ) {
          setNotifications(
            settings.notifications
          );
        }

        if (
          settings.appearance === 'light' ||
          settings.appearance === 'dark' ||
          settings.appearance === 'system'
        ) {
          setAppearance(
            settings.appearance
          );
        }
      }
    } catch (error) {
      console.log(
        'Settings loading error:',
        error
      );
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          name,
          email,
        })
      );

      setEditing(false);

      Alert.alert(
        'Profile Saved',
        'Your profile has been updated.'
      );
    } catch (error) {
      console.log(
        'Profile saving error:',
        error
      );
    }
  };

  // =====================================================
  // NOTIFICATION TOGGLE
  // =====================================================

  const toggleNotifications = async (
    value: boolean
  ) => {
    try {
      setNotifications(value);

      const settings: AppSettings = {
        notifications: value,
        appearance,
      };

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.log(
        'Notification setting error:',
        error
      );
    }
  };

  // =====================================================
  // APPEARANCE
  // =====================================================

  const changeAppearance = async (
    mode: ThemeMode
  ) => {
    try {
      setAppearance(mode);

      const settings: AppSettings = {
        notifications,
        appearance: mode,
      };

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setAppearanceModal(false);
    } catch (error) {
      console.log(
        'Appearance saving error:',
        error
      );
    }
  };

  // =====================================================
  // THEME
  // =====================================================

  const isDark =
    appearance === 'dark';

  const theme = {
    background: isDark
      ? '#0B1120'
      : '#F5F7FA',

    card: isDark
      ? '#151E30'
      : '#FFFFFF',

    text: isDark
      ? '#FFFFFF'
      : '#171A21',

    secondaryText: isDark
      ? '#AAB4C5'
      : '#888888',

    border: isDark
      ? '#263247'
      : '#F0F1F3',

    input: isDark
      ? '#1D293D'
      : '#F5F7FA',
  };

  // =====================================================
  // APPEARANCE LABEL
  // =====================================================

  const appearanceLabel =
    appearance === 'light'
      ? 'Light'
      : appearance === 'dark'
      ? 'Dark'
      : 'System';

  // =====================================================
  // ABOUT
  // =====================================================

  const showAbout = () => {
    Alert.alert(
      'Smart Todo',
      'Smart Todo is a simple and powerful task management app designed to help you organize your day, manage reminders and complete your goals.',
      [
        {
          text: 'OK',
        },
      ]
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          Profile
        </Text>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                theme.card,
            },
          ]}
        >

          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={40}
              color="#126EED"
            />
          </View>

          {editing ? (
            <>

              <TextInput
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      theme.input,
                    color: theme.text,
                  },
                ]}
                placeholder="Your name"
                placeholderTextColor={
                  theme.secondaryText
                }
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      theme.input,
                    color: theme.text,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={
                  theme.secondaryText
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.save}
                onPress={saveProfile}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveText}
                >
                  Save Profile
                </Text>
              </TouchableOpacity>

            </>
          ) : (
            <>

              <Text
                style={[
                  styles.name,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {name}
              </Text>

              <Text
                style={[
                  styles.email,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                {email}
              </Text>

              <TouchableOpacity
                style={styles.edit}
                onPress={() =>
                  setEditing(true)
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color="#126EED"
                />

                <Text
                  style={styles.editText}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>

            </>
          )}

        </View>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                theme.card,
            },
          ]}
        >

          {/* TOTAL TASKS */}

          <View style={styles.stat}>

            <View style={styles.statIcon}>
              <Ionicons
                name="list-outline"
                size={18}
                color="#126EED"
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: theme.text,
                },
              ]}
            >
              {totalTasks}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Total Tasks
            </Text>

          </View>

          <View
            style={[
              styles.line,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />

          {/* COMPLETED */}

          <View style={styles.stat}>

            <View style={styles.statIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#126EED"
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: theme.text,
                },
              ]}
            >
              {completedTasks}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Completed
            </Text>

          </View>

          <View
            style={[
              styles.line,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />

          {/* SUCCESS */}

          <View style={styles.stat}>

            <View style={styles.statIcon}>
              <Ionicons
                name="trending-up-outline"
                size={18}
                color="#126EED"
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: theme.text,
                },
              ]}
            >
              {completionRate}%
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Success
            </Text>

          </View>

        </View>

        {/* =================================================
            EXTRA TASK SUMMARY
        ================================================= */}

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                theme.card,
            },
          ]}
        >

          <View style={styles.summaryItem}>

            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    '#FFF4E5',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={21}
                color="#F59E0B"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {pendingTasks}
              </Text>

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                Pending Tasks
              </Text>
            </View>

          </View>

          <View style={styles.summaryItem}>

            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    '#EAF3FF',
                },
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={21}
                color="#126EED"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {completedTasks}
              </Text>

              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                Finished Tasks
              </Text>
            </View>

          </View>

        </View>

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Text
          style={[
            styles.section,
            {
              color: theme.text,
            },
          ]}
        >
          Settings
        </Text>

        <View
          style={[
            styles.settings,
            {
              backgroundColor:
                theme.card,
            },
          ]}
        >

          {/* NOTIFICATIONS */}

          <View
            style={[
              styles.setting,
              {
                borderBottomColor:
                  theme.border,
              },
            ]}
          >

            <View
              style={styles.settingIcon}
            >
              <Ionicons
                name={
                  notifications
                    ? 'notifications'
                    : 'notifications-off-outline'
                }
                size={23}
                color="#126EED"
              />
            </View>

            <View style={styles.settingInfo}>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Notifications
              </Text>

              <Text
                style={[
                  styles.settingSubText,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                {notifications
                  ? 'Reminders are enabled'
                  : 'Reminders are disabled'}
              </Text>

            </View>

            <Switch
              value={notifications}
              onValueChange={
                toggleNotifications
              }
              trackColor={{
                false: '#D1D5DB',
                true: '#9BC5FF',
              }}
              thumbColor={
                notifications
                  ? '#126EED'
                  : '#F4F4F5'
              }
            />

          </View>

          {/* APPEARANCE */}

          <TouchableOpacity
            style={[
              styles.setting,
              {
                borderBottomColor:
                  theme.border,
              },
            ]}
            onPress={() =>
              setAppearanceModal(true)
            }
            activeOpacity={0.7}
          >

            <View
              style={styles.settingIcon}
            >
              <Ionicons
                name="color-palette-outline"
                size={23}
                color="#126EED"
              />
            </View>

            <View style={styles.settingInfo}>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Appearance
              </Text>

              <Text
                style={[
                  styles.settingSubText,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                {appearanceLabel}
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#AAAAAA"
            />

          </TouchableOpacity>

          {/* ABOUT */}

          <TouchableOpacity
            style={styles.setting}
            onPress={showAbout}
            activeOpacity={0.7}
          >

            <View
              style={styles.settingIcon}
            >
              <Ionicons
                name="information-circle-outline"
                size={23}
                color="#126EED"
              />
            </View>

            <View style={styles.settingInfo}>

              <Text
                style={[
                  styles.settingText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                About Smart Todo
              </Text>

              <Text
                style={[
                  styles.settingSubText,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                App information
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#AAAAAA"
            />

          </TouchableOpacity>

        </View>

        {/* =================================================
            APPEARANCE MODAL
        ================================================= */}

        <Modal
          visible={appearanceModal}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setAppearanceModal(false)
          }
        >

          <View
            style={styles.modalOverlay}
          >

            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor:
                    theme.card,
                },
              ]}
            >

              <View
                style={styles.modalHeader}
              >

                <View>

                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    Appearance
                  </Text>

                  <Text
                    style={[
                      styles.modalSubtitle,
                      {
                        color:
                          theme.secondaryText,
                      },
                    ]}
                  >
                    Choose your preferred theme
                  </Text>

                </View>

                <TouchableOpacity
                  onPress={() =>
                    setAppearanceModal(false)
                  }
                >
                  <Ionicons
                    name="close"
                    size={25}
                    color={
                      theme.secondaryText
                    }
                  />
                </TouchableOpacity>

              </View>

              {/* LIGHT */}

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  appearance === 'light' &&
                    styles.selectedTheme,
                ]}
                onPress={() =>
                  changeAppearance('light')
                }
              >

                <View
                  style={styles.themeIcon}
                >
                  <Ionicons
                    name="sunny-outline"
                    size={22}
                    color="#126EED"
                  />
                </View>

                <View
                  style={styles.themeInfo}
                >

                  <Text
                    style={[
                      styles.themeTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    Light
                  </Text>

                  <Text
                    style={[
                      styles.themeDescription,
                      {
                        color:
                          theme.secondaryText,
                      },
                    ]}
                  >
                    Bright and clean
                  </Text>

                </View>

                {appearance === 'light' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#126EED"
                  />
                )}

              </TouchableOpacity>

              {/* DARK */}

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  appearance === 'dark' &&
                    styles.selectedTheme,
                ]}
                onPress={() =>
                  changeAppearance('dark')
                }
              >

                <View
                  style={styles.themeIcon}
                >
                  <Ionicons
                    name="moon-outline"
                    size={22}
                    color="#126EED"
                  />
                </View>

                <View
                  style={styles.themeInfo}
                >

                  <Text
                    style={[
                      styles.themeTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    Dark
                  </Text>

                  <Text
                    style={[
                      styles.themeDescription,
                      {
                        color:
                          theme.secondaryText,
                      },
                    ]}
                  >
                    Easy on the eyes
                  </Text>

                </View>

                {appearance === 'dark' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#126EED"
                  />
                )}

              </TouchableOpacity>

              {/* SYSTEM */}

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  appearance === 'system' &&
                    styles.selectedTheme,
                ]}
                onPress={() =>
                  changeAppearance('system')
                }
              >

                <View
                  style={styles.themeIcon}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={22}
                    color="#126EED"
                  />
                </View>

                <View
                  style={styles.themeInfo}
                >

                  <Text
                    style={[
                      styles.themeTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    System
                  </Text>

                  <Text
                    style={[
                      styles.themeDescription,
                      {
                        color:
                          theme.secondaryText,
                      },
                    ]}
                  >
                    Follow device settings
                  </Text>

                </View>

                {appearance === 'system' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#126EED"
                  />
                )}

              </TouchableOpacity>

            </View>

          </View>

        </Modal>

      </ScrollView>

      <BottomNav active="profile" />

    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },

  // =====================================================
  // PROFILE
  // =====================================================

  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  name: {
    fontSize: 21,
    fontWeight: '900',
  },

  email: {
    marginTop: 5,
  },

  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
  },

  editText: {
    color: '#126EED',
    fontWeight: '800',
  },

  input: {
    width: '100%',
    padding: 14,
    borderRadius: 13,
    marginTop: 9,
  },

  save: {
    backgroundColor: '#126EED',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  saveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // =====================================================
  // STATS
  // =====================================================

  statsCard: {
    borderRadius: 20,
    marginTop: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  stat: {
    alignItems: 'center',
    flex: 1,
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '900',
  },

  statLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },

  line: {
    width: 1,
    height: 50,
  },

  // =====================================================
  // SUMMARY
  // =====================================================

  summaryCard: {
    borderRadius: 20,
    marginTop: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: '900',
  },

  summaryLabel: {
    fontSize: 10,
    marginTop: 3,
  },

  // =====================================================
  // SETTINGS
  // =====================================================

  section: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 25,
    marginBottom: 12,
  },

  settings: {
    borderRadius: 20,
    overflow: 'hidden',
  },

  setting: {
    minHeight: 70,
    paddingHorizontal: 17,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingInfo: {
    flex: 1,
    marginLeft: 13,
  },

  settingText: {
    fontWeight: '800',
    fontSize: 14,
  },

  settingSubText: {
    fontSize: 11,
    marginTop: 4,
  },

  // =====================================================
  // MODAL
  // =====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 24,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
  },

  modalSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  // =====================================================
  // THEME
  // =====================================================

  themeOption: {
    minHeight: 70,
    borderRadius: 17,
    padding: 12,
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedTheme: {
    backgroundColor: '#EAF3FF',
  },

  themeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  themeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  themeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  themeDescription: {
    fontSize: 11,
    marginTop: 4,
  },

});