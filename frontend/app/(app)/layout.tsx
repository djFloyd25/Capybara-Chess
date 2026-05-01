import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar streak={7} xp={420} level={5} />
      <main className="ml-64 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
