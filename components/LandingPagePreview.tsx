
import React from 'react';
import { SiteContent, SliderItem, FAQItem } from '../types';

interface Props {
  content: SiteContent;
}

const LandingPagePreview: React.FC<Props> = ({ content }) => {
  const activePage = content.pages[0];
  
  if (!activePage) return null;

  return (
    <div className="min-h-full bg-white text-[14px] font-sans selection:bg-green-100">
      {/* Mini Navbar */}
      <header className="flex justify-between items-center px-6 h-[65px] bg-white border-b border-gray-50 sticky top-0 z-10">
        <div className="font-black text-lg tracking-tighter uppercase text-gray-900">
          <span className="text-[#1FC81F]">Guard</span> Station
        </div>
        <div className="text-xl">☰</div>
      </header>

      <main>
        {activePage.sections.map(sec => {
          if (sec.type === 'HERO_SLIDER') {
            const s = sec.content.items[0] as SliderItem;
            if (!s) return null;
            return (
              <div key={sec.id} className="h-[280px] md:h-[400px] relative flex items-center justify-center text-white text-2xl md:text-4xl font-black p-8 text-center overflow-hidden" style={{ backgroundColor: s.bgColor }}>
                {s.imageUrl && <img src={s.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                <div className="absolute inset-0 bg-black/20" />
                <span className="relative drop-shadow-2xl max-w-lg leading-tight">{s.text || '在此輸入大標題'}</span>
                <div className="absolute bottom-5 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1FC81F]" />
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                </div>
              </div>
            );
          }

          if (sec.type === 'FEATURE_BLOCK') {
            return (
              <section key={sec.id} className={`py-12 px-8 flex flex-col ${sec.content.reverse ? 'flex-col-reverse' : ''} gap-8 border-b border-gray-50`}>
                <div className="w-full">
                  <h3 className="text-2xl font-black mb-4 text-gray-900 leading-tight">{sec.content.title}</h3>
                  <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{sec.content.description}</p>
                </div>
                {sec.content.image && (
                  <div className="w-full">
                    <img src={sec.content.image} className="w-full h-[200px] object-cover rounded-3xl shadow-lg" alt={sec.content.title} />
                  </div>
                )}
              </section>
            );
          }

          if (sec.type === 'PRICE_TABLE') {
            return (
              <section key={sec.id} className="py-12 px-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xl font-black mb-8 text-center">{sec.content.title}</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black text-white">
                        <tr>
                          {sec.content.headers.map((h: string, i: number) => (
                            <th key={i} className="p-3 font-bold uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sec.content.rows.map((row: string[], i: number) => (
                          <tr key={i}>
                            {row.map((cell: string, j: number) => (
                              <td key={j} className={`p-3 ${j === 0 ? 'font-bold' : 'text-gray-600'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          }

          if (sec.type === 'FAQ_SECTION') {
            return (
              <section key={sec.id} className="py-12 px-6 border-b border-gray-50">
                <h3 className="text-xl font-black mb-8 text-center">{sec.content.title}</h3>
                <div className="space-y-4">
                  {sec.content.items.map((faq: FAQItem) => (
                    <div key={faq.id} className="bg-gray-50 p-4 rounded-xl">
                      <p className="font-bold text-[#1FC81F] mb-2 flex">
                        <span className="mr-2 opacity-30">Q.</span> {faq.question}
                      </p>
                      <p className="text-gray-500 text-sm flex">
                        <span className="mr-2 opacity-30 font-bold">A.</span> {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </main>

      {/* Mini Footer */}
      <footer className="bg-black text-white p-12 text-center text-[12px]">
        <p className="font-black text-[#1FC81F] mb-4">GUARD STATION</p>
        <p className="text-gray-500">{content.contactAddress}</p>
        <p className="text-gray-700 mt-8">© 2025 {content.brandName}</p>
      </footer>
    </div>
  );
};

export default LandingPagePreview;
