
export type TaskCategory =
  | 'Personal'
  | 'Work'
  | 'Study'
  | 'Health'
  | 'Shopping'
  | 'Other';


export type TaskPriority =
  | 'Low'
  | 'Medium'
  | 'High';


/* =========================================================
   SUBTASK
========================================================= */

export interface Subtask {
  id?: string;
  title: string;
  completed?: boolean;
}


/* =========================================================
   TASK
========================================================= */

export interface Task {

  id: string;

  title: string;

  category: TaskCategory;

  priority: TaskPriority;

  date: string;

  time: string;

  notes: string;

  completed: boolean;

  reminderEnabled: boolean;

  /*
   * Notification ID used by
   * Expo Notifications
   */
  reminderNotificationId?: string;

  /*
   * Optional subtasks
   */
  subtasks?: Subtask[];

  createdAt: string;

  saved?: boolean;
}

