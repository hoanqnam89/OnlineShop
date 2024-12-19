/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      scrollbar: {
        thin: {
          "scrollbar-width": "thin",
        },
        custom: {
          "scrollbar-color": "#2f3542 #d3d3d3", // Màu thanh cuộn và nền
          "scrollbar-width": "thin", // Kích thước thanh cuộn
        },
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"), // Thêm plugin này vào
  ],
};
