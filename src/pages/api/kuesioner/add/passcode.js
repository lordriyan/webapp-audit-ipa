import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"
import md5 from "@/utils/md5"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		
		if (method === "POST") {
			let passcode = (req.body.public) ? "" : md5(req.body.passcode);
			const result = await excuteQuery({
				query: `UPDATE tb_kuesioner 
						   SET passcode = ?
						     , publish = 1 
						 WHERE id_kuesioner = ?`,
				values: [passcode, req.session.get("add_kuesioner").id_kuesioner],
			});
			console.log(result);
			req.session.unset("add_kuesioner");
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
  