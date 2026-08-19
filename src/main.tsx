import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#111] border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <span className="text-4xl mb-4 block">🍊</span>
            <h1 className="text-xl font-black text-white mb-2 uppercase">Don Omar Rotisería</h1>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Ocurrió un detalle al cargar la aplicación. Hacé clic abajo para restaurar y ver el menú completo.
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem("donomar_products");
                  localStorage.removeItem("donomar_promotions");
                  localStorage.removeItem("donomar_orders");
                } catch (e) {}
                window.location.reload();
              }}
              className="w-full bg-[#FF7A00] text-black font-black py-3 rounded-xl uppercase text-xs hover:bg-orange-500 transition-all shadow-lg shadow-[#FF7A00]/20"
            >
              Recargar Menú y Productos
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
