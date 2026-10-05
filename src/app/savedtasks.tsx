import React from 'react';

import {
  Alert,
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
  useRouter,
} from 'expo-router';

import {
  useTasks,
} from '../context/TaskContext';

export default function SavedTasksScreen() {
  const router = useRouter();

  const {
    tasks,
    toggleSavedTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const savedTasks =
    tasks.filter(
      (task) => task.saved
    );

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Saved Tasks
        </Text>

        <Ionicons
          name="bookmark"
          size={24}
          color="#126EED"
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        {savedTasks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="bookmark-outline"
              size={60}
              color="#126EED"
            />

            <Text
              style={styles.emptyTitle}
            >
              No Saved Tasks
            </Text>

            <Text
              style={styles.emptyText}
            >
              Bookmark important tasks
              to find them here.
            </Text>
          </View>
        ) : (
          savedTasks.map((task) => (
            <View
              key={task.id}
              style={styles.card}
            >
              <TouchableOpacity
                onPress={() =>
                  toggleTask(task.id)
                }
              >
                <Ionicons
                  name={
                    task.completed
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={27}
                  color="#126EED"
                />
              </TouchableOpacity>

              <View
                style={styles.info}
              >
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed &&
                      styles.done,
                  ]}
                >
                  {task.title}
                </Text>

                <Text
                  style={styles.meta}
                >
                  {task.category} •{' '}
                  {task.date} •{' '}
                  {task.time}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  toggleSavedTask(
                    task.id
                  )
                }
              >
                <Ionicons
                  name="bookmark"
                  size={22}
                  color="#126EED"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Task',
                    'Delete this task?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () =>
                          deleteTask(
                            task.id
                          ),
                      },
                    ]
                  );
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color="#F04444"
                  style={{
                    marginLeft: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    height: 75,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
  },

  content: {
    padding: 18,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  info: {
    flex: 1,
    marginHorizontal: 12,
  },

  taskTitle: {
    fontWeight: '800',
    fontSize: 14,
  },

  done: {
    textDecorationLine:
      'line-through',
    color: '#999',
  },

  meta: {
    color: '#888',
    fontSize: 11,
    marginTop: 5,
  },

  empty: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 45,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 13,
  },

  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 7,
  },
});