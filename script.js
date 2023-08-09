let image = document.getElementById("sourceImage");
image.style.display = "none";
let controls = document.getElementById("controls");
controls.style.display = "none";
let fileInput = document.getElementById("image-upload");
let urlBox = document.getElementById("image-url");
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let brightnessDOM = document.getElementById("brightnessSlider");
let contrastDOM = document.getElementById("contrastSlider");
let grayscaleDOM = document.getElementById("grayscaleSlider");
let saturateDOM = document.getElementById("saturationSlider");
let screenW;
let screenH;
let mouse = { x: 0, y: 0 };
let space = { x: 0, y: 0, w: 0, h: 0 };
let cropping = false;
let cropStartX = 0;
let cropStartY = 0;
let cropEndX = 0;
let cropEndY = 0;
let cropType;

window.onload = () => {
  getCanvasCordinates();
};

function getCanvasCordinates() {
  const element = document.getElementById("canvas");
  const info = element.getBoundingClientRect();
  space.x = info.left;
  space.y = info.top;
  const workSpace = document.getElementById("workspace");
  const scale = workSpace.getBoundingClientRect();
  space.w = scale.width;
  space.h = scale.height;
}

function uploadImage(event) {
  controls.style.display = "block";
  fileInput.style.display = "none";
  urlBox.style.display = "none";
  image.src = URL.createObjectURL(event.target.files[0]);
  image.onload = function () {
    if (this.width < space.w) {
      canvas.width = this.width;
      screenW = this.width;
      canvas.height = this.height;
      screenH = this.height;
    } else {
      canvas.width = space.w - 50;
      this.width = canvas.width;
      screenW = this.width;
      canvas.height = space.h - 50;
      this.height = canvas.height;
      screenH = this.height;
    }
    canvas.crossOrigin = "anonymous";

    cropStartX = 0;
    cropStartY = 0;
    cropEndX = this.width;
    cropEndY = this.height;

    context.drawImage(image, 0, 0);
  };
}

function applyFilter() {
  console.log("inside applyfilter");
  let filterString =
    "brightness(" +
    brightnessDOM.value +
    "%" +
    ") contrast(" +
    contrastDOM.value +
    "%" +
    ") grayscale(" +
    grayscaleDOM.value +
    "%" +
    ") saturate(" +
    saturateDOM.value +
    "%" +
    ")";
  context.filter = filterString;
  let cropWidth = Math.abs(cropEndX - cropStartX);
  let cropHeight = Math.abs(cropEndY - cropStartY);
  context.drawImage(
    image,
    cropStartX,
    cropStartY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
  context.endPath();
}

function resetImage() {
  brightnessDOM.value = 100;
  contrastDOM.value = 100;
  grayscaleDOM.value = 0;
  saturateDOM.value = 100;
  let filterString =
    "brightness(" +
    brightnessDOM.value +
    "%" +
    ") contrast(" +
    contrastDOM.value +
    "%" +
    ") grayscale(" +
    grayscaleDOM.value +
    "%" +
    ") saturate(" +
    saturateDOM.value +
    "%" +
    ") ";
  context.filter = filterString;
  canvas.width = screenW;
  canvas.height = screenH;
  context.drawImage(image, 0, 0);
}

function drawExcludedPortion() {
  const element = document.getElementById("canvas");
  const doubleClickHandler = (e) => {
    console.log("detected click");
    if (cropType === "firstClick") {
      cropStartX = mouse.x;
      cropStartY = mouse.y;
      cropType = "secondClick";
    } else if (cropType === "secondClick") {
      cropEndX = mouse.x;
      cropEndY = mouse.y;
      cropType = "";
      element.removeEventListener("mousemove", mouseMoveHandler);
      element.removeEventListener("click", doubleClickHandler);
      showCroppedImage();
    }
  };

  const mouseMoveHandler = (e) => {
    mouse.x = e.x - space.x;
    mouse.y = e.y - space.y;
    context.clearRect(0, 0, screenW, screenH);
    context.fillStyle = "rgba(157, 255, 142, 0.5)";
    context.drawImage(image, 0, 0);
    if (cropType === "firstClick") {
      context.fillRect(0, 0, mouse.x, screenH);
      context.fillRect(0, 0, screenW, mouse.y);
    }
    if (cropType === "secondClick") {
      context.fillRect(0, 0, cropStartX, screenH);
      context.fillRect(0, 0, screenW, cropStartY);
      context.fillRect(mouse.x, 0, screenW - mouse.x, screenH);
      context.fillRect(0, mouse.y, screenW, screenH - mouse.y);
    }
  };

  element.addEventListener("click", doubleClickHandler);
  element.addEventListener("mousemove", mouseMoveHandler);
}

function showCroppedImage() {
  let cropWidth = Math.abs(cropEndX - cropStartX);
  let cropHeight = Math.abs(cropEndY - cropStartY);
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  context.drawImage(
    image,
    cropStartX,
    cropStartY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
}

function cropImage() {
  getCanvasCordinates();
  cropType = "firstClick";
  drawExcludedPortion();
}

function saveImage() {
  let linkElement = document.getElementById("link");
  linkElement.setAttribute("download", "proeditor_image.png");
  let canvasData = canvas.toDataURL("image/png");
  canvasData.replace("image/png", "image/octet-stream");
  linkElement.setAttribute("href", canvasData);
  linkElement.click();
}
