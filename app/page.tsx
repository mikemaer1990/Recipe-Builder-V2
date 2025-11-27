import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If authenticated, redirect to login (we'll change this to /builder once it's built)
  // If not authenticated, redirect to login
  if (session) {
    // TODO: Change this to /builder once the builder page is created
    redirect("/login");
  } else {
    redirect("/login");
  }
}
