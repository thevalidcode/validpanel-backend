import z from "zod";
import {
  SettingSchema,
  SettingSchemaForUsers,
} from "../../schemas/setting.schema";

export const GetSetingsForUsersResponse = {
  description: "Settings object",
  content: {
    "application/json": {
      schema: z.object({ setting: SettingSchemaForUsers }),
    },
  },
};

export const GetSetingsForAdminsResponse = {
  description: "Settings Object",
  content: {
    "application/json": {
      schema: z.object({ setting: SettingSchema }),
    },
  },
};
