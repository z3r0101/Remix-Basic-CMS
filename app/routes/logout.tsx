import { getSession, destroySession } from '../session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const logoutUrl = 'https://unb2c.b2clogin.com/unb2c.onmicrosoft.com/B2C_1_UN_UNDRR_SIGNUP_SIGNIN/oauth2/v2.0/logout?post_logout_redirect_uri=http://localhost:3000/login/';

  const session = await getSession(request);
  const cookieHeader = await destroySession(session);

  return new Response(null, {
    status: 302,
    headers: {
      Location: logoutUrl,
      "Set-Cookie": cookieHeader,
    },
  });
};
