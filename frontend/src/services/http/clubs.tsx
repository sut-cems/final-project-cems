import type { Club } from "../../interfaces/IClubs";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function GetCategoriesWithClubs() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/clubs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch categories with clubs:", err);
    return null;
  }
}

export async function GetClubByID(id: string){
  const response = await fetch(`${API_BASE_URL}/clubs/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Club not found");
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error("Failed to fetch club data");
  }
  return result.data;
}

export const requestJoinClub = async (clubId: string) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) throw new Error("ไม่ได้เข้าสู่ระบบ");

    const res = await fetch(`${API_BASE_URL}/clubs/${clubId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "ไม่สามารถส่งคำขอเข้าร่วมได้");
    }

    return await res.json();
  } catch (error) {
    console.error("requestJoinClub error:", error);
    throw error;
  }
};


export async function GetMembersByClubID(clubId: string) {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) throw new Error("ไม่พบ token กรุณาเข้าสู่ระบบใหม่");

    const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/members`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error("Failed to fetch club members");
    }

    return result.data;
  } catch (err) {
    console.error("Failed to fetch club members:", err);
    throw err;
  }
}

export async function changePresident(clubId: string, newPresidentId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/change-president`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_president_id: newPresidentId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change president");
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to change president:", err);
    throw err;
  }
}

export async function GetClubAnnouncements(clubId: string) {
  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/announcements`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
  return data.data;
}

export async function approveMember(clubId: string, userId: number) {
  const res = await fetch(`${API_BASE_URL}/clubs/${clubId}/approve-member/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ไม่สามารถอนุมัติสมาชิกได้");
  }

  return await res.json();
}

export const removeClubMember = async (clubId: string, userId?: number) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    console.log("Using token:", token);

    if (!token) throw new Error("ไม่พบ token กรุณาเข้าสู่ระบบใหม่");

    const endpoint = userId
      ? `${API_BASE_URL}/clubs/${clubId}/remove-member/${userId}` // ลบคนอื่น
      : `${API_BASE_URL}/clubs/${clubId}/remove-member`;         // ลบตัวเอง

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "ลบสมาชิกไม่สำเร็จ");
    }

    return result;
  } catch (error) {
    console.error("removeClubMember error:", error);
    throw error;
  }
};

export async function createClub(data: {
  Name: string;
  Description: string;
  CategoryID: number;
  CreatedBy: number;
  imageFile: File;
}): Promise<Club> {
  const formData = new FormData();
  formData.append("Name", data.Name);
  formData.append("Description", data.Description);
  formData.append("CategoryID", data.CategoryID.toString());
  formData.append("CreatedBy", data.CreatedBy.toString());
  formData.append("Image", data.imageFile);

  const response = await fetch(`${API_BASE_URL}/clubs/create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create club");
  }

  const result = await response.json();
  return result.club;
}

export async function ApproveClub(id: string) {
  const response = await fetch(`${API_BASE_URL}/clubs/${id}/approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ไม่สามารถอนุมัติชมรมได้");
  }

  const result = await response.json();
  if (!result.message) {
    throw new Error("Approve club failed");
  }

  return result;
}

export async function RejectClub(id: string) {
  const response = await fetch(`${API_BASE_URL}/clubs/${id}/reject`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ไม่สามารถปฏิเสธชมรมได้");
  }

  const result = await response.json();
  if (!result.message) {
    throw new Error("Reject club failed");
  }

  return result;
}

