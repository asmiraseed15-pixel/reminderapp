import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';

type CategoryName =
  | 'Personal'
  | 'Work'
  | 'Study'
  | 'Health'
  | 'Shopping'
  | 'Other';

const categories: {
  name: CategoryName;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    name: 'Personal',
    icon: 'person-outline',
    description: 'Personal goals and daily activities',
  },
  {
    name: 'Work',
    icon: 'briefcase-outline',
    description: 'Office and professional tasks',
  },
  {
    name: 'Study',
    icon: 'book-outline',
    description: 'Learning and study activities',
  },
  {
    name: 'Health',
    icon: 'heart-outline',
    description: 'Health, fitness and wellness',
  },
  {
    name: 'Shopping',
    icon: 'cart-outline',
    description: 'Shopping and purchases',
  },
  {
    name: 'Other',
    icon: 'apps-outline',
    description: 'Everything else',
  },
];

export default function OrganizeCategories() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    tasks,
    toggleTask,
  } = useTasks();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryName | null>(null);

  const [search, setSearch] = useState('');

  const isTablet = width >= 700;
  const isDesktop = width >= 1100;

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const normalizeCategory = (value: any): CategoryName => {
    const category = String(value || 'Other').toLowerCase();

    if (category === 'personal') return 'Personal';
    if (category === 'work') return 'Work';
    if (category === 'study') return 'Study';
    if (category === 'health') return 'Health';
    if (category === 'shopping') return 'Shopping';

    return 'Other';
  };

  const getCategoryTasks = (category: CategoryName) => {
    return safeTasks.filter(
      (task: any) =>
        normalizeCategory(task.category) === category
    );
  };

  const categoryStats = useMemo(() => {
    return categories.map((category) => {
      const categoryTasks = getCategoryTasks(category.name);

      const completed = categoryTasks.filter(
        (task: any) => task.completed === true
      ).length;

      const pending = categoryTasks.length - completed;

      return {
        ...category,
        total: categoryTasks.length,
        completed,
        pending,
      };
    });
  }, [tasks]);

  const selectedTasks = useMemo(() => {
    if (!selectedCategory) return [];

    const query = search.trim().toLowerCase();

    return getCategoryTasks(selectedCategory).filter(
      (task: any) => {
        if (!query) return true;

        return (
          String(task.title || '')
            .toLowerCase()
            .includes(query) ||
          String(task.notes || '')
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [tasks, selectedCategory, search]);

  const totalTasks = safeTasks.length;

  const completedTasks = safeTasks.filter(
    (task: any) => task.completed === true
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const getCategoryColor = (category: CategoryName) => {
    switch (category) {
      case 'Personal':
        return '#4F8CFF';

      case 'Work':
        return '#FF8A3D';

      case 'Study':
        return '#8B5CF6';

      case 'Health':
        return '#20B486';

      case 'Shopping':
        return '#E8A317';

      default:
        return '#64748B';
    }
  };

  const getCategoryLightColor = (category: CategoryName) => {
    switch (category) {
      case 'Personal':
        return '#EAF2FF';

      case 'Work':
        return '#FFF0E6';

      case 'Study':
        return '#F1ECFF';

      case 'Health':
        return '#E7F8F2';

      case 'Shopping':
        return '#FFF7DF';

      default:
        return '#EEF1F4';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'No date';

    const parsed = new Date(`${String(date)}T00:00:00`);

    if (isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const openTask = (id: string) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: String(id),
      },
    } as any);
  };

  const createTask = () => {
    router.push('/add-task' as any);
  };

  const handleCategoryPress = (category: CategoryName) => {
    setSearch('');
    setSelectedCategory(category);
  };

  const closeCategory = () => {
    setSelectedCategory(null);
    setSearch('');
  };

  const selectedCategoryInfo = categories.find(
    (category) => category.name === selectedCategory
  );

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

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Organize Categories
            </Text>

            <Text style={styles.headerSubtitle}>
              Keep your tasks clean, grouped and easy to manage.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={createTask}
          >
            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* OVERVIEW */}

        <View style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <Ionicons
              name="grid-outline"
              size={27}
              color="#126EED"
            />
          </View>

          <View style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>
              Your Task Categories
            </Text>

            <Text style={styles.overviewDescription}>
              Organize your daily activities by choosing the right
              category for every task.
            </Text>
          </View>
        </View>

        {/* STATISTICS */}

        <View
          style={[
            styles.statsRow,
            isTablet && styles.statsRowTablet,
          ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconBlue}>
              <Ionicons
                name="list-outline"
                size={21}
                color="#126EED"
              />
            </View>

            <Text style={styles.statNumber}>
              {totalTasks}
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

        {/* CATEGORY TITLE */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Categories
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tap a category to view its tasks
            </Text>
          </View>
        </View>

        {/* CATEGORY GRID */}

        <View
          style={[
            styles.categoryGrid,
            isTablet && styles.categoryGridTablet,
            isDesktop && styles.categoryGridDesktop,
          ]}
        >
          {categoryStats.map((category) => {
            const color = getCategoryColor(category.name);
            const lightColor = getCategoryLightColor(
              category.name
            );

            const completionPercentage =
              category.total === 0
                ? 0
                : Math.round(
                    (category.completed / category.total) * 100
                  );

            return (
              <TouchableOpacity
                key={category.name}
                activeOpacity={0.85}
                style={[
                  styles.categoryCard,
                  isTablet && styles.categoryCardTablet,
                ]}
                onPress={() =>
                  handleCategoryPress(category.name)
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: lightColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={25}
                    color={color}
                  />
                </View>

                <View style={styles.categoryTopRow}>
                  <View style={styles.categoryNameWrapper}>
                    <Text style={styles.categoryName}>
                      {category.name}
                    </Text>

                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#A2A9B6"
                  />
                </View>

                <View style={styles.categoryStatsRow}>
                  <Text style={styles.taskCount}>
                    {category.total}{' '}
                    {category.total === 1
                      ? 'task'
                      : 'tasks'}
                  </Text>

                  <Text
                    style={[
                      styles.percentage,
                      { color },
                    ]}
                  >
                    {completionPercentage}%
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${completionPercentage}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.bottomStats}>
                  <Text style={styles.completedText}>
                    ✓ {category.completed} completed
                  </Text>

                  <Text style={styles.pendingText}>
                    {category.pending} pending
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SELECTED CATEGORY */}

        {selectedCategory && (
          <View style={styles.tasksSection}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedTitleRow}>
                <View
                  style={[
                    styles.selectedIcon,
                    {
                      backgroundColor:
                        getCategoryLightColor(
                          selectedCategory
                        ),
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedCategoryInfo?.icon ||
                      'apps-outline'
                    }
                    size={23}
                    color={getCategoryColor(
                      selectedCategory
                    )}
                  />
                </View>

                <View>
                  <Text style={styles.selectedTitle}>
                    {selectedCategory}
                  </Text>

                  <Text style={styles.selectedSubtitle}>
                    {getCategoryTasks(selectedCategory).length}{' '}
                    tasks in this category
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCategory}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#4B5563"
                />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}

            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#8992A3"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${selectedCategory} tasks...`}
                placeholderTextColor="#9AA2B1"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color="#9AA2B1"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* TASK LIST */}

            {selectedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="file-tray-outline"
                    size={35}
                    color="#126EED"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No tasks found
                </Text>

                <Text style={styles.emptyDescription}>
                  {search
                    ? 'Try a different search term.'
                    : `There are no ${selectedCategory.toLowerCase()} tasks yet.`}
                </Text>

                {!search && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={createTask}
                  >
                    <Ionicons
                      name="add"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.emptyButtonText}>
                      Create Task
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.taskList}>
                {selectedTasks.map((task: any) => {
                  const taskCompleted =
                    task.completed === true;

                  return (
                    <View
                      key={String(task.id)}
                      style={[
                        styles.taskCard,
                        taskCompleted &&
                          styles.taskCardCompleted,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          taskCompleted &&
                            styles.checkboxCompleted,
                        ]}
                        onPress={() =>
                          toggleTask(String(task.id))
                        }
                      >
                        {taskCompleted && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.taskMain}
                        activeOpacity={0.75}
                        onPress={() =>
                          openTask(String(task.id))
                        }
                      >
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.taskTitle,
                            taskCompleted &&
                              styles.taskTitleCompleted,
                          ]}
                        >
                          {String(
                            task.title || 'Untitled Task'
                          )}
                        </Text>

                        <View style={styles.taskMeta}>
                          <View
                            style={styles.metaItem}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color="#7C8494"
                            />

                            <Text
                              style={styles.metaText}
                            >
                              {formatDate(task.date)}
                            </Text>
                          </View>

                          {task.time && (
                            <View
                              style={styles.metaItem}
                            >
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
                        style={styles.openTaskButton}
                        onPress={() =>
                          openTask(String(task.id))
                        }
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#8B93A2"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* BOTTOM ACTION */}

        {!selectedCategory && (
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={createTask}
          >
            <View style={styles.createButtonIcon}>
              <Ionicons
                name="add"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.createButtonContent}>
              <Text style={styles.createButtonTitle}>
                Create New Task
              </Text>

              <Text style={styles.createButtonSubtitle}>
                Add a task and organize it into a category
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

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
    marginBottom: 24,
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
    borderColor: '#E8ECF2',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#7B8495',
    marginTop: 4,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  overviewCard: {
    backgroundColor: '#EAF2FF',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D7E6FF',
  },

  overviewIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  overviewContent: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
  },

  overviewDescription: {
    fontSize: 13,
    color: '#68748A',
    lineHeight: 19,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statsRowTablet: {
    gap: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E9EDF3',
  },

  statIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconGreen: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconOrange: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
    marginTop: 10,
  },

  statLabel: {
    fontSize: 12,
    color: '#7D8798',
    marginTop: 2,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#7D8798',
    marginTop: 3,
  },

  categoryGrid: {
    gap: 14,
  },

  categoryGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  categoryGridDesktop: {
    gap: 18,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EBF1',
    minHeight: 190,
  },

  categoryCardTablet: {
    width: '48.5%',
  },

  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  categoryNameWrapper: {
    flex: 1,
    paddingRight: 10,
  },

  categoryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
  },

  categoryDescription: {
    fontSize: 12,
    color: '#818A9A',
    marginTop: 4,
    lineHeight: 17,
  },

  categoryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },

  taskCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#697386',
  },

  percentage: {
    fontSize: 13,
    fontWeight: '800',
  },

  progressBackground: {
    height: 7,
    borderRadius: 10,
    backgroundColor: '#EEF1F5',
    overflow: 'hidden',
    marginTop: 8,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  completedText: {
    fontSize: 11,
    color: '#20A879',
    fontWeight: '600',
  },

  pendingText: {
    fontSize: 11,
    color: '#8992A2',
  },

  tasksSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EBF1',
  },

  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  selectedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  selectedTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
  },

  selectedSubtitle: {
    fontSize: 12,
    color: '#858E9E',
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E6EAF0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: '#172033',
    paddingVertical: 0,
  },

  taskList: {
    gap: 10,
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#ECEFF4',
  },

  taskCardCompleted: {
    opacity: 0.72,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C4CAD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxCompleted: {
    backgroundColor: '#20B486',
    borderColor: '#20B486',
  },

  taskMain: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20293A',
    lineHeight: 20,
  },

  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8A93A2',
  },

  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 11,
    color: '#7C8494',
    marginLeft: 4,
  },

  openTaskButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
  },

  emptyDescription: {
    fontSize: 13,
    color: '#818A99',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 19,
    maxWidth: 330,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#126EED',
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  createButton: {
    marginTop: 22,
    backgroundColor: '#126EED',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  createButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonContent: {
    flex: 1,
    marginLeft: 13,
  },

  createButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  createButtonSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    marginTop: 3,
  },

  bottomSpace: {
    height: 25,
  },
});