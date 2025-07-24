import { OAuth2Client } from "google-auth-library";

const clientId =
  "1095542063427-n6ii04rv6k0hp8u9uno1ir7j09jul1nf.apps.googleusercontent.com";
const client = new OAuth2Client({
  clientId,
});

export async function verifyIdToken(idToken) {
  const loginTicket = await client.verifyIdToken({
    idToken: idToken,
    audience: clientId,
  });

  const userData = loginTicket.getPayload();

  return userData;
}
