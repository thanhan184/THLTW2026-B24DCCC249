import { Tag } from 'antd';
import { appointmentStatusLabel } from './constants';

const colorOf: Record<Booking.AppointmentStatus, string> = {
	PENDING: 'orange',
	CONFIRMED: 'blue',
	COMPLETED: 'green',
	CANCELLED: 'red',
};

const StatusTag = (props: { status: Booking.AppointmentStatus }) => {
	return <Tag color={colorOf[props.status]}>{appointmentStatusLabel[props.status]}</Tag>;
};

export default StatusTag;