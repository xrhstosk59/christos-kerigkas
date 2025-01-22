const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5/CSS3'],
    backend: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Supabase', 'Drizzle ORM'],
    tools: ['Git', 'VS Code', 'Docker', 'REST APIs', 'Telegram Bot API'],
    trading: ['Technical Analysis', 'Bot Development', 'Data Mining', 'Machine Learning']
  }
  
  export function Skills() {
    return (
      <section id="skills" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Skills & Technologies
            </h2>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 mb-4">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
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