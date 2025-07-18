import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const WIDTH = 400;
const HEIGHT = 350;
const BRIGHTNESS_MIN = 70;
const MAX_FAILS = 5;
const LOCK_TIME = 60 * 1000;
const STABLE_FRAME = 30;

const AttendanceFaceScan = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [staffCode, setStaffCode] = useState("");
  const [message, setMessage] = useState("Enter staff code then click Turn on camera to start");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const [stableCount, setStableCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(0);

  useEffect(() => {
    if (!locked) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLocked(false);
        setMessage("You can try again.");
        setFailCount(0);
      } else {
        const left = Math.ceil((lockUntil - Date.now()) / 1000);
        setMessage(`You have tried too many times. Wait ${left}s to try again.`);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [locked, lockUntil]);

  const getBrightness = (ctx, x, y, w, h) => {
    try {
      const data = ctx.getImageData(x + w / 4, y + h / 4, w / 2, h / 2).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      return sum / (data.length / 4);
    } catch {
      return 255;
    }
  };

  const detectMaskOrGlasses = () => ({ mask: false, glasses: false });

  const drawBox = (ctx, x, y, w, h, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  };

  const captureMultipleFrames = async (numFrames = 10, delay = 150) => {
    const frames = [];
    if (!canvasRef.current || !videoRef.current) return frames;
    const ctx = canvasRef.current.getContext("2d");
    for (let i = 0; i < numFrames; i++) {
      ctx.drawImage(videoRef.current, 0, 0, WIDTH, HEIGHT);
      const blob = await new Promise(res => canvasRef.current.toBlob(res, "image/jpeg", 0.8));
      frames.push(blob);
      await new Promise(res => setTimeout(res, delay));
    }
    return frames;
  };

  const onResults = (results) => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(videoRef.current, 0, 0, WIDTH, HEIGHT);

    const boxX = 60, boxY = 30, boxW = 280, boxH = 280;

    if (result && result.status === "ON_TIME") {
      drawBox(ctx, boxX, boxY, boxW, boxH, "#22c55e");
      return;
    }

    if (!results.detections || results.detections.length === 0) {
      setMessage("No face detected. Place your face in the frame.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#e11d48");
      isProcessingRef.current = false;
      return;
    }

    let mainFace = results.detections.reduce((maxDet, det) =>
      det.score[0] > maxDet.score[0] ? det : maxDet
    );
    const bbox = mainFace.boundingBox;
    if (!bbox) {
      setMessage("Could not detect face region.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#e11d48");
      isProcessingRef.current = false;
      return;
    }
    const x = bbox.xMin * WIDTH, y = bbox.yMin * HEIGHT;
    const w = bbox.width * WIDTH, h = bbox.height * HEIGHT;

    if (
      x < boxX + 10 ||
      y < boxY + 10 ||
      x + w > boxX + boxW - 10 ||
      y + h > boxY + boxH - 10
    ) {
      setMessage("Place your face in the center of the frame.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#facc15");
      isProcessingRef.current = false;
      return;
    }

    const brightness = getBrightness(ctx, x, y, w, h);
    if (brightness < BRIGHTNESS_MIN) {
      setMessage("Not enough light, please move to a brighter location.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#e11d48");
      isProcessingRef.current = false;
      return;
    }

    const { mask, glasses } = detectMaskOrGlasses();
    if (mask) {
      setMessage("Please remove your mask to continue.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#e11d48");
      isProcessingRef.current = false;
      return;
    }
    if (glasses) {
      setMessage("Please remove thick glasses to continue.");
      setStableCount(0);
      drawBox(ctx, boxX, boxY, boxW, boxH, "#e11d48");
      isProcessingRef.current = false;
      return;
    }

    setStableCount((prev) => {
      const next = prev + 1;
      if (next >= STABLE_FRAME) {
        drawBox(ctx, boxX, boxY, boxW, boxH, "#22c55e");
        setMessage("Hold your face still for 3s to confirm...");
        if (!isProcessingRef.current && !loading && !locked) {
          isProcessingRef.current = true;
          setTimeout(async () => {
            if (!loading && !locked) {
              await captureAndSend();
            }
          }, 200);
        }
      } else {
        drawBox(ctx, boxX, boxY, boxW, boxH, "#22d3ee");
        setMessage(`Valid face! Checking stability (${Math.round(next / 10)}s/3s)...`);
      }
      return next >= STABLE_FRAME ? STABLE_FRAME : next;
    });
  };

  // Sửa phần này: Luôn show message trả về từ BE (dù liveness=false, matched=false hay message custom)
  const captureAndSend = async () => {
    setLoading(true);
    setMessage("Capturing and sending frames to server...");
    try {
      const frames = await captureMultipleFrames(10, 120);
      const formData = new FormData();
      frames.forEach((blob, idx) => formData.append("frames", blob, `frame${idx}.jpg`));
      formData.append("staffCode", staffCode.trim());

      const token = localStorage.getItem("token");

      const resp = await axios.post(
        "http://localhost:8080/api/attendance/face-scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(resp.data);

      // Ưu tiên message từ BE (liveness/message/matched)
      if (resp.data && resp.data.message) {
        setMessage(resp.data.message);
      } else if (resp.data.liveness === false) {
        setMessage("Liveness check failed. Please move your head or try again.");
      } else if (resp.data.matched === false) {
        setMessage("Face not matched!");
      } else if (resp.data.status === "ON_TIME") {
        setMessage("Attendance successful!");
      } else {
        setMessage("Attendance submission result.");
      }

      setFailCount(0);
      stopCamera();
      setStableCount(0);
      setFailCount(0);
    } catch (err) {
      setMessage("Error! " + (err?.response?.data?.message || err.message || "Attendance submission failed!"));
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const startCamera = () => {
    if (!staffCode || staffCode.trim() === "") {
      setMessage("Please enter staff code before turning on the camera.");
      return;
    }
    setResult(null);
    setMessage("Starting camera...");
    isProcessingRef.current = false;
    setLoading(false);
    setScanning(true);
    setStableCount(0);

    if (!window.FaceDetection || !window.Camera) {
      setMessage("Browser does not support face detection.");
      return;
    }

    const faceDetection = new window.FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults(onResults);

    if (videoRef.current) {
      videoRef.current.style.display = "block";
      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await faceDetection.send({ image: videoRef.current });
        },
        width: WIDTH,
        height: HEIGHT,
      });
      cameraRef.current.start();
    }
  };

  const stopCamera = () => {
    setScanning(false);
    setLoading(false);
    isProcessingRef.current = false;
    setStableCount(0);
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.style.display = "none";
    }
  };

  const resetAll = () => {
    setResult(null);
    setLoading(false);
    setStableCount(0);
    setFailCount(0);
    isProcessingRef.current = false;
    setMessage("Enter staff code then click Turn on camera to start");
  };

  // --- UI không đổi ---
  const buttonStyle = {
    padding: "10px 24px",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
    margin: "16px 0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#4f46e5",
    color: "white",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e11d48",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#f3f4f6",
    color: "#111827",
    border: "1px solid #d1d5db"
  };

  return (
    <div style={{ maxWidth: 500, margin: "30px auto" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{
          textAlign: "center",
          marginBottom: 24,
          color: "#111827",
          fontSize: "1.75rem",
          fontWeight: "600"
        }}>
          Face Scan Attendance
        </h2>

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="staffCodeInput"
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
              color: "#374151"
            }}
          >
            Staff Code:
          </label>
          <input
            id="staffCodeInput"
            type="text"
            value={staffCode}
            onChange={(e) => setStaffCode(e.target.value)}
            style={{
              width: "100%",
              fontSize: 16,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            placeholder="Enter staff code"
            disabled={scanning || locked}
          />
        </div>

        <div style={{
          textAlign: "center",
          position: "relative"
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            width={WIDTH}
            height={HEIGHT}
            style={{
              borderRadius: 12,
              border: "3px solid #4f46e5",
              background: "#111827",
              display: scanning ? "block" : "none",
              margin: "0 auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          />
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
          />

          <div style={{ marginTop: 20 }}>
            {!scanning && !result && (
              <button
                onClick={startCamera}
                style={{
                  ...primaryButtonStyle,
                  opacity: (!staffCode.trim() || locked) ? 0.6 : 1
                }}
                disabled={!staffCode.trim() || locked}
              >
                Turn on camera
              </button>
            )}

            {scanning && (
              <button
                onClick={stopCamera}
                style={{
                  ...dangerButtonStyle,
                  opacity: loading ? 0.6 : 1
                }}
                disabled={loading}
              >
                Stop camera
              </button>
            )}

            {result && (
              <button
                onClick={resetAll}
                style={secondaryButtonStyle}
              >
                Scan again
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            minHeight: 34,
            margin: "16px 0",
            padding: "8px 12px",
            color: loading ? "#4f46e5" : "#e11d48",
            textAlign: "center",
            fontWeight: "500",
            borderRadius: 8,
            backgroundColor: message && message.length > 0 ? "#f9fafb" : "transparent"
          }}
        >
          {result && result.status === "ON_TIME"
            ? ""
            : message}
        </div>

        {result && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: 20,
              marginTop: 20,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <h3 style={{
              marginTop: 0,
              marginBottom: 16,
              color: "#111827",
              fontSize: "1.25rem"
            }}>
              Result
            </h3>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt="avatar"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #4f46e5",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                />
              )}

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Full name:</strong>
                  <span>{result.staffName || "N/A"}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Staff Code:</strong>
                  <span>{result.staffCode || "N/A"}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Position:</strong>
                  <span>{result.position || "N/A"}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Work Location:</strong>
                  <span>{result.workLocation || "N/A"}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Status:</strong>
                  <span style={{
                    color: result.status === "ON_TIME" ? "#16a34a" : "#e11d48",
                    fontWeight: "500"
                  }}>
                    {result.status || "N/A"}
                  </span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Check-in time:</strong>
                  <span>{result.timestamp ? new Date(result.timestamp).toLocaleString() : ""}</span>
                </div>
                {result.checkOut && (
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Check-out time:</strong>
                    <span>{new Date(result.checkOut).toLocaleTimeString()}</span>
                  </div>
                )}
                <div style={{ marginBottom: 0 }}>
                  <strong style={{ color: "#4b5563", display: "inline-block", width: 130 }}>Note:</strong>
                  <span>{result.message}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        marginTop: 24,
        color: "#6b7280",
        fontSize: 14,
        padding: "12px 16px",
        background: "#f9fafb",
        borderRadius: 8,
        border: "1px solid #e5e7eb"
      }}>
        <strong>Note:</strong> Ensure your face is within the frame, with sufficient light, and
        without masks or thick glasses. The app will automatically capture when conditions are
        valid. If face recognition fails more than 5 times, your account will be locked for 1 minute
        for protection.
      </div>
    </div>
  );
};

export default AttendanceFaceScan;
