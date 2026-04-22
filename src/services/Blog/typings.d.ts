export interface Tag {
  id: string;
  name: string;
}

export interface Author {
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  socials: {
    github?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  thumbnail: string;
  tags: Tag[];
  status: 'Draft' | 'Published';
  views: number;
  createdAt: number;
  author: Author;
}
