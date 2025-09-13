import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).send({ error: '인증 헤더가 없습니다.' });
  }

  const idToken = header.split('Bearer ')[1];

  try {
    // Firebase Admin SDK를 사용해 토큰을 검증합니다.
    const decodedToken: DecodedIdToken = await admin
      .auth()
      .verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('ID 토큰 검증 오류:', error);
    res.status(403).send({ error: '유효하지 않은 토큰입니다.' });
  }
};
