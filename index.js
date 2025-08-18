const express = require('express');
const app = express();

// Render와 같은 호스팅 플랫폼은 환경 변수(process.env.PORT)를 통해 포트를 지정합니다.
// 로컬 환경에서는 3000번 포트를 사용합니다.
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World! Welcome to A11yQuest!');
});

app.listen(PORT, () => {
  console.log(`A11yQuest Server is running on port ${PORT}`);
});