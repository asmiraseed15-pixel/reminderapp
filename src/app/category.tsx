
import React, { useMemo } from 'react';

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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTasks } from '../context/TaskContext';
import { Task, TaskCategory } from '../../types/task';

type CategoryInfo = {
  name: TaskCategory;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const CATEGORIES: CategoryInfo[] = [
  {
    name: 'Personal',
    icon: 'person-outline',
    description: 'Your personal activities',
  },
  {
    name: 'Work',
    icon: 'briefcase-outline',
    description: 'Work and professional tasks',
  },
  {
    name: 'Other',
    icon: 'folder-outline',
    description: 'Other tasks and activities',
  },
  {
    name: 'Health',
    icon: 'heart-outline',
    description: 'Health and wellness',
  },
  {
    name: 'Study',
    icon: 'book-outline',
    description: 'Learning and education',
  },
  {
    name: 'Shopping',
    icon: 'bag-handle-outline',
    description: 'Things you need to buy',
  },
];

export default function CategoryScreen() {
  const router = useRouter();

  const { tasks } = useTasks();

  const params = useLocalSearchParams<{
    selectedCategory?: string;
  }>();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 800;

  /*
   * Convert category parameter into a valid TaskCategory.
   */
  const selectedCategory = useMemo(() => {
    if (!params.selectedCategory) {
      return null;
    }

    const found = CATEGORIES.find(
      category =>
        category.name.toLowerCase() ===
        String(params.selectedCategory).toLowerCase()
    );

    return found?.name ?? null;
  }, [params.selectedCategory]);

  /*
   * Count tasks for each category.
   */
  const getCategoryTasks = (category: TaskCategory): Task[] => {
    return tasks.filter(
      task =>
        String(task.category).toLowerCase() ===
        String(category).toLowerCase()
    );
  };

  /*
   * Open task details.
   */
  const openTask = (task: Task) => {
    router.push({
      pathname: '/task-details',
      params: {
        id: task.id,
      },
    });
  };

  /*
   * Open add task page with selected category.
   */
  const addTask = (category?: TaskCategory) => {
    if (category) {
      router.push({
        pathname: '/add-task',
        params: {
          category,
        },
      });
    } else {
      router.push('/add-task');
    }
  };

  /*
   * Category card.
   */
  const renderCategoryCard = (category: CategoryInfo) => {
    const categoryTasks = getCategoryTasks(category.name);

    const completedCount = categoryTasks.filter(
      task => task.completed
    ).length;

    const pendingCount = categoryTasks.length - completedCount;

    return (
      <TouchableOpacity
        key={category.name}
        activeOpacity={0.85}
        style={[
          styles.categoryCard,
          isDesktop && styles.categoryCardDesktop,
        ]}
        onPress={() => {
          router.push({
            pathname: '/category',
            params: {
              selectedCategory: category.name,
            },
          });
        }}
      >
        <View style={styles.categoryTop}>
          <View style={styles.categoryIcon}>
            <Ionicons
              name={category.icon}
              size={28}
              color="#126EED"
            />
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#126EED"
            />
          </View>
        </View>

        <Text style={styles.categoryName}>
          {category.name}
        </Text>

        <Text style={styles.categoryDescription}>
          {category.description}
        </Text>

        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {categoryTasks.length}
            </Text>

            <Text style={styles.statLabel}>
              Total
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>
              Done
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * If a category was selected,
   * show the tasks inside that category.
   */
  if (selectedCategory) {
    const categoryInfo = CATEGORIES.find(
      category => category.name === selectedCategory
    );

    const categoryTasks = getCategoryTasks(selectedCategory);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#111827"
              />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {selectedCategory}
              </Text>

              <Text style={styles.headerSubtitle}>
                {categoryInfo?.description}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerAddButton}
              activeOpacity={0.8}
              onPress={() => addTask(selectedCategory)}
            >
              <Ionicons
                name="add"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* CATEGORY SUMMARY */}

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name={
                  categoryInfo?.icon ??
                  'folder-outline'
                }
                size={30}
                color="#126EED"
              />
            </View>

            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>
                {categoryTasks.length} Tasks
              </Text>

              <Text style={styles.summarySubtitle}>
                {
                  categoryTasks.filter(
                    task => !task.completed
                  ).length
                }{' '}
                tasks remaining
              </Text>
            </View>
          </View>

          {/* TASK LIST */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Tasks
            </Text>

            <Text style={styles.sectionCount}>
              {categoryTasks.length}
            </Text>
          </View>

          {categoryTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={42}
                  color="#126EED"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No tasks yet
              </Text>

              <Text style={styles.emptyText}>
                Add your first {selectedCategory.toLowerCase()} task.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.85}
                onPress={() => addTask(selectedCategory)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.emptyButtonText}>
                  Add Task
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            categoryTasks.map(task => (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.85}
                style={styles.taskCard}
                onPress={() => openTask(task)}
              >
                <View
                  style={[
                    styles.taskCheck,
                    task.completed &&
                      styles.taskCheckCompleted,
                  ]}
                >
                  {task.completed && (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed &&
                        styles.completedTaskTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>

                  <View style={styles.taskMeta}>
                    {task.date ? (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#6B7280"
                        />

                        <Text style={styles.metaText}>
                          {task.date}
                        </Text>
                      </View>
                    ) : null}

                    {task.time ? (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6B7280"
                        />

                        <Text style={styles.metaText}>
                          {task.time}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            ))
          )}

          {/* ADD BUTTON */}

          {categoryTasks.length > 0 && (
            <TouchableOpacity
              style={styles.addTaskButton}
              activeOpacity={0.85}
              onPress={() => addTask(selectedCategory)}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color="#FFFFFF"
              />

              <Text style={styles.addTaskButtonText}>
                Add {selectedCategory} Task
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /*
   * Main category page.
   */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.mainHeader}>
          <View>
            <Text style={styles.mainTitle}>
              Categories
            </Text>

            <Text style={styles.mainSubtitle}>
              Organize your tasks your way
            </Text>
          </View>

          <TouchableOpacity
            style={styles.mainAddButton}
            activeOpacity={0.8}
            onPress={() => addTask()}
          >
            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* OVERVIEW CARD */}

        <View style={styles.overviewCard}>
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewTitle}>
              Your Productivity
            </Text>

            <Text style={styles.overviewSubtitle}>
              Keep everything organized
            </Text>
          </View>

          <View style={styles.overviewCircle}>
            <Text style={styles.overviewNumber}>
              {tasks.length}
            </Text>

            <Text style={styles.overviewLabel}>
              Tasks
            </Text>
          </View>
        </View>

        {/* CATEGORY TITLE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            All Categories
          </Text>

          <Text style={styles.sectionCount}>
            {CATEGORIES.length}
          </Text>
        </View>

        {/* CATEGORY GRID */}

        <View
          style={[
            styles.categoryGrid,
            isDesktop && styles.categoryGridDesktop,
          ]}
        >
          {CATEGORIES.map(renderCategoryCard)}
        </View>

        {/* QUICK ADD */}

        <View style={styles.quickAddCard}>
          <View style={styles.quickAddIcon}>
            <Ionicons
              name="sparkles-outline"
              size={25}
              color="#126EED"
            />
          </View>

          <View style={styles.quickAddContent}>
            <Text style={styles.quickAddTitle}>
              Create a new task
            </Text>

            <Text style={styles.quickAddSubtitle}>
              Add reminders, dates and notes to stay organized.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickAddButton}
            activeOpacity={0.85}
            onPress={() => addTask()}
          >
            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* HEADER */

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  mainTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  mainSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B7280',
  },

  mainAddButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#126EED',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  /* OVERVIEW */

  overviewCard: {
    backgroundColor: '#126EED',
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  overviewLeft: {
    flex: 1,
    paddingRight: 15,
  },

  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  overviewSubtitle: {
    marginTop: 7,
    fontSize: 13,
    color: '#DCEAFF',
    lineHeight: 19,
  },

  overviewCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#126EED',
  },

  overviewLabel: {
    marginTop: 1,
    fontSize: 11,
    color: '#6B7280',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  sectionCount: {
    marginLeft: 9,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#b1c5e5',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 5,
    fontSize: 13,
    fontWeight: '700',
    color: '#126EED',
  },

  /* CATEGORY GRID */

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryGridDesktop: {
    justifyContent: 'flex-start',
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#E8ECF3',

    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  categoryCardDesktop: {
    width: 260,
    marginRight: 14,
  },

  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryName: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  categoryDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },

  categoryStats: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#9CA3AF',
  },

  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#E5E7EB',
  },

  /* QUICK ADD */

  quickAddCard: {
    marginTop: 18,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  quickAddIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickAddContent: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  quickAddTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  quickAddSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },

  quickAddButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* CATEGORY DETAIL HEADER */

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
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  headerAddButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    marginBottom: 25,
  },

  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryText: {
    marginLeft: 14,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  summarySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  /* TASK */

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  taskCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskCheckCompleted: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  taskContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  taskTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: '#111827',
  },

  completedTaskTitle: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 7,
    gap: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#6B7280',
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 17,
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },

  emptyButton: {
    marginTop: 20,
    height: 45,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ADD TASK */

  addTaskButton: {
    height: 52,
    borderRadius: 17,
    backgroundColor: '#126EED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },

  addTaskButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});