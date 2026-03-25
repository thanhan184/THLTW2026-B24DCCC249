import { PageContainer } from '@ant-design/pro-layout';
import { Button, Table, Modal, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { service } from '../components/services';

export default () => {
  const [data, setData] = useState(service.getVB());
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const reload = () => setData([...service.getVB()]);

  const onFinish = (values: any) => {
    service.addVB(values);
    setVisible(false);
    reload();
  };

  return (
    <PageContainer>
      <Button type="primary" onClick={() => setVisible(true)}>
        Thêm văn bằng
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Số vào sổ', dataIndex: 'soVaoSo' },
          { title: 'Số hiệu', dataIndex: 'soHieu' },
          { title: 'Họ tên', dataIndex: 'hoTen' },
        ]}
      />

      <Modal visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="soHieu" label="Số hiệu">
            <Input />
          </Form.Item>

          <Form.Item name="msv" label="MSV">
            <Input />
          </Form.Item>

          <Form.Item name="hoTen" label="Họ tên">
            <Input />
          </Form.Item>

          <Form.Item name="soVanBangId" label="Sổ">
            <Select>
              {service.getSo().map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.nam}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};