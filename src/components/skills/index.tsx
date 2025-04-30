// /src/components/skills/index.tsx
import { cn } from "@/lib/utils"
import SkillsList from './skills-list'

// Τα skills είναι σταθερά δεδομένα που μπορούν να οριστούν εδώ
// καθώς δεν αλλάζουν συχνά και δεν χρειάζονται αλληλεπίδραση
const skills = {
  frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5/CSS3'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Supabase', 'Drizzle ORM'],
  tools: ['Git', 'VS Code', 'Docker', 'REST APIs', 'Telegram Bot API'],
  trading: ['Technical Analysis', 'Bot Development', 'Data Mining', 'Machine Learning']
}

interface SkillsProps {
  theme: 'light' | 'dark'
}

// Server Component για skills
export default function Skills({ theme }: SkillsProps) {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
      <h2 className={cn(
        "text-3xl font-bold tracking-tight sm:text-4xl",
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      )}>
        Skills & Technologies
      </h2>
      
      {/* Περνάμε τα skills στο client component */}
      <SkillsList skills={skills} theme={theme} />
    </div>
  )
}