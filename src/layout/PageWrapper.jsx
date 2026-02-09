/**
 * Page Wrapper Component
 * Provides consistent page layout and container styling
 * Adapted for Viraloop's light theme
 */
export default function PageWrapper({ title = "", description = "", useDefaultContainer = true, classes = "", blog = false, children }) {
	return (
		<>
			{useDefaultContainer ? (
				<div className="w-full flex flex-col items-center min-h-screen bg-light-100">
					<div
						className={
							blog
								? "w-full max-w-[768px] px-6 md:px-8 lg:px-0 py-40"
								: classes
									? classes
									: "w-full max-w-[1920px] pt-36 pb-36 px-4 md:px-8 lg:px-16 xl:px-20 2xl:px-36"
						}
					>
						{children}
					</div>
				</div>
			) : (
				children
			)}
		</>
	);
}
