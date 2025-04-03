"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserSession, getCourseLinks } from "@/lib/actions"
import { LogOut } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courseLinks, setCourseLinks] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getUserSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session)

        if (session) {
          const links = await getCourseLinks(session.plan_type, session.category)
          setCourseLinks(links)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>
                    {user?.first_name} {user?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Institution:</span>
                  <span>{user?.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Plan Type:</span>
                  <span>{user?.plan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{user?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Application Number:</span>
                  <span>{user?.application_number}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Course Links</CardTitle>
            </CardHeader>
            <CardContent>
              {courseLinks ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Course Materials</h3>
                    <a
                      href={courseLinks.materials_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Access Materials
                    </a>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Live Sessions</h3>
                    <a
                      href={courseLinks.live_sessions_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Live Sessions
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Course links will be available soon.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Invitation Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Share this link with your friends to invite them to join U-CAN Academy:</p>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
          type="text"
          readOnly
          value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user?.application_number}`}
          className="flex-1 p-2 border rounded-md bg-gray-50"
              />
              <Button
          className="w-full sm:w-auto"
          onClick={() => {
            navigator.clipboard.writeText(
              `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user?.application_number}`,
            )
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
              >
          {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
       <footer className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} U-CAN Academy™
        </footer>
    </div>
  )
}

