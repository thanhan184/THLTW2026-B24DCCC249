import React, { useState, useMemo, useEffect } from 'react';
import {
	Tabs,
	Table,
	Card,
	Form,
	Input,
	Select,
	Button,
	Tag,
	Row,
	Col,
	Statistic,
	InputNumber,
	Rate,
	Alert,
	Empty,
	List,
	Typography,
	message,
	Avatar,
	Divider,
} from 'antd';
import { Pie, Column } from '@ant-design/plots';

const { Option } = Select;
const { Title, Text } = Typography;

// KEY localStorage
const LS_DEST = 'travel_destinations';
const LS_ITI = 'travel_itinerary';
const LS_BUDGET = 'travel_budget';

const TravelPlanner: React.FC = () => {
	const [activeTab, setActiveTab] = useState('1');
	const [formAdmin] = Form.useForm();

	// ================= LOAD DATA =================
	const [destinations, setDestinations] = useState<any[]>(() => {
		const data = localStorage.getItem(LS_DEST);
		return data
			? JSON.parse(data)
			: [
					{
						id: '1',
						name: 'Vịnh Hạ Long',
						type: 'biển',
						price: 2000000,
						rating: 5,
						image: 'https://picsum.photos/400/250?random=1',
						description: 'Kỳ quan thiên nhiên thế giới',
						food: 500000,
						hotel: 1000000,
						transport: 500000,
					},
			  ];
	});

	const [itinerary, setItinerary] = useState<any[]>(() => {
		const data = localStorage.getItem(LS_ITI);
		return data ? JSON.parse(data) : [];
	});

	const [budgetLimit, setBudgetLimit] = useState<number>(() => {
		const data = localStorage.getItem(LS_BUDGET);
		return data ? JSON.parse(data) : 5000000;
	});

    const [editingId, setEditingId] = useState<string | null>(null);

	// ================= SAVE DATA =================
	useEffect(() => {
		localStorage.setItem(LS_DEST, JSON.stringify(destinations));
	}, [destinations]);

	useEffect(() => {
		localStorage.setItem(LS_ITI, JSON.stringify(itinerary));
	}, [itinerary]);

	useEffect(() => {
		localStorage.setItem(LS_BUDGET, JSON.stringify(budgetLimit));
	}, [budgetLimit]);

	// ================= LOGIC =================
	const currentTotal = useMemo(() => {
		return itinerary.reduce((sum, item) => sum + (item.food + item.hotel + item.transport), 0);
	}, [itinerary]);

	const addToItinerary = (dest: any) => {
		const newItem = { ...dest, itId: Date.now(), day: itinerary.length + 1 };
		setItinerary([...itinerary, newItem]);
		message.success(`Đã thêm ${dest.name}`);
	};

	const handleAddDestination = (values: any) => {
        if (editingId) {
            // UPDATE
            const updated = destinations.map((d) =>
                d.id === editingId
                    ? {
                            ...d,
                            ...values,
                            price: (values.food || 0) + (values.hotel || 0) + (values.transport || 0),
                      }
                    : d
            );
            setDestinations(updated);
            message.success('Đã cập nhật điểm đến');
            setEditingId(null);
        } else {
            // CREATE
            const newDest = {
                ...values,
                id: Date.now().toString(),
                image: `https://picsum.photos/400/250?random=${Date.now()}`,
                rating: 4,
                price: (values.food || 0) + (values.hotel || 0) + (values.transport || 0),
            };
            setDestinations([...destinations, newDest]);
            message.success('Đã thêm điểm đến');
        }
    
        formAdmin.resetFields();
    };

    const handleDelete = (id: string) => {
        setDestinations(destinations.filter((d) => d.id !== id));
        message.success('Đã xoá');
    };

    const handleEdit = (record: any) => {
        formAdmin.setFieldsValue(record);
        setEditingId(record.id);
    };

	const removeItinerary = (id: number) => {
		setItinerary(itinerary.filter((i) => i.itId !== id));
	};

	// ================= UI =================
	return (
		<div style={{ padding: 16, background: '#f0f2f5', minHeight: '100vh' }}>
			<Card style={{ marginBottom: 16 }}>
				<Title level={3}>Travel Planner</Title>
			</Card>

			<Tabs activeKey={activeTab} onChange={setActiveTab} type='card'>

				{/* KHÁM PHÁ */}
				<Tabs.TabPane tab='Khám phá' key='1'>
					<Row gutter={[16, 16]}>
						{destinations.map((item) => (
							<Col xs={24} sm={12} md={8} key={item.id}>
								<Card
									hoverable
									cover={<img src={item.image} style={{ height: 180, objectFit: 'cover' }} />}
									actions={[
										<Button key={`add-${item.id}`} type='primary' onClick={() => addToItinerary(item)}>
											Thêm
										</Button>,
									]}
								>
									<Card.Meta
										title={item.name}
										description={
											<>
												<Tag>{item.type}</Tag>
												<Rate disabled defaultValue={item.rating} />
												<div>{item.price?.toLocaleString()} VNĐ</div>
											</>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
				</Tabs.TabPane>

				{/* LỊCH TRÌNH */}
				<Tabs.TabPane tab='Lịch trình' key='2'>
					<Row gutter={16}>
						<Col xs={24} md={16}>
							<Card>
								{itinerary.length === 0 ? (
									<Empty />
								) : (
									<List
										dataSource={itinerary}
										renderItem={(item, i) => (
											<List.Item
												actions={[
													<Button key={`remove-${item.itId}`} danger onClick={() => removeItinerary(item.itId)}>
														Xóa
													</Button>,
												]}
											>
												<List.Item.Meta
													avatar={<Avatar>{i + 1}</Avatar>}
													title={item.name}
													description={`${(
														item.food +
														item.hotel +
														item.transport
													).toLocaleString()} VNĐ`}
												/>
											</List.Item>
										)}
									/>
								)}
							</Card>
						</Col>

						<Col xs={24} md={8}>
							<Card>
								<Statistic title='Tổng tiền' value={currentTotal} />
								<InputNumber
									style={{ width: '100%' }}   
									value={budgetLimit}
									onChange={(v) => setBudgetLimit(v || 0)}
								/>
								{currentTotal > budgetLimit && (
									<Alert type='error' message='Vượt ngân sách!' />
								)}
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>

				{/* NGÂN SÁCH */}
				<Tabs.TabPane tab='Ngân sách' key='3'>
					<Row gutter={16}>
						<Col span={12}>
							<Card>
								<Pie
									data={[
										{ type: 'Ăn', value: itinerary.reduce((s, i) => s + i.food, 0) },
										{ type: 'Hotel', value: itinerary.reduce((s, i) => s + i.hotel, 0) },
										{ type: 'Transport', value: itinerary.reduce((s, i) => s + i.transport, 0) },
									]}
									angleField='value'
									colorField='type'
								/>
							</Card>
						</Col>

						<Col span={12}>
							<Card>
								<Column
									data={[
										{ name: 'Thực tế', value: currentTotal },
										{ name: 'Limit', value: budgetLimit },
									]}
									xField='name'
									yField='value'
								/>
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>

				{/* ADMIN */}
				<Tabs.TabPane tab='Admin' key='4'>
					<Row gutter={16}>
						<Col span={8}>
							<Card title='Thêm điểm'>
								<Form form={formAdmin} onFinish={handleAddDestination} layout='vertical'>
									<Form.Item name='name' label='Tên' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
									<Form.Item name='type' label='Loại'>
										<Select>
											<Option value='biển'>Biển</Option>
											<Option value='núi'>Núi</Option>
										</Select>
									</Form.Item>
									<Form.Item name='food' label='Ăn'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Form.Item name='hotel' label='Hotel'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Form.Item name='transport' label='Di chuyển'>
										<InputNumber style={{ width: '100%' }} />
									</Form.Item>
									<Button type='primary' htmlType='submit' block>
                                        {editingId ? 'Cập nhật' : 'Thêm'}
                                    </Button>

                                    {editingId && (
                                        <Button
                                            style={{ marginTop: 8 }}
                                            block
                                            onClick={() => {
                                                setEditingId(null);
                                                formAdmin.resetFields();
                                            }}
                                        >
                                            Huỷ
                                        </Button>
                                    )}
								</Form>
							</Card>
						</Col>

						<Col span={16}>
							<Card title='Danh sách'>
                            <Table
	                            dataSource={destinations}
	                            rowKey='id'
	                            columns={[
                                    { title: 'Tên', dataIndex: 'name' },
                                    { title: 'Loại', dataIndex: 'type', render: (t) => <Tag>{t}</Tag> },
                                    { title: 'Giá', dataIndex: 'price' },
                                    {
                                        title: 'Hành động',
                                        render: (_: any, record: any) => (
                                            <>
                                                <Button
                                                    type='link'
                                                    onClick={() => handleEdit(record)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    type='link'
                                                    danger
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    Xoá
                                                </Button>
                                            </>
                                        ),
                                    },
                                ]}
                            />
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default TravelPlanner;