import type { Notifications } from "../../interfaces/INotifications";
import type { LoginInput, LoginResponse, SignupInput } from "../../interfaces/ISingIn";
import type { Users } from "../../interfaces/IUsers";
import type { ClubMember } from "../../interfaces/IClubMembers";
import type { Activity } from "../../interfaces/IActivitys";
import type { ActivityHoursChart, DashboardStats, ParticipationChart  } from "../../pages/Admin/Dashboad";
import type { ReportRequest } from "../../components/Reports/ReportCreate";
import type { ReportListResponse } from "../../components/Reports/ReportsDashboard";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function signup(data: SignupInput): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  const result = await response.json();
  console.log(result.message);
}

export async function login(data: LoginInput): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return await response.json();
}


// GET /users
export async function fetchAllUsers(): Promise<Users[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch users");
  }
  const result = await response.json();
  return result.data;
}

// GET /users/:id
export async function fetchUserById(id: number): Promise<Users> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "User not found");
  }
  const result = await response.json();
  console.log("fetchUserById response:", result);
  return result.data;
}


// POST /users
export async function createUser(data: Users): Promise<Users> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }
  const result = await response.json();
  return result.data;
}

// PATCH /users/:id
export async function updateUser(id: string, data: Partial<Users>): Promise<Users> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }
  const result = await response.json();
  return result.data;
}

// DELETE /users/:id
export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
}

// GET FacultiesWithPrograms
export async function getFacultiesWithPrograms() {
  try {
    const response = await fetch(`${API_BASE_URL}/facultyWithProgram`, {
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
    console.error("Failed to fetch facultyWithProgram:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// GET /clubs/popular
export async function fetchPopularClubs() {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs/popular`, {
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
    console.error("Failed to fetch popular clubs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
// GET /clubmembers/user/id
export async function fetchClubMembersByUserID(id: string):Promise<ClubMember> {
    const response = await fetch(`${API_BASE_URL}/clubmembers/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
}

export async function fetchClubStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs/statistics`, {
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
    console.error("Failed to fetch club statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
// GET /activities/featured
export async function fetchFeaturedActivities() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/featured`, {
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
    console.error("Failed to fetch featured activities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
// GET /activities/statistics
export async function fetchActivityStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/statistics`, {
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

// function for flexible user search
export async function searchUsers(query: string): Promise<Users[]> {
  const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || errorData.message}`);
  }

  const result = await response.json();
  console.log("SEARCH USERS RESULT:", result);
  return result.data || [];
}

// Fallback function that tries multiple search methods
export async function flexibleUserSearch(query: string): Promise<Users[]> {
  try {
    // First try the dedicated search endpoint
    return await searchUsers(query);
  } catch (error) {
    console.warn('Search endpoint failed, trying fallback methods:', error);
    
    // If search endpoint doesn't exist, try other methods
    const results: Users[] = [];
    
    // Try fetching by ID if query looks like a number
    if (/^\d+$/.test(query)) {
      try {
        const userById = await fetchUserById(parseInt(query));
        if (userById) results.push(userById);
      } catch (e) {
        console.warn('ID search failed:', e);
      }
    }
    
    // If no results found, return empty array
    return results;
  }
}

export default class NotificationService {
  private baseURL = 'http://localhost:8000';
  private eventSource: EventSource | null = null;

  // ฟังก์ชันสำหรับแปลง date format
  private formatDate(dateString: string): string {
    try {
      // ถ้า dateString เป็น null หรือ undefined
      if (!dateString) {
        return new Date().toISOString();
      }

      // ลองแปลงโดยตรงก่อน
      let date = new Date(dateString);
      
      // ถ้าแปลงไม่ได้ ลองใช้วิธีอื่น
      if (isNaN(date.getTime())) {
        // ถ้า format เป็น Go time format แบบ RFC3339
        date = new Date(dateString.replace('T', ' ').replace('Z', ''));
        
        // ถ้ายังไม่ได้ ลองแปลง format อื่น
        if (isNaN(date.getTime())) {
          // สำหรับ Go time format: 2006-01-02T15:04:05.999999999Z07:00
          const cleanDateString = dateString.replace(/\.\d+Z?$/, 'Z');
          date = new Date(cleanDateString);
        }
      }

      // ถ้ายังแปลงไม่ได้ ใช้เวลาปัจจุบัน
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        date = new Date();
      }

      return date.toISOString();
    } catch (error) {
      console.error('Date parsing error:', error);
      return new Date().toISOString();
    }
  }

  // ดึงการแจ้งเตือนทั้งหมด
  async getNotifications(userId: number): Promise<Notifications[]> {
    try {
      const response = await fetch(`${this.baseURL}/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
     
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
     
      const data = await response.json();
      return data.map((item: any) => ({
        ID: item.ID,
        UserID: item.UserID,
        Message: item.Message,
        Type: item.Type,
        IsRead: item.IsRead,
        CreatedAtTime: this.formatDate(item.CreatedAt || item.created_at), // รองรับทั้ง 2 format
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // เริ่ม Real-time connection ด้วย Server-Sent Events (SSE)
  startRealTimeConnection(userId: number, onNotification: (notification: Notifications) => void) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('token');
    this.eventSource = new EventSource(`${this.baseURL}/notifications/${userId}/stream?token=${token}`);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // ข้าม heartbeat messages
        if (data.type === 'heartbeat') {
          return;
        }

        const notification: Notifications = {
          ID: data.ID,
          UserID: data.UserID,
          Message: data.Message,
          Type: data.Type,
          IsRead: data.IsRead,
          CreatedAtTime: this.formatDate(data.CreatedAt), // แปลง date format
        };

        onNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Reconnect after 5 seconds
      setTimeout(() => {
        this.startRealTimeConnection(userId, onNotification);
      }, 5000);
    };
  }

  // หยุด Real-time connection
  stopRealTimeConnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // อัพเดตสถานะอ่านแล้ว
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
     
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // อัพเดตอ่านทั้งหมด
  async markAllAsRead(userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/notifications/read-all/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
     
      return response.ok;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch dashboard stats");
    }
    return await response.json();
}

export async function fetchParticipationChart(period?: string): Promise<ParticipationChart> {
    const url = new URL(`${API_BASE_URL}/charts/participation`);
    if (period) {
        url.searchParams.append('period', period);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch participation chart");
    }
    return await response.json();
}

export async function fetchActivityHoursChart(): Promise<ActivityHoursChart> {
    const response = await fetch(`${API_BASE_URL}/charts/activity-hours`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch activity hours chart");
    }
    return await response.json();
}

export async function fetchReportList(page: number = 1, limit: number = 10): Promise<ReportListResponse> {
    const url = new URL(`${API_BASE_URL}/reports`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString());
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch report list");
    }
    return await response.json();
}

export async function generateReports(data: ReportRequest): Promise<any> {
   try {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const responseData = await response.blob();
        return responseData;
    } catch (error) {
        console.error('Error generating reports:', error);
        throw error;
    }
}

export async function downloadReport(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/download-report/${id}`, {
        method: "GET",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download report");
    }
    return await response.blob();
}

export async function downloadReportFile(id: string, filename?: string): Promise<void> {
    try {
        const blob = await downloadReport(id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `report_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download report:", error);
        throw error;
    }
}

export async function deleteReport(id: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            let errorMessage = "Failed to delete report";
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (parseError) {
                errorMessage = response.statusText || errorMessage;
            }

            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            console.log("Report deleted successfully:", result);
        }
        
    } catch (error) {
        console.error("Error deleting report:", error);
        throw error; 
    }
}
