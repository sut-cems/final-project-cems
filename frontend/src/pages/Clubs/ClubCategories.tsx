import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import HeroBanner from "../../components/Clubs/HeroBanner";
import ClubCategories from "../../components/Clubs/ClubCategories";

export default function Clubs() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleCreateClub = () => {
    navigate("/create-club"); 
  };

  return (
    <>
      <Navbar />
      <HeroBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCreateClub={handleCreateClub}
      />
      <ClubCategories searchTerm={searchTerm} />
      <Footer />
    </>
  );
}
