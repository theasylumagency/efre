import { createAdminSession, validateAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json()) as { password?: string };
  const password = payload.password ?? "";

  if (!(await validateAdminPassword(password))) {
    return Response.json(
      {
        ok: false,
        message: "პაროლი არასწორია.",
      },
      { status: 401 },
    );
  }

  await createAdminSession();

  return Response.json({
    ok: true,
  });
}
