import { Upload, Spin, Alert, Typography, Button, Space, message } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import ImgCrop from "antd-img-crop";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  addPhotoToActivity,
  fetchPhotosByActivityID,
} from "../../services/http/activities";
import { fetchUserById } from "../../services/http";

const { Title } = Typography;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface ActivityPhoto {
  url: string;
  uploadedBy: string;
  uploadedDate: string;
}

interface ActivityResponse {
  id: number;
  title: string;
  images: ActivityPhoto[];
}

export default function AddActivitiesPhotos() {
  const { id } = useParams<{ id: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [newFileList, setNewFileList] = useState<UploadFile[]>([]); // For new uploads
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityResponse | null>(
    null
  );
  const [userFullname, setUserFullname] = useState<string>("");

  // Fetch activity photos on component mount
  useEffect(() => {
    const fetchActivityPhotos = async () => {
      if (!id) {
        setError("Activity ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchPhotosByActivityID(Number(id));

        // Check if the API call was successful
        if (result.success === false) {
          throw new Error(result.error || "Failed to fetch activity photos");
        }

        // Assuming the result is the ActivityResponse when successful
        const data: ActivityResponse = result;
        setActivityData(data);

        // Transform API response to UploadFile format
        const transformedFileList: UploadFile[] = data.images.map(
          (photo, index) => ({
            uid: `${data.id}-${index}`,
            name: `photo-${index + 1}.jpg`,
            status: "done",
            url: photo.url,
            response: {
              uploadedBy: photo.uploadedBy,
              uploadedDate: photo.uploadedDate,
            },
          })
        );

        setFileList(transformedFileList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setFileList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityPhotos();

    const fetchUserFullname = async () => {
      const userID = localStorage.getItem("userId");
      if (userID) {
        try {
          const userData = await fetchUserById(parseInt(userID));
          setUserFullname(`${userData.FirstName} ${userData.LastName}`|| "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserFullname();
  }, [id]);

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

  // Handle save button click - upload all new photos
  // Alternative approach using base64 encoding
  const handleSave = async () => {
    if (newFileList.length === 0) {
      message.info("No new photos to upload");
      return;
    }

    setUploading(true);
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
            const result = await addPhotoToActivity(Number(id), {
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

      // Refresh the activity photos
      const result = await fetchPhotosByActivityID(Number(id));
      if (result.success !== false) {
        const data: ActivityResponse = result;
        setActivityData(data);

        const transformedFileList: UploadFile[] = data.images.map(
          (photo, index) => ({
            uid: `${data.id}-${index}`,
            name: `photo-${index + 1}.jpg`,
            status: "done",
            url: photo.url,
            response: {
              uploadedBy: photo.uploadedBy,
              uploadedDate: photo.uploadedDate,
            },
          })
        );

        setFileList(transformedFileList);
      }
    } catch (error) {
      message.error("An error occurred while uploading photos");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel button click - remove new uploads
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
    <div>
      <Navbar />

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
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
            {activityData && (
              <div style={{ marginBottom: "20px" }}>
                <Title level={2}>{activityData.title}</Title>
                <p>Total Photos: {activityData.images.length}</p>
                {newFileList.length > 0 && (
                  <p style={{ color: "#1890ff" }}>
                    New photos ready to upload: {newFileList.length}
                  </p>
                )}
              </div>
            )}

            <ImgCrop rotationSlider>
              <Upload {...uploadProps}>{"+ Upload"}</Upload>
            </ImgCrop>

            {newFileList.length > 0 && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Space>
                  <Button
                    type="primary"
                    onClick={handleSave}
                    loading={uploading}
                    disabled={uploading}
                  >
                    Save ({newFileList.length} photo
                    {newFileList.length > 1 ? "s" : ""})
                  </Button>
                  <Button onClick={handleCancel} disabled={uploading}>
                    Cancel
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
