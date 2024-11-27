import { eq, or, sql, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "./schema/user";

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export function increment(col: AnyPgColumn, value = 1): SQL {
  return sql`${col} + ${value}`;
}

export function decrement(col: AnyPgColumn, value = 1): SQL {
  return sql`${col} - ${value}`;
}

export async function expectAccountExists(...ids: number[]) {
  return or(...ids.map((id) => eq(users.id, id)));
}
