"use client";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin - Staff Management</h1>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-l-4 border-yellow-400">
        <h2 className="text-xl font-semibold mb-4">Admin Features (Placeholder)</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Full read/write access</li>
          <li>Staff management (roles, activity logs)</li>
          <li>Audit logs via ActivityLog model</li>
        </ul>
      </div>
    </div>
  );
}
