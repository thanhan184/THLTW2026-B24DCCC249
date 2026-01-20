import React, { useState } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Input,
  message,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { initialProducts, Product } from './data';
import ProductForm from './components/DanhSachSP';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAdd = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: products.length
        ? Math.max(...products.map(p => p.id)) + 1
        : 1,
      ...product,
    };
    setProducts(prev => [...prev, newProduct]);
    setIsModalVisible(false);
    message.success('Thêm sản phẩm thành công');
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      key: 'price',
      dataIndex: 'price',
      render: value => value.toLocaleString(),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger> Xóa </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên sản phẩm"
          onChange={e => setSearchText(e.target.value)}
          value={searchText}
        />
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <ProductForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onCreate={handleAdd}
      />
    </div>
  );
};

export default ProductsPage;
