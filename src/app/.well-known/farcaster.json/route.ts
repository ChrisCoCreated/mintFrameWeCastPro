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
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0f172a",
      subtitle: "Mint a WeCastPro",
      description: "Mint a WeCastPro",
      screenshotUrls: [
        `${appUrl}/screenshot1.png`,
        `${appUrl}/screenshot2.png`,
        `${appUrl}/screenshot3.png`
      ],
      primaryCategory: "art-creativity",
      tags: ["social", "community", "art", "cocreated", "artifact"],
      heroImageUrl: `${appUrl}/WeCastHero.jpg`,
      tagline: "Mint a WeCastPro",
      ogTitle: "WeCastPro Mint",
      ogDescription: "Mint a WeCastPro",
      ogImageUrl: `${appUrl}/WeCastHero.jpg`,
      noindex: false
    },
  };

  return Response.json(config);
}
