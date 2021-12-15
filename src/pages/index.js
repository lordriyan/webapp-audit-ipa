import Link from 'next/link'
import {
	Row, 
	Col, 
	Button,
	Typography,
	Space
} from 'antd';
import {
	BarChartOutlined,
	FileTextOutlined,
	GithubOutlined
} from '@ant-design/icons'
import { Player } from '@lottiefiles/react-lottie-player';
import style from '@/styles/modules/home.module.less'

const { Title } = Typography;

export default function Home() {
	return (<>
		<div className="container">
			<div className={style.container}>
				<Row>
					<Col md={9} xs={24}>
						<Player
							autoplay
							loop
							src="/lf20_2n1snrke.json"
							style={{ height: '300px', width: '300px' }}
						/>
					</Col>
					<Col md={15}>
						<Title>Sistem Informasi Analisis Kepuasan Pelanggan</Title>
						<Title level={4}>Menggunakan Metode <i>"Importance Performance Analysis (IPA)"</i></Title>
						<div className={style.startBtn}>
						<Space size={"small"}>
							<Link href="/kuesioner">
								<Button 
									type="primary"
									shape="round"
									icon={<FileTextOutlined />}
									size={"large"}
									>
									Daftar Kuesioner
								</Button>
							</Link>
							<Link href="/admin">
								<Button 
									type="dashed"
									shape="round"
									icon={<BarChartOutlined />}
									size={"large"}
								>
									Admin Panel
								</Button>
							</Link>
						</Space>
						</div>
						<div>
							<h3>
								Aplikasi ini bisa kamu dapatkan secara gratis di:
							</h3>
							<a href="https://github.com/lordriyan/webapp-audit-ipa" target="_blank">
								<Button 
									type="primary"
									shape="round"
									icon={<GithubOutlined />}
								>
									Git Repository
								</Button>
							</a>
						</div>
						<div className={style.version}>
							<small>v0.1.1 node.js-v16.11.1</small>
						</div>
					</Col>
				</Row>	
			</div>
		</div>
	</>)
}
