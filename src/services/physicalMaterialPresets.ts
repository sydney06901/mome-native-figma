import { PhysicalMaterial, PhysicalMaterialType } from '../models/PhysicalMaterial.ts';
import { svgToDataUrl } from './demoAssets.ts';

// -------------------------------------------------------------
// Category & Subtype Definitions
// -------------------------------------------------------------
export interface CategoryMeta {
  type: PhysicalMaterialType;
  label: string;
  en: string;
  hint: string;
  subtypes: string[];
}

export const PHYSICAL_CATEGORIES: CategoryMeta[] = [
  {
    type: 'tape',
    label: '和纸胶带',
    en: 'Decorative Tape',
    hint: '连续卷装，仅需宽度',
    subtypes: ['和纸胶带', 'PET透明胶带', '蕾丝胶带', '纯色胶带', '图案胶带'],
  },
  {
    type: 'sticker',
    label: '贴纸类',
    en: 'Stickers',
    hint: '宽高与数量',
    subtypes: [
      '人物贴纸',
      '建筑贴纸',
      '植物贴纸',
      '食物贴纸',
      '文字标签',
      '透明贴纸',
      '照片轮廓贴纸',
    ],
  },
  {
    type: 'ticket',
    label: '展馆票根',
    en: 'Tickets & Ephemera',
    hint: '宽高与剪裁，可加背面',
    subtypes: [
      '展馆票根',
      '电影票',
      '车票',
      '收据',
      '邮票',
      '明信片',
      '地图碎片',
      '餐厅菜单',
    ],
  },
  {
    type: 'paper',
    label: '纸张类',
    en: 'Paper',
    hint: '打底与拼贴肌理',
    subtypes: [
      '硫酸纸',
      '牛皮纸',
      '和纸',
      '彩色卡纸',
      '网格纸',
      '复古报纸',
      '纹理纸',
      '照片纸',
    ],
  },
  {
    type: 'embellishment',
    label: '立体装饰类',
    en: '3D Embellishments',
    hint: '立体层次与触感',
    subtypes: [
      '立体纸雕',
      '泡棉胶',
      '纸质相框',
      '折叠结构',
      '丝带',
      '蕾丝',
      '压花',
    ],
  },
];

// -------------------------------------------------------------
// SVG Generators for Authentic Tactile Materials
// -------------------------------------------------------------

// Paper SVGs
const SVG_TRACING_PAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="200" rx="4" fill="#f8fafc" opacity="0.8" stroke="#cbd5e1" stroke-width="1.5" />
  <line x1="15" y1="50" x2="285" y2="50" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.4" />
  <line x1="15" y1="110" x2="285" y2="110" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.4" />
  <line x1="15" y1="170" x2="285" y2="170" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.4" />
  <text x="30" y="38" font-family="monospace" font-size="9" fill="#64748b" opacity="0.7">TRACING PAPER · 75g 半透明硫酸纸</text>
  <rect x="230" y="25" width="40" height="15" rx="3" fill="#e2e8f0" opacity="0.6" />
  <text x="250" y="36" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#475569">VELLUM</text>
</svg>
`;

const SVG_KRAFT_PAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <defs>
    <linearGradient id="kraftGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cca87d" />
      <stop offset="100%" stop-color="#ba966a" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="280" height="200" rx="3" fill="url(#kraftGrad)" stroke="#a17d52" stroke-width="2" />
  <line x1="30" y1="30" x2="70" y2="30" stroke="#8d6c44" stroke-width="1.5" />
  <text x="30" y="60" font-family="serif" font-size="14" font-weight="700" fill="#6a4c28">KRAFT PAPER</text>
  <text x="30" y="80" font-family="sans-serif" font-size="10" fill="#7d5d36">120g 复古原色木浆纤维牛皮纸</text>
  <circle cx="250" cy="170" r="22" fill="none" stroke="#6a4c28" stroke-width="1.5" stroke-dasharray="4,2" />
  <text x="250" y="174" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="#6a4c28">ECO</text>
</svg>
`;

const SVG_WASHI_SHEET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <path d="M12,12 Q140,8 288,12 Q292,110 288,208 Q140,212 12,208 Q8,110 12,12 Z" fill="#faf7f0" stroke="#d5cdbe" stroke-width="1.5" />
  <circle cx="50" cy="50" r="1.5" fill="#a89a84" opacity="0.6" />
  <circle cx="120" cy="80" r="2" fill="#a89a84" opacity="0.5" />
  <circle cx="220" cy="60" r="1.5" fill="#a89a84" opacity="0.7" />
  <circle cx="180" cy="150" r="2" fill="#a89a84" opacity="0.5" />
  <circle cx="90" cy="160" r="1.5" fill="#a89a84" opacity="0.6" />
  <text x="30" y="45" font-family="serif" font-size="13" font-weight="600" fill="#756754">手漉き和紙</text>
  <text x="30" y="65" font-family="sans-serif" font-size="9" fill="#998973">JAPANESE FIBER WASHI SHEET</text>
  <line x1="30" y1="75" x2="160" y2="75" stroke="#ded5c5" stroke-width="1" />
</svg>
`;

const SVG_COLORED_CARD = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="200" rx="6" fill="#738c9c" stroke="#5a7180" stroke-width="2" />
  <rect x="20" y="20" width="260" height="180" rx="3" fill="none" stroke="#8fa9b9" stroke-width="1" />
  <text x="40" y="55" font-family="serif" font-size="15" font-weight="700" fill="#f0f5f8">MORANDI SLATE BLUE</text>
  <text x="40" y="75" font-family="sans-serif" font-size="10" fill="#d0dfe8">250g 莫兰迪雾蓝硬质特种彩色卡纸</text>
  <rect x="40" y="150" width="80" height="24" rx="4" fill="#5a7180" opacity="0.7" />
  <text x="80" y="166" text-anchor="middle" font-family="monospace" font-size="9" fill="#f0f5f8">NO. 408B</text>
</svg>
`;

