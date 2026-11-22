import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import type { Pool } from "pg";
import { CONFIG, type AppConfig } from "../config";
import { createDb, type Db } from "./client";

export const DB = Symbol("DB");
const POOL = Symbol("POOL");

@Global()
@Module({
  providers: [
    {
      provide: POOL,
      inject: [CONFIG],
      useFactory: (config: AppConfig) => createDb(config.DATABASE_URL),
    },
    { provide: DB, inject: [POOL], useFactory: (c: { db: Db }) => c.db },
  ],
  exports: [DB, POOL],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(POOL) private readonly conn: { pool: Pool }) {}
  async onApplicationShutdown() {
    await this.conn.pool.end();
  }
}
