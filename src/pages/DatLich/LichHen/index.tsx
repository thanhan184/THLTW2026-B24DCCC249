import type { IColumn } from '@/components/Table/typing';
import StatusTag from '@/pages/DatLich/components/StatusTag';
import { formatDateTime } from '@/pages/DatLich/components/constants';
import { Button, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
import FormLichHen from './components/FormLichHen';

const LichHen = () => {
	const { appointments, refresh, setRow, isEdit, setVisible, setIsEdit, visible, remove, updateStatus } =
		useModel('bookingAppointments');
	const { employees } = useModel('bookingEmployees');
	const { services } = useModel('bookingServices');

	const empById = useMemo(() => new Map(employees.map((e: Booking.EmployeeRecord) => [e.id, e])), [employees]);
	const svcById = useMemo(() => new Map(services.map((s: Booking.ServiceRecord) => [s.id, s])), [services]);

	const columns: IColumn<Booking.AppointmentRecord>[] = [
		{ title: 'Khách', dataIndex: 'customerName', width: 180 },
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceId',
			width: 220,
			render: (id: string) => svcById.get(id)?.name ?? 'N/A',
		},
		{
			title: 'Nhân viên',
			dataIndex: 'employeeId',
			width: 220,
			render: (id: string) => empById.get(id)?.fullName ?? 'N/A',
		},
		{
			title: 'Bắt đầu',
			dataIndex: 'startAt',
			width: 160,
			render: (iso: string) => formatDateTime(iso),
		},
		{
			title: 'Kết thúc',
			dataIndex: 'endAt',
			width: 160,
			render: (iso: string) => formatDateTime(iso),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 120,
			render: (s: Booking.AppointmentStatus) => <StatusTag status={s} />,
		},
		{
			title: 'Cập nhật',
			width: 160,
			render: (record) => (
				<Select
					size='small'
					value={record.status}
					style={{ width: '100%' }}
					onChange={(val) => updateStatus(record.id, val)}
					options={[
						{ label: 'Chờ duyệt', value: 'PENDING' },
						{ label: 'Xác nhận', value: 'CONFIRMED' },
						{ label: 'Hoàn thành', value: 'COMPLETED' },
						{ label: 'Hủy', value: 'CANCELLED' },
					]}
				/>
			),
		},
		{
			title: 'Thao tác',
			width: 220,
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
					<Popconfirm title='Xóa lịch hẹn?' onConfirm={() => remove(record.id)}>
						<Button danger>Xóa</Button>
					</Popconfirm>
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
				Đặt lịch hẹn
			</Button>

			<Table rowKey='id' style={{ marginTop: 12 }} dataSource={appointments} columns={columns as any} />

			<Modal
				destroyOnClose
				footer={false}
				title={isEdit ? 'Sửa lịch hẹn' : 'Đặt lịch hẹn'}
				visible={visible}
				onCancel={() => setVisible(false)}
				afterClose={() => refresh()}
			>
				<FormLichHen />
			</Modal>
		</div>
	);
};

export default LichHen;