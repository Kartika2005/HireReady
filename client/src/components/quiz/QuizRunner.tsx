import { useState } from 'react';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Question {
    type: 'mcq' | 'snippet';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizRunnerProps {
    role: string;
    difficulty: string;
    resultId?: string;
    onComplete: () => void;
    onCancel: () => void;
}

function QuizRunner({ role, difficulty, resultId, onComplete, onCancel }: QuizRunnerProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Generate quiz on mount
    useState(() => {
        api.post('/quiz/generate', { role, difficulty })
            .then((res) => {
                setQuestions(res.data.questions || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Failed to generate quiz.');
                setLoading(false);
            });
    });

    const handleNext = () => {
        if (!selectedAnswer) return;

        const updatedAnswers = { ...answers, [currentIndex]: selectedAnswer };
        setAnswers(updatedAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer('');
        } else {
            // Calculate score locally
            let correct = 0;
            for (let i = 0; i < questions.length; i++) {
                if (updatedAnswers[i] === questions[i].correctAnswer) {
                    correct++;
                }
            }
            setScore(correct);
            setSubmitted(true);

            // Submit to backend
            const answerData = questions.map((q, i) => ({
                questionIndex: i,
                userAnswer: updatedAnswers[i] || '',
                isCorrect: updatedAnswers[i] === q.correctAnswer,
            }));

            api.post('/quiz/submit', {
                role,
                difficulty,
                score: correct,
                totalQuestions: questions.length,
                answers: answerData,
                ...(resultId ? { resultId } : {}),
            }).catch(console.error);
        }
    };

    const progress = questions.length > 0
        ? Math.round(((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="dashboard-layout">
                <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <span className="spinner" style={{ width: '48px', height: '48px' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                        Generating {role} quiz ({difficulty})...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <div className="dashboard-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <div className="alert alert-error">{error}</div>
                    <Button variant="outline" onClick={onCancel} style={{ marginTop: '1rem' }}>
                        ← Back to Quizzes
                    </Button>
                </div>
            </div>
        );
    }

    // Results screen
    if (submitted) {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <div className="dashboard-layout">
                <div className="dashboard-content">
                    <Card className="quiz-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                        <CardHeader style={{ textAlign: 'center' }}>
                            <CardTitle>Quiz Complete!</CardTitle>
                        </CardHeader>
                        <CardContent style={{ textAlign: 'center' }}>
                            <div className="quiz-result-score">
                                <span className="quiz-result-number">{score}</span>
                                <span className="quiz-result-total">/ {questions.length}</span>
                            </div>
                            <Progress value={pct} className="quiz-result-bar" />
                            <Badge
                                variant={pct >= 80 ? 'default' : pct >= 50 ? 'secondary' : 'destructive'}
                                className="quiz-result-badge"
                            >
                                {pct >= 80 ? '🌟 Excellent' : pct >= 50 ? '👍 Good' : '📚 Needs Practice'}
                            </Badge>
                            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Role: {role} • Difficulty: {difficulty}
                            </p>
                        </CardContent>
                        <CardFooter style={{ justifyContent: 'center', gap: '1rem' }}>
                            <Button variant="default" onClick={onComplete}>
                                ← Back to Quizzes
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    // Quiz question screen
    const question = questions[currentIndex];

    return (
        <div className="dashboard-layout">
            <div className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Badge variant="outline">
                        {role} • {difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        ✕ Cancel
                    </Button>
                </div>

                <Progress value={progress} style={{ marginBottom: '1.5rem' }} />

                <Card className="quiz-card">
                    <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Badge variant="secondary">
                                Q{currentIndex + 1} of {questions.length}
                            </Badge>
                            <Badge variant="outline">
                                {question.type === 'snippet' ? '💻 Code' : '📝 MCQ'}
                            </Badge>
                        </div>
                        <CardTitle style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.5 }}>
                            {question.type === 'snippet' ? (
                                <pre className="quiz-snippet">{question.question}</pre>
                            ) : (
                                question.question
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="quiz-options">
                            {question.options.map((opt) => (
                                <button
                                    key={opt}
                                    className={`quiz-option ${selectedAnswer === opt ? 'quiz-option-selected' : ''}`}
                                    onClick={() => setSelectedAnswer(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter style={{ justifyContent: 'flex-end' }}>
                        <Button
                            variant="default"
                            onClick={handleNext}
                            disabled={!selectedAnswer}
                        >
                            {currentIndex < questions.length - 1 ? 'Next →' : 'Submit ✓'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default QuizRunner;
