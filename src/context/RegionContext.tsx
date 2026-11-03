import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { REGIONS, type RegionId, type RegionPack } from '../data/regions';

const STORAGE_KEY = 'wf-demo-region';

type RegionContextValue = {
  regionId: RegionId;
  region: RegionPack;
  setRegion: (id: RegionId) => void;
};

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

function readInitial(): RegionId {
  if (typeof window === 'undefined') return 'us';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'us' || saved === 'sg' || saved === 'uk' || saved === 'anz') return saved;
  return 'us';
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regionId, setRegionId] = useState<RegionId>(readInitial);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, regionId); } catch { /* ignore */ }
  }, [regionId]);

  const value = useMemo<RegionContextValue>(() => ({
    regionId,
    region: REGIONS[regionId],
    setRegion: setRegionId,
  }), [regionId]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used inside RegionProvider');
  return ctx;
}
