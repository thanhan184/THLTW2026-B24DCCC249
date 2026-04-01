import React, { useState } from 'react';
import { Table, Button, Space, Typography, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import ChangeClubModal from './components/ChangeClubModal';

const { Title } = Typography;

const MemberPage: React.FC = () => {
  const { applications, setApplications, clubs } = useModel('clubManagement');
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isChangeClubVisible, setIsChangeClubVisible] = useState(false);
  const [changingMemberIds, setChangingMemberIds] = useState<string[]>([]);

  // Only show approved members
  const members = applications.filter(app => app.status === 'Approved');

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleOpenChangeClub = (ids: string[]) => {
    setChangingMemberIds(ids);
    setIsChangeClubVisible(true);
  };

  const handleChangeClubConfirm = (newClubId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        changingMemberIds.includes(app.id)
          ? { ...app, clubId: newClubId }
          : app
      )
    );
    
    message.success(`Đã chuyển CLB cho ${changingMemberIds.length} thành viên`);
    setIsChangeClubVisible(false);
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
      },
      filters: clubs.map(c => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.clubId === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" icon={<SwapOutlined />} onClick={() => handleOpenChangeClub([record.id])}>
            Chuyển CLB
          </Button>
        </Space>
      ),
    },
  ];

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý Thành viên</Title>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Đã chọn ${selectedRowKeys.length} thành viên` : ''}
        </span>
        {hasSelected && (
           <Button type="primary" onClick={() => handleOpenChangeClub(selectedRowKeys as string[])} icon={<SwapOutlined />}>
             Chuyển CLB cho {selectedRowKeys.length} thành viên
           </Button>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={members}
        rowKey="id"
        pagination={{ pageSize: 15 }}
      />

      <ChangeClubModal
        visible={isChangeClubVisible}
        onCancel={() => setIsChangeClubVisible(false)}
        onConfirm={handleChangeClubConfirm}
        clubs={clubs}
        memberCount={changingMemberIds.length}
      />
    </div>
  );
};

export default MemberPage;