const SVG_GRID_PAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <defs>
    <pattern id="gridPat" width="15" height="15" patternUnits="userSpaceOnUse">
      <rect width="15" height="15" fill="#faf9f5" />
      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ded8cc" stroke-width="0.8" />
    </pattern>
  </defs>
  <rect x="10" y="10" width="280" height="200" rx="4" fill="url(#gridPat)" stroke="#c5bdae" stroke-width="1.5" />
  <rect x="25" y="25" width="110" height="22" rx="3" fill="#ffffff" stroke="#ded8cc" stroke-width="1" />
  <text x="80" y="40" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="700" fill="#524a3e">5mm GRID PAPER</text>
</svg>
`;

const SVG_VINTAGE_NEWSPAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="200" rx="3" fill="#f5eddb" stroke="#baab93" stroke-width="1.5" />
  <text x="150" y="38" text-anchor="middle" font-family="serif" font-size="16" font-weight="900" fill="#2d261e" letter-spacing="2">LE JOURNAL DE PARIS</text>
  <line x1="25" y1="46" x2="275" y2="46" stroke="#2d261e" stroke-width="1.2" />
  <line x1="25" y1="50" x2="275" y2="50" stroke="#2d261e" stroke-width="0.6" />
  <!-- Column 1 -->
  <line x1="25" y1="65" x2="140" y2="65" stroke="#685d4f" stroke-width="1" />
  <line x1="25" y1="75" x2="140" y2="75" stroke="#685d4f" stroke-width="1" />
  <line x1="25" y1="85" x2="140" y2="85" stroke="#685d4f" stroke-width="1" />
  <line x1="25" y1="95" x2="140" y2="95" stroke="#685d4f" stroke-width="1" />
  <line x1="25" y1="105" x2="120" y2="105" stroke="#685d4f" stroke-width="1" />
  <!-- Column Divider -->
  <line x1="150" y1="55" x2="150" y2="195" stroke="#baab93" stroke-width="0.8" />
  <!-- Column 2 -->
  <rect x="160" y="60" width="115" height="55" fill="#e6dcc8" stroke="#baab93" stroke-width="0.8" />
  <text x="217" y="90" text-anchor="middle" font-family="serif" font-size="10" fill="#685d4f">ILLUSTRATION</text>
  <line x1="160" y1="130" x2="275" y2="130" stroke="#685d4f" stroke-width="1" />
  <line x1="160" y1="140" x2="275" y2="140" stroke="#685d4f" stroke-width="1" />
  <line x1="160" y1="150" x2="275" y2="150" stroke="#685d4f" stroke-width="1" />
</svg>
`;

const SVG_TEXTURED_PAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="200" rx="4" fill="#faf6ee" stroke="#ded4c3" stroke-width="2" />
  <text x="30" y="45" font-family="serif" font-size="13" font-weight="700" fill="#524838">TEXTURED COLD PRESS</text>
  <text x="30" y="65" font-family="sans-serif" font-size="9" fill="#8c7e68">300g 棉麻粗纹水彩凹凸肌理纸</text>
  <rect x="30" y="85" width="240" height="105" fill="#f5ede0" rx="3" stroke="#e0d5c3" stroke-width="1" stroke-dasharray="2,2" />
  <text x="150" y="142" text-anchor="middle" font-family="serif" font-size="11" fill="#a4937c" font-style="italic">Rich Cotton Texture</text>
</svg>
`;

const SVG_PHOTO_PAPER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <rect x="40" y="10" width="220" height="200" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
  <rect x="55" y="22" width="190" height="140" fill="#1e293b" rx="2" />
  <path d="M55,130 L110,80 L160,120 L200,95 L245,135 L245,162 L55,162 Z" fill="#334155" opacity="0.7" />
  <circle cx="95" cy="55" r="12" fill="#f8fafc" opacity="0.8" />
  <text x="150" y="190" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b">FUJIFILM GLOSSY 260g</text>
</svg>
`;

// Tickets & Ephemera SVGs
const SVG_CINEMA_TICKET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="140" rx="8" fill="#2b2622" stroke="#d4af37" stroke-width="2" />
  <circle cx="10" cy="80" r="14" fill="#fbf9f5" />
  <circle cx="290" cy="80" r="14" fill="#fbf9f5" />
  <line x1="205" y1="12" x2="205" y2="148" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="4,4" />
  <text x="35" y="45" font-family="serif" font-size="14" font-weight="700" fill="#eed8be" letter-spacing="2">CINEMA PARADISO</text>
  <text x="35" y="70" font-family="sans-serif" font-size="10" fill="#a89a8c">ROW 06 · SEAT 12 · HALL 02</text>
  <text x="35" y="100" font-family="monospace" font-size="12" font-weight="700" fill="#d4af37">2026.10.10 19:30</text>
  <text x="35" y="125" font-family="sans-serif" font-size="9" fill="#7d7266">热敏打孔复古电影票</text>
  <text x="225" y="65" font-family="serif" font-size="12" font-weight="700" fill="#eed8be">ADMIT</text>
  <text x="233" y="95" font-family="serif" font-size="20" font-weight="900" fill="#d4af37">ONE</text>
</svg>
`;

const SVG_TRAIN_TICKET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" width="100%" height="100%">
  <rect x="10" y="10" width="280" height="140" rx="4" fill="#e8dfce" stroke="#8a7964" stroke-width="2" />
  <text x="25" y="40" font-family="serif" font-size="14" font-weight="800" fill="#2b231a">EURAIL PASS</text>
  <text x="25" y="60" font-family="monospace" font-size="11" font-weight="700" fill="#8c3326">PLATFORM 04 · CAR 03</text>
  <text x="25" y="85" font-family="sans-serif" font-size="12" font-weight="600" fill="#3a3227">PARIS → KYOTO SPECIAL</text>
  <line x1="25" y1="98" x2="275" y2="98" stroke="#a4937d" stroke-width="1" />
  <text x="25" y="125" font-family="monospace" font-size="10" fill="#6a5d4d">DATE: 2026.10.10 / VALID 1 DAY</text>
  <circle cx="240" cy="55" r="24" fill="none" stroke="#8c3326" stroke-width="2" stroke-dasharray="3,2" />
  <text x="240" y="58" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="#8c3326">CHECKED</text>
</svg>
`;

