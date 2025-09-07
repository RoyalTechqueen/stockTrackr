import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1  min-h-screen flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
