export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjU3MDEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyMTQ1NzNGOTA0NzU5ODc0QzlDMmU0OTAzYjFjYmQwYkI1ODIxZTFEIn0",
      payload: "eyJkb21haW4iOiJtaW50LWZyYW1lLXdlLWNhc3QtcHJvLnZlcmNlbC5hcHAifQ",
      signature:
        "MHg5NGVmODVlYjNjN2I1MjY3MTE0M2EzNWZkNzFlM2VhYmJlYTI0ODUzOGFhZTMzMjA5Njg0YjI0YTQ5MjAxOWUxMjY4NzZmZWUyMzNkZmIwZmIxYjY0MjNlY2UxNTRjNjdmMzlmMWVkYWVkYjE0ZTM4MTkwZmM3MzU2MzU1MGQ0NTFj",
    },
    frame: {
      version: "1",
      name: "WeCastPro Mint",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frame.png`,
      buttonTitle: "Mint",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0f172a",
    },
  };

  return Response.json(config);
}
