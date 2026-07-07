import React from "react";
import "./Wrapper.css";

const Wrapper = () => {
 const brandLogos = [
  { name: "Apple", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" },
  { name: "Samsung", url: "https://www.vectorlogo.zone/logos/samsung/samsung-ar21.svg" }, 
  { name: "Intel", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intel/intel-original.svg" },
  { name: "Nvidia", url: "https://www.vectorlogo.zone/logos/nvidia/nvidia-ar21.svg" }, 
  { name: "Sony", url: "https://www.vectorlogo.zone/logos/sony/sony-ar21.svg" }, 
  { name: "Dell", url: "https://www.vectorlogo.zone/logos/dell/dell-ar21.svg" },
  { name: "Asus", url: "https://www.vectorlogo.zone/logos/asus/asus-ar21.svg" }, 
  { name: "AMD", url: "https://www.vectorlogo.zone/logos/amd/amd-ar21.svg" } 
];

  const infiniteBrands = [...brandLogos, ...brandLogos];

  return (
    <section 
    className="elite-marquee-wrapper my-3" aria-label="Our Trusted Tech Brands"
    >
      <div className="marquee-container">
        <div className="marquee-track">
          {infiniteBrands.map((brand, index) => (
            <div className="marquee-item" key={`${brand.name}-${index}`}>
              <img 
                src={brand.url} 
                alt={`${brand.name} official logo`} 
                className="brand-corporate-logo"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Wrapper;