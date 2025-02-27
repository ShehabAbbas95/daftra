import Header from "@/components/Header";
import JobList from "@/components/JobList";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <JobList />
        </main>
      </div>
    </div>
  );
}
