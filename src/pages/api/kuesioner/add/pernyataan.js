import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { kuesionerId,
				pernyataan } = req.body;
		
		if (method === "POST") {
			const pernyataans = pernyataan.split("\n");
			let queryP = `INSERT 
							INTO tb_pernyataan 
						  VALUES `;
			pernyataans.forEach(async (i) => {
				queryP += `(NULL, '${kuesionerId}', '${i}'),`;
			})
			queryP = queryP.slice(0, -1);
			await excuteQuery({
				query: queryP,
				values: [],
			});
			req.session.set("add_kuesioner", {
				id_kuesioner: req.session.get("add_kuesioner").id_kuesioner, 
				step: 2
			});
			await req.session.save();
			res.status(200).json({
				status: 200,
				message: "Success"
			});
		} else {
			return res.status(503).send("");
		}


	}, sessionConfig
);
  