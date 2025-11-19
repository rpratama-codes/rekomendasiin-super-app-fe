type Props = {
	children?: React.ReactNode;
};

export default function Section(props: Props) {
	return (
		<div className="flex w-full justify-center">
			<div className="container">{props.children}</div>
		</div>
	);
}
