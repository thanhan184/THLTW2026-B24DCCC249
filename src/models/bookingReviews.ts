import { bookingStorage, ensureBookingSeed } from '@/utils/bookingStorage';
import { message } from 'antd';
import moment from 'moment';
import { useMemo, useState } from 'react';

export default () => {
	ensureBookingSeed();

	const [reviews, setReviews] = useState<Booking.ReviewRecord[]>(() => bookingStorage.readReviews());
	const [visible, setVisible] = useState(false);
	const [row, setRow] = useState<Booking.ReviewRecord | undefined>(undefined);

	const refresh = () => setReviews(bookingStorage.readReviews());

	const byNewest = useMemo(
		() => reviews.slice().sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()),
		[reviews],
	);

	const canCreateReview = (appointmentId: string) => {
		const appt = bookingStorage.readAppointments().find((a) => a.id === appointmentId);
		if (!appt) return 'Lịch hẹn không tồn tại';
		if (appt.status !== 'COMPLETED') return 'Chỉ đánh giá sau khi lịch hẹn hoàn thành';
		const existed = bookingStorage.readReviews().some((r) => r.appointmentId === appointmentId);
		if (existed) return 'Lịch hẹn này đã được đánh giá';
		return null;
	};

	const create = (payload: Omit<Booking.ReviewRecord, 'id' | 'createdAt'>) => {
		const err = canCreateReview(payload.appointmentId);
		if (err) {
			message.error(err);
			return false;
		}
		if (!payload.comment?.trim()) {
			message.error('Vui lòng nhập nội dung đánh giá');
			return false;
		}
		if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
			message.error('Số sao không hợp lệ');
			return false;
		}

		const next: Booking.ReviewRecord[] = [
			{
				...payload,
				id: bookingStorage.nextId('rev'),
				comment: payload.comment.trim(),
				reply: payload.reply?.trim(),
				createdAt: new Date().toISOString(),
			},
			...bookingStorage.readReviews(),
		];
		bookingStorage.writeReviews(next);
		refresh();
		return true;
	};

	const updateReply = (id: string, reply?: string) => {
		const data = bookingStorage.readReviews();
		const idx = data.findIndex((d) => d.id === id);
		if (idx < 0) return false;
		const next = data.slice();
		next.splice(idx, 1, { ...next[idx], reply: reply?.trim() || undefined });
		bookingStorage.writeReviews(next);
		refresh();
		return true;
	};

	const remove = (id: string) => {
		const next = bookingStorage.readReviews().filter((r) => r.id !== id);
		bookingStorage.writeReviews(next);
		refresh();
		return true;
	};

	const avgRatingByEmployee = useMemo(() => {
		const map = new Map<string, { sum: number; count: number }>();
		byNewest.forEach((r) => {
			const cur = map.get(r.employeeId) ?? { sum: 0, count: 0 };
			cur.sum += r.rating;
			cur.count += 1;
			map.set(r.employeeId, cur);
		});
		const result: Record<string, { avg: number; count: number }> = {};
		for (const [empId, v] of map.entries()) result[empId] = { avg: v.count ? v.sum / v.count : 0, count: v.count };
		return result;
	}, [byNewest]);

	return {
		reviews: byNewest,
		refresh,

		visible,
		setVisible,
		row,
		setRow,

		create,
		updateReply,
		remove,

		canCreateReview,
		avgRatingByEmployee,
	};
};