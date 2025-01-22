export function Experience() {
    const projects = [
      {
        name: 'Real Estate Platform',
        description: 'Full-stack web application for real estate listings',
        tech: 'Next.js, React, Supabase, Drizzle, Tailwind CSS, PostgreSQL',
        status: 'In Development'
      },
      {
        name: 'Sniper4Crypto',
        description: 'Advanced crypto analysis tool using data mining and machine learning to detect trending meme tokens',
        tech: 'Python, Scikit-learn, Telegram Bot API, MongoDB/PostgreSQL',
        status: 'Active'
      },
      {
        name: 'Trading Bot',
        description: 'Automated trading system with market analysis, strategy implementation, and real-time notifications',
        tech: 'Python, Exchange APIs, Telegram Bot API',
        status: 'Active'
      }
    ]
  
    return (
      <section id="experience" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Experience & Projects
            </h2>
            <div className="mt-16 space-y-8">
              {projects.map((project) => (
                <div
                  key={project.name}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                    <span className="ml-3 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      {project.status}
                    </span>
                  </h3>
                  <p className="mt-2 text-base text-gray-600">{project.description}</p>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500">
                      Technologies: {project.tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }