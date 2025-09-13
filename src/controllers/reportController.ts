import { Request, Response } from 'express';
import { firestore } from '../lib/firebaseAdmin';

export const getReportById = async (req: Request, res: Response) => {
  const { reportId } = req.params; // URL에서 리포트 ID를 가져옵니다.
  const uid = req.user?.uid; // 인증 미들웨어를 거친 사용자 ID

  if (!reportId) {
    return res.status(400).send({ error: '리포트 ID가 필요합니다.' });
  }

  try {
    // ▼▼▼ 1. 사용자 정보와 리포트 정보를 동시에 가져옵니다. ▼▼▼
    const userRef = firestore.collection('users').doc(uid!);
    const reportRef = firestore.collection('reports').doc(reportId);

    const [userDoc, reportDoc] = await Promise.all([
      userRef.get(),
      reportRef.get(),
    ]);

    if (!reportDoc.exists) {
      return res.status(404).send({ error: '리포트를 찾을 수 없습니다.' });
    }

    const reportData = reportDoc.data()!;
    const userData = userDoc.data();

    if (reportData.userId !== uid) {
      return res
        .status(403)
        .send({ error: '이 리포트에 접근할 권한이 없습니다.' });
    }

    // ▼▼▼ 2. is_pro 상태를 확인하고 무료 사용자일 경우 데이터 제한 ▼▼▼
    const isProUser = userData?.is_pro === true;

    if (!isProUser) {
      // accessibilityViolations 배열을 상위 3개만 남기고 자릅니다.
      if (reportData.issues_json.accessibilityViolations.length > 3) {
        reportData.issues_json.accessibilityViolations =
          reportData.issues_json.accessibilityViolations.slice(0, 3);
        reportData.issues_json.isTruncated = true; // 데이터가 잘렸다는 표시 추가
      }
    }

    res.status(200).send(reportData);
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    res.status(500).send({ error: '서버 오류가 발생했습니다.' });
  }
};
