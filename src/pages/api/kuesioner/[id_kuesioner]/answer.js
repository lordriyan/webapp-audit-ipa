import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"
import md5 from "@/utils/md5"

import _ from "lodash"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { id_kuesioner } = req.query;
		
		if (method === "POST") {
			const { responden, answer } = req.body;

			const result1 = await excuteQuery({
				query: 'SELECT LENGTH(passcode) as private FROM tb_kuesioner WHERE id_kuesioner = ? LIMIT 1',
				values: [id_kuesioner],
			});
			let lock = result1[0].private == 0 ? false : true;
			if (lock && !req.session.get(`kuesioner_${id_kuesioner}`)) return res.status(401).send("");

			// tambah ke tb_responden
			const respondenSql = await excuteQuery({
				query: 'INSERT INTO tb_responden VALUES (NULL, ?, ?, ?)',
				values: [responden.nama, responden.usia, responden.jenis_kelamin],
			});

			// Ambil id pernyataan apa saja yang dijawab
				let id_per = [];
				_.forEach(answer, async (item, key) => {
					const [pos, id] = key.split("_");
					if (!id_per.includes(id)) {
						id_per.push(id);
					}
				})

			// Create sql string
				let sql = "INSERT INTO tb_jawaban VALUES ";
				_.forEach(id_per, async (id) => {
					let X = answer[`x_${id}`]
					let Y = answer[`y_${id}`]
					sql += `(${id}, ${respondenSql.insertId}, ${Y}, ${X}), `
				})
				sql = sql.slice(0, -2);
			
			const jawabanSql = await excuteQuery({
				query: sql,
				values: [],
			});

			return res.status(200).send("");
			
		}
		return res.status(503).send("");

	}, sessionConfig
);
  