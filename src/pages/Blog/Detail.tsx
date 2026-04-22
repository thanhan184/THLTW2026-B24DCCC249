import React, { useEffect, useState } from 'react';
import { Card, Button, Tag, Space, Divider, Row, Col, Avatar, Typography, Spin } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'umi';
import moment from 'moment';
import { getArticleBySlug, incrementArticleViews, getRelatedArticles } from '@/services/Blog/blogService';
import type { Article } from '@/services/Blog/typings';

const { Title, Text } = Typography;

// Simple markdown to raw html component. Ideally use react-markdown
const MarkdownRenderer = ({ content }: { content: string }) => {
  const createHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' style='max-width:100%' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
      .replace(/\n$/gim, '<br />');

    const paragraphs = html.split('\n\n').map(p => {
       if (p.startsWith('<h') || p.startsWith('<li')) return p;
       return p.split('\n').join('<br/>');
    });
    return paragraphs.join('<br/><br/>');
  };

  return <div dangerouslySetInnerHTML={{ __html: createHtml(content) }} style={{ fontSize: '16px', lineHeight: 1.8 }} />;
};

const Detail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const history = useHistory();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      const data = getArticleBySlug(slug);
      if (data) {
        incrementArticleViews(data.id);
        const updatedData = getArticleBySlug(slug);
        setArticle(updatedData);
        if (updatedData) {
          setRelated(getRelatedArticles(updatedData, 3));
        }
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (!article) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Title level={3}>Bài viết không tồn tại!</Title><Button onClick={() => history.goBack()}>Quay lại</Button></div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => history.push('/blog/home')}
        style={{ marginBottom: 24, padding: 0 }}
      >
        Quay lại danh sách
      </Button>

      <Card bordered={false} style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Title level={1} style={{ marginBottom: 16 }}>{article.title}</Title>
        <Space size="large" style={{ marginBottom: 24, color: '#888' }} wrap>
          <Space>
            <Avatar src={article.author.avatar} size="small" />
            <Text>{article.author.name}</Text>
          </Space>
          <Space><CalendarOutlined /> {moment(article.createdAt).format('DD/MM/YYYY HH:mm')}</Space>
          <Space><EyeOutlined /> {article.views} lượt xem</Space>
        </Space>
        
        <div style={{ marginBottom: 32 }}>
          {article.tags.map(tag => (
            <Tag color="cyan" key={tag.id}>{tag.name}</Tag>
          ))}
        </div>

        {article.thumbnail && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src={article.thumbnail} alt={article.title} style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 500, objectFit: 'cover' }} />
          </div>
        )}

        <Divider />
        
        <div className="article-content">
          <MarkdownRenderer content={article.content} />
        </div>
      </Card>

      {related.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <Title level={3}>Bài viết liên quan</Title>
          <Row gutter={[16, 16]}>
            {related.map(rel => (
              <Col xs={24} sm={8} key={rel.id}>
                <Card 
                  hoverable 
                  size="small"
                  cover={<img alt={rel.title} src={rel.thumbnail || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} style={{ height: 120, objectFit: 'cover' }} />}
                  onClick={() => history.push(`/blog/post/${rel.slug}`)}
                >
                  <Card.Meta 
                    title={<div style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 14 }}>{rel.title}</div>} 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default Detail;
