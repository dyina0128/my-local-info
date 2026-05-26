import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

// Date 객체를 YYYY-MM-DD 문자열로 변환하는 헬퍼 함수
function formatDate(dateVal: any): string {
  if (dateVal instanceof Date) {
    const yyyy = dateVal.getFullYear();
    const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
    const dd = String(dateVal.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal;
  }
  return '';
}

// 모든 블로그 포스트를 가져와서 날짜순으로 정렬하는 함수
export function getSortedPostsData(): PostData[] {
  // 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // 마크다운 파일의 frontmatter와 본문을 파싱합니다
      const matterResult = matter(fileContents);
      const data = matterResult.data;

      const dateStr = formatDate(data.date);

      return {
        slug,
        title: data.title || '',
        date: dateStr,
        summary: data.summary || '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        content: matterResult.content,
      };
    });

  // 날짜 기준 내림차순 정렬 (최신순)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

// 특정 블로그 포스트의 상세 데이터를 가져오는 함수
export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  const data = matterResult.data;

  const dateStr = formatDate(data.date);

  return {
    slug,
    title: data.title || '',
    date: dateStr,
    summary: data.summary || '',
    category: data.category || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    content: matterResult.content,
  };
}
