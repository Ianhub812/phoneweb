
import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../App';
import { Link } from 'react-router-dom';

const PublicPage: React.FC = () => {
  const { content } = useContent();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Slider State
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderWrapperRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  const realSlides = content.sliderItems;
  const slideCount = realSlides.length;
  const slides = [
    realSlides[slideCount - 1], // Clone of last (Index 0)
    ...realSlides,              // Real (Index 1 to slideCount)
    realSlides[0]               // Clone of first (Index slideCount + 1)
  ];

  // Auto-slide Timer logic: Shortened and resets on index change
  useEffect(() => {
    if (isDragging.current || isTransitioning) return;

    const timer = setTimeout(() => {
      moveToNext();
    }, 4000); // Shortened interval: 4 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial Position & Resize
  useEffect(() => {
    setPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const moveToNext = () => {
    if (isTransitioning) return;
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    animateToSlide(nextIdx);
  };

  const animateToSlide = (index: number) => {
    if (!sliderRef.current) return;
    setIsTransitioning(true);
    const duration = 0.8; // Smooth 0.8s transition
    sliderRef.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1.0)`;
    
    const w = getSlideWidth();
    const t = -index * w;
    sliderRef.current.style.transform = `translateX(${t}px)`;
    currentTranslate.current = t;
    prevTranslate.current = t;
  };

  const onTransitionEnd = () => {
    setIsTransitioning(false);
    if (!sliderRef.current) return;

    let newIndex = currentIndex;
    // Boundary checks for infinite loop
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

  const getX = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
  };

  const getY = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].pageY : (e as React.MouseEvent).pageY;
  };

  const dragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning) return;
    
    isDragging.current = true;
    isHorizontalSwipe.current = null;
    
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none';
    }
    
    startX.current = getX(e);
    startY.current = getY(e);
    
    const matrix = new WebKitCSSMatrix(window.getComputedStyle(sliderRef.current!).transform);
    prevTranslate.current = matrix.m41;
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

    if (isHorizontalSwipe.current === false) return;

    if (isHorizontalSwipe.current === true) {
      if (e.cancelable) e.preventDefault();
      const w = getSlideWidth();
      const maxT = 0;
      const minT = -(slideCount + 1) * w;
      currentTranslate.current = Math.max(minT, Math.min(maxT, prevTranslate.current + diffX));
      sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
    }
  };

  const dragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (isHorizontalSwipe.current === false) return;

    const w = getSlideWidth();
    const movedBy = currentTranslate.current - prevTranslate.current;
    
    let newIndex = Math.round(-currentTranslate.current / w);
    
    // Threshold to switch slide (20% of width)
    if (movedBy < -w * 0.2) {
      newIndex = Math.ceil(-currentTranslate.current / w);
    } else if (movedBy > w * 0.2) {
      newIndex = Math.floor(-currentTranslate.current / w);
    }

    if (newIndex < 0) newIndex = 0;
    if (newIndex > slideCount + 1) newIndex = slideCount + 1;

    setCurrentIndex(newIndex);
    animateToSlide(newIndex);
  };

  const handleDotClick = (i: number) => {
    if (isTransitioning) return;
    const nextIdx = i + 1;
    setCurrentIndex(nextIdx);
    animateToSlide(nextIdx);
  };

  // Helper to get active dot index (0-based) correctly matching the real slides
  const getActiveDotIndex = () => {
    // slideCount is total real images
    // currentIndex: 0(CloneLast), 1(Real1), ..., N(RealN), N+1(CloneFirst)
    let idx = (currentIndex - 1) % slideCount;
    if (idx < 0) idx = slideCount - 1;
    return idx;
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
        <ul className="space-y-4 text-sm">
          <li className="pb-4 border-b border-gray-100">
            <a href="#service1" className="text-gray-800 no-underline hover:text-green-600 font-medium" onClick={() => setIsSidebarOpen(false)}>iPhone 螢幕維修</a>
          </li>
          <li className="pb-4 border-b border-gray-100">
            <a href="#prices" className="text-gray-800 no-underline hover:text-green-600 font-medium" onClick={() => setIsSidebarOpen(false)}>維修價目表</a>
          </li>
          <li className="pb-4 border-b border-gray-100">
            <Link to="/login" className="text-blue-600 no-underline font-bold" onClick={() => setIsSidebarOpen(false)}>管理員登入</Link>
          </li>
        </ul>
      </nav>

      {/* Header */}
      <header className="flex justify-between items-center px-6 h-[60px] bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="font-bold text-lg tracking-tight uppercase">{content.brandName}</div>
        <button className="text-2xl focus:outline-none" onClick={() => setIsSidebarOpen(true)}>☰</button>
      </header>

      {/* Slider Wrapper */}
      <div ref={sliderWrapperRef} className="relative overflow-hidden w-full h-[350px] bg-white group" style={{ touchAction: 'pan-y' }}>
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
        
        {/* Dots - Corrected Logic */}
        <div className="absolute bottom-5 left-0 w-full flex justify-center gap-3 z-20">
          {realSlides.map((_, i) => {
            const isActive = i === getActiveDotIndex();
            return (
              <span 
                key={i} 
                onClick={() => handleDotClick(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${isActive ? 'bg-[#1FC81F] scale-125' : 'bg-white opacity-60'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Services Section */}
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Table */}
      <section id="prices" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">維修價格透明化</h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">機型名稱</th>
                  <th className="px-6 py-4 whitespace-nowrap">更換電池</th>
                  <th className="px-6 py-4 whitespace-nowrap">更換螢幕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {content.priceRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold">{row.model}</td>
                    <td className="px-6 py-4">{row.battery}</td>
                    <td className="px-6 py-4">{row.screen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2024 {content.brandName} | 專業維修中心</p>
          <div className="text-gray-400 mt-4">
            <p>地址：{content.contactAddress}</p>
            <p>電話：{content.contactPhone}</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-8 flex flex-col gap-3 z-[1000]">
        <a href={`tel:${content.contactPhone}`} className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white font-bold no-underline shadow-lg hover:scale-110 transition">☎️</a>
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
