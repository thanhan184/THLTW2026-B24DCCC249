import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, DatePicker } from 'antd';
import moment from 'moment';

interface FormClubProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues: any;
}

const FormClub: React.FC<FormClubProps> = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          foundedDate: initialValues.foundedDate ? moment(initialValues.foundedDate) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values: any) => {
    const submitValues = {
      ...values,
      foundedDate: values.foundedDate ? values.foundedDate.format('YYYY-MM-DD') : null,
      // For dummy mockup, we just take the first avatar URL if uploaded, or a dummy URL
      avatar: values.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    };
    onFinish(submitValues);
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa Câu lạc bộ' : 'Thêm mới Câu lạc bộ'}
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={800}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ active: true }}
      >
        <Form.Item
          name="name"
          label="Tên câu lạc bộ"
          rules={[{ required: true, message: 'Vui lòng nhập tên CLB!' }]}
        >
          <Input placeholder="Nhập tên CLB..." />
        </Form.Item>

        <Form.Item
          name="president"
          label="Chủ nhiệm CLB"
          rules={[{ required: true, message: 'Vui lòng nhập tên Chủ nhiệm!' }]}
        >
          <Input placeholder="Nhập tên Chủ nhiệm..." />
        </Form.Item>

        <Form.Item
          name="foundedDate"
          label="Ngày thành lập"
          rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập!' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự!' }]}
        >
          <Input.TextArea showCount maxLength={1000} rows={5} placeholder="Nhập mô tả câu lạc bộ..." />
        </Form.Item>

        <Form.Item
          name="avatar"
          label="Ảnh đại diện (URL)"
        >
          <Input placeholder="Nhập URL ảnh đại diện..." />
        </Form.Item>

        <Form.Item
          name="active"
          label="Hoạt động"
          valuePropName="checked"
        >
          <Switch checkedChildren="Có" unCheckedChildren="Không" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormClub;
