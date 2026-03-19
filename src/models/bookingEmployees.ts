import { bookingStorage, ensureBookingSeed } from '@/utils/bookingStorage';
import { message } from 'antd';
import { useMemo, useState } from 'react';

const sortByCode = (a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code, 'vi');

export default () => {
	ensureBookingSeed();

	const [employees, setEmployees] = useState<Booking.EmployeeRecord[]>(() =>
		bookingStorage.readEmployees().slice().sort(sortByCode),
	);
	const [visible, setVisible] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [row, setRow] = useState<Booking.EmployeeRecord | undefined>(undefined);

	const refresh = () => setEmployees(bookingStorage.readEmployees().slice().sort(sortByCode));

	const options = useMemo(
		() =>
			employees
				.filter((e) => e.active)
				.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
				.map((e) => ({ label: `${e.fullName} (${e.code})`, value: e.id })),
		[employees],
	);

	const upsert = (payload: Omit<Booking.EmployeeRecord, 'id' | 'createdAt'> & Partial<Pick<Booking.EmployeeRecord, 'id'>>) => {
		const data = bookingStorage.readEmployees();
		const normalized: Booking.EmployeeRecord = {
			id: payload.id ?? bookingStorage.nextId('emp'),
			createdAt: payload.id ? data.find((d) => d.id === payload.id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
			code: payload.code.trim(),
			fullName: payload.fullName.trim(),
			phone: payload.phone?.trim(),
			email: payload.email?.trim(),
			maxCustomersPerDay: Number(payload.maxCustomersPerDay),
			shifts: payload.shifts ?? [],
			active: payload.active ?? true,
		};

		if (!normalized.code || !normalized.fullName) {
			message.error('Vui lòng nhập mã và họ tên nhân viên');
			return false;
		}
		if (normalized.maxCustomersPerDay <= 0) {
			message.error('Giới hạn khách/ngày phải > 0');
			return false;
		}
		if (!normalized.shifts.length) {
			message.error('Vui lòng cấu hình ít nhất 1 ca làm việc');
			return false;
		}
		const sameCode = data.find((d) => d.code === normalized.code && d.id !== normalized.id);
		if (sameCode) {
			message.error('Mã nhân viên đã tồn tại');
			return false;
		}

		const idx = data.findIndex((d) => d.id === normalized.id);
		const next = idx >= 0 ? [...data.slice(0, idx), normalized, ...data.slice(idx + 1)] : [normalized, ...data];
		bookingStorage.writeEmployees(next);
		refresh();
		return true;
	};

	const remove = (id: string) => {
		const appts = bookingStorage.readAppointments().filter((a) => a.employeeId === id && a.status !== 'CANCELLED');
		if (appts.length) {
			message.error('Nhân viên đang có lịch hẹn, không thể xóa');
			return false;
		}
		const next = bookingStorage.readEmployees().filter((e) => e.id !== id);
		bookingStorage.writeEmployees(next);
		refresh();
		return true;
	};

	return {
		employees,
		refresh,

		visible,
		setVisible,
		isEdit,
		setIsEdit,
		row,
		setRow,

		upsert,
		remove,

		options,
	};
};