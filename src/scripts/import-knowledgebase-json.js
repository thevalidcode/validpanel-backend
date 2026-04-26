"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/db.config");

/* CONFIG */
const FILE_PATH = path.resolve(__dirname, "./knowledgebase-core-platform.json");

/* NORMALIZER */
function normalizeRecord(item) {
  return {
    title: String(item.title || "").trim(),
    slug: String(item.slug || "").trim(),
    summary: item.summary ? String(item.summary) : null,
    contentHtml: String(item.contentHtml || "").trim(),
    coverImage: item.coverImage ? String(item.coverImage) : null,
    category: item.category ? String(item.category) : null,
    tags: Array.isArray(item.tags)
      ? item.tags.map((t) => String(t)).filter(Boolean)
      : [],
    status:
      item.status === "DRAFT" || item.status === "ARCHIVED"
        ? item.status
        : "PUBLISHED",
    isFeatured: Boolean(item.isFeatured),
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
  };
}

async function main() {
  /* 1. Load file */
  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`File not found: ${FILE_PATH}`);
  }

  const raw = fs.readFileSync(FILE_PATH, "utf8");
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows)) {
    throw new Error("JSON must be an array");
  }

  /* 2. Normalize */
  const prepared = rows.map(normalizeRecord);

  /* 3. Validate */
  const invalid = prepared.filter((r) => !r.title || !r.slug || !r.contentHtml);

  if (invalid.length > 0) {
    throw new Error(
      `${invalid.length} invalid records (missing title/slug/contentHtml)`,
    );
  }

  /* 4. Upsert */
  let created = 0;
  let updated = 0;

  for (const row of prepared) {
    const existing = await prisma.knowledgeBase.findUnique({
      where: { slug: row.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.knowledgeBase.update({
        where: { slug: row.slug },
        data: row,
      });
      updated++;
    } else {
      await prisma.knowledgeBase.create({
        data: row,
      });
      created++;
    }
  }

  console.log(
    `Done. Created: ${created}, Updated: ${updated}, Total: ${prepared.length}`,
  );
}

/* EXECUTE */
main()
  .catch((e) => {
    console.error("Seed failed:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
