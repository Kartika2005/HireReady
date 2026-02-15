import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [downloadError, setDownloadError] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDownload = async () => {
        try {
            setDownloadError('');
            const response = await api.get('/resume/download', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${user?.name.replace(/\s+/g, '_')}_Resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setDownloadError('Failed to download resume.');
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo">HireReady</div>
                <div className="dashboard-nav-actions">
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-welcome">
                    <h1>Your Profile</h1>
                    <p>Account details and uploaded resume.</p>
                </div>

                {downloadError && <div className="alert alert-error">{downloadError}</div>}

                {/* User Info Card */}
                <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="profile-card-header">
                        <div className="profile-avatar">{getInitials(user.name)}</div>
                        <div className="profile-info">
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                    </div>
                    <div className="profile-detail-grid" style={{ marginTop: '1rem' }}>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Skills Detected</span>
                            <span className="profile-detail-value">{user.extractedSkills.length}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Languages</span>
                            <span className="profile-detail-value">{user.programmingLanguages.length}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Top Match</span>
                            <span className="profile-detail-value">
                                {user.matchedRoles.length > 0
                                    ? `${user.matchedRoles[0].role} (${user.matchedRoles[0].matchScore}%)`
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Resume Section */}
                <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="profile-section-title">📄 Resume</h3>
                    {user.hasResume ? (
                        <div className="resume-download-card">
                            <div className="resume-download-icon">📄</div>
                            <div className="resume-download-info">
                                <span className="resume-download-status">✅ Resume Uploaded</span>
                                <span className="resume-download-hint">Click to download and view your resume</span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleDownload}
                                style={{ width: 'auto', marginTop: '1rem' }}
                            >
                                ⬇️ View Resume
                            </button>
                        </div>
                    ) : (
                        <div className="resume-download-card">
                            <div className="resume-download-icon" style={{ opacity: 0.4 }}>📄</div>
                            <div className="resume-download-info">
                                <span className="resume-download-status" style={{ color: 'var(--text-muted)' }}>No resume uploaded</span>
                                <span className="resume-download-hint">Go to Skill Analysis to upload your resume</span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => navigate('/skill-analysis')}
                                style={{ width: 'auto', marginTop: '1rem' }}
                            >
                                Upload Resume →
                            </button>
                        </div>
                    )}
                </div>

                {/* Sign Out */}
                <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--error)' }}>
                        🚪 Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
