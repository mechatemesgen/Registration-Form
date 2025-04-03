import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">U-CAN Academy</h1>
          <p className="mt-2 text-gray-600">Welcome to the registration portal</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link href="/register" passHref>
            <Button className="w-full">Register</Button>
          </Link>
          <Link href="/login" passHref>
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

