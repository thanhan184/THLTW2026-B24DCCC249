import React, { useState } from 'react';
import { Table, Button, Space, Modal, Input, message, Tag, Typography, Drawer } from 'antd';
import { CheckOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import RejectModal from './components/RejectModal';
import HistoryDrawer from './components/HistoryDrawer';

const { Title } = Typography;

const ApplicationPage: React.FC = () => {
  const { applications, setApplications, history, setHistory, clubs } = useModel('clubManagement');
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isHistoryDrawerVisible, setIsHistoryDrawerVisible] = useState(false);
  
  // Biến lưu trữ ids đang chuẩn bị để từ chối
  const [rejectingIds, setRejectingIds] = useState<string[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleApprove = (ids: string[]) => {
    setApplications((prev) =>
      prev.map((app) => (ids.includes(app.id) ? { ...app, status: 'Approved' } : app))
    );
    
    // Lưu lịch sử
    const newHistory = ids.map((id) => {
      const app = applications.find(a => a.id === id);
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        action: 'Approved',
        timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
        details: `Admin đã Approved ứng viên ${app?.fullName || ''}`,
      };
    });
    setHistory((prev) => [...newHistory, ...prev]);

    message.success(`Đã duyệt ${ids.length} đơn`);
    setSelectedRowKeys([]); // clear selection
  };

  const handleOpenRejectModal = (ids: string[]) => {
    setRejectingIds(ids);
    setIsRejectModalVisible(true);
  };

  const handleRejectConfirm = (reason: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        rejectingIds.includes(app.id)
          ? { ...app, status: 'Rejected', notes: reason }
          : app
      )
    );

    // Lưu lịch sử
    const newHistory = rejectingIds.map((id) => {
      const app = applications.find(a => a.id === id);
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        action: 'Rejected',
        timestamp: moment().format('YYYY-MM-DDTHH:mm:ss'),
        details: `Admin đã Rejected ứng viên ${app?.fullName || ''} với lý do: ${reason}`,
      };
    });
    setHistory((prev) => [...newHistory, ...prev]);

    message.success(`Đã từ chối ${rejectingIds.length} đơn`);
    setIsRejectModalVisible(false);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<any> = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Sở trường', dataIndex: 'strengths', key: 'strengths' },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubId',
      key: 'clubId',
      render: (clubId) => {
        const c = clubs.find(c => c.id === clubId);
        return c?.name || clubId;
      }
    },
    { title: 'Lý do đăng ký', dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (val) => {
        const color = val === 'Approved' ? 'green' : val === 'Rejected' ? 'red' : 'blue';
        return <Tag color={color}>{val}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', ellipsis: true },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.status === 'Pending' && (
            <>
              <Button type="link" size="small" style={{ padding: 0 }} icon={<CheckOutlined />} onClick={() => handleApprove([record.id])}>
                Duyệt
              </Button>
              <Button type="link" danger size="small" style={{ padding: 0 }} icon={<CloseOutlined />} onClick={() => handleOpenRejectModal([record.id])}>
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const hasSelected = selectedRowKeys.length > 0;
  // Chỉ apply các action cho các record có status là Pending trong selectedRows
  const selectedPendingIds = selectedRowKeys.filter(key => {
    const app = applications.find(a => a.id === key);
    return app?.status === 'Pending';
  }) as string[];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý Đơn đăng ký</Title>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setIsHistoryDrawerVisible(true)}>
            Lịch sử duyệt
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Đã chọn ${selectedRowKeys.length} đơn` : ''}
        </span>
        {hasSelected && selectedPendingIds.length > 0 && (
           <Space>
             <Button type="primary" onClick={() => handleApprove(selectedPendingIds)} icon={<CheckOutlined />}>
               Duyệt {selectedPendingIds.length} đơn (Pending)
             </Button>
             <Button danger onClick={() => handleOpenRejectModal(selectedPendingIds)} icon={<CloseOutlined />}>
               Từ chối {selectedPendingIds.length} đơn (Pending)
             </Button>
           </Space>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={applications}
        rowKey="id"
        pagination={{ pageSize: 15 }}
      />

      <RejectModal
        visible={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        onConfirm={handleRejectConfirm}
      />

      <HistoryDrawer
        visible={isHistoryDrawerVisible}
        onClose={() => setIsHistoryDrawerVisible(false)}
        history={history}
      />
    </div>
  );
};

export default ApplicationPage;
