"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserByPhone } from "@/lib/actions"

export default function Success() {
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (phone) {
        try {
          const userData = await getUserByPhone(phone)
          setUser(userData)
        } catch (error) {
          console.error("Error fetching user:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [phone])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">User not found</h2>
          <p className="mb-4">We couldn't find your registration information.</p>
          <Link href="/register">
            <Button>Register Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">🎉 <br /> Registration Successful!</h2>
          <p className="text-lg font-semibold text-gray-700 mb-4 text-center">Welcome, {user.first_name}!</p>
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Your application number: <span className="font-medium">{user.application_number}</span>
            </p>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
            You can access your course materials from the Dashboard.
            </p>
            <div className="flex justify-center mt-6">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}