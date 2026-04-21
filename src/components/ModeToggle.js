'use client';

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 mb-4">
      <button
        onClick={() => onChange('adult')}
        className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
          mode === 'adult'
            ? 'bg-[#6B8E4E] text-white shadow-sm'
            : 'bg-transparent text-gray-600'
        }`}
      >
        👨 Adulti
      </button>
      <button
        onClick={() => onChange('baby')}
        className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
          mode === 'baby'
            ? 'bg-[#7FB9D4] text-white shadow-sm'
            : 'bg-transparent text-gray-600'
        }`}
      >
        👶 Bambino
      </button>
    </div>
  );
}