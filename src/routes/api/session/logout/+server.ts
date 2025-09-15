import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  // 'session' 쿠키를 삭제합니다.
  cookies.delete("session", { path: "/" });
  return json({ message: "성공적으로 로그아웃되었습니다." });
};
