import { isAdminAuthenticated } from "@/lib/admin-auth";
import { normalizeLunchData } from "@/data/lunch";
import { readLunchData, writeLunchData } from "@/lib/lunch-store";

export const runtime = "nodejs";

function getErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json(
      {
        ok: false,
        message: "სესია აღარ არის აქტიური.",
      },
      { status: 401 },
    );
  }

  return Response.json({
    ok: true,
    data: await readLunchData(),
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json(
      {
        ok: false,
        message: "სესია აღარ არის აქტიური.",
      },
      { status: 401 },
    );
  }

  const payload = await request.json();

  try {
    const data = await writeLunchData(payload);

    return Response.json({
      ok: true,
      data,
    });
  } catch (error) {
    const normalizedData = normalizeLunchData(payload);
    const errorCode = getErrorCode(error);
    const isReadOnlyError = ["EACCES", "EPERM", "EROFS"].includes(errorCode);

    return Response.json(
      {
        ok: false,
        code: isReadOnlyError ? "STORAGE_UNWRITABLE" : "SAVE_FAILED",
        message: isReadOnlyError
          ? "ფაილური შენახვა ამ გარემოში არ მუშაობს. გამოიყენე ქვემოთ მოცემული JSON export და გადააწერე ფაილს ხელით."
          : "შენახვისას შეცდომა მოხდა.",
        data: normalizedData,
      },
      { status: 500 },
    );
  }
}
