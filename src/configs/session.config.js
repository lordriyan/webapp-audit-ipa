module.exports = {
	cookieName: "MYSITECOOKIE",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production"
	},
	password: process.env.APPLICATION_SECRET
}