const SVG_RECEIPT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" width="100%" height="100%">
  <path d="M10,10 L230,10 L230,285 L220,280 L210,285 L200,280 L190,285 L180,280 L170,285 L160,280 L150,285 L140,280 L130,285 L120,280 L110,285 L100,280 L90,285 L80,280 L70,285 L60,280 L50,285 L40,280 L30,285 L20,280 L10,285 Z" fill="#faf8f2" stroke="#cfc7b6" stroke-width="1.5" />
  <text x="120" y="45" text-anchor="middle" font-family="serif" font-size="15" font-weight="800" fill="#2c2825">CAFE DE MOME</text>
  <text x="120" y="65" text-anchor="middle" font-family="monospace" font-size="9" fill="#7a7265">RECEIPT #20261010-08</text>
  <line x1="25" y1="80" x2="215" y2="80" stroke="#2c2825" stroke-width="0.8" stroke-dasharray="2,2" />
  <text x="30" y="105" font-family="monospace" font-size="11" fill="#2c2825">1x CAPPUCCINO</text>
  <text x="210" y="105" text-anchor="end" font-family="monospace" font-size="11" fill="#2c2825">¥32.00</text>
  <text x="30" y="130" font-family="monospace" font-size="11" fill="#2c2825">1x MATCHA ROLL</text>
  <text x="210" y="130" text-anchor="end" font-family="monospace" font-size="11" fill="#2c2825">¥28.00</text>
  <line x1="25" y1="150" x2="215" y2="150" stroke="#2c2825" stroke-width="0.8" stroke-dasharray="2,2" />
  <text x="30" y="180" font-family="monospace" font-size="12" font-weight="700" fill="#2c2825">TOTAL</text>
  <text x="210" y="180" text-anchor="end" font-family="monospace" font-size="13" font-weight="700" fill="#2c2825">¥60.00</text>
  <text x="120" y="240" text-anchor="middle" font-family="serif" font-size="11" fill="#8c7866" font-style="italic">Merci beaucoup!</text>
</svg>
`;

const SVG_STAMP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <rect x="10" y="10" width="180" height="220" rx="3" fill="#ffffff" stroke="#c4b8a5" stroke-width="2" />
  <rect x="20" y="20" width="160" height="200" fill="#f4ebd9" stroke="#9e8f7a" stroke-width="1.2" />
  <text x="100" y="45" text-anchor="middle" font-family="serif" font-size="11" font-weight="700" fill="#6d5843">POSTES 1984</text>
  <circle cx="100" cy="110" r="40" fill="none" stroke="#6d5843" stroke-width="1.5" />
  <path d="M100,75 L100,145 M75,110 L125,110" stroke="#6d5843" stroke-width="1.2" />
  <text x="100" y="195" text-anchor="middle" font-family="serif" font-size="18" font-weight="900" fill="#8c3326">50 F</text>
</svg>
`;

const SVG_POSTCARD = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 210" width="100%" height="100%">
  <rect x="10" y="10" width="300" height="190" rx="4" fill="#faf6ed" stroke="#c8bcab" stroke-width="2" />
  <line x1="160" y1="20" x2="160" y2="190" stroke="#cfc5b4" stroke-width="1" />
  <rect x="245" y="25" width="45" height="55" fill="none" stroke="#8c7964" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="267" y="55" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#8c7964">STAMP</text>
  <text x="35" y="45" font-family="serif" font-size="14" font-weight="700" fill="#42382c">CARTE POSTALE</text>
  <text x="35" y="65" font-family="sans-serif" font-size="9" fill="#7a6d5c">周六漫步·秋日京都手记寄语</text>
  <line x1="35" y1="100" x2="140" y2="100" stroke="#ded5c4" stroke-width="1" />
  <line x1="35" y1="125" x2="140" y2="125" stroke="#ded5c4" stroke-width="1" />
  <line x1="35" y1="150" x2="140" y2="150" stroke="#ded5c4" stroke-width="1" />
  <line x1="180" y1="110" x2="285" y2="110" stroke="#8c7964" stroke-width="1" />
  <line x1="180" y1="135" x2="285" y2="135" stroke="#8c7964" stroke-width="1" />
  <line x1="180" y1="160" x2="285" y2="160" stroke="#8c7964" stroke-width="1" />
</svg>
`;

const SVG_MAP_FRAGMENT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" width="100%" height="100%">
  <path d="M12,18 L90,10 L190,16 L285,12 L288,205 L200,212 L110,205 L15,210 Z" fill="#f7f1e4" stroke="#ad9e87" stroke-width="1.8" />
  <!-- Streets -->
  <path d="M20,60 Q120,70 180,40 L280,60" fill="none" stroke="#d5c8b2" stroke-width="6" />
  <path d="M80,20 L100,200" fill="none" stroke="#d5c8b2" stroke-width="5" />
  <path d="M170,20 L160,200" fill="none" stroke="#bdae97" stroke-width="7" />
  <path d="M160,110 Q220,130 280,120" fill="none" stroke="#e0856c" stroke-width="3" />
  <circle cx="160" cy="110" r="6" fill="#b34033" />
  <!-- Compass -->
  <polygon points="250,150 255,175 250,170 245,175" fill="#2c2825" />
  <polygon points="250,190 255,175 250,170 245,175" fill="#8c7866" />
  <text x="250" y="145" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700">N</text>
  <text x="35" y="190" font-family="serif" font-size="10" font-weight="600" fill="#6d5e4a">OLD TOWN MAP FRAGMENT</text>
</svg>
`;

const SVG_MENU = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" width="100%" height="100%">
  <rect x="10" y="10" width="220" height="300" rx="4" fill="#eeddbb" stroke="#9e8964" stroke-width="2" />
  <text x="120" y="45" text-anchor="middle" font-family="serif" font-size="16" font-weight="800" fill="#3a2f20">BISTRO MENU</text>
  <line x1="40" y1="58" x2="200" y2="58" stroke="#3a2f20" stroke-width="1" />
  <text x="40" y="90" font-family="serif" font-size="11" font-weight="700" fill="#3a2f20">CAFÉ AU LAIT</text>
  <text x="200" y="90" text-anchor="end" font-family="monospace" font-size="11" fill="#3a2f20">€ 4.5</text>
  <text x="40" y="125" font-family="serif" font-size="11" font-weight="700" fill="#3a2f20">CROISSANT BEURRE</text>
  <text x="200" y="125" text-anchor="end" font-family="monospace" font-size="11" fill="#3a2f20">€ 3.2</text>
  <text x="40" y="160" font-family="serif" font-size="11" font-weight="700" fill="#3a2f20">TARTE AUX POMMES</text>
  <text x="200" y="160" text-anchor="end" font-family="monospace" font-size="11" fill="#3a2f20">€ 6.0</text>
  <rect x="40" y="210" width="160" height="50" rx="3" fill="#e0cb9e" stroke="#8c7850" stroke-width="1" />
  <text x="120" y="235" text-anchor="middle" font-family="serif" font-size="10" fill="#4d3e28">SPECIAL DU JOUR</text>
  <text x="120" y="250" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#6a583e">Chef's Saturday Recommendation</text>
