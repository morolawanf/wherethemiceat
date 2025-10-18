import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidUUID, isValidComment } from "@/utils/validation";
import { COMMENTS_PER_PAGE } from "@/lib/constants";

/**
 * GET /api/comments - Fetch comments for a report
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const report_id = searchParams.get("report_id");
    const page = parseInt(searchParams.get("page") || "0");

    if (!report_id || !isValidUUID(report_id)) {
      return NextResponse.json(
        { success: false, error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const from = page * COMMENTS_PER_PAGE;
    const to = from + COMMENTS_PER_PAGE - 1;

    const { data: comments, error, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("report_id", report_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      comments,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments - Create a comment or report a comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, report_id, content, fingerprint_hash, ip_hash, comment_id } = body;

    if (action === "create") {
      // Validate
      if (!isValidUUID(report_id)) {
        return NextResponse.json(
          { success: false, error: "Invalid report ID" },
          { status: 400 }
        );
      }

      const validation = isValidComment(content);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Create comment
      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          report_id,
          content,
          fingerprint_hash,
          ip_hash,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, comment }, { status: 201 });
    } else if (action === "report") {
      // Report a comment
      if (!isValidUUID(comment_id)) {
        return NextResponse.json(
          { success: false, error: "Invalid comment ID" },
          { status: 400 }
        );
      }

      // Check if user already reported this comment
      const { data: existingReport } = await supabase
        .from("comment_reports")
        .select("*")
        .eq("comment_id", comment_id)
        .eq("fingerprint_hash", fingerprint_hash)
        .eq("ip_hash", ip_hash)
        .single();

      if (existingReport) {
        return NextResponse.json(
          { success: false, error: "You already reported this comment" },
          { status: 400 }
        );
      }

      // Create report
      const { error } = await supabase.from("comment_reports").insert({
        comment_id,
        fingerprint_hash,
        ip_hash,
      });

      if (error) throw error;

      return NextResponse.json({ success: true }, { status: 201 });
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

