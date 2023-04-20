export function PlusIcon(props: { height?: number; width?: number }) {
  return (
    <svg
      {...props}
      height={props.height || "15"}
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.25 14.8212V8.63008H0V7.14421H6.25V0.953125H7.75V7.14421H14V8.63008H7.75V14.8212H6.25Z"
        fill="black"
        fill-opacity="0.54"
      />
    </svg>
  );
}
