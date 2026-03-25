import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-8">
          <p className="text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-sm text-[#888] max-w-md text-center">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
