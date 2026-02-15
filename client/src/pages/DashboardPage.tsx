import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo">HireReady</div>
                <div className="dashboard-nav-actions">
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/quizzes')}>
                        📝 Quizzes
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Coming Soon</h2>
                    <p style={{ fontSize: '0.95rem' }}>We're building something awesome. Stay tuned!</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
