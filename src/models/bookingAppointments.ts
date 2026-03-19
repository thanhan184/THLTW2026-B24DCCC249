import { bookingStorage, ensureBookingSeed } from '@/utils/bookingStorage';
import { message } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';

const isOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
	const as = moment(aStart);
	const ae = moment(aEnd);
	const bs = moment(bStart);
	const be = moment(bEnd);
	return as.isBefore(be) && ae.isAfter(bs);
};

const weekdayOf = (iso: string): Booking.Weekday => moment(iso).day() as Booking.Weekday;

const parseHHmm = (hhmm: string) => {
	const [h, m] = hhmm.split(':').map((x) => Number(x));
	return { h, m };
};

const isWithinShift = (startAt: string, endAt: string, shift: Booking.EmployeeWorkingShift) => {
	const s = moment(startAt);
	const e = moment(endAt);
	if (s.day() !== shift.weekday) return false;
	const { h: sh, m: sm } = parseHHmm(shift.startTime);
	const { h: eh, m: em } = parseHHmm(shift.endTime);
	const startMin = s.hours() * 60 + s.minutes();
	const endMin = e.hours() * 60 + e.minutes();
	return startMin >= sh * 60 + sm && endMin <= eh * 60 + em;
};

export default () => {
	ensureBookingSeed();

	const [appointments, setAppointments] = useState<Booking.AppointmentRecord[]>(() => bookingStorage.readAppointments());
	const [visible, setVisible] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [row, setRow] = useState<Booking.AppointmentRecord | undefined>(undefined);

	const refresh = () => setAppointments(bookingStorage.readAppointments());

	const byNewest = useMemo(
		() =>
			appointments
				.slice()
				.sort((a, b) => moment(b.startAt).valueOf() - moment(a.startAt).valueOf()),
		[appointments],
	);

	const countEmployeeAppointmentsOnDay = (employeeId: string, dayIso: string, exceptId?: string) => {
		const d = moment(dayIso).format('YYYY-MM-DD');
		return bookingStorage
			.readAppointments()
			.filter((a) => a.employeeId === employeeId && a.status !== 'CANCELLED' && a.id !== exceptId)
			.filter((a) => moment(a.startAt).format('YYYY-MM-DD') === d).length;
	};

	const validateBooking = (payload: {
		id?: string;
		employeeId: string;
		serviceId: string;
		startAt: string;
		endAt: string;
		status: Booking.AppointmentStatus;
	}) => {
		const employees = bookingStorage.readEmployees();
		const services = bookingStorage.readServices();
		const employee = employees.find((e) => e.id === payload.employeeId);
		const service = services.find((s) => s.id === payload.serviceId);

		if (!employee || !employee.active) return 'Nhân viên không tồn tại hoặc đã khóa';
		if (!service || !service.active) return 'Dịch vụ không tồn tại hoặc đã khóa';

		if (!moment(payload.startAt).isValid() || !moment(payload.endAt).isValid()) return 'Thời gian không hợp lệ';
		if (!moment(payload.startAt).isBefore(payload.endAt)) return 'Giờ kết thúc phải sau giờ bắt đầu';

		const wd = weekdayOf(payload.startAt);
		const hasShift = employee.shifts.some((sh) => sh.weekday === wd && isWithinShift(payload.startAt, payload.endAt, sh));
		if (!hasShift) return 'Ngoài giờ làm việc của nhân viên';

		const capacityUsed = countEmployeeAppointmentsOnDay(employee.id, payload.startAt, payload.id);
		if (capacityUsed >= employee.maxCustomersPerDay) return 'Nhân viên đã đạt giới hạn khách/ngày';

		const existed = bookingStorage
			.readAppointments()
			.filter((a) => a.employeeId === payload.employeeId && a.status !== 'CANCELLED' && a.id !== payload.id)
			.some((a) => isOverlap(payload.startAt, payload.endAt, a.startAt, a.endAt));

		if (existed) return 'Trùng lịch: nhân viên đã có lịch trong khung giờ này';

		return null;
	};

	const upsert = (payload: {
		id?: string;
		customerName: string;
		customerPhone?: string;
		customerNote?: string;
		serviceId: string;
		employeeId: string;
		startAt: string;
		status?: Booking.AppointmentStatus;
	}) => {
		const services = bookingStorage.readServices();
		const service = services.find((s) => s.id === payload.serviceId);
		if (!service) {
			message.error('Vui lòng chọn dịch vụ');
			return false;
		}

		const start = moment(payload.startAt);
		if (!start.isValid()) {
			message.error('Vui lòng chọn thời gian bắt đầu');
			return false;
		}
		const end = start.clone().add(service.durationMinutes, 'minute');

		const data = bookingStorage.readAppointments();
		const normalized: Booking.AppointmentRecord = {
			id: payload.id ?? bookingStorage.nextId('apt'),
			createdAt: payload.id ? data.find((d) => d.id === payload.id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
			customerName: payload.customerName.trim(),
			customerPhone: payload.customerPhone?.trim(),
			customerNote: payload.customerNote?.trim(),
			serviceId: payload.serviceId,
			employeeId: payload.employeeId,
			startAt: start.toISOString(),
			endAt: end.toISOString(),
			status: payload.status ?? (payload.id ? data.find((d) => d.id === payload.id)?.status ?? 'PENDING' : 'PENDING'),
		};

		if (!normalized.customerName) {
			message.error('Vui lòng nhập tên khách');
			return false;
		}

		const err = validateBooking({
			id: normalized.id,
			employeeId: normalized.employeeId,
			serviceId: normalized.serviceId,
			startAt: normalized.startAt,
			endAt: normalized.endAt,
			status: normalized.status,
		});
		if (err) {
			message.error(err);
			return false;
		}

		const idx = data.findIndex((d) => d.id === normalized.id);
		const next = idx >= 0 ? [...data.slice(0, idx), normalized, ...data.slice(idx + 1)] : [normalized, ...data];
		bookingStorage.writeAppointments(next);
		refresh();
		return true;
	};

	const remove = (id: string) => {
		const next = bookingStorage.readAppointments().filter((a) => a.id !== id);
		bookingStorage.writeAppointments(next);
		refresh();
		return true;
	};

	const updateStatus = (id: string, status: Booking.AppointmentStatus) => {
		const data = bookingStorage.readAppointments();
		const idx = data.findIndex((d) => d.id === id);
		if (idx < 0) return false;
		const cur = data[idx];

		if (cur.status === 'CANCELLED') {
			message.error('Lịch hẹn đã hủy, không thể cập nhật');
			return false;
		}
		if (cur.status === 'COMPLETED') {
			message.error('Lịch hẹn đã hoàn thành, không thể cập nhật');
			return false;
		}

		if (status !== 'CANCELLED') {
			const err = validateBooking({
				id: cur.id,
				employeeId: cur.employeeId,
				serviceId: cur.serviceId,
				startAt: cur.startAt,
				endAt: cur.endAt,
				status,
			});
			if (err) {
				message.error(err);
				return false;
			}
		}

		const next = data.slice();
		next.splice(idx, 1, { ...cur, status });
		bookingStorage.writeAppointments(next);
		refresh();
		return true;
	};

	return {
		appointments: byNewest,
		refresh,

		visible,
		setVisible,
		isEdit,
		setIsEdit,
		row,
		setRow,

		upsert,
		remove,
		updateStatus,

		validateBooking,
		countEmployeeAppointmentsOnDay,
	};
};