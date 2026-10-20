import { PhotoItem } from '../models/PhotoItem.ts';
import { PhysicalMaterial } from '../models/PhysicalMaterial.ts';

// Helper to convert inline SVG string to clean data URL
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Church Photo (Architecture)
const churchPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b8d4e3" />
      <stop offset="60%" stop-color="#e8ebdf" />
      <stop offset="100%" stop-color="#faeee0" />
    </linearGradient>
    <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a44c36" />
      <stop offset="100%" stop-color="#c8674c" />
    </linearGradient>
    <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3d4952" />
      <stop offset="100%" stop-color="#26313a" />
    </linearGradient>
  </defs>
  <!-- Sky -->
  <rect width="600" height="450" fill="url(#skyGrad)" />
  <!-- Ground -->
  <rect y="380" width="600" height="70" fill="#a89a87" />
  <path d="M0,380 Q300,375 600,380 L600,450 L0,450 Z" fill="#938472" opacity="0.4" />
  
  <!-- Church Main Hall -->
  <rect x="220" y="210" width="220" height="170" fill="url(#brickGrad)" rx="2" />
  <polygon points="215,210 330,130 445,210" fill="url(#roofGrad)" />
  
  <!-- Arch Windows -->
  <path d="M260,250 A 20 20 0 0 1 300 250 L 300 310 L 260 310 Z" fill="#2d3b48" stroke="#eed8be" stroke-width="4" />
  <path d="M360,250 A 20 20 0 0 1 400 250 L 400 310 L 360 310 Z" fill="#2d3b48" stroke="#eed8be" stroke-width="4" />
  
  <!-- Rose Window -->
  <circle cx="330" cy="180" r="22" fill="#2d3b48" stroke="#faeee0" stroke-width="4" />
  <circle cx="330" cy="180" r="14" fill="none" stroke="#eed8be" stroke-width="2" stroke-dasharray="3,3" />

  <!-- Bell Tower -->
  <rect x="140" y="110" width="85" height="270" fill="#8e3d2b" />
  <polygon points="135,110 182,25 230,110" fill="url(#roofGrad)" />
  <!-- Cross on Top -->
  <rect x="180" y="8" width="4" height="20" fill="#faeee0" />
  <rect x="174" y="13" width="16" height="4" fill="#faeee0" />
  
  <!-- Clock -->
  <circle cx="182" cy="150" r="24" fill="#faeee0" stroke="#4a251a" stroke-width="4" />
  <line x1="182" y1="150" x2="182" y2="136" stroke="#2c2825" stroke-width="3" stroke-linecap="round" />
  <line x1="182" y1="150" x2="194" y2="150" stroke="#2c2825" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Tower Arches -->
  <path d="M160,230 A 12 12 0 0 1 184 230 L 184 270 L 160 270 Z" fill="#221815" />
  <path d="M190,230 A 12 12 0 0 1 214 230 L 214 270 L 190 270 Z" fill="#221815" />

  <!-- Autumn foliage trees -->
  <circle cx="90" cy="310" r="65" fill="#e28c38" opacity="0.85" />
  <circle cx="130" cy="330" r="45" fill="#c46a2a" opacity="0.9" />
  <circle cx="490" cy="290" r="70" fill="#d89f31" opacity="0.88" />
  <circle cx="450" cy="320" r="50" fill="#b8562d" opacity="0.92" />
  
  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 14:20</text>
</svg>
`;

// 2. Cafe Building Photo (Architecture)
const cafePhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="cafeWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dfd9cd" />
      <stop offset="100%" stop-color="#c4bcb0" />
    </linearGradient>
    <pattern id="awningStripe" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="12" height="24" fill="#2d5f47" />
      <rect x="12" width="12" height="24" fill="#faeee0" />
    </pattern>
  </defs>
  <!-- Background building -->
  <rect width="600" height="450" fill="#eae6df" />
  <!-- Sky slit -->
  <rect width="600" height="90" fill="#bed3df" />
  
  <!-- Facade Upper Floor -->
  <rect x="80" y="80" width="440" height="150" fill="url(#cafeWall)" stroke="#8c8275" stroke-width="2" />
  <!-- Upper Windows -->
  <rect x="130" y="110" width="55" height="85" fill="#323f4b" rx="4" stroke="#faeee0" stroke-width="4" />
  <rect x="230" y="110" width="55" height="85" fill="#323f4b" rx="4" stroke="#faeee0" stroke-width="4" />
  <rect x="330" y="110" width="55" height="85" fill="#323f4b" rx="4" stroke="#faeee0" stroke-width="4" />
  <rect x="430" y="110" width="55" height="85" fill="#323f4b" rx="4" stroke="#faeee0" stroke-width="4" />

  <!-- Ground Floor Storefront -->
  <rect x="80" y="230" width="440" height="170" fill="#3e3834" />
  <!-- Striped Awning -->
  <polygon points="60,230 540,230 520,265 80,265" fill="url(#awningStripe)" stroke="#221815" stroke-width="2" />
  
  <!-- Large Glass Windows & Warm Interior -->
  <rect x="110" y="275" width="160" height="110" fill="#f0dbad" stroke="#685c52" stroke-width="5" />
  <line x1="190" y1="275" x2="190" y2="385" stroke="#685c52" stroke-width="4" />
  
  <!-- Entrance Wooden Door -->
  <rect x="300" y="270" width="80" height="130" fill="#583c28" stroke="#faeee0" stroke-width="3" />
  <rect x="315" y="285" width="50" height="60" fill="#fae8c8" stroke="#3e2818" stroke-width="2" />
  <circle cx="365" cy="340" r="4" fill="#eed8be" />

  <!-- Signboard -->
  <rect x="410" y="280" width="90" height="50" fill="#1b2e23" rx="4" stroke="#d5b583" stroke-width="2" />
  <text x="455" y="310" text-anchor="middle" font-family="serif" font-size="14" fill="#faeee0" font-weight="600">CAFÉ</text>

  <!-- Pavement & Outdoor Table -->
  <rect y="400" width="600" height="50" fill="#9f9689" />
  <circle cx="160" cy="415" r="22" fill="#5c4838" />
  <circle cx="130" cy="425" r="12" fill="#8c7866" />
  <circle cx="190" cy="425" r="12" fill="#8c7866" />
  
  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 10:15</text>
</svg>
`;

