// src/pages/products/components/ProductForm.tsx
import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { Product } from '../data';

interface ProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (product: Omit<Product, 'id'>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      title="Thêm sản phẩm mới"
      okText="Thêm"
      cancelText="Hủy"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values as any);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="Giá"
          rules={[
            { required: true, message: 'Vui lòng nhập giá' },
            {
              type: 'number',
              min: 1,
              message: 'Giá phải là số dương',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            {
              type: 'number',
              min: 1,
              message: 'Số lượng phải là số nguyên dương',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
