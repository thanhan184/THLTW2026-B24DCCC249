import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Tag, Button, Modal, Form, Input, Select, 
  DatePicker, InputNumber, Popconfirm, Space, Row, Col, message 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { FitnessStorage, Workout } from '../../../services/FitnessApp/storage';
import './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const WorkoutDiary: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [workouts, searchText, filterType, dateRange]);

  const loadData = () => {
    const data = FitnessStorage.getWorkouts();
    setWorkouts(data);
  };

  const handleFilter = () => {
    let result = [...workouts];

    // Search by notes (since there's no explicitly named "tên bài tập" in workout except notes/type, wait, let's search via notes)
    if (searchText) {
      result = result.filter(w => w.notes?.toLowerCase().includes(searchText.toLowerCase()));
    }

    // Filter by type
    if (filterType !== 'All') {
      result = result.filter(w => w.type === filterType);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter(w => 
        moment(w.date).isSameOrAfter(dateRange[0], 'day') && 
        moment(w.date).isSameOrBefore(dateRange[1], 'day')
      );
    }

    // Sort by date descending
    result.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    setFilteredWorkouts(result);
  };

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ date: moment(), status: 'Hoàn thành' });
    setIsModalVisible(true);
  };

  const openEditModal = (record: Workout) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = workouts.filter(w => w.id !== id);
    FitnessStorage.saveWorkouts(newData);
    setWorkouts(newData);
    message.success('Xóa buổi tập thành công!');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const newWorkout: Workout = {
        id: editingId || `w${Date.now()}`,
        date: values.date.format('YYYY-MM-DD'),
        type: values.type,
        duration: values.duration,
        calories: values.calories,
        notes: values.notes || '',
        status: values.status,
      };

      let newData = [...workouts];
      if (editingId) {
        newData = newData.map(w => w.id === editingId ? newWorkout : w);
        message.success('Cập nhật buổi tập thành công!');
      } else {
        newData.push(newWorkout);
        message.success('Thêm buổi tập thành công!');
      }

      FitnessStorage.saveWorkouts(newData);
      setWorkouts(newData);
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại bài tập',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'Cardio') color = 'cyan';
        if (type === 'Strength') color = 'volcano';
        if (type === 'Yoga') color = 'green';
        if (type === 'HIIT') color = 'red';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Calo đốt',
      dataIndex: 'calories',
      key: 'calories',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hoàn thành' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Workout) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)} 
            className="text-primary"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa buổi tập này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="workout-diary">
      <Card bordered={false} className="main-card">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>Nhật ký tập luyện</h2>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              Thêm buổi tập
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo ghi chú..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select 
              style={{ width: '100%' }} 
              value={filterType} 
              onChange={setFilterType}
            >
              <Option value="All">Tất cả bài tập</Option>
              <Option value="Cardio">Cardio</Option>
              <Option value="Strength">Strength</Option>
              <Option value="Yoga">Yoga</Option>
              <Option value="HIIT">HIIT</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker 
              style={{ width: '100%' }}
              // @ts-ignore
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredWorkouts} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Sửa buổi tập' : 'Thêm buổi tập'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="date" 
                label="Ngày tập" 
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="type" 
                label="Loại bài tập" 
                rules={[{ required: true, message: 'Vui lòng chọn loại bài tập!' }]}
              >
                <Select>
                  <Option value="Cardio">Cardio</Option>
                  <Option value="Strength">Strength</Option>
                  <Option value="Yoga">Yoga</Option>
                  <Option value="HIIT">HIIT</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="duration" 
                label="Thời lượng (phút)" 
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="calories" 
                label="Calo đốt"
                rules={[{ required: true, message: 'Vui lòng nhập lượng calo!' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ví dụ: Chạy bộ công viên..." />
          </Form.Item>

          <Form.Item 
            name="status" 
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Bỏ lỡ">Bỏ lỡ</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkoutDiary;
