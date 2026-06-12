import { SignInButton, SignOutButton, useUser } from '@clerk/tanstack-start'

export function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 font-mono">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        
        <span className="text-emerald-500 font-bold text-sm"></span>

        <div className="flex items-center gap-4">
          {!isLoaded && (
            <span className="text-xs text-zinc-600 animate-pulse">loading...</span>
          )}

          {isLoaded && !isSignedIn && (
            <SignInButton>
              <button type="button" className="items-end text-xs text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer">
                sign in
              </button>
            </SignInButton>
          )}

          {isLoaded && isSignedIn && (
            <>
              <img
                src={user.imageUrl}
                alt="avatar"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-zinc-400">
                {user.firstName}
              </span>
              <SignOutButton>
                <button type="button" className="text-xs text-zinc-600 hover:text-red-400 transition-colors cursor-pointer">
                  sign out
                </button>
              </SignOutButton>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}