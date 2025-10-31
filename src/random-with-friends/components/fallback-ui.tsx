/**
 * Loading and error fallback components for better UX
 */

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-primary border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function RoomLoadingScreen() {
  return (
    <LoadingScreen message="Connecting to room..." />
  );
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
      <h3 className="mb-2 font-semibold text-destructive">{title}</h3>
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-destructive underline underline-offset-4 hover:no-underline"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function ConnectionLostMessage({ onReconnect }: { onReconnect?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Lost"
      message="Your connection to the room was interrupted. Please check your internet connection."
      onRetry={onReconnect}
    />
  );
}

export function RoomNotFoundMessage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Room Not Found</h1>
        <p className="text-muted-foreground">
          This room doesn't exist or is no longer active.
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export function RoomClosedMessage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Room Closed</h1>
        <p className="text-muted-foreground">
          The host has closed this room. Thank you for participating!
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create or Join Another Room
        </a>
      </div>
    </div>
  );
}
