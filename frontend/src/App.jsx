import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PostEditorPage = lazy(() => import('./pages/PostEditorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const MyBlogsPage = lazy(() => import('./pages/MyBlogsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3800, style: { background: '#fffefa', color: '#17243b', border: '1px solid #e8e5de', borderRadius: '12px', boxShadow: '0 10px 30px rgba(24,39,64,.12)' } }} />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
            {/* Public routes with Layout */}
            <Route element={<Layout><HomePage /></Layout>} path="/" />
            <Route element={<Layout><ExplorePage /></Layout>} path="/explore" />
            <Route element={<Layout><BlogDetailPage /></Layout>} path="/blog/:slug" />
            <Route element={<Layout><SearchPage /></Layout>} path="/search" />
            <Route element={<Layout><ProfilePage /></Layout>} path="/profile/:id" />

            {/* Auth pages (no layout - full-page designs) */}
            <Route element={<LoginPage />} path="/login" />
            <Route element={<RegisterPage />} path="/register" />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <Layout><PostEditorPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout><PostEditorPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-blogs"
              element={
                <ProtectedRoute>
                  <Layout><MyBlogsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout><EditProfilePage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminDashboardPage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
