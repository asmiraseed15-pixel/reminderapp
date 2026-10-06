
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Task } from '../../types/task';


// =========================================================
// STORAGE KEY
// =========================================================

const TASK_STORAGE_KEY = 'smart_todo_tasks';


// =========================================================
// CONTEXT TYPE
// =========================================================

interface TaskContextType {
  tasks: Task[];

  addTask: (
    task: Task
  ) => Promise<void>;

  updateTask: (
    id: string,
    updates: Partial<Task>
  ) => Promise<void>;

  deleteTask: (
    id: string
  ) => Promise<void>;

  toggleTask: (
    id: string
  ) => Promise<void>;

  toggleSavedTask: (
    id: string
  ) => Promise<void>;

  getTaskById: (
    id: string
  ) => Task | undefined;

  getTasksByCategory: (
    category: string
  ) => Task[];

  clearCompletedTasks: () => Promise<void>;

  clearTasks: () => Promise<void>;
}


// =========================================================
// CONTEXT
// =========================================================

const TaskContext =
  createContext<TaskContextType | undefined>(
    undefined
  );


// =========================================================
// NORMALIZE TASK
// =========================================================

const normalizeTask = (
  task: any
): Task => {

  return {
    ...task,

    // -----------------------------------------------------
    // ID
    // -----------------------------------------------------

    id: String(
      task?.id ??
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`
    ),

    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    title:
      typeof task?.title === 'string'
        ? task.title
        : '',

    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    category:
      task?.category ??
      'Personal',

    // -----------------------------------------------------
    // PRIORITY
    // -----------------------------------------------------

    priority:
      task?.priority ??
      'Medium',

    // -----------------------------------------------------
    // DATE
    // -----------------------------------------------------

    date:
      typeof task?.date === 'string'
        ? task.date
        : '',

    // -----------------------------------------------------
    // TIME
    // -----------------------------------------------------

    time:
      typeof task?.time === 'string'
        ? task.time
        : '',

    // -----------------------------------------------------
    // COMPLETED
    // -----------------------------------------------------

    completed:
      Boolean(
        task?.completed
      ),

    // -----------------------------------------------------
    // REMINDER
    // -----------------------------------------------------

    reminderEnabled:
      Boolean(
        task?.reminderEnabled
      ),

    reminderTime:
      task?.reminderTime ??
      undefined,

    reminderNotificationId:
      task?.reminderNotificationId ??
      undefined,

    // -----------------------------------------------------
    // NOTES
    // -----------------------------------------------------

    notes:
      typeof task?.notes === 'string'
        ? task.notes
        : '',

    // -----------------------------------------------------
    // SUBTASKS
    // -----------------------------------------------------

    subtasks:
      Array.isArray(
        task?.subtasks
      )
        ? task.subtasks
        : [],

    // -----------------------------------------------------
    // SAVED
    // -----------------------------------------------------

    saved:
      Boolean(
        task?.saved
      ),

    // -----------------------------------------------------
    // CREATED DATE
    // -----------------------------------------------------

    createdAt:
      task?.createdAt ??
      new Date().toISOString(),
  } as Task;
};


// =========================================================
// PROVIDER
// =========================================================

export function TaskProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loaded, setLoaded] =
    useState(false);


  // =======================================================
  // LOAD TASKS
  // =======================================================

  useEffect(() => {

    const loadTasks = async () => {

      try {

        const stored =
          await AsyncStorage.getItem(
            TASK_STORAGE_KEY
          );


        // -------------------------------------------------
        // NO TASKS
        // -------------------------------------------------

        if (!stored) {

          setTasks([]);

          return;
        }


        // -------------------------------------------------
        // PARSE STORAGE
        // -------------------------------------------------

        const parsed =
          JSON.parse(
            stored
          );


        // -------------------------------------------------
        // INVALID DATA
        // -------------------------------------------------

        if (!Array.isArray(parsed)) {

          setTasks([]);

          return;
        }


        // -------------------------------------------------
        // NORMALIZE OLD / NEW DATA
        // -------------------------------------------------

        const normalized =
          parsed.map(
            normalizeTask
          );


        setTasks(
          normalized
        );

      } catch (error) {

        console.error(
          'Task loading error:',
          error
        );

        setTasks([]);

      } finally {

        setLoaded(true);

      }

    };


    loadTasks();

  }, []);


  // =======================================================
  // SAVE TASKS TO ASYNC STORAGE
  // =======================================================

  const persistTasks = async (
    updatedTasks: Task[]
  ) => {

    await AsyncStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify(
        updatedTasks
      )
    );

  };


  // =======================================================
  // ADD TASK
  // =======================================================

  const addTask = async (
    task: Task
  ) => {

    try {

      const newTask =
        normalizeTask({

          ...task,

          // Generate unique ID
          id:
            task?.id ??
            `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,

          // New task starts incomplete
          completed:
            false,

          // Creation timestamp
          createdAt:
            task?.createdAt ??
            new Date().toISOString(),

        });


      setTasks(
        previousTasks => {

          const updatedTasks = [
            ...previousTasks,
            newTask,
          ];


          // Save immediately
          persistTasks(
            updatedTasks
          ).catch(error => {

            console.error(
              'Storage save error:',
              error
            );

          });


          return updatedTasks;

        }
      );

    } catch (error) {

      console.error(
        'Add task error:',
        error
      );

      throw error;

    }

  };


  // =======================================================
  // UPDATE TASK
  // =======================================================

  const updateTask = async (
    id: string,
    updates: Partial<Task>
  ) => {

    try {

      const taskId =
        String(id);


      setTasks(
        previousTasks => {

          const updatedTasks =
            previousTasks.map(
              task => {

                // Keep other tasks unchanged
                if (
                  String(task.id) !==
                  taskId
                ) {

                  return task;

                }


                // Update selected task
                return normalizeTask({

                  ...task,

                  ...updates,

                  // Never allow ID to change
                  id:
                    task.id,

                });

              }
            );


          // Persist updated list
          persistTasks(
            updatedTasks
          ).catch(error => {

            console.error(
              'Storage update error:',
              error
            );

          });


          return updatedTasks;

        }
      );

    } catch (error) {

      console.error(
        'Update task error:',
        error
      );

      throw error;

    }

  };


  // =======================================================
  // DELETE TASK
  // =======================================================

  const deleteTask = async (
    id: string
  ) => {

    try {

      const taskId =
        String(id);


      setTasks(
        previousTasks => {

          const updatedTasks =
            previousTasks.filter(
              task =>
                String(task.id) !==
                taskId
            );


          // Save after deletion
          persistTasks(
            updatedTasks
          ).catch(error => {

            console.error(
              'Storage delete error:',
              error
            );

          });


          return updatedTasks;

        }
      );

    } catch (error) {

      console.error(
        'Delete task error:',
        error
      );

      throw error;

    }

  };


  // =======================================================
  // COMPLETE / UNCOMPLETE TASK
  // =======================================================

  const toggleTask = async (
    id: string
  ) => {

    const task =
      tasks.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!task) {

      return;

    }


    await updateTask(
      String(id),
      {
        completed:
          !task.completed,
      }
    );

  };


  // =======================================================
  // SAVE / UNSAVE TASK
  // =======================================================

  const toggleSavedTask =
    async (
      id: string
    ) => {

      const task =
        tasks.find(
          item =>
            String(item.id) ===
            String(id)
        );


      if (!task) {

        return;

      }


      await updateTask(
        String(id),
        {
          saved:
            !Boolean(
              task.saved
            ),
        }
      );

    };


  // =======================================================
  // GET TASK BY ID
  // =======================================================

  const getTaskById = (
    id: string
  ) => {

    return tasks.find(
      task =>
        String(task.id) ===
        String(id)
    );

  };


  // =======================================================
  // GET TASKS BY CATEGORY
  // =======================================================

  const getTasksByCategory = (
    category: string
  ) => {

    return tasks.filter(
      task =>
        String(
          task.category
        ).toLowerCase() ===
        String(
          category
        ).toLowerCase()
    );

  };


  // =======================================================
  // CLEAR COMPLETED TASKS
  // =======================================================

  const clearCompletedTasks =
    async () => {

      try {

        setTasks(
          previousTasks => {

            const updatedTasks =
              previousTasks.filter(
                task =>
                  !task.completed
              );


            persistTasks(
              updatedTasks
            ).catch(error => {

              console.error(
                'Clear completed storage error:',
                error
              );

            });


            return updatedTasks;

          }
        );

      } catch (error) {

        console.error(
          'Clear completed error:',
          error
        );

        throw error;

      }

    };


  // =======================================================
  // CLEAR ALL TASKS
  // =======================================================

  const clearTasks =
    async () => {

      try {

        setTasks([]);

        await AsyncStorage.removeItem(
          TASK_STORAGE_KEY
        );

      } catch (error) {

        console.error(
          'Clear tasks error:',
          error
        );

        throw error;

      }

    };


  // =======================================================
  // WAIT FOR STORAGE
  // =======================================================

  if (!loaded) {

    return null;

  }


  // =======================================================
  // PROVIDER
  // =======================================================

  return (

    <TaskContext.Provider
      value={{

        tasks,

        addTask,

        updateTask,

        deleteTask,

        toggleTask,

        toggleSavedTask,

        getTaskById,

        getTasksByCategory,

        clearCompletedTasks,

        clearTasks,

      }}
    >

      {children}

    </TaskContext.Provider>

  );

}


// =========================================================
// useTasks
// =========================================================

export function useTasks() {

  const context =
    useContext(
      TaskContext
    );


  if (
    context === undefined
  ) {

    throw new Error(
      'useTasks must be used inside TaskProvider'
    );

  }


  return context;

}


// =========================================================
// useTaskContext
// =========================================================

export function useTaskContext() {

  const context =
    useContext(
      TaskContext
    );


  if (
    context === undefined
  ) {

    throw new Error(
      'useTaskContext must be used inside TaskProvider'
    );

  }


  return context;

}


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default TaskContext;