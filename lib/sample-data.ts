import type { Test } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

// Sample listening test
export const sampleListeningTest: Test = {
  id: "sample-listening-1",
  title: "IELTS Listening Practice Test 1",
  type: "listening",
  description: "A complete IELTS Listening test with 4 sections and 40 questions.",
  totalDuration: 2400, // 40 minutes
  totalQuestions: 40,
  instructions:
    "You will hear a series of recordings and you will have to answer questions based on what you hear. There will be time for you to read the instructions and questions, and you will have a chance to check your answers. The test is in 4 sections. You will hear each section only once.",
  sections: [
    {
      id: uuidv4(),
      title: "Section 1",
      description: "A conversation between two people in an everyday social context.",
      audioUrl: "/sample-audio-1.mp3", // This would be a real audio file in production
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What is the woman looking for?",
          points: 1,
          options: ["A job", "An apartment", "A roommate", "A university course"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The apartment is located on _____ Street.",
          points: 1,
          blanks: 1,
          correctAnswers: ["Maple", "maple"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "How much is the monthly rent?",
          points: 1,
          options: ["$800", "$850", "$900", "$950"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The apartment is available from _____ (date).",
          points: 1,
          blanks: 1,
          correctAnswers: ["June 1", "June 1st", "1st June", "1 June"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the amenities with their locations in the apartment.",
          points: 1,
          items: ["Washing machine", "Storage space"],
          options: ["In the basement", "On the balcony"],
          correctMatches: { 0: 0, 1: 1 },
        },
        {
          id: uuidv4(),
          type: "pick-from-list",
          text: "The apartment is close to _____ and _____.",
          points: 2,
          blanks: 2,
          options: ["a park", "a hospital", "a shopping mall", "a train station", "a university"],
          correctAnswers: [0, 3],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What is NOT included in the rent?",
          points: 1,
          options: ["Electricity", "Water", "Internet", "Heating"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The landlord requires a _____ deposit.",
          points: 1,
          blanks: 1,
          correctAnswers: ["security", "damage", "bond"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "When does the woman want to view the apartment?",
          points: 1,
          options: ["Today", "Tomorrow", "This weekend", "Next week"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Section 2",
      description: "A monologue set in an everyday social context.",
      audioUrl: "/sample-audio-2.mp3",
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "The speaker is giving information about:",
          points: 1,
          options: ["A museum", "A community center", "A university campus", "A public library"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The community center was built in _____.",
          points: 1,
          blanks: 1,
          correctAnswers: ["2010", "twenty ten"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the activities with the days they are offered.",
          points: 3,
          items: ["Yoga classes", "Art workshop", "Language exchange"],
          options: ["Monday", "Wednesday", "Friday"],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
        },
        {
          id: uuidv4(),
          type: "pick-from-list",
          text: "The center offers special programs for _____ and _____.",
          points: 2,
          blanks: 2,
          options: ["children", "teenagers", "adults", "seniors", "immigrants"],
          correctAnswers: [0, 3],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What time does the center open on weekends?",
          points: 1,
          options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The annual membership fee is $_____.",
          points: 1,
          blanks: 1,
          correctAnswers: ["50", "fifty"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "Which facility is NOT available at the center?",
          points: 1,
          options: ["Swimming pool", "Computer lab", "Cafeteria", "Meeting rooms"],
          correctAnswer: 0,
        },
        {
          id: uuidv4(),
          type: "labeling",
          text: "Label the floor plan of the community center.",
          points: 3,
          imageUrl: "/placeholder.svg?height=300&width=400",
          labels: ["Main entrance", "Reception", "Multi-purpose hall"],
          positions: [
            { x: 50, y: 150 },
            { x: 100, y: 150 },
            { x: 200, y: 150 },
          ],
          correctLabels: { 0: 0, 1: 1, 2: 2 },
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Section 3",
      description: "A conversation between up to four people set in an educational or training context.",
      audioUrl: "/sample-audio-3.mp3",
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "The students are discussing:",
          points: 1,
          options: ["A research paper", "A group presentation", "A field trip", "An exam"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The presentation is due on _____ (date).",
          points: 1,
          blanks: 1,
          correctAnswers: ["May 15", "May 15th", "15th May", "15 May"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the students with their assigned topics.",
          points: 3,
          items: ["Sarah", "Michael", "Emma"],
          options: ["Introduction", "Methodology", "Results"],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
        },
        {
          id: uuidv4(),
          type: "pick-from-list",
          text: "The professor suggested including _____ and _____ in the presentation.",
          points: 2,
          blanks: 2,
          options: ["charts", "videos", "case studies", "interviews", "statistics"],
          correctAnswers: [0, 2],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "How long should the presentation be?",
          points: 1,
          options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The students will meet in the _____ to practice their presentation.",
          points: 1,
          blanks: 1,
          correctAnswers: ["library", "study room"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What is the main challenge the students are facing?",
          points: 1,
          options: ["Finding sources", "Time management", "Technical issues", "Disagreement on content"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Section 4",
      description: "A monologue on an academic subject.",
      audioUrl: "/sample-audio-4.mp3",
      duration: 600, // 10 minutes
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "The lecture is about:",
          points: 1,
          options: ["Marine biology", "Climate change", "Urban planning", "Renewable energy"],
          correctAnswer: 3,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "Solar energy accounts for _____% of global energy production.",
          points: 1,
          blanks: 1,
          correctAnswers: ["2", "two"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the renewable energy types with their advantages.",
          points: 3,
          items: ["Solar", "Wind", "Hydroelectric"],
          options: ["No emissions", "Consistent output", "Low maintenance"],
          correctMatches: { 0: 0, 1: 2, 2: 1 },
        },
        {
          id: uuidv4(),
          type: "pick-from-list",
          text: "The main challenges for renewable energy adoption are _____ and _____.",
          points: 2,
          blanks: 2,
          options: ["cost", "storage", "public perception", "infrastructure", "government policy"],
          correctAnswers: [0, 1],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "According to the lecturer, which country is leading in renewable energy research?",
          points: 1,
          options: ["United States", "China", "Germany", "Denmark"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "The lecturer predicts that renewable energy will be the dominant source by the year _____.",
          points: 1,
          blanks: 1,
          correctAnswers: ["2050", "twenty fifty"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What does the lecturer suggest is needed to accelerate renewable energy adoption?",
          points: 1,
          options: ["More research", "Government subsidies", "Public awareness campaigns", "International cooperation"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "labeling",
          text: "Label the diagram showing the components of a wind turbine.",
          points: 3,
          imageUrl: "/placeholder.svg?height=300&width=400",
          labels: ["Blade", "Generator", "Tower"],
          positions: [
            { x: 250, y: 100 },
            { x: 200, y: 150 },
            { x: 200, y: 250 },
          ],
          correctLabels: { 0: 0, 1: 1, 2: 2 },
        },
      ],
    },
  ],
}

// Update the sample audio URLs to use valid placeholder URLs
// Find the audioUrl properties in sampleListeningTest and update them

// In the first section
const updatedSections = sampleListeningTest.sections.map((section) => ({
  ...section,
  audioUrl: section.audioUrl ? "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" : undefined,
}))

sampleListeningTest.sections = updatedSections

// Sample academic reading test
export const sampleAcademicReadingTest: Test = {
  id: "sample-academic-reading-1",
  title: "IELTS Academic Reading Practice Test 1",
  type: "reading",
  readingVariant: "academic",
  description: "A complete IELTS Academic Reading test with 3 passages and 40 questions.",
  totalDuration: 3600, // 60 minutes
  totalQuestions: 40,
  instructions:
    "You should spend about 20 minutes on Questions 1-13, which are based on Reading Passage 1. Read the passage and answer the questions. There is no extra time to transfer your answers, so write your answers directly on the answer sheet.",
  sections: [
    {
      id: uuidv4(),
      title: "Reading Passage 1",
      description: "Academic text about environmental conservation.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "The Importance of Biodiversity",
        content: `Biodiversity is the variety of life on Earth, in all its forms and all its interactions. If that sounds broad, it's because it is. Biodiversity is the most complex feature of our planet and it is the most vital. "Without biodiversity, there is no future for humanity," says David Macdonald, Professor of Wildlife Conservation at Oxford University.

      The term was coined in 1985 – a contraction of "biological diversity" – but the huge global biodiversity losses we're seeing today have happened in the blink of an eye, geologically speaking. Since the dawn of agriculture, some 12,000 years ago, the human population has surged from around 1 million people to nearly 8 billion today. In that time, we've cleared forests, drained wetlands, and plowed grasslands on a massive scale. Half of the Earth's ice-free land area is now dedicated to agriculture, and 77% of rivers longer than 1,000km no longer flow freely from source to sea.

      The consequences for biodiversity have been devastating. The global rate of species extinction is already at least tens to hundreds of times higher than the average rate over the past 10 million years and is accelerating. According to the WWF's 2020 Living Planet Report, wildlife populations have declined by 68% since 1970. The IUCN Red List indicates that 40% of amphibians, 34% of conifers, 33% of reef-building corals, 25% of mammals, and 14% of birds are threatened with extinction.

      But why does this matter? Biodiversity is essential for the processes that support all life on Earth, including humans. Without a wide range of animals, plants and microorganisms, we cannot have the healthy ecosystems that we rely on to provide us with the air we breathe and the food we eat. And as biodiversity decreases, these systems become increasingly fragile and less resilient to disturbances such as climate change.

      There are direct economic impacts too. The World Economic Forum estimates that $44 trillion of economic value generation – more than half of global GDP – is moderately or highly dependent on nature and its services. From the pollination of crops to the medicines we derive from plants, biodiversity provides enormous economic benefits.

      The good news is that it's not too late to act. Conservation efforts have shown that targeted interventions can work. The ban on commercial whaling has allowed many whale populations to recover. The creation of protected areas has helped preserve habitats and the species that depend on them. And innovative approaches like rewilding – restoring ecosystems by reintroducing keystone species – are showing promising results.

      But these efforts need to be scaled up dramatically. We need to transform our food systems to reduce their impact on biodiversity. We need to tackle climate change, which is becoming an increasingly significant driver of biodiversity loss. And we need to address the underlying economic and social factors that drive environmental destruction.

      As individuals, we can all make a difference through the choices we make – from the food we eat to how we travel. But the scale of the challenge means that we also need coordinated action at all levels, from local communities to international agreements. The future of biodiversity, and with it the future of humanity, depends on the actions we take in the coming years.`,
        source: "Adapted from various scientific publications and reports",
        hasImages: true,
        imageUrls: ["/placeholder.svg?height=300&width=500"],
      },
      questions: [
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            'The term "biodiversity" was first used in the 1980s.',
            "Human population has increased eightfold since agriculture began.",
            "More than half of Earth's land is now used for farming.",
            "The rate of species extinction is decreasing.",
            "Biodiversity loss has no impact on economic activities.",
          ],
          correctAnswers: ["true", "true", "true", "false", "false"],
        },
        {
          id: uuidv4(),
          type: "matching-headings",
          text: "Match the following headings to the paragraphs in the passage.",
          points: 4,
          paragraphs: ["Paragraphs 1-2", "Paragraphs 3-4", "Paragraph 5", "Paragraphs 6-8"],
          headings: [
            "Definition and human impact",
            "Economic consequences",
            "Solutions and future actions",
            "The extinction crisis and its importance",
          ],
          correctMatches: { 0: 0, 1: 3, 2: 1, 3: 2 },
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "According to the passage, what percentage of wildlife populations have declined since 1970?",
          points: 1,
          options: ["34%", "40%", "68%", "77%"],
          correctAnswer: 2,
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "Complete the sentences below using NO MORE THAN THREE WORDS from the passage.",
          points: 3,
          blanks: 3,
          correctAnswers: ["biological diversity", "increasingly fragile", "rewilding"],
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Reading Passage 2",
      description: "Academic text about artificial intelligence.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "The Rise of Artificial Intelligence",
        content: `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From voice assistants like Siri and Alexa to recommendation systems on streaming platforms, AI has become an integral part of our daily lives. But what exactly is AI, and how did we get here?

      At its core, AI refers to computer systems designed to perform tasks that typically require human intelligence. These include problem-solving, recognizing speech, visual perception, decision-making, and language translation. The field of AI research was founded on the assumption that human intelligence "can be so precisely described that a machine can be made to simulate it."
      
      The history of AI dates back to the 1950s, when the term "artificial intelligence" was first coined by John McCarthy at the Dartmouth Conference. Early AI research focused on symbolic methods and problem-solving. By the 1980s, machine learning algorithms had become a major focus, allowing computers to learn from data rather than following explicitly programmed instructions.
      
      The real breakthrough came in the 2010s with the rise of deep learning, a subset of machine learning based on artificial neural networks. Deep learning has enabled remarkable advances in image and speech recognition, natural language processing, and game playing. In 2016, Google's AlphaGo program defeated the world champion Go player, a feat previously thought to be decades away.
      
      Today, AI is being applied across numerous sectors. In healthcare, AI algorithms can analyze medical images to detect diseases like cancer often with greater accuracy than human doctors. In transportation, self-driving cars promise to revolutionize how we travel. In finance, AI systems detect fraudulent transactions and optimize investment portfolios.
      
      However, the rapid advancement of AI has also raised significant concerns. One major issue is job displacement. As AI systems become more capable, they may automate tasks currently performed by humans, potentially leading to unemployment in certain sectors. A 2020 report by the World Economic Forum predicted that AI could displace 85 million jobs by 2025, though it may also create 97 million new ones.
      
      Privacy is another concern. AI systems often rely on vast amounts of data, including personal information, raising questions about data security and surveillance. There are also worries about algorithmic bias, where AI systems reflect or amplify existing societal biases in their training data.
      
      Perhaps the most profound questions relate to the long-term future of AI. Some experts, including the late Stephen Hawking, have expressed concerns about the development of artificial general intelligence (AGI) – AI that matches or exceeds human intelligence across all domains. While AGI remains theoretical, it raises complex ethical and philosophical questions about control, consciousness, and the future of humanity.
      
      Despite these concerns, the potential benefits of AI are enormous. AI could help address some of our most pressing challenges, from climate change to disease. The key will be ensuring that AI development is guided by human values and benefits humanity as a whole.
      
      As we navigate this new frontier, one thing is clear: AI is not just a technology but a profound force that will shape our future in ways we are only beginning to understand.`,
        source: "Adapted from various technology publications and research papers",
        hasImages: false,
      },
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: 'When was the term "artificial intelligence" first coined?',
          points: 1,
          options: ["In the 1980s", "In the 1950s", "In the 2010s", "In 2016"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            "Deep learning is a type of machine learning.",
            "AlphaGo was developed by Microsoft.",
            "AI can detect cancer more accurately than human doctors in some cases.",
            "The World Economic Forum predicts that AI will create more jobs than it displaces.",
            "Stephen Hawking was optimistic about the development of artificial general intelligence.",
          ],
          correctAnswers: ["true", "false", "true", "true", "false"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the following concerns with their descriptions from the passage.",
          points: 3,
          items: ["Job displacement", "Privacy", "Algorithmic bias"],
          options: [
            "AI systems may reflect societal prejudices",
            "AI could automate tasks currently done by humans",
            "AI relies on personal information",
          ],
          correctMatches: { 0: 1, 1: 2, 2: 0 },
        },
        {
          id: uuidv4(),
          type: "short-answer",
          text: "Answer the following questions using NO MORE THAN THREE WORDS from the passage.",
          points: 3,
          questions: [
            "What does the abbreviation AGI stand for?",
            "In which decade did machine learning become a major focus?",
            "According to the passage, what should guide AI development?",
          ],
          correctAnswers: [["artificial general intelligence"], ["1980s"], ["human values"]],
          wordLimit: 3,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Reading Passage 3",
      description: "Academic text about urban planning.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "Sustainable Cities: Planning for the Future",
        content: `As the world's population continues to urbanize, with projections suggesting that 68% of people will live in cities by 2050, the concept of sustainable urban planning has never been more critical. Sustainable cities, also known as eco-cities or green cities, are designed with social, economic, and environmental impact in mind. They aim to minimize required inputs of energy, water, food, waste, output of heat, air pollution, and water pollution.

      The history of sustainable urban planning can be traced back to the garden city movement of the early 20th century, pioneered by Ebenezer Howard. Howard envisioned self-contained communities surrounded by greenbelts, combining the best aspects of town and country living. While these early visions were utopian in nature, they laid the groundwork for modern sustainable urban planning.
      
      Today's sustainable cities incorporate a wide range of practices and technologies. Energy-efficient buildings, for instance, use design techniques and technologies to reduce energy consumption. These include proper insulation, energy-efficient windows, and smart systems that optimize heating, cooling, and lighting. Some buildings even generate their own energy through solar panels or wind turbines, sometimes producing more energy than they consume.
      
      Transportation is another key aspect of sustainable cities. Reducing dependence on private automobiles through comprehensive public transportation systems, bike lanes, and pedestrian-friendly design can significantly decrease carbon emissions. Cities like Copenhagen and Amsterdam have become models for bicycle infrastructure, with Copenhagen boasting that more people commute by bicycle than by car.
      
      Water management is equally important. Sustainable cities implement systems to collect and reuse rainwater, treat wastewater, and reduce overall water consumption. Green infrastructure, such as rain gardens and permeable pavements, helps manage stormwater and reduce the burden on municipal systems during heavy rainfall.
      
      Waste management strategies focus on reducing, reusing, and recycling materials to minimize landfill waste. Some cities, like San Francisco, have set ambitious goals to become "zero waste" communities, diverting nearly all waste from landfills through comprehensive recycling and composting programs.
      
      Urban agriculture is also gaining prominence in sustainable city planning. From community gardens to vertical farms, growing food within city limits reduces transportation emissions, provides fresh produce to urban residents, and can help build community connections.
      
      Perhaps most importantly, sustainable cities prioritize quality of life and social equity. Green spaces, cultural amenities, affordable housing, and access to services are all essential components of a truly sustainable city. Cities like Curitiba, Brazil, have demonstrated that innovative urban planning can improve quality of life while reducing environmental impact, even with limited resources.
      
      The challenges to creating sustainable cities are significant. Existing infrastructure, political obstacles, and funding constraints can all impede progress. Additionally, as climate change intensifies, cities must not only reduce their environmental impact but also adapt to rising sea levels, more frequent extreme weather events, and other climate-related challenges.
      
      Despite these challenges, the movement toward sustainable cities continues to gain momentum. As urbanization increases and the effects of climate change become more apparent, the need for cities that balance human needs with environmental constraints becomes ever more urgent. The cities that succeed in this balancing act will not only reduce their environmental footprint but also provide healthier, more livable environments for their residents.`,
        source: "Adapted from urban planning journals and sustainability reports",
        hasImages: true,
        imageUrls: ["/placeholder.svg?height=300&width=500"],
      },
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "According to the passage, what percentage of people are projected to live in cities by 2050?",
          points: 1,
          options: ["50%", "68%", "75%", "90%"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "matching-headings",
          text: "Match the following headings to the paragraphs in the passage.",
          points: 5,
          paragraphs: ["Paragraphs 1-2", "Paragraph 3", "Paragraph 4", "Paragraphs 5-6", "Paragraphs 7-10"],
          headings: [
            "Introduction and historical context",
            "Energy efficiency in buildings",
            "Sustainable transportation",
            "Water and waste management",
            "Urban agriculture, social aspects, and future challenges",
          ],
          correctMatches: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
        },
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            "The garden city movement was started by Ebenezer Howard.",
            "Most buildings in sustainable cities generate more energy than they consume.",
            "More people commute by bicycle than by car in Copenhagen.",
            'San Francisco has already achieved its goal of becoming a "zero waste" city.',
            "Curitiba has demonstrated that sustainable urban planning requires substantial financial resources.",
          ],
          correctAnswers: ["true", "false", "true", "false", "false"],
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "Complete the sentences below using NO MORE THAN THREE WORDS from the passage.",
          points: 4,
          blanks: 4,
          correctAnswers: ["garden city", "green infrastructure", "vertical farms", "social equity"],
        },
      ],
    },
  ],
}

// Sample general training reading test
export const sampleGeneralReadingTest: Test = {
  id: "sample-general-reading-1",
  title: "IELTS General Training Reading Practice Test 1",
  type: "reading",
  readingVariant: "general",
  description: "A complete IELTS General Training Reading test with 3 sections and 40 questions.",
  totalDuration: 3600, // 60 minutes
  totalQuestions: 40,
  instructions:
    "You should spend about 20 minutes on Questions 1-14, which are based on Reading Passage 1. Read the passage and answer the questions. There is no extra time to transfer your answers, so write your answers directly on the answer sheet.",
  sections: [
    {
      id: uuidv4(),
      title: "Reading Passage 1",
      description: "Everyday texts like advertisements and notices.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "Community Center Activities and Services",
        content: `GREENFIELD COMMUNITY CENTER
      ACTIVITIES AND SERVICES - SPRING 2023

      OPENING HOURS
      Monday to Friday: 9:00 AM - 9:00 PM
      Saturday: 10:00 AM - 6:00 PM
      Sunday: 12:00 PM - 5:00 PM
      
      MEMBERSHIP
      Annual membership: $50 (adults), $25 (seniors/students), Free (children under 12)
      Day pass: $10
      
      FACILITIES
      • Gymnasium (basketball, volleyball, badminton)
      • Swimming pool (25m, heated)
      • Fitness center with cardio and weight equipment
      • Multi-purpose rooms for classes and events
      • Computer lab with free internet access
      • Café serving healthy meals and snacks
      
      REGULAR CLASSES
      Fitness Classes:
      • Yoga: Mon/Wed/Fri 10:00 AM, Tue/Thu 6:00 PM
      • Zumba: Tue/Thu 10:00 AM, Mon/Wed 7:00 PM
      • Senior Fitness: Mon/Wed/Fri 11:30 AM
      • High-Intensity Interval Training: Mon/Wed/Fri 6:00 PM
      
      Arts & Crafts:
      • Pottery: Tuesday 2:00 PM, Saturday 11:00 AM
      • Painting: Wednesday 2:00 PM, Saturday 2:00 PM
      • Photography: Thursday 7:00 PM
      
      Education:
      • English Conversation: Monday/Wednesday 6:00 PM
      • Computer Skills for Beginners: Tuesday 10:00 AM
      • Financial Literacy: First Thursday of each month, 7:00 PM
      
      SPECIAL EVENTS - SPRING 2023
      • Community Yard Sale: April 15, 9:00 AM - 3:00 PM
        Rent a table for $15 to sell your items. Registration required by April 10.
      
      • Health Fair: May 6, 10:00 AM - 4:00 PM
        Free health screenings, nutrition information, and fitness demonstrations.
      
      • Cultural Festival: June 10, 12:00 PM - 8:00 PM
        Celebrate our diverse community with food, music, dance, and art from around the world.
      
      VOLUNTEER OPPORTUNITIES
      We're always looking for volunteers to help with:
      • After-school programs for children
      • Senior companion program
      • Event organization
      • Front desk reception
      
      Contact Sarah Johnson at volunteers@greenfieldcc.org or call 555-123-4567 for more information.
      
      ROOM RENTALS
      Community rooms available for private events, meetings, and celebrations.
      Small room (capacity 20): $30/hour
      Large room (capacity 50): $50/hour
      Gymnasium (capacity 200): $100/hour
      
      Discounts available for non-profit organizations and members.
      
      For more information about any of our programs or services, please visit our website at www.greenfieldcc.org or call us at 555-987-6543.`,
        source: "Adapted from community center brochures",
        hasImages: false,
      },
      questions: [
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            "The community center is open seven days a week.",
            "Children under 12 must pay for membership.",
            "The swimming pool is outdoors.",
            "Yoga classes are available every weekday.",
            "Room rentals are free for members.",
          ],
          correctAnswers: ["true", "false", "false", "true", "false"],
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "What is the cost of an annual membership for students?",
          points: 1,
          options: ["$10", "$25", "$50", "Free"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the following special events with their dates.",
          points: 3,
          items: ["Community Yard Sale", "Health Fair", "Cultural Festival"],
          options: ["April 15", "May 6", "June 10"],
          correctMatches: { 0: 0, 1: 1, 2: 2 },
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "Complete the sentences below using NO MORE THAN THREE WORDS from the passage.",
          points: 5,
          blanks: 5,
          correctAnswers: ["9:00 AM", "heated", "Sarah Johnson", "non-profit organizations", "www.greenfieldcc.org"],
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Reading Passage 2",
      description: "Workplace-related text.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "Employee Handbook: Health and Safety Guidelines",
        content: `NORTHSTAR INDUSTRIES
      EMPLOYEE HANDBOOK: HEALTH AND SAFETY GUIDELINES
      
      INTRODUCTION
      At Northstar Industries, the health and safety of our employees is our top priority. This section of the employee handbook outlines our health and safety policies and procedures. All employees are required to familiarize themselves with these guidelines and follow them at all times.
      
      GENERAL SAFETY RULES
      • Always wear appropriate personal protective equipment (PPE) for your job role.
      • Report any unsafe conditions or practices to your supervisor immediately.
      • Keep your work area clean and free of hazards.
      • Know the location of emergency exits, fire extinguishers, and first aid kits.
      • Do not operate any equipment unless you have been properly trained.
      • Follow all warning signs and safety instructions.
      • Do not run or engage in horseplay in work areas.
      • Use proper lifting techniques to avoid back injuries.
      
      EMERGENCY PROCEDURES
      Fire:
      1. Activate the nearest fire alarm.
      2. Call emergency services (911).
      3. Evacuate the building using the nearest exit.
      4. Proceed to your designated assembly point.
      5. Do not use elevators during a fire evacuation.
      6. Do not re-enter the building until authorized by emergency personnel.
      
      Medical Emergency:
      1. Call emergency services (911) for serious injuries or illnesses.
      2. Notify your supervisor immediately.
      3. If trained, provide first aid until help arrives.
      4. Do not move an injured person unless they are in immediate danger.
      
      Severe Weather:
      1. Move to designated shelter areas away from windows.
      2. Follow instructions from your emergency response team.
      3. Remain in the shelter until the all-clear is given.
      
      ACCIDENT REPORTING
      All accidents, injuries, near misses, and property damage, regardless of severity, must be reported immediately to your supervisor. An incident report must be completed within 24 hours. This information is vital for:
      • Ensuring proper medical treatment
      • Complying with legal requirements
      • Identifying hazards and preventing future incidents
      
      HAZARDOUS MATERIALS
      • All hazardous materials must be properly labeled.
      • Safety Data Sheets (SDS) must be available for all hazardous materials and accessible to all employees.
      • Always use proper handling, storage, and disposal methods.
      • Report any spills or leaks immediately and follow cleanup procedures.
      • Never mix chemicals unless specifically instructed to do so.
      
      ERGONOMICS
      • Adjust your workstation to fit your body and task requirements.
      • Maintain good posture while working.
      • Take regular breaks to stretch and change position.
      • Use ergonomic tools and equipment when available.
      • Report any discomfort or pain related to your work activities.
      
      PERSONAL PROTECTIVE EQUIPMENT (PPE)
      Depending on your job role, you may be required to wear specific PPE, which may include:
      • Safety glasses or face shields
      • Hearing protection
      • Hard hats
      • Safety footwear
      • Gloves
      • Respiratory protection
      
      The company will provide all required PPE. It is your responsibility to:
      • Wear PPE as required for your job
      • Inspect PPE before each use
      • Maintain PPE in clean and reliable condition
      • Report damaged or defective PPE to your supervisor
      • Replace PPE as necessary
      
      TRAINING
      All employees will receive health and safety training:
      • Upon initial hiring (orientation)
      • When job responsibilities change
      • When new hazards are introduced
      • When new procedures or equipment are implemented
      • Annually for refresher training
      
      RESPONSIBILITY
      Safety is everyone's responsibility. Managers, supervisors, and employees all play a vital role in maintaining a safe workplace. Failure to comply with health and safety guidelines may result in disciplinary action.
      
      For questions or concerns regarding health and safety, please contact the Health and Safety Coordinator at safety@northstarindustries.com or ext. 4567.`,
        source: "Adapted from workplace health and safety manuals",
        hasImages: false,
      },
      questions: [
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            "Employees should use elevators during a fire evacuation.",
            "All accidents must be reported within 24 hours.",
            "The company provides personal protective equipment to employees.",
            "Safety training is only required for new employees.",
            "Employees can be disciplined for not following safety guidelines.",
          ],
          correctAnswers: ["false", "true", "true", "false", "true"],
        },
        {
          id: uuidv4(),
          type: "matching",
          text: "Match the emergency situations with the correct first action to take.",
          points: 3,
          items: ["Fire emergency", "Medical emergency", "Severe weather"],
          options: [
            "Call emergency services (911)",
            "Activate the nearest fire alarm",
            "Move to designated shelter areas",
          ],
          correctMatches: { 0: 1, 1: 0, 2: 2 },
        },
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: "According to the passage, what should you do if you find unsafe conditions?",
          points: 1,
          options: [
            "Fix the problem yourself",
            "Report it to your supervisor immediately",
            "Contact the Health and Safety Coordinator",
            "Complete an incident report",
          ],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "short-answer",
          text: "Answer the following questions using NO MORE THAN THREE WORDS from the passage.",
          points: 4,
          questions: [
            "What should employees know the location of, besides emergency exits and fire extinguishers?",
            "What must be completed within 24 hours after an accident?",
            "What should employees take regularly to prevent ergonomic issues?",
            "Who should be contacted for questions about health and safety?",
          ],
          correctAnswers: [
            ["first aid kits"],
            ["incident report", "an incident report"],
            ["regular breaks"],
            ["Health and Safety Coordinator"],
          ],
          wordLimit: 3,
        },
      ],
    },
    {
      id: uuidv4(),
      title: "Reading Passage 3",
      description: "General interest article.",
      duration: 1200, // 20 minutes
      readingPassage: {
        id: uuidv4(),
        title: "The Evolution of Remote Work",
        content: `THE EVOLUTION OF REMOTE WORK

      Remote work, once considered a rare perk, has transformed into a mainstream work arrangement that is reshaping how businesses operate and how people approach their careers. While the COVID-19 pandemic dramatically accelerated this shift, the foundations of remote work have been developing for decades, driven by technological advancements and changing attitudes toward work-life balance.
      
      The concept of working away from a central office dates back to the 1970s when IBM began experimenting with installing terminals in employees' homes. The term "telecommuting" was coined around this time by NASA engineer Jack Nilles, who was exploring ways to reduce traffic congestion and pollution by eliminating the daily commute. However, limited technology meant that remote work remained impractical for most professions.
      
      The 1990s and early 2000s saw significant developments that made remote work more viable. The internet became widely accessible, email transformed business communication, and mobile phones became ubiquitous. Companies began offering flexible work arrangements to attract talent and reduce office costs. Despite these advances, remote work was still relatively uncommon, with only about 3-4% of the American workforce working primarily from home in the early 2000s.
      
      The next major evolution came with the rise of cloud computing, video conferencing, and collaboration tools in the 2010s. Platforms like Slack, Zoom, and Google Workspace made it possible for teams to collaborate effectively regardless of physical location. A new generation of "digital nomads" emerged, professionals who traveled the world while working remotely. Companies like Automattic (the company behind WordPress) and Buffer demonstrated that entirely distributed teams could be successful.
      
      Then came 2020. The COVID-19 pandemic forced an unprecedented global experiment in remote work. Organizations that had resisted flexible work arrangements had to adapt almost overnight. According to a Stanford University study, by May 2020, 42% of the U.S. labor force was working from home full-time. This sudden shift revealed both the possibilities and challenges of remote work on a large scale.
      
      Post-pandemic, many companies have adopted hybrid models that combine remote and in-office work. A 2022 survey by Gallup found that 53% of remote-capable employees expected a hybrid arrangement going forward, while 24% expected to work exclusively remotely. Major companies like Twitter, Shopify, and Spotify announced permanent remote work options for their employees.
      
      The benefits of remote work are substantial. For employees, it eliminates commuting time and costs, offers greater flexibility, and can improve work-life balance. For employers, it expands the talent pool beyond geographical boundaries, can reduce office space costs, and often leads to increased productivity. A two-year Stanford study found that remote workers were 13% more productive than their office-based counterparts.
      
      However, remote work is not without challenges. Many workers report feelings of isolation and difficulty separating work from personal life. Collaboration can be more complicated, and company culture may be harder to develop and maintain. There are also concerns about career advancement, with some studies suggesting that remote workers may be overlooked for promotions compared to their in-office colleagues.
      
      The future of remote work will likely involve continued technological innovation. Virtual reality and augmented reality may create more immersive remote collaboration experiences. Artificial intelligence could further automate routine tasks and improve remote team coordination. As these technologies develop, the distinction between remote and in-person work may continue to blur.
      
      What's clear is that remote work has moved from the periphery to the center of conversations about the future of work. While not every job can be performed remotely, and not every person thrives in a remote environment, the flexibility to work from anywhere has become an expectation for many workers rather than a privilege. Organizations that can effectively navigate this new landscape—balancing flexibility with collaboration, autonomy with accountability—will be well-positioned for success in the evolving world of work.`,
        source: "Adapted from business and technology publications",
        hasImages: true,
        imageUrls: ["/placeholder.svg?height=300&width=500"],
      },
      questions: [
        {
          id: uuidv4(),
          type: "multiple-choice",
          text: 'According to the passage, who coined the term "telecommuting"?',
          points: 1,
          options: ["IBM researchers", "Jack Nilles", "Stanford University researchers", "Digital nomads"],
          correctAnswer: 1,
        },
        {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "Decide if the following statements are TRUE, FALSE, or NOT GIVEN according to the information in the passage.",
          points: 5,
          statements: [
            "Remote work was common before the COVID-19 pandemic.",
            "By May 2020, less than half of the U.S. labor force was working from home full-time.",
            "Most remote-capable employees prefer a hybrid work arrangement.",
            "Remote workers are always more productive than office-based workers.",
            "Virtual reality may improve remote collaboration in the future.",
          ],
          correctAnswers: ["false", "false", "true", "false", "true"],
        },
        {
          id: uuidv4(),
          type: "matching-headings",
          text: "Match the following headings to the paragraphs in the passage.",
          points: 5,
          paragraphs: ["Paragraphs 1-2", "Paragraphs 3-4", "Paragraphs 5-6", "Paragraphs 7-8", "Paragraphs 9-10"],
          headings: [
            "Early history and origins",
            "Technological developments enabling remote work",
            "The pandemic impact and post-pandemic trends",
            "Benefits and challenges",
            "Future outlook and conclusion",
          ],
          correctMatches: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
        },
        {
          id: uuidv4(),
          type: "completion",
          text: "Complete the sentences below using NO MORE THAN THREE WORDS from the passage.",
          points: 5,
          blanks: 5,
          correctAnswers: [
            "traffic congestion",
            "cloud computing",
            "digital nomads",
            "13% more productive",
            "feelings of isolation",
          ],
        },
      ],
    },
  ],
}

// Add a sample writing test
export const sampleWritingTest: Test = {
  id: "sample-writing-1",
  title: "IELTS Academic Writing Practice Test 1",
  type: "writing",
  description: "A complete IELTS Academic Writing test with 2 tasks.",
  totalDuration: 3600, // 60 minutes
  totalQuestions: 2,
  instructions:
    "You should spend about 20 minutes on Task 1 and 40 minutes on Task 2. Task 2 contributes twice as much to your final score as Task 1.",
  sections: [
    {
      id: uuidv4(),
      title: "Writing Tasks",
      description: "Complete both writing tasks.",
      duration: 3600, // 60 minutes
      questions: [
        {
          id: uuidv4(),
          type: "writing-task1",
          text: "Task 1",
          points: 8,
          prompt:
            "The chart below shows the number of men and women in further education in Britain in three periods and whether they were studying full-time or part-time. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          imageUrl: "/placeholder.svg?height=400&width=600",
          wordLimit: 150,
          sampleAnswer:
            "The bar chart illustrates the number of male and female students enrolled in full-time and part-time further education in Britain during three different time periods: 1970/71, 1980/81, and 1990/91.\n\nOverall, there was a significant increase in the number of students in further education over the given period, with female participation growing more dramatically than male participation, especially in part-time education.\n\nIn 1970/71, approximately 100,000 men were studying full-time, slightly more than women (about 80,000). For part-time studies, men significantly outnumbered women, with roughly 700,000 male students compared to 400,000 female students.\n\nBy 1980/81, full-time enrollment had increased for both genders, with women (approximately 200,000) surpassing men (about 150,000). Part-time enrollment showed a similar trend, with women's numbers increasing to around 800,000, while men's numbers decreased slightly to about 650,000.\n\nThe 1990/91 period saw further growth in female participation, with approximately 250,000 women in full-time education compared to about 200,000 men. The most dramatic change was in part-time education, where female students (approximately 1,200,000) vastly outnumbered male students (about 700,000).\n\nIn conclusion, while men initially dominated further education in Britain, women's participation grew substantially over the two decades, eventually outnumbering men in both full-time and part-time studies.",
        },
        {
          id: uuidv4(),
          type: "writing-task2",
          text: "Task 2",
          points: 12,
          prompt:
            "Some people believe that university students should pay all the cost of their studies. Others believe that university education should be free. Discuss both views and give your opinion.",
          wordLimit: 250,
          sampleAnswer:
            "The question of who should bear the financial burden of university education—students themselves or the government—is a topic of ongoing debate. This essay will examine both perspectives before presenting my own view.\n\nProponents of student-funded education argue that individuals are the primary beneficiaries of their degrees through higher lifetime earnings and better career prospects. They contend that when students invest financially in their education, they tend to be more committed to their studies and make more considered choices about their fields of study. Furthermore, in many countries, the tax burden is already high, and free university education would require either increased taxation or diverting funds from other essential public services.\n\nOn the other hand, advocates for free university education emphasize that society as a whole benefits from having a well-educated population. Graduates contribute to economic growth, innovation, and cultural development. They also typically pay higher taxes throughout their working lives, effectively repaying the initial investment. Moreover, tuition fees can create significant barriers to education for students from lower socioeconomic backgrounds, perpetuating inequality and wasting potential talent.\n\nIn my opinion, a balanced approach is most sensible. I believe that completely free university education is financially unsustainable for many countries and may not encourage students to value their education appropriately. However, placing the entire financial burden on students creates unacceptable barriers to education and ignores the societal benefits of an educated population.\n\nA more equitable system would involve moderate tuition fees combined with means-tested grants for disadvantaged students and income-contingent loan repayment schemes. This approach ensures that higher education remains accessible to all qualified students regardless of their financial background, while also acknowledging that both individuals and society share in the benefits of university education.\n\nIn conclusion, while both perspectives have merit, a hybrid funding model that distributes costs between students and the government represents the most fair and practical solution.",
        },
      ],
    },
  ],
}

