import React, { useState, useEffect } from 'react';
import {  Plus, Sparkles } from 'lucide-react';
import { message } from 'antd';
import {  fetchActivityByClubID } from '../../services/http';
import type { Activity } from '../../interfaces/IActivitys';
import ActivityCard from '../../components/Activities/ActivitiesCard'; // ✅ ใช้การ์ดที่คุณสร้างไว้

interface BodyProps {
  clubId: number | null;
  clubName?: string;
}

const ActivitiesManagement: React.FC<BodyProps> = ({ clubId, clubName }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentClubName, setCurrentClubName] = useState<string>(clubName || '');

  useEffect(() => {
    const FetchActivitiesByClub = async () => {
      if (!clubId) return;
      try {
        const res = await fetchActivityByClubID(String(clubId));
        setActivities(res);

        if (!clubName && res.length > 0 && res[0].Club?.Name) {
          setCurrentClubName(res[0].Club.Name);
        }
      } catch (error) {
        messageApi.error("เกิดข้อผิดพลาดขณะโหลดกิจกรรม");
      }
    };

    FetchActivitiesByClub();
  }, [clubId, clubName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {contextHolder}

      {/* Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white overflow-hidden">
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
                <p className="text-white/80 text-sm">
                  {currentClubName || 'กำลังโหลด...'}
                </p>
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

      {/* Activities Grid */}
      <div className="py-4 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activities.map((activity) => (
          <div key={activity.ID} className="h-full">
            <ActivityCard activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesManagement;
