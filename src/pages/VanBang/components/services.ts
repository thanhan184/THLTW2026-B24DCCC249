const soList: any[] = [];
const qdList: any[] = [];
const truongList: any[] = [];
const vbList: any[] = [];

export const service = {
  // Sổ
  getSo: () => soList,
  addSo: (data: any) => {
    soList.push({ ...data, id: Date.now(), currentNumber: 0 });
  },

  // Quyết định
  getQD: () => qdList,
  addQD: (data: any) => {
    qdList.push({ ...data, id: Date.now(), luotTraCuu: 0 });
  },

  // Trường
  getTruong: () => truongList,
  addTruong: (data: any) => {
    truongList.push({ ...data, id: Date.now() });
  },

  // Văn bằng
  getVB: () => vbList,
  addVB: (data: any) => {
    const so = soList.find(s => s.id === data.soVanBangId);
    if (so) {
      so.currentNumber += 1;
      vbList.push({
        ...data,
        id: Date.now(),
        soVaoSo: so.currentNumber,
      });
    }
  },

  // Tra cứu
  traCuu: (params: any) => {
    return vbList.filter(v =>
      (!params.msv || v.msv.includes(params.msv)) &&
      (!params.hoTen || v.hoTen.includes(params.hoTen))
    );
  },
};