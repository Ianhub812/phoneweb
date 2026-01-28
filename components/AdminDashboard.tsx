
import React, { useState, useEffect } from 'react';
import { useContent } from '../App';
import { SiteContent, SliderItem, PriceRow, FAQItem } from '../types';
import LandingPagePreview from './LandingPagePreview';
import ImageUpload from './ImageUpload';

type TabType = 'general' | 'slider' | 'repair' | 'prices' | 'faq';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

const AdminDashboard: React.FC = () => {
  const { content, updateContent, logout } = useContent();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  useEffect(() => {
    setHasChanges(JSON.stringify(draft) !== JSON.stringify(content));
  }, [draft, content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (id: string, field: keyof SliderItem, value: string) => {
    setDraft(prev => ({
      ...prev,
      sliderItems: prev.sliderItems.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handlePriceChange = (index: number, field: keyof PriceRow, value: string) => {
    const newPrices = [...draft.priceRows];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setDraft(prev => ({ ...prev, priceRows: newPrices }));
  };

  const handleFAQChange = (id: string, field: keyof FAQItem, value: string) => {
    setDraft(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateContent(draft);
    setIsSaving(false);
  };

  const deviceWidths = {
    mobile: 'max-w-[375px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-full'
  };

  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none transition shadow-sm";

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden text-gray-800">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#1FC81F] rounded-lg flex items-center justify-center text-white font-bold">G</div>
            <span className="font-bold text-lg tracking-tight">GuardStation <span className="text-gray-400 font-normal">Admin</span></span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${hasChanges ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
            {hasChanges ? '未儲存的變更' : '已同步'}
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => (
              <button key={d} onClick={() => setPreviewDevice(d)} className={`p-1.5 rounded-md transition-all ${previewDevice === d ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {d === 'desktop' && '💻'}
                {d === 'tablet' && '📱'}
                {d === 'mobile' && '📲'}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!hasChanges || isSaving} className={`px-5 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all ${hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}>
            {isSaving ? '儲存中...' : '儲存並發佈'}
          </button>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition">🚪</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6 shrink-0">
          {(['general', 'slider', 'repair', 'prices', 'faq'] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === tab ? 'bg-green-50 text-green-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}>
              {tab === 'general' && '⚙️'}
              {tab === 'slider' && '🖼️'}
              {tab === 'repair' && '🛠️'}
              {tab === 'prices' && '🏷️'}
              {tab === 'faq' && '❓'}
            </button>
          ))}
        </aside>

        <div className="w-[450px] bg-white border-r border-gray-200 overflow-y-auto p-6 scroll-smooth">
          <h2 className="text-xl font-bold capitalize mb-8">{activeTab} 設定</h2>
          
          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">品牌名稱</label>
                  <input name="brandName" value={draft.brandName} onChange={handleInputChange} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">主色調</label>
                  <input type="color" name="primaryColor" value={draft.primaryColor} onChange={handleInputChange} className="w-full h-10 rounded border bg-white cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">電話</label>
                  <input name="contactPhone" value={draft.contactPhone} onChange={handleInputChange} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">地址</label>
                  <input name="contactAddress" value={draft.contactAddress} onChange={handleInputChange} className={inputClasses} />
                </div>
              </div>
            )}

            {activeTab === 'slider' && (
              <div className="space-y-10">
                {draft.sliderItems.map((s, idx) => (
                  <div key={s.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">輪播圖 #{idx + 1}</span>
                    
                    <ImageUpload 
                      label="輪播圖片" 
                      value={s.imageUrl} 
                      onChange={(base64) => handleSliderChange(s.id, 'imageUrl', base64)} 
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">顯示文字</label>
                      <input value={s.text} onChange={(e) => handleSliderChange(s.id, 'text', e.target.value)} className={inputClasses} />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">備用背景色</label>
                      <input type="color" value={s.bgColor} onChange={(e) => handleSliderChange(s.id, 'bgColor', e.target.value)} className="w-full h-8 border rounded bg-white cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'repair' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">維修區塊標題</label>
                  <input name="repairTitle" value={draft.repairTitle} onChange={handleInputChange} className={inputClasses} />
                </div>
                
                <ImageUpload 
                  label="維修展示圖片" 
                  value={draft.repairImage} 
                  onChange={(base64) => setDraft(prev => ({ ...prev, repairImage: base64 }))} 
                />

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">維修詳情描述</label>
                  <textarea name="repairDesc" value={draft.repairDesc} onChange={handleInputChange} rows={6} className={inputClasses} />
                </div>
              </div>
            )}

            {activeTab === 'prices' && (
              <div className="space-y-6">
                {draft.priceRows.map((row, i) => (
                  <div key={i} className="p-5 border rounded-2xl bg-gray-50 space-y-3">
                    <input value={row.model} onChange={(e) => handlePriceChange(i, 'model', e.target.value)} className={`${inputClasses} font-bold`} placeholder="機型名稱" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold ml-1">電池更換</label>
                        <input value={row.battery} onChange={(e) => handlePriceChange(i, 'battery', e.target.value)} className={inputClasses} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold ml-1">螢幕更換</label>
                        <input value={row.screen} onChange={(e) => handlePriceChange(i, 'screen', e.target.value)} className={inputClasses} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {draft.faqs.map(f => (
                  <div key={f.id} className="p-5 border rounded-2xl bg-gray-50">
                    <label className="block text-xs font-bold text-gray-400 mb-1">問題標題</label>
                    <input value={f.question} onChange={(e) => handleFAQChange(f.id, 'question', e.target.value)} className={`${inputClasses} font-bold mb-4`} />
                    <label className="block text-xs font-bold text-gray-400 mb-1">問題回答</label>
                    <textarea value={f.answer} onChange={(e) => handleFAQChange(f.id, 'answer', e.target.value)} className={inputClasses} rows={4} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 bg-gray-100 p-8 flex flex-col items-center">
          <div className={`w-full h-full flex flex-col items-center transition-all duration-500 ${deviceWidths[previewDevice]}`}>
             <div className="flex-1 w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative">
               <div className="absolute inset-0 overflow-y-auto">
                 <LandingPagePreview content={draft} />
               </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
