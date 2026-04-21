'use client';

export default function CompatibilityBadge({ level, note }) {
  const styles = {
    green: {
      bg: '#EAF3DE',
      border: '#639922',
      titleColor: '#173404',
      textColor: '#3B5A21',
      icon: '🟢',
      title: 'Adatta così com\'è',
    },
    amber: {
      bg: '#FAEEDA',
      border: '#BA7517',
      titleColor: '#412402',
      textColor: '#854F0B',
      icon: '🟡',
      title: 'Adattabile con modifiche',
    },
    red: {
      bg: '#FCEBEB',
      border: '#E24B4A',
      titleColor: '#501313',
      textColor: '#A32D2D',
      icon: '🔴',
      title: 'Non adatta a questa età',
    },
  };

  const s = styles[level];
  if (!s) return null;

  return (
    <div
      className="p-3 rounded mt-3 text-xs"
      style={{
        backgroundColor: s.bg,
        borderLeft: `3px solid ${s.border}`,
      }}
    >
      <div className="font-medium mb-1" style={{ color: s.titleColor }}>
        {s.icon} {s.title}
      </div>
      <div style={{ color: s.textColor }}>{note}</div>
    </div>
  );
}