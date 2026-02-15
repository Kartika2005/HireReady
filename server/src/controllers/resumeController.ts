import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { extractSkills, extractProgrammingLanguages } from '../services/skillExtractor';
import { matchRoles } from '../services/roleMatcher';

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/resumes');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: AuthRequest, file, cb) => {
        const uniqueName = `${req.userId}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter — only accept PDFs
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/resume/upload
export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded. Please upload a PDF file.' });
            return;
        }

        // 1. Extract text from the PDF
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text.trim();

        if (!resumeText) {
            res.status(400).json({ message: 'Could not extract text from the PDF. It may be image-based.' });
            return;
        }


        // 2. Extract skills from the resume text
        const extractedSkills = extractSkills(resumeText);

        // If nothing matched, reject the document
        if (extractedSkills.length === 0) {
            // Clean up the uploaded file
            fs.unlinkSync(req.file.path);
            res.status(400).json({
                message: 'No skills could be detected from this document. Please upload a valid resume with relevant skills listed.',
            });
            return;
        }

        // 3. Detect programming languages from extracted skills
        const programmingLanguages = extractProgrammingLanguages(extractedSkills);

        // 4. Match roles using cosine similarity
        const matchedRoles = matchRoles(extractedSkills);

        // 5. Update user profile with all derived data
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                resumePath: req.file.path,
                resumeText,
                extractedSkills,
                programmingLanguages,
                matchedRoles,
            },
            { new: true }
        );

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({
            message: 'Resume processed successfully.',
            data: {
                filename: req.file.filename,
                size: req.file.size,
                extractedSkills,
                programmingLanguages,
                matchedRoles,
                textPreview: resumeText.substring(0, 200) + (resumeText.length > 200 ? '...' : ''),
            },
        });
    } catch (error: any) {
        console.error('Resume upload error:', error);
        if (error.message === 'Only PDF files are allowed.') {
            res.status(400).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Failed to process resume. Please try again.' });
    }
};

// GET /api/resume/text
export const getResumeText = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        if (!user.resumeText) {
            res.status(404).json({ message: 'No resume uploaded yet.' });
            return;
        }

        res.status(200).json({
            resumeText: user.resumeText,
            hasResume: true,
        });
    } catch (error) {
        console.error('Get resume text error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/resume/download
export const downloadResume = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.resumePath) {
            res.status(404).json({ message: 'No resume found.' });
            return;
        }

        if (!fs.existsSync(user.resumePath)) {
            res.status(404).json({ message: 'Resume file not found on server.' });
            return;
        }

        res.download(user.resumePath, `${user.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
        console.error('Download resume error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

