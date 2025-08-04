import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Users, Clock } from 'lucide-react';
import { GetCategoriesWithClubs, ApproveClub, RejectClub } from '../../services/http/clubs';
import SuccessNotification from '../../components/Clubs/SuccessNotification';
import ConfirmModal from '../../components/Clubs/ConfirmModal';

interface Club {
  ID: number;
  Name: string;
  Description: string;
  Status: {
    Name: string;
  } | null;
}

const statusMap: Record<string, string> = {
  'รอการอนุมัติ': 'pending',
  'อนุมัติแล้ว': 'approved',
  'ถูกระงับ': 'suspended',
};

const ClubApprovalPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState({
    isOpen: false,
    text: '',
    type: 'success' as 'success' | 'error',
  });
  const [filterStatus, setFilterStatus] = useState('รอการอนุมัติ');
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'remove',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchAllClubs = async () => {
    setLoading(true);
    try {
      const res = await GetCategoriesWithClubs();
      console.log("🐛 Clubs API response", res);

      if (res?.data) {
        const allClubs = res.data.flatMap((category: any) => {
          if (!category.clubs) return []; // ✅ ป้องกัน error map undefined
          return category.clubs.map((club: any) => ({
            ID: club.id,
            Name: club.name,
            Description: club.description,
            Status: club.status || null,
          }));
        });
        setClubs(allClubs);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      console.error("❌ Error loading clubs:", error);
      setMessage({
        isOpen: true,
        text: 'โหลดข้อมูลชมรมล้มเหลว',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClubs();
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      const res = await ApproveClub(id.toString());
      if (res?.status === 200 || res?.message) {
        fetchAllClubs();
        setMessage({ isOpen: true, text: 'อนุมัติชมรมแล้ว', type: 'success' });
      }
    } catch (error) {
      setMessage({ isOpen: true, text: 'เกิดข้อผิดพลาดในการอนุมัติ', type: 'error' });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReject = async (id: number) => {
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      const res = await RejectClub(id.toString());
      if (res?.status === 200 || res?.message) {
        fetchAllClubs();
        setMessage({ isOpen: true, text: 'ปฏิเสธชมรมแล้ว', type: 'success' });
      }
    } catch (error) {
      setMessage({ isOpen: true, text: 'เกิดข้อผิดพลาดในการปฏิเสธ', type: 'error' });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const filteredClubs = clubs.filter(
    club => club.Status?.Name?.toLowerCase() === statusMap[filterStatus]
  );

  return (
    <>
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={() => {
          modalState.onConfirm();
          setModalState({ ...modalState, isOpen: false });
        }}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
      />

      <SuccessNotification
        isOpen={message.isOpen}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ ...message, isOpen: false })}
        autoClose={true}
        duration={4000}
      />

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">จัดการชมรมทั้งหมด</h1>
            </div>
            <div className="flex gap-2">
              {['รอการอนุมัติ', 'รับรองแล้ว', 'ถูกระงับ'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">สถานะ: {filterStatus}</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีชมรมในสถานะนี้</h3>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClubs.map((club, index) => (
                  <div
                    key={club.ID}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } ${processingIds.has(club.ID) ? 'opacity-75' : ''}`}
                  >
                    <div className="col-span-3 font-medium text-gray-900">{club.Name}</div>
                    <div className="col-span-5 text-gray-700">{club.Description}</div>
                    <div className="col-span-3 flex items-center gap-2">
                      {filterStatus === 'รอการอนุมัติ' && (
                        <>
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: 'approve',
                                title: 'ยืนยันการอนุมัติชมรม',
                                message: `คุณต้องการอนุมัติชมรม "${club.Name}" หรือไม่?`,
                                onConfirm: () => handleApprove(club.ID),
                              })
                            }
                            disabled={processingIds.has(club.ID)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4" /> อนุมัติ
                          </button>
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: 'remove',
                                title: 'ยืนยันการปฏิเสธชมรม',
                                message: `คุณต้องการปฏิเสธชมรม "${club.Name}" หรือไม่?`,
                                onConfirm: () => handleReject(club.ID),
                              })
                            }
                            disabled={processingIds.has(club.ID)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4" /> ปฏิเสธ
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredClubs.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              <div>แสดง {filteredClubs.length} รายการ</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClubApprovalPage;
