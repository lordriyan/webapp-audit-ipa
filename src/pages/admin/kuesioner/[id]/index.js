import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";

import excuteQuery from "@/services/mysql"

import Error from '@/pages/404'

import _ from 'lodash'

import {
	Row, 
	Col,
	Button,
	message
} from 'antd';
import {
	ArrowLeftOutlined,
	PrinterOutlined,
	DeleteOutlined,
	ReloadOutlined
} from '@ant-design/icons';

import Moment from "moment";
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

import style from '@/styles/modules/analytic.module.less'

import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	ReferenceLine,
	PieChart,
	LabelList,
	Pie,
	Cell,
} from "recharts";

export default function KuesionerAnalisis({ admin, isError, id_kuesioner }) {

	if (isError) return <Error />

	const [data, setData] = useState({})
	const [dataKartesius, setDataKartesius] = useState([])
	const [loading, setLoading] = useState(false)

	const router = useRouter();
	
	useEffect(() => {
		fetchData();
	}, [])

	const fetchData = () => {
		setLoading(true)
		fetch(`/api/kuesioner/${id_kuesioner}/analytic`, {}).then(async res => {
			const result = await res.json()
			setData(result);
			
			const k = await Promise.all(result.pernyataan.map(async (item, no) => {
				return {y: item.harapan / result.responden.total, x: item.kinerja / result.responden.total, atribut: no+1}
			}))
			setDataKartesius(k);
			setLoading(false)
		})
	}

	const removeKuesioner = async () => {
		const response = await fetch(`/api/kuesioner/${id_kuesioner}/delete`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({id_kuesioner})
		});
		if (response.ok) {
			return router.push(`/admin/`);
		} else {
			message.error('Ada kesalahan saat menghapus kuesioner!')
		}
	}
	
	return (<>
		<div className="container">
			<Row>
				<Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
					<div style={{ display: "flex", alignItems: "center", margin: "30px 0" }}>
						<div>
							<Link href="/admin/">
								<ArrowLeftOutlined style={{ fontSize: "30px", marginRight: "20px" }} />
							</Link>
						</div>
						<div style={{ flex: 1 }}>
							<h1 style={{ margin: 0 }}>{!_.isEmpty(data) && data.kuesioner.judul}</h1>
							<p style={{ margin: 0 }}>{!_.isEmpty(data) && data.kuesioner.deskripsi}</p>
							<p>{!_.isEmpty(data) && moment(data.kuesioner.start_date).format('DD-MM-YYYY')} s/d {!_.isEmpty(data) && moment(data.kuesioner.end_date).format('DD-MM-YYYY')}</p>
						</div>
						<div>
							<Button type="danger" icon={<DeleteOutlined />} onClick={removeKuesioner} loading={loading}></Button> &nbsp;
							<Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}></Button> &nbsp;
							<Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()} >Cetak Laporan</Button>
						</div>
					</div>
					<div>
						<Row>
							<Col xs={24} xl={10}>
							<div>
									<div className={style.header}>
										<h2>A. Responden</h2>
									</div>
									<div className={style.body}>
										<Row>
											<Col xs={15} xl={24}>
												<h3 style={{ margin: 0 }}>a. Total Responden</h3>
												<h1 style={{ margin: "0 30px" }}>{!_.isEmpty(data) && data.responden.total} orang</h1>
												<h3 style={{ margin: 0 }}>b. Jenis Kelamin</h3>
												<div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
													<div>
														<PieChart width={280} height={115}>
															<Pie
																data={!_.isEmpty(data) 
																	? [{ name: "Laki-Laki", value: data.responden.l },{ name: "Perempuan", value: data.responden.p }] 
																	: [{ name: "Laki-Laki", value: 0 }, { name: "Perempuan", value: 0}]}
																startAngle={180}
																endAngle={0}
																cy={110}
																innerRadius={60}
																outerRadius={80}
																fill="#8884d8"
																paddingAngle={5}
																dataKey="value"
																label
															>
																<Cell fill={"#0088FE"} />
																<Cell fill={"#f06292"} />
															</Pie>
														</PieChart>
													</div>
													<div className={style.customList}>
														<ul>
															<li>Laki-laki</li>
															<li>Perempuan</li>
														</ul>
													</div>
												</div>
											</Col>
											<Col xs={9} xl={24}>
												<h3 style={{ margin: 0 }}>c. Umur</h3>
												<div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
													<table width={200} style={{ margin: "10px" }}>
														<tbody>
															<tr>
																<td>Anak-anak ({'<'} 18)</td>
																<td>: {!_.isEmpty(data) && data.responden.anak} orang</td>
															</tr>
															<tr>
																<td>Remaja (18 - 25)</td>
																<td>: {!_.isEmpty(data) && data.responden.remaja} orang</td>
															</tr>
															<tr>
																<td>Dewasa (26 - 45)</td>
																<td>: {!_.isEmpty(data) && data.responden.dewasa} orang</td>
															</tr>
															<tr>
																<td>Lansia (&gt; 45)</td>
																<td>: {!_.isEmpty(data) && data.responden.lansia} orang</td>
															</tr>
														</tbody>
													</table>
												</div>
											</Col>
										</Row>
									</div>
								</div>
								<div style={{ marginBottom: "80px" }}>
									<div className={style.header}>
										<h2 style={{ margin: "30px 0" }}>B. Diagram Kartesius</h2>
									</div>
									<div className={style.body}>
										<div className={style.graph}>
											<div>
												{
													!_.isEmpty(dataKartesius) && <ScatterChart
														width={500}
														height={400}
													>
														<CartesianGrid />
														<XAxis type="number" dataKey="x" />
														<YAxis type="number" dataKey="y" />
														<Scatter name="Kepuasan" data={dataKartesius} fill="#dddddd">
															<LabelList dataKey="atribut" style={{ pointerEvents: "none" }} />
														</Scatter>
														<ReferenceLine y={_.sumBy(dataKartesius, 'y') / dataKartesius.length} stroke="#333333" strokeDasharray="3 3" />
														<ReferenceLine x={_.sumBy(dataKartesius, 'x') / dataKartesius.length} stroke="#333333" strokeDasharray="3 3" />
													</ScatterChart>
												}
											</div>
										</div>
									</div>
								</div>
							</Col>
							<Col xs={24} xl={14}>
								<div className={style.pernyataan}>
									<div className={style.header}>
										<h2>C. Daftar Pernyataan</h2>
									</div>
									<div className={style.body}>
										<table width="100%">
											<tbody>
												<tr>
													<th width="5%">No</th>
													<th width="63%">Pernyataan</th>
													<th width="10%">Harapan</th>
													<th width="10%">Kinerja</th>
													<th width="12%">Kesesuaian</th>
												</tr>
												{
													!_.isEmpty(data) && data.pernyataan.map((item, no) => 
														<tr key={`key-${item.pernyataan}`}>
															<td>{no+1}</td>
															<td>{item.pernyataan}</td>
															<td align="center">{item.harapan}</td>
															<td align="center">{item.kinerja}</td>
															<td align="center">{item.kinerja != 0 && item.harapan != 0 ? ((item.kinerja / item.harapan) * 100).toFixed(0) : 0}%</td>
														</tr>
													)
												}
												<tr>
													<th></th>
													<th>Total</th>
													<th align="center">{!_.isEmpty(data) && _.sumBy(data.pernyataan, 'harapan')}</th>
													<th align="center">{!_.isEmpty(data) && _.sumBy(data.pernyataan, 'kinerja')}</th>
													<th align="center">{
														!_.isEmpty(data) 
															&& (_.sumBy(data.pernyataan, 'harapan')) != 0 
															&& (_.sumBy(data.pernyataan, 'kinerja')) != 0 
																? (((_.sumBy(data.pernyataan, 'kinerja')) / (_.sumBy(data.pernyataan, 'harapan'))) * 100).toFixed(0) 
																: 0 }%</th>
												</tr>
											</tbody>
										</table>
									</div>
									<div className={style.footer}>

									</div>
								</div>
							</Col>
						</Row>
					</div>
				</Col>
			</Row>
		</div>
	</>);
	
	
}

export const getServerSideProps = withIronSession(
	async ({ req, res, query }) => {
		const admin = req.session.get("admin");
		
		if (!admin) 
			return {
				redirect: {
					permanent: false,
					destination: "/admin/login"
				}
			}
		
		const id_kuesioner = query.id

		const result = await excuteQuery({
			query: 'SELECT * FROM tb_kuesioner WHERE id_kuesioner = ?',
			values: [id_kuesioner],
		}); 

		if (result.length == 0) return {
			props: { admin, isError: true }
		};
			
		return {
			props: { 
				admin,
				isError: false,
				id_kuesioner
			}
		};
	  
	}, sessionConfig
);