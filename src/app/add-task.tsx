
import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TaskCategory,
  TaskPriority,
} from '../../types/task';

import { useTasks } from '../context/TaskContext';

import {
  scheduleTaskReminder,
} from '../utils/notifications';


export default function AddTaskScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string;
  }>();

  const { addTask } = useTasks();

  // =====================================================
  // FORM STATES
  // =====================================================

  const [title, setTitle] = useState('');

  const [category, setCategory] =
    useState<TaskCategory>(
      (params.category as TaskCategory) || 'Personal'
    );

  const [priority, setPriority] =
    useState<TaskPriority>('Medium');

  const [notes, setNotes] = useState('');

  const [date, setDate] = useState(
    new Date(Date.now() + 60 * 60 * 1000)
  );

  const [showDate, setShowDate] =
    useState(false);

  const [showTime, setShowTime] =
    useState(false);

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value: Date) => {
    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      value.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (value: Date) => {
    return value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =====================================================
  // WEB DATE CHANGE
  // =====================================================

  const handleWebDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (!value) {
      return;
    }

    const [
      year,
      month,
      day,
    ] = value.split('-').map(Number);

    const newDate = new Date(
      year,
      month - 1,
      day,
      date.getHours(),
      date.getMinutes()
    );

    setDate(newDate);
  };

  // =====================================================
  // WEB TIME CHANGE
  // =====================================================

  const handleWebTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (!value) {
      return;
    }

    const [
      hours,
      minutes,
    ] = value.split(':').map(Number);

    const newDate = new Date(date);

    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    setDate(newDate);
  };

  // =====================================================
  // MOBILE DATE CHANGE
  // =====================================================

  const handleMobileDateChange = (
    selectedDate?: Date
  ) => {
    setShowDate(false);

    if (!selectedDate) {
      return;
    }

    const updatedDate = new Date(date);

    updatedDate.setFullYear(
      selectedDate.getFullYear()
    );

    updatedDate.setMonth(
      selectedDate.getMonth()
    );

    updatedDate.setDate(
      selectedDate.getDate()
    );

    setDate(updatedDate);
  };

  // =====================================================
  // MOBILE TIME CHANGE
  // =====================================================

  const handleMobileTimeChange = (
    selectedTime?: Date
  ) => {
    setShowTime(false);

    if (!selectedTime) {
      return;
    }

    const updatedDate = new Date(date);

    updatedDate.setHours(
      selectedTime.getHours()
    );

    updatedDate.setMinutes(
      selectedTime.getMinutes()
    );

    updatedDate.setSeconds(0);
    updatedDate.setMilliseconds(0);

    setDate(updatedDate);
  };

  // =====================================================
  // SAVE TASK
  // =====================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    // ---------------------------------------------------
    // TITLE VALIDATION
    // ---------------------------------------------------

    if (!title.trim()) {
      Alert.alert(
        'Task Required',
        'Please enter a task title.'
      );

      return;
    }

    // ---------------------------------------------------
    // REMINDER VALIDATION
    // ---------------------------------------------------

    if (
      reminderEnabled &&
      date.getTime() <= Date.now()
    ) {
      Alert.alert(
        'Invalid Reminder Time',
        'Please select a future date and time for the reminder.'
      );

      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------
      // CREATE UNIQUE ID
      // -------------------------------------------------

      const taskId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;

      // -------------------------------------------------
      // SCHEDULE REMINDER
      // -------------------------------------------------

      let notificationId:
        | string
        | null = null;

      if (reminderEnabled) {
        try {
          notificationId =
            await scheduleTaskReminder(
              title.trim(),
              formatDate(date),
              formatTime(date)
            );
        } catch (notificationError) {
          console.log(
            'Reminder scheduling error:',
            notificationError
          );

          notificationId = null;
        }
      }

      // -------------------------------------------------
      // CREATE TASK
      // -------------------------------------------------

      const newTask = {
        id: taskId,

        title: title.trim(),

        category,

        priority,

        date: formatDate(date),

        time: formatTime(date),

        notes: notes.trim(),

        completed: false,

        saved: false,

        reminderEnabled,

        reminderNotificationId:
          notificationId,

        reminderTime:
          reminderEnabled
            ? date.toISOString()
            : null,

        subtasks: [],

        createdAt:
          new Date().toISOString(),
      };

      // -------------------------------------------------
      // SAVE TO CONTEXT
      // -------------------------------------------------

      await addTask(newTask as any);

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      Alert.alert(
        'Task Added Successfully 🎉',
        `"${title.trim()}" has been added to your task list.`,
        [
          {
            text: 'View Tasks',
            onPress: () => {
              router.replace('/task' as any);
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        'Save task error:',
        error
      );

      Alert.alert(
        'Unable to Save',
        'Something went wrong while saving your task. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    router.back();
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backButton}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Add Task
          </Text>

          <Text style={styles.headerSubtitle}>
            Plan your next achievement
          </Text>
        </View>

        <View style={styles.headerSpacer} />

      </View>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="create-outline"
              size={18}
              color="#126EED"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Task Information
          </Text>
        </View>

        <Text style={styles.label}>
          Task Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="What do you need to do?"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          editable={!saving}
          maxLength={120}
        />

        <Text style={styles.characterCount}>
          {title.length}/120
        </Text>

        {/* =================================================
            CATEGORY
        ================================================= */}

        <Text style={styles.label}>
          Category
        </Text>

        <View style={styles.options}>
          {(
            [
              'Personal',
              'Work',
              'Study',
              'Health',
              'Shopping',
              'Other',
            ] as TaskCategory[]
          ).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                category === item &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                setCategory(item)
              }
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  category === item &&
                    styles.selectedText,
                ]}
              >
                {item}
              </Text>

              {category === item && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* =================================================
            PRIORITY
        ================================================= */}

        <Text style={styles.label}>
          Priority
        </Text>

        <View style={styles.priorityRow}>
          {(
            [
              'Low',
              'Medium',
              'High',
            ] as TaskPriority[]
          ).map((item) => {
            const icon =
              item === 'High'
                ? 'flame-outline'
                : item === 'Medium'
                ? 'remove-outline'
                : 'leaf-outline';

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.priorityButton,
                  priority === item &&
                    styles.prioritySelected,
                ]}
                onPress={() =>
                  setPriority(item)
                }
                disabled={saving}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={icon as any}
                  size={18}
                  color={
                    priority === item
                      ? '#FFFFFF'
                      : '#64748B'
                  }
                />

                <Text
                  style={[
                    styles.priorityText,
                    priority === item &&
                      styles.priorityTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =================================================
            DATE & TIME
        ================================================= */}

        <View style={styles.sectionHeaderSpacing} />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#126EED"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Schedule
          </Text>
        </View>

        <Text style={styles.label}>
          Date & Time
        </Text>

        <View style={styles.dateRow}>

          {/* DATE */}

          {Platform.OS === 'web' ? (
            <View style={styles.webDateButton}>

              <Ionicons
                name="calendar-outline"
                size={20}
                color="#126EED"
              />

              <input
                type="date"
                value={formatDate(date)}
                onChange={
                  handleWebDateChange
                }
                disabled={saving}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: '#334155',
                  fontFamily: 'inherit',
                }}
              />

            </View>
          ) : (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() =>
                setShowDate(true)
              }
              disabled={saving}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#126EED"
              />

              <View>
                <Text style={styles.dateSmallLabel}>
                  DATE
                </Text>

                <Text style={styles.dateText}>
                  {formatDate(date)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* TIME */}

          {Platform.OS === 'web' ? (
            <View style={styles.webDateButton}>

              <Ionicons
                name="time-outline"
                size={20}
                color="#126EED"
              />

              <input
                type="time"
                value={`${String(
                  date.getHours()
                ).padStart(2, '0')}:${String(
                  date.getMinutes()
                ).padStart(2, '0')}`}
                onChange={
                  handleWebTimeChange
                }
                disabled={saving}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: '#334155',
                  fontFamily: 'inherit',
                }}
              />

            </View>
          ) : (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() =>
                setShowTime(true)
              }
              disabled={saving}
              activeOpacity={0.8}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color="#126EED"
              />

              <View>
                <Text style={styles.dateSmallLabel}>
                  TIME
                </Text>

                <Text style={styles.dateText}>
                  {formatTime(date)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

        </View>

        {/* =================================================
            MOBILE DATE PICKER
        ================================================= */}

        {Platform.OS !== 'web' &&
          showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(
                event,
                selectedDate
              ) => {
                handleMobileDateChange(
                  selectedDate
                );
              }}
            />
          )}

        {/* =================================================
            MOBILE TIME PICKER
        ================================================= */}

        {Platform.OS !== 'web' &&
          showTime && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(
                event,
                selectedTime
              ) => {
                handleMobileTimeChange(
                  selectedTime
                );
              }}
            />
          )}

        {/* =================================================
            REMINDER
        ================================================= */}

        <View style={styles.reminderRow}>

          <View style={styles.reminderContent}>

            <View style={styles.reminderIcon}>
              <Ionicons
                name={
                  reminderEnabled
                    ? 'notifications'
                    : 'notifications-off-outline'
                }
                size={21}
                color="#126EED"
              />
            </View>

            <View style={styles.reminderTextContainer}>

              <Text style={styles.reminderTitle}>
                Smart Reminder
              </Text>

              <Text style={styles.reminderSubtitle}>
                {reminderEnabled
                  ? 'You will be reminded at the scheduled time'
                  : 'Reminder is currently disabled'}
              </Text>

            </View>

          </View>

          <TouchableOpacity
            style={[
              styles.switch,
              reminderEnabled &&
                styles.switchActive,
            ]}
            onPress={() =>
              setReminderEnabled(
                !reminderEnabled
              )
            }
            disabled={saving}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.switchCircle,
                reminderEnabled &&
                  styles.switchCircleActive,
              ]}
            />
          </TouchableOpacity>

        </View>

        {/* =================================================
            NOTES
        ================================================= */}

        <Text style={styles.label}>
          Notes
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.notes,
          ]}
          placeholder="Add additional notes..."
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={!saving}
          maxLength={500}
        />

        <Text style={styles.characterCount}>
          {notes.length}/500
        </Text>

        {/* =================================================
            TASK PREVIEW
        ================================================= */}

        <View style={styles.previewCard}>

          <View style={styles.previewHeader}>

            <View style={styles.previewIcon}>
              <Ionicons
                name="eye-outline"
                size={19}
                color="#126EED"
              />
            </View>

            <Text style={styles.previewTitle}>
              Task Preview
            </Text>

          </View>

          <View style={styles.previewTask}>

            <View
              style={[
                styles.previewCircle,
                priority === 'High' &&
                  styles.previewCircleHigh,
              ]}
            />

            <View style={styles.previewDetails}>

              <Text
                style={[
                  styles.previewTaskTitle,
                  !title.trim() &&
                    styles.previewPlaceholder,
                ]}
                numberOfLines={2}
              >
                {title.trim() ||
                  'Your task title will appear here'}
              </Text>

              <View style={styles.previewMeta}>

                <View style={styles.metaItem}>
                  <Ionicons
                    name="pricetag-outline"
                    size={13}
                    color="#64748B"
                  />

                  <Text style={styles.metaText}>
                    {category}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons
                    name="flag-outline"
                    size={13}
                    color="#64748B"
                  />

                  <Text style={styles.metaText}>
                    {priority}
                  </Text>
                </View>

              </View>

            </View>

          </View>

        </View>

        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >

          <Ionicons
            name={
              saving
                ? 'hourglass-outline'
                : 'checkmark-circle-outline'
            }
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.saveText}>
            {saving
              ? 'Saving Task...'
              : 'Save Task'}
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    minHeight: 78,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF7',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  headerSpacer: {
    width: 44,
  },

  // ===================================================
  // CONTENT
  // ===================================================

  content: {
    padding: 20,
    paddingBottom: 70,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  // ===================================================
  // SECTION
  // ===================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },

  sectionHeaderSpacing: {
    height: 12,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  // ===================================================
  // LABEL
  // ===================================================

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 9,
    marginTop: 18,
  },

  // ===================================================
  // INPUT
  // ===================================================

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  characterCount: {
    textAlign: 'right',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 5,
    marginRight: 4,
  },

  // ===================================================
  // CATEGORY
  // ===================================================

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  selectedOption: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  optionText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },

  selectedText: {
    color: '#FFFFFF',
  },

  // ===================================================
  // PRIORITY
  // ===================================================

  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },

  priorityButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  prioritySelected: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },

  priorityTextSelected: {
    color: '#FFFFFF',
  },

  // ===================================================
  // DATE / TIME
  // ===================================================

  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },

  dateButton: {
    flex: 1,
    minHeight: 65,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  webDateButton: {
    flex: 1,
    minHeight: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  dateSmallLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },

  dateText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },

  // ===================================================
  // REMINDER
  // ===================================================

  reminderRow: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  reminderTextContainer: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  reminderSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  switch: {
    width: 50,
    height: 29,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'center',
  },

  switchActive: {
    backgroundColor: '#126EED',
  },

  switchCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  switchCircleActive: {
    alignSelf: 'flex-end',
  },

  // ===================================================
  // NOTES
  // ===================================================

  notes: {
    height: 120,
    paddingTop: 15,
  },

  // ===================================================
  // PREVIEW
  // ===================================================

  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 25,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  previewIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  previewTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 14,
  },

  previewCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#126EED',
    marginRight: 12,
  },

  previewCircleHigh: {
    borderColor: '#EF4444',
  },

  previewDetails: {
    flex: 1,
  },

  previewTaskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },

  previewPlaceholder: {
    color: '#94A3B8',
    fontWeight: '500',
  },

  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 7,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // ===================================================
  // SAVE
  // ===================================================

  saveButton: {
    backgroundColor: '#126EED',
    borderRadius: 18,
    paddingVertical: 17,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },

  cancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },

});