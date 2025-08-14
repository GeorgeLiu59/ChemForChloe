import { Beaker, Github } from 'lucide-react'

export default function Header() {
  return (
    <header className="chemistry-gradient text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Beaker size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Chem for Chloe</h1>
              <p className="text-blue-100 text-sm">AI Chemistry Assistant</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <a 
              href="https://github.com/GeorgeLiu59" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-200 transition-colors"
            >
              <Github size={20} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
