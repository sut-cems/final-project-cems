import React from "react";
import type { Activity } from "../../interfaces/IActivitys";
import { API_BASE_URL } from "../../services/http";

interface Props {
  activity: Activity;
}

const ActivityDetailHeader: React.FC<Props> = ({ activity }) => {
  const getImageUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const imageUrl = getImageUrl(activity.PosterImage);

  return (
    <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-4">
      {/* พื้นหลังเบลอแบบมีมิติ */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md scale-110 transform"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* แถบสีไล่ระดับเพิ่มความเด่นให้เนื้อหา */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

      {/* ภาพหลักแบบไม่เบลอ */}
      <img
        src={imageUrl}
        alt={activity.Title}
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
      />

      {/* ข้อมูลกิจกรรม */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-500/70 rounded-full text-sm font-medium backdrop-blur-sm">
            {activity.Category?.Name || "กิจกรรม"}
          </span>
          <span className="px-3 py-1 bg-green-500/70 rounded-full text-sm font-medium backdrop-blur-sm">
            {activity.Club?.Name || "ชมรม"}
          </span>
          <span className="px-3 py-1 bg-orange-500/70 rounded-full text-sm font-medium backdrop-blur-sm">
            {activity.Status?.Name || "สถานะ"}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-xl">
          {activity.Title}
        </h1>
      </div>
    </div>
  );
};

export default ActivityDetailHeader;
