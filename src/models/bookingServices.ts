import { bookingStorage, ensureBookingSeed } from '@/utils/bookingStorage';
import { message } from 'antd';
import { useMemo, useState } from 'react';

const sortByCode = (a: { code: string }, b: { code: string }) => a.code.localeCompare(b.code, 'vi');

export default () => {
	ensureBookingSeed();

	const [services, setServices] = useState<Booking.ServiceRecord[]>(() =>
		bookingStorage.readServices().slice().sort(sortByCode),
	);
	const [visible, setVisible] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [row, setRow] = useState<Booking.ServiceRecord | undefined>(undefined);

	const refresh = () => setServices(bookingStorage.readServices().slice().sort(sortByCode));

	const options = useMemo(
		() =>
			services
				.filter((s) => s.active)
				.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
				.map((s) => ({ label: `${s.name} (${s.durationMinutes}p)`, value: s.id })),
		[services],
	);

	const upsert = (payload: Omit<Booking.ServiceRecord, 'id' | 'createdAt'> & Partial<Pick<Booking.ServiceRecord, 'id'>>) => {
		const data = bookingStorage.readServices();
		const normalized: Booking.ServiceRecord = {
			id: payload.id ?? bookingStorage.nextId('svc'),
			createdAt: payload.id ? data.find((d) => d.id === payload.id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
			code: payload.code.trim(),
			name: payload.name.trim(),
			price: Number(payload.price),
			durationMinutes: Number(payload.durationMinutes),
			active: payload.active ?? true,
		};

		if (!normalized.code || !normalized.name) {
			message.error('Vui lòng nhập mã và tên dịch vụ');
			return false;
		}
		if (normalized.price < 0) {
			message.error('Giá dịch vụ không hợp lệ');
			return false;
		}
		if (normalized.durationMinutes <= 0) {
			message.error('Thời gian thực hiện phải > 0');
			return false;
		}
		const sameCode = data.find((d) => d.code === normalized.code && d.id !== normalized.id);
		if (sameCode) {
			message.error('Mã dịch vụ đã tồn tại');
			return false;
		}

		const idx = data.findIndex((d) => d.id === normalized.id);
		const next = idx >= 0 ? [...data.slice(0, idx), normalized, ...data.slice(idx + 1)] : [normalized, ...data];
		bookingStorage.writeServices(next);
		refresh();
		return true;
	};

	const remove = (id: string) => {
		const appts = bookingStorage.readAppointments().filter((a) => a.serviceId === id && a.status !== 'CANCELLED');
		if (appts.length) {
			message.error('Dịch vụ đang có lịch hẹn, không thể xóa');
			return false;
		}
		const next = bookingStorage.readServices().filter((s) => s.id !== id);
		bookingStorage.writeServices(next);
		refresh();
		return true;
	};

	return {
		services,
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