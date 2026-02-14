let storyData = null;
let currentStory = null;
let currentSceneId = null;
let sceneHistory = [];
let isGoingBack = false;

const screenCover = document.getElementById("screen-cover");
const screenSelect = document.getElementById("screen-select");
const screenStory = document.getElementById("screen-story");

const btnStart = document.getElementById("btn-start");
const btnBackCover = document.getElementById("btn-back-cover");
const btnBackOne = document.getElementById("btn-back-one");

const coverImg = document.getElementById("cover-img");
const bgImg = document.getElementById("bg-img");
const sceneTitle = document.getElementById("scene-title");
const promptText = document.getElementById("prompt-text");
const choicesContainer = document.getElementById("choices");
const storyList = document.getElementById("story-list");
const player = document.getElementById("player");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function stopAudio() {
  player.pause();
  player.currentTime = 0;
  player.onended = null;
}

function loadStoryData() {
  return fetch("story.json")
    .then(res => res.json())
    .then(data => {
      storyData = data;
      coverImg.src = storyData.app.cover_image;
      generateStoryList();
    });
}

function generateStoryList() {
  storyList.innerHTML = "";

  storyData.stories.forEach(story => {
    const entry = document.createElement("div");
    entry.className = "story-entry";

    const img = document.createElement("img");
    img.className = "story-thumb";
    img.src = story.cover || "images/cover.jpg";

    const title = document.createElement("div");
    title.className = "story-title";
    title.textContent = story.title;

    entry.appendChild(img);
    entry.appendChild(title);

    entry.onclick = () => {
      currentStory = story;
      startStory();
    };

    storyList.appendChild(entry);
  });
}

function startStory() {
  stopAudio();
  sceneHistory = [];
  currentSceneId = currentStory.start_scene;
  loadScene(currentSceneId);
  showScreen(screenStory);
}

function loadScene(sceneId) {
  const scene = currentStory.scenes[sceneId];
  if (!scene) return;

  if (!isGoingBack && currentSceneId) {
    sceneHistory.push(currentSceneId);
  }

  isGoingBack = false;
  currentSceneId = sceneId;

  sceneTitle.textContent = scene.title || "";
  bgImg.src = scene.background || storyData.app.default_background;

  promptText.textContent = "";
  promptText.classList.remove("show");

  choicesContainer.innerHTML = "";
  choicesContainer.classList.remove("show");

  stopAudio();
  player.src = scene.narration || "";
  player.play();

  if (scene.type === "decision") {
    player.onended = () => {
      promptText.textContent = scene.prompt;
      promptText.classList.add("show");
      showChoices(scene);
    };
  }

  if (scene.type === "ending") {
    player.onended = () => {
      promptText.textContent = scene.ending_title;
      promptText.classList.add("show");
      showEnding(scene);
    };
  }
}

function showChoices(scene) {
  choicesContainer.innerHTML = "";

  const btnA = document.createElement("button");
  btnA.textContent = scene.choice_a.label;
  btnA.onclick = () => loadScene(scene.choice_a.next);

  const btnB = document.createElement("button");
  btnB.textContent = scene.choice_b.label;
  btnB.onclick = () => loadScene(scene.choice_b.next);

  choicesContainer.appendChild(btnA);
  choicesContainer.appendChild(btnB);

  choicesContainer.classList.add("show");
}

function showEnding(scene) {
  choicesContainer.innerHTML = "";

  const endText = document.createElement("p");
  endText.textContent = scene.ending_text;
  choicesContainer.appendChild(endText);

  const btnRestart = document.createElement("button");
  btnRestart.textContent = "Zurück zur Auswahl";
  btnRestart.onclick = () => {
    stopAudio();
    sceneHistory = [];
    showScreen(screenSelect);
  };
  choicesContainer.appendChild(btnRestart);

  choicesContainer.classList.add("show");
}

btnStart.addEventListener("click", () => {
  stopAudio();
  showScreen(screenSelect);
});

btnBackCover.addEventListener("click", () => {
  stopAudio();
  showScreen(screenCover);
});

btnBackOne.addEventListener("click", () => {
  stopAudio();

  if (sceneHistory.length > 0) {
    isGoingBack = true;
    const previous = sceneHistory.pop();
    loadScene(previous);
  } else {
    showScreen(screenSelect);
  }
});

loadStoryData();
