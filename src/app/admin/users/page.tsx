'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { supabaseAuth } from '@/lib/auth/supabase-auth'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { 
  Users, 
  LogOut, 
  Trash2,
  ChevronLeft,
  Loader2,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type AdminUser = {
  id: string
  email: string
  created_at: string
  role: string
}

export default function AdminUsers() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserError, setCreateUserError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Έλεγχος αν το supabaseAuth είναι διαθέσιμο
      if (!supabaseAuth) {
        throw new Error('Authentication service is not available')
      }
      
      // Χρησιμοποιούμε τη λειτουργία του Supabase για ανάκτηση χρηστών
      // Σημείωση: Αυτό απαιτεί Supabase service role key για να λειτουργήσει
      const { data, error } = await supabaseAuth.auth.admin.listUsers()
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Φιλτράρουμε μόνο τους χρήστες με ρόλο admin
      // Χρησιμοποιούμε τη σωστή δομή για πρόσβαση στα metadata
      const adminUsers = data.users.filter((supabaseUser: User) => {
        const appRole = supabaseUser.app_metadata?.role;
        const userRole = supabaseUser.user_metadata?.role;
        return appRole === 'admin' || userRole === 'admin';
      });
      
      // Μετατροπή των χρηστών Supabase σε AdminUser τύπο για εμφάνιση
      setUsers(adminUsers.map((supabaseUser: User) => ({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        created_at: supabaseUser.created_at,
        role: (supabaseUser.app_metadata?.role || supabaseUser.user_metadata?.role || 'user') as string
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateUserLoading(true)
    setCreateUserError(null)
    
    try {
      // Έλεγχος αν το supabaseAuth είναι διαθέσιμο
      if (!supabaseAuth) {
        throw new Error('Authentication service is not available')
      }
      
      // Χρήση του Supabase Auth API για τη δημιουργία νέου χρήστη
      const { error } = await supabaseAuth.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true, // Επιβεβαίωση του email αυτόματα
        app_metadata: { role: 'admin' },
        user_metadata: { role: 'admin' }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Επιτυχής δημιουργία
      setIsDialogOpen(false)
      setNewUserEmail('')
      setNewUserPassword('')
      
      // Ανανέωση της λίστας χρηστών
      fetchUsers()
    } catch (err) {
      setCreateUserError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setCreateUserLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      setLoading(true)
      
      // Έλεγχος αν το supabaseAuth είναι διαθέσιμο
      if (!supabaseAuth) {
        throw new Error('Authentication service is not available')
      }
      
      // Χρήση του Supabase Auth API για τη διαγραφή χρήστη
      const { error } = await supabaseAuth.auth.admin.deleteUser(userId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Ανανέωση της λίστας χρηστών
      fetchUsers()
    } catch (err) {
      alert('Error deleting user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className={cn(
          "flex items-center justify-between py-4 border-b mb-8",
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          <div className="flex items-center space-x-4">
            <Users className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
            <h1 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Admin Users
            </h1>
            {user && (
              <span className={cn(
                "text-sm px-2 py-1 rounded-md",
                theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              )}>
                {user.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin"
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark' 
                  ? 'text-red-400 hover:text-red-300 hover:bg-gray-800' 
                  : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
        
        <div className="mb-8 flex justify-between items-center">
          <h2 className={cn(
            "text-2xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Admin Users
          </h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                New Admin User
              </Button>
            </DialogTrigger>
            <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}>
              <DialogHeader>
                <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Create New Admin User
                </DialogTitle>
                <DialogDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Add a new user with admin privileges.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateUser}>
                {createUserError && (
                  <div className="p-3 mb-4 rounded bg-red-500 text-white text-sm">
                    {createUserError}
                  </div>
                )}
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label 
                      htmlFor="email"
                      className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className={cn(
                        "w-full p-2 rounded border",
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label 
                      htmlFor="password"
                      className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className={cn(
                        "w-full p-2 rounded border",
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createUserLoading}
                    className="w-full gap-2"
                  >
                    {createUserLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className={cn(
            "p-4 rounded-md mb-6",
            theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
          )}>
            {error}
          </div>
        ) : (
          <div className={cn(
            "border rounded-lg overflow-hidden",
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          )}>
            <table className="w-full">
              <thead className={cn(
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              )}>
                <tr>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Email
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Created At
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Role
                  </th>
                  <th className={cn(
                    "px-6 py-3 text-right text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={cn(
                        "px-6 py-4 text-center",
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}
                    >
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  users.map((adminUser, index) => (
                    <tr 
                      key={adminUser.id}
                      className={cn(
                        index !== users.length - 1 && (
                          theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'
                        )
                      )}
                    >
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm font-medium",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {adminUser.email}
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>
                        {new Date(adminUser.created_at).toLocaleString()}
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          adminUser.role === 'admin'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {adminUser.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteUser(adminUser.id)}
                            className={cn(
                              "p-1 rounded-md",
                              theme === 'dark' 
                                ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                                : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
                            )}
                            disabled={adminUser.id === user?.id} // Δεν επιτρέπουμε τη διαγραφή του τρέχοντος χρήστη
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}