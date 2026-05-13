import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { Task } from '@/services/taskService';
import moment from 'moment';

interface TaskFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<Task, 'id' | 'createdAt'>, id?: string) => void;
  initialValues?: Task | null;
}

const { Option } = Select;
const { TextArea } = Input;

const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        deadline: moment(initialValues.deadline),
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(
        {
          ...values,
          deadline: values.deadline.toISOString(),
        },
        initialValues?.id
      );
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return (
    <Modal
      visible={visible}
      title={initialValues ? 'Chỉnh sửa Task' : 'Thêm Task mới'}
      okText={initialValues ? 'Lưu' : 'Thêm'}
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="task_form">
        <Form.Item
          name="name"
          label="Tên Task"
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
        >
          <Input placeholder="Ví dụ: Hoàn thành báo cáo" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={3} placeholder="Mô tả công việc" />
        </Form.Item>
        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[{ required: true, message: 'Vui lòng chọn deadline!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
        </Form.Item>
        <Form.Item
          name="priority"
          label="Mức độ ưu tiên"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
        >
          <Select placeholder="Chọn mức độ">
            <Option value="High">Cao</Option>
            <Option value="Medium">Trung bình</Option>
            <Option value="Low">Thấp</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          initialValue="To Do"
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="To Do">Cần làm</Option>
            <Option value="Doing">Đang làm</Option>
            <Option value="Done">Hoàn thành</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="tag"
          label="Tag"
        >
          <Input placeholder="Ví dụ: urgent, bug, feature" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
