import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { checkAdminStatus, sendTelegramMessage } from "@/lib/actions"

// Generate a random application number
function generateApplicationNumber() {
  return `UCA${Math.floor(Math.random() * 90000000) + 10000000}`
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminStatus()

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { firstName, lastName, phone, institution, planType, category } = body

    // Validate phone number
    if (!phone.match(/^(09|07)\d{8}$/)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Check if phone already exists
    const { data: existingUser } = await supabaseAdmin.from("users").select("*").eq("phone", phone).single()

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Phone number already registered" }, { status: 400 })
    }

    // Generate application number
    const applicationNumber = generateApplicationNumber()

    // Insert user into database
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        institution: institution,
        plan_type: planType,
        category: category,
        application_number: applicationNumber,
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to Telegram
    const message =
      `🎉 New Registration (Added by Admin) 🎉\n\n` +
      `Application Number: ${applicationNumber}\n` +
      `Name: ${firstName} ${lastName}\n` +
      `Phone: ${phone}\n` +
      `Institution: ${institution}\n` +
      `Plan: ${planType}\n` +
      `Category: ${category}`

    await sendTelegramMessage(message)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error adding user:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

