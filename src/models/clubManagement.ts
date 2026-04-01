import { useState, useEffect } from 'react';

export interface IClub {
  id: string;
  avatar: string;
  name: string;
  foundedDate: string;
  description: string;
  president: string;
  active: boolean;
}

export interface IApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  address: string;
  strengths: string;
  clubId: string; // Tên CLB hoặc ID
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
}

export interface IHistory {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

const LOCAL_STORAGE_KEY = 'clubManagementSys';

const initialClubs: IClub[] = [
  {
    id: '1',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    name: 'CLB Âm nhạc',
    foundedDate: '2020-01-01',
    description: '<p>CLB Âm nhạc dành cho các bạn yêu thích ca hát, nhạc cụ.</p>',
    president: 'Nguyễn Văn A',
    active: true,
  },
  {
    id: '2',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg',
    name: 'CLB Thể thao',
    foundedDate: '2019-05-15',
    description: '<p>Nơi giao lưu thể thao, rèn luyện sức khỏe.</p>',
    president: 'Trần Thị B',
    active: true,
  },
  {
    id: '3',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    name: 'CLB Lập trình',
    foundedDate: '2021-09-05',
    description: '<p>Học hỏi và chia sẻ kiến thức về lập trình, giải thuật.</p>',
    president: 'Lê Văn C',
    active: false,
  },
];

const initialApplications: IApplication[] = [
  {
    id: '1',
    fullName: 'Phạm Minh D',
    email: 'minhd@example.com',
    phone: '0987654321',
    gender: 'Nam',
    address: 'Hà Nội',
    strengths: 'Hát, Chơi Guitar',
    clubId: '1',
    reason: 'Muốn phát triển đam mê âm nhạc',
    status: 'Pending',
    notes: '',
  },
  {
    id: '2',
    fullName: 'Hoàng Hữu E',
    email: 'huue@example.com',
    phone: '0123456789',
    gender: 'Nam',
    address: 'Hồ Chí Minh',
    strengths: 'Đá bóng, Cầu lông',
    clubId: '2',
    reason: 'Rèn luyện sức khỏe',
    status: 'Approved',
    notes: '',
  },
  {
    id: '3',
    fullName: 'Lý Thị F',
    email: 'lythif@example.com',
    phone: '0987123456',
    gender: 'Nữ',
    address: 'Đà Nẵng',
    strengths: 'Code dạo',
    clubId: '3',
    reason: 'Học hỏi thêm',
    status: 'Rejected',
    notes: 'Chưa đủ điều kiện tham gia',
  },
];

const initialHistory: IHistory[] = [
  {
    id: '1',
    action: 'Rejected',
    timestamp: '2025-04-09T17:09:00',
    details: 'Admin đã Rejected ứng viên Lý Thị F với lý do: Chưa đủ điều kiện tham gia',
  },
];

export default () => {
  const [clubs, setClubs] = useState<IClub[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clubs`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialClubs;
  });

  const [applications, setApplications] = useState<IApplication[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_applications`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialApplications;
  });

  const [history, setHistory] = useState<IHistory[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_history`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialHistory;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clubs`, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_applications`, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_history`, JSON.stringify(history));
  }, [history]);

  return {
    clubs,
    setClubs,
    applications,
    setApplications,
    history,
    setHistory,
  };
};
