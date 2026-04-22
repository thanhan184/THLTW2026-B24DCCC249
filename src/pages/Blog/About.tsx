import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Avatar, Typography, Tag, Space, Divider } from 'antd';
import { GithubOutlined, TwitterOutlined, FacebookOutlined, LinkedinOutlined, UserOutlined } from '@ant-design/icons';
import { getArticles } from '@/services/Blog/blogService';
import type { Author } from '@/services/Blog/typings';

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    const articles = getArticles(1, 1).data;
    if (articles.length > 0) {
      setAuthor(articles[0].author);
    } else {
        // Fallback default info if no articles exist
        setAuthor({
            name: 'Nguyễn Văn A',
            avatar: 'https://joeschmoe.io/api/v1/random',
            bio: 'Một lập trình viên đam mê chia sẻ kiến thức.',
            skills: ['React', 'TypeScript', 'Node.js', 'Ant Design'],
            socials: {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
            },
        });
    }
  }, []);

  if (!author) return <div style={{ textAlign: 'center', padding: 50 }}>Đang tải...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Row gutter={32} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar size={150} src={author.avatar} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <Title level={3} style={{ marginBottom: 0 }}>{author.name}</Title>
            <Space style={{ marginTop: 16, fontSize: 24, color: '#1890ff' }}>
              {author.socials.github && <a href={author.socials.github} target="_blank" rel="noreferrer"><GithubOutlined /></a>}
              {author.socials.twitter && <a href={author.socials.twitter} target="_blank" rel="noreferrer"><TwitterOutlined /></a>}
              {author.socials.facebook && <a href={author.socials.facebook} target="_blank" rel="noreferrer"><FacebookOutlined /></a>}
              {author.socials.linkedin && <a href={author.socials.linkedin} target="_blank" rel="noreferrer"><LinkedinOutlined /></a>}
            </Space>
          </Col>
          <Col xs={24} sm={16}>
            <Title level={4}>Giới thiệu</Title>
            <Paragraph style={{ fontSize: 16 }}>
              {author.bio}
            </Paragraph>
            <Divider />
            <Title level={4}>Kỹ năng</Title>
            <div>
              {author.skills.map(skill => (
                <Tag color="geekblue" key={skill} style={{ margin: '4px 8px 4px 0', padding: '4px 12px', fontSize: 14 }}>
                  {skill}
                </Tag>
              ))}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default About;
