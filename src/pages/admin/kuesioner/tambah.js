import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
	Col,
	Row,
	Steps,
	Button,
	Form,
	Input,
	Checkbox,
	Select,
	DatePicker,
	message
} from "antd";

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function KuesionerTambah({ add_kuesioner }) {
	const [step, setStep] = useState(0)
	const [kuesionerId, setKuesionerId] = useState(null)
	const [kpublic, setKPublic] = useState(false)
	const router = useRouter();

	useEffect(() => {
		if (add_kuesioner) {
			setKuesionerId(add_kuesioner.id_kuesioner)
			setStep(add_kuesioner.step)
		}
	}, [])

	const onFinishStep1 = async (values) => {
		// Simpan ke database, dan ambil id kuesionernya, lalu lanjut ke step 2
		const {judul, deskripsi, scale, date} = values;
		const [startDate, endDate] = date;

		const response = await fetch("/api/kuesioner/add/detail", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ 
				judul, 
				deskripsi, 
				scale, 
				startDate: startDate.format('YYYY-MM-DD'), 
				endDate: endDate.format('YYYY-MM-DD')
			})
		});
		
		if (response.ok) {
			const data = await response.json();
			// Set kuesionerId state
			setKuesionerId(data.data.insert_id);
			// Set step ke 2
			setStep(1);
		} else {
			message.error('Ada kesalahan pada sistem!')
		}
	};

	const onFinishStep2 = async (values) => {
		const { pernyataan } = values;

		const response = await fetch("/api/kuesioner/add/pernyataan", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				kuesionerId,
				pernyataan
			})
		});

		if (response.ok) {
			// Set step ke 2
			setStep(2);
		} else {
			message.error('Ada kesalahan pada sistem!')
		}
	};

	const onFinishStep3 = async (values) => {
		const response = await fetch("/api/kuesioner/add/passcode", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values)
		});
		if (response.ok) {
			return router.push(`/admin/kuesioner/${kuesionerId}`);
		} else {
			message.error('Ada kesalahan pada sistem!')
		}
	};

	  
	return (<div className="container">
		<Row>
			<Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
				<div style={{ margin: "30px 0" }}>
					<h1>Kuesioner Baru</h1>
					<p>Silahkan lengkapi form dibawah ini</p>
				</div>
				<div>
					<Steps current={step}>
						<Step title={"Detail"} />
						<Step title={"Pernyataan"} />
						<Step title={"Selesai"} />
					</Steps>
					<div style={{ margin: '60px 0'}}>
						{step === 0 && <div>
							<Form
								name="basic"
								labelCol={{ span: 8 }}
								wrapperCol={{ span: 10 }}
								initialValues={{ remember: true }}
								onFinish={onFinishStep1}
								autoComplete="off"
							>
								<Form.Item
									label="Judul"
									name="judul"
									rules={[{ required: true, message: 'Masukan judul kuesioner!' }]}
								>
									<Input />
								</Form.Item>

								<Form.Item
									label="Deskripsi"
									name="deskripsi"
									rules={[{ required: false, message: 'Masukan deskripsi kuesioner!' }]}
								>
									<TextArea rows={4} />
								</Form.Item>

								<Form.Item
									label="Skala"
									name="scale"
									rules={[{ required: true, message: 'Tentukan skala pengukurannya!' }]}
								>
									<Select
										placeholder="4..5"
									>
										<Option value="4">4</Option>
										<Option value="5">5</Option>
									</Select>
								</Form.Item>

								<Form.Item
									label="Rentang Tanggal"
									name="date"
									rules={[{ required: true, message: 'Tentukan rentang harinya!' }]}
								>
									<RangePicker />
								</Form.Item>

								<Form.Item wrapperCol={{ offset: 8, span: 10 }}>
									<Link href="/admin">
										<Button>
											Batalkan
										</Button>
									</Link>
									&nbsp;
									<Button type="primary" htmlType="submit">
										Simpan & Lanjutkan
									</Button>
								</Form.Item>
							</Form>
						</div>}
						{step === 1 && <div>
							<Form
								name="basic"
								labelCol={{ span: 5 }}
								wrapperCol={{ span: 15 }}
								initialValues={{ remember: true }}
								onFinish={onFinishStep2}
								autoComplete="off"
							>
								<Form.Item
									label="Pernyataan"
									name="pernyataan"
									rules={[{ required: true, message: 'Masukan penyataan!' }]}
								>
									<TextArea rows="20" placeholder="Pernyataan pertama sebaris [ENTER]
Pernyataan kedua sebaris [ENTER]
Pernyataan ketiga sebaris [ENTER]
..
..
Pernyataan n sebaris [ENTER]" allowClear />
								</Form.Item>

								<Form.Item wrapperCol={{ offset: 5, span: 10 }}>
									<Button type="primary" htmlType="submit">
										Simpan & Lanjutkan
									</Button>
								</Form.Item>
							</Form>
						</div>}
						{step === 2 && <div>
							<Form
								name="basic"
								labelCol={{ span: 8 }}
								wrapperCol={{ span: 10 }}
								initialValues={{ remember: true }}
								onFinish={onFinishStep3}
								autoComplete="off"
							>
								<Form.Item name="public" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
									<Checkbox onChange={(e) => setKPublic(e.target.checked)}>
										Publik kuesioner
									</Checkbox>
								</Form.Item>
								{
									!kpublic && (<Form.Item
										label="Passcode"
										name="passcode"
										rules={[{ required: true, message: 'Masukan passcode untuk private kuesioner!' }]}
									>
										<Input.Password />
									</Form.Item>)
								}
								<Form.Item wrapperCol={{ offset: 8, span: 10 }}>
									<Button type="primary" htmlType="submit">
										Simpan & Selesai
									</Button>
								</Form.Item>
							</Form>
						</div>}
					</div>
				</div>
			</Col>
		</Row>
	</div>);
}



const Step3 = () => {
	return (<div>
		Passcode
		Publish = 1 / 0
	</div>)
}

export const getServerSideProps = withIronSession(
	async ({ req, res }) => {
		const admin = req.session.get("admin");

		if (!admin) 
			return {
				redirect: {
					permanent: false,
					destination: "/admin/login"
				}
			}
			
		const add_kuesioner = req.session.get("add_kuesioner");

		if (add_kuesioner) 
			return {
				props: { add_kuesioner }
			}

		return {
			props: { add_kuesioner: false }
		}
	  
	}, sessionConfig
);
