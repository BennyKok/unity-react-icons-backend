import { NextResponse } from 'next/server';
import * as All from 'react-icons/lib/esm/iconsManifest';

export async function GET() {
  return NextResponse.json({
    packs: (All as any).IconsManifest,
  });
}
