import { NextResponse } from 'next/server';
import { IconType } from 'react-icons';
import * as AIIcons from 'react-icons/ai';
import * as BIIcons from 'react-icons/bi';
import * as BSIcons from 'react-icons/bs';
import * as CgIcons from 'react-icons/cg';
import * as CiIcons from 'react-icons/ci';
import * as DiIcons from 'react-icons/di';
import * as FaIcons from 'react-icons/fa';
import * as Fa6Icons from 'react-icons/fa6';
import * as FcIcons from 'react-icons/fc';
import * as FiIcons from 'react-icons/fi';
import * as GiIcons from 'react-icons/gi';
import * as GoIcons from 'react-icons/go';
import * as GrIcons from 'react-icons/gr';
import * as HiIcons from 'react-icons/hi';
import * as Hi2Icons from 'react-icons/hi2';
import * as ImIcons from 'react-icons/im';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as LiaIcons from 'react-icons/lia';
import * as LuIcons from 'react-icons/lu';
import * as MdIcons from 'react-icons/md';
import * as PiIcons from 'react-icons/pi';
import * as RiIcons from 'react-icons/ri';
import * as RxIcons from 'react-icons/rx';
import * as SiIcons from 'react-icons/si';
import * as TbIcons from 'react-icons/tb';
import * as TfiIcons from 'react-icons/tfi';
import * as TiIcons from 'react-icons/ti';
import * as VscIcons from 'react-icons/vsc';
import * as WiIcons from 'react-icons/wi';
import sharp from 'sharp';
const IconsManifest = {
  ai: AIIcons,
  bi: BIIcons,
  bs: BSIcons,
  cg: CgIcons,
  ci: CiIcons,
  di: DiIcons,
  fa: FaIcons,
  fa6: Fa6Icons,
  fc: FcIcons,
  fi: FiIcons,
  gi: GiIcons,
  go: GoIcons,
  gr: GrIcons,
  hi: HiIcons,
  hi2: Hi2Icons,
  im: ImIcons,
  io: IoIcons,
  io5: Io5Icons,
  lia: LiaIcons,
  lu: LuIcons,
  md: MdIcons,
  pi: PiIcons,
  ri: RiIcons,
  rx: RxIcons,
  si: SiIcons,
  tb: TbIcons,
  tfi: TfiIcons,
  ti: TiIcons,
  vsc: VscIcons,
  wi: WiIcons,
} as Record<string, Record<string, IconType>>;

export async function POST(request: Request) {
  const { iconId, iconPackId } = await request.json();

  if (!iconId && iconPackId) {
    return NextResponse.json({
      icons: Object.entries(IconsManifest[iconPackId]).map(
        ([iconId, Icon]) => iconId,
      ),
    });
  }

  const Icon = IconsManifest[iconPackId][iconId];

  // render the icon to svg
  const svg = Icon({ size: 24, color: 'white' });

  const renderToString = (await import('react-dom/server')).renderToString;
  const svgString = renderToString(svg);

  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(128)
    .png()
    .toBuffer();
  // Convert PNG buffer to base64
  const base64Png = pngBuffer.toString('base64');

  return NextResponse.json({
    iconId: iconId,
    svg: svgString,
    base64ImagePreview: base64Png,
  });
}
