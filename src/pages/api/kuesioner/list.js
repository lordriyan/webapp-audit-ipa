import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { admin } = req.query;
		if (method === "GET") {
			if (admin !== undefined && req.session.get("admin") !== undefined) {
				const result = await excuteQuery({
					query: `SELECT id_kuesioner
								 , judul
								 , deskripsi
								 , LENGTH(passcode) as isPass
								 , start_date
								 , end_date
							  FROM tb_kuesioner 
							 WHERE publish = 1`,
					values: [],
				});
				res.status(200).json({
					status: 200,
					message: "Success",
					data: result,
				});
			} else {
				const result = await excuteQuery({
					query: `SELECT id_kuesioner
								 , judul
								 , deskripsi
								 , LENGTH(passcode) as isPass 
							  FROM tb_kuesioner 
							 WHERE publish = 1 
							   AND start_date <= CURDATE() 
							   AND end_date >= CURDATE()`,
					values: [],
				});
				res.status(200).json({
					status: 200,
					message: "Success",
					data: result,
				});
			}
			
		} else {
			return res.status(503).send("");
		}


	}, sessionConfig
);
  