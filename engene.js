class AREngine {

  constructor() {
    this.sceneEl = document.querySelector("#scene");
    this.assetsEl = document.querySelector("#assets");
    this.currentScene = null;
  }

  async loadScene(sceneName) {
    const res = await fetch(`./scenes/${sceneName}.json`);
    const data = await res.json();

    this.clearScene();
    this.currentScene = data;

    this.buildAssets(data);
    this.buildTargets(data);
  }

  clearScene() {
    document.querySelectorAll("[mindar-image-target]").forEach(el => el.remove());
    this.assetsEl.innerHTML = "";
  }

  buildAssets(data) {
    data.assets.forEach(asset => {

      let el;

      if (asset.type === "model") {
        el = document.createElement("a-asset-item");
        el.setAttribute("id", asset.id);
        el.setAttribute("src", asset.src);
      }

      if (asset.type === "video") {
        el = document.createElement("video");
        el.setAttribute("id", asset.id);
        el.setAttribute("src", asset.src);
        el.setAttribute("loop", true);
      }

      if (asset.type === "image") {
        el = document.createElement("img");
        el.setAttribute("id", asset.id);
        el.setAttribute("src", asset.src);
      }

      if (asset.type === "audio") {
        el = document.createElement("audio");
        el.setAttribute("id", asset.id);
        el.setAttribute("src", asset.src);
      }

      this.assetsEl.appendChild(el);
    });
  }

  buildTargets(data) {
    data.targets.forEach(target => {

      const targetEl = document.createElement("a-entity");
      targetEl.setAttribute("mindar-image-target", `targetIndex: ${target.index}`);

      target.elements.forEach(el => {
        const element = this.createElement(el);
        targetEl.appendChild(element);
      });

      this.sceneEl.appendChild(targetEl);

      this.bindTargetEvents(targetEl, target);
    });
  }

  createElement(data) {

    let el;

    switch(data.type) {

      case "model":
        el = document.createElement("a-gltf-model");
        el.setAttribute("src", `#${data.asset}`);
        el.setAttribute("animation-mixer", "");
        break;

      case "video":
        el = document.createElement("a-video");
        el.setAttribute("src", `#${data.asset}`);
        break;

      case "image":
        el = document.createElement("a-image");
        el.setAttribute("src", `#${data.asset}`);
        break;

      case "audio":
        el = document.createElement("a-sound");
        el.setAttribute("src", `#${data.asset}`);
        break;

      case "button":
        el = document.createElement("a-plane");
        el.setAttribute("color", "red");
        el.classList.add("clickable");

        el.addEventListener("click", () => {
          if (data.action === "url") {
            window.open(data.value);
          }
          if (data.action === "scene") {
            this.loadScene(data.value);
          }
        });
        break;

    }

    if (data.position) el.setAttribute("position", data.position);
    if (data.scale) el.setAttribute("scale", data.scale);
    if (data.rotation) el.setAttribute("rotation", data.rotation);

    return el;
  }

  bindTargetEvents(targetEl, targetData) {

    targetEl.addEventListener("targetFound", () => {
      targetData.elements.forEach(el => {
        if (el.type === "video") document.querySelector(`#${el.asset}`).play();
        if (el.type === "audio") document.querySelector(`#${el.asset}`).play();
      });
    });

    targetEl.addEventListener("targetLost", () => {
      targetData.elements.forEach(el => {
        if (el.type === "video") document.querySelector(`#${el.asset}`).pause();
        if (el.type === "audio") document.querySelector(`#${el.asset}`).pause();
      });
    });
  }

}
