document.addEventListener("DOMContentLoaded", () => {
  // Safety checks
  if (typeof Cropper === "undefined") {
    console.error("Cropper.js not loaded. Check CDN link.");
    alert("Cropper.js failed to load. Open console (F12) and check network errors.");
    return;
  }

  const input = document.getElementById("imageInput");
  const previewContainer = document.getElementById("previewContainer");
  const previewImage = document.getElementById("previewImage");
  const cropBtn = document.getElementById("cropBtn");
  const croppedInput = document.getElementById("croppedImageData");
  let cropper = null;
  let cropperReady = false;

  // Utility: convert dataURL to Blob (fallback for toBlob)
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(parts[1]);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  // Limit exported size to avoid huge canvases (adjust as needed)
  const MAX_EXPORT_WIDTH = 1600;
  const MAX_EXPORT_HEIGHT = 1200;

  input.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    previewContainer.style.display = "block";
    previewImage.src = URL.createObjectURL(file);
    cropperReady = false;

    previewImage.onload = () => {
      // ensure previous cropper destroyed
      if (cropper) {
        try { cropper.destroy(); } catch (err) { console.warn("Error destroying cropper:", err); }
        cropper = null;
      }

      try {
        cropper = new Cropper(previewImage, {
          aspectRatio: 8 / 3,      // change to your desired ratio
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 1,
          movable: true,
          zoomable: true,
          scalable: true,
          responsive: true,
          ready() {
            cropperReady = true;
            console.log("Cropper ready.");
          }
        });
      } catch (err) {
        console.error("Failed to initialize cropper:", err);
        alert("⚠️ Failed to initialize the crop tool. See console for details.");
      }
    };

    // debug: catch image load errors
    previewImage.onerror = (err) => {
      console.error("Preview image failed to load", err);
      alert("⚠️ Could not load image preview. Try a different file.");
    };
  });

  cropBtn.addEventListener("click", async () => {
    if (!cropper || !cropperReady) {
      alert("Please wait until the cropper loads, or choose an image first.");
      return;
    }

    try {
      // Determine export dimensions but cap them
      const cropData = cropper.getData(); // cropping box data (useful for debugging)
      console.log("cropData:", cropData);

      // Calculate width/height with max caps, keeping ratio
      const naturalCanvas = cropper.getCroppedCanvas(); // get original cropped canvas first
      if (!naturalCanvas) throw new Error("getCroppedCanvas() returned null");

      let exportWidth = naturalCanvas.width;
      let exportHeight = naturalCanvas.height;

      // scale down if too large
      const widthRatio = Math.min(1, MAX_EXPORT_WIDTH / exportWidth);
      const heightRatio = Math.min(1, MAX_EXPORT_HEIGHT / exportHeight);
      const scale = Math.min(widthRatio, heightRatio, 1);
      exportWidth = Math.round(exportWidth * scale);
      exportHeight = Math.round(exportHeight * scale);

      const canvas = cropper.getCroppedCanvas({ width: 768, height: 288 });
      if (!canvas) throw new Error("Failed to create export canvas");

      // Prefer toBlob; fallback to toDataURL -> blob
      const blob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else {
              console.warn("toBlob returned null — will fallback to toDataURL.");
              // fallback
              try {
                const dataURL = canvas.toDataURL("image/jpeg", 0.92);
                resolve(dataURLToBlob(dataURL));
              } catch (e2) {
                reject(e2);
              }
            }
          }, "image/jpeg", 0.92);
        } catch (err) {
          // toBlob sometimes throws on some browsers/ huge images — fallback
          console.warn("toBlob threw error, falling back to toDataURL:", err);
          try {
            const dataURL = canvas.toDataURL("image/jpeg", 0.92);
            resolve(dataURLToBlob(dataURL));
          } catch (e2) {
            reject(e2);
          }
        }
      });

      if (!blob) throw new Error("Blob creation failed");

      // Optional: create File and replace input.files so form upload uses cropped file
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      // show result preview immediately (inside same preview container)
      const resultURL = URL.createObjectURL(blob);
      const resultImg = document.createElement("img");
      resultImg.src = resultURL;
      resultImg.style.width = "100%";
      resultImg.className = "mt-3 rounded shadow";

      // replace crop UI with final preview
      const cardBody = previewContainer.querySelector(".card-body");
      if (cardBody) {
        // remove crop area and button (but keep new preview)
        cardBody.innerHTML = "";
        cardBody.appendChild(resultImg);
      } else {
        // fallback: append to container
        previewContainer.innerHTML = "";
        previewContainer.appendChild(resultImg);
      }

      // Optional: save base64 in hidden input (if server expects dataURL)
      try {
        croppedInput.value = await new Promise((res) => {
          canvas.toDataURL("image/jpeg", 0.92); // ensure canvas present
          res(canvas.toDataURL("image/jpeg", 0.92));
        });
      } catch (e) {
        console.warn("Failed to create base64 preview, skipping:", e);
      }

      // cleanup cropper
      try { cropper.destroy(); } catch (e) { /* ignore */ }
      cropper = null;
      cropperReady = false;

      alert("✅ Cropped and updated preview!");
    } catch (err) {
      console.error("Crop error:", err);
      // Useful debug to show to you, not to users in prod
      alert("⚠️ Something went wrong while cropping — open the console (F12) for details.");
    }
  });
});