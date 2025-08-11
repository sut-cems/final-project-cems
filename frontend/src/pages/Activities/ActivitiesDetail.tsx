import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import {
  fetchActivityById,
  createActivityRegister,
} from "../../services/http/activities";
import { fetchClubMembersByUserID } from "../../services/http";
import type { Activity } from "../../interfaces/IActivitys";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import ConfirmModal from "../../components/Activities/ConfirmModal";
import ActivityDetailHeader from "../../components/Activities/ActivityDetailHeader";
import ActivityDetailContent from "../../components/Activities/ActivityDetailContent";

const ActivitiesDetail: React.FC = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const userId = Number(localStorage.getItem("userId"));
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canManageActivity, setCanManageActivity] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  

useEffect(() => {
  const fetchData = async () => {
    try {
      if (id) {
        const res = await fetchActivityById(id);
        setActivity(res);

        // ตรวจสอบว่าผู้ใช้สมัครหรือยัง
        const userId = localStorage.getItem("userId");
        if (userId && res.ActivityRegistrations) {
          const alreadyRegistered = res.ActivityRegistrations.some(
            (reg) => Number(reg.UserID) === Number(userId)
          );
          setIsRegistered(alreadyRegistered);
        } else {
          setIsRegistered(false);
        }

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
    if (!userId || !activity) {
      message.error("ไม่พบข้อมูลผู้ใช้หรือกิจกรรม");
      return;
    }

    setIsLoading(true);
    try {
      await createActivityRegister(userId, activity.ID);
      setIsRegistered(true);
      message.success("สมัครกิจกรรมสำเร็จ!");
    } catch (error) {
      message.error((error as Error).message || "สมัครกิจกรรมไม่สำเร็จ");
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
          onRegisterClick={() => setIsConfirmOpen(true)} // <-- เปิด modal
          onRegister={handleRegister} // <-- ฟังก์ชันสมัครจริง
          isRegistered={isRegistered}
          isLoading={isLoading}
          canManageActivity={canManageActivity}
          isFull={
            activity.Capacity - (activity.ActivityRegistrations?.length || 0) <=
            0
          }
        />
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={async () => {
            setIsConfirmOpen(false);
            await handleRegister();
          }}
          title="ยืนยันการสมัครกิจกรรม"
          message="คุณต้องการสมัครเข้าร่วมกิจกรรมนี้หรือไม่?"
          confirmText="สมัคร"
          cancelText="ยกเลิก"
          type="info"
          isLoading={isLoading}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ActivitiesDetail;
