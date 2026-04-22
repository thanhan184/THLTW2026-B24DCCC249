import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Pagination, Input, Tag, Space, Empty, Spin } from 'antd';
import { SearchOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { getArticles, getTags } from '@/services/Blog/blogService';
import type { Article, Tag as TagType } from '@/services/Blog/typings';

const { Meta } = Card;

const Home: React.FC = () => {
  const history = useHistory();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // Filters
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const fetchArticles = useCallback((page: number, keyword: string, tagId?: string) => {
    setLoading(true);
    const { data, total } = getArticles(page, 9, keyword, tagId, 'Published');
    setArticles(data);
    setTotal(total);
    setLoading(false);
  }, []);

  const fetchTags = () => {
    const data = getTags();
    setTags(data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchArticles(currentPage, searchKeyword, selectedTag);
  }, [currentPage, searchKeyword, selectedTag, fetchArticles]);

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  }, 300);

  const handleTagClick = (tagId?: string) => {
    setSelectedTag(selectedTag === tagId ? undefined : tagId);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Space wrap>
            <Tag.CheckableTag
              checked={!selectedTag}
              onChange={() => handleTagClick(undefined)}
            >
              Tất cả
            </Tag.CheckableTag>
            {tags.map((tag) => (
              <Tag.CheckableTag
                key={tag.id}
                checked={selectedTag === tag.id}
                onChange={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </Tag.CheckableTag>
            ))}
          </Space>
        </Col>
        <Col>
          <Input
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
        </Col>
      </Row>

      <Spin spinning={loading}>
        {articles.length === 0 ? (
          <Empty description="Không tìm thấy bài viết nào" />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {articles.map((article) => (
                <Col xs={24} sm={12} md={8} key={article.id}>
                  <Card
                    hoverable
                    cover={<img alt={article.title} src={article.thumbnail || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} style={{ height: 200, objectFit: 'cover' }} />}
                    onClick={() => history.push(`/blog/post/${article.slug}`)}
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    actions={[
                      <Space key="author"><UserOutlined /> {article.author.name}</Space>,
                      <Space key="date"><CalendarOutlined /> {moment(article.createdAt).format('DD/MM/YYYY')}</Space>,
                    ]}
                  >
                    <Meta
                      title={<div style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>}
                      description={
                        <div style={{ marginTop: 12 }}>
                          <div style={{ marginBottom: 12 }}>
                            {article.tags.map(tag => (
                              <Tag key={tag.id} color="blue">{tag.name}</Tag>
                            ))}
                          </div>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#666' }}>
                            {article.summary}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={currentPage}
                pageSize={9}
                total={total}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default Home;
