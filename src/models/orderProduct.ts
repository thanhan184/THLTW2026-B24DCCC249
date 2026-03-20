import { useEffect, useState } from 'react';

export type ProductStatus = 'Còn hàng' | 'Sắp hết' | 'Hết hàng';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // yyyy-MM-dd
}

const PRODUCT_STORAGE_KEY = 'qlsp_products_v1';
const ORDER_STORAGE_KEY = 'qlsp_orders_v1';

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [
      {
        productId: 1,
        productName: 'Laptop Dell XPS 13',
        quantity: 1,
        price: 25000000,
      },
    ],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15',
  },
];

export default () => {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (!raw) return INITIAL_PRODUCTS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY);
      if (!raw) return INITIAL_ORDERS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  return {
    products,
    setProducts,
    orders,
    setOrders,
  };
};