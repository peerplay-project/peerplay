import { useEffect } from 'react';
import Layout from '../layout'
import { SnackbarProvider } from 'notistack';
import React from 'react';
export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Désactiver le défilement de la page
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Réactiver le défilement de la page lorsque le composant est démonté
    return () => {
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <SnackbarProvider maxSnack={2} anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SnackbarProvider>
  )
}