export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string; // ISO date string
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'Doing' | 'Done';
  tag: string;
  createdAt: string;
}

const STORAGE_KEY = 'kanban_tasks';

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (id: string, updatedFields: Partial<Task>): Task | null => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks[index] = { ...tasks[index], ...updatedFields };
    saveTasks(tasks);
    return tasks[index];
  }
  return null;
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const newTasks = tasks.filter(t => t.id !== id);
  saveTasks(newTasks);
};

export const migrateTaskStatus = (id: string, newStatus: Task['status']): Task | null => {
  return updateTask(id, { status: newStatus });
};
