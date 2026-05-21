import localData from "../../../../public/data/local-info.json";
import Link from "next/link";
import { notFound } from "next/navigation";

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

// 🛠️ 1. Next.js 빌드 시 모든 상세 페이지 주소를 미리 생성해 두는 설정 (정적 배포 필수!)
export async function generateStaticParams() {
  const festivals: InfoItem[] = localData.festivals;
  const benefits: InfoItem[] = localData.benefits;
  const allItems = [...festivals, ...benefits];

  return allItems.map((item) => ({
    id: item.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: PageProps) {
  // Next.js 15+ 비동기 params 처리 규칙 적용
  const { id } = await params;

  const festivals: InfoItem[] = localData.festivals;
  const benefits: InfoItem[] = localData.benefits;
  const allItems = [...festivals, ...benefits];

  // 클릭해서 들어온 ID와 일치하는 데이터를 찾습니다
  const item = allItems.find((x) => x.id === id);

  // 만약 엉뚱한 주소로 들어오면 "찾을 수 없음" 안내를 보냅니다
  if (!item) {
    notFound();
  }

  const isFestival = item.category === "행사/축제";

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
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans pb-20">
      {/* 상단 헤더 */}
      <header className="border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">👈</span>
            <span className="text-sm font-semibold text-stone-600 group-hover:text-stone-900 transition-colors">
              목록으로 돌아가기
            </span>
          </Link>
          <span className="text-xs text-stone-500 font-medium">우리동네 성남 생활 정보</span>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-8 sm:p-10 space-y-8">
          
          {/* 카테고리 배지 & 제목 */}
          <div className="space-y-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
              isFestival 
                ? "bg-amber-100 text-amber-800" 
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {isFestival ? "🎉 행사/축제" : "💰 지원금/혜택"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              {item.name}
            </h1>
          </div>

          {/* 핵심 요약 정보 박스 */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 space-y-4">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider">기본 안내</h2>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-stone-200/60">
                <span className="w-24 text-stone-400 font-medium shrink-0">📅 진행 기간</span>
                <span className="text-stone-800 font-semibold">{formatPeriod(item.startDate, item.endDate)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-stone-200/60">
                <span className="w-24 text-stone-400 font-medium shrink-0">📍 장소/위치</span>
                <span className="text-stone-800 font-semibold">{item.location}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center py-2">
                <span className="w-24 text-stone-400 font-medium shrink-0">👥 신청 대상</span>
                <span className="text-stone-800 font-semibold">{item.target}</span>
              </div>
            </div>
          </div>

          {/* 상세 설명 전문 */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
              <span className="text-amber-500">📝</span> 상세 내용 소개
            </h3>
            <p className="text-stone-600 leading-relaxed text-base whitespace-pre-line bg-amber-50/20 p-6 rounded-2xl border border-amber-100/50">
              {item.summary}
              {"\n\n"}
              본 정보는 성남시청 및 공공데이터포털에서 제공하는 기초 데이터를 기반으로 작성되었습니다. 행사의 상세 일정이나 지원금 신청 요건은 지자체 사정에 따라 실시간으로 변경될 수 있으므로, 신청 및 방문 전 반드시 하단의 원본 사이트 링크를 통해 공식 공지사항을 확인해 주시기 바랍니다.
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-stone-100">
            <a 
              href={item.link}
              className={`w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-4 px-6 rounded-2xl text-white text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                isFestival 
                  ? "bg-amber-500 hover:bg-amber-600" 
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              자세히 보기 <span className="text-lg">→</span>
            </a>
            
            <Link 
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center py-4 px-8 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 rounded-2xl text-base font-semibold transition-colors"
            >
              목록으로
            </Link>
          </div>

        </article>
      </main>
    </div>
  );
}
