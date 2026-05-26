const fs = require('fs');
const path = require('path');

// 파일 경로 설정
const blogFilePath = path.join(__dirname, '..', 'public', 'data', 'blog.json');
const localInfoFilePath = path.join(__dirname, '..', 'public', 'data', 'local-info.json');

// 🔑 Gemini API 키 검사
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ 에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  console.error("로컬 테스트 중이라면: $env:GEMINI_API_KEY='내키' 명령어로 키를 등록하고 실행하세요.");
  process.exit(1);
}

// 1. 기존 블로그 글 데이터 읽기
let blogs = [];
if (fs.existsSync(blogFilePath)) {
  try {
    blogs = JSON.parse(fs.readFileSync(blogFilePath, 'utf-8'));
  } catch (err) {
    console.error("⚠️ 기존 blog.json을 읽는 중 오류가 발생했습니다. 새로 만듭니다.", err);
  }
}

// 2. 기존 사이트 행사/지원금 목록 읽기 (AI 참고용)
let localInfo = { festivals: [], benefits: [] };
if (fs.existsSync(localInfoFilePath)) {
  try {
    localInfo = JSON.parse(fs.readFileSync(localInfoFilePath, 'utf-8'));
  } catch (err) {
    console.error("⚠️ local-info.json을 읽는 중 오류가 발생했습니다.", err);
  }
}

// 중복된 글 작성을 피하기 위해 기존 작성된 제목들 수집
const existingTitles = blogs.map(b => b.title).join(', ');
const infoSummary = JSON.stringify(localInfo, null, 2);

// 3. AI 비서에게 지시할 프롬프트(주문서) 준비
const prompt = `
당신은 대한민국 성남시의 소식과 유용한 정부 지원금을 전하는 친절하고 꼼꼼한 AI 전문 블로그 에디터입니다.
우리 사이트에 방문하는 성남시민들이 한눈에 유용한 정보를 얻을 수 있도록 오늘 날짜 기준으로 아주 알차고 실속 있는 정부 지원금, 복지 혜택, 혹은 주요 행사/축제 관련 블로그 글을 딱 1개만 작성해 주세요.

현재 우리 웹사이트의 기초 정보 목록은 다음과 같습니다 (이를 참고하거나 확장하여 작성하세요):
${infoSummary}

이미 작성된 블로그 제목 목록 (이 제목들과 유사하거나 겹치지 않는 새로운 유용한 내용을 작성해 주세요):
${existingTitles}

[작성 지침]
1. 성남시 거주 청년, 소상공인, 신혼부부, 육아 가정, 어르신 등 다양한 계층 중 하나를 타겟으로 실제 존재하는 유용한 지원금이나 축제를 상세히 설명해 주세요. (예: 성남사랑상품권 특별할인, 소상공인 새출발기금, 성남시 산후조리비 지원, 청년 면접수당 등)
2. 글의 톤앤매너: 친근하고(존댓말 '~해요', '~랍니다' 사용), 전문적이며, 이모지를 적절히 사용하여 읽기 쉽게 작성해 주세요.
3. 반드시 아래의 JSON 형식으로만 응답해 주셔야 합니다. JSON 외의 다른 설명 텍스트나 markdown 코드 블록 표시(\`\`\`json ...)는 넣지 마세요.

[JSON 구조]
{
  "title": "사람들의 이목을 끄는 매력적이고 구체적인 블로그 글 제목 (예: '2026년 성남시 소상공인 특례보증 신청법, 선착순 500만원 지원!')",
  "category": "지원금/혜택" 또는 "행사/축제",
  "excerpt": "글의 내용을 요약한 2~3문장의 짧은 설명 (목록 화면에서 노출됨)",
  "content": "상세 블로그 본문 (Markdown 형식). 이모지를 적극적으로 사용하고 가독성 좋게 단락과 목록을 나누어 작성해 주세요. 1. 지원 대상 및 금액, 2. 자격 요건, 3. 신청 방법, 4. 준비 서류 및 주의사항 순서로 구체적으로 작성해 주세요."
}
`;

// 4. Gemini API 호출 및 글 작성 시작
async function generatePost() {
  console.log("🤖 Gemini AI에게 오늘의 소식 작성을 요청하는 중입니다...");
  try {
    // 2.5 Flash 모델 API 주소 설정
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json" // 항상 정확한 JSON으로만 결과가 나오게 강제합니다.
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 호출 실패 (상태 코드: ${response.status}): ${errText}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text.trim();
    
    // 혹시라도 마크다운 기호 \`\`\`json 이 붙어서 왔다면 정제해 줍니다.
    if (responseText.startsWith("```json")) {
      responseText = responseText.substring(7);
    }
    if (responseText.endsWith("```")) {
      responseText = responseText.substring(0, responseText.length - 3);
    }
    responseText = responseText.trim();

    // AI가 반환한 JSON 데이터 분석
    const newPost = JSON.parse(responseText);

    // 고유 ID 생성 (밀리초 단위 조합)
    const newId = `blog-${Date.now()}`;
    
    // 오늘 날짜 추출 (한국 시간 기준)
    const offset = 9 * 60; // UTC+9
    const localDate = new Date(new Date().getTime() + offset * 60 * 1000);
    const todayStr = localDate.toISOString().split('T')[0];

    const finalPost = {
      id: newId,
      title: newPost.title,
      date: todayStr,
      category: newPost.category || "지원금/혜택",
      excerpt: newPost.excerpt,
      content: newPost.content
    };

    // 5. 블로그 데이터 목록 맨 앞(최신순)에 추가하고 저장
    blogs.unshift(finalPost);
    fs.writeFileSync(blogFilePath, JSON.stringify(blogs, null, 2), 'utf-8');
    
    console.log(`✅ 블로그 자동 생성 및 저장 완료!`);
    console.log(`- 제목: ${finalPost.title}`);
    console.log(`- 날짜: ${finalPost.date}`);
    console.log(`- ID: ${finalPost.id}`);

  } catch (error) {
    console.error("❌ 블로그 자동 생성 오류 발생:", error);
    process.exit(1);
  }
}

generatePost();
