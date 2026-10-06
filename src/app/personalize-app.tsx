import React, { useEffect, useState } from 'react';

import {
  Alert,
  Modal,
  Platform,
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

import { useTasks } from '../context/TaskContext';

const PROFILE_KEY = 'smart_todo_profile';
const SETTINGS_KEY = 'smart_todo_settings';

type ThemeMode = 'Light' | 'Dark' | 'System';

type ProfileData = {
  name: string;
  email: string;
};

type AppSettings = {
  notifications: boolean;
  theme: ThemeMode;
};

export default function PersonalizeApp() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { tasks } = useTasks();

  const isTablet = width >= 700;
  const isDesktop = width >= 1100;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [notifications, setNotifications] =
    useState(true);

  const [theme, setTheme] =
    useState<ThemeMode>('Light');

  const [themeModal, setThemeModal] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const safeTasks = Array.isArray(tasks)
    ? tasks
    : [];

  const completedTasks = safeTasks.filter(
    (task: any) => task.completed === true
  ).length;

  const pendingTasks =
    safeTasks.length - completedTasks;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedProfile =
        await AsyncStorage.getItem(PROFILE_KEY);

      const savedSettings =
        await AsyncStorage.getItem(SETTINGS_KEY);

      if (savedProfile) {
        const profile: ProfileData =
          JSON.parse(savedProfile);

        setName(profile.name || '');
        setEmail(profile.email || '');
      }

      if (savedSettings) {
        const settings: AppSettings =
          JSON.parse(savedSettings);

        setNotifications(
          settings.notifications !== false
        );

        setTheme(
          settings.theme || 'Light'
        );
      }
    } catch (error) {
      console.log(
        'Load settings error:',
        error
      );
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);

      const profile: ProfileData = {
        name: name.trim(),
        email: email.trim(),
      };

      const settings: AppSettings = {
        notifications,
        theme,
      };

      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
      );

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      if (Platform.OS === 'web') {
        window.alert(
          'Your profile and settings have been saved successfully.'
        );
      } else {
        Alert.alert(
          'Saved Successfully ✨',
          'Your profile and app preferences have been updated.'
        );
      }
    } catch (error) {
      console.log(
        'Save settings error:',
        error
      );

      if (Platform.OS === 'web') {
        window.alert(
          'Unable to save settings.'
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to save your settings.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const saveTheme = async (
    selectedTheme: ThemeMode
  ) => {
    try {
      setTheme(selectedTheme);

      const savedSettings =
        await AsyncStorage.getItem(SETTINGS_KEY);

      let currentSettings: AppSettings = {
        notifications,
        theme: selectedTheme,
      };

      if (savedSettings) {
        const parsed =
          JSON.parse(savedSettings);

        currentSettings = {
          ...parsed,
          notifications,
          theme: selectedTheme,
        };
      }

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(currentSettings)
      );

      setThemeModal(false);
    } catch (error) {
      console.log(
        'Theme save error:',
        error
      );
    }
  };

  const toggleNotifications = async (
    value: boolean
  ) => {
    try {
      setNotifications(value);

      const savedSettings =
        await AsyncStorage.getItem(SETTINGS_KEY);

      let currentSettings: AppSettings = {
        notifications: value,
        theme,
      };

      if (savedSettings) {
        const parsed =
          JSON.parse(savedSettings);

        currentSettings = {
          ...parsed,
          notifications: value,
          theme,
        };
      }

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(currentSettings)
      );
    } catch (error) {
      console.log(
        'Notification setting error:',
        error
      );
    }
  };

  const resetSettings = () => {
    const reset = async () => {
      try {
        await AsyncStorage.removeItem(
          PROFILE_KEY
        );

        await AsyncStorage.removeItem(
          SETTINGS_KEY
        );

        setName('');
        setEmail('');
        setNotifications(true);
        setTheme('Light');

        if (Platform.OS === 'web') {
          window.alert(
            'Profile and settings have been reset.'
          );
        } else {
          Alert.alert(
            'Reset Complete',
            'Your profile and preferences have been reset.'
          );
        }
      } catch (error) {
        console.log(
          'Reset error:',
          error
        );
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        window.confirm(
          'Reset your profile and app settings?'
        );

      if (confirmed) {
        reset();
      }
    } else {
      Alert.alert(
        'Reset Settings',
        'Are you sure you want to reset your profile and preferences?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: reset,
          },
        ]
      );
    }
  };

  const openAbout = () => {
    router.push('/about' as any);
  };

  const getInitial = () => {
    if (name.trim()) {
      return name.trim().charAt(0).toUpperCase();
    }

    return 'U';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          isTablet && styles.containerTablet,
          isDesktop && styles.containerDesktop,
        ]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#172033"
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Personalize App
            </Text>

            <Text style={styles.subtitle}>
              Make Smart Todo feel like your own.
            </Text>
          </View>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {getInitial()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {name.trim()
                ? name
                : 'Your Profile'}
            </Text>

            <Text style={styles.profileEmail}>
              {email.trim()
                ? email
                : 'Add your email address'}
            </Text>
          </View>

          <View style={styles.profileBadge}>
            <Ionicons
              name="sparkles"
              size={17}
              color="#126EED"
            />
          </View>
        </View>

        {/* PROFILE INFORMATION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Profile Information
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your information is stored locally on this device.
          </Text>

          <View style={styles.inputCard}>
            <View style={styles.inputIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#126EED"
              />
            </View>

            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>
                Your Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#A0A8B6"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputIcon}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#126EED"
              />
            </View>

            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>
                Email Address
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A0A8B6"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveAllSettings}
            disabled={saving}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              {saving
                ? 'Saving...'
                : 'Save Profile & Settings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            App Preferences
          </Text>

          <Text style={styles.sectionSubtitle}>
            Control how Smart Todo behaves.
          </Text>

          {/* NOTIFICATIONS */}

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceIconBlue}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#126EED"
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                Notifications
              </Text>

              <Text style={styles.preferenceDescription}>
                Receive reminders for your scheduled tasks.
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={
                toggleNotifications
              }
              trackColor={{
                false: '#D9DEE7',
                true: '#A8C9FF',
              }}
              thumbColor={
                notifications
                  ? '#126EED'
                  : '#FFFFFF'
              }
            />
          </View>

          {/* APPEARANCE */}

          <TouchableOpacity
            style={styles.preferenceCard}
            onPress={() =>
              setThemeModal(true)
            }
          >
            <View style={styles.preferenceIconPurple}>
              <Ionicons
                name="color-palette-outline"
                size={21}
                color="#8B5CF6"
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                Appearance
              </Text>

              <Text style={styles.preferenceDescription}>
                Choose how Smart Todo should look.
              </Text>
            </View>

            <View style={styles.themeValue}>
              <Text style={styles.themeValueText}>
                {theme}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#8A93A2"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* STATISTICS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Productivity
          </Text>

          <Text style={styles.sectionSubtitle}>
            A quick look at your current task activity.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconBlue}>
                <Ionicons
                  name="list-outline"
                  size={21}
                  color="#126EED"
                />
              </View>

              <Text style={styles.statNumber}>
                {safeTasks.length}
              </Text>

              <Text style={styles.statLabel}>
                Total Tasks
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconGreen}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#20B486"
                />
              </View>

              <Text style={styles.statNumber}>
                {completedTasks}
              </Text>

              <Text style={styles.statLabel}>
                Completed
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconOrange}>
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#FF8A3D"
                />
              </View>

              <Text style={styles.statNumber}>
                {pendingTasks}
              </Text>

              <Text style={styles.statLabel}>
                Pending
              </Text>
            </View>
          </View>
        </View>

        {/* ABOUT */}

        <TouchableOpacity
          style={styles.aboutCard}
          onPress={openAbout}
        >
          <View style={styles.aboutIcon}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#126EED"
            />
          </View>

          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>
              About Smart Todo
            </Text>

            <Text style={styles.aboutDescription}>
              Explore all Smart Todo features and productivity tools.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#8992A2"
          />
        </TouchableOpacity>

        {/* RESET */}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSettings}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#E04F5F"
          />

          <Text style={styles.resetText}>
            Reset Profile & Settings
          </Text>
        </TouchableOpacity>

        {/* THEME MODAL */}

        <Modal
          visible={themeModal}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setThemeModal(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Appearance
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Choose your preferred theme
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() =>
                    setThemeModal(false)
                  }
                >
                  <Ionicons
                    name="close"
                    size={21}
                    color="#4B5563"
                  />
                </TouchableOpacity>
              </View>

              {(
                [
                  'Light',
                  'Dark',
                  'System',
                ] as ThemeMode[]
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.themeOption,
                    theme === option &&
                      styles.themeOptionSelected,
                  ]}
                  onPress={() =>
                    saveTheme(option)
                  }
                >
                  <View
                    style={[
                      styles.themeOptionIcon,
                      theme === option &&
                        styles.themeOptionIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        option === 'Light'
                          ? 'sunny-outline'
                          : option === 'Dark'
                          ? 'moon-outline'
                          : 'phone-portrait-outline'
                      }
                      size={20}
                      color={
                        theme === option
                          ? '#126EED'
                          : '#667085'
                      }
                    />
                  </View>

                  <View style={styles.themeOptionContent}>
                    <Text
                      style={[
                        styles.themeOptionTitle,
                        theme === option &&
                          styles.themeOptionTitleSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    <Text style={styles.themeOptionDescription}>
                      {option === 'Light'
                        ? 'Clean and bright appearance'
                        : option === 'Dark'
                        ? 'Comfortable darker appearance'
                        : 'Follow your device preference'}
                    </Text>
                  </View>

                  {theme === option && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#126EED"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  containerTablet: {
    paddingHorizontal: 35,
  },

  containerDesktop: {
    paddingHorizontal: 70,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
  },

  subtitle: {
    fontSize: 13,
    color: '#7B8495',
    marginTop: 4,
  },

  profileCard: {
    backgroundColor: '#126EED',
    borderRadius: 23,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInitial: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },

  profileBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    marginBottom: 27,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#80899A',
    marginTop: 3,
    marginBottom: 13,
  },

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E7EBF1',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  inputIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  inputContent: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 11,
    color: '#7B8495',
    fontWeight: '600',
  },

  input: {
    fontSize: 14,
    color: '#172033',
    fontWeight: '600',
    paddingVertical: 4,
    marginTop: 1,
  },

  saveButton: {
    backgroundColor: '#126EED',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF1',
    marginBottom: 10,
  },

  preferenceIconBlue: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  preferenceIconPurple: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F1ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  preferenceContent: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#20293A',
  },

  preferenceDescription: {
    fontSize: 11,
    color: '#828B9B',
    lineHeight: 16,
    marginTop: 3,
  },

  themeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  themeValueText: {
    fontSize: 12,
    color: '#126EED',
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  statIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIconGreen: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#E7F8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIconOrange: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172033',
    marginTop: 9,
  },

  statLabel: {
    fontSize: 11,
    color: '#7D8798',
    marginTop: 2,
  },

  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  aboutIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  aboutContent: {
    flex: 1,
  },

  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#20293A',
  },

  aboutDescription: {
    fontSize: 11,
    color: '#828B9B',
    marginTop: 3,
    lineHeight: 16,
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 7,
  },

  resetText: {
    fontSize: 13,
    color: '#E04F5F',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#818A99',
    marginTop: 3,
  },

  modalClose: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7EBF1',
    marginBottom: 9,
  },

  themeOptionSelected: {
    borderColor: '#A8C9FF',
    backgroundColor: '#F4F8FF',
  },

  themeOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  themeOptionIconSelected: {
    backgroundColor: '#EAF2FF',
  },

  themeOptionContent: {
    flex: 1,
  },

  themeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#394255',
  },

  themeOptionTitleSelected: {
    color: '#126EED',
  },

  themeOptionDescription: {
    fontSize: 11,
    color: '#8992A2',
    marginTop: 3,
  },

  bottomSpace: {
    height: 25,
  },
});