import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://devuser:devpassword123@localhost:5432/devdb"
  }
})