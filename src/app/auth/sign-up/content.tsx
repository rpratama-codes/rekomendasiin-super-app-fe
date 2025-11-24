/** biome-ignore-all lint/performance/noImgElement: <.> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SearchParams } from "next/dist/server/request/search-params";
import { RedirectType, redirect } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { fetcher2 } from "@/action/fetcher2";
import type { BackendLoginData, User } from "@/app/auth";
import { useQueryConstructor } from "@/hooks/use-query-constructor";
import { useQueryDeconstructor } from "@/hooks/use-query-deconstructor";
import FillForm from "./content-form";
import VerifyForm from "./content-verify";

const signUpSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8, "Password should has min 8 character!"),
});

const verifyOtpSchema = z.object({
  email: z.email(),
  token: z.string(),
});

export type SignupType = z.infer<typeof signUpSchema>;
export type VerifyOTP = z.infer<typeof verifyOtpSchema>;
export type PageState = "fill" | "verify";
export type SignUpSearchQuery = {
  pageState?: PageState;
  emailToVerify?: string;
  token?: string;
};

export default function SignUpForm({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const query = useQueryDeconstructor<SignUpSearchQuery>(searchParams);

  const [emailToVerify, setEmailToVerify] = useState<string | undefined>(
    query?.emailToVerify,
  );
  const [pageState, setPageState] = useState<PageState>(
    query?.pageState ?? "fill",
  );

  useQueryConstructor<SignUpSearchQuery>({ pageState });

  const fillFormField = useForm<SignupType>({
    resolver: zodResolver(signUpSchema),
  });

  const verifyField = useForm<VerifyOTP>({
    resolver: zodResolver(verifyOtpSchema),
  });

  const onSubmit: SubmitHandler<SignupType> = async (data) => {
    const signup = await fetcher2<User>({
      path: "/v1/auth/sign-up",
      options: {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      },
    });

    console.log(signup);

    /**
     * TODO: Auth Fail Handling
     */

    if (signup.data) {
      setEmailToVerify(signup.data?.email);
      setPageState("verify");
    }
  };

  const verifyOtp: SubmitHandler<VerifyOTP> = async (data) => {
    const verify = await fetcher2<BackendLoginData>({
      path: "/v1/auth/otp/verify",
      options: {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      },
    });

    console.log(verify);

    /**
     * TODO: Auth Fail Handling
     */

    if (String(verify.code).startsWith("2")) {
      redirect("/auth/sign-in", RedirectType.push);
    }
  };

  return (
    <>
      {pageState === "fill" && (
        <FillForm onSubmit={onSubmit} useForm={fillFormField} />
      )}
      {pageState === "verify" && (
        <VerifyForm
          emailToVerify={emailToVerify}
          onSubmit={verifyOtp}
          useForm={verifyField}
          token={query?.token}
        />
      )}
    </>
  );
}
