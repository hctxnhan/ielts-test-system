export const questionsWithCorrectIndex = {
  id: "123",
  type: "listening",
  title: "IELTS Listening Test - Cambridge 19 Test 2",
  sections: [
    {
      id: "section1",
      title: "Section 1",
      audioUrl:
        "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/test/beat-piano.mp3",
      duration: 600,
      questions: [
        {
          id: "q1-section1",
          text: "The customer wants to book a holiday in ___.",
          type: "completion",
          index: 1,
          points: 1,
          subQuestions: [
            {
              subId: "q1-s1-blank1",
              points: 1,
              correctAnswer: "Portugal",
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
        {
          id: "q2-section1",
          text: "What type of accommodation does the customer prefer?",
          type: "multiple-choice",
          index: 2,
          points: 1,
          options: [
            {
              id: "q2-s1-opt1",
              text: "Hotel",
              isCorrect: false,
            },
            {
              id: "q2-s1-opt2",
              text: "Self-catering apartment",
              isCorrect: true,
            },
            {
              id: "q2-s1-opt3",
              text: "Bed and breakfast",
              isCorrect: false,
            },
            {
              id: "q2-s1-opt4",
              text: "Villa",
              isCorrect: false,
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
        {
          id: "q3-section1",
          text: "The customer's total budget for the holiday is ___ pounds.",
          type: "completion",
          index: 3,
          points: 1,
          subQuestions: [
            {
              subId: "q3-s1-blank1",
              points: 1,
              correctAnswer: "2500",
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
      ],
      description:
        "A conversation between a customer and a travel agent about booking a holiday",
    },
    {
      id: "section2",
      title: "Section 2",
      audioUrl:
        "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/test/beat-piano.mp3",
      duration: 600,
      questions: [
        {
          id: "q1-section2",
          text: "Match each floor of the museum with the correct exhibit.",
          type: "matching",
          index: 4,
          items: [
            {
              id: "q1-s2-item1",
              text: "Ground floor",
            },
            {
              id: "q1-s2-item2",
              text: "First floor",
            },
          ],
          points: 2,
          options: [
            {
              id: "q1-s2-opt1",
              text: "Ancient artifacts",
            },
            {
              id: "q1-s2-opt2",
              text: "Interactive science displays",
            },
            {
              id: "q1-s2-opt3",
              text: "Local history exhibition",
            },
            {
              id: "q1-s2-opt4",
              text: "Modern art gallery",
            },
          ],
          subQuestions: [
            {
              item: "q1-s2-item1",
              subId: "q1-s2-sub1",
              points: 1,
              subIndex: 1,
              correctAnswer: "q1-s2-opt3",
            },
            {
              item: "q1-s2-item2",
              subId: "q1-s2-sub2",
              points: 1,
              subIndex: 2,
              correctAnswer: "q1-s2-opt1",
            },
          ],
          scoringStrategy: "partial",
        },
        {
          id: "q2-section2",
          text: "When is the museum closed?",
          type: "multiple-choice",
          index: 5,
          points: 1,
          options: [
            {
              id: "q2-s2-opt1",
              text: "Sundays",
              isCorrect: false,
            },
            {
              id: "q2-s2-opt2",
              text: "Bank holidays",
              isCorrect: false,
            },
            {
              id: "q2-s2-opt3",
              text: "Mondays",
              isCorrect: true,
            },
            {
              id: "q2-s2-opt4",
              text: "Christmas Day only",
              isCorrect: false,
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
      ],
      description: "A tour guide giving information about a local museum",
    },
    {
      id: "section3",
      title: "Section 3",
      audioUrl:
        "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/test/beat-piano.mp3",
      duration: 600,
      questions: [
        {
          id: "q1-section3",
          text: "Select the correct topics that each student will research for their project.",
          type: "pick-from-list",
          index: 6,
          items: [
            {
              id: "q1-s3-item1",
              text: "Sarah",
            },
            {
              id: "q1-s3-item2",
              text: "Michael",
            },
          ],
          points: 2,
          options: [
            {
              id: "q1-s3-opt1",
              text: "Urban planning",
            },
            {
              id: "q1-s3-opt2",
              text: "Public transportation",
            },
            {
              id: "q1-s3-opt3",
              text: "Environmental impact",
            },
            {
              id: "q1-s3-opt4",
              text: "Economic factors",
            },
            {
              id: "q1-s3-opt5",
              text: "Historical development",
            },
          ],
          subQuestions: [
            {
              item: "q1-s3-item1",
              subId: "q1-s3-sub1",
              points: 1,
              correctAnswer: "q1-s3-opt3",
            },
            {
              item: "q1-s3-item2",
              subId: "q1-s3-sub2",
              points: 1,
              correctAnswer: "q1-s3-opt4",
            },
          ],
          scoringStrategy: "partial",
        },
        {
          id: "q2-section3",
          text: "The students must submit their final report by ___ December.",
          type: "completion",
          index: 7,
          points: 1,
          subQuestions: [
            {
              subId: "q2-s3-blank1",
              points: 1,
              correctAnswer: "15th",
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
      ],
      description:
        "Two students discussing their research project with their professor",
    },
    {
      id: "section4",
      title: "Section 4",
      audioUrl:
        "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/test/beat-piano.mp3",
      duration: 600,
      questions: [
        {
          id: "q1-section4",
          text: "According to the lecturer, what is the main benefit of sustainable architecture?",
          type: "multiple-choice",
          index: 8,
          points: 1,
          options: [
            {
              id: "q1-s4-opt1",
              text: "Lower construction costs",
              isCorrect: false,
            },
            {
              id: "q1-s4-opt2",
              text: "Reduced environmental impact",
              isCorrect: true,
            },
            {
              id: "q1-s4-opt3",
              text: "Improved building aesthetics",
              isCorrect: false,
            },
            {
              id: "q1-s4-opt4",
              text: "Increased property values",
              isCorrect: false,
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
        {
          id: "q2-section4",
          text: "Label the diagram of a passive solar building with the correct components.",
          type: "labeling",
          index: 9,
          labels: [
            {
              id: "q2-s4-label1",
              text: "Component A",
            },
            {
              id: "q2-s4-label2",
              text: "Component B",
            },
          ],
          points: 2,
          options: [
            {
              id: "q2-s4-opt1",
              text: "Thermal mass",
            },
            {
              id: "q2-s4-opt2",
              text: "Solar panels",
            },
            {
              id: "q2-s4-opt3",
              text: "South-facing windows",
            },
            {
              id: "q2-s4-opt4",
              text: "Insulation",
            },
          ],
          imageUrl:
            "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/test/beat-piano.mp3",
          subQuestions: [
            {
              item: "q2-s4-label1",
              subId: "q2-s4-sub1",
              points: 1,
              correctAnswer: "q2-s4-opt3",
            },
            {
              item: "q2-s4-label2",
              subId: "q2-s4-sub2",
              points: 1,
              correctAnswer: "q2-s4-opt1",
            },
          ],
          scoringStrategy: "partial",
        },
        {
          id: "q3-section4",
          text: "The lecturer mentions that sustainable buildings can reduce energy consumption by up to ___ percent compared to conventional buildings.",
          type: "completion",
          index: 10,
          points: 1,
          subQuestions: [
            {
              subId: "q3-s4-blank1",
              points: 1,
              correctAnswer: "70",
            },
          ],
          scoringStrategy: "all-or-nothing",
        },
      ],
      description: "A lecture about sustainable architecture",
    },
  ],
  skillLevel: "B2",
  description:
    "Complete IELTS Listening test with four sections and ten questions total",
  instructions:
    "You will hear a series of recordings and you will have to answer questions based on what you hear. There will be time for you to read the instructions and questions, and you will have a chance to check your answers. The test is in 4 sections. You will hear each section only once. First, you will have some time to read the instructions and questions before you hear the recording. As you listen, complete the answers. At the end of the test, you will have 10 minutes to transfer your answers to the answer sheet.",
  totalDuration: 2400,
  totalQuestions: 10,
};
