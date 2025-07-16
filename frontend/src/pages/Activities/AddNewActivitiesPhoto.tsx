import { Upload, Spin, Alert, Space, message, Form, Divider } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import Combobox from "../../components/Combobox/Combobox";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addPhotoToActivity,
  fetchActivityAll,
} from "../../services/http/activities";
import { fetchUserById } from "../../services/http";
import { Save, X } from "lucide-react";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface ActivityOption {
  ID: number;
  Title: string;
}

export default function AddActivitiesPhotos() {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm()
  const navigate = useNavigate();;

  // State for activities
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    id ? parseInt(id) : null
  );
  const [selectedActivityValue, setSelectedActivityValue] = useState<string>(
    id || ""
  );
  const [loadingActivities, setLoadingActivities] = useState(true);

  // State for photos
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [newFileList, setNewFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [userFullname, setUserFullname] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserFullname = async () => {
      const userID = localStorage.getItem("userId");
      if (userID) {
        try {
          const userData = await fetchUserById(parseInt(userID));
          setUserFullname(`${userData.FirstName} ${userData.LastName}` || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserFullname();
  }, []);

  // Fetch activities for combobox
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const result = await fetchActivityAll();
        setActivities(result);

        // Set initial value if id is provided
        if (id && result.length > 0) {
          const foundActivity = result.find(
            (activity) => activity.ID === parseInt(id)
          );
          if (foundActivity) {
            setSelectedActivityValue(foundActivity.Title);
            setSelectedActivityId(foundActivity.ID);
            form.setFieldsValue({
              activityId: foundActivity.Title,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        message.error("Failed to load activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [id, form]);

  const handleActivityChange = (value: string) => {
    // Find the activity by title
    const selectedActivity = activities.find(activity => activity.Title === value);
    if (selectedActivity) {
      setSelectedActivityId(selectedActivity.ID);
      setSelectedActivityValue(value);
      form.setFieldsValue({ activityId: value });
      // Clear new uploads when switching activities
      setNewFileList([]);
    }
  };

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    // Separate existing photos from new uploads
    const existingPhotos = fileList.filter(
      (file) => file.status === "done" && file.url
    );
    const newUploads = newFileList.filter(
      (file) => !existingPhotos.find((existing) => existing.uid === file.uid)
    );

    setNewFileList(newUploads);
    setFileList([...existingPhotos, ...newUploads]);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleSave = async () => {
    if (!selectedActivityId) {
      message.error("Please select an activity");
      return;
    }

    if (newFileList.length === 0) {
      message.info("No new photos to upload");
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of newFileList) {
        if (file.originFileObj) {
          try {
            // Convert file to base64
            const base64Url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file.originFileObj as File);
            });

            // Add the photo to the activity using base64 URL
            const result = await addPhotoToActivity(selectedActivityId, {
              url: base64Url,
              uploadedBy: userFullname,
            });

            if (result.success === false) {
              failCount++;
              console.error(`Failed to add photo ${file.name}:`, result.error);
            } else {
              successCount++;
              // Update the file status to done
              file.status = "done";
              file.response = result;
            }
          } catch (error) {
            failCount++;
            console.error(`Error uploading ${file.name}:`, error);
          }
        }
      }

      // Show results
      if (successCount > 0) {
        message.success(`Successfully uploaded ${successCount} photo(s)`);
      }
      if (failCount > 0) {
        message.error(`Failed to upload ${failCount} photo(s)`);
      }

      // Clear new file list after upload
      setNewFileList([]);
    } catch (error) {
      message.error("An error occurred while uploading photos");
      console.error("Upload error:", error);
    } finally {
      setIsSaving(false);
      navigate("/activities/photo")
    }
  };

  const handleCancel = () => {
    // Remove new uploads and keep only existing photos
    const existingPhotos = fileList.filter(
      (file) => file.status === "done" && file.url
    );
    setFileList(existingPhotos);
    setNewFileList([]);
    message.info("Upload cancelled");
  };

  const uploadProps: UploadProps = {
    listType: "picture-card",
    fileList,
    onChange,
    onPreview,
    beforeUpload: () => false, // Prevent automatic upload
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col container mx-auto h-auto justify-center items-center py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-2xl max-sm:w-md max-md:w-xl mx-4 p-6">
          <h1 className="flex justify-center text-4xl font-bold mb-6">
            เพิ่มรูปภาพใหม่สำหรับกิจกรรม
          </h1>

          <Combobox
            value={selectedActivityValue}
            onChange={handleActivityChange}
            options={activities.map((activity) => activity.Title)}
            placeholder="เลือกกิจกรรม..."
            disabled={loadingActivities}
          />

          {selectedActivityId && (
            <>


              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" />
                  <p>Loading activity photos...</p>
                </div>
              ) : error ? (
                <Alert
                  message="Error"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: "20px" }}
                />
              ) : (
                <>
                <div className="my-4">
                {newFileList.length > 0 && (
                    
                    <p style={{ color: "#1890ff" }}>
                      New photos ready to upload: {newFileList.length}
                    </p>
                  )}</div>
                
                  <Upload {...uploadProps} multiple={true} accept="image/*">
                    {"+ Upload"}
                  </Upload>

                  {newFileList.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <Space size="middle">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`flex items-center gap-1 px-4 py-2 text-center text-white bg-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#7d1470] transition-all duration-300 hover:scale-110 ${
                            isSaving ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Save size={16} />
                          {isSaving ? "กำลังบันทึกข้อมูล..." : "บันทึก"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-4 py-2 text-center text-gray-600 border-2 border-gray-400 rounded-lg font-medium hover:bg-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                        >
                          <X size={16} />
                          ยกเลิก
                        </button>
                      </Space>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}