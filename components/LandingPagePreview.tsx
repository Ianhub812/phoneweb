
import React from 'react';
import { SiteContent } from '../types';

interface Props {
  content: SiteContent;
}

const LandingPagePreview: React.FC<Props> = ({ content }) => {
  const activeSlide = content.sliderItems[0];
  
  return (
    <div className="min-h-full bg-white text-[14px]">
      <header className="flex justify-between items-center px-4 h-[50px] bg-white border-b border-gray-100">
        <div className="font-bold text-sm">{content.brandName}</div>
        <div className="text-xl">☰</div>
      </header>

      <div className="h-[200px] relative flex items-center justify-center text-white text-xl font-bold p-6 text-center overflow-hidden" style={{ backgroundColor: activeSlide.bgColor }}>
        {activeSlide.imageUrl && (
          <img src={activeSlide.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="bg" />
        )}
        <span className="relative drop-shadow-md">{activeSlide.text}</span>
      </div>

      <section className="py-10 px-6">
        <h2 className="text-xl font-bold mb-4 relative inline-block">
          {content.repairTitle}
          <div className="absolute -bottom-1 left-0 w-3/5 h-1 bg-[#f5c339]"></div>
        </h2>
        <p className="text-gray-500 text-xs mb-4">{content.repairDesc}</p>
        <img src={content.repairImage} className="w-full rounded-xl shadow-md" alt="repair" />
      </section>

      <section className="bg-gray-50 py-10 px-6">
        <h2 className="text-lg font-bold mb-6 text-center">維修價格透明化</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2">機型</th>
                <th className="px-3 py-2">電池</th>
                <th className="px-3 py-2">螢幕</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {content.priceRows.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 font-bold">{row.model}</td>
                  <td className="px-3 py-2">{row.battery}</td>
                  <td className="px-3 py-2">{row.screen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 text-center text-[10px]">
        <p>© 2024 保衛站 GUARD STATION</p>
        <p className="text-gray-500 mt-1">{content.contactAddress}</p>
      </footer>
    </div>
  );
};

export default LandingPagePreview;
