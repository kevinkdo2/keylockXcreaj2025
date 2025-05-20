/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        'azuloscuro': '#2E4EAC',
        'azulclaro': '#87B3FA',
        'verdeprincipal': '#10B981',
        'azulmuyoscuro': '#081d5c'
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
