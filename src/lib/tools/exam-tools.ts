import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";
import {
  getAllSubjects,
  getQuestionsBySubject,
  getQuestionsBySubjectAndYear,
  getQuestionsBySubjectYearPaper,
  getQuestionsByTopic,
  getQuestionsByDifficulty,
  getQuestionsByForm,
  searchQuestions,
  getQuestionById,
  getAvailableYears,
  getAvailablePapers,
  getTopicsBySubject,
  getSubjectStats
} from "@/lib/data/database-service";

// Tool to list all available KCSE subjects
export const listSubjectsTool = new DynamicStructuredTool({
  name: "list_subjects",
  description: "List all available KCSE subjects in the database.",
  schema: z.object({}),
  func: async () => {
    try {
      const subjects = await getAllSubjects();
      return JSON.stringify({
        subjects: subjects.map(subject => ({
          name: subject,
          display_name: subject.charAt(0).toUpperCase() + subject.slice(1)
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: "Failed to fetch subjects" });
    }
  }
});

// Tool to get subject statistics and overview
export const getSubjectOverviewTool = new DynamicStructuredTool({
  name: "get_subject_overview",
  description: "Get comprehensive statistics and overview for a specific KCSE subject.",
  schema: z.object({
    subject: z.string().describe("Subject name (e.g., mathematics, english, chemistry)")
  }),
  func: async ({ subject }) => {
    try {
      const stats = await getSubjectStats(subject);
      return JSON.stringify({
        subject: subject,
        overview: stats
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch overview for ${subject}` });
    }
  }
});

// Tool to get questions by subject
export const getQuestionsBySubjectTool = new DynamicStructuredTool({
  name: "get_questions_by_subject",
  description: "Get all exam questions for a specific KCSE subject.",
  schema: z.object({
    subject: z.string().describe("Subject name (e.g., mathematics, english, chemistry)"),
    limit: z.number().optional().describe("Maximum number of questions to return (default: 20)")
  }),
  func: async ({ subject, limit = 20 }) => {
    try {
      const questions = await getQuestionsBySubject(subject);
      const limitedQuestions = questions.slice(0, limit);

      return JSON.stringify({
        subject: subject,
        total_questions: questions.length,
        questions: limitedQuestions.map(q => ({
          id: q.id,
          year: q.year,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 200) + (q.question.text.length > 200 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch questions for ${subject}` });
    }
  }
});

// Tool to get questions by year
export const getQuestionsByYearTool = new DynamicStructuredTool({
  name: "get_questions_by_year",
  description: "Get all exam questions for a specific subject and year.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    year: z.number().describe("Year (e.g., 2022, 2023)")
  }),
  func: async ({ subject, year }) => {
    try {
      const questions = await getQuestionsBySubjectAndYear(subject, year);
      return JSON.stringify({
        subject: subject,
        year: year,
        questions: questions.map(q => ({
          id: q.id,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 200) + (q.question.text.length > 200 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch questions for ${subject} ${year}` });
    }
  }
});

// Tool to get questions by paper
export const getQuestionsByPaperTool = new DynamicStructuredTool({
  name: "get_questions_by_paper",
  description: "Get all exam questions for a specific subject, year, and paper.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    year: z.number().describe("Year"),
    paper: z.string().describe("Paper (e.g., 'Paper 1', 'Paper 2')")
  }),
  func: async ({ subject, year, paper }) => {
    try {
      const questions = await getQuestionsBySubjectYearPaper(subject, year, paper);
      return JSON.stringify({
        subject: subject,
        year: year,
        paper: paper,
        questions: questions.map(q => ({
          id: q.id,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 300) + (q.question.text.length > 300 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch questions for ${subject} ${year} ${paper}` });
    }
  }
});

// Tool to get questions by topic
export const getQuestionsByTopicTool = new DynamicStructuredTool({
  name: "get_questions_by_topic",
  description: "Get all exam questions for a specific topic within a subject.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    topic: z.string().describe("Topic name or keyword"),
    limit: z.number().optional().describe("Maximum number of questions to return (default: 15)")
  }),
  func: async ({ subject, topic, limit = 15 }) => {
    try {
      const questions = await getQuestionsByTopic(subject, topic);
      const limitedQuestions = questions.slice(0, limit);

      return JSON.stringify({
        subject: subject,
        topic: topic,
        total_found: questions.length,
        questions: limitedQuestions.map(q => ({
          id: q.id,
          year: q.year,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 250) + (q.question.text.length > 250 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch questions for topic ${topic}` });
    }
  }
});

// Tool to get questions by difficulty
export const getQuestionsByDifficultyTool = new DynamicStructuredTool({
  name: "get_questions_by_difficulty",
  description: "Get exam questions filtered by difficulty level for a specific subject.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
    limit: z.number().optional().describe("Maximum number of questions to return (default: 15)")
  }),
  func: async ({ subject, difficulty, limit = 15 }) => {
    try {
      const questions = await getQuestionsByDifficulty(subject, difficulty);
      const limitedQuestions = questions.slice(0, limit);

      return JSON.stringify({
        subject: subject,
        difficulty: difficulty,
        total_found: questions.length,
        questions: limitedQuestions.map(q => ({
          id: q.id,
          year: q.year,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          marks: q.marks,
          question_text: q.question.text.substring(0, 250) + (q.question.text.length > 250 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch ${difficulty} questions for ${subject}` });
    }
  }
});

// Tool to get questions by form level
export const getQuestionsByFormTool = new DynamicStructuredTool({
  name: "get_questions_by_form",
  description: "Get exam questions for a specific form level within a subject.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    form: z.number().describe("Form level (1, 2, 3, or 4)"),
    limit: z.number().optional().describe("Maximum number of questions to return (default: 15)")
  }),
  func: async ({ subject, form, limit = 15 }) => {
    try {
      const questions = await getQuestionsByForm(subject, form);
      const limitedQuestions = questions.slice(0, limit);

      return JSON.stringify({
        subject: subject,
        form: form,
        total_found: questions.length,
        questions: limitedQuestions.map(q => ({
          id: q.id,
          year: q.year,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 250) + (q.question.text.length > 250 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch Form ${form} questions for ${subject}` });
    }
  }
});

// Tool to search questions
export const searchQuestionsTool = new DynamicStructuredTool({
  name: "search_questions",
  description: "Search for exam questions by keywords in question text, answers, or topics. Can search across all subjects or within a specific subject.",
  schema: z.object({
    query: z.string().describe("Search keywords or phrase"),
    subject: z.string().optional().describe("Specific subject to search within (optional)"),
    limit: z.number().optional().describe("Maximum number of results to return (default: 20)")
  }),
  func: async ({ query, subject, limit = 20 }) => {
    try {
      const questions = await searchQuestions(query, subject);
      const limitedQuestions = questions.slice(0, limit);

      return JSON.stringify({
        query: query,
        subject: subject || "all subjects",
        total_found: questions.length,
        questions: limitedQuestions.map(q => ({
          id: q.id,
          subject: q.subject,
          year: q.year,
          paper: q.paper,
          question_number: q.question_number,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          question_text: q.question.text.substring(0, 300) + (q.question.text.length > 300 ? "..." : ""),
          has_image: !!q.image_url, // Indicate if question has an image
          image_url: q.image_url // Include image URL for questions that have images
        }))
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to search questions for: ${query}` });
    }
  }
});

// Tool to get a complete question with answer
export const getCompleteQuestionTool = new DynamicStructuredTool({
  name: "get_complete_question",
  description: "Get a specific exam question with its complete details including the full answer and solution steps.",
  schema: z.object({
    question_id: z.string().describe("Unique question ID")
  }),
  func: async ({ question_id }) => {
    try {
      const question = await getQuestionById(question_id);

      if (!question) {
        return JSON.stringify({ error: `Question not found: ${question_id}` });
      }

      return JSON.stringify({
        question: {
          id: question.id,
          subject: question.subject,
          year: question.year,
          paper: question.paper,
          question_number: question.question_number,
          form: question.form,
          difficulty: question.difficulty,
          topic: question.topic,
          marks: question.marks,
          question: question.question,
          options: question.options,
          answer: question.answer,
          source: question.source,
          image_url: question.image_url, // Include the image URL

        }
      });
    } catch (error) {
      return JSON.stringify({ error: "Failed to fetch complete question" });
    }
  }
});

// Tool to get available years for a subject
export const getAvailableYearsTool = new DynamicStructuredTool({
  name: "get_available_years",
  description: "Get all available exam years for a specific subject.",
  schema: z.object({
    subject: z.string().describe("Subject name")
  }),
  func: async ({ subject }) => {
    try {
      const years = await getAvailableYears(subject);
      return JSON.stringify({
        subject: subject,
        available_years: years
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch years for ${subject}` });
    }
  }
});

// Tool to get available papers for a subject and year
export const getAvailablePapersTool = new DynamicStructuredTool({
  name: "get_available_papers",
  description: "Get all available papers for a specific subject and year.",
  schema: z.object({
    subject: z.string().describe("Subject name"),
    year: z.number().describe("Year")
  }),
  func: async ({ subject, year }) => {
    try {
      const papers = await getAvailablePapers(subject, year);
      return JSON.stringify({
        subject: subject,
        year: year,
        available_papers: papers
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch papers for ${subject} ${year}` });
    }
  }
});

// Tool to get all topics for a subject
export const getTopicsTool = new DynamicStructuredTool({
  name: "get_topics",
  description: "Get all available topics for a specific subject.",
  schema: z.object({
    subject: z.string().describe("Subject name")
  }),
  func: async ({ subject }) => {
    try {
      const topics = await getTopicsBySubject(subject);
      return JSON.stringify({
        subject: subject,
        topics: topics
      });
    } catch (error) {
      return JSON.stringify({ error: `Failed to fetch topics for ${subject}` });
    }
  }
});

// Export all tools
export const examTools = [
  listSubjectsTool,
  getSubjectOverviewTool,
  getQuestionsBySubjectTool,
  getQuestionsByYearTool,
  getQuestionsByPaperTool,
  getQuestionsByTopicTool,
  getQuestionsByDifficultyTool,
  getQuestionsByFormTool,
  searchQuestionsTool,
  getCompleteQuestionTool,
  getAvailableYearsTool,
  getAvailablePapersTool,
  getTopicsTool
];