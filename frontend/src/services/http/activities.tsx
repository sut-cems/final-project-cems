import type { Activity } from "../../interfaces/IActivitys";
import type { EventCategory } from "../../interfaces/IEventCategories";
import type { ActivityStatus } from "../../interfaces/IActivityStatuses";

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

// GET /ActivityCategory
export async function fetchActivityCategory(): Promise<EventCategory[]> {
  const response = await fetch(`${API_BASE_URL}/activities/category`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.categories;
}

// GET /ActivityStatus
export async function fetchActivityStatus(): Promise<ActivityStatus[]> {
  const response = await fetch(`${API_BASE_URL}/activities/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.status;
}

export async function fetchActivitiesPhotos() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch activity statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function fetchPhotosByActivityID(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/photo/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch activity statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function fetchAllActivitiesWithoutPhotos() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/without-photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch activity statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function addPhotoToActivity(id: number, photoData: { url: string; uploadedBy: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/photo/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to add photo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
//update activity
export async function updateActivity(id: string, formData: FormData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update activity: ${errorText}`);
  }
}

export async function createActivity(formData: FormData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update activity: ${errorText}`);
  }
}

