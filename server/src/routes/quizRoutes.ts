import { Router } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Result from '../models/Result';
import { generateQuestions } from '../controllers/quizController';

const router = Router();

type SubmitPayload = {
    role?: string;
    difficulty?: string;
    score: number;
    totalQuestions: number;
    answers: Record<number, string> | Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>;
};

// POST /api/quiz/generate
router.post('/generate', auth, generateQuestions);

// POST /api/quiz/submit
// If resultId is provided → retest (update that result)
// Otherwise → new quiz (always create a new result row)
router.post('/submit', auth, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }

        const { role, difficulty, score, totalQuestions, answers, resultId } = req.body as SubmitPayload & { resultId?: string };

        if (!role?.trim() || typeof score !== 'number' || typeof totalQuestions !== 'number' || !answers) {
            res.status(400).json({ message: 'Invalid payload.' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        let result;

        if (resultId) {
            // Retest: update existing result
            result = await Result.findOneAndUpdate(
                { _id: resultId, userId: user._id },
                {
                    email: user.email,
                    role: role.trim(),
                    difficulty: difficulty || 'Medium',
                    score,
                    totalQuestions,
                    answers,
                },
                { new: true }
            );
        }

        if (!result) {
            // New quiz: always create a new row
            result = await Result.create({
                userId: user._id,
                email: user.email,
                role: role.trim(),
                difficulty: difficulty || 'Medium',
                score,
                totalQuestions,
                answers,
            });
        }

        res.status(201).json({ message: 'Result saved successfully.', resultId: result._id });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ message: 'Failed to submit quiz result.' });
    }
});

// GET /api/quiz/results — latest result per role for current user
router.get('/results', auth, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }

        const results = await Result.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json({ results });
    } catch (error) {
        console.error('Fetch quiz results error:', error);
        res.status(500).json({ message: 'Failed to fetch quiz results.' });
    }
});

// GET /api/quiz/roles — return available roles for quiz generation
router.get('/roles', auth, (_req, res) => {
    const roles = [
        'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
        'ML Engineer', 'Data Scientist', 'Data Engineer',
        'Java Developer', 'Python Developer', 'DevOps Engineer',
        'Cloud Engineer', 'Mobile Developer', 'iOS Developer',
        'Android Developer', 'QA / Test Engineer', 'Cybersecurity Analyst',
        'AI Research Engineer', 'Game Developer', 'Blockchain Developer',
        'Database Administrator', 'Systems Engineer', 'UI/UX Designer',
    ];
    res.status(200).json({ roles });
});

export default router;
