import React from 'react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[var(--color-danger)] text-3xl">error</span>
            </div>
            <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Something went wrong</h2>
            <p className="text-body-md text-[var(--color-outline)] mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
