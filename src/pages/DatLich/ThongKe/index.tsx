import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import MyDateRangePicker from '@/components/MyDatePicker/RangePicker';
import { Card, Col, Row, Space } from 'antd';
import { useModel } from 'umi';

const ThongKe = () => {
	const { range, setRange, data } = useModel('bookingReports');

	return (
		<div>
			<Card>
				<Space style={{ width: '100%' }} direction='vertical' size={12}>
					<div style={{ maxWidth: 420 }}>
						<MyDateRangePicker
							value={range.from && range.to ? [range.from, range.to] : undefined}
							format='DD/MM/YYYY'
							onChange={(val) => {
								setRange({ from: val?.[0], to: val?.[1] });
							}}
						/>
					</div>
				</Space>
			</Card>

			<Row gutter={[12, 12]} style={{ marginTop: 12 }}>
				<Col xs={24} xl={24}>
					<Card title='Số lượng lịch hẹn theo ngày'>
						<ColumnChart {...data.apptCountByDayChart} height={320} />
					</Card>
				</Col>

				<Col xs={24} xl={12}>
					<Card title='Doanh thu theo dịch vụ'>
						<DonutChart {...data.revenueByServiceDonut} height={320} />
					</Card>
				</Col>

				<Col xs={24} xl={12}>
					<Card title='Doanh thu theo nhân viên'>
						<DonutChart {...data.revenueByEmployeeDonut} height={320} />
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ThongKe;