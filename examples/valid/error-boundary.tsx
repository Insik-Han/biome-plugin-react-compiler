// VALID: Using Error Boundaries for error handling

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// GOOD: Proper Error Boundary implementation
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// GOOD: Using Error Boundary to wrap components
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ChildComponent />
    </ErrorBoundary>
  );
}

function ChildComponent() {
  return <div>Child content</div>;
}

export { ErrorBoundary, App };
