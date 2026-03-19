import moment from 'moment';

export const weekdayLabel: Record<Booking.Weekday, string> = {
	0: 'CN',
	1: 'T2',
	2: 'T3',
	3: 'T4',
	4: 'T5',
	5: 'T6',
	6: 'T7',
};

export const appointmentStatusLabel: Record<Booking.AppointmentStatus, string> = {
	PENDING: 'Chờ duyệt',
	CONFIRMED: 'Xác nhận',
	COMPLETED: 'Hoàn thành',
	CANCELLED: 'Hủy',
};

export const formatDateTime = (iso?: string) => (iso ? moment(iso).format('DD/MM/YYYY HH:mm') : '');