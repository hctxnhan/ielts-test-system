import type { Test } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Sample general training reading test
export const sampleGeneralReadingTest: Test = {
  id: 'sample-general-reading-1',
  title: 'IELTS General Training Reading Practice Test 1',
  type: 'reading',
  readingVariant: 'general',
  description:
    'A complete IELTS General Training Reading test with 3 sections and 40 questions.',
  totalDuration: 3600, // 60 minutes
  totalQuestions: 40,
  instructions:
    'You should spend about 20 minutes on Questions 1-14, which are based on Reading Passage 1. Read the passage and answer the questions. There is no extra time to transfer your answers, so write your answers directly on the answer sheet.',
  sections: [
    {
      id: uuidv4(),
      title: 'Reading Passage 1',
      description: 'Everyday texts like advertisements and notices.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'Community Center Activities and Services',
        content: `GREENFIELD COMMUNITY CENTER
      ACTIVITIES AND SERVICES - SPRING 2023

      OPENING HOURS
      Monday to Friday: 9:00 AM - 9:00 PM
      Saturday: 10:00 AM - 6:00 PM
      Sunday: 12:00 PM - 5:00 PM
      
      Etc`,
        source: 'Adapted from community center brochures',
        hasImages: false
      },
      questions: [
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'The community center is open seven days a week.',
            'Children under 12 must pay for membership.',
            'The swimming pool is outdoors.',
            'Yoga classes are available every weekday.',
            'Room rentals are free for members.'
          ],
          correctAnswers: ['true', 'false', 'false', 'true', 'false'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What is the cost of an annual membership for students?',
          points: 1,
          options: ['$10', '$25', '$50', 'Free'],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the following special events with their dates.',
          points: 3,
          items: ['Community Yard Sale', 'Health Fair', 'Cultural Festival'],
          options: ['April 15', 'May 6', 'June 10'],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'Complete the sentences below using NO MORE THAN THREE WORDS from the passage.',
          points: 5,
          blanks: 5,
          correctAnswers: [
            '9:00 AM',
            'heated',
            'Sarah Johnson',
            'non-profit organizations',
            'www.greenfieldcc.org'
          ],
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Reading Passage 2',
      description: 'Workplace-related text.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'Employee Handbook: Health and Safety Guidelines',
        content: `NORTHSTAR INDUSTRIES
      EMPLOYEE HANDBOOK: HEALTH AND SAFETY GUIDELINES
      
      INTRODUCTION
      At Northstar Industries, the health and safety of our employees is our top priority. This section of the employee handbook outlines our health and safety policies and procedures. All employees are required to familiarize themselves with these guidelines and follow them at all times.
      
      Etc,...`,
        hasImages: false
      },
      questions: [
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'Employees should use elevators during a fire evacuation.',
            'All accidents must be reported within 24 hours.',
            'The company provides personal protective equipment to employees.',
            'Safety training is only required for new employees.',
            'Employees can be disciplined for not following safety guidelines.'
          ],
          correctAnswers: ['false', 'true', 'true', 'false', 'true'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the emergency situations with the correct first action to take.',
          points: 3,
          items: ['Fire emergency', 'Medical emergency', 'Severe weather'],
          options: [
            'Call emergency services (911)',
            'Activate the nearest fire alarm',
            'Move to designated shelter areas'
          ],
          correctMatches: { 0: 1, 1: 0, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'According to the passage, what should you do if you find unsafe conditions?',
          points: 1,
          options: [
            'Fix the problem yourself',
            'Report it to your supervisor immediately',
            'Contact the Health and Safety Coordinator',
            'Complete an incident report'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'short-answer',
          text: 'Answer the following questions using NO MORE THAN THREE WORDS from the passage.',
          points: 4,
          questions: [
            'What should employees know the location of, besides emergency exits and fire extinguishers?',
            'What must be completed within 24 hours after an accident?',
            'What should employees take regularly to prevent ergonomic issues?',
            'Who should be contacted for questions about health and safety?'
          ],
          correctAnswers: [
            ['first aid kits'],
            ['incident report', 'an incident report'],
            ['regular breaks'],
            ['Health and Safety Coordinator']
          ],
          wordLimit: 3,
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Reading Passage 3',
      description: 'General interest article.',
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: 'The Evolution of Remote Work',
        content: `THE EVOLUTION OF REMOTE WORK

      Remote work, once considered a rare perk, has transformed into a mainstream work arrangement that is reshaping how businesses operate and how people approach their careers. While the COVID-19 pandemic dramatically accelerated this shift, the foundations of remote work have been developing for decades, driven by technological advancements and changing attitudes toward work-life balance.
      
      Etc,...`,
        source: 'Adapted from business and technology publications',
        hasImages: true,
        imageUrls: ['/placeholder.svg?height=300&width=500']
      },
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'According to the passage, who coined the term "telecommuting"?',
          points: 1,
          options: [
            'IBM researchers',
            'Jack Nilles',
            'Stanford University researchers',
            'Digital nomads'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'true-false-not-given',
          text: 'Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.',
          points: 5,
          statements: [
            'Remote work was common before the COVID-19 pandemic.',
            'By May 2020, less than half of the U.S. labor force was working from home full-time.',
            'Most remote-capable employees prefer a hybrid work arrangement.',
            'Remote workers are always more productive than office-based workers.',
            'Virtual reality may improve remote collaboration in the future.'
          ],
          correctAnswers: ['false', 'false', 'true', 'false', 'true'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching-headings',
          text: 'Match the following headings to the paragraphs in the passage.',
          points: 5,
          paragraphs: [
            'Paragraphs 1-2',
            'Paragraphs 3-4',
            'Paragraphs 5-6',
            'Paragraphs 7-8',
            'Paragraphs 9-10'
          ],
          headings: [
            'Early history and origins',
            'Technological developments enabling remote work',
            'The pandemic impact and post-pandemic trends',
            'Benefits and challenges',
            'Future outlook and conclusion'
          ],
          correctMatches: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'Complete the sentences below using NO MORE THAN THREE WORDS from the passage.',
          points: 5,
          blanks: 5,
          correctAnswers: [
            'traffic congestion',
            'cloud computing',
            'digital nomads',
            '13% more productive',
            'feelings of isolation'
          ],
          scoringStrategy: 'all-or-nothing'
        }
      ]
    }
  ]
};