// 3. Stone Arch Pavilion (Architecture)
const archPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cfc9be" />
      <stop offset="100%" stop-color="#9d9588" />
    </linearGradient>
  </defs>
  <!-- Background Park Trees -->
  <rect width="600" height="450" fill="#d3e2d6" />
  <circle cx="100" cy="200" r="120" fill="#678c6b" opacity="0.7" />
  <circle cx="500" cy="180" r="140" fill="#587a5c" opacity="0.75" />
  <circle cx="300" cy="150" r="90" fill="#7d9b6d" opacity="0.6" />

  <!-- Classical Arch Structure -->
  <!-- Base steps -->
  <rect x="80" y="380" width="440" height="20" fill="#6a6358" />
  <rect x="100" y="360" width="400" height="20" fill="#857c70" />

  <!-- Left Column -->
  <rect x="130" y="160" width="70" height="200" fill="url(#archGrad)" stroke="#554e44" stroke-width="2" />
  <rect x="120" y="150" width="90" height="15" fill="#b0a89b" />
  <rect x="120" y="350" width="90" height="15" fill="#b0a89b" />

  <!-- Right Column -->
  <rect x="400" y="160" width="70" height="200" fill="url(#archGrad)" stroke="#554e44" stroke-width="2" />
  <rect x="390" y="150" width="90" height="15" fill="#b0a89b" />
  <rect x="390" y="350" width="90" height="15" fill="#b0a89b" />

  <!-- Central Roman Arch Vault -->
  <path d="M200,220 A 100 100 0 0 1 400 220 L 400 360 L 200 360 Z" fill="#9eb0a2" opacity="0.35" />
  <path d="M200,220 A 100 100 0 0 1 400 220" fill="none" stroke="#685f54" stroke-width="16" />
  
  <!-- Entablature / Top Frieze -->
  <rect x="110" y="90" width="380" height="60" fill="url(#archGrad)" stroke="#554e44" stroke-width="3" />
  <polygon points="90,90 300,40 510,90" fill="#7a7062" stroke="#483f34" stroke-width="2" />
  <!-- Inscription -->
  <text x="300" y="125" text-anchor="middle" font-family="serif" font-size="15" fill="#3a342c" letter-spacing="4" font-weight="700">MUSEUM GARDEN</text>

  <rect y="400" width="600" height="50" fill="#5e685a" />
  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 16:45</text>
</svg>
`;

// 4. Autumn Leaves Photo (Nature / Non-architecture)
const leavesPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <!-- Granite stone floor -->
  <rect width="600" height="450" fill="#a49e97" />
  <line x1="0" y1="180" x2="600" y2="190" stroke="#7e7770" stroke-width="3" stroke-dasharray="12,6" />
  <line x1="280" y1="0" x2="260" y2="450" stroke="#7e7770" stroke-width="3" stroke-dasharray="14,8" />
  
  <!-- Ginkgo Leaf 1 -->
  <path d="M180,210 Q220,130 300,160 Q260,220 230,260 Z" fill="#f0be27" stroke="#b88909" stroke-width="2" />
  <line x1="230" y1="260" x2="260" y2="310" stroke="#8c6a0f" stroke-width="3" stroke-linecap="round" />

  <!-- Ginkgo Leaf 2 -->
  <path d="M340,240 Q410,180 460,230 Q400,280 370,300 Z" fill="#e5aa1f" stroke="#b88909" stroke-width="2" />
  <line x1="370" y1="300" x2="380" y2="340" stroke="#8c6a0f" stroke-width="2.5" stroke-linecap="round" />

  <!-- Red Maple Leaf -->
  <path d="M120,310 Q140,260 160,270 Q180,240 200,270 Q220,260 210,300 Q240,320 220,340 Q180,350 160,370 Q150,330 120,310 Z" fill="#c43b2a" stroke="#802115" stroke-width="2" />
  <line x1="170" y1="320" x2="190" y2="400" stroke="#5a180f" stroke-width="3" />

  <!-- Water drops -->
  <circle cx="210" cy="180" r="4" fill="#ffffff" opacity="0.7" />
  <circle cx="410" cy="230" r="5" fill="#ffffff" opacity="0.6" />
  
  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 15:02</text>
</svg>
`;

// 5. Matcha & Latte Photo (Food / Non-architecture)
const dessertPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <!-- Wooden Table -->
  <rect width="600" height="450" fill="#be9368" />
  <!-- Oak Tray -->
  <rect x="80" y="60" width="440" height="330" fill="#dfbe98" rx="16" stroke="#946d45" stroke-width="8" />
  
  <!-- Matcha Roll Cake Plate -->
  <circle cx="230" cy="225" r="95" fill="#faf5ee" stroke="#ded4c5" stroke-width="4" />
  <!-- Cake slice -->
  <path d="M180,225 A 50 50 0 1 1 280 225 L 230 225 Z" fill="#678c4a" stroke="#486830" stroke-width="3" />
  <circle cx="230" cy="225" r="24" fill="#faf8f2" />
  <circle cx="230" cy="225" r="10" fill="#d42c38" />

  <!-- Coffee Cup & Saucer -->
  <circle cx="390" cy="225" r="80" fill="#ede8de" stroke="#cfc7b8" stroke-width="4" />
  <circle cx="390" cy="225" r="55" fill="#643b1e" stroke="#faeee0" stroke-width="6" />
  <!-- Latte Art Leaf -->
  <path d="M375,235 C370,210 390,200 390,195 C390,200 410,210 405,235 Z" fill="#faeee0" />
  <line x1="390" y1="190" x2="390" y2="250" stroke="#faeee0" stroke-width="3" stroke-linecap="round" />

  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 11:30</text>
