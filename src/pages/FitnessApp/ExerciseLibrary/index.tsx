import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Tag, Button, Input, Select, 
  Modal, Form, InputNumber, Popconfirm, Space, Typography, message 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, EyeOutlined, 
  EditOutlined, DeleteOutlined, FireOutlined 
} from '@ant-design/icons';
import { FitnessStorage, Exercise } from '../../../services/FitnessApp/storage';
import './index.less';

const { Option } = Select;
const { Text, Paragraph } = Typography;

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  
  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  
  const [form] = Form.useForm();

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [exercises, searchText, filterMuscle, filterDifficulty]);

  const loadData = () => {
    const data = FitnessStorage.getExercises();
    setExercises(data);
  };

  const handleFilter = () => {
    let result = [...exercises];

    if (searchText) {
      result = result.filter(e => e.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (filterMuscle !== 'All') {
      result = result.filter(e => e.muscleGroup === filterMuscle);
    }

    if (filterDifficulty !== 'All') {
      result = result.filter(e => e.difficulty === filterDifficulty);
    }

    setFilteredExercises(result);
  };

  const handleDelete = (id: string) => {
    const newData = exercises.filter(e => e.id !== id);
    FitnessStorage.saveExercises(newData);
    setExercises(newData);
    message.success('Xóa bài tập thành công!');
  };

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const openEditModal = (record: Exercise) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsFormModalVisible(true);
  };

  const showDetailModal = (record: Exercise) => {
    setViewingExercise(record);
    setIsDetailModalVisible(true);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const newExercise: Exercise = {
        id: editingId || `e${Date.now()}`,
        name: values.name,
        muscleGroup: values.muscleGroup,
        difficulty: values.difficulty,
        description: values.description,
        caloriesPerHr: values.caloriesPerHr,
      };

      let newData = [...exercises];
      if (editingId) {
        newData = newData.map(e => e.id === editingId ? newExercise : e);
        message.success('Cập nhật bài tập thành công!');
      } else {
        newData.push(newExercise);
        message.success('Thêm bài tập mới thành công!');
      }

      FitnessStorage.saveExercises(newData);
      setExercises(newData);
      setIsFormModalVisible(false);
    });
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Dễ') return 'green';
    if (diff === 'Trung bình') return 'gold';
    if (diff === 'Khó') return 'red';
    return 'default';
  };

  return (
    <div className="exercise-library">
      <Card bordered={false} className="main-card">
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <h2 style={{ margin: 0 }}>Thư viện bài tập</h2>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              Thêm bài tập
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm tên bài tập..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select 
              style={{ width: '100%' }} 
              value={filterMuscle} 
              onChange={setFilterMuscle}
            >
              <Option value="All">Tất cả nhóm cơ</Option>
              <Option value="Chest">Ngực (Chest)</Option>
              <Option value="Back">Lưng (Back)</Option>
              <Option value="Legs">Chân (Legs)</Option>
              <Option value="Shoulders">Vai (Shoulders)</Option>
              <Option value="Arms">Tay (Arms)</Option>
              <Option value="Core">Bụng (Core)</Option>
              <Option value="Full Body">Toàn thân (Full Body)</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select 
              style={{ width: '100%' }} 
              value={filterDifficulty} 
              onChange={setFilterDifficulty}
            >
              <Option value="All">Mọi mức độ</Option>
              <Option value="Dễ">Dễ</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khó">Khó</Option>
            </Select>
          </Col>
        </Row>

        {/* 3 Columns Grid */}
        <Row gutter={[24, 24]}>
          {filteredExercises.map(ex => (
            <Col xs={24} sm={12} lg={8} key={ex.id}>
              <Card 
                className="exercise-card"
                actions={[
                  <EyeOutlined key="view" onClick={() => showDetailModal(ex)} />,
                  <EditOutlined key="edit" onClick={() => openEditModal(ex)} className="text-primary" />,
                  <Popconfirm
                    title="Xóa bài tập này?"
                    onConfirm={() => handleDelete(ex.id)}
                    okText="Có" cancelText="Không"
                  >
                    <DeleteOutlined key="delete" className="text-danger" />
                  </Popconfirm>
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong className="exercise-title" ellipsis={{ tooltip: ex.name }}>
                    {ex.name}
                  </Text>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <Tag color="geekblue">{ex.muscleGroup}</Tag>
                    <Tag color={getDifficultyColor(ex.difficulty)}>{ex.difficulty}</Tag>
                  </Space>
                </div>

                <div className="exercise-desc">
                  <Paragraph ellipsis={{ rows: 2 }}>{ex.description}</Paragraph>
                </div>
                
                <div className="exercise-calories">
                  <FireOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <Text type="secondary">{ex.caloriesPerHr} kcal/giờ</Text>
                </div>
              </Card>
            </Col>
          ))}
          
          {filteredExercises.length === 0 && (
            <Col span={24}>
               <div className="empty-message">Không tìm thấy bài tập phù hợp</div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={viewingExercise?.name}
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>
        ]}
      >
        {viewingExercise && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color="geekblue">{viewingExercise.muscleGroup}</Tag>
              <Tag color={getDifficultyColor(viewingExercise.difficulty)}>{viewingExercise.difficulty}</Tag>
            </Space>
            <div style={{ marginBottom: 16 }}>
              <Text strong><FireOutlined style={{ color: '#fa8c16' }} /> Tiêu hao:</Text>{' '}
              <Text>{viewingExercise.caloriesPerHr} kcal mỗi giờ tập</Text>
            </div>
            <div>
              <Text strong>Hướng dẫn thực hiện:</Text>
              <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                {viewingExercise.description || "Chưa có hướng dẫn cho bài tập này."}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Form Modal */}
      <Modal
        title={editingId ? 'Sửa bài tập' : 'Thêm bài tập'}
        visible={isFormModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsFormModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label="Tên bài tập" 
            rules={[{ required: true, message: 'Vui lòng nhập tên bài tập!' }]}
          >
            <Input placeholder="Ví dụ: Push up" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="muscleGroup" 
                label="Nhóm cơ" 
                rules={[{ required: true, message: 'Vui lòng chọn nhóm cơ!' }]}
              >
                <Select>
                  {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => (
                    <Option key={m} value={m}>{m}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="difficulty" 
                label="Mức độ khó"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Select>
                  <Option value="Dễ">Dễ</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Khó">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="caloriesPerHr" 
            label="Calo đốt (trụng bình / 1 giờ)" 
            rules={[{ required: true, message: 'Vui lòng nhập số lượng calo!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="Mô tả / Hướng dẫn"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập!' }]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Nằm xấp, hai tay rộng bằng vai..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
