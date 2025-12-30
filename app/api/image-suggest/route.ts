import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body?.query as string;
    const limit = Math.min(Math.max(Number(body?.count) || 1, 1), 5);

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "SERPAPI_API_KEY not set" }, { status: 500 });
    }

    const url = new URL("https://serpapi.com/search");
    url.searchParams.set("engine", "bing_images");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("ijn", "0");
    url.searchParams.set("num", limit.toString());

    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: text || "Failed to fetch images",
          status: res.status,
        },
        { status: 502 }
      );
    }

    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch (parseErr: any) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON from SerpAPI", raw: text?.slice(0, 500) },
        { status: 502 }
      );
    }

    if (json?.error) {
      return NextResponse.json({ success: false, error: json.error }, { status: 502 });
    }

    const images = Array.isArray(json?.images_results)
      ? json.images_results
          .map((img: any) => img?.original ?? img?.thumbnail)
          .filter(Boolean)
          .slice(0, limit)
      : [];

    return NextResponse.json({ success: true, data: images });
  } catch (error: any) {
    console.error("image-suggest error", error);
    return NextResponse.json({ success: false, error: error?.message || "Server error" }, { status: 500 });
  }
}
