import { Router, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./paths";
import { API_VERSION } from "../version";

const swaggerRouter = Router();

function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session && (req.session as any).isAdmin) return next();
  res.status(401).send("Unauthorized. Admin login required.");
}

const generator = new OpenApiGeneratorV3(registry.definitions);
const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Valid Panel - API Documentation",
    version: API_VERSION,
    description:
      "Comprehensive API documentation for Valid Panel. All requests must include a valid Origin header set to https://validpanel.com. Requests without it will result in a CORS error. Use Postman for testing and ensure the Origin is correctly set.",
    contact: {
      name: "Valid Code",
      url: "https://linkedin.com/in/thevalidcode",
      email: "thevalidcode@gmail.com",
    },
  },
  servers: [
    {
      url: `https://validpanel.com/core/api/v1`,
      description: "Public testing server (use this to test endpoints)",
    },
    {
      url: "http://localhost:3000/core/api/v1",
      description: "Local development server",
    },
  ],
});

swaggerRouter.use(
  "/core/admin/docs",
  isAdmin,
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customCssUrl: "/assets/swagger-custom.css",
    customfavIcon: "/assets/validpanel.png",
    customSiteTitle: "Valid Panel API Docs",
  })
);

export default swaggerRouter;
