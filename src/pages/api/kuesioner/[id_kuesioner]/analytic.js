import { withIronSession } from "next-iron-session";
import sessionConfig from "@/configs/session.config";
import excuteQuery from "@/services/mysql"

export default withIronSession(
	async (req, res) => {
		const { id_kuesioner } = req.query;
		
		if (!req.session.get("admin")) 
			return res.status(403).send({ message: "Forbidden" });

		// Ambil detail kuesioner

			const dKuesioner = await excuteQuery({
				query: `SELECT * FROM tb_kuesioner WHERE id_kuesioner = ? LIMIT 1`,
				values: [id_kuesioner],
			});

			if (dKuesioner.length === 0) 
				return res.status(404).send({ message: "Not Found" });

			const kuesioner = dKuesioner[0];

		// Ambil detail responden
			const oneIdFromPernyataan = await excuteQuery({
				query: `SELECT id_pernyataan FROM tb_pernyataan WHERE id_kuesioner = ? LIMIT 1`,
				values: [id_kuesioner],
			});

			const ambil_total_responden = await excuteQuery({
				query: `SELECT COUNT(id_responden) as total FROM tb_jawaban WHERE id_pernyataan = ?`,
				values: [oneIdFromPernyataan[0].id_pernyataan],
			});
			
			let responden = {
				total: 0,
				l: 0,
				p: 0,
				anak: 0,
				remaja: 0,
				dewasa: 0,
				lansia: 0,
			}

			if (ambil_total_responden[0].total > 0) {
				
				const ambil_laki = await excuteQuery({
					query: `SELECT COUNT(j.id_responden) as total FROM tb_jawaban j INNER JOIN tb_responden r ON j.id_responden = r.id_responden WHERE id_pernyataan = ? AND jenis_kelamin = 'L'`,
					values: [oneIdFromPernyataan[0].id_pernyataan],
				});

				const ambil_anak = await excuteQuery({
					query: `SELECT COUNT(j.id_responden) as total FROM tb_jawaban j INNER JOIN tb_responden r ON j.id_responden = r.id_responden WHERE id_pernyataan = ? AND usia < 18`,
					values: [oneIdFromPernyataan[0].id_pernyataan],
				});

				const ambil_remaja = await excuteQuery({
					query: `SELECT COUNT(j.id_responden) as total FROM tb_jawaban j INNER JOIN tb_responden r ON j.id_responden = r.id_responden WHERE id_pernyataan = ? AND usia BETWEEN 18 AND 25`,
					values: [oneIdFromPernyataan[0].id_pernyataan],
				});

				const ambil_dewasa = await excuteQuery({
					query: `SELECT COUNT(j.id_responden) as total FROM tb_jawaban j INNER JOIN tb_responden r ON j.id_responden = r.id_responden WHERE id_pernyataan = ? AND usia BETWEEN 26 AND 45`,
					values: [oneIdFromPernyataan[0].id_pernyataan],
				});

				const ambil_lansia = await excuteQuery({
					query: `SELECT COUNT(j.id_responden) as total FROM tb_jawaban j INNER JOIN tb_responden r ON j.id_responden = r.id_responden WHERE id_pernyataan = ? AND usia >= 46`,
					values: [oneIdFromPernyataan[0].id_pernyataan],
				});

				responden = {
					total: ambil_total_responden[0].total,
					l: ambil_laki[0].total,
					p: ambil_total_responden[0].total - ambil_laki[0].total,
					anak: ambil_anak[0].total,
					remaja: ambil_remaja[0].total,
					dewasa: ambil_dewasa[0].total,
					lansia: ambil_lansia[0].total,
				}

			}
		// Ambil detail pernyataan

			const dPernyataan = await excuteQuery({
				query: `SELECT *, SUM(harapan) as tharapan, SUM(kinerja) as tkinerja FROM tb_pernyataan p LEFT JOIN tb_jawaban j ON p.id_pernyataan = j.id_pernyataan WHERE id_kuesioner = ? GROUP BY p.id_pernyataan`,
				values: [id_kuesioner],
			});

			const pernyataan = await Promise.all(dPernyataan.map(async (item) => {
				if (ambil_total_responden[0].total > 0)
					return {
						pernyataan: item.pernyataan,
						harapan: item.tharapan,
						kinerja: item.tkinerja,
					}
				return {
					pernyataan: item.pernyataan,
					harapan: 0,
					kinerja: 0,
				}
				
			}));
					
		
		return res.status(200).send({ kuesioner, responden, pernyataan });
		

	}, sessionConfig
);
  