/** biome-ignore-all lint/performance/noImgElement: <No Need Next Image Optimization> */

import Link from "next/link";

export default function NavBar() {
  return (
    <div className="flex w-full min-h-14 justify-center items-center bg-linear-to-bl from-red-600 to-red-800 text-white">
      <div className="container">
        <div
          id="nav-body"
          className="flex w-full h-full justify-between items-center"
        >
          <div id="nav-left" className="flex gap-2">
            <Link className="flex gap-2 items-center" href={"/"}>
              <div className="w-10 h-10">
                <img
                  className="rounded-md"
                  src="https://rekomendasiin.rpratama.web.id/img/logo.svg"
                  alt="logo-rekomendasiin"
                />
              </div>
              <p>Rekomendasiin</p>
            </Link>
          </div>

          <div id="nav-right">
            <p className="max-md:hidden">
              Hello There! Web is under construction!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
