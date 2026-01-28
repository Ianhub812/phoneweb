
import { SiteContent } from './types';

export const STORAGE_KEY = 'guard_station_content';
export const AUTH_KEY = 'guard_station_auth';

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "GUARD STATION | 保衛站",
  primaryColor: "#1FC81F",
  accentColor: "#f5c339",
  sliderItems: [
    { id: 's1', text: "iPhone 螢幕現場快修", bgColor: "#85868A", imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=2000" },
    { id: 's2', text: "原廠等級電池更換", bgColor: "#A0A1A5", imageUrl: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=2000" },
    { id: 's3', text: "全台連鎖 售後無憂", bgColor: "#6C6D71", imageUrl: "https://images.unsplash.com/photo-1556656793-062ff987b50c?auto=format&fit=crop&q=80&w=2000" },
    { id: 's4', text: "年度維修優惠中", bgColor: "#4D4E52", imageUrl: "https://images.unsplash.com/photo-1512499617640-c74ae3a49dd5?auto=format&fit=crop&q=80&w=2000" }
  ],
  repairTitle: "iPhone 螢幕維修",
  repairDesc: "我們提供現場 30 分鐘快速更換螢幕服務。不論是顯示異常、觸控失靈、或是玻璃破裂，我們都能完美修復。",
  repairImage: "https://images.unsplash.com/photo-1512499617640-c74ae3a49dd5?auto=format&fit=crop&q=80&w=1000",
  priceRows: [
    { model: "iPhone 15 Pro", battery: "$2,200", screen: "$11,500", lens: "$4,500", motherboard: "現場檢測", backGlass: "$5,000" },
    { model: "iPhone 15", battery: "$2,000", screen: "$9,500", lens: "$3,800", motherboard: "現場檢測", backGlass: "$4,500" },
    { model: "iPhone 14 Pro", battery: "$1,900", screen: "$9,500", lens: "$3,800", motherboard: "現場檢測", backGlass: "$4,500" },
    { model: "iPhone 14", battery: "$1,800", screen: "$8,500", lens: "$3,500", motherboard: "現場檢測", backGlass: "$4,000" }
  ],
  faqs: [
    { id: 'f1', question: "維修資料會不見嗎？", answer: "正常維修不會動到資料，但建議維修前仍先進行資料備份以策萬全。" },
    { id: 'f2', question: "維修需要留機嗎？", answer: "大部分零件更換（螢幕、電池）皆可現場取件，若為主機板故障則需 1-3 個工作天。" }
  ],
  contactEmail: "service@guardstation.tw",
  contactPhone: "03-1234567",
  contactAddress: "桃園市某某路123號"
};
