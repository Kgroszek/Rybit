import { Sidebar } from "./Sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-5 lg:p-8">{children}</section>
      </div>
    </main>
  );
}