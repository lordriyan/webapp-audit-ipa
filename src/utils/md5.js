import crypto from 'crypto';

export default function hash(string) {
	try {
		return crypto.createHash('md5').update(string).digest('hex');
	} catch (error) {
		return { error };
	}
}