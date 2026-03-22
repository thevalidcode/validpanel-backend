-- DropIndex
DROP INDEX "subscriptions_user_id_status_key";

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_subscription
ON subscriptions(user_id)
WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_subscription
ON subscriptions(user_id)
WHERE status = 'PENDING';