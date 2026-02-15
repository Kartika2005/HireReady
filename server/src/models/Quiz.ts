import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
    type: 'mcq' | 'snippet';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface IQuiz extends Document {
    userId: mongoose.Types.ObjectId;
    role: string;
    questions: IQuizQuestion[];
    createdAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
    {
        type: { type: String, enum: ['mcq', 'snippet'], required: true },
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: String, required: true },
        explanation: { type: String, required: true },
    },
    { _id: false }
);

const quizSchema = new Schema<IQuiz>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        questions: {
            type: [quizQuestionSchema],
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export default Quiz;
