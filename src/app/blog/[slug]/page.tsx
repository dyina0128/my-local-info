import { getSortedPostsData, getPostData } from "../../../lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AdBanner from "../../../components/AdBanner";


export const dynamicParams = false;

// 🛠️ 1. 빌드 시 모든 상세 페이지 경로(slug)를 미리 생성해 둡니다 (정적 배포를 위해 필수)
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  if (posts.length === 0) {
    return [{ slug: "placeholder" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  // Next.js 15+ 규격에 따른 비동기 params 처리
  const { slug } = await params;
  
  const post = getPostData(slug);

  // 일치하는 글이 없다면 404 페이지로 안내합니다
  if (!post) {
    notFound();
  }

  // 날짜 포맷 변환기 (2026-05-26 -> 5월 26일)
  const formatDate = (dateStr: string) => {
    try {
      const [, month, day] = dateStr.split("-");
      return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans pb-20">
      {/* 헤더 */}
      <header className="border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">👈</span>
            <span className="text-sm font-semibold text-stone-600 group-hover:text-stone-900 transition-colors">
              블로그 목록으로
            </span>
          </Link>
          <span className="text-xs text-stone-500 font-medium">🏡 동네 생활 백서</span>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* 카테고리 배지 & 제목 & 작성일 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  📂 {post.category}
                </span>
              )}
              <span className="text-xs text-stone-400 font-medium">
                🗓️ {formatDate(post.date)} 작성
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              {post.title}
            </h1>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 📝 마크다운 상세 내용 렌더링 영역 */}
          <div className="pt-6 border-t border-stone-100">
            <div className="prose prose-stone prose-amber max-w-none text-stone-700 leading-relaxed text-sm sm:text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* 구글 애드센스 광고 영역 */}
          <AdBanner />

          {/* 구분선 */}
          <hr className="border-t border-stone-100 pt-2" />

          {/* 💰 수익화 배너 영역 (광고 배너 시뮬레이션) */}
          <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/70 text-center space-y-4 mt-8">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-widest">💡 오늘의 추천 생활 꿀템</p>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">이 글과 관련된 가성비 최고의 생활용품 추천</h4>
            <p className="text-[11px] text-stone-400 leading-relaxed max-w-md mx-auto">
              "이 포스팅은 파트너스 활동의 일환으로, 구매 발생 시 이에 따른 일정액의 수수료를 제공받아 사이트 운영에 큰 도움이 됩니다."
            </p>
            <a 
              href="https://link.coupang.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              추천 생활 상품 구경하기 👉
            </a>
          </div>

          {/* 하단 네비게이션 버튼 */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-100">
            <Link 
              href="/blog"
              className="inline-flex items-center justify-center py-3.5 px-8 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 rounded-2xl text-sm font-semibold transition-colors"
            >
              목록으로 돌아가기
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center justify-center py-3.5 px-8 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-2xl text-sm font-semibold transition-colors"
            >
              메인 홈으로 가기
            </Link>
          </div>

        </article>
      </main>
    </div>
  );
}
