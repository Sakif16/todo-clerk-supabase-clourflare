import { SignInButton, SignOutButton, useSession, useUser } from '@clerk/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { createSupabaseClient } from '../lib/supabase'

export const Route = createFileRoute('/')({
  component: TodoApp,
})

type Todo = {
  id: number
  title: string
  is_complete: boolean
}

function TodoApp() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { session } = useSession()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(
    () => createSupabaseClient(() => session?.getToken() ?? Promise.resolve(null)),
    [session]
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }

    async function fetchTodos() {
      const { data } = await supabase.from('todos').select('*').order('id')
      setTodos(data ?? [])
      setLoading(false)
    }

    fetchTodos()
  }, [isLoaded, isSignedIn, supabase])

  async function addTodo() {
    if (!newTitle.trim()) return
    const { data, error } = await supabase
      .from('todos')
      .insert({ title: newTitle.trim() })
      .select()
      .single()
    if (!error && data) {
      setTodos(prev => [...prev, data])
      setNewTitle('')
    }
  }

  async function toggleTodo(todo: Todo) {
    const { data } = await supabase
      .from('todos')
      .update({ is_complete: !todo.is_complete })
      .eq('id', todo.id)
      .select()
      .single()
    if (data) setTodos(prev => prev.map(t => t.id === todo.id ? data : t))
  }

  async function deleteTodo(id: number) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  if (!isLoaded) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <span className="text-zinc-500 font-mono text-sm animate-pulse">initializing...</span>
    </div>
  )

  if (!isSignedIn) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="font-mono text-xs text-emerald-500 tracking-widest uppercase mb-2"></p>
        <h1 className="font-mono text-3xl font-bold text-zinc-100">get things done.</h1>
        <p className="font-mono text-sm text-zinc-500 mt-2">sign in to access your tasks</p>
      </div>
      <SignInButton>
        <button
          type="button"
          className="font-mono text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-2 transition-colors cursor-pointer"
        >
          sign in with google →
        </button>
      </SignInButton>
    </div>
  )

  const completed = todos.filter(t => t.is_complete).length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-emerald-500 tracking-widest uppercase"></p>
            <h1 className="text-2xl font-bold text-zinc-100 mt-0.5">your tasks</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 truncate max-w-[160px]">
              {user.emailAddresses[0]?.emailAddress}
            </p>
            <SignOutButton>
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors mt-1 cursor-pointer"
              >
                sign out
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-8">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="new task..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 outline-none px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition-colors"
          />
          <button
            type="button"
            onClick={addTodo}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 text-sm transition-colors cursor-pointer"
          >
            add
          </button>
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <p className="text-xs text-zinc-600 mb-4">
            {completed}/{todos.length} completed
          </p>
        )}

        {/* List */}
        {loading && (
          <p className="text-sm text-zinc-600 animate-pulse">fetching tasks...</p>
        )}

        {!loading && todos.length === 0 && (
          <p className="text-sm text-zinc-600 border border-dashed border-zinc-800 px-4 py-6 text-center">
            no tasks yet. add one above.
          </p>
        )}

        <ul className="space-y-2">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-3 group hover:border-zinc-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.is_complete}
                onChange={() => toggleTodo(todo)}
                className="accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className={`flex-1 text-sm transition-colors ${
                todo.is_complete ? 'line-through text-zinc-600' : 'text-zinc-200'
              }`}>
                {todo.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-sm cursor-pointer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}