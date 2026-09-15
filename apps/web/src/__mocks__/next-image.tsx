/** Native image for tests; never call the mocked next/image component recursively. */
export default function MockImage({ alt, src }: { alt: string; src: string | { src: string } }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} src={typeof src === "string" ? src : src.src} />;
}