</svg>
`;

// 6. Street Cat on Bench (Animal / Non-architecture)
const catPhotoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <!-- Cobblestones -->
  <rect width="600" height="450" fill="#cfc8bc" />
  <!-- Wooden bench slats -->
  <rect x="50" y="180" width="500" height="24" fill="#755239" rx="3" />
  <rect x="50" y="220" width="500" height="24" fill="#8c6448" rx="3" />
  <rect x="50" y="260" width="500" height="24" fill="#755239" rx="3" />

  <!-- Sleeping Calico Cat -->
  <ellipse cx="300" cy="210" rx="90" ry="60" fill="#faeee0" stroke="#3a2f27" stroke-width="3" />
  <!-- Calico patches -->
  <path d="M240,180 Q270,160 290,190 Q260,220 240,180 Z" fill="#d26e2e" />
  <path d="M330,190 Q370,170 365,220 Q325,230 330,190 Z" fill="#3a2f27" />
  <!-- Cat Ears -->
  <polygon points="220,165 240,135 255,160" fill="#d26e2e" stroke="#3a2f27" stroke-width="2" />
  <polygon points="255,160 270,135 285,165" fill="#faeee0" stroke="#3a2f27" stroke-width="2" />
  <!-- Sleeping eyes & whiskers -->
  <path d="M225,185 Q235,195 245,185" fill="none" stroke="#3a2f27" stroke-width="2.5" stroke-linecap="round" />
  <path d="M350,240 Q400,260 410,230" fill="none" stroke="#faeee0" stroke-width="16" stroke-linecap="round" />

  <text x="560" y="430" text-anchor="end" font-family="sans-serif" font-size="12" fill="#ffffff" opacity="0.8" font-weight="600">2026.10.10 13:10</text>
</svg>
`;

// ==========================================
// Hand-drawn Architectural Pen Line Art Sketches
// (For Demo Generation: Crisp, authentic line art with hatching, transparent background)
// ==========================================

export const DEMO_CHURCH_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- Transparent background for collage layering, pure black line ink -->
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <!-- Bell Tower Spire -->
    <path d="M190,80 L230,10 L270,80" stroke-width="2.5" />
    <line x1="230" y1="2" x2="230" y2="10" stroke-width="2" />
    <line x1="225" y1="5" x2="235" y2="5" stroke-width="2" />
    
    <!-- Spire Hatching -->
    <line x1="220" y1="35" x2="240" y2="35" stroke-width="1" />
    <line x1="210" y1="55" x2="250" y2="55" stroke-width="1" />
    <line x1="200" y1="70" x2="260" y2="70" stroke-width="1" />

    <!-- Tower Body -->
    <rect x="185" y="80" width="90" height="240" stroke-width="2.5" fill="#fffefb" />
    <line x1="180" y1="80" x2="280" y2="80" stroke-width="2" />
    <line x1="180" y1="120" x2="280" y2="120" stroke-width="1.5" />

    <!-- Clock -->
    <circle cx="230" cy="150" r="22" stroke-width="2" fill="#ffffff" />
    <circle cx="230" cy="150" r="18" stroke-width="0.8" stroke-dasharray="2,2" />
    <line x1="230" y1="150" x2="230" y2="136" stroke-width="2.5" />
    <line x1="230" y1="150" x2="242" y2="150" stroke-width="2" />
    <circle cx="230" cy="150" r="2" fill="#22201e" />

    <!-- Tower Arch Windows -->
    <path d="M205,210 A 10 10 0 0 1 225 210 L 225 250 L 205 250 Z" stroke-width="2" fill="#22201e" />
    <path d="M235,210 A 10 10 0 0 1 255 210 L 255 250 L 235 250 Z" stroke-width="2" fill="#22201e" />

    <!-- Church Nave / Main Hall -->
    <polygon points="275,180 375,110 475,180" stroke-width="2.5" fill="#fffefb" />
    <rect x="275" y="180" width="200" height="140" stroke-width="2.5" fill="#fffefb" />
    
    <!-- Rose Window -->
    <circle cx="375" cy="155" r="20" stroke-width="2" fill="#fffefb" />
    <circle cx="375" cy="155" r="13" stroke-width="1" />
    <line x1="375" y1="135" x2="375" y2="175" stroke-width="1" />
    <line x1="355" y1="155" x2="395" y2="155" stroke-width="1" />
    <line x1="361" y1="141" x2="389" y2="169" stroke-width="1" />
    <line x1="361" y1="169" x2="389" y2="141" stroke-width="1" />

    <!-- Nave Arch Windows -->
    <path d="M310,215 A 16 16 0 0 1 342 215 L 342 280 L 310 280 Z" stroke-width="2" fill="#fffefb" />
    <line x1="326" y1="200" x2="326" y2="280" stroke-width="1" />
    <line x1="310" y1="240" x2="342" y2="240" stroke-width="1" />

    <path d="M400,215 A 16 16 0 0 1 432 215 L 432 280 L 400 280 Z" stroke-width="2" fill="#fffefb" />
    <line x1="416" y1="200" x2="416" y2="280" stroke-width="1" />
    <line x1="400" y1="240" x2="432" y2="240" stroke-width="1" />

    <!-- Brickwork Texture Hatching -->
    <g stroke-width="0.8" opacity="0.65">
      <line x1="192" y1="175" x2="210" y2="175" />
      <line x1="200" y1="182" x2="220" y2="182" />
      <line x1="245" y1="175" x2="265" y2="175" />
      <line x1="285" y1="220" x2="300" y2="220" />
      <line x1="288" y1="228" x2="305" y2="228" />
      <line x1="445" y1="230" x2="465" y2="230" />
      <line x1="440" y1="238" x2="460" y2="238" />
      <line x1="355" y1="270" x2="385" y2="270" />
    </g>

    <!-- Ground Line -->
    <path d="M150,320 L500,320" stroke-width="2" />
    <path d="M160,325 L490,325" stroke-width="1" stroke-dasharray="4,4" />

    <!-- Delicate Ginkgo Branch Accent -->
    <path d="M150,150 Q120,130 90,140" stroke-width="1.5" />
    <circle cx="95" cy="135" r="8" stroke-width="1.2" />
    <circle cx="115" cy="125" r="7" stroke-width="1.2" />
    <circle cx="130" cy="140" r="6" stroke-width="1.2" />
  </g>
