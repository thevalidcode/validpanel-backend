-- CreateTable
CREATE TABLE "public"."platform_events" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" INTEGER,
    "event" TEXT NOT NULL,
    "category" TEXT,
    "entity_uid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_events_uid_key" ON "public"."platform_events"("uid");

-- CreateIndex
CREATE INDEX "platform_events_event_idx" ON "public"."platform_events"("event");

-- CreateIndex
CREATE INDEX "platform_events_created_at_idx" ON "public"."platform_events"("created_at");

-- AddForeignKey
ALTER TABLE "public"."platform_events" ADD CONSTRAINT "platform_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
