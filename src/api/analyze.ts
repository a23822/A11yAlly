import { Router } from 'express';
import { analyzeUrl } from '../controllers/analyzeController';

const analyzeRouter = Router();

// POST /api/analyze 요청이 오면 analyzeController.analyzeUrl 함수를 실행
analyzeRouter.post('/', analyzeUrl);

export { analyzeRouter };