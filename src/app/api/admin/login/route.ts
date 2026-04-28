import { createAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json()) as { username?: string; password?: string };
  const username = payload.username ?? "";
  const password = payload.password ?? "";

  if (!(await validateAdminCredentials(username, password))) {
    return Response.json(
      {
        ok: false,
        message: "მომხმარებელი ან პაროლი არასწორია.",
      },
      { status: 401 },
    );
  }

  await createAdminSession();
  return Response.json({ ok: true });
}
