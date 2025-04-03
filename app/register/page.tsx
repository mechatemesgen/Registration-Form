"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { registerUser } from "@/lib/actions"

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    institution: "",
    planType: "",
    category: "",
    agreedToTerms: false,
  })

  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Update categories based on plan type
    let newCategories: string[] = []
    switch (formData.planType) {
      case "freshman-plus":
      case "freshman-exam":
        newCategories = ["Semester 1", "Semester 2", "Both Semesters"]
        break
      case "uat":
        newCategories = ["UAT Exam Prep"]
        break
      case "stu-exam":
        newCategories = ["STU Exam Prep"]
        break
      case "coc-exam":
        newCategories = ["Software Engineering", "Architecture", "Medicine"]
        break
      case "gat-exam":
        newCategories = ["GAT Exam Prep"]
        break
      case "remedial":
        newCategories = ["Remedial Prep"]
        break
      case "entrance-esslc":
        newCategories = ["ESSLC Exam Prep"]
        break
      default:
        newCategories = []
    }
    setCategories(newCategories)
  }, [formData.planType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate phone number
      if (!formData.phone.match(/^(09|07)\d{8}$/)) {
        toast({
          title: "Invalid phone number",
          description: "Phone number must start with 09 or 07 and be 10 digits long",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const result = await registerUser(formData)

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "You have been registered successfully",
        })
        router.push(`/success?phone=${formData.phone}`)
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "An error occurred during registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">U-CAN Academy Registration Form</h1>

        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                required
                placeholder="09xxxxxxxx or 07xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Select
                value={formData.institution}
                onValueChange={(value) => setFormData({ ...formData, institution: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AASTU">AASTU</SelectItem>
                  <SelectItem value="ABAY MINCH COLLEGE">ABAY MINCH COLLEGE</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Plan Type */}
        <div className="mb-8 space-y-2">
          <Label htmlFor="planType">Plan Type</Label>
          <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freshman-plus">Freshman Plus</SelectItem>
              <SelectItem value="freshman-exam">Freshman Exam</SelectItem>
              <SelectItem value="uat">UAT</SelectItem>
              <SelectItem value="stu-exam">STU Exam</SelectItem>
              <SelectItem value="coc-exam">COC Exam</SelectItem>
              <SelectItem value="gat-exam">GAT Exam</SelectItem>
              <SelectItem value="remedial">Remedial</SelectItem>
              <SelectItem value="entrance-esslc">Entrance (ESSLC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="mb-8 space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            disabled={!formData.planType || categories.length === 0}
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Terms */}
        <div className="mb-8 flex items-center space-x-2">
          <Checkbox
            id="terms"
            required
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a
              href="https://telegra.ph/U-CAN-Academy-Terms-and-Conditions-11-09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Terms and Conditions
            </a>
          </Label>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Register Now"}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
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

