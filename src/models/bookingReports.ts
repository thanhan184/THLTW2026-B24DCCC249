import { bookingStorage, ensureBookingSeed } from '@/utils/bookingStorage';
import { tienVietNam } from '@/utils/utils';
import moment from 'moment';
import { useMemo, useState } from 'react';

type ReportRange = {
	from?: string; // ISO
	to?: string; // ISO
};

const inRange = (iso: string, range: ReportRange) => {
	const t = moment(iso);
	if (range.from && t.isBefore(range.from)) return false;
	if (range.to && t.isAfter(range.to)) return false;
	return true;
};

export default () => {
	ensureBookingSeed();

	const [range, setRange] = useState<ReportRange>({
		from: moment().startOf('month').toISOString(),
		to: moment().endOf('month').toISOString(),
	});

	const data = useMemo(() => {
		const appts = bookingStorage.readAppointments().filter((a) => a.status !== 'CANCELLED').filter((a) => inRange(a.startAt, range));
		const employees = bookingStorage.readEmployees();
		const services = bookingStorage.readServices();

		const svcById = new Map(services.map((s) => [s.id, s]));
		const empById = new Map(employees.map((e) => [e.id, e]));

		const apptByDay = new Map<string, number>();
		appts.forEach((a) => {
			const k = moment(a.startAt).format('YYYY-MM-DD');
			apptByDay.set(k, (apptByDay.get(k) ?? 0) + 1);
		});

		const apptDays = Array.from(apptByDay.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.reduce(
				(acc, [k, v]) => {
					acc.xAxis.push(moment(k).format('DD/MM'));
					acc.yAxis.push(v);
					return acc;
				},
				{ xAxis: [] as string[], yAxis: [] as number[] },
			);

		const revenueByService = new Map<string, number>();
		const revenueByEmployee = new Map<string, number>();

		appts.forEach((a) => {
			if (a.status !== 'COMPLETED' && a.status !== 'CONFIRMED') return;
			const price = svcById.get(a.serviceId)?.price ?? 0;
			revenueByService.set(a.serviceId, (revenueByService.get(a.serviceId) ?? 0) + price);
			revenueByEmployee.set(a.employeeId, (revenueByEmployee.get(a.employeeId) ?? 0) + price);
		});

		const toDonut = (m: Map<string, number>, labelOf: (id: string) => string) => {
			const entries = Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
			return {
				xAxis: entries.map(([id]) => labelOf(id)),
				yAxis: [entries.map(([, v]) => v)],
				yLabel: ['Doanh thu'],
				formatY: (val: number) => tienVietNam(val),
				showTotal: true,
			};
		};

		return {
			apptCountByDayChart: {
				xAxis: apptDays.xAxis,
				yAxis: [apptDays.yAxis],
				yLabel: ['Số lịch hẹn'],
				type: 'bar' as const,
				showTotal: true,
			},
			revenueByServiceDonut: toDonut(revenueByService, (id) => svcById.get(id)?.name ?? 'N/A'),
			revenueByEmployeeDonut: toDonut(revenueByEmployee, (id) => empById.get(id)?.fullName ?? 'N/A'),
		};
	}, [range]);

	return {
		range,
		setRange,
		data,
	};
};