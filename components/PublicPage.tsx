
import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../App';
import { Link } from 'react-router-dom';

const PublicPage: React.FC = () => {
  const { content } = useContent();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Slider State - Matching original HTML logic
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderWrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Dragging state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  const realSlides = content.sliderItems;
  const slideCount = realSlides.length;
  // Clone logic matching the HTML script
  const slides = [
    realSlides[slideCount - 1], // Clone of last slide (Index 0)
    ...realSlides,              // Real slides (Index 1 to slideCount)
    realSlides[0]               // Clone of first slide (Index slideCount + 1)
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialization & Resize handling
  useEffect(() => {
    setPosition();
    window.addEventListener('resize', handleResize);
    startTimer();
    return () => {
      window.removeEventListener('resize', handleResize);
      stopTimer();
    };
  }, [realSlides]);

  const handleResize = () => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none';
      setPosition();
    }
  };

  const getSlideWidth = () => {
    return sliderWrapperRef.current?.getBoundingClientRect().width || 0;
  };

  const setPosition = (index = currentIndex) => {
    if (sliderRef.current) {
      const w = getSlideWidth();
      const t = -index * w;
      sliderRef.current.style.transform = `translateX(${t}px)`;
      currentTranslate.current = t;
      prevTranslate.current = t;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      moveToNext();
    }, 5000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const moveToNext = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    animateToSlide(nextIdx);
  };

  const animateToSlide = (index: number) => {
    if (!sliderRef.current) return;
    const isMobile = window.innerWidth <= 768;
    const duration = isMobile ? 0.6 : 0.4;
    sliderRef.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    
    const w = getSlideWidth();
    const t = -index * w;
    sliderRef.current.style.transform = `translateX(${t}px)`;
    currentTranslate.current = t;
    prevTranslate.current = t;
    setIsTransitioning(true);
  };

  const onTransitionEnd = () => {
    setIsTransitioning(false);
    if (!sliderRef.current) return;

    let newIndex = currentIndex;
    if (currentIndex === 0) {
      newIndex = slideCount;
    } else if (currentIndex === slideCount + 1) {
      newIndex = 1;
    }

    if (newIndex !== currentIndex) {
      sliderRef.current.style.transition = 'none';
      setCurrentIndex(newIndex);
      const w = getSlideWidth();
      const t = -newIndex * w;
      sliderRef.current.style.transform = `translateX(${t}px)`;
      currentTranslate.current = t;
      prevTranslate.current = t;
    }
  };

  // Drag Events
  const getX = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
  };

  const dragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    stopTimer();
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none';
    }
    startX.current = getX(e);
    // Capture current translate from style to prevent snapping
    const matrix = new WebKitCSSMatrix(window.getComputedStyle(sliderRef.current!).transform);
    prevTranslate.current = matrix.m41;
  };

  const dragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const currentX = getX(e);
    const moveX = currentX - startX.current;
    
    const w = getSlideWidth();
    const maxT = 0;
    const minT = -(slideCount + 1) * w;
    
    currentTranslate.current = Math.max(minT, Math.min(maxT, prevTranslate.current + moveX));
    sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
  };

  const dragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const w = getSlideWidth();
    const movedBy = currentTranslate.current - prevTranslate.current;
    
    let newIndex = Math.round(-currentTranslate.current / w);

    if (movedBy < -w * 0.2) {
      newIndex = Math.ceil(-currentTranslate.current / w);
    } else if (movedBy > w * 0.2) {
      newIndex = Math.floor(-currentTranslate.current / w);
    }

    setCurrentIndex(newIndex);
    animateToSlide(newIndex);
    startTimer();
  };

  const handleDotClick = (i: number) => {
    stopTimer();
    const nextIdx = i + 1;
    setCurrentIndex(nextIdx);
    animateToSlide(nextIdx);
    startTimer();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar & Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[1050] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <nav className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[1100] p-6 transition-transform duration-300 shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <h2 className="text-2xl font-bold mb-8">網站地圖</h2>
        <ul className="space-y-4">
          <li className="pb-4 border-b border-gray-100">
            <a href="#service1" className="text-gray-800 no-underline hover:text-green-600 font-medium" onClick={() => setIsSidebarOpen(false)}>iPhone 螢幕維修</a>
          </li>
          <li className="pb-4 border-b border-gray-100">
            <a href="#service2" className="text-gray-800 no-underline hover:text-green-600 font-medium" onClick={() => setIsSidebarOpen(false)}>電池保養服務</a>
          </li>
          <li className="pb-4 border-b border-gray-100">
            <a href="#prices" className="text-gray-800 no-underline hover:text-green-600 font-medium" onClick={() => setIsSidebarOpen(false)}>維修價目表</a>
          </li>
          <li className="pb-4 border-b border-gray-100">
            <Link to="/login" className="text-blue-600 no-underline font-bold" onClick={() => setIsSidebarOpen(false)}>Admin Login</Link>
          </li>
        </ul>
      </nav>

      {/* Header */}
      <header className="flex justify-between items-center px-6 h-[60px] bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="font-bold text-lg tracking-tight uppercase">{content.brandName}</div>
        <button className="text-2xl focus:outline-none" onClick={() => setIsSidebarOpen(true)}>☰</button>
      </header>

      {/* Slider Wrapper */}
      <div ref={sliderWrapperRef} className="relative overflow-hidden w-full h-[350px] bg-white group">
        <div 
          ref={sliderRef}
          className="flex h-full will-change-transform cursor-grab active:cursor-grabbing"
          onMouseDown={dragStart}
          onTouchStart={dragStart}
          onMouseMove={dragging}
          onTouchMove={dragging}
          onMouseUp={dragEnd}
          onTouchEnd={dragEnd}
          onMouseLeave={dragEnd}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((slide, i) => (
            <div 
              key={`${slide.id}-${i}`}
              className="flex-shrink-0 w-full h-full relative overflow-hidden flex items-center justify-center text-white text-3xl font-bold select-none"
              style={{ backgroundColor: slide.bgColor }}
            >
              {slide.imageUrl && (
                <img 
                  src={slide.imageUrl} 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                  alt={slide.text} 
                />
              )}
              <div className="relative z-10 px-8 text-center drop-shadow-2xl">
                {slide.text}
              </div>
            </div>
          ))}
        </div>
        
        {/* Dots */}
        <div className="absolute bottom-5 left-0 w-full flex justify-center gap-3 z-20">
          {realSlides.map((_, i) => {
            let active = false;
            let dotIdx = currentIndex - 1;
            if (currentIndex === 0) dotIdx = slideCount - 1;
            if (currentIndex === slideCount + 1) dotIdx = 0;
            active = dotIdx === i;

            return (
              <span 
                key={i} 
                onClick={() => handleDotClick(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${active ? 'bg-[#1FC81F] scale-125' : 'bg-gray-300 opacity-60'}`}
              />
            );
          })}
        </div>
      </div>

      {/* iPhone Screen Service */}
      <section id="service1" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src={content.repairImage} className="w-full rounded-2xl shadow-2xl" alt="螢幕維修" />
            </div>
            <div className="md:w-1/2">
              <div className="p-8 md:p-4">
                <h2 className="text-3xl font-extrabold mb-8 relative inline-block">
                  {content.repairTitle}
                  <div className="absolute -bottom-2 left-0 w-3/5 h-1.5 bg-[#f5c339]"></div>
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{content.repairDesc}</p>
                <ul className="space-y-3 text-gray-500">
                  <li className="flex items-center"><span className="text-[#1FC81F] mr-2">✅</span> 高品質 BSMI 認證零件</li>
                  <li className="flex items-center"><span className="text-[#1FC81F] mr-2">✅</span> 工程師現場一對一維修</li>
                  <li className="flex items-center"><span className="text-[#1FC81F] mr-2">✅</span> 維修後提供完整功能測試</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">為什麼選擇保衛站？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="text-5xl mb-6">🛠️</div>
              <h4 className="text-xl font-bold mb-4">專業技術</h4>
              <p className="text-gray-500">十年以上維修經驗，精修各種主機板疑難雜症。</p>
            </div>
            <div className="p-10 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="text-5xl mb-6">⚡</div>
              <h4 className="text-xl font-bold mb-4">快速取件</h4>
              <p className="text-gray-500">現場備料充足，簡單維修最快 20 分鐘即可完工。</p>
            </div>
            <div className="p-10 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="text-5xl mb-6">🛡️</div>
              <h4 className="text-xl font-bold mb-4">售後保固</h4>
              <p className="text-gray-500">所有維修零件皆提供長效保固，全台連鎖服務。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Table */}
      <section id="prices" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">維修價格透明化</h2>
            <div className="text-gray-400 md:hidden text-sm">💡 左右滑動查看完整表格</div>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">機型名稱</th>
                  <th className="px-6 py-4 whitespace-nowrap">更換電池</th>
                  <th className="px-6 py-4 whitespace-nowrap">更換螢幕</th>
                  <th className="px-6 py-4 whitespace-nowrap">鏡頭維修</th>
                  <th className="px-6 py-4 whitespace-nowrap">主機板維修</th>
                  <th className="px-6 py-4 whitespace-nowrap">後玻璃更換</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {content.priceRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold">{row.model}</td>
                    <td className="px-6 py-4">{row.battery}</td>
                    <td className="px-6 py-4">{row.screen}</td>
                    <td className="px-6 py-4">{row.lens}</td>
                    <td className="px-6 py-4">{row.motherboard}</td>
                    <td className="px-6 py-4">{row.backGlass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 max-w-[800px]">
          <h2 className="text-center text-3xl font-bold mb-12">常見問題</h2>
          <div className="space-y-12">
            {content.faqs.map(faq => (
              <div key={faq.id}>
                <h5 className="text-xl font-bold text-green-600 mb-3">Q: {faq.question}</h5>
                <p className="text-gray-600">A: {faq.answer}</p>
                <hr className="mt-8 border-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-4">© 2024 保衛站 GUARD STATION | 專業維修中心</p>
          <div className="text-gray-400 space-y-1 text-sm">
            <p>營業時間：11:00 - 21:00</p>
            <p>地址：{content.contactAddress}</p>
            <p>電話：{content.contactPhone}</p>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <div className="fixed right-6 bottom-8 flex flex-col gap-3 z-[1000]">
        <a href="https://line.me" className="w-14 h-14 rounded-full bg-[#06C755] flex items-center justify-center text-white font-bold no-underline shadow-lg hover:scale-110 transition" target="_blank">LINE</a>
        <a href={`tel:${content.contactPhone}`} className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold no-underline shadow-lg hover:scale-110 transition">電話</a>
        <button 
          className={`w-14 h-14 rounded-full bg-white text-gray-800 flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${showBackToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ▲
        </button>
      </div>
    </div>
  );
};

export default PublicPage;
