import moment from 'moment';

const KEY_EMPLOYEES = 'booking_employees_v1';
const KEY_SERVICES = 'booking_services_v1';
const KEY_APPOINTMENTS = 'booking_appointments_v1';
const KEY_REVIEWS = 'booking_reviews_v1';

type StorageKey = typeof KEY_EMPLOYEES | typeof KEY_SERVICES | typeof KEY_APPOINTMENTS | typeof KEY_REVIEWS;

const readJson = <T,>(key: StorageKey, fallback: T): T => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

const writeJson = (key: StorageKey, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

const nextId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export const ensureBookingSeed = () => {
	const hasEmployees = readJson<Booking.EmployeeRecord[]>(KEY_EMPLOYEES, []).length > 0;
	const hasServices = readJson<Booking.ServiceRecord[]>(KEY_SERVICES, []).length > 0;
	const hasAppointments = readJson<Booking.AppointmentRecord[]>(KEY_APPOINTMENTS, []).length > 0;
	const hasReviews = readJson<Booking.ReviewRecord[]>(KEY_REVIEWS, []).length > 0;

	if (hasEmployees && hasServices && hasAppointments && hasReviews) return;

	const now = moment();

	const employees: Booking.EmployeeRecord[] = [
		{
			id: nextId('emp'),
			code: 'NV001',
			fullName: 'Nguyễn Minh Anh',
			phone: '0901000001',
			email: 'minhanh@demo.com',
			maxCustomersPerDay: 8,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 1, startTime: '09:00', endTime: '17:00' },
				{ weekday: 3, startTime: '09:00', endTime: '17:00' },
				{ weekday: 5, startTime: '09:00', endTime: '17:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV002',
			fullName: 'Trần Quốc Bảo',
			phone: '0901000002',
			email: 'quocbao@demo.com',
			maxCustomersPerDay: 10,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 2, startTime: '10:00', endTime: '18:00' },
				{ weekday: 4, startTime: '10:00', endTime: '18:00' },
				{ weekday: 6, startTime: '08:30', endTime: '12:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV003',
			fullName: 'Lê Thu Hà',
			phone: '0901000003',
			email: 'thuha@demo.com',
			maxCustomersPerDay: 6,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 1, startTime: '13:00', endTime: '20:00' },
				{ weekday: 2, startTime: '13:00', endTime: '20:00' },
				{ weekday: 6, startTime: '09:00', endTime: '15:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV004',
			fullName: 'Phạm Gia Huy',
			phone: '0901000004',
			email: 'giahuy@demo.com',
			maxCustomersPerDay: 7,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 0, startTime: '09:00', endTime: '16:00' },
				{ weekday: 3, startTime: '09:00', endTime: '16:00' },
				{ weekday: 4, startTime: '09:00', endTime: '16:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV005',
			fullName: 'Đỗ Nhật Linh',
			phone: '0901000005',
			email: 'nhatlinh@demo.com',
			maxCustomersPerDay: 12,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 1, startTime: '08:00', endTime: '12:00' },
				{ weekday: 1, startTime: '13:00', endTime: '17:30' },
				{ weekday: 5, startTime: '08:00', endTime: '12:00' },
				{ weekday: 5, startTime: '13:00', endTime: '17:30' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV006',
			fullName: 'Võ Hoàng Nam',
			phone: '0901000006',
			email: 'hoangnam@demo.com',
			maxCustomersPerDay: 9,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 2, startTime: '09:00', endTime: '17:00' },
				{ weekday: 3, startTime: '09:00', endTime: '17:00' },
				{ weekday: 4, startTime: '09:00', endTime: '17:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV007',
			fullName: 'Bùi Khánh Ly',
			phone: '0901000007',
			email: 'khanhly@demo.com',
			maxCustomersPerDay: 5,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 5, startTime: '14:00', endTime: '20:00' },
				{ weekday: 6, startTime: '14:00', endTime: '20:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV008',
			fullName: 'Ngô Đức Long',
			phone: '0901000008',
			email: 'duclong@demo.com',
			maxCustomersPerDay: 8,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 0, startTime: '10:00', endTime: '18:00' },
				{ weekday: 2, startTime: '10:00', endTime: '18:00' },
				{ weekday: 4, startTime: '10:00', endTime: '18:00' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV009',
			fullName: 'Nguyễn Thảo Vy',
			phone: '0901000009',
			email: 'thaovy@demo.com',
			maxCustomersPerDay: 11,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 1, startTime: '09:30', endTime: '18:30' },
				{ weekday: 2, startTime: '09:30', endTime: '18:30' },
				{ weekday: 3, startTime: '09:30', endTime: '18:30' },
			],
		},
		{
			id: nextId('emp'),
			code: 'NV010',
			fullName: 'Phan Văn Sơn',
			phone: '0901000010',
			email: 'vanson@demo.com',
			maxCustomersPerDay: 7,
			active: true,
			createdAt: now.toISOString(),
			shifts: [
				{ weekday: 4, startTime: '08:00', endTime: '16:00' },
				{ weekday: 5, startTime: '08:00', endTime: '16:00' },
			],
		},
	];

	const services: Booking.ServiceRecord[] = [
		{ id: nextId('svc'), code: 'DV001', name: 'Cắt tóc nam', price: 80000, durationMinutes: 30, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV002', name: 'Cắt tóc nữ', price: 120000, durationMinutes: 45, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV003', name: 'Gội đầu dưỡng sinh', price: 150000, durationMinutes: 45, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV004', name: 'Massage body', price: 350000, durationMinutes: 60, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV005', name: 'Chăm sóc da cơ bản', price: 400000, durationMinutes: 75, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV006', name: 'Khám tổng quát', price: 500000, durationMinutes: 60, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV007', name: 'Khám răng', price: 300000, durationMinutes: 45, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV008', name: 'Sửa điện gia dụng', price: 250000, durationMinutes: 60, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV009', name: 'Bảo dưỡng xe máy', price: 200000, durationMinutes: 50, active: true, createdAt: now.toISOString() },
		{ id: nextId('svc'), code: 'DV010', name: 'Tư vấn dinh dưỡng', price: 220000, durationMinutes: 30, active: true, createdAt: now.toISOString() },
	];

	const pickEmp = (i: number) => employees[i % employees.length].id;
	const pickSvc = (i: number) => services[i % services.length].id;
	const at = (d: moment.Moment, hhmm: string) => moment(d.format('YYYY-MM-DD') + ' ' + hhmm, 'YYYY-MM-DD HH:mm');

	const baseDay = now.clone().startOf('day').add(1, 'day'); // từ ngày mai
	const mkAppt = (i: number, dayOffset: number, time: string, duration: number, status: Booking.AppointmentStatus) => {
		const day = baseDay.clone().add(dayOffset, 'day');
		const start = at(day, time);
		const end = start.clone().add(duration, 'minute');
		const record: Booking.AppointmentRecord = {
			id: nextId('apt'),
			customerName: `Khách ${i.toString().padStart(2, '0')}`,
			customerPhone: `0912${(100000 + i).toString().slice(-6)}`,
			customerNote: i % 2 === 0 ? 'Ưu tiên đúng giờ' : 'Có thể trễ 5-10 phút',
			serviceId: pickSvc(i),
			employeeId: pickEmp(i),
			startAt: start.toISOString(),
			endAt: end.toISOString(),
			status,
			createdAt: now.toISOString(),
		};
		return record;
	};

	const appointments: Booking.AppointmentRecord[] = [
		mkAppt(1, 0, '09:00', 30, 'PENDING'),
		mkAppt(2, 0, '10:00', 45, 'CONFIRMED'),
		mkAppt(3, 0, '14:00', 60, 'CONFIRMED'),
		mkAppt(4, 1, '09:30', 45, 'COMPLETED'),
		mkAppt(5, 1, '11:00', 75, 'COMPLETED'),
		mkAppt(6, 2, '15:00', 60, 'CANCELLED'),
		mkAppt(7, 2, '16:00', 30, 'PENDING'),
		mkAppt(8, 3, '08:30', 50, 'CONFIRMED'),
		mkAppt(9, 3, '13:00', 60, 'COMPLETED'),
		mkAppt(10, 4, '10:30', 30, 'COMPLETED'),
	];

	const completed = appointments.filter((a) => a.status === 'COMPLETED');
	const reviews: Booking.ReviewRecord[] = completed.slice(0, 10).map((a, idx) => ({
		id: nextId('rev'),
		appointmentId: a.id,
		employeeId: a.employeeId,
		serviceId: a.serviceId,
		rating: ((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5,
		comment:
			idx % 3 === 0
				? 'Dịch vụ tốt, sẽ quay lại.'
				: idx % 3 === 1
					? 'Nhân viên nhiệt tình, làm việc chuyên nghiệp.'
					: 'Ổn, nhưng cần cải thiện thời gian chờ.',
		reply: idx % 2 === 0 ? 'Cảm ơn bạn đã đánh giá. Hẹn gặp lại!' : undefined,
		createdAt: moment(a.endAt).add(10, 'minute').toISOString(),
	}));

	if (!hasEmployees) writeJson(KEY_EMPLOYEES, employees);
	if (!hasServices) writeJson(KEY_SERVICES, services);
	if (!hasAppointments) writeJson(KEY_APPOINTMENTS, appointments);
	if (!hasReviews) writeJson(KEY_REVIEWS, reviews);
};

export const bookingStorage = {
	readEmployees: () => readJson<Booking.EmployeeRecord[]>(KEY_EMPLOYEES, []),
	writeEmployees: (val: Booking.EmployeeRecord[]) => writeJson(KEY_EMPLOYEES, val),
	readServices: () => readJson<Booking.ServiceRecord[]>(KEY_SERVICES, []),
	writeServices: (val: Booking.ServiceRecord[]) => writeJson(KEY_SERVICES, val),
	readAppointments: () => readJson<Booking.AppointmentRecord[]>(KEY_APPOINTMENTS, []),
	writeAppointments: (val: Booking.AppointmentRecord[]) => writeJson(KEY_APPOINTMENTS, val),
	readReviews: () => readJson<Booking.ReviewRecord[]>(KEY_REVIEWS, []),
	writeReviews: (val: Booking.ReviewRecord[]) => writeJson(KEY_REVIEWS, val),
	nextId,
};