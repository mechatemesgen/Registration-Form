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
import { getAllUsers, deleteUser, updateUser, checkAdminStatus } from "@/lib/actions"
import { Pencil, Trash2, LogOut, Plus } from "lucide-react"

export default function AdminPanel() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    institution: "",
    planType: "",
    category: "",
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
        fetchUsers()
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/login")
      }
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    // Update categories based on plan type for new user
    let newCategories: string[] = []
    switch (newUser.planType) {
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
  }, [newUser.planType])

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id)
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (user: any) => {
    setEditUser({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      institution: user.institution,
      planType: user.plan_type,
      category: user.category,
    })
    setIsDialogOpen(true)
  }

  const handleUpdate = async () => {
    try {
      await updateUser(editUser)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      setIsDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async () => {
    try {
      // Validate phone number
      if (!newUser.phone.match(/^(09|07)\d{8}$/)) {
        toast({
          title: "Invalid phone number",
          description: "Phone number must start with 09 or 07 and be 10 digits long",
          variant: "destructive",
        })
        return
      }

      const result = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          institution: newUser.institution,
          planType: newUser.planType,
          category: newUser.category,
        }),
      })

      const data = await result.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User added successfully",
        })
        setNewUser({
          firstName: "",
          lastName: "",
          phone: "",
          institution: "",
          planType: "",
          category: "",
        })
        setIsDialogOpen(false)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      })
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
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex space-x-4">
            <Dialog
              open={isDialogOpen && !editUser}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) setEditUser(null)
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Select
                      value={newUser.institution}
                      onValueChange={(value) => setNewUser({ ...newUser, institution: value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select
                      value={newUser.planType}
                      onValueChange={(value) => setNewUser({ ...newUser, planType: value })}
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
                      disabled={!newUser.planType || categories.length === 0}
                      value={newUser.category}
                      onValueChange={(value) => setNewUser({ ...newUser, category: value })}
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
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddUser}>Add User</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDialogOpen && !!editUser}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) setEditUser(null)
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                {editUser && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editUser.firstName}
                          onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editUser.lastName}
                          onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editUser.phone}
                        onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Select
                        value={editUser.institution}
                        onValueChange={(value) => setEditUser({ ...editUser, institution: value })}
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
                    <div className="space-y-2">
                      <Label htmlFor="planType">Plan Type</Label>
                      <Select
                        value={editUser.planType}
                        onValueChange={(value) => setEditUser({ ...editUser, planType: value })}
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
                      <Input
                        id="category"
                        value={editUser.category}
                        onChange={(e) => setEditUser({ ...editUser, category: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleUpdate}>Update User</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.application_number}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.institution}</TableCell>
                      <TableCell>{user.plan_type}</TableCell>
                      <TableCell>{user.category}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No users found
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

