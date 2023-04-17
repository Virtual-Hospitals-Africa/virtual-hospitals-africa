import { Head } from "$fresh/runtime.ts";
import { JSX } from "preact";

export type LayoutProps = {
  title: string;
  children: JSX.Element | JSX.Element[];
};

export default function Layout(props: LayoutProps) {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <link rel="stylesheet" href="/normalize.css" />
        <link rel="stylesheet" href="/main.css" />
      </Head>
      <nav>
        <a class="back" onClick={() => window.history.back()}>
          <svg
            class="back-arrow"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 7H3.83L9.42 1.41L8 0L0 8L8 16L9.41 14.59L3.83 9H16V7Z"
              fill="white"
            >
            </path>
          </svg>
        </a>
        <h1>{props.title}</h1>
      </nav>
      {props.children}
    </>
  );
}
