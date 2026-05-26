import { getSortedPostsData } from "../../lib/posts";
import Link from "next/link";

export default function BlogListPage() {
  const posts = getSortedPostsData();

  // 날짜 포맷팅 변환기 (2026-05-26 -> 5월 26일)
  const formatDate = (dateStr: string) => {
    try {
      const [, month, day] = dateStr.split("-");
      return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans flex flex-col justify-between">
      <div>
        {/* 상단 띠 배너 */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center py-2 text-sm font-medium px-4">
          📢 우리 동네 복지 혜택과 생활 속 유용한 정보를 읽기 쉽게 정리해 드립니다.
        </div>

        {/* 헤더 */}
        <header className="border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-3xl group-hover:rotate-12 transition-transform duration-200">🏡</span>
              <div>
                <h1 className="text-2xl font-bold text-amber-900 tracking-tight">
                  우리동네 <span className="text-amber-600">성남 생활 정보</span>
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">공공데이터와 AI가 배달하는 매일의 소식</p>
              </div>
            </Link>
            <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-full text-sm font-medium text-stone-600">
              <Link href="/" className="px-4 py-1.5 rounded-full hover:text-stone-900 transition-colors">
                홈
              </Link>
              <Link href="/blog" className="px-4 py-1.5 rounded-full bg-white text-amber-600 shadow-sm">
                블로그
              </Link>
            </nav>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {/* 블로그 대타이틀 */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-4xl">📝</span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              유용한 <span className="text-amber-600">동네 생활 백서</span>
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              복잡한 정부 혜택과 우리 동네의 축제/지원 정보 소식을 하나씩 정성스레 모아 읽기 좋은 블로그 글로 전해 드립니다.
            </p>
          </div>

          {/* 목록 카드 리스트 */}
          <div className="space-y-8">
            {posts.length === 0 ? (
              <div className="text-center py-24 bg-white border border-stone-200/80 rounded-3xl space-y-4 shadow-sm">
                <span className="text-5xl">📭</span>
                <p className="text-stone-500 font-semibold">아직 등록된 블로그 글이 없습니다.</p>
                <p className="text-xs text-stone-400">새로운 유익한 소식들을 곧 준비해서 배달해 드릴게요!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="group bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {post.category && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs text-stone-400 font-medium">
                        🗓️ {formatDate(post.date)}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-stone-950 group-hover:text-amber-600 transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    {/* summary 필드를 블로그 목록의 미리보기 텍스트로 사용 */}
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700"
                    >
                      전체 글 보기 <span className="text-xs">➔</span>
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-20 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-1">우리동네 성남 생활 정보</h4>
            <p className="text-xs">이 사이트는 성남시 지역 정보 및 지원금 소식을 전하는 유용한 공간입니다.</p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs">데이터 출처: 공공데이터포털(data.go.kr) 및 AI 자동화 엔진</p>
            <p className="text-[10px] text-stone-600 mt-2">© 2026 우리동네 생활 정보. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
