import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GetMembersByClubID, changePresident, approveMember, removeClubMember } from "../../services/http/clubs";
import { Users, ShieldCheck, Trash2, Crown, Clock, CheckCircle, UserPlus, Settings } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface member {
  id: number;
  club_role: string;
  email: string;
  first_name: string;
  last_name: string;
  joined_at: number;
}

const ClubMemberManagePage = () => {
  const { id: clubId } = useParams();

  const [members, setMembers] = useState<member[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setPresidentId] = useState<number | null>(null);
  const [, setHasAccess] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'remove' | 'change-president' | 'approve' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await GetMembersByClubID(clubId!);
      setMembers(data);

      const currentUserId = parseInt(localStorage.getItem("userId") || "0");
      const currentUser = data.find((m: { ID: number; }) => m.ID === currentUserId);
      const currentRole = currentUser?.ClubMembers?.find(
        (cm: { ClubID: number; }) => cm.ClubID === parseInt(clubId || "0")
      )?.Role;

      if (currentRole === "president") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }

      const president = data.find((m: { ClubMembers: any[]; }) =>
        m.ClubMembers?.some((cm: { Role: string; }) => cm.Role === "president")
      );
      setPresidentId(president?.ID || null);
    } catch (e) {
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const handleRemove = (userId: number) => {
    setModalType("remove");
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleChangePresident = (userId: number) => {
    setModalType("change-president");
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleConfirmModal = async () => {
  if (!selectedUserId || !clubId || !modalType) return;

  try {
    if (modalType === "remove") {
      await removeClubMember(clubId, selectedUserId);
    } else if (modalType === "change-president") {
      const response = await changePresident(clubId, selectedUserId);
      if (response.token) {
        const currentUserId = parseInt(localStorage.getItem("userId") || "0");
        if (currentUserId === selectedUserId) {
          localStorage.setItem("token", response.token);
        }
      }
      window.location.reload(); // หรือ fetchMembers() ถ้าไม่อยาก reload ทั้งหน้า
      return;
    } else if (modalType === "approve") {
      await approveMember(clubId, selectedUserId);
    }

    await fetchMembers();
  } catch (err) {
    console.error("handleConfirmModal error:", err);
  } finally {
    setShowModal(false);
    setSelectedUserId(null);
    setModalType(null);
  }
};



  const handleApproveConfirm = (userId: number) => {
    setModalType("approve");
    setSelectedUserId(userId);
    setShowModal(true);
  };


  const pendingMembers = members.filter(m => m.club_role === "pending");
  const approvedMembers = members.filter(m => m.club_role !== "pending");

  const TabButton = ({ tab, label, icon, count }: { tab: 'pending' | 'members', label: string, icon: React.ReactNode, count: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activeTab === tab ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const PendingMemberCard = ({ member }: { member: member }) => (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{member.first_name} {member.last_name}</h3>
            <p className="text-gray-600 text-sm">{member.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-700 text-sm font-medium">รออนุมัติ</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleApproveConfirm(member.id)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            อนุมัติ
          </button>
          <button
            onClick={() => handleRemove(member.id)}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Trash2 className="w-4 h-4" />
            ปฏิเสธ
          </button>
        </div>
      </div>
    </div>
  );

  const MemberCard = ({ member }: { member: member }) => {
    const role = member.club_role;
    const isPresident = role === "president";

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isPresident ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-blue-100'
            }`}>
              {isPresident ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <Users className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{member.first_name} {member.last_name}</h3>
              <p className="text-gray-600 text-sm">{member.email}</p>
              <div className="flex items-center gap-1 mt-1">
                {isPresident ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-700 text-sm font-medium">{member.club_role}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-700 text-sm font-medium">{member.club_role}</span>
                  </>
                )}
              </div>
              
            </div>
          </div>
          {!isPresident && (
            <div className="flex gap-2">
              <button
                onClick={() => handleChangePresident(member.id)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                ตั้งเป็นหัวหน้า
              </button>
              <button
                onClick={() => handleRemove(member.id)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                ลบ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">จัดการสมาชิกชมรม</h1>
              <p className="text-gray-600 mt-1">อนุมัติสมาชิกใหม่และจัดการสมาชิกในชมรม</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <TabButton 
              tab="pending" 
              label="รออนุมัติ" 
              icon={<Clock className="w-5 h-5" />} 
              count={pendingMembers.length} 
            />
            <TabButton 
              tab="members" 
              label="สมาชิกในชมรม" 
              icon={<Users className="w-5 h-5" />} 
              count={approvedMembers.length} 
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500 text-lg">กำลังโหลดข้อมูลสมาชิก...</p>
            </div>
          ) : (
            <>
              {activeTab === 'pending' && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-800">สมาชิกที่รออนุมัติ</h2>
                    {pendingMembers.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {pendingMembers.length} คน
                      </span>
                    )}
                  </div>
                  
                  {pendingMembers.length === 0 ? (
                    <div className="text-center py-16">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">ไม่มีสมาชิกที่รออนุมัติ</h3>
                      <p className="text-gray-400">ทุกคำขอเข้าร่วมชมรมได้รับการดำเนินการแล้ว</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingMembers.map((member) => (
                        <PendingMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold text-gray-800">สมาชิกในชมรม</h2>
                    {approvedMembers.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {approvedMembers.length} คน
                      </span>
                    )}
                  </div>
                  
                  {approvedMembers.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">ยังไม่มีสมาชิกในชมรม</h3>
                      <p className="text-gray-400">เริ่มต้นด้วยการอนุมัติสมาชิกใหม่</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvedMembers.map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal */}
        <ConfirmModal
          isOpen={showModal}
          title={
            modalType === "remove"
              ? "ยืนยันการลบสมาชิก"
              : modalType === "change-president"
              ? "ยืนยันการเปลี่ยนหัวหน้าชมรม"
              : "ยืนยันการอนุมัติสมาชิก"
          }
          message={
            modalType === "remove"
              ? "คุณแน่ใจว่าต้องการลบสมาชิกคนนี้หรือไม่?"
              : modalType === "change-president"
              ? "คุณแน่ใจว่าต้องการเปลี่ยนหัวหน้าชมรมเป็นคนนี้?"
              : "คุณแน่ใจว่าต้องการอนุมัติสมาชิกคนนี้หรือไม่?"
          }
          type={modalType || 'leave'}
          onConfirm={handleConfirmModal}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </div>
  );
};

export default ClubMemberManagePage;