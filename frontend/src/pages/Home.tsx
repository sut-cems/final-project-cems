import ActivityHoursBanner from "../components/Home/ActivityHoursBanner";
import FeaturedEvents from "../components/Home/FeaturedEvents";
import Footer from "../components/Home/Footer";
import HeroSection from "../components/Home/Hero";
import Navbar from "../components/Home/Navbar";
import NotificationsAndUpdates from "../components/Home/NotificationsAndUpdates";
import PopularClubs from "../components/Home/PopularClubs";

export default function Home() {
  const storedId = localStorage.getItem('userId');
  const id = storedId !== null ? Number(storedId) : 0;

  return (
    <>
      <Navbar />
      <HeroSection />
      <PopularClubs />
      <FeaturedEvents />
      <ActivityHoursBanner />
      <NotificationsAndUpdates userId={id} />      
      <Footer />
    </>
  );
}
