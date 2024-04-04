// import '../styles/global.css';
import './custom.css';
import Script from 'next/script';

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default App;
