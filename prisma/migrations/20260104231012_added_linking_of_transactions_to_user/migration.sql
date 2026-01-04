-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
