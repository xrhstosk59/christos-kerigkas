// src/components/skills.tsx
'use client'

import { useTheme } from './themeprovider'

const skills = {
  frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5/CSS3'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Supabase', 'Drizzle ORM'],
  tools: ['Git', 'VS Code', 'Docker', 'REST APIs', 'Telegram Bot API'],
  trading: ['Technical Analysis', 'Bot Development', 'Data Mining', 'Machine Learning']
}

export function Skills() {
  const { theme } = useTheme()
  
  return (
    <section id="skills" className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Skills & Technologies
          </h2>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className={`border rounded-lg p-6 ${
                theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'
              }`}>
                <h3 className={`text-lg font-semibold capitalize mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                          : 'bg-blue-50 text-blue-700'
                      } transition-colors duration-200`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}