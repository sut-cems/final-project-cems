import { useEffect, useState } from "react";
import Navbar from '../../components/Home/Navbar';
import Footer from '../../components/Home/Footer';
import Content from '../../components/Activities/CreateActivitiesContent';
import { fetchClubMembersByUserID } from "../../services/http";


const EditActivitiesPage: React.FC = () => {
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
        <Content clubId={clubId}/>
      <Footer />
    </>
  );
};

export default EditActivitiesPage;
