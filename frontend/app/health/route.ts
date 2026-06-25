export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "controle-financeiro-next-api",
    timestamp: new Date().toISOString(),
  });
}
