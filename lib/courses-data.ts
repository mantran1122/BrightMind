export type CourseItem = {
  id: string;
  title: string;
  rating: string;
  lessons: string;
  duration: string;
  students: string;
  instructor: string;
  price: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  outcomes: string[];
  isDeleted?: boolean;
  deletedAt?: string | null;
};

export const courses: CourseItem[] = [
  {
    id: "1",
    title: "Complete Digital Marketing Mastery Course",
    rating: "4.8",
    lessons: "40 lesson",
    duration: "4h 30m",
    students: "811 students",
    instructor: "Eleanor Pena",
    price: "$32.00",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
    level: "Intermediate",
    description:
      "Build practical digital marketing skills from campaign planning to optimization. This course combines strategy and real execution steps so parents and students can understand modern online growth clearly.",
    outcomes: [
      "Understand marketing funnels and audience mapping.",
      "Run structured social and content campaigns.",
      "Track conversion metrics and improve results weekly.",
    ],
  },
  {
    id: "2",
    title: "Entrepreneurship & Business Growth Strategies Course",
    rating: "4.7",
    lessons: "47 lesson",
    duration: "11h 30m",
    students: "423 students",
    instructor: "Guy Hawkins",
    price: "$40.00",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    level: "Advanced",
    description:
      "Learn to test business ideas, design simple business models, and plan growth in a sustainable way. Students practice turning concepts into actionable plans with clear milestones.",
    outcomes: [
      "Validate ideas using lightweight market research.",
      "Build a realistic growth roadmap and pricing strategy.",
      "Present business plans with confidence.",
    ],
  },
  {
    id: "3",
    title: "Full-Stack Web Development Bootcamp Program",
    rating: "4.9",
    lessons: "32 lesson",
    duration: "5h 00m",
    students: "934 students",
    instructor: "Leslie Alexander",
    price: "$25.00",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    level: "Intermediate",
    description:
      "A structured coding path that covers frontend and backend fundamentals with practical projects. Great for learners who want to build real applications from scratch.",
    outcomes: [
      "Build responsive interfaces with modern tooling.",
      "Create APIs and integrate data flows end-to-end.",
      "Deploy projects and collaborate in team workflows.",
    ],
  },
  {
    id: "4",
    title: "Graphic Design Essentials: From Beginner to Pro Guide",
    rating: "5",
    lessons: "50 lesson",
    duration: "12h 30m",
    students: "512 students",
    instructor: "Darrell Steward",
    price: "$40.00",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    level: "Beginner",
    description:
      "Master visual hierarchy, composition, and branding principles through project-based practice. Learners produce portfolio-ready design pieces with clear critiques.",
    outcomes: [
      "Apply typography and color principles effectively.",
      "Design social, print, and presentation assets.",
      "Create consistent personal or brand visual identity.",
    ],
  },
  {
    id: "5",
    title: "Personal Finance & Smart Investment Strategies.",
    rating: "4.6",
    lessons: "24 lesson",
    duration: "4h 30m",
    students: "256 students",
    instructor: "Cody Fisher",
    price: "$49.00",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
    level: "Beginner",
    description:
      "Build confidence managing money with age-appropriate finance habits and investment basics. Families can follow clear frameworks for budgeting and savings growth.",
    outcomes: [
      "Create monthly budgets and savings systems.",
      "Understand risk and return at a practical level.",
      "Develop long-term financial discipline.",
    ],
  },
  {
    id: "6",
    title: "AI & Machine Learning: A Complete Guide Training",
    rating: "4.8",
    lessons: "40 lesson",
    duration: "5h 40m",
    students: "543 students",
    instructor: "Kathryn Murphy",
    price: "$26.00",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    level: "Advanced",
    description:
      "Explore AI concepts in a guided, practical way with examples and hands-on mini projects. The training focuses on intuition and real-world applications, not just theory.",
    outcomes: [
      "Understand core ML concepts and model workflows.",
      "Apply AI tools to solve practical learning tasks.",
      "Evaluate model quality and common limitations.",
    ],
  },
];

export function getCourseById(id: string) {
  return courses.find((course) => course.id === id) ?? null;
}
