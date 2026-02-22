export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-6 animate-pulse">
        {/* Logo placeholder */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-muted" />
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <div className="mx-auto h-7 w-40 rounded bg-muted" />
          <div className="mx-auto h-4 w-56 rounded bg-muted" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
