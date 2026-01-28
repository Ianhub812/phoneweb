
import React, { useRef, useState } from 'react';

interface Props {
  value?: string;
  onChange: (base64: string) => void;
  label: string;
}

const ImageUpload: React.FC<Props> = ({ value, onChange, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }
    
    // Limit size for localStorage prototype (approx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('檔案過大（上限 2MB），實際部署建議使用雲端儲存服務。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all h-32 flex flex-col items-center justify-center
          ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 bg-white'}
        `}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">更換圖片</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="text-2xl mb-1 text-gray-300">📤</div>
            <p className="text-xs text-gray-400">點擊或拖曳圖片至此</p>
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={onFileChange}
        />
      </div>
      {value && (
        <button 
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
          className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase transition"
        >
          移除圖片
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
