import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Container } from "react-bootstrap";
import SlideCard from "./SlideCard";
import { SliderData } from "../../utils/SliderData"; 
import "./SliderHome.css";

const Slider = SlickSlider.default || SlickSlider;

const SliderHome = () => {
  const settings = {
    dots: true,         
    fade: true,          
    infinite: true,
    autoplay: true,      
    autoplaySpeed: 4000, 
    speed: 800,          
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,       
    waitForAnimate: false 
  };

  return (
    <section className="homeSlide pt-2 pb-2">
      <Container>
        <Slider {...settings}>
          {SliderData.map((value, index) => (
            <SlideCard 
              key={index} 
              title={value.title} 
              cover={value.cover} 
              desc={value.desc} 
            />
          ))}
        </Slider>
      </Container>
    </section>
  );
};

export default SliderHome;