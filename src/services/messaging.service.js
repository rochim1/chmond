const { getApps } = require("firebase-admin/app");

const initializeAppFirebase = async (admin) => {
  const firebaseConfig = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    // Replace the line breaks in the private key
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URL,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
  };

  const alreadyCreatedApps = getApps();

  // Initialize Firebase if no app is initialized, else use the existing app
  const App = alreadyCreatedApps.length === 0
    ? admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig)
      })
    : alreadyCreatedApps[0];

  return App;
}

module.exports = {
  initializeAppFirebase
};
