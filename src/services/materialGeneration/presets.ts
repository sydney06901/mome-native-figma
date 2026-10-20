export interface MoodOption {
  id: string;
  title: string;
  description: string;
  palette: [string, string, string]; // 3 colors: [main, accent, softBg]
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'warm_nostalgia',
    title: '温暖怀旧',
    description: '旧照片、柔和光线、纸张时间感',
    palette: ['#f8e2ab', '#e09867', '#8c593b'],
  },
  {
    id: 'quiet_healing',
    title: '安静治愈',
    description: '低饱和、留白、轻盈自然',
    palette: ['#8ba893', '#b8c0b9', '#f0ede6'],
  },
  {
    id: 'joyful_vivid',
    title: '快乐鲜活',
    description: '明亮、有趣、有跳跃感',
    palette: ['#fbbf24', '#f87171', '#34d399'],
  },
  {
    id: 'romantic_dream',
    title: '浪漫梦幻',
    description: '柔光、花朵、细腻装饰',
    palette: ['#f472b6', '#c084fc', '#fdf4ff'],
  },
  {
    id: 'free_exploration',
    title: '自由探索',
    description: '旅行、地图、票据和手写记录',
    palette: ['#38bdf8', '#c2b280', '#b91c1c'],
  },
];

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  suitableTypes: string;
  previewBg: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'line_art',
    name: '黑白线稿',
    description: '极简利落，突出主体轮廓与结构线条',
    suitableTypes: '建筑、雕塑、地标、物件轮廓',
    previewBg: 'linear-gradient(135deg, #2c2825 0%, #4a453f 100%)',
  },
  {
    id: 'watercolor',
    name: '水彩插画',
    description: '晕染通透，色彩柔和具手绘透明感',
    suitableTypes: '天空、花草、光影斑驳街景',
    previewBg: 'linear-gradient(135deg, #a7d0e8 0%, #e8b4b8 100%)',
  },
  {
    id: 'torn_paper',
    name: '撕纸拼贴',
    description: '边缘锯齿不规则，手工制作时间肌理',
    suitableTypes: '旅途票根、旧报纸感、生活随拍',
    previewBg: 'linear-gradient(135deg, #e4ded4 0%, #d5cbbe 100%)',
  },
  {
    id: 'vintage_print',
    name: '复古印刷',
    description: '网点噪点质感，微泛黄与油墨斑驳',
    suitableTypes: '旧街景、招牌、老建筑、车票',
    previewBg: 'linear-gradient(135deg, #d4a373 0%, #a98467 100%)',
  },
  {
    id: 'crayon_doodle',
    name: '蜡笔涂鸦',
    description: '粗粝颗粒笔触，童真温暖的色彩填充',
    suitableTypes: '小动物、食物、随手涂画记事',
    previewBg: 'linear-gradient(135deg, #fcd34d 0%, #fb923c 100%)',
  },
  {
    id: 'minimal_magazine',
    name: '极简杂志',
    description: '大留白比例，克制现代感版面裁剪',
    suitableTypes: '咖啡杯、人物远景、建筑构图',
    previewBg: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
  },
  {
    id: 'handdrawn_sticker',
    name: '手绘贴纸',
    description: '白边环绕，立体投影，即贴即用',
    suitableTypes: '路牌、门牌、花草单品、小物件',
    previewBg: 'linear-gradient(135deg, #86efac 0%, #3b82f6 100%)',
  },
  {
    id: 'authentic_photo',
    name: '真实照片质感',
    description: '原片光泽，保留完整细节与真实拍摄色调',
    suitableTypes: '合影、风景全景、决定性瞬间',
    previewBg: 'linear-gradient(135deg, #3b6e8c 0%, #1c1a18 100%)',
  },
];
