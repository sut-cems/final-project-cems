import type { UniversityRequest } from "../../interfaces/IUniversity";


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getUniversity() {
  try {
    const response = await fetch(`${API_BASE_URL}/university`, {
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
    console.error("Failed to fetch university:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUniversityByID(id: string | undefined) {
  try {
    const response = await fetch(`${API_BASE_URL}/university/${id}`, {
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
    console.error("Failed to fetch university:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createUniversity(universityData: UniversityRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/university`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(universityData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to create university:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateUniversity(universityData: UniversityRequest, id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/university/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(universityData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to create university:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}