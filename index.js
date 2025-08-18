const express = require('express');
const puppeteer = require('puppeteer'); // puppeteer 불러오기
const app = express();

// POST 요청의 body(본문)를 JSON 형태로 파싱하기 위해 필요합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// 기본 '/' 경로는 그대로 유지
app.get('/', (req, res) => {
  // 나중에 URL을 입력할 간단한 HTML 폼을 여기에 추가할 수 있습니다.
  res.send('A11yQuest 서버입니다. /analyze 경로로 URL을 POST 요청으로 보내주세요.');
});

// 핵심 기능이 될 /analyze API 라우트 생성
app.post('/analyze', async (req, res) => {
  // 사용자가 요청 본문에 'url' 이라는 키로 보낸 값을 받습니다.
  const { url } = req.body;

  // URL이 없는 경우 오류 처리
  if (!url) {
    return res.status(400).send({ error: '분석할 URL을 입력해주세요.' });
  }

  try {
    // Puppeteer 실행
    const browser = await puppeteer.launch({
      // Render와 같은 서버 환경에서는 --no-sandbox 옵션이 필요할 수 있습니다.
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 사용자가 입력한 URL로 이동
    await page.goto(url, { waitUntil: 'networkidle0' });

    // 페이지의 제목 가져오기
    const pageTitle = await page.title();

    // 브라우저 닫기
    await browser.close();

    // 분석 결과를 JSON 형태로 응답
    res.status(200).send({
      message: '분석 성공!',
      analyzedUrl: url,
      title: pageTitle
    });

  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res.status(500).send({ error: '페이지를 분석하는 중에 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`A11yQuest Server is running on port ${PORT}`);
});