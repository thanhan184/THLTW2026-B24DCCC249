import TinyEditor from '@/components/TinyEditor';
import { formatDateTime } from '@/pages/DatLich/components/constants';
import { bookingStorage } from '@/utils/bookingStorage';
import { Button, Form, Input, Rate, Select, Space } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';

type FormValues = {
	appointmentId: string;
	rating: number;
	comment: string;
	reply?: string;
};

const FormDanhGia = () => {
	const [form] = Form.useForm<FormValues>();
	const { setVisible, create, canCreateReview } = useModel('bookingReviews');

	const apptOptions = useMemo(() => {
		const appts = bookingStorage.readAppointments().filter((a) => a.status === 'COMPLETED');
		const empById = new Map(bookingStorage.readEmployees().map((e) => [e.id, e]));
		const svcById = new Map(bookingStorage.readServices().map((s) => [s.id, s]));
		return appts
			.filter((a) => !canCreateReview(a.id))
			.map((a) => ({
				label: `${formatDateTime(a.startAt)} - ${svcById.get(a.serviceId)?.name ?? 'N/A'} - ${empById.get(a.employeeId)?.fullName ?? 'N/A'} (${a.customerName})`,
				value: a.id,
			}));
	}, [canCreateReview]);

	return (
		<Form<FormValues>
			form={form}
			layout='vertical'
			initialValues={{ rating: 5, comment: '', reply: '' }}
			onFinish={(values) => {
				const appt = bookingStorage.readAppointments().find((a) => a.id === values.appointmentId);
				if (!appt) return;
				const ok = create({
					appointmentId: values.appointmentId,
					employeeId: appt.employeeId,
					serviceId: appt.serviceId,
					rating: Math.max(1, Math.min(5, Number(values.rating))) as any,
					comment: values.comment,
					reply: values.reply,
				});
				if (ok) setVisible(false);
			}}
		>
			<Form.Item name='appointmentId' label='Lịch hẹn đã hoàn thành' rules={[{ required: true, message: 'Chọn lịch hẹn' }]}>
				<Select options={apptOptions} showSearch optionFilterProp='label' />
			</Form.Item>

			<Space size={12} style={{ display: 'flex' }}>
				<Form.Item name='rating' label='Số sao' rules={[{ required: true, message: 'Chọn số sao' }]}>
					<Rate />
				</Form.Item>
			</Space>

			<Form.Item name='comment' label='Nội dung đánh giá' rules={[{ required: true, message: 'Nhập nội dung' }]}>
				<Input.TextArea rows={3} placeholder='Cảm nhận của khách hàng...' />
			</Form.Item>

			<Form.Item name='reply' label='Phản hồi của nhân viên (tuỳ chọn)'>
				<TinyEditor tinyToolbar height={250} stickyToolbar={false} />
			</Form.Item>

			<div className='form-footer' style={{ marginTop: 16 }}>
				<Button htmlType='submit' type='primary'>
					Tạo đánh giá
				</Button>
				<Button onClick={() => setVisible(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormDanhGia;