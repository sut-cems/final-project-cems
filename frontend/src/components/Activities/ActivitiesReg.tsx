import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import { Search, Users, Calendar } from "lucide-react";
import dayjs from "dayjs";
import {
  fetchActivityRegisterByID,
  fetchActivityRegisterStatus,
  updateActivityRegisterStatus,
} from "../../services/http/activities";
import type { ActivityRegistration } from "../../interfaces/IActivityRegistrations";
import type { ActivityRegistrationStatus } from "../../interfaces/IActivityRegistrationStatuses";

const ActivitiesReg = () => {
  const { id } = useParams<{ id: string }>();
  const [reg, setReg] = useState<ActivityRegistration[]>([]);
  const [status, setStatus] = useState<ActivityRegistrationStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadActivityRegByID = async () => {
      if (!id) return;
      try {
        const res = await fetchActivityRegisterByID(id);
        setReg(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      }
    };

    const loadActivityRegStatsu = async () => {
      if (!id) return;
      try {
        const res = await fetchActivityRegisterStatus();
        setStatus(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      }
    };

    loadActivityRegStatsu();
    loadActivityRegByID();
  }, [id]);

  const handleStatusChange = async (regId: number, newStatusId: number) => {
    try {
      await updateActivityRegisterStatus(regId.toString(), newStatusId);

      // อัปเดตสถานะใน state ทันที เพื่อ UI เปลี่ยนตาม
      setReg((prev) =>
        prev.map((r) =>
          r.ID === regId
            ? {
                ...r,
                StatusID: newStatusId,
                Status: status.find((s) => s.ID === newStatusId),
              }
            : r
        )
      );

      message.success("อัปเดตสถานะสำเร็จ");
    } catch (error) {
      message.error("อัปเดตสถานะล้มเหลว");
    }
  };

const filtered = reg.filter((r) => {
  const search = searchTerm.toLowerCase();
  const fullName = `${r.User?.FirstName || ""} ${r.User?.LastName || ""}`.toLowerCase();
  const email = r.User?.Email?.toLowerCase() || "";
  const studentId = (r.User?.StudentID || "").toLowerCase();

  const matchSearch =
    fullName.includes(search) || email.includes(search) || studentId.includes(search);

  const matchStatus =
    statusFilter === "all" || r.StatusID === Number(statusFilter);

  return matchSearch && matchStatus;
});


  const countAll = reg.length;
  const countRegistered = reg.filter(
    (r) => r.Status?.Description === "ลงทะเบียนแล้ว"
  ).length;
  const countCancel = reg.filter(
    (r) => r.Status?.Description === "ยกเลิกการลงทะเบียน"
  ).length;
  const countJoin = reg.filter(
    (r) => r.Status?.Description === "เข้าร่วมกิจกรรม"
  ).length;
  const countQuit = reg.filter(
    (r) => r.Status?.Description === "ไม่เข้าร่วมกิจกรรม"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  รายชื่อผู้สมัครกิจกรรม
                </h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  กิจกรรมพัฒนาทักษะพนักงาน 2024
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatCard
                count={countAll}
                label="ทั้งหมด"
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                count={countRegistered}
                label="ลงทะเบียนแล้ว"
                iconColor="text-green-600"
                bgColor="bg-green-100"
              />
              <StatCard
                count={countCancel}
                label="ยกเลิกการลงทะเบียน"
                iconColor="text-yellow-600"
                bgColor="bg-yellow-100"
              />
              <StatCard
                count={countJoin}
                label="เข้าร่วมกิจกรรม"
                iconColor="text-red-600"
                bgColor="bg-red-100"
              />
              <StatCard
                count={countQuit}
                label="ไม่เข้าร่วมกิจกรรม"
                iconColor="text-red-600"
                bgColor="bg-red-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, หรือแผนก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">สถานะทั้งหมด</option>
                {status.map((s) => (
                  <option key={s.ID} value={s.ID}>
                    {s.Description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    รหัสนักศึกษา
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ข้อมูลติดต่อ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-mid text-sm font-semibold text-gray-900">
                    เช็คชื่อ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((r, index) => (
                    <tr
                      key={r.ID}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.User?.StudentID}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.User?.FirstName} {r.User?.LastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.User?.Email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {dayjs(r.RegisteredAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {r.Status?.Description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={r.StatusID}
                          onChange={(e) =>
                            handleStatusChange(r.ID, Number(e.target.value))
                          }
                          className="px-2 py-1 border rounded"
                        >
                          {status.map((s) => (
                            <option key={s.ID} value={s.ID}>
                              {s.Description}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      ไม่มีข้อมูลผู้สมัคร
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  count,
  label,
  iconColor,
  bgColor,
}: {
  count: number;
  label: string;
  iconColor: string;
  bgColor: string;
}) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bgColor} rounded-lg`}>
        <Users className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{count}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  </div>
);

export default ActivitiesReg;
