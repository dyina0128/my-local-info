'use client';

import { useEffect } from 'react';

export default function AdBanner() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  // ID가 없거나 "나중에_입력" 이면 광고를 띄우지 않습니다.
  const showAd = adsenseId && adsenseId !== "나중에_입력" && adsenseId.trim() !== "";

  useEffect(() => {
    if (showAd) {
      try {
        // 구글 애드센스에 광고 생성을 요청하는 코드
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (err) {
        console.error("AdSense Error: ", err);
      }
    }
  }, [showAd]);

  if (!showAd) {
    return null; // 아무 영역도 렌더링하지 않아 깔끔하게 숨깁니다.
  }

  return (
    <div className="w-full my-6 flex justify-center items-center overflow-hidden bg-stone-50/50 rounded-2xl border border-stone-200/50 p-2" style={{ minHeight: '100px' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client={adsenseId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
