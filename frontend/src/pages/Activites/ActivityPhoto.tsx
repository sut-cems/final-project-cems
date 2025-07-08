import {
  ArrowBigLeft,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  Calendar,
} from "lucide-react";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import { useEffect, useState } from "react";
import { fetchActivityPhoto } from "../../services/http";

export default function ActivitiesPhotos() {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedActivityImages, setSelectedActivityImages] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);

  interface ActivityImage {
    url: string;
    uploadedBy: string;
    uploadedDate: string;
    uploadTime?: string;
  }

  interface Activity {
    id: number;
    title: string;
    images: ActivityImage[];
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openSlideshow = (images: any, startIndex = 0) => {
    setSelectedActivityImages(images);
    setCurrentImageIndex(startIndex);
    setShowSlideshow(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const closeSlideshow = () => {
    setShowSlideshow(false);
    setCurrentImageIndex(0);
    setSelectedActivityImages([]);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedActivityImages.length - 1 : prev - 1
    );
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedActivityImages.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 5)); // Zoom by 100% each time, max 5x
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 0.25)); // Zoom out by 100% each time, min 0.25x
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Enhanced mouse/touch handling for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      setPanPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Double click to zoom
  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      resetZoom();
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await fetchActivityPhoto();
      setActivities(res);
    };

    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col container mx-auto h-auto py-8 px-4">
        {/* Topic Section */}
        <div className="relative w-full flex items-center mb-8">
          {/* Back button */}
          <button
            className="flex items-center gap-1 px-2 py-1 text-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#640D5F] hover:text-white transition-all duration-300 hover:scale-110"
            onClick={() => window.history.back()}
          >
            <ArrowBigLeft size={16} />
            Back
          </button>

          {/* Title */}
          <h1 className="flex text-5xl mx-auto py-4 text-center font-bold bg-gradient-to-r from-purple-900 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            รูปและวิดีโอจากกิจกรรม
          </h1>
        </div>

        {/* Activity Photo Section */}
        <div className="flex flex-col gap-8">
          <div className="space-y-8">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {/* Activity Title */}
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {activity.title}
                  </h2>
                  <h2>({activity.images.length} รูป)</h2>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {activity.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-105 duration-300 hover:ring-4 hover:ring-orange-300"
                    >
                      <img
                        src={image.url}
                        alt={`Activity ${activity.id} - Image ${index + 1}`}
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-300"
                        onClick={() => openSlideshow(activity.images, index)}
                      />
                    </div>
                  ))}
                </div>

                {/* View More Button */}
                {activity.images.length > 4 && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => openSlideshow(activity.images)}
                      className="text-[#640D5F] text-sm font-medium hover:underline flex items-center"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (when no activities) */}
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium mb-2">
              ยังไม่มีรูปภาพและวิดีโอ
            </h3>
            <p className="text-center">
              เมื่อมีการอัพโหลดรูปภาพและวิดีโอจากกิจกรรม จะแสดงที่นี่
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Enhanced Slideshow */}
      {showSlideshow && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeSlideshow}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
            >
              <X size={24} />
            </button>

            {/* Activity title */}
            <div className="absolute top-4 left-4 text-white text-lg font-semibold z-10 bg-black bg-opacity-50 px-3 py-2 rounded">
              {activities.find(
                (activity) =>
                  JSON.stringify(activity.images) ===
                  JSON.stringify(selectedActivityImages)
              )?.title || "Activity"}
            </div>

            {/* Upload info in slideshow */}
            <div className="absolute top-16 left-4 z-10 bg-black bg-opacity-70 px-3 py-2 rounded text-white text-sm">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} />
                <span>
                  {selectedActivityImages[currentImageIndex]?.uploadedBy}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span className="text-xs">
                  {formatDate(
                    selectedActivityImages[currentImageIndex]?.uploadDate
                  )}{" "}
                  • {selectedActivityImages[currentImageIndex]?.uploadTime}
                </span>
              </div>
            </div>

            {/* Previous button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Current image container */}
            <div
              className="max-w-4xl max-h-full flex justify-center items-center overflow-hidden select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={selectedActivityImages[currentImageIndex].url}
                alt={`Slideshow image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    panPosition.x / zoomLevel
                  }px, ${panPosition.y / zoomLevel}px)`,
                  cursor:
                    zoomLevel > 1
                      ? isPanning
                        ? "grabbing"
                        : "grab"
                      : "default",
                }}
                draggable={false}
              />
            </div>

            {/* Next button */}
            <button
              onClick={goToNext}
              className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
            >
              <ChevronRight size={32} />
            </button>

            {/* Enhanced Zoom controls */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-10">
              <button
                onClick={zoomOut}
                className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut size={16} />
                <span className="text-sm">Zoom Out</span>
              </button>

              <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg min-w-[80px] text-center">
                <span className="text-sm font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>

              <button
                onClick={zoomIn}
                className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1"
                disabled={zoomLevel >= 5}
              >
                <ZoomIn size={16} />
                <span className="text-sm">Zoom In</span>
              </button>

              <button
                onClick={resetZoom}
                className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1"
              >
                <RotateCcw size={16} />
                <span className="text-sm">Reset</span>
              </button>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {selectedActivityImages.length}
            </div>

            {/* Thumbnail navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-4xl overflow-x-auto">
              {selectedActivityImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setZoomLevel(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex
                      ? "border-white shadow-lg"
                      : "border-gray-500 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Instructions */}
            {zoomLevel === 1 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded">
                Double-click to zoom • Use zoom controls above
              </div>
            )}

            {zoomLevel > 1 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded">
                Drag to pan • Double-click to reset zoom
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
