import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import type { VerifyOTP } from "./content";

export default function VerifyForm({
  useForm,
  onSubmit,
  emailToVerify,
  token,
}: {
  useForm: UseFormReturn<VerifyOTP>;
  onSubmit: SubmitHandler<VerifyOTP>;
  emailToVerify?: string;
  token?: string;
}) {
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm;

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="card-title">Verify Email.</h2>
        <p>Please check your email!.</p>
      </div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("email")}
          className="input bg-white border border-gray-200 w-full disabled:text-gray-600"
          placeholder="email"
          type="email"
          value={emailToVerify}
          disabled
        />
        {errors.email && <p className="text-error">{errors.email.message}</p>}
        <input
          {...register("token")}
          className="input bg-white border border-gray-200 w-full"
          defaultValue={token}
          placeholder="OTP"
          type="text"
        />
        {errors.token && <p className="text-error">{errors.token.message}</p>}
        <button
          className="btn bg-linear-to-bl from-red-600 to-red-800 border-none"
          type="submit"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
