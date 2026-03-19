import { Button, Form, Input, InputNumber, Space, Switch } from 'antd';
import { useModel } from 'umi';

type FormValues = {
	code: string;
	name: string;
	price: number;
	durationMinutes: number;
	active: boolean;
};

const FormDichVu = () => {
	const [form] = Form.useForm<FormValues>();
	const { row, isEdit, setVisible, upsert } = useModel('bookingServices');

	return (
		<Form<FormValues>
			form={form}
			layout='vertical'
			initialValues={{
				code: row?.code,
				name: row?.name,
				price: row?.price ?? 0,
				durationMinutes: row?.durationMinutes ?? 30,
				active: row?.active ?? true,
			}}
			onFinish={(values) => {
				const ok = upsert({ ...values, id: row?.id });
				if (ok) setVisible(false);
			}}
		>
			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='code' label='Mã dịch vụ' rules={[{ required: true, message: 'Nhập mã' }]}>
					<Input placeholder='VD: DV011' />
				</Form.Item>
				<Form.Item name='name' label='Tên dịch vụ' rules={[{ required: true, message: 'Nhập tên' }]}>
					<Input placeholder='VD: Cắt tóc + gội' />
				</Form.Item>
			</Space>

			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='price' label='Giá (VND)' rules={[{ required: true, message: 'Nhập giá' }]}>
					<InputNumber min={0} style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item
					name='durationMinutes'
					label='Thời gian (phút)'
					rules={[{ required: true, message: 'Nhập thời gian' }]}
				>
					<InputNumber min={5} step={5} style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item name='active' label='Hoạt động' valuePropName='checked'>
					<Switch />
				</Form.Item>
			</Space>

			<div className='form-footer' style={{ marginTop: 16 }}>
				<Button htmlType='submit' type='primary'>
					{isEdit ? 'Lưu' : 'Thêm'}
				</Button>
				<Button onClick={() => setVisible(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormDichVu;