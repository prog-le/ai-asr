import React from 'react';

interface State { hasError: boolean; }
interface Props { children: React.ReactNode; }

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // 可扩展：上报日志
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h2>页面出错了，请刷新或联系管理员。</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 