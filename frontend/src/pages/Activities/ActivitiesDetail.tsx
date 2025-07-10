import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchActivityById } from "../../services/http/activities";
import { fetchClubMembersByUserID } from "../../services/http";
import type { Activity } from "../../interfaces/IActivitys";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import ActivityDetailHeader from "../../components/Activities/ActivityDetailHeader";
import ActivityDetailContent from "../../components/Activities/ActivityDetailContent";

const ActivitiesDetail: React.FC = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canManageActivity, setCanManageActivity] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const res = await fetchActivityById(id);
          setActivity(res);
          // TODO: Check if user is already registered
          // setIsRegistered(checkIfUserRegistered(res.ActivityRegistrations));

          // Check if user can manage this activity
          await checkManagePermission(res);
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
      }
    };
    fetchData();
  }, [id]);

const checkManagePermission = async (activity: Activity) => {
  try {
    const userId = localStorage.getItem("userId"); // ยังใช้ userId อยู่เพื่อเรียก API

    if (!userId) {
      setCanManageActivity(false);
      return;
    }

    const clubMember = await fetchClubMembersByUserID(userId);

    // ✅ เช็คว่าเป็นประธานของชมรมที่ตรงกับ activity.ClubID
    const isClubPresident =
      clubMember.ClubID === activity.ClubID &&
      clubMember.Role === "president";

    setCanManageActivity(isClubPresident);
  } catch (err) {
    console.error("Error checking manage permission:", err);
    setCanManageActivity(false);
  }
};



  const handleRegister = async () => {
    if (!activity || isRegistered) return;

    setIsLoading(true);
    try {
      // TODO: Implement registration API call
      // await registerForActivity(activity.ID);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsRegistered(true);
      // Update activity data to reflect new registration
      setActivity((prev) =>
        prev
          ? {
              ...prev,
              ActivityRegistrations: [
                ...(prev.ActivityRegistrations || []),
                // Add new registration object
              ],
            }
          : null
      );

      alert("สมัครร่วมกิจกรรมสำเร็จ!");
    } catch (err) {
      console.error("Error registering for activity:", err);
      alert("เกิดข้อผิดพลาดในการสมัครร่วมกิจกรรม");
    } finally {
      setIsLoading(false);
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลกิจกรรม...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ActivityDetailHeader activity={activity} />
        <ActivityDetailContent
          activity={activity}
          onRegister={handleRegister}
          isRegistered={isRegistered}
          isLoading={isLoading}
          canManageActivity={canManageActivity}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ActivitiesDetail;
