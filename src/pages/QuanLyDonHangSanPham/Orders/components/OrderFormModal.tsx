import React, { useEffect, useMemo } from 'react';
import { Card, Form, Input, InputNumber, Modal, Select } from 'antd';
import type { Order, Product } from '@/models/orderProduct';

const { Option } = Select;

interface OrderFormModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialValues?: Order | null;
  products: Product[];
  orders: Order[];
  onCancel: () => void;
  onSave: (values: any) => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  visible,
  mode,
  initialValues,
  products,
  orders,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const selectedProductIds: number[] = Form.useWatch('productIds', form) || [];

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedProductIds.includes(p.id)),
    [products, selectedProductIds]
  );

  useEffect(() => {
    if (visible && mode === 'edit' && initialValues) {
      const productIds = initialValues.products.map(p => p.productId);
      const quantities: Record<number, number> = {};
      initialValues.products.forEach(p => {
        quantities[p.productId] = p.quantity;
      });

      form.setFieldsValue({
        id: initialValues.id,
        customerName: initialValues.customerName,
        phone: initialValues.phone,
        address: initialValues.address,
        productIds,
        quantities,
        status: initialValues.status,
      });
    } else if (visible && mode === 'add') {
      form.resetFields();
    }
  }, [visible, mode, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? 'Tạo đơn hàng mới' : 'Chỉnh sửa đơn hàng'}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mã đơn hàng"
          name="id"
          rules={[
            { required: true, message: 'Vui lòng nhập mã đơn hàng' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (mode === 'add') {
                  const exists = orders.some(o => o.id === value);
                  if (exists) return Promise.reject(new Error('Mã đơn hàng đã tồn tại'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input disabled={mode === 'edit'} placeholder="Ví dụ: DH001" />
        </Form.Item>

        <Form.Item
          label="Tên khách hàng"
          name="customerName"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            {
              pattern: /^\d{10,11}$/,
              message: 'Số điện thoại phải gồm 10-11 chữ số',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          initialValue="Chờ xác nhận"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select disabled={mode === 'add'}>
            {['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map(st => (
              <Option key={st} value={st}>{st}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Sản phẩm"
          name="productIds"
          rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
        >
          <Select mode="multiple" placeholder="Chọn sản phẩm">
            {products.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name} ({p.quantity} tồn) - {p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedProducts.length > 0 && (
          <Card size="small" title="Số lượng từng sản phẩm (Tự động tính tổng tiền)">
            {selectedProducts.map((p) => {
              return (
                <Form.Item
                  key={p.id}
                  label={`${p.name} (tồn: ${p.quantity})`}
                  name={['quantities', p.id]}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng' },
                    {
                      validator: (_, value) => {
                        if (!value || value <= 0) {
                          return Promise.reject(new Error('Số lượng phải > 0'));
                        }
                        if (!Number.isInteger(value)) {
                          return Promise.reject(new Error('Số lượng phải là số nguyên'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={1} />
                </Form.Item>
              );
            })}
          </Card>
        )}
      </Form>
    </Modal>
  );
};

export default OrderFormModal;
