import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Η σελίδα δεν βρέθηκε</h2>
      <p className="mb-8">Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.</p>
      <Link 
        href="/" 
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Επιστροφή στην αρχική
      </Link>
    </div>
  )
}