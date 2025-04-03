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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Login to Your Account</h1>

        <div className="mb-8 space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} U-CAN Academy™
        </footer>
      </form>
    </div>
  )
}
