import { RecaptchaV3 } from 'express-recaptcha';

const { RECAPTCHA_PUBLIC_KEY, RECAPTCHA_SECRET_KEY } = process.env;

const recaptcha = new RecaptchaV3(`${RECAPTCHA_PUBLIC_KEY}`, `${RECAPTCHA_SECRET_KEY}`);

export default recaptcha;