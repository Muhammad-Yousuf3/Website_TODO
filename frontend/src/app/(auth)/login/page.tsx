import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

function LoginFormWrapper() {
  return <LoginForm />;
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
        <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-full mb-8"></div>
        <div className="space-y-4">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TaskFlow</h1>
          <p className="text-slate-500 mt-1">Manage your tasks effortlessly</p>
        </div>
        <Suspense fallback={<LoadingSkeleton />}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </main>
  );
}
