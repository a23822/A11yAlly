import express, { Express, Request, Response } from 'express';
import path from 'path';
import { analyzeRouter } from './api/analyze';

export const app: Express = express();

// JSON 요청 본문을 파싱하기 위한 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// app.get('/', (req: Request, res: Response) => {
//   res.send('A11yQuest 서버입니다. /api/analyze 경로로 POST 요청을 보내주세요.');
// });

app.use('/api/analyze', analyzeRouter);