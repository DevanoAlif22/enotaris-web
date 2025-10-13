import { FileText } from "lucide-react";
import { useSettings } from "../../contexts/SettingContext";

function buildWaUrl(
  rawPhone,
  text = "Halo, saya tertarik menggunakan E-Notaris."
) {
  const fallback = "62895366141915";
  let digits = String(rawPhone || "").replace(/\D/g, "");
  if (!digits) digits = fallback;
  // normalisasi: 08xxxxx -> 62xxxxxxxxx, 8xxxx -> 62xxxx, +62... -> 62...
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (digits.startsWith("8")) digits = "62" + digits;
  if (digits.startsWith("620")) digits = "62" + digits.slice(3); // guard
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const Hero = () => {
  const { settings } = useSettings();

  const titleText =
    settings?.title_hero || "Praktik Kenotariatan Dalam Satu Platform";
  const descText =
    settings?.desc_hero ||
    "E-Notaris membantu Anda mengelola praktik notaris secara efisien. Mulai dari pembuatan akta, penyimpanan dokumen, hingga pelacakan aktivitas. Semua dalam satu platform digital yang aman dan terpercaya.";

  const waUrl = buildWaUrl(settings?.telepon);

  return (
    <section className="w-full bg-[#edf4ff] relative px-[30px] md:px-[80px]">
      <img
        src="/images/wave.png"
        alt="Decor"
        className="h-full object-cover absolute right-0 hidden md:block"
      />
      <img
        src="/images/hero-people.png"
        alt="Illustration"
        className="absolute right-10 top-10 hidden md:block w-[550px]"
        data-aos="fade-up"
        data-aos-delay="300"
      />

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left */}
        <div className="flex-1 p-4">
          <div className="h-[50px]" />

          {/* Badge */}
          <div
            className="bg-secondary-whiteBg flex md:m-0 m-auto px-[12px] py-[15px] mb-standart rounded-[24px] text-center w-[250px]"
            style={{
              boxShadow:
                "39px 47px 17px rgba(0,0,0,0), 25px 30px 16px rgba(0,0,0,0), 14px 17px 13px rgba(0,0,0,0.02), 6px 8px 10px rgba(0,0,0,0.03), 2px 2px 5px rgba(0,0,0,0.03)",
            }}
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <h4 className="text-primary-blackText text-[16px] font-medium flex">
              <FileText size={18} className="mt-[3px] ms-[5px] me-[5px]" />
              Platform Proyek Notaris
            </h4>
          </div>

          {/* Heading (ambil dari settings) */}
          <h1
            className="md:text-left text-center mb-[30px] mt-[15px] tracking-[-1.2px] text-[30px] md:text-[45px] text-[#0256c4] font-bold leading-[50px] md:leading-[60px]"
            data-aos="fade-up"
            data-aos-delay="120"
          >
            {titleText}
          </h1>

          {/* Description (ambil dari settings) */}
          <p
            className="tracking-[-0.48px] md:text-left text-center md:leading-[40px] text-[18px] leading-[25px] md:text-[20px] mb-[30px] text-primary-blackText font-normal"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {descText}
          </p>

          {/* CTA (WA dari settings.telepon) */}
          <div
            className="md:m-0 m-auto w-[300px] text-center py-3 px-4 rounded-[20px]"
            style={{
              background:
                "linear-gradient(94deg, #0256c4 -15.61%, #002d6a 94.47%)",
              boxShadow:
                "0px 20px 40px rgba(2, 86, 196, 0.3), 0px 10px 20px rgba(2, 86, 196, 0.2), 0px 5px 10px rgba(2, 86, 196, 0.15)",
            }}
            data-aos="fade-up"
            data-aos-delay="260"
          >
            <a
              href={waUrl}
              className="text-white text-[20px] font-semibold block"
              target="_blank"
              rel="noreferrer"
            >
              Mulai Proyek Notaris
            </a>
          </div>
        </div>

        {/* Right (spacer / ilustrasi) */}
        <div className="flex-1 p-4" data-aos="fade-left" data-aos-delay="150" />
      </div>
    </section>
  );
};

export default Hero;
