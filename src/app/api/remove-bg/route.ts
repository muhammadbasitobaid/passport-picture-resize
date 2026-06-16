import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env.mjs";

// Runs server-side and proxies the uploaded photo to the background-removal
// microservice (services/bg-removal, BiRefNet-lite), returning its RGBA PNG
// cut-out. Keeping the upstream URL server-side means the browser never needs
// to know where the service lives (and it can later sit behind auth / a VPC).
export const runtime = "nodejs";

const UPSTREAM = env.BG_REMOVAL_URL ?? "http://localhost:7001";

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing 'file' upload" },
      { status: 400 },
    );
  }

  const forward = new FormData();
  forward.append("file", file, "photo.jpg");

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${UPSTREAM}/remove`, {
      method: "POST",
      body: forward,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Background-removal service is unreachable. Is services/bg-removal running?",
      },
      { status: 502 },
    );
  }

  if (!upstreamRes.ok) {
    const detail = await upstreamRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Background removal failed", detail },
      { status: 502 },
    );
  }

  const body = await upstreamRes.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": upstreamRes.headers.get("Content-Type") ?? "image/png",
      "X-Inference-Ms": upstreamRes.headers.get("X-Inference-Ms") ?? "",
      "Cache-Control": "no-store",
    },
  });
}
