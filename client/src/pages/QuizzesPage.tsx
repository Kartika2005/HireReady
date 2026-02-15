import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuizDialog from '../components/quiz/QuizDialog';
import QuizRunner from '../components/quiz/QuizRunner';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface QuizResult {
    _id: string;
    role: string;
    difficulty: string;
    score: number;
    totalQuestions: number;
    createdAt: string;
    updatedAt: string;
}

function QuizzesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<{ role: string; difficulty: string; resultId?: string } | null>(null);

    const fetchResults = async () => {
        try {
            const res = await api.get('/quiz/results');
            setResults(res.data.results || []);
        } catch {
            console.error('Failed to fetch quiz results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const handleStartQuiz = (role: string, difficulty: string) => {
        setDialogOpen(false);
        setActiveQuiz({ role, difficulty });
    };

    const handleRetest = (role: string, resultId: string) => {
        setActiveQuiz({ role, difficulty: 'Medium', resultId });
    };

    const handleQuizComplete = () => {
        setActiveQuiz(null);
        setLoading(true);
        fetchResults();
    };

    if (!user) return null;

    // If taking a quiz, show the runner
    if (activeQuiz) {
        return (
            <QuizRunner
                role={activeQuiz.role}
                difficulty={activeQuiz.difficulty}
                resultId={activeQuiz.resultId}
                onComplete={handleQuizComplete}
                onCancel={() => setActiveQuiz(null)}
            />
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getScoreBadge = (score: number, total: number): 'default' | 'secondary' | 'destructive' => {
        const pct = Math.round((score / total) * 100);
        if (pct >= 80) return 'default';
        if (pct >= 50) return 'secondary';
        return 'destructive';
    };

    const getDifficultyLabel = (d: string) => {
        if (d === 'Low') return '🟢 Easy';
        if (d === 'High') return '🔴 Hard';
        return '🟡 Medium';
    };

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo">HireReady</div>
                <div className="dashboard-nav-actions">
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/quizzes')}>
                        📝 Quizzes
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-welcome">
                    <h1>Quizzes</h1>
                    <p>Test your knowledge for different job roles.</p>
                </div>

                {/* Take New Quiz Button */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setDialogOpen(true)}
                        className="quiz-take-btn"
                    >
                        ➕ Take New Quiz
                    </Button>
                </div>

                {/* Quiz History */}
                <Card className="quiz-card">
                    <CardHeader>
                        <CardTitle>📊 Quiz History</CardTitle>
                        <CardDescription>Your latest scores per role. Retest to replace your score.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <span className="spinner" />
                            </div>
                        ) : results.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>No quizzes taken yet. Click "Take New Quiz" to get started!</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead style={{ textAlign: 'center', verticalAlign: 'middle' }}>Role</TableHead>
                                        <TableHead style={{ textAlign: 'center', verticalAlign: 'middle' }}>Difficulty</TableHead>
                                        <TableHead style={{ textAlign: 'center', verticalAlign: 'middle' }}>Last Attempt</TableHead>
                                        <TableHead style={{ textAlign: 'center', verticalAlign: 'middle' }}>Score</TableHead>
                                        <TableHead style={{ textAlign: 'center', verticalAlign: 'middle' }}>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((r) => (
                                        <TableRow key={r._id}>
                                            <TableCell style={{ fontWeight: 600, textAlign: 'center', verticalAlign: 'middle' }}>{r.role}</TableCell>
                                            <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span className="quiz-difficulty-label">{getDifficultyLabel(r.difficulty)}</span>
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(r.updatedAt || r.createdAt)}</TableCell>
                                            <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span className={`quiz-score-pill quiz-score-${getScoreBadge(r.score, r.totalQuestions)}`}>
                                                    {r.score}/{r.totalQuestions}
                                                    <span className="quiz-score-pct">
                                                        ({Math.round((r.score / r.totalQuestions) * 100)}%)
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRetest(r.role, r._id)}
                                                >
                                                    🔄 Retest
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Role Selection Dialog */}
                <QuizDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onStart={handleStartQuiz}
                />
            </div>
        </div>
    );
}

export default QuizzesPage;
