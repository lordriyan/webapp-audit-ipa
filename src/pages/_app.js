import Head from 'next/head'
import NextNProgress from 'nextjs-progressbar';


require('@/styles/globals.less')

function MyApp({ Component, pageProps }) {
	return (<>
		<Head>
			<link rel="shortcut icon" href="cube.png" type="image/x-icon" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Sistem Informasi Analisis Kepuasan Pelanggan</title>
		</Head>
		<NextNProgress />
		<Component {...pageProps} />
	</>)
}

export default MyApp
