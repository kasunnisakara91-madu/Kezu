import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { UserDashboard } from './pages/UserDashboard.tsx';
import { DocsPage } from './pages/DocsPage.tsx';
import { ApiTesterPage } from './pages/ApiTesterPage.tsx';
import { AdminLogin } from './pages/admin/AdminLogin.tsx';
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminUsers } from './pages/admin/AdminUsers.tsx';
import { AdminCoins } from './pages/admin/AdminCoins.tsx';
import { AdminApis } from './pages/admin/AdminApis.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    // Admin routes
    if (currentPath === '/admin') {
      return <AdminLogin navigate={navigate} />;
    }
    if (currentPath === '/admin/dashboard') {
      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          <AdminDashboard navigate={navigate} />
        </AdminLayout>
      );
    }
    if (currentPath === '/admin/users') {
      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          <AdminUsers />
        </AdminLayout>
      );
    }
    if (currentPath === '/admin/coins') {
      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          <AdminCoins />
        </AdminLayout>
      );
    }
    if (currentPath === '/admin/apis') {
      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          <AdminApis />
        </AdminLayout>
      );
    }
    if (currentPath === '/admin/settings') {
      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          <AdminSettings />
        </AdminLayout>
      );
    }

    // Public & User routes
    switch (currentPath) {
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/dashboard':
        return <UserDashboard navigate={navigate} />;
      case '/docs':
        return <DocsPage navigate={navigate} />;
      case '/tester':
        return <ApiTesterPage navigate={navigate} />;
      case '/':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#080914] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="flex-1">{renderContent()}</main>
        <Footer navigate={navigate} />
      </div>
    </AuthProvider>
  );
}
