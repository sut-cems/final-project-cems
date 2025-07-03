import { useEffect, useState } from "react";
import Footer from "../components/Home/Footer";
import Navbar from "../components/Home/Navbar";
import Body from "../components/ActivityManagement/Body";
import { fetchClubMembersByUserID } from "../services/http"; // ✅ อย่าลืมนำเข้า

export default function Home() {
  const storedId = localStorage.getItem("userId");
  const userId = storedId ? parseInt(storedId) : null;

  const [clubId, setClubId] = useState<number | null>(null);



  useEffect(() => {
    const fetchClubId = async () => {
      if (!userId) return;

      try {
        const res = await fetchClubMembersByUserID(String(userId));
        console.log('resbody:',res)
        setClubId(res.ClubID); // ✅ สมมุติ API ตอบกลับเป็น ClubMember object
        console.log('res id:',res.ClubID)
      } catch (error) {
        console.error("Failed to fetch club info:", error);
      }
    };
    fetchClubId();
  }, [userId]);

  return (
    <>
      <Navbar />
      <Body clubId={clubId} /> {/* ✅ ส่ง clubId ผ่าน props */}
      <Footer />
    </>
  );
}
