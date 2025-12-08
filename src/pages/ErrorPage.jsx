import React from 'react';
import { Home, RefreshCcw } from 'lucide-react';
import ErrorComponent from '../components/ErrorComponent';

const ErrorPage = () => {
  const goHome = () => {
    window.location.href = '/'; 
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      {/* 1. Giảm space-y-8 xuống space-y-2 hoặc space-y-4 để các khối gần nhau hơn */}
      <div className="max-w-3xl w-full text-center space-y-4">
        
        {/* 2. Xóa class 'mb-8'. Có thể thêm '-mb-10' (margin âm) nếu hình SVG có quá nhiều khoảng trắng thừa ở đáy */}
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md -mb-6">
          <ErrorComponent className="drop-shadow-xl" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-base-content/5 rounded-[100%] blur-xl"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary">
            Oops!
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-base-content">
            Something went wrong.
          </h2>
          
          <p className="text-base-content/70 text-lg max-w-md mx-auto leading-relaxed">
            An unexpected error has occurred. Please try again later or return to the home page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button 
            onClick={handleRetry}
            className="btn btn-outline gap-2 w-full sm:w-auto min-w-[140px]"
          >
            <RefreshCcw size={20} />
            <span>Retry</span>
          </button>

          <button 
            onClick={goHome}
            className="btn btn-primary gap-2 w-full sm:w-auto min-w-[140px] shadow-lg hover:scale-105 transition-transform"
          >
            <Home size={20} />
            <span>Back Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;