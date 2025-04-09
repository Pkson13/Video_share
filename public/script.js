// const local = document.querySelector(".local");
document.addEventListener("DOMContentLoaded", () => {
  const modelclose = document.querySelector(".cross");
  const modal = document.querySelector(".container");
  const local = document.querySelector(".local");

  modelclose.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.classList.add("hide");
    const getusermedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return stream;
    };

    getusermedia().then((stream) => {
      const video = document.createElement("video");
      video.setAttribute("controls", "");
      local.append(video);
      video.srcObject = stream; // note: srcObject, not srcobject
      video.play(); // optional: start playing the video
    });
  });
  modal.classList.forEach((value) => {
    console.log(value);
  });
});
