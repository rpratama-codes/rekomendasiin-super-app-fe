import { fetcher } from "@/action/fetcher";
import Footer from "@/component/base/footer";
import NavBar from "@/component/base/navbar";
import Section from "@/component/base/section";
import Tagline from "@/component/specific/tagline";
import RecomendationForm from "./content";

export type Criteria = { id: string; criteria_name: string }[];

export default async function Page() {
	const criteria = await fetcher<Criteria>("/store-front/list-criteria");

	return (
		<div className="flex flex-col justify-between w-full h-screen">
			<NavBar />
			<Section>
				<RecomendationForm criteria={criteria.data} />
			</Section>
			<Tagline />
			<Footer />
		</div>
	);
}
