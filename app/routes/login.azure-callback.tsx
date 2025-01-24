// app/routes/login/azure-callback.tsx
import { LoaderFunction, redirect } from '@remix-run/node';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';
import JWKS, { JwksClient } from 'jwks-rsa';
import { setUserSession } from "../session.server"; // Import the session utility
import { db } from "../database/db.server"; // Import Drizzle ORM database instance
import { User } from "../database/schema"; // Import User schema
import { eq } from "drizzle-orm"; // Helper for equality conditions

// Create a JWKS client
const jwksClient = JWKS({
    jwksUri: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/discovery/v2.0/keys?p=${process.env.AZURE_B2C_POLICY}`
  });
  
  // A helper function to get the signing key
  async function getSigningKey(kid: string) {
    const keys = await jwksClient.getSigningKeys();
    console.log("Available keys:", keys.map(k => k.kid)); // Log available kids
    const key = keys.find(k => k.kid === kid);
    if (!key) {
      throw new Error(`Unable to find a signing key that matches '${kid}'`);
    }
    return key.getPublicKey();
  }

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    console.error('Code is missing from the callback URL');
    return redirect('/login'); // Redirect to login page or error page
  }

  // Prepare the POST request to exchange the code for a token
  const tokenEndpoint = `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/token?p=${process.env.AZURE_B2C_POLICY}`;
  const params = new URLSearchParams();
  params.append('client_id', process.env.AZURE_B2C_CLIENT_ID);
  params.append('scope', 'openid email');
  params.append('code', code);
  params.append('redirect_uri', process.env.AZURE_B2C_REDIRECT_URI);
  params.append('grant_type', 'authorization_code');
  params.append('client_secret', process.env.AZURE_B2C_CLIENT_SECRET); // Securely manage the client secret

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { id_token } = await response.json();
    console.log('ID Token:', id_token);

    const decodedHeader = jwt.decode(id_token, { complete: true });
    console.log('Decoded JWT Header:', decodedHeader.header);

    const publicKey = await getSigningKey(decodedHeader.header.kid);
    const decoded = jwt.verify(id_token, publicKey, { algorithms: ['RS256'] });
    console.log('Decoded JWT:', decoded);

    let getEmail = decoded.emails?.[0] ?? "";
    
    if (getEmail == '') {
      const idp_access_token = decoded.idp_access_token ?? "";
      console.log("idp_access_token", idp_access_token);

      // Decoding the JWT without verifying the signature
      try {
        const decodedIdp = jwt.decode(idp_access_token, { complete: true });
        console.log("Decoded IDP token:", decodedIdp);

        // Assuming the decoded IDP token's payload contains an 'email' field
        if (decodedIdp && decodedIdp.payload) {
            getEmail = decodedIdp.payload.email ?? "";
            console.log("Email from IDP token:", getEmail);
        }
      } catch (error) {
        console.error("Failed to decode IDP access token:", error);
      }
    }

    const userQuery = await db
      .select()
      .from(User)
      .where(eq(User.email, getEmail));

    const user = userQuery[0];  
    
    if (!user) {
      const baseUrl = `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY}/oauth2/v2.0/logout`;
      const redirectUri = "http://localhost:3000/login?err=Invalid%20email%20or%20password";
      
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      const logoutUrl = `${baseUrl}?post_logout_redirect_uri=${encodedRedirectUri}`;

        return redirect(logoutUrl);
    }

    // Set session after successful login
    const responseOk = redirect("/cms/content");
    return setUserSession(user, request, responseOk);
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    return redirect('/login'); // Redirect to login page or error page
  }
};
