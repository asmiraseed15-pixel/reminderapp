import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';

type CalendarDay = {
  date: Date;
  currentMonth: boolean;
};

export default function CalendarPlanning() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { tasks, toggleTask } = useTasks();

  const [currentMonth, setCurrentMonth] = useState(
    new Date()
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );

  const isTablet = width >= 700;
  const isDesktop = width >= 1100;

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const makeDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(date.getDate()).padStart(
      2,
      '0'
    )}`;
  };

  const parseTaskDate = (value: any) => {
    if (!value) return null;

    const text = String(value);

    const parsed = new Date(`${text}T00:00:00`);

    if (isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  };

  const todayKey = makeDateKey(new Date());

  const selectedDateKey = makeDateKey(selectedDate);

  const monthTitle = currentMonth.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const result: CalendarDay[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      result.push({
        date: new Date(
          year,
          month - 1,
          previousMonthDays - i
        ),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    while (result.length < 42) {
      const nextDay =
        result.length -
        (firstWeekday + daysInMonth) +
        1;

      result.push({
        date: new Date(year, month + 1, nextDay),
        currentMonth: false,
      });
    }

    return result;
  }, [currentMonth]);

  const getTasksForDate = (date: Date) => {
    const key = makeDateKey(date);

    return safeTasks.filter(
      (task: any) =>
        String(task.date || '') === key
    );
  };

  const selectedTasks = useMemo(() => {
    return getTasksForDate(selectedDate);
  }, [tasks, selectedDate]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();

    return [...safeTasks]
      .filter((task: any) => {
        const date = parseTaskDate(task.date);

        if (!date) return false;

        return date.getTime() >=
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).getTime();
      })
      .sort((a: any, b: any) => {
        const aDate =
          parseTaskDate(a.date)?.getTime() || 0;

        const bDate =
          parseTaskDate(b.date)?.getTime() || 0;

        return aDate - bDate;
      })
      .slice(0, 5);
  }, [tasks]);

  const totalThisMonth = useMemo(() => {
    return safeTasks.filter((task: any) => {
      const date = parseTaskDate(task.date);

      if (!date) return false;

      return (
        date.getFullYear() ===
          currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth()
      );
    }).length;
  }, [tasks, currentMonth]);

  const completedThisMonth = useMemo(() => {
    return safeTasks.filter((task: any) => {
      const date = parseTaskDate(task.date);

      if (!date) return false;

      return (
        date.getFullYear() ===
          currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth() &&
        task.completed === true
      );
    }).length;
  }, [tasks, currentMonth]);

  const changeMonth = (direction: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  const goToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);

    if (!(
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() ===
        currentMonth.getFullYear()
    )) {
      setCurrentMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );
    }
  };

  const openTask = (id: string) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: String(id),
      },
    } as any);
  };

  const addTask = () => {
    router.push({
      pathname: '/add-task',
      params: {
        date: selectedDateKey,
      },
    } as any);
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTaskDate = (date: any) => {
    const parsed = parseTaskDate(date);

    if (!parsed) return 'No date';

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (
    category: string
  ): keyof typeof Ionicons.glyphMap => {
    switch (
      String(category || '').toLowerCase()
    ) {
      case 'work':
        return 'briefcase-outline';

      case 'study':
        return 'book-outline';

      case 'health':
        return 'heart-outline';

      case 'shopping':
        return 'cart-outline';

      case 'personal':
        return 'person-outline';

      default:
        return 'apps-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (
      String(category || '').toLowerCase()
    ) {
      case 'work':
        return '#FF8A3D';

      case 'study':
        return '#8B5CF6';

      case 'health':
        return '#20B486';

      case 'shopping':
        return '#E8A317';

      case 'personal':
        return '#126EED';

      default:
        return '#64748B';
    }
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
              Calendar Planning
            </Text>

            <Text style={styles.subtitle}>
              Plan your days and stay ahead of your tasks.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={addTask}
          >
            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* MONTH CARD */}

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              style={styles.monthArrow}
              onPress={() => changeMonth(-1)}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color="#172033"
              />
            </TouchableOpacity>

            <View style={styles.monthCenter}>
              <Text style={styles.monthTitle}>
                {monthTitle}
              </Text>

              <Text style={styles.monthStats}>
                {totalThisMonth} tasks •{' '}
                {completedThisMonth} completed
              </Text>
            </View>

            <TouchableOpacity
              style={styles.monthArrow}
              onPress={() => changeMonth(1)}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#172033"
              />
            </TouchableOpacity>
          </View>

          {/* TODAY BUTTON */}

          <TouchableOpacity
            style={styles.todayButton}
            onPress={goToday}
          >
            <Ionicons
              name="today-outline"
              size={17}
              color="#126EED"
            />

            <Text style={styles.todayButtonText}>
              Go to Today
            </Text>
          </TouchableOpacity>

          {/* WEEK DAYS */}

          <View style={styles.weekRow}>
            {[
              'Sun',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
            ].map((day) => (
              <Text
                key={day}
                style={styles.weekText}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* CALENDAR GRID */}

          <View style={styles.calendarGrid}>
            {calendarDays.map(
              ({ date, currentMonth: isCurrentMonth }, index) => {
                const key = makeDateKey(date);

                const dateTasks =
                  getTasksForDate(date);

                const isSelected =
                  key === selectedDateKey;

                const isToday =
                  key === todayKey;

                const completed =
                  dateTasks.filter(
                    (task: any) =>
                      task.completed === true
                  ).length;

                return (
                  <TouchableOpacity
                    key={`${key}-${index}`}
                    style={[
                      styles.dayCell,
                      !isCurrentMonth &&
                        styles.dayCellOutside,
                      isSelected &&
                        styles.dayCellSelected,
                    ]}
                    onPress={() => selectDate(date)}
                  >
                    <View
                      style={[
                        styles.dayNumber,
                        isToday &&
                          styles.dayNumberToday,
                        isSelected &&
                          styles.dayNumberSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !isCurrentMonth &&
                            styles.dayTextOutside,
                          isToday &&
                            styles.dayTextToday,
                          isSelected &&
                            styles.dayTextSelected,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>

                    {dateTasks.length > 0 && (
                      <View style={styles.taskIndicator}>
                        <View
                          style={[
                            styles.taskDot,
                            {
                              backgroundColor:
                                isSelected
                                  ? '#FFFFFF'
                                  : '#126EED',
                            },
                          ]}
                        />

                        {completed > 0 && (
                          <View
                            style={[
                              styles.completedDot,
                              {
                                backgroundColor:
                                  isSelected
                                    ? '#C7E0FF'
                                    : '#20B486',
                              },
                            ]}
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* SELECTED DATE */}

        <View style={styles.selectedSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {formatSelectedDate()}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {selectedTasks.length}{' '}
                {selectedTasks.length === 1
                  ? 'task'
                  : 'tasks'}{' '}
                scheduled
              </Text>
            </View>

            <TouchableOpacity
              style={styles.smallAddButton}
              onPress={addTask}
            >
              <Ionicons
                name="add"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {selectedTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color="#126EED"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No tasks planned
              </Text>

              <Text style={styles.emptyText}>
                This day is clear. Add a task and start
                planning your day.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={addTask}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.emptyButtonText}>
                  Add Task
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.taskList}>
              {selectedTasks.map((task: any) => {
                const categoryColor =
                  getCategoryColor(task.category);

                return (
                  <View
                    key={String(task.id)}
                    style={[
                      styles.taskCard,
                      task.completed &&
                        styles.completedTaskCard,
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        task.completed &&
                          styles.checkboxCompleted,
                      ]}
                      onPress={() =>
                        toggleTask(String(task.id))
                      }
                    >
                      {task.completed && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.taskContent}
                      onPress={() =>
                        openTask(String(task.id))
                      }
                    >
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed &&
                            styles.completedTaskTitle,
                        ]}
                        numberOfLines={2}
                      >
                        {String(
                          task.title ||
                            'Untitled Task'
                        )}
                      </Text>

                      <View style={styles.taskMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name={getCategoryIcon(
                              task.category
                            )}
                            size={14}
                            color={categoryColor}
                          />

                          <Text
                            style={[
                              styles.metaText,
                              {
                                color:
                                  categoryColor,
                              },
                            ]}
                          >
                            {String(
                              task.category ||
                                'Other'
                            )}
                          </Text>
                        </View>

                        {task.time && (
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#7C8494"
                            />

                            <Text
                              style={styles.metaText}
                            >
                              {String(task.time)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.openButton}
                      onPress={() =>
                        openTask(String(task.id))
                      }
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#8A93A2"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* UPCOMING */}

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Upcoming Tasks
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your next scheduled tasks
              </Text>
            </View>

            <Ionicons
              name="time-outline"
              size={22}
              color="#126EED"
            />
          </View>

          {upcomingTasks.length === 0 ? (
            <View style={styles.noUpcoming}>
              <Text style={styles.noUpcomingText}>
                No upcoming tasks.
              </Text>
            </View>
          ) : (
            upcomingTasks.map((task: any) => (
              <TouchableOpacity
                key={String(task.id)}
                style={styles.upcomingCard}
                onPress={() =>
                  openTask(String(task.id))
                }
              >
                <View style={styles.upcomingDate}>
                  <Text style={styles.upcomingDay}>
                    {parseTaskDate(task.date)?.getDate()}
                  </Text>

                  <Text style={styles.upcomingMonth}>
                    {parseTaskDate(
                      task.date
                    )?.toLocaleDateString('en-US', {
                      month: 'short',
                    })}
                  </Text>
                </View>

                <View style={styles.upcomingContent}>
                  <Text
                    style={styles.upcomingTitle}
                    numberOfLines={1}
                  >
                    {String(
                      task.title ||
                        'Untitled Task'
                    )}
                  </Text>

                  <Text style={styles.upcomingDateText}>
                    {formatTaskDate(task.date)}
                    {task.time
                      ? ` • ${String(task.time)}`
                      : ''}
                  </Text>
                </View>

                {task.completed ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={23}
                    color="#20B486"
                  />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={23}
                    color="#C7CDD7"
                  />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

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
    justifyContent: 'center',
    alignItems: 'center',
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

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#126EED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthCenter: {
    alignItems: 'center',
  },

  monthTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
  },

  monthStats: {
    fontSize: 11,
    color: '#8992A2',
    marginTop: 3,
  },

  todayButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 14,
  },

  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#126EED',
    marginLeft: 5,
  },

  weekRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 7,
  },

  weekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#8B94A4',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.2857%',
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },

  dayCellOutside: {
    opacity: 0.35,
  },

  dayCellSelected: {
    backgroundColor: '#126EED',
  },

  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayNumberToday: {
    backgroundColor: '#EAF2FF',
  },

  dayNumberSelected: {
    backgroundColor: 'transparent',
  },

  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
  },

  dayTextOutside: {
    color: '#AEB5C0',
  },

  dayTextToday: {
    color: '#126EED',
    fontWeight: '800',
  },

  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  taskIndicator: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },

  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
  },

  completedDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
  },

  selectedSection: {
    marginTop: 24,
  },

  upcomingSection: {
    marginTop: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#7F8999',
    marginTop: 3,
  },

  smallAddButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginTop: 13,
  },

  emptyText: {
    fontSize: 13,
    color: '#7F8999',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 330,
    marginTop: 5,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#126EED',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 17,
    gap: 6,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  taskList: {
    gap: 10,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  completedTaskCard: {
    opacity: 0.72,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C5CBD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkboxCompleted: {
    backgroundColor: '#20B486',
    borderColor: '#20B486',
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20293A',
    lineHeight: 20,
  },

  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8992A1',
  },

  taskMeta: {
    flexDirection: 'row',
    gap: 13,
    marginTop: 5,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },

  openButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  upcomingDate: {
    width: 47,
    height: 50,
    borderRadius: 13,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  upcomingDay: {
    fontSize: 17,
    fontWeight: '800',
    color: '#126EED',
  },

  upcomingMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#126EED',
    textTransform: 'uppercase',
  },

  upcomingContent: {
    flex: 1,
  },

  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20293A',
  },

  upcomingDateText: {
    fontSize: 11,
    color: '#7F8999',
    marginTop: 5,
  },

  noUpcoming: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  noUpcomingText: {
    color: '#8992A2',
    fontSize: 13,
  },

  bottomSpace: {
    height: 25,
  },
});