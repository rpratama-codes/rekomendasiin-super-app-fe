"use server";

import Link from "next/link";
import { fetcher } from "@/action/fetcher";
import Footer from "@/component/base/footer";
import NavBar from "@/component/base/navbar";
import Section from "@/component/base/section";
import Tagline from "@/component/specific/tagline";

export type Category = { id: string; category_name: string }[];

export default async function Home() {
	const category = await fetcher<Category>("/store-front/list-category");

	return (
		<div className="flex flex-col justify-between w-full h-dvh">
			<NavBar />
			<Section>
				<div className="flex w-full justify-center p-4 mt-16">
					<p className="text-center font-bold text-3xl">
						Mau Direkomendasiin Apa Hari Ini
					</p>
				</div>
			</Section>
			<Section>
				<div className="flex flex-col">
					<div className="flex flex-wrap w-full justify-center items-center p-4 gap-4 ">
						{category.data?.map((item) => {
							return (
								<Link href={item.category_name} key={item.id}>
									<div className="flex  justify-center items-center w-64 h-20 p-4 rounded-sm shadow-md border border-gray-200  cursor-pointer hover:bg-linear-to-bl from-red-600 to-red-800 hover:text-white">
										{item.category_name}
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</Section>
			<Tagline />
			<Footer />
		</div>
	);
}
