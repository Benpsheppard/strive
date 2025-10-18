// Offline.jsx
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Offline = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#2B2D42] min-h-screen mt-15 flex flex-col items-center justify-center text-center px-4">
      <Header />
      <h2 className="text-2xl sm:text-3xl text-[#EDF2F4] font-semibold mt-10">
        Offline <span className="text-[#EF233C]">Mode</span>
      </h2>
      <p className="text-[#EDF2F4] mt-4 text-lg max-w-md">Reconnect to the Internet to view this page's content!</p>
    </section>
  );
};

export default Offline;
