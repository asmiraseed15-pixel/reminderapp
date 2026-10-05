
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Task } from '../../types/task';


const TASK_STORAGE_KEY = 'smart_todo_tasks';


/* =========================================================
   CONTEXT TYPE
========================================================= */

interface TaskContextType {
  tasks: Task[];

  addTask: (task: Task) => Promise<void>;

  updateTask: (
    id: string,
    updates: Partial<Task>
  ) => Promise<void>;

  deleteTask: (id: string) => Promise<void>;

  toggleTask: (id: string) => Promise<void>;

  toggleSavedTask: (id: string) => Promise<void>;

  getTaskById: (id: string) => Task | undefined;

  clearTasks: () => Promise<void>;
}


/* =========================================================
   CONTEXT
========================================================= */

const TaskContext =
  createContext<TaskContextType | undefined>(
    undefined
  );


/* =========================================================
   PROVIDER
========================================================= */

export function TaskProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loaded, setLoaded] = useState(false);


  /* =======================================================
     LOAD TASKS
  ======================================================= */

  useEffect(() => {
    loadTasks();
  }, []);


  const loadTasks = async () => {

    try {

      const saved =
        await AsyncStorage.getItem(
          TASK_STORAGE_KEY
        );


      if (!saved) {

        setTasks([]);

        return;
      }


      const parsed = JSON.parse(saved);


      if (!Array.isArray(parsed)) {

        setTasks([]);

        return;
      }


      const cleaned: Task[] =
        parsed.map((item: any) => ({
          ...item,

          id: String(
            item.id ?? Date.now()
          ),

          title:
            item.title ?? '',

          category:
            item.category ?? 'Personal',

          date:
            item.date ?? '',

          time:
            item.time ?? '',

          completed:
            Boolean(item.completed),

          reminderEnabled:
            Boolean(item.reminderEnabled),

          notes:
            item.notes ?? '',

          subtasks:
            Array.isArray(item.subtasks)
              ? item.subtasks
              : [],

          saved:
            Boolean(item.saved),
        }));


      setTasks(cleaned);

    } catch (error) {

      console.log(
        'Task loading error:',
        error
      );

      setTasks([]);

    } finally {

      setLoaded(true);

    }
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const saveTasks = async (
    updatedTasks: Task[]
  ) => {

    await AsyncStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify(updatedTasks)
    );
  };


  /* =======================================================
     ADD TASK
  ======================================================= */

  const addTask = async (
    task: Task
  ) => {

    const newTask: Task = {
      ...task,

      id: task.id
        ? String(task.id)
        : Date.now().toString(),

      title:
        task.title ?? '',

      category:
        task.category ?? 'Personal',

      date:
        task.date ?? '',

      time:
        task.time ?? '',

      completed:
        Boolean(task.completed),

      reminderEnabled:
        Boolean(task.reminderEnabled),

      notes:
        task.notes ?? '',

      subtasks:
        Array.isArray(task.subtasks)
          ? task.subtasks
          : [],

      saved:
        Boolean(
          (task as any).saved
        ),
    };


    const updatedTasks = [
      ...tasks,
      newTask,
    ];


    setTasks(updatedTasks);

    await saveTasks(updatedTasks);
  };


  /* =======================================================
     UPDATE TASK
  ======================================================= */

  const updateTask = async (
    id: string,
    updates: Partial<Task>
  ) => {

    const updatedTasks =
      tasks.map((task) => {

        if (
          String(task.id) !==
          String(id)
        ) {
          return task;
        }


        return {
          ...task,
          ...updates,
        };

      });


    setTasks(updatedTasks);

    await saveTasks(updatedTasks);
  };


  /* =======================================================
     DELETE TASK
  ======================================================= */

  const deleteTask = async (
    id: string
  ) => {

    const updatedTasks =
      tasks.filter(
        (task) =>
          String(task.id) !==
          String(id)
      );


    setTasks(updatedTasks);

    await saveTasks(updatedTasks);
  };


  /* =======================================================
     TOGGLE COMPLETED
  ======================================================= */

  const toggleTask = async (
    id: string
  ) => {

    const task =
      tasks.find(
        (item) =>
          String(item.id) ===
          String(id)
      );


    if (!task) {
      return;
    }


    await updateTask(
      id,
      {
        completed:
          !task.completed,
      }
    );
  };


  /* =======================================================
     TOGGLE SAVED
  ======================================================= */

  const toggleSavedTask = async (
    id: string
  ) => {

    const task =
      tasks.find(
        (item) =>
          String(item.id) ===
          String(id)
      );


    if (!task) {
      return;
    }


    await updateTask(
      id,
      {
        saved:
          !Boolean(
            (task as any).saved
          ),
      }
    );
  };


  /* =======================================================
     GET TASK
  ======================================================= */

  const getTaskById = (
    id: string
  ) => {

    return tasks.find(
      (task) =>
        String(task.id) ===
        String(id)
    );
  };


  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const clearTasks = async () => {

    setTasks([]);

    await AsyncStorage.removeItem(
      TASK_STORAGE_KEY
    );
  };


  /* =======================================================
     PROVIDER
  ======================================================= */

  if (!loaded) {

    return null;
  }


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
        clearTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}


/* =========================================================
   useTasks
========================================================= */

export function useTasks() {

  const context =
    useContext(TaskContext);


  if (context === undefined) {

    throw new Error(
      'useTasks must be used inside TaskProvider'
    );
  }


  return context;
}


/* =========================================================
   useTaskContext
========================================================= */

export function useTaskContext() {

  const context =
    useContext(TaskContext);


  if (context === undefined) {

    throw new Error(
      'useTaskContext must be used inside TaskProvider'
    );
  }


  return context;
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default TaskContext;

