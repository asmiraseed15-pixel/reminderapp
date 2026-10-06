import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useRouter,
} from 'expo-router';

import {
  useTasks,
} from '../context/TaskContext';


// =====================================================
// TYPES
// =====================================================

type FilterType =
  | 'all'
  | 'pending'
  | 'completed'
  | 'saved';


// =====================================================
// SCREEN
// =====================================================

export default function ManageTasksScreen() {

  const router = useRouter();

  const {
    tasks,
    toggleTask,
    toggleSavedTask,
    deleteTask,
  } = useTasks();

  const {
    width,
  } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [search, setSearch] =
    useState('');

  const [filter, setFilter] =
    useState<FilterType>('all');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  // ===================================================
  // COUNTS
  // ===================================================

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task: any) =>
        task.completed === true
    ).length;

  const pendingTasks =
    tasks.filter(
      (task: any) =>
        task.completed !== true
    ).length;

  const savedTasks =
    tasks.filter(
      (task: any) =>
        task.saved === true
    ).length;


  // ===================================================
  // FILTER TASKS
  // ===================================================

  const filteredTasks =
    useMemo(() => {

      let result =
        [...tasks];

      // -------------------------------
      // STATUS FILTER
      // -------------------------------

      if (filter === 'pending') {

        result =
          result.filter(
            (task: any) =>
              task.completed !== true
          );

      }

      if (filter === 'completed') {

        result =
          result.filter(
            (task: any) =>
              task.completed === true
          );

      }

      if (filter === 'saved') {

        result =
          result.filter(
            (task: any) =>
              task.saved === true
          );

      }

      // -------------------------------
      // SEARCH
      // -------------------------------

      const query =
        search.trim().toLowerCase();

      if (query) {

        result =
          result.filter(
            (task: any) =>
              String(
                task.title || ''
              )
                .toLowerCase()
                .includes(query) ||

              String(
                task.category || ''
              )
                .toLowerCase()
                .includes(query) ||

              String(
                task.notes || ''
              )
                .toLowerCase()
                .includes(query)
          );
      }

      return result;

    }, [
      tasks,
      filter,
      search,
    ]);


  // ===================================================
  // CREATE TASK
  // ===================================================

  const handleCreateTask = () => {

    router.push(
      '/add-task' as any
    );
  };


  // ===================================================
  // EDIT TASK
  // ===================================================

  const handleEditTask = (
    id: string
  ) => {

    router.push({
      pathname:
        '/task-details' as any,
      params: {
        id,
      },
    } as any);
  };


  // ===================================================
  // COMPLETE TASK
  // ===================================================

  const handleToggleComplete = async (
    id: string
  ) => {

    try {

      await toggleTask(id);

    } catch (error) {

      console.log(
        'Complete task error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to update the task.'
      );
    }
  };


  // ===================================================
  // SAVE TASK
  // ===================================================

  const handleToggleSaved = async (
    id: string
  ) => {

    try {

      await toggleSavedTask(id);

    } catch (error) {

      console.log(
        'Save task error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to update saved task.'
      );
    }
  };


  // ===================================================
  // DELETE TASK
  // ===================================================

  const performDelete = async (
    id: string
  ) => {

    try {

      setDeletingId(id);

      await deleteTask(id);

    } catch (error) {

      console.log(
        'Delete task error:',
        error
      );

      Alert.alert(
        'Delete Failed',
        'Unable to delete this task.'
      );

    } finally {

      setDeletingId(null);

    }
  };


  const handleDeleteTask = (
    id: string,
    title: string
  ) => {

    if (Platform.OS === 'web') {

      const confirmed =
        window.confirm(
          `Delete "${title}"?\n\nThis task will be permanently removed.`
        );

      if (confirmed) {

        performDelete(id);

      }

      return;
    }

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            performDelete(id),
        },
      ]
    );
  };


  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {

    router.back();

  };


  // ===================================================
  // FILTER DATA
  // ===================================================

  const filters: {
    key: FilterType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    count: number;
  }[] = [

    {
      key: 'all',
      label: 'All',
      icon: 'list-outline',
      count: totalTasks,
    },

    {
      key: 'pending',
      label: 'Pending',
      icon: 'time-outline',
      count: pendingTasks,
    },

    {
      key: 'completed',
      label: 'Completed',
      icon: 'checkmark-circle-outline',
      count: completedTasks,
    },

    {
      key: 'saved',
      label: 'Saved',
      icon: 'star-outline',
      count: savedTasks,
    },

  ];


  // ===================================================
  // CATEGORY ICON
  // ===================================================

  const getCategoryIcon = (
    category: string
  ): keyof typeof Ionicons.glyphMap => {

    switch (
      category?.toLowerCase()
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
        return 'grid-outline';
    }
  };


  // ===================================================
  // PRIORITY COLOR
  // ===================================================

  const getPriorityIcon = (
    priority: string
  ): keyof typeof Ionicons.glyphMap => {

    switch (
      priority?.toLowerCase()
    ) {

      case 'high':
        return 'flame-outline';

      case 'medium':
        return 'flag-outline';

      default:
        return 'leaf-outline';
    }
  };


  // ===================================================
  // EMPTY MESSAGE
  // ===================================================

  const getEmptyTitle = () => {

    if (search.trim()) {
      return 'No matching tasks';
    }

    switch (filter) {

      case 'pending':
        return 'No pending tasks';

      case 'completed':
        return 'No completed tasks';

      case 'saved':
        return 'No saved tasks';

      default:
        return 'No tasks yet';
    }
  };


  const getEmptySubtitle = () => {

    if (search.trim()) {
      return 'Try a different task name or category.';
    }

    switch (filter) {

      case 'pending':
        return 'You have completed all your tasks. Great job!';

      case 'completed':
        return 'Complete a task and it will appear here.';

      case 'saved':
        return 'Save important tasks to access them quickly.';

      default:
        return 'Create your first task and start organizing your day.';
    }
  };


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      <View style={styles.container}>

        {/* =============================================
            HEADER
        ============================================= */}

        <View
          style={[
            styles.header,
            isDesktop &&
              styles.headerDesktop,
          ]}
        >

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >

            <Ionicons
              name="arrow-back"
              size={23}
              color="#111827"
            />

          </TouchableOpacity>


          <View
            style={styles.headerText}
          >

            <Text
              style={styles.headerTitle}
            >
              Manage Tasks
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Organize your day with ease
            </Text>

          </View>


          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={handleCreateTask}
            activeOpacity={0.85}
          >

            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </View>


        {/* =============================================
            CONTENT
        ============================================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            isDesktop &&
              styles.contentDesktop,
          ]}
        >

          {/* =========================================
              SUMMARY
          ========================================= */}

          <View
            style={[
              styles.summaryGrid,
              isDesktop &&
                styles.summaryGridDesktop,
            ]}
          >

            {/* TOTAL */}

            <View
              style={styles.summaryCard}
            >

              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor:
                      '#EAF2FF',
                  },
                ]}
              >

                <Ionicons
                  name="layers-outline"
                  size={21}
                  color="#126EED"
                />

              </View>

              <Text
                style={styles.summaryNumber}
              >
                {totalTasks}
              </Text>

              <Text
                style={styles.summaryLabel}
              >
                Total Tasks
              </Text>

            </View>


            {/* PENDING */}

            <View
              style={styles.summaryCard}
            >

              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor:
                      '#FFF6E5',
                  },
                ]}
              >

                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#F59E0B"
                />

              </View>

              <Text
                style={styles.summaryNumber}
              >
                {pendingTasks}
              </Text>

              <Text
                style={styles.summaryLabel}
              >
                Pending
              </Text>

            </View>


            {/* COMPLETED */}

            <View
              style={styles.summaryCard}
            >

              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor:
                      '#EAFBF1',
                  },
                ]}
              >

                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#16A34A"
                />

              </View>

              <Text
                style={styles.summaryNumber}
              >
                {completedTasks}
              </Text>

              <Text
                style={styles.summaryLabel}
              >
                Completed
              </Text>

            </View>


            {/* SAVED */}

            <View
              style={styles.summaryCard}
            >

              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor:
                      '#FFF3E8',
                  },
                ]}
              >

                <Ionicons
                  name="star-outline"
                  size={21}
                  color="#F97316"
                />

              </View>

              <Text
                style={styles.summaryNumber}
              >
                {savedTasks}
              </Text>

              <Text
                style={styles.summaryLabel}
              >
                Saved
              </Text>

            </View>

          </View>


          {/* =========================================
              CREATE TASK BANNER
          ========================================= */}

          <TouchableOpacity
            style={styles.createBanner}
            onPress={handleCreateTask}
            activeOpacity={0.9}
          >

            <View
              style={styles.createBannerIcon}
            >

              <Ionicons
                name="add-circle-outline"
                size={29}
                color="#FFFFFF"
              />

            </View>

            <View
              style={styles.createBannerText}
            >

              <Text
                style={styles.createBannerTitle}
              >
                Create a new task
              </Text>

              <Text
                style={styles.createBannerSubtitle}
              >
                Add something you want to accomplish
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#FFFFFF"
            />

          </TouchableOpacity>


          {/* =========================================
              SEARCH
          ========================================= */}

          <View
            style={styles.searchContainer}
          >

            <Ionicons
              name="search-outline"
              size={20}
              color="#64748B"
            />

            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search tasks..."
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
            />

            {search.length > 0 && (

              <TouchableOpacity
                onPress={() =>
                  setSearch('')
                }
              >

                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#94A3B8"
                />

              </TouchableOpacity>

            )}

          </View>


          {/* =========================================
              FILTERS
          ========================================= */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterContainer
            }
          >

            {filters.map(
              (item) => (

                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filterButton,

                    filter === item.key &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilter(item.key)
                  }
                  activeOpacity={0.8}
                >

                  <Ionicons
                    name={item.icon}
                    size={17}
                    color={
                      filter === item.key
                        ? '#FFFFFF'
                        : '#64748B'
                    }
                  />

                  <Text
                    style={[
                      styles.filterText,

                      filter === item.key &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>

                  <View
                    style={[
                      styles.filterCount,

                      filter === item.key &&
                        styles.filterCountActive,
                    ]}
                  >

                    <Text
                      style={[
                        styles.filterCountText,

                        filter === item.key &&
                          styles.filterCountTextActive,
                      ]}
                    >
                      {item.count}
                    </Text>

                  </View>

                </TouchableOpacity>

              )
            )}

          </ScrollView>


          {/* =========================================
              TASK SECTION HEADER
          ========================================= */}

          <View
            style={styles.taskHeader}
          >

            <View>

              <Text
                style={styles.taskHeaderTitle}
              >
                {filter === 'all'
                  ? 'All Tasks'
                  : filter === 'pending'
                  ? 'Pending Tasks'
                  : filter === 'completed'
                  ? 'Completed Tasks'
                  : 'Saved Tasks'}
              </Text>

              <Text
                style={styles.taskHeaderSubtitle}
              >
                {filteredTasks.length}{' '}
                {filteredTasks.length === 1
                  ? 'task'
                  : 'tasks'}{' '}
                found
              </Text>

            </View>

          </View>


          {/* =========================================
              TASK LIST
          ========================================= */}

          {filteredTasks.length === 0 ? (

            <View
              style={styles.emptyCard}
            >

              <View
                style={styles.emptyIcon}
              >

                <Ionicons
                  name={
                    search.trim()
                      ? 'search-outline'
                      : filter === 'saved'
                      ? 'star-outline'
                      : 'clipboard-outline'
                  }
                  size={36}
                  color="#126EED"
                />

              </View>

              <Text
                style={styles.emptyTitle}
              >
                {getEmptyTitle()}
              </Text>

              <Text
                style={styles.emptySubtitle}
              >
                {getEmptySubtitle()}
              </Text>

              {!search.trim() &&
                filter === 'all' && (

                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={
                      handleCreateTask
                    }
                    activeOpacity={0.85}
                  >

                    <Ionicons
                      name="add"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.emptyButtonText}
                    >
                      Create Your First Task
                    </Text>

                  </TouchableOpacity>

                )}

            </View>

          ) : (

            <View
              style={styles.taskList}
            >

              {filteredTasks.map(
                (task: any) => {

                  const id =
                    String(task.id);

                  const title =
                    String(
                      task.title ||
                      'Untitled Task'
                    );

                  const category =
                    String(
                      task.category ||
                      'Other'
                    );

                  const priority =
                    String(
                      task.priority ||
                      'Medium'
                    );

                  const isCompleted =
                    task.completed === true;

                  const isSaved =
                    task.saved === true;

                  const isDeleting =
                    deletingId === id;

                  return (

                    <View
                      key={id}
                      style={[
                        styles.taskCard,

                        isCompleted &&
                          styles.completedTaskCard,
                      ]}
                    >

                      {/* TASK MAIN */}

                      <View
                        style={styles.taskMain}
                      >

                        {/* CHECK */}

                        <TouchableOpacity
                          style={[
                            styles.checkButton,

                            isCompleted &&
                              styles.checkButtonCompleted,
                          ]}
                          onPress={() =>
                            handleToggleComplete(
                              id
                            )
                          }
                          activeOpacity={0.8}
                        >

                          {isCompleted ? (

                            <Ionicons
                              name="checkmark"
                              size={19}
                              color="#FFFFFF"
                            />

                          ) : (

                            <View
                              style={
                                styles.emptyCheck
                              }
                            />

                          )}

                        </TouchableOpacity>


                        {/* DETAILS */}

                        <TouchableOpacity
                          style={styles.taskDetails}
                          onPress={() =>
                            handleEditTask(id)
                          }
                          activeOpacity={0.8}
                        >

                          <Text
                            style={[
                              styles.taskTitle,

                              isCompleted &&
                                styles.taskTitleCompleted,
                            ]}
                            numberOfLines={2}
                          >
                            {title}
                          </Text>


                          <View
                            style={styles.taskMeta}
                          >

                            <View
                              style={styles.metaBadge}
                            >

                              <Ionicons
                                name={getCategoryIcon(
                                  category
                                )}
                                size={13}
                                color="#126EED"
                              />

                              <Text
                                style={styles.metaText}
                              >
                                {category}
                              </Text>

                            </View>


                            <View
                              style={styles.metaBadge}
                            >

                              <Ionicons
                                name={getPriorityIcon(
                                  priority
                                )}
                                size={13}
                                color={
                                  priority.toLowerCase() ===
                                  'high'
                                    ? '#EF4444'
                                    : '#64748B'
                                }
                              />

                              <Text
                                style={styles.metaText}
                              >
                                {priority}
                              </Text>

                            </View>

                          </View>


                          {/* DATE */}

                          {(task.date ||
                            task.time) && (

                            <View
                              style={styles.dateMeta}
                            >

                              <Ionicons
                                name="calendar-outline"
                                size={13}
                                color="#94A3B8"
                              />

                              <Text
                                style={
                                  styles.dateMetaText
                                }
                              >
                                {task.date ||
                                  'No date'}

                                {task.time
                                  ? ` • ${task.time}`
                                  : ''}
                              </Text>

                            </View>

                          )}

                        </TouchableOpacity>


                        {/* SAVE */}

                        <TouchableOpacity
                          style={
                            styles.saveIconButton
                          }
                          onPress={() =>
                            handleToggleSaved(
                              id
                            )
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name={
                              isSaved
                                ? 'star'
                                : 'star-outline'
                            }
                            size={21}
                            color={
                              isSaved
                                ? '#F59E0B'
                                : '#94A3B8'
                            }
                          />

                        </TouchableOpacity>

                      </View>


                      {/* ACTIONS */}

                      <View
                        style={styles.actionRow}
                      >

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() =>
                            handleEditTask(id)
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name="create-outline"
                            size={17}
                            color="#126EED"
                          />

                          <Text
                            style={
                              styles.editActionText
                            }
                          >
                            Edit
                          </Text>

                        </TouchableOpacity>


                        <TouchableOpacity
                          style={[
                            styles.actionButton,

                            isCompleted &&
                              styles.completedActionButton,
                          ]}
                          onPress={() =>
                            handleToggleComplete(
                              id
                            )
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name={
                              isCompleted
                                ? 'checkmark-circle'
                                : 'checkmark-circle-outline'
                            }
                            size={17}
                            color={
                              isCompleted
                                ? '#16A34A'
                                : '#64748B'
                            }
                          />

                          <Text
                            style={
                              styles.completeActionText
                            }
                          >
                            {isCompleted
                              ? 'Completed'
                              : 'Complete'}
                          </Text>

                        </TouchableOpacity>


                        <TouchableOpacity
                          style={
                            styles.actionButton
                          }
                          onPress={() =>
                            handleDeleteTask(
                              id,
                              title
                            )
                          }
                          disabled={isDeleting}
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name={
                              isDeleting
                                ? 'hourglass-outline'
                                : 'trash-outline'
                            }
                            size={17}
                            color="#EF4444"
                          />

                          <Text
                            style={
                              styles.deleteActionText
                            }
                          >
                            {isDeleting
                              ? 'Deleting...'
                              : 'Delete'}
                          </Text>

                        </TouchableOpacity>

                      </View>

                    </View>

                  );
                }
              )}

            </View>

          )}


          {/* =========================================
              PRODUCTIVITY TIP
          ========================================= */}

          <View
            style={styles.tipCard}
          >

            <View
              style={styles.tipIcon}
            >

              <Ionicons
                name="bulb-outline"
                size={22}
                color="#126EED"
              />

            </View>

            <View
              style={styles.tipContent}
            >

              <Text
                style={styles.tipTitle}
              >
                Productivity Tip
              </Text>

              <Text
                style={styles.tipText}
              >
                Break large goals into smaller tasks.
                Completing small tasks consistently
                helps you build momentum.
              </Text>

            </View>

          </View>


          <View
            style={styles.bottomSpace}
          />

        </ScrollView>

      </View>

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    minHeight: 78,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF7',
  },

  headerDesktop: {
    paddingHorizontal: 30,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 11,
  },

  headerAddButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  // ===================================================
  // CONTENT
  // ===================================================

  content: {
    padding: 18,
    paddingBottom: 50,
  },

  contentDesktop: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },

  // ===================================================
  // SUMMARY
  // ===================================================

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  summaryGridDesktop: {
    gap: 14,
  },

  summaryCard: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  summaryNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // ===================================================
  // CREATE BANNER
  // ===================================================

  createBanner: {
    marginTop: 16,
    backgroundColor: '#126EED',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  createBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createBannerText: {
    flex: 1,
    marginLeft: 13,
  },

  createBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  createBannerSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    marginTop: 3,
  },

  // ===================================================
  // SEARCH
  // ===================================================

  searchContainer: {
    marginTop: 18,
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#111827',
    fontSize: 14,
    paddingVertical: 13,
  },

  // ===================================================
  // FILTER
  // ===================================================

  filterContainer: {
    paddingVertical: 14,
    gap: 8,
  },

  filterButton: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  filterButtonActive: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },

  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  filterCount: {
    minWidth: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  filterCountText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },

  filterCountTextActive: {
    color: '#FFFFFF',
  },

  // ===================================================
  // TASK HEADER
  // ===================================================

  taskHeader: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  taskHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  taskHeaderSubtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 11,
  },

  // ===================================================
  // TASK LIST
  // ===================================================

  taskList: {
    gap: 11,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  completedTaskCard: {
    opacity: 0.82,
  },

  taskMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // ===================================================
  // CHECK
  // ===================================================

  checkButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#126EED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 11,
  },

  checkButtonCompleted: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },

  emptyCheck: {
    width: 17,
    height: 17,
    borderRadius: 9,
  },

  // ===================================================
  // DETAILS
  // ===================================================

  taskDetails: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '750' as any,
    color: '#1E293B',
  },

  taskTitleCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  metaBadge: {
    backgroundColor: '#F5F8FD',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },

  dateMeta: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateMetaText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },

  // ===================================================
  // SAVE ICON
  // ===================================================

  saveIconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },

  // ===================================================
  // ACTIONS
  // ===================================================

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  actionButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  completedActionButton: {
    backgroundColor: '#F0FDF4',
  },

  editActionText: {
    color: '#126EED',
    fontSize: 11,
    fontWeight: '700',
  },

  completeActionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  deleteActionText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },

  // ===================================================
  // EMPTY
  // ===================================================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 330,
    marginTop: 6,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#126EED',
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // ===================================================
  // TIP
  // ===================================================

  tipCard: {
    marginTop: 18,
    backgroundColor: '#EAF2FF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    color: '#126EED',
    fontSize: 13,
    fontWeight: '800',
  },

  tipText: {
    color: '#475569',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  bottomSpace: {
    height: 30,
  },

});