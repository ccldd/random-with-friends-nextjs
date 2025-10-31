'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 * Prevents entire app crashes and provides user-friendly error messages
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
                <p className="mb-4 text-sm">
                  An unexpected error occurred. Please try again or return to the home page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 rounded bg-red-50 p-2 text-xs">
                    <summary className="cursor-pointer font-medium">Error details</summary>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Room-specific error boundary with tailored messaging
 */
export function RoomErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <h2 className="mb-2 text-lg font-semibold">Room Error</h2>
                <p className="text-sm">
                  We encountered a problem with the room. This could be due to:
                </p>
                <ul className="ml-4 mt-2 list-disc space-y-1 text-sm">
                  <li>Room no longer exists</li>
                  <li>Connection issues</li>
                  <li>Invalid room data</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => (window.location.href = '/')}
              variant="default"
              className="w-full"
            >
              Return Home
            </Button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Room error:', error);
        // Could send to error tracking service here
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
