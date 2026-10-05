
import React, {
  useEffect,
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
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { useTasks } from '../context/TaskContext';

import BottomNav from '../components/BottomNav';

import { TaskCategory } from '../../types/task';


export default function TaskScreen() {

  const router = useRouter();

  const params =
    useLocalSearchParams();


  const {
    tasks,
    toggleTask,
    toggleSavedTask,
    deleteTask,
  } = useTasks();


  // =====================================================
  // SUCCESS QUOTE
  // =====================================================

  const [
    successQuote,
    setSuccessQuote,
  ] = useState('');

  const [
    quoteType,
    setQuoteType,
  ] = useState<
    'updated' | 'deleted' | ''
  >('');


  useEffect(() => {

    if (
      params.success &&
      params.quote
    ) {

      setQuoteType(
        String(
          params.success
        ) as
          | 'updated'
          | 'deleted'
      );

      setSuccessQuote(
        String(
          params.quote
        )
      );


      const timer =
        setTimeout(() => {

          setSuccessQuote('');
          setQuoteType('');

        }, 4000);


      return () => {
        clearTimeout(timer);
      };

    }

  }, [
    params.success,
    params.quote,
  ]);


  // =====================================================
  // REAL TIME DATE & TIME
  // =====================================================

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );


  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 1000);


    return () => {
      clearInterval(timer);
    };

  }, []);


  const dayName =
    currentTime.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
      }
    );


  const formattedDate =
    currentTime.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );


  const formattedTime =
    currentTime.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }
    );


  // =====================================================
  // TODAY DATE
  // =====================================================

  const today =
    useMemo(() => {

      const date =
        new Date();

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          '0'
        );

      const day =
        String(
          date.getDate()
        ).padStart(
          2,
          '0'
        );


      return `${year}-${month}-${day}`;

    }, []);


  // =====================================================
  // TODAY'S TASKS
  // =====================================================

  const todayTasks =
    useMemo(() => {

      return tasks.filter(
        (task) =>
          task.date === today
      );

    }, [
      tasks,
      today,
    ]);


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories: {
    name: TaskCategory;
    icon: string;
  }[] = [

    {
      name: 'Personal',
      icon: 'person-outline',
    },

    {
      name: 'Work',
      icon: 'briefcase-outline',
    },

    {
      name: 'Study',
      icon: 'book-outline',
    },

    {
      name: 'Health',
      icon: 'heart-outline',
    },

    {
      name: 'Shopping',
      icon: 'cart-outline',
    },

    {
      name: 'Other',
      icon: 'folder-outline',
    },

  ];


  // =====================================================
  // SHOW QUOTE
  // =====================================================

  const showQuote = (
    type:
      | 'updated'
      | 'deleted',
    quote: string
  ) => {

    setQuoteType(type);

    setSuccessQuote(
      quote
    );


    setTimeout(() => {

      setSuccessQuote('');

      setQuoteType('');

    }, 4000);

  };


  // =====================================================
  // DELETE TASK
  // =====================================================

  const performDelete =
    async (
      id: string
    ) => {

      try {

        console.log(
          'Starting task deletion:',
          id
        );


        await deleteTask(
          String(id)
        );


        console.log(
          'Task deleted successfully:',
          id
        );


        showQuote(
          'deleted',
          '🗑️ One less task, one more step toward a lighter and more productive day.'
        );


      } catch (error) {

        console.error(
          'Delete task failed:',
          error
        );


        Alert.alert(
          'Delete Failed',
          'Unable to delete this task. Please try again.'
        );

      }

    };


  const confirmDelete =
    (id: string) => {

      console.log(
        'Delete button pressed. Task ID:',
        id
      );


      // =================================================
      // WEB
      // =================================================

      if (
        Platform.OS === 'web'
      ) {

        const confirmed =
          window.confirm(
            'Are you sure you want to delete this task?'
          );


        if (confirmed) {

          performDelete(
            String(id)
          );

        }


        return;
      }


      // =================================================
      // ANDROID / IOS
      // =================================================

      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [

          {
            text: 'Cancel',

            style: 'cancel',
          },

          {
            text: 'Delete',

            style: 'destructive',

            onPress: () => {

              performDelete(
                String(id)
              );

            },
          },

        ]
      );

    };


  // =====================================================
  // OPEN ADD TASK
  // =====================================================

  const openAddTask =
    () => {

      router.push(
        '/add-task'
      );

    };


  // =====================================================
  // OPEN SAVED TASKS
  // =====================================================

  const openSavedTasks =
    () => {

      router.push(
        '/savedtasks'
      );

    };


  // =====================================================
  // OPEN CATEGORY
  // =====================================================

  const openCategory =
    (
      category: TaskCategory
    ) => {

      router.push({

        pathname:
          '/category',

        params: {
          name: category,
        },

      });

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <View>

          <Text
            style={styles.small}
          >
            Today's Flow
          </Text>


          <Text
            style={styles.title}
          >
            {dayName}
          </Text>


          <Text
            style={styles.liveTime}
          >
            {formattedTime}
          </Text>


          <Text
            style={styles.liveDate}
          >
            {formattedDate}
          </Text>

        </View>


        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddTask}
          activeOpacity={0.8}
        >

          <Ionicons
            name="add"
            size={28}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* =================================================
            SUCCESS QUOTE
        ================================================= */}

        {successQuote ? (

          <View
            style={[
              styles.quoteCard,

              quoteType ===
              'deleted'
                ? styles.deleteQuoteCard
                : styles.updateQuoteCard,
            ]}
          >

            <View
              style={[
                styles.quoteIcon,

                quoteType ===
                'deleted'
                  ? styles.deleteQuoteIcon
                  : styles.updateQuoteIcon,
              ]}
            >

              <Ionicons
                name={
                  quoteType ===
                  'deleted'
                    ? 'trash-outline'
                    : 'sparkles-outline'
                }
                size={23}
                color={
                  quoteType ===
                  'deleted'
                    ? '#EF4444'
                    : '#126EED'
                }
              />

            </View>


            <View
              style={
                styles.quoteContent
              }
            >

              <Text
                style={
                  styles.quoteHeading
                }
              >

                {quoteType ===
                'deleted'
                  ? 'Task Removed'
                  : 'Great Progress!'}

              </Text>


              <Text
                style={
                  styles.quoteText
                }
              >
                {successQuote}
              </Text>

            </View>

          </View>

        ) : null}


        {/* =================================================
            SAVED TASKS
        ================================================= */}

        <TouchableOpacity
          style={styles.savedCard}
          onPress={openSavedTasks}
          activeOpacity={0.8}
        >

          <View
            style={styles.savedIcon}
          >

            <Ionicons
              name="bookmark"
              size={24}
              color="#126EED"
            />

          </View>


          <View
            style={styles.savedInfo}
          >

            <Text
              style={styles.cardTitle}
            >
              Saved Tasks
            </Text>


            <Text
              style={styles.cardSubtitle}
            >

              {
                tasks.filter(
                  (task) =>
                    task.saved
                ).length
              }{' '}

              important tasks

            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={21}
            color="#999999"
          />

        </TouchableOpacity>


        {/* =================================================
            CATEGORIES
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Categories
        </Text>


        <View
          style={
            styles.categoryGrid
          }
        >

          {categories.map(
            (category) => (

              <TouchableOpacity
                key={
                  category.name
                }
                style={
                  styles.categoryCard
                }
                onPress={() =>
                  openCategory(
                    category.name
                  )
                }
                activeOpacity={0.8}
              >

                <View
                  style={
                    styles.categoryIcon
                  }
                >

                  <Ionicons
                    name={
                      category.icon as any
                    }
                    size={21}
                    color="#126EED"
                  />

                </View>


                <Text
                  style={
                    styles.categoryName
                  }
                >
                  {category.name}
                </Text>

              </TouchableOpacity>

            )
          )}

        </View>


        {/* =================================================
            TODAY TASK HEADER
        ================================================= */}

        <View
          style={
            styles.taskHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Today's Tasks
          </Text>


          <View
            style={
              styles.countContainer
            }
          >

            <Text
              style={styles.count}
            >
              {todayTasks.length}
            </Text>

          </View>

        </View>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {todayTasks.length === 0 ? (

          <View
            style={styles.empty}
          >

            <Ionicons
              name="checkmark-done-circle-outline"
              size={55}
              color="#126EED"
            />


            <Text
              style={
                styles.emptyTitle
              }
            >
              You're all clear!
            </Text>


            <Text
              style={
                styles.emptySubtitle
              }
            >
              Add a task to organize
              your day.
            </Text>


            <TouchableOpacity
              style={
                styles.emptyAddButton
              }
              onPress={openAddTask}
              activeOpacity={0.8}
            >

              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
              />


              <Text
                style={
                  styles.emptyAddText
                }
              >
                Add Task
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          /* =================================================
              TASK LIST
          ================================================= */

          todayTasks.map(
            (task) => (

              <View
                key={
                  String(task.id)
                }
                style={[
                  styles.taskCard,

                  task.completed &&
                    styles.completedCard,
                ]}
              >

                {/* COMPLETE */}

                <TouchableOpacity
                  style={
                    styles.completeButton
                  }
                  onPress={() =>
                    toggleTask(
                      String(task.id)
                    )
                  }
                  activeOpacity={0.7}
                >

                  <Ionicons
                    name={
                      task.completed
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={29}
                    color={
                      task.completed
                        ? '#126EED'
                        : '#B8BDC6'
                    }
                  />

                </TouchableOpacity>


                {/* INFORMATION */}

                <View
                  style={
                    styles.taskInfo
                  }
                >

                  <Text
                    style={[
                      styles.taskTitle,

                      task.completed &&
                        styles.completedText,
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>


                  <View
                    style={
                      styles.metaRow
                    }
                  >

                    <Text
                      style={
                        styles.taskMeta
                      }
                    >
                      {task.category}
                    </Text>


                    {task.time ? (

                      <>

                        <Text
                          style={
                            styles.dot
                          }
                        >
                          •
                        </Text>


                        <Text
                          style={
                            styles.taskMeta
                          }
                        >
                          {task.time}
                        </Text>

                      </>

                    ) : null}

                  </View>

                </View>


                {/* SAVE */}

                <TouchableOpacity
                  style={
                    styles.actionButton
                  }
                  onPress={() =>
                    toggleSavedTask(
                      String(task.id)
                    )
                  }
                  activeOpacity={0.7}
                >

                  <Ionicons
                    name={
                      task.saved
                        ? 'bookmark'
                        : 'bookmark-outline'
                    }
                    size={21}
                    color="#126EED"
                  />

                </TouchableOpacity>


                {/* DELETE */}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                  onPress={() =>
                    confirmDelete(
                      String(task.id)
                    )
                  }
                  activeOpacity={0.7}
                >

                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#F04444"
                  />

                </TouchableOpacity>

              </View>

            )
          )

        )}


        <View
          style={styles.bottomSpace}
        />

      </ScrollView>


      {/* =================================================
          BOTTOM NAV
      ================================================= */}

      <BottomNav
        active="task"
      />

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F5F7FA',
    },


    // ===================================================
    // HEADER
    // ===================================================

    header: {
      backgroundColor:
        '#FFFFFF',

      paddingHorizontal: 20,

      paddingTop: 15,

      paddingBottom: 18,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },


    small: {
      fontSize: 11,

      color: '#126EED',

      fontWeight: '800',

      letterSpacing: 1,
    },


    title: {
      fontSize: 29,

      fontWeight: '900',

      color: '#111827',

      marginTop: 3,
    },


    liveTime: {
      fontSize: 18,

      fontWeight: '800',

      color: '#126EED',

      marginTop: 3,
    },


    liveDate: {
      fontSize: 12,

      fontWeight: '500',

      color: '#7A8494',

      marginTop: 2,
    },


    addButton: {
      width: 48,

      height: 48,

      borderRadius: 16,

      backgroundColor:
        '#126EED',

      alignItems: 'center',

      justifyContent:
        'center',
    },


    // ===================================================
    // CONTENT
    // ===================================================

    content: {
      padding: 18,

      paddingBottom: 30,
    },


    // ===================================================
    // QUOTE
    // ===================================================

    quoteCard: {
      borderRadius: 20,

      padding: 15,

      marginBottom: 15,

      flexDirection: 'row',

      alignItems: 'center',

      borderWidth: 1,

      elevation: 3,

      shadowOpacity: 0.06,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 3,
      },
    },


    updateQuoteCard: {
      backgroundColor:
        '#EFF6FF',

      borderColor:
        '#BFDBFE',
    },


    deleteQuoteCard: {
      backgroundColor:
        '#FFF7F7',

      borderColor:
        '#FECACA',
    },


    quoteIcon: {
      width: 48,

      height: 48,

      borderRadius: 15,

      alignItems: 'center',

      justifyContent:
        'center',

      marginRight: 13,
    },


    updateQuoteIcon: {
      backgroundColor:
        '#DBEAFE',
    },


    deleteQuoteIcon: {
      backgroundColor:
        '#FEE2E2',
    },


    quoteContent: {
      flex: 1,
    },


    quoteHeading: {
      fontSize: 14,

      fontWeight: '900',

      color: '#111827',

      marginBottom: 4,
    },


    quoteText: {
      fontSize: 12,

      lineHeight: 18,

      color: '#4B5563',

      fontWeight: '600',
    },


    // ===================================================
    // SAVED
    // ===================================================

    savedCard: {
      backgroundColor:
        '#FFFFFF',

      borderRadius: 20,

      padding: 16,

      flexDirection: 'row',

      alignItems: 'center',

      elevation: 2,
    },


    savedIcon: {
      width: 48,

      height: 48,

      borderRadius: 15,

      backgroundColor:
        '#EAF3FF',

      alignItems: 'center',

      justifyContent:
        'center',

      marginRight: 13,
    },


    savedInfo: {
      flex: 1,
    },


    cardTitle: {
      fontSize: 16,

      fontWeight: '800',

      color: '#1A1D24',
    },


    cardSubtitle: {
      fontSize: 12,

      color: '#888888',

      marginTop: 4,
    },


    // ===================================================
    // SECTION
    // ===================================================

    sectionTitle: {
      fontSize: 18,

      fontWeight: '800',

      color: '#171A21',

      marginTop: 23,

      marginBottom: 12,
    },


    // ===================================================
    // CATEGORY
    // ===================================================

    categoryGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 10,
    },


    categoryCard: {
      width: '31.8%',

      minHeight: 95,

      backgroundColor:
        '#FFFFFF',

      borderRadius: 18,

      padding: 13,

      justifyContent:
        'center',
    },


    categoryIcon: {
      width: 39,

      height: 39,

      borderRadius: 13,

      backgroundColor:
        '#EAF3FF',

      alignItems: 'center',

      justifyContent:
        'center',
    },


    categoryName: {
      fontSize: 12,

      fontWeight: '700',

      marginTop: 8,

      color: '#333333',
    },


    // ===================================================
    // TASK HEADER
    // ===================================================

    taskHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },


    countContainer: {
      minWidth: 29,

      height: 27,

      borderRadius: 10,

      backgroundColor:
        '#126EED',

      alignItems: 'center',

      justifyContent:
        'center',

      marginTop: 10,
    },


    count: {
      color: '#FFFFFF',

      fontWeight: '800',

      fontSize: 12,
    },


    // ===================================================
    // TASK CARD
    // ===================================================

    taskCard: {
      backgroundColor:
        '#FFFFFF',

      borderRadius: 18,

      padding: 15,

      marginBottom: 10,

      flexDirection: 'row',

      alignItems: 'center',

      elevation: 2,

      shadowOpacity: 0.04,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },


    completedCard: {
      opacity: 0.65,
    },


    completeButton: {
      width: 32,

      alignItems: 'center',

      justifyContent:
        'center',
    },


    taskInfo: {
      flex: 1,

      marginHorizontal: 10,
    },


    taskTitle: {
      fontSize: 14,

      fontWeight: '800',

      color: '#222222',
    },


    completedText: {
      textDecorationLine:
        'line-through',

      color: '#999999',
    },


    metaRow: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 5,
    },


    taskMeta: {
      fontSize: 11,

      color: '#888888',
    },


    dot: {
      fontSize: 11,

      color: '#AAAAAA',

      marginHorizontal: 5,
    },


    // ===================================================
    // ACTION BUTTONS
    // ===================================================

    actionButton: {
      width: 35,

      height: 35,

      borderRadius: 11,

      alignItems: 'center',

      justifyContent:
        'center',
    },


    deleteButton: {
      marginLeft: 3,
    },


    // ===================================================
    // EMPTY
    // ===================================================

    empty: {
      backgroundColor:
        '#FFFFFF',

      borderRadius: 22,

      padding: 35,

      alignItems: 'center',

      marginTop: 5,
    },


    emptyTitle: {
      fontSize: 17,

      fontWeight: '800',

      marginTop: 10,

      color: '#171A21',
    },


    emptySubtitle: {
      fontSize: 12,

      color: '#888888',

      marginTop: 5,

      textAlign: 'center',
    },


    emptyAddButton: {
      marginTop: 18,

      backgroundColor:
        '#126EED',

      borderRadius: 12,

      paddingHorizontal: 18,

      paddingVertical: 10,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 6,
    },


    emptyAddText: {
      color: '#FFFFFF',

      fontSize: 13,

      fontWeight: '800',
    },


    bottomSpace: {
      height: 20,
    },

  });

