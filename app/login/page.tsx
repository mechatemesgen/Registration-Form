"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { loginUser } from "@/lib/actions"

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate phone number
      if (!phone.match(/^(09|07)\d{8}$/)) {
        toast({
          title: "Invalid phone number",
          description: "Phone number must start with 09 or 07 and be 10 digits long",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const result = await loginUser(phone)

      if (result.success) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Phone number not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="mt-1">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="09xxxxxxxx or 07xxxxxxxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

