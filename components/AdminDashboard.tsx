
import React, { useState, useEffect } from 'react';
import { useContent } from '../App';
import { SiteContent, CustomPage, PageSection, SectionType, SliderItem, PriceTableContent } from '../types';
import LandingPagePreview from './LandingPagePreview';
import ImageUpload from './ImageUpload';

const AdminDashboard: React.FC = () => {
  const { content, updateContent, logout } = useContent();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [selectedPageId, setSelectedPageId] = useState<string>(content.pages[0].id);
  const [activeTab, setActiveTab] = useState<'pages' | 'global'>('pages');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Modal State for Adding Page
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Modal State for Deleting Module
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  useEffect(() => {
    setHasChanges(JSON.stringify(draft) !== JSON.stringify(content));
  }, [draft, content]);

  const activePage = draft.pages.find(p => p.id === selectedPageId)!;

  const updateDraft = (updates: Partial<SiteContent>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const updatePage = (updates: Partial<CustomPage>) => {
    updateDraft({
      pages: draft.pages.map(p => p.id === selectedPageId ? { ...p, ...updates } : p)
    });
  };

  // --- Page Management ---
  const handleConfirmAddPage = () => {
    if (!newPageTitle.trim()) {
      alert('請輸入頁面名稱');
      return;
    }
    const title = newPageTitle.trim();
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    if (draft.pages.find(p => p.slug === slug)) {
      alert('該網址路徑已存在，請更換名稱。');
      return;
    }

    const newPage: CustomPage = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      slug,
      sections: [
        { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'HERO_SLIDER', 
          content: { items: [{ id: Math.random().toString(36).substr(2, 9), text: `${title} 專業現場快修`, bgColor: '#1FC81F' }] } 
        }
      ]
    };
    updateDraft({ pages: [...draft.pages, newPage] });
    setSelectedPageId(newPage.id);
    setIsAddPageModalOpen(false);
    setNewPageTitle('');
  };

  const deletePage = (id: string) => {
    const page = draft.pages.find(p => p.id === id);
    if (page?.slug === 'home') return alert('首頁為系統核心，無法刪除');
    if (window.confirm('確定要刪除此頁面及其所有內容模組嗎？')) {
      const newPages = draft.pages.filter(p => p.id !== id);
      updateDraft({ pages: newPages });
      if (selectedPageId === id) setSelectedPageId(newPages[0].id);
    }
  };

  // --- Section/Block Management ---
  const addSection = (type: SectionType) => {
    const newSec: PageSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaults(type)
    };
    updatePage({ sections: [...activePage.sections, newSec] });
  };

  const getDefaults = (type: SectionType) => {
    switch(type) {
      case 'HERO_SLIDER': return { items: [{ id: Math.random().toString(36).substr(2, 9), text: '在此輸入大標題', bgColor: '#333' }] };
      case 'FEATURE_BLOCK': return { title: '服務特色標題', description: '請輸入內容描述...', image: '', reverse: false };
      case 'PRICE_TABLE': return { 
        title: '官方維修報價單', 
        headers: ["機型", "電池更換", "螢幕總成"], 
        rows: [["iPhone 15", "$2,000", "$9,500"]] 
      };
      case 'FAQ_SECTION': return { title: '客戶常見問題', items: [{ id: '1', question: '問題文字？', answer: '回答內容。' }] };
    }
  };

  const updateSection = (id: string, newContent: any) => {
    updatePage({
      sections: activePage.sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...newContent } } : s)
    });
  };

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const secs = [...activePage.sections];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= secs.length) return;
    [secs[idx], secs[target]] = [secs[target], secs[idx]];
    updatePage({ sections: secs });
  };

  const removeSection = (id: string) => {
    setSectionToDelete(id);
  };

  const handleFinalDeleteSection = () => {
    if (sectionToDelete) {
      updatePage({ sections: activePage.sections.filter(s => s.id !== sectionToDelete) });
      setSectionToDelete(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    updateContent(draft);
    setIsSaving(false);
    alert('網站內容已成功發佈！');
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm bg-white font-medium";

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fa] overflow-hidden text-gray-800 font-sans">
      {/* Add Page Modal */}
      {isAddPageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-6 text-gray-900">新增頁面</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">頁面名稱 (將用於網址)</label>
                <input 
                  autoFocus
                  value={newPageTitle} 
                  onChange={e => setNewPageTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmAddPage()}
                  className={inputCls} 
                  placeholder="例如：iPhone 16 維修" 
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddPageModalOpen(false)} 
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmAddPage} 
                  className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-[#1FC81F] hover:bg-green-600 shadow-lg shadow-green-100 transition-all"
                >
                  確認新增
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Module Confirmation Modal */}
      {sectionToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-6 text-gray-900 text-center">是否刪除模組</h3>
            <p className="text-gray-400 text-xs text-center mb-6">此操作無法復原</p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setSectionToDelete(null)} 
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleFinalDeleteSection} 
                className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 transition-all"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="h-20 bg-white border-b flex items-center justify-between px-10 shrink-0 shadow-sm z-30">
        <div className="flex items-center space-x-6">
          <div className="bg-[#1FC81F] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg shadow-green-100">GS</div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter">CMS <span className="text-[#1FC81F]">MODULAR</span> EDITOR</span>
            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Guard Station Console</span>
          </div>
          {hasChanges && <div className="animate-pulse flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full border border-amber-100"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div><span className="text-[10px] font-black uppercase tracking-wider">Drafting</span></div>}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving} 
            className="bg-[#1FC81F] text-white px-10 py-3 rounded-full text-sm font-black shadow-xl shadow-green-100 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-2"
          >
            {isSaving ? '正在發佈...' : '發佈變更'}
          </button>
          <button onClick={logout} className="p-3 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full transition-all">🚪</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Modular Sidebar */}
        <div className="w-[480px] bg-white border-r flex flex-col overflow-hidden shadow-2xl z-20">
          <div className="flex p-4 bg-gray-50 border-b gap-3">
            <button onClick={() => setActiveTab('pages')} className={`flex-1 py-3.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'pages' ? 'bg-white shadow-md text-[#1FC81F]' : 'text-gray-400 hover:text-gray-600'}`}>📄 頁面規劃</button>
            <button onClick={() => setActiveTab('global')} className={`flex-1 py-3.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'global' ? 'bg-white shadow-md text-[#1FC81F]' : 'text-gray-400 hover:text-gray-600'}`}>⚙️ 全域設定</button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {activeTab === 'pages' ? (
              <div className="space-y-10">
                {/* Page Selection */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">網站地圖 / 頁面管理</label>
                    <button onClick={() => setIsAddPageModalOpen(true)} className="text-xs text-[#1FC81F] font-black hover:underline">+ 新增頁面</button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {draft.pages.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedPageId(p.id)} 
                        className={`p-5 rounded-2xl border-2 flex justify-between items-center cursor-pointer transition-all ${selectedPageId === p.id ? 'border-[#1FC81F] bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900">{p.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">/p/{p.slug}</span>
                        </div>
                        {p.slug !== 'home' && (
                          <button onClick={(e) => { e.stopPropagation(); deletePage(p.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">🗑️</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section List for Active Page */}
                <div className="pt-10 border-t border-gray-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">頁面模組架構 (Block List)</h3>
                    <span className="text-[10px] font-bold text-gray-300">共 {activePage.sections.length} 個模組</span>
                  </div>
                  
                  <div className="space-y-6">
                    {activePage.sections.map((sec, idx) => (
                      <div key={sec.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-5 group relative hover:shadow-lg transition-all">
                        {/* ABSOLUTE DELETE BUTTON (TOP-RIGHT) */}
                        <button 
                          onClick={() => removeSection(sec.id)} 
                          className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-10 font-bold text-xs"
                          title="刪除此模組"
                        >
                          ✕
                        </button>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-6 bg-[#1FC81F] rounded-full"></div>
                             <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{sec.type}</span>
                          </div>
                          <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => moveSection(idx, 'up')} className="w-9 h-9 flex items-center justify-center bg-white border rounded-xl hover:bg-gray-100 shadow-sm" title="上移">↑</button>
                             <button onClick={() => moveSection(idx, 'down')} className="w-9 h-9 flex items-center justify-center bg-white border rounded-xl hover:bg-gray-100 shadow-sm" title="下移">↓</button>
                          </div>
                        </div>

                        {/* Editor Blocks */}
                        {sec.type === 'FEATURE_BLOCK' && (
                          <div className="space-y-4">
                            <input value={sec.content.title} onChange={e => updateSection(sec.id, { title: e.target.value })} className={inputCls} placeholder="區塊標題" />
                            <textarea value={sec.content.description} onChange={e => updateSection(sec.id, { description: e.target.value })} className={`${inputCls} h-28 resize-none`} placeholder="特色內容描述..." />
                            <ImageUpload label="主視覺圖片" value={sec.content.image} onChange={val => updateSection(sec.id, { image: val })} />
                            <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                              <input type="checkbox" checked={sec.content.reverse} onChange={e => updateSection(sec.id, { reverse: e.target.checked })} className="w-5 h-5 accent-[#1FC81F]" />
                              <span className="text-xs font-black text-gray-600">圖片與文字位置對調</span>
                            </label>
                          </div>
                        )}

                        {sec.type === 'HERO_SLIDER' && (
                          <div className="space-y-6">
                            {sec.content.items.map((item: SliderItem, itemIdx: number) => (
                              <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-100 space-y-3 relative shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">幻燈片圖片 #{itemIdx + 1}</span>
                                  {sec.content.items.length > 1 && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('確定要移除此張幻燈片嗎？')) {
                                          const its = sec.content.items.filter((_, i) => i !== itemIdx);
                                          updateSection(sec.id, { items: its });
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest"
                                    >
                                      移除
                                    </button>
                                  )}
                                </div>
                                <input 
                                  value={item.text} 
                                  onChange={e => {
                                    const its = [...sec.content.items]; 
                                    its[itemIdx] = { ...its[itemIdx], text: e.target.value };
                                    updateSection(sec.id, { items: its });
                                  }} 
                                  className={inputCls} 
                                  placeholder="圖片上的標題文字" 
                                />
                                <ImageUpload 
                                  label="背景圖片" 
                                  value={item.imageUrl} 
                                  onChange={val => {
                                    const its = [...sec.content.items]; 
                                    its[itemIdx] = { ...its[itemIdx], imageUrl: val };
                                    updateSection(sec.id, { items: its });
                                  }} 
                                />
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newItem = { id: Math.random().toString(36).substr(2, 9), text: '新標題文字', bgColor: '#333' };
                                updateSection(sec.id, { items: [...sec.content.items, newItem] });
                              }}
                              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:border-[#1FC81F] hover:text-[#1FC81F] transition-all"
                            >
                              + 新增圖片幻燈片
                            </button>
                          </div>
                        )}
                        
                        {sec.type === 'PRICE_TABLE' && (
                          <div className="space-y-6">
                             <input value={sec.content.title} onChange={e => updateSection(sec.id, { title: e.target.value })} className={inputCls} placeholder="價目表標題" />
                             
                             <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                               <div className="overflow-x-auto p-2">
                                 <table className="min-w-full text-xs">
                                   <thead>
                                     <tr>
                                       {sec.content.headers.map((h: string, hIdx: number) => (
                                         <th key={hIdx} className="p-2 border-b">
                                           <div className="flex flex-col gap-1">
                                             <input 
                                               value={h} 
                                               onChange={e => {
                                                 const headers = [...sec.content.headers];
                                                 headers[hIdx] = e.target.value;
                                                 updateSection(sec.id, { headers });
                                               }}
                                               className="w-full border p-1 rounded font-bold"
                                             />
                                             {sec.content.headers.length > 1 && (
                                               <button onClick={() => {
                                                  const headers = sec.content.headers.filter((_:any, i:any) => i !== hIdx);
                                                  const rows = sec.content.rows.map((row:any) => row.filter((_:any, i:any) => i !== hIdx));
                                                  updateSection(sec.id, { headers, rows });
                                               }} className="text-[8px] text-red-300">移除欄</button>
                                             )}
                                           </div>
                                         </th>
                                       ))}
                                       <th className="p-2 border-b">
                                         <button onClick={() => {
                                           updateSection(sec.id, { 
                                             headers: [...sec.content.headers, '新欄位'],
                                             rows: sec.content.rows.map((row:any) => [...row, '$0'])
                                           });
                                         }} className="text-[#1FC81F] font-bold">+</button>
                                       </th>
                                     </tr>
                                   </thead>
                                   <tbody>
                                     {sec.content.rows.map((row: string[], rIdx: number) => (
                                       <tr key={rIdx}>
                                         {row.map((cell: string, cIdx: number) => (
                                           <td key={cIdx} className="p-1 border-b">
                                             <input 
                                               value={cell} 
                                               onChange={e => {
                                                 const rows = [...sec.content.rows];
                                                 rows[rIdx] = [...rows[rIdx]];
                                                 rows[rIdx][cIdx] = e.target.value;
                                                 updateSection(sec.id, { rows });
                                               }}
                                               className="w-full border p-1 rounded"
                                             />
                                           </td>
                                         ))}
                                         <td className="p-1 border-b text-center">
                                           {sec.content.rows.length > 1 && (
                                             <button onClick={() => {
                                               const rows = sec.content.rows.filter((_:any, i:any) => i !== rIdx);
                                               updateSection(sec.id, { rows });
                                             }} className="text-red-300">✕</button>
                                           )}
                                         </td>
                                       </tr>
                                     ))}
                                   </tbody>
                                 </table>
                               </div>
                               <button onClick={() => {
                                 const newRow = new Array(sec.content.headers.length).fill('-');
                                 updateSection(sec.id, { rows: [...sec.content.rows, newRow] });
                               }} className="w-full py-2 bg-gray-50 text-[10px] font-bold text-gray-400 hover:text-green-500 transition-colors uppercase">
                                 + 新增資料列
                               </button>
                             </div>
                          </div>
                        )}

                        {sec.type === 'FAQ_SECTION' && (
                          <div className="space-y-4">
                            <input value={sec.content.title} onChange={e => updateSection(sec.id, { title: e.target.value })} className={inputCls} placeholder="問答區標題" />
                            {sec.content.items.map((faq: any, faqIdx: number) => (
                              <div key={faq.id} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative">
                                <div className="flex justify-between">
                                  <span className="text-[9px] font-black text-gray-300">FAQ #{faqIdx + 1}</span>
                                  <button onClick={() => {
                                    if (window.confirm('確定要刪除此問答項嗎？')) {
                                      const its = sec.content.items.filter((_:any, i:number) => i !== faqIdx);
                                      updateSection(sec.id, { items: its });
                                    }
                                  }} className="text-red-300 hover:text-red-500 text-[9px]">刪除</button>
                                </div>
                                <input value={faq.question} onChange={e => {
                                  const its = [...sec.content.items]; its[faqIdx].question = e.target.value;
                                  updateSection(sec.id, { items: its });
                                }} className={inputCls} placeholder="輸入問題..." />
                                <textarea value={faq.answer} onChange={e => {
                                  const its = [...sec.content.items]; its[faqIdx].answer = e.target.value;
                                  updateSection(sec.id, { items: its });
                                }} className={`${inputCls} h-20 text-xs`} placeholder="輸入回答..." />
                              </div>
                            ))}
                            <button onClick={() => {
                               const newItem = { id: Math.random().toString(36).substr(2,9), question: '', answer: '' };
                               updateSection(sec.id, { items: [...sec.content.items, newItem] });
                            }} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] text-gray-400 font-bold hover:text-[#1FC81F]">
                              + 新增常見問題
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Module Buttons */}
                    <div className="bg-green-50/50 p-8 rounded-[2rem] border-2 border-dashed border-green-200">
                      <p className="text-[10px] font-black text-[#1FC81F] uppercase text-center mb-6 tracking-widest">新增版面區塊模組</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addSection('HERO_SLIDER')} className="text-[11px] font-black bg-white border border-green-200 p-4 rounded-2xl hover:bg-[#1FC81F] hover:text-white transition-all shadow-sm">🖼️ 輪播展示</button>
                        <button onClick={() => addSection('FEATURE_BLOCK')} className="text-[11px] font-black bg-white border border-green-200 p-4 rounded-2xl hover:bg-[#1FC81F] hover:text-white transition-all shadow-sm">📰 圖文特色</button>
                        <button onClick={() => addSection('PRICE_TABLE')} className="text-[11px] font-black bg-white border border-green-200 p-4 rounded-2xl hover:bg-[#1FC81F] hover:text-white transition-all shadow-sm">💰 報價表格</button>
                        <button onClick={() => addSection('FAQ_SECTION')} className="text-[11px] font-black bg-white border border-green-200 p-4 rounded-2xl hover:bg-[#1FC81F] hover:text-white transition-all shadow-sm">❓ 常見問答</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">全域網站基本資訊</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-3">品牌官方名稱</label>
                    <input value={draft.brandName} onChange={e => updateDraft({ brandName: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-3">總店預約電話</label>
                    <input value={draft.contactPhone} onChange={e => updateDraft({ contactPhone: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-3">總店服務地址</label>
                    <input value={draft.contactAddress} onChange={e => updateDraft({ contactAddress: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-3">官方聯繫 Email</label>
                    <input value={draft.contactEmail} onChange={e => updateDraft({ contactEmail: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="flex-1 bg-gray-200/50 p-12 flex flex-col items-center">
          <div className="mb-8 flex space-x-4 bg-white p-2 rounded-full shadow-xl border border-gray-100 items-center">
            <div className="px-6 py-1.5 text-[10px] font-black text-[#1FC81F] border-r border-gray-100 uppercase tracking-widest">目前編輯頁面：{activePage.title}</div>
            <div className="px-6 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">即時響應式預覽</div>
          </div>
          <div className="w-full h-full max-w-5xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden border-[14px] border-gray-900 relative">
            <div className="absolute top-0 left-0 w-full h-10 bg-gray-900 flex justify-center items-center z-10">
               <div className="w-28 h-4 bg-gray-800 rounded-full" />
            </div>
            <div className="w-full h-full pt-10 overflow-y-auto scrollbar-hide">
               <LandingPagePreview content={{ ...draft, pages: [activePage] }} />
            </div>
          </div>
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default AdminDashboard;
