/** biome-ignore-all lint/performance/noImgElement: <.> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { signIn } from "next-auth/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password should has min 8 character!"),
});

type SignInType = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
  });
  const onSubmit: SubmitHandler<SignInType> = async (data) => {
    await signIn("backend-login", data);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="card-title">Sign In!</h2>
        <p>Sign In and get advance features.</p>
      </div>

      <form action={async () => await signIn("google")}>
        <button
          className="btn bg-white text-black border border-gray-200 shadow-sm w-full"
          type="submit"
        >
          <GoogleLogoIcon size={20} />
          Login with Google
        </button>
      </form>

      <div className="divider">OR</div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("email")}
          className="input bg-white border border-gray-200 w-full"
          placeholder="nick@gmail.com"
          type="email"
        />
        {errors.email && <p className="text-error">{errors.email.message}</p>}
        <input
          {...register("password")}
          className="input bg-white border border-gray-200 w-full"
          placeholder="********"
          type="password"
        />
        {errors.password && (
          <p className="text-error">{errors.password.message}</p>
        )}
        <button
          className="btn bg-linear-to-bl from-red-600 to-red-800 border-none"
          type="submit"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
