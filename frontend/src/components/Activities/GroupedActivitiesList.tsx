import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ActivityCard from './ActivitiesCard';
import SectionTitle from './SectionTitle';
import type { Activity } from '../../interfaces/IActivitys';

interface Props {
  activities: Activity[];
}

const groupByClub = (activities: Activity[]) => {
  const grouped: { [clubName: string]: Activity[] } = {};
  for (const activity of activities) {
    const clubName = activity.Club?.Name || 'ไม่ระบุชมรม';
    if (!grouped[clubName]) {
      grouped[clubName] = [];
    }
    grouped[clubName].push(activity);
  }
  return grouped;
};

const GroupedActivitiesList: React.FC<Props> = ({ activities }) => {
  const grouped = groupByClub(activities);
  const scrollRefs = useRef<HTMLDivElement[]>([]); // ✅ ref แยกต่อแถว

  const scroll = (index: number, direction: 'left' | 'right') => {
    const scrollRef = scrollRefs.current[index];
    if (scrollRef) {
      const amount = 340;
      scrollRef.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const hasData = Object.keys(grouped).length > 0;

  return (
    <>
      {!hasData && (
        <div className="text-center text-gray-500 py-10 text-lg">
          ไม่พบข้อมูลกิจกรรมที่ตรงกับคำค้นหา
        </div>
      )}

      {Object.entries(grouped).map(([clubName, acts], index) => (
        <div key={`${clubName}-${index}`} className="relative group">
          <SectionTitle title={clubName} />

          <div className="relative">
            <button
              onClick={() => scroll(index, 'left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur border shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-purple-100"
            >
              <ChevronLeft className="w-5 h-5 text-purple-600" />
            </button>

            <button
              onClick={() => scroll(index, 'right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur border shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-purple-100"
            >
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </button>

            <div
              ref={(el) => {
                if (el) scrollRefs.current[index] = el;
              }}
              className="flex overflow-x-auto scroll-smooth scrollbar-hide px-12 py-4 gap-4"
            >
              {acts.map((activity) => (
                <div key={activity.ID} className="flex-shrink-0 w-[300px]">
                  <ActivityCard activity={activity} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default GroupedActivitiesList;
