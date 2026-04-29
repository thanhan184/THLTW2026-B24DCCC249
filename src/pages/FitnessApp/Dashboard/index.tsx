import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Timeline, Typography, Tag } from 'antd';
import { Column, Line } from '@ant-design/plots';
import moment from 'moment';
import { FitnessStorage, Workout, HealthMetric, Goal } from '../../../services/FitnessApp/storage';
import { FireOutlined, TrophyOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './index.less';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setWorkouts(FitnessStorage.getWorkouts());
    setMetrics(FitnessStorage.getMetrics());
    setGoals(FitnessStorage.getGoals());
  }, []);

  // Quick Stats Calculations
  const currentMonthStart = moment().startOf('month');
  const workoutsThisMonth = workouts.filter(
    (w) => w.status === 'Hoàn thành' && moment(w.date).isSameOrAfter(currentMonthStart)
  );

  const totalCaloriesThisMonth = workoutsThisMonth.reduce((acc, curr) => acc + curr.calories, 0);

  // Calculate Streak
  let streak = 0;
  let checkDate = moment();
  const sortedCompletedWorkouts = [...workouts]
    .filter(w => w.status === 'Hoàn thành')
    .map(w => moment(w.date).format('YYYY-MM-DD'))
    .sort((a, b) => moment(b).valueOf() - moment(a).valueOf());
  
  const uniqueDates = Array.from(new Set(sortedCompletedWorkouts));
  
  if (uniqueDates.includes(checkDate.format('YYYY-MM-DD'))) {
    streak++;
    checkDate.subtract(1, 'days');
  } else if (uniqueDates.includes(checkDate.subtract(1, 'days').format('YYYY-MM-DD'))) {
    streak++;
    checkDate.subtract(1, 'days');
  }

  while (uniqueDates.includes(checkDate.format('YYYY-MM-DD'))) {
    streak++;
    checkDate.subtract(1, 'days');
  }

  // Calculate Goal Completion (%)
  let goalCompletion = 0;
  if (goals.length > 0) {
    const completedGoals = goals.filter((g) => g.status === 'Đã đạt').length;
    goalCompletion = Math.round((completedGoals / goals.length) * 100);
  }

  // Bar Chart Data (Workouts per week in month)
  // Weeks will be 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'
  const weekData = [
    { week: 'Tuần 1', count: 0 },
    { week: 'Tuần 2', count: 0 },
    { week: 'Tuần 3', count: 0 },
    { week: 'Tuần 4', count: 0 },
    { week: 'Tuần 5', count: 0 }, // For some months
  ];

  workoutsThisMonth.forEach((w) => {
    const weekIndex = Math.floor(moment(w.date).date() / 7);
    if (weekData[weekIndex]) {
      weekData[weekIndex].count++;
    }
  });

  const activeWeekData = weekData.filter((w) => w.count > 0 || w.week !== 'Tuần 5');

  const columnConfig = {
    data: activeWeekData,
    xField: 'week',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      count: {
        alias: 'Số buổi tập',
      },
    },
    color: '#1890ff',
  };

  // Line Chart Data (Weight over time)
  const weightData = metrics
    .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
    .map((m) => ({
      date: moment(m.date).format('DD/MM'),
      weight: m.weight,
    }));

  const lineConfig = {
    data: weightData,
    xField: 'date',
    yField: 'weight',
    point: {
      size: 5,
      shape: 'diamond',
    },
    meta: {
      weight: {
        alias: 'Cân nặng (kg)',
      },
    },
    color: '#52c41a',
  };

  // Recent 5 Workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
    .slice(0, 5);

  return (
    <div className="fitness-dashboard">
      <Title level={2}>Tổng quan sức khỏe</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="metric-card">
            <Statistic
              title="Tổng buổi tập tháng"
              value={workoutsThisMonth.length}
              prefix={<SyncOutlined className="icon-blue" />}
              suffix="buổi"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="metric-card">
            <Statistic
              title="Calo đã đốt"
              value={totalCaloriesThisMonth}
              prefix={<FireOutlined className="icon-red" />}
              suffix="kcal"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="metric-card">
            <Statistic
              title="Streak liên tiếp"
              value={streak}
              prefix={<TrophyOutlined className="icon-gold" />}
              suffix="ngày"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="metric-card">
            <Statistic
              title="Hoàn thành mục tiêu"
              value={goalCompletion}
              prefix={<CheckCircleOutlined className="icon-green" />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Số buổi tập theo tuần (Tháng này)" 
            bordered={false} 
            style={{ marginBottom: 16 }}
            className="chart-card"
          >
            {activeWeekData.length > 0 ? (
              // @ts-ignore
              <Column {...columnConfig} height={250} />
            ) : (
              <div className="empty-chart">Chưa có dữ liệu tháng này</div>
            )}
          </Card>
          <Card 
            title="Sự thay đổi cân nặng" 
            bordered={false}
            className="chart-card"
          >
            {weightData.length > 0 ? (
              // @ts-ignore
              <Line {...lineConfig} height={250} />
            ) : (
              <div className="empty-chart">Chưa có dữ liệu cân nặng</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="5 buổi tập gần nhất" bordered={false} className="timeline-card">
            {recentWorkouts.length > 0 ? (
              <Timeline style={{ marginTop: 10 }}>
                {recentWorkouts.map((workout) => (
                  <Timeline.Item 
                    key={workout.id} 
                    color={workout.status === 'Hoàn thành' ? 'green' : 'red'}
                  >
                    <div className="timeline-content">
                      <Text strong>{moment(workout.date).format('DD/MM/YYYY')}</Text>{' '}
                      <Tag color="cyan">{workout.type}</Tag> <br />
                      <Text type="secondary">{workout.duration} phút - {workout.calories} kcal</Text>
                      {workout.notes && (
                        <div><Text italic className="workout-note">{workout.notes}</Text></div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text type="secondary">Chưa có buổi tập nào</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
