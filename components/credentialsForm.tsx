'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CredentialsFormProps {
  csrfToken?: string
}

export function CredentialsForm(props: CredentialsFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const signInResponse = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false
    })

    if (signInResponse && !signInResponse.error) {
      //Redirect to homepage (/timeline)
      router.push('/timeline')
    } else {
      console.log('Error: ', signInResponse)
      setError('Your Email or Password is wrong!')
    }
  }

  return (
    <form
      className="mt-8 flex w-full flex-col text-xl font-semibold text-black"
      onSubmit={handleSubmit}
    >
      {error && (
        <span className="mb-2 rounded-md bg-red-500 p-4 text-lg font-semibold text-white">
          {error}
        </span>
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="mb-4 w-full rounded-md border border-gray-300 p-4"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="mb-4 w-full rounded-md border border-gray-300 p-4"
      />

      <button
        type="submit"
        className="focus:shadow-outline mt-4 h-12 w-full rounded-lg bg-blue-600 px-6 text-lg text-white transition-colors duration-150 hover:bg-blue-700"
      >
        Log in
      </button>
    </form>
  )
}