</svg>
`;

export const DEMO_CAFE_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <!-- Roof Cornice -->
    <line x1="60" y1="70" x2="440" y2="70" stroke-width="3" />
    <line x1="70" y1="80" x2="430" y2="80" stroke-width="1.5" />
    <rect x="75" y="80" width="350" height="280" stroke-width="2" fill="#fffefb" />

    <!-- Upper Windows -->
    <g stroke-width="1.8" fill="#ffffff">
      <rect x="110" y="110" width="45" height="70" rx="2" />
      <line x1="132" y1="110" x2="132" y2="180" stroke-width="1" />
      <line x1="110" y1="145" x2="155" y2="145" stroke-width="1" />

      <rect x="195" y="110" width="45" height="70" rx="2" />
      <line x1="217" y1="110" x2="217" y2="180" stroke-width="1" />
      <line x1="195" y1="145" x2="240" y2="145" stroke-width="1" />

      <rect x="280" y="110" width="45" height="70" rx="2" />
      <line x1="302" y1="110" x2="302" y2="180" stroke-width="1" />
      <line x1="280" y1="145" x2="325" y2="145" stroke-width="1" />

      <rect x="360" y="110" width="45" height="70" rx="2" />
      <line x1="382" y1="110" x2="382" y2="180" stroke-width="1" />
      <line x1="360" y1="145" x2="405" y2="145" stroke-width="1" />
    </g>

    <!-- Awning -->
    <polygon points="60,210 440,210 420,245 80,245" stroke-width="2.5" fill="#fffefb" />
    <g stroke-width="1.2">
      <line x1="110" y1="210" x2="105" y2="245" />
      <line x1="140" y1="210" x2="135" y2="245" />
      <line x1="170" y1="210" x2="165" y2="245" />
      <line x1="200" y1="210" x2="195" y2="245" />
      <line x1="230" y1="210" x2="225" y2="245" />
      <line x1="260" y1="210" x2="255" y2="245" />
      <line x1="290" y1="210" x2="285" y2="245" />
      <line x1="320" y1="210" x2="315" y2="245" />
      <line x1="350" y1="210" x2="345" y2="245" />
      <line x1="380" y1="210" x2="375" y2="245" />
      <line x1="410" y1="210" x2="405" y2="245" />
    </g>

    <!-- Cafe Large Display Window -->
    <rect x="100" y="260" width="160" height="95" stroke-width="2.5" fill="#ffffff" />
    <line x1="180" y1="260" x2="180" y2="355" stroke-width="1.5" />
    
    <!-- Cafe Door -->
    <rect x="290" y="255" width="70" height="105" stroke-width="2.5" fill="#fffefb" />
    <rect x="302" y="268" width="46" height="50" stroke-width="1.5" />
    <circle cx="345" cy="315" r="3" fill="#22201e" />

    <!-- Hanging Signboard -->
    <rect x="375" y="265" width="45" height="35" rx="3" stroke-width="1.8" />
    <text x="397" y="287" text-anchor="middle" font-family="serif" font-size="10" fill="#22201e" font-weight="700">CAFÉ</text>

    <!-- Ground & Sidewalk Chair -->
    <line x1="50" y1="360" x2="450" y2="360" stroke-width="2.5" />
    <line x1="120" y1="360" x2="120" y2="390" stroke-width="1.5" />
    <line x1="150" y1="360" x2="150" y2="390" stroke-width="1.5" />
    <line x1="110" y1="375" x2="160" y2="375" stroke-width="2" />
  </g>
</svg>
`;

export const DEMO_ARCH_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <!-- Top Pediment -->
    <polygon points="90,110 250,55 410,110" stroke-width="2.5" fill="#fffefb" />
    <rect x="110" y="110" width="280" height="45" stroke-width="2" fill="#fffefb" />
    <text x="250" y="137" text-anchor="middle" font-family="serif" font-size="12" fill="#22201e" letter-spacing="3" font-weight="700">MUSEUM</text>

    <!-- Arch Architrave -->
    <path d="M180,210 A 70 70 0 0 1 320 210" stroke-width="3" />
    <path d="M190,215 A 60 60 0 0 1 310 215" stroke-width="1" stroke-dasharray="3,3" />

    <!-- Left Pillar -->
    <rect x="130" y="155" width="50" height="180" stroke-width="2.2" fill="#fffefb" />
    <line x1="145" y1="165" x2="145" y2="325" stroke-width="0.8" />
    <line x1="155" y1="165" x2="155" y2="325" stroke-width="0.8" />
    <line x1="165" y1="165" x2="165" y2="325" stroke-width="0.8" />

    <!-- Right Pillar -->
    <rect x="320" y="155" width="50" height="180" stroke-width="2.2" fill="#fffefb" />
    <line x1="335" y1="165" x2="335" y2="325" stroke-width="0.8" />
    <line x1="345" y1="165" x2="345" y2="325" stroke-width="0.8" />
    <line x1="355" y1="165" x2="355" y2="325" stroke-width="0.8" />

    <!-- Steps -->
    <rect x="90" y="335" width="320" height="15" stroke-width="2" fill="#fffefb" />
    <rect x="75" y="350" width="350" height="20" stroke-width="2.5" fill="#fffefb" />
    <line x1="50" y1="370" x2="450" y2="370" stroke-width="2" />
  </g>
