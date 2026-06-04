// Root layout is a pass-through: the real <html>/<body> shell lives in
// app/[locale]/layout.tsx, where the active locale is known (so `lang` is
// correct). Next requires a root layout to exist, but it must not render its
// own <html> when a nested layout already does.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
