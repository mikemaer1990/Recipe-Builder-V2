import { redirect } from "next/navigation";

export default function Home() {
  // Will redirect to /builder if authenticated, /login if not
  // For now, redirect to builder (we'll add auth check later)
  redirect("/builder");
}
