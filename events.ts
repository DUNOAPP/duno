import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";

const events = new Hono();

const eventSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  danceStyleIds: z.array(z.string()).optional().default([]),
  city: z.string().optional().default("All Cities"),
  startDate: z.string(),
  endDate: z.string(),
  allDay: z.boolean().optional().default(false),
  url: z.string().optional(),
  posterUrl: z.string().optional(),
});

// GET /api/events?month=2025-01&danceStyle=Salsa&city=Barcelona
events.get("/", async (c) => {
  const month = c.req.query("month");
  const danceStyle = c.req.query("danceStyle");
  const city = c.req.query("city");

  const allEvents = await prisma.calendarEvent.findMany({
    include: {
      danceStyles: {
        include: { danceStyle: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Filter in memory
  const filtered = allEvents.filter((event) => {
    if (month) {
      const year = parseInt(month.split("-")[0] ?? "0", 10);
      const m = parseInt(month.split("-")[1] ?? "0", 10);
      const startDate = new Date(year, m - 1, -6);
      const endDate = new Date(year, m, 7);
      if (event.startDate < startDate || event.endDate > endDate) {
        return false;
      }
    }

    if (danceStyle && danceStyle !== "All Styles") {
      const hasStyle = event.danceStyles.some(
        (ds) => ds.danceStyle.name.toLowerCase() === danceStyle.toLowerCase()
      );
      if (!hasStyle) return false;
    }

    if (city && city !== "All Cities") {
      if (event.city !== city) return false;
    }

    return true;
  });

  // Transform response — include structured danceStyles array
  const transformed = filtered.map((event) => {
    const { danceStyles: dsRelation, ...rest } = event;
    return {
      ...rest,
      danceStyles: dsRelation.map((eds) => ({
        id: eds.danceStyle.id,
        name: eds.danceStyle.name,
        color: eds.danceStyle.color,
      })),
    };
  });

  return c.json({ data: transformed });
});

// POST /api/events
events.post("/", zValidator("json", eventSchema), async (c) => {
  const body = c.req.valid("json");
  const { danceStyleIds, ...rest } = body;

  const event = await prisma.calendarEvent.create({
    data: {
      ...rest,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      userId: null,
      ...(danceStyleIds.length > 0
        ? {
            danceStyles: {
              create: danceStyleIds.map((id) => ({ danceStyleId: id })),
            },
          }
        : {}),
    },
  });

  return c.json({ data: event }, 201);
});

// PUT /api/events/:id
events.put("/:id", zValidator("json", eventSchema.partial()), async (c) => {
  const id = c.req.param("id");

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: { message: "Not found", code: "NOT_FOUND" } }, 404);
  }

  const body = c.req.valid("json");
  const { danceStyleIds, ...updateFields } = body;
  const updateData: Record<string, unknown> = { ...updateFields };
  if (body.startDate) updateData.startDate = new Date(body.startDate);
  if (body.endDate) updateData.endDate = new Date(body.endDate);

  if (danceStyleIds) {
    await prisma.eventDanceStyle.deleteMany({ where: { eventId: id } });
    await prisma.eventDanceStyle.createMany({
      data: danceStyleIds.map((dsId) => ({ eventId: id, danceStyleId: dsId })),
    });
  }

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: updateData,
  });

  return c.json({ data: event });
});

// DELETE /api/events/:id
events.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ error: { message: "Not found", code: "NOT_FOUND" } }, 404);
  }

  await prisma.calendarEvent.delete({ where: { id } });
  return c.body(null, 204);
});

export { events as eventsRouter };
