import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Modal, Form, Input, Select, Drawer, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getArticles, createArticle, updateArticle, deleteArticle, getTags } from '@/services/Blog/blogService';
import type { Article, Tag as TagType } from '@/services/Blog/typings';
import moment from 'moment';

const { Option } = Select;

const ArticleManage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();

  const fetchArticles = (page = 1, search = '', status?: string) => {
    setLoading(true);
    const { data, total } = getArticles(page, 10, search, undefined, status);
    setArticles(data);
    setTotal(total);
    setLoading(false);
  };

  useEffect(() => {
    setTags(getTags());
    fetchArticles(currentPage, searchTitle, filterStatus);
  }, [currentPage, searchTitle, filterStatus]);

  const handleTableChange = (pagination: any, filters: any) => {
    setCurrentPage(pagination.current);
    if (filters.status && filters.status.length > 0) {
      setFilterStatus(filters.status[0]);
    } else {
      setFilterStatus(undefined);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTitle(value);
    setCurrentPage(1);
  };

  const openDrawer = (article?: Article) => {
    setEditingArticle(article || null);
    if (article) {
      form.setFieldsValue({
        ...article,
        tagIds: article.tags.map(t => t.id)
      });
    } else {
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingArticle(null);
  };

  const onFinish = (values: any) => {
    const selectedTags = tags.filter(t => values.tagIds.includes(t.id));
    const articleData = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      content: values.content,
      thumbnail: values.thumbnail,
      status: values.status,
      tags: selectedTags
    };

    if (editingArticle) {
      updateArticle(editingArticle.id, articleData);
      message.success('Cập nhật bài viết thành công');
    } else {
      createArticle(articleData);
      message.success('Thêm bài viết mới thành công');
    }
    
    closeDrawer();
    fetchArticles(currentPage, searchTitle, filterStatus);
  };

  const handleDelete = (id: string) => {
    deleteArticle(id);
    message.success('Xóa bài viết thành công');
    fetchArticles(currentPage, searchTitle, filterStatus);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Draft', value: 'Draft' },
        { text: 'Published', value: 'Published' },
      ],
      filterMultiple: false,
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Thẻ',
      key: 'tags',
      render: (_: any, record: Article) => (
        <>
          {record.tags.map(tag => (
            <Tag color="blue" key={tag.id} style={{ marginBottom: 4 }}>
              {tag.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: Article, b: Article) => a.views - b.views,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: number) => moment(val).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Article) => (
        <Space size="middle">
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này không?"
            onConfirm={() => handleDelete(record.id)}
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
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="Tìm kiếm theo tiêu đề"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
          Thêm bài viết
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ current: currentPage, total, pageSize: 10 }}
        onChange={handleTableChange}
      />

      <Drawer
        title={editingArticle ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        width={720}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
            <Input placeholder="nhap-tieu-de-khong-dau" />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt">
            <Input.TextArea rows={2} placeholder="Nhập tóm tắt bài viết..." />
          </Form.Item>
          <Form.Item name="content" label="Nội dung (Markdown)" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea rows={10} placeholder="Nhập nội dung bài viết bằng Markdown..." />
          </Form.Item>
          <Form.Item name="thumbnail" label="URL Ảnh đại diện">
            <Input placeholder="https://..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tagIds" label="Thẻ tag" rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thẻ' }]}>
                <Select mode="multiple" placeholder="Chọn thẻ">
                  {tags.map(tag => (
                    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]} initialValue="Draft">
                <Select placeholder="Chọn trạng thái">
                  <Option value="Draft">Nháp</Option>
                  <Option value="Published">Đã đăng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={closeDrawer}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ArticleManage;
