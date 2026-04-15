import React, { useMemo, useState } from 'react';
import { Input, Select, Slider, Table, Tag } from 'antd';
import { useModel } from 'umi';
import type { Product } from '@/models/orderProduct';

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

const Products: React.FC = () => {
  const { products } = useModel('orderProduct');
  const [productSearch, setProductSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>();
  const [productPage, setProductPage] = useState<number>(1);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

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
  ];

  return (
    <>
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
    </>
  );
};

export default Products;
