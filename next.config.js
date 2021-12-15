const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
	modifyVars: {},
	lessVarsFilePath: './src/styles/variables.less',
	lessVarsFilePathAppendToEndOfContent: true,
	cssLoaderOptions: {},
	webpack(config) {
		return config;
	},
	webpack5: true,
	images: {
		domains: ['drive.google.com'],
	}
});