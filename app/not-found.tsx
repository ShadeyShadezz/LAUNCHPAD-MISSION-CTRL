export default function NotFound() {
  return (
    <div className="lmc-page flex items-center justify-center">
      <div className="lmc-surface px-10 py-12 text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-3 text-foreground">Page Not Found</h1>
        <p className="text-base text-muted-foreground mb-6">Sorry, the page you are looking for does not exist.</p>
        <a href="/dashboard" className="lmc-btn-inline px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-semibold hover:bg-primary/20 no-underline">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}


