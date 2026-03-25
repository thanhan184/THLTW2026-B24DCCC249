export type SoVanBang = {
    id: number;
    nam: number;
    currentNumber: number;
  };
  
  export type QuyetDinh = {
    id: number;
    soQD: string;
    ngayBanHanh: string;
    trichYeu: string;
    soVanBangId: number;
    luotTraCuu: number;
  };
  
  export type Truong = {
    id: number;
    ten: string;
    kieu: 'string' | 'number' | 'date';
  };
  
  export type VanBang = {
    id: number;
    soVaoSo: number;
    soHieu: string;
    msv: string;
    hoTen: string;
    ngaySinh: string;
    quyetDinhId: number;
    soVanBangId: number;
    duLieuMoRong: Record<string, any>;
  };