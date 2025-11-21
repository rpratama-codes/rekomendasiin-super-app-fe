/** biome-ignore-all lint/performance/noImgElement: <No Need Next Image Optimization> */
"use client";

import {
  ShoppingBagIcon,
  SignInIcon,
  SignOutIcon,
  UserCheckIcon,
  UserSquareIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";
import { useRefreshToken } from "@/hooks/use-refresh-token";

export default function NavBar({
  hideNavRight = false,
}: {
  hideNavRight?: boolean;
}) {
  const session = useRefreshToken();

  return (
    <div className="flex w-full min-h-14 justify-center items-center bg-linear-to-bl from-red-600 to-red-800 text-white">
      <div className="container">
        <div
          id="nav-body"
          className="flex w-full h-full justify-between items-center max-xl:px-4"
        >
          <div id="nav-left" className="flex gap-2">
            <Link className="flex gap-2 justify-center items-center" href={"/"}>
              <img
                className="rounded-md h-8"
                src="https://ik.imagekit.io/rcloud/rekomendasiin/public/rekomendasiin-logo-white.svg"
                alt="logo-rekomendasiin"
              />
            </Link>
          </div>

          <div
            id="nav-right"
            className="flex items-center gap-2 "
            hidden={hideNavRight}
          >
            <div className="dropdown dropdown-hover dropdown-end">
              <input
                type="search"
                className="input bg-white text-black rounded-box h-8 p-2 shadow-sm outline-none border border-gray-200"
                placeholder="Cari disini..."
              />
              <ul
                tabIndex={-1}
                className="dropdown-content menu bg-white text-black w-full rounded-box z-1 p-4 shadow-sm border border-gray-200"
              >
                <li>
                  <Link href="#" className="text-nowrap">
                    Result 1
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-nowrap">
                    Result 2
                  </Link>
                </li>
              </ul>
            </div>

            <div className="dropdown dropdown-hover dropdown-end">
              <button
                type="button"
                className="btn btn-ghost hover:bg-transparent hover:border-red-700 w-12 p-2"
                onClick={() => console.log("ok")}
              >
                <ShoppingBagIcon size={32} />
              </button>
              <ul
                tabIndex={-1}
                className="dropdown-content menu bg-white text-black rounded-box z-1 p-4 shadow-sm border border-gray-200"
              >
                <li>
                  <Link href="#" className="text-nowrap">
                    Cart 1
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-nowrap">
                    Cart 2
                  </Link>
                </li>
              </ul>
            </div>

            <div className="dropdown dropdown-hover dropdown-end">
              <button
                type="button"
                className="btn btn-ghost hover:bg-transparent hover:border-red-700 w-12 p-2"
              >
                <UserSquareIcon size={32} />
              </button>
              <ul
                tabIndex={-1}
                className="dropdown-content menu flex flex-col gap-2 bg-white text-black rounded-box z-1 p-4 w-max shadow-sm border border-gray-200"
              >
                {!session && (
                  <>
                    <li className="cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          redirect("/auth/sign-in", RedirectType.push)
                        }
                        className="cursor-pointer hover:shadow-sm justify-between"
                      >
                        <p>Sign In</p>
                        <SignInIcon size={20} />
                      </button>
                    </li>
                    <li className="cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          redirect("/auth/sign-up", RedirectType.push)
                        }
                        className="cursor-pointer hover:shadow-sm bg-linear-to-bl from-red-600 to-red-800 text-white justify-between"
                      >
                        <p>Sign Up</p>
                        <UserCheckIcon size={20} />
                      </button>
                    </li>
                  </>
                )}
                {session && (
                  <>
                    <li className="cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          redirect("/dashboard", RedirectType.push)
                        }
                        className="cursor-pointer hover:shadow-sm justify-between "
                      >
                        <p>Dashboard</p>
                        <UserSquareIcon size={20} />
                      </button>
                    </li>
                    <li className="cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          redirect("/auth/sign-out", RedirectType.push)
                        }
                        className="cursor-pointer hover:shadow-sm justify-between"
                      >
                        <p>Sign out</p>
                        <SignOutIcon size={20} />
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
