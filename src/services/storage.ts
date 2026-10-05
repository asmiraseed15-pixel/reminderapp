import AsyncStorage from "@react-native-async-storage/async-storage";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  reminder: boolean;
};

const TASKS_KEY = "smartlife_tasks";

export async function getTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);

    if (!data) {
      return [];
    }

    const tasks = JSON.parse(data);

    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.log("getTasks error:", error);
    return [];
  }
}

export async function saveTasks(
  tasks: Task[]
): Promise<void> {
  await AsyncStorage.setItem(
    TASKS_KEY,
    JSON.stringify(tasks)
  );
}

export async function addTask(
  task: Task
): Promise<void> {
  const tasks = await getTasks();

  tasks.push(task);

  await saveTasks(tasks);
}

export async function updateTask(
  task: Task
): Promise<void> {
  const tasks = await getTasks();

  const updated = tasks.map((item) =>
    item.id === task.id ? task : item
  );

  await saveTasks(updated);
}

export async function deleteTask(
  id: string
): Promise<void> {
  const tasks = await getTasks();

  const updated = tasks.filter(
    (task) => task.id !== id
  );

  await saveTasks(updated);
}