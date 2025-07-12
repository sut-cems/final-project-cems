import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../services/http";
import { GetClubByID, removeClubMember, requestJoinClub } from "../../services/http/clubs";
import { fetchUserById } from "../../services/http";
import ConfirmModal from "./ConfirmModal";
import SuccessNotification from "./SuccessNotification";
import { Clock, ShieldCheck, Users } from "lucide-react";

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
  const [, setCurrentUserId] = useState<number>(0);

  const checkMembershipStatusFromUser = async () => {
    const userId = localStorage.getItem("userId");
    const parsedUserId = userId ? parseInt(userId, 10) : 0;
    setCurrentUserId(parsedUserId);

    if (!parsedUserId || !clubId) {
      setIsMember(false);
      setIsPresident(false);
      setIsPending(false);
      return;
    }

    try {
      const userData = await fetchUserById(parsedUserId);
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
        const response = await removeClubMember(clubId);
        if (response?.action === "leave") {
          setIsMember(false);
          setAlertMessage("คุณออกจากชมรมเรียบร้อยแล้ว");
        }
      } else {
        await requestJoinClub(clubId);
        setIsPending(true);
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

  const handleCancelJoin = async () => {
    setMembershipLoading(true);
    try {
      const result = await removeClubMember(clubId);
      if (result.action === "cancel" || result.action === "leave") {
        setIsPending(false);
        setAlertMessage("ยกเลิกคำขอเข้าร่วมเรียบร้อยแล้ว");
      }
      setShowSuccessAlert(true);
    } catch (err) {
      setAlertMessage("เกิดข้อผิดพลาดในการยกเลิกคำขอ");
      setShowSuccessAlert(true);
    } finally {
      setMembershipLoading(false);
    }
  };

  const getImageUrl = (path: string): string =>
    !path ? "" : path.startsWith("http") ? path : `${API_BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 animate-pulse">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200"></div>
            <div className="space-y-4 flex-1">
              <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-12 w-40 bg-gray-200 rounded-xl mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchClubData()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
      <div className="bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลชมรม</h3>
            <p className="text-gray-600 mb-6">ไม่พบชมรมที่คุณกำลังค้นหา</p>
          </div>
        </div>
      </div>
    );
  }

  const logoSrc = imageError
    ? "https://aporeefnaturalpark.com/wp-content/uploads/2024/07/default-logo.png"
    : getImageUrl(club.logo_image || "");

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Club Logo */}
          <div className="flex-shrink-0 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>
            <img
              src={logoSrc}
              alt={club.name || "Club Logo"}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Club Info */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {club.name}
                </h1>
                
                <div className="flex flex-wrap gap-2 items-center">
                  {club.category?.Name && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <svg className="mr-1.5 h-2 w-2 text-indigo-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx={4} cy={4} r={3} />
                      </svg>
                      {club.category.Name}
                    </span>
                  )}
                  
                  {club.status?.IsActive ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx={4} cy={4} r={3} />
                      </svg>
                      เปิดรับสมาชิก
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <svg className="mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx={4} cy={4} r={3} />
                      </svg>
                      ปิดรับสมาชิก
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap gap-2">
                {isPresident && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ShieldCheck className="mr-1.5 w-4 h-4" />
                    หัวหน้าชมรม
                  </span>
                )}
                
                {!isPresident && isMember && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Users className="mr-1.5 w-5 h-5" />
                    สมาชิก
                  </span>
                )}
                
                {isPending && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Clock className="mr-1.5 w-5 h-5" />
                        รออนุมัติ
                      </span>
                  )}

              </div>
            </div>

            {/* Description */}
            {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">  อย่าลืมมาแก้พื้นหลังตรงนี้ว่าจะมีสีขาวหรือจะเอาออก */}
              <p className="text-gray-700 leading-relaxed">
                {club.description}
              </p>
            {/* </div> */}

           {/* Action Button */}
            <div className="flex flex-wrap gap-4">
              
              {/* ปุ่มสมัคร/ออก/รออนุมัติ*/}
              {!isPending && (
                <button
                  onClick={handleMembershipToggle}
                  disabled={membershipLoading}
                  className={`
                    px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isMember
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                    }
                  `}
                >
                  {membershipLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isMember ? "กำลังออกจากชมรม..." : "กำลังส่งคำขอ..."}
                    </span>
                  ) : (
                    isMember ? "ออกจากชมรม" : "เข้าร่วมชมรม"
                  )}
                </button>
              )}

              {/* ปุ่มรออนุมัติ + ยกเลิกคำขอ */}
              {isPending && (
                <>
                  <button
                    disabled
                    className="px-6 py-3 rounded-xl font-medium text-sm bg-blue-100 text-blue-800 cursor-default"
                  >
                    รออนุมัติ...
                  </button>
                  <button
                    onClick={handleCancelJoin}
                    className="px-6 py-3 rounded-xl font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    ยกเลิกคำขอเข้าร่วม
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
};

export default ClubHeader;