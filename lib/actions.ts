"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "./supabase-admin"

// Generate a random application number
function generateApplicationNumber() {
  return `UCA${Math.floor(Math.random() * 90000000) + 10000000}`
}

// Send message to Telegram
export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    const data = await response.json()
    if (!data.ok) {
      console.error("Telegram API Error:", data)
    }
    return data
  } catch (error) {
    console.error("Error sending Telegram message:", error)
  }
}

// Register a new user
export async function registerUser(formData: any) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()

  try {
    // Check if phone already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("phone")
      .eq("phone", formData.phone)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing user:", checkError)
    }

    if (existingUser) {
      return { success: false, error: "Phone number already registered" }
    }

    // Generate application number
    const applicationNumber = generateApplicationNumber()

    // Insert user into database using service role to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        institution: formData.institution,
        plan_type: formData.planType,
        category: formData.category,
        application_number: applicationNumber,
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to Telegram
    const message =
      `🎉 New Registration 🎉\n\n` +
      `Application Number: ${applicationNumber}\n` +
      `Name: ${formData.firstName} ${formData.lastName}\n` +
      `Phone: ${formData.phone}\n` +
      `Institution: ${formData.institution}\n` +
      `Plan: ${formData.planType}\n` +
      `Category: ${formData.category}`

    await sendTelegramMessage(message)

    // Set session cookie
    cookies().set("user_session", JSON.stringify(data), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: "lax",
    })

    return { success: true, data }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: error.message }
  }
}

// Login a user
export async function loginUser(phone: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()

  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("phone", phone).single()

    if (error) throw error

    if (!data) {
      return { success: false, error: "User not found" }
    }

    // Set session cookie
    cookies().set("user_session", JSON.stringify(data), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: "lax",
    })

    return { success: true, data }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message }
  }
}

// Get user session
export async function getUserSession() {
  const cookieStore = cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return null
  }

  try {
    return JSON.parse(userSession.value)
  } catch (error) {
    return null
  }
}

// Get user by phone
export async function getUserByPhone(phone: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()

  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("phone", phone).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

// Get course links
export async function getCourseLinks(planType: string, category: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()

  try {
    // First try to get an exact match
    const { data: exactMatch, error: exactMatchError } = await supabaseAdmin
      .from("course_links")
      .select("*")
      .eq("plan_type", planType)
      .eq("category", category)
      .maybeSingle()

    if (exactMatchError) {
      console.error("Error fetching exact match course links:", exactMatchError)
    }

    // If we found an exact match, return it
    if (exactMatch) {
      return exactMatch
    }

    // If no exact match, try to find a default for the plan type
    const { data: planDefault, error: planDefaultError } = await supabaseAdmin
      .from("course_links")
      .select("*")
      .eq("plan_type", planType)
      .eq("category", "Default")
      .maybeSingle()

    if (planDefaultError) {
      console.error("Error fetching plan default course links:", planDefaultError)
    }

    // If we found a plan default, return it
    if (planDefault) {
      return planDefault
    }

    // If no plan default, return a generic default or null
    const { data: genericDefault, error: genericDefaultError } = await supabaseAdmin
      .from("course_links")
      .select("*")
      .eq("plan_type", "Default")
      .eq("category", "Default")
      .maybeSingle()

    if (genericDefaultError) {
      console.error("Error fetching generic default course links:", genericDefaultError)
    }

    return genericDefault || null
  } catch (error) {
    console.error("Error fetching course links:", error)
    return null
  }
}

// Check if user is admin
export async function checkAdminStatus() {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const session = await getUserSession()

  if (!session) {
    return false
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", session.email || "")
      .maybeSingle()

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Get all users (admin only)
export async function getAllUsers() {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    return []
  }

  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Delete user (admin only)
export async function deleteUser(id: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabaseAdmin.from("users").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Update user (admin only)
export async function updateUser(userData: any) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        institution: userData.institution,
        plan_type: userData.planType,
        category: userData.category,
      })
      .eq("id", userData.id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Get all course links (admin only)
export async function getAllCourseLinks() {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    return []
  }

  try {
    const { data, error } = await supabaseAdmin.from("course_links").select("*").order("plan_type", { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching course links:", error)
    return []
  }
}

// Add course link (admin only)
export async function addCourseLink(linkData: any) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabaseAdmin.from("course_links").insert({
      plan_type: linkData.planType,
      category: linkData.category,
      materials_link: linkData.materialsLink,
      live_sessions_link: linkData.liveSessionsLink,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error adding course link:", error)
    throw error
  }
}

// Update course link (admin only)
export async function updateCourseLink(linkData: any) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabaseAdmin
      .from("course_links")
      .update({
        materials_link: linkData.materialsLink,
        live_sessions_link: linkData.liveSessionsLink,
      })
      .eq("id", linkData.id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating course link:", error)
    throw error
  }
}

// Delete course link (admin only)
export async function deleteCourseLink(id: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient()
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  try {
    const { error } = await supabaseAdmin.from("course_links").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting course link:", error)
    throw error
  }
}

