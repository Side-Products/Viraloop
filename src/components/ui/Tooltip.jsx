import { Tooltip } from "flowbite-react";

export default function TooltipComponent({ labelText, message, tooltipLocation, maxWidth = "300px", width = "200px", ...props }) {
	return (
		<Tooltip
			className={
				"flowbite-tooltip " +
				(tooltipLocation == "bottom"
					? "flowbite-tooltip-bottom"
					: tooltipLocation == "top"
						? "flowbite-tooltip-top"
						: tooltipLocation == "left"
							? "flowbite-tooltip-left"
							: tooltipLocation == "right"
								? "flowbite-tooltip-right"
								: "")
			}
			content={<div className={`text-center text-[12px] leading-4 max-w-[${maxWidth}] ${width ? `w-[${width}]` : ""}`}>{message}</div>}
			placement={tooltipLocation ? tooltipLocation : "top"}
			style="dark"
			trigger="hover"
			arrow={true}
		>
			{labelText}
		</Tooltip>
	);
}
