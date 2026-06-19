import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/20 p-8 text-center bg-destructive/5 backdrop-blur-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-pulse" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            An unexpected error occurred while loading this section.
          </p>
          <p className="mt-1 text-xs text-destructive/80 font-mono overflow-auto max-w-lg max-h-24 p-2 bg-destructive/10 rounded border border-destructive/20">
            {this.state.error?.message}
          </p>
          <Button
            onClick={this.handleReset}
            className="mt-6 flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
