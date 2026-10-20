import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 rounded-2xl bg-white border border-[#e8e4dc] shadow-sm text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#ba3d3d]/10 text-[#ba3d3d] flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-[#2c2825]">
            {this.props.fallbackTitle || '页面加载遇到异常'}
          </h2>
          <p className="text-xs text-[#7c756d] leading-relaxed">
            {this.state.error?.message || '组件渲染中发生未捕获错误，已保护应用不崩溃。'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2c2825] text-white text-xs font-medium hover:bg-[#1f1c1a] active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新尝试</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
