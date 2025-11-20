import { redirect } from "next/navigation";

export default function FeaturesAuthLoginRedirect() {
  redirect("/auth/login");
}
