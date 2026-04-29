import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Tag, Button, Modal, Form, InputNumber, 
  DatePicker, Popconfirm, Space, Row, Col, message 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { FitnessStorage, HealthMetric } from '../../../services/FitnessApp/storage';
import './index.less';

const HealthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = FitnessStorage.getMetrics();
    // Sort descending by date
    data.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    setMetrics(data);
  };

  const getBmiTagColor = (bmi: number) => {
    if (bmi < 18.5) return 'blue';
    if (bmi >= 18.5 && bmi < 25) return 'green';
    if (bmi >= 25 && bmi < 30) return 'gold';
    return 'red';
  };

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi >= 18.5 && bmi < 25) return 'Bình thường';
    if (bmi >= 25 && bmi < 30) return 'Thừa cân';
    return 'Béo phì';
  };

  const openAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ date: moment() });
    setIsModalVisible(true);
  };

  const openEditModal = (record: HealthMetric) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = metrics.filter(m => m.id !== id);
    FitnessStorage.saveMetrics(newData);
    setMetrics(newData);
    message.success('Xóa chỉ số thành công!');
  };

  // Auto-calculate BMI when Weight or Height changes
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.weight || changedValues.height) {
      const weight = allValues.weight;
      const height = allValues.height;
      if (weight && height) {
        const heightInMeters = height / 100;
        const bmi = +(weight / (heightInMeters * heightInMeters)).toFixed(2);
        form.setFieldsValue({ bmi });
      }
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const newMetric: HealthMetric = {
        id: editingId || `h${Date.now()}`,
        date: values.date.format('YYYY-MM-DD'),
        weight: values.weight,
        height: values.height,
        bmi: values.bmi,
        restingHeartRate: values.restingHeartRate,
        sleepHours: values.sleepHours,
      };

      let newData = [...metrics];
      if (editingId) {
        newData = newData.map(m => m.id === editingId ? newMetric : m);
        message.success('Cập nhật chỉ số thành công!');
      } else {
        newData.push(newMetric);
        message.success('Thêm chỉ số thành công!');
      }

      // Re-sort
      newData.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
      FitnessStorage.saveMetrics(newData);
      setMetrics(newData);
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
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      key: 'bmi',
      render: (bmi: number) => (
        <Tag color={getBmiTagColor(bmi)}>
          {bmi} - {getBmiLabel(bmi)}
        </Tag>
      ),
    },
    {
      title: 'Nhịp tim nghỉ (bpm)',
      dataIndex: 'restingHeartRate',
      key: 'restingHeartRate',
    },
    {
      title: 'Giờ ngủ',
      dataIndex: 'sleepHours',
      key: 'sleepHours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: HealthMetric) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)} 
            className="text-primary"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đánh giá này?"
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
    <div className="health-metrics">
      <Card bordered={false} className="main-card">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>Nhật ký chỉ số sức khỏe</h2>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              Thêm chỉ số
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={metrics} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Sửa chỉ số' : 'Thêm chỉ số'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="date" 
                label="Ngày đo" 
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="weight" 
                label="Cân nặng (kg)" 
                rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
              >
                <InputNumber min={20} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="height" 
                label="Chiều cao (cm)"
                rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
              >
                <InputNumber min={50} max={250} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="bmi" 
                label="BMI (Tự động tính)"
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="restingHeartRate" 
                label="Nhịp tim nghỉ (bpm)" 
                rules={[{ required: true, message: 'Vui lòng nhập nhịp tim!' }]}
              >
                <InputNumber min={30} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="sleepHours" 
                label="Số giờ ngủ"
                rules={[{ required: true, message: 'Vui lòng nhập số giờ ngủ!' }]}
              >
                <InputNumber min={0} max={24} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthMetrics;
