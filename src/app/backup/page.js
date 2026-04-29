'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/lib/useFavorites';
import { useCustomRecipes } from '@/lib/useCustomRecipes';

const LAST_BACKUP_KEY = 'cosa-cucino-last-backup';

export default function BackupPage() {
  const { favorites } = useFavorites();
  const { recipes: customRecipes } = useCustomRecipes();
  const [lastBackup, setLastBackup] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  useEffect(() => {
    const last = localStorage.getItem(LAST_BACKUP_KEY);
    if (last) setLastBackup(last);
  }, []);

  function exportBackup() {
    const backup = {
      version: 1,
      exported_at: new Date().toISOString(),
      favorites,
      custom_recipes: customRecipes,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `cosa-cucino-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const now = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, now);
    setLastBackup(now);
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version || !Array.isArray(data.favorites) || !Array.isArray(data.custom_recipes)) {
          throw new Error('Formato backup non valido');
        }
        if (!confirm(`Importare ${data.favorites.length} preferiti e ${data.custom_recipes.length} ricette personali?\n\nNB: i tuoi dati attuali verranno sostituiti.`)) {
          return;
        }
        localStorage.setItem('cosa-cucino-favorites', JSON.stringify(data.favorites));
        localStorage.setItem('cosa-cucino-custom-recipes', JSON.stringify(data.custom_recipes));
        setImportStatus('success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setImportStatus('error');
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  const daysSinceBackup = lastBackup
    ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000)
    : null;

  const showWarning = daysSinceBackup === null || daysSinceBackup >= 30;

  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-[#C65D3B] hover:text-white hover:border-[#C65D3B] transition shadow-sm"
            aria-label="Torna alla home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#C65D3B]">💾 Backup</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
          <h2 className="text-sm font-medium text-gray-800 mb-2">Stato attuale</h2>
          <p className="text-sm text-gray-600">⭐ {favorites.length} preferiti</p>
          <p className="text-sm text-gray-600">✏️ {customRecipes.length} ricette personali</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            {lastBackup ? (
              <p className="text-xs text-gray-500">
                Ultimo backup: {new Date(lastBackup).toLocaleString('it-IT')}
                {daysSinceBackup !== null && ` (${daysSinceBackup} ${daysSinceBackup === 1 ? 'giorno' : 'giorni'} fa)`}
              </p>
            ) : (
              <p className="text-xs text-gray-500">Nessun backup ancora effettuato.</p>
            )}
          </div>
        </div>

        {showWarning && (favorites.length > 0 || customRecipes.length > 0) && (
          <div className="bg-[#FAEEDA] border border-[#BA7517] rounded-lg p-3 mb-3">
            <p className="text-xs text-[#854F0B]">
              ⚠️ {lastBackup ? 'Sono passati più di 30 giorni dal tuo ultimo backup.' : 'Non hai ancora effettuato un backup.'} Ti consigliamo di scaricarne uno.
            </p>
          </div>
        )}

        <button
          onClick={exportBackup}
          className="w-full py-3 bg-[#6B8E4E] text-white rounded-lg font-medium hover:opacity-90 mb-3"
        >
          📥 Scarica backup
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-800 mb-2">Ripristina da backup</h2>
          <p className="text-xs text-gray-500 mb-2">
            Carica un file di backup precedente. ⚠️ I dati attuali verranno sostituiti.
          </p>
          <label className="block w-full py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] text-center cursor-pointer">
            📤 Carica file backup
            <input type="file" accept=".json" onChange={importBackup} className="hidden" />
          </label>
          {importStatus === 'success' && <p className="text-xs text-green-600 mt-2">✓ Importato! Ricarico la pagina...</p>}
          {importStatus === 'error' && <p className="text-xs text-red-600 mt-2">✗ File non valido.</p>}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Il backup contiene SOLO i tuoi preferiti e le tue ricette personali.<br />
          Le 272 ricette di GialloZafferano sono già parte dell'app.
        </p>
      </div>
    </main>
  );
}
