import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-28 px-5">{children}</main>
      <BottomNav />
    </>
  );
}
