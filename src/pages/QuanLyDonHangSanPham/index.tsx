import React, { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Slider,
  Statistic,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import { useModel } from 'umi';
import moment, { Moment } from 'moment';
import type {
  Product,
  Order,
  OrderItem,
  OrderStatus,
} from '@/models/orderProduct';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const getProductStatus = (quantity: number): 'Còn hàng' | 'Sắp hết' | 'Hết hàng' => {
  if (quantity === 0) return 'Hết hàng';
  if (quantity <= 10) return 'Sắp hết';
  return 'Còn hàng';
};

const getProductStatusColor = (status: string) => {
  switch (status) {
    case 'Còn hàng':
      return 'green';
    case 'Sắp hết':
      return 'orange';
    case 'Hết hàng':
      return 'red';
    default:
      return 'default';
  }
};

const orderStatuses: OrderStatus[] = ['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const QuanLyDonHangSanPham: React.FC = () => {
  const { products, setProducts, orders, setOrders } = useModel('orderProduct');

  /** -------------------- STATE CHUNG -------------------- */
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  /** -------------------- STATE SẢN PHẨM -------------------- */
  const [productSearch, setProductSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>();
  const [productPage, setProductPage] = useState<number>(1);

  // Sắp xếp mặc định dùng sorter của Table (AntD lo giúp)

  // Lấy danh mục distinct
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  // Giá min/max để set slider
  const [minPrice, maxPrice] = useMemo(() => {
    if (!products.length) return [0, 0];
    const prices = products.map((p) => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (productSearch.trim()) {
      const keyword = productSearch.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(keyword));
    }

    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter((p) => getProductStatus(p.quantity) === statusFilter);
    }

    if (priceRange) {
      const [min, max] = priceRange;
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    return result;
  }, [products, productSearch, categoryFilter, statusFilter, priceRange]);

  /** -------------------- STATE ĐƠN HÀNG -------------------- */
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | undefined>();
  const [orderDateRange, setOrderDateRange] = useState<[Moment, Moment] | null>(null);

  const [orderModalVisible, setOrderModalVisible] = useState<boolean>(false);
  const [orderDetailVisible, setOrderDetailVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [orderForm] = Form.useForm();

  // Khi chọn nhiều sản phẩm, lưu lại để hiển thị input số lượng
  const selectedProductIds: number[] = Form.useWatch('productIds', orderForm) || [];

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedProductIds.includes(p.id)),
    [products, selectedProductIds],
  );

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (orderSearch.trim()) {
      const keyword = orderSearch.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(keyword) ||
          o.id.toLowerCase().includes(keyword),
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

  /** -------------------- THÊM ĐƠN HÀNG -------------------- */

  const openCreateOrderModal = () => {
    orderForm.resetFields();
    setOrderModalVisible(true);
  };

  const closeCreateOrderModal = () => {
    setOrderModalVisible(false);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10,11}$/.test(phone);
  };

  const handleCreateOrder = async () => {
    try {
      const values = await orderForm.validateFields();

      const {
        customerName,
        phone,
        address,
        productIds: formProductIds,
        quantities,
      } = values as {
        customerName: string;
        phone: string;
        address: string;
        productIds: number[];
        quantities: Record<number, number>;
      };

      // Validate số lượng & kho
      const items: OrderItem[] = [];
      let totalAmount = 0;

      for (const productId of formProductIds) {
        const product = products.find((p) => p.id === productId);
        if (!product) continue;
        const quantity = Number(quantities?.[productId] ?? 0);

        if (!quantity || quantity <= 0) {
          throw new Error(`Số lượng sản phẩm "${product.name}" phải > 0`);
        }

        if (quantity > product.quantity) {
          throw new Error(
            `Số lượng đặt của "${product.name}" (${quantity}) lớn hơn tồn kho (${product.quantity})`,
          );
        }

        const price = product.price;
        items.push({
          productId,
          productName: product.name,
          quantity,
          price,
        });
        totalAmount += price * quantity;
      }

      if (!items.length) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm và nhập số lượng.');
      }

      // Tạo mã đơn hàng mới
      const maxNumber =
        orders.reduce((max, o) => {
          const num = Number(o.id.replace(/\D/g, '')) || 0;
          return num > max ? num : max;
        }, 0) || 0;

      const newId = `DH${String(maxNumber + 1).padStart(3, '0')}`;

      const newOrder: Order = {
        id: newId,
        customerName,
        phone,
        address,
        products: items,
        totalAmount,
        status: 'Chờ xử lý',
        createdAt: moment().format('YYYY-MM-DD'),
      };

      setOrders([...orders, newOrder]);
      message.success('Tạo đơn hàng thành công');
      setOrderModalVisible(false);
      orderForm.resetFields();
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  /** -------------------- CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG -------------------- */

  const updateInventoryForOrderStatusChange = useCallback(
    (order: Order, newStatus: OrderStatus): Product[] => {
      // Nếu chuyển sang "Hoàn thành" từ trạng thái khác => trừ kho
      // Nếu chuyển từ "Hoàn thành" sang trạng thái khác => cộng lại kho
      const wasCompleted = order.status === 'Hoàn thành';
      const willBeCompleted = newStatus === 'Hoàn thành';

      if (wasCompleted === willBeCompleted) return products;

      const updated = products.map((p) => ({ ...p }));

      for (const item of order.products) {
        const product = updated.find((p) => p.id === item.productId);
        if (!product) continue;

        if (!wasCompleted && willBeCompleted) {
          // trừ kho
          if (product.quantity < item.quantity) {
            throw new Error(
              `Không đủ tồn kho để hoàn thành đơn hàng ${order.id} - sản phẩm "${product.name}"`,
            );
          }
          product.quantity -= item.quantity;
        } else if (wasCompleted && !willBeCompleted) {
          // hoàn kho
          product.quantity += item.quantity;
        }
      }

      return updated;
    },
    [products],
  );

  const handleChangeOrderStatus = (order: Order, newStatus: OrderStatus) => {
    try {
      const updatedProducts = updateInventoryForOrderStatusChange(order, newStatus);
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: newStatus } : o,
      );
      setProducts(updatedProducts);
      setOrders(updatedOrders);
      message.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  /** -------------------- XEM CHI TIẾT ĐƠN HÀNG -------------------- */

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailVisible(true);
  };

  const closeOrderDetail = () => {
    setOrderDetailVisible(false);
    setSelectedOrder(null);
  };

  /** -------------------- THỐNG KÊ DASHBOARD -------------------- */

  const dashboardData = useMemo(() => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status === 'Hoàn thành')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCounts = orderStatuses.reduce<Record<OrderStatus, number>>(
      (acc, status) => {
        acc[status] = orders.filter((o) => o.status === status).length;
        return acc;
      },
      {
        'Chờ xử lý': 0,
        'Đang giao': 0,
        'Hoàn thành': 0,
        'Đã hủy': 0,
      },
    );

    return {
      totalProducts,
      totalStockValue,
      totalOrders,
      totalRevenue,
      statusCounts,
    };
  }, [products, orders]);

  /** -------------------- COLUMNS SẢN PHẨM -------------------- */

  const productColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (value: number) =>
        value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'quantity',
      sorter: (a: Product, b: Product) => a.quantity - b.quantity,
    },
    {
      title: 'Trạng thái',
      render: (_: any, record: Product) => {
        const status = getProductStatus(record.quantity);
        return <Tag color={getProductStatusColor(status)}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      render: () => <span>Sửa (tự triển khai thêm nếu cần)</span>,
    },
  ];

  /** -------------------- COLUMNS ĐƠN HÀNG -------------------- */

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      sorter: (a: Order, b: Order) => a.id.localeCompare(b.id),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
    },
    {
      title: 'Số sản phẩm',
      render: (_: any, record: Order) => record.products.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      render: (value: number) =>
        value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: OrderStatus, record: Order) => (
        <Select
          value={value}
          style={{ width: 140 }}
          onChange={(val: OrderStatus) => handleChangeOrderStatus(record, val)}
        >
          {orderStatuses.map((st) => (
            <Option key={st} value={st}>
              {st}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: (a: Order, b: Order) =>
        moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
    },
    {
      title: 'Thao tác',
      render: (_: any, record: Order) => (
        <Button type="link" onClick={() => openOrderDetail(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  /** -------------------- RENDER -------------------- */

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Dashboard" key="dashboard">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic title="Tổng số sản phẩm" value={dashboardData.totalProducts} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng giá trị tồn kho"
                  value={dashboardData.totalStockValue}
                  precision={0}
                  suffix="₫"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Tổng số đơn hàng" value={dashboardData.totalOrders} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Doanh thu (hoàn thành)"
                  value={dashboardData.totalRevenue}
                  precision={0}
                  suffix="₫"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 24 }}>
            {orderStatuses.map((st) => (
              <Col span={6} key={st}>
                <Card>
                  <Statistic
                    title={`Số đơn - ${st}`}
                    value={dashboardData.statusCounts[st]}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Quản lý Sản phẩm" key="products">
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Input.Search
              allowClear
              placeholder="Tìm kiếm theo tên sản phẩm"
              style={{ width: 250 }}
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setProductPage(1);
              }}
            />

            <Select
              allowClear
              placeholder="Lọc theo danh mục"
              style={{ width: 180 }}
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setProductPage(1);
              }}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>

            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setProductPage(1);
              }}
            >
              <Option value="Còn hàng">Còn hàng</Option>
              <Option value="Sắp hết">Sắp hết</Option>
              <Option value="Hết hàng">Hết hàng</Option>
            </Select>

            {products.length > 0 && (
              <div style={{ width: 260 }}>
                <span>Khoảng giá:</span>
                <Slider
                  range
                  min={minPrice}
                  max={maxPrice}
                  step={100000}
                  value={priceRange || [minPrice, maxPrice]}
                  onChange={(val: [number, number]) => {
                    setPriceRange(val);
                    setProductPage(1);
                  }}
                />
              </div>
            )}
          </div>

          <Table
            rowKey="id"
            columns={productColumns}
            dataSource={filteredProducts}
            pagination={{
              current: productPage,
              pageSize: 5,
              total: filteredProducts.length,
              onChange: setProductPage,
            }}
          />
        </TabPane>

        <TabPane tab="Quản lý Đơn hàng" key="orders">
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Input.Search
              allowClear
              placeholder="Tìm theo khách hàng / mã đơn"
              style={{ width: 260 }}
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />

            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: 180 }}
              value={orderStatusFilter}
              onChange={(val: OrderStatus | undefined) => setOrderStatusFilter(val)}
            >
              {orderStatuses.map((st) => (
                <Option key={st} value={st}>
                  {st}
                </Option>
              ))}
            </Select>

            <RangePicker
              value={orderDateRange as any}
              onChange={(val) => setOrderDateRange(val as any)}
            />

            <Button type="primary" onClick={openCreateOrderModal}>
              Tạo đơn hàng mới
            </Button>
          </div>

          <Table rowKey="id" columns={orderColumns} dataSource={filteredOrders} />
        </TabPane>
      </Tabs>

      {/* Modal tạo đơn hàng */}
      <Modal
        visible={orderModalVisible}
        title="Tạo đơn hàng mới"
        onCancel={closeCreateOrderModal}
        onOk={handleCreateOrder}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={orderForm} layout="vertical">
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
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/^\d{10,11}$/.test(value)) {
                    return Promise.reject(
                      new Error('Số điện thoại phải gồm 10-11 chữ số'),
                    );
                  }
                  return Promise.resolve();
                },
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
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Sản phẩm"
            name="productIds"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select mode="multiple" placeholder="Chọn sản phẩm">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name} ({p.quantity} tồn) -{' '}
                  {p.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedProducts.length > 0 && (
            <Card size="small" title="Số lượng từng sản phẩm">
              {selectedProducts.map((p) => (
                <Form.Item
                  key={p.id}
                  label={`${p.name} (tồn: ${p.quantity})`}
                  name={['quantities', p.id]}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng' },
                    {
                      validator: (_, value) => {
                        if (!value || value <= 0) {
                          return Promise.reject(
                            new Error('Số lượng phải là số nguyên dương'),
                          );
                        }
                        if (value > p.quantity) {
                          return Promise.reject(
                            new Error(
                              `Số lượng không được vượt quá tồn kho (${p.quantity})`,
                            ),
                          );
                        }
                        if (!Number.isInteger(value)) {
                          return Promise.reject(
                            new Error('Số lượng phải là số nguyên'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={1} />
                </Form.Item>
              ))}
            </Card>
          )}
        </Form>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        visible={orderDetailVisible}
        title={`Chi tiết đơn hàng ${selectedOrder?.id ?? ''}`}
        onCancel={closeOrderDetail}
        footer={<Button onClick={closeOrderDetail}>Đóng</Button>}
        width={700}
      >
        {selectedOrder && (
          <>
            <p>
              <strong>Khách hàng:</strong> {selectedOrder.customerName}
            </p>
            <p>
              <strong>SĐT:</strong> {selectedOrder.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedOrder.address}
            </p>
            <p>
              <strong>Ngày tạo:</strong> {selectedOrder.createdAt}
            </p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <Badge
                status={
                  selectedOrder.status === 'Hoàn thành'
                    ? 'success'
                    : selectedOrder.status === 'Đã hủy'
                    ? 'error'
                    : 'processing'
                }
                text={selectedOrder.status}
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
                    value.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }),
                },
                {
                  title: 'Thành tiền',
                  render: (_: any, record: OrderItem) =>
                    (record.price * record.quantity).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }),
                },
              ]}
              dataSource={selectedOrder.products}
            />

            <p style={{ marginTop: 16, textAlign: 'right' }}>
              <strong>Tổng tiền: </strong>
              {selectedOrder.totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default QuanLyDonHangSanPham;