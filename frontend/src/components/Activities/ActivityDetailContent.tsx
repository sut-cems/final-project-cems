import React, { useState } from "react";
import type { Activity } from "../../interfaces/IActivitys";
import { useNavigate } from 'react-router-dom';

import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Star,
  Share2,
  Settings,
  Edit,
  UserCheck,
} from "lucide-react";

interface Props {
  activity: Activity;
  onRegister: () => void;
  isRegistered: boolean;
  isLoading: boolean;
  canManageActivity: boolean;
}

const ActivityDetailContent: React.FC<Props> = ({
  activity,
  onRegister,
  isRegistered,
  isLoading,
  canManageActivity,
}) => {
  const [showManageMenu, setShowManageMenu] = useState(false);

  const currentParticipants = activity.ActivityRegistrations?.length || 0;
  const availableSpots = activity.Capacity - currentParticipants;
  const isFull = availableSpots <= 0;
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditActivity = () => {
    navigate(`/activities/edit/${activity.ID}`);
    console.log("Navigate to edit activity");
  };

  const handleManageRegistrations = () => {
    navigate(`/activities/edit/${activity.ID}`);
    console.log("Navigate to manage registrations");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              รายละเอียดกิจกรรม
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {activity.Description}
            </p>
          </div>

          {/* Activity Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              ข้อมูลกิจกรรม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">วันที่เริ่มต้น</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(activity.DateStart)}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {formatTime(activity.DateStart)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">วันที่สิ้นสุด</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(activity.DateEnd)}
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    {formatTime(activity.DateEnd)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">สถานที่</p>
                  <p className="text-sm text-gray-600">{activity.Location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">ผู้เข้าร่วม</p>
                  <p className="text-sm text-gray-600">
                    {currentParticipants}/{activity.Capacity} คน
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    เหลือที่ว่าง {availableSpots} คน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            canManageActivity ? "grid lg:grid-cols-3 gap-6" : "space-y-6"
          }`}
        >
          {/* Registration Card */}
          <div
            className={`bg-white rounded-xl shadow-lg p-6 ${
              canManageActivity ? "lg:col-span-1" : "sticky top-6"
            }`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center items-center gap-2 mb-3">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-gray-800">
                  {currentParticipants}
                </span>
                <span className="text-gray-600">/ {activity.Capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (currentParticipants / activity.Capacity) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {isFull
                  ? "กิจกรรมเต็มแล้ว"
                  : `เหลือที่ว่าง ${availableSpots} คน`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onRegister}
                disabled={isLoading || isFull || isRegistered}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  isRegistered
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : isFull
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังดำเนินการ...
                  </div>
                ) : isRegistered ? (
                  "ลงทะเบียนแล้ว ✓"
                ) : isFull ? (
                  "เต็มแล้ว"
                ) : (
                  "สมัครร่วมกิจกรรม"
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigator.share?.({
                      title: activity.Title,
                      url: window.location.href,
                    })
                  }
                  className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">
                  {activity.Status?.Name || "เปิดรับสมัคร"}
                </span>
              </div>
            </div>
          </div>

          {/* Club Info */}
          <div
            className={`bg-white rounded-xl shadow-lg p-6 ${
              canManageActivity ? "lg:col-span-1" : ""
            }`}
          >
            <h3 className="font-bold text-gray-800 mb-3">จัดโดย</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {activity.Club?.Name?.[0] || "C"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {activity.Club?.Name || "ชมรม"}
                </p>
                <p className="text-sm text-gray-600">ชมรมจัดกิจกรรม</p>
              </div>
            </div>
          </div>

          {/* Management Panel - Only show for club admins */}
          {canManageActivity && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl shadow-lg p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  จัดการกิจกรรม
                </h3>
                <button
                  onClick={() => setShowManageMenu(!showManageMenu)}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 text-orange-600" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleEditActivity}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-100 rounded-lg transition-colors duration-200 text-gray-700"
                >
                  <Edit className="w-4 h-4 text-orange-600" />
                  <span>แก้ไขกิจกรรม</span>
                </button>

                <button
                  onClick={handleManageRegistrations}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-100 rounded-lg transition-colors duration-200 text-gray-700"
                >
                  <UserCheck className="w-4 h-4 text-orange-600" />
                  <span>จัดการผู้สมัคร</span>
                  <span className="ml-auto bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs">
                    {currentParticipants}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailContent;
