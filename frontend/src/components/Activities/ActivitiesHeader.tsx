import React from 'react';
import { Calendar, Search } from 'lucide-react';

interface Props {
  onSearchChange: (term: string) => void;
}

const ActivityHeader: React.FC<Props> = ({ onSearchChange }) => {
  return (
    <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              กิจกรรมทั้งหมด
            </h1>
          </div>
          <p className="text-white/80 text-lg mb-6">
            ค้นพบกิจกรรมที่น่าสนใจจากชมรมต่าง ๆ
          </p>

          {/* Search input */}
          <div className="max-w-xl mx-auto">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Search className="text-white mr-2 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหากิจกรรม..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent placeholder-white/70 text-white w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeader;
