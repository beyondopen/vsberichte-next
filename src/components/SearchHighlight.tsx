interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SearchHighlightProps {
  boxes: Box[];
}

export default function SearchHighlight({ boxes }: SearchHighlightProps) {
  return (
    <>
      {boxes.map((box, i) => (
        <div
          key={i}
          className="search-highlight"
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
          }}
        />
      ))}
    </>
  );
}