</svg>
`;

// Decorative Tape SVGs
const SVG_PET_TAPE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100" width="100%" height="100%">
  <rect x="10" y="15" width="340" height="70" rx="2" fill="#ffffff" opacity="0.3" stroke="#475569" stroke-width="1" />
  <line x1="20" y1="50" x2="340" y2="50" stroke="#0f172a" stroke-width="1.5" />
  <circle cx="50" cy="50" r="14" fill="none" stroke="#0f172a" stroke-width="1.8" />
  <circle cx="110" cy="50" r="8" fill="#0f172a" />
  <rect x="155" y="36" width="28" height="28" fill="none" stroke="#0f172a" stroke-width="1.8" />
  <polygon points="230,36 245,64 215,64" fill="none" stroke="#0f172a" stroke-width="1.8" />
  <circle cx="295" cy="50" r="14" fill="none" stroke="#0f172a" stroke-width="1" stroke-dasharray="3,2" />
</svg>
`;

const SVG_LACE_TAPE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100" width="100%" height="100%">
  <path d="M10,20 L350,20 L350,80 Q335,90 320,80 Q305,90 290,80 Q275,90 260,80 Q245,90 230,80 Q215,90 200,80 Q185,90 170,80 Q155,90 140,80 Q125,90 110,80 Q95,90 80,80 Q65,90 50,80 Q35,90 20,80 L10,80 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" opacity="0.95" />
  <circle cx="35" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="80" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="125" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="170" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="215" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="260" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="305" cy="50" r="6" fill="none" stroke="#94a3b8" stroke-width="1.5" />
</svg>
`;

const SVG_SOLID_TAPE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 90" width="100%" height="100%">
  <path d="M12,18 L348,15 L345,75 L15,78 Z" fill="#d8cbba" stroke="#b8a894" stroke-width="1" opacity="0.95" />
  <text x="180" y="52" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#756552" letter-spacing="3">SOLID TAUPE WASHI</text>
</svg>
`;

const SVG_PATTERN_TAPE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="100%" height="100%">
  <rect x="10" y="15" width="340" height="80" rx="3" fill="#f5ede0" stroke="#cbb9a3" stroke-width="1.5" />
  <!-- Leaves and acorns pattern -->
  <path d="M40,55 Q55,30 70,55 Q55,75 40,55 Z" fill="#d97736" />
  <ellipse cx="120" cy="55" rx="8" ry="12" fill="#78593a" />
  <path d="M112,46 Q120,38 128,46 Z" fill="#4d351c" />
  <path d="M180,55 Q195,30 210,55 Q195,75 180,55 Z" fill="#c49a45" />
  <ellipse cx="260" cy="55" rx="8" ry="12" fill="#78593a" />
  <path d="M252,46 Q260,38 268,46 Z" fill="#4d351c" />
  <path d="M315,55 Q330,30 345,55 Q330,75 315,55 Z" fill="#a44c36" />
</svg>
`;

// Sticker SVGs
const SVG_STICKER_PERSON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="100%" height="100%">
  <circle cx="100" cy="60" r="22" fill="#fed7aa" stroke="#2c2825" stroke-width="2" />
  <path d="M78,60 C80,40 120,40 122,60 Z" fill="#451a03" />
  <!-- Coat -->
  <path d="M70,85 L130,85 L145,210 L55,210 Z" fill="#b45309" stroke="#2c2825" stroke-width="2" />
  <path d="M90,85 L100,140 L110,85" stroke="#2c2825" stroke-width="2" fill="none" />
  <!-- Legs -->
  <rect x="75" y="210" width="18" height="60" fill="#1e293b" />
  <rect x="107" y="210" width="18" height="60" fill="#1e293b" />
  <!-- Shoes -->
  <ellipse cx="80" cy="275" rx="14" ry="7" fill="#0f172a" />
  <ellipse cx="120" cy="275" rx="14" ry="7" fill="#0f172a" />
  <text x="100" y="295" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="#78350f">AUTUMN STROLL</text>
</svg>
`;

const SVG_STICKER_BUILDING = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" width="100%" height="100%">
  <rect x="40" y="80" width="160" height="150" fill="#fef3c7" stroke="#92400e" stroke-width="2" rx="4" />
  <polygon points="30,80 120,20 210,80" fill="#b45309" stroke="#78350f" stroke-width="2" />
  <!-- Arch door -->
  <path d="M95,230 L95,160 A 25 25 0 0 1 145 160 L145,230 Z" fill="#78350f" stroke="#451a03" stroke-width="2" />
  <!-- Windows -->
  <rect x="60" y="110" width="25" height="35" rx="2" fill="#ffffff" stroke="#92400e" stroke-width="1.5" />
  <rect x="155" y="110" width="25" height="35" rx="2" fill="#ffffff" stroke="#92400e" stroke-width="1.5" />
</svg>
`;

const SVG_STICKER_PLANT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="100%" height="100%">
  <!-- Ginkgo Leaf -->
  <path d="M110,190 Q112,140 110,110 C80,105 40,85 45,45 C65,25 95,50 110,70 C125,50 155,25 175,45 C180,85 140,105 110,110" 
        fill="#eab308" stroke="#ca8a04" stroke-width="2.5" />
  <line x1="110" y1="190" x2="110" y2="100" stroke="#a16207" stroke-width="2" />
</svg>
`;

