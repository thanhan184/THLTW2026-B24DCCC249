import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Progress,
	Row,
	Col,
	Select,
	Statistic,
	Table,
	Tabs,
	Tag,
	message,
} from 'antd';
import moment, { type Moment } from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;

interface SubjectCategory {
	id: number;
	name: string;
}

interface StudySession {
	id: number;
	subjectId: number;
	subjectName: string;
	datetime: string; 
	durationHours: number;
	content: string;
	note?: string;
}

interface MonthlyGoal {
	id: number;
	month: string;
	subjectId: number | 'all';
	targetHours: number;
}

const STORAGE_KEY_SUBJECTS = 'study_subjects_v1';
const STORAGE_KEY_SESSIONS = 'study_sessions_v1';
const STORAGE_KEY_GOALS = 'study_goals_v1';

const TH01Bai2: React.FC = () => {
	const [subjects, setSubjects] = useState<SubjectCategory[]>([]);
	const [sessions, setSessions] = useState<StudySession[]>([]);
	const [goals, setGoals] = useState<MonthlyGoal[]>([]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		try {
			const subRaw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
			const sesRaw = localStorage.getItem(STORAGE_KEY_SESSIONS);
			const goalRaw = localStorage.getItem(STORAGE_KEY_GOALS);

			setSubjects(subRaw ? JSON.parse(subRaw) : []);
			setSessions(sesRaw ? JSON.parse(sesRaw) : []);
			setGoals(goalRaw ? JSON.parse(goalRaw) : []);
		} catch {
			setSubjects([]);
			setSessions([]);
			setGoals([]);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
	}, [subjects]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
	}, [sessions]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
	}, [goals]);

	// Tab môn học 
	const [subjectModalVisible, setSubjectModalVisible] = useState(false);
	const [editingSubject, setEditingSubject] = useState<SubjectCategory | null>(null);
	const [subjectForm] = Form.useForm();

	const openCreateSubject = () => {
		setEditingSubject(null);
		subjectForm.resetFields();
		setSubjectModalVisible(true);
	};

	const openEditSubject = (record: SubjectCategory) => {
		setEditingSubject(record);
		subjectForm.setFieldsValue({ name: record.name });
		setSubjectModalVisible(true);
	};

	const handleSaveSubject = async () => {
		try {
			const values = await subjectForm.validateFields();
			const name = (values.name as string).trim();
			if (!name) {
				message.error('Tên môn học không được để trống');
				return;
			}

			if (editingSubject) {
				const updated = subjects.map((s) =>
					s.id === editingSubject.id ? { ...s, name } : s,
				);

				const updatedSessions = sessions.map((ss) =>
					ss.subjectId === editingSubject.id ? { ...ss, subjectName: name } : ss,
				);

				setSubjects(updated);
				setSessions(updatedSessions);
				message.success('Cập nhật môn học thành công');
			} else {
				const maxId =
					subjects.reduce((max, s) => (s.id > max ? s.id : max), 0) || 0;
				const newSubject: SubjectCategory = {
					id: maxId + 1,
					name,
				};
				setSubjects([...subjects, newSubject]);
				message.success('Thêm môn học thành công');
			}

			setSubjectModalVisible(false);
			subjectForm.resetFields();
		} catch {

		}
	};

	const handleDeleteSubject = (record: SubjectCategory) => {
		const hasSessions = sessions.some((s) => s.subjectId === record.id);
		if (hasSessions) {
			message.error('Không thể xóa môn học đang có lịch học.');
			return;
		}
		setSubjects(subjects.filter((s) => s.id !== record.id));
		message.success('Đã xóa môn học');
	};

	const subjectColumns = [
		{
			title: 'ID',
			dataIndex: 'id',
			width: 80,
		},
		{
			title: 'Tên môn học',
			dataIndex: 'name',
		},
		{
			title: 'Thao tác',
			render: (_: any, record: SubjectCategory) => (
				<>
					<Button type="link" onClick={() => openEditSubject(record)}>
						Sửa
					</Button>
					<Popconfirm
						title="Bạn chắc chắn muốn xóa môn học này?"
						onConfirm={() => handleDeleteSubject(record)}
					>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	//Tab tiến độ 
	const [sessionModalVisible, setSessionModalVisible] = useState(false);
	const [editingSession, setEditingSession] = useState<StudySession | null>(null);
	const [sessionForm] = Form.useForm();
	const [sessionSubjectFilter, setSessionSubjectFilter] = useState<number | 'all'>(
		'all',
	);

	const filteredSessions = useMemo(() => {
		if (sessionSubjectFilter === 'all') return sessions;
		return sessions.filter((s) => s.subjectId === sessionSubjectFilter);
	}, [sessions, sessionSubjectFilter]);

	const openCreateSession = () => {
		setEditingSession(null);
		sessionForm.resetFields();
		setSessionModalVisible(true);
	};

	const openEditSession = (record: StudySession) => {
		setEditingSession(record);
		sessionForm.setFieldsValue({
			subjectId: record.subjectId,
			datetime: moment(record.datetime),
			durationHours: record.durationHours,
			content: record.content,
			note: record.note,
		});
		setSessionModalVisible(true);
	};

	const handleSaveSession = async () => {
		try {
			const values = await sessionForm.validateFields();
			const subjectId = values.subjectId as number;
			const subject = subjects.find((s) => s.id === subjectId);
			if (!subject) {
				message.error('Môn học không tồn tại');
				return;
			}

			const datetime = values.datetime as Moment;
			const newSession: StudySession = {
				id:
					editingSession?.id ??
					(sessions.reduce((max, s) => (s.id > max ? s.id : max), 0) + 1 || 1),
				subjectId,
				subjectName: subject.name,
				datetime: datetime.toISOString(),
				durationHours: values.durationHours as number,
				content: values.content as string,
				note: values.note as string | undefined,
			};

			if (editingSession) {
				const updated = sessions.map((s) =>
					s.id === editingSession.id ? newSession : s,
				);
				setSessions(updated);
				message.success('Cập nhật lịch học thành công');
			} else {
				setSessions([...sessions, newSession]);
				message.success('Thêm lịch học thành công');
			}

			setSessionModalVisible(false);
			sessionForm.resetFields();
		} catch {
			
		}
	};

	const handleDeleteSession = (record: StudySession) => {
		setSessions(sessions.filter((s) => s.id !== record.id));
		message.success('Đã xóa lịch học');
	};

	const sessionColumns = [
		{
			title: 'Môn học',
			dataIndex: 'subjectName',
		},
		{
			title: 'Thời gian học',
			dataIndex: 'datetime',
			render: (value: string) => moment(value).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: 'Thời lượng (giờ)',
			dataIndex: 'durationHours',
		},
		{
			title: 'Nội dung đã học',
			dataIndex: 'content',
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
		},
		{
			title: 'Thao tác',
			render: (_: any, record: StudySession) => (
				<>
					<Button type="link" onClick={() => openEditSession(record)}>
						Sửa
					</Button>
					<Popconfirm
						title="Bạn chắc chắn muốn xóa lịch học này?"
						onConfirm={() => handleDeleteSession(record)}
					>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	// Tab mục tiêu 
	const [goalModalVisible, setGoalModalVisible] = useState(false);
	const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
	const [goalForm] = Form.useForm();
	const [goalMonthFilter, setGoalMonthFilter] = useState<string>(
		moment().format('YYYY-MM'),
	);

	const openCreateGoal = () => {
		setEditingGoal(null);
		goalForm.resetFields();
		goalForm.setFieldsValue({ month: moment(), subjectId: 'all' });
		setGoalModalVisible(true);
	};

	const openEditGoal = (record: MonthlyGoal) => {
		setEditingGoal(record);
		goalForm.setFieldsValue({
			month: moment(record.month, 'YYYY-MM'),
			subjectId: record.subjectId,
			targetHours: record.targetHours,
		});
		setGoalModalVisible(true);
	};

	const handleSaveGoal = async () => {
		try {
			const values = await goalForm.validateFields();
			const monthMoment = values.month as Moment;
			const monthStr = monthMoment.format('YYYY-MM');
			const subjectId = values.subjectId as number | 'all';
			const targetHours = values.targetHours as number;

			const newGoal: MonthlyGoal = {
				id:
					editingGoal?.id ??
					(goals.reduce((max, g) => (g.id > max ? g.id : max), 0) + 1 || 1),
				month: monthStr,
				subjectId,
				targetHours,
			};

			if (editingGoal) {
				const updated = goals.map((g) =>
					g.id === editingGoal.id ? newGoal : g,
				);
				setGoals(updated);
				message.success('Cập nhật mục tiêu thành công');
			} else {
				setGoals([...goals, newGoal]);
				message.success('Thêm mục tiêu thành công');
			}

			setGoalModalVisible(false);
			goalForm.resetFields();
		} catch {
			
		}
	};

	const handleDeleteGoal = (record: MonthlyGoal) => {
		setGoals(goals.filter((g) => g.id !== record.id));
		message.success('Đã xóa mục tiêu');
	};

	const goalsWithProgress = useMemo(() => {
		return goals.map((g) => {
			const sessionsInMonth = sessions.filter(
				(s) => moment(s.datetime).format('YYYY-MM') === g.month,
			);

			let totalHours = 0;
			if (g.subjectId === 'all') {
				totalHours = sessionsInMonth.reduce(
					(sum, s) => sum + s.durationHours,
					0,
				);
			} else {
				totalHours = sessionsInMonth
					.filter((s) => s.subjectId === g.subjectId)
					.reduce((sum, s) => sum + s.durationHours, 0);
			}

			const percent =
				g.targetHours > 0
					? Math.min(100, Math.round((totalHours / g.targetHours) * 100))
					: 0;

			const done = totalHours >= g.targetHours;

			return {
				...g,
				totalHours,
				percent,
				done,
			};
		});
	}, [goals, sessions]);

	const filteredGoalsByMonth = useMemo(
		() =>
			goalsWithProgress.filter((g) => {
				if (!goalMonthFilter) return true;
				return g.month === goalMonthFilter;
			}),
		[goalsWithProgress, goalMonthFilter],
	);

	const goalColumns = [
		{
			title: 'Tháng',
			dataIndex: 'month',
			render: (value: string) => moment(value, 'YYYY-MM').format('MM/YYYY'),
		},
		{
			title: 'Môn học',
			render: (_: any, record: any) => {
				if (record.subjectId === 'all')
					return <Tag color="blue">Tất cả môn</Tag>;
				const subject = subjects.find((s) => s.id === record.subjectId);
				return subject ? subject.name : 'Không xác định';
			},
		},
		{
			title: 'Mục tiêu (giờ)',
			dataIndex: 'targetHours',
		},
		{
			title: 'Đã học (giờ)',
			dataIndex: 'totalHours',
		},
		{
			title: 'Tiến độ',
			render: (_: any, record: any) => (
				<Progress
					percent={record.percent}
					status={record.done ? 'success' : 'active'}
				/>
			),
		},
		{
			title: 'Trạng thái',
			render: (_: any, record: any) =>
				record.done ? (
					<Tag color="green">Hoàn thành</Tag>
				) : (
					<Tag color="orange">Chưa đạt</Tag>
				),
		},
		{
			title: 'Thao tác',
			render: (_: any, record: MonthlyGoal) => (
				<>
					<Button type="link" onClick={() => openEditGoal(record)}>
						Sửa
					</Button>
					<Popconfirm
						title="Bạn chắc chắn muốn xóa mục tiêu này?"
						onConfirm={() => handleDeleteGoal(record)}
					>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	// Thống kê nhanh 
	const totalHoursAll = useMemo(
		() => sessions.reduce((sum, s) => sum + s.durationHours, 0),
		[sessions],
	);

	const totalSubjects = subjects.length;
	const totalSessions = sessions.length;

	return (
		<div>
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={16}>
					<Col span={8}>
						<Statistic title="Số môn học" value={totalSubjects} />
					</Col>
					<Col span={8}>
						<Statistic title="Tổng số buổi học" value={totalSessions} />
					</Col>
					<Col span={8}>
						<Statistic
							title="Tổng thời lượng đã học (giờ)"
							value={totalHoursAll}
						/>
					</Col>
				</Row>
			</Card>

			<Tabs defaultActiveKey="subjects">
				<TabPane tab="Danh mục môn học" key="subjects">
					<Button
						type="primary"
						onClick={openCreateSubject}
						style={{ marginBottom: 16 }}
					>
						Thêm môn học
					</Button>
					<Table rowKey="id" columns={subjectColumns} dataSource={subjects} />
				</TabPane>

				<TabPane tab="Tiến độ học tập" key="sessions">
					<div
						style={{
							marginBottom: 16,
							display: 'flex',
							gap: 8,
							flexWrap: 'wrap',
						}}
					>
						<Select
							value={sessionSubjectFilter}
							style={{ width: 220 }}
							onChange={(val: number | 'all') => setSessionSubjectFilter(val)}
						>
							<Option value="all">Tất cả môn</Option>
							{subjects.map((s) => (
								<Option key={s.id} value={s.id}>
									{s.name}
								</Option>
							))}
						</Select>
						<Button type="primary" onClick={openCreateSession}>
							Thêm lịch học
						</Button>
					</div>

					<Table
						rowKey="id"
						columns={sessionColumns}
						dataSource={filteredSessions}
					/>
				</TabPane>

				<TabPane tab="Mục tiêu học tập hàng tháng" key="goals">
					<div
						style={{
							marginBottom: 16,
							display: 'flex',
							gap: 8,
							flexWrap: 'wrap',
						}}
					>
						<DatePicker
							picker="month"
							value={
								goalMonthFilter
									? moment(goalMonthFilter, 'YYYY-MM')
									: undefined
							}
							onChange={(val) =>
								setGoalMonthFilter(val ? val.format('YYYY-MM') : '')
							}
						/>
						<Button type="primary" onClick={openCreateGoal}>
							Thêm mục tiêu
						</Button>
					</div>

					<Table
						rowKey="id"
						columns={goalColumns}
						dataSource={filteredGoalsByMonth}
					/>
				</TabPane>
			</Tabs>

			<Modal
				visible={subjectModalVisible}
				title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
				onCancel={() => setSubjectModalVisible(false)}
				onOk={handleSaveSubject}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={subjectForm} layout="vertical">
					<Form.Item
						label="Tên môn học"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				visible={sessionModalVisible}
				title={editingSession ? 'Sửa lịch học' : 'Thêm lịch học'}
				onCancel={() => setSessionModalVisible(false)}
				onOk={handleSaveSession}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={sessionForm} layout="vertical">
					<Form.Item
						label="Môn học"
						name="subjectId"
						rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
					>
						<Select placeholder="Chọn môn học">
							{subjects.map((s) => (
								<Option key={s.id} value={s.id}>
									{s.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Thời gian học"
						name="datetime"
						rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}
					>
						<DatePicker showTime style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						label="Thời lượng (giờ)"
						name="durationHours"
						rules={[
							{ required: true, message: 'Vui lòng nhập thời lượng' },
							{ type: 'number', min: 0.5, message: 'Thời lượng phải > 0' },
						]}
					>
						<InputNumber style={{ width: '100%' }} step={0.5} min={0.5} />
					</Form.Item>

					<Form.Item
						label="Nội dung đã học"
						name="content"
						rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
					>
						<Input.TextArea rows={3} />
					</Form.Item>

					<Form.Item label="Ghi chú" name="note">
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				visible={goalModalVisible}
				title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
				onCancel={() => setGoalModalVisible(false)}
				onOk={handleSaveGoal}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={goalForm} layout="vertical">
					<Form.Item
						label="Tháng"
						name="month"
						rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
					>
						<DatePicker picker="month" style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						label="Môn học"
						name="subjectId"
						rules={[
							{ required: true, message: 'Vui lòng chọn môn hoặc tất cả' },
						]}
					>
						<Select>
							<Option value="all">Tất cả môn</Option>
							{subjects.map((s) => (
								<Option key={s.id} value={s.id}>
									{s.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Mục tiêu thời lượng (giờ)"
						name="targetHours"
						rules={[
							{ required: true, message: 'Vui lòng nhập số giờ' },
							{ type: 'number', min: 1, message: 'Mục tiêu phải >= 1 giờ' },
						]}
					>
						<InputNumber style={{ width: '100%' }} min={1} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default TH01Bai2;

