import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"
import md5 from "@/utils/md5"

export default withIronSession(
	async (req, res) => {
		// Get parameters from url		
		const { params } = req.query;
		const [authType, action] = params;
		const isPOST = req.method === "POST";

		if (authType === "admin") { // Authenticate to admin page
			
			if (action === "login" && isPOST) {
				
				const { username, password } = req.body;
				
				const result = await excuteQuery({
					query: 'SELECT * FROM tb_admin WHERE username = ? AND password = ? LIMIT 1',
					values: [username, md5(password)],
				});
				if (result.length) {
					await excuteQuery({
						query: 'UPDATE tb_admin SET last_login = ? WHERE id_admin = ? LIMIT 1',
						values: [new Date(), result[0].id_admin],
					});
					req.session.set("admin", {
						id_admin: result[0].id_admin, 
						last_login: result[0].last_login
					});
					await req.session.save();
					return res.status(201).send("");
				} else return res.status(403).send("");

			} else if (action === "logout") {
				
				req.session.unset("admin");
				await req.session.save();
				return res.redirect(307, '/admin')

			} else if (action === "change-password") {
				
				const { oldPassword, newPassword, confirmPassword } = req.body;
				const { id_admin } = req.session.get("admin");

				const result = await excuteQuery({
					query: 'SELECT * FROM tb_admin WHERE id_admin = ? AND password = ? LIMIT 1',
					values: [id_admin, md5(oldPassword)],
				});
				if (result.length && newPassword === confirmPassword) {
					await excuteQuery({
						query: 'UPDATE tb_admin SET password = ? WHERE id_admin = ? LIMIT 1',
						values: [md5(newPassword), id_admin],
					});
					return res.status(201).send("");
				} else return res.status(403).send("");

			} else return res.status(503).send("");

		} else if (authType === "kuesioner") { // Authenticate to kuesioner page
			
			if (action === "login" && isPOST) {
				
				const { id_kuesioner, passcode } = req.body;
				
				const result = await excuteQuery({
					query: 'SELECT * FROM tb_kuesioner WHERE id_kuesioner = ? AND passcode = ? LIMIT 1',
					values: [id_kuesioner, md5(passcode)],
				});

				if (result.length) {

					req.session.set(result[0].id_kuesioner, true);
					await req.session.save();
					return res.status(201).send("");

				} else return res.status(403).send("");

			} else if (action === "logout") {

				const id_kuesioner = params[2]
				req.session.unset(id_kuesioner);
				await req.session.save();
				return res.status(201).send("");
				
			} else return res.status(503).send("");

		} else return res.status(403).send("");

	}, sessionConfig
);
  