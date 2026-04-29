import moment from 'moment';

export interface Workout {
  id: string;
  date: string;
  type: 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
  duration: number; // minutes
  calories: number;
  notes: string;
  status: 'Hoàn thành' | 'Bỏ lỡ';
}

export interface HealthMetric {
  id: string;
  date: string;
  weight: number; // kg
  height: number; // cm
  bmi: number;
  restingHeartRate: number; // bpm
  sleepHours: number;
}

export interface Goal {
  id: string;
  name: string;
  type: 'Giảm cân' | 'Tăng cơ' | 'Cải thiện sức bền' | 'Khác';
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  description: string;
  caloriesPerHr: number;
}

const defaultWorkouts: Workout[] = [
  { id: 'w1', date: moment().subtract(1, 'days').format('YYYY-MM-DD'), type: 'Cardio', duration: 45, calories: 400, notes: 'Chạy bộ công viên', status: 'Hoàn thành' },
  { id: 'w2', date: moment().subtract(3, 'days').format('YYYY-MM-DD'), type: 'Strength', duration: 60, calories: 350, notes: 'Đẩy tạ ngực', status: 'Hoàn thành' },
  { id: 'w3', date: moment().subtract(4, 'days').format('YYYY-MM-DD'), type: 'HIIT', duration: 30, calories: 500, notes: '', status: 'Bỏ lỡ' },
  { id: 'w4', date: moment().subtract(5, 'days').format('YYYY-MM-DD'), type: 'Yoga', duration: 60, calories: 150, notes: 'Yoga phục hồi', status: 'Hoàn thành' },
];

const defaultMetrics: HealthMetric[] = [
  { id: 'h1', date: moment().subtract(5, 'days').format('YYYY-MM-DD'), weight: 70, height: 175, bmi: 22.86, restingHeartRate: 65, sleepHours: 7 },
  { id: 'h2', date: moment().subtract(1, 'days').format('YYYY-MM-DD'), weight: 69.5, height: 175, bmi: 22.69, restingHeartRate: 63, sleepHours: 8 },
];

const defaultGoals: Goal[] = [
  { id: 'g1', name: 'Giảm 5kg trong 2 tháng', type: 'Giảm cân', targetValue: 5, currentValue: 1.5, deadline: moment().add(1, 'months').format('YYYY-MM-DD'), status: 'Đang thực hiện' },
  { id: 'g2', name: 'Chạy 5km dưới 30 phút', type: 'Cải thiện sức bền', targetValue: 30, currentValue: 32, deadline: moment().add(3, 'months').format('YYYY-MM-DD'), status: 'Đang thực hiện' },
];

const defaultExercises: Exercise[] = [
  { id: 'e1', name: 'Chạy bộ (Tốc độ vừa)', muscleGroup: 'Full Body', difficulty: 'Dễ', description: 'Chạy trên máy hoặc ngoài trời', caloriesPerHr: 600 },
  { id: 'e2', name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'Trung bình', description: 'Nằm xưng đẩy tạ đòn', caloriesPerHr: 250 },
  { id: 'e3', name: 'Squat', muscleGroup: 'Legs', difficulty: 'Trung bình', description: 'Gánh tạ đòn ngồi xổm', caloriesPerHr: 300 },
  { id: 'e4', name: 'Plank', muscleGroup: 'Core', difficulty: 'Dễ', description: 'Giữ tư thế chống đẩy khuỷu tay', caloriesPerHr: 200 },
  { id: 'e5', name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Khó', description: 'Nâng tạ đòn từ đất', caloriesPerHr: 400 },
];

export const FitnessStorage = {
  getWorkouts: (): Workout[] => {
    const data = localStorage.getItem('fitness_workouts');
    return data ? JSON.parse(data) : defaultWorkouts;
  },
  saveWorkouts: (data: Workout[]) => {
    localStorage.setItem('fitness_workouts', JSON.stringify(data));
  },
  
  getMetrics: (): HealthMetric[] => {
    const data = localStorage.getItem('fitness_metrics');
    return data ? JSON.parse(data) : defaultMetrics;
  },
  saveMetrics: (data: HealthMetric[]) => {
    localStorage.setItem('fitness_metrics', JSON.stringify(data));
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem('fitness_goals');
    return data ? JSON.parse(data) : defaultGoals;
  },
  saveGoals: (data: Goal[]) => {
    localStorage.setItem('fitness_goals', JSON.stringify(data));
  },

  getExercises: (): Exercise[] => {
    const data = localStorage.getItem('fitness_exercises');
    return data ? JSON.parse(data) : defaultExercises;
  },
  saveExercises: (data: Exercise[]) => {
    localStorage.setItem('fitness_exercises', JSON.stringify(data));
  },
};
