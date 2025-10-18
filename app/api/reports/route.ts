import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidLocation } from "@/utils/validation";
import { calculateInitialValidity } from "@/utils/time";
import { PROXIMITY_RADIUS_METERS } from "@/lib/constants";

/**
 * GET /api/reports - Fetch all active reports
 */
export async function GET() {
  try {
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .gt("validity_expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports - Create a new report or get nearby reports
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, action } = body;

    // Validate location
    if (!isValidLocation(latitude, longitude)) {
      return NextResponse.json(
        { success: false, error: "Invalid location coordinates" },
        { status: 400 }
      );
    }

    // Check for nearby reports
    if (action === "check_nearby") {
      const { data: nearbyReports, error } = await supabase.rpc(
        "get_nearby_reports",
        {
          user_lat: latitude,
          user_lng: longitude,
          radius_meters: PROXIMITY_RADIUS_METERS,
        }
      );

      if (error) throw error;

      return NextResponse.json({
        success: true,
        reports: nearbyReports || [],
      });
    }

    // Create new report
    if (action === "create") {
      const validityExpiresAt = calculateInitialValidity();

      const { data: report, error } = await supabase
        .from("reports")
        .insert({
          latitude,
          longitude,
          validity_expires_at: validityExpiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, report }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

