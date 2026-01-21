import {
	Table,
	Popconfirm,
	message,
	Modal,
	Form,
	Input,
	InputNumber,
	Button,
} from 'antd';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

interface SanPham {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

const BaiTap1 = () => {
	const { danhSachSanPham, setDanhSachSanPham } = useModel('sanpham');

	const [searchText, setSearchText] = useState<string>('');
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [form] = Form.useForm<SanPham>();

	const danhSachSauKhiLoc = useMemo(() => {
		const keyword = searchText.trim().toLowerCase();
		if (!keyword) return danhSachSanPham;
		return (danhSachSanPham as SanPham[]).filter((item) =>
			item.name.toLowerCase().includes(keyword),
		);
	}, [searchText, danhSachSanPham]);

	const handleDelete = (record: SanPham) => {
		const danhSachSanPhamMoi = (danhSachSanPham as SanPham[]).filter(
			(item) => item.id !== record.id,
		);
		setDanhSachSanPham(danhSachSanPhamMoi);
		message.info('Xóa thành công');
	};

	const handleOpenModal = () => {
		form.resetFields();
		setOpenModal(true);
	};

	const handleCancelModal = () => {
		setOpenModal(false);
	};

	const handleSubmitForm = async () => {
		try {
			const values = await form.validateFields();

			const list = danhSachSanPham as SanPham[];
			const maxId =
				list.reduce((max, item) => (item.id > max ? item.id : max), 0) || 0;

			const newProduct: SanPham = {
				id: maxId + 1,
				name: values.name,
				price: values.price,
				quantity: values.quantity,
			};

			setDanhSachSanPham([...list, newProduct]);
			message.success('Thêm sản phẩm thành công');
			setOpenModal(false);
			form.resetFields();
		} catch (error) {
			
		}
	};

	const cot = [
		{
			title: 'STT',
			dataIndex: 'id',
			width: 100,
		},
		{
			title: 'Tên Sản Phẩm',
			dataIndex: 'name',
			width: 250,
			render: (_value: string, record: SanPham) => {
				return <b style={{ color: 'red' }}>{record.name}</b>;
			},
		},
		{
			title: 'Giá Sản Phẩm',
			dataIndex: 'price',
			width: 200,
		},
		{
			title: 'Số Lượng Sản Phẩm',
			dataIndex: 'quantity',
			width: 200,
		},
		{
			title: 'Thao tác',
			width: 150,
			render: (_value: any, record: SanPham) => (
				<Popconfirm
					title="Bạn có chắc muốn xóa sản phẩm này?"
					onConfirm={() => handleDelete(record)}
					okText="Đồng ý"
					cancelText="Hủy"
				>
					<Button type='primary'>Xoá</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<>
			<h1>Quản lý sản phẩm</h1>

			<div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
				<Input.Search
					allowClear
					placeholder="Tìm kiếm theo tên sản phẩm"
					style={{ maxWidth: 300 }}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<Button type="primary" onClick={handleOpenModal}>
					Thêm sản phẩm
				</Button>
			</div>

			<Table
				rowKey="id"
				columns={cot}
				dataSource={danhSachSauKhiLoc as SanPham[]}
				pagination={false}
			/>

			<Modal
				visible={openModal}
				title="Thêm sản phẩm mới"
				onCancel={handleCancelModal}
				onOk={handleSubmitForm}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Tên sản phẩm"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
					>
						<Input placeholder="Nhập tên sản phẩm" />
					</Form.Item>

					<Form.Item
						label="Giá"
						name="price"
						rules={[
							{ required: true, message: 'Vui lòng nhập giá' },
							{
								type: 'number',
								min: 0.0000001,
								message: 'Giá phải là số dương',
							},
						]}
					>
						<InputNumber
							style={{ width: '100%' }}
							placeholder="Nhập giá"
							min={0}
						/>
					</Form.Item>

					<Form.Item
						label="Số lượng"
						name="quantity"
						rules={[
							{ required: true, message: 'Vui lòng nhập số lượng' },
							{
								validator: (_, value) => {
									if (value === undefined || value === null) {
										return Promise.reject(
											new Error('Vui lòng nhập số lượng'),
										);
									}
									if (!Number.isInteger(value) || value <= 0) {
										return Promise.reject(
											new Error('Số lượng phải là số nguyên dương'),
										);
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<InputNumber
							style={{ width: '100%' }}
							placeholder="Nhập số lượng"
							min={1}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default BaiTap1;