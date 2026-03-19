declare module Booking {
	export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: CN ... 6: T7

	export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

	export interface EmployeeWorkingShift {
		weekday: Weekday;
		startTime: string; // HH:mm
		endTime: string; // HH:mm
	}

	export interface EmployeeRecord {
		id: string;
		code: string;
		fullName: string;
		phone?: string;
		email?: string;
		maxCustomersPerDay: number;
		shifts: EmployeeWorkingShift[];
		active: boolean;
		createdAt: string; // ISO
	}

	export interface ServiceRecord {
		id: string;
		code: string;
		name: string;
		price: number;
		durationMinutes: number;
		active: boolean;
		createdAt: string; // ISO
	}

	export interface AppointmentRecord {
		id: string;
		customerName: string;
		customerPhone?: string;
		customerNote?: string;
		serviceId: string;
		employeeId: string;
		startAt: string; // ISO
		endAt: string; // ISO
		status: AppointmentStatus;
		createdAt: string; // ISO
	}

	export interface ReviewRecord {
		id: string;
		appointmentId: string;
		employeeId: string;
		serviceId: string;
		rating: 1 | 2 | 3 | 4 | 5;
		comment: string;
		reply?: string;
		createdAt: string; // ISO
	}
}