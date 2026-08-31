import { useEffect, useState } from 'react';

export const formatRelTime = (date) => {
  if (!date) return '';

  const h = Math.floor((Date.now() - new Date(date)) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

export const useRelativeTime = (date, intervalMs = 60000) => {
  const [label, setLabel] = useState(() => formatRelTime(date));

  useEffect(() => {
    setLabel(formatRelTime(date)); // recompute right away if `date` changes

    const interval = setInterval(() => {
      setLabel(formatRelTime(date));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [date, intervalMs]);

  return label;
};