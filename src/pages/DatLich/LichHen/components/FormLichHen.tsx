import MyDatePicker from '@/components/MyDatePicker';
import { formatDateTime } from '@/pages/DatLich/components/constants';
import { Button, Form, Input, Select, Space } from 'antd';
import moment from 'moment';
import { useMemo } from 'react';
import { useModel } from 'umi';

type FormValues = {
	customerName: string;
	customerPhone?: string;
	customerNote?: string;
	serviceId: string;
	employeeId: string;
	startAt: string;
};

const FormLichHen = () => {
	const [form] = Form.useForm<FormValues>();
	const { row, isEdit, setVisible, upsert } = useModel('bookingAppointments');
	const { options: employeeOptions } = useModel('bookingEmployees');
	const { options: serviceOptions, services } = useModel('bookingServices');

	const serviceById = useMemo(() => new Map(services.map((s: Booking.ServiceRecord) => [s.id, s])), [services]);

	const startAt = Form.useWatch('startAt', form);
	const serviceId = Form.useWatch('serviceId', form);

	const endAt = useMemo(() => {
		if (!startAt || !serviceId) return undefined;
		const s = serviceById.get(serviceId);
		if (!s) return undefined;
		const start = moment(startAt);
		if (!start.isValid()) return undefined;
		return start.clone().add(s.durationMinutes, 'minute').toISOString();
	}, [startAt, serviceId, serviceById]);

	return (
		<Form<FormValues>
			form={form}
			layout='vertical'
			initialValues={{
				customerName: row?.customerName,
				customerPhone: row?.customerPhone,
				customerNote: row?.customerNote,
				serviceId: row?.serviceId,
				employeeId: row?.employeeId,
				startAt: row?.startAt ?? moment().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toISOString(),
			}}
			onFinish={(values) => {
				const ok = upsert({ ...values, id: row?.id });
				if (ok) setVisible(false);
			}}
		>
			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='customerName' label='Tên khách' rules={[{ required: true, message: 'Nhập tên khách' }]}>
					<Input placeholder='VD: Nguyễn Văn A' />
				</Form.Item>
				<Form.Item name='customerPhone' label='SĐT khách'>
					<Input placeholder='VD: 09xxxxxxxx' />
				</Form.Item>
			</Space>

			<Form.Item name='customerNote' label='Ghi chú'>
				<Input.TextArea rows={2} placeholder='Ghi chú...' />
			</Form.Item>

			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='serviceId' label='Dịch vụ' rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
					<Select options={serviceOptions} showSearch optionFilterProp='label' />
				</Form.Item>
				<Form.Item name='employeeId' label='Nhân viên' rules={[{ required: true, message: 'Chọn nhân viên' }]}>
					<Select options={employeeOptions} showSearch optionFilterProp='label' />
				</Form.Item>
			</Space>

			<Form.Item name='startAt' label='Ngày giờ hẹn' rules={[{ required: true, message: 'Chọn ngày giờ' }]}>
				<MyDatePicker showTime={{ format: 'HH:mm' }} format='DD/MM/YYYY HH:mm' />
			</Form.Item>

			{endAt ? (
				<div style={{ marginTop: -8, marginBottom: 12, color: 'rgba(0,0,0,0.65)' }}>
					Dự kiến kết thúc: <b>{formatDateTime(endAt)}</b>
				</div>
			) : null}

			<div className='form-footer' style={{ marginTop: 16 }}>
				<Button htmlType='submit' type='primary'>
					{isEdit ? 'Lưu' : 'Đặt lịch'}
				</Button>
				<Button onClick={() => setVisible(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormLichHen;