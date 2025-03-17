import { Test } from './types';
import { v4 as uuidv4 } from 'uuid';

// Sample listening test
export const sampleListeningTest: Test = {
  id: 'sample-listening-1',
  title: 'IELTS Listening Practice Test 1',
  type: 'listening',
  description:
    'A complete IELTS Listening test with 4 sections and 40 questions.',
  totalDuration: 2400, // 40 minutes
  totalQuestions: 40,
  instructions:
    'You will hear a series of recordings and you will have to answer questions based on what you hear. There will be time for you to read the instructions and questions, and you will have a chance to check your answers. The test is in 4 sections. You will hear each section only once.',
  sections: [
    {
      id: uuidv4(),
      title: 'Section 1',
      description:
        'A conversation between two people in an everyday social context.',
      audioUrl:
        'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What is the woman looking for?',
          points: 1,
          options: [
            'A job',
            'An apartment',
            'A roommate',
            'A university course'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The apartment is located on _____ Street.',
          points: 1,
          blanks: 1,
          correctAnswers: ['Maple', 'maple'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'How much is the monthly rent?',
          points: 1,
          options: ['$800', '$850', '$900', '$950'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The apartment is available from _____ (date).',
          points: 1,
          blanks: 1,
          correctAnswers: ['June 1', 'June 1st', '1st June', '1 June'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the amenities with their locations in the apartment.',
          points: 1,
          items: ['Washing machine', 'Storage space'],
          options: ['In the basement', 'On the balcony'],
          correctMatches: { 0: 0, 1: 1 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'pick-from-list',
          text: 'The apartment is close to _____ and _____.',
          points: 2,
          items: ['A park', 'A hospital', 'A shopping mall', 'A train station'],
          options: [
            'a park',
            'a hospital',
            'a shopping mall',
            'a train station',
            'a university'
          ],
          correctAnswers: [0, 3],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What is NOT included in the rent?',
          points: 1,
          options: ['Electricity', 'Water', 'Internet', 'Heating'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The landlord requires a _____ deposit.',
          points: 1,
          blanks: 1,
          correctAnswers: ['security', 'damage', 'bond'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'When does the woman want to view the apartment?',
          points: 1,
          options: ['Today', 'Tomorrow', 'This weekend', 'Next week'],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Section 2',
      description: 'A monologue set in an everyday social context.',
      audioUrl:
        'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'The speaker is giving information about:',
          points: 1,
          options: [
            'A museum',
            'A community center',
            'A university campus',
            'A public library'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The community center was built in _____.',
          points: 1,
          blanks: 1,
          correctAnswers: ['2010', 'twenty ten'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the activities with the days they are offered.',
          points: 3,
          items: ['Yoga classes', 'Art workshop', 'Language exchange'],
          options: ['Monday', 'Wednesday', 'Friday'],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'pick-from-list',
          text: 'The center offers special programs for _____ and _____.',
          points: 2,
          items: ['Children', 'Teenagers', 'Adults', 'Seniors'],
          options: ['children', 'teenagers', 'adults', 'seniors', 'immigrants'],
          correctAnswers: [0, 3],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What time does the center open on weekends?',
          points: 1,
          options: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The annual membership fee is $_____.',
          points: 1,
          blanks: 1,
          correctAnswers: ['50', 'fifty'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'Which facility is NOT available at the center?',
          points: 1,
          options: [
            'Swimming pool',
            'Computer lab',
            'Cafeteria',
            'Meeting rooms'
          ],
          correctAnswer: 0,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'labeling',
          text: 'Label the floor plan of the community center.',
          points: 3,
          imageUrl: '/placeholder.svg?height=300&width=400',
          labels: ['Main entrance', 'Reception', 'Multi-purpose hall'],
          options: ['main entrance', 'reception', 'multi-purpose hall'],
          correctLabels: { 0: 0, 1: 1, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Section 3',
      description:
        'A conversation between up to four people set in an educational or training context.',
      audioUrl:
        'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'The students are discussing:',
          points: 1,
          options: [
            'A research paper',
            'A group presentation',
            'A field trip',
            'An exam'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The presentation is due on _____ (date).',
          points: 1,
          blanks: 1,
          correctAnswers: ['May 15', 'May 15th', '15th May', '15 May'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the students with their assigned topics.',
          points: 3,
          items: ['Sarah', 'Michael', 'Emma'],
          options: ['Introduction', 'Methodology', 'Results'],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'pick-from-list',
          text: 'The professor suggested including _____ and _____ in the presentation.',
          points: 2,
          items: [
            'Charts',
            'Videos',
            'Case studies',
            'Interviews',
            'Statistics'
          ],
          options: [
            'charts',
            'videos',
            'case studies',
            'interviews',
            'statistics'
          ],
          correctAnswers: [0, 2],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'How long should the presentation be?',
          points: 1,
          options: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The students will meet in the _____ to practice their presentation.',
          points: 1,
          blanks: 1,
          correctAnswers: ['library', 'study room'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What is the main challenge the students are facing?',
          points: 1,
          options: [
            'Finding sources',
            'Time management',
            'Technical issues',
            'Disagreement on content'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Section 4',
      description: 'A monologue on an academic subject.',
      audioUrl:
        'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'The lecture is about:',
          points: 1,
          options: [
            'Marine biology',
            'Climate change',
            'Urban planning',
            'Renewable energy'
          ],
          correctAnswer: 3,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'Solar energy accounts for _____% of global energy production.',
          points: 1,
          blanks: 1,
          correctAnswers: ['2', 'two'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'matching',
          text: 'Match the renewable energy types with their advantages.',
          points: 3,
          items: ['Solar', 'Wind', 'Hydroelectric'],
          options: ['No emissions', 'Consistent output', 'Low maintenance'],
          correctMatches: { 0: 0, 1: 2, 2: 1 },
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'pick-from-list',
          text: 'The main challenges for renewable energy adoption are _____ and _____.',
          points: 2,
          items: [
            'Cost',
            'Storage',
            'Public perception',
            'Infrastructure',
            'Government policy'
          ],
          options: [
            'cost',
            'storage',
            'public perception',
            'infrastructure',
            'government policy'
          ],
          correctAnswers: [0, 1],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'According to the lecturer, which country is leading in renewable energy research?',
          points: 1,
          options: ['United States', 'China', 'Germany', 'Denmark'],
          correctAnswer: 2,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'completion',
          text: 'The lecturer predicts that renewable energy will be the dominant source by the year _____.',
          points: 1,
          blanks: 1,
          correctAnswers: ['2050', 'twenty fifty'],
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'multiple-choice',
          text: 'What does the lecturer suggest is needed to accelerate renewable energy adoption?',
          points: 1,
          options: [
            'More research',
            'Government subsidies',
            'Public awareness campaigns',
            'International cooperation'
          ],
          correctAnswer: 1,
          scoringStrategy: 'all-or-nothing'
        },
        {
          id: uuidv4(),
          type: 'labeling',
          text: 'Label the diagram showing the components of a wind turbine.',
          points: 3,
          imageUrl: '/placeholder.svg?height=300&width=400',
          labels: ['Blade', 'Generator', 'Tower'],
          options: [],
          correctLabels: { 0: 0, 1: 1, 2: 2 },
          scoringStrategy: 'all-or-nothing'
        }
      ]
    }
  ]
};
