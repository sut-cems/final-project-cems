import ClubForm from "../../components/Clubs/ClubForm";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import { useNavigate } from "react-router-dom";

export default function CreateClub() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/clubs");
  };

  return (
    <>
      <Navbar />
      <ClubForm onBack={handleBack} />
      <Footer />
    </>
  );
}