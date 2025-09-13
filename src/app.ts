import express, { Express } from 'express';
import path from 'path';
import { analyzeRouter } from './api/analyze';
import { userRouter } from './api/user';
import { reportRouter } from './api/report';

export const app: Express = express();

// 로그인 팝업 Cross-Origin-Opener-Policy
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// JSON 요청 본문을 파싱하기 위한 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home', 'index.html'));
});

// report 페이지 라우팅 추가 (필요 시)
app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'report', 'index.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/analyze', analyzeRouter);
app.use('/api/user', userRouter);
app.use('/api/report', reportRouter);
