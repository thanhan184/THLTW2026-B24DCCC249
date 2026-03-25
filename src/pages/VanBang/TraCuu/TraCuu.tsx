import { PageContainer } from '@ant-design/pro-layout';
import { Form, Input, Button, Table, message } from 'antd';
import { useState } from 'react';
import { service } from '../components/services';

export default () => {
  const [data, setData] = useState<any[]>([]);

  const onFinish = (values: any) => {
    const count = Object.values(values).filter(v => v).length;

    if (count < 2) {
      message.error('Nhập ít nhất 2 điều kiện');
      return;
    }

    setData(service.traCuu(values));
  };

  return (
    <PageContainer>
      <Form layout="inline" onFinish={onFinish}>
        <Form.Item name="msv">
          <Input placeholder="MSV" />
        </Form.Item>

        <Form.Item name="hoTen">
          <Input placeholder="Họ tên" />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Tra cứu
        </Button>
      </Form>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Số vào sổ', dataIndex: 'soVaoSo' },
          { title: 'Số hiệu', dataIndex: 'soHieu' },
          { title: 'Họ tên', dataIndex: 'hoTen' },
        ]}
      />
    </PageContainer>
  );
};