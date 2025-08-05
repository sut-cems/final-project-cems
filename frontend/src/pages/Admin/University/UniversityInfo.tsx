import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversity } from "../../../services/http/university"; // Adjust path as needed
import type { University } from "../../../interfaces/IUniversity";

export default function UniversityInfoPage() {
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversityData();
  }, []);

  const fetchUniversityData = async () => {
    try {
      setLoading(true);
      const result = await getUniversity();

      if (result.data) {
        setUniversity(result.data[0]);
      } else {
        setUniversity(null);
      }
    } catch (err) {
      console.error("Error fetching university:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUniversity = () => {
    navigate("/university-info/create");
  };

  const handleEditUniversity = () => {
    if (university) {
      navigate(`/university-info/edit/${university.ID}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="flex justify-center items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">ข้อมูลมหาวิทยาลัย</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">ข้อมูลมหาวิทยาลัย</h1>
        </div>

        {!university ? (
          // No university data - show create button
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h.01M7 3h5M12 7h8m-8 4h8m-8 4h8m-8 4h8"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ยังไม่มีข้อมูลมหาวิทยาลัย
              </h2>
              <p className="text-gray-600 mb-6">
                กรุณาเพิ่มข้อมูลมหาวิทยาลัยเพื่อเริ่มต้นใช้งาน
              </p>
            </div>
            <button
              onClick={handleCreateUniversity}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              สร้างข้อมูลมหาวิทยาลัย
            </button>
          </div>
        ) : (
          // University data exists - show university info and edit button
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-8">
                <div className="text-center mb-6">
                  {university.Logo && (
                    <img
                      src={university.Logo}
                      alt={`${university.Name} Logo`}
                      className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-4 border-gray-100"
                    />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {"มหาวิทยาลัย"}
                    {university.Name}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        ที่อยู่
                      </p>
                      <p className="text-gray-900">{university.Address}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        เบอร์โทรศัพท์
                      </p>
                      <p className="text-gray-900">{university.Phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a4 4 0 118 0v4m-4 0v10m-4-6h8"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        วันที่สร้าง
                      </p>
                      <p className="text-gray-900">
                        {new Date(university.CreatedAt).toLocaleDateString(
                          "th-TH"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        วันที่แก้ไขล่าสุด
                      </p>
                      <p className="text-gray-900">
                        {new Date(university.UpdatedAt).toLocaleDateString(
                          "th-TH"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleEditUniversity}
                    className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-[#640D5F] border-2 border-[#640D5F] hover:bg-[#640D5F] hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    แก้ไขข้อมูลมหาวิทยาลัย
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
