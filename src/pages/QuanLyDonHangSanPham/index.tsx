import React, { useState } from 'react';
import { Tabs } from 'antd';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';

const { TabPane } = Tabs;

const QuanLyDonHangSanPham: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('orders');

  return (
    <div style={{ padding: 24, backgroundColor: '#fff', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 24 }}>Quản lý Cửa hàng</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane tab="Dashboard" key="dashboard">
          <Dashboard />
        </TabPane>

        <TabPane tab="Quản lý Sản phẩm" key="products">
          <Products />
        </TabPane>

        <TabPane tab="Quản lý Đơn hàng" key="orders">
          <Orders />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QuanLyDonHangSanPham;