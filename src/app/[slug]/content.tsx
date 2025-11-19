/** biome-ignore-all lint/performance/noImgElement: <No need Next Image> */
/** biome-ignore-all lint/a11y/useKeyWithMouseEvents: <use for feature> */
"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { fetcher } from "@/action/fetcher";
import { useConstructSearchQuery } from "@/hooks/use-construct-query";
import { useQuerySetter } from "@/hooks/use-query-setter";
import type { Criteria } from "./page";

export type Props = { criteria?: Criteria };
export type Item = {
  id: string;
  category_id: string;
  soc: number;
  ram: number;
  rom: number;
  camera: number;
  screen: number;
  nfc: number;
  network: number;
  battery: number;
  price: number;
  weight: number;
  item_name: string;
  picture: string;
};

export type ItemRecomndation = { totalScore: number } & Item;

export type Recomendation = {
  spec: Item[];
  result: ItemRecomndation[];
  criteria: Criteria;
  comparable_criteria: Set<string>;
};

export default function RecomendationForm({ criteria }: Props) {
  const { slug } = useParams<{ slug: string }>();

  const queryValue = useConstructSearchQuery<{
    basePrice: {
      min: string;
      max: string;
    };
    criteria_id: string;
  }>();

  const [min, setMin] = useState<number>(
    Number(queryValue?.basePrice?.min ?? 2000000),
  );
  const [max, setMax] = useState<number>(
    Number(queryValue?.basePrice?.max ?? 4000000),
  );
  const [criteria_id, setCriteriaId] = useState<string | undefined>(
    queryValue?.criteria_id ?? (criteria?.length ? criteria[0].id : undefined),
  );

  const [recomendation, setRecomendation] = useState<
    Recomendation | undefined
  >();

  useQuerySetter(
    {
      basePrice: {
        min,
        max,
      },
      criteria_id,
    },
    { delayBefore: [recomendation] },
  );

  const onSubmit = useCallback(async () => {
    const getRecomendation = await fetcher<Recomendation>(
      "/store-front/list-recomendation",
      {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ basePrice: { min, max }, criteria_id }),
      },
    );

    if (getRecomendation.data) {
      setRecomendation(getRecomendation.data);
    }
  }, [min, max, criteria_id]);

  return (
    <>
      <div className="flex flex-col gap-4 w-full justify-center p-4 mt-16">
        <p className="text-center font-bold text-3xl">
          {slug.toLocaleUpperCase()}
        </p>
        <p className="text-center font-medium text-2xl">
          {!recomendation
            ? "Btw, Kriteria yang kk mau seperti apa?"
            : "Ini dia hasil yang kamu mau, sesuai pokoknya sama yang kamu mau."}
        </p>
      </div>
      <div className="flex flex-row-reverse justify-center flex-wrap p-4 gap-4">
        <div className="flex max-lg:w-full flex-col min-w-64 shadow-md rounded-md border border-gray-200 p-4 gap-4">
          <p>Masukan Range Harga!</p>

          <p>Min : </p>
          <input
            className="shadow-md rounded-md p-2 border border-gray-200"
            defaultValue={2000000}
            type="number"
            onChange={(e) => {
              setMin(Number(e.target.value));
            }}
          />

          <p>max : </p>

          <input
            className="shadow-md rounded-md p-2 border border-gray-200"
            defaultValue={4000000}
            type="number"
            onChange={(e) => {
              setMax(Number(e.target.value));
            }}
          />

          <div className="flex">
            {criteria?.map((item, index) => {
              return (
                <div className="flex flex-col gap-2 p-2" key={item.id}>
                  {item.criteria_name}
                  <input
                    type="radio"
                    name="criteria"
                    id={item.id}
                    value={item.id}
                    onChange={() => {
                      setCriteriaId(item.id);
                    }}
                    defaultChecked={index === 0}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="shadow-md p-2 cursor-pointer bg-linear-to-bl from-red-600 to-red-800 active:bg-linear-to-bl active:from-red-800 active:to-red-600 text-white rounded-sm"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
        {recomendation && (
          <div className="flex flex-wrap justify-evenly max-lg:w-full w-3/5 rounded-sm shadow-md border border-gray-200 p-4 gap-4">
            {recomendation?.result.map((item) => {
              return (
                <div
                  className="flex flex-col justify-between p-2 gap-2 w-36 text-sm"
                  key={item.id}
                >
                  <div className="flex h-36">
                    <img
                      className="object-contain rounded-md"
                      src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL}/${item.picture}`}
                      alt={`${item.picture}`}
                    />
                  </div>
                  <p className="font-bold">{item.item_name}</p>
                  <p>Match : {Math.round(item.totalScore * 100)}% </p>
                  <button
                    className="p-2 rounded-md cursor-pointer bg-linear-to-bl from-red-600 to-red-800 active:bg-linear-to-bl active:from-red-800 active:to-red-600 text-white"
                    type="button"
                    onMouseOver={(e) => {
                      e.currentTarget.innerText = "Ask AI";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.innerText = "Detail";
                    }}
                  >
                    Detail
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
