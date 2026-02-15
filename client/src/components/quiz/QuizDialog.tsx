import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStart: (role: string, difficulty: string) => void;
}

function QuizDialog({ open, onOpenChange, onStart }: QuizDialogProps) {
    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && roles.length === 0) {
            setLoading(true);
            api.get('/quiz/roles')
                .then((res) => setRoles(res.data.roles || []))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [open, roles.length]);

    const handleStart = () => {
        if (selectedRole) {
            onStart(selectedRole, selectedDifficulty);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>Take a New Quiz</DialogTitle>
                <DialogDescription>Choose a role and difficulty to generate a fresh set of questions.</DialogDescription>
            </DialogHeader>

            <div className="quiz-dialog-body">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <span className="spinner" />
                    </div>
                ) : (
                    <>
                        <div className="quiz-dialog-section">
                            <label className="quiz-dialog-label">Select Role</label>
                            <div className="quiz-dialog-roles">
                                {roles.map((role) => (
                                    <Badge
                                        key={role}
                                        variant={selectedRole === role ? 'default' : 'outline'}
                                        className={`quiz-role-badge ${selectedRole === role ? 'quiz-role-badge-active' : ''}`}
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="quiz-dialog-section">
                            <label className="quiz-dialog-label">Difficulty</label>
                            <div className="quiz-dialog-difficulties">
                                {(['Low', 'Medium', 'High'] as const).map((d) => (
                                    <Button
                                        key={d}
                                        variant={selectedDifficulty === d ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedDifficulty(d)}
                                    >
                                        {d}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleStart}
                            disabled={!selectedRole}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            Start Quiz →
                        </Button>
                    </>
                )}
            </div>
        </Dialog>
    );
}

export default QuizDialog;
