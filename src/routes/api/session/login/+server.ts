// src/routes/api/session/login/+server.ts

import { json } from "@sveltejs/kit";
import { auth } from "$lib/server/firebaseAdmin";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { idToken } = await request.json();

  if (!auth || !idToken) {
    return json({ message: "인증 정보가 없습니다." }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  cookies.set("session", sessionCookie, {
    path: "/",
    httpOnly: true,
    secure: !dev,
    maxAge: expiresIn / 1000,
  });

  return json({ message: "성공적으로 로그인되었습니다." });
};
