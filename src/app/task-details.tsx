
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
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

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { TaskCategory } from '../../types/task';
import { useTaskContext } from '../context/TaskContext';

/* =========================================================
   CATEGORY COLORS
========================================================= */

const CATEGORY_COLORS: Record<string, string> = {
  Personal: '#8B5CF6',
  Work: '#2563EB',
  Shopping: '#F59E0B',
  Errands: '#F59E0B',
  Health: '#10B981',
  Study: '#EC4899',
  Other: '#64748B',
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return 'Select date';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time?: string) => {
  if (!time) {
    return 'Select time';
  }

  if (
    time.toUpperCase().includes('AM') ||
    time.toUpperCase().includes('PM')
  ) {
    return time;
  }

  const parts = time.split(':');

  if (parts.length < 2) {
    return time;
  }

  let hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${suffix}`;
};

const dateFromString = (date?: string) => {
  if (!date) {
    return new Date();
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

const timeFromString = (time?: string) => {
  const now = new Date();

  if (!time) {
    return now;
  }

  const match = time.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!match) {
    return now;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);

  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hour < 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  now.setHours(hour);
  now.setMinutes(minute);
  now.setSeconds(0);
  now.setMilliseconds(0);

  return now;
};

const formatTimeForStorage = (date: Date) => {
  let hour = date.getHours();

  const minute = date
    .getMinutes()
    .toString()
    .padStart(2, '0');

  const suffix = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${suffix}`;
};

