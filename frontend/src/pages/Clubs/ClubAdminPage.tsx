import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import ClubHeader from "../../components/Clubs/ClubHeader";
import ClubInfo from "../../components/Clubs/ClubInfo";
import ClubMemberManagePage from "../../components/Clubs/ClubMemberManage";
import { fetchUserById } from "../../services/http";

export default function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const [isPresidentOfClub, setIsPresidentOfClub] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserIsPresident = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || !id) {
        setIsPresidentOfClub(false);
        setLoading(false);
        return;
      }

      try {
        const user = await fetchUserById(parseInt(userId));
        const clubMember = user.ClubMembers?.find(
          (cm: any) => cm.ClubID === parseInt(id) && cm.Role === "president"
        );
        setIsPresidentOfClub(!!clubMember);
      } catch {
        setIsPresidentOfClub(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserIsPresident();
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center text-red-500 font-semibold">
          ไม่พบชมรม
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ClubHeader clubId={id} />
      <ClubInfo clubId={id} />
      {!loading && isPresidentOfClub && <ClubMemberManagePage />}
      <Footer />
    </>
  );
}
