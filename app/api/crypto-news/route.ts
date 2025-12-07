import { NextRequest, NextResponse } from "next/server";
import { getNews } from "../../../lib/services/news";

export async function GET(request: NextRequest) {
  try {
    const news = await getNews();
    
    return NextResponse.json({
      status: "success",
      data: news,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News API error:", error);
    
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch crypto news",
        data: [],
      },
      { status: 500 }
    );
  }
}
