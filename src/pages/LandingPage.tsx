import backgroundImage from "@/assets/background.jpg";

const LandingPage = () => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
    </div>
  );
};

export default LandingPage;
