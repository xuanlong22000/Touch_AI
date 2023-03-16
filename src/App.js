import { useEffect, useRef } from "react";
import * as mobilenetModule from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import "@tensorflow/tfjs-backend-cpu";
import "./App.css";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NOT_TOUCH = "not_touch";
const TOUCHED = "touched";
const TRAINING_TIME = 40;

function App() {
  const video = useRef();
  const classifier = useRef();
  const mobilenet = useRef();

  useEffect(() => {
    init();

    return () => {};
  }, []);

  const init = async () => {
    console.log("init...");
    await setupCamera();
    console.log("OK camera");

    classifier.current = knnClassifier.create();
    mobilenet.current = await mobilenetModule.load();

    console.log("OK all");
  };

  const setupCamera = () => {
    return new Promise((res, rej) => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },
          (stream) => {
            video.current.srcObject = stream;
            video.current.addEventListener("loadeddata", res);
          },
          (error) => rej(error)
        );
      } else {
        rej();
      }
    });
  };

  const train = async (label) => {
    for (let i = 0; i < TRAINING_TIME; i++) {
      console.log(`${parseInt(((i + 1) / TRAINING_TIME) * 100)} %`);
      await training(label);
    }
  };

  const training = (label) => {
    return new Promise(async (res) => {
      const embedding = mobilenet.current.infer(video.current, true);
      classifier.current.addExample(embedding, label);
      // await sleep(100);
      res();
    });
  };

  const run = async () => {
    const embedding = mobilenet.current.infer(video.current, true);
    const result = await classifier.current.predictClass(embedding);
    console.log(result.label);
    console.log(result.confidences);

    run();
  };

  // const sleep = (ms) => {
  //   return new Promise((res) =>
  //     setTimeout(() => {
  //       res();
  //     }, ms)
  //   );
  // };

  return (
    <div className="App">
      <video className="video" autoPlay ref={video} />
      <div>
        <button
          className="btn"
          onClick={() => {
            train(NOT_TOUCH);
          }}
        >
          Train 1
        </button>
        <button
          className="btn"
          onClick={() => {
            train(TOUCHED);
          }}
        >
          Train 2
        </button>
        <button className="btn" onClick={run}>
          Run
        </button>
      </div>
      {/* <ToastContainer /> */}
    </div>
  );
}

export default App;