</svg>
`;

// Washi Tape SVG Material
export const DEMO_WASHI_TAPE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="100%" height="100%">
  <defs>
    <pattern id="plaidPattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="#f4ebd9" />
      <rect width="15" height="30" fill="#e2d3bb" opacity="0.6" />
      <rect width="30" height="15" fill="#b8c6bb" opacity="0.5" />
      <line x1="0" y1="15" x2="30" y2="15" stroke="#788b7f" stroke-width="1" />
      <line x1="15" y1="0" x2="15" y2="30" stroke="#788b7f" stroke-width="1" />
    </pattern>
  </defs>
  <!-- Torn paper tape edge -->
  <path d="M10,25 Q15,15 20,25 Q25,35 30,20 L370,20 Q375,30 380,20 Q385,35 390,25 L385,95 Q380,105 375,95 Q370,85 365,100 L25,100 Q20,85 15,95 Q10,105 5,95 Z" 
        fill="url(#plaidPattern)" stroke="#8e8376" stroke-width="1" opacity="0.92" />
</svg>
`;

// Vintage Museum Ticket Stub SVG Material
export const DEMO_TICKET_STUB_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <!-- Aged paper background -->
  <rect x="10" y="10" width="300" height="160" rx="6" fill="#f7f2e7" stroke="#b4aa98" stroke-width="2" />
  <!-- Perforation notches -->
  <circle cx="10" cy="90" r="14" fill="#fbf9f5" />
  <circle cx="310" cy="90" r="14" fill="#fbf9f5" />
  <line x1="210" y1="12" x2="210" y2="168" stroke="#a49a88" stroke-width="1.5" stroke-dasharray="4,4" />
  
  <text x="35" y="48" font-family="serif" font-size="14" font-weight="700" fill="#2d2926">OCTOBER GALLERY</text>
  <text x="35" y="70" font-family="sans-serif" font-size="11" fill="#756b60">ADMISSION TICKET · NO. 8421</text>
  <text x="35" y="105" font-family="monospace" font-size="13" font-weight="700" fill="#a44c36">2026.10.10 SAT</text>
  <text x="35" y="130" font-family="sans-serif" font-size="10" fill="#90877d">VALID ONCE · KEEP FOR JOURNAL</text>

  <!-- Stub Right Part -->
  <text x="235" y="60" font-family="serif" font-size="12" font-weight="700" fill="#2d2926">STUB</text>
  <text x="225" y="100" font-family="monospace" font-size="16" font-weight="700" fill="#2d2926">¥ 45</text>
  <text x="230" y="135" font-family="sans-serif" font-size="9" fill="#90877d">ADMIT 1</text>
</svg>
`;

// Botanic Stamp Sticker SVG Material
export const DEMO_BOTANIC_STAMP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="100%" height="100%">
  <!-- Stamp perforated border -->
  <rect x="15" y="15" width="210" height="250" fill="#ffffff" stroke="#c0b5a3" stroke-width="2" rx="4" />
  <rect x="25" y="25" width="190" height="230" fill="#f6f3eb" stroke="#a29685" stroke-width="1" />
  
  <!-- Plant Illustration inside Stamp -->
  <path d="M120,210 Q110,150 120,80" fill="none" stroke="#3b573e" stroke-width="2.5" stroke-linecap="round" />
  <!-- Leaves -->
  <ellipse cx="105" cy="160" rx="20" ry="10" transform="rotate(-30 105 160)" fill="#547858" />
  <ellipse cx="135" cy="140" rx="20" ry="10" transform="rotate(30 135 140)" fill="#688d6d" />
  <ellipse cx="108" cy="115" rx="16" ry="8" transform="rotate(-35 108 115)" fill="#547858" />
  <ellipse cx="130" cy="95" rx="14" ry="7" transform="rotate(25 130 95)" fill="#688d6d" />
  
  <text x="120" y="235" text-anchor="middle" font-family="serif" font-size="11" font-weight="600" fill="#3b573e" letter-spacing="1">HERBARIUM 1984</text>
</svg>
`;

export const DEMO_PROJECT_ID = 'demo-project-saturday';

