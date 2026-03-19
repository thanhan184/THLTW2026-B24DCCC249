import type { IColumn } from '@/components/Table/typing';
import { weekdayLabel } from '@/pages/DatLich/components/constants';
import { Button, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
import FormNhanVien from './components/FormNhanVien';

const NhanVien = () => {
	const { employees, refresh, setRow, isEdit, setVisible, setIsEdit, visible, remove } = useModel('bookingEmployees');
	const { avgRatingByEmployee } = useModel('bookingReviews');

	const avgOf = useMemo(() => avgRatingByEmployee, [avgRatingByEmployee]);

	const columns: IColumn<Booking.EmployeeRecord>[] = [
		{ title: 'Mã', dataIndex: 'code', width: 90 },
		{ title: 'Họ tên', dataIndex: 'fullName', width: 220 },
		{
			title: 'Giới hạn/ngày',
			dataIndex: 'maxCustomersPerDay',
			width: 120,
			align: 'right',
		},
		{
			title: 'Ca làm việc',
			dataIndex: 'shifts',
			width: 320,
			render: (shifts: Booking.EmployeeWorkingShift[]) => (
				<Space wrap>
					{(shifts ?? []).map((s, idx) => (
						<Tag key={idx}>
							{weekdayLabel[s.weekday]} {s.startTime}-{s.endTime}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: 'Đánh giá TB',
			width: 140,
			render: (record) => {
				const v = avgOf[record.id];
				if (!v?.count) return <span>-</span>;
				return (
					<Tooltip title={`${v.count} lượt đánh giá`}>
						<span>
							{v.avg.toFixed(1)}/5 ({v.count})
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: 'Trạng thái',
			dataIndex: 'active',
			width: 110,
			render: (val: boolean) => (val ? <Tag color='green'>Hoạt động</Tag> : <Tag color='red'>Khóa</Tag>),
		},
		{
			title: 'Thao tác',
			width: 200,
			align: 'center',
			render: (record) => (
				<Space>
					<Button
						onClick={() => {
							setVisible(true);
							setRow(record);
							setIsEdit(true);
						}}
					>
						Sửa
					</Button>
					<Button
						danger
						onClick={() => {
							const ok = remove(record.id);
							if (ok) refresh();
						}}
					>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button
				type='primary'
				onClick={() => {
					setVisible(true);
					setIsEdit(false);
					setRow(undefined);
				}}
			>
				Thêm nhân viên
			</Button>

			<Table rowKey='id' style={{ marginTop: 12 }} dataSource={employees} columns={columns as any} />

			<Modal
				destroyOnClose
				footer={false}
				title={isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên'}
				visible={visible}
				onCancel={() => setVisible(false)}
			>
				<FormNhanVien />
			</Modal>
		</div>
	);
};

export default NhanVien;