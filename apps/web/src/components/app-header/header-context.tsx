"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface HeaderDetailContext {
  title: string;
  rating: number | null;
  coverUrl: string | null;
  accentHex: string | null;
}

interface ContextValue {
  detail: HeaderDetailContext | null;
  setDetail: (detail: HeaderDetailContext | null) => void;
}

const HeaderCtx = createContext<ContextValue>({ detail: null, setDetail: () => {} });

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [detail, setDetail] = useState<HeaderDetailContext | null>(null);
  return <HeaderCtx.Provider value={{ detail, setDetail }}>{children}</HeaderCtx.Provider>;
}

export function useHeaderDetail(): HeaderDetailContext | null {
  return useContext(HeaderCtx).detail;
}

/**
 * Mount this client component inside a page to push the anime detail context
 * up to the AppHeader. It clears the context on unmount so navigating away
 * from /anime/[slug] restores the default header.
 */
export function HeaderDetailBridge(props: HeaderDetailContext) {
  const { setDetail } = useContext(HeaderCtx);
  const { title, rating, coverUrl, accentHex } = props;
  useEffect(() => {
    setDetail({ title, rating, coverUrl, accentHex });
    return () => setDetail(null);
  }, [setDetail, title, rating, coverUrl, accentHex]);
  return null;
}
