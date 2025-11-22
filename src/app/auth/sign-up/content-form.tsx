import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import type { SignupType } from "./content";

export default function FillForm({
  useForm,
  onSubmit,
}: {
  useForm: UseFormReturn<SignupType>;
  onSubmit: SubmitHandler<SignupType>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm;

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
