import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="">
      <div className=''>
        <SignIn />
      </div>
    </main>  
  )
}