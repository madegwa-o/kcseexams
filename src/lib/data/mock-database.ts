

export const mockDB = [
  {
    _id: "MAT_2022_P1_Q014",
    subject: "Mathematics",
    paper: "Paper 1",
    year: 2022,
    question_number: 26,
    form: 3,
    difficulty: "medium",
    topic: "Work, Rate & Proportion",
    marks: 5,
    question: {
      text: "Mogaka and Onduso together can do a piece of work in 6 days. Mogaka, working alone, takes 5 days longer than Onduso. How many days does it take Onduso to do the same work alone?",
      type: "structured"
    },

    answer: {
      text: "Onduso = 10 days",
      steps: "Let Onduso take x days ⇒ Mogaka takes (x + 5). Work rate = 1/x + 1/(x+5) = 1/6. Solving: (2x + 5)/(x² + 5x) = 1/6 ⇒ x = 10."
    },

    source: "KCSE Made Familiar, Mathematics Paper 1 (2022)",
    createdAt: new Date()
  },

  {
    _id: "MAT_2023_P1_Q001",   // unique id: SUBJECT_YEAR_PAPER_Qxx
    subject: "Mathematics",    // Subject name
    paper: "Paper 1",          // Paper 1 / Paper 2
    year: 2023,                // Year of exam
    form: 4,                   // Form level (if tagged)
    question_number: 12,
    difficulty: "medium",      // easy | medium | hard
    topic: "Quadratic Equations", // KCSE topic mapping
    marks: 4,                  // Total marks

    question: {
      text: "Solve for x in the equation: 2x² - 8x + 6 = 0",  // full question
      parts: [  // optional for multi-part
        { label: "a", text: "Solve for x", marks: 2 },
        { label: "b", text: "Hence find x + 2", marks: 2 }
      ],
      type: "structured" // structured | multiple_choice | short_answer
    },

    options: [   // only if multiple_choice
      "x = 3 or x = 1",
      "x = 2 only",
      "x = -3 or -1",
      "No solution"
    ],

    answer: {
      text: "x = 3 or x = 1",   // correct answer
      steps: "Using the quadratic formula: x = (8 ± √(64-48))/4 = (8 ± 4)/4. Therefore x = 3 or x = 1",
      // step-by-step worked solution
    },

    source: "KCSE Made Familiar, Mathematics Paper 1 (2023)", // source reference
    createdAt: new Date()
  }

];


