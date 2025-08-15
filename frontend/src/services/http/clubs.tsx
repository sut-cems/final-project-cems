import type { Club } from "../../interfaces/IClubs";
import { authFetch } from "./authFetch";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =============== Public (ไม่ต้องมี token ก็เรียกได้ แต่เรายังผ่าน authFetch ได้) ===============
export async function GetCategoriesWithClubs() {
  try {
    const response = await authFetch(`${API_BASE_URL}/categories/clubs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch categories with clubs:", err);
    return null;
  }
}

export async function GetClubByID(id: string) {
  const response = await authFetch(`${API_BASE_URL}/clubs/${id}`);
  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Club not found");
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error("Failed to fetch club data");
  }
  return result.data;
}

export async function GetClubAnnouncements(clubId: string) {
  const res = await authFetch(`${API_BASE_URL}/clubs/${clubId}/announcements`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || "เกิดข้อผิดพลาด");
  return data.data;
}

// =============== Auth-required ===============
export const requestJoinClub = async (clubId: string) => {
  const res = await authFetch(`${API_BASE_URL}/clubs/${clubId}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const error = await safeJson(res);
    throw new Error(error?.message || "ไม่สามารถส่งคำขอเข้าร่วมได้");
  }
  return await safeJson(res);
};

export async function GetMembersByClubID(clubId: string) {
  const response = await authFetch(`${API_BASE_URL}/clubs/${clubId}/members`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorData = await safeJson(response);
    throw new Error(
      errorData?.error || `HTTP error! status: ${response.status}`
    );
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error("Failed to fetch club members");
  }
  return result.data;
}

export async function changePresident(clubId: string, newPresidentId: number) {
  const res = await authFetch(
    `${API_BASE_URL}/clubs/${clubId}/change-president`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_president_id: newPresidentId }),
    }
  );
  if (!res.ok) {
    const error = await safeJson(res);
    throw new Error(error?.error || "Failed to change president");
  }
  return await safeJson(res);
}

export async function approveMember(clubId: string, userId: number) {
  const res = await authFetch(
    `${API_BASE_URL}/clubs/${clubId}/approve-member/${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || "ไม่สามารถอนุมัติสมาชิกได้");
  }
  return await safeJson(res);
}

export const removeClubMember = async (clubId: string, userId?: number) => {
  const endpoint = userId
    ? `${API_BASE_URL}/clubs/${clubId}/remove-member/${userId}` // ลบคนอื่น
    : `${API_BASE_URL}/clubs/${clubId}/remove-member`; // ออกจากชมรมเอง

  const res = await authFetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const result = await safeJson(res);
  if (!res.ok) {
    throw new Error(result?.error || "ลบสมาชิกไม่สำเร็จ");
  }
  return result;
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

  const response = await authFetch(`${API_BASE_URL}/clubs/create`, {
    method: "POST",
    body: formData, // อย่า set Content-Type เอง
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Failed to create club");
  }

  const result = await response.json();
  return result.club;
}

export async function ApproveClub(id: string) {
  const response = await authFetch(`${API_BASE_URL}/clubs/${id}/approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "ไม่สามารถอนุมัติชมรมได้");
  }

  const result = await safeJson(response);
  if (!result?.message) throw new Error("Approve club failed");
  return result;
}

export async function RejectClub(id: string) {
  const response = await authFetch(`${API_BASE_URL}/clubs/${id}/reject`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "ไม่สามารถปฏิเสธชมรมได้");
  }

  const result = await safeJson(response);
  if (!result?.message) throw new Error("Reject club failed");
  return result;
}

export async function UpdateClub(clubId: string, formData: FormData) {
  const res = await authFetch(`${API_BASE_URL}/clubs/${clubId}`, {
    method: "PUT",
    body: formData, // FormData ไม่ต้องตั้ง Content-Type
  });

  if (!res.ok) {
    const error = await safeJson(res);
    throw new Error(error?.error || "ไม่สามารถอัปเดตข้อมูลชมรมได้");
  }

  const result = await safeJson(res);
  if (!result?.message) throw new Error("Update club failed");
  return result;
}

export async function createClubAnnouncement(
  clubId: string,
  title: string,
  content: string
) {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) throw new Error("ไม่ได้เข้าสู่ระบบ");

  const res = await fetch(`${API_BASE_URL}/clubs/${clubId}/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ไม่สามารถโพสต์ประกาศได้");
  }

  return await res.json();
}

export async function updateClubAnnouncement(
  clubId: string | number,
  annId: number | string,
  title: string,
  content: string
) {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) throw new Error("ไม่ได้เข้าสู่ระบบ");

  const res = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/announcements/${annId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    }
  );

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {}
  if (!res.ok) throw new Error(data?.error || raw || "อัปเดตประกาศไม่สำเร็จ");
  return data;
}

export async function deleteClubAnnouncement(clubId: string, annId: number) {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) throw new Error("ไม่ได้เข้าสู่ระบบ");

  const res = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/announcements/${annId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `ลบประกาศไม่สำเร็จ (HTTP ${res.status})`);
  }
  const json = await res.json().catch(() => ({}));
  return json;
}

export async function getClubAnnouncementbyID(
  clubId: string | number,
  annId: number | string
) {
  const res = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/announcements/${annId}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "โหลดประกาศไม่สำเร็จ");
  return data.data; // {ID, Title, Content, ...}
}

// =============== helpers ภายในไฟล์ ===============
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    // ถ้าไม่ใช่ JSON ให้ลองอ่านข้อความเพื่อลง log / คืนข้อความได้
    const t = await res.text().catch(() => "");
    return t ? { message: t } : null;
  }
}
