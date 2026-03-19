import type { IColumn } from '@/components/Table/typing';
import TinyEditor from '@/components/TinyEditor';
import { formatDateTime } from '@/pages/DatLich/components/constants';
import { bookingStorage } from '@/utils/bookingStorage';
import { Button, Modal, Popconfirm, Rate, Space, Table, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';
import FormDanhGia from './components/FormDanhGia';

const DanhGia = () => {
	const { reviews, refresh, visible, setVisible, updateReply, remove } = useModel('bookingReviews');

	const [replyModalOpen, setReplyModalOpen] = useState(false);
	const [replyRow, setReplyRow] = useState<Booking.ReviewRecord | undefined>(undefined);
	const [replyDraft, setReplyDraft] = useState<string>('');

	const empById = useMemo(
		() => new Map(bookingStorage.readEmployees().map((e) => [e.id, e])),
		[visible, replyModalOpen, reviews.length],
	);
	const svcById = useMemo(
		() => new Map(bookingStorage.readServices().map((s) => [s.id, s])),
		[visible, replyModalOpen, reviews.length],
	);
	const apptById = useMemo(
		() => new Map(bookingStorage.readAppointments().map((a) => [a.id, a])),
		[visible, replyModalOpen, reviews.length],
	);

	const columns: IColumn<Booking.ReviewRecord>[] = [
		{
			title: 'Lịch hẹn',
			dataIndex: 'appointmentId',
			width: 160,
			render: (id: string) => formatDateTime(apptById.get(id)?.startAt),
		},
		{
			title: 'Nhân viên',
			dataIndex: 'employeeId',
			width: 220,
			render: (id: string) => empById.get(id)?.fullName ?? 'N/A',
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceId',
			width: 220,
			render: (id: string) => svcById.get(id)?.name ?? 'N/A',
		},
		{
			title: 'Sao',
			dataIndex: 'rating',
			width: 120,
			render: (val: number) => <Rate disabled value={val} />,
		},
		{
			title: 'Đánh giá',
			dataIndex: 'comment',
			width: 360,
			render: (val: string) => (
				<Tooltip title={val}>
					<div style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</div>
				</Tooltip>
			),
		},
		{
			title: 'Phản hồi',
			dataIndex: 'reply',
			width: 260,
			render: (val?: string) =>
				val ? (
					<Tooltip title={<div dangerouslySetInnerHTML={{ __html: val }} />}>
						<div style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
							Đã phản hồi
						</div>
					</Tooltip>
				) : (
					<span>-</span>
				),
		},
		{
			title: 'Thao tác',
			width: 240,
			align: 'center',
			render: (record) => (
				<Space>
					<Button
						onClick={() => {
							setReplyRow(record);
							setReplyDraft(record.reply ?? '');
							setReplyModalOpen(true);
						}}
					>
						Phản hồi
					</Button>
					<Popconfirm title='Xóa đánh giá?' onConfirm={() => remove(record.id)}>
						<Button danger>Xóa</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button type='primary' onClick={() => setVisible(true)}>
				Tạo đánh giá (sau hoàn thành)
			</Button>

			<Table rowKey='id' style={{ marginTop: 12 }} dataSource={reviews} columns={columns as any} />

			<Modal destroyOnClose footer={false} title='Tạo đánh giá' visible={visible} onCancel={() => setVisible(false)}>
				<FormDanhGia />
			</Modal>

			<Modal
				destroyOnClose
				title='Phản hồi đánh giá'
				visible={replyModalOpen}
				onCancel={() => setReplyModalOpen(false)}
				onOk={() => {
					if (replyRow) {
						updateReply(replyRow.id, replyDraft);
						refresh();
					}
					setReplyModalOpen(false);
				}}
			>
				<TinyEditor value={replyDraft} onChange={setReplyDraft} miniToolbar height={260} stickyToolbar={false} />
			</Modal>
		</div>
	);
};

export default DanhGia;