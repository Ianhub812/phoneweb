
import { SiteContent } from './types';

export const STORAGE_KEY = 'guard_station_content_v3';
export const AUTH_KEY = 'guard_station_auth';

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "GUARD STATION | 保衛站",
  contactEmail: "service@guardstation.tw",
  contactPhone: "03-1234567",
  contactAddress: "桃園市某某路123號",
  pages: [
    {
      id: 'home',
      title: '首頁',
      slug: 'home',
      sections: [
        {
          id: 's1',
          type: 'HERO_SLIDER',
          content: {
            items: [
              { id: '1', text: "iPhone 螢幕現場快修", bgColor: "#85868A", imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=2000" },
              { id: '2', text: "原廠等級電池更換", bgColor: "#A0A1A5", imageUrl: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=2000" }
            ]
          }
        },
        {
          id: 's2',
          type: 'FEATURE_BLOCK',
          content: {
            title: "iPhone 螢幕維修",
            description: "我們提供現場 30 分鐘快速更換螢幕服務。不論是顯示異常、觸控失靈、或是玻璃破裂，我們都能完美修復。",
            image: "https://images.unsplash.com/photo-1512499617640-c74ae3a49dd5?auto=format&fit=crop&q=80&w=1000",
            reverse: false
          }
        },
        {
          id: 's3',
          type: 'PRICE_TABLE',
          content: {
            title: "維修價格透明化",
            headers: ["機型", "電池更換", "螢幕總成", "主機板維修"],
            rows: [
              ["iPhone 15 Pro", "$2,200", "$11,500", "現場檢測"],
              ["iPhone 15", "$2,000", "$9,500", "現場檢測"]
            ]
          }
        }
      ]
    }
  ]
};
