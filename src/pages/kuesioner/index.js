import { useState, useEffect } from 'react';
import Link from 'next/link'

import {
	Row,
	Col,
	Typography,
	Button,
} from 'antd';

import {
	EditOutlined,
	LockOutlined,
	GlobalOutlined
} from '@ant-design/icons';

import _ from 'lodash';

const { Title } = Typography;

import style from '@/styles/modules/kuesioner_list.module.less'

export default function KuesionerList() {
	
	const [kuesioner, setKuesioner] = useState([])

	useEffect(() => {
		fetch('/api/kuesioner/list', {}).then(async res => {
			let data = await res.json()
			setKuesioner(data)
		})
	}, [])

	return (
		<div className="container">
			<Row>
				<Col xs={{ span: 22, offset: 1 }} lg={{ span: 20, offset: 2 }}>
					<div className={style.container}>
						<Title>Daftar Kuesioner</Title>
						<p>Berikut kuesioner yang bisa anda isikan saat ini</p>
						<div className={style.list}>
							<Row gutter={[16, 16]}>
								{
									!_.isEmpty(kuesioner) && kuesioner.data.map(item => (
										<Col lg={6} md={8} sm={12} key={item.id_kuesioner}>
											<div className={style.item}>
												<div className={style.thumbnail}></div>
												<div className={style.info}>
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
															?	<LockOutlined style={{ color: 'red'}}/>
															:	<GlobalOutlined style={{ color: 'green'}}/>
													}
													<Link href={`/kuesioner/${item.id_kuesioner}`}>
														<Button type="primary" icon={<EditOutlined />} style={{ marginLeft: "5px" }}>
															Kerjakan
														</Button>
													</Link>
												</div>
											</div>
										</Col>
									))
								}
							</Row>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	)
}