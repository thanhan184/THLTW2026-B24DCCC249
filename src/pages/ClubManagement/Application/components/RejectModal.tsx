import React from 'react';
import { Modal, Form, Input } from 'antd';

interface RejectModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ visible, onCancel, onConfirm }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onConfirm(values.reason);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Xác nhận Từ chối Đơn đăng ký"
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      okText="Xác nhận Từ chối"
      okButtonProps={{ danger: true }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Lý do từ chối"
          rules={[{ required: true, message: 'Bắt buộc phải nhập lý do từ chối!' }]}
        >
          <Input.TextArea showCount maxLength={500} rows={4} placeholder="Nhập lý do tại đây..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RejectModal;
