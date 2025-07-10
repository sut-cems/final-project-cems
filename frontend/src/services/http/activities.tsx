import type { Activity } from "../../interfaces/IActivitys";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// GET /activities/club/ID
export async function fetchActivityByClubID(id: string): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/activities/club/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  console.log("FETCH RESULT:", result); 

  return result.activities; 
}

// GET /activitiesAll
export async function fetchActivityAll(): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/all/activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.activities; // ✅ ต้องมั่นใจว่า backend ส่ง key นี้มา
}

// GET /activities/ID
export async function fetchActivityById(id: string): Promise<Activity> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  console.log("FETCH RESULT:", result); 

  return result.activity; 
}