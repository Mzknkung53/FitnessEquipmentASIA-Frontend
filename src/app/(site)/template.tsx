// Re-mounts on every navigation, so each storefront page plays the entrance
// animation (see .page-enter in globals.css). Layout parts (header, footer) stay put.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
