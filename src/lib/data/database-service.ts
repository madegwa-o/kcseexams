import clientPromise, { EXAMS_DATABASE_NAME } from "@/lib/mongodb";

export interface Question {
    id: string;
    subject: string;
    paper: string;
    year: number;
    image_url?: string;
    question_number: number;
    form?: number;
    difficulty: "easy" | "medium" | "hard";
    topic: string;
    marks: number;
    question: {
        text: string;
        parts?: Array<{
            label: string;
            text: string;
            marks: number;
        }>;
        type: "structured" | "multiple_choice" | "short_answer";
    };
    options?: string[];
    answer: {
        text: string;
        steps?: string;
    };
    source: string;
    createdAt: Date;
}

// Helper function to get database connection
async function getExamsDb() {
    const client = await clientPromise;
    return client.db(EXAMS_DATABASE_NAME);
}

// Get all available subjects (collection names)
export async function getAllSubjects(): Promise<string[]> {
    try {
        const db = await getExamsDb();
        const collections = await db.listCollections().toArray();
        return collections.map(col => col.name);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return [];
    }
}

// Get all questions from a specific subject
export async function getQuestionsBySubject(subject: string): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({})
            .sort({ year: -1, paper: 1, question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions for subject ${subject}:`, error);
        return [];
    }
}

// Get questions by subject and year
export async function getQuestionsBySubjectAndYear(subject: string, year: number): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({ year })
            .sort({ paper: 1, question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions for ${subject} ${year}:`, error);
        return [];
    }
}

// Get questions by subject, year, and paper
export async function getQuestionsBySubjectYearPaper(
    subject: string,
    year: number,
    paper: string
): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({ year, paper })
            .sort({ question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions for ${subject} ${year} ${paper}:`, error);
        return [];
    }
}

// Get questions by topic
export async function getQuestionsByTopic(subject: string, topic: string): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({ topic: { $regex: new RegExp(topic, 'i') } })
            .sort({ year: -1, paper: 1, question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions for topic ${topic}:`, error);
        return [];
    }
}

