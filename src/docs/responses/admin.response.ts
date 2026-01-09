import { z } from "zod";
import {
  RoleSchema,
  RoleWithPermissionsSchema,
  PermissionSchema,
  SuccessMessageSchema,
  AdminSchema,
} from "../../schemas/admin.schema";
import { Decimal } from "@prisma/client/runtime/client";
import { NotificationSchema } from "../../schemas/notification.schema";
import { PlatformEvent } from "../../../prisma/generated";
import { PlatformEventSchema } from "../../schemas/platformEvent.schema";

export const AuthenticateAdminResponse = {
  description: "Authenticated admin session object",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Logged in successfully"),
        role: z.string(),
        admin: AdminSchema,
      }),
    },
  },
};

export const AdminListResponse = {
  description: "Admin list retrieved successfully",
  content: {
    "application/json": {
      schema: z.array(AdminSchema),
    },
  },
};

export const PlatformEventsListResponse = {
  description: "Platform events retrieved successfully",
  content: {
    "application/json": {
      schema: z.array(PlatformEventSchema),
    },
  },
};

const MetricChangeSchema = z.object({
  value: z.string(),
  up: z.boolean().optional(),
});

const MetricValueSchema = z.object({
  value: z.string(),
});

const SubscriptionHealthSchema = z.object({
  mrrGrowth: MetricChangeSchema,
  churnRate: MetricValueSchema,
  arpu: MetricValueSchema,
  netRevenueRetention: MetricValueSchema,
});

const RevenueChartSchema = z.object({
  labels: z.array(z.string()),
  data: z.array(z.number()),
});

const StatItemSchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.string(),
  up: z.boolean(),
});

export const DashboardOverviewResponse = {
  description: "Overview retrieved successfully",
  content: {
    "application/json": {
      schema: z.object({
        stats: z.array(StatItemSchema),

        revenueChart: RevenueChartSchema,

        subscriptionHealth: SubscriptionHealthSchema,

        recentActivities: z.array(
          z.object({
            name: z.string(),
            img: z.string().url(),
            message: z.string(),
            time: z.date(),
          })
        ),
        topSubscriptions: z.array(
          z.object({
            planName: z.string(),
            billingCycle: z.string(),
            subscribers: z.number(),
            revenue: z.string(),
            isTrending: z.boolean().optional(),
          })
        ),
      }),
    },
  },
};

/**
 * Role Responses
 */
export const CreateRoleResponse = {
  description: "Successfully created a new role",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        role: RoleWithPermissionsSchema,
      }),
    },
  },
};

export const GetRolesResponse = {
  description: "Retrieve all roles with their permissions",
  content: {
    "application/json": {
      schema: z.object({
        roles: z.array(RoleWithPermissionsSchema),
      }),
    },
  },
};

export const GetRoleByUidResponse = {
  description: "Retrieve a specific role by UID",
  content: {
    "application/json": {
      schema: z.object({
        role: RoleWithPermissionsSchema,
      }),
    },
  },
};

export const UpdateRoleResponse = {
  description: "Successfully updated a role",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        role: RoleWithPermissionsSchema,
      }),
    },
  },
};

export const DeleteRoleResponse = {
  description: "Successfully deleted a role",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};

export const OverviewResponse = {
  description: "Overview retrieved successfully",
  content: {
    "application/json": {
      schema: z.object({
        totalStores: z.number(),
        activeStores: z.number(),
        activePlan: z.string(),
        totalSpent: z.object({
          currency: z.string().length(3),
          amount: z.custom<Decimal>(),
        }),
        recentActivity: z.array(NotificationSchema),
      }),
    },
  },
};

export const VerifySessionResponse = {
  description: "Session verified, admin authenticated",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        admin: AdminSchema,
      }),
    },
  },
};

export const AssignPermissionToRoleResponse = {
  description: "Successfully assigned permission to a role",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};

/**
 * Permission Responses
 */
export const CreatePermissionResponse = {
  description: "Successfully created a new permission",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        permission: PermissionSchema,
      }),
    },
  },
};

export const GetPermissionsResponse = {
  description: "Retrieve all permissions",
  content: {
    "application/json": {
      schema: z.object({
        permissions: z.array(PermissionSchema),
      }),
    },
  },
};

export const DeletePermissionResponse = {
  description: "Successfully deleted a permission",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};
