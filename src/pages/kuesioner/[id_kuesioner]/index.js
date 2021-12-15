import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";

import excuteQuery from "@/services/mysql"

import { useState, useEffect } from "react";
import Error from '@/pages/404'

import Link from "next/link";

import _ from "lodash";

import style from '@/styles/modules/kuesioner.module.less'

import { 
	Form, 
	Input, 
	Button, 
	message,
	Row,
	Steps,
	Col,
	InputNumber,
	Select,
	Typography,
} from 'antd';

const { Title } = Typography;
const { Option } = Select;
const { Step } = Steps;


export default function Kuesioner({ id_kuesioner, isUnlock, isError, dataK }) {
	const [step, setStep] = useState(0)
	const [unlock, setUnlock] = useState(isUnlock)
	const [loading, setLoading] = useState(false)
	const [question, setQuestion] = useState({})
	const [responden, setResponden] = useState({})
	const [scale, setScale] = useState([])
	

	const onFinish = async (values) => {
		setLoading(true)

		const passcode = values.passcode;

		const response = await fetch(`/api/kuesioner/${id_kuesioner}/unlock`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ passcode })
		});
		
		if (response.ok) {
			setUnlock(true);
		} else {
			message.error('Invalid passcode!')
		}
		
		setLoading(false)
	};

	useEffect(() => {
		if (unlock) {
			fetch(`/api/kuesioner/${id_kuesioner}/question`, {}).then(async res => {
				let data = await res.json()
				setQuestion(data)
			})
		}
	}, [unlock])

	useEffect(() => {
		if (dataK.scale == 5) setScale(["TP", "KP", "CP", "P", "SP"]);
		else setScale(["TP", "KP", "P", "SP"]);
	}, [dataK])
	const onFinishAnswerID = async (values) => {
		
		setResponden(values)
		setStep(1);
	}

	const onFinishAnswerQuestion = async (event) => {
		event.preventDefault();

		const data = {
			responden,
			answer
		}
		
		const response = await fetch(`/api/kuesioner/${id_kuesioner}/answer`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});

		if (response.ok) {
			setStep(2);
		} else {
			message.error('Ada kesalahan pada sistem!')
		}

	}

	const [answer, setAnswer] = useState({});
	
	function handleChange(e) {
		setAnswer({ ...answer, [e.target.name]: e.target.value });
	}
	

	if (!isError) {
		if (unlock) {
			return (
				<div className="container">
					<Row>
						<Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
							<div className={style.header}>
								<Title>{dataK.judul}</Title>
								<p>{dataK.deskripsi}</p>
							</div>
							<div>
								<Steps current={step}>
									<Step title={"Identitas"} />
									<Step title={"Jawaban"} />
									<Step title={"Selesai"} />
								</Steps>
							</div>
							<div style={{ padding: "80px 0"}}>
								{step === 0 && <>
									<Form
										name="basic"
										labelCol={{ span: 8 }}
										wrapperCol={{ span: 10 }}
										initialValues={{ remember: true }}
										onFinish={onFinishAnswerID}
										autoComplete="off"
									>
										<Form.Item
											label="Nama Lengkap"
											name="nama"
											rules={[{ required: false, message: 'Masukan nama lengkap!' }]}
										>
											<Input />
										</Form.Item>

										<Form.Item
											label="Umur"
											name="usia"
											rules={[{ required: true, message: 'Masukan umur!' }]}
										>
											<InputNumber min={1} />
										</Form.Item>

										<Form.Item
											label="Jenis Kelamin"
											name="jenis_kelamin"
											rules={[{ required: true, message: 'Pilih jenis kelamin!' }]}
										>
											<Select
												placeholder="Laki-laki / Perempuan"
											>
												<Option value="L">Laki-laki</Option>
												<Option value="P">Perempuan</Option>
											</Select>
										</Form.Item>

										<Form.Item wrapperCol={{ offset: 8, span: 10 }}>
											<Link href="/kuesioner">
												<Button>
													Batalkan
												</Button>
											</Link>
											&nbsp;
											<Button type="primary" htmlType="submit">
												Lanjutkan
											</Button>
										</Form.Item>
									</Form>
								</>}
								{step === 1 && <>
									<form onSubmit={onFinishAnswerQuestion} encType='multipart/form-data' className={style.table}>
										<table border="1" width="100%">
											<thead>
												<tr>
													<th rowSpan="2" width="50">No</th>
													<th rowSpan="2">Pernyataan</th>
													<th colSpan={scale.length}>T. Kepentingan</th>
													<th colSpan={scale.length}>T. Kepuasan</th>
												</tr>
												<tr>
													{
														scale.map((scale, index) => <th width="40" key={index}>{scale}</th>)
													}
													{
														scale.map((scale, index) => <th width="40" key={index}>{scale}</th>)
													}
												</tr>
											</thead>
											<tbody>
												{
													!_.isEmpty(question) && question.data.map((item, index) => {
														return (<tr key={index}>
															<td style={{ textAlign: "center" }}>{index + 1}</td>
															<td>{item.pernyataan}</td>
															{
																scale.map((scale, index) => {
																	return (<td style={{ textAlign: "center" }} key={index}>
																		<input type="radio" name={`y_${item.id_pernyataan}`} value={index} onChange={handleChange} required/>
																	</td>)
																})
															}
															{
																scale.map((scale, index) => {
																	return (<td style={{ textAlign: "center" }} key={index}>
																		<input type="radio" name={`x_${item.id_pernyataan}` } value={index} onChange={handleChange} required/>
																	</td>)
																})
															}
														</tr>)
													})
												}
											</tbody>
										</table>
										<div style={{ textAlign: "right", margin: "30px 0"}}>
											<Button onClick={() => setStep(0)}>
												Kembali
											</Button>
											&nbsp;
											<Button type="primary" htmlType="submit">
												Kirim Jawaban
											</Button>
										</div>
									</form>
								</>}
								
								{step === 2 && <div style={{ textAlign: "center", margin: "100px 0"}}>
									<h1>Terima Kasih</h1>
									<p>Jawaban anda telah kami terima</p>
									<Link href="/kuesioner">
										<Button type="primary">
											Keluar
										</Button>
									</Link>
								</div>}
							</div>
						</Col>
					</Row>
				</div>
			)
		} else {
			return (
				<div className={style.centerScreen}>
					<div>
						<Form
							name="basic"
							labelCol={{ span: 8 }}
							wrapperCol={{ span: 16 }}
							initialValues={{ remember: true }}
							onFinish={onFinish}
						>
							<Form.Item
								label="Passcode"
								name="passcode"
								rules={[{ required: true, message: 'Please input the passcode!' }]}
							>
								<Input.Password />
							</Form.Item>
							
							<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
								<Button type="primary" htmlType="submit" loading={loading}>
									Buka Kunci
								</Button>
							</Form.Item>
						</Form>
					</div>
				</div>
			)
		}
	} else {
		return <Error />
	}
}
export const getServerSideProps = withIronSession(
	async ({ req, res, query }) => {
		const { id_kuesioner } = query
		
		const result = await excuteQuery({
			query: 'SELECT id_kuesioner, judul, deskripsi, scale, LENGTH(passcode) as private FROM tb_kuesioner WHERE id_kuesioner = ? LIMIT 1',
			values: [id_kuesioner],
		});
		
		if (result.length > 0) {
			const dataK = JSON.parse(JSON.stringify(result[0]));
			if (dataK.private == 0) return { props: { id_kuesioner, isUnlock: true, isError: false, dataK } }
			if (req.session.get(`kuesioner_${id_kuesioner}`)) return { props: { id_kuesioner, isUnlock: true, isError: false, dataK } }
			return { props: { id_kuesioner, isUnlock: false, isError: false, dataK } }
		}
		return { props: { id_kuesioner, isUnlock: false, isError: true, dataK: [] } }
	  
	}, sessionConfig
);


