import React from "react";
import {
  ArrowRight,
  ImageOff,
  Users,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/http";
import type { Activity } from "../../interfaces/IActivitys";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const getImageUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const getStatusConfig = (statusName?: string) => {
  switch (statusName) {
    case "draft":
      return {
        text: "draft",
        bgColor: "bg-gradient-to-r from-slate-500 to-gray-600",
        textColor: "text-white",
        shadow: "shadow-slate-200",
      };
    case "pending":
      return {
        text: "pending",
        bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
        textColor: "text-white",
        shadow: "shadow-amber-200",
      };
    case "approved":
      return {
        text: "approved",
        bgColor: "bg-gradient-to-r from-emerald-500 to-green-500",
        textColor: "text-white",
        shadow: "shadow-green-200",
      };
    case "cancelled":
      return {
        text: "cancelled",
        bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
        textColor: "text-white",
        shadow: "shadow-red-200",
      };
    case "finished":
      return {
        text: "finished",
        bgColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
        textColor: "text-white",
        shadow: "shadow-indigo-200",
      };
    default:
      return {
        text: statusName || "not status",
        bgColor: "bg-gradient-to-r from-gray-400 to-gray-500",
        textColor: "text-white",
        shadow: "shadow-gray-200",
      };
  }
};


  const statusConfig = getStatusConfig(activity.Status?.Name);
  const registrationCount = activity.ActivityRegistrations?.length || 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-100 flex flex-col border border-gray-100 h-full">
      {/* Poster Image */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {activity.PosterImage ? (
          <img
            src={getImageUrl(activity.PosterImage)}
            alt={activity.Title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageOff className="w-12 h-12" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} shadow-lg ${statusConfig.shadow} backdrop-blur-sm`}
          >
            {statusConfig.text}
          </span>
        </div>

        {/* Registration Count */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border border-white/20">
            <Users className="w-3 h-3" />
            <span className="font-semibold">{registrationCount}</span>
            <span className="text-white/70">/{activity.Capacity}</span>
          </div>
        </div>

        {/* Category Badge */}
        {activity.Category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-lg text-xs font-medium">
              {activity.Category.Name}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Activity Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
              {activity.Title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2 leading-relaxed">
              {activity.Description}
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>
                  {new Date(activity.DateStart).toLocaleDateString()} -{" "}
                  {new Date(activity.DateEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="truncate">{activity.Location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="truncate">
                  {activity.Club?.Name || "ไม่ระบุ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div onClick={() => navigate(`/activities/${activity.ID}`)} className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-purple-600 group-hover:text-orange-500 transition-colors cursor-pointer">
            <span className="text-sm font-semibold">ดูรายละเอียด</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ActivityCard;
