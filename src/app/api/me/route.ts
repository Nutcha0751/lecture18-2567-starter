import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Nutcha Khampoung",
    studentId: "660610751",
  });
};
