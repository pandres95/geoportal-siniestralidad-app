import { NextComponentType, NextPageContext } from "next";
import { AppProps } from "next/app";

interface Props {
  Component: NextComponentType<NextPageContext, any, any>;
  pageProps: AppProps;
}

export default function MyApp({ Component, pageProps }: Props) {
  return <Component {...pageProps} />;
}
