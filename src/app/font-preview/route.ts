import { NextRequest, NextResponse } from 'next/server';
import { Canvas, createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { promises as fs } from 'fs';
import tmp from 'tmp-promise';

async function renderFont(
  fontUrl: string | undefined,
  family: string,
  canvas: Canvas,
  context: SKRSContext2D,
) {
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

  // create a temporary file
  const tmpfile = await tmp.file();

  // write the font data to the temporary file
  await fs.writeFile(tmpfile.path, Buffer.from(font), 'binary');

  GlobalFonts.registerFromPath(tmpfile.path, family);

  // clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';

  // center the text
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // set the initial font size
  let fontSize = 80;

  // set the font using the initial font size
  context.font = `${fontSize}px ${family}`;

  // measure the text
  let textMetrics = context.measureText(textToWrite);

  // reduce the font size until the text fits within the canvas
  while (textMetrics.width > canvas.width) {
    fontSize -= 10;
    context.font = `${fontSize}px ${family}`;
    textMetrics = context.measureText(textToWrite);
  }

  // calculate the center of the canvas
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // draw the text
  context.fillText(textToWrite, centerX, centerY);

  // clean up the temporary file

  // convert the canvas to base64
  const base64Image = canvas.toDataURL().replace('data:image/png;base64,', '');

  await tmpfile.cleanup();

  return base64Image;
}

export async function GET(request: NextRequest) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  const searchParams = new URL(request.nextUrl).searchParams;
  const family = searchParams.get('family')!;

  const families = family.split(',');

  // create a canvas and set its font
  const canvas = createCanvas(500, 300);
  const context = canvas.getContext('2d');

  const promises = families.map((family) => {
    return renderFont(undefined, family, canvas, context);
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
