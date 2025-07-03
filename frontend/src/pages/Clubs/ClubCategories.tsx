import { useState } from "react";
import Navbar from "../../components/Home/Navbar";
import Footer from "../../components/Home/Footer";
import HeroBanner from "../../components/Clubs/HeroBanner";
import ClubCategories from "../../components/Clubs/ClubCategories";

export default function Clubs() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar />
      <HeroBanner searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ClubCategories searchTerm={searchTerm} />
      <Footer />
    </>
  );
}
