import React from 'react';
import { Badge, Button, Modal, Table } from 'antd';
import type { Order, OrderItem } from '@/models/orderProduct';

interface OrderDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ visible, order, onClose }) => {
  return (
    <Modal
      visible={visible}
      title={`Chi tiết đơn hàng ${order?.id ?? ''}`}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Đóng</Button>}
      width={700}
    >
      {order && (
        <>
          <p><strong>Khách hàng:</strong> {order.customerName}</p>
          <p><strong>SĐT:</strong> {order.phone}</p>
          <p><strong>Địa chỉ:</strong> {order.address}</p>
          <p><strong>Ngày tạo:</strong> {order.createdAt}</p>
          <p>
            <strong>Trạng thái:</strong>{' '}
            <Badge
              status={
                order.status === 'Hoàn thành'
                  ? 'success'
                  : order.status === 'Đã hủy'
                  ? 'error'
                  : 'processing'
              }
              text={order.status}
            />
          </p>

          <Table
            style={{ marginTop: 16 }}
            rowKey="productId"
            pagination={false}
            columns={[
              { title: 'Sản phẩm', dataIndex: 'productName' },
              { title: 'Số lượng', dataIndex: 'quantity' },
              {
                title: 'Đơn giá',
                dataIndex: 'price',
                render: (value: number) =>
                  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
              },
              {
                title: 'Thành tiền',
                render: (_: any, record: OrderItem) =>
                  (record.price * record.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
              },
            ]}
            dataSource={order.products}
          />

          <p style={{ marginTop: 16, textAlign: 'right' }}>
            <strong>Tổng tiền: </strong>
            {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
        </>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
