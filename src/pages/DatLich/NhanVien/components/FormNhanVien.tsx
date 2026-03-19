import { weekdayLabel } from '@/pages/DatLich/components/constants';
import { Button, Form, Input, InputNumber, Select, Space, Switch, TimePicker } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';

type FormValues = {
	code: string;
	fullName: string;
	phone?: string;
	email?: string;
	maxCustomersPerDay: number;
	active: boolean;
	shifts: { weekday: Booking.Weekday; startTime: string; endTime: string }[];
};

const FormNhanVien = () => {
	const [form] = Form.useForm<FormValues>();
	const { row, isEdit, setVisible, upsert } = useModel('bookingEmployees');

	return (
		<Form<FormValues>
			form={form}
			layout='vertical'
			initialValues={{
				code: row?.code,
				fullName: row?.fullName,
				phone: row?.phone,
				email: row?.email,
				maxCustomersPerDay: row?.maxCustomersPerDay ?? 8,
				active: row?.active ?? true,
				shifts: row?.shifts?.length
					? row.shifts
					: [{ weekday: 1, startTime: '09:00', endTime: '17:00' }],
			}}
			onFinish={(values) => {
				const ok = upsert({ ...values, id: row?.id });
				if (ok) setVisible(false);
			}}
		>
			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='code' label='Mã nhân viên' rules={[{ required: true, message: 'Nhập mã' }]}>
					<Input placeholder='VD: NV011' />
				</Form.Item>
				<Form.Item name='fullName' label='Họ tên' rules={[{ required: true, message: 'Nhập họ tên' }]}>
					<Input placeholder='VD: Nguyễn Văn A' />
				</Form.Item>
			</Space>

			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='phone' label='Số điện thoại'>
					<Input placeholder='VD: 0909xxxxxx' />
				</Form.Item>
				<Form.Item name='email' label='Email'>
					<Input placeholder='VD: a@demo.com' />
				</Form.Item>
			</Space>

			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item
					name='maxCustomersPerDay'
					label='Giới hạn khách/ngày'
					rules={[{ required: true, message: 'Nhập giới hạn' }]}
				>
					<InputNumber min={1} style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item name='active' label='Hoạt động' valuePropName='checked'>
					<Switch />
				</Form.Item>
			</Space>

			<Form.List name='shifts'>
				{(fields, { add, remove }) => (
					<div>
						<div style={{ fontWeight: 600, marginBottom: 8 }}>Ca làm việc</div>
						{fields.map((field) => (
							<Space key={field.key} align='baseline' style={{ display: 'flex', marginBottom: 8 }}>
								<Form.Item
									{...field}
									name={[field.name, 'weekday']}
									rules={[{ required: true, message: 'Chọn thứ' }]}
								>
									<Select
										style={{ width: 90 }}
										options={(Object.keys(weekdayLabel) as unknown as Booking.Weekday[]).map((w) => ({
											label: weekdayLabel[w],
											value: w,
										}))}
									/>
								</Form.Item>

								<Form.Item
									{...field}
									name={[field.name, 'startTime']}
									rules={[{ required: true, message: 'Giờ bắt đầu' }]}
									getValueProps={(val) => ({ value: val ? moment(val, 'HH:mm') : null })}
									getValueFromEvent={(_, timeStr) => timeStr}
								>
									<TimePicker format='HH:mm' minuteStep={5} />
								</Form.Item>

								<Form.Item
									{...field}
									name={[field.name, 'endTime']}
									rules={[{ required: true, message: 'Giờ kết thúc' }]}
									getValueProps={(val) => ({ value: val ? moment(val, 'HH:mm') : null })}
									getValueFromEvent={(_, timeStr) => timeStr}
								>
									<TimePicker format='HH:mm' minuteStep={5} />
								</Form.Item>

								<Button danger onClick={() => remove(field.name)}>
									Xóa
								</Button>
							</Space>
						))}
						<Button onClick={() => add({ weekday: 1, startTime: '09:00', endTime: '17:00' })}>Thêm ca</Button>
					</div>
				)}
			</Form.List>

			<div className='form-footer' style={{ marginTop: 16 }}>
				<Button htmlType='submit' type='primary'>
					{isEdit ? 'Lưu' : 'Thêm'}
				</Button>
				<Button onClick={() => setVisible(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormNhanVien;