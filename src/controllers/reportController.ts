import { Request, Response } from 'express';
import { firestore } from '../lib/firebaseAdmin';

export const getReportById = async (req: Request, res: Response) => {
  const { reportId } = req.params; // URL에서 리포트 ID를 가져옵니다.
  const uid = req.user?.uid; // 인증 미들웨어를 거친 사용자 ID

  if (!reportId) {
    return res.status(400).send({ error: '리포트 ID가 필요합니다.' });
  }

  try {
    const reportRef = firestore.collection('reports').doc(reportId);
    const doc = await reportRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: '리포트를 찾을 수 없습니다.' });
    }

    const reportData = doc.data();

    // 보안: 이 리포트가 현재 로그인한 사용자의 것인지 확인합니다.
    if (reportData?.userId !== uid) {
      return res
        .status(403)
        .send({ error: '이 리포트에 접근할 권한이 없습니다.' });
    }

    // todo: 여기에 나중에 is_pro 상태에 따라 데이터를 잘라내는 로직이 들어갑니다.

    res.status(200).send(reportData);
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    res.status(500).send({ error: '서버 오류가 발생했습니다.' });
  }
};
