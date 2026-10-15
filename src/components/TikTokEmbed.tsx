export default function TikTokEmbed({
  url,
  videoId,
  author,
  caption,
}: {
  url: string;
  videoId: string;
  author: string;
  caption: string;
}) {
  return (
    <blockquote
      className="tiktok-embed"
      cite={url}
      data-video-id={videoId}
      style={{ maxWidth: 325, minWidth: 325, margin: "0 auto" }}
    >
      <section>
        <a target="_blank" rel="noopener noreferrer" href={`${url}?refer=embed`}>
          @{author}
        </a>
        <p>{caption}</p>
      </section>
    </blockquote>
  );
}
