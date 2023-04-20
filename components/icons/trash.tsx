export function TrashIcon(props: { height?: number; width?: number }) {
  return (
    <svg
      {...props}
      height={props.height || "16"}
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.525 17.3506C2.10833 17.3506 1.75417 17.2162 1.4625 16.9475C1.17083 16.6787 1.025 16.3524 1.025 15.9685V2.8379H0V1.45573H4.7V0.764648H11.3V1.45573H16V2.8379H14.975V15.9685C14.975 16.337 14.825 16.6595 14.525 16.936C14.225 17.2124 13.875 17.3506 13.475 17.3506H2.525ZM13.475 2.8379H2.525V15.9685H13.475V2.8379ZM5.175 13.9874H6.675V4.79596H5.175V13.9874ZM9.325 13.9874H10.825V4.79596H9.325V13.9874Z"
        fill="black"
        fill-opacity="0.54"
      />
    </svg>
  );
}
