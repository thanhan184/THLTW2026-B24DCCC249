import React, { useState } from 'react';
import { Table, Button, Space, Modal, Input, message, Form, Popconfirm, Avatar, Tag, Drawer, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import FormClub from './components/FormClub';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const ClubPage: React.FC = () => {
  const { clubs, setClubs, applications } = useModel('clubManagement');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  
  // Drawer state for viewing members
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedClubForMembers, setSelectedClubForMembers] = useState<any>(null);

  const handleAdd = () => {
    setEditingClub(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingClub(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setClubs((prev) => prev.filter((c) => c.id !== id));
    message.success('Đã xóa câu lạc bộ');
  };

  const handleViewMembers = (record: any) => {
    setSelectedClubForMembers(record);
    setIsDrawerVisible(true);
  };

  const onFinishForm = (values: any) => {
    if (editingClub) {
      setClubs((prev) =>
        prev.map((c) => (c.id === editingClub.id ? { ...c, ...values } : c))
      );
      message.success('Cập nhật thành công');
    } else {
      const newClub = {
        ...values,
        id: Date.now().toString(),
      };
      setClubs((prev) => [...prev, newClub]);
      message.success('Thêm mới thành công');
    }
    setIsModalVisible(false);
  };

  const membersInSelectedClub = applications.filter(
    (app) => app.clubId === selectedClubForMembers?.id && app.status === 'Approved'
  );

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) || 
    c.president.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<any> = [
    {
      title: 'Tên CLB',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'foundedDate',
      key: 'foundedDate',
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.foundedDate).valueOf() - moment(b.foundedDate).valueOf(),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
    },
    {
      title: 'Chủ nhiệm',
      dataIndex: 'president',
      key: 'president',
      sorter: (a, b) => a.president.localeCompare(b.president),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'active',
      key: 'active',
      render: (val) => (
        <Tag color={val ? 'green' : 'red'}>{val ? 'Có' : 'Không'}</Tag>
      ),
      filters: [
        { text: 'Có', value: true },
        { text: 'Không', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" style={{ padding: 0 }}>Sửa</Button>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewMembers(record)} size="small" style={{ padding: 0 }}>Thành viên</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" style={{ padding: 0 }}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh sách Câu lạc bộ</Title>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo Tên CLB, Chủ nhiệm"
            allowClear
            onSearch={(val) => setSearchText(val)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredClubs}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ marginTop: 16 }}
      />

      <FormClub
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onFinish={onFinishForm}
        initialValues={editingClub}
      />

      <Drawer
        title={`Thành viên CLB ${selectedClubForMembers?.name || ''}`}
        placement="right"
        width={700}
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
      >
        <Table
          dataSource={membersInSelectedClub}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
            { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
            { title: 'Sở trường', dataIndex: 'strengths', key: 'strengths' },
          ]}
        />
      </Drawer>
    </div>
  );
};

export default ClubPage;
