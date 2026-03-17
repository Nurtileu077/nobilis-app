import React from 'react';

class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[${this.props.viewName || 'View'}] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              Ошибка в разделе
            </h3>
            {this.props.viewName && (
              <p className="text-sm text-gray-400 mb-4">{this.props.viewName}</p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Произошла ошибка при загрузке. Попробуйте ещё раз.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 rounded-xl font-semibold text-white btn-primary text-sm"
              >
                Повторить
              </button>
              {this.props.onNavigateHome && (
                <button
                  onClick={this.props.onNavigateHome}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors"
                >
                  На главную
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ViewErrorBoundary;