const formatDateForWebInput = (date?: string) => {
  if (!date) {
    return '';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const year = parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    parsed.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatTimeForWebInput = (time?: string) => {
  if (!time) {
    return '';
  }

  const match = time.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!match) {
    return '';
  }

  let hour = Number(match[1]);

  const minute = match[2];

  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hour < 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
};

/* =========================================================
   SAFE SUBTASK CONVERTER
========================================================= */

const getSubtaskText = (item: any): string => {
  if (typeof item === 'string') {
    return item;
  }

  if (item && typeof item === 'object') {
    return (
      item.title ||
      item.text ||
      item.name ||
      item.task ||
      ''
    );
  }

  return '';
};

const normalizeSubtasks = (value: any): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(getSubtaskText)
    .filter(
      (item: string) =>
        item.trim().length > 0
    );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TaskDetails() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const taskId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  /* =======================================================
     TASK CONTEXT
  ======================================================= */

  const {
    tasks,
    updateTask,
    deleteTask,
  } = useTaskContext();

  /* =======================================================
     FIND TASK
  ======================================================= */

  const task = useMemo(() => {
    if (!taskId) {
      return undefined;
    }

    return tasks.find(
      item =>
        String(item.id) === String(taskId)
    );
  }, [tasks, taskId]);

  /* =======================================================
     STATES
  ======================================================= */

  const [title, setTitle] = useState('');

  const [category, setCategory] =
    useState<TaskCategory>('Personal');

  const [date, setDate] = useState('');

  const [time, setTime] = useState('');

  const [notes, setNotes] = useState('');

  const [completed, setCompleted] =
    useState(false);

  const [reminderEnabled, setReminderEnabled] =
    useState(false);

  const [subtasks, setSubtasks] =
    useState<string[]>([]);

  const [newSubtask, setNewSubtask] =
    useState('');

  const [subtaskCompleted, setSubtaskCompleted] =
    useState<boolean[]>([]);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* =======================================================
     LOAD TASK
  ======================================================= */

  useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title || '');

    setCategory(
      task.category || 'Personal'
    );

    setDate(task.date || '');

    setTime(task.time || '');

    setNotes(task.notes || '');

    setCompleted(
      Boolean(task.completed)
    );

    setReminderEnabled(
      Boolean(task.reminderEnabled)
    );

    const safeSubtasks = normalizeSubtasks(
      (task as any).subtasks
    );

    setSubtasks(safeSubtasks);

    setSubtaskCompleted(
      safeSubtasks.map(() => false)
    );
  }, [task?.id]);

  /* =======================================================
     TASK NOT FOUND
  ======================================================= */

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>

          <View style={styles.notFoundIcon}>
            <Ionicons
              name="document-text-outline"
              size={42}
              color="#126EED"
            />
          </View>

          <Text style={styles.notFoundTitle}>
            Task Not Found
          </Text>

          <Text style={styles.notFoundText}>
            This task may have been deleted or
            is no longer available.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     DATE CHANGE
  ======================================================= */

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const year =
      selectedDate.getFullYear();

    const month = String(
      selectedDate.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      selectedDate.getDate()
    ).padStart(2, '0');

    setDate(
      `${year}-${month}-${day}`
    );
  };

  /* =======================================================
     TIME CHANGE
  ======================================================= */

  const handleTimeChange = (
    event: any,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);

    if (!selectedTime) {
      return;
    }

    setTime(
      formatTimeForStorage(selectedTime)
    );
  };

  /* =======================================================
     WEB DATE
  ======================================================= */

  const handleWebDateChange = (
    value: string
  ) => {
    setDate(value);
  };

  /* =======================================================
     WEB TIME
  ======================================================= */

  const handleWebTimeChange = (
    value: string
  ) => {
    if (!value) {
      setTime('');
      return;
    }

    const [hourString, minute] =
      value.split(':');

    let hour = Number(hourString);

    if (Number.isNaN(hour)) {
      return;
    }

    const suffix =
      hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    setTime(
      `${hour}:${minute} ${suffix}`
    );
  };

  /* =======================================================
     ADD SUBTASK
  ======================================================= */

  const handleAddSubtask = () => {
    const value =
      newSubtask.trim();

    if (!value) {
      return;
    }

    setSubtasks(previous => [
      ...previous,
      value,
    ]);

    setSubtaskCompleted(previous => [
      ...previous,
      false,
    ]);

    setNewSubtask('');
  };

  /* =======================================================
     DELETE SUBTASK
  ======================================================= */

  const handleDeleteSubtask = (
    index: number
  ) => {
    setSubtasks(previous =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setSubtaskCompleted(previous =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /* =======================================================
     TOGGLE SUBTASK
  ======================================================= */

  const handleToggleSubtask = (
    index: number
  ) => {
    setSubtaskCompleted(previous =>
      previous.map(
        (value, itemIndex) =>
          itemIndex === index
            ? !value
            : value
      )
    );
  };

  /* =======================================================
     SAVE / UPDATE TASK
  ======================================================= */

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Missing Title',
        'Please enter a task title.'
      );

      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      await updateTask(
        String(task.id),
        {
          title: title.trim(),
          category,
          date,
          time,
          notes: notes.trim(),
          completed,
          reminderEnabled,
          subtasks: subtasks as any,
        } as any
      );

      /*
       * IMPORTANT:
       * Instead of router.back(), send the user
       * back to the Task page with a success quote.
       */

      router.replace({
        pathname: '/task',
        params: {
          success: 'updated',
          quote:
            '✨ Small progress today becomes a big achievement tomorrow.',
        },
      });

    } catch (error) {
      console.error(
        'Update task error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to update the task. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE TASK
  ======================================================= */

  const handleDelete = () => {
    if (deleting) {
      return;
    }

    Alert.alert(
      'Delete Task?',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              setDeleting(true);

              await deleteTask(
                String(task.id)
              );

              /*
               * IMPORTANT:
               * After deletion, go to Task page
               * and show a different quote.
               */

              router.replace({
                pathname: '/task',
                params: {
                  success: 'deleted',
                  quote:
                    '🗑️ One less task. One more step toward a lighter day.',
                },
              });

            } catch (error) {
              console.error(
                'Delete task error:',
                error
              );

              setDeleting(false);

              Alert.alert(
                'Delete Failed',
                'The task could not be deleted. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  /* =======================================================
     CATEGORY BUTTON
  ======================================================= */

  const renderCategory = (
    value: TaskCategory
  ) => {
    const selected =
      category === value;

    const color =
      CATEGORY_COLORS[value] ||
      '#64748B';

    return (
      <TouchableOpacity
        key={value}
        onPress={() =>
          setCategory(value)
        }
        style={[
          styles.categoryButton,

          selected && {
            borderColor: color,
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <View
          style={[
            styles.categoryDot,
            {
              backgroundColor:
                color,
            },
          ]}
        />

        <Text
          style={[
            styles.categoryText,

            selected && {
              color,
              fontWeight: '700',
            },
          ]}
        >
          {value}
        </Text>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={color}
          />
        )}
      </TouchableOpacity>
    );
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <View
          style={styles.headerTitleContainer}
        >
          <Text
            style={styles.headerTitle}
          >
            Edit Task
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Update your task details
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.deleteHeaderButton,
            deleting &&
              styles.deleteDisabled,
          ]}
          disabled={deleting}
          onPress={handleDelete}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color="#EF4444"
          />
        </TouchableOpacity>

      </View>

      {/* CONTENT */}

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.content,
            isDesktop &&
              styles.desktopContent,
          ]}
        >

          {/* TITLE */}

          <View style={styles.section}>

            <Text style={styles.label}>
              Task Title
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline
            />

          </View>

          {/* CATEGORY */}

          <View style={styles.section}>

            <Text style={styles.label}>
              Category
            </Text>

            <View
              style={styles.categoryGrid}
            >
              {renderCategory(
                'Personal'
              )}

              {renderCategory(
                'Work'
              )}

              {renderCategory(
                'Shopping'
              )}

              {renderCategory(
                'Health'
              )}

              {renderCategory(
                'Study'
              )}

              {renderCategory(
                'Other'
              )}
            </View>

          </View>

          {/* DATE + TIME */}

          <View
            style={[
              styles.row,
              isDesktop &&
                styles.desktopRow,
            ]}
          >

            {/* DATE */}

            <View
              style={[
                styles.halfSection,
                isDesktop &&
                  styles.desktopHalf,
              ]}
            >
              <Text style={styles.label}>
                Date
              </Text>

              {Platform.OS === 'web' ? (
                <View
                  style={
                    styles.webInputWrapper
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={21}
                    color="#126EED"
                  />

                  <input
                    type="date"
                    value={formatDateForWebInput(
                      date
                    )}
                    onChange={event =>
                      handleWebDateChange(
                        event.target.value
                      )
                    }
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background:
                        'transparent',
                      fontSize: 14,
                      color: '#374151',
                      fontWeight:
                        '600',
                      minWidth: 0,
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={
                    styles.iconInput
                  }
                  onPress={() =>
                    setShowDatePicker(
                      true
                    )
                  }
                >
                  <View
                    style={
                      styles.inputIcon
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color="#126EED"
                    />
                  </View>

                  <Text
                    style={
                      styles.inputValue
                    }
                  >
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* TIME */}

            <View
              style={[
                styles.halfSection,
                isDesktop &&
                  styles.desktopHalf,
              ]}
            >
              <Text style={styles.label}>
                Time
              </Text>

              {Platform.OS === 'web' ? (
                <View
                  style={
                    styles.webInputWrapper
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={21}
                    color="#126EED"
                  />

                  <input
                    type="time"
                    value={formatTimeForWebInput(
                      time
                    )}
                    onChange={event =>
                      handleWebTimeChange(
                        event.target.value
                      )
                    }
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background:
                        'transparent',
                      fontSize: 14,
                      color: '#374151',
                      fontWeight:
                        '600',
                      minWidth: 0,
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={
                    styles.iconInput
                  }
                  onPress={() =>
                    setShowTimePicker(
                      true
                    )
                  }
                >
                  <View
                    style={
                      styles.inputIcon
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={21}
                      color="#126EED"
                    />
                  </View>

                  <Text
                    style={
                      styles.inputValue
                    }
                  >
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* DATE PICKER */}

          {Platform.OS !== 'web' &&
            showDatePicker && (
              <DateTimePicker
                value={dateFromString(
                  date
                )}
                mode="date"
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  handleDateChange
                }
              />
            )}

          {/* TIME PICKER */}

          {Platform.OS !== 'web' &&
            showTimePicker && (
              <DateTimePicker
                value={timeFromString(
                  time
                )}
                mode="time"
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  handleTimeChange
                }
              />
            )}

          {/* REMINDER */}

          <View
            style={styles.reminderCard}
          >
            <View
              style={styles.reminderLeft}
            >
              <View
                style={styles.reminderIcon}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#126EED"
                />
              </View>

              <View>
                <Text
                  style={
                    styles.reminderTitle
                  }
                >
                  Reminder
                </Text>

                <Text
                  style={
                    styles.reminderSubtitle
                  }
                >
                  Get notified about this task
                </Text>
              </View>
            </View>

            <Switch
              value={
                reminderEnabled
              }
              onValueChange={
                setReminderEnabled
              }
              trackColor={{
                false: '#D1D5DB',
                true: '#93C5FD',
              }}
              thumbColor={
                reminderEnabled
                  ? '#126EED'
                  : '#F9FAFB'
              }
            />
          </View>

          {/* SUBTASKS */}

          <View style={styles.section}>

            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={styles.label}
              >
                Subtasks
              </Text>

              <Text
                style={styles.countText}
              >
                {subtasks.length}
              </Text>
            </View>

            {/* ADD SUBTASK */}

            <View
              style={
                styles.addSubtaskRow
              }
            >
              <TextInput
                value={newSubtask}
                onChangeText={
                  setNewSubtask
                }
                placeholder="Add a subtask..."
                placeholderTextColor="#9CA3AF"
                style={
                  styles.subtaskInput
                }
                onSubmitEditing={
                  handleAddSubtask
                }
                returnKeyType="done"
              />

              <TouchableOpacity
                style={
                  styles.addSubtaskButton
                }
                onPress={
                  handleAddSubtask
                }
              >
                <Ionicons
                  name="add"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* SUBTASK LIST */}

            {subtasks.map(
              (item, index) => (
                <View
                  key={`subtask-${index}`}
                  style={
                    styles.subtaskRow
                  }
                >

                  <TouchableOpacity
                    style={
                      styles.subtaskCheck
                    }
                    onPress={() =>
                      handleToggleSubtask(
                        index
                      )
                    }
                  >
                    <Ionicons
                      name={
                        subtaskCompleted[
                          index
                        ]
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={23}
                      color={
                        subtaskCompleted[
                          index
                        ]
                          ? '#126EED'
                          : '#9CA3AF'
                      }
                    />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.subtaskText,
                      subtaskCompleted[
                        index
                      ] &&
                        styles.subtaskDone,
                    ]}
                  >
                    {item}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteSubtask(
                        index
                      )
                    }
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={21}
                      color="#EF4444"
                    />
                  </TouchableOpacity>

                </View>
              )
            )}

            {/* EMPTY SUBTASK MESSAGE */}

            {subtasks.length === 0 && (
              <View
                style={
                  styles.emptySubtasks
                }
              >
                <Ionicons
                  name="list-outline"
                  size={25}
                  color="#9CA3AF"
                />

                <Text
                  style={
                    styles.emptySubtasksText
                  }
                >
                  No subtasks added yet
                </Text>
              </View>
            )}

          </View>

          {/* NOTES */}

          <View style={styles.section}>

            <Text style={styles.label}>
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this task..."
              placeholderTextColor="#9CA3AF"
              style={styles.notesInput}
              multiline
              textAlignVertical="top"
            />

          </View>

          {/* COMPLETED */}

          <View
            style={styles.completedCard}
          >
            <View
              style={styles.completedLeft}
            >
              <View
                style={
                  styles.completedIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={22}
                  color="#10B981"
                />
              </View>

              <View>
                <Text
                  style={
                    styles.completedTitle
                  }
                >
                  Mark as completed
                </Text>

                <Text
                  style={
                    styles.completedSubtitle
                  }
                >
                  This task is finished
                </Text>
              </View>
            </View>

            <Switch
              value={completed}
              onValueChange={
                setCompleted
              }
              trackColor={{
                false: '#D1D5DB',
                true: '#6EE7B7',
              }}
              thumbColor={
                completed
                  ? '#10B981'
                  : '#F9FAFB'
              }
            />
          </View>

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            disabled={saving}
            onPress={handleSave}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.saveButtonText
              }
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          {/* DELETE BUTTON */}

          <TouchableOpacity
            style={[
              styles.deleteButton,
              deleting &&
                styles.deleteDisabled,
            ]}
            disabled={deleting}
            onPress={handleDelete}
          >
            <Ionicons
              name="trash-outline"
              size={21}
              color="#EF4444"
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              {deleting
                ? 'Deleting...'
                : 'Delete Task'}
            </Text>
          </TouchableOpacity>

          <View
            style={styles.bottomSpace}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  keyboard: {
    flex: 1,
  },

  /* HEADER */

  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },

  deleteHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  deleteDisabled: {
    opacity: 0.5,
  },

  /* CONTENT */

  content: {
    padding: 18,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },

  desktopContent: {
    paddingHorizontal: 30,
    paddingTop: 28,
  },

  /* SECTION */

  section: {
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 9,
  },

  input: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },

  /* CATEGORY */

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  categoryButton: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 9,
  },

  categoryText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },

  /* ROW */

  row: {
    gap: 16,
  },

  desktopRow: {
    flexDirection: 'row',
  },

  halfSection: {
    marginBottom: 22,
    flex: 1,
  },

  desktopHalf: {
    flex: 1,
  },

  iconInput: {
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  inputValue: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  /* WEB INPUT */

  webInputWrapper: {
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  /* REMINDER */

  reminderCard: {
    minHeight: 78,
    marginBottom: 25,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  reminderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  reminderSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  /* SUBTASK */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  countText: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 7,
    borderRadius: 14,
    backgroundColor: '#E8F1FF',
    color: '#126EED',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '800',
  },

  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },

  subtaskInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 14,
  },

  addSubtaskButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtaskRow: {
    minHeight: 52,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  subtaskCheck: {
    marginRight: 10,
  },

  subtaskText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  subtaskDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },

  emptySubtasks: {
    minHeight: 70,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  emptySubtasksText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* NOTES */

  notesInput: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },

  /* COMPLETED */

  completedCard: {
    minHeight: 78,
    marginBottom: 25,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  completedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  completedIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  completedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  completedSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  /* SAVE */

  saveButton: {
    height: 57,
    borderRadius: 17,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  /* DELETE */

  deleteButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 40,
  },

  /* NOT FOUND */

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  notFoundIcon: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  notFoundTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  notFoundText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 350,
    marginBottom: 25,
  },

  backButton: {
    minHeight: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});