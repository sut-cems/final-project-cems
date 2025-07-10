import { useEffect, useState } from "react";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import Body from "../../components/Activities/ActivitiesManagement";
import { fetchClubMembersByUserID } from "../../services/http";

export default function ActivitiesManagement() {
  const storedId = localStorage.getItem("userId");
  const userId = storedId ? parseInt(storedId) : null;

  const [clubId, setClubId] = useState<number | null>(null);



  useEffect(() => {
    const fetchClubId = async () => {
      if (!userId) return;

      try {
        const res = await fetchClubMembersByUserID(String(userId));
        console.log('resbody:',res)
        setClubId(res.ClubID); 
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
      <Body clubId={clubId} /> 
      <Footer />
    </>
  );
}
