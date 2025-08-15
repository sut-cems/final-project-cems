import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Send, FileText, Calendar } from "lucide-react";
import { GetClubByID, createClubAnnouncement } from "../../services/http/clubs";
import { fetchUserById } from "../../services/http";
import type { ClubMember } from "../../interfaces/IClubMembers";
import ConfirmModal from "../../components/Clubs/ConfirmModal";

interface Club {
  id: number;
  name: string;
  description: string;
  logo_image?: string;
}

interface PostAnnouncementForm {
  title: string;
  content: string;
}

const PostAnnouncement: React.FC = () => {
  const navigate = useNavigate();
  // รองรับทั้ง :id และ :clubId
  const params = useParams<{ id?: string; clubId?: string }>();
  const paramClubId = params.id ?? params.clubId ?? null;

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [presidentClubs, setPresidentClubs] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(
    paramClubId
  );

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<PostAnnouncementForm>({
    title: "",
    content: "",
  });

  const canPost = useMemo(() => !!selectedClubId, [selectedClubId]);

  const loadClub = async (cid: string) => {
    setClub(null);
    try {
      const res = await GetClubByID(cid);
      if (res) setClub(res);
    } catch (e: any) {
      setError(e?.message || "ไม่พบข้อมูลชมรม");
    }
  };

  useEffect(() => {
    if (paramClubId) {
      setSelectedClubId(paramClubId);
      loadClub(paramClubId).finally(() => setLoading(false));
    } else {
      (async () => {
        try {
          const uidRaw = localStorage.getItem("userId");
          const uid = uidRaw ? parseInt(uidRaw, 10) : 0;
          if (!uid) throw new Error("กรุณาเข้าสู่ระบบ");

          const user = await fetchUserById(uid);

          const memberships: ClubMember[] = (user?.ClubMembers || []).filter(
            (m: ClubMember) => m.Role === "president"
          );

          const clubIds = Array.from(new Set(memberships.map((m) => m.ClubID)));
          const clubs = await Promise.all(
            clubIds.map(async (cid) => {
              try {
                const c = await GetClubByID(String(cid));
                const name = c?.name ?? c?.Name ?? `ชมรม #${cid}`;
                return { id: cid, name };
              } catch {
                return { id: cid, name: `ชมรม #${cid}` };
              }
            })
          );

          setPresidentClubs(clubs);

          if (clubs.length === 1) {
            const cid = String(clubs[0].id);
            setSelectedClubId(cid);
            await loadClub(cid);
          }
        } catch (e: any) {
          setError(e?.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [paramClubId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClubId) {
      setError("กรุณาเลือกชมรมที่จะประกาศ");
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setError("กรุณากรอกหัวข้อและเนื้อหาประกาศ");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPost = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setConfirmOpen(false);

      await createClubAnnouncement(
        selectedClubId!,
        form.title.trim(),
        form.content.trim()
      );

      setSuccess(true);
      setForm({ title: "", content: "" });
      setTimeout(() => {
        navigate(club ? `/clubs/${selectedClubId}` : "/clubs");
      }, 1200);
    } catch (e: any) {
      setError(e?.message || "เกิดข้อผิดพลาดในการประกาศ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof PostAnnouncementForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-xl font-semibold">ประกาศสำเร็จ</div>
          <div className="text-gray-500 mt-1">กำลังพากลับไปหน้าชมรม…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#640D5F] to-[#D91656] p-3 rounded-full">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                สร้างประกาศใหม่
              </h2>
              <p className="text-gray-600">
                {club ? (
                  <>
                    ประกาศให้สมาชิกชมรม{" "}
                    <span className="font-semibold text-[#D91656]">
                      {club.name}
                    </span>
                  </>
                ) : presidentClubs.length > 0 ? (
                  <>เลือกชมรมที่ต้องการประกาศ</>
                ) : (
                  <>ต้องเป็นหัวหน้าชมรมอย่างน้อย 1 ชมรมเพื่อประกาศ</>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                หัวข้อประกาศ
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="ระบุหัวข้อประกาศ…"
                maxLength={100}
              />
              <div className="text-xs text-gray-400 mt-1">
                {form.title.length}/100
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                เนื้อหาประกาศ
              </label>
              <textarea
                value={form.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                placeholder="เขียนรายละเอียดประกาศของคุณ…"
                maxLength={1000}
              />
              <div className="text-xs text-gray-400 mt-1">
                {form.content.length}/1000
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Preview Section */}
            {(form.title || form.content) && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  ตัวอย่างประกาศ
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {form.title && (
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {form.title}
                    </h4>
                  )}
                  {form.content && (
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {form.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <span>
                      วันที่ประกาศ: {new Date().toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  selectedClubId
                    ? navigate(`/clubs/${selectedClubId}`)
                    : navigate("/clubs")
                }
                className="px-6 py-3 border-2 border-gray-300 rounded-full font-semibold hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={
                  !canPost ||
                  submitting ||
                  !form.title.trim() ||
                  !form.content.trim()
                }
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-3 rounded-full font-semibold shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                    กำลังประกาศ…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    ประกาศข่าวสาร
                  </>
                )}
              </button>
            </div>
          </form>
          <ConfirmModal
            isOpen={confirmOpen}
            title="ยืนยันการประกาศข่าวสาร"
            message={
              form.title
                ? `คุณต้องการประกาศหัวข้อ “${form.title}” ไปยังชมรม${
                    club ? ` ${club.name}` : ""
                  } ใช่ไหม`
                : `คุณต้องการประกาศข่าวสารไปยังชมรม${
                    club ? ` ${club.name}` : ""
                  } ใช่ไหม`
            }
            type="approve" // ใช้สไตล์สีเขียว
            onConfirm={handleConfirmPost} // ยิงจริงที่นี่
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default PostAnnouncement;
