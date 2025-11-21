/** biome-ignore-all lint/performance/noImgElement: <No Need Next Image> */

import type React from "react";
import Footer from "@/component/base/footer";
import NavBar from "@/component/base/navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between w-full h-dvh">
      <NavBar hideNavRight />
      <div className="flex flex-col justify-center items-center h-full w-full">
        <div className="card lg:card-side shadow-sm border border-gray-200 max-w-3xl">
          <div className="max-md:hidden ">
            <img
              src="https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
              alt="Album"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="card-body">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
