import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Hero from './components/Hero';
import QuickServices from './components/QuickServices';
import Features from './components/Features';
import Footer from './components/Footer';

function App() {

  useEffect(() => {

   AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

    // Wait for layout to stabilize then refresh AOS
    window.addEventListener('load', () => {
      AOS.refresh();
    });

  }, []);

  return (
    <>
      <Navbar />
      <AnnouncementBar />
      <Hero />
      <QuickServices />
      <Features />
      <Footer />
    </>
  );
}

export default App;