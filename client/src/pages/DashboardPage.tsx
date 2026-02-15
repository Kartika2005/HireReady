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
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-welcome">
                    <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
                    <p>Your placement readiness hub.</p>
                </div>

                <div className="coming-soon">
                    <h3>📊 Coming Soon</h3>
                    <p>
                        GitHub activity tracking, coding assessments, quizzes, and AI-powered
                        placement readiness scoring — all coming in the next update.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
