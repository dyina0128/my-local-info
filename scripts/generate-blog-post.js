const fs = require('fs');
const path = require('path');

// 파일 및 폴더 경로 설정
const localInfoPath = path.join(__dirname, '..', 'public', 'data', 'local-info.json');
const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');

// 🔑 Gemini API 키 확인
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ 에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

// [1단계] 최신 데이터 확인
if (!fs.existsSync(localInfoPath)) {
  console.error("❌ 에러: local-info.json 파일이 존재하지 않습니다.");
  process.exit(1);
}

let localData = { festivals: [], benefits: [], lastUpdated: "" };
try {
  localData = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));
} catch (err) {
  console.error("❌ 에러: local-info.json 파일을 파싱하는 데 실패했습니다.", err);
  process.exit(1);
}

const festivals = localData.festivals || [];
const benefits = localData.benefits || [];

if (festivals.length === 0 && benefits.length === 0) {
  console.error("❌ 에러: 공공서비스 데이터가 존재하지 않습니다.");
  process.exit(1);
}

// 신규 ID의 밀리초 타임스탬프를 추출해 가장 마지막에 추가된 항목을 식별합니다.
const getTimestamp = (id) => {
  const parts = id.split('-');
  if (parts.length > 1) {
    const ts = parseInt(parts[1], 10);
    if (!isNaN(ts)) return ts;
  }
  return 0; // f1, f2, f3 등 기본 항목은 0으로 취급
};

const lastFestival = festivals[festivals.length - 1];
const lastBenefit = benefits[benefits.length - 1];

const festTs = lastFestival ? getTimestamp(lastFestival.id) : 0;
const beneTs = lastBenefit ? getTimestamp(lastBenefit.id) : 0;

let latestItem = null;
if (festTs > beneTs) {
  latestItem = lastFestival;
} else if (beneTs > festTs) {
  latestItem = lastBenefit;
} else {
  // 타임스탬프가 없는 기본 데이터만 있다면 혜택 배열의 마지막을 우선하고 없으면 행사로 대체합니다.
  latestItem = lastBenefit || lastFestival;
}

console.log(`📡 최신 추가 항목 확인 완료: ${latestItem.name}`);

// 기존 posts 폴더의 마크다운 파일들과 비교해서 이미 작성된 글인지 확인합니다.
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
let isAlreadyWritten = false;

for (const file of existingFiles) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
  // 글의 본문 또는 메타정보에 서비스명이 들어있다면 이미 쓴 것으로 판단합니다.
  if (content.includes(latestItem.name)) {
    isAlreadyWritten = true;
    break;
  }
}

if (isAlreadyWritten) {
  console.log("이미 작성된 글입니다");
  process.exit(0);
}

// 오늘 날짜 추출 (한국 시간 기준)
const offset = 9 * 60;
const localDate = new Date(new Date().getTime() + offset * 60 * 1000);
const todayStr = localDate.toISOString().split('T')[0];

// [2단계] Gemini AI로 블로그 글 생성
async function generateBlog() {
  console.log("🤖 Gemini AI에게 고품격 블로그 포스팅 작성을 요청하는 중...");
  
  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayStr}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

추가사항: 마크다운 파일 생성을 위해 마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 해당 혜택의 영어 발음이나 단어를 활용한 영문으로 1~2개 조합해줘 (예: FILENAME: ${todayStr}-nuri-support).`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API 호출 실패 (상태 코드: ${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text.trim();

    // [3단계] 파일명 분리 및 본문 정제
    const lines = rawText.split('\n');
    let filename = '';
    
    // FILENAME 줄 찾아서 추출
    const filenameLine = lines.find(l => l.toUpperCase().includes('FILENAME:'));
    if (filenameLine) {
      const match = filenameLine.match(/FILENAME:\s*(.*?)$/i);
      if (match) {
        filename = match[1].trim();
      }
    }

    // FILENAME 정보가 없는 비상 상황용 백업 파일명 설정
    if (!filename) {
      const sanitizedKeyword = latestItem.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toLowerCase() || 'post';
      filename = `${todayStr}-${sanitizedKeyword}`;
    }

    // 파일명에 .md 확장자가 포함되도록 가공합니다.
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    // 본문에서 FILENAME 줄과 마크다운 펜스 기호를 제외시킵니다.
    const filteredLines = lines.filter(l => !l.toUpperCase().includes('FILENAME:'));
    let cleanMarkdown = filteredLines.join('\n').trim();

    if (cleanMarkdown.startsWith("```markdown")) {
      cleanMarkdown = cleanMarkdown.substring(11);
    } else if (cleanMarkdown.startsWith("```")) {
      cleanMarkdown = cleanMarkdown.substring(3);
    }
    if (cleanMarkdown.endsWith("```")) {
      cleanMarkdown = cleanMarkdown.substring(0, cleanMarkdown.length - 3);
    }
    cleanMarkdown = cleanMarkdown.trim();

    // 800자 검사
    if (cleanMarkdown.length < 800) {
      console.warn(`⚠️ 경고: 작성된 글자 수(${cleanMarkdown.length}자)가 800자 미만입니다.`);
    }

    // 파일 저장
    const outputFilePath = path.join(postsDir, filename);
    fs.writeFileSync(outputFilePath, cleanMarkdown, 'utf-8');

    console.log(`✅ 블로그 글 생성 및 파일 저장 완료!`);
    console.log(`- 저장 경로: src/content/posts/${filename}`);
    console.log(`- 글자 수: ${cleanMarkdown.length}자`);

  } catch (error) {
    console.error("❌ 블로그 글 자동 생성 중 오류 발생:", error);
    process.exit(1);
  }
}

generateBlog();
