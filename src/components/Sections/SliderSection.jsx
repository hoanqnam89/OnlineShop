import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import slider1 from "../../../public/images/slider1.jpg";
import slider2 from "../../../public/images/slider2.jpg";
import slider3 from "../../../public/images/slider3.jpg";
import slider4 from "../../../public/images/slider4.jpg";

const SliderSection = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 4000,
    cssEase: "linear",
    pauseOnHover: true,
  };
  return (
    <div className="slider-container">
      <Slider {...settings}>
        <div className="slider-item">
          <img src={slider1} alt="Slider 1" />
        </div>
        <div className="slider-item">
          <img src={slider2} alt="Slider 2" />
        </div>
        <div className="slider-item">
          <img src={slider3} alt="Slider 3" />
        </div>
        <div className="slider-item">
          <img src={slider4} alt="Slider 4" />
        </div>
      </Slider>
    </div>
  );
};

export default SliderSection;
