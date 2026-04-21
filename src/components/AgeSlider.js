'use client';

export default function AgeSlider({ months, onChange }) {
  return (
    <div className="bg-[#E8F2F8] rounded-lg p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[#1F4E6E]">Età del bambino</span>
        <span className="text-sm font-medium text-[#1F4E6E]">{months} mesi</span>
      </div>
      <input
        type="range"
        min="6"
        max="36"
        value={months}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[#7FB9D4]"
      />
      <div className="flex justify-between text-xs text-[#1F4E6E] mt-1 opacity-70">
        <span>6m</span>
        <span>36m</span>
      </div>
    </div>
  );
}