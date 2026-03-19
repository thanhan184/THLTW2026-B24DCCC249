import type { IColumn } from '@/components/Table/typing';
import { currencyFormat } from '@/utils/utils';
import { Button, Modal, Space, Table, Tag } from 'antd';
import { useModel } from 'umi';
import FormDichVu from './components/FormDichVu';

const DichVu = () => {
	const { services, refresh, setRow, isEdit, setVisible, setIsEdit, visible, remove } = useModel('bookingServices');

	const columns: IColumn<Booking.ServiceRecord>[] = [
		{ title: 'Mã', dataIndex: 'code', width: 90 },
		{ title: 'Tên dịch vụ', dataIndex: 'name', width: 260 },
		{
			title: 'Giá',
			dataIndex: 'price',
			width: 120,
			align: 'right',
			render: (val: number) => `${currencyFormat(val)} đ`,
		},
		{
			title: 'Thời gian',
			dataIndex: 'durationMinutes',
			width: 110,
			align: 'right',
			render: (val: number) => `${val} phút`,
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
				Thêm dịch vụ
			</Button>

			<Table rowKey='id' style={{ marginTop: 12 }} dataSource={services} columns={columns as any} />

			<Modal
				destroyOnClose
				footer={false}
				title={isEdit ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
				visible={visible}
				onCancel={() => setVisible(false)}
			>
				<FormDichVu />
			</Modal>
		</div>
	);
};

export default DichVu;