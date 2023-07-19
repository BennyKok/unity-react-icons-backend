import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import sharp from 'sharp';

async function renderFont(fontUrl: string | undefined, family: string) {
  const textToWrite = family;

  if (!fontUrl) {
    const data = await fetch(
      `https://fonts.googleapis.com/css?family=${family}&text=${textToWrite}`,
      {
        cache: 'force-cache',
      },
    );
    const css = await data.text();
    const regex = /url\((.*?)\)/;
    const match = css.match(regex);
    //   if (!match) return NextResponse.json({ error: 'No match' }, { status: 400 });

    fontUrl = match![1];
  }

  if (!fontUrl) return undefined;

  const data2 = await fetch(fontUrl, {
    cache: 'force-cache',
  });
  const font = await data2.arrayBuffer();

  const svgString = await satori(
    <div
      style={{
        color: 'white',
        fontFamily: family,
        fontSize: '80px',

        height: '100%',
        width: '100%',
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {textToWrite}
    </div>,
    {
      width: 600,
      height: 400,
      embedFont: true,
      fonts: [
        {
          name: family,
          data: Buffer.from(font),
          style: 'normal',
        },
      ],
    },
  );

  const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();

  // Convert PNG buffer to base64
  const base64Png = pngBuffer.toString('base64');
  return base64Png;
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.nextUrl).searchParams;
  const family = searchParams.get('family')!;

  const families = family.split(',');

  const promises = families.map((family) => {
    return renderFont(undefined, family);
  });

  const all = await Promise.all(promises);

  return NextResponse.json(
    {
      previews: all,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=86400',
        // 'Cache-Control': 'no-cache',
      },
    },
  );
}
