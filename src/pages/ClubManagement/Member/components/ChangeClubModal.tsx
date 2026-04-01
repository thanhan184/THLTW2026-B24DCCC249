import React from 'react';
import { Modal, Form, Select } from 'antd';

interface ChangeClubModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (clubId: string) => void;
  clubs: any[];
  memberCount: number;
}

const ChangeClubModal: React.FC<ChangeClubModalProps> = ({ visible, onCancel, onConfirm, clubs, memberCount }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onConfirm(values.clubId);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Chuyển Câu lạc bộ"
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      okText="Xác nhận"
      cancelText="Hủy"
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        Bạn đang chọn chuyển CLB cho <strong>{memberCount}</strong> thành viên.
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="clubId"
          label="Chọn CLB chuyển đến"
          rules={[{ required: true, message: 'Vui lòng chọn CLB!' }]}
        >
          <Select placeholder="Chọn câu lạc bộ...">
            {clubs.map(c => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeClubModal;
