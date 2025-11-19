import '../styles/global.css';
import Layout from '../components/Layout';
import packageJson from '../../package.json';

function MyApp({ Component, pageProps }) {
  return (
    <Layout version={packageJson.version}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
