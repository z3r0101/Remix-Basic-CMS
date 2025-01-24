// app/routes/login.azure-b2c.tsx
import { LoaderFunction, redirect } from '@remix-run/node';

// Configuration for your Azure B2C tenant
const tenantName = 'unb2c';
const policyName = 'B2C_1_UN_UNDRR_SIGNUP_SIGNIN';
const clientId = '9d907c9b-edb6-4969-9460-c683b1845eb7';
const redirectUri = 'http://localhost:3000/login/azure-callback';

export const loader: LoaderFunction = async ({ request }) => {
  const authorizationUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=openid email&state=12345`;

  return redirect(authorizationUrl);
};
