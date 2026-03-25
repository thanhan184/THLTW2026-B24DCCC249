import { PageContainer } from '@ant-design/pro-layout';
import { Button, Table, Modal, Form, InputNumber } from 'antd';
import { useState } from 'react';
import { service } from '../components/services';

export default () => {
  const [data, setData] = useState(service.getSo());
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const reload = () => setData([...service.getSo()]);

  const onFinish = (values: any) => {
    service.addSo(values);
    setVisible(false);
    reload();
  };

  return (
    <PageContainer>
      <Button type="primary" onClick={() => setVisible(true)}>
        Thêm sổ
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Năm', dataIndex: 'nam' },
          { title: 'Số hiện tại', dataIndex: 'currentNumber' },
        ]}
      />

      <Modal visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="nam" label="Năm" required>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};