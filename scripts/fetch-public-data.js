const fs = require('fs');
const path = require('path');

// 파일 경로 설정
const localInfoPath = path.join(__dirname, '..', 'public', 'data', 'local-info.json');

// 🔑 환경변수에서 인증키 가져오기 (process.env 사용)
const publicDataApiKey = process.env.PUBLIC_DATA_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!publicDataApiKey) {
  console.error("❌ 에러: PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}
if (!geminiApiKey) {
  console.error("❌ 에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

// [2단계 준비] 기존 local-info.json 데이터 읽기
let localData = { festivals: [], benefits: [], lastUpdated: "" };
if (fs.existsSync(localInfoPath)) {
  try {
    localData = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));
  } catch (err) {
    console.error("⚠️ 기존 local-info.json을 읽는 중 오류가 발생했습니다.", err);
  }
}

// 중복 추가 방지를 위해 기존에 등록된 서비스명 수집
const existingNames = new Set([
  ...localData.festivals.map(x => x.name.trim()),
  ...localData.benefits.map(x => x.name.trim())
]);

async function run() {
  try {
    // [1단계] 공공데이터포털 API에서 데이터 가져오기 (명시된 엔드포인트 및 파라미터 사용)
    const publicDataUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(publicDataApiKey)}`;
    
    console.log("📡 공공데이터포털 API 호출 중...");
    const response = await fetch(publicDataUrl, {
      method: "GET",
      headers: {
        "Authorization": `Infuser ${publicDataApiKey}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`공공데이터 API 호출 실패 (상태 코드: ${response.status}): ${errText}`);
    }

    const resData = await response.json();
    const items = resData.data || [];

    if (items.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // 1단계 필터링 매칭을 위한 헬퍼 함수
    const containsKeyword = (item, keyword) => {
      const fields = [
        item.서비스명,
        item.서비스목적요약,
        item.지원대상,
        item.소관기관명
      ];
      return fields.some(field => field && field.includes(keyword));
    };

    let filteredItems = [];

    // 1. 성남 포함 항목 필터링
    filteredItems = items.filter(item => containsKeyword(item, "성남"));

    // 2. 성남이 없으면 경기 포함 항목 필터링
    if (filteredItems.length === 0) {
      filteredItems = items.filter(item => containsKeyword(item, "경기"));
    }

    // 3. 경기도 없으면 전체 데이터 사용
    if (filteredItems.length === 0) {
      filteredItems = items;
    }

    // [2단계] 기존 데이터와 비교 (name 기준 중복 제거)
    const newItems = filteredItems.filter(item => {
      const name = (item.서비스명 || "").trim();
      return name && !existingNames.has(name);
    });

    // 새로운 항목이 전혀 없으면 종료
    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // 새로운 항목 1개만 선택해서 가공 대상으로 선정
    const targetItem = newItems[0];
    console.log(`✨ 새롭게 추가할 공공데이터 선정 완료: ${targetItem.서비스명}`);

    // 오늘 날짜 추출 (한국 시간 기준)
    const offset = 9 * 60;
    const localDate = new Date(new Date().getTime() + offset * 60 * 1000);
    const todayStr = localDate.toISOString().split('T')[0];

    // [3단계] Gemini AI로 새 항목 1개만 가공
    const geminiPrompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜인 ${todayStr}, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(targetItem, null, 2)}`;

    console.log("🤖 Gemini AI에게 데이터 정제 및 규격 변환을 요청하는 중...");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json" // 항상 완벽한 JSON 형식으로 출력하도록 강제합니다.
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API 호출 실패 (상태 코드: ${geminiResponse.status}): ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    let responseText = geminiData.candidates[0].content.parts[0].text.trim();

    // 혹시라도 마크다운 기호 \`\`\`json 이 붙어서 왔다면 정제해 줍니다.
    if (responseText.startsWith("```json")) {
      responseText = responseText.substring(7);
    }
    if (responseText.endsWith("```")) {
      responseText = responseText.substring(0, responseText.length - 3);
    }
    responseText = responseText.trim();

    // AI가 정제한 최종 데이터 분석
    const cleanItem = JSON.parse(responseText);

    // [4단계] 기존 데이터에 추가
    // 카테고리 매핑 및 고유한 새 ID 발급
    const categoryVal = cleanItem.category === "행사" ? "행사/축제" : "지원금/혜택";
    const uniqueId = `${cleanItem.category === "행사" ? "f" : "b"}-${Date.now()}`;

    const finalItem = {
      id: uniqueId,
      name: cleanItem.name || targetItem.서비스명,
      category: categoryVal,
      startDate: cleanItem.startDate || todayStr,
      endDate: cleanItem.endDate || "상시",
      location: cleanItem.location || targetItem.소관기관명 || "상세내용 참조",
      target: cleanItem.target || targetItem.지원대상 || "성남시 거주 시민",
      summary: cleanItem.summary || targetItem.서비스목적요약 || "",
      link: cleanItem.link || targetItem.상세URL || "#"
    };

    // 카테고리에 맞는 배열에 추가
    if (cleanItem.category === "행사") {
      localData.festivals.push(finalItem);
    } else {
      localData.benefits.push(finalItem);
    }

    // 마지막 업데이트일 갱신
    localData.lastUpdated = todayStr;

    // 데이터 저장
    fs.writeFileSync(localInfoPath, JSON.stringify(localData, null, 2), 'utf-8');
    
    console.log(`✅ 공공데이터 자동 가공 및 local-info.json 추가 완료!`);
    console.log(`- 추가된 항목: ${finalItem.name} (${finalItem.category})`);

  } catch (error) {
    console.error("❌ 공공데이터 수집 및 가공 중 오류 발생 (기존 데이터는 보존됩니다):", error);
  }
}

run();
