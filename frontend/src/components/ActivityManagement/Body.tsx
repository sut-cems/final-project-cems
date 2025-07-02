import React, { useState, useEffect } from 'react';
import { ArrowRight, ImageOff } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      {contextHolder}

      {/* Header */}
      <div className="bg-orange-500 text-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">กิจกรรมของชมรม ID: {clubId}</div>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-md">
            สร้างกิจกรรม +
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-5 px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {activities.map((activity) => (
          <div
            key={activity.ID}
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition duration-500 hover:scale-105 hover:shadow-2xl"
          >
            {/* Poster Image */}
            <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
              {activity.PosterImage ? (
                <img
                  src={getImageUrl(activity.PosterImage)}
                  alt={activity.Title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageOff className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Activity Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{activity.Title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">{activity.Description}</p>
              <div className="text-sm text-gray-500">
                🕒 {new Date(activity.DateStart).toLocaleDateString()} - {new Date(activity.DateEnd).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                ชมรม: {activity.Club?.Name || 'ไม่ระบุ'}
              </div>
              <div className="mt-2 flex justify-between items-center text-orange-500 group-hover:text-purple-900 transition">
                <span className="text-sm font-medium">ดูรายละเอียด</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Body;
