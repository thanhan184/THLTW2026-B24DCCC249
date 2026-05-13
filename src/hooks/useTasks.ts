import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  getTasks,
  addTask as serviceAddTask,
  updateTask as serviceUpdateTask,
  deleteTask as serviceDeleteTask,
  migrateTaskStatus as serviceMigrateTaskStatus,
} from '@/services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(() => {
    const data = getTasks();
    setTasks(data);
  }, []);

  useEffect(() => {
    fetchTasks();
    
    // Listen to local storage changes to keep other tabs aligned
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kanban_tasks') {
        fetchTasks();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchTasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    serviceAddTask(task);
    fetchTasks(); // refresh state
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    serviceUpdateTask(id, updatedFields);
    fetchTasks();
  };

  const deleteTask = (id: string) => {
    serviceDeleteTask(id);
    fetchTasks();
  };

  const migrateTaskStatus = (id: string, newStatus: Task['status']) => {
    serviceMigrateTaskStatus(id, newStatus);
    fetchTasks();
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    migrateTaskStatus,
    refreshTasks: fetchTasks,
  };
};
