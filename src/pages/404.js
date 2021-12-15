// Next dependencies
import Head from 'next/head'
import { useRouter } from "next/router"

export default function Custom404() {
    // Use next router
    const router = useRouter()

    return (<>
        <Head>
            <title>Error 404</title>
        </Head>
		<div>
			<h2>404!</h2>
			<p>Alamat URL: <code>{router.asPath}</code> yang kamu minta tidak ditemukan!</p>
		</div>
    </>)
}
