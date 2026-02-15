import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import SkillAnalysisPage from './pages/SkillAnalysisPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
    const { token, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="auth-layout">
                <div className="spinner" />
            </div>
        );
    }

    const hasResume = user?.hasResume ?? false;

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
                path="/upload"
                element={
                    <ProtectedRoute>
                        <ResumeUploadPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/skill-analysis"
                element={
                    <ProtectedRoute>
                        <SkillAnalysisPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="*"
                element={
                    token ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
}

export default App;
