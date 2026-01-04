import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { UpdateSettingSchema } from "../schemas/setting.schema";

export const getSettingsForAdmins = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findFirst();
    res.status(200).json({ setting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

export const getSettingsForUsers = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.setting.findFirst({
      select: {
        siteName: true,
        siteDescription: true,
        logoUrl: true,
        faviconUrl: true,
        defaultCurrency: true,
        defaultLanguage: true,
        timezone: true,
        dateFormat: true,

        // Maintenance info (read-only for users)
        maintenanceMode: true,
        maintenanceMsg: true,
        maintenanceEnd: true,
        maintenanceStart: true,
      },
    });

    res.status(200).json({ setting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const parsed = UpdateSettingSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  try {
    await prisma.setting.upsert({
      where: { id: 1 },
      update: { ...parsed.data },
      create: { ...parsed.data },
    });
    res.status(200).json({ success: "Settings updated successfully" });
  } catch {
    res.status(500).json({ error: "Failed to update settings" });
  }
};
