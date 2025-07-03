import { useParams } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import ClubHeader from "../../components/Clubs/ClubHeader";
import ClubInfo from "../../components/Clubs/ClubInfo";


export default function ClubPage() {
  const { id } = useParams<{ id: string }>();

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
      <Footer />
    </>
  );
}