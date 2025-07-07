import React, { useState, useEffect } from 'react';
import { ArrowRight, ImageOff, Users, Calendar, Plus, Sparkles, Clock } from 'lucide-react';
import { message } from 'antd';
import { API_BASE_URL, fetchActivityByClubID } from '../../services/http'; // ✅ แก้ตรงนี้
import type { Activity } from '../../interfaces/IActivitys';

interface BodyProps {
  clubId: number | null;
}

const Body: React.FC<BodyProps> = ({ clubId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('cid: ',clubId)

  useEffect(() => {
    const FetchActivitiesByClub = async () => {
      if (!clubId) return; // ✅ เช็กก่อนว่า clubId มีจริง
      try {
        const res = await fetchActivityByClubID(String(clubId));
        console.log("res:", res);
        setActivities(res); // ✅ สมมุติว่า res เป็น array ของ Activity
      } catch (error) {
        messageApi.error("เกิดข้อผิดพลาดขณะโหลดกิจกรรม");
      } finally {
        setLoading(false);
      }
    };

    FetchActivitiesByClub();
  }, [clubId]); // ✅ เพิ่ม dependency

  const getImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  // ฟังก์ชันสำหรับแสดงสถานะ (รับค่าเป็นตัวเลข)
  const getStatusConfig = (statusId: number | string) => {
    const id = Number(statusId);
    switch (id) {
      case 1: // แบบร่าง
        return { 
          text: 'แบบร่าง', 
          bgColor: 'bg-gradient-to-r from-slate-500 to-gray-600', 
          textColor: 'text-white',
          shadow: 'shadow-slate-200'
        };
      case 2: // รออนุมัติ
        return { 
          text: 'รออนุมัติ', 
          bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500', 
          textColor: 'text-white',
          shadow: 'shadow-amber-200'
        };
      case 3: // อนุมัติแล้ว (เปิดรับสมัคร)
        return { 
          text: 'อนุมัติแล้ว', 
          bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500', 
          textColor: 'text-white',
          shadow: 'shadow-green-200'
        };
      case 4: // ยกเลิก
        return { 
          text: 'ยกเลิก', 
          bgColor: 'bg-gradient-to-r from-red-500 to-pink-500', 
          textColor: 'text-white',
          shadow: 'shadow-red-200'
        };
      case 5: // สิ้นสุดกิจกรรม
        return { 
          text: 'สิ้นสุดแล้ว', 
          bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500', 
          textColor: 'text-white',
          shadow: 'shadow-indigo-200'
        };
      default:
        return { 
          text: 'ไม่ทราบสถานะ', 
          bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500', 
          textColor: 'text-white',
          shadow: 'shadow-gray-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {contextHolder}

      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  กิจกรรมของชมรม
                </h1>
                <p className="text-white/80 text-sm">Club ID: {clubId}</p>
              </div>
            </div>
            <button className="group relative bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>สร้างกิจกรรม</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="py-4 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activities.map((activity) => {
          const statusConfig = getStatusConfig(activity.StatusID || activity.Status?.ID || 0);
          const registrationCount = activity.ActivityRegistrations?.length || 0;
          
          return (
            <div
              key={activity.ID}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-100 flex flex-col border border-gray-100"
            >
              {/* Poster Image */}
              <div className="h-40 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                {activity.PosterImage ? (
                  <img
                    src={getImageUrl(activity.PosterImage)}
                    alt={activity.Title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageOff className="w-10 h-10" />
                  </div>
                )}
                
                {/* Status Badge - มุมขวาบน */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} shadow-lg ${statusConfig.shadow} backdrop-blur-sm`}>
                    {statusConfig.text}
                  </span>
                </div>

                {/* Registration Count - มุมขวาล่าง */}
                <div className="absolute bottom-2 right-2 z-10">
                  <div className="bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border border-white/20">
                    <Users className="w-3 h-3" />
                    <span className="font-semibold">{registrationCount}</span>
                    <span className="text-white/70">/{activity.Capacity}</span>
                  </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Activity Info */}
              <div className="p-3 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {activity.Title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2 leading-relaxed">
                    {activity.Description}
                  </p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{new Date(activity.DateStart).toLocaleDateString()} - {new Date(activity.DateEnd).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      ชมรม: {activity.Club?.Name || 'ไม่ระบุ'}
                    </div>
                    {activity.Category?.Name && (
                      <div className="text-xs text-gray-400 truncate">
                        หมวดหมู่: {activity.Category.Name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-purple-600 group-hover:text-orange-500 transition-colors cursor-pointer">
                    <span className="text-sm font-semibold">จัดการกิจกรรม</span>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Body;