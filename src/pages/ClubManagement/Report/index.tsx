import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { useModel } from 'umi';
import Chart from 'react-apexcharts';
import { TeamOutlined, UsergroupAddOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ReportPage: React.FC = () => {
  const { clubs, applications } = useModel('clubManagement');

  const totalClubs = clubs.length;
  const totalPending = applications.filter(a => a.status === 'Pending').length;
  const totalApproved = applications.filter(a => a.status === 'Approved').length;
  const totalRejected = applications.filter(a => a.status === 'Rejected').length;

  // Prepare data for ColumnChart
  const categories = clubs.map(c => c.name);
  const pendingData = clubs.map(c => {
    return applications.filter(a => a.clubId === c.id && a.status === 'Pending').length;
  });
  const approvedData = clubs.map(c => {
    return applications.filter(a => a.clubId === c.id && a.status === 'Approved').length;
  });
  const rejectedData = clubs.map(c => {
    return applications.filter(a => a.clubId === c.id && a.status === 'Rejected').length;
  });

  const chartOptions: any = {
    chart: {
      type: 'bar',
      height: 400,
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
      title: {
        text: 'Câu lạc bộ'
      }
    },
    yaxis: {
      title: {
        text: 'Số lượng đơn đăng ký'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: any) {
          return val + " đơn"
        }
      }
    },
    colors: ['#1890ff', '#52c41a', '#ff4d4f'],
    title: {
      text: 'Thống kê đơn đăng ký theo CLB',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      }
    }
  };

  const chartSeries = [
    {
      name: 'Pending',
      data: pendingData
    },
    {
      name: 'Approved',
      data: approvedData
    },
    {
      name: 'Rejected',
      data: rejectedData
    }
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh', borderRadius: 8 }}>
      <Title level={4} style={{ marginBottom: 24 }}>Báo cáo và Thống kê</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số CLB"
              value={totalClubs}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn Pending"
              value={totalPending}
              prefix={<UsergroupAddOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn Approved"
              value={totalApproved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn Rejected"
              value={totalRejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24, borderRadius: 8 }}>
        {(typeof window !== 'undefined') && (
          <Chart options={chartOptions} series={chartSeries} type="bar" height={400} />
        )}
      </Card>
    </div>
  );
};

export default ReportPage;
