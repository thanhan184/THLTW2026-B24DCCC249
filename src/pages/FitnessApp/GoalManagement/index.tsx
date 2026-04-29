import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Progress, Tag, Button, Drawer, 
  Form, Input, InputNumber, Select, DatePicker, Popconfirm, 
  Segmented, Space, message, Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { FitnessStorage, Goal } from '../../../services/FitnessApp/storage';
import './index.less';

const { Option } = Select;
const { Text } = Typography;

const GoalManagement: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [goals, filterStatus]);

  const loadData = () => {
    const data = FitnessStorage.getGoals();
    setGoals(data);
  };

  const handleFilter = () => {
    if (filterStatus === 'Tất cả') {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(goals.filter(g => g.status === filterStatus));
    }
  };

  const openAddDrawer = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'Đang thực hiện', currentValue: 0 });
    setIsDrawerVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = goals.filter(g => g.id !== id);
    FitnessStorage.saveGoals(newData);
    setGoals(newData);
    message.success('Xóa mục tiêu thành công!');
  };

  const handleUpdateProgress = (id: string, newCurrent: number) => {
    const newData = goals.map(g => {
      if (g.id === id) {
        const updated = { ...g, currentValue: newCurrent };
        // Auto mark as Đã đạt if current >= target
        if (updated.currentValue >= updated.targetValue && updated.status !== 'Đã đạt') {
          updated.status = 'Đã đạt';
          message.success(`Chúc mừng! Bạn đã hoàn thành mục tiêu: ${g.name}`);
        }
        return updated;
      }
      return g;
    });
    FitnessStorage.saveGoals(newData);
    setGoals(newData);
  };

  const handleUpdateStatus = (id: string, status: Goal['status']) => {
    const newData = goals.map(g => g.id === id ? { ...g, status } : g);
    FitnessStorage.saveGoals(newData);
    setGoals(newData);
    message.success('Cập nhật trạng thái thành công!');
  }

  const onDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const newGoal: Goal = {
        id: `g${Date.now()}`,
        name: values.name,
        type: values.type,
        targetValue: values.targetValue,
        currentValue: values.currentValue || 0,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: values.status,
      };

      const newData = [...goals, newGoal];
      FitnessStorage.saveGoals(newData);
      setGoals(newData);
      setIsDrawerVisible(false);
      message.success('Thêm mục tiêu mới thành công!');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang thực hiện': return 'processing';
      case 'Đã đạt': return 'success';
      case 'Đã hủy': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Giảm cân': return 'cyan';
      case 'Tăng cơ': return 'volcano';
      case 'Cải thiện sức bền': return 'purple';
      default: return 'magenta';
    }
  };

  return (
    <div className="goal-management">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="large">
            <h2 style={{ margin: 0 }}>Quản lý Mục tiêu</h2>
            <Segmented 
              options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']} 
              value={filterStatus}
              onChange={(val) => setFilterStatus(val.toString())}
            />
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddDrawer}>
            Thêm mục tiêu
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredGoals.map(goal => {
          let percent = Math.floor((goal.currentValue / goal.targetValue) * 100);
          if (percent > 100) percent = 100;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={goal.id}>
              <Card 
                className="goal-card"
                actions={[
                  <Popconfirm
                    title="Bạn có chắc là muốn xóa?"
                    onConfirm={() => handleDelete(goal.id)}
                    okText="Có" cancelText="Không"
                  >
                    <DeleteOutlined key="delete" className="text-danger" />
                  </Popconfirm>,
                  goal.status !== 'Đã đạt' && (
                    <Popconfirm
                      title="Đánh dấu là đã đạt?"
                      onConfirm={() => handleUpdateStatus(goal.id, 'Đã đạt')}
                      okText="Có" cancelText="Không"
                    >
                      <CheckCircleOutlined key="check" className="text-success" />
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <div className="goal-header">
                  <Text strong className="goal-title" ellipsis={{ tooltip: goal.name }}>
                    {goal.name}
                  </Text>
                  <Tag color={getStatusColor(goal.status)} style={{ margin: 0 }}>
                    {goal.status}
                  </Tag>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <Tag color={getTypeColor(goal.type)}>{goal.type}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ⏳ {moment(goal.deadline).format('DD/MM/YYYY')}
                  </Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Tiến độ</Text>
                    <Text strong>{percent}%</Text>
                  </div>
                  <Progress percent={percent} status={goal.status === 'Đã đạt' ? 'success' : 'active'} />
                </div>

                <div className="goal-update-row">
                  <Text type="secondary">Hiện tại:</Text>
                  <Space>
                    <InputNumber 
                      size="small"
                      value={goal.currentValue}
                      min={0}
                      // @ts-ignore
                      onChange={(val) => handleUpdateProgress(goal.id, val)}
                      style={{ width: 80 }}
                    />
                    <Text>/ {goal.targetValue}</Text>
                  </Space>
                </div>
              </Card>
            </Col>
          );
        })}
        {filteredGoals.length === 0 && (
          <Col span={24}>
            <div className="empty-goals">Chưa có mục tiêu nào</div>
          </Col>
        )}
      </Row>

      <Drawer
        title="Thêm mục tiêu mới"
        width={400}
        onClose={onDrawerClose}
        visible={isDrawerVisible}
        extra={
          <Space>
            <Button onClick={onDrawerClose}>Hủy</Button>
            <Button onClick={handleFormSubmit} type="primary">
              Lưu mục tiêu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label="Tên mục tiêu" 
            rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu!' }]}
          >
            <Input placeholder="Ví dụ: Giảm 5kg trong 2 tháng" />
          </Form.Item>

          <Form.Item 
            name="type" 
            label="Loại mục tiêu" 
            rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
          >
            <Select>
              <Option value="Giảm cân">Giảm cân</Option>
              <Option value="Tăng cơ">Tăng cơ</Option>
              <Option value="Cải thiện sức bền">Cải thiện sức bền</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="targetValue" 
                label="Mục tiêu (Số)" 
                rules={[{ required: true, message: 'Nhập số!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="currentValue" 
                label="Hiện tại (Số)"
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="deadline" 
            label="Deadline (Hạn chót)"
            rules={[{ required: true, message: 'Vui lòng chọn hạn chót!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          
          <Form.Item 
            name="status" 
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="Đang thực hiện">Đang thực hiện</Option>
              <Option value="Đã đạt">Đã đạt</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default GoalManagement;
