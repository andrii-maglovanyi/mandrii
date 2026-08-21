import postgres from "postgres";
import { privateConfig } from "../config/private";

const sql = postgres(privateConfig.db.connectionString, {
  ssl: "require",
});

export default sql;
