import React from "react";
import type { Activity } from "../../interfaces/IActivitys";
import { API_BASE_URL } from "../../services/http";

interface Props {
  activity: Activity;
}

const ActivityDetailHeader: React.FC<Props> = ({ activity }) => {
  const imageUrl = activity.PosterImage?.startsWith("http")
    ? activity.PosterImage
    : `${API_BASE_URL}/${activity.PosterImage}`;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
      <img
        src={imageUrl}
        alt={activity.Title}
        className="w-full h-80 md:h-96 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-500/80 rounded-full text-sm font-medium backdrop-blur-sm">
            {activity.Category?.Name || "กิจกรรม"}
          </span>
          <span className="px-3 py-1 bg-green-500/80 rounded-full text-sm font-medium backdrop-blur-sm">
            {activity.Club?.Name || "ชมรม"}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
          {activity.Title}
        </h1>
      </div>
    </div>
  );
};

export default ActivityDetailHeader;