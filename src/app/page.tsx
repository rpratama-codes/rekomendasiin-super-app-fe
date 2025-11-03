"use server";

import { fetcher } from "@/action/fetcher";
import Section from "@/component/base/section";

import NavBar from "@/component/base/navbar";

export type Category = { id: string; category_name: string }[];

export default async function Home() {
  const category = await fetcher<Category>("/store-front/list-category");

  return (
    <div className="flex flex-col gap-12 justify-between w-full h-dvh ">
      <NavBar />
      <Section>
        <div className="flex w-full justify-center p-4">
          <p className="text-center font-bold text-3xl">
            Mau Direkomendasiin Apa Hari Ini
          </p>
        </div>
      </Section>
      <Section>
        <div className="flex flex-col">
          <div className="flex flex-wrap w-full justify-center items-center p-4 gap-4">
            {category.data?.map((item) => {
              return (
                <div
                  className="flex  justify-center items-center w-64 h-20 p-4 shadow-md rounded-md cursor-pointer hover:bg-gradient-to-bl from-red-600 to-red-800 hover:text-white"
                  key={item.id}
                >
                  {item.category_name}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section>
        <div id="section" className="flex justify-center">
          <div>
            <p className="text-center font-bold text-2xl">Recomendasiin App</p>
            <p className="text-center font-bold text-2xl">
              App yang ngertiin kamu.
            </p>
            <p className="text-center font-bold text-2xl">
              your life style choises
            </p>
          </div>
        </div>
      </Section>

      <div className="flex p-4 border-t border-gray-300 mt-auto">
        <div>
          Copyright © 2020-2021 Rekomendasiin.com. All rights reserved Syarat
          dan Ketentuan.
        </div>
      </div>
    </div>
  );
}
