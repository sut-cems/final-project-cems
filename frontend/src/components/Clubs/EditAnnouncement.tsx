import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, FileText, Send, AlertCircle } from "lucide-react";
import {
  getClubAnnouncementbyID,
  updateClubAnnouncement,
} from "../../services/http/clubs";
import ConfirmModal from "../../components/Clubs/ConfirmModal";

const EditAnnouncement: React.FC = () => {
  const { clubId, annId } = useParams<{ clubId: string; annId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!clubId || !annId) throw new Error("พารามิเตอร์ไม่ครบ");
        const ann = await getClubAnnouncementbyID(clubId, Number(annId));
        setTitle(ann.Title ?? ann.title ?? "");
        setContent(ann.Content ?? ann.content ?? "");
      } catch (e: any) {
        setError(e?.message || "โหลดประกาศไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId, annId]);

  const doSave = async () => {
    try {
      setSaving(true);
      await updateClubAnnouncement(
        clubId!,
        Number(annId!),
        title.trim(),
        content.trim()
      );
      navigate(`/clubs/${clubId}`);
    } catch (e: any) {
      setError(e?.message || "อัปเดตประกาศไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">กำลังโหลด…</div>;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#640D5F] to-[#D91656] p-3 rounded-full">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">แก้ไขประกาศ</h2>
              <p className="text-gray-600">
                แก้ไขหัวข้อและเนื้อหา แล้วกดยืนยันเพื่อบันทึก
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">หัวข้อประกาศ</label>
              <input
                className="w-full px-4 py-3 border rounded-xl"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="text-xs text-gray-400 mt-1">
                {title.length}/100
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">เนื้อหาประกาศ</label>
              <textarea
                className="w-full px-4 py-3 border rounded-xl resize-none"
                rows={8}
                maxLength={1000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="text-xs text-gray-400 mt-1">
                {content.length}/1000
              </div>
            </div>

            {(title || content) && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  ตัวอย่าง
                </h3>
                <div className="bg-white border rounded-lg p-4">
                  {title && <h4 className="text-lg font-bold mb-2">{title}</h4>}
                  {content && (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {content}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/clubs/${clubId}`)}
                className="px-6 py-3 border-2 border-gray-300 rounded-full font-semibold hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={saving || !title.trim() || !content.trim()}
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white px-8 py-3 rounded-full font-semibold disabled:opacity-60"
              >
                <Send className="w-5 h-5" />
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="ยืนยันบันทึกการแก้ไข"
        message={`ต้องการบันทึกการแก้ไขประกาศนี้หรือไม่`}
        type="approve"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default EditAnnouncement;
