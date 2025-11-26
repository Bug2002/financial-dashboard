import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Financial Analysis App
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Advanced pattern detection, probabilistic predictions, and automated news verification for stocks and crypto.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
