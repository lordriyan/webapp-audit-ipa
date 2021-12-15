import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";

import excuteQuery from "@/services/mysql"

import Moment from "moment";
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

import { useState, useEffect } from 'react';
import Link from 'next/link'
import {
	Row,
	Col,
	Button,
	Modal,
	Typography,
	Tooltip,
	Input,
	Form,
	message,
} from 'antd';
const { Title } = Typography;

import {
	PlusOutlined,
	LockOutlined,
	GlobalOutlined,
	BarChartOutlined,
	LogoutOutlined,
} from '@ant-design/icons';
import _ from 'lodash';

import style from '@/styles/modules/kuesioner_list.module.less'

export default function AdminHome({ adminSession, admin }) {

	const [kuesioner, setKuesioner] = useState([])
	const [visibleModal, setVisibleModal] = useState(false)
	const [loading, setLoading] = useState(false)
	const [cPass, setCPass] = useState({oldPassword: "", newPassword: "", confirmPassword: ""})

	useEffect(() => {
		fetch('/api/kuesioner/list?admin', {}).then(async res => {
			let data = await res.json()
			setKuesioner(data)
		})

	}, [])

	const handleOk = async () => {
		setLoading(true);

		const response = await fetch("/api/auth/admin/change-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(cPass)
		});

		if (response.ok) {
			message.success('Password berhasil diubah!');
		} else {
			message.error('Password gagal diubah!')
		}
		setLoading(false);
		handleCancel();
	}
	const handleCancel = () => {setVisibleModal(false); setCPass({oldPassword: "", newPassword: "", confirmPassword: ""})}

	return (
		<div className="container">
			<Row>
				<Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
					<div style={{ margin: "30px 0" }}>
						<h1>Hi {admin.nama}! <br />Selamat Datang di Admin Panel</h1>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px" }}>
							<div>Silahkan pilih kuesioner atau buat baru untuk lanjut</div>
							<div>
								<b>Last Login:</b> {moment(adminSession.last_login).format("DD MMMM YYYY HH:mm:ss")} &nbsp;
							</div>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div>
								<Link href={`/admin/kuesioner/tambah`}>
									<Button icon={<PlusOutlined />} type="primary"> Buat Kuesioner Baru </Button>
								</Link>
							</div>
							<div>
								<Button icon={<LockOutlined />} type="primary" onClick={() => setVisibleModal(true)}> Ganti Password </Button>
								<Modal
									visible={visibleModal}
									title="Ganti Password"
									onOk={handleOk}
									onCancel={handleCancel}
									footer={[
										<Button key="submit" type="primary" loading={loading} onClick={handleOk}>
											Ganti Password
										</Button>,
										<Button key="back" onClick={handleCancel}>
											Batal
										</Button>
									]}
								>
									Masukan password lama
									<Input.Password placeholder="Password Lama" value={cPass.oldPassword} onChange={(e) => setCPass({...cPass, oldPassword: e.target.value})}/>
									<br />
									<br />
									Masukan password baru
									<Input.Password placeholder="Password Baru" value={cPass.newPassword} onChange={(e) => setCPass({...cPass, newPassword: e.target.value})}/>
									<Input.Password placeholder="Ulangi Password Baru" value={cPass.confirmPassword} onChange={(e) => setCPass({...cPass, confirmPassword: e.target.value})}/>
								</Modal>
								&nbsp;
								<Link href={`/api/auth/admin/logout`}>
									<Button icon={<LogoutOutlined />} type="danger"> Log out </Button>
								</Link>
							</div>
						</div>
					</div>
					<div className={style.list}>
						<Row gutter={[16, 16]}>
							{
								!_.isEmpty(kuesioner)
									? 	kuesioner.data.map(item => (
											<Col lg={6} md={8} sm={12} key={item.id_kuesioner}>
												<div className={style.item}>
													<div className={style.thumbnail}></div>
													<div className={style.info}>
														<div style={{ display: "flex", fontSize: "12px", justifyContent: "space-between"}}>
															<div style={{  }}>
																{moment(item.start_date).format('DD-MM-YYYY')} s/d {moment(item.end_date).format('DD-MM-YYYY')}
															</div>
															<div>
																{
																	moment().range(new Date(item.start_date), new Date(item.end_date)).contains(new Date())
																		? <Tooltip title="Kuesioner sedang berlangsung"><b style={{ color: 'green' }}>Berlangsung</b></Tooltip>
																		: moment(new Date()).isBefore(new Date(item.start_date))
																			? <Tooltip title="Kuesioner belum dimulai"><b style={{ color: 'orange' }}>Belum Dimulai</b></Tooltip>
																			: <Tooltip title="Kuesioner sudah berakhir"><b style={{ color: 'red' }}>Berakhir</b></Tooltip>
																}
															</div>
														</div>
														<div className={style.title}>
															<Title level={4}>{item.judul}</Title>
														</div>
														<div className={style.description}>
															{item.deskripsi}
														</div>
													</div>
													<div className={style.button}>
														{
															item.isPass
																?	<Tooltip title="Kuesioner ini memakai passcode"><LockOutlined style={{ color: 'red'}}/></Tooltip>
																:	<Tooltip title="Kuesioner ini bisa diakses public"><GlobalOutlined style={{ color: 'green'}}/></Tooltip>
														}
														<Link href={`/admin/kuesioner/${item.id_kuesioner}`}>
															<Button type="primary" icon={<BarChartOutlined />} style={{ marginLeft: "5px" }}>
																Lihat Laporan
															</Button>
														</Link>
													</div>
												</div>
											</Col>
										))
									: 	""
							}
						</Row>
					</div>
				</Col>
			</Row>
		</div>
	)
}
export const getServerSideProps = withIronSession(
	async ({ req, res }) => {
		const adminSession = req.session.get("admin");
		
		if (!adminSession) 
			return {
				redirect: {
					permanent: false,
					destination: "/admin/login"
				}
			}
		
		const data = await excuteQuery({
			query: 'SELECT nama, username FROM tb_admin WHERE id_admin = ?',
			values: [adminSession.id_admin],
		});

		return {
			props: { adminSession, admin: JSON.parse(JSON.stringify(data[0])) }
		};
	  
	}, sessionConfig
);
