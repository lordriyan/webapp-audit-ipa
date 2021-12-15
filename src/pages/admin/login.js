import { useState } from 'react'
import {
	Row,
	Col,
	Typography,
	Form, 
	Input, 
	Button, 
	message
} from 'antd';

import { useRouter } from "next/router";
import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";

const { Title } = Typography;

export default function AdminLogin() {
	const [loading, setLoading] = useState(false)
	const router = useRouter();

	const onFinish = async (values) => {
		setLoading(true)

		const username = values.username;
		const password = values.password;

		const response = await fetch("/api/auth/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password })
		});
		
		if (response.ok) {
			return router.push("/admin");
		} else {
			message.error('Login failure!')
		}
		
		setLoading(false)
	};

	return (<>
		<div className="container" style={{ overflow: "hidden" }}>
			<Row>
				<Col xs={{ span: 22, offset: 1 }} sm={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }}>
					<div style={{ margin: "25% 0" }}>
						<div style={{ textAlign: "center", padding: "30px 0" }}>
							<Title>Admin Panel</Title>
							<h3>Mohon login terlebih dahulu sebelum lanjut!</h3>
						</div>
						<div>
							<Form
								name="basic"
								labelCol={{ span: 8 }}
								wrapperCol={{ span: 12 }}
								initialValues={{ remember: true }}
								onFinish={onFinish}
								autoComplete="on"
							>
								<Form.Item
									label="Username"
									name="username"
									rules={[{ required: true, message: 'Tolong masukan username!' }]}
								>
									<Input />
								</Form.Item>

								<Form.Item
									label="Password"
									name="password"
									rules={[{ required: true, message: 'Tolong masukan password!' }]}
								>
									<Input.Password />
								</Form.Item>

								<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" htmlType="submit" loading={loading}>
										Log in
									</Button>
								</Form.Item>
							</Form>
						</div>
						<div style={{ textAlign: "center", opacity: ".5" }}>
							v0.1.1 node.js-v16.11.1
						</div>
					</div>
				</Col>
			</Row>
		</div>
	</>)
}

export const getServerSideProps = withIronSession(
	async ({ req, res }) => {
		const admin = req.session.get("admin");

		if (admin) 
			return {
				redirect: {
					permanent: false,
					destination: "/admin"
				}
			}
		
		return {
			props: { }
		};
	  
	}, sessionConfig
);
