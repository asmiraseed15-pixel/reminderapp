
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

  const [date, setDate] =
    useState(new Date());

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
    ] = value
      .split('-')
      .map(Number);

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
    ] = value
      .split(':')
      .map(Number);

    const newDate = new Date(date);

    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    setDate(newDate);
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
      // NOTIFICATION
      //
      // Expo Go does not support Android remote
      // push notification functionality.
      //
      // Our helper safely returns null.
      // -------------------------------------------------

      let notificationId:
        string | null = null;


      if (reminderEnabled) {

        notificationId =
          await scheduleTaskReminder(
            title.trim(),
            formatDate(date),
            formatTime(date)
          );

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

        reminderEnabled,

        reminderNotificationId:
          notificationId,

        createdAt:
          new Date().toISOString(),

      };


      // -------------------------------------------------
      // SAVE TO TASK CONTEXT
      // -------------------------------------------------

      await addTask(newTask as any);


      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      Alert.alert(
        'Task Added Successfully 🎉',
        `"${title.trim()}" has been saved successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/task');
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
        'Error',
        'Something went wrong while saving the task.'
      );

    } finally {

      setSaving(false);

    }
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

      {/* ===============================================
          HEADER
      =============================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={saving}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />

        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          Add Task
        </Text>


        <View style={styles.headerSpacer} />

      </View>


      {/* ===============================================
          CONTENT
      =============================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* TASK TITLE */}

        <Text style={styles.label}>
          Task Title
        </Text>


        <TextInput
          style={styles.input}
          placeholder="What do you need to do?"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          editable={!saving}
        />


        {/* CATEGORY */}

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

            </TouchableOpacity>

          ))}

        </View>


        {/* PRIORITY */}

        <Text style={styles.label}>
          Priority
        </Text>


        <View style={styles.options}>

          {(
            [
              'Low',
              'Medium',
              'High',
            ] as TaskPriority[]
          ).map((item) => (

            <TouchableOpacity
              key={item}
              style={[
                styles.option,

                priority === item &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                setPriority(item)
              }
              disabled={saving}
              activeOpacity={0.8}
            >

              <Text
                style={[
                  styles.optionText,

                  priority === item &&
                    styles.selectedText,
                ]}
              >
                {item}
              </Text>

            </TouchableOpacity>

          ))}

        </View>


        {/* DATE & TIME */}

        <Text style={styles.label}>
          Date & Time
        </Text>


        <View style={styles.dateRow}>

          {/* DATE */}

          {Platform.OS === 'web' ? (

            <View
              style={styles.webDateButton}
            >

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
                  color: '#333',
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


              <Text style={styles.dateText}>
                {formatDate(date)}
              </Text>

            </TouchableOpacity>

          )}


          {/* TIME */}

          {Platform.OS === 'web' ? (

            <View
              style={styles.webDateButton}
            >

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
                  color: '#333',
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


              <Text style={styles.dateText}>
                {formatTime(date)}
              </Text>

            </TouchableOpacity>

          )}

        </View>


        {/* MOBILE DATE PICKER */}

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

                setShowDate(false);

                if (selectedDate) {

                  const updatedDate =
                    new Date(date);

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
                }
              }}
            />

          )}


        {/* MOBILE TIME PICKER */}

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

                setShowTime(false);

                if (selectedTime) {

                  const updatedDate =
                    new Date(date);

                  updatedDate.setHours(
                    selectedTime.getHours()
                  );

                  updatedDate.setMinutes(
                    selectedTime.getMinutes()
                  );

                  updatedDate.setSeconds(0);

                  updatedDate.setMilliseconds(0);

                  setDate(updatedDate);
                }
              }}
            />

          )}


        {/* REMINDER */}

        <View style={styles.reminderRow}>

          <View style={styles.reminderContent}>

            <View style={styles.reminderIcon}>

              <Ionicons
                name="notifications-outline"
                size={20}
                color="#126EED"
              />

            </View>


            <View>

              <Text style={styles.reminderTitle}>
                Reminder
              </Text>

              <Text style={styles.reminderSubtitle}>
                Get reminded about this task
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


        {/* NOTES */}

        <Text style={styles.label}>
          Notes
        </Text>


        <TextInput
          style={[
            styles.input,
            styles.notes,
          ]}
          placeholder="Add additional notes..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={!saving}
        />


        {/* SAVE BUTTON */}

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
              ? 'Saving...'
              : 'Save Task'}

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


  header: {
    height: 75,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },


  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },


  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },


  headerSpacer: {
    width: 42,
  },


  content: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },


  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 9,
    marginTop: 18,
  },


  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },


  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },


  selectedOption: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },


  optionText: {
    color: '#64748B',
    fontWeight: '600',
  },


  selectedText: {
    color: '#FFFFFF',
  },


  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },


  dateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },


  webDateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },


  dateText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },


  reminderRow: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    marginTop: 18,
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
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },


  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },


  reminderSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },


  switch: {
    width: 50,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'center',
  },


  switchActive: {
    backgroundColor: '#126EED',
  },


  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },


  switchCircleActive: {
    alignSelf: 'flex-end',
  },


  notes: {
    height: 120,
  },


  saveButton: {
    backgroundColor: '#126EED',
    borderRadius: 18,
    padding: 17,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },


  saveButtonDisabled: {
    opacity: 0.6,
  },


  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

});