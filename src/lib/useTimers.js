'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Audio non disponibile:', e);
  }
}

function vibrate() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  } catch (e) {}
}

export function parseTimersFromStep(stepText) {
  const patterns = [
    /(\d+)\s*[-–]\s*(\d+)\s*(minut[oi]|min\b)/gi,
    /(\d+)\s*(or[ae]|h\b)/gi,
    /(\d+)\s*(minut[oi]|min\b)/gi,
    /(\d+)\s*(secondi|sec\b)/gi,
  ];

  const results = [];
  const text = stepText || '';

  const rangeMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*(minut[oi]|min\b)/i);
  if (rangeMatch) {
    results.push({ minutes: parseInt(rangeMatch[1]), label: `${rangeMatch[1]}-${rangeMatch[2]} min` });
    return results;
  }

  const hourMatch = text.match(/(\d+)\s*(or[ae]|h\b)/i);
  if (hourMatch) {
    const h = parseInt(hourMatch[1]);
    const extraMin = text.match(/(\d+)\s*(minut[oi]|min\b)/i);
    const total = h * 60 + (extraMin ? parseInt(extraMin[1]) : 0);
    results.push({ minutes: total, label: total >= 60 ? `${h}h${extraMin ? ` ${extraMin[1]}min` : ''}` : `${total} min` });
    return results;
  }

  const minMatch = text.match(/(\d+)\s*(minut[oi]|min\b)/i);
  if (minMatch) {
    results.push({ minutes: parseInt(minMatch[1]), label: `${minMatch[1]} min` });
  }

  const secMatch = text.match(/(\d+)\s*(secondi|sec\b)/i);
  if (secMatch && results.length === 0) {
    const secs = parseInt(secMatch[1]);
    results.push({ minutes: secs / 60, label: `${secMatch[1]} sec`, seconds: secs });
  }

  return results;
}

export function useTimers() {
  const [timers, setTimers] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        let changed = false;
        const updated = prev.map((t) => {
          if (!t.running || t.remaining <= 0) return t;
          const newRemaining = t.remaining - 1;
          changed = true;
          if (newRemaining <= 0) {
            playBeep();
            vibrate();
            return { ...t, running: false, remaining: 0, finished: true };
          }
          return { ...t, remaining: newRemaining };
        });
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const addTimer = useCallback((minutes, label, stepIndex) => {
    const totalSeconds = Math.round((minutes || 0) * 60);
    const id = `timer-${Date.now()}-${stepIndex}`;
    setTimers((prev) => [
      ...prev,
      { id, label, totalSeconds, remaining: totalSeconds, running: true, finished: false, stepIndex },
    ]);
    return id;
  }, []);

  const toggleTimer = useCallback((id) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, running: !t.running } : t))
    );
  }, []);

  const resetTimer = useCallback((id) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remaining: t.totalSeconds, running: false, finished: false } : t))
    );
  }, []);

  const removeTimer = useCallback((id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { timers, addTimer, toggleTimer, resetTimer, removeTimer };
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
