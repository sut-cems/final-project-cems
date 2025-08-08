import type { HomePageStats, ReviewStats } from "../../interfaces/HomeStats";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export interface TopActivity {
    title: string;
    club_name: string;
    join_count: number;
}
export interface AttendanceRate {
    average_rate: number; // เช่น 75.5 หมายถึง 75.5%
}
export interface ClubStat {
    club_name: string;
    activities: number;
    participants: number;
}
export interface ActivityStatusDistribution {
    status: string;
    count: number;
}
export async function getTopActivities(): Promise<TopActivity[]> {

    const response = await fetch(`${API_BASE_URL}/top-activities`, {

        method: "GET",

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.error || "Failed to fetch top activities");

    }

    return await response.json();

}

export async function getAverageAttendanceRate(): Promise<AttendanceRate> {

    const response = await fetch(`${API_BASE_URL}/average-attendance`, {

        method: "GET",

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.error || "Failed to fetch average attendance rate");

    }

    return await response.json();

}

export async function getClubStatistics(): Promise<ClubStat[]> {

    const response = await fetch(`${API_BASE_URL}/club-statistics`, {

        method: "GET",

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.error || "Failed to fetch club statistics");

    }

    return await response.json();

}

export async function getActivityStatusDistribution(): Promise<ActivityStatusDistribution[]> {

    const response = await fetch(`${API_BASE_URL}/activity-statuses`, {

        method: "GET",

    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.error || "Failed to fetch activity status distribution");

    }

    return await response.json();

}

// services/stats.ts

export async function getHomePageStats(): Promise<HomePageStats> {
  const response = await fetch(`${API_BASE_URL}/homepage/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch homepage stats");
  }
  return await response.json();
}

export async function getReviewStats(): Promise<ReviewStats> {
  const response = await fetch(`${API_BASE_URL}/review-stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch review stats");
  }
  return response.json();
}
