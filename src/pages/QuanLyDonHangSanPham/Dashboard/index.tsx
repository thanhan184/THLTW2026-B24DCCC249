import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { useModel } from 'umi';

const Dashboard: React.FC = () => {
  const { products, orders } = useModel('orderProduct');
  const orderStatuses = ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

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

    const statusCounts = orderStatuses.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = orders.filter((o) => o.status === status).length;
        return acc;
      },
      {
        'Chờ xác nhận': 0,
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

  return (
    <>
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
    </>
  );
};

export default Dashboard;
