import { createFileRoute } from "@tanstack/react-router";

/**
 * Abendliche Erinnerung an den Tagesbericht.
 * Aufruf: GET /api/public/push-cron?secret=<LOVABLE_CRON_SECRET>
 */
export const Route = createFileRoute("/api/public/push-cron")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["LOVABLE_CRON_SECRET"];
        const given = new URL(request.url).searchParams.get("secret");
        if (!secret || given !== secret) return new Response("Unauthorized", { status: 401 });

        const { sendPush } = await import("@/lib/push.server");
        await sendPush("room", {
          title: "Tagesbericht nicht vergessen",
          body: "Zwei Minuten für heute – erzählt, wie euer Tag war.",
          url: "/",
          tag: "erinnerung",
        });
        return new Response("ok");
      },
    },
  },
});
