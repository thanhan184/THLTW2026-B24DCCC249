import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTagStats, createTag, updateTag, deleteTag } from '@/services/Blog/blogService';
import type { Tag as TagType } from '@/services/Blog/typings';

interface TagStats extends TagType {
  articleCount: number;
}

const TagManage: React.FC = () => {
  const [tags, setTags] = useState<TagStats[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagStats | null>(null);
  const [form] = Form.useForm();

  const fetchTags = () => {
    setLoading(true);
    setTags(getTagStats());
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openModal = (tag?: TagStats) => {
    setEditingTag(tag || null);
    if (tag) {
      form.setFieldsValue(tag);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTag(null);
  };

  const onFinish = (values: { name: string }) => {
    if (editingTag) {
      updateTag(editingTag.id, values.name);
      message.success('Cập nhật thẻ thành công');
    } else {
      createTag(values.name);
      message.success('Thêm thẻ mới thành công');
    }
    closeModal();
    fetchTags();
  };

  const handleDelete = (id: string, articleCount: number) => {
    if (articleCount > 0) {
      message.error(`Không thể xóa thẻ đang được sử dụng ở ${articleCount} bài viết`);
      return;
    }
    deleteTag(id);
    message.success('Xóa thẻ thành công');
    fetchTags();
  };

  const columns = [
    {
      title: 'Tên thẻ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số bài viết sử dụng',
      dataIndex: 'articleCount',
      key: 'articleCount',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: TagStats) => (
        <Space size="middle">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thẻ này không?"
            onConfirm={() => handleDelete(record.id, record.articleCount)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm thẻ mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ mới'}
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={closeModal}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item 
            name="name" 
            label="Tên thẻ" 
            rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
          >
            <Input placeholder="Nhập tên thẻ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManage;
