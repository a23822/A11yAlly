import { Request, Response } from 'express';
import { firestore } from '../lib/firebaseAdmin';

export const createOrUpdateUser = async (req: Request, res: Response) => {
  const { uid, email } = req.body;

  if (!uid || !email) {
    return res.status(400).send({ error: 'uid와 email은 필수입니다.' });
  }

  try {
    const userRef = firestore.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      // 새로운 사용자일 경우, 기본값으로 문서를 생성합니다.
      await userRef.set({
        email: email,
        is_pro: false,
        createdAt: new Date(),
      });
      res.status(201).send({ message: '새로운 사용자가 생성되었습니다.' });
    } else {
      // 기존 사용자일 경우, 이메일만 업데이트 (필요 시)
      await userRef.update({ email: email });
      res
        .status(200)
        .send({ message: '기존 사용자 정보가 업데이트되었습니다.' });
    }
  } catch (error) {
    console.error('Firestore 사용자 생성/업데이트 오류:', error);
    res.status(500).send({ error: '서버 오류가 발생했습니다.' });
  }
};
