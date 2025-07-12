import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { GetClubByID } from "../../services/http/clubs";
import type { Activity } from "../../interfaces/IActivitys";
import type { ClubMember } from "../../interfaces/IClubMembers";
import { fetchUserById } from "../../services/http";
import { GetClubAnnouncements } from "../../services/http/clubs";

interface ClubInfoProps {
  clubId: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  logo_image?: string;
  status?: {
    ID: number;
    Description: string;
    IsActive: boolean;
  };
  category?: {
    ID: number;
    Name: string;
    Description?: string;
  };
  activities?: Activity[];
  member_count?: number;
}

interface ClubAnnouncement {
  ID: number;
  Title: string;
  Content: string;
  CreatedAt: number;
}

const ClubInfo: React.FC<ClubInfoProps> = ({ clubId }) => {
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [, setIsPresident] = useState(false);
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [isPending, setIsPending] = useState(false);

  const checkMembershipStatusFromUser = async () => {
    const userId = localStorage.getItem("userId");
    const currentUserId = userId ? parseInt(userId, 10) : 0;

    if (!currentUserId || !clubId) {
      setIsMember(false);
      setIsPresident(false);
      setIsPending(false);
      return;
    }

    try {
      const userData = await fetchUserById(currentUserId);
      const matched = userData.ClubMembers?.find(
        (membership: ClubMember) => membership.ClubID === parseInt(clubId, 10)
      );

      const role = matched?.Role;
      setIsMember(role === "member" || role === "vice_president" || role === "president");
      setIsPresident(role === "president");
      setIsPending(role === "pending");
    } catch {
      setIsMember(false);
      setIsPresident(false);
      setIsPending(false);
    }
  };



    const fetchClubData = async () => {
        if (!clubId) {
          setError("ไม่พบ ID ชมรม");
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          const clubResponse = await GetClubByID(clubId);
          if (!clubResponse) throw new Error("ไม่พบข้อมูลชมรม");
          setClub(clubResponse);
          await checkMembershipStatusFromUser();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูลชมรม";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
  
        useEffect(() => {
          fetchClubData();
        }, [clubId]);
    
  useEffect(() => {
    const memberStatus = localStorage.getItem("isMember");
    setIsMember(memberStatus === "true");
  }, []);

  useEffect(() => {
    const loadClubData = async () => {
      try {
        const clubResponse = await GetClubByID(clubId);
        setClub(clubResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูลชมรม");
      } finally {
        setLoading(false);
      }
    };
    loadClubData();
  }, [clubId]);

  useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const data = await GetClubAnnouncements(clubId);
      setAnnouncements(data);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  };
  fetchAnnouncements();
}, [clubId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D91656]/30 border-t-[#D91656] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">กำลังโหลดข้อมูลชมรม...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลชมรม</h3>
              <p className="text-gray-600">ชมรมที่คุณค้นหาอาจไม่มีอยู่หรือถูกลบไปแล้ว</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentActivities = club.activities?.slice(0, 3) || [];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {!isMember && !isPending ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

            {/* Recent Activities Section */}
            {recentActivities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">กิจกรรมล่าสุด</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.ID} className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-[#D91656]/30 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            กิจกรรม #{index + 1}
                          </div>
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#D91656] transition-colors">
                          {activity.Title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.Description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.Location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(activity.DateStart).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">คุณยังไม่ได้เข้าร่วมชมรมนี้</h2>
              <p className="text-gray-600 mb-6">
                กรุณาเข้าร่วมชมรมเพื่อดูรายละเอียดกิจกรรมและข้อมูลเพิ่มเติม
              </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              ← กลับไปหน้าชมรม
            </button>
          </div>
        ) : isPending ? (

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {recentActivities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">กิจกรรมล่าสุด</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.ID} className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-[#D91656]/30 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            กิจกรรม #{index + 1}
                          </div>
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#D91656] transition-colors">
                          {activity.Title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.Description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.Location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(activity.DateStart).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">คุณได้ส่งคำขอเข้าร่วมชมรมแล้ว</h2>
            <p className="text-gray-600 mb-6">โปรดรอการอนุมัติจากหัวหน้าชมรม</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              ← กลับไปหน้าชมรม
            </button>
          </div>
        ) : (
          <>
            
        {/* ส่วนกิจกรรมทั้งหมด */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    กิจกรรมทั้งหมดของ {club.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    พบกิจกรรมที่น่าสนใจทั้งหมด {club.activities?.length || 0} กิจกรรม
                  </p>
                </div>

                <div className="space-y-6">
                  {club.activities?.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-8xl mb-6">📅</div>
                      <h2 className="text-2xl font-semibold text-gray-700 mb-4">ยังไม่มีกิจกรรม</h2>
                      <p className="text-gray-500 text-lg">รอติดตามกิจกรรมสนุกๆ ได้เร็วๆ นี้</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {club.activities?.map((activity) => (
                        <div
                          key={activity.ID}
                          onClick={() => navigate(`/activities/${activity.ID}`)}
                          className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 cursor-pointer group"
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={activity.PosterImage}
                              alt={activity.Title}
                              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute top-4 left-4">
                              <span className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                กิจกรรม
                              </span>
                            </div>
                            <div className="absolute bottom-4 right-4">
                              <div className="bg-gradient-to-r from-green-900 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                รับสมัคร {activity.Capacity} คน
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#D91656] transition-colors">
                              {activity.Title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                              {activity.Description}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>📍</span>
                                <span className="font-medium">{activity.Location}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>📅</span>
                                <span className="font-medium">
                                  ตั้งแต่วันที่ {new Date(activity.DateStart).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-red-500">
                                  ถึงวันที่ {new Date(activity.DateEnd).toLocaleDateString('th-TH')}
                                </span>
                                <div className="flex items-center gap-2 text-[#D91656] font-semibold text-sm">
                                  <span>ดูรายละเอียด</span>
                                  <span className="text-lg">→</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Club Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">เกี่ยวกับชมรม</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">รายละเอียด</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{club.description}</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#D91656] rounded-full"></div>
                      <span className="text-gray-700">หมวดหมู่: <strong>{club.category?.Name}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#D91656] rounded-full"></div>
                      <span className="text-gray-700">สถานะ: <strong>{club.status?.Description}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#D91656] rounded-full"></div>
                      <span className="text-gray-700">จำนวนสมาชิก: <strong>{club.member_count || 0} คน</strong></span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">ข่าวสาร</h3>
                    {announcements.length > 0 ? (
                      <ul className="space-y-4">
                        {announcements.map((a) => (
                          <li key={a.ID} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                            <div className="font-semibold text-gray-800">{a.Title}</div>
                            <div className="text-sm text-gray-600">{a.Content}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              วันที่ประกาศ: {new Date(a.CreatedAt).toLocaleDateString('th-TH')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">ยังไม่มีข่าวสารจากชมรมนี้</div>
                    )}
                </div>
              </div>
              
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  ← กลับไปหน้าชมรม
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubInfo;
