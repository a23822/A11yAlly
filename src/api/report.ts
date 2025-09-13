import { Router } from 'express';
import {
  getReportById,
  getAllReportsByUser,
} from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const reportRouter = Router();

// GET /api/reports - 로그인한 사용자의 모든 리포트 조회
reportRouter.get('/', authMiddleware, getAllReportsByUser);

// GET /api/report/리포트ID 형태의 요청을 처리합니다.
// authMiddleware를 통해 로그인한 사용자만 접근할 수 있습니다.
reportRouter.get('/:reportId', authMiddleware, getReportById);

export { reportRouter };
