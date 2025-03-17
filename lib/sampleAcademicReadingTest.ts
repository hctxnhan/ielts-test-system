import type { Test } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Sample academic reading test
export const sampleAcademicReadingTest: Test = {
  id: 'sample-academic-reading-1',
  title: 'IELTS Academic Reading Practice Test 1',
  type: 'reading',
  readingVariant: 'academic',
  description:
    'A complete IELTS Academic Reading test with 3 passages and 40 questions.',
  totalDuration: 3600, // 60 minutes
  totalQuestions: 40,
  instructions:
    'You should spend about 20 minutes on Questions 1-13, which are based on Reading Passage 1. Read the passage and answer the questions. There is no extra time to transfer your answers, so write your answers directly on the answer sheet.',
  sections: [
    {
      id: uuidv4(),
      title: 'Reading Passage 1',
      description: 'Academic text about environmental conservation.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'The Importance of Biodiversity',
        content: `Biodiversity is the variety of life on Earth, in all its forms and all its interactions. If that sounds broad, it's because it is. Biodiversity is the most complex feature of our planet and it is the most vital. "Without biodiversity, there is no future for humanity," says David Macdonald, Professor of Wildlife Conservation at Oxford University.
`,
        source: 'Adapted from various scientific publications and reports',
        hasImages: true,
        imageUrls: ['/placeholder.svg?height=300&width=500']
      },
      questions: [
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'The term "biodiversity" was first used in the 1980s.',
            'Human population has increased eightfold since agriculture began.',
            "More than half of Earth's land is now used for farming.",
            'The rate of species extinction is decreasing.',
            'Biodiversity loss has no impact on economic activities.'
          ],
          correctAnswers: ['true', 'true', 'true', 'false', 'false'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching-headings',
          text: 'Match the following headings to the paragraphs in the passage.',
          points: 4,
          paragraphs: [
            'Paragraphs 1-2',
            'Paragraphs 3-4',
            'Paragraph 5',
            'Paragraphs 6-8'
          ],
          headings: [
            'Definition and human impact',
            'Economic consequences',
            'Solutions and future actions',
            'The extinction crisis and its importance'
          ],
          correctMatches: { 0: 0, 1: 3, 2: 1, 3: 2 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'According to the passage, what percentage of wildlife populations have declined since 1970?',
          points: 1,
          options: ['34%', '40%', '68%', '77%'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: `Complete the sentences below using NO MORE THAN THREE WORDS from the passage.
          
          1. The term "biodiversity" refers to the variety of life on Earth, including all its forms and interactions.
          2. The Earth's ecosystems are becoming __________ due to human activities.
          3. The process of restoring natural habitats and reintroducing species is known as __________.
          `,
          points: 3,
          blanks: 3,
          correctAnswers: [
            'biological diversity',
            'increasingly fragile',
            'rewilding'
          ],
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Reading Passage 2',
      description: 'Academic text about artificial intelligence.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'The Rise of Artificial Intelligence',
        content: `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From voice assistants like Siri and Alexa to recommendation systems on streaming platforms, AI has become an integral part of our daily lives. But what exactly is AI, and how did we get here?
`,
        source:
          'Adapted from various technology publications and research papers',
        hasImages: false
      },
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'When was the term "artificial intelligence" first coined?',
          points: 1,
          options: ['In the 1980s', 'In the 1950s', 'In the 2010s', 'In 2016'],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'Deep learning is a type of machine learning.',
            'AlphaGo was developed by Microsoft.',
            'AI can detect cancer more accurately than human doctors in some cases.',
            'The World Economic Forum predicts that AI will create more jobs than it displaces.',
            'Stephen Hawking was optimistic about the development of artificial general intelligence.'
          ],
          correctAnswers: ['true', 'false', 'true', 'true', 'false'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the following concerns with their descriptions from the passage.',
          points: 3,
          items: ['Job displacement', 'Privacy', 'Algorithmic bias'],
          options: [
            'AI systems may reflect societal prejudices',
            'AI could automate tasks currently done by humans',
            'AI relies on personal information'
          ],
          correctMatches: { 0: 1, 1: 2, 2: 0 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'short-answer',
          text: 'Answer the following questions using NO MORE THAN THREE WORDS from the passage.',
          points: 3,
          questions: [
            'What does the abbreviation AGI stand for?',
            'In which decade did machine learning become a major focus?',
            'According to the passage, what should guide AI development?'
          ],
          correctAnswers: [
            ['artificial general intelligence'],
            ['1980s'],
            ['human values']
          ],
          wordLimit: 3,
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Reading Passage 3',
      description: 'Academic text about urban planning.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'Sustainable Cities: Planning for the Future',
        content: `As the world's population continues to urbanize, with projections suggesting that 68% of people will live in cities by 2050, the concept of sustainable urban planning has never been more critical. Sustainable cities, also known as eco-cities or green cities, are designed with social, economic, and environmental impact in mind. They aim to minimize required inputs of energy, water, food, waste, output of heat, air pollution, and water pollution.
`,
        source:
          'Adapted from urban planning journals and sustainability reports',
        hasImages: true,
        imageUrls: ['/placeholder.svg?height=300&width=500']
      },
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'According to the passage, what percentage of people are projected to live in cities by 2050?',
          points: 1,
          options: ['50%', '68%', '75%', '90%'],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching-headings',
          text: 'Match the following headings to the paragraphs in the passage.',
          points: 5,
          paragraphs: [
            'Paragraphs 1-2',
            'Paragraph 3',
            'Paragraph 4',
            'Paragraphs 5-6',
            'Paragraphs 7-10'
          ],
          headings: [
            'Introduction and historical context',
            'Energy efficiency in buildings',
            'Sustainable transportation',
            'Water and waste management',
            'Urban agriculture, social aspects, and future challenges'
          ],
          correctMatches: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'The garden city movement was started by Ebenezer Howard.',
            'Most buildings in sustainable cities generate more energy than they consume.',
            'More people commute by bicycle than by car in Copenhagen.',
            'San Francisco has already achieved its goal of becoming a "zero waste" city.',
            'Curitiba has demonstrated that sustainable urban planning requires substantial financial resources.'
          ],
          correctAnswers: ['true', 'false', 'true', 'false', 'false'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'Complete the sentences below using NO MORE THAN THREE WORDS from the passage.',
          points: 4,
          blanks: 4,
          correctAnswers: [
            'garden city',
            'green infrastructure',
            'vertical farms',
            'social equity'
          ],
          scoringStrategy: 'all-or-nothing'
        }
      ]
    }
  ]
};
