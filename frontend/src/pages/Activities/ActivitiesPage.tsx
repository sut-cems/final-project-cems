import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import ActivityHeader from '../../components/Activities/ActivitiesHeader';
import GroupedActivitiesList from '../../components/Activities/GroupedActivitiesList';
import type { Activity } from '../../interfaces/IActivitys';
import { fetchActivityAll } from '../../services/http/activities';

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchActivityAll();
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const title = typeof activity.Title === 'string' ? activity.Title.toLowerCase() : '';
    const description = typeof activity.Description === 'string' ? activity.Description.toLowerCase() : '';
    const clubName = typeof activity.Club?.Name === 'string' ? activity.Club.Name.toLowerCase() : '';
    const term = searchTerm.toLowerCase();

    return (
      title.includes(term) ||
      description.includes(term) ||
      clubName.includes(term)
    );
  });

  return (
    <>
      <Navbar />
      <ActivityHeader onSearchChange={setSearchTerm} />

      <div className="container mx-auto px-4 py-8 space-y-10">
        {loading ? (
          <div className="text-center text-gray-500 text-lg">กำลังโหลดกิจกรรม...</div>
        ) : filteredActivities.length > 0 ? (
          <GroupedActivitiesList activities={filteredActivities} />
        ) : (
          <div className="text-center text-gray-400 text-xl py-16">
            ไม่พบกิจกรรมที่ตรงกับคำค้นหา
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ActivitiesPage;