// Get questions by difficulty level
export async function getQuestionsByDifficulty(
    subject: string,
    difficulty: "easy" | "medium" | "hard"
): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({ difficulty })
            .sort({ year: -1, paper: 1, question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions by difficulty ${difficulty}:`, error);
        return [];
    }
}

// Get questions by form level
export async function getQuestionsByForm(subject: string, form: number): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const questions = await db.collection<Question>(subject.toLowerCase())
            .find({ form })
            .sort({ year: -1, paper: 1, question_number: 1 })
            .toArray();
        return questions;
    } catch (error) {
        console.error(`Error fetching questions for form ${form}:`, error);
        return [];
    }
}

// Search questions across all subjects or specific subject
export async function searchQuestions(
    query: string,
    subject?: string
): Promise<Question[]> {
    try {
        const db = await getExamsDb();
        const searchRegex = new RegExp(query, 'i');

        if (subject) {
            // Search within specific subject
            const questions = await db.collection<Question>(subject.toLowerCase())
                .find({
                    $or: [
                        { "question.text": { $regex: searchRegex } },
                        { topic: { $regex: searchRegex } },
                        { "answer.text": { $regex: searchRegex } },
                        { "answer.steps": { $regex: searchRegex } }
                    ]
                })
                .sort({ year: -1, paper: 1, question_number: 1 })
                .toArray();
            return questions;
        } else {
            // Search across all subjects
            const subjects = await getAllSubjects();
            const allResults: Question[] = [];

            for (const subj of subjects) {
                const questions = await db.collection<Question>(subj)
                    .find({
                        $or: [
                            { "question.text": { $regex: searchRegex } },
                            { topic: { $regex: searchRegex } },
                            { "answer.text": { $regex: searchRegex } },
                            { "answer.steps": { $regex: searchRegex } }
                        ]
                    })
                    .sort({ year: -1, paper: 1, question_number: 1 })
                    .limit(20) // Limit per subject to avoid too many results
                    .toArray();
                allResults.push(...questions);
            }

            return allResults.sort((a, b) => b.year - a.year);
        }
    } catch (error) {
        console.error("Error searching questions:", error);
        return [];
    }
}

// Get a specific question by ID
export async function getQuestionById(questionId: string): Promise<Question | undefined> {
    try {
        const db = await getExamsDb();
        const subjects = await getAllSubjects();

        for (const subject of subjects) {
            const question = await db.collection<Question>(subject)
                .findOne({ id: questionId });
            if (question) return question;
        }

        return undefined;
    } catch (error) {
        console.error("Error fetching question by ID:", error);
        return undefined;
    }
}

// Get all available years for a subject
export async function getAvailableYears(subject: string): Promise<number[]> {
    try {
        const db = await getExamsDb();
        const years = await db.collection<Question>(subject.toLowerCase())
            .distinct("year");
        return years.sort((a, b) => b - a); // Sort descending
    } catch (error) {
        console.error(`Error fetching years for subject ${subject}:`, error);
        return [];
    }
}

// Get all available papers for a subject and year
export async function getAvailablePapers(subject: string, year: number): Promise<string[]> {
    try {
        const db = await getExamsDb();
        const papers = await db.collection<Question>(subject.toLowerCase())
            .distinct("paper", { year });
        return papers.sort();
    } catch (error) {
        console.error(`Error fetching papers for ${subject} ${year}:`, error);
        return [];
    }
}

// Get all topics for a subject
export async function getTopicsBySubject(subject: string): Promise<string[]> {
    try {
        const db = await getExamsDb();
        const topics = await db.collection<Question>(subject.toLowerCase())
            .distinct("topic");
        return topics.sort();
    } catch (error) {
        console.error(`Error fetching topics for subject ${subject}:`, error);
        return [];
    }
}

type DifficultyCount = {
    _id: "easy" | "medium" | "hard";
    count: number;
};


// Get statistics for a subject
export async function getSubjectStats(subject: string): Promise<{
    totalQuestions: number;
    years: number[];
    papers: string[];
    topics: string[];
    difficulties: { easy: number; medium: number; hard: number };
}> {
    try {
        const db = await getExamsDb();
        const collection = db.collection<Question>(subject.toLowerCase());

        const [
            totalQuestions,
            years,
            papers,
            topics,
            difficulties
        ] = await Promise.all([
            collection.countDocuments(),
            collection.distinct("year"),
            collection.distinct("paper"),
            collection.distinct("topic"),
            collection.aggregate([
                {
                    $group: {
                        _id: "$difficulty",
                        count: { $sum: 1 }
                    }
                }
            ]).toArray()
        ]);

        const difficultyStats = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        (difficulties as DifficultyCount[]).forEach((diff) => {
            if (diff._id in difficultyStats) {
                difficultyStats[diff._id] = diff.count;
            }
        });


        return {
            totalQuestions,
            years: years.sort((a, b) => b - a),
            papers: papers.sort(),
            topics: topics.sort(),
            difficulties: difficultyStats
        };
    } catch (error) {
        console.error(`Error fetching stats for subject ${subject}:`, error);
        return {
            totalQuestions: 0,
            years: [],
            papers: [],
            topics: [],
            difficulties: { easy: 0, medium: 0, hard: 0 }
        };
    }
}

// Utility functions for data management
export async function insertQuestion(subject: string, question: Question): Promise<Question> {
    try {
        const db = await getExamsDb();
        await db.collection<Question>(subject.toLowerCase()).insertOne(question);
        return question;
    } catch (error) {
        console.error("Error inserting question:", error);
        throw error;
    }
}

export async function insertManyQuestions(subject: string, questions: Question[]): Promise<void> {
    try {
        const db = await getExamsDb();
        await db.collection<Question>(subject.toLowerCase()).insertMany(questions);
    } catch (error) {
        console.error("Error inserting many questions:", error);
        throw error;
    }
}

// Create indexes for better performance
export async function createIndexes(): Promise<void> {
    try {
        const db = await getExamsDb();
        const subjects = await getAllSubjects();

        for (const subject of subjects) {
            const collection = db.collection(subject);

            // Create compound indexes for common query patterns
            await Promise.all([
                collection.createIndex({ year: -1, paper: 1, question_number: 1 }),
                collection.createIndex({ topic: 1, difficulty: 1 }),
                collection.createIndex({ form: 1 }),
                collection.createIndex({ "question.text": "text", "answer.text": "text", "answer.steps": "text" }),
                collection.createIndex({ id: 1 }, { unique: true })
            ]);
        }

        console.log("Indexes created successfully for all subjects!");
    } catch (error) {
        console.error("Error creating indexes:", error);
        throw error;
    }
}