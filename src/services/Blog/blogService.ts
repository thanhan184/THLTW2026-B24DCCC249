import { Article, Tag, Author } from './typings';

const ARTICLES_KEY = 'blog_articles';
const TAGS_KEY = 'blog_tags';

const defaultAuthor: Author = {
  name: 'Nguyễn Văn A',
  avatar: 'https://joeschmoe.io/api/v1/random',
  bio: 'Một lập trình viên đam mê chia sẻ kiến thức.',
  skills: ['React', 'TypeScript', 'Node.js', 'Ant Design'],
  socials: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
};

const initialTags: Tag[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'TypeScript' },
  { id: '3', name: 'Web Development' },
];

const initialArticles: Article[] = [
  {
    id: '1',
    title: 'Bắt đầu với React và TypeScript',
    slug: 'bat-dau-voi-react-va-typescript',
    summary: 'Hướng dẫn cơ bản về cách sử dụng React kết hợp với TypeScript.',
    content: `## Giới thiệu\nReact và TypeScript là một bộ đôi tuyệt vời.\n\n### Tại sao nên dùng TypeScript?\n- Bắt lỗi ở thời điểm biên dịch\n- Autocomplete tốt hơn`,
    thumbnail: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    tags: [initialTags[0], initialTags[1]],
    status: 'Published',
    views: 120,
    createdAt: Date.now() - 86400000 * 2,
    author: defaultAuthor,
  },
  {
    id: '2',
    title: 'Làm chủ Ant Design v4',
    slug: 'lam-chu-ant-design-v4',
    summary: 'Các tính năng mới trong Ant Design phiên bản 4.',
    content: `## Ant Design v4 có gì mới?\nAnt Design v4 mang lại hiệu năng cao hơn và API dễ sử dụng hơn.\n\n### Form component mới\nKhông cần getFieldDecorator nữa.`,
    thumbnail: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
    tags: [initialTags[2]],
    status: 'Published',
    views: 45,
    createdAt: Date.now() - 86400000 * 5,
    author: defaultAuthor,
  },
];

// In-memory setup helper
const setupDefaultData = () => {
  if (!localStorage.getItem(TAGS_KEY)) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(initialTags));
  }
  if (!localStorage.getItem(ARTICLES_KEY)) {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(initialArticles));
  }
};

setupDefaultData();

// --- Articles API ---
export const getArticles = (
  page: number = 1,
  limit: number = 9,
  search?: string,
  tagId?: string,
  status?: string,
): { data: Article[]; total: number } => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  let filtered = [...allArticles];

  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter((a) => a.title.toLowerCase().includes(lowerSearch));
  }
  if (tagId) {
    filtered = filtered.filter((a) => a.tags.some((t) => t.id === tagId));
  }
  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }

  // Sort by createdAt descending
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    data: paginated,
    total: filtered.length,
  };
};

export const getArticleBySlug = (slug: string): Article | null => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  return allArticles.find((a) => a.slug === slug) || null;
};

export const createArticle = (article: Partial<Article>): Article => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  
  // Auto generate summary from content if not provided
  let summary = article.summary || '';
  if (!summary && article.content) {
    summary = article.content.substring(0, 150) + '...';
  }

  const newArticle: Article = {
    ...article,
    id: Date.now().toString(),
    views: 0,
    createdAt: Date.now(),
    author: defaultAuthor,
    summary,
  } as Article;

  allArticles.push(newArticle);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(allArticles));
  return newArticle;
};

export const updateArticle = (id: string, updates: Partial<Article>): Article | null => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  const index = allArticles.findIndex((a) => a.id === id);
  if (index === -1) return null;

  // Update summary if not provided but content changes or if we want to reset it
  let summary = updates.summary || allArticles[index].summary;
  if (!updates.summary && updates.content) {
    summary = updates.content.substring(0, 150) + '...';
  }

  allArticles[index] = { ...allArticles[index], ...updates, summary };
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(allArticles));
  return allArticles[index];
};

export const deleteArticle = (id: string): void => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  const filtered = allArticles.filter((a) => a.id !== id);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(filtered));
};

export const incrementArticleViews = (id: string): void => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  const index = allArticles.findIndex((a) => a.id === id);
  if (index !== -1) {
    allArticles[index].views += 1;
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(allArticles));
  }
};

export const getRelatedArticles = (article: Article, limit: number = 3): Article[] => {
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  const tagIds = article.tags.map(t => t.id);
  
  const related = allArticles.filter(a => 
    a.id !== article.id && 
    a.status === 'Published' &&
    a.tags.some(t => tagIds.includes(t.id))
  );

  return related.slice(0, limit);
};

// --- Tags API ---
export const getTags = (): Tag[] => {
  return JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
};

export const createTag = (name: string): Tag => {
  const tags = getTags();
  const newTag: Tag = {
    id: Date.now().toString(),
    name,
  };
  tags.push(newTag);
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  return newTag;
};

export const updateTag = (id: string, name: string): Tag | null => {
  const tags = getTags();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tags[index].name = name;
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  
  // Need to update tags within articles as well!
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  let updatedArticles = false;
  allArticles.forEach(a => {
    const tIdx = a.tags.findIndex(t => t.id === id);
    if(tIdx !== -1) {
      a.tags[tIdx].name = name;
      updatedArticles = true;
    }
  });
  if(updatedArticles) {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(allArticles));
  }

  return tags[index];
};

export const deleteTag = (id: string): void => {
  const tags = getTags();
  const filtered = tags.filter((t) => t.id !== id);
  localStorage.setItem(TAGS_KEY, JSON.stringify(filtered));

  // Also remove this tag from all articles
  const allArticles: Article[] = JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]');
  let updatedArticles = false;
  allArticles.forEach(a => {
    const originalLength = a.tags.length;
    a.tags = a.tags.filter(t => t.id !== id);
    if(a.tags.length !== originalLength) {
      updatedArticles = true;
    }
  });
  if(updatedArticles) {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(allArticles));
  }
};

export const getTagStats = () => {
    const tags = getTags();
    const articles = getArticles(1, 9999).data;
    return tags.map(tag => {
        const count = articles.filter(a => a.tags.some(t => t.id === tag.id)).length;
        return { ...tag, articleCount: count };
    });
};
