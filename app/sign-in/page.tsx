import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import googleLogo from '@/public/google.png'
import githubLogo from '@/public/github.png'
import {
  CredentialsSignInButton,
  GithubSignInButton,
  GoogleSignInButton
} from '@/components/authButtons'
import { CredentialsForm } from '@/components/credentialsForm'

export default async function SignInPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-2">
      <div className="mt-10 flex flex-col items-center p-10 shadow-md">
        <h1 className="mb-4 mt-10 text-4xl font-bold">Sign In</h1>
        <GoogleSignInButton />
        <GithubSignInButton />
        <span className="mt-8 text-center text-2xl font-semibold text-white">
          Or
        </span>
        <CredentialsSignInButton />
        <CredentialsForm />
      </div>
    </div>
  )

  //   return (
  //     <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
  //       <LoginButton provider="github" />
  //       <LoginButton provider="google" />
  //     </div>
  //   )
}
