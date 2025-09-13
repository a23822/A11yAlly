import { Router } from 'express';
import { getReportById } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const reportRouter = Router();

// GET /api/report/리포트ID 형태의 요청을 처리합니다.
// authMiddleware를 통해 로그인한 사용자만 접근할 수 있습니다.
reportRouter.get('/:reportId', authMiddleware, getReportById);

export { reportRouter };
