// userService.ts (where your functions are)
import clientPromise, { GENERAL_DATABASE_NAME } from "@/lib/mongodb";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export async function getUserByEmail(
    email: string
): Promise<AppUser | undefined> {
  const client = await clientPromise;
  const db = client.db(GENERAL_DATABASE_NAME);
  const user = await db.collection<AppUser>("users").findOne({
    email: email.toLowerCase(),
  });
  return user || undefined;
}

export async function addOrUpdateUser(user: AppUser): Promise<AppUser> {
  const client = await clientPromise;
  const db = client.db(GENERAL_DATABASE_NAME);

  await db.collection<AppUser>("users").updateOne(
      { email: user.email.toLowerCase() },
      { $set: { ...user } },
      { upsert: true }
  );

  // Return the updated/inserted user
  const savedUser = await db.collection<AppUser>("users").findOne({
    email: user.email.toLowerCase(),
  });

  if (!savedUser) throw new Error("Failed to insert or update user");

  return savedUser;
}

export async function listUsers(): Promise<AppUser[]> {
  const client = await clientPromise;
  const db = client.db(GENERAL_DATABASE_NAME);
  return db.collection<AppUser>("users").find({}).toArray();
}
