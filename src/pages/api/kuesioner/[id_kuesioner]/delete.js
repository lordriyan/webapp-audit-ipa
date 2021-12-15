import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"

export default withIronSession(
	async (req, res) => {
		const { method } = req;
		const { id_kuesioner } = req.query;
		
		if (!req.session.get("admin")) 
			return res.status(403).send({ message: "Forbidden" });


		if (method === "POST") {

			// Hapus di tb_responden
				const result = await excuteQuery({
					query: `SELECT j.id_responden
							  FROM tb_jawaban j
							LEFT
							  JOIN tb_pernyataan p
							    ON j.id_pernyataan = p.id_pernyataan
							 WHERE p.id_kuesioner = ?
							GROUP
								BY id_responden`,
					values: [id_kuesioner],
				})
				const list_responden = await Promise.all(result.map(async (item) => {
					return item.id_responden
				}))
				const listr = '('+list_responden.join(", ")+')'

			// Hapus di tb_jawaban
				const result0 = await excuteQuery({
					query: 'DELETE j FROM tb_jawaban j LEFT JOIN tb_pernyataan p ON j.id_pernyataan = p.id_pernyataan WHERE p.id_kuesioner = ?',
					values: [id_kuesioner],
				});

			// Hapus di tb_responden
				const result1 = await excuteQuery({
					query: `DELETE FROM tb_responden WHERE id_responden IN ${listr}`,
					values: [],
				})

			// Hapus di tb_pernyataan
				const result2 = await excuteQuery({
					query: 'DELETE FROM tb_pernyataan WHERE id_kuesioner = ?',
					values: [id_kuesioner],
				});

			// Hapus di tb_kuesioner
				const result3 = await excuteQuery({
					query: 'DELETE FROM tb_kuesioner WHERE id_kuesioner = ?',
					values: [id_kuesioner],
				});

			return res.status(200).send("");
			
		}
		return res.status(503).send("");

	}, sessionConfig
);
  