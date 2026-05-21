import localData from "../../public/data/local-info.json";
import Link from "next/link";

interface InfoItem {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export default function Home() {
  const festivals: InfoItem[] = localData.festivals;
  const benefits: InfoItem[] = localData.benefits;
  const lastUpdated = localData.lastUpdated;

  // 날짜 형식 변환기 (2026-04-05 -> 4월 5일)
  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
  };

  // 날짜 범위 표시기
  const formatPeriod = (start: string, end: string) => {
    if (start === end) return formatDate(start);
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* 상단 띠 배너 */}
      <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium px-4">
        📢 실시간 성남시 축제 및 혜택 정보를 한눈에 확인하세요!
      </div>

      {/* 헤더 */}
      <header className="border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <h1 className="text-2xl font-bold text-amber-900 tracking-tight">
                우리동네 <span className="text-amber-600">성남 생활 정보</span>
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">공공데이터와 AI가 배달하는 매일의 소식</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-full text-sm font-medium text-stone-600">
            <Link href="/" className="px-4 py-1.5 rounded-full bg-white text-amber-600 shadow-sm">
              홈
            </Link>
            <a href="#" className="px-4 py-1.5 rounded-full hover:text-stone-900 transition-colors">
              AI 블로그
            </a>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        
        {/* 1. 이번 달 행사/축제 섹션 */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
            <span className="text-2xl">🌸</span>
            <h2 className="text-xl font-bold text-stone-900">이번 달 행사 / 축제</h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold ml-2">
              총 {festivals.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals.map((item) => (
              <article 
                key={item.id} 
                className="group flex flex-col justify-between bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
                      🎉 {item.category}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      📍 {item.location}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-600 transition-colors mb-2">
                    {item.name}
                  </h3>
                  
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 mb-6">
                    {item.summary}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-4 mt-auto">
                  <div className="text-xs text-stone-500 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-stone-400">📅 기간:</span>
                      <span className="text-stone-700 font-semibold">{formatPeriod(item.startDate, item.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-stone-400">👥 대상:</span>
                      <span className="text-stone-700 font-semibold">{item.target}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/detail/${item.id}`}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-xl text-sm font-semibold transition-colors"
                  >
                    자세히 보기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 2. 지원금/혜택 섹션 */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
            <span className="text-2xl">🎁</span>
            <h2 className="text-xl font-bold text-stone-900">맞춤형 지원금 / 혜택</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold ml-2">
              총 {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {benefits.map((item) => (
              <article 
                key={item.id} 
                className="group flex flex-col justify-between bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                      💰 {item.category}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      📍 {item.location}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-600 transition-colors mb-2">
                    {item.name}
                  </h3>
                  
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 mb-6">
                    {item.summary}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-4 mt-auto">
                  <div className="text-xs text-stone-500 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-stone-400">👥 대상:</span>
                      <span className="text-stone-700 font-semibold">{item.target}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/detail/${item.id}`}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-xl text-sm font-semibold transition-colors"
                  >
                    지원 혜택 자세히 보기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* 푸터 */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-20 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-1">우리동네 성남 생활 정보</h4>
            <p className="text-xs">이 사이트는 성남시 지역 정보 및 지원금 소식을 전하는 유용한 공간입니다.</p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs">데이터 출처: 공공데이터포털(data.go.kr) Open API</p>
            <p className="text-xs text-stone-500">마지막 데이터 업데이트: {lastUpdated}</p>
            <p className="text-[10px] text-stone-600 mt-2">© 2026 우리동네 생활 정보. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
