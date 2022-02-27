import { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";

function App() {
  const videoRef = useRef(null);
  const [ocr, setOcr] = useState("Recognizing...");

  const doOCR = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    videoRef.current.addEventListener("playing", async () => {
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.width;
      canvas.height = videoRef.current.height;

      // get image from the video
      document.addEventListener("keypress", async (e) => {
        if (e.code !== "Space") return;
        canvas
          .getContext("2d")
          .drawImage(
            videoRef.current,
            0,
            0,
            videoRef.current.width,
            videoRef.current.height
          );

        // recognize text from the image
        const {
          data: { text },
        } = await worker.recognize(canvas);

        setOcr(text);

        speechSynthesis.speak(
          new SpeechSynthesisUtterance(text.replace(/\s/g, " "))
        );
      });
    });
  };

  useEffect(() => {
    doOCR();
  }, [ocr]);
  return (
    <>
      <video muted autoPlay height="560" width="720" ref={videoRef} />
      <pre
        style={{
          fontSize: "2rem",
          fontFamily: "inherit",
          width: "100%",
          whiteSpace: "pre-wrap",
        }}
      >
        {ocr}
      </pre>
    </>
  );
}

export default App;
