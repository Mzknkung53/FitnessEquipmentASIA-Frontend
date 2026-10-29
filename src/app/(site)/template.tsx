import { PageTransition } from "@/components/page-transition";

// Re-mounts on every navigation, so each storefront page animates in and out
// (see .page-in / .page-out in globals.css). Header and footer live in the layout and stay put.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
