import './types/express';

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

app.use(express.static(path.join(__dirname, '..', 'public')));

// app.get('/', (req: Request, res: Response) => {
//   res.send('A11yAlly 서버입니다. /api/analyze 경로로 POST 요청을 보내주세요.');
// });

app.use('/api/analyze', analyzeRouter);
app.use('/api/user', userRouter);
app.use('/api/report', reportRouter);
