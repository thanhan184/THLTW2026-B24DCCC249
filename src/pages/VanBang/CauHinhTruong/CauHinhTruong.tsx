import { PageContainer } from '@ant-design/pro-layout';
import { Button, Table, Modal, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { service } from '../components/services';

export default () => {
  const [data, setData] = useState(service.getTruong());
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const reload = () => setData([...service.getTruong()]);

  const onFinish = (values: any) => {
    service.addTruong(values);
    setVisible(false);
    reload();
  };

  return (
    <PageContainer>
      <Button type="primary" onClick={() => setVisible(true)}>
        Thêm trường
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Tên', dataIndex: 'ten' },
          { title: 'Kiểu', dataIndex: 'kieu' },
        ]}
      />

      <Modal visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="ten" label="Tên trường" required>
            <Input />
          </Form.Item>

          <Form.Item name="kieu" label="Kiểu">
            <Select>
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="date">Date</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};