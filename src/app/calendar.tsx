
import React, {
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTasks,
} from '../context/TaskContext';

import BottomNav from '../components/BottomNav';

export default function CalendarScreen() {
  const { tasks } = useTasks();

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    );

  const currentMonth = new Date();

  const daysInMonth =
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  const monthName =
    currentMonth.toLocaleString(
      'default',
      {
        month: 'long',
      }
    );

  const year =
    currentMonth.getFullYear();

  const selectedTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.date === selectedDate
      ),
    [tasks, selectedDate]
  );

  const createDate = (
    day: number
  ) => {
    return `${year}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Calendar
        </Text>

        <Ionicons
          name="calendar"
          size={26}
          color="#126EED"
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.monthCard}>
          <Text style={styles.month}>
            {monthName} {year}
          </Text>

          <View
            style={styles.daysGrid}
          >
            {days.map((day) => {
              const value =
                createDate(day);

              const selected =
                value === selectedDate;

              const hasTask =
                tasks.some(
                  (task) =>
                    task.date === value
                );

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.day,
                    selected &&
                      styles.selectedDay,
                  ]}
                  onPress={() =>
                    setSelectedDate(
                      value
                    )
                  }
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected &&
                        styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>

                  {hasTask && (
                    <View
                      style={[
                        styles.dot,
                        selected &&
                          styles.selectedDot,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.dateTitle}>
          {selectedDate}
        </Text>

        {selectedTasks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color="#126EED"
            />

            <Text style={styles.emptyText}>
              No tasks for this date
            </Text>
          </View>
        ) : (
          selectedTasks.map(
            (task) => (
              <View
                key={task.id}
                style={styles.task}
              >
                <View
                  style={styles.timeBox}
                >
                  <Text
                    style={
                      styles.time
                    }
                  >
                    {task.time}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.taskTitle
                    }
                  >
                    {task.title}
                  </Text>

                  <Text
                    style={
                      styles.category
                    }
                  >
                    {task.category}
                  </Text>
                </View>

                <Ionicons
                  name={
                    task.completed
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={23}
                  color="#126EED"
                />
              </View>
            )
          )
        )}
      </ScrollView>

      <BottomNav active="calendar" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
  },

  content: {
    padding: 18,
  },

  monthCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
  },

  month: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 18,
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  day: {
    width: '12%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },

  selectedDay: {
    backgroundColor: '#126EED',
  },

  dayText: {
    fontWeight: '700',
    color: '#333',
  },

  selectedDayText: {
    color: '#FFF',
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#126EED',
    marginTop: 3,
  },

  selectedDot: {
    backgroundColor: '#FFF',
  },

  dateTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 25,
    marginBottom: 12,
  },

  task: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  timeBox: {
    backgroundColor: '#EAF3FF',
    padding: 9,
    borderRadius: 10,
    marginRight: 12,
  },

  time: {
    color: '#126EED',
    fontWeight: '800',
    fontSize: 11,
  },

  taskTitle: {
    fontWeight: '800',
    fontSize: 14,
  },

  category: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },

  empty: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },

  emptyText: {
    color: '#888',
    marginTop: 10,
  },
});