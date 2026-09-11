import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Gauge House Runtime Caught Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.hash = '/';
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center mb-6 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest font-bold block mb-2">
            Gauge House Web App Notice
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Application View Encountered an Issue
          </h1>

          <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
            The page encountered a temporary display error. Your cart, orders, and configuration remain safe. Click below to reload or return home.
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            <button
              onClick={this.handleReload}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-8 max-w-xl w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left font-mono text-xs text-red-400 overflow-auto max-h-48">
              <p className="font-bold mb-1 text-neutral-300">Error Details:</p>
              <p>{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