const SVG_STICKER_FOOD = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200" width="100%" height="100%">
  <ellipse cx="110" cy="100" rx="70" ry="70" fill="#15803d" stroke="#14532d" stroke-width="2.5" />
  <ellipse cx="110" cy="100" rx="48" ry="48" fill="#fef9c3" stroke="#15803d" stroke-width="2" />
  <!-- Cream swirl center -->
  <circle cx="110" cy="100" r="22" fill="#ffffff" />
  <path d="M110,85 A 15 15 0 0 1 125 100" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round" />
</svg>
`;

const SVG_STICKER_TEXT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 100" width="100%" height="100%">
  <rect x="10" y="15" width="260" height="70" rx="35" fill="#fefce8" stroke="#ca8a04" stroke-width="2" />
  <text x="140" y="55" text-anchor="middle" font-family="serif" font-size="16" font-style="italic" font-weight="700" fill="#854d0e">Autumn Memories</text>
</svg>
`;

const SVG_STICKER_TRANSPARENT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240" width="100%" height="100%">
  <rect x="15" y="15" width="190" height="210" rx="8" fill="#ffffff" opacity="0.4" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
  <path d="M110,180 Q100,120 110,60" fill="none" stroke="#059669" stroke-width="2" />
  <circle cx="95" cy="100" r="10" fill="#10b981" opacity="0.8" />
  <circle cx="125" cy="80" r="8" fill="#10b981" opacity="0.8" />
  <text x="110" y="205" text-anchor="middle" font-family="monospace" font-size="9" fill="#475569">BOTANICAL 01</text>
</svg>
`;

const SVG_STICKER_PHOTO_OUTLINE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260" width="100%" height="100%">
  <rect x="15" y="15" width="190" height="230" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
  <rect x="30" y="30" width="160" height="150" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />
  <text x="110" y="110" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#94a3b8">PHOTO FRAME</text>
  <line x1="50" y1="210" x2="170" y2="210" stroke="#e2e8f0" stroke-width="2" />
</svg>
`;

// 3D Embellishments SVGs
const SVG_3D_PAPERCUT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="100%" height="100%">
  <!-- Shadow layer -->
  <path d="M40,240 L40,100 A 80 80 0 0 1 200 100 L200,240 Z" fill="#e2d8c5" />
  <!-- Mid layer -->
  <path d="M35,235 L35,95 A 85 85 0 0 1 205 95 L205,235 Z" fill="#f5ede0" stroke="#cfc0aa" stroke-width="1.5" />
  <!-- Inner Cutout -->
  <path d="M65,235 L65,125 A 55 55 0 0 1 175 125 L175,235 Z" fill="#fcf9f2" stroke="#cfc0aa" stroke-width="1.5" />
  <!-- Floral relief -->
  <circle cx="120" cy="70" r="12" fill="#cca87d" opacity="0.8" />
  <text x="120" y="210" text-anchor="middle" font-family="serif" font-size="10" font-weight="700" fill="#756249">3D PAPERCUT ARCH</text>
</svg>
`;

const SVG_3D_FOAM_TAPE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="100%" height="100%">
  <!-- Foam 3D cube block -->
  <polygon points="50,150 130,150 170,110 90,110" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
  <polygon points="50,150 130,150 130,70 50,70" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
  <polygon points="130,150 170,110 170,30 130,70" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
  <polygon points="50,70 130,70 170,30 90,30" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
  <text x="90" y="115" font-family="monospace" font-size="10" font-weight="700" fill="#475569">FOAM 3D</text>
</svg>
`;

const SVG_3D_PAPER_FRAME = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 300" width="100%" height="100%">
  <rect x="20" y="20" width="220" height="260" rx="8" fill="#fcf8f0" stroke="#cca87d" stroke-width="4" />
  <rect x="30" y="30" width="200" height="240" fill="none" stroke="#d5be9b" stroke-width="1.5" />
  <rect x="55" y="55" width="150" height="190" fill="#f3ece0" stroke="#cca87d" stroke-width="2" />
  <circle cx="130" cy="30" r="10" fill="#cca87d" />
  <circle cx="130" cy="270" r="10" fill="#cca87d" />
</svg>
`;

const SVG_3D_FOLD = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 220" width="100%" height="100%">
  <!-- Accordion fold panels -->
  <polygon points="20,40 80,20 80,180 20,200" fill="#f5ede0" stroke="#a89a84" stroke-width="1.5" />
  <polygon points="80,20 140,40 140,200 80,180" fill="#ebe0cf" stroke="#a89a84" stroke-width="1.5" />
  <polygon points="140,40 200,20 200,180 140,200" fill="#f5ede0" stroke="#a89a84" stroke-width="1.5" />
  <polygon points="200,20 260,40 260,200 200,180" fill="#ebe0cf" stroke="#a89a84" stroke-width="1.5" />
  <text x="140" y="115" text-anchor="middle" font-family="serif" font-size="11" font-weight="700" fill="#6d5e49">ACCORDION FOLD</text>
</svg>
`;

const SVG_3D_RIBBON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="100%" height="100%">
  <!-- Ribbon Bow -->
  <ellipse cx="90" cy="80" rx="45" ry="25" transform="rotate(-20 90 80)" fill="#9a3412" stroke="#7c2d12" stroke-width="2" />
  <ellipse cx="170" cy="80" rx="45" ry="25" transform="rotate(20 170 80)" fill="#9a3412" stroke="#7c2d12" stroke-width="2" />
  <circle cx="130" cy="85" r="16" fill="#c2410c" stroke="#7c2d12" stroke-width="2" />
  <path d="M120,95 Q100,160 80,175 L110,170 Q130,130 135,95 Z" fill="#9a3412" />
  <path d="M140,95 Q160,160 180,175 L150,170 Q130,130 125,95 Z" fill="#9a3412" />
