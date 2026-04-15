import React, { useCallback, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select, Table, Tag, message, Space } from 'antd';
import { useModel } from 'umi';
import type { Moment } from 'moment';
import moment from 'moment';
import type { Order, OrderStatus, Product, OrderItem } from '@/models/orderProduct';
import OrderDetailModal from './components/OrderDetailModal';
import OrderFormModal from './components/OrderFormModal';

const { RangePicker } = DatePicker;
const { Option } = Select;
const orderStatuses: OrderStatus[] = ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const Orders: React.FC = () => {
  const { products, setProducts, orders, setOrders } = useModel('orderProduct');

  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | undefined>();
  const [orderDateRange, setOrderDateRange] = useState<[Moment, Moment] | null>(null);

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (orderSearch.trim()) {
      const keyword = orderSearch.trim().toLowerCase();
      result = result.filter(
        (o) => o.customerName.toLowerCase().includes(keyword) || o.id.toLowerCase().includes(keyword)
      );
    }

    if (orderStatusFilter) {
      result = result.filter((o) => o.status === orderStatusFilter);
    }

    if (orderDateRange) {
      const [start, end] = orderDateRange;
      result = result.filter((o) => {
        const date = moment(o.createdAt, 'YYYY-MM-DD');
        return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day');
      });
    }

    return result;
  }, [orders, orderSearch, orderStatusFilter, orderDateRange]);

  const updateInventory = (orderToUpdate: Order, newStatus: OrderStatus, oldStatus?: OrderStatus): Product[] => {
    const wasCompleted = oldStatus === 'Hoàn thành';
    const willBeCompleted = newStatus === 'Hoàn thành';

    if (wasCompleted === willBeCompleted) return products;

    const updated = products.map((p) => ({ ...p }));
    for (const item of orderToUpdate.products) {
      const product = updated.find((p) => p.id === item.productId);
      if (!product) continue;

      if (!wasCompleted && willBeCompleted) {
        if (product.quantity < item.quantity) {
          throw new Error(`Không đủ kho để hoàn thành đơn hàng ${orderToUpdate.id} - "${product.name}"`);
        }
        product.quantity -= item.quantity;
      } else if (wasCompleted && !willBeCompleted) {
        product.quantity += item.quantity;
      }
    }
    return updated;
  };

  const handleChangeOrderStatus = (order: Order, newStatus: OrderStatus) => {
    try {
      const updatedProducts = updateInventory(order, newStatus, order.status);
      const updatedOrders = orders.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o));
      setProducts(updatedProducts);
      setOrders(updatedOrders);
      message.success('Cập nhật trạng thái thành công');
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: `Bạn có chắc chắn muốn hủy đơn hàng ${order.id} không? Thao tác này không thể hoàn tác.`,
      okText: 'Đồng ý hủy',
      cancelText: 'Đóng',
      okType: 'danger',
      onOk: () => {
        handleChangeOrderStatus(order, 'Đã hủy');
      }
    });
  };

  const handleSaveOrder = (values: any) => {
    try {
      const { id, customerName, phone, address, productIds, quantities, status } = values;

      const items: OrderItem[] = [];
      let totalAmount = 0;

      for (const productId of productIds) {
        const product = products.find((p) => p.id === productId);
        if (!product) continue;
        const quantity = Number(quantities?.[productId] ?? 0);

        if (!quantity || quantity <= 0) throw new Error(`Số lượng sản phẩm "${product.name}" phải > 0`);

        let stockAvailable = product.quantity;
        if (formMode === 'edit' && selectedOrder) {
          const oldItem = selectedOrder.products.find(p => p.productId === productId);
          if (oldItem && selectedOrder.status !== 'Hoàn thành') {
            stockAvailable += 0;
          }
        }

        if (quantity > stockAvailable && status === 'Hoàn thành') {
            throw new Error(`Số lượng đặt của "${product.name}" (${quantity}) lớn hơn tồn kho khả dụng (${stockAvailable})`);
        }

        items.push({ productId, productName: product.name, quantity, price: product.price });
        totalAmount += product.price * quantity;
      }

      if (items.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm.');
      }

      const newOrderInfo: Order = {
        id,
        customerName,
        phone,
        address,
        products: items,
        totalAmount,
        status: status || 'Chờ xác nhận',
        createdAt: formMode === 'add' ? moment().format('YYYY-MM-DD') : (selectedOrder?.createdAt || moment().format('YYYY-MM-DD')),
      };

      const newOrders = [...orders];

      if (formMode === 'add') {
        newOrders.push(newOrderInfo);
      } else {
        const orderIndex = newOrders.findIndex(o => o.id === id);
        if (orderIndex >= 0) {
          const oldOrder = newOrders[orderIndex];
          let updatedProducts = products;
          if (oldOrder.status === 'Hoàn thành') {
             updatedProducts = updateInventory(oldOrder, 'Đã hủy', 'Hoàn thành'); 
          }
          newOrders[orderIndex] = newOrderInfo;
          if (newOrderInfo.status === 'Hoàn thành') {
             updatedProducts = updateInventory(newOrderInfo, 'Hoàn thành', 'Chờ xác nhận');
          }
          setProducts(updatedProducts);
        }
      }

      setOrders(newOrders);
      message.success(formMode === 'add' ? 'Thêm đơn hàng thành công' : 'Cập nhật đơn hàng thành công');
      setFormModalVisible(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const columns = [
    { title: 'Mã ĐH', dataIndex: 'id', sorter: (a: Order, b: Order) => a.id.localeCompare(b.id) },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      render: (val: number) => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      sorter: (a: Order, b: Order) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (val: OrderStatus, record: Order) => {
        let color = 'default';
        if (val === 'Hoàn thành') color = 'success';
        else if (val === 'Đang giao') color = 'processing';
        else if (val === 'Chờ xác nhận') color = 'warning';
        else if (val === 'Đã hủy') color = 'error';

        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      render: (_: any, record: Order) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setSelectedOrder(record); setDetailVisible(true); }}>
            Xem
          </Button>
          <Button type="link" size="small" onClick={() => { setFormMode('edit'); setSelectedOrder(record); setFormModalVisible(true); }}>
            Sửa
          </Button>
          {record.status === 'Chờ xác nhận' && (
            <Button type="link" danger size="small" onClick={() => handleCancelOrder(record)}>
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Input.Search
          allowClear
          placeholder="Tìm theo mã ĐH / khách hàng"
          style={{ width: 250 }}
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          style={{ width: 150 }}
          value={orderStatusFilter}
          onChange={setOrderStatusFilter}
        >
          {orderStatuses.map((st) => <Option key={st} value={st}>{st}</Option>)}
        </Select>
        <RangePicker value={orderDateRange as any} onChange={(val) => setOrderDateRange(val as any)} />
        <Button
          type="primary"
          onClick={() => {
            setFormMode('add');
            setSelectedOrder(null);
            setFormModalVisible(true);
          }}
        >
          Tạo đơn hàng
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={filteredOrders} />

      <OrderFormModal
        visible={formModalVisible}
        mode={formMode}
        initialValues={selectedOrder}
        products={products}
        orders={orders}
        onCancel={() => setFormModalVisible(false)}
        onSave={handleSaveOrder}
      />

      <OrderDetailModal
        visible={detailVisible}
        order={selectedOrder}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
};

export default Orders;
