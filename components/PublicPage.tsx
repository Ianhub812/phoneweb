
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useContent } from '../App';
import { Link, useParams } from 'react-router-dom';
import { SliderItem, FAQItem, PriceTableContent } from '../types';

// --- Modular Components ---

const HeroSlider: React.FC<{ items: SliderItem[] }> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<number | null>(null);

  // Drag Refs for performance
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  const count = items.length;
  if (count === 0) return null;
  // Clone for seamless loop
  const slides = [items[count - 1], ...items, items[0]];

  const getSlideWidth = useCallback(() => containerRef.current?.getBoundingClientRect().width || 0, []);

  const setPosition = useCallback((index: number) => {
    if (sliderRef.current) {
      const w = getSlideWidth();
      const t = -index * w;
      sliderRef.current.style.transform = `translateX(${t}px)`;
      currentTranslate.current = t;
      prevTranslate.current = t;
    }
  }, [getSlideWidth]);

  // Initial Sync & Resize
  useEffect(() => {
    setPosition(currentIndex);
    const handleResize = () => {
      if (sliderRef.current) sliderRef.current.style.transition = 'none';
      setPosition(currentIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items, currentIndex, setPosition]);

  // Auto Play
  useEffect(() => {
    if (isDragging.current || isTransitioning || count <= 1) return;
    const timer = setTimeout(() => {
      moveToNext(currentIndex + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning, count]);

  const onTransitionEnd = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    
    setIsTransitioning(false);
    if (!sliderRef.current) return;

    let newIndex = currentIndex;
    if (currentIndex === 0) {
      newIndex = count;
    } else if (currentIndex === count + 1) {
      newIndex = 1;
    }

    if (newIndex !== currentIndex) {
      sliderRef.current.style.transition = 'none';
      setCurrentIndex(newIndex);
      setPosition(newIndex);
    }
  }, [currentIndex, count, setPosition]);

  const moveToNext = (index: number) => {
    if (isTransitioning || !sliderRef.current) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    const duration = 0.8;
    sliderRef.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1.0)`;
    
    const w = getSlideWidth();
    const t = -index * w;
    sliderRef.current.style.transform = `translateX(${t}px)`;
    currentTranslate.current = t;
    prevTranslate.current = t;

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      onTransitionEnd();
    }, duration * 1000 + 50);
  };

  const getX = (e: React.MouseEvent | React.TouchEvent) => 'touches' in e ? e.touches[0].pageX : e.pageX;
  const getY = (e: React.MouseEvent | React.TouchEvent) => 'touches' in e ? e.touches[0].pageY : e.pageY;

  const dragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning) return;
    isDragging.current = true;
    isHorizontalSwipe.current = null;
    if (sliderRef.current) sliderRef.current.style.transition = 'none';
    
    startX.current = getX(e);
    startY.current = getY(e);
    
    try {
      const style = window.getComputedStyle(sliderRef.current!);
      const matrix = new WebKitCSSMatrix(style.transform);
      prevTranslate.current = matrix.m41;
    } catch (err) {
      prevTranslate.current = -currentIndex * getSlideWidth();
    }
  };

  const dragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    
    const currentX = getX(e);
    const currentY = getY(e);
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current === true) {
      if (e.cancelable) e.preventDefault();
      const w = getSlideWidth();
      const maxT = 0;
      const minT = -(count + 1) * w;
      currentTranslate.current = Math.max(minT, Math.min(maxT, prevTranslate.current + diffX));
      sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
    }
  };

  const dragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (isHorizontalSwipe.current !== true) {
      setPosition(currentIndex);
      return;
    }

    const w = getSlideWidth();
    const movedBy = currentTranslate.current - prevTranslate.current;
    let newIndex = Math.round(-currentTranslate.current / w);
    
    if (movedBy < -w * 0.15) {
      newIndex = Math.ceil(-currentTranslate.current / w);
    } else if (movedBy > w * 0.15) {
      newIndex = Math.floor(-currentTranslate.current / w);
    }

    if (newIndex < 0) newIndex = 0;
    if (newIndex > count + 1) newIndex = count + 1;
    
    moveToNext(newIndex);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative overflow-hidden w-full h-[350px] md:h-[600px] bg-white group"
      style={{ touchAction: 'pan-y' }}
    >
      <div 
        ref={sliderRef}
        className="flex h-full will-change-transform cursor-grab active:cursor-grabbing"
        onMouseDown={dragStart}
        onMouseMove={dragging}
        onMouseUp={dragEnd}
        onMouseLeave={dragEnd}
        onTouchStart={dragStart}
        onTouchMove={dragging}
        onTouchEnd={dragEnd}
        onTransitionEnd={onTransitionEnd}
      >
        {slides.map((s, i) => (
          <div 
            key={`${s.id}-${i}`}
            className="flex-shrink-0 w-full h-full relative overflow-hidden flex items-center justify-center text-white text-3xl md:text-5xl font-black select-none"
            style={{ backgroundColor: s.bgColor }}
          >
            {s.imageUrl && <img src={s.imageUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />}
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 px-8 text-center drop-shadow-2xl max-w-4xl">
              {s.text}
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center gap-3 z-20">
        {items.map((_, i) => (
          <div
            key={i}
            onClick={() => moveToNext(i + 1)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
              ((currentIndex - 1 + count) % count) === i ? 'bg-[#1FC81F] scale-125 shadow-lg' : 'bg-white opacity-40 shadow-sm'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button 
        onClick={() => moveToNext(currentIndex - 1)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/30 text-white rounded-full transition-all opacity-0 md:group-hover:opacity-100 z-30"
      >
        <span className="text-3xl">‹</span>
      </button>
      <button 
        onClick={() => moveToNext(currentIndex + 1)}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/30 text-white rounded-full transition-all opacity-0 md:group-hover:opacity-100 z-30"
      >
        <span className="text-3xl">›</span>
      </button>
    </div>
  );
};

const FeatureBlock: React.FC<{ title: string; description: string; image: string; reverse?: boolean }> = ({ title, description, image, reverse }) => (
  <section className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
        <div className="md:w-1/2 w-full">
          <div className="relative group">
            <div className="absolute -inset-4 bg-green-100 rounded-[2.5rem] rotate-2 group-hover:rotate-0 transition-transform duration-500 -z-10" />
            <img src={image || 'https://via.placeholder.com/800x600'} className="w-full rounded-[2rem] shadow-2xl h-[400px] object-cover" alt={title} />
          </div>
        </div>
        <div className="md:w-1/2 w-full">
          <h2 className="text-4xl md:text-5xl font-black mb-8 relative inline-block text-gray-900 leading-tight">
            {title}
            <div className="absolute -bottom-2 left-0 w-2/3 h-2 bg-[#f5c339] rounded-full"></div>
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed whitespace-pre-wrap mb-10">{description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-full font-bold text-gray-500">✓ 現場透明維修</div>
            <div className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-full font-bold text-gray-500">✓ 30分鐘快速取件</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const PriceTable: React.FC<PriceTableContent> = ({ title, headers, rows }) => (
  <section className="py-24 bg-gray-50 border-y border-gray-100">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-black mb-16 text-center text-gray-900">{title}</h2>
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] text-white">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-8 py-6 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-green-50/40 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-8 py-6 ${j === 0 ? 'font-black text-gray-800' : 'text-gray-600 font-medium'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
);

const FAQSection: React.FC<{ title: string; items: FAQItem[] }> = ({ title, items }) => (
  <section className="py-24">
    <div className="container mx-auto px-6 max-w-4xl">
      <h2 className="text-4xl font-black mb-16 text-center text-gray-900">{title}</h2>
      <div className="space-y-10">
        {items.map(f => (
          <div key={f.id} className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-2xl font-black text-[#1FC81F] mb-6 flex">
              <span className="mr-4 opacity-20">Q.</span> {f.question}
            </h4>
            <p className="text-gray-500 text-xl flex leading-relaxed">
              <span className="mr-4 opacity-20 font-bold">A.</span> {f.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Public Page Logic ---

const PublicPage: React.FC = () => {
  const { content } = useContent();
  const { slug } = useParams<{ slug?: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activePage = content.pages.find(p => slug ? p.slug === slug : p.slug === 'home');

  if (!activePage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <h1 className="text-9xl font-black text-gray-200 mb-8">404</h1>
          <p className="text-gray-400 text-xl mb-12">您尋找的頁面暫時走失了</p>
          <Link to="/" className="inline-block px-10 py-4 bg-[#1FC81F] text-white rounded-full font-black shadow-xl">返回首頁</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className={`fixed inset-0 bg-black/60 z-[1050] backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <nav className={`fixed top-0 left-0 w-[320px] h-full bg-white z-[1100] p-10 shadow-2xl transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-3xl font-black mb-16 tracking-tighter text-gray-900 uppercase">
          <span className="text-[#1FC81F]">Guard</span> Station
        </div>
        <ul className="space-y-6">
          {content.pages.map(p => (
            <li key={p.id}>
              <Link to={p.slug === 'home' ? '/' : `/p/${p.slug}`} className={`text-2xl no-underline font-black block py-2 transition-colors ${p.slug === (slug || 'home') ? 'text-[#1FC81F]' : 'text-gray-400'}`} onClick={() => setIsSidebarOpen(false)}>{p.title}</Link>
            </li>
          ))}
          <li className="pt-16 mt-16 border-t border-gray-100">
            <Link to="/login" className="text-gray-300 font-bold no-underline">管理員登入</Link>
          </li>
        </ul>
      </nav>

      <header className="flex justify-between items-center px-10 h-[80px] bg-white/90 backdrop-blur-md border-b border-gray-50 sticky top-0 z-50">
        <Link to="/" className="font-black text-2xl tracking-tighter no-underline text-gray-900 uppercase flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1FC81F] rounded-lg"></div>
          <span className="hidden sm:inline">Guard Station</span>
          <span className="sm:hidden">GS</span>
        </Link>
        <button className="text-3xl p-2 hover:bg-gray-100 rounded-full" onClick={() => setIsSidebarOpen(true)}>☰</button>
      </header>

      <main>
        {activePage.sections.map(section => {
          switch (section.type) {
            case 'HERO_SLIDER': return <HeroSlider key={section.id} items={section.content.items} />;
            case 'FEATURE_BLOCK': return <FeatureBlock key={section.id} {...section.content} />;
            case 'PRICE_TABLE': return <PriceTable key={section.id} {...section.content} />;
            case 'FAQ_SECTION': return <FAQSection key={section.id} {...section.content} />;
            default: return null;
          }
        })}
      </main>

      <footer className="bg-[#111] text-white py-24 text-center">
        <div className="container mx-auto px-10">
          <p className="text-3xl font-black mb-10 tracking-tighter text-[#1FC81F]">GUARD STATION</p>
          <div className="text-gray-500 text-lg space-y-2 mb-12">
            <p>📍 {content.contactAddress}</p>
            <p>📞 {content.contactPhone}</p>
          </div>
          <p className="text-gray-700 text-sm font-bold uppercase tracking-widest pt-12 border-t border-gray-800">© 2025 {content.brandName}. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed right-6 bottom-8 flex flex-col gap-4 z-[1000]">
        <button 
          className={`w-14 h-14 rounded-full bg-white text-gray-800 flex items-center justify-center font-bold shadow-2xl transition-all duration-300 ${showBackToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ▲
        </button>
      </div>
    </div>
  );
};

export default PublicPage;
