import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"
import md5 from "@/utils/md5"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { id_kuesioner } = req.query;
		
		if (method === "POST") {
			const { passcode } = req.body;

			const result = await excuteQuery({
				query: `SELECT id_kuesioner 
						  FROM tb_kuesioner 
						 WHERE id_kuesioner = ? 
						   AND passcode = ? 
						 LIMIT 1`,
				values: [id_kuesioner, md5(passcode)],
			});

			if (result.length > 0) {
				req.session.set(`kuesioner_${id_kuesioner}`, true);
				await req.session.save();
				return res.status(200).send("");
			}
			return res.status(401).send("");
			
		}
		return res.status(503).send("");

	}, sessionConfig
);
  