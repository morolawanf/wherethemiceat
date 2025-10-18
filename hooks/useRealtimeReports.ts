import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import type { Report } from "@/lib/types";
import { isReportExpired } from "@/utils/time";

/**
 * Hook to subscribe to real-time report updates from Supabase
 */
export function useRealtimeReports() {
  const { addReport, updateReport, removeReport, reports, setReports } = useAppStore();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch reports function
  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  // Fetch initial reports on mount
  useEffect(() => {
    console.log("Fetching initial reports...");
    fetchReports();
  }, [setReports]);

  // Set up 10-second polling as fallback
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      console.log("Polling for reports updates...");
      fetchReports();
    }, 10000); // 10 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Subscribe to reports table changes
    const reportsChannel = supabase
      .channel("reports-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const newReport = payload.new as Report;
          
          // Only add if not expired
          if (!isReportExpired(newReport.validity_expires_at)) {
            addReport(newReport);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const updatedReport = payload.new as Report;
          
          // Remove if expired, otherwise update
          if (isReportExpired(updatedReport.validity_expires_at)) {
            removeReport(updatedReport.id);
          } else {
            updateReport(updatedReport.id, updatedReport);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const deletedReport = payload.old as Report;
          removeReport(deletedReport.id);
        }
      )
      .subscribe();

    // Subscribe to votes table changes to update report vote counts
    const votesChannel = supabase
      .channel("votes-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
        },
        async (payload) => {
          const vote = payload.new as any;
          // Fetch updated report with new vote counts
          const { data: report } = await supabase
            .from("reports")
            .select("*")
            .eq("id", vote.report_id)
            .single();
          
          if (report && !isReportExpired(report.validity_expires_at)) {
            updateReport(report.id, report);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "votes",
        },
        async (payload) => {
          const vote = payload.old as any;
          // Fetch updated report with new vote counts
          const { data: report } = await supabase
            .from("reports")
            .select("*")
            .eq("id", vote.report_id)
            .single();
          
          if (report && !isReportExpired(report.validity_expires_at)) {
            updateReport(report.id, report);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [addReport, updateReport, removeReport]);

  // Clean up expired reports periodically
  useEffect(() => {
    const interval = setInterval(() => {
      reports.forEach((report) => {
        if (isReportExpired(report.validity_expires_at)) {
          removeReport(report.id);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reports, removeReport]);
}

