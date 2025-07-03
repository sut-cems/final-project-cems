import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../services/http";
import { GetClubByID, LeaveClub, requestJoinClub } from "../../services/http/clubs";
import { fetchUserById } from "../../services/http";
import ConfirmModal from "./ConfirmModal";
import SuccessNotification from "./SuccessNotification";

interface ClubHeaderProps {
  clubId: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  logo_image?: string;
  status?: {
    ID: number;
    Name: string;
    IsActive: boolean;
  };
  category?: {
    ID: number;
    Name: string;
    Description?: string;
  };
  ClubMembers?: ClubMember[];
}

interface ClubMember {
  ID: number;
  UserID: number;
  ClubID: number;
  Role: string;
  JoinedAt: string;
}

const ClubHeader: React.FC<ClubHeaderProps> = ({ clubId }) => {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [modalConfig, setModalConfig] = useState({
          title: "",
          message: "",
          type: "join" as "join" | "leave",
        });
  const [isPresident, setIsPresident] = useState(false);
  const [showPresidentBlockModal, setShowPresidentBlockModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const checkMembershipStatusFromUser = async () => {
  const userId = localStorage.getItem("userId");
  const currentUserId = userId ? parseInt(userId, 10) : 0;

  if (!currentUserId || !clubId) {
    setIsMember(false);
    setIsPresident(false);
    setIsPending(false);
    return;
  }

  try {
    const userData = await fetchUserById(currentUserId);
    const matched = userData.ClubMembers?.find(
      (membership: ClubMember) => membership.ClubID === parseInt(clubId, 10)
    );

    const role = matched?.Role;
    setIsMember(role === "member" || role === "vice_president" || role === "president");
    setIsPresident(role === "president");
    setIsPending(role === "pending");
  } catch {
    setIsMember(false);
    setIsPresident(false);
    setIsPending(false);
  }
};


  const fetchClubData = async () => {
    if (!clubId) {
      setError("ไม่พบ ID ชมรม");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const clubResponse = await GetClubByID(clubId);
      if (!clubResponse) throw new Error("ไม่พบข้อมูลชมรม");
      setClub(clubResponse);
      await checkMembershipStatusFromUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูลชมรม";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [clubId]);

  const handleMembershipToggle = () => {
    // ถ้าเป็นหัวหน้าชมรมนี้ และจะกดออก
    if (isPresident && isMember) {
      setShowPresidentBlockModal(true);
      return;
    }

    setModalConfig({
      title: isMember ? "ออกจากชมรม" : "เข้าร่วมชมรม",
      message: isMember
        ? "คุณแน่ใจที่จะออกจากชมรมนี้หรือไม่?"
        : "คุณแน่ใจที่จะเข้าร่วมชมรมนี้หรือไม่?",
      type: isMember ? "leave" : "join",
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    setMembershipLoading(true);
    try {
      if (isMember) {
        //ถ้าเป็นสมาชิก ออกจากชมรม
        const response = await LeaveClub(clubId);
        if (response?.action === "leave") {
          setIsMember(false);
          setAlertMessage("คุณออกจากชมรมเรียบร้อยแล้ว");
        }
      } else {
        await requestJoinClub(clubId);
        setAlertMessage("ส่งคำขอเข้าร่วมชมรมเรียบร้อยแล้ว โปรดรอการอนุมัติ");
      }
      setShowSuccessAlert(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "โปรดลองอีกครั้ง";
      setError(errorMsg);
      setAlertMessage("การดำเนินการล้มเหลว: " + errorMsg);
      setShowSuccessAlert(true);
    } finally {
      setMembershipLoading(false);
    }
  };


  const getImageUrl = (path: string): string =>
    !path ? "" : path.startsWith("http") ? path : `${API_BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`;

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-[#640D5F]/90 via-[#D91656]/80 to-[#FFB200]/70 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <div className="text-xl">กำลังโหลด...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-gradient-to-br from-[#640D5F]/90 via-[#D91656]/80 to-[#FFB200]/70 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-200 mb-4">เกิดข้อผิดพลาด</div>
            <button
              onClick={() => fetchClubData()}
              className="mt-4 bg-white text-[#D91656] hover:bg-pink-100 transition px-6 py-2 rounded-lg font-semibold"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="relative bg-gradient-to-br from-[#640D5F]/90 via-[#D91656]/80 to-[#FFB200]/70 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
          <div className="text-xl text-red-200">ไม่พบข้อมูลชมรม</div>
        </div>
      </div>
    );
  }

  const logoSrc = imageError
    ? "https://aporeefnaturalpark.com/wp-content/uploads/2024/07/default-logo.png"
    : getImageUrl(club.logo_image || "");

  return (
    <div className="relative bg-gradient-to-br from-[#640D5F]/90 via-[#D91656]/80 to-[#FFB200]/70 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="bg-white rounded-full p-1 drop-shadow-xl">
          <img
            src={logoSrc}
            alt={club.name || "Club Logo"}
            className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-gray-300 shadow-lg"
            onError={() => setImageError(true)}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{club.name}</h1>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              หมวดหมู่: {club.category?.Name || "ไม่มีหมวดหมู่"}
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-6 text-white/90">
            {club.description}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleMembershipToggle}
              disabled={membershipLoading || isPending}
              className="bg-white text-[#D91656] hover:bg-pink-100 transition px-6 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {membershipLoading
                ? "กำลังดำเนินการ..."
                : isMember
                ? "ออกจากชมรม"
                : isPending
                ? "รออนุมัติ..."
                : "สมัครเข้าร่วมชมรม"}
            </button>


            <ConfirmModal
              isOpen={showConfirmModal}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              isPresident={isPresident}
              onConfirm={handleConfirmAction}
              onCancel={() => setShowConfirmModal(false)}
            />

            <ConfirmModal
              isOpen={showPresidentBlockModal}
              title="ไม่สามารถออกจากชมรมได้"
              message="คุณเป็นหัวหน้าชมรม ไม่สามารถออกจากชมรมได้"
              type="leave"
              isPresident={true}
              onConfirm={() => setShowPresidentBlockModal(false)}
              onCancel={() => setShowPresidentBlockModal(false)}
            />

            <SuccessNotification
              isOpen={showSuccessAlert}
              message={alertMessage}
              onClose={() => setShowSuccessAlert(false)}
            />
            
           {isPresident ? (
              <div className="backdrop-blur-sm rounded-lg px-4 py-2 font-medium text-white-900" style={{ backgroundColor: "#FFB200" }}>
                คุณเป็นหัวหน้าชมรมนี้
              </div>
            ) : isMember ? (
              <div className="backdrop-blur-sm rounded-lg px-4 py-2 font-medium flex items-center" style={{ backgroundColor: "#FFB200" }}>
                คุณเป็นสมาชิกของชมรมนี้
              </div>
            ) : isPending ? (
              <div className="backdrop-blur-sm rounded-lg px-4 py-2 font-medium flex items-center bg-yellow-400 text-yellow-900">
                คุณได้ส่งคำขอเข้าร่วมชมรมแล้ว
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubHeader;
