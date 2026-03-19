export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	// Danh sách sản phẩm
	{
		path: '/sanpham',
		name: 'Quản lý sản phẩm',
		component: './BaiTap1',
	},

	// Kéo búa bao
	{
		path: '/keo-bua-bao',
		name: 'Kéo búa bao',
		component: './TH02-Bai1',
	},
	{
		path: '/ngan-hang-cau-hoi-de-thi',
		name: 'Ngân hàng câu hỏi & Đề thi',
		component: './TH02-Bai2',
	},

	// Dịch vụ SPa
	{
		path: '/spa',
		name: 'Dịch vụ SPa',
		routes: [
			{
				name: 'NhanVien',
				path: 'nhan-vien',
				component:'./DatLich/NhanVien',
			},
			{
				name: 'DichVu',
				path: 'dich-vu',
				component: './DatLich/DichVu',
			},
			{
				name: 'LichHen',
				path: 'lich-hen',
				component: './DatLich/LichHen',
			},
			{
				name: 'DanhGia',
				path: 'danh-gia',
				component: './DatLich/DanhGia',
			},
			{
				name: 'ThongKe',
				path: 'thong-ke',
				component: './DatLich/ThongKe',
			}
		]
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
