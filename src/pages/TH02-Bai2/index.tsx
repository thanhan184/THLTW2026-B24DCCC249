import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Select,
	Statistic,
	Table,
	Tabs,
	Tag,
	message,
} from 'antd';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;

type Difficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface Block {
	id: number;
	name: string; 
}

interface Subject {
	id: number;
	code: string; 
	name: string; 
	credits: number; 
}

interface Question {
	id: number;
	code: string; 
	subjectId: number;
	blockId: number;
	difficulty: Difficulty;
	content: string;
}

interface ExamTemplateItem {
	blockId: number;
	difficulty: Difficulty;
	count: number;
}

interface ExamTemplate {
	id: number;
	name: string;
	subjectId: number;
	items: ExamTemplateItem[];
	createdAt: string; 
}

interface Exam {
	id: number;
	name: string;
	subjectId: number;
	templateId?: number;
	questionIds: number[];
	createdAt: string; 
}

const LS_BLOCKS = 'qb_blocks_v1';
const LS_SUBJECTS = 'qb_subjects_v1';
const LS_QUESTIONS = 'qb_questions_v1';
const LS_TEMPLATES = 'qb_exam_templates_v1';
const LS_EXAMS = 'qb_exams_v1';

const DIFFICULTIES: Difficulty[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

function safeParse<T>(raw: string | null, fallback: T): T {
	try {
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function nextId(list: { id: number }[]) {
	return (list.reduce((m, x) => (x.id > m ? x.id : m), 0) || 0) + 1;
}

function pickRandom<T>(arr: T[], count: number) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, count);
}

const TH02Bai2: React.FC = () => {
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [templates, setTemplates] = useState<ExamTemplate[]>([]);
	const [exams, setExams] = useState<Exam[]>([]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setBlocks(safeParse(localStorage.getItem(LS_BLOCKS), []));
		setSubjects(safeParse(localStorage.getItem(LS_SUBJECTS), []));
		setQuestions(safeParse(localStorage.getItem(LS_QUESTIONS), []));
		setTemplates(safeParse(localStorage.getItem(LS_TEMPLATES), []));
		setExams(safeParse(localStorage.getItem(LS_EXAMS), []));
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(LS_BLOCKS, JSON.stringify(blocks));
	}, [blocks]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(LS_SUBJECTS, JSON.stringify(subjects));
	}, [subjects]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(LS_QUESTIONS, JSON.stringify(questions));
	}, [questions]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(LS_TEMPLATES, JSON.stringify(templates));
	}, [templates]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(LS_EXAMS, JSON.stringify(exams));
	}, [exams]);

	const [blockModalOpen, setBlockModalOpen] = useState(false);
	const [editingBlock, setEditingBlock] = useState<Block | null>(null);
	const [blockForm] = Form.useForm();

	const openCreateBlock = () => {
		setEditingBlock(null);
		blockForm.resetFields();
		setBlockModalOpen(true);
	};

	const openEditBlock = (b: Block) => {
		setEditingBlock(b);
		blockForm.setFieldsValue({ name: b.name });
		setBlockModalOpen(true);
	};

	const saveBlock = async () => {
		try {
			const v = await blockForm.validateFields();
			const name = String(v.name).trim();
			if (!name) return;

			const exists = blocks.some(
				(x) =>
					x.name.toLowerCase() === name.toLowerCase() &&
					x.id !== editingBlock?.id,
			);
			if (exists) {
				message.error('Tên khối kiến thức đã tồn tại');
				return;
			}

			if (editingBlock) {
				setBlocks(blocks.map((x) => (x.id === editingBlock.id ? { ...x, name } : x)));
				message.success('Cập nhật khối kiến thức thành công');
			} else {
				setBlocks([...blocks, { id: nextId(blocks), name }]);
				message.success('Thêm khối kiến thức thành công');
			}

			setBlockModalOpen(false);
		} catch {
			
		}
	};

	const deleteBlock = (b: Block) => {
		const used =
			questions.some((q) => q.blockId === b.id) ||
			templates.some((t) => t.items.some((i) => i.blockId === b.id));
		if (used) {
			message.error('Không thể xóa vì đang được sử dụng bởi câu hỏi/cấu trúc đề');
			return;
		}
		setBlocks(blocks.filter((x) => x.id !== b.id));
		message.success('Đã xóa khối kiến thức');
	};

	const [subjectModalOpen, setSubjectModalOpen] = useState(false);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [subjectForm] = Form.useForm();

	const openCreateSubject = () => {
		setEditingSubject(null);
		subjectForm.resetFields();
		setSubjectModalOpen(true);
	};

	const openEditSubject = (s: Subject) => {
		setEditingSubject(s);
		subjectForm.setFieldsValue(s);
		setSubjectModalOpen(true);
	};

	const saveSubject = async () => {
		try {
			const v = await subjectForm.validateFields();
			const code = String(v.code).trim();
			const name = String(v.name).trim();
			const credits = Number(v.credits);

			const dupCode = subjects.some(
				(x) =>
					x.code.toLowerCase() === code.toLowerCase() &&
					x.id !== editingSubject?.id,
			);
			if (dupCode) {
				message.error('Mã môn đã tồn tại');
				return;
			}

			const payload: Subject = {
				id: editingSubject?.id ?? nextId(subjects),
				code,
				name,
				credits,
			};

			if (editingSubject) {
				setSubjects(subjects.map((x) => (x.id === editingSubject.id ? payload : x)));
				message.success('Cập nhật môn học thành công');
			} else {
				setSubjects([...subjects, payload]);
				message.success('Thêm môn học thành công');
			}

			setSubjectModalOpen(false);
		} catch {

		}
	};

	const deleteSubject = (s: Subject) => {
		const used =
			questions.some((q) => q.subjectId === s.id) ||
			templates.some((t) => t.subjectId === s.id) ||
			exams.some((e) => e.subjectId === s.id);
		if (used) {
			message.error('Không thể xóa vì đang được sử dụng');
			return;
		}
		setSubjects(subjects.filter((x) => x.id !== s.id));
		message.success('Đã xóa môn học');
	};

	const [questionModalOpen, setQuestionModalOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
	const [questionForm] = Form.useForm();

	const [qSubjectFilter, setQSubjectFilter] = useState<number | 'all'>('all');
	const [qBlockFilter, setQBlockFilter] = useState<number | 'all'>('all');
	const [qDiffFilter, setQDiffFilter] = useState<Difficulty | 'all'>('all');
	const [qSearch, setQSearch] = useState<string>('');

	const filteredQuestions = useMemo(() => {
		let r = [...questions];
		if (qSubjectFilter !== 'all') r = r.filter((q) => q.subjectId === qSubjectFilter);
		if (qBlockFilter !== 'all') r = r.filter((q) => q.blockId === qBlockFilter);
		if (qDiffFilter !== 'all') r = r.filter((q) => q.difficulty === qDiffFilter);
		if (qSearch.trim()) {
			const k = qSearch.trim().toLowerCase();
			r = r.filter(
				(q) =>
					q.code.toLowerCase().includes(k) ||
					q.content.toLowerCase().includes(k),
			);
		}
		return r;
	}, [questions, qSubjectFilter, qBlockFilter, qDiffFilter, qSearch]);

	const openCreateQuestion = () => {
		setEditingQuestion(null);
		questionForm.resetFields();
		setQuestionModalOpen(true);
	};

	const openEditQuestion = (q: Question) => {
		setEditingQuestion(q);
		questionForm.setFieldsValue(q);
		setQuestionModalOpen(true);
	};

	const saveQuestion = async () => {
		try {
			const v = await questionForm.validateFields();
			const code = String(v.code).trim();
			const content = String(v.content).trim();

			const dup = questions.some(
				(x) =>
					x.code.toLowerCase() === code.toLowerCase() &&
					x.id !== editingQuestion?.id,
			);
			if (dup) {
				message.error('Mã câu hỏi đã tồn tại');
				return;
			}

			const payload: Question = {
				id: editingQuestion?.id ?? nextId(questions),
				code,
				subjectId: Number(v.subjectId),
				blockId: Number(v.blockId),
				difficulty: v.difficulty as Difficulty,
				content,
			};

			if (editingQuestion) {
				setQuestions(questions.map((x) => (x.id === editingQuestion.id ? payload : x)));
				message.success('Cập nhật câu hỏi thành công');
			} else {
				setQuestions([...questions, payload]);
				message.success('Thêm câu hỏi thành công');
			}

			setQuestionModalOpen(false);
		} catch {
			
		}
	};

	const deleteQuestion = (q: Question) => {
		const usedInExam = exams.some((e) => e.questionIds.includes(q.id));
		if (usedInExam) {
			message.error('Không thể xóa vì câu hỏi đang nằm trong đề thi đã tạo');
			return;
		}
		setQuestions(questions.filter((x) => x.id !== q.id));
		message.success('Đã xóa câu hỏi');
	};

	const [templateModalOpen, setTemplateModalOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<ExamTemplate | null>(null);
	const [templateForm] = Form.useForm();

	const openCreateTemplate = () => {
		setEditingTemplate(null);
		templateForm.resetFields();
		templateForm.setFieldsValue({ items: [{ count: 1 }] });
		setTemplateModalOpen(true);
	};

	const openEditTemplate = (t: ExamTemplate) => {
		setEditingTemplate(t);
		templateForm.setFieldsValue(t);
		setTemplateModalOpen(true);
	};

	const saveTemplate = async () => {
		try {
			const v = await templateForm.validateFields();
			const items = (v.items as ExamTemplateItem[]).filter((x) => x && x.count > 0);

			if (!items.length) {
				message.error('Cấu trúc phải có ít nhất 1 dòng yêu cầu');
				return;
			}

			const payload: ExamTemplate = {
				id: editingTemplate?.id ?? nextId(templates),
				name: String(v.name).trim(),
				subjectId: Number(v.subjectId),
				items: items.map((x) => ({
					blockId: Number(x.blockId),
					difficulty: x.difficulty,
					count: Number(x.count),
				})),
				createdAt: editingTemplate?.createdAt ?? new Date().toISOString(),
			};

			if (editingTemplate) {
				setTemplates(templates.map((x) => (x.id === editingTemplate.id ? payload : x)));
				message.success('Cập nhật cấu trúc đề thành công');
			} else {
				setTemplates([...templates, payload]);
				message.success('Lưu cấu trúc đề thành công');
			}

			setTemplateModalOpen(false);
		} catch {
			
		}
	};

	const deleteTemplate = (t: ExamTemplate) => {
		const used = exams.some((e) => e.templateId === t.id);
		if (used) {
			message.error('Không thể xóa vì cấu trúc đang được dùng bởi đề thi');
			return;
		}
		setTemplates(templates.filter((x) => x.id !== t.id));
		message.success('Đã xóa cấu trúc đề');
	};

	const [createExamModalOpen, setCreateExamModalOpen] = useState(false);
	const [createExamForm] = Form.useForm();

	const generateExamFromTemplate = (template: ExamTemplate) => {
		const qsOfSubject = questions.filter((q) => q.subjectId === template.subjectId);

		const selectedIds: number[] = [];
		for (const rule of template.items) {
			const candidates = qsOfSubject.filter(
				(q) =>
					q.blockId === rule.blockId &&
					q.difficulty === rule.difficulty &&
					!selectedIds.includes(q.id),
			);

			if (candidates.length < rule.count) {
				const bName = blocks.find((b) => b.id === rule.blockId)?.name ?? 'N/A';
				throw new Error(
					`Không đủ câu hỏi phù hợp: Khối "${bName}", mức "${rule.difficulty}". Cần ${rule.count}, hiện có ${candidates.length}.`,
				);
			}

			const picked = pickRandom(candidates, rule.count);
			selectedIds.push(...picked.map((x) => x.id));
		}

		return selectedIds;
	};

	const openCreateExam = () => {
		createExamForm.resetFields();
		setCreateExamModalOpen(true);
	};

	const createExam = async () => {
		try {
			const v = await createExamForm.validateFields();
			const name = String(v.name).trim();
			const templateId = Number(v.templateId);

			const template = templates.find((t) => t.id === templateId);
			if (!template) {
				message.error('Không tìm thấy cấu trúc đề');
				return;
			}

			const questionIds = generateExamFromTemplate(template);

			const payload: Exam = {
				id: nextId(exams),
				name,
				subjectId: template.subjectId,
				templateId: template.id,
				questionIds,
				createdAt: new Date().toISOString(),
			};

			setExams([...exams, payload]);
			message.success('Tạo và lưu đề thi thành công');
			setCreateExamModalOpen(false);
		} catch (err: any) {
			if (err?.message) message.error(err.message);
		}
	};

	const deleteExam = (e: Exam) => {
		setExams(exams.filter((x) => x.id !== e.id));
		message.success('Đã xóa đề thi');
	};

	const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? 'N/A';
	const blockName = (id: number) => blocks.find((b) => b.id === id)?.name ?? 'N/A';

	const diffColor = (d: Difficulty) => {
		switch (d) {
			case 'Dễ':
				return 'green';
			case 'Trung bình':
				return 'blue';
			case 'Khó':
				return 'orange';
			case 'Rất khó':
				return 'red';
			default:
				return 'default';
		}
	};

	const blockColumns = [
		{ title: 'ID', dataIndex: 'id', width: 80 },
		{ title: 'Tên khối kiến thức', dataIndex: 'name' },
		{
			title: 'Thao tác',
			render: (_: any, r: Block) => (
				<>
					<Button type="link" onClick={() => openEditBlock(r)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa khối kiến thức?" onConfirm={() => deleteBlock(r)}>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const subjectColumns = [
		{ title: 'Mã môn', dataIndex: 'code' },
		{ title: 'Tên môn', dataIndex: 'name' },
		{ title: 'Tín chỉ', dataIndex: 'credits', width: 90 },
		{
			title: 'Thao tác',
			render: (_: any, r: Subject) => (
				<>
					<Button type="link" onClick={() => openEditSubject(r)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa môn học?" onConfirm={() => deleteSubject(r)}>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const questionColumns = [
		{ title: 'Mã', dataIndex: 'code', width: 120 },
		{ title: 'Môn', render: (_: any, r: Question) => subjectName(r.subjectId), width: 160 },
		{ title: 'Khối', render: (_: any, r: Question) => blockName(r.blockId), width: 160 },
		{
			title: 'Mức độ',
			dataIndex: 'difficulty',
			width: 120,
			render: (v: Difficulty) => <Tag color={diffColor(v)}>{v}</Tag>,
		},
		{ title: 'Nội dung', dataIndex: 'content' },
		{
			title: 'Thao tác',
			width: 140,
			render: (_: any, r: Question) => (
				<>
					<Button type="link" onClick={() => openEditQuestion(r)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa câu hỏi?" onConfirm={() => deleteQuestion(r)}>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const templateColumns = [
		{ title: 'Tên cấu trúc', dataIndex: 'name' },
		{ title: 'Môn', render: (_: any, r: ExamTemplate) => subjectName(r.subjectId), width: 180 },
		{
			title: 'Số dòng yêu cầu',
			render: (_: any, r: ExamTemplate) => r.items.length,
			width: 140,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			width: 160,
			render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: 'Thao tác',
			width: 160,
			render: (_: any, r: ExamTemplate) => (
				<>
					<Button type="link" onClick={() => openEditTemplate(r)}>
						Sửa
					</Button>
					<Popconfirm title="Xóa cấu trúc đề?" onConfirm={() => deleteTemplate(r)}>
						<Button type="link" danger>
							Xóa
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const examColumns = [
		{ title: 'Tên đề', dataIndex: 'name' },
		{ title: 'Môn', render: (_: any, r: Exam) => subjectName(r.subjectId), width: 180 },
		{
			title: 'Số câu',
			render: (_: any, r: Exam) => r.questionIds.length,
			width: 100,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			width: 160,
			render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: 'Thao tác',
			width: 120,
			render: (_: any, r: Exam) => (
				<Popconfirm title="Xóa đề thi?" onConfirm={() => deleteExam(r)}>
					<Button type="link" danger>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<div>
			<Row gutter={12} style={{ marginBottom: 12 }}>
				<Col span={6}>
					<Card>
						<Statistic title="Khối kiến thức" value={blocks.length} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Môn học" value={subjects.length} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Câu hỏi" value={questions.length} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Đề thi" value={exams.length} />
					</Card>
				</Col>
			</Row>

			<Tabs defaultActiveKey="blocks">
				<TabPane tab="Khối kiến thức" key="blocks">
					<Button type="primary" onClick={openCreateBlock} style={{ marginBottom: 12 }}>
						Thêm khối
					</Button>
					<Table rowKey="id" columns={blockColumns} dataSource={blocks} />
				</TabPane>

				<TabPane tab="Môn học" key="subjects">
					<Button type="primary" onClick={openCreateSubject} style={{ marginBottom: 12 }}>
						Thêm môn
					</Button>
					<Table rowKey="id" columns={subjectColumns} dataSource={subjects} />
				</TabPane>

				<TabPane tab="Ngân hàng câu hỏi" key="questions">
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
						<Input.Search
							allowClear
							placeholder="Tìm theo mã / nội dung"
							style={{ width: 260 }}
							value={qSearch}
							onChange={(e) => setQSearch(e.target.value)}
						/>
						<Select style={{ width: 200 }} value={qSubjectFilter} onChange={setQSubjectFilter}>
							<Option value="all">Tất cả môn</Option>
							{subjects.map((s) => (
								<Option key={s.id} value={s.id}>
									{s.code} - {s.name}
								</Option>
							))}
						</Select>
						<Select style={{ width: 200 }} value={qBlockFilter} onChange={setQBlockFilter}>
							<Option value="all">Tất cả khối</Option>
							{blocks.map((b) => (
								<Option key={b.id} value={b.id}>
									{b.name}
								</Option>
							))}
						</Select>
						<Select style={{ width: 160 }} value={qDiffFilter} onChange={setQDiffFilter}>
							<Option value="all">Tất cả mức</Option>
							{DIFFICULTIES.map((d) => (
								<Option key={d} value={d}>
									{d}
								</Option>
							))}
						</Select>
						<Button type="primary" onClick={openCreateQuestion} disabled={!subjects.length || !blocks.length}>
							Thêm câu hỏi
						</Button>
					</div>

					{!subjects.length || !blocks.length ? (
						<Tag color="orange">
							Cần tạo ít nhất 1 môn học và 1 khối kiến thức trước khi thêm câu hỏi
						</Tag>
					) : null}

					<Table rowKey="id" columns={questionColumns} dataSource={filteredQuestions} />
				</TabPane>

				<TabPane tab="Cấu trúc đề" key="templates">
					<Button
						type="primary"
						onClick={openCreateTemplate}
						style={{ marginBottom: 12 }}
						disabled={!subjects.length || !blocks.length}
					>
						Tạo cấu trúc
					</Button>
					<Table rowKey="id" columns={templateColumns} dataSource={templates} />
				</TabPane>

				<TabPane tab="Đề thi" key="exams">
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
						<Button type="primary" onClick={openCreateExam} disabled={!templates.length}>
							Tạo đề tự động
						</Button>
						{!templates.length ? <Tag color="orange">Cần có cấu trúc đề trước</Tag> : null}
					</div>
					<Table rowKey="id" columns={examColumns} dataSource={exams} />
				</TabPane>
			</Tabs>

			<Modal
				visible={blockModalOpen}
				title={editingBlock ? 'Sửa khối kiến thức' : 'Thêm khối kiến thức'}
				onCancel={() => setBlockModalOpen(false)}
				onOk={saveBlock}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={blockForm} layout="vertical">
					<Form.Item
						label="Tên khối"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên khối' }]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				visible={subjectModalOpen}
				title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
				onCancel={() => setSubjectModalOpen(false)}
				onOk={saveSubject}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={subjectForm} layout="vertical">
					<Form.Item
						label="Mã môn"
						name="code"
						rules={[{ required: true, message: 'Vui lòng nhập mã môn' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Tên môn"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên môn' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Số tín chỉ"
						name="credits"
						rules={[
							{ required: true, message: 'Vui lòng nhập số tín chỉ' },
							{ type: 'number', min: 1, message: 'Tín chỉ phải >= 1' },
						]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				visible={questionModalOpen}
				title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
				onCancel={() => setQuestionModalOpen(false)}
				onOk={saveQuestion}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
				width={900}
			>
				<Form form={questionForm} layout="vertical">
					<Row gutter={12}>
						<Col span={8}>
							<Form.Item
								label="Mã câu hỏi"
								name="code"
								rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi' }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Môn học"
								name="subjectId"
								rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
							>
								<Select placeholder="Chọn môn">
									{subjects.map((s) => (
										<Option key={s.id} value={s.id}>
											{s.code} - {s.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Khối kiến thức"
								name="blockId"
								rules={[{ required: true, message: 'Vui lòng chọn khối' }]}
							>
								<Select placeholder="Chọn khối">
									{blocks.map((b) => (
										<Option key={b.id} value={b.id}>
											{b.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={12}>
						<Col span={8}>
							<Form.Item
								label="Mức độ khó"
								name="difficulty"
								rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
							>
								<Select placeholder="Chọn mức">
									{DIFFICULTIES.map((d) => (
										<Option key={d} value={d}>
											{d}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						label="Nội dung câu hỏi"
						name="content"
						rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
					>
						<Input.TextArea rows={6} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				visible={templateModalOpen}
				title={editingTemplate ? 'Sửa cấu trúc đề' : 'Tạo cấu trúc đề'}
				onCancel={() => setTemplateModalOpen(false)}
				onOk={saveTemplate}
				okText="Lưu"
				cancelText="Hủy"
				destroyOnClose
				width={900}
			>
				<Form form={templateForm} layout="vertical">
					<Row gutter={12}>
						<Col span={12}>
							<Form.Item
								label="Tên cấu trúc"
								name="name"
								rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc' }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Môn học"
								name="subjectId"
								rules={[{ required: true, message: 'Vui lòng chọn môn' }]}
							>
								<Select placeholder="Chọn môn">
									{subjects.map((s) => (
										<Option key={s.id} value={s.id}>
											{s.code} - {s.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.List name="items">
						{(fields, { add, remove }) => (
							<>
								{fields.map((field) => (
									<Card key={field.key} size="small" style={{ marginBottom: 8 }}>
										<Row gutter={12}>
											<Col span={8}>
												<Form.Item
													{...field}
													label="Khối"
													name={[field.name, 'blockId']}
													fieldKey={[field.fieldKey, 'blockId']}
													rules={[{ required: true, message: 'Chọn khối' }]}
												>
													<Select placeholder="Chọn khối">
														{blocks.map((b) => (
															<Option key={b.id} value={b.id}>
																{b.name}
															</Option>
														))}
													</Select>
												</Form.Item>
											</Col>

											<Col span={8}>
												<Form.Item
													{...field}
													label="Mức độ"
													name={[field.name, 'difficulty']}
													fieldKey={[field.fieldKey, 'difficulty']}
													rules={[{ required: true, message: 'Chọn mức độ' }]}
												>
													<Select placeholder="Chọn mức">
														{DIFFICULTIES.map((d) => (
															<Option key={d} value={d}>
																{d}
															</Option>
														))}
													</Select>
												</Form.Item>
											</Col>

											<Col span={6}>
												<Form.Item
													{...field}
													label="Số câu"
													name={[field.name, 'count']}
													fieldKey={[field.fieldKey, 'count']}
													rules={[
														{ required: true, message: 'Nhập số câu' },
														{ type: 'number', min: 1, message: '>= 1' },
													]}
												>
													<InputNumber min={1} style={{ width: '100%' }} />
												</Form.Item>
											</Col>

											<Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
												<Button danger onClick={() => remove(field.name)}>
													Xóa
												</Button>
											</Col>
										</Row>
									</Card>
								))}

								<Button
									type="dashed"
									onClick={() => add({ count: 1 })}
									style={{ width: '100%' }}
								>
									+ Thêm dòng yêu cầu
								</Button>
							</>
						)}
					</Form.List>
				</Form>
			</Modal>

			<Modal
				visible={createExamModalOpen}
				title="Tạo đề thi tự động"
				onCancel={() => setCreateExamModalOpen(false)}
				onOk={createExam}
				okText="Tạo & Lưu"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={createExamForm} layout="vertical">
					<Form.Item
						label="Tên đề"
						name="name"
						rules={[{ required: true, message: 'Vui lòng nhập tên đề' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Chọn cấu trúc đề"
						name="templateId"
						rules={[{ required: true, message: 'Vui lòng chọn cấu trúc' }]}
					>
						<Select placeholder="Chọn cấu trúc">
							{templates.map((t) => (
								<Option key={t.id} value={t.id}>
									{t.name} — {subjectName(t.subjectId)}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default TH02Bai2;

