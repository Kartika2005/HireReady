import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    role: string;
    difficulty: string;
    score: number;
    totalQuestions: number;
    answers: Record<string, string>;
    createdAt: Date;
}

const resultSchema = new Schema<IResult>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        answers: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Result = mongoose.model<IResult>('Result', resultSchema);

export default Result;
