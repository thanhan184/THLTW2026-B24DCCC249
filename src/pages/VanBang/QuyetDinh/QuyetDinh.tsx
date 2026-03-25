import { PageContainer } from '@ant-design/pro-layout';
import { Button, Table, Modal, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { service } from '../components/services';

export default () => {
  const [data, setData] = useState(service.getQD());
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const soList = service.getSo();

  const reload = () => setData([...service.getQD()]);

  const onFinish = (values: any) => {
    service.addQD(values);
    setVisible(false);
    reload();
  };

  return (
    <PageContainer>
      <Button type="primary" onClick={() => setVisible(true)}>
        Thêm quyết định
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Số QĐ', dataIndex: 'soQD' },
          { title: 'Trích yếu', dataIndex: 'trichYeu' },
          { title: 'Lượt tra cứu', dataIndex: 'luotTraCuu' },
        ]}
      />

      <Modal visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="soQD" label="Số QĐ" required>
            <Input />
          </Form.Item>

          <Form.Item name="trichYeu" label="Trích yếu">
            <Input />
          </Form.Item>

          <Form.Item name="soVanBangId" label="Sổ">
            <Select>
              {soList.map(s => (
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