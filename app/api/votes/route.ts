import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { UPVOTE_TIME_EXTENSION_MINUTES, TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES, DOWNVOTES_FOR_TIME_REDUCTION } from "@/lib/constants";

/**
 * GET /api/votes - Get user's vote for a specific report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const userIdentityHash = searchParams.get("userIdentityHash");

    if (!reportId || !userIdentityHash) {
      return NextResponse.json(
        { success: false, error: "Missing reportId or userIdentityHash" },
        { status: 400 }
      );
    }

    const { data: vote, error } = await supabase
      .from("votes")
      .select("*")
      .eq("report_id", reportId)
      .eq("fingerprint_hash", userIdentityHash)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      success: true,
      vote: vote || null,
    });
  } catch (error) {
    console.error("Vote API GET error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/votes - Vote on a report (upvote or downvote)
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const body = await request.json();
    console.log("Vote API POST request body:", body);
    const { reportId, voteType, userIdentity } = body;

    if (!reportId || !voteType || !userIdentity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test database connection
    try {
      const { data: testData, error: testError } = await supabase
        .from("reports")
        .select("id")
        .limit(1);
      
      if (testError) {
        console.error("Database connection test failed:", testError);
        return NextResponse.json(
          { success: false, error: "Database connection failed" },
          { status: 500 }
        );
      }
      console.log("Database connection test successful");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database connection error" },
        { status: 500 }
      );
    }

    // Map vote types to database enum values
    const dbVoteType = voteType === "upvote" ? "up" : "down";
    
    if (!["up", "down"].includes(dbVoteType)) {
      return NextResponse.json(
        { success: false, error: "Invalid vote type" },
        { status: 400 }
      );
    }

    const { fingerprintHash, ipHash } = userIdentity;

    // Check if user has already voted on this report
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("*")
      .eq("report_id", reportId)
      .eq("fingerprint_hash", fingerprintHash)
      .eq("ip_hash", ipHash)
      .single();

    if (voteCheckError && voteCheckError.code !== "PGRST116") {
      throw voteCheckError;
    }

    // If user already voted, update their vote
    if (existingVote) {
      if (existingVote.vote_type === dbVoteType) {
        return NextResponse.json(
          { success: false, error: "You have already voted this way" },
          { status: 400 }
        );
      }

      // Update existing vote
      const { error: updateError } = await supabase
        .from("votes")
        .update({ vote_type: dbVoteType, created_at: new Date().toISOString() })
        .eq("id", existingVote.id);

      if (updateError) throw updateError;
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from("votes")
        .insert({
          report_id: reportId,
          vote_type: dbVoteType,
          fingerprint_hash: fingerprintHash,
          ip_hash: ipHash,
        });

      if (insertError) throw insertError;
    }

    // Get updated vote counts for the report
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("report_id", reportId);

    if (votesError) throw votesError;

    const upvoteCount = votes.filter(v => v.vote_type === "up").length;
    const downvoteCount = votes.filter(v => v.vote_type === "down").length;

    // Calculate new validity based on votes
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("validity_expires_at, created_at")
      .eq("id", reportId)
      .single();

    if (reportError) throw reportError;

    const baseValidity = new Date(report.created_at);
    baseValidity.setMinutes(baseValidity.getMinutes() + 60); // Base 60 minutes

    // Apply upvote extensions (20 minutes per upvote, max 70 minutes total)
    const upvoteExtensions = Math.min(upvoteCount * UPVOTE_TIME_EXTENSION_MINUTES, 10); // Max 10 minutes from upvotes
    baseValidity.setMinutes(baseValidity.getMinutes() + upvoteExtensions);

    // Apply downvote reductions (2 minutes per 5 downvotes)
    const downvoteReductions = Math.floor(downvoteCount / DOWNVOTES_FOR_TIME_REDUCTION) * TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES;
    baseValidity.setMinutes(baseValidity.getMinutes() - downvoteReductions);

    // Ensure validity is not negative
    const now = new Date();
    const newValidity = baseValidity > now ? baseValidity : now;

    // Update report with new vote counts and validity
    const { error: updateReportError } = await supabase
      .from("reports")
      .update({
        upvote_count: upvoteCount,
        downvote_count: downvoteCount,
        validity_expires_at: newValidity.toISOString(),
      })
      .eq("id", reportId);

    if (updateReportError) throw updateReportError;

    return NextResponse.json({
      success: true,
      upvoteCount,
      downvoteCount,
      newValidity: newValidity.toISOString(),
    });
  } catch (error) {
    console.error("Vote API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/votes - Remove a vote
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, userIdentity } = body;

    if (!reportId || !userIdentity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { fingerprintHash, ipHash } = userIdentity;

    // Find and delete the user's vote
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("report_id", reportId)
      .eq("fingerprint_hash", fingerprintHash)
      .eq("ip_hash", ipHash);

    if (deleteError) throw deleteError;

    // Get updated vote counts
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("report_id", reportId);

    if (votesError) throw votesError;

    const upvoteCount = votes.filter(v => v.vote_type === "up").length;
    const downvoteCount = votes.filter(v => v.vote_type === "down").length;

    // Recalculate validity without this vote
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("validity_expires_at, created_at")
      .eq("id", reportId)
      .single();

    if (reportError) throw reportError;

    const baseValidity = new Date(report.created_at);
    baseValidity.setMinutes(baseValidity.getMinutes() + 60);

    const upvoteExtensions = Math.min(upvoteCount * UPVOTE_TIME_EXTENSION_MINUTES, 10);
    baseValidity.setMinutes(baseValidity.getMinutes() + upvoteExtensions);

    const downvoteReductions = Math.floor(downvoteCount / DOWNVOTES_FOR_TIME_REDUCTION) * TIME_REDUCED_PER_DOWNVOTE_BATCH_MINUTES;
    baseValidity.setMinutes(baseValidity.getMinutes() - downvoteReductions);

    const now = new Date();
    const newValidity = baseValidity > now ? baseValidity : now;

    // Update report
    const { error: updateReportError } = await supabase
      .from("reports")
      .update({
        upvote_count: upvoteCount,
        downvote_count: downvoteCount,
        validity_expires_at: newValidity.toISOString(),
      })
      .eq("id", reportId);

    if (updateReportError) throw updateReportError;

    return NextResponse.json({
      success: true,
      upvoteCount,
      downvoteCount,
      newValidity: newValidity.toISOString(),
    });
  } catch (error) {
    console.error("Vote API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}