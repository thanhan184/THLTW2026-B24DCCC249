import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/services/taskService';
import moment from 'moment';
import TaskFormModal from './components/TaskFormModal';
import type { ColumnsType } from 'antd/lib/table';

const { Option } = Select;

const priorityColors: Record<string, string> = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const statusColors: Record<string, string> = {
  'To Do': 'default',
  'Doing': 'processing',
  'Done': 'success',
};

const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (searchText) {
      result = result.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [tasks, searchText, statusFilter]);

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    message.success('Xóa task thành công!');
  };

  const handleModalSubmit = (values: Omit<Task, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      updateTask(id, values);
      message.success('Cập nhật task thành công!');
    } else {
      addTask(values);
      message.success('Thêm task mới thành công!');
    }
    setIsModalVisible(false);
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Tên Task',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a, b) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf(),
      render: (date: string) => {
        const isOverdue = moment(date).isBefore(moment(), 'day');
        return (
          <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
            {moment(date).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (prio: string) => (
        <Tag color={priorityColors[prio]}>{prio === 'High' ? 'Cao' : prio === 'Medium' ? 'Trung bình' : 'Thấp'}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>
          {status === 'To Do' ? 'Cần làm' : status === 'Doing' ? 'Đang làm' : 'Hoàn thành'}
        </Tag>
      ),
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      render: (tag: string) => tag ? <Tag>{tag}</Tag> : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa task này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Danh sách Task</h2>
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Space>
            <Input.Search
              placeholder="Tìm kiếm công việc..."
              allowClear
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 150 }}
              onChange={value => setStatusFilter(value)}
            >
              <Option value="To Do">Cần làm</Option>
              <Option value="Doing">Đang làm</Option>
              <Option value="Done">Hoàn thành</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm Task
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <TaskFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialValues={editingTask}
      />
    </div>
  );
};

export default TaskList;
