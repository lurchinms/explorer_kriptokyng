import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    // Get symbol from query string
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toLowerCase();
    
    if (!symbol) {
      return new NextResponse(null, { status: 400 });
    }
    
    // Path to the coin icons directory
    const iconPath = path.join(process.cwd(), "assets", "coins", `${symbol}.webp`);
    
    try {
      // Try to read the file
      const fileData = await fs.readFile(iconPath);
      
      // Return the image with appropriate headers
      return new NextResponse(fileData, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400", // Cache for a day
        },
      });
    } catch {
      // If specific coin icon not found, try to use a default one
      const defaultIconPath = path.join(process.cwd(), "assets", "coins", "default.webp");
      const defaultData = await fs.readFile(defaultIconPath).catch(() => null);
      
      if (defaultData) {
        return new NextResponse(defaultData, {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=3600", // Cache for an hour
          },
        });
      }
      
      // Return 404 if no default image either
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error(`Error serving coin icon:`, error);
    return new NextResponse(null, { status: 500 });
  }
}