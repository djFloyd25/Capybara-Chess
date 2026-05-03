const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CLIENT_ID = APP_URL;
const REDIRECT_URI = `${APP_URL}/callback/lichess`;

function generateVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function startLichessOAuth() {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  sessionStorage.setItem("lichess_verifier", verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "preference:read",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.href = `https://lichess.org/oauth?${params}`;
}

export async function completeLichessOAuth(code: string): Promise<{ id: string; username: string }> {
  const verifier = sessionStorage.getItem("lichess_verifier");
  if (!verifier) throw new Error("No code verifier found");

  const tokenRes = await fetch("https://lichess.org/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange Lichess token");
  const { access_token } = await tokenRes.json();

  const userRes = await fetch("https://lichess.org/api/account", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) throw new Error("Failed to get Lichess user info");
  const user = await userRes.json();

  sessionStorage.removeItem("lichess_verifier");
  return { id: user.id, username: user.username };
}
