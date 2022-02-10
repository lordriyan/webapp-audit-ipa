import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"
import md5 from "@/utils/md5"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { id_kuesioner } = req.query;
		
		if (method === "GET") {

			const result1 = await excuteQuery({
				query: `SELECT LENGTH(passcode) as private 
						  FROM tb_kuesioner 
						 WHERE id_kuesioner = ? 
						 LIMIT 1`,
				values: [id_kuesioner],
			});
			let lock = result1[0].private == 0 ? false : true;
			if (lock && !req.session.get(`kuesioner_${id_kuesioner}`)) return res.status(401).send("");

			const result = await excuteQuery({
				query: `SELECT id_pernyataan
							 , pernyataan 
						  FROM tb_pernyataan 
						 WHERE id_kuesioner = ?`,
				values: [id_kuesioner],
			});

			if (result.length > 0) return res.status(200).json({
				status: 200,
				message: "Success",
				data: result,
			});
			return res.status(401).send("");
			
		}
		return res.status(503).send("");

	}, sessionConfig
);
  