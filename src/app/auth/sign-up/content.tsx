/** biome-ignore-all lint/performance/noImgElement: <.> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { fetcher } from "@/action/fetcher";

const signUpSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8, "Password should has min 8 character!"),
});

type SignupType = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupType>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignupType> = async (data) => {
    const signup = await fetcher("/v1/auth/sign-up", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log(signup);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="card-title">Sign Up!</h2>
        <p>Sign Up and get advance features.</p>
      </div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("first_name")}
          className="input bg-white border border-gray-200 w-full"
          placeholder="First Name"
        />
        {errors.first_name && (
          <p className="text-error">{errors.first_name.message}</p>
        )}
        <input
          {...register("last_name")}
          className="input bg-white border border-gray-200 w-full"
          placeholder="Last Name"
        />
        {errors.last_name && (
          <p className="text-error">{errors.last_name.message}</p>
        )}
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
          Sign Up
        </button>
      </form>
    </div>
  );
}