</svg>
`;

const SVG_3D_LACE_TRIM = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="100%" height="100%">
  <rect x="10" y="20" width="300" height="40" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="1" />
  <!-- Scalloped lace border -->
  <path d="M10,60 Q25,85 40,60 Q55,85 70,60 Q85,85 100,60 Q115,85 130,60 Q145,85 160,60 Q175,85 190,60 Q205,85 220,60 Q235,85 250,60 Q265,85 280,60 Q295,85 310,60" 
        fill="#fdfbf7" stroke="#cbd5e1" stroke-width="2" />
  <circle cx="40" cy="40" r="5" fill="none" stroke="#94a3b8" stroke-width="1" />
  <circle cx="100" cy="40" r="5" fill="none" stroke="#94a3b8" stroke-width="1" />
  <circle cx="160" cy="40" r="5" fill="none" stroke="#94a3b8" stroke-width="1" />
  <circle cx="220" cy="40" r="5" fill="none" stroke="#94a3b8" stroke-width="1" />
  <circle cx="280" cy="40" r="5" fill="none" stroke="#94a3b8" stroke-width="1" />
</svg>
`;

const SVG_3D_PRESSED_FLOWER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260" width="100%" height="100%">
  <!-- Pressed violet petals -->
  <path d="M110,130 Q80,80 110,50 Q140,80 110,130 Z" fill="#7c3aed" opacity="0.85" stroke="#5b21b6" stroke-width="1.5" />
  <path d="M110,130 Q60,110 50,140 Q80,160 110,130 Z" fill="#8b5cf6" opacity="0.85" stroke="#5b21b6" stroke-width="1.5" />
  <path d="M110,130 Q160,110 170,140 Q140,160 110,130 Z" fill="#8b5cf6" opacity="0.85" stroke="#5b21b6" stroke-width="1.5" />
  <path d="M110,130 Q90,180 100,195 Q125,185 110,130 Z" fill="#6d28d9" opacity="0.85" stroke="#5b21b6" stroke-width="1.5" />
  <circle cx="110" cy="130" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
  <path d="M110,195 Q115,225 110,245" fill="none" stroke="#15803d" stroke-width="2" />
