import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Launchpad Mission Control - CRM + AI Email Assistant
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Welcome to the Mission Control dashboard. Manage your partnerships, students, and use AI to streamline your outreach.
          </p>
        </div>
        
        <nav className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-md">
          <a href="/dashboard" className="flex-1 bg-zinc-900 text-white py-3 px-6 rounded-full text-center font-medium hover:bg-zinc-800 transition dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
            Dashboard
          </a>
          <a href="/partners" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-full text-center font-medium hover:bg-blue-700 transition">
            Partners
          </a>
          <a href="/integrations/gmail" className="flex-1 bg-green-600 text-white py-3 px-6 rounded-full text-center font-medium hover:bg-green-700 transition">
            Gmail AI
          </a>
        </nav>
      </main>
    </div>
  );
}