export const INITIAL_DEMO_PHOTOS: PhotoItem[] = [
  {
    id: 'demo-photo-church',
    projectId: DEMO_PROJECT_ID,
    name: '周六下午·砖红钟楼教堂',
    url: svgToDataUrl(churchPhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['建筑', '历史', '钟楼'],
    isBuilding: true,
    description: '画面中央有一座轮廓清楚的砖红尖顶教堂与钟楼，砖石结构鲜明。',
    width: 600,
    height: 450,
    isDemo: true,
  },
  {
    id: 'demo-photo-cafe',
    projectId: DEMO_PROJECT_ID,
    name: '周六上午·街角转角咖啡馆',
    url: svgToDataUrl(cafePhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['建筑', '街景', '立面'],
    isBuilding: true,
    description: '街角红砖咖啡馆建筑立面与复古绿色条纹遮阳篷，门窗比例工整。',
    width: 600,
    height: 450,
    isDemo: true,
  },
  {
    id: 'demo-photo-arch',
    projectId: DEMO_PROJECT_ID,
    name: '周六傍晚·美术馆花园石拱门',
    url: svgToDataUrl(archPhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['建筑', '拱门', '石柱'],
    isBuilding: true,
    description: '画面中有一座带有古典石柱的半圆拱门，结构对称、线条分明。',
    width: 600,
    height: 450,
    isDemo: true,
  },
  {
    id: 'demo-photo-leaves',
    projectId: DEMO_PROJECT_ID,
    name: '石板路散落的银杏秋叶',
    url: svgToDataUrl(leavesPhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['植物', '自然', '落叶'],
    isBuilding: false,
    description: '雨后石板地面上的秋叶特写，非建筑主体。',
    width: 600,
    height: 450,
    isDemo: true,
  },
  {
    id: 'demo-photo-dessert',
    projectId: DEMO_PROJECT_ID,
    name: '咖啡馆木托盘抹茶蛋糕',
    url: svgToDataUrl(dessertPhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['食物', '甜品', '咖啡'],
    isBuilding: false,
    description: '室内餐桌上的甜点与热饮特写，非建筑主体。',
    width: 600,
    height: 450,
    isDemo: true,
  },
  {
    id: 'demo-photo-cat',
    projectId: DEMO_PROJECT_ID,
    name: '木长椅上打盹的三花猫',
    url: svgToDataUrl(catPhotoSvg),
    capturedAt: '2026-10-10',
    dateUnknown: false,
    tags: ['动物', '猫咪', '街景'],
    isBuilding: false,
    description: '长椅上的猫咪特写，非建筑主体。',
    width: 600,
    height: 450,
    isDemo: true,
  },
];

export const DEMO_PHOTO_SKETCHES: Record<string, { svg: string; name: string }> = {
  'demo-photo-church': {
    svg: DEMO_CHURCH_SKETCH_SVG,
    name: '钟楼教堂·黑白建筑线稿',
  },
  'demo-photo-cafe': {
    svg: DEMO_CAFE_SKETCH_SVG,
    name: '街角咖啡馆·黑白立面线稿',
  },
  'demo-photo-arch': {
    svg: DEMO_ARCH_SKETCH_SVG,
    name: '石质拱门·黑白古典线稿',
  },
};

export const DEMO_ANIMAL_CAT_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <path d="M110,260 C90,240 85,190 120,160 C150,130 220,130 270,150 C310,170 325,210 320,250 C310,285 270,305 210,305 C150,305 125,285 110,260 Z" stroke-width="2.5" fill="#ffffff" />
    <path d="M315,255 C330,290 280,325 210,325 C160,325 120,310 100,285" stroke-width="3" stroke-linecap="round" />
    <path d="M100,285 C90,270 95,255 105,250" stroke-width="2.5" />
    <path d="M125,170 C120,150 140,135 155,145" stroke-width="2.5" />
    <polygon points="125,170 115,130 145,145" stroke-width="2.2" fill="#fffefb" />
    <polygon points="155,145 175,120 185,150" stroke-width="2.2" fill="#fffefb" />
    <line x1="123" y1="160" x2="128" y2="140" stroke-width="1.2" />
    <line x1="168" y1="145" x2="175" y2="132" stroke-width="1.2" />
    <path d="M140,185 Q150,195 160,188" stroke-width="2" />
    <path d="M172,188 Q182,195 192,185" stroke-width="2" />
    <path d="M166,195 L166,203" stroke-width="1.8" />
    <path d="M158,206 Q166,212 174,206" stroke-width="1.8" />
    <line x1="135" y1="195" x2="95" y2="190" stroke-width="1.2" />
    <line x1="135" y1="202" x2="90" y2="205" stroke-width="1.2" />
    <line x1="138" y1="208" x2="100" y2="218" stroke-width="1.2" />
    <line x1="192" y1="195" x2="230" y2="190" stroke-width="1.2" />
    <line x1="192" y1="202" x2="235" y2="205" stroke-width="1.2" />
    <line x1="190" y1="208" x2="228" y2="218" stroke-width="1.2" />
    <g stroke-width="0.9" opacity="0.7">
      <path d="M210,150 Q235,165 240,195 Q225,210 205,195 Z" fill="#22201e" opacity="0.15" />
      <line x1="215" y1="160" x2="230" y2="175" />
      <line x1="220" y1="165" x2="235" y2="180" />
      <line x1="225" y1="170" x2="240" y2="185" />
      <path d="M170,240 Q185,255 200,245" stroke-width="2" />
      <line x1="180" y1="243" x2="180" y2="252" stroke-width="1.5" />
      <line x1="190" y1="243" x2="190" y2="252" stroke-width="1.5" />
    </g>
  </g>
</svg>
`;

export const DEMO_SIGNPOST_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <line x1="40" y1="70" x2="40" y2="260" stroke-width="4" />
    <line x1="40" y1="80" x2="310" y2="80" stroke-width="3.5" />
    <path d="M40,210 Q140,200 230,80" stroke-width="3" />
    <path d="M230,80 Q270,50 310,80 Q280,110 250,85" stroke-width="2" />
    <path d="M60,130 Q110,130 90,85" stroke-width="2" />
    <line x1="120" y1="80" x2="120" y2="130" stroke-width="2" stroke-dasharray="4,4" />
    <line x1="250" y1="80" x2="250" y2="130" stroke-width="2" stroke-dasharray="4,4" />
    <rect x="85" y="130" width="200" height="150" rx="12" stroke-width="3" fill="#ffffff" />
    <rect x="95" y="140" width="180" height="130" rx="8" stroke-width="1.2" stroke-dasharray="3,2" />
    <text x="185" y="178" text-anchor="middle" font-family="serif" font-size="14" font-weight="700" fill="#22201e" letter-spacing="3">JOURNAL</text>
    <text x="185" y="196" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#7c756d" letter-spacing="4">CAFÉ &amp; BOOK</text>
    <circle cx="185" cy="225" r="14" stroke-width="1.5" />
    <path d="M178,223 C178,233 192,233 192,223 Z" stroke-width="1.5" fill="#22201e" />
    <path d="M192,224 C196,224 196,229 192,229" stroke-width="1.2" />
    <line x1="175" y1="234" x2="195" y2="234" stroke-width="1.5" />
    <path d="M182,219 Q185,214 182,211" stroke-width="1" />
    <path d="M188,219 Q191,214 188,211" stroke-width="1" />
  </g>
</svg>
`;

export const DEMO_FOOD_DESSERT_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="200" cy="260" rx="140" ry="50" stroke-width="2.5" fill="#ffffff" />
    <ellipse cx="200" cy="260" rx="115" ry="38" stroke-width="1.2" stroke-dasharray="3,3" />
    <path d="M120,240 C110,210 135,165 175,160 C210,155 235,190 230,225 C225,255 180,265 135,255 Z" stroke-width="2.5" fill="#fffefb" />
    <path d="M170,220 C185,210 195,225 185,235 C175,245 160,230 165,215 C170,200 195,195 205,210" stroke-width="2" />
    <g stroke-width="0.8" opacity="0.6">
      <line x1="135" y1="185" x2="150" y2="195" />
      <line x1="145" y1="175" x2="160" y2="185" />
      <line x1="195" y1="175" x2="210" y2="185" />
    </g>
    <circle cx="175" cy="155" r="9" stroke-width="2" fill="#22201e" />
    <ellipse cx="270" cy="225" rx="45" ry="20" stroke-width="2" fill="#ffffff" />
    <path d="M235,210 C235,240 305,240 305,210 Z" stroke-width="2.2" fill="#ffffff" />
    <ellipse cx="270" cy="210" rx="35" ry="12" stroke-width="2" fill="#22201e" opacity="0.25" />
    <path d="M270,206 Q266,212 270,216 Q274,212 270,206 Z" fill="#ffffff" stroke="#22201e" stroke-width="1" />
    <path d="M305,214 C320,214 320,230 305,232" stroke-width="2" />
    <line x1="90" y1="280" x2="150" y2="280" stroke-width="2" />
    <path d="M85,274 L92,280 L85,286" stroke-width="1.8" />
  </g>
</svg>
`;

export const DEMO_PLANT_BOTANIC_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <path d="M120,330 C160,280 200,200 240,100" stroke-width="3" />
    <path d="M190,210 C150,150 120,110 160,70 C190,40 230,55 250,75 C270,95 250,140 215,190 Z" stroke-width="2.5" fill="#ffffff" />
    <path d="M205,62 C200,80 210,100 210,120" stroke-width="1.5" />
    <g stroke-width="0.8" opacity="0.6">
      <path d="M205,175 C190,140 165,110 155,90" />
      <path d="M207,175 C198,135 180,95 180,75" />
      <path d="M210,175 C215,130 220,100 225,80" />
      <path d="M212,175 C225,140 240,110 245,95" />
    </g>
    <path d="M150,260 C110,240 80,210 95,180 C110,150 145,160 165,175 C185,190 175,230 155,255 Z" stroke-width="2.2" fill="#ffffff" />
    <path d="M225,230 Q245,260 260,250" stroke-width="2" />
    <path d="M250,245 C255,240 275,245 280,252 C275,262 255,258 250,245 Z" stroke-width="2" fill="#22201e" opacity="0.2" />
    <path d="M252,247 L278,251" stroke-width="1" />
    <path d="M256,244 L274,254" stroke-width="1" />
    <path d="M253,252 C255,275 270,285 272,285 C274,285 282,272 278,254 Z" stroke-width="2.2" fill="#ffffff" />
    <path d="M266,255 L266,280" stroke-width="0.9" opacity="0.5" />
  </g>
</svg>
`;

export const DEMO_OBJECT_CAMERA_SKETCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <g fill="none" stroke="#22201e" stroke-linecap="round" stroke-linejoin="round">
    <rect x="120" y="80" width="160" height="230" rx="14" stroke-width="3" fill="#ffffff" />
    <polygon points="135,80 150,45 250,45 265,80" stroke-width="2.5" fill="#fffefb" />
    <line x1="160" y1="45" x2="160" y2="80" stroke-width="1.2" />
    <line x1="240" y1="45" x2="240" y2="80" stroke-width="1.2" />
    <rect x="130" y="90" width="140" height="210" rx="8" stroke-width="1" stroke-dasharray="3,3" />
    <circle cx="200" cy="145" r="32" stroke-width="2.8" fill="#ffffff" />
    <circle cx="200" cy="145" r="26" stroke-width="1.5" />
    <circle cx="200" cy="145" r="18" stroke-width="1.2" stroke-dasharray="4,2" />
    <circle cx="193" cy="138" r="5" stroke-width="1" fill="#22201e" opacity="0.3" />
    <circle cx="200" cy="235" r="38" stroke-width="3" fill="#ffffff" />
    <circle cx="200" cy="235" r="30" stroke-width="1.8" />
    <circle cx="200" cy="235" r="20" stroke-width="1.5" />
    <circle cx="192" cy="227" r="6" stroke-width="1" fill="#22201e" opacity="0.4" />
    <circle cx="200" cy="235" r="34" stroke-width="0.8" stroke-dasharray="2,5" />
    <rect x="280" y="170" width="14" height="45" rx="3" stroke-width="2.2" fill="#22201e" opacity="0.15" />
    <line x1="280" y1="180" x2="294" y2="180" stroke-width="1" />
    <line x1="280" y1="192" x2="294" y2="192" stroke-width="1" />
    <line x1="280" y1="204" x2="294" y2="204" stroke-width="1" />
    <rect x="170" y="95" width="60" height="15" rx="2" stroke-width="1.5" />
    <text x="200" y="106" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="#22201e" letter-spacing="2">CLASSIC</text>
  </g>
</svg>
`;

/**
 * Generate 5 diverse stylized memory materials:
 * 动物 (Animal), 指示牌 (Signage), 食物 (Food), 植物 (Plant), 物品 (Object)
 */
export function create5DiverseMemoryMaterials(projectId: string = DEMO_PROJECT_ID): any[] {
  const ts = Date.now();
  return [
    {
      id: `mat-animal-cat-${ts}`,
      projectId,
      projectName: '周六漫步·街景与建筑手记',
      sourcePhotoId: 'demo-photo-cat',
      name: '长椅小花猫·手绘线稿',
      type: 'ai_sketch',
      previewUrl: svgToDataUrl(DEMO_ANIMAL_CAT_SKETCH_SVG),
      fullUrl: svgToDataUrl(DEMO_ANIMAL_CAT_SKETCH_SVG),
      style: 'line_art',
      isDemo: true,
      isDemoSketch: true,
      capturedAt: '2026-10-10 13:50',
      createdAt: ts - 1000 * 60 * 5,
    },
    {
      id: `mat-sign-cafe-${ts}`,
      projectId,
      projectName: '周六漫步·街景与建筑手记',
      sourcePhotoId: 'demo-photo-cafe',
      name: '复古咖啡馆挂牌·铁艺线稿',
      type: 'ai_sketch',
      previewUrl: svgToDataUrl(DEMO_SIGNPOST_SKETCH_SVG),
      fullUrl: svgToDataUrl(DEMO_SIGNPOST_SKETCH_SVG),
      style: 'line_art',
      isDemo: true,
      isDemoSketch: true,
      capturedAt: '2026-10-10 10:15',
      createdAt: ts - 1000 * 60 * 4,
    },
    {
      id: `mat-food-cake-${ts}`,
      projectId,
      projectName: '周六漫步·街景与建筑手记',
      sourcePhotoId: 'demo-photo-dessert',
      name: '抹茶卷与拿铁·手账甜品',
      type: 'ai_sketch',
      previewUrl: svgToDataUrl(DEMO_FOOD_DESSERT_SKETCH_SVG),
      fullUrl: svgToDataUrl(DEMO_FOOD_DESSERT_SKETCH_SVG),
      style: 'line_art',
      isDemo: true,
      isDemoSketch: true,
      capturedAt: '2026-10-10 11:20',
      createdAt: ts - 1000 * 60 * 3,
    },
    {
      id: `mat-plant-ginkgo-${ts}`,
      projectId,
      projectName: '周六漫步·街景与建筑手记',
      sourcePhotoId: 'demo-photo-leaves',
      name: '银杏叶与橡果·植物标本',
      type: 'ai_sketch',
      previewUrl: svgToDataUrl(DEMO_PLANT_BOTANIC_SKETCH_SVG),
      fullUrl: svgToDataUrl(DEMO_PLANT_BOTANIC_SKETCH_SVG),
      style: 'line_art',
      isDemo: true,
      isDemoSketch: true,
      capturedAt: '2026-10-10 15:40',
      createdAt: ts - 1000 * 60 * 2,
    },
    {
      id: `mat-object-camera-${ts}`,
      projectId,
      projectName: '周六漫步·街景与建筑手记',
      sourcePhotoId: 'demo-photo-arch',
      name: '复古双反相机·机械线稿',
      type: 'ai_sketch',
      previewUrl: svgToDataUrl(DEMO_OBJECT_CAMERA_SKETCH_SVG),
      fullUrl: svgToDataUrl(DEMO_OBJECT_CAMERA_SKETCH_SVG),
      style: 'line_art',
      isDemo: true,
      isDemoSketch: true,
      capturedAt: '2026-10-10 16:45',
      createdAt: ts - 1000 * 60 * 1,
    },
  ];
}

export const INITIAL_PHYSICAL_MATERIALS: PhysicalMaterial[] = [
  {
    id: 'pm-washi-tape-1',
    type: 'tape',
    name: '秋日格纹和纸胶带',
    imageUrl: svgToDataUrl(DEMO_WASHI_TAPE_SVG),
    widthMm: 15,
    remainingText: '整卷 (约 7m)',
    allowTrim: true,
    notes: '哑光和纸，适合固定照片角部或拼贴边缘',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'pm-ticket-1',
    type: 'ticket',
    name: '十月美术馆入场票根',
    imageUrl: svgToDataUrl(DEMO_TICKET_STUB_SVG),
    widthMm: 110,
    heightMm: 55,
    remainingText: '1张',
    allowTrim: true,
    notes: '米黄糙面厚纸，带有齿孔与日期印章',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'pm-sticker-1',
    type: 'sticker',
    name: '植物园复古草木邮票贴纸',
    imageUrl: svgToDataUrl(DEMO_BOTANIC_STAMP_SVG),
    widthMm: 35,
    heightMm: 45,
    remainingText: '剩余 4 枚',
    allowTrim: false,
    notes: '不干胶齿孔裁切，适合手账点缀',
    createdAt: Date.now() - 86400000 * 3,
  },
];