</svg>
`;

// -------------------------------------------------------------
// Initial Expanded Preset Materials Array (All 36 Items)
// -------------------------------------------------------------
export const EXPANDED_PHYSICAL_MATERIALS: PhysicalMaterial[] = [
  // ================= 1. 纸张类 Paper =================
  {
    id: 'pm-paper-tracing',
    type: 'paper',
    subType: '硫酸纸',
    name: '半透明磨砂硫酸纸',
    imageUrl: svgToDataUrl(SVG_TRACING_PAPER),
    widthMm: 90,
    heightMm: 120,
    remainingText: '10 张',
    allowTrim: true,
    notes: '75g 半透明描图纸，适合制作朦胧图层与文字垫底',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'pm-paper-kraft',
    type: 'paper',
    subType: '牛皮纸',
    name: '复古原色木浆牛皮纸',
    imageUrl: svgToDataUrl(SVG_KRAFT_PAPER),
    widthMm: 100,
    heightMm: 140,
    remainingText: '8 张',
    allowTrim: true,
    notes: '120g 糙面牛皮纸，富含天然木质纤维质感',
    createdAt: Date.now() - 86400000 * 5 - 100,
  },
  {
    id: 'pm-paper-washi',
    type: 'paper',
    subType: '和纸',
    name: '轻柔手工落水和纸',
    imageUrl: svgToDataUrl(SVG_WASHI_SHEET),
    widthMm: 85,
    heightMm: 115,
    remainingText: '5 张',
    allowTrim: true,
    notes: '自然毛边落水和纸，手撕边缘有独特的羽毛状纤维',
    createdAt: Date.now() - 86400000 * 5 - 200,
  },
  {
    id: 'pm-paper-cardstock',
    type: 'paper',
    subType: '彩色卡纸',
    name: '莫兰迪雾蓝彩色卡纸',
    imageUrl: svgToDataUrl(SVG_COLORED_CARD),
    widthMm: 90,
    heightMm: 120,
    remainingText: '6 张',
    allowTrim: true,
    notes: '250g 硬质特种彩色卡纸，适合作为拼贴背景基底',
    createdAt: Date.now() - 86400000 * 5 - 300,
  },
  {
    id: 'pm-paper-grid',
    type: 'paper',
    subType: '网格纸',
    name: '5mm 浅灰点阵网格纸',
    imageUrl: svgToDataUrl(SVG_GRID_PAPER),
    widthMm: 100,
    heightMm: 140,
    remainingText: '15 页',
    allowTrim: true,
    notes: '浅灰柔和坐标网格，对齐布局与书写手账的利器',
    createdAt: Date.now() - 86400000 * 5 - 400,
  },
  {
    id: 'pm-paper-newspaper',
    type: 'paper',
    subType: '复古报纸',
    name: '法文排版复古微黄报纸',
    imageUrl: svgToDataUrl(SVG_VINTAGE_NEWSPAPER),
    widthMm: 110,
    heightMm: 150,
    remainingText: '4 张',
    allowTrim: true,
    notes: '年代感泛黄报刊剪片，法文字体排版充满故事感',
    createdAt: Date.now() - 86400000 * 5 - 500,
  },
  {
    id: 'pm-paper-texture',
    type: 'paper',
    subType: '纹理纸',
    name: '棉麻细凹凸水彩纹理纸',
    imageUrl: svgToDataUrl(SVG_TEXTURED_PAPER),
    widthMm: 95,
    heightMm: 130,
    remainingText: '5 张',
    allowTrim: true,
    notes: '300g 纯棉水彩粗纹触感纸，吸收手绘色彩极佳',
    createdAt: Date.now() - 86400000 * 5 - 600,
  },
  {
    id: 'pm-paper-photo',
    type: 'paper',
    subType: '照片纸',
    name: '富士拍立得高光照片相纸',
    imageUrl: svgToDataUrl(SVG_PHOTO_PAPER),
    widthMm: 54,
    heightMm: 86,
    remainingText: '10 张',
    allowTrim: false,
    notes: '高光经典拍立得白边相纸，适合留存生活瞬间',
    createdAt: Date.now() - 86400000 * 5 - 700,
  },

  // ================= 2. 展馆票根 Tickets & Ephemera =================
  {
    id: 'pm-ticket-museum',
    type: 'ticket',
    subType: '展馆票根',
    name: '十月美术馆入场票根',
    imageUrl: svgToDataUrl(SVG_RECEIPT), // fallback clean stub
    widthMm: 110,
    heightMm: 55,
    remainingText: '1 张',
    allowTrim: true,
    notes: '米黄糙面厚纸，带有齿孔与日期印章',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'pm-ticket-cinema',
    type: 'ticket',
    subType: '电影票',
    name: '经典热敏打孔复古电影票',
    imageUrl: svgToDataUrl(SVG_CINEMA_TICKET),
    widthMm: 120,
    heightMm: 60,
    remainingText: '2 张',
    allowTrim: true,
    notes: '带打孔圆弧切角与金色排版，适合电影手账记录',
    createdAt: Date.now() - 86400000 * 4 - 100,
  },
  {
    id: 'pm-ticket-train',
    type: 'ticket',
    subType: '车票',
    name: '欧铁复古站台硬卡车票',
    imageUrl: svgToDataUrl(SVG_TRAIN_TICKET),
    widthMm: 105,
    heightMm: 50,
    remainingText: '1 张',
    allowTrim: true,
    notes: '厚质硬卡纸站台纪念票，印有车次与日期红章',
    createdAt: Date.now() - 86400000 * 4 - 200,
  },
  {
    id: 'pm-ticket-receipt',
    type: 'ticket',
    subType: '收据',
    name: '昭和风手写复古咖啡馆收据',
    imageUrl: svgToDataUrl(SVG_RECEIPT),
    widthMm: 80,
    heightMm: 130,
    remainingText: '3 张',
    allowTrim: true,
    notes: '底部带锯齿边缘，记录咖啡与甜品消费记忆',
    createdAt: Date.now() - 86400000 * 4 - 300,
  },
  {
    id: 'pm-ticket-stamp',
    type: 'ticket',
    subType: '邮票',
    name: '法兰西植物雕刻复古邮票',
    imageUrl: svgToDataUrl(SVG_STAMP),
    widthMm: 35,
    heightMm: 45,
    remainingText: '4 枚',
    allowTrim: false,
    notes: '经典齿孔背胶邮票，1984年植物雕刻版',
    createdAt: Date.now() - 86400000 * 4 - 400,
  },
  {
    id: 'pm-ticket-postcard',
    type: 'ticket',
    subType: '明信片',
    name: '京都秋日漫步水彩明信片',
    imageUrl: svgToDataUrl(SVG_POSTCARD),
    widthMm: 148,
    heightMm: 100,
    remainingText: '1 张',
    allowTrim: true,
    notes: '双面排版经典明信片，留白区域可书写经历手记',
    createdAt: Date.now() - 86400000 * 4 - 500,
  },
  {
    id: 'pm-ticket-map',
    type: 'ticket',
    subType: '地图碎片',
    name: '复古城市漫步手绘地图残页',
    imageUrl: svgToDataUrl(SVG_MAP_FRAGMENT),
    widthMm: 130,
    heightMm: 95,
    remainingText: '2 张',
    allowTrim: true,
    notes: '撕边手绘老街地图，标注街道与街角建筑位置',
    createdAt: Date.now() - 86400000 * 4 - 600,
  },
  {
    id: 'pm-ticket-menu',
    type: 'ticket',
    subType: '餐厅菜单',
    name: '法式小酒馆牛皮纸手写单页菜单',
    imageUrl: svgToDataUrl(SVG_MENU),
    widthMm: 90,
    heightMm: 160,
    remainingText: '1 张',
    allowTrim: true,
    notes: '牛皮糙纸印刷，包含每日推荐甜品与特调饮品',
    createdAt: Date.now() - 86400000 * 4 - 700,
  },

  // ================= 3. 和纸胶带类 Decorative Tape =================
  {
    id: 'pm-tape-washi',
    type: 'tape',
    subType: '和纸胶带',
    name: '秋日格纹和纸胶带',
    imageUrl: svgToDataUrl(SVG_SOLID_TAPE),
    widthMm: 15,
    remainingText: '整卷 (约 7m)',
    allowTrim: true,
    notes: '哑光经典格纹和纸，适合固定相片四角与装饰页边',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'pm-tape-pet',
    type: 'tape',
    subType: 'PET透明胶带',
    name: '极简线条黑白 PET 透明胶带',
    imageUrl: svgToDataUrl(SVG_PET_TAPE),
    widthMm: 25,
    remainingText: '整卷 (约 5m)',
    allowTrim: true,
    notes: '高透光光泽 PET 材质，自带几何图案与圆点线条',
    createdAt: Date.now() - 86400000 * 3 - 100,
  },
  {
    id: 'pm-tape-lace',
    type: 'tape',
    subType: '蕾丝胶带',
    name: '复古镂空纯白蕾丝胶带',
    imageUrl: svgToDataUrl(SVG_LACE_TAPE),
    widthMm: 20,
    remainingText: '约剩 3m',
    allowTrim: true,
    notes: '花边镂空钩织效果，带来柔和温暖的层次触感',
    createdAt: Date.now() - 86400000 * 3 - 200,
  },
  {
    id: 'pm-tape-solid',
    type: 'tape',
    subType: '纯色胶带',
    name: '奶杏暖灰纯色打底胶带',
    imageUrl: svgToDataUrl(SVG_SOLID_TAPE),
    widthMm: 15,
    remainingText: '整卷 (约 10m)',
    allowTrim: true,
    notes: '莫兰迪暖调纯色打底，撕边粘贴极具手作感',
    createdAt: Date.now() - 86400000 * 3 - 300,
  },
  {
    id: 'pm-tape-pattern',
    type: 'tape',
    subType: '图案胶带',
    name: '秋日落叶与橡果彩绘胶带',
    imageUrl: svgToDataUrl(SVG_PATTERN_TAPE),
    widthMm: 30,
    remainingText: '约剩 4m',
    allowTrim: true,
    notes: '宽幅彩绘秋日植物图案，适合直接作为手账封口',
    createdAt: Date.now() - 86400000 * 3 - 400,
  },

  // ================= 4. 贴纸类 Stickers =================
  {
    id: 'pm-sticker-person',
    type: 'sticker',
    subType: '人物贴纸',
    name: '复古风衣漫步人物手绘贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_PERSON),
    widthMm: 40,
    heightMm: 75,
    remainingText: '4 枚',
    allowTrim: false,
    notes: '秋日漫步人物手绘造型，为拼贴画面注入生活气息',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'pm-sticker-building',
    type: 'sticker',
    subType: '建筑贴纸',
    name: '微缩红砖教堂钟楼线稿贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_BUILDING),
    widthMm: 45,
    heightMm: 60,
    remainingText: '3 枚',
    allowTrim: false,
    notes: '精致欧洲古典建筑线稿，轮廓模切贴纸',
    createdAt: Date.now() - 86400000 * 2 - 100,
  },
  {
    id: 'pm-sticker-plant',
    type: 'sticker',
    subType: '植物贴纸',
    name: '金黄银杏叶模切贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_PLANT),
    widthMm: 35,
    heightMm: 40,
    remainingText: '6 枚',
    allowTrim: false,
    notes: '亮丽金黄秋叶外形，手账点缀必备',
    createdAt: Date.now() - 86400000 * 2 - 200,
  },
  {
    id: 'pm-sticker-food',
    type: 'sticker',
    subType: '食物贴纸',
    name: '日式抹茶切片蛋糕贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_FOOD),
    widthMm: 40,
    heightMm: 35,
    remainingText: '5 枚',
    allowTrim: false,
    notes: '清新翠绿抹茶蛋糕卷，记录下午茶惬意时光',
    createdAt: Date.now() - 86400000 * 2 - 300,
  },
  {
    id: 'pm-sticker-text',
    type: 'sticker',
    subType: '文字标签',
    name: '烫金「Autumn Memories」手写标签',
    imageUrl: svgToDataUrl(SVG_STICKER_TEXT),
    widthMm: 60,
    heightMm: 20,
    remainingText: '8 枚',
    allowTrim: false,
    notes: '复古连笔英文烫金文字标签，优雅定格记忆',
    createdAt: Date.now() - 86400000 * 2 - 400,
  },
  {
    id: 'pm-sticker-transparent',
    type: 'sticker',
    subType: '透明贴纸',
    name: '半透明植物标本硫酸纸贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_TRANSPARENT),
    widthMm: 40,
    heightMm: 50,
    remainingText: '4 枚',
    allowTrim: false,
    notes: '哑光半透质感，叠在照片上若隐若现',
    createdAt: Date.now() - 86400000 * 2 - 500,
  },
  {
    id: 'pm-sticker-outline',
    type: 'sticker',
    subType: '照片轮廓贴纸',
    name: '拍立得白色撕拉相框轮廓贴纸',
    imageUrl: svgToDataUrl(SVG_STICKER_PHOTO_OUTLINE),
    widthMm: 55,
    heightMm: 65,
    remainingText: '5 枚',
    allowTrim: false,
    notes: '白色镂空相框贴纸，可把任意照片裁剪嵌入内部',
    createdAt: Date.now() - 86400000 * 2 - 600,
  },

  // ================= 5. 立体装饰类 3D Embellishments =================
  {
    id: 'pm-3d-papercut',
    type: 'embellishment',
    subType: '立体纸雕',
    name: '多层古典拱门立体浮雕纸雕',
    imageUrl: svgToDataUrl(SVG_3D_PAPERCUT),
    widthMm: 60,
    heightMm: 80,
    remainingText: '2 枚',
    allowTrim: false,
    notes: '三层纸质错层雕刻，在光线下呈现丰富立体阴影',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'pm-3d-foam',
    type: 'embellishment',
    subType: '泡棉胶',
    name: '高密度 3D 立体双面泡棉方块',
    imageUrl: svgToDataUrl(SVG_3D_FOAM_TAPE),
    widthMm: 15,
    heightMm: 15,
    remainingText: '约 20 粒',
    allowTrim: true,
    notes: '厚度 2mm 高回弹海绵泡棉胶，使素材悬浮于纸面',
    createdAt: Date.now() - 86400000 - 100,
  },
  {
    id: 'pm-3d-frame',
    type: 'embellishment',
    subType: '纸质相框',
    name: '巴洛克浮雕镂空纸质相框',
    imageUrl: svgToDataUrl(SVG_3D_PAPER_FRAME),
    widthMm: 80,
    heightMm: 100,
    remainingText: '3 枚',
    allowTrim: false,
    notes: '厚卡纸烫金凹凸压纹，镂空内框可装裱焦点经历照片',
    createdAt: Date.now() - 86400000 - 200,
  },
  {
    id: 'pm-3d-fold',
    type: 'embellishment',
    subType: '折叠结构',
    name: '风琴褶手账迷你展开页',
    imageUrl: svgToDataUrl(SVG_3D_FOLD),
    widthMm: 70,
    heightMm: 90,
    remainingText: '2 套',
    allowTrim: true,
    notes: '四折折叠纸结构，翻开可增加数倍手账拼贴空间',
    createdAt: Date.now() - 86400000 - 300,
  },
  {
    id: 'pm-3d-ribbon',
    type: 'embellishment',
    subType: '丝带',
    name: '焦糖色双面真丝蝴蝶结丝带',
    imageUrl: svgToDataUrl(SVG_3D_RIBBON),
    widthMm: 50,
    heightMm: 30,
    remainingText: '3 枚',
    allowTrim: true,
    notes: '高质感丝光真丝缎带手工系结，拼贴触感极佳',
    createdAt: Date.now() - 86400000 - 400,
  },
  {
    id: 'pm-3d-lace',
    type: 'embellishment',
    subType: '蕾丝',
    name: '复古纯白花边手工钩织带',
    imageUrl: svgToDataUrl(SVG_3D_LACE_TRIM),
    widthMm: 80,
    heightMm: 25,
    remainingText: '4 条',
    allowTrim: true,
    notes: '棉线手工蕾丝花边，适合做为手账章节分隔底纹',
    createdAt: Date.now() - 86400000 - 500,
  },
  {
    id: 'pm-3d-flower',
    type: 'embellishment',
    subType: '压花',
    name: '天然风干紫罗兰立体真花标本',
    imageUrl: svgToDataUrl(SVG_3D_PRESSED_FLOWER),
    widthMm: 35,
    heightMm: 45,
    remainingText: '2 朵',
    allowTrim: false,
    notes: '真空干燥天然花瓣，色泽自然定格，具轻微立体厚度',
    createdAt: Date.now() - 86400000 - 600,
  },
];
