import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const data = await fetch(
    'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=' +
      GOOGLE_API_KEY,
  );
  const json = await data.json();
  json.items.forEach((item: any) => {
    item.files = Object.entries(item.files).map(([key, value]) => ({
      fontType: key,
      url: value,
    }));
  });
  return NextResponse.json(json, {
    status: 200,
    headers: {
      'Cache-Control': 's-maxage=86400',
    },
  });
}
