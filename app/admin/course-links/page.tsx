"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getAllCourseLinks, addCourseLink, updateCourseLink, deleteCourseLink, checkAdminStatus } from "@/lib/actions"
import { Pencil, Trash2, Plus } from "lucide-react"

export default function CourseLinksAdmin() {
  const router = useRouter()
  const { toast } = useToast()
  const [courseLinks, setCourseLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editLink, setEditLink] = useState<any>(null)
  const [newLink, setNewLink] = useState({
    planType: "",
    category: "",
    materialsLink: "",
    liveSessionsLink: "",
  })
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await checkAdminStatus()

        if (!adminStatus) {
          router.push("/login")
          return
        }

        setIsAdmin(true)
        fetchCourseLinks()
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/login")
      }
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    // Update categories based on plan type
    let newCategories: string[] = []
    switch (newLink.planType) {
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
  }, [newLink.planType])

  const fetchCourseLinks = async () => {
    try {
      const links = await getAllCourseLinks()
      setCourseLinks(links)
    } catch (error) {
      console.error("Error fetching course links:", error)
      toast({
        title: "Error",
        description: "Failed to fetch course links",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async () => {
    try {
      await addCourseLink({
        planType: newLink.planType,
        category: newLink.category,
        materialsLink: newLink.materialsLink,
        liveSessionsLink: newLink.liveSessionsLink,
      })

      toast({
        title: "Success",
        description: "Course link added successfully",
      })

      setNewLink({
        planType: "",
        category: "",
        materialsLink: "",
        liveSessionsLink: "",
      })

      setIsDialogOpen(false)
      fetchCourseLinks()
    } catch (error) {
      console.error("Error adding course link:", error)
      toast({
        title: "Error",
        description: "Failed to add course link",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (link: any) => {
    setEditLink({
      id: link.id,
      planType: link.plan_type,
      category: link.category,
      materialsLink: link.materials_link,
      liveSessionsLink: link.live_sessions_link,
    })
    setIsDialogOpen(true)
  }

  const handleUpdate = async () => {
    try {
      await updateCourseLink(editLink)

      toast({
        title: "Success",
        description: "Course link updated successfully",
      })

      setIsDialogOpen(false)
      fetchCourseLinks()
    } catch (error) {
      console.error("Error updating course link:", error)
      toast({
        title: "Error",
        description: "Failed to update course link",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course link?")) {
      try {
        await deleteCourseLink(id)

        toast({
          title: "Success",
          description: "Course link deleted successfully",
        })

        fetchCourseLinks()
      } catch (error) {
        console.error("Error deleting course link:", error)
        toast({
          title: "Error",
          description: "Failed to delete course link",
          variant: "destructive",
        })
      }
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="mb-4">You do not have permission to access this page.</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Links Management</h1>
          <div className="flex space-x-4">
            <Dialog
              open={isDialogOpen && !editLink}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) setEditLink(null)
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course Link</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select
                      value={newLink.planType}
                      onValueChange={(value) => setNewLink({ ...newLink, planType: value })}
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      disabled={!newLink.planType || categories.length === 0}
                      value={newLink.category}
                      onValueChange={(value) => setNewLink({ ...newLink, category: value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="materialsLink">Materials Link</Label>
                    <Input
                      id="materialsLink"
                      value={newLink.materialsLink}
                      onChange={(e) => setNewLink({ ...newLink, materialsLink: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liveSessionsLink">Live Sessions Link</Label>
                    <Input
                      id="liveSessionsLink"
                      value={newLink.liveSessionsLink}
                      onChange={(e) => setNewLink({ ...newLink, liveSessionsLink: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddLink}>Add Link</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDialogOpen && !!editLink}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) setEditLink(null)
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Course Link</DialogTitle>
                </DialogHeader>
                {editLink && (
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="planType">Plan Type</Label>
                      <Input
                        id="planType"
                        value={editLink.planType}
                        onChange={(e) => setEditLink({ ...editLink, planType: e.target.value })}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editLink.category}
                        onChange={(e) => setEditLink({ ...editLink, category: e.target.value })}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materialsLink">Materials Link</Label>
                      <Input
                        id="materialsLink"
                        value={editLink.materialsLink}
                        onChange={(e) => setEditLink({ ...editLink, materialsLink: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="liveSessionsLink">Live Sessions Link</Label>
                      <Input
                        id="liveSessionsLink"
                        value={editLink.liveSessionsLink}
                        onChange={(e) => setEditLink({ ...editLink, liveSessionsLink: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleUpdate}>Update Link</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Materials Link</TableHead>
                  <TableHead>Live Sessions Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseLinks.length > 0 ? (
                  courseLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>{link.plan_type}</TableCell>
                      <TableCell>{link.category}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a
                          href={link.materials_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.materials_link}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a
                          href={link.live_sessions_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.live_sessions_link}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(link)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(link.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No course links found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

