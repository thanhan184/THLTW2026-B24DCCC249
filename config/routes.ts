import path from "path";

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

	// Quản lý đơn hàng
	{
		path: '/donhang',
		name: 'Quản lý đơn hàng',
		component: './QuanLyDonHangSanPham',
	},
	// Quản lý văn bằng
	{
		path: '/van-bang',
		name: 'Quản lý văn bằng',
		routes: [
		  {
			path: '/van-bang/so-van-bang',
			name: 'Sổ văn bằng',
			component: '@/pages/VanBang/SoVanBang/SoVanBang',
		  },
		  {
			path: '/van-bang/cau-hinh-truong',
			name: 'Cấu hình trường',
			component: '@/pages/VanBang/CauHinhTruong/CauHinhTruong',
		  },
		  {
			path: '/van-bang/quyet-dinh',
			name: 'Quyết định',
			component: '@/pages/VanBang/QuyetDinh/QuyetDinh',
		  },
		  {
			path: '/van-bang/tra-cuu',
			name: 'Tra cứu văn bằng',
			component: '@/pages/VanBang/TraCuu/TraCuu',
		  },
		  {
			path: '/van-bang/van-bang',
			name: 'Văn bằng',
			component: '@/pages/VanBang/Vanbang/VanBang',
		  },
		],
	},
	  
	{
		path: '/club-management',
		name: 'Quản lý Câu lạc bộ',
		routes: [
			{
				path: '/club-management/club',
				name: 'Danh sách CLB',
				component: '@/pages/ClubManagement/Club',
			},
			{
				path: '/club-management/application',
				name: 'Đơn đăng ký',
				component: '@/pages/ClubManagement/Application',
			},
			{
				path: '/club-management/member',
				name: 'Thành viên CLB',
				component: '@/pages/ClubManagement/Member',
			},
			{
				path: '/club-management/report',
				name: 'Báo cáo & Thống kê',
				component: '@/pages/ClubManagement/Report',
			},
		],
	},

	// Quản lý kế hoạch du lịch
	{
		path: '/travel-planner',
		name: 'Lập kế hoạch du lịch',
		component: './TravelPlanner',
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
		path: '/blog',
		name: 'Blog',
		icon: 'read',
		hideInMenu: true,
		routes: [
			{
				path: '/blog/home',
				name: 'Trang chủ',
				component: '@/pages/Blog/Home',
				hideInMenu: true,
			},
			{
				path: '/blog/post/:slug',
				name: 'Chi tiết',
				component: '@/pages/Blog/Detail',
				hideInMenu: true,
			},
			{
				path: '/blog/about',
				name: 'Giới thiệu',
				component: '@/pages/Blog/About',
				hideInMenu: true,
			},
		],
	},
	{
		path: '/blog-admin',
		name: 'Quản lý Blog',
		icon: 'edit',
		routes: [
			{
				path: '/blog-admin/articles',
				name: 'Bài viết',
				component: '@/pages/BlogAdmin/ArticleManage',
			},
			{
				path: '/blog-admin/tags',
				name: 'Quản lý Thẻ',
				component: '@/pages/BlogAdmin/TagManage',
			},
		],
	},

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
