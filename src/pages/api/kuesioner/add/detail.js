import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { judul, 
				deskripsi, 
				scale, 
				startDate,
				endDate } = req.body;

		const id_admin = req.session.get("admin").id_admin;
		
		if (method === "POST") {
			const result = await excuteQuery({
				query: 'INSERT INTO tb_kuesioner VALUES (NULL, ?, ?, ?, ?, ?, ?, "", 0)',
				values: [id_admin, judul, deskripsi, scale, startDate, endDate],
			});
			req.session.set("add_kuesioner", {
				id_kuesioner: result.insertId, 
				step: 1
			});
			await req.session.save();
			res.status(200).json({
				status: 200,
				message: "Success",
				data: {
					insert_id: result.insertId,
				},
			});
		} else {
			return res.status(503).send("");
		}


	}, sessionConfig
);
  