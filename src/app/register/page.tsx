import { redirect } from "next/navigation";

// Old sign-up address: everyone now signs up on /signup (with the disclaimer and consent boxes).
export default function RegisterPage() {
  redirect("/signup");
}
