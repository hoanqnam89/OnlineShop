import React, { useRef } from "react";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";

import Options from "../../components/Options/Options";
import ProfileSection from "../../components/Sections/ProfileSection";
import AddressSection from "../../components/Sections/AddressSection";
import { useSelector } from "react-redux";

const Profile = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [selectedOption, setSelectedOption] = useState("profile");

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  return (
    <div className="container">
      <div className="navbar-section">
        <Navbar />
      </div>
      <div className="content content-flex">
        <section className="profile-section">
          <ProfileSection />
        </section>
        {/* <section className="options">
          <Options width={width} />
        </section> */}
      </div>
    </div>
  );
};

export default Profile;
