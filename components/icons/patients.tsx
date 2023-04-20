import { JSX } from "preact/jsx-runtime";

export default function PatientsIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      height={props.height || "14"}
      viewBox="0 0 23 14"
      fill="none"
    >
      <path
        d="M15.375 6C17.035 6 18.365 4.66 18.365 3C18.365 1.34 17.035 0 15.375 0C13.715 0 12.375 1.34 12.375 3C12.375 4.66 13.715 6 15.375 6ZM7.375 6C9.035 6 10.365 4.66 10.365 3C10.365 1.34 9.035 0 7.375 0C5.715 0 4.375 1.34 4.375 3C4.375 4.66 5.715 6 7.375 6ZM7.375 8C5.045 8 0.375 9.17 0.375 11.5V14H14.375V11.5C14.375 9.17 9.705 8 7.375 8ZM15.375 8C15.085 8 14.755 8.02 14.405 8.05C15.565 8.89 16.375 10.02 16.375 11.5V14H22.375V11.5C22.375 9.17 17.705 8 15.375 8Z"
        fill="black"
        fill-opacity="0.6"
      />
    </svg>
  );
}
